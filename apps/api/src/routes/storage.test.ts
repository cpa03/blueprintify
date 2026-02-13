import { describe, it, expect, vi, beforeAll, afterAll } from "vitest";
import { Hono } from "hono";
import storageRoute from "./storage";
import { errorHandler } from "../middleware/errorHandler";
import { MOCK_ENV } from "../test-utils";
import type { ErrorResponse } from "../errors";

let originalConsoleError: typeof console.error;
beforeAll(() => {
  originalConsoleError = console.error;
  console.error = vi.fn();
});
afterAll(() => {
  console.error = originalConsoleError;
});

describe("GET /storage/quota", () => {
  const app = new Hono<{ Bindings: { OPENAI_API_KEY: string } }>();
  app.route("/", storageRoute);
  app.onError(errorHandler);

  it("should return storage quota information", async () => {
    const res = await app.request("/quota", {}, MOCK_ENV);

    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data).toHaveProperty("success", true);
    expect(data.data).toHaveProperty("used", 0);
    expect(data.data).toHaveProperty("total", 5 * 1024 * 1024);
    expect(data.data).toHaveProperty("percentage", 0);
    expect(data.data).toHaveProperty("projects", 0);
    expect(data.data).toHaveProperty("note");
  });
});

describe("DELETE /storage/clear", () => {
  const app = new Hono<{ Bindings: { OPENAI_API_KEY: string } }>();
  app.route("/", storageRoute);
  app.onError(errorHandler);

  it("should return 400 if confirmation is missing", async () => {
    const res = await app.request(
      "/clear",
      {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      },
      MOCK_ENV,
    );

    expect(res.status).toBe(400);
    const data = (await res.json()) as ErrorResponse;
    expect(data).toHaveProperty("success", false);
    expect(data.error).toHaveProperty("type", "validation");
  });

  it("should return 400 if confirmation is false", async () => {
    const res = await app.request(
      "/clear",
      {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ confirm: false }),
      },
      MOCK_ENV,
    );

    expect(res.status).toBe(400);
    const data = (await res.json()) as ErrorResponse;
    expect(data.error).toHaveProperty("type", "validation");
    // Zod validation returns generic "Request validation failed" message
    expect(data.error.message).toBeDefined();
  });

  it("should clear storage with valid confirmation", async () => {
    const res = await app.request(
      "/clear",
      {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ confirm: true }),
      },
      MOCK_ENV,
    );

    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data).toHaveProperty("success", true);
    expect(data.data).toHaveProperty("cleared", true);
    expect(data.data).toHaveProperty("timestamp");
    expect(data.data).toHaveProperty("message");
  });
});
