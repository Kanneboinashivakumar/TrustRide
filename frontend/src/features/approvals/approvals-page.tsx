import { motion } from 'framer-motion';
// @ts-ignore
import { pageVariants } from '@/motion/variants';
// @ts-ignore
import { PageHeader } from '@/components/layout/page-header';
import { Clock, Check, X, ShieldAlert } from 'lucide-react';

export function ApprovalsPage() {
  const evModels = [
    'Sargam Electric Rickshaw (MH-12-ER-1001)',
    'Mahindra Treo (KA-01-TR-2002)',
    'Piaggio Ape E-City (DL-01-AP-3003)',
    'Euler HiLoad EV (HR-26-EU-4004)',
  ];

  return (
    <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit" className="p-6 space-y-6">
      <PageHeader title="Approval Center" description="Review multi-signature authorization requests for high-risk commands" />
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 bg-white rounded-lg border shadow-xs"><div className="text-xs text-slate-500 font-medium">Pending Approvals</div><div className="text-xl font-bold text-amber-600">1 Request</div></div>
        <div className="p-4 bg-white rounded-lg border shadow-xs"><div className="text-xs text-slate-500 font-medium">Approved Today</div><div className="text-xl font-bold text-emerald-600">12 Requests</div></div>
        <div className="p-4 bg-white rounded-lg border shadow-xs"><div className="text-xs text-slate-500 font-medium">Rejected Today</div><div className="text-xl font-bold text-rose-600">2 Requests</div></div>
      </div>

      <div className="flex space-x-1 border-b border-slate-200">
        {['Pending', 'Approved', 'Rejected', 'All'].map((tab, i) => (
          <button key={tab} className={"px-4 py-2 text-xs font-semibold uppercase tracking-wider " + (i === 0 ? "border-b-2 border-blue-600 text-blue-600" : "text-slate-500 hover:text-slate-700")}>
            {tab}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {evModels.map((vehicle, i) => (
          <div key={i} className="bg-white border rounded-lg p-5 flex items-start justify-between">
            <div className="space-y-2">
              <div className="flex items-center space-x-3">
                <span className="px-2 py-1 bg-amber-50 text-amber-700 border border-amber-200 rounded text-xs font-semibold flex items-center"><ShieldAlert size={14} className="mr-1"/> High Urgency</span>
                <h3 className="font-bold text-slate-900 text-sm">Remote Immobilization</h3>
                <span className="text-xs font-mono text-slate-400">CMD-882{i + 1}</span>
              </div>
              <div className="text-xs text-slate-600 font-medium">Target EV: {vehicle}</div>
              <div className="text-xs text-slate-500">Requested by: Sarah Kim (Security Admin) — Court Order #8821</div>
              <div className="flex items-center space-x-2 pt-2">
                <div className="text-xs font-semibold text-slate-700">Quorum Signatures:</div>
                <div className="flex space-x-1">
                  <div className="w-5 h-5 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center text-xs"><Check size={12}/></div>
                  <div className="w-5 h-5 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center text-xs"><Clock size={12}/></div>
                </div>
                <span className="text-xs text-slate-400 font-mono">(1/2 required)</span>
              </div>
            </div>
            <div className="flex space-x-2">
              <button className="px-3 py-1.5 bg-rose-50 text-rose-600 hover:bg-rose-100 rounded-lg text-xs font-semibold transition-colors flex items-center"><X size={14} className="mr-1"/> Reject</button>
              <button className="px-3 py-1.5 bg-emerald-600 text-white hover:bg-emerald-700 rounded-lg text-xs font-semibold transition-colors flex items-center"><Check size={14} className="mr-1"/> Sign & Approve</button>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

export default ApprovalsPage;
