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

import { motion, AnimatePresence } from "framer-motion";
import { memo, useCallback, useRef, useEffect } from "react";
import { useEditorStore, useWizardStore, useToast } from "../../store";
import {
  ANIMATION,
  GENERATION_MESSAGES,
  TOAST_MESSAGES,
  SPRING_CONFIG,
} from "../../config/constants";
import { KeyboardShortcutTooltip } from "../SmartTooltip";
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

  const handleCancel = useCallback(() => {
    cancelGeneration();
    toast.info(TOAST_MESSAGES.GENERATION_CANCELLED);
    setStep("review");
  }, [cancelGeneration, setStep, toast]);

  const wasComplete = useRef(false);

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

  const handleViewReview = useCallback(() => {
    setStep("review");
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
        editorContainer.style.outline = "2px solid rgb(99 102 241 / 0.5)";
        editorContainer.style.outlineOffset = "2px";
        setTimeout(() => {
          editorContainer.style.outline = "";
          editorContainer.style.outlineOffset = "";
          if (priorTabIndex === null) {
            editorPanel.removeAttribute("tabindex");
          } else {
            editorPanel.setAttribute("tabindex", priorTabIndex);
          }
        }, 1500);
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
              type: "spring",
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
                transition={{ duration: ANIMATION.MEDIUM_SLOW, delay: 0.1 }}
              />
              <motion.path
                d="M14 24L21 31L34 17"
                stroke="currentColor"
                strokeWidth="4"
                strokeLinecap="round"
                strokeLinejoin="round"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: ANIMATION.MEDIUM_SLOW, delay: 0.3 }}
              />
            </svg>
          </motion.div>
        ) : (
          <>
            <motion.div
              className="w-24 h-24 rounded-full border-4 border-dark-700"
              style={{ borderTopColor: "rgb(99 102 241)" }}
              animate={{ rotate: 360 }}
              transition={{
                duration: ANIMATION.SPINNER_ROTATION,
                repeat: Infinity,
                ease: "linear",
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
                  ease: "easeInOut",
                }}
                className="text-3xl"
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
            className="text-center"
          >
            <h2 className="text-xl font-bold text-white mb-2">Generation Complete!</h2>
            <p className="text-dark-400 mb-6">
              Your blueprint and tasks are ready to review in the editor
            </p>
          </motion.div>
        ) : (
          <motion.div
            key="generating"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="text-center"
          >
            <h2 className="text-xl font-bold text-white mb-2">Generating Your Blueprint</h2>
            <p className="text-dark-400 mb-6" role="status" aria-live="polite" aria-atomic="true">
              {progress || "Starting..."}
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
            transition={{ delay: 0.3 }}
            className="mt-8 flex flex-col items-center gap-3"
          >
            <RippleButton
              onClick={handleViewEditor}
              className="btn-primary flex items-center gap-2"
              ariaLabel="View the generated blueprint in the editor"
              data-autofocus="complete"
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
              View in Editor
            </RippleButton>
            <RippleButton
              onClick={handleViewReview}
              className="btn-ghost text-sm text-dark-400 hover:text-dark-200 flex items-center gap-1.5"
              ariaLabel="Back to review step"
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
              Back to Review
            </RippleButton>
            <p className="text-sm text-dark-500">
              💡 Content streams in real-time in the editor panel
            </p>
          </motion.div>
        ) : (
          <motion.div
            key="generating-actions"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* Live preview hint */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: ANIMATION.SLOW }}
              className="text-sm text-dark-500 mt-8"
            >
              💡 Content streams in real-time. View the editor panel to see progress.
            </motion.p>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: ANIMATION.SLOW * 2 }}
              className="mt-8"
            >
              <KeyboardShortcutTooltip
                shortcut="Esc"
                description="Cancel generation"
                position="top"
                modifier="none"
              >
                <RippleButton
                  onClick={handleCancel}
                  className="btn-ghost text-dark-400 hover:text-accent-pink flex items-center gap-2"
                  ariaLabel="Cancel generation (Esc)"
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
                  Cancel Generation
                </RippleButton>
              </KeyboardShortcutTooltip>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
});
