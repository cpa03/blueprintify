# Blueprint Generator - Project Rules

> This file defines the operational rules and constraints for all AI agents working on this project.

## Core Constraints

1. **Model Mandate**: All agents MUST use `opencode/glm-4.7-free` exclusively
2. **CI Runner**: GitHub Actions MUST use `ubuntu-24.04-arm`
3. **Never expose secrets**: API keys, tokens, and `.env` contents must never be logged or committed

## Code Standards

### TypeScript

- Use strict TypeScript (`strict: true` in tsconfig)
- Prefer interfaces over types for object shapes
- Use `type` for unions, intersects, and computed types
- Always include explicit return types on public functions
- No `any` type - use `unknown` when type is uncertain

### React

- Use functional components with hooks
- Prefer composition over inheritance
- Use `React.memo` for expensive renders
- Wrap callbacks with `useCallback`
- Wrap computed values with `useMemo`

### Cloudflare Workers (API)

- Use Hono framework patterns
- Validate all inputs with Zod
- Return consistent JSON response shapes
- Handle errors with proper HTTP status codes

## Directory Structure

```
├── apps/
│   ├── api/          # Cloudflare Workers API (Hono)
│   └── web/          # React frontend (Vite)
├── packages/
│   └── shared/       # Shared types and utilities
├── .opencode/
│   ├── agent/        # Agent definitions
│   ├── skill/        # Reusable skills
│   ├── command/      # Custom commands
│   └── plugin/       # Plugins (hooks)
└── docs/             # Documentation
```

## Git Workflow

1. Work on `agent` branch
2. Commits follow Conventional Commits: `type(scope): subject`
   - `feat`: New feature
   - `fix`: Bug fix
   - `chore`: Maintenance
   - `docs`: Documentation
   - `refactor`: Code refactoring
   - `test`: Testing
   - `perf`: Performance improvement
3. PRs require passing CI checks before merge

## Security Rules

- **NEVER** read or output `.env` files
- **NEVER** log API keys or tokens
- **ALWAYS** validate user inputs
- **ALWAYS** sanitize outputs (especially markdown/HTML)
- Use parameterized queries for database operations

## Performance Guidelines

- Lazy load components when possible
- Minimize bundle size
- Use proper caching strategies
- Optimize images and assets
- Profile before optimizing
