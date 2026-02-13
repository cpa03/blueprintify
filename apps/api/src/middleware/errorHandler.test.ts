import { describe, it, expect, vi, beforeAll, afterAll } from "vitest";
import { Hono } from "hono";
import { errorHandler, notFoundHandler } from "./errorHandler";
import {
  ValidationError,
  AuthenticationError,
  NotFoundError,
  ConfigurationError,
  InternalServerError,
} from "../errors";
import { CircuitBreakerOpenError } from "../utils/circuitBreaker";
import type { ErrorResponse } from "../errors";

describe("errorHandler", () => {
  let originalConsoleError: typeof console.error;

  beforeAll(() => {
    originalConsoleError = console.error;
    console.error = vi.fn();
  });

  afterAll(() => {
    console.error = originalConsoleError;
  });

  it("should handle ValidationError with 400 status", async () => {
    const app = new Hono();
    app.get("/", () => {
      throw new ValidationError("Invalid input");
    });
    app.onError(errorHandler);

    const res = await app.request("/");

    expect(res.status).toBe(400);
    const data = (await res.json()) as ErrorResponse;
    expect(data.success).toBe(false);
    expect(data.error.type).toBe("validation");
    expect(data.error.code).toBe("VALIDATION_ERROR");
  });

  it("should handle AuthenticationError with 401 status", async () => {
    const app = new Hono();
    app.get("/", () => {
      throw new AuthenticationError("Auth required");
    });
    app.onError(errorHandler);

    const res = await app.request("/");

    expect(res.status).toBe(401);
    const data = (await res.json()) as ErrorResponse;
    expect(data.success).toBe(false);
    expect(data.error.type).toBe("authentication");
  });

  it("should handle NotFoundError with 404 status", async () => {
    const app = new Hono();
    app.get("/", () => {
      throw new NotFoundError("Resource not found");
    });
    app.onError(errorHandler);

    const res = await app.request("/");

    expect(res.status).toBe(404);
    const data = (await res.json()) as ErrorResponse;
    expect(data.success).toBe(false);
    expect(data.error.type).toBe("not_found");
  });

  it("should handle ConfigurationError with 500 status", async () => {
    const app = new Hono();
    app.get("/", () => {
      throw new ConfigurationError("Config error");
    });
    app.onError(errorHandler);

    const res = await app.request("/");

    expect(res.status).toBe(500);
    const data = (await res.json()) as ErrorResponse;
    expect(data.success).toBe(false);
    expect(data.error.type).toBe("configuration");
  });

  it("should handle CircuitBreakerOpenError with 503 status", async () => {
    const app = new Hono();
    app.get("/", () => {
      throw new CircuitBreakerOpenError("Service unavailable");
    });
    app.onError(errorHandler);

    const res = await app.request("/");

    expect(res.status).toBe(503);
    const data = (await res.json()) as ErrorResponse;
    expect(data.success).toBe(false);
    expect(data.error.type).toBe("service_unavailable");
    expect(data.error.code).toBe("CIRCUIT_BREAKER_OPEN");
  });

  it("should handle generic Error with 500 status", async () => {
    const app = new Hono();
    app.get("/", () => {
      throw new Error("Something went wrong");
    });
    app.onError(errorHandler);

    const res = await app.request("/");

    expect(res.status).toBe(500);
    const data = (await res.json()) as ErrorResponse;
    expect(data.success).toBe(false);
    expect(data.error.type).toBe("internal");
    expect(data.error.message).toBe("Something went wrong");
  });

  it("should include timestamp in all error responses", async () => {
    const app = new Hono();
    app.get("/", () => {
      throw new Error("Test error");
    });
    app.onError(errorHandler);

    const res = await app.request("/");
    const data = (await res.json()) as ErrorResponse;

    expect(data.error.timestamp).toBeDefined();
    expect(new Date(data.error.timestamp).getTime()).not.toBeNaN();
  });

  it("should log errors to console", async () => {
    const app = new Hono();
    app.get("/", () => {
      throw new Error("Logged error");
    });
    app.onError(errorHandler);

    await app.request("/");

    expect(console.error).toHaveBeenCalled();
    const mockFn = console.error as unknown as ReturnType<typeof vi.fn>;
    const logCall = mockFn.mock.calls[0];
    expect(logCall).toBeDefined();
    expect(logCall![0]).toContain("API Error");
  });
});

describe("notFoundHandler", () => {
  it("should return 404 for undefined routes", async () => {
    const app = new Hono();
    app.get("/exists", (c) => c.json({ exists: true }));
    app.notFound(notFoundHandler);

    const res = await app.request("/does-not-exist");

    expect(res.status).toBe(404);
    const data = (await res.json()) as ErrorResponse;
    expect(data.success).toBe(false);
    expect(data.error.type).toBe("not_found");
    expect(data.error.code).toBe("NOT_FOUND_ERROR");
  });

  it("should include the requested path in error message", async () => {
    const app = new Hono();
    app.notFound(notFoundHandler);

    const res = await app.request("/missing/route");

    expect(res.status).toBe(404);
    const data = (await res.json()) as ErrorResponse;
    expect(data.error.message).toContain("/missing/route");
  });

  it("should include timestamp in 404 response", async () => {
    const app = new Hono();
    app.notFound(notFoundHandler);

    const res = await app.request("/not-found");
    const data = (await res.json()) as ErrorResponse;

    expect(data.error.timestamp).toBeDefined();
  });
});
