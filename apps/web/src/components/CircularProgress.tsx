/**
 * @fileoverview Circular progress indicator component with animated stroke.
 *
 * This component provides a circular progress indicator with:
 * - Animated SVG stroke showing progress
 * - Optional percentage display
 * - Customizable colors and sizes
 * - Accessibility support with ARIA attributes
 *
 * @module components/CircularProgress
 */

import { memo } from "react";
import { motion } from "framer-motion";
import { PROGRESS_COLORS } from "../config/constants";

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
 * // Custom colors
 * <CircularProgress value={100} color="#10B981" trackColor="#1F2937" />
 */

function CircularProgressComponent({
  value,
  size = 40,
  strokeWidth = 3,
  animationDuration = 0.8,
  className = "",
  showPercentage = false,
  color = PROGRESS_COLORS.ACTIVE,
  trackColor = "rgb(255_255_255/0.1)",
  ariaLabel,
}: CircularProgressProps): JSX.Element {
  const clampedValue = Math.max(0, Math.min(100, value));
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const center = size / 2;
  const strokeDashoffset = circumference - (clampedValue / 100) * circumference;

  return (
    <div
      className={`relative inline-flex items-center justify-center ${className}`}
      style={{ width: size, height: size }}
      role="progressbar"
      aria-valuenow={Math.round(clampedValue)}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={ariaLabel ?? `${Math.round(clampedValue)}% complete`}
    >
      <svg
        width={size}
        height={size}
        className="-rotate-90"
        style={{ transform: "rotate(-90deg)" }}
      >
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke={trackColor}
          strokeWidth={strokeWidth}
          opacity={0.3}
        />

        <motion.circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{
            type: "spring",
            stiffness: 100,
            damping: 20,
            duration: animationDuration,
          }}
        />
      </svg>

      {showPercentage && (
        <motion.span
          className="absolute text-xs font-semibold tabular-nums"
          style={{ color }}
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.3 }}
          aria-hidden="true"
        >
          {Math.round(clampedValue)}%
        </motion.span>
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
}: Omit<
  CircularProgressProps,
  "showPercentage" | "animationDuration" | "ariaLabel"
>): JSX.Element {
  return (
    <CircularProgress
      value={value}
      size={size}
      strokeWidth={strokeWidth}
      color={color}
      className={className}
      showPercentage={false}
      animationDuration={0.4}
    />
  );
}

export const CircularProgressCompact = memo(CircularProgressCompactComponent);

export default CircularProgress;
