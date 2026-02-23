import { describe, it, expect, vi, beforeAll, afterAll } from "vitest";
import { Hono } from "hono";
import shareRoute from "./share";
import { errorHandler } from "../middleware/errorHandler";
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
              created_by: params[6] || "anonymous",
            });
            return { success: true };
          }
          if (query.includes("DELETE")) {
            const id = params[0] as string;
            storedData.delete(id);
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
      env,
    );

    expect(res.status).toBe(200);
    const data = (await res.json()) as {
      success: boolean;
      data: {
        id: string;
        url: string;
        expiresAt: string;
      };
    };
    expect(data.success).toBe(true);
    expect(data.data).toHaveProperty("id");
    expect(data.data).toHaveProperty("url");
    expect(data.data).toHaveProperty("expiresAt");
    expect(data.data.id).toHaveLength(12);
    expect(data.data.url).toContain("/share/");
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
    const data = (await res.json()) as {
      success: boolean;
      error: {
        type: string;
        message: string;
        code: string;
        timestamp: string;
      };
    };
    expect(data.success).toBe(false);
    expect(data.error).toHaveProperty("type");
    expect(data.error).toHaveProperty("message");
    expect(data.error).toHaveProperty("code");
    expect(data.error).toHaveProperty("timestamp");
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
      success: boolean;
      data: {
        id: string;
      };
    };
    expect(data.success).toBe(true);
    expect(data.data).toHaveProperty("id");
    expect(data.data.id).toHaveLength(12);
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
      success: boolean;
      error: {
        type: string;
        message: string;
        code: string;
        timestamp: string;
      };
    };
    expect(data.success).toBe(false);
    expect(data.error).toHaveProperty("type");
    expect(data.error).toHaveProperty("message");
    expect(data.error.message).toContain("Invalid share ID format");
  });

  it("should return 404 for non-existent share", async () => {
    const env = createMockEnv();
    const res = await app.request("/ABC123def456", {}, env);

    expect(res.status).toBe(404);
    const data = (await res.json()) as {
      success: boolean;
      error: {
        type: string;
        message: string;
        code: string;
        timestamp: string;
      };
    };
    expect(data.success).toBe(false);
    expect(data.error.code).toBe("NOT_FOUND_ERROR");
  });
});

describe("DELETE /share/:id", () => {
  const app = new Hono<{ Bindings: ReturnType<typeof createMockEnv> }>();
  app.route("/", shareRoute);
  app.onError(errorHandler);

  it("should delete a shared blueprint", async () => {
    const env = createMockEnv();
    const mockDB = env.DB;

    const createRes = await app.request(
      "/",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: "Test Blueprint",
          blueprint: "# Test",
        }),
      },
      env,
    );

    const createData = (await createRes.json()) as {
      success: boolean;
      data: { id: string };
    };
    const shareId = createData.data.id;

    const res = await app.request(`/${shareId}`, { method: "DELETE" }, env);

    expect(res.status).toBe(200);
    const data = (await res.json()) as {
      success: boolean;
      message: string;
    };
    expect(data.success).toBe(true);
    expect(data.message).toBe("Share deleted successfully");
  });

  it("should return 400 for invalid share ID format on delete", async () => {
    const env = createMockEnv();
    const res = await app.request("/invalid-id", { method: "DELETE" }, env);

    expect(res.status).toBe(400);
    const data = (await res.json()) as {
      success: boolean;
      error: {
        type: string;
        message: string;
        code: string;
        timestamp: string;
      };
    };
    expect(data.success).toBe(false);
    expect(data.error).toHaveProperty("type");
    expect(data.error.message).toContain("Invalid share ID format");
  });

  it("should return 404 for non-existent share on delete", async () => {
    const env = createMockEnv();
    const res = await app.request("/ABC123def456", { method: "DELETE" }, env);

    expect(res.status).toBe(404);
    const data = (await res.json()) as {
      success: boolean;
      error: {
        type: string;
        message: string;
        code: string;
      };
    };
    expect(data.success).toBe(false);
    expect(data.error.code).toBe("NOT_FOUND_ERROR");
  });
});
