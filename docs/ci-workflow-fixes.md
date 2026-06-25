## CI Workflow Fix Instructions

### Node.js 20 → 22 Migration

The project requires Node.js 22+ (declared in `.nvmrc`, `.node-version`, `package.json engines`),
but all CI workflow files were pinned to Node.js 20.

**Status**: Fix has been manually applied to `.github/workflows/` files. 

**To push the fix**, you need a token with `workflows: write` permission:

```bash
# Run the fix script:
node scripts/fix-ci-node-version.mjs

# Commit and push:
git add .github/workflows/
git commit -m "fix(ci): update node-version from '20' to '22'"
git push origin HEAD:fix/ci-node-version-22
```

Then create a PR at:
https://github.com/cpa03/blueprintify/pull/new/fix/ci-node-version-22

**Verification** (all passing with Node 22):
- ✅ Build (4.72s)
- ✅ Typecheck (tsc --noEmit)
- ✅ Lint (eslint)
- ✅ 948 tests passing (438 API + 510 shared)
