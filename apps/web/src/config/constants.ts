/**
 * Frontend configuration constants
 * Centralized location for all hardcoded values
 */

// Form validation limits
export const FORM_LIMITS = {
  PROJECT_NAME: {
    MIN: 1,
    MAX: 100,
    WARNING_THRESHOLD: 90,
  },
  DESCRIPTION: {
    MIN: 10,
    MAX: 2000,
  },
  TARGET_AUDIENCE: {
    MAX: 200,
  },
  CONSTRAINTS: {
    MAX: 1000,
  },
  FEATURE: {
    MAX: 100,
    MAX_COUNT: 20,
  },
} as const;

// Animation durations (in seconds)
export const ANIMATION = {
  FAST: 0.2,
  NORMAL: 0.3,
  SLOW: 0.5,
  STAGGER: 0.1,
} as const;

// Timeouts (in milliseconds)
export const TIMEOUTS = {
  COPY_FEEDBACK: 2000,
  DEBOUNCE: 300,
  GENERATION_CHECK: 100,
} as const;

// UI Configuration
export const UI = {
  MAX_TECH_STACK_SELECTION: 10,
  TOOLTIP_DELAY: 500,
  SCROLL_OFFSET: 100,
} as const;

// Step configuration
export const WIZARD_STEPS = [
  { key: "info", label: "Project Info", icon: "📝", shortcut: "1" },
  { key: "stack", label: "Tech Stack", icon: "⚙️", shortcut: "2" },
  { key: "features", label: "Features", icon: "✨", shortcut: "3" },
  { key: "review", label: "Review", icon: "👀", shortcut: "4" },
  { key: "generating", label: "Generate", icon: "🚀", shortcut: "5" },
] as const;
