#!/usr/bin/env python3
"""
Script para inserir produtos de exemplo no banco
"""
import os
import sys
from pathlib import Path

# Adicionar src ao path
current_dir = Path(__file__).parent
src_dir = current_dir / 'src'
sys.path.insert(0, str(src_dir))

def insert_sample_products():
    """Insere produtos de exemplo no banco"""
    try:
        from src.app import create_app
        from src.database import db
        from src.models.products import Product, ProductCategory
        from datetime import datetime
        import uuid
        
        print("🗄️ Iniciando inserção de produtos de exemplo...")
        
        # Criar aplicação
        app = create_app('production')
        
        with app.app_context():
            # Verificar se já existem produtos
            existing_products = Product.query.count()
            if existing_products > 0:
                print(f"✅ Já existem {existing_products} produtos no banco")
                return True
            
            print("🔧 Criando categoria de exemplo...")
            
            # Criar categoria se não existir
            category = ProductCategory.query.filter_by(slug='cafes-especiais').first()
            if not category:
                category = ProductCategory(
                    id=str(uuid.uuid4()),
                    name='Cafés Especiais',
                    slug='cafes-especiais',
                    description='Cafés especiais de alta qualidade',
                    is_active=True
                )
                db.session.add(category)
                db.session.commit()
                print("✅ Categoria 'Cafés Especiais' criada")
            
            print("🔧 Criando produtos de exemplo...")
            
            # Produtos de exemplo
            sample_products = [
                {
                    'name': 'Catuai Amarelo 86+',
                    'slug': 'catuai-amarelo-86',
                    'description': 'Café especial com notas de caramelo e frutas tropicais',
                    'price': 29.90,
                    'origin': 'Alta Mogiana - SP',
                    'roast_level': 'Médio',
                    'sca_score': 86,
                    'stock_quantity': 100,
                    'is_featured': True,
                    'flavor_notes': 'Caramelo, Frutas tropicais, Doce'
                },
                {
                    'name': 'Arara 84+',
                    'slug': 'arara-84',
                    'description': 'Café com aroma intenso e corpo aveludado',
                    'price': 27.90,
                    'origin': 'Cerrado Mineiro - MG',
                    'roast_level': 'Médio-escuro',
                    'sca_score': 84,
                    'stock_quantity': 80,
                    'is_featured': True,
                    'flavor_notes': 'Chocolate, Nozes, Corpo aveludado'
                },
                {
                    'name': 'Bourbon Amarelo 88+',
                    'slug': 'bourbon-amarelo-88',
                    'description': 'Café premium com doçura natural e acidez equilibrada',
                    'price': 34.90,
                    'origin': 'Sul de Minas - MG',
                    'roast_level': 'Médio-claro',
                    'sca_score': 88,
                    'stock_quantity': 60,
                    'is_featured': True,
                    'flavor_notes': 'Mel, Cítricos, Acidez equilibrada'
                }
            ]
            
            # Inserir produtos
            for product_data in sample_products:
                product = Product(
                    id=str(uuid.uuid4()),
                    name=product_data['name'],
                    slug=product_data['slug'],
                    description=product_data['description'],
                    price=product_data['price'],
                    origin=product_data['origin'],
                    roast_level=product_data['roast_level'],
                    sca_score=product_data['sca_score'],
                    stock_quantity=product_data['stock_quantity'],
                    is_featured=product_data['is_featured'],
                    is_active=True,
                    flavor_notes=product_data['flavor_notes'],
                    category_id=category.id,
                    category='Cafés Especiais',
                    weight=250,  # 250g padrão
                    track_inventory=True,
                    requires_shipping=True,
                    created_at=datetime.utcnow()
                )
                db.session.add(product)
                print(f"✅ Produto '{product_data['name']}' criado")
            
            db.session.commit()
            print("✅ Todos os produtos foram inseridos com sucesso!")
            
            return True
                
    except Exception as e:
        print(f"❌ Erro ao inserir produtos: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == '__main__':
    success = insert_sample_products()
    sys.exit(0 if success else 1)
