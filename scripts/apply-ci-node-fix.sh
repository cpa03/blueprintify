#!/usr/bin/env bash
# =============================================================================
# apply-ci-node-fix.sh — Update CI workflows from Node.js 20 → 22
# =============================================================================
# BUG-017: All 4 workflow files pin node-version: "20" / node-version: 20 but
# the project requires Node.js >=22 (package.json engines.node).
#
# This script applies the fix to all 11 occurrences across 4 files.
# Run this from the repository root:  bash scripts/apply-ci-node-fix.sh
#
# To verify after applying:  grep -n 'node-version.*20' .github/workflows/*.yml
# Expected: zero matches.
# =============================================================================

set -euo pipefail

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"

echo "=== BUG-017: Updating CI workflows from Node.js 20 → 22 ==="

# pr-gatekeeper.yml (1 occurrence)
sed -i 's/node-version: "20"/node-version: "22"/' "$REPO_ROOT/.github/workflows/pr-gatekeeper.yml"
echo "  ✓ pr-gatekeeper.yml"

# on-pull.yml (1 occurrence, no quotes)
sed -i 's/node-version: 20/node-version: 22/' "$REPO_ROOT/.github/workflows/on-pull.yml"
echo "  ✓ on-pull.yml"

# iterate.yml (5 occurrences)
sed -i 's/node-version: "20"/node-version: "22"/' "$REPO_ROOT/.github/workflows/iterate.yml"
echo "  ✓ iterate.yml"

# parallel.yml (4 occurrences)
sed -i 's/node-version: "20"/node-version: "22"/' "$REPO_ROOT/.github/workflows/parallel.yml"
echo "  ✓ parallel.yml"

echo ""
echo "=== Verification ==="
REMAINING=$(grep -rn 'node-version.*20' "$REPO_ROOT/.github/workflows/" 2>/dev/null || true)
if [ -z "$REMAINING" ]; then
  echo "  ✅ Zero references to Node.js 20 remain in workflows."
else
  echo "  ❌ Remaining references found:"
  echo "$REMAINING"
  exit 1
fi

echo ""
echo "=== Done ==="
echo "Commit these changes and push. Note: requires workflows: write token permission."
echo "If using GITHUB_TOKEN, ensure the calling workflow has: permissions: { contents: write, workflows: write }"
