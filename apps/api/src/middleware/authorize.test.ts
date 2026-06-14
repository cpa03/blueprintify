/**
 * Authorization Middleware Tests
 *
 * Tests for RBAC (Role-Based Access Control) middleware.
 * Verifies correct enforcement of minimum role requirements,
 * proper error responses for insufficient permissions, and
 * correct handling of missing/unknown user contexts.
 */
import { describe, it, expect } from "vitest";
import { Hono } from "hono";
import { authorize } from "./authorize";
import { ERROR_CODES } from "../config/constants";
import { AUTH_DEFAULTS, HTTP_STATUS, CONTEXT_KEYS } from "@blueprint/shared";
import type { User, UserRole, AppVariables } from "../types";

/**
 * Creates a minimal Hono app with the authorize middleware applied.
 * Sets user context based on the provided user object before
 * the authorize middleware runs.
 */
function createTestApp(minimumRole: UserRole, user: User | undefined) {
  const app = new Hono<{ Variables: AppVariables }>();

  // Middleware that sets user context (simulates auth middleware)
  app.use("*", async (c, next) => {
    c.set(CONTEXT_KEYS.USER, user);
    await next();
  });

  // Authorization middleware under test
  app.use("/protected/*", authorize(minimumRole));

  app.get("/protected/resource", (c) => c.json({ success: true, data: "protected data" }));
  app.get("/public", (c) => c.json({ success: true, data: "public data" }));

  return app;
}

describe("authorize middleware", () => {
  describe("when user is authenticated", () => {
    it("should allow access when user role meets minimum requirement", async () => {
      const user: User = { id: "user-1", role: AUTH_DEFAULTS.DEFAULT_ROLE };
      const app = createTestApp(AUTH_DEFAULTS.DEFAULT_ROLE, user);

      const res = await app.request("/protected/resource");

      expect(res.status).toBe(HTTP_STATUS.OK);
      const data = (await res.json()) as { success: boolean };
      expect(data.success).toBe(true);
    });

    it("should allow admin access to user-level resources", async () => {
      const user: User = { id: "admin-1", role: AUTH_DEFAULTS.ADMIN_ROLE };
      const app = createTestApp(AUTH_DEFAULTS.DEFAULT_ROLE, user);

      const res = await app.request("/protected/resource");

      expect(res.status).toBe(HTTP_STATUS.OK);
    });

    it("should allow admin access to admin-level resources", async () => {
      const user: User = { id: "admin-1", role: AUTH_DEFAULTS.ADMIN_ROLE };
      const app = createTestApp(AUTH_DEFAULTS.ADMIN_ROLE, user);

      const res = await app.request("/protected/resource");

      expect(res.status).toBe(HTTP_STATUS.OK);
    });

    it("should deny user access to admin-level resources with 403", async () => {
      const user: User = { id: "user-1", role: AUTH_DEFAULTS.DEFAULT_ROLE };
      const app = createTestApp(AUTH_DEFAULTS.ADMIN_ROLE, user);

      const res = await app.request("/protected/resource");

      expect(res.status).toBe(HTTP_STATUS.FORBIDDEN);
      const data = (await res.json()) as {
        success: boolean;
        error: { type: string; code: string; details: { requiredRole: string; userRole: string } };
      };
      expect(data.success).toBe(false);
      expect(data.error.type).toBe("authorization");
      expect(data.error.details.requiredRole).toBe(AUTH_DEFAULTS.ADMIN_ROLE);
      expect(data.error.details.userRole).toBe(AUTH_DEFAULTS.DEFAULT_ROLE);
    });

    it("should not affect unprotected routes regardless of role", async () => {
      const user: User = { id: "user-1", role: AUTH_DEFAULTS.DEFAULT_ROLE };
      const app = createTestApp(AUTH_DEFAULTS.ADMIN_ROLE, user);

      const res = await app.request("/public");

      expect(res.status).toBe(HTTP_STATUS.OK);
      const data = (await res.json()) as { data: string };
      expect(data.data).toBe("public data");
    });
  });

  describe("when user is not authenticated", () => {
    it("should return 401 when no user context is set", async () => {
      const app = createTestApp(AUTH_DEFAULTS.DEFAULT_ROLE, undefined);

      const res = await app.request("/protected/resource");

      expect(res.status).toBe(HTTP_STATUS.UNAUTHORIZED);
      const data = (await res.json()) as {
        success: boolean;
        error: { type: string; code: string };
      };
      expect(data.success).toBe(false);
      expect(data.error.type).toBe("authentication");
      expect(data.error.code).toBe(ERROR_CODES.AUTHENTICATION_ERROR);
    });
  });

  describe("edge cases", () => {
    it("should handle user with unknown role gracefully", async () => {
      const user = { id: "unknown-1", role: "unknown" } as unknown as User;
      const app = createTestApp(AUTH_DEFAULTS.DEFAULT_ROLE, user);

      const res = await app.request("/protected/resource");

      // Unknown role should fail authorization (level -1 < required 0)
      expect(res.status).toBe(HTTP_STATUS.FORBIDDEN);
    });

    it("should handle minimum role of user correctly", async () => {
      const user: User = { id: "user-1", role: AUTH_DEFAULTS.DEFAULT_ROLE };
      const app = createTestApp(AUTH_DEFAULTS.DEFAULT_ROLE, user);

      const res = await app.request("/protected/resource");

      expect(res.status).toBe(HTTP_STATUS.OK);
    });

    it("should return 403 with details on role mismatch", async () => {
      const user: User = { id: "user-1", role: AUTH_DEFAULTS.DEFAULT_ROLE };
      const app = createTestApp(AUTH_DEFAULTS.ADMIN_ROLE, user);

      const res = await app.request("/protected/resource");
      const data = (await res.json()) as {
        error: { code: string; details: { requiredRole: string; userRole: string } };
      };

      expect(data.error.code).toBe(ERROR_CODES.AUTHORIZATION_ERROR);
      expect(data.error.details).toEqual({
        requiredRole: AUTH_DEFAULTS.ADMIN_ROLE,
        userRole: AUTH_DEFAULTS.DEFAULT_ROLE,
      });
    });
  });
});
