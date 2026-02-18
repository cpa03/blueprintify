import { motion, AnimatePresence } from "framer-motion";
import { useWizardStore } from "../../store";
import { FormEvent, useEffect, useRef, useState } from "react";
import {
  FORM_LIMITS,
  ANIMATION,
  ANIMATION_MS,
  TIMEOUTS,
  UI_CONTENT,
  VALIDATION_MESSAGES,
} from "../../config/constants";
import { ANIMATION_TIMING } from "../../config/theme";
import { useAutoSaveToast } from "../../hooks/useAutoSaveToast";
import { RippleButton } from "../RippleButton";
import { CharacterCounter } from "../CharacterCounter";
import { pageTransition } from "../../utils/motion";
import { TypeIndicator, useTypingIndicator } from "../TypeIndicator";

export function StepInfo() {
  const projectNameInputRef = useRef<HTMLInputElement>(null);
  const [isShaking, setIsShaking] = useState(false);
  const projectName = useWizardStore((s) => s.projectName);
  const description = useWizardStore((s) => s.description);
  const targetAudience = useWizardStore((s) => s.targetAudience);
  const constraints = useWizardStore((s) => s.constraints);
  const setProjectName = useWizardStore((s) => s.setProjectName);
  const setDescription = useWizardStore((s) => s.setDescription);
  const setTargetAudience = useWizardStore((s) => s.setTargetAudience);
  const setConstraints = useWizardStore((s) => s.setConstraints);
  const nextStep = useWizardStore((s) => s.nextStep);

  useAutoSaveToast(
    [projectName, description, targetAudience, constraints],
    "Project info saved",
    TIMEOUTS.COPY_FEEDBACK,
  );

  const projectNameTyping = useTypingIndicator({
    delay: ANIMATION_MS.TYPING_INDICATOR_DELAY,
    minInputLength: 1,
  });
  const descriptionTyping = useTypingIndicator({
    delay: ANIMATION_MS.TYPING_INDICATOR_DELAY,
    minInputLength: 1,
  });
  const targetAudienceTyping = useTypingIndicator({
    delay: ANIMATION_MS.TYPING_INDICATOR_DELAY,
    minInputLength: 1,
  });
  const constraintsTyping = useTypingIndicator({
    delay: ANIMATION_MS.TYPING_INDICATOR_DELAY,
    minInputLength: 1,
  });

  const canProceed =
    projectName.length >= FORM_LIMITS.PROJECT_NAME.MIN &&
    description.length >= FORM_LIMITS.DESCRIPTION.MIN;
  const isDescriptionInvalid =
    description.length > 0 && description.length < FORM_LIMITS.DESCRIPTION.MIN;

  const getFormProgress = () => {
    const requiredFields = [
      projectName.length >= FORM_LIMITS.PROJECT_NAME.MIN,
      description.length >= FORM_LIMITS.DESCRIPTION.MIN,
    ];
    const optionalFields = [targetAudience.length > 0, constraints.length > 0];

    const completedRequired = requiredFields.filter(Boolean).length;
    const completedOptional = optionalFields.filter(Boolean).length;
    const totalFields = requiredFields.length + completedOptional;
    const completedFields = completedRequired + completedOptional;

    return {
      completed: completedFields,
      total: totalFields,
      percentage: (completedFields / totalFields) * 100,
    };
  };

  const formProgress = getFormProgress();

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (canProceed) {
      nextStep();
    } else {
      // Trigger shake animation for visual feedback
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), TIMEOUTS.SHAKE_ANIMATION);
    }
  };

  useEffect(() => {
    projectNameInputRef.current?.focus();
  }, []);

  return (
    <motion.div {...pageTransition} className="space-y-6">
      <div>
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-2xl font-bold text-white">
            {UI_CONTENT.WIZARD.STEP_INFO.TITLE}
          </h2>
          <div className="flex items-center gap-2 text-sm">
            <div className="w-24 h-2 bg-dark-700 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-primary-500 to-accent-emerald"
                initial={{ width: 0 }}
                animate={{ width: `${formProgress.percentage}%` }}
                transition={{ duration: ANIMATION.NORMAL, ease: "easeOut" }}
              />
            </div>
            <span
              className="text-dark-400 tabular-nums"
              aria-live="polite"
              aria-label={`${formProgress.completed} of ${formProgress.total} fields completed`}
            >
              {formProgress.completed}/{formProgress.total}
            </span>
          </div>
        </div>
        <p className="text-dark-400">{UI_CONTENT.WIZARD.STEP_INFO.SUBTITLE}</p>
      </div>

      <form onSubmit={handleSubmit} className="glass-card p-6 space-y-5">
        {/* Project Name */}
        <div>
          <div className="flex justify-between items-center">
            <label
              htmlFor="projectName"
              className="label flex items-center gap-2"
            >
              {UI_CONTENT.WIZARD.STEP_INFO.PROJECT_NAME_LABEL}{" "}
              <span className="text-accent-pink" aria-hidden="true">
                *
              </span>
              <AnimatePresence>
                {projectName.length >= FORM_LIMITS.PROJECT_NAME.MIN && (
                  <motion.span
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    transition={{
                      type: "spring",
                      ...ANIMATION_TIMING.easing.spring,
                    }}
                    className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-accent-emerald/20 text-accent-emerald"
                    aria-label="Project name is valid"
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
                        strokeWidth={3}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </motion.span>
                )}
              </AnimatePresence>
              <TypeIndicator isTyping={projectNameTyping.isTyping} />
            </label>
            <CharacterCounter
              current={projectName.length}
              max={FORM_LIMITS.PROJECT_NAME.MAX}
              min={FORM_LIMITS.PROJECT_NAME.MIN}
              warningThreshold={FORM_LIMITS.PROJECT_NAME.WARNING_THRESHOLD}
            />
          </div>
          <div className="relative">
            <motion.input
              ref={projectNameInputRef}
              id="projectName"
              name="projectName"
              type="text"
              value={projectName}
              onChange={(e) => {
                projectNameTyping.handleTyping(e.target.value);
                setProjectName(e.target.value);
              }}
              onBlur={projectNameTyping.handleBlur}
              placeholder={UI_CONTENT.WIZARD.STEP_INFO.PROJECT_NAME_PLACEHOLDER}
              className={`input-field transition-all duration-200 ${
                projectName.length >= FORM_LIMITS.PROJECT_NAME.MIN
                  ? "border-accent-emerald/50 focus:border-accent-emerald focus:ring-accent-emerald/20"
                  : projectName.length >= FORM_LIMITS.PROJECT_NAME.MAX
                    ? "border-accent-pink focus:border-accent-pink focus:ring-accent-pink/20"
                    : projectName.length >
                        FORM_LIMITS.PROJECT_NAME.WARNING_THRESHOLD
                      ? "border-yellow-500 focus:border-yellow-500 focus:ring-yellow-500/20"
                      : ""
              }`}
              maxLength={FORM_LIMITS.PROJECT_NAME.MAX}
              required
              aria-required="true"
              animate={
                projectNameTyping.isTyping ? { scale: 1.002 } : { scale: 1 }
              }
              transition={{ duration: ANIMATION.FAST }}
              {...(projectName.length >
                FORM_LIMITS.PROJECT_NAME.WARNING_THRESHOLD &&
              projectName.length < FORM_LIMITS.PROJECT_NAME.MAX
                ? { "aria-describedby": "projectName-warning" }
                : {})}
            />
            <AnimatePresence>
              {projectName.length >= FORM_LIMITS.PROJECT_NAME.MIN && (
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  transition={{ type: "spring", stiffness: 500, damping: 25 }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none"
                >
                  <div className="w-6 h-6 rounded-full bg-accent-emerald/20 flex items-center justify-center">
                    <svg
                      className="w-4 h-4 text-accent-emerald"
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
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          {projectName.length > FORM_LIMITS.PROJECT_NAME.WARNING_THRESHOLD &&
            projectName.length < FORM_LIMITS.PROJECT_NAME.MAX && (
              <p
                id="projectName-warning"
                role="status"
                className="text-xs text-accent-pink mt-1"
              >
                {VALIDATION_MESSAGES.APPROACHING_CHARACTER_LIMIT}
              </p>
            )}
        </div>

        {/* Description */}
        <div>
          <div className="flex justify-between items-center">
            <label
              htmlFor="description"
              className="label flex items-center gap-2"
            >
              {UI_CONTENT.WIZARD.STEP_INFO.DESCRIPTION_LABEL}{" "}
              <span className="text-accent-pink" aria-hidden="true">
                *
              </span>
              <AnimatePresence>
                {description.length >= FORM_LIMITS.DESCRIPTION.MIN && (
                  <motion.span
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    transition={{
                      type: "spring",
                      ...ANIMATION_TIMING.easing.spring,
                    }}
                    className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-accent-emerald/20 text-accent-emerald"
                    aria-label="Description is valid"
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
                        strokeWidth={3}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </motion.span>
                )}
              </AnimatePresence>
              <TypeIndicator isTyping={descriptionTyping.isTyping} />
            </label>
            <CharacterCounter
              current={description.length}
              max={FORM_LIMITS.DESCRIPTION.MAX}
              min={FORM_LIMITS.DESCRIPTION.MIN}
            />
          </div>
          <div className="relative">
            <motion.textarea
              id="description"
              name="description"
              value={description}
              onChange={(e) => {
                descriptionTyping.handleTyping(e.target.value);
                setDescription(e.target.value);
              }}
              onBlur={descriptionTyping.handleBlur}
              placeholder={UI_CONTENT.WIZARD.STEP_INFO.DESCRIPTION_PLACEHOLDER}
              className={`textarea-field h-32 transition-all duration-200 ${
                description.length >= FORM_LIMITS.DESCRIPTION.MIN
                  ? "border-accent-emerald/50 focus:border-accent-emerald focus:ring-accent-emerald/20 pr-12"
                  : isDescriptionInvalid
                    ? "border-accent-pink focus:border-accent-pink focus:ring-accent-pink/20"
                    : description.length > 0
                      ? "border-yellow-500/50 focus:border-yellow-500 focus:ring-yellow-500/20"
                      : ""
              }`}
              maxLength={FORM_LIMITS.DESCRIPTION.MAX}
              required
              aria-required="true"
              aria-invalid={isDescriptionInvalid}
              animate={
                descriptionTyping.isTyping ? { scale: 1.002 } : { scale: 1 }
              }
              transition={{ duration: ANIMATION.FAST }}
              {...(isDescriptionInvalid
                ? { "aria-describedby": "description-error" }
                : description.length > 0 &&
                    description.length < FORM_LIMITS.DESCRIPTION.MIN
                  ? { "aria-describedby": "description-hint" }
                  : {})}
            />
            <AnimatePresence>
              {description.length >= FORM_LIMITS.DESCRIPTION.MIN && (
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  transition={{ type: "spring", stiffness: 500, damping: 25 }}
                  className="absolute right-3 top-3 pointer-events-none"
                >
                  <div className="w-6 h-6 rounded-full bg-accent-emerald/20 flex items-center justify-center">
                    <svg
                      className="w-4 h-4 text-accent-emerald"
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
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          {!isDescriptionInvalid &&
            description.length > 0 &&
            description.length < FORM_LIMITS.DESCRIPTION.MIN && (
              <p id="description-hint" className="text-xs text-yellow-500 mt-1">
                {VALIDATION_MESSAGES.CHARACTERS_NEEDED(
                  FORM_LIMITS.DESCRIPTION.MIN - description.length,
                )}
              </p>
            )}
          {isDescriptionInvalid && (
            <p
              id="description-error"
              role="alert"
              className="text-xs text-accent-pink mt-1"
            >
              {VALIDATION_MESSAGES.DESCRIPTION_MIN_LENGTH(
                FORM_LIMITS.DESCRIPTION.MIN,
              )}
            </p>
          )}
        </div>

        {/* Target Audience (Optional) */}
        <div>
          <label
            htmlFor="targetAudience"
            className="label flex items-center gap-2"
          >
            {UI_CONTENT.WIZARD.STEP_INFO.TARGET_AUDIENCE_LABEL}{" "}
            <span className="text-dark-500">(optional)</span>
            <TypeIndicator isTyping={targetAudienceTyping.isTyping} />
          </label>
          <div className="relative">
            <motion.input
              id="targetAudience"
              name="targetAudience"
              type="text"
              value={targetAudience}
              onChange={(e) => {
                targetAudienceTyping.handleTyping(e.target.value);
                setTargetAudience(e.target.value);
              }}
              onBlur={targetAudienceTyping.handleBlur}
              placeholder={
                UI_CONTENT.WIZARD.STEP_INFO.TARGET_AUDIENCE_PLACEHOLDER
              }
              className="input-field pr-10"
              animate={
                targetAudienceTyping.isTyping ? { scale: 1.002 } : { scale: 1 }
              }
              transition={{ duration: ANIMATION.FAST }}
            />
            <AnimatePresence>
              {targetAudience && (
                <motion.button
                  type="button"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: ANIMATION.FAST }}
                  onClick={() => setTargetAudience("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-dark-500 hover:text-dark-300 focus:outline-none focus:text-white transition-colors p-1 rounded-md hover:bg-dark-700/50"
                  aria-label="Clear target audience"
                  title="Clear target audience"
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
        </div>

        {/* Constraints (Optional) */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label
              htmlFor="constraints"
              className="label mb-0 flex items-center gap-2"
            >
              {UI_CONTENT.WIZARD.STEP_INFO.CONSTRAINTS_LABEL}{" "}
              <span className="text-dark-500">(optional)</span>
              <TypeIndicator isTyping={constraintsTyping.isTyping} />
            </label>
            <AnimatePresence>
              {constraints && (
                <motion.button
                  type="button"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: ANIMATION.FAST }}
                  onClick={() => setConstraints("")}
                  className="text-xs text-dark-500 hover:text-dark-300 focus:outline-none focus:text-white transition-colors flex items-center gap-1 px-2 py-1 rounded-md hover:bg-dark-700/50"
                  aria-label="Clear constraints"
                  title="Clear constraints"
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
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                  Clear
                </motion.button>
              )}
            </AnimatePresence>
          </div>
          <motion.textarea
            id="constraints"
            name="constraints"
            value={constraints}
            onChange={(e) => {
              constraintsTyping.handleTyping(e.target.value);
              setConstraints(e.target.value);
            }}
            onBlur={constraintsTyping.handleBlur}
            placeholder={UI_CONTENT.WIZARD.STEP_INFO.CONSTRAINTS_PLACEHOLDER}
            className="textarea-field h-24"
            animate={
              constraintsTyping.isTyping ? { scale: 1.002 } : { scale: 1 }
            }
            transition={{ duration: 0.15 }}
          />
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end pt-4">
          <RippleButton
            type="submit"
            disabled={!canProceed}
            className={`btn-primary flex items-center gap-2 ${isShaking ? "shake-animation" : ""}`}
          >
            {UI_CONTENT.WIZARD.STEP_INFO.NEXT_BUTTON}
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
                d="M9 5l7 7-7 7"
              />
            </svg>
          </RippleButton>
        </div>
      </form>
    </motion.div>
  );
}
