import React, { Suspense, lazy } from "react";
import ReactDOM from "react-dom/client";
import { SpeedInsights } from "@vercel/speed-insights/react";
import { Analytics } from "@vercel/analytics/react";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { ReducedMotionProvider } from "./context/ReducedMotionContext";
import { ExportProvider } from "./context/ExportContext";
import { SKELETON_CONFIG } from "./config/constants";
import "./index.css";

// Lazy load App and MotionConfig to reduce initial bundle size and improve LCP
const App = lazy(() => import("./App"));
const MotionConfigWrapper = lazy(() => import("./components/MotionConfigWrapper"));

// Global error handlers for uncaught errors and unhandled Promise rejections
window.addEventListener("unhandledrejection", (event) => {
  console.error("Unhandled Promise rejection:", event.reason);
  // Optionally report to Sentry: Sentry.captureException(event.reason);
});

window.addEventListener("error", (event) => {
  console.error("Uncaught error:", event.error);
  // Optionally report to Sentry: Sentry.captureException(event.error);
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
      <SpeedInsights />
      <Analytics />
    </ErrorBoundary>
  </React.StrictMode>
);
