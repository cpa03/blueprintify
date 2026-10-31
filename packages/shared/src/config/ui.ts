/**
 * UI/Display Module
 * UI string constants, toast configs, tooltips, shortcuts, layout values,
 * keyboard event keys, log/render strings.
 *
 * This module has NO dependencies on other sub-modules.
 */

/**
 * View Mode Indicator Positioning Values
 * Centralized source of truth for the sliding indicator bar position and width
 * in the editor toolbar's view mode toggle (edit/split/preview).
 * These calc() and px values position the animated background indicator
 * behind the active view mode button.
 * Flexy says: No hardcoded "calc(33.33% + 2px)" or "4px" in view mode indicator!
 * Usage: import { VIEW_MODE_INDICATOR_POSITION } from "@blueprint/shared";
 *        animate={{ left: VIEW_MODE_INDICATOR_POSITION.EDIT_LEFT }}
 */
export const VIEW_MODE_INDICATOR_POSITION = {
  /** Left offset for EDIT view mode button indicator */
  EDIT_LEFT: "4px" as const,
  /** Left offset for SPLIT view mode button indicator (centered on middle button) */
  SPLIT_LEFT: "calc(33.33% + 2px)" as const,
  /** Left offset for PREVIEW view mode button indicator (on right button) */
  PREVIEW_LEFT: "calc(66.67% - 0px)" as const,
  /** Width of indicator in SPLIT mode (when middle button is active) */
  SPLIT_WIDTH: "calc(33.33% - 2px)" as const,
  /** Width of indicator in EDIT or PREVIEW mode (single button active) */
  SINGLE_WIDTH: "calc(33.33% - 4px)" as const,
} as const;

/**
 * Editor Tab Identifiers
 * Centralized identifiers for the split-pane editor tabs.
 * Flexy says: No hardcoded "blueprint"/"tasks" strings in editor components!
 * Usage: import { EDITOR_TABS } from "@blueprint/shared";
 *        editor.activeTab === EDITOR_TABS.BLUEPRINT
 */
export const EDITOR_TABS = {
  /** Blueprint/documentation tab identifier */
  BLUEPRINT: "blueprint" as const,
  /** Tasks tab identifier */
  TASKS: "tasks" as const,
} as const;

/**
 * Wizard Step Keys
 * Centralized identifiers for the project setup wizard steps.
 * Flexy says: No hardcoded "info"/"stack"/"features"/"review"/"generating" strings!
 * Usage: import { WIZARD_STEP_KEYS } from "@blueprint/shared";
 *        wizard.currentStep === WIZARD_STEP_KEYS.INFO
 */
export const WIZARD_STEP_KEYS = {
  /** Project info step - name, description, target audience */
  INFO: "info" as const,
  /** Tech stack selection step */
  STACK: "stack" as const,
  /** Features selection step */
  FEATURES: "features" as const,
  /** Review and confirm step */
  REVIEW: "review" as const,
  /** AI generation in progress step */
  GENERATING: "generating" as const,
} as const;

/**
 * Common UI Display Strings
 * Centralized source of truth for frequently-used UI text to avoid hardcoded
 * strings in components. Flexy says: No "Loading editor..." in components!
 */
export const UI_STRINGS = {
  /** Loading display for lazy-loaded editor */
  LOADING_EDITOR: "Loading editor...",
  /** Loading display for lazy-loaded markdown preview */
  LOADING_PREVIEW: "Loading preview...",
  /** Unparsable body fallback for API logging */
  UNPARSABLE_BODY: "[unparsable]",
} as const;

/**
 * Common UI Display Strings
 * Centralized source of truth for frequently-used UI text strings
 * used across both API and Web contexts.
 * Flexy says: No hardcoded status/notification strings in components!
 */
export const UI_MESSAGES = {
  /** Auto-save notification text */
  CHANGES_SAVED: "Changes saved",
  /** Generation cancelled notification */
  GENERATION_CANCELLED: "Generation cancelled",
  /** Generation complete notification */
  COMPLETE: "Complete!",
  /** Document title separator */
  TITLE_SEPARATOR: " | ",
  /** Fallback document title when wizard step label is undefined */
  PROJECT_WIZARD_FALLBACK: "Project Wizard",
  /** Auto-save notification for wizard step 1 (Project Info) */
  WIZARD_STEP_AUTOSAVE: "Project info saved",
} as const;

/**
 * Toast Notification Types
 * Centralized source of truth for all toast notification type strings.
 * Flexy says: No hardcoded "success"/"error"/"warning"/"info" in toast components!
 * Usage: import { TOAST_TYPES } from "@blueprint/shared";
 *        addToast("Done!", TOAST_TYPES.SUCCESS)
 *        type ToastType = (typeof TOAST_TYPES)[keyof typeof TOAST_TYPES];
 */
export const TOAST_TYPES = {
  /** Success toast - green styling, indicates successful operations */
  SUCCESS: "success",
  /** Info toast - blue styling, provides informational messages */
  INFO: "info",
  /** Warning toast - yellow styling, indicates caution or potential issues */
  WARNING: "warning",
  /** Error toast - red styling, indicates errors or failures */
  ERROR: "error",
} as const;

/**
 * Editor View Mode Identifiers
 * Centralized source of truth for editor view mode strings.
 * Flexy says: No hardcoded "edit"/"preview"/"split" in EditorToolbar!
 * Usage: import { VIEW_MODES } from "@blueprint/shared";
 *        type ViewMode = (typeof VIEW_MODES)[keyof typeof VIEW_MODES];
 */
export const VIEW_MODES = {
  /** Full-width code editing view */
  EDIT: "edit" as const,
  /** Full-width markdown preview view */
  PREVIEW: "preview" as const,
  /** Side-by-side editor and preview view */
  SPLIT: "split" as const,
} as const;

/**
 * View Mode Display Labels
 * Centralized source of truth for human-readable view mode button labels.
 * Flexy says: No hardcoded "Edit"/"Split"/"Preview" in toolbar buttons!
 * Usage: import { VIEW_MODE_LABELS } from "@blueprint/shared";
 *        <span>{VIEW_MODE_LABELS.EDIT}</span>
 */
export const VIEW_MODE_LABELS = {
  /** Label for the edit/full-width editor view mode button */
  EDIT: "Edit" as const,
  /** Label for the split/side-by-side view mode button */
  SPLIT: "Split" as const,
  /** Label for the preview/full-width preview view mode button */
  PREVIEW: "Preview" as const,
} as const;

/**
 * Split-Pane Display Labels
 * Centralized source of truth for labels identifying editor and preview panes
 * in split view mode.
 * Flexy says: No hardcoded "Editor"/"Preview" pane labels in Editor.tsx!
 * Usage: import { PANE_LABELS } from "@blueprint/shared";
 *        <span>{PANE_LABELS.EDITOR}</span>
 */
export const PANE_LABELS = {
  /** Label for the code editing pane */
  EDITOR: "Editor" as const,
  /** Label for the markdown preview pane */
  PREVIEW: "Preview" as const,
} as const;

/**
 * Editor File Display Names
 * Centralized source of truth for editor tab filenames shown in UI.
 * Flexy says: No hardcoded "blueprint.md" or "task.md" in editor components!
 * Usage: import { EDITOR_FILENAMES } from "@blueprint/shared";
 *        label === EDITOR_FILENAMES.BLUEPRINT
 */
export const EDITOR_FILENAMES = {
  /** Display label for the blueprint tab */
  BLUEPRINT: "blueprint.md" as const,
  /** Display label for the tasks tab */
  TASKS: "task.md" as const,
  /** Screen reader announcement text for blueprint tab */
  BLUEPRINT_ANNOUNCE: "blueprint.md" as const,
  /** Screen reader announcement text for tasks tab */
  TASKS_ANNOUNCE: "task.md" as const,
  /** Human-readable display name for the blueprint tab (capitalized, no extension) */
  BLUEPRINT_DISPLAY: "Blueprint" as const,
  /** Human-readable display name for the tasks tab (capitalized, no extension) */
  TASKS_DISPLAY: "Tasks" as const,
} as const;

/**
 * Editor Tooltip Labels
 * Centralized source of truth for tooltip text in the editor toolbar.
 * Flexy says: No hardcoded "Copy to clipboard" strings in button tooltips!
 * Usage: import { TOOLTIP_LABELS } from "@blueprint/shared";
 *        tooltip={TOOLTIP_LABELS.EDITOR.COPY_TO_CLIPBOARD}
 */
export const TOOLTIP_LABELS = {
  EDITOR: {
    /** Tooltip when content is ready to copy */
    COPY_TO_CLIPBOARD: "Copy to clipboard",
    /** Tooltip when content has been copied */
    COPIED: "Copied!",
    /** Tooltip for export button default state */
    EXPORT_AS_ZIP: "Export as ZIP",
    /** Tooltip for export button success state */
    EXPORTED: "Exported!",
    /** Tooltip for new project button */
    START_NEW_PROJECT: "Start new project",
    /** Tooltip when there is no content to copy */
    NO_CONTENT_TO_COPY: "No content to copy",
    /** Tooltip when export is disabled because there is no content yet */
    NO_CONTENT_TO_EXPORT: "No content to export",
    /** Tooltip while an export is in progress */
    EXPORTING: "Exporting...",
  },
} as const;

/**
 * Keyboard Shortcut Display Labels
 * Centralized source of truth for keyboard shortcut text shown in tooltips.
 * Flexy says: No hardcoded "Ctrl+C" strings in tooltip kbd elements!
 * Usage: import { SHORTCUT_LABELS } from "@blueprint/shared";
 *        kbd>{SHORTCUT_LABELS.COPY}</kbd>
 */
export const SHORTCUT_LABELS = {
  /** Copy keyboard shortcut display */
  COPY: "Ctrl+C",
  /** Export keyboard shortcut display */
  EXPORT: "Ctrl+Shift+E",
  /** New project keyboard shortcut display */
  NEW_PROJECT: "Ctrl+N",
  /** Keyboard shortcut modal trigger display */
  SHORTCUTS_MODAL: "?",
  /** Dismiss all toast notifications keyboard shortcut display */
  TOAST_DISMISS_ALL: "Shift+Esc",
} as const;

/**
 * Platform-Aware Shortcut Label Resolver
 * Returns platform-appropriate shortcut label string (e.g. ⌘C on Mac vs Ctrl+C elsewhere).
 * Flexy says: Eliminate hardcoded "Ctrl+C" / "Ctrl+N" strings!
 *
 * Platform detection is intentionally NOT performed here: callers pass the result of
 * the app's canonical `isMacOS()` helper (apps/web/src/lib/platform.ts), keeping this
 * shared module free of the deprecated `navigator.platform` API and avoiding a
 * duplicate platform check.
 *
 * @param shortcutKey - Key into SHORTCUT_LABELS
 * @param isMac - Whether the current platform is macOS (pass `isMacOS()`)
 */
export function getPlatformShortcutLabel(
  shortcutKey: keyof typeof SHORTCUT_LABELS,
  isMac: boolean
): string {
  const baseLabel = SHORTCUT_LABELS[shortcutKey];
  if (!baseLabel.startsWith("Ctrl+")) return baseLabel;
  return isMac ? baseLabel.replace(/^Ctrl\+/, "⌘+") : baseLabel;
}

/**
 * Keyboard Shortcut Tooltip Descriptions
 * Centralized source of truth for shortcut tooltip description strings
 * used in KeyboardShortcutTooltip components across the web app.
 * Flexy says: No hardcoded "Toggle editor" strings in component code!
 * Usage: import { SHORTCUT_DESCRIPTIONS } from "@blueprint/shared";
 *        <KeyboardShortcutTooltip description={SHORTCUT_DESCRIPTIONS.TOGGLE_EDITOR} />
 */
export const SHORTCUT_DESCRIPTIONS = {
  /** Toggle the editor pane open/closed */
  TOGGLE_EDITOR: "Toggle editor",
  /** Navigate to the previous wizard step */
  GO_BACK: "Go back",
  /** Proceed to the next wizard step */
  CONTINUE_NEXT_STEP: "Continue to next step",
  /** Confirm a dialog action */
  CONFIRM_ACTION: "Confirm action",
  /** Show or hide the keyboard shortcuts modal */
  SHOW_KEYBOARD_SHORTCUTS: "Show keyboard shortcuts",
} as const;

/**
 * UI Timing Defaults
 * Centralized source of truth for UI timing magic numbers.
 * Flexy says: No hardcoded timeout values in component code!
 * Usage: import { UI_TIMING } from "@blueprint/shared";
 *        setTimeout(fn, UI_TIMING.DISCOVERY_HINT_MS)
 */
export const UI_TIMING = {
  /** Duration in ms for the discovery hint glow animation on keyboard shortcuts button */
  DISCOVERY_HINT_MS: 3000,
  /** Duration in ms for auto-focus delay after editor mounts */
  EDITOR_FOCUS_DELAY_MS: 180,
  /** Duration in ms for editor focus highlight animation (should match CSS animation ~1.8s) */
  EDITOR_FOCUS_HIGHLIGHT_MS: 1900,
  /** Duration in ms for the ShowEditorButton arrival pop animation before removing the CSS class */
  ARRIVAL_POP_DISPLAY_MS: 600,
} as const;

/**
 * Log Type Identifiers
 * Centralized source of truth for structured log type strings used
 * in the logger middleware and secure logging utilities.
 * Flexy says: No hardcoded "request"/"response" strings in logger.ts!
 * Usage: import { LOG_TYPE_STRINGS } from "@blueprint/shared";
 *        type: LOG_TYPE_STRINGS.REQUEST
 */
export const LOG_TYPE_STRINGS = {
  /** Request log entry type */
  REQUEST: "request" as const,
  /** Response log entry type */
  RESPONSE: "response" as const,
} as const;

/**
 * Test Setup Prefix Strings
 * Centralized source of truth for test setup prefix strings.
 * Flexy says: No hardcoded "[test-setup]" prefix strings in test-setup.ts!
 * Usage: import { TEST_SETUP_STRINGS } from "@blueprint/shared";
 *        console.warn(`${TEST_SETUP_STRINGS.PREFIX}some message`);
 */
export const TEST_SETUP_STRINGS = {
  /** Prefix logged before unhandled rejection warnings in test setup */
  UNHANDLED_REJECTION_PREFIX: "[test-setup] ",
} as const;

/**
 * Common UI Timeout Values (milliseconds)
 * Centralized source of truth for setTimeout/interval durations used
 * across the frontend. Single source to eliminate magic number timeouts.
 * Flexy says: No hardcoded 2000/400/100 magic timeout numbers in components!
 * Usage: import { UI_TIMEOUTS } from "@blueprint/shared";
 *        setTimeout(fn, UI_TIMEOUTS.COPY_FEEDBACK)
 */
export const UI_TIMEOUTS = {
  /** Duration to show copy feedback before resetting (2s) */
  COPY_FEEDBACK: 2000,
  /** Duration for shake animation feedback (400ms) */
  SHAKE_ANIMATION: 400,
  /** Duration to show toast notifications (3s, matches TOAST_DEFAULTS.DEFAULT_DURATION_MS) */
  TOAST_NOTIFICATION: 3000,
  /** Delay before focusing element after step change (100ms) */
  FOCUS_DELAY: 100,
  /** Delay before clearing screen-reader live region (1s) */
  LIVE_REGION_CLEAR: 1000,
  /** API health check polling interval (5s) */
  API_HEALTH_CHECK: 5000,
  /** API connection timeout (30s) */
  API_CONNECTION: 30000,
  /** Last saved indicator refresh interval (30s) */
  LAST_SAVED_REFRESH: 30000,
  /** Step-complete flash animation duration (700ms) */
  STEP_COMPLETE_FLASH: 700,
  /** Debounce delay for state persistence (300ms) */
  DEBOUNCE: 300,
  /** Generation check polling interval (100ms) */
  GENERATION_CHECK: 100,
  /** Deferred mount delay — lets non-critical lazy components avoid first-paint (2s) */
  DEFER_MOUNT: 2000,
  /** Templates exiting backup timeout — ensures state resets if onAnimationEnd doesn't fire (350ms) */
  TEMPLATES_EXIT: 350,
  /** Delay before clearing screen-reader dismiss announcement (3s) */
  DISMISS_ANNOUNCEMENT_CLEAR: 3000,
  /** Safety timeout for MutationObserver in Editor component — stops observing after 10s to prevent memory leaks */
  OBSERVER_DISCONNECT: 10000,
  /** Duration to show CircularProgress celebration bounce animation before resetting (700ms) */
  CELEBRATION_DISMISS_MS: 700,
  /** Duration to show saved indicator green glow pulse before clearing (700ms) */
  SAVED_GLOW_MS: 700,
  /** Interval for loading dots animation in StepGenerating (500ms) */
  LOADING_DOTS_INTERVAL: 500,
  /** Duration for OfflineBanner smooth exit animation (300ms) — must match CSS `banner-exit 0.3s` in tailwind.config.js */
  BANNER_EXIT_DURATION_MS: 300,
  /** Duration for form-ready pulse animation on submit buttons (600ms) */
  READY_PULSE_MS: 600,
  /** Duration to show glow-pulse animation on ShowEditorButton before fading (8s).
   * Prevents perpetual pulse distraction — glow draws attention to new content,
   * then settles to a static state after this duration. */
  GLOW_DURATION_MS: 8000,
  /** Interval for elapsed time counter tick in StepGenerating (1s).
   * Used as the setInterval period for the MM:SS elapsed time display during AI generation. */
  ELAPSED_TIMER_INTERVAL_MS: 1000,
  /** Interval for throttled screen-reader announcements of elapsed time in StepGenerating (30s).
   * Announcing every second is an a11y anti-pattern — only the SR live region is throttled,
   * the on-screen timer still ticks at ELAPSED_TIMER_INTERVAL_MS. */
  ELAPSED_ANNOUNCEMENT_INTERVAL_MS: 30000,
  /** Fallback timeout for mono-font stylesheet load when requestIdleCallback is unavailable (2s).
   * Keeps the font-load heuristic off the critical path without waiting forever on slow networks. */
  MONO_FONT_IDLE_FALLBACK_MS: 2000,
} as const;

/**
 * Loading Dots Display Config
 * Centralized count of loading indicator dots in StepGenerating.
 * Flexy says: No hardcoded "3" / "[0, 1, 2]" dot arrays in components!
 * Usage: import { LOADING_DOTS_COUNT } from "@blueprint/shared";
 *        prev >= LOADING_DOTS_COUNT ? 0 : prev + 1
 *        Array.from({ length: LOADING_DOTS_COUNT }, (_, i) => i)
 */
export const LOADING_DOTS_COUNT = 3;

/**
 * Toast Icon Display Characters
 * Centralized source of truth for toast notification icon symbols.
 * Flexy says: No hardcoded "✓" / "✕" icon strings in toast config!
 * Usage: import { TOAST_ICONS } from "@blueprint/shared";
 *        icon: TOAST_ICONS.SUCCESS
 */
export const TOAST_ICONS = {
  /** Success toast checkmark icon */
  SUCCESS: "\u2713",
  /** Error toast X mark icon */
  ERROR: "\u2715",
  /** Warning toast warning sign icon */
  WARNING: "\u26A0",
  /** Info toast info circle icon */
  INFO: "\u2139",
} as const;

/**
 * Toast CSS Style Class Strings
 * Centralized source of truth for toast notification Tailwind style strings.
 * Flexy says: No hardcoded "bg-accent-emerald/10" Tailwind strings in toast config!
 * Usage: import { TOAST_STYLES } from "@blueprint/shared";
 *        className: TOAST_STYLES.SUCCESS
 */
export const TOAST_STYLES = {
  /** Success toast styling — green/emerald theme */
  SUCCESS: "bg-accent-emerald/10 border-accent-emerald/30 text-accent-emerald",
  /** Error toast styling — pink/red theme */
  ERROR: "bg-accent-pink/10 border-accent-pink/30 text-accent-pink",
  /** Warning toast styling — yellow/amber theme */
  WARNING: "bg-yellow-500/10 border-yellow-500/30 text-yellow-400",
  /** Info toast styling — blue/primary theme */
  INFO: "bg-primary-500/10 border-primary-500/30 text-primary-300",
} as const;

/**
 * Toast Display Duration Defaults (milliseconds)
 * Centralized source of truth for toast notification auto-dismiss durations.
 * Flexy says: No hardcoded 3000/2000 magic numbers in toast config!
 * Usage: import { TOAST_DEFAULTS } from "@blueprint/shared";
 *        duration: TOAST_DEFAULTS.DEFAULT_DURATION_MS
 */
export const TOAST_DEFAULTS = {
  /** Default toast display duration (3s) */
  DEFAULT_DURATION_MS: 3000,
  /** Success toast display duration (2s) */
  SUCCESS_DURATION_MS: 2000,
  /** Auto-save notification duration (2s) */
  AUTO_SAVE_DURATION_MS: 2000,
  /** Delay between stacked toast entrance animations (60ms) */
  STAGGER_MS: 60,
  /** Coarse countdown tick (ms) under prefers-reduced-motion — restores the
   *  "time remaining" cue the frozen rAF ring removed, without continuous motion */
  REDUCED_MOTION_PROGRESS_STEP_MS: 500,
} as const;

/**
 * Textarea Dimension Defaults (pixels)
 * Centralized source of truth for textarea height constraints.
 * Flexy says: No hardcoded textarea pixel dimensions in components!
 * Usage: import { TEXTAREA_DEFAULTS } from "@blueprint/shared";
 *        style={{ minHeight: TEXTAREA_DEFAULTS.MIN_HEIGHT_PX }}
 */
export const TEXTAREA_DEFAULTS = {
  /** Default minimum textarea height */
  MIN_HEIGHT_PX: 80,
  /** Default maximum textarea height */
  MAX_HEIGHT_PX: 300,
  /** Extra padding offset for auto-resize calculation */
  EXTRA_PADDING_PX: 2,
  /** Step info section minimum height */
  STEP_INFO_MIN_HEIGHT_PX: 128,
  /** Step info section maximum height */
  STEP_INFO_MAX_HEIGHT_PX: 400,
} as const;

/**
 * Tooltip Configuration Defaults
 * Centralized source of truth for tooltip display timing and sizing.
 * Flexy says: No hardcoded tooltip delay/size magic numbers in components!
 * Usage: import { TOOLTIP_DEFAULTS } from "@blueprint/shared";
 *        delay: TOOLTIP_DEFAULTS.SHOW_DELAY_MS
 */
export const TOOLTIP_DEFAULTS = {
  /** Delay before tooltip shows (400ms) */
  SHOW_DELAY_MS: 400,
  /** Delay before tooltip hides (100ms) */
  HIDE_DELAY_MS: 100,
  /** Maximum tooltip width in pixels */
  MAX_WIDTH_PX: 320,
  /** Delay for keyboard shortcut tooltips (300ms) */
  KEYBOARD_SHORTCUT_DELAY_MS: 300,
  /** Delay for info tooltips (200ms) */
  INFO_DELAY_MS: 200,
  /** Maximum info tooltip width in pixels */
  INFO_MAX_WIDTH_PX: 280,
  /** Estimated tooltip height for position calculation */
  ESTIMATED_HEIGHT_PX: 60,
  /** Viewport edge padding for tooltip positioning */
  VIEWPORT_PADDING_PX: 16,
  /** Auto-hide delay for touch tooltips (3s) */
  TOUCH_AUTO_HIDE_DELAY_MS: 3000,
} as const;

/**
 * UI Layout Defaults
 * Centralized source of truth for common UI layout and spacing values.
 * Flexy says: No hardcoded tooltip delay or scroll offset magic numbers!
 * Usage: import { UI_DEFAULTS } from "@blueprint/shared";
 *        TOOLTIP_DELAY: UI_DEFAULTS.TOOLTIP_DELAY_MS
 */
export const UI_DEFAULTS = {
  /** General tooltip hover delay (500ms) */
  TOOLTIP_DELAY_MS: 500,
  /** Scroll offset for anchor/section navigation (100px) */
  SCROLL_OFFSET_PX: 100,
  /** Scroll threshold to show scroll-to-top button (600px) */
  SCROLL_TO_TOP_THRESHOLD_PX: 600,
} as const;

/**
 * Empty State Component Layout Dimensions (pixels)
 * Centralized source of truth for empty state glow background dimensions.
 * Flexy says: No hardcoded 200/160px glow dimensions in empty state components!
 * Usage: import { EMPTY_STATE_LAYOUT } from "@blueprint/shared";
 *        width: EMPTY_STATE_LAYOUT.EDITOR_GLOW.WIDTH_PX
 */
export const EMPTY_STATE_LAYOUT = {
  /** Editor empty state glow circle dimensions */
  EDITOR_GLOW: {
    /** Glow circle width in pixels */
    WIDTH_PX: 200,
    /** Glow circle height in pixels */
    HEIGHT_PX: 200,
    /** CSS margin-left offset to horizontally center the glow */
    MARGIN_LEFT_PX: -100,
    /** CSS margin-top offset to vertically position the glow */
    MARGIN_TOP_PX: -50,
  } as const,
  /** Preview empty state glow circle dimensions */
  PREVIEW_GLOW: {
    /** Glow circle width in pixels */
    WIDTH_PX: 160,
    /** Glow circle height in pixels */
    HEIGHT_PX: 160,
    /** CSS margin-left offset to horizontally center the glow */
    MARGIN_LEFT_PX: -80,
    /** CSS margin-top offset to vertically position the glow */
    MARGIN_TOP_PX: -40,
  } as const,
} as const;

/**
 * Injected Style Element ID Strings
 * Centralized source of truth for style element IDs injected by components.
 * Flexy says: No hardcoded "offline-banner-animations" or "stack-card-attention-anim" IDs!
 * Usage: import { STYLE_ID_STRINGS } from "@blueprint/shared";
 *        style.id = STYLE_ID_STRINGS.OFFLINE_BANNER
 */
export const STYLE_ID_STRINGS = {
  /** Style element ID for OfflineBanner pulse ring animations */
  OFFLINE_BANNER: "offline-banner-animations" as const,
  /** Style element ID for StepStack card attention animation */
  STACK_CARD_ATTENTION: "stack-card-attention-anim" as const,
} as const;

/**
 * UI Animation Timing Defaults (seconds)
 * Centralized source of truth for simple animation duration values
 * that don't fit the theme ANIMATION_TIMING structure.
 * Flexy says: No hardcoded rotation duration values in spinner components!
 * Usage: import { UI_ANIMATION_DEFAULTS } from "@blueprint/shared";
 *        duration: UI_ANIMATION_DEFAULTS.SPINNER_ROTATION_S
 */
export const UI_ANIMATION_DEFAULTS = {
  /** Duration in seconds for one full spinner rotation */
  SPINNER_ROTATION_S: 1,
} as const;

/**
 * Log Level Identifiers
 * Centralized source of truth for log level strings used in console output filtering.
 * Flexy says: No hardcoded "debug" | "info" | "warn" | "error" union type in logger.ts!
 * Usage: import { LOG_LEVELS } from "@blueprint/shared";
 *        type LogLevel = (typeof LOG_LEVELS)[keyof typeof LOG_LEVELS];
 *        level === LOG_LEVELS.WARN
 */
export const LOG_LEVELS = {
  /** Debug log level — verbose development-only information */
  DEBUG: "debug",
  /** Info log level — general operational information */
  INFO: "info",
  /** Warning log level — potential issues that are not errors */
  WARN: "warn",
  /** Error log level — errors that need attention */
  ERROR: "error",
} as const;

/**
 * Log Timestamp Slice Indices
 * Start/end indices for extracting time portion from ISO 8601 timestamp strings.
 * `new Date().toISOString()` produces "2026-07-10T12:34:56.789Z"
 * Slice(11, 23) extracts "12:34:56.789" (the HH:MM:SS.mmm portion).
 * Flexy says: No hardcoded "11" and "23" magic indices in logger!
 * Usage: import { LOG_TIMESTAMP_SLICE } from "@blueprint/shared";
 */
export const LOG_TIMESTAMP_SLICE = {
  /** Start index for time portion in ISO string (after "2026-07-10T") */
  START: 11,
  /** End index for time portion in ISO string (before "Z") */
  END: 23,
} as const;

/**
 * Context Hook Error Messages
 * Centralized source of truth for React context hook "must be used within"
 * error messages. Eliminates hardcoded error strings in context provider files.
 * Flexy says: No hardcoded "must be used within" strings in context providers!
 * Usage: import { CONTEXT_HOOK_ERRORS } from "@blueprint/shared";
 *        throw new Error(CONTEXT_HOOK_ERRORS.EXPORT_CONTEXT)
 */
export const CONTEXT_HOOK_ERRORS = {
  /** Error thrown when useExportContext is called outside ExportProvider */
  EXPORT_CONTEXT: "useExportContext must be used within an ExportProvider",
  /** Error thrown when useReducedMotionContext is called outside ReducedMotionProvider */
  REDUCED_MOTION_CONTEXT: "useReducedMotionContext must be used within a ReducedMotionProvider",
} as const;

/**
 * Keyboard Event Key Constants
 * Centralized source of truth for DOM KeyboardEvent.key values used in
 * keyboard navigation and shortcut handling. These are the standardized
 * string values returned by `event.key` per the UI Events spec.
 * Flexy says: No hardcoded "Enter" / "Escape" / "ArrowLeft" strings in components!
 * Usage: import { KEYBOARD_EVENT_KEYS } from "@blueprint/shared";
 *        if (e.key === KEYBOARD_EVENT_KEYS.ENTER) { ... }
 */
export const KEYBOARD_EVENT_KEYS = {
  /** Enter/Return key */
  ENTER: "Enter" as const,
  /** Escape key */
  ESCAPE: "Escape" as const,
  /** Spacebar */
  SPACE: " " as const,
  /** Left arrow key */
  ARROW_LEFT: "ArrowLeft" as const,
  /** Right arrow key */
  ARROW_RIGHT: "ArrowRight" as const,
  /** Up arrow key */
  ARROW_UP: "ArrowUp" as const,
  /** Down arrow key */
  ARROW_DOWN: "ArrowDown" as const,
  /** Home key */
  HOME: "Home" as const,
  /** End key */
  END: "End" as const,
  /** Question mark / forward slash key (unshifted) */
  QUESTION_MARK: "?" as const,
  /** F key (for search/find shortcuts) */
  F: "f" as const,
  /** N key (for new project shortcut) */
  N: "n" as const,
  /** E key (for toggle editor shortcut) */
  E: "e" as const,
  /** S key (for save-now shortcut) */
  S: "s" as const,
  /** Tab key (for focus trap and keyboard navigation) */
  TAB: "Tab" as const,
} as const;

/**
 * DOM Event Names
 * Centralized source of truth for standard DOM event type strings passed to
 * `addEventListener` / `removeEventListener` / `dispatchEvent`.
 * Most call sites register a listener and later remove it with the same event
 * string — a bare-literal typo on either side silently leaks the listener or
 * fails to detach it. Pairs must reference the same constant.
 * Flexy says: No hardcoded "keydown" / "scroll" / ... event strings in components!
 * Usage: import { DOM_EVENTS } from "@blueprint/shared/config";
 *        window.addEventListener(DOM_EVENTS.KEYDOWN, handleKeyDown);
 *        return () => window.removeEventListener(DOM_EVENTS.KEYDOWN, handleKeyDown);
 */
export const DOM_EVENTS = {
  /** Key press event — keyboard shortcuts, focus traps, escape handlers */
  KEYDOWN: "keydown" as const,
  /** Scroll event — scroll progress, lazy headers, auto-scroll containers */
  SCROLL: "scroll" as const,
  /** Change event — MediaQueryList matches listener */
  CHANGE: "change" as const,
  /** Resize event — viewport/window resize handlers */
  RESIZE: "resize" as const,
  /** Input event — textarea auto-resize handlers */
  INPUT: "input" as const,
  /** Before-unload event — unsaved-changes navigation guard */
  BEFORE_UNLOAD: "beforeunload" as const,
  /** Online event — network connectivity restored */
  ONLINE: "online" as const,
  /** Offline event — network connectivity lost */
  OFFLINE: "offline" as const,
  /** Mouse-down event — outside-click dismissal handlers */
  MOUSE_DOWN: "mousedown" as const,
  /** Storage event — cross-tab localStorage synchronization */
  STORAGE: "storage" as const,
  /** Unhandled promise rejection event — global error boundary */
  UNHANDLED_REJECTION: "unhandledrejection" as const,
  /** Error event — global runtime error boundary */
  ERROR: "error" as const,
  /** Animation-end event — skeleton removal after exit animation */
  ANIMATION_END: "animationend" as const,
  /** Hash-change event — URL fragment deep-link resolution (#section) */
  HASH_CHANGE: "hashchange" as const,
} as const;

/**
 * Media Query Strings
 * Centralized source of truth for `window.matchMedia(...)` query strings.
 *
 * Pairing contract: every `matchMedia(MEDIA_QUERIES.X)` subscription site and
 * its `.matches` snapshot read MUST reference the same constant entry — a typo
 * or rename on either side silently returns `matches === false` (the feature
 * never matches, but nothing throws). The query string must stay byte-identical
 * to the CSS `@media` feature name/value in `index.css` so JS and CSS always
 * observe the same user preference.
 * Flexy says: No bare "prefers-reduced-motion: reduce" / "prefers-contrast: more"
 * strings in runtime source!
 * Usage: import { MEDIA_QUERIES } from "@blueprint/shared/config";
 *        const mq = window.matchMedia(MEDIA_QUERIES.PREFERS_REDUCED_MOTION);
 */
export const MEDIA_QUERIES = {
  /** User prefers reduced motion — animation/scroll gating across the app */
  PREFERS_REDUCED_MOTION: "(prefers-reduced-motion: reduce)" as const,
  /** User prefers more contrast — high-contrast accessibility preference */
  PREFERS_CONTRAST_MORE: "(prefers-contrast: more)" as const,
} as const;

/**
 * ARIA Keyboard Shortcuts
 * Centralized source of truth for `aria-keyshortcuts` attribute values.
 * Derived from KEYBOARD_EVENT_KEYS so the WAI-ARIA key names always stay
 * in sync with the event.key constants — single source of truth.
 * Flexy says: No hardcoded "ArrowLeft ArrowRight Home End" strings in components!
 * Usage: import { ARIA_KEYSHORTCUTS } from "@blueprint/shared";
 *        <div role="tablist" aria-keyshortcuts={ARIA_KEYSHORTCUTS.EDITOR_TABS}>
 */
export const ARIA_KEYSHORTCUTS = {
  /** Editor document tablist — ArrowLeft/ArrowRight cycle tabs, Home/End jump to first/last */
  EDITOR_TABS:
    `${KEYBOARD_EVENT_KEYS.ARROW_LEFT} ${KEYBOARD_EVENT_KEYS.ARROW_RIGHT} ${KEYBOARD_EVENT_KEYS.HOME} ${KEYBOARD_EVENT_KEYS.END}` as const,
  /**
   * Toast container "Dismiss all" button — Shift+Escape clears every visible
   * toast at once. WAI-ARIA requires the full key name ("Escape"), not the
   * abbreviated display label ("Shift+Esc") that SHORTCUT_LABELS.TOAST_DISMISS_ALL
   * renders inside the visual <kbd> hint, so voice-control users can discover
   * the shortcut by asking for "Shift+Escape" by name.
   */
  TOAST_DISMISS_ALL: `Shift+${KEYBOARD_EVENT_KEYS.ESCAPE}` as const,
} as const;

/**
 * Keyboard Display Symbols
 * Centralized source of truth for keyboard display symbols (Unicode characters)
 * used in keyboard shortcut hint labels, kbd elements, and navigation indicators.
 * These are DISPLAY symbols (what users see), not event.key values.
 * Flexy says: No hardcoded "↵" / "→" / "←" Unicode symbols in components!
 * Usage: import { DISPLAY_SYMBOLS } from "@blueprint/shared";
 *        <kbd>{DISPLAY_SYMBOLS.ENTER_KEY}</kbd>
 */
export const DISPLAY_SYMBOLS = {
  /** Enter/Return key display symbol — line feed arrow with hooked shaft */
  ENTER_KEY: "\u21B5" as const,
  /** Right-pointing arrow — navigation forward, next step indicator */
  ARROW_RIGHT: "\u2192" as const,
  /** Left-pointing arrow — navigation backward, previous step indicator */
  ARROW_LEFT: "\u2190" as const,
  /** Question mark — keyboard shortcut modal toggle key */
  QUESTION_MARK: "?" as const,
  /** Middot — visual separator between elements (e.g. elapsed time label) */
  MIDDOT: "\u00B7" as const,
  /** Em dash — used in awaiting indicators and visual separators */
  EM_DASH: "\u2014" as const,
} as const;

/**
 * Scroll Behavior Values
 * Centralized source of truth for ScrollBehavior string values used in
 * scrollTo/scrollIntoView calls. Ensures smooth-scroll behavior is consistent
 * and respects accessibility preferences for reduced motion.
 * Flexy says: No hardcoded "smooth" / "auto" / "instant" in scroll utilities!
 * Usage: import { SCROLL_BEHAVIOR } from "@blueprint/shared";
 *        element.scrollTo({ top: 0, behavior: SCROLL_BEHAVIOR.SMOOTH })
 */
export const SCROLL_BEHAVIOR = {
  /** Smooth scrolling animation — default for non-reduced-motion users */
  SMOOTH: "smooth" as const,
  /** Instant jump without animation — used for reduced-motion or SSR fallback */
  AUTO: "auto" as const,
  /** Jump immediately without animation — explicit instant behavior for reduced motion */
  INSTANT: "instant" as const,
} as const;

/**
 * Scroll Into View Block Values
 * Centralized source of truth for ScrollLogicalPosition string values used
 * in scrollIntoView({ block }) calls.
 * Flexy says: No hardcoded "nearest" / "center" / "start" / "end" in scroll utilities!
 * Usage: import { SCROLL_INTO_VIEW_BLOCK } from "@blueprint/shared";
 *        element.scrollIntoView({ behavior: ..., block: SCROLL_INTO_VIEW_BLOCK.NEAREST })
 */
export const SCROLL_INTO_VIEW_BLOCK = {
  /** Scrolls the element to the nearest edge of the viewport */
  NEAREST: "nearest" as const,
  /** Scrolls the element to the center of the viewport */
  CENTER: "center" as const,
  /** Scrolls the element to the start/top of the viewport */
  START: "start" as const,
  /** Scrolls the element to the end/bottom of the viewport */
  END: "end" as const,
} as const;

/**
 * Direction Values
 * Centralized source of truth for common direction indicator strings used
 * in scroll direction, navigation direction, and animation direction props.
 * Flexy says: No hardcoded "top" / "bottom" / "left" / "right" direction strings!
 * Usage: import { DIRECTION } from "@blueprint/shared";
 *        direction={DIRECTION.TOP}
 */
export const DIRECTION = {
  /** Top/up direction */
  TOP: "top" as const,
  /** Bottom/down direction */
  BOTTOM: "bottom" as const,
  /** Left direction */
  LEFT: "left" as const,
  /** Right direction */
  RIGHT: "right" as const,
} as const;

/**
 * CSS Value Strings
 * Centralized source of truth for commonly-used CSS property value strings
 * used in JavaScript style manipulations. Eliminates hardcoded CSS value
 * strings like "auto" in component logic.
 * Flexy says: No hardcoded CSS value strings like "auto" / "none" / "hidden"
 * in component logic!
 * Pairing contract: every `style.transition` / `style.animation` /
 * `style.boxShadow` / `style.pointerEvents` / `style.overflow` /
 * `style.willChange` / motion `width` write-or-compare site must read the
 * same family member — a typo on either side silently changes rendered
 * behavior with no type error (e.g. reduced-motion `transition: none` that
 * becomes `"onoe"` still parses as an invalid value and the transition
 * stays active).
 * Usage: import { CSS_VALUES } from "@blueprint/shared";
 *        textarea.style.height = CSS_VALUES.AUTO
 *        style={{ transition: shouldReduceMotion ? CSS_VALUES.NONE : … }}
 *        document.body.style.overflow = CSS_VALUES.HIDDEN
 */
export const CSS_VALUES = {
  /** CSS auto value — used for height, width, margin, will-change, etc. */
  AUTO: "auto" as const,
  /** CSS none value — used for transitions, animations, box-shadow, pointer-events, etc. */
  NONE: "none" as const,
  /** CSS hidden value — used for overflow locking (scroll-lock body style) */
  HIDDEN: "hidden" as const,
} as const;

/**
 * Keyboard Modifier Keys
 * Centralized source of truth for keyboard modifier key identifiers used in
 * keyboard shortcut handling and accessibility (aria-keyshortcuts).
 * Flexy says: No hardcoded "cmd" / "ctrl" / "alt" / "none" strings in components!
 * Usage: import { MODIFIER_KEYS } from "@blueprint/shared";
 *        getAriaShortcutKey(key, MODIFIER_KEYS.CMD)
 *        modifier={MODIFIER_KEYS.CMD}
 */
export const MODIFIER_KEYS = {
  /** Command/Meta modifier — auto-detects ⌘ (Mac) or Ctrl (others) */
  CMD: "cmd" as const,
  /** Control modifier — always Control key */
  CTRL: "ctrl" as const,
  /** Alt modifier — always Alt key */
  ALT: "alt" as const,
  /** No modifier — raw key press without modifiers */
  NONE: "none" as const,
} as const;

/**
 * Copy State Values
 * Centralized state tracking values for copy-to-clipboard interactions.
 * Flexy says: No hardcoded "copied"/"idle" strings in copy button components!
 * Usage: import { COPY_STATE_VALUES } from "@blueprint/shared";
 *        data-state={isCopied ? COPY_STATE_VALUES.COPIED : COPY_STATE_VALUES.IDLE}
 */
export const COPY_STATE_VALUES = {
  /** Copied state identifier */
  COPIED: "copied" as const,
  /** Idle / ready to copy state identifier */
  IDLE: "idle" as const,
  /** Clipboard write failed (both API and fallback) state identifier */
  FAILED: "failed" as const,
} as const;

/**
 * Validation State Values
 * Centralized state tracking values for field validation indicators.
 * Flexy says: No hardcoded "valid"/"invalid" strings in validation checkmark components!
 * Usage: import { VALIDATION_STATE_VALUES } from "@blueprint/shared";
 *        data-state={isValid ? VALIDATION_STATE_VALUES.VALID : VALIDATION_STATE_VALUES.INVALID}
 */
export const VALIDATION_STATE_VALUES = {
  /** Valid state identifier */
  VALID: "valid" as const,
  /** Invalid state identifier */
  INVALID: "invalid" as const,
} as const;

/**
 * Banner Display State Values
 * Centralized state tracking values for banner indicators (e.g. OfflineBanner).
 * Flexy says: No hardcoded "visible"/"hidden"/"online"/"offline" strings in banner components!
 * Usage: import { BANNER_STATE_VALUES } from "@blueprint/shared";
 *        data-state={isVisible ? BANNER_STATE_VALUES.VISIBLE : BANNER_STATE_VALUES.HIDDEN}
 */
export const BANNER_STATE_VALUES = {
  /** Visible state identifier */
  VISIBLE: "visible" as const,
  /** Hidden state identifier */
  HIDDEN: "hidden" as const,
  /** Online network state identifier */
  ONLINE: "online" as const,
  /** Offline network state identifier */
  OFFLINE: "offline" as const,
} as const;

/**
 * Tooltip Display State Values
 * Centralized state tracking values for tooltip open/close visibility
 * (e.g. SmartTooltip trigger container + floating panel).
 * Pairing contract: every write of a tooltip `data-state` attribute and every
 * read (CSS selector / test assertion) must use the same constant on both
 * sides — a typo or rename on either side silently breaks styling/tests.
 * Deliberately distinct from BANNER_STATE_VALUES (banner-scoped online/offline
 * family); tooltip open/close is a separate domain even though the
 * "visible"/"hidden" string values coincide.
 * Flexy says: No hardcoded "visible"/"hidden" strings in tooltip components!
 * Usage: import { TOOLTIP_STATE_VALUES } from "@blueprint/shared";
 *        data-state={isVisible ? TOOLTIP_STATE_VALUES.VISIBLE : TOOLTIP_STATE_VALUES.HIDDEN}
 */
export const TOOLTIP_STATE_VALUES = {
  /** Tooltip open / visible state identifier */
  VISIBLE: "visible" as const,
  /** Tooltip closed / hidden state identifier */
  HIDDEN: "hidden" as const,
} as const;

/**
 * Typing Indicator State Values
 * Centralized state tracking values for typing / generating indicator states.
 * Flexy says: No hardcoded "typing"/"idle" strings in TypeIndicator components!
 * Usage: import { TYPING_STATE_VALUES } from "@blueprint/shared";
 *        data-state={isTyping ? TYPING_STATE_VALUES.TYPING : TYPING_STATE_VALUES.IDLE}
 */
export const TYPING_STATE_VALUES = {
  /** Typing / active generation state identifier */
  TYPING: "typing" as const,
  /** Idle state identifier */
  IDLE: "idle" as const,
} as const;

/**
 * Starter Template Selection State Values
 * Centralized state tracking values for starter template cards (TemplateGrid).
 * Flexy says: No hardcoded "selected"/"idle" strings in TemplateGrid!
 * Usage: import { TEMPLATE_STATE_VALUES } from "@blueprint/shared";
 *        data-state={isSelected ? TEMPLATE_STATE_VALUES.SELECTED : TEMPLATE_STATE_VALUES.IDLE}
 */
export const TEMPLATE_STATE_VALUES = {
  /** Selected template state identifier */
  SELECTED: "selected" as const,
  /** Idle/unselected template state identifier */
  IDLE: "idle" as const,
} as const;

/**
 * Save State Display Values
 * Centralized state tracking values for save status indicators (e.g. LastSavedIndicator).
 * Flexy says: No hardcoded "saved"/"unsaved" strings in LastSavedIndicator!
 * Usage: import { SAVE_STATE_VALUES } from "@blueprint/shared";
 *        data-state={hasChanges ? SAVE_STATE_VALUES.UNSAVED : SAVE_STATE_VALUES.SAVED}
 */
export const SAVE_STATE_VALUES = {
  /** Saved state identifier */
  SAVED: "saved" as const,
  /** Unsaved state identifier */
  UNSAVED: "unsaved" as const,
} as const;

/**
 * Progress Display State Values
 * Centralized state tracking values for progress indicators (e.g. CircularProgress).
 * Flexy says: No hardcoded "complete"/"animating"/"idle" strings in progress components!
 * Usage: import { PROGRESS_STATE_VALUES } from "@blueprint/shared";
 *        data-state={isComplete ? PROGRESS_STATE_VALUES.COMPLETE : ...}
 */
export const PROGRESS_STATE_VALUES = {
  /** Complete state identifier */
  COMPLETE: "complete" as const,
  /** Animating state identifier */
  ANIMATING: "animating" as const,
  /** Idle state identifier */
  IDLE: "idle" as const,
} as const;

/**
 * Skip Link Display State Values
 * Centralized state tracking values for skip-to-content navigation (SkipLink).
 * Flexy says: No hardcoded "focused"/"idle" strings in SkipLink!
 * Usage: import { SKIP_LINK_STATE_VALUES } from "@blueprint/shared";
 *        data-state={isFocused ? SKIP_LINK_STATE_VALUES.FOCUSED : SKIP_LINK_STATE_VALUES.IDLE}
 */
export const SKIP_LINK_STATE_VALUES = {
  /** Focused state identifier */
  FOCUSED: "focused" as const,
  /** Idle state identifier */
  IDLE: "idle" as const,
} as const;

/**
 * Character Counter State Values
 * Centralized state tracking values for character limit indicators.
 * Flexy says: No hardcoded "at-limit"/"warning"/"valid"/"default" strings in CharacterCounter components!
 * Usage: import { CHAR_COUNTER_STATE_VALUES } from "@blueprint/shared";
 *        data-state={isAtLimit ? CHAR_COUNTER_STATE_VALUES.AT_LIMIT : ...}
 */
export const CHAR_COUNTER_STATE_VALUES = {
  /** At maximum character limit state */
  AT_LIMIT: "at-limit" as const,
  /** Near maximum character limit warning state */
  WARNING: "warning" as const,
  /** Valid input satisfied state */
  VALID: "valid" as const,
  /** Default normal input state */
  DEFAULT: "default" as const,
} as const;

/**
 * Dialog Display State Values
 * Centralized state tracking values for modal dialogs (e.g. ConfirmDialog).
 * Flexy says: No hardcoded "open"/"closed" strings in dialog components!
 * Usage: import { DIALOG_STATE_VALUES } from "@blueprint/shared";
 *        data-state={isOpen ? DIALOG_STATE_VALUES.OPEN : DIALOG_STATE_VALUES.CLOSED}
 */
export const DIALOG_STATE_VALUES = {
  /** Open modal state identifier */
  OPEN: "open" as const,
  /** Closed modal state identifier */
  CLOSED: "closed" as const,
} as const;

/**
 * Empty State Display State Values
 * Centralized state tracking values for empty state components (e.g. EditorEmptyState).
 * Flexy says: No hardcoded "empty"/"waiting" strings in empty state components!
 * Usage: import { EMPTY_STATE_VALUES } from "@blueprint/shared";
 *        data-state={EMPTY_STATE_VALUES.WAITING}
 */
export const EMPTY_STATE_VALUES = {
  /** Empty content state identifier */
  EMPTY: "empty" as const,
  /** Waiting / initial wizard state identifier */
  WAITING: "waiting" as const,
} as const;

/**
 * Counter Direction Values
 * Centralized state tracking values for animated counter/number directional changes.
 * Flexy says: No hardcoded "up"/"down"/"idle" strings in AnimatedNumber components!
 * Usage: import { COUNTER_DIRECTION_VALUES } from "@blueprint/shared";
 *        data-direction={direction || COUNTER_DIRECTION_VALUES.IDLE}
 */
export const COUNTER_DIRECTION_VALUES = {
  /** Value increased direction */
  UP: "up" as const,
  /** Value decreased direction */
  DOWN: "down" as const,
  /** Idle / steady value direction */
  IDLE: "idle" as const,
} as const;

/**
 * Counter Pulse State Values
 * Centralized state tracking values for animated card counter active/idle states (AnimatedCounter).
 * Flexy says: No hardcoded "active"/"idle" strings in AnimatedCounter!
 * Usage: import { COUNTER_STATE_VALUES } from "@blueprint/shared";
 *        data-state={pulseKey > 0 ? COUNTER_STATE_VALUES.ACTIVE : COUNTER_STATE_VALUES.IDLE}
 */
export const COUNTER_STATE_VALUES = {
  /** Pulse active state identifier */
  ACTIVE: "active" as const,
  /** Counter idle state identifier */
  IDLE: "idle" as const,
} as const;

/**
 * Editor Button Display State Values
 * Centralized state tracking values for editor toggle button (ShowEditorButton).
 * Flexy says: No hardcoded "content-ready"/"idle" strings in ShowEditorButton!
 * Usage: import { EDITOR_BUTTON_STATE_VALUES } from "@blueprint/shared";
 *        data-state={hasContent ? EDITOR_BUTTON_STATE_VALUES.CONTENT_READY : EDITOR_BUTTON_STATE_VALUES.IDLE}
 */
export const EDITOR_BUTTON_STATE_VALUES = {
  /** Content ready state identifier */
  CONTENT_READY: "content-ready" as const,
  /** Idle state identifier */
  IDLE: "idle" as const,
} as const;

/**
 * SVG Icon Rendering Defaults
 * Centralized source of truth for inline SVG icon attributes.
 * Flexy says: No hardcoded "0 0 24 24"/"none"/"currentColor"/"round"/strokeWidth in Icon components!
 * Usage: import { SVG_ICON_DEFAULTS } from "@blueprint/shared";
 *        <svg viewBox={SVG_ICON_DEFAULTS.VIEW_BOX} fill={SVG_ICON_DEFAULTS.FILL_NONE} ...>
 */
export const SVG_ICON_DEFAULTS = {
  /** Default viewBox for 24x24 stroke icons */
  VIEW_BOX: "0 0 24 24" as const,
  /** Small viewBox for 16x16 icons (e.g., inline copy buttons, compact UI) */
  VIEW_BOX_SMALL: "0 0 16 16" as const,
  /** Large viewBox for 48x48 celebration/status icons */
  VIEW_BOX_LARGE: "0 0 48 48" as const,
  /** Default fill for stroke-only icons */
  FILL_NONE: "none" as const,
  /** Fill color inheriting surrounding text color (filled glyph variants) */
  FILL_CURRENT: "currentColor" as const,
  /** Default stroke color inheriting surrounding text color */
  STROKE_CURRENT: "currentColor" as const,
  /** Stroke color for invisible/transparent strokes (contrast fills, masks) */
  STROKE_NONE: "none" as const,
  /** Default rounded line caps */
  STROKE_LINECAP_ROUND: "round" as const,
  /** Default rounded line joins */
  STROKE_LINEJOIN_ROUND: "round" as const,
  /** Light stroke width for fine-detail icons (hairline emphasis) */
  STROKE_WIDTH_LIGHT: 1.5 as const,
  /** Default stroke width for regular icons */
  STROKE_WIDTH_DEFAULT: 2 as const,
  /** Medium stroke width for slightly emphasized icons (between default and bold) */
  STROKE_WIDTH_MEDIUM: 2.5 as const,
  /** Bold stroke width for emphasis icons */
  STROKE_WIDTH_BOLD: 3 as const,
  /** Heavy stroke width for progress rings and thick-stroke indicators */
  STROKE_WIDTH_HEAVY: 4 as const,
  /** Default icon size class */
  SIZE_DEFAULT: "w-5 h-5" as const,
  /** Small icon size class */
  SIZE_SMALL: "w-4 h-4" as const,
} as const;

/**
 * Icon Path Data
 * Centralized source of truth for inline SVG path `d` attributes.
 * Flexy says: No hardcoded "M9 5l7 7-7 7" chevron paths in components!
 * Usage: import { ICON_PATHS } from "@blueprint/shared";
 *        <path d={ICON_PATHS.CHEVRON_RIGHT} ... />
 */
export const ICON_PATHS = {
  /** Right-pointing chevron (direction arrow) */
  CHEVRON_RIGHT: "M9 5l7 7-7 7" as const,
  /** Left-pointing chevron (back arrow) */
  CHEVRON_LEFT: "M15 19l-7-7 7-7" as const,
  /** Downward-pointing chevron */
  CHEVRON_DOWN: "M19 14l-7 7m0 0l-7-7m7 7V3" as const,
  /** Upward-pointing chevron */
  CHEVRON_UP: "M5 10l7-7m0 0l7 7m-7-7v18" as const,
  /** Checkmark (success/complete indicator) */
  CHECKMARK: "M5 13l4 4L19 7" as const,
  /** Large checkmark for 48×48 celebration/status rings (generation success) */
  CHECKMARK_LARGE: "M14 24L21 31L34 17" as const,
  /** Edit/pencil icon */
  EDIT: "M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" as const,
  /** Refresh/retry circular arrows */
  REFRESH:
    "M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" as const,
  /** Warning/alert triangle with exclamation */
  WARNING:
    "M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" as const,
  /** Trash/delete icon */
  TRASH:
    "M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" as const,
  /** Close/X icon */
  CLOSE: "M6 18L18 6M6 6l12 12" as const,
  /** Eye/view icon */
  EYE: "M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" as const,
  /** User/person icon */
  USER: "M15 12a3 3 0 11-6 0 3 3 0 016 0z" as const,
  /** Lightning bolt/energy icon */
  ZAP: "M13 10V3L4 14h7v7l9-11h-7z" as const,
  /** Search/magnifying glass icon */
  SEARCH: "M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" as const,
  /** Copy/duplicate icon */
  COPY: "M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" as const,
  /** Square-copy icon frame path (composed with the 13×13 rounded rect glyph) */
  COPY_SQUARE: "M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" as const,
  /** External link icon */
  EXTERNAL_LINK:
    "M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" as const,
  /** Help/question mark circle icon */
  HELP: "M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" as const,
  /** App brand logo layered diamond stack path */
  BRAND_LOGO: "M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" as const,
  /** GitHub brand octocat logo path */
  GITHUB:
    "M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" as const,
} as const;

/**
 * SVG Rect Shape Geometry
 * Centralized rect geometry for inline SVG glyphs, designed for JSX spread.
 * Flexy says: No hardcoded rect x/y/width/height/rx literals in components!
 * Usage: import { ICON_RECTS } from "@blueprint/shared";
 *        <rect {...ICON_RECTS.COPY_BODY} />
 */
export const ICON_RECTS = {
  /** Rounded square body of the square-copy glyph (pairs with ICON_PATHS.COPY_SQUARE) */
  COPY_BODY: { x: 9, y: 9, width: 13, height: 13, rx: 2, ry: 2 } as const,
  /** Left bar of the pause-badge glyph */
  PAUSE_LEFT: { x: 6, y: 4, width: 4, height: 16, rx: 1 } as const,
  /** Right bar of the pause-badge glyph */
  PAUSE_RIGHT: { x: 14, y: 4, width: 4, height: 16, rx: 1 } as const,
} as const;

/**
 * Color-Mix Opacity Percentages
 * Centralized source of truth for CSS color-mix() opacity percentages used in
 * box-shadow, gradient, and background styling.
 * Flexy says: No hardcoded "25%" or "12%" in color-mix strings!
 * Usage: import { COLOR_MIX_OPACITY } from "@blueprint/shared";
 *        boxShadow: `inset 0 0 40px 0 color-mix(in srgb, ${color} ${COLOR_MIX_OPACITY.GLOW}, transparent)`
 */
export const COLOR_MIX_OPACITY = {
  /** Subtle glow opacity (10%) */
  SUBTLE: "10%" as const,
  /** Medium glow opacity (12%) */
  MEDIUM: "12%" as const,
  /** Standard glow opacity (18%) */
  GLOW: "18%" as const,
  /** Strong highlight opacity (25%) */
  HIGHLIGHT: "25%" as const,
  /** Prominent accent opacity (30%) */
  PROMINENT: "30%" as const,
} as const;

/**
 * Review Step Display State Values
 * Centralized state tracking values for the wizard review step (StepReview).
 * Flexy says: No hardcoded "generating"/"idle" strings in StepReview!
 * Usage: import { REVIEW_STATE_VALUES } from "@blueprint/shared";
 *        data-state={isGenerating ? REVIEW_STATE_VALUES.GENERATING : REVIEW_STATE_VALUES.IDLE}
 */
export const REVIEW_STATE_VALUES = {
  /** Generation in progress state identifier */
  GENERATING: "generating" as const,
  /** Idle / ready to review state identifier */
  IDLE: "idle" as const,
} as const;

/**
 * Celebration Display State Values
 * Centralized state tracking values for completion celebration animations (GenerationCelebration).
 * Flexy says: No hardcoded "active"/"idle" strings in GenerationCelebration!
 * Usage: import { CELEBRATION_STATE_VALUES } from "@blueprint/shared";
 *        data-state={isComplete ? CELEBRATION_STATE_VALUES.ACTIVE : CELEBRATION_STATE_VALUES.IDLE}
 */
export const CELEBRATION_STATE_VALUES = {
  /** Celebration animation active state identifier */
  ACTIVE: "active" as const,
  /** Celebration animation idle state identifier */
  IDLE: "idle" as const,
} as const;

/**
 * Glow Display State Values
 * Centralized state tracking values for saved indicator green glow pulse state (LastSavedIndicator).
 * Flexy says: No hardcoded "active"/"idle" glow state strings!
 * Usage: import { GLOW_STATE_VALUES } from "@blueprint/shared";
 *        data-saved-glow={showSavedGlow ? GLOW_STATE_VALUES.ACTIVE : GLOW_STATE_VALUES.IDLE}
 */
export const GLOW_STATE_VALUES = {
  /** Glow active state identifier */
  ACTIVE: "active" as const,
  /** Glow idle state identifier */
  IDLE: "idle" as const,
} as const;

/**
 * Step Indicator Display State Values
 * Centralized state tracking values for wizard navigation indicators (StepIndicator).
 * Flexy says: No hardcoded "active"/"completed"/"locked"/"available" strings in StepIndicator!
 * Usage: import { STEP_INDICATOR_STATE_VALUES } from "@blueprint/shared";
 *        data-state={isActive ? STEP_INDICATOR_STATE_VALUES.ACTIVE : ...}
 */
export const STEP_INDICATOR_STATE_VALUES = {
  /** Active step identifier */
  ACTIVE: "active" as const,
  /** Completed step identifier */
  COMPLETED: "completed" as const,
  /** Available step identifier */
  AVAILABLE: "available" as const,
  /** Locked step identifier */
  LOCKED: "locked" as const,
} as const;

/**
 * WAI-ARIA Role Literals
 * Centralized source of truth for `role="..."` attribute values across all
 * web components. Keeps ARIA usage greppable and prevents literal drift.
 * Flexy says: No hardcoded role="status"/"alert"/"dialog" strings in components!
 * Usage: import { ARIA_ROLES } from "@blueprint/shared";
 *        <div role={ARIA_ROLES.STATUS} aria-live={ARIA_LIVE_VALUES.POLITE}>
 */
export const ARIA_ROLES = {
  /** Live status announcer — polite updates for assistive tech */
  STATUS: "status" as const,
  /** Urgent alert announcer — immediately interrupts screen readers */
  ALERT: "alert" as const,
  /** Modal dialog container — traps focus, blocks background */
  DIALOG: "dialog" as const,
  /** Semantic image role for SVG/icon graphics exposed to AT */
  IMG: "img" as const,
  /** Grouped controls/elements container */
  GROUP: "group" as const,
  /** Named landmark region for page sections */
  REGION: "region" as const,
  /** Progress indicator with aria-valuenow/min/max */
  PROGRESSBAR: "progressbar" as const,
  /** Hover/focus tooltip popup */
  TOOLTIP: "tooltip" as const,
  /** Tab panel content container */
  TABPANEL: "tabpanel" as const,
  /** Tab list container */
  TABLIST: "tablist" as const,
  /** Individual tab */
  TAB: "tab" as const,
  /** Slider input role */
  SLIDER: "slider" as const,
  /** Editable search input role */
  SEARCHBOX: "searchbox" as const,
  /** Radio button group container */
  RADIOGROUP: "radiogroup" as const,
  /** Individual radio button */
  RADIO: "radio" as const,
  /** Selectable option in a listbox */
  OPTION: "option" as const,
  /** Plain list item */
  LISTITEM: "listitem" as const,
  /** List container */
  LIST: "list" as const,
  /** Listbox container (selectable list) */
  LISTBOX: "listbox" as const,
} as const;

/**
 * ARIA Live Region Politeness Values
 * Centralized source of truth for `aria-live` attribute values.
 * Flexy says: No hardcoded aria-live="polite"/"assertive" strings in components!
 * Usage: import { ARIA_LIVE_VALUES } from "@blueprint/shared";
 *        <span role={ARIA_ROLES.STATUS} aria-live={ARIA_LIVE_VALUES.POLITE}>
 */
export const ARIA_LIVE_VALUES = {
  /** Polite — waits for a pause before announcing (default for status) */
  POLITE: "polite" as const,
  /** Assertive — interrupts immediately (use for errors/alerts) */
  ASSERTIVE: "assertive" as const,
  /** Off — disables live region announcements */
  OFF: "off" as const,
} as const;

/**
 * ARIA Atomic Values
 * Centralized source of truth for `aria-atomic` attribute values.
 * Flexy says: No hardcoded aria-atomic="true"/"false" strings in components!
 * Usage: import { ARIA_ATOMIC_VALUES } from "@blueprint/shared";
 *        <p role={ARIA_ROLES.STATUS} aria-atomic={ARIA_ATOMIC_VALUES.TRUE}>
 */
export const ARIA_ATOMIC_VALUES = {
  /** Announce the entire live region as a whole */
  TRUE: "true" as const,
  /** Announce only the changed portions */
  FALSE: "false" as const,
} as const;

/**
 * ARIA Modal Values
 * Centralized source of truth for `aria-modal` attribute values.
 * Flexy says: No hardcoded aria-modal="true" strings in components!
 * Usage: import { ARIA_MODAL_VALUES } from "@blueprint/shared";
 *        <div role={ARIA_ROLES.DIALOG} aria-modal={ARIA_MODAL_VALUES.TRUE}>
 */
export const ARIA_MODAL_VALUES = {
  /** Modal dialog — background is inert to assistive tech */
  TRUE: "true" as const,
  /** Non-modal dialog — background remains accessible */
  FALSE: "false" as const,
} as const;

/**
 * ARIA Hidden Values
 * Centralized source of truth for `aria-hidden` attribute values.
 * Flexy says: No hardcoded aria-hidden="true" strings in components!
 * Usage: import { ARIA_HIDDEN_VALUES } from "@blueprint/shared";
 *        <svg aria-hidden={ARIA_HIDDEN_VALUES.TRUE} focusable="false">
 */
export const ARIA_HIDDEN_VALUES = {
  /** Element is hidden from the accessibility tree (decorative content) */
  TRUE: "true" as const,
  /** Element is exposed to assistive tech (visible semantic content) */
  FALSE: "false" as const,
} as const;

/**
 * ARIA Orientation Values
 * Centralized source of truth for `aria-orientation` attribute values
 * used by scrollbars, toolbars, and listbox-style widgets.
 * Flexy says: No hardcoded aria-orientation="horizontal" strings in components!
 * Usage: import { ARIA_ORIENTATION_VALUES } from "@blueprint/shared";
 *        <div role={ARIA_ROLES.SLIDER} aria-orientation={ARIA_ORIENTATION_VALUES.HORIZONTAL}>
 */
export const ARIA_ORIENTATION_VALUES = {
  /** Widget is laid out horizontally (e.g., top toolbars, horizontal sliders) */
  HORIZONTAL: "horizontal" as const,
  /** Widget is laid out vertically (e.g., scrollbars, vertical sliders) */
  VERTICAL: "vertical" as const,
} as const;

/**
 * ARIA Required Values
 * Centralized source of truth for `aria-required` attribute values
 * marking form fields as required inputs.
 * Flexy says: No hardcoded aria-required="true" strings in components!
 * Usage: import { ARIA_REQUIRED_VALUES } from "@blueprint/shared";
 *        <input aria-required={ARIA_REQUIRED_VALUES.TRUE} />
 */
export const ARIA_REQUIRED_VALUES = {
  /** Input is required for successful form submission */
  TRUE: "true" as const,
  /** Input is optional */
  FALSE: "false" as const,
} as const;

/**
 * Data Boolean Values
 * Centralized source of truth for `data-*` boolean state attribute strings
 * (data-reduced-motion, data-state, data-loading, data-active, etc.) and for
 * boolean serialization of localStorage reads/writes.
 * Flexy says: No hardcoded ? "true" : "false" ternaries or bare "true"/"false"
 * boolean strings in components!
 * Usage: import { DATA_BOOLEAN_VALUES } from "@blueprint/shared";
 *        data-loading={isLoading ? DATA_BOOLEAN_VALUES.TRUE : DATA_BOOLEAN_VALUES.FALSE}
 *        localStorage.getItem(KEY) === DATA_BOOLEAN_VALUES.TRUE
 */
export const DATA_BOOLEAN_VALUES = {
  /** Serialized boolean true (DOM attribute / storage representation) */
  TRUE: "true" as const,
  /** Serialized boolean false (DOM attribute / storage representation) */
  FALSE: "false" as const,
} as const;

/**
 * ARIA Busy Values
 * Centralized source of truth for `aria-busy` attribute values
 * marking widgets that are in-progress (loading/updating).
 * Flexy says: No hardcoded aria-busy="true" strings in components!
 * Usage: import { ARIA_BUSY_VALUES } from "@blueprint/shared";
 *        <button aria-busy={isLoading ? ARIA_BUSY_VALUES.TRUE : undefined} />
 */
export const ARIA_BUSY_VALUES = {
  /** Widget is being updated / loading */
  TRUE: "true" as const,
  /** Widget is idle */
  FALSE: "false" as const,
} as const;

/**
 * Start From Scratch Divider Button State Values
 * Centralized state tracking values for start-from-scratch divider button (StartFromScratchButton).
 * Flexy says: No hardcoded "idle" strings in StartFromScratchButton!
 * Usage: import { DIVIDER_BUTTON_STATE_VALUES } from "@blueprint/shared";
 *        data-state={DIVIDER_BUTTON_STATE_VALUES.IDLE}
 */
export const DIVIDER_BUTTON_STATE_VALUES = {
  /** Idle state identifier */
  IDLE: "idle" as const,
  /** Hovered state identifier */
  HOVERED: "hovered" as const,
  /** Focused state identifier */
  FOCUSED: "focused" as const,
} as const;

/**
 * HTML Control Type Values
 * Centralized source of truth for the `type` attribute on `<button>` and
 * `<input>` elements. The attribute participates in two silent-failure
 * pairing contracts:
 *
 * 1. **Button submit-behavior contract**: per the HTML spec a `<button>`
 *    with no valid `type` defaults to `type="submit"` — so a typo'd
 *    `type="button"` (e.g. `"botton"`) silently converts a neutral button
 *    into a form submitter inside any enclosing `<form>`, firing
 *    validation + submission with zero type errors. Wizard step forms
 *    pair Next (`SUBMIT`) with Back/secondary actions (`BUTTON`) in the
 *    same form; a drift on either side changes click behavior silently.
 * 2. **Input keyboard/validation contract**: `<input type="text">` is the
 *    HTML default; a typo changes the virtual keyboard layout, autofill
 *    category, and constraint-validation behavior with no type error.
 *
 * Flexy says: No hardcoded type="button"/"submit"/"text" strings in components!
 * Usage: import { HTML_CONTROL_TYPES } from "@blueprint/shared";
 *        <button type={HTML_CONTROL_TYPES.BUTTON} onClick={onCancel} />
 *        <input type={HTML_CONTROL_TYPES.TEXT} value={value} />
 */
export const HTML_CONTROL_TYPES = {
  /** Neutral button — never submits an enclosing form (pair: SUBMIT) */
  BUTTON: "button" as const,
  /** Form-submitting button (pair: BUTTON) */
  SUBMIT: "submit" as const,
  /** Single-line text input (HTML default input type) */
  TEXT: "text" as const,
} as const;

/**
 * HTML Autocomplete Values
 * Centralized source of truth for the `autoComplete` attribute on form
 * controls. Pairs with the sensitive-field privacy contract: wizard inputs
 * (project name, description, target audience, constraints, feature
 * search) deliberately suppress browser autofill so previously-saved
 * personal data never overwrites in-progress wizard state. A typo'd
 * `"off"` (e.g. `"of"`, `"Of"`) silently re-enables browser autofill —
 * a privacy/UX regression with zero type errors.
 * Flexy says: No hardcoded autoComplete="off" strings in components!
 * Usage: import { HTML_AUTOCOMPLETE_VALUES } from "@blueprint/shared";
 *        <input autoComplete={HTML_AUTOCOMPLETE_VALUES.OFF} />
 */
export const HTML_AUTOCOMPLETE_VALUES = {
  /** Browser autofill disabled (privacy contract for sensitive wizard fields) */
  OFF: "off" as const,
} as const;

/**
 * HTML Autocapitalize Values
 * Centralized source of truth for the `autoCapitalize` attribute on text
 * inputs and textareas. The attribute participates in a silent-failure
 * privacy/UX contract paired with `autoComplete`/`autoCorrect`/`spellCheck`:
 *
 * - **Technical fields** (project name, target audience, constraints,
 *   feature search, shortcut search) set `OFF` to stop iOS/Android from
 *   capitalizing the first letter of short technical tokens ("auth",
 *   "SRE", "devops"). A typo'd `"off"` (e.g. `"of"`, `"Of"`) silently
 *   re-enables autocapitalize — mangling the typed identifier with zero
 *   type errors.
 * - **Prose fields** (project description) set `SENTENCES` to keep natural
 *   sentence capitalization on mobile — the intentional opposite of the
 *   technical fields. A drift between the two branches changes how the
 *   soft keyboard transforms user input with no type error.
 *
 * Flexy says: No hardcoded autoCapitalize="off"/"sentences" strings in components!
 * Usage: import { HTML_AUTOCAPITALIZE_VALUES } from "@blueprint/shared";
 *        <input autoCapitalize={HTML_AUTOCAPITALIZE_VALUES.OFF} />
 *        <textarea autoCapitalize={HTML_AUTOCAPITALIZE_VALUES.SENTENCES} />
 */
export const HTML_AUTOCAPITALIZE_VALUES = {
  /** Autocapitalize disabled — technical identifier/token fields (pair: autoComplete OFF) */
  OFF: "off" as const,
  /** Sentence-case capitalization — prose fields (project description) */
  SENTENCES: "sentences" as const,
} as const;

/**
 * HTML Autocorrect Values
 * Centralized source of truth for the `autoCorrect` attribute — a
 * WebKit/Chromium (iOS Safari, Android WebView) text-input extension that
 * controls the platform autocorrect engine. Pairs with the sensitive-field
 * privacy contract: wizard inputs deliberately suppress autocorrect so
 * Safari never rewrites short technical tokens ("cmd" → "Cmd",
 * "auth" → "author", "SRE" → "sore"). A typo'd `"off"` (e.g. `"of"`,
 * `"Of"`) silently re-enables autocorrect — a token-mangling UX regression
 * with zero type errors. Prose fields (description) deliberately omit the
 * attribute so the platform default (enabled) applies alongside
 * `autoCapitalize={SENTENCES}`.
 * Flexy says: No hardcoded autoCorrect="off" strings in components!
 * Usage: import { HTML_AUTOCORRECT_VALUES } from "@blueprint/shared";
 *        <input autoCorrect={HTML_AUTOCORRECT_VALUES.OFF} />
 */
export const HTML_AUTOCORRECT_VALUES = {
  /** Platform autocorrect disabled (privacy/UX contract for technical token fields) */
  OFF: "off" as const,
} as const;

/**
 * Enter Key Hint Values
 * Centralized source of truth for the `enterKeyHint` attribute — the mobile
 * soft-keyboard action hint shown on the Enter/key action key. Pairs with
 * the Enter-behavior contract: the hint MUST match the action Enter will
 * actually trigger (search field → SEARCH, multi-step form → NEXT until
 * submittable then GO, feature add → DONE). A typo silently shows the
 * wrong key icon to mobile users with zero type errors; the wizard form
 * flips NEXT↔GO dynamically with `canProceed` so both sides of the pair
 * must stay byte-identical.
 * Flexy says: No hardcoded enterKeyHint="search"|"next"|"go"|"done" strings in components!
 * Usage: import { ENTER_KEY_HINTS } from "@blueprint/shared";
 *        <input enterKeyHint={canProceed ? ENTER_KEY_HINTS.GO : ENTER_KEY_HINTS.NEXT} />
 */
export const ENTER_KEY_HINTS = {
  /** Search action (search inputs) */
  SEARCH: "search" as const,
  /** Advance to the next field (incomplete multi-step form) */
  NEXT: "next" as const,
  /** Submit/confirm action (submittable form) */
  GO: "go" as const,
  /** Complete/commit action (final field, e.g. add-to-list) */
  DONE: "done" as const,
} as const;
