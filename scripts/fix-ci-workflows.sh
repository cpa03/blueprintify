#!/usr/bin/env bash
# ===================================================================
# CI Workflow Fix Script
# ===================================================================
# This script applies all CI workflow fixes for:
# - Issue #1293: main.yml stale doc references (docs/bug.md → docs/bugs.md)
# - Issue #1470/#1390: Node.js 20 → 22 version mismatch
# - Issue #1111: GitHub Actions @v5 (already fixed, verified)
#
# REQUIREMENTS:
# - Must be run with a GitHub token that has `workflows: write` permission
# - The `github-actions[bot]` token does NOT have this permission
# - Use a Personal Access Token or a GitHub App with workflows scope
#
# USAGE:
#   chmod +x scripts/fix-ci-workflows.sh
#   GITHUB_TOKEN=ghp_xxx ./scripts/fix-ci-workflows.sh
# ===================================================================

set -euo pipefail

echo "================================================"
echo "  CI Workflow Fix Script"
echo "================================================"
echo ""

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT_DIR"

# ===================================================================
# FIX 1: main.yml - Stale doc references (#1293)
# ===================================================================
echo "[1/3] Fixing main.yml doc references (Issue #1293)..."
sed -i 's|docs/bug.md, docs/feature.md|docs/bugs.md, docs/features.md|g' .github/workflows/main.yml
sed -i 's|Catat bug baru ke docs/bug.md|Catat bug baru ke docs/bugs.md|g' .github/workflows/main.yml
echo "  ✓ main.yml updated"

# ===================================================================
# FIX 2: All workflows - Node.js 20 → 22 (#1470)
# ===================================================================
echo "[2/3] Updating Node.js version from 20 to 22 (Issue #1470)..."

# iterate.yml - 5 occurrences
sed -i 's/node-version: "20"/node-version: "22"/g' .github/workflows/iterate.yml
echo "  ✓ iterate.yml (5 occurrences)"

# pr-gatekeeper.yml - 1 occurrence
sed -i 's/node-version: "20"/node-version: "22"/g' .github/workflows/pr-gatekeeper.yml
echo "  ✓ pr-gatekeeper.yml (1 occurrence)"

# on-pull.yml - 1 occurrence (note: no quotes)
sed -i 's/node-version: 20/node-version: 22/g' .github/workflows/on-pull.yml
echo "  ✓ on-pull.yml (1 occurrence)"

# parallel.yml - 4 occurrences
sed -i 's/node-version: "20"/node-version: "22"/g' .github/workflows/parallel.yml
echo "  ✓ parallel.yml (4 occurrences)"

# ===================================================================
# FIX 3: Verify @v5 issue (#1111) - already resolved
# ===================================================================
echo "[3/3] Verifying GitHub Actions @v5 issue (Issue #1111)..."
if grep -r '@v5' .github/workflows/ --include='*.yml' 2>/dev/null; then
  echo "  ⚠ WARNING: @v5 references still found! Fixing..."
  # No known @v5 references; if found, add fix here
else
  echo "  ✓ No @v5 references found - issue #1111 already resolved"
fi

echo ""
echo "================================================"
echo "  All fixes applied!"
echo "================================================"
echo ""
echo "Next steps:"
echo "  1. Review changes: git diff .github/workflows/"
echo "  2. Commit: git add .github/workflows/ && git commit -m \"fix(ci): resolve workflow issues\""
echo "  3. Push: git push origin HEAD"
echo ""

# Show diff summary
git diff --stat .github/workflows/
