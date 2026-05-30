/**
 * Storage & Timing Configuration Constants
 * Source of truth for storage, timeout, debounce, toast, and auto-save configs
 */

import {
  DEBOUNCE_CONFIG as SHARED_DEBOUNCE_CONFIG,
  STORAGE_CONFIG as SHARED_STORAGE_CONFIG,
  TIME_UNITS,
} from "@blueprint/shared";
import { ENV } from "../env";
import { STORAGE_KEYS } from "../keys";

export { STORAGE_KEYS };

// ============================================================================
// Timeouts
// ============================================================================

/** Timeout durations (in milliseconds) */
export const TIMEOUTS = {
  COPY_FEEDBACK: 2000,
  DEBOUNCE: 300,
  GENERATION_CHECK: 100,
  TOAST_NOTIFICATION: 1500,
  SHAKE_ANIMATION: 400,
  FOCUS_DELAY: 100,
  LIVE_REGION_CLEAR: 1000,
  API_HEALTH_CHECK: 5000,
  API_CONNECTION: 30000,
  LAST_SAVED_REFRESH: 30000,
} as const;

// ============================================================================
// Debounce Configuration
// ============================================================================

/** Debounce delays for state persistence */
export const DEBOUNCE_CONFIG = {
  WIZARD: SHARED_DEBOUNCE_CONFIG.WIZARD_SAVE,
  EDITOR: SHARED_DEBOUNCE_CONFIG.EDITOR_SAVE,
} as const;

// ============================================================================
// Storage Configuration
// ============================================================================

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
  QUOTA_CACHE_TTL_MS: 5000,
  BROWSER_QUOTA_ERROR_CODES: { CHROME: 22, FIREFOX: 1014 } as const,
  /** Full quota recalculation interval in ms (10 minutes) */
  FULL_RECALCULATION_INTERVAL_MS: 10 * TIME_UNITS.MS_PER_SECOND * TIME_UNITS.SECONDS_PER_MINUTE,
};

// ============================================================================
// Toast Configuration
// ============================================================================

export const TOAST_CONFIG = {
  DEFAULT_DURATION: 3000,
  SUCCESS_DURATION: 2000,
  AUTO_SAVE_DURATION: 2000,
  /** Delay (ms) between each toast's entrance for staggered animation */
  STAGGER_MS: 60,
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

// ============================================================================
// Auto-Save Configuration
// ============================================================================

export const AUTO_SAVE_CONFIG = {
  DEFAULT_MESSAGE: "Changes saved",
  DEFAULT_DELAY: 1000,
} as const;

// ============================================================================
// Document Title Configuration
// ============================================================================

export const DOCUMENT_TITLE_CONFIG = {
  APP_NAME: ENV.APP_NAME,
  SEPARATOR: " | ",
  DEFAULT_TITLE: ENV.APP_NAME,
};

// ============================================================================
// Storage Error Messages
// ============================================================================

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
