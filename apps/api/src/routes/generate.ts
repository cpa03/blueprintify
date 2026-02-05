import { Hono } from "hono";
import { BlueprintRequestSchema } from "@blueprint/shared";
import {
  ARCHITECT_SYSTEM_PROMPT,
  buildBlueprintPrompt,
} from "../services/prompts";
import { streamCompletion, type AIConfig } from "../services/openai";
import { createSSEResponse, createStreamFromGenerator } from "../utils/stream";
import { ConfigurationError } from "../errors";
import { validateJson } from "../middleware/validator";
import type { Env } from "../types";

const app = new Hono<{ Bindings: Env }>();

app.post("/", validateJson(BlueprintRequestSchema), async (c) => {
  const request = c.get("validatedData");

  const config: AIConfig = {
    apiKey: c.env.OPENAI_API_KEY,
    baseURL: c.env.OPENAI_BASE_URL,
    model: c.env.OPENAI_MODEL,
  };

  if (!config.apiKey) {
    throw new ConfigurationError("OpenAI API key not configured");
  }

  const userPrompt = buildBlueprintPrompt(request);

  const generator = streamCompletion({
    systemPrompt: ARCHITECT_SYSTEM_PROMPT,
    userPrompt,
    config,
  });

  const stream = createStreamFromGenerator(generator);
  return createSSEResponse(stream);
});

export default app;
