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

// Tech stack category icons
export const CATEGORY_ICONS: Record<string, string> = {
  frontend: "🎨",
  backend: "⚙️",
  database: "🗄️",
  hosting: "☁️",
  styling: "🖌️",
  ai: "🤖",
  testing: "🧪",
  other: "📦",
} as const;

// Minimum requirements
export const MIN_REQUIREMENTS = {
  TECH_STACK: 1,
  PROJECT_NAME: 1,
  DESCRIPTION: 10,
} as const;

// HTTP Status codes for retry logic
export const RETRYABLE_STATUS_CODES = [408, 429, 500, 502, 503, 504] as const;

// Export configuration
export const EXPORT_CONFIG = {
  ZIP_COMPRESSION_LEVEL: 6,
  COPY_TEXTAREA_OFFSET: -9999,
} as const;

// Suggested features for quick-add
export const SUGGESTED_FEATURES = [
  "User authentication",
  "Admin dashboard",
  "API documentation",
  "Unit tests",
  "CI/CD pipeline",
  "Docker support",
  "Rate limiting",
  "Logging & monitoring",
  "Email notifications",
  "File uploads",
  "Search functionality",
  "Dark mode",
] as const;
