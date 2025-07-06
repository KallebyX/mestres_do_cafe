#!/bin/bash

# Script para corrigir imports removendo extensão .js
# Isso resolve problemas de build no Vite/Render

echo "🔧 Corrigindo imports com extensão .js..."

# Encontrar e corrigir todos os arquivos .jsx em apps/web/src/
find apps/web/src -name "*.jsx" -type f | while read file; do
    echo "Processando: $file"
    # Substituir imports que terminam com .js
    sed -i.bak 's/from ["'"'"']\([^"'"'"']*\)\.js["'"'"']/from "\1"/g' "$file"
    # Remover arquivo de backup
    rm "${file}.bak" 2>/dev/null || true
done

echo "✅ Imports corrigidos!"
echo "📁 Arquivos processados em apps/web/src/"

# Mostrar alguns exemplos das mudanças
echo ""
echo "🔍 Verificando alguns imports corrigidos:"
grep -r "from.*lib/api[\"']" apps/web/src/ | head -5
