#!/bin/bash

# Mestres do Café - Script de Build para Render (Frontend)
# Este script constrói a aplicação React para produção no Render

set -e

echo "🚀 Iniciando build do frontend no Render..."

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

log "Instalando dependências Node.js..."

# Instalar dependências
npm install

log "Configurando variáveis de ambiente para produção..."

# Configurar variáveis de ambiente para produção
export NODE_ENV=production
export VITE_API_URL=${VITE_API_URL:-"https://mestres-cafe-api.onrender.com/api"}
export VITE_APP_NAME="Mestres do Café"
export VITE_MERCADO_PAGO_PUBLIC_KEY=${VITE_MERCADO_PAGO_PUBLIC_KEY:-"TEST-12345678-1234-1234-1234-123456789012"}
export VITE_MERCADO_PAGO_ENVIRONMENT=${VITE_MERCADO_PAGO_ENVIRONMENT:-"sandbox"}

log "Variáveis de ambiente:"
log "  NODE_ENV: $NODE_ENV"
log "  VITE_API_URL: $VITE_API_URL"
log "  VITE_APP_NAME: $VITE_APP_NAME"
log "  VITE_MERCADO_PAGO_ENVIRONMENT: $VITE_MERCADO_PAGO_ENVIRONMENT"

log "Limpando builds anteriores..."

# Limpar builds anteriores
rm -rf dist
rm -rf .vite

log "Executando build de produção..."

# Executar build
npm run build

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
    
    # Verificar se o index.html contém as configurações corretas
    if grep -q "VITE_API_URL" dist/index.html; then
        success "Configurações da API encontradas no build"
    else
        warning "Configurações da API podem não estar corretas"
    fi
    
else
    error "Build falhou! Diretório dist não foi criado."
    exit 1
fi

log "Build do frontend finalizado!"
success "Frontend pronto para deploy no Render!"
