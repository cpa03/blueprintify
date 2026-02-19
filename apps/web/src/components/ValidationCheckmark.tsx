import { memo } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ANIMATION_TIMING } from "../config/theme";

interface ValidationCheckmarkProps {
  isValid: boolean;
  size?: "inline" | "input";
  ariaLabel?: string;
  className?: string;
}

/**
 * Reusable validation checkmark with spring animation.
 * Indicates when form fields meet validation requirements.
 *
 * @example
 * <ValidationCheckmark isValid={projectName.length >= MIN} ariaLabel="Project name is valid" />
 * <ValidationCheckmark isValid={description.length >= MIN} size="input" ariaLabel="Description is valid" />
 */
export const ValidationCheckmark = memo(function ValidationCheckmark({
  isValid,
  size = "inline",
  ariaLabel = "Field is valid",
  className = "",
}: ValidationCheckmarkProps) {
  const isInline = size === "inline";

  const sizeClasses = isInline
    ? "w-5 h-5 rounded-full bg-accent-emerald/20 text-accent-emerald"
    : "w-6 h-6 rounded-full bg-accent-emerald/20 flex items-center justify-center";

  const iconSize = isInline ? "w-3 h-3" : "w-4 h-4";
  const strokeWidth = isInline ? 3 : 2;

  const containerClasses = isInline
    ? `inline-flex items-center justify-center ${sizeClasses}`
    : sizeClasses;

  return (
    <AnimatePresence>
      {isValid && (
        <motion.span
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0, opacity: 0 }}
          transition={{
            type: "spring",
            ...ANIMATION_TIMING.easing.spring,
          }}
          className={`${containerClasses} ${className}`}
          aria-label={ariaLabel}
        >
          <svg
            className={iconSize}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={strokeWidth}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </motion.span>
      )}
    </AnimatePresence>
  );
});
