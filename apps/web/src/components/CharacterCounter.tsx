import { memo, useMemo, useRef, useEffect, useState } from "react";
import { TIMEOUTS, ACCESSIBILITY_LABELS, CSS_CLASSES, FOCUS_ANNOUNCER } from "../config/constants";
import {
  CHAR_COUNTER_THRESHOLDS,
  CHAR_COUNTER_COLORS,
  CHAR_COUNTER_STATE_VALUES,
  RATIO_LIMITS,
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

  const shakeClass = showLimitShake ? CSS_CLASSES.SHAKE_ANIMATION : "";
  const pulseClass = shouldPulse && !showLimitShake ? "animate-pulse-scale" : "";
  const celebrateClass = showCelebrate ? "counter-celebrate-pop" : "";

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
        aria-hidden="true"
        data-state={stateValue}
        data-has-min={min !== undefined ? "true" : "false"}
      >
        <span className={isAtLimit ? "font-bold" : ""}>{current}</span>
        <span className="text-dark-600">/{max}</span>
        {isAtLimit && (
          <span className="ml-1 inline-flex animate-warning-icon" aria-hidden="true">
            <svg
              className="w-3.5 h-3.5 text-accent-pink"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </span>
        )}
      </span>
      {/* Screen-reader-only announcement with descriptive label */}
      <span
        className={FOCUS_ANNOUNCER.LIVE_REGION_CLASS}
        role="status"
        aria-live="polite"
        aria-atomic="true"
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
  const percentage = (current / max) * 100;
  const isWarning =
    percentage >= CHAR_COUNTER_THRESHOLDS.WARNING_PERCENT &&
    percentage < CHAR_COUNTER_THRESHOLDS.DANGER_PERCENT;
  const isDanger = percentage >= CHAR_COUNTER_THRESHOLDS.DANGER_PERCENT;

  const remaining = max - current;
  const isAtLimit = current >= max;

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
    <div className={`flex items-center gap-1.5 ${className}`} data-state={compactStateValue}>
      <div className="w-12 h-1.5 bg-dark-700 rounded-full overflow-hidden" aria-hidden="true">
        <div
          className={`h-full rounded-full transition-all duration-300 ease-out ${
            isDanger ? "bg-accent-pink" : isWarning ? "bg-yellow-500" : "bg-dark-500"
          }`}
          style={{ width: `${Math.min(percentage, 100)}%` }}
        />
      </div>
      <span
        key={`compact-count-${current}`}
        className={`text-2xs tabular-nums inline-block animate-compact-counter-pop ${
          isDanger ? "text-accent-pink font-bold" : "text-dark-500"
        }`}
        aria-hidden="true"
      >
        {current}/{max}
      </span>
      <span
        className={FOCUS_ANNOUNCER.LIVE_REGION_CLASS}
        role="status"
        aria-live="polite"
        aria-atomic="true"
      >
        {compactAnnouncement}
      </span>
    </div>
  );
}

export const CharacterCounterCompact = memo(CharacterCounterCompactComponent);

export default CharacterCounter;
