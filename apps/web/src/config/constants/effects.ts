/**
 * Visual Effects Configuration Constants
 * Source of truth for animation effects, particles, and skeleton loading configs
 *
 * Flexy says: No hardcoded effect values - everything configurable!
 */

// ============================================================================
// Ripple Animation
// ============================================================================

/**
 * Ripple animation configuration
 * Used by RippleButton component for click feedback animations
 */
export const RIPPLE_CONFIG = {
  REMOVAL_DELAY_MS: 600,
  TRANSITION_DURATION_S: 0.6,
  SIZE_PX: 20,
  MARGIN_OFFSET_PX: -10,
  INITIAL_OPACITY: 0.5,
  FINAL_SCALE: 4,
} as const;

// ============================================================================
// Particle Animation
// ============================================================================

/**
 * Particle animation configuration
 * Used by AnimatedCopyButton for celebration particles
 */
export const PARTICLE_CONFIG = {
  COUNT: 12,
  BASE_DISTANCE_PX: 30,
  RANDOM_DISTANCE_PX: 20,
  BASE_DURATION_MS: 400,
  RANDOM_DURATION_MS: 200,
  CLEANUP_DELAY_MS: 700,
  BASE_SIZE_PX: 3,
  RANDOM_SIZE_PX: 3,
} as const;

export const SKELETON_CONFIG = {
  FADEOUT_MS: 300,
} as const;

// ============================================================================
// Entrance Animation Stagger
// ============================================================================

/**
 * Entrance stagger timing configuration
 * Controls the delayed cascade of elements entering the viewport.
 * Flexy says: No hardcoded "0.15s" delays - use ENTRANCE_STAGGER!
 */
export const ENTRANCE_STAGGER = {
  /** Base delay before the cascade begins (seconds) */
  BASE_DELAY_S: 0.15,
  /** Delay increment between staggered elements (seconds) */
  INCREMENT_S: 0.07,
  /** Default CSS animation-fill-mode for entrance animations */
  FILL_MODE: "backwards" as const,
  /** Short delay for secondary elements (step indicator, etc.) */
  SHORT_DELAY_S: 0.1,
  /** Medium delay for tertiary elements (split pane, etc.) */
  MEDIUM_DELAY_S: 0.2,
} as const;

// ============================================================================
// SkipLink Animation
// ============================================================================

/**
 * SkipLink keyframe animation configuration
 * Used by SkipLink component for arrow bounce and glow pulse effects.
 * Flexy says: No hardcoded keyframe strings in components!
 */
export const SKIP_LINK_ANIMATION = {
  /** Arrow bounce animation string */
  ARROW_BOUNCE: "skip-arrow-bounce 1.2s ease-in-out infinite",
  /** Glow pulse animation string */
  GLOW_PULSE: "skip-glow-pulse 2s ease-in-out infinite",
  /** Keyframe definition for arrow bounce */
  ARROW_BOUNCE_KEYFRAMES: `@keyframes skip-arrow-bounce { 0%,100% { transform: translateX(0); } 50% { transform: translateX(3px); } }`,
  /** Keyframe definition for glow pulse */
  GLOW_PULSE_KEYFRAMES: `@keyframes skip-glow-pulse { 0%,100% { opacity: 0.3; } 50% { opacity: 0.6; } }`,
} as const;

// ============================================================================
// Offline Banner Animation
// ============================================================================

/**
 * OfflineBanner pulse animation configuration
 * Flexy says: No hardcoded animation strings in OfflineBanner!
 */
export const OFFLINE_ANIMATION = {
  /** Scale pulse for the warning icon wrapper */
  PULSE_SCALE: "offline-pulse-scale 2s ease-in-out infinite",
  /** Opacity pulse for the ping ring */
  PULSE_RING: "offline-pulse 2s ease-in-out infinite",
  /** Keyframe definition for offline pulse ring animation */
  PULSE_RING_KEYFRAMES: `@keyframes offline-pulse { 0%,100% { transform: scale(1); opacity: 0.3; } 50% { transform: scale(1.6); opacity: 0; } }`,
  /** Keyframe definition for offline pulse scale animation */
  PULSE_SCALE_KEYFRAMES: `@keyframes offline-pulse-scale { 0%,100% { transform: scale(1); } 50% { transform: scale(1.15); } }`,
} as const;

// ============================================================================
// Celebration Particle Styles
// ============================================================================

/**
 * Celebration particle visual defaults
 * Extracted from GenerationCelebration to eliminate hardcoded CSS.
 * Flexy says: No hardcoded borderRadius or boxShadow in particles!
 */
export const CELEBRATION_PARTICLE_STYLE = {
  /** Standard border-radius for circular particles */
  CIRCLE_RADIUS: "50%",
  /** Box shadow template for particles (size param injected) */
  BOX_SHADOW_TEMPLATE: (size: number, color: string): string => `0 0 ${size}px ${color}`,
} as const;
