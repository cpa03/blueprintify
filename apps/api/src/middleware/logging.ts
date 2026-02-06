import type { Context, Next } from "hono";
import type { Env } from "../types";

interface LogEntry {
  timestamp: string;
  method: string;
  path: string;
  status: number;
  duration: number;
  ip: string;
  userAgent?: string;
  apiKey?: string;
  rateLimit?: {
    remaining: number;
    limit: number;
  };
  error?: string;
}

export const requestLogger = async (
  c: Context<{ Bindings: Env }>,
  next: Next,
) => {
  const startTime = Date.now();
  const method = c.req.method;
  const path = c.req.path;
  const ip =
    c.req.header("CF-Connecting-IP") ||
    c.req.header("X-Forwarded-For") ||
    "unknown";
  const userAgent = c.req.header("User-Agent");

  const apiKey = (c as any).get("apiKey")?.key;
  const rateLimit = (c as any).get("rateLimit");

  try {
    await next();

    const duration = Date.now() - startTime;
    const status = c.res.status;

    const logEntry: LogEntry = {
      timestamp: new Date().toISOString(),
      method,
      path,
      status,
      duration,
      ip,
      userAgent,
      apiKey: apiKey ? `${apiKey.substring(0, 8)}...` : undefined,
      rateLimit,
    };

    if (status >= 400) {
      logEntry.error = `HTTP ${status} error`;
    }

    console.log("[API Request]", JSON.stringify(logEntry));

    try {
      await c.env.RATE_LIMIT_KV?.put(
        `log:${Date.now()}:${Math.random().toString(36).substring(7)}`,
        JSON.stringify(logEntry),
        { expirationTtl: 86400 },
      );
    } catch (error) {
      console.error("[Log Storage Error]", error);
    }
  } catch (error) {
    const duration = Date.now() - startTime;

    const logEntry: LogEntry = {
      timestamp: new Date().toISOString(),
      method,
      path,
      status: 500,
      duration,
      ip,
      userAgent,
      apiKey: apiKey ? `${apiKey.substring(0, 8)}...` : undefined,
      error: error instanceof Error ? error.message : "Unknown error",
    };

    console.error("[API Request Error]", JSON.stringify(logEntry));

    try {
      await c.env.RATE_LIMIT_KV?.put(
        `log:${Date.now()}:${Math.random().toString(36).substring(7)}`,
        JSON.stringify(logEntry),
        { expirationTtl: 86400 },
      );
    } catch (storageError) {
      console.error("[Log Storage Error]", storageError);
    }

    throw error;
  }
};

export const auditLogger = (action: string) => {
  return async (c: Context<{ Bindings: Env }>, next: Next) => {
    const apiKey = (c as any).get("apiKey")?.key;
    const ip =
      c.req.header("CF-Connecting-IP") ||
      c.req.header("X-Forwarded-For") ||
      "unknown";

    try {
      await next();

      const auditEntry = {
        timestamp: new Date().toISOString(),
        action,
        method: c.req.method,
        path: c.req.path,
        status: c.res.status,
        ip,
        apiKey: apiKey ? `${apiKey.substring(0, 8)}...` : undefined,
      };

      console.log("[Audit Log]", JSON.stringify(auditEntry));

      try {
        await c.env.RATE_LIMIT_KV?.put(
          `audit:${Date.now()}:${Math.random().toString(36).substring(7)}`,
          JSON.stringify(auditEntry),
          { expirationTtl: 7776000 },
        );
      } catch (error) {
        console.error("[Audit Storage Error]", error);
      }
    } catch (error) {
      const auditEntry = {
        timestamp: new Date().toISOString(),
        action,
        method: c.req.method,
        path: c.req.path,
        status: 500,
        ip,
        apiKey: apiKey ? `${apiKey.substring(0, 8)}...` : undefined,
        error: error instanceof Error ? error.message : "Unknown error",
      };

      console.error("[Audit Log Error]", JSON.stringify(auditEntry));

      try {
        await c.env.RATE_LIMIT_KV?.put(
          `audit:${Date.now()}:${Math.random().toString(36).substring(7)}`,
          JSON.stringify(auditEntry),
          { expirationTtl: 7776000 },
        );
      } catch (storageError) {
        console.error("[Audit Storage Error]", storageError);
      }

      throw error;
    }
  };
};
