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
  ANIMATION_DIRECTIONS,
  ANIMATION_ENTRANCE_DELAYS,
  ANIMATION_REPEAT,
  ARIA_ATOMIC_VALUES,
  ARIA_HIDDEN_VALUES,
  ARIA_LIVE_VALUES,
  ARIA_ROLES,
  CIRCLE_GEOMETRY,
  CIRCLE_GEOMETRY_LARGE,
  DISPLAY_SYMBOLS,
  FRAMER_TYPE,
  GENERATION_ERROR_PREFIXES,
  KEYBOARD_EVENT_KEYS,
  LOADING_DOTS_COUNT,
  MODIFIER_KEYS,
  SHORTCUT_DESCRIPTIONS,
  SVG_ICON_DEFAULTS,
  TIME_UNITS,
  UI_TIMEOUTS,
  UI_TIMING,
  WIZARD_STEP_KEYS,
  ICON_PATHS,
  DATA_BOOLEAN_VALUES,
  PERCENT_SCALE,
  DIRECTION,
} from "@blueprint/shared/config";
import * as motion from "framer-motion/m";
import { AnimatePresence } from "framer-motion";
import { ANIMATION_SCALE, ANIMATION_Y_OFFSET, TIME_FORMAT } from "@blueprint/shared";
import { ANIMATE_PRESENCE_MODES } from "@blueprint/shared/config";
import { memo, useCallback, useRef, useEffect, useState, useMemo } from "react";
import { STORAGE_KEYS } from "../../config/keys";
interface ElapsedTime {
  /** Per-second MM:SS for the on-screen ticking timer */
  display: string;
  /** Throttled MM:SS for the assistive-tech live region (see ELAPSED_ANNOUNCEMENT_INTERVAL_MS) */
  announced: string;
}

function formatElapsed(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / TIME_UNITS.SECONDS_PER_MINUTE);
  const secs = totalSeconds % TIME_UNITS.SECONDS_PER_MINUTE;
  return `${minutes}:${secs.toString().padStart(TIME_FORMAT.MM_SS_PAD_WIDTH, TIME_FORMAT.MM_SS_PAD_CHAR)}`;
}

function useElapsedTime(isActive: boolean): ElapsedTime {
  const [seconds, setSeconds] = useState(0);
  const [announcedSeconds, setAnnouncedSeconds] = useState(0);

  useEffect(() => {
    if (!isActive) return;

    const start = Date.now();
    // Defer resets outside the synchronous effect body via microtask to
    // satisfy the project's react-hooks/set-state-in-effect rule.
    queueMicrotask(() => {
      setSeconds(0);
      setAnnouncedSeconds(0);
    });

    // On-screen timer ticks every second.
    const tickId = setInterval(() => {
      setSeconds(Math.floor((Date.now() - start) / TIME_UNITS.MS_PER_SECOND));
    }, UI_TIMEOUTS.ELAPSED_TIMER_INTERVAL_MS);

    // Assistive-tech announcements advance at a coarse cadence so the live
    // region is not re-announced on every second boundary. The announced value
    // is snapshotted to the most recent announcement bucket (e.g. every 30s)
    // so the SR text only changes when a whole bucket has elapsed.
    const announceBucketSeconds = ELAPSED_ANNOUNCEMENT_INTERVAL_MS / TIME_UNITS.MS_PER_SECOND;
    const announceId = setInterval(() => {
      const elapsedSeconds = Math.floor((Date.now() - start) / TIME_UNITS.MS_PER_SECOND);
      setAnnouncedSeconds(
        Math.floor(elapsedSeconds / announceBucketSeconds) * announceBucketSeconds
      );
    }, ELAPSED_ANNOUNCEMENT_INTERVAL_MS);

    return () => {
      clearInterval(tickId);
      clearInterval(announceId);
    };
  }, [isActive]);

  return {
    display: formatElapsed(seconds),
    announced: formatElapsed(announcedSeconds),
  };
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
  GENERATION_PHASE_PERCENTAGES,
  GENERATION_ERROR_LABELS,
  CELEBRATION_TEXT,
  OPACITY_PULSE,
  SCALE_PULSE,
  Y_OFFSET,
  SCROLL_INTO_VIEW_BLOCK,
  ACCESSIBILITY_LABELS,
  AUTOFOCUS_VALUES,
  CSS_CLASSES,
  GENERATION_STAT_LABELS,
  GENERATION_ANNOUNCER,
  KEY_DISPLAY,
  FOCUS_ANNOUNCER,
  ELAPSED_ANNOUNCEMENT_INTERVAL_MS,
  KEYBOARD_SHORTCUTS,
} from "../../config/constants";
import { COLORS, HEADER_ANIMATION } from "../../config/theme";
import { KeyboardShortcutTooltip } from "../SmartTooltip";
import { Icon } from "../Icon";
import { getAltKeyLabel, getModifierLabel, getAriaShortcutKey } from "../../lib/platform";

import { AnimatedNumber } from "../AnimatedNumber";
import { RippleButton } from "../RippleButton";
import { useReducedMotion } from "../../hooks/useReducedMotion";
import { pageTransition, type AnimationDirection } from "../../utils/motion";
import { getScrollBehavior } from "../../utils/scroll";

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
    <span aria-hidden={ARIA_HIDDEN_VALUES.TRUE}>
      {Array.from({ length: LOADING_DOTS_COUNT }, (_, i) => i).map((i) => (
        <motion.span
          key={i}
          className="inline-block"
          initial={{ opacity: 0, scale: ANIMATION_SCALE.TINY }}
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
    if (isComplete) {
      return {
        percent: GENERATION_PHASE_PERCENTAGES.COMPLETE,
        label: GENERATION_PHASE_LABELS.COMPLETE,
      };
    }
    if (isError) {
      return { percent: GENERATION_PHASE_PERCENTAGES.ERROR, label: GENERATION_PHASE_LABELS.ERROR };
    }
    if (!progress) {
      return {
        percent: GENERATION_PHASE_PERCENTAGES.STARTING,
        label: GENERATION_PHASE_LABELS.STARTING,
      };
    }

    if (progress === GENERATION_MESSAGES.BLUEPRINT_START) {
      return {
        percent: GENERATION_PHASE_PERCENTAGES.GENERATING_BLUEPRINT,
        label: GENERATION_PHASE_LABELS.GENERATING_BLUEPRINT,
      };
    }
    if (progress === GENERATION_MESSAGES.BLUEPRINT_COMPLETE) {
      return {
        percent: GENERATION_PHASE_PERCENTAGES.GENERATING_TASKS,
        label: GENERATION_PHASE_LABELS.GENERATING_TASKS,
      };
    }
    return {
      percent: GENERATION_PHASE_PERCENTAGES.IN_PROGRESS,
      label: GENERATION_PHASE_LABELS.IN_PROGRESS,
    };
  }, [progress, isComplete, isError]);

  // Elapsed time timer — ticks while generation is actively running.
  // `display` is the per-second on-screen value; `announced` is the throttled
  // value used by the assistive-tech live region (see ELAPSED_ANNOUNCEMENT_INTERVAL_MS).
  const timerActive = isGenerating && !isComplete && !isError;
  const { display: elapsedDisplay, announced: announcedElapsed } = useElapsedTime(timerActive);

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

  // Show pro tip toast once after first successful generation
  // Appears at a moment of success to teach the ? shortcut for keyboard shortcuts
  const proTipShownRef = useRef(false);
  useEffect(() => {
    if (isComplete && !wasComplete.current && !proTipShownRef.current) {
      let shown: string | null = null;
      try {
        shown = localStorage.getItem(STORAGE_KEYS.PRO_TIP_SHOWN);
      } catch {
        shown = null;
      }
      if (!shown) {
        try {
          localStorage.setItem(STORAGE_KEYS.PRO_TIP_SHOWN, DATA_BOOLEAN_VALUES.TRUE);
        } catch {
          // localStorage can throw in privacy mode — toast below still shows once per mount.
        }
        proTipShownRef.current = true;
        toast.info(WIZARD_GENERATING_LABELS.PRO_TIP_MESSAGE, {
          title: WIZARD_GENERATING_LABELS.PRO_TIP_TITLE,
          ariaLabel: WIZARD_GENERATING_LABELS.PRO_TIP_ARIA,
        });
      }
    }
    wasComplete.current = isComplete;
  }, [isComplete, toast]);

  const handleViewReview = useCallback(() => {
    setStep(WIZARD_STEP_KEYS.REVIEW);
  }, [setStep]);

  const handleViewEditor = useCallback(() => {
    const editorPanel = document.querySelector<HTMLElement>('[id$="-panel"]');
    if (editorPanel) {
      editorPanel.scrollIntoView({
        behavior: getScrollBehavior(),
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
              viewBox={SVG_ICON_DEFAULTS.VIEW_BOX_LARGE}
              fill={SVG_ICON_DEFAULTS.FILL_NONE}
              className="text-accent-emerald"
            >
              <motion.circle
                cx={CIRCLE_GEOMETRY_LARGE.CENTER_X}
                cy={CIRCLE_GEOMETRY_LARGE.CENTER_Y}
                r={CIRCLE_GEOMETRY_LARGE.RADIUS}
                stroke={SVG_ICON_DEFAULTS.STROKE_CURRENT}
                strokeWidth={SVG_ICON_DEFAULTS.STROKE_WIDTH_BOLD}
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={{
                  duration: ANIMATION.MEDIUM_SLOW,
                  delay: ANIMATION_ENTRANCE_DELAYS.FAST,
                }}
              />
              <motion.path
                d={ICON_PATHS.CHECKMARK_LARGE}
                stroke={SVG_ICON_DEFAULTS.STROKE_CURRENT}
                strokeWidth={SVG_ICON_DEFAULTS.STROKE_WIDTH_HEAVY}
                strokeLinecap={SVG_ICON_DEFAULTS.STROKE_LINECAP_ROUND}
                strokeLinejoin={SVG_ICON_DEFAULTS.STROKE_LINEJOIN_ROUND}
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
              viewBox={SVG_ICON_DEFAULTS.VIEW_BOX_LARGE}
              fill={SVG_ICON_DEFAULTS.FILL_NONE}
              className="text-accent-pink"
              role={ARIA_ROLES.IMG}
              aria-label={GENERATION_ERROR_LABELS.ERROR_ICON_ARIA}
            >
              <motion.circle
                cx={CIRCLE_GEOMETRY_LARGE.CENTER_X}
                cy={CIRCLE_GEOMETRY_LARGE.CENTER_Y}
                r={CIRCLE_GEOMETRY_LARGE.RADIUS}
                stroke={SVG_ICON_DEFAULTS.STROKE_CURRENT}
                strokeWidth={SVG_ICON_DEFAULTS.STROKE_WIDTH_BOLD}
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={{
                  duration: ANIMATION.MEDIUM_SLOW,
                  delay: ANIMATION_ENTRANCE_DELAYS.FAST,
                }}
              />
              <motion.path
                d="M16 16L32 32M32 16L16 32"
                stroke={SVG_ICON_DEFAULTS.STROKE_CURRENT}
                strokeWidth={SVG_ICON_DEFAULTS.STROKE_WIDTH_HEAVY}
                strokeLinecap={SVG_ICON_DEFAULTS.STROKE_LINECAP_ROUND}
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
              animate={{ rotate: CIRCLE_GEOMETRY.FULL_TURN_DEG }}
              transition={{
                duration: ANIMATION.SPINNER_ROTATION,
                repeat: ANIMATION_REPEAT.INFINITE,
                ease: EASING.linear,
              }}
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <motion.div
                initial={{ scale: ANIMATION_SCALE.STANDARD, opacity: 0 }}
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
                  repeat: ANIMATION_REPEAT.INFINITE,
                  ease: EASING.easeInOut,
                }}
                className="flex items-center justify-center"
                aria-hidden={ARIA_HIDDEN_VALUES.TRUE}
              >
                <svg
                  className="w-9 h-9"
                  viewBox={SVG_ICON_DEFAULTS.VIEW_BOX}
                  fill={SVG_ICON_DEFAULTS.FILL_NONE}
                  aria-hidden={ARIA_HIDDEN_VALUES.TRUE}
                >
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
                    stroke={SVG_ICON_DEFAULTS.STROKE_NONE}
                  />
                </svg>
              </motion.div>
            </div>
          </>
        )}
      </div>

      <AnimatePresence mode={ANIMATE_PRESENCE_MODES.WAIT}>
        {isComplete ? (
          <motion.div
            key="complete"
            initial={{ opacity: 0, y: ANIMATION_Y_OFFSET.DROP_STANDARD }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: ANIMATION_Y_OFFSET.RISE }}
            transition={{ delay: ANIMATION_ENTRANCE_DELAYS.HALF_SECOND }}
            className="text-center"
          >
            <h2 className="text-xl font-bold text-white mb-2">{CELEBRATION_TEXT.COMPLETE}</h2>
            <p className="text-dark-400 mb-6">{WIZARD_GENERATING_LABELS.COMPLETE_DESCRIPTION}</p>
          </motion.div>
        ) : isError ? (
          <motion.div
            key="error"
            initial={{ opacity: 0, y: ANIMATION_Y_OFFSET.DROP_STANDARD }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: ANIMATION_Y_OFFSET.RISE }}
            className="text-center"
          >
            <h2 className="text-xl font-bold text-accent-pink mb-2">
              {progress.startsWith(GENERATION_ERROR_PREFIXES.TASKS)
                ? GENERATION_ERROR_LABELS.ERROR_TASKS_TITLE
                : GENERATION_ERROR_LABELS.ERROR_TITLE}
            </h2>
            <p
              className="text-dark-400 mb-6"
              role={ARIA_ROLES.ALERT}
              aria-live={ARIA_LIVE_VALUES.ASSERTIVE}
              aria-atomic={ARIA_ATOMIC_VALUES.TRUE}
            >
              {progress}
            </p>
          </motion.div>
        ) : (
          <motion.div
            key={WIZARD_STEP_KEYS.GENERATING}
            initial={{ opacity: 0, y: ANIMATION_Y_OFFSET.DROP_STANDARD }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: ANIMATION_Y_OFFSET.RISE }}
            className="text-center"
          >
            <motion.h2
              className="text-xl font-bold text-white mb-2"
              animate={shouldReduceMotion ? {} : { opacity: OPACITY_PULSE.SUBTLE }}
              transition={{
                duration: ANIMATION.DRIFT,
                repeat: ANIMATION_REPEAT.INFINITE,
                ease: EASING.easeInOut,
              }}
            >
              {WIZARD_GENERATING_LABELS.GENERATING_TITLE}
              <LoadingDots active={!shouldReduceMotion && isGenerating} />
            </motion.h2>
            <p
              className="text-dark-400 mb-6"
              role={ARIA_ROLES.STATUS}
              aria-live={ARIA_LIVE_VALUES.POLITE}
              aria-atomic={ARIA_ATOMIC_VALUES.TRUE}
            >
              <motion.span
                animate={{ opacity: OPACITY_PULSE.STRONG }}
                transition={{
                  duration: ANIMATION.DRIFT,
                  repeat: ANIMATION_REPEAT.INFINITE,
                  ease: EASING.easeInOut,
                }}
              >
                <AnimatePresence mode={ANIMATE_PRESENCE_MODES.WAIT}>
                  <motion.span
                    key={progress || "starting"}
                    initial={{ opacity: 0, y: ANIMATION_Y_OFFSET.DROP_TINY }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: ANIMATION_Y_OFFSET.RISE_TINY }}
                    transition={{ duration: ANIMATION.TEXT_FADE }}
                  >
                    {progress || WIZARD_GENERATING_LABELS.STARTING_FALLBACK}
                  </motion.span>
                </AnimatePresence>
              </motion.span>
              {/* Elapsed time display — shows generation duration as mm:ss with a subtle divider.
                  The visible per-second value is aria-hidden: it sits inside an aria-atomic
                  role=status region, so without hiding it the screen reader would re-announce
                  the whole region on every second boundary (chronometer spam). Assistive-tech
                  users get the throttled elapsed time from the dedicated live region below. */}
              <span className="mx-2 text-dark-600" aria-hidden={ARIA_HIDDEN_VALUES.TRUE}>
                {DISPLAY_SYMBOLS.MIDDOT}
              </span>
              <span
                className="tabular-nums text-dark-500 text-sm"
                aria-hidden={ARIA_HIDDEN_VALUES.TRUE}
              >
                {WIZARD_GENERATING_LABELS.ELAPSED_TIME} {elapsedDisplay}
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
            role={ARIA_ROLES.PROGRESSBAR}
            aria-valuenow={generationPhase.percent}
            aria-valuemin={0}
            aria-valuemax={PERCENT_SCALE}
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
                  isGenerating && generationPhase.percent < PERCENT_SCALE
                    ? shouldReduceMotion
                      ? 0.9
                      : [0.85, 1, 0.85]
                    : 1,
              }}
              transition={
                isGenerating && generationPhase.percent < PERCENT_SCALE && !shouldReduceMotion
                  ? {
                      width: { duration: ANIMATION.PULSE, ease: EASING.easeOut },
                      opacity: {
                        duration: ANIMATION.SLOW_PULSE,
                        repeat: ANIMATION_REPEAT.INFINITE,
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

      <p
        className={FOCUS_ANNOUNCER.LIVE_REGION_CLASS}
        role={ARIA_ROLES.STATUS}
        aria-live={ARIA_LIVE_VALUES.POLITE}
      >
        {timerActive
          ? GENERATION_ANNOUNCER.ELAPSED(announcedElapsed, blueprintLines, tasksLines)
          : GENERATION_ANNOUNCER.GENERATED(blueprintLines, tasksLines)}
      </p>

      {/* Live stats — show "—" while awaiting first content, then animated counts.
          Uses AnimatePresence mode="wait" to crossfade the awaiting dash into the
          counting number, making the first content arrival feel polished rather
          than abruptly swapping out the dash. */}
      <div className="flex gap-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: ANIMATION_Y_OFFSET.DROP_STANDARD }}
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
                  repeat: ANIMATION_REPEAT.INFINITE,
                  ease: EASING.easeInOut,
                }
              : undefined,
            boxShadow: isGenerating
              ? {
                  duration: ANIMATION.BREATH,
                  repeat: ANIMATION_REPEAT.INFINITE,
                  ease: EASING.easeInOut,
                }
              : undefined,
          }}
          className="glass-card px-6 py-4"
        >
          <div className={`text-2xl font-bold ${CSS_CLASSES.TEXT_GRADIENT} relative`}>
            <AnimatePresence mode={ANIMATE_PRESENCE_MODES.WAIT}>
              {awaitingContent ? (
                <motion.span
                  key="awaiting-blueprint"
                  initial={{ opacity: 0, scale: ANIMATION_SCALE.STANDARD }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{
                    opacity: 0,
                    scale: ANIMATION_SCALE.STANDARD,
                    y: ANIMATION_Y_OFFSET.RISE_TINY,
                  }}
                  transition={{ duration: ANIMATION.TEXT_FADE, ease: EASING.easeOut }}
                  className="tabular-nums text-dark-500 inline-block"
                  aria-label={ACCESSIBILITY_LABELS.GENERATION_STATS.AWAITING_BLUEPRINT}
                >
                  {DISPLAY_SYMBOLS.EM_DASH}
                </motion.span>
              ) : (
                <motion.span
                  key="count-blueprint"
                  initial={{
                    opacity: 0,
                    scale: ANIMATION_SCALE.STANDARD,
                    y: ANIMATION_Y_OFFSET.DROP_TINY,
                  }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: ANIMATION_SCALE.STANDARD }}
                  transition={{ duration: ANIMATION.TEXT_FADE, ease: EASING.easeOut }}
                  className="inline-block"
                >
                  <AnimatedNumber
                    value={blueprintLines}
                    duration={ANIMATION.PULSE}
                    className={CSS_CLASSES.TEXT_GRADIENT}
                  />
                </motion.span>
              )}
            </AnimatePresence>
          </div>
          <div className="text-sm text-dark-400">{GENERATION_STAT_LABELS.BLUEPRINT_LINES}</div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: ANIMATION_Y_OFFSET.DROP_STANDARD }}
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
                  repeat: ANIMATION_REPEAT.INFINITE,
                  ease: EASING.easeInOut,
                  delay: ANIMATION.STAGGER,
                }
              : undefined,
            boxShadow: isGenerating
              ? {
                  duration: ANIMATION.BREATH,
                  repeat: ANIMATION_REPEAT.INFINITE,
                  ease: EASING.easeInOut,
                  delay: ANIMATION.STAGGER,
                }
              : undefined,
          }}
          className="glass-card px-6 py-4"
        >
          <div className={`text-2xl font-bold ${CSS_CLASSES.TEXT_GRADIENT} relative`}>
            <AnimatePresence mode={ANIMATE_PRESENCE_MODES.WAIT}>
              {awaitingContent ? (
                <motion.span
                  key="awaiting-tasks"
                  initial={{ opacity: 0, scale: ANIMATION_SCALE.STANDARD }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{
                    opacity: 0,
                    scale: ANIMATION_SCALE.STANDARD,
                    y: ANIMATION_Y_OFFSET.RISE_TINY,
                  }}
                  transition={{ duration: ANIMATION.TEXT_FADE, ease: EASING.easeOut }}
                  className="tabular-nums text-dark-500 inline-block"
                  aria-label={ACCESSIBILITY_LABELS.GENERATION_STATS.AWAITING_TASKS}
                >
                  {DISPLAY_SYMBOLS.EM_DASH}
                </motion.span>
              ) : (
                <motion.span
                  key="count-tasks"
                  initial={{
                    opacity: 0,
                    scale: ANIMATION_SCALE.STANDARD,
                    y: ANIMATION_Y_OFFSET.DROP_TINY,
                  }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: ANIMATION_SCALE.STANDARD }}
                  transition={{ duration: ANIMATION.TEXT_FADE, ease: EASING.easeOut }}
                  className="inline-block"
                >
                  <AnimatedNumber
                    value={tasksLines}
                    duration={ANIMATION.PULSE}
                    className={CSS_CLASSES.TEXT_GRADIENT}
                  />
                </motion.span>
              )}
            </AnimatePresence>
          </div>
          <div className="text-sm text-dark-400">{GENERATION_STAT_LABELS.TASKS_LINES}</div>
        </motion.div>
      </div>

      <AnimatePresence mode={ANIMATE_PRESENCE_MODES.WAIT}>
        {isComplete ? (
          <motion.div
            key="complete-actions"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, y: ANIMATION_Y_OFFSET.RISE }}
            transition={{ duration: ANIMATION.NORMAL }}
            className="mt-8 flex flex-col items-center gap-3"
          >
            {/* View in Editor — primary action enters with a gentle spring
                bounce, giving the user a clear "first thing to do" cue. */}
            <motion.div
              initial={{
                opacity: 0,
                y: ANIMATION_Y_OFFSET.DROP_STANDARD,
                scale: ANIMATION_SCALE.SUBTLE,
              }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{
                delay: ANIMATION_ENTRANCE_DELAYS.FULL_SECOND,
                ...SPRING_CONFIG.REFRESH,
              }}
            >
              <KeyboardShortcutTooltip
                shortcut={KEYBOARD_SHORTCUTS.TOGGLE_EDITOR.KEY}
                description={SHORTCUT_DESCRIPTIONS.TOGGLE_EDITOR}
                position={DIRECTION.RIGHT}
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
                    fill={SVG_ICON_DEFAULTS.FILL_NONE}
                    stroke={SVG_ICON_DEFAULTS.STROKE_CURRENT}
                    viewBox={SVG_ICON_DEFAULTS.VIEW_BOX}
                    aria-hidden={ARIA_HIDDEN_VALUES.TRUE}
                  >
                    <path
                      strokeLinecap={SVG_ICON_DEFAULTS.STROKE_LINECAP_ROUND}
                      strokeLinejoin={SVG_ICON_DEFAULTS.STROKE_LINEJOIN_ROUND}
                      strokeWidth={SVG_ICON_DEFAULTS.STROKE_WIDTH_DEFAULT}
                      d={ICON_PATHS.USER}
                    />
                    <path
                      strokeLinecap={SVG_ICON_DEFAULTS.STROKE_LINECAP_ROUND}
                      strokeLinejoin={SVG_ICON_DEFAULTS.STROKE_LINEJOIN_ROUND}
                      strokeWidth={SVG_ICON_DEFAULTS.STROKE_WIDTH_DEFAULT}
                      d={ICON_PATHS.EYE}
                    />
                  </svg>
                  {WIZARD_GENERATING_LABELS.VIEW_IN_EDITOR}
                  <kbd
                    className={`ml-2 ${CSS_CLASSES.KBD_SHORTCUT}`}
                    aria-hidden={ARIA_HIDDEN_VALUES.TRUE}
                  >
                    {getModifierLabel()}+E
                  </kbd>
                </RippleButton>
              </KeyboardShortcutTooltip>
            </motion.div>
            {/* Back to Review — secondary action enters a beat after the primary
                button, creating a staggered hierarchy that guides the user's eye
                to the more important action first. */}
            <motion.div
              initial={{ opacity: 0, y: ANIMATION_Y_OFFSET.DROP_STANDARD }}
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
                position={DIRECTION.LEFT}
                modifier={MODIFIER_KEYS.ALT}
              >
                <RippleButton
                  onClick={handleViewReview}
                  className="btn-ghost text-sm text-dark-400 hover:text-dark-200 flex items-center gap-1.5"
                  ariaLabel={WIZARD_GENERATING_LABELS.BACK_TO_REVIEW_ARIA}
                >
                  <svg
                    className="w-4 h-4"
                    fill={SVG_ICON_DEFAULTS.FILL_NONE}
                    stroke={SVG_ICON_DEFAULTS.STROKE_CURRENT}
                    viewBox={SVG_ICON_DEFAULTS.VIEW_BOX}
                    aria-hidden={ARIA_HIDDEN_VALUES.TRUE}
                  >
                    <path
                      strokeLinecap={SVG_ICON_DEFAULTS.STROKE_LINECAP_ROUND}
                      strokeLinejoin={SVG_ICON_DEFAULTS.STROKE_LINEJOIN_ROUND}
                      strokeWidth={SVG_ICON_DEFAULTS.STROKE_WIDTH_DEFAULT}
                      d={ICON_PATHS.CHEVRON_LEFT}
                    />
                  </svg>
                  {WIZARD_GENERATING_LABELS.BACK_TO_REVIEW}
                  <kbd
                    className={`ml-1.5 ${CSS_CLASSES.KBD_SHORTCUT}`}
                    aria-hidden={ARIA_HIDDEN_VALUES.TRUE}
                  >
                    {getAltKeyLabel()}+{DISPLAY_SYMBOLS.ARROW_LEFT}
                  </kbd>
                </RippleButton>
              </KeyboardShortcutTooltip>
            </motion.div>
            {/* Content hint — tertiary info enters last, after the actions
                have settled, keeping its emphasis as supplementary guidance
                rather than competing with the primary call-to-action. */}
            <motion.p
              initial={{ opacity: 0, y: ANIMATION_Y_OFFSET.DROP_STANDARD }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                delay: ANIMATION_ENTRANCE_DELAYS.FULL_SECOND + ANIMATION.STAGGER * 2,
                duration: ANIMATION.NORMAL,
                ease: EASING.easeOut,
              }}
              className="text-sm text-dark-500 flex items-center gap-1.5"
            >
              <Icon name="helpCircleOutline" className="w-4 h-4 flex-shrink-0" />
              {WIZARD_GENERATING_LABELS.CONTENT_AVAILABLE}
            </motion.p>
          </motion.div>
        ) : isError ? (
          <motion.div
            key="error-actions"
            initial={{ opacity: 0, y: ANIMATION_Y_OFFSET.DROP_STANDARD }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: ANIMATION_Y_OFFSET.RISE }}
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
                fill={SVG_ICON_DEFAULTS.FILL_NONE}
                stroke={SVG_ICON_DEFAULTS.STROKE_CURRENT}
                viewBox={SVG_ICON_DEFAULTS.VIEW_BOX}
                aria-hidden={ARIA_HIDDEN_VALUES.TRUE}
              >
                <path
                  strokeLinecap={SVG_ICON_DEFAULTS.STROKE_LINECAP_ROUND}
                  strokeLinejoin={SVG_ICON_DEFAULTS.STROKE_LINEJOIN_ROUND}
                  strokeWidth={SVG_ICON_DEFAULTS.STROKE_WIDTH_DEFAULT}
                  d={ICON_PATHS.REFRESH}
                />
              </svg>
              {GENERATION_ERROR_LABELS.TRY_AGAIN}
            </RippleButton>
            <KeyboardShortcutTooltip
              shortcut={DISPLAY_SYMBOLS.ARROW_LEFT}
              description={WIZARD_GENERATING_LABELS.BACK_TO_REVIEW_DESC}
              position={DIRECTION.LEFT}
              modifier={MODIFIER_KEYS.ALT}
            >
              <RippleButton
                onClick={handleViewReview}
                className="btn-ghost text-sm text-dark-400 hover:text-dark-200 flex items-center gap-1.5"
                ariaLabel={GENERATION_ERROR_LABELS.BACK_TO_REVIEW_ARIA}
              >
                <svg
                  className="w-4 h-4"
                  fill={SVG_ICON_DEFAULTS.FILL_NONE}
                  stroke={SVG_ICON_DEFAULTS.STROKE_CURRENT}
                  viewBox={SVG_ICON_DEFAULTS.VIEW_BOX}
                  aria-hidden={ARIA_HIDDEN_VALUES.TRUE}
                >
                  <path
                    strokeLinecap={SVG_ICON_DEFAULTS.STROKE_LINECAP_ROUND}
                    strokeLinejoin={SVG_ICON_DEFAULTS.STROKE_LINEJOIN_ROUND}
                    strokeWidth={SVG_ICON_DEFAULTS.STROKE_WIDTH_DEFAULT}
                    d={ICON_PATHS.CHEVRON_LEFT}
                  />
                </svg>
                {GENERATION_ERROR_LABELS.BACK_TO_REVIEW}
                <kbd
                  className={`ml-1.5 ${CSS_CLASSES.KBD_SHORTCUT}`}
                  aria-hidden={ARIA_HIDDEN_VALUES.TRUE}
                >
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
              <Icon name="helpCircleOutline" className="w-4 h-4 flex-shrink-0" />
              <AnimatePresence mode={ANIMATE_PRESENCE_MODES.WAIT}>
                <motion.span
                  key={blueprintLines > 0 ? "streaming" : "empty"}
                  initial={{ opacity: 0, y: ANIMATION_Y_OFFSET.DROP_TINY }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: ANIMATION_Y_OFFSET.RISE_TINY }}
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
                position={DIRECTION.TOP}
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
                        aria-hidden={ARIA_HIDDEN_VALUES.TRUE}
                      ></div>
                      {WIZARD_GENERATING_LABELS.CANCELLING_GENERATION}
                    </>
                  ) : (
                    <>
                      <Icon name="close" className="w-4 h-4" />
                      {WIZARD_GENERATING_LABELS.CANCEL_GENERATION}
                      <kbd
                        className={`ml-2 ${CSS_CLASSES.KBD_SHORTCUT}`}
                        aria-hidden={ARIA_HIDDEN_VALUES.TRUE}
                      >
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
