# DX (Developer Experience) Memory

> This file contains DX-related knowledge, patterns, and improvements for the Blueprintify project.

## Project Overview

Blueprintify is an AI-powered project architecture documentation generator built with:

- **Frontend**: React 18 + Vite + Tailwind CSS + Zustand
- **Backend**: Hono on Cloudflare Workers
- **Shared**: TypeScript types and Zod schemas

## Key DX Principles

### 1. Quick Start Experience

- `npm install` should just work
- `npm run dev:all` starts both frontend and API
- Environment setup is minimal (just OpenAI API key)

### 2. Code Quality Gates

- TypeScript strict mode enabled
- ESLint for code quality
- Vitest for testing
- All checks must pass before merge

### 3. Documentation Standards

- README.md for quick start
- CONTRIBUTING.md for contribution guidelines
- docs/ for detailed documentation
- AGENTS.md for AI agent rules

## Common DX Issues & Solutions

### Issue: Port Already in Use

```bash
# Kill processes on ports 3000 and 8787
lsof -ti:3000 | xargs kill -9
lsof -ti:8787 | xargs kill -9
```

### Issue: Dependencies Issues

```bash
# Clear npm cache and reinstall
npm cache clean --force
rm -rf node_modules apps/*/node_modules
npm install
```

### Issue: TypeScript Errors

```bash
# Check TypeScript configuration
npm run typecheck
# Ensure all dependencies are installed
npm install
```

## DX Improvement Opportunities

### Completed

- [x] Created DX-engineer agent definition
- [x] Created DX memory file
- [x] Add editorconfig for consistent coding style (`.editorconfig` exists)
- [x] Create troubleshooting guide (`docs/troubleshooting.md`)
- [x] Enhanced API error messages with helpful context (2026-02-20)

### Pending

- [ ] Improve error messages in development
- [ ] Add more inline code comments
- [ ] Fix CI workflow configuration issues (Issue #483) - **BLOCKED** by GitHub App permission restrictions

## Workflow Configuration Notes

### CI/CD Requirements

- Runner: `ubuntu-24.04-arm` (per AGENTS.md)
- Action versions: `actions/checkout@v4`, `actions/setup-node@v4`
- Line endings: LF (per .gitattributes)

### Branch Naming Conventions

- Agent branches: `agent/[role-name]`
- DX improvements: `DX-engineer`
- Feature branches: `feature/[feature-name]`
- Bugfix branches: `bugfix/[issue-description]`

## Testing Commands

```bash
# Run all quality checks
npm run check

# Individual commands
npm run typecheck  # TypeScript check
npm run lint       # ESLint check
npm run test:all   # All tests
npm run build      # Production build
```

## Known Limitations

1. **Workflow Permissions**: GitHub App cannot create/update workflow files without `workflows` permission
   - Issue #483 (CI workflow fixes) is blocked until permission is granted or manual fix is applied
   - Required fixes: rename `on pull.yml` to `on-pull.yml`, normalize CRLF→LF, update runner to `ubuntu-24.04-arm`, fix action versions from `@v6` to `@v4`
2. **Security Vulnerabilities**: ajv package has known vulnerabilities (upstream fix required)
3. **Lint Warnings**: 8 unused type imports in db test file (PR #575 addresses this)

## Troubleshooting Guide

### Common Issues

#### 1. npm install fails with permission errors

```bash
# Clear npm cache and reinstall
npm cache clean --force
rm -rf node_modules apps/*/node_modules packages/*/node_modules
npm install
```

#### 2. TypeScript errors about missing modules

```bash
# Ensure dependencies are installed
npm install
# Check TypeScript
npm run typecheck
```

#### 3. Tests fail with timeout errors

- Check if API is running (for integration tests)
- Ensure ports 3000 and 8787 are available
- Run tests with increased timeout: `npm run test:all -- --testTimeout=30000`

#### 4. Build fails with out-of-memory

```bash
# Increase Node memory limit
export NODE_OPTIONS="--max-old-space-size=4096"
npm run build
```

#### 5. Lint errors about unreachable code

- Check for unreachable `return` statements after early returns
- Run `npm run lint` to see specific files and lines

---

_Last updated: 2026-02-20_

> **Note**: For comprehensive troubleshooting, see [docs/troubleshooting.md](../docs/troubleshooting.md)
