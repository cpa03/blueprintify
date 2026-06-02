/**
 * OfflineBanner - Persistent offline connectivity indicator
 *
 * Displays a persistent banner when the browser detects the user is offline.
 * Unlike toast notifications (which auto-dismiss), this banner remains visible
 * until connectivity is restored, ensuring users are always aware of their
 * network status — a WCAG 2.1 Level A consideration for critical status messages.
 *
 * Features:
 * - Slides in/out with spring animation matching the app's design language
 * - Glassmorphism design with gradient accent
 * - Dismissible: user can close the banner if they've acknowledged the state
 * - Automatically hides when connectivity is restored
 * - Respects prefers-reduced-motion for accessibility
 * - Proper ARIA live region for screen reader announcements
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

import { useState, useCallback, useEffect, useRef, memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useOnlineStatus } from "../hooks";
import { useReducedMotion } from "../hooks/useReducedMotion";
import { SPRING_CONFIG, NETWORK_MESSAGES, ACCESSIBILITY_LABELS } from "../config/constants";

function OfflineBannerComponent(): JSX.Element | null {
  const { isOnline } = useOnlineStatus();
  const [isDismissed, setIsDismissed] = useState(false);
  const shouldReduceMotion = useReducedMotion();
  const prevOnlineRef = useRef(isOnline);

  const isVisible = !isOnline && !isDismissed;

  const handleDismiss = useCallback(() => {
    setIsDismissed(true);
  }, []);

  // Reset dismissed state when coming back online so banner can show again next time
  useEffect(() => {
    if (isOnline && !prevOnlineRef.current) {
      setIsDismissed(false);
    }
    prevOnlineRef.current = isOnline;
  }, [isOnline]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          role="status"
          aria-live="polite"
          aria-atomic="true"
          initial={
            shouldReduceMotion ? { opacity: 1, height: "auto" } : { opacity: 0, y: -20, height: 0 }
          }
          animate={
            shouldReduceMotion
              ? { opacity: 1, height: "auto" }
              : { opacity: 1, y: 0, height: "auto" }
          }
          exit={shouldReduceMotion ? { opacity: 0, height: 0 } : { opacity: 0, y: -20, height: 0 }}
          transition={
            shouldReduceMotion ? { duration: 0 } : { type: "spring", ...SPRING_CONFIG.SMOOTH }
          }
          className="overflow-hidden"
        >
          <div className="relative bg-gradient-to-r from-accent-pink/15 via-accent-pink/10 to-dark-900/80 border-b border-accent-pink/20 backdrop-blur-xl">
            {/* Gradient accent line */}
            <div
              className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-accent-pink/60 via-accent-pink/40 to-transparent"
              aria-hidden="true"
            />

            <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 min-w-0">
                {/* Pulsing warning icon */}
                <motion.span
                  className="relative flex h-5 w-5 flex-shrink-0"
                  animate={
                    shouldReduceMotion
                      ? {}
                      : {
                          scale: [1, 1.15, 1],
                        }
                  }
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  aria-hidden="true"
                >
                  {/* Ping ring */}
                  <motion.span
                    className="absolute inline-flex h-full w-full rounded-full bg-accent-pink opacity-30"
                    animate={
                      shouldReduceMotion
                        ? {}
                        : {
                            scale: [1, 1.6, 1],
                            opacity: [0.3, 0, 0.3],
                          }
                    }
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
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
                </motion.span>

                <div className="flex items-baseline gap-2 min-w-0">
                  <span className="text-sm font-semibold text-accent-pink whitespace-nowrap">
                    {NETWORK_MESSAGES.OFFLINE}
                  </span>
                  <span className="text-xs text-dark-400 hidden sm:inline truncate">
                    {ACCESSIBILITY_LABELS.OFFLINE_BANNER.DESCRIPTION}
                  </span>
                </div>
              </div>

              <motion.button
                onClick={handleDismiss}
                className="flex-shrink-0 opacity-60 hover:opacity-100 hover:bg-accent-pink/10
                           focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-pink/50
                           rounded-md p-1.5 transition-colors"
                aria-label={ACCESSIBILITY_LABELS.OFFLINE_BANNER.DISMISS}
                whileHover={shouldReduceMotion ? {} : { scale: 1.15, rotate: 90 }}
                whileTap={shouldReduceMotion ? {} : { scale: 0.9 }}
                transition={{ type: "spring", ...SPRING_CONFIG.SNAPPY }}
              >
                <svg
                  className="w-4 h-4 text-accent-pink"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </motion.button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export const OfflineBanner = memo(OfflineBannerComponent);

export default OfflineBanner;
