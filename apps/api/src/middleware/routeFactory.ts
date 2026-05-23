/**
 * Route Factory Middleware
 *
 * Provides a factory function for creating standardized POST routes
 * with consistent middleware chains (rate limiting + Zod validation).
 * Reduces boilerplate duplication across route files.
 *
 * @module middleware/routeFactory
 */

import { Hono } from "hono";
import type { z } from "zod";
import { rateLimit, rateLimitConfigs } from "./rateLimit";
import { validateJson } from "./validator";
import type { Env } from "../types";

/**
 * Creates a Hono route app with a standardized POST endpoint.
 *
 * Wraps the common pattern of:
 * 1. Strict rate limiting
 * 2. Zod schema validation
 * 3. Controller handler invocation
 *
 * @typeParam T - Zod schema type for request validation
 * @param schema - Zod schema for validating the request body
 * @param handler - Controller handler function receiving the Hono context
 * @returns A Hono app instance with the configured POST route
 *
 * @example
 * ```typescript
 * import { createPostRoute } from "../middleware/routeFactory";
 * import { MySchema } from "@blueprint/shared";
 * import { MyController } from "../controllers";
 *
 * const controller = new MyController();
 * export default createPostRoute(MySchema, (c) => controller.handle(c));
 * ```
 */
export function createPostRoute<T extends z.ZodTypeAny>(
  schema: T,
  handler: (
    c: import("hono").Context<{
      Bindings: Env;
      Variables: { validatedData: z.infer<T> };
    }>
  ) => Response | Promise<Response>
): Hono<{ Bindings: Env }> {
  const app = new Hono<{ Bindings: Env }>();
  app.post("/", rateLimit(rateLimitConfigs.strict), validateJson(schema), async (c) => handler(c));
  return app;
}
