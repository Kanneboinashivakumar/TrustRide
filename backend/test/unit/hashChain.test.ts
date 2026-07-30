import { describe, it, expect } from "vitest";
import { auditLog } from "../../src/audit/auditLog.js";

describe("Tamper-Evident SHA-256 Audit Hash Chain Unit Tests", () => {
  const GENESIS_HASH = "0".repeat(64);

  it("genesis entry points to 64 zero-hex string and computes valid initial entry hash", () => {
    // Append genesis entry
    const genesisEntry = auditLog.append("CMD-GENESIS-TEST", "DISPATCHED", "Initial system genesis log entry");
    
    expect(genesisEntry.previousEntryHash).toBe(GENESIS_HASH);
    expect(genesisEntry.entryHash).toBeDefined();
    expect(genesisEntry.entryHash.length).toBe(64);

    const { chainIntact, entries } = auditLog.verifyChain();
    expect(chainIntact).toBe(true);
    
    const verifiedGenesis = entries.find(e => e.entryId === genesisEntry.entryId);
    expect(verifiedGenesis?.valid).toBe(true);
    expect(verifiedGenesis?.linkIntact).toBe(true);
  });

  it("chain-linking links every subsequent entry to the previous entry's hash", () => {
    const entry1 = auditLog.append("CMD-CHAIN-1", "DISPATCHED", "First entry");
    const entry2 = auditLog.append("CMD-CHAIN-2", "HELD", "Second entry");
    const entry3 = auditLog.append("CMD-CHAIN-3", "EXECUTED", "Third entry");

    expect(entry2.previousEntryHash).toBe(entry1.entryHash);
    expect(entry3.previousEntryHash).toBe(entry2.entryHash);

    const { chainIntact } = auditLog.verifyChain();
    expect(chainIntact).toBe(true);
  });

  it("detects a single-byte change in historical entry detail and identifies broken index", () => {
    auditLog.append("CMD-TAMPER-1", "DISPATCHED", "Pre-tamper 1");
    const e2 = auditLog.append("CMD-TAMPER-2", "DISPATCHED", "Pre-tamper 2");
    auditLog.append("CMD-TAMPER-3", "DISPATCHED", "Pre-tamper 3");

    // Pre-tamper status: intact
    const beforeTamper = auditLog.verifyChain();
    expect(beforeTamper.chainIntact).toBe(true);

    // Perform single-byte modification directly on e2's detail field
    const originalDetail = e2.detail;
    e2.detail = originalDetail + "X"; // 1 byte addition

    // Verification must fail immediately
    const afterTamper = auditLog.verifyChain();
    expect(afterTamper.chainIntact).toBe(false);
    expect(afterTamper.firstBrokenIndex).not.toBeNull();
    
    const brokenIndex = afterTamper.firstBrokenIndex!;
    expect(afterTamper.entries[brokenIndex].entryId).toBe(e2.entryId);
    expect(afterTamper.entries[brokenIndex].valid).toBe(false);

    // Revert manual single-byte change for downstream test stability
    e2.detail = originalDetail;
    const restoredManual = auditLog.verifyChain();
    expect(restoredManual.chainIntact).toBe(true);
  });

  it("tamperForDemo and restoreTamperedEntries cycle operates as expected", () => {
    // Apply tamper demo
    const tampered = auditLog.tamperForDemo();
    expect(tampered).not.toBeNull();

    const tamperedStatus = auditLog.verifyChain();
    expect(tamperedStatus.chainIntact).toBe(false);

    // Restore entries via corrective ledger append
    const restoredCount = auditLog.restoreTamperedEntries();
    expect(restoredCount).toBe(1);

    const restoredStatus = auditLog.verifyChain();
    expect(restoredStatus.chainIntact).toBe(true);
  });
});
