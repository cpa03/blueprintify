#!/usr/bin/env bash
# scripts/fix-ci-node-version.sh
#
# Fix BUG-014 and BUG-017: Updates CI workflow files to use Node.js 22
# and fixes stale documentation references.
#
# These changes require `workflows` permission on the GitHub token.
# The current CI token (github-actions[bot]) does not have this permission,
# so the fix must be applied manually or via a token with workflows: write access.
#
# Usage: bash scripts/fix-ci-node-version.sh
# Then review changes with: git diff

set -euo pipefail

echo "=== BUG-017: Update node-version from 20 to 22 in workflow files ==="

# iterate.yml has 5 occurrences of node-version: "20"
sed -i 's/node-version: "20"/node-version: "22"/g' .github/workflows/iterate.yml

# on-pull.yml has 1 occurrence of node-version: 20 (unquoted)
sed -i 's/node-version: 20$/node-version: 22/' .github/workflows/on-pull.yml

# parallel.yml has 4 occurrences of node-version: "20"
sed -i 's/node-version: "20"/node-version: "22"/g' .github/workflows/parallel.yml

# pr-gatekeeper.yml has 1 occurrence of node-version: "20"
sed -i 's/node-version: "20"/node-version: "22"/g' .github/workflows/pr-gatekeeper.yml

echo "✅ BUG-017: Updated 11 occurrences across 4 workflow files"

echo ""
echo "=== BUG-014: Fix stale documentation references in main.yml ==="

# main.yml references docs/bug.md and docs/feature.md (should be docs/bugs.md, docs/features.md)
sed -i 's|docs/bug\.md|docs/bugs.md|g; s|docs/feature\.md|docs/features.md|g' .github/workflows/main.yml

echo "✅ BUG-014: Updated stale doc refs in .github/workflows/main.yml"

echo ""
echo "=== Verification ==="
echo "Checking for remaining node-version: 20..."
if grep -rn 'node-version.*20' .github/workflows/ 2>/dev/null; then
    echo "❌ Some node-version: 20 entries remain!"
    exit 1
fi
echo "✅ No node-version: 20 entries remain"

echo "Checking for stale doc refs..."
if grep -rn 'docs/bug\.md\|docs/feature\.md' .github/workflows/ 2>/dev/null; then
    echo "❌ Some stale doc refs remain!"
    exit 1
fi
echo "✅ No stale doc refs remain"

echo ""
echo "=== All fixes applied successfully! ==="
echo ""
echo "Next steps:"
echo "  1. Review changes: git diff"
echo "  2. Commit: git add .github/workflows/ && git commit -m \"fix(ci): update Node.js to 22 and fix stale doc refs\""
echo "  3. Push (requires workflows permission): git push"
