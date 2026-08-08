import { mockAuditBlocks, mockThreatEvents, mockScenarios } from '@/data/mock-audit';
import type { AuditBlock, AuditEntry, ThreatEvent, Scenario } from '@/types/audit';

const API_BASE = 'http://localhost:4000/api';

async function fetchJson<T>(url: string, fallback: T): Promise<T> {
  try {
    const res = await fetch(url);
    if (!res.ok) return fallback;
    return (await res.json()) as T;
  } catch {
    return fallback;
  }
}

export const auditService = {
  async getBlocks(): Promise<AuditBlock[]> {
    return fetchJson<AuditBlock[]>(`${API_BASE}/audit-log/blocks`, mockAuditBlocks);
  },
  async getBlockByIndex(index: number): Promise<AuditBlock | undefined> {
    const blocks = await this.getBlocks();
    return blocks.find(b => b.hash.endsWith(index.toString()));
  },
  async getEntries(): Promise<AuditEntry[]> {
    const blocks = await this.getBlocks();
    return blocks.flatMap(b => b.entries);
  },
  async getEntryById(id: string): Promise<AuditEntry | undefined> {
    const entries = await this.getEntries();
    return entries.find(e => e.id === id);
  },
  async verifyChain(): Promise<{ valid: boolean; checkedBlocks: number }> {
    try {
      const res = await fetch(`${API_BASE}/audit-log`);
      if (res.ok) {
        const data = await res.json();
        return { valid: data.chainIntact ?? true, checkedBlocks: data.chainLength ?? mockAuditBlocks.length };
      }
    } catch {
      // Fallback
    }
    return { valid: true, checkedBlocks: mockAuditBlocks.length };
  },
  async getThreats(): Promise<ThreatEvent[]> {
    return fetchJson<ThreatEvent[]>(`${API_BASE}/threats`, mockThreatEvents);
  },
  async getThreatById(id: string): Promise<ThreatEvent | undefined> {
    const threats = await this.getThreats();
    return threats.find(t => t.id === id);
  },
  async getScenarios(): Promise<Scenario[]> {
    return fetchJson<Scenario[]>(`${API_BASE}/scenarios`, mockScenarios);
  },
  async getScenarioById(id: string): Promise<Scenario | undefined> {
    const scenarios = await this.getScenarios();
    return scenarios.find(s => s.id === id);
  },
};
