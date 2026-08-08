import { Command, CommandType, CommandStatus, RiskLevel, VerificationStage } from '@/types/command';

export const standardVerificationStages: VerificationStage[] = [
  { id: 'stage-1', name: 'Signature Verification', status: 'passed', duration: 12, details: 'ECDSA P-256 signature verified against public key' },
  { id: 'stage-2', name: 'Freshness Check', status: 'passed', duration: 8, details: 'Timestamp within valid 30s hardware clock window' },
  { id: 'stage-3', name: 'Replay Protection', status: 'passed', duration: 15, details: 'Nonce uniqueness verified against replay cache' },
  { id: 'stage-4', name: 'Multi-signature Authorization', status: 'passed', duration: 25, details: 'Quorum signatures verified' },
  { id: 'stage-5', name: 'Motion Safety Check', status: 'passed', duration: 18, details: 'Vehicle speed verified at 0 km/h in Park state' },
  { id: 'stage-6', name: 'Vehicle Execution', status: 'passed', duration: 32, details: 'Payload dispatched to simulated vehicle communication layer' },
  { id: 'stage-7', name: 'SHA-256 Hash Chain Audit', status: 'passed', duration: 10, details: 'Appended entry to immutable hash chain ledger' },
];

export const mockCommands: Command[] = [
  {
    id: 'CMD-8821',
    type: 'immobilize',
    vehicleId: 'V-1001',
    vehicleName: 'Sargam Electric Rickshaw',
    status: 'completed',
    priority: 'critical',
    riskLevel: 'critical',
    requestedBy: 'Sarah Kim (Admin)',
    justification: 'Loan default recovery - Court Order #8821',
    legalBasis: 'Financier Hypothecation Agreement Sec 4.2',
    affectedSystems: ['Drivetrain', 'Motor Controller'],
    driverImpact: 'Vehicle motor disabled safely at 0 km/h in Park state',
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    approvedAt: new Date(Date.now() - 3600000 * 1.8).toISOString(),
    executedAt: new Date(Date.now() - 3600000 * 1.5).toISOString(),
    completedAt: new Date(Date.now() - 3600000 * 1.4).toISOString(),
    approvers: [
      { id: 'APP-1', name: 'Sarah Kim', role: 'Security Admin', avatar: 'SK', status: 'approved', timestamp: new Date(Date.now() - 3600000 * 1.9).toISOString() },
      { id: 'APP-2', name: 'David Chen', role: 'Legal Officer', avatar: 'DC', status: 'approved', timestamp: new Date(Date.now() - 3600000 * 1.8).toISOString() }
    ],
    verificationStages: standardVerificationStages,
    auditHash: '0xa8f492b0c1e84f72890a9d82e4f1a23c',
  },
  {
    id: 'CMD-8822',
    type: 'speed_limit',
    vehicleId: 'V-1002',
    vehicleName: 'Mahindra Treo',
    status: 'pending_approval',
    priority: 'high',
    riskLevel: 'high',
    requestedBy: 'Fleet Operator',
    justification: 'Geofence speed limit enforcement (20 km/h zone)',
    legalBasis: 'Municipal Transit Safety Policy #14',
    affectedSystems: ['Speed Governor', 'Throttle Controller'],
    driverImpact: 'Maximum speed restricted to 20 km/h',
    createdAt: new Date(Date.now() - 1800000).toISOString(),
    approvers: [
      { id: 'APP-1', name: 'Sarah Kim', role: 'Security Admin', avatar: 'SK', status: 'approved', timestamp: new Date(Date.now() - 1200000).toISOString() },
      { id: 'APP-3', name: 'Elena Rostova', role: 'Fleet Manager', avatar: 'ER', status: 'pending' }
    ],
    verificationStages: standardVerificationStages.map(s => s.id === 'stage-4' ? { ...s, status: 'running' } : (s.id > 'stage-4' ? { ...s, status: 'pending' } : s)),
    auditHash: '0xb7c381d9e0f24a1890b2e3f4a56c789d',
  },
  {
    id: 'CMD-8823',
    type: 'lock',
    vehicleId: 'V-1003',
    vehicleName: 'Piaggio Ape E-City',
    status: 'completed',
    priority: 'medium',
    riskLevel: 'medium',
    requestedBy: 'Rajesh Kumar (Owner)',
    justification: 'End of shift lock request',
    legalBasis: 'Owner Access Protocol',
    affectedSystems: ['Central Locking'],
    driverImpact: 'Vehicle doors and battery compartment locked',
    createdAt: new Date(Date.now() - 7200000).toISOString(),
    approvedAt: new Date(Date.now() - 7100000).toISOString(),
    executedAt: new Date(Date.now() - 7000000).toISOString(),
    completedAt: new Date(Date.now() - 6900000).toISOString(),
    approvers: [
      { id: 'APP-1', name: 'Sarah Kim', role: 'Security Admin', avatar: 'SK', status: 'approved', timestamp: new Date(Date.now() - 7100000).toISOString() }
    ],
    verificationStages: standardVerificationStages,
    auditHash: '0xc9d492e1f2b34a5890c3f4a56b7d890e',
  }
];
