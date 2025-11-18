#!/bin/bash
# Script de Health Check Completo
# Verifica saúde de todos os serviços da aplicação

set -euo pipefail

API_URL="${API_URL:-http://localhost:5001}"
WEB_URL="${WEB_URL:-http://localhost:3000}"
TIMEOUT="${TIMEOUT:-5}"

# Cores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

TOTAL_CHECKS=0
PASSED_CHECKS=0
FAILED_CHECKS=0

log_info() {
    echo -e "${GREEN}✓${NC} $1"
    ((PASSED_CHECKS++))
    ((TOTAL_CHECKS++))
}

log_warn() {
    echo -e "${YELLOW}⚠${NC} $1"
    ((TOTAL_CHECKS++))
}

log_error() {
    echo -e "${RED}✗${NC} $1"
    ((FAILED_CHECKS++))
    ((TOTAL_CHECKS++))
}

log_header() {
    echo -e "\n${BLUE}═══ $1 ═══${NC}"
}

check_http() {
    local url=$1
    local description=$2
    local expected_code=${3:-200}

    local response_code=$(curl -s -o /dev/null -w "%{http_code}" -m "$TIMEOUT" "$url" 2>/dev/null || echo "000")

    if [ "$response_code" -eq "$expected_code" ]; then
        log_info "$description (HTTP $response_code)"
        return 0
    else
        log_error "$description (HTTP $response_code, esperado $expected_code)"
        return 1
    fi
}

check_json_field() {
    local url=$1
    local field=$2
    local expected=$3
    local description=$4

    local response=$(curl -s -m "$TIMEOUT" "$url" 2>/dev/null || echo "{}")
    local actual=$(echo "$response" | grep -oP "\"$field\":\s*\"\K[^\"]+|\"\K$field\":\s*\K[^,}]+" || echo "")

    if [ "$actual" == "$expected" ]; then
        log_info "$description"
        return 0
    else
        log_error "$description (obtido: '$actual', esperado: '$expected')"
        return 1
    fi
}

# Banner
echo -e "${BLUE}"
cat << "EOF"
╔═══════════════════════════════════════╗
║   Mestres do Café - Health Check     ║
╚═══════════════════════════════════════╝
EOF
echo -e "${NC}"

# API Flask
log_header "API Backend (Flask)"
check_http "$API_URL/api/health" "Endpoint de health"
check_json_field "$API_URL/api/health" "status" "healthy" "Status da API"

# Testar autenticação
if curl -s -f -m "$TIMEOUT" "$API_URL/api/auth/login" -X POST \
    -H "Content-Type: application/json" \
    -d '{"email":"invalid","password":"invalid"}' > /dev/null 2>&1; then
    log_info "Endpoint de autenticação respondendo"
else
    # Esperado falhar com 401, mas deve responder
    if [ $? -eq 22 ]; then  # curl exit code for 400-499
        log_info "Endpoint de autenticação respondendo"
    else
        log_error "Endpoint de autenticação não responde"
    fi
fi

# Testar produtos
check_http "$API_URL/api/products?page=1&limit=1" "Listagem de produtos"

# Frontend React
log_header "Frontend (React)"
check_http "$WEB_URL" "Página inicial"
check_http "$WEB_URL/login" "Página de login"
check_http "$WEB_URL/products" "Página de produtos"

# Database
log_header "Banco de Dados (PostgreSQL)"

if command -v pg_isready &> /dev/null; then
    POSTGRES_HOST="${POSTGRES_HOST:-localhost}"
    POSTGRES_PORT="${POSTGRES_PORT:-5432}"
    POSTGRES_USER="${POSTGRES_USER:-mestres_user}"

    if pg_isready -h "$POSTGRES_HOST" -p "$POSTGRES_PORT" -U "$POSTGRES_USER" &> /dev/null; then
        log_info "PostgreSQL está aceitando conexões"

        # Testar query simples
        if PGPASSWORD="$POSTGRES_PASSWORD" psql -h "$POSTGRES_HOST" -p "$POSTGRES_PORT" -U "$POSTGRES_USER" -d "${POSTGRES_DB:-mestres_cafe}" -c "SELECT 1;" &> /dev/null; then
            log_info "Query test executada com sucesso"
        else
            log_error "Não foi possível executar query no PostgreSQL"
        fi
    else
        log_error "PostgreSQL não está respondendo"
    fi
else
    log_warn "pg_isready não disponível - pulando verificação"
fi

# Redis
log_header "Cache (Redis)"

if command -v redis-cli &> /dev/null; then
    REDIS_HOST="${REDIS_HOST:-localhost}"
    REDIS_PORT="${REDIS_PORT:-6379}"

    if timeout 2 redis-cli -h "$REDIS_HOST" -p "$REDIS_PORT" ping &> /dev/null; then
        log_info "Redis está respondendo"

        # Testar operação de escrita/leitura
        TEST_KEY="health_check_$(date +%s)"
        if redis-cli -h "$REDIS_HOST" -p "$REDIS_PORT" SET "$TEST_KEY" "test" EX 10 &> /dev/null; then
            log_info "Operação de escrita no Redis OK"
            redis-cli -h "$REDIS_HOST" -p "$REDIS_PORT" DEL "$TEST_KEY" &> /dev/null
        else
            log_error "Não foi possível escrever no Redis"
        fi

        # Verificar memória
        MEMORY_USAGE=$(redis-cli -h "$REDIS_HOST" -p "$REDIS_PORT" INFO memory 2>/dev/null | grep "used_memory_human" | cut -d: -f2 | tr -d '\r' || echo "N/A")
        echo "  Memória utilizada: $MEMORY_USAGE"

    else
        log_error "Redis não está respondendo"
    fi
else
    log_warn "redis-cli não disponível - pulando verificação"
fi

# Nginx (se aplicável)
log_header "Reverse Proxy (Nginx)"

if command -v nginx &> /dev/null; then
    if nginx -t &> /dev/null; then
        log_info "Configuração do Nginx válida"
    else
        log_error "Configuração do Nginx inválida"
    fi

    if pgrep nginx > /dev/null; then
        log_info "Nginx está executando"
    else
        log_warn "Nginx não está executando"
    fi
else
    log_warn "Nginx não disponível - pulando verificação"
fi

# Docker containers
log_header "Docker Containers"

if command -v docker &> /dev/null; then
    CONTAINER_NAMES=("mestres-api" "mestres-web" "mestres-db" "mestres-redis" "mestres-nginx")

    for container in "${CONTAINER_NAMES[@]}"; do
        if docker ps --format "{{.Names}}" | grep -q "$container"; then
            STATUS=$(docker inspect --format='{{.State.Status}}' "$container" 2>/dev/null || echo "unknown")
            if [ "$STATUS" == "running" ]; then
                log_info "Container $container está executando"
            else
                log_warn "Container $container existe mas status: $STATUS"
            fi
        else
            log_warn "Container $container não encontrado"
        fi
    done
else
    log_warn "Docker não disponível - pulando verificação"
fi

# Monitoramento
log_header "Monitoramento"

check_http "http://localhost:9090/-/healthy" "Prometheus" "200" || log_warn "Prometheus não disponível"
check_http "http://localhost:3001/api/health" "Grafana" "200" || log_warn "Grafana não disponível"

# Disco
log_header "Recursos do Sistema"

DISK_USAGE=$(df -h / | awk 'NR==2 {print $5}' | sed 's/%//')
if [ "$DISK_USAGE" -lt 80 ]; then
    log_info "Uso de disco: ${DISK_USAGE}% (OK)"
elif [ "$DISK_USAGE" -lt 90 ]; then
    log_warn "Uso de disco: ${DISK_USAGE}% (Alto)"
else
    log_error "Uso de disco: ${DISK_USAGE}% (Crítico)"
fi

# Memória
if command -v free &> /dev/null; then
    MEMORY_USAGE=$(free | awk 'NR==2 {printf "%.0f", $3/$2*100}')
    if [ "$MEMORY_USAGE" -lt 80 ]; then
        log_info "Uso de memória: ${MEMORY_USAGE}% (OK)"
    elif [ "$MEMORY_USAGE" -lt 90 ]; then
        log_warn "Uso de memória: ${MEMORY_USAGE}% (Alto)"
    else
        log_error "Uso de memória: ${MEMORY_USAGE}% (Crítico)"
    fi
fi

# CPU Load
if command -v uptime &> /dev/null; then
    LOAD_AVG=$(uptime | awk -F'load average:' '{print $2}' | awk '{print $1}' | tr -d ',')
    echo "  Load average: $LOAD_AVG"
fi

# Resumo final
log_header "Resumo do Health Check"

echo ""
echo "Total de verificações: $TOTAL_CHECKS"
echo -e "${GREEN}Passed: $PASSED_CHECKS${NC}"
echo -e "${RED}Failed: $FAILED_CHECKS${NC}"
echo ""

HEALTH_PERCENTAGE=$((PASSED_CHECKS * 100 / TOTAL_CHECKS))

if [ $FAILED_CHECKS -eq 0 ]; then
    echo -e "${GREEN}✓ Sistema saudável! ($HEALTH_PERCENTAGE%)${NC}"
    exit 0
elif [ $FAILED_CHECKS -le 2 ]; then
    echo -e "${YELLOW}⚠ Sistema com problemas menores ($HEALTH_PERCENTAGE%)${NC}"
    exit 0
else
    echo -e "${RED}✗ Sistema com problemas críticos ($HEALTH_PERCENTAGE%)${NC}"
    exit 1
fi
