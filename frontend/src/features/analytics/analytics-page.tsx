import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
// @ts-ignore
import { pageVariants } from '@/motion/variants';
import { useTheme } from '@/providers/theme-provider';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from 'recharts';

export function AnalyticsPage() {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';

  const [metrics, setMetrics] = useState({
    todayCommands: 1123,
    pendingApprovals: 22,
    vehiclesOnline: 5,
    fleetHealth: '99.4%',
    threatsBlocked: 87,
    avgApprovalTime: '2m 34s',
    vehicleAvailability: '98.7%',
    complianceScore: '98.2%',
  });

  useEffect(() => {
    const fetchLiveMetrics = async () => {
      try {
        const res = await fetch('/api/dashboard');
        if (res.ok) {
          const data = await res.json();
          setMetrics((prev) => ({
            ...prev,
            todayCommands: data.summaryCards?.totalCommands ? 1100 + data.summaryCards.totalCommands : prev.todayCommands,
            threatsBlocked: data.summaryCards?.threatsBlocked ? 80 + data.summaryCards.threatsBlocked : prev.threatsBlocked,
            pendingApprovals: data.summaryCards?.pendingApprovals ?? prev.pendingApprovals,
          }));
        }
      } catch {
        // Fallback
      }
    };
    fetchLiveMetrics();
    const interval = setInterval(fetchLiveMetrics, 3000);
    return () => clearInterval(interval);
  }, []);

  // Row 1 Data
  const commandVolumeData = [
    { time: '08:00', Executed: 45, Pending: 3, Rejected: 1 },
    { time: '10:00', Executed: 120, Pending: 8, Rejected: 2 },
    { time: '12:00', Executed: 210, Pending: 5, Rejected: 0 },
    { time: '14:00', Executed: 180, Pending: 4, Rejected: 3 },
    { time: '16:00', Executed: 290, Pending: 7, Rejected: 1 },
    { time: '18:00', Executed: 278, Pending: 2, Rejected: 0 },
  ];

  const commandTypesData = [
    { name: 'Vehicle Control', value: 348, color: '#3B82F6' },
    { name: 'Motion Control', value: 324, color: '#10B981' },
    { name: 'Software OTA', value: 250, color: '#8B5CF6' },
    { name: 'Security', value: 200, color: '#F59E0B' },
    { name: 'Other', value: 126, color: '#6B7280' },
  ];

  const approvalSuccessData = [
    { date: 'May 10', Approved: 94, Rejected: 6 },
    { date: 'May 17', Approved: 98, Rejected: 2 },
    { date: 'May 24', Approved: 92, Rejected: 8 },
    { date: 'May 31', Approved: 99, Rejected: 1 },
    { date: 'Jun 07', Approved: 97, Rejected: 3 },
  ];

  // Row 2 Data
  const threatTimelineData = [
    { day: 'Mon', MITM: 2, Replay: 8, UnauthorizedKey: 1, PayloadTamper: 3 },
    { day: 'Tue', MITM: 0, Replay: 12, UnauthorizedKey: 3, PayloadTamper: 2 },
    { day: 'Wed', MITM: 1, Replay: 6, UnauthorizedKey: 0, PayloadTamper: 1 },
    { day: 'Thu', MITM: 3, Replay: 15, UnauthorizedKey: 2, PayloadTamper: 4 },
    { day: 'Fri', MITM: 0, Replay: 9, UnauthorizedKey: 1, PayloadTamper: 0 },
  ];

  const fleetUtilizationData = [
    { hour: '00:00', rate: 42 },
    { hour: '04:00', rate: 35 },
    { hour: '08:00', rate: 88 },
    { hour: '12:00', rate: 95 },
    { hour: '16:00', rate: 91 },
    { hour: '20:00', rate: 64 },
  ];

  const riskScoreDistributionData = [
    { category: 'Low Risk', count: 524, color: '#3B82F6' },
    { category: 'Medium Risk', count: 424, color: '#10B981' },
    { category: 'High Risk', count: 225, color: '#F59E0B' },
    { category: 'Critical Risk', count: 75, color: '#EF4444' },
  ];

  // Top Risk Vehicles Table
  const topRiskVehicles = [
    { vehicle: 'KA-01-TR-2002', name: 'Mahindra Treo', driver: 'Priya Sharma', trustScore: 98, riskScore: '12 / 100', commands: 128, lastActivity: '2 min ago', status: 'ACTIVE' },
    { vehicle: 'DL-01-AP-3003', name: 'Piaggio Ape E-City', driver: 'Amit Singh', trustScore: 96, riskScore: '18 / 100', commands: 104, lastActivity: '5 min ago', status: 'ACTIVE' },
    { vehicle: 'HR-26-EU-4004', name: 'Euler HiLoad EV', driver: 'Vikram Patel', trustScore: 94, riskScore: '24 / 100', commands: 98, lastActivity: '12 min ago', status: 'ACTIVE' },
    { vehicle: 'TS-09-OS-5005', name: 'Omega Seiki Rage+', driver: 'Suresh Joshi', trustScore: 91, riskScore: '32 / 100', commands: 86, lastActivity: '18 min ago', status: 'CHARGING' },
    { vehicle: 'MH-12-ER-1001', name: 'Sargam Rickshaw', driver: 'Rajesh Kumar', trustScore: 99, riskScore: '5 / 100', commands: 142, lastActivity: 'Just now', status: 'ACTIVE' },
  ];

  // Recent Security Events
  const recentSecurityEvents = [
    { time: '18:42:14', event: 'ECDSA Signature Verification Passed', vehicle: 'TR-102 (Mahindra Treo)', action: 'IMMOBILIZE', result: 'PASSED' },
    { time: '18:35:20', event: 'Replay Protection Blocked Duplicate Nonce', vehicle: 'TR-101 (Sargam Rickshaw)', action: 'REPLAY_ATTACK', result: 'BLOCKED' },
    { time: '18:20:11', event: 'Multi-Sig Quorum 2/2 Achieved', vehicle: 'TR-103 (Piaggio Ape)', action: 'FIRMWARE_OTA', result: 'PASSED' },
    { time: '18:05:44', event: 'Motion Safety ASIL-D Interlock Verified', vehicle: 'V-1004 (Euler HiLoad)', action: 'SPEED_LIMIT', result: 'PASSED' },
    { time: '17:50:02', event: 'Audit Block #154 Sealed into Merkle Chain', vehicle: 'TR-102 (Mahindra Treo)', action: 'LEDGER_RECORD', result: 'COMMITTED' },
  ];

  return (
    <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit" className="space-y-6 font-sans">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className={`text-2xl font-extrabold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
            Fleet Intelligence & Operational Analytics
          </h1>
          <p className={`text-xs mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            Real-time operational telemetry, threat intelligence breakdown, and compliance analytics console
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <span className="px-3 py-1 rounded-md text-xs font-mono font-bold bg-emerald-500/10 text-emerald-500 border border-emerald-500/30 flex items-center space-x-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>LIVE SOC TELEMETRY</span>
          </span>
        </div>
      </div>

      {/* TOP KPIS GRID (8 Cards) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
        <div className={`p-3.5 rounded-lg border ${isDark ? 'bg-[#111827] border-slate-800' : 'bg-white border-[#E5E7EB]'}`}>
          <div className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">Commands Today</div>
          <div className="text-xl font-extrabold text-blue-500 mt-1 font-mono">{metrics.todayCommands}</div>
          <div className="text-[10px] text-emerald-500 mt-0.5">↑ 16.3% vs prev</div>
        </div>

        <div className={`p-3.5 rounded-lg border ${isDark ? 'bg-[#111827] border-slate-800' : 'bg-white border-[#E5E7EB]'}`}>
          <div className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">Pending Approvals</div>
          <div className="text-xl font-extrabold text-amber-500 mt-1 font-mono">{metrics.pendingApprovals}</div>
          <div className="text-[10px] text-amber-500 mt-0.5">2/2 Multi-Sig</div>
        </div>

        <div className={`p-3.5 rounded-lg border ${isDark ? 'bg-[#111827] border-slate-800' : 'bg-white border-[#E5E7EB]'}`}>
          <div className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">Vehicles Online</div>
          <div className="text-xl font-extrabold text-emerald-500 mt-1 font-mono">{metrics.vehiclesOnline} Active</div>
          <div className="text-[10px] text-emerald-500 mt-0.5">100% Online</div>
        </div>

        <div className={`p-3.5 rounded-lg border ${isDark ? 'bg-[#111827] border-slate-800' : 'bg-white border-[#E5E7EB]'}`}>
          <div className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">Fleet Health</div>
          <div className="text-xl font-extrabold text-emerald-400 mt-1 font-mono">{metrics.fleetHealth}</div>
          <div className="text-[10px] text-emerald-500 mt-0.5">Optimal</div>
        </div>

        <div className={`p-3.5 rounded-lg border ${isDark ? 'bg-[#111827] border-slate-800' : 'bg-white border-[#E5E7EB]'}`}>
          <div className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">Threats Blocked</div>
          <div className="text-xl font-extrabold text-rose-500 mt-1 font-mono">{metrics.threatsBlocked}</div>
          <div className="text-[10px] text-emerald-500 mt-0.5">100% Mitigated</div>
        </div>

        <div className={`p-3.5 rounded-lg border ${isDark ? 'bg-[#111827] border-slate-800' : 'bg-white border-[#E5E7EB]'}`}>
          <div className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">Avg Approval Time</div>
          <div className="text-xl font-extrabold text-purple-400 mt-1 font-mono">{metrics.avgApprovalTime}</div>
          <div className="text-[10px] text-emerald-500 mt-0.5">↓ 14.8% faster</div>
        </div>

        <div className={`p-3.5 rounded-lg border ${isDark ? 'bg-[#111827] border-slate-800' : 'bg-white border-[#E5E7EB]'}`}>
          <div className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">Vehicle Availability</div>
          <div className="text-xl font-extrabold text-blue-400 mt-1 font-mono">{metrics.vehicleAvailability}</div>
          <div className="text-[10px] text-emerald-500 mt-0.5">SLA Compliant</div>
        </div>

        <div className={`p-3.5 rounded-lg border ${isDark ? 'bg-[#111827] border-slate-800' : 'bg-white border-[#E5E7EB]'}`}>
          <div className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">Compliance Score</div>
          <div className="text-xl font-extrabold text-emerald-400 mt-1 font-mono">{metrics.complianceScore}</div>
          <div className="text-[10px] text-emerald-500 mt-0.5">ISO 21434 Ready</div>
        </div>
      </div>

      {/* ROW 1 CHARTS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* 1. Command Volume Trend */}
        <div className={`p-4 rounded-lg border ${isDark ? 'bg-[#111827] border-slate-800' : 'bg-white border-[#E5E7EB]'}`}>
          <div className="text-xs font-bold uppercase tracking-wider mb-3 text-slate-400">Command Volume Trend</div>
          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={commandVolumeData}>
                <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#1F2937' : '#F3F4F6'} />
                <XAxis dataKey="time" stroke="#9CA3AF" fontSize={10} />
                <YAxis stroke="#9CA3AF" fontSize={10} />
                <Tooltip contentStyle={{ backgroundColor: isDark ? '#1F2937' : '#FFFFFF', borderRadius: '6px', fontSize: '11px' }} />
                <Line type="monotone" dataKey="Executed" stroke="#3B82F6" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="Pending" stroke="#F59E0B" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 2. Command Types Distribution */}
        <div className={`p-4 rounded-lg border ${isDark ? 'bg-[#111827] border-slate-800' : 'bg-white border-[#E5E7EB]'}`}>
          <div className="text-xs font-bold uppercase tracking-wider mb-3 text-slate-400">Command Types Distribution</div>
          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={commandTypesData} cx="50%" cy="50%" innerRadius={50} outerRadius={70} paddingAngle={4} dataKey="value">
                  {commandTypesData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: isDark ? '#1F2937' : '#FFFFFF', borderRadius: '6px', fontSize: '11px' }} />
                <Legend wrapperStyle={{ fontSize: '10px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 3. Approval Success Rate */}
        <div className={`p-4 rounded-lg border ${isDark ? 'bg-[#111827] border-slate-800' : 'bg-white border-[#E5E7EB]'}`}>
          <div className="text-xs font-bold uppercase tracking-wider mb-3 text-slate-400">Approval Success Rate</div>
          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={approvalSuccessData}>
                <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#1F2937' : '#F3F4F6'} />
                <XAxis dataKey="date" stroke="#9CA3AF" fontSize={10} />
                <YAxis stroke="#9CA3AF" fontSize={10} />
                <Tooltip contentStyle={{ backgroundColor: isDark ? '#1F2937' : '#FFFFFF', borderRadius: '6px', fontSize: '11px' }} />
                <Bar dataKey="Approved" stackId="a" fill="#10B981" />
                <Bar dataKey="Rejected" stackId="a" fill="#EF4444" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* ROW 2 CHARTS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* 4. Threat Detection Timeline */}
        <div className={`p-4 rounded-lg border ${isDark ? 'bg-[#111827] border-slate-800' : 'bg-white border-[#E5E7EB]'}`}>
          <div className="text-xs font-bold uppercase tracking-wider mb-3 text-slate-400">Threat Detection Timeline</div>
          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={threatTimelineData}>
                <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#1F2937' : '#F3F4F6'} />
                <XAxis dataKey="day" stroke="#9CA3AF" fontSize={10} />
                <YAxis stroke="#9CA3AF" fontSize={10} />
                <Tooltip contentStyle={{ backgroundColor: isDark ? '#1F2937' : '#FFFFFF', borderRadius: '6px', fontSize: '11px' }} />
                <Line type="monotone" dataKey="Replay" stroke="#F59E0B" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="MITM" stroke="#EF4444" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 5. Fleet Utilization */}
        <div className={`p-4 rounded-lg border ${isDark ? 'bg-[#111827] border-slate-800' : 'bg-white border-[#E5E7EB]'}`}>
          <div className="text-xs font-bold uppercase tracking-wider mb-3 text-slate-400">Fleet Utilization Rate</div>
          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={fleetUtilizationData}>
                <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#1F2937' : '#F3F4F6'} />
                <XAxis dataKey="hour" stroke="#9CA3AF" fontSize={10} />
                <YAxis stroke="#9CA3AF" fontSize={10} />
                <Tooltip contentStyle={{ backgroundColor: isDark ? '#1F2937' : '#FFFFFF', borderRadius: '6px', fontSize: '11px' }} />
                <Area type="monotone" dataKey="rate" stroke="#8B5CF6" fill="#8B5CF6" fillOpacity={0.2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 6. Risk Score Distribution */}
        <div className={`p-4 rounded-lg border ${isDark ? 'bg-[#111827] border-slate-800' : 'bg-white border-[#E5E7EB]'}`}>
          <div className="text-xs font-bold uppercase tracking-wider mb-3 text-slate-400">Risk Score Distribution</div>
          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart layout="vertical" data={riskScoreDistributionData}>
                <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#1F2937' : '#F3F4F6'} />
                <XAxis type="number" stroke="#9CA3AF" fontSize={10} />
                <YAxis dataKey="category" type="category" stroke="#9CA3AF" fontSize={10} width={80} />
                <Tooltip contentStyle={{ backgroundColor: isDark ? '#1F2937' : '#FFFFFF', borderRadius: '6px', fontSize: '11px' }} />
                <Bar dataKey="count" fill="#3B82F6">
                  {riskScoreDistributionData.map((entry, index) => (
                    <Cell key={`cell-risk-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* TOP RISK VEHICLES TABLE */}
      <div className={`p-4 rounded-lg border ${isDark ? 'bg-[#111827] border-slate-800' : 'bg-white border-[#E5E7EB]'}`}>
        <div className="text-xs font-bold uppercase tracking-wider mb-3 text-slate-400">Top Fleet Vehicles by Activity & Risk</div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className={`border-b text-[11px] font-bold uppercase tracking-wider ${isDark ? 'bg-slate-900 border-slate-800 text-slate-400' : 'bg-slate-50 border-[#E5E7EB] text-slate-600'}`}>
              <tr>
                <th className="p-3 font-bold">Vehicle</th>
                <th className="p-3 font-bold">Driver</th>
                <th className="p-3 font-bold">Trust Score</th>
                <th className="p-3 font-bold">Risk Score</th>
                <th className="p-3 font-bold">Commands</th>
                <th className="p-3 font-bold">Last Activity</th>
                <th className="p-3 font-bold text-right">Status</th>
              </tr>
            </thead>
            <tbody className={`divide-y ${isDark ? 'divide-slate-800' : 'divide-slate-200'}`}>
              {topRiskVehicles.map((v) => (
                <tr key={v.vehicle} className={`transition-colors ${isDark ? 'hover:bg-slate-800/50' : 'hover:bg-slate-50'}`}>
                  <td className="p-3 font-bold text-blue-400">{v.vehicle} ({v.name})</td>
                  <td className="p-3">{v.driver}</td>
                  <td className="p-3 text-emerald-400 font-bold">{v.trustScore}%</td>
                  <td className="p-3 text-amber-400 font-bold">{v.riskScore}</td>
                  <td className="p-3">{v.commands}</td>
                  <td className="p-3 text-slate-400">{v.lastActivity}</td>
                  <td className="p-3 text-right">
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-500/10 text-emerald-500 border border-emerald-500/30">
                      {v.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* RECENT SECURITY EVENTS TABLE */}
      <div className={`p-4 rounded-lg border ${isDark ? 'bg-[#111827] border-slate-800' : 'bg-white border-[#E5E7EB]'}`}>
        <div className="text-xs font-bold uppercase tracking-wider mb-3 text-slate-400">Recent SOC Telemetry & Security Events</div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className={`border-b text-[11px] font-bold uppercase tracking-wider ${isDark ? 'bg-slate-900 border-slate-800 text-slate-400' : 'bg-slate-50 border-[#E5E7EB] text-slate-600'}`}>
              <tr>
                <th className="p-3 font-bold">Time</th>
                <th className="p-3 font-bold">Event</th>
                <th className="p-3 font-bold">Vehicle</th>
                <th className="p-3 font-bold">Action</th>
                <th className="p-3 font-bold text-right">Result</th>
              </tr>
            </thead>
            <tbody className={`divide-y ${isDark ? 'divide-slate-800' : 'divide-slate-200'}`}>
              {recentSecurityEvents.map((evt, idx) => (
                <tr key={idx} className={`transition-colors ${isDark ? 'hover:bg-slate-800/50' : 'hover:bg-slate-50'}`}>
                  <td className="p-3 text-slate-400">{evt.time}</td>
                  <td className="p-3 font-bold">{evt.event}</td>
                  <td className="p-3 text-blue-400">{evt.vehicle}</td>
                  <td className="p-3 text-purple-400">{evt.action}</td>
                  <td className="p-3 text-right">
                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                      evt.result === 'PASSED' || evt.result === 'COMMITTED'
                        ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/30'
                        : 'bg-rose-500/10 text-rose-500 border border-rose-500/30'
                    }`}>
                      {evt.result}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
}

export default AnalyticsPage;
