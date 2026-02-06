interface CircuitBreakerConfig {
  failureThreshold: number;
  resetTimeout: number;
  monitoringPeriod: number;
}

interface CircuitBreakerState {
  state: "CLOSED" | "OPEN" | "HALF_OPEN";
  failureCount: number;
  lastFailureTime: number;
  successCount: number;
}

export class CircuitBreaker {
  private config: CircuitBreakerConfig;
  private state: CircuitBreakerState;
  private name: string;

  constructor(name: string, config: Partial<CircuitBreakerConfig> = {}) {
    this.name = name;
    this.config = {
      failureThreshold: 5,
      resetTimeout: 60000,
      monitoringPeriod: 10000,
      ...config,
    };

    this.state = {
      state: "CLOSED",
      failureCount: 0,
      lastFailureTime: 0,
      successCount: 0,
    };
  }

  async execute<T>(operation: () => Promise<T>): Promise<T> {
    if (this.state.state === "OPEN") {
      if (Date.now() - this.state.lastFailureTime >= this.config.resetTimeout) {
        this.state.state = "HALF_OPEN";
        this.state.successCount = 0;
        console.log(
          `[Circuit Breaker] ${this.name} transitioning to HALF_OPEN`,
        );
      } else {
        throw new Error(`Circuit breaker ${this.name} is OPEN`);
      }
    }

    try {
      const result = await operation();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  private onSuccess(): void {
    if (this.state.state === "HALF_OPEN") {
      this.state.successCount++;
      if (this.state.successCount >= 3) {
        this.state.state = "CLOSED";
        this.state.failureCount = 0;
        console.log(`[Circuit Breaker] ${this.name} transitioning to CLOSED`);
      }
    } else {
      this.state.failureCount = 0;
    }
  }

  private onFailure(): void {
    this.state.failureCount++;
    this.state.lastFailureTime = Date.now();

    if (this.state.failureCount >= this.config.failureThreshold) {
      this.state.state = "OPEN";
      console.log(
        `[Circuit Breaker] ${this.name} transitioning to OPEN after ${this.state.failureCount} failures`,
      );
    }
  }

  getState(): string {
    return `${this.state.state} (failures: ${this.state.failureCount}, lastFailure: ${new Date(this.state.lastFailureTime).toISOString()})`;
  }

  reset(): void {
    this.state = {
      state: "CLOSED",
      failureCount: 0,
      lastFailureTime: 0,
      successCount: 0,
    };
    console.log(`[Circuit Breaker] ${this.name} manually reset to CLOSED`);
  }
}

const circuitBreakers = new Map<string, CircuitBreaker>();

export const getCircuitBreaker = (
  name: string,
  config?: Partial<CircuitBreakerConfig>,
): CircuitBreaker => {
  if (!circuitBreakers.has(name)) {
    circuitBreakers.set(name, new CircuitBreaker(name, config));
  }
  return circuitBreakers.get(name)!;
};

export const withCircuitBreaker = <T>(
  operation: () => Promise<T>,
  name: string,
  config?: Partial<CircuitBreakerConfig>,
): Promise<T> => {
  const circuitBreaker = getCircuitBreaker(name, config);
  return circuitBreaker.execute(operation);
};
