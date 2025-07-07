#!/usr/bin/env python
"""
Arquivo de entrada alternativo para o Render
"""
import os
import sys

# Adiciona o diretório src ao Python path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "src"))

# Importa e executa a aplicação
from src.app import app

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port)
