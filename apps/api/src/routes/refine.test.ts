import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { Hono } from "hono";
import refineRoute from "./refine";
import { errorHandler } from "../middleware/errorHandler";
import { MOCK_ENV } from "../test-utils";
import type { ErrorResponse } from "../errors";
import {
  HTTP_STATUS,
  HTTP_METHODS,
  HTTP_HEADERS,
  HTTP_HEADER_NAMES,
  ERROR_TYPES,
} from "@blueprint/shared";
import { setDefaultContainer, resetContainer, createMockContainer } from "../di/container";

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
        method: HTTP_METHODS.POST,
        headers: { [HTTP_HEADER_NAMES.CONTENT_TYPE]: HTTP_HEADERS.CONTENT_TYPE_JSON },
        body: JSON.stringify({
          instruction: "Make it better",
          // content is missing
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
          content: "# Original Content",
          instruction: "Make it more detailed",
        }),
      },
      MOCK_ENV
    );

    expect(res.status).toBe(HTTP_STATUS.OK);
    const text = await res.text();
    expect(text).toBe("mock data");
  });
});
