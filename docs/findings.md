# Findings

> **Incoming signals and observations** - cleared after each orchestration cycle.

---

## 2026-02-18: DX-Engineer Model Standardization

### Finding

All CI/CD workflow files were using inconsistent OpenCode model references, violating the AGENTS.md mandate:

> **Model Mandate**: All agents MUST use `opencode/glm-4.7-free` exclusively

### Models Found (Before Fix)

- `iflowcn/glm-4.6` - main.yml (6 references)
- `opencode/minimax-m2.1-free` - main.yml (1 reference)
- `opencode/kimi-k2.5-free` - ai-on-push.yml, iterate.yml, on pull.yml (7 references)
- `opencode/glm-5-free` - ai-on-push.yml (3 references)
- `opencode/big-pickle` - pr-gatekeeper.yml (3 references)

### Fix Applied

All model references standardized to `opencode/glm-4.7-free`:

- `.github/workflows/main.yml` (9 references updated)
- `.github/workflows/ai-on-push.yml` (3 references updated)
- `.github/workflows/iterate.yml` (5 references updated)
- `.github/workflows/on pull.yml` (1 reference updated)
- `.github/workflows/pr-gatekeeper.yml` (3 references updated)

### Verification

- ✅ Lint: No errors
- ✅ Typecheck: No errors
- ✅ Tests: 74 tests passed
- ✅ Build: Built successfully

### Blocker

Push failed due to GitHub App lacking `workflows` permission. This is the same issue as #270.
The fix is ready locally and can be applied once permissions are resolved.

### Recommendation

Grant GitHub App `workflows` permission to allow automated workflow file updates.

---
