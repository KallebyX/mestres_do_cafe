#!/bin/bash

# Mestres do Café - Script de Deploy para Render
# Este script prepara o projeto para deploy no Render

set -e

echo "🚀 Iniciando deploy para Render..."

# Verifica se estamos no diretório correto
if [ ! -f "render.yaml" ]; then
    echo "❌ Erro: render.yaml não encontrado. Execute este script na raiz do projeto."
    exit 1
fi

echo "📦 Preparando Backend (API Flask)..."
cd apps/api

# Verifica se requirements.txt existe
if [ ! -f "requirements.txt" ]; then
    echo "❌ Erro: requirements.txt não encontrado em apps/api/"
    exit 1
fi

# Instala dependências Python (opcional para teste local)
if command -v python3 &> /dev/null; then
    echo "🐍 Verificando dependências Python..."
    python3 -m pip install --quiet -r requirements.txt
    echo "✅ Dependências Python verificadas"
fi

cd ../..

echo "⚛️ Preparando Frontend (React Vite)..."
cd apps/web

# Verifica se package.json existe
if [ ! -f "package.json" ]; then
    echo "❌ Erro: package.json não encontrado em apps/web/"
    exit 1
fi

# Instala dependências Node.js
if command -v npm &> /dev/null; then
    echo "📦 Instalando dependências Node.js..."
    npm ci --silent
    echo "✅ Dependências Node.js instaladas"

    echo "🏗️ Testando build do frontend..."
    npm run build
    echo "✅ Build do frontend concluído"
fi

cd ../..

echo "🔧 Verificando configurações..."

# Verifica se o arquivo de configuração do Render existe
if [ -f "render.yaml" ]; then
    echo "✅ render.yaml encontrado"
else
    echo "❌ render.yaml não encontrado"
    exit 1
fi

# Verifica se o arquivo de exemplo de env existe
if [ -f "render.env.example" ]; then
    echo "✅ render.env.example encontrado"
else
    echo "⚠️ render.env.example não encontrado (opcional)"
fi

echo ""
echo "🎉 Preparação para deploy concluída!"
echo ""
echo "📋 Próximos passos para deploy no Render:"
echo "1. Faça commit e push das alterações para o GitHub"
echo "2. Acesse https://render.com e crie uma nova conta ou faça login"
echo "3. Conecte seu repositório GitHub: https://github.com/KallebyX/mestres_do_cafe"
echo "4. O Render detectará automaticamente o render.yaml"
echo "5. Configure as variáveis de ambiente necessárias"
echo ""
echo "🌐 URLs após deploy:"
echo "   • API: https://mestres-cafe-api.onrender.com"
echo "   • Frontend: https://mestres-cafe-web.onrender.com"
echo ""
echo "⚠️ Nota: O plano gratuito do Render pode ter algumas limitações:"
echo "   • Apps dormem após 15 minutos de inatividade"
echo "   • Primeiro acesso pode ser lento (cold start)"
echo "   • 750 horas de uso por mês"
echo ""
