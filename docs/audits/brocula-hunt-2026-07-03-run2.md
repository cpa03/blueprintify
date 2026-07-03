# BroCula Hunt Report - 2026-07-03 (Run 2)

## Summary

BroCula completed browser console audit and Lighthouse optimization check. **Zero console errors, zero console warnings**. Production build clean with **1744 tests passing** (723 web + 443 API + 578 shared) and zero lint/typecheck errors. Lighthouse scores at **99-100-100-100** — minor 1-point Performance dip from Run 1 due to `vendor` chunk unused JavaScript (21 KiB, inherent to react-dom internals).

### 1. Browser Console Errors/Warnings

| Check | Result | Count |
|---|---|---|
| Console Errors | :white_check_mark: | 0 |
| Console Warnings | :white_check_mark: | 0 |
| Page Errors | :white_check_mark: | 0 |
| Failed Network Requests | :white_check_mark: | 0 |

_Tested with Playwright Chromium on production build served via `vite preview` (port 4173). Full rendering triggered with scroll._

### 2. Lighthouse Scores (Production Build, ARM64)

| Category | Score |
|---|---|
| Performance | **99** |
| Accessibility | **100** |
| Best Practices | **100** |
| SEO | **100** |

_Production build served via `vite preview` on port 4173. Chromium (ARM64)._

### 3. Key Metrics

| Metric | Value |
|---|---|
| First Contentful Paint | 1.7 s |
| Largest Contentful Paint | 1.7 s |
| Total Blocking Time | 40 ms |
| Cumulative Layout Shift | 0.007 |
| Speed Index | 1.7 s |
| Time to Interactive | 2.2 s |

### 4. Optimization Opportunities

| Audit | Score | Detail |
|---|---|---|
| Reduce unused JavaScript | 0 | Est savings of 21 KiB in `vendor-k_zW90Jm.js` (react-dom internals) |

### 5. Diagnostics

| Diagnostic | Value |
|---|---|
| JavaScript execution time | 0.3 s |
| Main-thread work | 2.0 s |

### 6. Full Quality Suite

| Check | Result |
|---|---|
| Build | :white_check_mark: Successful |
| Typecheck | :white_check_mark: 0 errors |
| Lint | :white_check_mark: 0 warnings/errors |
| Web Tests | :white_check_mark: **723/723 passing** |
| API Tests | :white_check_mark: **443/443 passing** |
| Shared Tests | :white_check_mark: **578/578 passing** |
| Total Tests | :white_check_mark: **1744/1744 passing** |

### 7. Code Quality Verification

- `@ts-ignore`/`@ts-expect-error`: **0** (in source code) :white_check_mark:
- `as any`: **0** (in source code) :white_check_mark:

### 8. Performance Regression Check vs Previous Audit

| Metric | Previous (Run 1) | This Run (2) | Δ |
|---|---|---|---|
| Console Errors | 0 | 0 | — |
| Performance Score | 100 | 99 | -1 |
| Bundle Analysis | — | `vendor` chunk: 21 KiB unused (react-dom) | New |

### 9. Unused JavaScript Analysis

Lighthouse flagged ~21 KiB of unused code in the `vendor` bundle (react + react-dom + zustand + scheduler). Analysis:

- **Source**: `vendor-k_zW90Jm.js` (60.9 KB gzip, 34.7% unused)
- **Root cause**: `react-dom` includes internal APIs (`createPortal`, `flushSync`, `findDOMNode`, etc.) not called during initial page render. These cannot be tree-shaken due to react-dom's module structure.
- **Impact**: 1-point Performance score drop from perfect 100. No user-facing impact — all code is loaded in the same HTTP request and does not block rendering.
- **Verdict**: Inherent to React SPA architecture. No actionable fix without framework-level changes.

## Conclusions

> **BroCula verdict**: Console is **clean** (0 errors, 0 warnings). All **1744 tests pass** (723 web + 443 API + 578 shared) with zero lint/typecheck errors and clean build. Lighthouse at **99-100-100-100** — near-perfect scores. The 1-point Performance dip is from 21 KiB of unused react-dom internals in the vendor chunk, which is inherent to React SPA architecture and not practically actionable. **Codebase remains in excellent condition.**

---

_Hunt conducted by BroCula - Ultrawork Loop (Run 2, 2026-07-03)_
