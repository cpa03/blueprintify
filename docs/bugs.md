# Bug Log: Known Defects

> **Tracking known bugs and defects** for Blueprintify with status and priority information.

## Active Bugs

### BUG-014: Stale Doc References in main.yml Workflow (RE-OPENED)

**Status**: Active — 2026-05-26 (BugFixer Cycle 3 — re-opened after fix was reverted)  
**Priority**: High  
**Area**: CI/CD  
**Issue**: #1293
**Milestone**: Immediate

#### Description

`.github/workflows/main.yml` continues to reference two non-existent documentation files. Despite multiple fixes, the stale references keep returning (likely re-introduced by workflow auto-generation or merge conflicts):

- `docs/bug.md` → should be `docs/bugs.md`
- `docs/feature.md` → should be `docs/features.md`

#### Fix History

| Cycle   | Date       | Action                       | Status                     |
| ------- | ---------- | ---------------------------- | -------------------------- |
| Cycle 1 | 2026-05-23 | Initial fix                  | Fix lost in PR #1357 merge |
| Cycle 2 | 2026-05-25 | Re-fixed in BugFixer cycle 2 | Fix reverted               |
| Cycle 3 | 2026-05-26 | Re-fixed again               | **Current**                |

#### Latest Fix Applied (Cycle 3)

- Replaced stale `docs/bug.md` → `docs/bugs.md` on lines 38, 262
- Replaced stale `docs/feature.md` → `docs/features.md` on line 38
- Fixed Prettier formatting on 4 workflow YAML files (iterate.yml, main.yml, on-pull.yml, parallel.yml)
- Verified: typecheck/lint/build/test/format all pass clean
- 864 tests passing (473 web + 284 api + 107 shared)

---

### BUG-001: Frontend Bundle Size Performance Issue

**Status**: In Progress  
**Priority**: High  
**Area**: Performance Engineering  
**First Reported**: 2026-02-05 (BroCula Analysis)  
**Milestone**: M2 Release

#### Description

Editor component bundle is 822K, significantly larger than main bundle (336K). This impacts initial load time and user experience. CodeMirror is the primary contributor to the editor bundle size.

#### Symptoms

- Large bundle size affects page load performance
- Editor component includes CodeMirror which is heavy but necessary
- Lighthouse performance score impacted during M1/M2 development

#### Root Cause

- CodeMirror dependency is large but required for editing functionality
- CodeMirror extensions not fully tree-shaken
- Editor bundle can be further optimized

#### Fix Status

**Issue Reference**: #75 (PERF-001)

**Progress**:

- [x] M1 Completed: Basic lazy loading implemented
- [x] M2 Completed: `React.lazy()` + `Suspense` implemented for Editor, TemplateGrid, KeyboardShortcutsModal, GenerationCelebration
- [x] App.tsx: Editor loaded via `React.lazy(() => import("./components/Editor"))`
- [ ] Implement more aggressive code splitting
- [ ] Consider tree-shaking for CodeMirror extensions
- [ ] Optimize bundle splitting strategy

#### Current State (2026-05-23)

- Editor is lazy-loaded with `React.lazy()` + `Suspense` in App.tsx
- TemplateGrid, KeyboardShortcutsModal, GenerationCelebration also lazy-loaded
- Remaining optimization: tree-shake CodeMirror extensions, explore dynamic imports for markdown renderers
- Priority reduced as lazy loading is now in place

#### Target Resolution

- **Timeline**: Future optimization pass
- **Impact**: Improved Lighthouse performance score
- **Priority**: Medium (partially mitigated)

---

### BUG-013: Upstream npm Vulnerabilities (undici, ws via wrangler/miniflare)

**Status**: Upstream Dependency (Cannot Fix)  
**Priority**: Low  
**Area**: DevOps Engineering  
**First Reported**: 2026-05-22

#### Description

npm audit reports 5 vulnerabilities (3 moderate, 2 high) in `undici` and `ws` packages. These are transitive dependencies of Cloudflare tooling (`wrangler` → `miniflare` → `undici`/`ws`).

#### Current Status

- undici: Override set to 7.25.0 (latest 7.x), but nested miniflare copy at 7.18.2 not fully bypassed
- ws: Override set to 8.20.1 (above vulnerable 8.20.0), but nested miniflare copy at 8.18.0
- Full fix requires `@cloudflare/vitest-pool-workers@0.16.8+`, which needs Node 22+ and vitest 4.x
- Tracking upstream: Cloudflare Workers SDK compatibility

---

### BUG-008: ajv Package Security Vulnerabilities

**Status**: Open  
**Priority**: Medium  
**Area**: Security Engineering  
**First Reported**: 2026-02-09  
**Dependency**: ajv (indirect, through @slack/types or similar)

#### Description

Security vulnerabilities in ajv package used as indirect dependency.

#### Current Status

- Affected package: ajv (indirect dependency)
- Severity: Review pending
- Mitigation: Dependency updates tracked through npm audit

---

## Resolved Bugs

- **BUG-002**: Missing Font Display Optimization (Resolved)
- **BUG-003**: Duplicate Retry Configuration (Resolved)
- **BUG-004**: Hardcoded Configuration Values (Resolved)
- **BUG-005**: Missing Tech Stack Category Icons (Resolved)
- **BUG-006**: Console Error Statements in Production Code (Resolved)
- **BUG-007**: TypeScript 'any' Types in Controllers (Resolved)
- **BUG-009**: CI/CD Workflow Configuration Issues (Resolved)
- **BUG-011**: Flaky Analytics Date Range Test (Resolved)
- **BUG-012**: Unhandled Rejection Warnings in Rate Limit Tests (Resolved)
- **BUG-010**: GitHub Actions Invalid Versions @v5 → @v4 (Resolved 2026-05-22)

### BUG-016: Stale Node.js 18+ References in Documentation

**Status**: Resolved — 2026-05-26 (BugFixer Cycle 4)  
**Priority**: Medium  
**Area**: Documentation  
**Issue**: N/A

#### Description

Multiple documentation files still reference Node.js 18+ as the minimum requirement, but the project requires Node.js 22+ (per `.node-version`, `.nvmrc`, and `package.json` engines).

#### Files Fixed

- `README.md` — Prerequisites section
- `CONTRIBUTING.md` — Prerequisites and troubleshooting
- `apps/web/README.md` — Prerequisites section
- `apps/api/README.md` — Prerequisites section
- `docs/troubleshooting.md` — Node version check instruction

#### Verification

- All fixes applied: `node --version` guidance updated to 22+
- Typecheck/lint/build/tests all pass clean

---

**Version**: 1.0.0  
**Last Updated**: 2026-05-27 (Cycle 23)  
**Maintainer**: BugFixer (Ultrawork Loop)

> RepoKeeper cycle 2026-05-26 (Cycle 19): Build/lint/typecheck all passing. Tests: 473 web + 290 api + 107 shared = 870 total, all passing. No new bugs identified. BUG-014 still present in main.yml — blocked by workflow permissions.
> RepoKeeper cycle 2026-05-27 (Cycle 23): Build/lint/typecheck all passing. Tests: 473 web + 296 api + 107 shared = 876 total, all passing. 0 npm vulns. No new bugs identified. BUG-014 still blocked by workflow permissions.
