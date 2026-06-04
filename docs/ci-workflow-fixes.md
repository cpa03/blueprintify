# CI Workflow Fix Instructions

> **Last updated**: 2026-06-04
> **Status**: 🔧 **FIX LOCALLY READY** — blocked by `workflows: write` token permission

## Overview

This document describes the CI workflow fixes required to resolve open issues.
The actual changes to `.github/workflows/` files cannot be pushed by the `github-actions[bot]` token because it lacks the `workflows: write` permission.

## Issues Summary

| Issue | Priority | Description                                                          | Type |
| ----- | -------- | -------------------------------------------------------------------- | ---- |
| #1293 | P0       | main.yml references non-existent `docs/bug.md` and `docs/feature.md` | Bug  |
| #1470 | P1       | CI workflows use Node.js 20 but project requires Node.js 22          | Bug  |
| #1390 | P1       | Duplicate of #1470 (same Node.js version issue)                      | Bug  |
| #1111 | P1       | GitHub Actions @v5 references (already resolved)                     | Bug  |

## Fix Details

### Fix 1: main.yml stale doc references (#1293)

**File**: `.github/workflows/main.yml`

| Line(s) | Current                        | Correct                          |
| ------- | ------------------------------ | -------------------------------- |
| 39      | `docs/bug.md, docs/feature.md` | `docs/bugs.md, docs/features.md` |
| 263     | `docs/bug.md`                  | `docs/bugs.md`                   |

**Note**: `docs/bugs.md` (8,352 bytes) and `docs/features.md` (12,877 bytes) both exist. `docs/bug.md` and `docs/feature.md` do not exist.

### Fix 2: Node.js 20 → 22 (#1470, #1390, #1549, #1575, #1584)

Project requirements:

- `.node-version`: `22`
- `.nvmrc`: `22`
- `package.json > engines.node`: `>=22`

**Preferred approach**: Use `node-version-file: ".node-version"` instead of hardcoding `"22"`. This keeps CI in sync automatically as the project evolves.

#### iterate.yml (5 occurrences)

| Line | Current              | Correct                              |
| ---- | -------------------- | ------------------------------------ |
| 55   | `node-version: "20"` | `node-version-file: ".node-version"` |
| 120  | `node-version: "20"` | `node-version-file: ".node-version"` |
| 185  | `node-version: "20"` | `node-version-file: ".node-version"` |
| 250  | `node-version: "20"` | `node-version-file: ".node-version"` |
| 315  | `node-version: "20"` | `node-version-file: ".node-version"` |

#### pr-gatekeeper.yml (1 occurrence)

| Line | Current              | Correct                              |
| ---- | -------------------- | ------------------------------------ |
| 31   | `node-version: "20"` | `node-version-file: ".node-version"` |

#### on-pull.yml (1 occurrence)

| Line | Current            | Correct                              |
| ---- | ------------------ | ------------------------------------ |
| 53   | `node-version: 20` | `node-version-file: ".node-version"` |

#### parallel.yml (4 occurrences)

| Line | Current              | Correct                              |
| ---- | -------------------- | ------------------------------------ |
| 70   | `node-version: "20"` | `node-version-file: ".node-version"` |
| 266  | `node-version: "20"` | `node-version-file: ".node-version"` |
| 344  | `node-version: "20"` | `node-version-file: ".node-version"` |
| 399  | `node-version: "20"` | `node-version-file: ".node-version"` |

### Fix 3: GitHub Actions @v5 (#1111)

**Status**: ✅ Already resolved. All workflow files use current versions:

- `actions/checkout@v4`
- `actions/setup-node@v6`
- `actions/cache@v4`
- `softprops/turnstyle@v3`

No action needed.

## Automated Fix Script

A fix script is available at `scripts/fix-ci-workflows.sh` that applies all changes.

```bash
# Requires a token with workflows: write permission
chmod +x scripts/fix-ci-workflows.sh
./scripts/fix-ci-workflows.sh
```

## Manual Application

Use `node-version-file` (preferred — automatically stays in sync):

```bash
# Fix 1: main.yml
sed -i 's|docs/bug.md, docs/feature.md|docs/bugs.md, docs/features.md|g' .github/workflows/main.yml
sed -i 's|Catat bug baru ke docs/bug.md|Catat bug baru ke docs/bugs.md|g' .github/workflows/main.yml

# Fix 2: iterate.yml (5 occurrences)
sed -i 's/node-version: "20"/node-version-file: ".node-version"/g' .github/workflows/iterate.yml

# Fix 2: pr-gatekeeper.yml (1 occurrence)
sed -i 's/node-version: "20"/node-version-file: ".node-version"/g' .github/workflows/pr-gatekeeper.yml

# Fix 2: on-pull.yml (1 occurrence)
sed -i 's/node-version: 20/node-version-file: ".node-version"/g' .github/workflows/on-pull.yml

# Fix 2: parallel.yml (4 occurrences)
sed -i 's/node-version: "20"/node-version-file: ".node-version"/g' .github/workflows/parallel.yml
```

## Verification

After applying fixes, verify with:

```bash
# Check no remaining Node 20 references
grep -n 'node-version.*20' .github/workflows/*.yml || echo "✅ No Node 20 references found"

# Check no stale doc references
grep -n 'docs/bug\.\|docs/feature\.' .github/workflows/main.yml || echo "✅ No stale doc references"

# Full CI validation
npm run check
```

## Branch

The fix branch `fix/ci-workflow-issues` was attempted but could not be pushed due to token permissions. After applying fixes locally, create a PR from a branch with the following details:

```
Branch: fix/ci-workflow-issues
Commit: fix(ci): resolve CI workflow issues - Node.js 22, stale doc refs
```

The commit message should reference:

- Closes #1293
- Closes #1470
- Closes #1390
- Closes #1549
- Closes #1575
- Closes #1584
- Closes #1111
