export interface AuditEntry {
  id: string;
  blockIndex?: number;
  hash?: string;
  previousHash?: string;
  timestamp: string;
  action: string;
  actor?: string;
  actorId?: string;
  actorName?: string;
  target?: string;
  targetId?: string;
  targetType?: string;
  details: string;
  verified?: boolean;
  metadata?: Record<string, any>;
  ipAddress?: string;
  status?: string;
}

export interface AuditBlock {
  index?: number;
  hash: string;
  previousHash: string;
  timestamp: string;
  entries: AuditEntry[];
  entryCount?: number;
  nonce?: number;
  previousEntryHash?: string;
  validatorSignature?: string;
}

export type ThreatType =
  | 'mitm'
  | 'replay'
  | 'replay_attack'
  | 'nonce_replay'
  | 'unauthorized_key'
  | 'modified_payload'
  | 'partial_signature'
  | 'gps_spoofing'
  | 'unauthorized_access'
  | 'malware_signature'
  | 'physical_tampering';

export interface ThreatEvent {
  id: string;
  type: ThreatType;
  severity: 'critical' | 'high' | 'medium' | 'low';
  timestamp: string;
  source?: string;
  target?: string;
  vehicleId?: string;
  detected?: boolean;
  mitigated?: boolean;
  mitigationDetails?: string;
  description: string;
  location?: string;
  ipAddress?: string;
  affectedComponents?: string[];
  indicators?: string[];
  status?: string;
}

export interface ScenarioStep {
  id: string;
  label?: string;
  title?: string;
  description: string;
  status?: 'pending' | 'running' | 'completed' | 'failed';
  duration?: number;
}

export interface Scenario {
  id: string;
  name?: string;
  title?: string;
  description: string;
  icon?: string;
  severity?: 'critical' | 'high' | 'medium';
  category?: string;
  difficulty?: string;
  steps: ScenarioStep[];
}
