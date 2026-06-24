/**
 * Step 1: Project Information
 *
 * First step in the 5-step wizard for configuring project details.
 * Collects basic project metadata including name, description,
 * target audience, and any technical constraints.
 *
 * Features:
 * - Project name input with validation (required, max length)
 * - Description textarea with auto-resize and character counter
 * - Target audience selection (developer, manager, mixed)
 * - Technical constraints text field
 * - Typing indicators for better UX
 * - Shake animation on validation error
 * - Auto-save functionality
 *
 * @module components/wizard/StepInfo
 * @see {@link useWizardStore} - Wizard state management
 * @see {@link FORM_LIMITS} - Input validation limits
 *
 * @example
 * ```tsx
 * <StepInfo />
 * ```
 */

import { ANIMATION_DIRECTIONS, SHORTCUT_DESCRIPTIONS } from "@blueprint/shared";
import { motion, AnimatePresence } from "framer-motion";
import { useWizardStore } from "../../store";
import { FormEvent, useEffect, useRef, useState, memo, useMemo } from "react";
import {
  FORM_LIMITS,
  ANIMATION,
  ANIMATION_MS,
  TIMEOUTS,
  UI_CONTENT,
  VALIDATION_MESSAGES,
  TEXTAREA_CONFIG,
} from "../../config/constants";
import { ACCESSIBILITY_LABELS } from "../../config/constants/content";
import { useAutoSaveToast } from "../../hooks/useAutoSaveToast";
import { useAutoResizeTextarea } from "../../hooks/useAutoResizeTextarea";
import { RippleButton } from "../RippleButton";
import { CharacterCounter } from "../CharacterCounter";
import { KeyboardShortcutTooltip } from "../SmartTooltip";
import { pageTransition, transitions, type AnimationDirection } from "../../utils/motion";
import { TypeIndicator, useTypingIndicator } from "../TypeIndicator";
import { ValidationCheckmark } from "../ValidationCheckmark";
import { getModifierLabel, getAriaShortcutKey } from "../../lib/platform";

interface StepInfoProps {
  direction?: AnimationDirection;
}

export const StepInfo = memo(function StepInfo({
  direction = ANIMATION_DIRECTIONS.FORWARD,
}: StepInfoProps): JSX.Element {
  const projectNameInputRef = useRef<HTMLInputElement>(null);
  const [isShaking, setIsShaking] = useState(false);
  const [invalidField, setInvalidField] = useState<string | null>(null);
  const { textareaRef: descriptionRef } = useAutoResizeTextarea({
    minHeight: TEXTAREA_CONFIG.STEP_INFO_MIN_HEIGHT_PX,
    maxHeight: TEXTAREA_CONFIG.STEP_INFO_MAX_HEIGHT_PX,
  });
  const { textareaRef: constraintsRef } = useAutoResizeTextarea({
    minHeight: TEXTAREA_CONFIG.DEFAULT_MIN_HEIGHT_PX,
    maxHeight: TEXTAREA_CONFIG.STEP_INFO_MAX_HEIGHT_PX,
  });
  const projectName = useWizardStore((s) => s.projectName);
  const description = useWizardStore((s) => s.description);
  const targetAudience = useWizardStore((s) => s.targetAudience);
  const constraints = useWizardStore((s) => s.constraints);
  const setProjectName = useWizardStore((s) => s.setProjectName);
  const setDescription = useWizardStore((s) => s.setDescription);
  const setTargetAudience = useWizardStore((s) => s.setTargetAudience);
  const setConstraints = useWizardStore((s) => s.setConstraints);
  const nextStep = useWizardStore((s) => s.nextStep);

  const modifierKey = getModifierLabel();

  useAutoSaveToast(
    [projectName, description, targetAudience, constraints],
    "Project info saved",
    TIMEOUTS.COPY_FEEDBACK
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
  const isProjectNameInvalid =
    projectName.length > 0 && projectName.length < FORM_LIMITS.PROJECT_NAME.MIN;
  const isDescriptionInvalid =
    description.length > 0 && description.length < FORM_LIMITS.DESCRIPTION.MIN;

  const formProgress = useMemo(() => {
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
  }, [projectName.length, description.length, targetAudience.length, constraints.length]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (canProceed) {
      nextStep();
    } else {
      let fieldId: string | null = null;
      if (projectName.length < FORM_LIMITS.PROJECT_NAME.MIN) {
        projectNameInputRef.current?.focus();
        fieldId = "projectName";
      } else if (description.length < FORM_LIMITS.DESCRIPTION.MIN) {
        descriptionRef.current?.focus();
        fieldId = "description";
      }
      if (fieldId) {
        setInvalidField(fieldId);
        setTimeout(() => setInvalidField(null), TIMEOUTS.SHAKE_ANIMATION);
      }
      // Trigger shake animation for visual feedback
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), TIMEOUTS.SHAKE_ANIMATION);
    }
  };

  useEffect(() => {
    projectNameInputRef.current?.focus({ preventScroll: true });
  }, []);

  return (
    <motion.div {...pageTransition(direction)} className="space-y-6">
      <div>
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-2xl font-bold text-white">{UI_CONTENT.WIZARD.STEP_INFO.TITLE}</h2>
          <div className="flex items-center gap-2 text-sm">
            <div className="w-24 h-2 bg-dark-700 rounded-full overflow-hidden relative">
              <motion.div
                className={`h-full bg-gradient-to-r from-primary-500 to-accent-emerald ${canProceed ? "progress-shimmer relative" : ""}`}
                initial={{ width: 0 }}
                animate={{ width: `${formProgress.percentage}%` }}
                transition={{ duration: ANIMATION.NORMAL, ease: "easeOut" }}
              />
            </div>
            <span
              className="text-dark-400 tabular-nums flex items-center gap-0.5"
              aria-live="polite"
              aria-label={ACCESSIBILITY_LABELS.WIZARD_INFO.FIELDS_COMPLETED(
                formProgress.completed,
                formProgress.total
              )}
            >
              <motion.span
                key={formProgress.completed}
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", stiffness: 500, damping: 15, mass: 0.5 }}
                className="tabular-nums"
              >
                {formProgress.completed}
              </motion.span>
              <span className="text-dark-600">/{formProgress.total}</span>
            </span>
          </div>
        </div>
        <p className="text-dark-400">{UI_CONTENT.WIZARD.STEP_INFO.SUBTITLE}</p>
      </div>

      <form onSubmit={handleSubmit} className="glass-card p-6 space-y-5">
        {/* Project Name */}
        <div>
          <div className="flex justify-between items-center">
            <label htmlFor="projectName" className="label flex items-center gap-2">
              {UI_CONTENT.WIZARD.STEP_INFO.PROJECT_NAME_LABEL}{" "}
              <span className="text-accent-pink" aria-hidden="true">
                *
              </span>
              <ValidationCheckmark
                isValid={projectName.length >= FORM_LIMITS.PROJECT_NAME.MIN}
                showInvalid
                ariaLabel="Project name is valid"
                invalidAriaLabel="Project name needs at least 3 characters"
              />
              <TypeIndicator isTyping={projectNameTyping.isTyping} />
            </label>
            <CharacterCounter
              current={projectName.length}
              max={FORM_LIMITS.PROJECT_NAME.MAX}
              min={FORM_LIMITS.PROJECT_NAME.MIN}
              warningThreshold={FORM_LIMITS.PROJECT_NAME.WARNING_THRESHOLD}
            />
          </div>
          <div
            className={`relative ${invalidField === "projectName" ? "invalid-field-flash rounded-xl" : ""}`}
          >
            <motion.input
              ref={projectNameInputRef}
              id="projectName"
              name="projectName"
              type="text"
              autoComplete="off"
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
                    : projectName.length > FORM_LIMITS.PROJECT_NAME.WARNING_THRESHOLD
                      ? "border-yellow-500 focus:border-yellow-500 focus:ring-yellow-500/20"
                      : ""
              }`}
              maxLength={FORM_LIMITS.PROJECT_NAME.MAX}
              required
              aria-required="true"
              aria-invalid={isProjectNameInvalid || undefined}
              animate={projectNameTyping.isTyping ? { scale: 1.002 } : { scale: 1 }}
              transition={{ duration: ANIMATION.FAST }}
              {...(projectName.length > FORM_LIMITS.PROJECT_NAME.WARNING_THRESHOLD &&
              projectName.length < FORM_LIMITS.PROJECT_NAME.MAX
                ? { "aria-describedby": "projectName-warning" }
                : {})}
            />
            {projectName.length >= FORM_LIMITS.PROJECT_NAME.MIN && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                <ValidationCheckmark
                  isValid={true}
                  size="input"
                  ariaLabel="Project name is valid"
                />
              </div>
            )}
          </div>
          <AnimatePresence>
            {projectName.length > FORM_LIMITS.PROJECT_NAME.WARNING_THRESHOLD &&
              projectName.length < FORM_LIMITS.PROJECT_NAME.MAX && (
                <motion.p
                  id="projectName-warning"
                  role="status"
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: ANIMATION.NORMAL, ease: "easeOut" }}
                  className="text-xs text-accent-pink mt-1"
                >
                  {VALIDATION_MESSAGES.APPROACHING_CHARACTER_LIMIT}
                </motion.p>
              )}
          </AnimatePresence>
        </div>

        {/* Description */}
        <div>
          <div className="flex justify-between items-center">
            <label htmlFor="description" className="label flex items-center gap-2">
              {UI_CONTENT.WIZARD.STEP_INFO.DESCRIPTION_LABEL}{" "}
              <span className="text-accent-pink" aria-hidden="true">
                *
              </span>
              <ValidationCheckmark
                isValid={description.length >= FORM_LIMITS.DESCRIPTION.MIN}
                showInvalid
                ariaLabel="Description is valid"
                invalidAriaLabel="Description needs at least 10 characters"
              />
              <TypeIndicator isTyping={descriptionTyping.isTyping} />
            </label>
            <CharacterCounter
              current={description.length}
              max={FORM_LIMITS.DESCRIPTION.MAX}
              min={FORM_LIMITS.DESCRIPTION.MIN}
            />
          </div>
          <div
            className={`relative ${invalidField === "description" ? "invalid-field-flash rounded-xl" : ""}`}
          >
            <motion.textarea
              ref={descriptionRef}
              id="description"
              name="description"
              autoComplete="off"
              value={description}
              onChange={(e) => {
                descriptionTyping.handleTyping(e.target.value);
                setDescription(e.target.value);
              }}
              onBlur={descriptionTyping.handleBlur}
              placeholder={UI_CONTENT.WIZARD.STEP_INFO.DESCRIPTION_PLACEHOLDER}
              className={`textarea-field transition-all duration-200 ${
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
              animate={descriptionTyping.isTyping ? { scale: 1.002 } : { scale: 1 }}
              transition={{ duration: ANIMATION.FAST }}
              {...(isDescriptionInvalid
                ? { "aria-describedby": "description-error" }
                : description.length > 0 && description.length < FORM_LIMITS.DESCRIPTION.MIN
                  ? { "aria-describedby": "description-hint" }
                  : {})}
            />
            {description.length >= FORM_LIMITS.DESCRIPTION.MIN && (
              <div className="absolute right-3 top-3 pointer-events-none">
                <ValidationCheckmark isValid={true} size="input" ariaLabel="Description is valid" />
              </div>
            )}
          </div>
          <AnimatePresence>
            {!isDescriptionInvalid &&
              description.length > 0 &&
              description.length < FORM_LIMITS.DESCRIPTION.MIN && (
                <motion.p
                  id="description-hint"
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: ANIMATION.NORMAL, ease: "easeOut" }}
                  className="text-xs text-yellow-500 mt-1"
                >
                  {VALIDATION_MESSAGES.CHARACTERS_NEEDED(
                    FORM_LIMITS.DESCRIPTION.MIN - description.length
                  )}
                </motion.p>
              )}
          </AnimatePresence>
          <AnimatePresence>
            {isDescriptionInvalid && (
              <motion.p
                id="description-error"
                role="alert"
                initial={{ opacity: 0, y: -4, x: -3 }}
                animate={{ opacity: 1, y: 0, x: 0 }}
                exit={{ opacity: 0, y: -4, x: -3 }}
                transition={{ duration: ANIMATION.NORMAL, ease: "easeOut" }}
                className="text-xs text-accent-pink mt-1"
              >
                {VALIDATION_MESSAGES.DESCRIPTION_MIN_LENGTH(FORM_LIMITS.DESCRIPTION.MIN)}
              </motion.p>
            )}
          </AnimatePresence>
        </div>

        {/* Target Audience (Optional) */}
        <div>
          <label htmlFor="targetAudience" className="label flex items-center gap-2">
            {UI_CONTENT.WIZARD.STEP_INFO.TARGET_AUDIENCE_LABEL}{" "}
            <span className="text-dark-500">(optional)</span>
            <TypeIndicator isTyping={targetAudienceTyping.isTyping} />
          </label>
          <div className="relative">
            <motion.input
              id="targetAudience"
              name="targetAudience"
              type="text"
              autoComplete="off"
              value={targetAudience}
              onChange={(e) => {
                targetAudienceTyping.handleTyping(e.target.value);
                setTargetAudience(e.target.value);
              }}
              onBlur={targetAudienceTyping.handleBlur}
              placeholder={UI_CONTENT.WIZARD.STEP_INFO.TARGET_AUDIENCE_PLACEHOLDER}
              className="input-field pr-10"
              animate={targetAudienceTyping.isTyping ? { scale: 1.002 } : { scale: 1 }}
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
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-dark-500 hover:text-dark-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/50 transition-colors p-1 rounded-md hover:bg-dark-700/50"
                  aria-label={ACCESSIBILITY_LABELS.WIZARD_INFO.CLEAR_TARGET_AUDIENCE}
                  title={ACCESSIBILITY_LABELS.WIZARD_INFO.CLEAR_TARGET_AUDIENCE}
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
        </div>

        {/* Constraints (Optional) */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label htmlFor="constraints" className="label mb-0 flex items-center gap-2">
              {UI_CONTENT.WIZARD.STEP_INFO.CONSTRAINTS_LABEL}{" "}
              <span className="text-dark-500">(optional)</span>
              <TypeIndicator isTyping={constraintsTyping.isTyping} />
            </label>
            <CharacterCounter
              current={constraints.length}
              max={FORM_LIMITS.CONSTRAINTS.MAX}
              min={0}
            />
            <AnimatePresence>
              {constraints && (
                <motion.button
                  type="button"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: ANIMATION.FAST }}
                  onClick={() => setConstraints("")}
                  className="text-xs text-dark-500 hover:text-dark-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/50 transition-colors flex items-center gap-1 px-2 py-1 rounded-md hover:bg-dark-700/50"
                  aria-label={ACCESSIBILITY_LABELS.WIZARD_INFO.CLEAR_CONSTRAINTS}
                  title={ACCESSIBILITY_LABELS.WIZARD_INFO.CLEAR_CONSTRAINTS}
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
            ref={constraintsRef}
            id="constraints"
            name="constraints"
            autoComplete="off"
            value={constraints}
            onChange={(e) => {
              constraintsTyping.handleTyping(e.target.value);
              setConstraints(e.target.value);
            }}
            onBlur={constraintsTyping.handleBlur}
            placeholder={UI_CONTENT.WIZARD.STEP_INFO.CONSTRAINTS_PLACEHOLDER}
            className="textarea-field"
            animate={constraintsTyping.isTyping ? { scale: 1.002 } : { scale: 1 }}
            transition={transitions.fast}
          />
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end pt-4">
          <KeyboardShortcutTooltip
            shortcut="Enter"
            description={SHORTCUT_DESCRIPTIONS.CONTINUE_NEXT_STEP}
            position="left"
          >
            <RippleButton
              type="submit"
              disabled={!canProceed}
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98, y: 0 }}
              className={`btn-primary flex items-center gap-2 group ${canProceed ? "animate-glow" : ""} ${isShaking ? "shake-animation" : ""}`}
              aria-keyshortcuts={getAriaShortcutKey("Enter", "cmd")}
            >
              {UI_CONTENT.WIZARD.STEP_INFO.NEXT_BUTTON}
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
          </KeyboardShortcutTooltip>
        </div>
      </form>
    </motion.div>
  );
});
