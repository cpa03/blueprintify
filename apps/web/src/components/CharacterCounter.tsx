import { memo, useMemo, useRef, useEffect, useState } from "react";
import { TIMEOUTS, ACCESSIBILITY_LABELS, CSS_CLASSES, FOCUS_ANNOUNCER } from "../config/constants";
import { useReducedMotion } from "../hooks/useReducedMotion";
import {
  ARIA_ATOMIC_VALUES,
  ARIA_HIDDEN_VALUES,
  ARIA_LIVE_VALUES,
  ARIA_ROLES,
  CHAR_COUNTER_COLORS,
  CHAR_COUNTER_STATE_VALUES,
  CHAR_COUNTER_THRESHOLDS,
  CSS_VALUES,
  RATIO_LIMITS,
  PERCENT_SCALE,
  SVG_ICON_DEFAULTS,
  ICON_PATHS,
  DATA_BOOLEAN_VALUES,
} from "@blueprint/shared/config";

interface CharacterCounterProps {
  current: number;
  max: number;
  min?: number;
  warningThreshold?: number;
  className?: string;
}

function CharacterCounterComponent({
  current,
  max,
  min,
  warningThreshold = Math.floor(max * RATIO_LIMITS.WARNING),
  className = "",
}: CharacterCounterProps) {
  const isAtLimit = current >= max;
  const isWarning = current >= warningThreshold && current < max;
  const isValid = min !== undefined && current >= min;
  const isEmpty = current === 0;
  const belowMin = min !== undefined && current < min;
  const shouldPulse = isWarning && !isAtLimit;

  const stateValue = useMemo(() => {
    if (isAtLimit) return CHAR_COUNTER_STATE_VALUES.AT_LIMIT;
    if (isWarning) return CHAR_COUNTER_STATE_VALUES.WARNING;
    if (isValid && !isEmpty) return CHAR_COUNTER_STATE_VALUES.VALID;
    return CHAR_COUNTER_STATE_VALUES.DEFAULT;
  }, [isAtLimit, isWarning, isValid, isEmpty]);

  const colorClass = useMemo(() => {
    if (isAtLimit) return CHAR_COUNTER_COLORS.AT_LIMIT;
    if (isWarning) return CHAR_COUNTER_COLORS.WARNING;
    if (isValid && !isEmpty) return CHAR_COUNTER_COLORS.VALID;
    return CHAR_COUNTER_COLORS.DEFAULT;
  }, [isAtLimit, isWarning, isValid, isEmpty]);

  const remaining = max - current;

  // Respect prefers-reduced-motion (WCAG 2.3.3): the limit shake, warning
  // pulse, and min-met celebration are purely decorative, so they are skipped
  // for vestibular-sensitive users. State colors and screen-reader
  // announcements stay fully functional.
  const shouldReduceMotion = useReducedMotion();

  const [showLimitShake, setShowLimitShake] = useState(false);
  const prevAtLimitRef = useRef(false);

  useEffect(() => {
    if (isAtLimit && !prevAtLimitRef.current) {
      setShowLimitShake(true);
      const timer = setTimeout(() => setShowLimitShake(false), TIMEOUTS.SHAKE_ANIMATION);
      return () => clearTimeout(timer);
    }
    prevAtLimitRef.current = isAtLimit;
  }, [isAtLimit]);

  const [showCelebrate, setShowCelebrate] = useState(false);
  const [showMinMetAnnouncement, setShowMinMetAnnouncement] = useState(false);
  const prevBelowMinRef = useRef(belowMin);

  useEffect(() => {
    if (!belowMin && prevBelowMinRef.current && min !== undefined) {
      setShowCelebrate(true);
      setShowMinMetAnnouncement(true);
      const timer = setTimeout(() => {
        setShowCelebrate(false);
        setShowMinMetAnnouncement(false);
      }, TIMEOUTS.SHAKE_ANIMATION);
      return () => clearTimeout(timer);
    }
    prevBelowMinRef.current = belowMin;
  }, [belowMin, min]);

  const shakeClass = !shouldReduceMotion && showLimitShake ? CSS_CLASSES.SHAKE_ANIMATION : "";
  const pulseClass =
    !shouldReduceMotion && shouldPulse && !showLimitShake ? "animate-pulse-scale" : "";
  const celebrateClass = !shouldReduceMotion && showCelebrate ? "counter-celebrate-pop" : "";

  // Intentionally empty during normal typing: a live region that changes on
  // every keystroke makes screen readers announce each character typed.
  const countLabel = `${current} of ${max} character${max !== 1 ? "s" : ""} used`;
  const announcement = showMinMetAnnouncement
    ? `${countLabel}${ACCESSIBILITY_LABELS.CHARACTER_COUNTER.MINIMUM_MET}`
    : isAtLimit
      ? `${countLabel}${ACCESSIBILITY_LABELS.CHARACTER_COUNTER.LIMIT_REACHED}`
      : remaining <= CHAR_COUNTER_THRESHOLDS.NEAR_LIMIT
        ? `${countLabel}${ACCESSIBILITY_LABELS.CHARACTER_COUNTER.REMAINING(remaining)}`
        : "";

  return (
    <>
      {/* Visual counter — hidden from screen readers */}
      <span
        className={`text-xs tabular-nums transition-colors duration-200 inline-flex items-center ${colorClass} ${shakeClass} ${pulseClass} ${celebrateClass} ${className}`}
        aria-hidden={ARIA_HIDDEN_VALUES.TRUE}
        data-state={stateValue}
        data-at-limit={isAtLimit ? DATA_BOOLEAN_VALUES.TRUE : DATA_BOOLEAN_VALUES.FALSE}
        data-warning={isWarning ? DATA_BOOLEAN_VALUES.TRUE : DATA_BOOLEAN_VALUES.FALSE}
        data-valid={isValid ? DATA_BOOLEAN_VALUES.TRUE : DATA_BOOLEAN_VALUES.FALSE}
        data-has-min={min !== undefined ? DATA_BOOLEAN_VALUES.TRUE : DATA_BOOLEAN_VALUES.FALSE}
        data-reduced-motion={
          shouldReduceMotion ? DATA_BOOLEAN_VALUES.TRUE : DATA_BOOLEAN_VALUES.FALSE
        }
      >
        <span className={isAtLimit ? "font-bold" : ""}>{current}</span>
        <span className="text-dark-600">/{max}</span>
        {isAtLimit && (
          <span
            className={`ml-1 inline-flex ${shouldReduceMotion ? "" : "animate-warning-icon"}`}
            aria-hidden={ARIA_HIDDEN_VALUES.TRUE}
          >
            <svg
              className="w-3.5 h-3.5 text-accent-pink"
              viewBox={SVG_ICON_DEFAULTS.VIEW_BOX}
              fill={SVG_ICON_DEFAULTS.FILL_NONE}
              stroke={SVG_ICON_DEFAULTS.STROKE_CURRENT}
              strokeWidth={SVG_ICON_DEFAULTS.STROKE_WIDTH_DEFAULT}
              strokeLinecap={SVG_ICON_DEFAULTS.STROKE_LINECAP_ROUND}
              strokeLinejoin={SVG_ICON_DEFAULTS.STROKE_LINEJOIN_ROUND}
            >
              <path d={ICON_PATHS.WARNING} />
            </svg>
          </span>
        )}
      </span>
      {/* Screen-reader-only announcement with descriptive label */}
      <span
        className={FOCUS_ANNOUNCER.LIVE_REGION_CLASS}
        role={ARIA_ROLES.STATUS}
        aria-live={ARIA_LIVE_VALUES.POLITE}
        aria-atomic={ARIA_ATOMIC_VALUES.TRUE}
      >
        {announcement}
      </span>
    </>
  );
}

export const CharacterCounter = memo(CharacterCounterComponent);

/**
 * Compact version for tight spaces
 */
function CharacterCounterCompactComponent({
  current,
  max,
  className = "",
}: Omit<CharacterCounterProps, "min" | "warningThreshold">) {
  const percentage = (current / max) * PERCENT_SCALE;
  const isWarning =
    percentage >= CHAR_COUNTER_THRESHOLDS.WARNING_PERCENT &&
    percentage < CHAR_COUNTER_THRESHOLDS.DANGER_PERCENT;
  const isDanger = percentage >= CHAR_COUNTER_THRESHOLDS.DANGER_PERCENT;

  const remaining = max - current;
  const isAtLimit = current >= max;

  // Same reduced-motion policy as the main counter above (WCAG 2.3.3): the
  // per-keystroke count pop and the fill-width transition are decorative.
  const shouldReduceMotion = useReducedMotion();

  const compactStateValue = isAtLimit
    ? CHAR_COUNTER_STATE_VALUES.AT_LIMIT
    : isDanger
      ? CHAR_COUNTER_STATE_VALUES.AT_LIMIT
      : isWarning
        ? CHAR_COUNTER_STATE_VALUES.WARNING
        : CHAR_COUNTER_STATE_VALUES.DEFAULT;

  // Mirrors the main counter's threshold-only announcement policy (see above).
  const compactCountLabel = `${current} of ${max} character${max !== 1 ? "s" : ""} used`;
  const compactAnnouncement =
    remaining === 0
      ? `${compactCountLabel}${ACCESSIBILITY_LABELS.CHARACTER_COUNTER.LIMIT_REACHED}`
      : remaining <= CHAR_COUNTER_THRESHOLDS.NEAR_LIMIT
        ? `${compactCountLabel}${ACCESSIBILITY_LABELS.CHARACTER_COUNTER.REMAINING(remaining)}`
        : "";

  return (
    <div
      className={`flex items-center gap-1.5 ${className}`}
      data-state={compactStateValue}
      data-at-limit={isAtLimit ? DATA_BOOLEAN_VALUES.TRUE : DATA_BOOLEAN_VALUES.FALSE}
      data-warning={isWarning ? DATA_BOOLEAN_VALUES.TRUE : DATA_BOOLEAN_VALUES.FALSE}
      data-reduced-motion={
        shouldReduceMotion ? DATA_BOOLEAN_VALUES.TRUE : DATA_BOOLEAN_VALUES.FALSE
      }
      role={ARIA_ROLES.PROGRESSBAR}
      aria-label={compactCountLabel}
      aria-valuemin={0}
      aria-valuemax={max}
      aria-valuenow={Math.min(current, max)}
    >
      <div
        className="w-12 h-1.5 bg-dark-700 rounded-full overflow-hidden"
        aria-hidden={ARIA_HIDDEN_VALUES.TRUE}
      >
        <div
          className={`h-full rounded-full transition-all duration-300 ease-out ${
            isDanger ? "bg-accent-pink" : isWarning ? "bg-yellow-500" : "bg-dark-500"
          }`}
          style={{
            width: `${Math.min(percentage, PERCENT_SCALE)}%`,
            transition: shouldReduceMotion ? CSS_VALUES.NONE : undefined,
          }}
        />
      </div>
      <span
        key={`compact-count-${current}`}
        className={`text-2xs tabular-nums inline-block ${
          shouldReduceMotion ? "" : "animate-compact-counter-pop"
        } ${isDanger ? "text-accent-pink font-bold" : "text-dark-500"}`}
        aria-hidden={ARIA_HIDDEN_VALUES.TRUE}
      >
        {current}/{max}
      </span>
      <span
        className={FOCUS_ANNOUNCER.LIVE_REGION_CLASS}
        role={ARIA_ROLES.STATUS}
        aria-live={ARIA_LIVE_VALUES.POLITE}
        aria-atomic={ARIA_ATOMIC_VALUES.TRUE}
      >
        {compactAnnouncement}
      </span>
    </div>
  );
}

export const CharacterCounterCompact = memo(CharacterCounterCompactComponent);

export default CharacterCounter;
