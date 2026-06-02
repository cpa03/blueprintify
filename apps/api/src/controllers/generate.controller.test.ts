import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { GenerateController } from "./generate.controller";
import type { BlueprintContext } from "../types";
import { ConfigurationError } from "../errors";
import { MOCK_ENV } from "../test-utils";
import { setDefaultContainer, resetContainer, createMockContainer } from "../di/container";

// Mock the prompts module
vi.mock("../services/prompts", () => ({
  ARCHITECT_SYSTEM_PROMPT: "You are an architect",
  buildBlueprintPrompt: vi.fn((request) => `Build blueprint for ${request.projectName}`),
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
const createMockContext = (
  env: Record<string, string>,
  validatedData?: unknown
): BlueprintContext =>
  ({
    env,
    get: (key: string) => (key === "validatedData" ? validatedData : undefined),
  }) as unknown as BlueprintContext;

describe("GenerateController", () => {
  let controller: GenerateController;
  let originalConsoleError: typeof console.error;

  beforeEach(() => {
    controller = new GenerateController();
    originalConsoleError = console.error;
    console.error = vi.fn();

    const mockContainer = createMockContainer();
    setDefaultContainer(mockContainer);

    // Stream mocks are auto-applied via top-level vi.mock in test-utils.ts
  });

  afterEach(() => {
    resetContainer();
    console.error = originalConsoleError;
  });

  describe("generateBlueprint", () => {
    const mockBlueprintRequest = {
      projectName: "Test Project",
      description: "A test project description",
      techStack: [{ name: "React", category: "frontend" }],
      features: ["Feature 1"],
      targetAudience: "Developers",
      constraints: "None",
    };

    it("should throw ConfigurationError when API key is missing", async () => {
      const mockContext = {
        env: {},
      } as unknown as BlueprintContext;

      await expect(controller.generateBlueprint(mockContext)).rejects.toThrow(ConfigurationError);
    });

    it("should call buildBlueprintPrompt with request data", async () => {
      const mockContext = createMockContext(MOCK_ENV, mockBlueprintRequest);

      const { buildBlueprintPrompt } = await import("../services/prompts");

      await controller.generateBlueprint(mockContext);

      expect(buildBlueprintPrompt).toHaveBeenCalledWith(mockBlueprintRequest);
    });

    it("should return a streaming Response", async () => {
      const mockContext = createMockContext(MOCK_ENV, mockBlueprintRequest);

      const response = await controller.generateBlueprint(mockContext);

      expect(response).toBeInstanceOf(Response);
    });

    it("should validate environment before generating", async () => {
      const mockContext = {
        env: {},
      } as unknown as BlueprintContext;

      await expect(controller.generateBlueprint(mockContext)).rejects.toThrow();
    });
  });
});
