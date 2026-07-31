/**
 * Step 5: Generation Progress
 *
 * Final step in the 5-step wizard that displays AI generation progress.
 * Shows real-time streaming of blueprint and task content with progress
 * indicators and line counts.
 *
 * Features:
 * - Real-time progress percentage display
 * - Animated line count counters
 * - Live content preview (truncated)
 * - Cancel generation button
 * - Success celebration animation on completion
 * - Completion state with checkmark animation and clear next-step cue
 *
 * @module components/wizard/StepGenerating
 * @see {@link useEditorStore} - Editor state management
 * @see {@link useWizardStore} - Wizard state management
 *
 * @example
 * ```tsx
 * <StepGenerating />
 * ```
 */

import {
  WIZARD_STEP_KEYS,
  UI_TIMING,
  UI_TIMEOUTS,
  ANIMATION_DIRECTIONS,
  ANIMATION_ENTRANCE_DELAYS,
  GENERATION_ERROR_PREFIXES,
  SHORTCUT_DESCRIPTIONS,
  FRAMER_TYPE,
  DISPLAY_SYMBOLS,
  KEYBOARD_EVENT_KEYS,
  LOADING_DOTS_COUNT,
  MODIFIER_KEYS,
  TIME_UNITS,
} from "@blueprint/shared/config";
import * as motion from "framer-motion/m";
import { AnimatePresence } from "framer-motion";
import { memo, useCallback, useRef, useEffect, useState, useMemo } from "react";
function useElapsedTime(isActive: boolean): string {
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    if (!isActive) return;

    const start = Date.now();
    // Defer reset outside the synchronous effect body via microtask to
    // satisfy the project's react-hooks/set-state-in-effect rule.
    queueMicrotask(() => {
      setSeconds(0);
    });

    const id = setInterval(() => {
      setSeconds(Math.floor((Date.now() - start) / TIME_UNITS.MS_PER_SECOND));
    }, UI_TIMEOUTS.ELAPSED_TIMER_INTERVAL_MS);

    return () => clearInterval(id);
  }, [isActive]);

  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${minutes}:${secs.toString().padStart(2, "0")}`;
}
import { useEditorStore, useWizardStore, useToast } from "../../store";
import {
  ANIMATION,
  EASING,
  GENERATION_MESSAGES,
  TOAST_MESSAGES,
  SPRING_CONFIG,
  WIZARD_GENERATING_LABELS,
  GENERATION_PHASE_LABELS,
  GENERATION_ERROR_LABELS,
  CELEBRATION_TEXT,
  OPACITY_PULSE,
  SCALE_PULSE,
  Y_OFFSET,
  SCROLL_BEHAVIOR,
  SCROLL_INTO_VIEW_BLOCK,
  ACCESSIBILITY_LABELS,
  AUTOFOCUS_VALUES,
  CSS_CLASSES,
  GENERATION_STAT_LABELS,
  GENERATION_ANNOUNCER,
  KEY_DISPLAY,
} from "../../config/constants";
import { KEYBOARD_SHORTCUTS } from "../../config/constants/keyboard";
import { COLORS, HEADER_ANIMATION } from "../../config/theme";
import { KeyboardShortcutTooltip } from "../SmartTooltip";
import { getAltKeyLabel, getModifierLabel, getAriaShortcutKey } from "../../lib/platform";

import { AnimatedNumber } from "../AnimatedNumber";
import { RippleButton } from "../RippleButton";
import { useReducedMotion } from "../../hooks/useReducedMotion";
import { pageTransition, type AnimationDirection } from "../../utils/motion";

interface StepGeneratingProps {
  direction?: AnimationDirection;
}

function LoadingDots({ active }: { active: boolean }): JSX.Element {
  const [activeDots, setActiveDots] = useState(0);

  useEffect(() => {
    if (!active) return;
    const intervalId = setInterval(() => {
      setActiveDots((prev) => (prev >= LOADING_DOTS_COUNT ? 0 : prev + 1));
    }, UI_TIMEOUTS.LOADING_DOTS_INTERVAL);
    return () => clearInterval(intervalId);
  }, [active]);

  return (
    <span aria-hidden="true">
      {Array.from({ length: LOADING_DOTS_COUNT }, (_, i) => i).map((i) => (
        <motion.span
          key={i}
          className="inline-block"
          initial={{ opacity: 0, scale: 0.3 }}
          animate={{
            opacity: i < activeDots ? 1 : 0,
            scale: i < activeDots ? 1 : 0.3,
          }}
          transition={{
            duration: ANIMATION.TEXT_FADE,
            ease: EASING.easeOut,
          }}
        >
          .
        </motion.span>
      ))}
    </span>
  );
}

export const StepGenerating = memo(function StepGenerating({
  direction = ANIMATION_DIRECTIONS.FORWARD,
}: StepGeneratingProps): JSX.Element {
  const progress = useEditorStore((s) => s.generationProgress);
  const isGenerating = useEditorStore((s) => s.isGenerating);
  const blueprintContent = useEditorStore((s) => s.blueprintContent);
  const tasksContent = useEditorStore((s) => s.tasksContent);
  const cancelGeneration = useEditorStore((s) => s.cancelGeneration);
  const setStep = useWizardStore((s) => s.setStep);
  const toast = useToast();

  const shouldReduceMotion = useReducedMotion();
  const blueprintLines = blueprintContent?.split("\n").length ?? 0;
  const tasksLines = tasksContent?.split("\n").length ?? 0;
  // When generation is active but no content has streamed in yet, show
  // "—" in the stat cards to communicate the awaiting state rather than
  // an ambiguous "0" which could be mistaken for "generated nothing".
  const awaitingContent =
    isGenerating && (blueprintContent?.length ?? 0) === 0 && (tasksContent?.length ?? 0) === 0;
  const isComplete = !isGenerating && progress === GENERATION_MESSAGES.COMPLETE;
  // Detect error state from the progress message. Both GENERATION_MESSAGES.ERROR
  // and GENERATION_MESSAGES.ERROR_TASKS produce strings starting with "Error",
  // which is the only terminal state that isn't "Complete!" after generation stops.
  const isError =
    !isGenerating && !isComplete && progress.startsWith(GENERATION_ERROR_PREFIXES.GENERIC);

  // Derive visual progress percentage from the generation phase string.
  // Maps known progress messages to approximate completion percentages so
  // users get an intuitive visual sense of progress beyond the text status.
  // The bar fills smoothly: 5% on start → 30% blueprint → 65% tasks → 100% complete.
  const generationPhase = useMemo<{ percent: number; label: string }>(() => {
    if (isComplete) return { percent: 100, label: GENERATION_PHASE_LABELS.COMPLETE };
    if (isError) return { percent: 0, label: GENERATION_PHASE_LABELS.ERROR };
    if (!progress) return { percent: 5, label: GENERATION_PHASE_LABELS.STARTING };

    if (progress === GENERATION_MESSAGES.BLUEPRINT_START) {
      return { percent: 30, label: GENERATION_PHASE_LABELS.GENERATING_BLUEPRINT };
    }
    if (progress === GENERATION_MESSAGES.BLUEPRINT_COMPLETE) {
      return { percent: 65, label: GENERATION_PHASE_LABELS.GENERATING_TASKS };
    }
    return { percent: 45, label: GENERATION_PHASE_LABELS.IN_PROGRESS };
  }, [progress, isComplete, isError]);

  // Elapsed time timer — ticks while generation is actively running
  const timerActive = isGenerating && !isComplete && !isError;
  const elapsedTime = useElapsedTime(timerActive);

  // Synchronous guard so rapid double-clicks or Escape+click during the
  // step-exit transition can't fire cancellation (and its toast) twice.
  const cancelGuardRef = useRef(false);
  const [isCancelling, setIsCancelling] = useState(false);

  const handleCancel = useCallback(() => {
    if (cancelGuardRef.current || !isGenerating) return;
    cancelGuardRef.current = true;
    setIsCancelling(true);
    cancelGeneration();
    toast.info(TOAST_MESSAGES.GENERATION_CANCELLED);
    setStep(WIZARD_STEP_KEYS.REVIEW);
  }, [isGenerating, cancelGeneration, setStep, toast]);

  const wasComplete = useRef(false);
  const wasError = useRef(false);
  const errorShownRef = useRef(false);

  // Track when the cancel button's entrance animation completes so it can be
  // made focusable only after it's visibly rendered. Prevents useFocusOnStepChange
  // from landing keyboard focus on an invisible button (opacity: 0 during the
  // 1-second entrance delay), which would confuse screen-reader users.
  const [cancelButtonReady, setCancelButtonReady] = useState(false);
  useEffect(() => {
    if (!isGenerating || isComplete || isError) return;
    const timer = setTimeout(
      () => {
        setCancelButtonReady(true);
      },
      ANIMATION.SLOW * 2 * TIME_UNITS.MS_PER_SECOND
    );
    return () => clearTimeout(timer);
  }, [isGenerating, isComplete, isError]);

  // Auto-focus "View in Editor" button when generation completes
  // so keyboard users don't have to search for the new action
  useEffect(() => {
    if (isComplete && !wasComplete.current) {
      // Small delay to let the spring animation settle before focusing
      requestAnimationFrame(() => {
        const btn = document.querySelector<HTMLButtonElement>(
          `[data-autofocus="${AUTOFOCUS_VALUES.COMPLETE}"]`
        );
        btn?.focus();
      });
    }
    wasComplete.current = isComplete;
  }, [isComplete]);

  // Auto-focus "Try Again" button when generation transitions into the error state
  // so keyboard users immediately know where to go next (same pattern as completion)
  useEffect(() => {
    if (isError && !wasError.current) {
      requestAnimationFrame(() => {
        const btn = document.querySelector<HTMLButtonElement>(
          `[data-autofocus="${AUTOFOCUS_VALUES.ERROR}"]`
        );
        btn?.focus();
      });
    }
  }, [isError]);

  // Fire a single error toast when generation transitions into the error state
  useEffect(() => {
    if (isError && !wasError.current && !errorShownRef.current) {
      errorShownRef.current = true;
      toast.error(TOAST_MESSAGES.GENERATION_FAILED);
    }
    wasError.current = isError;
  }, [isError, toast]);

  const handleViewReview = useCallback(() => {
    setStep(WIZARD_STEP_KEYS.REVIEW);
  }, [setStep]);

  const handleViewEditor = useCallback(() => {
    const editorPanel = document.querySelector<HTMLElement>('[id$="-panel"]');
    if (editorPanel) {
      editorPanel.scrollIntoView({
        behavior: SCROLL_BEHAVIOR.SMOOTH,
        block: SCROLL_INTO_VIEW_BLOCK.NEAREST,
      });

      // Focus the active tab button for an immediately interactive focus
      // target with a visible focus ring, instead of the generic panel
      // wrapper which needs tabIndex=-1 and provides no focus indicator.
      // Falls back to the editor panel if the tab button isn't mounted yet.
      const activeEditorTab = useEditorStore.getState().activeTab;
      const tabButton = document.getElementById(`tab-${activeEditorTab}`);
      const focusTarget = tabButton ?? editorPanel;

      const priorTabIndex =
        focusTarget === editorPanel ? editorPanel.getAttribute("tabindex") : null;
      if (focusTarget === editorPanel) {
        editorPanel.tabIndex = -1;
      }
      focusTarget.focus({ preventScroll: true });

      const editorContainer = editorPanel.closest(`.${CSS_CLASSES.GLASS_CARD}`);
      if (editorContainer instanceof HTMLElement) {
        editorContainer.classList.add(CSS_CLASSES.EDITOR_FOCUS_HIGHLIGHT);
        setTimeout(() => {
          editorContainer.classList.remove(CSS_CLASSES.EDITOR_FOCUS_HIGHLIGHT);
          if (focusTarget === editorPanel) {
            if (priorTabIndex === null) {
              editorPanel.removeAttribute("tabindex");
            } else {
              editorPanel.setAttribute("tabindex", priorTabIndex);
            }
          }
        }, UI_TIMING.EDITOR_FOCUS_HIGHLIGHT_MS);
      }
    }
  }, []);

  return (
    <motion.div
      {...pageTransition(direction)}
      className="flex flex-col items-center justify-center py-12"
    >
      <div className="relative mb-8">
        {isComplete ? (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{
              type: FRAMER_TYPE.SPRING,
              ...SPRING_CONFIG.SUCCESS,
            }}
            className="w-24 h-24 rounded-full bg-accent-emerald/20 flex items-center justify-center"
          >
            <svg
              width="48"
              height="48"
              viewBox="0 0 48 48"
              fill="none"
              className="text-accent-emerald"
            >
              <motion.circle
                cx="24"
                cy="24"
                r="22"
                stroke="currentColor"
                strokeWidth="3"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={{
                  duration: ANIMATION.MEDIUM_SLOW,
                  delay: ANIMATION_ENTRANCE_DELAYS.FAST,
                }}
              />
              <motion.path
                d="M14 24L21 31L34 17"
                stroke="currentColor"
                strokeWidth="4"
                strokeLinecap="round"
                strokeLinejoin="round"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{
                  duration: ANIMATION.MEDIUM_SLOW,
                  delay: ANIMATION_ENTRANCE_DELAYS.SLOWER,
                }}
              />
            </svg>
          </motion.div>
        ) : isError ? (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{
              type: FRAMER_TYPE.SPRING,
              ...SPRING_CONFIG.SUCCESS,
            }}
            className="w-24 h-24 rounded-full bg-accent-pink/20 flex items-center justify-center"
          >
            <svg
              width="48"
              height="48"
              viewBox="0 0 48 48"
              fill="none"
              className="text-accent-pink"
              role="img"
              aria-label={GENERATION_ERROR_LABELS.ERROR_ICON_ARIA}
            >
              <motion.circle
                cx="24"
                cy="24"
                r="22"
                stroke="currentColor"
                strokeWidth="3"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={{
                  duration: ANIMATION.MEDIUM_SLOW,
                  delay: ANIMATION_ENTRANCE_DELAYS.FAST,
                }}
              />
              <motion.path
                d="M16 16L32 32M32 16L16 32"
                stroke="currentColor"
                strokeWidth="4"
                strokeLinecap="round"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{
                  duration: ANIMATION.MEDIUM_SLOW,
                  delay: ANIMATION_ENTRANCE_DELAYS.SLOWER,
                }}
              />
            </svg>
          </motion.div>
        ) : (
          <>
            <motion.div
              className="w-24 h-24 rounded-full border-4 border-dark-700"
              style={{
                borderTopColor: COLORS.primary[500],
                borderRightColor: COLORS.primary[500],
              }}
              animate={{ rotate: 360 }}
              transition={{
                duration: ANIMATION.SPINNER_ROTATION,
                repeat: Infinity,
                ease: EASING.linear,
              }}
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={
                  shouldReduceMotion
                    ? { scale: 1, opacity: 1 }
                    : {
                        scale: SCALE_PULSE.GENTLE,
                        y: Y_OFFSET.SUBTLE,
                        opacity: OPACITY_PULSE.GENTLE,
                      }
                }
                transition={{
                  duration: ANIMATION.SLOW_PULSE,
                  repeat: Infinity,
                  ease: EASING.easeInOut,
                }}
                className="flex items-center justify-center"
                aria-hidden="true"
              >
                <svg className="w-9 h-9" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <defs>
                    <linearGradient id="gen-lightning-grad" x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0%" stopColor={COLORS.primary[400]} />
                      <stop offset="50%" stopColor={COLORS.accent.purple} />
                      <stop offset="100%" stopColor={COLORS.accent.pink} />
                    </linearGradient>
                  </defs>
                  <path
                    d="M13 2L4 14h7l-1 8 9-12h-7l1-8z"
                    fill="url(#gen-lightning-grad)"
                    stroke="none"
                  />
                </svg>
              </motion.div>
            </div>
          </>
        )}
      </div>

      <AnimatePresence mode="wait">
        {isComplete ? (
          <motion.div
            key="complete"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ delay: ANIMATION_ENTRANCE_DELAYS.HALF_SECOND }}
            className="text-center"
          >
            <h2 className="text-xl font-bold text-white mb-2">{CELEBRATION_TEXT.COMPLETE}</h2>
            <p className="text-dark-400 mb-6">{WIZARD_GENERATING_LABELS.COMPLETE_DESCRIPTION}</p>
          </motion.div>
        ) : isError ? (
          <motion.div
            key="error"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="text-center"
          >
            <h2 className="text-xl font-bold text-accent-pink mb-2">
              {progress.startsWith(GENERATION_ERROR_PREFIXES.TASKS)
                ? GENERATION_ERROR_LABELS.ERROR_TASKS_TITLE
                : GENERATION_ERROR_LABELS.ERROR_TITLE}
            </h2>
            <p className="text-dark-400 mb-6" role="alert" aria-live="assertive" aria-atomic="true">
              {progress}
            </p>
          </motion.div>
        ) : (
          <motion.div
            key={WIZARD_STEP_KEYS.GENERATING}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="text-center"
          >
            <motion.h2
              className="text-xl font-bold text-white mb-2"
              animate={shouldReduceMotion ? {} : { opacity: OPACITY_PULSE.SUBTLE }}
              transition={{
                duration: ANIMATION.DRIFT,
                repeat: Infinity,
                ease: EASING.easeInOut,
              }}
            >
              {WIZARD_GENERATING_LABELS.GENERATING_TITLE}
              <LoadingDots active={!shouldReduceMotion && isGenerating} />
            </motion.h2>
            <p className="text-dark-400 mb-6" role="status" aria-live="polite" aria-atomic="true">
              <motion.span
                animate={{ opacity: OPACITY_PULSE.STRONG }}
                transition={{ duration: ANIMATION.DRIFT, repeat: Infinity, ease: EASING.easeInOut }}
              >
                <AnimatePresence mode="wait">
                  <motion.span
                    key={progress || "starting"}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    transition={{ duration: ANIMATION.TEXT_FADE }}
                  >
                    {progress || WIZARD_GENERATING_LABELS.STARTING_FALLBACK}
                  </motion.span>
                </AnimatePresence>
              </motion.span>
              {/* Elapsed time display — shows generation duration as mm:ss with a subtle divider */}
              <span className="mx-2 text-dark-600" aria-hidden="true">
                {DISPLAY_SYMBOLS.MIDDOT}
              </span>
              <span className="tabular-nums text-dark-500 text-sm">
                <span aria-hidden="true">{WIZARD_GENERATING_LABELS.ELAPSED_TIME} </span>
                <span className="font-mono">{elapsedTime}</span>
              </span>
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Phase progress bar — smooth gradient bar that fills as generation
          progresses through its stages. Visible during active generation and
          on completion; hidden on error. Respects prefers-reduced-motion. */}
      {!isError && (isGenerating || isComplete) && (
        <div className="w-full max-w-sm mx-auto mt-6 mb-2">
          <div
            className="w-full h-1.5 bg-dark-700/50 rounded-full overflow-hidden"
            role="progressbar"
            aria-valuenow={generationPhase.percent}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={
              isComplete
                ? GENERATION_PHASE_LABELS.COMPLETE_ARIA
                : generationPhase.label + ": " + generationPhase.percent + "%"
            }
          >
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-primary-500 via-accent-purple to-accent-pink progress-shimmer relative"
              initial={{ width: 0 }}
              animate={{
                width: generationPhase.percent + "%",
                opacity:
                  isGenerating && generationPhase.percent < 100
                    ? shouldReduceMotion
                      ? 0.9
                      : [0.85, 1, 0.85]
                    : 1,
              }}
              transition={
                isGenerating && generationPhase.percent < 100 && !shouldReduceMotion
                  ? {
                      width: { duration: ANIMATION.PULSE, ease: EASING.easeOut },
                      opacity: {
                        duration: ANIMATION.SLOW_PULSE,
                        repeat: Infinity,
                        ease: EASING.easeInOut,
                      },
                    }
                  : {
                      width: { duration: ANIMATION.PULSE, ease: EASING.easeOut },
                    }
              }
            />
          </div>
        </div>
      )}

      <p className="sr-only" role="status" aria-live="polite">
        {timerActive
          ? GENERATION_ANNOUNCER.ELAPSED(elapsedTime, blueprintLines, tasksLines)
          : GENERATION_ANNOUNCER.GENERATED(blueprintLines, tasksLines)}
      </p>

      {/* Live stats — show "—" while awaiting first content, then animated counts.
          Uses AnimatePresence mode="wait" to crossfade the awaiting dash into the
          counting number, making the first content arrival feel polished rather
          than abruptly swapping out the dash. */}
      <div className="flex gap-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{
            opacity: 1,
            y: 0,
            borderColor: isGenerating
              ? [...HEADER_ANIMATION.CONTENT_STATS.BORDER_COLORS]
              : HEADER_ANIMATION.CONTENT_STATS.BORDER_STATIC,
            boxShadow: isGenerating
              ? [...HEADER_ANIMATION.CONTENT_STATS.BOX_SHADOWS]
              : HEADER_ANIMATION.CONTENT_STATS.SHADOW_STATIC,
          }}
          transition={{
            borderColor: isGenerating
              ? {
                  duration: ANIMATION.SLOW_PULSE,
                  repeat: Infinity,
                  ease: EASING.easeInOut,
                }
              : undefined,
            boxShadow: isGenerating
              ? {
                  duration: ANIMATION.BREATH,
                  repeat: Infinity,
                  ease: EASING.easeInOut,
                }
              : undefined,
          }}
          className="glass-card px-6 py-4"
        >
          <div className="text-2xl font-bold text-gradient relative">
            <AnimatePresence mode="wait">
              {awaitingContent ? (
                <motion.span
                  key="awaiting-blueprint"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8, y: -4 }}
                  transition={{ duration: ANIMATION.TEXT_FADE, ease: EASING.easeOut }}
                  className="tabular-nums text-dark-500 inline-block"
                  aria-label={ACCESSIBILITY_LABELS.GENERATION_STATS.AWAITING_BLUEPRINT}
                >
                  {DISPLAY_SYMBOLS.EM_DASH}
                </motion.span>
              ) : (
                <motion.span
                  key="count-blueprint"
                  initial={{ opacity: 0, scale: 0.8, y: 4 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: ANIMATION.TEXT_FADE, ease: EASING.easeOut }}
                  className="inline-block"
                >
                  <AnimatedNumber
                    value={blueprintLines}
                    duration={ANIMATION.PULSE}
                    className="text-gradient"
                  />
                </motion.span>
              )}
            </AnimatePresence>
          </div>
          <div className="text-sm text-dark-400">{GENERATION_STAT_LABELS.BLUEPRINT_LINES}</div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{
            opacity: 1,
            y: 0,
            borderColor: isGenerating
              ? [...HEADER_ANIMATION.CONTENT_STATS.BORDER_COLORS]
              : HEADER_ANIMATION.CONTENT_STATS.BORDER_STATIC,
            boxShadow: isGenerating
              ? [...HEADER_ANIMATION.CONTENT_STATS.BOX_SHADOWS]
              : HEADER_ANIMATION.CONTENT_STATS.SHADOW_STATIC,
          }}
          transition={{
            delay: ANIMATION.STAGGER,
            borderColor: isGenerating
              ? {
                  duration: ANIMATION.SLOW_PULSE,
                  repeat: Infinity,
                  ease: EASING.easeInOut,
                  delay: ANIMATION.STAGGER,
                }
              : undefined,
            boxShadow: isGenerating
              ? {
                  duration: ANIMATION.BREATH,
                  repeat: Infinity,
                  ease: EASING.easeInOut,
                  delay: ANIMATION.STAGGER,
                }
              : undefined,
          }}
          className="glass-card px-6 py-4"
        >
          <div className="text-2xl font-bold text-gradient relative">
            <AnimatePresence mode="wait">
              {awaitingContent ? (
                <motion.span
                  key="awaiting-tasks"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8, y: -4 }}
                  transition={{ duration: ANIMATION.TEXT_FADE, ease: EASING.easeOut }}
                  className="tabular-nums text-dark-500 inline-block"
                  aria-label={ACCESSIBILITY_LABELS.GENERATION_STATS.AWAITING_TASKS}
                >
                  {DISPLAY_SYMBOLS.EM_DASH}
                </motion.span>
              ) : (
                <motion.span
                  key="count-tasks"
                  initial={{ opacity: 0, scale: 0.8, y: 4 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: ANIMATION.TEXT_FADE, ease: EASING.easeOut }}
                  className="inline-block"
                >
                  <AnimatedNumber
                    value={tasksLines}
                    duration={ANIMATION.PULSE}
                    className="text-gradient"
                  />
                </motion.span>
              )}
            </AnimatePresence>
          </div>
          <div className="text-sm text-dark-400">{GENERATION_STAT_LABELS.TASKS_LINES}</div>
        </motion.div>
      </div>

      <AnimatePresence mode="wait">
        {isComplete ? (
          <motion.div
            key="complete-actions"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: ANIMATION.NORMAL }}
            className="mt-8 flex flex-col items-center gap-3"
          >
            {/* View in Editor — primary action enters with a gentle spring
                bounce, giving the user a clear "first thing to do" cue. */}
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{
                delay: ANIMATION_ENTRANCE_DELAYS.FULL_SECOND,
                ...SPRING_CONFIG.REFRESH,
              }}
            >
              <KeyboardShortcutTooltip
                shortcut={KEYBOARD_SHORTCUTS.TOGGLE_EDITOR.KEY}
                description={SHORTCUT_DESCRIPTIONS.TOGGLE_EDITOR}
                position="right"
                modifier={MODIFIER_KEYS.CMD}
              >
                <RippleButton
                  onClick={handleViewEditor}
                  className="btn-primary flex items-center gap-2 attention-glow"
                  ariaLabel={WIZARD_GENERATING_LABELS.VIEW_EDITOR_ARIA}
                  data-autofocus={AUTOFOCUS_VALUES.COMPLETE}
                  aria-keyshortcuts={getAriaShortcutKey(
                    KEYBOARD_SHORTCUTS.TOGGLE_EDITOR.KEY,
                    MODIFIER_KEYS.CMD
                  )}
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                    />
                  </svg>
                  {WIZARD_GENERATING_LABELS.VIEW_IN_EDITOR}
                  <kbd className={`ml-2 ${CSS_CLASSES.KBD_SHORTCUT}`} aria-hidden="true">
                    {getModifierLabel()}+E
                  </kbd>
                </RippleButton>
              </KeyboardShortcutTooltip>
            </motion.div>
            {/* Back to Review — secondary action enters a beat after the primary
                button, creating a staggered hierarchy that guides the user's eye
                to the more important action first. */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                delay: ANIMATION_ENTRANCE_DELAYS.FULL_SECOND + ANIMATION.STAGGER,
                duration: ANIMATION.NORMAL,
                ease: EASING.easeOut,
              }}
            >
              <KeyboardShortcutTooltip
                shortcut={DISPLAY_SYMBOLS.ARROW_LEFT}
                description={WIZARD_GENERATING_LABELS.BACK_TO_REVIEW_DESC}
                position="left"
                modifier={MODIFIER_KEYS.ALT}
              >
                <RippleButton
                  onClick={handleViewReview}
                  className="btn-ghost text-sm text-dark-400 hover:text-dark-200 flex items-center gap-1.5"
                  ariaLabel={WIZARD_GENERATING_LABELS.BACK_TO_REVIEW_ARIA}
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 19l-7-7 7-7"
                    />
                  </svg>
                  {WIZARD_GENERATING_LABELS.BACK_TO_REVIEW}
                  <kbd className={`ml-1.5 ${CSS_CLASSES.KBD_SHORTCUT}`} aria-hidden="true">
                    {getAltKeyLabel()}+{DISPLAY_SYMBOLS.ARROW_LEFT}
                  </kbd>
                </RippleButton>
              </KeyboardShortcutTooltip>
            </motion.div>
            {/* Content hint — tertiary info enters last, after the actions
                have settled, keeping its emphasis as supplementary guidance
                rather than competing with the primary call-to-action. */}
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                delay: ANIMATION_ENTRANCE_DELAYS.FULL_SECOND + ANIMATION.STAGGER * 2,
                duration: ANIMATION.NORMAL,
                ease: EASING.easeOut,
              }}
              className="text-sm text-dark-500 flex items-center gap-1.5"
            >
              <svg
                className="w-4 h-4 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              {WIZARD_GENERATING_LABELS.CONTENT_AVAILABLE}
            </motion.p>
          </motion.div>
        ) : isError ? (
          <motion.div
            key="error-actions"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mt-8 flex flex-col items-center gap-3"
          >
            <RippleButton
              onClick={handleViewReview}
              className="btn-primary flex items-center gap-2"
              ariaLabel={GENERATION_ERROR_LABELS.TRY_AGAIN_ARIA}
              data-autofocus={AUTOFOCUS_VALUES.ERROR}
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              {GENERATION_ERROR_LABELS.TRY_AGAIN}
            </RippleButton>
            <KeyboardShortcutTooltip
              shortcut={DISPLAY_SYMBOLS.ARROW_LEFT}
              description={WIZARD_GENERATING_LABELS.BACK_TO_REVIEW_DESC}
              position="left"
              modifier={MODIFIER_KEYS.ALT}
            >
              <RippleButton
                onClick={handleViewReview}
                className="btn-ghost text-sm text-dark-400 hover:text-dark-200 flex items-center gap-1.5"
                ariaLabel={GENERATION_ERROR_LABELS.BACK_TO_REVIEW_ARIA}
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
                {GENERATION_ERROR_LABELS.BACK_TO_REVIEW}
                <kbd className={`ml-1.5 ${CSS_CLASSES.KBD_SHORTCUT}`} aria-hidden="true">
                  {getAltKeyLabel()}+{DISPLAY_SYMBOLS.ARROW_LEFT}
                </kbd>
              </RippleButton>
            </KeyboardShortcutTooltip>
          </motion.div>
        ) : (
          <motion.div
            key="generating-actions"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* Live preview hint — adapts text once content starts streaming */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: ANIMATION.SLOW }}
              className="text-sm text-dark-500 mt-8 flex items-center gap-1.5"
            >
              <svg
                className="w-4 h-4 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <AnimatePresence mode="wait">
                <motion.span
                  key={blueprintLines > 0 ? "streaming" : "empty"}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: ANIMATION.TEXT_FADE }}
                >
                  {blueprintLines > 0
                    ? WIZARD_GENERATING_LABELS.HINT_STREAMING
                    : WIZARD_GENERATING_LABELS.HINT_EMPTY}
                </motion.span>
              </AnimatePresence>
            </motion.p>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: ANIMATION.SLOW * 2 }}
              className="mt-8"
            >
              <KeyboardShortcutTooltip
                shortcut={KEY_DISPLAY.ESC}
                description={WIZARD_GENERATING_LABELS.CANCEL_GENERATION_DESC}
                position="top"
                modifier={MODIFIER_KEYS.NONE}
              >
                <RippleButton
                  onClick={handleCancel}
                  className="btn-ghost text-dark-400 hover:text-accent-pink flex items-center gap-2"
                  ariaLabel={
                    isCancelling
                      ? WIZARD_GENERATING_LABELS.CANCELLING_GENERATION_ARIA
                      : WIZARD_GENERATING_LABELS.CANCEL_GENERATION_ARIA
                  }
                  aria-keyshortcuts={KEYBOARD_EVENT_KEYS.ESCAPE}
                  tabIndex={cancelButtonReady ? undefined : -1}
                  disabled={isCancelling}
                  isLoading={isCancelling}
                >
                  {isCancelling ? (
                    <>
                      <div
                        className="w-4 h-4 border-2 border-dark-400/30 border-t-dark-400 rounded-full animate-spin"
                        aria-hidden="true"
                      ></div>
                      {WIZARD_GENERATING_LABELS.CANCELLING_GENERATION}
                    </>
                  ) : (
                    <>
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                      {WIZARD_GENERATING_LABELS.CANCEL_GENERATION}
                      <kbd className={`ml-2 ${CSS_CLASSES.KBD_SHORTCUT}`} aria-hidden="true">
                        {KEY_DISPLAY.ESC}
                      </kbd>
                    </>
                  )}
                </RippleButton>
              </KeyboardShortcutTooltip>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
});
