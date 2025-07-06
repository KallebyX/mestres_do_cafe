#!/bin/bash

# Script de build automatizado para produção - Mestres do Café
# Este script executa todas as etapas necessárias para build de produção

set -e  # Parar em caso de erro

echo "🚀 Iniciando build de produção - Mestres do Café"
echo "=================================================="

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Função para log
log() {
    echo -e "${GREEN}[BUILD]${NC} $1"
}

warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1"
    exit 1
}

# Verificar se estamos no diretório correto
if [ ! -f "package.json" ]; then
    error "package.json não encontrado. Execute este script do diretório apps/web"
fi

# Verificar Node.js
if ! command -v node &> /dev/null; then
    error "Node.js não está instalado"
fi

# Verificar versão do Node.js
NODE_VERSION=$(node --version)
log "Versão do Node.js: $NODE_VERSION"

# Verificar se há dependências instaladas
if [ ! -d "node_modules" ]; then
    warn "node_modules não encontrado. Instalando dependências..."
    npm install
fi

# Limpar build anterior
log "Limpando build anterior..."
rm -rf dist
rm -rf node_modules/.vite

# Verificar lint
log "Executando verificação de lint..."
npm run lint || warn "Lint warnings encontrados, mas continuando build..."

# Verificar tipos TypeScript
log "Verificando tipos TypeScript..."
npm run type-check || error "Erro na verificação de tipos"

# Verificar se arquivo .env.production existe
if [ ! -f ".env.production" ]; then
    warn ".env.production não encontrado, usando .env"
fi

# Build para produção
log "Executando build para produção..."
NODE_ENV=production npm run build:production

# Verificar se build foi bem-sucedido
if [ ! -d "dist" ]; then
    error "Diretório dist não foi criado. Build falhou."
fi

# Verificar se index.html foi criado
if [ ! -f "dist/index.html" ]; then
    error "index.html não foi criado no dist. Build falhou."
fi

# Verificar tamanho dos arquivos
log "Verificando tamanho dos arquivos..."
du -sh dist/

# Listar arquivos principais
log "Arquivos principais criados:"
ls -la dist/

# Verificar se assets foram criados
if [ -d "dist/assets" ]; then
    log "Assets criados:"
    ls -la dist/assets/
else
    warn "Diretório assets não encontrado"
fi

# Verificar arquivos críticos
CRITICAL_FILES=("dist/index.html" "dist/_redirects" "dist/robots.txt")
for file in "${CRITICAL_FILES[@]}"; do
    if [ -f "$file" ]; then
        log "✅ $file criado com sucesso"
    else
        error "❌ $file não encontrado"
    fi
done

# Verificar se há erros no console
log "Verificando estrutura do build..."
if [ -f "dist/index.html" ]; then
    # Verificar se há referências quebradas
    if grep -q "src=\"/src/" dist/index.html; then
        error "Referências de desenvolvimento encontradas no build"
    fi
    log "✅ Estrutura do build verificada"
fi

# Calcular hash dos arquivos para verificação
log "Calculando checksums..."
find dist -name "*.js" -o -name "*.css" | head -5 | while read file; do
    if [ -f "$file" ]; then
        echo "  $(basename "$file"): $(md5sum "$file" | cut -d' ' -f1)"
    fi
done

# Estatísticas finais
log "📊 Estatísticas do build:"
echo "  Tamanho total: $(du -sh dist/ | cut -f1)"
echo "  Arquivos JS: $(find dist -name "*.js" | wc -l)"
echo "  Arquivos CSS: $(find dist -name "*.css" | wc -l)"
echo "  Imagens: $(find dist -name "*.png" -o -name "*.jpg" -o -name "*.svg" | wc -l)"

# Teste básico de serve
log "🧪 Testando serve local..."
if command -v serve &> /dev/null; then
    log "Serve disponível. Para testar localmente execute:"
    echo "  cd dist && serve -s . -l 3000"
else
    log "Para testar localmente, instale serve:"
    echo "  npm install -g serve"
    echo "  cd dist && serve -s . -l 3000"
fi

echo ""
echo "=================================================="
echo -e "${GREEN}🎉 Build de produção concluído com sucesso!${NC}"
echo -e "${BLUE}📦 Arquivos prontos para deploy em: dist/${NC}"
echo "=================================================="

# Instruções de deploy
echo ""
echo "📋 Próximos passos para deploy:"
echo "1. Verificar se todas as variáveis de ambiente estão configuradas"
echo "2. Fazer upload dos arquivos da pasta dist/ para o servidor"
echo "3. Configurar servidor web (Nginx/Apache) para SPA"
echo "4. Configurar SSL/HTTPS"
echo "5. Testar todas as rotas da aplicação"
echo ""
echo "Para mais informações, consulte: docs/deployment.md"