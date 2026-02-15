import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { Hono } from "hono";
import refineRoute from "./refine";
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

describe("POST /refine", () => {
  const app = new Hono<{ Bindings: { OPENAI_API_KEY: string } }>();
  app.route("/", refineRoute);
  app.onError(errorHandler);

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
          content: "# Original Content",
          instruction: "Make it more detailed",
        }),
      },
      MOCK_ENV,
    );

    expect(res.status).toBe(200);
    const text = await res.text();
    expect(text).toBe("mock data");
  });
});
