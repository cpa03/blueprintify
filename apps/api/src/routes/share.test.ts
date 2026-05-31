import { describe, it, expect, vi, beforeAll, afterAll } from "vitest";
import { Hono } from "hono";
import shareRoute from "./share";
import { errorHandler } from "../middleware/errorHandler";
import type { ErrorResponse } from "../errors";
import type { User, AppVariables } from "../types";
import { DEFAULTS } from "../config/env";

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

function createMockEnv(apiKey?: string) {
  return {
    OPENAI_API_KEY: "test-key",
    API_KEY: apiKey,
    DB: createMockDB(),
    CORS_ORIGIN: DEFAULTS.CORS_ORIGIN,
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
      env
    );

    expect(res.status).toBe(200);
    const body = (await res.json()) as {
      success: true;
      data: { id: string; url: string; expiresAt: string };
    };
    expect(body.success).toBe(true);
    expect(body.data).toHaveProperty("id");
    expect(body.data).toHaveProperty("url");
    expect(body.data).toHaveProperty("expiresAt");
    expect(body.data.id).toHaveLength(12);
    expect(body.data.url).toContain("/share/");
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
      env
    );

    expect(res.status).toBe(400);
    const data = (await res.json()) as ErrorResponse;
    expect(data.success).toBe(false);
    expect(data.error.type).toBe("validation");
    expect(data.error.code).toBe("VALIDATION_ERROR");
    expect(data.error.timestamp).toBeDefined();
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
      env
    );

    expect(res.status).toBe(200);
    const body = (await res.json()) as {
      success: true;
      data: { id: string };
    };
    expect(body.success).toBe(true);
    expect(body.data).toHaveProperty("id");
    expect(body.data.id).toHaveLength(12);
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
    const data = (await res.json()) as ErrorResponse;
    expect(data.success).toBe(false);
    expect(data.error.type).toBe("validation");
    expect(data.error.code).toBe("VALIDATION_ERROR");
    expect(data.error.message).toContain("Invalid share ID format");
  });

  it("should return 404 for non-existent share", async () => {
    const env = createMockEnv();
    const res = await app.request("/ABC123def456", {}, env);

    expect(res.status).toBe(404);
    const data = (await res.json()) as ErrorResponse;
    expect(data.success).toBe(false);
    expect(data.error.type).toBe("not_found");
    expect(data.error.code).toBe("NOT_FOUND_ERROR");
  });
});

describe("DELETE /share/:id", () => {
  const app = new Hono<{ Bindings: ReturnType<typeof createMockEnv>; Variables: AppVariables }>();
  // Set user context for tests since DELETE route now requires authorization
  app.use("*", async (c, next) => {
    const user: User = { id: "test-user", role: "user" };
    c.set("user", user);
    await next();
  });
  app.route("/", shareRoute);
  app.onError(errorHandler);

  it("should delete a shared blueprint", async () => {
    const env = createMockEnv("test-api-key");
    const res = await app.request("/testshare123", { method: "DELETE" }, env);

    expect(res.status).toBe(200);
    const body = (await res.json()) as { success: true; data: { message: string } };
    expect(body.success).toBe(true);
    expect(body.data).toHaveProperty("message", "Share deleted successfully");
  });

  it("should return 400 for invalid share ID format on delete", async () => {
    const env = createMockEnv("test-api-key");
    const res = await app.request("/invalid-id", { method: "DELETE" }, env);

    expect(res.status).toBe(400);
    const data = (await res.json()) as ErrorResponse;
    expect(data.success).toBe(false);
    expect(data.error.type).toBe("validation");
    expect(data.error.code).toBe("VALIDATION_ERROR");
    expect(data.error.message).toContain("Invalid share ID format");
  });

  it("should allow deletion with matching API key", async () => {
    const env = createMockEnv("shared-key-123");
    const postRes = await app.request(
      "/",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: "Owned Blueprint",
          blueprint: "# Owned",
        }),
      },
      env
    );
    const postBody = (await postRes.json()) as { success: true; data: { id: string } };
    const { id } = postBody.data;
    const delRes = await app.request(`/${id}`, { method: "DELETE" }, env);
    expect(delRes.status).toBe(200);
    const delBody = (await delRes.json()) as { success: true; data: { message: string } };
    expect(delBody.success).toBe(true);
    expect(delBody.data.message).toBe("Share deleted successfully");
  });

  it("should reject deletion with mismatched API key", async () => {
    const sharedDb = createMockDB();
    const creatorEnv = {
      OPENAI_API_KEY: "test-key",
      API_KEY: "creator-key-456",
      DB: sharedDb,
      CORS_ORIGIN: DEFAULTS.CORS_ORIGIN,
    };
    const attackerEnv = {
      OPENAI_API_KEY: "test-key",
      API_KEY: "attacker-key-789",
      DB: sharedDb,
      CORS_ORIGIN: DEFAULTS.CORS_ORIGIN,
    };
    const postRes = await app.request(
      "/",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: "Protected Blueprint",
          blueprint: "# Protected",
        }),
      },
      creatorEnv
    );
    const postBody = (await postRes.json()) as { success: true; data: { id: string } };
    const { id } = postBody.data;
    const delRes = await app.request(`/${id}`, { method: "DELETE" }, attackerEnv);
    expect(delRes.status).toBe(403);
    const data = (await delRes.json()) as ErrorResponse;
    expect(data.success).toBe(false);
    expect(data.error.type).toBe("authorization");
    expect(data.error.code).toBe("AUTHORIZATION_ERROR");
  });

  it("should allow deletion without API key", async () => {
    const env = createMockEnv();
    const postRes = await app.request(
      "/",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: "Legacy Blueprint",
          blueprint: "# Legacy",
        }),
      },
      env
    );
    const postBody = (await postRes.json()) as { success: true; data: { id: string } };
    const { id } = postBody.data;
    const delRes = await app.request(`/${id}`, { method: "DELETE" }, env);
    expect(delRes.status).toBe(200);
    const delBody = (await delRes.json()) as { success: true; data: { message: string } };
    expect(delBody.success).toBe(true);
    expect(delBody.data.message).toBe("Share deleted successfully");
  });
});
