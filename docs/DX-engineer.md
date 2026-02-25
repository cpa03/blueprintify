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
    "clean": "npm run clean --workspaces --if-present",
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
3. **Quality Scripts**: Ensure `typecheck`, `lint`, `test` are available
4. **Documentation**: Keep scripts documented in README

## Verification Checklist

When implementing DX improvements:

- [ ] Test scripts work in isolation
- [ ] Verify no breaking changes to existing scripts
- [ ] Update documentation if needed
- [ ] Create PR with DX-engineer label

## Known Issues

- TypeScript typecheck requires `npm install` to run first
- ESLint requires dependencies to be installed
- Some tests may fail in clean environment without build artifacts
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
