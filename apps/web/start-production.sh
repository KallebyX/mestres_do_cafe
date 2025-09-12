#!/bin/bash

# Mestres do Café - Script de Inicialização para Produção
# Este script inicia a aplicação em modo de produção

set -e

echo "🚀 Iniciando Mestres do Café em modo de produção..."

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

# Verificar se o build existe
if [ ! -d "dist" ]; then
    log "Build não encontrado. Executando build de produção..."
    npm run build:production
fi

# Verificar se o serve está instalado
if ! command -v serve >/dev/null 2>&1; then
    log "Instalando serve globalmente..."
    npm install -g serve
fi

# Parar servidores existentes na porta 3000
log "Parando servidores existentes na porta 3000..."
lsof -ti:3000 | xargs kill -9 2>/dev/null || true

# Iniciar servidor de produção
log "Iniciando servidor de produção..."
log "Aplicação disponível em: http://localhost:3000"

# Usar serve com configuração correta para SPA
serve -s dist -l 3000 --config serve.json
