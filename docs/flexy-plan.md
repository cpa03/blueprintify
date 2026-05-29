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

Changed `node-version: "20"` → `node-version-file: ".node-version"` in all 5 workflow files (11 occurrences). Now reading Node.js version from `.node-version` (v22) instead of hardcoded v20.
⚠️ Workflow file changes require `workflows` GitHub permission — applied locally but blocked from push. Apply manually:

```bash
# Replace node-version: "20" with node-version-file: ".node-version" in:
.github/workflows/on-pull.yml       # 1 occurrence
.github/workflows/iterate.yml       # 5 occurrences
.github/workflows/parallel.yml      # 4 occurrences
.github/workflows/pr-gatekeeper.yml # 1 occurrence
```

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
| #1443 | `feat/flexy-ci-node-version-file`   | feat(flexy): eliminate hardcoded node-version in CI with node-version-file   |

## Status

**✅ COMPLETE** (ongoing maintenance - new hardcoded values may be eliminated as they're discovered)

## Flexy Says

> "Hardcoded is the enemy of maintainability. Every magic string, every literal version, every inline number is a future bug waiting to happen. When you change one, you must remember to change all - and you will forget. Centralize. Modularize. Single source of truth."
