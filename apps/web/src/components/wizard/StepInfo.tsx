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
  ARIA_ATOMIC_VALUES,
  ARIA_HIDDEN_VALUES,
  ARIA_LIVE_VALUES,
  ARIA_REQUIRED_VALUES,
  ARIA_ROLES,
  DISPLAY_SYMBOLS,
  FRAMER_TYPE,
  ICON_PATHS,
  KEYBOARD_EVENT_KEYS,
  MODIFIER_KEYS,
  PERCENT_SCALE,
  RATIO_LIMITS,
  SHORTCUT_DESCRIPTIONS,
  UI_MESSAGES,
  UI_TIMEOUTS,
  DATA_BOOLEAN_VALUES,
  DIRECTION,
} from "@blueprint/shared/config";
import * as motion from "framer-motion/m";
import { AnimatePresence } from "framer-motion";
import { ANIMATION_SCALE, ANIMATION_X_OFFSET, ANIMATION_Y_OFFSET } from "@blueprint/shared";
import { useWizardStore } from "../../store";
import {
  FormEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
  memo,
  useMemo,
  type KeyboardEvent as ReactKeyboardEvent,
} from "react";
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
  SCROLL_INTO_VIEW_BLOCK,
  CSS_CLASSES,
  FOCUS_ANNOUNCER,
  DOM_ELEMENT_IDS,
} from "../../config/constants";
import { getScrollBehavior } from "../../utils/scroll";
import { STEP_INFO_LABELS } from "../../config/constants/validation";
import { ACCESSIBILITY_LABELS } from "../../config/constants/content";
import { useAutoSaveToast } from "../../hooks/useAutoSaveToast";
import { useAutoResizeTextarea } from "../../hooks/useAutoResizeTextarea";
import { useReducedMotion } from "../../hooks/useReducedMotion";
import { RippleButton } from "../RippleButton";
import { CharacterCounter } from "../CharacterCounter";
import { Icon } from "../Icon";
import { KeyboardShortcutTooltip, SmartTooltip } from "../SmartTooltip";
import { pageTransition, transitions, type AnimationDirection } from "../../utils/motion";
import { TypeIndicator, useTypingIndicator } from "../TypeIndicator";
import { ValidationCheckmark } from "../ValidationCheckmark";
import { getModifierLabel, getAriaShortcutKey } from "../../lib/platform";
import { SVG_ICON_DEFAULTS } from "@blueprint/shared/config";

interface StepInfoProps {
  direction?: AnimationDirection;
}

// Yellow means "approaching limit" form-wide; the below-min hint stays neutral.
const DESCRIPTION_WARNING_THRESHOLD = Math.floor(
  FORM_LIMITS.DESCRIPTION.MAX * RATIO_LIMITS.FORM_WARNING
);

export const StepInfo = memo(function StepInfo({
  direction = ANIMATION_DIRECTIONS.FORWARD,
}: StepInfoProps): JSX.Element {
  const shouldReduceMotion = useReducedMotion();
  const projectNameInputRef = useRef<HTMLInputElement>(null);
  const targetAudienceInputRef = useRef<HTMLInputElement>(null);
  const [isShaking, setIsShaking] = useState(false);
  const [invalidField, setInvalidField] = useState<string | null>(null);
  // Persists past the 400ms shake so the error stays visible while invalid.
  const [projectNameErrorShown, setProjectNameErrorShown] = useState(false);
  // Mirrors projectNameErrorShown: description error appears only after a failed
  // submit attempt, not assertively on every keystroke while the user types.
  const [descriptionErrorShown, setDescriptionErrorShown] = useState(false);
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
  // Error persists (unlike the transient invalidField shake) while the field
  // remains below minimum length after a failed submit attempt.
  const projectNameErrorVisible =
    projectNameErrorShown && projectName.length < FORM_LIMITS.PROJECT_NAME.MIN;
  const descriptionErrorVisible =
    descriptionErrorShown && description.length < FORM_LIMITS.DESCRIPTION.MIN;

  // One-shot pulse on the Next button when form becomes valid; skip initial mount
  const prevCanProceed = useRef<boolean | null>(null);
  const [showReadyPulse, setShowReadyPulse] = useState(false);
  // Polite live-region announcement when the form transitions from incomplete
  // to complete. Sighted users get the ready pulse above; screen-reader users
  // need an explicit spoken cue that the Next button is now enabled, otherwise
  // the disabled→enabled transition is silent. Auto-clears so the live region
  // does not accumulate stale text (mirrors clearAnnouncement below).
  const [formReadyAnnouncement, setFormReadyAnnouncement] = useState("");

  useEffect(() => {
    if (prevCanProceed.current === null) {
      prevCanProceed.current = canProceed;
      return;
    }
    if (canProceed && !prevCanProceed.current) {
      setShowReadyPulse(true);
      setFormReadyAnnouncement(ACCESSIBILITY_LABELS.WIZARD_INFO.FORM_READY_ANNOUNCEMENT);
      const timer = setTimeout(() => setShowReadyPulse(false), UI_TIMEOUTS.READY_PULSE_MS);
      prevCanProceed.current = canProceed;
      return () => clearTimeout(timer);
    }
    prevCanProceed.current = canProceed;
  }, [canProceed]);

  // Clear the form-ready announcement after screen readers have had time to
  // announce it, preventing stale text from lingering in the live region.
  useEffect(() => {
    if (!formReadyAnnouncement) return;
    const timer = setTimeout(() => setFormReadyAnnouncement(""), TIMEOUTS.LIVE_REGION_CLEAR);
    return () => clearTimeout(timer);
  }, [formReadyAnnouncement]);

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
      percentage: (completedFields / totalFields) * PERCENT_SCALE,
    };
  }, [projectName.length, description.length, targetAudience.length, constraints.length]);

  const handleClearForm = useCallback(() => {
    // Only animate if there's actually content to clear
    if (hasAnyInput) {
      storeClearForm();
      setClearAnimation(true);
      setClearAnnouncement(ACCESSIBILITY_LABELS.WIZARD_INFO.CLEAR_ALL_ANNOUNCEMENT);
      setProjectNameErrorShown(false);
      setDescriptionErrorShown(false);
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
          behavior: getScrollBehavior(),
          block: SCROLL_INTO_VIEW_BLOCK.NEAREST,
        });
        fieldId = "projectName";
      } else if (description.length < FORM_LIMITS.DESCRIPTION.MIN) {
        descriptionRef.current?.focus({ preventScroll: true });
        descriptionRef.current?.scrollIntoView({
          behavior: getScrollBehavior(),
          block: SCROLL_INTO_VIEW_BLOCK.NEAREST,
        });
        fieldId = "description";
      }
      if (fieldId) {
        setInvalidField(fieldId);
        if (fieldId === "projectName") {
          setProjectNameErrorShown(true);
        } else if (fieldId === "description") {
          setDescriptionErrorShown(true);
        }
        setTimeout(() => setInvalidField(null), TIMEOUTS.SHAKE_ANIMATION);
      }
      // Trigger shake animation for visual feedback
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), TIMEOUTS.SHAKE_ANIMATION);
    }
  };

  // Enter-to-advance: while the form cannot be submitted yet (submit button
  // disabled), Enter would otherwise do nothing, stranding keyboard/mobile
  // users on the same field — so Enter advances to the next field instead
  // (enterKeyHint="next"). When submittable, Enter keeps default submit, so
  // the soft-key hint flips to enterKeyHint="go" to match: a static "next"
  // key that actually submits the form misleads mobile users about what the
  // key will do.
  const handleProjectNameKeyDown = useCallback(
    (e: ReactKeyboardEvent<HTMLInputElement>) => {
      if (e.key !== KEYBOARD_EVENT_KEYS.ENTER || canProceed) return;
      e.preventDefault();
      descriptionRef.current?.focus({ preventScroll: true });
    },
    [canProceed, descriptionRef]
  );

  const handleTargetAudienceKeyDown = useCallback(
    (e: ReactKeyboardEvent<HTMLInputElement>) => {
      if (e.key !== KEYBOARD_EVENT_KEYS.ENTER || canProceed) return;
      e.preventDefault();
      constraintsRef.current?.focus({ preventScroll: true });
    },
    [canProceed, constraintsRef]
  );

  useEffect(() => {
    projectNameInputRef.current?.focus({ preventScroll: true });
  }, []);

  const nextButton = (
    <RippleButton
      type="submit"
      disabled={!canProceed}
      aria-label={canProceed ? undefined : ACCESSIBILITY_LABELS.WIZARD_INFO.NEXT_DISABLED_ARIA}
      whileHover={{ ...HOVER_SCALE.MICRO, y: ANIMATION_Y_OFFSET.HOVER_LIFT }}
      whileTap={{ ...TAP_SCALE.MICRO, y: 0 }}
      className={`btn-primary flex items-center gap-2 group ${canProceed ? "animate-glow" : ""} ${isShaking ? CSS_CLASSES.SHAKE_ANIMATION : ""}`}
      aria-keyshortcuts={getAriaShortcutKey(KEYBOARD_EVENT_KEYS.ENTER, MODIFIER_KEYS.CMD)}
    >
      {UI_CONTENT.WIZARD.STEP_INFO.NEXT_BUTTON}
      <kbd className={`ml-2 ${CSS_CLASSES.KBD_SHORTCUT}`} aria-hidden={ARIA_HIDDEN_VALUES.TRUE}>
        {modifierKey}+{DISPLAY_SYMBOLS.ENTER_KEY}
      </kbd>
      <svg
        className={CSS_CLASSES.ICON_HOVER_SHIFT}
        fill={SVG_ICON_DEFAULTS.FILL_NONE}
        stroke={SVG_ICON_DEFAULTS.STROKE_CURRENT}
        viewBox={SVG_ICON_DEFAULTS.VIEW_BOX}
        aria-hidden={ARIA_HIDDEN_VALUES.TRUE}
      >
        <path
          strokeLinecap={SVG_ICON_DEFAULTS.STROKE_LINECAP_ROUND}
          strokeLinejoin={SVG_ICON_DEFAULTS.STROKE_LINEJOIN_ROUND}
          strokeWidth={SVG_ICON_DEFAULTS.STROKE_WIDTH_DEFAULT}
          d={ICON_PATHS.CHEVRON_RIGHT}
        />
      </svg>
    </RippleButton>
  );

  return (
    <motion.div
      {...pageTransition(direction)}
      className="space-y-6"
      data-reduced-motion={
        shouldReduceMotion ? DATA_BOOLEAN_VALUES.TRUE : DATA_BOOLEAN_VALUES.FALSE
      }
      data-can-proceed={canProceed ? DATA_BOOLEAN_VALUES.TRUE : DATA_BOOLEAN_VALUES.FALSE}
    >
      <div>
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-2xl font-bold text-white">{UI_CONTENT.WIZARD.STEP_INFO.TITLE}</h2>
          <div className="flex items-center gap-2 text-sm">
            <AnimatePresence>
              {hasAnyInput && (
                <motion.button
                  type="button"
                  onClick={handleClearForm}
                  initial={{ opacity: 0, scale: ANIMATION_SCALE.MODAL }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: ANIMATION_SCALE.MODAL }}
                  transition={{ duration: ANIMATION.FAST, ease: EASING.easeOut }}
                  className="text-xs text-dark-500 hover:text-accent-pink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-pink/50 rounded px-2 py-1 transition-colors flex items-center gap-1"
                  aria-label={ACCESSIBILITY_LABELS.WIZARD_INFO.CLEAR_ALL_FIELDS}
                  title={ACCESSIBILITY_LABELS.WIZARD_INFO.CLEAR_ALL_FIELDS}
                >
                  <svg
                    className="w-3.5 h-3.5"
                    fill={SVG_ICON_DEFAULTS.FILL_NONE}
                    stroke={SVG_ICON_DEFAULTS.STROKE_CURRENT}
                    viewBox={SVG_ICON_DEFAULTS.VIEW_BOX}
                    aria-hidden={ARIA_HIDDEN_VALUES.TRUE}
                  >
                    <path
                      strokeLinecap={SVG_ICON_DEFAULTS.STROKE_LINECAP_ROUND}
                      strokeLinejoin={SVG_ICON_DEFAULTS.STROKE_LINEJOIN_ROUND}
                      strokeWidth={SVG_ICON_DEFAULTS.STROKE_WIDTH_DEFAULT}
                      d={ICON_PATHS.TRASH}
                    />
                  </svg>
                  {UI_CONTENT.BUTTONS.CLEAR_ALL}
                </motion.button>
              )}
            </AnimatePresence>
            {/* Real progressbar semantics (WCAG 4.1.2): the fill bar alone was
                purely visual, so screen-reader users had no role/value to
                discover. aria-label carries the human-readable count; the
                adjacent live region below handles polite change announcements
                (progressbars are not live regions by default). */}
            <div
              role={ARIA_ROLES.PROGRESSBAR}
              aria-valuemin={0}
              aria-valuemax={formProgress.total}
              aria-valuenow={formProgress.completed}
              aria-label={ACCESSIBILITY_LABELS.WIZARD_INFO.FIELDS_COMPLETED(
                formProgress.completed,
                formProgress.total
              )}
              data-progress={Math.round(formProgress.percentage)}
              className="w-24 h-2 bg-dark-700 rounded-full overflow-hidden relative"
            >
              <motion.div
                className={`h-full bg-gradient-to-r from-primary-500 to-accent-emerald ${canProceed ? "progress-shimmer relative" : ""}`}
                initial={{ width: 0 }}
                animate={{ width: `${formProgress.percentage}%` }}
                transition={{ type: FRAMER_TYPE.SPRING, ...SPRING_CONFIG.SMOOTH }}
                aria-hidden={ARIA_HIDDEN_VALUES.TRUE}
              />
            </div>
            {/* Visible count for sighted users — decorative to AT so it doesn't
                double-speak with the progressbar's accessible name. */}
            <span
              className="text-dark-400 tabular-nums flex items-center gap-0.5"
              aria-hidden={ARIA_HIDDEN_VALUES.TRUE}
            >
              <motion.span
                key={formProgress.completed}
                initial={{ scale: ANIMATION_SCALE.POP_IN, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: FRAMER_TYPE.SPRING, ...SPRING_CONFIG.COUNTER_FLIP }}
                className="tabular-nums"
              >
                {formProgress.completed}
              </motion.span>
              <span className="text-dark-600">/{formProgress.total}</span>
            </span>
            {/* Polite live region: announces field-count changes without the
                aria-label-on-live-region anti-pattern (the previous span mixed
                both, which made announcement behavior SR-dependent). */}
            <span
              className={FOCUS_ANNOUNCER.LIVE_REGION_CLASS}
              role={ARIA_ROLES.STATUS}
              aria-live={ARIA_LIVE_VALUES.POLITE}
              aria-atomic={ARIA_ATOMIC_VALUES.TRUE}
            >
              {ACCESSIBILITY_LABELS.WIZARD_INFO.FIELDS_COMPLETED(
                formProgress.completed,
                formProgress.total
              )}
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
            <label
              htmlFor={DOM_ELEMENT_IDS.STEP_INFO_PROJECT_NAME}
              className="label flex items-center gap-2"
            >
              {UI_CONTENT.WIZARD.STEP_INFO.PROJECT_NAME_LABEL}{" "}
              <span className="text-accent-pink" aria-hidden={ARIA_HIDDEN_VALUES.TRUE}>
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
              id={DOM_ELEMENT_IDS.STEP_INFO_PROJECT_NAME}
              name="projectName"
              type="text"
              autoComplete="off"
              // Mobile keyboard hygiene: project names are often technical
              // identifiers. Without these, iOS/Android autocapitalize the
              // first letter and Safari autocorrect rewrites tokens
              // ("auth" -> "author"), mangling the typed name. Matches the
              // spellCheck={false} precedent in KeyboardShortcutsModal.
              autoCapitalize="off"
              autoCorrect="off"
              spellCheck={false}
              enterKeyHint={canProceed ? "go" : "next"}
              dir="auto"
              value={projectName}
              onKeyDown={handleProjectNameKeyDown}
              onChange={(e) => {
                projectNameTyping.handleTyping(e.target.value);
                setProjectName(e.target.value);
              }}
              onBlur={projectNameTyping.handleBlur}
              placeholder={UI_CONTENT.WIZARD.STEP_INFO.PROJECT_NAME_PLACEHOLDER}
              className={`input-field transition-all duration-200 ${
                projectName.length >= FORM_LIMITS.PROJECT_NAME.MAX
                  ? "border-accent-pink focus:border-accent-pink focus:ring-accent-pink/20"
                  : projectName.length > FORM_LIMITS.PROJECT_NAME.WARNING_THRESHOLD
                    ? "border-yellow-500 focus:border-yellow-500 focus:ring-yellow-500/20"
                    : projectName.length >= FORM_LIMITS.PROJECT_NAME.MIN
                      ? "border-accent-emerald/50 focus:border-accent-emerald focus:ring-accent-emerald/20"
                      : ""
              }`}
              maxLength={FORM_LIMITS.PROJECT_NAME.MAX}
              required
              aria-required={ARIA_REQUIRED_VALUES.TRUE}
              animate={
                projectNameTyping.isTyping ? { scale: ANIMATION_SCALE.TYPING_PULSE } : { scale: 1 }
              }
              transition={{ duration: ANIMATION.FAST }}
              aria-invalid={isProjectNameInvalid || projectNameErrorVisible || undefined}
              aria-describedby={
                projectNameErrorVisible
                  ? DOM_ELEMENT_IDS.STEP_INFO_PROJECT_NAME_ERROR
                  : projectName.length > FORM_LIMITS.PROJECT_NAME.WARNING_THRESHOLD &&
                      projectName.length < FORM_LIMITS.PROJECT_NAME.MAX
                    ? DOM_ELEMENT_IDS.STEP_INFO_PROJECT_NAME_WARNING
                    : undefined
              }
            />
            {/* Clear button — appears when field has content */}
            <AnimatePresence>
              {projectName.length > 0 && (
                <motion.button
                  type="button"
                  initial={{ opacity: 0, scale: ANIMATION_SCALE.STANDARD }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: ANIMATION_SCALE.STANDARD }}
                  transition={{ duration: ANIMATION.FAST }}
                  onClick={() => {
                    setProjectName("");
                    setProjectNameErrorShown(false);
                    projectNameInputRef.current?.focus({ preventScroll: true });
                  }}
                  className={`absolute ${
                    projectName.length >= FORM_LIMITS.PROJECT_NAME.MIN ? "right-11" : "right-3"
                  } top-1/2 -translate-y-1/2 text-dark-500 hover:text-dark-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/50 transition-colors p-1 rounded-md hover:bg-dark-700/50 group`}
                  aria-label={ACCESSIBILITY_LABELS.WIZARD_INFO.CLEAR_PROJECT_NAME}
                  title={ACCESSIBILITY_LABELS.WIZARD_INFO.CLEAR_PROJECT_NAME}
                >
                  <Icon name="close" className={CSS_CLASSES.ICON_HOVER_ROTATE_90} />
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
                  id={DOM_ELEMENT_IDS.STEP_INFO_PROJECT_NAME_WARNING}
                  role={ARIA_ROLES.STATUS}
                  initial={{ opacity: 0, y: ANIMATION_Y_OFFSET.RISE_TINY }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: ANIMATION_Y_OFFSET.RISE_TINY }}
                  transition={{ duration: ANIMATION.NORMAL, ease: EASING.easeOut }}
                  className="text-xs text-accent-pink mt-1"
                >
                  {VALIDATION_MESSAGES.APPROACHING_CHARACTER_LIMIT}
                </motion.p>
              )}
          </AnimatePresence>
          <AnimatePresence>
            {projectNameErrorVisible && (
              <motion.p
                id={DOM_ELEMENT_IDS.STEP_INFO_PROJECT_NAME_ERROR}
                role={ARIA_ROLES.ALERT}
                initial={{
                  opacity: 0,
                  y: ANIMATION_Y_OFFSET.RISE_TINY,
                  x: ANIMATION_X_OFFSET.SLIDE_LEFT_MICRO,
                }}
                animate={{ opacity: 1, y: 0, x: 0 }}
                exit={{
                  opacity: 0,
                  y: ANIMATION_Y_OFFSET.RISE_TINY,
                  x: ANIMATION_X_OFFSET.SLIDE_LEFT_MICRO,
                }}
                transition={{ duration: ANIMATION.NORMAL, ease: EASING.easeOut }}
                className="text-xs text-accent-pink mt-1"
              >
                {VALIDATION_MESSAGES.PROJECT_NAME_MIN_LENGTH(FORM_LIMITS.PROJECT_NAME.MIN)}
              </motion.p>
            )}
          </AnimatePresence>
        </div>

        {/* Description */}
        <div>
          <div className="flex justify-between items-center">
            <label
              htmlFor={DOM_ELEMENT_IDS.STEP_INFO_DESCRIPTION}
              className="label flex items-center gap-2"
            >
              {UI_CONTENT.WIZARD.STEP_INFO.DESCRIPTION_LABEL}{" "}
              <span className="text-accent-pink" aria-hidden={ARIA_HIDDEN_VALUES.TRUE}>
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
              warningThreshold={DESCRIPTION_WARNING_THRESHOLD}
            />
          </div>
          <div
            className={`relative ${invalidField === "description" ? "invalid-field-flash rounded-xl" : ""}`}
          >
            <motion.textarea
              ref={descriptionRef}
              id={DOM_ELEMENT_IDS.STEP_INFO_DESCRIPTION}
              name="description"
              autoComplete="off"
              // Prose field: sentence capitalization and spellcheck help users
              // write a clear project description on mobile. This is the
              // intentional opposite of the technical fields above (projectName,
              // targetAudience, constraints), which disable these because they
              // hold identifiers/tokens that autocorrect mangles.
              autoCapitalize="sentences"
              spellCheck={true}
              dir="auto"
              value={description}
              onChange={(e) => {
                descriptionTyping.handleTyping(e.target.value);
                setDescription(e.target.value);
              }}
              onBlur={descriptionTyping.handleBlur}
              placeholder={UI_CONTENT.WIZARD.STEP_INFO.DESCRIPTION_PLACEHOLDER}
              className={`textarea-field transition-all duration-200 ${
                description.length >= FORM_LIMITS.DESCRIPTION.MAX
                  ? "border-accent-pink focus:border-accent-pink focus:ring-accent-pink/20 pr-12"
                  : description.length >= DESCRIPTION_WARNING_THRESHOLD
                    ? "border-yellow-500/50 focus:border-yellow-500 focus:ring-yellow-500/20 pr-12"
                    : description.length >= FORM_LIMITS.DESCRIPTION.MIN
                      ? "border-accent-emerald/50 focus:border-accent-emerald focus:ring-accent-emerald/20 pr-12"
                      : descriptionErrorVisible
                        ? "border-accent-pink focus:border-accent-pink focus:ring-accent-pink/20"
                        : description.length > 0
                          ? "border-dark-500/50 focus:border-dark-400 focus:ring-dark-500/20"
                          : ""
              }`}
              maxLength={FORM_LIMITS.DESCRIPTION.MAX}
              required
              aria-required={ARIA_REQUIRED_VALUES.TRUE}
              aria-invalid={isDescriptionInvalid || descriptionErrorVisible || undefined}
              animate={
                descriptionTyping.isTyping ? { scale: ANIMATION_SCALE.TYPING_PULSE } : { scale: 1 }
              }
              transition={{ duration: ANIMATION.FAST }}
              {...(descriptionErrorVisible
                ? { "aria-describedby": DOM_ELEMENT_IDS.STEP_INFO_DESCRIPTION_ERROR }
                : description.length >= DESCRIPTION_WARNING_THRESHOLD &&
                    description.length < FORM_LIMITS.DESCRIPTION.MAX
                  ? { "aria-describedby": DOM_ELEMENT_IDS.STEP_INFO_DESCRIPTION_WARNING }
                  : description.length > 0 && description.length < FORM_LIMITS.DESCRIPTION.MIN
                    ? { "aria-describedby": DOM_ELEMENT_IDS.STEP_INFO_DESCRIPTION_HINT }
                    : {})}
            />
            {/* Clear button — appears when field has content */}
            <AnimatePresence>
              {description.length > 0 && (
                <motion.button
                  type="button"
                  initial={{ opacity: 0, scale: ANIMATION_SCALE.STANDARD }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: ANIMATION_SCALE.STANDARD }}
                  transition={{ duration: ANIMATION.FAST }}
                  onClick={() => {
                    setDescription("");
                    setDescriptionErrorShown(false);
                    descriptionRef.current?.focus({ preventScroll: true });
                  }}
                  className={`absolute ${
                    description.length >= FORM_LIMITS.DESCRIPTION.MIN ? "right-11" : "right-3"
                  } top-3 text-dark-500 hover:text-dark-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/50 transition-colors p-1 rounded-md hover:bg-dark-700/50 group`}
                  aria-label={ACCESSIBILITY_LABELS.WIZARD_INFO.CLEAR_DESCRIPTION}
                  title={ACCESSIBILITY_LABELS.WIZARD_INFO.CLEAR_DESCRIPTION}
                >
                  <Icon name="close" className={CSS_CLASSES.ICON_HOVER_ROTATE_90} />
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
            {description.length > 0 &&
              description.length < FORM_LIMITS.DESCRIPTION.MIN &&
              !descriptionErrorVisible && (
                <motion.p
                  id={DOM_ELEMENT_IDS.STEP_INFO_DESCRIPTION_HINT}
                  initial={{ opacity: 0, y: ANIMATION_Y_OFFSET.RISE_TINY }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: ANIMATION_Y_OFFSET.RISE_TINY }}
                  transition={{ duration: ANIMATION.NORMAL, ease: EASING.easeOut }}
                  className="text-xs text-dark-400 mt-1"
                >
                  {VALIDATION_MESSAGES.CHARACTERS_NEEDED(
                    FORM_LIMITS.DESCRIPTION.MIN - description.length
                  )}
                </motion.p>
              )}
          </AnimatePresence>
          <AnimatePresence>
            {description.length >= DESCRIPTION_WARNING_THRESHOLD &&
              description.length < FORM_LIMITS.DESCRIPTION.MAX && (
                <motion.p
                  id={DOM_ELEMENT_IDS.STEP_INFO_DESCRIPTION_WARNING}
                  role={ARIA_ROLES.STATUS}
                  initial={{ opacity: 0, y: ANIMATION_Y_OFFSET.RISE_TINY }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: ANIMATION_Y_OFFSET.RISE_TINY }}
                  transition={{ duration: ANIMATION.NORMAL, ease: EASING.easeOut }}
                  className="text-xs text-accent-pink mt-1"
                >
                  {VALIDATION_MESSAGES.APPROACHING_CHARACTER_LIMIT}
                </motion.p>
              )}
          </AnimatePresence>
          <AnimatePresence>
            {descriptionErrorVisible && (
              <motion.p
                id={DOM_ELEMENT_IDS.STEP_INFO_DESCRIPTION_ERROR}
                role={ARIA_ROLES.ALERT}
                initial={{
                  opacity: 0,
                  y: ANIMATION_Y_OFFSET.RISE_TINY,
                  x: ANIMATION_X_OFFSET.SLIDE_LEFT_MICRO,
                }}
                animate={{ opacity: 1, y: 0, x: 0 }}
                exit={{
                  opacity: 0,
                  y: ANIMATION_Y_OFFSET.RISE_TINY,
                  x: ANIMATION_X_OFFSET.SLIDE_LEFT_MICRO,
                }}
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
            <label
              htmlFor={DOM_ELEMENT_IDS.STEP_INFO_TARGET_AUDIENCE}
              className="label mb-0 flex items-center gap-2"
            >
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
              id={DOM_ELEMENT_IDS.STEP_INFO_TARGET_AUDIENCE}
              name="targetAudience"
              type="text"
              autoComplete="off"
              // Mobile keyboard hygiene: target audience entries are often
              // technical role tokens ("devops", "SRE", "frontend eng") that
              // iOS/Android autocapitalize and Safari autocorrect rewrite
              // ("devops" -> "DevOps", "SRE" -> "sore"). Matches the
              // autoCapitalize/autoCorrect/spellCheck pattern on projectName.
              autoCapitalize="off"
              autoCorrect="off"
              spellCheck={false}
              enterKeyHint={canProceed ? "go" : "next"}
              dir="auto"
              value={targetAudience}
              onKeyDown={handleTargetAudienceKeyDown}
              onChange={(e) => {
                targetAudienceTyping.handleTyping(e.target.value);
                setTargetAudience(e.target.value);
              }}
              onBlur={targetAudienceTyping.handleBlur}
              placeholder={UI_CONTENT.WIZARD.STEP_INFO.TARGET_AUDIENCE_PLACEHOLDER}
              className="input-field pr-10"
              maxLength={FORM_LIMITS.TARGET_AUDIENCE.MAX}
              animate={
                targetAudienceTyping.isTyping
                  ? { scale: ANIMATION_SCALE.TYPING_PULSE }
                  : { scale: 1 }
              }
              transition={{ duration: ANIMATION.FAST }}
            />
            <AnimatePresence>
              {targetAudience && (
                <motion.button
                  type="button"
                  initial={{ opacity: 0, scale: ANIMATION_SCALE.STANDARD }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: ANIMATION_SCALE.STANDARD }}
                  transition={{ duration: ANIMATION.FAST }}
                  onClick={() => {
                    setTargetAudience("");
                    targetAudienceInputRef.current?.focus({ preventScroll: true });
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-dark-500 hover:text-dark-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/50 transition-colors p-1 rounded-md hover:bg-dark-700/50 group"
                  aria-label={ACCESSIBILITY_LABELS.WIZARD_INFO.CLEAR_TARGET_AUDIENCE}
                  title={ACCESSIBILITY_LABELS.WIZARD_INFO.CLEAR_TARGET_AUDIENCE}
                >
                  <Icon name="close" className={CSS_CLASSES.ICON_HOVER_ROTATE_90} />
                </motion.button>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Constraints (Optional) */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label
              htmlFor={DOM_ELEMENT_IDS.STEP_INFO_CONSTRAINTS}
              className="label mb-0 flex items-center gap-2"
            >
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
              id={DOM_ELEMENT_IDS.STEP_INFO_CONSTRAINTS}
              name="constraints"
              autoComplete="off"
              autoCapitalize="off"
              autoCorrect="off"
              spellCheck={false}
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
              animate={
                constraintsTyping.isTyping ? { scale: ANIMATION_SCALE.TYPING_PULSE } : { scale: 1 }
              }
              transition={transitions.fast}
            />
            <AnimatePresence>
              {constraints && (
                <motion.button
                  type="button"
                  initial={{ opacity: 0, scale: ANIMATION_SCALE.STANDARD }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: ANIMATION_SCALE.STANDARD }}
                  transition={{ duration: ANIMATION.FAST }}
                  onClick={() => {
                    setConstraints("");
                    constraintsRef.current?.focus({ preventScroll: true });
                  }}
                  className="absolute right-3 top-3 text-dark-500 hover:text-dark-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/50 transition-colors p-1 rounded-md hover:bg-dark-700/50 group"
                  aria-label={ACCESSIBILITY_LABELS.WIZARD_INFO.CLEAR_CONSTRAINTS}
                  title={ACCESSIBILITY_LABELS.WIZARD_INFO.CLEAR_CONSTRAINTS}
                >
                  <Icon name="close" className={CSS_CLASSES.ICON_HOVER_ROTATE_90} />
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
            {canProceed ? (
              <KeyboardShortcutTooltip
                shortcut={KEYBOARD_EVENT_KEYS.ENTER}
                description={SHORTCUT_DESCRIPTIONS.CONTINUE_NEXT_STEP}
                position={DIRECTION.LEFT}
              >
                {nextButton}
              </KeyboardShortcutTooltip>
            ) : (
              <SmartTooltip
                content={ACCESSIBILITY_LABELS.WIZARD_INFO.NEXT_DISABLED_TOOLTIP}
                position={DIRECTION.LEFT}
                delay={0}
              >
                {nextButton}
              </SmartTooltip>
            )}
          </motion.span>
        </div>
      </form>

      {/* Screen reader announcement for form clear action — provides explicit
          feedback so screen reader users know the form was cleared, since the
          clear-all button unmounts from the DOM without a visible confirmation. */}
      <div
        className={FOCUS_ANNOUNCER.LIVE_REGION_CLASS}
        role={ARIA_ROLES.STATUS}
        aria-live={ARIA_LIVE_VALUES.ASSERTIVE}
        aria-atomic={ARIA_ATOMIC_VALUES.TRUE}
      >
        {clearAnnouncement}
      </div>
      {/* Screen reader announcement for form-ready transition — parity with
          the visual ready pulse on the Next button, so screen-reader users
          hear that the form became submittable. Polite (not assertive): this
          is a positive status update, not an urgent alert. */}
      <div
        className={FOCUS_ANNOUNCER.LIVE_REGION_CLASS}
        role={ARIA_ROLES.STATUS}
        aria-live={ARIA_LIVE_VALUES.POLITE}
        aria-atomic={ARIA_ATOMIC_VALUES.TRUE}
        data-testid="form-ready-announcer"
      >
        {formReadyAnnouncement}
      </div>
    </motion.div>
  );
});
