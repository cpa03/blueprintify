import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { BaseController } from "./base.controller";
import { ConfigurationError } from "../errors";
import { MOCK_ENV, setupStreamMocks } from "../test-utils";
import { setDefaultContainer, resetContainer, createMockContainer } from "../di/container";

// Create a concrete implementation for testing
class TestController extends BaseController {}

// Mock the errors module
vi.mock("../errors", () => ({
  ConfigurationError: class ConfigurationError extends Error {
    constructor(message: string) {
      super(message);
      this.name = "ConfigurationError";
    }
  },
}));

// Mock the config to ensure DEFAULT_MODEL getter works
vi.mock("../config/constants", async () => {
  const actual = await vi.importActual("../config/constants");
  return {
    ...actual,
    AI_CONFIG: {
      DEFAULT_MODEL: "gpt-4o-mini",
      DEFAULT_TIMEOUT: 60000,
      DEFAULT_MAX_TOKENS: 4000,
      DEFAULT_TEMPERATURE: 0.7,
    },
  };
});

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

    setupStreamMocks();
  });

  afterEach(() => {
    resetContainer();
    console.error = originalConsoleError;
  });

  describe("createAIConfig", () => {
    it("should create AI config with all required fields", () => {
      const mockContext = {
        env: {
          OPENAI_API_KEY: "test-key",
          OPENAI_BASE_URL: "https://api.openai.com",
          OPENAI_MODEL: "gpt-4",
        },
      } as unknown as {
        env: { OPENAI_API_KEY: string; OPENAI_BASE_URL?: string; OPENAI_MODEL?: string };
      };

      const config = controller.createAIConfig(mockContext);

      expect(config.apiKey).toBe("test-key");
      expect(config.baseURL).toBe("https://api.openai.com");
      expect(config.model).toBe("gpt-4");
      expect(config.timeout).toBe(60000);
    });

    it("should use provided model from env", () => {
      const mockContext = {
        env: {
          OPENAI_API_KEY: "test-key",
          OPENAI_BASE_URL: "https://api.openai.com",
          OPENAI_MODEL: "gpt-4o",
        },
      } as unknown as {
        env: { OPENAI_API_KEY: string; OPENAI_BASE_URL?: string; OPENAI_MODEL?: string };
      };

      const config = controller.createAIConfig(mockContext);

      expect(config.model).toBe("gpt-4o");
    });

    it("should throw ConfigurationError when API key is missing", () => {
      const mockContext = {
        env: {
          OPENAI_API_KEY: "",
          OPENAI_BASE_URL: undefined,
          OPENAI_MODEL: undefined,
        },
      } as unknown as {
        env: { OPENAI_API_KEY: string; OPENAI_BASE_URL?: string; OPENAI_MODEL?: string };
      };

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
      const mockContext = {
        get: vi.fn().mockReturnValue(mockData),
      } as unknown as { get: (key: string) => typeof mockData };

      const result = controller.getValidatedData(mockContext);

      expect(result).toEqual(mockData);
    });

    it("should throw when validated data is not found", () => {
      const mockContext = {
        get: vi.fn().mockReturnValue(undefined),
      } as unknown as { get: (key: string) => undefined };

      expect(() => controller.getValidatedData(mockContext)).toThrow(
        "Validated data not found in context"
      );
    });
  });

  describe("validateEnvironment", () => {
    it("should not throw when API key is present", () => {
      const mockContext = {
        env: {
          OPENAI_API_KEY: "test-key",
        },
      } as unknown as { env: { OPENAI_API_KEY: string } };

      expect(() => controller.validateEnvironment(mockContext)).not.toThrow();
    });

    it("should throw ConfigurationError when API key is missing", () => {
      const mockContext = {
        env: {
          OPENAI_API_KEY: "",
        },
      } as unknown as { env: { OPENAI_API_KEY: string } };

      expect(() => controller.validateEnvironment(mockContext)).toThrow(ConfigurationError);
    });

    it("should throw ConfigurationError when env is undefined", () => {
      const mockContext = {
        env: {},
      } as unknown as { env: { OPENAI_API_KEY?: string } };

      expect(() => controller.validateEnvironment(mockContext)).toThrow(ConfigurationError);
    });
  });
});
