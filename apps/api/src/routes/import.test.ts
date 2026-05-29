import { describe, it, expect, vi, beforeAll, afterAll } from "vitest";
import { Hono } from "hono";
import importRoute from "./import";
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

describe("POST /import", () => {
  const app = new Hono<{ Bindings: { OPENAI_API_KEY: string } }>();
  app.route("/", importRoute);
  app.onError(errorHandler);

  it("should return 400 for invalid input (missing data)", async () => {
    const res = await app.request(
      "/",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
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

  it("should return 400 for data exceeding max length", async () => {
    const res = await app.request(
      "/",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          data: "x".repeat(200_001),
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

  it("should return 400 for invalid JSON", async () => {
    const res = await app.request(
      "/",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          data: "not valid json {{{",
          format: "json",
        }),
      },
      MOCK_ENV
    );

    expect(res.status).toBe(400);
    const data = (await res.json()) as ErrorResponse;
    expect(data.error).toHaveProperty("type", "validation");
    expect(data.error).toHaveProperty("message", "Invalid JSON format");
  });

  it("should return 400 for JSON missing required fields", async () => {
    const res = await app.request(
      "/",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          data: JSON.stringify({ projectName: "Test" }),
          format: "json",
        }),
      },
      MOCK_ENV
    );

    expect(res.status).toBe(400);
    const data = (await res.json()) as ErrorResponse;
    expect(data.error).toHaveProperty("type", "validation");
    expect(data.error.message).toContain("missing required fields");
  });

  it("should import valid JSON successfully", async () => {
    const importData = {
      projectName: "Test Project",
      blueprint: "# Test Blueprint",
      tasks: "- Task 1",
      version: "1.0.0",
    };

    const res = await app.request(
      "/",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          data: JSON.stringify(importData),
          format: "json",
          overwrite: false,
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
        importedAt: string;
        overwrite: boolean;
      };
    };
    expect(data).toHaveProperty("success", true);
    expect(data.data).toHaveProperty("projectName", "Test Project");
    expect(data.data).toHaveProperty("blueprint", "# Test Blueprint");
    expect(data.data).toHaveProperty("tasks", "- Task 1");
    expect(data.data).toHaveProperty("importedAt");
    expect(data.data).toHaveProperty("overwrite", false);
  });

  it("should warn about version mismatch", async () => {
    const importData = {
      projectName: "Old Project",
      blueprint: "# Blueprint",
      version: "0.9.0",
    };

    const res = await app.request(
      "/",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          data: JSON.stringify(importData),
          format: "json",
        }),
      },
      MOCK_ENV
    );

    expect(res.status).toBe(200);
    const data = (await res.json()) as {
      data: {
        warnings: string[];
      };
    };
    expect(data.data).toHaveProperty("warnings");
    expect(data.data.warnings[0]).toContain("Version mismatch");
  });

  it("should import valid Markdown successfully", async () => {
    const markdownContent = `# My Project

Exported: 2024-01-01

## Blueprint

# Architecture

Details here

## Tasks

- Task 1
- Task 2
`;

    const res = await app.request(
      "/",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          data: markdownContent,
          format: "markdown",
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
      };
    };
    expect(data).toHaveProperty("success", true);
    expect(data.data).toHaveProperty("projectName", "My Project");
    expect(data.data.blueprint).toContain("# Architecture");
    expect(data.data.tasks).toContain("- Task 1");
  });

  it("should return 400 for invalid Markdown", async () => {
    const res = await app.request(
      "/",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          data: "No blueprint section here",
          format: "markdown",
        }),
      },
      MOCK_ENV
    );

    expect(res.status).toBe(400);
    const data = (await res.json()) as ErrorResponse;
    expect(data.error).toHaveProperty("type", "validation");
    expect(data.error.message).toContain("could not extract blueprint");
  });

  it("should use default project name when markdown has no title", async () => {
    const markdownContent = `## Blueprint

Architecture details here

## Tasks

- Task 1
- Task 2
`;

    const res = await app.request(
      "/",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          data: markdownContent,
          format: "markdown",
        }),
      },
      MOCK_ENV
    );

    expect(res.status).toBe(200);
    const data = (await res.json()) as {
      data: {
        projectName: string;
      };
    };
    expect(data.data).toHaveProperty("projectName", "Imported Project");
  });
});
