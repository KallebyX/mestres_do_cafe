#!/usr/bin/env python3
"""
Script para inicializar completamente o banco de dados
"""
import sys
import os
sys.path.append('src')

from app import create_app
from database import db

# Import specific models to ensure they are registered
from models.auth import User, UserSession
from models.products import Product, ProductCategory, ProductPrice, Review
from models.orders import Order, OrderItem, Cart, CartItem
from models.customers import Customer, CustomerAddress
from models.payments import Payment

def init_database():
    """Inicializa todas as tabelas do banco de dados"""
    app = create_app()
    
    with app.app_context():
        print("🔄 Inicializando banco de dados...")
        
        # Criar todas as tabelas
        db.create_all()
        
        print("✅ Tabelas criadas com sucesso!")
        
        # Verificar se as tabelas foram criadas
        inspector = db.inspect(db.engine)
        tables = inspector.get_table_names()
        
        print(f"\n📋 Total de tabelas criadas: {len(tables)}")
        for table in sorted(tables):
            print(f"   • {table}")
        
        # Verificar tabelas essenciais
        essential_tables = ['users', 'products', 'orders', 'user_sessions']
        print("\n🔍 Verificando tabelas essenciais:")
        all_essential_exist = True
        for table in essential_tables:
            if table in tables:
                print(f"   ✅ {table}")
            else:
                print(f"   ❌ {table} - NÃO EXISTE")
                all_essential_exist = False
        
        if all_essential_exist:
            print("\n🎉 Banco de dados inicializado com sucesso!")
            return True
        else:
            print("\n❌ Algumas tabelas essenciais não foram criadas")
            return False

if __name__ == "__main__":
    success = init_database()
    exit(0 if success else 1)