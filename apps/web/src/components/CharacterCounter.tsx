import { memo, useMemo } from "react";
import { motion } from "framer-motion";
import { ANIMATION } from "../config/constants";
import { ANIMATION_TIMING } from "../config/theme";

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
  const shouldPulse = isWarning && !isAtLimit;

  const colorClass = useMemo(() => {
    if (isAtLimit) return "text-accent-pink";
    if (isWarning) return "text-yellow-500";
    if (isValid && !isEmpty) return "text-accent-emerald";
    return "text-dark-500";
  }, [isAtLimit, isWarning, isValid, isEmpty]);

  const remaining = max - current;

  return (
    <>
      {/* Visual counter — hidden from screen readers */}
      <motion.span
        className={`text-xs tabular-nums transition-colors duration-200 ${colorClass} ${className}`}
        animate={
          shouldPulse
            ? {
                scale: [1, 1.15, 1],
                opacity: [1, 0.7, 1],
              }
            : {}
        }
        transition={
          shouldPulse
            ? {
                duration: ANIMATION.PULSE,
                repeat: Infinity,
                repeatType: "loop",
                ease: "easeInOut",
              }
            : {}
        }
        aria-hidden="true"
      >
        <span className={isAtLimit ? "font-bold" : ""}>{current}</span>
        <span className="text-dark-600">/{max}</span>
        {isAtLimit && (
          <motion.span
            initial={{ opacity: 0, x: -5 }}
            animate={{ opacity: 1, x: 0 }}
            className="ml-1"
            aria-hidden="true"
          >
            ⚠️
          </motion.span>
        )}
      </motion.span>
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
        <motion.div
          className={`h-full rounded-full ${
            isDanger ? "bg-accent-pink" : isWarning ? "bg-yellow-500" : "bg-dark-500"
          }`}
          initial={{ width: 0 }}
          animate={{ width: `${Math.min(percentage, 100)}%` }}
          transition={{ duration: ANIMATION.NORMAL, ease: ANIMATION_TIMING.easing.easeOut }}
        />
      </div>
      <span
        className={`text-[10px] tabular-nums ${
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
