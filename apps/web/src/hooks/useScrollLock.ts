/**
 * @fileoverview Hook for locking body scroll with scrollbar-gutter compensation.
 *
 * When a modal opens and we set `overflow: hidden` on the body, the scrollbar
 * disappears and the page content shifts right by the scrollbar width (typically
 * 15-17px), causing a jarring layout shift. This hook compensates by adding
 * `padding-right` equal to the lost scrollbar width.
 *
 * The hook handles:
 * - Scrollbar width detection (cross-browser)
 * - Automatic padding-right compensation when locking
 * - Clean restoration of original overflow/padding values on unlock
 * - Safe cleanup on unmount
 * - SSR safety (noop when `document` is undefined)
 *
 * @module hooks/useScrollLock
 *
 * @example
 * ```tsx
 * function Modal({ isOpen }: { isOpen: boolean }) {
 *   useScrollLock(isOpen);
 *   return isOpen ? <div role="dialog">...</div> : null;
 * }
 * ```
 */

import { useEffect, useRef } from "react";

/**
 * Detects the width of the browser's vertical scrollbar.
 *
 * Creates a temporary 100px-wide div with overflow:scroll, measures the
 * difference between its offset width (100px) and client width (100px minus
 * the scrollbar) to precisely determine scrollbar pixel width across all
 * browsers and OS combinations.
 *
 * @returns The scrollbar width in pixels. Returns 0 when called server-side.
 */
function getScrollbarWidth(): number {
  if (typeof document === "undefined") return 0;

  // Use cached value if already calculated
  const cached = (document as unknown as Record<string, number>).__scrollbarWidth;
  if (cached !== undefined) return cached;

  const div = document.createElement("div");
  div.style.cssText =
    "overflow:scroll;overflow-y:scroll;position:absolute;top:-9999px;width:100px;height:100px;";
  document.body.appendChild(div);
  const width = div.offsetWidth - div.clientWidth;
  document.body.removeChild(div);

  // Cache the value — scrollbar width doesn't change during a session
  // unless the user switches touch/scrollbar modes in OS settings.
  // This is rare enough that a one-time measurement is production-safe.
  (document as unknown as Record<string, number>).__scrollbarWidth = width;

  return width;
}

/**
 * Restores the original overflow and paddingRight values on the body.
 */
function restoreBodyStyles(originalOverflow: string, originalPaddingRight: string): void {
  document.body.style.overflow = originalOverflow;
  document.body.style.paddingRight = originalPaddingRight;
}

export interface UseScrollLockOptions {
  /**
   * Whether scroll locking is currently active.
   */
  isLocked: boolean;
}

/**
 * Hook that locks body scroll with automatic scrollbar-gutter compensation.
 *
 * When scrolling is locked (`isLocked = true`), this hook:
 * 1. Measures the current scrollbar width
 * 2. Sets `overflow: hidden` on `document.body`
 * 3. Adds the scrollbar width as `padding-right` to prevent layout shift
 *
 * When unlocked (`isLocked = false`), restores the original values.
 *
 * @param options - Configuration for the scroll lock behavior
 *
 * @example
 * ```tsx
 * function Modal({ open }: { open: boolean }) {
 *   useScrollLock({ isLocked: open });
 *   return <div role="dialog">...</div>;
 * }
 * ```
 */
export function useScrollLock({ isLocked }: UseScrollLockOptions): void {
  const originalStylesRef = useRef<{ overflow: string; paddingRight: string } | null>(null);

  useEffect(() => {
    // SSR safety — noop outside the browser
    if (typeof document === "undefined") return;

    if (isLocked) {
      // Save original styles on first lock only (not on re-locks)
      if (!originalStylesRef.current) {
        originalStylesRef.current = {
          overflow: document.body.style.overflow,
          paddingRight: document.body.style.paddingRight,
        };
      }

      const scrollbarWidth = getScrollbarWidth();

      // Only compensate if there's an actual scrollbar width to account for,
      // and if the body isn't already overflow:hidden (which would mean the
      // scrollbar is already gone, so no compensation needed).
      const isAlreadyHidden = document.body.style.overflow === "hidden";

      if (!isAlreadyHidden && scrollbarWidth > 0) {
        const currentPadding = parseFloat(document.body.style.paddingRight) || 0;
        document.body.style.paddingRight = `${currentPadding + scrollbarWidth}px`;
      }

      document.body.style.overflow = "hidden";
    } else {
      // Restore original styles
      if (originalStylesRef.current) {
        restoreBodyStyles(
          originalStylesRef.current.overflow,
          originalStylesRef.current.paddingRight
        );
        originalStylesRef.current = null;
      }
    }

    // Cleanup on unmount — always restore original styles
    return () => {
      if (originalStylesRef.current) {
        restoreBodyStyles(
          originalStylesRef.current.overflow,
          originalStylesRef.current.paddingRight
        );
        originalStylesRef.current = null;
      }
    };
  }, [isLocked]);
}
