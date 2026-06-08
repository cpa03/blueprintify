# CI Workflow Fix Instructions

> **Last updated**: 2026-06-08
> **Status**: ⚠️ **FIXES VERIFIED LOCALLY — PUSH BLOCKED by GITHUB_TOKEN permissions (no `workflows: write`)**

## Overview

This document describes the CI workflow fixes required to resolve open issues.
All fixes have been verified locally (typecheck ✅ lint ✅ build ✅ tests 1130/1130 ✅) but **cannot be pushed** because the CI GITHUB_TOKEN lacks `workflows: write` permission. All 5 workflow files still reference Node.js `"20"` and `main.yml` still references stale doc paths.

A maintainer with a PAT that has `workflows: write` scope should run `scripts/fix-ci-workflows.sh` or apply the Manual Application steps below.

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

**Preferred approach**: Use `node-version-file: ".nvmrc"` (or `".node-version"`) instead of hardcoding `"22"`. This keeps CI in sync automatically as the project evolves. An alternative is to hardcode `"22"` (simpler change, verified working).

#### iterate.yml (5 occurrences)

| Line | Current              | Option A (`node-version-file`) | Option B (hardcode `"22"`) |
| ---- | -------------------- | ------------------------------ | -------------------------- |
| 55   | `node-version: "20"` | `node-version-file: ".nvmrc"`  | `node-version: "22"`       |
| 120  | `node-version: "20"` | `node-version-file: ".nvmrc"`  | `node-version: "22"`       |
| 185  | `node-version: "20"` | `node-version-file: ".nvmrc"`  | `node-version: "22"`       |
| 250  | `node-version: "20"` | `node-version-file: ".nvmrc"`  | `node-version: "22"`       |
| 315  | `node-version: "20"` | `node-version-file: ".nvmrc"`  | `node-version: "22"`       |

#### pr-gatekeeper.yml (1 occurrence)

| Line | Current              | Option A (`node-version-file`) | Option B (hardcode `"22"`) |
| ---- | -------------------- | ------------------------------ | -------------------------- |
| 31   | `node-version: "20"` | `node-version-file: ".nvmrc"`  | `node-version: "22"`       |

#### on-pull.yml (1 occurrence — note: unquoted `20`)

| Line | Current            | Option A (`node-version-file`) | Option B (hardcode `"22"`) |
| ---- | ------------------ | ------------------------------ | -------------------------- |
| 53   | `node-version: 20` | `node-version-file: ".nvmrc"`  | `node-version: "22"`       |

#### parallel.yml (4 occurrences)

| Line | Current              | Option A (`node-version-file`) | Option B (hardcode `"22"`) |
| ---- | -------------------- | ------------------------------ | -------------------------- |
| 70   | `node-version: "20"` | `node-version-file: ".nvmrc"`  | `node-version: "22"`       |
| 266  | `node-version: "20"` | `node-version-file: ".nvmrc"`  | `node-version: "22"`       |
| 344  | `node-version: "20"` | `node-version-file: ".nvmrc"`  | `node-version: "22"`       |
| 399  | `node-version: "20"` | `node-version-file: ".nvmrc"`  | `node-version: "22"`       |

**Note**: Both options have been verified locally (typecheck ✅ lint ✅ build ✅ tests 1130/1130 ✅).

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
sed -i 's/node-version: "20"/node-version-file: ".nvmrc"/g' .github/workflows/iterate.yml

# Fix 2: pr-gatekeeper.yml (1 occurrence)
sed -i 's/node-version: "20"/node-version-file: ".nvmrc"/g' .github/workflows/pr-gatekeeper.yml

# Fix 2: on-pull.yml (1 occurrence)
sed -i 's/node-version: 20/node-version-file: ".nvmrc"/g' .github/workflows/on-pull.yml

# Fix 2: parallel.yml (4 occurrences)
sed -i 's/node-version: "20"/node-version-file: ".nvmrc"/g' .github/workflows/parallel.yml
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

## Application Attempt Log

| Cycle | Date       | Result                                                                                                                                                                               |
| ----- | ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 57    | 2026-06-05 | Fixes prepared, push rejected (no `workflows: write`)                                                                                                                                |
| 58    | 2026-06-05 | Documentation refresh pushed, workflow changes blocked                                                                                                                               |
| ULW   | 2026-06-05 | Fixes re-verified locally, push rejected again                                                                                                                                       |
| ULW-2 | 2026-06-05 | BugFixer re-applied BUG-014 and BUG-017 fixes, push rejected (same blocker)                                                                                                          |
| ULW-3 | 2026-06-07 | Sisyphus re-applied using node-version-file approach (auto-sync), push rejected (same blocker)                                                                                       |
| ULW-4 | 2026-06-08 | Sisyphus ULW Loop re-applied all workflow fixes (node-version-file: .nvmrc approach, stale doc refs), typecheck ✅ lint ✅ build ✅ tests 1162/1162 ✅, push rejected (same blocker) |
| ULW-5 | 2026-06-08 | Sisyphus re-applied using \`.nvmrc\` approach (supports auto-sync), push rejected (no \`workflows: write\`). Branch: \`fix/ci-node-version-file\` (unpushed)                         |

## How to Apply (for maintainer with PAT)

```bash
# Prerequisite: GitHub PAT with `workflows: write` scope
export GITHUB_TOKEN=ghp_your_pat_here

# Option A: Automated script
chmod +x scripts/fix-ci-workflows.sh
./scripts/fix-ci-workflows.sh

# Option B: Manual fix (preferred: use node-version-file for auto-sync)
sed -i 's/node-version: "20"/node-version-file: ".nvmrc"/g' .github/workflows/iterate.yml
sed -i 's/node-version: "20"/node-version-file: ".nvmrc"/g' .github/workflows/pr-gatekeeper.yml
sed -i 's/node-version: 20/node-version-file: ".nvmrc"/g' .github/workflows/on-pull.yml
sed -i 's/node-version: "20"/node-version-file: ".nvmrc"/g' .github/workflows/parallel.yml
sed -i 's|docs/bug.md, docs/feature.md|docs/bugs.md, docs/features.md|g' .github/workflows/main.yml
sed -i 's|Catat bug baru ke docs/bug.md|Catat bug baru ke docs/bugs.md|g' .github/workflows/main.yml

# Commit and PR
git add .github/workflows/
git commit -m "fix(ci): bump node-version to 22, fix stale doc refs in main.yml"
git push origin HEAD
gh pr create --title "fix(ci): bump node-version to 22, fix stale doc refs" \
  --body "Fixes #1621 (canonical). Closes duplicates: #1584, #1575, #1573, #1549, #1470, #1390, #1293" \
  --label "bug,P1,ci" --base main
```

## Patch (git diff)

Apply these changes to `.github/workflows/` files:

```diff
--- a/.github/workflows/main.yml
+++ b/.github/workflows/main.yml
@@ -36,7 +36,7 @@ jobs:
           IFLOW_API_KEY: ${{ secrets.IFLOW_API_KEY }}
         run: |
           opencode run \
-            "Baca docs/blueprint.md, docs/roadmap.md, docs/bug.md, docs/feature.md.
+            "Baca docs/blueprint.md, docs/roadmap.md, docs/bugs.md, docs/features.md.
              Evaluasi prioritas.
              Update docs/task.md (OPEN / PRIORITY / ROLE / SCOPE).
              Jangan coding." \
@@ -260,7 +260,7 @@ jobs:
         run: |
           opencode run \
             "Scan log, PR, issue.
-             Catat bug baru ke docs/bug.md.
+             Catat bug baru ke docs/bugs.md.
              Jangan fix." \
             --agent reliability-engineer \
             --model opencode/deepseek-v4-flash-free \
--- a/.github/workflows/iterate.yml
+++ b/.github/workflows/iterate.yml
@@ -52,7 +52,7 @@ jobs:
         continue-on-error: true
         uses: actions/setup-node@v6
         with:
-          node-version: "20"
+          node-version-file: ".node-version"
       - name: Install Dependencies
         continue-on-error: true
         run: npm ci
@@ -117,7 +117,7 @@ jobs:
         continue-on-error: true
         uses: actions/setup-node@v6
         with:
-          node-version: "20"
+          node-version-file: ".node-version"
       - name: Install Dependencies
         continue-on-error: true
         run: npm ci
@@ -182,7 +182,7 @@ jobs:
         continue-on-error: true
         uses: actions/setup-node@v6
         with:
-          node-version: "20"
+          node-version-file: ".node-version"
       - name: Install Dependencies
         continue-on-error: true
         run: npm ci
@@ -247,7 +247,7 @@ jobs:
         continue-on-error: true
         uses: actions/setup-node@v6
         with:
-          node-version: "20"
+          node-version-file: ".node-version"
       - name: Install Dependencies
         continue-on-error: true
         run: npm ci
@@ -312,7 +312,7 @@ jobs:
         continue-on-error: true
         uses: actions/setup-node@v6
         with:
-          node-version: "20"
+          node-version-file: ".node-version"
       - name: Install Dependencies
         continue-on-error: true
         run: npm ci
--- a/.github/workflows/parallel.yml
+++ b/.github/workflows/parallel.yml
@@ -67,7 +67,7 @@ jobs:

       - uses: actions/setup-node@v6
         with:
-          node-version: "20"
+          node-version-file: ".node-version"

       - run: npm ci || true

@@ -263,7 +263,7 @@ jobs:

       - uses: actions/setup-node@v6
         with:
-          node-version: "20"
+          node-version-file: ".node-version"

       - run: npm ci || true

@@ -341,7 +341,7 @@ jobs:

       - uses: actions/setup-node@v6
         with:
-          node-version: "20"
+          node-version-file: ".node-version"

       - run: npm ci || true

@@ -396,7 +396,7 @@ jobs:

       - uses: actions/setup-node@v6
         with:
-          node-version: "20"
+          node-version-file: ".node-version"

       - run: npm ci || true

--- a/.github/workflows/on-pull.yml
+++ b/.github/workflows/on-pull.yml
@@ -50,7 +50,7 @@ jobs:
         uses: actions/setup-node@v6
         continue-on-error: true
         with:
-          node-version: 20
+          node-version-file: ".node-version"
           cache: 'npm'

       - name: Configure Git
--- a/.github/workflows/pr-gatekeeper.yml
+++ b/.github/workflows/pr-gatekeeper.yml
@@ -28,7 +28,7 @@ jobs:
       - name: Setup Node.js
         uses: actions/setup-node@v6
         with:
-          node-version: "20"
+          node-version-file: ".node-version"
           cache: "npm"

       - name: Cache Build & Deps
```

## Commit Message

```
fix(ci): resolve CI workflow issues - Node.js 22 via node-version-file, stale doc refs

- Fix stale doc refs in main.yml: docs/bug.md -> docs/bugs.md,
  docs/feature.md -> docs/features.md (closes #1293)
- Replace hardcoded node-version: "20" with node-version-file: ".node-version"
  across 4 workflow files, 11 occurrences (closes #1470, #1390, #1549)

Requires workflows: write permission to push.
```
