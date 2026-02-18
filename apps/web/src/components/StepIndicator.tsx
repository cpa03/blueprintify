import { motion } from "framer-motion";
import { useEffect, useCallback, useState } from "react";
import type { WizardStep } from "@blueprint/shared";
import { useWizardStore, useToast } from "../store";
import { WIZARD_STEPS } from "../config/constants";
import { CircularProgress } from "./CircularProgress";
import { SmartTooltip } from "./SmartTooltip";

const STEPS: {
  key: WizardStep;
  label: string;
  icon: string;
  shortcut: string;
}[] = [...WIZARD_STEPS];

export function StepIndicator() {
  const currentStep = useWizardStore((s) => s.currentStep);
  const setStep = useWizardStore((s) => s.setStep);
  const [shakingStep, setShakingStep] = useState<string | null>(null);
  const toast = useToast();

  const currentIndex = STEPS.findIndex((s) => s.key === currentStep);
  const progressPercentage = (currentIndex / (STEPS.length - 1)) * 100;

  const canNavigateTo = useCallback(
    (stepKey: WizardStep): boolean => {
      const targetIndex = STEPS.findIndex((s) => s.key === stepKey);
      return targetIndex <= currentIndex && stepKey !== "generating";
    },
    [currentIndex],
  );

  const handleStepClick = useCallback(
    (stepKey: WizardStep, stepLabel: string) => {
      if (canNavigateTo(stepKey)) {
        setStep(stepKey);
      } else {
        setShakingStep(stepKey);
        setTimeout(() => setShakingStep(null), 400);
        // Provide helpful feedback for locked steps
        toast.info(`Complete previous steps to unlock "${stepLabel}"`);
      }
    },
    [canNavigateTo, setStep, toast],
  );

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.altKey && /^[1-5]$/.test(e.key)) {
        e.preventDefault();
        const stepIndex = parseInt(e.key, 10) - 1;
        const targetStep = STEPS[stepIndex];

        if (targetStep && canNavigateTo(targetStep.key)) {
          setStep(targetStep.key);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [setStep, canNavigateTo]);

  return (
    <div className="flex items-center justify-center gap-3 mb-8">
      <SmartTooltip
        content={`${Math.round(progressPercentage)}% complete - ${STEPS.length - 1 - currentIndex} steps remaining`}
        position="left"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", stiffness: 400, damping: 25 }}
          className="relative group"
        >
          <CircularProgress
            value={progressPercentage}
            size={36}
            strokeWidth={3}
            color={
              currentIndex >= STEPS.length - 1
                ? "rgb(16, 185, 129)"
                : "rgb(99, 102, 241)"
            }
          />
          <motion.div
            className="absolute inset-0 flex items-center justify-center"
            whileHover={{ scale: 1.1 }}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
          >
            <span className="text-xs font-semibold">
              {currentIndex >= STEPS.length - 1 ? "🎉" : `${currentIndex + 1}`}
            </span>
          </motion.div>
        </motion.div>
      </SmartTooltip>

      {STEPS.map((step, index) => {
        const isActive = step.key === currentStep;
        const isCompleted = index < currentIndex;
        const isClickable = canNavigateTo(step.key);
        const isShaking = shakingStep === step.key;

        return (
          <div key={step.key} className="flex items-center">
            <motion.button
              onClick={() => handleStepClick(step.key, step.label)}
              disabled={!isClickable}
              title={
                isClickable
                  ? `${step.label} (Alt+${step.shortcut})`
                  : "Complete previous steps to unlock"
              }
              accessKey={step.shortcut}
              className={`
                flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-300
                outline-none
                ${
                  isActive
                    ? "bg-primary-500/20 border border-primary-500/50 text-primary-300 focus-visible:ring-2 focus-visible:ring-primary-500/50 focus-visible:ring-offset-2 focus-visible:ring-offset-dark-950"
                    : isCompleted
                      ? "bg-accent-emerald/20 border border-accent-emerald/50 text-accent-emerald focus-visible:ring-2 focus-visible:ring-accent-emerald/50 focus-visible:ring-offset-2 focus-visible:ring-offset-dark-950"
                      : "bg-dark-800/50 border border-dark-700 text-dark-300 focus-visible:ring-2 focus-visible:ring-dark-500/50 focus-visible:ring-offset-2 focus-visible:ring-offset-dark-950"
                }
                ${isClickable ? "cursor-pointer hover:bg-dark-700" : "cursor-default"}
                ${isShaking ? "shake-animation" : ""}
              `}
              whileHover={isClickable ? { scale: 1.02 } : undefined}
              whileTap={isClickable ? { scale: 0.98 } : undefined}
            >
              <span>{step.icon}</span>
              <span className="text-sm font-medium hidden sm:inline">
                {step.label}
              </span>
              {isClickable && (
                <span className="text-xs opacity-50 font-mono">
                  Alt+{step.shortcut}
                </span>
              )}
            </motion.button>

            {index < STEPS.length - 1 && (
              <div
                className={`w-8 h-0.5 mx-2 ${isCompleted ? "bg-accent-emerald" : "bg-dark-700"}`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
