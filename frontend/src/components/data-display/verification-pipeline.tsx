import React from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, Clock, RotateCcw, UserCheck, Activity, Cpu, FileCheck, Check, X, Loader2, Circle } from 'lucide-react';
import { cn } from '@/utils/cn';
import { VerificationStage } from '@/types/command';

export interface VerificationPipelineProps {
  stages: VerificationStage[];
  animated?: boolean;
  compact?: boolean;
  className?: string;
}

const getStageIcon = (type: string) => {
  switch (type) {
    case 'security': return ShieldCheck;
    case 'timing': return Clock;
    case 'replay': return RotateCcw;
    case 'auth': return UserCheck;
    case 'telemetry': return Activity;
    case 'hardware': return Cpu;
    case 'compliance': return FileCheck;
    default: return ShieldCheck;
  }
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'passed': return Check;
    case 'failed': return X;
    case 'running': return Loader2;
    default: return Circle;
  }
};

const pipelineVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: (custom: number) => ({
    opacity: 1,
    scale: 1,
    transition: { delay: custom * 0.1, duration: 0.3 }
  })
};

export const VerificationPipeline: React.FC<VerificationPipelineProps> = ({
  stages,
  animated = true,
  compact = false,
  className
}) => {
  return (
    <div className={cn("w-full overflow-x-auto pb-4", className)}>
      <div className={cn(
        "flex flex-col sm:flex-row items-start sm:items-center min-w-max",
        compact ? "gap-2" : "gap-4"
      )}>
        {stages.map((stage, index) => {
          const StageIcon = getStageIcon(stage.type || '');
          const StatusIcon = getStatusIcon(stage.status);
          const isLast = index === stages.length - 1;
          const isRunning = stage.status === 'running';

          return (
            <React.Fragment key={stage.id}>
              <motion.div
                custom={index}
                variants={animated ? pipelineVariants : undefined}
                initial="hidden"
                animate="visible"
                className={cn(
                  "flex items-center gap-3 p-3 rounded-xl border bg-white shadow-sm transition-colors",
                  compact ? "px-3 py-2" : "px-4 py-3",
                  stage.status === 'passed' ? "border-emerald-200 bg-emerald-50/30" : "",
                  stage.status === 'failed' ? "border-rose-200 bg-rose-50/30" : "",
                  stage.status === 'running' ? "border-blue-200 bg-blue-50/30 shadow-md ring-1 ring-blue-100" : "",
                  stage.status === 'pending' ? "border-slate-200 opacity-60" : ""
                )}
              >
                {/* Status Indicator */}
                <div className={cn(
                  "flex items-center justify-center w-6 h-6 rounded-full",
                  stage.status === 'passed' ? "bg-emerald-100 text-emerald-600" : "",
                  stage.status === 'failed' ? "bg-rose-100 text-rose-600" : "",
                  stage.status === 'running' ? "bg-blue-100 text-blue-600" : "",
                  stage.status === 'pending' ? "bg-slate-100 text-slate-400" : ""
                )}>
                  <StatusIcon className={cn(
                    "w-3.5 h-3.5",
                    isRunning ? "animate-spin" : ""
                  )} />
                </div>
                
                {/* Stage Info */}
                <div className="flex items-center gap-2">
                  <StageIcon className="w-4 h-4 text-slate-500" />
                  <span className="text-sm font-medium text-slate-700 whitespace-nowrap">
                    {stage.label || stage.name}
                  </span>
                </div>
              </motion.div>
              
              {/* Connector */}
              {!isLast && (
                <div className="hidden sm:block h-px w-8 bg-slate-200 flex-shrink-0" />
              )}
              {!isLast && (
                <div className="sm:hidden w-px h-6 bg-slate-200 ml-6 flex-shrink-0" />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};
