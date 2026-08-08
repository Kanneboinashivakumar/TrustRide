import { useNavigate } from 'react-router-dom';
import { Play, Shield, Terminal, CheckCircle2, GitBranch, Cpu, Lock, Award, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { VerificationPipeline } from '@/components/data-display/verification-pipeline';

export function JudgeDemoPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-12 space-y-8">
      {/* Top Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => navigate('/app/dashboard')} className="text-slate-400 hover:text-white">
            <ArrowLeft size={16} className="mr-1" /> Back to Dashboard
          </Button>
          <div className="h-4 w-px bg-slate-800" />
          <Badge variant="success" className="uppercase tracking-widest text-[10px]">Judge & Presentation Mode</Badge>
        </div>

        <div className="flex items-center gap-3">
          <Button
            size="sm"
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
            onClick={() => navigate('/app/scenario-simulator')}
          >
            <Play size={14} className="mr-1 fill-white" /> Launch Live Scenario Simulator
          </Button>
        </div>
      </div>

      {/* Hero Banner */}
      <div className="text-center space-y-4 max-w-3xl mx-auto py-8">
        <h1 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight">
          TrustRide Command Governance
        </h1>
        <p className="text-base text-slate-400">
          Zero-Trust Remote EV Governance Platform utilizing cryptographic multi-sig consensus, 7-stage verification & motion safety enforcement.
        </p>
      </div>

      {/* Innovation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
        <Card className="p-6 bg-slate-900 border-slate-800 text-slate-100 space-y-3">
          <div className="p-3 rounded-xl bg-blue-500/20 text-blue-400 w-fit"><Shield size={24} /></div>
          <h3 className="text-lg font-bold">1. Zero-Trust Hardware Security</h3>
          <p className="text-xs text-slate-400">
            Every command is signed by Simulated Hardware Security Module (HSM) keys and validated against a 7-stage cryptographic pipeline before reaching the simulated vehicle communication layer.
          </p>
        </Card>

        <Card className="p-6 bg-slate-900 border-slate-800 text-slate-100 space-y-3">
          <div className="p-3 rounded-xl bg-purple-500/20 text-purple-400 w-fit"><CheckCircle2 size={24} /></div>
          <h3 className="text-lg font-bold">2. Motion Safety Engine</h3>
          <p className="text-xs text-slate-400">
            Real-time simulated vehicle telematics ensure immobilization commands are safely delayed until vehicle reaches 0 km/h in a designated park state.
          </p>
        </Card>

        <Card className="p-6 bg-slate-900 border-slate-800 text-slate-100 space-y-3">
          <div className="p-3 rounded-xl bg-emerald-500/20 text-emerald-400 w-fit"><Lock size={24} /></div>
          <h3 className="text-lg font-bold">3. Immutable Audit Ledger</h3>
          <p className="text-xs text-slate-400">
            SHA-256 block hash chain records every command, signature, and telematics packet for regulatory compliance & legal dispute resolution.
          </p>
        </Card>
      </div>

      {/* Signature Pipeline Section */}
      <Card className="p-8 bg-slate-900 border-slate-800 text-slate-100 max-w-5xl mx-auto space-y-6">
        <div className="text-center space-y-1">
          <span className="text-xs font-mono text-emerald-400 uppercase tracking-widest">Platform Core Identity</span>
          <h3 className="text-2xl font-bold">7-Stage Command Verification Pipeline</h3>
        </div>

        <VerificationPipeline
          stages={[
            { id: '1', name: 'Signature Verification', status: 'passed', duration: 40 },
            { id: '2', name: 'Freshness Check', status: 'passed', duration: 15 },
            { id: '3', name: 'Replay Protection', status: 'passed', duration: 10 },
            { id: '4', name: 'Multi-signature Authorization', status: 'passed', duration: 30 },
            { id: '5', name: 'Motion Safety Check', status: 'passed', duration: 80 },
            { id: '6', name: 'Vehicle Execution', status: 'passed', duration: 100 },
            { id: '7', name: 'SHA-256 Hash Chain Audit', status: 'passed', duration: 20 },
          ]}
          animated={true}
        />
      </Card>
    </div>
  );
}
