/**
 * Tests for Refine controller
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { refineController } from "./refine.controller";
// Mock dependencies
vi.mock("../services/prompts", () => ({
    REFINER_SYSTEM_PROMPT: "You are a refiner",
    buildRefinePrompt: vi.fn((request) => `Refine content: ${request.instruction}`),
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
describe("refineController", () => {
    const mockRequest = {
        content: "Original content to be refined",
        instruction: "Make it more detailed",
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
    describe("refineContent", () => {
        it("should refine content stream successfully", async () => {
            const mockGenerator = async function* () {
                yield "Refined content\n";
                yield "More details here...\n";
            };
            vi.mocked(streamCompletion).mockReturnValue(mockGenerator);
            const result = await refineController.refineContent(mockRequest, mockContext);
            expect(streamCompletion).toHaveBeenCalledWith({
                systemPrompt: "You are a refiner",
                userPrompt: "Refine content: Make it more detailed",
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
            await expect(refineController.refineContent(mockRequest, mockContextWithoutKey)).rejects.toThrow();
            expect(streamCompletion).not.toHaveBeenCalled();
        });
        it("should wrap stream errors appropriately", async () => {
            vi.mocked(streamCompletion).mockImplementation(() => {
                throw new Error("Stream failed");
            });
            await expect(refineController.refineContent(mockRequest, mockContext)).rejects.toThrow("Stream processing failed");
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
                yield "Refined content";
            };
            vi.mocked(streamCompletion).mockReturnValue(mockGenerator);
            await refineController.refineContent(mockRequest, mockContextWithoutModel);
            expect(streamCompletion).toHaveBeenCalledWith(expect.objectContaining({
                config: expect.objectContaining({
                    model: undefined,
                }),
            }));
        });
        it("should handle requests with context", async () => {
            const requestWithContext = {
                content: "Content to refine",
                instruction: "Improve the structure",
                context: "This is part of a larger blueprint",
            };
            const mockGenerator = async function* () {
                yield "Refined with context";
            };
            vi.mocked(streamCompletion).mockReturnValue(mockGenerator);
            await refineController.refineContent(requestWithContext, mockContext);
            expect(streamCompletion).toHaveBeenCalled();
        });
        it("should handle different instructions", async () => {
            const differentRequest = {
                content: "Original content",
                instruction: "Simplify this text and make it clearer",
            };
            const mockGenerator = async function* () {
                yield "Simplified content";
            };
            vi.mocked(streamCompletion).mockReturnValue(mockGenerator);
            await refineController.refineContent(differentRequest, mockContext);
            expect(streamCompletion).toHaveBeenCalled();
        });
    });
});
