#!/usr/bin/env python3
"""
Script para criar todas as tabelas do banco de dados
"""

import os
import sys
from pathlib import Path

# Adicionar src ao path
current_dir = Path(__file__).parent
src_dir = current_dir / 'src'
sys.path.insert(0, str(src_dir))

def create_all_tables():
    """Criar todas as tabelas do banco de dados"""
    try:
        from src.app import create_app
        from src.database import db
        
        # Importar todos os modelos para garantir que sejam registrados
        import src.models.products
        import src.models.auth
        import src.models.customers
        import src.models.orders
        import src.models.payments
        import src.models.coupons
        import src.models.analytics
        import src.models.financial
        import src.models.media
        import src.models.notifications
        import src.models.suppliers
        import src.models.system
        import src.models.tax
        import src.models.vendors
        import src.models.wishlist
        
        print("🗄️ Iniciando criação de tabelas...")
        
        # Criar aplicação
        app = create_app('production')
        
        with app.app_context():
            print("🔧 Criando todas as tabelas...")
            db.create_all()
            print("✅ Tabelas criadas com sucesso!")
            
            # Testar conexão
            result = db.session.execute(db.text('SELECT 1')).fetchone()
            if result:
                print("✅ Teste de conexão bem-sucedido")
                return True
            else:
                print("❌ Teste de conexão falhou")
                return False
                
    except Exception as e:
        print(f"❌ Erro ao criar tabelas: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == '__main__':
    success = create_all_tables()
    sys.exit(0 if success else 1)
