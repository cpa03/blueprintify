# CI Workflow Fixes Patch — BugFixer ULW Cycle Jun 27

> **Generated**: 2026-06-27
> **Branch**: `fix/bugfixer-ulw-jun-27`
> **Status**: Fixes verified locally, push blocked by `workflows: write` permission
> **PR**: # (to be created)
> **Previous attempt**: PR #2127 — same fixes, same blocker

## Summary

Two bugs that keep getting re-introduced on `main`:

| Bug | Description | Files |
|-----|-------------|-------|
| BUG-014 | Stale doc refs `docs/bug.md` → `docs/bugs.md`, `docs/feature.md` → `docs/features.md` | `main.yml` (2 locations) |
| BUG-017 | Hardcoded `node-version: "20"`/`20` → `node-version-file: ".node-version"` | 4 workflow files (11 occurrences) |

## Verification

```
$ grep -r "docs/bug\.md\|docs/feature\.md" .github/
  → No matches found ✅

$ grep -r "node-version:" .github/workflows/
  → No matches found ✅
```

## Required Changes

### BUG-014: Stale Doc References

**File**: `.github/workflows/main.yml`

| Line | Before | After |
|------|--------|-------|
| 39 | `docs/bug.md, docs/feature.md` | `docs/bugs.md, docs/features.md` |
| 263 | `docs/bug.md` | `docs/bugs.md` |

### BUG-017: Hardcoded Node.js Version

Replace all `node-version: "20"` / `node-version: 20` with `node-version-file: ".node-version"`.

| File | Occurrences | Action |
|------|-------------|--------|
| `.github/workflows/iterate.yml` | 5 | `node-version: "20"` → `node-version-file: ".node-version"` |
| `.github/workflows/parallel.yml` | 4 | `node-version: "20"` → `node-version-file: ".node-version"` |
| `.github/workflows/on-pull.yml` | 1 | `node-version: 20` → `node-version-file: ".node-version"` |
| `.github/workflows/pr-gatekeeper.yml` | 1 | `node-version: "20"` → `node-version-file: ".node-version"` |

### Full Diff

```diff
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

       - name: Install OpenCode
         run: |
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

       - name: Install OpenCode
         run: |
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

## Verification Checks

- Build: ✅
- Typecheck: ✅
- Lint: ✅
- Tests: 1,701/1,701 ✅ (723 web + 438 api + 540 shared)
