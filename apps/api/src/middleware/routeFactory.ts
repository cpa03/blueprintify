/**
 * Route Factory Middleware
 *
 * Provides a factory function for creating standardized POST routes
 * with consistent middleware chains (rate limiting + Zod validation).
 * Also supports optional prompt injection detection for AI-related endpoints.
 *
 * @module middleware/routeFactory
 */

import { Hono } from "hono";
import type { z } from "zod";
import { rateLimit, rateLimitConfigs } from "./rateLimit";
import { validateJson, validatePromptInjection, type PromptInjectionField } from "./validator";
import type { Env } from "../types";

/**
 * Creates a Hono route app with a standardized POST endpoint.
 *
 * Wraps the common pattern of:
 * 1. Strict rate limiting
 * 2. Zod schema validation
 * 3. Optional prompt injection detection
 * 4. Controller handler invocation
 *
 * @typeParam T - Zod schema type for request validation
 * @param schema - Zod schema for validating the request body
 * @param handler - Controller handler function receiving the Hono context
 * @param injectionFields - Optional. Fields to check for prompt injection patterns.
 *   When provided, adds injection detection middleware between validation and handler.
 * @returns A Hono app instance with the configured POST route
 */
export function createPostRoute<T extends z.ZodTypeAny>(
  schema: T,
  handler: (
    c: import("hono").Context<{
      Bindings: Env;
      Variables: { validatedData: z.infer<T> };
    }>
  ) => Response | Promise<Response>,
  injectionFields?: PromptInjectionField[]
): Hono<{ Bindings: Env }> {
  const app = new Hono<{ Bindings: Env }>();

  if (injectionFields && injectionFields.length > 0) {
    app.post(
      "/",
      rateLimit(rateLimitConfigs.strict),
      validateJson(schema),
      validatePromptInjection(injectionFields),
      (c) =>
        handler(
          c as unknown as import("hono").Context<{
            Bindings: Env;
            Variables: { validatedData: z.infer<T> };
          }>
        )
    );
  } else {
    app.post("/", rateLimit(rateLimitConfigs.strict), validateJson(schema), (c) =>
      handler(
        c as unknown as import("hono").Context<{
          Bindings: Env;
          Variables: { validatedData: z.infer<T> };
        }>
      )
    );
  }

  return app;
}
