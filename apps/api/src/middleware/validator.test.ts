import { describe, it, expect } from "vitest";
import { Hono } from "hono";
import { z } from "zod";
import { validateJson } from "./validator";
import type { ErrorResponse } from "../errors";
import { HTTP_HEADERS } from "@blueprint/shared";

describe("validateJson middleware", () => {
  const TestSchema = z.object({
    name: z.string().min(1),
    age: z.number().min(0),
    email: z.string().email(),
  });

  it("should pass valid JSON body", async () => {
    const app = new Hono();
    app.post("/", validateJson(TestSchema), (c) => {
      const data = c.get("validatedData");
      return c.json({ success: true, data });
    });

    const res = await app.request("/", {
      method: "POST",
      headers: { "Content-Type": HTTP_HEADERS.CONTENT_TYPE_JSON },
      body: JSON.stringify({
        name: "John Doe",
        age: 30,
        email: "john@example.com",
      }),
    });

    expect(res.status).toBe(200);
    const json = (await res.json()) as { success: boolean; data: unknown };
    expect(json.success).toBe(true);
    expect(json.data).toEqual({
      name: "John Doe",
      age: 30,
      email: "john@example.com",
    });
  });

  it("should return 400 for missing required fields", async () => {
    const app = new Hono();
    app.post("/", validateJson(TestSchema), (c) => {
      const data = c.get("validatedData");
      return c.json({ success: true, data });
    });

    const res = await app.request("/", {
      method: "POST",
      headers: { "Content-Type": HTTP_HEADERS.CONTENT_TYPE_JSON },
      body: JSON.stringify({
        name: "John Doe",
        email: "john@example.com",
      }),
    });

    expect(res.status).toBe(400);
    const data = (await res.json()) as ErrorResponse;
    expect(data.success).toBe(false);
    expect(data.error.type).toBe("validation");
    expect(data.error.code).toBe("VALIDATION_ERROR");
    expect(data.error.details).toBeDefined();
    expect(data.error.details!.issues).toBeDefined();
    expect(Array.isArray(data.error.details!.issues)).toBe(true);
  });

  it("should return 400 for invalid email format", async () => {
    const app = new Hono();
    app.post("/", validateJson(TestSchema), (c) => {
      const data = c.get("validatedData");
      return c.json({ success: true, data });
    });

    const res = await app.request("/", {
      method: "POST",
      headers: { "Content-Type": HTTP_HEADERS.CONTENT_TYPE_JSON },
      body: JSON.stringify({
        name: "John Doe",
        age: 30,
        email: "not-an-email",
      }),
    });

    expect(res.status).toBe(400);
    const data = (await res.json()) as ErrorResponse;
    expect(data.success).toBe(false);
    expect(data.error.type).toBe("validation");
    expect(data.error.details).toBeDefined();
    expect(data.error.details!.issues).toHaveLength(1);
    const issues = data.error.details!.issues as Array<{
      path: string[];
      message: string;
    }>;
    const firstIssue = issues[0];
    expect(firstIssue).toBeDefined();
    expect(firstIssue!.path).toContain("email");
  });

  it("should return 400 for invalid JSON body", async () => {
    const app = new Hono();
    app.post("/", validateJson(TestSchema), (c) => {
      const data = c.get("validatedData");
      return c.json({ success: true, data });
    });

    const res = await app.request("/", {
      method: "POST",
      headers: { "Content-Type": HTTP_HEADERS.CONTENT_TYPE_JSON },
      body: "not valid json",
    });

    expect(res.status).toBe(400);
    const data = (await res.json()) as ErrorResponse;
    expect(data.success).toBe(false);
    expect(data.error.type).toBe("validation");
    expect(data.error.message).toBe("Invalid JSON in request body");
  });

  it("should return 400 for empty body", async () => {
    const app = new Hono();
    app.post("/", validateJson(TestSchema), (c) => {
      const data = c.get("validatedData");
      return c.json({ success: true, data });
    });

    const res = await app.request("/", {
      method: "POST",
      headers: { "Content-Type": HTTP_HEADERS.CONTENT_TYPE_JSON },
      body: "",
    });

    expect(res.status).toBe(400);
    const data = (await res.json()) as ErrorResponse;
    expect(data.success).toBe(false);
    expect(data.error.type).toBe("validation");
  });

  it("should include path information in validation errors", async () => {
    const app = new Hono();
    app.post("/", validateJson(TestSchema), (c) => {
      const data = c.get("validatedData");
      return c.json({ success: true, data });
    });

    const res = await app.request("/", {
      method: "POST",
      headers: { "Content-Type": HTTP_HEADERS.CONTENT_TYPE_JSON },
      body: JSON.stringify({
        name: "",
        age: -5,
        email: "invalid",
      }),
    });

    expect(res.status).toBe(400);
    const data = (await res.json()) as ErrorResponse;
    expect(data.success).toBe(false);
    expect(data.error.details).toBeDefined();
    expect(data.error.details!.issues).toHaveLength(3);

    const paths = (data.error.details!.issues as Array<{ path: string[] }>).map(
      (issue) => issue.path
    );
    expect(paths).toContainEqual(["name"]);
    expect(paths).toContainEqual(["age"]);
    expect(paths).toContainEqual(["email"]);
  });

  it("should include error messages in validation response", async () => {
    const app = new Hono();
    app.post("/", validateJson(TestSchema), (c) => {
      const data = c.get("validatedData");
      return c.json({ success: true, data });
    });

    const res = await app.request("/", {
      method: "POST",
      headers: { "Content-Type": HTTP_HEADERS.CONTENT_TYPE_JSON },
      body: JSON.stringify({
        name: "John",
        age: "not-a-number",
        email: "john@example.com",
      }),
    });

    expect(res.status).toBe(400);
    const data = (await res.json()) as ErrorResponse;
    expect(data.success).toBe(false);
    expect(data.error.details).toBeDefined();

    const issues = data.error.details!.issues as Array<{
      path: string[];
      message: string;
    }>;
    const ageIssue = issues.find((issue) => issue.path.includes("age"));
    expect(ageIssue).toBeDefined();
    expect(ageIssue!.message).toBeTruthy();
  });

  it("should validate nested objects", async () => {
    const NestedSchema = z.object({
      user: z.object({
        name: z.string(),
        profile: z.object({
          age: z.number(),
        }),
      }),
    });

    const app = new Hono();
    app.post("/", validateJson(NestedSchema), (c) => {
      const data = c.get("validatedData");
      return c.json({ success: true, data });
    });

    const validRes = await app.request("/", {
      method: "POST",
      headers: { "Content-Type": HTTP_HEADERS.CONTENT_TYPE_JSON },
      body: JSON.stringify({
        user: {
          name: "John",
          profile: { age: 30 },
        },
      }),
    });
    expect(validRes.status).toBe(200);

    const invalidRes = await app.request("/", {
      method: "POST",
      headers: { "Content-Type": HTTP_HEADERS.CONTENT_TYPE_JSON },
      body: JSON.stringify({
        user: {
          name: "John",
          profile: { age: "thirty" },
        },
      }),
    });
    expect(invalidRes.status).toBe(400);
  });

  it("should include timestamp in error response", async () => {
    const app = new Hono();
    app.post("/", validateJson(TestSchema), (c) => {
      const data = c.get("validatedData");
      return c.json({ success: true, data });
    });

    const res = await app.request("/", {
      method: "POST",
      headers: { "Content-Type": HTTP_HEADERS.CONTENT_TYPE_JSON },
      body: JSON.stringify({ invalid: "data" }),
    });

    expect(res.status).toBe(400);
    const data = (await res.json()) as ErrorResponse;
    expect(data.error.timestamp).toBeTruthy();
    expect(new Date(data.error.timestamp).getTime()).not.toBeNaN();
  });
});
