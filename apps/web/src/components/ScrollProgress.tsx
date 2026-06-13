import { useState, useEffect, useCallback, memo } from "react";
import { motion, useSpring, useTransform } from "framer-motion";
import { ANIMATION } from "../config/constants";
import { SHADOWS, SCROLL_PROGRESS_SPRING } from "../config/theme";
import { useReducedMotion } from "../hooks/useReducedMotion";
import { ACCESSIBILITY_LABELS } from "../config/constants/content";
import clsx from "clsx";

interface ScrollProgressProps {
  scrollContainerRef: React.RefObject<HTMLElement | null>;
  /**
   * Minimum scroll amount (in pixels) before showing the progress bar
   * @default 50
   */
  showAfter?: number;
  /**
   * Height of the progress bar in pixels
   * @default 3
   */
  height?: number;
  /**
   * Additional className for styling
   */
  className?: string;
}

/**
 * ScrollProgress - A subtle reading progress indicator for scrollable content
 *
 * Features:
 * - Shows reading progress as a gradient progress bar at the top
 * - Fades in/out based on scroll position
 * - Respects user's reduced motion preferences
 * - Smooth spring-based animations for delightful feel
 * - Accessible with proper ARIA attributes
 *
 * Usage:
 * ```tsx
 * <ScrollProgress scrollContainerRef={previewRef} />
 * ```
 */
export const ScrollProgress = memo(function ScrollProgress({
  scrollContainerRef,
  showAfter = 50,
  height = 3,
  className = "",
}: ScrollProgressProps) {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const prefersReducedMotion = useReducedMotion();

  const calculateProgress = useCallback(() => {
    const container = scrollContainerRef.current;
    if (!container) return 0;

    const scrollTop = container.scrollTop;
    const scrollHeight = container.scrollHeight - container.clientHeight;

    if (scrollHeight <= 0) return 0;

    const progress = (scrollTop / scrollHeight) * 100;
    return Math.min(Math.max(progress, 0), 100);
  }, [scrollContainerRef]);

  const springConfig = prefersReducedMotion
    ? SCROLL_PROGRESS_SPRING.REDUCED_MOTION
    : SCROLL_PROGRESS_SPRING.DEFAULT;
  const smoothProgress = useSpring(0, springConfig);

  const width = useTransform(smoothProgress, [0, 100], ["0%", "100%"]);

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const progress = calculateProgress();
      const scrollTop = container.scrollTop;

      setScrollProgress(progress);
      setIsVisible(scrollTop > showAfter && progress < 100);

      smoothProgress.set(progress);
    };

    container.addEventListener("scroll", handleScroll, { passive: true });

    handleScroll();

    return () => {
      container.removeEventListener("scroll", handleScroll);
    };
  }, [scrollContainerRef, calculateProgress, showAfter, smoothProgress]);

  useEffect(() => {
    smoothProgress.set(scrollProgress);
  }, [scrollProgress, smoothProgress]);

  return (
    <motion.div
      className={`absolute top-0 left-0 right-0 z-10 pointer-events-none ${className}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: isVisible ? 1 : 0 }}
      transition={{ duration: ANIMATION.NORMAL, ease: "easeOut" }}
      aria-hidden="true"
    >
      <div className="w-full bg-dark-800/50 backdrop-blur-sm" style={{ height }}>
        <motion.div
          className="h-full bg-gradient-to-r from-primary-500 via-accent-purple to-accent-pink"
          style={{ width }}
          initial={{ opacity: 0.8 }}
          animate={{
            opacity: isVisible ? [0.8, 1, 0.8] : 0.8,
            boxShadow: isVisible
              ? [SHADOWS.glow.scroll.SUBTLE, SHADOWS.glow.scroll.MEDIUM, SHADOWS.glow.scroll.SUBTLE]
              : SHADOWS.glow.scroll.NONE,
          }}
          transition={{
            opacity: {
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            },
            boxShadow: {
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            },
          }}
        />
      </div>

      <motion.div
        className="absolute top-0 h-full w-8 pointer-events-none"
        style={{
          right: `calc(${100 - scrollProgress}% - 16px)`,
          background: SHADOWS.SCROLL_GLOW_GRADIENT,
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: isVisible ? 1 : 0 }}
        transition={{ duration: ANIMATION.FAST }}
      />
    </motion.div>
  );
});

/**
 * ScrollProgressCompact - A minimal version with percentage display
 * Perfect for showing exact reading progress
 */
interface ScrollProgressCompactProps extends ScrollProgressProps {
  /**
   * Show percentage text
   * @default true
   */
  showPercentage?: boolean;
}

export const ScrollProgressCompact = memo(function ScrollProgressCompact({
  scrollContainerRef,
  showAfter = 50,
  height = 2,
  showPercentage = true,
  className = "",
}: ScrollProgressCompactProps) {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const prefersReducedMotion = useReducedMotion();

  const calculateProgress = useCallback(() => {
    const container = scrollContainerRef.current;
    if (!container) return 0;

    const scrollTop = container.scrollTop;
    const scrollHeight = container.scrollHeight - container.clientHeight;

    if (scrollHeight <= 0) return 0;

    const progress = (scrollTop / scrollHeight) * 100;
    return Math.min(Math.max(progress, 0), 100);
  }, [scrollContainerRef]);

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const progress = calculateProgress();
      const scrollTop = container.scrollTop;

      setScrollProgress(progress);
      setIsVisible(scrollTop > showAfter && progress < 100);
    };

    container.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => {
      container.removeEventListener("scroll", handleScroll);
    };
  }, [scrollContainerRef, calculateProgress, showAfter]);

  return (
    <motion.div
      className={`flex items-center gap-2 ${className}`}
      initial={{ opacity: 0, y: -10 }}
      animate={{
        opacity: isVisible ? 1 : 0,
        y: isVisible ? 0 : -10,
      }}
      transition={{
        duration: prefersReducedMotion ? 0 : ANIMATION.NORMAL,
        ease: "easeOut",
      }}
    >
      <div
        className="flex-1 bg-dark-700/50 rounded-full overflow-hidden"
        style={{ height }}
        role="progressbar"
        aria-valuenow={Math.round(scrollProgress)}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={ACCESSIBILITY_LABELS.SCROLL_PROGRESS.READING}
      >
        <motion.div
          className="h-full bg-gradient-to-r from-primary-500 to-accent-purple rounded-full"
          initial={false}
          animate={{ width: `${scrollProgress}%` }}
          transition={{
            duration: prefersReducedMotion ? 0 : ANIMATION.FAST,
            ease: "easeOut",
          }}
        />
      </div>

      {showPercentage && (
        <motion.span
          className={clsx(
            "text-xs tabular-nums min-w-[2.5rem] text-right",
            scrollProgress > 75 && "text-accent-emerald",
            scrollProgress > 50 && scrollProgress <= 75 && "text-accent-purple",
            scrollProgress <= 50 && "text-dark-400"
          )}
          initial={false}
          animate={{
            scale: [1, 1.05, 1],
          }}
          transition={{
            duration: ANIMATION.SUBTLE_MOVE,
            repeat: 0,
          }}
        >
          {Math.round(scrollProgress)}%
        </motion.span>
      )}
    </motion.div>
  );
});
