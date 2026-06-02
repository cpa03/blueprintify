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
