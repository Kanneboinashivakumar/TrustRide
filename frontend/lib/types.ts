export type CommandAction = "IMMOBILIZE" | "CANCEL";
export type ReasonCode = "loan_default" | "theft" | "maintenance";

export interface Command {
  commandId: string;        // UUID, unique per request
  vehicleId: string;
  action: CommandAction;
  reasonCode: ReasonCode;
  reasonText: string;
  issuerId: string;         // financier account id
  issuedAt: string;         // ISO timestamp
  expiresAt: string;        // issuedAt + short window (default 5 min)
  nonce: string;            // random, prevents replay
  priorCommandHash: string; // chains to last executed command for this vehicle ("GENESIS" if none)
  signature: string;        // ECDSA signature over all fields above
}

export type AuditEventType =
  | "REQUESTED"     // financier submitted the request
  | "DISPATCHED"    // backend relayed the signed command to the vehicle
  | "HELD"          // vehicle verified it but is moving — queued
  | "REJECTED"      // vehicle refused (bad signature / expired / replay / chain mismatch)
  | "EXECUTED"      // vehicle immobilized (or cancelled) — only after full verification
  | "ACKNOWLEDGED"  // vehicle produced a signed acknowledgement
  | "DISPUTED";     // driver raised a dispute against a command

export interface AuditLogEntry {
  entryId: string;
  timestamp: string;
  commandId: string;
  eventType: AuditEventType;
  detail: string;
  previousEntryHash: string; // hash-chain link
  entryHash: string;         // hash of this entry's fields + previousEntryHash
}

export interface Vehicle {
  vehicleId: string;
  driverName: string;
  isMoving: boolean;             // the "motion signal" toggle for the demo
  immobilized: boolean;          // runtime effect of an executed IMMOBILIZE
  pendingCommand: Command | null;
}

/** Lifecycle status of a command as tracked by the platform (for driver/financier views). */
export type CommandStatus =
  | "PENDING"    // dispatched, vehicle hasn't resolved it yet (transient)
  | "HELD"       // verified but vehicle moving — waiting for it to stop
  | "EXECUTED"
  | "REJECTED"
  | "EXPIRED"    // expired while held
  | "CANCELLED"; // superseded by an executed CANCEL

export interface CommandRecord {
  command: Command;
  status: CommandStatus;
  statusDetail: string;     // human-readable outcome, mirrors audit log detail
  disputed: boolean;
  disputeText: string | null;
  vehicleAckSignature: string | null; // vehicle-signed acknowledgement (EXECUTED only)
  updatedAt: string;
}

/** Result the vehicle-side verifier returns for every processed command. */
export interface VerificationResult {
  outcome: "EXECUTED" | "HELD" | "REJECTED";
  failedCheck:
    | "SIGNATURE"
    | "EXPIRY"
    | "REPLAY"
    | "CHAIN"
    | "PENDING_SLOT"
    | null;
  detail: string;
}

export interface AuditLogResponse {
  chainIntact: boolean;
  firstBrokenIndex: number | null;
  entries: (AuditLogEntry & { valid: boolean; linkIntact: boolean })[];
}

export interface DriverViewData {
  vehicle: Vehicle;
  history: CommandRecord[];
}
