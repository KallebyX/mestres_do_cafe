#!/usr/bin/env python3
"""
Mestres do Café - Aplicação Principal
Ponto de entrada para produção no Render
"""

import os
import sys
from pathlib import Path

# Adicionar src ao path para imports
current_dir = Path(__file__).parent
src_dir = current_dir / 'src'
sys.path.insert(0, str(current_dir))
sys.path.insert(0, str(src_dir))

# Importar do módulo src
from src.app import create_app

# Criar aplicação
app = create_app()

if __name__ == '__main__':
    port = int(os.environ.get('PORT', os.environ.get('API_PORT', 5001)))
    host = os.environ.get('HOST', '0.0.0.0')
    
    print(f"🚀 Iniciando Mestres do Café API em {host}:{port}")
    app.run(host=host, port=port, debug=False)
