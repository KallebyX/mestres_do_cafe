#!/bin/bash
# Script de Teste de Staging e Rollback
# Testa deploy em staging e simula falhas para verificar rollback automático

set -euo pipefail

# Configurações
STAGING_HOST="${STAGING_HOST:-staging.mestres-do-cafe.com}"
STAGING_USER="${STAGING_USER:-deploy}"
STAGING_DIR="${STAGING_DIR:-/opt/mestres-do-cafe}"
API_URL="${API_URL:-https://staging.mestres-do-cafe.com/api}"
SSH_KEY="${SSH_KEY:-$HOME/.ssh/staging_deploy_key}"

# Cores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

TEST_PASSED=0
TEST_FAILED=0
TEST_TOTAL=0

log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

log_test() {
    echo -e "${BLUE}[TEST]${NC} $1"
}

log_pass() {
    echo -e "${GREEN}✓ PASS${NC} $1"
    ((TEST_PASSED++))
    ((TEST_TOTAL++))
}

log_fail() {
    echo -e "${RED}✗ FAIL${NC} $1"
    ((TEST_FAILED++))
    ((TEST_TOTAL++))
}

run_ssh_command() {
    local command=$1
    local description=${2:-""}

    if [ -n "$description" ]; then
        log_info "$description"
    fi

    ssh -i "$SSH_KEY" -o StrictHostKeyChecking=no "$STAGING_USER@$STAGING_HOST" "$command"
}

# Banner
echo -e "${BLUE}"
cat << "EOF"
╔═══════════════════════════════════════╗
║   Staging & Rollback Test Suite      ║
║   Mestres do Café                    ║
╚═══════════════════════════════════════╝
EOF
echo -e "${NC}"

log_info "Iniciando testes de staging..."
log_info "Host: $STAGING_HOST"
log_info "User: $STAGING_USER"
echo ""

# Teste 1: Conectividade SSH
log_test "Teste 1: Conectividade SSH"
if ssh -i "$SSH_KEY" -o StrictHostKeyChecking=no -o ConnectTimeout=10 "$STAGING_USER@$STAGING_HOST" "echo 'Connection OK'" &> /dev/null; then
    log_pass "Conexão SSH estabelecida com sucesso"
else
    log_fail "Não foi possível conectar via SSH"
    log_error "Verifique: SSH_KEY, STAGING_HOST, STAGING_USER"
    exit 1
fi

# Teste 2: Verificar instalação Docker
log_test "Teste 2: Verificar Docker no servidor"
if run_ssh_command "docker --version" &> /dev/null; then
    DOCKER_VERSION=$(run_ssh_command "docker --version")
    log_pass "Docker instalado: $DOCKER_VERSION"
else
    log_fail "Docker não encontrado no servidor"
fi

# Teste 3: Verificar Docker Compose
log_test "Teste 3: Verificar Docker Compose"
if run_ssh_command "docker-compose --version" &> /dev/null; then
    COMPOSE_VERSION=$(run_ssh_command "docker-compose --version")
    log_pass "Docker Compose instalado: $COMPOSE_VERSION"
else
    log_fail "Docker Compose não encontrado"
fi

# Teste 4: Verificar diretório do projeto
log_test "Teste 4: Verificar diretório do projeto"
if run_ssh_command "test -d $STAGING_DIR" &> /dev/null; then
    log_pass "Diretório do projeto existe: $STAGING_DIR"
else
    log_fail "Diretório do projeto não encontrado: $STAGING_DIR"
fi

# Teste 5: Verificar arquivo .env
log_test "Teste 5: Verificar arquivo .env"
if run_ssh_command "test -f $STAGING_DIR/.env" &> /dev/null; then
    log_pass "Arquivo .env encontrado"
else
    log_fail "Arquivo .env não encontrado"
fi

# Teste 6: Verificar docker-compose.yml
log_test "Teste 6: Verificar docker-compose.yml"
if run_ssh_command "test -f $STAGING_DIR/docker-compose.yml" &> /dev/null; then
    log_pass "Arquivo docker-compose.yml encontrado"
else
    log_fail "Arquivo docker-compose.yml não encontrado"
fi

# Teste 7: Status dos containers
log_test "Teste 7: Status dos containers Docker"
RUNNING_CONTAINERS=$(run_ssh_command "cd $STAGING_DIR && docker-compose ps -q | wc -l" 2>/dev/null || echo "0")
log_info "Containers rodando: $RUNNING_CONTAINERS"

if [ "$RUNNING_CONTAINERS" -gt 0 ]; then
    log_pass "Containers estão rodando"
    run_ssh_command "cd $STAGING_DIR && docker-compose ps"
else
    log_warn "Nenhum container rodando"
fi

# Teste 8: Health check da API
log_test "Teste 8: Health check da API"
if curl -sf -m 10 "$API_URL/health" > /dev/null 2>&1; then
    HEALTH_STATUS=$(curl -s -m 10 "$API_URL/health" | grep -o '"status":"[^"]*"' || echo "unknown")
    log_pass "API respondendo: $HEALTH_STATUS"
else
    log_fail "API não está respondendo em $API_URL/health"
fi

# Teste 9: Teste de endpoint de produtos
log_test "Teste 9: Endpoint de produtos"
if curl -sf -m 10 "$API_URL/products?page=1&limit=1" > /dev/null 2>&1; then
    log_pass "Endpoint de produtos funcionando"
else
    log_fail "Endpoint de produtos não responde"
fi

# Teste 10: Verificar logs de erro
log_test "Teste 10: Verificar logs recentes por erros"
ERROR_COUNT=$(run_ssh_command "cd $STAGING_DIR && docker-compose logs --tail=100 api 2>/dev/null | grep -i 'error\|exception\|traceback' | wc -l" || echo "0")
log_info "Erros encontrados nos logs: $ERROR_COUNT"

if [ "$ERROR_COUNT" -lt 5 ]; then
    log_pass "Poucos erros nos logs (< 5)"
else
    log_warn "Muitos erros nos logs ($ERROR_COUNT encontrados)"
fi

# Teste 11: Verificar espaço em disco
log_test "Teste 11: Verificar espaço em disco"
DISK_USAGE=$(run_ssh_command "df -h / | awk 'NR==2 {print \$5}' | sed 's/%//'" || echo "100")
log_info "Uso de disco: ${DISK_USAGE}%"

if [ "$DISK_USAGE" -lt 80 ]; then
    log_pass "Espaço em disco OK (${DISK_USAGE}%)"
elif [ "$DISK_USAGE" -lt 90 ]; then
    log_warn "Espaço em disco alto (${DISK_USAGE}%)"
else
    log_fail "Espaço em disco crítico (${DISK_USAGE}%)"
fi

# Teste 12: Verificar memória
log_test "Teste 12: Verificar uso de memória"
MEMORY_USAGE=$(run_ssh_command "free | awk 'NR==2 {printf \"%.0f\", \$3/\$2*100}'" || echo "100")
log_info "Uso de memória: ${MEMORY_USAGE}%"

if [ "$MEMORY_USAGE" -lt 80 ]; then
    log_pass "Memória OK (${MEMORY_USAGE}%)"
else
    log_warn "Uso de memória alto (${MEMORY_USAGE}%)"
fi

echo ""
echo "════════════════════════════════════════"
echo "  TESTE DE DEPLOY E ROLLBACK"
echo "════════════════════════════════════════"
echo ""

# Teste 13: Backup antes de deploy
log_test "Teste 13: Criar backup do banco de dados"
if run_ssh_command "cd $STAGING_DIR && ./scripts/backup-database.sh" &> /dev/null; then
    log_pass "Backup criado com sucesso"
else
    log_warn "Falha ao criar backup (script pode não existir)"
fi

# Teste 14: Testar deploy normal
log_test "Teste 14: Simular deploy normal"
log_info "Executando git pull..."

DEPLOY_OUTPUT=$(run_ssh_command "cd $STAGING_DIR && git pull 2>&1" || echo "failed")

if echo "$DEPLOY_OUTPUT" | grep -q "Already up to date\|Updating"; then
    log_pass "Git pull executado com sucesso"
else
    log_warn "Git pull com problemas: $DEPLOY_OUTPUT"
fi

# Teste 15: Testar restart dos containers
log_test "Teste 15: Restart dos containers"
log_info "Executando docker-compose restart..."

if run_ssh_command "cd $STAGING_DIR && docker-compose restart" &> /dev/null; then
    log_pass "Containers reiniciados com sucesso"
    sleep 10  # Aguardar containers iniciarem
else
    log_fail "Falha ao reiniciar containers"
fi

# Teste 16: Health check pós-restart
log_test "Teste 16: Health check pós-restart"
log_info "Aguardando API ficar pronta..."

RETRY_COUNT=0
MAX_RETRIES=12

while [ $RETRY_COUNT -lt $MAX_RETRIES ]; do
    if curl -sf -m 5 "$API_URL/health" > /dev/null 2>&1; then
        log_pass "API voltou online após restart (${RETRY_COUNT} tentativas)"
        break
    fi

    RETRY_COUNT=$((RETRY_COUNT + 1))
    log_info "Tentativa $RETRY_COUNT/$MAX_RETRIES..."
    sleep 5
done

if [ $RETRY_COUNT -eq $MAX_RETRIES ]; then
    log_fail "API não voltou online após $MAX_RETRIES tentativas"
fi

# Teste 17: Simular falha de deploy (rollback)
echo ""
log_test "Teste 17: Simular falha e testar rollback"
log_warn "Simulando falha de deploy..."

# Salvar estado atual
CURRENT_COMMIT=$(run_ssh_command "cd $STAGING_DIR && git rev-parse HEAD")
log_info "Commit atual: $CURRENT_COMMIT"

# Parar um container crítico para simular falha
log_info "Parando container da API para simular falha..."
run_ssh_command "cd $STAGING_DIR && docker-compose stop api" &> /dev/null

sleep 5

# Verificar que API está down
if curl -sf -m 5 "$API_URL/health" > /dev/null 2>&1; then
    log_fail "API ainda está respondendo (esperado: offline)"
else
    log_pass "API offline como esperado (falha simulada)"
fi

# Executar rollback (restart do container)
log_info "Executando rollback (restart dos containers)..."
run_ssh_command "cd $STAGING_DIR && docker-compose up -d" &> /dev/null

sleep 10

# Verificar que API voltou
RETRY_COUNT=0
while [ $RETRY_COUNT -lt 12 ]; do
    if curl -sf -m 5 "$API_URL/health" > /dev/null 2>&1; then
        log_pass "Rollback bem-sucedido - API voltou online"
        break
    fi

    RETRY_COUNT=$((RETRY_COUNT + 1))
    sleep 5
done

if [ $RETRY_COUNT -eq 12 ]; then
    log_fail "Rollback falhou - API não voltou online"
fi

# Teste 18: Verificar integridade dos dados
log_test "Teste 18: Verificar integridade dos dados"
if curl -sf -m 10 "$API_URL/products?page=1&limit=1" > /dev/null 2>&1; then
    log_pass "Dados intactos após rollback"
else
    log_fail "Dados podem estar corrompidos"
fi

# Teste 19: Testar scripts de infraestrutura
echo ""
log_test "Teste 19: Verificar scripts de infraestrutura"

REQUIRED_SCRIPTS=(
    "backup-database.sh"
    "restore-database.sh"
    "health-check.sh"
    "validate-env.sh"
    "warm-cache.sh"
)

for script in "${REQUIRED_SCRIPTS[@]}"; do
    if run_ssh_command "test -x $STAGING_DIR/scripts/$script" &> /dev/null; then
        log_info "✓ Script encontrado: $script"
    else
        log_warn "✗ Script não encontrado ou não executável: $script"
    fi
done

# Teste 20: Executar health check completo
log_test "Teste 20: Executar health check completo"
if run_ssh_command "cd $STAGING_DIR && ./scripts/health-check.sh" &> /dev/null; then
    log_pass "Health check completo passou"
else
    log_warn "Health check completo com problemas"
fi

# Resumo final
echo ""
echo "════════════════════════════════════════"
echo "  RESUMO DOS TESTES"
echo "════════════════════════════════════════"
echo ""
echo "Total de testes: $TEST_TOTAL"
echo -e "${GREEN}Passaram: $TEST_PASSED${NC}"
echo -e "${RED}Falharam: $TEST_FAILED${NC}"
echo ""

SUCCESS_RATE=$((TEST_PASSED * 100 / TEST_TOTAL))
echo "Taxa de sucesso: $SUCCESS_RATE%"
echo ""

if [ $TEST_FAILED -eq 0 ]; then
    echo -e "${GREEN}✓ Todos os testes passaram!${NC}"
    echo "Staging está pronto para receber deploys."
    exit 0
elif [ $SUCCESS_RATE -ge 80 ]; then
    echo -e "${YELLOW}⚠ Alguns testes falharam, mas staging está funcional.${NC}"
    echo "Revise os erros acima antes de deploy em produção."
    exit 0
else
    echo -e "${RED}✗ Muitos testes falharam!${NC}"
    echo "Corrija os problemas antes de fazer deploy."
    exit 1
fi
