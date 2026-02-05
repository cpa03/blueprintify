import { streamCompletion, type AIConfig } from "../services/openai";
import { createSSEResponse, createStreamFromGenerator } from "../utils/stream";
import { ConfigurationError } from "../errors";
import {
  TASK_SPLITTER_SYSTEM_PROMPT,
  buildTaskPrompt,
} from "../services/prompts";
import type { z } from "zod";
import type { TaskGenerationRequestSchema } from "@blueprint/shared";
import type { Env } from "../types";

export class TasksController {
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

  async generateTasks(c: any): Promise<Response> {
    const { blueprint, projectName } = c.get("validatedData") as z.infer<
      typeof TaskGenerationRequestSchema
    >;
    const config = this.createAIConfig(c);

    const userPrompt = buildTaskPrompt(blueprint, projectName);

    const generator = streamCompletion({
      systemPrompt: TASK_SPLITTER_SYSTEM_PROMPT,
      userPrompt,
      config,
    });

    const stream = createStreamFromGenerator(generator);
    return createSSEResponse(stream);
  }
}
