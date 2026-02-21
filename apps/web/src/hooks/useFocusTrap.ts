import { useEffect, useRef, useCallback, type RefObject } from "react";
import { FOCUSABLE_SELECTOR_STRING } from "../config/constants";

/**
 * @fileoverview Hook for trapping focus within a container element
 *
 * Implements a focus trap pattern for modal dialogs, drawers, and other
 * overlay components. Ensures keyboard users can't tab outside the container.
 *
 * @module useFocusTrap
 */

/** Configuration options for the focus trap */
interface UseFocusTrapOptions {
  /** Whether the trap is currently active */
  isActive: boolean;
  /** Element to return focus to when trap deactivates */
  returnFocusTo?: RefObject<HTMLElement | null> | (() => HTMLElement | null);
  /** Whether to auto-focus the first element when activated (default: true) */
  autoFocus?: boolean;
}

/** Return value from the focus trap hook */
interface UseFocusTrapReturn {
  /** Ref to attach to the container element */
  containerRef: RefObject<HTMLElement | null>;
  /** Programmatically focus the first focusable element */
  focusFirst: () => void;
  /** Programmatically focus the last focusable element */
  focusLast: () => void;
}

/**
 * Hook for trapping focus within a container element
 *
 * Creates an accessible focus trap that confines Tab/Shift+Tab navigation
 * to elements within the container. Automatically handles:
 * - Focus on activation (autoFocus)
 * - Focus return on deactivation
 * - Tab key wrapping (last element → first, first → last with Shift)
 *
 * @param options - Configuration options for the focus trap
 * @returns Object with containerRef and focus control methods
 *
 * @example
 * ```tsx
 * function Modal({ isOpen, onClose }) {
 *   const { containerRef } = useFocusTrap({ isActive: isOpen });
 *
 *   return isOpen ? (
 *     <div ref={containerRef} role="dialog" aria-modal="true">
 *       <button onClick={onClose}>Close</button>
 *       {/* Other focusable elements *\/}
 *     </div>
 *   ) : null;
 * }
 * ```
 */
export function useFocusTrap(options: UseFocusTrapOptions): UseFocusTrapReturn {
  const { isActive, returnFocusTo, autoFocus = true } = options;
  const containerRef = useRef<HTMLElement | null>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  const getFocusableElements = useCallback((): HTMLElement[] => {
    if (!containerRef.current) return [];
    return Array.from(
      containerRef.current.querySelectorAll<HTMLElement>(
        FOCUSABLE_SELECTOR_STRING,
      ),
    ).filter(
      (element) =>
        element.tabIndex >= 0 &&
        element.offsetParent !== null &&
        element.offsetWidth > 0 &&
        element.offsetHeight > 0,
    );
  }, []);

  const focusFirst = useCallback(() => {
    const focusableElements = getFocusableElements();
    const first = focusableElements[0];
    if (first) {
      first.focus();
    }
  }, [getFocusableElements]);

  const focusLast = useCallback(() => {
    const focusableElements = getFocusableElements();
    const last = focusableElements[focusableElements.length - 1];
    if (last) {
      last.focus();
    }
  }, [getFocusableElements]);

  useEffect(() => {
    if (isActive) {
      previousFocusRef.current = document.activeElement as HTMLElement;

      if (autoFocus) {
        const timer = setTimeout(() => {
          focusFirst();
        }, 0);
        return () => clearTimeout(timer);
      }
    }
  }, [isActive, autoFocus, focusFirst]);

  useEffect(() => {
    const returnFocusElement =
      returnFocusTo && typeof returnFocusTo !== "function"
        ? returnFocusTo.current
        : null;

    return () => {
      if (!isActive && previousFocusRef.current) {
        let returnElement: HTMLElement | null = null;

        if (returnFocusTo) {
          if (typeof returnFocusTo === "function") {
            returnElement = returnFocusTo();
          } else {
            returnElement = returnFocusElement;
          }
        }

        if (!returnElement) {
          returnElement = previousFocusRef.current;
        }

        if (returnElement && document.contains(returnElement)) {
          returnElement.focus();
        }
      }
    };
  }, [isActive, returnFocusTo]);

  useEffect(() => {
    if (!isActive || !containerRef.current) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "Tab" || !containerRef.current) return;

      const focusableElements = getFocusableElements();
      if (focusableElements.length === 0) return;

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];
      const activeElement = document.activeElement;

      if (e.shiftKey) {
        if (
          activeElement === firstElement ||
          !containerRef.current.contains(activeElement)
        ) {
          e.preventDefault();
          lastElement?.focus();
        }
      } else {
        if (activeElement === lastElement) {
          e.preventDefault();
          firstElement?.focus();
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isActive, getFocusableElements]);

  return {
    containerRef,
    focusFirst,
    focusLast,
  };
}

export type { UseFocusTrapOptions, UseFocusTrapReturn };
export default useFocusTrap;
