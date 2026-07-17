/**
 * In-memory stores (decision: ARCHITECTURE.md — no DB, seed reloads on restart).
 * Module-level singletons; the Express process is long-lived so state persists
 * for the duration of a demo run.
 */
import type { Vehicle, CommandRecord, CommandStatus } from "./types.js";

/** Known financier identities (mock auth — role picker on the frontend). */
export const ISSUERS: Record<string, { issuerId: string; label: string }> = {
  "fin-001": { issuerId: "fin-001", label: "TrustRide Finance" },
};

export const vehicles = new Map<string, Vehicle>();

/** Full lifecycle record for every command ever submitted (driver/financier views). */
export const commandRecords = new Map<string, CommandRecord>();

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
