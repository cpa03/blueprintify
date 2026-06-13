/**
 * Step 3: Feature Selection
 *
 * Third step in the 5-step wizard for selecting project features.
 * Allows users to choose from suggested features or add custom ones.
 *
 * Features:
 * - Pre-defined feature suggestions (auth, API, testing, etc.)
 * - Custom feature input with add button
 * - Visual feedback when features are added
 * - Clear all functionality
 * - Feature count display
 *
 * @module components/wizard/StepFeatures
 * @see {@link SUGGESTED_FEATURES} - Available feature suggestions
 * @see {@link useWizardStore} - Wizard state management
 *
 * @example
 * ```tsx
 * <StepFeatures />
 * ```
 */

import { useState, useCallback, useMemo, memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useWizardStore } from "../../store";
import {
  SUGGESTED_FEATURES,
  FORM_LIMITS,
  TIMEOUTS,
  SPRING_CONFIG,
  UI_CONTENT,
  ANIMATION,
} from "../../config/constants";
import { TRANSFORMS } from "../../config/theme";
import { pageTransition, transitions, type AnimationDirection } from "../../utils/motion";
import { RippleButton } from "../RippleButton";
import { KeyboardShortcutTooltip } from "../SmartTooltip";
import { getModifierLabel, getAltKeyLabel } from "../../lib/platform";
import { ACCESSIBILITY_LABELS } from "../../config/constants/content";

interface StepFeaturesProps {
  direction?: AnimationDirection;
}

export const StepFeatures = memo(function StepFeatures({
  direction = "forward",
}: StepFeaturesProps): JSX.Element {
  const [newFeature, setNewFeature] = useState("");
  const [justAdded, setJustAdded] = useState<string | null>(null);
  const features = useWizardStore((s) => s.features);
  const addFeature = useWizardStore((s) => s.addFeature);
  const removeFeature = useWizardStore((s) => s.removeFeature);
  const clearFeatures = useWizardStore((s) => s.clearFeatures);
  const nextStep = useWizardStore((s) => s.nextStep);
  const prevStep = useWizardStore((s) => s.prevStep);
  const modifierKey = getModifierLabel();

  const handleAddFeature = useCallback(() => {
    if (newFeature.trim()) {
      const trimmed = newFeature.trim();
      addFeature(trimmed);
      setNewFeature("");
      // Show visual feedback
      setJustAdded(trimmed);
      setTimeout(() => setJustAdded(null), TIMEOUTS.TOAST_NOTIFICATION);
    }
  }, [newFeature, addFeature]);

  const handleSuggestionAdd = useCallback(
    (feature: string) => {
      addFeature(feature);
      setJustAdded(feature);
      setTimeout(() => setJustAdded(null), TIMEOUTS.TOAST_NOTIFICATION);
    },
    [addFeature]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter") {
        e.preventDefault();
        handleAddFeature();
      }
    },
    [handleAddFeature]
  );

  const isInFeatures = useCallback(
    (feature: string) => features.some((f: string) => f.toLowerCase() === feature.toLowerCase()),
    [features]
  );

  const suggestedNotAdded = useMemo(
    () => SUGGESTED_FEATURES.filter((f: string) => !isInFeatures(f)),
    [isInFeatures]
  );

  return (
    <motion.div {...pageTransition(direction)} className="space-y-6">
      <div>
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-2xl font-bold text-white">{UI_CONTENT.WIZARD.STEP_FEATURES.TITLE}</h2>
          <div className="flex items-center gap-2 text-sm">
            <span
              className={`tabular-nums ${features.length === 0 ? "text-accent-pink" : "text-dark-400"}`}
            >
              {features.length}
            </span>
            <span className="text-dark-500">
              {UI_CONTENT.WIZARD.STEP_FEATURES.FEATURES_COUNT(features.length)}
            </span>
          </div>
        </div>
        <p className="text-dark-400">{UI_CONTENT.WIZARD.STEP_FEATURES.SUBTITLE}</p>
      </div>

      <div className="glass-card p-6 space-y-5">
        {/* Add custom feature */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label htmlFor="feature-input" className="label mb-0">
              {UI_CONTENT.WIZARD.STEP_FEATURES.ADD_FEATURE_LABEL}
            </label>
            <div className="flex items-center gap-3">
              <span
                className={`text-xs ${newFeature.length > FORM_LIMITS.FEATURE.MAX ? "text-accent-pink" : "text-dark-500"}`}
              >
                {newFeature.length}/{FORM_LIMITS.FEATURE.MAX}
              </span>
              <span className="text-xs text-dark-500 flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 bg-dark-700 rounded text-dark-400 font-mono text-xs">
                  Enter
                </kbd>
                to add
              </span>
            </div>
          </div>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <input
                id="feature-input"
                type="text"
                value={newFeature}
                onChange={(e) => setNewFeature(e.target.value.slice(0, FORM_LIMITS.FEATURE.MAX))}
                onKeyDown={handleKeyDown}
                placeholder={UI_CONTENT.WIZARD.STEP_FEATURES.ADD_FEATURE_PLACEHOLDER}
                className={`input-field w-full pr-10 ${newFeature.length >= FORM_LIMITS.FEATURE.MAX ? "border-accent-pink focus:border-accent-pink focus:ring-accent-pink/20" : ""}`}
                aria-label={ACCESSIBILITY_LABELS.WIZARD_FEATURES.NEW_FEATURE_NAME}
                maxLength={FORM_LIMITS.FEATURE.MAX}
              />
              <AnimatePresence>
                {newFeature && (
                  <motion.button
                    type="button"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={transitions.fast}
                    onClick={() => setNewFeature("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-dark-500 hover:text-dark-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/50 transition-colors p-1 rounded-md hover:bg-dark-700/50"
                    aria-label={ACCESSIBILITY_LABELS.WIZARD_FEATURES.CLEAR_FEATURE_INPUT}
                    title={ACCESSIBILITY_LABELS.WIZARD_FEATURES.CLEAR_FEATURE_INPUT}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </motion.button>
                )}
              </AnimatePresence>
            </div>
            <button
              onClick={handleAddFeature}
              disabled={!newFeature.trim()}
              className="btn-primary px-4"
              aria-label={ACCESSIBILITY_LABELS.WIZARD_FEATURES.ADD_FEATURE}
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
                  d="M12 4v16m8-8H4"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Added features */}
        {features.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="label mb-0" id="added-features-label">
                {UI_CONTENT.WIZARD.STEP_FEATURES.YOUR_FEATURES_LABEL} ({features.length})
              </label>
              <button
                onClick={clearFeatures}
                className="text-xs text-accent-pink hover:text-accent-pink/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-pink/50 rounded px-1 transition-colors flex items-center gap-1"
                aria-label={ACCESSIBILITY_LABELS.WIZARD_FEATURES.CLEAR_ALL_FEATURES}
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
                {UI_CONTENT.BUTTONS.CLEAR_ALL}
              </button>
            </div>
            <div
              className="flex flex-wrap gap-2"
              role="list"
              aria-labelledby="added-features-label"
            >
              <AnimatePresence mode="popLayout">
                {features.map((feature) => {
                  const isJustAdded = feature === justAdded;
                  return (
                    <motion.span
                      key={feature}
                      layout
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{
                        opacity: 1,
                        scale: isJustAdded ? [1, 1.08, 1] : 1,
                        transition: isJustAdded
                          ? { duration: ANIMATION.MEDIUM_SLOW, ease: "easeOut" }
                          : { type: "spring", ...SPRING_CONFIG.DEFAULT },
                      }}
                      exit={{
                        opacity: 0,
                        scale: 0.8,
                        transition: { duration: ANIMATION.NORMAL, ease: "easeOut" },
                      }}
                      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-colors duration-300 ${
                        isJustAdded
                          ? "bg-accent-emerald/20 border border-accent-emerald/50 text-accent-emerald"
                          : "bg-primary-500/20 border border-primary-500/30 text-primary-300"
                      }`}
                      role="listitem"
                    >
                      <span className="text-accent-emerald" aria-hidden="true">
                        ✓
                      </span>
                      {feature}
                      <button
                        onClick={() => removeFeature(feature)}
                        className="hover:text-accent-pink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-pink/50 rounded transition-colors"
                        aria-label={`Remove ${feature}`}
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
                    </motion.span>
                  );
                })}
              </AnimatePresence>
            </div>
          </div>
        )}

        {/* Suggestions */}
        {suggestedNotAdded.length > 0 && (
          <div>
            <label className="label" id="suggestions-label">
              {UI_CONTENT.WIZARD.STEP_FEATURES.QUICK_ADD_LABEL}
            </label>
            <div className="flex flex-wrap gap-2" role="group" aria-labelledby="suggestions-label">
              {suggestedNotAdded.map((feature) => {
                const isJustAdded = justAdded === feature;
                return (
                  <motion.button
                    key={feature}
                    onClick={() => handleSuggestionAdd(feature)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        handleSuggestionAdd(feature);
                      }
                    }}
                    layout
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    transition={{ type: "spring", ...SPRING_CONFIG.SUBTLE_BOUNCE }}
                    className="tech-chip relative overflow-hidden hover:border-accent-emerald/50"
                    aria-label={`Add suggestion: ${feature}`}
                    animate={
                      isJustAdded
                        ? {
                            scale: [1, 1.12, 1],
                            transition: { duration: ANIMATION.SEMI_SLOW, ease: "easeOut" },
                          }
                        : {}
                    }
                  >
                    <AnimatePresence>
                      {isJustAdded && (
                        <motion.div
                          initial={{ scale: 0, opacity: 0.8 }}
                          animate={{ scale: 2.5, opacity: 0 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: ANIMATION.SLOW, ease: "easeOut" }}
                          className="absolute inset-0 rounded-full bg-accent-emerald/30 pointer-events-none"
                          style={{ transformOrigin: TRANSFORMS.ORIGIN_CENTER }}
                        />
                      )}
                    </AnimatePresence>
                    <AnimatePresence>
                      {isJustAdded && (
                        <motion.div
                          initial={{ scale: 0.8, opacity: 1 }}
                          animate={{ scale: 1.5, opacity: 0 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: ANIMATION.MEDIUM_SLOW, ease: "easeOut" }}
                          className="absolute inset-0 rounded-full border-2 border-accent-emerald pointer-events-none"
                        />
                      )}
                    </AnimatePresence>
                    <span className="relative z-10 flex items-center gap-1.5">
                      <AnimatePresence mode="wait">
                        {isJustAdded ? (
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
                              transition={{ duration: ANIMATION.CHECKMARK_REVEAL, delay: 0.1 }}
                            />
                          </motion.svg>
                        ) : (
                          <motion.svg
                            key="plus"
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            aria-hidden="true"
                            initial={{ scale: 0, rotate: 180 }}
                            animate={{ scale: 1, rotate: 0 }}
                            exit={{ scale: 0, rotate: -180 }}
                            transition={{ type: "spring", ...SPRING_CONFIG.CHECKMARK }}
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 4v16m8-8H4"
                            />
                          </motion.svg>
                        )}
                      </AnimatePresence>
                      <span>{feature}</span>
                    </span>
                  </motion.button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Success toast notification */}
      <AnimatePresence>
        {justAdded && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.9 }}
            className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50"
          >
            <div className="bg-accent-emerald/90 backdrop-blur-sm text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
              <span className="text-sm">
                {UI_CONTENT.WIZARD.STEP_FEATURES.ADDED_MESSAGE(justAdded)}
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex justify-between">
        <KeyboardShortcutTooltip shortcut="←" description="Go back" position="right" modifier="alt">
          <RippleButton onClick={prevStep} className="btn-secondary flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            {UI_CONTENT.BUTTONS.BACK}
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
          description="Continue to next step"
          position="left"
        >
          <RippleButton
            onClick={nextStep}
            className="btn-primary flex items-center gap-2 animate-glow"
          >
            {UI_CONTENT.WIZARD.STEP_FEATURES.NEXT_BUTTON}
            <kbd
              className="ml-2 px-1.5 py-0.5 bg-dark-700/80 rounded text-[11px] font-mono text-dark-200 border border-dark-600/50 shadow-inner leading-none"
              aria-hidden="true"
            >
              {modifierKey}+↵
            </kbd>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </RippleButton>
        </KeyboardShortcutTooltip>
      </div>
    </motion.div>
  );
});
