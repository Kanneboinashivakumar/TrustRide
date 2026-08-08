import { motion } from 'framer-motion';
// @ts-ignore
import { pageVariants } from '@/motion/variants';
// @ts-ignore
import { PageHeader } from '@/components/layout/page-header';
import { Bell, CheckCircle2, ShieldAlert } from 'lucide-react';

export function NotificationsPage() {
  return (
    <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit" className="p-6 space-y-6">
      <PageHeader title="Security Notifications" description="Real-time alerts for command dispatches and security events" />
      
      <div className="bg-white border rounded-lg p-5">
        <div className="space-y-4">
          <div className="flex items-start space-x-3 text-xs border-b pb-3">
            <ShieldAlert className="text-amber-500 shrink-0 mt-0.5" size={18} />
            <div>
              <h4 className="font-bold text-slate-900">GPS Spoofing Alert</h4>
              <p className="text-slate-500 mt-0.5">GPS Spoofing detected on Vehicle V-1002 (Mahindra Treo). Fallback location sensors activated.</p>
              <span className="text-[10px] text-slate-400 mt-1 block">15 minutes ago</span>
            </div>
          </div>
          <div className="flex items-start space-x-3 text-xs border-b pb-3">
            <CheckCircle2 className="text-emerald-500 shrink-0 mt-0.5" size={18} />
            <div>
              <h4 className="font-bold text-slate-900">Immobilization Command Executed</h4>
              <p className="text-slate-500 mt-0.5">Immobilization command CMD-8821 was executed on Sargam Electric Rickshaw at 0 km/h in Park state.</p>
              <span className="text-[10px] text-slate-400 mt-1 block">45 minutes ago</span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default NotificationsPage;
