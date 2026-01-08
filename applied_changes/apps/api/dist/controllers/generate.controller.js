/**
 * Generate Controller
 * Handles business logic for blueprint generation endpoint
 */
import { ARCHITECT_SYSTEM_PROMPT, buildBlueprintPrompt, } from "../services/prompts";
import { streamCompletion } from "../services/openai";
import { createOpenAIConfigError, wrapOpenAIError, wrapStreamError, } from "../lib/errors";
import { createSSEResponse, createStreamFromGenerator } from "../utils/stream";
/**
 * Validates OpenAI configuration
 */
function validateAIConfig(config) {
    if (!config.apiKey) {
        throw createOpenAIConfigError();
    }
}
/**
 * Generates a blueprint stream based on user request
 *
 * @param request - The validated blueprint request
 * @param c - Hono context with environment bindings
 * @returns SSE stream response
 */
export async function generateBlueprint(request, c) {
    try {
        // Extract and validate AI configuration
        const config = {
            apiKey: c.env.OPENAI_API_KEY,
            baseURL: c.env.OPENAI_BASE_URL,
            model: c.env.OPENAI_MODEL,
        };
        validateAIConfig(config);
        // Build prompt for AI service
        const userPrompt = buildBlueprintPrompt(request);
        // Create stream generator
        const generator = streamCompletion({
            systemPrompt: ARCHITECT_SYSTEM_PROMPT,
            userPrompt,
            config,
        });
        // Wrap in SSE response
        const stream = createStreamFromGenerator(generator);
        return createSSEResponse(stream);
    }
    catch (error) {
        // Wrap known errors or create new ones
        if (error instanceof Error &&
            error.message === "OpenAI API key not configured") {
            throw wrapOpenAIError(error);
        }
        throw wrapStreamError(error);
    }
}
/**
 * Controller export for route handler integration
 */
export const generateController = {
    generateBlueprint,
};
