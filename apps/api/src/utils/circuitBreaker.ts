/**
 * Circuit Breaker Utility Module
 *
 * Implements the Circuit Breaker pattern for resilient API interactions.
 * Prevents cascading failures by temporarily blocking requests to failing services.
 *
 * @module utils/circuitBreaker
 * @see https://martinfowler.com/bliki/CircuitBreaker.html
 */

import { HTTP_STATUS, CIRCUIT_BREAKER_CONFIG } from "../config/constants";

/**
 * Configuration options for circuit breaker initialization.
 *
 * @property failureThreshold - Number of consecutive failures before opening the circuit
 * @property resetTimeoutMs - Time in milliseconds before attempting to close the circuit
 * @property halfOpenMaxCalls - Maximum number of test calls allowed in half-open state
 */
interface CircuitBreakerConfig {
  failureThreshold: number;
  resetTimeoutMs: number;
  halfOpenMaxCalls: number;
}

/**
 * Possible states of a circuit breaker.
 *
 * - CLOSED: Normal operation, requests pass through
 * - OPEN: Circuit is tripped, requests are blocked
 * - HALF_OPEN: Testing if service has recovered
 */
enum CircuitState {
  CLOSED = "CLOSED",
  OPEN = "OPEN",
  HALF_OPEN = "HALF_OPEN",
}

/**
 * Metrics snapshot of circuit breaker state.
 *
 * @property state - Current circuit state (CLOSED, OPEN, HALF_OPEN)
 * @property failures - Current consecutive failure count
 * @property successes - Current consecutive success count (in half-open state)
 * @property lastFailureTime - Timestamp of last failure, or null if none
 * @property nextAttempt - Timestamp when next attempt will be allowed (in OPEN state)
 */
interface CircuitBreakerMetrics {
  state: CircuitState;
  failures: number;
  successes: number;
  lastFailureTime: number | null;
  nextAttempt: number;
}

/**
 * Circuit Breaker implementation for protecting against cascading failures.
 *
 * The circuit breaker monitors for failures and "trips" (opens) when the failure
 * threshold is exceeded, preventing further requests to the failing service.
 * After a reset timeout, it enters a "half-open" state to test if the service
 * has recovered.
 *
 * @example
 * ```typescript
 * const breaker = createCircuitBreaker({
 *   failureThreshold: 5,
 *   resetTimeoutMs: 30000,
 *   halfOpenMaxCalls: 3
 * });
 *
 * try {
 *   const result = await breaker.execute(() => fetchExternalAPI());
 * } catch (error) {
 *   if (error instanceof CircuitBreakerOpenError) {
 *     // Service is temporarily unavailable
 *   }
 * }
 * ```
 */
class CircuitBreaker {
  /** Current state of the circuit (CLOSED, OPEN, HALF_OPEN) */
  private state: CircuitState = CircuitState.CLOSED;
  /** Counter for consecutive failures in CLOSED state */
  private failures = 0;
  /** Counter for consecutive successes in HALF_OPEN state */
  private successes = 0;
  /** Timestamp of the last recorded failure, used for reset timeout calculation */
  private lastFailureTime: number | null = null;
  /** Number of test calls made in the current HALF_OPEN state */
  private halfOpenCalls = 0;
  /** Configuration settings for the circuit breaker */
  private readonly config: CircuitBreakerConfig;

  /**
   * Creates a new CircuitBreaker instance.
   *
   * @param config - Optional configuration overrides for default settings
   */
  constructor(config: Partial<CircuitBreakerConfig> = {}) {
    this.config = {
      failureThreshold:
        config.failureThreshold ??
        CIRCUIT_BREAKER_CONFIG.DEFAULT_FAILURE_THRESHOLD,
      resetTimeoutMs:
        config.resetTimeoutMs ??
        CIRCUIT_BREAKER_CONFIG.DEFAULT_RESET_TIMEOUT_MS,
      halfOpenMaxCalls:
        config.halfOpenMaxCalls ??
        CIRCUIT_BREAKER_CONFIG.DEFAULT_HALF_OPEN_MAX_CALLS,
    };
  }

  /**
   * Returns the current state and metrics of the circuit breaker.
   *
   * @returns A snapshot of the circuit breaker's current state
   */
  getState(): CircuitBreakerMetrics {
    return {
      state: this.state,
      failures: this.failures,
      successes: this.successes,
      lastFailureTime: this.lastFailureTime,
      nextAttempt:
        this.state === CircuitState.OPEN
          ? (this.lastFailureTime || 0) + this.config.resetTimeoutMs
          : Date.now(),
    };
  }

  /**
   * Executes a function with circuit breaker protection.
   *
   * If the circuit is OPEN, throws immediately without executing the function.
   * If the circuit is HALF_OPEN, allows limited test calls.
   * Tracks success/failure and updates circuit state accordingly.
   *
   * @param fn - The async function to execute
   * @returns The result of the executed function
   * @throws {CircuitBreakerOpenError} When the circuit is OPEN or HALF_OPEN max calls exceeded
   * @throws {Error} Re-throws any error from the executed function
   */
  async execute<T>(fn: () => Promise<T>): Promise<T> {
    if (this.state === CircuitState.OPEN) {
      if (
        Date.now() - (this.lastFailureTime || 0) >
        this.config.resetTimeoutMs
      ) {
        this.state = CircuitState.HALF_OPEN;
        this.halfOpenCalls = 0;
      } else {
        throw new CircuitBreakerOpenError("Circuit breaker is OPEN");
      }
    }

    if (this.state === CircuitState.HALF_OPEN) {
      if (this.halfOpenCalls >= this.config.halfOpenMaxCalls) {
        throw new CircuitBreakerOpenError(
          "Circuit breaker is HALF_OPEN - max calls reached",
        );
      }
      this.halfOpenCalls++;
    }

    try {
      const result = await fn();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  private onSuccess(): void {
    this.failures = 0;

    if (this.state === CircuitState.HALF_OPEN) {
      this.successes++;
      if (this.successes >= this.config.halfOpenMaxCalls) {
        this.state = CircuitState.CLOSED;
        this.successes = 0;
        this.halfOpenCalls = 0;
      }
    }
  }

  private onFailure(): void {
    this.failures++;
    this.lastFailureTime = Date.now();
    this.successes = 0;

    if (
      this.state === CircuitState.HALF_OPEN ||
      this.failures >= this.config.failureThreshold
    ) {
      this.state = CircuitState.OPEN;
      this.halfOpenCalls = 0;
    }
  }
}

/**
 * Error thrown when the circuit breaker is open and rejects a request.
 *
 * This error indicates that the protected service is temporarily unavailable
 * due to repeated failures. Clients should handle this gracefully, typically
 * by showing a user-friendly message or falling back to cached data.
 *
 * @extends Error
 */
export class CircuitBreakerOpenError extends Error {
  readonly statusCode = HTTP_STATUS.SERVICE_UNAVAILABLE;

  constructor(message: string) {
    super(message);
    this.name = "CircuitBreakerOpenError";
  }
}

/**
 * Factory function to create a new CircuitBreaker instance.
 *
 * @param config - Optional configuration overrides for default settings
 * @returns A new CircuitBreaker instance
 *
 * @example
 * ```typescript
 * const breaker = createCircuitBreaker({
 *   failureThreshold: 5,
 *   resetTimeoutMs: 30000,
 * });
 * ```
 */
export const createCircuitBreaker = (
  config?: Partial<CircuitBreakerConfig>,
): CircuitBreaker => {
  return new CircuitBreaker(config);
};

export type { CircuitBreaker, CircuitBreakerMetrics };
export { CircuitState };
