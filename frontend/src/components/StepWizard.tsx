import React from "react";
import { Check } from "lucide-react";
import { AppStep } from "../types";

interface Step {
  id: AppStep;
  label: string;
  number: number;
}

const STEPS: Step[] = [
  { id: "record", label: "Snemanje", number: 1 },
  { id: "transcript", label: "Transkripcija", number: 2 },
  { id: "review", label: "Pregled & Izvoz", number: 3 },
];

interface StepWizardProps {
  currentStep: AppStep;
  completedSteps: Set<AppStep>;
  onStepClick: (step: AppStep) => void;
}

export function StepWizard({
  currentStep,
  completedSteps,
  onStepClick,
}: StepWizardProps) {
  return (
    <div className="flex items-center justify-center gap-0">
      {STEPS.map((step, idx) => {
        const isCompleted = completedSteps.has(step.id);
        const isCurrent = currentStep === step.id;
        const isClickable = isCompleted || isCurrent;

        return (
          <React.Fragment key={step.id}>
            <div className="flex flex-col items-center">
              <button
                onClick={() => isClickable && onStepClick(step.id)}
                disabled={!isClickable}
                className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-200
                  ${
                    isCompleted
                      ? "bg-emerald-600 text-white cursor-pointer hover:bg-emerald-500"
                      : isCurrent
                      ? "bg-blue-600 text-white ring-4 ring-blue-500/30"
                      : "bg-slate-700 text-slate-500 cursor-not-allowed"
                  }`}
              >
                {isCompleted ? <Check size={18} /> : step.number}
              </button>
              <span
                className={`text-xs mt-1.5 font-medium whitespace-nowrap hidden sm:block
                  ${
                    isCurrent
                      ? "text-blue-400"
                      : isCompleted
                      ? "text-emerald-400"
                      : "text-slate-500"
                  }`}
              >
                {step.label}
              </span>
            </div>
            {idx < STEPS.length - 1 && (
              <div
                className={`flex-1 h-0.5 mx-3 mb-5 sm:mb-0 transition-colors duration-300
                  ${completedSteps.has(step.id) ? "bg-emerald-600" : "bg-slate-700"}`}
                style={{ minWidth: "40px", maxWidth: "80px" }}
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}
