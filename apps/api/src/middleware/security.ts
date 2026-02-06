import type { Context, Next } from "hono";
import { z } from "zod";

const SecurityHeadersSchema = z.object({
  "Content-Security-Policy": z
    .string()
    .default(
      "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self'; connect-src 'self'; frame-ancestors 'none';",
    ),
  "X-Content-Type-Options": z.string().default("nosniff"),
  "X-Frame-Options": z.string().default("DENY"),
  "X-XSS-Protection": z.string().default("1; mode=block"),
  "Referrer-Policy": z.string().default("strict-origin-when-cross-origin"),
  "Permissions-Policy": z
    .string()
    .default(
      "geolocation=(), microphone=(), camera=(), payment=(), usb=(), magnetometer=(), gyroscope=(), accelerometer=(), ambient-light-sensor=()",
    ),
  "Strict-Transport-Security": z
    .string()
    .default("max-age=31536000; includeSubDomains"),
});

export const securityHeaders = async (c: Context, next: Next) => {
  const headers = SecurityHeadersSchema.parse({});

  Object.entries(headers).forEach(([key, value]) => {
    c.header(key, value);
  });

  await next();
};

export const sanitizeInput = (input: unknown): unknown => {
  if (typeof input === "string") {
    return input
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
      .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, "")
      .replace(/javascript:/gi, "")
      .replace(/on\w+\s*=/gi, "")
      .trim();
  }

  if (Array.isArray(input)) {
    return input.map(sanitizeInput);
  }

  if (typeof input === "object" && input !== null) {
    const sanitized: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(input)) {
      sanitized[key] = sanitizeInput(value);
    }
    return sanitized;
  }

  return input;
};

export const requestSanitizer = async (c: Context, next: Next) => {
  if (
    c.req.method === "POST" ||
    c.req.method === "PUT" ||
    c.req.method === "PATCH"
  ) {
    try {
      const body = await c.req.json();
      const sanitizedBody = sanitizeInput(body);

      (c as any).set("sanitizedBody", sanitizedBody);
    } catch (error) {
      console.error("[Request Sanitizer Error]", error);
    }
  }

  await next();
};

export const validateOrigin = (allowedOrigins: string[]) => {
  return async (c: Context, next: Next) => {
    const origin = c.req.header("Origin");
    const referer = c.req.header("Referer");

    const requestOrigin = origin || referer;

    if (
      requestOrigin &&
      !allowedOrigins.some((allowed) => requestOrigin.startsWith(allowed))
    ) {
      return c.json(
        {
          success: false,
          error: {
            type: "security_error",
            message: "Cross-origin request not allowed",
            code: "INVALID_ORIGIN",
            timestamp: new Date().toISOString(),
          },
        },
        403,
      );
    }

    await next();
  };
};
