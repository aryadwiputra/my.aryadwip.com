#!/usr/bin/env bash
# Push database backup to GitHub (for disaster recovery)
# Usage: bash scripts/push-backup.sh

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"

# Run backup first
bash "$SCRIPT_DIR/backup-db.sh"

# Check if git is initialized
cd "$PROJECT_DIR"
if [ ! -d ".git" ]; then
    echo "❌ Not a git repository"
    exit 1
fi

# Add backup to git (if not ignored)
BACKUP_DIR="$PROJECT_DIR/backups"
if [ -d "$BACKUP_DIR" ]; then
    git add "$BACKUP_DIR"
    git commit -m "chore: backup database $(date +%Y-%m-%d\ %H:%M)" 2>/dev/null || echo "No changes to commit"
    echo "✅ Backup committed (run 'git push' to upload)"
else
    echo "❌ No backup directory found"
    exit 1
fi
