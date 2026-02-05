import { streamCompletion, type AIConfig } from "../services/openai";
import { createSSEResponse, createStreamFromGenerator } from "../utils/stream";
import { ConfigurationError } from "../errors";
import {
  ARCHITECT_SYSTEM_PROMPT,
  buildBlueprintPrompt,
} from "../services/prompts";
import type { z } from "zod";
import type { BlueprintRequestSchema } from "@blueprint/shared";
import type { Env } from "../types";

export class GenerateController {
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

  async generateBlueprint(c: any): Promise<Response> {
    const request = c.get("validatedData") as z.infer<
      typeof BlueprintRequestSchema
    >;
    const config = this.createAIConfig(c);

    const userPrompt = buildBlueprintPrompt(request);

    const generator = streamCompletion({
      systemPrompt: ARCHITECT_SYSTEM_PROMPT,
      userPrompt,
      config,
    });

    const stream = createStreamFromGenerator(generator);
    return createSSEResponse(stream);
  }
}
