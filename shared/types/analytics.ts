export interface ExecutiveSummary {
  totalVehicles: number;
  activeCommands: number;
  pendingApprovals: number;
  threatScore: number;
  complianceScore: number;
  fleetUptime: number;
  commandsToday: number;
  driversOnline: number;
}

export interface FleetGrowthItem {
  month: string;
  vehicles: number;
  active: number;
}

export interface CommandActivityItem {
  date: string;
  commands: number;
  approved: number;
  rejected: number;
}

export interface BatteryDistributionItem {
  range: string;
  count: number;
}

export interface ThreatByTypeItem {
  type: string;
  count: number;
  detected: number;
  mitigated: number;
}

export interface ComplianceScoreItem {
  standard: string;
  score: number;
  status: string;
}

export interface VehicleStatusDistributionItem {
  status: string;
  count: number;
}

export interface ApprovalTimeItem {
  day: string;
  avgMinutes: number;
}

export interface AnalyticsData {
  executiveSummary: ExecutiveSummary;
  fleetGrowthData: FleetGrowthItem[];
  commandActivityData: CommandActivityItem[];
  batteryDistributionData: BatteryDistributionItem[];
  threatsByTypeData: ThreatByTypeItem[];
  complianceScoreData: ComplianceScoreItem[];
  vehicleStatusDistribution: VehicleStatusDistributionItem[];
  approvalTimeData: ApprovalTimeItem[];
}
