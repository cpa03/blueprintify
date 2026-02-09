import OpenAI from "openai";
import { withRetry } from "../utils/retry";
import { defaultCircuitBreaker } from "../utils/circuitBreaker";
import { AI_CONFIG } from "../config/constants";

export interface AIConfig {
  apiKey: string;
  baseURL?: string;
  model?: string;
}

export interface StreamOptions {
  systemPrompt: string;
  userPrompt: string;
  config: AIConfig;
}

/**
 * Creates an OpenAI client configured for edge runtime
 */
export function createAIClient(config: AIConfig): OpenAI {
  return new OpenAI({
    apiKey: config.apiKey,
    baseURL: config.baseURL,
  });
}

/**
 * Streams a chat completion response
 */
export async function* streamCompletion(
  options: StreamOptions,
): AsyncGenerator<string, void, unknown> {
  const client = createAIClient(options.config);
  const model = options.config.model || AI_CONFIG.DEFAULT_MODEL;

  const stream = await defaultCircuitBreaker.execute(() =>
    withRetry(() =>
      client.chat.completions.create({
        model,
        messages: [
          { role: "system", content: options.systemPrompt },
          { role: "user", content: options.userPrompt },
        ],
        stream: true,
        temperature: AI_CONFIG.DEFAULT_TEMPERATURE,
        max_tokens: AI_CONFIG.DEFAULT_MAX_TOKENS,
      }),
    ),
  );

  for await (const chunk of stream) {
    const content = chunk.choices[0]?.delta?.content;
    if (content) {
      yield content;
    }
  }
}

/**
 * Non-streaming chat completion (for shorter responses)
 */
export async function generateCompletion(
  options: StreamOptions,
): Promise<string> {
  const client = createAIClient(options.config);
  const model = options.config.model || AI_CONFIG.DEFAULT_MODEL;

  const response = await defaultCircuitBreaker.execute(() =>
    withRetry(() =>
      client.chat.completions.create({
        model,
        messages: [
          { role: "system", content: options.systemPrompt },
          { role: "user", content: options.userPrompt },
        ],
        temperature: AI_CONFIG.DEFAULT_TEMPERATURE,
        max_tokens: AI_CONFIG.DEFAULT_MAX_TOKENS,
      }),
    ),
  );

  return response.choices[0]?.message?.content || "";
}
