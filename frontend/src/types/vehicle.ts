export type VehicleStatus = 'active' | 'idle' | 'charging' | 'maintenance' | 'disabled' | 'offline';
export type VehicleType = 'sedan' | 'suv' | 'truck' | 'van' | 'bus';
export type ViewMode = 'table' | 'grid' | 'map';

export interface Vehicle {
  id: string;
  vin: string;
  make: string;
  model: string;
  year: number;
  type?: VehicleType;
  status: VehicleStatus;
  licensePlate: string;
  color?: string;
  batteryLevel: number;
  batteryHealth?: number;
  range: number;
  location: {
    lat: number;
    lng: number;
    address: string;
  };
  speed: number;
  isMoving?: boolean;
  lastSeen?: string;
  lastUpdated?: string;
  driver?: {
    id: string;
    name: string;
    avatar?: string;
  };
  fleet?: string;
  organization?: string;
  securityScore?: number;
  threatCount: number;
  commandCount?: number;
  mileage: number;
  firmware?: string;
  firmwareVersion?: string;
  connectivity?: string;
  telemetry?: VehicleTelemetry;
}

export interface VehicleTelemetry {
  vehicleId?: string;
  timestamp: string;
  speed: number;
  batteryLevel: number;
  temperature: number;
  location: { lat: number; lng: number };
  heading?: number;
  altitude?: number;
  signalStrength?: number;
  motorTemp?: number;
  tirePressure?: number[];
  energyConsumption?: number;
}

export interface VehicleDocument {
  id: string;
  type: string;
  name: string;
  issueDate?: string;
  expiryDate: string;
  status: 'valid' | 'expired' | 'pending';
  url?: string;
}

export interface InsuranceDetails {
  provider: string;
  policyNumber: string;
  coverage?: string;
  coverageType?: string;
  premium: string | number;
  startDate?: string;
  validFrom?: string;
  validUntil?: string;
  endDate?: string;
  status: 'active' | 'expired' | 'pending';
}

export interface LoanDetails {
  lender?: string;
  financier?: string;
  accountNumber: string;
  principal?: number;
  principalAmount?: number;
  outstanding?: number;
  remainingAmount?: number;
  emi?: number;
  monthlyEMI?: number;
  tenure?: string;
  startDate?: string;
  nextPayment?: string;
  nextDueDate?: string;
  defaultRisk?: string;
  status: 'current' | 'default' | 'paid' | 'good_standing';
}

export interface OwnerDetails {
  id?: string;
  name: string;
  email: string;
  phone?: string;
  organization?: string;
  address: string;
  contactNumber?: string;
  type?: string;
}

export interface FleetStats {
  total?: number;
  totalVehicles?: number;
  active?: number;
  activeVehicles?: number;
  idle?: number;
  idleVehicles?: number;
  charging?: number;
  chargingVehicles?: number;
  maintenance?: number;
  maintenanceVehicles?: number;
  disabled?: number;
  offline?: number;
  offlineVehicles?: number;
  avgBattery?: number;
  averageBatteryLevel?: number;
  avgSecurityScore?: number;
  totalMileage?: number;
  criticalAlerts?: number;
}
