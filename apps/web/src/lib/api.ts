import type {
  BlueprintRequest,
  TaskGenerationRequest,
  RefineRequest,
  StreamChunk,
} from "@blueprint/shared";
import { RETRY_CONFIG, HTTP_HEADERS } from "@blueprint/shared";
import {
  RETRYABLE_STATUS_CODES,
  API_ERROR_MESSAGES,
  SSE_CONFIG,
  API_ENDPOINTS,
  UI_FALLBACKS,
  TIMEOUTS,
} from "../config/constants";

const API_BASE = import.meta.env.VITE_API_BASE_URL || UI_FALLBACKS.API_BASE;

interface StreamEventHandlers {
  onChunk: (content: string) => void;
  onError: (error: string) => void;
  onDone: () => void;
  onRetry?: (attempt: number, maxRetries: number) => void;
}

interface RetryOptions {
  maxRetries?: number;
  initialDelay?: number;
  backoffFactor?: number;
  maxDelay?: number;
}

const DEFAULT_RETRY_OPTIONS: Required<RetryOptions> = {
  maxRetries: RETRY_CONFIG.DEFAULT_RETRIES,
  initialDelay: RETRY_CONFIG.DEFAULT_INITIAL_DELAY,
  backoffFactor: RETRY_CONFIG.DEFAULT_BACKOFF_FACTOR,
  maxDelay: RETRY_CONFIG.DEFAULT_MAX_DELAY,
};

/**
 * Calculates delay with exponential backoff
 */
function calculateRetryDelay(
  attempt: number,
  options: RetryOptions = {},
): number {
  const opts = { ...DEFAULT_RETRY_OPTIONS, ...options };
  const delay = opts.initialDelay * Math.pow(opts.backoffFactor, attempt);
  return Math.min(delay, opts.maxDelay);
}

/**
 * Sleep utility for retry delays
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Determines if an error is retryable
 */
function isRetryableError(error: unknown, response?: Response): boolean {
  // Network errors (no response) are retryable
  if (!response) {
    return true;
  }

  return (RETRYABLE_STATUS_CODES as readonly number[]).includes(
    response.status,
  );
}

/**
 * Parses SSE stream and calls appropriate handlers
 */
async function _handleSSEStream(
  response: Response,
  handlers: StreamEventHandlers,
): Promise<void> {
  const reader = response.body?.getReader();
  if (!reader) {
    handlers.onError(API_ERROR_MESSAGES.NO_RESPONSE_BODY);
    return;
  }

  const decoder = new TextDecoder();
  let buffer = "";

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split(SSE_CONFIG.EVENT_SEPARATOR);
      buffer = lines.pop() || "";

      for (const eventBlock of lines) {
        if (!eventBlock.trim()) continue;

        const dataMatch = eventBlock.match(
          new RegExp(`${SSE_CONFIG.DATA_PREFIX}(.+)`),
        );
        if (dataMatch && dataMatch[1]) {
          try {
            const parsed: StreamChunk = JSON.parse(dataMatch[1]);

            if (
              parsed.type === SSE_CONFIG.EVENT_TYPES.CONTENT &&
              parsed.content
            ) {
              handlers.onChunk(parsed.content);
            } else if (
              parsed.type === SSE_CONFIG.EVENT_TYPES.ERROR &&
              parsed.error
            ) {
              handlers.onError(parsed.error);
            } else if (parsed.type === SSE_CONFIG.EVENT_TYPES.DONE) {
              handlers.onDone();
              return;
            }
          } catch {
            // Skip malformed JSON
          }
        }
      }
    }
    handlers.onDone();
  } catch (error) {
    const message =
      error instanceof Error ? error.message : API_ERROR_MESSAGES.STREAM_ERROR;
    handlers.onError(message);
  } finally {
    reader.releaseLock();
  }
}

/**
 * Parses SSE stream with retry logic for connection failures
 */
async function handleSSEStreamWithRetry(
  response: Response,
  handlers: StreamEventHandlers,
  _retryOptions: RetryOptions = {},
): Promise<void> {
  const reader = response.body?.getReader();
  if (!reader) {
    handlers.onError(API_ERROR_MESSAGES.NO_RESPONSE_BODY);
    return;
  }

  const decoder = new TextDecoder();
  let buffer = "";
  let chunksReceived = 0;
  let lastError: Error | null = null;

  try {
    while (true) {
      try {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split(SSE_CONFIG.EVENT_SEPARATOR);
        buffer = lines.pop() || "";

        for (const eventBlock of lines) {
          if (!eventBlock.trim()) continue;

          const dataMatch = eventBlock.match(
            new RegExp(`${SSE_CONFIG.DATA_PREFIX}(.+)`),
          );
          if (dataMatch && dataMatch[1]) {
            try {
              const parsed: StreamChunk = JSON.parse(dataMatch[1]);

              if (
                parsed.type === SSE_CONFIG.EVENT_TYPES.CONTENT &&
                parsed.content
              ) {
                handlers.onChunk(parsed.content);
                chunksReceived++;
              } else if (
                parsed.type === SSE_CONFIG.EVENT_TYPES.ERROR &&
                parsed.error
              ) {
                handlers.onError(parsed.error);
                return;
              } else if (parsed.type === SSE_CONFIG.EVENT_TYPES.DONE) {
                handlers.onDone();
                return;
              }
            } catch {
              // Skip malformed JSON
            }
          }
        }
      } catch (readError) {
        lastError =
          readError instanceof Error
            ? readError
            : new Error(API_ERROR_MESSAGES.STREAM_ERROR);

        if (chunksReceived > 0) {
          throw lastError;
        }

        throw lastError;
      }
    }
    handlers.onDone();
  } catch (error) {
    const message =
      error instanceof Error ? error.message : API_ERROR_MESSAGES.STREAM_ERROR;
    handlers.onError(message);
  } finally {
    reader.releaseLock();
  }
}

/**
 * Shared retry wrapper for API calls with streaming
 */
async function apiCallWithRetry(
  endpoint: string,
  requestBody: unknown,
  handlers: StreamEventHandlers,
  retryOptions: RetryOptions = {},
  errorMessageDefault: string,
): Promise<void> {
  const opts = { ...DEFAULT_RETRY_OPTIONS, ...retryOptions };
  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= opts.maxRetries; attempt++) {
    const controller = new AbortController();
    const timeoutId = setTimeout(
      () => controller.abort(),
      TIMEOUTS.API_CONNECTION,
    );

    try {
      const response = await fetch(`${API_BASE}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": HTTP_HEADERS.CONTENT_TYPE_JSON },
        body: JSON.stringify(requestBody),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = (await response
          .json()
          .catch(() => ({ error: errorMessageDefault }))) as { error?: string };
        const errorMessage = errorData.error || errorMessageDefault;

        if (
          isRetryableError(errorMessage, response) &&
          attempt < opts.maxRetries
        ) {
          lastError = new Error(errorMessage);
          handlers.onRetry?.(attempt + 1, opts.maxRetries);
          const delay = calculateRetryDelay(attempt, retryOptions);
          await sleep(delay);
          continue;
        }

        handlers.onError(errorMessage);
        return;
      }

      await handleSSEStreamWithRetry(response, handlers, retryOptions);
      return;
    } catch (error) {
      clearTimeout(timeoutId);
      lastError = error instanceof Error ? error : new Error("Unknown error");

      if (isRetryableError(lastError) && attempt < opts.maxRetries) {
        handlers.onRetry?.(attempt + 1, opts.maxRetries);
        const delay = calculateRetryDelay(attempt, retryOptions);
        await sleep(delay);
        continue;
      }

      break;
    }
  }

  const message = lastError?.message || `${errorMessageDefault} after retries`;
  handlers.onError(message);
}

/**
 * Generate a blueprint document with retry logic
 */
export async function generateBlueprint(
  request: BlueprintRequest,
  handlers: StreamEventHandlers,
  retryOptions: RetryOptions = {},
): Promise<void> {
  return apiCallWithRetry(
    API_ENDPOINTS.GENERATE,
    request,
    handlers,
    retryOptions,
    API_ERROR_MESSAGES.GENERATION_FAILED,
  );
}

/**
 * Generate task breakdown from blueprint content
 *
 * Streams task generation via SSE with automatic retry on transient failures.
 *
 * @param request - Task generation request with blueprint content
 * @param handlers - Stream event handlers for chunk, error, and done events
 * @param retryOptions - Optional retry configuration
 */
export async function generateTasks(
  request: TaskGenerationRequest,
  handlers: StreamEventHandlers,
  retryOptions: RetryOptions = {},
): Promise<void> {
  return apiCallWithRetry(
    API_ENDPOINTS.TASKS,
    request,
    handlers,
    retryOptions,
    API_ERROR_MESSAGES.TASK_GENERATION_FAILED,
  );
}

/**
 * Refine blueprint content via AI
 *
 * Streams content refinement via SSE with automatic retry on transient failures.
 *
 * @param request - Refinement request with content and refinement instructions
 * @param handlers - Stream event handlers for chunk, error, and done events
 * @param retryOptions - Optional retry configuration
 */
export async function refineContent(
  request: RefineRequest,
  handlers: StreamEventHandlers,
  retryOptions: RetryOptions = {},
): Promise<void> {
  return apiCallWithRetry(
    API_ENDPOINTS.REFINE,
    request,
    handlers,
    retryOptions,
    API_ERROR_MESSAGES.REFINEMENT_FAILED,
  );
}

/**
 * Check API health status
 *
 * Performs a health check against the API endpoint with a timeout.
 *
 * @returns True if API is healthy, false otherwise
 */
export async function checkHealth(): Promise<boolean> {
  const controller = new AbortController();
  const timeoutId = setTimeout(
    () => controller.abort(),
    TIMEOUTS.API_HEALTH_CHECK,
  );

  try {
    const response = await fetch(`${API_BASE}${API_ENDPOINTS.HEALTH}`, {
      signal: controller.signal,
    });
    return response.ok;
  } catch {
    return false;
  } finally {
    clearTimeout(timeoutId);
  }
}
