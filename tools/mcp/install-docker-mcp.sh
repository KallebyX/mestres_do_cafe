#!/bin/bash

# Instalação e Teste do MCP Docker Server - Mestres do Café Enterprise

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(cd "$SCRIPT_DIR/../.." && pwd)"

echo "🐳 Instalando MCP Docker Server - Mestres do Café Enterprise"
echo "=================================================="

# Verificar se Node.js está instalado
if ! command -v node &> /dev/null; then
    echo "❌ Node.js não encontrado. Por favor, instale Node.js 18+ primeiro."
    exit 1
fi

# Verificar versão do Node.js
NODE_VERSION=$(node --version | cut -d 'v' -f 2 | cut -d '.' -f 1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js versão 18+ é necessária. Versão atual: $(node --version)"
    exit 1
fi

echo "✅ Node.js $(node --version) encontrado"

# Verificar se Docker está instalado e rodando
if ! command -v docker &> /dev/null; then
    echo "❌ Docker não encontrado. Por favor, instale Docker primeiro."
    exit 1
fi

if ! docker info &> /dev/null; then
    echo "❌ Docker não está rodando. Por favor, inicie o Docker."
    exit 1
fi

echo "✅ Docker está rodando"

# Instalar dependências do MCP
cd "$SCRIPT_DIR"
echo "📦 Instalando dependências do MCP..."
npm install

# Testar se o servidor pode ser iniciado
echo "🧪 Testando MCP Docker Server..."
timeout 5s node docker-server.js &
SERVER_PID=$!

sleep 2

if ps -p $SERVER_PID > /dev/null; then
    echo "✅ MCP Docker Server iniciado com sucesso"
    kill $SERVER_PID 2>/dev/null || true
else
    echo "❌ Falha ao iniciar MCP Docker Server"
    exit 1
fi

# Criar link simbólico para facilitar uso
if [ ! -L "/usr/local/bin/mestres-cafe-docker" ]; then
    echo "🔗 Criando link simbólico..."
    sudo ln -sf "$SCRIPT_DIR/docker-server.js" /usr/local/bin/mestres-cafe-docker
fi

echo ""
echo "🎉 MCP Docker Server instalado com sucesso!"
echo ""
echo "📋 Como usar:"
echo "   1. Execute o servidor: node $SCRIPT_DIR/docker-server.js"
echo "   2. Ou use o comando global: mestres-cafe-docker"
echo ""
echo "🔧 Integração com Claude Code:"
echo "   Adicione a configuração do arquivo mcp-docker-config.json"
echo "   ao seu arquivo de configuração Claude Code MCP"
echo ""
echo "📊 Ferramentas disponíveis:"
echo "   - docker_ps: Listar containers"
echo "   - docker_logs: Ver logs de containers"  
echo "   - docker_inspect: Inspecionar containers"
echo "   - docker_stats: Estatísticas de recursos"
echo "   - docker_exec: Executar comandos em containers"
echo "   - docker_compose_ps: Status do docker-compose"
echo "   - docker_compose_logs: Logs do docker-compose"
echo "   - docker_health_check: Verificar saúde dos containers"
echo "   - docker_troubleshoot: Diagnóstico completo"
echo ""
echo "🐳 Testando ferramentas básicas..."

# Teste básico das ferramentas
cd "$PROJECT_DIR"

echo "📋 Containers rodando:"
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

echo ""
echo "📊 Status do docker-compose:"
docker-compose ps

echo ""
echo "✅ Instalação e testes concluídos com sucesso!"
echo "🚀 O MCP Docker Server está pronto para uso!"