import { RETRY_CONFIG as SHARED_RETRY_CONFIG } from "@blueprint/shared";

/**
 * API configuration constants
 * Centralized location for all hardcoded values
 */

export const RETRY_CONFIG = SHARED_RETRY_CONFIG;

// AI service configuration
export const AI_CONFIG = {
  DEFAULT_MODEL: "gpt-4o-mini",
  DEFAULT_TIMEOUT: 60000,
  DEFAULT_MAX_TOKENS: 4000,
  DEFAULT_TEMPERATURE: 0.7,
} as const;

// API Metadata
export const API_METADATA = {
  NAME: "Blueprint Generator API",
  VERSION: "1.0.0",
  STATUS: "healthy",
} as const;

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
} as const;

// HTTP Status codes for retry logic
export const RETRYABLE_STATUS_CODES = [408, 429, 500, 502, 503, 504] as const;

// Retryable error codes for network operations
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
} as const;

// System prompt configuration
export const PROMPT_CONFIG = {
  // Architect system prompt
  ARCHITECT_SYSTEM: `You are Agent 00, a Principal Software Architect with 20+ years of experience designing scalable, maintainable systems. Your role is to create comprehensive architectural documentation that enables autonomous development agents to build the project from scratch.

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
9. **Deployment** - Build and deployment instructions`,

  // Task splitter system prompt
  TASK_SPLITTER_SYSTEM: `You are a Technical Project Manager specializing in breaking down architectural plans into actionable development tasks. You excel at:

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
- **P2 (Enhancements)** - Nice-to-have improvements`,

  // Refiner system prompt
  REFINER_SYSTEM: `You are an expert technical editor. Your job is to improve specific sections of documentation based on user feedback. You:

- Maintain consistency with surrounding content
- Add more detail where needed
- Fix technical inaccuracies
- Improve clarity and readability

Output ONLY the refined section, not the entire document.`,
} as const;

// CORS configuration
export const CORS_CONFIG = {
  ORIGIN: "*",
  ALLOW_METHODS: ["GET", "POST", "OPTIONS"] as string[],
  ALLOW_HEADERS: ["Content-Type", "Authorization"] as string[],
};

// SSE Stream configuration
export const SSE_CONFIG = {
  EVENT_TYPE: {
    CONTENT: "content",
    ERROR: "error",
    DONE: "done",
  },
  DATA_PREFIX: "data: ",
  EVENT_SEPARATOR: "\n\n",
} as const;
