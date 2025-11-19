#!/bin/bash
# Script de Aquecimento de Cache
# Pré-carrega dados frequentemente acessados no Redis após deploy

set -euo pipefail

API_URL="${API_URL:-http://localhost:5001}"
TIMEOUT="${TIMEOUT:-5}"

# Cores para output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
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

make_request() {
    local endpoint=$1
    local description=$2

    if curl -s -f -m "$TIMEOUT" "${API_URL}${endpoint}" > /dev/null 2>&1; then
        log_info "✓ $description"
        return 0
    else
        log_warn "✗ Falha ao aquecer: $description"
        return 1
    fi
}

log_info "Iniciando aquecimento de cache..."
log_info "API URL: $API_URL"
echo ""

# Health check primeiro
log_info "Verificando saúde da API..."
if ! make_request "/api/health" "Health check"; then
    log_error "API não está respondendo! Abortando aquecimento."
    exit 1
fi

echo ""
log_info "Aquecendo endpoints principais..."

# Produtos - endpoints mais acessados
make_request "/api/products?page=1&limit=20" "Lista de produtos (página 1)"
make_request "/api/products?page=2&limit=20" "Lista de produtos (página 2)"
make_request "/api/products/featured" "Produtos em destaque"
make_request "/api/products/best-sellers" "Produtos mais vendidos"

# Categorias
make_request "/api/categories" "Lista de categorias"
make_request "/api/categories/coffee-beans" "Categoria: Grãos de Café"
make_request "/api/categories/equipment" "Categoria: Equipamentos"

# Promoções e ofertas
make_request "/api/promotions/active" "Promoções ativas"
make_request "/api/products?on_sale=true" "Produtos em promoção"

# Dados de configuração
make_request "/api/config/shipping-zones" "Zonas de entrega"
make_request "/api/config/payment-methods" "Métodos de pagamento"

# Blog e conteúdo
make_request "/api/blog/posts?page=1&limit=10" "Posts do blog"
make_request "/api/newsletter/latest" "Últimas newsletters"

# Reviews e avaliações
make_request "/api/reviews/recent?limit=20" "Avaliações recentes"

# Dados de gamificação
make_request "/api/gamification/levels" "Níveis de gamificação"
make_request "/api/gamification/badges" "Badges disponíveis"

# Dashboard analytics (apenas se disponível)
make_request "/api/admin/analytics/summary" "Dashboard analytics" || true

echo ""
log_info "Aquecendo cache de produtos individuais..."

# Buscar IDs dos produtos mais vendidos e aquecer individualmente
PRODUCT_IDS=$(curl -s "${API_URL}/api/products/best-sellers?limit=10" | \
    grep -oP '"id":\s*"\K[^"]+' | head -n 10 || echo "")

if [ -n "$PRODUCT_IDS" ]; then
    for product_id in $PRODUCT_IDS; do
        make_request "/api/products/${product_id}" "Produto ID: ${product_id}" || true
        sleep 0.1  # Rate limiting
    done
else
    log_warn "Não foi possível obter IDs dos produtos mais vendidos"
fi

echo ""
log_info "Aquecendo cache de busca..."

# Termos de busca mais comuns
SEARCH_TERMS=(
    "café"
    "grãos"
    "moedor"
    "espresso"
    "arábica"
    "robusta"
    "prensa"
    "coador"
)

for term in "${SEARCH_TERMS[@]}"; do
    make_request "/api/products/search?q=${term}" "Busca: ${term}" || true
    sleep 0.1  # Rate limiting
done

echo ""
log_info "Aquecendo cache de cálculo de frete..."

# Simular cálculos de frete para CEPs comuns das principais capitais
COMMON_ZIPCODES=(
    "01310-100"  # São Paulo
    "20040-020"  # Rio de Janeiro
    "30130-000"  # Belo Horizonte
    "70040-020"  # Brasília
    "80010-000"  # Curitiba
)

for zipcode in "${COMMON_ZIPCODES[@]}"; do
    make_request "/api/shipping/calculate?zipcode=${zipcode}&weight=500" "Frete: ${zipcode}" || true
    sleep 0.2  # Rate limiting maior para API externa
done

# Estatísticas finais
echo ""
log_info "═══════════════════════════════════════"
log_info "Cache aquecido com sucesso!"
log_info "═══════════════════════════════════════"

# Verificar estatísticas do Redis se disponível
if command -v redis-cli &> /dev/null; then
    REDIS_HOST="${REDIS_HOST:-localhost}"
    REDIS_PORT="${REDIS_PORT:-6379}"

    log_info "Estatísticas do Redis:"

    KEYS_COUNT=$(redis-cli -h "$REDIS_HOST" -p "$REDIS_PORT" DBSIZE 2>/dev/null | grep -oP '\d+' || echo "N/A")
    MEMORY_USED=$(redis-cli -h "$REDIS_HOST" -p "$REDIS_PORT" INFO memory 2>/dev/null | grep "used_memory_human" | cut -d: -f2 | tr -d '\r' || echo "N/A")

    echo "  - Chaves no cache: $KEYS_COUNT"
    echo "  - Memória utilizada: $MEMORY_USED"
else
    log_warn "redis-cli não disponível - pulando estatísticas"
fi

exit 0
