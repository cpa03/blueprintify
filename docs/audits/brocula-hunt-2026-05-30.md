# BroCula Hunt Report - 2026-05-30

## Summary

BroCula completed his browser console vampire hunt. Codebase remains in excellent health despite recent feature work (keyboard shortcut tooltips, Flexy hardcoded values elimination).

## Audit Results

### 1. Build & Lint

| Check      | Result                |
| ---------- | --------------------- |
| Build      | **Pass** ✅           |
| Lint       | **Pass** ✅           |
| TypeScript | **Strict** configured |

### 2. Browser Console Errors/Warnings

| Check                   | Result                                      |
| ----------------------- | ------------------------------------------- |
| Console Errors          | **0** ✅                                    |
| Console Warnings        | **0** ✅                                    |
| Page Errors             | **0** ✅                                    |
| Failed Network Requests | **0** ✅                                    |
| Vercel Analytics        | Skipped (local dev — proper guard in place) |

### 3. Lighthouse Scores

| Category       | Score       |
| -------------- | ----------- |
| Performance    | **100/100** |
| Accessibility  | **100/100** |
| Best Practices | **100/100** |
| SEO            | **100/100** |

### 4. Optimization Opportunities (Diagnostic Only)

| Audit             | Score  | Potential Savings | Notes                                   |
| ----------------- | ------ | ----------------- | --------------------------------------- |
| Unused JavaScript | 0/100  | ~66 KiB           | Expected for lazy-loaded SPA            |
| Unused CSS        | 50/100 | ~10 KiB           | Tailwind typography prose (base styles) |

### 5. Bundle Size Analysis

| Chunk                   | Size (raw) | Size (gzip) |
| ----------------------- | ---------- | ----------- |
| Main entry 1 (app)      | 302 KiB    | 96 KiB      |
| Main entry 2 (editor)   | 299 KiB    | 96 KiB      |
| Async: MarkdownRenderer | 191 KiB    | 56 KiB      |
| Async: Framer Motion    | 133 KiB    | 44 KiB      |
| Async: JSZip            | 95 KiB     | 28 KiB      |
| Async: Editor           | 68 KiB     | 20 KiB      |
| Async: StepStack        | 65 KiB     | 16 KiB      |
| CSS                     | 89 KiB     | 13 KiB      |
| Other async chunks (12) | ~40 KiB    | ~12 KiB     |
| Purify (DOMPurify)      | 25 KiB     | 9 KiB       |

**Total: ~1 MB uncompressed (~270 KiB gzipped)**

### 6. Diff Analysis (since last audit 2026-05-29)

| PR    | Description                                                        | Impact                |
| ----- | ------------------------------------------------------------------ | --------------------- |
| #1460 | Keyboard shortcut tooltip for editor hide buttons                  | Clean — no regression |
| #1461 | RepoKeeper cleanup cycle 32                                        | Clean — no regression |
| #1462 | Flexy hardcoded values elimination (animation timings, API method) | Clean — no regression |

No console errors, no build/lint failures, no Lighthouse score drops.

### 7. Findings

- **No new console errors or warnings** introduced by recent feature work.
- **Lighthouse scores remain perfect** (100/100) across all four measured categories.
- **Vercel Analytics** properly guarded against running in local/dev mode — no 404 errors from `/_vercel/` endpoints.
- **CSS tree-shaking** is effective — JIT mode only generates `prose-sm` and `prose-invert` modifiers alongside the base `prose` class. No extraneous prose modifiers (no `prose-lg`, `prose-xl`, `prose-slate`, etc.).
- **All animations** now use centralized constants from `ANIMATION`/`ANIMATION_TIMING` (Flexy compliance).
- **API method** uses centralized constant `API_CALL_CONFIG.METHOD` instead of hardcoded `"POST"`.

### 8. Recommendations

- No urgent optimizations needed — codebase is in great shape.
- Continue monitoring Lighthouse scores in CI to catch regressions.
- The 66 KiB "unused JS" diagnostic is expected SPA overhead from lazy-loaded chunks that are only loaded on-demand (Editor, MarkdownRenderer, JSZip, Framer Motion).

---

_Hunt conducted by BroCula 🧛‍♂️_
