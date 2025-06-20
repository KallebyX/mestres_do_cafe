#!/bin/bash

echo "🚀 Abrindo aplicação Mestres do Café..."

# Verificar se servidores estão rodando
echo "📋 Verificando servidores..."

# Frontend
if curl -s http://localhost:5173 > /dev/null; then
    echo "✅ Frontend: http://localhost:5173 - FUNCIONANDO"
else
    echo "❌ Frontend: Não está rodando"
    echo "Execute: npm run dev"
fi

# Backend
if curl -s http://localhost:5000/api/health > /dev/null; then
    echo "✅ Backend: http://localhost:5000 - FUNCIONANDO"
else
    echo "❌ Backend: Não está rodando"
    echo "Execute: cd server && node server.js"
fi

echo ""
echo "🌐 URLs disponíveis:"
echo "   📱 App Principal: http://localhost:5173"
echo "   🔐 Login: http://localhost:5173/login"
echo "   📝 Registro: http://localhost:5173/registro"
echo "   🛒 Marketplace: http://localhost:5173/marketplace"
echo ""
echo "🎮 Credenciais de teste:"
echo "   📧 Email: cliente@teste.com"
echo "   🔑 Senha: 123456"
echo ""

# Tentar abrir no navegador
if command -v open >/dev/null 2>&1; then
    echo "🌍 Abrindo no navegador..."
    open "http://localhost:5173"
elif command -v xdg-open >/dev/null 2>&1; then
    echo "🌍 Abrindo no navegador..."
    xdg-open "http://localhost:5173"
else
    echo "💡 Abra manualmente: http://localhost:5173"
fi

echo "✅ Pronto! Se a página não carregar, pressione Ctrl+F5 para forçar atualização" 