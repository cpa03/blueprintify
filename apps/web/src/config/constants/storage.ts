/**
 * Storage & Timing Configuration Constants
 * Source of truth for storage, timeout, debounce, toast, and auto-save configs
 */

import {
  DEBOUNCE_CONFIG as SHARED_DEBOUNCE_CONFIG,
  STORAGE_CONFIG as SHARED_STORAGE_CONFIG,
  TIME_UNITS,
  BROWSER_QUOTA_ERROR_CODES as SHARED_BROWSER_QUOTA_ERROR_CODES,
  UI_MESSAGES,
  STORAGE_ERROR_MESSAGES as SHARED_STORAGE_ERROR_MESSAGES,
  STORAGE_OPERATION_ERROR_STRINGS,
  UI_TIMEOUTS as SHARED_UI_TIMEOUTS,
  TOAST_ICONS,
  TOAST_STYLES,
} from "@blueprint/shared";
import { ENV } from "../env";
import { STORAGE_KEYS } from "../keys";

export { STORAGE_KEYS };

// ============================================================================
// Timeouts
// ============================================================================

/**
 * Timeout durations (in milliseconds)
 * Flexy says: Single source of truth in @blueprint/shared!
 */
export const TIMEOUTS = {
  COPY_FEEDBACK: SHARED_UI_TIMEOUTS.COPY_FEEDBACK,
  DEBOUNCE: SHARED_UI_TIMEOUTS.DEBOUNCE,
  GENERATION_CHECK: SHARED_UI_TIMEOUTS.GENERATION_CHECK,
  TOAST_NOTIFICATION: SHARED_UI_TIMEOUTS.TOAST_NOTIFICATION,
  SHAKE_ANIMATION: SHARED_UI_TIMEOUTS.SHAKE_ANIMATION,
  FOCUS_DELAY: SHARED_UI_TIMEOUTS.FOCUS_DELAY,
  LIVE_REGION_CLEAR: SHARED_UI_TIMEOUTS.LIVE_REGION_CLEAR,
  API_HEALTH_CHECK: SHARED_UI_TIMEOUTS.API_HEALTH_CHECK,
  API_CONNECTION: SHARED_UI_TIMEOUTS.API_CONNECTION,
  LAST_SAVED_REFRESH: SHARED_UI_TIMEOUTS.LAST_SAVED_REFRESH,
  STEP_COMPLETE_FLASH: SHARED_UI_TIMEOUTS.STEP_COMPLETE_FLASH,
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
  BROWSER_QUOTA_ERROR_CODES: SHARED_BROWSER_QUOTA_ERROR_CODES,
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
  /** Flexy says: Single source of truth in @blueprint/shared! */
  ICONS: TOAST_ICONS,
  /** Flexy says: Single source of truth in @blueprint/shared! */
  STYLES: TOAST_STYLES,
} as const;

// ============================================================================
// Auto-Save Configuration
// ============================================================================

export const AUTO_SAVE_CONFIG = {
  DEFAULT_MESSAGE: UI_MESSAGES.CHANGES_SAVED,
  DEFAULT_DELAY: 1000,
} as const;

// ============================================================================
// Document Title Configuration
// ============================================================================

export const DOCUMENT_TITLE_CONFIG = {
  APP_NAME: ENV.APP_NAME,
  SEPARATOR: UI_MESSAGES.TITLE_SEPARATOR,
  DEFAULT_TITLE: ENV.APP_NAME,
};

// ============================================================================
// Storage Error Messages
// ============================================================================

export const STORAGE_ERROR_MESSAGES = {
  LOAD_FAILED: SHARED_STORAGE_ERROR_MESSAGES.LOAD_FAILED,
  SAVE_FAILED: SHARED_STORAGE_ERROR_MESSAGES.SAVE_FAILED,
  CLEAR_FAILED: SHARED_STORAGE_ERROR_MESSAGES.CLEAR_FAILED,
  READ_FAILED: SHARED_STORAGE_ERROR_MESSAGES.READ_FAILED,
  WRITE_FAILED: SHARED_STORAGE_ERROR_MESSAGES.WRITE_FAILED,
  REMOVE_FAILED: SHARED_STORAGE_ERROR_MESSAGES.REMOVE_FAILED,
  BACKUP_FAILED: SHARED_STORAGE_ERROR_MESSAGES.BACKUP_FAILED,
  RECOVERY_FAILED: SHARED_STORAGE_ERROR_MESSAGES.RECOVERY_FAILED,
  RECOVERY_SUCCESS: STORAGE_OPERATION_ERROR_STRINGS.RECOVERY_SUCCESS,
  OPERATION_FAILED: STORAGE_OPERATION_ERROR_STRINGS.OPERATION_FAILED,
  STORAGE_UNSUPPORTED: SHARED_STORAGE_ERROR_MESSAGES.STORAGE_UNSUPPORTED,
  PRIVACY_MODE: SHARED_STORAGE_ERROR_MESSAGES.PRIVACY_MODE,
  QUOTA_EXCEEDED: SHARED_STORAGE_ERROR_MESSAGES.QUOTA_EXCEEDED,
  DATA_CORRUPTED: SHARED_STORAGE_ERROR_MESSAGES.DATA_CORRUPTED,
  BROWSER_UNSUPPORTED: SHARED_STORAGE_ERROR_MESSAGES.BROWSER_UNSUPPORTED,
  VALIDATION_FAILED: SHARED_STORAGE_ERROR_MESSAGES.VALIDATION_FAILED,
  MIGRATION_FAILED: SHARED_STORAGE_ERROR_MESSAGES.MIGRATION_FAILED,
  UNEXPECTED_ERROR: SHARED_STORAGE_ERROR_MESSAGES.UNEXPECTED_ERROR,
  STORAGE_FULL: SHARED_STORAGE_ERROR_MESSAGES.STORAGE_FULL,
  SERVICE_EXISTS: STORAGE_OPERATION_ERROR_STRINGS.SERVICE_EXISTS,
} as const;
