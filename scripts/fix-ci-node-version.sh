#!/usr/bin/env bash
# Fix CI Node.js version mismatch (#1390)
# Changes node-version from "20" to "22" in all workflow files
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
WORKFLOW_DIR="$SCRIPT_DIR/../.github/workflows"

if [ ! -d "$WORKFLOW_DIR" ]; then
  echo "Error: .github/workflows directory not found"
  exit 1
fi

# Change node-version "20" to "22" (with quotes)
for file in "$WORKFLOW_DIR"/iterate.yml "$WORKFLOW_DIR"/parallel.yml "$WORKFLOW_DIR"/pr-gatekeeper.yml; do
  if [ -f "$file" ]; then
    sed -i 's/node-version: "20"/node-version: "22"/g' "$file"
    echo "Updated: $file"
  fi
done

# Change node-version 20 to 22 (without quotes - on-pull.yml)
if [ -f "$WORKFLOW_DIR"/on-pull.yml ]; then
  sed -i 's/node-version: 20$/node-version: 22/' "$WORKFLOW_DIR"/on-pull.yml
  echo "Updated: $WORKFLOW_DIR/on-pull.yml"
fi

echo "Done. Verify with: grep -rn 'node-version:' .github/workflows/"
