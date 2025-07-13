#!/usr/bin/env python3
"""
Script para criar todas as tabelas do banco de dados
"""

import os
import sys
import logging

# Configurar ambiente
os.environ['FLASK_ENV'] = 'development'

# Adicionar o diretório apps/api ao Python path
sys.path.insert(0, os.path.join(os.getcwd(), 'apps/api'))

try:
    from src.database import db
    from src.app import create_app
    # Importar todos os modelos
    from src.models import *
    
    def create_tables():
        """Criar todas as tabelas no banco de dados"""
        app = create_app()
        
        with app.app_context():
            print("🔄 Criando tabelas SQLAlchemy...")
            
            # Criar todas as tabelas
            db.create_all()
            
            print("✅ Tabelas criadas com sucesso!")
            
            # Verificar tabelas criadas
            print("\n📊 Verificando tabelas...")
            from sqlalchemy import text
            result = db.session.execute(
                text("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name")
            )
            tables = [row[0] for row in result.fetchall()]
            print(f"Total de tabelas: {len(tables)}")
            
            # Mostrar algumas tabelas específicas
            new_tables = [t for t in tables if t in ['badges', 'achievements', 'blog_categories', 'blog_tags', 'wishlists', 'wishlist_items']]
            if new_tables:
                print(f"✅ Novas tabelas criadas: {new_tables}")
            else:
                print("ℹ️  Tabelas já existiam ou não foram criadas")
                
    if __name__ == "__main__":
        create_tables()
        
except Exception as e:
    print(f"❌ Erro ao criar tabelas: {e}")
    import traceback
    traceback.print_exc()
    sys.exit(1)