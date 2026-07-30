import { describe, it, expect, beforeAll } from "vitest";

process.env.PORT = "4001";

const API_BASE = "http://localhost:4001/api";

interface ApiVehicle {
  vehicleId: string;
  isMoving: boolean;
  immobilized: boolean;
}

interface ApiHistoryItem {
  command: {
    commandId: string;
  };
  disputed: boolean;
}

interface ApiAuditEntry {
  eventType: string;
  detail: string;
}

interface ApiResultResponse {
  result: {
    outcome: string;
    failedCheck: string | null;
  };
  command?: {
    signatures: unknown[];
  };
  vehicle?: {
    isMoving: boolean;
    immobilized: boolean;
  };
  recheck?: {
    outcome: string;
  };
}

async function request<T = Record<string, unknown>>(path: string, options: RequestInit = {}): Promise<T> {
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
    throw new Error(`Request to ${url} failed with status ${response.status}: ${text}`);
  }
  return response.json() as Promise<T>;
}

describe("Integration: 8 API Scenarios (9 Test Executions)", () => {
  beforeAll(async () => {
    // Start backend server on port 4001
    await import("../../src/server.js");

    // Reset demo state first to have clean starting conditions
    await request("/vehicles/reset-demo", { method: "POST" });

    // Disable multi-sig for Scenarios 1-7 (they test single-key behavior)
    await request("/commands/multisig/toggle", {
      method: "POST",
      body: JSON.stringify({ enabled: false }),
    });
  });

  it("Scenario 1: Financier submits shutdown request on moving vehicle -> HELD", async () => {
    const vehicles = await request<ApiVehicle[]>("/vehicles");
    const tr103 = vehicles.find((v) => v.vehicleId === "TR-103");
    expect(tr103).toBeDefined();
    expect(tr103?.isMoving).toBe(true);

    const cmdResponse = await request<ApiResultResponse>("/commands", {
      method: "POST",
      body: JSON.stringify({
        vehicleId: "TR-103",
        action: "IMMOBILIZE",
        reasonCode: "loan_default",
        reasonText: "Missed payment, moving vehicle remote immobilization hold",
        issuerId: "fin-001",
      }),
    });

    expect(cmdResponse.result.outcome).toBe("HELD");
    expect(cmdResponse.result.failedCheck).toBeNull();
  });

  it("Scenario 2: Vehicle stops -> HELD command executes automatically", async () => {
    const motionResponse = await request<ApiResultResponse>("/vehicles/TR-103/motion", {
      method: "POST",
      body: JSON.stringify({ isMoving: false }),
    });

    expect(motionResponse.vehicle?.isMoving).toBe(false);
    expect(motionResponse.vehicle?.immobilized).toBe(true);
    expect(motionResponse.recheck).toBeDefined();
    expect(motionResponse.recheck?.outcome).toBe("EXECUTED");
  });

  it("Scenario 3: Tampered command is rejected (signature invalid)", async () => {
    const tamperResponse = await request<ApiResultResponse>("/commands/tamper-demo", {
      method: "POST",
      body: JSON.stringify({
        vehicleId: "TR-101",
        issuerId: "fin-001",
      }),
    });

    expect(tamperResponse.result.outcome).toBe("REJECTED");
    expect(tamperResponse.result.failedCheck).toBe("SIGNATURE");
  });

  it("Scenario 4: Expired command is rejected", async () => {
    const expireResponse = await request<ApiResultResponse>("/commands/expire-demo", {
      method: "POST",
      body: JSON.stringify({
        vehicleId: "TR-101",
        issuerId: "fin-001",
      }),
    });

    expect(expireResponse.result.outcome).toBe("REJECTED");
    expect(expireResponse.result.failedCheck).toBe("EXPIRY");
  });

  it("Scenario 5: Replayed command is rejected", async () => {
    const validResponse = await request<ApiResultResponse>("/commands", {
      method: "POST",
      body: JSON.stringify({
        vehicleId: "TR-101",
        action: "IMMOBILIZE",
        reasonCode: "loan_default",
        reasonText: "Payment default replay test base",
        issuerId: "fin-001",
      }),
    });
    expect(validResponse.result.outcome).toBe("EXECUTED");

    const replayResponse = await request<ApiResultResponse>("/commands/replay-demo", {
      method: "POST",
      body: JSON.stringify({
        vehicleId: "TR-101",
      }),
    });

    expect(replayResponse.result.outcome).toBe("REJECTED");
    expect(replayResponse.result.failedCheck).toBe("REPLAY");
  });

  it("Scenario 6: Driver sees the request and can dispute it", async () => {
    const tr101ViewBefore = await request<{ history: ApiHistoryItem[] }>("/vehicles/TR-101/driver-view");
    const commandToDispute = tr101ViewBefore.history[0];
    expect(commandToDispute).toBeDefined();

    const disputeText = "Payment was sent 2 hours ago. Txn ID: TXN84910283.";
    const disputeResponse = await request<Record<string, unknown>>("/vehicles/TR-101/dispute", {
      method: "POST",
      body: JSON.stringify({
        commandId: commandToDispute.command.commandId,
        disputeText,
      }),
    });

    expect(disputeResponse.disputed).toBe(true);
    expect(disputeResponse.disputeText).toBe(disputeText);

    const tr101ViewAfter = await request<{ history: ApiHistoryItem[] }>("/vehicles/TR-101/driver-view");
    const updatedCommand = tr101ViewAfter.history.find(
      (h) => h.command.commandId === commandToDispute.command.commandId
    );
    expect(updatedCommand?.disputed).toBe(true);

    const logAfterDispute = await request<{ entries: ApiAuditEntry[] }>("/audit-log");
    const disputeLogEntry = logAfterDispute.entries.find((e) => e.eventType === "DISPUTED");
    expect(disputeLogEntry).toBeDefined();
    expect(disputeLogEntry?.detail).toContain(disputeText);
  });

  it("Scenario 7: Audit log chain validation and tampering breaking demo", async () => {
    const initialLog = await request<Record<string, unknown>>("/audit-log");
    expect(initialLog.chainIntact).toBe(true);

    const tamperResult = await request<Record<string, unknown>>("/audit-log/tamper-demo", { method: "POST" });
    expect(tamperResult.tampered).toBeDefined();

    const tamperedLog = await request<Record<string, unknown>>("/audit-log");
    expect(tamperedLog.chainIntact).toBe(false);
    expect(tamperedLog.firstBrokenIndex).not.toBeNull();

    const restoreResult = await request<Record<string, unknown>>("/audit-log/restore", { method: "POST" });
    expect(restoreResult.restoredCount).toBe(1);

    const restoredLog = await request<Record<string, unknown>>("/audit-log");
    expect(restoredLog.chainIntact).toBe(true);
  });

  it("Scenario 8a: Multi-Signature Verification - full dual-sig command", async () => {
    await request("/commands/multisig/toggle", {
      method: "POST",
      body: JSON.stringify({ enabled: true }),
    });

    const msInitResponse = await request<Record<string, unknown>>("/commands/multisig/initiate", {
      method: "POST",
      body: JSON.stringify({
        vehicleId: "TR-101",
        action: "IMMOBILIZE",
        reasonCode: "loan_default",
        reasonText: "Dual-key governance test: full authorization",
        issuerId: "fin-001",
      }),
    });
    expect(msInitResponse.entryId).toBeDefined();

    const msCosignResponse = await request<ApiResultResponse>("/commands/multisig/cosign", {
      method: "POST",
      body: JSON.stringify({
        entryId: msInitResponse.entryId as string,
        cosignerId: "ops-001",
      }),
    });
    expect(msCosignResponse.command).toBeDefined();
    expect(msCosignResponse.result.outcome).toBe("EXECUTED");
    expect(msCosignResponse.result.failedCheck).toBeNull();
    expect(msCosignResponse.command?.signatures.length).toBe(2);

    await request("/commands/multisig/toggle", {
      method: "POST",
      body: JSON.stringify({ enabled: false }),
    });
    await request("/commands", {
      method: "POST",
      body: JSON.stringify({
        vehicleId: "TR-101",
        action: "CANCEL",
        reasonCode: "maintenance",
        reasonText: "Cleanup after multi-sig test",
        issuerId: "fin-001",
      }),
    });
    await request("/commands/multisig/toggle", {
      method: "POST",
      body: JSON.stringify({ enabled: true }),
    });
  });

  it("Scenario 8b: Multi-Signature Verification - partial-sig attack (1 of 2 keys)", async () => {
    const partialSigResponse = await request<ApiResultResponse>("/commands/partial-sig-demo", {
      method: "POST",
      body: JSON.stringify({
        vehicleId: "TR-101",
        issuerId: "fin-001",
      }),
    });

    expect(partialSigResponse.result.outcome).toBe("REJECTED");
    expect(partialSigResponse.result.failedCheck).toBe("MULTISIG");
  });
});
