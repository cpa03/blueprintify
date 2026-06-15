#!/bin/bash
# Fix CI Node.js version from 20 to 22 across all workflow files
# The project requires Node.js >=22 (per package.json engines, .nvmrc, .node-version)
# but all CI workflows were pinned to Node.js 20, causing API build failures (wrangler requires Node.js >=22)

set -euo pipefail

FILES=(
  ".github/workflows/iterate.yml"
  ".github/workflows/on-pull.yml"
  ".github/workflows/parallel.yml"
  ".github/workflows/pr-gatekeeper.yml"
)

for file in "${FILES[@]}"; do
  if [[ -f "$file" ]]; then
    sed -i 's/node-version: "20"/node-version: "22"/g' "$file"
    sed -i 's/node-version: 20/node-version: "22"/g' "$file"
    echo "Fixed: $file"
  else
    echo "Not found: $file"
  fi
done

echo "Done. Run 'git diff' to verify changes."
