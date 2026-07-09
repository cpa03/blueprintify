#!/bin/bash
# Script to apply Node.js 20→22 version bump across CI workflows
# Run from repo root: bash scripts/apply-node22-fix.sh
set -e
echo "Applying Node.js version 20→22 fix..."
# iterate.yml - 5 occurrences
sed -i 's/node-version: "20"/node-version: "22"/g' .github/workflows/iterate.yml
# parallel.yml - 4 occurrences
sed -i 's/node-version: "20"/node-version: "22"/g' .github/workflows/parallel.yml
# on-pull.yml - 1 occurrence
sed -i 's/node-version: 20/node-version: "22"/' .github/workflows/on-pull.yml
# pr-gatekeeper.yml - 1 occurrence
sed -i 's/node-version: "20"/node-version: "22"/g' .github/workflows/pr-gatekeeper.yml
echo "Done! 11 occurrences updated."
echo "Please verify with: grep 'node-version' .github/workflows/*.yml"
