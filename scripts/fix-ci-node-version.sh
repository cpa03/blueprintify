#!/usr/bin/env bash
# Apply Node.js version fix across all workflow files
# Replace hardcoded node-version with node-version-file
# Requires a GitHub token with workflows: write permission
set -euo pipefail

cd "$(git rev-parse --show-toplevel)"

echo "=== Fixing CI Node.js version across all workflows ==="
echo ""

FILES=(
  ".github/workflows/iterate.yml"
  ".github/workflows/on-pull.yml"
  ".github/workflows/parallel.yml"
  ".github/workflows/pr-gatekeeper.yml"
)

for file in "${FILES[@]}"; do
  if [[ -f "$file" ]]; then
    # Replace node-version: "20" or node-version: 20 with node-version-file
    sed -i 's/node-version: "20"/node-version-file: ".node-version"/g' "$file"
    sed -i 's/node-version: 20/node-version-file: ".node-version"/g' "$file"
    echo "  ✅ Fixed: $file"
  else
    echo "  ❌ Not found: $file"
  fi
done

echo ""
echo "=== Verifying no hardcoded node-version remains ==="
REMAINING=$(grep -rn 'node-version:' .github/workflows/ 2>/dev/null || true)
if [[ -z "$REMAINING" ]]; then
  echo "  ✅ All hardcoded node-version references removed"
else
  echo "  ⚠️  Remaining references found:"
  echo "$REMAINING"
fi

echo ""
echo "=== Commit and push ==="
echo "Run the following to commit and push:"
echo ""
echo "  git add .github/workflows/"
echo "  git commit -m \"fix(ci): replace node-version with node-version-file across all workflows\""
echo "  git push origin HEAD:refs/heads/fix/ci-node-version-22"
echo ""
echo "Then create PR:"
echo "  gh pr create --title \"fix(ci): update Node.js version across all workflows\" \\"
echo "    --body \"Replaces hardcoded node-version: '20' with node-version-file: '.node-version',"
echo "reading the Node.js version from the project's .node-version file (22)."
echo ""
echo "Closes #2253\""
