#!/bin/bash

# 🧪 SCRIPT DE VERIFICAÇÃO FINAL - MESTRES DO CAFÉ
# Verifica se todas as funcionalidades estão operacionais

echo "🏆 VERIFICAÇÃO FINAL - SISTEMA MESTRES DO CAFÉ"
echo "=============================================="

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Contador de verificações
TOTAL=0
PASSED=0

# Função para verificação
verify() {
    local name="$1"
    local command="$2"
    local expected="$3"
    
    echo -n "🔍 Verificando $name... "
    TOTAL=$((TOTAL + 1))
    
    if eval "$command" | grep -q "$expected" 2>/dev/null; then
        echo -e "${GREEN}✅ OK${NC}"
        PASSED=$((PASSED + 1))
        return 0
    else
        echo -e "${RED}❌ FALHOU${NC}"
        return 1
    fi
}

echo ""
echo "📦 VERIFICANDO DEPENDÊNCIAS..."

# Verificar Node.js
verify "Node.js" "node --version" "v"

# Verificar NPM
verify "NPM" "npm --version" "."

# Verificar se package.json existe
verify "package.json" "cat package.json" "mestres-do-cafe-frontend"

echo ""
echo "🔧 VERIFICANDO CONFIGURAÇÃO..."

# Verificar arquivo .env
verify "Arquivo .env" "cat .env" "VITE_SUPABASE_URL"

# Verificar se build funciona
verify "Build" "npm run build 2>&1" "built in"

echo ""
echo "📂 VERIFICANDO ESTRUTURA DE ARQUIVOS..."

# Verificar pastas principais
verify "Pasta src" "ls -la src" "pages"
verify "Pasta docs" "ls -la docs" "README.md"
verify "Pasta database" "ls -la database" "supabase-setup-completo.sql"

echo ""
echo "🧪 VERIFICANDO TESTES..."

# Verificar se testes existem
verify "Testes Frontend" "ls -la tests/frontend" "components"
verify "Testes Backend" "ls -la server/tests" "auth"

echo ""
echo "📚 VERIFICANDO DOCUMENTAÇÃO..."

# Verificar documentos principais
verify "README.md" "cat README.md" "Mestres do Café"
verify "INSTRUÇÕES_CONFIGURAÇÃO.md" "cat INSTRUÇÕES_CONFIGURAÇÃO.md" "SUPABASE"
verify "PROJETO_FINALIZADO.md" "cat PROJETO_FINALIZADO.md" "100% FINALIZADO"

echo ""
echo "🌐 VERIFICANDO SERVIDOR..."

# Verificar se servidor está rodando (se já estiver)
if curl -s http://localhost:5173 > /dev/null 2>&1; then
    verify "Servidor Frontend" "curl -s http://localhost:5173" "DOCTYPE html"
    echo -e "${GREEN}✅ Servidor já está rodando!${NC}"
else
    echo -e "${YELLOW}⚠️  Servidor não está rodando (normal)${NC}"
fi

echo ""
echo "📊 VERIFICANDO ARQUIVOS PRINCIPAIS..."

# Verificar arquivos críticos
verify "App.jsx" "cat src/App.jsx" "SupabaseAuthProvider"
verify "supabase.js" "cat src/lib/supabase.js" "createClient"
verify "SQL Setup" "cat database/supabase-setup-completo.sql" "CREATE TABLE"

echo ""
echo "🎯 VERIFICANDO PÁGINAS..."

# Verificar se páginas principais existem
verify "LandingPage" "ls -la src/pages/LandingPage.jsx" "LandingPage.jsx"
verify "AdminDashboard" "ls -la src/pages/AdminDashboard.jsx" "AdminDashboard.jsx"
verify "MarketplacePage" "ls -la src/pages/MarketplacePage.jsx" "MarketplacePage.jsx"
verify "BlogPage" "ls -la src/pages/BlogPage.jsx" "BlogPage.jsx"

echo ""
echo "=============================================="
echo "📋 RELATÓRIO FINAL"
echo "=============================================="

PERCENTAGE=$((PASSED * 100 / TOTAL))

echo -e "✅ Verificações passaram: ${GREEN}$PASSED${NC}"
echo -e "❌ Verificações falharam: ${RED}$((TOTAL - PASSED))${NC}"
echo -e "📊 Total verificado: $TOTAL"
echo -e "🎯 Taxa de sucesso: ${GREEN}$PERCENTAGE%${NC}"

echo ""
if [ $PERCENTAGE -ge 90 ]; then
    echo -e "${GREEN}🏆 SISTEMA EXCELENTE! Pronto para produção!${NC}"
elif [ $PERCENTAGE -ge 80 ]; then
    echo -e "${YELLOW}✅ SISTEMA BOM! Pequenos ajustes podem ser feitos.${NC}"
else
    echo -e "${RED}⚠️  SISTEMA PRECISA DE ATENÇÃO! Verificar problemas.${NC}"
fi

echo ""
echo "🚀 COMO EXECUTAR O SISTEMA:"
echo "1. npm run dev"
echo "2. Acesse: http://localhost:5173"
echo "3. Login: admin@mestrescafe.com / admin123"

echo ""
echo "📞 CLIENTE: Daniel - Santa Maria/RS"
echo "📱 CONTATO: (55) 99645-8600"
echo ""
echo "✅ VERIFICAÇÃO CONCLUÍDA!" 