# BroCula Hunt Report — 2026-06-21 (Run 1)

## Summary

BroCula completed browser console audit and Lighthouse optimization check on `brocula/perf-hunt-002` branch.

## Audit Results

### 1. Browser Console Errors/Warnings

| Check                   | Result | Count |
| ----------------------- | ------ | ----- |
| Console Errors          | ✅     | 0     |
| Console Warnings        | ✅     | 0     |
| Page Errors             | ✅     | 0     |
| Failed Network Requests | ✅     | 0     |

_Tested with Playwright Chromium on both dev server and production build (routes: `/` homepage)._

### 2. Lighthouse Scores (Production Build, CI ARM64 Environment)

| Category       | Score   |
| -------------- | ------- |
| Performance    | **100** |
| Accessibility  | **100** |
| Best Practices | **100** |
| SEO            | **100** |

### 3. Key Metrics (CI ARM64 Environment)

| Metric                   | Value  | Score |
| ------------------------ | ------ | ----- |
| Largest Contentful Paint | 0.7 s  | 100   |
| Total Blocking Time      | 0 ms   | 100   |
| Cumulative Layout Shift  | 0.016  | 100   |
| Speed Index              | 0.5 s  | 100   |
| First Contentful Paint   | 0.3 s  | 100   |
| Main-thread Work         | 0.6 s  | —     |

### 4. Optimization Opportunities

| Audit                  | Score | Detail                                                                 |
| ---------------------- | ----- | ---------------------------------------------------------------------- |
| Reduce unused JS       | 0.5   | 45 KiB potential savings — animation chunk + vendor overhead, expected |

_No actionable optimization opportunities. The "unused JavaScript" score (0.5/1) reflects two lazy-loaded chunks:_
- **_animation chunk (framer-motion):_** ~24 KB wasted — by design, only animation primitives used
- **_vendor chunk (react-dom):_** ~21 KB wasted — expected library overhead

_This is consistent with prior BroCula runs and is not actionable without sacrificing code-splitting benefits._

### 5. Quality Checks

| Check     | Result                                      |
| --------- | ------------------------------------------- |
| Build     | ✅                                          |
| Lint      | ✅ Zero errors                              |
| Typecheck | ✅ Zero errors                              |
| Secrets   | ✅ No secrets detected                      |
| Tests     | ✅ **1466 passing** (75 test files)         |

| Package           | Test Files | Tests Passing |
| ----------------- | ---------- | ------------- |
| `apps/web`        | 43         | 640           |
| `apps/api`        | 28         | 382           |
| `packages/shared` | 4          | 444           |

### 6. Code Quality Checks

| Check                           | Result                |
| ------------------------------- | --------------------- |
| `@ts-ignore`/`@ts-expect-error` | ✅ 0 (in source code) |
| `as any`                        | ✅ 0 (in source code) |

### 7. Issues Found and Fixed

| Issue | Severity | Status                        |
| ----- | -------- | ----------------------------- |
| None  | —        | ✅ All clean — no issues found |

### 8. Performance Regression Check vs Previous Audit

| Metric            | Jun 20 Run 4 | Jun 21 Run 1 | Delta   |
| ----------------- | ------------ | ------------ | ------- |
| Performance Score | 100          | **100**      | —       |
| Accessibility     | 100          | 100          | —       |
| Best Practices    | 100          | 100          | —       |
| SEO               | 100          | 100          | —       |
| FCP               | 1.1 s        | **0.3 s**    | -0.8 s  |
| LCP               | 1.1 s        | **0.7 s**    | -0.4 s  |
| TBT               | 40 ms        | **0 ms**     | -40 ms  |
| SI                | 1.3 s        | **0.5 s**    | -0.8 s  |
| CLS               | 0.007        | 0.016        | +0.009  |
| Total Tests       | 1466         | **1466**     | —       |

> **Note**: All metric improvements (FCP -0.8s, LCP -0.4s, TBT -40ms, SI -0.8s) reflect CI environment variance rather than code changes, as no modifications were made. The slight CLS increase (+0.009) remains well within the "good" threshold (< 0.1).

### 9. Conclusion

> 🧛‍♂️ **BroCula verdict**: Console is clean, Lighthouse scores are perfect **(100-100-100-100)**, all **1466 tests pass** across 75 test files with zero lint/typecheck/secrets errors, and zero code quality issues found. The animation chunk unused JS (~24 KB) and vendor chunk unused JS (~21 KB) are expected lazy-loading behavior identical to prior runs. The codebase remains in peak condition — no fixes needed.

---

_Hunt conducted by BroCula 🧛‍♂️ — Ultrawork Loop (Run 1)_
