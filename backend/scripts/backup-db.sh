#!/usr/bin/env bash
# Backup database SQLite ke file timestamped
# Usage: bash scripts/backup-db.sh

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
DB_PATH="$PROJECT_DIR/data/clarityflow.db"
BACKUP_DIR="$PROJECT_DIR/backups"
TIMESTAMP=$(date +%Y%m%d-%H%M%S)

# Create backup directory if not exists
mkdir -p "$BACKUP_DIR"

# Backup with timestamps
if [ -f "$DB_PATH" ]; then
    cp "$DB_PATH" "$BACKUP_DIR/clarityflow-$TIMESTAMP.db"
    echo "✅ Backup created: $BACKUP_DIR/clarityflow-$TIMESTAMP.db"
    
    # Keep only last 7 backups
    cd "$BACKUP_DIR"
    ls -t clarityflow-*.db 2>/dev/null | tail -n +8 | xargs -r rm -f
    echo "📦 Backups kept (latest 7)"
else
    echo "❌ Database not found: $DB_PATH"
    exit 1
fi
