import { ENV } from "./env";
import {
  VALIDATION_LIMITS,
  DEBOUNCE_CONFIG as SHARED_DEBOUNCE_CONFIG,
  STORAGE_CONFIG as SHARED_STORAGE_CONFIG,
  RETRYABLE_STATUS_CODES,
  SSE_CONFIG,
  HTTP_STATUS,
} from "@blueprint/shared";

/**
 * Frontend configuration constants
 * Centralized location for all hardcoded values
 */

export { VALIDATION_LIMITS } from "@blueprint/shared";

// Form validation limits derived from shared config
export const FORM_LIMITS = {
  PROJECT_NAME: {
    MIN: VALIDATION_LIMITS.PROJECT_NAME.MIN,
    MAX: VALIDATION_LIMITS.PROJECT_NAME.MAX,
    WARNING_THRESHOLD: 90,
  },
  DESCRIPTION: {
    MIN: VALIDATION_LIMITS.DESCRIPTION.MIN,
    MAX: VALIDATION_LIMITS.DESCRIPTION.MAX,
  },
  TARGET_AUDIENCE: {
    MAX: VALIDATION_LIMITS.TARGET_AUDIENCE.MAX,
  },
  CONSTRAINTS: {
    MAX: VALIDATION_LIMITS.CONSTRAINTS.MAX,
  },
  FEATURE: {
    MAX: VALIDATION_LIMITS.FEATURE.MAX,
    MAX_COUNT: VALIDATION_LIMITS.FEATURE.MAX_COUNT,
  },
} as const;

// Animation durations (in seconds)
export const ANIMATION = {
  FAST: 0.15,
  NORMAL: 0.2,
  MEDIUM: 0.3,
  SLOW: 0.5,
  STAGGER: 0.1,
  SPINNER_ROTATION: 1,
  TYPING_INDICATOR_DELAY_S: 0.6,
} as const;

// Animation durations (in milliseconds)
export const ANIMATION_MS = {
  TYPING_INDICATOR_DELAY: 600,
  TYPING_INDICATOR_TIMEOUT: 800,
  CHIP_SELECT_FEEDBACK: 600,
  INPUT_TYPING_DELAY: 800,
} as const;

// Celebration animation timing (in milliseconds)
export const CELEBRATION_TIMING = {
  /** Duration for reduced motion checkmark display */
  REDUCED_MOTION_DISPLAY: 1500,
  /** Duration before particles fade out */
  PARTICLE_FADEOUT: 2000,
  /** Duration before completion callback is called */
  COMPLETION_DELAY: 2500,
} as const;

/**
 * Spring configurations for Framer Motion animations
 *
 * Usage:
 * - DEFAULT: Standard spring for most UI elements
 * - REDUCED_MOTION: Fast, minimal motion for accessibility
 * - SNAPPY: Quick response for interactive elements
 * - GENTLE: Slower, more relaxed animations
 * - BOUNCY: Playful bounce effect
 * - SUBTLE_BOUNCE: Light bounce for chip/tag selection
 */
export const SPRING_CONFIG = {
  /** Standard spring - balanced response for most UI elements */
  DEFAULT: { stiffness: 400, damping: 25, mass: 0.8 },
  /** Minimal motion - fast settle for accessibility */
  REDUCED_MOTION: { stiffness: 1000, damping: 100, mass: 0.1 },
  /** Quick response - for buttons, toggles, interactive elements */
  SNAPPY: { stiffness: 500, damping: 25, mass: 0.8 },
  /** Relaxed motion - for modals, panels, large elements */
  GENTLE: { stiffness: 400, damping: 30, mass: 0.8 },
  /** Playful bounce - for celebrations, success states */
  BOUNCY: { stiffness: 400, damping: 10, mass: 0.8 },
  /** Light bounce - for chip selection, item add animations */
  SUBTLE_BOUNCE: { stiffness: 400, damping: 17, mass: 0.8 },
  /** Very gentle - for progress indicators, smooth transitions */
  SLOW: { stiffness: 100, damping: 20, mass: 0.8 },
} as const;

// Timeouts (in milliseconds)
export const TIMEOUTS = {
  COPY_FEEDBACK: 2000,
  DEBOUNCE: 300,
  GENERATION_CHECK: 100,
  TOAST_NOTIFICATION: 1500,
  SHAKE_ANIMATION: 400,
  FOCUS_DELAY: 100,
  LIVE_REGION_CLEAR: 1000,
  API_HEALTH_CHECK: 5000,
  /** Timeout for establishing initial API connection (not streaming duration) */
  API_CONNECTION: 30000,
  /** Default interval for "last saved" display refresh */
  LAST_SAVED_REFRESH: 30000,
} as const;

// Debounce configuration for state persistence (uses shared config)
export const DEBOUNCE_CONFIG = {
  WIZARD: SHARED_DEBOUNCE_CONFIG.WIZARD_SAVE,
  EDITOR: SHARED_DEBOUNCE_CONFIG.EDITOR_SAVE,
} as const;

export const STORAGE_CONFIG = {
  MAX_BACKUP_ENTRIES: 5,
  get QUOTA_MB(): number {
    return ENV.STORAGE_QUOTA_MB;
  },
  get QUOTA_BYTES(): number {
    return SHARED_STORAGE_CONFIG.QUOTA_BYTES;
  },
  QUOTA_WARNING_THRESHOLD_KB: 1,
  MAX_LATENCY_MEASUREMENTS: 100,
  DEFAULT_MAX_RETRIES: 3,
  DEFAULT_RETRY_DELAY_MS: 100,
  /** Percentage threshold for health check warnings */
  HEALTH_THRESHOLD_PERCENT: 90,
  /** DOMException error codes for privacy mode detection */
  PRIVACY_MODE_ERROR_CODES: [22, 1014] as readonly number[],
};

// UI Configuration
export const UI = {
  MAX_TECH_STACK_SELECTION: VALIDATION_LIMITS.TECH_STACK.MAX,
  TOOLTIP_DELAY: 500,
  SCROLL_OFFSET: 100,
  SCROLL_TO_TOP_THRESHOLD: 600,
} as const;

// Tooltip configuration
export const TOOLTIP_CONFIG = {
  /** Default delay before tooltip appears (ms) */
  DEFAULT_DELAY: 500,
  /** Delay for keyboard shortcut tooltips (ms) */
  KEYBOARD_SHORTCUT_DELAY: 300,
  /** Delay for info tooltips (ms) */
  INFO_DELAY: 200,
  /** Default hide delay for smart tooltips (ms) */
  DEFAULT_HIDE_DELAY: 100,
  /** Default show delay for smart tooltips (ms) */
  DEFAULT_SHOW_DELAY: 400,
  /** Default max width for tooltips (px) */
  DEFAULT_MAX_WIDTH: 320,
  /** Max width for info tooltips (px) */
  INFO_MAX_WIDTH: 280,
  /** Estimated tooltip height for position calculation (px) */
  ESTIMATED_HEIGHT: 60,
  /** Viewport padding for tooltip positioning (px) */
  VIEWPORT_PADDING: 16,
  /** Auto-hide delay for touch devices (ms) */
  TOUCH_AUTO_HIDE_DELAY: 3000,
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

// UI emoji constants - centralized for consistency
// Used across components for consistent emoji rendering
export const UI_EMOJIS = {
  /** Document/editing icon */
  DOCUMENT: "📝",
  /** Blank document icon */
  DOCUMENT_BLANK: "📄",
  /** Settings/gear icon */
  SETTINGS: "⚙️",
} as const;

// Minimum requirements
export const MIN_REQUIREMENTS = {
  TECH_STACK: 1,
  PROJECT_NAME: 1,
  DESCRIPTION: 10,
} as const;

export { RETRYABLE_STATUS_CODES, SSE_CONFIG, HTTP_STATUS };

// Export configuration
export const EXPORT_CONFIG = {
  ZIP_COMPRESSION_LEVEL: 6,
  COPY_TEXTAREA_OFFSET: -9999,
} as const;

// Suggested features for quick add
export const SUGGESTED_FEATURES = [
  "User authentication",
  "Database integration",
  "API endpoints",
  "Real-time updates",
  "File uploads",
  "Search functionality",
  "Email notifications",
  "Admin dashboard",
  "Payment processing",
  "Analytics tracking",
] as const;

// Generation timing estimates
export const GENERATION_ESTIMATES = {
  TYPICAL_DURATION_SECONDS: "30-60",
  SHORT: "15-30",
  LONG: "60-90",
} as const;

/**
 * API Error Messages
 *
 * These messages are displayed to users when API calls fail.
 * Messages are designed to be user-friendly while providing enough
 * context for developers to debug issues.
 *
 * @see apps/api/src/errors.ts - Corresponding server-side error definitions
 */
export const API_ERROR_MESSAGES = {
  /** Blueprint generation failed - typically AI service or validation issue */
  GENERATION_FAILED: "Generation failed. Please check your input and try again.",
  /** Task generation failed - usually missing blueprint content or AI error */
  TASK_GENERATION_FAILED: "Task generation failed. Ensure blueprint content is valid.",
  /** Content refinement failed - AI service or validation issue */
  REFINEMENT_FAILED: "Refinement failed. Please check your refinement instructions.",
  /** Server returned empty response - indicates server or network issue */
  NO_RESPONSE_BODY: "Server returned empty response. Check if API server is running.",
  /** SSE stream interrupted - network or server timeout issue */
  STREAM_ERROR: "Connection interrupted. Check your network and try again.",
} as const;

// Editor tab constants
export const EDITOR_TABS = {
  BLUEPRINT: "blueprint",
  TASKS: "tasks",
} as const;

// Export README template
export const README_TEMPLATE = (projectName: string): string => {
  const homepageUrl = ENV.PROJECT_HOMEPAGE_URL;
  return `# ${projectName} - Documentation

This folder contains AI-generated documentation for your project.

## Files

- **blueprint.md** - Architectural blueprint and technical specifications
- **task.md** - Prioritized task breakdown for implementation

## Usage

These files are designed for use with autonomous development agents.
Place this .docs folder in your project root to enable agent-assisted development.

---
Generated by [${ENV.APP_NAME}](${homepageUrl})
Generated at: ${new Date().toISOString()}
`;
};

// Default project name fallback
export const DEFAULT_PROJECT_NAME = ENV.DEFAULT_PROJECT_NAME;

// API endpoints
export const API_ENDPOINTS = {
  GENERATE: "/generate",
  TASKS: "/tasks",
  REFINE: "/refine",
  HEALTH: "/",
} as const;

// Toast configuration
export const TOAST_CONFIG = {
  DEFAULT_DURATION: 3000,
  SUCCESS_DURATION: 2000,
  AUTO_SAVE_DURATION: 2000,
  ICONS: {
    SUCCESS: "✓",
    ERROR: "✕",
    WARNING: "⚠",
    INFO: "ℹ",
  } as const,
  STYLES: {
    SUCCESS: "bg-accent-emerald/10 border-accent-emerald/30 text-accent-emerald",
    ERROR: "bg-accent-pink/10 border-accent-pink/30 text-accent-pink",
    WARNING: "bg-yellow-500/10 border-yellow-500/30 text-yellow-400",
    INFO: "bg-primary-500/10 border-primary-500/30 text-primary-300",
  } as const,
} as const;

// Auto-save configuration
export const AUTO_SAVE_CONFIG = {
  DEFAULT_MESSAGE: "Changes saved",
  DEFAULT_DELAY: 1000,
} as const;

// Document title configuration
export const DOCUMENT_TITLE_CONFIG = {
  APP_NAME: ENV.APP_NAME,
  SEPARATOR: " | ",
  DEFAULT_TITLE: ENV.APP_NAME,
};

// Re-export storage keys from keys.ts for backward compatibility
export { STORAGE_KEYS } from "./keys";

// Generation messages
export const GENERATION_MESSAGES = {
  CANCELLED: "Generation cancelled",
  BLUEPRINT_START: "Generating blueprint...",
  BLUEPRINT_COMPLETE: "Blueprint complete. Generating tasks...",
  COMPLETE: "Complete!",
  RETRY: (attempt: number, maxRetries: number) =>
    `Connection issue, retrying (${attempt}/${maxRetries})...`,
  ERROR: (error: string) => `Error: ${error}`,
  ERROR_TASKS: (error: string) => `Error generating tasks: ${error}`,
} as const;

// UI Content - Text content for the application
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

// Validation messages
export const VALIDATION_MESSAGES = {
  DESCRIPTION_MIN_LENGTH: (min: number) => `Description must be at least ${min} characters`,
  APPROACHING_CHARACTER_LIMIT: "Approaching character limit",
  CHARACTERS_NEEDED: (count: number) => `${count} more characters needed`,
} as const;

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
} as const;

// CSS Class combinations for common patterns
export const CSS_CLASSES = {
  GLASS_CARD: "glass-card",
  BTN_PRIMARY: "btn-primary",
  BTN_GHOST: "btn-ghost",
  TEXT_GRADIENT: "text-gradient",
  ANIMATED_SPINNER: "animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500",
} as const;

// Focusable element selectors for accessibility
// Used by focus trap and focus management hooks
export const FOCUSABLE_SELECTORS = [
  'button:not([disabled]):not([aria-hidden="true"])',
  'a[href]:not([aria-hidden="true"])',
  'input:not([disabled]):not([type="hidden"]):not([aria-hidden="true"])',
  'select:not([disabled]):not([aria-hidden="true"])',
  'textarea:not([disabled]):not([aria-hidden="true"])',
  '[tabindex]:not([tabindex="-1"]):not([disabled]):not([aria-hidden="true"])',
  '[contenteditable]:not([aria-hidden="true"])',
] as const;

// Combined selector string for querySelector usage
export const FOCUSABLE_SELECTOR_STRING = FOCUSABLE_SELECTORS.join(", ");

// Celebration colors for particle animations
// Used by celebration and copy button animations
export const CELEBRATION_COLORS = [
  "#10b981", // emerald-500
  "#34d399", // emerald-400
  "#6ee7b7", // emerald-300
  "#6366f1", // indigo-500
  "#818cf8", // indigo-400
  "#a78bfa", // violet-400
  "#f472b6", // pink-400
  "#fbbf24", // amber-400
] as const;

// Animation colors for value change indicators
// Matches Tailwind theme tokens: accent.emerald and accent.pink
export const ANIMATION_COLORS = {
  /** Positive value change (green) - matches accent.emerald */
  POSITIVE: "#10b981",
  /** Negative value change (rose) - matches rose-500 */
  NEGATIVE: "#f43f5e",
} as const;

// Progress indicator colors
// Used by CircularProgress component in StepIndicator
export const PROGRESS_COLORS = {
  /** Completed state - matches accent.emerald (emerald-500) */
  COMPLETED: "#10b981",
  /** Active/in-progress state - matches primary-500 (indigo-500) */
  ACTIVE: "#6366f1",
} as const;

// External URLs used throughout the application
export const EXTERNAL_URLS = {
  GITHUB: ENV.GITHUB_URL,
  PROJECT_HOMEPAGE: ENV.PROJECT_HOMEPAGE_URL,
};

// UI Fallback values for environment-dependent configs
export const UI_FALLBACKS = {
  API_BASE: ENV.API_BASE_URL,
};

/**
 * Ripple animation configuration
 * Used by RippleButton component for click feedback animations
 */
export const RIPPLE_CONFIG = {
  /** Duration in ms before ripple is removed from DOM */
  REMOVAL_DELAY_MS: 600,
  /** Transition duration in seconds for ripple animation */
  TRANSITION_DURATION_S: 0.6,
  /** Ripple element size in pixels */
  SIZE_PX: 20,
  /** Negative margin offset (half of size) for centering */
  MARGIN_OFFSET_PX: -10,
  /** Initial opacity for ripple */
  INITIAL_OPACITY: 0.5,
  /** Final scale value for ripple animation */
  FINAL_SCALE: 4,
} as const;

/**
 * Particle animation configuration
 * Used by AnimatedCopyButton for celebration particles
 */
export const PARTICLE_CONFIG = {
  /** Number of particles to create on copy */
  COUNT: 12,
  /** Base distance for particle movement in pixels */
  BASE_DISTANCE_PX: 30,
  /** Random distance variation in pixels */
  RANDOM_DISTANCE_PX: 20,
  /** Base particle duration in ms */
  BASE_DURATION_MS: 400,
  /** Random duration variation in ms */
  RANDOM_DURATION_MS: 200,
  /** Cleanup timeout in ms after particles are created */
  CLEANUP_DELAY_MS: 700,
  /** Base particle size in pixels */
  BASE_SIZE_PX: 3,
  /** Random size variation in pixels */
  RANDOM_SIZE_PX: 3,
} as const;

/**
 * Skeleton loader configuration
 * Used during initial app load for smooth transition
 */
export const SKELETON_CONFIG = {
  /** Fade out transition duration in ms */
  FADEOUT_MS: 300,
} as const;

// ============================================================================
// Security Error Messages
// ============================================================================

/**
 * Security validation error messages
 * Centralized messages for XSS, file, and content validation errors
 * Flexy says: No hardcoded strings - everything configurable!
 */
export const SECURITY_ERROR_MESSAGES = {
  /** Generic content validation failure */
  CONTENT_VALIDATION_FAILED: "Content validation failed",
  /** XSS patterns detected in content */
  XSS_PATTERNS_DETECTED:
    "Content contains potentially dangerous XSS patterns. This may include script tags, event handlers, or javascript: URLs. Please remove any embedded scripts or suspicious HTML.",
  /** Other content dangerous patterns */
  XSS_DANGEROUS_PATTERNS: "Content contains potentially dangerous patterns",
  /** CodeMirror-specific dangerous patterns */
  CODEMIRROR_DANGEROUS_PATTERNS:
    "Content contains CodeMirror-specific dangerous patterns (data: URLs, vbscript, CSS expressions, or IE-specific behaviors). These are blocked for security reasons.",
  /** File type not allowed */
  FILE_TYPE_NOT_ALLOWED: (extension: string, allowedTypes: string) =>
    `File type ${extension} is not allowed. Allowed types: ${allowedTypes}`,
  /** File size exceeds limit */
  FILE_SIZE_EXCEEDED: (maxSizeMB: number) =>
    `File size exceeds maximum allowed size of ${maxSizeMB}MB`,
  /** File validation fallback */
  FILE_VALIDATION_FAILED: "File validation failed",
  /** Prototype pollution detected */
  PROTOTYPE_POLLUTION_DETECTED: "JSON contains potential prototype pollution vulnerabilities",
  /** JSON depth exceeded */
  JSON_DEPTH_EXCEEDED: (maxDepth: number) =>
    `JSON object depth exceeds maximum allowed limit (${maxDepth})`,
  /** Suspicious keys found in JSON */
  JSON_SUSPICIOUS_KEYS: (keys: string) => `JSON contains suspicious keys: ${keys}`,
  /** Invalid JSON format */
  INVALID_JSON_FORMAT: "Invalid JSON format",
  /** Storage quota exceeded */
  STORAGE_QUOTA_EXCEEDED: "Storage quota exceeded. Please clear some data.",
  /** Unknown security error */
  UNKNOWN_SECURITY_ERROR: "Unknown security error",
} as const;

// ============================================================================
// Storage Error Messages
// ============================================================================

/**
 * Storage operation error messages
 * Centralized messages for localStorage operations
 */
export const STORAGE_ERROR_MESSAGES = {
  LOAD_FAILED: "Failed to load state from storage",
  SAVE_FAILED: "Failed to save state to storage",
  CLEAR_FAILED: "Failed to clear storage",
  READ_FAILED: "Failed to read from storage",
  WRITE_FAILED: "Failed to write to storage",
  REMOVE_FAILED: "Failed to remove from storage",
  CLEAR_STORAGE_FAILED: "Failed to clear storage",
  BACKUP_FAILED: "Failed to create backup",
  RECOVERY_FAILED: "Recovery failed",
  RECOVERY_SUCCESS: (timestamp: number) =>
    `Successfully recovered from backup created at ${new Date(timestamp)}`,
  OPERATION_FAILED: (operation: string) => `Storage ${operation} failed`,
  STORAGE_UNSUPPORTED: "localStorage is not supported in this browser",
  PRIVACY_MODE: "Storage is unavailable in private browsing mode",
  QUOTA_EXCEEDED: "Storage quota exceeded",
  DATA_CORRUPTED: "Stored data appears to be corrupted. Attempting recovery...",
  BROWSER_UNSUPPORTED: "Your browser does not support local storage.",
  PRIVACY_MODE_MSG: "Storage is unavailable in private browsing mode.",
  VALIDATION_FAILED: "Data validation failed.",
  MIGRATION_FAILED: "Data migration failed. Please clear storage and try again.",
  UNEXPECTED_ERROR: "An unexpected storage error occurred.",
  STORAGE_FULL: "Storage is full. Please clear some data and try again.",
  SERVICE_EXISTS: (key: string) => `Storage service for key "${key}" already exists`,
} as const;

// ============================================================================
// API Error Messages (supplemental - frontend specific)
// ============================================================================

export const FRONTEND_ERROR_MESSAGES = {
  UNKNOWN_ERROR: "Unknown error",
} as const;
