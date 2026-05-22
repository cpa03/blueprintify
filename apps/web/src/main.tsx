import React from "react";
import ReactDOM from "react-dom/client";
import { VercelAnalytics } from "./components/VercelAnalytics";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { ReducedMotionProvider } from "./context/ReducedMotionContext";
import { ExportProvider } from "./context/ExportContext";
import { MotionConfigWrapper } from "./components/MotionConfigWrapper";
import { SKELETON_CONFIG } from "./config/constants";
import "./index.css";

// Static import App to avoid an extra network round-trip that delays hydration and LCP
import App from "./App";

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
          <MotionConfigWrapper onMount={fadeOutAndRemoveSkeletonLoader}>
            <App />
          </MotionConfigWrapper>
        </ExportProvider>
      </ReducedMotionProvider>
      <VercelAnalytics />
    </ErrorBoundary>
  </React.StrictMode>
);
