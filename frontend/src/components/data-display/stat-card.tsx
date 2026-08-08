import { forwardRef } from 'react';
import { motion } from 'framer-motion';
import { LucideIcon, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { cn } from '@/utils/cn';
import { fadeUp } from '@/motion/variants';
import { useAnimatedCounter } from '@/hooks/use-animated-counter';

export interface StatCardProps {
  title: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  icon: LucideIcon;
  trend?: 'up' | 'down' | 'neutral';
  loading?: boolean;
  className?: string;
}

export const StatCard = forwardRef<HTMLDivElement, StatCardProps>(
  ({ title, value, change, changeLabel, icon: Icon, trend = 'neutral', loading = false, className }, ref) => {
    const numericValue = typeof value === 'number' ? value : parseFloat(value as string) || 0;
    const isNumeric = typeof value === 'number' || !isNaN(parseFloat(value as string));
    const animatedValue = useAnimatedCounter(isNumeric ? numericValue : 0, 1000);

    const displayValue = isNumeric 
      ? animatedValue 
      : value;

    if (loading) {
      return (
        <div className={cn("p-6 rounded-xl border border-slate-200 bg-white shadow-sm flex flex-col gap-4", className)}>
          <div className="flex justify-between items-start">
            <div className="h-5 w-24 bg-slate-100 rounded animate-pulse" />
            <div className="h-10 w-10 bg-slate-100 rounded-full animate-pulse" />
          </div>
          <div className="space-y-2">
            <div className="h-8 w-32 bg-slate-100 rounded animate-pulse" />
            <div className="h-4 w-40 bg-slate-100 rounded animate-pulse" />
          </div>
        </div>
      );
    }

    return (
      <motion.div
        ref={ref}
        variants={fadeUp}
        initial="hidden"
        animate="visible"
        whileHover={{ y: -1 }}
        className={cn(
          "p-6 rounded-xl border border-slate-200 bg-white shadow-sm transition-all duration-200 hover:shadow-md",
          className
        )}
      >
        <div className="flex justify-between items-start">
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <div className="p-2 bg-slate-50 rounded-full">
            <Icon className="w-5 h-5 text-slate-600" />
          </div>
        </div>
        
        <div className="mt-4">
          <h3 className="text-2xl font-semibold text-slate-900">
            {isNumeric && typeof value === 'string' && value.includes('%') 
              ? `${displayValue}%` 
              : displayValue}
          </h3>
          
          {(change !== undefined || changeLabel) && (
            <div className="flex items-center gap-2 mt-2">
              {trend === 'up' && <TrendingUp className="w-4 h-4 text-emerald-500" />}
              {trend === 'down' && <TrendingDown className="w-4 h-4 text-rose-500" />}
              {trend === 'neutral' && <Minus className="w-4 h-4 text-slate-400" />}
              
              <span className={cn(
                "text-sm font-medium",
                trend === 'up' ? "text-emerald-600" : "",
                trend === 'down' ? "text-rose-600" : "",
                trend === 'neutral' ? "text-slate-500" : ""
              )}>
                {change !== undefined && `${change > 0 ? '+' : ''}${change}%`}
              </span>
              
              {changeLabel && (
                <span className="text-sm text-slate-500">{changeLabel}</span>
              )}
            </div>
          )}
        </div>
      </motion.div>
    );
  }
);
StatCard.displayName = 'StatCard';
