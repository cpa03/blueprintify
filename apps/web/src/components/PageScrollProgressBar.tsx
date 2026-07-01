/**
 * PageScrollProgressBar - Window-level scroll progress indicator
 *
 * A thin gradient progress bar that appears at the top of the page (below the
 * fixed header) showing how far the user has scrolled through the main content.
 * Fades in after scrolling past a threshold and fades out near the top.
 *
 * This complements the editor-level ScrollProgress and provides the same
 * reading-context cue at the page level — helping users gauge how much
 * content remains without needing to scroll to the bottom.
 *
 * Interactive features:
 * - Click/tap anywhere on the bar to jump to that scroll position
 * - Hover reveals a thumb indicator for discoverability
 * - Keyboard accessible with proper ARIA progressbar role
 * - Smooth spring-based scroll animation
 * - Window scroll detection (no container ref needed)
 * - Gradient progress bar matching the app's design language
 * - Fade in/out based on scroll position
 * - Respects prefers-reduced-motion
 *
 * @module components/PageScrollProgressBar
 *
 * @example
 * ```tsx
 * // Mount at app root, below the header
 * <PageScrollProgressBar />
 * ```
 */

import { useState, useEffect, useCallback, useRef, memo } from "react";
import { motion, useSpring, useTransform } from "framer-motion";
import { useReducedMotion } from "../hooks/useReducedMotion";
import { LAYOUT, SCROLL_PROGRESS_SPRING } from "../config/theme";
import { ANIMATION } from "../config/constants";
import { ACCESSIBILITY_LABELS } from "../config/constants/content";
import { SCROLL_PROGRESS_DEFAULTS } from "@blueprint/shared";

interface PageScrollProgressBarProps {
  /**
   * Scroll threshold (in px) before the bar appears.
   * @default 80
   */
  showAfter?: number;
  /**
   * Height of the progress bar in pixels.
   * @default 2
   */
  height?: number;
  /**
   * Additional className for styling.
   */
  className?: string;
}

/**
 * Window-level scroll progress indicator with interactive click-to-scrub.
 *
 * @param props - Component props
 * @returns The rendered progress bar or null when not visible
 */
function PageScrollProgressBarComponent({
  showAfter = SCROLL_PROGRESS_DEFAULTS.PAGE_PROGRESS_SHOW_AFTER_PX,
  height = SCROLL_PROGRESS_DEFAULTS.PAGE_PROGRESS_BAR_HEIGHT_PX,
  className = "",
}: PageScrollProgressBarProps): JSX.Element | null {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [hoverProgress, setHoverProgress] = useState<number | null>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useReducedMotion();

  const calculateProgress = useCallback(() => {
    const scrollTop = window.scrollY;
    const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;

    if (scrollHeight <= 0) return 0;

    const progress = (scrollTop / scrollHeight) * 100;
    return Math.min(Math.max(progress, 0), 100);
  }, []);

  /**
   * Converts a click position on the bar to a scroll position and scrolls there.
   * Calculates the ratio of the click X to the bar width, then maps that
   * ratio to the total scrollable distance of the page.
   */
  const handleBarHover = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const bar = barRef.current;
    if (!bar) return;
    const rect = bar.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    setHoverProgress(Math.round(ratio * 100));
  }, []);

  const handleBarHoverEnd = useCallback(() => {
    setHoverProgress(null);
  }, []);

  const handleBarClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement> | React.KeyboardEvent<HTMLDivElement>) => {
      const bar = barRef.current;
      if (!bar) return;

      let clickRatio: number;

      if ("clientX" in e) {
        // Mouse/touch click — calculate position from cursor
        const rect = bar.getBoundingClientRect();
        clickRatio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
      } else {
        // Keyboard event — arrow keys nudge by 10%, Home/End go to 0%/100%
        const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
        if (scrollHeight <= 0) return;

        const currentScroll = window.scrollY;
        const step = scrollHeight * 0.1;
        let targetScroll = currentScroll;

        switch (e.key) {
          case "Enter":
          case " ":
          case "ArrowRight":
          case "ArrowDown":
            e.preventDefault();
            targetScroll = Math.min(scrollHeight, currentScroll + step);
            break;
          case "ArrowLeft":
          case "ArrowUp":
            e.preventDefault();
            targetScroll = Math.max(0, currentScroll - step);
            break;
          case "Home":
            e.preventDefault();
            targetScroll = 0;
            break;
          case "End":
            e.preventDefault();
            targetScroll = scrollHeight;
            break;
          default:
            return;
        }

        window.scrollTo({ top: targetScroll, behavior: "smooth" });
        return;
      }

      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (scrollHeight <= 0) return;

      const targetScroll = clickRatio * scrollHeight;
      window.scrollTo({ top: targetScroll, behavior: "smooth" });
    },
    []
  );

  const springConfig = prefersReducedMotion
    ? SCROLL_PROGRESS_SPRING.PAGE_BAR_REDUCED
    : SCROLL_PROGRESS_SPRING.PAGE_BAR_NORMAL;

  const smoothProgress = useSpring(0, springConfig);
  const width = useTransform(smoothProgress, [0, 100], ["0%", "100%"]);

  useEffect(() => {
    const handleScroll = () => {
      const progress = calculateProgress();
      const scrollTop = window.scrollY;

      setScrollProgress(progress);
      setIsVisible(scrollTop > showAfter && progress < 100);

      smoothProgress.set(progress);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [calculateProgress, showAfter, smoothProgress]);

  useEffect(() => {
    smoothProgress.set(scrollProgress);
  }, [scrollProgress, smoothProgress]);

  return (
    <motion.div
      className={`fixed top-0 left-0 right-0 z-40 ${className}`}
      style={{ marginTop: `${LAYOUT.HEADER_HEIGHT_PX}px` }}
      initial={{ opacity: 0 }}
      animate={{ opacity: isVisible ? 1 : 0 }}
      transition={{ duration: prefersReducedMotion ? 0 : 0.25, ease: "easeOut" }}
      role="progressbar"
      aria-valuenow={isVisible ? Math.round(scrollProgress) : undefined}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={ACCESSIBILITY_LABELS.SCROLL_PROGRESS.PAGE_SCROLL_POSITION}
      tabIndex={isVisible ? 0 : -1}
      onKeyDown={isVisible ? handleBarClick : undefined}
    >
      <div
        ref={barRef}
        className="relative w-full cursor-pointer group"
        style={{ height: `${height + (isHovered ? 6 : 0)}px` }}
        onClick={isVisible ? handleBarClick : undefined}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => {
          setIsHovered(false);
          handleBarHoverEnd();
        }}
        onMouseMove={isVisible ? handleBarHover : undefined}
      >
        {/* Track background */}
        <div className="absolute inset-0 bg-dark-800/30 backdrop-blur-sm transition-all duration-200 group-hover:bg-dark-800/50" />

        {/* Filled progress */}
        <motion.div
          className="relative h-full bg-gradient-to-r from-primary-500 via-accent-purple to-accent-pink"
          style={{ width }}
          initial={{ opacity: 0.8 }}
          animate={
            isVisible
              ? {
                  opacity: [0.8, 1, 0.8],
                }
              : { opacity: 0.8 }
          }
          transition={{
            opacity: {
              duration: ANIMATION.BREATH,
              repeat: Infinity,
              ease: "easeInOut",
            },
          }}
        />

        {/* Hover thumb — a small dot at the leading edge that appears on hover
            to signal the bar is interactive and clickable. Uses a spring pop
            for a tactile feel. */}
        <motion.div
          className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-white shadow-lg shadow-primary-500/40 border-2 border-primary-400 pointer-events-none"
          style={{
            left: `calc(${scrollProgress}% - 6px)`,
          }}
          initial={false}
          animate={{
            scale: isHovered && isVisible ? 1 : 0,
            opacity: isHovered && isVisible ? 1 : 0,
          }}
          transition={{
            type: "spring",
            stiffness: 400,
            damping: 20,
            mass: 0.3,
          }}
        />

        {/* Subtle trailing glow — a small gradient flare that follows the
            progress bar's leading edge, giving it a "live" feel as it
            advances. */}
        <motion.div
          className="absolute top-0 h-full w-10 pointer-events-none"
          style={{
            right: `calc(${100 - scrollProgress}% - 20px)`,
            background:
              "linear-gradient(90deg, transparent 0%, color-mix(in srgb, var(--color-primary-500) 25%, transparent) 50%, transparent 100%)",
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: isVisible ? 0.6 : 0 }}
          transition={{ duration: prefersReducedMotion ? 0 : 0.3 }}
        />

        {/* Hover scrub label — shows the scroll percentage at the cursor position
            so users know exactly where they'll jump before clicking. Appears above
            the bar during mouse movement, with a small arrow pointing down. */}
        {isHovered && hoverProgress !== null && isVisible && (
          <motion.div
            className="absolute -top-8 transform -translate-x-1/2 pointer-events-none z-50"
            style={{ left: `${hoverProgress}%` }}
            initial={{ opacity: 0, y: 4, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: ANIMATION.HOVER_POPUP, ease: "easeOut" }}
          >
            <div className="bg-dark-800/90 backdrop-blur-sm border border-dark-600/60 rounded-md px-1.5 py-0.5 shadow-lg shadow-dark-950/40">
              <span className="text-[10px] font-semibold tabular-nums text-primary-300">
                {hoverProgress}%
              </span>
            </div>
            {/* Small arrow pointing down to the bar */}
            <div className="flex justify-center -mt-px">
              <div className="w-0 h-0 border-l-[4px] border-r-[4px] border-t-[4px] border-l-transparent border-r-transparent border-t-dark-600/60" />
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}

export const PageScrollProgressBar = memo(PageScrollProgressBarComponent);

export default PageScrollProgressBar;
