import { describe, it, expect, vi, beforeAll, afterAll } from "vitest";
import { Hono } from "hono";
import storageRoute from "./storage";
import { errorHandler } from "../middleware/errorHandler";
import { MOCK_ENV } from "../test-utils";
import type { ErrorResponse } from "../errors";
import { HTTP_METHODS, HTTP_HEADERS, HTTP_HEADER_NAMES } from "@blueprint/shared";
import { STORAGE_KV_CONFIG } from "../config/constants";

let originalConsoleError: typeof console.error;
beforeAll(() => {
  originalConsoleError = console.error;
  console.error = vi.fn();
});
afterAll(() => {
  console.error = originalConsoleError;
});

const createMockCache = (initialData?: Record<string, string>) => {
  const store = new Map<string, string>(Object.entries(initialData ?? {}));
  return {
    get: vi.fn(async (key: string, type?: string) => {
      const value = store.get(key);
      if (type === "json" && value) {
        return JSON.parse(value);
        return value;
      }
      return value ?? null;
    }),
    put: vi.fn(async (key: string, value: string) => {
      store.set(key, value);
    }),
    delete: vi.fn(async (key: string) => {
      store.delete(key);
    }),
  };
};

const createMockEnv = (cacheData?: Record<string, string>) => ({
  ...MOCK_ENV,
  CACHE: createMockCache(cacheData),
});

describe("GET /storage/quota", () => {
  const app = new Hono<{
    Bindings: { OPENAI_API_KEY: string; CACHE: ReturnType<typeof createMockCache> };
  }>();
  app.route("/", storageRoute);
  app.onError(errorHandler);

  it("should return default storage quota when no data stored", async () => {
    const mockEnv = createMockEnv();
    const res = await app.request("/quota", {}, mockEnv);

    expect(res.status).toBe(200);
    const data = (await res.json()) as {
      success: boolean;
      data: {
        used: number;
        total: number;
        percentage: number;
        projects: number;
        note: string;
      };
    };
    expect(data).toHaveProperty("success", true);
    expect(data.data).toHaveProperty("used", 0);
    expect(data.data).toHaveProperty("total", 5 * 1024 * 1024);
    expect(data.data).toHaveProperty("percentage", 0);
    expect(data.data).toHaveProperty("projects", 0);
    expect(data.data).toHaveProperty("note");
  });

  it("should return stored quota data when available", async () => {
    const storedData = {
      used: 1048576,
      total: 5242880,
      projects: 3,
      updatedAt: new Date().toISOString(),
    };
    const mockEnv = createMockEnv({
      [STORAGE_KV_CONFIG.QUOTA_KEY]: JSON.stringify(storedData),
    });
    const res = await app.request("/quota", {}, mockEnv);

    expect(res.status).toBe(200);
    const data = (await res.json()) as {
      success: boolean;
      data: {
        used: number;
        total: number;
        percentage: number;
        projects: number;
        note: string;
      };
    };
    expect(data).toHaveProperty("success", true);
    expect(data.data).toHaveProperty("used", 1048576);
    expect(data.data).toHaveProperty("total", 5242880);
    expect(data.data).toHaveProperty("percentage", 20);
    expect(data.data).toHaveProperty("projects", 3);
  });
});

describe("POST /storage/report", () => {
  const app = new Hono<{
    Bindings: { OPENAI_API_KEY: string; CACHE: ReturnType<typeof createMockCache> };
  }>();
  app.route("/", storageRoute);
  app.onError(errorHandler);

  it("should report storage usage successfully", async () => {
    const mockEnv = createMockEnv();
    const res = await app.request(
      "/report",
      {
        method: HTTP_METHODS.POST,
        headers: { [HTTP_HEADER_NAMES.CONTENT_TYPE]: HTTP_HEADERS.CONTENT_TYPE_JSON },
        body: JSON.stringify({
          used: 2097152,
          total: 5242880,
          projects: 2,
        }),
      },
      mockEnv
    );

    expect(res.status).toBe(200);
    const data = (await res.json()) as {
      success: boolean;
      data: {
        stored: boolean;
        timestamp: string;
      };
    };
    expect(data).toHaveProperty("success", true);
    expect(data.data).toHaveProperty("stored", true);
    expect(data.data).toHaveProperty("timestamp");
  });

  it("should return 400 for invalid storage report data", async () => {
    const mockEnv = createMockEnv();
    const res = await app.request(
      "/report",
      {
        method: HTTP_METHODS.POST,
        headers: { [HTTP_HEADER_NAMES.CONTENT_TYPE]: HTTP_HEADERS.CONTENT_TYPE_JSON },
        body: JSON.stringify({
          used: -1,
          total: 5242880,
          projects: 2,
        }),
      },
      mockEnv
    );

    expect(res.status).toBe(400);
    const data = (await res.json()) as ErrorResponse;
    expect(data).toHaveProperty("success", false);
    expect(data.error).toHaveProperty("type", "validation");
  });

  it("should return 400 for missing required fields", async () => {
    const mockEnv = createMockEnv();
    const res = await app.request(
      "/report",
      {
        method: HTTP_METHODS.POST,
        headers: { [HTTP_HEADER_NAMES.CONTENT_TYPE]: HTTP_HEADERS.CONTENT_TYPE_JSON },
        body: JSON.stringify({
          used: 1024,
        }),
      },
      mockEnv
    );

    expect(res.status).toBe(400);
  });
});

describe("DELETE /storage/clear", () => {
  const app = new Hono<{
    Bindings: { OPENAI_API_KEY: string; CACHE: ReturnType<typeof createMockCache> };
  }>();
  app.route("/", storageRoute);
  app.onError(errorHandler);

  it("should return 400 if confirmation is missing", async () => {
    const mockEnv = createMockEnv();
    const res = await app.request(
      "/clear",
      {
        method: HTTP_METHODS.DELETE,
        headers: { [HTTP_HEADER_NAMES.CONTENT_TYPE]: HTTP_HEADERS.CONTENT_TYPE_JSON },
        body: JSON.stringify({}),
      },
      mockEnv
    );

    expect(res.status).toBe(400);
    const data = (await res.json()) as ErrorResponse;
    expect(data).toHaveProperty("success", false);
    expect(data.error).toHaveProperty("type", "validation");
  });

  it("should return 400 if confirmation is false", async () => {
    const mockEnv = createMockEnv();
    const res = await app.request(
      "/clear",
      {
        method: HTTP_METHODS.DELETE,
        headers: { [HTTP_HEADER_NAMES.CONTENT_TYPE]: HTTP_HEADERS.CONTENT_TYPE_JSON },
        body: JSON.stringify({ confirm: false }),
      },
      mockEnv
    );

    expect(res.status).toBe(400);
    const data = (await res.json()) as ErrorResponse;
    expect(data.error).toHaveProperty("type", "validation");
    expect(data.error.message).toBeDefined();
  });

  it("should clear storage with valid confirmation", async () => {
    const storedData = {
      used: 1048576,
      total: 5242880,
      projects: 3,
      updatedAt: new Date().toISOString(),
    };
    const mockEnv = createMockEnv({
      [STORAGE_KV_CONFIG.QUOTA_KEY]: JSON.stringify(storedData),
    });
    const res = await app.request(
      "/clear",
      {
        method: HTTP_METHODS.DELETE,
        headers: { [HTTP_HEADER_NAMES.CONTENT_TYPE]: HTTP_HEADERS.CONTENT_TYPE_JSON },
        body: JSON.stringify({ confirm: true }),
      },
      mockEnv
    );

    expect(res.status).toBe(200);
    const data = (await res.json()) as {
      success: boolean;
      data: {
        cleared: boolean;
        timestamp: string;
        message: string;
      };
    };
    expect(data).toHaveProperty("success", true);
    expect(data.data).toHaveProperty("cleared", true);
    expect(data.data).toHaveProperty("timestamp");
    expect(data.data).toHaveProperty("message");
  });
});
