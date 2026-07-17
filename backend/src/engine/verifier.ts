/**
 * VEHICLE-SIDE VERIFIER — the core of the project.
 *
 * This module represents firmware running ON THE VEHICLE. The backend relays
 * commands to it but has NO authority over the outcome: the vehicle verifies
 * the financier's signature against its own trust store (public keys
 * provisioned at "factory" time), and only it decides whether to execute.
 * Nothing in this module trusts anything the backend says beyond the raw
 * command bytes it relays. Do not simplify this away — it is the thesis of
 * the whole project (PROJECT_BRIEF.md).
 *
 * Verification order (ARCHITECTURE.md — DO NOT REORDER):
 *   1. signature  2. expiry  3. replay  4. prior-command chain  5. motion
 */
import { canonicalizeCommand, commandHash } from "../crypto/canonical.js";
import { secureElement, verifySignature } from "../crypto/secureElement.js";
import { auditLog } from "../audit/auditLog.js";
import { setStatus, upsertRecord, vehicles } from "../models/store.js";
import type { Command, VerificationResult } from "../models/types.js";

const GENESIS = "GENESIS";

class VehicleVerifier {
  /** Trust store: issuer public keys the vehicle was provisioned with. */
  private trustedIssuerKeys = new Map<string, string>(); // issuerId -> public key PEM
  /** Replay protection: every commandId/nonce this vehicle fleet has ever seen. */
  private seenCommandIds = new Set<string>();
  private seenNonces = new Set<string>();
  /** Per-vehicle chain head: hash of the last EXECUTED command. */
  private lastExecutedHash = new Map<string, string>();

  /** Factory provisioning: bake an issuer's public key into the trust store. */
  trustIssuer(issuerId: string, publicKeyPem: string): void {
    this.trustedIssuerKeys.set(issuerId, publicKeyPem);
  }

  /** What the NEXT command for this vehicle must cite as priorCommandHash. */
  chainHeadFor(vehicleId: string): string {
    return this.lastExecutedHash.get(vehicleId) ?? GENESIS;
  }

  /**
   * Process a command exactly as vehicle firmware would.
   * Logs every outcome to the audit chain and updates the command record.
   */
  process(cmd: Command): VerificationResult {
    const vehicle = vehicles.get(cmd.vehicleId);
    if (!vehicle) {
      return this.reject(cmd, "CHAIN", `Unknown vehicle '${cmd.vehicleId}'`);
    }

    // ── Check 1: SIGNATURE ────────────────────────────────────────────────
    const issuerKey = this.trustedIssuerKeys.get(cmd.issuerId);
    const payload = canonicalizeCommand(cmd);
    if (!issuerKey || !verifySignature(issuerKey, payload, cmd.signature)) {
      return this.reject(
        cmd,
        "SIGNATURE",
        `Signature verification FAILED for issuer '${cmd.issuerId}' — command not authentic, refused before any other check`
      );
    }

    // ── Check 2: EXPIRY ───────────────────────────────────────────────────
    if (new Date(cmd.expiresAt).getTime() <= Date.now()) {
      return this.reject(
        cmd,
        "EXPIRY",
        `Command expired at ${cmd.expiresAt} — stale commands are never executed`
      );
    }

    // ── Check 3: REPLAY ───────────────────────────────────────────────────
    if (this.seenCommandIds.has(cmd.commandId) || this.seenNonces.has(cmd.nonce)) {
      return this.reject(
        cmd,
        "REPLAY",
        `commandId/nonce already seen — replayed command refused`
      );
    }

    // ── Check 4: PRIOR-COMMAND CHAIN ──────────────────────────────────────
    const expectedPrior = this.chainHeadFor(cmd.vehicleId);
    if (cmd.priorCommandHash !== expectedPrior) {
      return this.reject(
        cmd,
        "CHAIN",
        `priorCommandHash mismatch (expected ${expectedPrior.slice(0, 12)}…) — command not anchored to this vehicle's history`
      );
    }

    // Command is authentic and fresh — mark nonce/id as consumed from here on.
    this.seenCommandIds.add(cmd.commandId);
    this.seenNonces.add(cmd.nonce);

    // Policy: one pending command per vehicle. A verified command can't pile
    // onto an already-held one; the financier must wait or cancel.
    if (vehicle.pendingCommand && vehicle.pendingCommand.commandId !== cmd.commandId) {
      return this.reject(
        cmd,
        "PENDING_SLOT",
        `Vehicle already has a pending command (${vehicle.pendingCommand.commandId.slice(0, 8)}…) — refused`
      );
    }

    // ── Check 5: MOTION INTERLOCK (only reached with a fully valid command) ─
    if (vehicle.isMoving) {
      vehicle.pendingCommand = cmd;
      const detail = `Vehicle ${cmd.vehicleId} is MOVING — valid ${cmd.action} held; will execute when vehicle stops (or expire at ${cmd.expiresAt})`;
      auditLog.append(cmd.commandId, "HELD", detail);
      setStatus(cmd.commandId, "HELD", detail);
      return { outcome: "HELD", failedCheck: null, detail };
    }

    return this.execute(cmd, vehicle.vehicleId);
  }

  /**
   * Re-evaluate a vehicle's held command (called by the simulator when motion
   * stops, and by the expiry sweep). Runs expiry again — a command may have
   * gone stale while held.
   */
  recheckPending(vehicleId: string): VerificationResult | null {
    const vehicle = vehicles.get(vehicleId);
    if (!vehicle?.pendingCommand) return null;
    const cmd = vehicle.pendingCommand;

    if (new Date(cmd.expiresAt).getTime() <= Date.now()) {
      vehicle.pendingCommand = null;
      const detail = `Held command expired at ${cmd.expiresAt} before vehicle stopped — dropped, never executed`;
      auditLog.append(cmd.commandId, "REJECTED", detail);
      setStatus(cmd.commandId, "EXPIRED", detail);
      return { outcome: "REJECTED", failedCheck: "EXPIRY", detail };
    }

    if (!vehicle.isMoving) {
      return this.execute(cmd, vehicleId);
    }
    return null; // still moving, still valid — keep holding
  }

  // ── internals ─────────────────────────────────────────────────────────────

  private execute(cmd: Command, vehicleId: string): VerificationResult {
    const vehicle = vehicles.get(vehicleId)!;
    vehicle.pendingCommand = null;

    if (cmd.action === "IMMOBILIZE") {
      vehicle.immobilized = true;
    } else {
      // CANCEL restores the vehicle (used to reset between demo runs, and as
      // the legitimate "loan settled" flow).
      vehicle.immobilized = false;
    }
    this.lastExecutedHash.set(vehicleId, commandHash(cmd));

    const detail = `${cmd.action} executed on ${vehicleId} (stationary, all 5 checks passed) — reason: ${cmd.reasonCode}`;
    auditLog.append(cmd.commandId, "EXECUTED", detail);

    // Vehicle signs an acknowledgement with ITS OWN key (simulated Secure
    // Element) — proof-of-execution the financier can independently verify.
    const ackPayload = `ACK|${cmd.commandId}|${vehicleId}|${cmd.action}|${new Date().toISOString()}`;
    const ackSignature = secureElement.sign(`vehicle:${vehicleId}`, ackPayload);
    auditLog.append(
      cmd.commandId,
      "ACKNOWLEDGED",
      `Vehicle ${vehicleId} signed acknowledgement (Secure Element — simulated): ${ackSignature.slice(0, 24)}…`
    );

    setStatus(cmd.commandId, "EXECUTED", detail);
    upsertRecord(cmd.commandId, { vehicleAckSignature: ackSignature });
    return { outcome: "EXECUTED", failedCheck: null, detail };
  }

  private reject(
    cmd: Command,
    failedCheck: NonNullable<VerificationResult["failedCheck"]>,
    detail: string
  ): VerificationResult {
    auditLog.append(cmd.commandId, "REJECTED", `[${failedCheck}] ${detail}`);
    // A rejected command may not have a record yet (e.g. crafted attack demo) —
    // only update if we tracked it.
    try {
      setStatus(cmd.commandId, "REJECTED", `[${failedCheck}] ${detail}`);
    } catch {
      /* untracked command (raw attack payload) — audit log still has it */
    }
    return { outcome: "REJECTED", failedCheck, detail };
  }
}

/** Singleton verifier (stands in for per-vehicle firmware in this simulation). */
export const vehicleVerifier = new VehicleVerifier();
