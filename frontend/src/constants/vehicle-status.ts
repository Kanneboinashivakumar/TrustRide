export const VEHICLE_STATUS = {
  ACTIVE: 'active',
  IDLE: 'idle',
  CHARGING: 'charging',
  MAINTENANCE: 'maintenance',
  DISABLED: 'disabled',
  OFFLINE: 'offline',
} as const;

export const VEHICLE_STATUS_LABELS: Record<string, string> = {
  active: 'Active',
  idle: 'Idle',
  charging: 'Charging',
  maintenance: 'Maintenance',
  disabled: 'Disabled',
  offline: 'Offline',
};

export const VEHICLE_STATUS_COLORS: Record<string, string> = {
  active: 'bg-green-100 text-green-700',
  idle: 'bg-slate-100 text-slate-700',
  charging: 'bg-blue-100 text-blue-700',
  maintenance: 'bg-amber-100 text-amber-700',
  disabled: 'bg-red-100 text-red-700',
  offline: 'bg-zinc-100 text-zinc-700',
};

export const VEHICLE_STATUS_ICONS: Record<string, string> = {
  active: 'Activity',
  idle: 'Pause',
  charging: 'Zap',
  maintenance: 'Wrench',
  disabled: 'Ban',
  offline: 'WifiOff',
};
