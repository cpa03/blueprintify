#!/usr/bin/env bash
# Script to apply BUG-014 and BUG-017 CI workflow fixes
# Run from repository root: bash scripts/apply-ci-workflow-fixes.sh
#
# BUG-014: Stale doc references in main.yml
# BUG-017: CI Node.js version mismatch (20 -> 22)
#
# NOTE: Requires `workflows: write` permission on GitHub token to push.
#       GITHUB_TOKEN from Actions runner does NOT have this permission.
#       Use a Personal Access Token (PAT) with `workflows` scope instead.

set -euo pipefail

echo "=== Applying BUG-014 & BUG-017 fixes ==="

# Fix main.yml stale doc references (BUG-014)
echo "[1/2] Fixing stale doc references in main.yml..."
sed -i 's/docs\/bug.md, docs\/feature.md/docs\/bugs.md, docs\/features.md/g' .github/workflows/main.yml
sed -i 's/Catat bug baru ke docs\/bug.md/Catat bug baru ke docs\/bugs.md/g' .github/workflows/main.yml

# Fix node-version in all workflow files (BUG-017)
echo "[2/2] Updating node-version from 20 to 22 in all workflow files..."
for f in .github/workflows/iterate.yml .github/workflows/parallel.yml .github/workflows/on-pull.yml .github/workflows/pr-gatekeeper.yml; do
  sed -i 's/node-version: "20"/node-version: "22"/g' "$f"
  sed -i 's/node-version: 20/node-version: 22/g' "$f"
  echo "  Fixed: $f"
done

echo ""
echo "=== Changes applied ==="
echo "Files modified:"
git diff --stat

echo ""
echo "=== To verify ==="
echo "  git diff"
echo "  npm run check"
echo ""
echo "=== To push (requires PAT with workflows:write) ==="
echo "  git add .github/workflows/"
echo "  git commit -m \"fix(ci): update Node.js to 22, fix stale doc refs\""
echo "  git push origin HEAD"
