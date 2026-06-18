/**
 * ErrorBoundary - Catches JavaScript errors in child components
 *
 * Prevents the entire app from crashing when an error occurs.
 * Logs errors and displays a user-friendly, animated fallback UI
 * with recovery options, following the same design language as the
 * rest of the application.
 *
 * Features:
 * - Spring-entrance card with staggered content reveal
 * - whileHover/whileTap micro-interactions on recovery buttons
 * - Animated warning icon with gentle pulse
 * - Collapsible error details for developers
 * - Reduced motion support
 * - Proper ARIA attributes for screen readers
 *
 * @example
 * ```tsx
 * <ErrorBoundary>
 *   <App />
 * </ErrorBoundary>
 * ```
 */

import { memo, useCallback, useMemo } from "react";
import { motion } from "framer-motion";
import { ErrorBoundary as ErrorBoundaryLib, FallbackProps } from "react-error-boundary";
import { useReducedMotion } from "../hooks/useReducedMotion";
import { SPRING_CONFIG, ANIMATION } from "../config/constants";
import {
  ACCESSIBILITY_LABELS,
  ERROR_BOUNDARY_TEXT,
  DEBUG_MESSAGES,
} from "../config/constants/content";
import { isDev } from "../config/env";

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

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
const ErrorFallback = memo(function ErrorFallback({
  error,
  resetErrorBoundary,
}: FallbackProps): JSX.Element {
  const shouldReduceMotion = useReducedMotion();

  const handleReload = useCallback((): void => {
    window.location.reload();
  }, []);

  const errorMessage = error instanceof Error ? error.message : ERROR_BOUNDARY_TEXT.UNKNOWN_ERROR;

  const cardSpring = shouldReduceMotion
    ? { initial: { opacity: 0 }, animate: { opacity: 1 }, transition: { duration: 0.2 } }
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
        {/* Subtle gradient accent line at the top — matching the glass-card
            focus-within/sweep pattern used elsewhere in the app. Provides a
            polished visual anchor even in error states. */}
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
                ease: "easeInOut",
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
                  ease: "easeInOut",
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
                    pathLength: { duration: ANIMATION.MEDIUM_SLOW, ease: "easeOut", delay: 0.15 },
                    opacity: { duration: ANIMATION.QUICK_FADE, delay: 0.15 },
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
              <pre className="mt-2 p-3 bg-dark-800 rounded-lg text-xs text-dark-400 overflow-auto max-h-32 leading-relaxed">
                {errorMessage}
              </pre>
            </motion.details>
          )}

          {/* Action buttons */}
          <motion.div
            className="flex flex-col sm:flex-row gap-3 justify-center pt-2"
            variants={shouldReduceMotion ? undefined : itemVariants}
          >
            <motion.button
              onClick={resetErrorBoundary}
              whileHover={shouldReduceMotion ? undefined : { scale: 1.03, y: -1 }}
              whileTap={shouldReduceMotion ? undefined : { scale: 0.97, y: 0 }}
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
              whileHover={shouldReduceMotion ? undefined : { scale: 1.03, y: -1 }}
              whileTap={shouldReduceMotion ? undefined : { scale: 0.97, y: 0 }}
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

/**
 * ErrorBoundary - Catches JavaScript errors in child components
 *
 * This component prevents the entire app from crashing when an error occurs.
 * It logs errors and displays a user-friendly fallback UI with recovery options.
 *
 * @example
 * ```tsx
 * <ErrorBoundary>
 *   <App />
 * </ErrorBoundary>
 * ```
 */
export function ErrorBoundary({ children, fallback, onError }: ErrorBoundaryProps): JSX.Element {
  const handleError = useCallback(
    (error: unknown, errorInfo: React.ErrorInfo) => {
      if (isDev()) {
        console.error(DEBUG_MESSAGES.ERROR_BOUNDARY_CAUGHT, error);
        console.error(DEBUG_MESSAGES.COMPONENT_STACK, errorInfo.componentStack);
      }
      onError?.(error as Error, errorInfo);
    },
    [onError]
  );

  const FallbackComponent = useMemo(
    () => (fallback ? () => <>{fallback}</> : ErrorFallback),
    [fallback]
  );

  return (
    <ErrorBoundaryLib FallbackComponent={FallbackComponent} onError={handleError}>
      {children}
    </ErrorBoundaryLib>
  );
}

export default ErrorBoundary;
