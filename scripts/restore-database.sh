#!/bin/bash
# Script de Restauração do Banco de Dados PostgreSQL
# Restaura backup do banco de dados com validações e confirmações

set -euo pipefail

# Configurações
BACKUP_DIR="${BACKUP_DIR:-/opt/mestres-do-cafe/backups}"
DB_NAME="${POSTGRES_DB:-mestres_cafe}"
DB_USER="${POSTGRES_USER:-mestres_user}"
DB_HOST="${POSTGRES_HOST:-localhost}"
DB_PORT="${POSTGRES_PORT:-5432}"

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Verificar se o arquivo de backup foi fornecido
if [ $# -eq 0 ]; then
    log_error "Uso: $0 <arquivo_backup.sql.gz> [--force]"
    log_info "Backups disponíveis:"
    ls -lht "$BACKUP_DIR"/backup_*.sql.gz | head -n 10
    exit 1
fi

BACKUP_FILE="$1"
FORCE_MODE=false

if [ $# -eq 2 ] && [ "$2" == "--force" ]; then
    FORCE_MODE=true
    log_warn "Modo forçado ativado - pulando confirmações"
fi

# Verificar se o arquivo existe
if [ ! -f "$BACKUP_FILE" ]; then
    log_error "Arquivo de backup não encontrado: $BACKUP_FILE"
    exit 1
fi

# Verificar integridade do backup
log_info "Verificando integridade do backup..."
if ! gzip -t "$BACKUP_FILE" 2>/dev/null; then
    log_error "Arquivo de backup corrompido!"
    exit 1
fi

log_info "Integridade verificada com sucesso"

# Confirmação do usuário
if [ "$FORCE_MODE" = false ]; then
    log_warn "ATENÇÃO: Esta operação irá SOBRESCREVER o banco de dados atual!"
    log_warn "Banco de dados: $DB_NAME"
    log_warn "Arquivo de backup: $BACKUP_FILE"
    echo -n "Deseja continuar? (sim/não): "
    read -r CONFIRMATION

    if [ "$CONFIRMATION" != "sim" ]; then
        log_info "Operação cancelada pelo usuário"
        exit 0
    fi
fi

# Criar backup de segurança antes da restauração
SAFETY_BACKUP="/tmp/safety_backup_$(date +%Y%m%d_%H%M%S).sql.gz"
log_info "Criando backup de segurança em: $SAFETY_BACKUP"

if PGPASSWORD="$POSTGRES_PASSWORD" pg_dump \
    -h "$DB_HOST" \
    -p "$DB_PORT" \
    -U "$DB_USER" \
    -d "$DB_NAME" \
    --format=custom \
    --no-owner \
    --no-acl \
    2>/dev/null | gzip > "$SAFETY_BACKUP"; then
    log_info "Backup de segurança criado com sucesso"
else
    log_warn "Não foi possível criar backup de segurança"
fi

# Desconectar todos os usuários
log_info "Desconectando usuários do banco de dados..."
PGPASSWORD="$POSTGRES_PASSWORD" psql \
    -h "$DB_HOST" \
    -p "$DB_PORT" \
    -U "$DB_USER" \
    -d postgres \
    -c "SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = '$DB_NAME' AND pid <> pg_backend_pid();" \
    2>/dev/null || true

# Dropar e recriar banco de dados
log_info "Recriando banco de dados..."
PGPASSWORD="$POSTGRES_PASSWORD" psql \
    -h "$DB_HOST" \
    -p "$DB_PORT" \
    -U "$DB_USER" \
    -d postgres \
    -c "DROP DATABASE IF EXISTS $DB_NAME;" \
    2>/dev/null

PGPASSWORD="$POSTGRES_PASSWORD" psql \
    -h "$DB_HOST" \
    -p "$DB_PORT" \
    -U "$DB_USER" \
    -d postgres \
    -c "CREATE DATABASE $DB_NAME OWNER $DB_USER;" \
    2>/dev/null

# Restaurar backup
log_info "Restaurando backup: $BACKUP_FILE"
if gunzip -c "$BACKUP_FILE" | PGPASSWORD="$POSTGRES_PASSWORD" pg_restore \
    -h "$DB_HOST" \
    -p "$DB_PORT" \
    -U "$DB_USER" \
    -d "$DB_NAME" \
    --verbose \
    --no-owner \
    --no-acl \
    2>&1; then

    log_info "Restauração concluída com sucesso!"

    # Verificar dados restaurados
    log_info "Verificando dados restaurados..."
    TABLE_COUNT=$(PGPASSWORD="$POSTGRES_PASSWORD" psql \
        -h "$DB_HOST" \
        -p "$DB_PORT" \
        -U "$DB_USER" \
        -d "$DB_NAME" \
        -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';" | xargs)

    log_info "Tabelas restauradas: $TABLE_COUNT"

    # Remover backup de segurança se tudo correu bem
    if [ -f "$SAFETY_BACKUP" ]; then
        log_info "Removendo backup de segurança temporário"
        rm -f "$SAFETY_BACKUP"
    fi

    log_info "Restauração finalizada com sucesso!"
    exit 0

else
    log_error "Falha ao restaurar backup!"

    if [ -f "$SAFETY_BACKUP" ]; then
        log_warn "Backup de segurança disponível em: $SAFETY_BACKUP"
        log_info "Para restaurar o backup de segurança, execute:"
        log_info "$0 $SAFETY_BACKUP --force"
    fi

    exit 1
fi
