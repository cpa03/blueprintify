import { describe, it, expect, vi, beforeAll, afterAll } from "vitest";
import { Hono } from "hono";
import exportRoute from "./export";
import { errorHandler } from "../middleware/errorHandler";
import { MOCK_ENV } from "../test-utils";
import type { ErrorResponse } from "../errors";

let originalConsoleError: typeof console.error;
beforeAll(() => {
  originalConsoleError = console.error;
  console.error = vi.fn();
});
afterAll(() => {
  console.error = originalConsoleError;
});

describe("POST /export", () => {
  const app = new Hono<{ Bindings: { OPENAI_API_KEY: string } }>();
  app.route("/", exportRoute);
  app.onError(errorHandler);

  it("should return 400 for invalid input (missing projectName)", async () => {
    const res = await app.request(
      "/",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          blueprint: "Test blueprint content",
          format: "json",
        }),
      },
      MOCK_ENV
    );

    expect(res.status).toBe(400);
    const data = (await res.json()) as ErrorResponse;
    expect(data).toHaveProperty("success", false);
    expect(data.error).toHaveProperty("type", "validation");
    expect(data.error).toHaveProperty("timestamp");
  });

  it("should return 400 for missing blueprint", async () => {
    const res = await app.request(
      "/",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectName: "Test Project",
          format: "json",
        }),
      },
      MOCK_ENV
    );

    expect(res.status).toBe(400);
    const data = (await res.json()) as ErrorResponse;
    expect(data.error).toHaveProperty("type", "validation");
  });

  it("should export as JSON format successfully", async () => {
    const res = await app.request(
      "/",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectName: "Test Project",
          blueprint: "# Test Blueprint",
          tasks: "- Task 1\n- Task 2",
          format: "json",
          includeMetadata: true,
        }),
      },
      MOCK_ENV
    );

    expect(res.status).toBe(200);
    const data = (await res.json()) as {
      success: boolean;
      data: {
        projectName: string;
        blueprint: string;
        tasks: string;
        exportedAt: string;
        version: string;
        format: string;
      };
      filename: string;
    };
    expect(data).toHaveProperty("success", true);
    expect(data.data).toHaveProperty("projectName", "Test Project");
    expect(data.data).toHaveProperty("blueprint", "# Test Blueprint");
    expect(data.data).toHaveProperty("tasks", "- Task 1\n- Task 2");
    expect(data.data).toHaveProperty("exportedAt");
    expect(data.data).toHaveProperty("version", "1.0.0");
    expect(data.data).toHaveProperty("format", "json");
    expect(data).toHaveProperty("filename", "Test_Project_export.json");
  });

  it("should export as Markdown format successfully", async () => {
    const res = await app.request(
      "/",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectName: "My Project",
          blueprint: "# Architecture\n\nDetails here",
          tasks: "- Task 1",
          format: "markdown",
        }),
      },
      MOCK_ENV
    );

    expect(res.status).toBe(200);
    const data = (await res.json()) as {
      success: boolean;
      data: {
        content: string;
        filename: string;
      };
    };
    expect(data).toHaveProperty("success", true);
    expect(data.data).toHaveProperty("content");
    expect(data.data.content).toContain("# My Project");
    expect(data.data.content).toContain("## Blueprint");
    expect(data.data.content).toContain("# Architecture");
    expect(data.data).toHaveProperty("filename", "My_Project.md");
  });

  it("should export as ZIP format with manifest", async () => {
    const res = await app.request(
      "/",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectName: "Zip Project",
          blueprint: "# Blueprint",
          format: "zip",
        }),
      },
      MOCK_ENV
    );

    expect(res.status).toBe(200);
    const data = (await res.json()) as {
      success: boolean;
      data: {
        manifest: unknown;
        filename: string;
        note: string;
      };
    };
    expect(data).toHaveProperty("success", true);
    expect(data.data).toHaveProperty("manifest");
    expect(data.data).toHaveProperty("filename", "Zip_Project.zip");
    expect(data.data).toHaveProperty("note");
  });

  it("should return 400 for blueprint exceeding max length", async () => {
    const res = await app.request(
      "/",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectName: "Test",
          blueprint: "x".repeat(100_001),
          format: "json",
        }),
      },
      MOCK_ENV
    );

    expect(res.status).toBe(400);
    const data = (await res.json()) as ErrorResponse;
    expect(data).toHaveProperty("success", false);
    expect(data.error).toHaveProperty("type", "validation");
  });

  it("should return 400 for tasks exceeding max length", async () => {
    const res = await app.request(
      "/",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectName: "Test",
          blueprint: "valid blueprint",
          tasks: "x".repeat(100_001),
          format: "json",
        }),
      },
      MOCK_ENV
    );

    expect(res.status).toBe(400);
    const data = (await res.json()) as ErrorResponse;
    expect(data).toHaveProperty("success", false);
    expect(data.error).toHaveProperty("type", "validation");
  });

  it("should handle special characters in project name", async () => {
    const res = await app.request(
      "/",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectName: "My Special Project",
          blueprint: "# Blueprint",
          format: "json",
        }),
      },
      MOCK_ENV
    );

    expect(res.status).toBe(200);
    const data = (await res.json()) as {
      filename: string;
    };
    expect(data.filename).toBe("My_Special_Project_export.json");
  });
});
