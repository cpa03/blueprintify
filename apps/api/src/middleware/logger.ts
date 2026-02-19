import type { Context, MiddlewareHandler, Next } from "hono";

interface LoggerConfig {
  excludePaths?: string[];
  logRequestBody?: boolean;
  logResponseBody?: boolean;
}

interface CloudflareRequestMetadata {
  rayId?: string;
  country?: string;
  connectingIp?: string;
  city?: string;
  datacenter?: string;
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
  cloudflare?: CloudflareRequestMetadata;
}

interface ResponseLog {
  requestId: string;
  status: number;
  duration: number;
  timestamp: string;
  body?: unknown;
  cfRay?: string;
}

const generateRequestId = (): string => {
  const randomValues = new Uint32Array(2);
  crypto.getRandomValues(randomValues);
  const timestamp = Date.now();
  const random = (randomValues[0] ?? 0).toString(36);
  const random2 = (randomValues[1] ?? 0).toString(36).slice(0, 4);
  return `${timestamp}-${random}${random2}`;
};

const extractCloudflareMetadata = (c: Context): CloudflareRequestMetadata => {
  return {
    rayId: c.req.header("cf-ray"),
    country: c.req.header("cf-ipcountry"),
    connectingIp: c.req.header("cf-connecting-ip"),
    city: c.req.header("cf-ipcity"),
    datacenter: c.req.header("cf-worker-dc"),
  };
};

const hasCloudflareMetadata = (
  metadata: CloudflareRequestMetadata,
): boolean => {
  return Object.values(metadata).some((v) => v !== undefined);
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
    const cfMetadata = extractCloudflareMetadata(c);

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
      ip: cfMetadata.connectingIp || c.req.header("x-forwarded-for"),
      userAgent: c.req.header("user-agent"),
    };

    if (hasCloudflareMetadata(cfMetadata)) {
      requestLog.cloudflare = cfMetadata;
    }

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

    c.header("X-Request-ID", requestId);
    c.header("X-Response-Time", `${duration}ms`);

    if (cfMetadata.rayId) {
      c.header("X-CF-Ray", cfMetadata.rayId);
    }

    const responseLog: ResponseLog = {
      requestId,
      status,
      duration,
      timestamp: new Date().toISOString(),
    };

    if (cfMetadata.rayId) {
      responseLog.cfRay = cfMetadata.rayId;
    }

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
