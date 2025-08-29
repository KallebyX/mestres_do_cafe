#!/bin/bash

# Script de verificação do deploy no Render
echo "🔍 Verificando Status do Deploy - Mestres do Café API"
echo "=================================================="

# Função para testar endpoint
test_endpoint() {
    local url=$1
    local description=$2
    
    echo -n "🧪 $description: "
    
    response=$(curl -s -w "%{http_code}" "$url" -o /tmp/response.json)
    http_code=${response: -3}
    
    if [ "$http_code" = "200" ]; then
        echo "✅ OK ($http_code)"
        if [ -s /tmp/response.json ]; then
            echo "   📄 Resposta: $(cat /tmp/response.json | head -c 100)..."
        fi
    else
        echo "❌ ERRO ($http_code)"
        if [ -s /tmp/response.json ]; then
            echo "   ❗ Erro: $(cat /tmp/response.json | head -c 200)..."
        fi
    fi
    echo ""
}

# Testes dos endpoints
echo "🌐 Testando endpoints da API..."
echo ""

test_endpoint "https://mestres-cafe-api.onrender.com/api/health" "Health Check"

test_endpoint "https://mestres-cafe-api.onrender.com/api/products?limit=1" "Produtos (1 item)"

test_endpoint "https://mestres-cafe-api.onrender.com/api/products?is_featured=true&limit=3&orderBy=sca_score&ascending=false" "Produtos Featured (Homepage)"

echo "📝 Testando Analytics..."
curl -s -X POST \
  -H "Content-Type: application/json" \
  -d '{"event": "deploy_test", "timestamp": "'$(date -u +%Y-%m-%dT%H:%M:%SZ)'"}' \
  https://mestres-cafe-api.onrender.com/api/analytics/track \
  > /tmp/analytics_response.json

if [ $? -eq 0 ]; then
    echo "✅ Analytics Track: OK"
    echo "   📄 Resposta: $(cat /tmp/analytics_response.json)"
else
    echo "❌ Analytics Track: ERRO"
fi

echo ""
echo "🏁 Verificação concluída!"
echo "=================================================="

# Cleanup
rm -f /tmp/response.json /tmp/analytics_response.json
