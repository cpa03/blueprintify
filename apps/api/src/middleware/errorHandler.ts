import type { Context } from "hono";
import { createErrorResponse, isAPIError, ErrorType } from "../errors";
import type { ErrorResponse } from "../errors";
import { CircuitBreakerOpenError } from "../utils/circuitBreaker";
import { TimeoutError } from "../utils/timeout";
import { ERROR_CODES, ERROR_MESSAGES, HTTP_STATUS } from "../config/constants";
import { secureLogError } from "../utils/secureLog";

/**
 * Global error handler middleware for the API.
 *
 * Catches all errors thrown in route handlers and returns appropriate
 * JSON error responses with consistent structure.
 *
 * Handles the following error types:
 * - TimeoutError: Returns 504 Gateway Timeout
 * - CircuitBreakerOpenError: Returns 503 Service Unavailable
 * - Zod validation errors: Returns 400 Bad Request with issue details
 * - APIError: Returns the error's status code
 * - Unknown errors: Returns 500 Internal Server Error
 *
 * @param err - The error that was thrown
 * @param c - Hono context object
 * @returns JSON response with error details
 */
export const errorHandler = (err: unknown, c: Context): Response => {
  const requestId = c.get("requestId") as string | undefined;

  secureLogError("API Error", err, {
    path: c.req.path,
    method: c.req.method,
    requestId,
  });

  if (err instanceof TimeoutError) {
    return c.json(
      {
        success: false,
        error: {
          type: ErrorType.SERVICE_UNAVAILABLE,
          message: err.message,
          code: ERROR_CODES.TIMEOUT_ERROR,
          details: {
            timeoutMs: err.timeoutMs,
          },
          timestamp: new Date().toISOString(),
          ...(requestId && { requestId }),
        },
      },
      HTTP_STATUS.GATEWAY_TIMEOUT,
    );
  }

  if (err instanceof CircuitBreakerOpenError) {
    return c.json(
      {
        success: false,
        error: {
          type: ErrorType.SERVICE_UNAVAILABLE,
          message: ERROR_MESSAGES.CIRCUIT_BREAKER_OPEN,
          code: ERROR_CODES.CIRCUIT_BREAKER_OPEN,
          timestamp: new Date().toISOString(),
          ...(requestId && { requestId }),
        },
      },
      HTTP_STATUS.SERVICE_UNAVAILABLE,
    );
  }

  if (err && typeof err === "object" && "issues" in err) {
    const issues = (err as { issues: unknown[] }).issues;

    const errorResponse: ErrorResponse = {
      success: false,
      error: {
        type: ErrorType.VALIDATION,
        message: ERROR_MESSAGES.VALIDATION,
        code: ERROR_CODES.VALIDATION_ERROR,
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
        ...(requestId && { requestId }),
      },
    };

    return c.json(errorResponse, HTTP_STATUS.BAD_REQUEST);
  }

  const errorResponse: ErrorResponse = createErrorResponse(err);
  const statusCode = isAPIError(err)
    ? err.statusCode
    : HTTP_STATUS.INTERNAL_ERROR;

  if (requestId && !errorResponse.error.requestId) {
    errorResponse.error.requestId = requestId;
  }

  return c.json(errorResponse, statusCode as 400 | 401 | 403 | 404 | 500 | 502);
};

/**
 * Not found handler for unmatched routes.
 *
 * Returns a 404 Not Found response for any route that doesn't
 * match defined endpoints. Includes request path and method in error.
 *
 * @param c - Hono context object
 * @returns JSON response with 404 error details
 */
export const notFoundHandler = (c: Context): Response => {
  const requestId = c.get("requestId") as string | undefined;

  return c.json(
    {
      success: false,
      error: {
        type: "not_found",
        message: ERROR_MESSAGES.NOT_FOUND(`${c.req.method} ${c.req.path}`),
        code: ERROR_CODES.NOT_FOUND_ERROR,
        timestamp: new Date().toISOString(),
        ...(requestId && { requestId }),
      },
    },
    HTTP_STATUS.NOT_FOUND,
  );
};

