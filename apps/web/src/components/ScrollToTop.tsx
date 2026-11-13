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
 * - Stays visible while focused (WCAG 2.4.7): activating the button scrolls
 *   the page past its hide threshold, but the button remains mounted until
 *   focus leaves it so keyboard users don't lose their place to <body>
 *
 * @see ScrollProgress - For displaying reading progress indicator
 * @see SmartTooltip - For keyboard shortcut tooltip display
 */

import { useState, useEffect, useCallback, memo, useRef } from "react";
import { DOM_EVENTS } from "@blueprint/shared/config";
import * as motion from "framer-motion/m";
import { AnimatePresence } from "framer-motion";
import { ANIMATION_SCALE, ANIMATION_Y_OFFSET, DATA_BOOLEAN_VALUES } from "@blueprint/shared";
import { KeyboardShortcutTooltip } from "./SmartTooltip";
import {
  ANIMATION,
  EASING,
  SPRING_CONFIG,
  HOVER_SCALE,
  TAP_SCALE,
  SCROLL_THRESHOLDS,
  ACCESSIBILITY_LABELS,
  KEYBOARD_SHORTCUTS,
  SCROLL_BEHAVIOR,
  DIRECTION,
} from "../config/constants";
import {
  ANIMATION_DEFAULTS,
  ANIMATION_REPEAT,
  FRAMER_TYPE,
  MODIFIER_KEYS,
  BANNER_STATE_VALUES,
  ARIA_HIDDEN_VALUES,
} from "@blueprint/shared/config";
import { useReducedMotion } from "../hooks/useReducedMotion";
import { isEditableField } from "../lib/dom";
import { ICON_PATHS, SVG_ICON_DEFAULTS } from "@blueprint/shared/config";

type ScrollDirection = typeof DIRECTION.TOP | typeof DIRECTION.BOTTOM;

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
  /**
   * When true, applies a subtle repeating pulse ring around the button
   * while it is visible. Designed for the scroll-to-bottom button during
   * content generation — draws the user's eye back to the bottom when
   * new content is streaming in but they've scrolled up to read.
   * Skipped when reduced motion is preferred.
   * @default false
   */
  pulseWhenActive?: boolean;
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
const ScrollToPosition = memo(function ScrollToPosition({
  scrollContainerRef,
  showAfter = SCROLL_THRESHOLDS.SCROLL_TO_TOP,
  direction = DIRECTION.TOP,
  pulseWhenActive = false,
}: ScrollToPositionProps): JSX.Element | null {
  const [isVisible, setIsVisible] = useState(false);
  const [hasScrolled, setHasScrolled] = useState(false);
  const [showEntryPulse, setShowEntryPulse] = useState(false);
  // Focus retention: activating the button scrolls past its hide threshold,
  // which would unmount the button mid-interaction and drop keyboard focus
  // to <body> (WCAG 2.4.7). While focus is inside the button, keep it mounted
  // so the user can see where their focus is; it hides again on blur.
  const [isFocusWithin, setIsFocusWithin] = useState(false);
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

  // React's onFocus/onBlur bubble (focusin/focusout), so events from the
  // inner button reach the wrapper. relatedTarget check ensures Tabbing out
  // of the button clears the retention flag; moving focus between elements
  // inside the wrapper (e.g. tooltip content, if ever focusable) keeps it.
  const handleFocus = useCallback(() => {
    setIsFocusWithin(true);
  }, []);

  const handleBlur = useCallback((e: React.FocusEvent<HTMLDivElement>) => {
    if (!e.currentTarget.contains(e.relatedTarget as Node | null)) {
      setIsFocusWithin(false);
    }
  }, []);

  const isToTop = direction === DIRECTION.TOP;

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
    const behavior = shouldReduceMotion ? SCROLL_BEHAVIOR.AUTO : SCROLL_BEHAVIOR.SMOOTH;
    if (scrollContainerRef?.current) {
      scrollContainerRef.current.scrollTo({
        top: target,
        behavior,
      });
    } else {
      window.scrollTo({
        top: target,
        behavior,
      });
    }
  }, [scrollContainerRef, isToTop, getMaxScroll, shouldReduceMotion]);

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
    container.addEventListener(DOM_EVENTS.SCROLL, handleScroll, { passive: true });
    handleScroll();

    return () => {
      container.removeEventListener(DOM_EVENTS.SCROLL, handleScroll);
    };
  }, [getScrollContainer, getScrollY, getMaxScroll, showAfter, isToTop]);

  const shortCutKey = isToTop
    ? KEYBOARD_SHORTCUTS.SCROLL_TO_TOP.KEY
    : KEYBOARD_SHORTCUTS.SCROLL_TO_BOTTOM.KEY;

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === shortCutKey && !e.ctrlKey && !e.metaKey && !e.altKey) {
        // Don't hijack Home/End inside editable surfaces (e.g. CodeMirror).
        if (isEditableField(e.target)) {
          return;
        }

        if (hasScrolled) {
          e.preventDefault();
          scrollToTarget();
        }
      }
    };

    window.addEventListener(DOM_EVENTS.KEYDOWN, handleKeyDown);
    return () => window.removeEventListener(DOM_EVENTS.KEYDOWN, handleKeyDown);
  }, [scrollToTarget, hasScrolled, isToTop, shortCutKey]);

  const ariaLabel = isToTop
    ? ACCESSIBILITY_LABELS.SCROLL_POSITION.SCROLL_TO_TOP_ARIA(shortCutKey)
    : ACCESSIBILITY_LABELS.SCROLL_POSITION.SCROLL_TO_BOTTOM_ARIA(shortCutKey);
  const tooltipDescription = isToTop
    ? ACCESSIBILITY_LABELS.SCROLL_POSITION.SCROLL_TO_TOP_TOOLTIP
    : ACCESSIBILITY_LABELS.SCROLL_POSITION.SCROLL_TO_BOTTOM_TOOLTIP;
  const positionClass = isToTop
    ? "absolute bottom-4 right-4 z-20"
    : "absolute bottom-4 left-4 z-20";
  const tooltipPosition = isToTop ? DIRECTION.LEFT : DIRECTION.RIGHT;

  return (
    <AnimatePresence>
      {(isVisible || isFocusWithin) && (
        <motion.div
          initial={{
            opacity: 0,
            scale: ANIMATION_SCALE.STANDARD,
            y: ANIMATION_Y_OFFSET.DROP_LARGE,
          }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: ANIMATION_SCALE.STANDARD, y: ANIMATION_Y_OFFSET.DROP_LARGE }}
          transition={{
            type: FRAMER_TYPE.SPRING,
            ...SPRING_CONFIG.DEFAULT,
          }}
          className={positionClass}
          onFocus={handleFocus}
          onBlur={handleBlur}
          data-state={BANNER_STATE_VALUES.VISIBLE}
          data-has-scrolled={hasScrolled}
          data-focus-within={isFocusWithin}
          data-reduced-motion={
            shouldReduceMotion ? DATA_BOOLEAN_VALUES.TRUE : DATA_BOOLEAN_VALUES.FALSE
          }
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
              transition={{ duration: ANIMATION.ENTRY_PULSE, ease: EASING.easeOut }}
              aria-hidden={ARIA_HIDDEN_VALUES.TRUE}
            >
              <div className="w-10 h-10 rounded-full bg-primary-500/25 blur-sm" />
            </motion.div>
          )}

          {/* Streaming pulse ring — a repeating gentle glow that plays
              continuously while content is actively generating and the user
              has scrolled away from the bottom. This draws the eye back to
              the scroll-to-bottom button, signaling "new content below"
              without needing an obtrusive toast or banner. The ring uses
              a slow breathe-in/breathe-out that subtly catches peripheral
              attention without being distracting. The green accent color
              semantically maps to "new content available" (like a green
              notification dot). Skipped when reduced motion is preferred. */}
          {!shouldReduceMotion && isVisible && pulseWhenActive && !isToTop && (
            <motion.div
              className="absolute inset-0 flex items-center justify-center pointer-events-none"
              initial={false}
              animate={{
                opacity: [0.5, 0.15, 0.5],
                scale: [1, 1.3, 1],
              }}
              transition={{
                duration: ANIMATION.BREATH,
                repeat: ANIMATION_REPEAT.INFINITE,
                ease: EASING.easeInOut,
              }}
              aria-hidden={ARIA_HIDDEN_VALUES.TRUE}
            >
              <div className="w-10 h-10 rounded-full bg-accent-emerald/25 blur-sm" />
            </motion.div>
          )}

          <KeyboardShortcutTooltip
            shortcut={shortCutKey}
            description={tooltipDescription}
            position={tooltipPosition}
            modifier={MODIFIER_KEYS.NONE}
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
              aria-keyshortcuts={shortCutKey}
              data-direction={direction}
              data-state={BANNER_STATE_VALUES.VISIBLE}
              data-has-scrolled={hasScrolled}
              data-reduced-motion={
                shouldReduceMotion ? DATA_BOOLEAN_VALUES.TRUE : DATA_BOOLEAN_VALUES.FALSE
              }
              whileHover={HOVER_SCALE.STRONG}
              whileTap={TAP_SCALE.STANDARD}
            >
              <motion.svg
                className="w-5 h-5"
                fill={SVG_ICON_DEFAULTS.FILL_NONE}
                stroke={SVG_ICON_DEFAULTS.STROKE_CURRENT}
                viewBox={SVG_ICON_DEFAULTS.VIEW_BOX}
                aria-hidden={ARIA_HIDDEN_VALUES.TRUE}
                initial={false}
                // Respect prefers-reduced-motion (WCAG 2.3.3): the gentle
                // floating arrow loop is purely decorative, so it stays
                // static for vestibular-sensitive users while remaining
                // fully functional. Other pulses in this file already guard
                // on shouldReduceMotion — this was the one missed loop.
                animate={
                  shouldReduceMotion ? { y: 0 } : isToTop ? { y: [2, -2, 2] } : { y: [-2, 2, -2] }
                }
                transition={
                  shouldReduceMotion
                    ? ANIMATION_DEFAULTS.ZERO_DURATION
                    : {
                        duration: ANIMATION.FLOAT,
                        repeat: ANIMATION_REPEAT.INFINITE,
                        ease: EASING.easeInOut,
                      }
                }
              >
                {isToTop ? (
                  <path
                    strokeLinecap={SVG_ICON_DEFAULTS.STROKE_LINECAP_ROUND}
                    strokeLinejoin={SVG_ICON_DEFAULTS.STROKE_LINEJOIN_ROUND}
                    strokeWidth={SVG_ICON_DEFAULTS.STROKE_WIDTH_DEFAULT}
                    d={ICON_PATHS.CHEVRON_UP}
                  />
                ) : (
                  <path
                    strokeLinecap={SVG_ICON_DEFAULTS.STROKE_LINECAP_ROUND}
                    strokeLinejoin={SVG_ICON_DEFAULTS.STROKE_LINEJOIN_ROUND}
                    strokeWidth={SVG_ICON_DEFAULTS.STROKE_WIDTH_DEFAULT}
                    d={ICON_PATHS.CHEVRON_DOWN}
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
  return <ScrollToPosition {...props} direction={DIRECTION.TOP} />;
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
  return <ScrollToPosition {...props} direction={DIRECTION.BOTTOM} />;
});

export default ScrollToTop;
