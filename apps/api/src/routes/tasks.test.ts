import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { Hono } from "hono";
import tasksRoute from "./tasks";
import { errorHandler } from "../middleware/errorHandler";
import { MOCK_ENV } from "../test-utils";
import type { ErrorResponse } from "../errors";
import {
  setDefaultContainer,
  resetContainer,
  createMockContainer,
} from "../di/container";

beforeEach(() => {
  const mockContainer = createMockContainer();
  setDefaultContainer(mockContainer);
});

afterEach(() => {
  resetContainer();
});

describe("POST /tasks", () => {
  const app = new Hono<{ Bindings: { OPENAI_API_KEY: string } }>();
  app.route("/", tasksRoute);
  app.onError(errorHandler);

  it("should return 400 for invalid input (missing blueprint)", async () => {
    const res = await app.request(
      "/",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectName: "Test Project",
          // blueprint is missing
        }),
      },
      MOCK_ENV,
    );

    expect(res.status).toBe(400);
    const data = (await res.json()) as ErrorResponse;
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
          projectName: "Test Project",
          blueprint: "# Test Blueprint\n\nThis is a test blueprint content.",
        }),
      },
      MOCK_ENV,
    );

    expect(res.status).toBe(200);
    const text = await res.text();
    expect(text).toBe("mock data");
  });
});
