import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
// @ts-ignore
import { pageVariants } from '@/motion/variants';
import { useTheme } from '@/providers/theme-provider';
import { Bell, Shield, Key, Cpu, AlertTriangle, CheckCircle2, Filter, Check } from 'lucide-react';

interface ActivityItem {
  id: string;
  title: string;
  desc: string;
  time: string;
  category: 'Commands' | 'Approvals' | 'Security' | 'Threats' | 'Firmware' | 'Fleet' | 'System';
  unread: boolean;
  status: string;
}

export function ActivityCenterPage() {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';

  const [filter, setFilter] = useState<'All' | 'Unread' | 'Commands' | 'Security' | 'Approvals'>('All');

  const [activities, setActivities] = useState<ActivityItem[]>([
    { id: 'ACT-101', title: 'Emergency Immobilization Approved', desc: 'Co-signed by Sarah Kim & Aisha Khan for Mahindra Treo (TR-102)', time: '5 min ago', category: 'Approvals', unread: true, status: 'APPROVED' },
    { id: 'ACT-102', title: 'Replay Attack Attempt Blocked', desc: 'Threat Sandbox detected 64-bit Nonce TTL expiration on TR-101', time: '18 min ago', category: 'Threats', unread: true, status: 'BLOCKED' },
    { id: 'ACT-103', title: 'OTA Firmware Patch v2.4.1 Synced', desc: 'ECU Cryptographic image hash 0x8f9a2e verified successfully', time: '45 min ago', category: 'Firmware', unread: false, status: 'COMMITTED' },
    { id: 'ACT-104', title: 'Command Request CMD-1045 Created', desc: 'Remote diagnostics request initiated by Lead EV Tech', time: '1 hour ago', category: 'Commands', unread: false, status: 'PENDING' },
    { id: 'ACT-105', title: 'Audit Block #154 Merkle Hash Verified', desc: 'Zero tampering detected across 154 connected blocks', time: '2 hours ago', category: 'Security', unread: false, status: 'VALID' },
  ]);

  const [readMsg, setReadMsg] = useState('');

  const markAllRead = async () => {
    setActivities(activities.map((a) => ({ ...a, unread: false })));
    setReadMsg('All notifications marked as read');
    setTimeout(() => setReadMsg(''), 2500);
    try {
      await fetch('/api/activity/read', { method: 'PATCH' });
    } catch {
      // Fallback
    }
  };

  const filteredList = activities.filter((a) => {
    if (filter === 'Unread') return a.unread;
    if (filter === 'Commands') return a.category === 'Commands';
    if (filter === 'Security') return a.category === 'Security' || a.category === 'Threats';
    if (filter === 'Approvals') return a.category === 'Approvals';
    return true;
  });

  return (
    <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit" className="space-y-6 font-sans">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className={`text-2xl font-extrabold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
            Activity Center & Security Alerts
          </h1>
          <p className={`text-xs mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            Single source of truth for real-time notifications, command dispatches, and threat alerts
          </p>
        </div>
        <button
          onClick={markAllRead}
          className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-xs font-bold transition-colors cursor-pointer flex items-center space-x-1.5 shadow-xs"
        >
          <Check size={14} />
          <span>Mark All as Read</span>
        </button>
      </div>

      {readMsg && (
        <div className="p-3 rounded-md bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 text-xs font-bold font-mono flex items-center space-x-2">
          <Check size={16} />
          <span>{readMsg}</span>
        </div>
      )}

      {/* CATEGORY FILTERS BAR */}
      <div className={`p-4 rounded-lg border shadow-xs flex items-center justify-between ${
        isDark ? 'bg-[#111827] border-slate-800' : 'bg-white border-[#E5E7EB]'
      }`}>
        <div className="flex items-center space-x-2">
          {(['All', 'Unread', 'Commands', 'Security', 'Approvals'] as const).map((cat) => {
            const isActive = filter === cat;
            return (
              <button
                key={cat}
                onClick={() => setFilter(cat)}
                className={`px-3.5 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-xs'
                    : isDark
                    ? 'text-slate-400 hover:bg-slate-800'
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </div>

      {/* ACTIVITIES LIST */}
      <div className={`p-5 rounded-lg border shadow-xs space-y-3 ${isDark ? 'bg-[#111827] border-slate-800' : 'bg-white border-[#E5E7EB]'}`}>
        <div className="font-bold text-xs uppercase tracking-wider text-slate-500 border-b pb-3 border-slate-200 dark:border-slate-800 flex justify-between items-center">
          <span>Unified Telemetry Stream ({filteredList.length} Items)</span>
          <span className="text-emerald-500 font-mono text-[11px]">Real-Time Sync</span>
        </div>

        <div className="space-y-2.5">
          {filteredList.map((a) => (
            <div
              key={a.id}
              className={`p-4 rounded-md border text-xs font-mono transition-all flex items-start justify-between ${
                a.unread
                  ? 'border-blue-500 bg-blue-500/10'
                  : isDark
                  ? 'bg-slate-900 border-slate-800'
                  : 'bg-slate-50 border-slate-200'
              }`}
            >
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <span className={`font-bold text-sm ${isDark ? 'text-white' : 'text-slate-900'}`}>{a.title}</span>
                  {a.unread && (
                    <span className="px-2 py-0.5 rounded-md text-[9px] font-bold bg-rose-500 text-white">NEW</span>
                  )}
                </div>
                <p className="text-slate-500 dark:text-slate-400 font-sans">{a.desc}</p>
                <div className="text-[10px] text-slate-400">Category: {a.category} • {a.time}</div>
              </div>

              <span className="px-2.5 py-1 rounded-md text-[10px] font-bold bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 border border-slate-800 shrink-0">
                {a.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

export default ActivityCenterPage;
