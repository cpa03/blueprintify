/**
 * Keyboard Shortcut Configuration Constants
 * Source of truth for keyboard shortcut definitions
 */

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
} as const;
