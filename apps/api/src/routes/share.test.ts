import { describe, it, expect, vi, beforeAll, afterAll } from "vitest";
import { Hono } from "hono";
import shareRoute from "./share";
import { errorHandler } from "../middleware/errorHandler";
import type { ErrorResponse } from "../errors";

let originalConsoleError: typeof console.error;
beforeAll(() => {
  originalConsoleError = console.error;
  console.error = vi.fn();
});
afterAll(() => {
  console.error = originalConsoleError;
});

function createMockDB() {
  const storedData = new Map<string, Record<string, unknown>>();

  return {
    prepare: vi.fn((query: string) => ({
      bind: vi.fn((...params: unknown[]) => ({
        run: vi.fn(async () => {
          if (query.includes("INSERT")) {
            const id = params[0] as string;
            storedData.set(id, {
              id,
              title: params[1],
              blueprint: params[2],
              metadata: params[3],
              created_at: params[4],
              expires_at: params[5],
            });
            return { success: true };
          }
          return { success: true };
        }),
        first: vi.fn(async () => {
          if (query.includes("SELECT") && params[0]) {
            return storedData.get(params[0] as string) || null;
          }
          return null;
        }),
      })),
    })),
  };
}

function createMockEnv() {
  return {
    OPENAI_API_KEY: "test-key",
    DB: createMockDB(),
    CORS_ORIGIN: "http://localhost:3000",
  };
}

describe("POST /share", () => {
  const app = new Hono<{ Bindings: ReturnType<typeof createMockEnv> }>();
  app.route("/", shareRoute);
  app.onError(errorHandler);

  it("should create a shareable blueprint link", async () => {
    const env = createMockEnv();
    const res = await app.request(
      "/",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: "Test Blueprint",
          blueprint: "# Test\n\nThis is a test blueprint",
          metadata: {
            projectName: "Test Project",
            techStack: ["React", "TypeScript"],
            author: "Test Author",
          },
        }),
      },
      env,
    );

    expect(res.status).toBe(200);
    const data = (await res.json()) as {
      id: string;
      url: string;
      expiresAt: string;
    };
    expect(data).toHaveProperty("id");
    expect(data).toHaveProperty("url");
    expect(data).toHaveProperty("expiresAt");
    expect(data.id).toHaveLength(12);
    expect(data.url).toContain("/share/");
  });

  it("should return 400 for invalid request body", async () => {
    const env = createMockEnv();
    const res = await app.request(
      "/",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: "",
          blueprint: "",
        }),
      },
      env,
    );

    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data).toHaveProperty("error");
    expect(data).toHaveProperty("message");
  });

  it("should create share without optional metadata", async () => {
    const env = createMockEnv();
    const res = await app.request(
      "/",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: "Simple Blueprint",
          blueprint: "# Simple",
        }),
      },
      env,
    );

    expect(res.status).toBe(200);
    const data = (await res.json()) as {
      id: string;
    };
    expect(data).toHaveProperty("id");
    expect(data.id).toHaveLength(12);
  });
});

describe("GET /share/:id", () => {
  const app = new Hono<{ Bindings: ReturnType<typeof createMockEnv> }>();
  app.route("/", shareRoute);
  app.onError(errorHandler);

  it("should return 400 for invalid share ID format", async () => {
    const env = createMockEnv();
    const res = await app.request("/invalid-id", {}, env);

    expect(res.status).toBe(400);
    const data = (await res.json()) as {
      error: string;
      message: string;
    };
    expect(data).toHaveProperty("error");
    expect(data).toHaveProperty("message");
    expect(data.message).toContain("Invalid share ID format");
  });

  it("should return 404 for non-existent share", async () => {
    const env = createMockEnv();
    const res = await app.request("/ABC123def456", {}, env);

    expect(res.status).toBe(404);
    const data = (await res.json()) as ErrorResponse;
    expect(data.error).toBe("NOT_FOUND_ERROR");
  });
});

describe("DELETE /share/:id", () => {
  const app = new Hono<{ Bindings: ReturnType<typeof createMockEnv> }>();
  app.route("/", shareRoute);
  app.onError(errorHandler);

  it("should delete a shared blueprint", async () => {
    const env = createMockEnv();
    const res = await app.request("/test-share-id", { method: "DELETE" }, env);

    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data).toHaveProperty("message", "Share deleted successfully");
  });
});
