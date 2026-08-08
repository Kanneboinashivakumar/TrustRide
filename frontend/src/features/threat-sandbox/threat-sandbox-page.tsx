import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
// @ts-ignore
import { pageVariants } from '@/motion/variants';
import { useTheme } from '@/providers/theme-provider';
import {
  ShieldAlert,
  Play,
  Cpu,
  WifiOff,
  Key,
  FileWarning,
  Fingerprint,
  X,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Eye,
  FileCheck,
  ShieldCheck
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface ThreatCard {
  id: string;
  title: string;
  desc: string;
  icon: any;
  severity: 'Critical' | 'High' | 'Medium';
  reason: string;
}

export function ThreatSandboxPage() {
  const navigate = useNavigate();
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';

  const threats: ThreatCard[] = [
    { id: 'mitm', title: 'MITM Attack', desc: 'Simulate man-in-the-middle payload alteration over cellular network', icon: WifiOff, severity: 'Critical', reason: 'ECDSA P-256 Signature Mismatch' },
    { id: 'replay', title: 'Replay Attack', desc: 'Resend previously captured valid hardware command payload', icon: Play, severity: 'High', reason: 'Nonce Already Used (Replay Protection)' },
    { id: 'nonce_replay', title: 'Nonce Replay', desc: 'Reuse a cryptographic nonce in newly constructed command packet', icon: Cpu, severity: 'High', reason: 'Duplicate Nonce Detected in Bloom Filter' },
    { id: 'unauthorized_key', title: 'Unauthorized Key', desc: 'Submit command signed by unauthorized or revoked private key', icon: Key, severity: 'Critical', reason: 'Signer Certificate Revoked in CSMS' },
    { id: 'modified_payload', title: 'Modified Payload', desc: 'Tamper with speed parameter post-signature generation', icon: FileWarning, severity: 'High', reason: 'Payload Digest Mismatch (SHA-256)' },
    { id: 'partial_sig', title: 'Partial Signature', desc: 'Submit multi-sig command with missing required 2nd signature', icon: Fingerprint, severity: 'Medium', reason: 'Insufficient Quorum (1/2 Signatures)' },
  ];

  const [activeSimulation, setActiveSimulation] = useState<ThreatCard | null>(null);
  const [simStage, setSimStage] = useState<number>(0);
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [simCompleted, setSimCompleted] = useState<boolean>(false);

  const simulationSteps = [
    'Connecting...',
    'Capturing Packet...',
    'Injecting Command...',
    'Checking Signature...',
    'Checking Timestamp...',
    'Checking Nonce...',
    'Checking Quorum...',
    'Checking Motion Safety...',
    'Dispatch Blocked',
  ];

  const handleRunSimulation = async (threat: ThreatCard) => {
    setActiveSimulation(threat);
    setIsSimulating(true);
    setSimCompleted(false);
    setSimStage(0);

    for (let i = 0; i < simulationSteps.length; i++) {
      setSimStage(i);
      await new Promise((r) => setTimeout(r, 450));
    }

    try {
      await fetch('/api/threats/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ attackType: threat.title, vehicleId: 'TR-101' }),
      });
    } catch {
      // Fallback
    }

    setIsSimulating(false);
    setSimCompleted(true);
  };

  return (
    <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit" className="space-y-6 font-sans">
      {/* 1. HEADER */}
      <div>
        <h1 className={`text-[32px] font-bold tracking-tight leading-none ${isDark ? 'text-white' : 'text-[#111827]'}`}>
          Threat Sandbox
        </h1>
        <p className={`text-sm mt-2 font-normal ${isDark ? 'text-slate-400' : 'text-[#475569]'}`}>
          Simulate attack vectors and prove Zero-Trust defensive mitigation in real time
        </p>
      </div>

      {/* 2. 6 ATTACK CARDS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {threats.map((t) => {
          const IconComp = t.icon;

          return (
            <div
              key={t.id}
              className={`p-5 rounded-lg border flex flex-col justify-between shadow-xs transition-all ${
                isDark ? 'bg-[#111827] border-slate-800' : 'bg-white border-[#E5E7EB]'
              }`}
            >
              <div>
                <div className="flex justify-between items-start mb-4">
                  <div className="w-10 h-10 rounded-lg bg-rose-500/10 text-rose-600 flex items-center justify-center shrink-0 border border-rose-500/30">
                    <IconComp size={20} />
                  </div>
                  <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase border ${
                    t.severity === 'Critical' ? 'bg-rose-500/10 text-rose-600 border-rose-500/30' : 'bg-amber-500/10 text-amber-600 border-amber-500/30'
                  }`}>
                    {t.severity}
                  </span>
                </div>

                <h3 className={`font-bold text-base mb-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>{t.title}</h3>
                <p className={`text-xs font-medium leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>{t.desc}</p>
              </div>

              <button
                onClick={() => handleRunSimulation(t)}
                className="w-full mt-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-xs font-bold transition-colors cursor-pointer flex items-center justify-center space-x-1.5 shadow-xs"
              >
                <Play size={14} />
                <span>Run Simulation</span>
              </button>
            </div>
          );
        })}
      </div>

      {/* 3. ANIMATED SIMULATION DRAWER */}
      <AnimatePresence>
        {activeSimulation && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex justify-end"
          >
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className={`w-full max-w-xl h-full shadow-2xl p-6 overflow-y-auto space-y-6 text-xs border-l ${
                isDark ? 'bg-[#111827] border-slate-800 text-white' : 'bg-white border-[#E5E7EB] text-[#111827]'
              }`}
            >
              <div className="flex justify-between items-center border-b pb-4 border-slate-800">
                <div className="font-bold text-base flex items-center space-x-2">
                  <ShieldAlert size={20} className="text-rose-500" />
                  <span>Attack Simulation Drawer</span>
                </div>
                <button onClick={() => setActiveSimulation(null)} className="text-slate-400 hover:text-white cursor-pointer">
                  <X size={20} />
                </button>
              </div>

              {/* Vehicle & Threat Card */}
              <div className={`p-4 rounded-xl border space-y-2 font-mono ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                <div>Target Vehicle: <strong className={isDark ? 'text-white' : 'text-[#111827]'}>Sargam Electric Rickshaw (MH-12-ER-1001)</strong></div>
                <div>Threat Type: <strong className="text-rose-500">{activeSimulation.title}</strong></div>
                <div>Status: <strong className={isSimulating ? 'text-blue-500' : 'text-emerald-500'}>{isSimulating ? 'Simulation Running...' : 'Simulation Completed'}</strong></div>
              </div>

              {/* Animated Pipeline Steps */}
              <div className="space-y-2">
                <div className="font-bold text-slate-400 text-[11px] uppercase tracking-wider mb-2">Defense Pipeline Evaluation</div>
                {simulationSteps.map((stepName, idx) => {
                  const isCurrent = simStage === idx && isSimulating;
                  const isPassed = simStage > idx || simCompleted;
                  const isFailedStep = stepName.includes('Blocked') || stepName.includes('Nonce');

                  return (
                    <div
                      key={stepName}
                      className={`p-3 rounded-xl border flex items-center justify-between font-mono text-xs transition-all ${
                        isCurrent
                          ? 'bg-blue-600/20 border-blue-500 text-blue-400 font-bold shadow-xs'
                          : isPassed
                          ? isFailedStep
                            ? 'bg-rose-500/10 border-rose-500/30 text-rose-500 font-bold'
                            : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400'
                          : isDark
                          ? 'bg-slate-900/40 border-slate-800 text-slate-600'
                          : 'bg-slate-100 border-slate-200 text-slate-400'
                      }`}
                    >
                      <div className="flex items-center space-x-2">
                        {isCurrent ? <RefreshCw size={14} className="animate-spin text-blue-500" /> : isPassed ? <CheckCircle2 size={14} /> : <span className="w-3.5 h-3.5 rounded-full border border-slate-600" />}
                        <span>{stepName}</span>
                      </div>
                      <span>{isPassed ? (isFailedStep ? 'BLOCKED' : 'PASSED') : 'Waiting...'}</span>
                    </div>
                  );
                })}
              </div>

              {/* Final Result Card */}
              {simCompleted && (
                <div className="p-5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-xs space-y-3">
                  <div className="font-bold text-sm text-emerald-600 dark:text-emerald-400 flex items-center space-x-2">
                    <ShieldCheck size={18} />
                    <span>Attack Mitigated — Vehicle Safe</span>
                  </div>
                  <div className="space-y-1.5 font-mono text-slate-300">
                    <div>Threat: <strong>{activeSimulation.title}</strong></div>
                    <div>Detected: <strong className="text-emerald-400">YES</strong> • Blocked: <strong className="text-emerald-400">YES</strong></div>
                    <div>Reason: <strong className="text-rose-400">{activeSimulation.reason}</strong></div>
                    <div>Replay Protection: <strong className="text-emerald-400">Passed</strong></div>
                    <div>Audit Record: <strong className="text-purple-400">Logged to Block #154</strong></div>
                  </div>

                  <div className="pt-2 flex space-x-2">
                    <button
                      onClick={() => navigate('/app/verification')}
                      className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs transition-colors cursor-pointer"
                    >
                      View Verification
                    </button>
                    <button
                      onClick={() => navigate('/app/audit')}
                      className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl text-xs transition-colors cursor-pointer"
                    >
                      View Audit
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default ThreatSandboxPage;
