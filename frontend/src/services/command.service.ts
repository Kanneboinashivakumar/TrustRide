import { mockCommands } from '@/data/mock-commands';
import type { Command } from '@/types/command';

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

export const commandService = {
  async getAll(): Promise<Command[]> {
    return fetchJson<Command[]>(`${API_BASE}/commands`, mockCommands);
  },
  async getById(id: string): Promise<Command | undefined> {
    const commands = await this.getAll();
    return commands.find(c => c.id === id);
  },
  async getByVehicle(vehicleId: string): Promise<Command[]> {
    const commands = await this.getAll();
    return commands.filter(c => c.vehicleId === vehicleId);
  },
  async getPending(): Promise<Command[]> {
    const commands = await this.getAll();
    return commands.filter(c => c.status === 'pending_approval');
  },
  async create(data: Partial<Command>): Promise<Command> {
    try {
      const res = await fetch(`${API_BASE}/commands`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vehicleId: data.vehicleId || 'TR-101',
          action: data.type === 'immobilize' || !data.type ? 'IMMOBILIZE' : 'CANCEL',
          reasonCode: 'loan_default',
          reasonText: data.justification || 'Emergency immobilization requested via dashboard',
          issuerId: 'fin-001'
        })
      });
      if (res.ok) {
        const created = await res.json();
        return {
          id: created.command?.commandId || `CMD-${Math.floor(Math.random() * 9000) + 1000}`,
          vehicleId: data.vehicleId || 'TR-101',
          vehicleName: data.vehicleName || 'Sargam Electric Rickshaw',
          type: data.type || 'immobilize',
          status: created.status === 'EXECUTED' ? 'completed' : created.status === 'HELD' ? 'dispatched' : 'pending_approval',
          requestedBy: 'TrustRide Finance (fin-001)',
          justification: data.justification || 'Emergency request',
          legalBasis: data.legalBasis || 'Court Order #882',
          riskLevel: data.riskLevel || 'critical',
          affectedSystems: ['Drivetrain', 'Ignition'],
          driverImpact: 'Vehicle will be immobilized safely at 0 km/h',
          createdAt: new Date().toISOString(),
          approvers: [{ id: 'fin-001', name: 'TrustRide Finance', role: 'Financier', status: 'approved' }],
          verificationStages: [],
          auditHash: created.command?.priorCommandHash || `0x${Math.random().toString(16).slice(2)}`,
        };
      }
    } catch {
      // Fallback to local mock array if server offline
    }

    const newCmd: Command = {
      id: `CMD-${Math.floor(Math.random() * 9000) + 1000}`,
      vehicleId: data.vehicleId || 'V-1001',
      vehicleName: data.vehicleName || 'Sargam Electric Rickshaw',
      type: data.type || 'immobilize',
      status: 'pending_approval',
      requestedBy: 'Sarah Kim (Admin)',
      justification: data.justification || 'Emergency request',
      legalBasis: data.legalBasis || 'Court Order #882',
      riskLevel: data.riskLevel || 'critical',
      affectedSystems: data.affectedSystems || ['Drivetrain', 'Ignition'],
      driverImpact: data.driverImpact || 'Vehicle will be immobilized safely at 0 km/h',
      createdAt: new Date().toISOString(),
      approvers: [],
      verificationStages: [],
      auditHash: `0x${Math.random().toString(16).slice(2)}`,
    };
    mockCommands.unshift(newCmd);
    return newCmd;
  },
};
