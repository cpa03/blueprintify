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

import { useEffect, useCallback, useState, useRef, memo } from "react";
import { type WizardStep, WIZARD_STEP_KEYS, ANIMATION_ENTRANCE_DELAYS_MS } from "@blueprint/shared";
import { useWizardStore, useEditorStore, useToast } from "../store";
import {
  WIZARD_STEPS,
  TIMEOUTS,
  PROGRESS_COLORS,
  TOAST_MESSAGES,
  STEP_CONNECTOR,
  ENTRANCE_STAGGER,
  ACCESSIBILITY_LABELS,
  GENERATION_MESSAGES,
  STEP_INDICATOR_CHARS,
} from "../config/constants";
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
  const isGenerating = useEditorStore((s) => s.isGenerating);
  const generationProgress = useEditorStore((s) => s.generationProgress);
  const [shakingStep, setShakingStep] = useState<string | null>(null);
  const [justCompletedStep, setJustCompletedStep] = useState<string | null>(null);
  const [activatingStep, setActivatingStep] = useState<string | null>(null);
  const prevStepRef = useRef(currentStep);
  const toast = useToast();

  const currentIndex = STEPS.findIndex((s) => s.key === currentStep);
  /** Whether the last wizard step (generating) has finished with a complete state */
  const isGenerationComplete =
    currentStep === WIZARD_STEP_KEYS.GENERATING &&
    !isGenerating &&
    generationProgress === GENERATION_MESSAGES.COMPLETE;

  // When generation is complete, show full progress (100%) even though the
  // wizard still considers the GENERATING step as "current." This gives users
  // a clear visual cue that the pipeline has finished.
  const effectiveIndex = isGenerationComplete ? STEPS.length - 1 : currentIndex;
  const progressPercentage = (effectiveIndex / (STEPS.length - 1)) * 100;
  const currentStepLabel = WIZARD_STEPS.find((s) => s.key === currentStep)?.label || currentStep;

  // Detect forward step navigation and trigger a one-shot completion flash
  // on the step that was just completed, giving a "checkpoint reached" feeling.
  useEffect(() => {
    const prevIdx = STEPS.findIndex((s) => s.key === prevStepRef.current);
    const currIdx = STEPS.findIndex((s) => s.key === currentStep);

    if (currIdx > prevIdx) {
      const completedKey = prevStepRef.current;
      const activatedKey = currentStep;
      setJustCompletedStep(completedKey);
      setActivatingStep(activatedKey);
      const timer = setTimeout(() => {
        setJustCompletedStep(null);
        setActivatingStep(null);
      }, TIMEOUTS.STEP_COMPLETE_FLASH);
      prevStepRef.current = currentStep;
      return () => clearTimeout(timer);
    }
    prevStepRef.current = currentStep;
  }, [currentStep]);

  const canNavigateTo = useCallback(
    (stepKey: WizardStep): boolean => {
      const targetIndex = STEPS.findIndex((s) => s.key === stepKey);
      return targetIndex <= currentIndex && stepKey !== WIZARD_STEP_KEYS.GENERATING;
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
        toast.info(TOAST_MESSAGES.STEP_LOCKED(stepLabel));
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
        content={ACCESSIBILITY_LABELS.PROGRESS.STEPS_COMPLETE(
          progressPercentage,
          STEPS.length - 1 - effectiveIndex
        )}
        position="left"
      >
        <div className="relative group animate-fade-in">
          <CircularProgress
            value={progressPercentage}
            size={36}
            strokeWidth={3}
            color={
              isGenerationComplete || effectiveIndex >= STEPS.length - 1
                ? PROGRESS_COLORS.COMPLETED
                : PROGRESS_COLORS.ACTIVE
            }
            ariaLabel={
              isGenerationComplete
                ? ACCESSIBILITY_LABELS.PROGRESS.ALL_STEPS_COMPLETE
                : `Step ${effectiveIndex + 1} of ${STEPS.length}: ${currentStepLabel}`
            }
            isAnimating={isGenerating}
            animateOnMount
            mountAnimationDelayMs={ANIMATION_ENTRANCE_DELAYS_MS.STANDARD_MOUNT}
          />
          <div className="absolute inset-0 flex items-center justify-center transition-transform duration-200 hover:scale-110">
            <span key={currentStep} className="text-xs font-semibold step-count-pop">
              {isGenerationComplete
                ? STEP_INDICATOR_CHARS.COMPLETE_CHECK
                : effectiveIndex >= STEPS.length - 1
                  ? STEP_INDICATOR_CHARS.ALL_COMPLETE_EMOJI
                  : `${effectiveIndex + 1}`}
            </span>
          </div>
        </div>
      </SmartTooltip>

      {STEPS.map((step, index) => {
        const isActive = step.key === currentStep && !isGenerationComplete;
        const isCompleted = index < effectiveIndex;
        const isClickable = canNavigateTo(step.key);
        const isShaking = shakingStep === step.key;

        return (
          <div key={step.key} className="flex items-center">
            <button
              onClick={() => handleStepClick(step.key, step.label)}
              disabled={!isClickable}
              title={
                isClickable
                  ? `${step.label} (Alt+${step.shortcut})`
                  : TOAST_MESSAGES.STEP_LOCKED(step.label)
              }
              aria-keyshortcuts={isClickable ? `Alt+${step.shortcut}` : undefined}
              aria-current={isActive ? "step" : undefined}
              className={`
                flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-300
                outline-none animate-fade-in
                ${
                  isActive
                    ? "bg-primary-500/20 border border-primary-500/50 text-primary-300 focus-visible:ring-2 focus-visible:ring-primary-500/50 focus-visible:ring-offset-2 focus-visible:ring-offset-dark-950"
                    : isCompleted
                      ? "bg-accent-emerald/20 border border-accent-emerald/50 text-accent-emerald focus-visible:ring-2 focus-visible:ring-accent-emerald/50 focus-visible:ring-offset-2 focus-visible:ring-offset-dark-950"
                      : "bg-dark-800/50 border border-dark-700 text-dark-300 focus-visible:ring-2 focus-visible:ring-dark-500/50 focus-visible:ring-offset-2 focus-visible:ring-offset-dark-950"
                }
                ${isClickable ? "cursor-pointer hover:bg-dark-700 hover:scale-102 active:scale-98" : "cursor-default"}
                ${isActive ? "animate-step-pulse" : ""}
                ${isShaking ? "shake-animation" : ""}
                ${justCompletedStep === step.key ? "step-complete-flash" : ""}
                ${activatingStep === step.key ? "step-activate" : ""}
              `}
              style={{
                animationDelay: `${ENTRANCE_STAGGER.BASE_DELAY_S + index * ENTRANCE_STAGGER.INCREMENT_S}s`,
                animationFillMode: ENTRANCE_STAGGER.FILL_MODE,
              }}
            >
              <span className="inline-block transition-transform duration-200 hover:scale-125">
                {step.icon}
              </span>
              <span className="text-sm font-medium hidden sm:inline">{step.label}</span>
              {isClickable && (
                <span className="text-xs opacity-70 font-mono">Alt+{step.shortcut}</span>
              )}
            </button>

            {index < STEPS.length - 1 && (
              <div
                className={`w-8 h-0.5 mx-2 rounded-full transition-all duration-500 ease-in-out animate-fade-in ${
                  isCompleted ? "bg-accent-emerald" : "bg-dark-700"
                } ${justCompletedStep === step.key ? "connector-flash" : ""}`}
                style={{
                  ...(isCompleted ? { boxShadow: STEP_CONNECTOR.COMPLETED_SHADOW } : {}),
                  animationDelay: `${ENTRANCE_STAGGER.BASE_DELAY_S + index * ENTRANCE_STAGGER.INCREMENT_S}s`,
                  animationFillMode: ENTRANCE_STAGGER.FILL_MODE,
                }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

export const StepIndicator = memo(StepIndicatorComponent);
