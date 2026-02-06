import { motion } from "framer-motion";
import type { WizardStep } from "@blueprint/shared";
import { useWizardStore } from "../store";

const STEPS: {
  key: WizardStep;
  label: string;
  icon: string;
  shortcut: string;
}[] = [
  { key: "info", label: "Project Info", icon: "📝", shortcut: "1" },
  { key: "stack", label: "Tech Stack", icon: "⚙️", shortcut: "2" },
  { key: "features", label: "Features", icon: "✨", shortcut: "3" },
  { key: "review", label: "Review", icon: "👀", shortcut: "4" },
  { key: "generating", label: "Generate", icon: "🚀", shortcut: "5" },
];

export function StepIndicator() {
  const currentStep = useWizardStore((s) => s.currentStep);
  const setStep = useWizardStore((s) => s.setStep);

  const currentIndex = STEPS.findIndex((s) => s.key === currentStep);

  const canNavigateTo = (stepKey: WizardStep): boolean => {
    const targetIndex = STEPS.findIndex((s) => s.key === stepKey);
    // Can go back, but not forward beyond current
    return targetIndex <= currentIndex && stepKey !== "generating";
  };

  return (
    <div className="flex items-center justify-center gap-2 mb-8">
      {STEPS.map((step, index) => {
        const isActive = step.key === currentStep;
        const isCompleted = index < currentIndex;
        const isClickable = canNavigateTo(step.key);

        return (
          <div key={step.key} className="flex items-center">
            <motion.button
              onClick={() => isClickable && setStep(step.key)}
              disabled={!isClickable}
              aria-label={
                isClickable
                  ? `${step.label} - Press Alt+${step.shortcut}`
                  : step.label
              }
              title={
                isClickable
                  ? `${step.label} (Alt+${step.shortcut})`
                  : "Complete previous steps to unlock"
              }
              accessKey={step.shortcut}
              className={`
                flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-300
                ${
                  isActive
                    ? "bg-primary-500/20 border border-primary-500/50 text-primary-300"
                    : isCompleted
                      ? "bg-accent-emerald/20 border border-accent-emerald/50 text-accent-emerald"
                      : "bg-dark-800/50 border border-dark-700 text-dark-400"
                }
                ${isClickable ? "cursor-pointer hover:bg-dark-700" : "cursor-default"}
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
