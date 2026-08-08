/**
 * Shared data model — mirrors /docs/ARCHITECTURE.md "Core data model" exactly.
 * The frontend keeps an identical copy in frontend/lib/types.ts. If you change
 * anything here, change it there too (and in ARCHITECTURE.md).
 */

export type CommandAction = "IMMOBILIZE" | "CANCEL";
export type ReasonCode = "loan_default" | "theft" | "maintenance";

export interface Command {
  commandId: string;        // UUID, unique per request
  vehicleId: string;
  action: CommandAction;
  reasonCode: ReasonCode;
  reasonText: string;
  issuerId: string;         // financier account id (primary initiator)
  issuedAt: string;         // ISO timestamp
  expiresAt: string;        // issuedAt + short window (default 5 min)
  nonce: string;            // random, prevents replay
  priorCommandHash: string; // chains to last executed command for this vehicle ("GENESIS" if none)
  signature: string;        // ECDSA signature over all fields above (single-key mode)
  signatures?: Array<{ issuerId: string; signature: string }>; // multi-sig mode: all co-signers
}

/** Entry in the pending multi-sig buffer (backend-only, awaiting co-authorization). */
export interface PendingMultiSigEntry {
  entryId: string;          // UUID for this pending entry
  vehicleId: string;
  action: CommandAction;
  reasonCode: ReasonCode;
  reasonText: string;
  initiatorId: string;      // issuer who initiated (intent recorded, not yet signed)
  issuedAt: string;         // ISO timestamp of initiation
  expiresAt: string;        // same 5-min window — co-sign must happen before this
  nonce: string;
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

export interface VehicleDocument {
  id: string;
  type: string;
  name: string;
  issueDate?: string;
  expiryDate: string;
  status: 'valid' | 'expired' | 'pending';
  url?: string;
}

export interface InsuranceDetails {
  provider: string;
  policyNumber: string;
  coverage?: string;
  coverageType?: string;
  premium: string | number;
  startDate?: string;
  validFrom?: string;
  validUntil?: string;
  endDate?: string;
  status: 'active' | 'expired' | 'pending';
}

export interface LoanDetails {
  lender?: string;
  financier?: string;
  accountNumber: string;
  principal?: number;
  principalAmount?: number;
  outstanding?: number;
  remainingAmount?: number;
  emi?: number;
  monthlyEMI?: number;
  tenure?: string;
  startDate?: string;
  nextPayment?: string;
  nextDueDate?: string;
  defaultRisk?: string;
  status: 'current' | 'default' | 'paid' | 'good_standing';
}

export interface OwnerDetails {
  id?: string;
  name: string;
  email: string;
  phone?: string;
  organization?: string;
  address: string;
  contactNumber?: string;
  type?: string;
}

export interface VehicleTelemetry {
  vehicleId?: string;
  timestamp: string;
  speed: number;
  batteryLevel: number;
  temperature: number;
  location: { lat: number; lng: number };
  heading?: number;
  altitude?: number;
  signalStrength?: number;
  motorTemp?: number;
  tirePressure?: number[];
  energyConsumption?: number;
}

export interface Vehicle {
  vehicleId: string;
  driverName: string;
  isMoving: boolean;             // the "motion signal" toggle for the demo
  immobilized: boolean;          // runtime effect of an executed IMMOBILIZE
  pendingCommand: Command | null;

  // Extended UI metadata fields (Indian Commercial EV Fleet)
  id?: string;
  vin?: string;
  make?: string;
  model?: string;
  year?: number;
  status?: 'active' | 'idle' | 'charging' | 'maintenance' | 'disabled' | 'offline';
  licensePlate?: string;
  color?: string;
  batteryLevel?: number;
  batteryHealth?: number;
  range?: number;
  speed?: number;
  mileage?: number;
  location?: { lat: number; lng: number; address: string };
  lastUpdated?: string;
  driver?: { id: string; name: string; avatar?: string };
  threatCount?: number;
  firmwareVersion?: string;
  documents?: VehicleDocument[];
  insurance?: InsuranceDetails;
  loanDetails?: LoanDetails;
  ownerDetails?: OwnerDetails;
  telemetryHistory?: VehicleTelemetry[];
}

/** Lifecycle status of a command as tracked by the platform (for driver/financier views). */
export type CommandStatus =
  | "PENDING"         // dispatched, vehicle hasn't resolved it yet (transient)
  | "HELD"            // verified but vehicle moving — waiting for it to stop
  | "EXECUTED"
  | "REJECTED"
  | "EXPIRED"         // expired while held
  | "CANCELLED"       // superseded by an executed CANCEL
  | "AWAITING_COSIGN"; // multi-sig: financier authorized, awaiting ops admin co-sign

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
    | "MULTISIG"
    | null;
  detail: string;
}

/** Multi-signature policy configuration. */
export interface MultiSigPolicy {
  enabled: boolean;
  requiredSignatures: number;
  requiredIssuers: string[];
}
