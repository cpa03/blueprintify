import type { AIConfig } from "../services/openai";
import { getContainer } from "../di/container";
import { ConfigurationError } from "../errors";
import type { ValidatedContext, ControllerContext } from "../types";
import type { z } from "zod";
import { CONFIG_MESSAGES } from "../config/constants";

export abstract class BaseController {
  protected createAIConfig(c: ControllerContext): AIConfig {
    const config: AIConfig = {
      apiKey: c.env.OPENAI_API_KEY,
      baseURL: c.env.OPENAI_BASE_URL,
      model: c.env.OPENAI_MODEL,
    };

    if (!config.apiKey) {
      throw new ConfigurationError(CONFIG_MESSAGES.OPENAI_API_KEY_MISSING);
    }

    return config;
  }

  protected async handleStreamingResponse(
    generator: AsyncGenerator<string, void, unknown>,
  ): Promise<Response> {
    const container = getContainer();
    const stream = container.streamUtils.createStreamFromGenerator(generator);
    return container.streamUtils.createSSEResponse(stream);
  }

  protected getValidatedData<T extends z.ZodSchema>(
    c: ValidatedContext<T>,
  ): z.infer<T> {
    const data = c.get("validatedData");
    if (!data) {
      throw new Error(CONFIG_MESSAGES.VALIDATED_DATA_NOT_FOUND);
    }
    return data;
  }

  protected validateEnvironment(c: ControllerContext): void {
    if (!c.env.OPENAI_API_KEY) {
      throw new ConfigurationError(CONFIG_MESSAGES.OPENAI_API_KEY_MISSING);
    }
  }
}
