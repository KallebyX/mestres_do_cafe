#!/bin/bash

# Script para executar testes da API
# Mestres do Café Enterprise

echo "🚀 Iniciando testes da API Mestres do Café Enterprise"
echo "======================================================"

# Verificar se o Python está instalado
if ! command -v python3 &> /dev/null; then
    echo "❌ Python3 não encontrado. Por favor, instale o Python3."
    exit 1
fi

# Verificar se o requests está instalado
if ! python3 -c "import requests" &> /dev/null; then
    echo "📦 Instalando dependências..."
    pip3 install requests
fi

# Verificar se a API está rodando
echo "🔍 Verificando se a API está rodando..."
if curl -s http://localhost:5001/api/health > /dev/null; then
    echo "✅ API está rodando em http://localhost:5001"
else
    echo "❌ API não está rodando. Por favor, inicie a API primeiro."
    echo "   Execute: python apps/api/src/app.py"
    exit 1
fi

# Executar testes
echo "🧪 Executando testes..."
python3 test_all_api_endpoints.py

echo "✅ Testes concluídos!"
echo "📊 Verifique o relatório gerado para mais detalhes."