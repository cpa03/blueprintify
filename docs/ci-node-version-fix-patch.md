# CI Node.js Version Fix Patch

> **Issue**: #2030 — CI workflows pin Node 20 but project requires Node 22+
> **Related**: #2063, #2073
> **Fix script**: `scripts/fix-ci-node-version.mjs`

## Problem

All CI workflow files pin `node-version: "20"` (11 occurrences across 4 files), but the project requires Node.js ≥22 (`.nvmrc` = `22`, `.node-version` = `22`). The API build uses `wrangler deploy --dry-run` which requires Node 22+, causing build failures in CI.

## Summary of Changes

| File | Occurrences Changed |
|------|-------------------|
| `.github/workflows/iterate.yml` | 5 |
| `.github/workflows/parallel.yml` | 4 |
| `.github/workflows/on-pull.yml` | 1 |
| `.github/workflows/pr-gatekeeper.yml` | 1 |

**Total**: 11 occurrences of `node-version: "20"` → `node-version: "22"`

## Verification

All checks pass with Node 22:
- Typecheck: ✅ 0 errors
- Lint: ✅ 0 warnings/errors
- Tests: ✅ 723/723 passing (web)

## How to Apply

### Option A: Run the fix script

```bash
node scripts/fix-ci-node-version.mjs
```

### Option B: Apply the diff below manually

```diff
diff --git a/.github/workflows/iterate.yml b/.github/workflows/iterate.yml
index 9a3bdee..59767ad 100644
--- a/.github/workflows/iterate.yml
+++ b/.github/workflows/iterate.yml
@@ -52,7 +52,7 @@ jobs:
         continue-on-error: true
         uses: actions/setup-node@v6
         with:
-          node-version: "20"
+          node-version: "22"
       - name: Install Dependencies
         continue-on-error: true
         run: npm ci
@@ -117,7 +117,7 @@ jobs:
         continue-on-error: true
         uses: actions/setup-node@v6
         with:
-          node-version: "20"
+          node-version: "22"
       - name: Install Dependencies
         continue-on-error: true
         run: npm ci
@@ -182,7 +182,7 @@ jobs:
         continue-on-error: true
         uses: actions/setup-node@v6
         with:
-          node-version: "20"
+          node-version: "22"
       - name: Install Dependencies
         continue-on-error: true
         run: npm ci
@@ -247,7 +247,7 @@ jobs:
         continue-on-error: true
         uses: actions/setup-node@v6
         with:
-          node-version: "20"
+          node-version: "22"
       - name: Install Dependencies
         continue-on-error: true
         run: npm ci
@@ -312,7 +312,7 @@ jobs:
         continue-on-error: true
         uses: actions/setup-node@v6
         with:
-          node-version: "20"
+          node-version: "22"
       - name: Install Dependencies
         continue-on-error: true
         run: npm ci
diff --git a/.github/workflows/on-pull.yml b/.github/workflows/on-pull.yml
index 9bda09f..a47560f 100644
--- a/.github/workflows/on-pull.yml
+++ b/.github/workflows/on-pull.yml
@@ -50,7 +50,7 @@ jobs:
         uses: actions/setup-node@v6
         continue-on-error: true
         with:
-          node-version: 20
+          node-version: "22"
           cache: 'npm'
 
       - name: Configure Git
diff --git a/.github/workflows/parallel.yml b/.github/workflows/parallel.yml
index ba6840e..3ef33d5 100644
--- a/.github/workflows/parallel.yml
+++ b/.github/workflows/parallel.yml
@@ -67,7 +67,7 @@ jobs:
 
       - uses: actions/setup-node@v6
         with:
-          node-version: "20"
+          node-version: "22"
 
       - run: npm ci || true
 
@@ -263,7 +263,7 @@ jobs:
 
       - uses: actions/setup-node@v6
         with:
-          node-version: "20"
+          node-version: "22"
 
       - name: Install OpenCode
         run: |
@@ -341,7 +341,7 @@ jobs:
 
       - uses: actions/setup-node@v6
         with:
-          node-version: "20"
+          node-version: "22"
 
       - run: npm ci || true
 
@@ -396,7 +396,7 @@ jobs:
 
       - uses: actions/setup-node@v6
         with:
-          node-version: "20"
+          node-version: "22"
 
       - name: Install OpenCode
         run: |
diff --git a/.github/workflows/pr-gatekeeper.yml b/.github/workflows/pr-gatekeeper.yml
index b955b35..fd0e307 100644
--- a/.github/workflows/pr-gatekeeper.yml
+++ b/.github/workflows/pr-gatekeeper.yml
@@ -28,7 +28,7 @@ jobs:
       - name: Setup Node.js
         uses: actions/setup-node@v6
         with:
-          node-version: "20"
+          node-version: "22"
           cache: "npm"
 
       - name: Cache Build & Deps
```

## Known Blocker

The GitHub App token lacks `workflows: write` permission — workflow file changes cannot be pushed from this runner. A maintainer with proper permissions must apply these changes manually or merge a branch containing them.
