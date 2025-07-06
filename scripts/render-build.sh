#!/bin/bash

# Mestres do Café - Script de Build para Render
# Este script garante que o build seja executado corretamente no Render

set -e

echo "🏗️ Iniciando build do Mestres do Café no Render..."

# Verificar versão do Node.js
echo "📦 Versão do Node.js: $(node --version)"
echo "📦 Versão do NPM: $(npm --version)"

# Instalar dependências na raiz do projeto
echo "🔧 Instalando dependências da raiz do projeto..."
npm install --include=dev

# Navegar para o diretório do frontend
echo "🚀 Navegando para apps/web..."
cd apps/web

# Verificar se o package.json existe
if [ ! -f "package.json" ]; then
    echo "❌ Erro: package.json não encontrado em apps/web/"
    exit 1
fi

# Instalar dependências do frontend
echo "📦 Instalando dependências do frontend..."
npm ci

# Verificar se o vite está disponível
if ! command -v vite &> /dev/null && ! npx vite --version &> /dev/null; then
    echo "❌ Erro: vite não encontrado. Instalando vite globalmente..."
    npm install -g vite
fi

# Executar o build
echo "🏗️ Executando build do frontend..."
npm run build

echo "✅ Build concluído com sucesso!"
echo "📁 Arquivos de build estão em apps/web/dist/"

# Verificar se o build foi criado
if [ -d "dist" ]; then
    echo "✅ Diretório dist criado com sucesso"
    echo "📊 Tamanho dos arquivos:"
    du -sh dist/
else
    echo "❌ Erro: Diretório dist não foi criado"
    exit 1
fi

echo "🎉 Build do Mestres do Café concluído com sucesso!"
