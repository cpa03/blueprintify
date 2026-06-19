import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { BaseController } from "./base.controller";
import { ConfigurationError } from "../errors";
import { setDefaultContainer, resetContainer, createMockContainer } from "../di/container";
import type { ControllerContext } from "../types";
import { AI_DEFAULTS, ERROR_CLASS_NAMES } from "@blueprint/shared";
import { TEST_API_KEY } from "../test-utils";

// Create a concrete implementation for testing
class TestController extends BaseController {}

// Mock the errors module
vi.mock("../errors", () => ({
  ConfigurationError: class ConfigurationError extends Error {
    constructor(message: string) {
      super(message);
      this.name = ERROR_CLASS_NAMES.CONFIGURATION_ERROR;
    }
  },
}));

// Mock the config to ensure DEFAULT_MODEL getter works
vi.mock("../config/constants", async () => {
  const actual = await vi.importActual("../config/constants");
  // Reference AI_DEFAULTS to stay in sync with shared single source of truth
  const shared: typeof import("@blueprint/shared") = (await vi.importActual(
    "@blueprint/shared"
  )) as typeof import("@blueprint/shared");
  return {
    ...actual,
    AI_CONFIG: {
      DEFAULT_MODEL: shared.AI_DEFAULTS.MODEL,
      DEFAULT_TIMEOUT: shared.AI_DEFAULTS.TIMEOUT_MS,
      DEFAULT_MAX_TOKENS: shared.AI_DEFAULTS.MAX_TOKENS,
      DEFAULT_TEMPERATURE: shared.AI_DEFAULTS.TEMPERATURE,
    },
  };
});

// Helper to create a mock ControllerContext
function createMockControllerContext(env: {
  OPENAI_API_KEY: string;
  OPENAI_BASE_URL?: string;
  OPENAI_MODEL?: string;
}): ControllerContext {
  return {
    env: env as ControllerContext["env"],
  } as ControllerContext;
}

// Helper to create a mock context with validated data
function createMockValidatedContext<T>(
  data: T
): ControllerContext & { get: (key: string) => T | undefined } {
  return {
    get: (_key: string) => data,
  } as ControllerContext & { get: (key: string) => T | undefined };
}

describe("BaseController", () => {
  let controller: TestController;
  let originalConsoleError: typeof console.error;

  beforeEach(() => {
    controller = new TestController();
    originalConsoleError = console.error;
    console.error = vi.fn();

    // Setup mock container
    const mockContainer = createMockContainer();
    setDefaultContainer(mockContainer);

    // Stream mocks are auto-applied via top-level vi.mock in test-utils.ts
  });

  afterEach(() => {
    resetContainer();
    console.error = originalConsoleError;
  });

  describe("createAIConfig", () => {
    it("should create AI config with all required fields", () => {
      const mockContext = createMockControllerContext({
        OPENAI_API_KEY: TEST_API_KEY,
        OPENAI_BASE_URL: AI_DEFAULTS.BASE_URL,
        OPENAI_MODEL: "gpt-4",
      });

      const config = controller.createAIConfig(mockContext);

      expect(config.apiKey).toBe(TEST_API_KEY);
      expect(config.baseURL).toBe(AI_DEFAULTS.BASE_URL);
      expect(config.model).toBe("gpt-4");
      expect(config.timeout).toBe(AI_DEFAULTS.TIMEOUT_MS);
    });

    it("should use provided model from env", () => {
      const mockContext = createMockControllerContext({
        OPENAI_API_KEY: TEST_API_KEY,
        OPENAI_BASE_URL: AI_DEFAULTS.BASE_URL,
        OPENAI_MODEL: "gpt-4o",
      });

      const config = controller.createAIConfig(mockContext);

      expect(config.model).toBe("gpt-4o");
    });

    it("should throw ConfigurationError when API key is missing", () => {
      const mockContext = createMockControllerContext({
        OPENAI_API_KEY: "",
        OPENAI_BASE_URL: undefined,
        OPENAI_MODEL: undefined,
      });

      expect(() => controller.createAIConfig(mockContext)).toThrow(ConfigurationError);
    });
  });

  describe("handleStreamingResponse", () => {
    it("should return a Response object", async () => {
      const generator = async function* (): AsyncGenerator<string> {
        yield "chunk1";
        yield "chunk2";
      };

      const response = await controller.handleStreamingResponse(generator());

      expect(response).toBeInstanceOf(Response);
    });
  });

  describe("getValidatedData", () => {
    it("should extract validated data from context", () => {
      const mockData = { test: "data" };
      const mockContext = createMockValidatedContext(mockData);

      const result = controller.getValidatedData(mockContext as never);

      expect(result).toEqual(mockData);
    });

    it("should throw when validated data is not found", () => {
      const mockContext = {
        get: () => undefined,
      } as never;

      expect(() => controller.getValidatedData(mockContext)).toThrow(
        "Validated data not found in context"
      );
    });
  });

  describe("validateEnvironment", () => {
    it("should not throw when API key is present", () => {
      const mockContext = createMockControllerContext({
        OPENAI_API_KEY: TEST_API_KEY,
      });

      expect(() => controller.validateEnvironment(mockContext)).not.toThrow();
    });

    it("should throw ConfigurationError when API key is missing", () => {
      const mockContext = createMockControllerContext({
        OPENAI_API_KEY: "",
      });

      expect(() => controller.validateEnvironment(mockContext)).toThrow(ConfigurationError);
    });

    it("should throw ConfigurationError when env is undefined", () => {
      const mockContext = createMockControllerContext({
        OPENAI_API_KEY: "",
      });

      expect(() => controller.validateEnvironment(mockContext)).toThrow(ConfigurationError);
    });
  });
});
