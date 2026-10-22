/**
 * @fileoverview Application header component with branding and navigation.
 *
 * This component provides:
 * - App logo and branding with gradient icon
 * - Keyboard shortcuts button (optional)
 * - GitHub repository link
 * - Scroll-triggered shadow for depth feedback
 *
 * The header uses glass morphism styling with backdrop blur and
 * Framer Motion for entrance animations. It's fixed at the top of
 * the viewport with proper z-index layering. When scrolled past
 * a 20px threshold, the border and shadow strengthen to provide
 * a subtle depth cue that content is behind the header.
 *
 * @module components/Header
 */

import { memo, useState, useEffect, useCallback } from "react";
import {
  ARIA_ATOMIC_VALUES,
  ARIA_HIDDEN_VALUES,
  ARIA_LIVE_VALUES,
  ARIA_ROLES,
  ICON_PATHS,
  MODIFIER_KEYS,
  SCROLL_BEHAVIOR,
  SHORTCUT_DESCRIPTIONS,
  SHORTCUT_LABELS,
  SVG_ICON_DEFAULTS,
} from "@blueprint/shared/config";
import {
  UI_CONTENT,
  EXTERNAL_URLS,
  SCROLL_THRESHOLDS,
  ACCESSIBILITY_LABELS,
  DOM_ELEMENT_IDS,
  FOCUS_ANNOUNCER,
  TIMEOUTS,
} from "../config/constants";
import { useReducedMotion } from "../hooks/useReducedMotion";
import { useReducedMotionContext } from "../context/ReducedMotionContext";
import { SAFE_AREA } from "../config/styles";
import { Icon } from "./Icon";
import { RippleButton } from "./RippleButton";
import { SmartTooltip, KeyboardShortcutTooltip } from "./SmartTooltip";

/**
 * Props for the Header component.
 */
interface HeaderProps {
  /** Callback fired when keyboard shortcuts button is clicked. */
  onShowShortcuts?: () => void;
  /** When false, the keyboard shortcut button shows an attention glow to
   *  help first-time users discover it. Once the user opens the shortcuts
   *  modal once, this becomes true and the glow stops permanently. */
  shortcutsDiscovered?: boolean;
}

/**
 * Application header component with branding and navigation.
 *
 * @param props - Component props
 * @param props.onShowShortcuts - Optional callback for keyboard shortcuts modal
 * @returns The rendered header element
 * @example
 * // Basic usage
 * <Header />
 * @example
 * // With shortcuts button
 * <Header onShowShortcuts={() => setShowShortcuts(true)} />
 */
function HeaderComponent({
  onShowShortcuts,
  shortcutsDiscovered = false,
}: HeaderProps): JSX.Element {
  const [isScrolled, setIsScrolled] = useState(false);
  const shouldReduceMotion = useReducedMotion();
  const { prefersReducedMotion, setUserOverride } = useReducedMotionContext();
  const [motionAnnouncement, setMotionAnnouncement] = useState("");

  // Empty the live region after announcers have read it, so stale text
  // doesn't accumulate (matches the OfflineBanner live-region pattern).
  useEffect(() => {
    if (!motionAnnouncement) return;
    const timer = setTimeout(() => setMotionAnnouncement(""), TIMEOUTS.LIVE_REGION_CLEAR);
    return () => clearTimeout(timer);
  }, [motionAnnouncement]);

  const toggleReducedMotion = useCallback(() => {
    const next = !prefersReducedMotion;
    setUserOverride(next);
    // This preference flips animation behavior app-wide; announce the change
    // via a live region so screen-reader users get audible confirmation the
    // global setting took effect (aria-pressed alone is not sufficient).
    setMotionAnnouncement(
      next
        ? ACCESSIBILITY_LABELS.HEADER.REDUCE_MOTION_ON
        : ACCESSIBILITY_LABELS.HEADER.REDUCE_MOTION_OFF
    );
  }, [prefersReducedMotion, setUserOverride]);

  const scrollToTop = useCallback(() => {
    window.scrollTo({
      top: 0,
      behavior: shouldReduceMotion ? SCROLL_BEHAVIOR.AUTO : SCROLL_BEHAVIOR.SMOOTH,
    });
  }, [shouldReduceMotion]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > SCROLL_THRESHOLDS.HEADER_SHADOW);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 glass-card backdrop-blur-xl transition-all duration-300 ${SAFE_AREA.TOP} ${SAFE_AREA.LEFT} ${SAFE_AREA.RIGHT} ${
        isScrolled
          ? "border-b border-dark-600/60 shadow-lg shadow-dark-950/30"
          : "border-b border-dark-700/50"
      }`}
      data-scrolled={isScrolled ? "true" : "false"}
      data-reduced-motion={prefersReducedMotion ? "true" : "false"}
      data-shortcuts-discovered={shortcutsDiscovered ? "true" : "false"}
      data-has-shortcuts={onShowShortcuts ? "true" : "false"}
    >
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <button
          onClick={scrollToTop}
          className="flex items-center gap-3 animate-fade-in-left cursor-pointer
                       focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/50
                       focus-visible:ring-offset-2 focus-visible:ring-offset-dark-950 rounded-xl
                       motion-safe:transition-transform motion-safe:duration-150
                       motion-safe:hover:scale-102 motion-safe:active:scale-98"
          title={ACCESSIBILITY_LABELS.HEADER.BRAND_SCROLL_TO_TOP}
          // aria-describedby (not the experimental aria-description) so screen
          // readers reliably announce the scroll-to-top action when the brand
          // button receives focus. The hint lives in a sibling sr-only span
          // rather than inside the button so it doesn't pollute the accessible
          // name computed from the button's visible text content.
          aria-describedby={DOM_ELEMENT_IDS.HEADER_BRAND_SCROLL_HINT}
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-accent-purple flex items-center justify-center animate-logo-breathe pointer-events-none">
            <svg
              className="w-6 h-6 text-white"
              viewBox={SVG_ICON_DEFAULTS.VIEW_BOX}
              fill={SVG_ICON_DEFAULTS.FILL_NONE}
              stroke={SVG_ICON_DEFAULTS.STROKE_CURRENT}
              strokeWidth={SVG_ICON_DEFAULTS.STROKE_WIDTH_DEFAULT}
              aria-hidden={ARIA_HIDDEN_VALUES.TRUE}
            >
              <path
                d={ICON_PATHS.BRAND_LOGO}
                strokeLinecap={SVG_ICON_DEFAULTS.STROKE_LINECAP_ROUND}
                strokeLinejoin={SVG_ICON_DEFAULTS.STROKE_LINEJOIN_ROUND}
              />
            </svg>
          </div>
          <div className="pointer-events-none">
            <div className="text-xl font-bold text-white">{UI_CONTENT.APP.NAME}</div>
            <p className="text-xs text-dark-400">{UI_CONTENT.APP.TAGLINE}</p>
          </div>
        </button>
        <span id={DOM_ELEMENT_IDS.HEADER_BRAND_SCROLL_HINT} className="sr-only">
          {ACCESSIBILITY_LABELS.HEADER.BRAND_SCROLL_TO_TOP}
        </span>

        <nav
          className="flex items-center gap-2 animate-slide-in-right"
          aria-label={ACCESSIBILITY_LABELS.NAV.MAIN}
        >
          <SmartTooltip
            content={
              prefersReducedMotion
                ? ACCESSIBILITY_LABELS.HEADER.REDUCE_MOTION_ON
                : ACCESSIBILITY_LABELS.HEADER.REDUCE_MOTION_OFF
            }
            position="bottom"
          >
            <RippleButton
              onClick={toggleReducedMotion}
              className={`btn-ghost flex items-center justify-center w-10 h-10 ${
                prefersReducedMotion
                  ? "bg-primary-500/20 border border-primary-500/50 text-primary-300"
                  : ""
              }`}
              ariaLabel={ACCESSIBILITY_LABELS.HEADER.REDUCE_MOTION}
              title={ACCESSIBILITY_LABELS.HEADER.REDUCE_MOTION}
              aria-pressed={prefersReducedMotion}
            >
              <Icon name="wind" className="w-5 h-5" />
            </RippleButton>
          </SmartTooltip>
          {onShowShortcuts && (
            <KeyboardShortcutTooltip
              shortcut={SHORTCUT_LABELS.SHORTCUTS_MODAL}
              description={SHORTCUT_DESCRIPTIONS.SHOW_KEYBOARD_SHORTCUTS}
              position="bottom"
              modifier={MODIFIER_KEYS.NONE}
            >
              <RippleButton
                onClick={onShowShortcuts}
                className={`btn-ghost flex items-center justify-center w-10 h-10 ${!shortcutsDiscovered ? "attention-glow" : ""}`}
                ariaLabel={ACCESSIBILITY_LABELS.HEADER.KEYBOARD_SHORTCUTS}
                title={ACCESSIBILITY_LABELS.HEADER.KEYBOARD_SHORTCUTS}
                aria-keyshortcuts={SHORTCUT_LABELS.SHORTCUTS_MODAL}
              >
                <svg
                  className="w-5 h-5"
                  fill={SVG_ICON_DEFAULTS.FILL_NONE}
                  stroke={SVG_ICON_DEFAULTS.STROKE_CURRENT}
                  viewBox={SVG_ICON_DEFAULTS.VIEW_BOX}
                  aria-hidden={ARIA_HIDDEN_VALUES.TRUE}
                >
                  <path
                    strokeLinecap={SVG_ICON_DEFAULTS.STROKE_LINECAP_ROUND}
                    strokeLinejoin={SVG_ICON_DEFAULTS.STROKE_LINEJOIN_ROUND}
                    strokeWidth={SVG_ICON_DEFAULTS.STROKE_WIDTH_DEFAULT}
                    d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </RippleButton>
            </KeyboardShortcutTooltip>
          )}
          <RippleButton
            onClick={() => window.open(EXTERNAL_URLS.GITHUB, "_blank", "noopener,noreferrer")}
            className="btn-ghost flex items-center gap-2 group"
            ariaLabel={ACCESSIBILITY_LABELS.HEADER.GITHUB}
            title={ACCESSIBILITY_LABELS.HEADER.GITHUB}
          >
            <svg
              className="w-5 h-5"
              fill={SVG_ICON_DEFAULTS.FILL_CURRENT}
              viewBox={SVG_ICON_DEFAULTS.VIEW_BOX}
              aria-hidden={ARIA_HIDDEN_VALUES.TRUE}
            >
              <path d={ICON_PATHS.GITHUB} />
            </svg>
            <span className="hidden sm:inline">{UI_CONTENT.BUTTONS.GITHUB}</span>
            {/* External link indicator — appears on hover to signal the link
                opens in a new tab, providing a visual cue that complements
                the "opens in new tab" text in the aria-label for screen readers. */}
            <Icon
              name="externalLink"
              className="w-3 h-3 opacity-0 group-hover:opacity-60 group-focus-visible:opacity-60 transition-all duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-focus-visible:-translate-y-0.5 group-focus-visible:translate-x-0.5"
            />
          </RippleButton>
        </nav>
      </div>

      {/* Live region announcing the reduce-motion preference toggle */}
      <div
        className={FOCUS_ANNOUNCER.LIVE_REGION_CLASS}
        role={ARIA_ROLES.STATUS}
        aria-live={ARIA_LIVE_VALUES.POLITE}
        aria-atomic={ARIA_ATOMIC_VALUES.TRUE}
      >
        {motionAnnouncement}
      </div>
    </header>
  );
}

/**
 * Memoized header component export.
 * Re-renders only when onShowShortcuts prop changes.
 */
export const Header = memo(HeaderComponent);
