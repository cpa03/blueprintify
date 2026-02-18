import {
  RETRY_CONFIG as SHARED_RETRY_CONFIG,
  RETRYABLE_STATUS_CODES,
  SSE_CONFIG as SHARED_SSE_CONFIG,
  HTTP_STATUS as SHARED_HTTP_STATUS,
} from "@blueprint/shared";
import type { EnvConfig } from "./env";

let envConfig: EnvConfig | null = null;

export function setEnvConfig(config: EnvConfig | null): void {
  envConfig = config;
}

export function getEnvConfig(): EnvConfig {
  if (!envConfig) {
    throw new Error("Environment config not set. Call setEnvConfig() first.");
  }
  return envConfig;
}

// ===== Inline Prompt Templates =====
// Templates are inlined for Cloudflare Workers compatibility
// (Filesystem operations are not supported in Workers runtime)

const ARCHITECT_SYSTEM_TEMPLATE = `You are Agent 00, a Principal Software Architect with 20+ years of experience designing scalable, maintainable systems. Your role is to create comprehensive architectural documentation that enables autonomous development agents to build the project from scratch.

## Your Expertise
- System design and architecture patterns
- Technology stack selection and trade-offs
- Project structure and organization
- Security and performance considerations
- Developer experience and maintainability

## Output Requirements
1. Generate ONLY valid Markdown
2. Use proper heading hierarchy (# ## ### ####)
3. Include code blocks with appropriate syntax highlighting
4. Create clear, actionable sections
5. Be specific and technical, not vague

## Documentation Structure
Your blueprint.md must include:
1. **Project Overview** - Name, description, and core purpose
2. **Architecture** - High-level system design with diagrams (Mermaid)
3. **Tech Stack** - Technologies with justification for each choice
4. **Project Structure** - Directory layout with file descriptions
5. **Core Components** - Key modules and their responsibilities
6. **Data Models** - Schema definitions if applicable
7. **API Design** - Endpoints and contracts if applicable
8. **Development Guidelines** - Coding standards and conventions
9. **Deployment** - Build and deployment instructions
`;

const TASK_SPLITTER_SYSTEM_TEMPLATE = `You are a Technical Project Manager specializing in breaking down architectural plans into actionable development tasks. You excel at:

- Identifying dependencies between tasks
- Prioritizing work for maximum velocity
- Creating clear, atomic work items
- Estimating complexity accurately

## Output Requirements
1. Generate ONLY valid Markdown
2. Use checkbox format: - [ ] Task description
3. Group tasks by priority (P0, P1, P2)
4. Include estimates in story points or time
5. Mark dependencies clearly

## Task Structure
Your task.md must include:
- **P0 (Critical Path)** - Must be done first, blocks everything
- **P1 (Core Features)** - Essential for MVP
- **P2 (Enhancements)** - Nice-to-have improvements
`;

const REFINER_SYSTEM_TEMPLATE = `You are an expert technical editor. Your job is to improve specific sections of documentation based on user feedback. You:

- Maintain consistency with surrounding content
- Add more detail where needed
- Fix technical inaccuracies
- Improve clarity and readability

Output ONLY the refined section, not the entire document.
`;

export const RETRY_CONFIG = SHARED_RETRY_CONFIG;

export const AI_CONFIG = {
  get DEFAULT_MODEL(): string {
    return getEnvConfig().OPENAI_MODEL;
  },
  get DEFAULT_TIMEOUT(): number {
    return getEnvConfig().OPENAI_TIMEOUT_MS;
  },
  get DEFAULT_MAX_TOKENS(): number {
    return getEnvConfig().OPENAI_MAX_TOKENS;
  },
  get DEFAULT_TEMPERATURE(): number {
    return getEnvConfig().OPENAI_TEMPERATURE;
  },
};

export const API_METADATA = {
  NAME: "Blueprint Generator API",
  get VERSION(): string {
    return getEnvConfig().API_VERSION;
  },
  STATUS: "healthy",
};

// API Endpoints configuration
export const API_ENDPOINTS = {
  GENERATE: {
    path: "/generate",
    method: "POST",
    description: "Generate blueprint",
  },
  TASKS: {
    path: "/tasks",
    method: "POST",
    description: "Generate tasks",
  },
  REFINE: {
    path: "/refine",
    method: "POST",
    description: "Refine content",
  },
  EXPORT: {
    path: "/export",
    method: "POST",
    description: "Export project",
  },
  IMPORT: {
    path: "/import",
    method: "POST",
    description: "Import project",
  },
  STORAGE_QUOTA: {
    path: "/storage/quota",
    method: "GET",
    description: "Get storage quota",
  },
  STORAGE_CLEAR: {
    path: "/storage/clear",
    method: "DELETE",
    description: "Clear storage",
  },
  SHARE_CREATE: {
    path: "/share",
    method: "POST",
    description: "Create shareable blueprint link",
  },
  SHARE_GET: {
    path: "/share/:id",
    method: "GET",
    description: "Get shared blueprint by ID",
  },
  SHARE_DELETE: {
    path: "/share/:id",
    method: "DELETE",
    description: "Delete shared blueprint",
  },
} as const;

export { RETRYABLE_STATUS_CODES };

export const RETRYABLE_ERROR_CODES = [
  "ECONNRESET",
  "ETIMEDOUT",
  "ENOTFOUND",
  "EAI_AGAIN",
  "ECONNREFUSED",
] as const;

// Error codes
export const ERROR_CODES = {
  VALIDATION_ERROR: "VALIDATION_ERROR",
  NOT_FOUND_ERROR: "NOT_FOUND_ERROR",
  CONFIGURATION_ERROR: "CONFIGURATION_ERROR",
  NETWORK_ERROR: "NETWORK_ERROR",
  AI_SERVICE_ERROR: "AI_SERVICE_ERROR",
  INTERNAL_ERROR: "INTERNAL_ERROR",
  AUTHENTICATION_ERROR: "AUTHENTICATION_ERROR",
  AUTHORIZATION_ERROR: "AUTHORIZATION_ERROR",
  RATE_LIMIT_ERROR: "RATE_LIMIT_ERROR",
  CIRCUIT_BREAKER_OPEN: "CIRCUIT_BREAKER_OPEN",
} as const;

// Error messages
export const ERROR_MESSAGES = {
  VALIDATION: "Request validation failed",
  NOT_FOUND: (route: string) => `Route not found: ${route}`,
  CONFIGURATION: "OpenAI API key not configured",
  NETWORK: "Network error occurred",
  AI_SERVICE: "AI service error",
  INTERNAL: "Internal server error",
  AUTHENTICATION: "Authentication required",
  AUTHORIZATION: "Insufficient permissions",
  RATE_LIMIT: "Too many requests, please try again later",
  CIRCUIT_BREAKER_OPEN:
    "Service temporarily unavailable, please try again later",
} as const;

// Default error messages for error classes
export const DEFAULT_ERROR_MESSAGES = {
  VALIDATION: "Invalid request data",
  AUTHENTICATION: "Authentication required",
  AUTHORIZATION: "Insufficient permissions",
  NOT_FOUND: "Resource not found",
  CONFIGURATION: "Service configuration error",
  NETWORK: "Network error occurred",
  AI_SERVICE: "AI service error",
  INTERNAL: "Internal server error",
} as const;

export const PROMPT_CONFIG = {
  ARCHITECT_SYSTEM: ARCHITECT_SYSTEM_TEMPLATE,
  TASK_SPLITTER_SYSTEM: TASK_SPLITTER_SYSTEM_TEMPLATE,
  REFINER_SYSTEM: REFINER_SYSTEM_TEMPLATE,
};

export const CORS_CONFIG = {
  get ORIGIN(): string {
    return getEnvConfig().CORS_ORIGIN;
  },
  ALLOW_METHODS: ["GET", "POST", "OPTIONS"] as string[],
  ALLOW_HEADERS: ["Content-Type", "Authorization"] as string[],
  get MAX_AGE(): number {
    return getEnvConfig().CORS_MAX_AGE;
  },
};

export const CIRCUIT_BREAKER_CONFIG = {
  get DEFAULT_FAILURE_THRESHOLD(): number {
    return getEnvConfig().CIRCUIT_BREAKER_FAILURE_THRESHOLD;
  },
  get DEFAULT_RESET_TIMEOUT_MS(): number {
    return getEnvConfig().CIRCUIT_BREAKER_RESET_TIMEOUT_MS;
  },
  get DEFAULT_HALF_OPEN_MAX_CALLS(): number {
    return getEnvConfig().CIRCUIT_BREAKER_HALF_OPEN_MAX_CALLS;
  },
};

export { SHARED_SSE_CONFIG as SSE_CONFIG };

export { SHARED_HTTP_STATUS as HTTP_STATUS };

export const SSE_HEADERS = {
  CONTENT_TYPE: "text/event-stream",
  CACHE_CONTROL: "no-cache",
  CONNECTION: "keep-alive",
} as const;

// Validation messages
export const VALIDATION_MESSAGES = {
  REQUEST_VALIDATION_FAILED: "Request validation failed",
  INVALID_JSON_BODY: "Invalid JSON in request body",
  VALIDATION_ERROR: "Validation error",
} as const;

// Configuration messages
export const CONFIG_MESSAGES = {
  OPENAI_API_KEY_MISSING: "OpenAI API key not configured",
  VALIDATED_DATA_NOT_FOUND: "Validated data not found in context",
} as const;

// Retry logic configuration
export const RETRY_LOGIC = {
  RATE_LIMIT_STATUS: 429,
  SERVER_ERROR_THRESHOLD: 500,
} as const;

export const ROUTE_PATHS = {
  ROOT: "/",
  GENERATE: "/generate",
  TASKS: "/tasks",
  REFINE: "/refine",
  EXPORT: "/export",
  IMPORT: "/import",
  STORAGE: "/storage",
  SHARE: "/share",
} as const;

export const RATE_LIMIT_CONFIG = {
  get WINDOW_MS(): number {
    return getEnvConfig().RATE_LIMIT_WINDOW_MS;
  },
  get STRICT_MAX(): number {
    return getEnvConfig().RATE_LIMIT_STRICT_MAX;
  },
  get STANDARD_MAX(): number {
    return getEnvConfig().RATE_LIMIT_STANDARD_MAX;
  },
  get LENIENT_MAX(): number {
    return getEnvConfig().RATE_LIMIT_LENIENT_MAX;
  },
};

export const STORAGE_CONFIG = {
  get QUOTA_MB(): number {
    return getEnvConfig().STORAGE_QUOTA_MB;
  },
  get QUOTA_BYTES(): number {
    return getEnvConfig().STORAGE_QUOTA_MB * 1024 * 1024;
  },
};

export const EXTERNAL_URLS = {
  get GITHUB(): string {
    return getEnvConfig().GITHUB_URL;
  },
  get PROJECT_HOMEPAGE(): string {
    return getEnvConfig().PROJECT_HOMEPAGE_URL;
  },
};

export const SHARE_CONFIG = {
  ID_LENGTH: 12,
  ALPHANUMERIC_CHARS:
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789",
  EXPIRATION_DAYS: 30,
  TITLE_MAX_LENGTH: 200,
  BLUEPRINT_MAX_LENGTH: 50000,
} as const;
