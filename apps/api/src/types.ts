/// <reference types="@cloudflare/workers-types" />

/**
 * API Type Definitions
 *
 * This module defines all TypeScript types and interfaces for the Blueprint Generator API.
 * Types are organized into environment bindings, context types, and validated request contexts.
 *
 * @module types
 */

import type { Context } from "hono";
import type { z } from "zod";
import type {
  BlueprintRequestSchema,
  RefineRequestSchema,
  TaskGenerationRequestSchema,
  ExportRequestSchema,
  ImportRequestSchema,
  StorageQuotaSchema,
  StorageClearRequestSchema,
} from "@blueprint/shared";

/**
 * Cloudflare Workers environment bindings and configuration.
 *
 * This interface defines all environment variables and Cloudflare bindings
 * available to the worker at runtime. Values are injected via wrangler.toml
 * or the Cloudflare dashboard.
 *
 * @property OPENAI_API_KEY - OpenAI API key for AI completions (required)
 * @property OPENAI_BASE_URL - Custom API base URL for OpenAI-compatible providers
 * @property OPENAI_MODEL - Model identifier for completions (default: gpt-4o-mini)
 * @property OPENAI_TIMEOUT_MS - Request timeout in milliseconds
 * @property OPENAI_MAX_TOKENS - Maximum tokens in completion response
 * @property OPENAI_TEMPERATURE - Sampling temperature for completions
 * @property API_KEY - Optional API key for endpoint authentication
 * @property ENVIRONMENT - Current deployment environment
 * @property API_VERSION - API version string for responses
 * @property CORS_ORIGIN - Allowed CORS origin(s)
 * @property CORS_MAX_AGE - CORS preflight cache duration in seconds
 * @property RATE_LIMIT_WINDOW_MS - Rate limiting window duration
 * @property RATE_LIMIT_STRICT_MAX - Max requests in strict rate limit window
 * @property RATE_LIMIT_STANDARD_MAX - Max requests in standard rate limit window
 * @property RATE_LIMIT_LENIENT_MAX - Max requests in lenient rate limit window
 * @property STORAGE_QUOTA_MB - Storage quota in megabytes
 * @property CIRCUIT_BREAKER_FAILURE_THRESHOLD - Failures before circuit opens
 * @property CIRCUIT_BREAKER_RESET_TIMEOUT_MS - Time before circuit half-opens
 * @property CIRCUIT_BREAKER_HALF_OPEN_MAX_CALLS - Test calls in half-open state
 * @property RETRY_MAX_RETRIES - Maximum retry attempts for failed requests
 * @property RETRY_INITIAL_DELAY_MS - Initial delay before first retry
 * @property RETRY_BACKOFF_FACTOR - Multiplier for exponential backoff
 * @property RETRY_MAX_DELAY_MS - Maximum delay between retries
 * @property PROJECT_HOMEPAGE_URL - URL to project homepage
 * @property GITHUB_URL - URL to GitHub repository
 * @property DB - Cloudflare D1 database binding
 * @property CACHE - Cloudflare KV namespace for caching
 * @property BACKGROUND_QUEUE - Cloudflare Queue for background processing
 * @property STRICT_RATE_LIMITER - Cloudflare Rate Limiter for strict limits
 * @property STANDARD_RATE_LIMITER - Cloudflare Rate Limiter for standard limits
 * @property LENIENT_RATE_LIMITER - Cloudflare Rate Limiter for lenient limits
 */
export interface Env {
  // AI Service Configuration
  OPENAI_API_KEY: string;
  OPENAI_BASE_URL?: string;
  OPENAI_MODEL?: string;
  OPENAI_TIMEOUT_MS?: string;
  OPENAI_MAX_TOKENS?: string;
  OPENAI_TEMPERATURE?: string;

  // API Configuration
  API_KEY?: string;
  ENVIRONMENT?: "development" | "production" | "staging" | "test";
  API_VERSION?: string;
  CORS_ORIGIN?: string;
  CORS_MAX_AGE?: string;

  // Rate Limiting
  RATE_LIMIT_WINDOW_MS?: string;
  RATE_LIMIT_STRICT_MAX?: string;
  RATE_LIMIT_STANDARD_MAX?: string;
  RATE_LIMIT_LENIENT_MAX?: string;

  // Storage
  STORAGE_QUOTA_MB?: string;

  // Circuit Breaker
  CIRCUIT_BREAKER_FAILURE_THRESHOLD?: string;
  CIRCUIT_BREAKER_RESET_TIMEOUT_MS?: string;
  CIRCUIT_BREAKER_HALF_OPEN_MAX_CALLS?: string;

  // Retry Configuration
  RETRY_MAX_RETRIES?: string;
  RETRY_INITIAL_DELAY_MS?: string;
  RETRY_BACKOFF_FACTOR?: string;
  RETRY_MAX_DELAY_MS?: string;

  // External URLs
  PROJECT_HOMEPAGE_URL?: string;
  GITHUB_URL?: string;

  // Cloudflare Bindings
  DB: D1Database;
  CACHE: KVNamespace;
  BACKGROUND_QUEUE: Queue;

  // Cloudflare Native Rate Limiters
  STRICT_RATE_LIMITER: RateLimit;
  STANDARD_RATE_LIMITER: RateLimit;
  LENIENT_RATE_LIMITER: RateLimit;

  // Cloudflare Workers AI
  AI: Ai;

  // Analytics Engine
  ANALYTICS: AnalyticsEngineDataset;
}

/**
 * Application-level variables stored in Hono context.
 *
 * These variables are set by middleware and available to route handlers
 * via `c.get('variableName')`.
 *
 * @property requestId - Unique identifier for request tracing
 * @property validatedData - Parsed and validated request data from validator middleware
 * @property user - Authenticated user context with role information
 */
export interface AppVariables {
  requestId?: string;
  validatedData?: unknown;
  user?: User;
}

/**
 * User role types for authorization.
 * - admin: Full access to all resources
 * - user: Standard access (create, read own resources)
 */
export type UserRole = "admin" | "user";

/**
 * Authenticated user context extracted from request.
 *
 * @property id - Unique user identifier (derived from API key or X-User-Id header)
 * @property role - Authorization role for permission checks
 */
export interface User {
  id: string;
  role: UserRole;
}

/**
 * Full application context type with environment bindings and variables.
 *
 * Use this type when you need access to both environment bindings and
 * app-level variables in a handler.
 *
 * @example
 * ```typescript
 * async function handler(c: AppContext) {
 *   const apiKey = c.env.OPENAI_API_KEY;
 *   const requestId = c.get('requestId');
 * }
 * ```
 */
export type AppContext = Context<{
  Bindings: Env;
  Variables: AppVariables;
}>;

/**
 * Generic context type with typed validated data.
 *
 * Combines environment bindings with Zod-validated request data.
 * Use this when defining handlers that receive validated input.
 *
 * @template T - Zod schema type for validated data
 *
 * @example
 * ```typescript
 * const MySchema = z.object({ name: z.string() });
 * type MyContext = ValidatedContext<typeof MySchema>;
 *
 * async function handler(c: MyContext) {
 *   const { name } = c.get('validatedData'); // typed as { name: string }
 * }
 * ```
 */
export type ValidatedContext<T extends z.ZodSchema> = Context<{
  Bindings: Env;
  Variables: {
    validatedData: z.infer<T>;
  };
}>;

/**
 * Context type for blueprint generation requests.
 *
 * Provides typed access to validated blueprint generation parameters
 * including project name, description, tech stack, and optional features.
 */
export type BlueprintContext = ValidatedContext<typeof BlueprintRequestSchema>;

/**
 * Context type for content refinement requests.
 *
 * Provides typed access to validated refinement parameters
 * including content, instruction, and optional context.
 */
export type RefineContext = ValidatedContext<typeof RefineRequestSchema>;

/**
 * Context type for task generation requests.
 *
 * Provides typed access to validated task generation parameters
 * including blueprint content and project name.
 */
export type TasksContext = ValidatedContext<typeof TaskGenerationRequestSchema>;

/**
 * Context type for export requests.
 *
 * Provides typed access to validated export parameters
 * including project name, blueprint, tasks, and format.
 */
export type ExportContext = ValidatedContext<typeof ExportRequestSchema>;

/**
 * Context type for import requests.
 *
 * Provides typed access to validated import parameters
 * including data, format, and overwrite flag.
 */
export type ImportContext = ValidatedContext<typeof ImportRequestSchema>;

/**
 * Context type for storage quota requests.
 *
 * Provides typed access to storage quota query parameters.
 */
export type StorageQuotaContext = ValidatedContext<typeof StorageQuotaSchema>;

/**
 * Context type for storage clear requests.
 *
 * Provides typed access to validated storage clear parameters
 * including the confirmation flag.
 */
export type StorageClearContext = ValidatedContext<typeof StorageClearRequestSchema>;

/**
 * Union type for all controller context types.
 *
 * Use this for utilities or middleware that need to handle
 * any validated request context type.
 */
export type ControllerContext =
  | BlueprintContext
  | RefineContext
  | TasksContext
  | ExportContext
  | ImportContext
  | StorageQuotaContext
  | StorageClearContext;
