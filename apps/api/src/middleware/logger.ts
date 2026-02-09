import type { MiddlewareHandler } from "hono";

interface LogEntry {
  timestamp: string;
  requestId: string;
  method: string;
  url: string;
  userAgent?: string;
  clientIP?: string;
  statusCode?: number;
  responseTime?: number;
  contentLength?: number;
  error?: string;
}

export const requestLogger = (): MiddlewareHandler => {
  return async (c, next) => {
    const startTime = Date.now();
    const requestId = self.crypto.randomUUID();

    const clientIP =
      c.req.header("CF-Connecting-IP") ||
      c.req.header("X-Forwarded-For")?.split(",")[0] ||
      "unknown";

    const userAgent = c.req.header("User-Agent") || "unknown";

    c.set("requestId", requestId);
    c.header("X-Request-ID", requestId);

    const logEntry: LogEntry = {
      timestamp: new Date().toISOString(),
      requestId,
      method: c.req.method,
      url: c.req.url,
      userAgent,
      clientIP,
    };

    try {
      await next();

      logEntry.statusCode = c.res.status;
      logEntry.responseTime = Date.now() - startTime;
      logEntry.contentLength = c.res.headers.get("Content-Length")
        ? parseInt(c.res.headers.get("Content-Length")!)
        : undefined;

      console.log(
        JSON.stringify({
          type: "request",
          ...logEntry,
        }),
      );
    } catch (error) {
      logEntry.statusCode = 500;
      logEntry.responseTime = Date.now() - startTime;
      logEntry.error = error instanceof Error ? error.message : "Unknown error";

      console.error(
        JSON.stringify({
          type: "request_error",
          ...logEntry,
        }),
      );

      throw error;
    }
  };
};

export const securityLogger = (): MiddlewareHandler => {
  return async (c, next) => {
    const clientIP =
      c.req.header("CF-Connecting-IP") ||
      c.req.header("X-Forwarded-For")?.split(",")[0] ||
      "unknown";

    const userAgent = c.req.header("User-Agent") || "unknown";
    const requestId = c.get("requestId") || "unknown";

    const suspiciousPatterns = [
      /\.\./, // Directory traversal
      /<script/i, // XSS attempt
      /union.*select/i, // SQL injection
      /javascript:/i, // JavaScript protocol
      /data:.*base64/i, // Base64 data URLs
    ];

    const url = c.req.url;
    const isSuspicious = suspiciousPatterns.some((pattern) =>
      pattern.test(url),
    );

    if (isSuspicious) {
      console.warn(
        JSON.stringify({
          type: "security_alert",
          timestamp: new Date().toISOString(),
          requestId,
          clientIP,
          userAgent,
          method: c.req.method,
          url,
          reason: "suspicious_request_pattern",
        }),
      );
    }

    await next();
  };
};
