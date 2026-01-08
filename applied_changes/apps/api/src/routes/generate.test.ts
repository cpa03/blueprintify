import { describe, it, expect, vi } from "vitest";
import { Hono } from "hono";
import generateRoute from "./generate";

// Mock the services
vi.mock("../services/openai", () => ({
  streamCompletion: vi.fn(),
}));

vi.mock("../utils/stream", () => ({
  createStreamFromGenerator: vi.fn(),
  createSSEResponse: vi
    .fn()
    .mockImplementation(() => new Response("mock-stream")),
}));

describe("POST /generate", () => {
  const app = new Hono<{ Bindings: { OPENAI_API_KEY: string } }>();
  app.route("/", generateRoute);

  const MOCK_ENV = {
    OPENAI_API_KEY: "test-key",
    OPENAI_BASE_URL: "https://api.openai.com/v1",
    OPENAI_MODEL: "gpt-4",
  };

  it("should return 400 for invalid input (missing techStack)", async () => {
    const res = await app.request(
      "/",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectName: "Test Project",
          description: "A valid description longer than 10 chars.",
          // techStack is missing
        }),
      },
      MOCK_ENV,
    );

    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data).toHaveProperty("success", false);
  });

  it("should return 400 for short description", async () => {
    const res = await app.request(
      "/",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectName: "Test Project",
          description: "Too short",
          techStack: [{ name: "React", category: "frontend" }],
        }),
      },
      MOCK_ENV,
    );
    expect(res.status).toBe(400);
  });

  it("should return 200/Stream for valid input", async () => {
    const res = await app.request(
      "/",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectName: "Test Project",
          description:
            "A valid description longer than 10 chars for testing purposes.",
          techStack: [{ name: "React", category: "frontend" }],
        }),
      },
      MOCK_ENV,
    );

    expect(res.status).toBe(200);
    const text = await res.text();
    expect(text).toBe("mock-stream");
  });
});
