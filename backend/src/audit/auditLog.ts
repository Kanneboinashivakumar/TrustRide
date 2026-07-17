/**
 * Tamper-evident, hash-chained audit log.
 *
 * Every entry's hash covers its own fields PLUS the previous entry's hash, so
 * editing any historical entry breaks every link after it. This is the demo's
 * centerpiece: `tamperForDemo()` mutates one entry WITHOUT recomputing hashes,
 * and `verifyChain()` then visibly reports the break. `restoreTamperedEntries()`
 * undoes the tampering so the demo can be repeated.
 */
import { randomUUID } from "node:crypto";
import { sha256Hex } from "../crypto/canonical.js";
import type { AuditLogEntry, AuditEventType } from "../models/types.js";

const GENESIS_HASH = "0".repeat(64);

/** What each entry's hash commits to: its own fields + the previous hash. */
function computeEntryHash(
  e: Omit<AuditLogEntry, "entryHash">
): string {
  return sha256Hex(
    [e.entryId, e.timestamp, e.commandId, e.eventType, e.detail, e.previousEntryHash].join("|")
  );
}

export interface VerifiedEntry extends AuditLogEntry {
  valid: boolean;         // this entry's stored hash matches its recomputed hash
  linkIntact: boolean;    // previousEntryHash matches the actual previous entry
}

class AuditLog {
  private entries: AuditLogEntry[] = [];
  /** originals of tampered entries, keyed by entryId, so the demo is reversible */
  private tamperBackups = new Map<string, AuditLogEntry>();

  append(commandId: string, eventType: AuditEventType, detail: string): AuditLogEntry {
    const previousEntryHash =
      this.entries.length === 0
        ? GENESIS_HASH
        : this.entries[this.entries.length - 1].entryHash;
    const partial = {
      entryId: randomUUID(),
      timestamp: new Date().toISOString(),
      commandId,
      eventType,
      detail,
      previousEntryHash,
    };
    const entry: AuditLogEntry = { ...partial, entryHash: computeEntryHash(partial) };
    this.entries.push(entry);
    return entry;
  }

  /** Recompute every hash and link; annotate each entry with validity. */
  verifyChain(): { chainIntact: boolean; firstBrokenIndex: number | null; entries: VerifiedEntry[] } {
    // 1. Mark each entry as valid/invalid based on its recomputed hash
    const verified = this.entries.map((e, i) => {
      const recomputed = computeEntryHash(e);
      const valid = recomputed === e.entryHash;
      
      const prevEntry = i === 0 ? null : this.entries.slice(0, i).find(prev => prev.entryHash === e.previousEntryHash);
      const linkIntact =
        i === 0
          ? e.previousEntryHash === GENESIS_HASH
          : prevEntry !== undefined;
      return { ...e, valid, linkIntact };
    });

    // 2. Traversal verification from the last entry back to Genesis
    let chainIntact = true;
    let firstBrokenIndex: number | null = null;

    if (this.entries.length > 0) {
      let currentHash = this.entries[this.entries.length - 1].entryHash;
      const visited = new Set<string>();

      while (currentHash !== GENESIS_HASH) {
        if (visited.has(currentHash)) {
          // Circular reference loop detected
          chainIntact = false;
          break;
        }
        visited.add(currentHash);

        const node = this.entries.find(e => e.entryHash === currentHash);
        if (!node) {
          chainIntact = false;
          break;
        }

        const recomputed = computeEntryHash(node);
        if (recomputed !== node.entryHash) {
          chainIntact = false;
          break;
        }

        currentHash = node.previousEntryHash;
      }

      // If the active main chain is not intact, identify the chronologically first broken index
      if (!chainIntact) {
        for (let i = 0; i < verified.length; i++) {
          if (!verified[i].valid || !verified[i].linkIntact) {
            firstBrokenIndex = i;
            break;
          }
        }
      }
    }

    return { chainIntact, firstBrokenIndex, entries: verified };
  }

  /**
   * DEMO-ONLY: mutate one entry's `detail` without recomputing its hash —
   * exactly what an attacker with database access would do. Returns the entry.
   * If no entryId given, tampers a middle entry (better visual: break mid-chain).
   */
  tamperForDemo(entryId?: string, newDetail?: string): AuditLogEntry | null {
    if (this.entries.length === 0) return null;
    const target = entryId
      ? this.entries.find((e) => e.entryId === entryId)
      : this.entries[Math.floor(this.entries.length / 2)];
    if (!target) return null;
    if (!this.tamperBackups.has(target.entryId)) {
      this.tamperBackups.set(target.entryId, { ...target });
    }
    target.detail =
      newDetail ??
      `【TAMPERED】 ${target.detail} (edited post-hoc — hash NOT recomputed)`;
    return target;
  }

  /** DEMO-ONLY: append corrective entry to bypass tampered blocks, keeping evidence visible. */
  restoreTamperedEntries(): number {
    const { firstBrokenIndex } = this.verifyChain();
    if (firstBrokenIndex === null) {
      if (this.tamperBackups.size === 0) return 0;
      this.tamperBackups.clear();
      return 0;
    }

    const lastValidHash =
      firstBrokenIndex === 0
        ? GENESIS_HASH
        : this.entries[firstBrokenIndex - 1].entryHash;

    const commandId = this.entries[firstBrokenIndex].commandId;

    // Append a new corrective log entry that points directly to the last valid hash
    const partial = {
      entryId: randomUUID(),
      timestamp: new Date().toISOString(),
      commandId,
      eventType: "ACKNOWLEDGED" as const,
      detail: `[RESTORATION] Chain integrity recovered. Bypassed tampered block ${firstBrokenIndex} by pointing corrective record to last valid block hash (${lastValidHash.slice(0, 12)}…).`,
      previousEntryHash: lastValidHash,
    };
    const entry: AuditLogEntry = { ...partial, entryHash: computeEntryHash(partial) };
    this.entries.push(entry);

    this.tamperBackups.clear();
    return 1;
  }

  all(): AuditLogEntry[] {
    return [...this.entries];
  }
}

/** Singleton audit log for the demo process. */
export const auditLog = new AuditLog();
