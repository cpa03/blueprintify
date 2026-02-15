import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { RETRY_CONFIG as SHARED_RETRY_CONFIG } from "@blueprint/shared";
import type { EnvConfig } from "./env";

let envConfig: EnvConfig | null = null;

export function setEnvConfig(config: EnvConfig): void {
  envConfig = config;
}

export function getEnvConfig(): EnvConfig {
  if (!envConfig) {
    throw new Error("Environment config not set. Call setEnvConfig() first.");
  }
  return envConfig;
}

function loadPromptTemplate(filename: string): string {
  try {
    const templatePath = resolve(__dirname, "../templates", filename);
    return readFileSync(templatePath, "utf-8");
  } catch {
    return "";
  }
}

export const RETRY_CONFIG = SHARED_RETRY_CONFIG;

export const AI_CONFIG = {
  get DEFAULT_MODEL(): string {
    return getEnvConfig().OPENAI_MODEL;
  },
  get DEFAULT_TIMEOUT(): number {
    return getEnvConfig().OPENAI_TIMEOUT_MS;
  },
  get DEFAULT_MAX_TOKENS(): number {
    return getEnvConfig().OPENAI_MAX_TOKENS;
  },
  get DEFAULT_TEMPERATURE(): number {
    return getEnvConfig().OPENAI_TEMPERATURE;
  },
};

export const API_METADATA = {
  NAME: "Blueprint Generator API",
  get VERSION(): string {
    return getEnvConfig().API_VERSION;
  },
  STATUS: "healthy",
};

// API Endpoints configuration
export const API_ENDPOINTS = {
  GENERATE: {
    path: "/generate",
    method: "POST",
    description: "Generate blueprint",
  },
  TASKS: {
    path: "/tasks",
    method: "POST",
    description: "Generate tasks",
  },
  REFINE: {
    path: "/refine",
    method: "POST",
    description: "Refine content",
  },
  EXPORT: {
    path: "/export",
    method: "POST",
    description: "Export project",
  },
  IMPORT: {
    path: "/import",
    method: "POST",
    description: "Import project",
  },
  STORAGE_QUOTA: {
    path: "/storage/quota",
    method: "GET",
    description: "Get storage quota",
  },
  STORAGE_CLEAR: {
    path: "/storage/clear",
    method: "DELETE",
    description: "Clear storage",
  },
  SHARE_CREATE: {
    path: "/share",
    method: "POST",
    description: "Create shareable blueprint link",
  },
  SHARE_GET: {
    path: "/share/:id",
    method: "GET",
    description: "Get shared blueprint by ID",
  },
  SHARE_DELETE: {
    path: "/share/:id",
    method: "DELETE",
    description: "Delete shared blueprint",
  },
} as const;

// HTTP Status codes for retry logic
export const RETRYABLE_STATUS_CODES = [408, 429, 500, 502, 503, 504] as const;

// Retryable error codes for network operations
export const RETRYABLE_ERROR_CODES = [
  "ECONNRESET",
  "ETIMEDOUT",
  "ENOTFOUND",
  "EAI_AGAIN",
  "ECONNREFUSED",
] as const;

// Error codes
export const ERROR_CODES = {
  VALIDATION_ERROR: "VALIDATION_ERROR",
  NOT_FOUND_ERROR: "NOT_FOUND_ERROR",
  CONFIGURATION_ERROR: "CONFIGURATION_ERROR",
  NETWORK_ERROR: "NETWORK_ERROR",
  AI_SERVICE_ERROR: "AI_SERVICE_ERROR",
  INTERNAL_ERROR: "INTERNAL_ERROR",
  AUTHENTICATION_ERROR: "AUTHENTICATION_ERROR",
  AUTHORIZATION_ERROR: "AUTHORIZATION_ERROR",
  RATE_LIMIT_ERROR: "RATE_LIMIT_ERROR",
  CIRCUIT_BREAKER_OPEN: "CIRCUIT_BREAKER_OPEN",
} as const;

// Error messages
export const ERROR_MESSAGES = {
  VALIDATION: "Request validation failed",
  NOT_FOUND: (route: string) => `Route not found: ${route}`,
  CONFIGURATION: "OpenAI API key not configured",
  NETWORK: "Network error occurred",
  AI_SERVICE: "AI service error",
  INTERNAL: "Internal server error",
  AUTHENTICATION: "Authentication required",
  AUTHORIZATION: "Insufficient permissions",
  RATE_LIMIT: "Too many requests, please try again later",
  CIRCUIT_BREAKER_OPEN:
    "Service temporarily unavailable, please try again later",
} as const;

// Default error messages for error classes
export const DEFAULT_ERROR_MESSAGES = {
  VALIDATION: "Invalid request data",
  AUTHENTICATION: "Authentication required",
  AUTHORIZATION: "Insufficient permissions",
  NOT_FOUND: "Resource not found",
  CONFIGURATION: "Service configuration error",
  NETWORK: "Network error occurred",
  AI_SERVICE: "AI service error",
  INTERNAL: "Internal server error",
} as const;

export const PROMPT_CONFIG = {
  get ARCHITECT_SYSTEM(): string {
    return loadPromptTemplate("architect-system.txt");
  },
  get TASK_SPLITTER_SYSTEM(): string {
    return loadPromptTemplate("task-splitter-system.txt");
  },
  get REFINER_SYSTEM(): string {
    return loadPromptTemplate("refiner-system.txt");
  },
};

export const CORS_CONFIG = {
  get ORIGIN(): string {
    return getEnvConfig().CORS_ORIGIN;
  },
  ALLOW_METHODS: ["GET", "POST", "OPTIONS"] as string[],
  ALLOW_HEADERS: ["Content-Type", "Authorization"] as string[],
  get MAX_AGE(): number {
    return getEnvConfig().CORS_MAX_AGE;
  },
};

export const CIRCUIT_BREAKER_CONFIG = {
  get DEFAULT_FAILURE_THRESHOLD(): number {
    return getEnvConfig().CIRCUIT_BREAKER_FAILURE_THRESHOLD;
  },
  get DEFAULT_RESET_TIMEOUT_MS(): number {
    return getEnvConfig().CIRCUIT_BREAKER_RESET_TIMEOUT_MS;
  },
  get DEFAULT_HALF_OPEN_MAX_CALLS(): number {
    return getEnvConfig().CIRCUIT_BREAKER_HALF_OPEN_MAX_CALLS;
  },
};

// SSE Stream configuration
export const SSE_CONFIG = {
  EVENT_TYPE: {
    CONTENT: "content",
    ERROR: "error",
    DONE: "done",
  },
  DATA_PREFIX: "data: ",
  EVENT_SEPARATOR: "\n\n",
} as const;

// SSE Response headers
export const SSE_HEADERS = {
  CONTENT_TYPE: "text/event-stream",
  CACHE_CONTROL: "no-cache",
  CONNECTION: "keep-alive",
} as const;

// HTTP Status codes
export const HTTP_STATUS = {
  OK: 200,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_ERROR: 500,
  BAD_GATEWAY: 502,
  SERVICE_UNAVAILABLE: 503,
  GATEWAY_TIMEOUT: 504,
} as const;

// Validation messages
export const VALIDATION_MESSAGES = {
  REQUEST_VALIDATION_FAILED: "Request validation failed",
  INVALID_JSON_BODY: "Invalid JSON in request body",
  VALIDATION_ERROR: "Validation error",
} as const;

// Configuration messages
export const CONFIG_MESSAGES = {
  OPENAI_API_KEY_MISSING: "OpenAI API key not configured",
  VALIDATED_DATA_NOT_FOUND: "Validated data not found in context",
} as const;

// Retry logic configuration
export const RETRY_LOGIC = {
  RATE_LIMIT_STATUS: 429,
  SERVER_ERROR_THRESHOLD: 500,
} as const;

export const ROUTE_PATHS = {
  ROOT: "/",
  GENERATE: "/generate",
  TASKS: "/tasks",
  REFINE: "/refine",
  EXPORT: "/export",
  IMPORT: "/import",
  STORAGE: "/storage",
  SHARE: "/share",
} as const;

export const RATE_LIMIT_CONFIG = {
  get WINDOW_MS(): number {
    return getEnvConfig().RATE_LIMIT_WINDOW_MS;
  },
  get STRICT_MAX(): number {
    return getEnvConfig().RATE_LIMIT_STRICT_MAX;
  },
  get STANDARD_MAX(): number {
    return getEnvConfig().RATE_LIMIT_STANDARD_MAX;
  },
  get LENIENT_MAX(): number {
    return getEnvConfig().RATE_LIMIT_LENIENT_MAX;
  },
};

export const STORAGE_CONFIG = {
  get QUOTA_MB(): number {
    return getEnvConfig().STORAGE_QUOTA_MB;
  },
  get QUOTA_BYTES(): number {
    return getEnvConfig().STORAGE_QUOTA_MB * 1024 * 1024;
  },
};

export const EXTERNAL_URLS = {
  get GITHUB(): string {
    return getEnvConfig().GITHUB_URL;
  },
  get PROJECT_HOMEPAGE(): string {
    return getEnvConfig().PROJECT_HOMEPAGE_URL;
  },
};
