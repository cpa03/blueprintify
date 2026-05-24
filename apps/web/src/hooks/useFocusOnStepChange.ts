/**
 * @fileoverview Hooks for managing focus during wizard step navigation
 *
 * Provides accessibility-focused hooks for multi-step forms/wizards:
 * - Automatic focus management when steps change
 * - Screen reader announcements for step changes
 *
 * @module useFocusOnStepChange
 */

import { useRef, useEffect, useCallback } from "react";
import { TIMEOUTS, FOCUSABLE_SELECTOR_STRING, FOCUS_ANNOUNCER } from "../config/constants";

/** Configuration options for step change focus behavior */
interface UseFocusOnStepChangeOptions {
  /** Delay before focusing element (default: TIMEOUTS.FOCUS_DELAY) */
  delay?: number;
  /** Skip focusing on initial mount (default: true) */
  skipInitialMount?: boolean;
}

/**
 * Hook for automatically focusing the first element when a wizard step changes
 *
 * Improves accessibility by ensuring keyboard users land on the first interactive
 * element of each step. Also scrolls the element into view smoothly.
 *
 * @param stepId - Unique identifier for the current step (triggers focus when changed)
 * @param options - Configuration options for focus behavior
 * @returns Ref to attach to the step container element
 *
 * @example
 * ```tsx
 * function WizardStep({ stepId }) {
 *   const containerRef = useFocusOnStepChange(stepId);
 *
 *   return (
 *     <div ref={containerRef}>
 *       <input type="text" placeholder="First focusable element" />
 *     </div>
 *   );
 * }
 * ```
 */
export function useFocusOnStepChange(stepId: string, options: UseFocusOnStepChangeOptions = {}) {
  const { delay = TIMEOUTS.FOCUS_DELAY, skipInitialMount = true } = options;
  const containerRef = useRef<HTMLDivElement>(null);
  const previousStepRef = useRef<string | null>(null);
  const isInitialMount = useRef(true);

  const focusFirstElement = useCallback(() => {
    if (!containerRef.current) return;

    const focusableElements = containerRef.current.querySelectorAll(FOCUSABLE_SELECTOR_STRING);

    if (focusableElements.length === 0) return;

    const firstElement = focusableElements[0] as HTMLElement;

    setTimeout(() => {
      firstElement.scrollIntoView({ behavior: "smooth", block: "nearest" });
      firstElement.focus({ preventScroll: true });

      const inputElement = firstElement as HTMLInputElement;
      if (
        (firstElement.tagName === "INPUT" || firstElement.tagName === "TEXTAREA") &&
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

/**
 * Hook for announcing step changes to screen readers
 *
 * Creates a live region that announces step transitions to screen reader users.
 * The announcement is automatically cleared after a timeout to prevent stale content.
 *
 * @param stepId - Unique identifier for the current step
 * @param stepLabel - Human-readable label for the step (e.g., "Project Details")
 *
 * @example
 * ```tsx
 * function Wizard({ currentStep }) {
 *   useStepAnnouncer(currentStep.id, currentStep.label);
 *   // Screen reader will announce: "Now on Project Details step"
 * }
 * ```
 */
export function useStepAnnouncer(stepId: string, stepLabel: string): void {
  const previousStepRef = useRef<string | null>(null);
  const liveRegionRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!liveRegionRef.current) {
      liveRegionRef.current = document.createElement("div");
      liveRegionRef.current.setAttribute("role", "status");
      liveRegionRef.current.setAttribute("aria-live", "polite");
      liveRegionRef.current.setAttribute("aria-atomic", "true");
      liveRegionRef.current.className = FOCUS_ANNOUNCER.LIVE_REGION_CLASS;
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
      liveRegionRef.current.textContent = FOCUS_ANNOUNCER.STEP_CHANGE(stepLabel);

      const timeout = setTimeout(() => {
        if (liveRegionRef.current) {
          liveRegionRef.current.textContent = "";
        }
      }, TIMEOUTS.LIVE_REGION_CLEAR);

      return () => clearTimeout(timeout);
    }
  }, [stepId, stepLabel]);
}
