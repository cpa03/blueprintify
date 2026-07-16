# RepoKeeper Cycle 258 — Documentation Drift Fix

> **Goal:** Fix 2 documentation drift issues in `docs/api-documentation.md` and create PR.

**Architecture:** API docs describe behavior that no longer matches actual API implementation.

**Tech Stack:** Markdown documentation

---

### Task 1: Fix rate limiting documentation drift

**Files:**
- Modify: `docs/api-documentation.md:672-675`

**Issue:** Line 674 says "Currently, there are no explicit rate limits implemented" but `apps/api/src/index.ts:84` applies global rate limiting middleware.

**Fix:** Update text to describe the actual rate limiting implementation.

**Verify:** Run `npm run lint` to ensure no build/lint errors.

**Commit:** `docs: fix rate limiting documentation to match actual implementation`

---

### Task 2: Fix storage clear endpoint documentation

**Files:**
- Modify: `docs/api-documentation.md:421-451`

**Issue:** Documentation shows Storage Clear using a JSON request body (`StorageClearRequest` with `confirm: boolean`), but the actual implementation in `apps/api/src/routes/storage.ts:168-216` uses a query parameter `?confirm=true`.

**Fix:** Update documentation to describe the query parameter approach instead of request body.

**Verify:** Run `npm run lint` to ensure no build/lint errors.

**Commit:** `docs: fix storage clear endpoint docs to use query param instead of body`

---

### Task 3: Verify build and lint

**Files:**
- Run: `npm run build` (root)
- Run: `npm run lint` (root)
- Run: `npm run build -w @blueprint/shared`

**Expected:** All pass cleanly with no errors.

---

### Task 4: Create PR

**Steps:**
1. Create branch `docs/repokeeper-cycle-258-doc-drift-fix`
2. Commit fixes
3. Push branch
4. Create PR
