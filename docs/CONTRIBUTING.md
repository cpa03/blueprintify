# Contributing to Blueprintify

> Quick-start guide for developers. For detailed documentation, see [docs/](./).

## Prerequisites

- Node.js 20+ (use `.nvmrc` or `nvm use`)
- npm 8+
- Git

## Setup

```bash
# Clone the repository
git clone https://github.com/cpa03/blueprintify.git
cd blueprintify

# Install dependencies
npm install

# Copy environment file
cp apps/api/.dev.vars.example apps/api/.dev.vars
# Edit apps/api/.dev.vars and add your OpenAI API key
```

## Development Commands

| Command           | Description                    |
| ----------------- | ------------------------------ |
| `npm run dev`     | Start frontend (port 3000)     |
| `npm run dev:api` | Start API server (port 8787)   |
| `npm run dev:all` | Start both frontend and API    |
| `npm run build`   | Build frontend for production  |
| `npm run check`   | Run typecheck, lint, and tests |

## Testing

```bash
# Run all tests
npm run test:all

# Run tests for specific workspace
npm run test           # Frontend
npm run test:api       # API
npm run test:workspace=packages/shared  # Shared
```

## Quality Checks

```bash
# Run all checks (typecheck + lint + tests)
npm run check

# Run individually
npm run typecheck
npm run lint
npm run format        # Auto-fix formatting
```

## Project Structure

```
blueprintify/
├── apps/
│   ├── api/          # Cloudflare Workers API (Hono)
│   └── web/          # React frontend (Vite)
├── packages/
│   └── shared/       # Shared types and Zod schemas
├── docs/             # Documentation
└── .opencode/        # AI agent definitions
```

## Common Tasks

### Adding a new feature

1. Create a branch: `git checkout -b feat/your-feature`
2. Make changes following existing patterns
3. Run `npm run check` to verify
4. Commit with Conventional Commits: `feat(scope): description`
5. Push and create PR

### Fixing a bug

1. Create a branch: `git checkout -b fix/issue-description`
2. Fix the bug with minimal changes
3. Run `npm run check` to verify
4. Commit with Conventional Commits: `fix(scope): description`
5. Push and create PR

### Running specific tests

```bash
# Frontend tests with UI
npm run test --workspace=apps/web -- --ui

# API tests with coverage
npm run test:api -- --coverage
```

## AI Agent System

This project uses OpenCode AI agents for different tasks. See [.opencode/](./.opencode/) for agent definitions.

| Agent               | Purpose                 |
| ------------------- | ----------------------- |
| `frontend-engineer` | React components, UI    |
| `backend-engineer`  | API endpoints, services |
| `security-engineer` | Security audits         |
| `quality-assurance` | Testing                 |
| `dx-engineer`       | Developer experience    |

## Debugging

### Frontend

```bash
# Start with debugging
npm run dev

# Check console in browser DevTools
```

### API

```bash
# API runs on port 8787
# Check Cloudflare Workers logs in terminal
```

## Resources

- [Architecture Overview](./blueprint.md)
- [API Documentation](./api-documentation.md)
- [User Guide](./user-guide.md)
- [Development Workflow](./development-workflow.md)

## Questions?

- Open an issue: https://github.com/cpa03/blueprintify/issues
- Check existing issues before creating new ones

## Known Issues

### BUG-010: CI Workflow Version Mismatch

The GitHub Actions workflows contain invalid version references (`@v5` instead of `@v4`) that cause CI failures.

**Workaround**: This is a known issue that requires repository admin permissions to fix. If your PR CI fails with version errors, this is likely BUG-010 and not related to your changes. Check the [bugs documentation](./bugs.md#bug-010-github-actions-invalid-versions-v5-→-v4) for details.
