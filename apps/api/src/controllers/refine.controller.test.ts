import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { RefineController } from "./refine.controller";
import type { RefineContext } from "../types";
import { ConfigurationError } from "../errors";
import { MOCK_ENV, setupStreamMocks } from "../test-utils";
import { setDefaultContainer, resetContainer, createMockContainer } from "../di/container";

// Mock the prompts module
vi.mock("../services/prompts", () => ({
  REFINER_SYSTEM_PROMPT: "You are a refiner",
  buildRefinePrompt: vi.fn(
    (request) => `Refine section ${request.content} with instructions: ${request.instruction}`
  ),
}));

// Mock the errors module
vi.mock("../errors", () => ({
  ConfigurationError: class ConfigurationError extends Error {
    constructor(message: string) {
      super(message);
      this.name = "ConfigurationError";
    }
  },
}));

/** Creates a mock Hono context with get method for validated data */
const createMockContext = (env: Record<string, string>, validatedData?: unknown): RefineContext =>
  ({
    env,
    get: (key: string) => (key === "validatedData" ? validatedData : undefined),
  }) as unknown as RefineContext;

describe("RefineController", () => {
  let controller: RefineController;
  let originalConsoleError: typeof console.error;

  beforeEach(() => {
    controller = new RefineController();
    originalConsoleError = console.error;
    console.error = vi.fn();

    const mockContainer = createMockContainer();
    setDefaultContainer(mockContainer);

    setupStreamMocks();
  });

  afterEach(() => {
    resetContainer();
    console.error = originalConsoleError;
  });

  describe("refineContent", () => {
    const mockRefineRequest = {
      content: "# Existing Content\n\nSome content here",
      instruction: "Make it more detailed",
    };

    it("should throw ConfigurationError when API key is missing", async () => {
      const mockContext = {
        env: {},
      } as unknown as RefineContext;

      await expect(controller.refineContent(mockContext)).rejects.toThrow(ConfigurationError);
    });

    it("should call buildRefinePrompt with request data", async () => {
      const mockContext = createMockContext(MOCK_ENV, mockRefineRequest);

      const { buildRefinePrompt } = await import("../services/prompts");

      await controller.refineContent(mockContext);

      expect(buildRefinePrompt).toHaveBeenCalledWith(mockRefineRequest);
    });

    it("should return a streaming Response", async () => {
      const mockContext = createMockContext(MOCK_ENV, mockRefineRequest);

      const response = await controller.refineContent(mockContext);

      expect(response).toBeInstanceOf(Response);
    });

    it("should validate environment before refining", async () => {
      const mockContext = {
        env: {},
      } as unknown as RefineContext;

      await expect(controller.refineContent(mockContext)).rejects.toThrow();
    });
  });
});
