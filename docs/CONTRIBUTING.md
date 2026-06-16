# Contributing to Blueprintify

> Quick-start guide for contributors.

## Architecture Overview

Blueprintify is a monorepo with two apps and a shared package:

```
blueprintify/
├── apps/
│   ├── api/          # Cloudflare Workers API (Hono + OpenAI)
│   └── web/          # React frontend (Vite + Tailwind)
├── packages/
│   └── shared/       # Shared types, Zod schemas, config
├── docs/             # Project documentation
└── .opencode/        # AI agent system
```

See [docs/blueprint.md](./blueprint.md) for complete architecture details.

## Quick Start

```bash
# Prerequisites: Node.js 22+ and npm 8+
node --version  # Should be v22.x or later

# Install dependencies
npm install

# Start development (API + frontend)
npm run dev:all

# Or separately:
npm run dev        # Frontend only (port 3000)
npm run dev:api    # API only (port 8787)
```

## Common Tasks

### Run Tests

```bash
npm run test:all       # All tests across all workspaces
npm run test           # Frontend tests only
npm run test:api       # API tests only
npm run test:coverage  # All tests (alias for test:all)
```

### Code Quality

```bash
npm run check     # Typecheck + lint + test (full CI gate)
npm run typecheck # TypeScript type checking
npm run lint      # ESLint
npm run format    # Prettier auto-format
```

### Build

```bash
npm run build      # Build frontend
npm run build:api  # Build API
npm run preview    # Build + start dev servers
```

## Project Conventions

### TypeScript

- Strict mode (`strict: true`)
- Interfaces for object shapes, `type` for unions/intersects
- Explicit return types on public functions
- No `any` - use `unknown` when uncertain

### Git

- Branch from `main`
- Commits follow Conventional Commits: `type(scope): subject`
  - `feat`, `fix`, `chore`, `docs`, `refactor`, `test`, `perf`
- PRs require passing CI checks before merge

### Labels

Every issue and PR should have:

- **Category** (exactly one): `bug | enhancement | feature | docs | refactor | chore | test | ci | security`
- **Priority** (exactly one): `P0 | P1 | P2 | P3`

## Known Issues

### BUG-010: CI Workflow Versions

The CI workflows previously referenced non-existent `@v5` GitHub Actions versions. This has been fixed. If you encounter version-related workflow failures, verify action versions in `.github/workflows/` use valid tags (`@v4` for checkout/cache, `@v6` for setup-node).

## AI Agent System

This project uses OpenCode with specialized AI agents. See [docs/ai-agent-usage-guide.md](./ai-agent-usage-guide.md) for details.

### Available Agent Roles

| Role                 | Purpose                     |
| -------------------- | --------------------------- |
| API Specialist       | API design and endpoints    |
| Backend Engineer     | API + database              |
| Frontend Engineer    | React components            |
| DevOps Engineer      | CI/CD + deployment          |
| Security Engineer    | Audits + vulnerabilities    |
| Quality Assurance    | Testing + review            |
| Technical Writer     | Documentation               |
| UI/UX Engineer       | Design + accessibility      |
| Database Architect   | Schema + migrations         |
| Reliability Engineer | Resilience + error handling |

## Documentation

All documentation lives in `docs/`. Key files:

- [Blueprint](./blueprint.md) - System architecture
- [Roadmap](./roadmap.md) - Development roadmap
- [API Docs](./api-documentation.md) - API reference
- [Testing Procedures](./testing-procedures.md) - Testing guidelines
- [Development Workflow](./development-workflow.md) - Full dev process
- [Code Style](./code-style-guidelines.md) - Coding standards
- [CI Configuration](./ci-configuration.md) - CI/CD setup
- [Troubleshooting](./troubleshooting.md) - Common issues
