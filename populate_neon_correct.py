#!/usr/bin/env python3
"""
Script para popular o banco Neon com a estrutura correta
"""
import psycopg2
from psycopg2.extras import RealDictCursor
import uuid
from datetime import datetime

def populate_neon_database():
    """Popular banco Neon com dados de exemplo"""
    
    neon_url = "postgresql://neondb_owner:npg_KY9nZJfFBi8x@ep-little-leaf-adoi6jjz-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require"
    
    try:
        print("🔗 Conectando ao banco Neon...")
        conn = psycopg2.connect(neon_url)
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        
        print("✅ Conectado ao banco Neon!")
        
        # Inserir categorias
        categories = [
            {
                "id": str(uuid.uuid4()),
                "name": "Cafés Especiais",
                "slug": "cafes-especiais",
                "description": "Cafés especiais de alta qualidade com notas únicas",
                "is_active": True,
                "created_at": datetime.now()
            },
            {
                "id": str(uuid.uuid4()),
                "name": "Cafés Premium",
                "slug": "cafes-premium", 
                "description": "Cafés premium selecionados com sabor excepcional",
                "is_active": True,
                "created_at": datetime.now()
            },
            {
                "id": str(uuid.uuid4()),
                "name": "Blends Gourmet",
                "slug": "blends-gourmet",
                "description": "Blends gourmet exclusivos criados pelos nossos mestres",
                "is_active": True,
                "created_at": datetime.now()
            }
        ]
        
        category_ids = {}
        for cat in categories:
            cursor.execute("""
                INSERT INTO product_categories (id, name, slug, description, is_active, created_at)
                VALUES (%(id)s, %(name)s, %(slug)s, %(description)s, %(is_active)s, %(created_at)s)
                ON CONFLICT (slug) DO NOTHING
            """, cat)
            category_ids[cat['name']] = cat['id']
        
        print("✅ Categorias inseridas!")
        
        # Inserir produtos
        products = [
            {
                "id": str(uuid.uuid4()),
                "name": "Café Especial Bourbon",
                "slug": "cafe-especial-bourbon",
                "description": "Café especial com notas de chocolate e caramelo, cultivado em Minas Gerais",
                "short_description": "Café especial com notas de chocolate",
                "sku": "CEB-250",
                "category_id": category_ids["Cafés Especiais"],
                "category": "Cafés Especiais",
                "price": 28.90,
                "stock_quantity": 100,
                "origin": "Minas Gerais",
                "roast_level": "Médio",
                "weight": 250,
                "is_active": True,
                "is_featured": True,
                "requires_shipping": True,
                "created_at": datetime.now()
            },
            {
                "id": str(uuid.uuid4()),
                "name": "Café Premium Arábica",
                "slug": "cafe-premium-arabica",
                "description": "Café premium com sabor suave e aroma intenso, selecionado especialmente",
                "short_description": "Café premium com aroma intenso",
                "sku": "CPA-500",
                "category_id": category_ids["Cafés Premium"],
                "category": "Cafés Premium",
                "price": 32.50,
                "stock_quantity": 75,
                "origin": "São Paulo",
                "roast_level": "Escuro",
                "weight": 500,
                "is_active": True,
                "is_featured": True,
                "requires_shipping": True,
                "created_at": datetime.now()
            },
            {
                "id": str(uuid.uuid4()),
                "name": "Blend Gourmet Mestres",
                "slug": "blend-gourmet-mestres",
                "description": "Blend especial criado pelos nossos mestres torrefadores",
                "short_description": "Blend exclusivo dos mestres",
                "sku": "BGM-250",
                "category_id": category_ids["Blends Gourmet"],
                "category": "Blends Gourmet",
                "price": 24.90,
                "stock_quantity": 120,
                "origin": "Bahia",
                "roast_level": "Claro",
                "weight": 250,
                "is_active": True,
                "is_featured": False,
                "requires_shipping": True,
                "created_at": datetime.now()
            },
            {
                "id": str(uuid.uuid4()),
                "name": "Café Expresso Italiano",
                "slug": "cafe-expresso-italiano",
                "description": "Café expresso com sabor intenso e cremoso, perfeito para espresso",
                "short_description": "Café expresso cremoso",
                "sku": "CEI-250",
                "category_id": category_ids["Cafés Especiais"],
                "category": "Cafés Especiais",
                "price": 26.90,
                "stock_quantity": 80,
                "origin": "Espírito Santo",
                "roast_level": "Escuro",
                "weight": 250,
                "is_active": True,
                "is_featured": False,
                "requires_shipping": True,
                "created_at": datetime.now()
            },
            {
                "id": str(uuid.uuid4()),
                "name": "Café Descafeinado Premium",
                "slug": "cafe-descafeinado-premium",
                "description": "Café descafeinado mantendo o sabor original e aroma",
                "short_description": "Café descafeinado com sabor original",
                "sku": "CDP-250",
                "category_id": category_ids["Cafés Premium"],
                "category": "Cafés Premium",
                "price": 22.90,
                "stock_quantity": 60,
                "origin": "Paraná",
                "roast_level": "Médio",
                "weight": 250,
                "is_active": True,
                "is_featured": False,
                "requires_shipping": True,
                "created_at": datetime.now()
            }
        ]
        
        for product in products:
            cursor.execute("""
                INSERT INTO products (
                    id, name, slug, description, short_description, sku, category_id, category,
                    price, stock_quantity, origin, roast_level, weight, is_active, is_featured,
                    requires_shipping, created_at
                ) VALUES (
                    %(id)s, %(name)s, %(slug)s, %(description)s, %(short_description)s, %(sku)s,
                    %(category_id)s, %(category)s, %(price)s, %(stock_quantity)s, %(origin)s,
                    %(roast_level)s, %(weight)s, %(is_active)s, %(is_featured)s, %(requires_shipping)s,
                    %(created_at)s
                ) ON CONFLICT (slug) DO NOTHING
            """, product)
        
        print("✅ Produtos inseridos!")
        
        # Verificar dados inseridos
        cursor.execute("SELECT COUNT(*) as total FROM product_categories")
        total_categories = cursor.fetchone()['total']
        
        cursor.execute("SELECT COUNT(*) as total FROM products")
        total_products = cursor.fetchone()['total']
        
        print(f"📊 Total de categorias: {total_categories}")
        print(f"📊 Total de produtos: {total_products}")
        
        # Commit das mudanças
        conn.commit()
        print("✅ Dados salvos no banco!")
        
        return True
        
    except Exception as e:
        print(f"❌ Erro: {e}")
        return False
        
    finally:
        if 'conn' in locals():
            conn.close()
            print("🔒 Conexão fechada")

if __name__ == "__main__":
    success = populate_neon_database()
    if success:
        print("🎉 Banco populado com sucesso!")
    else:
        print("💥 Falha ao popular o banco")
