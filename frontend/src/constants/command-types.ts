export const COMMAND_TYPES = {
  IMMOBILIZE: 'immobilize',
  UNLOCK: 'unlock',
  LOCK: 'lock',
  DISABLE_CHARGING: 'disable_charging',
  ENABLE_CHARGING: 'enable_charging',
  GEOFENCE_SET: 'geofence_set',
  GEOFENCE_CLEAR: 'geofence_clear',
  SPEED_LIMIT: 'speed_limit',
  DIAGNOSTICS: 'diagnostics',
  LOCATION_TRACK: 'location_track',
  HORN: 'horn',
  LIGHTS: 'lights',
} as const;

export const COMMAND_TYPE_LABELS: Record<string, string> = {
  immobilize: 'Immobilize Vehicle',
  unlock: 'Unlock Doors',
  lock: 'Lock Doors',
  disable_charging: 'Disable Charging',
  enable_charging: 'Enable Charging',
  geofence_set: 'Set Geofence',
  geofence_clear: 'Clear Geofence',
  speed_limit: 'Set Speed Limit',
  diagnostics: 'Run Diagnostics',
  location_track: 'Track Location',
  horn: 'Sound Horn',
  lights: 'Flash Lights',
};

export const COMMAND_TYPE_ICONS: Record<string, string> = {
  immobilize: 'ShieldAlert',
  unlock: 'Unlock',
  lock: 'Lock',
  disable_charging: 'BatteryWarning',
  enable_charging: 'BatteryCharging',
  geofence_set: 'MapPin',
  geofence_clear: 'MapPinOff',
  speed_limit: 'Gauge',
  diagnostics: 'Stethoscope',
  location_track: 'Navigation',
  horn: 'Volume2',
  lights: 'Lightbulb',
};

export const COMMAND_RISK_LEVELS: Record<string, string> = {
  immobilize: 'critical',
  unlock: 'high',
  lock: 'medium',
  disable_charging: 'high',
  enable_charging: 'medium',
  geofence_set: 'medium',
  geofence_clear: 'medium',
  speed_limit: 'high',
  diagnostics: 'low',
  location_track: 'medium',
  horn: 'low',
  lights: 'low',
};
