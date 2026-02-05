/**
 * Error Handler Middleware
 * Centralized error handling for the Blueprint Generator API
 */

import type { Context } from "hono";
import { createErrorResponse, isAPIError, ErrorType } from "../errors";
import type { ErrorResponse } from "../errors";

/**
 * Global error handler middleware
 * Catches all errors and formats them according to the standard error response shape
 */
export const errorHandler = (err: unknown, c: Context) => {
  // Log error for debugging (in production, use proper logging service)
  console.error("[API Error]", {
    error: err instanceof Error ? err.message : err,
    stack: err instanceof Error ? err.stack : undefined,
    path: c.req.path,
    method: c.req.method,
    timestamp: new Date().toISOString(),
  });

  // Handle Zod validation errors
  if (err && typeof err === "object" && "issues" in err) {
    const issues = (err as { issues: unknown[] }).issues;

    const errorResponse: ErrorResponse = {
      success: false,
      error: {
        type: ErrorType.VALIDATION,
        message: "Request validation failed",
        code: "VALIDATION_ERROR",
        details: {
          issues: issues.map((issue) => {
            if (typeof issue === "object" && issue !== null) {
              const i = issue as { path?: string[]; message?: string };
              return {
                path: i.path || [],
                message: i.message || "Validation error",
              };
            }
            return { message: String(issue) };
          }),
        },
        timestamp: new Date().toISOString(),
      },
    };

    return c.json(errorResponse, 400);
  }

  // Create standardized error response
  const errorResponse: ErrorResponse = createErrorResponse(err);

  // Extract status code from error
  const statusCode = isAPIError(err) ? err.statusCode : 500;

  // Return formatted error response
  return c.json(errorResponse, statusCode as 400 | 401 | 403 | 404 | 500 | 502);
};

/**
 * 404 Not Found handler
 * Returns standardized response for undefined routes
 */
export const notFoundHandler = (c: Context) => {
  return c.json(
    {
      success: false,
      error: {
        type: "not_found",
        message: `Route not found: ${c.req.method} ${c.req.path}`,
        code: "NOT_FOUND_ERROR",
        timestamp: new Date().toISOString(),
      },
    },
    404,
  );
};

/**
 * Async handler wrapper
 * Wraps async route handlers to catch and forward errors to the error handler
 */
export const asyncHandler = <T = unknown>(fn: (c: Context) => Promise<T>) => {
  return (c: Context): Promise<T | Response> => {
    return fn(c);
  };
};
