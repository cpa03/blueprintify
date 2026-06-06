#!/usr/bin/env bash
# Script to apply BUG-014 and BUG-017 CI workflow fixes
# Run from repository root: bash scripts/apply-ci-workflow-fixes.sh
#
# BUG-014: Stale doc references in main.yml (docs/bug.md -> docs/bugs.md etc.)
# BUG-017: CI Node.js version hardcoded as "20" -> node-version-file ".node-version"
#
# NOTE: Requires `workflows: write` permission on GitHub token to push.
#       GITHUB_TOKEN from Actions runner does NOT have this permission.
#       Use a Personal Access Token (PAT) with `workflows` scope instead.

set -euo pipefail

echo "=== Applying BUG-014: Stale doc refs in main.yml ==="
sed -i 's|docs/bug.md, docs/feature.md|docs/bugs.md, docs/features.md|g' .github/workflows/main.yml
sed -i 's|Catat bug baru ke docs/bug.md.|Catat bug baru ke docs/bugs.md.|g' .github/workflows/main.yml
echo "✅ main.yml - stale doc refs fixed"

echo ""
echo "=== Applying BUG-017: node-version hardcoding -> node-version-file ==="

# iterate.yml - 5 instances
sed -i 's/node-version: "20"/node-version-file: ".node-version"/g' .github/workflows/iterate.yml
echo "✅ iterate.yml - 5 instances fixed"

# parallel.yml - 4 instances
sed -i 's/node-version: "20"/node-version-file: ".node-version"/g' .github/workflows/parallel.yml
echo "✅ parallel.yml - 4 instances fixed"

# on-pull.yml - 1 instance (no quotes)
sed -i 's/node-version: 20/node-version-file: ".node-version"/g' .github/workflows/on-pull.yml
echo "✅ on-pull.yml - 1 instance fixed"

# pr-gatekeeper.yml - 1 instance
sed -i 's/node-version: "20"/node-version-file: ".node-version"/g' .github/workflows/pr-gatekeeper.yml
echo "✅ pr-gatekeeper.yml - 1 instance fixed"

echo ""
echo "=== Verification ==="
if grep -rn 'node-version:' .github/workflows/ | grep -v 'node-version-file'; then
  echo "❌ WARNING: Remaining node-version: references found!"
  exit 1
else
  echo "✅ Zero remaining node-version: references"
fi

if grep -rn 'docs/bug\.md\|docs/feature\.md' .github/workflows/; then
  echo "❌ WARNING: Remaining stale doc refs found!"
  exit 1
else
  echo "✅ Zero remaining stale doc refs"
fi

echo ""
echo "=== All fixes applied. Ready to commit. ==="
echo "Run: git add .github/workflows/ && git commit -m \"fix(ci): apply BUG-014 and BUG-017 fixes\" && git push origin HEAD"
