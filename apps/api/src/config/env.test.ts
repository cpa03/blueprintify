import { describe, it, expect, beforeEach, afterEach } from "vitest";
import {
  loadConfig,
  DEFAULTS,
  getConfig,
  initializeConfig,
  resetConfig,
} from "./env";
import { setEnvConfig } from "./constants";

describe("Environment Configuration", () => {
  beforeEach(() => {
    resetConfig();
  });

  afterEach(() => {
    resetConfig();
  });

  describe("loadConfig", () => {
    it("should throw error when OPENAI_API_KEY is missing", () => {
      expect(() => loadConfig({})).toThrow("OPENAI_API_KEY is required");
    });

    it("should load config with required API key", () => {
      const config = loadConfig({ OPENAI_API_KEY: "test-key" });
      expect(config.OPENAI_API_KEY).toBe("test-key");
    });

    it("should use default values when env vars not set", () => {
      const config = loadConfig({ OPENAI_API_KEY: "test-key" });
      expect(config.OPENAI_MODEL).toBe(DEFAULTS.OPENAI_MODEL);
      expect(config.API_VERSION).toBe(DEFAULTS.API_VERSION);
      expect(config.CORS_ORIGIN).toBe(DEFAULTS.CORS_ORIGIN);
    });

    it("should override defaults with env vars", () => {
      const config = loadConfig({
        OPENAI_API_KEY: "test-key",
        OPENAI_MODEL: "gpt-4",
        API_VERSION: "2.0.0",
      });
      expect(config.OPENAI_MODEL).toBe("gpt-4");
      expect(config.API_VERSION).toBe("2.0.0");
    });

    it("should parse numeric env vars correctly", () => {
      const config = loadConfig({
        OPENAI_API_KEY: "test-key",
        OPENAI_TIMEOUT_MS: "30000",
        OPENAI_MAX_TOKENS: "2000",
      });
      expect(config.OPENAI_TIMEOUT_MS).toBe(30000);
      expect(config.OPENAI_MAX_TOKENS).toBe(2000);
    });

    it("should use default for invalid numeric env vars", () => {
      const config = loadConfig({
        OPENAI_API_KEY: "test-key",
        OPENAI_TIMEOUT_MS: "invalid",
      });
      expect(config.OPENAI_TIMEOUT_MS).toBe(DEFAULTS.OPENAI_TIMEOUT_MS);
    });

    it("should parse float env vars correctly", () => {
      const config = loadConfig({
        OPENAI_API_KEY: "test-key",
        OPENAI_TEMPERATURE: "0.5",
      });
      expect(config.OPENAI_TEMPERATURE).toBe(0.5);
    });

    it("should use default for invalid float env vars", () => {
      const config = loadConfig({
        OPENAI_API_KEY: "test-key",
        OPENAI_TEMPERATURE: "invalid",
      });
      expect(config.OPENAI_TEMPERATURE).toBe(DEFAULTS.OPENAI_TEMPERATURE);
    });

    it("should load all rate limit config values", () => {
      const config = loadConfig({
        OPENAI_API_KEY: "test-key",
        RATE_LIMIT_WINDOW_MS: "120000",
        RATE_LIMIT_STRICT_MAX: "5",
        RATE_LIMIT_STANDARD_MAX: "30",
        RATE_LIMIT_LENIENT_MAX: "60",
      });
      expect(config.RATE_LIMIT_WINDOW_MS).toBe(120000);
      expect(config.RATE_LIMIT_STRICT_MAX).toBe(5);
      expect(config.RATE_LIMIT_STANDARD_MAX).toBe(30);
      expect(config.RATE_LIMIT_LENIENT_MAX).toBe(60);
    });

    it("should load all circuit breaker config values", () => {
      const config = loadConfig({
        OPENAI_API_KEY: "test-key",
        CIRCUIT_BREAKER_FAILURE_THRESHOLD: "10",
        CIRCUIT_BREAKER_RESET_TIMEOUT_MS: "120000",
        CIRCUIT_BREAKER_HALF_OPEN_MAX_CALLS: "5",
      });
      expect(config.CIRCUIT_BREAKER_FAILURE_THRESHOLD).toBe(10);
      expect(config.CIRCUIT_BREAKER_RESET_TIMEOUT_MS).toBe(120000);
      expect(config.CIRCUIT_BREAKER_HALF_OPEN_MAX_CALLS).toBe(5);
    });

    it("should load all retry config values", () => {
      const config = loadConfig({
        OPENAI_API_KEY: "test-key",
        RETRY_MAX_RETRIES: "5",
        RETRY_INITIAL_DELAY_MS: "2000",
        RETRY_BACKOFF_FACTOR: "3",
        RETRY_MAX_DELAY_MS: "20000",
      });
      expect(config.RETRY_MAX_RETRIES).toBe(5);
      expect(config.RETRY_INITIAL_DELAY_MS).toBe(2000);
      expect(config.RETRY_BACKOFF_FACTOR).toBe(3);
      expect(config.RETRY_MAX_DELAY_MS).toBe(20000);
    });

    it("should load external URLs", () => {
      const config = loadConfig({
        OPENAI_API_KEY: "test-key",
        PROJECT_HOMEPAGE_URL: "https://custom.example.com",
        GITHUB_URL: "https://github.com/custom/repo",
      });
      expect(config.PROJECT_HOMEPAGE_URL).toBe("https://custom.example.com");
      expect(config.GITHUB_URL).toBe("https://github.com/custom/repo");
    });
  });

  describe("initializeConfig", () => {
    it("should initialize and set config", () => {
      initializeConfig({ OPENAI_API_KEY: "init-key" });
      const config = getConfig();
      expect(config.OPENAI_API_KEY).toBe("init-key");
    });
  });

  describe("getConfig", () => {
    it("should throw when config not set", () => {
      expect(() => getConfig()).toThrow();
    });

    it("should return config when set", () => {
      const config = loadConfig({ OPENAI_API_KEY: "test-key" });
      setEnvConfig(config);
      expect(getConfig().OPENAI_API_KEY).toBe("test-key");
    });
  });

  describe("resetConfig", () => {
    it("should clear the config", () => {
      initializeConfig({ OPENAI_API_KEY: "test-key" });
      expect(getConfig().OPENAI_API_KEY).toBe("test-key");
      resetConfig();
      expect(() => getConfig()).toThrow();
    });
  });

  describe("DEFAULTS", () => {
    it("should have all required default values", () => {
      expect(DEFAULTS.OPENAI_BASE_URL).toBe("https://api.openai.com/v1");
      expect(DEFAULTS.OPENAI_MODEL).toBe("gpt-4o-mini");
      expect(DEFAULTS.API_VERSION).toBe("1.0.0");
      expect(DEFAULTS.CORS_ORIGIN).toBe("*");
    });

    it("should have sensible rate limit defaults", () => {
      expect(DEFAULTS.RATE_LIMIT_WINDOW_MS).toBe(60000);
      expect(DEFAULTS.RATE_LIMIT_STRICT_MAX).toBeLessThan(
        DEFAULTS.RATE_LIMIT_STANDARD_MAX,
      );
      expect(DEFAULTS.RATE_LIMIT_STANDARD_MAX).toBeLessThan(
        DEFAULTS.RATE_LIMIT_LENIENT_MAX,
      );
    });

    it("should have sensible circuit breaker defaults", () => {
      expect(DEFAULTS.CIRCUIT_BREAKER_FAILURE_THRESHOLD).toBeGreaterThan(0);
      expect(DEFAULTS.CIRCUIT_BREAKER_RESET_TIMEOUT_MS).toBeGreaterThan(0);
      expect(DEFAULTS.CIRCUIT_BREAKER_HALF_OPEN_MAX_CALLS).toBeGreaterThan(0);
    });
  });
});
