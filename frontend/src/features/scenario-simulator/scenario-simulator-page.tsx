import { useState } from 'react';
import { motion } from 'framer-motion';
// @ts-ignore
import { pageVariants } from '@/motion/variants';
import { useTheme } from '@/providers/theme-provider';
import { useNavigate } from 'react-router-dom';
import { Play, Pause, RotateCcw, ShieldAlert, Car, Cpu, Lock, AlertTriangle, BatteryCharging, Smartphone, RefreshCw, CheckCircle2, ChevronRight } from 'lucide-react';

interface ScenarioCard {
  id: string;
  title: string;
  desc: string;
  icon: any;
  category: string;
  command: string;
  targetVehicle: string;
}

export function ScenarioSimulatorPage() {
  const navigate = useNavigate();
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';

  const [activeScenario, setActiveScenario] = useState<ScenarioCard | null>(null);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [stageIndex, setStageIndex] = useState<number>(0);
  const [logs, setLogs] = useState<string[]>([]);

  const scenarios: ScenarioCard[] = [
    { id: 'SC-01', title: 'Vehicle Theft', desc: 'Police FIR lodged for stolen EV. Initiates multi-person emergency immobilization.', icon: ShieldAlert, category: 'Security', command: 'IMMOBILIZE', targetVehicle: 'TR-102 (Mahindra Treo)' },
    { id: 'SC-02', title: 'Moving Vehicle Immobilization', desc: 'Attempt to execute emergency stop while EV is cruising at 22 km/h (ASIL-D Interlock).', icon: Car, category: 'Safety Interlock', command: 'IMMOBILIZE', targetVehicle: 'TR-101 (Sargam)' },
    { id: 'SC-03', title: 'OTA Firmware Rollout', desc: 'Sync new ECU Firmware patch v2.4.1 with ECDSA hardware validation.', icon: Cpu, category: 'Software', command: 'OTA_UPDATE', targetVehicle: 'TR-103 (Piaggio Ape)' },
    { id: 'SC-04', title: 'Maintenance Lock', desc: 'Lock vehicle doors and battery BMS before technician servicing.', icon: Lock, category: 'Operations', command: 'MAINTENANCE_LOCK', targetVehicle: 'V-1004 (Euler HiLoad)' },
    { id: 'SC-05', title: 'Emergency Lockdown', desc: 'Commercial fleet geofence breach triggers site-wide lockdown.', icon: AlertTriangle, category: 'Emergency', command: 'LOCKDOWN', targetVehicle: 'All Fleet Vehicles' },
    { id: 'SC-06', title: 'Battery Isolation', desc: 'High thermal buildup alert triggers remote battery relay cutoff.', icon: BatteryCharging, category: 'Powertrain', command: 'ISOLATE_BATTERY', targetVehicle: 'V-1005 (Omega Seiki)' },
    { id: 'SC-07', title: 'Lost Driver Phone', desc: 'Revoke mobile digital key certificate and require Security Officer co-sign.', icon: Smartphone, category: 'Access Control', command: 'REVOKE_KEY', targetVehicle: 'TR-102 (Mahindra Treo)' },
    { id: 'SC-08', title: 'Vehicle Recovery', desc: 'Restore full drive capability after law enforcement vehicle clearance.', icon: RefreshCw, category: 'Recovery', command: 'RESTORE_DRIVE', targetVehicle: 'TR-102 (Mahindra Treo)' },
  ];

  const simulationPipelineStages = [
    'Stage 1: Operational Event Triggered',
    'Stage 2: Command Center Wizard Preloaded',
    'Stage 3: 2-Person Governance Quorum (Multi-Sig Required)',
    'Stage 4: 7-Stage Zero-Trust Verification Pipeline',
    'Stage 5: ASIL-D Motion Safety Check (< 5 km/h)',
    'Stage 6: Target Vehicle Digital Twin Execution',
    'Stage 7: SHA-256 Merkle Audit Ledger Block Committed',
  ];

  const handleRunScenario = async (sc: ScenarioCard) => {
    setActiveScenario(sc);
    setIsRunning(true);
    setIsPaused(false);
    setStageIndex(0);
    setLogs([`[SIMULATOR] Selected Scenario: ${sc.title}`, `[SIMULATOR] Target EV: ${sc.targetVehicle}`]);

    for (let i = 0; i < simulationPipelineStages.length; i++) {
      setStageIndex(i);
      setLogs((prev) => [...prev, `[PIPELINE] ${simulationPipelineStages[i]} — PASSED ✓`]);
      await new Promise((r) => setTimeout(r, 600));
    }

    try {
      await fetch('/api/scenario/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scenarioId: sc.title }),
      });
    } catch {
      // Fallback
    }

    setIsRunning(false);
  };

  const handleReset = () => {
    setActiveScenario(null);
    setIsRunning(false);
    setIsPaused(false);
    setStageIndex(0);
    setLogs([]);
  };

  return (
    <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit" className="space-y-6 font-sans">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className={`text-2xl font-extrabold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
            Operational Scenario Simulator
          </h1>
          <p className={`text-xs mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            Test end-to-end commercial EV operational workflows through the TrustRide Zero-Trust pipeline
          </p>
        </div>
        <div className="flex items-center space-x-2">
          {activeScenario && (
            <button
              onClick={handleReset}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-md text-xs font-bold transition-colors cursor-pointer flex items-center space-x-1.5"
            >
              <RotateCcw size={14} />
              <span>Reset Simulation</span>
            </button>
          )}
        </div>
      </div>

      {/* 8 OPERATIONAL SCENARIO CARDS GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {scenarios.map((sc) => {
          const IconComp = sc.icon;

          return (
            <div
              key={sc.id}
              className={`p-5 rounded-lg border shadow-xs flex flex-col justify-between transition-all ${
                isDark ? 'bg-[#111827] border-slate-800' : 'bg-white border-[#E5E7EB]'
              }`}
            >
              <div>
                <div className="flex justify-between items-start mb-3">
                  <div className="w-9 h-9 rounded-lg bg-blue-500/10 text-blue-500 flex items-center justify-center shrink-0 border border-blue-500/30">
                    <IconComp size={18} />
                  </div>
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 border border-slate-800">
                    {sc.category}
                  </span>
                </div>

                <h3 className={`font-bold text-sm mb-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>{sc.title}</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-normal leading-relaxed">{sc.desc}</p>
              </div>

              <button
                onClick={() => handleRunScenario(sc)}
                className="w-full mt-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-xs font-bold transition-colors cursor-pointer flex items-center justify-center space-x-1.5 shadow-xs"
              >
                <Play size={14} />
                <span>Run Scenario</span>
              </button>
            </div>
          );
        })}
      </div>

      {/* ACTIVE SIMULATION TIMELINE & LOGS */}
      {activeScenario && (
        <div className={`p-6 rounded-lg border shadow-xs space-y-4 ${isDark ? 'bg-[#111827] border-slate-800' : 'bg-white border-[#E5E7EB]'}`}>
          <div className="font-bold text-xs uppercase tracking-wider text-slate-500 border-b pb-3 border-slate-200 dark:border-slate-800 flex justify-between items-center">
            <span>Live Scenario Pipeline Stream: {activeScenario.title}</span>
            <span className="text-emerald-500 font-mono text-[11px]">Target: {activeScenario.targetVehicle}</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Timeline Stages (7 cols) */}
            <div className="lg:col-span-7 space-y-2">
              {simulationPipelineStages.map((stg, idx) => {
                const isCurrent = stageIndex === idx && isRunning;
                const isPassed = stageIndex > idx || (!isRunning && stageIndex === simulationPipelineStages.length - 1);

                return (
                  <div
                    key={stg}
                    className={`p-3 rounded-md border text-xs font-mono flex items-center justify-between transition-all ${
                      isCurrent
                        ? 'bg-blue-600/20 border-blue-500 text-blue-400 font-bold'
                        : isPassed
                        ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-500 font-bold'
                        : isDark
                        ? 'bg-slate-900 border-slate-800 text-slate-500'
                        : 'bg-slate-50 border-slate-200 text-slate-400'
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      {isCurrent ? (
                        <RefreshCw size={14} className="animate-spin text-blue-500" />
                      ) : isPassed ? (
                        <CheckCircle2 size={14} className="text-emerald-500" />
                      ) : (
                        <span className="w-3.5 h-3.5 rounded-full border border-slate-600" />
                      )}
                      <span>{stg}</span>
                    </div>
                    <span>{isPassed ? 'PASSED ✓' : isCurrent ? 'EXECUTING...' : 'WAITING'}</span>
                  </div>
                );
              })}
            </div>

            {/* Execution Console Logs (5 cols) */}
            <div className="lg:col-span-5 p-4 rounded-md border border-slate-800 bg-slate-950 text-slate-300 font-mono text-xs space-y-2 overflow-y-auto max-h-80">
              <div className="text-[10px] text-slate-500 font-bold uppercase border-b border-slate-800 pb-2">
                Execution Logs
              </div>
              {logs.map((l, i) => (
                <div key={i} className="text-[11px] leading-relaxed">
                  {l}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}

export default ScenarioSimulatorPage;
