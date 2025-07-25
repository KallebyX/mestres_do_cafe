#!/usr/bin/env python3
"""
Script para popular preços por peso nos produtos existentes
Cria opções de 250g, 500g e 1kg para todos os produtos de café
"""

import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), 'src'))

from src.database import db
from src.app import create_app
from src.models.products import Product, ProductPrice

def populate_weight_prices():
    """Popular preços por peso para produtos existentes"""
    
    app = create_app()
    
    with app.app_context():
        try:
            print("🔄 Iniciando população de preços por peso...")
            
            # Buscar todos os produtos de café
            products = Product.query.filter(Product.is_active == True).all()
            
            if not products:
                print("❌ Nenhum produto encontrado!")
                return
                
            print(f"📦 Encontrados {len(products)} produtos")
            
            # Definir os pesos padrão com multiplicadores baseados no preço base
            weight_options = [
                {"weight": "250g", "multiplier": 0.25, "stock_multiplier": 0.8},  # 25% do preço base, mais estoque
                {"weight": "500g", "multiplier": 0.50, "stock_multiplier": 0.6},  # 50% do preço base
                {"weight": "1kg", "multiplier": 1.0, "stock_multiplier": 0.4},    # Preço base, menos estoque
            ]
            
            total_created = 0
            
            for product in products:
                print(f"\n🔍 Processando produto: {product.name}")
                
                # Verificar se já tem preços por peso
                existing_prices = ProductPrice.query.filter_by(
                    product_id=product.id,
                    is_active=True
                ).count()
                
                if existing_prices > 0:
                    print(f"   ⏭️  Produto já tem {existing_prices} preços configurados - pulando")
                    continue
                
                base_price = float(product.price)
                base_stock = product.stock_quantity or 100  # Fallback se não tiver estoque
                
                for weight_option in weight_options:
                    weight = weight_option["weight"]
                    multiplier = weight_option["multiplier"]
                    stock_multiplier = weight_option["stock_multiplier"]
                    
                    # Calcular preço proporcional
                    calculated_price = base_price * multiplier
                    
                    # Calcular estoque proporcional
                    calculated_stock = max(1, int(base_stock * stock_multiplier))
                    
                    # Criar ProductPrice
                    product_price = ProductPrice(
                        product_id=product.id,
                        weight=weight,
                        price=calculated_price,
                        stock_quantity=calculated_stock,
                        is_active=True
                    )
                    
                    db.session.add(product_price)
                    total_created += 1
                    
                    print(f"   ✅ {weight}: R$ {calculated_price:.2f} - Estoque: {calculated_stock}")
            
            # Commit das alterações
            db.session.commit()
            
            print(f"\n🎉 População concluída com sucesso!")
            print(f"📊 Total de preços por peso criados: {total_created}")
            print(f"🏪 Produtos processados: {len([p for p in products if ProductPrice.query.filter_by(product_id=p.id).count() > 0])}")
            
            # Mostrar resumo final
            print("\n📈 RESUMO FINAL:")
            all_prices = ProductPrice.query.filter_by(is_active=True).all()
            for weight in ["250g", "500g", "1kg"]:
                count = len([p for p in all_prices if p.weight == weight])
                print(f"   {weight}: {count} produtos")
                
        except Exception as e:
            print(f"❌ Erro durante população: {str(e)}")
            db.session.rollback()
            return False
        
        return True

if __name__ == "__main__":
    success = populate_weight_prices()
    if success:
        print("\n✅ Script executado com sucesso!")
    else:
        print("\n❌ Script falhou!")
        sys.exit(1)