/**
 * Keyboard Shortcut Configuration Constants
 * Source of truth for keyboard shortcut definitions
 * Flexy says: No hardcoded category strings in components!
 */

/**
 * Re-export shared shortcut descriptions for use in KeyboardShortcutTooltip components.
 * Flexy says: No hardcoded "Toggle editor" strings in component code!
 * Usage: <KeyboardShortcutTooltip description={SHORTCUT_DESCRIPTIONS.TOGGLE_EDITOR} />
 */
export { SHORTCUT_DESCRIPTIONS } from "@blueprint/shared";

/**
 * Shortcut category identifiers and display labels.
 * Single source of truth for shortcut grouping in the keyboard shortcuts modal.
 * Flexy says: No "general"/"editor"/"navigation"/"generation" hardcoded in components!
 */
export const SHORTCUT_CATEGORIES = {
  GENERAL: "general" as const,
  EDITOR: "editor" as const,
  NAVIGATION: "navigation" as const,
  GENERATION: "generation" as const,
} as const;

export type ShortcutCategory = (typeof SHORTCUT_CATEGORIES)[keyof typeof SHORTCUT_CATEGORIES];

/** Display labels for each shortcut category */
export const SHORTCUT_CATEGORY_LABELS: Record<ShortcutCategory, string> = {
  [SHORTCUT_CATEGORIES.GENERAL]: "General",
  [SHORTCUT_CATEGORIES.EDITOR]: "Editor",
  [SHORTCUT_CATEGORIES.NAVIGATION]: "Navigation",
  [SHORTCUT_CATEGORIES.GENERATION]: "Generation",
};

/** Icon names for each shortcut category */
export const SHORTCUT_CATEGORY_ICONS: Record<ShortcutCategory, string> = {
  [SHORTCUT_CATEGORIES.GENERAL]: "keyboard",
  [SHORTCUT_CATEGORIES.EDITOR]: "edit",
  [SHORTCUT_CATEGORIES.NAVIGATION]: "compass",
  [SHORTCUT_CATEGORIES.GENERATION]: "lightning",
};

/** All shortcut category values as an array */
export const SHORTCUT_CATEGORIES_LIST: readonly ShortcutCategory[] = [
  SHORTCUT_CATEGORIES.GENERAL,
  SHORTCUT_CATEGORIES.EDITOR,
  SHORTCUT_CATEGORIES.NAVIGATION,
  SHORTCUT_CATEGORIES.GENERATION,
] as const;

// Keyboard shortcuts
export const KEYBOARD_SHORTCUTS = {
  TOGGLE_EDITOR: {
    KEY: "e",
    MODIFIER: "ctrl/cmd",
    DESCRIPTION: "Toggle editor visibility",
  },
  CANCEL_GENERATION: {
    KEY: "Escape",
    DESCRIPTION: "Cancel generation",
  },
  SUBMIT_WIZARD: {
    KEY: "Enter",
    MODIFIER: "ctrl/cmd",
    DESCRIPTION: "Submit current wizard step",
  },
  NEW_PROJECT: {
    KEY: "n",
    MODIFIER: "ctrl/cmd",
    DESCRIPTION: "Start a new project",
  },
  SCROLL_TO_TOP: {
    KEY: "Home",
    MODIFIER: "none",
    DESCRIPTION: "Scroll to top of content",
  },
  SCROLL_TO_BOTTOM: {
    KEY: "End",
    MODIFIER: "none",
    DESCRIPTION: "Scroll to bottom of content",
  },
  VIEW_MODE_EDIT: {
    KEY: "1",
    MODIFIER: "ctrl/cmd",
    DESCRIPTION: "Switch editor to Edit view",
  },
  VIEW_MODE_SPLIT: {
    KEY: "2",
    MODIFIER: "ctrl/cmd",
    DESCRIPTION: "Switch editor to Split view",
  },
  VIEW_MODE_PREVIEW: {
    KEY: "3",
    MODIFIER: "ctrl/cmd",
    DESCRIPTION: "Switch editor to Preview view",
  },
  SEARCH_SHORTCUTS: {
    KEY: "f",
    MODIFIER: "ctrl/cmd",
    DESCRIPTION: "Search keyboard shortcuts",
  },
} as const;

/**
 * View mode shortcut key mapping
 * Maps view mode identifiers to their keyboard shortcut keys.
 * Flexy says: No hardcoded "1"/"2"/"3" magic strings in EditorToolbar!
 */
export const VIEW_MODE_SHORTCUT_KEYS = {
  edit: "1",
  split: "2",
  preview: "3",
} as const;

/**
 * View mode shortcut modifier key
 * Flexy says: No hardcoded "cmd" strings in components!
 */
export const VIEW_MODE_MODIFIER = "cmd" as const;
