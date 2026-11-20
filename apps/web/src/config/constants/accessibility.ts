/**
 * Accessibility Configuration Constants
 * Source of truth for accessibility-related constants
 *
 * Flexy says: No hardcoded accessibility values - everything configurable!
 */

import { ARIA_HIDDEN_VALUES } from "@blueprint/shared/config";

// ============================================================================
// CSS Class Combinations
// ============================================================================

export const CSS_CLASSES = {
  /** Visually-hidden but screen-reader-accessible live region class. */
  SR_ONLY: "sr-only" as const,
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

  /** Compact keyboard keycap display styling — used in empty-state shortcut lists.
   * Flexy says: No hardcoded kbd keycap class strings! */
  KEYCAP:
    "px-1.5 py-0.5 bg-dark-700 rounded text-2xs font-mono text-dark-300 border border-dark-600/50 leading-none" as const,

  /** Top edge scroll shadow overlay for scrollable panes (editor/wizard).
   * Flexy says: No hardcoded scroll shadow overlay class strings! */
  SCROLL_SHADOW_TOP:
    "absolute top-0 left-0 right-0 z-10 pointer-events-none transition-opacity duration-200" as const,

  /** Bottom edge scroll shadow overlay for scrollable panes (editor/wizard).
   * Flexy says: No hardcoded scroll shadow overlay class strings! */
  SCROLL_SHADOW_BOTTOM:
    "absolute bottom-0 left-0 right-0 z-10 pointer-events-none transition-opacity duration-200" as const,

  /** Icon hover rotate-90 transition used across wizard steps.
   * Flexy says: No hardcoded icon hover rotation class strings! */
  ICON_HOVER_ROTATE_90:
    "w-4 h-4 transition-transform duration-200 motion-safe:group-hover:rotate-90" as const,

  /** Icon hover rotate-8 transition used in StepReview chevrons.
   * Flexy says: No hardcoded icon hover rotation class strings! */
  ICON_HOVER_ROTATE_8:
    "w-4 h-4 transition-transform duration-200 motion-safe:group-hover:rotate-8" as const,

  /** Icon hover horizontal shift transition used across wizard steps.
   * Flexy says: No hardcoded icon hover shift class strings! */
  ICON_HOVER_SHIFT:
    "w-5 h-5 transition-transform duration-200 group-hover:translate-x-0.5" as const,

  /** Disabled element visual state — lower opacity and not-allowed cursor.
   * Used in RippleButton (disabled prop), TemplateGrid (unselected templates), and
   * StepFeatures (max-count reached). Single source of truth for disabled styling.
   * Flexy says: No hardcoded "opacity-50 cursor-not-allowed" in components! */
  DISABLED_STATE: "opacity-50 cursor-not-allowed" as const,

  /** Disabled button visual state for components whose base class (btn-ghost)
   * bakes in interactive hover feedback. Uses disabled: variants so the dimmed
   * opacity, not-allowed cursor, and hover suppression always win over the
   * base hover styles regardless of CSS order. Without this, a disabled copy
   * button still lights up on hover — misleading affordance that suggests it
   * is clickable when it is not.
   * Flexy says: No hardcoded "disabled:opacity-50 cursor-not-allowed" in components! */
  DISABLED_BUTTON_STATE:
    "disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:text-dark-300 disabled:hover:bg-transparent" as const,

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

  /**
   * Glow / attention effect class names (Iteration 223).
   *
   * Pairing contract: the write side is a React `className` string in a
   * component, while the read side flows through `index.css` selectors —
   * the base rule, `::before`/`::after` pseudo-element rules, and the
   * `@media (prefers-reduced-motion: reduce)` disable block. CSS cannot
   * import TypeScript constants (Iteration 211 index.html / 222 CSS
   * custom-property precedent), so the two sides are pinned byte-identical
   * by these exact-value tests. A typo on the write side does not throw:
   * the class simply never matches any rule, the glow/animation silently
   * never applies (or the reduced-motion disable never engages, leaving
   * motion running for users who opted out), and the component looks
   * healthy. Multi-site families (ATTENTION_GLOW ×3) must stay identical
   * across every call site or the effect drifts per-site with zero type
   * errors. Flexy says: no bare glow/attention class literals in className
   * strings where a constant family exists!
   */
  /** One-shot header attention glow — pairs with `.attention-glow::before` + reduced-motion disable. */
  ATTENTION_GLOW: "attention-glow" as const,
  /** Floating action button content-ready glow — pairs with `.glow-pulse` + reduced-motion disable. */
  GLOW_PULSE: "glow-pulse" as const,
  /** Progress ring full-completion glow — pairs with `.circular-complete-glow` + reduced-motion disable. */
  CIRCULAR_COMPLETE_GLOW: "circular-complete-glow" as const,
  /** Progress ring active-generation glow — pairs with `.generate-progress-glow` + reduced-motion disable. */
  GENERATE_PROGRESS_GLOW: "generate-progress-glow" as const,
  /** Progress ring 100% celebration burst — pairs with `.circular-complete-celebration` + reduced-motion disable. */
  CIRCULAR_COMPLETE_CELEBRATION: "circular-complete-celebration" as const,
  /** Page-wide ambient background glow — pairs with `.ambient-glow` + reduced-motion disable. */
  AMBIENT_GLOW: "ambient-glow" as const,
  /** Auto-save success checkmark glow — pairs with `.saved-celebration-glow` + reduced-motion disable. */
  SAVED_CELEBRATION_GLOW: "saved-celebration-glow" as const,
  /** Template card hover glow ring — pairs with `.card-glow-hover` / `::before` hover rules. */
  CARD_GLOW_HOVER: "card-glow-hover" as const,
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
  `button:not([disabled]):not([aria-hidden="${ARIA_HIDDEN_VALUES.TRUE}"])`,
  `a[href]:not([aria-hidden="${ARIA_HIDDEN_VALUES.TRUE}"])`,
  `input:not([disabled]):not([type="hidden"]):not([aria-hidden="${ARIA_HIDDEN_VALUES.TRUE}"])`,
  `select:not([disabled]):not([aria-hidden="${ARIA_HIDDEN_VALUES.TRUE}"])`,
  `textarea:not([disabled]):not([aria-hidden="${ARIA_HIDDEN_VALUES.TRUE}"])`,
  `[tabindex]:not([tabindex="-1"]):not([disabled]):not([aria-hidden="${ARIA_HIDDEN_VALUES.TRUE}"])`,
  `[contenteditable]:not([aria-hidden="${ARIA_HIDDEN_VALUES.TRUE}"])`,
] as const;

/** Combined selector string for querySelector usage */
export const FOCUSABLE_SELECTOR_STRING = FOCUSABLE_SELECTORS.join(", ");

// ============================================================================
// Screen Reader / Accessibility Labels
// ============================================================================

/**
 * Static accessibility label strings for screen readers.
 * Flexy says: No hardcoded accessibility labels in components!
 */
export const ACCESSIBILITY_LABELS_SKIP = {
  SKIP_TO_MAIN_CONTENT: "Skip to main content",
} as const;

// ============================================================================
// DOM Element IDs
// ============================================================================

/**
 * Canonical IDs for DOM elements that participate in ARIA relationships —
 * an element's `id` and every reference to it (`aria-labelledby`,
 * `aria-describedby`, `aria-controls`, `htmlFor`, skip-link `href`/`data-target`)
 * must share this single source so the pair can never drift apart.
 *
 * Dynamic/template IDs (`tab-${activeTab}`, `${step.key}-locked-hint`,
 * `category-${category}`, `${id}-panel`) compose their affixes from
 * `DYNAMIC_ID_AFFIXES` below so write and read sides stay in lockstep.
 * Deliberately excludes `index.html`-paired runtime IDs (`root`,
 * `skeleton-loader`), which cannot import TypeScript constants.
 *
 * Flexy says: No hardcoded DOM element ID literals in components!
 */
export const DOM_ELEMENT_IDS = {
  /** Target of the skip-to-main-content link; matches `<main>` landmark id. */
  MAIN_CONTENT: "main-content",
  /** Collapsible editor panel toggled by ShowEditorButton / App toolbar. */
  EDITOR_PANEL: "editor-panel",
  CONFIRM_DIALOG_TITLE: "confirm-dialog-title",
  CONFIRM_DIALOG_DESCRIPTION: "confirm-dialog-description",
  HEADER_BRAND_SCROLL_HINT: "header-brand-scroll-hint",
  KEYBOARD_SHORTCUTS_TITLE: "keyboard-shortcuts-title",
  KEYBOARD_SHORTCUTS_TIP: "keyboard-shortcuts-tip",
  OFFLINE_BANNER_DESC: "offline-banner-desc",
  FEATURE_INPUT: "feature-input",
  FEATURE_INPUT_HINT: "feature-input-hint",
  FEATURE_INPUT_COUNTER: "feature-input-counter",
  ADDED_FEATURES_LABEL: "added-features-label",
  SUGGESTIONS_LABEL: "suggestions-label",
  SELECTED_TECH_LABEL: "selected-tech-label",
  // StepInfo wizard form fields — each `id` is paired with its `<label
  // htmlFor>` and/or `aria-describedby` live-region so the association can
  // never drift apart (Iteration 211).
  /** `projectName` text input; label uses `htmlFor`. */
  STEP_INFO_PROJECT_NAME: "projectName",
  /** Persistent character-count description for projectName; referenced by `aria-describedby`. */
  STEP_INFO_PROJECT_NAME_COUNTER: "projectName-counter",
  /** Character-limit live-region for projectName; referenced by `aria-describedby`. */
  STEP_INFO_PROJECT_NAME_WARNING: "projectName-warning",
  /** Min-length error live-region for projectName; referenced by `aria-describedby`. */
  STEP_INFO_PROJECT_NAME_ERROR: "projectName-error",
  /** `description` textarea; label uses `htmlFor`. */
  STEP_INFO_DESCRIPTION: "description",
  /** Persistent character-count description for description; referenced by `aria-describedby`. */
  STEP_INFO_DESCRIPTION_COUNTER: "description-counter",
  /** Characters-needed hint live-region for description; referenced by `aria-describedby`. */
  STEP_INFO_DESCRIPTION_HINT: "description-hint",
  /** Character-limit live-region for description; referenced by `aria-describedby`. */
  STEP_INFO_DESCRIPTION_WARNING: "description-warning",
  /** Min-length error live-region for description; referenced by `aria-describedby`. */
  STEP_INFO_DESCRIPTION_ERROR: "description-error",
  /** `targetAudience` text input; label uses `htmlFor`. */
  STEP_INFO_TARGET_AUDIENCE: "targetAudience",
  /** Persistent character-count description for targetAudience; referenced by `aria-describedby`. */
  STEP_INFO_TARGET_AUDIENCE_COUNTER: "targetAudience-counter",
  /** `constraints` textarea; label uses `htmlFor`. */
  STEP_INFO_CONSTRAINTS: "constraints",
  /** Persistent character-count description for constraints; referenced by `aria-describedby`. */
  STEP_INFO_CONSTRAINTS_COUNTER: "constraints-counter",
} as const;

/**
 * Dynamic DOM ID Affixes
 * Centralized source of truth for the prefix/suffix fragments composed into
 * template-literal DOM element IDs and their ARIA pairings. Each affix
 * participates in a silent-failure pairing contract: the write side is an
 * `id={...}` template and the read side is a *different* surface —
 * `getElementById()`, `aria-labelledby`, `aria-describedby`, or
 * `aria-controls`. A typo on either side does not throw — the lookup
 * returns `null` and the ARIA reference dangles, so:
 * - `TAB_PREFIX` typo → editor tab focus after mount/keyboard-nav/generation
 *   silently no-ops (focus falls to `<body>`) and the tabpanel's
 *   `aria-labelledby` dangles (WCAG 1.3.1 / 2.4.3 regression).
 * - `CATEGORY_PREFIX` typo → tech-stack group `aria-labelledby` dangles so
 *   the group's accessible name is lost.
 * - `LOCKED_HINT_SUFFIX` typo → locked-step `aria-describedby` dangles so
 *   the "step locked" explanation is never announced.
 * - `PANEL_SUFFIX` typo → tab `aria-controls` dangles and the
 *   `[id$="-panel"]` scroll target in StepGenerating matches nothing, so
 *   post-generation focus/scroll silently no-ops.
 *
 * Flexy says: No bare "tab-"/"category-"/"-locked-hint"/"-panel" affix
 * literals in id templates or ARIA references where a constant family exists!
 * Usage: import { DYNAMIC_ID_AFFIXES } from "../config/constants";
 *        id={`${DYNAMIC_ID_AFFIXES.TAB_PREFIX}${id}`}
 *        document.getElementById(`${DYNAMIC_ID_AFFIXES.TAB_PREFIX}${tabId}`)
 */
export const DYNAMIC_ID_AFFIXES = {
  /** Prefix for editor tab button IDs (`tab-blueprint`, `tab-tasks`) */
  TAB_PREFIX: "tab-" as const,
  /** Prefix for tech-stack category heading/group IDs (`category-frontend`, …) */
  CATEGORY_PREFIX: "category-" as const,
  /** Suffix for locked-step hint live-region IDs (`info-locked-hint`, …) */
  LOCKED_HINT_SUFFIX: "-locked-hint" as const,
  /** Suffix for editor tabpanel IDs (`blueprint-panel`, `tasks-panel`) */
  PANEL_SUFFIX: "-panel" as const,
} as const;

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
  /** Screen reader label announced when background generation is actively running while editor is hidden */
  GENERATING_IN_BACKGROUND: "Generation is currently running in the background",
  /** Screen reader label announced when generated content is ready to view */
  CONTENT_READY: "Generated content is ready to view",
} as const;

// ============================================================================
// Accessibility Events
// ============================================================================

/**
 * Custom window event names for cross-component accessibility coordination.
 * Used to notify useReducedMotion hook consumers when the in-app reduced
 * motion override changes (localStorage "storage" events do not fire in the
 * same tab that made the change).
 */
export const ACCESSIBILITY_EVENTS = {
  REDUCED_MOTION_CHANGE: "blueprintify:reduced-motion-change",
} as const;
