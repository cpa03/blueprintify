# BroCula Hunt Report - 2026-07-03 (Run 3)

## Summary

BroCula completed browser console audit and Lighthouse optimization check. **Zero console errors, zero console warnings**. Production build clean with **1745 tests passing** (723 web + 443 API + 579 shared) and zero lint/typecheck errors. Lighthouse scores at **99-100-100-100** — Performance remains at 99 due to the same `vendor` chunk unused JavaScript (21 KiB, inherent to react-dom internals, unchanged from Run 2).

### 1. Browser Console Errors/Warnings

| Check | Result | Count |
|---|---|---|
| Console Errors | :white_check_mark: | 0 |
| Console Warnings | :white_check_mark: | 0 |
| Page Errors | :white_check_mark: | 0 |
| Failed Network Requests | :white_check_mark: | 0 |

_Tested with Playwright Chromium (v1228) on production build served via `vite preview` (port 4173). Full rendering triggered with scroll on all routes (`/`, `/editor`, `/templates`)._

### 2. Lighthouse Scores (Production Build, ARM64)

| Category | Score |
|---|---|
| Performance | **99** |
| Accessibility | **100** |
| Best Practices | **100** |
| SEO | **100** |

_Production build served via `vite preview` on port 4173. Chromium 149 (ARM64). Lighthouse 13.4.0._

### 3. Key Metrics

| Metric | Value |
|---|---|
| First Contentful Paint | 1.7 s |
| Largest Contentful Paint | 1.7 s |
| Total Blocking Time | 50 ms |
| Cumulative Layout Shift | 0.007 |
| Speed Index | 1.7 s |
| Time to Interactive | 2.1 s |

### 4. Optimization Opportunities

| Audit | Score | Detail |
|---|---|---|
| Reduce unused JavaScript | 0 | Est savings of 21 KiB in `vendor-k_zW90Jm.js` (react-dom internals) |

### 5. Diagnostics

| Diagnostic | Value |
|---|---|
| JavaScript execution time | — |
| Main-thread work | — |

### 6. Full Quality Suite

| Check | Result |
|---|---|
| Build | :white_check_mark: Successful |
| Typecheck | :white_check_mark: 0 errors |
| Lint | :white_check_mark: 0 warnings/errors |
| Web Tests | :white_check_mark: **723/723 passing** |
| API Tests | :white_check_mark: **443/443 passing** |
| Shared Tests | :white_check_mark: **579/579 passing** |
| Total Tests | :white_check_mark: **1745/1745 passing** |

### 7. Code Quality Verification

- `@ts-ignore`/`@ts-expect-error`: **0** (in source code) :white_check_mark:
- `as any`: **0** (in source code) :white_check_mark:

### 8. Performance Regression Check vs Previous Audit

| Metric | Previous (Run 2) | This Run (3) | Δ |
|---|---|---|---|
| Console Errors | 0 | 0 | — |
| Console Warnings | 0 | 0 | — |
| LCP | 1.7 s | 1.7 s | — |
| TBT | 40 ms | 50 ms | +10 ms |
| CLS | 0.007 | 0.007 | — |
| Performance Score | 99 | 99 | — |
| Web Tests | 723 | 723 | — |
| API Tests | 443 | 443 | — |
| Shared Tests | 578 | **579** | **+1** |
| Total Tests | 1744 | **1745** | **+1** |

### 9. Unused JavaScript Analysis (Unchanged)

Lighthouse flagged ~21 KiB of unused code in the `vendor` bundle (react + react-dom + zustand + scheduler). Analysis:

- **Source**: `vendor-k_zW90Jm.js` (60.9 KB gzip, 34.7% unused)
- **Root cause**: `react-dom` includes internal APIs (`createPortal`, `flushSync`, `findDOMNode`, etc.) not called during initial page render. These cannot be tree-shaken due to react-dom's module structure.
- **Impact**: 1-point Performance score drop from perfect 100. No user-facing impact — all code is loaded in the same HTTP request and does not block rendering.
- **Verdict**: Inherent to React SPA architecture. No actionable fix without framework-level changes.

## Conclusions

> **BroCula verdict**: Console is **clean** (0 errors, 0 warnings). All **1745 tests pass** (723 web + 443 API + 579 shared) with zero lint/typecheck errors and clean build. Lighthouse at **99-100-100-100** — near-perfect scores. The new shared package test (+1 from 578) brings total to 1745. The 1-point Performance dip is from 21 KiB of unused react-dom internals in the vendor chunk, which is inherent to React SPA architecture and not practically actionable. **Codebase remains in excellent condition.**

---

_Hunt conducted by BroCula - Ultrawork Loop (Run 3, 2026-07-03)_
