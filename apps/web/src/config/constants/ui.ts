/**
 * UI Configuration Constants
 * Source of truth for UI-related constants
 *
 * Flexy says: No hardcoded UI values - everything configurable!
 */

import { ENV } from "../env";
import { VALIDATION_LIMITS } from "@blueprint/shared";
import { ANIMATION_TIMING } from "../theme";

// ============================================================================
// Animation Durations
// ============================================================================

/**
 * Animation durations (in seconds)
 * Single source of truth lives in theme.ts (ANIMATION_TIMING)
 * This re-export provides a flat convenience API for components
 */
export const ANIMATION = {
  FAST: ANIMATION_TIMING.duration.fast,
  NORMAL: ANIMATION_TIMING.duration.normal,
  MEDIUM: ANIMATION_TIMING.duration.medium,
  SLOW: ANIMATION_TIMING.duration.slow,
  STAGGER: ANIMATION_TIMING.stagger.default,
  SPINNER_ROTATION: 1,
  TYPING_INDICATOR_DELAY_S: 0.6,
} as const;

/** Animation durations (in milliseconds) */
export const ANIMATION_MS = {
  TYPING_INDICATOR_DELAY: 600,
  TYPING_INDICATOR_TIMEOUT: 800,
  CHIP_SELECT_FEEDBACK: 600,
  INPUT_TYPING_DELAY: 800,
} as const;

/** Celebration animation timing (in milliseconds) */
export const CELEBRATION_TIMING = {
  REDUCED_MOTION_DISPLAY: 1500,
  PARTICLE_FADEOUT: 2000,
  COMPLETION_DELAY: 2500,
} as const;

/**
 * Celebration particle configuration
 * Controls the number, size, and spread of particles during completion animation
 */
export const CELEBRATION_PARTICLE = {
  COUNT: 24,
  BASE_DISTANCE_PX: 80,
  RANDOM_DISTANCE_PX: 120,
  BASE_SIZE_PX: 6,
  RANDOM_SIZE_PX: 8,
  SHAPES: ["circle", "square", "star"] as const,
  ANIMATION_DURATION_S: 1.2,
} as const;

// ============================================================================
// Spring Configurations
// ============================================================================

/**
 * Spring configurations for Framer Motion animations
 */
export const SPRING_CONFIG = {
  DEFAULT: { stiffness: 400, damping: 25, mass: 0.8 },
  REDUCED_MOTION: { stiffness: 1000, damping: 100, mass: 0.1 },
  SNAPPY: { stiffness: 500, damping: 25, mass: 0.8 },
  GENTLE: { stiffness: 400, damping: 30, mass: 0.8 },
  BOUNCY: { stiffness: 400, damping: 10, mass: 0.8 },
  SUBTLE_BOUNCE: { stiffness: 400, damping: 17, mass: 0.8 },
  CHECKMARK: { stiffness: 500, damping: 15, mass: 0.8 },
  SLOW: { stiffness: 100, damping: 20, mass: 0.8 },
} as const;

// ============================================================================
// UI Configuration
// ============================================================================

/** General UI configuration values */
export const UI = {
  MAX_TECH_STACK_SELECTION: VALIDATION_LIMITS.TECH_STACK.MAX,
  TOOLTIP_DELAY: 500,
  SCROLL_OFFSET: 100,
  SCROLL_TO_TOP_THRESHOLD: 600,
} as const;

/** Tooltip configuration */
export const TOOLTIP_CONFIG = {
  DEFAULT_DELAY: 500,
  KEYBOARD_SHORTCUT_DELAY: 300,
  INFO_DELAY: 200,
  DEFAULT_HIDE_DELAY: 100,
  DEFAULT_SHOW_DELAY: 400,
  DEFAULT_MAX_WIDTH: 320,
  INFO_MAX_WIDTH: 280,
  ESTIMATED_HEIGHT: 60,
  VIEWPORT_PADDING: 16,
  TOUCH_AUTO_HIDE_DELAY: 3000,
} as const;

// ============================================================================
// Color Presets
// ============================================================================

/** Celebration colors for particle animations */
export const CELEBRATION_COLORS = [
  "#10b981",
  "#34d399",
  "#6ee7b7",
  "#6366f1",
  "#818cf8",
  "#a78bfa",
  "#f472b6",
  "#fbbf24",
] as const;

/** Animation colors for value change indicators */
export const ANIMATION_COLORS = {
  POSITIVE: "#10b981",
  NEGATIVE: "#f43f5e",
} as const;

/** Progress indicator colors */
export const PROGRESS_COLORS = {
  COMPLETED: "#10b981",
  ACTIVE: "#6366f1",
} as const;

/** Step connector visual configuration */
export const STEP_CONNECTOR = {
  COMPLETED_SHADOW: "0 0 6px rgba(16, 185, 129, 0.4)",
} as const;

/** SVG transition configuration for progress indicators */
export const SVG_TRANSITION = {
  /** Duration in ms for stroke-dashoffset animation on circular progress */
  STROKE_DASHOFFSET_DURATION_MS: 700,
  /** Timing function for stroke animations */
  STROKE_TIMING: "ease-out",
} as const;

// ============================================================================
// Scroll Thresholds
// ============================================================================

/**
 * Scroll trigger thresholds for UI interactions
 * Flexy says: No hardcoded scroll values - everything configurable!
 */
export const SCROLL_THRESHOLDS = {
  HEADER_SHADOW: 20,
  SCROLL_TO_TOP: 400,
  HAS_SCROLLED: 50,
} as const;

// ============================================================================
// Textarea Configuration
// ============================================================================

/**
 * Textarea resize configuration
 * Flexy says: No hardcoded textarea dimensions - everything configurable!
 */
export const TEXTAREA_CONFIG = {
  DEFAULT_MIN_HEIGHT_PX: 80,
  DEFAULT_MAX_HEIGHT_PX: 300,
  DEFAULT_EXTRA_PADDING_PX: 2,
  STEP_INFO_MIN_HEIGHT_PX: 128,
  STEP_INFO_MAX_HEIGHT_PX: 400,
} as const;

// ============================================================================
// Empty State Dimensions
// ============================================================================

/**
 * Empty state component dimensions
 * Flexy says: No hardcoded empty state dimensions - everything configurable!
 */
export const EMPTY_STATE_CONFIG = {
  EDITOR_GLOW: {
    WIDTH_PX: 200,
    HEIGHT_PX: 200,
    MARGIN_LEFT_PX: -100,
    MARGIN_TOP_PX: -50,
  } as const,
  PREVIEW_GLOW: {
    WIDTH_PX: 160,
    HEIGHT_PX: 160,
    MARGIN_LEFT_PX: -80,
    MARGIN_TOP_PX: -40,
  } as const,
} as const;

/** UI Fallback values for environment-dependent configs */
export const UI_FALLBACKS = {
  API_BASE: ENV.API_BASE_URL,
};
