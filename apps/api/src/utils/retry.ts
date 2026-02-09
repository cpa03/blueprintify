import {
  RETRY_CONFIG,
  RETRYABLE_ERROR_CODES,
  RETRY_LOGIC,
} from "../config/constants";

export interface RetryOptions {
  retries?: number;
  initialDelay?: number;
  backoffFactor?: number;
  onRetry?: (error: unknown, attempt: number) => void;
}

export async function withRetry<T>(
  operation: () => Promise<T>,
  options: RetryOptions = {},
): Promise<T> {
  const {
    retries = RETRY_CONFIG.DEFAULT_RETRIES,
    initialDelay = RETRY_CONFIG.DEFAULT_INITIAL_DELAY,
    backoffFactor = RETRY_CONFIG.DEFAULT_BACKOFF_FACTOR,
    onRetry,
  } = options;

  let lastError: unknown;
  let delay = initialDelay;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;

      if (attempt === retries) {
        break;
      }

      const shouldRetry = isRetryableError(error);

      if (!shouldRetry) {
        throw error;
      }

      if (onRetry) {
        onRetry(error, attempt + 1);
      }

      await new Promise((resolve) => setTimeout(resolve, delay));
      delay *= backoffFactor;
    }
  }

  throw lastError;
}

function isRetryableError(error: unknown): boolean {
  if (!error) return true;

  const status =
    (error as { status?: number; response?: { status?: number } }).status ||
    (error as { response?: { status?: number } }).response?.status;

  if (status) {
    return (
      status === RETRY_LOGIC.RATE_LIMIT_STATUS ||
      status >= RETRY_LOGIC.SERVER_ERROR_THRESHOLD
    );
  }

  const errorCode = (error as { code?: string }).code;
  return RETRYABLE_ERROR_CODES.includes(
    (errorCode as (typeof RETRYABLE_ERROR_CODES)[number]) ||
      ("" as (typeof RETRYABLE_ERROR_CODES)[number]),
  );
}
