# System Memory & Learned Patterns

> This file is AUTO-GENERATED and UPDATED by the System Improver agent.
> It contains successful patterns, anti-patterns, and project-specific knowledge learned from previous implementation cycles.

## ✅ Successful Patterns

- [Init] Use `opencode/glm-4.7-free` for all agent models.
- [Init] Use `ubuntu-24.04-arm` for CI runners.

## ⚠️ Anti-Patterns (Do Not Repeat)

- [Workflow] Do not use `ask` permission in CI environments (causes timeouts).
- [Workflow] Do not rely on `cat` for reading prompts; use `--agent` flag.
- [Code Style] Do not mix single and double quotes in string literals; use single quotes consistently.
- [Architecture] Do not create unnecessary abstraction layers (controllers, services) if routes are simple enough to contain the logic inline.
- [Architecture] Do not create complex error type hierarchies in early development; prefer simple generic error handling until the need for specific error types is clear.

## 🎨 Code Style Conventions

- **String Quotes**: Use single quotes (`'`) for all string literals (consistency across codebase)
- **Type Safety**: Always use `unknown` instead of `any` when the type is uncertain (e.g., error parameters, generic data)
- **Import Formatting**: Use multi-line imports for better readability when importing multiple items from a module; single-line imports are acceptable for 1-2 items
- **Import Grouping**: Group imports by type: external libraries, internal services, then local modules
- **Default Exports**: Use `export default` for route handlers and main modules to simplify importing
- **Section Headers**: Use JSDoc-style section headers (`// ===== Section Name =====`) for better readability

## 🏗️ Architectural Decisions

- Centralized configuration in `.opencode/`.
- Headless "Act, Don't Ask" protocol for all agents.
- Monorepo with shared types package (`@blueprint/shared`) for type safety across apps.

## 🔧 API Patterns (Cloudflare Workers + Hono)

- **Inline Route Logic**: Keep route logic inline when simple; only extract to controllers/services when complexity warrants it
- **Route Separation**: Each API route in its own file (e.g., `routes/generate.ts`, `routes/tasks.ts`)
- **Type-Safe Bindings**: Use `Hono<{ Bindings: Env }>()` generic for environment variable type safety
- **Middleware Chain**: Apply security middleware early (`secureHeaders()`, `cors()`, `prettyJSON()`)
- **Centralized Error Handling**: Single `app.onError()` handler with generic error responses; customize only when error-specific handling is needed
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

## 🎯 Architecture Simplicity

- **YAGNI Principle**: Avoid creating controllers, services, or helper layers until they are actually needed
- **Inline Logic**: Keep business logic inline in route handlers when the logic is simple (e.g., single AI call, validation + stream response)
- **Extract on Complexity**: Create separate layers only when you need to reuse code across multiple routes or the logic becomes complex
- **Explicit Return Types**: All route handlers should have explicit return types (e.g., `Promise<Response>`)
- **Environment Binding Access**: Routes receive `Context<{ Bindings: Env }>` to access environment variables directly

## 🔄 Error Handling & Resilience

- **Simple Generic Errors**: Use generic error handling for API responses; avoid complex error type hierarchies in early development
- **Error Response Format**: Simple error responses with `error` message and `status` code
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
