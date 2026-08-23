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
  TASKS_ANNOUNCE: "tasks.md" as const,
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
  /** Duration to show toast notifications (1.5s) */
  TOAST_NOTIFICATION: 1500,
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
 * Flexy says: No hardcoded CSS value strings like "auto" in component logic!
 * Usage: import { CSS_VALUES } from "@blueprint/shared";
 *        textarea.style.height = CSS_VALUES.AUTO
 */
export const CSS_VALUES = {
  /** CSS auto value — used for height, width, margin, etc. */
  AUTO: "auto" as const,
  /** CSS none value — used for transitions, animations, etc. */
  NONE: "none" as const,
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
