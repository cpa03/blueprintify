/**
 * Custom Validation Middleware
 * Provides standardized error responses for Zod validation errors.
 * Includes optional prompt injection detection for AI-related endpoints.
 */

import { z } from "zod";
import type { MiddlewareHandler } from "hono";
import { HTTP_HEADERS, CONTEXT_KEYS } from "@blueprint/shared";
import { ErrorType, createErrorJson } from "../errors";
import {
  API_HEADERS,
  HTTP_STATUS,
  VALIDATION_MESSAGES,
  ERROR_MESSAGES,
  ERROR_CODES,
} from "../config/constants";
import { detectInjectionPatterns } from "../config/prompt-security";

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
        const errorResponse = createErrorJson(ErrorType.VALIDATION, ERROR_MESSAGES.VALIDATION, {
          code: ERROR_CODES.VALIDATION_ERROR,
          details: {
            issues: result.error.issues.map((issue) => ({
              path: issue.path,
              message: issue.message,
            })),
          },
        });

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

/**
 * Field specifications for prompt injection validation.
 * Defines which fields in a validated object should be checked for
 * prompt injection patterns. Used by validatePromptInjection middleware.
 */
export interface PromptInjectionField {
  /** Dot-separated path to the field (e.g., "description", "techStack.name") */
  path: string;
  /** Human-readable label for error messages */
  label: string;
}

/**
 * Middleware that validates input fields for prompt injection patterns.
 * Composable after validateJson — runs injection detection on specified
 * fields of the already-validated request body.
 *
 * This provides defense-in-depth at the API boundary, rejecting requests
 * that contain prompt injection attempts BEFORE they reach the AI service.
 *
 * @param fields - Array of field specifications to check for injection
 * @returns Middleware handler that rejects on injection detection
 *
 * @example
 * ```typescript
 * router.post("/generate",
 *   validateJson(BlueprintRequestSchema),
 *   validatePromptInjection([
 *     { path: "description", label: "description" },
 *     { path: "projectName", label: "project name" },
 *   ]),
 *   generateController.generateBlueprint
 * );
 * ```
 */
export const validatePromptInjection = (fields: PromptInjectionField[]): MiddlewareHandler => {
  return async (c, next) => {
    const data = c.get(CONTEXT_KEYS.VALIDATED_DATA) as Record<string, unknown>;
    if (!data) {
      await next();
      return;
    }

    for (const field of fields) {
      const value = getNestedValue(data, field.path);
      if (typeof value === "string" && value.length > 0) {
        const detected = detectInjectionPatterns(value);
        if (detected.length > 0) {
          return c.json(
            createErrorJson(ErrorType.VALIDATION, ERROR_MESSAGES.VALIDATION, {
              code: ERROR_CODES.VALIDATION_ERROR,
              details: {
                field: field.path,
                message: `Input in '${field.label}' contains potentially unsafe content. Please remove any instructions directed at the AI system and try again.`,
              },
            }),
            HTTP_STATUS.BAD_REQUEST
          );
        }
      }
      if (Array.isArray(value)) {
        for (const element of value) {
          if (typeof element === "string" && element.length > 0) {
            const detected = detectInjectionPatterns(element);
            if (detected.length > 0) {
              return c.json(
                createErrorJson(ErrorType.VALIDATION, ERROR_MESSAGES.VALIDATION, {
                  code: ERROR_CODES.VALIDATION_ERROR,
                  details: {
                    field: field.path,
                    message: `Input in '${field.label}' contains potentially unsafe content. Please remove any instructions directed at the AI system and try again.`,
                  },
                }),
                HTTP_STATUS.BAD_REQUEST
              );
            }
          }
        }
      }
    }

    await next();
  };
};

function getNestedValue(obj: Record<string, unknown>, path: string): unknown {
  return path.split(".").reduce<unknown>((current, key) => {
    if (current && typeof current === "object" && key in current) {
      return (current as Record<string, unknown>)[key];
    }
    return undefined;
  }, obj);
}
