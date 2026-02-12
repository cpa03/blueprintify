import OpenAI from "openai";
import { withRetry } from "../utils/retry";
import {
  createCircuitBreaker,
  CircuitBreaker,
  CircuitBreakerOpenError,
} from "../utils/circuitBreaker";
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

let circuitBreaker: CircuitBreaker | null = null;

function getCircuitBreaker(): CircuitBreaker {
  if (!circuitBreaker) {
    circuitBreaker = createCircuitBreaker({
      failureThreshold: 5,
      resetTimeoutMs: 60000,
      halfOpenMaxCalls: 3,
    });
  }
  return circuitBreaker;
}

export function createAIClient(config: AIConfig): OpenAI {
  return new OpenAI({
    apiKey: config.apiKey,
    baseURL: config.baseURL,
  });
}

export async function* streamCompletion(
  options: StreamOptions,
): AsyncGenerator<string, void, unknown> {
  const cb = getCircuitBreaker();

  if (cb.getState().state === "OPEN") {
    throw new CircuitBreakerOpenError("AI service temporarily unavailable");
  }

  try {
    const client = createAIClient(options.config);
    const model = options.config.model || AI_CONFIG.DEFAULT_MODEL;

    const stream = await cb.execute(() =>
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
  } catch (error) {
    if (error instanceof CircuitBreakerOpenError) {
      throw error;
    }
    throw new Error(
      `AI service error: ${error instanceof Error ? error.message : "Unknown error"}`,
    );
  }
}

export async function generateCompletion(
  options: StreamOptions,
): Promise<string> {
  const cb = getCircuitBreaker();

  if (cb.getState().state === "OPEN") {
    throw new CircuitBreakerOpenError("AI service temporarily unavailable");
  }

  try {
    const client = createAIClient(options.config);
    const model = options.config.model || AI_CONFIG.DEFAULT_MODEL;

    const response = await cb.execute(() =>
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
  } catch (error) {
    if (error instanceof CircuitBreakerOpenError) {
      throw error;
    }
    throw new Error(
      `AI service error: ${error instanceof Error ? error.message : "Unknown error"}`,
    );
  }
}
