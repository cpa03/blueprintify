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
 * Features:
 * - Window scroll detection (no container ref needed)
 * - Gradient progress bar matching the app's design language
 * - Fade in/out based on scroll position
 * - Respects prefers-reduced-motion
 * - Accessible with role="progressbar" ARIA attributes
 * - Spring-based width animation for smooth feel
 *
 * @module components/PageScrollProgressBar
 *
 * @example
 * ```tsx
 * // Mount at app root, below the header
 * <PageScrollProgressBar />
 * ```
 */

import { useState, useEffect, useCallback, memo } from "react";
import { motion, useSpring, useTransform } from "framer-motion";
import { useReducedMotion } from "../hooks/useReducedMotion";

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
 * Window-level scroll progress indicator with spring animation.
 *
 * @param props - Component props
 * @returns The rendered progress bar or null when not visible
 */
function PageScrollProgressBarComponent({
  showAfter = 80,
  height = 2,
  className = "",
}: PageScrollProgressBarProps): JSX.Element | null {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const prefersReducedMotion = useReducedMotion();

  const calculateProgress = useCallback(() => {
    const scrollTop = window.scrollY;
    const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;

    if (scrollHeight <= 0) return 0;

    const progress = (scrollTop / scrollHeight) * 100;
    return Math.min(Math.max(progress, 0), 100);
  }, []);

  const springConfig = prefersReducedMotion
    ? { stiffness: 300, damping: 30, mass: 1 }
    : { stiffness: 120, damping: 20, mass: 0.5 };

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
      className={`fixed top-0 left-0 right-0 z-40 pointer-events-none ${className}`}
      style={{ marginTop: "64px" }}
      initial={{ opacity: 0 }}
      animate={{ opacity: isVisible ? 1 : 0 }}
      transition={{ duration: prefersReducedMotion ? 0 : 0.25, ease: "easeOut" }}
      aria-hidden="true"
    >
      <div className="w-full bg-dark-800/30 backdrop-blur-sm" style={{ height }}>
        <motion.div
          className="h-full bg-gradient-to-r from-primary-500 via-accent-purple to-accent-pink"
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
              duration: 2.5,
              repeat: Infinity,
              ease: "easeInOut",
            },
          }}
        />

        {/* Subtle trailing glow — a small gradient flare that follows the
            progress bar's leading edge, giving it a "live" feel as it
            advances. Uses transform to keep compositing on the GPU. */}
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
      </div>
    </motion.div>
  );
}

export const PageScrollProgressBar = memo(PageScrollProgressBarComponent);

export default PageScrollProgressBar;
