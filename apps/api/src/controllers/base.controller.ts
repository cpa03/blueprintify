import type { AIConfig } from "../services/openai";
import { createSSEResponse, createStreamFromGenerator } from "../utils/stream";
import { ConfigurationError } from "../errors";
import type { Env } from "../types";

export abstract class BaseController {
  protected createAIConfig(c: { env: Env }): AIConfig {
    const config: AIConfig = {
      apiKey: c.env.OPENAI_API_KEY,
      baseURL: c.env.OPENAI_BASE_URL,
      model: c.env.OPENAI_MODEL,
    };

    if (!config.apiKey) {
      throw new ConfigurationError("OpenAI API key not configured");
    }

    return config;
  }

  protected async handleStreamingResponse(
    generator: AsyncGenerator<string, void, unknown>,
  ): Promise<Response> {
    const stream = createStreamFromGenerator(generator);
    return createSSEResponse(stream);
  }
}
