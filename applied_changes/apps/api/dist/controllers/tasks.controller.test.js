/**
 * Tests for Tasks controller
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { tasksController } from "./tasks.controller";
// Mock dependencies
vi.mock("../services/prompts", () => ({
    TASK_SPLITTER_SYSTEM_PROMPT: "You are a task splitter",
    buildTaskPrompt: vi.fn((blueprint, name) => `Generate tasks for ${name}`),
}));
vi.mock("../services/openai", () => ({
    streamCompletion: vi.fn(),
}));
vi.mock("../utils/stream", () => ({
    createSSEResponse: vi.fn((stream) => ({ body: stream, headers: {} })),
    createStreamFromGenerator: vi.fn((gen) => gen),
}));
import { streamCompletion } from "../services/openai";
import { createSSEResponse } from "../utils/stream";
describe("tasksController", () => {
    const mockRequest = {
        blueprint: "# Test Blueprint\n\nThis is a test blueprint.",
        projectName: "Test Project",
    };
    const mockEnv = {
        OPENAI_API_KEY: "test-api-key",
        OPENAI_BASE_URL: "https://api.openai.com",
        OPENAI_MODEL: "gpt-4",
    };
    const mockContext = {
        env: mockEnv,
    };
    beforeEach(() => {
        vi.clearAllMocks();
    });
    describe("generateTasks", () => {
        it("should generate tasks stream successfully", async () => {
            const mockGenerator = async function* () {
                yield "- [ ] Task 1\n";
                yield "- [ ] Task 2\n";
            };
            vi.mocked(streamCompletion).mockReturnValue(mockGenerator);
            const result = await tasksController.generateTasks(mockRequest, mockContext);
            expect(streamCompletion).toHaveBeenCalledWith({
                systemPrompt: "You are a task splitter",
                userPrompt: "Generate tasks for Test Project",
                config: {
                    apiKey: "test-api-key",
                    baseURL: "https://api.openai.com",
                    model: "gpt-4",
                },
            });
            expect(createSSEResponse).toHaveBeenCalled();
        });
        it("should throw error when API key is missing", async () => {
            const mockEnvWithoutKey = {
                OPENAI_BASE_URL: "https://api.openai.com",
                OPENAI_MODEL: "gpt-4",
            };
            const mockContextWithoutKey = {
                env: mockEnvWithoutKey,
            };
            await expect(tasksController.generateTasks(mockRequest, mockContextWithoutKey)).rejects.toThrow();
            expect(streamCompletion).not.toHaveBeenCalled();
        });
        it("should wrap stream errors appropriately", async () => {
            vi.mocked(streamCompletion).mockImplementation(() => {
                throw new Error("Stream failed");
            });
            await expect(tasksController.generateTasks(mockRequest, mockContext)).rejects.toThrow("Stream processing failed");
        });
        it("should use default model when not specified", async () => {
            const mockEnvWithoutModel = {
                OPENAI_API_KEY: "test-api-key",
                OPENAI_BASE_URL: "https://api.openai.com",
            };
            const mockContextWithoutModel = {
                env: mockEnvWithoutModel,
            };
            const mockGenerator = async function* () {
                yield "Test content";
            };
            vi.mocked(streamCompletion).mockReturnValue(mockGenerator);
            await tasksController.generateTasks(mockRequest, mockContextWithoutModel);
            expect(streamCompletion).toHaveBeenCalledWith(expect.objectContaining({
                config: expect.objectContaining({
                    model: undefined,
                }),
            }));
        });
        it("should handle different blueprint content", async () => {
            const differentRequest = {
                blueprint: "# Complex Blueprint\n\n## Section 1\n\n## Section 2",
                projectName: "Complex Project",
            };
            const mockGenerator = async function* () {
                yield "Task content";
            };
            vi.mocked(streamCompletion).mockReturnValue(mockGenerator);
            await tasksController.generateTasks(differentRequest, mockContext);
            expect(streamCompletion).toHaveBeenCalled();
        });
    });
});
