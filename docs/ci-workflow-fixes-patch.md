# CI Workflow Fixes — Patch File

> This file documents the exact diffs needed for BUG-014 and BUG-017.
> Push to `.github/workflows/` is blocked by GitHub App token lacking `workflows: write` permission.
> Apply this patch manually or via a token with sufficient permissions.

## Verified Fix (BugFixer ULW Cycle 2026-06-17 Run 2)

- **BUG-014**: Stale doc refs → `docs/bug.md`→`docs/bugs.md`, `docs/feature.md`→`docs/features.md` (main.yml, 2 occurrences)
- **BUG-017**: Node.js version → `node-version: "20"`→`node-version: "22"` (11 occurrences across 4 files)

```
diff --git a/.github/workflows/iterate.yml b/.github/workflows/iterate.yml
index e4a11cc..05a8768 100644
--- a/.github/workflows/iterate.yml
+++ b/.github/workflows/iterate.yml
@@ -52,7 +52,7 @@ jobs:
       - name: Install Node.js
         continue-on-error: true
         uses: actions/setup-node@v6
         with:
-          node-version: "20"
+          node-version: "22"
       - name: Install Dependencies
         continue-on-error: true
         run: npm ci
@@ -117,7 +117,7 @@ jobs:
       - name: Install Node.js
         continue-on-error: true
         uses: actions/setup-node@v6
         with:
-          node-version: "20"
+          node-version: "22"
       - name: Install Dependencies
         continue-on-error: true
         run: npm ci
@@ -182,7 +182,7 @@ jobs:
       - name: Install Node.js
         continue-on-error: true
         uses: actions/setup-node@v6
         with:
-          node-version: "20"
+          node-version: "22"
       - name: Install Dependencies
         continue-on-error: true
         run: npm ci
@@ -247,7 +247,7 @@ jobs:
       - name: Install Node.js
         continue-on-error: true
         uses: actions/setup-node@v6
         with:
-          node-version: "20"
+          node-version: "22"
       - name: Install Dependencies
         continue-on-error: true
         run: npm ci
@@ -312,7 +312,7 @@ jobs:
       - name: Install Node.js
         continue-on-error: true
         uses: actions/setup-node@v6
         with:
-          node-version: "20"
+          node-version: "22"
       - name: Install Dependencies
         continue-on-error: true
         run: npm ci
diff --git a/.github/workflows/main.yml b/.github/workflows/main.yml
index 2b908dc..ea5c042 100644
--- a/.github/workflows/main.yml
+++ b/.github/workflows/main.yml
@@ -36,7 +36,7 @@ jobs:
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
diff --git a/.github/workflows/on-pull.yml b/.github/workflows/on-pull.yml
index 85281ff..c8d9866 100644
--- a/.github/workflows/on-pull.yml
+++ b/.github/workflows/on-pull.yml
@@ -49,7 +49,7 @@ jobs:
       - name: Setup Node.js
         uses: actions/setup-node@v6
         continue-on-error: true
         with:
-          node-version: 20
+          node-version: "22"
           cache: 'npm'

       - name: Configure Git
diff --git a/.github/workflows/parallel.yml b/.github/workflows/parallel.yml
index 4f19b74..52f45e2 100644
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
 
diff --git a/.github/workflows/pr-gatekeeper.yml b/.github/workflows/pr-gatekeeper.yml
index 6ca545a..08ab4c2 100644
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

## Verification

```bash
# BUG-014: Zero stale doc refs
grep -n 'docs/bug\.md\|docs/feature\.md' .github/workflows/*.yml
# → exit 1, no matches

# BUG-017: Zero node-version "20"
grep -n 'node-version:.*"20"\|node-version: 20\b' .github/workflows/*.yml
# → exit 1, no matches

# All fixed to use Node 22 (matching .nvmrc and .node-version)
grep -n 'node-version:' .github/workflows/*.yml
# → all show "22"
```
