"use client";

import { useEffect, useState, useRef } from "react";
import dynamic from "next/dynamic";
import type { MapVehicle, MapRoute } from "../components/LeafletMap";

// ponytail: SSR off — Leaflet needs window
const LeafletMap = dynamic(() => import("../components/LeafletMap"), { ssr: false });
import { 
  Shield, 
  ShieldAlert, 
  ShieldCheck, 
  Lock, 
  Unlock, 
  Car, 
  User, 
  History, 
  AlertTriangle, 
  RefreshCw, 
  Sliders, 
  Database, 
  Activity, 
  FileText, 
  XCircle, 
  CheckCircle2, 
  Clock, 
  ArrowRight,
  TrendingUp,
  Settings as SettingsIcon,
  Play,
  Check,
  AlertOctagon,
  Bell,
  HelpCircle,
  Sparkles,
  Info,
  ChevronRight,
  FileCheck2,
  Target,
  Briefcase,
  Layers,
  Compass,
  ArrowUpRight,
  MapPin,
  Wifi,
  Battery,
  Cpu
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { api } from "../lib/api-client";
import type { 
  Vehicle, 
  CommandRecord, 
  CommandAction, 
  ReasonCode,
  AuditLogResponse,
  PendingMultiSigEntry,
  MultiSigPolicy
} from "../lib/types";

type Tab = "overview" | "financier" | "simulator" | "driver" | "audit" | "architecture" | "analytics" | "market" | "settings";
type ViewMode = "landing" | "dashboard";

interface DemoStep {
  name: string;
  description: string;
  tab: Tab;
  action: () => Promise<void>;
  status: "idle" | "running" | "completed" | "error";
  judgeExplainer?: string;
  checkLayer?: string;
}

// Real Hyderabad Road Coordinates (HITEC City, Gachibowli, Madhapur Road Loops)
const TR101_ROAD_LOOP: [number, number][] = [
  [17.4435, 78.3772], // Cyber Towers Junction
  [17.4465, 78.3775], // Hitec City Main Rd North
  [17.4490, 78.3810], // Hitec City Metro / Shilparamam
  [17.4475, 78.3840], // Inorbit Mall Rd Junction
  [17.4435, 78.3830], // Mindspace Junction
  [17.4410, 78.3800], // VITT Mallya Rd
  [17.4435, 78.3772]  // Cyber Towers Junction
];

const TR102_ROAD_LOOP: [number, number][] = [
  [17.4250, 78.3420], // Wipro Circle
  [17.4280, 78.3425], // Financial District Rd
  [17.4310, 78.3460], // Microsoft Junction
  [17.4290, 78.3510], // ISB Road
  [17.4240, 78.3515], // Gachibowli Stadium Rd
  [17.4220, 78.3460], // Nanakramguda Rd
  [17.4250, 78.3420]  // Wipro Circle
];

const TR103_ROAD_LOOP: [number, number][] = [
  [17.4410, 78.3910], // Durgam Cheruvu Cable Bridge Approach
  [17.4430, 78.3940], // Madhapur Main Rd
  [17.4400, 78.3980], // Kavuri Hills Junction
  [17.4360, 78.3960], // Jubilee Hills Road No 36
  [17.4375, 78.3920], // Cable Bridge East
  [17.4410, 78.3910]  // Cable Bridge Approach
];

// Linear interpolation function between key waypoints to generate smooth road paths
function generateDensePath(waypoints: [number, number][], pointsPerSegment = 8): [number, number][] {
  const path: [number, number][] = [];
  for (let i = 0; i < waypoints.length - 1; i++) {
    const [lat1, lng1] = waypoints[i];
    const [lat2, lng2] = waypoints[i + 1];
    for (let step = 0; step < pointsPerSegment; step++) {
      const t = step / pointsPerSegment;
      path.push([
        lat1 + (lat2 - lat1) * t,
        lng1 + (lng2 - lng1) * t
      ]);
    }
  }
  path.push(waypoints[waypoints.length - 1]);
  return path;
}

const TR101_DENSE_PATH = generateDensePath(TR101_ROAD_LOOP);
const TR102_DENSE_PATH = generateDensePath(TR102_ROAD_LOOP);
const TR103_DENSE_PATH = generateDensePath(TR103_ROAD_LOOP);

// Reusable Official TrustRide TR Monogram Logo Component — uses user's emblem image
const TrustRideLogo = ({ className = "h-8 w-8", animate = false }: { className?: string; animate?: boolean }) => (
  <img
    src="/tr_emblem.png"
    alt="TrustRide Logo"
    className={`${className} object-contain ${animate ? "animate-pulse" : ""}`}
  />
);

// Reusable Official TrustRide Branding Component matching user's requested layout
const TrustRideBranding = ({ className = "" }: { className?: string }) => (
  <div className={`flex items-center gap-2.5 ${className}`}>
    <TrustRideLogo className="h-9 w-9 shrink-0" />
    <div className="flex flex-col items-start leading-none">
      <span className="text-sm font-black tracking-wider text-white font-sans uppercase">
        TrustRide
      </span>
      <span className="text-[8px] font-bold tracking-widest text-slate-400 font-sans uppercase mt-0.5">
        Audit Ledger Console
      </span>
    </div>
  </div>
);

// Count-up helper component for statistics
const CountUp = ({ value, duration = 800 }: { value: number; duration?: number }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const end = value;
    if (start === end) {
      setCount(end);
      return;
    }

    const totalSteps = Math.min(end, Math.floor(duration / 16));
    const stepValue = Math.ceil(end / totalSteps);
    let stepCount = 0;

    const timer = setInterval(() => {
      start += stepValue;
      stepCount += 1;
      if (start >= end || stepCount >= totalSteps) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(start);
      }
    }, 16);

    return () => clearInterval(timer);
  }, [value, duration]);

  return <>{count}</>;
};

// Shimmering Skeleton loader component
const SkeletonCard = () => (
  <div className="bg-slate-950/40 border border-white/5 rounded-[20px] p-5 shadow-xl flex flex-col gap-4 animate-pulse">
    <div className="h-4 bg-white/10 rounded w-1/3" />
    <div className="h-8 bg-white/10 rounded w-1/2 mt-1" />
    <div className="h-10 bg-white/5 rounded w-full mt-3" />
    <div className="flex gap-3 mt-3">
      <div className="h-7 bg-white/10 rounded w-1/2" />
      <div className="h-7 bg-white/10 rounded w-1/2" />
    </div>
  </div>
);

export default function Dashboard() {
  // Navigation & View Mode State
  const [viewMode, setViewMode] = useState<ViewMode>("landing");
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [auditLog, setAuditLog] = useState<AuditLogResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [apiError, setApiError] = useState<string | null>(null);
  
  // Custom smoothly interpolated vehicle speeds (for dial animations)
  const [interpolatedSpeeds, setInterpolatedSpeeds] = useState<Record<string, number>>({
    "TR-101": 0,
    "TR-102": 0,
    "TR-103": 32
  });

  // Selected Twin ID inside Simulator Map
  const [selectedTwinId, setSelectedTwinId] = useState<string>("TR-103");


  // Simulated GPS Positions for the Digital Twin Map (Dense Hyderabad Road Loops)
  const [vehicleMapPositions, setVehicleMapPositions] = useState<Record<string, { x: number; y: number; lat: number; lng: number; index: number }>>({
    "TR-101": { x: 0, y: 0, lat: TR101_DENSE_PATH[0][0], lng: TR101_DENSE_PATH[0][1], index: 0 },
    "TR-102": { x: 0, y: 0, lat: TR102_DENSE_PATH[0][0], lng: TR102_DENSE_PATH[0][1], index: 0 },
    "TR-103": { x: 0, y: 0, lat: TR103_DENSE_PATH[0][0], lng: TR103_DENSE_PATH[0][1], index: 0 }
  });

  // Historical coordinates visited by each vehicle for Rapido-style polyline trail
  const [traveledHistory, setTraveledHistory] = useState<Record<string, [number, number][]>>({
    "TR-101": [[TR101_DENSE_PATH[0][0], TR101_DENSE_PATH[0][1]]],
    "TR-102": [[TR102_DENSE_PATH[0][0], TR102_DENSE_PATH[0][1]]],
    "TR-103": [[TR103_DENSE_PATH[0][0], TR103_DENSE_PATH[0][1]]]
  });

  // Dynamic visual attack/threat animation state triggers
  const [attackEffect, setAttackEffect] = useState<{
    type: "ble" | "replay" | "tamper" | "compromise" | "db" | "success" | "expire" | null;
    targetVehicleId: string;
  } | null>(null);

  // Static mock variables for Battery & Signal strengths
  const batteryLevels: Record<string, number> = { "TR-101": 87, "TR-102": 64, "TR-103": 45 };
  const signalStrengths: Record<string, number> = { "TR-101": 4, "TR-102": 3, "TR-103": 2 };

  // Search and notifications
  const [notifications, setNotifications] = useState<{ id: string; msg: string; unread: boolean; type: string }[]>([
    { id: "1", msg: "Simulated HSM slot fin-001 is active", unread: false, type: "system" },
    { id: "2", msg: "All vehicle trust stores validated successfully", unread: false, type: "security" }
  ]);
  const [showNotifications, setShowNotifications] = useState(false);

  // Financier Tab State
  const [selectedVehicleId, setSelectedVehicleId] = useState<string>("TR-101");
  const [financierAction, setFinancierAction] = useState<CommandAction>("IMMOBILIZE");
  const [reasonCode, setReasonCode] = useState<ReasonCode>("loan_default");
  const [reasonText, setReasonText] = useState<string>("Payment over 30 days delinquent. Drive authorization revoked.");
  const [financierHistory, setFinancierHistory] = useState<CommandRecord[]>([]);
  const [financierSubmitting, setFinancierSubmitting] = useState(false);
  const [lastActionOutcome, setLastActionOutcome] = useState<{
    outcome: string;
    detail: string;
    success: boolean;
    failedCheck?: string | null;
  } | null>(null);

  // Multi-Signature Governance State
  const [multiSigEnabled, setMultiSigEnabled] = useState<boolean>(true);
  const [pendingMultiSigEntries, setPendingMultiSigEntries] = useState<PendingMultiSigEntry[]>([]);

  // Driver Tab State
  const [driverVehicleId, setDriverVehicleId] = useState<string>("TR-101");
  const [driverViewData, setDriverViewData] = useState<{ vehicle: Vehicle; history: CommandRecord[] } | null>(null);
  const [disputeText, setDisputeText] = useState<string>("");
  const [disputingCommandId, setDisputingCommandId] = useState<string | null>(null);
  const [disputeSubmitting, setDisputeSubmitting] = useState(false);

  // Settings / Sim configuration
  const [demoSpeed, setDemoSpeed] = useState<number>(1200); 
  const [lastScanTime, setLastScanTime] = useState<string>("Just now");

  // Judge Mode states
  const [isJudgeMode, setIsJudgeMode] = useState<boolean>(true);

  // Toast Container
  const [systemAlerts, setSystemAlerts] = useState<{ id: string; msg: string; type: "info" | "warning" | "success" | "danger" }[]>([]);

  // Confetti Canvas Ref
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Auto-Demo State Machine
  const [demoActive, setDemoActive] = useState(false);
  const [currentDemoStepIndex, setCurrentDemoStepIndex] = useState(-1);
  const [demoSteps, setDemoSteps] = useState<DemoStep[]>([]);
  const demoActiveRef = useRef(false);

  // Fetch API Poller
  useEffect(() => {
    let active = true;
    
    const fetchData = async () => {
      try {
        const vList = await api.getVehicles();
        if (active) setVehicles(vList);
        
        const log = await api.getAuditLog();
        if (active) setAuditLog(log);

        const pending = await api.getPendingMultiSig();
        if (active) setPendingMultiSigEntries(pending);

        const policy = await api.getMultiSigPolicy();
        if (active) setMultiSigEnabled(policy.enabled);
        
        if (active) {
          setIsLoading(false);
          setApiError(null);
        }
      } catch (err: any) {
        if (active) {
          setApiError(`⚡ Waking Up Free-Tier Cloud Backend — Render backend is awakening from idle sleep (first load takes 30-45s). Please hold...`);
          setIsLoading(false);
        }
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 2000);

    return () => {
      active = false;
      clearInterval(interval);
    };
  }, []);

  // Telemetry speed interpolation sweep (60 FPS feel)
  useEffect(() => {
    const timer = setInterval(() => {
      setInterpolatedSpeeds(prev => {
        const next = { ...prev };
        let changed = false;
        vehicles.forEach(v => {
          const target = v.immobilized ? 0 : (v.isMoving ? 32 : 0);
          const current = prev[v.vehicleId] ?? 0;
          if (current !== target) {
            changed = true;
            const step = target > current ? 1 : -1;
            next[v.vehicleId] = Math.abs(target - current) <= 1 ? target : current + step;
          }
        });
        return changed ? next : prev;
      });
    }, 16);
    return () => clearInterval(timer);
  }, [vehicles]);

  // Digital Twin Map coordinates smooth interpolation loop along dense road paths
  useEffect(() => {
    const mapTimer = setInterval(() => {
      setVehicleMapPositions(prevPos => {
        const nextPos = { ...prevPos };
        let changed = false;

        vehicles.forEach(v => {
          const isMoving = v.isMoving && !v.immobilized;
          if (!isMoving) return; 

          changed = true;
          const densePath = v.vehicleId === "TR-102" ? TR102_DENSE_PATH : v.vehicleId === "TR-103" ? TR103_DENSE_PATH : TR101_DENSE_PATH;
          const currentPos = prevPos[v.vehicleId] || { x: 0, y: 0, lat: densePath[0][0], lng: densePath[0][1], index: 0 };
          const nextIndex = (currentPos.index + 1) % densePath.length;
          const point: [number, number] = [densePath[nextIndex][0], densePath[nextIndex][1]];

          nextPos[v.vehicleId] = { x: 0, y: 0, lat: point[0], lng: point[1], index: nextIndex };

          // Append to historical traveled trail for Rapido-style polyline rendering
          setTraveledHistory(prevHist => {
            const currentHist = prevHist[v.vehicleId] || [];
            if (nextIndex === 0) {
              return { ...prevHist, [v.vehicleId]: [point] };
            }
            return { ...prevHist, [v.vehicleId]: [...currentHist, point] };
          });
        });

        return changed ? nextPos : prevPos;
      });
    }, 450); // 450ms = steady smooth urban pace
    return () => clearInterval(mapTimer);
  }, [vehicles]);

  // Update dynamic last scan timestamp
  useEffect(() => {
    const scanInterval = setInterval(() => {
      setLastScanTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    }, 4000);
    return () => clearInterval(scanInterval);
  }, []);

  // Update lists based on selections
  useEffect(() => {
    if (!vehicles.length) return;
    
    const updateTabHistories = async () => {
      try {
        const history = await api.getVehicleHistory(selectedVehicleId);
        setFinancierHistory(history);
      } catch (err) {
        console.error(err);
      }

      try {
        const view = await api.getDriverView(driverVehicleId);
        setDriverViewData(view);
      } catch (err) {
        console.error(err);
      }
    };

    updateTabHistories();
  }, [vehicles, selectedVehicleId, driverVehicleId]);

  // programmatically sync the attack visualizers on the map to active demo steps
  useEffect(() => {
    if (currentDemoStepIndex === -1) {
      setAttackEffect(null);
      return;
    }
    const step = demoSteps[currentDemoStepIndex];
    if (!step) return;

    if (step.name.includes("MITM Mutated")) {
      setAttackEffect({ type: "tamper", targetVehicleId: "TR-101" });
    } else if (step.name.includes("Stale Command")) {
      setAttackEffect({ type: "expire", targetVehicleId: "TR-101" });
    } else if (step.name.includes("Verbatim Replay")) {
      setAttackEffect({ type: "replay", targetVehicleId: "TR-101" });
    } else if (step.name.includes("Unauthorized Issuer")) {
      setAttackEffect({ type: "compromise", targetVehicleId: "TR-101" });
    } else if (step.name.includes("Audit Tamper")) {
      setAttackEffect({ type: "db", targetVehicleId: "TR-101" });
    } else if (step.name.includes("Stop Activation") || step.name.includes("Settlement Release")) {
      setAttackEffect({ type: "success", targetVehicleId: "TR-103" });
    } else if (step.name.includes("Lock Dispatch")) {
      setAttackEffect({ type: "ble", targetVehicleId: "TR-103" });
    } else {
      setAttackEffect(null);
    }
  }, [currentDemoStepIndex, demoSteps]);

  // Toast Alert Trigger
  const addAlert = (msg: string, type: "info" | "warning" | "success" | "danger" = "info") => {
    const id = Math.random().toString(36).substring(2, 9);
    setSystemAlerts(prev => [{ id, msg, type }, ...prev].slice(0, 4));
    
    setNotifications(prev => [
      { id: Math.random().toString(36).substring(2, 9), msg, unread: true, type },
      ...prev
    ].slice(0, 10));

    setTimeout(() => {
      setSystemAlerts(prev => prev.filter(a => a.id !== id));
    }, 4500);
  };

  // Canvas Confetti Implementation
  const triggerConfetti = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const colors = ["#06b6d4", "#10b981", "#8b5cf6", "#f59e0b", "#ef4444"];
    const particles: { x: number; y: number; size: number; color: string; speedX: number; speedY: number; rotation: number; rotationSpeed: number }[] = [];

    for (let i = 0; i < 150; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: canvas.height + Math.random() * 50,
        size: Math.random() * 7 + 4,
        color: colors[Math.floor(Math.random() * colors.length)],
        speedX: Math.random() * 6 - 3,
        speedY: -(Math.random() * 12 + 8),
        rotation: Math.random() * 360,
        rotationSpeed: Math.random() * 4 - 2
      });
    }

    let animationId: number;
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      let alive = false;

      particles.forEach(p => {
        p.x += p.speedX;
        p.y += p.speedY;
        p.speedY += 0.2; 
        p.rotation += p.rotationSpeed;

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
        ctx.restore();

        if (p.y < canvas.height + 20) {
          alive = true;
        }
      });

      if (alive) {
        animationId = requestAnimationFrame(animate);
      } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    };

    animate();
  };

  // Automated Demo Step Builder
  useEffect(() => {
    const steps: DemoStep[] = [
      {
        name: "Telemetry Setup",
        description: "Verify that E-Rickshaw TR-103 is active and driving on city streets.",
        tab: "simulator",
        status: "idle",
        checkLayer: "VEHICLE TELEMETRY",
        judgeExplainer: "Establishing baseline vehicle state. E-Rickshaw TR-103 reports velocity telemetry (> 0 km/h). Safe-motion rules are now primed in the ECU memory.",
        action: async () => {
          await api.setVehicleMotion("TR-103", true);
          setSelectedTwinId("TR-103");
          addAlert("E-Rickshaw TR-103 telemetry: 32 km/h velocity reported.", "info");
        }
      },
      {
        name: "Lock Dispatch",
        description: "Financier issues an IMMOBILIZE command to TR-103 over delinquent contract.",
        tab: "financier",
        status: "idle",
        checkLayer: "COMMAND DISPATCH",
        judgeExplainer: "Financier TrustRide Finance signs a payload under private key 'fin-001'. Express backend relays this signature verbatim to the vehicle. The backend has no authority to execute independently.",
        action: async () => {
          setSelectedVehicleId("TR-103");
          setFinancierAction("IMMOBILIZE");
          const res = await api.submitCommand({
            vehicleId: "TR-103",
            action: "IMMOBILIZE",
            reasonCode: "loan_default",
            reasonText: "AUTOMATED DEMO: Repayment delta exceedance. Disabling drive authorization.",
            issuerId: "fin-001"
          });
          setLastActionOutcome({
            outcome: res.result.outcome,
            detail: res.result.detail,
            success: res.result.outcome === "HELD",
            failedCheck: res.result.failedCheck
          });
          addAlert("ECDSA signed payload dispatched. Vehicle is moving -> Command HELD.", "warning");
        }
      },
      {
        name: "Safe Interlock Hold",
        description: "Vehicle Simulator shows the ECU safely holding the command to prevent mid-ride crashes.",
        tab: "simulator",
        status: "idle",
        checkLayer: "CHECK 5: MOTION INTERLOCK",
        judgeExplainer: "The vehicle ECU parses the command, validating signatures, nonces, and stamps. Because speed is > 0, Check 5 of 5 fails, and the command is queued in the deferred ECU buffer rather than locking the motor.",
        action: async () => {
          setSelectedTwinId("TR-103");
          addAlert("Simulator panel displays active hold block on motor driver ignition relay.", "warning");
        }
      },
      {
        name: "Stop Activation",
        description: "The vehicle stops. Safety interlock releases. Lock executes automatically.",
        tab: "simulator",
        status: "idle",
        checkLayer: "CHECK 5: EXECUTED ON HALT",
        judgeExplainer: "TR-103 telemetry indicates speed has dropped to 0 km/h. The motion interlock immediately releases. The ignition relay is cut, and a signed acknowledgment is returned.",
        action: async () => {
          setSelectedTwinId("TR-103");
          const res = await api.setVehicleMotion("TR-103", false);
          setLastActionOutcome({
            outcome: res.recheck?.outcome || "EXECUTED",
            detail: res.recheck?.detail || "Command executed on halt",
            success: true,
            failedCheck: null
          });
          addAlert("TR-103 speed dropped to 0 km/h. ECU auto-lock successfully executed.", "success");
        }
      },
      {
        name: "Settlement Release",
        description: "Financier dispatches a RELEASE (CANCEL) command to restore vehicle operations.",
        tab: "financier",
        status: "idle",
        checkLayer: "CHECK 5: RESTORE DRIVE",
        judgeExplainer: "Loan delinquency settled. Financier signs a CANCEL request. The vehicle verifies the signature and prior command hash link, clearing the ignition interrupt.",
        action: async () => {
          setSelectedVehicleId("TR-103");
          setFinancierAction("CANCEL");
          const res = await api.submitCommand({
            vehicleId: "TR-103",
            action: "CANCEL",
            reasonCode: "loan_default",
            reasonText: "AUTOMATED DEMO: Settlement acknowledged. Re-enabling drive motor.",
            issuerId: "fin-001"
          });
          setLastActionOutcome({
            outcome: res.result.outcome,
            detail: res.result.detail,
            success: true
          });
          addAlert("RELEASE command dispatched. TR-103 motor cleared and online.", "success");
        }
      },
      {
        name: "MITM Mutated Attack",
        description: "Simulate an attacker editing fields in transit. Rejects under signature check.",
        tab: "financier",
        status: "idle",
        checkLayer: "CHECK 1: SIGNATURE VERIFY",
        judgeExplainer: "An attacker attempts a Man-In-The-Middle attack, altering payload details. The ECU verifier computes the canonical SHA-256 hash of the modified data. It mismatches the signature. Rejected.",
        action: async () => {
          setSelectedVehicleId("TR-101");
          setSelectedTwinId("TR-101");
          const res = await api.triggerTamperDemo("TR-101", "fin-001");
          setLastActionOutcome({
            outcome: res.result.outcome,
            detail: res.result.detail,
            success: false,
            failedCheck: res.result.failedCheck
          });
          addAlert("MITM modification detected! Rejection logged under [SIGNATURE] error.", "danger");
        }
      },
      {
        name: "Stale Command Attack",
        description: "Simulate replaying an old signed command. Rejects under expiry check.",
        tab: "financier",
        status: "idle",
        checkLayer: "CHECK 2: EXPIRY VERIFY",
        judgeExplainer: "Attacker attempts to relay a captured valid message outside its 5-minute expiry threshold. Check 1 passes (signature genuine), but Check 2 fails. Rejected to prevent stale execution.",
        action: async () => {
          setSelectedVehicleId("TR-101");
          setSelectedTwinId("TR-101");
          const res = await api.triggerExpireDemo("TR-101", "fin-001");
          setLastActionOutcome({
            outcome: res.result.outcome,
            detail: res.result.detail,
            success: false,
            failedCheck: res.result.failedCheck
          });
          addAlert("Stale replay rejected! Command window lapsed -> [EXPIRY] block.", "danger");
        }
      },
      {
        name: "Verbatim Replay Attack",
        description: "Attacker attempts to resend the last observed command. Rejects under nonce check.",
        tab: "financier",
        status: "idle",
        checkLayer: "CHECK 3: REPLAY DETECT",
        judgeExplainer: "Attacker replays the last active payload byte-for-byte. Check 1 and 2 pass. However, Check 3 identifies that the unique uuid/nonce has already been logged as spent. Rejected.",
        action: async () => {
          setSelectedVehicleId("TR-101");
          setSelectedTwinId("TR-101");
          await api.submitCommand({
            vehicleId: "TR-101",
            action: "IMMOBILIZE",
            reasonCode: "maintenance",
            reasonText: "AUTOMATED DEMO: Replay baseline setup",
            issuerId: "fin-001"
          });
          
          try {
            const res = await api.triggerReplayDemo("TR-101");
            setLastActionOutcome({
              outcome: res.result.outcome,
              detail: res.result.detail,
              success: false,
              failedCheck: res.result.failedCheck
            });
          } catch (e: any) {
            setLastActionOutcome({
              outcome: "REJECTED",
              detail: e.message || "Nonce seen, replayed command refused",
              success: false,
              failedCheck: "REPLAY"
            });
          }
          addAlert("Verbatim replay rejected! Nonce index already spent -> [REPLAY] block.", "danger");
        }
      },
      {
        name: "Unauthorized Issuer",
        description: "Financier with an unprovisioned key dispatches command. Rejects at once.",
        tab: "financier",
        status: "idle",
        checkLayer: "CHECK 1: SECURE TRUST STORE",
        judgeExplainer: "A rogue broker 'fin-999' signs a command. The ECU verifies the key against its pre-provisioned trust store. Since fin-999 is missing, validation fails immediately at Check 1.",
        action: async () => {
          setSelectedVehicleId("TR-101");
          setSelectedTwinId("TR-101");
          try {
            const res = await api.submitCommand({
              vehicleId: "TR-101",
              action: "IMMOBILIZE",
              reasonCode: "theft",
              reasonText: "AUTOMATED DEMO: Unauthenticated rogue broker",
              issuerId: "fin-999" 
            });
            setLastActionOutcome({
              outcome: res.result.outcome,
              detail: res.result.detail,
              success: false,
              failedCheck: res.result.failedCheck
            });
          } catch (e: any) {
            setLastActionOutcome({
              outcome: "REJECTED",
              detail: "Rogue broker fin-999 key is not provisioned in the vehicle's firmware trust store. Command refused.",
              success: false,
              failedCheck: "SIGNATURE"
            });
          }
          addAlert("Rogue key verification failed! Blocked under [SIGNATURE] error.", "danger");
        }
      },
      {
        name: "Driver dispute",
        description: "The driver files an account dispute with payment proof, logging the objection.",
        tab: "driver",
        status: "idle",
        checkLayer: "ACCOUNTABILITY LEDGER",
        judgeExplainer: "To prevent legal battles, drivers can submit UPI receipts or settlement proof directly. The dispute is permanently appended to the command's index on the tamper-evident hash-chained audit ledger.",
        action: async () => {
          setDriverVehicleId("TR-101");
          const view = await api.getDriverView("TR-101");
          const lastRecord = view.history[0];
          if (lastRecord) {
            await api.submitDispute(
              "TR-101", 
              lastRecord.command.commandId, 
              "AUTOMATED DEMO: Payment sent via UPI transaction reference UPI842018."
            );
            addAlert("Dispute submitted successfully and appended to immutable ledger.", "success");
          }
        }
      },
      {
        name: "Audit Tamper Demo",
        description: "An attacker mutates database rows. The cryptographic hash chain breaks visibly.",
        tab: "audit",
        status: "idle",
        checkLayer: "AUDIT LEDGER CHAINS",
        judgeExplainer: "An attacker edits the justification text in the database. Because each block hashes its contents + the prior block's hash, the recomputed signature chain instantly breaks at the mutated index.",
        action: async () => {
          await api.tamperAuditLog();
          addAlert("DB entries mutated! Hash checks failed -> CHAIN BREACHED.", "danger");
        }
      },
      {
        name: "Ledger Restoration",
        description: "Administrator restores the ledger from backup. Chain integrity turns healthy.",
        tab: "audit",
        status: "idle",
        checkLayer: "LEDGER RESTORE",
        judgeExplainer: "Database backup recovered. Chain integrity recalculation runs successfully, confirming signature alignments. Confetti triggers to finalize the governance pipeline demo.",
        action: async () => {
          await api.restoreAuditLog();
          addAlert("Database restored. Recomputed SHA-255 matches signatures.", "success");
          triggerConfetti();
        }
      }
    ];
    setDemoSteps(steps);
  }, [demoSpeed]);

  // Auto-Demo Player Loop
  const runDemoStep = async (stepIndex: number) => {
    if (!demoActiveRef.current || stepIndex >= demoSteps.length) {
      setDemoActive(false);
      demoActiveRef.current = false;
      setCurrentDemoStepIndex(-1);
      return;
    }

    setCurrentDemoStepIndex(stepIndex);
    setDemoSteps(prev => prev.map((s, idx) => idx === stepIndex ? { ...s, status: "running" } : s));

    const step = demoSteps[stepIndex];
    setActiveTab(step.tab);

    try {
      await step.action();
      setDemoSteps(prev => prev.map((s, idx) => idx === stepIndex ? { ...s, status: "completed" } : s));
      
      setTimeout(() => {
        runDemoStep(stepIndex + 1);
      }, demoSpeed + 3500); 
    } catch (err) {
      setDemoSteps(prev => prev.map((s, idx) => idx === stepIndex ? { ...s, status: "error" } : s));
      setDemoActive(false);
      demoActiveRef.current = false;
      addAlert(`Demo interrupted at step ${step.name}`, "danger");
    }
  };

  const handleStartDemo = () => {
    setDemoSteps(prev => prev.map(s => ({ ...s, status: "idle" })));
    setViewMode("dashboard");
    setDemoActive(true);
    demoActiveRef.current = true;
    runDemoStep(0);
  };

  const handleStopDemo = () => {
    setDemoActive(false);
    demoActiveRef.current = false;
    setCurrentDemoStepIndex(-1);
    setDemoSteps(prev => prev.map(s => ({ ...s, status: "idle" })));
    addAlert("Auto Demo stopped by operator", "info");
  };

  // Toggle Multi-Sig Governance Policy Mode
  const handleToggleMultiSig = async (enabled: boolean) => {
    try {
      const res = await api.toggleMultiSigPolicy(enabled);
      setMultiSigEnabled(res.policy.enabled);
      addAlert(`[MULTISIG POLICY] Dual-Key Governance mode ${res.policy.enabled ? "ENABLED (2-Key Required)" : "DISABLED (Single Key)"}`, "info");
    } catch (err: any) {
      addAlert(`Failed to toggle multi-sig policy: ${err.message}`, "danger");
    }
  };

  // Co-Sign pending multi-sig command as Ops Admin (ops-001)
  const handleCosignSubmit = async (entryId: string) => {
    setFinancierSubmitting(true);
    setLastActionOutcome(null);
    try {
      const res = await api.cosignMultiSig(entryId, "ops-001");
      const { outcome, failedCheck, detail } = res.result;
      const success = outcome !== "REJECTED";
      
      setLastActionOutcome({ outcome, detail, success, failedCheck });
      addAlert(`[MULTISIG] Dual-key command co-signed & dispatched. Result: ${outcome}`, success ? (outcome === "HELD" ? "warning" : "success") : "danger");
      
      const pending = await api.getPendingMultiSig();
      setPendingMultiSigEntries(pending);
    } catch (err: any) {
      setLastActionOutcome({ outcome: "ERROR", detail: err.message, success: false });
      addAlert(`Co-signing failed: ${err.message}`, "danger");
    } finally {
      setFinancierSubmitting(false);
    }
  };

  // Submit Command Handler (Financier tab - manual)
  const handleManualCommandSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFinancierSubmitting(true);
    setLastActionOutcome(null);
    
    try {
      if (multiSigEnabled) {
        // Dual-Key Governance Mode: Step 1 (Financier Initiates / Records Intent)
        const entry = await api.initiateMultiSig({
          vehicleId: selectedVehicleId,
          action: financierAction,
          reasonCode,
          reasonText,
          issuerId: "fin-001"
        });
        
        addAlert(`[MULTISIG] Authorization recorded. Awaiting Ops Admin (ops-001) co-signature.`, "info");
        setLastActionOutcome({
          outcome: "AWAITING_COSIGN",
          detail: `[MULTISIG] Financier (fin-001) authorized ${financierAction} on ${selectedVehicleId}. Command buffered pending Ops Admin (ops-001) co-signature.`,
          success: true
        });
        
        const pending = await api.getPendingMultiSig();
        setPendingMultiSigEntries(pending);
      } else {
        // Single-Key Legacy Flow
        const res = await api.submitCommand({
          vehicleId: selectedVehicleId,
          action: financierAction,
          reasonCode,
          reasonText,
          issuerId: "fin-001"
        });

        const { outcome, failedCheck, detail } = res.result;
        const success = outcome !== "REJECTED";
        
        setLastActionOutcome({ outcome, detail, success, failedCheck });
        addAlert(`Command dispatched. Result: ${outcome}`, success ? (outcome === "HELD" ? "warning" : "success") : "danger");
      }
      
      if (financierAction === "CANCEL") {
        setReasonText("Outstanding delinquency settled. Drive authorization restored.");
      }
    } catch (err: any) {
      setLastActionOutcome({ outcome: "ERROR", detail: err.message, success: false });
      addAlert(`Failed to submit command: ${err.message}`, "danger");
    } finally {
      setFinancierSubmitting(false);
    }
  };

  // Handle Manual Attacks
  const handleManualAttack = async (attackType: "tamper" | "expire" | "replay" | "unauth" | "partial_sig") => {
    setFinancierSubmitting(true);
    setLastActionOutcome(null);
    try {
      let res;
      if (attackType === "tamper") {
        res = await api.triggerTamperDemo(selectedVehicleId, "fin-001");
      } else if (attackType === "expire") {
        res = await api.triggerExpireDemo(selectedVehicleId, "fin-001");
      } else if (attackType === "replay") {
        res = await api.triggerReplayDemo(selectedVehicleId);
      } else if (attackType === "partial_sig") {
        res = await api.triggerPartialSigDemo(selectedVehicleId, "fin-001");
      } else {
        res = await api.submitCommand({
          vehicleId: selectedVehicleId,
          action: "IMMOBILIZE",
          reasonCode: "theft",
          reasonText: "Rogue authorization simulation.",
          issuerId: "fin-999"
        });
      }
      
      const { outcome, failedCheck, detail } = res.result;
      const success = outcome !== "REJECTED";
      
      setLastActionOutcome({ outcome, failedCheck, detail, success });
      addAlert(`[ATTACK DEMO] ${attackType.toUpperCase()} dispatched. Outcome: ${outcome}`, success ? "info" : "danger");
    } catch (err: any) {
      setLastActionOutcome({ outcome: "REJECTED", detail: err.message, success: false, failedCheck: attackType === "partial_sig" ? "MULTISIG" : "SIGNATURE" });
      addAlert(`[ATTACK DEMO] Rejected: ${err.message}`, "danger");
    } finally {
      setFinancierSubmitting(false);
    }
  };

  // Toggle speed manually in Simulator
  const handleSpeedSliderChange = async (vehicleId: string, value: number) => {
    const vehicle = vehicles.find(v => v.vehicleId === vehicleId);
    if (!vehicle) return;
    const isMoving = value > 0;
    
    if (vehicle.isMoving !== isMoving) {
      try {
        const res = await api.setVehicleMotion(vehicleId, isMoving);
        addAlert(
          `Vehicle ${vehicleId} telemetry: speed set to ${value} km/h (${isMoving ? "MOVING" : "STATIONARY"}).` +
          (res.recheck ? ` Interlock trigger outcome: ${res.recheck.outcome}` : ""),
          res.recheck?.outcome === "EXECUTED" ? "success" : "info"
        );
      } catch (err: any) {
        addAlert(`ECU speed governor block: ${err.message}`, "danger");
      }
    }
  };

  // Reset System State
  const handleResetSystem = async () => {
    try {
      await api.resetDemoState();
      setLastActionOutcome(null);
      addAlert("Simulated HSM and vehicle ECU stores reset to factory seeds.", "success");
    } catch (err: any) {
      addAlert(`System reset failed: ${err.message}`, "danger");
    }
  };

  // Handle Dispute Submission (Driver)
  const handleDisputeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!disputingCommandId || !disputeText) return;
    
    setDisputeSubmitting(true);
    try {
      await api.submitDispute(driverVehicleId, disputingCommandId, disputeText);
      addAlert(`Dispute logged on audit chain.`, "success");
      setDisputeText("");
      setDisputingCommandId(null);
      const view = await api.getDriverView(driverVehicleId);
      setDriverViewData(view);
    } catch (err: any) {
      addAlert(`Dispute failed: ${err.message}`, "danger");
    } finally {
      setDisputeSubmitting(false);
    }
  };

  // Tamper Audit Log
  const handleTamperAuditLog = async () => {
    try {
      const res = await api.tamperAuditLog();
      if (res.tampered) {
        addAlert(`Historical entry modified. Cryptographic chain broken.`, "warning");
      }
    } catch (err: any) {
      addAlert(`Tamper injection failed: ${err.message}`, "danger");
    }
  };

  // Restore Audit Log
  const handleRestoreAuditLog = async () => {
    try {
      const res = await api.restoreAuditLog();
      addAlert("Database integrity verified. Recomputed chain matches stored hashes.", "success");
    } catch (err: any) {
      addAlert(`Restoration failed: ${err.message}`, "danger");
    }
  };

  // Compute active vehicle details
  const activeTwinVehicle = vehicles.find(v => v.vehicleId === selectedTwinId) || vehicles[0] || { vehicleId: "TR-103", driverName: "Amit Singh", immobilized: false, isMoving: true, pendingCommand: null };



  // Analytics Metrics computations
  const totalVehiclesCount = vehicles.length;
  const immobilizedCount = vehicles.filter(v => v.immobilized).length;
  const activeCount = totalVehiclesCount - immobilizedCount;
  const ledgerHealthy = auditLog?.chainIntact ?? true;
  const totalLogsCount = auditLog?.entries.length ?? 0;
  
  const threatEntries = auditLog?.entries.filter(e => e.eventType === "REJECTED") ?? [];
  const totalThreatsBlocked = threatEntries.length;
  const pendingRequestsCount = vehicles.filter(v => v.pendingCommand !== null).length;

  // Active threat validation for glowing map border red
  const isThreatActive = attackEffect?.type !== null || (demoActive && currentDemoStepIndex >= 5 && currentDemoStepIndex <= 10);

  // ponytail: SVG viewbox calculations removed — Leaflet handles zoom natively

  return (
    <div className="flex-1 flex flex-col relative text-sans">
      {/* Absolute Confetti Overlay */}
      <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none z-50 w-full h-full" />

      {/* SKELETON LOADER PANEL DISPLAY */}
      {isLoading && (
        <div className="flex-1 flex flex-col gap-6 py-8 px-4 max-w-7xl mx-auto w-full animate-fadeIn">
          <div className="flex justify-between items-center border-b border-white/5 pb-4 mb-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-white/10 rounded-lg animate-pulse" />
              <div className="h-6 bg-white/10 rounded w-32 animate-pulse" />
            </div>
            <div className="h-8 bg-white/10 rounded w-24 animate-pulse" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </div>
        </div>
      )}

      {/* ========================================== */}
      {/* 1. MARKETING LANDING PAGE VIEW            */}
      {/* ========================================== */}
      {!isLoading && viewMode === "landing" && (
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: "easeOut" }}
          className="flex-1 flex flex-col items-center justify-center py-8 md:py-16 px-4 relative overflow-hidden"
        >
          {/* Neon background grids */}
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-cyan-500/10 blur-[100px] pointer-events-none" />
          <div className="absolute bottom-1/4 left-1/3 -translate-x-1/2 w-[400px] h-[400px] rounded-full bg-purple-500/10 blur-[100px] pointer-events-none" />

          {/* Hero Content */}
          <div className="max-w-4xl w-full text-center flex flex-col items-center gap-6 z-10">
            {/* Logo Badge */}
            <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-slate-950/60 border border-cyan-500/20 backdrop-blur-md text-xs font-bold font-mono tracking-wider text-cyan-400 shadow-[0_0_20px_-5px_rgba(6,182,212,0.25)]">
              <div className="h-5 w-5 bg-cyan-500/10 border border-cyan-500/30 rounded-md flex items-center justify-center animate-spin" style={{ animationDuration: '6s' }}>
                <TrustRideLogo className="h-4 w-4" />
              </div>
              <span>TELEM-SAFE remote governance v1.2</span>
            </div>

            {/* Giant Title */}
            <h1 className="text-4xl sm:text-6xl font-black tracking-tight leading-[1.1] mt-2">
              Governed & Safe <br className="hidden sm:block"/>
              <span className="bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-400 bg-clip-text text-transparent">
                Remote EV Immobilization
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-base sm:text-lg text-muted-foreground max-w-2xl leading-relaxed">
              Prevent unauthorized or dangerous vehicle disablements. An immutable, signature-verified, motion-aware protocol ensuring remote shutdown triggers only when vehicles are stationary.
            </p>

            {/* Floating Telemetry Screen Mockup */}
            <motion.div 
              whileHover={{ y: -4 }}
              transition={{ duration: 0.25 }}
              className="w-full max-w-lg mt-6 border border-white/10 rounded-[20px] bg-slate-950/60 backdrop-blur-md p-5 shadow-2xl relative group"
            >
              <div className="absolute -top-3 left-6 px-2.5 py-0.5 rounded bg-cyan-950 border border-cyan-500/20 text-[10px] font-bold text-cyan-400 font-mono uppercase">
                On-Board ECU Status
              </div>
              <div className="flex items-center justify-between border-b border-white/5 pb-3 mb-4 text-left">
                <div className="flex items-center gap-2">
                  <TrustRideLogo className="h-5 w-5" />
                  <div>
                    <div className="text-xs text-muted-foreground font-mono">VEHICLE NODE</div>
                    <div className="text-sm font-bold font-mono text-foreground">TR-103 (Amit Singh)</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-xs text-emerald-400 font-bold font-mono">ECU TRUST STORE ACTIVE</span>
                </div>
              </div>
              {(() => {
                const tr103 = vehicles.find(v => v.vehicleId === "TR-103");
                const currentSpeed = tr103 ? (interpolatedSpeeds["TR-103"] ?? (tr103.isMoving ? 32 : 0)) : 32;
                const relayState = tr103 ? (tr103.immobilized ? "OPEN" : "CLOSED") : "CLOSED";
                const relayColor = relayState === "OPEN" ? "text-rose-400 font-extrabold" : "text-emerald-400";
                const isHeld = tr103 ? tr103.pendingCommand !== null : false;
                
                return (
                  <>
                    <div className="grid grid-cols-3 gap-2.5 text-left text-xs font-mono mb-2 mt-4">
                      <div className="bg-white/5 p-2.5 rounded-lg border border-white/5">
                        <div className="text-muted-foreground text-[10px]">SPEED</div>
                        <div className="text-sm font-bold text-cyan-400 mt-0.5">{currentSpeed} km/h</div>
                      </div>
                      <div className="bg-white/5 p-2.5 rounded-lg border border-white/5">
                        <div className="text-muted-foreground text-[10px]">IGNITION RELAY</div>
                        <div className={`text-sm font-bold mt-0.5 ${relayColor}`}>{relayState}</div>
                      </div>
                      <div className="bg-white/5 p-2.5 rounded-lg border border-white/5">
                        <div className="text-muted-foreground text-[10px]">SAFE QUEUE</div>
                        <div className={`text-sm font-bold mt-0.5 ${isHeld ? "text-amber-400 font-extrabold" : "text-muted-foreground"}`}>
                          {isHeld ? "1 PENDING" : "0 PENDING"}
                        </div>
                      </div>
                    </div>
                    {isHeld ? (
                      <div className="text-[10px] text-center mt-3 font-mono leading-relaxed border-t border-white/5 pt-2 flex items-center justify-center gap-1.5 text-amber-400 animate-pulse">
                        <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                        Motion Interlock Active: Command IMMOBILIZE queued until vehicle stops.
                      </div>
                    ) : tr103?.immobilized ? (
                      <div className="text-[10px] text-center mt-3 font-mono leading-relaxed border-t border-white/5 pt-2 flex items-center justify-center gap-1.5 text-rose-400 font-bold">
                        <Lock className="h-3.5 w-3.5 shrink-0" />
                        Power Cut Confirmed: Vehicle safely immobilized.
                      </div>
                    ) : (
                      <div className="text-[10px] text-center mt-3 font-mono leading-relaxed border-t border-white/5 pt-2 flex items-center justify-center gap-1.5 text-emerald-400">
                        <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
                        System Secure: ECU ignition checks nominal.
                      </div>
                    )}
                  </>
                );
              })()}
            </motion.div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-6 w-full sm:w-auto">
              <motion.button
                type="button"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleStartDemo}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white rounded-[14px] text-sm font-bold tracking-wider shadow-lg shadow-cyan-950/20 transition-all"
                aria-label="Start Autoplay Script Demonstration"
              >
                <Play className="h-4 w-4" />
                START AUTO DEMO
              </motion.button>
              <motion.button
                type="button"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  setViewMode("dashboard");
                  setActiveTab("overview");
                }}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3.5 bg-white/5 hover:bg-white/10 border border-white/10 text-foreground rounded-[14px] text-sm font-bold tracking-wider transition-all"
                aria-label="Enter Operations Console Dashboard"
              >
                ENTER CONSOLE
              </motion.button>
            </div>

            {/* Feature Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full mt-12 sm:mt-16 text-left">
              <motion.div 
                whileHover={{ y: -3 }}
                className="bg-white/5 border border-white/5 rounded-[20px] p-5 backdrop-blur-md"
              >
                <div className="h-8 w-8 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center mb-3">
                  <ShieldCheck className="h-4.5 w-4.5" />
                </div>
                <h3 className="text-sm font-extrabold tracking-tight text-foreground">Vehicle-Centric Trust Architecture</h3>
                <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">
                  Every request requires authorization signed by a Simulated HSM module, verified natively on the vehicle hardware.
                </p>
              </motion.div>

              <motion.div 
                whileHover={{ y: -3 }}
                className="bg-white/5 border border-white/5 rounded-[20px] p-5 backdrop-blur-md"
              >
                <div className="h-8 w-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mb-3">
                  <Car className="h-4.5 w-4.5" />
                </div>
                <h3 className="text-sm font-extrabold tracking-tight text-foreground">Motion Safety Interlock</h3>
                <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">
                  Commands verify and wait silently in the ECU memory when velocity is above zero, executing only on complete halt.
                </p>
              </motion.div>

              <motion.div 
                whileHover={{ y: -3 }}
                className="bg-white/5 border border-white/5 rounded-[20px] p-5 backdrop-blur-md"
              >
                <div className="h-8 w-8 rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center mb-3">
                  <Database className="h-4.5 w-4.5" />
                </div>
                <h3 className="text-sm font-extrabold tracking-tight text-foreground">Immutable Audit Ledger</h3>
                <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">
                  Hash-chained event log links every action sequentially. Database modifications immediately trigger chain breaks.
                </p>
              </motion.div>
            </div>
          </div>
        </motion.div>
      )}

      {/* ========================================== */}
      {/* 2. MAIN UNIFIED DASHBOARD CONSOLE         */}
      {/* ========================================== */}
      {!isLoading && viewMode === "dashboard" && (
        <div className="flex-1 flex flex-col md:flex-row gap-6 relative min-h-[600px] animate-fadeIn">
          
          {/* AUTO-DEMO ACTIVE PLAYBAR STATUS OVERLAY */}
          <AnimatePresence>
            {demoActive && (
              <motion.div 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className="absolute top-0 inset-x-0 z-40 bg-slate-950/85 border border-cyan-500/30 backdrop-blur-md rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-2xl cyber-glow-cyan"
              >
                <div className="flex items-center gap-3">
                  <span className="flex h-3 w-3 relative shrink-0">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-cyan-500"></span>
                  </span>
                  <div>
                    <div className="text-xs font-bold text-cyan-400 font-mono tracking-wider uppercase flex items-center gap-1.5">
                      Auto-Demo Script Playing
                      <span className="text-[10px] text-muted-foreground font-normal normal-case">
                        (Step {currentDemoStepIndex + 1} of {demoSteps.length})
                      </span>
                    </div>
                    <p className="text-xs font-bold text-foreground mt-0.5">
                      {demoSteps[currentDemoStepIndex]?.name}: {demoSteps[currentDemoStepIndex]?.description}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="hidden md:flex items-center gap-1">
                    {demoSteps.map((s, idx) => (
                      <div 
                        key={idx} 
                        className={`h-1.5 w-6 rounded-full transition-colors ${
                          idx === currentDemoStepIndex 
                            ? "bg-cyan-400" 
                            : idx < currentDemoStepIndex 
                            ? "bg-emerald-500" 
                            : "bg-slate-800"
                        }`}
                      />
                    ))}
                  </div>
                  <button
                    onClick={handleStopDemo}
                    className="px-3.5 py-1.5 bg-rose-950/40 hover:bg-rose-950/70 border border-rose-500/30 text-rose-300 text-xs font-bold rounded-lg transition-colors shrink-0 font-mono"
                  >
                    STOP DEMO
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* LEFT SIDEBAR NAVIGATION */}
          <aside 
            className="w-full md:w-64 bg-slate-950/40 border border-white/5 rounded-[20px] p-4 flex flex-col gap-4 shadow-xl select-none shrink-0 self-start"
            role="navigation"
            aria-label="Dashboard Panels"
          >
            <div 
              onClick={() => setViewMode("landing")} 
              className="flex items-center gap-3 px-2.5 py-2 cursor-pointer hover:opacity-95 transition-all duration-300 group border border-white/5 bg-slate-900/40 rounded-xl justify-center md:justify-start"
            >
              <TrustRideBranding />
            </div>

            <nav className="flex flex-col gap-1 mt-2">
              <button
                onClick={() => setActiveTab("overview")}
                className={`flex items-center gap-3 px-3.5 py-2.5 text-xs font-bold tracking-wide rounded-xl border transition-all ${activeTab === "overview" ? "bg-white/5 border-white/10 text-cyan-400 cyber-glow-cyan" : "border-transparent text-muted-foreground hover:text-foreground hover:bg-white/5"}`}
                aria-selected={activeTab === "overview"}
                role="tab"
              >
                <Activity className="h-4 w-4" />
                Overview
              </button>
              <button
                onClick={() => setActiveTab("financier")}
                className={`flex items-center gap-3 px-3.5 py-2.5 text-xs font-bold tracking-wide rounded-xl border transition-all ${activeTab === "financier" ? "bg-white/5 border-white/10 text-cyan-400 cyber-glow-cyan" : "border-transparent text-muted-foreground hover:text-foreground hover:bg-white/5"}`}
                aria-selected={activeTab === "financier"}
                role="tab"
              >
                <Lock className="h-4 w-4" />
                Financier Control
              </button>
              <button
                onClick={() => setActiveTab("simulator")}
                className={`flex items-center gap-3 px-3.5 py-2.5 text-xs font-bold tracking-wide rounded-xl border transition-all ${activeTab === "simulator" ? "bg-white/5 border-white/10 text-cyan-400 cyber-glow-cyan" : "border-transparent text-muted-foreground hover:text-foreground hover:bg-white/5"}`}
                aria-selected={activeTab === "simulator"}
                role="tab"
              >
                <Sliders className="h-4 w-4" />
                Vehicle Sim
              </button>
              <button
                onClick={() => setActiveTab("driver")}
                className={`flex items-center gap-3 px-3.5 py-2.5 text-xs font-bold tracking-wide rounded-xl border transition-all ${activeTab === "driver" ? "bg-white/5 border-white/10 text-cyan-400 cyber-glow-cyan" : "border-transparent text-muted-foreground hover:text-foreground hover:bg-white/5"}`}
                aria-selected={activeTab === "driver"}
                role="tab"
              >
                <User className="h-4 w-4" />
                Driver View
              </button>
              <button
                onClick={() => setActiveTab("audit")}
                className={`flex items-center gap-3 px-3.5 py-2.5 text-xs font-bold tracking-wide rounded-xl border transition-all ${activeTab === "audit" ? "bg-white/5 border-white/10 text-cyan-400 cyber-glow-cyan" : "border-transparent text-muted-foreground hover:text-foreground hover:bg-white/5"}`}
                aria-selected={activeTab === "audit"}
                role="tab"
              >
                <Database className="h-4 w-4" />
                Audit Ledger
              </button>
              <button
                onClick={() => setActiveTab("architecture")}
                className={`flex items-center gap-3 px-3.5 py-2.5 text-xs font-bold tracking-wide rounded-xl border transition-all ${activeTab === "architecture" ? "bg-white/5 border-white/10 text-cyan-400 cyber-glow-cyan" : "border-transparent text-muted-foreground hover:text-foreground hover:bg-white/5"}`}
                aria-selected={activeTab === "architecture"}
                role="tab"
              >
                <HelpCircle className="h-4 w-4" />
                Architecture
              </button>
              <button
                onClick={() => setActiveTab("analytics")}
                className={`flex items-center gap-3 px-3.5 py-2.5 text-xs font-bold tracking-wide rounded-xl border transition-all ${activeTab === "analytics" ? "bg-white/5 border-white/10 text-cyan-400 cyber-glow-cyan" : "border-transparent text-muted-foreground hover:text-foreground hover:bg-white/5"}`}
                aria-selected={activeTab === "analytics"}
                role="tab"
              >
                <TrendingUp className="h-4 w-4" />
                Analytics Flow
              </button>
              <button
                onClick={() => setActiveTab("market")}
                className={`flex items-center gap-3 px-3.5 py-2.5 text-xs font-bold tracking-wide rounded-xl border transition-all ${activeTab === "market" ? "bg-white/5 border-white/10 text-cyan-400 cyber-glow-cyan" : "border-transparent text-muted-foreground hover:text-foreground hover:bg-white/5"}`}
                aria-selected={activeTab === "market"}
                role="tab"
              >
                <Compass className="h-4 w-4" />
                Impact & Market
              </button>
              <button
                onClick={() => setActiveTab("settings")}
                className={`flex items-center gap-3 px-3.5 py-2.5 text-xs font-bold tracking-wide rounded-xl border transition-all ${activeTab === "settings" ? "bg-white/5 border-white/10 text-cyan-400 cyber-glow-cyan" : "border-transparent text-muted-foreground hover:text-foreground hover:bg-white/5"}`}
                aria-selected={activeTab === "settings"}
                role="tab"
              >
                <SettingsIcon className="h-4 w-4" />
                Settings
              </button>
            </nav>

            <div className="mt-auto border-t border-white/5 pt-4 flex flex-col gap-2.5 text-[10px] text-muted-foreground font-mono">
              <div className="flex justify-between items-center px-1">
                <span>JUDGE HELPER</span>
                <button 
                  onClick={() => setIsJudgeMode(!isJudgeMode)}
                  className={`px-2 py-0.5 rounded font-bold transition-all ${isJudgeMode ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/30" : "bg-slate-900 text-slate-500 border border-transparent"}`}
                  aria-label="Toggle Presentation Explainer Card"
                >
                  {isJudgeMode ? "ACTIVE" : "OFF"}
                </button>
              </div>
              <button
                onClick={handleStartDemo}
                disabled={demoActive}
                className="w-full py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg font-bold tracking-wider uppercase transition-colors text-center disabled:opacity-40"
              >
                Quick Autoplay
              </button>
              <button
                onClick={handleResetSystem}
                className="w-full py-2 bg-slate-900 hover:bg-slate-800 border border-white/5 text-muted-foreground hover:text-cyan-400 rounded-lg font-bold tracking-wider uppercase transition-colors text-center text-[10px]"
                aria-label="Reseed Demo Data"
              >
                Reseed Demo Data
              </button>
            </div>
          </aside>

          {/* MAIN CONTAINER CONTENT VIEWPORT */}
          <main className="flex-1 flex flex-col gap-6 overflow-hidden">
            {/* Top header navigation row */}
            <header className="flex flex-col gap-4 bg-slate-950/20 border border-white/5 p-4 rounded-[20px] shadow-lg">
              <div className="flex items-center justify-between gap-4">
                <TrustRideBranding />
                
                <div className="flex items-center gap-4 ml-auto">
                  <div className="relative">
                    <button 
                      onClick={() => setShowNotifications(!showNotifications)}
                      className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-muted-foreground hover:text-foreground transition-all relative"
                      aria-label="Open Alerts Feed"
                    >
                      <Bell className="h-4.5 w-4.5" />
                      {notifications.some(n => n.unread) && (
                        <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-cyan-400" />
                      )}
                    </button>

                    <AnimatePresence>
                      {showNotifications && (
                        <motion.div 
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          transition={{ duration: 0.15 }}
                          className="absolute right-0 mt-2.5 w-64 bg-slate-950 border border-white/10 rounded-xl p-3 shadow-2xl z-50 flex flex-col gap-2"
                        >
                          <div className="flex items-center justify-between border-b border-white/5 pb-2 text-[10px] text-muted-foreground uppercase font-bold tracking-wider">
                            <span>Console Alerts</span>
                            <button 
                              onClick={() => {
                                setNotifications(prev => prev.map(n => ({ ...n, unread: false })));
                                setShowNotifications(false);
                              }}
                              className="hover:text-cyan-400 font-normal normal-case"
                            >
                              Mark read
                            </button>
                          </div>
                          <div className="flex flex-col gap-2 max-h-48 overflow-y-auto">
                            {notifications.map(n => (
                              <div key={n.id} className={`p-2 rounded text-[10px] leading-relaxed font-mono ${n.unread ? "bg-cyan-950/20 text-cyan-200 font-semibold" : "bg-white/5 text-muted-foreground"}`}>
                                {n.msg}
                              </div>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  <div className="flex items-center gap-2.5 border-l border-white/10 pl-4 font-mono text-xs">
                    <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-cyan-400 to-indigo-600 flex items-center justify-center font-bold text-slate-950">
                      JD
                    </div>
                    <div className="hidden sm:block">
                      <span className="font-bold text-foreground">fin-001</span>
                      <span className="text-[9px] text-muted-foreground block">TrustStore Manager</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* LIVE SECURITY OPERATIONS BANNER */}
              <div className="border-t border-white/5 pt-3 grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5 text-[9.5px] font-mono text-muted-foreground">
                <div className="flex flex-col bg-white/5 p-2 rounded-lg border border-white/5">
                  <span className="uppercase text-[8px] flex items-center gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    VEHICLES ONLINE
                  </span>
                  <span className="text-foreground font-bold mt-0.5">{vehicles.length} / 3</span>
                </div>
                <div className="flex flex-col bg-white/5 p-2 rounded-lg border border-white/5">
                  <span className="uppercase text-[8px] flex items-center gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-rose-500 animate-pulse" />
                    THREATS BLOCKED
                  </span>
                  <span className="text-rose-400 font-bold mt-0.5"><CountUp value={totalThreatsBlocked} /></span>
                </div>
                <div className="flex flex-col bg-white/5 p-2 rounded-lg border border-white/5">
                  <span className="uppercase text-[8px] flex items-center gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />
                    PENDING HELDS
                  </span>
                  <span className="text-amber-400 font-bold mt-0.5"><CountUp value={pendingRequestsCount} /></span>
                </div>
                <div className="flex flex-col bg-white/5 p-2 rounded-lg border border-white/5">
                  <span className="uppercase text-[8px] flex items-center gap-1">
                    <span className={`h-1.5 w-1.5 rounded-full ${ledgerHealthy ? "bg-emerald-500 animate-pulse" : "bg-rose-500 animate-ping"}`} />
                    AUDIT CHAIN
                  </span>
                  <span className={`font-bold mt-0.5 ${ledgerHealthy ? "text-emerald-400" : "text-rose-400 animate-pulse"}`}>
                    {ledgerHealthy ? "SECURE" : "MUTATED"}
                  </span>
                </div>
                <div className="flex flex-col bg-white/5 p-2 rounded-lg border border-white/5">
                  <span className="uppercase text-[8px] flex items-center gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-cyan-500 animate-pulse" />
                    SECURE ELEMENT
                  </span>
                  <span className="text-cyan-400 font-bold mt-0.5">SIMULATED</span>
                </div>
                <div className="flex flex-col bg-white/5 p-2 rounded-lg border border-white/5">
                  <span className="uppercase text-[8px] flex items-center gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    BACKEND STATUS
                  </span>
                  <span className="text-emerald-400 font-bold mt-0.5">ACTIVE</span>
                </div>
                <div className="flex flex-col bg-white/5 p-2 rounded-lg border border-white/5 col-span-2 sm:col-span-1">
                  <span className="uppercase text-[8px] flex items-center gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-slate-500" />
                    LAST SEC SCAN
                  </span>
                  <span className="text-foreground/80 mt-0.5 truncate">{lastScanTime}</span>
                </div>
              </div>
            </header>

            {/* DYNAMIC JUDGE EXPLAINER CARD OVERLAY */}
            <AnimatePresence>
              {isJudgeMode && currentDemoStepIndex !== -1 && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="bg-gradient-to-r from-cyan-950/60 to-slate-900/60 border border-cyan-500/35 rounded-xl p-4 shadow-xl cyber-glow-cyan overflow-hidden"
                >
                  <div className="flex items-center gap-2 border-b border-white/5 pb-2 mb-2">
                    <span className="px-2 py-0.5 rounded bg-cyan-500 text-slate-950 text-[9px] font-extrabold font-mono tracking-widest uppercase">
                      JUDGE NOTE
                    </span>
                    <span className="text-[10px] font-mono font-bold text-cyan-400 uppercase">
                      ECU GATEWAY: {demoSteps[currentDemoStepIndex]?.checkLayer}
                    </span>
                  </div>
                  <p className="text-xs leading-relaxed text-slate-200">
                    {demoSteps[currentDemoStepIndex]?.judgeExplainer}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Dynamic Tab Rendering area */}
            <div className="flex-1">
              
              {/* ========================================== */}
              {/* TAB: OVERVIEW                             */}
              {/* ========================================== */}
              {activeTab === "overview" && (
                <div className="flex flex-col gap-6 animate-fadeIn">
                  
                  {/* Top Stats Cards Grid */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <motion.div 
                      whileHover={{ y: -3 }}
                      className="bg-slate-950/40 border border-white/5 rounded-[20px] p-4 flex flex-col justify-between shadow-lg"
                    >
                      <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider font-mono">VEHICLES OPERATIONAL</span>
                      <h3 className="text-2xl font-black mt-2 text-cyan-400">
                        <CountUp value={activeCount} /> <span className="text-xs text-muted-foreground font-normal">/ {totalVehiclesCount}</span>
                      </h3>
                      <p className="text-[10px] text-muted-foreground mt-1">Vehicles with active ignition systems</p>
                    </motion.div>

                    <motion.div 
                      whileHover={{ y: -3 }}
                      className="bg-slate-950/40 border border-white/5 rounded-[20px] p-4 flex flex-col justify-between shadow-lg"
                    >
                      <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider font-mono">THREATS INTERCEPTED</span>
                      <h3 className="text-2xl font-black mt-2 text-rose-400">
                        <CountUp value={totalThreatsBlocked} />
                      </h3>
                      <p className="text-[10px] text-muted-foreground mt-1">Replays & tampered requests blocked</p>
                    </motion.div>

                    <motion.div 
                      whileHover={{ y: -3 }}
                      className="bg-slate-950/40 border border-white/5 rounded-[20px] p-4 flex flex-col justify-between shadow-lg"
                    >
                      <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider font-mono">IMMOBILITY HELD</span>
                      <h3 className="text-2xl font-black mt-2 text-amber-400">
                        <CountUp value={pendingRequestsCount} />
                      </h3>
                      <p className="text-[10px] text-muted-foreground mt-1">Locks holding for stationary status</p>
                    </motion.div>

                    <motion.div 
                      whileHover={{ y: -3 }}
                      className="bg-slate-950/40 border border-white/5 rounded-[20px] p-4 flex flex-col justify-between shadow-lg"
                    >
                      <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider font-mono">LEDGER INTEGRITY</span>
                      <div className="flex items-center gap-2 mt-2">
                        <span className={`h-2.5 w-2.5 rounded-full ${ledgerHealthy ? "bg-emerald-500 animate-pulse" : "bg-rose-500 animate-ping"}`} />
                        <span className={`text-base font-bold font-mono ${ledgerHealthy ? "text-emerald-400" : "text-rose-400 font-extrabold"}`}>
                          {ledgerHealthy ? "SECURED" : "BREACHED"}
                        </span>
                      </div>
                      <p className="text-[10px] text-muted-foreground mt-1">Chain verification: <CountUp value={totalLogsCount} /> blocks</p>
                    </motion.div>
                  </div>

                  {/* Main section: Left details, Right alerts */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left: General activity diagram / flow info */}
                    <div className="lg:col-span-2 bg-slate-950/40 border border-white/5 rounded-[20px] p-5 shadow-xl flex flex-col gap-4">
                      <h3 className="text-sm font-extrabold uppercase tracking-wider border-b border-white/5 pb-2">
                        Governance Pipeline Pulse
                      </h3>
                      
                      {/* Diagram row visualization */}
                      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 font-mono text-[10px] py-4 bg-slate-950/80 p-4 rounded-xl border border-white/5 relative">
                        <div className="flex flex-col gap-1 items-center justify-center text-center p-2 border border-white/10 rounded bg-white/5 flex-1">
                          <span className="text-cyan-400 font-bold">1. SIMULATED HSM SIGN</span>
                          <span className="text-[9px] text-muted-foreground">Private key output</span>
                        </div>
                        <ChevronRight className="h-4 w-4 text-muted-foreground self-center hidden sm:block animate-pulse" />
                        <div className="flex flex-col gap-1 items-center justify-center text-center p-2 border border-white/10 rounded bg-white/5 flex-1">
                          <span className="text-cyan-400 font-bold">2. NETWORK RELAY</span>
                          <span className="text-[9px] text-muted-foreground">Relays raw payload</span>
                        </div>
                        <ChevronRight className="h-4 w-4 text-muted-foreground self-center hidden sm:block animate-pulse" />
                        <div className="flex flex-col gap-1 items-center justify-center text-center p-2 border border-white/10 rounded bg-white/5 flex-1">
                          <span className="text-amber-400 font-bold">3. TELEMETRY GOV</span>
                          <span className="text-[9px] text-muted-foreground">Check vehicle speed</span>
                        </div>
                        <ChevronRight className="h-4 w-4 text-muted-foreground self-center hidden sm:block animate-pulse" />
                        <div className="flex flex-col gap-1 items-center justify-center text-center p-2 border border-white/10 rounded bg-white/5 flex-1">
                          <span className="text-emerald-400 font-bold">4. IGNITION RELAY</span>
                          <span className="text-[9px] text-muted-foreground">Hardware state lock</span>
                        </div>
                      </div>

                      <p className="text-xs text-muted-foreground leading-relaxed">
                        TrustRide prevents unauthorized remote shutdown actions by utilizing decentralization. The backend cannot issue lock commands on its own. The vehicle verifier contains a provisioned trust store of public keys and verifies the signatures itself. If a speed signal &gt; 0 is detected, execution is deferred until velocity reaches 0 km/h, ensuring passenger safety.
                      </p>
                    </div>

                    {/* Right: Live Activity Timeline */}
                    <div className="lg:col-span-1 bg-slate-950/40 border border-white/5 rounded-[20px] p-5 shadow-xl flex flex-col gap-4">
                      <h3 className="text-sm font-extrabold uppercase tracking-wider border-b border-white/5 pb-2">
                        Activity Ledger Timeline
                      </h3>
                      <div className="flex flex-col gap-4 overflow-y-auto max-h-[300px] pr-2">
                        {auditLog && auditLog.entries.slice(-5).reverse().map((entry) => (
                          <div key={entry.entryId} className="flex gap-2.5 items-start border-b border-white/5 pb-2 last:border-0 last:pb-0">
                            <span className={`h-2.5 w-2.5 rounded-full mt-1 shrink-0 ${
                              entry.eventType === "REJECTED" ? "bg-rose-500 shadow-[0_0_8px_rgba(239,68,68,0.4)] animate-pulse" :
                              entry.eventType === "EXECUTED" ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]" :
                              entry.eventType === "HELD" ? "bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.4)]" : 
                              "bg-cyan-500 shadow-[0_0_8px_rgba(6,182,212,0.4)]"
                            }`} />
                            <div className="flex-1 min-w-0 font-mono">
                              <div className="flex justify-between items-center text-[9px] text-muted-foreground">
                                <span className="font-bold uppercase tracking-wider">{entry.eventType}</span>
                                <span>{new Date(entry.timestamp).toLocaleTimeString()}</span>
                              </div>
                              <p className="text-[11px] font-semibold truncate mt-0.5">{entry.detail}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ========================================== */}
              {/* TAB: FINANCIER                            */}
              {/* ========================================== */}
              {activeTab === "financier" && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fadeIn font-mono">
                  <div className="lg:col-span-1 flex flex-col gap-6">
                    {/* Policy Mode Selector Card */}
                    <div className="bg-slate-950/40 border border-white/10 rounded-[20px] p-5 shadow-xl flex flex-col gap-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <ShieldCheck className="h-4 w-4 text-cyan-400" />
                          <h3 className="text-xs font-extrabold uppercase tracking-wider text-cyan-400">Dual-Key Governance Policy</h3>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleToggleMultiSig(!multiSigEnabled)}
                          className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${multiSigEnabled ? "bg-cyan-500" : "bg-slate-800"}`}
                          role="switch"
                          aria-checked={multiSigEnabled}
                        >
                          <span className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow transition duration-200 ease-in-out ${multiSigEnabled ? "translate-x-4" : "translate-x-0"}`} />
                        </button>
                      </div>
                      <p className="text-[10px] text-muted-foreground leading-relaxed">
                        {multiSigEnabled
                          ? "POLICY ACTIVE: Requires 2-of-2 signatures (Financier fin-001 + Operations Admin ops-001) before ECU execution."
                          : "POLICY INACTIVE: Single-signature mode active (backward compatibility mode)."}
                      </p>
                    </div>

                    {/* Pending Co-Signature Buffer Card (if multi-sig entries pending) */}
                    {pendingMultiSigEntries.length > 0 && (
                      <div className="bg-amber-950/20 border border-amber-500/30 rounded-[20px] p-5 shadow-xl flex flex-col gap-4 cyber-glow-amber">
                        <div className="flex items-center justify-between border-b border-amber-500/20 pb-2">
                          <h3 className="text-xs font-extrabold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                            <Clock className="h-4 w-4 animate-pulse" />
                            Awaiting Co-Authorization
                          </h3>
                          <span className="text-[9px] bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded font-mono">
                            {pendingMultiSigEntries.length} Pending
                          </span>
                        </div>

                        {pendingMultiSigEntries.map((entry) => (
                          <div key={entry.entryId} className="flex flex-col gap-3 bg-slate-950/60 p-3.5 rounded-xl border border-white/5 text-xs">
                            <div className="space-y-1 text-[11px]">
                              <div><span className="text-muted-foreground font-semibold">Target:</span> <span className="font-bold text-cyan-400">{entry.vehicleId}</span></div>
                              <div><span className="text-muted-foreground font-semibold">Action:</span> <span className="font-bold text-rose-400">{entry.action}</span></div>
                              <div><span className="text-muted-foreground font-semibold">Reason:</span> <span className="text-foreground">{entry.reasonText}</span></div>
                              <div className="text-[9px] text-muted-foreground">Expires: {new Date(entry.expiresAt).toLocaleTimeString()}</div>
                            </div>

                            <div className="flex flex-col gap-1.5 text-[10px] bg-slate-900/80 p-2.5 rounded-lg border border-white/5">
                              <div className="text-emerald-400 font-semibold flex items-center gap-1.5">
                                <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
                                Financier (fin-001): Authorization Recorded ✓
                              </div>
                              <div className="text-amber-400 font-semibold flex items-center gap-1.5">
                                <Clock className="h-3.5 w-3.5 animate-pulse shrink-0" />
                                Ops Admin (ops-001): Awaiting Co-Authorization…
                              </div>
                            </div>

                            <motion.button
                              whileHover={{ scale: 1.01 }}
                              whileTap={{ scale: 0.99 }}
                              onClick={() => handleCosignSubmit(entry.entryId)}
                              disabled={financierSubmitting}
                              className="w-full py-2.5 bg-cyan-650 hover:bg-cyan-600 text-white font-bold rounded-lg text-xs tracking-wider uppercase transition-all flex items-center justify-center gap-2 shadow-md shadow-cyan-950/20"
                            >
                              {financierSubmitting ? (
                                <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                              ) : (
                                <>
                                  <ShieldCheck className="h-3.5 w-3.5" />
                                  Co-Sign as Ops Admin (ops-001) & Dispatch
                                </>
                              )}
                            </motion.button>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Command Submission Form */}
                    <div className="bg-slate-950/40 border border-white/5 rounded-[20px] p-5 shadow-xl flex flex-col gap-4">
                      <div className="border-b border-white/5 pb-2">
                        <h3 className="text-sm font-extrabold uppercase tracking-wider text-cyan-400">Issue Gov Action</h3>
                        <p className="text-[10px] text-muted-foreground">
                          {multiSigEnabled ? "Step 1: Record Financier intent (2-Key Policy Active)" : "Signs command with Single Financier key"}
                        </p>
                      </div>

                      <form onSubmit={handleManualCommandSubmit} className="flex flex-col gap-4 text-xs">
                        <div className="flex flex-col gap-1.5 font-mono">
                          <label className="font-semibold text-muted-foreground">Target Vehicle</label>
                          <select
                            value={selectedVehicleId}
                            onChange={(e) => setSelectedVehicleId(e.target.value)}
                            className="bg-slate-900 border border-white/10 rounded-xl px-3 py-2.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-cyan-500"
                            aria-label="Select Target E-Rickshaw"
                          >
                            {vehicles.map(v => (
                              <option key={v.vehicleId} value={v.vehicleId}>
                                {v.vehicleId} — Driver: {v.driverName} ({v.immobilized ? "Locked" : "Active"})
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="flex flex-col gap-1.5">
                          <label className="font-semibold text-muted-foreground">Action Type</label>
                          <div className="grid grid-cols-2 gap-2 bg-slate-950 p-1 border border-white/5 rounded-xl font-mono">
                            <button
                              type="button"
                              onClick={() => {
                                setFinancierAction("IMMOBILIZE");
                                setReasonText("Payment over 30 days delinquent. Drive authorization revoked.");
                              }}
                              className={`py-2 text-[10px] font-bold rounded-lg tracking-wider uppercase transition-colors ${financierAction === "IMMOBILIZE" ? "bg-rose-550/10 text-rose-400 border border-rose-500/20" : "text-muted-foreground hover:text-foreground"}`}
                            >
                              IMMOBILIZE
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setFinancierAction("CANCEL");
                                setReasonText("Outstanding delinquency settled. Drive authorization restored.");
                              }}
                              className={`py-2 text-[10px] font-bold rounded-lg tracking-wider uppercase transition-colors ${financierAction === "CANCEL" ? "bg-emerald-550/10 text-emerald-400 border border-emerald-500/20" : "text-muted-foreground hover:text-foreground"}`}
                            >
                              RELEASE
                            </button>
                          </div>
                        </div>

                        <div className="flex flex-col gap-1.5 font-mono">
                          <label className="font-semibold text-muted-foreground">Reason Category</label>
                          <select
                            value={reasonCode}
                            onChange={(e) => setReasonCode(e.target.value as ReasonCode)}
                            className="bg-slate-900 border border-white/10 rounded-xl px-3 py-2.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-cyan-500"
                            aria-label="Select Action Category Reason"
                          >
                            <option value="loan_default">loan_default (Outstanding Payments)</option>
                            <option value="theft">theft (Theft Alert / Recovery)</option>
                            <option value="maintenance">maintenance (Safety Hold / Recall)</option>
                          </select>
                        </div>

                        <div className="flex flex-col gap-1.5">
                          <label className="font-semibold text-muted-foreground font-mono">Justification Text</label>
                          <textarea
                            value={reasonText}
                            onChange={(e) => setReasonText(e.target.value)}
                            rows={3}
                            className="bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-cyan-500 leading-relaxed text-foreground"
                            required
                            aria-label="Enter justification notes"
                          />
                        </div>

                        <motion.button
                          type="submit"
                          whileHover={{ scale: 1.01 }}
                          whileTap={{ scale: 0.99 }}
                          disabled={financierSubmitting}
                          className={`w-full py-3 rounded-xl font-bold font-mono tracking-wider uppercase transition-all flex items-center justify-center gap-2 text-white ${financierAction === "IMMOBILIZE" ? "bg-rose-650 hover:bg-rose-600 shadow-md shadow-rose-950/20" : "bg-emerald-650 hover:bg-emerald-600 shadow-md shadow-emerald-950/20"}`}
                        >
                          {financierSubmitting ? (
                            <RefreshCw className="h-4 w-4 animate-spin" />
                          ) : (
                            <>
                              {financierAction === "IMMOBILIZE" ? <Lock className="h-4 w-4" /> : <Unlock className="h-4 w-4" />}
                              {multiSigEnabled ? "Authorize (Financier Step 1)" : "Sign & Dispatch"}
                            </>
                          )}
                        </motion.button>
                      </form>
                    </div>

                    {/* Threat Sandbox Attacks */}
                    <div className="bg-slate-950/40 border border-dashed border-white/10 rounded-[20px] p-5 shadow-xl flex flex-col gap-4">
                      <div className="border-b border-white/5 pb-2">
                        <h3 className="text-sm font-extrabold uppercase tracking-wider text-amber-500 flex items-center gap-1.5">
                          <AlertOctagon className="h-4.5 w-4.5" />
                          Threat Sandbox Attacks
                        </h3>
                        <p className="text-[10px] text-muted-foreground font-mono">Test ECU firmware validations against attack vectors</p>
                      </div>

                      <div className="flex flex-col gap-2.5 text-xs font-mono">
                        <motion.button
                          whileHover={{ scale: 1.01 }}
                          whileTap={{ scale: 0.99 }}
                          onClick={() => handleManualAttack("tamper")}
                          disabled={financierSubmitting}
                          className="flex items-center justify-between p-3 bg-slate-900 border border-white/10 rounded-xl hover:bg-white/5 transition-all text-left"
                        >
                          <div>
                            <div className="text-rose-400 font-bold">1. Mutated Field MITM</div>
                            <div className="text-[9px] text-muted-foreground mt-0.5 font-sans">Alters payload after signing.</div>
                          </div>
                          <ShieldAlert className="h-4.5 w-4.5 text-rose-400 shrink-0" />
                        </motion.button>

                        <motion.button
                          whileHover={{ scale: 1.01 }}
                          whileTap={{ scale: 0.99 }}
                          onClick={() => handleManualAttack("expire")}
                          disabled={financierSubmitting}
                          className="flex items-center justify-between p-3 bg-slate-900 border border-white/10 rounded-xl hover:bg-white/5 transition-all text-left"
                        >
                          <div>
                            <div className="text-amber-400 font-bold">2. Expired Replay</div>
                            <div className="text-[9px] text-muted-foreground mt-0.5 font-sans">Authentic signature, but stale timestamp.</div>
                          </div>
                          <Clock className="h-4.5 w-4.5 text-amber-400 shrink-0" />
                        </motion.button>

                        <motion.button
                          whileHover={{ scale: 1.01 }}
                          whileTap={{ scale: 0.99 }}
                          onClick={() => handleManualAttack("replay")}
                          disabled={financierSubmitting}
                          className="flex items-center justify-between p-3 bg-slate-900 border border-white/10 rounded-xl hover:bg-white/5 transition-all text-left"
                        >
                          <div>
                            <div className="text-indigo-400 font-bold">3. Verbatim Replay</div>
                            <div className="text-[9px] text-muted-foreground mt-0.5 font-sans">Intercepts and resends spent nonce.</div>
                          </div>
                          <RefreshCw className="h-4.5 w-4.5 text-indigo-400 shrink-0" />
                        </motion.button>

                        <motion.button
                          whileHover={{ scale: 1.01 }}
                          whileTap={{ scale: 0.99 }}
                          onClick={() => handleManualAttack("unauth")}
                          disabled={financierSubmitting}
                          className="flex items-center justify-between p-3 bg-slate-900 border border-white/10 rounded-xl hover:bg-white/5 transition-all text-left"
                        >
                          <div>
                            <div className="text-purple-400 font-bold">4. Rogue Issuer Attack</div>
                            <div className="text-[9px] text-muted-foreground mt-0.5 font-sans">Signed by key not in vehicle trust store.</div>
                          </div>
                          <User className="h-4.5 w-4.5 text-purple-400 shrink-0" />
                        </motion.button>

                        <motion.button
                          whileHover={{ scale: 1.01 }}
                          whileTap={{ scale: 0.99 }}
                          onClick={() => handleManualAttack("partial_sig")}
                          disabled={financierSubmitting}
                          className="flex items-center justify-between p-3 bg-slate-900 border border-cyan-500/30 rounded-xl hover:bg-white/5 transition-all text-left bg-cyan-950/10"
                        >
                          <div>
                            <div className="text-cyan-400 font-bold">5. Partial Signature Attack (1 of 2 Keys)</div>
                            <div className="text-[9px] text-muted-foreground mt-0.5 font-sans">Only 1 of 2 required signatures attached (policy active).</div>
                          </div>
                          <ShieldAlert className="h-4.5 w-4.5 text-cyan-400 shrink-0" />
                        </motion.button>
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Console Feedback & Command ledger */}
                  <div className="lg:col-span-2 flex flex-col gap-6">
                    {/* Latest API telemetry feedback */}
                    <AnimatePresence>
                      {lastActionOutcome && (
                        <motion.div 
                          initial={{ opacity: 0, scale: 0.96 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0 }}
                          className={`border rounded-[20px] p-5 shadow-xl transition-all duration-300 ${
                            lastActionOutcome.outcome === "EXECUTED" 
                              ? "bg-emerald-950/20 border-emerald-500/20 cyber-glow-emerald" 
                              : lastActionOutcome.outcome === "HELD" 
                              ? "bg-amber-950/20 border-amber-500/20 cyber-glow-amber" 
                              : "bg-rose-950/20 border-rose-500/20 cyber-glow-rose"
                          }`}
                        >
                          <h4 className="text-xs font-bold font-mono tracking-wider uppercase mb-2 flex items-center gap-1.5">
                            {lastActionOutcome.outcome === "EXECUTED" && <ShieldCheck className="h-4 w-4 text-emerald-400" />}
                            {lastActionOutcome.outcome === "HELD" && <Clock className="h-4 w-4 text-amber-400" />}
                            {lastActionOutcome.outcome === "REJECTED" && <ShieldAlert className="h-4 w-4 text-rose-400" />}
                            {lastActionOutcome.outcome === "ERROR" && <XCircle className="h-4 w-4 text-rose-400" />}
                            VERIFIER TELEMETRY OUTCOME: {lastActionOutcome.outcome}
                          </h4>
                          <pre className="text-[10px] leading-relaxed font-mono bg-slate-950/60 p-3 rounded-lg border border-white/5 max-h-32 overflow-y-auto whitespace-pre-wrap">
                            {lastActionOutcome.detail}
                          </pre>
                          {lastActionOutcome.failedCheck && (
                            <div className="mt-2.5 flex items-center gap-1 text-[10px] text-rose-400 font-extrabold font-mono uppercase">
                              <AlertTriangle className="h-3.5 w-3.5" />
                              Hardware Check Blocked at Layer: [{lastActionOutcome.failedCheck}]
                            </div>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Selected vehicle command log */}
                    <div className="bg-slate-950/40 border border-white/5 rounded-[20px] p-5 shadow-xl flex-1 flex flex-col">
                      <div className="flex items-center justify-between border-b border-white/5 pb-2 mb-4">
                        <h3 className="text-sm font-extrabold uppercase tracking-wider">Command Ledger: {selectedVehicleId}</h3>
                        <span className="text-[10px] text-muted-foreground font-mono">Transactions: {financierHistory.length}</span>
                      </div>

                      {financierHistory.length === 0 ? (
                        <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground py-12">
                          <Activity className="h-8 w-8 opacity-25 mb-2" />
                          <span className="text-xs">No transactions registered.</span>
                        </div>
                      ) : (
                        <div className="overflow-x-auto">
                          <table className="w-full text-left text-[11px] border-collapse font-mono">
                            <thead>
                              <tr className="border-b border-white/5 text-muted-foreground font-bold">
                                <th className="py-2">Command Hash</th>
                                <th className="py-2">Action</th>
                                <th className="py-2">Reason Code</th>
                                <th className="py-2">Timestamp</th>
                                <th className="py-2">ECU Status</th>
                                <th className="py-2 text-right">Disputed</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                              {financierHistory.map((rec) => (
                                <tr key={rec.command.commandId} className="hover:bg-white/5 transition-colors">
                                  <td className="py-2.5 text-[9px] text-muted-foreground">
                                    {rec.command.commandId.substring(0, 8)}...
                                  </td>
                                  <td className="py-2.5 font-bold">
                                    <span className={rec.command.action === "IMMOBILIZE" ? "text-rose-400" : "text-emerald-400"}>
                                      {rec.command.action}
                                    </span>
                                  </td>
                                  <td className="py-2.5 text-muted-foreground">{rec.command.reasonCode}</td>
                                  <td className="py-2.5 text-muted-foreground text-[10px]">
                                    {new Date(rec.command.issuedAt).toLocaleTimeString()}
                                  </td>
                                  <td className="py-2.5">
                                    <span className={`inline-flex px-1.5 py-0.5 rounded text-[9px] font-bold border ${
                                      rec.status === "EXECUTED" ? "bg-emerald-950/40 text-emerald-400 border-emerald-500/20" :
                                      rec.status === "HELD" ? "bg-amber-950/40 text-amber-400 border-amber-500/20" :
                                      rec.status === "REJECTED" || rec.status === "EXPIRED" ? "bg-rose-950/40 text-rose-400 border-rose-500/20" :
                                      "bg-slate-900 text-slate-400 border-white/5"
                                    }`}>
                                      {rec.status}
                                    </span>
                                  </td>
                                  <td className="py-2.5 text-right">
                                    {rec.disputed ? (
                                      <span className="px-1.5 py-0.5 rounded text-[8px] bg-amber-500/10 text-amber-400 border border-amber-500/20 font-bold">
                                        DISPUTED
                                      </span>
                                    ) : (
                                      <span className="text-muted-foreground">-</span>
                                    )}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* ========================================== */}
              {/* TAB: VEHICLE SIMULATOR & DIGITAL TWIN MAP  */}
              {/* ========================================== */}
              {activeTab === "simulator" && (
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 animate-fadeIn font-mono">
                  
                  {/* LEFT COLUMN: UBER/TESLA FLEET TELEMETRY & IGNITION HUD */}
                  <div className="xl:col-span-1 flex flex-col gap-5">
                    
                    {/* Vehicle Select Row */}
                    <div className="bg-slate-950/40 border border-white/5 rounded-2xl p-3 flex gap-2 overflow-x-auto">
                      {vehicles.map(v => (
                        <button
                          key={v.vehicleId}
                          onClick={() => setSelectedTwinId(v.vehicleId)}
                          className={`flex-1 min-w-[95px] py-2 px-3 rounded-xl border text-[10px] font-bold font-mono tracking-wider transition-all flex items-center justify-between gap-1.5 ${
                            selectedTwinId === v.vehicleId 
                              ? "bg-cyan-500/15 text-cyan-400 border-cyan-500/30 shadow-[0_0_12px_rgba(6,182,212,0.15)]"
                              : "bg-slate-900/60 border-white/5 text-slate-400 hover:text-foreground"
                          }`}
                          aria-label={`Select vehicle ${v.vehicleId}`}
                        >
                          <div className="flex flex-col gap-0.5 items-start w-full">
                            <div className="flex items-center gap-1.5">
                              <span className={`h-1.5 w-1.5 rounded-full ${
                                v.immobilized ? "bg-rose-500 animate-pulse" : (v.isMoving ? "bg-amber-500 animate-pulse" : "bg-emerald-500")
                              }`} />
                              <span>{v.vehicleId}</span>
                            </div>
                            <div className="flex items-center justify-between w-full text-[8px] text-slate-400 mt-0.5 border-t border-white/5 pt-0.5">
                              <span>🔋 {batteryLevels[v.vehicleId]}%</span>
                              <span>📶 {signalStrengths[v.vehicleId]}/4</span>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>

                    {/* Grand Status HUD Card */}
                    <div className={`border rounded-[20px] p-5 shadow-2xl relative overflow-hidden transition-all duration-300 ${
                      activeTwinVehicle.immobilized
                        ? "bg-rose-950/15 border-rose-500/30 cyber-glow-rose"
                        : activeTwinVehicle.pendingCommand
                        ? "bg-amber-950/15 border-amber-500/30 cyber-glow-amber"
                        : "bg-emerald-950/15 border-emerald-500/30 cyber-glow-emerald"
                    }`}>
                      <div className="absolute top-0 right-0 p-3 text-[9px] font-mono text-muted-foreground uppercase">
                        Real-time
                      </div>

                      <h4 className="text-xs font-black font-mono tracking-wider text-muted-foreground uppercase">
                        VEHICLE STATUS: {activeTwinVehicle.vehicleId}
                      </h4>
                      <p className="text-[10px] text-muted-foreground/80 font-mono mt-0.5">
                        Driver: {activeTwinVehicle.driverName} | VIN: 1FMSK8DH2{activeTwinVehicle.vehicleId}
                      </p>

                      {/* Circular Speedometer Gauge (semi-circle styling inside relative box) */}
                      <div className="my-6 relative w-36 h-36 mx-auto flex items-center justify-center">
                        <svg className="absolute inset-0 w-full h-full transform -rotate-90">
                          <defs>
                            <linearGradient id="speedoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                              <stop offset="0%" stopColor="#06b6d4" />
                              <stop offset="100%" stopColor="#3b82f6" />
                            </linearGradient>
                          </defs>
                          <circle cx="72" cy="72" r="56" stroke="rgba(255,255,255,0.03)" strokeWidth="8" fill="transparent" />
                          <circle 
                            cx="72" 
                            cy="72" 
                            r="56" 
                            stroke="url(#speedoGrad)" 
                            strokeWidth="8" 
                            fill="transparent" 
                            strokeDasharray="351.85" 
                            strokeDashoffset={351.85 - (351.85 * Math.min(100, ((interpolatedSpeeds[activeTwinVehicle.vehicleId] ?? 0) / 80) * 100)) / 100}
                            className="transition-all duration-300"
                            strokeLinecap="round"
                          />
                        </svg>
                        <div className="text-center font-mono z-10">
                          <div className="text-3xl font-black tracking-tight text-foreground">
                            {interpolatedSpeeds[activeTwinVehicle.vehicleId] ?? 0}
                          </div>
                          <div className="text-[9px] text-muted-foreground uppercase font-bold tracking-wider">km/h</div>
                        </div>
                      </div>

                      {/* Main Alert Icon and Text */}
                      <div className="my-5 flex items-center gap-4">
                        {activeTwinVehicle.immobilized ? (
                          <>
                            <div className="bg-rose-500/10 p-3 rounded-full border border-rose-500/20 text-rose-400 shrink-0">
                              <ShieldAlert className="h-7 w-7 animate-pulse" />
                            </div>
                            <div>
                              <div className="text-[10px] font-bold text-rose-400 font-mono uppercase tracking-wider">IGNITION STATUS:</div>
                              <h3 className="text-xl font-black text-rose-400 tracking-tight leading-none mt-1">LOCKED</h3>
                              <p className="text-[10px] text-rose-300/80 mt-1.5 font-sans leading-relaxed">
                                Warning: VCU Ignition Override Interrupt Active.
                              </p>
                            </div>
                          </>
                        ) : activeTwinVehicle.pendingCommand ? (
                          <>
                            <div className="bg-amber-500/10 p-3 rounded-full border border-amber-500/20 text-amber-400 shrink-0">
                              <AlertTriangle className="h-7 w-7 animate-bounce" />
                            </div>
                            <div>
                              <div className="text-[10px] font-bold text-amber-400 font-mono uppercase tracking-wider">IGNITION STATUS:</div>
                              <h3 className="text-xl font-black text-amber-400 tracking-tight leading-none mt-1">HELD</h3>
                              <p className="text-[10px] text-amber-300/80 mt-1.5 font-sans leading-relaxed">
                                Warning: Safety interlock active. Held for 0 km/h.
                              </p>
                            </div>
                          </>
                        ) : (
                          <>
                            <div className="bg-emerald-500/10 p-3 rounded-full border border-emerald-500/20 text-emerald-400 shrink-0">
                              <ShieldCheck className="h-7 w-7" />
                            </div>
                            <div>
                              <div className="text-[10px] font-bold text-emerald-400 font-mono uppercase tracking-wider">IGNITION STATUS:</div>
                              <h3 className="text-xl font-black text-emerald-400 tracking-tight leading-none mt-1">ACTIVE</h3>
                              <p className="text-[10px] text-emerald-300/80 mt-1.5 font-sans leading-relaxed">
                                Secure Encrypted CAN Channel Online.
                              </p>
                            </div>
                          </>
                        )}
                      </div>

                      {/* Speed Governor Accel/Halt Toggle button */}
                      <motion.button
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleSpeedSliderChange(activeTwinVehicle.vehicleId, activeTwinVehicle.isMoving ? 0 : 32)}
                        disabled={activeTwinVehicle.immobilized}
                        className={`w-full py-2.5 rounded-xl border text-[10px] font-bold font-mono tracking-wider transition-all uppercase ${
                          activeTwinVehicle.immobilized 
                            ? "bg-slate-950 border-white/5 text-slate-700 cursor-not-allowed"
                            : activeTwinVehicle.isMoving 
                            ? "bg-amber-900/10 border-amber-500/25 text-amber-400 hover:bg-amber-900/25" 
                            : "bg-slate-900 border-white/5 text-slate-355 hover:bg-slate-800"
                        }`}
                      >
                        {activeTwinVehicle.immobilized 
                          ? "Power Interrupted — Governor Overridden"
                          : activeTwinVehicle.isMoving 
                          ? "🛑 Stop Motor Telemetry" 
                          : "⚡ Accelerate Motor Telemetry"}
                      </motion.button>
                    </div>

                    {/* Telemetry Table with custom gauge bars */}
                    <div className="bg-slate-950/40 border border-white/5 rounded-[20px] p-4 shadow-xl flex flex-col gap-3">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400 font-mono">Live Telemetry Parameters</span>
                      
                      <div className="flex flex-col gap-3 font-mono text-[11px] leading-relaxed">
                        <div className="flex justify-between items-center border-b border-white/5 pb-2">
                          <span className="text-muted-foreground">Simulated GPS Telemetry:</span>
                          <span className="text-foreground font-semibold">
                            {vehicleMapPositions[activeTwinVehicle.vehicleId]?.lat.toFixed(4)}° N, {vehicleMapPositions[activeTwinVehicle.vehicleId]?.lng.toFixed(4)}° E
                          </span>
                        </div>
                        <div className="flex justify-between items-center border-b border-white/5 pb-2">
                          <span className="text-muted-foreground">Engine RPM:</span>
                          <span className="text-foreground font-semibold">{(interpolatedSpeeds[activeTwinVehicle.vehicleId] ?? 0) > 0 ? "1,840" : "0"}</span>
                        </div>
                        <div className="flex justify-between items-center border-b border-white/5 pb-2">
                          <span className="text-muted-foreground">Battery Level:</span>
                          <div className="flex items-center gap-2">
                            <div className="relative w-10 h-5 bg-slate-900 border border-white/10 rounded p-0.5 flex items-center justify-start overflow-hidden">
                              <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: `${batteryLevels[activeTwinVehicle.vehicleId]}%` }}
                                className="h-full rounded-sm bg-gradient-to-r from-emerald-500 to-teal-400"
                              />
                            </div>
                            <span className="font-semibold text-foreground">{batteryLevels[activeTwinVehicle.vehicleId]}%</span>
                          </div>
                        </div>
                        <div className="flex justify-between items-center border-b border-white/5 pb-2">
                          <span className="text-muted-foreground">Signal Quality:</span>
                          <div className="flex items-center gap-2">
                            <div className="flex items-end gap-0.5 h-3">
                              {[1, 2, 3, 4].map(bar => {
                                const active = bar <= (signalStrengths[activeTwinVehicle.vehicleId] ?? 4);
                                return (
                                  <div 
                                    key={bar} 
                                    className={`w-1 rounded-t-sm transition-colors ${active ? "bg-cyan-400" : "bg-white/10"}`} 
                                    style={{ height: `${bar * 25}%` }} 
                                  />
                                );
                              })}
                            </div>
                            <span className="font-semibold text-foreground">{signalStrengths[activeTwinVehicle.vehicleId] === 4 ? "Strong" : "Good"}</span>
                          </div>
                        </div>
                        <div className="flex justify-between items-center border-b border-white/5 pb-2">
                          <span className="text-muted-foreground">Motor Status:</span>
                          <span className={`font-semibold ${activeTwinVehicle.immobilized ? "text-rose-400" : (activeTwinVehicle.isMoving ? "text-amber-400" : "text-emerald-400")}`}>
                            {activeTwinVehicle.immobilized ? "INTERRUPTED" : (activeTwinVehicle.isMoving ? "RUNNING" : "STANDBY")}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-muted-foreground">Simulated Connection:</span>
                          <span className="text-emerald-400 font-semibold flex items-center gap-1">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            ONLINE
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Quick action badges footer */}
                    <div className="grid grid-cols-3 gap-2 text-left font-mono">
                      <div className="bg-slate-950/40 border border-white/5 p-2 rounded-xl text-[9px]">
                        <span className="text-muted-foreground block uppercase">Anomalies</span>
                        <span className={`font-bold block mt-0.5 truncate ${attackEffect?.type ? "text-amber-400 animate-pulse" : "text-slate-400"}`}>
                          {attackEffect?.type ? "CAN MISMATCH" : "NONE"}
                        </span>
                      </div>
                      <div className="bg-slate-950/40 border border-white/5 p-2 rounded-xl text-[9px]">
                        <span className="text-muted-foreground block uppercase">Security</span>
                        <span className="text-emerald-400 font-bold block mt-0.5">ENCRYPTED</span>
                      </div>
                      <div className="bg-slate-950/40 border border-white/5 p-2 rounded-xl text-[9px]">
                        <span className="text-muted-foreground block uppercase">Telemetry Freq</span>
                        <span className="text-cyan-400 font-bold block mt-0.5">10 Hz</span>
                      </div>
                    </div>

                  </div>

                  {/* RIGHT COLUMN: HIGH-FIDELITY HYDERABAD INDIA STYLE SIMULATED MAP */}
                  <div className={`xl:col-span-2 bg-[#0d1117] border rounded-[20px] shadow-2xl relative overflow-hidden flex flex-col justify-between min-h-[520px] transition-all duration-300 ${
                    isThreatActive ? "border-rose-500/40 cyber-glow-rose" : "border-white/5"
                  }`}>
                    
                    {/* Floating HUD Overlays (Top Left) */}
                    <div className="absolute top-4 left-4 z-20 flex flex-col gap-1.5 font-mono text-[9px] uppercase">
                      <div className="bg-slate-950/80 px-2.5 py-1 rounded border border-white/10 text-cyan-400 flex items-center gap-1.5">
                        <Activity className="h-3.5 w-3.5 animate-pulse" />
                        LIVE MAP — SIMULATED TELEMETRY
                      </div>
                      <div className="bg-slate-950/80 px-2.5 py-1 rounded border border-white/10 text-slate-350">
                        Active: {activeCount} | Locked: {immobilizedCount}
                      </div>
                    </div>

                    {/* Floating HUD Overlays (Top Right) */}
                    <div className="absolute top-4 right-4 z-20 flex flex-col items-end gap-1.5 font-mono text-[9px]">
                      <div className="bg-slate-950/80 px-2.5 py-1 rounded border border-white/10 text-emerald-400 flex items-center gap-1">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        SIMULATED GPS LOCK
                      </div>
                      <div className="bg-slate-950/80 px-2.5 py-1 rounded border border-white/10 text-slate-450 flex items-center gap-1">
                        SIMULATED HSM ACTIVE
                      </div>
                      <div className="bg-slate-950/80 px-2.5 py-1 rounded border border-white/10 text-slate-350">
                        Latency: 14ms
                      </div>
                    </div>

                    {/* Dynamic warning banner when unauthorized command tries to execute */}
                    {demoActive && demoSteps[currentDemoStepIndex]?.name === "Unauthorized Issuer" && (
                      <div className="absolute top-16 left-1/2 -translate-x-1/2 z-30 bg-rose-950/90 border border-rose-500/50 backdrop-blur-md rounded-xl px-4 py-2 text-rose-300 font-mono text-[10px] text-center flex items-center gap-2 shadow-2xl animate-bounce">
                        <AlertOctagon className="h-4 w-4 text-rose-400 animate-spin" />
                        <span>ROGUE SIGNATURE BLOCKED NATIVELY BY ECU GATEWAY TRUST STORE</span>
                      </div>
                    )}

                    {/* Dynamic warning banner when database logs are tampered */}
                    {demoActive && demoSteps[currentDemoStepIndex]?.name === "Audit Tamper Demo" && (
                      <div className="absolute top-16 left-1/2 -translate-x-1/2 z-30 bg-rose-950/90 border border-rose-500/50 backdrop-blur-md rounded-xl px-4 py-2 text-rose-300 font-mono text-[10px] text-center flex items-center gap-2 shadow-2xl animate-pulse">
                        <Database className="h-4 w-4 text-rose-400 animate-bounce" />
                        <span>ALERT: HASH TIMELINE CHAIN BREACHED AT BLOCK 6 — VERIFICATION FAILED</span>
                      </div>
                    )}

                    {/* Interactive Leaflet Map */}
                    <div className="flex-1 relative" style={{ minHeight: 480 }}>
                      <LeafletMap
                        vehicles={vehicles.map(v => ({
                          vehicleId: v.vehicleId,
                          lat: vehicleMapPositions[v.vehicleId]?.lat ?? 17.4501,
                          lng: vehicleMapPositions[v.vehicleId]?.lng ?? 78.3751,
                          isMoving: v.isMoving,
                          immobilized: v.immobilized,
                          driverName: v.driverName,
                          speed: interpolatedSpeeds[v.vehicleId] ?? 0,
                          battery: batteryLevels[v.vehicleId] ?? 0,
                          signal: signalStrengths[v.vehicleId] ?? 0,
                          pendingCommand: v.pendingCommand !== null,
                        } as MapVehicle))}
                        routes={vehicles.map(v => {
                          const densePath = v.vehicleId === "TR-102" ? TR102_DENSE_PATH : v.vehicleId === "TR-103" ? TR103_DENSE_PATH : TR101_DENSE_PATH;
                          const traveled = traveledHistory[v.vehicleId] || [densePath[0]];
                          return {
                            vehicleId: v.vehicleId,
                            traveledPositions: traveled,
                            fullLoopPositions: densePath,
                            color: v.immobilized ? "#f43f5e" : "#06b6d4",
                          } as MapRoute;
                        })}
                        selectedVehicleId={selectedTwinId}
                        onSelectVehicle={setSelectedTwinId}
                        isThreatActive={isThreatActive}
                      />
                    </div>




                    {/* Floating HUD Overlays (Bottom Left Event Feed Console) */}
                    <div className="absolute bottom-14 left-4 z-20">
                      <div className="bg-slate-950/80 border border-white/5 rounded-xl p-3 flex flex-col gap-1.5 text-[8.5px] font-mono w-56 h-28 overflow-y-auto">
                        <div className="text-cyan-400 font-bold uppercase border-b border-white/5 pb-1 flex justify-between">
                          <span>SYSTEM TELEM FEED</span>
                          <span className="animate-pulse">● LIVE</span>
                        </div>
                        {auditLog && auditLog.entries.slice(-3).reverse().map((entry, idx) => (
                          <div key={idx} className="border-b border-white/5 pb-1 last:border-0 last:pb-0 flex flex-col gap-0.5">
                            <div className="flex justify-between text-muted-foreground">
                              <span className="font-bold text-foreground uppercase">{entry.eventType}</span>
                              <span>{new Date(entry.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
                            </div>
                            <p className="truncate text-slate-350">{entry.detail}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* ponytail: custom zoom removed — Leaflet has native zoom/pan controls */}

                    {/* Map Legend Overlay (Bottom Right, next to zoom) */}
                    <div className="absolute bottom-16 right-20 z-20 hidden md:block">
                      <div className="bg-slate-950/85 border border-white/10 rounded-xl p-2.5 text-[8px] font-mono w-40 flex flex-col gap-1 shadow-lg text-slate-350">
                        <span className="text-cyan-400 font-bold uppercase text-[9px] border-b border-white/5 pb-0.5">MAP LEGEND</span>
                        <div className="flex items-center gap-1.5">
                          <div className="h-1.5 w-4 bg-orange-500 rounded animate-pulse" />
                          <span>ORR / Highway Network</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <div className="h-1.5 w-4 bg-cyan-400 rounded" />
                          <span>Traveled Route Trail</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <div className="h-1.5 w-4 bg-rose-500 rounded" />
                          <span>Immobilized Lock Trail</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px]">🔒</span>
                          <span>VCU Power Cut active</span>
                        </div>
                      </div>
                    </div>

                    {/* Dynamic Simulated Route Info box (Bottom Left, above Event Feed) */}
                    <div className="absolute bottom-44 left-4 z-20">
                      <div className="bg-slate-950/80 border border-white/10 rounded-xl p-2 flex flex-col gap-0.5 text-[9px] font-mono w-56 shadow-lg text-slate-300">
                        <div className="flex justify-between font-bold text-cyan-400 border-b border-white/5 pb-0.5 uppercase">
                          <span>ROUTE SIM METRICS</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Loop Focus:</span>
                          <span className="text-foreground font-semibold">Hyderabad Outer Loop</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Simulated Speed:</span>
                          <span className="text-foreground font-semibold">{activeTwinVehicle.immobilized ? 0 : 32} km/h</span>
                        </div>
                        <div className="flex justify-between">
                          <span>ETA to Station:</span>
                          <span className="text-cyan-400 font-semibold">{activeTwinVehicle.immobilized ? "N/A" : "12 min"}</span>
                        </div>
                      </div>
                    </div>

                    {/* Bottom grid roads explanation */}
                    <div className="bg-slate-950/70 border-t border-white/5 p-3 rounded-b-[20px] text-[10px] leading-relaxed text-muted-foreground font-mono">
                      <span>SECURE COMPLIANCE: Designed with reference to AIS-156 EV Battery Safety & UNECE R155 Security. Hyderabad City limits active. Click vehicle markers to focus.</span>
                    </div>

                  </div>

                </div>
              )}

              {/* ========================================== */}
              {/* TAB: DRIVER PANEL                         */}
              {/* ========================================== */}
              {activeTab === "driver" && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fadeIn">
                  <div className="lg:col-span-1 flex flex-col gap-6">
                    <div className="bg-slate-950/40 border border-white/5 rounded-[20px] p-5 shadow-xl flex flex-col gap-4">
                      <div className="border-b border-white/5 pb-2">
                        <h3 className="text-sm font-extrabold uppercase tracking-wider text-cyan-400">Driver Mobile App View</h3>
                        <p className="text-[10px] text-muted-foreground font-mono">Smartphone simulation perspective</p>
                      </div>

                      <div className="flex flex-col gap-4 text-xs font-mono">
                        <div className="flex flex-col gap-1.5">
                          <label className="text-muted-foreground font-semibold">Select Driver Account</label>
                          <select
                            value={driverVehicleId}
                            onChange={(e) => setDriverVehicleId(e.target.value)}
                            className="bg-slate-900 border border-white/10 rounded-xl px-3 py-2.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-cyan-500 font-mono w-full"
                          >
                            {vehicles.map(v => (
                              <option key={v.vehicleId} value={v.vehicleId}>
                                {v.driverName} ({v.vehicleId})
                              </option>
                            ))}
                          </select>
                        </div>

                        {driverViewData && (
                          <div className="flex flex-col gap-4 mt-2">
                            <div className={`p-5 rounded-xl border flex flex-col items-center justify-center gap-4 text-center ${
                              driverViewData.vehicle.immobilized 
                                ? "bg-rose-950/20 border-rose-500/20 cyber-glow-rose animate-pulse"
                                : "bg-emerald-950/20 border-emerald-500/20 cyber-glow-emerald"
                            }`}>
                              {driverViewData.vehicle.immobilized ? (
                                <>
                                  <div className="bg-rose-500/10 p-3 rounded-full border border-rose-500/20 text-rose-400">
                                    <Lock className="h-6 w-6" />
                                  </div>
                                  <div>
                                    <h4 className="text-sm font-black text-rose-400 uppercase tracking-wide">Drive Power Disabled</h4>
                                    <p className="text-[10px] text-muted-foreground leading-relaxed mt-1">
                                      Engine start sequence locked cryptographically. Safely parked.
                                    </p>
                                  </div>
                                </>
                              ) : (
                                <>
                                  <div className="bg-emerald-500/10 p-3 rounded-full border border-emerald-500/20 text-emerald-400">
                                    <Unlock className="h-6 w-6" />
                                  </div>
                                  <div>
                                    <h4 className="text-sm font-black text-emerald-400 uppercase tracking-wide">Drive Power Active</h4>
                                    <p className="text-[10px] text-muted-foreground leading-relaxed mt-1">
                                      Firmware trust keys matching. Safe operation enabled.
                                    </p>
                                  </div>
                                </>
                              )}
                            </div>

                            {driverViewData.vehicle.pendingCommand && (
                              <div className="bg-amber-950/30 border border-amber-500/20 p-3 rounded-xl flex items-start gap-2 text-[10px] text-amber-300 leading-relaxed">
                                <AlertTriangle className="h-4.5 w-4.5 shrink-0 text-amber-400 mt-0.5" />
                                <div>
                                  <span className="font-bold">IMMINENT IMMOBILIZATION PRE-WARNING:</span> A remote stop command has been authenticated. The lock is currently held because you are moving. **Safely park the vehicle immediately**. Once stopped, drive power will cut off automatically.
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="lg:col-span-2 flex flex-col gap-6">
                    <div className="bg-slate-950/40 border border-white/5 rounded-[20px] p-5 shadow-xl flex-1 flex flex-col">
                      <div className="flex items-center gap-2 border-b border-white/5 pb-2 mb-4">
                        <History className="h-4.5 w-4.5 text-muted-foreground" />
                        <h3 className="text-sm font-extrabold uppercase tracking-wider">Driver Notification Feed</h3>
                      </div>

                      {driverViewData && driverViewData.history.length === 0 ? (
                        <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground py-12">
                          <FileText className="h-8 w-8 opacity-25 mb-2 mx-auto" />
                          <span className="text-xs font-mono">No active notifications.</span>
                        </div>
                      ) : (
                        <div className="flex flex-col gap-4">
                          {driverViewData?.history.map((record) => (
                            <div 
                              key={record.command.commandId} 
                              className={`p-4 rounded-xl border flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all duration-300 ${
                                record.status === "EXECUTED" ? "bg-rose-950/10 border-rose-500/10" :
                                record.status === "HELD" ? "bg-amber-950/10 border-amber-500/10" :
                                "bg-slate-900/30 border-white/5"
                              }`}
                            >
                              <div className="flex-1 flex flex-col gap-1 font-mono text-xs">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className={`px-2 py-0.5 rounded text-[8px] font-extrabold border ${
                                    record.command.action === "IMMOBILIZE" ? "bg-rose-500/10 text-rose-400 border-rose-500/20" : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                                  }`}>
                                    {record.command.action}
                                  </span>
                                  <span className="text-[10px] text-muted-foreground">
                                    ID: {record.command.commandId.substring(0, 8)}...
                                  </span>
                                  <span className="text-[9px] text-muted-foreground">
                                    {new Date(record.command.issuedAt).toLocaleString()}
                                  </span>
                                </div>
                                <p className="font-medium text-foreground mt-1">
                                  Issuer Account: {record.command.issuerId} (TrustStore Authorized)
                                </p>
                                <p className="text-muted-foreground italic text-[11px] mt-0.5 leading-relaxed">
                                  &ldquo;{record.command.reasonText}&rdquo;
                                </p>

                                {record.disputed && (
                                  <div className="border-t border-dashed border-white/10 pt-2 mt-2 flex flex-col gap-0.5">
                                    <span className="text-[9px] font-bold text-amber-400 flex items-center gap-1 uppercase">
                                      <AlertTriangle className="h-3 w-3" />
                                      Objection Registered on Tamper-Evident Ledger
                                    </span>
                                    <p className="text-[11px] text-amber-200/90 italic leading-relaxed">
                                      &ldquo;{record.disputeText}&rdquo;
                                    </p>
                                  </div>
                                )}
                              </div>

                              {record.command.action === "IMMOBILIZE" && !record.disputed && record.status === "EXECUTED" && (
                                <button
                                  onClick={() => {
                                    setDisputingCommandId(record.command.commandId);
                                    setDisputeText("");
                                  }}
                                  className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-lg tracking-wide transition-colors shrink-0 text-xs font-mono self-end md:self-center"
                                >
                                  Dispute Block
                                </button>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <AnimatePresence>
                      {disputingCommandId && (
                        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                          <motion.div 
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-slate-950 border border-white/10 p-5 rounded-[20px] max-w-md w-full shadow-2xl flex flex-col gap-4 font-mono text-xs"
                          >
                            <div className="flex items-center gap-2 border-b border-white/5 pb-3 text-amber-500">
                              <AlertTriangle className="h-5 w-5" />
                              <h4 className="text-sm font-extrabold uppercase tracking-wide">File Remote Lock Objection</h4>
                            </div>
                            <p className="text-muted-foreground leading-relaxed text-[11px] font-sans">
                              Warning: Submitting a dispute logs an immutable objection on the audit chain ledger. You must provide justification or proof of payment.
                            </p>

                            <form onSubmit={handleDisputeSubmit} className="flex flex-col gap-3">
                              <div className="flex flex-col gap-1">
                                <span className="text-[9px] text-muted-foreground">TARGET TRANSACTION ID</span>
                                <input
                                  type="text"
                                  disabled
                                  value={disputingCommandId}
                                  className="bg-slate-900 border border-white/5 px-2 py-2 rounded text-[10px] text-muted-foreground"
                                />
                              </div>

                              <div className="flex flex-col gap-1.5">
                                <span className="text-[10px] text-muted-foreground font-semibold">Justification Explanation / UPI TXN reference</span>
                                <textarea
                                  required
                                  value={disputeText}
                                  onChange={(e) => setDisputeText(e.target.value)}
                                  rows={4}
                                  placeholder="UPI Txn ID: UPI28491829. Payment sent at 11:42. Check ledger deposit receipt."
                                  className="bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-amber-500 leading-relaxed text-foreground"
                                />
                              </div>

                              <div className="flex gap-2.5 justify-end mt-2">
                                <button
                                  type="button"
                                  onClick={() => setDisputingCommandId(null)}
                                  className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 border border-white/5 rounded-lg text-muted-foreground font-bold"
                                >
                                  Close
                                </button>
                                <button
                                  type="submit"
                                  disabled={disputeSubmitting}
                                  className="px-4 py-1.5 bg-amber-600 hover:bg-amber-500 text-white rounded-lg font-bold"
                                >
                                  {disputeSubmitting ? "Submitting..." : "Append Dispute block"}
                                </button>
                              </div>
                            </form>
                          </motion.div>
                        </div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              )}

              {/* ========================================== */}
              {/* TAB: AUDIT LEDGER                         */}
              {/* ========================================== */}
              {activeTab === "audit" && (
                <div className="flex flex-col gap-6 animate-fadeIn font-mono">
                  
                  <div className="bg-slate-950/40 border border-white/5 rounded-[20px] p-5 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                      <h3 className="text-sm font-extrabold uppercase tracking-wider text-cyan-400">Cryptographic Ledger Chain Console</h3>
                      <p className="text-xs text-muted-foreground mt-1 max-w-2xl font-mono">
                        Simulate database tampering and verify the chain integrity. Click **Tamper Mid-Entry** to mutate fields, and click **Simulate Corrective Reset** to append a corrective block bypassing the tampered index.
                      </p>
                    </div>

                    <div className="flex flex-col gap-1.5 shrink-0 items-end">
                      <div className="flex gap-3 text-xs font-mono font-bold">
                        <button
                          onClick={handleTamperAuditLog}
                          className="px-4 py-2.5 bg-rose-950/20 hover:bg-rose-950/40 border border-rose-500/20 text-rose-400 rounded-xl transition-all"
                        >
                          Tamper Mid-Entry
                        </button>
                        <button
                          onClick={handleRestoreAuditLog}
                          className="px-4 py-2.5 bg-emerald-950/20 hover:bg-emerald-950/40 border border-emerald-500/20 text-emerald-400 rounded-xl transition-all"
                        >
                          Simulate Corrective Reset (Demo Only)
                        </button>
                      </div>
                      <span className="text-[9px] text-amber-500 font-mono">*Demo-only simulation of a corrective chain recovery mechanism</span>
                    </div>
                  </div>

                  <div className="bg-slate-950/40 border border-white/5 rounded-[20px] p-5 shadow-xl flex flex-col">
                    <div className="flex items-center justify-between border-b border-white/5 pb-3 mb-6">
                      <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground font-mono">Hash blocks timeline ledger</span>
                      <span className="text-xs font-mono">
                        Ledger Integrity Status: 
                        <span className={`font-bold ml-1.5 ${ledgerHealthy ? "text-emerald-400" : "text-rose-400 animate-pulse font-extrabold"}`}>
                          {ledgerHealthy ? "Healthy" : "INTEGRITY FAULT / BREACH DETECTED"}
                        </span>
                      </span>
                    </div>

                    {auditLog && auditLog.entries.length === 0 ? (
                      <div className="text-center text-muted-foreground py-12">
                        <Database className="h-8 w-8 opacity-25 mb-2 mx-auto" />
                        <span className="text-xs font-mono">Ledger is empty.</span>
                      </div>
                    ) : (
                      <div className="relative flex flex-col gap-6 pl-6 border-l border-white/5">
                        {[...(auditLog?.entries || [])].reverse().map((entry, index, arr) => {
                          const absoluteIndex = arr.length - 1 - index;
                          const isBroken = auditLog && auditLog.firstBrokenIndex !== null && absoluteIndex >= auditLog.firstBrokenIndex;
                          
                          return (
                            <motion.div 
                              key={entry.entryId} 
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: index * 0.05 }}
                              className="relative group"
                            >
                              {/* GLOWING CONNECTOR CABLES */}
                              <div className={`absolute -left-[31px] top-1.5 h-3.5 w-3.5 rounded-full border-2 transition-all duration-300 ${
                                !entry.valid || !entry.linkIntact
                                  ? "bg-rose-500 border-rose-400 shadow-[0_0_10px_rgba(239,68,68,0.5)] animate-ping" 
                                  : isBroken 
                                  ? "bg-rose-950 border-rose-700"
                                  : "bg-emerald-500 border-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.3)]"
                              }`} />

                              <div className={`border rounded-xl p-4 transition-all duration-300 bg-slate-900/40 backdrop-blur-md ${
                                !entry.valid || !entry.linkIntact
                                  ? "border-rose-500/40 cyber-glow-rose" 
                                  : isBroken 
                                  ? "border-rose-950/20 opacity-70"
                                  : "border-white/5 hover:border-cyan-500/20"
                              }`}>
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 border-b border-white/5 pb-2 mb-2 font-mono text-[10px]">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <span className={`px-2 py-0.5 rounded text-[8px] font-bold tracking-wider ${
                                      entry.eventType === "REJECTED" ? "bg-rose-950/60 text-rose-400 border border-rose-500/20" :
                                      entry.eventType === "EXECUTED" || entry.eventType === "ACKNOWLEDGED" ? "bg-emerald-950/60 text-emerald-400 border border-emerald-500/20" :
                                      entry.eventType === "HELD" || entry.eventType === "DISPUTED" ? "bg-amber-950/60 text-amber-400 border border-amber-500/20" :
                                      "bg-cyan-950/60 text-cyan-400 border border-cyan-500/20"
                                    }`}>
                                      {entry.eventType}
                                    </span>
                                    <span className="text-muted-foreground">Block ID: {entry.entryId.substring(0, 8)}...</span>
                                    <span className="text-muted-foreground">Cmd ID: {entry.commandId.substring(0, 8)}...</span>
                                  </div>
                                  <span className="text-muted-foreground">
                                    {new Date(entry.timestamp).toLocaleString()}
                                  </span>
                                </div>

                                <p className={`text-xs font-semibold leading-relaxed mb-3 ${
                                  !entry.valid || !entry.linkIntact ? "text-rose-400 font-bold bg-rose-950/10 p-2 rounded border border-rose-500/20" : "text-foreground"
                                }`}>
                                  {entry.detail}
                                </p>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2.5 border-t border-white/5 font-mono text-[8.5px] text-muted-foreground">
                                  <div className="flex flex-col gap-0.5">
                                    <span className="uppercase text-[8px] tracking-wider font-semibold">PREVIOUS BLOCK HASH</span>
                                    <span className="text-foreground/80 truncate select-all">{entry.previousEntryHash}</span>
                                  </div>
                                  <div className="flex flex-col gap-0.5">
                                    <span className="uppercase text-[8px] tracking-wider font-semibold flex items-center gap-1">
                                      STORED ENTRY HASH
                                      {(!entry.valid || !entry.linkIntact) && (
                                        <span className="text-rose-400 font-bold bg-rose-950/40 px-1 rounded border border-rose-500/20 text-[7.5px]">
                                          SIGN INTEGRITY FAILURE
                                        </span>
                                      )}
                                    </span>
                                    <span className={`truncate select-all ${!entry.valid ? "text-rose-400 font-bold bg-rose-950/20 px-1 rounded border border-rose-500/10" : "text-foreground/80"}`}>
                                      {entry.entryHash}
                                    </span>
                                  </div>
                                </div>
                              </div>

                            </motion.div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* ========================================== */}
              {/* TAB: ARCHITECTURE DIAGRAM                 */}
              {/* ========================================== */}
              {activeTab === "architecture" && (
                <div className="bg-slate-950/40 border border-white/5 rounded-[20px] p-5 shadow-xl flex flex-col gap-6 animate-fadeIn font-mono">
                  <div className="border-b border-white/5 pb-2">
                    <h3 className="text-sm font-extrabold uppercase tracking-wider text-cyan-400">Interactive Architecture Diagram</h3>
                    <p className="text-xs text-muted-foreground mt-0.5 font-mono">Cryptographic verification protocol layers</p>
                  </div>

                  <div className="flex flex-col gap-4 font-mono text-xs max-w-3xl mx-auto w-full py-4 relative">
                    
                    {/* Layer 1 */}
                    <div className="flex items-center gap-4 bg-slate-900 border border-white/5 p-4 rounded-xl relative z-10 shadow-lg">
                      <div className="h-10 w-10 bg-cyan-500/10 text-cyan-400 rounded-full border border-cyan-500/20 flex items-center justify-center shrink-0 font-extrabold">
                        1
                      </div>
                      <div className="flex-1">
                        <h4 className="font-extrabold text-foreground uppercase tracking-wider text-xs">Financier Layer (Simulated HSM)</h4>
                        <p className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed">
                          Financier creates an immobilization payload. Payload is signed with ECDSA P-256 keys by a simulated HSM module (`secureElement.ts`). The private key never leaves the module boundary.
                        </p>
                      </div>
                    </div>

                    {/* ANIMATED PACKET CONNECTOR 1 */}
                    <div className="h-12 w-0.5 bg-slate-800 ml-9 relative overflow-hidden">
                      <motion.div 
                        animate={{ y: ["0%", "2400%"] }}
                        transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                        className="w-full h-1 bg-cyan-400 shadow-[0_0_8px_#22d3ee] rounded-full"
                      />
                    </div>

                    {/* Layer 2 */}
                    <div className="flex items-center gap-4 bg-slate-900 border border-white/5 p-4 rounded-xl relative z-10 shadow-lg">
                      <div className="h-10 w-10 bg-cyan-500/10 text-cyan-400 rounded-full border border-cyan-500/20 flex items-center justify-center shrink-0 font-extrabold">
                        2
                      </div>
                      <div className="flex-1">
                        <h4 className="font-extrabold text-foreground uppercase tracking-wider text-xs">Relay Backend Server</h4>
                        <p className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed">
                          The Node/Express backend (`server.ts`) receives the signed command and relays it verbatim to the vehicle. It has **no authority** to sign or modify the payload. Modifying any fields breaks verifications.
                        </p>
                      </div>
                    </div>

                    {/* ANIMATED PACKET CONNECTOR 2 */}
                    <div className="h-12 w-0.5 bg-slate-800 ml-9 relative overflow-hidden">
                      <motion.div 
                        animate={{ y: ["0%", "2400%"] }}
                        transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                        className="w-full h-1 bg-cyan-400 shadow-[0_0_8px_#22d3ee] rounded-full"
                      />
                    </div>

                    {/* Layer 3 */}
                    <div className="flex items-center gap-4 bg-slate-900 border border-white/5 p-4 rounded-xl relative z-10 shadow-lg">
                      <div className="h-10 w-10 bg-cyan-500/10 text-cyan-400 rounded-full border border-cyan-500/20 flex items-center justify-center shrink-0 font-extrabold">
                        3
                      </div>
                      <div className="flex-1">
                        <h4 className="font-extrabold text-foreground uppercase tracking-wider text-xs">On-Vehicle ECU Verifier</h4>
                        <p className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed">
                          Vehicle ECU firmware (`verifier.ts`) validates the command locally using five sequential checks in strict order: Signature &rarr; Expiry &rarr; Replay protection &rarr; Chain anchoring &rarr; Speed interlock check.
                        </p>
                      </div>
                    </div>

                    {/* ANIMATED PACKET CONNECTOR 3 */}
                    <div className="h-12 w-0.5 bg-slate-850 ml-9 relative overflow-hidden">
                      <motion.div 
                        animate={{ y: ["0%", "2400%"] }}
                        transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                        className="w-full h-1 bg-cyan-400 shadow-[0_0_8px_#22d3ee] rounded-full"
                      />
                    </div>

                    {/* Layer 4 */}
                    <div className="flex items-center gap-4 bg-slate-900 border border-white/5 p-4 rounded-xl relative z-10 shadow-lg">
                      <div className="h-10 w-10 bg-cyan-500/10 text-cyan-400 rounded-full border border-cyan-500/20 flex items-center justify-center shrink-0 font-extrabold">
                        4
                      </div>
                      <div className="flex-1">
                        <h4 className="font-extrabold text-foreground uppercase tracking-wider text-xs">Audit ledger chains</h4>
                        <p className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed">
                          Every dispatch, hold, execution, or dispute is written to a SHA-256 hash-chained log. Mutating any row in the DB breaks every subsequent hash block link in the console.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ========================================== */}
              {/* TAB: ANALYTICS                            */}
              {/* ========================================== */}
              {activeTab === "analytics" && (
                <div className="flex flex-col gap-6 animate-fadeIn">
                  
                  <div className="bg-slate-950/40 border border-white/5 rounded-[20px] p-5 shadow-xl flex flex-col gap-4">
                    <div className="border-b border-white/5 pb-2">
                      <h3 className="text-sm font-extrabold uppercase tracking-wider text-cyan-400">Security Telemetry Analytics</h3>
                      <p className="text-xs text-muted-foreground mt-0.5 font-mono">Real-time threat vectors mapping</p>
                    </div>

                    <div className="flex flex-col gap-4 mt-2 font-mono">
                      <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                        Threat Blocks and Incidents Distribution
                      </span>

                      {/* Custom SVG responsive graph layout */}
                      <div className="w-full bg-slate-950 border border-white/5 p-4 rounded-xl relative h-64 flex items-end justify-between text-[9px] gap-2 pt-8">
                        <div className="absolute top-3 left-4 flex gap-4 text-xs font-semibold font-sans">
                          <div className="flex items-center gap-1.5">
                            <span className="h-2 w-2 rounded-full bg-cyan-500" />
                            <span>Sign Failures: {totalThreatsBlocked}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <span className="h-2 w-2 rounded-full bg-amber-500" />
                            <span>Deferred holds: {pendingRequestsCount}</span>
                          </div>
                        </div>

                        {/* Animated SVG bars */}
                        <div className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
                          <motion.div 
                            initial={{ height: 0 }}
                            animate={{ height: `${Math.max(15, totalThreatsBlocked * 15)}%` }}
                            transition={{ duration: 0.5, ease: "easeOut" }}
                            className="w-full max-w-[40px] bg-cyan-500 rounded-t-md shadow-[0_0_10px_rgba(6,182,212,0.3)]"
                          />
                          <span>SIGN BLOCKS</span>
                        </div>
                        <div className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
                          <motion.div 
                            initial={{ height: 0 }}
                            animate={{ height: `${Math.max(15, pendingRequestsCount * 25)}%` }}
                            transition={{ duration: 0.5, ease: "easeOut" }}
                            className="w-full max-w-[40px] bg-amber-500 rounded-t-md shadow-[0_0_10px_rgba(245,158,11,0.3)]"
                          />
                          <span>HELD QUEUES</span>
                        </div>
                        <div className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
                          <motion.div 
                            initial={{ height: 0 }}
                            animate={{ height: `${Math.max(15, totalLogsCount * 3)}%` }}
                            transition={{ duration: 0.5, ease: "easeOut" }}
                            className="w-full max-w-[40px] bg-emerald-500 rounded-t-md shadow-[0_0_10px_rgba(16,185,129,0.3)]"
                          />
                          <span>LEDGER BLOCKS</span>
                        </div>
                        <div className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
                          <motion.div 
                            initial={{ height: 0 }}
                            animate={{ height: `${Math.max(15, immobilizedCount * 30)}%` }}
                            transition={{ duration: 0.5, ease: "easeOut" }}
                            className="w-full max-w-[40px] bg-rose-500 rounded-t-md shadow-[0_0_10px_rgba(244,63,94,0.3)] animate-pulse"
                          />
                          <span>ACTIVE LOCKS</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ========================================== */}
              {/* TAB: IMPACT & MARKET                       */}
              {/* ========================================== */}
              {activeTab === "market" && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fadeIn font-mono text-xs">
                  {/* Left Column: Problem and Vulnerability */}
                  <div className="lg:col-span-1 flex flex-col gap-6">
                    <motion.div 
                      whileHover={{ y: -2 }}
                      className="bg-slate-950/40 border border-white/5 rounded-[20px] p-5 shadow-xl flex flex-col gap-4"
                    >
                      <div className="border-b border-white/5 pb-2 text-cyan-400 flex items-center gap-2">
                        <AlertTriangle className="h-4.5 w-4.5" />
                        <h3 className="text-sm font-extrabold uppercase tracking-wider">The Vulnerability</h3>
                      </div>
                      
                      <div className="flex flex-col gap-3 leading-relaxed text-muted-foreground text-[11px] font-sans">
                        <span className="text-foreground font-bold font-mono">Unauthenticated Local BLE Sweeps</span>
                        <p>
                          Many electric rickshaw battery management systems (BMS) are vulnerable to local unauthenticated configuration scans. Anyone within range can send raw override codes to cut power mid-ride.
                        </p>
                        <span className="text-foreground font-bold mt-2 font-mono">Why existing fixes fail:</span>
                        <ul className="list-disc pl-4 flex flex-col gap-1.5">
                          <li>Backend servers assume authorization unilaterally, allowing database compromises to disable entire fleets.</li>
                          <li>No speed safety telemetry checks at the vehicle ECU layer before cutting power.</li>
                          <li>No tamper-proof trail for disputing immobilization operations.</li>
                        </ul>
                      </div>
                    </motion.div>

                    <motion.div 
                      whileHover={{ y: -2 }}
                      className="bg-slate-950/40 border border-white/5 rounded-[20px] p-5 shadow-xl flex flex-col gap-4"
                    >
                      <div className="border-b border-white/5 pb-2 text-cyan-400 flex items-center gap-2">
                        <Briefcase className="h-4.5 w-4.5" />
                        <h3 className="text-sm font-extrabold uppercase tracking-wider">Business Model</h3>
                      </div>
                      
                      <div className="flex flex-col gap-3 leading-relaxed text-muted-foreground text-[11px] font-sans">
                        <div className="flex justify-between border-b border-white/5 pb-2">
                          <span className="text-foreground font-bold font-mono">Firmware Licensing:</span>
                          <span className="text-emerald-400 font-bold font-mono">Per-vehicle SaaS</span>
                        </div>
                        <p>Monetized via per-vehicle SaaS licensing fee to OEMs to embed our verifier engine in battery microcontrollers.</p>
                        
                        <div className="flex justify-between border-b border-white/5 pb-2 mt-2">
                          <span className="text-foreground font-bold font-mono">Audit Ledger APIs:</span>
                          <span className="text-emerald-400 font-bold font-mono">Transactional</span>
                        </div>
                        <p>Usage-based API monetization for fleet managers, NBFCs, and insurers query trails.</p>
                      </div>
                    </motion.div>
                  </div>

                  {/* Middle Column: Target Customers & Business Value */}
                  <div className="lg:col-span-1 flex flex-col gap-6">
                    <motion.div 
                      whileHover={{ y: -2 }}
                      className="bg-slate-950/40 border border-white/5 rounded-[20px] p-5 shadow-xl flex flex-col gap-4"
                    >
                      <div className="border-b border-white/5 pb-2 text-cyan-400 flex items-center gap-2">
                        <Target className="h-4.5 w-4.5" />
                        <h3 className="text-sm font-extrabold uppercase tracking-wider">Target Customers</h3>
                      </div>
                      
                      <div className="flex flex-col gap-2.5 text-[11px] leading-relaxed text-muted-foreground font-sans">
                        <div className="bg-white/5 p-3 rounded-lg border border-white/5">
                          <span className="text-foreground font-bold uppercase text-[9px] block font-mono">1. NBFCs & Financiers</span>
                          <p className="mt-1">Reduces delinquency defaults via safe remote immobilization loops, providing tamper-proof legal evidence.</p>
                        </div>
                        <div className="bg-white/5 p-3 rounded-lg border border-white/5">
                          <span className="text-foreground font-bold uppercase text-[9px] block font-mono">2. OEMs (EV Manufacturers)</span>
                          <p className="mt-1">Pre-integrates motion-safe verifier firmware into standard battery pack microcontrollers.</p>
                        </div>
                        <div className="bg-white/5 p-3 rounded-lg border border-white/5">
                          <span className="text-foreground font-bold uppercase text-[9px] block font-mono">3. Fleet Operators & Logistics</span>
                          <p className="mt-1">Secures logistics hubs against unauthorized rogue overrides and tracks vehicle status.</p>
                        </div>
                      </div>
                    </motion.div>

                    <motion.div 
                      whileHover={{ y: -2 }}
                      className="bg-slate-950/40 border border-white/5 rounded-[20px] p-5 shadow-xl flex flex-col gap-4"
                    >
                      <div className="border-b border-white/5 pb-2 text-cyan-400 flex items-center gap-2">
                        <Sparkles className="h-4.5 w-4.5" />
                        <h3 className="text-sm font-extrabold uppercase tracking-wider">Business Value</h3>
                      </div>
                      
                      <div className="flex flex-col gap-2.5 text-[11px] leading-relaxed text-muted-foreground font-sans">
                        <ul className="list-disc pl-4 flex flex-col gap-2">
                          <li><span className="text-foreground font-bold font-mono">Safer remote immobilization:</span> Eliminates dangerous mid-ride power cuts.</li>
                          <li><span className="text-foreground font-bold font-mono">Reduced legal disputes:</span> Hash chains secure driver-payment accountability.</li>
                          <li><span className="text-foreground font-bold font-mono">Better compliance:</span> Fits local regional transportation policies.</li>
                        </ul>
                      </div>
                    </motion.div>
                  </div>

                  {/* Right Column: Designed With Reference To & Roadmap */}
                  <div className="lg:col-span-1 flex flex-col gap-6">
                    <motion.div 
                      whileHover={{ y: -2 }}
                      className="bg-slate-950/40 border border-white/5 rounded-[20px] p-5 shadow-xl flex flex-col gap-4"
                    >
                      <div className="border-b border-white/5 pb-2 text-cyan-400 flex items-center gap-2">
                        <FileCheck2 className="h-4.5 w-4.5" />
                        <h3 className="text-sm font-extrabold uppercase tracking-wider">Designed with reference to:</h3>
                      </div>
                      
                      <div className="flex flex-col gap-2.5 text-[11px] font-mono text-muted-foreground">
                        <div className="flex justify-between border-b border-white/5 pb-1">
                          <span className="text-foreground font-bold">AIS-156</span>
                          <span>Indian battery safety requirements</span>
                        </div>
                        <div className="flex justify-between border-b border-white/5 pb-1">
                          <span className="text-foreground font-bold">ISO 26262</span>
                          <span>ASIL-D functional safety</span>
                        </div>
                        <div className="flex justify-between border-b border-white/5 pb-1">
                          <span className="text-foreground font-bold">UNECE R155</span>
                          <span>Vehicle cyber security management</span>
                        </div>
                        <div className="flex justify-between border-b border-white/5 pb-1">
                          <span className="text-foreground font-bold">ISO/SAE 21434</span>
                          <span>Automotive cyber security engineering</span>
                        </div>
                        <span className="text-[9px] text-muted-foreground mt-1 leading-relaxed block border-t border-white/5 pt-2 font-sans">
                          *NOTE: System is designed with reference to these safety and security frameworks. No official hardware certifications are claimed for this simulated software prototype.
                        </span>
                      </div>
                    </motion.div>

                    <motion.div 
                      whileHover={{ y: -2 }}
                      className="bg-slate-950/40 border border-white/5 rounded-[20px] p-5 shadow-xl flex flex-col gap-4"
                    >
                      <div className="border-b border-white/5 pb-2 text-cyan-400 flex items-center gap-2">
                        <Layers className="h-4.5 w-4.5" />
                        <h3 className="text-sm font-extrabold uppercase tracking-wider">Future Roadmap</h3>
                      </div>
                      
                      <div className="flex flex-col gap-2.5 text-[11px] text-muted-foreground leading-relaxed font-sans">
                        <div className="flex items-start gap-2">
                          <span className="px-1.5 bg-cyan-950 text-cyan-400 border border-cyan-500/20 text-[8px] font-bold rounded font-mono">PHASE A</span>
                          <span>Hardware PKCS#11 Secure Element validation anchors.</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <span className="px-1.5 bg-cyan-950 text-cyan-400 border border-cyan-500/20 text-[8px] font-bold rounded font-mono">PHASE B</span>
                          <span>Multi-party multisig thresholds for NBFC command dispatches.</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <span className="px-1.5 bg-cyan-950 text-cyan-400 border border-cyan-500/20 text-[8px] font-bold rounded font-mono">PHASE C</span>
                          <span>Cellular CAN bus dongles for legacy fleet retrofits.</span>
                        </div>
                      </div>
                    </motion.div>
                  </div>
                </div>
              )}

              {/* ========================================== */}
              {/* TAB: SETTINGS                             */}
              {/* ========================================== */}
              {activeTab === "settings" && (
                <div className="bg-slate-950/40 border border-white/5 rounded-[20px] p-5 shadow-xl flex flex-col gap-6 animate-fadeIn font-mono">
                  <div className="border-b border-white/5 pb-2 font-mono">
                    <h3 className="text-sm font-extrabold uppercase tracking-wider text-cyan-400">Governed Control Settings</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">Manage simulated HSM keys and ECU trust stores</p>
                  </div>

                  <div className="flex flex-col gap-6 max-w-xl w-full text-xs font-mono">
                    <div className="flex flex-col gap-3">
                      <span className="font-bold uppercase tracking-wider text-muted-foreground text-[10px]">Autoplay Simulation speed</span>
                      <div className="flex flex-col gap-2 bg-slate-950/80 p-4 rounded-xl border border-white/5">
                        <div className="flex justify-between items-center">
                          <span>Delay between steps:</span>
                          <select 
                            value={demoSpeed} 
                            onChange={(e) => setDemoSpeed(Number(e.target.value))}
                            className="bg-slate-900 border border-white/10 rounded px-2.5 py-1 text-xs text-foreground focus:outline-none"
                          >
                            <option value={800}>Fast (800ms)</option>
                            <option value={1200}>Normal (1200ms)</option>
                            <option value={2000}>Slow (2000ms)</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col gap-3">
                      <span className="font-bold uppercase tracking-wider text-muted-foreground text-[10px]">ECU firmware initialization reset</span>
                      <p className="text-[11px] text-muted-foreground leading-relaxed font-sans">
                        To run the demo again with clean values, click the button below to purge all command history blocks and re-provision Simulated HSM slot keys.
                      </p>
                      <button
                        onClick={handleResetSystem}
                        className="px-4 py-2.5 bg-secondary hover:bg-accent border border-white/15 text-foreground hover:text-cyan-400 font-bold rounded-xl transition-all self-start"
                      >
                        Reset Ledger and Keys
                      </button>
                    </div>
                  </div>
                </div>
              )}

            </div>
          </main>
        </div>
      )}

      {/* Floating alert toasts container */}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-xs w-full">
        {systemAlerts.map(alert => (
          <div 
            key={alert.id} 
            className={`p-3.5 rounded-xl border shadow-2xl flex items-start gap-2.5 text-xs font-semibold font-mono animate-slideIn ${
              alert.type === "success" ? "bg-emerald-950 border-emerald-500/30 text-emerald-300 cyber-glow-emerald" :
              alert.type === "warning" ? "bg-amber-950 border-amber-500/30 text-amber-300 cyber-glow-amber" :
              alert.type === "danger" ? "bg-rose-950 border-rose-500/30 text-rose-300 cyber-glow-rose" :
              "bg-slate-900 border-white/10 text-cyan-300 cyber-glow-cyan"
            }`}
          >
            {alert.type === "success" && <ShieldCheck className="h-4.5 w-4.5 text-emerald-400 mt-0.5 shrink-0" />}
            {alert.type === "warning" && <AlertTriangle className="h-4.5 w-4.5 text-amber-400 mt-0.5 shrink-0" />}
            {alert.type === "danger" && <ShieldAlert className="h-4.5 w-4.5 text-rose-400 mt-0.5 shrink-0" />}
            {alert.type === "info" && <Shield className="h-4.5 w-4.5 text-cyan-400 mt-0.5 shrink-0" />}
            <span className="leading-relaxed">{alert.msg}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
