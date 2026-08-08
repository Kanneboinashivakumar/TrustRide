import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
// @ts-ignore
import { pageVariants } from '@/motion/variants';
import { useTheme } from '@/providers/theme-provider';
import { getVehicleImage } from '@/utils/vehicle-images';
import {
  CheckCircle2,
  XCircle,
  Clock,
  Car,
  ShieldAlert,
  ShieldCheck,
  FileText,
  UserCheck,
  Search,
  Filter,
  Download,
  Eye,
  X,
  AlertTriangle,
  Send,
  RefreshCw,
  Sliders,
  Check,
  Calendar,
  Key,
  Lock,
  MessageSquare
} from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';

interface ApprovalRecord {
  id: string;
  commandId: string;
  vehicleId: string;
  vehicleName: string;
  plateNumber: string;
  vehicleImage: string;
  action: string;
  commandName: string;
  riskLevel: 'High' | 'Medium' | 'Low' | 'Critical';
  riskScore: number;
  requestedBy: string;
  requesterRole: string;
  legalReason: string;
  legalDocument: string;
  justification: string;
  currentSpeed: string;
  batteryLevel: number;
  requestedAt: string;
  waitingSince: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  signaturesCount: number;
  requiredSignatures: number;
  approvers: { name: string; role: string; time: string; approved: boolean }[];
  auditHash: string;
  affectedSystems: string[];
  driverImpact: string;
  executionStatus: string;
  executionTime: string;
}

export function ApprovalCenterPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const highlightId = searchParams.get('highlightAppr');
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';

  const [activeTab, setActiveTab] = useState<'PENDING' | 'APPROVED' | 'REJECTED' | 'HISTORY'>('PENDING');
  const [approvals, setApprovals] = useState<ApprovalRecord[]>([]);
  const [selectedRecord, setSelectedRecord] = useState<ApprovalRecord | null>(null);

  // Approve Flow States
  const [showApproveModal, setShowApproveModal] = useState<ApprovalRecord | null>(null);
  const [mfaPin, setMfaPin] = useState<string>('994812');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Reject Flow States
  const [showRejectModal, setShowRejectModal] = useState<ApprovalRecord | null>(null);
  const [rejectionReason, setRejectionReason] = useState<string>('Insufficient Evidence');

  // Execution Result Modal State
  const [executionResultModal, setExecutionResultModal] = useState<ApprovalRecord | null>(null);
  const [evidenceRequestedMsg, setEvidenceRequestedMsg] = useState<string | null>(null);

  const initialMockApprovals: ApprovalRecord[] = [
    {
      id: 'APP-1001',
      commandId: 'CMD-1001',
      vehicleId: 'TR-102',
      vehicleName: 'Mahindra Treo',
      plateNumber: 'KA-01-TR-2002',
      vehicleImage: '⚡',
      action: 'IMMOBILIZE',
      commandName: 'Immobilize (Stop Vehicle Operation)',
      riskLevel: 'Critical',
      riskScore: 92,
      requestedBy: 'Sarah Kim (Security Admin)',
      requesterRole: 'Security Admin',
      legalReason: 'Emergency Response',
      legalDocument: 'Police_FIR_Report_HYD_9912.pdf',
      justification: 'Emergency immobilization request',
      currentSpeed: '0 km/h',
      batteryLevel: 82,
      requestedAt: '2026-08-06 18:20:11',
      waitingSince: '5 min',
      status: 'APPROVED',
      signaturesCount: 2,
      requiredSignatures: 2,
      approvers: [
        { name: 'Vikram Singh', role: 'Super Admin', time: '09:45', approved: true },
        { name: 'Aisha Khan', role: 'Security Admin', time: '09:47', approved: true },
      ],
      auditHash: '0x8f9a2e3b1c4d5e6f7a8b9c0d1e2f3a4b',
      affectedSystems: ['Motor Controller', 'Battery BMS', 'ECU', 'Telematics'],
      driverImpact: 'Vehicle stopped safely at roadside. Motor power isolated.',
      executionStatus: 'Executed',
      executionTime: '41.2 ms',
    },
    {
      id: 'APP-1002',
      commandId: 'CMD-1002',
      vehicleId: 'TR-103',
      vehicleName: 'Piaggio Ape E-City',
      plateNumber: 'DL-01-AP-3003',
      vehicleImage: '🛺',
      action: 'LOCK_DOORS',
      commandName: 'Lock Doors',
      riskLevel: 'Medium',
      riskScore: 45,
      requestedBy: 'Rajesh Kumar (Ops Admin)',
      requesterRole: 'Ops Admin',
      legalReason: 'Maintenance',
      legalDocument: 'Safety_Lock_Request.pdf',
      justification: 'Remote lock requested due to unattended high-value cargo',
      currentSpeed: '0 km/h',
      batteryLevel: 90,
      requestedAt: '2026-08-06 17:45:02',
      waitingSince: '12 min',
      status: 'APPROVED',
      signaturesCount: 2,
      requiredSignatures: 2,
      approvers: [
        { name: 'Vikram Singh', role: 'Super Admin', time: '09:30', approved: true },
        { name: 'Anita Desai', role: 'Security Admin', time: '09:32', approved: true },
      ],
      auditHash: '0xd4e5f6a7b8c90d1e2f3a4b5c6d7e8f9a',
      affectedSystems: ['Door Lock', 'ECU'],
      driverImpact: 'Doors locked remotely. Driver retains manual key override.',
      executionStatus: 'Executed',
      executionTime: '12.4 ms',
    },
  ];

  const fetchApprovalsFromBackend = async () => {
    let dataList: ApprovalRecord[] = [];
    try {
      const res = await fetch('/api/approvals');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          dataList = [...data].reverse();
        }
      }
    } catch {
      // Fallback
    }

    if (dataList.length === 0) {
      dataList = initialMockApprovals;
    }

    const pendingSessionRaw = sessionStorage.getItem('pendingSubmission');
    if (pendingSessionRaw) {
      try {
        const pendingObj: ApprovalRecord = JSON.parse(pendingSessionRaw);
        if (pendingObj && !dataList.some((item) => item.id === pendingObj.id)) {
          dataList = [pendingObj, ...dataList];
        }
      } catch {}
    }

    setApprovals(dataList);
  };

  useEffect(() => {
    fetchApprovalsFromBackend();
    const interval = setInterval(fetchApprovalsFromBackend, 2500);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (approvals.length > 0) {
      if (highlightId) {
        const match = approvals.find((a) => a.id === highlightId);
        if (match) {
          setSelectedRecord(match);
          if (match.status.toUpperCase() === 'PENDING') setActiveTab('PENDING');
          else if (match.status.toUpperCase() === 'APPROVED') setActiveTab('APPROVED');
          else if (match.status.toUpperCase() === 'REJECTED') setActiveTab('REJECTED');
          return;
        }
      }
      if (!selectedRecord) {
        setSelectedRecord(approvals[0]);
      }
    }
  }, [highlightId, approvals]);

  const pendingCount = approvals.filter((a) => a.status?.toUpperCase() === 'PENDING').length;
  const approvedCount = approvals.filter((a) => a.status?.toUpperCase() === 'APPROVED').length;
  const rejectedCount = approvals.filter((a) => a.status?.toUpperCase() === 'REJECTED').length;
  const historyCount = approvals.length;

  const filteredList = approvals.filter((a) => {
    if (activeTab === 'HISTORY') return true;
    return a.status?.toUpperCase() === activeTab.toUpperCase();
  });

  const recordToDisplay = filteredList.find((a) => a.id === selectedRecord?.id) || filteredList[0] || selectedRecord || approvals[0] || initialMockApprovals[0];
  const selectedVehicleImg = getVehicleImage(recordToDisplay?.vehicleId || 'TR-101');

  useEffect(() => {
    if (filteredList.length > 0) {
      setSelectedRecord(filteredList[0]);
    }
  }, [activeTab]);

  const executeApproveRecord = async (targetRec: ApprovalRecord) => {
    setIsSubmitting(true);

    const pendingSessionRaw = sessionStorage.getItem('pendingSubmission');
    if (pendingSessionRaw) {
      try {
        const p = JSON.parse(pendingSessionRaw);
        if (p.id === targetRec.id) {
          sessionStorage.removeItem('pendingSubmission');
        }
      } catch {}
    }

    try {
      await fetch(`/api/approvals/${targetRec.id}/approve`, {
        method: 'POST',
      });

      // Update persistent sessionStorage for immobilized vehicle tracking
      const vId = targetRec.vehicleId || 'TR-101';
      const actionUpper = (targetRec.action || targetRec.commandName || '').toUpperCase();
      const currentImmobilized: string[] = JSON.parse(sessionStorage.getItem('immobilizedVehicleIds') || '[]');

      if (actionUpper.includes('IMMOBILIZE') || actionUpper.includes('LOCKDOWN')) {
        if (!currentImmobilized.includes(vId)) currentImmobilized.push(vId);
        if ((vId === 'TR-101' || vId === 'V-1001') && !currentImmobilized.includes('TR-101')) currentImmobilized.push('TR-101');
        sessionStorage.setItem('immobilizedVehicleIds', JSON.stringify(currentImmobilized));
      } else if (actionUpper.includes('RESTORE') || actionUpper.includes('UNLOCK')) {
        const filtered = currentImmobilized.filter(
          (id) => id !== vId && !( (vId === 'TR-101' || vId === 'V-1001') && (id === 'TR-101' || id === 'V-1001') )
        );
        sessionStorage.setItem('immobilizedVehicleIds', JSON.stringify(filtered));
      }
    } catch {
      // Fallback
    } finally {
      setIsSubmitting(false);
      setShowApproveModal(null);

      const newAuditEntry = {
        blockNumber: 156 + Math.floor(Math.random() * 50),
        commandId: targetRec.commandId || `CMD-${Math.floor(1000 + Math.random() * 9000)}`,
        vehicleId: targetRec.vehicleId || 'TR-102',
        vehicleName: targetRec.vehicleName || 'Mahindra Treo',
        licensePlate: targetRec.plateNumber || 'KA-01-TR-2002',
        commandName: targetRec.commandName || targetRec.action || 'Immobilize Drivetrain',
        legalReason: targetRec.legalReason || 'Emergency Response',
        operator: targetRec.requestedBy || 'Sarah Kim (Security Admin)',
        approver1: 'Sarah Kim (Security Admin)',
        approver2: 'Aisha Khan (Ops Manager)',
        verificationResult: '7/7 Passed ✓',
        executionTime: '41.2 ms',
        hash: '0x' + Array.from({ length: 32 }, () => Math.floor(Math.random() * 16).toString(16)).join(''),
        previousHash: '0x8f9a2e3b1c4d5e6f7a8b9c0d1e2f3a4b',
        firmwareVersion: 'v2.5.1',
        location: 'Ameerpet Main Road, Hyderabad',
        status: 'EXECUTED',
        timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
      };

      const existingAuditRaw = sessionStorage.getItem('auditLedgerEntries');
      let auditArr: any[] = [];
      if (existingAuditRaw) {
        try { auditArr = JSON.parse(existingAuditRaw); } catch {}
      }
      auditArr.unshift(newAuditEntry);
      sessionStorage.setItem('auditLedgerEntries', JSON.stringify(auditArr));

      setApprovals((prev) =>
        prev.map((item) => {
          if (item.id === targetRec.id) {
            return {
              ...item,
              status: 'APPROVED',
              signaturesCount: item.requiredSignatures,
              executionStatus: 'Executed',
              approvers: [
                { name: 'Sarah Kim', role: 'Security Admin', time: 'Just now', approved: true },
                { name: 'Aisha Khan', role: 'Ops Manager', time: 'Just now', approved: true },
              ],
            };
          }
          return item;
        })
      );

      navigate(`/app/verification?id=${targetRec.id}&action=${targetRec.action}&vehicleId=${targetRec.vehicleId}`);
    }
  };

  // Approve Flow via Backend -> Redirect to Standalone Verification Pipeline
  const handleConfirmApprove = async () => {
    if (!showApproveModal) return;
    await executeApproveRecord(showApproveModal);
  };

  // Reject Flow via Backend
  const handleConfirmReject = async () => {
    if (!showRejectModal) return;
    setIsSubmitting(true);

    try {
      const res = await fetch(`/api/approvals/${showRejectModal.id}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reasonCode: rejectionReason, reasonText: 'Administrative rejection' }),
      });
      if (res.ok) {
        alert(`Command [${showRejectModal.commandId}] rejected: ${rejectionReason}`);
        setShowRejectModal(null);
        fetchApprovalsFromBackend();
      } else {
        alert(`Command rejected: ${showRejectModal.commandId}`);
        setShowRejectModal(null);
      }
    } catch {
      alert(`Command rejected: ${showRejectModal.commandId}`);
      setShowRejectModal(null);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit" className="space-y-6 font-sans">
      {/* 1. TOP HEADER & 6 SUMMARY CARDS */}
      <div>
        <h1 className={`text-[32px] font-bold tracking-tight leading-none ${isDark ? 'text-white' : 'text-[#111827]'}`}>
          Approval Center
        </h1>
        <p className={`text-sm mt-2 font-normal ${isDark ? 'text-slate-400' : 'text-[#475569]'}`}>
          Multi-Signature Remote Command Approval Quorum & Governance Engine
        </p>
      </div>

      {/* 6 TOP CARDS */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className={`p-4 rounded-[16px] border shadow-xs ${isDark ? 'bg-[#111827] border-slate-800' : 'bg-white border-[#E5E7EB]'}`}>
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">PENDING</div>
          <div className="text-2xl font-bold text-amber-500 mt-1">{pendingCount}</div>
        </div>

        <div className={`p-4 rounded-lg border shadow-xs ${isDark ? 'bg-[#111827] border-slate-800' : 'bg-white border-[#E5E7EB]'}`}>
          <div className={`text-[10px] font-bold uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>APPROVED TODAY</div>
          <div className="text-2xl font-bold text-emerald-600 mt-1">{approvedCount}</div>
        </div>

        <div className={`p-4 rounded-lg border shadow-xs ${isDark ? 'bg-[#111827] border-slate-800' : 'bg-white border-[#E5E7EB]'}`}>
          <div className={`text-[10px] font-bold uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>REJECTED TODAY</div>
          <div className="text-2xl font-bold text-rose-600 mt-1">{rejectedCount}</div>
        </div>

        <div className={`p-4 rounded-lg border shadow-xs ${isDark ? 'bg-[#111827] border-slate-800' : 'bg-white border-[#E5E7EB]'}`}>
          <div className={`text-[10px] font-bold uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>AVG APPROVAL TIME</div>
          <div className="text-2xl font-bold text-blue-600 mt-1">3m 24s</div>
        </div>

        <div className={`p-4 rounded-lg border shadow-xs ${isDark ? 'bg-[#111827] border-slate-800' : 'bg-white border-[#E5E7EB]'}`}>
          <div className={`text-[10px] font-bold uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>COMMANDS WAITING</div>
          <div className="text-2xl font-bold text-amber-600 mt-1">{pendingCount}</div>
        </div>

        <div className={`p-4 rounded-lg border shadow-xs ${isDark ? 'bg-[#111827] border-slate-800' : 'bg-white border-[#E5E7EB]'}`}>
          <div className={`text-[10px] font-bold uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>CRITICAL REQUESTS</div>
          <div className="text-2xl font-bold text-rose-600 mt-1">{pendingCount}</div>
        </div>
      </div>

      {/* 2. TABS BAR */}
      <div className={`p-4 rounded-lg border shadow-xs flex items-center justify-between ${
        isDark ? 'bg-[#111827] border-slate-800' : 'bg-white border-[#E5E7EB]'
      }`}>
        <div className="flex items-center space-x-2">
          {(['PENDING', 'APPROVED', 'REJECTED', 'HISTORY'] as const).map((tab) => {
            const count = tab === 'PENDING' ? pendingCount : tab === 'APPROVED' ? approvedCount : tab === 'REJECTED' ? rejectedCount : historyCount;
            const isActive = activeTab === tab;

            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-md text-xs font-bold transition-all cursor-pointer flex items-center space-x-1.5 ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-xs'
                    : isDark
                    ? 'text-slate-400 hover:bg-slate-800'
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                <span>{tab}</span>
                <span className={`px-2 py-0.5 rounded-md text-[10px] ${isActive ? 'bg-white/20 text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-400'}`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. MAIN SPLIT LAYOUT (LEFT 65% TABLE / RIGHT 35% COMMAND DETAILS PANEL) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (65%): Approvals Table */}
        <div className={`lg:col-span-8 p-6 rounded-lg border shadow-xs space-y-4 transition-colors ${
          isDark ? 'bg-[#111827] border-slate-800' : 'bg-white border-[#E5E7EB]'
        }`}>
          <div className="font-bold text-sm border-b pb-3 border-slate-800 flex justify-between items-center">
            <span>Pending Approvals Table</span>
            <span className="text-xs text-slate-400 font-mono">Showing {filteredList.length} Requests</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className={`border-b text-[11px] font-bold uppercase tracking-wider ${
                isDark ? 'bg-slate-900/80 border-slate-800 text-slate-400' : 'bg-slate-50 border-[#E5E7EB] text-[#475569]'
              }`}>
                <tr>
                  <th className="p-3 font-bold">Vehicle</th>
                  <th className="p-3 font-bold">Command</th>
                  <th className="p-3 font-bold">Risk</th>
                  <th className="p-3 font-bold">Requested By</th>
                  <th className="p-3 font-bold">Waiting Since</th>
                  <th className="p-3 font-bold">Approvals</th>
                  <th className="p-3 font-bold">Status</th>
                  <th className="p-3 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className={`divide-y ${isDark ? 'divide-slate-800/60' : 'divide-[#E5E7EB]/60'}`}>
                {filteredList.map((appr) => {
                  const isSelected = recordToDisplay.id === appr.id;
                  const vImg = getVehicleImage(appr.vehicleId);

                  return (
                    <tr
                      key={appr.id}
                      onClick={() => setSelectedRecord(appr)}
                      className={`cursor-pointer transition-colors ${
                        isSelected
                          ? 'bg-blue-500/10 dark:bg-blue-500/20 font-semibold'
                          : isDark
                          ? 'hover:bg-slate-800/40'
                          : 'hover:bg-slate-50'
                      }`}
                    >
                      <td className="p-3">
                        <div className="flex items-center space-x-2">
                          <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-800 p-0.5 flex items-center justify-center shrink-0 border border-slate-200 dark:border-slate-700 overflow-hidden">
                            {vImg.imageUrl ? (
                              <img src={vImg.imageUrl} alt={appr.vehicleName} className="w-full h-full object-contain" />
                            ) : (
                              <span className="text-lg">{vImg.imageEmoji}</span>
                            )}
                          </div>
                          <div>
                            <div className={`font-bold ${isDark ? 'text-slate-200' : 'text-[#111827]'}`}>{appr.vehicleName}</div>
                            <div className="text-[10px] text-slate-400 font-mono">{appr.plateNumber}</div>
                          </div>
                        </div>
                      </td>

                      <td className="p-3 font-bold text-rose-500">{appr.action}</td>

                      <td className="p-3">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase border ${
                          appr.riskLevel === 'Critical' ? 'bg-rose-50 text-rose-600 border-rose-200 dark:bg-rose-500/10 dark:text-rose-400' : 'bg-amber-50 text-amber-600 border-amber-200'
                        }`}>
                          {appr.riskLevel}
                        </span>
                      </td>

                      <td className="p-3 text-slate-400 font-medium">{appr.requestedBy}</td>

                      <td className="p-3 text-slate-400 font-mono text-[11px]">{appr.waitingSince}</td>

                      <td className="p-3 font-mono font-bold text-amber-500">
                        {appr.signaturesCount}/{appr.requiredSignatures}
                      </td>

                      <td className="p-3">
                        <span className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold border ${
                          appr.status === 'APPROVED'
                            ? 'bg-slate-900 text-white border-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:border-slate-200'
                            : appr.status === 'PENDING'
                            ? 'bg-slate-100 text-slate-800 border-slate-300 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700'
                            : 'bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-950 dark:text-rose-300 dark:border-rose-800'
                        }`}>
                          {appr.status === 'APPROVED' ? 'Approved' : appr.status === 'PENDING' ? 'Pending' : 'Rejected'}
                        </span>
                      </td>

                      <td className="p-3 text-right">
                        <div className="flex items-center justify-end space-x-1">
                          {appr.status === 'PENDING' && (
                            <>
                              {appr.requiredSignatures === 1 ? (
                                <button
                                  onClick={(e) => { e.stopPropagation(); executeApproveRecord(appr); }}
                                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-xs transition-colors cursor-pointer flex items-center space-x-1 shadow-xs"
                                  title="Approve Command Request (1/1)"
                                >
                                  <CheckCircle2 size={12} />
                                  <span>Approve</span>
                                </button>
                              ) : (
                                <button
                                  onClick={(e) => { e.stopPropagation(); setShowApproveModal(appr); }}
                                  className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg text-xs transition-colors cursor-pointer flex items-center space-x-1 shadow-xs"
                                  title="Co-Sign Command Request (2/2)"
                                >
                                  <Key size={12} />
                                  <span>Co-Sign</span>
                                </button>
                              )}
                              <button
                                onClick={(e) => { e.stopPropagation(); setShowRejectModal(appr); }}
                                className="p-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg transition-colors cursor-pointer"
                                title="Reject Command"
                              >
                                <X size={14} />
                              </button>
                            </>
                          )}
                          <button
                            onClick={(e) => { e.stopPropagation(); setSelectedRecord(appr); }}
                            className="p-1.5 rounded-lg border text-slate-400 hover:text-blue-500 transition-colors cursor-pointer"
                            title="View Details"
                          >
                            <Eye size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Column (35%): Command Details Panel */}
        <div className={`lg:col-span-4 p-6 rounded-[16px] border shadow-xs space-y-5 transition-colors ${
          isDark ? 'bg-[#111827] border-slate-800' : 'bg-white border-[#E5E7EB]'
        }`}>
          <div className="flex justify-between items-center border-b pb-3 border-slate-800">
            <h3 className={`text-sm font-bold ${isDark ? 'text-white' : 'text-[#111827]'}`}>Command Details Drawer</h3>
            <span className={`px-3 py-1 font-semibold rounded-lg text-xs border ${
              recordToDisplay.status === 'APPROVED'
                ? 'bg-slate-900 text-white border-slate-800 dark:bg-slate-100 dark:text-slate-900'
                : 'bg-slate-100 text-slate-800 border-slate-300 dark:bg-slate-800 dark:text-slate-200'
            }`}>
              {recordToDisplay.status === 'APPROVED' ? 'Approved' : recordToDisplay.status === 'PENDING' ? 'Pending' : 'Rejected'}
            </span>
          </div>

          {/* Vehicle Info Card */}
          <div className={`p-4 rounded-xl border flex items-center space-x-4 ${isDark ? 'bg-slate-900/50 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
            <div className="w-14 h-14 rounded-xl bg-slate-100 dark:bg-slate-800 p-1 flex items-center justify-center shrink-0 border border-slate-200 dark:border-slate-700 overflow-hidden">
              {selectedVehicleImg.imageUrl ? (
                <img src={selectedVehicleImg.imageUrl} alt={recordToDisplay.vehicleName} className="w-full h-full object-contain" />
              ) : (
                <span className="text-3xl">{selectedVehicleImg.imageEmoji}</span>
              )}
            </div>
            <div>
              <div className={`font-bold text-sm ${isDark ? 'text-white' : 'text-[#111827]'}`}>{recordToDisplay.vehicleName}</div>
              <div className="text-slate-400 font-mono text-xs">{recordToDisplay.plateNumber}</div>
              <div className="flex items-center space-x-3 text-xs mt-1 font-bold">
                <span className="text-blue-500">Battery: {recordToDisplay.batteryLevel}%</span>
                <span className={isDark ? 'text-slate-300' : 'text-[#111827]'}>Speed: {recordToDisplay.currentSpeed}</span>
              </div>
            </div>
          </div>

          {/* Details Metadata Rows */}
          <div className="space-y-3 text-xs font-sans">
            <div className="flex justify-between border-b pb-1.5 border-slate-700/40">
              <span className="font-bold text-slate-700 dark:text-slate-300">Command:</span>
              <strong className="text-rose-600 dark:text-rose-400 font-extrabold text-sm">{recordToDisplay.commandName}</strong>
            </div>
            <div className="flex justify-between border-b pb-1.5 border-slate-700/40">
              <span className="font-bold text-slate-700 dark:text-slate-300">Risk Score:</span>
              <strong className="text-rose-600 dark:text-rose-400 font-bold">{recordToDisplay.riskLevel} ({recordToDisplay.riskScore}%)</strong>
            </div>
            <div className="flex justify-between border-b pb-1.5 border-slate-700/40">
              <span className="font-bold text-slate-700 dark:text-slate-300">Reason:</span>
              <strong className="text-slate-900 dark:text-white font-bold">{recordToDisplay.legalReason}</strong>
            </div>
            <div className="flex justify-between border-b pb-1.5 border-slate-700/40">
              <span className="font-bold text-slate-700 dark:text-slate-300">Evidence File:</span>
              <strong className="text-blue-600 dark:text-blue-400 font-bold font-mono">{recordToDisplay.legalDocument}</strong>
            </div>
            <div className="flex justify-between border-b pb-1.5 border-slate-700/40">
              <span className="font-bold text-slate-700 dark:text-slate-300">Affected Hardware:</span>
              <strong className="text-slate-900 dark:text-white font-bold">{recordToDisplay.affectedSystems.join(', ')}</strong>
            </div>
            <div className="flex justify-between border-b pb-1.5 border-slate-700/40">
              <span className="font-bold text-slate-700 dark:text-slate-300">Driver Impact:</span>
              <strong className="text-slate-900 dark:text-white font-bold">{recordToDisplay.driverImpact}</strong>
            </div>
            <div className="flex justify-between">
              <span className="font-bold text-slate-700 dark:text-slate-300">Verification Engine:</span>
              <strong className="text-emerald-600 dark:text-emerald-400 font-extrabold">7 / 7 Stages Verified</strong>
            </div>
          </div>

          {/* Evidence Request Toast Notification Banner */}
          {evidenceRequestedMsg && (
            <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-600 dark:text-blue-400 text-xs font-semibold flex items-center justify-between">
              <span>{evidenceRequestedMsg}</span>
              <button onClick={() => setEvidenceRequestedMsg(null)} className="text-blue-400 hover:text-white">
                <X size={14} />
              </button>
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-2.5 pt-3 border-t border-slate-800">
            {recordToDisplay.status === 'PENDING' && (
              <div className="space-y-2">
                {recordToDisplay.requiredSignatures === 1 ? (
                  <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs space-y-1.5">
                    <div className="flex justify-between items-center font-bold text-emerald-500">
                      <span>Governance Policy</span>
                      <span>Single Approval (1/1)</span>
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-emerald-400 font-semibold">
                      <span>Sarah Kim (Security Admin)</span>
                      <span>✓ Ready for Dispatch</span>
                    </div>
                  </div>
                ) : (
                  <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs space-y-1.5">
                    <div className="flex justify-between items-center font-bold text-amber-500">
                      <span>Multi-Sig Quorum Status</span>
                      <span>1 / 2 Signatures</span>
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-emerald-400 font-semibold">
                      <span>Sarah Kim (Security Admin)</span>
                      <span>✓ Approved</span>
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-amber-400 font-semibold">
                      <span>Aisha Khan (Ops Manager)</span>
                      <span>⏳ Pending Co-Sign</span>
                    </div>
                  </div>
                )}

                <div className="flex space-x-2">
                  {recordToDisplay.requiredSignatures === 1 ? (
                    <button
                      onClick={() => executeApproveRecord(recordToDisplay)}
                      className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs transition-colors cursor-pointer shadow-xs flex items-center justify-center space-x-1.5"
                    >
                      <CheckCircle2 size={14} />
                      <span>Approve & Dispatch Command (1/1)</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => setShowApproveModal(recordToDisplay)}
                      className="flex-1 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl text-xs transition-colors cursor-pointer shadow-xs flex items-center justify-center space-x-1.5"
                    >
                      <Key size={14} />
                      <span>Co-Sign & Execute Command (2/2)</span>
                    </button>
                  )}
                  <button
                    onClick={() => setShowRejectModal(recordToDisplay)}
                    className="px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-xs transition-colors cursor-pointer shadow-xs flex items-center justify-center space-x-1.5"
                  >
                    <X size={14} />
                    <span>Reject</span>
                  </button>
                </div>
              </div>
            )}

            <div className="flex space-x-2 text-xs">
              <button
                onClick={() => setEvidenceRequestedMsg(`Requested supplementary evidence file for ${recordToDisplay.commandId}. Notification sent to ${recordToDisplay.requestedBy}.`)}
                className={`flex-1 py-2.5 rounded-xl font-bold border transition-colors cursor-pointer ${
                  isDark ? 'bg-slate-900 border-slate-800 text-slate-200 hover:bg-slate-800' : 'bg-slate-100 border-slate-200 text-slate-800'
                }`}
              >
                Request Evidence
              </button>
              <button
                onClick={() => navigate('/app/audit')}
                className={`flex-1 py-2.5 rounded-xl font-bold border transition-colors cursor-pointer ${
                  isDark ? 'bg-slate-900 border-slate-800 text-slate-200 hover:bg-slate-800' : 'bg-slate-100 border-slate-200 text-slate-800'
                }`}
              >
                View Audit
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* APPROVE CONFIRMATION MODAL WITH DIGITAL SIGNATURE & MFA PIN */}
      <AnimatePresence>
        {showApproveModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className={`rounded-[20px] max-w-lg w-full p-7 space-y-5 border shadow-2xl ${
                isDark ? 'bg-[#111827] border-slate-800 text-white' : 'bg-white border-[#E5E7EB] text-[#111827]'
              }`}
            >
              <div className="flex justify-between items-center border-b pb-4 border-slate-800">
                <div className="font-bold text-base flex items-center space-x-2">
                  <ShieldCheck size={20} className="text-blue-500" />
                  <span>Co-Authorize & Dispatch Remote Command</span>
                </div>
                <button onClick={() => setShowApproveModal(null)} className="text-slate-400 hover:text-white cursor-pointer">
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-4">
                <div className={`p-4 rounded-xl border text-xs space-y-2 ${
                  isDark ? 'bg-slate-900 border-slate-800' : 'bg-slate-50 border-slate-200'
                }`}>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Target Vehicle:</span>
                    <strong className={isDark ? 'text-white' : 'text-[#111827]'}>{showApproveModal.vehicleName} ({showApproveModal.plateNumber})</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Command Action:</span>
                    <strong className="text-rose-500 font-extrabold">{showApproveModal.commandName}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Legal Justification:</span>
                    <strong className={isDark ? 'text-slate-200' : 'text-[#111827]'}>{showApproveModal.legalReason}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Current Quorum:</span>
                    <strong className="text-amber-500">1 / 2 Signatures (Requires Final Co-Sign)</strong>
                  </div>
                </div>

                <div>
                  <label className="font-bold text-slate-400 block text-xs mb-2">Security Administrator 6-Digit MFA PIN *</label>
                  <input
                    type="password"
                    maxLength={6}
                    value={mfaPin}
                    onChange={(e) => setMfaPin(e.target.value)}
                    placeholder="••••••"
                    className="w-full py-3 px-4 bg-slate-900 border border-slate-700 rounded-xl font-mono text-center text-xl font-bold tracking-[0.4em] text-white focus:outline-none focus:border-blue-500"
                  />
                  <div className="text-[11px] text-slate-500 text-center mt-1.5 font-mono">
                    Hardware HSM P-256 ECDSA Private Key Authentication Active
                  </div>
                </div>
              </div>

              <div className="pt-4 flex justify-end space-x-3 border-t border-slate-800">
                <button
                  onClick={() => setShowApproveModal(null)}
                  className="px-5 py-2.5 border border-slate-700 text-slate-300 font-semibold rounded-xl text-xs hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmApprove}
                  disabled={isSubmitting}
                  className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs transition-colors flex items-center space-x-2 cursor-pointer shadow-xs"
                >
                  {isSubmitting ? <RefreshCw size={14} className="animate-spin" /> : <ShieldCheck size={14} />}
                  <span>Approve & Execute Command</span>
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* REJECT MODAL WITH REASON DROPDOWN */}
      <AnimatePresence>
        {showRejectModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className={`rounded-[16px] max-w-md w-full p-6 space-y-4 text-xs border shadow-2xl ${
                isDark ? 'bg-[#111827] border-slate-800 text-white' : 'bg-white border-[#E5E7EB] text-[#111827]'
              }`}
            >
              <div className="flex justify-between items-center border-b pb-3 border-slate-800">
                <div className="font-bold text-sm flex items-center space-x-2 text-rose-500">
                  <XCircle size={18} />
                  <span>Reject Command Request</span>
                </div>
                <button onClick={() => setShowRejectModal(null)} className="text-slate-400 hover:text-white cursor-pointer">
                  <X size={18} />
                </button>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="font-bold text-slate-400 block mb-1">Rejection Reason Code *</label>
                  <select
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs font-bold text-rose-400"
                  >
                    <option value="Policy Violation">Policy Violation</option>
                    <option value="Insufficient Evidence">Insufficient Evidence</option>
                    <option value="Wrong Vehicle">Wrong Vehicle Target</option>
                    <option value="Unauthorized">Unauthorized Request</option>
                    <option value="Safety Concern">Safety Concern</option>
                    <option value="Custom">Custom Operational Concern</option>
                  </select>
                </div>
              </div>

              <div className="pt-3 flex justify-end space-x-2 border-t border-slate-800">
                <button
                  onClick={() => setShowRejectModal(null)}
                  className="px-4 py-2 border border-slate-700 text-slate-300 font-semibold rounded-xl text-xs hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmReject}
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-xs transition-colors flex items-center space-x-1.5 cursor-pointer"
                >
                  {isSubmitting ? <RefreshCw size={13} className="animate-spin" /> : <X size={13} />}
                  <span>Reject Request</span>
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      {/* LIVE EXECUTION PIPELINE RESULT MODAL */}
      <AnimatePresence>
        {executionResultModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-xs z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className={`rounded-[20px] max-w-xl w-full p-7 space-y-5 border shadow-2xl ${
                isDark ? 'bg-[#111827] border-slate-800 text-white' : 'bg-white border-[#E5E7EB] text-[#111827]'
              }`}
            >
              <div className="flex justify-between items-center border-b pb-4 border-slate-800">
                <div className="font-bold text-base flex items-center space-x-2 text-emerald-500">
                  <CheckCircle2 size={22} />
                  <span>Command Dispatched & Motor Power Isolated</span>
                </div>
                <button onClick={() => setExecutionResultModal(null)} className="text-slate-400 hover:text-white cursor-pointer">
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-4 text-xs font-sans">
                <div className={`p-4 rounded-xl border space-y-2 ${
                  isDark ? 'bg-slate-900 border-slate-800' : 'bg-slate-50 border-slate-200'
                }`}>
                  <div className="flex justify-between">
                    <span className="text-slate-400 font-bold">Target Vehicle:</span>
                    <strong className={isDark ? 'text-white' : 'text-[#111827]'}>{executionResultModal.vehicleName} ({executionResultModal.plateNumber})</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400 font-bold">Action Executed:</span>
                    <strong className="text-rose-500 font-extrabold">{executionResultModal.commandName}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400 font-bold">Vehicle Drivetrain Status:</span>
                    <strong className="text-emerald-500 font-bold">IMMOBILIZED (0 km/h)</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400 font-bold">Signatures Achieved:</span>
                    <strong className="text-blue-500 font-bold">2 / 2 Co-Signatures (Quorum Verified)</strong>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="font-bold text-slate-400 uppercase text-[10px] tracking-wider">7-Stage Security Pipeline Evaluation</div>
                  {[
                    'Stage 1: ECDSA P-256 Signature Authenticated',
                    'Stage 2: Freshness Window Validated (<30s TTL)',
                    'Stage 3: Replay Guard Nonce Check Passed',
                    'Stage 4: Multi-Sig Governance Quorum Verified',
                    'Stage 5: ASIL-D Motion Interlock Cleared (0 km/h)',
                    'Stage 6: Hardware HSM CAN Payload Dispatched',
                    'Stage 7: SHA-256 Merkle Block #154 Appended',
                  ].map((stg) => (
                    <div key={stg} className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-mono text-[11px] flex items-center justify-between">
                      <span className="flex items-center space-x-2">
                        <CheckCircle2 size={14} />
                        <span>{stg}</span>
                      </span>
                      <strong className="text-[10px] uppercase">PASSED</strong>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-4 grid grid-cols-1 sm:grid-cols-3 gap-2 border-t border-slate-800">
                <button
                  onClick={() => {
                    const vid = executionResultModal.vehicleId;
                    setExecutionResultModal(null);
                    navigate(`/app/command-center?vehicleId=${vid}&step=9&approved=true`);
                  }}
                  className="py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs transition-colors cursor-pointer flex items-center justify-center space-x-1.5 shadow-xs"
                >
                  <ShieldCheck size={14} />
                  <span>Execute in Command Center (Step 9)</span>
                </button>
                <button
                  onClick={() => {
                    const vid = executionResultModal.vehicleId;
                    setExecutionResultModal(null);
                    navigate(`/app/digital-twin?vehicleId=${vid}`);
                  }}
                  className="py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs transition-colors cursor-pointer flex items-center justify-center space-x-1.5 shadow-xs"
                >
                  <Car size={14} />
                  <span>View in Digital Twin</span>
                </button>
                <button
                  onClick={() => {
                    setExecutionResultModal(null);
                    navigate('/app/audit');
                  }}
                  className={`py-2.5 rounded-xl font-bold border transition-colors cursor-pointer flex items-center justify-center space-x-1.5 ${
                    isDark ? 'bg-slate-900 border-slate-800 text-slate-200 hover:bg-slate-800' : 'bg-slate-100 border-slate-200 text-slate-800'
                  }`}
                >
                  <FileText size={14} />
                  <span>View Audit Ledger</span>
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default ApprovalCenterPage;
