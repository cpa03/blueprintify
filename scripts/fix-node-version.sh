#!/usr/bin/env bash
# Script to fix node-version from 20 to 22 in all workflow files
# Run: bash scripts/fix-node-version.sh
set -euo pipefail

FILES=(
  ".github/workflows/iterate.yml"
  ".github/workflows/on-pull.yml"
  ".github/workflows/parallel.yml"
  ".github/workflows/pr-gatekeeper.yml"
)

echo "Updating node-version from 20 to 22 in workflow files..."
for file in "${FILES[@]}"; do
  if [[ -f "$file" ]]; then
    # Replace all occurrences of node-version: "20" or node-version: 20 with node-version: "22"
    sed -i 's/node-version: "20"/node-version: "22"/g; s/node-version: 20/node-version: "22"/g' "$file"
    echo "  ✓ $file updated"
  else
    echo "  ✗ $file not found — skipping"
  fi
done

echo ""
echo "Done! Verify with: grep -n 'node-version' .github/workflows/*.yml"
echo "Then commit and push."
