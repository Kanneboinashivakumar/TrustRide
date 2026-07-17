/**
 * Canonical serialization for signing/hashing.
 *
 * Both the signer (simulated Secure Element) and the vehicle-side verifier MUST
 * serialize a command the exact same way, otherwise valid signatures would fail.
 * We pin an explicit field order instead of relying on object key order.
 */
import { createHash } from "node:crypto";
import type { Command } from "../models/types.js";

/** Every signed field of a command, in fixed order, excluding the signature itself. */
export function canonicalizeCommand(cmd: Omit<Command, "signature">): string {
  return JSON.stringify([
    cmd.commandId,
    cmd.vehicleId,
    cmd.action,
    cmd.reasonCode,
    cmd.reasonText,
    cmd.issuerId,
    cmd.issuedAt,
    cmd.expiresAt,
    cmd.nonce,
    cmd.priorCommandHash,
  ]);
}

export function sha256Hex(data: string): string {
  return createHash("sha256").update(data, "utf8").digest("hex");
}

/**
 * Hash of a fully-signed command — used as `priorCommandHash` by the NEXT command
 * for the same vehicle, forming a per-vehicle command chain.
 */
export function commandHash(cmd: Command): string {
  return sha256Hex(canonicalizeCommand(cmd) + "|" + cmd.signature);
}
