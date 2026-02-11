/**
 * Custom Validation Middleware
 * Provides standardized error responses for Zod validation errors
 */

import { z } from "zod";
import type { MiddlewareHandler } from "hono";
import { ErrorResponse, ErrorType } from "../errors";
import { HTTP_STATUS, VALIDATION_MESSAGES } from "../config/constants";

/**
 * Custom Zod validator that returns standardized error responses
 */
export const validateJson = <T extends z.ZodTypeAny>(
  schema: T,
): MiddlewareHandler<{
  Variables: {
    validatedData: z.infer<T>;
  };
}> => {
  return async (c, next) => {
    try {
      const body = await c.req.json();
      const result = schema.safeParse(body);

      if (!result.success) {
        const errorResponse: ErrorResponse = {
          success: false,
          error: {
            type: ErrorType.VALIDATION,
            message: VALIDATION_MESSAGES.REQUEST_VALIDATION_FAILED,
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

        return c.json(errorResponse, HTTP_STATUS.BAD_REQUEST);
      }

      // Attach validated data to the context
      c.set("validatedData", result.data);
      await next();
    } catch {
      const errorResponse: ErrorResponse = {
        success: false,
        error: {
          type: ErrorType.VALIDATION,
          message: VALIDATION_MESSAGES.INVALID_JSON_BODY,
          code: "VALIDATION_ERROR",
          timestamp: new Date().toISOString(),
        },
      };

      return c.json(errorResponse, HTTP_STATUS.BAD_REQUEST);
    }
  };
};
