# DX Engineer - Longtime Memory

This document serves as the DX engineer's knowledge base for improving developer experience in the blueprintify project.

## Project Structure

- **Monorepo**: npm workspaces with `apps/*` and `packages/*`
- **Apps**:
  - `apps/api` - Cloudflare Workers (Hono)
  - `apps/web` - React frontend (Vite)
- **Packages**:
  - `packages/shared` - Shared types and Zod schemas

## NPM Scripts Standards

When adding new NPM scripts, follow these patterns:

### Root package.json Scripts

```json
{
  "scripts": {
    "lint": "eslint . --ext .ts,.tsx",
    "lint:fix": "eslint . --ext .ts,.tsx --fix",
    "clean:dist": "rm -rf apps/*/dist packages/*/dist",
    "reset": "npm run clean && rm -rf node_modules apps/*/node_modules packages/*/node_modules"
  }
}
```

### Workspace Scripts

Each workspace (apps/_, packages/_) should have a local clean script:

```json
{
  "scripts": {
    "clean": "rm -rf dist"
  }
}
```

## Common DX Improvements

1. **Build Scripts**: Add `clean` and `reset` scripts for cleanup
2. **Dev Scripts**: Add `dev:all` for running all apps in parallel
3. **Quality Scripts**: Ensure `typecheck`, `lint`, `lint:fix`, `test` are available
4. **Documentation**: Keep scripts documented in README

## Verification Checklist

When implementing DX improvements:

- [ ] Test scripts work in isolation
- [ ] Verify no breaking changes to existing scripts
- [ ] Update documentation if needed
- [ ] Create PR with DX-engineer label
KR|
## Test Scripts

When updating test scripts, ensure ALL workspaces are covered:

```json
{
  "scripts": {
    "test": "npm run test --workspace=apps/web -- --run",
    "test:all": "npm run test --workspace=apps/web -- --run && npm run test --workspace=apps/api && npm run test --workspace=packages/shared"
  }
}
```

Note: The `test:all` script should include ALL workspaces (apps/web, apps/api, packages/shared)

## Known Issues
- TypeScript typecheck requires `npm install` to run first
- ESLint requires dependencies to be installed
- Some tests may fail in clean environment without build artifacts
## VS Code Debugging Configuration

VS Code debugging is configured via `.vscode/launch.json` and `.vscode/tasks.json`:

### Launch Configurations

```json
{
  "configurations": [
    {
      "name": "Debug Frontend (Vite)",
      "type": "chrome",
      "request": "launch",
      "url": "http://localhost:3000"
    },
    {
      "name": "Debug API (Wrangler)",
      "type": "node",
      "runtimeExecutable": "npx",
      "runtimeArgs": ["wrangler", "dev", "--inspect-brk"]
    },
    {
      "name": "Debug Tests (Vitest)",
      "type": "node",
      "runtimeExecutable": "npx",
      "runtimeArgs": ["vitest", "run", "--inspect-brk"]
    }
  ]
}
```

### Debug Settings

Add these settings to `.vscode/settings.json` for better debugging experience:

```json
{
  "debug.openDebug": "openOnDebugBreak",
  "debug.inlineValues": true,
  "errorLens.enabled": true
}
```

## VS Code Recommended Extensions

When updating `.vscode/extensions.json`, include extensions organized by category:

### Current Recommendations (Updated Feb 2026)

```json
{
  "recommendations": [
    // TypeScript/JavaScript
    "dbaeumer.vscode-eslint",
    "esbenp.prettier-vscode",
    "ms-vscode.vscode-typescript-next",
    "yoavbls.pretty-ts-errors",
    // React
    "dsznajder.es7-react-js-snippets",
    "formulahendry.auto-rename-tag",
    // Debugging
    "ms-vscode.debugger-for-chrome",
    "ms-vscode.vscode-react-native",
    "PhilJesse.react-style-tag",
    // Error Handling
    "usernamehw.errorlens",
    // REST API
    "humao.rest-client",
    // Tailwind CSS
    "bradlc.vscode-tailwindcss",
    // Cloudflare Workers
    "cloudflare.cloudflare-workers",
    // Testing
    "vitest.explorer",
    // Markdown
    "yzhang.markdown-all-in-one",
    // Git
    "eamodio.gitlens",
    // Editor
    "editorconfig.editorconfig"
  ]
}
```

### Extension Categories

| Category | Extensions | Purpose |
|----------|-----------|----------|
| TypeScript/JS | eslint, prettier, typescript-next, pretty-ts-errors | Code quality |
| React | ES7 snippets, auto-rename-tag | Development speed |
| Debugging | debugger-for-chrome, vscode-react-native, react-style-tag | Browser/React debugging |
| Error Handling | errorlens | Inline error display |
| REST API | rest-client | API testing |
| Tailwind | tailwindcss-intellisense | Styling support |
| Cloudflare | cloudflare-workers | Workers-specific dev |
| Testing | vitest-explorer | Test running |
| Markdown | markdown-all-in-one | Docs editing |
| Git | gitlens | Version control |
| Editor | editorconfig | Consistency |

When updating `.vscode/extensions.json`, include extensions organized by category:

### Current Recommendations (Updated Feb 2026)

```json
{
  "recommendations": [
    // TypeScript/JavaScript
    "dbaeumer.vscode-eslint",
    "esbenp.prettier-vscode",
    "ms-vscode.vscode-typescript-next",
    "yoavbls.pretty-ts-errors",
    // React
    "dsznajder.es7-react-js-snippets",
    "formulahendry.auto-rename-tag",
    // Tailwind CSS
    "bradlc.vscode-tailwindcss",
    // Cloudflare Workers
    "cloudflare.cloudflare-workers",
    // Testing
    "vitest.explorer",
    // Markdown
    "yzhang.markdown-all-in-one",
    // Git
    "eamodio.gitlens",
    // Editor
    "editorconfig.editorconfig"
  ]
}
```

### Extension Categories

| Category | Extensions | Purpose |
|----------|-----------|----------|
| TypeScript/JS | eslint, prettier, typescript-next, pretty-ts-errors | Code quality |
| React | ES7 snippets, auto-rename-tag | Development speed |
| Tailwind | tailwindcss-intellisense | Styling support |
| Cloudflare | cloudflare-workers | Workers-specific dev |
| Testing | vitest-explorer | Test running |
| Markdown | markdown-all-in-one | Docs editing |
| Git | gitlens | Version control |
| Editor | editorconfig | Consistency |
## ESLint Configuration
When adding ESLint rules, follow these patterns:

### Console Statements

Use the `no-console` rule to prevent console statements in production:

```javascript
"no-console": [
  "warn",
  {
    "allow": ["error", "warn", "log"]
  }
]
```

This warns against `console.log` and `console.info` but allows `console.error`, `console.warn`, and `console.log` (for legitimate logging utilities like HTTP request loggers). Combined with Vite's production build configuration (which strips console.log/info/debug), this provides defense in depth.

- TypeScript typecheck requires `npm install` to run first
- ESLint requires dependencies to be installed
- Some tests may fail in clean environment without build artifacts
