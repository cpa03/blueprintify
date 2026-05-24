/**
 * UI Content Constants
 * Source of truth for all user-facing text content
 *
 * Flexy says: No hardcoded content strings - everything configurable!
 */

import { ENV } from "../env";

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
  },
  VIEW_MODES: {
    EDIT: "Edit",
    SPLIT: "Split",
    PREVIEW: "Preview",
    GENERATING: "Generating...",
    EXPORTED: "Exported!",
  },
  VIEW_MODE_SHORTCUTS: {
    EDIT: "Ctrl+1",
    SPLIT: "Ctrl+2",
    PREVIEW: "Ctrl+3",
  },
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
  info: "Project Info",
  stack: "Tech Stack",
  features: "Features",
  review: "Review",
  generating: "Generating...",
};

/**
 * Celebration component text
 * Flexy says: No hardcoded celebration text - everything configurable!
 */
export const CELEBRATION_TEXT = {
  COMPLETE: "Generation Complete!",
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
