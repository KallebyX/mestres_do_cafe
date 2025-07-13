#!/bin/bash

echo "🚀 Testando Build de Produção - Mestres do Café"
echo "============================================"

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Função para verificar sucesso
check_success() {
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ $1${NC}"
    else
        echo -e "${RED}❌ $1${NC}"
        exit 1
    fi
}

# 1. Verificar Node.js
echo -e "\n${YELLOW}1. Verificando Node.js...${NC}"
node_version=$(node -v)
echo "Versão do Node.js: $node_version"
if [[ "$node_version" == v18* ]]; then
    check_success "Node.js 18.x detectado"
else
    echo -e "${YELLOW}⚠️  Aviso: Recomendado Node.js 18.x${NC}"
fi

# 2. Instalar dependências
echo -e "\n${YELLOW}2. Instalando dependências...${NC}"
npm install
check_success "Dependências instaladas"

# 3. Build do Frontend
echo -e "\n${YELLOW}3. Construindo Frontend...${NC}"
cd apps/web
npm install
npm run build:production
check_success "Frontend construído"

# 4. Verificar arquivos gerados
echo -e "\n${YELLOW}4. Verificando arquivos gerados...${NC}"
if [ -d "dist" ] && [ -f "dist/index.html" ]; then
    echo -e "${GREEN}✅ Diretório dist criado corretamente${NC}"
    echo "Arquivos principais:"
    ls -la dist/index.html
    ls -la dist/assets/js/ | head -5
else
    echo -e "${RED}❌ Erro: Diretório dist não encontrado${NC}"
    exit 1
fi

# 5. Testar servidor local
echo -e "\n${YELLOW}5. Iniciando servidor de produção local...${NC}"
echo "Servidor rodando em http://localhost:4000"
echo "Pressione Ctrl+C para parar"

# Criar variáveis de ambiente temporárias
export PORT=4000
export NODE_ENV=production
export VITE_API_URL=https://mestres-cafe-api.onrender.com

# Iniciar servidor
npx serve dist -p $PORT -s -c serve.json