#!/bin/bash

# Mestres do Café - Script de Build para Produção
# Este script configura e constrói a aplicação para produção

set -e

echo "🚀 Iniciando build de produção do Mestres do Café..."

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
if [ ! -f "package.json" ]; then
    error "Execute este script a partir do diretório apps/web/"
    exit 1
fi

log "Verificando dependências..."

# Verificar se node_modules existe
if [ ! -d "node_modules" ]; then
    log "Instalando dependências..."
    npm install
fi

# Limpar builds anteriores
log "Limpando builds anteriores..."
rm -rf dist
rm -rf .vite

# Configurar variáveis de ambiente para produção
log "Configurando variáveis de ambiente para produção..."
export NODE_ENV=production
export VITE_API_URL=/api
export VITE_APP_NAME="Mestres do Café"
export VITE_MERCADO_PAGO_ENVIRONMENT=production

# Verificar se as variáveis necessárias estão definidas
if [ -z "$MERCADO_PAGO_PUBLIC_KEY" ]; then
    warning "MERCADO_PAGO_PUBLIC_KEY não definida. Usando valor de teste."
    export VITE_MERCADO_PAGO_PUBLIC_KEY="TEST-12345678-1234-1234-1234-123456789012"
else
    export VITE_MERCADO_PAGO_PUBLIC_KEY="$MERCADO_PAGO_PUBLIC_KEY"
fi

log "Variáveis de ambiente configuradas:"
log "  NODE_ENV: $NODE_ENV"
log "  VITE_API_URL: $VITE_API_URL"
log "  VITE_APP_NAME: $VITE_APP_NAME"
log "  VITE_MERCADO_PAGO_ENVIRONMENT: $VITE_MERCADO_PAGO_ENVIRONMENT"
log "  VITE_MERCADO_PAGO_PUBLIC_KEY: ${VITE_MERCADO_PAGO_PUBLIC_KEY:0:20}..."

# Executar build
log "Executando build de produção..."
npm run build:production

# Verificar se o build foi bem-sucedido
if [ -d "dist" ]; then
    success "Build de produção concluído com sucesso!"
    
    # Verificar tamanho do build
    BUILD_SIZE=$(du -sh dist | cut -f1)
    log "Tamanho do build: $BUILD_SIZE"
    
    # Listar arquivos principais
    log "Arquivos gerados:"
    ls -la dist/
    
    # Verificar se os assets estão presentes
    if [ -f "dist/index.html" ]; then
        success "index.html gerado com sucesso"
    else
        error "index.html não encontrado!"
        exit 1
    fi
    
    if [ -d "dist/assets" ]; then
        success "Diretório assets criado"
        log "Arquivos em assets:"
        ls -la dist/assets/ | head -10
    else
        warning "Diretório assets não encontrado"
    fi
    
    # Verificar se os logos estão presentes
    if [ -f "dist/logo-mestres-do-cafe.svg" ]; then
        success "Logos copiados com sucesso"
    else
        warning "Logos não encontrados no build"
    fi
    
else
    error "Build falhou! Diretório dist não foi criado."
    exit 1
fi

log "Build de produção finalizado!"
success "Aplicação pronta para deploy!"

# Instruções para deploy
echo ""
echo "📋 Próximos passos para deploy:"
echo "1. Copie o conteúdo de dist/ para seu servidor web"
echo "2. Configure o nginx para servir os arquivos estáticos"
echo "3. Configure o proxy para /api apontar para sua API backend"
echo "4. Verifique se todas as variáveis de ambiente estão configuradas"
echo ""
echo "🐳 Para usar com Docker:"
echo "docker build -t mestres-cafe-web:latest ."
echo "docker run -p 3000:80 mestres-cafe-web:latest"
