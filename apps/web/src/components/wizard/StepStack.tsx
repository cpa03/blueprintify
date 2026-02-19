import { motion, AnimatePresence } from "framer-motion";
import { useState, useCallback, memo } from "react";
import { TECH_STACK_OPTIONS } from "@blueprint/shared";
import { useWizardStore } from "../../store";
import {
  CATEGORY_ICONS,
  MIN_REQUIREMENTS,
  ANIMATION,
  TIMEOUTS,
  ANIMATION_MS,
  UI_CONTENT,
} from "../../config/constants";
import { pageTransition } from "../../utils/motion";
import clsx from "clsx";

interface TechChipProps {
  tech: { name: string; category: string };
  isSelected: boolean;
  onToggle: (tech: { name: string; category: string }) => void;
  justSelected: string | null;
}

const TechChip = memo(function TechChip({
  tech,
  isSelected,
  onToggle,
  justSelected,
}: TechChipProps) {
  const isJustSelected = justSelected === tech.name;

  return (
    <motion.button
      key={tech.name}
      onClick={() => onToggle(tech)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onToggle(tech);
        }
      }}
      aria-pressed={isSelected}
      className={clsx(
        "tech-chip relative overflow-hidden",
        isSelected && "selected",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/60 focus-visible:ring-offset-2 focus-visible:ring-offset-dark-950",
      )}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      animate={
        isJustSelected
          ? {
              scale: [1, 1.15, 1],
              transition: { duration: 0.3, ease: "easeOut" },
            }
          : {}
      }
      transition={{
        type: "spring",
        stiffness: 400,
        damping: 17,
      }}
    >
      <AnimatePresence>
        {isJustSelected && (
          <motion.div
            initial={{ scale: 0, opacity: 0.8 }}
            animate={{ scale: 2.5, opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="absolute inset-0 rounded-full bg-accent-emerald/30 pointer-events-none"
            style={{ transformOrigin: "center" }}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isJustSelected && (
          <motion.div
            initial={{ scale: 0.8, opacity: 1 }}
            animate={{ scale: 1.5, opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="absolute inset-0 rounded-full border-2 border-accent-emerald pointer-events-none"
          />
        )}
      </AnimatePresence>

      <span className="relative z-10 flex items-center gap-1.5">
        <AnimatePresence mode="wait">
          {isSelected ? (
            <motion.svg
              key="checkmark"
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0, rotate: 180 }}
              transition={{
                type: "spring",
                stiffness: 500,
                damping: 15,
              }}
            >
              <motion.path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.2, delay: 0.1 }}
              />
            </motion.svg>
          ) : (
            <motion.span
              key="plus"
              className="w-4 h-4 flex items-center justify-center text-dark-500"
              initial={{ scale: 0, rotate: 180 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0, rotate: -180 }}
              transition={{
                type: "spring",
                stiffness: 500,
                damping: 15,
              }}
            >
              +
            </motion.span>
          )}
        </AnimatePresence>
        <span>{tech.name}</span>
      </span>
    </motion.button>
  );
});

export const StepStack = memo(function StepStack(): JSX.Element {
  const [isShaking, setIsShaking] = useState(false);
  const [justSelected, setJustSelected] = useState<string | null>(null);
  const techStack = useWizardStore((s) => s.techStack);
  const addTechStack = useWizardStore((s) => s.addTechStack);
  const removeTechStack = useWizardStore((s) => s.removeTechStack);
  const nextStep = useWizardStore((s) => s.nextStep);
  const prevStep = useWizardStore((s) => s.prevStep);

  const categories = Object.entries(TECH_STACK_OPTIONS);

  const canProceed = techStack.length >= MIN_REQUIREMENTS.TECH_STACK;

  const handleNextClick = () => {
    if (canProceed) {
      nextStep();
    } else {
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), TIMEOUTS.SHAKE_ANIMATION);
    }
  };

  const isSelected = useCallback(
    (name: string) => techStack.some((t) => t.name === name),
    [techStack],
  );

  const toggleTech = useCallback(
    (tech: { name: string; category: string }) => {
      if (isSelected(tech.name)) {
        removeTechStack(tech.name);
        setJustSelected(null);
      } else {
        addTechStack({
          name: tech.name,
          category: tech.category as
            | "frontend"
            | "backend"
            | "database"
            | "hosting"
            | "ai"
            | "testing"
            | "styling"
            | "other",
        });
        setJustSelected(tech.name);
        setTimeout(
          () => setJustSelected(null),
          ANIMATION_MS.CHIP_SELECT_FEEDBACK,
        );
      }
    },
    [isSelected, addTechStack, removeTechStack],
  );

  const minRequired = MIN_REQUIREMENTS.TECH_STACK;
  const progressPercentage = Math.min(
    (techStack.length / minRequired) * 100,
    100,
  );

  return (
    <motion.div {...pageTransition} className="space-y-6">
      <div>
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-2xl font-bold text-white">
            {UI_CONTENT.WIZARD.STEP_STACK.TITLE}
          </h2>
          <div className="flex items-center gap-2 text-sm">
            <div className="w-24 h-2 bg-dark-700 rounded-full overflow-hidden">
              <motion.div
                className={`h-full transition-colors duration-300 ${
                  canProceed
                    ? "bg-gradient-to-r from-accent-emerald to-primary-500"
                    : "bg-gradient-to-r from-primary-500 to-accent-purple"
                }`}
                initial={{ width: 0 }}
                animate={{ width: `${progressPercentage}%` }}
                transition={{ duration: ANIMATION.NORMAL, ease: "easeOut" }}
              />
            </div>
            <span
              className={`tabular-nums ${
                canProceed ? "text-accent-emerald" : "text-dark-400"
              }`}
            >
              {techStack.length}/{minRequired}
            </span>
          </div>
        </div>
        <p className="text-dark-400">{UI_CONTENT.WIZARD.STEP_STACK.SUBTITLE}</p>
      </div>

      <div
        className="glass-card p-6 space-y-6"
        role="group"
        aria-label="Tech Stack Selection"
      >
        {categories.map(([category, options]) => (
          <div key={category}>
            <h3
              className="text-sm font-medium text-dark-300 uppercase tracking-wider mb-3 flex items-center gap-2"
              id={`category-${category}`}
            >
              <span aria-hidden="true">{CATEGORY_ICONS[category] || "🔧"}</span>
              {category}
            </h3>
            <div
              className="flex flex-wrap gap-2"
              role="group"
              aria-labelledby={`category-${category}`}
            >
              {options.map((tech) => (
                <TechChip
                  key={tech.name}
                  tech={tech}
                  isSelected={isSelected(tech.name)}
                  onToggle={toggleTech}
                  justSelected={justSelected}
                />
              ))}
            </div>
          </div>
        ))}

        {/* Selected summary */}
        {techStack.length > 0 && (
          <div className="pt-4 border-t border-dark-700">
            <p className="text-sm text-dark-400 mb-2" id="selected-tech-label">
              {UI_CONTENT.WIZARD.STEP_STACK.SELECTED_LABEL(techStack.length)}:
            </p>
            <ul
              className="flex flex-wrap gap-2"
              aria-labelledby="selected-tech-label"
            >
              {techStack.map((tech) => (
                <li
                  key={tech.name}
                  className="inline-flex items-center gap-1.5 px-3 py-1 bg-primary-500/20 border border-primary-500/30 rounded-full text-sm text-primary-300"
                >
                  {tech.name}
                  <button
                    onClick={() => removeTechStack(tech.name)}
                    className="hover:text-accent-pink transition-colors"
                    aria-label={`Remove ${tech.name}`}
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
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <div className="flex justify-between">
        <button onClick={prevStep} className="btn-secondary">
          <svg
            className="w-5 h-5 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          {UI_CONTENT.BUTTONS.BACK}
        </button>
        <button
          onClick={handleNextClick}
          disabled={!canProceed}
          className={`btn-primary flex items-center gap-2 ${isShaking ? "shake-animation" : ""}`}
        >
          {UI_CONTENT.WIZARD.STEP_STACK.NEXT_BUTTON}
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </button>
      </div>
    </motion.div>
  );
});
