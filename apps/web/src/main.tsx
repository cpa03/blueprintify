import React, { Suspense, lazy } from "react";
import ReactDOM from "react-dom/client";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { ReducedMotionProvider } from "./context/ReducedMotionContext";
import "./index.css";

// Lazy load App and MotionConfig to reduce initial bundle size and improve LCP
const App = lazy(() => import("./App"));
const MotionConfigWrapper = lazy(
  () => import("./components/MotionConfigWrapper"),
);

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
    }, 300);
  }
};

const root = ReactDOM.createRoot(rootElement);

root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <ReducedMotionProvider>
        <Suspense fallback={null}>
          <MotionConfigWrapper onMount={fadeOutAndRemoveSkeletonLoader}>
            <App />
          </MotionConfigWrapper>
        </Suspense>
      </ReducedMotionProvider>
    </ErrorBoundary>
  </React.StrictMode>,
);
