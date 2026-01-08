export interface RetryOptions {
  retries?: number;
  initialDelay?: number;
  backoffFactor?: number;
  onRetry?: (error: unknown, attempt: number) => void;
}

/**
 * Retries an async operation with exponential backoff.
 * @param operation The async function to retry
 * @param options Configuration for retries
 */
export async function withRetry<T>(
  operation: () => Promise<T>,
  options: RetryOptions = {},
): Promise<T> {
  const {
    retries = 3,
    initialDelay = 1000,
    backoffFactor = 2,
    onRetry,
  } = options;

  let lastError: unknown;
  let delay = initialDelay;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;

      // If we've exhausted all retries, throw the last error
      if (attempt === retries) {
        break;
      }

      // Check for specific error conditions appropriate for retry
      // e.g., don't retry 400 Bad Request, but do retry 429 or 5xx
      // For now, we retry generic network errors or 5xx/429 if the error object suggests it
      const shouldRetry = isRetryableError(error);

      if (!shouldRetry) {
        throw error;
      }

      if (onRetry) {
        onRetry(error, attempt + 1);
      }

      // Wait before next attempt
      await new Promise((resolve) => setTimeout(resolve, delay));
      delay *= backoffFactor;
    }
  }

  throw lastError;
}

function isRetryableError(error: unknown): boolean {
  // If no detailed error info, assume it's transient and retry
  if (!error) return true;

  // OpenAI specific error structure often has 'status' or 'response.status'
  const err = error as { status?: number; response?: { status?: number } };
  const status = err.status || err.response?.status;

  if (status) {
    // 429: Too Many Requests
    // 5xx: Server Errors
    return status === 429 || status >= 500;
  }

  // Network errors often don't have a status but might have a code
  // Retry connection errors
  return true;
}
