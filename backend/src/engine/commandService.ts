/**
 * Command issuance + dispatch (the financier→backend→vehicle pipeline).
 *
 * The backend's role here is deliberately limited: it assembles the command,
 * asks the simulated Secure Element to sign it UNDER THE FINANCIER'S IDENTITY,
 * logs everything, and relays it to the vehicle. It cannot execute anything —
 * the vehicle-side verifier (engine/verifier.ts) is the only authority.
 *
 * Also home to the demo "attack" helpers (tampered / expired / replayed
 * commands) used to prove the rejection paths live in front of judges.
 */
import { randomBytes, randomUUID } from "node:crypto";
import { canonicalizeCommand } from "../crypto/canonical.js";
import { secureElement } from "../crypto/secureElement.js";
import { auditLog } from "../audit/auditLog.js";
import { vehicleVerifier } from "./verifier.js";
import { commandRecords, ISSUERS, vehicles, pendingMultiSigCommands, multiSigPolicy } from "../models/store.js";
import type {
  Command,
  CommandAction,
  CommandRecord,
  PendingMultiSigEntry,
  ReasonCode,
  VerificationResult,
} from "../models/types.js";

export const DEFAULT_EXPIRY_MS = 5 * 60 * 1000; // 5 minutes (ARCHITECTURE.md)

export interface IssueParams {
  vehicleId: string;
  action: CommandAction;
  reasonCode: ReasonCode;
  reasonText: string;
  issuerId: string;
  /** override for seed data / expiry demo — defaults to 5 min */
  expiryMs?: number;
}

/** Build + sign a well-formed command (signature covers all other fields). */
export function buildSignedCommand(p: IssueParams): Command {
  const issuedAt = new Date();
  const unsigned: Omit<Command, "signature"> = {
    commandId: randomUUID(),
    vehicleId: p.vehicleId,
    action: p.action,
    reasonCode: p.reasonCode,
    reasonText: p.reasonText,
    issuerId: p.issuerId,
    issuedAt: issuedAt.toISOString(),
    expiresAt: new Date(issuedAt.getTime() + (p.expiryMs ?? DEFAULT_EXPIRY_MS)).toISOString(),
    nonce: randomBytes(16).toString("hex"),
    priorCommandHash: vehicleVerifier.chainHeadFor(p.vehicleId),
  };
  const signature = secureElement.sign(p.issuerId, canonicalizeCommand(unsigned));
  return { ...unsigned, signature };
}

/** Track a command in the record store (status starts PENDING). */
function trackCommand(cmd: Command): CommandRecord {
  const record: CommandRecord = {
    command: cmd,
    status: "PENDING",
    statusDetail: "Dispatched to vehicle, awaiting verification",
    disputed: false,
    disputeText: null,
    vehicleAckSignature: null,
    updatedAt: new Date().toISOString(),
  };
  commandRecords.set(cmd.commandId, record);
  return record;
}

/** The normal, legitimate flow: request → sign → dispatch → vehicle decides. */
export function issueAndDispatch(p: IssueParams): {
  command: Command;
  result: VerificationResult;
} {
  if (!vehicles.has(p.vehicleId)) throw new Error(`Unknown vehicle '${p.vehicleId}'`);
  if (!ISSUERS[p.issuerId]) throw new Error(`Unknown issuer '${p.issuerId}'`);

  const command = buildSignedCommand(p);
  trackCommand(command);
  auditLog.append(
    command.commandId,
    "REQUESTED",
    `${ISSUERS[p.issuerId].label} requested ${command.action} on ${p.vehicleId} — reason: ${p.reasonCode} ("${p.reasonText}")`
  );
  auditLog.append(
    command.commandId,
    "DISPATCHED",
    `Backend relayed signed command to vehicle ${p.vehicleId} (backend holds no execute authority)`
  );

  const result = vehicleVerifier.process(command);
  return { command, result };
}

// ─── Demo attack helpers (scenarios 3–5 in PROJECT_BRIEF definition of done) ──

/**
 * TAMPERED-COMMAND DEMO: sign a legitimate command, then mutate a field after
 * signing (what a compromised backend or MITM would do). Vehicle must reject
 * at check 1 (signature).
 */
export function dispatchTamperedCommand(vehicleId: string, issuerId: string): {
  command: Command;
  result: VerificationResult;
} {
  const command = buildSignedCommand({
    vehicleId,
    action: "IMMOBILIZE",
    reasonCode: "loan_default",
    reasonText: "ATTACK DEMO: field mutated after signing",
    issuerId,
  });
  // The attack: change the reason after the signature was produced.
  command.reasonText = "TAMPERED: attacker rewrote this field in transit";
  trackCommand(command);
  auditLog.append(
    command.commandId,
    "DISPATCHED",
    `⚠ Attack demo: command relayed with a field modified AFTER signing`
  );
  return { command, result: vehicleVerifier.process(command) };
}

/**
 * EXPIRED-COMMAND DEMO: a validly signed command whose window already lapsed
 * (signature is genuine — only staleness is wrong). Vehicle must reject at
 * check 2 (expiry), proving checks run in order.
 */
export function dispatchExpiredCommand(vehicleId: string, issuerId: string): {
  command: Command;
  result: VerificationResult;
} {
  const command = buildSignedCommand({
    vehicleId,
    action: "IMMOBILIZE",
    reasonCode: "loan_default",
    reasonText: "ATTACK DEMO: stale command replayed after its window",
    issuerId,
    expiryMs: -60_000, // expired one minute ago — signed as such, signature is VALID
  });
  trackCommand(command);
  auditLog.append(
    command.commandId,
    "DISPATCHED",
    `⚠ Attack demo: validly-signed but expired command relayed to ${vehicleId}`
  );
  return { command, result: vehicleVerifier.process(command) };
}

/**
 * REPLAY DEMO: re-dispatch the most recent command this vehicle already saw,
 * byte-for-byte (valid signature, within expiry if re-sent quickly). Vehicle
 * must reject at check 3 (replay) via the consumed nonce/commandId.
 */
export function replayLastCommand(vehicleId: string): {
  command: Command;
  result: VerificationResult;
} | null {
  const last = [...commandRecords.values()]
    .filter((r) => r.command.vehicleId === vehicleId)
    .sort((a, b) => b.command.issuedAt.localeCompare(a.command.issuedAt))[0];
  if (!last) return null;
  const command = last.command;
  auditLog.append(
    command.commandId,
    "DISPATCHED",
    `⚠ Attack demo: previously-seen command REPLAYED verbatim to ${vehicleId}`
  );
  return { command, result: vehicleVerifier.process(command) };
}

// ─── Multi-Signature Governance ────────────────────────────────────────────────

/**
 * INITIATE MULTI-SIG: Record the financier's authorized intent. No signatures
 * are computed yet — both are produced atomically at co-sign time.
 */
export function initiateMultiSig(p: IssueParams): PendingMultiSigEntry {
  if (!vehicles.has(p.vehicleId)) throw new Error(`Unknown vehicle '${p.vehicleId}'`);
  if (!ISSUERS[p.issuerId]) throw new Error(`Unknown issuer '${p.issuerId}'`);

  const issuedAt = new Date();
  const entry: PendingMultiSigEntry = {
    entryId: randomUUID(),
    vehicleId: p.vehicleId,
    action: p.action,
    reasonCode: p.reasonCode,
    reasonText: p.reasonText,
    initiatorId: p.issuerId,
    issuedAt: issuedAt.toISOString(),
    expiresAt: new Date(issuedAt.getTime() + (p.expiryMs ?? DEFAULT_EXPIRY_MS)).toISOString(),
    nonce: randomBytes(16).toString("hex"),
  };
  pendingMultiSigCommands.set(entry.entryId, entry);

  auditLog.append(
    entry.entryId,
    "REQUESTED",
    `[MULTISIG] ${ISSUERS[p.issuerId].label} authorized ${entry.action} on ${p.vehicleId} — awaiting co-authorization from Operations Admin`
  );

  return entry;
}

/**
 * CO-SIGN AND DISPATCH: Resolve the fresh priorCommandHash, compute both
 * signatures atomically, and dispatch the fully-signed command to the ECU.
 */
export function cosignAndDispatch(
  entryId: string,
  cosignerId: string
): { command: Command; result: VerificationResult } {
  const entry = pendingMultiSigCommands.get(entryId);
  if (!entry) throw new Error(`No pending multi-sig entry '${entryId}'`);
  if (!ISSUERS[cosignerId]) throw new Error(`Unknown co-signer '${cosignerId}'`);
  if (cosignerId === entry.initiatorId) {
    throw new Error(`Co-signer must be different from initiator '${entry.initiatorId}'`);
  }

  // Check if the co-sign window has expired
  if (new Date(entry.expiresAt).getTime() <= Date.now()) {
    pendingMultiSigCommands.delete(entryId);
    auditLog.append(
      entry.entryId,
      "REJECTED",
      `[MULTISIG] Co-authorization window lapsed (5 min window expired) — partial 1-of-2 command discarded`
    );
    throw new Error("Co-authorization window expired — pending command discarded");
  }

  // Remove from pending buffer
  pendingMultiSigCommands.delete(entryId);

  // Resolve the FRESH priorCommandHash at dispatch time (not initiate time)
  const freshPriorHash = vehicleVerifier.chainHeadFor(entry.vehicleId);

  // Build the unsigned command with the fresh chain head
  const unsigned: Omit<Command, "signature"> = {
    commandId: randomUUID(),
    vehicleId: entry.vehicleId,
    action: entry.action,
    reasonCode: entry.reasonCode,
    reasonText: entry.reasonText,
    issuerId: entry.initiatorId,
    issuedAt: entry.issuedAt,
    expiresAt: entry.expiresAt,
    nonce: entry.nonce,
    priorCommandHash: freshPriorHash,
  };

  // Both signatures computed atomically over the same canonical payload
  const canonical = canonicalizeCommand(unsigned);
  const sig1 = secureElement.sign(entry.initiatorId, canonical);
  const sig2 = secureElement.sign(cosignerId, canonical);

  const command: Command = {
    ...unsigned,
    signature: sig1, // backward compat field (primary signer)
    signatures: [
      { issuerId: entry.initiatorId, signature: sig1 },
      { issuerId: cosignerId, signature: sig2 },
    ],
  };

  trackCommand(command);
  auditLog.append(
    command.commandId,
    "REQUESTED",
    `[MULTISIG] Dual-key command fully authorized: ${ISSUERS[entry.initiatorId].label} + ${ISSUERS[cosignerId].label} — ${command.action} on ${entry.vehicleId}`
  );
  auditLog.append(
    command.commandId,
    "DISPATCHED",
    `Backend relayed dual-signed command to vehicle ${entry.vehicleId} (backend holds no execute authority)`
  );

  const result = vehicleVerifier.process(command);
  return { command, result };
}

/**
 * PARTIAL-SIG ATTACK DEMO: dispatches a command with only 1 of 2 required
 * signatures while Dual-Key policy is active. ECU must reject at Check 1
 * with failedCheck: "MULTISIG".
 */
export function dispatchPartialSigCommand(
  vehicleId: string,
  issuerId: string
): { command: Command; result: VerificationResult } {
  if (!vehicles.has(vehicleId)) throw new Error(`Unknown vehicle '${vehicleId}'`);

  const issuedAt = new Date();
  const unsigned: Omit<Command, "signature"> = {
    commandId: randomUUID(),
    vehicleId,
    action: "IMMOBILIZE",
    reasonCode: "loan_default",
    reasonText: "ATTACK DEMO: only 1 of 2 required signatures attached",
    issuerId,
    issuedAt: issuedAt.toISOString(),
    expiresAt: new Date(issuedAt.getTime() + DEFAULT_EXPIRY_MS).toISOString(),
    nonce: randomBytes(16).toString("hex"),
    priorCommandHash: vehicleVerifier.chainHeadFor(vehicleId),
  };

  const canonical = canonicalizeCommand(unsigned);
  const sig = secureElement.sign(issuerId, canonical);

  const command: Command = {
    ...unsigned,
    signature: sig,
    signatures: [
      { issuerId, signature: sig },
      // Deliberately missing the second co-signer
    ],
  };

  trackCommand(command);
  auditLog.append(
    command.commandId,
    "DISPATCHED",
    `⚠ Attack demo: command dispatched with only 1 of ${multiSigPolicy.requiredSignatures} required signatures (missing co-signer)`
  );

  return { command, result: vehicleVerifier.process(command) };
}
