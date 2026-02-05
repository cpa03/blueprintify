import type {
  BlueprintRequest,
  TaskGenerationRequest,
  RefineRequest,
  StreamChunk,
} from "@blueprint/shared";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "/api";

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
  maxRetries: 3,
  initialDelay: 1000,
  backoffFactor: 2,
  maxDelay: 10000,
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

  // HTTP 429 (Too Many Requests), 5xx (Server Errors) are retryable
  // 408 (Request Timeout) is retryable
  const retryableStatuses = [408, 429, 500, 502, 503, 504];
  return retryableStatuses.includes(response.status);
}

/**
 * Parses SSE stream and calls appropriate handlers
 */
async function handleSSEStream(
  response: Response,
  handlers: StreamEventHandlers,
): Promise<void> {
  const reader = response.body?.getReader();
  if (!reader) {
    handlers.onError("No response body");
    return;
  }

  const decoder = new TextDecoder();
  let buffer = "";

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n\n");
      buffer = lines.pop() || "";

      for (const eventBlock of lines) {
        if (!eventBlock.trim()) continue;

        const dataMatch = eventBlock.match(/data: (.+)/);
        if (dataMatch && dataMatch[1]) {
          try {
            const parsed: StreamChunk = JSON.parse(dataMatch[1]);

            if (parsed.type === "content" && parsed.content) {
              handlers.onChunk(parsed.content);
            } else if (parsed.type === "error" && parsed.error) {
              handlers.onError(parsed.error);
            } else if (parsed.type === "done") {
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
    const message = error instanceof Error ? error.message : "Stream error";
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
  retryOptions: RetryOptions = {},
): Promise<void> {
  const reader = response.body?.getReader();
  if (!reader) {
    handlers.onError("No response body");
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
        const lines = buffer.split("\n\n");
        buffer = lines.pop() || "";

        for (const eventBlock of lines) {
          if (!eventBlock.trim()) continue;

          const dataMatch = eventBlock.match(/data: (.+)/);
          if (dataMatch && dataMatch[1]) {
            try {
              const parsed: StreamChunk = JSON.parse(dataMatch[1]);

              if (parsed.type === "content" && parsed.content) {
                handlers.onChunk(parsed.content);
                chunksReceived++;
              } else if (parsed.type === "error" && parsed.error) {
                // Server-side errors are not retryable
                handlers.onError(parsed.error);
                return;
              } else if (parsed.type === "done") {
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
            : new Error("Stream read error");

        // If we've received content before the error, we don't retry
        // to avoid duplicate data
        if (chunksReceived > 0) {
          throw lastError;
        }

        // If no content received, this is a connection error - retryable
        throw lastError;
      }
    }
    handlers.onDone();
  } catch (error) {
    const message = error instanceof Error ? error.message : "Stream error";
    handlers.onError(message);
  } finally {
    reader.releaseLock();
  }
}

/**
 * Generate a blueprint document with retry logic
 */
export async function generateBlueprint(
  request: BlueprintRequest,
  handlers: StreamEventHandlers,
  retryOptions: RetryOptions = {},
): Promise<void> {
  const opts = { ...DEFAULT_RETRY_OPTIONS, ...retryOptions };
  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= opts.maxRetries; attempt++) {
    try {
      const response = await fetch(`${API_BASE}/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        const errorData = await response
          .json()
          .catch(() => ({ error: "Generation failed" }));
        const errorMessage = errorData.error || "Generation failed";

        // Check if error is retryable
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

      // Handle stream with retry
      await handleSSEStreamWithRetry(response, handlers, retryOptions);
      return;
    } catch (error) {
      lastError = error instanceof Error ? error : new Error("Unknown error");

      // Check if error is retryable
      if (isRetryableError(lastError) && attempt < opts.maxRetries) {
        handlers.onRetry?.(attempt + 1, opts.maxRetries);
        const delay = calculateRetryDelay(attempt, retryOptions);
        await sleep(delay);
        continue;
      }

      break;
    }
  }

  // All retries exhausted
  const message = lastError?.message || "Generation failed after retries";
  handlers.onError(message);
}

/**
 * Generate tasks from a blueprint with retry logic
 */
export async function generateTasks(
  request: TaskGenerationRequest,
  handlers: StreamEventHandlers,
  retryOptions: RetryOptions = {},
): Promise<void> {
  const opts = { ...DEFAULT_RETRY_OPTIONS, ...retryOptions };
  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= opts.maxRetries; attempt++) {
    try {
      const response = await fetch(`${API_BASE}/tasks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        const errorData = await response
          .json()
          .catch(() => ({ error: "Task generation failed" }));
        const errorMessage = errorData.error || "Task generation failed";

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

  const message = lastError?.message || "Task generation failed after retries";
  handlers.onError(message);
}

/**
 * Refine a section of content with retry logic
 */
export async function refineContent(
  request: RefineRequest,
  handlers: StreamEventHandlers,
  retryOptions: RetryOptions = {},
): Promise<void> {
  const opts = { ...DEFAULT_RETRY_OPTIONS, ...retryOptions };
  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= opts.maxRetries; attempt++) {
    try {
      const response = await fetch(`${API_BASE}/refine`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        const errorData = await response
          .json()
          .catch(() => ({ error: "Refinement failed" }));
        const errorMessage = errorData.error || "Refinement failed";

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

  const message = lastError?.message || "Refinement failed after retries";
  handlers.onError(message);
}

/**
 * Check API health
 */
export async function checkHealth(): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE}/`);
    return response.ok;
  } catch {
    return false;
  }
}
