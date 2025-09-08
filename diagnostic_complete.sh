#!/bin/bash

# 🚀 DIAGNÓSTICO COMPLETO - MESTRES DO CAFÉ
# Script para verificar o status completo do sistema

echo "🔍 INICIANDO DIAGNÓSTICO COMPLETO DO SISTEMA MESTRES DO CAFÉ"
echo "================================================================"

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Função para imprimir status
print_status() {
    if [ $1 -eq 0 ]; then
        echo -e "${GREEN}✅ $2${NC}"
    else
        echo -e "${RED}❌ $2${NC}"
    fi
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

echo ""
print_info "1. TESTANDO API HEALTH..."
echo "----------------------------------------"
API_HEALTH=$(curl -s -w "%{http_code}" -o /tmp/api_health.json "https://mestres-cafe-api.onrender.com/api/health")
if [ "$API_HEALTH" = "200" ]; then
    print_status 0 "API Health Check"
    echo "Resposta: $(cat /tmp/api_health.json | jq -r '.status // "unknown"')"
else
    print_status 1 "API Health Check (HTTP $API_HEALTH)"
fi

echo ""
print_info "2. TESTANDO PRODUTOS..."
echo "----------------------------------------"
PRODUCTS_RESPONSE=$(curl -s -w "%{http_code}" -o /tmp/products.json "https://mestres-cafe-api.onrender.com/api/products")
if [ "$PRODUCTS_RESPONSE" = "200" ]; then
    PRODUCTS_COUNT=$(cat /tmp/products.json | jq -r '.products | length // 0')
    if [ "$PRODUCTS_COUNT" -gt 0 ]; then
        print_status 0 "Produtos carregados ($PRODUCTS_COUNT produtos)"
        echo "Primeiros produtos:"
        cat /tmp/products.json | jq -r '.products[0:3][] | "  - \(.name): R$ \(.price)"'
    else
        print_status 1 "Nenhum produto encontrado"
    fi
else
    print_status 1 "Erro ao carregar produtos (HTTP $PRODUCTS_RESPONSE)"
fi

echo ""
print_info "3. TESTANDO FRONTEND..."
echo "----------------------------------------"
FRONTEND_RESPONSE=$(curl -s -w "%{http_code}" -o /tmp/frontend.html "https://mestres-cafe-web.onrender.com/")
if [ "$FRONTEND_RESPONSE" = "200" ]; then
    print_status 0 "Frontend carregando (HTTP 200)"
    
    # Verificar se há JavaScript
    JS_FILES=$(grep -o 'src="/assets/index-[^"]*\.js"' /tmp/frontend.html | wc -l)
    if [ "$JS_FILES" -gt 0 ]; then
        print_status 0 "JavaScript detectado"
        echo "Arquivo JS: $(grep -o 'src="/assets/index-[^"]*\.js"' /tmp/frontend.html | head -1)"
    else
        print_status 1 "JavaScript não encontrado"
    fi
else
    print_status 1 "Frontend não carregando (HTTP $FRONTEND_RESPONSE)"
fi

echo ""
print_info "4. TESTANDO IMAGENS..."
echo "----------------------------------------"
IMAGES=(
    "logo-para-fundo-branco.svg"
    "logo-para-fundo-escuro.svg"
    "caneca-mestres-cafe.svg"
    "logo-mestres-do-cafe.svg"
)

for image in "${IMAGES[@]}"; do
    IMAGE_RESPONSE=$(curl -s -w "%{http_code}" -o /dev/null "https://mestres-cafe-web.onrender.com/$image")
    if [ "$IMAGE_RESPONSE" = "200" ]; then
        print_status 0 "$image"
    else
        print_status 1 "$image (HTTP $IMAGE_RESPONSE)"
    fi
done

echo ""
print_info "5. TESTANDO CORS..."
echo "----------------------------------------"
CORS_RESPONSE=$(curl -s -w "%{http_code}" -o /dev/null -H "Origin: https://mestres-cafe-web.onrender.com" "https://mestres-cafe-api.onrender.com/api/products")
if [ "$CORS_RESPONSE" = "200" ]; then
    print_status 0 "CORS configurado corretamente"
else
    print_status 1 "Problema com CORS (HTTP $CORS_RESPONSE)"
fi

echo ""
print_info "6. TESTANDO PERFORMANCE..."
echo "----------------------------------------"
echo "Tempo de resposta da API:"
API_TIME=$(curl -s -w "%{time_total}" -o /dev/null "https://mestres-cafe-api.onrender.com/api/health")
echo "  API Health: ${API_TIME}s"

FRONTEND_TIME=$(curl -s -w "%{time_total}" -o /dev/null "https://mestres-cafe-web.onrender.com/")
echo "  Frontend: ${FRONTEND_TIME}s"

if (( $(echo "$API_TIME < 2.0" | bc -l) )); then
    print_status 0 "API Performance OK"
else
    print_warning "API Performance lenta"
fi

if (( $(echo "$FRONTEND_TIME < 3.0" | bc -l) )); then
    print_status 0 "Frontend Performance OK"
else
    print_warning "Frontend Performance lenta"
fi

echo ""
print_info "7. VERIFICANDO CONFIGURAÇÕES LOCAIS..."
echo "----------------------------------------"

# Verificar se arquivos existem
FILES=(
    "apps/web/src/config/api.js"
    "render.yaml"
    ".github/workflows/neon_workflow.yml"
    "apps/web/public/logo-para-fundo-branco.svg"
)

for file in "${FILES[@]}"; do
    if [ -f "$file" ]; then
        print_status 0 "$file existe"
    else
        print_status 1 "$file não encontrado"
    fi
done

echo ""
print_info "8. RESUMO DO DIAGNÓSTICO..."
echo "================================================================"

# Contar sucessos e falhas
TOTAL_TESTS=0
PASSED_TESTS=0

# API Health
TOTAL_TESTS=$((TOTAL_TESTS + 1))
if [ "$API_HEALTH" = "200" ]; then
    PASSED_TESTS=$((PASSED_TESTS + 1))
fi

# Produtos
TOTAL_TESTS=$((TOTAL_TESTS + 1))
if [ "$PRODUCTS_RESPONSE" = "200" ] && [ "$PRODUCTS_COUNT" -gt 0 ]; then
    PASSED_TESTS=$((PASSED_TESTS + 1))
fi

# Frontend
TOTAL_TESTS=$((TOTAL_TESTS + 1))
if [ "$FRONTEND_RESPONSE" = "200" ]; then
    PASSED_TESTS=$((PASSED_TESTS + 1))
fi

# CORS
TOTAL_TESTS=$((TOTAL_TESTS + 1))
if [ "$CORS_RESPONSE" = "200" ]; then
    PASSED_TESTS=$((PASSED_TESTS + 1))
fi

echo "Testes executados: $TOTAL_TESTS"
echo "Testes aprovados: $PASSED_TESTS"
echo "Taxa de sucesso: $(( PASSED_TESTS * 100 / TOTAL_TESTS ))%"

if [ "$PASSED_TESTS" -eq "$TOTAL_TESTS" ]; then
    echo -e "${GREEN}🎉 SISTEMA 100% FUNCIONAL!${NC}"
elif [ "$PASSED_TESTS" -ge $((TOTAL_TESTS * 3 / 4)) ]; then
    echo -e "${YELLOW}⚠️  SISTEMA FUNCIONAL COM PEQUENOS PROBLEMAS${NC}"
else
    echo -e "${RED}❌ SISTEMA COM PROBLEMAS CRÍTICOS${NC}"
fi

echo ""
print_info "9. PRÓXIMOS PASSOS..."
echo "----------------------------------------"
if [ "$PASSED_TESTS" -lt "$TOTAL_TESTS" ]; then
    echo "1. Corrigir problemas identificados acima"
    echo "2. Executar novamente este script"
    echo "3. Verificar logs do Render Dashboard"
    echo "4. Testar funcionalidades no navegador"
else
    echo "1. Sistema funcionando perfeitamente!"
    echo "2. Monitorar performance"
    echo "3. Implementar melhorias opcionais"
    echo "4. Configurar alertas de monitoramento"
fi

echo ""
echo "🔗 URLs para testar:"
echo "  Frontend: https://mestres-cafe-web.onrender.com/"
echo "  API: https://mestres-cafe-api.onrender.com/api/health"
echo "  Produtos: https://mestres-cafe-api.onrender.com/api/products"

echo ""
echo "📊 Relatório salvo em:"
echo "  /tmp/api_health.json"
echo "  /tmp/products.json"
echo "  /tmp/frontend.html"

echo ""
echo "🏁 DIAGNÓSTICO CONCLUÍDO!"
echo "================================================================"
