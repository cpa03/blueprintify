import { describe, it, expect } from "vitest";
import { Hono } from "hono";
import { requestLogger } from "./logger";

describe("logger middleware", () => {
  describe("requestLogger", () => {
    it("should exclude specified paths from logging", async () => {
      const app = new Hono();
      app.use("*", requestLogger({ excludePaths: ["/health"] }));
      app.get("/health", (c) => c.json({ status: "ok" }));

      const res = await app.request("/health");

      expect(res.status).toBe(200);
    });

    it("should work with different HTTP methods", async () => {
      const app = new Hono();
      app.use("*", requestLogger());
      app.get("/test", (c) => c.json({ method: "GET" }));
      app.post("/test", (c) => c.json({ method: "POST" }));

      const getRes = await app.request("/test", { method: "GET" });
      expect(getRes.status).toBe(200);

      const postRes = await app.request("/test", { method: "POST" });
      expect(postRes.status).toBe(200);
    });

    it("should preserve response status code", async () => {
      const app = new Hono();
      app.use("*", requestLogger());
      app.get("/not-found", (c) => c.json({ error: "not found" }, 404));

      const res = await app.request("/not-found");

      expect(res.status).toBe(404);
    });

    it("should preserve response body", async () => {
      const app = new Hono();
      app.use("*", requestLogger());
      app.get("/", (c) => c.json({ success: true, data: "test" }));

      const res = await app.request("/");
      const data = (await res.json()) as { success: boolean; data: string };

      expect(data).toEqual({ success: true, data: "test" });
    });

    it("should handle requests with query parameters", async () => {
      const app = new Hono();
      app.use("*", requestLogger());
      app.get("/search", (c) => c.json({ query: c.req.query("q") }));

      const res = await app.request("/search?q=test");
      const data = (await res.json()) as { query: string };

      expect(data.query).toBe("test");
    });

    it("should handle requests with custom headers", async () => {
      const app = new Hono();
      app.use("*", requestLogger());
      app.get("/", (c) => c.json({ success: true }));

      const res = await app.request("/", {
        headers: {
          "user-agent": "test-agent",
          "x-forwarded-for": "1.2.3.4",
        },
      });

      expect(res.status).toBe(200);
    });
  });
});
