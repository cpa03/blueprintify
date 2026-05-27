/**
 * OpenAI Service Module
 * Provides AI completion functionality with circuit breaker and retry support
 * for resilient API interactions.
 */

import OpenAI from "openai";
import { withRetry } from "../utils/retry";
import {
  createCircuitBreaker,
  CircuitBreaker,
  CircuitBreakerOpenError,
} from "../utils/circuitBreaker";
import { AI_CONFIG, CIRCUIT_BREAKER_CONFIG, ERROR_MESSAGES } from "../config/constants";

/**
 * Configuration options for AI client initialization
 */
export interface AIConfig {
  /** OpenAI API key (required) */
  apiKey: string;
  /** Custom API base URL for compatible providers */
  baseURL?: string;
  /** Model identifier to use for completions */
  model?: string;
  /** Request timeout in milliseconds */
  timeout?: number;
}

/**
 * Options for streaming and non-streaming completions
 */
export interface StreamOptions {
  /** System prompt to set AI behavior */
  systemPrompt: string;
  /** User prompt for the specific request */
  userPrompt: string;
  /** AI client configuration */
  config: AIConfig;
}

/**
 * Singleton circuit breaker instance for AI service resilience.
 * Eagerly initialized at module load to eliminate cold-start gap
 * where burst traffic could bypass protection.
 * Uses a 30-second cold start window so the first requests after a
 * cold start are met with a more sensitive (halved) failure threshold.
 */
const circuitBreaker: CircuitBreaker = createCircuitBreaker({
  failureThreshold: CIRCUIT_BREAKER_CONFIG.DEFAULT_FAILURE_THRESHOLD,
  resetTimeoutMs: CIRCUIT_BREAKER_CONFIG.DEFAULT_RESET_TIMEOUT_MS,
  halfOpenMaxCalls: CIRCUIT_BREAKER_CONFIG.DEFAULT_HALF_OPEN_MAX_CALLS,
  coldStartWindowMs: CIRCUIT_BREAKER_CONFIG.DEFAULT_COLD_START_WINDOW_MS,
});

/**
 * Returns the singleton circuit breaker instance.
 * Initialized at module load — no lazy init needed.
 *
 * @returns The shared CircuitBreaker instance
 */
export function initializeCircuitBreaker(): CircuitBreaker {
  return circuitBreaker;
}

/**
 * Returns the singleton circuit breaker instance.
 * Alias for initializeCircuitBreaker() that guarantees the breaker is ready.
 *
 * @returns The shared CircuitBreaker instance
 */
function getCircuitBreaker(): CircuitBreaker {
  return initializeCircuitBreaker();
}

/**
 * Creates an OpenAI client instance with the provided configuration
 * @param config - AI client configuration options
 * @returns Configured OpenAI client instance
 */
export function createAIClient(config: AIConfig): OpenAI {
  return new OpenAI({
    apiKey: config.apiKey,
    baseURL: config.baseURL,
    timeout: config.timeout,
  });
}

/**
 * Streams AI completion chunks with circuit breaker protection and retry logic
 * @param options - Stream options containing prompts and configuration
 * @yields Content chunks as they are generated
 * @throws {CircuitBreakerOpenError} When circuit breaker is open
 * @throws {Error} When AI service encounters an error
 */
export async function* streamCompletion(
  options: StreamOptions
): AsyncGenerator<string, void, unknown> {
  const cb = getCircuitBreaker();

  if (cb.getState().state === "OPEN") {
    throw new CircuitBreakerOpenError(ERROR_MESSAGES.AI_SERVICE_UNAVAILABLE);
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
        })
      )
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
      ERROR_MESSAGES.AI_SERVICE_FAILURE(
        error instanceof Error ? error.message : ERROR_MESSAGES.UNKNOWN_ERROR
      ),
      { cause: error }
    );
  }
}

/**
 * Generates a complete AI response with circuit breaker protection and retry logic
 * @param options - Stream options containing prompts and configuration
 * @returns Promise resolving to the complete generated text
 * @throws {CircuitBreakerOpenError} When circuit breaker is open
 * @throws {Error} When AI service encounters an error
 */
export async function generateCompletion(options: StreamOptions): Promise<string> {
  const cb = getCircuitBreaker();

  if (cb.getState().state === "OPEN") {
    throw new CircuitBreakerOpenError(ERROR_MESSAGES.AI_SERVICE_UNAVAILABLE);
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
        })
      )
    );

    return response.choices[0]?.message?.content || "";
  } catch (error) {
    if (error instanceof CircuitBreakerOpenError) {
      throw error;
    }
    throw new Error(
      ERROR_MESSAGES.AI_SERVICE_FAILURE(
        error instanceof Error ? error.message : ERROR_MESSAGES.UNKNOWN_ERROR
      ),
      { cause: error }
    );
  }
}
