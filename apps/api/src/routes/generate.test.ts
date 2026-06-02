import { describe, it, expect, vi, beforeAll, afterAll, beforeEach, afterEach } from "vitest";
import { Hono } from "hono";
import generateRoute from "./generate";
import { errorHandler } from "../middleware/errorHandler";
import { MOCK_ENV, MOCK_ENV_NO_KEY } from "../test-utils";
import type { ErrorResponse } from "../errors";
import { HTTP_METHODS, HTTP_HEADERS } from "@blueprint/shared";
import { setDefaultContainer, resetContainer, createMockContainer } from "../di/container";

let originalConsoleError: typeof console.error;
beforeAll(() => {
  originalConsoleError = console.error;
  console.error = vi.fn();
});
afterAll(() => {
  console.error = originalConsoleError;
});

beforeEach(() => {
  const mockContainer = createMockContainer();
  setDefaultContainer(mockContainer);
});

afterEach(() => {
  resetContainer();
});

describe("POST /generate", () => {
  const app = new Hono<{ Bindings: { OPENAI_API_KEY: string } }>();
  app.route("/", generateRoute);
  app.onError(errorHandler);

  it("should return 400 for invalid input (missing techStack)", async () => {
    const res = await app.request(
      "/",
      {
        method: HTTP_METHODS.POST,
        headers: { "Content-Type": HTTP_HEADERS.CONTENT_TYPE_JSON },
        body: JSON.stringify({
          projectName: "Test Project",
          description: "A valid description longer than 10 chars.",
          // techStack is missing
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

  it("should return 400 for short description", async () => {
    const res = await app.request(
      "/",
      {
        method: HTTP_METHODS.POST,
        headers: { "Content-Type": HTTP_HEADERS.CONTENT_TYPE_JSON },
        body: JSON.stringify({
          projectName: "Test Project",
          description: "Too short",
          techStack: [{ name: "React", category: "frontend" }],
        }),
      },
      MOCK_ENV
    );
    expect(res.status).toBe(400);
    const data = (await res.json()) as ErrorResponse;
    expect(data.error).toHaveProperty("type", "validation");
  });

  it("should return 200/Stream for valid input", async () => {
    const res = await app.request(
      "/",
      {
        method: HTTP_METHODS.POST,
        headers: { "Content-Type": HTTP_HEADERS.CONTENT_TYPE_JSON },
        body: JSON.stringify({
          projectName: "Test Project",
          description: "A valid description longer than 10 chars for testing purposes.",
          techStack: [{ name: "React", category: "frontend" }],
        }),
      },
      MOCK_ENV
    );

    expect(res.status).toBe(200);
    const text = await res.text();
    expect(text).toBe("mock data");
  });

  it("should return 500 for missing API key with standard error format", async () => {
    const res = await app.request(
      "/",
      {
        method: HTTP_METHODS.POST,
        headers: { "Content-Type": HTTP_HEADERS.CONTENT_TYPE_JSON },
        body: JSON.stringify({
          projectName: "Test Project",
          description: "A valid description longer than 10 chars for testing purposes.",
          techStack: [{ name: "React", category: "frontend" }],
        }),
      },
      MOCK_ENV_NO_KEY
    );

    expect(res.status).toBe(500);
    const data = (await res.json()) as ErrorResponse;
    expect(data).toHaveProperty("success", false);
    expect(data.error).toHaveProperty("type", "configuration");
    expect(data.error).toHaveProperty("message", "OpenAI API key not configured");
    expect(data.error).toHaveProperty("code", "CONFIGURATION_ERROR");
    expect(data.error).toHaveProperty("timestamp");
  });
});
