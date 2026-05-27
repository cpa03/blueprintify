# Flexy Plan: Eliminate Hardcoded Values & Modularize

## Goal

Eliminate ALL hardcoded values across the codebase and build a modular, single-source-of-truth system.

## Audit Findings

### 🚨 High Priority - CI Workflows

| File                                               | Issue                               | Occurrences |
| -------------------------------------------------- | ----------------------------------- | ----------- |
| `.github/workflows/on-pull.yml:53`                 | `node-version: 20` (should be 22)   | 1           |
| `.github/workflows/iterate.yml:55,120,185,250,315` | `node-version: "20"` (should be 22) | 5           |
| `.github/workflows/parallel.yml:70,266,344,399`    | `node-version: "20"` (should be 22) | 4           |
| `.github/workflows/pr-gatekeeper.yml:31`           | `node-version: "20"` (should be 22) | 1           |
| **Total**                                          |                                     | **11**      |

### 🚨 High Priority - Duplicated Defaults

- `apps/api/src/config/env.ts:DEFAULTS` has hardcoded URLs, model names, etc.
- `apps/web/src/config/env.ts` has the SAME default URLs hardcoded again
- These should live in `@blueprint/shared` as a single source of truth

### 📋 Medium Priority - Cache Keys

- CI cache keys use hardcoded `v1` suffix
- Should derive from node version to auto-invalidate on version change

### 📋 Medium Priority - Wrangler Config

- `wrangler.toml` has env-specific values duplicated across dev/staging/production

## Approach

1. **Phase 1**: Fix CI node versions (11 changes, high impact)
2. **Phase 2**: Create shared defaults in `@blueprint/shared/src/config.ts`
3. **Phase 3**: Refactor API env.ts to use shared defaults
4. **Phase 4**: Refactor Web env.ts to use shared defaults
5. **Phase 5**: Fix CI cache keys to derive from node version
6. **Phase 6**: Verify build + lint
7. **Phase 7**: Create PR

## Status

**Currently in Phase 1** - Fixing CI node versions

## Errors Encountered

- None yet
