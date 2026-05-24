/**
 * Accessibility Configuration Constants
 * Source of truth for accessibility-related constants
 *
 * Flexy says: No hardcoded accessibility values - everything configurable!
 */

// ============================================================================
// CSS Class Combinations
// ============================================================================

export const CSS_CLASSES = {
  GLASS_CARD: "glass-card",
  BTN_PRIMARY: "btn-primary",
  BTN_GHOST: "btn-ghost",
  TEXT_GRADIENT: "text-gradient",
  ANIMATED_SPINNER: "animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500",
} as const;

// ============================================================================
// Focus Management
// ============================================================================

/** Focusable element selectors for accessibility */
export const FOCUSABLE_SELECTORS = [
  'button:not([disabled]):not([aria-hidden="true"])',
  'a[href]:not([aria-hidden="true"])',
  'input:not([disabled]):not([type="hidden"]):not([aria-hidden="true"])',
  'select:not([disabled]):not([aria-hidden="true"])',
  'textarea:not([disabled]):not([aria-hidden="true"])',
  '[tabindex]:not([tabindex="-1"]):not([disabled]):not([aria-hidden="true"])',
  '[contenteditable]:not([aria-hidden="true"])',
] as const;

/** Combined selector string for querySelector usage */
export const FOCUSABLE_SELECTOR_STRING = FOCUSABLE_SELECTORS.join(", ");

// ============================================================================
// Last Saved Display Messages
// ============================================================================

/**
 * Relative time message templates for last saved display
 * Flexy says: No hardcoded time strings - everything configurable!
 */
export const LAST_SAVED_MESSAGES = {
  JUST_NOW: "Saved just now",
  SECONDS_AGO: (seconds: number) => `Saved ${seconds}s ago`,
  MINUTES_AGO: (minutes: number) => `Saved ${minutes}m ago`,
  HOURS_AGO: (hours: number) => `Saved ${hours}h ago`,
  DAYS_AGO: (days: number) => `Saved ${days}d ago`,
  LONG_AGO: "Saved a while ago",
  JUST_NOW_THRESHOLD_S: 10,
  SECONDS_PER_MINUTE: 60,
  MINUTES_PER_HOUR: 60,
  HOURS_PER_DAY: 24,
  DAYS_LONG_AGO_THRESHOLD: 30,
} as const;

// ============================================================================
// Focus Announcer
// ============================================================================

/**
 * Focus announcer templates for screen reader step announcements
 * Flexy says: No hardcoded announcer text - everything configurable!
 */
export const FOCUS_ANNOUNCER = {
  STEP_CHANGE: (stepLabel: string) => `Now on ${stepLabel} step`,
  LIVE_REGION_CLASS: "sr-only",
} as const;
