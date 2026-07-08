/**
 * ErrorBoundary - Catches JavaScript errors in child components
 *
 * Prevents the entire app from crashing when an error occurs.
 * Logs errors and displays a user-friendly, animated fallback UI
 * with recovery options, following the same design language as the
 * rest of the application.
 *
 * Performance: The ErrorFallback (with framer-motion animations) is
 * lazy-loaded so that the 138 kB framer-motion library is only fetched
 * when an error actually occurs, keeping the initial bundle lean.
 *
 * @example
 * ```tsx
 * <ErrorBoundary>
 *   <App />
 * </ErrorBoundary>
 * ```
 */

import { useCallback, useMemo, lazy, Suspense } from "react";
import { ErrorBoundary as ErrorBoundaryLib, FallbackProps } from "react-error-boundary";
import { ERROR_BOUNDARY_TEXT, DEBUG_MESSAGES } from "../config/constants/content";
import { isDev } from "../config/env";

/**
 * Lazy-loaded animated error fallback. framer-motion is only loaded
 * when an error actually occurs, not on the critical path.
 */
const ErrorFallback = lazy(() => import("./ErrorFallback"));

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

/**
 * Minimal static fallback shown while the ErrorFallback module loads.
 * Renders instantly — no framer-motion dependency.
 */
function LoadingFallback(): JSX.Element {
  return (
    <div
      className="min-h-screen flex items-center justify-center bg-dark-900 p-4 animate-fade-in"
      role="alert"
      aria-live="assertive"
    >
      <div className="glass-card p-8 max-w-md w-full text-center">
        <div
          className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-accent-pink/60 via-accent-pink/40 to-transparent"
          aria-hidden="true"
        />
        <div className="w-20 h-20 mx-auto rounded-2xl bg-accent-pink/15 flex items-center justify-center mb-6">
          <svg
            className="w-10 h-10 text-accent-pink"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-white mb-4">{ERROR_BOUNDARY_TEXT.TITLE}</h1>
        <p className="text-dark-400 leading-relaxed">{ERROR_BOUNDARY_TEXT.DESCRIPTION}</p>
      </div>
    </div>
  );
}

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
    <ErrorBoundaryLib
      fallbackRender={(fallbackProps: FallbackProps) => (
        <Suspense fallback={<LoadingFallback />}>
          <FallbackComponent {...fallbackProps} />
        </Suspense>
      )}
      onError={handleError}
    >
      {children}
    </ErrorBoundaryLib>
  );
}

export default ErrorBoundary;
