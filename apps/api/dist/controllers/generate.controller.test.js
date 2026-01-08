/**
 * Tests for Generate controller
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { generateController } from "./generate.controller";
// Mock dependencies
vi.mock("../services/prompts", () => ({
    ARCHITECT_SYSTEM_PROMPT: "You are an architect",
    buildBlueprintPrompt: vi.fn((request) => `Generate blueprint for ${request.projectName}`),
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
describe("generateController", () => {
    const mockRequest = {
        projectName: "Test Project",
        description: "A test project description",
        techStack: [
            { name: "React", category: "frontend" },
            { name: "Node.js", category: "backend" },
        ],
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
    describe("generateBlueprint", () => {
        it("should generate a blueprint stream successfully", async () => {
            const mockGenerator = async function* () {
                yield "# Blueprint\n";
                yield "Content here...\n";
            };
            vi.mocked(streamCompletion).mockReturnValue(mockGenerator);
            const result = await generateController.generateBlueprint(mockRequest, mockContext);
            expect(streamCompletion).toHaveBeenCalledWith({
                systemPrompt: "You are an architect",
                userPrompt: "Generate blueprint for Test Project",
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
            await expect(generateController.generateBlueprint(mockRequest, mockContextWithoutKey)).rejects.toThrow();
            expect(streamCompletion).not.toHaveBeenCalled();
        });
        it("should wrap stream errors appropriately", async () => {
            vi.mocked(streamCompletion).mockImplementation(() => {
                throw new Error("Stream failed");
            });
            await expect(generateController.generateBlueprint(mockRequest, mockContext)).rejects.toThrow("Stream processing failed");
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
            await generateController.generateBlueprint(mockRequest, mockContextWithoutModel);
            expect(streamCompletion).toHaveBeenCalledWith(expect.objectContaining({
                config: expect.objectContaining({
                    model: undefined,
                }),
            }));
        });
    });
});
