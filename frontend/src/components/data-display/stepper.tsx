import React from 'react';
import { Check } from 'lucide-react';
import { cn } from '@/utils/cn';

export interface Step {
  id: string;
  label: string;
  description?: string;
}

export interface StepperProps {
  steps: Step[];
  currentStep: number;
  onStepClick?: (stepIndex: number) => void;
  className?: string;
}

export const Stepper: React.FC<StepperProps> = ({
  steps,
  currentStep,
  onStepClick,
  className
}) => {
  return (
    <div className={cn("w-full overflow-x-auto pb-4", className)}>
      <div className="flex items-center min-w-max">
        {steps.map((step, index) => {
          const isCompleted = index < currentStep;
          const isCurrent = index === currentStep;
          const isLast = index === steps.length - 1;
          
          return (
            <React.Fragment key={step.id}>
              <div 
                className={cn(
                  "flex items-center gap-3 relative",
                  onStepClick ? "cursor-pointer" : ""
                )}
                onClick={() => onStepClick?.(index)}
              >
                <div className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center border-2 text-sm font-medium transition-colors",
                  isCompleted ? "bg-blue-600 border-blue-600 text-white" : "",
                  isCurrent ? "bg-white border-blue-600 text-blue-600" : "",
                  !isCompleted && !isCurrent ? "bg-white border-slate-200 text-slate-400" : ""
                )}>
                  {isCompleted ? <Check className="w-4 h-4" /> : index + 1}
                </div>
                
                <div className="flex flex-col">
                  <span className={cn(
                    "text-sm font-medium",
                    isCurrent || isCompleted ? "text-slate-900" : "text-slate-500"
                  )}>
                    {step.label}
                  </span>
                  {step.description && (
                    <span className="text-xs text-slate-500 mt-0.5">
                      {step.description}
                    </span>
                  )}
                </div>
              </div>
              
              {!isLast && (
                <div className={cn(
                  "h-px w-16 mx-4",
                  isCompleted ? "bg-blue-600" : "bg-slate-200"
                )} />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};
