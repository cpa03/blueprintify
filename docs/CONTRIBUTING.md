# Contributing to Blueprintify

Thank you for your interest in contributing! This guide will help you get started with the project.

## Quick Start

```bash
# Prerequisites: Node.js 22+
git clone https://github.com/cpa03/blueprintify.git
cd blueprintify
npm install

# Start development (frontend + API)
npm run dev:all

# Run all quality checks
npm run check
```

## Architecture Overview

Blueprintify is a monorepo with three packages:

- **`apps/web/`** — React frontend (Vite + Tailwind + Zustand)
- **`apps/api/`** — Cloudflare Workers API (Hono + Zod + OpenAI)
- **`packages/shared/`** — Shared TypeScript types, Zod schemas, and config defaults

See [docs/blueprint.md](blueprint.md) for full architecture details.

## Development Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start frontend dev server (port 3000) |
| `npm run dev:api` | Start API dev server (port 8787) |
| `npm run dev:all` | Start both frontend and API concurrently |
| `npm run build` | Build frontend for production |
| `npm run typecheck` | Run TypeScript type checking |
| `npm run lint` | Run ESLint |
| `npm run audit` | Check dependency vulnerabilities |
| `npm run test:all` | Run all tests (web + api + shared) |
| `npm run check` | Full quality check (typecheck + lint + audit + test) |

## Common Tasks

### Adding a Feature

1. Create a branch: `git checkout -b feat/my-feature`
2. Implement changes following the patterns in existing code
3. Add tests for new functionality
4. Run `npm run check` to verify everything passes
5. Push and create a pull request

### Fixing a Bug

1. Create a branch: `git checkout -b fix/my-bugfix`
2. Write a failing test that reproduces the bug
3. Fix the bug
4. Verify `npm run check` passes
5. Push and create a pull request

### Running Tests

```bash
# Run all tests across all workspaces
npm run test:all

# Run tests for a specific workspace
npm run test --workspace=apps/web
npm run test --workspace=apps/api
npm run test --workspace=packages/shared

# Run with coverage
npm run test:all -- --coverage
```

## Code Standards

### TypeScript

- Strict mode enabled (`strict: true`)
- Prefer interfaces over types for object shapes
- Use `type` for unions, intersections, and computed types
- Explicit return types on public functions
- No `any` — use `unknown` when type is uncertain

### React

- Functional components with hooks
- Composition over inheritance
- `React.memo` for expensive renders
- `useCallback` for callbacks, `useMemo` for computed values

### API (Hono)

- Validate all inputs with Zod
- Consistent JSON response shapes
- Proper HTTP status codes for errors
- Use the `authorize()` middleware for protected routes

### Commits

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
type(scope): description

feat(web): add template preview modal
fix(api): handle empty description in generation
chore(deps): update framer-motion to v12
docs: add CONTRIBUTING guide
```

## AI Agent System

This project uses specialized AI agents for different tasks. Key roles:

| Role | Responsibility |
|------|---------------|
| Frontend Engineer | React components, UI, styling |
| API Specialist | Hono routes, OpenAI integration |
| DevOps Engineer | CI/CD, deployment, infrastructure |
| Security Engineer | Vulnerability assessment, auth |
| Quality Assurance | Test coverage, code review |
| Technical Writer | Documentation |

Agents are configured in `.opencode/agent/`. For the full list, see [docs/ai-agent-usage-guide.md](ai-agent-usage-guide.md).

## Pull Request Process

1. Sync with `main` before opening a PR
2. Ensure all CI checks pass (build, typecheck, lint, tests, audit)
3. PR title should follow conventional commits format
4. Link the PR to any related issues
5. PRs require passing CI checks before merge

## Questions?

- See [docs/development-workflow.md](development-workflow.md) for the full development process
- See [docs/troubleshooting.md](troubleshooting.md) for common issues
- See [docs/code-style-guidelines.md](code-style-guidelines.md) for detailed coding standards
