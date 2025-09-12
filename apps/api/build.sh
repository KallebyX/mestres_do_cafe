#!/bin/bash

# Mestres do Café - Script de Build para Render
# Este script instala dependências e prepara a aplicação para produção

set -e

echo "🚀 Iniciando build da API no Render..."

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
if [ ! -f "requirements.txt" ]; then
    error "Execute este script a partir do diretório apps/api/"
    exit 1
fi

log "Instalando dependências Python..."

# Atualizar pip
python -m pip install --upgrade pip

# Instalar dependências
pip install -r requirements.txt

# Instalar dependências adicionais para produção
pip install gunicorn psycopg2-binary redis

log "Criando diretórios necessários..."

# Criar diretórios se não existirem
mkdir -p logs
mkdir -p uploads
mkdir -p dist

log "Configurando permissões..."

# Dar permissões corretas
chmod +x start.sh
chmod 755 logs uploads dist

log "Verificando estrutura de arquivos..."

# Verificar se os arquivos principais existem
if [ ! -f "app.py" ]; then
    error "app.py não encontrado!"
    exit 1
fi

if [ ! -f "src/app.py" ]; then
    error "src/app.py não encontrado!"
    exit 1
fi

log "Configurando variáveis de ambiente..."

# Configurar variáveis de ambiente para produção
export FLASK_ENV=production
export FLASK_DEBUG=0
export PYTHONPATH=/opt/render/project/src/apps/api/src

log "Testando importação dos módulos..."

# Testar se a aplicação pode ser importada
python -c "import sys; sys.path.append('src'); from app import app; print('✅ Aplicação importada com sucesso')"

success "Build da API concluído com sucesso!"

log "Estrutura final:"
ls -la

echo ""
success "API pronta para produção no Render!"