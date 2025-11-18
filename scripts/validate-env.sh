#!/bin/bash
# Script de Validação de Variáveis de Ambiente
# Verifica se todas as configurações necessárias estão presentes

set -euo pipefail

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

ERRORS=0
WARNINGS=0

log_info() {
    echo -e "${GREEN}✓${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}⚠${NC} $1"
    ((WARNINGS++))
}

log_error() {
    echo -e "${RED}✗${NC} $1"
    ((ERRORS++))
}

log_header() {
    echo -e "\n${BLUE}═══ $1 ═══${NC}"
}

check_required() {
    local var_name=$1
    local var_value=${!var_name:-}

    if [ -z "$var_value" ]; then
        log_error "Variável obrigatória não configurada: $var_name"
        return 1
    else
        log_info "$var_name está configurado"
        return 0
    fi
}

check_optional() {
    local var_name=$1
    local var_value=${!var_name:-}

    if [ -z "$var_value" ]; then
        log_warn "Variável opcional não configurada: $var_name"
        return 1
    else
        log_info "$var_name está configurado"
        return 0
    fi
}

# Banner
echo -e "${BLUE}"
cat << "EOF"
╔═══════════════════════════════════════╗
║   Mestres do Café - Validação ENV    ║
╚═══════════════════════════════════════╝
EOF
echo -e "${NC}"

# Configurações do Banco de Dados
log_header "Banco de Dados PostgreSQL"
check_required POSTGRES_DB
check_required POSTGRES_USER
check_required POSTGRES_PASSWORD
check_required POSTGRES_HOST
check_optional POSTGRES_PORT

# Configurações do Redis
log_header "Redis Cache"
check_optional REDIS_HOST
check_optional REDIS_PORT
check_optional REDIS_PASSWORD

# Configurações JWT
log_header "Autenticação JWT"
check_required JWT_SECRET_KEY
check_optional JWT_ACCESS_TOKEN_EXPIRES

if [ -n "${JWT_SECRET_KEY:-}" ] && [ ${#JWT_SECRET_KEY} -lt 32 ]; then
    log_warn "JWT_SECRET_KEY deve ter pelo menos 32 caracteres para maior segurança"
fi

# Configurações de Email
log_header "Serviço de Email"
check_optional SMTP_HOST
check_optional SMTP_PORT
check_optional SMTP_USER
check_optional SMTP_PASSWORD
check_optional MAIL_FROM

# Configurações MercadoPago
log_header "MercadoPago Payment"
check_optional MERCADOPAGO_ACCESS_TOKEN
check_optional MERCADOPAGO_PUBLIC_KEY

# Configurações Melhor Envio
log_header "Melhor Envio Shipping"
check_optional MELHOR_ENVIO_TOKEN
check_optional MELHOR_ENVIO_SANDBOX

# Configurações de Notificações
log_header "Notificações SMS/Push"
check_optional SMS_PROVIDER
check_optional TWILIO_ACCOUNT_SID
check_optional TWILIO_AUTH_TOKEN
check_optional FIREBASE_CREDENTIALS_PATH

# Configurações de Storage
log_header "Storage e CDN"
check_optional AWS_ACCESS_KEY_ID
check_optional AWS_SECRET_ACCESS_KEY
check_optional AWS_S3_BUCKET
check_optional AWS_REGION

# Configurações de Aplicação
log_header "Configurações da Aplicação"
check_required FLASK_ENV
check_optional SECRET_KEY
check_optional ALLOWED_ORIGINS

if [ "${FLASK_ENV:-}" == "production" ]; then
    if [ "${DEBUG:-false}" == "true" ]; then
        log_error "DEBUG não deve estar ativado em produção!"
    fi
fi

# Configurações de Monitoramento
log_header "Monitoramento e Logging"
check_optional SENTRY_DSN
check_optional LOG_LEVEL
check_optional SLACK_WEBHOOK

# Verificar arquivos essenciais
log_header "Arquivos Essenciais"

ESSENTIAL_FILES=(
    "/opt/mestres-do-cafe/docker-compose.yml"
    "/opt/mestres-do-cafe/.env"
)

for file in "${ESSENTIAL_FILES[@]}"; do
    if [ -f "$file" ]; then
        log_info "Arquivo encontrado: $file"
    else
        log_warn "Arquivo não encontrado: $file"
    fi
done

# Verificar conexão com banco de dados
log_header "Conectividade"

if command -v pg_isready &> /dev/null; then
    if pg_isready -h "${POSTGRES_HOST:-localhost}" -p "${POSTGRES_PORT:-5432}" -U "${POSTGRES_USER:-}" &> /dev/null; then
        log_info "Conexão com PostgreSQL OK"
    else
        log_error "Não foi possível conectar ao PostgreSQL"
    fi
else
    log_warn "pg_isready não disponível - pulando teste de conexão"
fi

if command -v redis-cli &> /dev/null; then
    if timeout 2 redis-cli -h "${REDIS_HOST:-localhost}" -p "${REDIS_PORT:-6379}" ping &> /dev/null; then
        log_info "Conexão com Redis OK"
    else
        log_warn "Não foi possível conectar ao Redis"
    fi
else
    log_warn "redis-cli não disponível - pulando teste de conexão"
fi

# Verificar portas
log_header "Portas e Serviços"

check_port() {
    local port=$1
    local service=$2

    if command -v nc &> /dev/null; then
        if nc -z localhost "$port" 2>/dev/null; then
            log_info "Porta $port ($service) está aberta"
        else
            log_warn "Porta $port ($service) não está respondendo"
        fi
    else
        log_warn "netcat não disponível - pulando verificação de portas"
        return
    fi
}

check_port 5001 "API Flask"
check_port 3000 "Frontend React"
check_port 5432 "PostgreSQL"
check_port 6379 "Redis"

# Resumo final
log_header "Resumo da Validação"

echo ""
if [ $ERRORS -eq 0 ] && [ $WARNINGS -eq 0 ]; then
    echo -e "${GREEN}✓ Todas as verificações passaram!${NC}"
    exit 0
elif [ $ERRORS -eq 0 ]; then
    echo -e "${YELLOW}⚠ $WARNINGS avisos encontrados${NC}"
    echo "A aplicação pode funcionar com funcionalidade limitada"
    exit 0
else
    echo -e "${RED}✗ $ERRORS erros encontrados${NC}"
    echo -e "${YELLOW}⚠ $WARNINGS avisos encontrados${NC}"
    echo ""
    echo "Corrija os erros antes de implantar em produção!"
    exit 1
fi
