#!/bin/bash

# Environment Setup Script for Blueprint Generator
# Sets up environment-specific configurations and secrets

set -e

ENVIRONMENT=${1:-development}
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

echo "⚙️  Setting up $ENVIRONMENT environment for Blueprint Generator..."

case $ENVIRONMENT in
    development)
        echo "🔧 Setting up development environment..."
        
        # Create development environment file
        cat > "$PROJECT_ROOT/apps/api/.dev.vars" << EOF
# Development Environment Variables
ENVIRONMENT=development
CORS_ORIGIN=http://localhost:3000
RATE_LIMIT_REQUESTS=100
RATE_LIMIT_WINDOW=60
LOG_LEVEL=debug
EOF
        
        echo "✅ Development environment configured"
        echo "📝 Update apps/api/.dev.vars with your OPENAI_API_KEY"
        ;;
        
    staging)
        echo "🔧 Setting up staging environment..."
        
        echo "🔐 Setting up staging secrets..."
        cd "$PROJECT_ROOT/apps/api"
        
        # Set staging environment variables
        wrangler secret put ENVIRONMENT --env staging <<< "staging"
        wrangler secret put CORS_ORIGIN --env staging <<< "https://staging.blueprintify.dev"
        wrangler secret put RATE_LIMIT_REQUESTS --env staging <<< "1000"
        wrangler secret put RATE_LIMIT_WINDOW --env staging <<< "60"
        wrangler secret put LOG_LEVEL --env staging <<< "info"
        
        echo "✅ Staging environment configured"
        ;;
        
    production)
        echo "🔧 Setting up production environment..."
        
        echo "⚠️  This will configure production secrets. Ensure you have proper access."
        read -p "Continue with production setup? (yes/no): " -n 4 -r
        echo
        if [[ ! $REPLY =~ ^[Yy][Ee][Ss]$ ]]; then
            echo "❌ Production setup cancelled."
            exit 1
        fi
        
        cd "$PROJECT_ROOT/apps/api"
        
        # Set production environment variables
        wrangler secret put ENVIRONMENT --env production <<< "production"
        wrangler secret put CORS_ORIGIN --env production <<< "https://blueprintify.dev"
        wrangler secret put RATE_LIMIT_REQUESTS --env production <<< "5000"
        wrangler secret put RATE_LIMIT_WINDOW --env production <<< "60"
        wrangler secret put LOG_LEVEL --env production <<< "warn"
        
        echo "✅ Production environment configured"
        echo "🔐 Remember to set your production secrets:"
        echo "   - OPENAI_API_KEY"
        echo "   - DATABASE_URL" 
        echo "   - SENTRY_DSN"
        ;;
        
    *)
        echo "❌ Invalid environment: $ENVIRONMENT"
        echo "Valid environments: development, staging, production"
        exit 1
        ;;
esac

echo "🎉 Environment setup complete!"