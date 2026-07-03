/**
 * @fileoverview Circular progress indicator component with animated stroke.
 *
 * This component provides a circular progress indicator with:
 * - Animated SVG stroke showing progress
 * - Optional mount animation (draws from 0 to value on first render)
 * - Optional percentage display
 * - Customizable colors and sizes
 * - Accessibility support with ARIA attributes
 *
 * @module components/CircularProgress
 */

import { memo, useState, useEffect, useRef } from "react";
import {
  PROGRESS_COLORS,
  PROGRESS_TRACK_COLOR,
  SVG_TRANSITION,
  ANIMATION,
  ACCESSIBILITY_LABELS,
} from "../config/constants";
import { UI_TIMEOUTS } from "@blueprint/shared";
import { TRANSFORMS, OPACITY } from "../config/theme";

/**
 * Props for the CircularProgress component.
 */

interface CircularProgressProps {
  value: number;
  size?: number;
  strokeWidth?: number;
  animationDuration?: number;
  className?: string;
  showPercentage?: boolean;
  color?: string;
  trackColor?: string;
  ariaLabel?: string;
  /**
   * When true, the ring smoothly draws from 0 to the current value on first mount.
   * Useful for stepped entrance animations (e.g., StepIndicator) where the progress
   * ring should "fill in" as it enters rather than snapping to position.
   * @default false
   */
  animateOnMount?: boolean;
  /**
   * Delay in milliseconds before the mount draw-in animation begins.
   * Allows the ring to start drawing after parent entrance animations (fade, slide)
   * have already begun, creating a polished cascade effect.
   * @default 0
   */
  mountAnimationDelayMs?: number;
}

/**
 * Circular progress indicator with animated SVG stroke.
 *
 * @param props - Component props
 * @param props.value - Progress value (0-100)
 * @param props.size - Diameter of the circle in pixels (default: 40)
 * @param props.strokeWidth - Width of the progress stroke (default: 3)
 * @param props.animationDuration - Animation duration in seconds (default: 0.8)
 * @param props.className - Additional CSS classes
 * @param props.showPercentage - Whether to show percentage text (default: false)
 * @param props.color - Progress stroke color (default: primary active color)
 * @param props.trackColor - Background track color (default: transparent white)
 * @param props.ariaLabel - Custom accessibility label
 * @param props.animateOnMount - Whether to draw the ring from 0 to value on first mount
 * @param props.mountAnimationDelayMs - Delay in ms before mount animation starts
 * @returns The rendered circular progress indicator
 *
 * @example
 * // Basic usage
 * <CircularProgress value={50} />
 *
 * @example
 * // With percentage display
 * <CircularProgress value={75} showPercentage={true} size={60} />
 *
 * @example
 * // With mount animation
 * <CircularProgress value={50} animateOnMount mountAnimationDelayMs={300} />
 */

function CircularProgressComponent({
  value,
  size = 40,
  strokeWidth = 3,
  className = "",
  showPercentage = false,
  color = PROGRESS_COLORS.ACTIVE,
  trackColor = PROGRESS_TRACK_COLOR,
  ariaLabel,
  animateOnMount = false,
  mountAnimationDelayMs = 0,
}: CircularProgressProps): JSX.Element {
  const clampedValue = Math.max(0, Math.min(100, value));
  const isComplete = clampedValue >= 100;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const center = size / 2;

  // One-shot celebration animation when progress first reaches 100%.
  // The ref gates it so the satisfying scale-bounce only fires once per
  // completion lifecycle, complementing the persistent circular-complete-glow.
  const wasCompleteRef = useRef(false);
  const [celebrating, setCelebrating] = useState(false);

  useEffect(() => {
    if (isComplete && !wasCompleteRef.current) {
      wasCompleteRef.current = true;
      setCelebrating(true);
      const timer = setTimeout(() => setCelebrating(false), UI_TIMEOUTS.CELEBRATION_DISMISS_MS);
      return () => clearTimeout(timer);
    }
    if (!isComplete) {
      wasCompleteRef.current = false;
    }
  }, [isComplete]);

  // Mount draw-in animation: start at 0, then after delay, transition to the
  // real value via the CSS stroke-dashoffset transition. The ref gates the
  // delay so it only fires once on initial mount; subsequent value changes
  // sync immediately for responsive step navigation.
  const [animatedValue, setAnimatedValue] = useState(() => (animateOnMount ? 0 : clampedValue));
  const mountAnimationDone = useRef(!animateOnMount);

  useEffect(() => {
    if (mountAnimationDone.current) {
      // Normal updates: sync immediately — CSS transition handles the smooth
      // animated stroke between old and new values.
      setAnimatedValue(clampedValue);
    } else {
      // First mount: animate from 0 to the actual value after the configured
      // delay, producing a polished draw-in effect.
      mountAnimationDone.current = true;
      const timer = setTimeout(() => {
        setAnimatedValue(clampedValue);
      }, mountAnimationDelayMs);
      return () => clearTimeout(timer);
    }
    // Only re-sync when the clamped value changes — the ref is stable.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clampedValue]);

  const strokeDashoffset = circumference - (animatedValue / 100) * circumference;

  return (
    <div
      className={`relative inline-flex items-center justify-center ${isComplete ? "circular-complete-glow" : ""} ${celebrating ? "circular-complete-celebration" : ""} ${className}`}
      style={{ width: size, height: size, "--glow-color": color } as React.CSSProperties}
      role="progressbar"
      aria-valuenow={Math.round(animatedValue)}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={ariaLabel ?? ACCESSIBILITY_LABELS.PROGRESS.PERCENT_COMPLETE(clampedValue)}
    >
      <svg
        width={size}
        height={size}
        className="-rotate-90"
        style={{ transform: TRANSFORMS.ROTATE_NEG_90 }}
        aria-hidden="true"
      >
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke={trackColor}
          strokeWidth={strokeWidth}
          opacity={OPACITY[30]}
        />

        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          style={{
            strokeDashoffset,
            transitionProperty: "stroke-dashoffset, stroke",
            transitionDuration: `${SVG_TRANSITION.STROKE_DASHOFFSET_DURATION_MS}ms, ${SVG_TRANSITION.STROKE_COLOR_TRANSITION_S}s`,
            transitionTimingFunction: SVG_TRANSITION.STROKE_TIMING,
          }}
        />
      </svg>

      {showPercentage && (
        <span
          className="absolute text-xs font-semibold tabular-nums animate-fade-in"
          style={{ color }}
          aria-hidden="true"
        >
          {Math.round(clampedValue)}%
        </span>
      )}
    </div>
  );
}

export const CircularProgress = memo(CircularProgressComponent);

function CircularProgressCompactComponent({
  value,
  size = 16,
  strokeWidth = 2,
  color = PROGRESS_COLORS.ACTIVE,
  className = "",
}: Omit<CircularProgressProps, "showPercentage" | "animationDuration" | "ariaLabel">): JSX.Element {
  return (
    <CircularProgress
      value={value}
      size={size}
      strokeWidth={strokeWidth}
      color={color}
      className={className}
      showPercentage={false}
      animationDuration={ANIMATION.MEDIUM_SLOW}
    />
  );
}

export const CircularProgressCompact = memo(CircularProgressCompactComponent);

export default CircularProgress;
