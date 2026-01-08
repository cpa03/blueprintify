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
export declare function withRetry<T>(operation: () => Promise<T>, options?: RetryOptions): Promise<T>;
