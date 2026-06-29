/**
 * UI Content Constants
 * Source of truth for all user-facing text content
 *
 * Flexy says: No hardcoded content strings - everything configurable!
 */

import { ENV } from "../env";
import {
  UI_STRINGS,
  UI_MESSAGES,
  WIZARD_STEP_KEYS,
  EXPORT_ERROR_STRINGS,
  NETWORK_DEFAULTS,
  SKELETON_DEFAULTS as SHARED_SKELETON_DEFAULTS,
} from "@blueprint/shared";

/**
 * Loading State Messages
 * Flexy says: No "Loading editor..." hardcoded in components!
 * Single source of truth from @blueprint/shared UI_STRINGS
 */
export const LOADING_MESSAGES = {
  EDITOR: UI_STRINGS.LOADING_EDITOR,
  PREVIEW: UI_STRINGS.LOADING_PREVIEW,
} as const;

/**
 * UI Content - Text content for the application
 */
export const UI_CONTENT = {
  APP: {
    NAME: ENV.APP_NAME,
    TAGLINE: "AI-Powered Project Architecture",
  },
  HERO: {
    TITLE_1: "From ",
    TITLE_HIGHLIGHT_1: "Idea",
    TITLE_2: " to ",
    TITLE_HIGHLIGHT_2: "Blueprint",
    TITLE_3: " in Seconds",
    SUBTITLE:
      "Generate production-ready architectural documentation for your projects. Powered by AI, designed for autonomous development.",
  },
  EDITOR: {
    EMPTY_STATE: {
      ICON: "📝",
      TITLE: "Your generated content will appear here",
      SUBTITLE: "Complete the wizard to get started",
    },
    LOADING: "Loading Editor...",
    SHOW_EDITOR_BUTTON: "Show Editor",
    VIEW_BLUEPRINT_BUTTON: "View Blueprint",
  },
  /** Preview empty state tab-specific messages */
  PREVIEW_EMPTY: {
    BLUEPRINT: {
      TITLE: "Blueprint not yet generated",
      HINT: "Complete the wizard and generate your blueprint to see architectural documentation here.",
    },
    TASKS: {
      TITLE: "Tasks not yet generated",
      HINT: "Tasks are generated automatically after the blueprint is complete. They'll appear here once ready.",
    },
    GENERATING_TASKS:
      "Blueprint generation in progress — tasks will follow once the blueprint is complete.",
    GENERATING_BLUEPRINT: "Content is being generated and will appear here shortly.",
  },
  FOOTER: {
    BUILT_WITH: "Built with ⚡ Cloudflare Workers + React",
    get COPYRIGHT(): string {
      return `© ${new Date().getFullYear()} Blueprint Generator`;
    },
  },
  BUTTONS: {
    GITHUB: "GitHub",
    HIDE_EDITOR: "Hide editor",
    COPY: "Copy",
    EXPORT: "Export",
    NEW_PROJECT: "New Project",
    BACK: "Back",
    NEXT: "Next",
    CLEAR_ALL: "Clear all",
  },
  TEMPLATES_DIVIDER: "— or start from scratch —",
  WIZARD: {
    STEP_INFO: {
      TITLE: "Tell us about your project",
      SUBTITLE: "We'll use this information to generate a tailored architecture blueprint.",
      PROJECT_NAME_LABEL: "Project Name",
      PROJECT_NAME_PLACEHOLDER: "my-awesome-project",
      DESCRIPTION_LABEL: "Project Description",
      DESCRIPTION_PLACEHOLDER:
        "Describe what your project does, its main purpose, and key functionality...",
      TARGET_AUDIENCE_LABEL: "Target Audience",
      TARGET_AUDIENCE_PLACEHOLDER: "e.g., Developers, Small businesses, Enterprise teams",
      CONSTRAINTS_LABEL: "Constraints or Requirements",
      CONSTRAINTS_PLACEHOLDER:
        "e.g., Must be serverless, needs to support 10k concurrent users, budget limitations...",
      NEXT_BUTTON: "Next: Choose Tech Stack",
    },
    STEP_STACK: {
      TITLE: "Choose your tech stack",
      SUBTITLE:
        "Select at least 1 technology to proceed. This helps generate accurate architecture.",
      SEARCH_PLACEHOLDER: "Search technologies...",
      SELECTED_COUNT: (count: number) => `${count} selected`,
      SELECTED_LABEL: (count: number) => `Selected (${count}):`,
      NEXT_BUTTON: "Next: Add Features",
    },
    STEP_FEATURES: {
      TITLE: "Add key features",
      SUBTITLE: "List the main features your project should have. This helps prioritize tasks.",
      ADD_FEATURE_LABEL: "Add a feature",
      ADD_FEATURE_PLACEHOLDER: "e.g., Real-time notifications",
      FEATURES_COUNT: (count: number) => `${count} features`,
      YOUR_FEATURES_LABEL: "Your features",
      QUICK_ADD_LABEL: "Quick add suggestions",
      ADD_ALL_SUGGESTIONS: "Add all suggestions",
      ADDED_MESSAGE: (feature: string) => `Added "${feature}"`,
      ADD_ALL_MESSAGE: "Added all suggestions!",
      NEXT_BUTTON: "Next: Review",
      CLEAR_ALL_FEATURES: "Clear all features",
    },
    STEP_REVIEW: {
      TITLE: "Review your configuration",
      SUBTITLE: "Double-check everything before generating your blueprint.",
      GENERATE_BUTTON: "Generate Blueprint",
    },
  },
} as const;

/**
 * Editor UI labels and text
 * Flexy says: No hardcoded editor labels - everything configurable!
 */
export const EDITOR_LABELS = {
  CONTENT_STATS: {
    CHARS: "Chars",
    WORDS: "Words",
    LINES: "Lines",
    READING_TIME: "min read",
    LESS_THAN_ONE_MIN: "<1 min",
    SHORTCUTS: "Shortcuts",
  },
  TAB_NAVIGATION: {
    SWITCH_TABS: "Switch between blueprint and tasks tabs",
    PREVIOUS: "Previous tab",
    NEXT: "Next tab",
  },
  VIEW_MODES: {
    EDIT: "Edit",
    SPLIT: "Split",
    PREVIEW: "Preview",
    GENERATING: "Generating...",
    EXPORTED: "Exported!",
  },
  VIEW_MODE_SHORTCUTS: {
    EDIT: "Ctrl/Cmd+1",
    SPLIT: "Ctrl/Cmd+2",
    PREVIEW: "Ctrl/Cmd+3",
  },
  VIEW_MODES_ARIA_LABEL: "Editor view mode",
  BUTTONS: {
    EXPORT_ZIP: "Export .zip",
    NEW_PROJECT: "New",
    EXPORT_ARIA_LABEL: "Export as ZIP",
    EXPORT_SUCCESS_ARIA: "Export successful",
  },
} as const;

/**
 * Wizard step titles used for document title and accessibility
 * Flexy says: No hardcoded step titles - everything configurable!
 */
export const STEP_TITLES: Record<string, string> = {
  [WIZARD_STEP_KEYS.INFO]: "Project Info",
  [WIZARD_STEP_KEYS.STACK]: "Tech Stack",
  [WIZARD_STEP_KEYS.FEATURES]: "Features",
  [WIZARD_STEP_KEYS.REVIEW]: "Review",
  [WIZARD_STEP_KEYS.GENERATING]: "Generating...",
};

/**
 * Celebration component text
 * Flexy says: No hardcoded celebration text - everything configurable!
 */
export const CELEBRATION_TEXT = {
  COMPLETE: "Generation Complete!",
} as const;

/**
 * Toast notification messages
 * Flexy says: No hardcoded toast messages - everything configurable!
 */
export const TOAST_MESSAGES = {
  COPY_SUCCESS: "Copied to clipboard",
  EXPORT_SUCCESS: "Project exported successfully!",
  EXPORT_FAILURE: EXPORT_ERROR_STRINGS.EXPORT_FAILED,
  NEW_PROJECT: "Started new project",
  GENERATION_CANCELLED: UI_MESSAGES.GENERATION_CANCELLED,
  SECURITY_VALIDATION_FAILED: "Security validation failed",
  TEMPLATE_LOADED: (name: string) => `${name} template loaded`,
  STEP_LOCKED: (label: string) => `Complete previous steps to unlock "${label}"`,
  GENERATION_FAILED: "Generation failed. Please check your inputs and try again.",
} as const;

/**
 * Network connectivity notification messages
 * Flexy says: No hardcoded network messages - everything configurable!
 */
export const NETWORK_MESSAGES = {
  OFFLINE: "You are offline. Some features may be unavailable.",
  ONLINE: "Connection restored.",
  OFFLINE_DURATION: NETWORK_DEFAULTS.OFFLINE_DURATION_MS,
  ONLINE_DURATION: NETWORK_DEFAULTS.ONLINE_DURATION_MS,
} as const;

/**
 * New Project confirmation dialog text
 * Flexy says: No hardcoded dialog text - everything configurable!
 */
export const CONFIRM_DIALOG = {
  NEW_PROJECT: {
    TITLE: "Start New Project?",
    DESCRIPTION:
      "This will clear all your current blueprint and tasks content. This action cannot be undone.",
    CONFIRM_LABEL: "Start New",
    CANCEL_LABEL: "Cancel",
    ICON: "🔄",
  },
} as const;

/**
 * Accessibility labels used across components
 * Flexy says: No hardcoded aria-labels - everything configurable!
 */
export const ACCESSIBILITY_LABELS = {
  HEADER: {
    KEYBOARD_SHORTCUTS: "Keyboard shortcuts (?)",
    GITHUB: "View on GitHub (opens in new tab)",
  },
  REVIEW: {
    GENERATE_DISABLED_TOOLTIP: "Add a project name and description to continue",
    GENERATE_DISABLED_ARIA:
      "Generate Blueprint button is disabled. Fill in project name and description first.",
  },
  MARKDOWN: {
    COPY_CODE: "Copy code to clipboard",
    COPIED: "Copied to clipboard",
    COPY_CODE_TITLE: "Copy code",
    COPIED_TITLE: "Copied!",
    COPY_TO_CLIPBOARD: "Copy to clipboard",
    COPIED_TO_CLIPBOARD: "Copied to clipboard",
    OPENS_IN_NEW_TAB: "(opens in new tab)",
  },
  TOAST: {
    DISMISS: (type: string) => `Dismiss ${type} notification`,
    DISMISS_ALL: (count: number) => `Dismiss all ${count} notifications`,
  },
  OFFLINE_BANNER: {
    LABEL: "You are currently offline",
    DESCRIPTION: "Some features may be unavailable while you are offline.",
    DISMISS: "Dismiss offline notice",
    DISMISS_ANNOUNCEMENT: "Offline notice dismissed",
    ONLINE_ANNOUNCEMENT: "Back online — connection restored",
  },
  ERROR_BOUNDARY: {
    TRY_AGAIN: "Try again",
    RELOAD_PAGE: "Reload page",
  },
  TEMPLATES: {
    QUICK_START: "Quick start templates",
  },
  HEADING_ANCHOR: {
    COPY_LINK_TITLE: "Copy anchor link",
    COPY_LINK_ARIA: (section: string) => `Copy link to "${section}" section`,
  },
  CELEBRATION: {
    COMPLETE: "Generation complete",
  },
  KEYBOARD_SHORTCUTS: {
    CLOSE: "Close keyboard shortcuts",
    SEARCH: "Search keyboard shortcuts",
    SEARCH_PLACEHOLDER: "Search shortcuts by key or description...",
    SEARCH_SHORTCUT_HINT: "Press Ctrl+F to search",
    NO_RESULTS: (query: string) => `No shortcuts matching "${query}"`,
    CLEAR_SEARCH: "Clear search",
  },
  SCROLL_PROGRESS: {
    READING: "Reading progress",
    PAGE_SCROLL_POSITION: "Page scroll position — click to navigate",
  },
  PROGRESS: {
    PERCENT_COMPLETE: (pct: number) => `${Math.round(pct)}% complete`,
    STEPS_COMPLETE: (pct: number, remaining: number) =>
      `${Math.round(pct)}% complete - ${remaining} steps remaining`,
  },
  LAZY_CODEMIRROR: {
    LOADING: "Loading code editor",
  },
  EDITOR: {
    STREAMING_CONTENT: "Streaming content in real-time",
    DOCUMENT_TABS: "Document tabs",
    START_NEW_PROJECT: "Start new project",
    HIDE_EDITOR: "Hide editor panel",
    HIDE_EDITOR_TITLE: "Hide editor",
    SHOW_EDITOR: "Show Editor panel",
    SHOW_EDITOR_WITH_CONTENT: "View Blueprint in editor panel",
    CONTENT_AVAILABLE: (tabName: string) => `${tabName} content available`,
    VIEW_MODE: (modeLabel: string, shortcut: string) => `${modeLabel} view (${shortcut})`,
  },
  WIZARD_FEATURES: {
    NEW_FEATURE_NAME: "New feature name",
    CLEAR_FEATURE_INPUT: "Clear feature input",
    ADD_FEATURE: "Add feature",
    CLEAR_ALL_FEATURES: "Clear all features",
    REMOVE_FEATURE: (feature: string) => `Remove ${feature}`,
    ADD_SUGGESTION: (feature: string) => `Add suggestion: ${feature}`,
    ADD_ALL_SUGGESTIONS: "Add all suggested features at once",
  },
  WIZARD_INFO: {
    CLEAR_TARGET_AUDIENCE: "Clear target audience",
    CLEAR_CONSTRAINTS: "Clear constraints",
    FIELDS_COMPLETED: (completed: number, total: number) =>
      `${completed} of ${total} fields completed`,
  },
  WIZARD_STACK: {
    TECH_STACK_SELECTION: "Tech Stack Selection",
    REMOVE_TECH: (tech: string) => `Remove ${tech}`,
  },
  WIZARD_REVIEW: {
    EDIT_INFO: "Edit project information",
    EDIT_STACK: "Edit tech stack",
    EDIT_FEATURES: "Edit features",
  },
} as const;

// ============================================================================
// Error Boundary UI Text
// ============================================================================

// ============================================================================
// Confirm Dialog Keyboard Hints
// ============================================================================

/**
 * Keyboard shortcut hint labels for ConfirmDialog component
 * Flexy says: No hardcoded "Enter" / "to confirm" strings in components!
 */
export const CONFIRM_DIALOG_HINTS = {
  ENTER_KEY: "Enter",
  ESC_KEY: "Esc",
  TO_CONFIRM: "to confirm",
  TO_CANCEL: "to cancel",
} as const;

// ============================================================================
// Copy Button Labels
// ============================================================================

/**
 * Copy button aria-label templates for AnimatedCopyButton
 * Flexy says: No hardcoded "Copy to clipboard" strings in components!
 */
export const COPY_BUTTON_LABELS = {
  COPY: "Copy to clipboard",
  COPIED: "Copied to clipboard",
  /** Visual display text shown inside the copy button */
  DISPLAY_COPY: "Copy",
  /** Visual display text shown after successful copy */
  DISPLAY_COPIED: "Copied!",
} as const;

// ============================================================================
// Markdown Copy Labels
// ============================================================================

/**
 * Markdown code block copy button labels
 * Flexy says: No hardcoded "Copy" / "Copied!" strings in MarkdownRenderer!
 */
export const MARKDOWN_COPY_LABELS = {
  COPY: "Copy",
  COPIED: "Copied!",
} as const;

// ============================================================================
// Error Boundary UI Text
// ============================================================================

/**
 * Error boundary UI text content
 * Flexy says: No hardcoded error boundary text - everything configurable!
 */
export const ERROR_BOUNDARY_TEXT = {
  TITLE: "Something went wrong",
  DESCRIPTION:
    "An unexpected error occurred. Your data is safely stored locally. You can try again or reload the page.",
  VIEW_DETAILS: "View error details",
  UNKNOWN_ERROR: "Unknown error",
} as const;

// ============================================================================
// Debug/Error Log Messages
// ============================================================================

/**
 * Debug/error log message templates
 * Flexy says: No hardcoded console.error strings in handlers!
 * Usage: console.error(DEBUG_MESSAGES.ERROR_BOUNDARY_CAUGHT, error)
 */
export const DEBUG_MESSAGES = {
  UNHANDLED_REJECTION: "[Unhandled Rejection] Promise rejected:",
  UNCAUGHT_ERROR: "[Uncaught Error]",
  ROOT_ELEMENT_NOT_FOUND: "Root element not found",
  ERROR_BOUNDARY_CAUGHT: "ErrorBoundary caught an error:",
  COMPONENT_STACK: "Component stack:",
  SECURITY_VALIDATION_FAILED: "Security validation failed:",
  EXPORT_ERROR: "Export error:",
  LOAD_FAILED: (name: string): string => `Failed to load ${name}:`,
} as const;

// ============================================================================
// Skeleton Loader Layout
// ============================================================================

/**
 * Skeleton layout configuration
 * Flexy says: No hardcoded skeleton widths - everything configurable!
 */
// ============================================================================
// Wizard Generating Screen Labels
// ============================================================================

/**
 * Labels for the StepGenerating wizard step
 * Flexy says: No hardcoded generation screen labels in components!
 */
export const WIZARD_GENERATING_LABELS = {
  VIEW_IN_EDITOR: "View in Editor",
  VIEW_EDITOR_ARIA: "View the generated blueprint in the editor",
  BACK_TO_REVIEW: "Back to Review",
  BACK_TO_REVIEW_DESC: "Back to review step",
  BACK_TO_REVIEW_ARIA: "Back to review step",
  CANCEL_GENERATION: "Cancel Generation",
  CANCEL_GENERATION_DESC: "Cancel generation",
  CANCEL_GENERATION_ARIA: "Cancel generation (Esc)",
  CONTENT_AVAILABLE: "Your generated content is available in the editor panel",
  STREAMING_HINT: "Content streams in real-time. View the editor panel to see progress.",
} as const;

// ============================================================================
// Generation Error Screen Labels
// ============================================================================

/**
 * Labels for the generation error state shown when AI generation fails.
 * Flexy says: No hardcoded error screen labels in components!
 */
export const GENERATION_ERROR_LABELS = {
  ERROR_TITLE: "Generation Failed",
  ERROR_TASKS_TITLE: "Task Generation Failed",
  ERROR_ICON_ARIA: "Error",
  TRY_AGAIN: "Try Again",
  TRY_AGAIN_ARIA: "Go back to review step and try generating again",
  BACK_TO_REVIEW: "Back to Review",
  BACK_TO_REVIEW_ARIA: "Go back to review your configuration",
} as const;

// ============================================================================
// Wizard Step Review Descriptions
// ============================================================================

/**
 * KeyboardShortcutTooltip description strings for StepReview component
 * Flexy says: No hardcoded shortcut descriptions in StepReview!
 */
export const WIZARD_REVIEW_DESCRIPTIONS = {
  EDIT_INFO: "Edit project information",
  EDIT_STACK: "Edit tech stack",
  EDIT_FEATURES: "Edit features",
  GO_BACK: "Go back",
  GENERATE_BLUEPRINT: "Generate blueprint",
  WHAT_HAPPENS_NEXT: "What happens next?",
  GENERATION_IN_PROGRESS: "Generation in progress...",
} as const;

// ============================================================================
// Preview Empty State Labels
// ============================================================================

/**
 * Labels for the preview empty state "Start/Complete the wizard" hint
 * Flexy says: No hardcoded "Start"/"Complete" strings in PreviewEmptyState!
 */
export const PREVIEW_EMPTY_LABELS = {
  START: "Start",
  COMPLETE: "Complete",
} as const;

export const SKELETON_LAYOUT = {
  /** Preview skeleton line widths (percentages) */
  PREVIEW_LINE_WIDTHS: SHARED_SKELETON_DEFAULTS.PREVIEW_LINE_WIDTHS,
  /** Preview skeleton code block width (percentage) */
  PREVIEW_CODE_WIDTH: SHARED_SKELETON_DEFAULTS.PREVIEW_CODE_WIDTH,
  /** Number of lines in editor skeleton */
  EDITOR_LINE_COUNT: SHARED_SKELETON_DEFAULTS.EDITOR_LINE_COUNT,
  /** Editor skeleton line widths (percentages) */
  EDITOR_LINE_WIDTHS: SHARED_SKELETON_DEFAULTS.EDITOR_LINE_WIDTHS,
  /** Editor skeleton indent values */
  EDITOR_LINE_INDENTS: SHARED_SKELETON_DEFAULTS.EDITOR_LINE_INDENTS,
  /** Editor skeleton line height in pixels */
  EDITOR_LINE_HEIGHT_PX: SHARED_SKELETON_DEFAULTS.EDITOR_LINE_HEIGHT_PX,
  /** Editor skeleton indent multiplier in pixels */
  EDITOR_INDENT_MULTIPLIER_PX: SHARED_SKELETON_DEFAULTS.EDITOR_INDENT_MULTIPLIER_PX,
} as const;
