# CI/CD Integration for Frontend Testing

This guide covers the complete integration of frontend testing into the Blueprintify project's CI/CD pipeline, including GitHub Actions workflows, quality gates, and automated test execution.

## 1. CI/CD Pipeline Overview

### Current Pipeline Architecture

The project uses a sophisticated AI-driven CI/CD pipeline with the following stages:

1. **Architect** - Decision making and task planning
2. **Dispatcher** - Task assignment matrix
3. **Engineers** - Parallel execution by specialized agents
4. **QA Gate** - Quality assurance
5. **Security Gate** - Security validation
6. **Repo Guardian** - Repository governance
7. **Integrator** - Merge management
8. **Knowledge Steward** - Documentation consistency
9. **Reliability** - Bug scanning

### Testing Integration Points

Frontend testing integrates at multiple stages:

- **Pre-commit hooks** - Local developer validation
- **PR Creation** - Automated test suite execution
- **PR Updates** - Incremental testing
- **Merge Gate** - Final validation before integration
- **Post-merge** - Continuous monitoring

## 2. GitHub Actions Workflow Configuration

### Enhanced Main Workflow with Frontend Testing

#### File: `.github/workflows/main.yml` (Updated)

```yaml
name: ai-software-company

on:
  workflow_dispatch:
  schedule:
    - cron: "0 */6 * * *"
  pull_request:
    types: [opened, synchronize, reopened]

permissions:
  contents: write
  pull-requests: write
  issues: write

concurrency:
  group: ai-company-${{ github.ref }}
  cancel-in-progress: false

env:
  NODE_VERSION: "18"
  CACHE_VERSION: v1

jobs:
  # ==================================================
  # FRONTEND TESTING GATE - NEW
  # ==================================================
  frontend-tests:
    name: Frontend Tests
    runs-on: ubuntu-24.04-arm
    if: github.event_name == 'pull_request'

    steps:
      - name: Checkout Code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: "npm"
          cache-dependency-path: "package-lock.json"

      - name: Install Dependencies
        run: |
          npm ci
          npm run install:frontend

      - name: Type Check
        run: |
          npm run typecheck:frontend

      - name: Lint Frontend
        run: |
          npm run lint:frontend

      - name: Run Unit Tests
        run: |
          npm run test:frontend:unit

      - name: Run Integration Tests
        run: |
          npm run test:frontend:integration

      - name: Generate Coverage Report
        run: |
          npm run test:frontend:coverage

      - name: Upload Coverage to Codecov
        uses: codecov/codecov-action@v3
        with:
          file: ./apps/web/coverage/lcov.info
          flags: frontend
          name: frontend-coverage

      - name: Coverage Threshold Check
        run: |
          node scripts/check-coverage.js ./apps/web/coverage/coverage-summary.json

      - name: Test Performance
        run: |
          npm run test:frontend:performance

      - name: Accessibility Testing
        run: |
          npm run test:frontend:a11y

      - name: Upload Test Results
        uses: actions/upload-artifact@v3
        if: always()
        with:
          name: frontend-test-results
          path: |
            apps/web/coverage/
            apps/web/test-results/
            apps/web/playwright-report/

  # ==================================================
  # 1. ARCHITECT — SINGLE SOURCE OF DECISION
  # ==================================================
  architect:
    name: Architect (Decision Maker)
    runs-on: ubuntu-24.04-arm
    needs: frontend-tests
    if: success() || github.event_name == 'workflow_dispatch'

    steps:
      - uses: actions/checkout@v4

      - name: Install OpenCode
        run: |
          curl -fsSL https://opencode.ai/install | bash
          echo "$HOME/.opencode/bin" >> $GITHUB_PATH

      - name: Create / Update Task Plan
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          IFLOW_API_KEY: ${{ secrets.IFLOW_API_KEY }}
        run: |
          opencode run \
            "Baca docs/blueprint.md, docs/roadmap.md, docs/bug.md, docs/feature.md.
             Evaluasi prioritas.
             Update docs/task.md (OPEN / PRIORITY / ROLE / SCOPE).
             Jangan coding." \
            --agent architect \
            --model iflowcn/glm-4.6 \
            --share false

  # ==================================================
  # 2. DISPATCHER — TASK → ROLE MATRIX
  # ==================================================
  dispatcher:
    needs: architect
    runs-on: ubuntu-24.04-arm
    outputs:
      matrix: ${{ steps.read.outputs.matrix }}
    steps:
      - uses: actions/checkout@v4
      - name: Install OpenCode
        run: |
          curl -fsSL https://opencode.ai/install | bash
          echo "$HOME/.opencode/bin" >> $GITHUB_PATH
      - name: Dispatch Tasks
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          IFLOW_API_KEY: ${{ secrets.IFLOW_API_KEY }}
        run: |
          opencode run \
            "Baca docs/task.md.
             Ambil task OPEN prioritas HIGH/MEDIUM.
             Buat file docs/dispatch.json berisi role unik.
             Jangan coding." \
            --agent dispatcher \
            --model iflowcn/glm-4.6 \
            --share false

      - name: Commit Dispatch Plan
        run: |
          if [[ -n "$(git status --porcelain)" ]]; then
            git config user.name "dispatcher-ai"
            git config user.email "dispatcher@bot.local"
            git add docs/dispatch.json
            git commit -m "dispatcher: build execution matrix"
            git push
          fi

      - id: read
        run: |
          matrix=$(cat docs/dispatch.json)
          echo "matrix=$matrix" >> $GITHUB_OUTPUT

  # ==================================================
  # 3. ENGINEERS — PARALLEL EXECUTION
  # ==================================================
  engineers:
    name: Engineer (${{ matrix.role }})
    needs: [dispatcher, frontend-tests]
    runs-on: ubuntu-24.04-arm
    strategy:
      fail-fast: false
      matrix: ${{ fromJson(needs.dispatcher.outputs.matrix) }}

    steps:
      - uses: actions/checkout@v4

      - name: Install OpenCode
        run: |
          curl -fsSL https://opencode.ai/install | bash
          echo "$HOME/.opencode/bin" >> $GITHUB_PATH

      - name: Execute Assigned Task
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          IFLOW_API_KEY: ${{ secrets.IFLOW_API_KEY }}
        run: |
          opencode run \
            "Ambil SATU task OPEN dengan Role=${{ matrix.role }} dari docs/task.md.
             Kerjakan sesuai scope.
             Buat branch + PR.
             Update task ke DONE.
             Dilarang nambah file / scope." \
            --agent ${{ matrix.role }} \
            --model opencode/minimax-m2.1-free \
            --share false

  # ==================================================
  # 4. QA — QUALITY GATE
  # ==================================================
  qa:
    name: QA Gate
    needs: engineers
    runs-on: ubuntu-24.04-arm
    steps:
      - uses: actions/checkout@v4

      - name: QA Review
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          IFLOW_API_KEY: ${{ secrets.IFLOW_API_KEY }}
        run: |
          opencode run \
            "Review PR berdasarkan task.md & blueprint.md.
             Tambah test bila perlu.
             Update task: QA PASS / FAIL." \
            --agent qa-engineer \
            --model iflowcn/glm-4.6 \
            --share false

  # ==================================================
  # 5. SECURITY — QUALITY GATE
  # ==================================================
  security:
    name: Security Gate
    needs: engineers
    runs-on: ubuntu-24.04-arm
    steps:
      - uses: actions/checkout@v4

      - name: Security Audit
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          IFLOW_API_KEY: ${{ secrets.IFLOW_API_KEY }}
        run: |
          opencode run \
            "Audit PR prioritas HIGH / CRITICAL.
             Cocokkan dengan blueprint.md.
             Update task: SECURITY PASS / FAIL." \
            --agent security-engineer \
            --model iflowcn/glm-4.6 \
            --share false

  # ==================================================
  # 6. REPO GUARDIAN — REPO GOVERNANCE
  # ==================================================
  repo-guardian:
    name: Repo Guardian
    needs: [qa, security]
    runs-on: ubuntu-24.04-arm
    steps:
      - uses: actions/checkout@v4

      - name: Repo Compliance Check
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          IFLOW_API_KEY: ${{ secrets.IFLOW_API_KEY }}
        run: |
          opencode run \
            "Review semua PR.
             Tolak jika:
             - File di luar scope task
             - Nambah file/folder tanpa task
             - Nambah dokumen tanpa izin Architect
             Rujuk docs/repo-rules.md.
             Comment jika reject." \
            --agent repo-guardian \
            --model iflowcn/glm-4.6 \
            --share false

  # ==================================================
  # 7. INTEGRATOR — MERGE GATE (SINGLE)
  # ==================================================
  integrator:
    name: Integrator (Merge Gate)
    needs: repo-guardian
    runs-on: ubuntu-24.04-arm
    steps:
      - uses: actions/checkout@v4

      - name: Merge Approved PRs
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          IFLOW_API_KEY: ${{ secrets.IFLOW_API_KEY }}
        run: |
          opencode run \
            "Merge PR satu per satu jika:
             - Ada Task ID
             - QA PASS
             - SECURITY PASS (jika ada)
             - Repo Guardian OK
             Jika gagal, comment." \
            --agent integrator \
            --model iflowcn/glm-4.6 \
            --share false

  # ==================================================
  # 8. KNOWLEDGE STEWARD — DOCUMENT DRIFT CONTROL
  # ==================================================
  knowledge-steward:
    name: Knowledge Steward
    needs: integrator
    runs-on: ubuntu-24.04-arm
    steps:
      - uses: actions/checkout@v4

      - name: Knowledge Review
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          IFLOW_API_KEY: ${{ secrets.IFLOW_API_KEY }}
        run: |
          opencode run \
            "Review konsistensi blueprint.md, roadmap.md, task.md dengan hasil merge.
             Catat drift / rekomendasi ke docs/knowledge-review.md.
             Jangan coding." \
            --agent knowledge-steward \
            --model iflowcn/glm-4.6 \
            --share false

  # ==================================================
  # 9. RELIABILITY — OBSERVER ONLY
  # ==================================================
  reliability:
    name: Reliability Observer
    needs: knowledge-steward
    runs-on: ubuntu-24.04-arm
    steps:
      - uses: actions/checkout@v4

      - name: Scan & Report Bugs
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          IFLOW_API_KEY: ${{ secrets.IFLOW_API_KEY }}
        run: |
          opencode run \
            "Scan log, PR, issue.
             Catat bug baru ke docs/bug.md.
             Jangan fix." \
            --agent reliability-engineer \
            --model iflowcn/glm-4.6 \
            --share false
```

### Dedicated Frontend Testing Workflow

#### File: `.github/workflows/frontend-tests.yml`

```yaml
name: Frontend Testing

on:
  push:
    branches: [main, develop]
    paths: ["apps/web/**"]
  pull_request:
    branches: [main, develop]
    paths: ["apps/web/**"]
  workflow_call: # Allow calling from other workflows

permissions:
  contents: read
  checks: write
  pull-requests: write

concurrency:
  group: ${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: ${{ github.event_name == 'pull_request' }}

jobs:
  test-matrix:
    name: Frontend Tests (${{ matrix.os }}, Node ${{ matrix.node }})
    runs-on: ${{ matrix.os }}

    strategy:
      fail-fast: false
      matrix:
        os: [ubuntu-24.04-arm, macos-14, windows-2022]
        node: [18, 20]
        include:
          - os: ubuntu-24.04-arm
            node: 18
            coverage: true

    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node.js ${{ matrix.node }}
        uses: actions/setup-node@v4
        with:
          node-version: ${{ matrix.node }}
          cache: "npm"
          cache-dependency-path: "package-lock.json"

      - name: Install Dependencies
        run: |
          npm ci
          npm run install:frontend

      - name: Type Check
        run: npm run typecheck:frontend

      - name: Lint
        run: npm run lint:frontend

      - name: Run Tests
        run: npm run test:frontend:run
        env:
          CI: true

      - name: Generate Coverage (Ubuntu only)
        if: matrix.os == 'ubuntu-24.04-arm' && matrix.coverage
        run: npm run test:frontend:coverage

      - name: Upload Coverage
        if: matrix.os == 'ubuntu-24.04-arm' && matrix.coverage
        uses: codecov/codecov-action@v3
        with:
          file: ./apps/web/coverage/lcov.info
          flags: frontend
          name: frontend-coverage-node${{ matrix.node }}

  e2e-tests:
    name: E2E Tests
    runs-on: ubuntu-24.04-arm

    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: "18"
          cache: "npm"

      - name: Install Dependencies
        run: |
          npm ci
          npm run install:frontend
          npm run install:e2e

      - name: Install Playwright Browsers
        run: npx playwright install --with-deps

      - name: Build Application
        run: npm run build:frontend

      - name: Run E2E Tests
        run: npm run test:e2e:ci
        env:
          CI: true

      - name: Upload E2E Results
        uses: actions/upload-artifact@v3
        if: always()
        with:
          name: playwright-report
          path: apps/web/playwright-report/

  performance-tests:
    name: Performance Tests
    runs-on: ubuntu-24.04-arm
    if: github.event_name == 'pull_request'

    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: "18"
          cache: "npm"

      - name: Install Dependencies
        run: |
          npm ci
          npm run install:frontend

      - name: Build Application
        run: npm run build:frontend

      - name: Run Lighthouse CI
        run: |
          npm install -g @lhci/cli@0.12.x
          lhci autorun
        env:
          LHCI_GITHUB_APP_TOKEN: ${{ secrets.LHCI_GITHUB_APP_TOKEN }}

  accessibility-tests:
    name: Accessibility Tests
    runs-on: ubuntu-24.04-arm

    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: "18"
          cache: "npm"

      - name: Install Dependencies
        run: |
          npm ci
          npm run install:frontend

      - name: Build Application
        run: npm run build:frontend

      - name: Run Accessibility Tests
        run: npm run test:a11y:ci

      - name: Upload Accessibility Report
        uses: actions/upload-artifact@v3
        if: always()
        with:
          name: a11y-report
          path: apps/web/a11y-report/
```

## 3. Package.json Scripts Update

#### Root `package.json` Updates

```json
{
  "scripts": {
    "install:frontend": "npm install --workspace=apps/web",
    "typecheck:frontend": "tsc --noEmit --project apps/web/tsconfig.json",
    "lint:frontend": "eslint apps/web/src --ext .ts,.tsx --fix",
    "test:frontend": "vitest --workspace apps/web",
    "test:frontend:unit": "vitest run --workspace apps/web --config apps/web/vitest.config.unit.ts",
    "test:frontend:integration": "vitest run --workspace apps/web --config apps/web/vitest.config.integration.ts",
    "test:frontend:run": "vitest run --workspace apps/web",
    "test:frontend:watch": "vitest --workspace apps/web",
    "test:frontend:coverage": "vitest run --workspace apps/web --coverage",
    "test:frontend:ui": "vitest --workspace apps/web --ui",
    "test:frontend:performance": "vitest run --workspace apps/web --config apps/web/vitest.config.performance.ts",
    "test:frontend:a11y": "vitest run --workspace apps/web --config apps/web/vitest.config.a11y.ts",
    "build:frontend": "npm run build --workspace=apps/web",
    "test:e2e": "playwright test --project=chromium",
    "test:e2e:ci": "playwright test --reporter=github --reporter=list",
    "install:e2e": "npm install --save-dev @playwright/test",
    "test:a11y:ci": "axe-playwright --include apps/web/dist"
  }
}
```

#### Frontend `apps/web/package.json` Updates

```json
{
  "scripts": {
    "test": "vitest",
    "test:unit": "vitest run --config vitest.config.unit.ts",
    "test:integration": "vitest run --config vitest.config.integration.ts",
    "test:coverage": "vitest run --coverage",
    "test:watch": "vitest --watch",
    "test:ui": "vitest --ui",
    "test:e2e": "playwright test",
    "test:e2e:ci": "playwright test --reporter=github",
    "test:a11y": "vitest run --config vitest.config.a11y.ts",
    "test:performance": "vitest run --config vitest.config.performance.ts"
  },
  "devDependencies": {
    "@testing-library/react": "^14.0.0",
    "@testing-library/jest-dom": "^6.0.0",
    "@testing-library/user-event": "^14.0.0",
    "@vitest/coverage-v8": "^1.0.0",
    "@vitest/ui": "^1.0.0",
    "axe-playwright": "^1.2.0",
    "jest-axe": "^8.0.0",
    "msw": "^2.0.0",
    "playwright": "^1.40.0",
    "vitest": "^1.0.0",
    "jsdom": "^23.0.0"
  }
}
```

## 4. Vitest Configuration Files

#### `apps/web/vitest.config.unit.ts`

```typescript
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    setupFiles: ["./src/test/setup.ts"],
    include: ["src/**/*.{test,spec}.{ts,tsx}"],
    exclude: ["src/**/*.integration.{test,spec}.{ts,tsx}"],
    globals: true,
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      exclude: [
        "node_modules/",
        "src/test/",
        "**/*.d.ts",
        "**/*.config.*",
        "dist/",
        "src/**/*.integration.{test,spec}.{ts,tsx}",
      ],
      thresholds: {
        global: {
          branches: 80,
          functions: 80,
          lines: 80,
          statements: 80,
        },
      },
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
```

#### `apps/web/vitest.config.integration.ts`

```typescript
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    setupFiles: ["./src/test/setup.integration.ts"],
    include: ["src/**/*.integration.{test,spec}.{ts,tsx}"],
    globals: true,
    testTimeout: 10000,
    hookTimeout: 10000,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
```

#### `apps/web/vitest.config.a11y.ts`

```typescript
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    setupFiles: ["./src/test/setup.a11y.ts"],
    include: ["src/**/*.a11y.{test,spec}.{ts,tsx}"],
    globals: true,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
```

## 5. Coverage Threshold Checker

#### `scripts/check-coverage.js`

```javascript
const fs = require("fs");
const path = require("path");

function checkCoverageThresholds(coverageFile) {
  try {
    const coverage = JSON.parse(fs.readFileSync(coverageFile, "utf8"));
    const { total } = coverage;

    const thresholds = {
      lines: 80,
      functions: 80,
      branches: 75,
      statements: 80,
    };

    const results = {
      passed: true,
      failures: [],
    };

    Object.entries(thresholds).forEach(([metric, threshold]) => {
      const coveragePercentage = total[metric].pct;
      if (coveragePercentage < threshold) {
        results.passed = false;
        results.failures.push(
          `${metric}: ${coveragePercentage}% (required: ${threshold}%)`,
        );
      }
    });

    if (results.passed) {
      console.log("✅ All coverage thresholds passed!");
      console.log(`Lines: ${total.lines.pct}%`);
      console.log(`Functions: ${total.functions.pct}%`);
      console.log(`Branches: ${total.branches.pct}%`);
      console.log(`Statements: ${total.statements.pct}%`);
    } else {
      console.log("❌ Coverage thresholds failed:");
      results.failures.forEach((failure) => console.log(`  - ${failure}`));
      process.exit(1);
    }
  } catch (error) {
    console.error("Error reading coverage file:", error.message);
    process.exit(1);
  }
}

// Get coverage file path from command line arguments
const coverageFile = process.argv[2];
if (!coverageFile) {
  console.error("Please provide the path to coverage-summary.json");
  process.exit(1);
}

checkCoverageThresholds(coverageFile);
```

## 6. Playwright Configuration

#### `apps/web/playwright.config.ts`

```typescript
import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./src/e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ["html"],
    ["json", { outputFile: "test-results/results.json" }],
    process.env.CI && ["github"],
  ].filter(Boolean),
  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "firefox",
      use: { ...devices["Desktop Firefox"] },
    },
    {
      name: "webkit",
      use: { ...devices["Desktop Safari"] },
    },
    {
      name: "Mobile Chrome",
      use: { ...devices["Pixel 5"] },
    },
  ],
  webServer: {
    command: "npm run preview",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
  },
});
```

## 7. Pre-commit Hooks

#### `.husky/pre-commit`

```bash
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

echo "🔍 Running pre-commit checks..."

# Type check
echo "📝 Type checking..."
npm run typecheck:frontend

# Lint
echo "🧹 Linting..."
npm run lint:frontend

# Run tests on affected files
echo "🧪 Running tests..."
npx vitest related --run

# Check for large files
echo "📏 Checking file sizes..."
npx chalk-cli --no-stderr "Checking for files >100KB..."
files=$(find apps/web/src -type f -size +100k)
if [ ! -z "$files" ]; then
  echo "❌ Large files found:"
  echo "$files"
  exit 1
fi

echo "✅ All pre-commit checks passed!"
```

#### `.husky/commit-msg`

```bash
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

# Conventional commit validation
commit_regex='^(feat|fix|docs|style|refactor|test|chore|perf|ci|build|revert)(\(.+\))?: .{1,50}'

if ! grep -qE "$commit_regex" "$1"; then
  echo "❌ Commit message must follow conventional commit format:"
  echo "  <type>(<scope>): <description>"
  echo "  Types: feat, fix, docs, style, refactor, test, chore, perf, ci, build, revert"
  echo "  Example: feat(testing): add frontend test suite"
  exit 1
fi

echo "✅ Commit message format is valid!"
```

## 8. Quality Gates and Notifications

#### `scripts/quality-gate.js`

```javascript
const fs = require("fs");
const path = require("path");

function runQualityGates() {
  const results = {
    tests: false,
    coverage: false,
    performance: false,
    accessibility: false,
  };

  // Check test results
  try {
    const testResults = JSON.parse(
      fs.readFileSync("apps/web/test-results/results.json", "utf8"),
    );
    results.tests = testResults.numFailedTests === 0;
  } catch (error) {
    console.warn("Could not read test results");
  }

  // Check coverage
  try {
    const coverage = JSON.parse(
      fs.readFileSync("apps/web/coverage/coverage-summary.json", "utf8"),
    );
    const thresholds = {
      lines: 80,
      functions: 80,
      branches: 75,
      statements: 80,
    };

    results.coverage = Object.entries(thresholds).every(
      ([metric, threshold]) => coverage.total[metric].pct >= threshold,
    );
  } catch (error) {
    console.warn("Could not read coverage results");
  }

  // Check performance
  try {
    const lighthouseResults = JSON.parse(
      fs.readFileSync("apps/web/.lighthouseci/manifest.json", "utf8"),
    );
    results.performance = lighthouseResults.every(
      (result) => result.lhr.categories.performance.score * 100 >= 80,
    );
  } catch (error) {
    console.warn("Could not read performance results");
  }

  // Check accessibility
  try {
    const a11yResults = JSON.parse(
      fs.readFileSync("apps/web/a11y-report/results.json", "utf8"),
    );
    results.accessibility = a11yResults.violations.length === 0;
  } catch (error) {
    console.warn("Could not read accessibility results");
  }

  const allPassed = Object.values(results).every(Boolean);

  if (allPassed) {
    console.log("🎉 All quality gates passed!");
    console.log("✅ Tests passed");
    console.log("✅ Coverage thresholds met");
    console.log("✅ Performance standards met");
    console.log("✅ Accessibility standards met");
  } else {
    console.log("❌ Quality gates failed:");
    if (!results.tests) console.log("  - Tests failed");
    if (!results.coverage) console.log("  - Coverage thresholds not met");
    if (!results.performance) console.log("  - Performance standards not met");
    if (!results.accessibility)
      console.log("  - Accessibility standards not met");
    process.exit(1);
  }
}

runQualityGates();
```

## 9. Monitoring and Alerting

#### `.github/workflows/monitoring.yml`

```yaml
name: Monitoring and Alerting

on:
  schedule:
    - cron: "0 */6 * * *" # Every 6 hours
  workflow_dispatch:

jobs:
  performance-monitoring:
    name: Performance Monitoring
    runs-on: ubuntu-24.04-arm

    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: "18"
          cache: "npm"

      - name: Install and Build
        run: |
          npm ci
          npm run install:frontend
          npm run build:frontend

      - name: Run Lighthouse CI
        run: |
          npm install -g @lhci/cli@0.12.x
          lhci autorun
        env:
          LHCI_GITHUB_APP_TOKEN: ${{ secrets.LHCI_GITHUB_APP_TOKEN }}

      - name: Create Issue on Performance Regression
        if: failure()
        uses: actions/github-script@v6
        with:
          script: |
            github.rest.issues.create({
              owner: context.repo.owner,
              repo: context.repo.repo,
              title: 'Performance Regression Detected',
              body: 'Performance metrics have fallen below acceptable thresholds. Please investigate the recent changes.',
              labels: ['performance', 'bug']
            })

  test-monitoring:
    name: Test Monitoring
    runs-on: ubuntu-24.04-arm

    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: "18"
          cache: "npm"

      - name: Install Dependencies
        run: |
          npm ci
          npm run install:frontend

      - name: Run Test Suite
        run: npm run test:frontend:run

      - name: Create Issue on Test Failures
        if: failure()
        uses: actions/github-script@v6
        with:
          script: |
            github.rest.issues.create({
              owner: context.repo.owner,
              repo: context.repo.repo,
              title: 'Test Suite Failures Detected',
              body: 'Automated test suite has failures. Please review and fix the failing tests.',
              labels: ['testing', 'bug']
            })
```

## 10. Local Development Setup

#### `scripts/local-dev-setup.sh`

```bash
#!/bin/bash

echo "🚀 Setting up local development environment for frontend testing..."

# Install dependencies
echo "📦 Installing dependencies..."
npm ci
npm run install:frontend

# Install testing dependencies
echo "🧪 Installing testing dependencies..."
cd apps/web
npm install --save-dev @testing-library/react @testing-library/jest-dom @testing-library/user-event vitest @vitest/coverage-v8 @vitest/ui jsdom

# Install E2E testing dependencies
echo "🌐 Installing E2E testing dependencies..."
npx playwright install

# Setup pre-commit hooks
echo "🪝 Setting up pre-commit hooks..."
cd ../..
npx husky install

# Create environment files
echo "📝 Setting up environment files..."
cp apps/web/.env.example apps/web/.env.local

# Run initial tests to verify setup
echo "🧪 Running initial tests..."
npm run test:frontend:run

if [ $? -eq 0 ]; then
  echo "✅ Local development environment setup complete!"
  echo "💡 Run 'npm run test:frontend:watch' to start test watch mode"
  echo "💡 Run 'npm run test:frontend:ui' to start Vitest UI"
else
  echo "❌ Setup failed. Please check the errors above."
  exit 1
fi
```

This comprehensive CI/CD integration ensures that frontend testing is fully integrated into the development pipeline, providing quality gates, automated testing, and continuous monitoring to maintain high code quality standards.
