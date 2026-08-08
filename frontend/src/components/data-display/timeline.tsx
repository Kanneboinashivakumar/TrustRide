import React from 'react';
import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/utils/cn';
import { staggerContainer, fadeUp } from '@/motion/variants';

export interface TimelineItem {
  id: string | number;
  icon: LucideIcon;
  title: string;
  description: string;
  timestamp: string;
  status?: 'success' | 'warning' | 'danger' | 'info' | 'neutral';
}

export interface TimelineProps {
  items: TimelineItem[];
  className?: string;
}

const statusColors = {
  success: 'bg-emerald-100 text-emerald-600',
  warning: 'bg-amber-100 text-amber-600',
  danger: 'bg-rose-100 text-rose-600',
  info: 'bg-blue-100 text-blue-600',
  neutral: 'bg-slate-100 text-slate-600'
};

export const Timeline: React.FC<TimelineProps> = ({ items, className }) => {
  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className={cn("flex flex-col", className)}
    >
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        const colorClass = statusColors[item.status || 'neutral'];
        
        return (
          <motion.div key={item.id} variants={fadeUp} className="relative flex gap-4">
            {/* Connecting Line */}
            {!isLast && (
              <div className="absolute left-4 top-10 bottom-[-16px] w-px bg-slate-200" />
            )}
            
            {/* Icon */}
            <div className="relative z-10 flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full border border-white shadow-sm bg-white mt-1">
              <div className={cn("w-full h-full rounded-full flex items-center justify-center", colorClass)}>
                <item.icon className="w-4 h-4" />
              </div>
            </div>
            
            {/* Content */}
            <div className="flex-1 pb-8">
              <div className="flex items-baseline justify-between gap-4">
                <h4 className="text-sm font-medium text-slate-900">{item.title}</h4>
                <span className="text-xs text-slate-500 whitespace-nowrap">{item.timestamp}</span>
              </div>
              <p className="mt-1 text-sm text-slate-600">{item.description}</p>
            </div>
          </motion.div>
        );
      })}
    </motion.div>
  );
};
