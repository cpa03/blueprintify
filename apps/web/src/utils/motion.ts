/**
 * Shared Framer Motion animation variants and utilities
 *
 * This module centralizes common animation patterns used across components
 * to ensure consistency and reduce code duplication.
 */

import type { Variants, Transition } from "framer-motion";
import { SPRING_CONFIG, ANIMATION, EASING, MOTION_OFFSETS } from "../config/constants";
import { ANIMATION_DIRECTIONS, FRAMER_TYPE } from "@blueprint/shared/config";

/**
 * Common transition configurations
 * Uses centralized SPRING_CONFIG and ANIMATION for spring and duration values
 */
export const transitions = {
  fast: { duration: ANIMATION.TOOLTIP_FADE, ease: EASING.easeOut } as Transition,
  normal: { duration: ANIMATION.SUBTLE_MOVE, ease: EASING.easeOut } as Transition,
  slow: { duration: ANIMATION.HALF_SECOND, ease: EASING.easeOut } as Transition,
  spring: {
    type: FRAMER_TYPE.SPRING,
    stiffness: SPRING_CONFIG.SNAPPY.stiffness,
    damping: SPRING_CONFIG.SNAPPY.damping,
  },
} as const;

/**
 * Fade in from bottom animation variant
 * Use for elements that should appear with a subtle upward motion
 */
export const fadeInUp: Variants = {
  hidden: { opacity: 0, y: MOTION_OFFSETS.FADE_IN_Y_PX },
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
  hidden: { opacity: 0, scale: MOTION_OFFSETS.SCALE_INITIAL },
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
  hidden: { opacity: 0, x: MOTION_OFFSETS.SLIDE_RIGHT_X_PX },
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
  hidden: { opacity: 0, x: MOTION_OFFSETS.SLIDE_LEFT_X_PX },
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
  y: MOTION_OFFSETS.FLOAT_Y_RANGE,
  transition: {
    duration: ANIMATION.FLOATING_DURATION,
    repeat: Infinity,
    ease: EASING.easeInOut,
  },
};

/**
 * Pulse animation for attention-grabbing elements
 * Creates a subtle scale and opacity pulse
 */
export const pulseAnimation = {
  scale: MOTION_OFFSETS.PULSE_SCALE_RANGE,
  opacity: MOTION_OFFSETS.PULSE_OPACITY_RANGE,
  transition: {
    duration: ANIMATION.SLOW_PULSE,
    repeat: Infinity,
    ease: EASING.easeInOut,
  },
};

/** Direction for animated page/step transitions */
export type AnimationDirection = (typeof ANIMATION_DIRECTIONS)[keyof typeof ANIMATION_DIRECTIONS];

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
export function pageTransition(direction: AnimationDirection = ANIMATION_DIRECTIONS.FORWARD) {
  const OFFSET = MOTION_OFFSETS.PAGE_TRANSITION_Y_PX;
  return {
    initial: { opacity: 0, y: direction === ANIMATION_DIRECTIONS.FORWARD ? OFFSET : -OFFSET },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: direction === ANIMATION_DIRECTIONS.FORWARD ? -OFFSET : OFFSET },
    transition: transitions.spring,
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
    hidden: { opacity: 0, y: MOTION_OFFSETS.FADE_IN_Y_PX },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration, ease: EASING.easeOut },
    },
  };
}
