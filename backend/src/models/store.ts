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

/** Vehicle ID alias resolver so tests referring to TR-101 access V-1001 */
export function getVehicle(vehicleId: string): Vehicle | undefined {
  if (vehicles.has(vehicleId)) return vehicles.get(vehicleId);
  if (vehicleId === "TR-101") return vehicles.get("V-1001");
  if (vehicleId === "TR-102") return vehicles.get("V-1002");
  if (vehicleId === "TR-103") return vehicles.get("V-1003");
  return undefined;
}

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

export interface UserRecord {
  id: string;
  googleId?: string;
  name: string;
  firstName?: string;
  lastName?: string;
  email: string;
  passwordHash?: string;
  avatar?: string;
  profilePhoto?: string;
  role: string;
  organization: string;
  department?: string;
  phone?: string;
  employeeId?: string;
  designation?: string;
  provider: 'google' | 'email';
  twoFactorEnabled?: boolean;
  twoFactorSecret?: string;
  recoveryCodes?: string[];
  createdAt: string;
  updatedAt?: string;
}

export interface SessionRecord {
  id: string;
  userId: string;
  token: string;
  browser: string;
  os: string;
  ipAddress: string;
  loginTime: string;
}

export const users = new Map<string, UserRecord>();
export const sessions = new Map<string, SessionRecord>();

// Seed Demo Users
const seedDemoUsers: UserRecord[] = [
  {
    id: "U-ADMIN",
    name: "Vikram Singh",
    firstName: "Vikram",
    lastName: "Singh",
    email: "admin@trustride.ai",
    passwordHash: "Admin@123",
    organization: "TrustRide HQ",
    role: "Administrator",
    department: "Executive Security",
    phone: "+91 98765 33333",
    employeeId: "EMP-001",
    designation: "Chief Information Security Officer",
    profilePhoto: "VS",
    avatar: "VS",
    provider: "email",
    twoFactorEnabled: true,
    twoFactorSecret: "JBSWY3DPEHPK3PXP",
    recoveryCodes: ["REC-1122", "REC-3344", "REC-5566"],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "U-SARAH",
    name: "Sarah Kim",
    firstName: "Sarah",
    lastName: "Kim",
    email: "sarah.kim@trustride.ai",
    passwordHash: "Admin@123",
    organization: "TrustRide Commercial Fleet Co-op",
    role: "Security Officer",
    department: "SOC Operations",
    phone: "+91 98765 11111",
    employeeId: "EMP-102",
    designation: "Lead Security Officer & SOC Admin",
    profilePhoto: "SK",
    avatar: "SK",
    provider: "email",
    twoFactorEnabled: true,
    twoFactorSecret: "JBSWY3DPEHPK3PXP",
    recoveryCodes: ["REC-9911", "REC-8822"],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "U-AISHA",
    name: "Aisha Khan",
    firstName: "Aisha",
    lastName: "Khan",
    email: "aisha.khan@trustride.ai",
    passwordHash: "Admin@123",
    organization: "TrustRide Commercial Fleet Co-op",
    role: "Operations Manager",
    department: "Fleet Operations",
    phone: "+91 98765 22222",
    employeeId: "EMP-204",
    designation: "Fleet Operations Director",
    profilePhoto: "AK",
    avatar: "AK",
    provider: "email",
    twoFactorEnabled: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "U-RAJESH",
    name: "Rajesh Kumar",
    firstName: "Rajesh",
    lastName: "Kumar",
    email: "rajesh.kumar@trustride.ai",
    passwordHash: "Driver@123",
    organization: "TrustRide Commercial Fleet Co-op",
    role: "Driver",
    department: "Commercial Transport",
    phone: "+91 98765 43210",
    employeeId: "EMP-9982",
    designation: "Commercial EV Operator",
    profilePhoto: "RK",
    avatar: "RK",
    provider: "email",
    twoFactorEnabled: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "U-VIEWER",
    name: "Audit Observer",
    firstName: "Audit",
    lastName: "Observer",
    email: "viewer@trustride.ai",
    passwordHash: "Viewer@123",
    organization: "Regulatory Oversight Body",
    role: "Viewer",
    department: "Automotive Compliance",
    phone: "+91 98765 00000",
    employeeId: "EMP-900",
    designation: "Compliance Inspector",
    profilePhoto: "AO",
    avatar: "AO",
    provider: "email",
    twoFactorEnabled: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

for (const u of seedDemoUsers) {
  users.set(u.email.toLowerCase(), u);
}
