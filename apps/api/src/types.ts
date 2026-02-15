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
  OPENAI_API_KEY: string;
  OPENAI_BASE_URL?: string;
  OPENAI_MODEL?: string;
  API_KEY?: string;
  ENVIRONMENT?: "development" | "production" | "test";
  DB: D1Database;
  CORS_ORIGIN?: string;
  CACHE: KVNamespace;
  BACKGROUND_QUEUE: Queue;
}

// Base context type with environment bindings
export type BaseContext = Context<{
  Bindings: Env;
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
