import React from "react";
import ReactDOM from "react-dom/client";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { ReducedMotionProvider } from "./context/ReducedMotionContext";
import { ExportProvider } from "./context/ExportContext";
import { MotionConfigWrapper } from "./components/MotionConfigWrapper";
import { VERCEL_DOMAINS } from "./config/constants";
import { DEBUG_MESSAGES } from "./config/constants/content";
import "./index.css";

// Static import App to avoid an extra network round-trip that delays hydration and LCP
import App from "./App";

// Global error handlers for uncaught errors and unhandled Promise rejections
window.addEventListener("unhandledrejection", (event) => {
  console.error(DEBUG_MESSAGES.UNHANDLED_REJECTION, event.reason);
  // Prevent the default browser behavior (which shows a cryptic error in console)
  event.preventDefault();
});

window.addEventListener("error", (event) => {
  console.error(DEBUG_MESSAGES.UNCAUGHT_ERROR, event.message, event.error?.stack ?? "");
  // Prevent the default browser behavior for non-critical errors
  if (!event.isTrusted) {
    event.preventDefault();
  }
});

const rootElement = document.getElementById("root");
if (!rootElement) {
  throw new Error(DEBUG_MESSAGES.ROOT_ELEMENT_NOT_FOUND);
}

const fadeOutAndRemoveSkeletonLoader = () => {
  const skeleton = document.getElementById("skeleton-loader");
  if (skeleton) {
    // CSS animation handles the visual fadeout (2s delay + 0.3s fade).
    // Remove from DOM after animation completes to keep the DOM clean.
    skeleton.addEventListener("animationend", () => skeleton.remove(), { once: true });
  }
};

// Lazy load Vercel Analytics — only loads on actual Vercel deployments, not localhost
const VercelAnalyticsComponent = React.lazy(() =>
  import("./components/VercelAnalytics").then((m) => ({ default: m.VercelAnalytics }))
);

function Root(): JSX.Element {
  const isVercel =
    typeof window !== "undefined" && !VERCEL_DOMAINS.LOCAL.includes(window.location.hostname);

  return (
    <React.StrictMode>
      <ErrorBoundary>
        <ReducedMotionProvider>
          <ExportProvider>
            <MotionConfigWrapper onMount={fadeOutAndRemoveSkeletonLoader}>
              <App />
            </MotionConfigWrapper>
          </ExportProvider>
        </ReducedMotionProvider>
        {isVercel && (
          <React.Suspense fallback={null}>
            <VercelAnalyticsComponent />
          </React.Suspense>
        )}
      </ErrorBoundary>
    </React.StrictMode>
  );
}

const root = ReactDOM.createRoot(rootElement);
root.render(<Root />);
