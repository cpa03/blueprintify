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
