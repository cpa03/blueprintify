/**
 * Validation Configuration Constants
 *
 * Field validation definitions for prompt injection detection
 * and standardized error message templates.
 * Flexy says: No hardcoded field definitions — everything in config!
 *
 * @module config/constants/validation
 */

export const FIELD_LABELS = {
  PROJECT_NAME: "project name",
  DESCRIPTION: "description",
  TARGET_AUDIENCE: "target audience",
  CONSTRAINTS: "constraints",
  FEATURES: "features",
  TECH_STACK: "tech stack",
  BLUEPRINT: "blueprint",
  BLUEPRINT_CONTENT: "blueprint content",
  CONTENT: "content",
  INSTRUCTION: "instruction",
  CONTEXT: "context",
  DATA: "import data",
  TITLE: "share title",
} as const;

export const FIELD_PATHS = {
  PROJECT_NAME: "projectName",
  DESCRIPTION: "description",
  TARGET_AUDIENCE: "targetAudience",
  CONSTRAINTS: "constraints",
  FEATURES: "features",
  TECH_STACK: "techStack",
  BLUEPRINT: "blueprint",
  CONTENT: "content",
  INSTRUCTION: "instruction",
  CONTEXT: "context",
  DATA: "data",
  TITLE: "title",
} as const;

export const INJECTION_FIELD_DEFINITIONS = {
  GENERATE: [
    { path: FIELD_PATHS.PROJECT_NAME, label: FIELD_LABELS.PROJECT_NAME },
    { path: FIELD_PATHS.DESCRIPTION, label: FIELD_LABELS.DESCRIPTION },
    { path: FIELD_PATHS.TARGET_AUDIENCE, label: FIELD_LABELS.TARGET_AUDIENCE },
    { path: FIELD_PATHS.CONSTRAINTS, label: FIELD_LABELS.CONSTRAINTS },
    { path: FIELD_PATHS.FEATURES, label: FIELD_LABELS.FEATURES },
    { path: FIELD_PATHS.TECH_STACK, label: FIELD_LABELS.TECH_STACK },
  ],
  TASKS: [
    { path: FIELD_PATHS.PROJECT_NAME, label: FIELD_LABELS.PROJECT_NAME },
    { path: FIELD_PATHS.BLUEPRINT, label: FIELD_LABELS.BLUEPRINT },
  ],
  REFINE: [
    { path: FIELD_PATHS.CONTENT, label: FIELD_LABELS.CONTENT },
    { path: FIELD_PATHS.INSTRUCTION, label: FIELD_LABELS.INSTRUCTION },
    { path: FIELD_PATHS.CONTEXT, label: FIELD_LABELS.CONTEXT },
  ],
  EXPORT: [
    { path: FIELD_PATHS.PROJECT_NAME, label: FIELD_LABELS.PROJECT_NAME },
    { path: FIELD_PATHS.BLUEPRINT, label: FIELD_LABELS.BLUEPRINT_CONTENT },
  ],
  IMPORT: [{ path: FIELD_PATHS.DATA, label: FIELD_LABELS.DATA }],
  SHARE_CREATE: [
    { path: FIELD_PATHS.TITLE, label: FIELD_LABELS.TITLE },
    { path: FIELD_PATHS.BLUEPRINT, label: FIELD_LABELS.BLUEPRINT_CONTENT },
  ],
} as const;

export const INJECTION_ERROR_MESSAGE = (label: string): string =>
  `Input in '${label}' contains potentially unsafe content. Please remove any instructions directed at the AI system and try again.`;

export const ROUTE_PATH_ALL = "*";

export const EXPORT_FORMATS = {
  JSON: "json",
  MARKDOWN: "markdown",
  ZIP: "zip",
} as const;

export const FILENAME_PATTERNS = {
  EXPORT_JSON: (name: string): string => `${name.replace(/\s+/g, "_")}_export.json`,
  EXPORT_MARKDOWN: (name: string): string => `${name.replace(/\s+/g, "_")}.md`,
  EXPORT_ZIP: (name: string): string => `${name.replace(/\s+/g, "_")}.zip`,
} as const;

export const IMPORT_FORMATS = {
  JSON: "json",
  MARKDOWN: "markdown",
} as const;

export const LOG_CONTEXT = {
  /** Audit trail identifier for successful authentication events */
  AUTHENTICATION: "Authentication success",
  /** Audit trail identifier for rate limiter configuration warnings */
  RATE_LIMITER: "RateLimiter",
  /** Audit trail identifier for rate limit enforcement blocks */
  RATE_LIMIT: "RateLimit",
  /** Audit trail identifier for uncaught API error handling */
  API_ERROR: "API Error",
  /** Audit trail identifier for authentication configuration warnings */
  AUTH_CONFIG: "AuthenticationConfig",
  /** Audit trail identifier for successful user authentication */
  AUTH_USER_AUTHENTICATED: "User authenticated",
  /** Audit trail identifier for prompt injection detection */
  PROMPT_INJECTION: "PromptInjection",
  SHARE_CREATE: "Share creation error",
  SHARE_VERIFY: "Share verify error",
  SHARE_RETRIEVAL: "Share retrieval error",
  SHARE_DELETION: "Share deletion error",
  EXPORT: "Export error",
  IMPORT: "Import error",
  UNKNOWN_SHARE_ID: "unknown",
} as const;

export const CONTENT_TYPE_NONE = "none";

export const SQL_QUERIES = {
  INSERT_SHARE: `INSERT INTO blueprint_shares (id, title, blueprint, metadata, passphrase_hash, created_at, expires_at)
   VALUES (?, ?, ?, ?, ?, ?, ?)`,
  SELECT_SHARE: `SELECT id, title, blueprint, metadata, passphrase_hash, created_at, expires_at
   FROM blueprint_shares
   WHERE id = ?`,
  SELECT_SHARE_METADATA: `SELECT id, metadata FROM blueprint_shares WHERE id = ?`,
  DELETE_SHARE: `DELETE FROM blueprint_shares WHERE id = ?`,
} as const;
