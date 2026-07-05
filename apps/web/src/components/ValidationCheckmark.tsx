import { memo } from "react";
import * as motion from "framer-motion/m";
import { AnimatePresence } from "framer-motion";
import { ANIMATION_TIMING } from "../config/theme";
import { ANIMATION, EASING } from "../config/constants";
import { VALIDATION_LABELS } from "../config/constants/validation";

interface ValidationCheckmarkProps {
  isValid: boolean;
  size?: "inline" | "input";
  ariaLabel?: string;
  invalidAriaLabel?: string;
  showInvalid?: boolean;
  className?: string;
}

/**
 * Reusable validation indicator with spring animations.
 * Shows a green checkmark when fields meet validation requirements,
 * and optionally shows a red X when they don't (via showInvalid prop).
 *
 * @example
 * <ValidationCheckmark isValid={projectName.length >= MIN} ariaLabel="Project name is valid" />
 * <ValidationCheckmark isValid={description.length >= MIN} size="input" ariaLabel="Description is valid" />
 * <ValidationCheckmark isValid={name.length >= MIN} showInvalid ariaLabel="Name is valid" invalidAriaLabel="Name needs more characters" />
 */
export const ValidationCheckmark = memo(function ValidationCheckmark({
  isValid,
  size = "inline",
  ariaLabel = VALIDATION_LABELS.FIELD_VALID,
  invalidAriaLabel = VALIDATION_LABELS.FIELD_INVALID,
  showInvalid = false,
  className = "",
}: ValidationCheckmarkProps) {
  const isInline = size === "inline";

  const validClasses = isInline
    ? "w-5 h-5 rounded-full bg-accent-emerald/20 text-accent-emerald"
    : "w-6 h-6 rounded-full bg-accent-emerald/20 flex items-center justify-center";

  const invalidClasses = isInline
    ? "w-5 h-5 rounded-full bg-accent-pink/20 text-accent-pink"
    : "w-6 h-6 rounded-full bg-accent-pink/20 flex items-center justify-center";

  const iconSize = isInline ? "w-3 h-3" : "w-4 h-4";
  const strokeWidth = isInline ? 3 : 2;

  const containerClasses = isInline ? `inline-flex items-center justify-center` : "";

  const shouldShow = isValid || (showInvalid && !isValid);

  return (
    <AnimatePresence>
      {shouldShow && (
        <motion.span
          key={isValid ? "valid" : "invalid"}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0, opacity: 0 }}
          transition={{
            type: "spring",
            ...ANIMATION_TIMING.easing.spring,
          }}
          role="img"
          className={`${containerClasses} ${isValid ? validClasses : invalidClasses} ${className}`}
          aria-label={isValid ? ariaLabel : invalidAriaLabel}
        >
          {isValid ? (
            <svg className={iconSize} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <motion.path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={strokeWidth}
                d="M5 13l4 4L19 7"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={{
                  pathLength: {
                    duration: ANIMATION.CHECKMARK_REVEAL,
                    ease: EASING.easeOut,
                  },
                  opacity: { duration: ANIMATION.QUICK_FADE, ease: EASING.easeOut },
                }}
              />
            </svg>
          ) : (
            <svg className={iconSize} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <motion.path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={strokeWidth}
                d="M6 18L18 6M6 6l12 12"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={{
                  pathLength: {
                    duration: ANIMATION.CHECKMARK_REVEAL,
                    ease: EASING.easeOut,
                  },
                  opacity: { duration: ANIMATION.QUICK_FADE, ease: EASING.easeOut },
                }}
              />
            </svg>
          )}
        </motion.span>
      )}
    </AnimatePresence>
  );
});
