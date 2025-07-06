#!/bin/bash

# Script para converter imports relativos para aliases do Vite
# Isso resolve problemas de resolução de módulos no Render

echo "🔧 Convertendo imports relativos para aliases..."

# Função para processar arquivos
process_files() {
    find apps/web/src -name "*.jsx" -o -name "*.js" -o -name "*.ts" -o -name "*.tsx" | while read file; do
        echo "Processando: $file"

        # Backup do arquivo
        cp "$file" "$file.bak"

        # Substituir imports relativos por aliases
        sed -i '' \
            -e 's|from ['"'"'"]\.\.\/lib\/|from "@/lib/|g' \
            -e 's|from ['"'"'"]\.\.\/components\/|from "@/components/|g' \
            -e 's|from ['"'"'"]\.\.\/pages\/|from "@/pages/|g' \
            -e 's|from ['"'"'"]\.\.\/hooks\/|from "@/hooks/|g' \
            -e 's|from ['"'"'"]\.\.\/contexts\/|from "@/contexts/|g' \
            -e 's|from ['"'"'"]\.\.\/services\/|from "@/services/|g' \
            -e 's|from ['"'"'"]\.\.\/utils\/|from "@/utils/|g' \
            -e 's|from ['"'"'"]\./lib\/|from "@/lib/|g' \
            -e 's|from ['"'"'"]\./components\/|from "@/components/|g' \
            -e 's|from ['"'"'"]\./pages\/|from "@/pages/|g' \
            -e 's|from ['"'"'"]\./hooks\/|from "@/hooks/|g' \
            -e 's|from ['"'"'"]\./contexts\/|from "@/contexts/|g' \
            -e 's|from ['"'"'"]\./services\/|from "@/services/|g' \
            -e 's|from ['"'"'"]\./utils\/|from "@/utils/|g' \
            "$file"

        # Verificar se houve mudanças
        if ! diff -q "$file" "$file.bak" > /dev/null; then
            echo "  ✅ Atualizado: $file"
        fi

        # Remover backup
        rm "$file.bak"
    done
}

# Processar todos os arquivos
process_files

echo ""
echo "✅ Conversão concluída!"
echo ""
echo "🔍 Verificando alguns imports convertidos:"
echo ""

# Mostrar exemplos das mudanças
echo "📁 Imports de lib/api:"
grep -r "from.*@/lib" apps/web/src/ | head -3
echo ""

echo "📁 Imports de components:"
grep -r "from.*@/components" apps/web/src/ | head -3
echo ""

echo "📁 Imports de contexts:"
grep -r "from.*@/contexts" apps/web/src/ | head -3

echo ""
echo "🎉 Todos os imports agora usam aliases do Vite!"
echo "📋 Exemplos de conversão:"
echo "  ../lib/api → @/lib/api"
echo "  ../components/Button → @/components/Button"
echo "  ../contexts/AuthContext → @/contexts/AuthContext"
