import type { MiddlewareHandler } from "hono";
import { ErrorResponse, ErrorType } from "../errors";

export const apiKeyAuth = (): MiddlewareHandler => {
  return async (c, next) => {
    const apiKeysString = c.env.API_KEYS;
    const validApiKeys = apiKeysString
      ? apiKeysString.split(",").map((key: string) => key.trim())
      : [];

    if (c.env.NODE_ENV === "development" || validApiKeys.length === 0) {
      await next();
      return;
    }

    const authHeader = c.req.header("Authorization");
    const apiKey = authHeader?.replace("Bearer ", "");

    if (!apiKey) {
      const errorResponse: ErrorResponse = {
        success: false,
        error: {
          type: ErrorType.AUTHENTICATION,
          message: "API key required",
          code: "API_KEY_REQUIRED",
          timestamp: new Date().toISOString(),
        },
      };

      c.header("WWW-Authenticate", 'Bearer realm="API"');
      return c.json(errorResponse, 401);
    }

    if (!validApiKeys.includes(apiKey)) {
      const errorResponse: ErrorResponse = {
        success: false,
        error: {
          type: ErrorType.AUTHENTICATION,
          message: "Invalid API key",
          code: "INVALID_API_KEY",
          timestamp: new Date().toISOString(),
        },
      };

      c.header("WWW-Authenticate", 'Bearer realm="API", error="invalid_token"');
      return c.json(errorResponse, 401);
    }

    await next();
  };
};

export const optionalApiKeyAuth = (): MiddlewareHandler => {
  return async (c, next) => {
    const apiKeysString = c.env.API_KEYS;
    const validApiKeys = apiKeysString
      ? apiKeysString.split(",").map((key: string) => key.trim())
      : [];

    const authHeader = c.req.header("Authorization");
    const apiKey = authHeader?.replace("Bearer ", "");

    if (apiKey && validApiKeys.length > 0) {
      if (!validApiKeys.includes(apiKey)) {
        const errorResponse: ErrorResponse = {
          success: false,
          error: {
            type: ErrorType.AUTHENTICATION,
            message: "Invalid API key",
            code: "INVALID_API_KEY",
            timestamp: new Date().toISOString(),
          },
        };

        return c.json(errorResponse, 401);
      }
    }

    await next();
  };
};
