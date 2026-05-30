/**
 * Shared Framer Motion animation variants and utilities
 *
 * This module centralizes common animation patterns used across components
 * to ensure consistency and reduce code duplication.
 */

import type { Variants, Transition } from "framer-motion";
import { SPRING_CONFIG, ANIMATION } from "../config/constants";

/**
 * Common transition configurations
 * Uses centralized SPRING_CONFIG and ANIMATION for spring and duration values
 */
export const transitions = {
  fast: { duration: ANIMATION.TOOLTIP_FADE, ease: "easeOut" } as Transition,
  normal: { duration: ANIMATION.SUBTLE_MOVE, ease: "easeOut" } as Transition,
  slow: { duration: ANIMATION.HALF_SECOND, ease: "easeOut" } as Transition,
  spring: {
    type: "spring" as const,
    stiffness: SPRING_CONFIG.SNAPPY.stiffness,
    damping: SPRING_CONFIG.SNAPPY.damping,
  },
} as const;

/**
 * Fade in from bottom animation variant
 * Use for elements that should appear with a subtle upward motion
 */
export const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: transitions.slow,
  },
};

/**
 * Staggered container variant for animating children sequentially
 * Use as parent container with fadeInUp children
 */
export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: ANIMATION.STAGGER,
      delayChildren: ANIMATION.NORMAL,
    },
  },
};

/**
 * Simple fade animation variant
 * Use for elements that should appear without motion
 */
export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: transitions.normal,
  },
};

/**
 * Scale up animation variant
 * Use for elements that should grow into view
 */
export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: transitions.spring,
  },
};

/**
 * Slide in from right animation variant
 * Use for panels or modals entering from the right
 */
export const slideInRight: Variants = {
  hidden: { opacity: 0, x: 20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: transitions.normal,
  },
};

/**
 * Slide in from left animation variant
 * Use for panels or modals entering from the left
 */
export const slideInLeft: Variants = {
  hidden: { opacity: 0, x: -20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: transitions.normal,
  },
};

/**
 * Floating animation for decorative elements
 * Creates a gentle up/down bobbing motion
 */
export const floatingAnimation = {
  y: [-8, 8, -8],
  transition: {
    duration: 3,
    repeat: Infinity,
    ease: "easeInOut" as const,
  },
};

/**
 * Pulse animation for attention-grabbing elements
 * Creates a subtle scale and opacity pulse
 */
export const pulseAnimation = {
  scale: [1, 1.05, 1],
  opacity: [0.5, 0.8, 0.5],
  transition: {
    duration: ANIMATION.SLOW_PULSE,
    repeat: Infinity,
    ease: "easeInOut" as const,
  },
};

/** Direction for animated page/step transitions */
export type AnimationDirection = "forward" | "backward";

/**
 * Direction-aware page/step transition animation props
 *
 * - "forward": content enters from below, exits upward (natural forward motion)
 * - "backward": content enters from above, exits downward (natural backward motion)
 *
 * Defaults to "forward" for backward compatibility with existing usage.
 *
 * @example
 * // Forward navigation (next step)
 * <motion.div {...pageTransition("forward")}>
 *
 * @example
 * // Backward navigation (previous step)
 * <motion.div {...pageTransition("backward")}>
 */
export function pageTransition(direction: "forward" | "backward" = "forward") {
  return {
    initial: { opacity: 0, y: direction === "forward" ? 20 : -20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: direction === "forward" ? -20 : 20 },
  };
}

/**
 * Creates a staggered container with custom timing
 * @param staggerChildren - Delay between each child animation
 * @param delayChildren - Initial delay before children start animating
 */
export function createStaggerContainer(
  staggerChildren: number = ANIMATION.STAGGER,
  delayChildren: number = ANIMATION.NORMAL
): Variants {
  return {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren,
        delayChildren,
      },
    },
  };
}

/**
 * Creates a fade-in variant with custom duration
 * @param duration - Animation duration in seconds
 */
export function createFadeInUp(duration: number = ANIMATION.HALF_SECOND): Variants {
  return {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration, ease: "easeOut" },
    },
  };
}
