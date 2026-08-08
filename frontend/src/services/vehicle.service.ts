import { mockVehicles, mockFleetStats, mockTelemetryHistory, mockDocuments, mockInsurance, mockLoanDetails, mockOwnerDetails } from '@/data/mock-vehicles';
import type { Vehicle, FleetStats, VehicleTelemetry, VehicleDocument, InsuranceDetails, LoanDetails, OwnerDetails } from '@/types/vehicle';

const API_BASE = 'http://localhost:4000/api';

async function fetchJson<T>(url: string, fallback: T): Promise<T> {
  try {
    const res = await fetch(url);
    if (!res.ok) return fallback;
    return (await res.json()) as T;
  } catch {
    return fallback;
  }
}

export const vehicleService = {
  async getAll(): Promise<Vehicle[]> {
    return fetchJson<Vehicle[]>(`${API_BASE}/vehicles`, mockVehicles);
  },
  async getById(id: string): Promise<Vehicle | undefined> {
    const vehicles = await this.getAll();
    return vehicles.find(v => v.id === id || (v as any).vehicleId === id);
  },
  async getFleetStats(): Promise<FleetStats> {
    return fetchJson<FleetStats>(`${API_BASE}/vehicles/stats/fleet`, mockFleetStats);
  },
  async getTelemetry(vehicleId: string): Promise<VehicleTelemetry[]> {
    return fetchJson<VehicleTelemetry[]>(`${API_BASE}/vehicles/${vehicleId}/telemetry`, mockTelemetryHistory);
  },
  async getDocuments(vehicleId: string): Promise<VehicleDocument[]> {
    return fetchJson<VehicleDocument[]>(`${API_BASE}/vehicles/${vehicleId}/documents`, mockDocuments);
  },
  async getInsurance(vehicleId: string): Promise<InsuranceDetails> {
    return fetchJson<InsuranceDetails>(`${API_BASE}/vehicles/${vehicleId}/insurance`, mockInsurance);
  },
  async getLoanDetails(vehicleId: string): Promise<LoanDetails> {
    return fetchJson<LoanDetails>(`${API_BASE}/vehicles/${vehicleId}/loan`, mockLoanDetails);
  },
  async getOwnerDetails(vehicleId: string): Promise<OwnerDetails> {
    return fetchJson<OwnerDetails>(`${API_BASE}/vehicles/${vehicleId}/owner`, mockOwnerDetails);
  },
  async search(query: string): Promise<Vehicle[]> {
    const vehicles = await this.getAll();
    const q = query.toLowerCase();
    return vehicles.filter(v => 
      (v.make || '').toLowerCase().includes(q) || 
      (v.model || '').toLowerCase().includes(q) || 
      (v.vin || '').toLowerCase().includes(q) ||
      (v.licensePlate || '').toLowerCase().includes(q)
    );
  },
};
