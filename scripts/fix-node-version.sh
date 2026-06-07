#!/bin/bash
# Fix: Update node-version from 20 to 22 in all CI workflow files
# The project requires Node.js v22 (.nvmrc specifies 22, wrangler enforces 22+)
# All CI workflows used node-version "20" or 20, which caused build failures.

set -euo pipefail

FILES=(
  ".github/workflows/iterate.yml"
  ".github/workflows/parallel.yml"
  ".github/workflows/on-pull.yml"
  ".github/workflows/pr-gatekeeper.yml"
)

for file in "${FILES[@]}"; do
  if [ -f "$file" ]; then
    echo "Patching $file..."
    if [[ "$(uname)" == "Darwin" ]]; then
      sed -i '' 's/node-version: "20"/node-version: "22"/g' "$file"
      sed -i '' 's/node-version: 20/node-version: "22"/g' "$file"
    else
      sed -i 's/node-version: "20"/node-version: "22"/g' "$file"
      sed -i 's/node-version: 20/node-version: "22"/g' "$file"
    fi
  fi
done

echo "Done! Updated node-version to 22 in all workflow files."
