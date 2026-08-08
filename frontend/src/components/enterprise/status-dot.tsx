import React from 'react';
import { cn } from '@/utils/cn';

export type StatusType = 'online' | 'active' | 'offline' | 'warning' | 'danger' | 'pending' | 'idle';

export interface StatusDotProps {
  status: StatusType;
  size?: 'sm' | 'md' | 'lg';
  pulse?: boolean;
  className?: string;
}

const statusConfig: Record<StatusType, string> = {
  online: 'bg-emerald-500',
  active: 'bg-emerald-500',
  offline: 'bg-rose-500',
  danger: 'bg-rose-500',
  warning: 'bg-amber-500',
  pending: 'bg-purple-500',
  idle: 'bg-slate-400',
};

const sizeConfig = {
  sm: 'w-1.5 h-1.5',
  md: 'w-2 h-2',
  lg: 'w-3 h-3',
};

export const StatusDot: React.FC<StatusDotProps> = ({ 
  status, 
  size = 'md', 
  pulse = false,
  className 
}) => {
  const colorClass = statusConfig[status] || statusConfig.idle;
  const sizeClass = sizeConfig[size];

  return (
    <div className={cn("relative flex items-center justify-center", sizeClass, className)}>
      {pulse && (
        <span className={cn(
          "absolute inline-flex h-full w-full rounded-full opacity-75 animate-ping",
          colorClass
        )} />
      )}
      <span className={cn(
        "relative inline-flex rounded-full w-full h-full",
        colorClass
      )} />
    </div>
  );
};
