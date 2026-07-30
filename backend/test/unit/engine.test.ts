import { describe, it, expect, beforeEach } from "vitest";
import { vehicleVerifier } from "../../src/engine/verifier.js";
import { secureElement } from "../../src/crypto/secureElement.js";
import { canonicalizeCommand } from "../../src/crypto/canonical.js";
import { vehicles, commandRecords, multiSigPolicy } from "../../src/models/store.js";
import type { Command, CommandRecord, Vehicle } from "../../src/models/types.js";

describe("Vehicle ECU Verifier (engine.ts) Isolated Check Tests", () => {
  const TEST_ISSUER = "fin-engine-test";
  const TEST_VEHICLE_ID = "TR-UNIT-101";

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
    secureElement.provision(TEST_ISSUER, "Engine Test Financier");
    secureElement.provision(`vehicle:${TEST_VEHICLE_ID}`, "Unit Vehicle SE Key");

    const pubKeyPem = secureElement.getPublicKeyPem(TEST_ISSUER);
    vehicleVerifier.trustIssuer(TEST_ISSUER, pubKeyPem);

    // Disable multi-sig for isolated single-key check tests
    multiSigPolicy.enabled = false;

    // Seed clean test vehicle in store
    const testVeh: Vehicle = {
      vehicleId: TEST_VEHICLE_ID,
      driverName: "Unit Driver",
      isMoving: false,
      immobilized: false,
      pendingCommand: null,
    };
    vehicles.set(TEST_VEHICLE_ID, testVeh);
  });

  it("Check 1 (SIGNATURE): Rejects commands with tampered/invalid signature", () => {
    const unsigned: Omit<Command, "signature"> = {
      commandId: "CMD-CHK1-01",
      vehicleId: TEST_VEHICLE_ID,
      action: "IMMOBILIZE",
      reasonCode: "loan_default",
      reasonText: "Signature test",
      issuerId: TEST_ISSUER,
      issuedAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 300000).toISOString(),
      nonce: "NONCE-CHK1-01",
      priorCommandHash: vehicleVerifier.chainHeadFor(TEST_VEHICLE_ID),
    };

    const cmd: Command = { ...unsigned, signature: "INVALID-B64-SIGNATURE-STRING" };
    trackCommand(cmd);

    const result = vehicleVerifier.process(cmd);

    expect(result.outcome).toBe("REJECTED");
    expect(result.failedCheck).toBe("SIGNATURE");
    expect(result.detail).toContain("Signature verification FAILED");
  });

  it("Check 2 (EXPIRY): Rejects commands where expiresAt timestamp is in the past", () => {
    const unsigned: Omit<Command, "signature"> = {
      commandId: "CMD-CHK2-01",
      vehicleId: TEST_VEHICLE_ID,
      action: "IMMOBILIZE",
      reasonCode: "loan_default",
      reasonText: "Expiry check",
      issuerId: TEST_ISSUER,
      issuedAt: new Date(Date.now() - 600000).toISOString(),
      expiresAt: new Date(Date.now() - 60000).toISOString(), // 1 min ago
      nonce: "NONCE-CHK2-01",
      priorCommandHash: vehicleVerifier.chainHeadFor(TEST_VEHICLE_ID),
    };

    const signature = secureElement.sign(TEST_ISSUER, canonicalizeCommand(unsigned));
    const cmd: Command = { ...unsigned, signature };
    trackCommand(cmd);

    const result = vehicleVerifier.process(cmd);
    expect(result.outcome).toBe("REJECTED");
    expect(result.failedCheck).toBe("EXPIRY");
    expect(result.detail).toContain("Command expired at");
  });

  it("Check 3 (REPLAY): Rejects duplicate nonces/commandIds even if signatures & timestamps are valid", () => {
    const unsigned: Omit<Command, "signature"> = {
      commandId: "CMD-CHK3-01",
      vehicleId: TEST_VEHICLE_ID,
      action: "IMMOBILIZE",
      reasonCode: "loan_default",
      reasonText: "Replay check base",
      issuerId: TEST_ISSUER,
      issuedAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 300000).toISOString(),
      nonce: "NONCE-CHK3-01",
      priorCommandHash: vehicleVerifier.chainHeadFor(TEST_VEHICLE_ID),
    };

    const signature = secureElement.sign(TEST_ISSUER, canonicalizeCommand(unsigned));
    const cmd: Command = { ...unsigned, signature };
    trackCommand(cmd);

    // First presentation -> EXECUTED
    const firstResult = vehicleVerifier.process(cmd);
    expect(firstResult.outcome).toBe("EXECUTED");

    // Second presentation (Replay) -> REJECTED
    const secondResult = vehicleVerifier.process(cmd);
    expect(secondResult.outcome).toBe("REJECTED");
    expect(secondResult.failedCheck).toBe("REPLAY");
  });

  it("Check 4 (CHAIN): Rejects commands with incorrect priorCommandHash", () => {
    const unsigned: Omit<Command, "signature"> = {
      commandId: "CMD-CHK4-01",
      vehicleId: TEST_VEHICLE_ID,
      action: "IMMOBILIZE",
      reasonCode: "loan_default",
      reasonText: "Chain check",
      issuerId: TEST_ISSUER,
      issuedAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 300000).toISOString(),
      nonce: "NONCE-CHK4-01",
      priorCommandHash: "WRONG-PRIOR-HASH-1234567890",
    };

    const signature = secureElement.sign(TEST_ISSUER, canonicalizeCommand(unsigned));
    const cmd: Command = { ...unsigned, signature };
    trackCommand(cmd);

    const result = vehicleVerifier.process(cmd);
    expect(result.outcome).toBe("REJECTED");
    expect(result.failedCheck).toBe("CHAIN");
    expect(result.detail).toContain("priorCommandHash mismatch");
  });

  it("Check 5 (MOTION INTERLOCK): Holds commands when moving, executes immediately when stationary", () => {
    const testVeh = vehicles.get(TEST_VEHICLE_ID)!;

    // Case 1: Vehicle is MOVING -> HELD
    testVeh.isMoving = true;

    const unsignedMoving: Omit<Command, "signature"> = {
      commandId: "CMD-CHK5-MOVING",
      vehicleId: TEST_VEHICLE_ID,
      action: "IMMOBILIZE",
      reasonCode: "loan_default",
      reasonText: "Motion check moving",
      issuerId: TEST_ISSUER,
      issuedAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 300000).toISOString(),
      nonce: "NONCE-CHK5-MOVING",
      priorCommandHash: vehicleVerifier.chainHeadFor(TEST_VEHICLE_ID),
    };

    const sigMoving = secureElement.sign(TEST_ISSUER, canonicalizeCommand(unsignedMoving));
    const cmdMoving: Command = { ...unsignedMoving, signature: sigMoving };
    trackCommand(cmdMoving);

    const movingResult = vehicleVerifier.process(cmdMoving);
    expect(movingResult.outcome).toBe("HELD");
    expect(movingResult.failedCheck).toBeNull();
    expect(testVeh.pendingCommand).toEqual(cmdMoving);
    expect(testVeh.immobilized).toBe(false);

    // Case 2: Vehicle STOPS -> recheckPending triggers EXECUTED
    testVeh.isMoving = false;

    const recheckResult = vehicleVerifier.recheckPending(TEST_VEHICLE_ID);
    expect(recheckResult).not.toBeNull();
    expect(recheckResult?.outcome).toBe("EXECUTED");
    expect(testVeh.immobilized).toBe(true);
    expect(testVeh.pendingCommand).toBeNull();
  });
});
