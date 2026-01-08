# System Memory & Learned Patterns

> This file is AUTO-GENERATED and UPDATED by the System Improver agent.
> It contains successful patterns, anti-patterns, and project-specific knowledge learned from previous implementation cycles.

## ✅ Successful Patterns

- [Init] Use `opencode/glm-4.7-free` for all agent models.
- [Init] Use `ubuntu-24.04-arm` for CI runners.

## ⚠️ Anti-Patterns (Do Not Repeat)

- [Workflow] Do not use `ask` permission in CI environments (causes timeouts).
- [Workflow] Do not rely on `cat` for reading prompts; use `--agent` flag.
- [Code Style] Do not mix single and double quotes in string literals; use double quotes consistently.

## 🎨 Code Style Conventions

- **String Quotes**: Use double quotes (`"`) for all string literals (consistency across codebase)
- **Section Headers**: Use JSDoc-style section headers (`// ===== Section Name =====`) for better readability
- **Export Placement**: Place controller exports at the bottom of files (e.g., `export const controller = { method }`)
- **Import Grouping**: Group imports by type: external libraries, internal services, then local modules

## 🏗️ Architectural Decisions

- Centralized configuration in `.opencode/`.
- Headless "Act, Don't Ask" protocol for all agents.
- Monorepo with shared types package (`@blueprint/shared`) for type safety across apps.

## 🔧 API Patterns (Cloudflare Workers + Hono)

- **Controller Pattern**: Separate business logic from route handlers - routes delegate to controllers (e.g., `generateController.generateBlueprint`)
- **Route Separation**: Each API route in its own file (e.g., `routes/generate.ts`, `routes/tasks.ts`)
- **Type-Safe Bindings**: Use `Hono<{ Bindings: Env }>()` generic for environment variable type safety
- **Middleware Chain**: Apply security middleware early (`secureHeaders()`, `cors()`, `prettyJSON()`)
- **Centralized Error Handling**: Single `app.onError()` handler with type guard checking (`isAPIError`) for consistent error responses
- **Health Check Endpoint**: Always include `GET /` with status and available endpoints for monitoring
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

## 🎯 Controller Pattern (Business Logic Layer)

- **Export Object Pattern**: Export controllers as objects containing methods (e.g., `export const generateController = { generateBlueprint }`)
- **Environment Binding Access**: Controllers receive `Context<{ Bindings: Env }>` to access environment variables
- **Validation Before Business Logic**: Validate configuration and dependencies early in controller methods
- **Explicit Return Types**: All controller functions have explicit `Promise<Response>` return types
- **JSDoc Comments**: Document controller methods with parameter descriptions and return types

## 🔄 Error Handling & Resilience

- **Error Class Hierarchy**: Use base `APIError` class with specific subclasses (`ValidationError`, `ConfigurationError`, `AIServiceError`, `StreamError`)
- **Standardized Error Format**: Error responses include `code`, `message`, `statusCode`, `timestamp`, and optional `details`
- **Type Guard Pattern**: Use `isAPIError()` type guard for safe error type checking before accessing error properties
- **Error Helper Functions**: Create helper functions for common errors (`createOpenAIConfigError`, `wrapOpenAIError`, `wrapStreamError`)
- **Error Wrapping**: Wrap external service errors (OpenAI, streams) in domain-specific error types for better error handling
- **Error Response Builder**: Use `errorToResponse()` to convert `APIError` instances to standardized response format
- **Exponential Backoff**: Use retry logic with configurable delay and backoff factor
- **Retryable Error Detection**: Retry on 429 (rate limit) and 5xx errors; fail fast on 4xx client errors
- **Streaming Resilience**: Handle stream errors with cleanup and proper error propagation

## 🚀 Deployment & Configuration

- **Wrangler.toml**: Use for Cloudflare Workers configuration; store non-secret vars in `[vars]`
- **Environment Types**: Define `Env` interface for type-safe access to bindings
- **Source Maps**: Enable sourcemaps in production (`sourcemap: true` in vite.config)
