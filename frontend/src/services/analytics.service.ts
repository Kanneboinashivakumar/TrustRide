import { mockAnalytics } from '@/data/mock-analytics';

const API_BASE = 'http://localhost:4000/api';

async function fetchAnalyticsField<T>(field: string, fallback: T): Promise<T> {
  try {
    const res = await fetch(`${API_BASE}/analytics`);
    if (!res.ok) return fallback;
    const data = await res.json();
    return (data[field] ?? fallback) as T;
  } catch {
    return fallback;
  }
}

export const analyticsService = {
  async getExecutiveSummary() {
    return fetchAnalyticsField('executiveSummary', mockAnalytics.executiveSummary);
  },
  async getFleetGrowth() {
    return fetchAnalyticsField('fleetGrowthData', mockAnalytics.fleetGrowthData);
  },
  async getCommandActivity() {
    return fetchAnalyticsField('commandActivityData', mockAnalytics.commandActivityData);
  },
  async getBatteryDistribution() {
    return fetchAnalyticsField('batteryDistributionData', mockAnalytics.batteryDistributionData);
  },
  async getThreatsByType() {
    return fetchAnalyticsField('threatsByTypeData', mockAnalytics.threatsByTypeData);
  },
  async getRiskScores() {
    return fetchAnalyticsField('complianceScoreData', mockAnalytics.complianceScoreData);
  },
  async getComplianceScores() {
    return fetchAnalyticsField('complianceScoreData', mockAnalytics.complianceScoreData);
  },
  async getVehicleStatusDistribution() {
    return fetchAnalyticsField('vehicleStatusDistribution', mockAnalytics.vehicleStatusDistribution);
  },
  async getApprovalTimes() {
    return fetchAnalyticsField('approvalTimeData', mockAnalytics.approvalTimeData);
  },
};
