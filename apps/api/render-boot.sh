#!/bin/bash
# Script de inicialização específico para Render
# Para ser usado caso o start.sh principal falhe

set -e

echo "🚀 Render Boot Script - Mestres do Café API"

# Configurar ambiente
export FLASK_ENV=production
export FLASK_DEBUG=0
export PYTHONPATH="/opt/render/project/src/apps/api/src:/opt/render/project/src/apps/api"
export PORT=${PORT:-5001}

# Verificar diretório atual
echo "📁 Diretório atual: $(pwd)"
echo "📁 Listando arquivos:"
ls -la

# Verificar se estamos no diretório correto
if [ ! -f "app.py" ]; then
    echo "❌ app.py não encontrado, tentando navegar para apps/api"
    cd apps/api
fi

# Verificar Python e pip
echo "🐍 Versão do Python: $(python --version)"
echo "📦 Versão do pip: $(pip --version)"

# Instalar dependências se necessário
if [ ! -d "venv" ] && [ -f "requirements.txt" ]; then
    echo "📦 Instalando dependências..."
    pip install --upgrade pip
    pip install -r requirements.txt
fi

# Verificar estrutura do projeto
echo "📂 Estrutura do projeto:"
find . -name "*.py" -type f | head -20

# Teste básico de importação
echo "🧪 Testando importações básicas..."
python -c "
import sys
sys.path.insert(0, 'src')
sys.path.insert(0, '.')

try:
    print('Testando importação do app...')
    from app import app
    print('✅ Importação de app.py bem-sucedida')
    
    # Testar health check básico
    with app.test_client() as client:
        response = client.get('/api/health')
        print(f'✅ Health check: {response.status_code}')
        
except ImportError as e:
    print(f'❌ Erro de importação: {e}')
    
    # Tentar importação alternativa
    try:
        from src.app import create_app
        app = create_app('production')
        print('✅ Importação alternativa bem-sucedida')
    except Exception as e2:
        print(f'❌ Importação alternativa falhou: {e2}')
        sys.exit(1)
        
except Exception as e:
    print(f'❌ Erro geral: {e}')
    sys.exit(1)
"

# Iniciar com Gunicorn
echo "🚀 Iniciando com Gunicorn..."
exec gunicorn \
    --bind 0.0.0.0:$PORT \
    --workers 2 \
    --threads 4 \
    --timeout 120 \
    --keepalive 2 \
    --max-requests 1000 \
    --access-logfile - \
    --error-logfile - \
    --log-level info \
    --preload \
    app:app
