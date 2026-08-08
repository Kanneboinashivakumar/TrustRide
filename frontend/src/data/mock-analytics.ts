export const mockAnalytics = {
  executiveSummary: {
    totalVehicles: 12,
    activeCommands: 3,
    pendingApprovals: 1,
    hashChainStatus: 'Healthy',
    motionSafetyStatus: 'Active',
    fleetUptime: '99.8%',
    commandsToday: 24,
    driversOnline: 8
  },
  fleetGrowthData: [
    { month: 'Jan', vehicles: 4, active: 3 },
    { month: 'Feb', vehicles: 6, active: 5 },
    { month: 'Mar', vehicles: 8, active: 7 },
    { month: 'Apr', vehicles: 10, active: 8 },
    { month: 'May', vehicles: 12, active: 7 }
  ],
  commandActivityData: Array.from({ length: 14 }, (_, i) => ({
    date: `Aug ${i + 1}`,
    commands: Math.floor(Math.random() * 8) + 12,
    approved: Math.floor(Math.random() * 6) + 10,
    rejected: Math.floor(Math.random() * 2)
  })),
  batteryDistributionData: [
    { range: '80-100%', count: 6 },
    { range: '60-79%', count: 3 },
    { range: '40-59%', count: 2 },
    { range: '20-39%', count: 0 },
    { range: '<20%', count: 1 }
  ],
  threatsByTypeData: [
    { type: 'Unauthorized Access', count: 2, mitigated: 2 },
    { type: 'Replay Attempt', count: 4, mitigated: 4 },
    { type: 'GPS Spoofing', count: 1, mitigated: 1 }
  ],
  complianceScoreData: [
    { standard: 'AIS-156', status: 'Aligned', checksPassing: 12, totalChecks: 12 },
    { standard: 'ISO 26262', status: 'Aligned', checksPassing: 18, totalChecks: 18 },
    { standard: 'UNECE R155', status: 'Aligned', checksPassing: 24, totalChecks: 24 },
    { standard: 'ISO/SAE 21434', status: 'Aligned', checksPassing: 16, totalChecks: 16 }
  ],
  vehicleStatusDistribution: [
    { status: 'active', count: 7 },
    { status: 'idle', count: 1 },
    { status: 'charging', count: 1 },
    { status: 'maintenance', count: 1 },
    { status: 'disabled', count: 1 },
    { status: 'offline', count: 1 }
  ],
  approvalTimeData: [
    { day: 'Mon', avgMinutes: 4.2 },
    { day: 'Tue', avgMinutes: 3.8 },
    { day: 'Wed', avgMinutes: 5.1 },
    { day: 'Thu', avgMinutes: 2.9 },
    { day: 'Fri', avgMinutes: 3.4 }
  ]
};
