diff --git a/.github/workflows/iterate.yml b/.github/workflows/iterate.yml
index e4a11cc..644d98b 100644
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
diff --git a/.github/workflows/main.yml b/.github/workflows/main.yml
index 2b908dc..b516db5 100644
--- a/.github/workflows/main.yml
+++ b/.github/workflows/main.yml
@@ -36,7 +36,7 @@ jobs:
           IFLOW_API_KEY: ${{ secrets.IFLOW_API_KEY }}
         run: |
           opencode run \
-            "Baca docs/blueprint.md, docs/roadmap.md, docs/bug.md, docs/feature.md.
+             "Baca docs/blueprint.md, docs/roadmap.md, docs/bugs.md, docs/features.md.
              Evaluasi prioritas.
              Update docs/task.md (OPEN / PRIORITY / ROLE / SCOPE).
              Jangan coding." \
@@ -260,7 +260,7 @@ jobs:
         run: |
           opencode run \
             "Scan log, PR, issue.
-             Catat bug baru ke docs/bug.md.
+              Catat bug baru ke docs/bugs.md.
              Jangan fix." \
             --agent reliability-engineer \
             --model opencode/deepseek-v4-flash-free \
diff --git a/.github/workflows/on-pull.yml b/.github/workflows/on-pull.yml
index 85281ff..c8d9866 100644
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
diff --git a/.github/workflows/parallel.yml b/.github/workflows/parallel.yml
index 4f19b74..ff6084f 100644
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
diff --git a/.github/workflows/pr-gatekeeper.yml b/.github/workflows/pr-gatekeeper.yml
index 6ca545a..fd0f08c 100644
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
