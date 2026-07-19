import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { Hono } from "hono";
import tasksRoute from "./tasks";
import { errorHandler } from "../middleware/errorHandler";
import { MOCK_ENV } from "../test-utils";
import type { ErrorResponse } from "../errors";
import { setDefaultContainer, resetContainer, createMockContainer } from "../di/container";
import {
  HTTP_STATUS,
  HTTP_HEADERS,
  HTTP_METHODS,
  HTTP_HEADER_NAMES,
  ERROR_TYPES,
  CONTEXT_KEYS,
  AUTH_DEFAULTS,
} from "@blueprint/shared";
import type { User, AppVariables } from "../types";

beforeEach(() => {
  const mockContainer = createMockContainer();
  setDefaultContainer(mockContainer);
});

afterEach(() => {
  resetContainer();
});

describe("POST /tasks", () => {
  const app = new Hono<{
    Bindings: { OPENAI_API_KEY: string };
    Variables: AppVariables;
  }>();
  // Set user context for tests since route now requires authorization
  app.use("*", async (c, next) => {
    const user: User = { id: "test-user", role: AUTH_DEFAULTS.DEFAULT_ROLE };
    c.set(CONTEXT_KEYS.USER, user);
    await next();
  });
  app.route("/", tasksRoute);
  app.onError(errorHandler);

  it("should return 400 for invalid input (missing blueprint)", async () => {
    const res = await app.request(
      "/",
      {
        method: HTTP_METHODS.POST,
        headers: { [HTTP_HEADER_NAMES.CONTENT_TYPE]: HTTP_HEADERS.CONTENT_TYPE_JSON },
        body: JSON.stringify({
          projectName: "Test Project",
          // blueprint is missing
        }),
      },
      MOCK_ENV
    );

    expect(res.status).toBe(HTTP_STATUS.BAD_REQUEST);
    const data = (await res.json()) as ErrorResponse;
    expect(data).toHaveProperty("success", false);
    expect(data.error).toHaveProperty("type", ERROR_TYPES.VALIDATION);
  });

  it("should return 200/Stream for valid input", async () => {
    const res = await app.request(
      "/",
      {
        method: HTTP_METHODS.POST,
        headers: { [HTTP_HEADER_NAMES.CONTENT_TYPE]: HTTP_HEADERS.CONTENT_TYPE_JSON },
        body: JSON.stringify({
          projectName: "Test Project",
          blueprint: "# Test Blueprint\n\nThis is a test blueprint content.",
        }),
      },
      MOCK_ENV
    );

    expect(res.status).toBe(HTTP_STATUS.OK);
    const text = await res.text();
    expect(text).toBe("mock data");
  });
});
