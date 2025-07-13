#!/usr/bin/env python3
"""
Script para criar as tabelas de gamificação no banco de dados
"""

import sys
import os

# Adicionar o diretório do projeto ao sys.path
project_root = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, project_root)
sys.path.insert(0, os.path.join(project_root, 'apps/api/src'))

from flask import Flask

def create_app():
    """Cria a aplicação Flask"""
    app = Flask(__name__)
    app.config['SECRET_KEY'] = 'dev-secret-key'
    
    # Configurar banco de dados
    from database import db, init_db
    init_db(app)
    
    # Importar modelos para registrar no SQLAlchemy
    from models import auth, gamification
    
    return app

def main():
    """Função principal"""
    print("🎮 Criando tabelas de gamificação...")
    print("=" * 50)
    
    app = create_app()
    
    with app.app_context():
        try:
            from database import db
            
            # Criar todas as tabelas
            db.create_all()
            print("✅ Tabelas criadas com sucesso!")
            
            # Listar tabelas criadas
            result = db.session.execute("""
                SELECT table_name 
                FROM information_schema.tables 
                WHERE table_schema = 'public' 
                AND table_type = 'BASE TABLE'
                ORDER BY table_name
            """)
            
            tables = [row[0] for row in result.fetchall()]
            print(f"\n📊 {len(tables)} tabelas encontradas:")
            for table in tables:
                print(f"   - {table}")
                
        except Exception as e:
            print(f"❌ Erro ao criar tabelas: {e}")
            import traceback
            traceback.print_exc()
            return False
    
    print("\n🎯 Tabelas de gamificação criadas com sucesso!")
    return True

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)