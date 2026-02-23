import React from "react";
import {
  ErrorBoundary as ReactErrorBoundary,
  FallbackProps,
} from "react-error-boundary";

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

function ErrorFallback({
  error,
  resetErrorBoundary,
}: FallbackProps): JSX.Element {
  const handleReload = (): void => {
    window.location.reload();
  };

  const errorMessage = error instanceof Error ? error.message : String(error);

  return (
    <div className="min-h-screen flex items-center justify-center bg-dark-900 p-4">
      <div className="glass-card p-8 max-w-md w-full text-center">
        <div className="mb-6">
          <svg
            className="w-16 h-16 mx-auto text-accent-pink"
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

        <h1 className="text-2xl font-bold text-white mb-2">
          Something went wrong
        </h1>

        <p className="text-dark-400 mb-6">
          An unexpected error occurred. Your data is safely stored locally. You
          can try again or reload the page.
        </p>

        <details className="mb-6 text-left">
          <summary className="text-sm text-dark-500 cursor-pointer hover:text-dark-400 transition-colors">
            View error details
          </summary>
          <pre className="mt-2 p-3 bg-dark-800 rounded-lg text-xs text-dark-400 overflow-auto max-h-32">
            {errorMessage}
          </pre>
        </details>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={resetErrorBoundary}
            className="btn-primary px-6 py-2 rounded-lg font-medium transition-colors"
            aria-label="Try again"
          >
            Try Again
          </button>

          <button
            onClick={handleReload}
            className="btn-ghost px-6 py-2 rounded-lg font-medium transition-colors"
            aria-label="Reload page"
          >
            Reload Page
          </button>
        </div>
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
function ErrorBoundary({
  children,
  fallback,
  onError,
}: ErrorBoundaryProps): JSX.Element {
  const handleError = (
    error: unknown,
    info: { componentStack?: string | null },
  ): void => {
    const errorObj = error instanceof Error ? error : new Error(String(error));
    if (import.meta.env.DEV) {
      console.error("ErrorBoundary caught an error:", errorObj);
      console.error("Component stack:", info.componentStack);
    }
    onError?.(errorObj, {
      componentStack: info.componentStack ?? undefined,
    } as React.ErrorInfo);
  };

  if (fallback) {
    return (
      <ReactErrorBoundary fallback={fallback} onError={handleError}>
        {children}
      </ReactErrorBoundary>
    );
  }
  return (
    <ReactErrorBoundary FallbackComponent={ErrorFallback} onError={handleError}>
      {children}
    </ReactErrorBoundary>
  );
}

export { ErrorBoundary };
export default ErrorBoundary;
