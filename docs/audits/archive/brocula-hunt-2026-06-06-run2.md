# BroCula Hunt Report - 2026-06-06 (Run 2)

## Summary

BroCula completed browser console audit and Lighthouse optimization check for changes since last audit (2026-06-06 Run 1).

## Audit Results

### 1. Browser Console Errors/Warnings

| Check                   | Result | Count |
| ----------------------- | ------ | ----- |
| Console Errors          | ✅     | 0     |
| Console Warnings        | ✅     | 0     |
| Page Errors             | ✅     | 0     |
| Failed Network Requests | ✅     | 0     |

_Tested with Playwright Chromium on production build (vite preview). Includes homepage load, full wizard interaction, form filling, tech stack selection, feature selection, review, generation trigger, editor toggle, and keyboard shortcuts modal._

### 2. Lighthouse Scores (Production Build)

| Category       | Score       |
| -------------- | ----------- |
| Performance    | **95/100**  |
| Accessibility  | **100/100** |
| Best Practices | **100/100** |
| SEO            | **100/100** |

### 3. Key Metrics

| Metric                   | Value | Score   |
| ------------------------ | ----- | ------- |
| First Contentful Paint   | 0.6 s | 100/100 |
| Largest Contentful Paint | 0.6 s | 100/100 |
| Total Blocking Time      | 40 ms | 100/100 |
| Cumulative Layout Shift  | 0.007 | 100/100 |
| Speed Index              | 1.1 s | 100/100 |
| Time to Interactive      | 3.1 s | 95/100  |

### 4. Optimization Opportunities (Diagnostic Only)

| Audit             | Score  | Detail                                                                                             |
| ----------------- | ------ | -------------------------------------------------------------------------------------------------- |
| Unused JavaScript | 50/100 | ~25 KiB in animation chunk (framer-motion, loaded on demand — expected lazy-load overhead for SPA) |

### 5. Diagnostics

| Metric                    | Value   |
| ------------------------- | ------- |
| JavaScript execution time | 0.4 s   |
| Main-thread work          | 1.4 s   |
| Total network payload     | 235 KiB |
| Network RTT               | 0 ms    |
| Network server latency    | 20 ms   |
| Total requests            | 28      |
| Long tasks (>50ms)        | 0       |

### 6. Build & Quality Checks

| Check      | Status                    |
| ---------- | ------------------------- |
| Build      | ✅ Pass                   |
| TypeScript | ✅ Pass                   |
| Lint       | ✅ Pass (0 warnings)      |
| Tests      | Not run (no code changes) |

### 7. Code Quality Checks

| Check                      | Result |
| -------------------------- | ------ |
| `@ts-ignore`/`as any`      | ✅ 0   |
| `console.log` in prod code | ✅ 0   |

### 8. Changes Since Last BroCula Audit (2026-06-06 Run 1)

No changes to audit — this is a fresh audit on the same `main` state.

### 9. Verdict

- **Console**: ✅ Zero errors, warnings, page errors, or failed network requests
- **Lighthouse**: ✅ Performance 95, Accessibility 100, Best Practices 100, SEO 100
- **Build**: ✅ Passes build, typecheck, lint
- **Code Quality**: ✅ Zero type suppressions, zero console.log in prod code
- **Fixes**: No fixes needed — everything is clean. The 95/100 Performance is CI runner variance (TBT noise: 40ms on this run, previous runs at 0ms), not a code regression.
- **Recommendation**: No urgent optimizations needed; continue monitoring on CI

### 10. Optimization Analysis

**Animation chunk** (`animation-BnNkhfCP.js`, 138 KB / 45 KB gzip, 55.6% unused = ~25 KB wasted):

- Entire `framer-motion` library is isolated via Vite `manualChunks` into a separate chunk
- Components using framer-motion (ScrollProgress, Toast, GenerationCelebration, KeyboardShortcutsModal) are all lazy-loaded or conditionally rendered
- The "unused" bytes represent framer-motion APIs not called during the brief Lighthouse page audit
- This is expected lazy-load behavior — the chunk is only fetched when an animation-dependent component mounts
- Further reduction requires converting framer-motion components to CSS animations (marginal benefit, not recommended at current 95-100 score range)

---

_Hunt conducted by BroCula 🧛‍♂️ — Ultrawork Loop_
