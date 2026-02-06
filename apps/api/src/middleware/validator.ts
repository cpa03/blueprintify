import { z } from "zod";
import type { MiddlewareHandler } from "hono";
import { ErrorResponse, ErrorType } from "../errors";

export const validateJson = <T extends z.ZodTypeAny>(
  schema: T,
): MiddlewareHandler => {
  return async (c, next) => {
    try {
      const body = await c.req.json();
      const result = schema.safeParse(body);

      if (!result.success) {
        const errorResponse: ErrorResponse = {
          success: false,
          error: {
            type: ErrorType.VALIDATION,
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

      (c as any).set("validatedData", result.data);
      await next();
    } catch {
      const errorResponse: ErrorResponse = {
        success: false,
        error: {
          type: ErrorType.VALIDATION,
          message: "Invalid JSON in request body",
          code: "VALIDATION_ERROR",
          timestamp: new Date().toISOString(),
        },
      };

      return c.json(errorResponse, 400);
    }
  };
};
