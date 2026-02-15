import React from "react";
import ReactDOM from "react-dom/client";
import { MotionConfig } from "framer-motion";
import App from "./App";
import {
  ReducedMotionProvider,
  useReducedMotionContext,
} from "./context/ReducedMotionContext";
import "./index.css";

const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error("Root element not found");
}

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <ReducedMotionProvider>
      <ReducedMotionConfig />
    </ReducedMotionProvider>
  </React.StrictMode>,
);

function ReducedMotionConfig(): JSX.Element {
  const { prefersReducedMotion } = useReducedMotionContext();

  return (
    <MotionConfig reducedMotion={prefersReducedMotion ? "always" : "never"}>
      <App />
    </MotionConfig>
  );
}
