#!/usr/bin/env python3
"""
Script para adicionar o campo added_at na tabela cart_items
"""

import os
import sys

# Configurar ambiente
os.environ["FLASK_ENV"] = "development"

# Adicionar o diretório apps/api ao Python path
sys.path.insert(0, os.path.join(os.getcwd(), "apps/api"))

try:
    from src.app import create_app
    from src.database import db
    from sqlalchemy import text
    
    def add_added_at_field():
        """Adicionar campo added_at à tabela cart_items"""
        app = create_app()
        
        with app.app_context():
            print("🔄 Iniciando adição do campo added_at...")
            
            # Verificar se a coluna added_at já existe
            result = db.session.execute(text("""
                SELECT column_name 
                FROM information_schema.columns 
                WHERE table_name='cart_items' AND column_name='added_at'
            """)).fetchone()
            
            if result:
                print("✅ Campo added_at já existe na tabela cart_items")
                return
                
            # Adicionar campo added_at se não existir
            print("⏰ Adicionando campo added_at à tabela cart_items...")
            db.session.execute(text("""
                ALTER TABLE cart_items 
                ADD COLUMN added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            """))
            
            # Preencher added_at com created_at para registros existentes
            print("📅 Preenchendo campo added_at com created_at...")
            db.session.execute(text("""
                UPDATE cart_items 
                SET added_at = created_at 
                WHERE added_at IS NULL
            """))
            
            db.session.commit()
            print("✅ Campo added_at adicionado com sucesso!")
            
            # Verificar resultado
            result = db.session.execute(
                text("SELECT COUNT(*) FROM cart_items WHERE added_at IS NOT NULL")
            ).fetchone()
            print(f"📊 Total de itens com added_at: {result[0]}")
            
    if __name__ == "__main__":
        add_added_at_field()
        
except Exception as e:
    print(f"❌ Erro durante migração: {e}")
    import traceback
    traceback.print_exc()
    sys.exit(1)