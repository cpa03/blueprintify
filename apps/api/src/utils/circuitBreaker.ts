export enum CircuitState {
  CLOSED = "CLOSED",
  OPEN = "OPEN",
  HALF_OPEN = "HALF_OPEN",
}

export interface CircuitBreakerOptions {
  failureThreshold: number;
  resetTimeout: number;
  monitoringPeriod: number;
}

export interface CircuitBreakerStats {
  state: CircuitState;
  failureCount: number;
  successCount: number;
  lastFailureTime?: number;
  lastSuccessTime?: number;
}

export class CircuitBreaker {
  private state: CircuitState = CircuitState.CLOSED;
  private failureCount: number = 0;
  private successCount: number = 0;
  private lastFailureTime?: number;
  private lastSuccessTime?: number;
  private nextAttempt: number = 0;

  constructor(private options: CircuitBreakerOptions) {}

  getStats(): CircuitBreakerStats {
    return {
      state: this.state,
      failureCount: this.failureCount,
      successCount: this.successCount,
      lastFailureTime: this.lastFailureTime,
      lastSuccessTime: this.lastSuccessTime,
    };
  }

  async execute<T>(operation: () => Promise<T>): Promise<T> {
    const now = Date.now();

    if (this.state === CircuitState.OPEN) {
      if (now < this.nextAttempt) {
        throw new Error("Circuit breaker is OPEN");
      }
      this.state = CircuitState.HALF_OPEN;
    }

    try {
      const result = await operation();
      this.onSuccess(now);
      return result;
    } catch (error) {
      this.onFailure(now);
      throw error;
    }
  }

  private onSuccess(now: number): void {
    this.successCount++;
    this.lastSuccessTime = now;

    if (this.state === CircuitState.HALF_OPEN) {
      this.state = CircuitState.CLOSED;
      this.failureCount = 0;
    }
  }

  private onFailure(now: number): void {
    this.failureCount++;
    this.lastFailureTime = now;

    if (this.failureCount >= this.options.failureThreshold) {
      this.state = CircuitState.OPEN;
      this.nextAttempt = now + this.options.resetTimeout;
    }
  }

  reset(): void {
    this.state = CircuitState.CLOSED;
    this.failureCount = 0;
    this.successCount = 0;
    this.lastFailureTime = undefined;
    this.lastSuccessTime = undefined;
    this.nextAttempt = 0;
  }
}

export const defaultCircuitBreaker = new CircuitBreaker({
  failureThreshold: 5,
  resetTimeout: 60000, // 1 minute
  monitoringPeriod: 300000, // 5 minutes
});
