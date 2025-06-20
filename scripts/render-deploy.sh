#!/bin/bash

# Script de Deploy para Render - Mestres do Café
echo "🚀 Iniciando deploy no Render..."

# Limpar cache e dependências
echo "🧹 Limpando cache..."
rm -rf node_modules/.cache
rm -rf node_modules/.vite
rm -rf dist

# Verificar versão do Node
echo "📋 Verificando versão do Node.js..."
node --version
npm --version

# Instalação limpa das dependências
echo "📦 Instalando dependências..."
npm ci --production=false

# Verificar se TailwindCSS está disponível
echo "🎨 Verificando TailwindCSS..."
npx tailwindcss --version

# Build da aplicação
echo "🏗️ Executando build..."
npm run build

echo "✅ Deploy concluído com sucesso!" 