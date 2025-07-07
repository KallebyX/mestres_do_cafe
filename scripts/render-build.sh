#!/bin/bash

# Mestres do Café - Script de Build para Render
# Este script garante que o build seja executado corretamente no Render

set -e

echo "🏗️ Iniciando build do Mestres do Café no Render..."
echo "📍 Diretório atual: $(pwd)"
echo "📁 Conteúdo do diretório: $(ls -la)"

# Verificar versão do Node.js
echo "📦 Versão do Node.js: $(node --version)"
echo "📦 Versão do NPM: $(npm --version)"

# Verificar se estamos no diretório correto
if [ ! -f "package.json" ] && [ ! -d "apps" ]; then
    echo "❌ Erro: Estrutura de projeto não encontrada"
    echo "📁 Listando conteúdo atual:"
    ls -la
    exit 1
fi

# Instalar dependências na raiz do projeto apenas se existir package.json
if [ -f "package.json" ]; then
    echo "🔧 Instalando dependências da raiz do projeto..."
    npm install --include=dev
else
    echo "⚠️ Aviso: package.json não encontrado na raiz, pulando instalação"
fi

# Navegar para o diretório do frontend
echo "🚀 Navegando para apps/web..."
cd apps/web

# Verificar se o package.json existe
if [ ! -f "package.json" ]; then
    echo "❌ Erro: package.json não encontrado em apps/web/"
    echo "📁 Conteúdo de apps/web:"
    ls -la
    exit 1
fi

# Limpar cache do npm para evitar problemas
echo "🧹 Limpando cache do npm..."
npm cache clean --force

# Instalar dependências do frontend
echo "📦 Instalando dependências do frontend..."
npm ci || npm install

# Verificar se serve está instalado globalmente
echo "🔍 Verificando instalação do serve..."
if ! command -v serve &> /dev/null; then
    echo "📦 Instalando serve globalmente..."
    npm install -g serve
fi

# Verificar se o vite está disponível
if ! command -v vite &> /dev/null && ! npx vite --version &> /dev/null; then
    echo "❌ Erro: vite não encontrado. Verificando package.json..."
    if grep -q "vite" package.json; then
        echo "✅ Vite encontrado nas dependências, usando npx"
    else
        echo "❌ Erro: vite não está nas dependências!"
        exit 1
    fi
fi

# Executar o build
echo "🏗️ Executando build do frontend..."
npm run build || {
    echo "❌ Erro durante o build!"
    echo "📋 Logs de erro:"
    exit 1
}

echo "✅ Build concluído com sucesso!"
echo "📁 Arquivos de build estão em apps/web/dist/"

# Verificar se o build foi criado
if [ -d "dist" ]; then
    echo "✅ Diretório dist criado com sucesso"
    echo "📊 Tamanho dos arquivos:"
    du -sh dist/
    echo "📋 Conteúdo do dist:"
    ls -la dist/
    
    # Verificar arquivos essenciais
    if [ ! -f "dist/index.html" ]; then
        echo "❌ Erro: index.html não encontrado em dist/"
        exit 1
    fi
    
    # Criar arquivo de health check
    echo '{"status":"healthy","service":"Mestres do Café Web","version":"1.0.0"}' > dist/health.json
    echo "✅ Arquivo health.json criado"
else
    echo "❌ Erro: Diretório dist não foi criado"
    exit 1
fi

echo "🎉 Build do Mestres do Café concluído com sucesso!"
echo "🚀 Pronto para deploy no Render!"
