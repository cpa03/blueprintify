import { useEffect } from "react";
import { DOM_ATTRIBUTES, DOM_EVENTS, DATA_BOOLEAN_VALUES } from "@blueprint/shared";

/**
 * usePageVisibilityAttribute - mirror document.visibilityState onto
 * documentElement as data-page-hidden="true"|"false".
 *
 * CSS in index.css pauses the always-on decorative loops (.ambient-glow,
 * .animate-logo-breathe, .text-gradient) while the attribute reads "true",
 * so a background tab costs zero animation frames (issue #3622 fix #2).
 * React never re-renders from this — the attribute is the single channel
 * consumed by the stylesheet.
 *
 * @example
 * ```tsx
 * // In the app root only:
 * usePageVisibilityAttribute();
 * ```
 */
export function usePageVisibilityAttribute(): void {
  useEffect(() => {
    const sync = (): void => {
      const hidden = document.visibilityState !== "visible";
      document.documentElement.setAttribute(
        DOM_ATTRIBUTES.PAGE_HIDDEN,
        hidden ? DATA_BOOLEAN_VALUES.TRUE : DATA_BOOLEAN_VALUES.FALSE
      );
    };

    sync();
    document.addEventListener(DOM_EVENTS.VISIBILITY_CHANGE, sync);
    return () => {
      document.removeEventListener(DOM_EVENTS.VISIBILITY_CHANGE, sync);
      document.documentElement.removeAttribute(DOM_ATTRIBUTES.PAGE_HIDDEN);
    };
  }, []);
}
