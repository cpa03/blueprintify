/**
 * StepIndicator Component
 *
 * Displays the wizard navigation with visual progress indication and step navigation.
 * Shows the current step, completed steps, and allows navigation to previous steps.
 *
 * Features:
 * - Visual progress ring showing completion percentage
 * - Step buttons with active/completed/locked states
 * - Keyboard shortcuts (Alt+1-5) for quick navigation
 * - Animated transitions for step changes
 * - Accessibility support with ARIA attributes
 *
 * @see apps/web/src/store/wizard.ts - Wizard state management
 * @see apps/web/src/config/constants.ts - WIZARD_STEPS configuration
 *
 * @example
 * ```tsx
 * // Render within the wizard layout
 * <StepIndicator />
 * ```
 */

import { motion } from "framer-motion";
import { useEffect, useCallback, useState, memo } from "react";
import type { WizardStep } from "@blueprint/shared";
import { useWizardStore, useToast } from "../store";
import { WIZARD_STEPS, TIMEOUTS, SPRING_CONFIG, PROGRESS_COLORS } from "../config/constants";
import { CircularProgress } from "./CircularProgress";
import { SmartTooltip } from "./SmartTooltip";

const STEPS: {
  key: WizardStep;
  label: string;
  icon: string;
  shortcut: string;
}[] = [...WIZARD_STEPS];

function StepIndicatorComponent(): JSX.Element {
  const currentStep = useWizardStore((s) => s.currentStep);
  const setStep = useWizardStore((s) => s.setStep);
  const [shakingStep, setShakingStep] = useState<string | null>(null);
  const toast = useToast();

  const currentIndex = STEPS.findIndex((s) => s.key === currentStep);
  const progressPercentage = (currentIndex / (STEPS.length - 1)) * 100;
  const currentStepLabel = WIZARD_STEPS.find((s) => s.key === currentStep)?.label || currentStep;

  const canNavigateTo = useCallback(
    (stepKey: WizardStep): boolean => {
      const targetIndex = STEPS.findIndex((s) => s.key === stepKey);
      return targetIndex <= currentIndex && stepKey !== "generating";
    },
    [currentIndex]
  );

  const handleStepClick = useCallback(
    (stepKey: WizardStep, stepLabel: string) => {
      if (canNavigateTo(stepKey)) {
        setStep(stepKey);
      } else {
        setShakingStep(stepKey);
        setTimeout(() => setShakingStep(null), TIMEOUTS.SHAKE_ANIMATION);
        // Provide helpful feedback for locked steps
        toast.info(`Complete previous steps to unlock "${stepLabel}"`);
      }
    },
    [canNavigateTo, setStep, toast]
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
          transition={{ type: "spring", ...SPRING_CONFIG.DEFAULT }}
          className="relative group"
        >
          <CircularProgress
            value={progressPercentage}
            size={36}
            strokeWidth={3}
            color={
              currentIndex >= STEPS.length - 1 ? PROGRESS_COLORS.COMPLETED : PROGRESS_COLORS.ACTIVE
            }
            ariaLabel={`Step ${currentIndex + 1} of ${STEPS.length}: ${currentStepLabel}`}
          />
          <motion.div
            className="absolute inset-0 flex items-center justify-center"
            whileHover={{ scale: 1.1 }}
            transition={{ type: "spring", ...SPRING_CONFIG.SUBTLE_BOUNCE }}
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
              aria-label={
                isClickable
                  ? `${step.icon} ${step.label} Alt+${step.shortcut} - Step ${index + 1} of ${STEPS.length}${isActive ? " (current)" : isCompleted ? " (completed)" : ""}`
                  : `${step.icon} ${step.label} - Locked. Complete previous steps to unlock`
              }
              aria-current={isActive ? "step" : undefined}
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
              animate={
                isActive
                  ? {
                      boxShadow: [
                        "0 0 0 0 rgba(99, 102, 241, 0.4)",
                        "0 0 0 8px rgba(99, 102, 241, 0)",
                      ],
                    }
                  : undefined
              }
              transition={
                isActive
                  ? {
                      duration: 1.5,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }
                  : undefined
              }
            >
              <span>{step.icon}</span>
              <span className="text-sm font-medium hidden sm:inline">{step.label}</span>
              {isClickable && (
                <span className="text-xs opacity-50 font-mono">Alt+{step.shortcut}</span>
              )}
            </motion.button>

            {index < STEPS.length - 1 && (
              <motion.div
                layout="position"
                className={`w-8 h-0.5 mx-2 rounded-full transition-all duration-500 ease-in-out ${
                  isCompleted
                    ? "bg-accent-emerald shadow-[0_0_6px_rgba(16,185,129,0.4)]"
                    : "bg-dark-700"
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

export const StepIndicator = memo(StepIndicatorComponent);
