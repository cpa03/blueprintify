import { useEffect, useRef, useState, useCallback, memo } from "react";
import * as motion from "framer-motion/m";
import { useReducedMotionContext } from "../context/ReducedMotionContext";
import { ANIMATION_COLORS, ANIMATION, EASING, CSS_CLASSES } from "../config/constants";
import { TIME_UNITS } from "@blueprint/shared/config";
import { COUNTER_DIRECTION_VALUES } from "@blueprint/shared";
import { COUNTER_ANIMATION } from "../config/theme";

interface AnimatedNumberProps {
  value: number;
  className?: string;
  duration?: number;
  format?: (value: number) => string;
}

type CounterDirection = (typeof COUNTER_DIRECTION_VALUES)[keyof typeof COUNTER_DIRECTION_VALUES];

function AnimatedNumberComponent({
  value,
  className = "",
  duration = ANIMATION.NUMBER_COUNTER,
  format = (v) => Math.round(v).toString(),
}: AnimatedNumberProps) {
  const { shouldAnimate, getDuration } = useReducedMotionContext();
  const [displayValue, setDisplayValue] = useState(value);
  const displayValueRef = useRef(value);
  const previousValueRef = useRef(value);
  const [direction, setDirection] = useState<CounterDirection>(COUNTER_DIRECTION_VALUES.IDLE);

  // Calculate animation direction - stored in state to allow render-time access
  useEffect(() => {
    if (value > previousValueRef.current) {
      setDirection(COUNTER_DIRECTION_VALUES.UP);
    } else if (value < previousValueRef.current) {
      setDirection(COUNTER_DIRECTION_VALUES.DOWN);
    }
    previousValueRef.current = value;
  }, [value]);

  // For users who prefer reduced motion, update instantly
  useEffect(() => {
    if (!shouldAnimate) {
      displayValueRef.current = value;
      // Defer state update to avoid cascading renders per React docs
      const rafId = requestAnimationFrame(() => {
        setDisplayValue(value);
      });
      return () => cancelAnimationFrame(rafId);
    }

    // Simple interpolation for animated version
    const startValue = displayValueRef.current;
    const endValue = value;
    const startTime = performance.now();
    const adjustedDuration = getDuration(duration * TIME_UNITS.MS_PER_SECOND);

    if (adjustedDuration === 0) {
      displayValueRef.current = endValue;
      const rafId = requestAnimationFrame(() => {
        setDisplayValue(endValue);
      });
      return () => cancelAnimationFrame(rafId);
    }

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / adjustedDuration, 1);

      // Ease out cubic for natural feel
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const currentValue = startValue + (endValue - startValue) * easeOut;

      setDisplayValue(currentValue);
      displayValueRef.current = currentValue;

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    const rafId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafId);
  }, [value, shouldAnimate, getDuration, duration]);

  return (
    <motion.span
      className={`tabular-nums ${className}`}
      data-direction={direction}
      data-value={value}
      initial={false}
      animate={
        shouldAnimate && direction !== COUNTER_DIRECTION_VALUES.IDLE
          ? {
              scale: [1, 1.1, 1],
              color:
                direction === COUNTER_DIRECTION_VALUES.UP
                  ? ["inherit", ANIMATION_COLORS.POSITIVE, "inherit"]
                  : ["inherit", ANIMATION_COLORS.NEGATIVE, "inherit"],
            }
          : {}
      }
      transition={{
        duration: ANIMATION.MEDIUM,
        ease: EASING.easeOut,
      }}
      // The count-up is a purely visual flourish: its text is rewritten on every
      // animation frame (~60 updates/sec), so exposing it as an aria-live region
      // would make screen readers announce a stream of intermediate values (or
      // garble the announcement entirely). The authoritative value is announced
      // once via the dedicated role="status" announcer in StepGenerating, so this
      // animated span is hidden from assistive technology.
      aria-hidden="true"
    >
      {format(displayValue)}
    </motion.span>
  );
}

export const AnimatedNumber = memo(AnimatedNumberComponent);

interface AnimatedCounterProps {
  value: number;
  label?: string;
  className?: string;
  valueClassName?: string;
  labelClassName?: string;
  format?: (value: number) => string;
  duration?: number;
  icon?: React.ReactNode;
}

/**
 * AnimatedCounter - A card-style counter with icon, value, and label
 *
 * Perfect for stats, progress indicators, and live metrics.
 * Includes a subtle pulse animation when values change.
 */
function AnimatedCounterComponent({
  value,
  label,
  className = "",
  valueClassName = "",
  labelClassName = "",
  format,
  duration = ANIMATION.NUMBER_COUNTER,
  icon,
}: AnimatedCounterProps) {
  const { shouldAnimate } = useReducedMotionContext();
  const previousValueRef = useRef(value);
  const [pulseKey, setPulseKey] = useState(0);

  // Use callback to handle value changes without synchronous setState in effect
  const handleValueChange = useCallback(() => {
    if (value !== previousValueRef.current) {
      previousValueRef.current = value;
      if (shouldAnimate) {
        setPulseKey((prev) => prev + 1);
      }
    }
  }, [value, shouldAnimate]);

  // Schedule the value change check
  useEffect(() => {
    const timeoutId = setTimeout(handleValueChange, 0);
    return () => clearTimeout(timeoutId);
  }, [handleValueChange]);

  return (
    <motion.div
      key={pulseKey}
      className={`glass-card px-6 py-4 ${className}`}
      data-state={pulseKey > 0 ? "active" : "idle"}
      data-value={value}
      initial={false}
      animate={
        shouldAnimate && pulseKey > 0
          ? {
              boxShadow: [...COUNTER_ANIMATION.BOX_SHADOWS],
            }
          : {}
      }
      transition={{ duration: ANIMATION.PULSE }}
    >
      <div className="flex items-center gap-3">
        {icon && (
          <motion.div
            animate={
              shouldAnimate && pulseKey > 0 ? { scale: [1, 1.2, 1], rotate: [0, 10, -10, 0] } : {}
            }
            transition={{ duration: ANIMATION.MEDIUM_SLOW }}
          >
            {icon}
          </motion.div>
        )}
        <div className="text-center">
          <div className={`text-2xl font-bold ${CSS_CLASSES.TEXT_GRADIENT} ${valueClassName}`}>
            <AnimatedNumber value={value} format={format} duration={duration} />
          </div>
          {label && <div className={`text-sm text-dark-400 ${labelClassName}`}>{label}</div>}
        </div>
      </div>
    </motion.div>
  );
}

export const AnimatedCounter = memo(AnimatedCounterComponent);

export default AnimatedNumber;
