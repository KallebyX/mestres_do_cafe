#!/bin/bash

# Mestres do Café - Script de Start para Render
# Este script inicia a aplicação Flask em produção

set -e

echo "🚀 Iniciando API no Render..."

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

# Configurar variáveis de ambiente
export FLASK_ENV=production
export FLASK_DEBUG=0
export PYTHONPATH=/opt/render/project/src/apps/api/src

# Verificar se a porta está definida
if [ -z "$PORT" ]; then
    export PORT=5001
    warning "PORT não definida, usando 5001"
fi

log "Configurações:"
log "  FLASK_ENV: $FLASK_ENV"
log "  FLASK_DEBUG: $FLASK_DEBUG"
log "  PORT: $PORT"
log "  PYTHONPATH: $PYTHONPATH"

# Verificar se o banco de dados está acessível
if [ -n "$DATABASE_URL" ]; then
    log "DATABASE_URL configurada"
else
    warning "DATABASE_URL não configurada"
fi

if [ -n "$NEON_DATABASE_URL" ]; then
    log "NEON_DATABASE_URL configurada"
fi

# Verificar se Redis está acessível
if [ -n "$REDIS_URL" ]; then
    log "REDIS_URL configurada"
else
    warning "REDIS_URL não configurada"
fi

# Aguardar um pouco para o banco de dados estar pronto
log "Aguardando banco de dados..."
sleep 5

# Testar conexão com o banco
log "Testando conexão com banco de dados..."
python -c "
import os
import sys
sys.path.append('src')

try:
    from database import db
    from app import app
    with app.app_context():
        # Testar conexão simples
        result = db.engine.execute('SELECT 1')
        print('✅ Conexão com banco de dados OK')
except Exception as e:
    print(f'⚠️  Aviso: {e}')
    print('Continuando mesmo assim...')
"

# Iniciar a aplicação
log "Iniciando aplicação Flask..."

# Usar Gunicorn para produção
exec gunicorn \
    --bind 0.0.0.0:$PORT \
    --workers 2 \
    --worker-class sync \
    --worker-connections 1000 \
    --max-requests 1000 \
    --max-requests-jitter 100 \
    --timeout 30 \
    --keep-alive 2 \
    --preload \
    --access-logfile - \
    --error-logfile - \
    --log-level info \
    src.app:app