import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
// @ts-ignore
import { pageVariants } from '@/motion/variants';
import { useTheme } from '@/providers/theme-provider';
import { getVehicleImage } from '@/utils/vehicle-images';
import { LeafletMap, MapVehicle } from '@/components/LeafletMap';
import {
  Car,
  Activity,
  Battery,
  ShieldCheck,
  Zap,
  Radio,
  Clock,
  Play,
  Pause,
  RotateCcw,
  Compass,
  MapPin,
  Flame,
  Gauge,
  Wifi,
  ShieldAlert,
  ChevronRight,
  Sliders,
  CheckCircle2,
  X,
  Eye,
  Layers,
  Send,
  Lock,
  Wrench,
  AlertTriangle,
  RefreshCw,
  Key
} from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';

interface DigitalTwinVehicle extends MapVehicle {
  driver: string;
  locationAddress: string;
  health: 'Healthy' | 'Warning' | 'Critical';
  motorTemp: number;
  controllerTemp: number;
  voltage: number;
  current: number;
  odometer: number;
  heading: number;
  range: number;
  firmwareVersion: string;
  imageEmoji: string;
  doorStatus?: string;
  digitalKeyStatus?: string;
}

export function DigitalTwinPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const urlVehicleId = searchParams.get('vehicleId');
  const urlAction = searchParams.get('action');

  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';

  const [selectedId, setSelectedId] = useState<string>(urlVehicleId || 'TR-102');
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [isFollowing, setIsFollowing] = useState<boolean>(true);
  const [centerTrigger, setCenterTrigger] = useState<number>(0);
  const [mapMode, setMapMode] = useState<'street' | 'satellite'>('street');

  useEffect(() => {
    if (urlVehicleId) setSelectedId(urlVehicleId);
  }, [urlVehicleId]);

  // PRECISE HYDERABAD ROAD LANE COORDINATES ALONG NH65 (Punjagutta -> Ameerpet -> SR Nagar -> Erragadda -> Kukatpally)
  const routePoints: [number, number][] = [
    [17.4260, 78.4530], // Punjagutta Junction
    [17.4290, 78.4510], // Ameerpet Metro Station
    [17.4320, 78.4490], // Ameerpet Cross Roads
    [17.4350, 78.4480], // Ameerpet Main Road
    [17.4380, 78.4460], // Mythrivanam
    [17.4420, 78.4430], // SR Nagar Metro Station
    [17.4460, 78.4390], // ESI Hospital
    [17.4500, 78.4350], // Erragadda Main Road
    [17.4540, 78.4310], // Gokul Theatre Junction
    [17.4580, 78.4280], // Moosapet Junction
    [17.4630, 78.4240], // Bharat Nagar Flyover
    [17.4680, 78.4200], // Kukatpally Y Junction
    [17.4740, 78.4150], // Kukatpally Metro Station
    [17.4800, 78.4100], // KPHB Colony Metro
  ];

  const [sargamIndex, setSargamIndex] = useState<number>(3); // Start at Ameerpet Main Road
  const [sargamSpeed, setSargamSpeed] = useState<number>(18); // Realistic slow EV Rickshaw speed

  // 5 Commercial EV Digital Twins
  const [twinVehicles, setTwinVehicles] = useState<DigitalTwinVehicle[]>([
    {
      id: 'TR-101',
      name: 'Sargam Electric Rickshaw',
      plate: 'MH-12-ER-1001',
      lat: 17.4350,
      lng: 78.4480,
      speed: 18,
      battery: 85,
      range: 122,
      status: 'moving',
      isMoving: true,
      type: 'Passenger',
      driver: 'Rajesh Kumar',
      locationAddress: 'Ameerpet Main Road (NH65 Lane), Hyderabad',
      health: 'Healthy',
      motorTemp: 41,
      controllerTemp: 38,
      voltage: 48.2,
      current: 15.2,
      odometer: 12420,
      heading: 45,
      firmwareVersion: 'v2.5.1',
      imageEmoji: '🛺',
    },
    {
      id: 'TR-102',
      name: 'Mahindra Treo',
      plate: 'KA-01-TR-2002',
      lat: 17.4420,
      lng: 78.4430,
      speed: 0,
      battery: 42,
      range: 68,
      status: 'charging',
      isMoving: false,
      type: 'Passenger',
      driver: 'Suresh Reddy',
      locationAddress: 'SR Nagar EV Station',
      health: 'Healthy',
      motorTemp: 32,
      controllerTemp: 30,
      voltage: 51.4,
      current: 25.0,
      odometer: 8200,
      heading: 0,
      firmwareVersion: 'v2.4.3',
      imageEmoji: '⚡',
    },
    {
      id: 'TR-103',
      name: 'Piaggio Ape E-City',
      plate: 'DL-01-AP-3003',
      lat: 17.4260,
      lng: 78.4530,
      speed: 0,
      battery: 90,
      range: 145,
      status: 'idle',
      isMoving: false,
      type: 'Passenger',
      driver: 'Imran Khan',
      locationAddress: 'Punjagutta Junction Park',
      health: 'Healthy',
      motorTemp: 28,
      controllerTemp: 27,
      voltage: 48.0,
      current: 0.0,
      odometer: 15400,
      heading: 90,
      firmwareVersion: 'v2.5.0',
      imageEmoji: '🛺',
    },
    {
      id: 'V-1004',
      name: 'Euler HiLoad EV',
      plate: 'HR-26-EU-4004',
      lat: 17.4500,
      lng: 78.4350,
      speed: 0,
      battery: 76,
      range: 110,
      status: 'maintenance',
      isMoving: false,
      type: 'Cargo',
      driver: 'Vikram Singh',
      locationAddress: 'Erragadda Depot',
      health: 'Warning',
      motorTemp: 52,
      controllerTemp: 44,
      voltage: 47.8,
      current: 0.0,
      odometer: 9100,
      heading: 180,
      firmwareVersion: 'v2.3.8',
      imageEmoji: '🛠️',
    },
    {
      id: 'V-1005',
      name: 'Omega Seiki Rage+',
      plate: 'TS-09-OS-5005',
      lat: 17.4680,
      lng: 78.4200,
      speed: 0,
      battery: 15,
      range: 18,
      status: 'immobilized',
      isMoving: false,
      immobilized: true,
      type: 'Cargo',
      driver: 'Suresh Joshi',
      locationAddress: 'Kukatpally Y Junction Hub',
      health: 'Critical',
      motorTemp: 26,
      controllerTemp: 25,
      voltage: 44.2,
      current: 0.0,
      odometer: 21500,
      heading: 270,
      firmwareVersion: 'v2.1.6',
      imageEmoji: '🔒',
    },
  ]);

  // Fetch live backend digital twin telemetry & status
  const fetchDigitalTwinBackend = async () => {
    try {
      // Sync URL action to persistent sessionStorage
      const targetId = urlVehicleId || selectedId;
      const storedRaw = sessionStorage.getItem('immobilizedVehicleIds');
      let storedIds: string[] = storedRaw ? JSON.parse(storedRaw) : [];

      if (urlAction === 'IMMOBILIZE') {
        if (!storedIds.includes(targetId)) storedIds.push(targetId);
        if ((targetId === 'TR-101' || targetId === 'V-1001') && !storedIds.includes('TR-101')) storedIds.push('TR-101');
        sessionStorage.setItem('immobilizedVehicleIds', JSON.stringify(storedIds));
      } else if (urlAction && urlAction.toUpperCase().includes('RESTORE')) {
        storedIds = storedIds.filter((id) => id !== targetId && !((targetId === 'TR-101' || targetId === 'V-1001') && (id === 'TR-101' || id === 'V-1001')));
        sessionStorage.setItem('immobilizedVehicleIds', JSON.stringify(storedIds));
      }

      const res = await fetch('/api/digitalTwin');
      if (res.ok) {
        const data = await res.json();
        if (data.vehicles && Array.isArray(data.vehicles)) {
          setTwinVehicles((currentList) =>
            currentList.map((tv) => {
              const matched = data.vehicles.find((bv: any) => bv.id === tv.id || (tv.id === 'TR-101' && (bv.id === 'TR-101' || bv.id === 'V-1001')));
              const isStoredImmobilized = storedIds.includes(tv.id) || (tv.id === 'TR-101' && storedIds.includes('V-1001'));
              const isUrlRestored = urlAction && urlAction.toUpperCase().includes('RESTORE') && (tv.id === targetId || (tv.id === 'TR-101' && targetId === 'V-1001'));

              let isImmobilized = !isUrlRestored && (isStoredImmobilized || matched?.immobilized || matched?.status === 'disabled' || matched?.status === 'immobilized' || (urlAction === 'IMMOBILIZE' && (tv.id === targetId || tv.id === 'TR-101')));

              return {
                ...tv,
                speed: isImmobilized ? 0 : (isUrlRestored ? 28 : (matched?.speed || tv.speed)),
                battery: matched?.battery ?? tv.battery,
                status: isImmobilized ? 'immobilized' : (isUrlRestored ? 'moving' : (matched?.status || tv.status)),
                isMoving: isImmobilized ? false : (isUrlRestored ? true : (matched?.isMoving ?? tv.isMoving)),
                immobilized: isImmobilized,
                locationAddress: isImmobilized ? 'Stationary — Motor Isolated at Ameerpet Main Road' : (tv.locationAddress || 'Ameerpet Main Road (NH65 Lane), Hyderabad'),
              };
            })
          );
        }
      }
    } catch {
      // Fallback
    }
  };

  useEffect(() => {
    fetchDigitalTwinBackend();
    const pollInterval = setInterval(fetchDigitalTwinBackend, 2000);
    return () => clearInterval(pollInterval);
  }, [urlAction, urlVehicleId, selectedId]);

  // Live multi-vehicle movement loop (All active vehicles cruise independently along route offsets)
  const [routeStepIndex, setRouteStepIndex] = useState<number>(0);

  useEffect(() => {
    if (isPaused) return;

    const timer = setInterval(() => {
      setRouteStepIndex((prevIndex) => {
        const nextStep = (prevIndex + 1) % routePoints.length;
        const storedRaw = sessionStorage.getItem('immobilizedVehicleIds');
        const storedIds: string[] = storedRaw ? JSON.parse(storedRaw) : [];

        setTwinVehicles((currentList) =>
          currentList.map((v, i) => {
            const targetId = urlVehicleId || selectedId;
            const isStoredImmobilized = storedIds.includes(v.id) || (v.id === 'TR-101' && storedIds.includes('V-1001'));
            const isUrlRestored = urlAction && urlAction.toUpperCase().includes('RESTORE') && (v.id === targetId || (v.id === 'TR-101' && targetId === 'V-1001'));
            const isImmobilized = !isUrlRestored && (v.immobilized || v.status === 'immobilized' || v.status === 'disabled' || isStoredImmobilized || (urlAction === 'IMMOBILIZE' && (v.id === targetId || v.id === 'TR-101')));

            if (isImmobilized) {
              return {
                ...v,
                speed: 0,
                isMoving: false,
                status: 'immobilized',
                immobilized: true,
                locationAddress: 'Stationary — Motor Isolated at Ameerpet Main Road',
              };
            }

            // Calculate staggered route offset per active vehicle
            const offsetIdx = (nextStep + i * 2) % routePoints.length;
            const coord = routePoints[offsetIdx];

            return {
              ...v,
              lat: coord[0],
              lng: coord[1],
              speed: v.speed || 22,
              isMoving: true,
              status: 'moving',
              battery: Math.max(10, v.battery - (Math.random() > 0.9 ? 1 : 0)),
            };
          })
        );

        return nextStep;
      });
    }, 3500);

    return () => clearInterval(timer);
  }, [isPaused, urlAction, urlVehicleId, selectedId]);

  const selectedVehicle = twinVehicles.find((v) => v.id === selectedId) || twinVehicles[0];
  const selectedImg = getVehicleImage(selectedVehicle.id);

  // Map Control Actions
  const handleFollowVehicle = () => {
    setSelectedId('TR-101');
    setIsFollowing(true);
    setIsPaused(false);
  };

  const handleCenterMap = () => {
    setIsFollowing(false);
    setCenterTrigger((prev) => prev + 1);
  };

  const handleReplayRoute = () => {
    setSargamIndex(0);
    setSelectedId('TR-101');
    setIsFollowing(true);
    setIsPaused(false);
  };

  const [decelerationSpeed, setDecelerationSpeed] = useState<number | null>(urlAction === 'IMMOBILIZE' ? 28 : null);
  const [accelerationSpeed, setAccelerationSpeed] = useState<number | null>(
    urlAction && (urlAction.toUpperCase().includes('RESTORE') || urlAction.toUpperCase() === 'CANCEL') ? 0 : null
  );
  const [doorAlert, setDoorAlert] = useState<string | null>(
    urlAction === 'LOCK_DOORS' ? 'LOCK_DOORS' : urlAction === 'UNLOCK_DOORS' ? 'UNLOCK_DOORS' : null
  );
  const [otaProgress, setOtaProgress] = useState<number | null>(urlAction === 'OTA_UPDATE' ? 0 : null);
  const [keyAlert, setKeyAlert] = useState<boolean>(urlAction === 'DISABLE_DIGITAL_KEY');

  useEffect(() => {
    const targetId = urlVehicleId || selectedId || 'TR-101';
    setSelectedId(targetId);

    if (urlAction === 'IMMOBILIZE') {
      const speeds = [28, 24, 18, 12, 7, 3, 0];
      let i = 0;
      const decelTimer = setInterval(() => {
        if (i < speeds.length) {
          const currentSpd = speeds[i];
          setDecelerationSpeed(currentSpd);
          setTwinVehicles((prevList) =>
            prevList.map((tv) => {
              if (tv.id === targetId) {
                return {
                  ...tv,
                  speed: currentSpd,
                  isMoving: currentSpd > 0,
                  status: currentSpd === 0 ? 'immobilized' : 'moving',
                  immobilized: currentSpd === 0,
                };
              }
              return tv;
            })
          );
          i++;
        } else {
          clearInterval(decelTimer);
        }
      }, 400);
      return () => clearInterval(decelTimer);
    } else if (urlAction && (urlAction.toUpperCase().includes('RESTORE') || urlAction.toUpperCase() === 'CANCEL')) {
      const speeds = [0, 5, 12, 18, 24, 28];
      let i = 0;
      const accelTimer = setInterval(() => {
        if (i < speeds.length) {
          const currentSpd = speeds[i];
          setAccelerationSpeed(currentSpd);
          setTwinVehicles((prevList) =>
            prevList.map((tv) => {
              if (tv.id === targetId) {
                return {
                  ...tv,
                  speed: currentSpd,
                  isMoving: true,
                  status: 'moving',
                  immobilized: false,
                };
              }
              return tv;
            })
          );
          i++;
        } else {
          clearInterval(accelTimer);
        }
      }, 400);
      return () => clearInterval(accelTimer);
    } else if (urlAction === 'LOCK_DOORS' || urlAction === 'UNLOCK_DOORS') {
      const isLock = urlAction === 'LOCK_DOORS';
      setTwinVehicles((prevList) =>
        prevList.map((tv) => {
          if (tv.id === targetId) {
            return {
              ...tv,
              doorStatus: isLock ? 'locked' : 'unlocked',
            };
          }
          return tv;
        })
      );
    } else if (urlAction === 'OTA_UPDATE') {
      let pct = 0;
      const otaTimer = setInterval(() => {
        pct += 25;
        setOtaProgress(Math.min(pct, 100));
        if (pct >= 100) {
          clearInterval(otaTimer);
          setTwinVehicles((prevList) =>
            prevList.map((tv) => {
              if (tv.id === targetId) {
                return {
                  ...tv,
                  firmwareVersion: 'v2.5.1',
                };
              }
              return tv;
            })
          );
        }
      }, 400);
      return () => clearInterval(otaTimer);
    } else if (urlAction === 'DISABLE_DIGITAL_KEY') {
      setTwinVehicles((prevList) =>
        prevList.map((tv) => {
          if (tv.id === targetId) {
            return {
              ...tv,
              digitalKeyStatus: 'revoked',
            };
          }
          return tv;
        })
      );
    }
  }, [urlAction, urlVehicleId]);

  return (
    <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit" className="space-y-4 font-sans">
      {/* 1. CLEAN TOP PAGE HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className={`text-[32px] font-bold tracking-tight leading-none ${isDark ? 'text-white' : 'text-[#111827]'}`}>
            Digital Twin
          </h1>
          <p className={`text-sm mt-2 font-normal ${isDark ? 'text-slate-400' : 'text-[#475569]'}`}>
            Real-time virtual representation of fleet status and telemetry
          </p>
        </div>

        {/* 2 MAP VARIANTS SWITCHER */}
        <div className="flex items-center space-x-2">
          <div className={`p-1 rounded-xl border flex items-center space-x-1 ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-[#E5E7EB]'}`}>
            <button
              onClick={() => setMapMode('street')}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                mapMode === 'street'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : isDark
                  ? 'text-slate-200 hover:bg-slate-800'
                  : 'text-slate-800 hover:bg-slate-200'
              }`}
            >
              Street View
            </button>

            <button
              onClick={() => setMapMode('satellite')}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                mapMode === 'satellite'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : isDark
                  ? 'text-slate-200 hover:bg-slate-800'
                  : 'text-slate-800 hover:bg-slate-200'
              }`}
            >
              Satellite
            </button>
          </div>

          <button
            onClick={() => navigate('/app/fleet')}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-xs transition-colors flex items-center space-x-1 cursor-pointer"
          >
            <span>Open Fleet</span>
          </button>
        </div>
      </div>

      {/* IMMOBILIZATION SLOWDOWN ALERT BANNER */}
      {decelerationSpeed !== null && (
        <div className="p-3.5 bg-rose-500/10 border border-rose-500/30 rounded-xl text-xs font-bold text-rose-500 flex items-center justify-between shadow-xs">
          <div className="flex items-center space-x-2">
            <ShieldAlert size={18} className="animate-pulse text-rose-500 shrink-0" />
            <span>
              {decelerationSpeed > 0
                ? `⚠️ Remote Immobilization Active: Vehicle ${selectedId} decelerating from 28 km/h to 0 km/h (Current: ${decelerationSpeed} km/h)`
                : `🔒 Remote Immobilization Complete: Vehicle ${selectedId} brought to 0 km/h — Drivetrain Safely Isolated`}
            </span>
          </div>
          <span className="px-2.5 py-1 bg-rose-600 text-white font-mono font-bold rounded-lg text-[11px] shrink-0">
            Speed: {decelerationSpeed} km/h
          </span>
        </div>
      )}

      {/* RESTORE ACCELERATION ALERT BANNER */}
      {accelerationSpeed !== null && (
        <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-xs font-bold text-emerald-500 flex items-center justify-between shadow-xs">
          <div className="flex items-center space-x-2">
            <CheckCircle2 size={18} className="animate-pulse text-emerald-500 shrink-0" />
            <span>
              {accelerationSpeed < 28
                ? `✅ Vehicle Restoration Active: Vehicle ${selectedId} drivetrain re-enabled — accelerating to 28 km/h (Current: ${accelerationSpeed} km/h)`
                : `⚡ Vehicle Restoration Complete: Vehicle ${selectedId} operating normally at 28 km/h`}
            </span>
          </div>
          <span className="px-2.5 py-1 bg-emerald-600 text-white font-mono font-bold rounded-lg text-[11px] shrink-0">
            Speed: {accelerationSpeed} km/h
          </span>
        </div>
      )}

      {/* DOOR LOCK / UNLOCK ALERT BANNER */}
      {doorAlert !== null && (
        <div className="p-3.5 bg-blue-500/10 border border-blue-500/30 rounded-xl text-xs font-bold text-blue-500 flex items-center justify-between shadow-xs">
          <div className="flex items-center space-x-2">
            <Lock size={18} className="text-blue-500 shrink-0" />
            <span>
              {doorAlert === 'LOCK_DOORS'
                ? `🔒 Remote Door Lock Complete: Vehicle ${selectedId} doors locked securely — Driving control remains unaffected`
                : `🔓 Remote Door Unlock Complete: Vehicle ${selectedId} doors unlocked for driver access`}
            </span>
          </div>
          <span className="px-2.5 py-1 bg-blue-600 text-white font-mono font-bold rounded-lg text-[11px] shrink-0">
            Door Status: {doorAlert === 'LOCK_DOORS' ? 'Locked 🔒' : 'Unlocked 🔓'}
          </span>
        </div>
      )}

      {/* OTA UPDATE PROGRESS BANNER */}
      {otaProgress !== null && (
        <div className="p-3.5 bg-purple-500/10 border border-purple-500/30 rounded-xl text-xs font-bold text-purple-400 flex items-center justify-between shadow-xs">
          <div className="flex items-center space-x-2">
            <RefreshCw size={18} className={`shrink-0 ${otaProgress < 100 ? 'animate-spin text-purple-400' : 'text-emerald-400'}`} />
            <span>
              {otaProgress < 100
                ? `🔄 OTA Firmware Update in Progress for ${selectedId}... (${otaProgress}%)`
                : `⚡ OTA Firmware Update Complete: Vehicle ${selectedId} upgraded to v2.5.1`}
            </span>
          </div>
          <span className="px-2.5 py-1 bg-purple-600 text-white font-mono font-bold rounded-lg text-[11px] shrink-0">
            Firmware: {otaProgress < 100 ? `v2.4.3 (${otaProgress}%)` : 'v2.5.1 ✓'}
          </span>
        </div>
      )}

      {/* DIGITAL KEY DISABLE ALERT BANNER */}
      {keyAlert && (
        <div className="p-3.5 bg-amber-500/10 border border-amber-500/30 rounded-xl text-xs font-bold text-amber-500 flex items-center justify-between shadow-xs">
          <div className="flex items-center space-x-2">
            <Key size={18} className="text-amber-500 shrink-0" />
            <span>
              🚫 Digital Key Access Revoked: Mobile credentials disabled for Vehicle {selectedId} — Physical master key override active
            </span>
          </div>
          <span className="px-2.5 py-1 bg-amber-600 text-white font-mono font-bold rounded-lg text-[11px] shrink-0">
            Key Status: Revoked 🚫
          </span>
        </div>
      )}

      {/* 2. MAIN MAP DISPLAY (FULL WIDTH MAP + LEFT ACTIVE VEHICLES PANEL) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 h-[calc(100vh-17rem)] min-h-[480px]">
        {/* Left Side Panel: Active Vehicles (5) */}
        <div className={`lg:col-span-4 rounded-[16px] border flex flex-col overflow-hidden shadow-xs transition-colors ${
          isDark ? 'bg-[#111827] border-slate-800' : 'bg-white border-[#E5E7EB]'
        }`}>
          <div className={`p-3.5 border-b font-bold text-xs flex justify-between items-center ${isDark ? 'border-slate-800 text-white' : 'border-[#E5E7EB] text-[#111827]'}`}>
            <span>Active Vehicles (5)</span>
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
            {twinVehicles.map((v) => {
              const isSelected = v.id === selectedId;
              const imgInfo = getVehicleImage(v.id);
              let statusDot = 'bg-emerald-500';
              let speedText = `${v.speed} km/h`;
              if (v.status === 'charging') { statusDot = 'bg-blue-500'; speedText = '0 km/h (Charging)'; }
              if (v.status === 'idle') { statusDot = 'bg-slate-400'; speedText = '0 km/h (Idle)'; }
              if (v.status === 'maintenance') { statusDot = 'bg-amber-500'; speedText = '0 km/h (Maintenance)'; }
              if (v.status === 'immobilized') { statusDot = 'bg-rose-500'; speedText = '0 km/h (Immobilized)'; }

              return (
                <div
                  key={v.id}
                  onClick={() => {
                    setSelectedId(v.id);
                    if (v.id === 'TR-101') setIsFollowing(true);
                  }}
                  className={`p-3 rounded-xl border cursor-pointer transition-all text-xs ${
                    isSelected
                      ? 'border-blue-500 bg-blue-500/10 shadow-xs'
                      : isDark
                      ? 'border-slate-800/80 bg-slate-900/40 hover:border-slate-700'
                      : 'border-slate-200 bg-slate-50/60 hover:border-slate-300'
                  }`}
                >
                  <div className="flex justify-between items-start mb-1">
                    <div className="flex items-center space-x-2.5 font-bold">
                      <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-800 p-0.5 flex items-center justify-center shrink-0 border border-slate-200 dark:border-slate-700 overflow-hidden">
                        {imgInfo.imageUrl ? (
                          <img src={imgInfo.imageUrl} alt={v.name} className="w-full h-full object-contain" />
                        ) : (
                          <span className="text-xl">{v.imageEmoji}</span>
                        )}
                      </div>
                      <div>
                        <div className={`font-bold ${isDark ? 'text-white' : 'text-[#111827]'}`}>{v.name}</div>
                        <div className="text-[11px] text-slate-400 font-mono">{v.plate}</div>
                      </div>
                    </div>
                    <span className={`w-2.5 h-2.5 rounded-full ${statusDot}`} />
                  </div>

                  <div className="flex justify-between items-center text-xs mt-2 font-extrabold">
                    <span className={isDark ? 'text-slate-300' : 'text-[#111827]'}>{speedText}</span>
                    <span>Battery: <strong className="text-blue-600 dark:text-blue-400 font-extrabold">{v.battery}%</strong></span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Side Map Container */}
        <div className="lg:col-span-8 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[16px] relative overflow-hidden shadow-sm flex flex-col min-h-[480px]">
          <LeafletMap
            vehicles={twinVehicles}
            selectedId={selectedId}
            onSelectVehicle={(id) => {
              setSelectedId(id);
              if (id === 'TR-101') setIsFollowing(true);
            }}
            mapMode={mapMode}
            followVehicle={isFollowing}
            centerTrigger={centerTrigger}
          />
        </div>
      </div>

      {/* 3. BOTTOM CONTAINER: SELECTED VEHICLE BANNER, TELEMETRY METRICS & MAP CONTROLS */}
      <div className={`p-5 rounded-[16px] border shadow-xs space-y-4 transition-colors ${
        isDark ? 'bg-[#111827] border-slate-800' : 'bg-white border-[#E5E7EB]'
      }`}>
        {/* Selected Vehicle Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b pb-3 border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 p-0.5 flex items-center justify-center shrink-0 border border-slate-200 dark:border-slate-700 overflow-hidden">
              {selectedImg.imageUrl ? (
                <img src={selectedImg.imageUrl} alt={selectedVehicle.name} className="w-full h-full object-contain" />
              ) : (
                <span className="text-2xl">{selectedVehicle.imageEmoji}</span>
              )}
            </div>
            <div>
              <div className={`font-bold text-base ${isDark ? 'text-white' : 'text-[#111827]'}`}>
                {selectedVehicle.name} ({selectedVehicle.plate})
              </div>
              <div className="text-xs text-slate-400 font-mono mt-0.5">
                Location: <strong className="text-blue-500 font-bold">{selectedVehicle.lat.toFixed(4)}° N, {selectedVehicle.lng.toFixed(4)}° E ({selectedVehicle.locationAddress})</strong>
              </div>
            </div>
          </div>

          <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase self-start sm:self-auto ${
            selectedVehicle.status === 'moving' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20' :
            selectedVehicle.status === 'charging' ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20' :
            selectedVehicle.status === 'maintenance' ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20' :
            'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20'
          }`}>
            ● {selectedVehicle.status}
          </span>
        </div>

        {/* 6 Quick Telemetry Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-6 gap-3 text-xs">
          <div className={`p-3.5 rounded-xl border ${isDark ? 'bg-slate-900/50 border-slate-800' : 'bg-[#F8FAFC] border-[#E5E7EB]'}`}>
            <div className="text-slate-500 font-bold text-[10px]">SPEED</div>
            <div className="text-xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-1">{selectedVehicle.speed} km/h</div>
          </div>
          <div className={`p-3.5 rounded-xl border ${isDark ? 'bg-slate-900/50 border-slate-800' : 'bg-[#F8FAFC] border-[#E5E7EB]'}`}>
            <div className="text-slate-500 font-bold text-[10px]">BATTERY</div>
            <div className="text-xl font-extrabold text-blue-600 dark:text-blue-400 mt-1">{selectedVehicle.battery}%</div>
          </div>
          <div className={`p-3.5 rounded-xl border ${isDark ? 'bg-slate-900/50 border-slate-800' : 'bg-[#F8FAFC] border-[#E5E7EB]'}`}>
            <div className="text-slate-500 font-bold text-[10px]">RANGE</div>
            <div className={`text-xl font-extrabold mt-1 ${isDark ? 'text-slate-100' : 'text-[#111827]'}`}>{selectedVehicle.range} km</div>
          </div>
          <div className={`p-3.5 rounded-xl border ${isDark ? 'bg-slate-900/50 border-slate-800' : 'bg-[#F8FAFC] border-[#E5E7EB]'}`}>
            <div className="text-slate-500 font-bold text-[10px]">MOTOR TEMP</div>
            <div className="text-xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-1">{selectedVehicle.motorTemp}°C</div>
          </div>
          <div className={`p-3.5 rounded-xl border ${isDark ? 'bg-slate-900/50 border-slate-800' : 'bg-[#F8FAFC] border-[#E5E7EB]'}`}>
            <div className="text-slate-500 font-bold text-[10px]">CONTROLLER TEMP</div>
            <div className="text-xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-1">{selectedVehicle.controllerTemp}°C</div>
          </div>
          <div className={`p-3.5 rounded-xl border ${isDark ? 'bg-slate-900/50 border-slate-800' : 'bg-[#F8FAFC] border-[#E5E7EB]'}`}>
            <div className="text-slate-500 font-bold text-[10px]">VOLTAGE / CURRENT</div>
            <div className="text-sm font-extrabold text-purple-600 dark:text-purple-400 mt-1">{selectedVehicle.voltage}V / {selectedVehicle.current}A</div>
          </div>
        </div>

        {/* Secondary Security & Metadata Row */}
        <div className={`p-3.5 rounded-xl border text-xs flex flex-wrap justify-between items-center gap-2 font-mono ${
          isDark ? 'bg-slate-900/50 border-slate-800 text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-800'
        }`}>
          <div>Door Status: <strong className={selectedVehicle.doorStatus === 'locked' ? 'text-emerald-500 font-bold' : 'text-blue-500 font-bold'}>
            {selectedVehicle.doorStatus === 'locked' ? 'Locked 🔒' : 'Unlocked 🔓'}
          </strong></div>
          <div>Digital Key: <strong className={selectedVehicle.digitalKeyStatus === 'revoked' ? 'text-rose-500 font-bold' : 'text-emerald-500 font-bold'}>
            {selectedVehicle.digitalKeyStatus === 'revoked' ? 'Revoked 🚫' : 'Active 🔑'}
          </strong></div>
          <div>Firmware: <strong className="text-purple-600 dark:text-purple-400 font-bold">{selectedVehicle.firmwareVersion}</strong></div>
          <div>Hash Chain: <strong className="text-emerald-600 dark:text-emerald-400 font-bold">✓ Verified</strong></div>
          <div>ECDSA Signature: <strong className="text-emerald-600 dark:text-emerald-400 font-bold">✓ Valid</strong></div>
        </div>

        {/* 100% WORKING TWIN MAP CONTROLS BAR */}
        <div>
          <div className="font-bold text-slate-400 text-[10px] uppercase mb-2">TWIN MAP CONTROLS</div>
          <div className="flex flex-wrap gap-2.5">
            <button
              onClick={handleFollowVehicle}
              className={`px-5 py-2.5 text-white font-bold rounded-xl text-xs transition-colors cursor-pointer ${
                isFollowing ? 'bg-blue-600 shadow-xs ring-2 ring-blue-500/40' : 'bg-slate-800 hover:bg-slate-700'
              }`}
            >
              Follow Vehicle
            </button>

            <button
              onClick={handleCenterMap}
              className={`px-4 py-2.5 rounded-xl font-bold text-xs border transition-colors cursor-pointer ${
                isDark ? 'bg-slate-900 border-slate-800 text-slate-200 hover:bg-slate-800' : 'bg-slate-100 border-slate-200 text-slate-800 hover:bg-slate-200'
              }`}
            >
              Center Map
            </button>

            <button
              onClick={handleReplayRoute}
              className={`px-4 py-2.5 rounded-xl font-bold text-xs border transition-colors cursor-pointer ${
                isDark ? 'bg-slate-900 border-slate-800 text-slate-200 hover:bg-slate-800' : 'bg-slate-100 border-slate-200 text-slate-800 hover:bg-slate-200'
              }`}
            >
              Replay Route
            </button>

            <button
              onClick={() => setIsPaused((p) => !p)}
              className={`px-4 py-2.5 rounded-xl font-bold text-xs border transition-colors cursor-pointer ${
                isDark ? 'bg-slate-900 border-slate-800 text-slate-200 hover:bg-slate-800' : 'bg-slate-100 border-slate-200 text-slate-800 hover:bg-slate-200'
              }`}
            >
              {isPaused ? 'Resume Track' : 'Pause Track'}
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default DigitalTwinPage;
