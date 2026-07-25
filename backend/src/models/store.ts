/**
 * In-memory stores (decision: ARCHITECTURE.md — no DB, seed reloads on restart).
 * Module-level singletons; the Express process is long-lived so state persists
 * for the duration of a demo run.
 */
import type { Vehicle, CommandRecord, CommandStatus, PendingMultiSigEntry, MultiSigPolicy } from "./types.js";

/** Known financier identities (mock auth — role picker on the frontend). */
export const ISSUERS: Record<string, { issuerId: string; label: string }> = {
  "fin-001": { issuerId: "fin-001", label: "TrustRide Finance" },
  "ops-001": { issuerId: "ops-001", label: "TrustRide Operations Admin" },
};

export const vehicles = new Map<string, Vehicle>();

/** Full lifecycle record for every command ever submitted (driver/financier views). */
export const commandRecords = new Map<string, CommandRecord>();

/** Pending multi-sig commands awaiting co-authorization (keyed by entryId). */
export const pendingMultiSigCommands = new Map<string, PendingMultiSigEntry>();

/** Runtime multi-sig policy — toggled via API, defaults ON. */
export const multiSigPolicy: MultiSigPolicy = {
  enabled: true,
  requiredSignatures: 2,
  requiredIssuers: ["fin-001", "ops-001"],
};

export function upsertRecord(
  commandId: string,
  patch: Partial<CommandRecord>
): CommandRecord {
  const existing = commandRecords.get(commandId);
  if (!existing) throw new Error(`No command record for ${commandId}`);
  const updated: CommandRecord = {
    ...existing,
    ...patch,
    updatedAt: new Date().toISOString(),
  };
  commandRecords.set(commandId, updated);
  return updated;
}

export function recordsForVehicle(vehicleId: string): CommandRecord[] {
  return [...commandRecords.values()]
    .filter((r) => r.command.vehicleId === vehicleId)
    .sort((a, b) => b.command.issuedAt.localeCompare(a.command.issuedAt));
}

export function setStatus(
  commandId: string,
  status: CommandStatus,
  statusDetail: string
): void {
  upsertRecord(commandId, { status, statusDetail });
}
