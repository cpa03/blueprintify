/**
 * @fileoverview Hook for warning users before leaving the page during lossy work.
 *
 * Registers a native `beforeunload` listener that prompts the user before
 * closing or reloading the tab while `shouldWarn` is true. This protects
 * in-flight, non-recoverable work — most importantly the AI generation SSE
 * stream, whose chunks are persisted on a debounce and cannot be resumed
 * if the tab is closed mid-stream.
 *
 * The listener is registered once and reads the latest `shouldWarn` value
 * through a ref, so toggling the flag does not churn event listener setup.
 * When `shouldWarn` flips to false (or the hook unmounts), the listener is
 * removed and the browser's native confirmation dialog no longer appears.
 *
 * @module hooks/useBeforeUnload
 *
 * @example
 * ```tsx
 * const isGenerating = useEditorStore((s) => s.isGenerating);
 * useBeforeUnload(isGenerating);
 * ```
 */

import { useEffect, useRef } from "react";

/**
 * Registers a `beforeunload` guard while `shouldWarn` is true.
 *
 * @param shouldWarn - Whether the browser should prompt before the tab closes.
 * @returns Nothing — the guard is managed via a window event listener.
 *
 * @example
 * ```tsx
 * // Warn while the AI generation stream is in flight
 * useBeforeUnload(isGenerating);
 * ```
 */
export function useBeforeUnload(shouldWarn: boolean): void {
  // Keep the latest value in a ref so the single registered listener never
  // goes stale, avoiding listener re-registration on every render.
  const shouldWarnRef = useRef(shouldWarn);

  useEffect(() => {
    shouldWarnRef.current = shouldWarn;
  }, [shouldWarn]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleBeforeUnload = (event: BeforeUnloadEvent): void => {
      if (!shouldWarnRef.current) return;
      // Standard cross-browser trigger for the native confirmation dialog.
      // Modern browsers display their own generic message and ignore any
      // custom text, so only preventDefault + returnValue are needed.
      event.preventDefault();
      event.returnValue = "";
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, []);
}
