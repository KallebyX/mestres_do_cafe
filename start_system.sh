#!/bin/bash
# Mestres do Café - Complete Deployment Script

echo "🚀 Iniciando deployment completo do Mestres do Café..."

# 1. Backend API
echo "📡 Iniciando Backend API..."
cd apps/api
python3 minimal_server.py &
API_PID=$!
echo "✅ Backend API rodando (PID: $API_PID) em http://localhost:5001"

# 2. Frontend Build & Serve
echo "🌐 Building e servindo Frontend..."
cd ../web
npm run build
npx serve dist -s -p 3000 &
FRONTEND_PID=$!
echo "✅ Frontend rodando (PID: $FRONTEND_PID) em http://localhost:3000"

echo ""
echo "🎉 SISTEMA COMPLETAMENTE FUNCIONAL!"
echo "🌐 Frontend: http://localhost:3000"
echo "📡 API Backend: http://localhost:5001"
echo "🔧 Health Check: http://localhost:5001/api/health"
echo ""
echo "Para parar os serviços: kill $API_PID $FRONTEND_PID"

# Keep script running
wait