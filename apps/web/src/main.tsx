import { StrictMode } from "react";
import { DOM_EVENTS } from "@blueprint/shared/config";
import { createRoot } from "react-dom/client";
import { LazyMotion } from "framer-motion";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { ReducedMotionProvider } from "./context/ReducedMotionContext";
import { ExportProvider } from "./context/ExportContext";
import { MotionConfigWrapper } from "./components/MotionConfigWrapper";
import { DEBUG_MESSAGES } from "./config/constants/content";
import { SKELETON_EXIT_DEFAULTS, UI_TIMEOUTS } from "@blueprint/shared/config";
import "./index.css";

// Static import App to avoid an extra network round-trip that delays hydration and LCP
import App from "./App";

// Global error handlers for uncaught errors and unhandled Promise rejections
window.addEventListener(DOM_EVENTS.UNHANDLED_REJECTION, (event) => {
  console.error(DEBUG_MESSAGES.UNHANDLED_REJECTION, event.reason);
  // Prevent the default browser behavior (which shows a cryptic error in console)
  event.preventDefault();
});

window.addEventListener(DOM_EVENTS.ERROR, (event) => {
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

/**
 * `framer-motion/m` components require domAnimation features via LazyMotion;
 * without them `initial` applies but `animate` never runs (modals stuck at
 * opacity 0 — #3616). Dynamic import keeps the runtime off the critical path.
 */
const loadMotionFeatures = (): Promise<typeof import("framer-motion").domAnimation> =>
  import("framer-motion").then((mod) => mod.domAnimation);

function scheduleMotionFeatures(): void {
  if (typeof window === "undefined") return;
  const idle = (window as Window & { requestIdleCallback?: (cb: () => void) => number })
    .requestIdleCallback;
  const load = (): void => {
    void loadMotionFeatures();
  };
  if (typeof idle === "function") {
    idle.call(window, load);
  } else {
    window.setTimeout(load, UI_TIMEOUTS.MONO_FONT_IDLE_FALLBACK_MS);
  }
}

scheduleMotionFeatures();

const fadeOutAndRemoveSkeletonLoader = () => {
  const skeleton = document.getElementById("skeleton-loader");
  if (skeleton) {
    // Override the 2s CSS delay on React mount so the skeleton fades out
    // immediately when React hydrates, instead of waiting the full 2.3s
    // fixed duration. On fast connections this makes the perceived load
    // time match actual readiness — the skeleton disappears as soon as
    // the UI is interactive rather than lingering unnecessarily.
    skeleton.style.animation = SKELETON_EXIT_DEFAULTS.ANIMATION;
    // Remove from DOM after animation completes to keep the DOM clean.
    skeleton.addEventListener(DOM_EVENTS.ANIMATION_END, () => skeleton.remove(), { once: true });
  }
};

function Root(): JSX.Element {
  return (
    <StrictMode>
      <ErrorBoundary>
        <ReducedMotionProvider>
          <ExportProvider>
            <LazyMotion features={loadMotionFeatures}>
              <MotionConfigWrapper onMount={fadeOutAndRemoveSkeletonLoader}>
                <App />
              </MotionConfigWrapper>
            </LazyMotion>
          </ExportProvider>
        </ReducedMotionProvider>
      </ErrorBoundary>
    </StrictMode>
  );
}

const root = createRoot(rootElement);
root.render(<Root />);

const MONO_FONT_HREF =
  "https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500&display=optional";

function loadMonoFont(): void {
  if (typeof document === "undefined") return;
  if (document.getElementById("font-mono")) return;
  const link = document.createElement("link");
  link.id = "font-mono";
  link.rel = "stylesheet";
  link.href = MONO_FONT_HREF;
  link.media = "print";
  link.onload = (): void => {
    link.media = "all";
  };
  document.head.appendChild(link);
}

function scheduleMonoFont(): void {
  if (typeof window === "undefined") return;
  const idle = (window as Window & { requestIdleCallback?: (cb: () => void) => number })
    .requestIdleCallback;
  if (typeof idle === "function") {
    idle.call(window, loadMonoFont);
  } else {
    window.setTimeout(loadMonoFont, UI_TIMEOUTS.MONO_FONT_IDLE_FALLBACK_MS);
  }
}

scheduleMonoFont();
