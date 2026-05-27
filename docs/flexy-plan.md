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

## Verification

- ✅ `npm run typecheck` — clean
- ✅ `npm run lint` — zero warnings
- ✅ `npm run test:all` — 876 tests passing (56 test files)

## PR

- **URL**: https://github.com/cpa03/blueprintify/pull/1401
- **Branch**: `feat/flexy-eliminate-hardcoded-v2`
- **Title**: feat(flexy): eliminate hardcoded URLs with shared defaults

## Status

**✅ COMPLETE**
