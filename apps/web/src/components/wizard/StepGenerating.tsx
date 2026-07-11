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
  ANIMATION_ENTRANCE_DELAYS,
  GENERATION_ERROR_PREFIXES,
  SHORTCUT_DESCRIPTIONS,
  FRAMER_TYPE,
} from "@blueprint/shared/config";
import * as motion from "framer-motion/m";
import { AnimatePresence } from "framer-motion";
import { memo, useCallback, useRef, useEffect } from "react";
import { useEditorStore, useWizardStore, useToast } from "../../store";
import {
  ANIMATION,
  EASING,
  GENERATION_MESSAGES,
  TOAST_MESSAGES,
  SPRING_CONFIG,
  WIZARD_GENERATING_LABELS,
  GENERATION_ERROR_LABELS,
} from "../../config/constants";
import { COLORS } from "../../config/theme";
import { KeyboardShortcutTooltip } from "../SmartTooltip";
import { getAltKeyLabel, getModifierLabel, getAriaShortcutKey } from "../../lib/platform";

import { AnimatedNumber } from "../AnimatedNumber";
import { RippleButton } from "../RippleButton";
import { useReducedMotion } from "../../hooks/useReducedMotion";
import type { AnimationDirection } from "../../utils/motion";

interface StepGeneratingProps {
  direction?: AnimationDirection;
}

export const StepGenerating = memo(function StepGenerating({
  direction: _direction,
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
  const isComplete = !isGenerating && progress === GENERATION_MESSAGES.COMPLETE;
  // Detect error state from the progress message. Both GENERATION_MESSAGES.ERROR
  // and GENERATION_MESSAGES.ERROR_TASKS produce strings starting with "Error",
  // which is the only terminal state that isn't "Complete!" after generation stops.
  const isError =
    !isGenerating && !isComplete && progress.startsWith(GENERATION_ERROR_PREFIXES.GENERIC);

  const handleCancel = useCallback(() => {
    cancelGeneration();
    toast.info(TOAST_MESSAGES.GENERATION_CANCELLED);
    setStep(WIZARD_STEP_KEYS.REVIEW);
  }, [cancelGeneration, setStep, toast]);

  const wasComplete = useRef(false);
  const wasError = useRef(false);
  const errorShownRef = useRef(false);

  // Auto-focus "View in Editor" button when generation completes
  // so keyboard users don't have to search for the new action
  useEffect(() => {
    if (isComplete && !wasComplete.current) {
      // Small delay to let the spring animation settle before focusing
      requestAnimationFrame(() => {
        const btn = document.querySelector<HTMLButtonElement>('[data-autofocus="complete"]');
        btn?.focus();
      });
    }
    wasComplete.current = isComplete;
  }, [isComplete]);

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
      editorPanel.scrollIntoView({ behavior: "smooth", block: "nearest" });

      const priorTabIndex = editorPanel.getAttribute("tabindex");
      editorPanel.tabIndex = -1;
      editorPanel.focus({ preventScroll: true });

      const editorContainer = editorPanel.closest(".glass-card");
      if (editorContainer instanceof HTMLElement) {
        editorContainer.classList.add("editor-focus-highlight");
        setTimeout(() => {
          editorContainer.classList.remove("editor-focus-highlight");
          if (priorTabIndex === null) {
            editorPanel.removeAttribute("tabindex");
          } else {
            editorPanel.setAttribute("tabindex", priorTabIndex);
          }
        }, UI_TIMING.EDITOR_FOCUS_HIGHLIGHT_MS);
      }
    }
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
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
              style={{ borderTopColor: COLORS.primary[500] }}
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
                        scale: [1, 1.08, 1],
                        y: [0, -3, 0],
                        opacity: [1, 0.85, 1],
                      }
                }
                transition={{
                  duration: ANIMATION.SLOW_PULSE,
                  repeat: Infinity,
                  ease: EASING.easeInOut,
                }}
                className="text-3xl"
                aria-hidden="true"
              >
                🚀
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
            <h2 className="text-xl font-bold text-white mb-2">Generation Complete!</h2>
            <p className="text-dark-400 mb-6">
              Your blueprint and tasks are ready to review in the editor
            </p>
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
            <h2 className="text-xl font-bold text-white mb-2">Generating Your Blueprint</h2>
            <p className="text-dark-400 mb-6" role="status" aria-live="polite" aria-atomic="true">
              <motion.span
                animate={{ opacity: [1, 0.55, 1] }}
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
                    {progress || "Starting..."}
                  </motion.span>
                </AnimatePresence>
              </motion.span>
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      <p className="sr-only" role="status" aria-live="polite">
        Generated {blueprintLines} blueprint lines and {tasksLines} task lines
      </p>

      {/* Live stats */}
      <div className="flex gap-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card px-6 py-4"
        >
          <div className="text-2xl font-bold text-gradient">
            <AnimatedNumber value={blueprintLines} duration={0.6} className="text-gradient" />
          </div>
          <div className="text-sm text-dark-400">Blueprint Lines</div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: ANIMATION.STAGGER }}
          className="glass-card px-6 py-4"
        >
          <div className="text-2xl font-bold text-gradient">
            <AnimatedNumber value={tasksLines} duration={0.6} className="text-gradient" />
          </div>
          <div className="text-sm text-dark-400">Task Lines</div>
        </motion.div>
      </div>

      <AnimatePresence mode="wait">
        {isComplete ? (
          <motion.div
            key="complete-actions"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ delay: ANIMATION_ENTRANCE_DELAYS.FULL_SECOND }}
            className="mt-8 flex flex-col items-center gap-3"
          >
            <KeyboardShortcutTooltip
              shortcut="e"
              description={SHORTCUT_DESCRIPTIONS.TOGGLE_EDITOR}
              position="right"
              modifier="cmd"
            >
              <RippleButton
                onClick={handleViewEditor}
                className="btn-primary flex items-center gap-2 attention-glow"
                ariaLabel={WIZARD_GENERATING_LABELS.VIEW_EDITOR_ARIA}
                data-autofocus="complete"
                aria-keyshortcuts={getAriaShortcutKey("e", "cmd")}
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
                <kbd
                  className="ml-2 px-1.5 py-0.5 bg-dark-700/80 rounded text-sm-xs font-mono text-dark-200 border border-dark-600/50 shadow-inner leading-none"
                  aria-hidden="true"
                >
                  {getModifierLabel()}+E
                </kbd>
              </RippleButton>
            </KeyboardShortcutTooltip>
            <KeyboardShortcutTooltip
              shortcut="←"
              description={WIZARD_GENERATING_LABELS.BACK_TO_REVIEW_DESC}
              position="left"
              modifier="alt"
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
                <kbd
                  className="ml-1.5 px-1.5 py-0.5 bg-dark-700/80 rounded text-sm-xs font-mono text-dark-200 border border-dark-600/50 shadow-inner leading-none"
                  aria-hidden="true"
                >
                  {getAltKeyLabel()}+←
                </kbd>
              </RippleButton>
            </KeyboardShortcutTooltip>
            <p className="text-sm text-dark-500 flex items-center gap-1.5">
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
            </p>
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
              shortcut="←"
              description={WIZARD_GENERATING_LABELS.BACK_TO_REVIEW_DESC}
              position="left"
              modifier="alt"
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
                <kbd
                  className="ml-1.5 px-1.5 py-0.5 bg-dark-700/80 rounded text-sm-xs font-mono text-dark-200 border border-dark-600/50 shadow-inner leading-none"
                  aria-hidden="true"
                >
                  {getAltKeyLabel()}+←
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
                shortcut="Esc"
                description={WIZARD_GENERATING_LABELS.CANCEL_GENERATION_DESC}
                position="top"
                modifier="none"
              >
                <RippleButton
                  onClick={handleCancel}
                  className="btn-ghost text-dark-400 hover:text-accent-pink flex items-center gap-2"
                  ariaLabel={WIZARD_GENERATING_LABELS.CANCEL_GENERATION_ARIA}
                  aria-keyshortcuts="Escape"
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
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                  {WIZARD_GENERATING_LABELS.CANCEL_GENERATION}
                  <kbd
                    className="ml-2 px-1.5 py-0.5 bg-dark-700/80 rounded text-sm-xs font-mono text-dark-200 border border-dark-600/50 shadow-inner leading-none"
                    aria-hidden="true"
                  >
                    Esc
                  </kbd>
                </RippleButton>
              </KeyboardShortcutTooltip>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
});
