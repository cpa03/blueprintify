/**
 * Share, Import, and Export Configuration Constants
 *
 * Sharing, importing, and exporting configuration including templates and error messages.
 * Flexy says: All messages reference @blueprint/shared as single source of truth!
 *
 * @module config/constants/share
 */

import {
  SHARE_DEFAULTS as SHARED_SHARE_DEFAULTS,
  ID_CHARS,
  SHARE_MESSAGES,
  STORAGE_ROUTE_MESSAGES,
  IMPORT_DEFAULTS as SHARED_IMPORT_DEFAULTS,
  SHARED_DEFAULTS,
  API_MESSAGES,
  EXPORT_MESSAGES,
} from "@blueprint/shared";

/**
 * Share link configuration.
 */
export const SHARE_CONFIG = {
  ID_LENGTH: SHARED_SHARE_DEFAULTS.ID_LENGTH,
  ALPHANUMERIC_CHARS: ID_CHARS.FULL,
  EXPIRATION_DAYS: SHARED_SHARE_DEFAULTS.EXPIRATION_DAYS,
  TITLE_MAX_LENGTH: SHARED_SHARE_DEFAULTS.TITLE_MAX_LENGTH,
  BLUEPRINT_MAX_LENGTH: SHARED_SHARE_DEFAULTS.BLUEPRINT_MAX_LENGTH,
} as const;

/**
 * Share route error messages.
 * Flexy says: References shared SHARE_MESSAGES — single source of truth!
 */
export const SHARE_ERROR_MESSAGES = {
  DATABASE_NOT_CONFIGURED: SHARE_MESSAGES.DATABASE_NOT_CONFIGURED,
  INVALID_SHARE_ID_FORMAT: SHARE_MESSAGES.INVALID_SHARE_ID_FORMAT,
  SHARE_NOT_FOUND_OR_EXPIRED: SHARE_MESSAGES.NOT_FOUND_OR_EXPIRED,
  SHARE_EXPIRED: SHARE_MESSAGES.EXPIRED,
  SHARE_DELETED_SUCCESSFULLY: SHARE_MESSAGES.DELETED_SUCCESSFULLY,
} as const;

/**
 * Storage route messages.
 * Flexy says: References shared STORAGE_ROUTE_MESSAGES — single source of truth!
 */
export const STORAGE_MESSAGES = {
  QUOTA_NOTE: STORAGE_ROUTE_MESSAGES.QUOTA_NOTE,
  CONFIRMATION_REQUIRED: STORAGE_ROUTE_MESSAGES.CONFIRMATION_REQUIRED,
  CLEAR_SUCCESS: STORAGE_ROUTE_MESSAGES.CLEAR_SUCCESS,
} as const;

/**
 * Import route configuration.
 * Flexy says: References shared IMPORT_DEFAULTS — single source of truth!
 */
export const IMPORT_CONFIG = {
  DEFAULT_PROJECT_NAME: SHARED_IMPORT_DEFAULTS.DEFAULT_PROJECT_NAME,
  EXPECTED_VERSION: SHARED_DEFAULTS.API_VERSION,
} as const;

/**
 * Import regex patterns.
 */
export const IMPORT_REGEX = {
  PROJECT_NAME: /^#[^#](.+)$/m,
  BLUEPRINT_SECTION: /## Blueprint\s*\n\n?([\s\S]*?)(?=\n## |$)/,
  TASKS_SECTION: /## Tasks\s*\n\n?([\s\S]*?)(?=\n## |$)/,
} as const;

/**
 * Import error messages.
 * Flexy says: References shared IMPORT_DEFAULTS — single source of truth!
 */
export const IMPORT_ERROR_MESSAGES = {
  MISSING_REQUIRED_FIELDS: SHARED_IMPORT_DEFAULTS.MISSING_REQUIRED_FIELDS,
  INVALID_JSON_FORMAT: SHARED_IMPORT_DEFAULTS.INVALID_JSON_FORMAT,
  MISSING_BLUEPRINT_CONTENT: SHARED_IMPORT_DEFAULTS.MISSING_BLUEPRINT_CONTENT,
  UNSUPPORTED_FORMAT: API_MESSAGES.UNSUPPORTED_IMPORT_FORMAT,
  IMPORT_FAILED: SHARED_IMPORT_DEFAULTS.IMPORT_FAILED,
} as const;

/**
 * Export error messages.
 * Flexy says: EXPORT_FAILED references shared EXPORT_MESSAGES — single source of truth!
 */
export const EXPORT_ERROR_MESSAGES = {
  UNSUPPORTED_FORMAT: API_MESSAGES.UNSUPPORTED_EXPORT_FORMAT,
  EXPORT_FAILED: EXPORT_MESSAGES.EXPORT_FAILED,
} as const;

/**
 * Export template builders.
 * Flexy says: No hardcoded template strings - everything in config!
 */
export const EXPORT_TEMPLATES = {
  MARKDOWN: {
    HEADER: (projectName: string): string => `# ${projectName}\n\n`,
    EXPORTED_LINE: (timestamp: string): string => `Exported: ${timestamp}\n\n`,
    BLUEPRINT_SECTION: (blueprint: string): string => `## Blueprint\n\n${blueprint}\n\n`,
    TASKS_SECTION: (tasks: string): string => `## Tasks\n\n${tasks}\n\n`,
  },
} as const;
