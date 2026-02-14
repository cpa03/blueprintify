# Technical Findings & Feedback Log

---

> **Specialist Agents append here. Architect Agent reads, categorizes to Memory, and clears this file.**

---

_Add new findings below this line._

## 2026-02-14: DEVOPS-M2-001 Model Standardization Fix Ready

**Status:** ✅ IMPLEMENTED | ⏸️ DEPLOYMENT BLOCKED (Permissions)

**Issue:** [#270](https://github.com/cpa03/blueprintify/issues/270)

### Summary

Successfully fixed all 21 OpenCode model configuration violations across 5 CI/CD workflow files to comply with AGENTS.md Model Mandate requiring exclusive use of `opencode/glm-4.7-free`.

### Violations Found & Fixed

| File                                  | Wrong Model                  | Count | Correct Model           |
| ------------------------------------- | ---------------------------- | ----- | ----------------------- |
| `.github/workflows/main.yml`          | `iflowcn/glm-4.6`            | 8     | `opencode/glm-4.7-free` |
| `.github/workflows/main.yml`          | `opencode/minimax-m2.1-free` | 1     | `opencode/glm-4.7-free` |
| `.github/workflows/ai-on-push.yml`    | `opencode/big-pickle`        | 3     | `opencode/glm-4.7-free` |
| `.github/workflows/iterate.yml`       | `opencode/kimi-k2.5-free`    | 5     | `opencode/glm-4.7-free` |
| `.github/workflows/on pull.yml`       | `opencode/kimi-k2.5-free`    | 1     | `opencode/glm-4.7-free` |
| `.github/workflows/pr-gatekeeper.yml` | `opencode/big-pickle`        | 3     | `opencode/glm-4.7-free` |

**Total: 21 model violations corrected**

### Deployment Blocker

**Error:** GitHub App lacks `workflows` permission to push workflow file changes.

```
refusing to allow a GitHub App to create or update workflow
`.github/workflows/ai-on-push.yml` without `workflows` permission
```

### Required Human Action

A repository administrator must either:

1. **Grant workflows permission** to the GitHub App:
   - Settings → Actions → General → Workflow permissions
   - Enable "Allow GitHub Apps to create and approve pull requests"

2. **OR manually apply the changes:**
   - Changes are ready in local workspace
   - Run verification: `grep -r "model" .github/workflows/*.yml | grep -v "glm-4.7-free"`
   - Should return empty (all models standardized)

### Impact

This fix is **critical** - the current workflow configuration violates AGENTS.md Core Constraint #1 (Model Mandate). All AI agents in the system are currently running with non-compliant models, which may cause:

- Inconsistent behavior across agents
- Potential compatibility issues
- Non-deterministic outputs

### Verification

Post-deployment verification command:

```bash
# Should return NO OUTPUT (all models standardized)
grep -r "model" .github/workflows/*.yml | grep -v "glm-4.7-free"
```

---

_Ultraworked with [Sisyphus](https://github.com/code-yeongyu/oh-my-opencode)_
