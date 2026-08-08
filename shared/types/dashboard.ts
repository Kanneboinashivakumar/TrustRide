import type { ExecutiveSummary } from './analytics';

export interface DashboardStats extends ExecutiveSummary {
  hashChainHealthy: boolean;
  replayProtectionActive: boolean;
  motionSafetyEnforced: boolean;
}
