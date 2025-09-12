#!/bin/bash

# Mestres do Café - Script de Deploy para Produção
# Este script configura e faz deploy completo do sistema para produção

set -e

echo "🚀 Iniciando deploy de produção do Mestres do Café..."

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
if [ ! -f "docker-compose.yml" ]; then
    error "Execute este script a partir do diretório raiz do projeto"
    exit 1
fi

# Função para verificar se um comando existe
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Verificar dependências
log "Verificando dependências..."

if ! command_exists docker; then
    error "Docker não está instalado!"
    exit 1
fi

if ! command_exists docker-compose; then
    error "Docker Compose não está instalado!"
    exit 1
fi

success "Dependências verificadas"

# Criar arquivo .env se não existir
if [ ! -f ".env" ]; then
    log "Criando arquivo .env de produção..."
    cat > .env << EOF
# Mestres do Café - Configurações de Produção
NODE_ENV=production
BUILD_TARGET=production
WEB_BUILD_TARGET=production

# Database
DB_PASSWORD=mestres123
DB_PORT=5432

# Redis
REDIS_PASSWORD=redis123
REDIS_PORT=6379

# API
API_PORT=5001
FLASK_ENV=production
FLASK_DEBUG=0

# Security
SECRET_KEY=prod-secret-key-$(openssl rand -hex 32)
JWT_SECRET_KEY=prod-jwt-secret-$(openssl rand -hex 32)

# Mercado Pago (configure com suas chaves reais)
MERCADO_PAGO_ACCESS_TOKEN=your_access_token_here
MERCADO_PAGO_PUBLIC_KEY=your_public_key_here
MERCADO_PAGO_ENVIRONMENT=production
MERCADO_PAGO_WEBHOOK_SECRET=your_webhook_secret_here
MERCADO_PAGO_NOTIFICATION_URL=https://yourdomain.com/api/webhooks/mercadopago

# Melhor Envio (configure com suas chaves reais)
MELHOR_ENVIO_API_KEY=your_api_key_here
MELHOR_ENVIO_ENVIRONMENT=production
MELHOR_ENVIO_CLIENT_ID=your_client_id_here
MELHOR_ENVIO_CLIENT_SECRET=your_client_secret_here
MELHOR_ENVIO_REDIRECT_URI=https://yourdomain.com/auth/melhor-envio/callback

# Web
WEB_PORT=3000
VITE_API_URL=/api
VITE_APP_NAME="Mestres do Café"

# Nginx
NGINX_PORT=80
NGINX_SSL_PORT=443

# Monitoring (opcional)
PROMETHEUS_PORT=9090
GRAFANA_PORT=3001
GRAFANA_PASSWORD=admin123

# Debug
DEBUG=False
TESTING=False
EOF
    warning "Arquivo .env criado com valores padrão. Configure as chaves reais antes do deploy!"
else
    log "Arquivo .env já existe"
fi

# Parar containers existentes
log "Parando containers existentes..."
docker-compose down --remove-orphans || true

# Limpar volumes antigos (opcional)
read -p "Deseja limpar volumes antigos? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    log "Limpando volumes antigos..."
    docker-compose down -v --remove-orphans || true
    docker system prune -f || true
fi

# Build das imagens
log "Construindo imagens Docker..."
docker-compose build --no-cache

# Iniciar serviços
log "Iniciando serviços..."
docker-compose up -d

# Aguardar serviços ficarem prontos
log "Aguardando serviços ficarem prontos..."
sleep 30

# Verificar status dos serviços
log "Verificando status dos serviços..."

# Verificar API
if curl -f http://localhost:5001/api/health >/dev/null 2>&1; then
    success "API está funcionando"
else
    error "API não está respondendo"
    docker-compose logs api
fi

# Verificar Web
if curl -f http://localhost:3000/ >/dev/null 2>&1; then
    success "Frontend está funcionando"
else
    error "Frontend não está respondendo"
    docker-compose logs web
fi

# Verificar Database
if docker-compose exec -T db pg_isready -U kalleby -d mestres_cafe >/dev/null 2>&1; then
    success "Database está funcionando"
else
    error "Database não está respondendo"
    docker-compose logs db
fi

# Verificar Redis
if docker-compose exec -T redis redis-cli ping >/dev/null 2>&1; then
    success "Redis está funcionando"
else
    error "Redis não está respondendo"
    docker-compose logs redis
fi

# Mostrar status final
log "Status final dos containers:"
docker-compose ps

# Mostrar logs se houver problemas
if ! curl -f http://localhost:3000/ >/dev/null 2>&1; then
    error "Problemas detectados. Logs do frontend:"
    docker-compose logs web --tail=50
fi

if ! curl -f http://localhost:5001/api/health >/dev/null 2>&1; then
    error "Problemas detectados. Logs da API:"
    docker-compose logs api --tail=50
fi

# Instruções finais
echo ""
success "Deploy concluído!"
echo ""
echo "🌐 URLs de acesso:"
echo "  Frontend: http://localhost:3000"
echo "  API: http://localhost:5001/api"
echo "  Database: localhost:5432"
echo "  Redis: localhost:6379"
echo ""
echo "📋 Comandos úteis:"
echo "  Ver logs: docker-compose logs -f [service]"
echo "  Parar: docker-compose down"
echo "  Reiniciar: docker-compose restart [service]"
echo "  Status: docker-compose ps"
echo ""
echo "🔧 Para produção real:"
echo "1. Configure as chaves reais no arquivo .env"
echo "2. Configure domínio e SSL no nginx"
echo "3. Configure backup do banco de dados"
echo "4. Configure monitoramento"
echo ""
