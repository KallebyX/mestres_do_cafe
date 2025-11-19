#!/bin/bash
# Script de Backup do Banco de Dados PostgreSQL
# Realiza backup completo com compressão e rotação de backups antigos

set -euo pipefail  # Exit on error, undefined variables, and pipe failures

# Configurações
BACKUP_DIR="${BACKUP_DIR:-/opt/mestres-do-cafe/backups}"
RETENTION_DAYS="${RETENTION_DAYS:-7}"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
DB_NAME="${POSTGRES_DB:-mestres_cafe}"
DB_USER="${POSTGRES_USER:-mestres_user}"
DB_HOST="${POSTGRES_HOST:-localhost}"
DB_PORT="${POSTGRES_PORT:-5432}"

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Criar diretório de backup se não existir
if [ ! -d "$BACKUP_DIR" ]; then
    log_info "Criando diretório de backup: $BACKUP_DIR"
    mkdir -p "$BACKUP_DIR"
fi

# Nome do arquivo de backup
BACKUP_FILE="$BACKUP_DIR/backup_${DB_NAME}_${TIMESTAMP}.sql.gz"
BACKUP_METADATA="$BACKUP_DIR/backup_${DB_NAME}_${TIMESTAMP}.meta"

log_info "Iniciando backup do banco de dados: $DB_NAME"
log_info "Arquivo de destino: $BACKUP_FILE"

# Realizar backup com pg_dump
if PGPASSWORD="$POSTGRES_PASSWORD" pg_dump \
    -h "$DB_HOST" \
    -p "$DB_PORT" \
    -U "$DB_USER" \
    -d "$DB_NAME" \
    --format=custom \
    --verbose \
    --no-owner \
    --no-acl \
    2>&1 | gzip > "$BACKUP_FILE"; then

    log_info "Backup concluído com sucesso!"

    # Criar arquivo de metadados
    cat > "$BACKUP_METADATA" <<EOF
{
  "timestamp": "$TIMESTAMP",
  "database": "$DB_NAME",
  "host": "$DB_HOST",
  "size": "$(du -h "$BACKUP_FILE" | cut -f1)",
  "date": "$(date -Iseconds)"
}
EOF

    log_info "Metadados salvos em: $BACKUP_METADATA"
    log_info "Tamanho do backup: $(du -h "$BACKUP_FILE" | cut -f1)"

else
    log_error "Falha ao realizar backup!"
    exit 1
fi

# Limpeza de backups antigos
log_info "Limpando backups com mais de $RETENTION_DAYS dias..."
DELETED_COUNT=$(find "$BACKUP_DIR" -name "backup_*.sql.gz" -type f -mtime +$RETENTION_DAYS -delete -print | wc -l)
find "$BACKUP_DIR" -name "backup_*.meta" -type f -mtime +$RETENTION_DAYS -delete

if [ "$DELETED_COUNT" -gt 0 ]; then
    log_info "Removidos $DELETED_COUNT backups antigos"
else
    log_info "Nenhum backup antigo para remover"
fi

# Listar backups disponíveis
log_info "Backups disponíveis:"
ls -lh "$BACKUP_DIR"/backup_*.sql.gz | tail -n 5

# Verificar integridade do backup
log_info "Verificando integridade do backup..."
if gzip -t "$BACKUP_FILE" 2>/dev/null; then
    log_info "Integridade do backup verificada com sucesso!"
else
    log_error "Backup pode estar corrompido!"
    exit 1
fi

log_info "Backup concluído com sucesso: $BACKUP_FILE"
exit 0
