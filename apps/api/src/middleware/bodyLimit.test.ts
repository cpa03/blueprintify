/**
 * Request Body Size Limit Middleware Tests
 *
 * Tests for the bodyLimit middleware that prevents DoS attacks
 * by enforcing maximum request body sizes.
 *
 * @module middleware/bodyLimit.test
 */

import { describe, it, expect } from "vitest";
import { Hono } from "hono";
import { bodyLimit, bodyLimitConfigs } from "./bodyLimit";
import { ERROR_CODES, HTTP_STATUS, BODY_SIZE_MAX } from "../config/constants";
import type { ErrorResponse } from "../errors";
import { HTTP_METHODS, HTTP_HEADER_NAMES } from "@blueprint/shared";

describe("bodyLimit middleware", () => {
  describe("bodyLimit", () => {
    it("should allow requests within the size limit", async () => {
      const app = new Hono();
      app.use("*", bodyLimit({ maxSize: 1024 }));
      app.post("/", async (c) => {
        const body = await c.req.text();
        return c.json({ success: true, length: body.length });
      });

      const res = await app.request("/", {
        method: HTTP_METHODS.POST,
        headers: { [HTTP_HEADER_NAMES.CONTENT_LENGTH_LC]: "10" },
        body: "small body",
      });

      expect(res.status).toBe(HTTP_STATUS.OK);
      const data = (await res.json()) as { success: boolean };
      expect(data.success).toBe(true);
    });

    it("should reject requests exceeding the size limit", async () => {
      const app = new Hono();
      app.use("*", bodyLimit({ maxSize: 100 }));
      app.post("/", async (c) => c.json({ success: true }));

      const res = await app.request("/", {
        method: HTTP_METHODS.POST,
        headers: { [HTTP_HEADER_NAMES.CONTENT_LENGTH_LC]: "200" },
        body: "x".repeat(200),
      });

      expect(res.status).toBe(HTTP_STATUS.PAYLOAD_TOO_LARGE);
      const data = (await res.json()) as ErrorResponse;
      expect(data.success).toBe(false);
      expect(data.error.code).toBe(ERROR_CODES.PAYLOAD_TOO_LARGE);
      expect(data.error.details).toBeDefined();
      if (data.error.details) {
        const details = data.error.details as Record<string, unknown>;
        expect(details.maxSize).toBe(100);
        expect(details.actualSize).toBe(200);
      }
    });

    it("should use default max size when no config provided", async () => {
      const app = new Hono();
      app.use("*", bodyLimit());
      app.post("/", async (c) => c.json({ success: true }));

      // Default is ~1MB, 500KB should be fine
      const res = await app.request("/", {
        method: HTTP_METHODS.POST,
        headers: { [HTTP_HEADER_NAMES.CONTENT_LENGTH_LC]: String(500 * 1024) },
        body: "x".repeat(500 * 1024),
      });

      expect(res.status).toBe(HTTP_STATUS.OK);
    });

    it("should skip size check for excluded paths", async () => {
      const app = new Hono();
      app.use("*", bodyLimit({ maxSize: 10, excludePaths: ["/upload"] }));
      app.post("/upload", async (c) => c.json({ success: true }));

      // Would exceed limit if not excluded
      const res = await app.request("/upload", {
        method: HTTP_METHODS.POST,
        headers: { [HTTP_HEADER_NAMES.CONTENT_LENGTH_LC]: "5000" },
        body: "x".repeat(5000),
      });

      expect(res.status).toBe(HTTP_STATUS.OK);
    });

    it("should allow requests without Content-Length header when body fits the limit", async () => {
      const app = new Hono();
      app.use("*", bodyLimit({ maxSize: 100 }));
      app.post("/", async (c) => c.json({ success: true }));

      const res = await app.request("/", {
        method: HTTP_METHODS.POST,
        body: "small",
        // No content-length header
      });

      expect(res.status).toBe(HTTP_STATUS.OK);
    });

    it("should reject oversized streamed bodies sent without Content-Length", async () => {
      const app = new Hono();
      app.use("*", bodyLimit({ maxSize: 100 }));
      app.post("/", async (c) => c.json({ success: true }));

      // A stream body carries no Content-Length header, so the header-based
      // check cannot see it — the actual bytes must be counted instead.
      const encoder = new TextEncoder();
      const stream = new ReadableStream<Uint8Array>({
        start(controller) {
          controller.enqueue(encoder.encode("x".repeat(500)));
          controller.close();
        },
      });
      const init: RequestInit & { duplex?: "half" } = {
        method: HTTP_METHODS.POST,
        body: stream,
        duplex: "half",
      };

      const res = await app.request("/", init);

      expect(res.status).toBe(HTTP_STATUS.PAYLOAD_TOO_LARGE);
      const data = (await res.json()) as ErrorResponse;
      expect(data.success).toBe(false);
      expect(data.error.code).toBe(ERROR_CODES.PAYLOAD_TOO_LARGE);
      expect(data.error.details).toBeDefined();
      if (data.error.details) {
        const details = data.error.details as Record<string, unknown>;
        expect(details.maxSize).toBe(100);
      }
    });

    it("should reject malformed Content-Length header", async () => {
      const app = new Hono();
      app.use("*", bodyLimit({ maxSize: 100 }));
      app.post("/", async (c) => c.json({ success: true }));

      const res = await app.request("/", {
        method: HTTP_METHODS.POST,
        headers: { [HTTP_HEADER_NAMES.CONTENT_LENGTH_LC]: "not-a-number" },
        body: "small body",
      });

      expect(res.status).toBe(HTTP_STATUS.BAD_REQUEST);
      const data = (await res.json()) as ErrorResponse;
      expect(data.success).toBe(false);
      expect(data.error.code).toBe(ERROR_CODES.VALIDATION_ERROR);
    });

    it("should reject negative Content-Length header", async () => {
      const app = new Hono();
      app.use("*", bodyLimit({ maxSize: 100 }));
      app.post("/", async (c) => c.json({ success: true }));

      // parseInt("-1") === -1, which fails `size > maxSize` — without the
      // explicit sign check this value would bypass the limit entirely.
      const res = await app.request("/", {
        method: HTTP_METHODS.POST,
        headers: { [HTTP_HEADER_NAMES.CONTENT_LENGTH_LC]: "-1" },
        body: "small body",
      });

      expect(res.status).toBe(HTTP_STATUS.BAD_REQUEST);
      const data = (await res.json()) as ErrorResponse;
      expect(data.success).toBe(false);
      expect(data.error.code).toBe(ERROR_CODES.VALIDATION_ERROR);
    });

    it("should pass through to next middleware on valid request", async () => {
      const app = new Hono();
      app.use("*", bodyLimit({ maxSize: 1000 }));
      app.use("*", async (c, next) => {
        c.res.headers.set("x-custom", "middleware-passed");
        await next();
      });
      app.get("/", (c) => c.json({ success: true }));

      const res = await app.request("/", {
        method: HTTP_METHODS.GET,
        headers: { [HTTP_HEADER_NAMES.CONTENT_LENGTH_LC]: "5" },
      });

      expect(res.status).toBe(HTTP_STATUS.OK);
      expect(res.headers.get("x-custom")).toBe("middleware-passed");
    });
  });

  describe("bodyLimitConfigs", () => {
    it("should provide standard config with DEFAULT maxSize", () => {
      expect(bodyLimitConfigs.standard.maxSize).toBe(BODY_SIZE_MAX.DEFAULT);
    });

    it("should provide strict config with STRICT maxSize", () => {
      expect(bodyLimitConfigs.strict.maxSize).toBe(BODY_SIZE_MAX.STRICT);
    });

    it("should provide lenient config with LENIENT maxSize", () => {
      expect(bodyLimitConfigs.lenient.maxSize).toBe(BODY_SIZE_MAX.LENIENT);
    });
  });
});
