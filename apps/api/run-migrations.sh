#!/bin/bash

# Migration Runner for Blueprintify Database
# Usage: ./run-migrations.sh [up|down] [migration_number]

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
MIGRATIONS_DIR="$SCRIPT_DIR/migrations"
DB_NAME="blueprintify-db"

# Default action is "up"
ACTION=${1:-up}
MIGRATION_NUMBER=${2:-}

echo "🗄️  Blueprintify Database Migration Runner"
echo "Action: $ACTION"
echo "Migrations Directory: $MIGRATIONS_DIR"
echo ""

# Check if wrangler is installed
if ! command -v wrangler &> /dev/null; then
    echo "❌ Error: wrangler CLI is not installed. Please run: npm install -g wrangler"
    exit 1
fi

# Check if migrations directory exists
if [ ! -d "$MIGRATIONS_DIR" ]; then
    echo "❌ Error: Migrations directory not found: $MIGRATIONS_DIR"
    exit 1
fi

# Function to run a single migration
run_migration() {
    local migration_file="$1"
    echo "📝 Running migration: $migration_file"
    
    if wrangler d1 execute "$DB_NAME" --file="$migration_file"; then
        echo "✅ Migration completed successfully: $migration_file"
    else
        echo "❌ Migration failed: $migration_file"
        exit 1
    fi
    echo ""
}

# Function to get list of migration files
get_migration_files() {
    if [ -n "$MIGRATION_NUMBER" ]; then
        echo "$MIGRATIONS_DIR"/*${MIGRATION_NUMBER}*.sql
    else
        ls -1 "$MIGRATIONS_DIR"/*.sql | sort
    fi
}

case "$ACTION" in
    "up")
        echo "🚀 Running migrations (up)..."
        for migration_file in $(get_migration_files); do
            if [ -f "$migration_file" ]; then
                run_migration "$migration_file"
            fi
        done
        echo "🎉 All migrations completed successfully!"
        ;;
    "down")
        echo "⚠️  Warning: Rollback functionality not implemented for D1 databases"
        echo "D1 does not support DROP TABLE with IF NOT EXISTS in rollback scenarios"
        echo "Please manual roll back by connecting to the database directly"
        exit 1
        ;;
    "list")
        echo "📋 Available migrations:"
        for migration_file in $(get_migration_files); do
            if [ -f "$migration_file" ]; then
                echo "  - $(basename "$migration_file")"
            fi
        done
        ;;
    "health")
        echo "🏥 Checking database health..."
        if wrangler d1 execute "$DB_NAME" --command="SELECT 1 as test"; then
            echo "✅ Database is healthy and accessible"
        else
            echo "❌ Database health check failed"
            exit 1
        fi
        ;;
    *)
        echo "❌ Error: Unknown action '$ACTION'"
        echo "Usage: $0 [up|list|health] [migration_number]"
        echo ""
        echo "Actions:"
        echo "  up       - Run all pending migrations (default)"
        echo "  list     - List available migrations"
        echo "  health   - Check database connectivity"
        echo ""
        echo "Examples:"
        echo "  $0 up                    # Run all migrations"
        echo "  $0 up 001                # Run migration 001 only"
        echo "  $0 list                  # List migrations"
        echo "  $0 health                # Check database health"
        exit 1
        ;;
esac