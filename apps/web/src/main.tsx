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

const rootElement = document.getElementById("root");

// Handle unhandled promise rejections to prevent silent crashes
window.addEventListener("unhandledrejection", (event) => {
  if (import.meta.env.DEV) {
    console.error("[Unhandled Rejection] Promise rejected:", event.reason);
  }
  // Prevent the default browser behavior (which shows a cryptic error in console)
  event.preventDefault();
});

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
