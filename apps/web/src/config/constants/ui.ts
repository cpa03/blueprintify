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
} from "@blueprint/shared/config";
import {
  ANIMATION_TIMING,
  COLORS,
  EASING,
  MOTION_OFFSETS as THEME_MOTION_OFFSETS,
  ENTRANCE_OFFSETS as THEME_ENTRANCE_OFFSETS,
  OPACITY as THEME_OPACITY,
  THEME_PROGRESS_TRACK_COLOR,
  STEP_CONNECTOR_COMPLETED_SHADOW as THEME_STEP_CONNECTOR_COMPLETED_SHADOW,
} from "../theme";
import {
  SCROLL_PULSE_DEFAULTS as SHARED_SCROLL_PULSE_DEFAULTS,
  SVG_TRANSITION_DEFAULTS as SHARED_SVG_TRANSITION_DEFAULTS,
  STAGGER_CONFIG as SHARED_STAGGER_CONFIG,
} from "@blueprint/shared/config";

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
  TEXT_FADE: ANIMATION_DURATION_S.TEXT_FADE,
  ENTRY_PULSE: ANIMATION_DURATION_S.ENTRY_PULSE,
  NUMBER_COUNTER: ANIMATION_DURATION_S.NUMBER_COUNTER,
  ATTENTION_PULSE: ANIMATION_DURATION_S.ATTENTION_PULSE,
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
 * Single source of truth lives in theme.ts
 * Flexy says: No more 60+ hardcoded 'easeOut' strings across components!
 */
// Re-exported from theme.ts where EASING is defined alongside other animation configs
export { EASING };

/**
 * Framer Motion variant offset values (y, x, scale, keyframe arrays)
 * Single source of truth lives in theme.ts
 * Flexy says: No hardcoded y:20 / x:20 / scale:0.8 values in motion.ts!
 */
export const MOTION_OFFSETS = THEME_MOTION_OFFSETS;

/**
 * Entrance animation pixel and opacity offsets for component-level initial/exit
 * positions.  Single source of truth lives in theme.ts
 * Flexy says: No hardcoded y:-3 / x:16 / opacity:0.6 values in component JSX!
 */
export const ENTRANCE_OFFSETS = THEME_ENTRANCE_OFFSETS;

/**
 * Common opacity values for framer-motion and CSS.
 * Single source of truth lives in theme.ts
 * Flexy says: No hardcoded opacity:0.6 / opacity:0.3 in component props!
 * Usage: initial={{ opacity: OPACITY[60] }}
 */
export const OPACITY = THEME_OPACITY;

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
  /** Milestone pulse spring - energetic bounce for threshold-reached animations */
  MILESTONE_PULSE: { stiffness: 500, damping: 12, mass: 0.5 } as const,
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

/**
 * Elapsed time — coarse announcement cadence
 * During generation, screen-reader announcements of the elapsed MM:SS counter
 * are throttled to this interval instead of firing every second. Announcing a
 * ticking timer every tick is an accessibility anti-pattern (a "chronometer
 * spam" live region) — screen readers would re-read the whole region each
 * second. The visible on-screen timer still ticks at ELAPSED_TIMER_INTERVAL_MS;
 * only the assistive-tech announcement is throttled.
 */
export const ELAPSED_ANNOUNCEMENT_INTERVAL_MS = 30000;

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
  /** CSS transition-property value for stroke animations */
  STROKE_PROPERTY: SHARED_SVG_TRANSITION_DEFAULTS.STROKE_PROPERTY,
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
// Interaction Scale Presets (for framer-motion whileHover/whileTap)
// ============================================================================

/**
 * Hover scale presets for framer-motion whileHover animations.
 * Centralizes all hardcoded scale values so they stay consistent across components.
 * Flexy says: No hardcoded scale: 1.02/1.03/1.05/1.1/1.15 values in components!
 * Usage: whileHover={HOVER_SCALE.GENTLE}
 */
export const HOVER_SCALE = {
  /** Micro hover: 1.02 — subtle scale-up for buttons, cards */
  MICRO: { scale: 1.02 } as const,
  /** Gentle hover: 1.03 — mild emphasis for interactive elements */
  GENTLE: { scale: 1.03 } as const,
  /** Standard hover: 1.05 — noticeable emphasis for primary actions */
  STANDARD: { scale: 1.05 } as const,
  /** Strong hover: 1.1 — prominent scale for special elements */
  STRONG: { scale: 1.1 } as const,
  /** Extra strong hover: 1.15 — maximum emphasis for dismiss/close buttons */
  EXTRA: { scale: 1.15 } as const,
} as const;

/**
 * Tap scale presets for framer-motion whileTap animations.
 * Centralizes all hardcoded press-scale values for consistent micro-interactions.
 * Flexy says: No hardcoded scale: 0.98/0.97/0.95/0.9 values in components!
 * Usage: whileTap={TAP_SCALE.GENTLE}
 */
export const TAP_SCALE = {
  /** Micro tap: 0.98 — subtle press for gentle feedback */
  MICRO: { scale: 0.98 } as const,
  /** Gentle tap: 0.97 — mild press for standard feedback */
  GENTLE: { scale: 0.97 } as const,
  /** Standard tap: 0.95 — noticeable press for primary actions */
  STANDARD: { scale: 0.95 } as const,
  /** Strong tap: 0.9 — deep press for dismiss/close buttons */
  STRONG: { scale: 0.9 } as const,
} as const;

/**
 * Rotation presets for framer-motion whileHover rotate animations.
 * Flexy says: No hardcoded rotate: 90/180 values in components!
 * Usage: whileHover={{ ...HOVER_SCALE.GENTLE, ...ROTATION.QUARTER }}
 */
export const ROTATION = {
  /** Quarter turn: 90 degrees — for close/dismiss icon rotation */
  QUARTER: { rotate: 90 } as const,
  /** Half turn: 180 degrees — for expand/collapse icon rotation */
  HALF: { rotate: 180 } as const,
} as const;

// ============================================================================
// Animation Keyframe Presets (for framer-motion animate keyframes)
// ============================================================================

/**
 * Opacity keyframe pulse sequences for breathing/pulsing animations.
 * Centralizes all hardcoded opacity arrays so values stay consistent.
 * Flexy says: No hardcoded opacity: [1, 0.7, 1] values in components!
 * Usage: animate={OPACITY_PULSE.SUBTLE}
 *
 * Extended by Flexy Iteration 142 with shared pulse presets from @blueprint/shared
 * (GLOW, BREATHING, SOFT_BLINK, TYPING, HALF_BLINK).
 */
export const OPACITY_PULSE = {
  /** Gentle pulse: 1 → 0.85 → 1 — for icons and decorative elements */
  GENTLE: [1, 0.85, 1],
  /** Subtle pulse: 1 → 0.7 → 1 — for headings and prominent text */
  SUBTLE: [1, 0.7, 1],
  /** Strong pulse: 1 → 0.55 → 1 — for emphasis and callouts */
  STRONG: [1, 0.55, 1],
  /** Gentle glow pulse: 0.4 → 0.7 → 0.4 — for soft glow/breathe effects behind icons */
  GLOW: [0.4, 0.7, 0.4],
  /** Breathing pulse: 1 → 0.35 → 1 — for content availability indicator dots */
  BREATHING: [1, 0.35, 1],
  /** Soft blink pulse: 0.8 → 1 → 0.8 — for subtle attention-seeking elements */
  SOFT_BLINK: [0.8, 1, 0.8],
  /** Typing indicator pulse: 0.4 → 1 → 0.4 — for live typing/streaming indicators */
  TYPING: [0.4, 1, 0.4],
  /** Half-opacity blink: 0.5 → 1 → 0.5 — for standard blinking/attention effects */
  HALF_BLINK: [0.5, 1, 0.5],
  /** Attention pulse: 1 → 0.9 → 1 — subtle 10% opacity dip for attention-seeking badge animations */
  ATTENTION: [1, 0.9, 1],
};

/**
 * Scale keyframe pulse sequences for breathing scale animations.
 * Flexy says: No hardcoded scale: [1, 1.08, 1] values in components!
 *
 * Extended by Flexy Iteration 142 with shared pulse presets from @blueprint/shared
 * (ERROR_ICON, GLOW, CONTENT_DOT, PARTICLE_BURST, SECTION_BADGE, MILESTONE, PARTICLE_RING).
 */
export const SCALE_PULSE = {
  /** Gentle scale pulse: 1 → 1.08 → 1 — for icons and decorative elements */
  GENTLE: [1, 1.08, 1],
  /** Gentle error icon pulse: 1 → 1.04 → 1 — for subtle emphasis on warning/error icons */
  ERROR_ICON: [1, 1.04, 1],
  /** Glow pulse: 1 → 1.15 → 1 — for soft glow rings behind interactive elements */
  GLOW: [1, 1.15, 1],
  /** Content dot pulse: 1 → 1.2 → 1 — for content availability indicator dots */
  CONTENT_DOT: [1, 1.2, 1],
  /** Particle burst: 0 → 1.2 → 0.8 — for celebration particle burst entrance */
  PARTICLE_BURST: [0, 1.2, 0.8],
  /** Section badge pulse: 1 → 1.12 → 1 — for section badge highlights */
  SECTION_BADGE: [1, 1.12, 1],
  /** Milestone pulse: 1 → 1.35 → 1 — for milestone/achievement reached animations */
  MILESTONE: [1, 1.35, 1],
  /** Attention pulse: 1 → 1.03 → 1 — subtle 3% scale pulse for attention-seeking badge animations */
  ATTENTION: [1, 1.03, 1],
  /** Particle fade-out: 0.5 → 1.2 → 1.5 — for celebration particle ring expansion */
  PARTICLE_RING: [0.5, 1.2, 1.5],
};

/**
 * Y-offset keyframe sequences for floating/bobbing animations.
 * Flexy says: No hardcoded y: [0, -3, 0] values in components!
 *
 * Extended by Flexy Iteration 142 with TYPING preset from @blueprint/shared.
 */
export const Y_OFFSET = {
  /** Subtle float: 0 → -3 → 0 — for icons and decorative elements */
  SUBTLE: [0, -3, 0],
  /** Typing bobbing: 0 → -4 → 0 — for live typing/streaming indicator bobbing */
  TYPING: [0, -4, 0],
};

/**
 * Animation Repeat Counts
 * Centralized source of truth for framer-motion animation repeat counts.
 * Flexy says: No hardcoded repeat: 5 in component transition configs!
 */
export const ANIMATION_REPEAT = {
  /** Number of attention-pulse badge animation cycles (5 repeats ≈ 3s total) */
  ATTENTION_PULSE: 5,
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

// ============================================================================
// Staggered Entrance Animation Config
// ============================================================================

/**
 * Staggered entrance animation timing configuration.
 * Flexy says: Single source of truth in @blueprint/shared!
 */
export { SHARED_STAGGER_CONFIG as STAGGER_CONFIG };

/**
 * Scroll Behavior Values
 * Flexy says: No hardcoded "smooth" / "auto" / "instant" in scroll utilities!
 * Source of truth: @blueprint/shared/config/ui.ts
 */
export { SCROLL_BEHAVIOR } from "@blueprint/shared/config";

/**
 * Scroll-Into-View Block Position Values
 * Flexy says: No hardcoded "nearest" / "center" / "start" / "end" in scroll utilities!
 * Source of truth: @blueprint/shared/config/ui.ts
 */
export { SCROLL_INTO_VIEW_BLOCK } from "@blueprint/shared/config";

/**
 * Direction Values
 * Flexy says: No hardcoded "top" / "bottom" / "left" / "right" direction strings!
 * Source of truth: @blueprint/shared/config/ui.ts
 */
export { DIRECTION } from "@blueprint/shared/config";

/**
 * CSS Value Strings
 * Flexy says: No hardcoded "auto" / "none" CSS value strings in component logic!
 * Source of truth: @blueprint/shared/config/ui.ts
 */
export { CSS_VALUES } from "@blueprint/shared/config";

/** UI Fallback values for environment-dependent configs */
export const UI_FALLBACKS = {
  API_BASE: ENV.API_BASE_URL,
};
