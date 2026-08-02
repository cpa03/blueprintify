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

import {
  ANIMATION_DIRECTIONS,
  SHORTCUT_DESCRIPTIONS,
  UI_MESSAGES,
  FRAMER_TYPE,
  DISPLAY_SYMBOLS,
  KEYBOARD_EVENT_KEYS,
  MODIFIER_KEYS,
  RATIO_LIMITS,
  UI_TIMEOUTS,
} from "@blueprint/shared/config";
import * as motion from "framer-motion/m";
import { AnimatePresence } from "framer-motion";
import { useWizardStore } from "../../store";
import { FormEvent, useCallback, useEffect, useRef, useState, memo, useMemo } from "react";
import {
  FORM_LIMITS,
  ANIMATION,
  EASING,
  ANIMATION_MS,
  TIMEOUTS,
  UI_CONTENT,
  VALIDATION_MESSAGES,
  TEXTAREA_CONFIG,
  SPRING_CONFIG,
  HOVER_SCALE,
  TAP_SCALE,
  SCROLL_BEHAVIOR,
  SCROLL_INTO_VIEW_BLOCK,
  CSS_CLASSES,
  FOCUS_ANNOUNCER,
} from "../../config/constants";
import { STEP_INFO_LABELS } from "../../config/constants/validation";
import { ACCESSIBILITY_LABELS } from "../../config/constants/content";
import { useAutoSaveToast } from "../../hooks/useAutoSaveToast";
import { useAutoResizeTextarea } from "../../hooks/useAutoResizeTextarea";
import { RippleButton } from "../RippleButton";
import { CharacterCounter } from "../CharacterCounter";
import { Icon } from "../Icon";
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
  const targetAudienceInputRef = useRef<HTMLInputElement>(null);
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
  const storeClearForm = useWizardStore((s) => s.clearForm);
  const nextStep = useWizardStore((s) => s.nextStep);
  const [clearAnimation, setClearAnimation] = useState(false);
  const [clearAnnouncement, setClearAnnouncement] = useState("");

  const modifierKey = getModifierLabel();

  useAutoSaveToast(
    [projectName, description, targetAudience, constraints],
    UI_MESSAGES.WIZARD_STEP_AUTOSAVE,
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

  const hasAnyInput =
    projectName.length > 0 ||
    description.length > 0 ||
    targetAudience.length > 0 ||
    constraints.length > 0;

  const canProceed =
    projectName.length >= FORM_LIMITS.PROJECT_NAME.MIN &&
    description.length >= FORM_LIMITS.DESCRIPTION.MIN;
  const isProjectNameInvalid =
    projectName.length > 0 && projectName.length < FORM_LIMITS.PROJECT_NAME.MIN;
  const isDescriptionInvalid =
    description.length > 0 && description.length < FORM_LIMITS.DESCRIPTION.MIN;

  // One-shot pulse on the Next button when form becomes valid; skip initial mount
  const prevCanProceed = useRef<boolean | null>(null);
  const [showReadyPulse, setShowReadyPulse] = useState(false);

  useEffect(() => {
    if (prevCanProceed.current === null) {
      prevCanProceed.current = canProceed;
      return;
    }
    if (canProceed && !prevCanProceed.current) {
      setShowReadyPulse(true);
      const timer = setTimeout(() => setShowReadyPulse(false), UI_TIMEOUTS.READY_PULSE_MS);
      prevCanProceed.current = canProceed;
      return () => clearTimeout(timer);
    }
    prevCanProceed.current = canProceed;
  }, [canProceed]);

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

  const handleClearForm = useCallback(() => {
    // Only animate if there's actually content to clear
    if (hasAnyInput) {
      storeClearForm();
      setClearAnimation(true);
      setClearAnnouncement(ACCESSIBILITY_LABELS.WIZARD_INFO.CLEAR_ALL_ANNOUNCEMENT);
      setTimeout(() => setClearAnimation(false), TIMEOUTS.SHAKE_ANIMATION);
      projectNameInputRef.current?.focus({ preventScroll: true });
    }
  }, [storeClearForm, hasAnyInput]);

  // Clear the announcement after screen readers have had time to announce it,
  // preventing stale text from accumulating in the live region.
  useEffect(() => {
    if (!clearAnnouncement) return;
    const timer = setTimeout(() => setClearAnnouncement(""), TIMEOUTS.LIVE_REGION_CLEAR);
    return () => clearTimeout(timer);
  }, [clearAnnouncement]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (canProceed) {
      nextStep();
    } else {
      let fieldId: string | null = null;
      if (projectName.length < FORM_LIMITS.PROJECT_NAME.MIN) {
        projectNameInputRef.current?.focus({ preventScroll: true });
        projectNameInputRef.current?.scrollIntoView({
          behavior: SCROLL_BEHAVIOR.SMOOTH,
          block: SCROLL_INTO_VIEW_BLOCK.NEAREST,
        });
        fieldId = "projectName";
      } else if (description.length < FORM_LIMITS.DESCRIPTION.MIN) {
        descriptionRef.current?.focus({ preventScroll: true });
        descriptionRef.current?.scrollIntoView({
          behavior: SCROLL_BEHAVIOR.SMOOTH,
          block: SCROLL_INTO_VIEW_BLOCK.NEAREST,
        });
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
            <AnimatePresence>
              {hasAnyInput && (
                <motion.button
                  type="button"
                  onClick={handleClearForm}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: ANIMATION.FAST, ease: EASING.easeOut }}
                  className="text-xs text-dark-500 hover:text-accent-pink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-pink/50 rounded px-2 py-1 transition-colors flex items-center gap-1"
                  aria-label={ACCESSIBILITY_LABELS.WIZARD_INFO.CLEAR_ALL_FIELDS}
                  title={ACCESSIBILITY_LABELS.WIZARD_INFO.CLEAR_ALL_FIELDS}
                >
                  <svg
                    className="w-3.5 h-3.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                  {UI_CONTENT.BUTTONS.CLEAR_ALL}
                </motion.button>
              )}
            </AnimatePresence>
            <div className="w-24 h-2 bg-dark-700 rounded-full overflow-hidden relative">
              <motion.div
                className={`h-full bg-gradient-to-r from-primary-500 to-accent-emerald ${canProceed ? "progress-shimmer relative" : ""}`}
                initial={{ width: 0 }}
                animate={{ width: `${formProgress.percentage}%` }}
                transition={{ type: FRAMER_TYPE.SPRING, ...SPRING_CONFIG.SMOOTH }}
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
                transition={{ type: FRAMER_TYPE.SPRING, ...SPRING_CONFIG.COUNTER_FLIP }}
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

      <form
        onSubmit={handleSubmit}
        className={`glass-card p-6 space-y-5 ${clearAnimation ? "form-ready-pulse" : ""}`}
      >
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
                ariaLabel={STEP_INFO_LABELS.PROJECT_NAME_VALID}
                invalidAriaLabel={STEP_INFO_LABELS.PROJECT_NAME_INVALID}
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
              dir="auto"
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
            {/* Clear button — appears when field has content */}
            <AnimatePresence>
              {projectName.length > 0 && (
                <motion.button
                  type="button"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: ANIMATION.FAST }}
                  onClick={() => {
                    setProjectName("");
                    projectNameInputRef.current?.focus({ preventScroll: true });
                  }}
                  className={`absolute ${
                    projectName.length >= FORM_LIMITS.PROJECT_NAME.MIN ? "right-11" : "right-3"
                  } top-1/2 -translate-y-1/2 text-dark-500 hover:text-dark-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/50 transition-colors p-1 rounded-md hover:bg-dark-700/50 group`}
                  aria-label={ACCESSIBILITY_LABELS.WIZARD_INFO.CLEAR_PROJECT_NAME}
                  title={ACCESSIBILITY_LABELS.WIZARD_INFO.CLEAR_PROJECT_NAME}
                >
                  <Icon
                    name="close"
                    className="w-4 h-4 transition-transform duration-200 motion-safe:group-hover:rotate-90"
                  />
                </motion.button>
              )}
            </AnimatePresence>
            {projectName.length >= FORM_LIMITS.PROJECT_NAME.MIN && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                <ValidationCheckmark
                  isValid={true}
                  size="input"
                  ariaLabel={STEP_INFO_LABELS.PROJECT_NAME_VALID}
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
                  transition={{ duration: ANIMATION.NORMAL, ease: EASING.easeOut }}
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
                ariaLabel={STEP_INFO_LABELS.DESCRIPTION_VALID}
                invalidAriaLabel={STEP_INFO_LABELS.DESCRIPTION_INVALID}
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
              dir="auto"
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
            {/* Clear button — appears when field has content */}
            <AnimatePresence>
              {description.length > 0 && (
                <motion.button
                  type="button"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: ANIMATION.FAST }}
                  onClick={() => {
                    setDescription("");
                    descriptionRef.current?.focus({ preventScroll: true });
                  }}
                  className={`absolute ${
                    description.length >= FORM_LIMITS.DESCRIPTION.MIN ? "right-11" : "right-3"
                  } top-3 text-dark-500 hover:text-dark-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/50 transition-colors p-1 rounded-md hover:bg-dark-700/50 group`}
                  aria-label={ACCESSIBILITY_LABELS.WIZARD_INFO.CLEAR_DESCRIPTION}
                  title={ACCESSIBILITY_LABELS.WIZARD_INFO.CLEAR_DESCRIPTION}
                >
                  <Icon
                    name="close"
                    className="w-4 h-4 transition-transform duration-200 motion-safe:group-hover:rotate-90"
                  />
                </motion.button>
              )}
            </AnimatePresence>
            {description.length >= FORM_LIMITS.DESCRIPTION.MIN && (
              <div className="absolute right-3 top-3 pointer-events-none">
                <ValidationCheckmark
                  isValid={true}
                  size="input"
                  ariaLabel={STEP_INFO_LABELS.DESCRIPTION_VALID}
                />
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
                  transition={{ duration: ANIMATION.NORMAL, ease: EASING.easeOut }}
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
                transition={{ duration: ANIMATION.NORMAL, ease: EASING.easeOut }}
                className="text-xs text-accent-pink mt-1"
              >
                {VALIDATION_MESSAGES.DESCRIPTION_MIN_LENGTH(FORM_LIMITS.DESCRIPTION.MIN)}
              </motion.p>
            )}
          </AnimatePresence>
        </div>

        {/* Target Audience (Optional) */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label htmlFor="targetAudience" className="label mb-0 flex items-center gap-2">
              {UI_CONTENT.WIZARD.STEP_INFO.TARGET_AUDIENCE_LABEL}{" "}
              <span className="text-dark-500">{UI_CONTENT.WIZARD.STEP_INFO.OPTIONAL_LABEL}</span>
              <TypeIndicator isTyping={targetAudienceTyping.isTyping} />
            </label>
            <CharacterCounter
              current={targetAudience.length}
              max={FORM_LIMITS.TARGET_AUDIENCE.MAX}
              warningThreshold={Math.floor(
                FORM_LIMITS.TARGET_AUDIENCE.MAX * RATIO_LIMITS.FORM_WARNING
              )}
            />
          </div>
          <div className="relative">
            <motion.input
              ref={targetAudienceInputRef}
              id="targetAudience"
              name="targetAudience"
              type="text"
              autoComplete="off"
              dir="auto"
              value={targetAudience}
              onChange={(e) => {
                targetAudienceTyping.handleTyping(e.target.value);
                setTargetAudience(e.target.value);
              }}
              onBlur={targetAudienceTyping.handleBlur}
              placeholder={UI_CONTENT.WIZARD.STEP_INFO.TARGET_AUDIENCE_PLACEHOLDER}
              className="input-field pr-10"
              maxLength={FORM_LIMITS.TARGET_AUDIENCE.MAX}
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
                  onClick={() => {
                    setTargetAudience("");
                    targetAudienceInputRef.current?.focus({ preventScroll: true });
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-dark-500 hover:text-dark-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/50 transition-colors p-1 rounded-md hover:bg-dark-700/50 group"
                  aria-label={ACCESSIBILITY_LABELS.WIZARD_INFO.CLEAR_TARGET_AUDIENCE}
                  title={ACCESSIBILITY_LABELS.WIZARD_INFO.CLEAR_TARGET_AUDIENCE}
                >
                  <Icon
                    name="close"
                    className="w-4 h-4 transition-transform duration-200 motion-safe:group-hover:rotate-90"
                  />
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
              <span className="text-dark-500">{UI_CONTENT.WIZARD.STEP_INFO.OPTIONAL_LABEL}</span>
              <TypeIndicator isTyping={constraintsTyping.isTyping} />
            </label>
            <CharacterCounter
              current={constraints.length}
              max={FORM_LIMITS.CONSTRAINTS.MAX}
              min={0}
              warningThreshold={Math.floor(FORM_LIMITS.CONSTRAINTS.MAX * RATIO_LIMITS.FORM_WARNING)}
            />
          </div>
          <div className="relative">
            <motion.textarea
              ref={constraintsRef}
              id="constraints"
              name="constraints"
              autoComplete="off"
              dir="auto"
              value={constraints}
              onChange={(e) => {
                constraintsTyping.handleTyping(e.target.value);
                setConstraints(e.target.value);
              }}
              onBlur={constraintsTyping.handleBlur}
              placeholder={UI_CONTENT.WIZARD.STEP_INFO.CONSTRAINTS_PLACEHOLDER}
              className="textarea-field pr-10"
              maxLength={FORM_LIMITS.CONSTRAINTS.MAX}
              animate={constraintsTyping.isTyping ? { scale: 1.002 } : { scale: 1 }}
              transition={transitions.fast}
            />
            <AnimatePresence>
              {constraints && (
                <motion.button
                  type="button"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: ANIMATION.FAST }}
                  onClick={() => {
                    setConstraints("");
                    constraintsRef.current?.focus({ preventScroll: true });
                  }}
                  className="absolute right-3 top-3 text-dark-500 hover:text-dark-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/50 transition-colors p-1 rounded-md hover:bg-dark-700/50 group"
                  aria-label={ACCESSIBILITY_LABELS.WIZARD_INFO.CLEAR_CONSTRAINTS}
                  title={ACCESSIBILITY_LABELS.WIZARD_INFO.CLEAR_CONSTRAINTS}
                >
                  <Icon
                    name="close"
                    className="w-4 h-4 transition-transform duration-200 motion-safe:group-hover:rotate-90"
                  />
                </motion.button>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end pt-4">
          <motion.span
            animate={showReadyPulse ? { scale: [1, 1.04, 1] } : { scale: 1 }}
            transition={{ duration: ANIMATION.HALF_SECOND, ease: EASING.easeOut }}
            className="inline-flex"
          >
            <KeyboardShortcutTooltip
              shortcut={KEYBOARD_EVENT_KEYS.ENTER}
              description={SHORTCUT_DESCRIPTIONS.CONTINUE_NEXT_STEP}
              position="left"
            >
              <RippleButton
                type="submit"
                disabled={!canProceed}
                whileHover={{ ...HOVER_SCALE.MICRO, y: -2 }}
                whileTap={{ ...TAP_SCALE.MICRO, y: 0 }}
                className={`btn-primary flex items-center gap-2 group ${canProceed ? "animate-glow" : ""} ${isShaking ? CSS_CLASSES.SHAKE_ANIMATION : ""}`}
                aria-keyshortcuts={getAriaShortcutKey(KEYBOARD_EVENT_KEYS.ENTER, MODIFIER_KEYS.CMD)}
              >
                {UI_CONTENT.WIZARD.STEP_INFO.NEXT_BUTTON}
                <kbd className={`ml-2 ${CSS_CLASSES.KBD_SHORTCUT}`} aria-hidden="true">
                  {modifierKey}+{DISPLAY_SYMBOLS.ENTER_KEY}
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
          </motion.span>
        </div>
      </form>

      {/* Screen reader announcement for form clear action — provides explicit
          feedback so screen reader users know the form was cleared, since the
          clear-all button unmounts from the DOM without a visible confirmation. */}
      <div
        className={FOCUS_ANNOUNCER.LIVE_REGION_CLASS}
        role="status"
        aria-live="assertive"
        aria-atomic="true"
      >
        {clearAnnouncement}
      </div>
    </motion.div>
  );
});
