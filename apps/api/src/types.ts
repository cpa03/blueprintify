/// <reference types="@cloudflare/workers-types" />

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
  ENVIRONMENT?: "development" | "production" | "test";
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
}

export interface AppVariables {
  requestId?: string;
  validatedData?: unknown;
}

export type AppContext = Context<{
  Bindings: Env;
  Variables: AppVariables;
}>;

// Base context type with environment bindings
export type BaseContext = Context<{
  Bindings: Env;
  Variables: AppVariables;
}>;

// Generic context type with validated data
export type ValidatedContext<T extends z.ZodSchema> = Context<{
  Bindings: Env;
  Variables: {
    validatedData: z.infer<T>;
  };
}>;

// Context types with validated data from middleware
export type BlueprintContext = ValidatedContext<typeof BlueprintRequestSchema>;
export type RefineContext = ValidatedContext<typeof RefineRequestSchema>;
export type TasksContext = ValidatedContext<typeof TaskGenerationRequestSchema>;
export type ExportContext = ValidatedContext<typeof ExportRequestSchema>;
export type ImportContext = ValidatedContext<typeof ImportRequestSchema>;
export type StorageQuotaContext = ValidatedContext<typeof StorageQuotaSchema>;
export type StorageClearContext = ValidatedContext<
  typeof StorageClearRequestSchema
>;

// Union type for all controller contexts
export type ControllerContext =
  | BlueprintContext
  | RefineContext
  | TasksContext
  | ExportContext
  | ImportContext
  | StorageQuotaContext
  | StorageClearContext;
