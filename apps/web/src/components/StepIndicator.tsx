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
import { DOM_EVENTS, DIRECTION } from "@blueprint/shared/config";
import {
  ANIMATION_ENTRANCE_DELAYS_MS,
  ARIA_ATOMIC_VALUES,
  ARIA_LIVE_VALUES,
  ARIA_ROLES,
  STEP_INDICATOR_STATE_VALUES,
  SVG_ICON_DEFAULTS,
  WIZARD_STEP_KEYS,
  DATA_BOOLEAN_VALUES,
  PERCENT_SCALE,
  ARIA_CURRENT_VALUES,
} from "@blueprint/shared/config";
import type { WizardStep } from "@blueprint/shared/types";
import { NUMBER_RADIX } from "@blueprint/shared";
import { useWizardStore, useEditorStore, useToast } from "../store";
import { useReducedMotion } from "../hooks/useReducedMotion";
import { Icon } from "./Icon";
import type { IconName } from "../config/icons";
import {
  WIZARD_STEPS,
  WIZARD_STEP_SHORTCUT_PATTERN,
  TIMEOUTS,
  PROGRESS_COLORS,
  TOAST_MESSAGES,
  STEP_CONNECTOR,
  ENTRANCE_STAGGER,
  ACCESSIBILITY_LABELS,
  GENERATION_MESSAGES,
  STEP_INDICATOR_CHARS,
  CSS_CLASSES,
  FOCUS_ANNOUNCER,
  DYNAMIC_ID_AFFIXES,
} from "../config/constants";
import { CircularProgress } from "./CircularProgress";
import { SmartTooltip } from "./SmartTooltip";

const STEPS: {
  key: WizardStep;
  label: string;
  icon: IconName;
  shortcut: string;
}[] = [...WIZARD_STEPS];

interface StepIndicatorProps {
  /**
   * Whether the wizard session has started. When false — the static landing,
   * where the wizard panel still shows skeleton placeholders — the active
   * step's infinite pulse is suppressed so an inert tab doesn't imply live
   * activity (issue #3622, suggested fix P4). Defaults to true so in-wizard
   * behavior is unchanged for existing callers.
   */
  isWizardActive?: boolean;
}

function StepIndicatorComponent({ isWizardActive = true }: StepIndicatorProps): JSX.Element {
  const currentStep = useWizardStore((s) => s.currentStep);
  const setStep = useWizardStore((s) => s.setStep);
  const isGenerating = useEditorStore((s) => s.isGenerating);
  const generationProgress = useEditorStore((s) => s.generationProgress);
  const [shakingStep, setShakingStep] = useState<string | null>(null);
  const [justCompletedStep, setJustCompletedStep] = useState<string | null>(null);
  const [activatingStep, setActivatingStep] = useState<string | null>(null);
  const prevStepRef = useRef(currentStep);
  const toast = useToast();
  const shouldReduceMotion = useReducedMotion();

  // Screen reader announcement for step transitions — announces the completed
  // step and the newly activated step so screen reader users receive the same
  // context that sighted users perceive through the step-complete-flash and
  // step-activate animations. The text is rendered in an sr-only live region.
  const [stepAnnouncement, setStepAnnouncement] = useState("");

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
  const progressPercentage = (effectiveIndex / (STEPS.length - 1)) * PERCENT_SCALE;
  const currentStepLabel = WIZARD_STEPS.find((s) => s.key === currentStep)?.label || currentStep;

  // Detect step navigation and announce it. Forward moves also trigger a
  // one-shot completion flash on the step that was just completed, giving a
  // "checkpoint reached" feeling; backward moves only announce — there is no
  // completion to celebrate, but silence would leave screen reader users
  // unaware the destination changed (WCAG 4.1.3).
  useEffect(() => {
    const prevIdx = STEPS.findIndex((s) => s.key === prevStepRef.current);
    const currIdx = STEPS.findIndex((s) => s.key === currentStep);

    if (currIdx === prevIdx) {
      prevStepRef.current = currentStep;
      return;
    }

    const activatedLabel = STEPS.find((s) => s.key === currentStep)?.label ?? "";

    if (currIdx < prevIdx) {
      setStepAnnouncement(ACCESSIBILITY_LABELS.STEP_ANNOUNCER.BACK_TO_STEP(activatedLabel));
      prevStepRef.current = currentStep;
      return;
    }

    const completedKey = prevStepRef.current;
    const completedLabel = STEPS.find((s) => s.key === completedKey)?.label ?? "";
    setJustCompletedStep(completedKey);
    setActivatingStep(currentStep);
    setStepAnnouncement(
      ACCESSIBILITY_LABELS.STEP_ANNOUNCER.STEP_TRANSITION(completedLabel, activatedLabel)
    );

    const timer = setTimeout(() => {
      setJustCompletedStep(null);
      setActivatingStep(null);
    }, TIMEOUTS.STEP_COMPLETE_FLASH);
    prevStepRef.current = currentStep;
    return () => clearTimeout(timer);
  }, [currentStep]);

  const canNavigateTo = useCallback(
    (stepKey: WizardStep): boolean => {
      const targetIndex = STEPS.findIndex((s) => s.key === stepKey);
      return targetIndex <= currentIndex && stepKey !== WIZARD_STEP_KEYS.GENERATING;
    },
    [currentIndex]
  );

  // Shared locked-step feedback for click AND the Alt+N shortcut. The
  // keyboard path previously no-op'd on a locked step, so sighted keyboard
  // users pressing Alt+4 mid-wizard got zero feedback while a mouse click
  // on the same chip showed a toast + shake — an input-modality parity gap
  // (WCAG 4.1.3 Status Messages).
  const notifyLockedStep = useCallback(
    (stepKey: WizardStep, stepLabel: string) => {
      setShakingStep(stepKey);
      setTimeout(() => setShakingStep(null), TIMEOUTS.SHAKE_ANIMATION);
      // Provide helpful feedback for locked steps
      toast.info(TOAST_MESSAGES.STEP_LOCKED(stepLabel));
    },
    [toast]
  );

  const handleStepClick = useCallback(
    (stepKey: WizardStep, stepLabel: string) => {
      if (canNavigateTo(stepKey)) {
        setStep(stepKey);
      } else {
        notifyLockedStep(stepKey, stepLabel);
      }
    },
    [canNavigateTo, setStep, notifyLockedStep]
  );

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.altKey && WIZARD_STEP_SHORTCUT_PATTERN.test(e.key)) {
        e.preventDefault();
        const stepIndex = parseInt(e.key, NUMBER_RADIX.DECIMAL) - 1;
        const targetStep = STEPS[stepIndex];
        if (!targetStep) return;

        if (canNavigateTo(targetStep.key)) {
          setStep(targetStep.key);
        } else {
          notifyLockedStep(targetStep.key, targetStep.label);
        }
      }
    };

    window.addEventListener(DOM_EVENTS.KEYDOWN, handleKeyDown);
    return () => window.removeEventListener(DOM_EVENTS.KEYDOWN, handleKeyDown);
  }, [setStep, canNavigateTo, notifyLockedStep]);

  return (
    <div
      className="flex items-center justify-center gap-3 mb-8 max-w-full overflow-x-auto scrollbar-none py-1"
      data-reduced-motion={
        shouldReduceMotion ? DATA_BOOLEAN_VALUES.TRUE : DATA_BOOLEAN_VALUES.FALSE
      }
    >
      <SmartTooltip
        content={ACCESSIBILITY_LABELS.PROGRESS.STEPS_COMPLETE(
          progressPercentage,
          STEPS.length - 1 - effectiveIndex
        )}
        position={DIRECTION.LEFT}
      >
        <div className="relative group animate-fade-in shrink-0">
          <CircularProgress
            value={progressPercentage}
            size={36}
            strokeWidth={SVG_ICON_DEFAULTS.STROKE_WIDTH_BOLD}
            color={
              isGenerationComplete || effectiveIndex >= STEPS.length - 1
                ? PROGRESS_COLORS.COMPLETED
                : PROGRESS_COLORS.ACTIVE
            }
            ariaLabel={
              isGenerationComplete
                ? ACCESSIBILITY_LABELS.PROGRESS.ALL_STEPS_COMPLETE
                : ACCESSIBILITY_LABELS.PROGRESS.STEP_OF_ARIA(
                    effectiveIndex + 1,
                    STEPS.length,
                    currentStepLabel
                  )
            }
            isAnimating={isGenerating}
            animateOnMount
            mountAnimationDelayMs={ANIMATION_ENTRANCE_DELAYS_MS.STANDARD_MOUNT}
          />
          <div className="absolute inset-0 flex items-center justify-center motion-safe:transition-transform motion-safe:duration-200 motion-safe:hover:scale-110">
            <span
              key={`${currentStep}-${isGenerationComplete}`}
              className={`text-xs font-semibold ${CSS_CLASSES.STEP_COUNT_POP}`}
            >
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
          <div key={step.key} className="flex items-center shrink-0">
            <button
              onClick={() => handleStepClick(step.key, step.label)}
              data-step-index={index}
              data-step-key={step.key}
              data-state={
                isActive
                  ? STEP_INDICATOR_STATE_VALUES.ACTIVE
                  : isCompleted
                    ? STEP_INDICATOR_STATE_VALUES.COMPLETED
                    : isClickable
                      ? STEP_INDICATOR_STATE_VALUES.AVAILABLE
                      : STEP_INDICATOR_STATE_VALUES.LOCKED
              }
              data-active={isActive ? DATA_BOOLEAN_VALUES.TRUE : DATA_BOOLEAN_VALUES.FALSE}
              data-completed={isCompleted ? DATA_BOOLEAN_VALUES.TRUE : DATA_BOOLEAN_VALUES.FALSE}
              data-clickable={isClickable ? DATA_BOOLEAN_VALUES.TRUE : DATA_BOOLEAN_VALUES.FALSE}
              data-reduced-motion={
                shouldReduceMotion ? DATA_BOOLEAN_VALUES.TRUE : DATA_BOOLEAN_VALUES.FALSE
              }
              // aria-disabled keeps locked steps focusable so keyboard, touch,
              // and screen reader users can discover WHY the step is locked via
              // the aria-describedby hint (a native `disabled` attribute removes
              // the button from the tab order and silences the explanation).
              aria-disabled={!isClickable}
              aria-label={ACCESSIBILITY_LABELS.STEP.BUTTON_LABEL(
                step.label,
                index,
                STEPS.length,
                isActive
                  ? "current"
                  : isCompleted
                    ? "completed"
                    : isClickable
                      ? "available"
                      : "locked"
              )}
              title={
                isClickable
                  ? ACCESSIBILITY_LABELS.STEP.SHORTCUT_FORMAT(step.label, step.shortcut)
                  : TOAST_MESSAGES.STEP_LOCKED(step.label)
              }
              aria-describedby={
                !isClickable ? `${step.key}${DYNAMIC_ID_AFFIXES.LOCKED_HINT_SUFFIX}` : undefined
              }
              aria-keyshortcuts={isClickable ? `Alt+${step.shortcut}` : undefined}
              aria-current={isActive ? ARIA_CURRENT_VALUES.STEP : undefined}
              className={`
                flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-full transition-all duration-300
                outline-none animate-fade-in shrink-0
                ${
                  isActive
                    ? "bg-primary-500/20 border border-primary-500/50 text-primary-300 focus-visible:ring-2 focus-visible:ring-primary-500/50 focus-visible:ring-offset-2 focus-visible:ring-offset-dark-950"
                    : isCompleted
                      ? "bg-accent-emerald/20 border border-accent-emerald/50 text-accent-emerald focus-visible:ring-2 focus-visible:ring-accent-emerald/50 focus-visible:ring-offset-2 focus-visible:ring-offset-dark-950"
                      : "bg-dark-800/50 border border-dark-700 text-dark-300 focus-visible:ring-2 focus-visible:ring-dark-500/50 focus-visible:ring-offset-2 focus-visible:ring-offset-dark-950"
                }
                ${isClickable ? "cursor-pointer hover:bg-dark-700 motion-safe:hover:scale-102 motion-safe:active:scale-98" : "cursor-default"}
                ${isActive && isWizardActive && !shouldReduceMotion ? "animate-step-pulse" : ""}
                ${isShaking ? CSS_CLASSES.SHAKE_ANIMATION : ""}
                ${justCompletedStep === step.key && !shouldReduceMotion ? CSS_CLASSES.STEP_COMPLETE_FLASH : ""}
                ${activatingStep === step.key && !shouldReduceMotion ? CSS_CLASSES.STEP_ACTIVATE : ""}
              `}
              style={{
                animationDelay: `${ENTRANCE_STAGGER.BASE_DELAY_S + index * ENTRANCE_STAGGER.INCREMENT_S}s`,
                animationFillMode: ENTRANCE_STAGGER.FILL_MODE,
              }}
            >
              <span className="inline-block motion-safe:transition-transform motion-safe:duration-200 motion-safe:hover:scale-125">
                <Icon name={step.icon} className="w-4 h-4" />
              </span>
              <span className="text-sm font-medium hidden sm:inline">{step.label}</span>
              {isClickable && (
                <span className="text-xs opacity-70 font-mono hidden sm:inline">
                  Alt+{step.shortcut}
                </span>
              )}
            </button>

            {!isClickable && (
              <span
                id={`${step.key}${DYNAMIC_ID_AFFIXES.LOCKED_HINT_SUFFIX}`}
                className={FOCUS_ANNOUNCER.LIVE_REGION_CLASS}
              >
                {TOAST_MESSAGES.STEP_LOCKED(step.label)}
              </span>
            )}

            {index < STEPS.length - 1 && (
              <div
                className={`w-3 sm:w-8 h-0.5 mx-1 sm:mx-2 shrink-0 rounded-full transition-all duration-500 ease-in-out animate-fade-in ${
                  isCompleted ? "bg-accent-emerald" : "bg-dark-700"
                } ${justCompletedStep === step.key && !shouldReduceMotion ? CSS_CLASSES.CONNECTOR_FLASH : ""}`}
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

      {/* Screen reader announcement for step transitions — announces step
          completion and activation so screen reader users perceive the same
          context as sighted users who see the flash/glow animations. */}
      <div
        className={FOCUS_ANNOUNCER.LIVE_REGION_CLASS}
        role={ARIA_ROLES.STATUS}
        aria-live={ARIA_LIVE_VALUES.POLITE}
        aria-atomic={ARIA_ATOMIC_VALUES.TRUE}
      >
        {stepAnnouncement}
      </div>
    </div>
  );
}

export const StepIndicator = memo(StepIndicatorComponent);
