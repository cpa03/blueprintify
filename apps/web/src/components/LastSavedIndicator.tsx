/**
 * @fileoverview Last saved indicator component showing save status.
 *
 * This component displays:
 * - Saved status with checkmark icon
 * - Unsaved changes indicator with pulsing dot
 * - Animated transitions between states
 * - Accessibility support with aria-live
 *
 * @module components/LastSavedIndicator
 */

import React from "react";
import * as motion from "framer-motion/m";
import { AnimatePresence } from "framer-motion";
import { SPRING_CONFIG, ANIMATION, EASING } from "../config/constants";
import {
  ANIMATION_DEFAULTS,
  ANIMATION_ENTRANCE_DELAYS,
  ARIA_ATOMIC_VALUES,
  ARIA_HIDDEN_VALUES,
  ARIA_LIVE_VALUES,
  ARIA_ROLES,
  FRAMER_TYPE,
  SAVE_STATE_VALUES,
  UI_TIMEOUTS,
} from "@blueprint/shared/config";
import { useReducedMotion } from "../hooks/useReducedMotion";
import { SVG_ICON_DEFAULTS } from "@blueprint/shared/config";

/**
 * Props for the LastSavedIndicator component.
 */

interface LastSavedIndicatorProps {
  text: string;
  isVisible: boolean;
  hasChanges?: boolean;
}

/**
 * Indicator showing the last saved timestamp or unsaved changes status.
 * Displays a checkmark with the saved text or a pulsing dot for unsaved changes.
 *
 * @param props - Component props
 * @param props.text - Text to display when content is saved (e.g., "Last saved: 2:30 PM")
 * @param props.isVisible - Whether the indicator should be visible
 * @param props.hasChanges - Whether there are unsaved changes (default: false)
 * @returns The rendered save status indicator
 *
 * @example
 * // Saved state
 * <LastSavedIndicator text="Last saved: 2:30 PM" isVisible={true} hasChanges={false} />
 *
 * @example
 * // Unsaved changes state
 * <LastSavedIndicator text="Last saved: 2:30 PM" isVisible={true} hasChanges={true} />
 */

export const LastSavedIndicator = React.memo(function LastSavedIndicator({
  text,
  isVisible,
  hasChanges = false,
}: LastSavedIndicatorProps) {
  const [showSavedGlow, setShowSavedGlow] = React.useState(false);
  const prevHasChangesRef = React.useRef(hasChanges);
  const shouldReduceMotion = useReducedMotion();

  // Trigger a brief green glow pulse when transitioning from unsaved→saved,
  // giving users a satisfying "you're safe!" confirmation that auto-save
  // has completed. The glow fires once per save cycle and auto-clears.
  React.useEffect(() => {
    const prevHasChanges = prevHasChangesRef.current;
    prevHasChangesRef.current = hasChanges;

    if (prevHasChanges && !hasChanges) {
      setShowSavedGlow(true);
      const timer = setTimeout(() => setShowSavedGlow(false), UI_TIMEOUTS.SAVED_GLOW_MS);
      return () => clearTimeout(timer);
    }
  }, [hasChanges]);

  const statusText = hasChanges ? "Unsaved changes" : text;

  return (
    <AnimatePresence mode="wait">
      {isVisible && (
        // Persistent live region: must exist in the DOM before its text
        // changes, otherwise screen readers routinely skip the announcement.
        // The inner animated div remounts on every state flip (key change),
        // so it cannot serve as a reliable live region itself — the same
        // pitfall documented in HeadingAnchor.
        <div
          role={ARIA_ROLES.STATUS}
          aria-live={ARIA_LIVE_VALUES.POLITE}
          aria-atomic={ARIA_ATOMIC_VALUES.TRUE}
          data-reduced-motion={shouldReduceMotion}
        >
          <motion.div
            key={hasChanges ? "unsaved" : "saved"}
            initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: -5 }}
            transition={
              shouldReduceMotion
                ? ANIMATION_DEFAULTS.ZERO_DURATION
                : { duration: ANIMATION.NORMAL, ease: EASING.easeOut }
            }
            className={`flex items-center gap-2 text-xs ${
              hasChanges ? "text-amber-400" : "text-dark-400"
            }`}
            data-state={hasChanges ? SAVE_STATE_VALUES.UNSAVED : SAVE_STATE_VALUES.SAVED}
            data-has-changes={hasChanges}
            data-reduced-motion={shouldReduceMotion}
            title={statusText}
          >
            {hasChanges ? (
              <>
                <motion.span
                  className="relative flex h-2 w-2"
                  initial={shouldReduceMotion ? { scale: 1 } : { scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={
                    shouldReduceMotion
                      ? ANIMATION_DEFAULTS.ZERO_DURATION
                      : { type: FRAMER_TYPE.SPRING, ...SPRING_CONFIG.SNAPPY }
                  }
                >
                  {!shouldReduceMotion && (
                    <motion.span
                      className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"
                      initial={{ scale: 0.8 }}
                      animate={{ scale: 1.5, opacity: 0 }}
                      transition={{
                        duration: ANIMATION.GENTLE_PULSE,
                        repeat: Infinity,
                        ease: EASING.easeOut,
                      }}
                    />
                  )}
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500" />
                </motion.span>
                <span className="font-medium">Unsaved changes</span>
              </>
            ) : (
              <>
                <motion.span
                  className={`relative flex h-3.5 w-3.5 items-center justify-center flex-shrink-0 ${showSavedGlow ? "saved-celebration-glow" : ""}`}
                >
                  <motion.svg
                    className="w-3.5 h-3.5 text-accent-emerald"
                    fill="none"
                    stroke="currentColor"
                    viewBox={SVG_ICON_DEFAULTS.VIEW_BOX}
                    aria-hidden={ARIA_HIDDEN_VALUES.TRUE}
                    initial={shouldReduceMotion ? { scale: 1 } : { scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={
                      shouldReduceMotion
                        ? ANIMATION_DEFAULTS.ZERO_DURATION
                        : {
                            type: FRAMER_TYPE.SPRING,
                            ...SPRING_CONFIG.CHECKMARK_ICON,
                          }
                    }
                  >
                    <motion.path
                      strokeLinecap={SVG_ICON_DEFAULTS.STROKE_LINECAP_ROUND}
                      strokeLinejoin={SVG_ICON_DEFAULTS.STROKE_LINEJOIN_ROUND}
                      strokeWidth={SVG_ICON_DEFAULTS.STROKE_WIDTH_DEFAULT}
                      d="M5 13l4 4L19 7"
                      initial={
                        shouldReduceMotion
                          ? { pathLength: 1, opacity: 1 }
                          : { pathLength: 0, opacity: 0 }
                      }
                      animate={{ pathLength: 1, opacity: 1 }}
                      transition={
                        shouldReduceMotion
                          ? ANIMATION_DEFAULTS.ZERO_DURATION
                          : {
                              pathLength: {
                                type: FRAMER_TYPE.SPRING,
                                ...SPRING_CONFIG.DEFAULT,
                                delay: ANIMATION_ENTRANCE_DELAYS.VERY_FAST,
                              },
                              opacity: {
                                duration: ANIMATION.QUICK_FADE,
                                delay: ANIMATION_ENTRANCE_DELAYS.VERY_FAST,
                              },
                            }
                      }
                    />
                  </motion.svg>
                </motion.span>
                <motion.span
                  initial={shouldReduceMotion ? { opacity: 1, x: 0 } : { opacity: 0, x: -4 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={
                    shouldReduceMotion
                      ? ANIMATION_DEFAULTS.ZERO_DURATION
                      : {
                          duration: ANIMATION.NORMAL,
                          delay: ANIMATION_ENTRANCE_DELAYS.FAST,
                          ease: EASING.easeOut,
                        }
                  }
                >
                  {text}
                </motion.span>
              </>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
});
