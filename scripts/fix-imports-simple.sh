#!/bin/bash

# Script simples para converter imports relativos para aliases
echo "🔧 Convertendo imports para aliases..."

# Converter imports de lib
find apps/web/src -name "*.jsx" -type f -exec perl -pi -e 's|from\s+['"'"'"]\.\.\/lib\/([^'"'"'"]+)['"'"'"]|from "@/lib/$1"|g' {} \;

echo "✅ Conversão concluída!"

# Verificar mudanças
echo "🔍 Verificando imports convertidos:"
grep -r "from.*@/lib" apps/web/src/ | head -5
