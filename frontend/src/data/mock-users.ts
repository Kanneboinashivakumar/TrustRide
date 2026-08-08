import { User, TeamMember, UserRole } from '@/types/user';

export const mockUsers: User[] = [
  {
    id: 'U-01',
    name: 'Alice Admin',
    email: 'alice.admin@trustride.com',
    role: 'admin',
    organization: 'TrustRide Corp',
    avatar: 'AA',
    permissions: ['all']
  },
  {
    id: 'U-02',
    name: 'Bob Financier',
    email: 'bob.financier@chaseauto.com',
    role: 'financier',
    organization: 'Chase Auto Finance',
    avatar: 'BF',
    permissions: ['view_vehicles', 'issue_recovery_commands', 'view_analytics']
  },
  {
    id: 'U-03',
    name: 'Charlie Operator',
    email: 'charlie.ops@acmefleet.com',
    role: 'fleet_operator',
    organization: 'Acme Fleet Services',
    avatar: 'CO',
    permissions: ['view_vehicles', 'issue_basic_commands', 'view_analytics']
  },
  {
    id: 'U-04',
    name: 'Dave Driver',
    email: 'dave.driver@gmail.com',
    role: 'driver',
    organization: 'Acme Fleet Services',
    avatar: 'DD',
    permissions: ['view_assigned_vehicle', 'issue_driver_commands']
  },
  {
    id: 'U-05',
    name: 'Eve Auditor',
    email: 'eve.auditor@kpmg.com',
    role: 'auditor',
    organization: 'KPMG',
    avatar: 'EA',
    permissions: ['view_audit_logs', 'view_analytics']
  },
  {
    id: 'U-06',
    name: 'Frank Security',
    email: 'frank.sec@trustride.com',
    role: 'admin',
    organization: 'TrustRide Corp',
    avatar: 'FS',
    permissions: ['all']
  },
  {
    id: 'U-07',
    name: 'Grace Manager',
    email: 'grace.mgr@acmefleet.com',
    role: 'fleet_operator',
    organization: 'Acme Fleet Services',
    avatar: 'GM',
    permissions: ['view_vehicles', 'issue_basic_commands', 'approve_commands', 'view_analytics']
  },
  {
    id: 'U-08',
    name: 'Hank Repo',
    email: 'hank.repo@recoveryinc.com',
    role: 'financier',
    organization: 'Recovery Inc',
    avatar: 'HR',
    permissions: ['view_vehicles', 'issue_recovery_commands']
  },
  {
    id: 'U-09',
    name: 'Ivy Tester',
    email: 'ivy.test@trustride.com',
    role: 'driver',
    organization: 'TrustRide Corp',
    avatar: 'IT',
    permissions: ['view_assigned_vehicle']
  },
  {
    id: 'U-10',
    name: 'Jack Compliance',
    email: 'jack.comp@trustride.com',
    role: 'auditor',
    organization: 'TrustRide Corp',
    avatar: 'JC',
    permissions: ['view_audit_logs', 'view_analytics']
  }
];

export const mockTeamMembers: TeamMember[] = mockUsers.map(u => ({
  ...u,
  status: Math.random() > 0.2 ? 'active' : 'inactive',
  lastActive: new Date(Date.now() - Math.random() * 86400000 * 5).toISOString()
}));

export const currentUser: User = mockUsers[0];
