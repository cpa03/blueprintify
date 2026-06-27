# CI/CD Configuration

## Node.js Version

**Required: Node.js 22+**

The project requires Node.js 22+ (see `.nvmrc`, `.node-version`, `package.json` `engines`).

### ⚠️ Workflow Node Version: Not Yet Applied

The CI workflow files **still** use `node-version: "20"` (hardcoded in 11 occurrences across 5 files). The automated bot token (`GITHUB_TOKEN`) lacks `workflows: write` permission, which prevents pushing changes to workflow (`.github/workflows/*.yml`) files.

This is a **known, documented limitation**. All prior BugFixer cycles have been blocked by the same permission issue.

**To apply manually:**
```bash
# Checkout the branch from the most recent BugFixer cycle:
git checkout fix/bugfixer-cycle-jun-26
git push origin fix/bugfixer-cycle-jun-26
gh pr create --base main --head fix/bugfixer-cycle-jun-26 \
  --title "fix(ci): BUG-014 BUG-017 — fix stale doc refs and hardcoded node-version"
```

The fix replaces `node-version: "20"` with `node-version-file: ".node-version"` across:
- `.github/workflows/iterate.yml` (5 occurrences)
- `.github/workflows/parallel.yml` (4 occurrences)
- `.github/workflows/on-pull.yml` (1 occurrence)
- `.github/workflows/pr-gatekeeper.yml` (1 occurrence)

Additionally, `docs/bug.md` → `docs/bugs.md` and `docs/feature.md` → `docs/features.md` in `.github/workflows/main.yml`.

### Setup

```bash
# Use nvm (see .nvmrc)
nvm use

# Or fnm
fnm use

# Verify
node --version  # Should be v22.x.x
```

### CI Workflow Pattern

All CI workflows use `ubuntu-24.04-arm` runners and `actions/setup-node@v6`. The node version is currently hardcoded as `"20"` (awaiting PR with `workflows: write` permission):

```yaml
- uses: actions/setup-node@v6
  with:
    node-version: "20"  # To be replaced with node-version-file: ".node-version"
    cache: "npm"
```

### Verification

The project includes an automated check via `scripts/ensure-node-version.mjs`.
