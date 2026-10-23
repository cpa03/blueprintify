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

import * as motion from "framer-motion/m";
import { AnimatePresence } from "framer-motion";
import {
  ANIMATION_SCALE,
  ANIMATION_OPACITY,
  ANIMATION_X_OFFSET,
  ANIMATION_Y_OFFSET,
} from "@blueprint/shared";
import { useState, useCallback, useMemo, useRef, useEffect, memo } from "react";
import { TECH_STACK_OPTIONS } from "@blueprint/shared/schema";
import {
  ANIMATION_DIRECTIONS,
  ANIMATION_ENTRANCE_DELAYS,
  ARIA_ATOMIC_VALUES,
  ARIA_HIDDEN_VALUES,
  ARIA_LIVE_VALUES,
  ARIA_ROLES,
  DISPLAY_SYMBOLS,
  ENTRANCE_STAGGER_DEFAULTS,
  FRAMER_TYPE,
  ICON_PATHS,
  KEYBOARD_EVENT_KEYS,
  MODIFIER_KEYS,
  SHORTCUT_DESCRIPTIONS,
  STYLE_ID_STRINGS,
} from "@blueprint/shared/config";
import { useWizardStore } from "../../store";
import { useReducedMotion } from "../../hooks/useReducedMotion";
import {
  CATEGORY_ICONS,
  MIN_REQUIREMENTS,
  ANIMATION,
  EASING,
  TIMEOUTS,
  ANIMATION_MS,
  SPRING_CONFIG,
  HOVER_SCALE,
  TAP_SCALE,
  SCALE_PULSE,
  UI_CONTENT,
  ACCESSIBILITY_LABELS,
  VALIDATION_MESSAGES,
  CSS_CLASSES,
  DOM_ELEMENT_IDS,
  FOCUS_ANNOUNCER,
} from "../../config/constants";
import { TRANSFORMS } from "../../config/theme";
import { pageTransition, type AnimationDirection } from "../../utils/motion";
import { RippleButton } from "../RippleButton";
import { Icon } from "../Icon";
import { KeyboardShortcutTooltip } from "../SmartTooltip";
import { getModifierLabel, getAltKeyLabel, getAriaShortcutKey } from "../../lib/platform";
import clsx from "clsx";
import { SVG_ICON_DEFAULTS, COLOR_MIX_OPACITY } from "@blueprint/shared/config";

const attentionKeyframes = `@keyframes stack-card-attention {
  0%, 100% {
    box-shadow: 0 0 0 0 transparent;
  }
  25% {
    box-shadow:
      0 0 0 2px color-mix(in srgb, var(--color-accent-pink) ${COLOR_MIX_OPACITY.HIGHLIGHT}, transparent),
      0 0 18px -4px color-mix(in srgb, var(--color-accent-pink) ${COLOR_MIX_OPACITY.MEDIUM}, transparent);
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
  shouldReduceMotion?: boolean;
}

const TechChip = memo(function TechChip({
  tech,
  isSelected,
  onToggle,
  justSelected,
  entranceIndex = 0,
  shouldReduceMotion = false,
}: TechChipProps) {
  const isJustSelected = justSelected === tech.name;

  return (
    <motion.button
      key={tech.name}
      onClick={() => onToggle(tech)}
      onKeyDown={(e) => {
        if (e.key === KEYBOARD_EVENT_KEYS.ENTER || e.key === KEYBOARD_EVENT_KEYS.SPACE) {
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
        animationDelay: shouldReduceMotion ? "0s" : `${entranceIndex * ENTRANCE_STAGGER_DEFAULTS.CHIP_STAGGER_S}s`,
        animationFillMode: ENTRANCE_STAGGER_DEFAULTS.FILL_MODE,
      }}
      whileHover={shouldReduceMotion ? {} : HOVER_SCALE.STANDARD}
      whileTap={shouldReduceMotion ? {} : TAP_SCALE.STANDARD}
      animate={
        isJustSelected && !shouldReduceMotion
          ? {
              scale: SCALE_PULSE.GLOW,
              transition: { duration: ANIMATION.SUBTLE_MOVE, ease: EASING.easeOut },
            }
          : {}
      }
      transition={{ type: FRAMER_TYPE.SPRING, ...SPRING_CONFIG.SUBTLE_BOUNCE }}
    >
      <AnimatePresence>
        {isJustSelected && (
          <motion.div
            initial={{ scale: 0, opacity: ANIMATION_OPACITY.SUBTLE }}
            animate={{ scale: ANIMATION_SCALE.ATTENTION_RING, opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: ANIMATION.HALF_SECOND, ease: EASING.easeOut }}
            className="absolute inset-0 rounded-full bg-accent-emerald/30 pointer-events-none"
            style={{ transformOrigin: TRANSFORMS.ORIGIN_CENTER }}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isJustSelected && (
          <motion.div
            initial={{ scale: ANIMATION_SCALE.STANDARD, opacity: 1 }}
            animate={{ scale: ANIMATION_SCALE.BADGE_EXPAND, opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: ANIMATION.FADE_IN, ease: EASING.easeOut }}
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
              fill={SVG_ICON_DEFAULTS.FILL_NONE}
              stroke={SVG_ICON_DEFAULTS.STROKE_CURRENT}
              viewBox={SVG_ICON_DEFAULTS.VIEW_BOX}
              aria-hidden={ARIA_HIDDEN_VALUES.TRUE}
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0, rotate: 180 }}
              transition={{ type: FRAMER_TYPE.SPRING, ...SPRING_CONFIG.CHECKMARK }}
            >
              <motion.path
                strokeLinecap={SVG_ICON_DEFAULTS.STROKE_LINECAP_ROUND}
                strokeLinejoin={SVG_ICON_DEFAULTS.STROKE_LINEJOIN_ROUND}
                strokeWidth={SVG_ICON_DEFAULTS.STROKE_WIDTH_DEFAULT}
                d={ICON_PATHS.CHECKMARK}
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
              transition={{ type: FRAMER_TYPE.SPRING, ...SPRING_CONFIG.CHECKMARK }}
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
  const shouldReduceMotion = useReducedMotion();
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
  const prevCanProceedRef = useRef(canProceed);
  const [showMilestone, setShowMilestone] = useState(false);
  const [milestoneAnnouncement, setMilestoneAnnouncement] = useState("");

  useEffect(() => {
    if (canProceed && !prevCanProceedRef.current) {
      setShowMilestone(true);
      setMilestoneAnnouncement(ACCESSIBILITY_LABELS.WIZARD_STACK.MINIMUM_MET_ANNOUNCEMENT);
      const timer = setTimeout(() => {
        setShowMilestone(false);
        setMilestoneAnnouncement("");
      }, ANIMATION_MS.CHIP_SELECT_FEEDBACK);
      prevCanProceedRef.current = true;
      return () => clearTimeout(timer);
    }
    prevCanProceedRef.current = canProceed;
  }, [canProceed]);

  const handleNextClick = () => {
    if (canProceed) {
      nextStep();
    } else {
      setIsShaking(true);
      setInvalidField(true);
      // Shake is transient; the error persists until cleared in toggleTech.
      setTimeout(() => {
        setIsShaking(false);
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
      // User responded to the validation error by making a selection — clear it.
      setInvalidField(false);
    },
    [isSelected, addTechStack, removeTechStack]
  );

  const modifierKey = getModifierLabel();
  const minRequired = MIN_REQUIREMENTS.TECH_STACK;
  const progressPercentage = Math.min((techStack.length / minRequired) * 100, 100);

  return (
    <motion.div
      {...pageTransition(direction)}
      className="space-y-6"
      data-reduced-motion={shouldReduceMotion ? "true" : "false"}
      data-can-proceed={canProceed ? "true" : "false"}
      data-selected-count={techStack.length}
      data-min-required={minRequired}
    >
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
                transition={{ duration: ANIMATION.NORMAL, ease: EASING.easeOut }}
              />
            </div>
            <motion.span
              animate={showMilestone ? { scale: [1, 1.35, 1] } : { scale: 1 }}
              transition={{ type: FRAMER_TYPE.SPRING, ...SPRING_CONFIG.MILESTONE_PULSE }}
              className={`tabular-nums ${canProceed ? "text-accent-emerald" : "text-dark-400"}`}
              aria-label={ACCESSIBILITY_LABELS.WIZARD_STACK.COUNTER(techStack.length, minRequired)}
              aria-live={ARIA_LIVE_VALUES.POLITE}
              aria-atomic={ARIA_ATOMIC_VALUES.TRUE}
            >
              {techStack.length}/{minRequired}
            </motion.span>
          </div>
        </div>
        <p className="text-dark-400">{UI_CONTENT.WIZARD.STEP_STACK.SUBTITLE}</p>
      </div>

      <div
        className={`glass-card p-6 space-y-6 ${invalidField ? "stack-card-attention" : ""}`}
        role={ARIA_ROLES.GROUP}
        aria-label={ACCESSIBILITY_LABELS.WIZARD_STACK.TECH_STACK_SELECTION}
      >
        {categories.map(([category, options]) => (
          <div key={category}>
            <h3
              className="text-sm font-medium text-dark-300 uppercase tracking-wider mb-3 flex items-center gap-2"
              id={`category-${category}`}
            >
              <span aria-hidden={ARIA_HIDDEN_VALUES.TRUE}>{CATEGORY_ICONS[category] || "🔧"}</span>
              {category}
            </h3>
            <div
              className="flex flex-wrap gap-2"
              role={ARIA_ROLES.GROUP}
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
                    shouldReduceMotion={shouldReduceMotion}
                  />
                );
              })}
            </div>
          </div>
        ))}

        {/* Selected summary */}
        {techStack.length > 0 && (
          <div className="pt-4 border-t border-dark-700">
            <p className="text-sm text-dark-400 mb-2" id={DOM_ELEMENT_IDS.SELECTED_TECH_LABEL}>
              {UI_CONTENT.WIZARD.STEP_STACK.SELECTED_LABEL(techStack.length)}:
            </p>
            <ul
              className="flex flex-wrap gap-2"
              aria-labelledby={DOM_ELEMENT_IDS.SELECTED_TECH_LABEL}
            >
              <AnimatePresence mode="popLayout">
                {techStack.map((tech) => (
                  <motion.li
                    key={tech.name}
                    layout
                    initial={{ opacity: 0, scale: ANIMATION_SCALE.CARD }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: ANIMATION_SCALE.CARD }}
                    transition={{ type: FRAMER_TYPE.SPRING, ...SPRING_CONFIG.DEFAULT }}
                    className="inline-flex items-center gap-1.5 px-3 py-1 bg-primary-500/20 border border-primary-500/30 rounded-full text-sm text-primary-300"
                  >
                    {tech.name}
                    <button
                      onClick={() => removeTechStack(tech.name)}
                      className="hover:text-accent-pink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-pink/50 rounded transition-colors"
                      aria-label={ACCESSIBILITY_LABELS.WIZARD_STACK.REMOVE_TECH(tech.name)}
                    >
                      <Icon name="close" className="w-4 h-4" />
                    </button>
                  </motion.li>
                ))}
              </AnimatePresence>
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
            role={ARIA_ROLES.ALERT}
            initial={{
              opacity: 0,
              y: ANIMATION_Y_OFFSET.RISE_SMALL,
              x: ANIMATION_X_OFFSET.SLIDE_LEFT_MICRO,
            }}
            animate={{ opacity: 1, y: 0, x: 0 }}
            exit={{ opacity: 0, y: ANIMATION_Y_OFFSET.RISE_SMALL }}
            transition={{ duration: ANIMATION.NORMAL, ease: EASING.easeOut }}
            className="text-sm text-accent-pink flex items-center gap-1.5"
          >
            <svg
              className="w-4 h-4 flex-shrink-0"
              fill={SVG_ICON_DEFAULTS.FILL_NONE}
              stroke={SVG_ICON_DEFAULTS.STROKE_CURRENT}
              viewBox={SVG_ICON_DEFAULTS.VIEW_BOX}
              aria-hidden={ARIA_HIDDEN_VALUES.TRUE}
            >
              <path
                strokeLinecap={SVG_ICON_DEFAULTS.STROKE_LINECAP_ROUND}
                strokeLinejoin={SVG_ICON_DEFAULTS.STROKE_LINEJOIN_ROUND}
                strokeWidth={SVG_ICON_DEFAULTS.STROKE_WIDTH_DEFAULT}
                d={ICON_PATHS.WARNING}
              />
            </svg>
            {VALIDATION_MESSAGES.TECH_STACK_MIN(MIN_REQUIREMENTS.TECH_STACK)}
          </motion.p>
        )}
      </AnimatePresence>

      <div className="flex justify-between">
        <KeyboardShortcutTooltip
          shortcut={DISPLAY_SYMBOLS.ARROW_LEFT}
          description={SHORTCUT_DESCRIPTIONS.GO_BACK}
          position="right"
          modifier={MODIFIER_KEYS.ALT}
        >
          <RippleButton
            onClick={prevStep}
            className="btn-secondary flex items-center gap-2 group"
            aria-keyshortcuts={getAriaShortcutKey(
              KEYBOARD_EVENT_KEYS.ARROW_LEFT,
              MODIFIER_KEYS.ALT
            )}
          >
            <svg
              className="w-5 h-5 transition-transform duration-200 group-hover:-translate-x-0.5"
              fill={SVG_ICON_DEFAULTS.FILL_NONE}
              stroke={SVG_ICON_DEFAULTS.STROKE_CURRENT}
              viewBox={SVG_ICON_DEFAULTS.VIEW_BOX}
            >
              <path
                strokeLinecap={SVG_ICON_DEFAULTS.STROKE_LINECAP_ROUND}
                strokeLinejoin={SVG_ICON_DEFAULTS.STROKE_LINEJOIN_ROUND}
                strokeWidth={SVG_ICON_DEFAULTS.STROKE_WIDTH_DEFAULT}
                d={ICON_PATHS.CHEVRON_LEFT}
              />
            </svg>
            {UI_CONTENT.BUTTONS.BACK_TO_INFO}
            <kbd className={CSS_CLASSES.KBD_SHORTCUT} aria-hidden={ARIA_HIDDEN_VALUES.TRUE}>
              {getAltKeyLabel()}+{DISPLAY_SYMBOLS.ARROW_LEFT}
            </kbd>
          </RippleButton>
        </KeyboardShortcutTooltip>
        <KeyboardShortcutTooltip
          shortcut={KEYBOARD_EVENT_KEYS.ENTER}
          description={SHORTCUT_DESCRIPTIONS.CONTINUE_NEXT_STEP}
          position="left"
        >
          <RippleButton
            onClick={handleNextClick}
            className={`btn-primary flex items-center gap-2 group ${canProceed ? "animate-glow" : ""} ${isShaking ? CSS_CLASSES.SHAKE_ANIMATION : ""}`}
            aria-keyshortcuts={getAriaShortcutKey(KEYBOARD_EVENT_KEYS.ENTER, MODIFIER_KEYS.CMD)}
          >
            {UI_CONTENT.WIZARD.STEP_STACK.NEXT_BUTTON}
            <kbd
              className={`ml-2 ${CSS_CLASSES.KBD_SHORTCUT}`}
              aria-hidden={ARIA_HIDDEN_VALUES.TRUE}
            >
              {modifierKey}+{DISPLAY_SYMBOLS.ENTER_KEY}
            </kbd>
            <svg
              className={CSS_CLASSES.ICON_HOVER_SHIFT}
              fill={SVG_ICON_DEFAULTS.FILL_NONE}
              stroke={SVG_ICON_DEFAULTS.STROKE_CURRENT}
              viewBox={SVG_ICON_DEFAULTS.VIEW_BOX}
            >
              <path
                strokeLinecap={SVG_ICON_DEFAULTS.STROKE_LINECAP_ROUND}
                strokeLinejoin={SVG_ICON_DEFAULTS.STROKE_LINEJOIN_ROUND}
                strokeWidth={SVG_ICON_DEFAULTS.STROKE_WIDTH_DEFAULT}
                d={ICON_PATHS.CHEVRON_RIGHT}
              />
            </svg>
          </RippleButton>
        </KeyboardShortcutTooltip>
      </div>

      {/* Screen reader announcement when minimum tech stack requirement is met
          — provides explicit feedback since the milestone pulse is purely visual. */}
      <div
        className={FOCUS_ANNOUNCER.LIVE_REGION_CLASS}
        role={ARIA_ROLES.STATUS}
        aria-live={ARIA_LIVE_VALUES.ASSERTIVE}
        aria-atomic={ARIA_ATOMIC_VALUES.TRUE}
      >
        {milestoneAnnouncement}
      </div>
    </motion.div>
  );
});
