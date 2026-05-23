#!/bin/bash
# =============================================================================
# Blueprintify - Cloudflare Resource Setup Script
# =============================================================================
# Creates required Cloudflare resources (KV namespaces, D1 databases) and
# updates wrangler.toml with real resource IDs.
#
# Usage:
#   ./scripts/setup-cloudflare-resources.sh              # Interactive setup
#   ./scripts/setup-cloudflare-resources.sh --dry-run     # Preview only
#   ./scripts/setup-cloudflare-resources.sh --non-interactive  # Auto-create
#
# Prerequisites:
#   - wrangler CLI installed and authenticated
#   - Cloudflare account with Workers paid plan (for D1)
# =============================================================================

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
WRANGLER_TOML="$PROJECT_ROOT/apps/api/wrangler.toml"
API_DIR="$PROJECT_ROOT/apps/api"

# Parse flags
DRY_RUN=false
NON_INTERACTIVE=false
for arg in "$@"; do
  case "$arg" in
    --dry-run) DRY_RUN=true ;;
    --non-interactive) NON_INTERACTIVE=true ;;
  esac
done

echo "======================================"
echo "  Cloudflare Resource Setup"
echo "======================================"
echo ""

# ── Prerequisites ──────────────────────────────────────────────────────────

if ! command -v wrangler &>/dev/null; then
  echo "❌ 'wrangler' CLI not found. Install it with:"
  echo "   npm install -g wrangler"
  exit 1
fi

if ! wrangler whois &>/dev/null 2>&1; then
  echo "⚠️  Not authenticated. Run: wrangler login"
  if [ "$NON_INTERACTIVE" = false ]; then
    echo "   Then re-run this script."
  fi
  exit 1
fi

echo "✓ wrangler CLI found and authenticated"
echo ""

# ── Helper Functions ───────────────────────────────────────────────────────

create_kv_namespace() {
  local env_label="$1"
  local binding="$2"
  
  echo "  → Creating KV namespace '$binding' ($env_label)..."
  if [ "$DRY_RUN" = true ]; then
    echo "    [DRY RUN] wrangler kv namespace create \"$binding\""
    echo "    [DRY RUN] wrangler kv namespace create \"$binding\" --env $env_label"
    echo "    PLACEHOLDER_ID"
    return
  fi
  
  local output
  if output=$(wrangler kv namespace create "$binding" 2>&1); then
    local id
    id=$(echo "$output" | grep -oP '"id":\s*"\K[^"]+' | head -1)
    if [ -n "$id" ]; then
      echo "$id"
    else
      echo "⚠️  Could not parse ID. Output: $output" >&2
      echo ""
    fi
  else
    echo "⚠️  Failed to create KV namespace (may already exist)" >&2
    echo ""
  fi
}

create_d1_database() {
  local db_name="$1"
  
  echo "  → Creating D1 database '$db_name'..."
  if [ "$DRY_RUN" = true ]; then
    echo "    [DRY RUN] wrangler d1 create \"$db_name\""
    echo "    PLACEHOLDER_DB_ID"
    return
  fi
  
  local output
  if output=$(wrangler d1 create "$db_name" 2>&1); then
    local id
    id=$(echo "$output" | grep -oP '"uuid":\s*"\K[^"]+' | head -1)
    if [ -n "$id" ]; then
      echo "$id"
    else
      # Try alternative format
      id=$(echo "$output" | grep -oP 'database_id\s*=\s*"\K[^"]+' | head -1)
      if [ -n "$id" ]; then
        echo "$id"
      else
        echo "⚠️  Could not parse database ID. Output: $output" >&2
        echo ""
      fi
    fi
  else
    echo "⚠️  Failed to create D1 database (may already exist)" >&2
    echo ""
  fi
}

update_wrangler_toml() {
  local placeholder="$1"
  local real_id="$2"
  local description="$3"
  
  if [ "$DRY_RUN" = true ]; then
    echo "    [DRY RUN] Replace '$placeholder' → '$real_id' ($description)"
    return
  fi
  
  if [ -z "$real_id" ]; then
    echo "    ⚠️  Skipping '$placeholder' - no real ID provided"
    return
  fi
  
  if grep -q "$placeholder" "$WRANGLER_TOML"; then
    if [[ "$OSTYPE" == "darwin"* ]]; then
      sed -i '' "s/$placeholder/$real_id/g" "$WRANGLER_TOML"
    else
      sed -i "s/$placeholder/$real_id/g" "$WRANGLER_TOML"
    fi
    echo "    ✓ Updated '$description' in wrangler.toml"
  else
    echo "    ℹ️  '$placeholder' not found in wrangler.toml (already updated?)"
  fi
}

# ── Main Setup ─────────────────────────────────────────────────────────────

echo "📋 Resource Plan:"
echo "  KV Namespaces:"
echo "    - CACHE (default)"
echo "    - CACHE (staging)"
echo "    - CACHE (production)"
echo "  D1 Databases:"
echo "    - blueprint-db (default)"
echo "    - blueprint-db-staging"
echo "    - blueprint-db-prod"
echo ""

if [ "$DRY_RUN" = false ] && [ "$NON_INTERACTIVE" = false ]; then
  read -p "Proceed with creating these resources? (yes/no): " -r confirm
  if [[ ! "$confirm" =~ ^[Yy][Ee][Ss]$ ]]; then
    echo "❌ Setup cancelled."
    exit 1
  fi
fi

echo ""
echo "🚀 Creating resources..."
echo ""

# ── Default (Dev) KV Namespace ──────────────────────────────────────────

cd "$API_DIR"

echo "🔑 [Default] KV Namespace: CACHE"
KV_DEFAULT_ID=$(create_kv_namespace "default" "CACHE")
update_wrangler_toml "cache_kv_namespace_id" "$KV_DEFAULT_ID" "default KV namespace"

echo ""
echo "🔑 [Staging] KV Namespace: CACHE"
KV_STAGING_ID=$(create_kv_namespace "staging" "CACHE")
update_wrangler_toml "staging_cache_kv_id" "$KV_STAGING_ID" "staging KV namespace"

echo ""
echo "🔑 [Production] KV Namespace: CACHE"
KV_PROD_ID=$(create_kv_namespace "production" "CACHE")
update_wrangler_toml "production_cache_kv_id" "$KV_PROD_ID" "production KV namespace"

echo ""
echo "💾 [Default] D1 Database: blueprint-db"
DB_DEFAULT_ID=$(create_d1_database "blueprint-db")
update_wrangler_toml "local_database_id" "$DB_DEFAULT_ID" "default D1 database"

echo ""
echo "💾 [Staging] D1 Database: blueprint-db-staging"
DB_STAGING_ID=$(create_d1_database "blueprint-db-staging")
update_wrangler_toml "staging_database_id" "$DB_STAGING_ID" "staging D1 database"

echo ""
echo "💾 [Production] D1 Database: blueprint-db-prod"
DB_PROD_ID=$(create_d1_database "blueprint-db-prod")
update_wrangler_toml "production_database_id" "$DB_PROD_ID" "production D1 database"

echo ""
echo "======================================"
echo "  Setup Complete!"
echo "======================================"

if [ "$DRY_RUN" = true ]; then
  echo ""
  echo "ℹ️  This was a DRY RUN. No resources were created or modified."
  echo "   Run without --dry-run to execute."
fi

echo ""
echo "📋 Summary:"
echo "  KV Namespaces:"
echo "    Default:  ${KV_DEFAULT_ID:-(skipped)}"
echo "    Staging:  ${KV_STAGING_ID:-(skipped)}"
echo "    Prod:     ${KV_PROD_ID:-(skipped)}"
echo "  D1 Databases:"
echo "    Default:  ${DB_DEFAULT_ID:-(skipped)}"
echo "    Staging:  ${DB_STAGING_ID:-(skipped)}"
echo "    Prod:     ${DB_PROD_ID:-(skipped)}"
echo ""
echo "Next steps:"
echo "  1. Run D1 migrations:   npm run db:migrate"
echo "  2. Deploy to staging:    npm run build:api && wrangler deploy --env staging"
echo "  3. Set secrets:         wrangler secret put OPENAI_API_KEY --env staging"
echo ""
