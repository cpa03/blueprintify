import { memo } from "react";
import { motion } from "framer-motion";

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

function CircularProgressComponent({
  value,
  size = 40,
  strokeWidth = 3,
  animationDuration = 0.8,
  className = "",
  showPercentage = false,
  color = "rgb(99, 102, 241)",
  trackColor = "rgba(255, 255, 255, 0.1)",
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
  color = "rgb(99, 102, 241)",
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
