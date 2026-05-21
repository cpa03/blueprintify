import React, { Suspense, lazy } from "react";
import ReactDOM from "react-dom/client";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { ReducedMotionProvider } from "./context/ReducedMotionContext";
import { ExportProvider } from "./context/ExportContext";
import { SKELETON_CONFIG } from "./config/constants";
import { ENV } from "./config/env";
import "./index.css";

// Lazy load App and MotionConfig to reduce initial bundle size and improve LCP
const App = lazy(() => import("./App"));
const MotionConfigWrapper = lazy(() => import("./components/MotionConfigWrapper"));

// Lazy load Vercel analytics - only fetched when ENABLE_ANALYTICS is true
const VercelAnalytics = lazy(() =>
  import("@vercel/analytics/react").then((m) => ({ default: () => <m.Analytics /> }))
);
const VercelSpeedInsights = lazy(() =>
  import("@vercel/speed-insights/react").then((m) => ({ default: () => <m.SpeedInsights /> }))
);

// Global error handlers for uncaught errors and unhandled Promise rejections
window.addEventListener("unhandledrejection", (event) => {
  if (import.meta.env.DEV) {
    console.error("[Unhandled Rejection] Promise rejected:", event.reason);
  }
  // Prevent the default browser behavior (which shows a cryptic error in console)
  event.preventDefault();
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

const root = ReactDOM.createRoot(rootElement);

root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <ReducedMotionProvider>
        <ExportProvider>
          <Suspense fallback={null}>
            <MotionConfigWrapper onMount={fadeOutAndRemoveSkeletonLoader}>
              <App />
            </MotionConfigWrapper>
          </Suspense>
        </ExportProvider>
      </ReducedMotionProvider>
      {ENV.ENABLE_ANALYTICS && (
        <Suspense fallback={null}>
          <VercelSpeedInsights />
          <VercelAnalytics />
        </Suspense>
      )}
    </ErrorBoundary>
  </React.StrictMode>
);
