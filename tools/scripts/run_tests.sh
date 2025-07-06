#!/bin/bash

# Mestres do Café - Script de Execução de Testes
# Executa todos os tipos de testes com relatórios detalhados

set -e  # Para execução em caso de erro

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configurações
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
REPORTS_DIR="$PROJECT_ROOT/reports/tests/$TIMESTAMP"
COVERAGE_DIR="$PROJECT_ROOT/reports/coverage/$TIMESTAMP"

# Função para logging
log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Função para verificar dependências
check_dependencies() {
    log "Verificando dependências..."
    
    # Verifica Python
    if ! command -v python3 &> /dev/null; then
        log_error "Python3 não encontrado"
        exit 1
    fi
    
    # Verifica pip
    if ! command -v pip3 &> /dev/null; then
        log_error "pip3 não encontrado"
        exit 1
    fi
    
    # Verifica pytest
    if ! python3 -c "import pytest" &> /dev/null; then
        log_error "pytest não encontrado. Instalando..."
        pip3 install pytest pytest-cov pytest-html pytest-xdist
    fi
    
    # Verifica selenium para testes E2E
    if ! python3 -c "import selenium" &> /dev/null; then
        log_warning "Selenium não encontrado. Testes E2E serão pulados."
        SKIP_E2E=true
    fi
    
    log_success "Dependências verificadas"
}

# Função para setup do ambiente
setup_environment() {
    log "Configurando ambiente de testes..."
    
    # Cria diretórios necessários
    mkdir -p "$REPORTS_DIR"
    mkdir -p "$COVERAGE_DIR"
    mkdir -p "$PROJECT_ROOT/logs"
    mkdir -p "$PROJECT_ROOT/tests/screenshots"
    
    # Define variáveis de ambiente
    export PYTHONPATH="$PROJECT_ROOT:$PYTHONPATH"
    export FLASK_ENV=testing
    export DATABASE_URL="sqlite:///:memory:"
    
    # Limpa cache do Python
    find "$PROJECT_ROOT" -type d -name "__pycache__" -exec rm -rf {} + 2>/dev/null || true
    find "$PROJECT_ROOT" -name "*.pyc" -delete 2>/dev/null || true
    
    log_success "Ambiente configurado"
}

# Função para executar testes unitários
run_unit_tests() {
    log "Executando testes unitários..."
    
    cd "$PROJECT_ROOT"
    
    pytest tests/unit/ \
        --verbose \
        --tb=short \
        --cov=apps/api/src \
        --cov-report=html:"$COVERAGE_DIR/unit" \
        --cov-report=xml:"$COVERAGE_DIR/unit/coverage.xml" \
        --cov-report=term-missing \
        --html="$REPORTS_DIR/unit_tests.html" \
        --self-contained-html \
        --junitxml="$REPORTS_DIR/unit_tests.xml" \
        --maxfail=5 \
        -x
    
    local exit_code=$?
    
    if [ $exit_code -eq 0 ]; then
        log_success "Testes unitários concluídos com sucesso"
    else
        log_error "Testes unitários falharam (código: $exit_code)"
        return $exit_code
    fi
}

# Função para executar testes de integração
run_integration_tests() {
    log "Executando testes de integração..."
    
    cd "$PROJECT_ROOT"
    
    # Inicia banco de dados de teste
    export DATABASE_URL="sqlite:///test_integration.db"
    
    pytest tests/integration/ \
        --verbose \
        --tb=short \
        --cov=apps/api/src \
        --cov-report=html:"$COVERAGE_DIR/integration" \
        --cov-report=xml:"$COVERAGE_DIR/integration/coverage.xml" \
        --html="$REPORTS_DIR/integration_tests.html" \
        --self-contained-html \
        --junitxml="$REPORTS_DIR/integration_tests.xml" \
        --maxfail=3 \
        -x
    
    local exit_code=$?
    
    # Limpa banco de teste
    rm -f test_integration.db
    
    if [ $exit_code -eq 0 ]; then
        log_success "Testes de integração concluídos com sucesso"
    else
        log_error "Testes de integração falharam (código: $exit_code)"
        return $exit_code
    fi
}

# Função para executar testes E2E
run_e2e_tests() {
    if [ "$SKIP_E2E" = true ]; then
        log_warning "Pulando testes E2E (Selenium não disponível)"
        return 0
    fi
    
    log "Executando testes End-to-End..."
    
    cd "$PROJECT_ROOT"
    
    # Verifica se ChromeDriver está disponível
    if ! command -v chromedriver &> /dev/null; then
        log_warning "ChromeDriver não encontrado. Tentando instalar..."
        
        # Tenta instalar ChromeDriver automaticamente
        if command -v apt-get &> /dev/null; then
            sudo apt-get update
            sudo apt-get install -y chromium-chromedriver
        else
            log_error "Não foi possível instalar ChromeDriver automaticamente"
            return 1
        fi
    fi
    
    # Inicia aplicação em background para testes E2E
    log "Iniciando aplicação para testes E2E..."
    cd apps/api
    python3 src/app.py &
    APP_PID=$!
    
    # Aguarda aplicação inicializar
    sleep 5
    
    # Verifica se aplicação está rodando
    if ! curl -s http://localhost:5005/api/health > /dev/null; then
        log_error "Aplicação não iniciou corretamente"
        kill $APP_PID 2>/dev/null || true
        return 1
    fi
    
    cd "$PROJECT_ROOT"
    
    # Executa testes E2E
    pytest tests/e2e/ \
        --verbose \
        --tb=short \
        --html="$REPORTS_DIR/e2e_tests.html" \
        --self-contained-html \
        --junitxml="$REPORTS_DIR/e2e_tests.xml" \
        --maxfail=2 \
        -s  # Não captura output para ver logs do Selenium
    
    local exit_code=$?
    
    # Para aplicação
    kill $APP_PID 2>/dev/null || true
    
    if [ $exit_code -eq 0 ]; then
        log_success "Testes E2E concluídos com sucesso"
    else
        log_error "Testes E2E falharam (código: $exit_code)"
        return $exit_code
    fi
}

# Função para executar testes de performance
run_performance_tests() {
    log "Executando testes de performance..."
    
    cd "$PROJECT_ROOT"
    
    # Verifica se locust está disponível
    if ! python3 -c "import locust" &> /dev/null; then
        log_warning "Locust não encontrado. Instalando..."
        pip3 install locust
    fi
    
    # Executa testes de carga básicos
    python3 tools/scripts/performance_test.py > "$REPORTS_DIR/performance_report.txt"
    
    local exit_code=$?
    
    if [ $exit_code -eq 0 ]; then
        log_success "Testes de performance concluídos"
    else
        log_warning "Testes de performance falharam ou não puderam ser executados"
    fi
}

# Função para executar análise de código
run_code_analysis() {
    log "Executando análise de código..."
    
    cd "$PROJECT_ROOT"
    
    # Verifica se flake8 está disponível
    if ! command -v flake8 &> /dev/null; then
        log_warning "flake8 não encontrado. Instalando..."
        pip3 install flake8 pylint bandit safety
    fi
    
    # Análise de estilo (flake8)
    log "Executando análise de estilo..."
    flake8 apps/ --max-line-length=100 --exclude=migrations,venv \
        --format=html --htmldir="$REPORTS_DIR/flake8" || true
    
    # Análise de qualidade (pylint)
    log "Executando análise de qualidade..."
    pylint apps/api/src/ --output-format=html > "$REPORTS_DIR/pylint_report.html" || true
    
    # Análise de segurança (bandit)
    log "Executando análise de segurança..."
    bandit -r apps/api/src/ -f html -o "$REPORTS_DIR/security_report.html" || true
    
    # Verificação de dependências (safety)
    log "Verificando vulnerabilidades em dependências..."
    safety check --json > "$REPORTS_DIR/safety_report.json" || true
    
    log_success "Análise de código concluída"
}

# Função para gerar relatório consolidado
generate_consolidated_report() {
    log "Gerando relatório consolidado..."
    
    local report_file="$REPORTS_DIR/consolidated_report.html"
    
    cat > "$report_file" << EOF
<!DOCTYPE html>
<html>
<head>
    <title>Relatório de Testes - Mestres do Café</title>
    <meta charset="UTF-8">
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .header { background: #2c3e50; color: white; padding: 20px; border-radius: 5px; }
        .section { margin: 20px 0; padding: 15px; border: 1px solid #ddd; border-radius: 5px; }
        .success { background: #d4edda; border-color: #c3e6cb; }
        .warning { background: #fff3cd; border-color: #ffeaa7; }
        .error { background: #f8d7da; border-color: #f5c6cb; }
        .metrics { display: flex; justify-content: space-around; margin: 20px 0; }
        .metric { text-align: center; padding: 10px; background: #f8f9fa; border-radius: 5px; }
        .links { margin: 10px 0; }
        .links a { margin-right: 15px; color: #007bff; text-decoration: none; }
        .links a:hover { text-decoration: underline; }
    </style>
</head>
<body>
    <div class="header">
        <h1>🏢 Mestres do Café - Relatório de Testes</h1>
        <p>Gerado em: $(date)</p>
        <p>Timestamp: $TIMESTAMP</p>
    </div>
    
    <div class="metrics">
        <div class="metric">
            <h3>Testes Unitários</h3>
            <p id="unit-status">✅ Executados</p>
        </div>
        <div class="metric">
            <h3>Testes Integração</h3>
            <p id="integration-status">✅ Executados</p>
        </div>
        <div class="metric">
            <h3>Testes E2E</h3>
            <p id="e2e-status">✅ Executados</p>
        </div>
        <div class="metric">
            <h3>Análise Código</h3>
            <p id="analysis-status">✅ Executada</p>
        </div>
    </div>
    
    <div class="section">
        <h2>📊 Relatórios Detalhados</h2>
        <div class="links">
            <a href="unit_tests.html">Testes Unitários</a>
            <a href="integration_tests.html">Testes Integração</a>
            <a href="e2e_tests.html">Testes E2E</a>
            <a href="../coverage/$TIMESTAMP/unit/index.html">Cobertura Unitários</a>
            <a href="../coverage/$TIMESTAMP/integration/index.html">Cobertura Integração</a>
            <a href="flake8/index.html">Análise Estilo</a>
            <a href="pylint_report.html">Análise Qualidade</a>
            <a href="security_report.html">Análise Segurança</a>
        </div>
    </div>
    
    <div class="section">
        <h2>📈 Métricas de Qualidade</h2>
        <ul>
            <li><strong>Cobertura de Código:</strong> Verificar relatórios específicos</li>
            <li><strong>Complexidade:</strong> Analisada via pylint</li>
            <li><strong>Segurança:</strong> Verificada via bandit</li>
            <li><strong>Dependências:</strong> Verificadas via safety</li>
        </ul>
    </div>
    
    <div class="section">
        <h2>🔧 Comandos para Reproduzir</h2>
        <pre>
# Testes unitários
pytest tests/unit/ --cov=apps/api/src

# Testes integração  
pytest tests/integration/

# Testes E2E
pytest tests/e2e/

# Análise completa
./tools/scripts/run_tests.sh
        </pre>
    </div>
    
    <div class="section">
        <h2>📝 Próximos Passos</h2>
        <ul>
            <li>Revisar falhas nos testes</li>
            <li>Melhorar cobertura de código</li>
            <li>Corrigir issues de qualidade</li>
            <li>Resolver vulnerabilidades de segurança</li>
        </ul>
    </div>
</body>
</html>
EOF
    
    log_success "Relatório consolidado gerado: $report_file"
}

# Função para limpeza
cleanup() {
    log "Executando limpeza..."
    
    # Para processos em background
    pkill -f "python.*app.py" 2>/dev/null || true
    
    # Remove arquivos temporários
    rm -f test_*.db
    
    log_success "Limpeza concluída"
}

# Função principal
main() {
    local start_time=$(date +%s)
    
    echo "🧪 MESTRES DO CAFÉ - EXECUÇÃO COMPLETA DE TESTES"
    echo "=================================================="
    
    # Trap para limpeza em caso de interrupção
    trap cleanup EXIT
    
    # Verifica argumentos
    local run_unit=true
    local run_integration=true
    local run_e2e=true
    local run_performance=false
    local run_analysis=true
    
    while [[ $# -gt 0 ]]; do
        case $1 in
            --unit-only)
                run_integration=false
                run_e2e=false
                run_analysis=false
                shift
                ;;
            --integration-only)
                run_unit=false
                run_e2e=false
                run_analysis=false
                shift
                ;;
            --e2e-only)
                run_unit=false
                run_integration=false
                run_analysis=false
                shift
                ;;
            --with-performance)
                run_performance=true
                shift
                ;;
            --no-analysis)
                run_analysis=false
                shift
                ;;
            --help)
                echo "Uso: $0 [opções]"
                echo "Opções:"
                echo "  --unit-only         Executa apenas testes unitários"
                echo "  --integration-only  Executa apenas testes de integração"
                echo "  --e2e-only         Executa apenas testes E2E"
                echo "  --with-performance Inclui testes de performance"
                echo "  --no-analysis      Pula análise de código"
                echo "  --help             Mostra esta ajuda"
                exit 0
                ;;
            *)
                log_error "Opção desconhecida: $1"
                exit 1
                ;;
        esac
    done
    
    # Execução dos testes
    check_dependencies
    setup_environment
    
    local overall_success=true
    
    if [ "$run_unit" = true ]; then
        if ! run_unit_tests; then
            overall_success=false
        fi
    fi
    
    if [ "$run_integration" = true ]; then
        if ! run_integration_tests; then
            overall_success=false
        fi
    fi
    
    if [ "$run_e2e" = true ]; then
        if ! run_e2e_tests; then
            overall_success=false
        fi
    fi
    
    if [ "$run_performance" = true ]; then
        run_performance_tests
    fi
    
    if [ "$run_analysis" = true ]; then
        run_code_analysis
    fi
    
    generate_consolidated_report
    
    local end_time=$(date +%s)
    local duration=$((end_time - start_time))
    
    echo "=================================================="
    echo "🏁 EXECUÇÃO CONCLUÍDA"
    echo "Duração: ${duration}s"
    echo "Relatórios: $REPORTS_DIR"
    
    if [ "$overall_success" = true ]; then
        log_success "Todos os testes passaram! ✅"
        exit 0
    else
        log_error "Alguns testes falharam! ❌"
        exit 1
    fi
}

# Executa função principal
main "$@"

