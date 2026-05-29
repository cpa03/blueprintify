import { describe, it, expect } from "vitest";
import {
  RETRY_CONFIG,
  VALIDATION_LIMITS,
  STORAGE_CONFIG,
  DEBOUNCE_CONFIG,
  SECURITY_LIMITS,
  EXPORT_LIMITS,
  RETRYABLE_STATUS_CODES,
  SSE_CONFIG,
  SSE_HEADERS,
  HTTP_HEADERS,
  ID_GENERATION_CONFIG,
  TIME_UNITS,
} from "./config";

describe("RETRY_CONFIG", () => {
  it("should have positive default retries", () => {
    expect(RETRY_CONFIG.DEFAULT_RETRIES).toBeGreaterThan(0);
  });

  it("should have positive initial delay", () => {
    expect(RETRY_CONFIG.DEFAULT_INITIAL_DELAY).toBeGreaterThan(0);
  });

  it("should have backoff factor greater than 1", () => {
    expect(RETRY_CONFIG.DEFAULT_BACKOFF_FACTOR).toBeGreaterThan(1);
  });

  it("should have max delay greater than initial delay", () => {
    expect(RETRY_CONFIG.DEFAULT_MAX_DELAY).toBeGreaterThan(RETRY_CONFIG.DEFAULT_INITIAL_DELAY);
  });

  it("should have reasonable retry values", () => {
    expect(RETRY_CONFIG.DEFAULT_RETRIES).toBeLessThanOrEqual(10);
    expect(RETRY_CONFIG.DEFAULT_INITIAL_DELAY).toBeLessThanOrEqual(10000);
    expect(RETRY_CONFIG.DEFAULT_MAX_DELAY).toBeLessThanOrEqual(60000);
  });
});

describe("VALIDATION_LIMITS", () => {
  it("should have valid project name limits", () => {
    expect(VALIDATION_LIMITS.PROJECT_NAME.MIN).toBeGreaterThan(0);
    expect(VALIDATION_LIMITS.PROJECT_NAME.MAX).toBeGreaterThan(VALIDATION_LIMITS.PROJECT_NAME.MIN);
  });

  it("should have valid description limits", () => {
    expect(VALIDATION_LIMITS.DESCRIPTION.MIN).toBeGreaterThan(0);
    expect(VALIDATION_LIMITS.DESCRIPTION.MAX).toBeGreaterThan(VALIDATION_LIMITS.DESCRIPTION.MIN);
  });

  it("should have valid target audience limit", () => {
    expect(VALIDATION_LIMITS.TARGET_AUDIENCE.MAX).toBeGreaterThan(0);
  });

  it("should have valid constraints limit", () => {
    expect(VALIDATION_LIMITS.CONSTRAINTS.MAX).toBeGreaterThan(0);
  });

  it("should have valid feature limits", () => {
    expect(VALIDATION_LIMITS.FEATURE.MAX).toBeGreaterThan(0);
    expect(VALIDATION_LIMITS.FEATURE.MAX_COUNT).toBeGreaterThan(0);
    // MAX is max length of a single feature string, MAX_COUNT is max number of features
    // These are different constraints so no relationship between them
  });

  it("should have valid tech stack limits", () => {
    expect(VALIDATION_LIMITS.TECH_STACK.MIN).toBeGreaterThan(0);
    expect(VALIDATION_LIMITS.TECH_STACK.MAX).toBeGreaterThan(VALIDATION_LIMITS.TECH_STACK.MIN);
  });
});

describe("STORAGE_CONFIG", () => {
  it("should have a positive quota in bytes", () => {
    expect(STORAGE_CONFIG.QUOTA_BYTES).toBeGreaterThan(0);
  });

  it("should have a valid warning threshold between 0 and 100", () => {
    expect(STORAGE_CONFIG.WARNING_THRESHOLD_PERCENT).toBeGreaterThan(0);
    expect(STORAGE_CONFIG.WARNING_THRESHOLD_PERCENT).toBeLessThanOrEqual(100);
  });

  it("should have reasonable quota size (1MB to 100MB)", () => {
    const minQuota = 1 * 1024 * 1024;
    const maxQuota = 100 * 1024 * 1024;
    expect(STORAGE_CONFIG.QUOTA_BYTES).toBeGreaterThanOrEqual(minQuota);
    expect(STORAGE_CONFIG.QUOTA_BYTES).toBeLessThanOrEqual(maxQuota);
  });
});

describe("DEBOUNCE_CONFIG", () => {
  it("should have positive wizard save delay", () => {
    expect(DEBOUNCE_CONFIG.WIZARD_SAVE).toBeGreaterThan(0);
  });

  it("should have positive editor save delay", () => {
    expect(DEBOUNCE_CONFIG.EDITOR_SAVE).toBeGreaterThan(0);
  });

  it("should have reasonable delays (under 5 seconds)", () => {
    expect(DEBOUNCE_CONFIG.WIZARD_SAVE).toBeLessThan(5000);
    expect(DEBOUNCE_CONFIG.EDITOR_SAVE).toBeLessThan(5000);
  });
});

describe("SECURITY_LIMITS", () => {
  it("should have positive max content length", () => {
    expect(SECURITY_LIMITS.MAX_CONTENT_LENGTH).toBeGreaterThan(0);
  });

  it("should have positive max file size", () => {
    expect(SECURITY_LIMITS.MAX_FILE_SIZE_BYTES).toBeGreaterThan(0);
  });

  it("should have positive max JSON depth", () => {
    expect(SECURITY_LIMITS.MAX_JSON_DEPTH).toBeGreaterThan(0);
  });

  it("should have allowed file types", () => {
    expect(SECURITY_LIMITS.ALLOWED_FILE_TYPES.length).toBeGreaterThan(0);
  });

  it("should have valid file type extensions", () => {
    SECURITY_LIMITS.ALLOWED_FILE_TYPES.forEach((type) => {
      expect(type).toMatch(/^\.\w+$/);
    });
  });

  it("should have reasonable limits", () => {
    expect(SECURITY_LIMITS.MAX_CONTENT_LENGTH).toBeLessThanOrEqual(10 * 1024 * 1024);
    expect(SECURITY_LIMITS.MAX_FILE_SIZE_BYTES).toBeLessThanOrEqual(100 * 1024 * 1024);
    expect(SECURITY_LIMITS.MAX_JSON_DEPTH).toBeLessThanOrEqual(100);
  });
});

describe("RETRYABLE_STATUS_CODES", () => {
  it("should contain common retryable HTTP status codes", () => {
    expect(RETRYABLE_STATUS_CODES).toContain(429); // Too Many Requests
    expect(RETRYABLE_STATUS_CODES).toContain(500); // Internal Server Error
    expect(RETRYABLE_STATUS_CODES).toContain(502); // Bad Gateway
    expect(RETRYABLE_STATUS_CODES).toContain(503); // Service Unavailable
    expect(RETRYABLE_STATUS_CODES).toContain(504); // Gateway Timeout
  });

  it("should have unique status codes", () => {
    const uniqueCodes = new Set(RETRYABLE_STATUS_CODES);
    expect(uniqueCodes.size).toBe(RETRYABLE_STATUS_CODES.length);
  });
});

describe("SSE_CONFIG", () => {
  it("should have valid data prefix", () => {
    expect(SSE_CONFIG.DATA_PREFIX).toBeTruthy();
    expect(typeof SSE_CONFIG.DATA_PREFIX).toBe("string");
  });

  it("should have valid event separator", () => {
    expect(SSE_CONFIG.EVENT_SEPARATOR).toBeTruthy();
    expect(typeof SSE_CONFIG.EVENT_SEPARATOR).toBe("string");
  });

  it("should have valid event types", () => {
    expect(SSE_CONFIG.EVENT_TYPES.CONTENT).toBeTruthy();
    expect(SSE_CONFIG.EVENT_TYPES.ERROR).toBeTruthy();
    expect(SSE_CONFIG.EVENT_TYPES.DONE).toBeTruthy();
  });

  it("should have different event types", () => {
    const eventTypes = Object.values(SSE_CONFIG.EVENT_TYPES);
    const uniqueTypes = new Set(eventTypes);
    expect(uniqueTypes.size).toBe(eventTypes.length);
  });
});

describe("SSE_HEADERS", () => {
  it("should have content type header", () => {
    expect(SSE_HEADERS.CONTENT_TYPE).toBeTruthy();
  });

  it("should have cache control header", () => {
    expect(SSE_HEADERS.CACHE_CONTROL).toBeTruthy();
  });

  it("should have connection header", () => {
    expect(SSE_HEADERS.CONNECTION).toBeTruthy();
  });

  it("should have correct SSE content type", () => {
    expect(SSE_HEADERS.CONTENT_TYPE).toBe("text/event-stream");
  });
});

describe("HTTP_HEADERS", () => {
  it("should have JSON content type", () => {
    expect(HTTP_HEADERS.CONTENT_TYPE_JSON).toBeTruthy();
    expect(HTTP_HEADERS.CONTENT_TYPE_JSON).toBe("application/json");
  });
});

describe("ID_GENERATION_CONFIG", () => {
  it("should have valid random string start index", () => {
    expect(ID_GENERATION_CONFIG.RANDOM_STRING_START_INDEX).toBeGreaterThanOrEqual(0);
  });

  it("should have positive random string length", () => {
    expect(ID_GENERATION_CONFIG.RANDOM_STRING_LENGTH).toBeGreaterThan(0);
  });

  it("should have valid alphanumeric radix", () => {
    expect(ID_GENERATION_CONFIG.ALPHANUMERIC_RADIX).toBeGreaterThan(1);
  });

  it("should have reasonable values", () => {
    expect(ID_GENERATION_CONFIG.RANDOM_STRING_LENGTH).toBeLessThanOrEqual(20);
    expect(ID_GENERATION_CONFIG.ALPHANUMERIC_RADIX).toBeLessThanOrEqual(36);
  });
});

describe("TIME_UNITS", () => {
  it("should have correct milliseconds per second", () => {
    expect(TIME_UNITS.MS_PER_SECOND).toBe(1000);
  });

  it("should have correct seconds per minute", () => {
    expect(TIME_UNITS.SECONDS_PER_MINUTE).toBe(60);
  });

  it("should have correct seconds per hour", () => {
    expect(TIME_UNITS.SECONDS_PER_HOUR).toBe(3600);
  });

  it("should have correct seconds per day", () => {
    expect(TIME_UNITS.SECONDS_PER_DAY).toBe(86400);
  });

  it("should have consistent time calculations", () => {
    expect(TIME_UNITS.SECONDS_PER_HOUR).toBe(TIME_UNITS.SECONDS_PER_MINUTE * 60);
    expect(TIME_UNITS.SECONDS_PER_DAY).toBe(TIME_UNITS.SECONDS_PER_HOUR * 24);
  });
});

describe("EXPORT_LIMITS", () => {
  it("should have positive blueprint length limit", () => {
    expect(EXPORT_LIMITS.MAX_BLUEPRINT_LENGTH).toBeGreaterThan(0);
  });

  it("should have positive tasks length limit", () => {
    expect(EXPORT_LIMITS.MAX_TASKS_LENGTH).toBeGreaterThan(0);
  });

  it("should have positive import data length limit", () => {
    expect(EXPORT_LIMITS.MAX_IMPORT_DATA_LENGTH).toBeGreaterThan(0);
  });

  it("should have blueprint limit at least 10KB", () => {
    expect(EXPORT_LIMITS.MAX_BLUEPRINT_LENGTH).toBeGreaterThanOrEqual(10_000);
  });

  it("should have import data limit larger than blueprint limit", () => {
    expect(EXPORT_LIMITS.MAX_IMPORT_DATA_LENGTH).toBeGreaterThan(
      EXPORT_LIMITS.MAX_BLUEPRINT_LENGTH
    );
  });
});
