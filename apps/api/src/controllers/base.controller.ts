import type { AIConfig } from "../services/openai";
import { createSSEResponse, createStreamFromGenerator } from "../utils/stream";
import { ConfigurationError } from "../errors";
import type { ValidatedContext, ControllerContext } from "../types";
import type { z } from "zod";

export abstract class BaseController {
  protected createAIConfig(c: ControllerContext): AIConfig {
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

  protected getValidatedData<T extends z.ZodSchema>(
    c: ValidatedContext<T>,
  ): z.infer<T> {
    const data = c.get("validatedData");
    if (!data) {
      throw new Error("Validated data not found in context");
    }
    return data;
  }

  protected validateEnvironment(c: ControllerContext): void {
    if (!c.env.OPENAI_API_KEY) {
      throw new ConfigurationError("OpenAI API key not configured");
    }
  }
}
