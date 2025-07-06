#!/bin/bash

# 🚀 Setup Script para Café Enterprise
# Este script automatiza a configuração inicial do projeto

set -e

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Função para imprimir mensagens coloridas
print_message() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_header() {
    echo -e "${BLUE}================================${NC}"
    echo -e "${BLUE}  $1${NC}"
    echo -e "${BLUE}================================${NC}"
}

# Verificar se está na raiz do projeto
if [ ! -f "package.json" ]; then
    print_error "Execute este script na raiz do projeto!"
    exit 1
fi

print_header "☕ Café Enterprise - Setup Inicial"

# 1. Verificar dependências do sistema
print_message "🔍 Verificando dependências do sistema..."

# Verificar Node.js
if ! command -v node &> /dev/null; then
    print_error "Node.js não encontrado. Instale Node.js 18+ primeiro."
    exit 1
fi

# Verificar Python
if ! command -v python3 &> /dev/null; then
    print_error "Python 3 não encontrado. Instale Python 3.9+ primeiro."
    exit 1
fi

# Verificar Docker
if ! command -v docker &> /dev/null; then
    print_warning "Docker não encontrado. Algumas funcionalidades podem não funcionar."
fi

print_message "✅ Dependências básicas verificadas"

# 2. Configurar Frontend
print_header "🎨 Configurando Frontend"

cd apps/web
print_message "📦 Instalando dependências do frontend..."
npm install

print_message "🧪 Executando testes do frontend..."
npm run test -- --run

print_message "🔍 Verificando linting..."
npm run lint

print_message "✅ Frontend configurado com sucesso"
cd ../..

# 3. Configurar Backend
print_header "🔥 Configurando Backend"

cd apps/api

# Criar virtual environment
print_message "🐍 Criando ambiente virtual Python..."
python3 -m venv venv

# Ativar virtual environment
print_message "🔄 Ativando ambiente virtual..."
source venv/bin/activate

# Instalar dependências
print_message "📦 Instalando dependências do backend..."
pip install -r requirements.txt

# Configurar banco de dados
print_message "🗄️ Configurando banco de dados..."
if [ ! -f "cafe.db" ]; then
    python -c "
from src.models.database import Base, engine
Base.metadata.create_all(bind=engine)
print('✅ Banco de dados SQLite criado')
"
fi

print_message "✅ Backend configurado com sucesso"
cd ../..

# 4. Configurar variáveis de ambiente
print_header "⚙️ Configurando Variáveis de Ambiente"

if [ ! -f ".env" ]; then
    print_message "📝 Criando arquivo .env..."
    cat > .env << EOF
# Configurações de Desenvolvimento
NODE_ENV=development
FLASK_ENV=development
DEBUG=True

# Base URLs
FRONTEND_URL=http://localhost:3000
BACKEND_URL=http://localhost:5000

# Banco de Dados
DATABASE_URL=sqlite:///./cafe.db

# Autenticação
SECRET_KEY=dev-secret-key-change-in-production
JWT_SECRET_KEY=jwt-dev-secret-key

# Cache
REDIS_URL=redis://localhost:6379

# Email (opcional para desenvolvimento)
MAIL_SERVER=smtp.gmail.com
MAIL_PORT=587
MAIL_USE_TLS=True
MAIL_USERNAME=your-email@gmail.com
MAIL_PASSWORD=your-app-password

# Logs
LOG_LEVEL=INFO
EOF
    print_message "✅ Arquivo .env criado"
else
    print_message "⚠️ Arquivo .env já existe, mantendo configurações atuais"
fi

# 5. Configurar Git hooks (opcional)
print_header "🔧 Configurando Git Hooks"

if [ -d ".git" ]; then
    print_message "📎 Configurando pre-commit hooks..."

    # Criar pre-commit hook
    cat > .git/hooks/pre-commit << 'EOF'
#!/bin/bash
echo "🔍 Executando verificações antes do commit..."

# Verificar linting frontend
cd apps/web
npm run lint
if [ $? -ne 0 ]; then
    echo "❌ Linting frontend falhou"
    exit 1
fi

# Verificar linting backend
cd ../api
source venv/bin/activate
flake8 src/
if [ $? -ne 0 ]; then
    echo "❌ Linting backend falhou"
    exit 1
fi

echo "✅ Verificações passaram"
EOF

    chmod +x .git/hooks/pre-commit
    print_message "✅ Pre-commit hook configurado"
else
    print_warning "Não é um repositório Git, pulando configuração de hooks"
fi

# 6. Testar configuração
print_header "🧪 Testando Configuração"

print_message "🔍 Testando se os serviços podem iniciar..."

# Testar backend
print_message "🔥 Testando backend..."
cd apps/api
source venv/bin/activate
timeout 10s python src/app.py &
BACKEND_PID=$!
sleep 3
if kill -0 $BACKEND_PID 2>/dev/null; then
    print_message "✅ Backend iniciou com sucesso"
    kill $BACKEND_PID
else
    print_warning "⚠️ Backend pode ter problemas para iniciar"
fi
cd ../..

# 7. Resumo
print_header "📋 Resumo da Configuração"

print_message "✅ Projeto configurado com sucesso!"
echo ""
echo "🚀 Para iniciar o desenvolvimento:"
echo "   1. Terminal 1: cd apps/web && npm run dev"
echo "   2. Terminal 2: cd apps/api && source venv/bin/activate && python src/app.py"
echo ""
echo "🐳 Ou usando Docker:"
echo "   docker-compose up --build"
echo ""
echo "📚 Documentação disponível em:"
echo "   - docs/README.md (índice)"
echo "   - docs/installation.md (instalação)"
echo "   - docs/frontend.md (frontend)"
echo "   - docs/api-reference.md (API)"
echo ""
echo "🔧 Comandos úteis no VS Code:"
echo "   - Ctrl+Shift+P -> Tasks: Run Task"
echo "   - F5 para debug"
echo ""

print_message "🎉 Setup concluído! Happy coding! ☕"
