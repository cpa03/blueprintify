# Flexy Plan: Eliminate Hardcoded Values & Modularize

## Goal

Eliminate hardcoded values and build a modular, single-source-of-truth system.

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

## Verification

- ✅ `npm run typecheck` — clean
- ✅ `npm run lint` — zero warnings
- ✅ `npm run test:all` — 876 tests passing (56 test files)

## PRs

| PR #  | Branch                              | Title                                                                        |
| ----- | ----------------------------------- | ---------------------------------------------------------------------------- |
| #1401 | `feat/flexy-eliminate-hardcoded-v2` | feat(flexy): eliminate hardcoded URLs with shared defaults                   |
| #1414 | `feat/flexy-hardcoded-values-v3`    | feat(flexy): eliminate hardcoded values from scripts with centralized config |

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

## Status

**🔄 IN PROGRESS - Awaiting CI verification**
