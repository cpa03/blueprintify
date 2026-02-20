import OpenAI from "openai";
import { withRetry } from "../utils/retry";
import {
  createCircuitBreaker,
  CircuitBreaker,
  CircuitBreakerOpenError,
} from "../utils/circuitBreaker";
import { AI_CONFIG, CIRCUIT_BREAKER_CONFIG } from "../config/constants";
import { logExternalApiCall } from "../utils/logging";

export interface AIConfig {
  apiKey: string;
  baseURL?: string;
  model?: string;
  timeout?: number;
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
      failureThreshold: CIRCUIT_BREAKER_CONFIG.DEFAULT_FAILURE_THRESHOLD,
      resetTimeoutMs: CIRCUIT_BREAKER_CONFIG.DEFAULT_RESET_TIMEOUT_MS,
      halfOpenMaxCalls: CIRCUIT_BREAKER_CONFIG.DEFAULT_HALF_OPEN_MAX_CALLS,
    });
  }
  return circuitBreaker;
}

export function createAIClient(config: AIConfig): OpenAI {
  return new OpenAI({
    apiKey: config.apiKey,
    baseURL: config.baseURL,
    timeout: config.timeout,
  });
}

export async function* streamCompletion(
  options: StreamOptions,
): AsyncGenerator<string, void, unknown> {
  const cb = getCircuitBreaker();

  if (cb.getState().state === "OPEN") {
    throw new CircuitBreakerOpenError("AI service temporarily unavailable");
  }

  const model = options.config.model || AI_CONFIG.DEFAULT_MODEL;
  const startTime = Date.now();

  logExternalApiCall({
    type: "external_api_call",
    service: "openai",
    operation: "stream_completion",
    status: "started",
    model,
  });

  try {
    const client = createAIClient(options.config);

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

    logExternalApiCall({
      type: "external_api_call",
      service: "openai",
      operation: "stream_completion",
      status: "success",
      durationMs: Date.now() - startTime,
      model,
    });
  } catch (error) {
    logExternalApiCall({
      type: "external_api_call",
      service: "openai",
      operation: "stream_completion",
      status: "error",
      durationMs: Date.now() - startTime,
      model,
      error: error instanceof Error ? error.message : "Unknown error",
    });

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

  const model = options.config.model || AI_CONFIG.DEFAULT_MODEL;
  const startTime = Date.now();

  logExternalApiCall({
    type: "external_api_call",
    service: "openai",
    operation: "generate_completion",
    status: "started",
    model,
  });

  try {
    const client = createAIClient(options.config);

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

    logExternalApiCall({
      type: "external_api_call",
      service: "openai",
      operation: "generate_completion",
      status: "success",
      durationMs: Date.now() - startTime,
      model,
    });

    return response.choices[0]?.message?.content || "";
  } catch (error) {
    logExternalApiCall({
      type: "external_api_call",
      service: "openai",
      operation: "generate_completion",
      status: "error",
      durationMs: Date.now() - startTime,
      model,
      error: error instanceof Error ? error.message : "Unknown error",
    });

    if (error instanceof CircuitBreakerOpenError) {
      throw error;
    }
    throw new Error(
      `AI service error: ${error instanceof Error ? error.message : "Unknown error"}`,
    );
  }
}
