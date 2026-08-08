import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';

type DemoMode = 'off' | 'demo' | 'judge' | 'presentation';

interface DemoModeContextValue {
  mode: DemoMode;
  isActive: boolean;
  setMode: (mode: DemoMode) => void;
  startDemo: () => void;
  stopDemo: () => void;
  currentStep: number;
  totalSteps: number;
  nextStep: () => void;
  prevStep: () => void;
}

const DEMO_STEPS = [
  { label: 'Dashboard', path: '/app/dashboard' },
  { label: 'Fleet Management', path: '/app/fleet' },
  { label: 'Vehicle Detail', path: '/app/fleet/v-001' },
  { label: 'Command Center', path: '/app/command-center' },
  { label: 'Approval Center', path: '/app/approvals' },
  { label: 'Verification Pipeline', path: '/app/verification' },
  { label: 'Threat Sandbox', path: '/app/threat-sandbox' },
  { label: 'Audit Ledger', path: '/app/audit' },
  { label: 'Analytics', path: '/app/analytics' },
  { label: 'Driver Portal', path: '/app/driver-portal' },
];

const DemoModeContext = createContext<DemoModeContextValue | undefined>(undefined);

export function DemoModeProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<DemoMode>('off');
  const [currentStep, setCurrentStep] = useState(0);

  const isActive = mode !== 'off';

  const startDemo = useCallback(() => {
    setMode('demo');
    setCurrentStep(0);
  }, []);

  const stopDemo = useCallback(() => {
    setMode('off');
    setCurrentStep(0);
  }, []);

  const nextStep = useCallback(() => {
    setCurrentStep((prev) => Math.min(prev + 1, DEMO_STEPS.length - 1));
  }, []);

  const prevStep = useCallback(() => {
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  }, []);

  return (
    <DemoModeContext.Provider
      value={{ mode, isActive, setMode, startDemo, stopDemo, currentStep, totalSteps: DEMO_STEPS.length, nextStep, prevStep }}
    >
      {children}
    </DemoModeContext.Provider>
  );
}

export function useDemoMode() {
  const context = useContext(DemoModeContext);
  if (!context) throw new Error('useDemoMode must be used within DemoModeProvider');
  return context;
}

export { DEMO_STEPS };
