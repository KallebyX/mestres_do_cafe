#!/bin/bash

echo "📊 Análise de Bundle Size - Mestres do Café"
echo "=========================================="

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Navegar para o diretório web
cd apps/web

# 1. Instalar dependências se necessário
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}Instalando dependências...${NC}"
    npm install
fi

# 2. Build de produção com análise
echo -e "\n${YELLOW}Criando build de produção com análise...${NC}"
npm run build:production

# 3. Analisar tamanho dos arquivos
echo -e "\n${BLUE}📦 Tamanho dos Bundles:${NC}"
echo "------------------------"

# Função para mostrar tamanho em formato legível
format_size() {
    local size=$1
    if [ $size -gt 1048576 ]; then
        echo "$(echo "scale=2; $size/1048576" | bc) MB"
    elif [ $size -gt 1024 ]; then
        echo "$(echo "scale=2; $size/1024" | bc) KB"
    else
        echo "$size B"
    fi
}

# Analisar arquivos JS
total_js=0
echo -e "\n${YELLOW}JavaScript Files:${NC}"
for file in dist/assets/js/*.js; do
    if [ -f "$file" ]; then
        size=$(stat -f%z "$file" 2>/dev/null || stat -c%s "$file" 2>/dev/null)
        formatted_size=$(format_size $size)
        filename=$(basename "$file")
        
        # Colorir baseado no tamanho
        if [ $size -gt 524288 ]; then # > 512KB
            echo -e "${RED}❌ $filename: $formatted_size${NC}"
        elif [ $size -gt 262144 ]; then # > 256KB
            echo -e "${YELLOW}⚠️  $filename: $formatted_size${NC}"
        else
            echo -e "${GREEN}✅ $filename: $formatted_size${NC}"
        fi
        
        total_js=$((total_js + size))
    fi
done

# Analisar arquivos CSS
total_css=0
echo -e "\n${YELLOW}CSS Files:${NC}"
for file in dist/assets/css/*.css; do
    if [ -f "$file" ]; then
        size=$(stat -f%z "$file" 2>/dev/null || stat -c%s "$file" 2>/dev/null)
        formatted_size=$(format_size $size)
        filename=$(basename "$file")
        
        if [ $size -gt 102400 ]; then # > 100KB
            echo -e "${YELLOW}⚠️  $filename: $formatted_size${NC}"
        else
            echo -e "${GREEN}✅ $filename: $formatted_size${NC}"
        fi
        
        total_css=$((total_css + size))
    fi
done

# Total
total=$((total_js + total_css))
echo -e "\n${BLUE}📊 Resumo:${NC}"
echo "------------------------"
echo -e "Total JS: $(format_size $total_js)"
echo -e "Total CSS: $(format_size $total_css)"
echo -e "Total Bundle: $(format_size $total)"

# 4. Analisar dependências grandes
echo -e "\n${BLUE}📦 Maiores Dependências:${NC}"
echo "------------------------"

# Usar du para encontrar as maiores pastas em node_modules
if [ -d "node_modules" ]; then
    echo "Top 10 maiores pacotes:"
    du -sh node_modules/* 2>/dev/null | sort -hr | head -10
fi

# 5. Recomendações
echo -e "\n${BLUE}💡 Recomendações de Otimização:${NC}"
echo "------------------------"

if [ $total -gt 2097152 ]; then # > 2MB
    echo -e "${RED}❌ Bundle total muito grande (>2MB)${NC}"
    echo "   - Implementar code splitting mais agressivo"
    echo "   - Considerar lazy loading de rotas"
    echo "   - Remover dependências não utilizadas"
fi

# Verificar se há source maps em produção
if ls dist/assets/js/*.map 1> /dev/null 2>&1; then
    echo -e "${YELLOW}⚠️  Source maps encontrados em produção${NC}"
    echo "   - Considerar remover para reduzir tamanho"
fi

# 6. Gerar relatório detalhado
echo -e "\n${YELLOW}Gerando relatório detalhado...${NC}"
if command -v npx &> /dev/null; then
    # Instalar analisador se não existir
    npm install -D rollup-plugin-visualizer
    
    # Adicionar ao vite.config.js temporariamente para análise
    echo -e "\n${BLUE}Para análise visual detalhada:${NC}"
    echo "1. Adicione ao vite.config.js:"
    echo "   import { visualizer } from 'rollup-plugin-visualizer';"
    echo "   plugins: [..., visualizer({ open: true })]"
    echo "2. Execute: npm run build"
fi

echo -e "\n${GREEN}✅ Análise concluída!${NC}"