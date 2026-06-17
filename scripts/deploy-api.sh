#!/bin/bash

# Blueprint Generator API - Deployment Script
# Usage: ./deploy.sh [environment]
# Environments: staging, production

set -e

# Source centralized config (Flexy says: no hardcoded values!)
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/config.sh"

# Configuration from single source of truth
ENVIRONMENT=${1:-staging}

echo "🚀 Deploying Blueprint Generator API to $ENVIRONMENT..."

# Validate environment
VALID_ENV=false
for env in "${ENVIRONMENTS[@]}"; do
    if [[ "$ENVIRONMENT" == "$env" ]]; then
        VALID_ENV=true
        break
    fi
done

if [[ "$VALID_ENV" == "false" ]]; then
    echo "❌ Invalid environment: $ENVIRONMENT. Use 'staging' or 'production'"
    exit 1
fi

# Check prerequisites
if ! command -v wrangler &> /dev/null; then
    echo "❌ Wrangler CLI not found. Install with: npm install -g wrangler"
    exit 1
fi

cd "$PROJECT_ROOT/apps/api"

# Validate placeholder IDs in wrangler.toml
echo "🔍 Checking for placeholder infrastructure IDs..."
PLACEHOLDER_WARNINGS=0
while IFS= read -r line; do
    if echo "$line" | grep -iqE "TODO|PLACEHOLDER"; then
        PLACEHOLDER_WARNINGS=$((PLACEHOLDER_WARNINGS + 1))
    fi
done < <(grep -n "TODO\|PLACEHOLDER\|cache_kv_namespace_id\|production_cache_kv_id\|staging_cache_kv_id\|local_database_id\|production_database_id\|staging_database_id" wrangler.toml 2>/dev/null || true)

if [[ "$PLACEHOLDER_WARNINGS" -gt 0 ]]; then
    echo "⚠️  Found $PLACEHOLDER_WARNINGS placeholder IDs in wrangler.toml."
    echo "   These MUST be replaced with real Cloudflare resource IDs before deployment."
    echo "   See: apps/api/README.md#required-infrastructure"
    echo ""
    
    if [[ "$ENVIRONMENT" == "production" ]]; then
        echo "❌ Cannot deploy to production with placeholder IDs."
        echo "   Run: grep -n \"TODO\\|PLACEHOLDER\" apps/api/wrangler.toml"
        exit 1
    fi
    
    # For staging/dev, warn but allow continuation
    read -p "⚠️  Continue with placeholder IDs? (yes/no): " -r
    if [[ ! $REPLY =~ ^[Yy][Ee][Ss]$ ]]; then
        echo "❌ Deployment cancelled. Replace placeholders first."
        exit 1
    fi
    echo "⚠️  Proceeding with placeholder IDs... (not suitable for production)"
fi

# Build and test
echo "📦 Building application..."
npm run build

echo "🧪 Running tests..."
npm run test

# Get URLs from config
if [[ "$ENVIRONMENT" == "staging" ]]; then
    DEPLOY_URL="$STAGING_API_URL"
    DEPLOY_URL_PATTERN="$STAGING_API_PATTERN"
    SLEEP_DURATION="$STAGING_SLEEP_SECONDS"
fi

if [[ "$ENVIRONMENT" == "production" ]]; then
    DEPLOY_URL="$PRODUCTION_API_URL"
    DEPLOY_URL_PATTERN="$PRODUCTION_API_PATTERN"
    SLEEP_DURATION="$PRODUCTION_SLEEP_SECONDS"
fi

# Environment-specific deployment
case $ENVIRONMENT in
    staging)
        echo "🔧 Deploying to staging environment..."
        
        # Check required secrets for staging
        echo "🔐 Checking staging secrets..."
        wrangler secret list --env staging || echo "⚠️  Some secrets may be missing. Set them with: wrangler secret put <SECRET_NAME> --env staging"
        
        # Deploy to staging
        wrangler deploy --env staging
        
        echo "✅ Staging deployment complete!"
        echo "🌐 Staging URL: $DEPLOY_URL"
        ;;
        
    production)
        echo "🔧 Deploying to production environment..."
        
        # Confirmation prompt for production
        read -p "⚠️  You are deploying to PRODUCTION. Are you sure? (yes/no): " -n 4 -r
        echo
        if [[ ! $REPLY =~ ^[Yy][Ee][Ss]$ ]]; then
            echo "❌ Production deployment cancelled."
            exit 1
        fi
        
        # Check required secrets for production
        echo "🔐 Checking production secrets..."
        wrangler secret list --env production || echo "⚠️  Some secrets may be missing. Set them with: wrangler secret put <SECRET_NAME> --env production"
        
        # Run production health checks
        echo "🏥 Running production health checks..."
        curl -f "$STAGING_API_URL/" || {
            echo "❌ Staging health check failed. Do not deploy to production."
            exit 1
        }
        
        # Deploy to production
        wrangler deploy --env production
        
        echo "✅ Production deployment complete!"
        echo "🌐 Production URL: $DEPLOY_URL"
        
        # Run post-deployment health check
        echo "🏥 Running post-deployment health check..."
        sleep "$SLEEP_DURATION"
        curl -f "$DEPLOY_URL/" || {
            echo "❌ Production health check failed!"
            exit 1
        }
        echo "✅ Production health check passed!"
        ;;
esac

echo "🎉 Deployment to $ENVIRONMENT completed successfully!"
