import React from "react";
import ReactDOM from "react-dom/client";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { ReducedMotionProvider } from "./context/ReducedMotionContext";
import { ExportProvider } from "./context/ExportContext";
import { SKELETON_CONFIG, VERCEL_DOMAINS } from "./config/constants";
import "./index.css";

// Static import App to avoid an extra network round-trip that delays hydration and LCP
import App from "./App";

// Global error handlers for uncaught errors and unhandled Promise rejections
window.addEventListener("unhandledrejection", (event) => {
  console.error("[Unhandled Rejection] Promise rejected:", event.reason);
  // Prevent the default browser behavior (which shows a cryptic error in console)
  event.preventDefault();
});

window.addEventListener("error", (event) => {
  console.error("[Uncaught Error]", event.message, event.error?.stack ?? "");
  // Prevent the default browser behavior for non-critical errors
  if (!event.isTrusted) {
    event.preventDefault();
  }
});

const rootElement = document.getElementById("root");
if (!rootElement) {
  throw new Error("Root element not found");
}

const fadeOutAndRemoveSkeletonLoader = () => {
  const skeleton = document.getElementById("skeleton-loader");
  if (skeleton) {
    skeleton.style.opacity = "0";
    setTimeout(() => {
      skeleton.remove();
    }, SKELETON_CONFIG.FADEOUT_MS);
  }
};

// Lazy load Vercel Analytics — only loads on actual Vercel deployments, not localhost
const VercelAnalyticsComponent = React.lazy(() =>
  import("./components/VercelAnalytics").then((m) => ({ default: m.VercelAnalytics }))
);

// Lazy load MotionConfigWrapper to defer framer-motion bundle until after initial render
const MotionConfigWrapper = React.lazy(() =>
  import("./components/MotionConfigWrapper").then((m) => ({ default: m.MotionConfigWrapper }))
);

function Root(): JSX.Element {
  const isVercel =
    typeof window !== "undefined" && !VERCEL_DOMAINS.LOCAL.includes(window.location.hostname);

  return (
    <React.StrictMode>
      <ErrorBoundary>
        <ReducedMotionProvider>
          <ExportProvider>
            <React.Suspense fallback={null}>
              <MotionConfigWrapper onMount={fadeOutAndRemoveSkeletonLoader}>
                <App />
              </MotionConfigWrapper>
            </React.Suspense>
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
