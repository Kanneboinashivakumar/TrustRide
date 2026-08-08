import React, { useState } from 'react';
import { cn } from '@/utils/cn';

export interface ChartCardProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  period?: boolean;
  className?: string;
}

export const ChartCard: React.FC<ChartCardProps> = ({
  title,
  description,
  children,
  period = true,
  className
}) => {
  const [activePeriod, setActivePeriod] = useState('7d');
  const periods = [
    { label: '24h', value: '24h' },
    { label: '7d', value: '7d' },
    { label: '30d', value: '30d' },
    { label: '90d', value: '90d' },
    { label: '1y', value: '1y' }
  ];

  return (
    <div className={cn("rounded-xl border border-slate-200 bg-white p-6 shadow-sm", className)}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h3 className="text-base font-semibold text-slate-900">{title}</h3>
          {description && <p className="text-sm text-slate-500 mt-1">{description}</p>}
        </div>
        
        {period && (
          <div className="flex items-center gap-1 p-1 bg-slate-50 border border-slate-200 rounded-lg">
            {periods.map(p => (
              <button
                key={p.value}
                onClick={() => setActivePeriod(p.value)}
                className={cn(
                  "px-3 py-1 text-xs font-medium rounded-md transition-colors",
                  activePeriod === p.value
                    ? "bg-white text-slate-900 shadow-sm border border-slate-200/50"
                    : "text-slate-500 hover:text-slate-700 hover:bg-slate-100"
                )}
              >
                {p.label}
              </button>
            ))}
          </div>
        )}
      </div>
      
      <div className="w-full">
        {children}
      </div>
    </div>
  );
};
