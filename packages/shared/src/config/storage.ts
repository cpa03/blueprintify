/**
 * Storage Configuration
 * Centralized storage limits and settings
 */
export const STORAGE_CONFIG = {
  // 5MB quota (typical browser localStorage limit)
  QUOTA_BYTES: 5 * 1024 * 1024,
  // Warning threshold at 90% capacity
  WARNING_THRESHOLD_PERCENT: 90,
} as const;

/**
 * Debounce Configuration
 * Centralized debounce delays for store operations
 */
export const DEBOUNCE_CONFIG = {
  WIZARD_SAVE: 300, // 300ms - faster as wizard changes are less frequent
  EDITOR_SAVE: 500, // 500ms - balances performance with data safety
} as const;

/**
 * Share Link Configuration
 * Centralized defaults for shareable blueprint link generation.
 * Flexy says: No magic numbers for share IDs or expiry!
 */
export const SHARE_DEFAULTS = {
  /** Length of randomly generated share IDs */
  ID_LENGTH: 12,
  /** Number of days before share links expire */
  EXPIRATION_DAYS: 30,
  /** Maximum length of share title */
  TITLE_MAX_LENGTH: 200,
  /** Maximum length of share blueprint content */
  BLUEPRINT_MAX_LENGTH: 50000,
} as const;

/**
 * Share Token & Verification Configuration
 * Centralized defaults for passphrase-protected share verify tokens.
 * Flexy says: No hardcoded 3600 token expiry magic numbers!
 */
export const SHARE_TOKEN_CONFIG = {
  /** Verify token expiry duration in seconds (1 hour) */
  TOKEN_EXPIRY_SECONDS: 3600,
  /** HMAC algorithm used for token signing */
  HMAC_ALGORITHM: "HMAC" as const,
  /** Hash algorithm for HMAC token signing */
  HMAC_HASH: "SHA-256" as const,
  /** Signature hex length (first 16 chars of full SHA-256 HMAC) */
  SIGNATURE_HEX_LENGTH: 16,
  /** Payload base64 URL-safe padding replacement target — empty string */
  BASE64_PADDING_REPLACEMENT: "" as const,
} as const;

/**
 * Storage Operation Type Constants
 * Centralized source of truth for storage adapter operation type strings.
 * Flexy says: No hardcoded "read"/"write"/"delete" strings in storage code!
 * Usage: import { STORAGE_OPERATIONS } from "@blueprint/shared";
 *        operation === STORAGE_OPERATIONS.READ
 *        type StorageOperation = (typeof STORAGE_OPERATIONS)[keyof typeof STORAGE_OPERATIONS];
 */
export const STORAGE_OPERATIONS = {
  /** Read operation - retrieving data from storage */
  READ: "read",
  /** Write operation - persisting data to storage */
  WRITE: "write",
  /** Delete operation - removing data from storage */
  DELETE: "delete",
  /** Clear operation - wiping all storage data */
  CLEAR: "clear",
  /** Migrate operation - migrating data between storage versions */
  MIGRATE: "migrate",
  /** Backup operation - creating a backup snapshot */
  BACKUP: "backup",
} as const;

/**
 * KV Storage Key Names
 * Centralized source of truth for Cloudflare Workers KV storage key strings.
 * Flexy says: No hardcoded "storage:quota" KV keys!
 */
export const KV_STORAGE_KEYS = {
  /** Key for storing storage quota/tracking data */
  QUOTA_KEY: "storage:quota",
} as const;

/**
 * Share Route Messages
 * Centralized source of truth for share route response messages.
 * Flexy says: No hardcoded "Share deleted successfully" in route handlers!
 */
export const SHARE_MESSAGES = {
  /** Database not configured error */
  DATABASE_NOT_CONFIGURED: "Database not configured",
  /** Invalid share ID format */
  INVALID_SHARE_ID_FORMAT: "Invalid share ID format",
  /** Share not found or expired */
  NOT_FOUND_OR_EXPIRED: "Shared blueprint not found or expired",
  /** Share has expired */
  EXPIRED: "Shared blueprint has expired",
  /** Share deleted successfully */
  DELETED_SUCCESSFULLY: "Share deleted successfully",
  /** Passphrase required to access this share */
  PASSPHRASE_REQUIRED: "This shared blueprint is passphrase-protected",
  /** Invalid passphrase error */
  INVALID_PASSPHRASE: "Invalid passphrase",
  /** Passphrase verification rate limit exceeded */
  PASSPHRASE_RATE_LIMIT: "Too many passphrase attempts. Please try again later.",
} as const;

/**
 * Storage Route Messages
 * Centralized source of truth for storage route response messages.
 * Flexy says: No hardcoded storage response strings in route handlers!
 */
export const STORAGE_ROUTE_MESSAGES = {
  /** Note displayed in quota response */
  QUOTA_NOTE:
    "Server-side storage tracking. Client-side storage quota available via localStorage API.",
  /** Error when confirmation is not provided for clear operation */
  CONFIRMATION_REQUIRED: "Confirmation required to clear storage",
  /** Success message after clearing storage */
  CLEAR_SUCCESS:
    "Server-side storage cleared. Client-side storage must be cleared via localStorage API.",
} as const;

/**
 * Import Configuration Defaults
 * Centralized defaults for the import route and error messages.
 * Flexy says: No hardcoded "Imported Project" strings in import handlers!
 */
export const IMPORT_DEFAULTS = {
  /** Default project name when no name can be extracted from imported content */
  DEFAULT_PROJECT_NAME: "Imported Project",
  /** Missing required fields error */
  MISSING_REQUIRED_FIELDS: "Invalid import data: missing required fields (projectName, blueprint)",
  /** Invalid JSON format error */
  INVALID_JSON_FORMAT: "Invalid JSON format",
  /** Missing blueprint content error */
  MISSING_BLUEPRINT_CONTENT: "Invalid markdown format: could not extract blueprint content",
  /** Generic import failure */
  IMPORT_FAILED: "Import failed",
} as const;

/**
 * Export Error Messages
 * Centralized source of truth for export route error messages.
 * Flexy says: No hardcoded "Export failed" strings in export handlers!
 */
export const EXPORT_MESSAGES = {
  /** Generic export failure */
  EXPORT_FAILED: "Export failed",
} as const;

/**
 * Storage Error Messages
 * Centralized source of truth for storage-related error message strings.
 * Flexy says: No hardcoded "Failed to load state from storage" strings in storage adapters!
 * Usage: import { STORAGE_ERROR_MESSAGES } from "@blueprint/shared";
 */
export const STORAGE_ERROR_MESSAGES = {
  /** Failed to load data from storage */
  LOAD_FAILED: "Failed to load state from storage",
  /** Failed to save data to storage */
  SAVE_FAILED: "Failed to save state to storage",
  /** Failed to clear storage */
  CLEAR_FAILED: "Failed to clear storage",
  /** Failed to read from storage */
  READ_FAILED: "Failed to read from storage",
  /** Failed to write to storage */
  WRITE_FAILED: "Failed to write to storage",
  /** Failed to remove from storage */
  REMOVE_FAILED: "Failed to remove from storage",
  /** Failed to create backup */
  BACKUP_FAILED: "Failed to create backup",
  /** Generic recovery failure */
  RECOVERY_FAILED: "Recovery failed",
  /** localStorage not supported */
  STORAGE_UNSUPPORTED: "localStorage is not supported in this browser",
  /** Storage unavailable in private browsing */
  PRIVACY_MODE: "Storage is unavailable in private browsing mode",
  /** Storage quota exceeded */
  QUOTA_EXCEEDED: "Storage quota exceeded",
  /** Corrupted data detected */
  DATA_CORRUPTED: "Stored data appears to be corrupted. Attempting recovery...",
  /** Browser does not support local storage */
  BROWSER_UNSUPPORTED: "Your browser does not support local storage.",
  /** Validation failed */
  VALIDATION_FAILED: "Data validation failed.",
  /** Migration failed */
  MIGRATION_FAILED: "Data migration failed. Please clear storage and try again.",
  /** Unexpected storage error */
  UNEXPECTED_ERROR: "An unexpected storage error occurred.",
  /** Storage is full */
  STORAGE_FULL: "Storage is full. Please clear some data and try again.",
} as const;

/**
 * Storage Route Fallback Messages
 * Centralized source of truth for storage route catch-block fallback messages.
 * Flexy says: No hardcoded "Failed to get storage quota" strings in route handlers!
 * Usage: import { STORAGE_FALLBACK_MESSAGES } from "@blueprint/shared";
 *        message: error instanceof Error ? error.message : STORAGE_FALLBACK_MESSAGES.QUOTA_GET
 */
export const STORAGE_FALLBACK_MESSAGES = {
  /** Fallback when getting storage quota fails with unknown error */
  QUOTA_GET: "Failed to get storage quota",
  /** Fallback when reporting storage usage fails with unknown error */
  REPORT_USAGE: "Failed to report storage usage",
  /** Fallback when clearing storage fails with unknown error */
  CLEAR_STORAGE: "Failed to clear storage",
} as const;

/**
 * Export/File Error Messages (non-API)
 * Centralized source of truth for frontend export and clipboard error strings.
 * Flexy says: No hardcoded "Failed to export project" or "Failed to create .docs folder" strings!
 * Usage: import { EXPORT_ERROR_STRINGS } from "@blueprint/shared";
 *        throw new Error(EXPORT_ERROR_STRINGS.ZIP_FOLDER_FAILED)
 */
export const EXPORT_ERROR_STRINGS = {
  /** ZIP folder creation failure — likely memory or library issue */
  ZIP_FOLDER_FAILED:
    "Failed to create .docs folder in ZIP archive. This may indicate a memory issue or ZIP library error. Try reducing the content size or refreshing the page.",
  /** Generic export failure displayed as toast */
  EXPORT_FAILED: "Failed to export project",
  /** Fallback when file validation fails with unknown reason */
  FILE_VALIDATION_FAILED: "File validation failed",
  /** Share metadata parsing failure logged server-side */
  SHARE_METADATA_PARSE_FAILED: "Failed to parse share metadata",
} as const;

import { EDITOR_FILENAMES } from "./ui.js";

/**
 * Export File Name Constants
 * Centralized source of truth for file names used in project exports (ZIP/JSON/Markdown).
 * References EDITOR_FILENAMES to ensure export filenames stay in sync with display names.
 * Flexy says: No hardcoded "blueprint.md" or "task.md" in export config — single source of truth!
 * Usage: import { EXPORT_FILENAMES } from "@blueprint/shared";
 *        fileName: EXPORT_FILENAMES.BLUEPRINT
 */
export const EXPORT_FILENAMES = {
  /** Exported blueprint file name */
  BLUEPRINT: EDITOR_FILENAMES.BLUEPRINT,
  /** Exported tasks file name */
  TASKS: EDITOR_FILENAMES.TASKS,
} as const;

/**
 * Storage Key Prefixes
 * Centralized source of truth for internal storage key prefixes used
 * in backup, test, and privacy detection operations.
 * Flexy says: No hardcoded "__backup__"/__storage_test__" strings in keys.ts!
 * Usage: import { STORAGE_KEY_PREFIXES } from "@blueprint/shared";
 *       `{STORAGE_KEY_PREFIXES.BACKUP}${key}`
 */
export const STORAGE_KEY_PREFIXES = {
  /** Prefix for backup entries in localStorage */
  BACKUP: "__backup__" as const,
  /** Prefix for storage availability test keys */
  STORAGE_TEST: "__storage_test__" as const,
  /** Prefix for privacy mode detection test keys */
  PRIVACY_TEST: "__privacy_test__" as const,
} as const;

/**
 * Storage Error Type Identifiers
 * Centralized source of truth for all storage error type string values.
 * Flexy says: No hardcoded "QUOTA_EXCEEDED"/"CORRUPTED_DATA" string unions in storage.ts!
 * Usage: import { STORAGE_ERROR_TYPE_VALUES } from "@blueprint/shared";
 *        type StorageErrorType = (typeof STORAGE_ERROR_TYPE_VALUES)[keyof typeof STORAGE_ERROR_TYPE_VALUES];
 */
export const STORAGE_ERROR_TYPE_VALUES = {
  /** Storage quota exceeded error */
  QUOTA_EXCEEDED: "QUOTA_EXCEEDED" as const,
  /** Corrupted or unparseable stored data */
  CORRUPTED_DATA: "CORRUPTED_DATA" as const,
  /** JSON serialization/deserialization failure */
  SERIALIZATION_ERROR: "SERIALIZATION_ERROR" as const,
  /** Browser does not support localStorage */
  BROWSER_UNSUPPORTED: "BROWSER_UNSUPPORTED" as const,
  /** Private browsing / incognito mode detected */
  PRIVACY_MODE: "PRIVACY_MODE" as const,
  /** Data validation failure */
  VALIDATION_ERROR: "VALIDATION_ERROR" as const,
  /** Schema/data migration failure */
  MIGRATION_ERROR: "MIGRATION_ERROR" as const,
  /** Backup operation failure */
  BACKUP_ERROR: "BACKUP_ERROR" as const,
  /** Recovery from backup failure */
  RECOVERY_ERROR: "RECOVERY_ERROR" as const,
} as const;

/**
 * Storage Operation Error Template Functions
 * Centralized template functions for storage operation error messages.
 * Flexy says: No hardcoded "Storage X failed" strings in storage.ts!
 * Usage: import { STORAGE_OPERATION_ERROR_STRINGS } from "@blueprint/shared";
 *        console.warn(STORAGE_OPERATION_ERROR_STRINGS.OPERATION_FAILED(operation));
 */
export const STORAGE_OPERATION_ERROR_STRINGS = {
  /** Template for failed storage operation */
  OPERATION_FAILED: (operation: string): string => `Storage ${operation} failed`,
  /** Template for successful recovery from backup at timestamp */
  RECOVERY_SUCCESS: (timestamp: number): string =>
    `Successfully recovered from backup created at ${new Date(timestamp)}`,
  /** Template for duplicate storage service registration */
  SERVICE_EXISTS: (key: string): string => `Storage service for key "${key}" already exists`,
} as const;

/**
 * Export File & Compression Defaults
 * Centralized source of truth for export-related file naming, folder structure,
 * and compression configuration used by the frontend export utilities.
 * Flexy says: No hardcoded "README.md" or ".docs" strings in export code!
 * Usage: import { EXPORT_DEFAULTS } from "@blueprint/shared";
 *        zip.file(EXPORT_DEFAULTS.DOCS_FOLDER + "/" + EXPORT_DEFAULTS.README_FILENAME, ...)
 */
export const EXPORT_DEFAULTS = {
  /** ZIP compression level (0-9, where 0=no compression, 9=maximum) */
  ZIP_COMPRESSION_LEVEL: 6,
  /** Name of the docs folder inside the ZIP archive */
  DOCS_FOLDER: ".docs" as const,
  /** Filename for the generated README inside the docs folder */
  README_FILENAME: "README.md" as const,
  /** Filename for the export metadata JSON file */
  METADATA_FILENAME: "metadata.json" as const,
  /** Suffix appended to project name for ZIP filename */
  ZIP_FILENAME_SUFFIX: ".zip" as const,
  /** Separator used in ISO date string formatting (T between date and time) */
  DATE_FORMAT_SEPARATOR: "T" as const,
  /** Screen-reader hidden textarea offset for copy operations (negative pixel value) */
  COPY_TEXTAREA_OFFSET_PX: -9999,
} as const;

/**
 * Local Storage Configuration Defaults
 * Centralized source of truth for localStorage-specific magic numbers
 * used by the frontend storage adapter and quota management.
 * Flexy says: No hardcoded 5/100/1000 magic numbers in storage config!
 * Usage: import { STORAGE_LOCAL_DEFAULTS } from "@blueprint/shared";
 *        MAX_BACKUP_ENTRIES: STORAGE_LOCAL_DEFAULTS.MAX_BACKUP_ENTRIES
 */
export const STORAGE_LOCAL_DEFAULTS = {
  /** Maximum number of backup entries kept in localStorage */
  MAX_BACKUP_ENTRIES: 5,
  /** Quota warning threshold in KB — fires warning when free space drops below this */
  QUOTA_WARNING_THRESHOLD_KB: 1,
  /** Maximum number of latency measurements stored for analytics */
  MAX_LATENCY_MEASUREMENTS: 100,
  /** Default retry count for storage operations */
  DEFAULT_MAX_RETRIES: 3,
  /** Default delay in ms between storage operation retries */
  DEFAULT_RETRY_DELAY_MS: 100,
  /** Cache TTL in ms for quota data */
  QUOTA_CACHE_TTL_MS: 5000,
  /** Default auto-save delay in ms */
  AUTO_SAVE_DELAY_MS: 1000,
} as const;

/**
 * Storage Operation Name Constants
 * Centralized source of truth for storage adapter operation name strings
 * used in error reporting and logging. Eliminates hardcoded "getItem"/
 * "setItem"/"removeItem" strings in storage adapter code.
 * Flexy says: No hardcoded "getItem" strings in storage adapter error messages!
 * Usage: import { STORAGE_OPERATION_NAMES } from "@blueprint/shared";
 *        console.error(STORAGE_ERROR_MESSAGES.OPERATION_FAILED(STORAGE_OPERATION_NAMES.GET_ITEM))
 */
export const STORAGE_OPERATION_NAMES = {
  /** getItem operation — retrieving data from storage */
  GET_ITEM: "getItem" as const,
  /** setItem operation — persisting data to storage */
  SET_ITEM: "setItem" as const,
  /** removeItem operation — deleting data from storage */
  REMOVE_ITEM: "removeItem" as const,
  /** Generic operation fallback for logging when operation context is unknown */
  GENERIC: "operation" as const,
} as const;
