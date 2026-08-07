/**
 * @fileoverview Accessible scroll utilities.
 *
 * Centralized source of truth for programmatic scroll behavior. All scrollTo /
 * scrollIntoView calls across the app should route through {@link getScrollBehavior}
 * so they respect the user's `prefers-reduced-motion` preference.
 *
 * Why this matters: most browsers ignore the CSS `scroll-behavior: smooth`
 * override in the `@media (prefers-reduced-motion: reduce)` block for JS-driven
 * scroll calls. A JS scroll call with an explicit `behavior: "smooth"` will
 * still animate even for reduced-motion users. Routing through this helper
 * keeps programmatic scrolling consistent with the app's CSS-only reduced-motion
 * handling (see `index.css`).
 */

import { SCROLL_BEHAVIOR } from "../config/constants";

/**
 * Returns the appropriate scroll behavior based on the user's motion preference.
 * When `prefers-reduced-motion` is active, returns "instant" to prevent unwanted
 * smooth-scroll animations. Safe to call on the server (SSR) — falls back to
 * "auto" when `window` is unavailable.
 *
 * @returns `"instant"` under reduced motion, `"smooth"` otherwise (or `"auto"` for SSR)
 *
 * @example
 * ```typescript
 * import { getScrollBehavior } from "../utils/scroll";
 * element.scrollIntoView({ behavior: getScrollBehavior(), block: "nearest" });
 * container.scrollTo({ top: 0, behavior: getScrollBehavior() });
 * ```
 */
export function getScrollBehavior(): ScrollBehavior {
  if (typeof window === "undefined") return SCROLL_BEHAVIOR.AUTO;
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  return prefersReducedMotion ? SCROLL_BEHAVIOR.INSTANT : SCROLL_BEHAVIOR.SMOOTH;
}

export default getScrollBehavior;
