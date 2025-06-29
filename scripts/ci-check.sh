#!/bin/bash
# 🔄 CI Check - Validações locais antes do commit
# Executa as mesmas verificações que o CI/CD faria

set -e

echo "🔄 Iniciando validações de CI/CD locais..."

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Função para log colorido
log() {
    echo -e "${BLUE}[CI-CHECK]${NC} $1"
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

# Verificar se estamos na raiz do projeto
if [ ! -f "package.json" ]; then
    error "Execute este script na raiz do projeto!"
    exit 1
fi

log "1. Verificando Node.js e npm..."
node_version=$(node --version)
npm_version=$(npm --version)
echo "Node.js: $node_version"
echo "npm: $npm_version"

# Verificar versão mínima do Node
required_node="v18"
if [[ "$node_version" < "$required_node" ]]; then
    error "Node.js $required_node+ necessário. Atual: $node_version"
    exit 1
fi
success "Versões OK"

log "2. Instalando dependências..."
npm ci

log "3. Verificando lint (frontend)..."
if npm run lint; then
    success "ESLint passou"
else
    error "ESLint falhou"
    exit 1
fi

log "4. Verificando backend dependencies..."
if [ -d "server" ]; then
    cd server
    npm ci
    cd ..
    success "Dependências do backend instaladas"
else
    warning "Pasta server não encontrada"
fi

log "5. Executando testes frontend..."
if npm run test:run; then
    success "Testes frontend passaram"
else
    error "Testes frontend falharam"
    exit 1
fi

log "6. Executando testes backend..."
if [ -d "server" ]; then
    cd server
    if npm run test; then
        success "Testes backend passaram"
    else
        error "Testes backend falharam"
        exit 1
    fi
    cd ..
else
    warning "Testes backend pulados (pasta server não encontrada)"
fi

log "7. Verificando build..."
if npm run build; then
    success "Build passou"
    
    # Verificar tamanho do bundle
    if [ -d "dist" ]; then
        bundle_size=$(du -sm dist/ | cut -f1)
        if [ $bundle_size -gt 10 ]; then
            warning "Bundle grande: ${bundle_size}MB (limite: 10MB)"
        else
            success "Bundle size OK: ${bundle_size}MB"
        fi
    fi
else
    error "Build falhou"
    exit 1
fi

log "8. Verificando vulnerabilidades de segurança..."
if npm audit --audit-level moderate; then
    success "Audit npm passou"
else
    warning "Vulnerabilidades encontradas"
fi

if [ -d "server" ]; then
    cd server
    if npm audit --audit-level moderate; then
        success "Audit backend passou"
    else
        warning "Vulnerabilidades no backend encontradas"
    fi
    cd ..
fi

log "9. Verificando formatação de código..."
if npx prettier --check "src/**/*.{js,jsx,json,css,md}" > /dev/null 2>&1; then
    success "Código formatado corretamente"
else
    warning "Código não formatado. Execute: npm run format"
fi

log "10. Verificando commits..."
if git status --porcelain | grep -q .; then
    warning "Arquivos não commitados encontrados"
    git status --short
else
    success "Working directory limpo"
fi

echo ""
echo "🎉 Todas as verificações de CI/CD concluídas!"
echo ""
echo "📊 Resumo:"
echo "✅ Lint: OK"
echo "✅ Testes: OK" 
echo "✅ Build: OK"
echo "✅ Segurança: Verificada"
echo ""
echo "🚀 Pronto para commit e push!" 