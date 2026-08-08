export type CommandType =
  | 'immobilize'
  | 'unlock'
  | 'lock'
  | 'disable_charging'
  | 'enable_charging'
  | 'geofence_set'
  | 'geofence_clear'
  | 'speed_limit'
  | 'diagnostics'
  | 'location_track'
  | 'horn'
  | 'lights';

export type CommandStatus =
  | 'draft'
  | 'pending_approval'
  | 'approved'
  | 'rejected'
  | 'dispatched'
  | 'executing'
  | 'completed'
  | 'failed'
  | 'cancelled';

export type RiskLevel = 'low' | 'medium' | 'high' | 'critical';

export interface Approver {
  id: string;
  name: string;
  role: string;
  avatar?: string;
  status?: 'pending' | 'approved' | 'rejected';
  hasApproved?: boolean;
  approvedAt?: string;
  timestamp?: string;
  comment?: string;
}

export interface VerificationStage {
  id?: string;
  name: string;
  label?: string;
  type?: string;
  status: 'pending' | 'running' | 'passed' | 'failed' | 'completed';
  duration?: number;
  details?: string;
  timestamp?: string;
}

export interface Command {
  id: string;
  type: CommandType;
  vehicleId: string;
  vehicleName?: string;
  status: CommandStatus;
  priority?: 'critical' | 'high' | 'medium' | 'low';
  riskLevel: RiskLevel;
  requestedBy?: string;
  issuerId?: string;
  issuerName?: string;
  justification: string;
  legalBasis: string;
  affectedSystems: string[];
  driverImpact: string;
  createdAt: string;
  approvedAt?: string;
  executedAt?: string;
  completedAt?: string;
  expiresAt?: string;
  approvers: Approver[];
  verificationStages: VerificationStage[];
  auditHash?: string;
  rejectionReason?: string;
  parameters?: Record<string, any>;
}

export interface ApprovalComment {
  id: string;
  userId?: string;
  authorId?: string;
  authorName?: string;
  userName?: string;
  userAvatar?: string;
  content: string;
  timestamp: string;
}

export interface ApprovalRequest {
  id: string;
  commandId: string;
  command: Command;
  requestedBy?: string;
  requestedAt: string;
  expiresAt?: string;
  urgency: 'critical' | 'high' | 'medium' | 'low';
  requiredSignatures: number;
  currentSignatures: number;
  status: 'pending' | 'approved' | 'rejected' | 'partially_approved';
  comments: ApprovalComment[];
}
