import type { Context } from "hono";
import type { z } from "zod";
import type {
  BlueprintRequestSchema,
  RefineRequestSchema,
  TaskGenerationRequestSchema,
} from "@blueprint/shared";

export interface Env {
  OPENAI_API_KEY: string;
  OPENAI_BASE_URL?: string;
  OPENAI_MODEL?: string;
}

// Context types with validated data from middleware
export type BlueprintContext = Context<{
  Bindings: Env;
  Variables: {
    validatedData: z.infer<typeof BlueprintRequestSchema>;
  };
}>;

export type RefineContext = Context<{
  Bindings: Env;
  Variables: {
    validatedData: z.infer<typeof RefineRequestSchema>;
  };
}>;

export type TasksContext = Context<{
  Bindings: Env;
  Variables: {
    validatedData: z.infer<typeof TaskGenerationRequestSchema>;
  };
}>;
