export const AI_CONFIG = {
  DEFAULT_MODEL: "gpt-4o-mini",
  DEFAULT_TEMPERATURE: 0.7,
  DEFAULT_MAX_TOKENS: 4000,
};

export const RETRY_CONFIG = {
  DEFAULT_RETRIES: 3,
  DEFAULT_INITIAL_DELAY: 1000,
  DEFAULT_BACKOFF_FACTOR: 2,
};

export const SECURITY_CONFIG = {
  MAX_REQUEST_SIZE: "10mb",
  ALLOWED_ORIGINS: [
    "http://localhost:3000",
    "http://localhost:5173",
    "https://blueprintify.pages.dev",
    "https://blueprintify.workers.dev",
  ],
  RATE_LIMITS: {
    LENIENT: { maxRequests: 1000, windowMs: 60000 },
    NORMAL: { maxRequests: 100, windowMs: 60000 },
    STRICT: { maxRequests: 10, windowMs: 60000 },
    AUTHENTICATED: { maxRequests: 1000, windowMs: 60000 },
  },
};
