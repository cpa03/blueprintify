# Troubleshooting Guide

This document provides solutions to common issues encountered during Blueprintify development.

## Quick Reference

| Issue               | Solution                             |
| ------------------- | ------------------------------------ |
| Port already in use | Kill process on port 3000/8787       |
| npm install fails   | Clear cache and reinstall            |
| TypeScript errors   | Run `npm run typecheck` for details  |
| Tests timeout       | Increase timeout or check API status |
| Build out of memory | Increase Node memory limit           |
| Lint errors         | Run `npm run lint` for details       |

## Installation Issues

### npm install fails with permission errors

**Symptoms:**

- `EACCES` permission errors
- `npm ERR!` messages during install

**Solution:**

```bash
# Clear npm cache and reinstall
npm cache clean --force
rm -rf node_modules apps/*/node_modules packages/*/node_modules
npm install
```

### Dependency version conflicts

**Symptoms:**

- Warnings about peer dependency mismatches
- Unexpected behavior after install

**Solution:**

```bash
# Clean install with lock file
rm -rf node_modules package-lock.json
npm install
```

## Development Server Issues

### Port already in use

**Symptoms:**

- `Error: listen EADDRINUSE: address already in use :::3000`
- `Error: listen EADDRINUSE: address already in use :::8787`

**Solution:**

```bash
# Kill processes on ports 3000 and 8787
lsof -ti:3000 | xargs kill -9 2>/dev/null || true
lsof -ti:8787 | xargs kill -9 2>/dev/null || true

# Or use fuser (Linux)
fuser -k 3000/tcp 2>/dev/null || true
fuser -k 8787/tcp 2>/dev/null || true
```

### API returns 503 configuration error

**Symptoms:**

- API returns 503 status code
- Error message: "API_KEY is not configured. Server authentication is unavailable."
- All API requests fail with configuration error

**Solution:**

The API now requires `OPENAI_API_KEY` to be configured for security reasons. This is a security fix (issue #945) that prevents auth bypass vulnerabilities.

```bash
# Check if .dev.vars exists and contains API key
cat apps/api/.dev.vars

# If missing or empty, add your API key:
echo "OPENAI_API_KEY=your_openai_api_key_here" >> apps/api/.dev.vars

# For production, set the environment variable:
export OPENAI_API_KEY=your_openai_api_key_here
```

**Note:** In production, ensure `OPENAI_API_KEY` environment variable is set before deploying.

### API server won't start

**Symptoms:**

- Wrangler errors
- Cloudflare Workers binding issues

**Solution:**

```bash
# Check if .dev.vars exists
ls apps/api/.dev.vars

# If missing, copy from example
cp apps/api/.dev.vars.example apps/api/.dev.vars

# Edit with your API key
# OPENAI_API_KEY=your_key_here
```

### Hot reload not working

**Symptoms:**

- Changes not reflected in browser
- Manual refresh required

**Solution:**

```bash
# Restart development server
# Press Ctrl+C to stop, then:
npm run dev:all

# Clear Vite cache if needed
rm -rf apps/web/.vite
```

## Build Issues

### TypeScript errors about missing modules

**Symptoms:**

- `Cannot find module '...' or its corresponding type declarations`
- Type errors after pull

**Solution:**

```bash
# Ensure dependencies are installed
npm install

# Check TypeScript
npm run typecheck

# If shared package is the issue
npm run build --workspace=@blueprint/shared
```

### Build fails with out-of-memory

**Symptoms:**

- `JavaScript heap out of memory`
- Build process crashes

**Solution:**

```bash
# Increase Node memory limit
export NODE_OPTIONS="--max-old-space-size=4096"
npm run build

# Or for persistent setting, add to ~/.bashrc or ~/.zshrc:
# export NODE_OPTIONS="--max-old-space-size=4096"
```

### Build fails with module not found

**Symptoms:**

- `Module not found: Error: Can't resolve '...'`

**Solution:**

```bash
# Rebuild shared package first
npm run build --workspace=@blueprint/shared

# Then rebuild all
npm run build
```

## Test Issues

### Tests fail with timeout errors

**Symptoms:**

- `Test timed out after 5000ms`
- Integration tests hanging

**Solution:**

```bash
# Check if API is running (for integration tests)
curl http://localhost:8787/

# Run tests with increased timeout
npm run test:all -- --testTimeout=30000

# Or for specific test file
npm test -- path/to/test.ts --testTimeout=30000
```

### Tests fail with connection refused

**Symptoms:**

- `ECONNREFUSED 127.0.0.1:8787`
- API tests failing

**Solution:**

```bash
# Start API server first
npm run dev:api &

# Wait for server to start
sleep 5

# Run tests
npm run test:api
```

### Snapshot tests failing

**Symptoms:**

- Snapshot mismatch errors

**Solution:**

```bash
# Update snapshots if changes are expected
npm test -- -u

# Or for specific file
npm test -- path/to/test.ts -u
```

## Lint Issues

### Lint errors about unreachable code

**Symptoms:**

- `Unreachable code detected`
- Errors after early returns

**Solution:**

```bash
# Run lint to see specific files and lines
npm run lint

# Common causes:
# - return statement after early return
# - code after throw statement
# - Dead code branches
```

### Unused imports/variables

**Symptoms:**

- `'X' is defined but never used`
- Unused type imports

**Solution:**

```bash
# Auto-fix simple issues
npm run lint -- --fix

# For unused type imports, remove them manually
# or use IDE's "Remove unused imports" feature
```

## Git Issues

### Merge conflicts

**Symptoms:**

- `CONFLICT (content): Merge conflict in ...`
- Cannot push or merge

**Solution:**

```bash
# Fetch latest
git fetch origin

# Rebase on main
git rebase origin/main

# Resolve conflicts manually, then:
git add .
git rebase --continue

# Or abort and try merge instead
git rebase --abort
git merge origin/main
```

### Detached HEAD state

**Symptoms:**

- `You are in 'detached HEAD' state`

**Solution:**

```bash
# Create a branch from current position
git checkout -b my-branch

# Or return to main
git checkout main
```

### Large files in git history

**Symptoms:**

- Slow clone/push
- `File is larger than 100MB`

**Solution:**

```bash
# Use Git LFS for large files
git lfs install
git lfs track "*.zip"
git lfs track "*.pdf"

# For existing large files, consider BFG Repo-Cleaner
# (requires force push - coordinate with team)
```

## Environment Issues

### Environment variables not loading

**Symptoms:**

- API returns 500 errors
- Missing API key errors

**Solution:**

```bash
# Check .dev.vars exists
cat apps/api/.dev.vars

# Required variables:
# OPENAI_API_KEY=sk-...
# OPENAI_BASE_URL=https://api.openai.com/v1 (optional)
# OPENAI_MODEL=gpt-4o-mini (optional)
```

### Wrong Node.js version

**Symptoms:**

- Syntax errors
- Package compatibility issues

**Solution:**

```bash
# Check Node version (requires 18+)
node --version

# Use nvm to switch
nvm install 20
nvm use 20

# Or use n
n 20
```

## Cloudflare Workers Issues

### Wrangler authentication

**Symptoms:**

- `Error: Authentication error`
- Cannot deploy

**Solution:**

```bash
# Login to Cloudflare
npx wrangler login

# Or set API token
export CLOUDFLARE_API_TOKEN=your_token
```

### KV namespace errors

**Symptoms:**

- `KV namespace not found`
- Binding errors

**Solution:**

```bash
# Check wrangler.toml for correct bindings
cat apps/api/wrangler.toml

# Create KV namespace if needed
npx wrangler kv:namespace create BLUEPRINTS
```

## Performance Issues

### Slow development server

**Symptoms:**

- Long startup time
- Slow hot reload

**Solution:**

```bash
# Clear caches
rm -rf node_modules/.cache
rm -rf apps/web/.vite
rm -rf apps/web/node_modules/.cache

# Restart server
npm run dev:all
```

### Slow tests

**Symptoms:**

- Tests take too long
- CI timeout

**Solution:**

```bash
# Run tests in parallel
npm run test:all -- --pool=threads

# Run only changed tests
npm test -- --changed

# Skip slow tests
npm test -- --exclude="**/*.slow.test.ts"
```

## Getting Help

### Check Documentation

1. [Development Workflow](./development-workflow.md) - Development process
2. [API Documentation](./api-documentation.md) - API reference
3. [Testing Procedures](./testing-procedures.md) - Testing guide
4. [Code Style Guidelines](./code-style-guidelines.md) - Coding standards

### Check Existing Issues

```bash
# Search open issues
gh issue list --search "your error message"

# Check closed issues for solutions
gh issue list --state closed --search "your error message"
```

### Create a New Issue

If you can't find a solution:

```bash
gh issue create --title "Brief description" --body "
## Description
What you were trying to do

## Steps to Reproduce
1. Step one
2. Step two

## Expected Behavior
What should happen

## Actual Behavior
What actually happened

## Environment
- Node version: $(node --version)
- npm version: $(npm --version)
- OS: $(uname -s)
"
```

---

_Last updated: 2026-02-20_
