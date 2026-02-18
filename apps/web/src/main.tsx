import React from "react";
import ReactDOM from "react-dom/client";
import { MotionConfig } from "framer-motion";
import App from "./App";
import { ErrorBoundary } from "./components/ErrorBoundary";
import {
  ReducedMotionProvider,
  useReducedMotionContext,
} from "./context/ReducedMotionContext";
import "./index.css";

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
        <ReducedMotionConfig onMount={fadeOutAndRemoveSkeletonLoader} />
      </ReducedMotionProvider>
    </ErrorBoundary>
  </React.StrictMode>,
);

interface ReducedMotionConfigProps {
  onMount?: () => void;
}

function ReducedMotionConfig({
  onMount,
}: ReducedMotionConfigProps): JSX.Element {
  const { prefersReducedMotion } = useReducedMotionContext();

  React.useEffect(() => {
    onMount?.();
  }, [onMount]);

  return (
    <MotionConfig reducedMotion={prefersReducedMotion ? "always" : "never"}>
      <App />
    </MotionConfig>
  );
}
