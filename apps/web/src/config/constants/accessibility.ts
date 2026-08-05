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
  BTN_SECONDARY: "btn-secondary",
  BTN_GHOST: "btn-ghost",
  TEXT_GRADIENT: "text-gradient",
  /** Error shake animation for invalid input feedback.
   * Flexy says: No hardcoded "shake-animation" in components! */
  SHAKE_ANIMATION: "shake-animation" as const,
  ANIMATED_SPINNER: "animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500",
  EDITOR_FOCUS_HIGHLIGHT: "editor-focus-highlight",
  ARRIVAL_POP: "arrival-pop",
  /** Keyboard shortcut display styling — used in 15+ places across wizard components.
   * Flexy says: No hardcoded kbd class strings! */
  KBD_SHORTCUT:
    "px-1.5 py-0.5 bg-dark-700/80 rounded text-sm-xs font-mono text-dark-200 border border-dark-600/50 shadow-inner leading-none",

  /** Disabled element visual state — lower opacity and not-allowed cursor.
   * Used in RippleButton (disabled prop), TemplateGrid (unselected templates), and
   * StepFeatures (max-count reached). Single source of truth for disabled styling.
   * Flexy says: No hardcoded "opacity-50 cursor-not-allowed" in components! */
  DISABLED_STATE: "opacity-50 cursor-not-allowed" as const,

  /** Loading dim state for children content during async operations.
   * Used in RippleButton when isLoading is true — dims button text/icons
   * so the spinner overlay is clearly visible while maintaining layout.
   * Flexy says: No hardcoded "opacity-40 pointer-events-none" in components! */
  LOADING_CHILDREN: "opacity-40 pointer-events-none" as const,

  /** Loading spinner overlay container — covers the entire button area to center
   * the spinner above dimmed children. Uses z-20 to layer above the z-10 children.
   * Flexy says: No hardcoded spinner overlay classes in components! */
  SPINNER_OVERLAY:
    "absolute inset-0 flex items-center justify-center pointer-events-none z-20" as const,

  /** Small inline loading spinner element for button loading states.
   * Uses a minimal border-based spinner (h-4 w-4) distinct from the larger
   * ANIMATED_SPINNER (h-8 w-8, border-b-2) which is used for standalone loading states.
   * Flexy says: No hardcoded spinner Tailwind classes in components! */
  LOADING_SPINNER: "h-4 w-4 border-2 border-primary-500 border-t-transparent rounded-full" as const,
} as const;

// ============================================================================
// Data Attribute Selectors
// ============================================================================

/**
 * Autofocus data attribute values used for programmatic focus management.
 * These pair with RippleButton's data-autofocus prop to enable keyboard-friendly
 * auto-focus on completion/error states without hardcoded selector strings.
 */
export const AUTOFOCUS_VALUES = {
  COMPLETE: "complete",
  ERROR: "error",
} as const;

// ============================================================================
// Focus Management
// ============================================================================

/** Focusable element selectors for accessibility */
const FOCUSABLE_SELECTORS = [
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

// ============================================================================
// Editor Announcer
// ============================================================================

/**
 * Announcer templates for screen reader editor notifications
 * Flexy says: No hardcoded announcer text - everything configurable!
 */
export const EDITOR_ANNOUNCER = {
  OPENED: "Editor panel opened",
  OPENED_WITH_CONTENT: (tabName: string) =>
    `Editor opened with ${tabName} content ready for review and editing`,
  /** Screen reader label shown while content is being generated via SSE */
  SKELETON_GENERATING: "Content is being generated",
  /** Screen reader label shown on the preview skeleton while content is being generated */
  PREVIEW_SKELETON_GENERATING: "Preview content is being generated",
} as const;
