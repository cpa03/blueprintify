/**
 * UI Content Constants
 * Source of truth for all user-facing text content
 *
 * Flexy says: No hardcoded content strings - everything configurable!
 */

import { ENV } from "../env";
import { UI_STRINGS, UI_MESSAGES, WIZARD_STEP_KEYS, EXPORT_ERROR_STRINGS } from "@blueprint/shared";

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
      ADDED_MESSAGE: (feature: string) => `Added "${feature}"`,
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
} as const;

/**
 * Network connectivity notification messages
 * Flexy says: No hardcoded network messages - everything configurable!
 */
export const NETWORK_MESSAGES = {
  OFFLINE: "You are offline. Some features may be unavailable.",
  ONLINE: "Connection restored.",
  OFFLINE_DURATION: 0,
  ONLINE_DURATION: 3000,
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
    GITHUB: "View on GitHub",
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
  },
  TOAST: {
    DISMISS: (type: string) => `Dismiss ${type} notification`,
  },
  OFFLINE_BANNER: {
    LABEL: "You are currently offline",
    DESCRIPTION: "Some features may be unavailable while you are offline.",
    DISMISS: "Dismiss offline notice",
  },
  ERROR_BOUNDARY: {
    TRY_AGAIN: "Try again",
    RELOAD_PAGE: "Reload page",
  },
  CELEBRATION: {
    COMPLETE: "Generation complete",
  },
  KEYBOARD_SHORTCUTS: {
    CLOSE: "Close keyboard shortcuts",
  },
  SCROLL_PROGRESS: {
    READING: "Reading progress",
    PAGE_SCROLL_POSITION: "Page scroll position — click to navigate",
  },
  LAZY_CODEMIRROR: {
    LOADING: "Loading code editor",
  },
  EDITOR: {
    STREAMING_CONTENT: "Streaming content in real-time",
    DOCUMENT_TABS: "Document tabs",
    START_NEW_PROJECT: "Start new project",
  },
  WIZARD_FEATURES: {
    NEW_FEATURE_NAME: "New feature name",
    CLEAR_FEATURE_INPUT: "Clear feature input",
    ADD_FEATURE: "Add feature",
    CLEAR_ALL_FEATURES: "Clear all features",
  },
  WIZARD_INFO: {
    CLEAR_TARGET_AUDIENCE: "Clear target audience",
    CLEAR_CONSTRAINTS: "Clear constraints",
  },
  WIZARD_STACK: {
    TECH_STACK_SELECTION: "Tech Stack Selection",
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
export const SKELETON_LAYOUT = {
  /** Preview skeleton line widths (percentages) */
  PREVIEW_LINE_WIDTHS: ["88%", "72%", "95%", "60%", "82%", "70%", "90%", "55%", "78%"] as const,
  /** Preview skeleton code block width (percentage) */
  PREVIEW_CODE_WIDTH: "92%" as const,
  /** Number of lines in editor skeleton */
  EDITOR_LINE_COUNT: 16,
  /** Editor skeleton line widths (percentages) */
  EDITOR_LINE_WIDTHS: [92, 78, 85, 60, 95, 72, 88, 55, 80, 70, 90, 65, 82, 75, 58, 87] as const,
  /** Editor skeleton indent values */
  EDITOR_LINE_INDENTS: [0, 0, 2, 0, 4, 0, 2, 0, 6, 0, 0, 3, 0, 2, 0, 4] as const,
  /** Editor skeleton line height in pixels */
  EDITOR_LINE_HEIGHT_PX: 14,
  /** Editor skeleton indent multiplier in pixels */
  EDITOR_INDENT_MULTIPLIER_PX: 12,
} as const;
