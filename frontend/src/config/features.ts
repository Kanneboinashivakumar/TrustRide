export const features = {
  demoMode: true,
  judgeMode: true,
  threatSandbox: true,
  analytics: true,
  driverPortal: true,
  compliance: true,
  scenarioSimulator: true,
  commandPalette: true,
  notifications: true,
  darkMode: true,
  digitalTwin: true,
  auditLedger: true,
} as const;

export function isFeatureEnabled(feature: keyof typeof features): boolean {
  return features[feature];
}
