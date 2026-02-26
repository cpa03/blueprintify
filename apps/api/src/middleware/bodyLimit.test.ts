import { describe, it, expect } from "vitest";
import { Hono } from "hono";
import { bodyLimit, bodyLimitConfigs } from "./bodyLimit";
import type { ErrorResponse } from "../errors";

describe("bodyLimit middleware", () => {
  describe("bodyLimit", () => {
    it("should allow requests within size limit", async () => {
      const app = new Hono();
      app.use("/", bodyLimit({ maxSize: 1024 * 1024 })); // 1MB
      app.post("/", (c) => c.json({ success: true }));

      const res = await app.request("/", {
        method: "POST",
        headers: { "content-length": "100" },
      });

      expect(res.status).toBe(200);
    });

    it("should reject requests exceeding size limit", async () => {
      const app = new Hono();
      app.use("/", bodyLimit({ maxSize: 1024 })); // 1KB
      app.post("/", (c) => c.json({ success: true }));

      const res = await app.request("/", {
        method: "POST",
        headers: { "content-length": "2048" }, // 2KB
      });

      expect(res.status).toBe(413);
      const data = (await res.json()) as ErrorResponse;
      expect(data.success).toBe(false);
      expect(data.error.type).toBe("validation");
      expect(data.error.code).toBe("PAYLOAD_TOO_LARGE");
    });

    it("should reject exactly at limit boundary", async () => {
      const app = new Hono();
      app.use("/", bodyLimit({ maxSize: 100 })); // 100 bytes
      app.post("/", (c) => c.json({ success: true }));

      // 101 bytes should be rejected
      const res = await app.request("/", {
        method: "POST",
        headers: { "content-length": "101" },
      });

      expect(res.status).toBe(413);
    });

    it("should allow request at exactly the limit", async () => {
      const app = new Hono();
      app.use("/", bodyLimit({ maxSize: 100 })); // 100 bytes
      app.post("/", (c) => c.json({ success: true }));

      // Exactly 100 bytes should pass
      const res = await app.request("/", {
        method: "POST",
        headers: { "content-length": "100" },
      });

      expect(res.status).toBe(200);
    });

    it("should allow requests without content-length header", async () => {
      const app = new Hono();
      app.use("/", bodyLimit({ maxSize: 1024 }));
      app.post("/", (c) => c.json({ success: true }));

      const res = await app.request("/", {
        method: "POST",
      });

      expect(res.status).toBe(200);
    });

    it("should handle invalid content-length header", async () => {
      const app = new Hono();
      app.use("/", bodyLimit({ maxSize: 1024 }));
      app.post("/", (c) => c.json({ success: true }));

      const res = await app.request("/", {
        method: "POST",
        headers: { "content-length": "invalid" },
      });

      // Invalid content-length should be treated as missing
      expect(res.status).toBe(200);
    });

    it("should exclude specified paths from body checking", async () => {
      const app = new Hono();
      app.use(
        "/",
        bodyLimit({
          maxSize: 1024,
          excludePaths: ["/upload", "/large"],
        })
      );
      app.post("/upload", (c) => c.json({ success: true }));
      app.post("/large", (c) => c.json({ success: true }));

      // Should allow large body on excluded paths
      const res1 = await app.request("/upload", {
        method: "POST",
        headers: { "content-length": "10000" },
      });
      expect(res1.status).toBe(200);

      const res2 = await app.request("/large", {
        method: "POST",
        headers: { "content-length": "10000" },
      });
      expect(res2.status).toBe(200);
    });

    it("should not check excluded paths for other routes", async () => {
      const app = new Hono();
      app.use(
        "*",
        bodyLimit({
          maxSize: 1024,
          excludePaths: ["/excluded"],
        })
      );
      app.post("/regular", (c) => c.json({ success: true }));

      // Regular path should be checked and rejected for 10KB > 1KB limit
      const res = await app.request("/regular", {
        method: "POST",
        headers: { "content-length": "10000" },
      });
      expect(res.status).toBe(413);
    });

    it("should return error details with max and actual size", async () => {
      const maxSize = 1024;
      const actualSize = 2048;

      const app = new Hono();
      app.use("/", bodyLimit({ maxSize }));
      app.post("/", (c) => c.json({ success: true }));

      const res = await app.request("/", {
        method: "POST",
        headers: { "content-length": String(actualSize) },
      });

      const data = (await res.json()) as ErrorResponse;
      expect(data.error.details).toBeDefined();
      expect(data.error.details!.maxSize).toBe(maxSize);
      expect(data.error.details!.actualSize).toBe(actualSize);
    });

    it("should include timestamp in error response", async () => {
      const app = new Hono();
      app.use("/", bodyLimit({ maxSize: 1024 }));
      app.post("/", (c) => c.json({ success: true }));

      const res = await app.request("/", {
        method: "POST",
        headers: { "content-length": "2048" },
      });

      const data = (await res.json()) as ErrorResponse;
      expect(data.error.timestamp).toBeDefined();
      expect(() => new Date(data.error.timestamp)).not.toThrow();
    });

    it("should work with GET requests (no body)", async () => {
      const app = new Hono();
      app.use("/", bodyLimit({ maxSize: 1024 }));
      app.get("/", (c) => c.json({ success: true }));

      const res = await app.request("/");

      expect(res.status).toBe(200);
    });

    it("should handle negative content-length", async () => {
      const app = new Hono();
      app.use("/", bodyLimit({ maxSize: 1024 }));
      app.post("/", (c) => c.json({ success: true }));

      const res = await app.request("/", {
        method: "POST",
        headers: { "content-length": "-1" },
      });

      // Negative should be treated as invalid
      expect(res.status).toBe(200);
    });

    it("should handle very large content-length", async () => {
      const app = new Hono();
      app.use("/", bodyLimit({ maxSize: 1024 * 1024 })); // 1MB
      app.post("/", (c) => c.json({ success: true }));

      const res = await app.request("/", {
        method: "POST",
        headers: { "content-length": String(Number.MAX_SAFE_INTEGER) },
      });

      expect(res.status).toBe(413);
    });
  });

  describe("bodyLimitConfigs", () => {
    it("should have standard config with 1MB limit", () => {
      expect(bodyLimitConfigs.standard.maxSize).toBe(1024 * 1024);
    });

    it("should have strict config with 100KB limit", () => {
      expect(bodyLimitConfigs.strict.maxSize).toBe(100 * 1024);
    });

    it("should have lenient config with 10MB limit", () => {
      expect(bodyLimitConfigs.lenient.maxSize).toBe(10 * 1024 * 1024);
    });
  });

  describe("default configuration", () => {
    it("should use 1MB as default limit", async () => {
      const app = new Hono();
      app.use("/", bodyLimit()); // No config
      app.post("/", (c) => c.json({ success: true }));

      // Should allow 1MB
      const res1 = await app.request("/", {
        method: "POST",
        headers: { "content-length": String(1024 * 1024) },
      });
      expect(res1.status).toBe(200);

      // Should reject slightly over 1MB
      const res2 = await app.request("/", {
        method: "POST",
        headers: { "content-length": String(1024 * 1024 + 1) },
      });
      expect(res2.status).toBe(413);
    });

    it("should have empty excludePaths by default", async () => {
      const app = new Hono();
      app.use("*", bodyLimit()); // No config, apply to all paths
      app.post("/test", (c) => c.json({ success: true }));

      // Default should not exclude any paths - 10KB is under 1MB limit so should pass
      const res = await app.request("/test", {
        method: "POST",
        headers: { "content-length": "10000" },
      });
      expect(res.status).toBe(200);
    });
  });
});
