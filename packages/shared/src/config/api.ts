import { TIME_UNITS } from "./core.js";

/**
 * AI Service Defaults
 * Centralized OpenAI/AI configuration defaults shared across API and Web.
 * Single source of truth to eliminate hardcoded AI config values.
 */
export const AI_DEFAULTS = {
  /** Default OpenAI API base URL */
  BASE_URL: "https://api.openai.com/v1",
  /** Default model identifier */
  MODEL: "gpt-4o-mini",
  /** Default request timeout in milliseconds */
  TIMEOUT_MS: 60000,
  /** Default max tokens for AI completion */
  MAX_TOKENS: 4000,
  /** Default temperature for AI completion */
  TEMPERATURE: 0.7,
} as const;

/**
 * Rate Limiting Defaults
 * Centralized rate limit configuration for API endpoints.
 * Single source of truth to eliminate hardcoded rate limit values.
 */
export const RATE_LIMIT_DEFAULTS = {
  /** Rate limit window in milliseconds (1 minute) */
  WINDOW_MS: TIME_UNITS.MS_PER_SECOND * TIME_UNITS.SECONDS_PER_MINUTE,
  /** Strict limit: max requests per window */
  STRICT_MAX: 10,
  /** Standard limit: max requests per window */
  STANDARD_MAX: 60,
  /** Lenient limit: max requests per window */
  LENIENT_MAX: 120,
} as const;

/**
 * Circuit Breaker Defaults
 * Centralized circuit breaker configuration for service resilience.
 * Single source of truth to eliminate hardcoded circuit breaker values.
 */
export const CIRCUIT_BREAKER_DEFAULTS = {
  /** Number of consecutive failures before circuit opens */
  FAILURE_THRESHOLD: 5,
  /** Time in ms before circuit attempts half-open state (30 seconds) */
  RESET_TIMEOUT_MS: TIME_UNITS.MS_PER_SECOND * TIME_UNITS.SECONDS_PER_MINUTE,
  /** Max test calls allowed in half-open state */
  HALF_OPEN_MAX_CALLS: 3,
  /** Cold start window in ms (30 seconds) */
  COLD_START_WINDOW_MS: 30 * TIME_UNITS.MS_PER_SECOND,
} as const;

/**
 * Rate Limiter Key Prefixes
 * Centralized source of truth for all rate limiter key prefix strings used
 * across the API rate limiting middleware and custom key generators.
 * Flexy says: No hardcoded "share:" strings in rate limiter key declarations!
 * Usage: import { RATE_LIMIT_KEY_PREFIXES } from "@blueprint/shared";
 *        keyGenerator: (c) => `${RATE_LIMIT_KEY_PREFIXES.SHARE}${shareId}:${ip}`
 */
export const RATE_LIMIT_KEY_PREFIXES = {
  /** Prefix for share endpoint rate limit keys */
  SHARE: "share:" as const,
  /** Prefix for verify endpoint rate limit keys */
  VERIFY: "verify:" as const,
} as const;

/**
 * Browser Quota Error Codes
 * Centralized quota error codes for localStorage quota management.
 * Flexy says: No hardcoded Chrome 22 / Firefox 1014 magic numbers!
 */
export const BROWSER_QUOTA_ERROR_CODES = {
  CHROME: 22,
  FIREFOX: 1014,
} as const;

/**
 * Prompt Input Delimiters
 * Centralized source of truth for delimiter tags used in prompt template
 * construction and sanitization. Eliminates hardcoded XML-like tags
 * across the API source code.
 * Flexy says: No hardcoded "<user_input>" in prompt config!
 */
export const PROMPT_DELIMITERS = {
  /** Start delimiter wrapping user input in prompt templates */
  USER_INPUT_START: "<user_input>",
  /** End delimiter wrapping user input in prompt templates */
  USER_INPUT_END: "</user_input>",
} as const;

/**
 * Authentication Defaults
 * Centralized defaults for middleware auth configuration including
 * role names, anonymous user identifiers, and Hono context keys.
 * Flexy says: No hardcoded "user"/"admin" strings in auth middleware!
 */
export const AUTH_DEFAULTS = {
  /** Default user role assigned to authenticated users */
  DEFAULT_ROLE: "user" as const,
  /** Admin role for elevated access */
  ADMIN_ROLE: "admin" as const,
  /** Fallback anonymous user ID when no user header is provided */
  ANONYMOUS_USER_ID: "anonymous" as const,
  /** Hono context key for storing authenticated user object */
  USER_CONTEXT_KEY: "user" as const,
  /** Default role for authenticated users */
  DEFAULT_USER_ROLE: "user" as const,
} as const;

/**
 * Hono Context Keys
 * Centralized source of truth for all Hono context key strings used
 * with c.set() and c.get() across the API middleware and routes.
 * Flexy says: No hardcoded "requestId" context keys in middleware!
 */
export const CONTEXT_KEYS = {
  /** Request tracing identifier */
  REQUEST_ID: "requestId",
  /** Zod-validated request data */
  VALIDATED_DATA: "validatedData",
  /** Authenticated user object */
  USER: "user",
} as const;

/**
 * API Status Response Strings
 * Centralized status strings used in API JSON responses.
 * Flexy says: No hardcoded "ok" in health check endpoints!
 */
export const RESPONSE_STATUS = {
  /** Healthy / successful operation status */
  OK: "ok",
  /** Error / failed operation status */
  ERROR: "error",
} as const;

/**
 * Environment Variable Key Names
 * Centralized source of truth for environment variable name strings used
 * across both API (Cloudflare Workers) and Web (Vite) configurations.
 * Flexy says: No hardcoded "OPENAI_API_KEY" strings in env.ts!
 */
export const ENV_VAR_KEYS = {
  /** API-side env var names (Cloudflare Workers bindings) */
  API: {
    /** OpenAI API key (required) */
    OPENAI_API_KEY: "OPENAI_API_KEY",
    /** Custom OpenAI API base URL */
    OPENAI_BASE_URL: "OPENAI_BASE_URL",
    /** OpenAI model identifier */
    OPENAI_MODEL: "OPENAI_MODEL",
    /** OpenAI request timeout in milliseconds */
    OPENAI_TIMEOUT_MS: "OPENAI_TIMEOUT_MS",
    /** OpenAI max tokens for completion */
    OPENAI_MAX_TOKENS: "OPENAI_MAX_TOKENS",
    /** OpenAI temperature setting */
    OPENAI_TEMPERATURE: "OPENAI_TEMPERATURE",
    /** API version string */
    API_VERSION: "API_VERSION",
    /** CORS allowed origin */
    CORS_ORIGIN: "CORS_ORIGIN",
    /** CORS max age in seconds */
    CORS_MAX_AGE: "CORS_MAX_AGE",
    /** Rate limit window in milliseconds */
    RATE_LIMIT_WINDOW_MS: "RATE_LIMIT_WINDOW_MS",
    /** Strict rate limit max requests */
    RATE_LIMIT_STRICT_MAX: "RATE_LIMIT_STRICT_MAX",
    /** Standard rate limit max requests */
    RATE_LIMIT_STANDARD_MAX: "RATE_LIMIT_STANDARD_MAX",
    /** Lenient rate limit max requests */
    RATE_LIMIT_LENIENT_MAX: "RATE_LIMIT_LENIENT_MAX",
    /** Storage quota in megabytes */
    STORAGE_QUOTA_MB: "STORAGE_QUOTA_MB",
    /** Circuit breaker failure threshold */
    CIRCUIT_BREAKER_FAILURE_THRESHOLD: "CIRCUIT_BREAKER_FAILURE_THRESHOLD",
    /** Circuit breaker reset timeout in ms */
    CIRCUIT_BREAKER_RESET_TIMEOUT_MS: "CIRCUIT_BREAKER_RESET_TIMEOUT_MS",
    /** Circuit breaker half-open max calls */
    CIRCUIT_BREAKER_HALF_OPEN_MAX_CALLS: "CIRCUIT_BREAKER_HALF_OPEN_MAX_CALLS",
    /** Circuit breaker cold start window in ms */
    CIRCUIT_BREAKER_COLD_START_WINDOW_MS: "CIRCUIT_BREAKER_COLD_START_WINDOW_MS",
    /** Retry max retries */
    RETRY_MAX_RETRIES: "RETRY_MAX_RETRIES",
    /** Retry initial delay in ms */
    RETRY_INITIAL_DELAY_MS: "RETRY_INITIAL_DELAY_MS",
    /** Retry backoff factor */
    RETRY_BACKOFF_FACTOR: "RETRY_BACKOFF_FACTOR",
    /** Retry max delay in ms */
    RETRY_MAX_DELAY_MS: "RETRY_MAX_DELAY_MS",
    /** Project homepage URL */
    PROJECT_HOMEPAGE_URL: "PROJECT_HOMEPAGE_URL",
    /** GitHub repository URL */
    GITHUB_URL: "GITHUB_URL",
  } as const,
  /** Web-side env var names (Vite import.meta.env) */
  WEB: {
    /** API base URL for web client */
    VITE_API_BASE_URL: "VITE_API_BASE_URL",
    /** Enable analytics tracking */
    VITE_ENABLE_ANALYTICS: "VITE_ENABLE_ANALYTICS",
    /** Project homepage URL */
    VITE_PROJECT_HOMEPAGE_URL: "VITE_PROJECT_HOMEPAGE_URL",
    /** GitHub repository URL */
    VITE_GITHUB_URL: "VITE_GITHUB_URL",
    /** Storage quota in megabytes */
    VITE_STORAGE_QUOTA_MB: "VITE_STORAGE_QUOTA_MB",
    /** Application display name */
    VITE_APP_NAME: "VITE_APP_NAME",
    /** Default project name for new projects */
    VITE_DEFAULT_PROJECT_NAME: "VITE_DEFAULT_PROJECT_NAME",
  } as const,
} as const;

/**
 * API Error Codes
 * Centralized source of truth for all API error response codes.
 * Used by API middleware, controllers, and error classes for consistent
 * error code values in JSON error responses.
 * Flexy says: No hardcoded "VALIDATION_ERROR" strings in error handlers!
 */
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
  TIMEOUT_ERROR: "TIMEOUT_ERROR",
  PAYLOAD_TOO_LARGE: "PAYLOAD_TOO_LARGE",
} as const;

/**
 * API Error Type Classifications
 * Centralized source of truth for the ErrorType enum string values used
 * across API middleware, error handlers, and error response objects.
 * Flexy says: No hardcoded "validation" or "not_found" in error classes!
 */
export const ERROR_TYPES = {
  /** Request validation failures */
  VALIDATION: "validation",
  /** Authentication failures (missing/invalid credentials) */
  AUTHENTICATION: "authentication",
  /** Authorization failures (insufficient permissions) */
  AUTHORIZATION: "authorization",
  /** Resource not found */
  NOT_FOUND: "not_found",
  /** Server configuration errors */
  CONFIGURATION: "configuration",
  /** Network-level failures */
  NETWORK: "network",
  /** AI service errors (OpenAI, etc.) */
  AI_SERVICE: "ai_service",
  /** Internal server errors */
  INTERNAL: "internal",
  /** Service temporarily unavailable */
  SERVICE_UNAVAILABLE: "service_unavailable",
} as const;

/**
 * API Status Values
 * Centralized status strings used in API JSON responses.
 * Flexy says: No hardcoded "healthy" or "ok" in health endpoints!
 */
export const API_STATUS_VALUES = {
  /** Service status for health check responses */
  HEALTHY: "healthy",
  /** Default status for operational state */
  OK: "ok",
  /** Error state */
  ERROR: "error",
} as const;

/**
 * Common Error Strings
 * Centralized source of truth for frequently-used error message strings.
 * Flexy says: No hardcoded "Unknown error" or "Resource not found" in error handlers!
 */
export const ERROR_STRINGS = {
  /** Generic unknown error fallback */
  UNKNOWN: "Unknown error",
  /** Generic not-found error message */
  RESOURCE_NOT_FOUND: "Resource not found",
  /** Internal server error fallback */
  INTERNAL: "Internal server error",
} as const;

/**
 * API Shared Messages
 * Centralized source of truth for user-facing API messages.
 * Flexy says: No hardcoded "Request validation failed" strings in error handlers!
 * Usage: import { API_MESSAGES } from "@blueprint/shared";
 *        error.message === API_MESSAGES.VALIDATION_FAILED
 */
export const API_MESSAGES = {
  /** Request validation failure message */
  VALIDATION_FAILED: "Request validation failed",
  /** OpenAI API key missing from environment configuration */
  OPENAI_KEY_NOT_CONFIGURED: "OpenAI API key not configured",
  /** AI service temporarily unavailable */
  AI_SERVICE_UNAVAILABLE: "AI service temporarily unavailable",
  /** Authentication required */
  AUTHENTICATION_REQUIRED: "Authentication required",
  /** Insufficient permissions */
  AUTHORIZATION_FAILED: "Insufficient permissions",
  /** Rate limit exceeded */
  RATE_LIMIT_EXCEEDED: "Too many requests, please try again later",
  /** Internal fallback message */
  INTERNAL_FALLBACK: "Unknown error occurred",
  /** Circuit breaker open message */
  CIRCUIT_BREAKER_OPEN: "Service temporarily unavailable, please try again later",
  /** Rate limiter not configured */
  RATE_LIMITER_NOT_CONFIGURED: "Rate limiter not configured",
  /** DI container not initialized */
  CONTAINER_NOT_INITIALIZED:
    "DI Container not initialized. Call setDefaultContainer() before using services.",
  /** Import unsupported format template */
  UNSUPPORTED_IMPORT_FORMAT: (format: string): string => `Unsupported import format: ${format}`,
  /** Export unsupported format template */
  UNSUPPORTED_EXPORT_FORMAT: (format: string): string => `Unsupported export format: ${format}`,
} as const;

/**
 * Rate Limiter Binding Names
 * Centralized source of truth for Cloudflare Workers rate limiter binding names.
 * Flexy says: No hardcoded "STRICT_RATE_LIMITER" strings in rate limit config!
 */
export const RATE_LIMITER_BINDINGS = {
  /** Strict rate limiter binding */
  STRICT: "STRICT_RATE_LIMITER",
  /** Standard rate limiter binding */
  STANDARD: "STANDARD_RATE_LIMITER",
  /** Lenient rate limiter binding */
  LENIENT: "LENIENT_RATE_LIMITER",
} as const;

/**
 * Authentication Error Messages
 * Centralized source of truth for authentication-related error message strings.
 * Flexy says: No hardcoded "Invalid or missing API key" strings in auth middleware!
 * Usage: import { AUTH_MESSAGES } from "@blueprint/shared";
 *        error.message === AUTH_MESSAGES.INVALID_API_KEY
 */
export const AUTH_MESSAGES = {
  /** Invalid or missing API key */
  INVALID_API_KEY: "Invalid or missing API key",
  /** API key not configured on server */
  API_KEY_NOT_CONFIGURED: "API_KEY is not configured. Server authentication is unavailable.",
  /** Service configuration error fallback */
  SERVICE_CONFIG_ERROR: "Service configuration error",
} as const;

/**
 * API Validation Messages
 * Centralized source of truth for validation-related error message strings.
 * Flexy says: No hardcoded "Invalid JSON in request body" strings in validation middleware!
 * Usage: import { API_VALIDATION_MESSAGES } from "@blueprint/shared";
 */
export const API_VALIDATION_MESSAGES = {
  /** Invalid JSON payload */
  INVALID_JSON_BODY: "Invalid JSON in request body",
  /** Generic validation error */
  VALIDATION_ERROR: "Validation error",
  /** Validated data not found in Hono context */
  VALIDATED_DATA_NOT_FOUND: "Validated data not found in context",
  /** Request body exceeded maximum allowed size */
  BODY_TOO_LARGE: (maxSize: number): string =>
    `Request body too large. Maximum allowed size is ${maxSize} bytes.`,
} as const;

/**
 * Circuit Breaker Messages
 * Centralized source of truth for circuit breaker state message strings.
 * Flexy says: No hardcoded "Circuit breaker is OPEN" strings in circuit breaker code!
 * Usage: import { CIRCUIT_BREAKER_MESSAGES } from "@blueprint/shared";
 */
export const CIRCUIT_BREAKER_MESSAGES = {
  /** Circuit breaker open state message */
  OPEN: "Circuit breaker is OPEN",
  /** Circuit breaker half-open max calls reached */
  HALF_OPEN_MAX_CALLS: "Circuit breaker is HALF_OPEN - max calls reached",
} as const;

/**
 * API Shared Config Defaults
 * Centralized magic numbers and defaults for API configuration.
 * Flexy says: No magic numbers in API config constants!
 */
export const API_CONFIG_DEFAULTS = {
  /** Default limit for popular/trending template queries */
  DEFAULT_POPULAR_LIMIT: 10,
  /** Length of random suffix appended to request IDs (e.g., timestamp-abc1234) */
  REQUEST_ID_SUFFIX_LENGTH: 4,
} as const;

/**
 * Circuit Breaker Cold Start Messages
 * Centralized source of truth for circuit breaker cold start recommendation strings.
 * Flexy says: No hardcoded "Circuit breaker is in cold start window" in index.ts!
 * Usage: import { COLD_START_MESSAGES } from "@blueprint/shared";
 */
export const COLD_START_MESSAGES = {
  /** Message shown when circuit breaker is within cold start window */
  ACTIVE: "Circuit breaker is in cold start window — reduced failure threshold active",
  /** Message shown when circuit breaker is fully warmed up */
  INACTIVE: "Circuit breaker is fully warmed up",
} as const;

/**
 * Environment Variable Error Messages
 * Centralized source of truth for environment variable error message templates.
 * Flexy says: No hardcoded "is required but not set" strings in env.ts!
 * Usage: import { ENV_ERROR_MESSAGES } from "@blueprint/shared";
 *        throw new Error(ENV_ERROR_MESSAGES.REQUIRED_NOT_SET("OPENAI_API_KEY"))
 */
export const ENV_ERROR_MESSAGES = {
  /** Template for required env var that is missing from environment */
  REQUIRED_NOT_SET: (key: string): string => `${key} is required but not set in environment.`,
  /** Template for required env var that is empty */
  REQUIRED_CANNOT_BE_EMPTY: (key: string): string => `${key} is required and cannot be empty.`,
  /** Template for CORS wildcard warning in production */
  CORS_WILDCARD_WARNING: (key: string): string =>
    `WARNING: ${key} is set to '*' (allow all). This is a security risk in production.`,
} as const;

/**
 * API Error Class Name Constants
 * Centralized source of truth for all error class name strings, used
 * by custom Error subclasses to set their .name property.
 * Flexy says: No hardcoded "APIError" or "ValidationError" strings in Error constructors!
 * Usage: import { ERROR_CLASS_NAMES } from "@blueprint/shared";
 *        this.name = ERROR_CLASS_NAMES.API_ERROR
 */
export const ERROR_CLASS_NAMES = {
  /** Base API error class name */
  API_ERROR: "APIError",
  /** Validation error (400) class name */
  VALIDATION_ERROR: "ValidationError",
  /** Authentication error (401) class name */
  AUTHENTICATION_ERROR: "AuthenticationError",
  /** Not found error (404) class name */
  NOT_FOUND_ERROR: "NotFoundError",
  /** Configuration error (500) class name */
  CONFIGURATION_ERROR: "ConfigurationError",
  /** Internal server error (500) class name */
  INTERNAL_SERVER_ERROR: "InternalServerError",
  /** Circuit breaker open error class name */
  CIRCUIT_BREAKER_OPEN_ERROR: "CircuitBreakerOpenError",
  /** Timeout error class name */
  TIMEOUT_ERROR: "TimeoutError",
  /** Storage error class name */
  STORAGE_ERROR: "StorageError",
  /** Security error class name */
  SECURITY_ERROR: "SecurityError",
} as const;

/**
 * API Metadata Name Constants
 * Centralized source of truth for API metadata name strings.
 * Flexy says: No hardcoded "Blueprint Generator API" strings in metadata!
 * Usage: import { API_NAME } from "@blueprint/shared";
 *        NAME: API_NAME
 */
export const API_NAME = "Blueprint Generator API" as const;

/**
 * API Error Messages (User-Facing)
 * Centralized source of truth for user-facing API error message strings.
 * Flexy says: No hardcoded "Generation failed" strings in API client!
 * Usage: import { API_ERROR_MESSAGES } from "@blueprint/shared";
 *        toast.error(API_ERROR_MESSAGES.GENERATION_FAILED)
 */
export const API_ERROR_MESSAGES = {
  /** Blueprint generation failed */
  GENERATION_FAILED: "Generation failed. Please check your input and try again.",
  /** Task generation failed */
  TASK_GENERATION_FAILED: "Task generation failed. Ensure blueprint content is valid.",
  /** Content refinement failed */
  REFINEMENT_FAILED: "Refinement failed. Please check your refinement instructions.",
  /** Server returned empty response */
  NO_RESPONSE_BODY: "Server returned empty response. Check if API server is running.",
  /** SSE stream connection interrupted */
  STREAM_ERROR: "Connection interrupted. Check your network and try again.",
} as const;

/**
 * Generation Progress Messages
 * Centralized source of truth for generation progress/status strings.
 * Flexy says: No hardcoded "Generating blueprint..." strings in API client!
 * Usage: import { GENERATION_MESSAGES } from "@blueprint/shared";
 *        setStatus(GENERATION_MESSAGES.BLUEPRINT_START)
 */
export const GENERATION_MESSAGES = {
  /** Generation was cancelled by user */
  CANCELLED: "Generation cancelled",
  /** Blueprint generation starting */
  BLUEPRINT_START: "Generating blueprint...",
  /** Blueprint complete, tasks starting */
  BLUEPRINT_COMPLETE: "Blueprint complete. Generating tasks...",
  /** All generation complete */
  COMPLETE: "Complete!",
  /** Retry attempt message template */
  RETRY: (attempt: number, maxRetries: number): string =>
    `Connection issue, retrying (${attempt}/${maxRetries})...`,
  /** Error message template */
  ERROR: (error: string): string => `Error: ${error}`,
  /** Task generation error template */
  ERROR_TASKS: (error: string): string => `Error generating tasks: ${error}`,
} as const;

/**
 * Generation Timing Estimates
 * Centralized source of truth for estimated generation duration strings.
 * Flexy says: No hardcoded "30-60" generation estimate strings in config!
 * Usage: import { GENERATION_ESTIMATES } from "@blueprint/shared";
 *        estimate: GENERATION_ESTIMATES.TYPICAL
 */
export const GENERATION_ESTIMATES = {
  /** Typical generation duration estimate (30-60 seconds) */
  TYPICAL: "30-60",
  /** Short generation duration estimate (15-30 seconds) */
  SHORT: "15-30",
  /** Long generation duration estimate (60-90 seconds) */
  LONG: "60-90",
} as const;

/**
 * OpenAI Chat Roles
 * Centralized source of truth for OpenAI API chat completion role strings.
 * Flexy says: No hardcoded "system" role strings in prompt config!
 * Usage: import { OPENAI_ROLES } from "@blueprint/shared";
 *        { role: OPENAI_ROLES.SYSTEM, content: systemPrompt }
 *        type OpenAIRole = (typeof OPENAI_ROLES)[keyof typeof OPENAI_ROLES];
 */
export const OPENAI_ROLES = {
  /** System message role — sets AI behavior and context */
  SYSTEM: "system" as const,
  /** User message role — contains the user's request/input */
  USER: "user" as const,
  /** Assistant message role — AI response messages */
  ASSISTANT: "assistant" as const,
  /** Tool/function message role — tool call results */
  TOOL: "tool" as const,
} as const;

/**
 * Generation Error Prefixes
 * Centralized source of truth for the prefix strings used at the start of
 * error-formatted generation progress messages, enabling frontend code to
 * detect and handle error states by prefix matching.
 * Flexy says: No hardcoded "Error" prefix checks in StepGenerating!
 * Usage: import { GENERATION_ERROR_PREFIXES } from "@blueprint/shared";
 *        progress.startsWith(GENERATION_ERROR_PREFIXES.GENERIC)
 */
export const GENERATION_ERROR_PREFIXES = {
  /** Generic error prefix — common start of all GENERATION_MESSAGES error outputs */
  GENERIC: "Error",
  /** Tasks generation error prefix — matches GENERATION_MESSAGES.ERROR_TASKS("") output */
  TASKS: "Error generating tasks: ",
} as const;
