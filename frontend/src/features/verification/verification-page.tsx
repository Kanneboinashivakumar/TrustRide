import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
// @ts-ignore
import { pageVariants } from '@/motion/variants';
import { useTheme } from '@/providers/theme-provider';
import {
  CheckCircle2,
  Shield,
  Fingerprint,
  Lock,
  FileCheck,
  RefreshCw,
  Activity,
  Cpu,
  Clock,
  Radio,
  Key,
  X,
  ChevronRight,
  ShieldCheck,
  Zap
} from 'lucide-react';

interface StageDetail {
  id: number;
  name: string;
  shortName: string;
  icon: any;
  input: string;
  validation: string;
  result: string;
  time: string;
  hash: string;
  signature: string;
  certificate: string;
  reason: string;
}

import { useSearchParams, useNavigate } from 'react-router-dom';

export function VerificationPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const rawId = searchParams.get('id');
  const actionParam = searchParams.get('action');
  const vehicleIdParam = searchParams.get('vehicleId');
  const hasActiveWorkflow = Boolean(rawId || actionParam);

  const commandId = rawId || 'APP-1004';
  const currentAction = actionParam || 'IMMOBILIZE';
  const currentVehicleId = vehicleIdParam || 'TR-101';

  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';

  const [activeEvaluatedStage, setActiveEvaluatedStage] = useState<number>(hasActiveWorkflow ? 1 : 7);
  const [isEvaluating, setIsEvaluating] = useState<boolean>(hasActiveWorkflow);
  const [selectedStage, setSelectedStage] = useState<StageDetail | null>(null);

  useEffect(() => {
    if (!hasActiveWorkflow) {
      setIsEvaluating(false);
      setActiveEvaluatedStage(7);
      return;
    }

    setIsEvaluating(true);
    setActiveEvaluatedStage(1);
    let navTimer: any;
    const interval = setInterval(() => {
      setActiveEvaluatedStage((prev) => {
        if (prev >= 7) {
          clearInterval(interval);
          setIsEvaluating(false);
          navTimer = setTimeout(() => {
            navigate(`/app/digital-twin?vehicleId=${currentVehicleId}&action=${currentAction}`);
          }, 1500);
          return 7;
        }
        return prev + 1;
      });
    }, 400);

    return () => {
      clearInterval(interval);
      if (navTimer) clearTimeout(navTimer);
    };
  }, [hasActiveWorkflow, rawId, actionParam, vehicleIdParam, navigate]);

  const stages: StageDetail[] = [
    {
      id: 1,
      name: 'Signature Verification',
      shortName: 'Signature',
      icon: Key,
      input: 'ECDSA P-256 Public Key (0x048f9a2e...)',
      validation: 'Secp256r1 Curve Authentication',
      result: 'PASS',
      time: '2.1 ms',
      hash: '0x8f9a2e3b1c4d5e6f',
      signature: '0x30450221008a9f...',
      certificate: 'Cert-TrustRide-SecAdmin-Root',
      reason: 'Cryptographic signature authenticated against Secure Element Hardware',
    },
    {
      id: 2,
      name: 'Timestamp Validation',
      shortName: 'Timestamp',
      icon: Clock,
      input: 'Epoch Timestamp Freshness Check',
      validation: 'TTL Window Delta < 30s',
      result: 'PASS',
      time: '1.2 ms',
      hash: '0x1a2b3c4d5e6f7a8b',
      signature: '0x30450221009b1f...',
      certificate: 'Cert-TrustRide-TimeServer-NTP',
      reason: 'Command timestamp verified within 30-second strict expiration window',
    },
    {
      id: 3,
      name: 'Replay Protection',
      shortName: 'Nonce',
      icon: Shield,
      input: '64-bit Nonce TTL Verification',
      validation: 'Bloom Filter Unspent Check',
      result: 'PASS',
      time: '1.0 ms',
      hash: '0x3c4d5e6f7a8b9c0d',
      signature: '0x3045022100a22e...',
      certificate: 'Cert-TrustRide-ReplayGuard',
      reason: 'Unique single-use nonce confirmed. No duplicate payload re-transmission.',
    },
    {
      id: 4,
      name: 'Multi-Signature Quorum',
      shortName: 'Quorum',
      icon: Lock,
      input: 'Governance Threshold Authorization',
      validation: 'Governance Policy Matrix',
      result: 'PASS',
      time: '3.4 ms',
      hash: '0x5e6f7a8b9c0d1e2f',
      signature: '0x3045022100b33d...',
      certificate: 'Cert-TrustRide-GovernanceQuorum',
      reason: 'Required approval threshold reached prior to command dispatch',
    },
    {
      id: 5,
      name: 'Motion Safety Interlock',
      shortName: 'Motion Safety',
      icon: Activity,
      input: currentAction.includes('IMMOBILIZE') ? 'Vehicle Telemetry Motion Check' : 'Telemetry Speed = 0 km/h',
      validation: 'ASIL-D Speed Threshold Interlock',
      result: 'PASS',
      time: '4.2 ms',
      hash: '0x7a8b9c0d1e2f3a4b',
      signature: '0x3045022100c44c...',
      certificate: 'Cert-TrustRide-MotionSafetyASIL',
      reason: 'Vehicle telemetry updates continuously to reflect the execution result. For motion-sensitive commands, the speed gradually decreases until the Motion Safety Interlock allows execution.',
    },
    {
      id: 6,
      name: 'Vehicle HSM Dispatch',
      shortName: 'Vehicle HSM',
      icon: Radio,
      input: 'CAN Bus Encrypted Frame ID 0x7E0',
      validation: 'Hardware Secure Module Authorization',
      result: 'PASS',
      time: '27.8 ms',
      hash: '0x9c0d1e2f3a4b5c6d',
      signature: '0x3045022100d55b...',
      certificate: 'Cert-TrustRide-HSM-Dispatch',
      reason: 'Direct CAN bus hardware command payload dispatched over LTE gateway',
    },
    {
      id: 7,
      name: 'SHA-256 Merkle Ledger',
      shortName: 'Audit Ledger',
      icon: FileCheck,
      input: 'Merkle Block Payload Entry',
      validation: 'Previous Hash Binding 0x812C4F...',
      result: 'PASS',
      time: '3.1 ms',
      hash: '0x9AF82E3B1C4D5E6F',
      signature: '0x3045022100e66a...',
      certificate: 'Cert-TrustRide-MerkleLedgerRoot',
      reason: 'Immutably logged into Merkle tree hash-chain audit ledger',
    },
  ];

  const timelineEvents = [
    { time: '14:31:00', label: 'Signature Verified', detail: 'ECDSA P-256 key authenticated' },
    { time: '14:31:01', label: 'Timestamp Valid', detail: 'TTL freshness checked (<30s window)' },
    { time: '14:31:02', label: 'Nonce Fresh', detail: 'Replay protection cleared (unspent)' },
    { time: '14:31:03', label: 'Quorum Passed', detail: '2/2 Signatures confirmed' },
    { time: '14:31:04', label: 'Vehicle Stationary', detail: '0 km/h ASIL-D interlock verified' },
    { time: '14:31:05', label: 'Command Released', detail: 'Dispatched via Hardware HSM' },
    { time: '14:31:06', label: 'Ledger Updated', detail: 'SHA-256 block #154 committed' },
  ];

  return (
    <div className="space-y-6 font-sans">
      {/* 1. HEADER */}
      <div>
        <h1 className={`text-[32px] font-bold tracking-tight leading-none ${isDark ? 'text-white' : 'text-[#111827]'}`}>
          Verification Pipeline
        </h1>
        <p className={`text-sm mt-2 font-normal ${isDark ? 'text-slate-400' : 'text-[#475569]'}`}>
          7-Stage CI/CD Security Pipeline for Zero-Trust Remote Vehicle Command Validation
        </p>
      </div>

      {/* 2. TOP CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className={`p-4 rounded-lg border shadow-xs ${isDark ? 'bg-[#111827] border-slate-800' : 'bg-white border-[#E5E7EB]'}`}>
          <div className={`text-[10px] font-bold uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>COMMANDS VERIFIED</div>
          <div className={`text-2xl font-bold mt-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>24</div>
          <div className="text-[11px] text-emerald-600 font-semibold mt-0.5">100% Validated</div>
        </div>

        <div className={`p-4 rounded-lg border shadow-xs ${isDark ? 'bg-[#111827] border-slate-800' : 'bg-white border-[#E5E7EB]'}`}>
          <div className={`text-[10px] font-bold uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>SUCCESS RATE</div>
          <div className="text-2xl font-bold text-emerald-600 mt-1">99.8%</div>
          <div className="text-[11px] text-emerald-600 font-semibold mt-0.5">Zero Failures</div>
        </div>

        <div className={`p-4 rounded-lg border shadow-xs ${isDark ? 'bg-[#111827] border-slate-800' : 'bg-white border-[#E5E7EB]'}`}>
          <div className={`text-[10px] font-bold uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>AVG VERIFICATION TIME</div>
          <div className="text-2xl font-bold text-blue-600 mt-1">41.2 ms</div>
          <div className="text-[11px] text-blue-600 font-semibold mt-0.5">Sub-50ms HSM</div>
        </div>

        <div className={`p-4 rounded-lg border shadow-xs ${isDark ? 'bg-[#111827] border-slate-800' : 'bg-white border-[#E5E7EB]'}`}>
          <div className={`text-[10px] font-bold uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>REJECTED COMMANDS</div>
          <div className="text-2xl font-bold text-rose-600 mt-1">2</div>
          <div className="text-[11px] text-rose-600 font-semibold mt-0.5">Blocked by Policy</div>
        </div>
      </div>

      {/* 3. ANIMATED 7-STAGE PIPELINE GRID */}
      <div className={`p-6 rounded-lg border shadow-xs space-y-4 ${isDark ? 'bg-[#111827] border-slate-800' : 'bg-white border-[#E5E7EB]'}`}>
        <div className={`font-bold text-xs uppercase tracking-wider flex justify-between items-center border-b pb-3 ${isDark ? 'text-slate-400 border-slate-800' : 'text-slate-600 border-[#E5E7EB]'}`}>
          <span>7-Stage CI/CD Security Pipeline (Click Any Stage for Deep Details)</span>
          <span className="text-emerald-600 font-mono text-[11px] font-bold">✓ All 7 Stages Passed</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-3">
          {stages.map((stg) => {
            const IconComp = stg.icon;

            return (
              <div
                key={stg.id}
                onClick={() => setSelectedStage(stg)}
                className={`p-4 rounded-md border text-center transition-all cursor-pointer ${
                  isDark
                    ? 'bg-slate-900/60 border-slate-800 hover:border-blue-500 hover:bg-slate-800/80'
                    : 'bg-slate-50 border-slate-200 hover:border-blue-500 hover:bg-blue-50/50'
                }`}
              >
                <div className="w-10 h-10 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center mx-auto mb-2 font-bold border border-emerald-500/30">
                  <IconComp size={18} />
                </div>
                <div className={`text-[10px] font-mono uppercase ${isDark ? 'text-slate-400' : 'text-slate-600 font-bold'}`}>Stage {stg.id}</div>
                <div className={`font-bold text-xs mt-0.5 ${isDark ? 'text-white' : 'text-slate-900'}`}>{stg.shortName}</div>
                <span className="mt-2 inline-block px-2 py-0.5 rounded-md text-[9px] font-bold bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 border border-slate-800">
                  PASS
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. VERIFICATION TIMELINE */}
      <div className={`p-6 rounded-[16px] border shadow-xs space-y-4 ${isDark ? 'bg-[#111827] border-slate-800' : 'bg-white border-[#E5E7EB]'}`}>
        <div className="font-bold text-xs uppercase tracking-wider text-slate-400 border-b pb-3 border-slate-800">
          Verification Execution Timeline
        </div>

        <div className="space-y-3 font-mono text-xs">
          {timelineEvents.map((evt, idx) => (
            <div key={idx} className="flex items-center space-x-3 p-2.5 rounded-xl bg-slate-900/40 border border-slate-800 text-slate-300">
              <span className="text-blue-400 font-bold">{evt.time}</span>
              <CheckCircle2 size={14} className="text-emerald-500 shrink-0" />
              <div className="flex-1 flex justify-between">
                <strong className={isDark ? 'text-white' : 'text-[#111827]'}>{evt.label}</strong>
                <span className="text-slate-400 text-[11px]">{evt.detail}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 5. COMPLETION BANNER (Only displayed during active command execution workflow) */}
      {!isEvaluating && hasActiveWorkflow && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-6 rounded-[20px] bg-emerald-500/10 border border-emerald-500/30 flex flex-col sm:flex-row items-center justify-between gap-4"
        >
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold shrink-0">
              <CheckCircle2 size={24} />
            </div>
            <div>
              <div className="font-bold text-base text-emerald-600 dark:text-emerald-400">
                Command Executed Successfully!
              </div>
              <div className="text-xs text-slate-400 font-mono mt-0.5">
                Target Vehicle {currentVehicleId} • Action {currentAction} • 7/7 Verification Stages Passed
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-3 shrink-0">
            <button
              onClick={() => navigate(`/app/digital-twin?vehicleId=${currentVehicleId}`)}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs transition-colors cursor-pointer shadow-xs flex items-center space-x-1.5"
            >
              <span>Open Digital Twin →</span>
            </button>
            <button
              onClick={() => navigate('/app/audit')}
              className={`px-5 py-2.5 rounded-xl font-bold border transition-colors cursor-pointer flex items-center space-x-1.5 ${
                isDark ? 'bg-slate-900 border-slate-800 text-slate-200 hover:bg-slate-800' : 'bg-slate-100 border-slate-200 text-slate-800'
              }`}
            >
              <span>Open Audit Ledger →</span>
            </button>
          </div>
        </motion.div>
      )}

      {/* 5. STAGE DETAILS MODAL */}
      <AnimatePresence>
        {selectedStage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className={`rounded-[20px] max-w-lg w-full p-6 space-y-4 text-xs border shadow-2xl ${
                isDark ? 'bg-[#111827] border-slate-800 text-white' : 'bg-white border-[#E5E7EB] text-[#111827]'
              }`}
            >
              <div className="flex justify-between items-center border-b pb-3 border-slate-800">
                <div className="font-bold text-base flex items-center space-x-2">
                  <ShieldCheck size={18} className="text-blue-500" />
                  <span>Stage {selectedStage.id} Inspector — {selectedStage.name}</span>
                </div>
                <button onClick={() => setSelectedStage(null)} className="text-slate-400 hover:text-white cursor-pointer">
                  <X size={18} />
                </button>
              </div>

              <div className="space-y-3 font-mono">
                <div>Input: <strong className={isDark ? 'text-white' : 'text-[#111827]'}>{selectedStage.input}</strong></div>
                <div>Validation: <strong className="text-blue-400">{selectedStage.validation}</strong></div>
                <div>Result: <strong className="text-emerald-400">PASS ({selectedStage.time})</strong></div>
                <div>Hash: <strong className="text-purple-400">{selectedStage.hash}</strong></div>
                <div>Signature: <strong className="text-slate-300">{selectedStage.signature}</strong></div>
                <div>Certificate: <strong className="text-emerald-400">{selectedStage.certificate}</strong></div>
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 font-sans italic text-[11px] mt-2">
                  "{selectedStage.reason}"
                </div>
              </div>

              <div className="pt-3 flex justify-end border-t border-slate-800">
                <button
                  onClick={() => setSelectedStage(null)}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs transition-colors cursor-pointer"
                >
                  Close Inspector
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default VerificationPage;
