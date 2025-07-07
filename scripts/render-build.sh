#!/bin/bash
set -e

echo "🏗️ Iniciando build do Mestres do Café..."

# Verificar Node.js
echo "📦 Node.js: $(node --version)"
echo "📦 NPM: $(npm --version)"

# Instalar dependências da raiz
echo "🔧 Instalando dependências da raiz..."
npm install

# Build do frontend
echo "🚀 Building frontend..."
cd apps/web

if [ ! -f "package.json" ]; then
    echo "❌ package.json não encontrado em apps/web/"
    exit 1
fi

npm install
npm run build

if [ ! -d "dist" ]; then
    echo "❌ Build falhou - diretório dist não criado"
    exit 1
fi

echo "✅ Build concluído com sucesso!"
echo "📊 Tamanho do build: $(du -sh dist/)"
