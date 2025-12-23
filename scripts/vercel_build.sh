#!/bin/bash
# Script de build para Vercel
# Este script:
# 1. Instala dependências Python
# 2. Inicializa o banco de dados (se configurado)
# 3. Build do frontend

set -e

echo "=========================================="
echo "🚀 MESTRES DO CAFÉ - VERCEL BUILD"
echo "=========================================="

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 1. Instalar dependências Python
echo ""
echo "📦 Instalando dependências Python..."
pip install -r requirements.txt --quiet

# 2. Inicializar banco de dados (se DATABASE_URL estiver configurada)
if [ -n "$DATABASE_URL" ] || [ -n "$NEON_DATABASE_URL" ]; then
    echo ""
    echo "🔄 Inicializando banco de dados Neon..."

    # Definir PYTHONPATH
    export PYTHONPATH="${PYTHONPATH}:$(pwd)/apps/api/src"

    # Executar script de inicialização
    python scripts/init_database.py || {
        echo -e "${YELLOW}⚠️ Aviso: Inicialização do banco pode ter tido problemas${NC}"
        echo "O deploy continuará, mas verifique os logs"
    }

    echo -e "${GREEN}✅ Banco de dados processado${NC}"
else
    echo ""
    echo -e "${YELLOW}⚠️ DATABASE_URL não configurada - pulando inicialização do banco${NC}"
    echo "Configure as variáveis de ambiente no Vercel:"
    echo "  - DATABASE_URL ou NEON_DATABASE_URL"
fi

# 3. Build do frontend
echo ""
echo "🔨 Construindo frontend..."
cd apps/web
npm install
npm run build:production

echo ""
echo "=========================================="
echo -e "${GREEN}✅ BUILD CONCLUÍDO COM SUCESSO!${NC}"
echo "=========================================="
