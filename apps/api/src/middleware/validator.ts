/**
 * Custom Validation Middleware
 * Provides standardized error responses for Zod validation errors
 */

import { z } from "zod";
import type { MiddlewareHandler } from "hono";
import { HTTP_HEADERS, CONTEXT_KEYS } from "@blueprint/shared";
import { ErrorType, createErrorJson } from "../errors";
import { API_HEADERS, HTTP_STATUS, VALIDATION_MESSAGES, ERROR_CODES } from "../config/constants";

/**
 * Custom Zod validator that returns standardized error responses
 * Includes content-type validation for JSON requests
 */
export const validateJson = <T extends z.ZodTypeAny>(
  schema: T
): MiddlewareHandler<{
  Variables: {
    validatedData: z.infer<T>;
  };
}> => {
  return async (c, next) => {
    const contentType = c.req.header(API_HEADERS.REQUEST.CONTENT_TYPE);
    if (!contentType?.includes(HTTP_HEADERS.CONTENT_TYPE_JSON)) {
      return c.json(
        createErrorJson(
          ErrorType.VALIDATION,
          `Content-Type must be ${HTTP_HEADERS.CONTENT_TYPE_JSON}`,
          {
            code: ERROR_CODES.VALIDATION_ERROR,
            details: { expected: HTTP_HEADERS.CONTENT_TYPE_JSON, received: contentType || "none" },
          }
        ),
        HTTP_STATUS.BAD_REQUEST
      );
    }

    try {
      const body = await c.req.json();
      const result = schema.safeParse(body);

      if (!result.success) {
        const errorResponse = createErrorJson(
          ErrorType.VALIDATION,
          VALIDATION_MESSAGES.REQUEST_VALIDATION_FAILED,
          {
            code: ERROR_CODES.VALIDATION_ERROR,
            details: {
              issues: result.error.issues.map((issue) => ({
                path: issue.path,
                message: issue.message,
              })),
            },
          }
        );

        return c.json(errorResponse, HTTP_STATUS.BAD_REQUEST);
      }

      // Attach validated data to the context
      c.set(CONTEXT_KEYS.VALIDATED_DATA, result.data);
      await next();
    } catch {
      return c.json(
        createErrorJson(ErrorType.VALIDATION, VALIDATION_MESSAGES.INVALID_JSON_BODY, {
          code: ERROR_CODES.VALIDATION_ERROR,
        }),
        HTTP_STATUS.BAD_REQUEST
      );
    }
  };
};
