import React, { Component, ReactNode, ErrorInfo } from "react";
import { motion } from "framer-motion";
import clsx from "clsx";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  className?: string;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("MarkdownRenderer Error:", error, errorInfo);
    this.setState({ error, errorInfo });
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className={clsx(
            "p-6 rounded-lg border border-red-500/20 bg-red-500/5",
            this.props.className,
          )}
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="text-2xl">⚠️</div>
            <div>
              <h3 className="text-red-400 font-semibold">Rendering Error</h3>
              <p className="text-sm text-red-300">
                Failed to render markdown content
              </p>
            </div>
          </div>

          {process.env.NODE_ENV === "development" && this.state.error && (
            <details className="mt-4">
              <summary className="text-xs text-red-400 cursor-pointer">
                Error Details (Development)
              </summary>
              <pre className="mt-2 text-xs text-red-300 overflow-auto bg-red-900/20 p-3 rounded">
                {this.state.error.toString()}
                {this.state.errorInfo?.componentStack}
              </pre>
            </details>
          )}
        </motion.div>
      );
    }

    return this.props.children;
  }
}
