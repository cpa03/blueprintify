/**
 * UI Configuration Constants
 * Source of truth for UI-related constants
 *
 * Flexy says: No hardcoded UI values - everything configurable!
 */

import { ENV } from "../env";
import {
  VALIDATION_LIMITS,
  ANIMATION_DURATION_MS as SHARED_ANIMATION_DURATION_MS,
  ANIMATION_DURATION_S,
  CELEBRATION_DEFAULTS as SHARED_CELEBRATION_DEFAULTS,
  SCROLL_THRESHOLD_DEFAULTS,
  TEXTAREA_DEFAULTS,
  TOOLTIP_DEFAULTS,
  UI_DEFAULTS,
  UI_ANIMATION_DEFAULTS,
  EMPTY_STATE_LAYOUT as SHARED_EMPTY_STATE_LAYOUT,
} from "@blueprint/shared";
import {
  ANIMATION_TIMING,
  COLORS,
  THEME_PROGRESS_TRACK_COLOR,
  STEP_CONNECTOR_COMPLETED_SHADOW as THEME_STEP_CONNECTOR_COMPLETED_SHADOW,
} from "../theme";
import {
  SCROLL_PULSE_DEFAULTS as SHARED_SCROLL_PULSE_DEFAULTS,
  SVG_TRANSITION_DEFAULTS as SHARED_SVG_TRANSITION_DEFAULTS,
} from "@blueprint/shared";

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
  MEDIUM_SLOW: ANIMATION_TIMING.duration.mediumSlow,
  SEMI_SLOW: ANIMATION_TIMING.duration.semiSlow,
  SLOW: ANIMATION_TIMING.duration.slow,
  STAGGER: ANIMATION_TIMING.stagger.default,
  SPINNER_ROTATION: UI_ANIMATION_DEFAULTS.SPINNER_ROTATION_S,
  TYPING_INDICATOR_DELAY_S: ANIMATION_DURATION_S.TYPING_INDICATOR_DELAY_S,
  FLOAT: ANIMATION_DURATION_S.FLOAT,
  SLOW_PULSE: ANIMATION_DURATION_S.SLOW_PULSE,
  BREATH: ANIMATION_DURATION_S.BREATH,
  DRIFT: ANIMATION_DURATION_S.DRIFT,
  DRIFT_SLOW: ANIMATION_DURATION_S.DRIFT_SLOW,
  GENTLE_PULSE: ANIMATION_DURATION_S.GENTLE_PULSE,
  CHECKMARK_REVEAL: ANIMATION_DURATION_S.CHECKMARK_REVEAL,
  MODAL_FADE: ANIMATION_DURATION_S.MODAL_FADE,
  TOOLTIP_FADE: ANIMATION_DURATION_S.TOOLTIP_FADE,
  SLIDER: ANIMATION_DURATION_S.SLIDER,
  QUICK_FADE: ANIMATION_DURATION_S.QUICK_FADE,
  HOVER_POPUP: ANIMATION_DURATION_S.HOVER_POPUP,
  LIVE_INDICATOR: ANIMATION_DURATION_S.LIVE_INDICATOR,
  FLOATING_DURATION: ANIMATION_DURATION_S.FLOATING_DURATION,
  FADE_IN: ANIMATION_DURATION_S.FADE_IN,
  HALF_SECOND: ANIMATION_DURATION_S.HALF_SECOND,
  SUBTLE_MOVE: ANIMATION_DURATION_S.SUBTLE_MOVE,
  TAB_SWITCH: ANIMATION_DURATION_S.TAB_SWITCH,
  PULSE: ANIMATION_DURATION_S.PULSE,
  CARD_ENTRANCE_DELAY: ANIMATION_DURATION_S.CARD_ENTRANCE_DELAY,
  CARD_ENTRANCE_DURATION: ANIMATION_DURATION_S.CARD_ENTRANCE_DURATION,
  CHECKMARK_OVERLAY_S: ANIMATION_DURATION_S.CHECKMARK_OVERLAY_S,
  LOADING_OVERLAY_S: ANIMATION_DURATION_S.LOADING_OVERLAY_S,
  ENTRY_PULSE: ANIMATION_DURATION_S.ENTRY_PULSE,
  NUMBER_COUNTER: ANIMATION_DURATION_S.NUMBER_COUNTER,
} as const;

/**
 * Animation durations (in milliseconds)
 * Flexy says: Single source of truth in @blueprint/shared!
 */
export const ANIMATION_MS = {
  TYPING_INDICATOR_DELAY: SHARED_ANIMATION_DURATION_MS.TYPING_INDICATOR_DELAY,
  TYPING_INDICATOR_TIMEOUT: SHARED_ANIMATION_DURATION_MS.TYPING_INDICATOR_TIMEOUT,
  CHIP_SELECT_FEEDBACK: SHARED_ANIMATION_DURATION_MS.CHIP_SELECT_FEEDBACK,
  INPUT_TYPING_DELAY: SHARED_ANIMATION_DURATION_MS.INPUT_TYPING_DELAY,
} as const;

/**
 * Celebration animation timing (in milliseconds)
 * Flexy says: Single source of truth in @blueprint/shared!
 */
export const CELEBRATION_TIMING = {
  REDUCED_MOTION_DISPLAY: SHARED_CELEBRATION_DEFAULTS.REDUCED_MOTION_DISPLAY_MS,
  PARTICLE_FADEOUT: SHARED_CELEBRATION_DEFAULTS.PARTICLE_FADEOUT_MS,
  COMPLETION_DELAY: SHARED_CELEBRATION_DEFAULTS.COMPLETION_DELAY_MS,
} as const;

/**
 * Celebration particle configuration (from shared config)
 * Flexy says: Single source of truth in @blueprint/shared!
 */
export const CELEBRATION_PARTICLE = {
  COUNT: SHARED_CELEBRATION_DEFAULTS.PARTICLE_COUNT,
  BASE_DISTANCE_PX: SHARED_CELEBRATION_DEFAULTS.PARTICLE_BASE_DISTANCE_PX,
  RANDOM_DISTANCE_PX: SHARED_CELEBRATION_DEFAULTS.PARTICLE_RANDOM_DISTANCE_PX,
  BASE_SIZE_PX: SHARED_CELEBRATION_DEFAULTS.PARTICLE_BASE_SIZE_PX,
  RANDOM_SIZE_PX: SHARED_CELEBRATION_DEFAULTS.PARTICLE_RANDOM_SIZE_PX,
  SHAPES: SHARED_CELEBRATION_DEFAULTS.PARTICLE_SHAPES,
  ANIMATION_DURATION_S: SHARED_CELEBRATION_DEFAULTS.PARTICLE_ANIMATION_DURATION_S,
} as const;

// ============================================================================
// Spring Configurations
// ============================================================================

/**
 * Spring configurations for Framer Motion animations
 */
/**
 * Easing functions for Framer Motion transitions
 * Flexy says: No more 60+ hardcoded 'easeOut' strings across components!
 * Single source of truth for CSS easing keyword constants.
 */
export const EASING = {
  easeOut: "easeOut" as const,
  easeIn: "easeIn" as const,
  easeInOut: "easeInOut" as const,
} as const;

export const SPRING_CONFIG = {
  DEFAULT: { stiffness: 400, damping: 25, mass: 0.8 },
  REDUCED_MOTION: { stiffness: 1000, damping: 100, mass: 0.1 },
  SNAPPY: { stiffness: 500, damping: 25, mass: 0.8 },
  GENTLE: { stiffness: 400, damping: 30, mass: 0.8 },
  BOUNCY: { stiffness: 400, damping: 10, mass: 0.8 },
  SUBTLE_BOUNCE: { stiffness: 400, damping: 17, mass: 0.8 },
  CHECKMARK: { stiffness: 500, damping: 15, mass: 0.8 },
  SLOW: { stiffness: 100, damping: 20, mass: 0.8 },
  /** Warning/alert icon bounce - softer spring for impactful elements */
  WARNING: { stiffness: 260, damping: 8, mass: 0.6 },
  /** Smooth reveal spring - subtle emphasis without bounce */
  SMOOTH: { stiffness: 400, damping: 20 },
  /** Refresh/rotate icon spring - looser for smooth rotation */
  REFRESH: { stiffness: 200, damping: 15 },
  /** Success/completion spring - snappy with pronounced settle */
  SUCCESS: { stiffness: 500, damping: 30 },
  /** Checkmark icon spring - precise with minimal bounce */
  CHECKMARK_ICON: { stiffness: 500, damping: 20, mass: 0.5 },
  /** Counter/tab number flip spring - snappy bounce for animated counters */
  COUNTER_FLIP: { stiffness: 500, damping: 15, mass: 0.5 },
} as const;

// ============================================================================
// UI Configuration
// ============================================================================

/** General UI configuration values */
export const UI = {
  MAX_TECH_STACK_SELECTION: VALIDATION_LIMITS.TECH_STACK.MAX,
  TOOLTIP_DELAY: UI_DEFAULTS.TOOLTIP_DELAY_MS,
  SCROLL_OFFSET: UI_DEFAULTS.SCROLL_OFFSET_PX,
  SCROLL_TO_TOP_THRESHOLD: UI_DEFAULTS.SCROLL_TO_TOP_THRESHOLD_PX,
} as const;

/** Tooltip configuration */
export const TOOLTIP_CONFIG = {
  DEFAULT_DELAY: UI_DEFAULTS.TOOLTIP_DELAY_MS,
  KEYBOARD_SHORTCUT_DELAY: TOOLTIP_DEFAULTS.KEYBOARD_SHORTCUT_DELAY_MS,
  INFO_DELAY: TOOLTIP_DEFAULTS.INFO_DELAY_MS,
  DEFAULT_HIDE_DELAY: TOOLTIP_DEFAULTS.HIDE_DELAY_MS,
  DEFAULT_SHOW_DELAY: TOOLTIP_DEFAULTS.SHOW_DELAY_MS,
  DEFAULT_MAX_WIDTH: TOOLTIP_DEFAULTS.MAX_WIDTH_PX,
  INFO_MAX_WIDTH: TOOLTIP_DEFAULTS.INFO_MAX_WIDTH_PX,
  ESTIMATED_HEIGHT: TOOLTIP_DEFAULTS.ESTIMATED_HEIGHT_PX,
  VIEWPORT_PADDING: TOOLTIP_DEFAULTS.VIEWPORT_PADDING_PX,
  TOUCH_AUTO_HIDE_DELAY: TOOLTIP_DEFAULTS.TOUCH_AUTO_HIDE_DELAY_MS,
} as const;

// ============================================================================
// Color Presets
// ============================================================================

/**
 * Celebration colors for particle animations
 * Flexy says: Colors that match theme values reference COLORS for single source of truth!
 */
export const CELEBRATION_COLORS = [
  COLORS.accent.emerald,
  COLORS.celebration.emeraldLight,
  COLORS.celebration.greenLight,
  COLORS.primary[500],
  COLORS.primary[400],
  COLORS.celebration.purpleLight,
  COLORS.celebration.pink,
  COLORS.celebration.amber,
] as const;

/** Animation colors for value change indicators */
export const ANIMATION_COLORS = {
  POSITIVE: COLORS.semantic.success,
  NEGATIVE: COLORS.semantic.danger,
} as const;

/** Progress indicator colors */
export const PROGRESS_COLORS = {
  COMPLETED: COLORS.accent.emerald,
  ACTIVE: COLORS.primary[500],
} as const;

/** Step connector visual configuration */
export const STEP_CONNECTOR = {
  COMPLETED_SHADOW: THEME_STEP_CONNECTOR_COMPLETED_SHADOW,
} as const;

/** CircularProgress track color default */
export const PROGRESS_TRACK_COLOR = THEME_PROGRESS_TRACK_COLOR;

/** SVG transition configuration for progress indicators */
export const SVG_TRANSITION = {
  /** Duration in ms for stroke-dashoffset animation on circular progress */
  STROKE_DASHOFFSET_DURATION_MS: SHARED_SVG_TRANSITION_DEFAULTS.STROKE_DASHOFFSET_DURATION_MS,
  /** Duration in seconds for stroke color transition on circular progress (0.45s) */
  STROKE_COLOR_TRANSITION_S: SHARED_SVG_TRANSITION_DEFAULTS.STROKE_COLOR_TRANSITION_S,
  /** Timing function for stroke animations */
  STROKE_TIMING: SHARED_SVG_TRANSITION_DEFAULTS.STROKE_TIMING,
} as const;

// ============================================================================
// Scroll Thresholds
// ============================================================================

/**
 * Scroll trigger thresholds for UI interactions
 * Flexy says: No hardcoded scroll values - everything configurable!
 */
export const SCROLL_THRESHOLDS = {
  HEADER_SHADOW: SCROLL_THRESHOLD_DEFAULTS.HEADER_SHADOW_PX,
  SCROLL_TO_TOP: SCROLL_THRESHOLD_DEFAULTS.SCROLL_TO_TOP_PX,
  HAS_SCROLLED: SCROLL_THRESHOLD_DEFAULTS.HAS_SCROLLED_PX,
  /**
   * Duration (ms) of the subtle entry-pulse ring effect on the scroll-to-top
   * / scroll-to-bottom button. After this timeout, the pulse resolves and
   * the button returns to its resting glassmorphism look.
   * Single source of truth: @blueprint/shared SCROLL_PULSE_DEFAULTS
   */
  ENTRY_PULSE_MS: SHARED_SCROLL_PULSE_DEFAULTS.ENTRY_PULSE_MS,
} as const;

// ============================================================================
// Textarea Configuration
// ============================================================================

/**
 * Textarea resize configuration
 * Flexy says: No hardcoded textarea dimensions - everything configurable!
 */
export const TEXTAREA_CONFIG = {
  DEFAULT_MIN_HEIGHT_PX: TEXTAREA_DEFAULTS.MIN_HEIGHT_PX,
  DEFAULT_MAX_HEIGHT_PX: TEXTAREA_DEFAULTS.MAX_HEIGHT_PX,
  DEFAULT_EXTRA_PADDING_PX: TEXTAREA_DEFAULTS.EXTRA_PADDING_PX,
  STEP_INFO_MIN_HEIGHT_PX: TEXTAREA_DEFAULTS.STEP_INFO_MIN_HEIGHT_PX,
  STEP_INFO_MAX_HEIGHT_PX: TEXTAREA_DEFAULTS.STEP_INFO_MAX_HEIGHT_PX,
} as const;

// ============================================================================
// Empty State Dimensions
// ============================================================================

/**
 * Empty state component dimensions
 * Flexy says: No hardcoded empty state dimensions - everything configurable!
 */
/**
 * Empty state component layout dimensions
 * Flexy says: Single source of truth in @blueprint/shared!
 */
export const EMPTY_STATE_CONFIG = {
  EDITOR_GLOW: {
    WIDTH_PX: SHARED_EMPTY_STATE_LAYOUT.EDITOR_GLOW.WIDTH_PX,
    HEIGHT_PX: SHARED_EMPTY_STATE_LAYOUT.EDITOR_GLOW.HEIGHT_PX,
    MARGIN_LEFT_PX: SHARED_EMPTY_STATE_LAYOUT.EDITOR_GLOW.MARGIN_LEFT_PX,
    MARGIN_TOP_PX: SHARED_EMPTY_STATE_LAYOUT.EDITOR_GLOW.MARGIN_TOP_PX,
  } as const,
  PREVIEW_GLOW: {
    WIDTH_PX: SHARED_EMPTY_STATE_LAYOUT.PREVIEW_GLOW.WIDTH_PX,
    HEIGHT_PX: SHARED_EMPTY_STATE_LAYOUT.PREVIEW_GLOW.HEIGHT_PX,
    MARGIN_LEFT_PX: SHARED_EMPTY_STATE_LAYOUT.PREVIEW_GLOW.MARGIN_LEFT_PX,
    MARGIN_TOP_PX: SHARED_EMPTY_STATE_LAYOUT.PREVIEW_GLOW.MARGIN_TOP_PX,
  } as const,
} as const;

/** UI Fallback values for environment-dependent configs */
export const UI_FALLBACKS = {
  API_BASE: ENV.API_BASE_URL,
};
