import type { AIConfig } from "../services/openai";
import { getContainer } from "../di/container";
import { ConfigurationError } from "../errors";
import type { ValidatedContext, ControllerContext } from "../types";
import type { z } from "zod";
import { CONFIG_MESSAGES, AI_CONFIG } from "../config/constants";

/**
 * Base controller providing common functionality for API endpoint handlers.
 * All route controllers extend this class to inherit shared methods for
 * AI configuration, streaming responses, and environment validation.
 */
export abstract class BaseController {
  /**
   * Creates an AI configuration object from the request context.
   * @param c - The Hono context containing environment bindings
   * @returns AIConfig object with API key, base URL, model, and timeout
   * @throws {ConfigurationError} When OPENAI_API_KEY is not configured
   */
  protected createAIConfig(c: ControllerContext): AIConfig {
    const config: AIConfig = {
      apiKey: c.env.OPENAI_API_KEY,
      baseURL: c.env.OPENAI_BASE_URL,
      model: c.env.OPENAI_MODEL,
      timeout: AI_CONFIG.DEFAULT_TIMEOUT,
    };

    if (!config.apiKey) {
      throw new ConfigurationError(CONFIG_MESSAGES.OPENAI_API_KEY_MISSING);
    }

    return config;
  }

  /**
   * Creates a streaming HTTP response from an async generator.
   * @param generator - Async generator yielding content chunks
   * @returns Response object configured for SSE streaming
   */
  protected async handleStreamingResponse(
    generator: AsyncGenerator<string, void, unknown>,
  ): Promise<Response> {
    const container = getContainer();
    const stream = container.streamUtils.createStreamFromGenerator(generator);
    return container.streamUtils.createSSEResponse(stream);
  }

  /**
   * Retrieves validated request data from the context.
   * @param c - Validated context containing parsed request data
   * @returns The validated and typed request data
   * @throws {Error} When validated data is not found in context
   */
  protected getValidatedData<T extends z.ZodSchema>(
    c: ValidatedContext<T>,
  ): z.infer<T> {
    const data = c.get("validatedData");
    if (!data) {
      throw new Error(CONFIG_MESSAGES.VALIDATED_DATA_NOT_FOUND);
    }
    return data;
  }

  /**
   * Validates that required environment variables are configured.
   * @param c - The Hono context containing environment bindings
   * @throws {ConfigurationError} When OPENAI_API_KEY is not configured
   */
  protected validateEnvironment(c: ControllerContext): void {
    if (!c.env.OPENAI_API_KEY) {
      throw new ConfigurationError(CONFIG_MESSAGES.OPENAI_API_KEY_MISSING);
    }
  }
}
