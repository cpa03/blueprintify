import { useEffect, useRef, useState, useCallback, memo } from "react";
import { motion, useSpring, MotionValue } from "framer-motion";
import { useReducedMotionContext } from "../context/ReducedMotionContext";
import { ANIMATION_COLORS } from "../config/constants";

interface AnimatedNumberProps {
  value: number;
  className?: string;
  duration?: number;
  format?: (value: number) => string;
}

/**
 * AnimatedNumber - A delightful number counter with spring physics
 *
 * Features:
 * - Smooth spring-based transitions between values
 * - Respects prefers-reduced-motion for accessibility
 * - Customizable formatting (currency, percentage, etc.)
 * - Direction-aware animations (count up vs count down)
 *
 * Micro-UX touches:
 * - Numbers "spring" to their new value naturally
 * - Reduced motion users see instant updates
 * - Tabular nums prevent layout shift during animation
 */
function AnimatedNumberComponent({
  value,
  className = "",
  duration = 0.8,
  format = (v) => Math.round(v).toString(),
}: AnimatedNumberProps) {
  const { shouldAnimate, getDuration } = useReducedMotionContext();
  const [displayValue, setDisplayValue] = useState(value);
  const displayValueRef = useRef(value);
  const previousValueRef = useRef(value);
  const [direction, setDirection] = useState<"up" | "down" | null>(null);

  // Calculate animation direction - stored in state to allow render-time access
  useEffect(() => {
    if (value > previousValueRef.current) {
      setDirection("up");
    } else if (value < previousValueRef.current) {
      setDirection("down");
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
    const adjustedDuration = getDuration(duration * 1000);

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
      initial={false}
      animate={
        shouldAnimate && direction
          ? {
              scale: [1, 1.1, 1],
              color:
                direction === "up"
                  ? ["inherit", ANIMATION_COLORS.POSITIVE, "inherit"]
                  : ["inherit", ANIMATION_COLORS.NEGATIVE, "inherit"],
            }
          : {}
      }
      transition={{
        duration: 0.3,
        ease: "easeOut",
      }}
      aria-live="polite"
      aria-atomic="true"
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
  duration = 0.8,
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
      initial={false}
      animate={
        shouldAnimate && pulseKey > 0
          ? {
              boxShadow: [
                "0 0 0 0 rgb(99 102 241 / 0)",
                "0 0 20px 4px rgb(99 102 241 / 0.3)",
                "0 0 0 0 rgb(99 102 241 / 0)",
              ],
            }
          : {}
      }
      transition={{ duration: 0.6 }}
    >
      <div className="flex items-center gap-3">
        {icon && (
          <motion.div
            animate={
              shouldAnimate && pulseKey > 0 ? { scale: [1, 1.2, 1], rotate: [0, 10, -10, 0] } : {}
            }
            transition={{ duration: 0.4 }}
          >
            {icon}
          </motion.div>
        )}
        <div className="text-center">
          <div className={`text-2xl font-bold text-gradient ${valueClassName}`}>
            <AnimatedNumber value={value} format={format} duration={duration} />
          </div>
          {label && <div className={`text-sm text-dark-400 ${labelClassName}`}>{label}</div>}
        </div>
      </div>
    </motion.div>
  );
}

export const AnimatedCounter = memo(AnimatedCounterComponent);

/**
 * useAnimatedValue - Hook for tracking animated values
 *
 * Returns a MotionValue that can be used with other framer-motion
 * components for complex animations.
 */
export function useAnimatedValue(
  value: number,
  options: { duration?: number; bounce?: number } = {}
): MotionValue<number> {
  const { getDuration } = useReducedMotionContext();
  const springValue = useSpring(value, {
    duration: getDuration((options.duration || 0.8) * 1000),
    bounce: options.bounce || 0,
  });

  useEffect(() => {
    springValue.set(value);
  }, [value, springValue]);

  return springValue;
}

export default AnimatedNumber;
