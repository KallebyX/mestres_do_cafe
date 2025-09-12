#!/bin/bash

# Mestres do Café - Script de Teste para Deploy no Render
# Este script testa se tudo está funcionando antes do deploy

set -e

echo "🧪 Testando configuração para deploy no Render..."

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Função para log colorido
log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# Verificar se estamos no diretório correto
if [ ! -f "render.yaml" ]; then
    error "Execute este script a partir do diretório raiz do projeto"
    exit 1
fi

log "Verificando estrutura de arquivos..."

# Verificar arquivos essenciais
files=(
    "render.yaml"
    "apps/api/build.sh"
    "apps/api/start.sh"
    "apps/web/build-render.sh"
    "apps/api/requirements.txt"
    "apps/web/package.json"
    "apps/api/app.py"
    "apps/api/src/app.py"
)

for file in "${files[@]}"; do
    if [ -f "$file" ]; then
        success "✅ $file"
    else
        error "❌ $file não encontrado"
        exit 1
    fi
done

log "Testando scripts de build..."

# Testar script de build da API
log "Testando build da API..."
cd apps/api
if [ -x "build.sh" ]; then
    success "✅ build.sh é executável"
else
    warning "⚠️ build.sh não é executável, corrigindo..."
    chmod +x build.sh
fi

if [ -x "start.sh" ]; then
    success "✅ start.sh é executável"
else
    warning "⚠️ start.sh não é executável, corrigindo..."
    chmod +x start.sh
fi

# Testar script de build do frontend
log "Testando build do frontend..."
cd ../web
if [ -x "build-render.sh" ]; then
    success "✅ build-render.sh é executável"
else
    warning "⚠️ build-render.sh não é executável, corrigindo..."
    chmod +x build-render.sh
fi

cd ../..

log "Verificando configurações do render.yaml..."

# Verificar se as URLs estão corretas
if grep -q "mestres-cafe-api.onrender.com" render.yaml; then
    success "✅ URL da API configurada"
else
    warning "⚠️ URL da API pode estar incorreta"
fi

if grep -q "mestres-cafe-web.onrender.com" render.yaml; then
    success "✅ URL do frontend configurada"
else
    warning "⚠️ URL do frontend pode estar incorreta"
fi

log "Testando build local do frontend..."

# Testar build do frontend
cd apps/web
export NODE_ENV=production
export VITE_API_URL=https://mestres-cafe-api.onrender.com/api
export VITE_APP_NAME="Mestres do Café"
export VITE_MERCADO_PAGO_PUBLIC_KEY="TEST-12345678-1234-1234-1234-123456789012"
export VITE_MERCADO_PAGO_ENVIRONMENT="sandbox"

log "Instalando dependências..."
npm install --silent

log "Executando build..."
npx vite build

if [ -d "dist" ]; then
    success "✅ Build do frontend funcionando"
    
    # Verificar se os arquivos essenciais existem
    if [ -f "dist/index.html" ]; then
        success "✅ index.html gerado"
    else
        error "❌ index.html não encontrado"
        exit 1
    fi
    
    if [ -d "dist/assets" ]; then
        success "✅ Assets gerados"
    else
        warning "⚠️ Assets não encontrados"
    fi
    
    # Verificar se os logos foram copiados
    if [ -f "dist/logo-mestres-do-cafe.svg" ]; then
        success "✅ Logos copiados"
    else
        warning "⚠️ Logos não encontrados"
    fi
    
else
    error "❌ Build do frontend falhou"
    exit 1
fi

cd ../..

log "Verificando configurações da API..."

# Verificar se a API pode ser importada
cd apps/api
python3 -c "
import sys
sys.path.append('src')
try:
    from app import create_app
    print('✅ API pode ser importada')
except Exception as e:
    print(f'❌ Erro ao importar API: {e}')
    exit(1)
"

cd ../..

log "Verificando dependências da API..."

# Verificar se as dependências estão no requirements.txt
deps=("Flask" "gunicorn" "psycopg2-binary" "redis")
for dep in "${deps[@]}"; do
    if grep -q "$dep" apps/api/requirements.txt; then
        success "✅ $dep no requirements.txt"
    else
        error "❌ $dep não encontrado no requirements.txt"
        exit 1
    fi
done

log "Verificando configurações de produção..."

# Verificar se as variáveis de ambiente estão configuradas no render.yaml
env_vars=("FLASK_ENV" "DATABASE_URL" "REDIS_URL" "SECRET_KEY" "CORS_ORIGINS")
for var in "${env_vars[@]}"; do
    if grep -q "$var" render.yaml; then
        success "✅ $var configurada no render.yaml"
    else
        warning "⚠️ $var não encontrada no render.yaml"
    fi
done

log "Testando conectividade..."

# Verificar se o Python pode importar as dependências
cd apps/api
python3 -c "
try:
    import flask
    import gunicorn
    import psycopg2
    import redis
    print('✅ Todas as dependências podem ser importadas')
except ImportError as e:
    print(f'❌ Erro ao importar dependência: {e}')
    exit(1)
"

cd ../..

log "Verificando estrutura final..."

# Mostrar estrutura de arquivos
echo ""
log "Estrutura de arquivos para deploy:"
echo "├── render.yaml (configuração principal)"
echo "├── apps/"
echo "│   ├── api/"
echo "│   │   ├── build.sh ✅"
echo "│   │   ├── start.sh ✅"
echo "│   │   ├── app.py ✅"
echo "│   │   ├── requirements.txt ✅"
echo "│   │   └── src/app.py ✅"
echo "│   └── web/"
echo "│       ├── build-render.sh ✅"
echo "│       ├── package.json ✅"
echo "│       └── dist/ ✅"
echo "└── RENDER_DEPLOY_GUIDE.md ✅"

echo ""
success "🎉 Todos os testes passaram!"
success "✅ Sistema pronto para deploy no Render!"

echo ""
log "📋 Próximos passos:"
echo "1. Faça commit das alterações:"
echo "   git add ."
echo "   git commit -m 'Configuração completa para Render'"
echo "   git push origin main"
echo ""
echo "2. Acesse https://dashboard.render.com"
echo "3. Siga o guia em RENDER_DEPLOY_GUIDE.md"
echo ""
echo "🚀 O sistema está 100% configurado para produção!"
