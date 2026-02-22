import { motion } from "framer-motion";
import { useWizardStore } from "../store";
import { WIZARD_STEPS, UI_EMOJIS } from "../config/constants";
import {
  staggerContainer,
  fadeInUp,
  floatingAnimation,
  pulseAnimation,
} from "../utils/motion";

export function EditorEmptyState(): JSX.Element {
  const currentStep = useWizardStore((s) => s.currentStep);
  const currentIndex = WIZARD_STEPS.findIndex((s) => s.key === currentStep);
  const progress = ((currentIndex + 1) / WIZARD_STEPS.length) * 100;

  return (
    <motion.div
      className="h-full flex flex-col items-center justify-center text-dark-500"
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
    >
      <motion.div className="relative mb-8" variants={fadeInUp}>
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-primary-500/20 via-accent-purple/20 to-accent-pink/20 blur-3xl"
          animate={pulseAnimation}
          style={{ width: 200, height: 200, marginLeft: -100, marginTop: -50 }}
        />

        <div className="relative">
          <motion.div
            className="absolute -top-2 -right-4 w-20 h-24 glass-card rounded-lg border-2 border-dashed border-dark-600 flex items-center justify-center"
            animate={{
              ...floatingAnimation,
              y: [-6, 6, -6],
            }}
            transition={{ ...floatingAnimation.transition, delay: 0.2 }}
          >
            <span className="text-2xl opacity-50" role="img" aria-label="Blank document">{UI_EMOJIS.DOCUMENT_BLANK}</span>
          </motion.div>

          <motion.div
            className="absolute -top-1 -right-2 w-20 h-24 glass-card rounded-lg border-2 border-dashed border-dark-500 flex items-center justify-center"
            animate={{
              ...floatingAnimation,
              y: [-4, 8, -4],
            }}
            transition={{ ...floatingAnimation.transition, delay: 0.1 }}
          >
            <span className="text-2xl opacity-70" role="img" aria-label="Document">{UI_EMOJIS.DOCUMENT}</span>
          </motion.div>

          <motion.div
            className="relative w-20 h-24 glass-card rounded-lg border border-dark-400 flex flex-col items-center justify-center p-3"
            animate={floatingAnimation}
          >
            <motion.div
              className="w-full h-1.5 bg-dark-600 rounded mb-2"
              initial={{ width: "30%" }}
              animate={{ width: ["30%", "80%", "30%"] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            />
            <motion.div
              className="w-full h-1 bg-dark-700 rounded mb-1.5"
              initial={{ width: "60%" }}
              animate={{ width: ["60%", "40%", "60%"] }}
              transition={{
                duration: 2.5,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 0.2,
              }}
            />
            <motion.div
              className="w-full h-1 bg-dark-700 rounded mb-1.5"
              initial={{ width: "80%" }}
              animate={{ width: ["80%", "50%", "80%"] }}
              transition={{
                duration: 2.2,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 0.4,
              }}
            />
            <motion.div
              className="w-full h-1 bg-dark-700 rounded"
              initial={{ width: "40%" }}
              animate={{ width: ["40%", "70%", "40%"] }}
              transition={{
                duration: 1.8,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 0.6,
              }}
            />
          </motion.div>
        </div>
      </motion.div>

      <motion.h3
        className="text-xl font-semibold text-white mb-2"
        variants={fadeInUp}
      >
        Your blueprint is waiting to be created
      </motion.h3>

      <motion.p className="text-dark-400 mb-6" variants={fadeInUp}>
        Complete the wizard steps to generate your project documentation
      </motion.p>

      <motion.div
        className="flex items-center gap-3 glass-card px-6 py-3 rounded-full"
        variants={fadeInUp}
        aria-live="polite"
        aria-atomic="true"
      >
        <div className="flex items-center gap-1">
          {WIZARD_STEPS.map((step, index) => {
            const isCompleted = index < currentIndex;
            const isCurrent = index === currentIndex;

            return (
              <motion.div
                key={step.key}
                className={`w-2 h-2 rounded-full transition-colors duration-300 ${
                  isCompleted
                    ? "bg-accent-emerald"
                    : isCurrent
                      ? "bg-primary-500"
                      : "bg-dark-600"
                }`}
                animate={isCurrent ? { scale: [1, 1.3, 1] } : {}}
                transition={{ duration: 1, repeat: Infinity }}
              />
            );
          })}
        </div>
        <span className="text-sm text-dark-300">
          Step {currentIndex + 1} of {WIZARD_STEPS.length}
        </span>
        <span className="text-xs text-dark-500 tabular-nums">
          {Math.round(progress)}%
        </span>
      </motion.div>

      <motion.p
        className="mt-6 text-sm text-primary-400 flex items-center gap-2"
        variants={fadeInUp}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
      >
        <motion.span
          animate={{ x: [0, 4, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          →
        </motion.span>
        Currently on:{" "}
        <span className="font-medium">
          {WIZARD_STEPS.find((s) => s.key === currentStep)?.label}
        </span>
      </motion.p>
    </motion.div>
  );
}
