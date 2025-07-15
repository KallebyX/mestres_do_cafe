#!/bin/bash

# Mestres do Café - Backup Script
# Script automatizado para backup do banco de dados e arquivos

set -e

# Configuration
BACKUP_DIR="/backup"
DATE=$(date +"%Y%m%d_%H%M%S")
RETENTION_DAYS=${BACKUP_RETENTION_DAYS:-30}

# Database configuration
DB_HOST=${DB_HOST:-db}
DB_NAME=${POSTGRES_DB}
DB_USER=${POSTGRES_USER}
DB_PASSWORD=${POSTGRES_PASSWORD}

# Create backup directory
mkdir -p "$BACKUP_DIR"

echo "Starting backup process at $(date)"

# Database backup
echo "Creating database backup..."
export PGPASSWORD="$DB_PASSWORD"
pg_dump -h "$DB_HOST" -U "$DB_USER" -d "$DB_NAME" \
    --no-owner --no-privileges --clean --if-exists \
    > "$BACKUP_DIR/db_backup_$DATE.sql"

# Compress the backup
gzip "$BACKUP_DIR/db_backup_$DATE.sql"

echo "Database backup completed: db_backup_$DATE.sql.gz"

# Clean old backups
echo "Cleaning backups older than $RETENTION_DAYS days..."
find "$BACKUP_DIR" -name "db_backup_*.sql.gz" -mtime +$RETENTION_DAYS -delete

# List current backups
echo "Current backups:"
ls -la "$BACKUP_DIR"/db_backup_*.sql.gz 2>/dev/null || echo "No backups found"

echo "Backup process completed at $(date)"