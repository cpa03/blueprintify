/**
 * @fileoverview Error fallback UI with framer-motion animations.
 *
 * This component is intentionally separated from ErrorBoundary.tsx so that
 * framer-motion (138 kB / 46 kB gzip) is only loaded when an error actually
 * occurs, not on the critical path. ErrorBoundary.tsx lazy-loads this module.
 *
 * @module components/ErrorFallback
 */

import { memo, useState, useCallback } from "react";
import * as motion from "framer-motion/m";
import { AnimatePresence } from "framer-motion";
import { ANIMATION_SCALE, ANIMATION_Y_OFFSET } from "@blueprint/shared";
import { FallbackProps } from "react-error-boundary";
import { useReducedMotion } from "../hooks/useReducedMotion";
import {
  SPRING_CONFIG,
  ANIMATION,
  EASING,
  TIMEOUTS,
  HOVER_SCALE,
  TAP_SCALE,
  STAGGER_CONFIG,
  SCALE_PULSE,
  OPACITY_PULSE,
  ENTRANCE_OFFSETS,
  FOCUS_ANNOUNCER,
} from "../config/constants";
import {
  ANIMATION_ENTRANCE_DELAYS,
  ANIMATION_REPEAT,
  ARIA_ATOMIC_VALUES,
  ARIA_HIDDEN_VALUES,
  ARIA_LIVE_VALUES,
  ARIA_ROLES,
  COPY_STATE_VALUES,
  FRAMER_TYPE,
} from "@blueprint/shared/config";
import { ACCESSIBILITY_LABELS, ERROR_BOUNDARY_TEXT } from "../config/constants/content";
import { copyToClipboard } from "../lib/clipboard";
import { SVG_ICON_DEFAULTS, ICON_PATHS } from "@blueprint/shared/config";

/**
 * Staggered entrance variants for the fallback UI elements.
 * Each child enters with a small delay, creating a polished cascade.
 */
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: STAGGER_CONFIG.ERROR_FALLBACK.STAGGER_S,
      delayChildren: STAGGER_CONFIG.ERROR_FALLBACK.DELAY_CHILDREN_S,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: ANIMATION_Y_OFFSET.DROP_MODERATE },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: FRAMER_TYPE.SPRING,
      ...SPRING_CONFIG.SNAPPY,
    },
  },
};

/**
 * Error fallback UI rendered when a child component throws.
 * Provides a calming, animated recovery interface.
 */
export const ErrorFallback = memo(function ErrorFallback({
  error,
  resetErrorBoundary,
}: FallbackProps): JSX.Element {
  const shouldReduceMotion = useReducedMotion();
  const [isCopied, setIsCopied] = useState(false);
  const [copyFailed, setIsCopyFailed] = useState(false);

  const handleReload = (): void => {
    window.location.reload();
  };

  const errorMessage = error instanceof Error ? error.message : ERROR_BOUNDARY_TEXT.UNKNOWN_ERROR;

  const handleCopyError = useCallback(async (): Promise<void> => {
    const success = await copyToClipboard(errorMessage);
    if (success) {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), TIMEOUTS.COPY_FEEDBACK);
    } else {
      setIsCopyFailed(true);
      setTimeout(() => setIsCopyFailed(false), TIMEOUTS.COPY_FEEDBACK);
    }
  }, [errorMessage]);

  const cardSpring = shouldReduceMotion
    ? {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        transition: { duration: ANIMATION.NORMAL },
      }
    : {
        initial: { opacity: 0, scale: ANIMATION_SCALE.SUBTLE, y: ANIMATION_Y_OFFSET.DROP_LARGE },
        animate: { opacity: 1, scale: 1, y: 0 },
        transition: {
          type: FRAMER_TYPE.SPRING,
          ...SPRING_CONFIG.GENTLE,
        },
      };

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-dark-900 p-4"
      role={ARIA_ROLES.ALERT}
      aria-live={ARIA_LIVE_VALUES.ASSERTIVE}
      data-has-error={error !== undefined ? "true" : "false"}
      data-reduced-motion={shouldReduceMotion ? "true" : "false"}
      data-has-details={error !== undefined ? "true" : "false"}
    >
      <motion.div
        className="glass-card p-8 max-w-md w-full text-center relative overflow-hidden"
        {...cardSpring}
      >
        {/* Subtle gradient accent line at the top */}
        <div
          className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-accent-pink/60 via-accent-pink/40 to-transparent"
          aria-hidden={ARIA_HIDDEN_VALUES.TRUE}
        />

        <motion.div
          className="space-y-6"
          variants={shouldReduceMotion ? undefined : containerVariants}
          initial={shouldReduceMotion ? undefined : "hidden"}
          animate={shouldReduceMotion ? undefined : "visible"}
        >
          {/* Animated warning icon */}
          <motion.div className="mb-6" variants={shouldReduceMotion ? undefined : itemVariants}>
            <motion.div
              className="w-20 h-20 mx-auto rounded-2xl bg-accent-pink/15 flex items-center justify-center relative"
              animate={
                shouldReduceMotion
                  ? {}
                  : {
                      scale: SCALE_PULSE.ERROR_ICON,
                    }
              }
              transition={{
                duration: ANIMATION.SLOW_PULSE,
                repeat: ANIMATION_REPEAT.INFINITE,
                ease: EASING.easeInOut,
              }}
            >
              {/* Soft glow behind the icon */}
              <motion.div
                className="absolute inset-0 rounded-2xl bg-accent-pink/10 blur-xl"
                animate={
                  shouldReduceMotion
                    ? {}
                    : {
                        scale: SCALE_PULSE.GLOW,
                        opacity: OPACITY_PULSE.GLOW,
                      }
                }
                transition={{
                  duration: ANIMATION.BREATH,
                  repeat: ANIMATION_REPEAT.INFINITE,
                  ease: EASING.easeInOut,
                }}
                aria-hidden={ARIA_HIDDEN_VALUES.TRUE}
              />
              <svg
                className="w-10 h-10 text-accent-pink relative z-10"
                fill={SVG_ICON_DEFAULTS.FILL_NONE}
                stroke={SVG_ICON_DEFAULTS.STROKE_CURRENT}
                viewBox={SVG_ICON_DEFAULTS.VIEW_BOX}
                aria-hidden={ARIA_HIDDEN_VALUES.TRUE}
              >
                <motion.path
                  strokeLinecap={SVG_ICON_DEFAULTS.STROKE_LINECAP_ROUND}
                  strokeLinejoin={SVG_ICON_DEFAULTS.STROKE_LINEJOIN_ROUND}
                  strokeWidth={SVG_ICON_DEFAULTS.STROKE_WIDTH_DEFAULT}
                  d={ICON_PATHS.WARNING}
                  initial={shouldReduceMotion ? undefined : { pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 1 }}
                  transition={{
                    pathLength: {
                      duration: ANIMATION.MEDIUM_SLOW,
                      ease: EASING.easeOut,
                      delay: ANIMATION_ENTRANCE_DELAYS.MODERATE,
                    },
                    opacity: {
                      duration: ANIMATION.QUICK_FADE,
                      delay: ANIMATION_ENTRANCE_DELAYS.MODERATE,
                    },
                  }}
                />
              </svg>
            </motion.div>
          </motion.div>

          {/* Title */}
          <motion.h1
            className="text-2xl font-bold text-white"
            variants={shouldReduceMotion ? undefined : itemVariants}
          >
            {ERROR_BOUNDARY_TEXT.TITLE}
          </motion.h1>

          {/* Description */}
          <motion.p
            className="text-dark-400 leading-relaxed"
            variants={shouldReduceMotion ? undefined : itemVariants}
          >
            {ERROR_BOUNDARY_TEXT.DESCRIPTION}
          </motion.p>

          {/* Error details (collapsible for developers) */}
          {error !== undefined && (
            <motion.details
              className="text-left"
              variants={shouldReduceMotion ? undefined : itemVariants}
            >
              <summary
                className="text-sm text-dark-500 cursor-pointer hover:text-dark-400
                           transition-colors duration-200 select-none
                           focus-visible:outline-none focus-visible:ring-2
                           focus-visible:ring-primary-500/50 rounded px-1 -mx-1 inline-block"
              >
                {ERROR_BOUNDARY_TEXT.VIEW_DETAILS}
              </summary>
              <div className="mt-2 relative">
                <pre className="p-3 bg-dark-800 rounded-lg text-xs text-dark-400 overflow-auto max-h-32 leading-relaxed">
                  {errorMessage}
                </pre>
                {/* Copy error details button — appears inside the details block so
                    developers can quickly copy the error message to report or search.
                    Uses spring animation matching the app's design language. */}
                <motion.button
                  onClick={handleCopyError}
                  initial={false}
                  animate={{
                    opacity: isCopied ? 1 : 0.7,
                    scale: isCopied ? 1.05 : 1,
                  }}
                  whileHover={{ ...HOVER_SCALE.STANDARD, opacity: 1 }}
                  whileTap={TAP_SCALE.STANDARD}
                  transition={{ type: FRAMER_TYPE.SPRING, ...SPRING_CONFIG.SNAPPY }}
                  className="absolute top-2 right-2 flex items-center gap-1 px-2 py-1
                             rounded-md text-2xs font-medium
                             bg-dark-700/80 hover:bg-dark-700
                             text-dark-300 hover:text-white
                             border border-dark-600/50 hover:border-dark-500
                             focus-visible:outline-none focus-visible:ring-2
                             focus-visible:ring-primary-500/50
                             transition-colors duration-150"
                  aria-label={ACCESSIBILITY_LABELS.ERROR_BOUNDARY.COPY_ERROR}
                  data-copy-state={
                    isCopied
                      ? COPY_STATE_VALUES.COPIED
                      : copyFailed
                        ? "failed"
                        : COPY_STATE_VALUES.IDLE
                  }
                >
                  {/* Clipboard icon */}
                  <AnimatePresence mode="wait">
                    {isCopied ? (
                      <motion.span
                        key="copied"
                        initial={{ opacity: 0, scale: ANIMATION_SCALE.POP_IN }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: ANIMATION_SCALE.POP_IN }}
                        className="flex items-center gap-1 text-accent-emerald"
                      >
                        <svg
                          className="w-3 h-3"
                          fill={SVG_ICON_DEFAULTS.FILL_NONE}
                          stroke={SVG_ICON_DEFAULTS.STROKE_CURRENT}
                          viewBox={SVG_ICON_DEFAULTS.VIEW_BOX}
                          aria-hidden={ARIA_HIDDEN_VALUES.TRUE}
                        >
                          <path
                            strokeLinecap={SVG_ICON_DEFAULTS.STROKE_LINECAP_ROUND}
                            strokeLinejoin={SVG_ICON_DEFAULTS.STROKE_LINEJOIN_ROUND}
                            strokeWidth={SVG_ICON_DEFAULTS.STROKE_WIDTH_MEDIUM}
                            d={ICON_PATHS.CHECKMARK}
                          />
                        </svg>
                        <span>{ERROR_BOUNDARY_TEXT.COPIED}</span>
                      </motion.span>
                    ) : copyFailed ? (
                      <motion.span
                        key="failed"
                        initial={{ opacity: 0, scale: ANIMATION_SCALE.POP_IN }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: ANIMATION_SCALE.POP_IN }}
                        className="flex items-center gap-1 text-red-400"
                      >
                        <svg
                          className="w-3 h-3"
                          fill={SVG_ICON_DEFAULTS.FILL_NONE}
                          stroke={SVG_ICON_DEFAULTS.STROKE_CURRENT}
                          viewBox={SVG_ICON_DEFAULTS.VIEW_BOX}
                          aria-hidden={ARIA_HIDDEN_VALUES.TRUE}
                        >
                          <path
                            strokeLinecap={SVG_ICON_DEFAULTS.STROKE_LINECAP_ROUND}
                            strokeLinejoin={SVG_ICON_DEFAULTS.STROKE_LINEJOIN_ROUND}
                            strokeWidth={SVG_ICON_DEFAULTS.STROKE_WIDTH_MEDIUM}
                            d={ICON_PATHS.CLOSE}
                          />
                        </svg>
                        <span>{ERROR_BOUNDARY_TEXT.COPY_FAILED}</span>
                      </motion.span>
                    ) : (
                      <motion.span
                        key="copy"
                        initial={{ opacity: 0, scale: ANIMATION_SCALE.POP_IN }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: ANIMATION_SCALE.POP_IN }}
                        className="flex items-center gap-1"
                      >
                        <svg
                          className="w-3 h-3"
                          fill={SVG_ICON_DEFAULTS.FILL_NONE}
                          stroke={SVG_ICON_DEFAULTS.STROKE_CURRENT}
                          viewBox={SVG_ICON_DEFAULTS.VIEW_BOX}
                          aria-hidden={ARIA_HIDDEN_VALUES.TRUE}
                        >
                          <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                        </svg>
                        <span>{ERROR_BOUNDARY_TEXT.COPY_ERROR}</span>
                      </motion.span>
                    )}
                  </AnimatePresence>
                </motion.button>
              </div>
              {/* Screen reader announcement for copy action */}
              <span
                className={FOCUS_ANNOUNCER.LIVE_REGION_CLASS}
                role={ARIA_ROLES.STATUS}
                aria-live={ARIA_LIVE_VALUES.POLITE}
                aria-atomic={ARIA_ATOMIC_VALUES.TRUE}
              >
                {copyFailed
                  ? ACCESSIBILITY_LABELS.ERROR_BOUNDARY.ERROR_COPY_FAILED
                  : isCopied
                    ? ACCESSIBILITY_LABELS.ERROR_BOUNDARY.ERROR_COPIED
                    : ""}
              </span>
            </motion.details>
          )}

          {/* Action buttons */}
          <motion.div
            className="flex flex-col sm:flex-row gap-3 justify-center pt-2"
            variants={shouldReduceMotion ? undefined : itemVariants}
          >
            <motion.button
              onClick={resetErrorBoundary}
              whileHover={
                shouldReduceMotion
                  ? undefined
                  : { ...HOVER_SCALE.GENTLE, y: ENTRANCE_OFFSETS.HOVER_LIFT_Y_PX }
              }
              whileTap={
                shouldReduceMotion
                  ? undefined
                  : { ...TAP_SCALE.GENTLE, y: ENTRANCE_OFFSETS.TAP_PRESS_Y_PX }
              }
              transition={{ type: FRAMER_TYPE.SPRING, ...SPRING_CONFIG.SNAPPY }}
              className="btn-primary px-6 py-2.5 rounded-lg font-medium"
              aria-label={ACCESSIBILITY_LABELS.ERROR_BOUNDARY.TRY_AGAIN}
            >
              <span className="flex items-center gap-2">
                <svg
                  className="w-4 h-4"
                  fill={SVG_ICON_DEFAULTS.FILL_NONE}
                  stroke={SVG_ICON_DEFAULTS.STROKE_CURRENT}
                  viewBox={SVG_ICON_DEFAULTS.VIEW_BOX}
                  aria-hidden={ARIA_HIDDEN_VALUES.TRUE}
                >
                  <path
                    strokeLinecap={SVG_ICON_DEFAULTS.STROKE_LINECAP_ROUND}
                    strokeLinejoin={SVG_ICON_DEFAULTS.STROKE_LINEJOIN_ROUND}
                    strokeWidth={SVG_ICON_DEFAULTS.STROKE_WIDTH_DEFAULT}
                    d={ICON_PATHS.REFRESH}
                  />
                </svg>
                {ACCESSIBILITY_LABELS.ERROR_BOUNDARY.TRY_AGAIN}
              </span>
            </motion.button>

            <motion.button
              onClick={handleReload}
              whileHover={
                shouldReduceMotion
                  ? undefined
                  : { ...HOVER_SCALE.GENTLE, y: ENTRANCE_OFFSETS.HOVER_LIFT_Y_PX }
              }
              whileTap={
                shouldReduceMotion
                  ? undefined
                  : { ...TAP_SCALE.GENTLE, y: ENTRANCE_OFFSETS.TAP_PRESS_Y_PX }
              }
              transition={{ type: FRAMER_TYPE.SPRING, ...SPRING_CONFIG.SNAPPY }}
              className="btn-ghost px-6 py-2.5 rounded-lg font-medium"
              aria-label={ACCESSIBILITY_LABELS.ERROR_BOUNDARY.RELOAD_PAGE}
            >
              <span className="flex items-center gap-2">
                <svg
                  className="w-4 h-4"
                  fill={SVG_ICON_DEFAULTS.FILL_NONE}
                  stroke={SVG_ICON_DEFAULTS.STROKE_CURRENT}
                  viewBox={SVG_ICON_DEFAULTS.VIEW_BOX}
                  aria-hidden={ARIA_HIDDEN_VALUES.TRUE}
                >
                  <path
                    strokeLinecap={SVG_ICON_DEFAULTS.STROKE_LINECAP_ROUND}
                    strokeLinejoin={SVG_ICON_DEFAULTS.STROKE_LINEJOIN_ROUND}
                    strokeWidth={SVG_ICON_DEFAULTS.STROKE_WIDTH_DEFAULT}
                    d={ICON_PATHS.REFRESH}
                  />
                </svg>
                {ACCESSIBILITY_LABELS.ERROR_BOUNDARY.RELOAD_PAGE}
              </span>
            </motion.button>
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  );
});

export default ErrorFallback;
