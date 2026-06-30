/**
 * ScrollToTop / ScrollToBottom - Floating scroll buttons with keyboard shortcuts
 *
 * A floating action button that appears when the user scrolls,
 * allowing them to quickly jump to the top or bottom of the page.
 * Supports both mouse/touch interaction and keyboard shortcuts.
 *
 * Features:
 * - Appears after configurable scroll threshold
 * - Smooth scroll animation
 * - Keyboard shortcut support (Home / End keys)
 * - Glassmorphism design with spring animations
 * - Tooltip showing keyboard shortcut
 * - Works with both window scroll and custom scroll containers
 *
 * @see ScrollProgress - For displaying reading progress indicator
 * @see SmartTooltip - For keyboard shortcut tooltip display
 */

import { useState, useEffect, useCallback, memo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { KeyboardShortcutTooltip } from "./SmartTooltip";
import { ANIMATION, SPRING_CONFIG, SCROLL_THRESHOLDS } from "../config/constants";
import { useReducedMotion } from "../hooks/useReducedMotion";

type ScrollDirection = "top" | "bottom";

/**
 * Props for the ScrollToPosition component
 */
interface ScrollToPositionProps {
  /**
   * Reference to a custom scroll container.
   * If not provided, uses window scroll.
   */
  scrollContainerRef?: React.RefObject<HTMLElement | null>;
  /**
   * Scroll position (in pixels) after which the button appears.
   * @default 400
   */
  showAfter?: number;
  /**
   * Whether to scroll to top or bottom.
   * @default "top"
   */
  direction?: ScrollDirection;
}

/**
 * Floating scroll-to-top/scroll-to-bottom button with keyboard shortcut support.
 *
 * @param props - Component props
 * @returns JSX element or null when not visible
 *
 * @example
 * ```tsx
 * // Scroll to top with window scroll
 * <ScrollToPosition />
 *
 * // Scroll to bottom with custom scroll container
 * <ScrollToPosition direction="bottom" scrollContainerRef={containerRef} showAfter={200} />
 * ```
 */
export const ScrollToPosition = memo(function ScrollToPosition({
  scrollContainerRef,
  showAfter = SCROLL_THRESHOLDS.SCROLL_TO_TOP,
  direction = "top",
}: ScrollToPositionProps): JSX.Element | null {
  const [isVisible, setIsVisible] = useState(false);
  const [hasScrolled, setHasScrolled] = useState(false);
  const [showEntryPulse, setShowEntryPulse] = useState(false);
  const prevVisibleRef = useRef(false);
  const prevScrollRef = useRef(0);
  const shouldReduceMotion = useReducedMotion();

  // Detect invisible→visible transition and trigger a subtle entry pulse
  // that draws the user's eye to the newly-appeared scroll button, then
  // fades out after 1.5s. The pulse only fires once per appearance cycle
  // (not on every scroll event while visible), so repeated pass-by scrolling
  // doesn't re-trigger the effect.
  useEffect(() => {
    if (isVisible && !prevVisibleRef.current) {
      setShowEntryPulse(true);
      const timer = setTimeout(() => setShowEntryPulse(false), SCROLL_THRESHOLDS.ENTRY_PULSE_MS);
      prevVisibleRef.current = true;
      return () => clearTimeout(timer);
    }
    prevVisibleRef.current = isVisible;
  }, [isVisible]);

  const isToTop = direction === "top";

  const getScrollContainer = useCallback(() => {
    return scrollContainerRef?.current || window;
  }, [scrollContainerRef]);

  const getScrollY = useCallback(() => {
    if (scrollContainerRef?.current) {
      return scrollContainerRef.current.scrollTop;
    }
    return window.scrollY;
  }, [scrollContainerRef]);

  const getMaxScroll = useCallback((): number => {
    if (scrollContainerRef?.current) {
      const el = scrollContainerRef.current;
      return Math.max(0, el.scrollHeight - el.clientHeight);
    }
    return Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
  }, [scrollContainerRef]);

  const scrollToTarget = useCallback(() => {
    const target = isToTop ? 0 : getMaxScroll();
    if (scrollContainerRef?.current) {
      scrollContainerRef.current.scrollTo({
        top: target,
        behavior: "smooth",
      });
    } else {
      window.scrollTo({
        top: target,
        behavior: "smooth",
      });
    }
  }, [scrollContainerRef, isToTop, getMaxScroll]);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = getScrollY();
      const maxScroll = getMaxScroll();
      prevScrollRef.current = scrollY;

      if (isToTop) {
        setHasScrolled(scrollY > SCROLL_THRESHOLDS.HAS_SCROLLED);
        setIsVisible(scrollY > showAfter);
      } else {
        setHasScrolled(scrollY < maxScroll - SCROLL_THRESHOLDS.HAS_SCROLLED);
        setIsVisible(scrollY < maxScroll - showAfter);
      }
    };

    const container = getScrollContainer();
    container.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => {
      container.removeEventListener("scroll", handleScroll);
    };
  }, [getScrollContainer, getScrollY, getMaxScroll, showAfter, isToTop]);

  useEffect(() => {
    const shortcutKey = isToTop ? "Home" : "End";

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === shortcutKey && !e.ctrlKey && !e.metaKey && !e.altKey) {
        const activeElement = document.activeElement;
        const isInputFocused =
          activeElement?.tagName === "INPUT" || activeElement?.tagName === "TEXTAREA";

        if (!isInputFocused && hasScrolled) {
          e.preventDefault();
          scrollToTarget();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [scrollToTarget, hasScrolled, isToTop]);

  const shortcutKey = isToTop ? "Home" : "End";
  const ariaLabel = isToTop
    ? `Scroll to top (${shortcutKey} key)`
    : `Scroll to bottom (${shortcutKey} key)`;
  const tooltipDescription = isToTop ? "Scroll to top" : "Scroll to bottom";
  const positionClass = isToTop
    ? "absolute bottom-4 right-4 z-20"
    : "absolute bottom-4 left-4 z-20";
  const tooltipPosition = isToTop ? ("left" as const) : ("right" as const);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 20 }}
          transition={{
            type: "spring",
            ...SPRING_CONFIG.DEFAULT,
          }}
          className={positionClass}
        >
          {/* Entry pulse ring — a subtle expanding glow that plays once when
              the button first appears, drawing the user's eye to the new UI
              without being distracting. Matches the primary color theme.
              Skipped when reduced motion is preferred. */}
          {!shouldReduceMotion && showEntryPulse && (
            <motion.div
              className="absolute inset-0 flex items-center justify-center pointer-events-none"
              initial={false}
              animate={{ opacity: [0.6, 0], scale: [0.85, 1.8] }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              aria-hidden="true"
            >
              <div className="w-10 h-10 rounded-full bg-primary-500/25 blur-sm" />
            </motion.div>
          )}

          <KeyboardShortcutTooltip
            shortcut={shortcutKey}
            description={tooltipDescription}
            position={tooltipPosition}
            modifier="none"
          >
            <motion.button
              onClick={scrollToTarget}
              className="w-10 h-10 rounded-full glass-card border-primary-500/30 
                         flex items-center justify-center
                         text-primary-400 hover:text-white
                         hover:bg-primary-500/20 hover:border-primary-500/50
                         focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/50
                         shadow-lg shadow-primary-500/10
                         transition-colors duration-200"
              aria-label={ariaLabel}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <motion.svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                initial={false}
                animate={isToTop ? { y: [2, -2, 2] } : { y: [-2, 2, -2] }}
                transition={{
                  duration: ANIMATION.FLOAT,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
                {isToTop ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 10l7-7m0 0l7 7m-7-7v18"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 14l-7 7m0 0l-7-7m7 7V3"
                  />
                )}
              </motion.svg>
            </motion.button>
          </KeyboardShortcutTooltip>
        </motion.div>
      )}
    </AnimatePresence>
  );
});

/**
 * Floating scroll-to-top button with keyboard shortcut support.
 * Uses ScrollToPosition with direction="top".
 *
 * @param props - Component props
 * @returns JSX element or null when not visible
 */
export const ScrollToTop = memo(function ScrollToTop(
  props: Omit<ScrollToPositionProps, "direction">
): JSX.Element | null {
  return <ScrollToPosition {...props} direction="top" />;
});

/**
 * Floating scroll-to-bottom button with keyboard shortcut support.
 * Uses ScrollToPosition with direction="bottom".
 *
 * Features:
 * - Appears when scrolled near the top
 * - Smooth scroll to bottom animation
 * - Keyboard shortcut support (End key)
 * - Glassmorphism design matching ScrollToTop
 * - Complementary positioning (bottom-left vs bottom-right)
 *
 * @param props - Component props
 * @returns JSX element or null when not visible
 *
 * @example
 * ```tsx
 * // With custom scroll container (e.g., editor preview pane)
 * <ScrollToBottom scrollContainerRef={previewRef} showAfter={200} />
 * ```
 */
export const ScrollToBottom = memo(function ScrollToBottom(
  props: Omit<ScrollToPositionProps, "direction">
): JSX.Element | null {
  return <ScrollToPosition {...props} direction="bottom" />;
});

export default ScrollToTop;
