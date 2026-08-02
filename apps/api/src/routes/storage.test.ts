import { describe, it, expect, vi, beforeAll, afterAll } from "vitest";
import { Hono } from "hono";
import storageRoute from "./storage";
import { errorHandler } from "../middleware/errorHandler";
import { MOCK_ENV } from "../test-utils";
import type { ErrorResponse } from "../errors";
import type { AppVariables, User } from "../types";
import {
  AUTH_DEFAULTS,
  CONTEXT_KEYS,
  HTTP_STATUS,
  HTTP_METHODS,
  HTTP_HEADERS,
  HTTP_HEADER_NAMES,
  STORAGE_CONFIG,
  BYTE_CONVERSION,
  ERROR_TYPES,
} from "@blueprint/shared";
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
    Variables: AppVariables;
  }>();
  // Set user context for tests since GET /quota requires authorization (#1078)
  app.use("*", async (c, next) => {
    const user: User = { id: "test-user", role: AUTH_DEFAULTS.DEFAULT_ROLE };
    c.set(CONTEXT_KEYS.USER, user);
    await next();
  });
  app.route("/", storageRoute);
  app.onError(errorHandler);

  it("should return default storage quota when no data stored", async () => {
    const mockEnv = createMockEnv();
    const res = await app.request("/quota", {}, mockEnv);

    expect(res.status).toBe(HTTP_STATUS.OK);
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
    expect(data.data).toHaveProperty("total", STORAGE_CONFIG.QUOTA_BYTES);
    expect(data.data).toHaveProperty("percentage", 0);
    expect(data.data).toHaveProperty("projects", 0);
    expect(data.data).toHaveProperty("note");
  });

  it("should return stored quota data when available", async () => {
    const storedData = {
      used: BYTE_CONVERSION.MB,
      total: STORAGE_CONFIG.QUOTA_BYTES,
      projects: 3,
      updatedAt: new Date().toISOString(),
    };
    const mockEnv = createMockEnv({
      [`${STORAGE_KV_CONFIG.QUOTA_KEY}:test-user`]: JSON.stringify(storedData),
    });
    const res = await app.request("/quota", {}, mockEnv);

    expect(res.status).toBe(HTTP_STATUS.OK);
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
    expect(data.data).toHaveProperty("used", BYTE_CONVERSION.MB);
    expect(data.data).toHaveProperty("total", STORAGE_CONFIG.QUOTA_BYTES);
    expect(data.data).toHaveProperty("percentage", 20);
    expect(data.data).toHaveProperty("projects", 3);
  });

  it("should return 401 when no user context is present", async () => {
    const unauthApp = new Hono<{
      Bindings: { OPENAI_API_KEY: string; CACHE: ReturnType<typeof createMockCache> };
      Variables: AppVariables;
    }>();
    unauthApp.route("/", storageRoute);
    unauthApp.onError(errorHandler);

    const mockEnv = createMockEnv();
    const res = await unauthApp.request("/quota", {}, mockEnv);

    expect(res.status).toBe(HTTP_STATUS.UNAUTHORIZED);
    const data = (await res.json()) as ErrorResponse;
    expect(data).toHaveProperty("success", false);
    expect(data.error).toHaveProperty("type", ERROR_TYPES.AUTHENTICATION);
  });

  it("should not publicly cache per-user quota responses", async () => {
    const mockEnv = createMockEnv();
    const res = await app.request("/quota", {}, mockEnv);

    expect(res.status).toBe(HTTP_STATUS.OK);
    const cacheControl = res.headers.get(HTTP_HEADER_NAMES.CACHE_CONTROL) ?? "";
    expect(cacheControl).not.toContain("public");
    expect(cacheControl).toContain("private");
  });

  it("should isolate quota data per user", async () => {
    const cache = createMockCache();
    const env = { ...MOCK_ENV, CACHE: cache };

    const makeUserApp = (userId: string) => {
      const userApp = new Hono<{
        Bindings: { OPENAI_API_KEY: string; CACHE: ReturnType<typeof createMockCache> };
        Variables: AppVariables;
      }>();
      userApp.use("*", async (c, next) => {
        const user: User = { id: userId, role: AUTH_DEFAULTS.DEFAULT_ROLE };
        c.set(CONTEXT_KEYS.USER, user);
        await next();
      });
      userApp.route("/", storageRoute);
      userApp.onError(errorHandler);
      return userApp;
    };
    const appA = makeUserApp("user-a");
    const appB = makeUserApp("user-b");

    const reportRes = await appA.request(
      "/report",
      {
        method: HTTP_METHODS.POST,
        headers: { [HTTP_HEADER_NAMES.CONTENT_TYPE]: HTTP_HEADERS.CONTENT_TYPE_JSON },
        body: JSON.stringify({
          used: BYTE_CONVERSION.MB * 2,
          total: STORAGE_CONFIG.QUOTA_BYTES,
          projects: 2,
        }),
      },
      env
    );
    expect(reportRes.status).toBe(HTTP_STATUS.OK);

    const quotaResB = await appB.request("/quota", {}, env);
    expect(quotaResB.status).toBe(HTTP_STATUS.OK);
    const bodyB = (await quotaResB.json()) as { data: { used: number } };
    expect(bodyB.data.used).toBe(0);

    const quotaResA = await appA.request("/quota", {}, env);
    expect(quotaResA.status).toBe(HTTP_STATUS.OK);
    const bodyA = (await quotaResA.json()) as { data: { used: number } };
    expect(bodyA.data.used).toBe(BYTE_CONVERSION.MB * 2);
  });
});

describe("POST /storage/report", () => {
  const app = new Hono<{
    Bindings: { OPENAI_API_KEY: string; CACHE: ReturnType<typeof createMockCache> };
    Variables: AppVariables;
  }>();
  // Set user context for tests since POST /report requires authorization (#1078)
  app.use("*", async (c, next) => {
    const user: User = { id: "test-user", role: AUTH_DEFAULTS.DEFAULT_ROLE };
    c.set(CONTEXT_KEYS.USER, user);
    await next();
  });
  app.route("/", storageRoute);
  app.onError(errorHandler);

  it("should return 401 when no user context is present", async () => {
    const unauthApp = new Hono<{
      Bindings: { OPENAI_API_KEY: string; CACHE: ReturnType<typeof createMockCache> };
      Variables: AppVariables;
    }>();
    unauthApp.route("/", storageRoute);
    unauthApp.onError(errorHandler);

    const mockEnv = createMockEnv();
    const res = await unauthApp.request(
      "/report",
      {
        method: HTTP_METHODS.POST,
        headers: { [HTTP_HEADER_NAMES.CONTENT_TYPE]: HTTP_HEADERS.CONTENT_TYPE_JSON },
        body: JSON.stringify({
          used: BYTE_CONVERSION.MB,
          total: STORAGE_CONFIG.QUOTA_BYTES,
          projects: 1,
        }),
      },
      mockEnv
    );

    expect(res.status).toBe(HTTP_STATUS.UNAUTHORIZED);
    const data = (await res.json()) as ErrorResponse;
    expect(data).toHaveProperty("success", false);
    expect(data.error).toHaveProperty("type", ERROR_TYPES.AUTHENTICATION);
  });

  it("should report storage usage successfully", async () => {
    const mockEnv = createMockEnv();
    const res = await app.request(
      "/report",
      {
        method: HTTP_METHODS.POST,
        headers: { [HTTP_HEADER_NAMES.CONTENT_TYPE]: HTTP_HEADERS.CONTENT_TYPE_JSON },
        body: JSON.stringify({
          used: BYTE_CONVERSION.MB * 2,
          total: STORAGE_CONFIG.QUOTA_BYTES,
          projects: 2,
        }),
      },
      mockEnv
    );

    expect(res.status).toBe(HTTP_STATUS.OK);
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
          total: STORAGE_CONFIG.QUOTA_BYTES,
          projects: 2,
        }),
      },
      mockEnv
    );

    expect(res.status).toBe(HTTP_STATUS.BAD_REQUEST);
    const data = (await res.json()) as ErrorResponse;
    expect(data).toHaveProperty("success", false);
    expect(data.error).toHaveProperty("type", ERROR_TYPES.VALIDATION);
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

    expect(res.status).toBe(HTTP_STATUS.BAD_REQUEST);
  });
});

describe("DELETE /storage/clear", () => {
  const app = new Hono<{
    Bindings: { OPENAI_API_KEY: string; CACHE: ReturnType<typeof createMockCache> };
    Variables: AppVariables;
  }>();
  // Set user context for tests since DELETE route now requires authorization
  app.use("*", async (c, next) => {
    const user: User = { id: "test-user", role: AUTH_DEFAULTS.DEFAULT_ROLE };
    c.set(CONTEXT_KEYS.USER, user);
    await next();
  });
  app.route("/", storageRoute);
  app.onError(errorHandler);

  it("should return 400 if confirmation is missing", async () => {
    const mockEnv = createMockEnv();
    const res = await app.request("/clear", { method: HTTP_METHODS.DELETE }, mockEnv);

    expect(res.status).toBe(HTTP_STATUS.BAD_REQUEST);
    const data = (await res.json()) as ErrorResponse;
    expect(data).toHaveProperty("success", false);
    expect(data.error).toHaveProperty("type", ERROR_TYPES.VALIDATION);
  });

  it("should return 400 if confirmation is false", async () => {
    const mockEnv = createMockEnv();
    const res = await app.request("/clear?confirm=false", { method: HTTP_METHODS.DELETE }, mockEnv);

    expect(res.status).toBe(HTTP_STATUS.BAD_REQUEST);
    const data = (await res.json()) as ErrorResponse;
    expect(data.error).toHaveProperty("type", ERROR_TYPES.VALIDATION);
    expect(data.error.message).toBeDefined();
  });

  it("should clear storage with valid confirmation", async () => {
    const storedData = {
      used: BYTE_CONVERSION.MB,
      total: STORAGE_CONFIG.QUOTA_BYTES,
      projects: 3,
      updatedAt: new Date().toISOString(),
    };
    const mockEnv = createMockEnv({
      [`${STORAGE_KV_CONFIG.QUOTA_KEY}:test-user`]: JSON.stringify(storedData),
    });
    const res = await app.request("/clear?confirm=true", { method: HTTP_METHODS.DELETE }, mockEnv);

    expect(res.status).toBe(HTTP_STATUS.OK);
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

  it("should clear only the calling user's quota data", async () => {
    const cache = createMockCache({
      [`${STORAGE_KV_CONFIG.QUOTA_KEY}:user-a`]: JSON.stringify({ used: BYTE_CONVERSION.MB }),
      [`${STORAGE_KV_CONFIG.QUOTA_KEY}:user-b`]: JSON.stringify({ used: BYTE_CONVERSION.MB * 2 }),
    });
    const env = { ...MOCK_ENV, CACHE: cache };

    const makeUserApp = (userId: string) => {
      const userApp = new Hono<{
        Bindings: { OPENAI_API_KEY: string; CACHE: ReturnType<typeof createMockCache> };
        Variables: AppVariables;
      }>();
      userApp.use("*", async (c, next) => {
        const user: User = { id: userId, role: AUTH_DEFAULTS.DEFAULT_ROLE };
        c.set(CONTEXT_KEYS.USER, user);
        await next();
      });
      userApp.route("/", storageRoute);
      userApp.onError(errorHandler);
      return userApp;
    };
    const appA = makeUserApp("user-a");

    const res = await appA.request("/clear?confirm=true", { method: HTTP_METHODS.DELETE }, env);
    expect(res.status).toBe(HTTP_STATUS.OK);

    const cleared = await env.CACHE.get(`${STORAGE_KV_CONFIG.QUOTA_KEY}:user-a`);
    expect(cleared).toBeNull();
    const untouched = await env.CACHE.get(`${STORAGE_KV_CONFIG.QUOTA_KEY}:user-b`);
    expect(untouched).not.toBeNull();
  });
});
