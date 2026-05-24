import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { TasksController } from "./tasks.controller";
import type { TasksContext } from "../types";
import { ConfigurationError } from "../errors";
import { MOCK_ENV, setupStreamMocks } from "../test-utils";
import { setDefaultContainer, resetContainer, createMockContainer } from "../di/container";

// Mock the prompts module
vi.mock("../services/prompts", () => ({
  TASK_SPLITTER_SYSTEM_PROMPT: "You are a task splitter",
  buildTaskPrompt: vi.fn((_blueprint, projectName) => `Generate tasks for ${projectName}`),
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
const createMockContext = (env: Record<string, string>, validatedData?: unknown): TasksContext =>
  ({
    env,
    get: (key: string) => (key === "validatedData" ? validatedData : undefined),
  }) as unknown as TasksContext;

describe("TasksController", () => {
  let controller: TasksController;
  let originalConsoleError: typeof console.error;

  beforeEach(() => {
    controller = new TasksController();
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

  describe("generateTasks", () => {
    const mockTaskRequest = {
      blueprint: "# Test Blueprint\n\nSome content",
      projectName: "Test Project",
    };

    it("should throw ConfigurationError when API key is missing", async () => {
      const mockContext = {
        env: {},
      } as unknown as TasksContext;

      await expect(controller.generateTasks(mockContext)).rejects.toThrow(ConfigurationError);
    });

    it("should call buildTaskPrompt with blueprint and projectName", async () => {
      const mockContext = createMockContext(MOCK_ENV, mockTaskRequest);

      const { buildTaskPrompt } = await import("../services/prompts");

      await controller.generateTasks(mockContext);

      expect(buildTaskPrompt).toHaveBeenCalledWith(
        mockTaskRequest.blueprint,
        mockTaskRequest.projectName
      );
    });

    it("should return a streaming Response", async () => {
      const mockContext = createMockContext(MOCK_ENV, mockTaskRequest);

      const response = await controller.generateTasks(mockContext);

      expect(response).toBeInstanceOf(Response);
    });

    it("should validate environment before generating", async () => {
      const mockContext = {
        env: {},
      } as unknown as TasksContext;

      await expect(controller.generateTasks(mockContext)).rejects.toThrow();
    });
  });
});
