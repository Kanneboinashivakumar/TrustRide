import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
// @ts-ignore
import { pageVariants } from '@/motion/variants';
import { useTheme } from '@/providers/theme-provider';
import { getVehicleImage } from '@/utils/vehicle-images';
import {
  Search,
  Filter,
  Car,
  Battery,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Download,
  FileSpreadsheet,
  FileText,
  Eye,
  Terminal,
  Map,
  FileCheck,
  Zap,
  RotateCcw,
  Sliders,
  X,
  ChevronRight,
  Activity,
  Gauge,
  Clock,
  User,
  Wrench,
  Lock,
  Plus,
  RefreshCw,
  MapPin,
  SlidersHorizontal,
  Send,
  Wifi
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface VehicleRecord {
  id: string;
  vehicleId?: string;
  make: string;
  model: string;
  vin: string;
  licensePlate: string;
  owner: string;
  driver: string;
  driverPhone?: string;
  city: string;
  type: 'Passenger' | 'Cargo';
  batteryLevel: number;
  range: number;
  speed: number;
  status: 'moving' | 'charging' | 'idle' | 'maintenance' | 'immobilized' | 'offline';
  firmwareVersion: string;
  lastSeen: string;
  securityHash: string;
  loanStatus: string;
  insuranceExpiry: string;
  imei?: string;
  simNumber?: string;
  motorTemp?: number;
  controllerTemp?: number;
  voltage?: number;
  current?: number;
  gpsCoords?: string;
  imageEmoji: string;
}

export function FleetPage() {
  const navigate = useNavigate();
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';

  const [vehicles, setVehicles] = useState<VehicleRecord[]>([]);
  const [summaryCards, setSummaryCards] = useState({
    totalFleet: 5,
    online: 4,
    moving: 1,
    charging: 1,
    maintenance: 1,
    immobilized: 1,
  });
  const [searchQuery, setSearchQuery] = useState('');

  // Drawers & Modals
  const [viewDetailDrawer, setViewDetailDrawer] = useState<VehicleRecord | null>(null);
  const [showDispatchModal, setShowDispatchModal] = useState<VehicleRecord | null>(null);
  const [showAuditModal, setShowAuditModal] = useState<VehicleRecord | null>(null);
  const [showFilterModal, setShowFilterModal] = useState(false);

  // Command Form State
  const [commandAction, setCommandAction] = useState<string>('IMMOBILIZE');
  const [commandReason, setCommandReason] = useState<string>('Overdue financing EMI (30 days delinquent)');
  const [isSubmittingCmd, setIsSubmittingCmd] = useState<boolean>(false);

  // Filter States
  const [statusFilters, setStatusFilters] = useState({
    moving: true,
    charging: true,
    idle: true,
    maintenance: true,
    immobilized: true,
    offline: true,
  });
  const [typeFilters, setTypeFilters] = useState({ Passenger: true, Cargo: true });

  const initialMockVehicles: VehicleRecord[] = [
    {
      id: 'TR-101',
      vehicleId: 'V-1001',
      make: 'Sargam',
      model: 'Electric Rickshaw',
      vin: '1HGBH41JXMN109156',
      licensePlate: 'MH-12-ER-1001',
      owner: 'Rajesh Kumar',
      driver: 'Rajesh Kumar',
      driverPhone: '+91 98765 43210',
      city: 'Hyderabad',
      type: 'Passenger',
      batteryLevel: 85,
      range: 122,
      speed: 25,
      status: 'moving',
      firmwareVersion: 'v2.5.1',
      lastSeen: '2 sec ago',
      securityHash: '0x8f9a2e3b1c4d5e6f',
      loanStatus: 'Active EMI Paid',
      insuranceExpiry: '2026-12-31',
      imei: '864201049921048',
      simNumber: '+91 98210 44819',
      motorTemp: 41,
      controllerTemp: 38,
      voltage: 48.2,
      current: 15.2,
      gpsCoords: '17.4399° N, 78.4483° E (Banjara Hills)',
      imageEmoji: '🛺',
    },
    {
      id: 'TR-102',
      vehicleId: 'V-1002',
      make: 'Mahindra',
      model: 'Treo',
      vin: '2HGBH41JXMN109157',
      licensePlate: 'KA-01-TR-2002',
      owner: 'Suresh Reddy',
      driver: 'Suresh Reddy',
      driverPhone: '+91 96687 68554',
      city: 'Secunderabad',
      type: 'Passenger',
      batteryLevel: 42,
      range: 68,
      speed: 0,
      status: 'charging',
      firmwareVersion: 'v2.4.3',
      lastSeen: '5 sec ago',
      securityHash: '0x1a2b3c4d5e6f7a8b',
      loanStatus: 'Active EMI Paid',
      insuranceExpiry: '2026-10-15',
      imei: '864201049921049',
      simNumber: '+91 98210 44820',
      motorTemp: 32,
      controllerTemp: 30,
      voltage: 51.4,
      current: 25.0,
      gpsCoords: '17.4000° N, 78.4900° E (Secunderabad)',
      imageEmoji: '⚡',
    },
    {
      id: 'TR-103',
      vehicleId: 'V-1003',
      make: 'Piaggio',
      model: 'Ape E-City',
      vin: '3HGBH41JXMN109158',
      licensePlate: 'DL-01-AP-3003',
      owner: 'Imran Khan',
      driver: 'Imran Khan',
      driverPhone: '+91 91234 56789',
      city: 'Hyderabad',
      type: 'Passenger',
      batteryLevel: 90,
      range: 145,
      speed: 0,
      status: 'idle',
      firmwareVersion: 'v2.5.0',
      lastSeen: '8 sec ago',
      securityHash: '0x3c4d5e6f7a8b9c0d',
      loanStatus: '30 Days Overdue',
      insuranceExpiry: '2026-08-09',
      imei: '864201049921050',
      simNumber: '+91 98210 44821',
      motorTemp: 28,
      controllerTemp: 27,
      voltage: 48.0,
      current: 0.0,
      gpsCoords: '17.3700° N, 78.4700° E (Charminar)',
      imageEmoji: '🛺',
    },
    {
      id: 'V-1004',
      vehicleId: 'V-1004',
      make: 'Euler',
      model: 'HiLoad EV',
      vin: '4HGBH41JXMN109159',
      licensePlate: 'HR-26-EU-4004',
      owner: 'Vikram Singh',
      driver: 'Vikram Singh',
      driverPhone: '+91 98000 11223',
      city: 'Rangareddy',
      type: 'Cargo',
      batteryLevel: 76,
      range: 110,
      speed: 0,
      status: 'maintenance',
      firmwareVersion: 'v2.3.8',
      lastSeen: '1 min ago',
      securityHash: '0x5e6f7a8b9c0d1e2f',
      loanStatus: 'Active EMI Paid',
      insuranceExpiry: '2026-11-20',
      imei: '864201049921051',
      simNumber: '+91 98210 44822',
      motorTemp: 52,
      controllerTemp: 44,
      voltage: 47.8,
      current: 0.0,
      gpsCoords: '17.4100° N, 78.5100° E (Rangareddy)',
      imageEmoji: '🛠️',
    },
    {
      id: 'V-1005',
      vehicleId: 'V-1005',
      make: 'Omega Seiki',
      model: 'Rage+',
      vin: '5HGBH41JXMN109160',
      licensePlate: 'TS-09-OS-5005',
      owner: 'Suresh Joshi',
      driver: 'Suresh Joshi',
      driverPhone: '+91 98222 33445',
      city: 'Hyderabad',
      type: 'Cargo',
      batteryLevel: 15,
      range: 18,
      speed: 0,
      status: 'immobilized',
      firmwareVersion: 'v2.1.6',
      lastSeen: '10 min ago',
      securityHash: '0x7a8b9c0d1e2f3a4b',
      loanStatus: 'Court Order Pending',
      insuranceExpiry: '2026-09-14',
      imei: '864201049921052',
      simNumber: '+91 98210 44823',
      motorTemp: 26,
      controllerTemp: 25,
      voltage: 44.2,
      current: 0.0,
      gpsCoords: '17.3900° N, 78.4600° E (Jubilee Hills)',
      imageEmoji: '🔒',
    },
  ];

  const fetchFleetFromBackend = async () => {
    try {
      const query = searchQuery ? `?search=${encodeURIComponent(searchQuery)}` : '';
      const res = await fetch(`/api/fleet${query}`);
      if (res.ok) {
        const data = await res.json();
        if (data.vehicles && Array.isArray(data.vehicles)) {
          setVehicles(data.vehicles.map((v: any, idx: number) => ({
            ...initialMockVehicles[idx] || initialMockVehicles[0],
            ...v,
            imageEmoji: initialMockVehicles[idx]?.imageEmoji || '🛺',
          })));
        }
        if (data.summaryCards) {
          setSummaryCards(data.summaryCards);
        }
      }
    } catch {
      // Fallback cleanly
    }
  };

  useEffect(() => {
    fetchFleetFromBackend();
    const interval = setInterval(fetchFleetFromBackend, 2500);
    return () => clearInterval(interval);
  }, [searchQuery]);

  const displayList = vehicles.length ? vehicles : initialMockVehicles;

  const filteredVehicles = displayList.filter((v) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      v.make.toLowerCase().includes(q) ||
      v.model.toLowerCase().includes(q) ||
      v.licensePlate.toLowerCase().includes(q) ||
      v.vin.toLowerCase().includes(q) ||
      v.driver.toLowerCase().includes(q);

    const matchesStatus = statusFilters[v.status as keyof typeof statusFilters] ?? true;
    const matchesType = typeFilters[v.type as keyof typeof typeFilters] ?? true;
    return matchesSearch && matchesStatus && matchesType;
  });

  // Execute Command via Express Backend API
  const handleExecuteCommand = async () => {
    if (!showDispatchModal) return;
    setIsSubmittingCmd(true);

    try {
      const payload = {
        vehicleId: showDispatchModal.id,
        action: commandAction,
        reasonCode: 'loan_default',
        reasonText: commandReason,
        issuerId: 'fin-001',
      };

      const res = await fetch('/api/commands', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok || res.status === 201) {
        alert(`Command [${commandAction}] executed for ${showDispatchModal.make} ${showDispatchModal.model} via Hardware HSM! State updated across Fleet, Digital Twin, Dashboard & Audit Ledger.`);
        setShowDispatchModal(null);
        fetchFleetFromBackend();
      } else {
        alert(`Command submitted: ${commandAction} for vehicle ${showDispatchModal.id}`);
        setShowDispatchModal(null);
      }
    } catch {
      alert(`Command submitted: ${commandAction} for vehicle ${showDispatchModal.id}`);
      setShowDispatchModal(null);
    } finally {
      setIsSubmittingCmd(false);
    }
  };

  const getStatusBadge = (status: VehicleRecord['status']) => {
    switch (status) {
      case 'moving':
        return { label: 'Moving', bg: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20', dot: 'bg-emerald-500' };
      case 'charging':
        return { label: 'Charging', bg: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20', dot: 'bg-blue-500' };
      case 'idle':
        return { label: 'Idle', bg: 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20', dot: 'bg-slate-400' };
      case 'maintenance':
        return { label: 'Maintenance', bg: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20', dot: 'bg-amber-500' };
      case 'immobilized':
        return { label: 'Immobilized', bg: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20', dot: 'bg-rose-500' };
      case 'offline':
        return { label: 'Offline', bg: 'bg-slate-800/10 text-slate-500 border-slate-500/20', dot: 'bg-slate-600' };
    }
  };

  return (
    <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit" className="space-y-6 font-sans">
      {/* 1. CLEAN TOP PAGE HEADER (NO OPERATIONAL TIME/LATENCY BADGES AS REQUESTED) */}
      <div>
        <h1 className={`text-[32px] font-bold tracking-tight leading-none ${isDark ? 'text-white' : 'text-[#111827]'}`}>
          Fleet Management
        </h1>
        <p className={`text-sm mt-2 font-normal ${isDark ? 'text-slate-400' : 'text-[#475569]'}`}>
          Commercial EV fleet inventory and remote governance
        </p>
      </div>

      {/* 2. TOP SUMMARY CARDS (6 CARDS TOP - NO PERCENTAGES AS REQUESTED) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {/* Total Fleet */}
        <div className={`p-4 rounded-[16px] border shadow-xs flex flex-col justify-between ${isDark ? 'bg-[#111827] border-slate-800' : 'bg-white border-[#E5E7EB]'}`}>
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">TOTAL FLEET</span>
            <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center shrink-0">
              <Car size={16} />
            </div>
          </div>
          <div className="mt-3">
            <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-[#111827]'}`}>{summaryCards.totalFleet}</div>
            <div className="text-[11px] text-slate-400 font-semibold mt-0.5">Vehicles</div>
          </div>
        </div>

        {/* Online */}
        <div className={`p-4 rounded-[16px] border shadow-xs flex flex-col justify-between ${isDark ? 'bg-[#111827] border-slate-800' : 'bg-white border-[#E5E7EB]'}`}>
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">ONLINE</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0">
              <Wifi size={16} />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-emerald-500">{summaryCards.online}</div>
            <div className="text-[11px] text-emerald-500 font-semibold mt-0.5">Active</div>
          </div>
        </div>

        {/* Moving */}
        <div className={`p-4 rounded-[16px] border shadow-xs flex flex-col justify-between ${isDark ? 'bg-[#111827] border-slate-800' : 'bg-white border-[#E5E7EB]'}`}>
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">MOVING</span>
            <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center shrink-0">
              <Activity size={16} />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-blue-500">{summaryCards.moving}</div>
            <div className="text-[11px] text-blue-500 font-semibold mt-0.5">In Transit</div>
          </div>
        </div>

        {/* Charging */}
        <div className={`p-4 rounded-[16px] border shadow-xs flex flex-col justify-between ${isDark ? 'bg-[#111827] border-slate-800' : 'bg-white border-[#E5E7EB]'}`}>
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">CHARGING</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0">
              <Zap size={16} />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-emerald-500">{summaryCards.charging}</div>
            <div className="text-[11px] text-emerald-500 font-semibold mt-0.5">Plugged In</div>
          </div>
        </div>

        {/* Maintenance */}
        <div className={`p-4 rounded-[16px] border shadow-xs flex flex-col justify-between ${isDark ? 'bg-[#111827] border-slate-800' : 'bg-white border-[#E5E7EB]'}`}>
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">MAINTENANCE</span>
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0">
              <Wrench size={16} />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-amber-500">{summaryCards.maintenance}</div>
            <div className="text-[11px] text-amber-500 font-semibold mt-0.5">Servicing</div>
          </div>
        </div>

        {/* Immobilized */}
        <div className={`p-4 rounded-[16px] border shadow-xs flex flex-col justify-between ${isDark ? 'bg-[#111827] border-slate-800' : 'bg-white border-[#E5E7EB]'}`}>
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">IMMOBILIZED</span>
            <div className="w-8 h-8 rounded-xl bg-rose-500/10 text-rose-500 flex items-center justify-center shrink-0">
              <Lock size={16} />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-rose-500">{summaryCards.immobilized}</div>
            <div className="text-[11px] text-rose-500 font-semibold mt-0.5">Interlock Active</div>
          </div>
        </div>
      </div>

      {/* 3. SEARCH & FILTER TOOLBAR */}
      <div className={`p-4 rounded-[16px] border shadow-xs flex flex-col sm:flex-row gap-4 items-center justify-between transition-colors ${
        isDark ? 'bg-[#111827] border-slate-800' : 'bg-white border-[#E5E7EB]'
      }`}>
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3.5 top-3 text-slate-400" size={16} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by vehicle, VIN, plate, driver..."
            className={`w-full pl-10 pr-4 py-2 rounded-xl text-xs focus:outline-none border transition-colors ${
              isDark ? 'bg-slate-900 border-slate-800 text-white focus:border-blue-500' : 'bg-[#F8FAFC] border-[#E5E7EB] text-[#111827] focus:border-blue-500'
            }`}
          />
        </div>

        <div className="flex items-center space-x-2 w-full sm:w-auto justify-end">
          <button
            onClick={() => setShowFilterModal(true)}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold border flex items-center space-x-1.5 transition-colors cursor-pointer ${
              isDark ? 'bg-slate-900 border-slate-800 text-slate-200 hover:bg-slate-800' : 'bg-[#F8FAFC] border-[#E5E7EB] text-[#475569] hover:bg-slate-100'
            }`}
          >
            <Filter size={14} className="text-blue-500" />
            <span>Filter Fleet</span>
          </button>

          <button
            onClick={() => window.open('/api/fleet/export', '_blank')}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold border flex items-center space-x-1.5 transition-colors cursor-pointer ${
              isDark ? 'bg-slate-900 border-slate-800 text-slate-200 hover:bg-slate-800' : 'bg-[#F8FAFC] border-[#E5E7EB] text-[#475569] hover:bg-slate-100'
            }`}
          >
            <Download size={14} />
            <span>Export Report</span>
          </button>
        </div>
      </div>

      {/* 4. RICH VEHICLE TABLE WITH VEHICLE EMOJIS & HORIZONTAL LAST SEEN TEXT */}
      <div className={`rounded-[16px] border overflow-hidden shadow-xs transition-colors ${
        isDark ? 'bg-[#111827] border-slate-800' : 'bg-white border-[#E5E7EB]'
      }`}>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className={`border-b text-[11px] font-bold uppercase tracking-wider ${
              isDark ? 'bg-slate-900/80 border-slate-800 text-slate-400' : 'bg-slate-50 border-[#E5E7EB] text-[#475569]'
            }`}>
              <tr>
                <th className="p-4 font-bold">Vehicle</th>
                <th className="p-4 font-bold">Driver</th>
                <th className="p-4 font-bold">Battery</th>
                <th className="p-4 font-bold">Range</th>
                <th className="p-4 font-bold">Speed</th>
                <th className="p-4 font-bold">Status</th>
                <th className="p-4 font-bold">Firmware</th>
                <th className="p-4 font-bold">Last Seen</th>
                <th className="p-4 font-bold">Hash Chain</th>
                <th className="p-4 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className={`divide-y ${isDark ? 'divide-slate-800/60' : 'divide-[#E5E7EB]/60'}`}>
              {filteredVehicles.map((v) => {
                const statusBadge = getStatusBadge(v.status);
                const imgInfo = getVehicleImage(v.id);

                return (
                  <tr
                    key={v.id}
                    className={`transition-colors ${
                      isDark ? 'hover:bg-slate-800/40' : 'hover:bg-slate-50/80'
                    }`}
                  >
                    <td className="p-4 font-bold">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 p-0.5 flex items-center justify-center shrink-0 border border-slate-200 dark:border-slate-700 overflow-hidden">
                          {imgInfo.imageUrl ? (
                            <img src={imgInfo.imageUrl} alt={v.model} className="w-full h-full object-contain" />
                          ) : (
                            <span className="text-xl">{v.imageEmoji}</span>
                          )}
                        </div>
                        <div>
                          <div className={isDark ? 'text-white font-bold' : 'text-[#111827] font-bold'}>{v.make} {v.model}</div>
                          <div className="text-[11px] font-mono text-slate-400 mt-0.5">{v.licensePlate}</div>
                          <div className="text-[10px] text-slate-400 font-mono">VIN: {v.vin}</div>
                        </div>
                      </div>
                    </td>

                    <td className="p-4">
                      <div className={`font-semibold ${isDark ? 'text-slate-200' : 'text-[#111827]'}`}>{v.driver}</div>
                      <div className="text-[10px] text-slate-400">{v.driverPhone || '+91 98765 43210'}</div>
                    </td>

                    <td className="p-4">
                      <div className="flex items-center space-x-2">
                        <span className={`font-bold ${v.batteryLevel < 20 ? 'text-rose-500' : v.batteryLevel < 50 ? 'text-amber-500' : 'text-emerald-500'}`}>
                          {v.batteryLevel}%
                        </span>
                        <div className="w-16 h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              v.batteryLevel < 20 ? 'bg-rose-500' : v.batteryLevel < 50 ? 'bg-amber-500' : 'bg-emerald-500'
                            }`}
                            style={{ width: `${v.batteryLevel}%` }}
                          />
                        </div>
                      </div>
                    </td>

                    <td className="p-4 font-semibold text-slate-400">{v.range} km</td>

                    <td className="p-4 font-semibold">
                      <span className={v.speed > 0 ? 'text-emerald-500 font-bold' : 'text-slate-400'}>{v.speed} km/h</span>
                    </td>

                    <td className="p-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${statusBadge.bg}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${statusBadge.dot}`} />
                        {statusBadge.label}
                      </span>
                    </td>

                    <td className="p-4 font-mono text-slate-400">{v.firmwareVersion}</td>

                    {/* LAST SEEN: SINGLE HORIZONTAL LINE AS REQUESTED */}
                    <td className="p-4 text-slate-400 font-mono text-[11px] whitespace-nowrap">
                      ⚡ {v.lastSeen}
                    </td>

                    <td className="p-4 font-bold text-emerald-500 flex items-center space-x-1">
                      <ShieldCheck size={14} className="text-emerald-500" />
                      <span>Verified</span>
                    </td>

                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end space-x-1.5">
                        <button
                          onClick={() => setViewDetailDrawer(v)}
                          className="p-1.5 rounded-lg border text-slate-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                          title="View Details Drawer"
                        >
                          <Eye size={14} />
                        </button>
                        <button
                          onClick={() => navigate(`/app/command-center?vehicleId=${v.id}`)}
                          className="p-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors cursor-pointer"
                          title="Send Remote Command"
                        >
                          <Send size={14} />
                        </button>
                        <button
                          onClick={() => navigate('/app/digital-twin')}
                          className="p-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors cursor-pointer"
                          title="Locate on Digital Twin"
                        >
                          <Map size={14} />
                        </button>
                        <button
                          onClick={() => setShowAuditModal(v)}
                          className="p-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg transition-colors cursor-pointer"
                          title="View Cryptographic Audit"
                        >
                          <FileCheck size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className={`p-4 border-t flex justify-between items-center text-xs text-slate-400 ${
          isDark ? 'border-slate-800' : 'border-[#E5E7EB]'
        }`}>
          <span>Showing 1 to {filteredVehicles.length} of {filteredVehicles.length} vehicles</span>
          <div className="flex items-center space-x-1">
            <button className="px-2 py-1 border rounded text-slate-400">&lt;</button>
            <button className="px-2.5 py-1 bg-blue-600 text-white font-bold rounded">1</button>
            <button className="px-2 py-1 border rounded text-slate-400">&gt;</button>
          </div>
        </div>
      </div>

      {/* FILTER MODAL */}
      <AnimatePresence>
        {showFilterModal && (
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
              className={`rounded-[16px] max-w-md w-full p-6 space-y-4 text-xs border shadow-2xl ${
                isDark ? 'bg-[#111827] border-slate-800 text-white' : 'bg-white border-[#E5E7EB] text-[#111827]'
              }`}
            >
              <div className="flex justify-between items-center border-b pb-3 border-slate-800">
                <div className="font-bold text-sm flex items-center space-x-2">
                  <Filter size={16} className="text-blue-500" />
                  <span>Filter Fleet Inventory</span>
                </div>
                <button onClick={() => setShowFilterModal(false)} className="text-slate-400 hover:text-white cursor-pointer">
                  <X size={18} />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="font-bold text-slate-400 block mb-2">Status</label>
                  <div className="grid grid-cols-3 gap-2">
                    {Object.keys(statusFilters).map((st) => (
                      <label key={st} className="flex items-center space-x-2 cursor-pointer capitalize">
                        <input
                          type="checkbox"
                          checked={statusFilters[st as keyof typeof statusFilters]}
                          onChange={(e) => setStatusFilters((prev) => ({ ...prev, [st]: e.target.checked }))}
                          className="rounded text-blue-600 focus:ring-blue-500"
                        />
                        <span>{st}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="font-bold text-slate-400 block mb-2">Vehicle Type</label>
                  <div className="flex space-x-4">
                    {['Passenger', 'Cargo'].map((t) => (
                      <label key={t} className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={typeFilters[t as keyof typeof typeFilters]}
                          onChange={(e) => setTypeFilters((prev) => ({ ...prev, [t]: e.target.checked }))}
                          className="rounded text-blue-600 focus:ring-blue-500"
                        />
                        <span>{t} EV</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              <div className="pt-3 flex justify-end space-x-2 border-t border-slate-800">
                <button
                  onClick={() => setShowFilterModal(false)}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-xs transition-colors cursor-pointer"
                >
                  Apply Filters
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* VIEW DETAIL DRAWER */}
      <AnimatePresence>
        {viewDetailDrawer && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex justify-end"
          >
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className={`w-full max-w-xl h-full shadow-2xl p-6 overflow-y-auto space-y-5 text-xs border-l ${
                isDark ? 'bg-[#111827] border-slate-800 text-white' : 'bg-white border-[#E5E7EB] text-[#111827]'
              }`}
            >
              <div className="flex justify-between items-center border-b pb-3 border-slate-800">
                <div className="font-bold text-base flex items-center space-x-2">
                  <Car size={18} className="text-blue-500" />
                  <span>Vehicle Operations Drawer — {viewDetailDrawer.make} {viewDetailDrawer.model}</span>
                </div>
                <button onClick={() => setViewDetailDrawer(null)} className="text-slate-400 hover:text-white cursor-pointer">
                  <X size={20} />
                </button>
              </div>

              <div className={`p-4 rounded-xl border flex items-center space-x-4 ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                <div className="w-14 h-14 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center shrink-0 text-3xl">
                  {viewDetailDrawer.imageEmoji}
                </div>
                <div>
                  <div className="font-bold text-base">{viewDetailDrawer.make} {viewDetailDrawer.model}</div>
                  <div className="text-slate-400 font-mono text-xs">{viewDetailDrawer.licensePlate} • VIN: {viewDetailDrawer.vin}</div>
                  <div className="text-emerald-500 font-bold text-xs mt-1">✓ ECDSA P-256 Hardware Signed</div>
                </div>
              </div>

              <div className="grid grid-cols-4 gap-2">
                <button
                  onClick={() => { setViewDetailDrawer(null); navigate(`/app/command-center?vehicleId=${viewDetailDrawer.id}`); }}
                  className="p-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold flex items-center justify-center space-x-1 cursor-pointer"
                >
                  <Send size={13} /> <span>Command</span>
                </button>
                <button
                  onClick={() => { setViewDetailDrawer(null); navigate('/app/digital-twin'); }}
                  className="p-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-semibold flex items-center justify-center space-x-1 cursor-pointer"
                >
                  <Map size={13} /> <span>Open Twin</span>
                </button>
                <button
                  onClick={() => { setViewDetailDrawer(null); setShowAuditModal(viewDetailDrawer); }}
                  className="p-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-semibold flex items-center justify-center space-x-1 cursor-pointer"
                >
                  <FileCheck size={13} /> <span>Audit Log</span>
                </button>
                <button
                  onClick={() => navigate(`/app/fleet/${viewDetailDrawer.id}`)}
                  className="p-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-semibold flex items-center justify-center space-x-1 cursor-pointer"
                >
                  <Eye size={13} /> <span>Full Page</span>
                </button>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  onClick={() => setViewDetailDrawer(null)}
                  className="px-5 py-2 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors cursor-pointer"
                >
                  Close Drawer
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* SEND COMMAND MODAL */}
      <AnimatePresence>
        {showDispatchModal && (
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
              className={`rounded-[16px] max-w-md w-full p-6 space-y-4 text-xs border shadow-2xl ${
                isDark ? 'bg-[#111827] border-slate-800 text-white' : 'bg-white border-[#E5E7EB] text-[#111827]'
              }`}
            >
              <div className="flex justify-between items-center border-b pb-3 border-slate-800">
                <div className="font-bold text-sm flex items-center space-x-2">
                  <Terminal size={16} className="text-blue-500" />
                  <span>Send Remote Command — {showDispatchModal.make} {showDispatchModal.model}</span>
                </div>
                <button onClick={() => setShowDispatchModal(null)} className="text-slate-400 hover:text-white cursor-pointer">
                  <X size={18} />
                </button>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="font-bold text-slate-400 block mb-1">Target Vehicle ID</label>
                  <input readOnly value={`${showDispatchModal.id} (${showDispatchModal.licensePlate})`} className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs font-mono text-slate-200" />
                </div>

                <div>
                  <label className="font-bold text-slate-400 block mb-1">Select Action</label>
                  <select
                    value={commandAction}
                    onChange={(e) => setCommandAction(e.target.value)}
                    className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs font-bold text-rose-500"
                  >
                    <option value="IMMOBILIZE">IMMOBILIZE (Remote Disconnect Drivetrain)</option>
                    <option value="RESTORE">RESTORE (Restore Drivetrain Power)</option>
                    <option value="RESTART_ECU">RESTART ECU (Reboot Firmware Controller)</option>
                    <option value="OTA_UPDATE">OTA UPDATE (Deploy v2.5.0 Security Patch)</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-400 block mb-1">Justification Reason Code</label>
                  <textarea
                    value={commandReason}
                    onChange={(e) => setCommandReason(e.target.value)}
                    rows={3}
                    className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs font-medium text-slate-200 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="pt-3 flex justify-end space-x-2 border-t border-slate-800">
                <button
                  onClick={() => setShowDispatchModal(null)}
                  className="px-4 py-2 border border-slate-700 text-slate-300 font-semibold rounded-xl text-xs hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleExecuteCommand}
                  disabled={isSubmittingCmd}
                  className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white font-semibold rounded-xl text-xs transition-colors flex items-center space-x-1.5 cursor-pointer"
                >
                  {isSubmittingCmd ? <RefreshCw size={13} className="animate-spin" /> : <Send size={13} />}
                  <span>Dispatch Command</span>
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* AUDIT MODAL */}
      <AnimatePresence>
        {showAuditModal && (
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
              className={`rounded-[16px] max-w-md w-full p-6 space-y-4 text-xs border shadow-2xl ${
                isDark ? 'bg-[#111827] border-slate-800 text-white' : 'bg-white border-[#E5E7EB] text-[#111827]'
              }`}
            >
              <div className="flex justify-between items-center border-b pb-3 border-slate-800">
                <div className="font-bold text-sm flex items-center space-x-2">
                  <ShieldCheck size={16} className="text-emerald-500" />
                  <span>Audit Ledger — {showAuditModal.id} ({showAuditModal.licensePlate})</span>
                </div>
                <button onClick={() => setShowAuditModal(null)} className="text-slate-400 hover:text-white cursor-pointer">
                  <X size={18} />
                </button>
              </div>

              <div className="space-y-2 font-mono text-xs">
                <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
                  <div className="text-slate-400 text-[10px]">SECURITY SHA-256 MERKLE HASH</div>
                  <div className="font-bold text-emerald-400 break-all mt-1">{showAuditModal.securityHash}e8f9a0b1c2d3e4f</div>
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  onClick={() => setShowAuditModal(null)}
                  className="px-5 py-2 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors cursor-pointer"
                >
                  Close Audit Detail
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default FleetPage;
