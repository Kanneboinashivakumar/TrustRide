import { useState } from 'react';
import { motion } from 'framer-motion';
// @ts-ignore
import { pageVariants } from '@/motion/variants';
import { useTheme } from '@/providers/theme-provider';
import { Search, BookOpen, Shield, Cpu, Activity, Lock, Terminal, FileText, Download, Phone, HelpCircle } from 'lucide-react';

export function HelpPage() {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';

  const [searchQuery, setSearchQuery] = useState('');

  const moduleGuides = [
    { title: 'Fleet Management Guide', desc: 'Manage commercial EV telemetry, status tracking, and dispatching.', icon: BookOpen, tag: 'Module 1' },
    { title: 'Command Center Guide', desc: '7-step remote command wizard, FIR uploads, and legal reasons.', icon: Terminal, tag: 'Module 2' },
    { title: 'Approval Center Guide', desc: '2-person co-signature governance and multi-sig quorum rules.', icon: Lock, tag: 'Module 3' },
    { title: 'Verification Pipeline Guide', desc: '7-stage Zero-Trust security checks (ECDSA, Nonce, ASIL-D).', icon: Shield, tag: 'Module 4' },
    { title: 'Digital Twin Guide', desc: 'Live multi-vehicle map animation and target vehicle freezing.', icon: Cpu, tag: 'Module 5' },
    { title: 'Threat Sandbox Guide', desc: 'Simulate cyber attack vectors (Replay, MITM, Nonce Replay).', icon: HelpCircle, tag: 'Module 6' },
    { title: 'Audit Ledger Guide', desc: 'SHA-256 Merkle hash chain verification and tamper detection.', icon: FileText, tag: 'Module 7' },
    { title: 'Analytics & Compliance Guide', desc: 'Recharts SOC telemetry, fleet utilization, and UNECE R155.', icon: Activity, tag: 'Module 8' },
  ];

  const filteredGuides = moduleGuides.filter(
    (g) => g.title.toLowerCase().includes(searchQuery.toLowerCase()) || g.desc.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit" className="space-y-6 font-sans">
      {/* HEADER & SEARCH BAR */}
      <div className="pb-4 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className={`text-2xl font-extrabold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
            Documentation & Help Center
          </h1>
          <p className={`text-xs mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            Comprehensive developer documentation, module guides, and security manuals
          </p>
        </div>
        <button
          onClick={() => alert('Downloading TrustRide_User_Manual_v1.1.pdf...')}
          className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-xs font-bold transition-colors cursor-pointer flex items-center space-x-1.5 shadow-xs"
        >
          <Download size={14} />
          <span>Download Manual (PDF)</span>
        </button>
      </div>

      {/* SEARCH BAR INPUT */}
      <div className="relative">
        <Search className="absolute left-3.5 top-3 text-slate-400" size={16} />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search documentation, module guides, or security protocols..."
          className={`w-full pl-10 pr-4 py-2.5 rounded-lg border text-xs font-mono font-bold ${
            isDark ? 'bg-[#111827] border-slate-800 text-white placeholder-slate-500' : 'bg-white border-[#E5E7EB] text-slate-900 placeholder-slate-400'
          }`}
        />
      </div>

      {/* 8 MODULE GUIDES GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {filteredGuides.map((g) => {
          const IconComp = g.icon;

          return (
            <div
              key={g.title}
              onClick={() => alert(`Opening ${g.title}...`)}
              className={`p-5 rounded-lg border shadow-xs flex flex-col justify-between cursor-pointer transition-all ${
                isDark ? 'bg-[#111827] border-slate-800 hover:border-blue-500' : 'bg-white border-[#E5E7EB] hover:border-blue-500'
              }`}
            >
              <div>
                <div className="flex justify-between items-start mb-3">
                  <div className="w-9 h-9 rounded-lg bg-blue-500/10 text-blue-500 flex items-center justify-center shrink-0 border border-blue-500/30">
                    <IconComp size={18} />
                  </div>
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 border border-slate-800">
                    {g.tag}
                  </span>
                </div>

                <h3 className={`font-bold text-sm mb-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>{g.title}</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-normal leading-relaxed">{g.desc}</p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-800 flex justify-between items-center text-xs font-bold text-blue-500">
                <span>View Full Article</span>
                <span>→</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* KEYBOARD SHORTCUTS CARD */}
      <div className={`p-5 rounded-lg border shadow-xs space-y-3 ${isDark ? 'bg-[#111827] border-slate-800' : 'bg-white border-[#E5E7EB]'}`}>
        <div className="font-bold text-xs uppercase tracking-wider text-slate-500 border-b pb-3 border-slate-200 dark:border-slate-800">
          SOC Platform Keyboard Shortcuts
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
          <div className="flex justify-between items-center p-2 rounded-md bg-slate-900/40 border border-slate-800">
            <span className="text-slate-400">Search Command</span>
            <kbd className="px-2 py-0.5 bg-slate-800 text-white rounded text-[10px]">Ctrl + K</kbd>
          </div>
          <div className="flex justify-between items-center p-2 rounded-md bg-slate-900/40 border border-slate-800">
            <span className="text-slate-400">New Command</span>
            <kbd className="px-2 py-0.5 bg-slate-800 text-white rounded text-[10px]">Shift + C</kbd>
          </div>
          <div className="flex justify-between items-center p-2 rounded-md bg-slate-900/40 border border-slate-800">
            <span className="text-slate-400">Fleet View</span>
            <kbd className="px-2 py-0.5 bg-slate-800 text-white rounded text-[10px]">Shift + F</kbd>
          </div>
          <div className="flex justify-between items-center p-2 rounded-md bg-slate-900/40 border border-slate-800">
            <span className="text-slate-400">Toggle Theme</span>
            <kbd className="px-2 py-0.5 bg-slate-800 text-white rounded text-[10px]">Shift + T</kbd>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default HelpPage;
