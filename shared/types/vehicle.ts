export type VehicleStatus = 'active' | 'idle' | 'charging' | 'maintenance' | 'disabled' | 'offline';
export type VehicleType = 'rickshaw' | 'haul' | 'cargo' | 'passenger' | 'van';

export interface Location {
  lat: number;
  lng: number;
  address: string;
}

export interface DriverInfo {
  id: string;
  name: string;
  avatar: string;
  phone?: string;
}

export interface Vehicle {
  id: string;
  vin: string;
  make: string;
  model: string;
  year: number;
  type: VehicleType;
  status: VehicleStatus;
  licensePlate: string;
  color: string;
  batteryLevel: number;
  batteryHealth: number;
  range: number;
  location: Location;
  speed: number;
  isMoving: boolean;
  lastSeen: string;
  driver: DriverInfo;
  fleet: string;
  organization: string;
  securityScore?: number;
  threatCount: number;
  commandCount: number;
  mileage: number;
  firmware: string;
  connectivity: 'online' | 'offline' | 'degraded';
  immobilized?: boolean;
}

export interface VehicleTelemetry {
  vehicleId: string;
  timestamp: string;
  speed: number;
  batteryLevel: number;
  temperature: number;
  location: Location;
  heading: number;
  altitude: number;
  signalStrength: number;
  motorTemp: number;
  tirePressure: number[];
}

export interface VehicleDocument {
  id: string;
  type: string;
  name: string;
  issueDate: string;
  expiryDate: string;
  status: 'valid' | 'expired' | 'pending';
}

export interface InsuranceDetails {
  provider: string;
  policyNumber: string;
  coverage: string;
  premium: number;
  startDate: string;
  endDate: string;
  status: 'active' | 'expiring_soon' | 'expired';
}

export interface LoanDetails {
  lender: string;
  accountNumber: string;
  principal: number;
  outstanding: number;
  emi: number;
  tenure: number;
  startDate: string;
  nextPayment: string;
  status: 'current' | 'overdue' | 'settled';
}

export interface OwnerDetails {
  id: string;
  name: string;
  email: string;
  phone: string;
  organization: string;
  address: string;
}

export interface FleetStats {
  total: number;
  active: number;
  idle: number;
  charging: number;
  maintenance: number;
  disabled: number;
  offline: number;
  avgBattery: number;
  avgSecurityScore: number;
  totalMileage: number;
}
