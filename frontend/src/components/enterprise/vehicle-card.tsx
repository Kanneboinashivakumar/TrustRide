import React from 'react';
import { MapPin, Zap, User } from 'lucide-react';
import { cn } from '@/utils/cn';
import { Vehicle } from '@/types/vehicle';
import { StatusDot } from './status-dot';

export interface VehicleCardProps {
  vehicle: Vehicle;
  onClick?: (vehicle: Vehicle) => void;
  className?: string;
}

export const VehicleCard: React.FC<VehicleCardProps> = ({ vehicle, onClick, className }) => {
  const getBatteryColor = (level: number) => {
    if (level > 60) return 'bg-emerald-500';
    if (level > 20) return 'bg-amber-500';
    return 'bg-rose-500';
  };

  const battery = vehicle.batteryLevel ?? vehicle.telemetry?.batteryLevel ?? 0;
  const speed = vehicle.speed ?? vehicle.telemetry?.speed ?? 0;

  return (
    <div 
      onClick={() => onClick?.(vehicle)}
      className={cn(
        "bg-[var(--color-card)] rounded-xl border border-[var(--color-border)] p-5 shadow-xs transition-all duration-200 hover:-translate-y-[1px] hover:shadow-md",
        onClick ? "cursor-pointer" : "",
        className
      )}
    >
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="font-semibold text-[var(--color-foreground)]">{vehicle.make} {vehicle.model}</h3>
          <p className="text-xs text-[var(--color-muted-foreground)] mt-0.5 font-mono">{vehicle.vin}</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-[var(--color-muted-foreground)] capitalize">{vehicle.status}</span>
          <StatusDot 
            status={vehicle.status as any} 
            pulse={vehicle.status === 'active'} 
          />
        </div>
      </div>
      
      <div className="space-y-4 mt-6">
        {/* Battery */}
        <div>
          <div className="flex justify-between text-xs mb-1.5">
            <span className="text-[var(--color-muted-foreground)] flex items-center gap-1"><Zap className="w-3.5 h-3.5" /> Battery</span>
            <span className="font-medium">{battery}%</span>
          </div>
          <div className="h-1.5 w-full bg-[var(--color-muted)] rounded-full overflow-hidden">
            <div 
              className={cn("h-full rounded-full transition-all duration-500", getBatteryColor(battery))}
              style={{ width: `${battery}%` }}
            />
          </div>
        </div>
        
        {/* Details Grid */}
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="flex flex-col gap-1">
            <span className="text-[var(--color-muted-foreground)] flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> Location</span>
            <span className="font-medium text-[var(--color-foreground)] truncate">
              {vehicle.location?.address || 'Unknown'}
            </span>
          </div>
          
          <div className="flex flex-col gap-1">
            <span className="text-[var(--color-muted-foreground)] flex items-center gap-1"><User className="w-3.5 h-3.5" /> Driver</span>
            <span className="font-medium text-[var(--color-foreground)] truncate">
              {vehicle.driver?.name || 'Unassigned'}
            </span>
          </div>
        </div>
      </div>
      
      <div className="mt-4 pt-4 border-t border-[var(--color-border)] flex justify-between items-center text-[11px] text-[var(--color-muted-foreground)]">
        <span>Speed: {speed} km/h</span>
        <span>Last seen: {new Date(vehicle.lastSeen || Date.now()).toLocaleTimeString()}</span>
      </div>
    </div>
  );
};
