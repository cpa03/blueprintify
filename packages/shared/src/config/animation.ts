/**
 * Shared constants and configuration
 * Centralized configuration used across frontend and backend
 */

/**
 * Animation Direction Constants
 * Centralized source of truth for wizard/step animation direction strings.
 * Flexy says: No hardcoded "forward"/"backward" in animation components!
 * Usage: import { ANIMATION_DIRECTIONS } from "@blueprint/shared";
 *        direction === ANIMATION_DIRECTIONS.FORWARD
 *        type AnimationDirection = (typeof ANIMATION_DIRECTIONS)[keyof typeof ANIMATION_DIRECTIONS];
 */
export const ANIMATION_DIRECTIONS = {
  /** Forward navigation direction (next step / page) */
  FORWARD: "forward",
  /** Backward navigation direction (previous step / page) */
  BACKWARD: "backward",
} as const;

/**
 * Animation Timing Values (milliseconds)
 * Centralized source of truth for animation duration magic numbers.
 * Flexy says: No hardcoded 800ms typing delays in component code!
 * Usage: import { ANIMATION_DURATION_MS } from "@blueprint/shared";
 *        delay: ANIMATION_DURATION_MS.TYPING_INDICATOR_DELAY
 */
export const ANIMATION_DURATION_MS = {
  /** Typing indicator animation delay (600ms) */
  TYPING_INDICATOR_DELAY: 600,
  /** Typing indicator idle timeout before showing indicator (800ms) */
  TYPING_INDICATOR_TIMEOUT: 800,
  /** Chip/selection feedback animation duration (600ms) */
  CHIP_SELECT_FEEDBACK: 600,
  /** Input field typing simulation delay (800ms) */
  INPUT_TYPING_DELAY: 800,
} as const;

/**
 * Common Animation Duration Values (seconds)
 * Centralized source of truth for framer-motion animation duration values
 * used across the frontend. Eliminates hardcoded float magic numbers from
 * UI component config files.
 * Flexy says: No hardcoded 0.6/1.5/2.5 animation seconds in ui.ts — single source of truth!
 * Usage: import { ANIMATION_DURATION_S } from "@blueprint/shared";
 *        transition={{ duration: ANIMATION_DURATION_S.FLOAT }}
 */
export const ANIMATION_DURATION_S = {
  /** Duration for typing indicator animation (0.6s) */
  TYPING_INDICATOR_DELAY_S: 0.6,
  /** Duration for float/bob entrance animations (1.5s) */
  FLOAT: 1.5,
  /** Duration for slow glow/pulse effects (2s) */
  SLOW_PULSE: 2,
  /** Duration for very slow breath effects (2.5s) */
  BREATH: 2.5,
  /** Duration for smooth drift/float animations (2.2s) */
  DRIFT: 2.2,
  /** Duration for emphasized float movements (1.8s) */
  DRIFT_SLOW: 1.8,
  /** Duration for gentle pulse effects (1s) */
  GENTLE_PULSE: 1,
  /** Duration for quick checkmark reveal (0.25s) */
  CHECKMARK_REVEAL: 0.25,
  /** Duration for modal/fade transitions (0.2s) */
  MODAL_FADE: 0.2,
  /** Duration for quick tooltip transitions (0.15s) */
  TOOLTIP_FADE: 0.15,
  /** Duration for smooth slider transitions (0.6s) */
  SLIDER: 0.6,
  /** Duration for quick fade transitions (0.1s) */
  QUICK_FADE: 0.1,
  /** Duration for hover tooltip/popup entrance animations (0.12s) */
  HOVER_POPUP: 0.12,
  /** Duration for streaming content live indicator pulse (1.4s) */
  LIVE_INDICATOR: 1.4,
  /** Duration for floating/bobbing decorative animations (3s) */
  FLOATING_DURATION: 3,
  /** Duration for robust fade/animate in (0.4s) */
  FADE_IN: 0.4,
  /** Duration for half-second transitions (0.5s) */
  HALF_SECOND: 0.5,
  /** Duration for subtle movement animations (0.3s) */
  SUBTLE_MOVE: 0.3,
  /** Duration for tab switch/view change (0.3s) */
  TAB_SWITCH: 0.3,
  /** Duration for gentle pulse animations (0.6s) */
  PULSE: 0.6,
  /** Stagger delay between card entrance animations (0.05s) */
  CARD_ENTRANCE_DELAY: 0.05,
  /** Duration of each card entrance animation (0.3s) */
  CARD_ENTRANCE_DURATION: 0.3,
  /** Duration for checkmark overlay fade-in (0.25s) */
  CHECKMARK_OVERLAY_S: 0.25,
  /** Duration for loading overlay fade-in (0.15s) */
  LOADING_OVERLAY_S: 0.15,
  /** Duration for quick text swap/fade transitions (0.15s) */
  TEXT_FADE: 0.15,
  /** Duration for scroll-to-top/scroll-to-bottom entry pulse ring animation (0.8s) */
  ENTRY_PULSE: 0.8,
  /** Duration for animated number counter transitions (0.8s) */
  NUMBER_COUNTER: 0.8,
  /** Duration for attention-pulse badge animation cycle (0.6s) */
  ATTENTION_PULSE: 0.6,
} as const;

/**
 * Animation Default Duration Values (seconds)
 * Centralized source of truth for common framer-motion animation duration values.
 * Flexy says: No hardcoded { duration: 0 } for instant/no-animation transitions!
 * Usage: import { ANIMATION_DEFAULTS } from "@blueprint/shared";
 *        transition={{ ...ANIMATION_DEFAULTS.ZERO_DURATION }}
 */
export const ANIMATION_DEFAULTS = {
  /** Zero-duration transition for instant/no-animation state changes */
  ZERO_DURATION: { duration: 0 } as const,
} as const;

/**
 * Animation Repeat Counts
 * Centralized source of truth for framer-motion animation repeat count
 * magic numbers used in component transition configs.
 * Flexy says: No hardcoded repeat: 5 in component transition configs!
 * Usage: import { ANIMATION_REPEAT } from "@blueprint/shared";
 *        transition={{ repeat: ANIMATION_REPEAT.ATTENTION_PULSE }}
 */
export const ANIMATION_REPEAT = {
  /** Number of attention-pulse badge animation cycles (5 repeats ≈ 3s total) */
  ATTENTION_PULSE: 5,
} as const;

/**
 * Common Animation Entrance Delays (seconds)
 * Centralized source of truth for framer-motion animation entrance delay values
 * used across component entrance animations. Single source to eliminate hardcoded
 * float magic numbers from transition configs.
 * Flexy says: No hardcoded 0.1 / 0.15 / 0.2 delay values in component transition configs!
 * Usage: import { ANIMATION_ENTRANCE_DELAYS } from "@blueprint/shared";
 *        transition={{ delay: ANIMATION_ENTRANCE_DELAYS.FAST }}
 */
export const ANIMATION_ENTRANCE_DELAYS = {
  /** Very fast entrance delay (0.05s) — for micro-interactions where speed matters */
  VERY_FAST: 0.05,
  /** Fast entrance delay (0.1s) — for quick element reveals and toolbar feedback */
  FAST: 0.1,
  /** Slightly faster than moderate (0.12s) — for near-instant feedback */
  VERY_MODERATE: 0.12,
  /** Moderate entrance delay (0.15s) — for standard staggered entrances */
  MODERATE: 0.15,
  /** Slow entrance delay (0.2s) — for secondary entrance effects */
  SLOW: 0.2,
  /** Near half-second entrance delay (0.25s) — for kbd entrance animation in ShowEditorButton */
  NEARLY_HALF: 0.25,
  /** Slower entrance delay (0.3s) — for tertiary elements and content reveals */
  SLOWER: 0.3,
  /** Slowest common entrance delay (0.4s) — for delayed emphasis entrances */
  SLOWEST: 0.4,
  /** Half-second entrance delay (0.5s) — for prominent delayed reveals */
  HALF_SECOND: 0.5,
  /** Three-quarter second entrance delay (0.6s) — for substantial delayed reveals */
  THREE_QUARTER: 0.6,
  /** Two-thirds second entrance delay (0.65s) — for kbd/back-button entrance animations in StepReview */
  TWO_THIRDS: 0.65,
  /** Seven-tenths second entrance delay (0.7s) — for generate-button entrance animation in StepReview */
  SEVEN_TENTHS: 0.7,
  /** Full-second entrance delay (0.8s) — for closing/ending entrance cascades */
  FULL_SECOND: 0.8,
} as const;

/**
 * Common Animation Entrance Delays (milliseconds)
 * Centralized source of truth for entrance delay values in milliseconds,
 * used for setTimeout/setTimeout-like operations in mount animations.
 * Flexy says: No hardcoded 300ms mount animation delays in components!
 * Usage: import { ANIMATION_ENTRANCE_DELAYS_MS } from "@blueprint/shared";
 *        mountAnimationDelayMs={ANIMATION_ENTRANCE_DELAYS_MS.SHORT_MOUNT}
 */
export const ANIMATION_ENTRANCE_DELAYS_MS = {
  /** Short mount animation delay (150ms) — for rapid mount entrance effects */
  SHORT_MOUNT: 150,
  /** Standard mount animation delay (300ms) — for typical mount entrance effects */
  STANDARD_MOUNT: 300,
  /** Long mount animation delay (500ms) — for delayed mount entrance effects */
  LONG_MOUNT: 500,
} as const;

/**
 * Celebration Animation Defaults
 * Centralized source of truth for completion celebration timing and particle config.
 * Flexy says: No hardcoded 24 particles or 1500ms delay in celebration code!
 * Usage: import { CELEBRATION_DEFAULTS } from "@blueprint/shared";
 *        particleCount: CELEBRATION_DEFAULTS.PARTICLE_COUNT
 */
export const CELEBRATION_DEFAULTS = {
  /** Display duration for reduced-motion celebration variant (ms) */
  REDUCED_MOTION_DISPLAY_MS: 1500,
  /** Time before particles begin fading out (ms) */
  PARTICLE_FADEOUT_MS: 2000,
  /** Delay before completion state settles (ms) */
  COMPLETION_DELAY_MS: 2500,
  /** Number of celebration particles to render */
  PARTICLE_COUNT: 24,
  /** Base distance particles travel from origin (px) */
  PARTICLE_BASE_DISTANCE_PX: 80,
  /** Random additional distance for particles (px) */
  PARTICLE_RANDOM_DISTANCE_PX: 120,
  /** Base particle size (px) */
  PARTICLE_BASE_SIZE_PX: 6,
  /** Random additional particle size (px) */
  PARTICLE_RANDOM_SIZE_PX: 8,
  /** Particle shape options */
  PARTICLE_SHAPES: ["circle", "square", "star"] as const,
  /** Particle animation duration (seconds) */
  PARTICLE_ANIMATION_DURATION_S: 1.2,
} as const;

/**
 * Hover Spring Animation Config
 * Centralized source of truth for the spring animation used on the scroll
 * progress bar hover thumb. Eliminates hardcoded stiffness/damping/mass values
 * in component code.
 * Flexy says: No hardcoded { stiffness: 400, damping: 20, mass: 0.3 } in components!
 * Usage: import { SPRING_SCROLL_HOVER } from "@blueprint/shared";
 *        transition={{ ...SPRING_SCROLL_HOVER }}
 */
export const SPRING_SCROLL_HOVER = {
  type: "spring" as const,
  stiffness: 400,
  damping: 20,
  mass: 0.3,
} as const;

/**
 * Ripple animation configuration defaults for RippleButton components.
 * Centralized source of truth for ripple click feedback animation timing and sizing.
 * Flexy says: No hardcoded ripple delay/size/scale magic numbers in components!
 * Usage: import { RIPPLE_DEFAULTS } from "@blueprint/shared";
 *        removalDelay: RIPPLE_DEFAULTS.REMOVAL_DELAY_MS
 */
export const RIPPLE_DEFAULTS = {
  /** Delay before ripple element is removed from DOM (ms) */
  REMOVAL_DELAY_MS: 600,
  /** CSS transition duration for ripple expand animation (s) */
  TRANSITION_DURATION_S: 0.6,
  /** Initial size of the ripple element (px) */
  SIZE_PX: 20,
  /** Offset to center the ripple under the cursor (px) */
  MARGIN_OFFSET_PX: -10,
  /** Initial opacity of the ripple at creation */
  INITIAL_OPACITY: 0.5,
  /** Final scale multiplier for ripple expansion */
  FINAL_SCALE: 4,
} as const;

/**
 * Scroll-to-top Button Entry Pulse Duration (ms)
 * Centralized source of truth for the entry pulse ring animation duration
 * on scroll-to-top/scroll-to-bottom buttons. Controls how long the subtle
 * expanding glow effect plays when the button first appears.
 * Flexy says: No hardcoded 1500ms pulse durations in components!
 * Usage: import { SCROLL_PULSE_DEFAULTS } from "@blueprint/shared";
 *        setTimeout(fn, SCROLL_PULSE_DEFAULTS.ENTRY_PULSE_MS)
 */
export const SCROLL_PULSE_DEFAULTS = {
  /** Duration (ms) of the entry-pulse ring effect on scroll buttons */
  ENTRY_PULSE_MS: 1500,
} as const;

/**
 * SVG/Circular Progress Transition Defaults
 * Centralized source of truth for SVG stroke animation configuration.
 * Eliminates hardcoded "ease-out" timing functions and stroke animation durations.
 * Flexy says: No hardcoded SVG stroke transition values in components!
 * Usage: import { SVG_TRANSITION_DEFAULTS } from "@blueprint/shared";
 *        transition: SVG_TRANSITION_DEFAULTS.STROKE_TIMING
 */
export const SVG_TRANSITION_DEFAULTS = {
  /** Duration in ms for stroke-dashoffset animation on circular progress indicators */
  STROKE_DASHOFFSET_DURATION_MS: 700,
  /** Duration in seconds for stroke color transition on circular progress indicators (0.45s) */
  STROKE_COLOR_TRANSITION_S: 0.45,
  /** Timing function for SVG stroke animations */
  STROKE_TIMING: "ease-out",
  /** CSS transition-property value for SVG stroke animations ("stroke-dashoffset, stroke") */
  STROKE_PROPERTY: "stroke-dashoffset, stroke",
} as const;

/**
 * Particle Animation Defaults
 * Centralized source of truth for AnimatedCopyButton celebration particle config.
 * Flexy says: No hardcoded particle count/distance/duration magic numbers in components!
 * Usage: import { PARTICLE_DEFAULTS } from "@blueprint/shared";
 *        particleCount: PARTICLE_DEFAULTS.COUNT
 */
export const PARTICLE_DEFAULTS = {
  /** Number of particles spawned per click */
  COUNT: 12,
  /** Base distance particles travel from origin (px) */
  BASE_DISTANCE_PX: 30,
  /** Random additional distance for particle travel (px) */
  RANDOM_DISTANCE_PX: 20,
  /** Base duration of particle animation (ms) */
  BASE_DURATION_MS: 400,
  /** Random additional duration for particle animation (ms) */
  RANDOM_DURATION_MS: 200,
  /** Delay before GPU cleanup of particle elements (ms) */
  CLEANUP_DELAY_MS: 700,
  /** Base particle size (px) */
  BASE_SIZE_PX: 3,
  /** Random additional particle size (px) */
  RANDOM_SIZE_PX: 3,
} as const;

/**
 * Framer Motion Type Constants
 * Centralized source of truth for Framer Motion animation type strings used
 * in `type` fields across transition/variant configurations.
 * Flexy says: No hardcoded "spring" strings in animation transitions!
 * Usage: import { FRAMER_TYPE } from "@blueprint/shared";
 *        transition={{ type: FRAMER_TYPE.SPRING, ...SPRING_CONFIG.SNAPPY }}
 */
export const FRAMER_TYPE = {
  /** Spring-based animation physics */
  SPRING: "spring" as const,
} as const;

/**
 * Entrance Stagger Defaults
 * Centralized source of truth for staggered entrance animation timing.
 * Flexy says: No hardcoded stagger delays in component entrance animations!
 * Usage: import { ENTRANCE_STAGGER_DEFAULTS } from "@blueprint/shared";
 *        delay: ENTRANCE_STAGGER_DEFAULTS.BASE_DELAY_S
 */
export const ENTRANCE_STAGGER_DEFAULTS = {
  /** Base delay before the cascade begins (s) */
  BASE_DELAY_S: 0.15,
  /** Delay increment between staggered elements (s) */
  INCREMENT_S: 0.07,
  /** Default CSS animation-fill-mode for entrance animations */
  FILL_MODE: "backwards" as const,
  /** Short delay for secondary elements (s) */
  SHORT_DELAY_S: 0.1,
  /** Medium delay for tertiary elements (s) */
  MEDIUM_DELAY_S: 0.2,
  /** Stagger delay between chip/tech-stack item entrance animations (s) */
  CHIP_STAGGER_S: 0.03,
} as const;

/**
 * Skeleton Loading Defaults
 * Centralized source of truth for skeleton loader timing and layout dimensions.
 * Flexy says: No hardcoded skeleton fadeout timings or layout percentages in components!
 * Usage: import { SKELETON_DEFAULTS } from "@blueprint/shared";
 *        fadeoutMs: SKELETON_DEFAULTS.FADEOUT_MS
 */
export const SKELETON_DEFAULTS = {
  /** Fadeout transition duration for skeleton placeholders (ms) */
  FADEOUT_MS: 300,
  /** Preview skeleton line widths (percentages) */
  PREVIEW_LINE_WIDTHS: ["88%", "72%", "95%", "60%", "82%", "70%", "90%", "55%", "78%"] as const,
  /** Preview skeleton code block width (percentage) */
  PREVIEW_CODE_WIDTH: "92%" as const,
  /** Number of lines in editor skeleton */
  EDITOR_LINE_COUNT: 16,
  /** Editor skeleton line widths (percentages) */
  EDITOR_LINE_WIDTHS: [92, 78, 85, 60, 95, 72, 88, 55, 80, 70, 90, 65, 82, 75, 58, 87] as const,
  /** Editor skeleton indent levels (multiples of INDENT_MULTIPLIER_PX) */
  EDITOR_LINE_INDENTS: [0, 0, 2, 0, 4, 0, 2, 0, 6, 0, 0, 3, 0, 2, 0, 4] as const,
  /** Editor skeleton line height (px) */
  EDITOR_LINE_HEIGHT_PX: 14,
  /** Editor skeleton indent multiplier (px per indent level) */
  EDITOR_INDENT_MULTIPLIER_PX: 12,
} as const;

/**
 * Staggered Entrance Animation Config
 * Centralized source of truth for staggerChildren and delayChildren values
 * used in framer-motion variant configurations. Eliminates hardcoded float
 * magic numbers in component stagger configs.
 * Flexy says: No hardcoded staggerChildren/delayChildren magic numbers in components!
 * Usage: import { STAGGER_CONFIG } from "@blueprint/shared";
 *        visible: { transition: { staggerChildren: STAGGER_CONFIG.ERROR_FALLBACK.STAGGER_S, ... } }
 */
export const STAGGER_CONFIG = {
  /** Stagger config for ErrorFallback entrance cascade */
  ERROR_FALLBACK: {
    /** Delay (s) between each child element entrance in the error fallback cascade */
    STAGGER_S: 0.12,
    /** Initial delay (s) before the error fallback cascade begins */
    DELAY_CHILDREN_S: 0.1,
  } as const,
  /** Stagger config for StepFeatures chip/suggestion entrance cascade */
  FEATURES_CHIP: {
    /** Delay (s) between each feature chip entrance */
    STAGGER_S: 0.04,
  } as const,
  /** Stagger config for StepReview section-level entrance cascade */
  REVIEW_SECTION: {
    /** Delay (s) between each review section entrance */
    STAGGER_S: 0.035,
  } as const,
  /** Stagger config for StepReview group-level entrance cascade */
  REVIEW_GROUP: {
    /** Delay (s) between each review group item entrance */
    STAGGER_S: 0.04,
  } as const,
} as const;

/**
 * Opacity Keyframe Pulse Presets (for framer-motion animate keyframes)
 * Centralized source of truth for opacity pulse keyframe arrays used
 * in breathing/pulsing/attention animations across components.
 * Flexy says: No hardcoded opacity: [1, 0.35, 1] arrays in component animation keyframes!
 * Usage: import { OPACITY_PULSE } from "@blueprint/shared";
 *        animate={{ opacity: OPACITY_PULSE.GLOW }}
 */
export const OPACITY_PULSE = {
  /** Gentle glow pulse: 0.4 → 0.7 → 0.4 — for soft glow/breathe effects behind icons */
  GLOW: [0.4, 0.7, 0.4] as const,
  /** Breathing pulse: 1 → 0.35 → 1 — for content availability indicator dots */
  BREATHING: [1, 0.35, 1] as const,
  /** Soft blink pulse: 0.8 → 1 → 0.8 — for subtle attention-seeking elements */
  SOFT_BLINK: [0.8, 1, 0.8] as const,
  /** Typing indicator pulse: 0.4 → 1 → 0.4 — for live typing/streaming indicators */
  TYPING: [0.4, 1, 0.4] as const,
  /** Half-opacity blink: 0.5 → 1 → 0.5 — for standard blinking/attention effects */
  HALF_BLINK: [0.5, 1, 0.5] as const,
  /** Attention pulse: 1 → 0.9 → 1 — subtle 10% opacity dip for attention-seeking badge animations */
  ATTENTION: [1, 0.9, 1] as const,
} as const;

/**
 * Scale Keyframe Pulse Presets (for framer-motion animate keyframes)
 * Centralized source of truth for scale pulse keyframe arrays used
 * in breathing/pulsing/attention animations across components.
 * Flexy says: No hardcoded scale: [1, 1.04, 1] arrays in component animation keyframes!
 * Usage: import { SCALE_PULSE } from "@blueprint/shared";
 *        animate={{ scale: SCALE_PULSE.ERROR_ICON }}
 */
export const SCALE_PULSE = {
  /** Gentle error icon pulse: 1 → 1.04 → 1 — for subtle emphasis on warning/error icons */
  ERROR_ICON: [1, 1.04, 1] as const,
  /** Glow pulse: 1 → 1.15 → 1 — for soft glow rings behind interactive elements */
  GLOW: [1, 1.15, 1] as const,
  /** Content dot pulse: 1 → 1.2 → 1 — for content availability indicator dots */
  CONTENT_DOT: [1, 1.2, 1] as const,
  /** Particle burst: 0 → 1.2 → 0.8 — for celebration particle burst entrance */
  PARTICLE_BURST: [0, 1.2, 0.8] as const,
  /** Section badge pulse: 1 → 1.12 → 1 — for section badge highlights */
  SECTION_BADGE: [1, 1.12, 1] as const,
  /** Milestone pulse: 1 → 1.35 → 1 — for milestone/achievement reached animations */
  MILESTONE: [1, 1.35, 1] as const,
  /** Particle fade-out: 0.5 → 1.2 → 1.5 — for celebration particle ring expansion */
  PARTICLE_RING: [0.5, 1.2, 1.5] as const,
  /** Attention pulse: 1 → 1.03 → 1 — subtle 3% scale pulse for attention-seeking badge animations */
  ATTENTION: [1, 1.03, 1] as const,
} as const;

/**
 * Y-offset Keyframe Pulse Presets (for framer-motion animate keyframes)
 * Centralized source of truth for y-offset keyframe arrays used
 * in floating/bobbing animations across components.
 * Flexy says: No hardcoded y: [0, -4, 0] arrays in component animation keyframes!
 * Usage: import { Y_OFFSET } from "@blueprint/shared";
 *        animate={{ y: Y_OFFSET.TYPING }}
 */
export const Y_OFFSET = {
  /** Subtle float: 0 → -3 → 0 — for gentle floating icons and decorative elements */
  SUBTLE: [0, -3, 0] as const,
  /** Typing bobbing: 0 → -4 → 0 — for live typing/streaming indicator bobbing */
  TYPING: [0, -4, 0] as const,
} as const;

/**
 * Skeleton Pulse Animation Defaults
 * Centralized source of truth for the skeleton loader pulse animation timing
 * and visual properties. Used in index.html critical CSS and any skeleton
 * loading states throughout the app.
 * Flexy says: No hardcoded skeleton-pulse keyframe values in index.html!
 * Usage: import { SKELETON_PULSE_DEFAULTS } from "@blueprint/shared";
 *        animation: skeleton-pulse ${SKELETON_PULSE_DEFAULTS.DURATION_S}s ease-in-out infinite
 */
export const SKELETON_PULSE_DEFAULTS = {
  /** Duration of one full pulse cycle in seconds (2.5s) */
  DURATION_S: 2.5,
  /** Scale at rest (start/end of pulse) */
  SCALE_REST: 1,
  /** Scale at peak of pulse */
  SCALE_PEAK: 1.04,
  /** Opacity at rest (start/end of pulse) */
  OPACITY_REST: 0.9,
  /** Opacity at peak of pulse */
  OPACITY_PEAK: 1,
  /** Filter brightness at peak of pulse */
  BRIGHTNESS_PEAK: 1.15,
} as const;

/**
 * Scroll Progress Bar Defaults
 * Centralized source of truth for scroll progress bar UI constants.
 * Flexy says: No hardcoded 80/2/3 pixel values in progress bar components!
 * Usage: import { SCROLL_PROGRESS_DEFAULTS } from "@blueprint/shared";
 *        showAfter={SCROLL_PROGRESS_DEFAULTS.PAGE_PROGRESS_SHOW_AFTER_PX}
 */
export const SCROLL_PROGRESS_DEFAULTS = {
  /** Scroll threshold before page-level progress bar appears (80px) */
  PAGE_PROGRESS_SHOW_AFTER_PX: 80,
  /** Height of the page-level progress bar in pixels (2px) */
  PAGE_PROGRESS_BAR_HEIGHT_PX: 2,
  /** Scroll threshold before editor-level progress bar appears (50px - same as HAS_SCROLLED_PX) */
  EDITOR_PROGRESS_SHOW_AFTER_PX: 50,
  /** Height of the editor-level progress bar in pixels (3px) */
  EDITOR_PROGRESS_BAR_HEIGHT_PX: 3,
} as const;

/**
 * Scroll Trigger Thresholds (pixels)
 * Centralized source of truth for scroll-based UI trigger points.
 * Flexy says: No hardcoded scroll pixel values in component code!
 * Usage: import { SCROLL_THRESHOLD_DEFAULTS } from "@blueprint/shared";
 *        window.scrollY > SCROLL_THRESHOLD_DEFAULTS.HEADER_SHADOW_PX
 */
export const SCROLL_THRESHOLD_DEFAULTS = {
  /** Scroll distance before header shadow appears (20px) */
  HEADER_SHADOW_PX: 20,
  /** Scroll distance before scroll-to-top button appears (400px) */
  SCROLL_TO_TOP_PX: 400,
  /** Minimum scroll distance to consider page as scrolled (50px) */
  HAS_SCROLLED_PX: 50,
} as const;

/**
 * Auto-Scroll Defaults
 * Centralized configuration for smart auto-scroll behavior during content generation.
 * Flexy says: No hardcoded magic number thresholds or throttle intervals in hooks!
 * Usage: import { AUTO_SCROLL_DEFAULTS } from "@blueprint/shared";
 */
export const AUTO_SCROLL_DEFAULTS = {
  /** Default threshold in pixels from bottom to consider the user "near bottom" */
  NEAR_BOTTOM_THRESHOLD_PX: 80,
  /** Throttle interval (ms) for scroll-to-bottom during rapid content streaming */
  SCROLL_THROTTLE_MS: 100,
} as const;

/**
 * Build Tool Configuration Defaults
 * Centralized source of truth for Vite build/minification options.
 * Flexy says: No hardcoded terser options in vite.config.ts!
 * Usage: import { BUILD_CONFIG } from "@blueprint/shared";
 *        terserOptions: BUILD_CONFIG.TERSER_OPTIONS
 */
export const BUILD_CONFIG = {
  /** Terser minification options for production builds */
  TERSER_OPTIONS: {
    compress: {
      drop_console: false,
      dead_code: true,
      unused: true,
      passes: 2,
    },
    mangle: true,
  } as const,
  /** Minifier to use for production builds */
  MINIFIER: "terser" as const,
} as const;
