import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useWizardStore } from "../../store";
import {
  SUGGESTED_FEATURES,
  FORM_LIMITS,
  TIMEOUTS,
  UI_CONTENT,
  ANIMATION_DURATIONS,
} from "../../config/constants";

export function StepFeatures() {
  const [newFeature, setNewFeature] = useState("");
  const [justAdded, setJustAdded] = useState<string | null>(null);
  const features = useWizardStore((s) => s.features);
  const addFeature = useWizardStore((s) => s.addFeature);
  const removeFeature = useWizardStore((s) => s.removeFeature);
  const clearFeatures = useWizardStore((s) => s.clearFeatures);
  const nextStep = useWizardStore((s) => s.nextStep);
  const prevStep = useWizardStore((s) => s.prevStep);

  const handleAddFeature = () => {
    if (newFeature.trim()) {
      const trimmed = newFeature.trim();
      addFeature(trimmed);
      setNewFeature("");
      // Show visual feedback
      setJustAdded(trimmed);
      setTimeout(() => setJustAdded(null), TIMEOUTS.TOAST_NOTIFICATION);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddFeature();
    }
  };

  const isInFeatures = (feature: string) =>
    features.some((f: string) => f.toLowerCase() === feature.toLowerCase());

  const suggestedNotAdded = SUGGESTED_FEATURES.filter(
    (f: string) => !isInFeatures(f),
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
            {UI_CONTENT.WIZARD.STEP_FEATURES.TITLE}
          </h2>
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
        <p className="text-dark-400">
          {UI_CONTENT.WIZARD.STEP_FEATURES.SUBTITLE}
        </p>
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
                onChange={(e) =>
                  setNewFeature(
                    e.target.value.slice(0, FORM_LIMITS.FEATURE.MAX),
                  )
                }
                onKeyDown={handleKeyDown}
                placeholder={
                  UI_CONTENT.WIZARD.STEP_FEATURES.ADD_FEATURE_PLACEHOLDER
                }
                className={`input-field w-full pr-10 ${newFeature.length >= FORM_LIMITS.FEATURE.MAX ? "border-accent-pink focus:border-accent-pink focus:ring-accent-pink/20" : ""}`}
                aria-label="New feature name"
                maxLength={FORM_LIMITS.FEATURE.MAX}
              />
              <AnimatePresence>
                {newFeature && (
                  <motion.button
                    type="button"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ duration: ANIMATION_DURATIONS.STEP_FADE }}
                    onClick={() => setNewFeature("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-dark-500 hover:text-dark-300 focus:outline-none focus:text-white transition-colors p-1 rounded-md hover:bg-dark-700/50"
                    aria-label="Clear feature input"
                    title="Clear feature input"
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
                  </motion.button>
                )}
              </AnimatePresence>
            </div>
            <button
              onClick={handleAddFeature}
              disabled={!newFeature.trim()}
              className="btn-primary px-4"
              aria-label="Add feature"
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
                {UI_CONTENT.WIZARD.STEP_FEATURES.YOUR_FEATURES_LABEL} (
                {features.length})
              </label>
              <button
                onClick={clearFeatures}
                className="text-xs text-accent-pink hover:text-accent-pink/80 transition-colors flex items-center gap-1"
                aria-label="Clear all features"
              >
                <svg
                  className="w-3 h-3"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
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
              {features.map((feature) => (
                <motion.span
                  key={feature}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary-500/20 border border-primary-500/30 rounded-lg text-sm text-primary-300"
                  role="listitem"
                >
                  <span className="text-accent-emerald" aria-hidden="true">
                    ✓
                  </span>
                  {feature}
                  <button
                    onClick={() => removeFeature(feature)}
                    className="hover:text-accent-pink transition-colors"
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
              ))}
            </div>
          </div>
        )}

        {/* Suggestions */}
        {suggestedNotAdded.length > 0 && (
          <div>
            <label className="label" id="suggestions-label">
              {UI_CONTENT.WIZARD.STEP_FEATURES.QUICK_ADD_LABEL}
            </label>
            <div
              className="flex flex-wrap gap-2"
              role="group"
              aria-labelledby="suggestions-label"
            >
              {suggestedNotAdded.map((feature) => (
                <button
                  key={feature}
                  onClick={() => addFeature(feature)}
                  className="tech-chip hover:border-accent-emerald/50"
                  aria-label={`Add suggestion: ${feature}`}
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
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                  {feature}
                </button>
              ))}
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
          onClick={nextStep}
          className="btn-primary flex items-center gap-2"
        >
          {UI_CONTENT.WIZARD.STEP_FEATURES.NEXT_BUTTON}
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
