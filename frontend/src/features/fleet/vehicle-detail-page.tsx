import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
// @ts-ignore
import { pageVariants } from '@/motion/variants';
import { useTheme } from '@/providers/theme-provider';
import {
  Car,
  Battery,
  ShieldCheck,
  Activity,
  Download,
  Terminal,
  Map,
  FileCheck,
  FileText,
  Clock,
  User,
  Wrench,
  Lock,
  ArrowLeft,
  Wifi,
  Gauge,
  Thermometer,
  Zap,
  CheckCircle2,
  AlertTriangle,
  FileCode,
  ShieldAlert,
  Sliders,
  Send
} from 'lucide-react';

interface VehicleRecordDetails {
  id: string;
  vehicleId?: string;
  make: string;
  model: string;
  vin: string;
  licensePlate: string;
  owner: string;
  driver: string;
  city: string;
  type: string;
  batteryLevel: number;
  range: number;
  speed: number;
  status: string;
  firmwareVersion: string;
  lastSeen: string;
  securityHash: string;
  loanStatus: string;
  insuranceExpiry: string;
  imageEmoji?: string;
}

export function VehicleDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';

  const [vehicle, setVehicle] = useState<VehicleRecordDetails | null>(null);

  useEffect(() => {
    let isMounted = true;
    const fetchVehicleDetails = async () => {
      try {
        const res = await fetch('/api/vehicles');
        if (res.ok && isMounted) {
          const list: VehicleRecordDetails[] = await res.json();
          const found = list.find((v) => v.id === id || v.vehicleId === id);
          if (found) {
            setVehicle({
              ...found,
              id: found.id || id || 'TR-101',
              make: found.make || 'Sargam',
              model: found.model || 'Electric Rickshaw',
              vin: found.vin || 'MH12ER20240001',
              licensePlate: found.licensePlate || 'MH-12-ER-1001',
              owner: found.owner || 'Rajesh Kumar',
              driver: found.driver || 'Rajesh Kumar',
              city: found.city || 'Hyderabad',
              type: found.type || 'Passenger',
              batteryLevel: found.batteryLevel ?? 85,
              range: found.range || 122,
              speed: found.speed ?? (found.status === 'moving' ? 25 : 0),
              status: found.status || 'moving',
              firmwareVersion: found.firmwareVersion || 'v2.5.1',
              lastSeen: found.lastSeen || '2 sec ago',
              securityHash: found.securityHash || '0x8f9a2e3b1c4d5e6f',
              loanStatus: found.loanStatus || 'Active EMI Paid (TrustRide Finance)',
              insuranceExpiry: found.insuranceExpiry || '2026-12-31',
              imageEmoji: '🛺',
            });
          }
        }
      } catch {
        // Fallback
      }
    };

    fetchVehicleDetails();
  }, [id]);

  const defaultDetails: VehicleRecordDetails = {
    id: id || 'TR-101',
    make: 'Sargam',
    model: 'Electric Rickshaw',
    vin: 'MH12ER20240001',
    licensePlate: 'MH-12-ER-1001',
    owner: 'Rajesh Kumar',
    driver: 'Rajesh Kumar',
    city: 'Hyderabad',
    type: 'Passenger',
    batteryLevel: 85,
    range: 122,
    speed: 25,
    status: 'moving',
    firmwareVersion: 'v2.5.1',
    lastSeen: '2 sec ago',
    securityHash: '0x8f9a2e3b1c4d5e6f',
    loanStatus: 'Active EMI Paid (TrustRide Finance)',
    insuranceExpiry: '2026-12-31',
    imageEmoji: '🛺',
  };

  const v = vehicle || defaultDetails;

  const downloadDoc = (docName: string) => {
    alert(`Downloading ${docName} for vehicle ${v.id} (${v.licensePlate})...`);
  };

  return (
    <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit" className="space-y-6 font-sans">
      {/* PAGE HEADER */}
      <div className="flex items-center space-x-4">
        <button
          onClick={() => navigate('/app/fleet')}
          className={`p-2 rounded-xl border transition-colors cursor-pointer ${
            isDark ? 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800' : 'bg-white border-[#E5E7EB] text-[#111827] hover:bg-slate-50'
          }`}
        >
          <ArrowLeft size={18} />
        </button>
        <div>
          <h1 className={`text-[28px] font-bold tracking-tight leading-none ${isDark ? 'text-white' : 'text-[#111827]'}`}>
            {v.make} {v.model}
          </h1>
          <p className={`text-xs mt-1.5 font-mono ${isDark ? 'text-slate-400' : 'text-[#475569]'}`}>
            VIN: {v.vin} • License Plate: {v.licensePlate} • Vehicle ID: {v.id}
          </p>
        </div>
      </div>

      {/* QUICK ACTIONS BUTTONS */}
      <div className={`p-4 rounded-[16px] border shadow-xs flex flex-wrap items-center justify-between gap-3 ${
        isDark ? 'bg-[#111827] border-slate-800' : 'bg-white border-[#E5E7EB]'
      }`}>
        <div className="flex items-center space-x-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs font-bold text-emerald-500">Live Telemetry Active</span>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => navigate('/app/command-center')}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl transition-colors flex items-center space-x-1.5 cursor-pointer"
          >
            <Terminal size={14} /> <span>Dispatch Command</span>
          </button>
          <button
            onClick={() => navigate('/app/digital-twin')}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold rounded-xl transition-colors flex items-center space-x-1.5 cursor-pointer"
          >
            <Map size={14} /> <span>View Digital Twin</span>
          </button>
          <button
            onClick={() => navigate('/app/audit')}
            className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold rounded-xl transition-colors flex items-center space-x-1.5 cursor-pointer"
          >
            <FileCheck size={14} /> <span>Audit Ledger</span>
          </button>
        </div>
      </div>

      {/* SECTION 1: VEHICLE OVERVIEW (WITH DOWNWARDS PADDING & HIGH-CONTRAST BOLD TEXT AS REQUESTED) */}
      <div className={`p-8 pt-10 rounded-[16px] border shadow-xs transition-colors ${
        isDark ? 'bg-[#111827] border-slate-800' : 'bg-white border-[#E5E7EB]'
      }`}>
        <h2 className={`text-base font-bold mb-6 ${isDark ? 'text-white' : 'text-[#111827]'}`}>Section 1: Vehicle Overview & Governance Profile</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-xs pt-2">
          {/* Vehicle Icon Badge */}
          <div className={`p-6 rounded-2xl border flex flex-col items-center justify-center text-center ${
            isDark ? 'bg-slate-900/50 border-slate-800' : 'bg-[#F8FAFC] border-[#E5E7EB]'
          }`}>
            <div className="text-5xl mb-3">{v.imageEmoji || '🛺'}</div>
            <div className={`font-bold text-lg ${isDark ? 'text-white' : 'text-[#111827]'}`}>{v.make} {v.model}</div>
            <div className="text-slate-500 font-bold text-xs mt-1 font-mono">{v.licensePlate}</div>
            <span className="mt-3 px-3 py-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 font-bold rounded-full text-xs">
              ✓ Hash Chain Verified
            </span>
          </div>

          {/* Details Column 1 (HIGH CONTRAST DARK TEXT) */}
          <div className="space-y-4 pt-1">
            <div>
              <span className="text-slate-500 font-bold block text-[11px] uppercase">Vehicle Registration</span>
              <span className={`font-extrabold text-sm ${isDark ? 'text-white' : 'text-[#111827]'}`}>{v.licensePlate}</span>
            </div>
            <div>
              <span className="text-slate-500 font-bold block text-[11px] uppercase">VIN Number</span>
              <span className={`font-mono text-xs font-bold ${isDark ? 'text-slate-200' : 'text-[#111827]'}`}>{v.vin}</span>
            </div>
            <div>
              <span className="text-slate-500 font-bold block text-[11px] uppercase">Assigned Driver</span>
              <span className={`font-extrabold text-sm ${isDark ? 'text-white' : 'text-[#111827]'}`}>{v.driver}</span>
            </div>
            <div>
              <span className="text-slate-500 font-bold block text-[11px] uppercase">Registered Owner</span>
              <span className={`font-extrabold text-sm ${isDark ? 'text-white' : 'text-[#111827]'}`}>{v.owner}</span>
            </div>
          </div>

          {/* Details Column 2 */}
          <div className="space-y-4 pt-1">
            <div>
              <span className="text-slate-500 font-bold block text-[11px] uppercase">Current Operational Status</span>
              <span className="font-extrabold text-emerald-600 dark:text-emerald-400 text-sm capitalize">{v.status} ({v.speed} km/h)</span>
            </div>
            <div>
              <span className="text-slate-500 font-bold block text-[11px] uppercase">Battery & Range</span>
              <span className="font-extrabold text-sm text-blue-600 dark:text-blue-400">{v.batteryLevel}% ({v.range} km remaining)</span>
            </div>
            <div>
              <span className="text-slate-500 font-bold block text-[11px] uppercase">Firmware Version</span>
              <span className="font-mono font-extrabold text-purple-600 dark:text-purple-400">{v.firmwareVersion} (UNECE R155 CSMS)</span>
            </div>
            <div>
              <span className="text-slate-500 font-bold block text-[11px] uppercase">Location City</span>
              <span className={`font-bold ${isDark ? 'text-slate-200' : 'text-[#111827]'}`}>{v.city}, India</span>
            </div>
          </div>

          {/* Details Column 3 */}
          <div className="space-y-4 pt-1">
            <div>
              <span className="text-slate-500 font-bold block text-[11px] uppercase">Loan Status</span>
              <span className="font-extrabold text-emerald-600 dark:text-emerald-400 text-sm">{v.loanStatus}</span>
            </div>
            <div>
              <span className="text-slate-500 font-bold block text-[11px] uppercase">Insurance Expiry</span>
              <span className={`font-bold ${isDark ? 'text-slate-200' : 'text-[#111827]'}`}>{v.insuranceExpiry}</span>
            </div>
            <div>
              <span className="text-slate-500 font-bold block text-[11px] uppercase">Hardware Security Module</span>
              <span className="font-mono text-xs font-bold text-emerald-600 dark:text-emerald-400">ECDSA P-256 Provisioned</span>
            </div>
            <div>
              <span className="text-slate-500 font-bold block text-[11px] uppercase">Last Sync Timestamp</span>
              <span className={`font-mono font-bold ${isDark ? 'text-slate-300' : 'text-[#111827]'}`}>{v.lastSeen}</span>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 2: LIVE TELEMETRY CARDS (HIGH CONTRAST IN LIGHT MODE) */}
      <div className={`p-6 rounded-[16px] border shadow-xs transition-colors ${
        isDark ? 'bg-[#111827] border-slate-800' : 'bg-white border-[#E5E7EB]'
      }`}>
        <h2 className={`text-base font-bold mb-4 ${isDark ? 'text-white' : 'text-[#111827]'}`}>Section 2: Real-time Live Sensor Telemetry</h2>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs">
          <div className={`p-3.5 rounded-xl border ${isDark ? 'bg-slate-900/50 border-slate-800' : 'bg-[#F8FAFC] border-[#E5E7EB]'}`}>
            <div className="text-slate-500 font-bold text-[10px] uppercase">Battery SOC</div>
            <div className="text-lg font-extrabold text-emerald-600 dark:text-emerald-400 mt-1">{v.batteryLevel}%</div>
            <div className="text-[10px] text-slate-500 font-semibold">48.2V Nominal Pack</div>
          </div>

          <div className={`p-3.5 rounded-xl border ${isDark ? 'bg-slate-900/50 border-slate-800' : 'bg-[#F8FAFC] border-[#E5E7EB]'}`}>
            <div className="text-slate-500 font-bold text-[10px] uppercase">Vehicle Speed</div>
            <div className="text-lg font-extrabold text-blue-600 dark:text-blue-400 mt-1">{v.speed} km/h</div>
            <div className="text-[10px] text-slate-500 font-semibold">0 km/h Motion Guard</div>
          </div>

          <div className={`p-3.5 rounded-xl border ${isDark ? 'bg-slate-900/50 border-slate-800' : 'bg-[#F8FAFC] border-[#E5E7EB]'}`}>
            <div className="text-slate-500 font-bold text-[10px] uppercase">GPS Location</div>
            <div className={`text-sm font-extrabold mt-1 ${isDark ? 'text-slate-100' : 'text-[#111827]'}`}>17.3850, 78.4867</div>
            <div className="text-[10px] text-slate-500 font-semibold">Banjara Hills, Hyd</div>
          </div>

          <div className={`p-3.5 rounded-xl border ${isDark ? 'bg-slate-900/50 border-slate-800' : 'bg-[#F8FAFC] border-[#E5E7EB]'}`}>
            <div className="text-slate-500 font-bold text-[10px] uppercase">Motor Temp</div>
            <div className="text-lg font-extrabold text-emerald-600 dark:text-emerald-400 mt-1">45.2°C</div>
            <div className="text-[10px] text-slate-500 font-semibold">Normal Range (&lt;75°C)</div>
          </div>

          <div className={`p-3.5 rounded-xl border ${isDark ? 'bg-slate-900/50 border-slate-800' : 'bg-[#F8FAFC] border-[#E5E7EB]'}`}>
            <div className="text-slate-500 font-bold text-[10px] uppercase">Controller Temp</div>
            <div className="text-lg font-extrabold text-emerald-600 dark:text-emerald-400 mt-1">38.4°C</div>
            <div className="text-[10px] text-slate-500 font-semibold">Cooling Active</div>
          </div>
        </div>
      </div>

      {/* SECTION 5: SECURITY TIMELINE (DARK HIGH-CONTRAST TEXT FOR ECDSA, SHA, API AS REQUESTED) */}
      <div className={`p-6 rounded-[16px] border shadow-xs transition-colors ${
        isDark ? 'bg-[#111827] border-slate-800' : 'bg-white border-[#E5E7EB]'
      }`}>
        <h2 className={`text-base font-bold mb-4 ${isDark ? 'text-white' : 'text-[#111827]'}`}>Section 5: Cryptographic Security Event Timeline</h2>
        <div className="space-y-4 text-xs">
          <div className="flex items-start space-x-3">
            <span className="w-3 h-3 rounded-full bg-emerald-500 mt-1 shrink-0" />
            <div>
              <div className={`font-extrabold text-sm ${isDark ? 'text-white' : 'text-[#111827]'}`}>
                ECDSA P-256 Hardware Signature Verified
              </div>
              <div className={`text-xs font-mono font-bold mt-0.5 ${isDark ? 'text-slate-300' : 'text-slate-800'}`}>
                14:30:12 • HSM Key ID: fin-001 • Merkle Root SHA-256 Verified
              </div>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <span className="w-3 h-3 rounded-full bg-blue-500 mt-1 shrink-0" />
            <div>
              <div className={`font-extrabold text-sm ${isDark ? 'text-white' : 'text-[#111827]'}`}>
                Replay Protection & Spent Nonce Guard Active
              </div>
              <div className={`text-xs font-mono font-bold mt-0.5 ${isDark ? 'text-slate-300' : 'text-slate-800'}`}>
                14:25:00 • Nonce #99121 Validated • Counter Incremented
              </div>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <span className="w-3 h-3 rounded-full bg-purple-500 mt-1 shrink-0" />
            <div>
              <div className={`font-extrabold text-sm ${isDark ? 'text-white' : 'text-[#111827]'}`}>
                0 km/h Motion Interlock Safety Engine Triggered
              </div>
              <div className={`text-xs font-mono font-bold mt-0.5 ${isDark ? 'text-slate-300' : 'text-slate-800'}`}>
                14:24:50 • Speed 25 km/h &gt; 0 km/h threshold
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default VehicleDetailPage;
