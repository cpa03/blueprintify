import { useRef, useEffect, useCallback } from "react";
import { TIMEOUTS, FOCUSABLE_SELECTOR_STRING } from "../config/constants";

interface UseFocusOnStepChangeOptions {
  delay?: number;
  skipInitialMount?: boolean;
}

export function useFocusOnStepChange(
  stepId: string,
  options: UseFocusOnStepChangeOptions = {},
) {
  const { delay = TIMEOUTS.FOCUS_DELAY, skipInitialMount = true } = options;
  const containerRef = useRef<HTMLDivElement>(null);
  const previousStepRef = useRef<string | null>(null);
  const isInitialMount = useRef(true);

  const focusFirstElement = useCallback(() => {
    if (!containerRef.current) return;

    const focusableElements = containerRef.current.querySelectorAll(
      FOCUSABLE_SELECTOR_STRING,
    );

    if (focusableElements.length === 0) return;

    const firstElement = focusableElements[0] as HTMLElement;

    setTimeout(() => {
      firstElement.scrollIntoView({ behavior: "smooth", block: "nearest" });
      firstElement.focus({ preventScroll: true });

      const inputElement = firstElement as HTMLInputElement;
      if (
        (firstElement.tagName === "INPUT" ||
          firstElement.tagName === "TEXTAREA") &&
        inputElement.value.length > 0
      ) {
        inputElement.select();
      }
    }, delay);
  }, [delay]);

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      previousStepRef.current = stepId;
      if (skipInitialMount) return;
    }

    if (previousStepRef.current !== stepId) {
      previousStepRef.current = stepId;
      focusFirstElement();
    }
  }, [stepId, skipInitialMount, focusFirstElement]);

  return containerRef;
}

export function useStepAnnouncer(stepId: string, stepLabel: string) {
  const previousStepRef = useRef<string | null>(null);
  const liveRegionRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!liveRegionRef.current) {
      liveRegionRef.current = document.createElement("div");
      liveRegionRef.current.setAttribute("role", "status");
      liveRegionRef.current.setAttribute("aria-live", "polite");
      liveRegionRef.current.setAttribute("aria-atomic", "true");
      liveRegionRef.current.className = "sr-only";
      document.body.appendChild(liveRegionRef.current);
    }

    return () => {
      if (liveRegionRef.current) {
        document.body.removeChild(liveRegionRef.current);
        liveRegionRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (previousStepRef.current !== stepId && liveRegionRef.current) {
      previousStepRef.current = stepId;
      liveRegionRef.current.textContent = `Now on ${stepLabel} step`;

      const timeout = setTimeout(() => {
        if (liveRegionRef.current) {
          liveRegionRef.current.textContent = "";
        }
      }, TIMEOUTS.LIVE_REGION_CLEAR);

      return () => clearTimeout(timeout);
    }
  }, [stepId, stepLabel]);
}
