import { Outlet } from 'react-router-dom';
import { Zap } from 'lucide-react';
import { motion } from 'framer-motion';
import { fadeIn } from '@/motion/variants';

export function AuthLayout() {
  return (
    <div className="min-h-screen flex bg-slate-100 text-slate-900 font-sans">
      {/* Left panel - branding */}
      <div className="hidden lg:flex lg:w-1/2 items-center justify-center bg-blue-600 relative overflow-hidden">
        <div className="relative z-10 text-center text-white px-12">
          <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-white/20 mx-auto mb-6 shadow-inner">
            <Zap size={32} />
          </div>
          <h1 className="text-4xl font-extrabold mb-3 tracking-tight">TrustRide</h1>
          <p className="text-sm font-mono text-blue-100 max-w-md">
            Zero-Trust Secure Remote Command Platform for Commercial EVs
          </p>
        </div>
        {/* Subtle background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-72 h-72 border border-white rounded-full" />
          <div className="absolute bottom-20 right-20 w-96 h-96 border border-white rounded-full" />
          <div className="absolute top-1/2 left-1/3 w-48 h-48 border border-white rounded-full" />
        </div>
      </div>

      {/* Right panel - auth form */}
      <motion.div
        variants={fadeIn}
        initial="initial"
        animate="animate"
        className="flex-1 flex items-center justify-center p-6 bg-slate-100"
      >
        <div className="w-full max-w-md">
          <Outlet />
        </div>
      </motion.div>
    </div>
  );
}
