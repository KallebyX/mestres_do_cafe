#!/usr/bin/env python3
"""
Script para atualizar dados dos produtos com preços e estoque
"""
import sys
sys.path.append('src')

from app import create_app
from database import db
from models import Product, ProductPrice
from decimal import Decimal
import random

app = create_app()

with app.app_context():
    print("🔄 Atualizando dados dos produtos...")
    
    # Buscar todos os produtos
    products = Product.query.all()
    
    for product in products:
        print(f"\n📦 Atualizando produto: {product.name}")
        
        # Definir preço base se não tiver
        if not product.price or product.price == 0:
            # Preços base variados para café
            base_prices = {
                'catuaí': 45.00,
                'bourbon': 55.00,
                'geisha': 120.00,
                'arábica': 42.00,
                'robusta': 35.00,
                'especial': 75.00,
                'premium': 85.00
            }
            
            # Determinar preço base baseado no nome
            price = 50.00  # preço padrão
            for key, value in base_prices.items():
                if key in product.name.lower():
                    price = value
                    break
            
            product.price = Decimal(str(price))
            print(f"   • Preço base definido: R$ {price}")
        
        # Definir preço promocional (10-20% de desconto)
        if not product.promotional_price:
            discount = random.uniform(0.10, 0.20)
            promotional = float(product.price) * (1 - discount)
            product.promotional_price = Decimal(str(round(promotional, 2)))
            print(f"   • Preço promocional: R$ {product.promotional_price}")
        
        # Definir estoque se não tiver
        if not product.stock_quantity or product.stock_quantity == 0:
            product.stock_quantity = random.randint(50, 200)
            print(f"   • Estoque definido: {product.stock_quantity} unidades")
        
        # Campo min_stock não existe no modelo atual
        
        # Criar preços por peso se não existirem
        existing_prices = ProductPrice.query.filter_by(product_id=product.id).count()
        if existing_prices == 0:
            print("   • Criando preços por peso:")
            
            # Estrutura de preços por peso
            weights = [
                {'weight': '250g', 'multiplier': 1.0, 'order': 1},
                {'weight': '500g', 'multiplier': 1.9, 'order': 2},
                {'weight': '1kg', 'multiplier': 3.6, 'order': 3}
            ]
            
            for w in weights:
                price_value = float(product.price) * w['multiplier']
                stock = random.randint(20, 100)
                
                price_entry = ProductPrice(
                    product_id=product.id,
                    weight=w['weight'],
                    price=Decimal(str(round(price_value, 2))),
                    stock_quantity=stock,
                    is_active=True,
                    sort_order=w['order']
                )
                db.session.add(price_entry)
                print(f"      - {w['weight']}: R$ {price_value:.2f} (Estoque: {stock})")
    
    # Salvar todas as alterações
    db.session.commit()
    print("\n✅ Todos os produtos foram atualizados com sucesso!")
    
    # Verificar um produto específico
    print("\n🔍 Verificando Café Catuaí Vermelho:")
    catuai = Product.query.filter(Product.name.ilike('%catuaí vermelho%')).first()
    if catuai:
        print(f"   Nome: {catuai.name}")
        print(f"   Preço: R$ {catuai.price}")
        print(f"   Preço promocional: R$ {catuai.promotional_price}")
        print(f"   Estoque: {catuai.stock_quantity}")
        print(f"   Em estoque: {catuai.in_stock}")
        
        print("\n   Preços por peso:")
        prices = ProductPrice.query.filter_by(product_id=catuai.id).order_by(ProductPrice.sort_order).all()
        for p in prices:
            print(f"   - {p.weight}: R$ {p.price} (Estoque: {p.stock_quantity})")