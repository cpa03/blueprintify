#!/bin/bash

# Blueprint Generator API - Deployment Script
# Usage: ./deploy.sh [environment]
# Environments: staging, production

set -e

# Configuration
ENVIRONMENT=${1:-staging}
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

echo "🚀 Deploying Blueprint Generator API to $ENVIRONMENT..."

# Validate environment
if [[ "$ENVIRONMENT" != "staging" && "$ENVIRONMENT" != "production" ]]; then
    echo "❌ Invalid environment: $ENVIRONMENT. Use 'staging' or 'production'"
    exit 1
fi

# Check prerequisites
if ! command -v wrangler &> /dev/null; then
    echo "❌ Wrangler CLI not found. Install with: npm install -g wrangler"
    exit 1
fi

cd "$PROJECT_ROOT/apps/api"

# Build and test
echo "📦 Building application..."
npm run build

echo "🧪 Running tests..."
npm run test

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
        echo "🌐 Staging URL: https://api-staging.blueprintify.dev"
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
        curl -f https://api-staging.blueprintify.dev/ || {
            echo "❌ Staging health check failed. Do not deploy to production."
            exit 1
        }
        
        # Deploy to production
        wrangler deploy --env production
        
        echo "✅ Production deployment complete!"
        echo "🌐 Production URL: https://api.blueprintify.dev"
        
        # Run post-deployment health check
        echo "🏥 Running post-deployment health check..."
        sleep 5
        curl -f https://api.blueprintify.dev/ || {
            echo "❌ Production health check failed!"
            exit 1
        }
        echo "✅ Production health check passed!"
        ;;
esac

echo "🎉 Deployment to $ENVIRONMENT completed successfully!"