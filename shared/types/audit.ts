export interface AuditEntry {
  id: string;
  blockIndex: number;
  hash: string;
  previousHash: string;
  timestamp: string;
  action: string;
  actor: string;
  target: string;
  details: string;
  verified: boolean;
  metadata?: Record<string, unknown>;
  location?: string;
  ipAddress?: string;
  affectedComponents?: string[];
  previousEntryHash?: string;
}

export interface AuditBlock {
  index: number;
  hash: string;
  previousHash: string;
  timestamp: string;
  entries: AuditEntry[];
  nonce: string;
}

export type ThreatType = 'mitm' | 'replay' | 'nonce_replay' | 'unauthorized_key' | 'modified_payload' | 'partial_signature' | 'gps_spoof';

export interface ThreatEvent {
  id: string;
  type: ThreatType;
  severity: 'critical' | 'high' | 'medium' | 'low';
  timestamp: string;
  source: string;
  target: string;
  detected: boolean;
  mitigated: boolean;
  description: string;
  indicators: string[];
  status: 'active' | 'mitigated' | 'investigating';
}

export interface ScenarioStep {
  id: string;
  label: string;
  description: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  duration?: number;
}

export interface Scenario {
  id: string;
  name: string;
  description: string;
  icon: string;
  severity: 'critical' | 'high' | 'medium';
  steps: ScenarioStep[];
}
