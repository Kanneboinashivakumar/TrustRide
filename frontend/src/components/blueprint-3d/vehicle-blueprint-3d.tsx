import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Power, ShieldCheck, RefreshCw, Cpu, Activity, Info, CheckCircle2, Lock, Radio, Sliders } from 'lucide-react';
import { cn } from '@/utils/cn';

interface VehicleBlueprint3DProps {
  onComplete?: () => void;
  className?: string;
}

export const VehicleBlueprint3D: React.FC<VehicleBlueprint3DProps> = ({ onComplete, className }) => {
  const [activeView, setActiveView] = useState<'SIDE' | 'TOP' | 'FRONT' | 'REAR'>('SIDE');
  const [powerState, setPowerState] = useState<'ONLINE' | 'IMMOBILIZING' | 'IMMOBILIZED'>('ONLINE');
  const [speed, setSpeed] = useState(24);
  const [bmsTemp, setBmsTemp] = useState(38);
  const [activeCallout, setActiveCallout] = useState<string | null>('ecu');

  // Remote Immobilization Simulation
  const handleImmobilize = () => {
    if (powerState !== 'ONLINE') return;
    setPowerState('IMMOBILIZING');
    
    let currentSpeed = 24;
    const interval = setInterval(() => {
      currentSpeed -= 6;
      if (currentSpeed <= 0) {
        currentSpeed = 0;
        setSpeed(0);
        setPowerState('IMMOBILIZED');
        clearInterval(interval);
      } else {
        setSpeed(currentSpeed);
      }
    }, 300);
  };

  const handleRestorePower = () => {
    setPowerState('ONLINE');
    setSpeed(24);
  };

  const specs = [
    { label: 'LENGTH', val: '2750 mm' },
    { label: 'WIDTH', val: '1100 mm' },
    { label: 'HEIGHT', val: '1850 mm' },
    { label: 'WHEELBASE', val: '2000 mm' },
    { label: 'GROUND CLEARANCE', val: '160 mm' },
    { label: 'SEATING CAPACITY', val: '4+1 PASSENGERS' },
    { label: 'MOTOR CAPABILITY', val: '1.2 kW BLDC' },
    { label: 'BATTERY TYPE', val: '48V LiFePO4 BMS' },
  ];

  return (
    <div className={cn("relative w-full rounded-3xl bg-[#071328] border-2 border-blue-400/40 overflow-hidden shadow-[0_0_60px_rgba(37,99,235,0.25)] text-white font-mono", className)}>
      
      {/* CAD Blueprint Blueprint Grid Overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(59,130,246,0.12)_1px,transparent_1px),linear-gradient(to_bottom,rgba(59,130,246,0.12)_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(4,9,20,0.6)_80%)] pointer-events-none" />

      {/* Blueprint Header */}
      <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between px-6 py-4 border-b border-blue-400/30 bg-blue-950/40 backdrop-blur-md gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-500/20 border border-blue-400/50 flex items-center justify-center text-cyan-300 shadow-[0_0_15px_rgba(56,189,248,0.3)]">
            <Zap size={20} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-extrabold tracking-widest text-cyan-300 uppercase">E-RICKSHAW CAD BLUEPRINT</h3>
              <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-400/30">REV 4.2</span>
            </div>
            <p className="text-[10px] text-slate-300 tracking-wider">ZERO-TRUST ECU & BMS REMOTE TELEMATICS SCHEMATIC</p>
          </div>
        </div>

        {/* View Switcher Pills */}
        <div className="flex items-center gap-1.5 bg-slate-950/80 p-1.5 rounded-full border border-blue-400/30">
          {(['SIDE', 'TOP', 'FRONT', 'REAR'] as const).map((view) => (
            <button
              key={view}
              onClick={() => setActiveView(view)}
              className={cn(
                "px-3.5 py-1 rounded-full text-[10px] font-bold tracking-wider transition-all duration-300 cursor-pointer",
                activeView === view
                  ? "bg-blue-600 text-white shadow-[0_0_12px_rgba(37,99,235,0.6)]"
                  : "text-slate-400 hover:text-white"
              )}
            >
              {view} VIEW
            </button>
          ))}
        </div>
      </div>

      {/* Main CAD Blueprint Technical Workspace */}
      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 min-h-[520px]">
        
        {/* Left Interactive Blueprint Canvas (8 Cols) */}
        <div className="lg:col-span-8 p-6 relative flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-blue-400/25">
          
          {/* Blueprint Title Watermark */}
          <div className="absolute top-6 left-6 pointer-events-none">
            <div className="text-2xl font-black text-blue-400/20 tracking-[0.2em]">E-RICKSHAW CAD</div>
            <div className="text-xs text-blue-300/30 tracking-widest">DRAWING NO. TR-ER-2026-X</div>
          </div>

          {/* Interactive Live Telematics Indicators */}
          <div className="flex flex-wrap items-center gap-3 relative z-20 mt-8 sm:mt-0">
            <div className="px-3 py-1.5 rounded-lg bg-slate-950/80 border border-blue-400/40 text-[10.5px] text-cyan-300 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
              <span>ECU GATEWAY: <strong className="text-white">HARDWARE SIGNED</strong></span>
            </div>

            <div className="px-3 py-1.5 rounded-lg bg-slate-950/80 border border-blue-400/40 text-[10.5px] text-cyan-300 flex items-center gap-2">
              <Activity size={13} className="text-emerald-400" />
              <span>SPEED: <strong className={cn(speed > 0 ? "text-emerald-400" : "text-red-400")}>{speed} KM/H</strong></span>
            </div>

            <div className="px-3 py-1.5 rounded-lg bg-slate-950/80 border border-blue-400/40 text-[10.5px] text-cyan-300 flex items-center gap-2">
              <Cpu size={13} className="text-blue-400" />
              <span>BMS TEMP: <strong className="text-white">{bmsTemp}°C</strong></span>
            </div>
          </div>

          {/* Blueprint Technical Schematic Graphic Rendering */}
          <div className="relative my-8 flex items-center justify-center min-h-[320px]">
            
            {/* SVG Blueprint Dimension Lines & Schematic Wireframe */}
            <svg className="w-full max-w-[620px] h-[280px] overflow-visible" viewBox="0 0 600 280">
              <defs>
                <pattern id="blueprintGrid" width="20" height="20" patternUnits="userSpaceOnUse">
                  <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#2563eb" strokeWidth="0.5" opacity="0.3" />
                </pattern>
                <filter id="glowBlue">
                  <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                  <feMerge>
                    <feMergeNode in="coloredBlur"/>
                    <feMergeNode in="SourceGraphic"/>
                  </feMerge>
                </filter>
              </defs>

              {/* Technical Measurement Dimension Annotations */}
              <g stroke="#60a5fa" strokeWidth="1" strokeDasharray="3 3" opacity="0.8">
                {/* Horizontal Dimension 2750mm */}
                <line x1="50" y1="30" x2="550" y2="30" />
                <line x1="50" y1="20" x2="50" y2="40" />
                <line x1="550" y1="20" x2="550" y2="40" />
                <text x="300" y="24" fill="#93c5fd" fontSize="11" textAnchor="middle" fontWeight="bold">2750 mm (OVERALL LENGTH)</text>

                {/* Vertical Dimension 1850mm */}
                <line x1="25" y1="50" x2="25" y2="240" />
                <line x1="15" y1="50" x2="35" y2="50" />
                <line x1="15" y1="240" x2="35" y2="240" />
                <text x="18" y="145" fill="#93c5fd" fontSize="10" textAnchor="middle" transform="rotate(-90 18 145)" fontWeight="bold">1850 mm (HEIGHT)</text>
              </g>

              {/* E-Rickshaw Silhouette CAD Wireframe Paths */}
              <g stroke={powerState === 'IMMOBILIZED' ? '#f87171' : '#38bdf8'} strokeWidth="1.5" fill="none" filter="url(#glowBlue)">
                {/* Outer Frame Roof Canopy */}
                <path d="M 120,70 Q 280,40 520,65 L 540,200 L 80,200 Z" strokeWidth="1.8" />
                <path d="M 120,70 Q 90,130 90,190" strokeWidth="1.8" />
                
                {/* Passenger Seats Blueprint Geometry */}
                <rect x="360" y="140" width="130" height="45" rx="4" opacity="0.8" />
                <rect x="220" y="140" width="110" height="45" rx="4" opacity="0.8" />
                
                {/* Driver Handle & Console */}
                <path d="M 140,110 L 170,140 L 160,180" strokeWidth="1.5" />
                <circle cx="135" cy="105" r="8" opacity="0.9" />

                {/* Wheels */}
                <circle cx="140" cy="210" r="32" strokeWidth="2" />
                <circle cx="140" cy="210" r="16" strokeDasharray="4 2" />
                
                <circle cx="460" cy="210" r="32" strokeWidth="2" />
                <circle cx="460" cy="210" r="16" strokeDasharray="4 2" />

                {/* BMS Battery Pack Container (Under Seat) */}
                <rect x="240" y="185" width="160" height="25" rx="2" fill={powerState === 'IMMOBILIZED' ? 'rgba(239,68,68,0.2)' : 'rgba(56,189,248,0.15)'} stroke={powerState === 'IMMOBILIZED' ? '#ef4444' : '#34d399'} strokeWidth="1.5" />
                <text x="320" y="202" fill={powerState === 'IMMOBILIZED' ? '#fca5a5' : '#6ee7b7'} fontSize="9" textAnchor="middle" fontWeight="bold">48V LiFePO4 BMS PACK</text>
              </g>

              {/* Interactive Telematics Waypoint Callouts */}
              {/* ECU Node Callout */}
              <g className="cursor-pointer" onClick={() => setActiveCallout('ecu')}>
                <circle cx="160" cy="130" r="12" fill="rgba(56,189,248,0.2)" stroke="#38bdf8" strokeWidth="1.5" />
                <circle cx="160" cy="130" r="4" fill="#38bdf8" />
                <line x1="160" y1="130" x2="210" y2="90" stroke="#38bdf8" strokeWidth="1" strokeDasharray="2 2" />
                <rect x="210" y="75" width="130" height="26" rx="4" fill="#040914" stroke="#38bdf8" strokeWidth="1" />
                <text x="275" y="92" fill="#7dd3fc" fontSize="9" textAnchor="middle" fontWeight="bold">ECU SECURE NODE</text>
              </g>
            </svg>
          </div>

          {/* View Description Note */}
          <div className="flex items-center justify-between text-[10.5px] text-slate-300 border-t border-blue-400/20 pt-3">
            <span>SCALE: 1:20 ARCHITECTURAL VECTOR SCHEMATIC</span>
            <span className="text-cyan-300 font-bold">ALL DIMENSIONS IN MILLIMETERS (mm)</span>
          </div>

        </div>

        {/* Right Remote Governance Control Panel (4 Cols) */}
        <div className="lg:col-span-4 p-6 bg-slate-950/90 backdrop-blur-xl flex flex-col justify-between">
          
          <div>
            <div className="flex items-center justify-between mb-4 border-b border-blue-400/25 pb-3">
              <span className="text-xs font-bold text-cyan-300 tracking-wider">GOVERNANCE TRIGGER</span>
              <span className={cn("text-[9px] font-bold uppercase px-2.5 py-0.5 rounded border",
                powerState === 'ONLINE' ? "bg-emerald-950 text-emerald-400 border-emerald-800" :
                powerState === 'IMMOBILIZING' ? "bg-amber-950 text-amber-400 border-amber-800 animate-pulse" :
                "bg-red-950 text-red-400 border-red-800"
              )}>
                {powerState}
              </span>
            </div>

            <p className="text-xs text-slate-300 mb-6 leading-relaxed">
              Test remote vehicle shutoff trigger with multi-signature verification & simulated vehicle motion safety checks.
            </p>

            {/* Specifications Table (Inspired by uploaded Blueprint image) */}
            <div className="bg-blue-950/30 rounded-xl p-4 border border-blue-400/20 mb-6 space-y-2">
              <div className="text-[10px] font-bold text-cyan-300 uppercase tracking-widest border-b border-blue-400/20 pb-1.5 mb-2">
                VEHICLE SPECIFICATIONS
              </div>
              {specs.map((sp) => (
                <div key={sp.label} className="flex items-center justify-between text-[10.5px]">
                  <span className="text-slate-400">{sp.label}:</span>
                  <span className="text-white font-bold">{sp.val}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Action Trigger Buttons */}
          <div className="space-y-3 pt-4 border-t border-blue-400/20">
            {powerState === 'ONLINE' ? (
              <button
                onClick={handleImmobilize}
                className="w-full py-3.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-[0_0_25px_rgba(220,38,38,0.4)] transition-all cursor-pointer"
              >
                <Power size={16} /> Execute Remote Immobilization
              </button>
            ) : powerState === 'IMMOBILIZING' ? (
              <div className="w-full py-3.5 rounded-xl bg-amber-600/30 border border-amber-500 text-amber-300 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2">
                <RefreshCw size={16} className="animate-spin" /> Verifying Motion Safety (0 km/h)...
              </div>
            ) : (
              <div className="space-y-2.5">
                <div className="p-3 rounded-xl bg-red-950/80 border border-red-500/50 text-xs text-red-300 text-center font-bold">
                  ✓ VEHICLE IMMOBILIZED SAFELY
                </div>
                <button
                  onClick={handleRestorePower}
                  className="w-full py-3 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer"
                >
                  Restore Vehicle Ignition
                </button>
              </div>
            )}

            {onComplete && (
              <button
                onClick={onComplete}
                className="w-full py-2.5 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer"
              >
                Explore Full Platform Features &rarr;
              </button>
            )}
          </div>

        </div>

      </div>

    </div>
  );
};

export default VehicleBlueprint3D;
