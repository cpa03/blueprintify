# BroCula Hunt Report - 2026-06-08 (Run 2)

## Summary

BroCula completed browser console audit and Lighthouse optimization check for changes since last audit (2026-06-07 Run 4).

Commits audited since last report:

- `fix(web): Remove explicit HMR clientPort to prevent WebSocket port mismatch` — resolves dev HMR connection error when Vite runs on non-default port

## Audit Results

### 1. Browser Console Errors/Warnings

| Check                   | Result | Count |
| ----------------------- | ------ | ----- |
| Console Errors          | ✅     | 0     |
| Console Warnings        | ✅     | 0     |
| Page Errors             | ✅     | 0     |
| Failed Network Requests | ✅     | 0     |

_Tested with Playwright Chromium on dev server. Includes homepage load, wizard step navigation (StepInfo → StepStack → StepFeatures)._

### 2. Lighthouse Scores (Production Build)

| Category       | Score       | Variance |
| -------------- | ----------- | -------- |
| Performance    | **99/100**  | —        |
| Accessibility  | **100/100** | —        |
| Best Practices | **100/100** | —        |
| SEO            | **100/100** | —        |

### 3. Key Metrics

| Metric                   | Value | Score   | Variance |
| ------------------------ | ----- | ------- | -------- |
| First Contentful Paint   | 1.7 s | 93/100  | —        |
| Largest Contentful Paint | 1.7 s | 99/100  | —        |
| Total Blocking Time      | 30 ms | 100/100 | —        |
| Cumulative Layout Shift  | 0.007 | 100/100 | —        |
| Speed Index              | 1.7 s | 100/100 | —        |
| Time to Interactive      | 3.1 s | 95/100  | —        |

### 4. Optimization Opportunities (Diagnostic Only)

| Audit             | Score  | Detail                                                                                             |
| ----------------- | ------ | -------------------------------------------------------------------------------------------------- |
| Unused JavaScript | 50/100 | ~25 KiB in animation chunk (framer-motion, loaded on demand — expected lazy-load overhead for SPA) |

### 5. Diagnostics

| Metric                    | Value   |
| ------------------------- | ------- |
| JavaScript execution time | 0.4 s   |
| Main-thread work          | 1.9 s   |
| Total network payload     | 234 KiB |
| Network RTT               | 0 ms    |

### 6. Fixes Applied

1. **HMR WebSocket Port Mismatch (Console Error)** — Removed explicit `hmr.clientPort` from `vite.config.ts`. When Vite dev server starts on a non-default port (e.g., `--port 5173`), the HMR client was hardcoded to connect to port 3000, causing `ERR_CONNECTION_REFUSED` WebSocket errors. Vite auto-detects the correct port when `clientPort` is not set.

## Lighthouse Report

Full report: `/tmp/brocula-lighthouse-report.json`

---

_Hunt conducted by BroCula 🧛‍♂️ — Ultrawork Loop_
