import { memo } from "react";
import * as motion from "framer-motion/m";
import { AnimatePresence } from "framer-motion";
import { FRAMER_TYPE, VALIDATION_STATE_VALUES } from "@blueprint/shared";
import { ANIMATION_TIMING } from "../config/theme";
import { ANIMATION, EASING } from "../config/constants";
import { VALIDATION_LABELS } from "../config/constants/validation";
import { useReducedMotion } from "../hooks/useReducedMotion";
import { Icon } from "./Icon";
import { SVG_ICON_DEFAULTS } from "@blueprint/shared/config";

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
  // Respect prefers-reduced-motion (WCAG 2.3.3): the springy pop-in and the
  // checkmark draw-on are purely decorative, so they are skipped for
  // vestibular-sensitive users. State colors, labels, and DOM state
  // attributes stay fully functional.
  const shouldReduceMotion = useReducedMotion();
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
          key={isValid ? VALIDATION_STATE_VALUES.VALID : VALIDATION_STATE_VALUES.INVALID}
          initial={shouldReduceMotion ? { opacity: 0 } : { scale: 0, opacity: 0 }}
          animate={shouldReduceMotion ? { opacity: 1 } : { scale: 1, opacity: 1 }}
          exit={shouldReduceMotion ? { opacity: 0 } : { scale: 0, opacity: 0 }}
          transition={
            shouldReduceMotion
              ? { duration: ANIMATION.QUICK_FADE }
              : {
                  type: FRAMER_TYPE.SPRING,
                  ...ANIMATION_TIMING.easing.spring,
                }
          }
          role="img"
          className={`${containerClasses} ${isValid ? validClasses : invalidClasses} ${className}`}
          aria-label={isValid ? ariaLabel : invalidAriaLabel}
          data-state={isValid ? VALIDATION_STATE_VALUES.VALID : VALIDATION_STATE_VALUES.INVALID}
          data-size={size}
          data-show-invalid={showInvalid}
          data-reduced-motion={shouldReduceMotion ? "true" : "false"}
          title={isValid ? ariaLabel : invalidAriaLabel}
        >
          {isValid ? (
            <svg
              className={iconSize}
              fill="none"
              stroke="currentColor"
              viewBox={SVG_ICON_DEFAULTS.VIEW_BOX}
            >
              <motion.path
                strokeLinecap={SVG_ICON_DEFAULTS.STROKE_LINECAP_ROUND}
                strokeLinejoin={SVG_ICON_DEFAULTS.STROKE_LINEJOIN_ROUND}
                strokeWidth={strokeWidth}
                d="M5 13l4 4L19 7"
                initial={shouldReduceMotion ? { opacity: 1 } : { pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={
                  shouldReduceMotion
                    ? { duration: 0 }
                    : {
                        pathLength: {
                          duration: ANIMATION.CHECKMARK_REVEAL,
                          ease: EASING.easeOut,
                        },
                        opacity: { duration: ANIMATION.QUICK_FADE, ease: EASING.easeOut },
                      }
                }
              />
            </svg>
          ) : (
            <Icon name="close" className={iconSize} strokeWidth={strokeWidth} />
          )}
        </motion.span>
      )}
    </AnimatePresence>
  );
});
