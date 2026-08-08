import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
// @ts-ignore
import { pageVariants } from '@/motion/variants';
import { useTheme } from '@/providers/theme-provider';
import { getVehicleImage } from '@/utils/vehicle-images';
import {
  Car,
  Terminal,
  ShieldCheck,
  Zap,
  Radio,
  Clock,
  Search,
  CheckCircle2,
  AlertTriangle,
  Send,
  Lock,
  Wrench,
  FileText,
  Upload,
  UserCheck,
  ChevronRight,
  ShieldAlert,
  Play,
  Cpu,
  Layers,
  FileCheck,
  RefreshCw,
  Download,
  Eye,
  X,
  AlertCircle,
  Activity,
  Key,
  Flame,
  Check,
  FileSpreadsheet
} from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';

interface VehicleOption {
  id: string;
  name: string;
  plate: string;
  vin: string;
  owner: string;
  driver: string;
  battery: number;
  speed: number;
  location: string;
  status: string;
  connection: string;
  trustScore: number;
  securityScore: number;
  firmware: string;
  health: string;
  fleetGroup: string;
  passengers: number;
}

interface CommandItem {
  id: string;
  name: string;
  category: 'Vehicle Control' | 'Motion Control' | 'Software' | 'Security';
  riskLevel: 'Low' | 'Medium' | 'High' | 'Critical';
  needsMultiSig: boolean;
  expectedDuration: string;
  affectedHardware: string[];
  reasonRequired: boolean;
}

export function CommandCenterPage() {
  const navigate = useNavigate();
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';

  // 7 Zero-Trust Wizard Steps (Operators submit requests; Approval Center & Verification Pipeline handle execution)
  const wizardSteps = [
    { id: 1, label: 'Vehicle' },
    { id: 2, label: 'Command' },
    { id: 3, label: 'Legal Reason' },
    { id: 4, label: 'Risk' },
    { id: 5, label: 'Impact' },
    { id: 6, label: 'Driver Impact' },
    { id: 7, label: 'Review & Submit' },
  ];

  const [searchQuery, setSearchQuery] = useState<string>('');

  // Step 1: Vehicle Selection List
  const vehiclesList: VehicleOption[] = [
    {
      id: 'TR-101',
      name: 'Sargam Electric Rickshaw',
      plate: 'MH-12-ER-1001',
      vin: '1FTVW1ELXNW000001',
      owner: 'Rajesh Kumar',
      driver: 'Rajesh Kumar',
      battery: 85,
      speed: 18,
      location: 'Hyderabad',
      status: 'Moving',
      connection: 'Online',
      trustScore: 98,
      securityScore: 99,
      firmware: 'v2.5.1',
      health: 'Optimal',
      fleetGroup: 'Hyderabad Passenger Fleet',
      passengers: 2,
    },
    {
      id: 'TR-102',
      name: 'Mahindra Treo',
      plate: 'KA-01-TR-2002',
      vin: '1FTVW1ELXNW000002',
      owner: 'Rahul Sharma',
      driver: 'Rahul Sharma',
      battery: 82,
      speed: 18,
      location: 'Hyderabad',
      status: 'Moving',
      connection: 'Online',
      trustScore: 98,
      securityScore: 97,
      firmware: 'v2.4.3',
      health: 'Optimal',
      fleetGroup: 'Secunderabad Auto Fleet',
      passengers: 1,
    },
    {
      id: 'TR-103',
      name: 'Piaggio Ape E-City',
      plate: 'DL-01-AP-3003',
      vin: '1FTVW1ELXNW000003',
      owner: 'Imran Khan',
      driver: 'Imran Khan',
      battery: 90,
      speed: 0,
      location: 'Delhi',
      status: 'Idle',
      connection: 'Online',
      trustScore: 95,
      securityScore: 96,
      firmware: 'v2.5.0',
      health: 'Optimal',
      fleetGroup: 'North Zone Logistics',
      passengers: 0,
    },
    {
      id: 'V-1004',
      name: 'Euler HiLoad EV',
      plate: 'HR-26-EU-4004',
      vin: '1FTVW1ELXNW000004',
      owner: 'Vikram Singh',
      driver: 'Vikram Singh',
      battery: 76,
      speed: 0,
      location: 'Gurugram',
      status: 'Maintenance',
      connection: 'Online',
      trustScore: 90,
      securityScore: 92,
      firmware: 'v2.3.8',
      health: 'Warning',
      fleetGroup: 'NCR Commercial Pickups',
      passengers: 0,
    },
    {
      id: 'V-1005',
      name: 'Omega Seiki Rage+',
      plate: 'TS-09-OS-5005',
      vin: '1FTVW1ELXNW000005',
      owner: 'Suresh Joshi',
      driver: 'Suresh Joshi',
      battery: 15,
      speed: 0,
      location: 'Secunderabad',
      status: 'Immobilized',
      connection: 'Online',
      trustScore: 85,
      securityScore: 88,
      firmware: 'v2.1.6',
      health: 'Critical',
      fleetGroup: 'Express Delivery Trikes',
      passengers: 0,
    },
  ];

  const [searchParams] = useSearchParams();
  const targetVehicleId = searchParams.get('vehicleId');
  const targetStepStr = searchParams.get('step');
  const isApprovedQuery = searchParams.get('approved') === 'true';

  const [currentStep, setCurrentStep] = useState<number>(() => {
    const num = Number(targetStepStr);
    return num >= 1 && num <= 10 ? num : 1;
  });

  useEffect(() => {
    if (targetStepStr) {
      const num = Number(targetStepStr);
      if (num >= 1 && num <= 10) setCurrentStep(num);
    }
  }, [targetStepStr]);

  const [selectedVehicle, setSelectedVehicle] = useState<VehicleOption>(() => {
    if (targetVehicleId) {
      const match = vehiclesList.find((v) => v.id === targetVehicleId);
      if (match) return match;
    }
    return vehiclesList[0]; // Sargam Rickshaw default
  });

  useEffect(() => {
    if (targetVehicleId) {
      const match = vehiclesList.find((v) => v.id === targetVehicleId);
      if (match) setSelectedVehicle(match);
    }
  }, [targetVehicleId]);

  // Step 2: Categorized Command Options
  const categorizedCommands: CommandItem[] = [
    // Vehicle Control (Low Risk)
    { id: 'LOCK_DOORS', name: 'Lock Doors', category: 'Vehicle Control', riskLevel: 'Low', needsMultiSig: false, expectedDuration: '2 sec', affectedHardware: ['Door Lock', 'ECU'], reasonRequired: false },
    { id: 'UNLOCK_DOORS', name: 'Unlock Doors', category: 'Vehicle Control', riskLevel: 'Low', needsMultiSig: false, expectedDuration: '2 sec', affectedHardware: ['Door Lock', 'ECU'], reasonRequired: false },
    { id: 'HORN', name: 'Sound Horn', category: 'Vehicle Control', riskLevel: 'Low', needsMultiSig: false, expectedDuration: '1 sec', affectedHardware: ['ECU', 'CAN Bus'], reasonRequired: false },
    { id: 'FLASH_LIGHTS', name: 'Flash Lights', category: 'Vehicle Control', riskLevel: 'Low', needsMultiSig: false, expectedDuration: '2 sec', affectedHardware: ['ECU', 'CAN Bus'], reasonRequired: false },

    // Motion Control (Medium / High Risk)
    { id: 'IMMOBILIZE', name: 'Immobilize Drivetrain', category: 'Motion Control', riskLevel: 'High', needsMultiSig: true, expectedDuration: '15 sec', affectedHardware: ['Motor Controller', 'ECU', 'CAN Bus', 'Telematics'], reasonRequired: true },
    { id: 'RESTORE', name: 'Restore Vehicle Drivetrain', category: 'Motion Control', riskLevel: 'Medium', needsMultiSig: true, expectedDuration: '10 sec', affectedHardware: ['Motor Controller', 'ECU'], reasonRequired: true },
    { id: 'SPEED_LIMIT', name: 'Enforce Speed Limit (25 km/h)', category: 'Motion Control', riskLevel: 'Medium', needsMultiSig: false, expectedDuration: '5 sec', affectedHardware: ['Motor Controller', 'ECU'], reasonRequired: true },
    { id: 'ENABLE_SAFE_MODE', name: 'Enable Safe Mode', category: 'Motion Control', riskLevel: 'Medium', needsMultiSig: false, expectedDuration: '5 sec', affectedHardware: ['ECU', 'Battery BMS'], reasonRequired: true },

    // Software (Medium Risk)
    { id: 'OTA_UPDATE', name: 'OTA Firmware Update', category: 'Software', riskLevel: 'Medium', needsMultiSig: false, expectedDuration: '45 sec', affectedHardware: ['ECU', 'Network Gateway', 'Telematics'], reasonRequired: true },
    { id: 'RESTART_TELEMATICS', name: 'Restart Telematics', category: 'Software', riskLevel: 'Low', needsMultiSig: false, expectedDuration: '8 sec', affectedHardware: ['Telematics', 'GPS'], reasonRequired: false },
    { id: 'SYNC_CONFIG', name: 'Sync Configuration', category: 'Software', riskLevel: 'Low', needsMultiSig: false, expectedDuration: '3 sec', affectedHardware: ['ECU', 'Network Gateway'], reasonRequired: false },
    { id: 'RESET_ECU', name: 'Reset ECU Controller', category: 'Software', riskLevel: 'Medium', needsMultiSig: true, expectedDuration: '12 sec', affectedHardware: ['ECU', 'CAN Bus'], reasonRequired: true },

    // Security (High Risk)
    { id: 'DISABLE_DIGITAL_KEY', name: 'Disable Digital Key', category: 'Security', riskLevel: 'High', needsMultiSig: true, expectedDuration: '5 sec', affectedHardware: ['Digital Keys', 'ECU'], reasonRequired: true },
    { id: 'ROTATE_CERTIFICATES', name: 'Rotate Security Certificates', category: 'Security', riskLevel: 'High', needsMultiSig: true, expectedDuration: '15 sec', affectedHardware: ['Digital Keys', 'Network Gateway'], reasonRequired: true },
    { id: 'REVOKE_DRIVER_ACCESS', name: 'Revoke Driver Access', category: 'Security', riskLevel: 'High', needsMultiSig: true, expectedDuration: '5 sec', affectedHardware: ['Digital Keys', 'ECU'], reasonRequired: true },
    { id: 'EMERGENCY_LOCKDOWN', name: 'Emergency Lockdown', category: 'Security', riskLevel: 'Critical', needsMultiSig: true, expectedDuration: '3 sec', affectedHardware: ['Motor Controller', 'Door Lock', 'ECU', 'Telematics'], reasonRequired: true },
  ];

  const [selectedCommand, setSelectedCommand] = useState<CommandItem>(categorizedCommands[4]); // Immobilize default

  // Step 3: Legal Justification & Evidence Form State
  const legalReasonsList = [
    'Vehicle Theft',
    'Emergency Response',
    'Scheduled Maintenance',
    'Driver Safety',
    'Remote Diagnostics',
    'Owner Request',
    'Firmware Update',
    'Law Enforcement',
    'Court Order',
    'Fleet Policy Enforcement',
    'Accident Recovery',
    'Battery Safety Issue',
    'Testing / Simulation',
  ];

  const [legalReason, setLegalReason] = useState<string>('Vehicle Theft');
  const [complaintNumber, setComplaintNumber] = useState<string>('FIR-2026-HYD-9912');
  const [ticketNumber, setTicketNumber] = useState<string>('TKT-88412');
  const [engineerName, setEngineerName] = useState<string>('Prakash Rao (Lead EV Tech)');
  const [ownerName, setOwnerName] = useState<string>('Rahul Sharma');
  const [justificationRemarks, setJustificationRemarks] = useState<string>('Reported stolen by driver near Ameerpet junction. Police FIR lodged.');
  const [uploadedDoc, setUploadedDoc] = useState<any>({
    documentId: 'DOC-882194',
    filename: 'Police_FIR_Report_HYD_9912.pdf',
    hash: '0x8f9a2e3b1c4d5e6f7a8b9c0d1e2f3a4b',
    storageUrl: '/api/evidence/DOC-882194',
  });

  // Step 8: Multi-Sig Approvers State
  const [approver1Status, setApprover1Status] = useState<'Pending' | 'Approved'>('Approved');
  const [approver2Status, setApprover2Status] = useState<'Pending' | 'Approved'>(() => (isApprovedQuery ? 'Approved' : 'Pending'));
  const [approver1Time] = useState<string>('09:45');
  const [approver2Time, setApprover2Time] = useState<string>(() => (isApprovedQuery ? 'Just now' : ''));

  useEffect(() => {
    if (isApprovedQuery) {
      setApprover2Status('Approved');
      setApprover2Time('Just now');
    }
  }, [isApprovedQuery]);

  // Execution & Pipeline Animation State
  const [isExecuting, setIsExecuting] = useState<boolean>(false);
  const [executionStage, setExecutionStage] = useState<number>(0);
  const [executionResult, setExecutionResult] = useState<any>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Evidence Upload Handler
  const handleUploadEvidence = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    const filename = file ? file.name : `${legalReason.replace(/\s+/g, '_')}_Evidence.pdf`;

    try {
      const res = await fetch('/api/evidence/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filename }),
      });
      if (res.ok) {
        const data = await res.json();
        setUploadedDoc(data);
      } else {
        setUploadedDoc({
          documentId: 'DOC-' + Math.floor(100000 + Math.random() * 900000),
          filename,
          hash: '0x' + Array.from({ length: 32 }, () => Math.floor(Math.random() * 16).toString(16)).join(''),
          storageUrl: '/api/evidence/DOC-uploaded',
        });
      }
    } catch {
      setUploadedDoc({
        documentId: 'DOC-' + Math.floor(100000 + Math.random() * 900000),
        filename,
        hash: '0x' + Array.from({ length: 32 }, () => Math.floor(Math.random() * 16).toString(16)).join(''),
        storageUrl: '/api/evidence/DOC-uploaded',
      });
    }
  };

  const [submittedResult, setSubmittedResult] = useState<any>(null);

  // Step Advancement
  const handleNextStep = () => {
    if (currentStep < 7) setCurrentStep((prev) => prev + 1);
  };

  const handlePrevStep = () => {
    if (currentStep > 1) setCurrentStep((prev) => prev - 1);
  };

  // Submit Command Request to Backend & Queue in Approval Center
  const handleSubmitCommand = async () => {
    if (currentStep === 7) {
      const payload = {
        vehicleId: selectedVehicle.id,
        action: selectedCommand.id,
        reasonCode: legalReason,
        reasonText: justificationRemarks,
        issuerId: 'Fleet Manager (Sarah Kim)',
      };

      let createdApprId = '';
      try {
        const res = await fetch('/api/commands', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        if (res.ok || res.status === 201) {
          const data = await res.json();
          if (data.approvalId) createdApprId = data.approvalId;
        }
      } catch {
        // Fallback
      }

      if (!createdApprId) {
        createdApprId = 'APP-' + Math.floor(1000 + Math.random() * 9000);
      }

      const reqSigs = ['IMMOBILIZE', 'EMERGENCY_LOCKDOWN', 'BATTERY_ISOLATION', 'FIRMWARE_ROLLBACK', 'DISABLE_DIGITAL_KEY', 'RESTORE_VEHICLE_DRIVETRAIN', 'RESTORE'].includes(selectedCommand.id) ? 2 : 1;

      const newPendingRecord = {
        id: createdApprId,
        commandId: 'CMD-' + Math.floor(1000 + Math.random() * 9000),
        vehicleId: selectedVehicle.id,
        vehicleName: selectedVehicle.name,
        plateNumber: selectedVehicle.plate,
        vehicleImage: (selectedVehicle as any).imageEmoji || '⚡',
        action: selectedCommand.id,
        commandName: selectedCommand.name,
        riskLevel: reqSigs === 2 ? (selectedCommand.id.includes('IMMOBILIZE') ? 'Critical' : 'High') : 'Low',
        riskScore: selectedCommand.id.includes('IMMOBILIZE') ? 92 : reqSigs === 2 ? 75 : 25,
        requestedBy: 'Sarah Kim (Security Admin)',
        requesterRole: 'Security Admin',
        legalReason: legalReason,
        legalDocument: uploadedDoc.filename,
        justification: justificationRemarks || `Remote ${selectedCommand.name} requested per fleet security protocol`,
        currentSpeed: `${selectedVehicle.speed} km/h`,
        batteryLevel: selectedVehicle.battery,
        requestedAt: new Date().toISOString().replace('T', ' ').slice(0, 19),
        waitingSince: 'Just now',
        status: 'PENDING',
        signaturesCount: 1,
        requiredSignatures: reqSigs,
        approvers: [
          { name: 'Sarah Kim', role: 'Security Admin', time: 'Just now', approved: true },
          { name: 'Aisha Khan', role: 'Ops Manager', time: reqSigs === 2 ? 'Waiting' : 'Auto-Approved', approved: reqSigs === 1 },
        ],
        auditHash: '0x' + Array.from({ length: 32 }, () => Math.floor(Math.random() * 16).toString(16)).join(''),
        affectedSystems: selectedCommand.affectedHardware,
        driverImpact: reqSigs === 2 ? 'Pending second administrator co-signature.' : 'Single approval threshold met.',
        executionStatus: 'Waiting Approval',
        executionTime: '--',
      };

      sessionStorage.setItem('pendingSubmission', JSON.stringify(newPendingRecord));

      // Immediately navigate user to Approval Center to Co-Sign!
      navigate(`/app/approval-center?highlightAppr=${createdApprId}`);
    } else {
      handleNextStep();
    }
  };

  const runExecutionPipeline = async () => {
    setCurrentStep(9);
    setIsExecuting(true);
    setExecutionStage(1);

    // 7 verification stages
    const stages = [1, 2, 3, 4, 5, 6, 7];
    for (const s of stages) {
      setExecutionStage(s);
      await new Promise((r) => setTimeout(r, 400));
    }

    try {
      const payload = {
        vehicleId: selectedVehicle.id,
        action: selectedCommand.id,
        reasonCode: legalReason.toLowerCase().replace(/\s+/g, '_'),
        reasonText: justificationRemarks,
        issuerId: 'fin-001',
      };

      const res = await fetch('/api/commands', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const data = await res.json();
        setExecutionResult(data);
      } else {
        setExecutionResult({
          commandId: 'CMD-' + Math.floor(1000 + Math.random() * 9000),
          verificationHash: '0x8f9a2e3b1c4d5e6f7a8b9c0d1e2f3a4b',
          status: 'EXECUTED',
          executionTime: '42 ms',
        });
      }
    } catch {
      setExecutionResult({
        commandId: 'CMD-' + Math.floor(1000 + Math.random() * 9000),
        verificationHash: '0x8f9a2e3b1c4d5e6f7a8b9c0d1e2f3a4b',
        status: 'EXECUTED',
        executionTime: '42 ms',
      });
    } finally {
      setIsExecuting(false);
      setCurrentStep(10); // Audit step
    }
  };

  const selectedVehicleImg = getVehicleImage(selectedVehicle.id);

  // Hardware Nodes for Step 5
  const allHardwareNodes = [
    'Vehicle',
    'Motor Controller',
    'Battery BMS',
    'Telematics',
    'GPS',
    'ECU',
    'Door Lock',
    'Charging Module',
    'Digital Keys',
    'CAN Bus',
    'Network Gateway',
  ];

  // Calculated Risk Analysis (Step 4)
  const isVehicleMoving = selectedVehicle.speed > 0;
  const calculatedRiskScore = isVehicleMoving && selectedCommand.id === 'IMMOBILIZE' ? 92 : selectedCommand.riskLevel === 'High' ? 85 : 45;
  const calculatedSeverity = calculatedRiskScore > 90 ? 'Critical' : calculatedRiskScore > 75 ? 'High' : 'Medium';

  return (
    <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit" className="space-y-6 font-sans">
      {/* 1. PAGE HEADER */}
      <div>
        <h1 className={`text-[32px] font-bold tracking-tight leading-none ${isDark ? 'text-white' : 'text-[#111827]'}`}>
          Command Center
        </h1>
        <p className={`text-sm mt-2 font-normal ${isDark ? 'text-slate-400' : 'text-[#475569]'}`}>
          Zero-Trust Guided Remote Command Workflow & Verification Engine
        </p>
      </div>

      {/* 2. 10-STEP PROGRESS STEPPER BAR */}
      <div className={`p-4 rounded-lg border shadow-xs overflow-x-auto ${isDark ? 'bg-[#111827] border-slate-800' : 'bg-white border-[#E5E7EB]'}`}>
        <div className="flex items-center space-x-2 min-w-max">
          {wizardSteps.map((s) => {
            const isCompleted = s.id < currentStep;
            const isCurrent = s.id === currentStep;

            return (
              <div key={s.id} className="flex items-center space-x-2">
                <button
                  onClick={() => setCurrentStep(s.id)}
                  className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer ${
                    isCompleted
                      ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                      : isCurrent
                      ? 'bg-blue-600 text-white shadow-xs'
                      : isDark
                      ? 'bg-slate-900 border-slate-800 text-slate-400'
                      : 'bg-slate-100 border-slate-200 text-slate-700 font-bold'
                  }`}
                >
                  <span className="w-5 h-5 rounded-md flex items-center justify-center text-[10px] border border-current font-extrabold">
                    {isCompleted ? '✓' : s.id}
                  </span>
                  <span>{s.label}</span>
                </button>
                {s.id < 10 && <ChevronRight size={14} className="text-slate-400 dark:text-slate-700" />}
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. MAIN STEP CONTAINER */}
      <div className={`p-6 rounded-lg border shadow-xs transition-colors space-y-6 ${
        isDark ? 'bg-[#111827] border-slate-800' : 'bg-white border-[#E5E7EB]'
      }`}>
        {/* STEP 1: VEHICLE SELECTION */}
        {currentStep === 1 && (
          <div className="space-y-5">
            <div className="font-bold text-base border-b pb-3 border-slate-800 flex justify-between items-center">
              <span className={isDark ? 'text-white' : 'text-[#111827]'}>Step 1 — Target Vehicle Selection</span>
              <span className="text-xs text-slate-400 font-mono">Select target vehicle for remote command</span>
            </div>

            <div className="relative">
              <Search className="absolute left-3.5 top-3 text-slate-400" size={16} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by Vehicle Name, Plate Number, VIN, Driver Name, or Fleet Group..."
                className={`w-full pl-10 pr-4 py-2.5 rounded-xl text-xs font-medium border focus:outline-none ${
                  isDark ? 'bg-slate-900 border-slate-800 text-white focus:border-blue-500' : 'bg-[#F8FAFC] border-[#E5E7EB] text-[#111827] focus:border-blue-500'
                }`}
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Vehicle List Cards (65%) */}
              <div className="lg:col-span-8 space-y-3 max-h-[420px] overflow-y-auto pr-1">
                {vehiclesList
                  .filter((v) => {
                    const q = searchQuery.toLowerCase();
                    return (
                      v.name.toLowerCase().includes(q) ||
                      v.plate.toLowerCase().includes(q) ||
                      v.vin.toLowerCase().includes(q) ||
                      v.driver.toLowerCase().includes(q) ||
                      v.fleetGroup.toLowerCase().includes(q)
                    );
                  })
                  .map((v) => {
                    const isSelected = v.id === selectedVehicle.id;
                    const imgInfo = getVehicleImage(v.id);

                    return (
                      <div
                        key={v.id}
                        onClick={() => setSelectedVehicle(v)}
                        className={`p-4 rounded-xl border transition-all cursor-pointer ${
                          isSelected
                            ? 'border-2 border-blue-600 bg-blue-50/60 dark:bg-blue-500/10 shadow-xs'
                            : isDark
                            ? 'border-slate-800 bg-slate-900/40 hover:border-slate-700'
                            : 'border-slate-200 bg-white hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3.5">
                            <div className="w-14 h-14 rounded-xl bg-slate-100 dark:bg-slate-800 p-0.5 flex items-center justify-center shrink-0 border border-slate-200 dark:border-slate-700 overflow-hidden">
                              {imgInfo.imageUrl ? (
                                <img src={imgInfo.imageUrl} alt={v.name} className="w-full h-full object-contain" />
                              ) : (
                                <span className="text-2xl">{imgInfo.imageEmoji}</span>
                              )}
                            </div>
                            <div>
                              <div className={`font-bold text-xs ${isDark ? 'text-white' : 'text-[#111827]'}`}>{v.name}</div>
                              <div className="text-[11px] font-mono text-slate-400 mt-0.5">{v.plate} • Driver: {v.driver}</div>
                              <div className="text-[11px] text-slate-500 font-semibold mt-0.5">
                                Battery: <strong className="text-blue-500">{v.battery}%</strong> • Speed: <strong>{v.speed} km/h</strong> • {v.location}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center space-x-4">
                            <div className="text-right text-xs font-bold">
                              <span className="text-emerald-500">● {v.connection}</span>
                              <div className="text-[10px] text-purple-600 dark:text-purple-400 mt-0.5">Trust Score: {v.trustScore}%</div>
                            </div>
                            <button
                              onClick={(e) => { e.stopPropagation(); setSelectedVehicle(v); handleNextStep(); }}
                              className={`px-4 py-2 rounded-xl font-bold text-xs cursor-pointer transition-colors ${
                                isSelected ? 'bg-blue-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200'
                              }`}
                            >
                              Select
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>

              {/* Right Side: Selected Vehicle Details Card (35%) */}
              <div className={`lg:col-span-4 p-5 rounded-xl border space-y-4 ${
                isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-slate-50 border-slate-200'
              }`}>
                <div className="font-bold text-xs text-slate-400 uppercase">Selected Target Vehicle Details</div>

                <div className="flex items-center space-x-3">
                  <div className="w-16 h-16 rounded-xl bg-white dark:bg-slate-800 p-1 flex items-center justify-center shrink-0 border border-slate-200 dark:border-slate-700 overflow-hidden">
                    {selectedVehicleImg.imageUrl ? (
                      <img src={selectedVehicleImg.imageUrl} alt={selectedVehicle.name} className="w-full h-full object-contain" />
                    ) : (
                      <span className="text-3xl">{selectedVehicleImg.imageEmoji}</span>
                    )}
                  </div>
                  <div>
                    <div className={`font-bold text-sm ${isDark ? 'text-white' : 'text-[#111827]'}`}>{selectedVehicle.name}</div>
                    <div className="text-xs font-mono text-slate-400">{selectedVehicle.plate}</div>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 inline-block mt-1">
                      ● {selectedVehicle.connection}
                    </span>
                  </div>
                </div>

                <div className="space-y-2 text-xs font-mono">
                  <div>Driver: <strong className={isDark ? 'text-white' : 'text-[#111827]'}>{selectedVehicle.driver}</strong></div>
                  <div>Battery: <strong className="text-blue-500">{selectedVehicle.battery}%</strong></div>
                  <div>Firmware: <strong className="text-purple-500">{selectedVehicle.firmware}</strong></div>
                  <div>Current Location: <strong className={isDark ? 'text-slate-200' : 'text-[#111827]'}>{selectedVehicle.location}</strong></div>
                  <div>Vehicle Health: <strong className="text-emerald-500">{selectedVehicle.health}</strong></div>
                  <div>Security Score: <strong className="text-purple-500">{selectedVehicle.securityScore}%</strong></div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: CATEGORIZED COMMAND CONFIGURATION */}
        {currentStep === 2 && (
          <div className="space-y-5">
            <div className="font-bold text-base border-b pb-3 border-slate-800 flex justify-between items-center">
              <span className={isDark ? 'text-white' : 'text-[#111827]'}>Step 2 — Command Configuration</span>
              <span className="text-xs text-slate-400 font-mono">Target: {selectedVehicle.name} ({selectedVehicle.plate})</span>
            </div>

            <div className="space-y-5 text-xs">
              {(['Vehicle Control', 'Motion Control', 'Software', 'Security'] as const).map((cat) => (
                <div key={cat} className="space-y-2">
                  <div className="font-bold text-slate-400 text-[11px] uppercase tracking-wider">{cat}</div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    {categorizedCommands
                      .filter((c) => c.category === cat)
                      .map((cmd) => {
                        const isSelected = selectedCommand.id === cmd.id;

                        return (
                          <div
                            key={cmd.id}
                            onClick={() => setSelectedCommand(cmd)}
                            className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                              isSelected
                                ? 'border-2 border-blue-600 bg-blue-50/60 dark:bg-blue-500/10 shadow-xs'
                                : isDark
                                ? 'border-slate-800 bg-slate-900/40 hover:border-slate-700'
                                : 'border-slate-200 bg-white hover:border-slate-300'
                            }`}
                          >
                            <div className="font-bold text-xs flex justify-between items-center mb-1">
                              <span className={isDark ? 'text-white' : 'text-[#111827]'}>{cmd.name}</span>
                              <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase border border-current ${
                                cmd.riskLevel === 'High' || cmd.riskLevel === 'Critical'
                                  ? 'bg-rose-50 text-rose-600 border-rose-200 dark:bg-rose-500/10 dark:text-rose-400'
                                  : cmd.riskLevel === 'Medium'
                                  ? 'bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400'
                                  : 'bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-500/10 dark:text-blue-400'
                              }`}>
                                {cmd.riskLevel}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </div>
              ))}

              {/* Automatically Calculated Command Properties */}
              <div className={`p-4 rounded-xl border grid grid-cols-2 sm:grid-cols-5 gap-3 font-mono text-xs ${
                isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-slate-50 border-slate-200'
              }`}>
                <div>Risk: <strong className="text-rose-500 font-extrabold">{selectedCommand.riskLevel.toUpperCase()}</strong></div>
                <div>Needs Multi-Sig: <strong className="text-amber-500">{selectedCommand.needsMultiSig ? 'YES (2/2)' : 'NO'}</strong></div>
                <div>Expected Duration: <strong className="text-blue-500">{selectedCommand.expectedDuration}</strong></div>
                <div>Affected Hardware: <strong className={isDark ? 'text-slate-200' : 'text-[#111827]'}>{selectedCommand.affectedHardware[0]}</strong></div>
                <div>Reason Required: <strong className="text-emerald-500">{selectedCommand.reasonRequired ? 'YES' : 'NO'}</strong></div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: LEGAL JUSTIFICATION & DYNAMIC EVIDENCE FORM */}
        {currentStep === 3 && (
          <div className="space-y-5">
            <div className="font-bold text-base border-b pb-3 border-slate-800 flex justify-between items-center">
              <span className={isDark ? 'text-white' : 'text-[#111827]'}>Step 3 — Legal Justification & Evidence Upload</span>
              <span className="text-xs text-slate-400 font-mono">Step 3 of 10</span>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-500 block mb-1.5">Reason for Command *</label>
                <select
                  value={legalReason}
                  onChange={(e) => setLegalReason(e.target.value)}
                  className={`w-full p-3 rounded-xl border text-xs font-bold ${
                    isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-[#E5E7EB] text-[#111827]'
                  }`}
                >
                  {legalReasonsList.map((r) => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </div>

              {/* Dynamic Form Fields Based on Reason */}
              {legalReason === 'Vehicle Theft' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-slate-500 block mb-1">Police Complaint Number *</label>
                    <input
                      type="text"
                      value={complaintNumber}
                      onChange={(e) => setComplaintNumber(e.target.value)}
                      className={`w-full p-2.5 rounded-xl border text-xs font-mono ${
                        isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-[#111827]'
                      }`}
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-500 block mb-1">Police Control Room Remarks</label>
                    <input
                      type="text"
                      value={justificationRemarks}
                      onChange={(e) => setJustificationRemarks(e.target.value)}
                      className={`w-full p-2.5 rounded-xl border text-xs ${
                        isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-[#111827]'
                      }`}
                    />
                  </div>
                </div>
              )}

              {legalReason === 'Scheduled Maintenance' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-slate-500 block mb-1">Maintenance Ticket Number *</label>
                    <input
                      type="text"
                      value={ticketNumber}
                      onChange={(e) => setTicketNumber(e.target.value)}
                      className={`w-full p-2.5 rounded-xl border text-xs font-mono ${
                        isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-[#111827]'
                      }`}
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-500 block mb-1">Lead Maintenance Engineer</label>
                    <input
                      type="text"
                      value={engineerName}
                      onChange={(e) => setEngineerName(e.target.value)}
                      className={`w-full p-2.5 rounded-xl border text-xs ${
                        isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-[#111827]'
                      }`}
                    />
                  </div>
                </div>
              )}

              {legalReason === 'Owner Request' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-slate-500 block mb-1">Registered Owner Name *</label>
                    <input
                      type="text"
                      value={ownerName}
                      onChange={(e) => setOwnerName(e.target.value)}
                      className={`w-full p-2.5 rounded-xl border text-xs ${
                        isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-[#111827]'
                      }`}
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-500 block mb-1">Authorization Request Number</label>
                    <input
                      type="text"
                      value="REQ-2026-0012"
                      readOnly
                      className={`w-full p-2.5 rounded-xl border text-xs font-mono ${
                        isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-[#111827]'
                      }`}
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="font-bold text-slate-500 block mb-1">Upload Evidence Document (PDF, Image, Video, ZIP, Signed Doc)</label>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileSelect}
                  className="hidden"
                  accept=".pdf,.png,.jpg,.jpeg,.zip,.doc,.docx"
                />
                <div
                  onClick={handleUploadEvidence}
                  className={`p-4 rounded-xl border-2 border-dashed flex flex-col items-center justify-center text-center cursor-pointer transition-colors ${
                    isDark ? 'border-slate-800 bg-slate-900/40 hover:border-blue-500' : 'border-slate-300 bg-white hover:border-blue-500'
                  }`}
                >
                  <Upload size={20} className="text-blue-500 mb-1" />
                  <span className="font-bold text-xs text-blue-600 dark:text-blue-400">{uploadedDoc.filename}</span>
                  <span className="text-[10px] text-slate-400 mt-0.5">
                    Doc ID: {uploadedDoc.documentId} • Hash: {uploadedDoc.hash.slice(0, 16)}...
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 4: AUTOMATED RISK ANALYSIS */}
        {currentStep === 4 && (
          <div className="space-y-5">
            <div className="font-bold text-base border-b pb-3 border-slate-800 flex justify-between items-center">
              <span className={isDark ? 'text-white' : 'text-[#111827]'}>Step 4 — Automated Risk Assessment</span>
              <span className="text-xs text-rose-500 font-bold font-mono">Backend Risk Engine Evaluated</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono">
              <div className={`p-4 rounded-xl border ${isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                <div className="text-slate-400 text-[10px]">RISK SCORE</div>
                <div className="text-2xl font-extrabold text-rose-500 mt-1">{calculatedRiskScore}%</div>
              </div>
              <div className={`p-4 rounded-xl border ${isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                <div className="text-slate-400 text-[10px]">SEVERITY LEVEL</div>
                <div className="text-2xl font-extrabold text-rose-500 mt-1">{calculatedSeverity}</div>
              </div>
              <div className={`p-4 rounded-xl border ${isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                <div className="text-slate-400 text-[10px]">APPROVAL NEEDED</div>
                <div className="text-2xl font-extrabold text-amber-500 mt-1">2 Admins</div>
              </div>
              <div className={`p-4 rounded-xl border ${isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                <div className="text-slate-400 text-[10px]">ESTIMATED IMPACT</div>
                <div className="text-2xl font-extrabold text-blue-500 mt-1">Driver Safety</div>
              </div>
            </div>

            <div className="p-4 rounded-xl border border-rose-200 dark:border-rose-500/20 bg-rose-50 dark:bg-rose-500/10 text-xs font-mono text-rose-600 dark:text-rose-400 space-y-1">
              <div>Vehicle Moving: <strong>{isVehicleMoving ? 'YES' : 'NO'}</strong></div>
              <div>Current Speed: <strong>{selectedVehicle.speed} km/h</strong></div>
              <div>Reason: <strong>{isVehicleMoving ? 'Moving Vehicle High Speed Isolation Interlock Required' : 'Stationary Vehicle Request'}</strong></div>
            </div>
          </div>
        )}

        {/* STEP 5: AFFECTED SYSTEMS HARDWARE DIAGRAM */}
        {currentStep === 5 && (
          <div className="space-y-5">
            <div className="font-bold text-base border-b pb-3 border-slate-800 flex justify-between items-center">
              <span className={isDark ? 'text-white' : 'text-[#111827]'}>Step 5 — Affected Hardware Systems Diagram</span>
              <span className="text-xs text-blue-500 font-mono font-bold">Auto-Highlighted by System</span>
            </div>

            <div className={`p-5 rounded-xl border space-y-4 ${isDark ? 'bg-slate-900/50 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
              <div className="font-bold text-xs text-slate-400 uppercase tracking-wider">Hardware Component Interconnect Topology</div>
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
                {allHardwareNodes.map((node) => {
                  const isHighlighted = selectedCommand.affectedHardware.includes(node) || node === 'Vehicle';

                  return (
                    <div
                      key={node}
                      className={`p-3 rounded-xl border text-center transition-all ${
                        isHighlighted
                          ? 'bg-blue-600 text-white font-extrabold border-blue-500 shadow-md scale-105'
                          : isDark
                          ? 'bg-slate-900 text-slate-400 border-slate-800'
                          : 'bg-white text-slate-400 border-slate-200'
                      }`}
                    >
                      <Cpu size={16} className="mx-auto mb-1" />
                      <span className="text-[11px] block truncate">{node}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* STEP 6: DRIVER IMPACT */}
        {currentStep === 6 && (
          <div className="space-y-5">
            <div className="font-bold text-base border-b pb-3 border-slate-800 flex justify-between items-center">
              <span className={isDark ? 'text-white' : 'text-[#111827]'}>Step 6 — Driver Safety & Occupancy Impact</span>
              <span className="text-xs text-slate-400 font-mono">Step 6 of 10</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs font-mono">
              <div className={`p-3.5 rounded-xl border ${isDark ? 'bg-slate-900/50 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                <div>Driver Notification: <strong className="text-emerald-500">YES</strong></div>
              </div>
              <div className={`p-3.5 rounded-xl border ${isDark ? 'bg-slate-900/50 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                <div>Execution Time: <strong className="text-blue-500">
                  {['LOCK_DOORS', 'UNLOCK_DOORS', 'HORN', 'FLASH_LIGHTS'].includes(selectedCommand.id) ? '2 sec' : (selectedCommand.id.includes('RESTORE') || selectedCommand.id === 'CANCEL' ? '5 sec' : '10 sec')}
                </strong></div>
              </div>
              <div className={`p-3.5 rounded-xl border ${isDark ? 'bg-slate-900/50 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                <div>Impact Type: <strong className={['LOCK_DOORS', 'UNLOCK_DOORS', 'HORN', 'FLASH_LIGHTS'].includes(selectedCommand.id) || selectedCommand.id.includes('RESTORE') || selectedCommand.id === 'CANCEL' ? 'text-emerald-500' : 'text-rose-500'}>
                  {['LOCK_DOORS', 'UNLOCK_DOORS', 'HORN', 'FLASH_LIGHTS'].includes(selectedCommand.id) ? 'Access Update' : (selectedCommand.id.includes('RESTORE') || selectedCommand.id === 'CANCEL' ? 'Power Re-enabled' : 'Safe Stop Required')}
                </strong></div>
              </div>
              <div className={`p-3.5 rounded-xl border ${isDark ? 'bg-slate-900/50 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                <div>Current Speed: <strong className="text-amber-500">{selectedVehicle.speed} km/h</strong></div>
              </div>
              <div className={`p-3.5 rounded-xl border ${isDark ? 'bg-slate-900/50 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                <div>Vehicle Occupancy: <strong className={isDark ? 'text-white' : 'text-[#111827]'}>1 Driver, {selectedVehicle.passengers} Passengers</strong></div>
              </div>
              <div className={`p-3.5 rounded-xl border ${isDark ? 'bg-slate-900/50 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                <div>Risk Assessment: <strong className={['LOCK_DOORS', 'UNLOCK_DOORS', 'HORN', 'FLASH_LIGHTS'].includes(selectedCommand.id) ? 'text-emerald-500' : (selectedCommand.id.includes('RESTORE') || selectedCommand.id === 'CANCEL' ? 'text-blue-500' : 'text-amber-500')}>
                  {['LOCK_DOORS', 'UNLOCK_DOORS', 'HORN', 'FLASH_LIGHTS'].includes(selectedCommand.id) ? 'Low Risk' : (selectedCommand.id.includes('RESTORE') || selectedCommand.id === 'CANCEL' ? 'Medium Risk' : 'High Risk')}
                </strong></div>
              </div>
            </div>

            <div className={`p-4 rounded-xl border font-sans ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-blue-50/50 border-blue-200'}`}>
              <div className="font-bold text-xs text-blue-600 dark:text-blue-400 mb-1">Driver In-Vehicle Message Notification Preview</div>
              <p className="text-xs text-slate-700 dark:text-slate-200 italic font-mono">
                {selectedCommand.id === 'LOCK_DOORS'
                  ? '"Vehicle doors locked remotely for security. Driving control and motor operation remain completely unaffected."'
                  : selectedCommand.id === 'UNLOCK_DOORS'
                  ? '"Vehicle doors unlocked remotely for driver access."'
                  : selectedCommand.id.includes('RESTORE') || selectedCommand.id === 'CANCEL'
                  ? '"Vehicle drivetrain cleared. Full motor power restored for safe operation."'
                  : selectedCommand.id === 'OTA_UPDATE'
                  ? '"OTA firmware update scheduled. Update will initiate once vehicle is safely parked."'
                  : selectedCommand.id === 'DISABLE_DIGITAL_KEY'
                  ? '"Mobile digital key access revoked. Physical master key override remains active."'
                  : '"Your vehicle will safely stop due to security policy."'}
              </p>
            </div>
          </div>
        )}

        {/* STEP 7: COMPREHENSIVE REVIEW & SUBMIT */}
        {currentStep === 7 && (
          <div className="space-y-5">
            <div className="font-bold text-base border-b pb-3 border-slate-800 flex justify-between items-center">
              <span className={isDark ? 'text-white' : 'text-[#111827]'}>Step 7 — Review & Submit Command Request</span>
              <span className="text-xs text-emerald-500 font-bold font-mono">
                {submittedResult ? '✓ Request Submitted to Queue' : '✓ Ready for Submission'}
              </span>
            </div>

            {submittedResult ? (
              <div className="p-6 rounded-[20px] bg-emerald-500/10 border border-emerald-500/30 text-xs space-y-4 font-sans">
                <div className="font-bold text-base text-emerald-600 dark:text-emerald-400 flex items-center space-x-2">
                  <CheckCircle2 size={22} />
                  <span>Command Request Submitted Successfully!</span>
                </div>

                <div className="space-y-2 font-mono text-slate-300">
                  <div>Approval ID: <strong className="text-white">{submittedResult.approvalId}</strong></div>
                  <div>Command ID: <strong className="text-blue-400">{submittedResult.commandId}</strong></div>
                  <div>Target Vehicle: <strong className="text-white">{submittedResult.vehicleName} ({submittedResult.plateNumber})</strong></div>
                  <div>Command Action: <strong className="text-rose-400">{submittedResult.commandName}</strong></div>
                  <div>Governance Quorum: <strong className="text-amber-400">Waiting for Dual Approval (1/{submittedResult.requiredSignatures} Signatures Achieved)</strong></div>
                </div>

                <p className="text-slate-400 text-xs italic">
                  Per Zero-Trust governance policy, operator submission is complete. This request is now queued in the Approval Center for independent administrator co-signature.
                </p>

                <div className="pt-2 flex justify-end space-x-2">
                  <button
                    onClick={() => navigate(`/app/approval-center?highlightAppr=${submittedResult.approvalId}`)}
                    className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs transition-colors flex items-center space-x-1.5 cursor-pointer shadow-xs"
                  >
                    <span>Open Approval Center to Co-Sign (2/2) →</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-3 text-xs font-mono">
                <div className={`p-4 rounded-xl border space-y-2 ${isDark ? 'bg-slate-900/50 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                  <div>Vehicle: <strong className={isDark ? 'text-white' : 'text-[#111827]'}>{selectedVehicle.name} ({selectedVehicle.plate})</strong></div>
                  <div>Command: <strong className="text-rose-500">{selectedCommand.name}</strong></div>
                  <div>Reason: <strong className={isDark ? 'text-slate-200' : 'text-[#111827]'}>{legalReason}</strong></div>
                  <div>Calculated Risk: <strong className="text-rose-500">{calculatedSeverity} ({calculatedRiskScore}%)</strong></div>
                  <div>Evidence Doc: <strong className="text-blue-500">{uploadedDoc.filename}</strong></div>
                  <div>Affected Systems: <strong className={isDark ? 'text-slate-200' : 'text-[#111827]'}>{selectedCommand.affectedHardware.join(', ')}</strong></div>
                  <div>Approvals Needed: <strong className="text-amber-500">2 Admins (Multi-Sig Quorum)</strong></div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* STEP 8: MULTI-SIGNATURE QUORUM */}
        {currentStep === 8 && (
          <div className="space-y-5">
            <div className="font-bold text-base border-b pb-3 border-slate-800 flex justify-between items-center">
              <span className={isDark ? 'text-white' : 'text-[#111827]'}>Step 8 — Multi-Signature Governance Quorum</span>
              <span className="text-xs text-amber-500 font-bold font-mono">
                Quorum Status: {approver2Status === 'Approved' ? '2 / 2 ACHIEVED' : '1 / 2 PENDING'}
              </span>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-600 dark:text-emerald-400 font-bold">
                <div className="flex items-center space-x-3">
                  <CheckCircle2 size={18} />
                  <div>
                    <div>Security Administrator (Sarah Kim)</div>
                    <div className="text-[10px] font-mono text-slate-400">Digital Signature Verified • {approver1Time}</div>
                  </div>
                </div>
                <span className="px-3 py-1 bg-emerald-500 text-white font-extrabold rounded-lg text-[10px]">
                  ✓ Approved
                </span>
              </div>

              <div className={`flex items-center justify-between p-4 rounded-xl border font-bold ${
                approver2Status === 'Approved'
                  ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400'
                  : 'bg-amber-500/10 border-amber-500/20 text-amber-600 dark:text-amber-400'
              }`}>
                <div className="flex items-center space-x-3">
                  {approver2Status === 'Approved' ? <CheckCircle2 size={18} /> : <Clock size={18} />}
                  <div>
                    <div>Operations Manager (Aisha Khan)</div>
                    <div className="text-[10px] font-mono text-slate-400">
                      {approver2Status === 'Approved' ? `Digital Signature Verified • ${approver2Time}` : 'Awaiting Co-Signature'}
                    </div>
                  </div>
                </div>

                {approver2Status === 'Pending' ? (
                  <div className="flex space-x-2">
                    <button
                      onClick={() => navigate('/app/approval-center')}
                      className="px-4 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl text-xs transition-colors cursor-pointer"
                    >
                      Open Approval Center to Co-Sign →
                    </button>
                    <button
                      onClick={() => {
                        setApprover2Status('Approved');
                        setApprover2Time(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
                      }}
                      className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs transition-colors cursor-pointer"
                    >
                      Co-Sign Now
                    </button>
                  </div>
                ) : (
                  <span className="px-3 py-1 bg-emerald-500 text-white font-extrabold rounded-lg text-[10px]">
                    ✓ Approved
                  </span>
                )}
              </div>
            </div>
          </div>
        )}

        {/* STEP 9: VERIFICATION PIPELINE ANIMATION */}
        {currentStep === 9 && (
          <div className="space-y-5">
            <div className="font-bold text-base border-b pb-3 border-slate-800 flex justify-between items-center">
              <span className={isDark ? 'text-white' : 'text-[#111827]'}>Step 9 — 7-Stage Zero-Trust Verification Pipeline</span>
              <button
                onClick={runExecutionPipeline}
                disabled={isExecuting}
                className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs transition-colors flex items-center space-x-1.5 cursor-pointer shadow-xs disabled:opacity-50"
              >
                {isExecuting ? <RefreshCw size={14} className="animate-spin" /> : <Play size={14} />}
                <span>{isExecuting ? 'Running Verification Pipeline...' : 'Execute Command & Run Pipeline'}</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs font-mono">
              {[
                { stage: 1, name: 'Signature', label: 'Passed ✓' },
                { stage: 2, name: 'Timestamp', label: 'Passed ✓' },
                { stage: 3, name: 'Replay Check', label: 'Passed ✓' },
                { stage: 4, name: 'Multi Signature', label: 'Passed ✓' },
                { stage: 5, name: 'Motion Safety', label: 'Passed ✓' },
                { stage: 6, name: 'Dispatch', label: 'Passed ✓' },
                { stage: 7, name: 'SHA256 Audit', label: 'Passed ✓' },
              ].map((stg) => {
                const isPassed = executionStage >= stg.stage;

                return (
                  <div
                    key={stg.stage}
                    className={`p-4 rounded-xl border flex items-center justify-between transition-all ${
                      isPassed
                        ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400 font-bold'
                        : isDark
                        ? 'bg-slate-900 border-slate-800 text-slate-500'
                        : 'bg-slate-100 border-slate-200 text-slate-400'
                    }`}
                  >
                    <span>{stg.stage}. {stg.name}</span>
                    <span>{isPassed ? stg.label : 'Waiting...'}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* STEP 10: AUDIT LOG RESULT */}
        {currentStep === 10 && (
          <div className="space-y-5">
            <div className="font-bold text-base border-b pb-3 border-slate-800 flex justify-between items-center text-emerald-600 dark:text-emerald-400">
              <span>Step 10 — Command Verified & Recorded to Merkle Ledger</span>
              <span className="text-xs font-mono font-bold">SHA-256 Chain Complete</span>
            </div>

            <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-2 text-xs font-mono text-slate-200">
              <div>Command ID: <strong className="text-blue-400">{executionResult?.commandId || 'CMD-1001'}</strong></div>
              <div>Vehicle Target: <strong className="text-white">{selectedVehicle.name} ({selectedVehicle.plate})</strong></div>
              <div>Who Requested: <strong className="text-blue-400">Sarah Kim (Security Admin)</strong></div>
              <div>Who Approved: <strong className="text-emerald-400">Vikram Singh & Aisha Khan (2/2 Signatures)</strong></div>
              <div>Execution Time: <strong className="text-purple-400">41.2 ms</strong></div>
              <div>SHA-256 Hash: <strong className="text-emerald-400 break-all">{executionResult?.verificationHash || '0x8f9a2e3b1c4d5e6f7a8b9c0d1e2f3a4b'}</strong></div>
              <div>Merkle Root: <strong className="text-emerald-400 break-all">0x8f9a2e3b1c4d5e6f7a8b9c0d1e2f3a4b</strong></div>
              <div>Blockchain Hash: <strong className="text-emerald-400 break-all">0x9921048864201049921048864201049</strong></div>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 justify-end">
              <button
                onClick={() => navigate(`/app/digital-twin?vehicleId=${selectedVehicle.id}`)}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs transition-colors cursor-pointer flex items-center justify-center space-x-1.5"
              >
                <Car size={14} />
                <span>View in Digital Twin</span>
              </button>
              <button
                onClick={() => navigate('/app/audit')}
                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs transition-colors cursor-pointer flex items-center justify-center space-x-1.5"
              >
                <FileText size={14} />
                <span>Open Audit Ledger →</span>
              </button>
            </div>
          </div>
        )}

        {/* BOTTOM WIZARD ACTION BUTTONS */}
        <div className="pt-4 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <button
            onClick={handlePrevStep}
            disabled={currentStep === 1}
            className="px-4 py-2 border rounded-xl text-xs font-semibold text-slate-400 hover:bg-slate-800 transition-colors disabled:opacity-40 cursor-pointer"
          >
            Cancel / Back
          </button>

          <div className="flex items-center space-x-2">
            {currentStep < 10 && (
              <button
                onClick={handleSubmitCommand}
                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs transition-colors flex items-center space-x-1.5 cursor-pointer shadow-xs"
              >
                <span>
                  {currentStep === 7
                    ? (['LOCK_DOORS', 'UNLOCK_DOORS', 'HORN', 'FLASH_LIGHTS', 'RESTART_TELEMATICS', 'SYNC_CONFIG'].includes(selectedCommand.id)
                        ? 'Submit for Approval →'
                        : 'Submit for Multi-Signature Approval →')
                    : 'Next Step →'}
                </span>
              </button>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default CommandCenterPage;
