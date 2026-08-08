import { AuditEntry, AuditBlock, ThreatEvent, Scenario } from '@/types/audit';

const generateHash = (index: number) => `e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b85${index}`;

export const mockAuditBlocks: AuditBlock[] = Array.from({ length: 8 }).map((_, i) => ({
  hash: generateHash(i + 1),
  previousHash: i === 0 ? '0000000000000000000000000000000000000000000000000000000000000000' : generateHash(i),
  timestamp: new Date(Date.now() - (7 - i) * 3600000).toISOString(),
  entries: [
    {
      id: `AE-${i}-1`,
      timestamp: new Date(Date.now() - (7 - i) * 3600000 + 1000).toISOString(),
      actorId: 'U-01',
      actorName: 'Sarah Kim (Admin)',
      action: i % 2 === 0 ? 'command_created' : 'command_approved',
      targetId: `CMD-882${i + 1}`,
      targetType: 'Command',
      details: 'Command verification log appended to hash chain ledger.',
      ipAddress: '192.168.1.100',
      status: 'success'
    },
    {
      id: `AE-${i}-2`,
      timestamp: new Date(Date.now() - (7 - i) * 3600000 + 2000).toISOString(),
      actorId: 'V-1001',
      actorName: 'Sargam Electric Rickshaw',
      action: 'vehicle_updated',
      targetId: 'V-1001',
      targetType: 'Vehicle',
      details: 'Simulated communication layer telemetry synced.',
      ipAddress: '10.0.0.5',
      status: 'success'
    }
  ],
  previousEntryHash: generateHash(i),
  validatorSignature: `sig_${i}_abc123`
}));

export const mockThreatEvents: ThreatEvent[] = [
  {
    id: 'TH-001',
    type: 'unauthorized_access',
    severity: 'high',
    timestamp: new Date(Date.now() - 86400000 * 2).toISOString(),
    vehicleId: 'V-1001',
    description: 'Invalid signature attempt detected from un-provisioned key',
    location: 'Pune, MH',
    status: 'mitigated',
    ipAddress: '198.51.100.42',
    affectedComponents: ['API Gateway']
  },
  {
    id: 'TH-002',
    type: 'replay_attack',
    severity: 'critical',
    timestamp: new Date(Date.now() - 86400000).toISOString(),
    vehicleId: 'V-1002',
    description: 'Stale nonce payload blocked by Nonce Replay Check',
    location: 'Bengaluru, KA',
    status: 'mitigated',
    ipAddress: '203.0.113.195',
    affectedComponents: ['Replay Cache']
  }
];

export const mockScenarios: Scenario[] = [
  {
    id: 'SC-01',
    name: 'Loan Default Emergency Recovery',
    description: 'Multi-signature authorized remote immobilization of a defaulted commercial EV at 0 km/h in Park state.',
    category: 'Financier Recovery',
    difficulty: 'Intermediate',
    steps: [
      { id: 'S1', title: 'Court Order Verification', description: 'Legal justification and hypothecation agreement checked.', status: 'completed' },
      { id: 'S2', title: 'Multi-signature Quorum', description: 'Dual authorization signed by Admin and Legal Officer.', status: 'completed' },
      { id: 'S3', title: 'Motion Safety Check', description: 'Vehicle telemetry verified at 0 km/h in designated Park state.', status: 'completed' },
      { id: 'S4', title: 'Execution & Hash Chain Audit', description: 'Payload dispatched to simulated vehicle layer and logged to hash chain.', status: 'completed' }
    ]
  },
  {
    id: 'SC-02',
    name: 'Replay Attack Defense',
    description: 'Attempted re-transmission of a captured immobilization command blocked by Nonce Replay Check.',
    category: 'Cybersecurity Attack',
    difficulty: 'Advanced',
    steps: [
      { id: 'S1', title: 'Captured Payload Interception', description: 'Attacker re-sends valid historical command packet.', status: 'completed' },
      { id: 'S2', title: 'Nonce & Freshness Validation', description: 'Nonce Replay Check detects duplicate payload hash and stale timestamp.', status: 'completed' },
      { id: 'S3', title: 'Immediate Command Drop', description: 'Payload rejected before reaching simulated vehicle communication layer.', status: 'completed' },
      { id: 'S4', title: 'Security Incident Logging', description: 'Threat event logged in Audit Ledger for regulatory inspection.', status: 'completed' }
    ]
  }
];
