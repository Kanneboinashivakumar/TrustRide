import { describe, it, expect, beforeEach, vi } from "vitest";
import { vehicleVerifier } from "../../src/engine/verifier.js";
import { secureElement } from "../../src/crypto/secureElement.js";
import { canonicalizeCommand } from "../../src/crypto/canonical.js";
import { vehicles, commandRecords, multiSigPolicy } from "../../src/models/store.js";
import type { Command, CommandRecord, Vehicle } from "../../src/models/types.js";

describe("Edge-Case Tests (Security & Protocol Boundaries)", () => {
  const ISSUER_1 = "fin-edge-001";
  const ISSUER_2 = "ops-edge-001";
  const EDGE_VEHICLE_ID = "TR-EDGE-101";

  function trackCommand(cmd: Command): CommandRecord {
    const record: CommandRecord = {
      command: cmd,
      status: "PENDING",
      statusDetail: "Dispatched",
      disputed: false,
      disputeText: null,
      vehicleAckSignature: null,
      updatedAt: new Date().toISOString(),
    };
    commandRecords.set(cmd.commandId, record);
    return record;
  }

  beforeEach(() => {
    // Provision issuer & vehicle keys
    secureElement.provision(ISSUER_1, "Edge Financier Key 1");
    secureElement.provision(ISSUER_2, "Edge Ops Key 2");
    secureElement.provision(`vehicle:${EDGE_VEHICLE_ID}`, "Edge Vehicle 1 SE Key");

    vehicleVerifier.trustIssuer(ISSUER_1, secureElement.getPublicKeyPem(ISSUER_1));
    vehicleVerifier.trustIssuer(ISSUER_2, secureElement.getPublicKeyPem(ISSUER_2));

    // Seed test vehicle
    const testVeh: Vehicle = {
      vehicleId: EDGE_VEHICLE_ID,
      driverName: "Edge Driver 1",
      isMoving: false,
      immobilized: false,
      pendingCommand: null,
    };
    vehicles.set(EDGE_VEHICLE_ID, testVeh);
  });

  it("1. Expiry at exact 5:00 boundary condition (<= Date.now())", () => {
    multiSigPolicy.enabled = false;
    const now = Date.now();

    const unsignedExactBoundary: Omit<Command, "signature"> = {
      commandId: "CMD-BOUNDARY-EXACT",
      vehicleId: EDGE_VEHICLE_ID,
      action: "IMMOBILIZE",
      reasonCode: "loan_default",
      reasonText: "Exact 5:00 boundary test",
      issuerId: ISSUER_1,
      issuedAt: new Date(now - 300000).toISOString(), // 5 mins ago
      expiresAt: new Date(now).toISOString(),         // exact boundary
      nonce: "NONCE-BOUNDARY-EXACT",
      priorCommandHash: vehicleVerifier.chainHeadFor(EDGE_VEHICLE_ID),
    };

    const sig = secureElement.sign(ISSUER_1, canonicalizeCommand(unsignedExactBoundary));
    const cmd: Command = { ...unsignedExactBoundary, signature: sig };
    trackCommand(cmd);

    const result = vehicleVerifier.process(cmd);
    expect(result.outcome).toBe("REJECTED");
    expect(result.failedCheck).toBe("EXPIRY");
    expect(result.detail).toContain("Command expired at");
  });

  it("2. HELD command whose expiry passes before the vehicle stops", () => {
    multiSigPolicy.enabled = false;
    const testVeh = vehicles.get(EDGE_VEHICLE_ID)!;

    // Step A: Process while moving -> outcome: HELD
    testVeh.isMoving = true;

    const issuedAtTime = Date.now();
    const unsignedHeld: Omit<Command, "signature"> = {
      commandId: "CMD-HELD-EXPIRING",
      vehicleId: EDGE_VEHICLE_ID,
      action: "IMMOBILIZE",
      reasonCode: "loan_default",
      reasonText: "Held command expiring while vehicle in motion",
      issuerId: ISSUER_1,
      issuedAt: new Date(issuedAtTime).toISOString(),
      expiresAt: new Date(issuedAtTime + 50).toISOString(), // expires in 50ms
      nonce: "NONCE-HELD-EXPIRE-01",
      priorCommandHash: vehicleVerifier.chainHeadFor(EDGE_VEHICLE_ID),
    };

    const sig = secureElement.sign(ISSUER_1, canonicalizeCommand(unsignedHeld));
    const cmd: Command = { ...unsignedHeld, signature: sig };
    trackCommand(cmd);

    // Step A: Process while moving -> outcome: HELD
    const initialResult = vehicleVerifier.process(cmd);
    expect(initialResult.outcome).toBe("HELD");
    expect(testVeh.pendingCommand).toEqual(cmd);

    // Step B: Simulate time elapsed past expiresAt
    const futureTime = issuedAtTime + 500;
    vi.spyOn(Date, "now").mockReturnValue(futureTime);

    // Step C: Vehicle comes to a stop
    testVeh.isMoving = false;

    // Step D: ECU recheckPending is called
    const recheckResult = vehicleVerifier.recheckPending(EDGE_VEHICLE_ID);
    expect(recheckResult).not.toBeNull();
    expect(recheckResult?.outcome).toBe("REJECTED");
    expect(recheckResult?.failedCheck).toBe("EXPIRY");
    expect(recheckResult?.detail).toContain("Held command expired at");

    expect(testVeh.pendingCommand).toBeNull();
    expect(testVeh.immobilized).toBe(false);

    vi.restoreAllMocks();
  });

  it("3. Dual-sig command with only 1 of 2 required signatures present", () => {
    multiSigPolicy.enabled = true;
    multiSigPolicy.requiredSignatures = 2;
    multiSigPolicy.requiredIssuers = [ISSUER_1, ISSUER_2];

    const unsigned: Omit<Command, "signature"> = {
      commandId: "CMD-PARTIAL-SIG-EDGE",
      vehicleId: EDGE_VEHICLE_ID,
      action: "IMMOBILIZE",
      reasonCode: "loan_default",
      reasonText: "Partial signature edge case test",
      issuerId: ISSUER_1,
      issuedAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 300000).toISOString(),
      nonce: "NONCE-PARTIAL-SIG-01",
      priorCommandHash: vehicleVerifier.chainHeadFor(EDGE_VEHICLE_ID),
    };

    const canonical = canonicalizeCommand(unsigned);
    const sig1 = secureElement.sign(ISSUER_1, canonical);

    const partialCmd: Command = {
      ...unsigned,
      signature: sig1,
      signatures: [{ issuerId: ISSUER_1, signature: sig1 }],
    };
    trackCommand(partialCmd);

    const result = vehicleVerifier.process(partialCmd);
    expect(result.outcome).toBe("REJECTED");
    expect(result.failedCheck).toBe("MULTISIG");
    expect(result.detail).toContain("Multi-signature check FAILED: 2 of 2 required signatures");
  });

  it("4. Replayed nonce used in a different command shape (cross-command nonce replay)", () => {
    multiSigPolicy.enabled = false;
    const REPLAY_NONCE = "SHARED-NONCE-ATTACK-VECTOR-999";

    const cmdAUnsigned: Omit<Command, "signature"> = {
      commandId: "CMD-ORIGINAL-A",
      vehicleId: EDGE_VEHICLE_ID,
      action: "IMMOBILIZE",
      reasonCode: "loan_default",
      reasonText: "Original command A",
      issuerId: ISSUER_1,
      issuedAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 300000).toISOString(),
      nonce: REPLAY_NONCE,
      priorCommandHash: vehicleVerifier.chainHeadFor(EDGE_VEHICLE_ID),
    };
    const sigA = secureElement.sign(ISSUER_1, canonicalizeCommand(cmdAUnsigned));
    const cmdA: Command = { ...cmdAUnsigned, signature: sigA };
    trackCommand(cmdA);

    const resultA = vehicleVerifier.process(cmdA);
    expect(resultA.outcome).toBe("EXECUTED");

    // Command B: Different commandId, different action, different vehicleId (TR-EDGE-102), BUT re-uses REPLAY_NONCE
    const SECOND_VEHICLE = "TR-EDGE-102";
    secureElement.provision(`vehicle:${SECOND_VEHICLE}`, "Edge Vehicle 2 SE Key");
    vehicles.set(SECOND_VEHICLE, {
      vehicleId: SECOND_VEHICLE,
      driverName: "Edge Driver 2",
      isMoving: false,
      immobilized: false,
      pendingCommand: null,
    });

    const cmdBUnsigned: Omit<Command, "signature"> = {
      commandId: "CMD-REPLAYED-B-DIFFERENT-SHAPE",
      vehicleId: SECOND_VEHICLE,
      action: "CANCEL",
      reasonCode: "maintenance",
      reasonText: "Attacker attempts reusing nonce in different command shape",
      issuerId: ISSUER_1,
      issuedAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 300000).toISOString(),
      nonce: REPLAY_NONCE,
      priorCommandHash: vehicleVerifier.chainHeadFor(SECOND_VEHICLE),
    };
    const sigB = secureElement.sign(ISSUER_1, canonicalizeCommand(cmdBUnsigned));
    const cmdB: Command = { ...cmdBUnsigned, signature: sigB };
    trackCommand(cmdB);

    const resultB = vehicleVerifier.process(cmdB);
    expect(resultB.outcome).toBe("REJECTED");
    expect(resultB.failedCheck).toBe("REPLAY");
    expect(resultB.detail).toContain("commandId/nonce already seen");
  });
});
