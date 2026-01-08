# System Memory & Learned Patterns

> This file is AUTO-GENERATED and UPDATED by the System Improver agent.
> It contains successful patterns, anti-patterns, and project-specific knowledge learned from previous implementation cycles.

## ✅ Successful Patterns

- [Init] Use `opencode/glm-4.7-free` for all agent models.
- [Init] Use `ubuntu-24.04-arm` for CI runners.
- [Refactoring] Extract controllers when you have shared business logic across multiple routes (e.g., AI configuration validation, streaming generation, error handling).
- [Error Handling] Create centralized error handling with error code mappings for consistent API responses; map error codes to HTTP status codes (e.g., API_KEY_MISSING → 500, VALIDATION_ERROR → 400).
- [Response Format] Use standardized response builders (`createSuccessResponse`, `createErrorResponse`, `createDetailedErrorResponse`) to ensure API consistency; all responses should include `timestamp` for debugging.
- [Response Format] Include `details` object in error responses to provide additional context (e.g., error code, validation details) without exposing sensitive information.

## ⚠️ Anti-Patterns (Do Not Repeat)

- [Workflow] Do not use `ask` permission in CI environments (causes timeouts).
- [Workflow] Do not rely on `cat` for reading prompts; use `--agent` flag.
- [Code Style] Do not mix single and double quotes in string literals; use single quotes consistently.
- [Architecture] Do not create unnecessary abstraction layers (controllers, services) if routes are simple enough to contain the logic inline. **Updated**: Extract to controllers only when you have shared business logic across routes or need to standardize error handling.
- [Architecture] Do not create complex error type hierarchies in early development; prefer simple generic error handling until the need for specific error types is clear.
- [Error Handling] Do not duplicate error handling logic across routes; create a centralized error handler with error code mapping for consistency.
- [Response Format] Do not manually construct JSON responses with inconsistent shapes; use standardized response builders (`createSuccessResponse`, `createErrorResponse`) to ensure API consistency.

## 🎨 Code Style Conventions

- **String Quotes**: Use single quotes (`'`) for all string literals (consistency across codebase)
- **Type Safety**: Always use `unknown` instead of `any` when the type is uncertain (e.g., error parameters, generic data)
- **Import Formatting**: Use multi-line imports for better readability when importing multiple items from a module; single-line imports are acceptable for 1-2 items
- **Import Grouping**: Group imports by type: external libraries, internal services, then local modules
- **Default Exports**: Use `export default` for route handlers and main modules to simplify importing
- **Section Headers**: Use JSDoc-style section headers (`// ===== Section Name =====`) for better readability
- **Barrel Files**: Create `index.ts` files in directories to aggregate and re-export modules, providing clean import paths and organizing exports logically
- **Export Documentation**: Add descriptive comments at the top of barrel files to explain what they contain (e.g., `// UI Components`, `// Custom React Hooks`)
- **Logical Export Grouping**: Group related exports in barrel files with comments to indicate categorization (e.g., `// Editor sub-components`, `// Wizard sub-components`)

## 🏗️ Architectural Decisions

- Centralized configuration in `.opencode/`.
- Headless "Act, Don't Ask" protocol for all agents.
- Monorepo with shared types package (`@blueprint/shared`) for type safety across apps.
- **Barrel File Pattern**: Use `index.ts` files to aggregate exports from subdirectories, providing clean import paths like `@blueprint/components` instead of deep relative paths
- **Export Flexibility**: Provide both named exports and default exports in barrel files when modules might be imported in different ways (e.g., `export { Route }` and `export { default as route }`)

## 🔧 API Patterns (Cloudflare Workers + Hono)

- **Inline Route Logic**: Keep route logic inline when simple; extract to controllers when you have shared business logic across routes or need standardized error handling
- **Route Separation**: Each API route in its own file (e.g., `routes/generate.ts`, `routes/tasks.ts`)
- **Controller Pattern**: Use controller classes for routes with shared logic; controllers should have methods for each operation (e.g., `generateBlueprint`, `generateTasks`, `refineContent`)
- **Controller Configuration**: Create shared configuration methods in controllers (e.g., `createAIConfig`) to avoid duplication of environment variable validation and setup
- **Type-Safe Bindings**: Use `Hono<{ Bindings: Env }>()` generic for environment variable type safety
- **Middleware Chain**: Apply security middleware early (`secureHeaders()`, `cors()`, `prettyJSON()`)
- **Centralized Error Handling**: Create `handleControllerError` utility for consistent error responses; use error code mapping for status codes; include detailed error context without exposing sensitive information
- **Health Check Endpoint**: Always include `GET /` with status and available endpoints for monitoring; use standardized response format
- **Zod Validation**: Use `zValidator('json', Schema)` middleware for request validation
- **Streaming SSE**: Use Server-Sent Events with `AsyncGenerator` for streaming AI responses

## 🎨 React Patterns (Vite + TypeScript)

- **Zustand State Management**: Use `create()` with `persist` middleware; use `partialize` to control what gets persisted
- **Type-Safe Actions**: Define store interface with both state and actions; use TypeScript inference
- **Lazy Loading**: Use `React.lazy()` + `Suspense` for code-splitting heavy components
- **Animation**: Use Framer Motion's `AnimatePresence` and `layout` prop for smooth transitions
- **Path Aliases**: Configure `@` alias in `vite.config.ts` for clean imports
- **API Proxy**: Use Vite dev server proxy to forward `/api` to Cloudflare Workers (port 8787)

## 🧪 Testing Patterns

- **Test File Organization**: Mirror source file structure (e.g., `controller.test.ts` alongside `controller.ts`)
- **Comprehensive Test Coverage**: Include success cases, error cases, and edge cases for each function
- **Mock Dependency Imports**: Use `vi.mock()` at the top of test files to mock external dependencies
- **Describe Block Organization**: Group tests by function/method (e.g., `describe("generateBlueprint", ...)`)
- **BeforeEach Cleanup**: Use `vi.clearAllMocks()` in `beforeEach` to ensure test isolation
- **Mocked Return Types**: Use `vi.mocked()` for type-safe assertion on mock functions
- **Async Generator Mocking**: Mock async generators with `async function* () { yield ...; }` pattern
- **Context Mocking**: Create minimal mock context objects with required environment bindings

## 📦 Type Safety & Validation

- **Zod Schemas as Source of Truth**: Define schemas once in shared package; infer types with `z.infer<typeof Schema>`
- **Shared Types Package**: Extract common types, schemas, and interfaces to `packages/shared`
- **Project References**: Use TypeScript `references` in `tsconfig.json` for monorepo type checking

## 🎯 Architecture Simplicity

- **YAGNI Principle**: Avoid creating controllers, services, or helper layers until they are actually needed
- **Inline Logic**: Keep business logic inline in route handlers when the logic is simple (e.g., single AI call, validation + stream response)
- **Extract on Complexity**: Create separate layers only when you need to reuse code across multiple routes, standardize error handling, or the logic becomes complex enough to warrant testing separately
- **Controller Structure**: When using controllers, follow a consistent structure: configuration validation method (e.g., `createAIConfig`), operation methods (e.g., `generateBlueprint`), and wrap operations in try-catch with centralized error handling
- **Explicit Return Types**: All route handlers should have explicit return types (e.g., `Promise<Response>`)
- **Environment Binding Access**: Routes receive `Context<{ Bindings: Env }>` to access environment variables directly

## 🔄 Error Handling & Resilience

- **Error Code System**: Define explicit error codes (e.g., `API_KEY_MISSING`, `VALIDATION_ERROR`, `TIMEOUT_ERROR`) as constants/enums to maintain consistent error identifiers across the codebase
- **Error Code Status Mapping**: Create a mapping from error codes to HTTP status codes (e.g., `UNAUTHORIZED` → 401, `GENERATION_FAILED` → 500) to ensure appropriate HTTP responses
- **Detailed Error Responses**: Use `createDetailedErrorResponse` to provide error context without exposing sensitive information; always include error code in response details
- **Centralized Error Handler**: Create `handleControllerError` utility that inspects error types and messages to determine appropriate error codes and HTTP status codes
- **Environment Variable Validation**: Validate required environment variables (e.g., `OPENAI_API_KEY`) at the start of operations and throw descriptive errors that can be caught and converted to proper API responses
- **Simple Generic Errors**: Use generic error handling for API responses; avoid complex error type hierarchies in early development
- **Error Response Format**: Standardized error responses with `error` message, `status` code, and `timestamp`; optional `details` object for additional context
- **Exponential Backoff**: Use retry logic with configurable delay and backoff factor
- **Retryable Error Detection**: Retry on 429 (rate limit) and 5xx errors; fail fast on 4xx client errors
- **Type-Safe Error Parameters**: Use `unknown` type for error parameters; narrow type with type guards when accessing properties (e.g., `error as { status?: number }`)

## 🚀 Deployment & Configuration

- **Wrangler.toml**: Use for Cloudflare Workers configuration; store non-secret vars in `[vars]`
- **Environment Types**: Define `Env` interface for type-safe access to bindings
- **Source Maps**: Enable sourcemaps in production (`sourcemap: true` in vite.config)
- **Config File TS Handling**: Use `// @ts-nocheck` directive for config files with non-standard TypeScript (e.g., tailwind.config.js) instead of trying to fix every type issue
- **ESM Path Handling**: When using ES modules in Node.js config files, properly handle `__filename` and `__dirname` using `fileURLToPath` and `import.meta.url`:
  ```typescript
  import { fileURLToPath } from "node:url";
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  ```
