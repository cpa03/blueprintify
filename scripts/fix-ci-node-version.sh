#!/usr/bin/env bash
# Fix CI Node.js version mismatch (#1390)
# Changes hardcoded node-version to node-version-file for single-source-of-truth
# Flexy says: No hardcoded values - read from .node-version!
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/config.sh"

if [ ! -d "$WORKFLOW_DIR" ]; then
  echo "Error: .github/workflows directory not found"
  exit 1
fi

NODE_VERSION=$(cat "$NODE_VERSION_FILE" 2>/dev/null || echo "22")
echo "📦 Using Node.js version from $NODE_VERSION_FILE: v$NODE_VERSION"

# Replace hardcoded node-version: with node-version-file reference
# This is the Flexy way: single source of truth, no hardcoded values!
for file in "$WORKFLOW_DIR"/*.yml; do
  if [ -f "$file" ]; then
    # Replace node-version: "VERSION" with node-version-file: ".node-version"
    sed -i 's/node-version: "[0-9]*"/node-version-file: "\.node-version"/g' "$file"
    # Also handle unquoted: node-version: 20
    sed -i 's/node-version: [0-9]*$/node-version-file: "\.node-version"/' "$file"
    echo "✓ Updated: $file"
  fi
done

echo ""
echo "✅ Done. All workflows now reference .node-version as single source of truth."
echo "   Verify with: grep -rn 'node-version' .github/workflows/"
echo ""
echo "   Changes made:"
echo "     - Removed hardcoded version strings (e.g., \"20\", \"22\")"
echo "     - Using node-version-file: \".node-version\" instead"
echo "     - CI auto-syncs with project's actual Node.js version"
