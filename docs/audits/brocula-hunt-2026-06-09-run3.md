# BroCula Hunt Report - 2026-06-09 (Run 3)

## Summary

BroCula completed browser console audit and Lighthouse optimization check for current state on `main`.

Commits audited since last report (4f23287..fde90a1):

- `feat(flexy): eliminate remaining hardcoded role strings in share routes and tests`
- `fix(ci): update Node.js version to 22 across all CI workflows`
- `chore(repokeeper): cycle 75 - archive stale Jun 8 BroCula audits, update docs`

## Audit Results

### 1. Browser Console Errors/Warnings

| Check                   | Result | Count |
| ----------------------- | ------ | ----- |
| Console Errors          | ✅     | 0     |
| Console Warnings        | ✅     | 0     |
| Page Errors             | ✅     | 0     |
| Failed Network Requests | ✅     | 0     |

_Tested with Playwright Chromium on Vite dev server. Includes homepage load, template card interaction (Next.js), project info form fill, keyboard shortcuts (?/Escape/Ctrl+E), editor panel toggle, and full-page scroll interaction._

### 2. Lighthouse Scores (Production Build)

| Category       | Score       |
| -------------- | ----------- |
| Performance    | **100/100** |
| Accessibility  | **100/100** |
| Best Practices | **100/100** |
| SEO            | **100/100** |

### 3. Key Metrics

| Metric                   | Value | Score   |
| ------------------------ | ----- | ------- |
| First Contentful Paint   | 1.1 s | 99/100  |
| Largest Contentful Paint | 1.1 s | 100/100 |
| Total Blocking Time      | 60 ms | 100/100 |
| Cumulative Layout Shift  | 0.007 | 100/100 |
| Speed Index              | 1.4 s | 100/100 |
| Time to Interactive      | 2.6 s | 98/100  |

_Scores consistent with Run 2 — no regression detected._

### 4. Optimization Opportunities

| Audit             | Score  | Detail                                                                                             |
| ----------------- | ------ | -------------------------------------------------------------------------------------------------- |
| Unused JavaScript | 50/100 | ~25 KiB in animation chunk (framer-motion, loaded on demand — expected lazy-load overhead for SPA) |

_No new optimization opportunities identified. The sole remaining flag is the expected framer-motion chunk overhead._

### 5. Diagnostics

| Metric                    | Value   |
| ------------------------- | ------- |
| JavaScript execution time | 0.5 s   |
| Main-thread work          | 2.1 s   |
| Total network payload     | 234 KiB |
| Network RTT               | 20 ms   |
| Server latency            | 10 ms   |

### 6. Quality Checks

| Check          | Result      |
| -------------- | ----------- |
| Build          | ✅          |
| Lint           | ✅          |
| Tests (web)    | ✅ 596 pass |
| Tests (api)    | ✅ 342 pass |
| Tests (shared) | ✅ 228 pass |

### 7. Code Quality Checks

| Check                      | Result |
| -------------------------- | ------ |
| `@ts-ignore`/`as any`      | ✅ 0   |
| `console.log` in prod code | ✅ 0   |

### 8. Issues Found and Fixed

| Issue                                                                                                                                                     | Severity | Status                                               |
| --------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- | ---------------------------------------------------- |
| Domain inconsistency: `sitemap.xml` and `robots.txt` reference `blueprintify.app` while canonical URL and all API/security configs use `blueprintify.dev` | Medium   | **Fixed** — both files aligned to `blueprintify.dev` |

### 9. Performance Comparison vs Previous Audit

| Metric            | Jun 9 Run 2 | Jun 9 Run 3 | Delta |
| ----------------- | ----------- | ----------- | ----- |
| Performance Score | 100/100     | 100/100     | —     |
| Accessibility     | 100/100     | 100/100     | —     |
| Best Practices    | 100/100     | 100/100     | —     |
| SEO               | 100/100     | 100/100     | —     |

### 10. Verdict

| Check                    | Result                  |
| ------------------------ | ----------------------- |
| Console                  | ✅ Zero errors/warnings |
| Lighthouse               | ✅ 100-100-100-100      |
| Build/Lint               | ✅ Zero warnings        |
| Type Suppressions (prod) | ✅ Zero                 |
| Regressions              | ✅ None detected        |
| SEO Domain Consistency   | ✅ Fixed                |

### 11. Conclusion

Perfect lighthouse scores maintained (100/100 across all categories). Console remains clean with zero errors/warnings during full interaction flow. All quality checks pass. One SEO domain inconsistency was identified and fixed — `sitemap.xml` and `robots.txt` now use `blueprintify.dev` matching the canonical URL and security configuration.

---

_Hunt conducted by BroCula 🧛‍♂️ — Ultrawork Loop (Run 3)_
