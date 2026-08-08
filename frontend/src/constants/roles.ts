export const ROLES = {
  ADMIN: 'admin',
  FINANCIER: 'financier',
  FLEET_OPERATOR: 'fleet_operator',
  DRIVER: 'driver',
  AUDITOR: 'auditor',
  REGULATOR: 'regulator',
  OEM: 'oem',
} as const;

export const ROLE_LABELS: Record<string, string> = {
  admin: 'Administrator',
  financier: 'Financier',
  fleet_operator: 'Fleet Operator',
  driver: 'Driver',
  auditor: 'Auditor',
  regulator: 'Regulator',
  oem: 'OEM Partner',
};

export const ROLE_COLORS: Record<string, string> = {
  admin: 'bg-purple-100 text-purple-700',
  financier: 'bg-blue-100 text-blue-700',
  fleet_operator: 'bg-emerald-100 text-emerald-700',
  driver: 'bg-amber-100 text-amber-700',
  auditor: 'bg-cyan-100 text-cyan-700',
  regulator: 'bg-red-100 text-red-700',
  oem: 'bg-indigo-100 text-indigo-700',
};
