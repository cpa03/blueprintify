import { describe, it, expect } from "vitest";
import { Hono } from "hono";
import { bodyLimit, bodyLimitConfigs } from "./bodyLimit";

describe("bodyLimit middleware", () => {
  describe("basic body size limiting", () => {
    it("should allow requests when body size is within limit", async () => {
      const app = new Hono();
      app.use(
        "*",
        bodyLimit({
          maxSize: 1024 * 1024, // 1MB
        })
      );
      app.post("/", (c) => c.json({ success: true }));

      const res = await app.request("/", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "content-length": "100", // 100 bytes - well under 1MB
        },
        body: JSON.stringify({ data: "test" }),
      });

      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.success).toBe(true);
    });

    it("should block requests when body size exceeds limit", async () => {
      const app = new Hono();
      app.use(
        "*",
        bodyLimit({
          maxSize: 10, // 10 bytes - very small limit
        })
      );
      app.post("/", (c) => c.json({ success: true }));

      // Body exceeds 10 bytes
      const res = await app.request("/", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "content-length": "100", // 100 bytes - over 10 byte limit
        },
        body: JSON.stringify({ data: "this is a long string" }),
      });

      expect(res.status).toBe(413);
      const json = await res.json();
      expect(json.success).toBe(false);
      expect(json.error.code).toBe("PAYLOAD_TOO_LARGE");
      expect(json.error.details.maxSize).toBe(10);
      expect(json.error.details.actualSize).toBe(100);
    });

    it("should allow requests when no content-length header is present", async () => {
      const app = new Hono();
      app.use(
        "*",
        bodyLimit({
          maxSize: 1024,
        })
      );
      app.post("/", (c) => c.json({ success: true }));

      const res = await app.request("/", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          // No content-length header
        },
        body: JSON.stringify({ data: "test" }),
      });

      expect(res.status).toBe(200);
    });
  });

  describe("excludePaths", () => {
    it("should bypass body size check for excluded paths", async () => {
      const app = new Hono();
      app.use(
        "*",
        bodyLimit({
          maxSize: 10, // Very small limit
          excludePaths: ["/upload"], // Exclude upload path
        })
      );
      app.post("/upload", (c) => c.json({ success: true, path: "upload" }));
      app.post("/api", (c) => c.json({ success: true, path: "api" }));

      // Request to excluded path should succeed even with large body
      const uploadRes = await app.request("/upload", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "content-length": "1000", // 1000 bytes - over 10 byte limit
        },
        body: JSON.stringify({ data: "x".repeat(1000) }),
      });

      expect(uploadRes.status).toBe(200);

      // Request to non-excluded path should be blocked
      const apiRes = await app.request("/api", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "content-length": "1000",
        },
        body: JSON.stringify({ data: "x".repeat(1000) }),
      });

      expect(apiRes.status).toBe(413);
    });

    it("should handle multiple excluded paths", async () => {
      const app = new Hono();
      app.use(
        "*",
        bodyLimit({
          maxSize: 10,
          excludePaths: ["/upload", "/webhook", "/stream"],
        })
      );
      app.post("/upload", (c) => c.json({ success: true }));
      app.post("/webhook", (c) => c.json({ success: true }));
      app.post("/stream", (c) => c.json({ success: true }));
      app.post("/api", (c) => c.json({ success: true }));

      // All excluded paths should succeed
      for (const path of ["/upload", "/webhook", "/stream"]) {
        const res = await app.request(path, {
          method: "POST",
          headers: {
            "content-type": "application/json",
            "content-length": "1000",
          },
          body: "x".repeat(1000),
        });
        expect(res.status).toBe(200);
      }

      // Non-excluded path should fail
      const apiRes = await app.request("/api", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "content-length": "1000",
        },
        body: "x".repeat(1000),
      });
      expect(apiRes.status).toBe(413);
    });
  });

  describe("default configuration", () => {
    it("should use default 1MB limit when no config provided", async () => {
      const app = new Hono();
      app.use("*", bodyLimit());
      app.post("/", (c) => c.json({ success: true }));

      // 1MB = 1024 * 1024 = 1048576 bytes
      // This is under the default limit
      const smallRes = await app.request("/", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "content-length": "1000",
        },
        body: "x".repeat(1000),
      });
      expect(smallRes.status).toBe(200);

      // This exceeds 1MB
      const largeRes = await app.request("/", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "content-length": String(1024 * 1024 + 1), // 1MB + 1 byte
        },
        body: "x".repeat(1024 * 1024 + 1),
      });
      expect(largeRes.status).toBe(413);
    });
  });

  describe("bodyLimitConfigs", () => {
    it("should have standard config with 1MB limit", async () => {
      const app = new Hono();
      app.use("*", bodyLimit(bodyLimitConfigs.standard));
      app.post("/", (c) => c.json({ success: true }));

      // Under 1MB
      const smallRes = await app.request("/", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "content-length": "500000", // 500KB
        },
        body: "x".repeat(500000),
      });
      expect(smallRes.status).toBe(200);

      // Over 1MB
      const largeRes = await app.request("/", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "content-length": String(1024 * 1024 + 1),
        },
        body: "x".repeat(1024 * 1024 + 1),
      });
      expect(largeRes.status).toBe(413);
    });

    it("should have strict config with 100KB limit", async () => {
      const app = new Hono();
      app.use("*", bodyLimit(bodyLimitConfigs.strict));
      app.post("/", (c) => c.json({ success: true }));

      // Under 100KB
      const smallRes = await app.request("/", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "content-length": "50000", // 50KB
        },
        body: "x".repeat(50000),
      });
      expect(smallRes.status).toBe(200);

      // Over 100KB
      const largeRes = await app.request("/", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "content-length": String(100 * 1024 + 1),
        },
        body: "x".repeat(100 * 1024 + 1),
      });
      expect(largeRes.status).toBe(413);
    });

    it("should have lenient config with 10MB limit", async () => {
      const app = new Hono();
      app.use("*", bodyLimit(bodyLimitConfigs.lenient));
      app.post("/", (c) => c.json({ success: true }));

      // Under 10MB
      const smallRes = await app.request("/", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "content-length": String(5 * 1024 * 1024), // 5MB
        },
        body: "x".repeat(5 * 1024 * 1024),
      });
      expect(smallRes.status).toBe(200);

      // Over 10MB
      const largeRes = await app.request("/", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "content-length": String(10 * 1024 * 1024 + 1),
        },
        body: "x".repeat(10 * 1024 * 1024 + 1),
      });
      expect(largeRes.status).toBe(413);
    });
  });

  describe("error response structure", () => {
    it("should return proper error response structure", async () => {
      const app = new Hono();
      app.use(
        "*",
        bodyLimit({
          maxSize: 100,
        })
      );
      app.post("/", (c) => c.json({ success: true }));

      const res = await app.request("/", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "content-length": "500", // Over 100 bytes
        },
        body: "x".repeat(500),
      });

      expect(res.status).toBe(413);
      const json = await res.json();

      // Verify error structure
      expect(json).toHaveProperty("success", false);
      expect(json).toHaveProperty("error");
      expect(json.error).toHaveProperty("type", "validation");
      expect(json.error).toHaveProperty("message");
      expect(json.error).toHaveProperty("code", "PAYLOAD_TOO_LARGE");
      expect(json.error).toHaveProperty("details");
      expect(json.error.details).toHaveProperty("maxSize", 100);
      expect(json.error.details).toHaveProperty("actualSize", 500);
      expect(json.error).toHaveProperty("timestamp");
    });
  });

  describe("edge cases", () => {
    it("should handle invalid content-length gracefully", async () => {
      const app = new Hono();
      app.use(
        "*",
        bodyLimit({
          maxSize: 1000,
        })
      );
      app.post("/", (c) => c.json({ success: true }));

      // Invalid content-length (non-numeric)
      const res = await app.request("/", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "content-length": "not-a-number",
        },
        body: "test",
      });

      // Should allow request when content-length is invalid (NaN check)
      expect(res.status).toBe(200);
    });

    it("should handle exact size limit", async () => {
      const app = new Hono();
      app.use(
        "*",
        bodyLimit({
          maxSize: 100,
        })
      );
      app.post("/", (c) => c.json({ success: true }));

      // Exactly at limit
      const exactRes = await app.request("/", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "content-length": "100",
        },
        body: "x".repeat(100),
      });
      expect(exactRes.status).toBe(200);

      // One over limit
      const overRes = await app.request("/", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "content-length": "101",
        },
        body: "x".repeat(101),
      });
      expect(overRes.status).toBe(413);
    });
  });
});
