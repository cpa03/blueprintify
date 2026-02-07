# Bug Report

> **Active bugs and errors found in the codebase**

## Format

- [ ] bug description
- [/] bug in progress
- [x] bug fixed

## Bugs Found

### Build/Dependency Issues

[x] ESLint not found - npm run lint fails - Fixed: installed eslint and created eslint.config.js
[x] Vitest not found - npm run test:api fails - Fixed: installed vitest
[x] Missing dependencies: hono, zod, react, framer-motion, openai, @uiw/react-codemirror, @codemirror/lang-markdown, @codemirror/theme-one-dark, react-markdown, clsx, @radix-ui/react-tabs, @blueprint/shared - Fixed: npm install

### TypeScript Configuration Issues

[x] apps/web/tsconfig.json has '--jsx' flag issue - causing JSX errors - Fixed: added jsx to root tsconfig.json
[x] Multiple implicit 'any' type errors across all frontend components - Fixed: dependencies installed
[x] Property 'captureStackTrace' does not exist on type 'ErrorConstructor' - Fixed: not an actual issue after deps installed

### Code Quality Issues

[x] Error type mismatch in apps/api/src/middleware/errorHandler.ts:31 - Fixed: imported ErrorType enum
[x] Hono Context typing issues with validatedData - Fixed: added proper type parameterization
[x] Multiple linting warnings (unused vars, unreachable code, unnecessary escapes) - Fixed: cleaned up code
[x] any type in retry.ts - Fixed: changed to unknown with type assertions

### Architectural Issues (NEW - 2026-02-06)

[x] **CRITICAL**: BaseController abstract class exists but NO controllers extend from it - apps/api/src/controllers/base.controller.ts created but GenerateController, RefineController, and TasksController all duplicate the createAIConfig method instead of extending BaseController - Fixed: Made all controllers extend BaseController, removed duplicate code, tests pass
[x] ESLint not installed again - npm run lint fails with "eslint: not found" - Fixed: dependencies installed, eslint working
[x] Dependencies need to be reinstalled after main merge - TypeScript cannot find modules (zod, hono, openai, react, etc.) - Fixed: npm install completed
[x] Fresh npm install completed on agent-workspace branch - all dependencies now available

### Console & Logging Issues (NEW - 2026-02-07)

[x] **ISSUE**: console.error in production API code - apps/api/src/middleware/errorHandler.ts:27 - This is acceptable for Cloudflare Workers logging
[x] **ISSUE**: console.error in frontend hook - apps/web/src/hooks/useBlueprintStream.ts:35 and :54 - Fixed: Removed console.error statements
[x] **ISSUE**: Overly broad retry logic - apps/api/src/utils/retry.ts:79 - Fixed: Now only retries specific transient network errors (ECONNRESET, ETIMEDOUT, ENOTFOUND, EAI_AGAIN, ECONNREFUSED)

### Browser Console Errors

[ ] No browser console errors detected yet - need to run the app to verify
