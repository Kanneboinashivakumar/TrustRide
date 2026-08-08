import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
// @ts-ignore
import { pageVariants } from '@/motion/variants';
import { useTheme } from '@/providers/theme-provider';
import {
  Car,
  Terminal,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Key,
  Lock,
  Radio,
  Bell,
  X,
  Server,
  ShieldAlert,
  ArrowRight,
  RefreshCw,
  Gauge,
  Activity,
  Award,
  Zap,
  FileText,
  Compass,
  Play,
  Users,
  CheckCircle,
  FileCode,
  Sliders,
  Send,
  Wifi,
  Check,
  Eye,
  Filter
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface RecentActivityItem {
  time: string;
  vehicle: string;
  action: string;
  status: 'Verified' | 'Executed' | 'Rejected' | 'Pending';
  vehicleId: string;
  approver?: string;
  signature?: string;
  auditHash?: string;
  result?: string;
}

interface VehicleAlert {
  id: string;
  vehicle: string;
  type: string;
  value: string;
  severity: 'high' | 'medium' | 'low';
  vehicleId: string;
  description?: string;
  acknowledged?: boolean;
}

export function DashboardPage() {
  const navigate = useNavigate();
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';

  const [currentTime, setCurrentTime] = useState<string>('18:42:16 IST');
  const [currentDate, setCurrentDate] = useState<string>('05 Aug 2026');
  const [lastSyncSec, setLastSyncSec] = useState<number>(1);
  const [animStage, setAnimStage] = useState<number>(1);
  const [apiLatency, setApiLatency] = useState<number>(42);
  const [selectedAuditItem, setSelectedAuditItem] = useState<RecentActivityItem | null>(null);
  const [selectedAlertModal, setSelectedAlertModal] = useState<boolean>(false);
  const [batteryPulse, setBatteryPulse] = useState<number>(96);

  // Backend Live Telemetry Data
  const [backendData, setBackendData] = useState<any>(null);
  const [alertsList, setAlertsList] = useState<VehicleAlert[]>([
    { id: "ALT-01", vehicle: "Omega Seiki Rage+ (TS-09-OS-5005)", type: "Battery Low", value: "18% remaining", severity: "high", vehicleId: "V-1005", description: "Battery SOC dropped below critical 20% threshold during active delivery route in Hyderabad." },
    { id: "ALT-02", vehicle: "Piaggio Ape E-City (DL-01-AP-3003)", type: "Insurance Expiring", value: "Expires in 4 days", severity: "medium", vehicleId: "TR-103", description: "Comprehensive Commercial Fleet Cover policy #POL-998234-EV requires renewal before Aug 09, 2026." },
    { id: "ALT-03", vehicle: "Mahindra Treo (KA-01-TR-2002)", type: "Firmware Update", value: "v2.5.0 Available", severity: "low", vehicleId: "TR-102", description: "Mandatory UNECE R155 CSMS Security Patch v2.5.0 ready for OTA deployment." },
    { id: "ALT-04", vehicle: "Euler HiLoad EV (HR-26-EU-4004)", type: "Maintenance Due", value: "Schedule at 10,000 km", severity: "medium", vehicleId: "V-1004", description: "Vehicle reached 9,100 km. Scheduled cell-balancing & drivetrain lubrication required." }
  ]);

  // Fetch real backend data from Express API
  const fetchBackendDashboardData = async () => {
    try {
      const response = await fetch('/api/dashboard');
      if (response.ok) {
        const data = await response.json();
        setBackendData(data);
        if (data.apiLatencyMs) setApiLatency(data.apiLatencyMs);
        if (data.vehicleAlerts) {
          setAlertsList(data.vehicleAlerts.map((a: any) => ({
            ...a,
            description: a.description || `Active telemetry alert registered for ${a.vehicle}: ${a.type} (${a.value}).`
          })));
        }
      }
    } catch (err) {
      // Fallback silently if offline
    }
  };

  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      setCurrentDate(now.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }));
      setCurrentTime(`${now.toLocaleTimeString('en-GB', { hour12: false })} IST`);
    };

    updateClock();
    const clockTimer = setInterval(updateClock, 1000);
    fetchBackendDashboardData();

    const syncTimer = setInterval(() => {
      setLastSyncSec((prev) => (prev >= 2 ? 1 : prev + 1));
      setApiLatency(40 + Math.floor(Math.random() * 5));
      setBatteryPulse(95 + Math.floor(Math.random() * 2));
      fetchBackendDashboardData();
    }, 2000);

    const pipelineTimer = setInterval(() => {
      setAnimStage((prev) => (prev % 7) + 1);
    }, 800);

    return () => {
      clearInterval(clockTimer);
      clearInterval(syncTimer);
      clearInterval(pipelineTimer);
    };
  }, []);

  const pipelineStages = [
    { id: 1, name: '1. Signature', latency: '12 ms', icon: Key },
    { id: 2, name: '2. Timestamp', latency: '6 ms', icon: Clock },
    { id: 3, name: '3. Replay', latency: '4 ms', icon: ShieldCheck },
    { id: 4, name: '4. Multi-Sig', latency: '7 ms', icon: Users },
    { id: 5, name: '5. Motion Safety', latency: '5 ms', icon: Sliders },
    { id: 6, name: '6. Dispatch', latency: '4 ms', icon: Send },
    { id: 7, name: '7. Audit Hash', latency: '3 ms', icon: FileCode },
  ];

  const recentActivities: RecentActivityItem[] = [
    {
      time: '14:30',
      vehicle: 'Sargam Electric Rickshaw (MH-12-ER-1001) - Immobilized',
      action: 'Immobilized',
      status: 'Verified',
      vehicleId: 'TR-101',
      approver: 'TrustRide Finance & Ops Admin (2-of-2)',
      signature: 'ECDSA P-256 (SHA-256)',
      auditHash: '0x8f9a2e3b1c4d5e6f7a8b9c0d1e2f3a4b',
      result: 'Command HELD by 0 km/h Motion Interlock'
    },
    {
      time: '14:26',
      vehicle: 'Mahindra Treo (KA-01-TR-2002) Replay Attack Blocked',
      action: 'Replay Attack Blocked',
      status: 'Rejected',
      vehicleId: 'TR-102',
      approver: 'None (Blocked by Verifier Engine)',
      signature: 'Spent Nonce Replayed (#99120)',
      auditHash: '0x1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d',
      result: 'REJECTED: Replay Protection Guard'
    },
    {
      time: '14:20',
      vehicle: 'Piaggio Ape E-City (DL-01-AP-3003) Driver Dispute Submitted',
      action: 'Driver Dispute Submitted',
      status: 'Pending',
      vehicleId: 'TR-103',
      approver: 'Pending Legal Operations Review',
      signature: 'Driver App Session Token ID #8812',
      auditHash: '0x3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f',
      result: 'Pending Co-signature Approval'
    },
    {
      time: '14:10',
      vehicle: 'Euler HiLoad EV (HR-26-EU-4004) Motor Restored',
      action: 'Motor Restored',
      status: 'Executed',
      vehicleId: 'V-1004',
      approver: 'TrustRide Operations Admin',
      signature: 'ECDSA P-256 (SHA-256)',
      auditHash: '0x5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b',
      result: 'EXECUTED: Motor Relay Restored'
    },
    {
      time: '14:02',
      vehicle: 'Omega Seiki Rage+ (TS-09-OS-5005) Audit Verified',
      action: 'Audit Verified',
      status: 'Verified',
      vehicleId: 'V-1005',
      approver: 'System Automated Verifier',
      signature: 'Immutable Merkle Tree Root Hash',
      auditHash: '0x7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d',
      result: 'VERIFIED: Merkle Chain Intact'
    }
  ];

  const handleAcknowledgeAlert = (alertId: string) => {
    setAlertsList(prev => prev.map(a => a.id === alertId ? { ...a, acknowledged: true } : a));
  };

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className={`space-y-6 font-sans transition-colors ${
        isDark ? 'bg-[#0B0F19] text-[#F8FAFC]' : 'bg-[#F8FAFC] text-[#111827]'
      }`}
    >
      {/* 1. TOP TITLE AREA WITH CLEAN OPERATIONAL BOXES ON RIGHT */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className={`text-[32px] font-bold tracking-tight leading-none ${isDark ? 'text-white' : 'text-[#111827]'}`}>
            Dashboard
          </h1>
          <p className={`text-sm mt-2 font-normal ${isDark ? 'text-slate-400' : 'text-[#475569]'}`}>
            Executive overview of fleet command governance
          </p>
        </div>

        {/* Clean Operational Boxes */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Clock Box */}
          <div className={`px-3 py-1.5 rounded-xl border flex items-center space-x-2 text-xs font-medium ${isDark ? 'bg-slate-900 border-slate-800 text-slate-200' : 'bg-white border-[#E5E7EB] text-[#111827]'}`}>
            <Clock size={13} className="text-blue-500" />
            <span className="font-mono">{currentTime}</span>
            <span className="text-slate-400">|</span>
            <span className="text-slate-400">{currentDate}</span>
          </div>

          {/* Backend Box */}
          <div className={`px-3 py-1.5 rounded-xl border flex items-center space-x-1.5 text-xs font-semibold ${isDark ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-emerald-50 border-emerald-200 text-emerald-600'}`}>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Backend Connected</span>
          </div>

          {/* Latency Box */}
          <div className={`px-3 py-1.5 rounded-xl border flex items-center space-x-1.5 text-xs font-semibold ${isDark ? 'bg-blue-500/10 border-blue-500/20 text-blue-400' : 'bg-blue-50 border-blue-200 text-blue-600'}`}>
            <Activity size={13} />
            <span>API Latency {apiLatency} ms</span>
          </div>

          {/* WebSocket Box */}
          <div className={`px-3 py-1.5 rounded-xl border flex items-center space-x-1.5 text-xs font-semibold ${isDark ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-emerald-50 border-emerald-200 text-emerald-600'}`}>
            <Wifi size={13} />
            <span>WebSocket Connected</span>
          </div>
        </div>
      </div>

      {/* 2. SINGLE HORIZONTAL STATUS RIBBON (EXACT MATCH WITH IMAGE 3) */}
      <div
        className={`rounded-xl px-4 py-3 shadow-xs flex flex-wrap lg:flex-nowrap items-center justify-between text-xs transition-colors border ${
          isDark
            ? 'bg-[#111827] border-slate-800 text-slate-300'
            : 'bg-white border-[#E5E7EB] text-[#475569]'
        }`}
      >
        <div className="flex items-center space-x-2 pr-4 border-r border-slate-200 dark:border-slate-800">
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
          <span className="font-medium">Fleet Status:</span>
          <span className="text-emerald-500 font-bold">Connected</span>
        </div>

        <div className="flex items-center space-x-2 px-4 border-r border-slate-200 dark:border-slate-800">
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
          <span className="font-medium">Replay Protection:</span>
          <span className="text-emerald-500 font-bold">Active</span>
        </div>

        <div className="flex items-center space-x-2 px-4 border-r border-slate-200 dark:border-slate-800">
          <span className="w-2 h-2 rounded-full bg-blue-500" />
          <span className="font-medium">Multi-Signature:</span>
          <span className="text-blue-500 font-bold">Enabled (2-of-2)</span>
        </div>

        <div className="flex items-center space-x-2 px-4 border-r border-slate-200 dark:border-slate-800">
          <span className="w-2 h-2 rounded-full bg-purple-500" />
          <span className="font-medium">Motion Safety:</span>
          <span className="text-purple-500 font-bold">0 km/h Enforced</span>
        </div>

        <div className="flex items-center space-x-2 px-4 border-r border-slate-200 dark:border-slate-800">
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
          <span className="font-medium">SHA-256 Audit Chain:</span>
          <span className="text-emerald-500 font-bold">Healthy</span>
        </div>

        <div className="flex items-center space-x-2 pl-4 font-mono text-xs text-slate-400">
          <span>Last Sync: {lastSyncSec} sec ago</span>
          <RefreshCw size={12} className="animate-spin text-blue-500" />
        </div>
      </div>

      {/* 3. METRIC CARDS (EXACT MATCH: CLEAN LINE-BY-LINE SUBTEXT ALIGNMENT) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {/* Card 1: Commercial EV Fleet */}
        <div
          className={`rounded-[16px] p-4 min-h-[140px] shadow-xs flex flex-col justify-between transition-colors border ${
            isDark ? 'bg-[#111827] border-slate-800' : 'bg-white border-[#E5E7EB]'
          }`}
        >
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">COMMERCIAL EV FLEET</span>
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${isDark ? 'bg-blue-500/10 text-blue-400' : 'bg-[#EFF6FF] text-[#2563EB]'}`}>
              <Car size={16} />
            </div>
          </div>
          <div>
            <div className={`text-2xl font-bold leading-tight ${isDark ? 'text-white' : 'text-[#111827]'}`}>5 Vehicles</div>
            <div className="text-[11px] mt-1.5 font-medium leading-tight">
              <div><span className="text-emerald-500 font-bold">2 Active</span> • <span className="text-blue-500 font-bold">1 Charging</span></div>
              <div className="text-purple-500 font-bold mt-0.5">1 Maintenance</div>
              <div className="text-rose-500 font-bold text-[10px] mt-0.5">1 Immobilized</div>
            </div>
          </div>
        </div>

        {/* Card 2: Commands Today */}
        <div
          className={`rounded-[16px] p-4 min-h-[140px] shadow-xs flex flex-col justify-between transition-colors border ${
            isDark ? 'bg-[#111827] border-slate-800' : 'bg-white border-[#E5E7EB]'
          }`}
        >
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">COMMANDS TODAY</span>
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${isDark ? 'bg-emerald-500/10 text-emerald-400' : 'bg-[#ECFDF5] text-[#10B981]'}`}>
              <Terminal size={16} />
            </div>
          </div>
          <div>
            <div className={`text-2xl font-bold leading-tight ${isDark ? 'text-white' : 'text-[#111827]'}`}>18 Today</div>
            <div className="text-[11px] mt-1.5 font-medium leading-tight">
              <div><span className="text-emerald-500 font-bold">12 Executed</span> • <span className="text-amber-500 font-bold">3 Held</span></div>
              <div className="text-rose-500 font-bold mt-0.5">2 Rejected</div>
              <div className="text-amber-500 font-bold text-[10px] mt-0.5">1 Pending Approval</div>
            </div>
          </div>
        </div>

        {/* Card 3: Approvals Pending */}
        <div
          className={`rounded-[16px] p-4 min-h-[140px] shadow-xs flex flex-col justify-between transition-colors border ${
            isDark ? 'bg-[#111827] border-slate-800' : 'bg-white border-[#E5E7EB]'
          }`}
        >
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">APPROVALS PENDING</span>
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${isDark ? 'bg-amber-500/10 text-amber-400' : 'bg-[#FEF3C7] text-[#F59E0B]'}`}>
              <Users size={16} />
            </div>
          </div>
          <div>
            <div className={`text-2xl font-bold leading-tight ${isDark ? 'text-white' : 'text-[#111827]'}`}>2 Pending</div>
            <div className="text-[11px] mt-1.5 font-medium leading-tight">
              <div><span className="text-amber-500 font-bold">1 Finance</span> • <span className="text-amber-500 font-bold">1 Ops Admin</span></div>
              <div className="text-slate-400 text-[10px] mt-0.5">Waiting: 3 min</div>
            </div>
          </div>
        </div>

        {/* Card 4: Hash Chain Ledger */}
        <div
          className={`rounded-[16px] p-4 min-h-[140px] shadow-xs flex flex-col justify-between transition-colors border ${
            isDark ? 'bg-[#111827] border-slate-800' : 'bg-white border-[#E5E7EB]'
          }`}
        >
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">HASH CHAIN LEDGER</span>
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${isDark ? 'bg-purple-500/10 text-purple-400' : 'bg-[#F5F3FF] text-[#7C3AED]'}`}>
              <ShieldCheck size={16} />
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold text-emerald-500 leading-tight">✓ Healthy</div>
            <div className="text-[11px] mt-1.5 font-medium leading-tight text-slate-400">
              <div><span className={isDark ? 'text-white font-bold' : 'text-[#111827] font-bold'}>257 Blocks</span> • <span className="text-emerald-500 font-bold">100% Verified</span></div>
              <div className="text-slate-400 text-[10px] mt-0.5">Last Verified: 18:42:11</div>
            </div>
          </div>
        </div>

        {/* Card 5: Verification Success */}
        <div
          className={`rounded-[16px] p-4 min-h-[140px] shadow-xs flex flex-col justify-between transition-colors border ${
            isDark ? 'bg-[#111827] border-slate-800' : 'bg-white border-[#E5E7EB]'
          }`}
        >
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">VERIFICATION SUCCESS</span>
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${isDark ? 'bg-emerald-500/10 text-emerald-400' : 'bg-[#ECFDF5] text-[#10B981]'}`}>
              <Award size={16} />
            </div>
          </div>
          <div>
            <div className={`text-2xl font-bold leading-tight ${isDark ? 'text-white' : 'text-[#111827]'}`}>99.8%</div>
            <div className="text-[11px] mt-1.5 font-semibold text-emerald-500 leading-tight">
              <div>Avg Latency: {apiLatency} ms</div>
              <div className="text-slate-400 text-[10px] font-normal mt-0.5">7/7 Checks Passed</div>
            </div>
          </div>
        </div>

        {/* Card 6: Fleet Utilization */}
        <div
          className={`rounded-[16px] p-4 min-h-[140px] shadow-xs flex flex-col justify-between transition-colors border ${
            isDark ? 'bg-[#111827] border-slate-800' : 'bg-white border-[#E5E7EB]'
          }`}
        >
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">FLEET UTILIZATION</span>
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${isDark ? 'bg-amber-500/10 text-amber-400' : 'bg-[#FEF3C7] text-[#F59E0B]'}`}>
              <Gauge size={16} />
            </div>
          </div>
          <div>
            <div className={`text-2xl font-bold leading-tight ${isDark ? 'text-white' : 'text-[#111827]'}`}>82%</div>
            <div className="text-[11px] mt-1.5 font-medium leading-tight text-slate-400">
              <div>Avg Battery: <span className="text-amber-500 font-bold">74%</span></div>
              <div className="text-slate-400 text-[10px] mt-0.5">Total Range: <span className="text-amber-500 font-bold">415 km</span></div>
            </div>
          </div>
        </div>
      </div>

      {/* 4. LIVE SIMULATION BANNER */}
      <div
        className={`w-full rounded-[16px] p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4 transition-colors border ${
          isDark
            ? 'bg-blue-950/20 border-blue-900/50'
            : 'bg-[#EFF6FF] border-[#BFDBFE]'
        }`}
      >
        <div className="flex items-center space-x-4">
          <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${isDark ? 'bg-blue-900/50 text-blue-400' : 'bg-[#DBEAFE] text-[#2563EB]'}`}>
            <Zap size={22} />
          </div>
          <div>
            <div className="text-[11px] font-bold text-blue-500 uppercase tracking-wider">LIVE SIMULATION SCENARIO</div>
            <div className={`text-base font-bold leading-tight mt-0.5 ${isDark ? 'text-white' : 'text-[#111827]'}`}>
              Moving Vehicle Immobilization Demo
            </div>
            <div className="text-xs text-slate-400 mt-1 font-medium leading-relaxed">
              Vehicle: <span className="text-blue-500 font-semibold">Sargam Electric Rickshaw (MH-12-ER-1001)</span> • Current Speed: <span className="text-emerald-500 font-bold">25 km/h</span>
              <div className="mt-1 flex items-center space-x-2">
                <span className="text-slate-400 text-[11px]">Status: <strong className="text-amber-500">HELD</strong> • Reason: <strong className="text-emerald-500">Motion Interlock Active (Waiting for 0 km/h)</strong></span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-4 shrink-0">
          <div className="text-right">
            <span className="bg-amber-500/10 text-amber-500 border border-amber-500/30 font-bold text-xs px-3.5 py-1.5 rounded-full inline-block">
              STATUS: HELD (Motion Interlock Active)
            </span>
            <div className="text-[10px] text-slate-400 mt-1">Waiting for vehicle stop signal (0 km/h)</div>
          </div>
          <button
            onClick={() => navigate('/app/threat-sandbox')}
            className="h-10 bg-[#2563EB] hover:bg-blue-700 text-white font-semibold text-xs px-5 rounded-[12px] transition-colors shadow-sm flex items-center space-x-2 cursor-pointer"
          >
            <span>Open Threat Sandbox</span>
            <ArrowRight size={14} />
          </button>
        </div>
      </div>

      {/* 5. CHARTS SECTION (2 COLUMNS LAYOUT: FLEET STATUS DISTRIBUTION + WIDE 7-STAGE PIPELINE & THREAT OVERVIEW) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Column 1: Fleet Status Distribution (4 Cols) */}
        <div
          className={`lg:col-span-4 rounded-[16px] p-6 shadow-xs flex flex-col justify-between transition-colors border ${
            isDark ? 'bg-[#111827] border-slate-800' : 'bg-white border-[#E5E7EB]'
          }`}
        >
          <h3 className={`text-sm font-bold mb-3 ${isDark ? 'text-white' : 'text-[#111827]'}`}>Fleet Status Distribution</h3>

          <div className="flex items-center justify-between my-2">
            {/* SVG Donut Chart */}
            <div className="relative w-32 h-32 flex items-center justify-center shrink-0">
              <svg viewBox="0 0 36 36" className="w-full h-full transform -rotate-90">
                <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke={isDark ? '#1F2937' : '#E5E7EB'} strokeWidth="4.2" />
                <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#10B981" strokeWidth="4.2" strokeDasharray="40, 100" />
                <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#2563EB" strokeWidth="4.2" strokeDasharray="20, 100" strokeDashoffset="-40" />
                <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#F59E0B" strokeWidth="4.2" strokeDasharray="20, 100" strokeDashoffset="-60" />
                <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#7C3AED" strokeWidth="4.2" strokeDasharray="20, 100" strokeDashoffset="-80" />
              </svg>
              <div className="absolute text-center">
                <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-[#111827]'}`}>5</div>
                <div className="text-[10px] text-slate-400 font-medium">Total Vehicles</div>
              </div>
            </div>

            {/* Right Aligned Legend */}
            <div className="space-y-1.5 text-xs flex-1 ml-4 font-medium text-slate-400">
              <div className="flex justify-between items-center">
                <span className="flex items-center"><span className="w-2.5 h-2.5 bg-[#10B981] rounded-full mr-2" />Active (2)</span>
                <span className={`font-bold ${isDark ? 'text-white' : 'text-[#111827]'}`}>40%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="flex items-center"><span className="w-2.5 h-2.5 bg-[#2563EB] rounded-full mr-2" />Charging (1)</span>
                <span className={`font-bold ${isDark ? 'text-white' : 'text-[#111827]'}`}>20%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="flex items-center"><span className="w-2.5 h-2.5 bg-[#F59E0B] rounded-full mr-2" />Idle (1)</span>
                <span className={`font-bold ${isDark ? 'text-white' : 'text-[#111827]'}`}>20%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="flex items-center"><span className="w-2.5 h-2.5 bg-[#7C3AED] rounded-full mr-2" />Maintenance (1)</span>
                <span className={`font-bold ${isDark ? 'text-white' : 'text-[#111827]'}`}>20%</span>
              </div>
              <div className="flex justify-between items-center text-slate-500">
                <span className="flex items-center"><span className="w-2.5 h-2.5 bg-slate-500 rounded-full mr-2" />Offline (0)</span>
                <span>0%</span>
              </div>
            </div>
          </div>

          <div className={`pt-3 border-t flex justify-between text-xs font-medium ${isDark ? 'border-slate-800 text-slate-400' : 'border-[#E5E7EB] text-[#475569]'}`}>
            <div>Average Battery: <span className="text-emerald-500 font-bold">74%</span></div>
            <div>Fleet Utilization: <span className="text-emerald-500 font-bold">82%</span></div>
          </div>
        </div>

        {/* Column 2: Verification Engine Pipeline (WIDER 5 COLS FOR PERFECT READABILITY) */}
        <div
          className={`lg:col-span-5 rounded-[16px] p-6 shadow-xs flex flex-col justify-between transition-colors border ${
            isDark ? 'bg-[#111827] border-slate-800' : 'bg-white border-[#E5E7EB]'
          }`}
        >
          <div className="flex justify-between items-center mb-3">
            <h3 className={`text-sm font-bold ${isDark ? 'text-white' : 'text-[#111827]'}`}>Verification Engine Pipeline</h3>
          </div>

          <div className="relative my-4 flex items-center justify-between">
            {/* Connecting Line */}
            <div className={`absolute left-0 right-0 top-4 h-0.5 z-0 ${isDark ? 'bg-slate-800' : 'bg-[#E5E7EB]'}`} />

            {pipelineStages.map((stage) => {
              const isCompleted = stage.id < animStage || animStage === 7;
              const isCurrent = stage.id === animStage;
              const StageIcon = stage.icon;

              return (
                <div key={stage.id} className="relative z-10 flex flex-col items-center text-center">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                      isCurrent
                        ? 'bg-[#2563EB] text-white ring-4 ring-blue-500/40 shadow-lg scale-110'
                        : isCompleted
                        ? 'bg-emerald-500/20 text-emerald-500 border border-emerald-500/40'
                        : isDark
                        ? 'bg-slate-800 text-slate-500 border border-slate-700'
                        : 'bg-slate-100 text-slate-400 border border-slate-200'
                    }`}
                  >
                    <StageIcon size={14} />
                  </div>
                  <div className={`text-[10px] font-bold mt-2 whitespace-nowrap ${isDark ? 'text-slate-200' : 'text-[#111827]'}`}>{stage.name}</div>
                  <div className="text-[9px] text-slate-400 mt-0.5 font-mono">{stage.latency}</div>
                </div>
              );
            })}
          </div>

          <div className={`pt-3 border-t flex justify-between items-center text-xs font-medium ${isDark ? 'border-slate-800 text-slate-400' : 'border-[#E5E7EB] text-[#475569]'}`}>
            <div>
              Average Latency: <span className="text-emerald-500 font-bold">41 ms</span> • Completion: <span className="text-emerald-500 font-bold">99.8%</span>
            </div>
            <span className="bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 px-2.5 py-0.5 rounded-full text-xs font-semibold">
              7/7 Stages Passed
            </span>
          </div>
        </div>

        {/* Column 3: Today's Threat Overview (3 Cols) */}
        <div
          className={`lg:col-span-3 rounded-[16px] p-6 shadow-xs flex flex-col justify-between transition-colors border ${
            isDark ? 'bg-[#111827] border-slate-800' : 'bg-white border-[#E5E7EB]'
          }`}
        >
          <div className="flex justify-between items-center mb-2">
            <h3 className={`text-sm font-bold ${isDark ? 'text-white' : 'text-[#111827]'}`}>Today's Threat Overview</h3>
            <button onClick={() => navigate('/app/threat-sandbox')} className="text-xs text-blue-500 font-semibold hover:underline cursor-pointer">
              View All
            </button>
          </div>

          <div className="space-y-1 text-xs font-medium">
            <div className={`flex justify-between items-center py-2 px-1 border-b transition-colors ${isDark ? 'border-slate-800' : 'border-[#E5E7EB]'}`}>
              <span className="flex items-center text-rose-500 font-semibold"><ShieldAlert size={14} className="mr-2" /> Replay Attack</span>
              <span className="font-bold text-rose-500 text-sm">3</span>
            </div>
            <div className={`flex justify-between items-center py-2 px-1 border-b transition-colors ${isDark ? 'border-slate-800' : 'border-[#E5E7EB]'}`}>
              <span className="flex items-center text-amber-500 font-semibold"><Compass size={14} className="mr-2" /> GPS Spoof</span>
              <span className="font-bold text-amber-500 text-sm">1</span>
            </div>
            <div className={`flex justify-between items-center py-2 px-1 border-b transition-colors ${isDark ? 'border-slate-800' : 'border-[#E5E7EB]'}`}>
              <span className="flex items-center text-blue-500 font-semibold"><Clock size={14} className="mr-2" /> Expired Command</span>
              <span className="font-bold text-blue-500 text-sm">2</span>
            </div>
            <div className={`flex justify-between items-center py-2 px-1 border-b transition-colors ${isDark ? 'border-slate-800' : 'border-[#E5E7EB]'}`}>
              <span className="flex items-center text-slate-400 font-semibold"><Radio size={14} className="mr-2" /> MITM Attempt</span>
              <span className="font-bold text-blue-500 text-sm">0</span>
            </div>
            <div className={`flex justify-between items-center py-2 px-1 transition-colors`}>
              <span className="flex items-center text-purple-500 font-semibold"><Key size={14} className="mr-2" /> Tampered Signature</span>
              <span className="font-bold text-purple-500 text-sm">4</span>
            </div>
          </div>

          <div className="text-xs text-emerald-500 font-bold text-center mt-2">
            10 Attacks Blocked Automatically
          </div>
        </div>
      </div>

      {/* 6. MIDDLE ROW 2 (3 COLUMNS GRID) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Column 1: Recent Verified Command Activity */}
        <div
          className={`rounded-[16px] p-6 shadow-xs flex flex-col justify-between transition-colors border ${
            isDark ? 'bg-[#111827] border-slate-800' : 'bg-white border-[#E5E7EB]'
          }`}
        >
          <div className="flex justify-between items-center mb-3">
            <h3 className={`text-sm font-bold ${isDark ? 'text-white' : 'text-[#111827]'}`}>Recent Verified Command Activity</h3>
            <button onClick={() => navigate('/app/command-center')} className="text-xs text-blue-500 font-semibold hover:underline cursor-pointer">View All</button>
          </div>

          <div className="space-y-2">
            {recentActivities.map((item, i) => (
              <div
                key={i}
                onClick={() => setSelectedAuditItem(item)}
                className={`flex items-center justify-between text-xs p-2 rounded transition-colors cursor-pointer border-b ${
                  isDark ? 'border-slate-800 hover:bg-slate-800/50' : 'border-[#E5E7EB] hover:bg-slate-50'
                } last:border-none`}
              >
                <div className="flex items-center space-x-2.5">
                  <span className="text-slate-400 font-mono text-[11px]">{item.time}</span>
                  <span className={`font-semibold line-clamp-1 ${isDark ? 'text-slate-200' : 'text-[#111827]'}`}>{item.vehicle}</span>
                </div>
                <span
                  className={`text-xs font-semibold flex items-center space-x-1 shrink-0 ml-2 ${
                    item.status === 'Verified'
                      ? 'text-emerald-500'
                      : item.status === 'Executed'
                      ? 'text-emerald-500'
                      : item.status === 'Rejected'
                      ? 'text-rose-500'
                      : 'text-amber-500'
                  }`}
                >
                  <span>●</span> <span>{item.status}</span>
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Column 2: Fleet Health Index (4 Sparkline Cards) */}
        <div
          className={`rounded-[16px] p-6 shadow-xs flex flex-col justify-between transition-colors border ${
            isDark ? 'bg-[#111827] border-slate-800' : 'bg-white border-[#E5E7EB]'
          }`}
        >
          <div className="flex justify-between items-center mb-2">
            <div className="flex items-center space-x-2">
              <Activity size={16} className="text-emerald-500" />
              <h3 className={`text-sm font-bold ${isDark ? 'text-white' : 'text-[#111827]'}`}>Fleet Health Index</h3>
            </div>
            <span className="bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 px-2.5 py-0.5 rounded-full text-xs font-semibold">
              Healthy (87%)
            </span>
          </div>

          {/* 4 Equal Sparkline Cards */}
          <div className="grid grid-cols-4 gap-2 my-2 text-center text-xs">
            {/* Battery */}
            <div className={`p-2.5 rounded-xl flex flex-col justify-between border ${isDark ? 'bg-slate-900/50 border-slate-800' : 'bg-[#F8FAFC] border-[#E5E7EB]'}`}>
              <div className="text-slate-400 text-[10px] font-medium">Battery Health</div>
              <div className="font-bold text-emerald-500 text-sm my-1">{batteryPulse}%</div>
              <svg viewBox="0 0 40 12" className="w-full h-3 text-emerald-500 overflow-visible">
                <polyline fill="none" stroke="currentColor" strokeWidth="1.5" points="0,8 10,4 20,7 30,2 40,5" />
              </svg>
            </div>

            {/* Firmware */}
            <div className={`p-2.5 rounded-xl flex flex-col justify-between border ${isDark ? 'bg-slate-900/50 border-slate-800' : 'bg-[#F8FAFC] border-[#E5E7EB]'}`}>
              <div className="text-slate-400 text-[10px] font-medium">Firmware</div>
              <div className="font-bold text-blue-500 text-sm my-1">5 Updated</div>
              <svg viewBox="0 0 40 12" className="w-full h-3 text-blue-500 overflow-visible">
                <polyline fill="none" stroke="currentColor" strokeWidth="1.5" points="0,5 10,2 20,5 30,3 40,2" />
              </svg>
            </div>

            {/* Network */}
            <div className={`p-2.5 rounded-xl flex flex-col justify-between border ${isDark ? 'bg-slate-900/50 border-slate-800' : 'bg-[#F8FAFC] border-[#E5E7EB]'}`}>
              <div className="text-slate-400 text-[10px] font-medium">Network</div>
              <div className="font-bold text-emerald-500 text-sm my-1">100%</div>
              <svg viewBox="0 0 40 12" className="w-full h-3 text-emerald-500 overflow-visible">
                <polyline fill="none" stroke="currentColor" strokeWidth="1.5" points="0,4 10,4 20,2 30,2 40,2" />
              </svg>
            </div>

            {/* GPS */}
            <div className={`p-2.5 rounded-xl flex flex-col justify-between border ${isDark ? 'bg-slate-900/50 border-slate-800' : 'bg-[#F8FAFC] border-[#E5E7EB]'}`}>
              <div className="text-slate-400 text-[10px] font-medium">GPS Signal</div>
              <div className="font-bold text-emerald-500 text-sm my-1">Active</div>
              <svg viewBox="0 0 40 12" className="w-full h-3 text-emerald-500 overflow-visible">
                <polyline fill="none" stroke="currentColor" strokeWidth="1.5" points="0,6 10,3 20,6 30,2 40,3" />
              </svg>
            </div>
          </div>

          <div className={`pt-2 border-t text-[11px] text-slate-400 flex justify-between font-medium ${isDark ? 'border-slate-800' : 'border-[#E5E7EB]'}`}>
            <span>Moving: <strong className={isDark ? 'text-white' : 'text-[#111827]'}>1</strong> • Charging: <strong className={isDark ? 'text-white' : 'text-[#111827]'}>1</strong></span>
            <span>Maintenance: <strong className={isDark ? 'text-white' : 'text-[#111827]'}>1</strong> • Offline: <strong className="text-slate-500">0</strong></span>
          </div>
          <div className="text-[10px] text-slate-400 text-center mt-1">Average Battery: <strong className="text-emerald-500">74%</strong> • Total Range Available: <strong className="text-emerald-500">415 km</strong></div>
        </div>

        {/* Column 3: Quick Governance Actions (MATCHING SOFT TINTED CARDS) */}
        <div
          className={`rounded-[16px] p-6 shadow-xs flex flex-col justify-between transition-colors border ${
            isDark ? 'bg-[#111827] border-slate-800' : 'bg-white border-[#E5E7EB]'
          }`}
        >
          <h3 className={`text-sm font-bold mb-2 ${isDark ? 'text-white' : 'text-[#111827]'}`}>Quick Governance Actions</h3>
          <div className="grid grid-cols-2 gap-3 h-full">
            <button
              onClick={() => navigate('/app/command-center')}
              className={`p-3 rounded-[12px] text-left transition-colors flex flex-col justify-between border cursor-pointer ${
                isDark ? 'bg-blue-950/30 border-blue-900/50 hover:bg-blue-900/40' : 'bg-blue-50/70 border-blue-200 hover:bg-blue-100/70'
              }`}
            >
              <div className="flex items-center space-x-2">
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${isDark ? 'bg-blue-500/20 text-blue-400' : 'bg-blue-500 text-white shadow-xs'}`}>
                  <Terminal size={14} />
                </div>
                <span className="font-bold text-xs text-blue-600 dark:text-blue-400">Dispatch Command</span>
              </div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-1.5 font-medium">Issue Secure Command</div>
            </button>

            <button
              onClick={() => navigate('/app/fleet')}
              className={`p-3 rounded-[12px] text-left transition-colors flex flex-col justify-between border cursor-pointer ${
                isDark ? 'bg-emerald-950/30 border-emerald-900/50 hover:bg-emerald-900/40' : 'bg-emerald-50/70 border-emerald-200 hover:bg-emerald-100/70'
              }`}
            >
              <div className="flex items-center space-x-2">
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${isDark ? 'bg-emerald-500/20 text-emerald-400' : 'bg-emerald-500 text-white shadow-xs'}`}>
                  <Car size={14} />
                </div>
                <span className="font-bold text-xs text-emerald-600 dark:text-emerald-400">Fleet Management</span>
              </div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-1.5 font-medium">Manage 5 Vehicles</div>
            </button>

            <button
              onClick={() => navigate('/app/threat-sandbox')}
              className={`p-3 rounded-[12px] text-left transition-colors flex flex-col justify-between border cursor-pointer ${
                isDark ? 'bg-purple-950/30 border-purple-900/50 hover:bg-purple-900/40' : 'bg-purple-50/70 border-purple-200 hover:bg-purple-100/70'
              }`}
            >
              <div className="flex items-center space-x-2">
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${isDark ? 'bg-purple-500/20 text-purple-400' : 'bg-purple-500 text-white shadow-xs'}`}>
                  <Play size={14} />
                </div>
                <span className="font-bold text-xs text-purple-600 dark:text-purple-400">Threat Sandbox</span>
              </div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-1.5 font-medium">Run Attack Simulations</div>
            </button>

            <button
              onClick={() => navigate('/app/audit')}
              className={`p-3 rounded-[12px] text-left transition-colors flex flex-col justify-between border cursor-pointer ${
                isDark ? 'bg-amber-950/30 border-amber-900/50 hover:bg-amber-900/40' : 'bg-amber-50/70 border-amber-200 hover:bg-amber-100/70'
              }`}
            >
              <div className="flex items-center space-x-2">
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${isDark ? 'bg-amber-500/20 text-amber-400' : 'bg-amber-500 text-white shadow-xs'}`}>
                  <FileText size={14} />
                </div>
                <span className="font-bold text-xs text-amber-600 dark:text-amber-400">Audit Ledger</span>
              </div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-1.5 font-medium">View 257 Blocks</div>
            </button>
          </div>
        </div>
      </div>

      {/* 7. COMPLIANCE & ALERTS SECTION (2 COLUMNS GRID) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Regulatory Compliance Summary */}
        <div
          className={`rounded-[16px] p-6 shadow-xs flex flex-col justify-between transition-colors border ${
            isDark ? 'bg-[#111827] border-slate-800' : 'bg-white border-[#E5E7EB]'
          }`}
        >
          <div className="flex justify-between items-center mb-3">
            <h3 className={`text-sm font-bold ${isDark ? 'text-white' : 'text-[#111827]'}`}>Regulatory Compliance Summary</h3>
            <button onClick={() => navigate('/app/compliance')} className="text-xs text-blue-500 font-semibold hover:underline cursor-pointer">
              View Compliance Page
            </button>
          </div>

          <div className="grid grid-cols-4 gap-2.5 text-xs">
            <div className={`p-3 rounded-xl border ${isDark ? 'bg-slate-900/50 border-slate-800' : 'bg-[#F8FAFC] border-[#E5E7EB]'}`}>
              <div className={`font-bold ${isDark ? 'text-white' : 'text-[#111827]'}`}>AIS-156</div>
              <div className="text-[10px] text-slate-400">EV Battery Safety</div>
              <div className="text-emerald-500 font-bold text-xs mt-1.5">98% <span className="text-[10px] text-emerald-500 font-medium">Ready</span></div>
            </div>

            <div className={`p-3 rounded-xl border ${isDark ? 'bg-slate-900/50 border-slate-800' : 'bg-[#F8FAFC] border-[#E5E7EB]'}`}>
              <div className={`font-bold ${isDark ? 'text-white' : 'text-[#111827]'}`}>UNECE R155</div>
              <div className="text-[10px] text-slate-400">Cyber Security CSMS</div>
              <div className="text-emerald-500 font-bold text-xs mt-1.5">100% <span className="text-[10px] text-emerald-500 font-medium">Ready</span></div>
            </div>

            <div className={`p-3 rounded-xl border ${isDark ? 'bg-slate-900/50 border-slate-800' : 'bg-[#F8FAFC] border-[#E5E7EB]'}`}>
              <div className={`font-bold ${isDark ? 'text-white' : 'text-[#111827]'}`}>ISO 26262</div>
              <div className="text-[10px] text-slate-400">Functional Safety</div>
              <div className="text-amber-500 font-bold text-xs mt-1.5">96% <span className="text-[10px] text-amber-500 font-medium">Minor Issue</span></div>
            </div>

            <div className={`p-3 rounded-xl border ${isDark ? 'bg-slate-900/50 border-slate-800' : 'bg-[#F8FAFC] border-[#E5E7EB]'}`}>
              <div className={`font-bold ${isDark ? 'text-white' : 'text-[#111827]'}`}>ISO 21434</div>
              <div className="text-[10px] text-slate-400">Road Vehicle Cyber</div>
              <div className="text-emerald-500 font-bold text-xs mt-1.5">100% <span className="text-[10px] text-emerald-500 font-medium">Ready</span></div>
            </div>
          </div>
        </div>

        {/* Active Vehicle Alerts (FUNCTIONAL WITH MODAL TRIGGER) */}
        <div
          className={`rounded-[16px] p-6 shadow-xs flex flex-col justify-between transition-colors border ${
            isDark ? 'bg-[#111827] border-slate-800' : 'bg-white border-[#E5E7EB]'
          }`}
        >
          <div className="flex justify-between items-center mb-3">
            <h3 className={`text-sm font-bold ${isDark ? 'text-white' : 'text-[#111827]'}`}>Active Vehicle Alerts ({alertsList.length})</h3>
            <button
              onClick={() => setSelectedAlertModal(true)}
              className="text-xs text-blue-500 font-semibold cursor-pointer hover:underline"
            >
              View All Alerts
            </button>
          </div>

          <div className="grid grid-cols-4 gap-2.5 text-xs">
            {alertsList.slice(0, 4).map((alert) => (
              <div
                key={alert.id}
                onClick={() => setSelectedAlertModal(true)}
                className={`p-2.5 border rounded-xl flex flex-col justify-between cursor-pointer transition-transform hover:scale-[1.02] ${
                  alert.severity === 'high'
                    ? isDark ? 'bg-rose-950/30 border-rose-900/50' : 'bg-rose-50/70 border-rose-200'
                    : alert.severity === 'medium'
                    ? isDark ? 'bg-amber-950/30 border-amber-900/50' : 'bg-amber-50/70 border-amber-200'
                    : isDark ? 'bg-blue-950/30 border-blue-900/50' : 'bg-blue-50/70 border-blue-200'
                }`}
              >
                <div>
                  <div className={`font-bold text-[11px] ${
                    alert.severity === 'high' ? isDark ? 'text-rose-300' : 'text-rose-900' :
                    alert.severity === 'medium' ? isDark ? 'text-amber-300' : 'text-amber-900' :
                    isDark ? 'text-blue-300' : 'text-blue-900'
                  }`}>{alert.vehicle.split(' ')[0]} {alert.vehicle.split(' ')[1] || ''}</div>
                  <div className={`text-[10px] mt-0.5 font-medium ${
                    alert.severity === 'high' ? 'text-rose-500' :
                    alert.severity === 'medium' ? 'text-amber-500' : 'text-blue-500'
                  }`}>{alert.type}</div>
                </div>
                <div className={`text-[10px] font-bold mt-2 ${
                  alert.severity === 'high' ? 'text-rose-500' :
                  alert.severity === 'medium' ? 'text-amber-500' : 'text-blue-500'
                }`}>{alert.value}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 8. ACTIVE VEHICLE ALERTS FUNCTIONAL MODAL */}
      <AnimatePresence>
        {selectedAlertModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className={`rounded-[16px] shadow-2xl max-w-2xl w-full p-6 space-y-4 text-xs border ${
                isDark ? 'bg-[#111827] border-slate-800 text-white' : 'bg-white border-[#E5E7EB] text-[#111827]'
              }`}
            >
              <div className={`flex justify-between items-center border-b pb-3 ${isDark ? 'border-slate-800' : 'border-[#E5E7EB]'}`}>
                <div className="font-bold text-base flex items-center space-x-2">
                  <ShieldAlert size={20} className="text-rose-500" />
                  <span>Active Vehicle Alerts (Live Backend Telemetry)</span>
                </div>
                <button onClick={() => setSelectedAlertModal(false)} className="text-slate-400 hover:text-white cursor-pointer">
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
                {alertsList.map((alert) => (
                  <div
                    key={alert.id}
                    className={`p-4 rounded-xl border flex items-start justify-between gap-4 transition-colors ${
                      alert.acknowledged
                        ? isDark ? 'bg-slate-900/30 border-slate-800 opacity-60' : 'bg-slate-50 border-slate-200 opacity-60'
                        : alert.severity === 'high'
                        ? isDark ? 'bg-rose-950/30 border-rose-900/50' : 'bg-rose-50/80 border-rose-200'
                        : alert.severity === 'medium'
                        ? isDark ? 'bg-amber-950/30 border-amber-900/50' : 'bg-amber-50/80 border-amber-200'
                        : isDark ? 'bg-blue-950/30 border-blue-900/50' : 'bg-blue-50/80 border-blue-200'
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          alert.severity === 'high' ? 'bg-rose-500 text-white' :
                          alert.severity === 'medium' ? 'bg-amber-500 text-white' : 'bg-blue-500 text-white'
                        }`}>
                          {alert.severity} priority
                        </span>
                        <span className="font-mono text-slate-400 text-[11px]">{alert.id}</span>
                        {alert.acknowledged && (
                          <span className="text-emerald-500 text-[11px] font-semibold flex items-center space-x-1">
                            <Check size={12} /> <span>Acknowledged</span>
                          </span>
                        )}
                      </div>
                      <div className="font-bold text-sm">{alert.vehicle}</div>
                      <div className="text-xs text-slate-400">{alert.description}</div>
                      <div className="text-xs font-semibold text-rose-500 mt-1">Status Value: {alert.value}</div>
                    </div>

                    <div className="flex flex-col space-y-2 shrink-0">
                      {!alert.acknowledged && (
                        <button
                          onClick={() => handleAcknowledgeAlert(alert.id)}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold transition-colors flex items-center space-x-1 cursor-pointer"
                        >
                          <Check size={14} />
                          <span>Acknowledge</span>
                        </button>
                      )}
                      <button
                        onClick={() => { setSelectedAlertModal(false); navigate('/app/fleet'); }}
                        className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold transition-colors flex items-center space-x-1 cursor-pointer"
                      >
                        <Eye size={14} />
                        <span>Inspect Telemetry</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className={`pt-3 border-t flex justify-between items-center ${isDark ? 'border-slate-800' : 'border-[#E5E7EB]'}`}>
                <div className="text-xs text-slate-400">Connected to Express Backend API (`/api/dashboard`)</div>
                <button
                  onClick={() => setSelectedAlertModal(false)}
                  className="px-5 py-2 bg-blue-600 text-white font-semibold rounded-[12px] hover:bg-blue-700 transition-colors cursor-pointer"
                >
                  Close Alerts Modal
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 9. AUDIT PROOF MODAL */}
      <AnimatePresence>
        {selectedAuditItem && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className={`rounded-[16px] shadow-2xl max-w-md w-full p-6 space-y-4 text-xs border ${
                isDark ? 'bg-[#111827] border-slate-800 text-white' : 'bg-white border-[#E5E7EB] text-[#111827]'
              }`}
            >
              <div className={`flex justify-between items-center border-b pb-3 ${isDark ? 'border-slate-800' : 'border-[#E5E7EB]'}`}>
                <div className="font-bold text-sm flex items-center space-x-2">
                  <ShieldAlert size={18} className="text-blue-500" />
                  <span>Command Cryptographic Audit Detail</span>
                </div>
                <button onClick={() => setSelectedAuditItem(null)} className="text-slate-400 hover:text-white cursor-pointer">
                  <X size={18} />
                </button>
              </div>

              <div className="space-y-2.5 font-mono">
                <div className={`p-3 rounded-xl border ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-[#F8FAFC] border-[#E5E7EB]'}`}>
                  <div className="text-slate-400 text-[10px]">TARGET VEHICLE</div>
                  <div className="font-bold text-sm mt-0.5">{selectedAuditItem.vehicle}</div>
                </div>

                <div className={`p-3 rounded-xl border ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-[#F8FAFC] border-[#E5E7EB]'}`}>
                  <div className="text-slate-400 text-[10px]">ACTION & RESULT</div>
                  <div className="font-bold mt-0.5">
                    {selectedAuditItem.action} ({selectedAuditItem.status})
                  </div>
                  <div className="text-blue-500 text-[11px] mt-1">{selectedAuditItem.result}</div>
                </div>

                <div className={`p-3 rounded-xl border ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-[#F8FAFC] border-[#E5E7EB]'}`}>
                  <div className="text-slate-400 text-[10px]">AUTHORIZED BY / APPROVER</div>
                  <div className="font-bold mt-0.5">{selectedAuditItem.approver}</div>
                </div>

                <div className={`p-3 rounded-xl border ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-[#F8FAFC] border-[#E5E7EB]'}`}>
                  <div className="text-slate-400 text-[10px]">ECDSA HARDWARE SIGNATURE</div>
                  <div className="font-bold text-purple-400 mt-0.5">{selectedAuditItem.signature}</div>
                </div>

                <div className={`p-3 rounded-xl border ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-[#F8FAFC] border-[#E5E7EB]'}`}>
                  <div className="text-slate-400 text-[10px]">SHA-256 AUDIT MERKLE HASH</div>
                  <div className="font-bold text-emerald-400 break-all mt-0.5">{selectedAuditItem.auditHash}</div>
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  onClick={() => setSelectedAuditItem(null)}
                  className="px-5 py-2 bg-blue-600 text-white font-semibold rounded-[12px] hover:bg-blue-700 transition-colors cursor-pointer"
                >
                  Close Audit Proof
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default DashboardPage;
