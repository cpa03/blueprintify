import type { Context, MiddlewareHandler, Next } from "hono";

interface LoggerConfig {
  excludePaths?: string[];
  logRequestBody?: boolean;
  logResponseBody?: boolean;
}

interface RequestLog {
  requestId: string;
  method: string;
  path: string;
  query: Record<string, string>;
  headers: Record<string, string>;
  body?: unknown;
  timestamp: string;
  ip?: string;
  userAgent?: string;
}

interface ResponseLog {
  requestId: string;
  status: number;
  duration: number;
  timestamp: string;
  body?: unknown;
}

const generateRequestId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

export const requestLogger = (config: LoggerConfig = {}): MiddlewareHandler => {
  const {
    excludePaths = ["/"],
    logRequestBody = false,
    logResponseBody = false,
  } = config;

  return async (c: Context, next: Next) => {
    const path = c.req.path;

    if (excludePaths.includes(path)) {
      await next();
      return;
    }

    const requestId = generateRequestId();
    const startTime = Date.now();

    c.set("requestId", requestId);

    const query = c.req.query() as Record<string, string>;

    const headers: Record<string, string> = {};
    const allHeaders = c.req.header();
    Object.entries(allHeaders).forEach(([key, value]) => {
      if (
        !key.toLowerCase().includes("authorization") &&
        !key.toLowerCase().includes("cookie")
      ) {
        headers[key] = value;
      }
    });

    const requestLog: RequestLog = {
      requestId,
      method: c.req.method,
      path,
      query,
      headers,
      timestamp: new Date().toISOString(),
      ip: c.req.header("cf-connecting-ip") || c.req.header("x-forwarded-for"),
      userAgent: c.req.header("user-agent"),
    };

    if (logRequestBody && c.req.method !== "GET") {
      try {
        const clonedReq = c.req.raw.clone();
        requestLog.body = await clonedReq.json();
      } catch {
        requestLog.body = "[unparsable]";
      }
    }

    console.log(
      JSON.stringify({
        type: "request",
        ...requestLog,
      }),
    );

    await next();

    const duration = Date.now() - startTime;
    const status = c.res.status;

    const responseLog: ResponseLog = {
      requestId,
      status,
      duration,
      timestamp: new Date().toISOString(),
    };

    if (logResponseBody) {
      try {
        const clonedRes = c.res.clone();
        responseLog.body = await clonedRes.json();
      } catch {
        responseLog.body = "[unparsable]";
      }
    }

    console.log(
      JSON.stringify({
        type: "response",
        ...responseLog,
      }),
    );
  };
};
