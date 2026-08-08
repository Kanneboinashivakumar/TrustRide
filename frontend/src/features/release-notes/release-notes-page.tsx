import { motion } from 'framer-motion';
// @ts-ignore
import { pageVariants } from '@/motion/variants';
import { useTheme } from '@/providers/theme-provider';
import { Tag, CheckCircle2, ShieldCheck, Zap, Bug } from 'lucide-react';

export function ReleaseNotesPage() {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';

  const releases = [
    {
      version: 'Version 1.2 (Current — Final Release)',
      date: 'August 6, 2026',
      tag: 'Major Release',
      features: [
        'Automotive Compliance Matrix (ISO 21434, UNECE R155, ISO 26262, AIS-156)',
        'Assigned Driver Portal with live telemetry and emergency contacts',
        'Enterprise Organization Console & Role-Based Access Control (RBAC)',
        'Operational Scenario Simulator with 8 pre-built commercial EV workflows',
      ],
      fixes: ['Fixed light mode text readability contrast', 'Fixed multi-vehicle Digital Twin motion sync'],
      security: ['SHA-256 Merkle tamper detection and one-click chain restoration'],
      performance: ['Sub-50ms HSM signing dispatch latency across all commercial EVs'],
    },
    {
      version: 'Version 1.1 (SOC Intelligence)',
      date: 'July 25, 2026',
      tag: 'Feature Update',
      features: [
        'Multi-Vehicle Digital Twin visualization (TR-101, TR-102, TR-103)',
        'Interactive Threat Sandbox with 6 simulated cyber attack vectors',
        'Enterprise Fleet Intelligence Analytics Dashboard with 6 Recharts graphs',
      ],
      fixes: ['Resolved Approval Center queue auto-selection for newly submitted requests'],
      security: ['2-Person Governance co-signature PIN verification guard'],
      performance: ['Optimized Leaflet map marker rendering performance'],
    },
    {
      version: 'Version 1.0 (Core Engine)',
      date: 'July 10, 2026',
      tag: 'Initial Release',
      features: [
        'Initial Commercial EV Fleet Management (Sargam, Mahindra Treo, Piaggio Ape)',
        '7-Step Command Center Guided Remote Command Wizard',
        '7-Stage Zero-Trust Verification Pipeline (ECDSA, Timestamp TTL, Nonce, ASIL-D)',
      ],
      fixes: ['Initial release build baseline'],
      security: ['Hardware-backed secp256r1 key generation in Secure Element module'],
      performance: ['Express Node.js REST API server baseline'],
    },
  ];

  return (
    <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit" className="space-y-6 font-sans">
      {/* HEADER */}
      <div className="pb-4 border-b border-slate-200 dark:border-slate-800">
        <h1 className={`text-2xl font-extrabold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
          Release Notes & Version Timeline
        </h1>
        <p className={`text-xs mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
          Changelog history, feature additions, security enhancements, and performance optimizations
        </p>
      </div>

      {/* VERSION TIMELINE LIST */}
      <div className="space-y-6">
        {releases.map((rel) => (
          <div
            key={rel.version}
            className={`p-6 rounded-lg border shadow-xs space-y-4 ${isDark ? 'bg-[#111827] border-slate-800' : 'bg-white border-[#E5E7EB]'}`}
          >
            <div className="flex justify-between items-center border-b pb-3 border-slate-200 dark:border-slate-800">
              <div className="flex items-center space-x-2">
                <Tag size={16} className="text-blue-500" />
                <h2 className={`font-bold text-base ${isDark ? 'text-white' : 'text-slate-900'}`}>{rel.version}</h2>
                <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-blue-500/10 text-blue-500 border border-blue-500/30">
                  {rel.tag}
                </span>
              </div>
              <span className="text-xs font-mono text-slate-400">{rel.date}</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
              {/* Features */}
              <div className="space-y-2">
                <div className="font-bold text-blue-500 flex items-center space-x-1">
                  <CheckCircle2 size={14} />
                  <span>Features Added</span>
                </div>
                <ul className="space-y-1 text-slate-600 dark:text-slate-300">
                  {rel.features.map((f, i) => (
                    <li key={i} className="flex items-start space-x-1.5">
                      <span className="text-blue-500">•</span>
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Bug Fixes */}
              <div className="space-y-2">
                <div className="font-bold text-amber-500 flex items-center space-x-1">
                  <Bug size={14} />
                  <span>Bug Fixes</span>
                </div>
                <ul className="space-y-1 text-slate-600 dark:text-slate-300">
                  {rel.fixes.map((fx, i) => (
                    <li key={i} className="flex items-start space-x-1.5">
                      <span className="text-amber-500">•</span>
                      <span>{fx}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Security Improvements */}
              <div className="space-y-2">
                <div className="font-bold text-emerald-500 flex items-center space-x-1">
                  <ShieldCheck size={14} />
                  <span>Security Enhancements</span>
                </div>
                <ul className="space-y-1 text-slate-600 dark:text-slate-300">
                  {rel.security.map((s, i) => (
                    <li key={i} className="flex items-start space-x-1.5">
                      <span className="text-emerald-500">•</span>
                      <span>{s}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Performance Improvements */}
              <div className="space-y-2">
                <div className="font-bold text-purple-500 flex items-center space-x-1">
                  <Zap size={14} />
                  <span>Performance Gains</span>
                </div>
                <ul className="space-y-1 text-slate-600 dark:text-slate-300">
                  {rel.performance.map((p, i) => (
                    <li key={i} className="flex items-start space-x-1.5">
                      <span className="text-purple-500">•</span>
                      <span>{p}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

export default ReleaseNotesPage;
