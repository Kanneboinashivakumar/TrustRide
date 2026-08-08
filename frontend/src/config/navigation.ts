import { ROUTES } from './routes';

export interface NavItem {
  id: string;
  label: string;
  path: string;
  icon: string;
  badge?: string | number;
}

export interface NavGroup {
  id: string;
  label: string;
  items: NavItem[];
}

export const NAVIGATION_GROUPS: NavGroup[] = [
  {
    id: 'overview',
    label: 'OVERVIEW',
    items: [
      { id: 'dashboard', label: 'Dashboard', path: ROUTES.DASHBOARD, icon: 'LayoutDashboard' },
    ],
  },
  {
    id: 'operations',
    label: 'OPERATIONS',
    items: [
      { id: 'fleet', label: 'Fleet Management', path: ROUTES.FLEET, icon: 'Car' },
      { id: 'digital-twin', label: 'Digital Twin', path: ROUTES.DIGITAL_TWIN, icon: 'Map' },
      { id: 'command-center', label: 'Command Center', path: ROUTES.COMMAND_CENTER, icon: 'Terminal' },
      { id: 'approvals', label: 'Approval Center', path: ROUTES.APPROVALS, icon: 'CheckCircle2', badge: 3 },
    ],
  },
  {
    id: 'security',
    label: 'SECURITY',
    items: [
      { id: 'threat-sandbox', label: 'Threat Sandbox', path: ROUTES.THREAT_SANDBOX, icon: 'ShieldAlert' },
      { id: 'verification', label: 'Verification Pipeline', path: ROUTES.VERIFICATION, icon: 'GitBranch' },
      { id: 'audit', label: 'Audit Ledger', path: ROUTES.AUDIT, icon: 'FileCheck' },
    ],
  },
  {
    id: 'insights',
    label: 'INSIGHTS',
    items: [
      { id: 'analytics', label: 'Analytics', path: ROUTES.ANALYTICS, icon: 'BarChart3' },
      { id: 'compliance', label: 'Compliance', path: ROUTES.COMPLIANCE, icon: 'Scale' },
    ],
  },
  {
    id: 'people',
    label: 'PEOPLE',
    items: [
      { id: 'driver-portal', label: 'Driver Portal', path: ROUTES.DRIVER_PORTAL, icon: 'Users' },
      { id: 'organization', label: 'Organization', path: ROUTES.ORGANIZATION, icon: 'Building2' },
    ],
  },
  {
    id: 'simulation',
    label: 'SIMULATION',
    items: [
      { id: 'scenario-simulator', label: 'Scenario Simulator', path: ROUTES.SCENARIO_SIMULATOR, icon: 'Play' },
    ],
  },
  {
    id: 'administration',
    label: 'ADMINISTRATION',
    items: [
      { id: 'settings', label: 'Settings', path: ROUTES.SETTINGS, icon: 'Settings' },
      { id: 'notifications', label: 'Activity Center', path: ROUTES.NOTIFICATIONS, icon: 'Bell', badge: 12 },
    ],
  },
  {
    id: 'system',
    label: 'SYSTEM',
    items: [
      { id: 'help', label: 'Help Center', path: ROUTES.HELP, icon: 'HelpCircle' },
      { id: 'release-notes', label: 'Release Notes', path: ROUTES.RELEASE_NOTES, icon: 'FileText' },
    ],
  },
];
