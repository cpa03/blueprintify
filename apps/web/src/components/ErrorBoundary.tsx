import React from "react";

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

/**
 * ErrorFallbackUI - Functional component for error display
 *
 * Extracted from ErrorBoundary for better testability and modern React patterns.
 * This component is memoized to prevent unnecessary re-renders.
 */
interface ErrorFallbackUIProps {
  error: Error | null;
  onRetry: () => void;
  onReload: () => void;
}

const ErrorFallbackUI = React.memo(function ErrorFallbackUI({
  error,
  onRetry,
  onReload,
}: ErrorFallbackUIProps): JSX.Element {
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

        {error && (
          <details className="mb-6 text-left">
            <summary className="text-sm text-dark-500 cursor-pointer hover:text-dark-400 transition-colors">
              View error details
            </summary>
            <pre className="mt-2 p-3 bg-dark-800 rounded-lg text-xs text-dark-400 overflow-auto max-h-32">
              {error.message}
            </pre>
          </details>
        )}

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={onRetry}
            className="btn-primary px-6 py-2 rounded-lg font-medium transition-colors"
            aria-label="Try again"
          >
            Try Again
          </button>

          <button
            onClick={onReload}
            className="btn-ghost px-6 py-2 rounded-lg font-medium transition-colors"
            aria-label="Reload page"
          >
            Reload Page
          </button>
        </div>
      </div>
    </div>
  );
});

/**
 * ErrorBoundary - Catches JavaScript errors in child components
 *
 * This component prevents the entire app from crashing when an error occurs.
 * It logs errors and displays a user-friendly fallback UI with recovery options.
 *
 * Note: ErrorBoundary must remain a class component in React 18 as functional
 * components cannot implement getDerivedStateFromError or componentDidCatch.
 * The UI is extracted to ErrorFallbackUI for better testability.
 *
 * @example
 * ```tsx
 * <ErrorBoundary>
 *   <App />
 * </ErrorBoundary>
 * ```
 */
export class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    if (import.meta.env.DEV) {
      console.error("ErrorBoundary caught an error:", error);
      console.error("Component stack:", errorInfo.componentStack);
    }
    this.props.onError?.(error, errorInfo);
  }

  handleRetry = (): void => {
    this.setState({ hasError: false, error: null });
  };

  handleReload = (): void => {
    window.location.reload();
  };

  render(): React.ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <ErrorFallbackUI
          error={this.state.error}
          onRetry={this.handleRetry}
          onReload={this.handleReload}
        />
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
