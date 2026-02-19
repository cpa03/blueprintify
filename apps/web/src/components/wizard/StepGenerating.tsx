import { motion } from "framer-motion";
import { memo } from "react";
import { useEditorStore } from "../../store";
import { useWizardStore } from "../../store";
import { ANIMATION } from "../../config/constants";
import { KeyboardShortcutTooltip } from "../SmartTooltip";
import { AnimatedNumber } from "../AnimatedNumber";

export const StepGenerating = memo(function StepGenerating(): JSX.Element {
  const progress = useEditorStore((s) => s.generationProgress);
  const blueprintContent = useEditorStore((s) => s.blueprintContent);
  const tasksContent = useEditorStore((s) => s.tasksContent);
  const cancelGeneration = useEditorStore((s) => s.cancelGeneration);
  const setStep = useWizardStore((s) => s.setStep);

  const blueprintLines = blueprintContent?.split("\n").length ?? 0;
  const tasksLines = tasksContent?.split("\n").length ?? 0;

  const handleCancel = () => {
    cancelGeneration();
    setStep("review");
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center justify-center py-12"
    >
      {/* Animated loader */}
      <div className="relative mb-8">
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
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: ANIMATION.FAST }}
            className="text-3xl"
          >
            🚀
          </motion.div>
        </div>
      </div>

      {/* Progress text */}
      <h2 className="text-xl font-bold text-white mb-2">
        Generating Your Blueprint
      </h2>
      <p
        className="text-dark-400 mb-6"
        role="status"
        aria-live="polite"
        aria-atomic="true"
      >
        {progress || "Starting..."}
      </p>
      <p className="sr-only" role="status" aria-live="polite">
        Generated {blueprintLines} blueprint lines and {tasksLines} task lines
      </p>

      {/* Live stats */}
      <div
        className="flex gap-8 text-center"
        aria-live="polite"
        aria-atomic="true"
      >
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card px-6 py-4"
        >
          <div className="text-2xl font-bold text-gradient">
            <AnimatedNumber
              value={blueprintLines}
              duration={0.6}
              className="text-gradient"
            />
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
            <AnimatedNumber
              value={tasksLines}
              duration={0.6}
              className="text-gradient"
            />
          </div>
          <div className="text-sm text-dark-400">Task Lines</div>
        </motion.div>
      </div>

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
          <button
            onClick={handleCancel}
            className="btn-ghost text-dark-400 hover:text-accent-pink flex items-center gap-2"
            aria-label="Cancel generation (Esc)"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
            Cancel Generation
          </button>
        </KeyboardShortcutTooltip>
      </motion.div>
    </motion.div>
  );
});
