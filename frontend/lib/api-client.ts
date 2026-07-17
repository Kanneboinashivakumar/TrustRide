import type {
  Vehicle,
  CommandRecord,
  DriverViewData,
  CommandAction,
  ReasonCode,
  Command,
  VerificationResult,
  AuditLogResponse,
} from "./types";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:4000/api";

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE}${path}`;
  const response = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });
  if (!response.ok) {
    const text = await response.text();
    let parsedError = text;
    try {
      const json = JSON.parse(text);
      parsedError = json.error || text;
    } catch {
      // Not JSON
    }
    throw new Error(parsedError);
  }
  return response.json();
}

export const api = {
  getVehicles: () => request<Vehicle[]>("/vehicles"),
  
  getVehicleHistory: (vehicleId: string) => 
    request<CommandRecord[]>(`/commands/${vehicleId}`),
  
  getDriverView: (vehicleId: string) => 
    request<DriverViewData>(`/vehicles/${vehicleId}/driver-view`),
  
  setVehicleMotion: (vehicleId: string, isMoving: boolean) =>
    request<{ vehicle: Vehicle; recheck: VerificationResult | null }>(
      `/vehicles/${vehicleId}/motion`,
      {
        method: "POST",
        body: JSON.stringify({ isMoving }),
      }
    ),
  
  submitCommand: (params: {
    vehicleId: string;
    action: CommandAction;
    reasonCode: ReasonCode;
    reasonText: string;
    issuerId: string;
  }) =>
    request<{ command: Command; result: VerificationResult }>("/commands", {
      method: "POST",
      body: JSON.stringify(params),
    }),
  
  getAuditLog: () => request<AuditLogResponse>("/audit-log"),
  
  tamperAuditLog: (entryId?: string, newDetail?: string) =>
    request<{ message: string; tampered: any }>("/audit-log/tamper-demo", {
      method: "POST",
      body: JSON.stringify({ entryId, newDetail }),
    }),
  
  restoreAuditLog: () =>
    request<{ message: string; restoredCount: number }>("/audit-log/restore", {
      method: "POST",
    }),
  
  submitDispute: (vehicleId: string, commandId: string, disputeText: string) =>
    request<CommandRecord>(`/vehicles/${vehicleId}/dispute`, {
      method: "POST",
      body: JSON.stringify({ commandId, disputeText }),
    }),
  
  triggerTamperDemo: (vehicleId: string, issuerId: string) =>
    request<{ command: Command; result: VerificationResult }>("/commands/tamper-demo", {
      method: "POST",
      body: JSON.stringify({ vehicleId, issuerId }),
    }),
  
  triggerExpireDemo: (vehicleId: string, issuerId: string) =>
    request<{ command: Command; result: VerificationResult }>("/commands/expire-demo", {
      method: "POST",
      body: JSON.stringify({ vehicleId, issuerId }),
    }),
  
  triggerReplayDemo: (vehicleId: string) =>
    request<{ command: Command; result: VerificationResult }>("/commands/replay-demo", {
      method: "POST",
      body: JSON.stringify({ vehicleId }),
    }),
  
  resetDemoState: () =>
    request<{ message: string }>("/vehicles/reset-demo", {
      method: "POST",
    }),
};
