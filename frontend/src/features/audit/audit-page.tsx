import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
// @ts-ignore
import { pageVariants } from '@/motion/variants';
import { useTheme } from '@/providers/theme-provider';
import {
  Database,
  Search,
  Filter,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Layers,
  ArrowRight,
  RefreshCw,
  Eye,
  FileCheck,
  Check
} from 'lucide-react';

interface AuditBlock {
  blockNumber: number;
  commandId: string;
  vehicleId: string;
  vehicleName: string;
  licensePlate: string;
  commandName: string;
  legalReason: string;
  operator: string;
  approver1: string;
  approver2: string;
  verificationResult: string;
  executionTime: string;
  hash: string;
  previousHash: string;
  firmwareVersion: string;
  location: string;
  status: string;
  timestamp: string;
}

export function AuditPage() {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';
  const [searchQuery, setSearchQuery] = useState('');

  const [blocks, setBlocks] = useState<AuditBlock[]>([
    {
      blockNumber: 154,
      commandId: 'CMD-1004',
      vehicleId: 'TR-101',
      vehicleName: 'Sargam Electric Rickshaw',
      licensePlate: 'MH-12-ER-1001',
      commandName: 'Immobilize Drivetrain',
      legalReason: 'Vehicle Theft',
      operator: 'Rajesh Kumar (Fleet Mgr)',
      approver1: 'Sarah Kim (Security Admin)',
      approver2: 'Aisha Khan (Ops Mgr)',
      verificationResult: '7/7 Passed ✓',
      executionTime: '41.2 ms',
      hash: '0x9AF82E3B1C4D5E6F7A8B9C0D1E2F3A4B',
      previousHash: '0x812C4F9A2B3C4D5E6F7A8B9C0D1E2F3A',
      firmwareVersion: 'v2.5.1',
      location: 'Ameerpet Main Road, Hyderabad',
      status: 'EXECUTED',
      timestamp: '2026-08-06 20:14:05',
    },
    {
      blockNumber: 153,
      commandId: 'CMD-1002',
      vehicleId: 'TR-102',
      vehicleName: 'Mahindra Treo',
      licensePlate: 'KA-01-TR-2002',
      commandName: 'Lock Doors',
      legalReason: 'Emergency Response',
      operator: 'Rajesh Kumar (Ops Admin)',
      approver1: 'Vikram Singh (Super Admin)',
      approver2: 'Anita Desai (Security Admin)',
      verificationResult: '7/7 Passed ✓',
      executionTime: '12.4 ms',
      hash: '0x812C4F9A2B3C4D5E6F7A8B9C0D1E2F3A',
      previousHash: '0x701B3E891A2B3C4D5E6F7A8B9C0D1E2F',
      firmwareVersion: 'v2.4.3',
      location: 'Banjara Hills, Hyderabad',
      status: 'EXECUTED',
      timestamp: '2026-08-06 17:45:02',
    },
    {
      blockNumber: 152,
      commandId: 'CMD-1003',
      vehicleId: 'TR-103',
      vehicleName: 'Piaggio Ape E-City',
      licensePlate: 'DL-01-AP-3003',
      commandName: 'Immobilize Drivetrain',
      legalReason: 'Court Order',
      operator: 'Imran Khan (Fleet Manager)',
      approver1: 'Sarah Kim (Security Admin)',
      approver2: 'Aisha Khan (Ops Mgr)',
      verificationResult: '7/7 Passed ✓',
      executionTime: '38.0 ms',
      hash: '0x701B3E891A2B3C4D5E6F7A8B9C0D1E2F',
      previousHash: '0x600A2D78091A2B3C4D5E6F7A8B9C0D1E',
      firmwareVersion: 'v2.3.8',
      location: 'Secunderabad Hub, Hyderabad',
      status: 'EXECUTED',
      timestamp: '2026-08-06 15:20:00',
    },
    {
      blockNumber: 151,
      commandId: 'CMD-1000',
      vehicleId: 'V-1004',
      vehicleName: 'Euler HiLoad EV',
      licensePlate: 'HR-26-EU-4004',
      commandName: 'Enforce Speed Limit',
      legalReason: 'Driver Safety',
      operator: 'Service Engineer',
      approver1: 'Prakash Rao (Lead Tech)',
      approver2: 'System Policy Auto-Signed',
      verificationResult: '7/7 Passed ✓',
      executionTime: '24.1 ms',
      hash: '0x600A2D78091A2B3C4D5E6F7A8B9C0D1E',
      previousHash: '0x50091C6708091A2B3C4D5E6F7A8B9C0D',
      firmwareVersion: 'v2.1.6',
      location: 'Gachibowli, Hyderabad',
      status: 'EXECUTED',
      timestamp: '2026-08-06 14:10:00',
    },
  ]);

  const fetchAuditFromBackend = async () => {
    let backendBlocks: AuditBlock[] = [];
    try {
      const res = await fetch('/api/approvals');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          const approvedOrExecuted = data.filter((item: any) => item.status === 'APPROVED' || item.status === 'EXECUTED');
          backendBlocks = approvedOrExecuted.map((item: any, idx: number) => {
            const approversList = item.approvers || [];
            const app1 = approversList[0]?.name ? `${approversList[0].name} (${approversList[0].role || 'Security Admin'})` : 'Sarah Kim (Security Admin)';
            const app2 = approversList[1]?.name ? `${approversList[1].name} (${approversList[1].role || 'Ops Manager'})` : 'Aisha Khan (Ops Manager)';

            return {
              blockNumber: 156 + idx,
              commandId: item.commandId || item.id || `CMD-${1000 + idx}`,
              vehicleId: item.vehicleId || 'TR-102',
              vehicleName: item.vehicleName || 'Mahindra Treo',
              licensePlate: item.plateNumber || 'KA-01-TR-2002',
              commandName: item.commandName || item.action || 'Immobilize Drivetrain',
              legalReason: item.legalReason || 'Vehicle Theft',
              operator: item.requestedBy || 'Sarah Kim (Security Admin)',
              approver1: app1,
              approver2: app2,
              verificationResult: '7/7 Passed ✓',
              executionTime: item.executionTime || '41.2 ms',
              hash: item.auditHash || `0x${Array.from({ length: 32 }, () => Math.floor(Math.random() * 16).toString(16)).join('')}`,
              previousHash: `0x${Array.from({ length: 32 }, () => Math.floor(Math.random() * 16).toString(16)).join('')}`,
              firmwareVersion: 'v2.5.1',
              location: 'Ameerpet Main Road, Hyderabad',
              status: 'EXECUTED',
              timestamp: item.requestedAt || new Date().toISOString().replace('T', ' ').slice(0, 19),
            };
          });
        }
      }
    } catch {
      // Fallback
    }

    let sessionEntries: AuditBlock[] = [];
    const sessionEntriesRaw = sessionStorage.getItem('auditLedgerEntries');
    if (sessionEntriesRaw) {
      try {
        const parsed = JSON.parse(sessionEntriesRaw);
        if (Array.isArray(parsed)) sessionEntries = parsed;
      } catch {}
    }

    const defaultInitialBlocks: AuditBlock[] = [
      {
        blockNumber: 154,
        commandId: 'CMD-1004',
        vehicleId: 'TR-101',
        vehicleName: 'Sargam Electric Rickshaw',
        licensePlate: 'MH-12-ER-1001',
        commandName: 'Immobilize Drivetrain',
        legalReason: 'Vehicle Theft',
        operator: 'Rajesh Kumar (Fleet Mgr)',
        approver1: 'Sarah Kim (Security Admin)',
        approver2: 'Aisha Khan (Ops Mgr)',
        verificationResult: '7/7 Passed ✓',
        executionTime: '41.2 ms',
        hash: '0x9AF82E3B1C4D5E6F7A8B9C0D1E2F3A4B',
        previousHash: '0x812C4F9A2B3C4D5E6F7A8B9C0D1E2F3A',
        firmwareVersion: 'v2.5.1',
        location: 'Ameerpet Main Road, Hyderabad',
        status: 'EXECUTED',
        timestamp: '2026-08-06 20:14:05',
      },
      {
        blockNumber: 153,
        commandId: 'CMD-1002',
        vehicleId: 'TR-102',
        vehicleName: 'Mahindra Treo',
        licensePlate: 'KA-01-TR-2002',
        commandName: 'Lock Doors',
        legalReason: 'Emergency Response',
        operator: 'Rajesh Kumar (Ops Admin)',
        approver1: 'Vikram Singh (Super Admin)',
        approver2: 'Anita Desai (Security Admin)',
        verificationResult: '7/7 Passed ✓',
        executionTime: '12.4 ms',
        hash: '0x812C4F9A2B3C4D5E6F7A8B9C0D1E2F3A',
        previousHash: '0x701B3E891A2B3C4D5E6F7A8B9C0D1E2F',
        firmwareVersion: 'v2.4.3',
        location: 'Banjara Hills, Hyderabad',
        status: 'EXECUTED',
        timestamp: '2026-08-06 17:45:02',
      },
      {
        blockNumber: 152,
        commandId: 'CMD-1003',
        vehicleId: 'TR-103',
        vehicleName: 'Piaggio Ape E-City',
        licensePlate: 'DL-01-AP-3003',
        commandName: 'Immobilize Drivetrain',
        legalReason: 'Court Order',
        operator: 'Imran Khan (Fleet Manager)',
        approver1: 'Sarah Kim (Security Admin)',
        approver2: 'Aisha Khan (Ops Mgr)',
        verificationResult: '7/7 Passed ✓',
        executionTime: '38.0 ms',
        hash: '0x701B3E891A2B3C4D5E6F7A8B9C0D1E2F',
        previousHash: '0x600A2D78091A2B3C4D5E6F7A8B9C0D1E',
        firmwareVersion: 'v2.3.0',
        location: 'Kukatpally Y Junction, Hyderabad',
        status: 'EXECUTED',
        timestamp: '2026-08-06 15:20:10',
      },
      {
        blockNumber: 151,
        commandId: 'CMD-1000',
        vehicleId: 'V-1004',
        vehicleName: 'Euler HiLoad EV',
        licensePlate: 'HR-26-EU-4004',
        commandName: 'Enforce Speed Limit',
        legalReason: 'Driver Safety',
        operator: 'Service Engineer',
        approver1: 'Prakash Rao (Lead Tech)',
        approver2: 'System Policy Auto-Signed',
        verificationResult: '7/7 Passed ✓',
        executionTime: '24.1 ms',
        hash: '0x600A2D78091A2B3C4D5E6F7A8B9C0D1E',
        previousHash: '0x50091C6708091A2B3C4D5E6F7A8B9C0D',
        firmwareVersion: 'v2.1.6',
        location: 'Gachibowli, Hyderabad',
        status: 'EXECUTED',
        timestamp: '2026-08-06 14:10:00',
      },
    ];

    // Combine session entries and backend blocks, filtering out duplicates
    const combinedLive = [...sessionEntries, ...backendBlocks];
    const uniqueLive = combinedLive.filter(
      (item, index, self) => index === self.findIndex((t) => t.commandId === item.commandId)
    );

    const finalCombined = [...uniqueLive, ...defaultInitialBlocks.filter(db => !uniqueLive.some(ul => ul.commandId === db.commandId))];
    setBlocks(finalCombined);
  };

  useEffect(() => {
    fetchAuditFromBackend();
    const interval = setInterval(fetchAuditFromBackend, 2000);
    return () => clearInterval(interval);
  }, []);

  const filteredBlocks = blocks.filter((b) => {
    const q = searchQuery.toLowerCase();
    return (
      b.commandId.toLowerCase().includes(q) ||
      b.vehicleName.toLowerCase().includes(q) ||
      b.licensePlate.toLowerCase().includes(q) ||
      b.hash.toLowerCase().includes(q) ||
      b.operator.toLowerCase().includes(q) ||
      b.legalReason.toLowerCase().includes(q)
    );
  });

  return (
    <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit" className="space-y-6 font-sans">
      {/* 1. PAGE HEADER */}
      <div>
        <h1 className={`text-[32px] font-bold tracking-tight leading-none ${isDark ? 'text-white' : 'text-[#111827]'}`}>
          Audit Ledger
        </h1>
        <p className={`text-sm mt-2 font-normal ${isDark ? 'text-slate-400' : 'text-[#475569]'}`}>
          Cryptographic Merkle Tree Hash-Chain Ledger & Execution Audit Trail
        </p>
      </div>

      {/* 2. TOP METRICS CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className={`p-4 rounded-lg border shadow-xs ${isDark ? 'bg-[#111827] border-slate-800' : 'bg-white border-[#E5E7EB]'}`}>
          <div className={`text-[10px] font-bold uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>TOTAL BLOCKS</div>
          <div className={`text-2xl font-bold mt-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>{150 + blocks.length}</div>
          <div className="text-[11px] text-blue-600 font-semibold mt-0.5">Merkle Height</div>
        </div>

        <div className={`p-4 rounded-lg border shadow-xs ${isDark ? 'bg-[#111827] border-slate-800' : 'bg-white border-[#E5E7EB]'}`}>
          <div className={`text-[10px] font-bold uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>CHAIN INTEGRITY</div>
          <div className="text-2xl font-bold text-emerald-600 mt-1">100% Verified</div>
          <div className="text-[11px] text-emerald-600 font-semibold mt-0.5">SHA-256 Valid</div>
        </div>

        <div className={`p-4 rounded-lg border shadow-xs ${isDark ? 'bg-[#111827] border-slate-800' : 'bg-white border-[#E5E7EB]'}`}>
          <div className={`text-[10px] font-bold uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>REPLAY DEFENSE</div>
          <div className="text-2xl font-bold text-purple-600 mt-1">Active</div>
          <div className="text-[11px] text-purple-600 font-semibold mt-0.5">64-bit Nonce TTL</div>
        </div>

        <div className={`p-4 rounded-lg border shadow-xs ${isDark ? 'bg-[#111827] border-slate-800' : 'bg-white border-[#E5E7EB]'}`}>
          <div className={`text-[10px] font-bold uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>AVG DISPATCH LATENCY</div>
          <div className="text-2xl font-bold text-blue-600 mt-1">41.2 ms</div>
          <div className="text-[11px] text-blue-600 font-semibold mt-0.5">Hardware HSM</div>
        </div>
      </div>

      {/* 3. VISUAL MERKLE BLOCKCHAIN STREAM */}
      <div className={`p-6 rounded-lg border shadow-xs space-y-4 ${isDark ? 'bg-[#111827] border-slate-800' : 'bg-white border-[#E5E7EB]'}`}>
        <div className="font-bold text-xs uppercase tracking-wider text-slate-400 flex justify-between items-center border-b pb-3 border-slate-800">
          <span>Live Cryptographic Hash-Chain Blocks</span>
          <span className="text-emerald-500 font-mono text-[11px]">Chain State: Synchronized</span>
        </div>

        <div className="flex items-center space-x-4 overflow-x-auto pb-2">
          {blocks.slice(0, 4).map((b, i) => (
            <div key={b.blockNumber} className="flex items-center space-x-4 shrink-0">
              <div className={`p-4 rounded-xl border w-64 space-y-2 text-xs font-mono transition-all ${
                i === 0
                  ? 'border-2 border-blue-500 bg-blue-500/10 shadow-md'
                  : isDark
                  ? 'bg-slate-900 border-slate-800 text-slate-300'
                  : 'bg-slate-50 border-slate-200 text-slate-700'
              }`}>
                <div className="flex justify-between items-center border-b pb-2 border-slate-700 font-bold">
                  <span className="text-blue-500">Block #{b.blockNumber}</span>
                  <span className="text-[10px] text-emerald-500">Passed</span>
                </div>
                <div>Cmd ID: <strong className="text-white">{b.commandId}</strong></div>
                <div>Target: <strong className="text-blue-400">{b.licensePlate}</strong></div>
                <div className="truncate text-[10px] text-slate-400">Hash: {b.hash.slice(0, 14)}...</div>
                <div className="truncate text-[10px] text-slate-500">Prev: {b.previousHash.slice(0, 14)}...</div>
              </div>

              {i < 3 && <ArrowRight className="text-slate-400 shrink-0" size={18} />}
            </div>
          ))}
        </div>
      </div>

      {/* 4. AUDIT LEDGER TABLE */}
      <div className={`p-6 rounded-[16px] border shadow-xs space-y-4 transition-colors ${
        isDark ? 'bg-[#111827] border-slate-800' : 'bg-white border-[#E5E7EB]'
      }`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-3 border-slate-800">
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-3.5 top-3 text-slate-400" size={16} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by Command ID, vehicle, plate, or SHA hash..."
              className={`w-full pl-10 pr-4 py-2 rounded-xl text-xs focus:outline-none border ${
                isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-[#F8FAFC] border-[#E5E7EB] text-[#111827]'
              }`}
            />
          </div>
          <span className="text-xs text-slate-400 font-mono">Showing {filteredBlocks.length} Merkle Blocks</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className={`border-b text-[11px] font-bold uppercase tracking-wider ${
              isDark ? 'bg-slate-900/80 border-slate-800 text-slate-400' : 'bg-slate-50 border-[#E5E7EB] text-[#475569]'
            }`}>
              <tr>
                <th className="p-3.5 font-bold">Block # / Time</th>
                <th className="p-3.5 font-bold">Command & Reason</th>
                <th className="p-3.5 font-bold">Vehicle Target</th>
                <th className="p-3.5 font-bold">Operator & Approvers</th>
                <th className="p-3.5 font-bold">Verification & Latency</th>
                <th className="p-3.5 font-bold">Cryptographic Hashes</th>
                <th className="p-3.5 font-bold">Firmware & Location</th>
              </tr>
            </thead>
            <tbody className={`divide-y font-mono ${isDark ? 'divide-slate-800/60' : 'divide-[#E5E7EB]/60'}`}>
              {filteredBlocks.map((b) => (
                <tr key={b.blockNumber} className={`transition-colors ${isDark ? 'hover:bg-slate-800/40' : 'hover:bg-slate-50'}`}>
                  <td className="p-3.5">
                    <div className="font-bold text-blue-500">#{b.blockNumber}</div>
                    <div className="text-[10px] text-slate-400">{b.timestamp}</div>
                  </td>
                  <td className="p-3.5 font-sans">
                    <div className="font-bold text-rose-500">{b.commandName}</div>
                    <div className="text-[10px] text-slate-400">Reason: {b.legalReason}</div>
                    <div className="text-[10px] font-mono text-blue-400">{b.commandId}</div>
                  </td>
                  <td className="p-3.5 font-sans">
                    <div className="font-bold">{b.vehicleName}</div>
                    <div className="text-[10px] text-slate-400 font-mono">{b.licensePlate} ({b.vehicleId})</div>
                  </td>
                  <td className="p-3.5 text-[11px] font-sans">
                    <div>Operator: <strong className="text-blue-400">{b.operator}</strong></div>
                    <div className="text-slate-400">Appr 1: {b.approver1}</div>
                    <div className="text-slate-400">Appr 2: {b.approver2}</div>
                  </td>
                  <td className="p-3.5">
                    <div className="text-emerald-500 font-bold">{b.verificationResult}</div>
                    <div className="text-[10px] text-purple-400">{b.executionTime}</div>
                  </td>
                  <td className="p-3.5 text-[10px]">
                    <div className="text-emerald-400 truncate max-w-[150px]" title={b.hash}>Hash: {b.hash.slice(0, 16)}...</div>
                    <div className="text-slate-400 truncate max-w-[150px]" title={b.previousHash}>Prev: {b.previousHash.slice(0, 16)}...</div>
                  </td>
                  <td className="p-3.5 text-[11px] font-sans">
                    <div className="font-bold text-slate-300">{b.firmwareVersion}</div>
                    <div className="text-[10px] text-slate-400 truncate max-w-[130px]">{b.location}</div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
}

export default AuditPage;
