#!/bin/bash
# 🚀 Deploy Check - Verificar status dos deployments
# Monitora o status dos sites em produção

set -e

echo "🚀 Verificando status dos deployments..."

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Função para log colorido
log() {
    echo -e "${BLUE}[DEPLOY-CHECK]${NC} $1"
}

success() {
    echo -e "${GREEN}✅ $1${NC}"
}

warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

error() {
    echo -e "${RED}❌ $1${NC}"
}

# URLs para verificar
FRONTEND_URL="https://mestres-cafe.vercel.app"
API_URL="https://mestres-cafe-api.render.com"
STAGING_URL="https://mestres-cafe-staging.netlify.app"

check_site() {
    local url=$1
    local name=$2
    local max_time=10
    
    log "Verificando $name ($url)..."
    
    # Verificar se o site responde
    if response=$(curl -s -o /dev/null -w "%{http_code}:%{time_total}" --max-time $max_time "$url" 2>/dev/null); then
        status_code=$(echo $response | cut -d: -f1)
        response_time=$(echo $response | cut -d: -f2)
        
        if [ "$status_code" = "200" ]; then
            success "$name: OK (${response_time}s)"
            return 0
        else
            error "$name: HTTP $status_code (${response_time}s)"
            return 1
        fi
    else
        error "$name: Sem resposta ou timeout"
        return 1
    fi
}

check_api_health() {
    local api_url=$1
    local health_endpoint="${api_url}/api/health"
    
    log "Verificando health check da API..."
    
    if response=$(curl -s --max-time 10 "$health_endpoint" 2>/dev/null); then
        if echo "$response" | grep -q "\"status\".*\"OK\""; then
            success "API Health: OK"
            
            # Extrair informações do health check
            if command -v jq >/dev/null 2>&1; then
                version=$(echo "$response" | jq -r '.version // "N/A"')
                timestamp=$(echo "$response" | jq -r '.timestamp // "N/A"')
                echo "  Versão: $version"
                echo "  Timestamp: $timestamp"
            fi
            return 0
        else
            error "API Health: Resposta inválida"
            echo "Resposta: $response"
            return 1
        fi
    else
        error "API Health: Falha na requisição"
        return 1
    fi
}

run_lighthouse_check() {
    local url=$1
    local name=$2
    
    log "Executando Lighthouse para $name..."
    
    if command -v npx >/dev/null 2>&1; then
        # Executar lighthouse simples
        if npx lighthouse "$url" --quiet --chrome-flags="--headless --no-sandbox" --output=json --output-path=./lighthouse-temp.json > /dev/null 2>&1; then
            if [ -f "./lighthouse-temp.json" ] && command -v jq >/dev/null 2>&1; then
                performance=$(jq '.categories.performance.score * 100' ./lighthouse-temp.json | cut -d. -f1)
                fcp=$(jq '.audits."first-contentful-paint".numericValue' ./lighthouse-temp.json)
                lcp=$(jq '.audits."largest-contentful-paint".numericValue' ./lighthouse-temp.json)
                
                echo "  Performance Score: ${performance}%"
                echo "  First Contentful Paint: ${fcp}ms"
                echo "  Largest Contentful Paint: ${lcp}ms"
                
                if [ "$performance" -ge 80 ]; then
                    success "$name: Performance OK (${performance}%)"
                else
                    warning "$name: Performance baixa (${performance}%)"
                fi
                
                rm -f ./lighthouse-temp.json
            else
                warning "Não foi possível analisar resultados do Lighthouse"
            fi
        else
            warning "Lighthouse falhou para $name"
        fi
    else
        warning "Lighthouse não disponível (npx não encontrado)"
    fi
}

check_ssl_cert() {
    local url=$1
    local name=$2
    
    log "Verificando certificado SSL para $name..."
    
    domain=$(echo "$url" | sed 's|https\?://||' | cut -d/ -f1)
    
    if openssl s_client -connect "$domain:443" -servername "$domain" </dev/null 2>/dev/null | openssl x509 -noout -dates > cert_info.txt 2>/dev/null; then
        not_after=$(grep "notAfter" cert_info.txt | cut -d= -f2)
        exp_date=$(date -d "$not_after" +%s 2>/dev/null || echo "0")
        current_date=$(date +%s)
        days_until_exp=$(( (exp_date - current_date) / 86400 ))
        
        if [ $days_until_exp -gt 30 ]; then
            success "$name: SSL OK (expira em $days_until_exp dias)"
        elif [ $days_until_exp -gt 0 ]; then
            warning "$name: SSL expira em $days_until_exp dias"
        else
            error "$name: SSL expirado!"
        fi
        
        rm -f cert_info.txt
    else
        warning "$name: Não foi possível verificar SSL"
    fi
}

# Verificações principais
echo "==================== VERIFICAÇÕES DE DEPLOY ===================="
echo ""

# 1. Verificar sites
total_checks=0
passed_checks=0

echo "🌐 Verificando Sites:"
for site in "$FRONTEND_URL:Frontend" "$STAGING_URL:Staging"; do
    url=$(echo $site | cut -d: -f1)
    name=$(echo $site | cut -d: -f2)
    total_checks=$((total_checks + 1))
    if check_site "$url" "$name"; then
        passed_checks=$((passed_checks + 1))
    fi
done

echo ""

# 2. Verificar API
echo "🔌 Verificando API:"
total_checks=$((total_checks + 1))
if check_api_health "$API_URL"; then
    passed_checks=$((passed_checks + 1))
fi

echo ""

# 3. Verificar SSL
echo "🔒 Verificando Certificados SSL:"
for site in "$FRONTEND_URL:Frontend" "$API_URL:API"; do
    url=$(echo $site | cut -d: -f1)
    name=$(echo $site | cut -d: -f2)
    check_ssl_cert "$url" "$name"
done

echo ""

# 4. Performance check (opcional)
if [ "$1" = "--lighthouse" ] || [ "$1" = "-l" ]; then
    echo "📊 Verificando Performance:"
    run_lighthouse_check "$FRONTEND_URL" "Frontend"
fi

echo ""

# Resumo final
echo "==================== RESUMO ===================="
echo "Verificações passaram: $passed_checks/$total_checks"

if [ $passed_checks -eq $total_checks ]; then
    success "Todos os deploys estão funcionando! 🎉"
    echo ""
    echo "🔗 Links úteis:"
    echo "  Frontend: $FRONTEND_URL"
    echo "  API: $API_URL/api/health"
    echo "  Staging: $STAGING_URL"
    echo ""
    exit 0
else
    error "Alguns deploys apresentam problemas!"
    echo ""
    echo "🔍 Verifique:"
    echo "  - GitHub Actions: https://github.com/YOUR_USERNAME/mestres_do_cafe/actions"
    echo "  - Vercel Dashboard: https://vercel.com/dashboard"
    echo "  - Render Dashboard: https://dashboard.render.com"
    echo ""
    exit 1
fi 