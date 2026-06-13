# Flexy Plan: Eliminate Hardcoded Values & Modularize

## Goal

Eliminate hardcoded values and build a modular, single-source-of-truth system.

### ✅ Flexy Iteration 22: Eliminate Remaining Hardcoded MIME Types in Test Files

| File                                | Change                                                                     |
| ----------------------------------- | -------------------------------------------------------------------------- |
| `apps/web/src/lib/security.test.ts` | Added `HTTP_HEADERS` import from `@blueprint/shared`                       |
| `apps/web/src/lib/security.test.ts` | Replaced 2 hardcoded `"text/plain"` with `HTTP_HEADERS.CONTENT_TYPE_PLAIN` |

## Verification

- ✅ `npm run typecheck` — clean
- ✅ `npm run lint` — zero warnings
- ✅ `npm run test:all` — 1,138 tests passing (593 web + 342 api + 203 shared) across 69 files

## Completed

### ✅ Shared Defaults (Pushed in PR #1401)

| File                            | Change                                           |
| ------------------------------- | ------------------------------------------------ |
| `packages/shared/src/config.ts` | Added `DEFAULT_URLS` + `SHARED_DEFAULTS`         |
| `packages/shared/src/index.ts`  | Exported new objects                             |
| `apps/api/src/config/env.ts`    | References shared defaults instead of hardcoding |
| `apps/web/src/config/env.ts`    | References shared defaults instead of hardcoding |

### ✅ CI Node Version (Not pushed - token restriction)

Changed `node-version: "20"` → `node-version-file: ".node-version"` in all 4 workflow files (11 occurrences). Recommended in PR.

### ✅ Script Config Centralization (Pushed in PR #1414)

| File                             | Change                                                    |
| -------------------------------- | --------------------------------------------------------- |
| `scripts/config.sh`              | **NEW** Centralized config for all scripts                |
| `scripts/deploy-api.sh`          | Extracted hardcoded URLs to `config.sh`                   |
| `scripts/fix-ci-node-version.sh` | Uses `node-version-file` approach, reads `.node-version`  |
| `scripts/brocula-hunt.mjs`       | Dynamic PROJECT_ROOT, PREVIEW_PORT, PREVIEW_HOST from env |

### ✅ Flexy Iteration 2: Eliminate Duplicated & Magic Number Configs

| File                                             | Change                                                                                    |
| ------------------------------------------------ | ----------------------------------------------------------------------------------------- |
| `packages/shared/src/config.ts`                  | Added `MINUTES_PER_HOUR` + `HOURS_PER_DAY` to `TIME_UNITS`                                |
| `apps/web/src/config/constants/accessibility.ts` | Removed `SECONDS_PER_MINUTE`/`MINUTES_PER_HOUR`/`HOURS_PER_DAY` (duplicated `TIME_UNITS`) |
| `apps/web/src/hooks/useLastSaved.ts`             | Uses `TIME_UNITS` from `@blueprint/shared` instead of local duplicates                    |
| `apps/web/src/config/constants/ui.ts`            | `ANIMATION` values now reference `ANIMATION_TIMING` from `theme.ts`                       |
| `apps/web/src/config/theme.ts`                   | Removed `SPRING_CONFIG` import (broke circular dependency); inlined spring vals           |
| `apps/api/src/config/constants.ts`               | Replaced magic numbers `86400`/`3600`/`60`/`30`/`300` with `TIME_UNITS` refs              |

## Verification

- ✅ `npm run typecheck` — clean
- ✅ `npm run lint` — zero warnings
- ✅ `npm run test:all` — 977 tests passing (64 test files)

## PRs

| PR #  | Branch                              | Title                                                                                        |
| ----- | ----------------------------------- | -------------------------------------------------------------------------------------------- |
| #1401 | `feat/flexy-eliminate-hardcoded-v2` | feat(flexy): eliminate hardcoded URLs with shared defaults                                   |
| #1414 | `feat/flexy-hardcoded-values-v3`    | feat(flexy): eliminate hardcoded values from scripts with centralized config                 |
| #1454 | `feat/flexy-iteration-4`            | feat(flexy): eliminate duplicated TIME_UNITS and magic numbers, deduplicate animation config |

### ✅ AI & Dev Defaults Centralization (v4 - This PR)

| File                                               | Change                                                                                                                 |
| -------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| `packages/shared/src/config.ts`                    | Added `AI_DEFAULTS` (OpenAI base URL, model, timeout, tokens, temperature) + `DEV_DEFAULTS` (ports, URLs for dev/test) |
| `packages/shared/src/index.ts`                     | Exported `AI_DEFAULTS`, `DEV_DEFAULTS`                                                                                 |
| `apps/api/src/config/env.ts`                       | References `AI_DEFAULTS`, `RETRY_CONFIG`, `TIME_UNITS` instead of hardcoded magic numbers                              |
| `apps/api/src/config/env.test.ts`                  | Uses `TEST_CORS_ORIGIN` constant, `TIME_UNITS` for assertions                                                          |
| `apps/api/src/test-utils.ts`                       | Uses `DEV_DEFAULTS.PLAYWRIGHT_TEST_URL` instead of hardcoded URL                                                       |
| `apps/api/src/utils/stream.test.ts`                | Uses `DEV_DEFAULTS` for CORS origin in config + assertion                                                              |
| `apps/api/src/controllers/base.controller.test.ts` | Mock references `AI_DEFAULTS` to stay in sync with shared config                                                       |
| `apps/web/vite.config.ts`                          | Uses `DEV_DEFAULTS` for port + proxy target                                                                            |
| `apps/web/playwright.config.ts`                    | Uses `DEV_DEFAULTS` for test server URL                                                                                |

## Verification

- ✅ `npm run typecheck` — clean
- ✅ `npm run lint` — zero warnings
- ✅ `npm run test:all` — all tests passing

## PRs

| PR #  | Branch                              | Title                                                                        |
| ----- | ----------------------------------- | ---------------------------------------------------------------------------- |
| #1401 | `feat/flexy-eliminate-hardcoded-v2` | feat(flexy): eliminate hardcoded URLs with shared defaults                   |
| #1414 | `feat/flexy-hardcoded-values-v3`    | feat(flexy): eliminate hardcoded values from scripts with centralized config |
| #1448 | `feat/flexy-eliminate-hardcoded-v4` | feat(flexy): centralize AI, dev, and retry defaults into shared config       |

### ✅ Flexy Iteration 5: Eliminate Remaining Magic Numbers & Centralize env.DEV

| File                                               | Change                                                                                              |
| -------------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| `packages/shared/src/config.ts`                    | Added `RATE_LIMIT_DEFAULTS`, `CIRCUIT_BREAKER_DEFAULTS`, `MAX_INPUT_LENGTH`, `PLAYWRIGHT_DEFAULTS`  |
| `packages/shared/src/index.ts`                     | Exported new constants                                                                              |
| `apps/api/src/config/env.ts`                       | Replaced magic numbers (10/60/120/5/3) with shared `RATE_LIMIT_DEFAULTS`/`CIRCUIT_BREAKER_DEFAULTS` |
| `apps/api/src/config/prompt-security.ts`           | References shared `MAX_INPUT_LENGTH` from `@blueprint/shared`                                       |
| `apps/web/src/config/constants/storage.ts`         | Added `STAGGER_MS` to `TOAST_CONFIG`                                                                |
| `apps/web/src/components/Toast.tsx`                | Removed hardcoded `TOAST_STAGGER_MS`, references `TOAST_CONFIG.STAGGER_MS`                          |
| `apps/web/src/config/theme.ts`                     | Added `SCROLL_PROGRESS_SPRING` config                                                               |
| `apps/web/src/components/ScrollProgress.tsx`       | Uses `SCROLL_PROGRESS_SPRING` instead of hardcoded spring values                                    |
| `apps/web/src/config/env.ts`                       | Added `isDev()` helper to centralize `import.meta.env.DEV`                                          |
| `apps/web/src/components/ErrorBoundary.tsx`        | Uses `isDev()` instead of `import.meta.env.DEV`                                                     |
| `apps/web/src/components/Editor.tsx`               | Uses `isDev()` instead of `import.meta.env.DEV`                                                     |
| `apps/web/src/components/LazyCodeMirror.tsx`       | Uses `isDev()` instead of `import.meta.env.DEV`                                                     |
| `apps/web/src/components/LazyMarkdownRenderer.tsx` | Uses `isDev()` instead of `import.meta.env.DEV`                                                     |

## Verification

- ✅ `npm run typecheck` — clean
- ✅ `npm run lint` — zero warnings
- ✅ `npm run test:all` — 977 tests passing (64 files)

### ✅ Flexy Iteration 6: Centralize Network Error Codes, CORS Defaults & Eliminate Hardcoded Test URLs

| File                                                         | Change                                                                                                  |
| ------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------- |
| `packages/shared/src/config.ts`                              | Added `NETWORK_ERROR_CODES` (ECONNRESET, ETIMEDOUT etc.) + `CORS_DEFAULTS` (allowed methods/headers)    |
| `packages/shared/src/index.ts`                               | Exported `NETWORK_ERROR_CODES`, `CORS_DEFAULTS`                                                         |
| `apps/api/src/config/constants.ts`                           | References shared `NETWORK_ERROR_CODES` + `CORS_DEFAULTS` instead of hardcoded arrays                   |
| `apps/web/src/integration/factories.ts`                      | Uses `HTTP_HEADERS.CONTENT_TYPE_JSON` instead of hardcoded `"application/json"`                         |
| `apps/web/src/integration/api-flows.test.ts`                 | 14 hardcoded `/api/*` URLs replaced with `API_BASE`+`API_ENDPOINTS`; 10 hardcoded Content-Type replaced |
| `apps/web/src/integration/cross-tab-concurrent.test.ts`      | 14 hardcoded `/api/*` URLs replaced with `API_BASE`+`API_ENDPOINTS`                                     |
| `apps/web/src/integration/performance-api.benchmark.test.ts` | 16 hardcoded `/api/*` URLs replaced; 5 hardcoded Content-Type replaced                                  |
| `apps/web/src/integration/refinement-export.test.ts`         | 14 hardcoded `/api/*` URLs replaced; 2 hardcoded Content-Type replaced                                  |

## Verification

- ✅ `npm run typecheck` — clean
- ✅ `npm run lint` — zero warnings
- ✅ `npm run build` — clean
- ✅ `npm run test:all` — 977 tests passing (558 web + 299 api + 120 shared)

### ✅ Flexy Iteration 7: Fix Type Errors + Replace Remaining Magic Numbers

| File                                   | Change                                                             |
| -------------------------------------- | ------------------------------------------------------------------ |
| `apps/api/src/middleware/authorize.ts` | Fix TS7053: type-assert `c.get("user") as User` for RBAC indexing  |
| `apps/api/src/routes/share.test.ts`    | Fix TS2769: add `Variables: AppVariables` to Hono generic          |
| `apps/api/src/config/constants.ts`     | `1024 * 1024` → `BYTE_CONVERSION.MB`                               |
| `apps/web/src/lib/security.ts`         | `1024 * 1024` → `BYTE_CONVERSION.MB`                               |
| `apps/web/vite.config.ts`              | `threshold: 1024` → `BYTE_CONVERSION.KB`                           |
| `apps/web/playwright.config.ts`        | Remove local `PLAYWRIGHT_CONFIG`, use shared `PLAYWRIGHT_DEFAULTS` |

## Verification

- ✅ `npm run typecheck` — clean (fixed 2 fatal type errors)
- ✅ `npm run lint` — zero warnings
- ✅ `npm run build` — clean
- ✅ `npm run test:all` — 977 tests passing (558 web + 299 api + 120 shared)

### ✅ Flexy Iteration 8: Add HTTP_METHODS Shared Constant + Eliminate Remaining Hardcoded Literals

| File                                | Change                                                                                                                  |
| ----------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| `packages/shared/src/config.ts`     | Added `HTTP_METHODS` (GET, POST, PUT, DELETE, PATCH)                                                                    |
| `packages/shared/src/index.ts`      | Exported `HTTP_METHODS`                                                                                                 |
| `apps/web/src/config/api-client.ts` | Replaced hardcoded `"POST"` with `HTTP_METHODS.POST`                                                                    |
| `apps/api/src/middleware/logger.ts` | Replaced hardcoded `"GET"` with `HTTP_METHODS.GET`                                                                      |
| `apps/api/src/utils/stream.test.ts` | Replaced `"text/event-stream"` with `SSE_HEADERS.CONTENT_TYPE`; `"Authorization"` with `CORS_DEFAULTS.ALLOW_HEADERS[1]` |
| `apps/web/src/lib/api.test.ts`      | Replaced hardcoded `"http://localhost:8787"` with `DEV_DEFAULTS.API_PROXY_TARGET`                                       |

## Verification

- ✅ `npm run typecheck` — clean
- ✅ `npm run lint` — zero warnings
- ✅ `npm run test:all` — 983 tests passing (564 web + 299 api + 120 shared)

### ✅ Flexy Iteration 9: Comprehensive Config Tests & Eliminate Hardcoded Test Strings

| File                                        | Change                                                                                                                                                                                                                                                                                                                                                   |
| ------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `packages/shared/src/config.test.ts`        | Added 61 comprehensive tests for 15 config objects: `DEFAULT_URLS`, `SHARED_DEFAULTS`, `AI_DEFAULTS`, `DEV_DEFAULTS`, `RATE_LIMIT_DEFAULTS`, `CIRCUIT_BREAKER_DEFAULTS`, `MAX_INPUT_LENGTH`, `BYTE_CONVERSION`, `PLAYWRIGHT_DEFAULTS`, `NETWORK_ERROR_CODES`, `CORS_DEFAULTS`, `HTTP_METHODS`, `ID_CHARS`, `ROUTE_PATHS`, `HTTP_STATUS`, `EXPORT_LIMITS` |
| `apps/api/src/middleware/validator.test.ts` | Replaced 10 hardcoded `"application/json"` with shared `HTTP_HEADERS.CONTENT_TYPE_JSON`                                                                                                                                                                                                                                                                  |
| `apps/api/src/routes/tasks.test.ts`         | Replaced 2 hardcoded `"application/json"` with shared `HTTP_HEADERS.CONTENT_TYPE_JSON`                                                                                                                                                                                                                                                                   |
| `apps/api/src/routes/share.test.ts`         | Replaced 5 hardcoded `"application/json"` with shared `HTTP_HEADERS.CONTENT_TYPE_JSON`                                                                                                                                                                                                                                                                   |

### ✅ Flexy Iteration 10: HTTP_HEADER_NAMES, Eliminate Hardcoded Methods/Status/CType in Tests

| File                                    | Change                                                                                                                       |
| --------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| `packages/shared/src/config.ts`         | Added `HTTP_HEADER_NAMES` (Content-Type, Cache-Control, Authorization, Connection, Accept, Content-Length, User-Agent, etc.) |
| `packages/shared/src/config.ts`         | Added `SHARE_DEFAULTS` (ID_LENGTH, EXPIRATION_DAYS, TITLE_MAX_LENGTH, BLUEPRINT_MAX_LENGTH)                                  |
| `packages/shared/src/config.ts`         | Added `BODY_SIZE_LIMITS` (DEFAULT_MB, STRICT_KB, LENIENT_MB)                                                                 |
| `packages/shared/src/index.ts`          | Exported `HTTP_HEADER_NAMES`, `SHARE_DEFAULTS`, `BODY_SIZE_LIMITS`                                                           |
| `apps/api/src/config/constants.ts`      | Replaced 12 hardcoded `"POST"/"GET"/"DELETE"` with `HTTP_METHODS` in `API_ENDPOINTS`                                         |
| `apps/api/src/config/constants.ts`      | `SHARE_CONFIG`/`BODY_SIZE_LIMITS` ref shared config instead of magic numbers                                                 |
| `apps/web/src/integration/factories.ts` | Replaced hardcoded `"Content-Type"`/`"Cache-Control"` header keys with `HTTP_HEADER_NAMES` computed properties               |
| `apps/web/src/lib/api.ts`               | Replaced hardcoded `"Content-Type"` header key with `HTTP_HEADER_NAMES.CONTENT_TYPE`                                         |
| `apps/api/src/**/*.test.ts` (10 files)  | Replaced ~88 hardcoded `"POST"/"GET"/"DELETE"` with `HTTP_METHODS.POST/GET/DELETE`                                           |
| `apps/web/src/**/*.test.ts` (6 files)   | Replaced ~68 hardcoded `"POST"/"GET"/"DELETE"` with `HTTP_METHODS.POST/GET/DELETE`                                           |
| `apps/api/src/utils/retry.test.ts`      | Replaced 12 hardcoded HTTP status codes with `HTTP_STATUS` constants                                                         |
| `apps/web/src/**/*.test.ts` (5 files)   | Replaced 22 hardcoded HTTP status codes with `HTTP_STATUS` constants                                                         |
| `apps/api/src/**/*.test.ts` (6 files)   | Replaced 42 hardcoded `"application/json"` with `HTTP_HEADERS.CONTENT_TYPE_JSON`                                             |
| `apps/api/src/utils/stream.test.ts`     | Replaced `"no-cache"`/`"keep-alive"` with `SSE_HEADERS.CACHE_CONTROL`/`SSE_HEADERS.CONNECTION`                               |
| `apps/web/src/lib/api.test.ts`          | Mock constants now reference hoisted shared variables instead of hardcoded strings                                           |

## Verification

- ✅ `npm run typecheck` — clean
- ✅ `npm run lint` — zero warnings
- ✅ `npm run build` — clean
- ✅ `npm run test:all` — 1,063 tests passing (564 web + 318 api + 181 shared) across 66 files

## PRs

| PR #  | Branch                                      | Title                                                                                                              |
| ----- | ------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| #1401 | `feat/flexy-eliminate-hardcoded-v2`         | feat(flexy): eliminate hardcoded URLs with shared defaults                                                         |
| #1414 | `feat/flexy-hardcoded-values-v3`            | feat(flexy): eliminate hardcoded values from scripts with centralized config                                       |
| #1448 | `feat/flexy-eliminate-hardcoded-v4`         | feat(flexy): centralize AI, dev, and retry defaults into shared config                                             |
| #1454 | `feat/flexy-iteration-4`                    | feat(flexy): eliminate duplicated TIME_UNITS and magic numbers, deduplicate animation config                       |
| #1509 | `feat/flexy-iteration-8`                    | feat(flexy): add HTTP_METHODS shared constant and eliminate remaining hardcoded string literals                    |
| TBD   | `feat/flexy-iteration-9-config-tests`       | feat(flexy): add comprehensive shared config tests and eliminate hardcoded test strings                            |
| TBD   | `feat/flexy-iteration-10`                   | feat(flexy): add HTTP_HEADER_NAMES, eliminate hardcoded methods/status/CType in tests                              |
| TBD   | `feat/flexy-iteration-11-mime-cors-headers` | feat(flexy): add CONTENT_TYPE_ZIP, CORS header names to shared config, eliminate remaining hardcoded test literals |

### ✅ Flexy Iteration 11: Add CONTENT_TYPE_ZIP & CORS Header Names to Shared Config

| File                                                 | Change                                                                                           |
| ---------------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| `packages/shared/src/config.ts`                      | Added `CONTENT_TYPE_ZIP/HTML/PLAIN` to `HTTP_HEADERS` + CORS header names to `HTTP_HEADER_NAMES` |
| `packages/shared/src/config.test.ts`                 | Added 7 tests for new `HTTP_HEADERS` MIME types + `HTTP_HEADER_NAMES` CORS headers               |
| `apps/api/src/config/constants.ts`                   | `SSE_CORS_HEADERS` now references shared `HTTP_HEADER_NAMES` (deduplicated)                      |
| `apps/api/src/utils/stream.test.ts`                  | Replaced `"GET"/"POST"` with `HTTP_METHODS`, CORS strings with `SSE_CORS_HEADERS`                |
| `apps/web/src/integration/refinement-export.test.ts` | Replaced `"application/zip"` with `HTTP_HEADERS.CONTENT_TYPE_ZIP` (2 occurrences)                |

## Verification

- ✅ `npm run typecheck` — clean
- ✅ `npm run lint` — zero warnings
- ✅ `npm run test:all` — 1,069 tests passing (564 web + 318 api + 187 shared) across 66 files

### ✅ Flexy Iteration 12: Centralize Preview, Observability, Queue, Python, & CSP Domain Configs

| File                             | Change                                                                                                                                                                                                                                           |
| -------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `packages/shared/src/config.ts`  | Added `PREVIEW_DEFAULTS` (preview port/host/URL), `OBSERVABILITY_DEFAULTS` (sampling rates, CPU limit), `QUEUE_DEFAULTS` (batch size, timeout, retries), `PYTHON_DEV_DEFAULTS` (dev port/host), `CSP_CONNECT_DOMAINS` (known deployment domains) |
| `packages/shared/src/index.ts`   | Exported 5 new config objects                                                                                                                                                                                                                    |
| `scripts/brocula-lighthouse.mjs` | Replaced hardcoded `http://localhost:4173` with env vars + defaults (`PREVIEW_PORT`, `PREVIEW_HOST`, `PREVIEW_URL`)                                                                                                                              |

## Verification

- ✅ `npm run typecheck` — clean
- ✅ `npm run lint` — zero warnings
- ✅ `npm run test:all` — 1,069 tests passing (564 web + 318 api + 187 shared) across 66 files

### ✅ Flexy Iteration 13: CI Node Version via .node-version + .dev.vars.example Comments

| File                                             | Change                                                                                                |
| ------------------------------------------------ | ----------------------------------------------------------------------------------------------------- |
| `.github/workflows/iterate.yml` (5 occurrences)  | `node-version: "20"` → `node-version-file: ".node-version"`                                           |
| `.github/workflows/parallel.yml` (4 occurrences) | `node-version: "20"` → `node-version-file: ".node-version"`                                           |
| `.github/workflows/on-pull.yml`                  | `node-version: 20` → `node-version-file: ".node-version"`                                             |
| `.github/workflows/pr-gatekeeper.yml`            | `node-version: "20"` → `node-version-file: ".node-version"`                                           |
| `.github/workflows/pr-gatekeeper.yml`            | Fixed hardcoded `node-version: "20"` to use `node-version-file` (11 total occurrences across 4 files) |
| `apps/api/.dev.vars.example`                     | Added Flexy comments linking each var group to its `@blueprint/shared` source of truth                |

## Verification

- ✅ `npm run typecheck` — clean
- ✅ `npm run lint` — zero warnings
- ✅ `npm run test:all` — 1,082 tests passing (564 web + 331 api + 187 shared) across 66 files

## Status

**✅ COMPLETED - 13 iterations done**

### ✅ Flexy Iteration 14: Centralize Security & API Headers into Shared HTTP_HEADER_NAMES

| File                                     | Change                                                                                               |
| ---------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| `packages/shared/src/config.ts`          | Added 18 new header names to `HTTP_HEADER_NAMES` (tracing, streaming, rate-limit, security, CORS)    |
| `packages/shared/src/config.test.ts`     | Added 4 test blocks for new header name categories                                                   |
| `apps/api/src/config/constants.ts`       | 12 `API_HEADERS` entries now reference `HTTP_HEADER_NAMES` instead of hardcoded strings              |
| `apps/api/src/middleware/logger.test.ts` | Replaced `"x-request-id"`/`"x-response-time"`/`"cf-ray"` with `API_HEADERS` refs                     |
| `apps/api/src/middleware/logger.test.ts` | Replaced `"POST"`/`"Content-Type"`/`"application/json"` with `HTTP_METHODS`/`HTTP_HEADER_NAMES` refs |
| `apps/api/src/middleware/logger.test.ts` | Fixed 6 TS7006 type errors (implicit `any`) + 2 lint warnings (unused vars)                          |
| `apps/api/src/utils/stream.test.ts`      | Replaced `"X-Accel-Buffering"`/`"Content-Type"` with `API_HEADERS`/`HTTP_HEADER_NAMES` refs          |
| `apps/web/src/config/security.ts`        | 7 security header keys now use `HTTP_HEADER_NAMES` computed properties                               |

## Verification

- ✅ `npm run typecheck` — clean (fixed 6 TS7006 errors)
- ✅ `npm run lint` — zero warnings (fixed 2 unused var warnings)
- ✅ `npm run build` — clean
- ✅ `npm run test:all` — 1,130 tests passing (585 web + 342 api + 203 shared) across 68 files

**✅ COMPLETED - 16 iterations done**

### ✅ Flexy Iteration 17: Complete HTTP_HEADER_NAMES Coverage + Eliminate Remaining Hardcoded Header/Security Strings

| File                                     | Change                                                                                                                                                                                    |
| ---------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `packages/shared/src/config.ts`          | Added `AUTHORIZATION_LC`, `COOKIE_LC`, `X_REQUEST_ID_LC`, `CF_RAY_LC` lowercase header variants + `CLOUDFLARE_CACHE_CONTROL`, `CDN_CACHE_CONTROL` CDN header names to `HTTP_HEADER_NAMES` |
| `packages/shared/src/config.test.ts`     | Added 6 tests for new lowercase/CDN header names                                                                                                                                          |
| `apps/api/src/config/constants.ts`       | `CUSTOM.REQUEST_ID`, `CF_PROPERTIES.RAY_ID`, `CDN` headers, `LOGGER_CONFIG.SANITIZED_HEADER_EXCLUDE` now reference shared `HTTP_HEADER_NAMES` instead of hardcoded strings                |
| `apps/web/src/config/security.ts`        | 5 `SECURITY_HEADERS` values (`nosniff`, `DENY`, `1; mode=block`, `strict-origin`, HSTS) now reference shared `SECURITY_VALUES`                                                            |
| `apps/api/src/middleware/logger.test.ts` | Hardcoded `"authorization"`/`"cookie"` replaced with `HTTP_HEADER_NAMES.AUTHORIZATION_LC`/`COOKIE_LC`                                                                                     |
| `apps/api/src/routes/storage.test.ts`    | Hardcoded `"storage:quota"` replaced with `STORAGE_KV_CONFIG.QUOTA_KEY` computed property                                                                                                 |
| `apps/api/src/services/prompts.test.ts`  | Hardcoded `"<user_input>"`/`"</user_input>"` replaced with `PROMPT_INPUT_CONFIG.USER_DELIMITER_START`/`_END` refs                                                                         |

### ✅ Flexy Iteration 21: Centralize Playwright config, template ports, env names & browser quota codes

| File                                        | Change                                                                                                                                                                                      |
| ------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `packages/shared/src/config.ts`             | Added `PLAYWRIGHT_CONFIG` (VIEWPORT, CI_RETRIES, CI_WORKERS), `TEMPLATE_NODE_PORT`, `ENVIRONMENT_NAMES` (PRODUCTION/DEVELOPMENT/STAGING/TEST), `BROWSER_QUOTA_ERROR_CODES` (CHROME/FIREFOX) |
| `packages/shared/src/index.ts`              | Exported 4 new config objects                                                                                                                                                               |
| `apps/web/playwright.config.ts`             | Replaced hardcoded `{ width: 1280, height: 720 }` with `PLAYWRIGHT_CONFIG.VIEWPORT`; `process.env.CI ? 2` → `CI_RETRIES`; `process.env.CI ? 1` → `CI_WORKERS`                               |
| `apps/web/src/lib/templates/node.ts`        | Replaced hardcoded `PORT = process.env.PORT \|\| 3000` (Express + basic) with `TEMPLATE_NODE_PORT`                                                                                          |
| `apps/web/src/config/constants/storage.ts`  | Replaced `BROWSER_QUOTA_ERROR_CODES: { CHROME: 22, FIREFOX: 1014 }` with shared `SHARED_BROWSER_QUOTA_ERROR_CODES`                                                                          |
| `apps/api/src/middleware/rateLimit.test.ts` | Replaced hardcoded `"production"` with `ENVIRONMENT_NAMES.PRODUCTION`                                                                                                                       |

## Verification

- ✅ `npm run typecheck` — clean
- ✅ `npm run lint` — zero warnings
- ✅ `npm run test:all` — 1,130 tests passing (585 web + 342 api + 203 shared) across 68 files

## PRs

| PR # | Branch                                      | Title                                                                                      |
| ---- | ------------------------------------------- | ------------------------------------------------------------------------------------------ |
| TBD  | `feat/flexy-iteration-21-hardcoded-cleanup` | feat(flexy): centralize playwright config, template ports, env names & browser quota codes |

## PRs

| #1610 | `feat/flexy-iteration-17-header-names-complete` | feat(flexy): complete HTTP_HEADER_NAMES coverage and eliminate remaining hardcoded header/security strings |

### ✅ Flexy Iteration 19: Eliminate Remaining Hardcoded HTTP Status Codes in Integration Factories

| File                                    | Change                                                                                  |
| --------------------------------------- | --------------------------------------------------------------------------------------- |
| `apps/web/src/integration/factories.ts` | Added `HTTP_STATUS` import; replaced `status = 200` default param with `HTTP_STATUS.OK` |
| `apps/web/src/integration/factories.ts` | Replaced hardcoded `status: 200` in `createMockStreamResponse` with `HTTP_STATUS.OK`    |

## Verification

- ✅ `npm run typecheck` — clean
- ✅ `npm run lint` — zero warnings
- ✅ `npm run test:all` — 1,130 tests passing (585 web + 342 api + 203 shared) across 68 files

### ✅ Flexy Iteration 20: Eliminate Hardcoded Header Strings & HTTP Status Codes in Tests

| File                                        | Change                                                                                        |
| ------------------------------------------- | --------------------------------------------------------------------------------------------- |
| `apps/api/src/utils/stream.test.ts`         | Replaced `"Cache-Control"`/`"Connection"` with `HTTP_HEADER_NAMES.CACHE_CONTROL`/`CONNECTION` |
| `apps/api/src/middleware/rateLimit.test.ts` | Added `HTTP_STATUS` import from shared config                                                 |
| `apps/api/src/middleware/rateLimit.test.ts` | Replaced 10x `toBe(200)` with `toBe(HTTP_STATUS.OK)`                                          |
| `apps/api/src/middleware/rateLimit.test.ts` | Replaced 4x `toBe(429)` with `toBe(HTTP_STATUS.TOO_MANY_REQUESTS)`                            |
| `apps/api/src/middleware/rateLimit.test.ts` | Replaced `toBe(503)` with `toBe(HTTP_STATUS.SERVICE_UNAVAILABLE)`                             |

## Verification

- ✅ `npm run typecheck` — clean
- ✅ `npm run lint` — zero warnings
- ✅ `npm run test:all` — 1,130 tests passing (585 web + 342 api + 203 shared) across 68 files

### ✅ Flexy Iteration 23: Document Hardcoded Values in wrangler.toml & CI Node Version Findings

| File                     | Change                                                                                                            |
| ------------------------ | ----------------------------------------------------------------------------------------------------------------- |
| `apps/api/wrangler.toml` | Added 3 `Flexy says` comment blocks linking queue, observability, rate limit values to `@blueprint/shared` config |
| `docs/flexy-plan.md`     | Documented CI node-version findings (cannot push - GitHub App lacks `workflows` permission)                       |

### ⏳ CI Node Version — Identified but Blocked

**Finding**: 11 occurrences of hardcoded `node-version: "20"` across 4 CI workflow files.
`.node-version` specifies Node 22. `engines.node >= 22` in package.json.

| File                                  | Occurrences             |
| ------------------------------------- | ----------------------- |
| `.github/workflows/iterate.yml`       | 5x `node-version: "20"` |
| `.github/workflows/parallel.yml`      | 4x `node-version: "20"` |
| `.github/workflows/on-pull.yml`       | 1x `node-version: 20`   |
| `.github/workflows/pr-gatekeeper.yml` | 1x `node-version: "20"` |

**Fix**: Replace all with `node-version-file: ".node-version"`.

**Status**: ❌ Cannot push — GitHub App token lacks `workflows` permission to modify `.github/workflows/*.yml` files. Apply manually via branch with a PAT that has `workflows` scope.

## Verification

- ✅ `npm run typecheck` — clean
- ✅ `npm run lint` — zero warnings
- ✅ `npm run build` — clean

## PRs

| PR # | Branch                          | Title                                                                         |
| ---- | ------------------------------- | ----------------------------------------------------------------------------- |
| TBD  | `feat/flexy-ci-node-version-v2` | feat(flexy): add wrangler.toml Flexy comments linking values to shared config |

### ✅ Flexy Iteration 24: Centralize UI Display Strings into Shared UI_STRINGS Config

| File                                               | Change                                                                               |
| -------------------------------------------------- | ------------------------------------------------------------------------------------ |
| `packages/shared/src/config.ts`                    | Added `UI_STRINGS` (LOADING_EDITOR, LOADING_PREVIEW, UNPARSABLE_BODY)                |
| `packages/shared/src/index.ts`                     | Exported `UI_STRINGS`                                                                |
| `packages/shared/src/config.test.ts`               | Added 4 tests for `UI_STRINGS` (values + type check)                                 |
| `apps/web/src/config/constants/content.ts`         | Added `LOADING_MESSAGES` re-export referencing `UI_STRINGS` from `@blueprint/shared` |
| `apps/web/src/components/LazyCodeMirror.tsx`       | Replaced hardcoded `"Loading editor..."` with `{LOADING_MESSAGES.EDITOR}`            |
| `apps/web/src/components/LazyMarkdownRenderer.tsx` | Replaced hardcoded `"Loading preview..."` with `{LOADING_MESSAGES.PREVIEW}`          |
| `apps/api/src/config/constants.ts`                 | Replaced `"[unparsable]"` literal with `UI_STRINGS.UNPARSABLE_BODY` reference        |

## Verification

- ✅ `npm run typecheck` — clean
- ✅ `npm run lint` — zero warnings
- ✅ `npm run build` — clean
- ✅ `npm run test:all` — 1,142 tests passing (593 web + 342 api + 207 shared) across 69 files

### ✅ Flexy Iteration 25: Centralize Prompt Delimiters, Auth Defaults, Context Keys & Response Status Strings

| File                                          | Change                                                                                                                                                                                                                              |
| --------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `packages/shared/src/config.ts`               | Added `PROMPT_DELIMITERS` (USER_INPUT_START, USER_INPUT_END)                                                                                                                                                                        |
| `packages/shared/src/config.ts`               | Added `AUTH_DEFAULTS` (DEFAULT_ROLE, ADMIN_ROLE, ANONYMOUS_USER_ID, USER_CONTEXT_KEY, DEFAULT_USER_ROLE)                                                                                                                            |
| `packages/shared/src/config.ts`               | Added `CONTEXT_KEYS` (REQUEST_ID, VALIDATED_DATA, USER) for Hono c.set/c.get                                                                                                                                                        |
| `packages/shared/src/config.ts`               | Added `RESPONSE_STATUS` (OK, ERROR) for API JSON responses                                                                                                                                                                          |
| `packages/shared/src/index.ts`                | Exported 4 new config objects                                                                                                                                                                                                       |
| `packages/shared/src/config.test.ts`          | Added 10 tests covering all 4 new config objects (values + type checks)                                                                                                                                                             |
| `apps/api/src/config/constants.ts`            | `PROMPT_INPUT_CONFIG.USER_DELIMITER_START/_END` now reference shared `PROMPT_DELIMITERS`                                                                                                                                            |
| `apps/api/src/middleware/auth.ts`             | `defaultRole` uses `AUTH_DEFAULTS.DEFAULT_ROLE`; `"anonymous"` fallback → `AUTH_DEFAULTS.ANONYMOUS_USER_ID`; `"admin"/"user"` role checks → `AUTH_DEFAULTS.ADMIN_ROLE`/`DEFAULT_ROLE`; `c.set("user")` → `c.set(CONTEXT_KEYS.USER)` |
| `apps/api/src/middleware/authorize.ts`        | `ROLE_HIERARCHY` keys use `AUTH_DEFAULTS.DEFAULT_ROLE`/`ADMIN_ROLE`; `c.get("user")` → `c.get(CONTEXT_KEYS.USER)`                                                                                                                   |
| `apps/api/src/middleware/errorHandler.ts`     | `c.get("requestId")` → `c.get(CONTEXT_KEYS.REQUEST_ID)` (2 occurrences)                                                                                                                                                             |
| `apps/api/src/middleware/logger.ts`           | `c.set("requestId")` → `c.set(CONTEXT_KEYS.REQUEST_ID)`                                                                                                                                                                             |
| `apps/api/src/middleware/validator.ts`        | `c.set("validatedData")` → `c.set(CONTEXT_KEYS.VALIDATED_DATA)`                                                                                                                                                                     |
| `apps/api/src/controllers/base.controller.ts` | `c.get("validatedData")` → `c.get(CONTEXT_KEYS.VALIDATED_DATA)`                                                                                                                                                                     |
| `apps/api/src/index.ts`                       | Warmup endpoint `status: "ok"` → `status: RESPONSE_STATUS.OK`                                                                                                                                                                       |

## Verification

- ✅ `npm run typecheck` — clean
- ✅ `npm run lint` — zero warnings
- ✅ `npm run test:all` — 1,156 tests passing (593 web + 342 api + 221 shared) across 69 files

### ✅ Flexy Iteration 26: Eliminate Remaining Hardcoded Strings & Document CI Node-Version

| File                               | Change                                                                  |
| ---------------------------------- | ----------------------------------------------------------------------- |
| `apps/api/src/config/constants.ts` | `ANONYMOUS_CLIENT_KEY: "anonymous"` → `AUTH_DEFAULTS.ANONYMOUS_USER_ID` |

**Summary**: Replaced remaining hardcoded `"anonymous"` string with shared `AUTH_DEFAULTS.ANONYMOUS_USER_ID`. CI node-version fix identified but blocked.

### ⏳ CI Node Version — Identified but Blocked (persists)

11 occurrences of hardcoded `node-version: "20"` across 4 CI workflow files:

- `.github/workflows/iterate.yml` (5x)
- `.github/workflows/parallel.yml` (4x)
- `.github/workflows/on-pull.yml` (1x)
- `.github/workflows/pr-gatekeeper.yml` (1x)

**Fix**: Replace all with `node-version-file: ".node-version"`.
**Status**: ❌ PUSH REJECTED — GitHub App token lacks `workflows` permission. Apply via PAT with `workflows` scope.

## Verification

- ✅ `npm run typecheck` — clean
- ✅ `npm run lint` — zero warnings
- ✅ `npm run build` — clean
- ✅ `npm run test:all` — 1,159 tests passing (596 web + 342 api + 221 shared) across 69 files

## PR

| PR # | Branch                                      | Title                                                                  |
| ---- | ------------------------------------------- | ---------------------------------------------------------------------- |
| TBD  | `feat/flexy-iteration-26-hardcoded-cleanup` | feat(flexy): eliminate remaining hardcoded strings in config constants |

### ✅ Flexy Iteration 27: Centralize Permissions-Policy values & CDN cache format

| File                                 | Change                                                                                           |
| ------------------------------------ | ------------------------------------------------------------------------------------------------ |
| `packages/shared/src/config.ts`      | Added `PERMISSIONS_POLICY` to `SECURITY_VALUES` (8 Permissions-Policy directive values)          |
| `packages/shared/src/config.test.ts` | Added 3 test blocks for `PERMISSIONS_POLICY` (values, uniqueness, pattern validation)            |
| `apps/web/src/config/security.ts`    | `SECURITY_HEADERS` Permissions-Policy now references `SECURITY_VALUES.PERMISSIONS_POLICY.*`      |
| `apps/api/src/index.ts`              | CDN cache headers use `API_HEADERS.CACHE_CONTROL.PUBLIC_MAX_AGE()` instead of hardcoded template |
| `apps/api/src/config/constants.ts`   | Removed unused `CDN_MAX_AGE_FORMAT` (replaced by `PUBLIC_MAX_AGE` function)                      |

## Verification

- ✅ `npm run typecheck` — clean
- ✅ `npm run lint` — zero warnings
- ✅ `npm run build` — clean
- ✅ `npm run test:all` — 1,162 tests passing (596 web + 342 api + 224 shared) across 69 files

## PR

| PR #  | Branch                                    | Title                                                                   |
| ----- | ----------------------------------------- | ----------------------------------------------------------------------- |
| #1690 | `feat/flexy-iteration-27-permissions-cdn` | feat(flexy): centralize Permissions-Policy values and CDN cache headers |

### ✅ Flexy Iteration 28: Centralize ERROR_CODES into Shared Config & Eliminate Hardcoded Error Code Strings

| File                                           | Change                                                                                             |
| ---------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| `packages/shared/src/config.ts`                | Added `ERROR_CODES` with 12 API error response codes (`VALIDATION_ERROR`, `NOT_FOUND_ERROR`, etc.) |
| `packages/shared/src/index.ts`                 | Exported `ERROR_CODES`                                                                             |
| `packages/shared/src/config.test.ts`           | Added 3 test blocks (value matching, type check, uniqueness)                                       |
| `apps/api/src/config/constants.ts`             | Re-export `ERROR_CODES` from `@blueprint/shared` instead of local definition                       |
| `apps/api/src/errors.ts`                       | Replaced 6 hardcoded `"VALIDATION_ERROR"`/`"AUTHENTICATION_ERROR"`/etc. with `ERROR_CODES.*` refs  |
| `apps/api/src/middleware/validator.test.ts`    | Replaced hardcoded `"VALIDATION_ERROR"` with `ERROR_CODES.VALIDATION_ERROR`                        |
| `apps/api/src/middleware/errorHandler.test.ts` | Replaced 3 hardcoded error code strings with `ERROR_CODES.*` refs                                  |
| `apps/api/src/middleware/auth.test.ts`         | Replaced hardcoded `"AUTHENTICATION_ERROR"` with `ERROR_CODES.AUTHENTICATION_ERROR`                |
| `apps/api/src/routes/generate.test.ts`         | Replaced hardcoded `"CONFIGURATION_ERROR"` with `ERROR_CODES.CONFIGURATION_ERROR`                  |
| `apps/api/src/routes/share.test.ts`            | Replaced 5 hardcoded error code strings with `ERROR_CODES.*` refs                                  |

## Verification

- ✅ `npm run typecheck` — clean
- ✅ `npm run lint` — zero warnings
- ✅ `npm run build` — clean
- ✅ `npm run test:all` — 1,165 tests passing (596 web + 342 api + 227 shared) across 69 files

## PR

| PR #  | Branch                                    | Title                                                                                             |
| ----- | ----------------------------------------- | ------------------------------------------------------------------------------------------------- |
| #1690 | `feat/flexy-iteration-27-permissions-cdn` | feat(flexy): centralize Permissions-Policy values and CDN cache headers                           |
| TBD   | `feat/flexy-error-codes-shared`           | feat(flexy): centralize ERROR_CODES into shared config and eliminate hardcoded error code strings |

### ✅ Flexy Iteration 29: Eliminate Remaining Hardcoded Role Strings in Routes & Tests

| File                                | Change                                                                                                  |
| ----------------------------------- | ------------------------------------------------------------------------------------------------------- |
| `apps/api/src/routes/share.ts`      | Added `AUTH_DEFAULTS` import; replaced `authorize("user")` with `authorize(AUTH_DEFAULTS.DEFAULT_ROLE)` |
| `apps/api/src/routes/share.test.ts` | Added `AUTH_DEFAULTS`, `CONTEXT_KEYS` import; replaced `role: "user"` with `AUTH_DEFAULTS.DEFAULT_ROLE` |
| `apps/api/src/routes/share.test.ts` | Replaced `c.set("user", user)` with `c.set(CONTEXT_KEYS.USER, user)`                                    |

## Verification

- ✅ `npm run typecheck` — clean
- ✅ `npm run lint` — zero warnings
- ✅ `npm run test:all` — 1,166 tests passing (596 web + 342 api + 228 shared) across 69 files

## PRs

| PR #  | Branch                                    | Title                                                                                             |
| ----- | ----------------------------------------- | ------------------------------------------------------------------------------------------------- |
| #1690 | `feat/flexy-iteration-27-permissions-cdn` | feat(flexy): centralize Permissions-Policy values and CDN cache headers                           |
| TBD   | `feat/flexy-error-codes-shared`           | feat(flexy): centralize ERROR_CODES into shared config and eliminate hardcoded error code strings |

### ✅ Flexy Iteration 29: Eliminate Remaining Hardcoded Role Strings in Routes & Tests

| File                                | Change                                                                                                  |
| ----------------------------------- | ------------------------------------------------------------------------------------------------------- |
| `apps/api/src/routes/share.ts`      | Added `AUTH_DEFAULTS` import; replaced `authorize("user")` with `authorize(AUTH_DEFAULTS.DEFAULT_ROLE)` |
| `apps/api/src/routes/share.test.ts` | Added `AUTH_DEFAULTS`, `CONTEXT_KEYS` import; replaced `role: "user"` with `AUTH_DEFAULTS.DEFAULT_ROLE` |
| `apps/api/src/routes/share.test.ts` | Replaced `c.set("user", user)` with `c.set(CONTEXT_KEYS.USER, user)`                                    |

## Verification

- ✅ `npm run typecheck` — clean
- ✅ `npm run lint` — zero warnings
- ✅ `npm run test:all` — 1,166 tests passing (596 web + 342 api + 228 shared) across 69 files

### ✅ Flexy Iteration 30: Eliminate Remaining Hardcoded HTTP Status Codes & Magic Numbers in Test Files

| File                                                    | Change                                                                                                                                                         |
| ------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `apps/api/src/routes/generate.test.ts`                  | Added `HTTP_STATUS` import; replaced 4 hardcoded status codes (400×2, 200, 500) with `HTTP_STATUS.*` refs                                                      |
| `apps/api/src/routes/refine.test.ts`                    | Added `HTTP_STATUS` import; replaced 2 hardcoded status codes (400, 200)                                                                                       |
| `apps/api/src/routes/share.test.ts`                     | Added `HTTP_STATUS` import; replaced 10 hardcoded status codes (200×5, 400×3, 404, 403)                                                                        |
| `apps/api/src/routes/import.test.ts`                    | Added `HTTP_STATUS` import; replaced 9 hardcoded status codes (400×5, 200×4)                                                                                   |
| `apps/api/src/routes/tasks.test.ts`                     | Added `HTTP_STATUS` import; replaced 2 hardcoded status codes (400, 200)                                                                                       |
| `apps/api/src/routes/export.test.ts`                    | Added `HTTP_STATUS` import; replaced 8 hardcoded status codes (400×4, 200×4)                                                                                   |
| `apps/api/src/routes/storage.test.ts`                   | Added `HTTP_STATUS, STORAGE_CONFIG, BYTE_CONVERSION` imports; replaced 8 status codes + magic numbers                                                          |
| `apps/api/src/middleware/auth.test.ts`                  | Added `HTTP_STATUS` import; replaced 14 hardcoded status codes (200×8, 401×5, 503)                                                                             |
| `apps/api/src/middleware/errorHandler.test.ts`          | Added `HTTP_STATUS` import; replaced 9 hardcoded status codes (400, 401, 404×3, 500×3, 503)                                                                    |
| `apps/api/src/middleware/logger.test.ts`                | Added `HTTP_STATUS` to import; replaced 2 hardcoded status codes (200×2)                                                                                       |
| `apps/api/src/middleware/validator.test.ts`             | Added `HTTP_STATUS` to import; replaced 10 hardcoded status codes (200×2, 400×8)                                                                               |
| `apps/api/src/integration/m2-workflows.test.ts`         | Added `HTTP_STATUS` to import; replaced 13 hardcoded status codes (200×11, 400×2)                                                                              |
| `apps/api/src/utils/circuitBreaker.test.ts`             | Added `HTTP_STATUS` import; replaced 1 hardcoded status code (503)                                                                                             |
| `apps/web/src/integration/api-flows.test.ts`            | Replaced 1 hardcoded status code (400) — import already existed                                                                                                |
| `apps/web/src/integration/refinement-export.test.ts`    | Replaced 1 hardcoded status code (400) — import already existed                                                                                                |
| `apps/web/src/integration/cross-tab-concurrent.test.ts` | Replaced 1 hardcoded status code (400) — import already existed                                                                                                |
| `apps/api/src/routes/storage.test.ts`                   | `5*1024*1024` → `STORAGE_CONFIG.QUOTA_BYTES`; `1048576` → `BYTE_CONVERSION.MB`; `5242880` → `STORAGE_CONFIG.QUOTA_BYTES`; `2097152` → `BYTE_CONVERSION.MB * 2` |

## Verification

- ✅ `npm run typecheck` — clean
- ✅ `npm run lint` — zero warnings
- ✅ `npm run test:all` — 1,166 tests passing (596 web + 342 api + 228 shared) across 69 files

### ✅ Flexy Iteration 31: Replace Hardcoded z-index & Editor Tab Strings with Constants

| File                                               | Change                                                                                          |
| -------------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| `apps/web/src/components/editor/EditorHeader.tsx`  | Added `Z_INDEX` import; replaced `zIndex: -1` with `Z_INDEX.hide`                               |
| `apps/web/src/components/editor/EditorToolbar.tsx` | Added `Z_INDEX` import; replaced `zIndex: 0` with `Z_INDEX.base`                                |
| `apps/web/src/store/editor.test.ts`                | Added `EDITOR_TABS` import; replaced `"blueprint"`/`"tasks"` literals with `EDITOR_TABS.*` refs |

## Verification

- ✅ `npm run typecheck` — clean
- ✅ `npm run lint` — zero warnings
- ✅ `npm run build` — clean
- ✅ `npm run test:all` — 1,166 tests passing (596 web + 342 api + 228 shared) across 69 files

## PR

| PR #  | Branch                                | Title                                                                            |
| ----- | ------------------------------------- | -------------------------------------------------------------------------------- |
| TBD   | `feat/modularize-hardcoded-constants` | refactor(flexy): replace hardcoded z-index and editor tab strings with constants |
| #1748 | `feat/flexy-iteration-32-error-dedup` | refactor(flexy): deduplicate API error messages and centralize DB_ID_PREFIXES    |

### ✅ Flexy Iteration 32: Deduplicate API Error Messages & Centralize DB_ID_PREFIXES

| File                                          | Change                                                                                            |
| --------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| `packages/shared/src/config.ts`               | Added `DB_ID_PREFIXES` (USER, PROJECT, BLUEPRINT, TASK, TEMPLATE, ANALYTICS, SESSION)             |
| `packages/shared/src/index.ts`                | Exported `DB_ID_PREFIXES`                                                                         |
| `packages/shared/src/config.test.ts`          | Added 3 test blocks for `DB_ID_PREFIXES` (values, uniqueness, lowercase validation)               |
| `apps/api/src/config/constants.ts`            | Removed `VALIDATION_MESSAGES.REQUEST_VALIDATION_FAILED`, `CONFIG_MESSAGES.OPENAI_API_KEY_MISSING` |
| `apps/api/src/config/constants.ts`            | Removed `ERROR_MESSAGES.SSE_UNKNOWN_ERROR` (duplicate of `UNKNOWN_ERROR`)                         |
| `apps/api/src/config/constants.ts`            | `DB_ID_CONFIG.ID_PREFIXES` now references shared `DB_ID_PREFIXES`                                 |
| `apps/api/src/controllers/base.controller.ts` | `CONFIG_MESSAGES.OPENAI_API_KEY_MISSING` → `ERROR_MESSAGES.CONFIGURATION` (2 occurrences)         |
| `apps/api/src/middleware/validator.ts`        | `VALIDATION_MESSAGES.REQUEST_VALIDATION_FAILED` → `ERROR_MESSAGES.VALIDATION`                     |
| `apps/api/src/utils/stream.ts`                | `ERROR_MESSAGES.SSE_UNKNOWN_ERROR` → `ERROR_MESSAGES.UNKNOWN_ERROR`                               |
| `apps/api/src/test-setup.ts`                  | Added `ERROR_MESSAGES` import; replaced `"OpenAI API key not configured"` with ref                |
| `apps/api/src/routes/generate.test.ts`        | Added `ERROR_MESSAGES` import; replaced hardcoded string with `ERROR_MESSAGES.CONFIGURATION`      |

## Verification

- ✅ `npm run typecheck` — clean
- ✅ `npm run lint` — zero warnings
- ✅ `npm run build` — clean
- ✅ `npm run test:all` — 1,176 tests passing (596 web + 349 api + 231 shared) across 69 files

### ✅ Flexy Iteration 33: Add EDITOR_TABS to Shared Config + Centralize STORAGE_NAMESPACE

| File                                              | Change                                                                                                        |
| ------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| `packages/shared/src/config.ts`                   | Added `EDITOR_TABS` (BLUEPRINT/TASKS) + `STORAGE_NAMESPACE` to `SHARED_DEFAULTS`                              |
| `packages/shared/src/index.ts`                    | Exported `EDITOR_TABS`                                                                                        |
| `packages/shared/src/config.test.ts`              | Added 5 tests for `EDITOR_TABS` + 1 test for `STORAGE_NAMESPACE`                                              |
| `apps/web/src/config/constants/wizard.ts`         | `EDITOR_TABS` now re-exports from `@blueprint/shared` instead of local hardcoded                              |
| `apps/web/src/components/editor/EditorHeader.tsx` | 6 hardcoded `"blueprint"`/`"tasks"` replaced with `EDITOR_TABS.BLUEPRINT`/`EDITOR_TABS.TASKS`                 |
| `apps/web/src/components/Editor.tsx`              | 7 hardcoded `"blueprint"`/`"tasks"` replaced with `EDITOR_TABS.BLUEPRINT`/`EDITOR_TABS.TASKS`                 |
| `apps/web/src/components/PreviewEmptyState.tsx`   | 7 hardcoded `"blueprint"`/`"tasks"` replaced with `EDITOR_TABS.*` + `tabLabels`/`tabEmojis` use computed keys |
| `apps/web/src/components/Wizard.test.tsx`         | `activeTab: "blueprint"` → `EDITOR_TABS.BLUEPRINT`                                                            |
| `apps/web/src/components/Editor.test.tsx`         | 2 hardcoded `"blueprint"`/`"tasks"` → `EDITOR_TABS.BLUEPRINT`/`EDITOR_TABS.TASKS`                             |
| `apps/web/src/hooks/useBlueprintStream.test.ts`   | `activeTab: "blueprint"` → `EDITOR_TABS.BLUEPRINT`                                                            |
| `apps/web/src/config/keys.ts`                     | `NAMESPACE = "blueprint"` → `SHARED_DEFAULTS.STORAGE_NAMESPACE` from `@blueprint/shared`                      |

## Verification

- ✅ `npm run typecheck` — clean
- ✅ `npm run lint` — zero warnings
- ✅ `npm run build` — clean
- ✅ `npm run test:all` — 1,181 tests passing (596 web + 349 api + 236 shared) across 69 files

### ✅ Flexy Iteration 34: Eliminate Remaining Hardcoded Tab/Category Strings in Components

| File                                                 | Change                                                                                                                                   |
| ---------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| `apps/web/src/config/constants/keyboard.ts`          | Added `SHORTCUT_CATEGORIES` (GENERAL/EDITOR/NAVIGATION/GENERATION), `SHORTCUT_CATEGORY_LABELS`, `SHORTCUT_CATEGORY_ICONS` config objects |
| `apps/web/src/components/KeyboardShortcutsModal.tsx` | Replaced 13 hardcoded `"general"`/`"editor"`/`"navigation"`/`"generation"` category strings with `SHORTCUT_CATEGORIES.*` references      |
| `apps/web/src/components/KeyboardShortcutsModal.tsx` | Replaced hardcoded `categoryLabels`/`categoryIcons` records with `SHORTCUT_CATEGORY_LABELS`/`SHORTCUT_CATEGORY_ICONS` config imports     |
| `apps/web/src/components/PreviewEmptyState.tsx`      | Replaced hardcoded `"blueprint"`/`"tasks"` in aria-label with `EDITOR_TABS.BLUEPRINT`/`EDITOR_TABS.TASKS`                                |
| `apps/web/src/components/PreviewEmptyState.tsx`      | Replaced hardcoded `"📋 tasks"`/`"📘 blueprint"` display strings with `tabLabels`/`tabEmojis` references using `EDITOR_TABS` keys        |
| `apps/web/src/components/PreviewEmptyState.tsx`      | Replaced hardcoded `"blueprint"`/`"tasks"` in info tip with `EDITOR_TABS.BLUEPRINT`/`EDITOR_TABS.TASKS`                                  |

## Verification

- ✅ `npm run typecheck` — clean
- ✅ `npm run lint` — zero warnings
- ✅ `npm run build` — clean
- ✅ `npm run test:all` — 1,181 tests passing (596 web + 349 api + 236 shared) across 69 files

## PR

| PR #  | Branch  | Title                                                                         |
| ----- | ------- | ----------------------------------------------------------------------------- |
| #1772 | `agent` | feat(flexy): eliminate remaining hardcoded tab/category strings in components |

### ✅ Flexy Iteration 35: Centralize Wizard Step Keys into Shared Config

| File                                                | Change                                                                                          |
| --------------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| `packages/shared/src/config.ts`                     | Added `WIZARD_STEP_KEYS` (INFO/STACK/FEATURES/REVIEW/GENERATING)                                |
| `packages/shared/src/index.ts`                      | Exported `WIZARD_STEP_KEYS`                                                                     |
| `packages/shared/src/config.test.ts`                | Added 8 tests for `WIZARD_STEP_KEYS` (values, length, uniqueness, type matching)                |
| `apps/web/src/config/constants/wizard.ts`           | `WIZARD_STEPS` entries now reference `WIZARD_STEP_KEYS.*` instead of hardcoded keys             |
| `apps/web/src/store/wizard.ts`                      | `currentStep: "info"` → `WIZARD_STEP_KEYS.INFO`; `"review"` → `WIZARD_STEP_KEYS.REVIEW`         |
| `apps/web/src/hooks/useBlueprintStream.ts`          | `setStep("generating")` → `setStep(WIZARD_STEP_KEYS.GENERATING)`                                |
| `apps/web/src/App.tsx`                              | 3 hardcoded `currentStep === "info"` → `WIZARD_STEP_KEYS.INFO`                                  |
| `apps/web/src/components/Wizard.tsx`                | 9 hardcoded step strings in switch/case/key → `WIZARD_STEP_KEYS.*` refs                         |
| `apps/web/src/components/StepIndicator.tsx`         | `stepKey !== "generating"` → `WIZARD_STEP_KEYS.GENERATING`                                      |
| `apps/web/src/components/wizard/StepReview.tsx`     | 3 `setStep("info"/"stack"/"features")` → `WIZARD_STEP_KEYS.*` refs                              |
| `apps/web/src/components/wizard/StepGenerating.tsx` | `setStep("review")` (×2) + `key="generating"` → `WIZARD_STEP_KEYS.*` refs                       |
| `apps/web/src/**/*.test.ts` (5 files)               | 50+ hardcoded step strings replaced with `WIZARD_STEP_KEYS.*` refs in test assertions and state |

## Verification

- ✅ `npm run typecheck` — clean
- ✅ `npm run lint` — zero warnings
- ✅ `npm run build` — clean
- ✅ `npm run test:all` — 1,193 tests passing (596 web + 352 api + 245 shared) across 69 files

## PR

| PR # | Branch                                     | Title                                                                                            |
| ---- | ------------------------------------------ | ------------------------------------------------------------------------------------------------ |
| TBD  | `feat/flexy-iteration-35-wizard-step-keys` | feat(flexy): centralize wizard step keys into shared config and eliminate hardcoded step strings |

### ✅ Flexy Iteration 36: Eliminate Remaining Hardcoded Inline CSS Values & Animation Constants

| File                                                | Change                                                                                            |
| --------------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| `apps/web/src/config/theme.ts`                      | Added `TRANSFORMS.ROTATE_NEG_90` + `LAYOUT.HEADER_HEIGHT_PX` constants                            |
| `apps/web/src/config/constants/ui.ts`               | Added `CARD_ENTRANCE_DELAY`, `CARD_ENTRANCE_DURATION`, `CHECKMARK_OVERLAY_S`, `LOADING_OVERLAY_S` |
| `apps/web/src/components/wizard/StepGenerating.tsx` | Replaced hardcoded `"rgb(99 102 241)"` with `COLORS.primary[500]`                                 |
| `apps/web/src/components/TemplateGrid.tsx`          | Replaced local `CARD_ENTRANCE_*` + inline `animationDuration` with config refs                    |
| `apps/web/src/components/PageScrollProgressBar.tsx` | Replaced hardcoded `marginTop: "64px"` with `LAYOUT.HEADER_HEIGHT_PX`                             |
| `apps/web/src/components/CircularProgress.tsx`      | Replaced hardcoded `opacity={0.3}`, `animationDuration={0.4}`, `rotate(-90deg)` with config refs  |
| `apps/web/src/components/Toast.tsx`                 | Replaced hardcoded `transform: "rotate(-90deg)"` with `TRANSFORMS.ROTATE_NEG_90`                  |

## Verification

- ✅ `npm run typecheck` — clean
- ✅ `npm run lint` — zero warnings
- ✅ `npm run build` — clean
- ✅ `npm run test:all` — 1,193 tests passing (596 web + 352 api + 245 shared) across 69 files

### ✅ Flexy Iteration 37: Derive UserRole from AUTH_DEFAULTS, Eliminate Test Mock Duplication & Direct env Access

| File                                | Change                                                                                                                          |
| ----------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| `apps/api/src/types.ts`             | `UserRole` type now derives from `typeof AUTH_DEFAULTS.ADMIN_ROLE \| AUTH_DEFAULTS.DEFAULT_ROLE` instead of `"admin" \| "user"` |
| `apps/api/src/types.ts`             | AppVariables JSDoc references CONTEXT_KEYS instead of hardcoded context key strings                                             |
| `apps/web/src/lib/api.test.ts`      | Replaced `vi.hoisted()` mock duplication with `vi.importActual` — mocks derive from real shared config at test time             |
| `apps/web/src/lib/api.test.ts`      | Removed 49 lines of hardcoded mock config values (DEV_DEFAULTS, ROUTE_PATHS, HTTP_HEADERS, HTTP_METHODS, HTTP_STATUS)           |
| `apps/web/src/config/api-client.ts` | Replaced direct `import.meta.env?.VITE_API_BASE_URL` with `ENV.API_BASE_URL`                                                    |

## Verification

- ✅ `npm run typecheck` — clean
- ✅ `npm run lint` — zero warnings
- ✅ `npm run build` — clean
- ✅ `npm run test:all` — 1,194 tests passing (596 web + 353 api + 245 shared) across 69 files

### ✅ Flexy Iteration 38: Eliminate Hardcoded Mock Values & Status Strings in Tests

| File                                   | Change                                                                                                               |
| -------------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| `apps/web/src/store/wizard.test.ts`    | Replaced hardcoded WIZARD_STEPS mock keys with `vi.importActual` — steps derive from shared WIZARD_STEP_KEYS at test |
| `apps/web/src/store/editor.test.ts`    | Replaced hardcoded EDITOR_TABS mock values with `vi.importActual` — tabs derive from shared @blueprint/shared        |
| `apps/api/src/middleware/auth.test.ts` | Added `RESPONSE_STATUS` import; replaced `status: "ok"` with `status: RESPONSE_STATUS.OK`                            |

### ✅ Flexy Iteration 39: Centralize API Status, Platform Names, Error Strings & UI Messages

| File                                       | Change                                                                                                                                                                                                                                                                                   |
| ------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `packages/shared/src/config.ts`            | Added `API_STATUS_VALUES` (healthy/ok/error), `PLATFORM_VALUES` (unknown/cloudflare-workers), `ERROR_STRINGS` (Unknown error/Resource not found/Internal server error), `UI_MESSAGES` (Changes saved/Generation cancelled/Complete!/title separator)                                     |
| `packages/shared/src/index.ts`             | Exported `API_STATUS_VALUES`, `PLATFORM_VALUES`, `ERROR_STRINGS`, `UI_MESSAGES`                                                                                                                                                                                                          |
| `packages/shared/src/config.test.ts`       | Added 20 tests covering all 4 new config objects (values + type + uniqueness checks)                                                                                                                                                                                                     |
| `apps/api/src/config/constants.ts`         | `API_METADATA.STATUS: "healthy"` → `API_STATUS_VALUES.HEALTHY`; `ERROR_MESSAGES.INTERNAL` → `ERROR_STRINGS.INTERNAL`; `PLATFORM_UNKNOWN` → `PLATFORM_VALUES.UNKNOWN`; `UNKNOWN_ERROR` → `ERROR_STRINGS.UNKNOWN`; `DEFAULT_ERROR_MESSAGES.NOT_FOUND` → `ERROR_STRINGS.RESOURCE_NOT_FOUND` |
| `apps/api/src/routes/share.ts`             | Hardcoded `"/share/"` URL construction → `ROUTE_PATHS.SHARE` reference                                                                                                                                                                                                                   |
| `apps/web/src/config/constants/api.ts`     | `FRONTEND_ERROR_MESSAGES.UNKNOWN_ERROR: "Unknown error"` → `ERROR_STRINGS.UNKNOWN`                                                                                                                                                                                                       |
| `apps/web/src/config/constants/storage.ts` | `AUTO_SAVE_CONFIG.DEFAULT_MESSAGE: "Changes saved"` → `UI_MESSAGES.CHANGES_SAVED`                                                                                                                                                                                                        |
| `apps/web/src/config/constants/content.ts` | `TOAST_MESSAGES.GENERATION_CANCELLED: "Generation cancelled"` → `UI_MESSAGES.GENERATION_CANCELLED`                                                                                                                                                                                       |
| `apps/api/src/routes/share.test.ts`        | Hardcoded `"/share/"` assertion → `ROUTE_PATHS.SHARE` reference                                                                                                                                                                                                                          |

## Verification

- ✅ `npm run typecheck` — clean
- ✅ `npm run lint` — zero warnings
- ✅ `npm run build` — clean
- ✅ `npm run test:all` — 1,214 tests passing (596 web + 353 api + 265 shared) across 69 files

## PRs

| PR # | Branch                                      | Title                                                                             |
| ---- | ------------------------------------------- | --------------------------------------------------------------------------------- |
| TBD  | `feat/flexy-iteration-38-hardcoded-cleanup` | feat(flexy): eliminate hardcoded mock values and status strings in test files     |
| TBD  | `feat/flexy-iteration-39-hardcoded-cleanup` | feat(flexy): centralize API status, platform names, error strings and UI messages |
