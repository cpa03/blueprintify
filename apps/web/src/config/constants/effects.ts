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

// ============================================================================
// Skeleton Loader
// ============================================================================

/**
 * Skeleton loader configuration
 * Used during initial app load for smooth transition
 */
export const SKELETON_CONFIG = {
  FADEOUT_MS: 300,
} as const;

/**
 * Skeleton component size presets and defaults
 * Flexy says: No hardcoded skeleton sizes - everything configurable!
 */
export const SKELETON_PRESETS = {
  AVATAR: {
    SM: 32,
    MD: 40,
    LG: 48,
    XL: 64,
  } as const,
  BUTTON: {
    SM: { HEIGHT: 32, WIDTH: 80 } as const,
    MD: { HEIGHT: 40, WIDTH: 120 } as const,
    LG: { HEIGHT: 48, WIDTH: 160 } as const,
  } as const,
  TEXT: {
    DEFAULT_HEIGHT: 14,
    DEFAULT_LINE_SPACING: 8,
    BORDER_RADIUS: 4,
  } as const,
  CIRCULAR: {
    DEFAULT_SIZE: 40,
  } as const,
  RECTANGULAR: {
    DEFAULT_HEIGHT: 100,
    DEFAULT_BORDER_RADIUS: 8,
  } as const,
  SHIMMER_DURATION_S: 1.5,
  PULSE_DURATION_S: 1,
  PULSE_OPACITY: 0.5,
  CARD: {
    AVATAR_SIZE: 40,
    TITLE_HEIGHT: 14,
    SUBTITLE_HEIGHT: 12,
    LINE_HEIGHT: 12,
  } as const,
  CODE_BLOCK_WIDTHS: [75, 85, 65, 90, 70, 80, 60, 95] as const,
  LAST_LINE_WIDTH_PCT: "70%",
  CARD_LAST_LINE_WIDTH_PCT: "75%",
} as const;
