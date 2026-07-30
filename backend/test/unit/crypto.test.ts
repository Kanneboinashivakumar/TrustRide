import { describe, it, expect, beforeEach } from "vitest";
import { secureElement, verifySignature } from "../../src/crypto/secureElement.js";
import { canonicalizeCommand, sha256Hex, commandHash } from "../../src/crypto/canonical.js";
import type { Command } from "../../src/models/types.js";

describe("Crypto Module Unit Tests", () => {
  const ISSUER_ID = "fin-test-001";
  const ISSUER_LABEL = "Test Financier HSM";

  beforeEach(() => {
    secureElement.provision(ISSUER_ID, ISSUER_LABEL);
  });

  it("provisions an ECDSA P-256 key pair and exports a valid PEM public key", () => {
    const pubKeyPem = secureElement.getPublicKeyPem(ISSUER_ID);
    expect(pubKeyPem).toContain("-----BEGIN PUBLIC KEY-----");
    expect(pubKeyPem).toContain("-----END PUBLIC KEY-----");
  });

  it("signing produces a valid signature that verifies successfully", () => {
    const testCmd: Omit<Command, "signature"> = {
      commandId: "CMD-UNIT-001",
      vehicleId: "TR-101",
      action: "IMMOBILIZE",
      reasonCode: "loan_default",
      reasonText: "Unit test authorization",
      issuerId: ISSUER_ID,
      issuedAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 300000).toISOString(),
      nonce: "NONCE-001",
      priorCommandHash: "GENESIS",
    };

    const payload = canonicalizeCommand(testCmd);
    const signature = secureElement.sign(ISSUER_ID, payload);
    expect(signature).toBeDefined();
    expect(signature.length).toBeGreaterThan(30);

    const pubKeyPem = secureElement.getPublicKeyPem(ISSUER_ID);
    const isValid = verifySignature(pubKeyPem, payload, signature);
    expect(isValid).toBe(true);
  });

  it("verification correctly rejects a signature if a single field changes", () => {
    const originalCmd: Omit<Command, "signature"> = {
      commandId: "CMD-UNIT-002",
      vehicleId: "TR-101",
      action: "IMMOBILIZE",
      reasonCode: "loan_default",
      reasonText: "Original payload",
      issuerId: ISSUER_ID,
      issuedAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 300000).toISOString(),
      nonce: "NONCE-002",
      priorCommandHash: "GENESIS",
    };

    const payload = canonicalizeCommand(originalCmd);
    const signature = secureElement.sign(ISSUER_ID, payload);
    const pubKeyPem = secureElement.getPublicKeyPem(ISSUER_ID);

    // 1. Mutate action (IMMOBILIZE -> CANCEL)
    const mutatedActionCmd = { ...originalCmd, action: "CANCEL" as const };
    const mutatedActionPayload = canonicalizeCommand(mutatedActionCmd);
    expect(verifySignature(pubKeyPem, mutatedActionPayload, signature)).toBe(false);

    // 2. Mutate vehicleId
    const mutatedVehicleCmd = { ...originalCmd, vehicleId: "TR-999" };
    expect(verifySignature(pubKeyPem, canonicalizeCommand(mutatedVehicleCmd), signature)).toBe(false);

    // 3. Mutate nonce
    const mutatedNonceCmd = { ...originalCmd, nonce: "TAMPERED-NONCE" };
    expect(verifySignature(pubKeyPem, canonicalizeCommand(mutatedNonceCmd), signature)).toBe(false);

    // 4. Mutate expiration
    const mutatedExpiryCmd = { ...originalCmd, expiresAt: new Date(Date.now() + 600000).toISOString() };
    expect(verifySignature(pubKeyPem, canonicalizeCommand(mutatedExpiryCmd), signature)).toBe(false);
  });

  it("rejects a malformed or wrong-length public key gracefully without throwing", () => {
    const payload = "TEST-PAYLOAD";
    const signature = "dGVzdC1zaWduYXR1cmU="; // mock base64

    // 1. Invalid PEM format
    const invalidPem = "NOT-A-REAL-PUBLIC-KEY-PEM";
    expect(verifySignature(invalidPem, payload, signature)).toBe(false);

    // 2. Corrupted PEM header
    const corruptedPem = "-----BEGIN PUBLIC KEY-----\ncorrupted_data\n-----END PUBLIC KEY-----";
    expect(verifySignature(corruptedPem, payload, signature)).toBe(false);

    // 3. Truncated key string
    const truncatedKey = secureElement.getPublicKeyPem(ISSUER_ID).slice(0, 30);
    expect(verifySignature(truncatedKey, payload, signature)).toBe(false);
  });

  it("maintains strict canonical field order during serialization", () => {
    const cmd: Omit<Command, "signature"> = {
      commandId: "CMD-ORDER-TEST",
      vehicleId: "TR-102",
      action: "IMMOBILIZE",
      reasonCode: "theft",
      reasonText: "Geofence violation theft report",
      issuerId: ISSUER_ID,
      issuedAt: "2026-07-27T12:00:00.000Z",
      expiresAt: "2026-07-27T12:05:00.000Z",
      nonce: "NONCE-ORDER-01",
      priorCommandHash: "HASH-12345",
    };

    const canonical = canonicalizeCommand(cmd);
    const parsed = JSON.parse(canonical);
    expect(parsed).toEqual([
      "CMD-ORDER-TEST",
      "TR-102",
      "IMMOBILIZE",
      "theft",
      "Geofence violation theft report",
      ISSUER_ID,
      "2026-07-27T12:00:00.000Z",
      "2026-07-27T12:05:00.000Z",
      "NONCE-ORDER-01",
      "HASH-12345",
    ]);
  });

  it("commandHash includes both canonical payload and signature digest", () => {
    const fullCmd: Command = {
      commandId: "CMD-HASH-TEST",
      vehicleId: "TR-101",
      action: "IMMOBILIZE",
      reasonCode: "loan_default",
      reasonText: "Hash check",
      issuerId: ISSUER_ID,
      issuedAt: "2026-07-27T12:00:00.000Z",
      expiresAt: "2026-07-27T12:05:00.000Z",
      nonce: "NONCE-HASH-01",
      priorCommandHash: "GENESIS",
      signature: "SIG-BASE64-MOCK",
    };

    const expectedHash = sha256Hex(canonicalizeCommand(fullCmd) + "|SIG-BASE64-MOCK");
    expect(commandHash(fullCmd)).toBe(expectedHash);
  });

  it("throws an explicit error when attempting to sign with an unprovisioned key", () => {
    expect(() => secureElement.sign("unknown-issuer", "payload")).toThrow(
      "SecureElement: no key provisioned for 'unknown-issuer'"
    );
  });
});
