import { motion } from "framer-motion";
import { useState } from "react";
import { TECH_STACK_OPTIONS } from "@blueprint/shared";
import { useWizardStore } from "../../store";
import {
  CATEGORY_ICONS,
  MIN_REQUIREMENTS,
  ANIMATION,
} from "../../config/constants";
import clsx from "clsx";

export function StepStack() {
  const [isShaking, setIsShaking] = useState(false);
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
      setTimeout(() => setIsShaking(false), 400);
    }
  };

  const isSelected = (name: string) => techStack.some((t) => t.name === name);

  const toggleTech = (tech: { name: string; category: string }) => {
    if (isSelected(tech.name)) {
      removeTechStack(tech.name);
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
    }
  };

  const minRequired = MIN_REQUIREMENTS.TECH_STACK;
  const progressPercentage = Math.min(
    (techStack.length / minRequired) * 100,
    100,
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-6"
    >
      <div>
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-2xl font-bold text-white">
            Choose your tech stack
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
        <p className="text-dark-400">
          Select at least {minRequired} technology
          {minRequired !== 1 ? "ies" : "y"} to proceed. This helps generate
          accurate architecture.
        </p>
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
                <button
                  key={tech.name}
                  onClick={() => toggleTech(tech)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      toggleTech(tech);
                    }
                  }}
                  aria-pressed={isSelected(tech.name)}
                  className={clsx(
                    "tech-chip",
                    isSelected(tech.name) && "selected",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/60 focus-visible:ring-offset-2 focus-visible:ring-offset-dark-950",
                  )}
                >
                  {isSelected(tech.name) && (
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
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  )}
                  {tech.name}
                </button>
              ))}
            </div>
          </div>
        ))}

        {/* Selected summary */}
        {techStack.length > 0 && (
          <div className="pt-4 border-t border-dark-700">
            <p className="text-sm text-dark-400 mb-2" id="selected-tech-label">
              Selected ({techStack.length}):
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
          Back
        </button>
        <button
          onClick={handleNextClick}
          disabled={!canProceed}
          className={`btn-primary flex items-center gap-2 ${isShaking ? "shake-animation" : ""}`}
        >
          Next: Add Features
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
}
