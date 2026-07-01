import { memo, useMemo, useRef, useEffect, useState } from "react";
import { TIMEOUTS } from "../config/constants";

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
  warningThreshold = Math.floor(max * 0.8),
  className = "",
}: CharacterCounterProps) {
  const isAtLimit = current >= max;
  const isWarning = current >= warningThreshold && current < max;
  const isValid = min !== undefined && current >= min;
  const isEmpty = current === 0;
  const belowMin = min !== undefined && current < min;
  const shouldPulse = isWarning && !isAtLimit;

  const colorClass = useMemo(() => {
    if (isAtLimit) return "text-accent-pink";
    if (isWarning) return "text-yellow-500";
    if (isValid && !isEmpty) return "text-accent-emerald";
    return "text-dark-500";
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
  const prevBelowMinRef = useRef(belowMin);

  useEffect(() => {
    if (!belowMin && prevBelowMinRef.current && min !== undefined) {
      setShowCelebrate(true);
      const timer = setTimeout(() => setShowCelebrate(false), TIMEOUTS.SHAKE_ANIMATION);
      return () => clearTimeout(timer);
    }
    prevBelowMinRef.current = belowMin;
  }, [belowMin, min]);

  const shakeClass = showLimitShake ? "shake-animation" : "";
  const pulseClass = shouldPulse && !showLimitShake ? "animate-pulse-scale" : "";
  const celebrateClass = showCelebrate ? "counter-celebrate-pop" : "";

  return (
    <>
      {/* Visual counter — hidden from screen readers */}
      <span
        className={`text-xs tabular-nums transition-colors duration-200 inline-flex items-center ${colorClass} ${shakeClass} ${pulseClass} ${celebrateClass} ${className}`}
        aria-hidden="true"
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
      <span className="sr-only" role="status" aria-live="polite" aria-atomic="true">
        {current} of {max} character{max !== 1 ? "s" : ""} used
        {remaining === 0 ? " — limit reached" : remaining <= 10 ? ` — ${remaining} remaining` : ""}
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
  const isWarning = percentage >= 80 && percentage < 100;
  const isDanger = percentage >= 100;

  const remaining = max - current;

  return (
    <div className={`flex items-center gap-1.5 ${className}`}>
      <div className="w-12 h-1.5 bg-dark-700 rounded-full overflow-hidden" aria-hidden="true">
        <div
          className={`h-full rounded-full transition-all duration-300 ease-out ${
            isDanger ? "bg-accent-pink" : isWarning ? "bg-yellow-500" : "bg-dark-500"
          }`}
          style={{ width: `${Math.min(percentage, 100)}%` }}
        />
      </div>
      <span
        className={`text-2xs tabular-nums ${
          isDanger ? "text-accent-pink font-bold" : "text-dark-500"
        }`}
        aria-hidden="true"
      >
        {current}/{max}
      </span>
      <span className="sr-only" role="status" aria-live="polite" aria-atomic="true">
        {current} of {max} character{max !== 1 ? "s" : ""} used
        {remaining === 0 ? " — limit reached" : remaining <= 10 ? ` — ${remaining} remaining` : ""}
      </span>
    </div>
  );
}

export const CharacterCounterCompact = memo(CharacterCounterCompactComponent);

export default CharacterCounter;
