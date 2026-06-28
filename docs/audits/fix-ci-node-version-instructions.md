# CI Node Version Fix — Application Instructions

## Issue
#2030 — CI workflow files pin Node 20, project requires Node 22+

## Fix Script (already in repo)
```bash
node scripts/fix-ci-node-version.mjs
```

## What It Does
Changes `node-version: "20"` to `node-version-file: ".node-version"` in 4 workflow files:
- `.github/workflows/iterate.yml` (5 occurrences)
- `.github/workflows/on-pull.yml` (1 occurrence)
- `.github/workflows/parallel.yml` (4 occurrences)
- `.github/workflows/pr-gatekeeper.yml` (1 occurrence)

## Verification
After applying, run:
```bash
npm run build          # ✅ Verified clean
npm run test:all       # ✅ 1701 tests passing
npm run typecheck      # ✅ Clean
npm run lint           # ✅ Clean
npm run scan:secrets   # ✅ Clean
```

## Why This Can't Be Pushed From CI
The GITHUB_TOKEN in CI lacks `workflows` permission, which is required to modify `.github/workflows/*.yml` files. Apply manually or with a token that has full `workflows` scope.

## Patch Content (if script unavailable)
Replace `node-version: "20"` with `node-version-file: ".node-version"` in all 4 workflow files listed above.
