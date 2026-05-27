#!/usr/bin/env bash
# ============================================================================
# Flexy says: No hardcoded values - everything in one source of truth!
# Centralized script configuration for Blueprint Generator deployment & CI
# ============================================================================

# SCRIPT PATHS
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
WORKFLOW_DIR="$PROJECT_ROOT/.github/workflows"

# NODE VERSION
NODE_VERSION_FILE="$PROJECT_ROOT/.node-version"

# DEPLOYMENT URLS
STAGING_API_URL="https://api-staging.blueprintify.dev"
PRODUCTION_API_URL="https://api.blueprintify.dev"
STAGING_API_PATTERN="api-staging.blueprintify.dev"
PRODUCTION_API_PATTERN="api.blueprintify.dev"

# VALID ENVIRONMENTS
ENVIRONMENTS=("staging" "production")

# DEPLOYMENT SETTINGS
STAGING_SLEEP_SECONDS=3
PRODUCTION_SLEEP_SECONDS=5
