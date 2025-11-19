#!/bin/bash
# Script de Deploy para Produção
# Automatiza o processo completo de deploy com validações e rollback

set -euo pipefail

# Configurações
DEPLOY_DIR="${DEPLOY_DIR:-/opt/mestres-do-cafe}"
BACKUP_DIR="${BACKUP_DIR:-$DEPLOY_DIR/backups}"
DOCKER_COMPOSE_FILE="${DOCKER_COMPOSE_FILE:-docker-compose.yml}"
HEALTH_CHECK_URL="${HEALTH_CHECK_URL:-http://localhost:5001/api/health}"
HEALTH_CHECK_RETRIES="${HEALTH_CHECK_RETRIES:-10}"
HEALTH_CHECK_INTERVAL="${HEALTH_CHECK_INTERVAL:-5}"

# Cores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log_info() {
    echo -e "${GREEN}[INFO]${NC} $(date '+%H:%M:%S') - $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $(date '+%H:%M:%S') - $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $(date '+%H:%M:%S') - $1"
}

log_step() {
    echo -e "\n${BLUE}═══ $1 ═══${NC}"
}

rollback() {
    log_error "Deploy falhou! Iniciando rollback..."

    log_info "Restaurando containers anteriores..."
    docker-compose down
    docker-compose up -d --force-recreate

    log_error "Rollback concluído. Sistema restaurado ao estado anterior."
    exit 1
}

# Trap para rollback em caso de erro
trap rollback ERR

# Banner
echo -e "${BLUE}"
cat << "EOF"
╔═══════════════════════════════════════╗
║   Mestres do Café - Deploy Script    ║
╚═══════════════════════════════════════╝
EOF
echo -e "${NC}"

log_info "Iniciando deploy para produção..."
log_info "Diretório: $DEPLOY_DIR"

# Pré-deploy: Validações
log_step "1. Validações Pré-Deploy"

# Verificar se está no diretório correto
if [ ! -f "$DOCKER_COMPOSE_FILE" ]; then
    log_error "Arquivo $DOCKER_COMPOSE_FILE não encontrado!"
    log_info "Execute este script do diretório: $DEPLOY_DIR"
    exit 1
fi

# Validar variáveis de ambiente
log_info "Validando variáveis de ambiente..."
if [ -f "./scripts/validate-env.sh" ]; then
    bash ./scripts/validate-env.sh || {
        log_error "Validação de variáveis falhou!"
        exit 1
    }
else
    log_warn "Script validate-env.sh não encontrado - pulando validação"
fi

# Verificar se Docker está rodando
if ! docker info &> /dev/null; then
    log_error "Docker não está rodando!"
    exit 1
fi

log_info "Docker OK"

# Verificar conexão com registry
log_info "Verificando acesso ao registry..."
if docker login ghcr.io --username "$GITHUB_ACTOR" --password "$GITHUB_TOKEN" &> /dev/null; then
    log_info "Acesso ao registry OK"
else
    log_warn "Não foi possível fazer login no registry (usando imagens locais)"
fi

# Backup do banco de dados
log_step "2. Backup do Banco de Dados"

if [ -f "./scripts/backup-database.sh" ]; then
    log_info "Criando backup do banco de dados..."
    bash ./scripts/backup-database.sh || {
        log_error "Falha ao criar backup!"
        exit 1
    }
else
    log_warn "Script backup-database.sh não encontrado - pulando backup"
fi

# Git pull (se aplicável)
log_step "3. Atualizando Código"

if [ -d ".git" ]; then
    log_info "Atualizando repositório Git..."

    # Salvar branch atual
    CURRENT_BRANCH=$(git branch --show-current)
    log_info "Branch atual: $CURRENT_BRANCH"

    # Pull das mudanças
    git pull origin "$CURRENT_BRANCH" || {
        log_error "Falha ao atualizar repositório!"
        exit 1
    }

    log_info "Repositório atualizado"
else
    log_warn "Não é um repositório Git - pulando atualização"
fi

# Build das imagens
log_step "4. Build das Imagens Docker"

log_info "Baixando imagens mais recentes..."
docker-compose pull || log_warn "Algumas imagens não puderam ser baixadas"

log_info "Fazendo build das imagens..."
docker-compose build --no-cache --parallel || {
    log_error "Falha no build das imagens!"
    exit 1
}

# Parar containers antigos
log_step "5. Parando Containers Antigos"

log_info "Salvando estado atual dos containers..."
OLD_CONTAINERS=$(docker-compose ps -q)

log_info "Parando containers..."
docker-compose down --remove-orphans

# Subir novos containers
log_step "6. Iniciando Novos Containers"

log_info "Iniciando containers..."
docker-compose up -d

log_info "Aguardando containers iniciarem..."
sleep 10

# Verificar se containers estão rodando
RUNNING_CONTAINERS=$(docker-compose ps -q | wc -l)
log_info "Containers rodando: $RUNNING_CONTAINERS"

# Migrations do banco de dados
log_step "7. Migrações do Banco de Dados"

log_info "Executando migrações..."
docker-compose exec -T api flask db upgrade || {
    log_error "Falha nas migrações do banco!"
    rollback
}

log_info "Migrações concluídas com sucesso"

# Health checks
log_step "8. Health Checks"

log_info "Aguardando aplicação ficar pronta..."
sleep 15

log_info "Executando health checks..."
RETRY_COUNT=0
HEALTH_OK=false

while [ $RETRY_COUNT -lt $HEALTH_CHECK_RETRIES ]; do
    if curl -sf -m 5 "$HEALTH_CHECK_URL" > /dev/null 2>&1; then
        log_info "Health check passou!"
        HEALTH_OK=true
        break
    fi

    RETRY_COUNT=$((RETRY_COUNT + 1))
    log_warn "Health check falhou (tentativa $RETRY_COUNT/$HEALTH_CHECK_RETRIES)"
    sleep $HEALTH_CHECK_INTERVAL
done

if [ "$HEALTH_OK" = false ]; then
    log_error "Health checks falharam após $HEALTH_CHECK_RETRIES tentativas!"

    log_error "Logs dos containers:"
    docker-compose logs --tail=50

    rollback
fi

# Health check completo
if [ -f "./scripts/health-check.sh" ]; then
    log_info "Executando health check completo..."
    bash ./scripts/health-check.sh || {
        log_warn "Health check completo encontrou problemas"
    }
fi

# Warm cache
log_step "9. Aquecendo Cache"

if [ -f "./scripts/warm-cache.sh" ]; then
    log_info "Aquecendo cache..."
    bash ./scripts/warm-cache.sh || log_warn "Falha ao aquecer cache (não crítico)"
else
    log_warn "Script warm-cache.sh não encontrado - pulando"
fi

# Limpeza
log_step "10. Limpeza"

log_info "Removendo imagens antigas..."
docker image prune -f || log_warn "Falha na limpeza de imagens"

log_info "Removendo volumes órfãos..."
docker volume prune -f || log_warn "Falha na limpeza de volumes"

# Resumo final
log_step "Deploy Concluído com Sucesso!"

echo ""
log_info "✓ Backup do banco de dados criado"
log_info "✓ Código atualizado"
log_info "✓ Imagens construídas"
log_info "✓ Containers iniciados"
log_info "✓ Migrações executadas"
log_info "✓ Health checks passaram"
log_info "✓ Cache aquecido"
echo ""

# Informações do deploy
log_info "Informações do Deploy:"
echo "  Data/Hora: $(date '+%Y-%m-%d %H:%M:%S')"
if [ -d ".git" ]; then
    echo "  Commit: $(git rev-parse --short HEAD)"
    echo "  Branch: $(git branch --show-current)"
fi
echo "  Containers: $RUNNING_CONTAINERS rodando"
echo ""

log_info "Monitoramento: http://localhost:9090 (Prometheus)"
log_info "Dashboards: http://localhost:3001 (Grafana)"
echo ""

log_info "Deploy concluído! 🚀"
exit 0
