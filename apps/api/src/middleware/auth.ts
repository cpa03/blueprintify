import type { MiddlewareHandler } from "hono";

interface AuthConfig {
  apiKeyHeader?: string;
  excludePaths?: string[];
}

export const apiKeyAuth = (config: AuthConfig = {}): MiddlewareHandler => {
  const { apiKeyHeader = "x-api-key", excludePaths = ["/"] } = config;

  return async (c, next) => {
    const path = c.req.path;

    if (excludePaths.includes(path)) {
      await next();
      return;
    }

    const providedKey = c.req.header(apiKeyHeader);
    const validKey = c.env.API_KEY;

    if (!validKey) {
      await next();
      return;
    }

    if (!providedKey || providedKey !== validKey) {
      return c.json(
        {
          success: false,
          error: {
            type: "authentication",
            message: "Invalid or missing API key",
            code: "AUTHENTICATION_ERROR",
            timestamp: new Date().toISOString(),
          },
        },
        401,
      );
    }

    await next();
  };
};
