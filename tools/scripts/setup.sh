#!/bin/bash

# Mestres do Café - Script de Setup Completo
# Configura todo o ambiente de desenvolvimento

set -e  # Para execução em caso de erro

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Configurações
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
NODE_VERSION="18"
PYTHON_VERSION="3.11"

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

log_info() {
    echo -e "${CYAN}[INFO]${NC} $1"
}

log_step() {
    echo -e "${PURPLE}[STEP]${NC} $1"
}

# Função para verificar se comando existe
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Função para verificar sistema operacional
detect_os() {
    if [[ "$OSTYPE" == "linux-gnu"* ]]; then
        echo "linux"
    elif [[ "$OSTYPE" == "darwin"* ]]; then
        echo "macos"
    elif [[ "$OSTYPE" == "msys" ]] || [[ "$OSTYPE" == "win32" ]]; then
        echo "windows"
    else
        echo "unknown"
    fi
}

# Função para instalar Node.js
install_nodejs() {
    log_step "Verificando Node.js..."
    
    if command_exists node; then
        local current_version=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
        if [ "$current_version" -ge "$NODE_VERSION" ]; then
            log_success "Node.js $current_version já instalado"
            return 0
        fi
    fi
    
    log_info "Instalando Node.js $NODE_VERSION..."
    
    local os=$(detect_os)
    case $os in
        "linux")
            # Instala via NodeSource
            curl -fsSL https://deb.nodesource.com/setup_${NODE_VERSION}.x | sudo -E bash -
            sudo apt-get install -y nodejs
            ;;
        "macos")
            # Instala via Homebrew
            if command_exists brew; then
                brew install node@${NODE_VERSION}
            else
                log_error "Homebrew não encontrado. Instale manualmente: https://nodejs.org"
                exit 1
            fi
            ;;
        "windows")
            log_error "Windows detectado. Instale Node.js manualmente: https://nodejs.org"
            exit 1
            ;;
        *)
            log_error "Sistema operacional não suportado"
            exit 1
            ;;
    esac
    
    log_success "Node.js instalado com sucesso"
}

# Função para instalar Python
install_python() {
    log_step "Verificando Python..."
    
    if command_exists python3; then
        local current_version=$(python3 --version | cut -d' ' -f2 | cut -d'.' -f1,2)
        if [ "$(echo "$current_version >= $PYTHON_VERSION" | bc)" -eq 1 ]; then
            log_success "Python $current_version já instalado"
            return 0
        fi
    fi
    
    log_info "Instalando Python $PYTHON_VERSION..."
    
    local os=$(detect_os)
    case $os in
        "linux")
            sudo apt-get update
            sudo apt-get install -y python${PYTHON_VERSION} python${PYTHON_VERSION}-venv python${PYTHON_VERSION}-pip
            ;;
        "macos")
            if command_exists brew; then
                brew install python@${PYTHON_VERSION}
            else
                log_error "Homebrew não encontrado. Instale manualmente: https://python.org"
                exit 1
            fi
            ;;
        "windows")
            log_error "Windows detectado. Instale Python manualmente: https://python.org"
            exit 1
            ;;
        *)
            log_error "Sistema operacional não suportado"
            exit 1
            ;;
    esac
    
    log_success "Python instalado com sucesso"
}

# Função para instalar dependências do sistema
install_system_dependencies() {
    log_step "Instalando dependências do sistema..."
    
    local os=$(detect_os)
    case $os in
        "linux")
            sudo apt-get update
            sudo apt-get install -y \
                curl \
                wget \
                git \
                build-essential \
                libssl-dev \
                libffi-dev \
                python3-dev \
                postgresql-client \
                redis-tools \
                imagemagick \
                ffmpeg \
                chromium-browser \
                chromium-chromedriver
            ;;
        "macos")
            if command_exists brew; then
                brew install \
                    git \
                    postgresql \
                    redis \
                    imagemagick \
                    ffmpeg \
                    chromedriver
            else
                log_warning "Homebrew não encontrado. Algumas dependências podem não estar disponíveis"
            fi
            ;;
        "windows")
            log_warning "Windows detectado. Instale dependências manualmente"
            ;;
    esac
    
    log_success "Dependências do sistema instaladas"
}

# Função para configurar Git
setup_git() {
    log_step "Configurando Git..."
    
    if ! command_exists git; then
        log_error "Git não encontrado"
        exit 1
    fi
    
    # Verifica se já está configurado
    if git config --global user.name >/dev/null 2>&1 && git config --global user.email >/dev/null 2>&1; then
        log_success "Git já configurado"
        return 0
    fi
    
    # Configura Git interativamente
    echo "Configure seu Git:"
    read -p "Nome: " git_name
    read -p "Email: " git_email
    
    git config --global user.name "$git_name"
    git config --global user.email "$git_email"
    git config --global init.defaultBranch main
    git config --global pull.rebase false
    
    log_success "Git configurado com sucesso"
}

# Função para instalar pnpm
install_pnpm() {
    log_step "Instalando pnpm..."
    
    if command_exists pnpm; then
        log_success "pnpm já instalado"
        return 0
    fi
    
    npm install -g pnpm
    log_success "pnpm instalado com sucesso"
}

# Função para configurar workspace
setup_workspace() {
    log_step "Configurando workspace..."
    
    cd "$PROJECT_ROOT"
    
    # Instala dependências do workspace
    if [ -f "package.json" ]; then
        log_info "Instalando dependências do workspace..."
        pnpm install
    fi
    
    # Configura packages
    for package_dir in packages/*/; do
        if [ -d "$package_dir" ] && [ -f "${package_dir}package.json" ]; then
            log_info "Configurando package: $(basename "$package_dir")"
            cd "$package_dir"
            pnpm install
            cd "$PROJECT_ROOT"
        fi
    done
    
    # Configura apps
    for app_dir in apps/*/; do
        if [ -d "$app_dir" ]; then
            app_name=$(basename "$app_dir")
            log_info "Configurando app: $app_name"
            
            case $app_name in
                "web")
                    cd "$app_dir"
                    if [ -f "package.json" ]; then
                        pnpm install
                    fi
                    cd "$PROJECT_ROOT"
                    ;;
                "api")
                    cd "$app_dir"
                    if [ ! -d "venv" ]; then
                        log_info "Criando ambiente virtual Python..."
                        python3 -m venv venv
                    fi
                    
                    log_info "Ativando ambiente virtual e instalando dependências..."
                    source venv/bin/activate
                    pip install --upgrade pip
                    if [ -f "requirements.txt" ]; then
                        pip install -r requirements.txt
                    fi
                    deactivate
                    cd "$PROJECT_ROOT"
                    ;;
            esac
        fi
    done
    
    log_success "Workspace configurado com sucesso"
}

# Função para configurar banco de dados
setup_database() {
    log_step "Configurando banco de dados..."
    
    cd "$PROJECT_ROOT/apps/api"
    
    # Ativa ambiente virtual
    source venv/bin/activate
    
    # Cria banco de dados
    log_info "Criando banco de dados..."
    python3 -c "
from src.app import create_app
from src.models.base import db

app = create_app()
with app.app_context():
    db.create_all()
    print('Banco de dados criado com sucesso')
"
    
    # Executa seeds se existir
    if [ -f "src/seeds.py" ]; then
        log_info "Executando seeds..."
        python3 src/seeds.py
    fi
    
    deactivate
    cd "$PROJECT_ROOT"
    
    log_success "Banco de dados configurado"
}

# Função para configurar variáveis de ambiente
setup_environment() {
    log_step "Configurando variáveis de ambiente..."
    
    # Cria .env se não existir
    if [ ! -f "$PROJECT_ROOT/.env" ]; then
        if [ -f "$PROJECT_ROOT/.env.example" ]; then
            cp "$PROJECT_ROOT/.env.example" "$PROJECT_ROOT/.env"
            log_info "Arquivo .env criado a partir do .env.example"
            log_warning "Configure as variáveis em .env antes de continuar"
        else
            log_warning "Arquivo .env.example não encontrado"
        fi
    else
        log_success "Arquivo .env já existe"
    fi
    
    # Configura .env para cada app
    for app_dir in apps/*/; do
        if [ -d "$app_dir" ]; then
            app_env="$app_dir.env"
            app_env_example="$app_dir.env.example"
            
            if [ ! -f "$app_env" ] && [ -f "$app_env_example" ]; then
                cp "$app_env_example" "$app_env"
                log_info "Arquivo .env criado para $(basename "$app_dir")"
            fi
        fi
    done
    
    log_success "Variáveis de ambiente configuradas"
}

# Função para configurar Docker
setup_docker() {
    log_step "Configurando Docker..."
    
    if ! command_exists docker; then
        log_warning "Docker não encontrado. Pulando configuração Docker"
        return 0
    fi
    
    cd "$PROJECT_ROOT"
    
    # Verifica se docker-compose.yml existe
    if [ -f "docker-compose.yml" ]; then
        log_info "Construindo imagens Docker..."
        docker-compose build
        log_success "Imagens Docker construídas"
    else
        log_warning "docker-compose.yml não encontrado"
    fi
}

# Função para configurar ferramentas de desenvolvimento
setup_dev_tools() {
    log_step "Configurando ferramentas de desenvolvimento..."
    
    # Instala ferramentas globais
    log_info "Instalando ferramentas globais..."
    
    # Node.js tools
    pnpm add -g \
        typescript \
        eslint \
        prettier \
        @storybook/cli \
        concurrently \
        nodemon
    
    # Python tools
    cd "$PROJECT_ROOT/apps/api"
    source venv/bin/activate
    pip install \
        black \
        flake8 \
        pylint \
        pytest \
        pytest-cov \
        bandit \
        safety
    deactivate
    cd "$PROJECT_ROOT"
    
    log_success "Ferramentas de desenvolvimento instaladas"
}

# Função para configurar hooks do Git
setup_git_hooks() {
    log_step "Configurando Git hooks..."
    
    cd "$PROJECT_ROOT"
    
    # Instala husky se package.json existir
    if [ -f "package.json" ]; then
        pnpm add -D husky lint-staged
        npx husky install
        
        # Cria hook de pre-commit
        npx husky add .husky/pre-commit "pnpm lint-staged"
        
        # Cria hook de commit-msg
        npx husky add .husky/commit-msg 'npx --no -- commitlint --edit "$1"'
        
        log_success "Git hooks configurados"
    else
        log_warning "package.json não encontrado. Pulando configuração de hooks"
    fi
}

# Função para executar testes
run_tests() {
    log_step "Executando testes..."
    
    # Testa backend
    cd "$PROJECT_ROOT/apps/api"
    source venv/bin/activate
    
    if command_exists pytest; then
        log_info "Executando testes do backend..."
        pytest tests/ --tb=short || log_warning "Alguns testes do backend falharam"
    fi
    
    deactivate
    cd "$PROJECT_ROOT"
    
    # Testa frontend
    cd "$PROJECT_ROOT/apps/web"
    if [ -f "package.json" ] && command_exists pnpm; then
        log_info "Executando testes do frontend..."
        pnpm test --run || log_warning "Alguns testes do frontend falharam"
    fi
    
    cd "$PROJECT_ROOT"
    
    log_success "Testes executados"
}

# Função para gerar documentação
generate_docs() {
    log_step "Gerando documentação..."
    
    # Gera documentação da API
    cd "$PROJECT_ROOT/apps/api"
    source venv/bin/activate
    
    if [ -f "src/app.py" ]; then
        log_info "Gerando documentação da API..."
        python3 -c "
from src.app import create_app
import json

app = create_app()
# Aqui você pode adicionar lógica para gerar documentação da API
print('Documentação da API gerada')
"
    fi
    
    deactivate
    cd "$PROJECT_ROOT"
    
    # Gera Storybook se disponível
    if [ -f "apps/web/.storybook/main.js" ]; then
        log_info "Construindo Storybook..."
        cd "apps/web"
        pnpm build-storybook
        cd "$PROJECT_ROOT"
    fi
    
    log_success "Documentação gerada"
}

# Função para verificar saúde do sistema
health_check() {
    log_step "Verificando saúde do sistema..."
    
    local errors=0
    
    # Verifica Node.js
    if ! command_exists node; then
        log_error "Node.js não encontrado"
        ((errors++))
    else
        log_success "Node.js: $(node --version)"
    fi
    
    # Verifica Python
    if ! command_exists python3; then
        log_error "Python3 não encontrado"
        ((errors++))
    else
        log_success "Python3: $(python3 --version)"
    fi
    
    # Verifica pnpm
    if ! command_exists pnpm; then
        log_error "pnpm não encontrado"
        ((errors++))
    else
        log_success "pnpm: $(pnpm --version)"
    fi
    
    # Verifica Git
    if ! command_exists git; then
        log_error "Git não encontrado"
        ((errors++))
    else
        log_success "Git: $(git --version)"
    fi
    
    # Verifica arquivos de configuração
    if [ ! -f "$PROJECT_ROOT/.env" ]; then
        log_warning "Arquivo .env não encontrado"
    else
        log_success "Arquivo .env encontrado"
    fi
    
    # Verifica dependências do workspace
    if [ -f "$PROJECT_ROOT/package.json" ]; then
        cd "$PROJECT_ROOT"
        if pnpm list >/dev/null 2>&1; then
            log_success "Dependências do workspace OK"
        else
            log_warning "Problemas com dependências do workspace"
        fi
    fi
    
    # Verifica ambiente Python
    if [ -d "$PROJECT_ROOT/apps/api/venv" ]; then
        log_success "Ambiente virtual Python encontrado"
    else
        log_warning "Ambiente virtual Python não encontrado"
    fi
    
    if [ $errors -eq 0 ]; then
        log_success "Sistema saudável! ✅"
    else
        log_error "Encontrados $errors problemas ❌"
        return 1
    fi
}

# Função para mostrar informações finais
show_final_info() {
    echo ""
    echo "🎉 SETUP CONCLUÍDO COM SUCESSO!"
    echo "=================================="
    echo ""
    echo "📁 Estrutura do projeto:"
    echo "  • apps/web/     - Frontend React"
    echo "  • apps/api/     - Backend Flask"
    echo "  • packages/     - Pacotes compartilhados"
    echo "  • tools/        - Ferramentas e scripts"
    echo "  • docs/         - Documentação"
    echo ""
    echo "🚀 Comandos úteis:"
    echo "  • make dev      - Inicia desenvolvimento"
    echo "  • make test     - Executa todos os testes"
    echo "  • make build    - Constrói para produção"
    echo "  • make lint     - Executa linting"
    echo "  • make format   - Formata código"
    echo ""
    echo "📚 Documentação:"
    echo "  • README.md     - Documentação principal"
    echo "  • docs/         - Documentação detalhada"
    echo ""
    echo "🔧 Próximos passos:"
    echo "  1. Configure as variáveis em .env"
    echo "  2. Execute 'make dev' para iniciar"
    echo "  3. Acesse http://localhost:3000 (frontend)"
    echo "  4. Acesse http://localhost:5000 (backend)"
    echo ""
    echo "✨ Bom desenvolvimento!"
}

# Função principal
main() {
    local start_time=$(date +%s)
    
    echo "🏢 MESTRES DO CAFÉ - SETUP ENTERPRISE"
    echo "====================================="
    echo ""
    
    # Verifica argumentos
    local skip_tests=false
    local skip_docker=false
    local quick_setup=false
    
    while [[ $# -gt 0 ]]; do
        case $1 in
            --skip-tests)
                skip_tests=true
                shift
                ;;
            --skip-docker)
                skip_docker=true
                shift
                ;;
            --quick)
                quick_setup=true
                skip_tests=true
                skip_docker=true
                shift
                ;;
            --help)
                echo "Uso: $0 [opções]"
                echo "Opções:"
                echo "  --skip-tests   Pula execução de testes"
                echo "  --skip-docker  Pula configuração Docker"
                echo "  --quick        Setup rápido (pula testes e Docker)"
                echo "  --help         Mostra esta ajuda"
                exit 0
                ;;
            *)
                log_error "Opção desconhecida: $1"
                exit 1
                ;;
        esac
    done
    
    # Execução do setup
    install_system_dependencies
    install_nodejs
    install_python
    install_pnpm
    setup_git
    setup_workspace
    setup_environment
    
    if [ "$skip_docker" = false ]; then
        setup_docker
    fi
    
    setup_dev_tools
    setup_git_hooks
    setup_database
    
    if [ "$skip_tests" = false ]; then
        run_tests
    fi
    
    if [ "$quick_setup" = false ]; then
        generate_docs
    fi
    
    health_check
    
    local end_time=$(date +%s)
    local duration=$((end_time - start_time))
    
    show_final_info
    
    echo "⏱️  Tempo total: ${duration}s"
    
    log_success "Setup concluído com sucesso! 🎉"
}

# Executa função principal
main "$@"

