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
import { FallbackProps } from "react-error-boundary";
import { useReducedMotion } from "../hooks/useReducedMotion";
import {
  SPRING_CONFIG,
  ANIMATION,
  EASING,
  TIMEOUTS,
  HOVER_SCALE,
  TAP_SCALE,
} from "../config/constants";
import { ANIMATION_ENTRANCE_DELAYS } from "@blueprint/shared";
import { ACCESSIBILITY_LABELS, ERROR_BOUNDARY_TEXT } from "../config/constants/content";
import { copyToClipboard } from "../lib/clipboard";

/**
 * Staggered entrance variants for the fallback UI elements.
 * Each child enters with a small delay, creating a polished cascade.
 */
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring" as const,
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

  const handleReload = (): void => {
    window.location.reload();
  };

  const errorMessage = error instanceof Error ? error.message : ERROR_BOUNDARY_TEXT.UNKNOWN_ERROR;

  const handleCopyError = useCallback(async (): Promise<void> => {
    const success = await copyToClipboard(errorMessage);
    if (success) {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), TIMEOUTS.COPY_FEEDBACK);
    }
  }, [errorMessage]);

  const cardSpring = shouldReduceMotion
    ? {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        transition: { duration: ANIMATION.NORMAL },
      }
    : {
        initial: { opacity: 0, scale: 0.95, y: 20 },
        animate: { opacity: 1, scale: 1, y: 0 },
        transition: {
          type: "spring" as const,
          ...SPRING_CONFIG.GENTLE,
        },
      };

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-dark-900 p-4"
      role="alert"
      aria-live="assertive"
    >
      <motion.div
        className="glass-card p-8 max-w-md w-full text-center relative overflow-hidden"
        {...cardSpring}
      >
        {/* Subtle gradient accent line at the top */}
        <div
          className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-accent-pink/60 via-accent-pink/40 to-transparent"
          aria-hidden="true"
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
                      scale: [1, 1.04, 1],
                    }
              }
              transition={{
                duration: ANIMATION.SLOW_PULSE,
                repeat: Infinity,
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
                        scale: [1, 1.15, 1],
                        opacity: [0.4, 0.7, 0.4],
                      }
                }
                transition={{
                  duration: ANIMATION.BREATH,
                  repeat: Infinity,
                  ease: EASING.easeInOut,
                }}
                aria-hidden="true"
              />
              <svg
                className="w-10 h-10 text-accent-pink relative z-10"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <motion.path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
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
                  transition={{ type: "spring", ...SPRING_CONFIG.SNAPPY }}
                  className="absolute top-2 right-2 flex items-center gap-1 px-2 py-1
                             rounded-md text-2xs font-medium
                             bg-dark-700/80 hover:bg-dark-700
                             text-dark-300 hover:text-white
                             border border-dark-600/50 hover:border-dark-500
                             focus-visible:outline-none focus-visible:ring-2
                             focus-visible:ring-primary-500/50
                             transition-colors duration-150"
                  aria-label={ACCESSIBILITY_LABELS.ERROR_BOUNDARY.COPY_ERROR}
                >
                  {/* Clipboard icon */}
                  <AnimatePresence mode="wait">
                    {isCopied ? (
                      <motion.span
                        key="copied"
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.5 }}
                        className="flex items-center gap-1 text-accent-emerald"
                      >
                        <svg
                          className="w-3 h-3"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          aria-hidden="true"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2.5}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                        <span>{ERROR_BOUNDARY_TEXT.COPIED}</span>
                      </motion.span>
                    ) : (
                      <motion.span
                        key="copy"
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.5 }}
                        className="flex items-center gap-1"
                      >
                        <svg
                          className="w-3 h-3"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          aria-hidden="true"
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
              <span className="sr-only" role="status" aria-live="polite" aria-atomic="true">
                {isCopied ? ACCESSIBILITY_LABELS.ERROR_BOUNDARY.ERROR_COPIED : ""}
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
              whileHover={shouldReduceMotion ? undefined : { ...HOVER_SCALE.GENTLE, y: -1 }}
              whileTap={shouldReduceMotion ? undefined : { ...TAP_SCALE.GENTLE, y: 0 }}
              transition={{ type: "spring" as const, ...SPRING_CONFIG.SNAPPY }}
              className="btn-primary px-6 py-2.5 rounded-lg font-medium"
              aria-label={ACCESSIBILITY_LABELS.ERROR_BOUNDARY.TRY_AGAIN}
            >
              <span className="flex items-center gap-2">
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
                {ACCESSIBILITY_LABELS.ERROR_BOUNDARY.TRY_AGAIN}
              </span>
            </motion.button>

            <motion.button
              onClick={handleReload}
              whileHover={shouldReduceMotion ? undefined : { ...HOVER_SCALE.GENTLE, y: -1 }}
              whileTap={shouldReduceMotion ? undefined : { ...TAP_SCALE.GENTLE, y: 0 }}
              transition={{ type: "spring" as const, ...SPRING_CONFIG.SNAPPY }}
              className="btn-ghost px-6 py-2.5 rounded-lg font-medium"
              aria-label={ACCESSIBILITY_LABELS.ERROR_BOUNDARY.RELOAD_PAGE}
            >
              <span className="flex items-center gap-2">
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
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
