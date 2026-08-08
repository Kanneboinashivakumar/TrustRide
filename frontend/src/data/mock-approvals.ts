import { ApprovalRequest, ApprovalComment } from '@/types/command';
import { mockCommands } from './mock-commands';

export const mockApprovalRequests: ApprovalRequest[] = [
  {
    id: 'AR-101',
    commandId: 'CMD-9002',
    command: mockCommands.find(c => c.id === 'CMD-9002')!,
    status: 'pending',
    urgency: 'medium',
    requiredSignatures: 2,
    currentSignatures: 0,
    requestedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    expiresAt: new Date(Date.now() + 86400000 * 2).toISOString(),
    comments: [
      {
        id: 'C-1',
        authorId: 'U-03',
        authorName: 'Charlie Operator',
        content: 'Setting speed limit for new probationary driver per policy.',
        timestamp: new Date(Date.now() - 3600000 * 2).toISOString()
      }
    ]
  },
  {
    id: 'AR-102',
    commandId: 'CMD-9011',
    command: mockCommands.find(c => c.id === 'CMD-9011')!,
    status: 'partially_approved',
    urgency: 'critical',
    requiredSignatures: 3,
    currentSignatures: 1,
    requestedAt: new Date(Date.now() - 86400000).toISOString(),
    expiresAt: new Date(Date.now() + 86400000).toISOString(),
    comments: [
      {
        id: 'C-2',
        authorId: 'U-02',
        authorName: 'Bob Financier',
        content: 'Account is 90 days delinquent. Notice of intent to repo sent 30 days ago. Proceeding with immobilization.',
        timestamp: new Date(Date.now() - 86400000).toISOString()
      },
      {
        id: 'C-3',
        authorId: 'U-03',
        authorName: 'Charlie Operator',
        content: 'Reviewed. Vehicle is currently parked at home address. Approving from fleet side.',
        timestamp: new Date(Date.now() - 43200000).toISOString()
      }
    ]
  },
  {
    id: 'AR-103',
    commandId: 'CMD-9009',
    command: mockCommands.find(c => c.id === 'CMD-9009')!,
    status: 'pending',
    urgency: 'low',
    requiredSignatures: 1,
    currentSignatures: 0,
    requestedAt: new Date(Date.now() - 7200000).toISOString(),
    expiresAt: new Date(Date.now() + 86400000).toISOString(),
    comments: [
      {
        id: 'C-4',
        authorId: 'U-05',
        authorName: 'Eve Auditor',
        content: 'Need to pull extended diagnostic logs for Q3 compliance report.',
        timestamp: new Date(Date.now() - 7200000).toISOString()
      }
    ]
  },
  {
    id: 'AR-104',
    commandId: 'CMD-9004',
    command: mockCommands.find(c => c.id === 'CMD-9004')!,
    status: 'approved',
    urgency: 'high',
    requiredSignatures: 1,
    currentSignatures: 1,
    requestedAt: new Date(Date.now() - 3600000 * 4).toISOString(),
    expiresAt: new Date(Date.now() + 86400000).toISOString(),
    comments: [
      {
        id: 'C-5',
        authorId: 'U-02',
        authorName: 'Bob Financier',
        content: 'Vehicle V-1011 missed payments. Need location to dispatch agent.',
        timestamp: new Date(Date.now() - 3600000 * 4).toISOString()
      },
      {
        id: 'C-6',
        authorId: 'U-01',
        authorName: 'Alice Admin',
        content: 'Approved. Legal basis verified.',
        timestamp: new Date(Date.now() - 1800000).toISOString()
      }
    ]
  },
  {
    id: 'AR-105',
    commandId: 'CMD-9005',
    command: mockCommands.find(c => c.id === 'CMD-9005')!,
    status: 'rejected',
    urgency: 'medium',
    requiredSignatures: 1,
    currentSignatures: 0,
    requestedAt: new Date(Date.now() - 172800000).toISOString(),
    expiresAt: new Date(Date.now() - 86400000).toISOString(),
    comments: [
      {
        id: 'C-7',
        authorId: 'U-04',
        authorName: 'Dave Driver',
        content: 'Locked my keys in the car while at the rest stop. Please unlock.',
        timestamp: new Date(Date.now() - 172800000).toISOString()
      },
      {
        id: 'C-8',
        authorId: 'U-03',
        authorName: 'Charlie Operator',
        content: 'Denying this request as the origin IP does not match the driver\'s registered device. Protocol requires voice verification.',
        timestamp: new Date(Date.now() - 170000000).toISOString()
      }
    ]
  },
  {
    id: 'AR-106',
    commandId: 'CMD-9012',
    command: mockCommands.find(c => c.id === 'CMD-9012')!,
    status: 'approved',
    urgency: 'medium',
    requiredSignatures: 1,
    currentSignatures: 1,
    requestedAt: new Date(Date.now() - 120000).toISOString(),
    expiresAt: new Date(Date.now() + 3600000).toISOString(),
    comments: [
      {
        id: 'C-9',
        authorId: 'U-03',
        authorName: 'Charlie Operator',
        content: 'Mobile mechanic is on site, needs access to cabin.',
        timestamp: new Date(Date.now() - 120000).toISOString()
      },
      {
        id: 'C-10',
        authorId: 'U-01',
        authorName: 'Alice Admin',
        content: 'Approved. Work order #WO-5542 verified.',
        timestamp: new Date(Date.now() - 60000).toISOString()
      }
    ]
  }
];
