import type { MiddlewareHandler } from "hono";

export const enhancedSecurityHeaders = (): MiddlewareHandler => {
  return async (c, next) => {
    // Content Security Policy
    c.header(
      "Content-Security-Policy",
      "default-src 'self'; " +
        "script-src 'self' 'unsafe-inline'; " +
        "style-src 'self' 'unsafe-inline'; " +
        "img-src 'self' data: https:; " +
        "font-src 'self'; " +
        "connect-src 'self'; " +
        "frame-ancestors 'none'; " +
        "base-uri 'self'; " +
        "form-action 'self';",
    );

    // Prevent MIME type sniffing
    c.header("X-Content-Type-Options", "nosniff");

    // Enable XSS protection (legacy but still useful)
    c.header("X-XSS-Protection", "1; mode=block");

    // Referrer policy
    c.header("Referrer-Policy", "strict-origin-when-cross-origin");

    // Permissions policy
    c.header(
      "Permissions-Policy",
      "camera=(), " +
        "microphone=(), " +
        "geolocation=(), " +
        "payment=(), " +
        "usb=(), " +
        "magnetometer=(), " +
        "gyroscope=(), " +
        "accelerometer=()",
    );

    // Strict transport security (only in production with HTTPS)
    if (c.req.url.startsWith("https://")) {
      c.header(
        "Strict-Transport-Security",
        "max-age=31536000; includeSubDomains; preload",
      );
    }

    // Remove server signature
    c.header("Server", "");

    await next();
  };
};
