import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
// @ts-ignore
import { pageVariants } from '@/motion/variants';
import { useTheme } from '@/providers/theme-provider';
import { useNavigate } from 'react-router-dom';
import {
  ShieldCheck,
  FileText,
  CheckCircle2,
  Download,
  FileSpreadsheet,
  Package,
  X,
  ChevronRight,
  Shield,
  Lock,
  Zap,
  Key
} from 'lucide-react';

interface FrameworkItem {
  id: string;
  name: string;
  fullName: string;
  coverage: number;
  status: string;
  lastUpdated: string;
  controls: { name: string; status: string; evidence: string; auditBlock: number }[];
}

export function CompliancePage() {
  const navigate = useNavigate();
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';

  const [selectedFramework, setSelectedFramework] = useState<FrameworkItem | null>(null);

  const frameworks: FrameworkItem[] = [
    {
      id: 'ISO-21434',
      name: 'ISO/SAE 21434',
      fullName: 'Road Vehicles — Cybersecurity Engineering',
      coverage: 100,
      status: 'Ready for Audit',
      lastUpdated: 'Today',
      controls: [
        { name: 'Cryptographic Key Management (ECDSA P-256)', status: 'Implemented', evidence: 'Hardware HSM P-256 Key', auditBlock: 145 },
        { name: 'Immutable Audit Trail (SHA-256 Merkle Chain)', status: 'Implemented', evidence: 'SHA-256 Hash Chain', auditBlock: 154 },
      ],
    },
    {
      id: 'UNECE-R155',
      name: 'UNECE R155',
      fullName: 'Cybersecurity Management System (CSMS)',
      coverage: 100,
      status: 'Ready for Audit',
      lastUpdated: 'Today',
      controls: [
        { name: 'Replay Protection (64-bit Nonce TTL)', status: 'Implemented', evidence: 'Nonce Bloom Filter', auditBlock: 153 },
        { name: 'Multi-Signature Governance Quorum', status: 'Implemented', evidence: '2/2 Admin Co-Signature', auditBlock: 154 },
      ],
    },
    {
      id: 'ISO-26262',
      name: 'ISO 26262',
      fullName: 'Road Vehicles — Functional Safety (ASIL-D)',
      coverage: 96,
      status: 'Ready for Audit',
      lastUpdated: 'Yesterday',
      controls: [
        { name: 'Motion Safety Interlock (<5 km/h)', status: 'Implemented', evidence: 'ASIL-D Motion Interlock', auditBlock: 152 },
        { name: 'Thermal & Drivetrain Isolation Protocol', status: 'Implemented', evidence: 'Motor Controller Cutoff', auditBlock: 151 },
      ],
    },
    {
      id: 'AIS-156',
      name: 'AIS-156',
      fullName: 'Indian EV Traction Battery & Safety Standard',
      coverage: 98,
      status: 'Ready for Audit',
      lastUpdated: 'Today',
      controls: [
        { name: 'BMS High-Voltage Isolation', status: 'Implemented', evidence: 'BMS Safety Relay Cutoff', auditBlock: 150 },
        { name: 'Remote Telematics Health Logging', status: 'Implemented', evidence: 'CAN Bus Health Stream', auditBlock: 149 },
      ],
    },
  ];

  const securityControls = [
    { name: 'Replay Protection', status: 'Implemented', evidence: '64-bit Nonce + 30s TTL Window', report: 'Replay_Guard_Log.pdf' },
    { name: 'ECDSA P-256 Authentication', status: 'Implemented', evidence: 'Secp256r1 Key Signature Check', report: 'ECDSA_Cert_Report.pdf' },
    { name: 'SHA-256 Merkle Ledger', status: 'Implemented', evidence: 'Previous Hash Binding Block #154', report: 'Audit_Ledger_Chain.pdf' },
    { name: 'Multi-Signature Quorum', status: 'Implemented', evidence: '2/2 Co-Signatures Enforced', report: 'Quorum_Policy_Matrix.pdf' },
    { name: 'Nonce Validation Engine', status: 'Implemented', evidence: 'Bloom Filter Duplicate Guard', report: 'Nonce_Guard_Report.pdf' },
    { name: 'Motion Safety Interlock', status: 'Implemented', evidence: 'ASIL-D 0 km/h Speed Check', report: 'ASIL_Motion_Interlock.pdf' },
    { name: 'Certificate Rotation Protocol', status: 'Implemented', evidence: 'CSMS Key Revocation List', report: 'Cert_Rotation_Audit.pdf' },
  ];

  const handleExportCSV = () => {
    const csvContent =
      'Control Name,Status,Evidence,Report\n' +
      securityControls.map((c) => `${c.name},${c.status},${c.evidence},${c.report}`).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'TrustRide_Compliance_Controls.csv';
    a.click();
  };

  const handleGenerateAuditPackage = () => {
    alert('Generating TrustRide Regulatory Audit Package (PDF + Merkle Hash Chain Verification Bundle)...');
  };

  return (
    <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit" className="space-y-6 font-sans">
      {/* 1. HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className={`text-[32px] font-bold tracking-tight leading-none ${isDark ? 'text-white' : 'text-[#111827]'}`}>
            Compliance Mapping & Controls
          </h1>
          <p className={`text-sm mt-2 font-normal ${isDark ? 'text-slate-400' : 'text-[#475569]'}`}>
            Automotive cybersecurity regulatory frameworks (ISO 21434, UNECE R155, ISO 26262, AIS-156)
          </p>
        </div>

        {/* COMPLIANCE SCORE BANNER */}
        <div className="flex items-center space-x-3">
          <div className="px-5 py-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-extrabold text-xs flex items-center space-x-2">
            <ShieldCheck size={18} />
            <span>Compliance Score: 98% (Ready for Audit)</span>
          </div>
        </div>
      </div>

      {/* 2. FRAMEWORK CARDS GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {frameworks.map((fw) => (
          <div
            key={fw.id}
            onClick={() => setSelectedFramework(fw)}
            className={`p-5 rounded-[16px] border shadow-xs transition-all cursor-pointer ${
              isDark ? 'bg-[#111827] border-slate-800 hover:border-blue-500' : 'bg-white border-[#E5E7EB] hover:border-blue-500'
            }`}
          >
            <div className="flex justify-between items-start mb-2">
              <span className="font-mono text-xs font-bold text-blue-500">{fw.name}</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900">
                {fw.coverage}%
              </span>
            </div>
            <h3 className={`font-bold text-xs ${isDark ? 'text-white' : 'text-[#111827]'}`}>{fw.fullName}</h3>
            <div className="mt-3 flex justify-between items-center text-[10px] text-slate-400 font-mono">
              <span>Status: {fw.status}</span>
              <span>Updated: {fw.lastUpdated}</span>
            </div>
          </div>
        ))}
      </div>

      {/* 3. SECURITY CONTROLS TABLE & ACTION BUTTONS */}
      <div className={`p-6 rounded-[16px] border shadow-xs space-y-5 transition-colors ${
        isDark ? 'bg-[#111827] border-slate-800' : 'bg-white border-[#E5E7EB]'
      }`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4 border-slate-800">
          <div className="font-bold text-sm">Automated Security Control Mapping</div>
          <div className="flex items-center space-x-2">
            <button
              onClick={handleExportCSV}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold border flex items-center space-x-1.5 transition-colors cursor-pointer ${
                isDark ? 'bg-slate-900 border-slate-800 text-slate-200 hover:bg-slate-800' : 'bg-slate-100 border-slate-200 text-slate-700'
              }`}
            >
              <FileSpreadsheet size={14} />
              <span>Export CSV</span>
            </button>
            <button
              onClick={handleGenerateAuditPackage}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs transition-colors flex items-center space-x-1.5 cursor-pointer shadow-xs"
            >
              <Package size={14} />
              <span>Generate Audit Package</span>
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className={`border-b text-[11px] font-bold uppercase tracking-wider ${
              isDark ? 'bg-slate-900/80 border-slate-800 text-slate-400' : 'bg-slate-50 border-[#E5E7EB] text-[#475569]'
            }`}>
              <tr>
                <th className="p-3.5 font-bold">Security Control</th>
                <th className="p-3.5 font-bold">Status</th>
                <th className="p-3.5 font-bold">Evidence</th>
                <th className="p-3.5 font-bold">Report</th>
                <th className="p-3.5 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className={`divide-y ${isDark ? 'divide-slate-800/60' : 'divide-[#E5E7EB]/60'}`}>
              {securityControls.map((ctrl) => (
                <tr key={ctrl.name} className={`transition-colors ${isDark ? 'hover:bg-slate-800/40' : 'hover:bg-slate-50'}`}>
                  <td className="p-3.5 font-bold">{ctrl.name}</td>
                  <td className="p-3.5">
                    <span className="px-2.5 py-1 rounded-lg text-[10px] font-semibold bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 border border-slate-800">
                      Implemented
                    </span>
                  </td>
                  <td className="p-3.5 font-mono text-[11px]">
                    <button
                      onClick={() => navigate('/app/audit')}
                      className="text-blue-400 font-bold hover:underline cursor-pointer flex items-center space-x-1"
                    >
                      <FileText size={12} />
                      <span>{ctrl.evidence} (Open Audit Block)</span>
                    </button>
                  </td>
                  <td className="p-3.5 font-mono text-blue-500">{ctrl.report}</td>
                  <td className="p-3.5 text-right">
                    <button
                      onClick={() => navigate('/app/audit')}
                      className="px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors cursor-pointer text-[10px] font-bold"
                    >
                      View Audit Block
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 4. FRAMEWORK CONTROLS MODAL */}
      <AnimatePresence>
        {selectedFramework && (
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
                  <span>{selectedFramework.name} — Control Mapping</span>
                </div>
                <button onClick={() => setSelectedFramework(null)} className="text-slate-400 hover:text-white cursor-pointer">
                  <X size={18} />
                </button>
              </div>

              <div className="space-y-3">
                <div className="font-bold text-xs text-slate-400">{selectedFramework.fullName}</div>
                {selectedFramework.controls.map((c, i) => (
                  <div key={i} className="p-3 rounded-xl bg-slate-900 border border-slate-800 font-mono flex justify-between items-center text-xs">
                    <div>
                      <div className="font-bold text-white">{c.name}</div>
                      <div className="text-[10px] text-slate-400">{c.evidence}</div>
                    </div>
                    <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold rounded-full">
                      Implemented
                    </span>
                  </div>
                ))}
              </div>

              <div className="pt-3 flex justify-end border-t border-slate-800">
                <button
                  onClick={() => setSelectedFramework(null)}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs transition-colors cursor-pointer"
                >
                  Close Framework
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default CompliancePage;
