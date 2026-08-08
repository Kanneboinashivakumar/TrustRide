export type CommandType = 'immobilize' | 'unlock' | 'lock' | 'disable_charging' | 'enable_charging' | 'geofence_set' | 'geofence_clear' | 'speed_limit' | 'diagnostics' | 'location_track' | 'horn' | 'lights';
export type CommandStatus = 'draft' | 'pending_approval' | 'approved' | 'rejected' | 'dispatched' | 'executing' | 'completed' | 'failed' | 'cancelled' | 'HELD' | 'AWAITING_COSIGN';
export type RiskLevel = 'low' | 'medium' | 'high' | 'critical';

export interface Approver {
  id: string;
  name: string;
  role: string;
  avatar: string;
  status: 'pending' | 'approved' | 'rejected';
  timestamp?: string;
  comment?: string;
}

export interface VerificationStage {
  id: string;
  name: string;
  status: 'pending' | 'running' | 'passed' | 'failed';
  duration?: number;
  details?: string;
}

export interface Command {
  id: string;
  type: CommandType;
  vehicleId: string;
  vehicleName: string;
  status: CommandStatus;
  priority: 'critical' | 'high' | 'medium' | 'low';
  riskLevel: RiskLevel;
  requestedBy: string;
  justification: string;
  legalBasis: string;
  affectedSystems: string[];
  driverImpact: string;
  createdAt: string;
  approvedAt?: string;
  executedAt?: string;
  completedAt?: string;
  approvers: Approver[];
  verificationStages: VerificationStage[];
  auditHash: string;
}

export interface ApprovalRequest {
  id: string;
  commandId: string;
  command: Command;
  requestedBy: string;
  requestedAt: string;
  urgency: 'critical' | 'high' | 'medium';
  requiredSignatures: number;
  currentSignatures: number;
  status: 'pending' | 'approved' | 'rejected';
  comments: Array<{
    id: string;
    userId: string;
    userName: string;
    userAvatar: string;
    content: string;
    timestamp: string;
  }>;
}
