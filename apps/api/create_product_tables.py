#!/usr/bin/env python3
"""
Script para criar as novas tabelas de produtos (ProductPrice, Review, etc)
"""
import sys
sys.path.append('src')

from app import create_app
from database import db
from models import Product, ProductPrice, Review, ReviewHelpful, ReviewResponse

app = create_app()

with app.app_context():
    print("🔄 Criando novas tabelas de produtos...")
    
    # Criar apenas as novas tabelas (não vai afetar as existentes)
    db.create_all()
    
    print("✅ Tabelas criadas com sucesso!")
    
    # Verificar se as tabelas foram criadas
    inspector = db.inspect(db.engine)
    tables = inspector.get_table_names()
    
    print("\n📋 Tabelas no banco de dados:")
    for table in sorted(tables):
        print(f"   • {table}")
    
    # Verificar especificamente as novas tabelas
    new_tables = ['product_prices', 'reviews', 'review_helpful', 'review_responses']
    print("\n🔍 Verificando novas tabelas:")
    for table in new_tables:
        if table in tables:
            print(f"   ✅ {table} - criada com sucesso")
        else:
            print(f"   ❌ {table} - não foi criada")