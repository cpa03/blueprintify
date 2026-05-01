/**
 * Error Boundary Component
 *
 * Provides a robust error handling mechanism for React component trees.
 * Catches runtime errors, logs them securely, and displays a user-friendly
 * fallback UI.
 */

import React, { type ReactNode, type ErrorInfo } from "react";
import { ErrorBoundary as ErrorBoundaryLib, type FallbackProps as LibFallbackProps } from "react-error-boundary";
import { RippleButton } from "./RippleButton";
import { resetAllStores } from "../store";

/**
 * Default fallback UI displayed when an error is caught
 */
function ErrorFallback({ error, resetErrorBoundary }: LibFallbackProps) {
  const handleReset = () => {
    resetAllStores();
    resetErrorBoundary();
    window.location.href = "/";
  };

  const err = error as Error;

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-dark-950">
      <div className="max-w-md w-full glass-card p-8 text-center space-y-6 border border-red-500/20">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-500/10 text-red-500 mb-2">
           ⚠️
        </div>

        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-white">Something went wrong</h2>
          <p className="text-dark-400 text-sm">
            An unexpected error occurred in the application. We&apos;ve been notified
            and are working on a fix.
          </p>
        </div>

        {import.meta.env.DEV && (
          <div className="p-4 bg-dark-900 rounded-lg text-left overflow-auto max-h-48">
            <p className="text-red-400 font-mono text-xs break-all">
              {err?.message}
            </p>
            {err?.stack && (
              <pre className="text-dark-500 font-mono text-[10px] mt-2 leading-relaxed">
                {err.stack}
              </pre>
            )}
          </div>
        )}

        <div className="flex flex-col gap-3">
          <RippleButton
            onClick={resetErrorBoundary}
            className="btn-primary w-full flex items-center justify-center gap-2"
          >
            Try again
          </RippleButton>

          <RippleButton
            onClick={handleReset}
            className="btn-secondary w-full flex items-center justify-center gap-2"
          >
            Reset Application
          </RippleButton>
        </div>
      </div>
    </div>
  );
}

interface ErrorBoundaryProps {
  children: ReactNode;
  onReset?: () => void;
  onError?: (error: Error, info: ErrorInfo) => void;
  fallback?: ReactNode;
}

/**
 * ErrorBoundary component that wraps application modules
 */
export function ErrorBoundary({
  children,
  onReset,
  onError,
}: ErrorBoundaryProps) {
  return (
    <ErrorBoundaryLib
      FallbackComponent={ErrorFallback}
      onReset={onReset}
      onError={(error, errorInfo) => {
        onError?.(error as Error, errorInfo);
      }}
    >
      {children}
    </ErrorBoundaryLib>
  );
}
