/**
 * Visual Effects Configuration Constants
 * Source of truth for animation effects, particles, and skeleton loading configs
 *
 * Flexy says: Single source of truth in @blueprint/shared!
 */

import {
  RIPPLE_DEFAULTS as SHARED_RIPPLE_DEFAULTS,
  PARTICLE_DEFAULTS as SHARED_PARTICLE_DEFAULTS,
  SKELETON_DEFAULTS as SHARED_SKELETON_DEFAULTS,
  ENTRANCE_STAGGER_DEFAULTS as SHARED_ENTRANCE_STAGGER_DEFAULTS,
} from "@blueprint/shared";

// ============================================================================
// Ripple Animation
// ============================================================================

/**
 * Ripple animation configuration
 * Flexy says: Single source of truth in @blueprint/shared!
 */
export const RIPPLE_CONFIG = {
  REMOVAL_DELAY_MS: SHARED_RIPPLE_DEFAULTS.REMOVAL_DELAY_MS,
  TRANSITION_DURATION_S: SHARED_RIPPLE_DEFAULTS.TRANSITION_DURATION_S,
  SIZE_PX: SHARED_RIPPLE_DEFAULTS.SIZE_PX,
  MARGIN_OFFSET_PX: SHARED_RIPPLE_DEFAULTS.MARGIN_OFFSET_PX,
  INITIAL_OPACITY: SHARED_RIPPLE_DEFAULTS.INITIAL_OPACITY,
  FINAL_SCALE: SHARED_RIPPLE_DEFAULTS.FINAL_SCALE,
} as const;

// ============================================================================
// Particle Animation
// ============================================================================

/**
 * Particle animation configuration
 * Flexy says: Single source of truth in @blueprint/shared!
 */
export const PARTICLE_CONFIG = {
  COUNT: SHARED_PARTICLE_DEFAULTS.COUNT,
  BASE_DISTANCE_PX: SHARED_PARTICLE_DEFAULTS.BASE_DISTANCE_PX,
  RANDOM_DISTANCE_PX: SHARED_PARTICLE_DEFAULTS.RANDOM_DISTANCE_PX,
  BASE_DURATION_MS: SHARED_PARTICLE_DEFAULTS.BASE_DURATION_MS,
  RANDOM_DURATION_MS: SHARED_PARTICLE_DEFAULTS.RANDOM_DURATION_MS,
  CLEANUP_DELAY_MS: SHARED_PARTICLE_DEFAULTS.CLEANUP_DELAY_MS,
  BASE_SIZE_PX: SHARED_PARTICLE_DEFAULTS.BASE_SIZE_PX,
  RANDOM_SIZE_PX: SHARED_PARTICLE_DEFAULTS.RANDOM_SIZE_PX,
} as const;

export const SKELETON_CONFIG = {
  FADEOUT_MS: SHARED_SKELETON_DEFAULTS.FADEOUT_MS,
} as const;

// ============================================================================
// Entrance Animation Stagger
// ============================================================================

/**
 * Entrance stagger timing configuration
 * Flexy says: Single source of truth in @blueprint/shared!
 */
export const ENTRANCE_STAGGER = {
  /** Base delay before the cascade begins (seconds) */
  BASE_DELAY_S: SHARED_ENTRANCE_STAGGER_DEFAULTS.BASE_DELAY_S,
  /** Delay increment between staggered elements (seconds) */
  INCREMENT_S: SHARED_ENTRANCE_STAGGER_DEFAULTS.INCREMENT_S,
  /** Default CSS animation-fill-mode for entrance animations */
  FILL_MODE: SHARED_ENTRANCE_STAGGER_DEFAULTS.FILL_MODE,
  /** Short delay for secondary elements (step indicator, etc.) */
  SHORT_DELAY_S: SHARED_ENTRANCE_STAGGER_DEFAULTS.SHORT_DELAY_S,
  /** Medium delay for tertiary elements (split pane, etc.) */
  MEDIUM_DELAY_S: SHARED_ENTRANCE_STAGGER_DEFAULTS.MEDIUM_DELAY_S,
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
