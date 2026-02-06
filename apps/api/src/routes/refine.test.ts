import { describe, it, expect, vi } from "vitest";
import { Hono } from "hono";
import refineRoute from "./refine";
import { errorHandler } from "../middleware/errorHandler";

// Mock the services
vi.mock("../services/openai", () => ({
  streamCompletion: vi.fn(),
}));

vi.mock("../utils/stream", () => ({
  createStreamFromGenerator: vi.fn(),
  createSSEResponse: vi
    .fn()
    .mockImplementation(() => new Response("mock-refine-stream")),
}));

describe("POST /refine", () => {
  const app = new Hono<{ Bindings: { OPENAI_API_KEY: string } }>();
  app.route("/", refineRoute);
  app.onError(errorHandler);

  const MOCK_ENV = {
    OPENAI_API_KEY: "test-key",
    OPENAI_BASE_URL: "https://api.openai.com/v1",
    OPENAI_MODEL: "gpt-4",
  };

  it("should return 400 for invalid input (missing content)", async () => {
    const res = await app.request(
      "/",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          instruction: "Make it better",
          // content is missing
        }),
      },
      MOCK_ENV,
    );

    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data).toHaveProperty("success", false);
    expect(data.error).toHaveProperty("type", "validation");
  });

  it("should return 200/Stream for valid input", async () => {
    const res = await app.request(
      "/",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: "# Original Content",
          instruction: "Make it more detailed",
        }),
      },
      MOCK_ENV,
    );

    expect(res.status).toBe(200);
    const text = await res.text();
    expect(text).toBe("mock-refine-stream");
  });
});
