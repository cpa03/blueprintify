import { HTTP_STATUS, CIRCUIT_BREAKER_CONFIG } from "../config/constants";

interface CircuitBreakerConfig {
  failureThreshold: number;
  resetTimeoutMs: number;
  halfOpenMaxCalls: number;
}

enum CircuitState {
  CLOSED = "CLOSED",
  OPEN = "OPEN",
  HALF_OPEN = "HALF_OPEN",
}

interface CircuitBreakerMetrics {
  state: CircuitState;
  failures: number;
  successes: number;
  lastFailureTime: number | null;
  nextAttempt: number;
}

class CircuitBreaker {
  private state: CircuitState = CircuitState.CLOSED;
  private failures = 0;
  private successes = 0;
  private lastFailureTime: number | null = null;
  private halfOpenCalls = 0;
  private readonly config: CircuitBreakerConfig;

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

export class CircuitBreakerOpenError extends Error {
  readonly statusCode = HTTP_STATUS.SERVICE_UNAVAILABLE;

  constructor(message: string) {
    super(message);
    this.name = "CircuitBreakerOpenError";
  }
}

export const createCircuitBreaker = (
  config?: Partial<CircuitBreakerConfig>,
): CircuitBreaker => {
  return new CircuitBreaker(config);
};

export type { CircuitBreaker, CircuitBreakerMetrics };
export { CircuitState };
