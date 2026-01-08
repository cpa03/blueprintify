# System Memory & Learned Patterns

> This file is AUTO-GENERATED and UPDATED by the System Improver agent.
> It contains successful patterns, anti-patterns, and project-specific knowledge learned from previous implementation cycles.

## ✅ Successful Patterns

- [Init] Use `opencode/glm-4.7-free` for all agent models.
- [Init] Use `ubuntu-24.04-arm` for CI runners.

## ⚠️ Anti-Patterns (Do Not Repeat)

- [Workflow] Do not use `ask` permission in CI environments (causes timeouts).
- [Workflow] Do not rely on `cat` for reading prompts; use `--agent` flag.

## 🏗️ Architectural Decisions

- Centralized configuration in `.opencode/`.
- Headless "Act, Don't Ask" protocol for all agents.
- Monorepo with shared types package (`@blueprint/shared`) for type safety across apps.

## 🔧 API Patterns (Cloudflare Workers + Hono)

- **Route Separation**: Each API route in its own file (e.g., `routes/generate.ts`, `routes/tasks.ts`)
- **Type-Safe Bindings**: Use `Hono<{ Bindings: Env }>()` generic for environment variable type safety
- **Middleware Chain**: Apply security middleware early (`secureHeaders()`, `cors()`, `prettyJSON()`)
- **Centralized Error Handling**: Single `app.onError()` handler for consistent error responses
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

## 📦 Type Safety & Validation

- **Zod Schemas as Source of Truth**: Define schemas once in shared package; infer types with `z.infer<typeof Schema>`
- **Shared Types Package**: Extract common types, schemas, and interfaces to `packages/shared`
- **Project References**: Use TypeScript `references` in `tsconfig.json` for monorepo type checking

## 🔄 Error Handling & Resilience

- **Exponential Backoff**: Use retry logic with configurable delay and backoff factor
- **Retryable Error Detection**: Retry on 429 (rate limit) and 5xx errors; fail fast on 4xx client errors
- **Streaming Resilience**: Handle stream errors with cleanup and proper error propagation

## 🚀 Deployment & Configuration

- **Wrangler.toml**: Use for Cloudflare Workers configuration; store non-secret vars in `[vars]`
- **Environment Types**: Define `Env` interface for type-safe access to bindings
- **Source Maps**: Enable sourcemaps in production (`sourcemap: true` in vite.config)
