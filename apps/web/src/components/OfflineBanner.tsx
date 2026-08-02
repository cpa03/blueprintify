/**
 * OfflineBanner - Persistent offline connectivity indicator
 *
 * Displays a persistent banner when the browser detects the user is offline.
 * Unlike toast notifications (which auto-dismiss), this banner remains visible
 * until connectivity is restored, ensuring users are always aware of their
 * network status — a WCAG 2.1 Level A consideration for critical status messages.
 *
 * Features:
 * - Slides in/out with CSS transitions (no framer-motion needed)
 * - Glassmorphism design with gradient accent
 * - Dismissible: user can close the banner if they've acknowledged the state
 * - Automatically hides when connectivity is restored
 * - Respects prefers-reduced-motion for accessibility
 * - Proper ARIA live region for screen reader announcements
 *
 * @note This component intentionally avoids framer-motion to keep it out of
 *       the critical rendering path. CSS animations replace framer-motion
 *       since the animations here are simple (slide-in, pulse, hover).
 *
 * @see apps/web/src/hooks/useOnlineStatus.ts - Online status tracking hook
 * @see apps/web/src/config/constants.ts - NETWORK_MESSAGES configuration
 *
 * @example
 * ```tsx
 * // Render at the app root, below the header
 * <OfflineBanner />
 * ```
 */

import { useState, useCallback, useEffect, useLayoutEffect, useRef, memo } from "react";
import { useOnlineStatus } from "../hooks";
import { useReducedMotion } from "../hooks/useReducedMotion";
import { useToastStore } from "../store";
import {
  STYLE_ID_STRINGS,
  UI_TIMEOUTS,
  NETWORK_DEFAULTS,
  TOAST_TYPES,
} from "@blueprint/shared/config";
import {
  NETWORK_MESSAGES,
  ACCESSIBILITY_LABELS,
  OFFLINE_ANIMATION,
  TOOLTIP_CONFIG,
  FOCUS_ANNOUNCER,
} from "../config/constants";
import { Icon } from "./Icon";
import { SmartTooltip } from "./SmartTooltip";

/**
 * CSS keyframes injected once for the pulse-ring animation
 * and the banner slide entrance/exit animations.
 *
 * The banner uses GPU-composited transform + opacity for smooth
 * 60fps sliding — unlike a max-height transition which triggers
 * layout recalculations on every frame.
 *
 * Entrance: slides down from -100% to 0% with a gentle bounce
 * via an overshoot-friendly cubic-bezier so the velocity of the
 * incoming banner feels natural — like a notification ribbon
 * dropping into place. The bounce is subtle enough to feel
 * premium without being cartoony.
 *
 * Exit: smooth slide-up + fade for a clean dismissal, matching
 * the ease-out used throughout the rest of the app.
 *
 * The exit animation uses the Tailwind `animate-banner-exit` class
 * which is defined in tailwind.config.js with 0.3s duration.
 */

const pulseKeyframes = OFFLINE_ANIMATION.PULSE_RING_KEYFRAMES;
const pulseScaleKeyframes = OFFLINE_ANIMATION.PULSE_SCALE_KEYFRAMES;
const bannerEnterKeyframes = OFFLINE_ANIMATION.BANNER_ENTER_KEYFRAMES;
const bannerExitKeyframes = OFFLINE_ANIMATION.BANNER_EXIT_KEYFRAMES;

// Inject keyframes only once
if (typeof document !== "undefined") {
  const styleId = STYLE_ID_STRINGS.OFFLINE_BANNER;
  if (!document.getElementById(styleId)) {
    const style = document.createElement("style");
    style.id = styleId;
    style.textContent = [
      pulseKeyframes,
      pulseScaleKeyframes,
      bannerEnterKeyframes,
      bannerExitKeyframes,
    ].join("\n");
    document.head.appendChild(style);
  }
}

function OfflineBannerComponent(): JSX.Element | null {
  const { isOnline } = useOnlineStatus();
  const [isDismissed, setIsDismissed] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const exitTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const shouldReduceMotion = useReducedMotion();
  const prevOnlineRef = useRef(isOnline);
  const prevVisibleRef = useRef(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dismissAnnouncement, setDismissAnnouncement] = useState("");

  const isVisible = !isOnline && !isDismissed;
  const shouldRender = isVisible || isExiting;
  const shouldShowMaxHeight = isVisible || isExiting;

  const handleDismiss = useCallback(() => {
    setIsExiting(true);
    setIsDismissed(true);
    setDismissAnnouncement(ACCESSIBILITY_LABELS.OFFLINE_BANNER.DISMISS_ANNOUNCEMENT);
    // Clear the dismiss announcement after screen readers have had time to announce it
    setTimeout(() => setDismissAnnouncement(""), UI_TIMEOUTS.DISMISS_ANNOUNCEMENT_CLEAR);
  }, []);

  // Reset dismissed state when coming back online so banner can show again next time.
  // Uses useLayoutEffect so isExiting is set synchronously before the browser paints,
  // preventing a flash frame where the inner content unmounts before the exit animation.
  useLayoutEffect(() => {
    if (isOnline && !prevOnlineRef.current) {
      setIsExiting(true);
      setIsDismissed(false);
      // Show a brief success toast so sighted users get positive confirmation
      // that connectivity was restored — the banner simply slides away otherwise.
      useToastStore
        .getState()
        .addToast(
          NETWORK_MESSAGES.ONLINE,
          TOAST_TYPES.SUCCESS,
          NETWORK_DEFAULTS.ONLINE_DURATION_MS
        );
      // Announce connectivity was restored — the banner auto-hides so screen
      // reader users get explicit confirmation that they are back online
      setDismissAnnouncement(ACCESSIBILITY_LABELS.OFFLINE_BANNER.ONLINE_ANNOUNCEMENT);
      setTimeout(() => setDismissAnnouncement(""), UI_TIMEOUTS.DISMISS_ANNOUNCEMENT_CLEAR);
    }
    prevOnlineRef.current = isOnline;
  }, [isOnline]);

  // Animate exit when the banner transitions from visible to hidden (online or dismiss).
  // Uses a timer matching the CSS exit animation duration (300ms) so the inner content
  // stays mounted with the exit animation class long enough to play the slide-up + fade,
  // then cleanly unmounts while the outer container finishes its max-height collapse.
  useEffect(() => {
    if (prevVisibleRef.current && !isVisible) {
      setIsExiting(true);
      exitTimerRef.current = setTimeout(() => {
        setIsExiting(false);
        exitTimerRef.current = null;
      }, UI_TIMEOUTS.BANNER_EXIT_DURATION_MS);
    } else if (!prevVisibleRef.current && isVisible) {
      // Became visible mid-exit (rare race: offline toggled rapidly) — cancel exit
      if (exitTimerRef.current) {
        clearTimeout(exitTimerRef.current);
        exitTimerRef.current = null;
      }
      setIsExiting(false);
    }
    prevVisibleRef.current = isVisible;

    return () => {
      if (exitTimerRef.current) {
        clearTimeout(exitTimerRef.current);
        exitTimerRef.current = null;
      }
    };
  }, [isVisible]);

  return (
    <>
      <div
        ref={containerRef}
        role={isVisible ? "status" : undefined}
        aria-live={isVisible ? "polite" : undefined}
        aria-atomic={isVisible ? "true" : undefined}
        className={`overflow-hidden ${
          // Outer container handles layout space via max-height
          // while the inner banner slides with GPU-composited transform.
          // Uses shouldShowMaxHeight (includes exit state) so the container
          // stays open during the exit animation before cleanly collapsing.
          shouldReduceMotion
            ? shouldShowMaxHeight
              ? "max-h-16 opacity-100"
              : "max-h-0 opacity-0"
            : "transition-[max-height] duration-400 ease-out " +
              (shouldShowMaxHeight ? "max-h-16" : "max-h-0")
        }`}
        aria-hidden={!shouldRender}
      >
        {shouldRender && (
          <div
            className={`relative bg-gradient-to-r from-accent-pink/15 via-accent-pink/10 to-dark-900/80 border-b border-accent-pink/20 backdrop-blur-xl ${
              shouldReduceMotion ? "" : isVisible ? "animate-banner-enter" : "animate-banner-exit"
            }`}
          >
            {/* Gradient accent line */}
            <div
              className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-accent-pink/60 via-accent-pink/40 to-transparent"
              aria-hidden="true"
            />

            <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 min-w-0">
                {/* Pulsing warning icon — CSS animation replaces framer-motion */}
                <span
                  className="relative flex h-5 w-5 flex-shrink-0"
                  style={shouldReduceMotion ? {} : { animation: OFFLINE_ANIMATION.PULSE_SCALE }}
                  aria-hidden="true"
                >
                  {/* Ping ring */}
                  <span
                    className="absolute inline-flex h-full w-full rounded-full bg-accent-pink"
                    style={
                      shouldReduceMotion
                        ? { opacity: 0.3 }
                        : { animation: OFFLINE_ANIMATION.PULSE_RING }
                    }
                  />
                  <span className="relative inline-flex rounded-full h-5 w-5 bg-accent-pink/20 items-center justify-center">
                    <svg
                      className="w-3 h-3 text-accent-pink"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M18.364 5.636a9 9 0 010 12.728m-2.829-2.829a5 5 0 000-7.07m-4.243 4.243a1 1 0 010-1.414"
                      />
                    </svg>
                  </span>
                </span>

                <div className="flex items-baseline gap-2 min-w-0">
                  <span className="text-sm font-semibold text-accent-pink whitespace-nowrap">
                    {NETWORK_MESSAGES.OFFLINE}
                  </span>
                  <span className="text-xs text-dark-400 hidden sm:inline truncate">
                    {ACCESSIBILITY_LABELS.OFFLINE_BANNER.DESCRIPTION}
                  </span>
                </div>
              </div>

              <SmartTooltip
                content={ACCESSIBILITY_LABELS.OFFLINE_BANNER.DISMISS}
                position="left"
                delay={TOOLTIP_CONFIG.DEFAULT_SHOW_DELAY}
              >
                <button
                  onClick={handleDismiss}
                  className="flex-shrink-0 opacity-60 hover:opacity-100 hover:bg-accent-pink/10
                             focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-pink/50
                             rounded-md p-1.5 motion-safe:transition-all motion-safe:duration-200 motion-safe:ease-out
                             motion-safe:hover:scale-110 motion-safe:active:scale-95"
                  aria-label={ACCESSIBILITY_LABELS.OFFLINE_BANNER.DISMISS}
                >
                  <Icon name="close" className="w-4 h-4 text-accent-pink" />
                </button>
              </SmartTooltip>
            </div>
          </div>
        )}
      </div>

      {/* Screen reader announcement for dismiss and connectivity restoration —
          provides explicit feedback so screen reader users know the offline
          notice was dismissed or that connectivity was restored, since the
          banner auto-hides without a user-facing confirmation. */}
      <div
        className={FOCUS_ANNOUNCER.LIVE_REGION_CLASS}
        role="status"
        aria-live="assertive"
        aria-atomic="true"
      >
        {dismissAnnouncement}
      </div>
    </>
  );
}

export const OfflineBanner = memo(OfflineBannerComponent);

export default OfflineBanner;
