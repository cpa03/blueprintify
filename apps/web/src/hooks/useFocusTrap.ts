import { useEffect, useRef, useCallback, type RefObject } from "react";
import { FOCUSABLE_SELECTOR_STRING } from "../config/constants";

interface UseFocusTrapOptions {
  isActive: boolean;
  returnFocusTo?: RefObject<HTMLElement | null> | (() => HTMLElement | null);
  autoFocus?: boolean;
}

interface UseFocusTrapReturn {
  containerRef: RefObject<HTMLElement | null>;
  focusFirst: () => void;
  focusLast: () => void;
}

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
