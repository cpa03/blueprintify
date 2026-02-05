import { streamCompletion, type AIConfig } from "../services/openai";
import { createSSEResponse, createStreamFromGenerator } from "../utils/stream";
import { ConfigurationError } from "../errors";
import { REFINER_SYSTEM_PROMPT, buildRefinePrompt } from "../services/prompts";
import type { z } from "zod";
import type { RefineRequestSchema } from "@blueprint/shared";
import type { Env } from "../types";

export class RefineController {
  private createAIConfig(c: any): AIConfig {
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

  async refineContent(c: any): Promise<Response> {
    const request = c.get("validatedData") as z.infer<
      typeof RefineRequestSchema
    >;
    const config = this.createAIConfig(c);

    const userPrompt = buildRefinePrompt(request);

    const generator = streamCompletion({
      systemPrompt: REFINER_SYSTEM_PROMPT,
      userPrompt,
      config,
    });

    const stream = createStreamFromGenerator(generator);
    return createSSEResponse(stream);
  }
}
