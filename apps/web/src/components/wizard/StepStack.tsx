/**
 * Step 2: Technology Stack Selection
 *
 * Second step in the 5-step wizard for selecting the technology stack.
 * Allows users to choose frontend frameworks, backend languages, databases,
 * and development tools for their project.
 *
 * Features:
 * - Category-based chip selection (Frontend, Backend, Database, Tools)
 * - Minimum selection requirements per category
 * - Visual feedback for selections with animations
 * - Grouped display by category with icons
 *
 * @module components/wizard/StepStack
 * @see {@link TECH_STACK_OPTIONS} - Available tech stack options
 * @see {@link useWizardStore} - Wizard state management
 *
 * @example
 * ```tsx
 * <StepStack />
 * ```
 */

import { motion, AnimatePresence } from "framer-motion";
import { useState, useCallback, useMemo, memo } from "react";
import {
  TECH_STACK_OPTIONS,
  ANIMATION_DIRECTIONS,
  STYLE_ID_STRINGS,
  SHORTCUT_DESCRIPTIONS,
  ANIMATION_ENTRANCE_DELAYS,
  ENTRANCE_STAGGER_DEFAULTS,
} from "@blueprint/shared";
import { useWizardStore } from "../../store";
import {
  CATEGORY_ICONS,
  MIN_REQUIREMENTS,
  ANIMATION,
  TIMEOUTS,
  ANIMATION_MS,
  SPRING_CONFIG,
  UI_CONTENT,
  ACCESSIBILITY_LABELS,
  VALIDATION_MESSAGES,
} from "../../config/constants";
import { TRANSFORMS } from "../../config/theme";
import { pageTransition, type AnimationDirection } from "../../utils/motion";
import { RippleButton } from "../RippleButton";
import { KeyboardShortcutTooltip } from "../SmartTooltip";
import { getModifierLabel, getAltKeyLabel, getAriaShortcutKey } from "../../lib/platform";
import clsx from "clsx";

const attentionKeyframes = `@keyframes stack-card-attention {
  0%, 100% {
    box-shadow: 0 0 0 0 transparent;
  }
  25% {
    box-shadow:
      0 0 0 2px color-mix(in srgb, var(--color-accent-pink) 25%, transparent),
      0 0 18px -4px color-mix(in srgb, var(--color-accent-pink) 12%, transparent);
  }
}`;

if (typeof document !== "undefined") {
  const styleId = STYLE_ID_STRINGS.STACK_CARD_ATTENTION;
  if (!document.getElementById(styleId)) {
    const style = document.createElement("style");
    style.id = styleId;
    style.textContent = attentionKeyframes;
    document.head.appendChild(style);
  }
}

interface TechChipProps {
  tech: { name: string; category: string };
  isSelected: boolean;
  onToggle: (tech: { name: string; category: string }) => void;
  justSelected: string | null;
  entranceIndex?: number;
}

const TechChip = memo(function TechChip({
  tech,
  isSelected,
  onToggle,
  justSelected,
  entranceIndex = 0,
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
        "tech-chip relative overflow-hidden animate-fade-in",
        isSelected && "selected",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/60 focus-visible:ring-offset-2 focus-visible:ring-offset-dark-950"
      )}
      style={{
        animationDelay: `${entranceIndex * ENTRANCE_STAGGER_DEFAULTS.CHIP_STAGGER_S}s`,
        animationFillMode: ENTRANCE_STAGGER_DEFAULTS.FILL_MODE,
      }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      animate={
        isJustSelected
          ? {
              scale: [1, 1.15, 1],
              transition: { duration: ANIMATION.SUBTLE_MOVE, ease: "easeOut" },
            }
          : {}
      }
      transition={{ type: "spring", ...SPRING_CONFIG.SUBTLE_BOUNCE }}
    >
      <AnimatePresence>
        {isJustSelected && (
          <motion.div
            initial={{ scale: 0, opacity: 0.8 }}
            animate={{ scale: 2.5, opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: ANIMATION.HALF_SECOND, ease: "easeOut" }}
            className="absolute inset-0 rounded-full bg-accent-emerald/30 pointer-events-none"
            style={{ transformOrigin: TRANSFORMS.ORIGIN_CENTER }}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isJustSelected && (
          <motion.div
            initial={{ scale: 0.8, opacity: 1 }}
            animate={{ scale: 1.5, opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: ANIMATION.FADE_IN, ease: "easeOut" }}
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
              transition={{ type: "spring", ...SPRING_CONFIG.CHECKMARK }}
            >
              <motion.path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: ANIMATION.NORMAL, delay: ANIMATION_ENTRANCE_DELAYS.FAST }}
              />
            </motion.svg>
          ) : (
            <motion.span
              key="plus"
              className="w-4 h-4 flex items-center justify-center text-dark-500"
              initial={{ scale: 0, rotate: 180 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0, rotate: -180 }}
              transition={{ type: "spring", ...SPRING_CONFIG.CHECKMARK }}
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

interface StepStackProps {
  direction?: AnimationDirection;
}

export const StepStack = memo(function StepStack({
  direction = ANIMATION_DIRECTIONS.FORWARD,
}: StepStackProps): JSX.Element {
  const [isShaking, setIsShaking] = useState(false);
  const [invalidField, setInvalidField] = useState(false);
  const [justSelected, setJustSelected] = useState<string | null>(null);
  const techStack = useWizardStore((s) => s.techStack);
  const addTechStack = useWizardStore((s) => s.addTechStack);
  const removeTechStack = useWizardStore((s) => s.removeTechStack);
  const nextStep = useWizardStore((s) => s.nextStep);
  const prevStep = useWizardStore((s) => s.prevStep);

  const categories = Object.entries(TECH_STACK_OPTIONS);

  // Pre-compute the starting global index for each category so every tech chip
  // receives its position in the full flattened list. Used for staggered entrance
  // animation — each chip fades in with a short delay based on its global index,
  // creating a polished cascade effect when the step loads.
  const categoryStartIndices = useMemo(() => {
    const indices: Record<string, number> = {};
    let idx = 0;
    for (const [category, options] of categories) {
      indices[category] = idx;
      idx += options.length;
    }
    return indices;
  }, [categories]);

  const canProceed = techStack.length >= MIN_REQUIREMENTS.TECH_STACK;

  const handleNextClick = () => {
    if (canProceed) {
      nextStep();
    } else {
      setIsShaking(true);
      setInvalidField(true);
      setTimeout(() => {
        setIsShaking(false);
        setInvalidField(false);
      }, TIMEOUTS.SHAKE_ANIMATION);
    }
  };

  const isSelected = useCallback(
    (name: string) => techStack.some((t) => t.name === name),
    [techStack]
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
        setTimeout(() => setJustSelected(null), ANIMATION_MS.CHIP_SELECT_FEEDBACK);
      }
    },
    [isSelected, addTechStack, removeTechStack]
  );

  const modifierKey = getModifierLabel();
  const minRequired = MIN_REQUIREMENTS.TECH_STACK;
  const progressPercentage = Math.min((techStack.length / minRequired) * 100, 100);

  return (
    <motion.div {...pageTransition(direction)} className="space-y-6">
      <div>
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-2xl font-bold text-white">{UI_CONTENT.WIZARD.STEP_STACK.TITLE}</h2>
          <div className="flex items-center gap-2 text-sm">
            <div className="w-24 h-2 bg-dark-700 rounded-full overflow-hidden">
              <motion.div
                className={`h-full transition-colors duration-300 ${
                  canProceed
                    ? "bg-gradient-to-r from-accent-emerald to-primary-500 progress-shimmer relative"
                    : "bg-gradient-to-r from-primary-500 to-accent-purple"
                }`}
                initial={{ width: 0 }}
                animate={{ width: `${progressPercentage}%` }}
                transition={{ duration: ANIMATION.NORMAL, ease: "easeOut" }}
              />
            </div>
            <span
              className={`tabular-nums ${canProceed ? "text-accent-emerald" : "text-dark-400"}`}
            >
              {techStack.length}/{minRequired}
            </span>
          </div>
        </div>
        <p className="text-dark-400">{UI_CONTENT.WIZARD.STEP_STACK.SUBTITLE}</p>
      </div>

      <div
        className={`glass-card p-6 space-y-6 ${invalidField ? "stack-card-attention" : ""}`}
        role="group"
        aria-label={ACCESSIBILITY_LABELS.WIZARD_STACK.TECH_STACK_SELECTION}
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
              {options.map((tech, chipIdx) => {
                const globalIndex = (categoryStartIndices[category] ?? 0) + chipIdx;
                return (
                  <TechChip
                    key={tech.name}
                    tech={tech}
                    isSelected={isSelected(tech.name)}
                    onToggle={toggleTech}
                    justSelected={justSelected}
                    entranceIndex={globalIndex}
                  />
                );
              })}
            </div>
          </div>
        ))}

        {/* Selected summary */}
        {techStack.length > 0 && (
          <div className="pt-4 border-t border-dark-700">
            <p className="text-sm text-dark-400 mb-2" id="selected-tech-label">
              {UI_CONTENT.WIZARD.STEP_STACK.SELECTED_LABEL(techStack.length)}:
            </p>
            <ul className="flex flex-wrap gap-2" aria-labelledby="selected-tech-label">
              {techStack.map((tech) => (
                <li
                  key={tech.name}
                  className="inline-flex items-center gap-1.5 px-3 py-1 bg-primary-500/20 border border-primary-500/30 rounded-full text-sm text-primary-300"
                >
                  {tech.name}
                  <button
                    onClick={() => removeTechStack(tech.name)}
                    className="hover:text-accent-pink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-pink/50 rounded transition-colors"
                    aria-label={ACCESSIBILITY_LABELS.WIZARD_STACK.REMOVE_TECH(tech.name)}
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

      {/* Persistent validation error — slides in when the user clicks Continue
          without selecting the minimum required technologies. Stays visible
          until the user makes a selection, providing clear, screen-reader-accessible
          feedback about what's needed. */}
      <AnimatePresence>
        {invalidField && (
          <motion.p
            role="alert"
            initial={{ opacity: 0, y: -6, x: -3 }}
            animate={{ opacity: 1, y: 0, x: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: ANIMATION.NORMAL, ease: "easeOut" }}
            className="text-sm text-accent-pink flex items-center gap-1.5"
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
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
            {VALIDATION_MESSAGES.TECH_STACK_MIN(MIN_REQUIREMENTS.TECH_STACK)}
          </motion.p>
        )}
      </AnimatePresence>

      <div className="flex justify-between">
        <KeyboardShortcutTooltip
          shortcut="←"
          description={SHORTCUT_DESCRIPTIONS.GO_BACK}
          position="right"
          modifier="alt"
        >
          <RippleButton
            onClick={prevStep}
            className="btn-secondary flex items-center gap-2 group"
            aria-keyshortcuts={getAriaShortcutKey("ArrowLeft", "alt")}
          >
            <svg
              className="w-5 h-5 transition-transform duration-200 group-hover:-translate-x-0.5"
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
            {UI_CONTENT.BUTTONS.BACK_TO_INFO}
            <kbd
              className="px-1.5 py-0.5 bg-dark-700/80 rounded text-[11px] font-mono text-dark-200 border border-dark-600/50 shadow-inner leading-none"
              aria-hidden="true"
            >
              {getAltKeyLabel()}+←
            </kbd>
          </RippleButton>
        </KeyboardShortcutTooltip>
        <KeyboardShortcutTooltip
          shortcut="Enter"
          description={SHORTCUT_DESCRIPTIONS.CONTINUE_NEXT_STEP}
          position="left"
        >
          <RippleButton
            onClick={handleNextClick}
            disabled={!canProceed}
            className={`btn-primary flex items-center gap-2 group ${canProceed ? "animate-glow" : ""} ${isShaking ? "shake-animation" : ""}`}
            aria-keyshortcuts={getAriaShortcutKey("Enter", "cmd")}
          >
            {UI_CONTENT.WIZARD.STEP_STACK.NEXT_BUTTON}
            <kbd
              className="ml-2 px-1.5 py-0.5 bg-dark-700/80 rounded text-[11px] font-mono text-dark-200 border border-dark-600/50 shadow-inner leading-none"
              aria-hidden="true"
            >
              {modifierKey}+↵
            </kbd>
            <svg
              className="w-5 h-5 transition-transform duration-200 group-hover:translate-x-0.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </RippleButton>
        </KeyboardShortcutTooltip>
      </div>
    </motion.div>
  );
});
