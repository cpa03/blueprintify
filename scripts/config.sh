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

# DEPLOYMENT URLS (configurable via env vars, defaults for Blueprint Generator)
STAGING_API_URL="${STAGING_API_URL:-https://api-staging.blueprintify.dev}"
PRODUCTION_API_URL="${PRODUCTION_API_URL:-https://api.blueprintify.dev}"
STAGING_API_PATTERN="${STAGING_API_PATTERN:-api-staging.blueprintify.dev}"
PRODUCTION_API_PATTERN="${PRODUCTION_API_PATTERN:-api.blueprintify.dev}"

# VALID ENVIRONMENTS
ENVIRONMENTS=("staging" "production")

# DEPLOYMENT SETTINGS (configurable via env vars)
STAGING_SLEEP_SECONDS="${STAGING_SLEEP_SECONDS:-3}"
PRODUCTION_SLEEP_SECONDS="${PRODUCTION_SLEEP_SECONDS:-5}"
