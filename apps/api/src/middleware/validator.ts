/**
 * Custom Validation Middleware
 * Provides standardized error responses for Zod validation errors
 */

import { z } from "zod";
import type { Context, MiddlewareHandler } from "hono";
import { ErrorResponse, ErrorType } from "../errors";

/**
 * Custom Zod validator that returns standardized error responses
 */
export const validateJson = <T extends z.ZodTypeAny>(
  schema: T,
): MiddlewareHandler => {
  return async (c: Context, next: () => Promise<void>) => {
    try {
      const body = await c.req.json();
      const result = schema.safeParse(body);

      if (!result.success) {
        const errorResponse: ErrorResponse = {
          success: false,
          error: {
            type: "validation" as ErrorType,
            message: "Request validation failed",
            code: "VALIDATION_ERROR",
            details: {
              issues: result.error.issues.map((issue) => ({
                path: issue.path,
                message: issue.message,
              })),
            },
            timestamp: new Date().toISOString(),
          },
        };

        return c.json(errorResponse, 400);
      }

      // Attach validated data to the context
      c.set("validatedData", result.data);
      await next();
    } catch (error) {
      // If JSON parsing fails, return a standard error
      const errorResponse: ErrorResponse = {
        success: false,
        error: {
          type: "validation" as ErrorType,
          message: "Invalid JSON in request body",
          code: "VALIDATION_ERROR",
          timestamp: new Date().toISOString(),
        },
      };

      return c.json(errorResponse, 400);
    }
  };
};
