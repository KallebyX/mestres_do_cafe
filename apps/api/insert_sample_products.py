#!/usr/bin/env python3
"""
Script para inserir produtos de exemplo no banco
"""
import psycopg2
import uuid
from datetime import datetime

# Configuração do banco
DB_CONFIG = {
    'host': 'localhost',
    'port': 5432,
    'database': 'mestres_cafe',
    'user': 'kalleby',
    'password': 'mestres123'
}

def insert_sample_products():
    """Insere produtos de exemplo no banco"""
    try:
        # Conectar ao banco
        conn = psycopg2.connect(**DB_CONFIG)
        cursor = conn.cursor()
        
        print("✅ Conectado ao banco de dados")
        
        # Primeiro, inserir uma categoria
        category_id = str(uuid.uuid4())
        cursor.execute("""
            INSERT INTO product_categories (id, name, slug, description, is_active, created_at)
            VALUES (%s, %s, %s, %s, %s, %s)
            ON CONFLICT (slug) DO NOTHING
        """, (category_id, 'Cafés Especiais', 'cafes-especiais', 'Cafés especiais de alta qualidade', True, datetime.utcnow()))
        
        print("✅ Categoria criada")
        
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
                'stock_quantity': 100
            },
            {
                'name': 'Arara 84+',
                'slug': 'arara-84',
                'description': 'Café com corpo encorpado e notas de chocolate',
                'price': 32.90,
                'origin': 'Serra do Caparaó - ES',
                'roast_level': 'Médio-escuro',
                'sca_score': 84,
                'stock_quantity': 75
            },
            {
                'name': 'Bourbon Amarelo 82+',
                'slug': 'bourbon-amarelo-82',
                'description': 'Café suave com notas florais e cítricas',
                'price': 27.90,
                'origin': 'Minas Gerais',
                'roast_level': 'Claro',
                'sca_score': 82,
                'stock_quantity': 120
            }
        ]
        
        # Inserir produtos
        for product in sample_products:
            product_id = str(uuid.uuid4())
            cursor.execute("""
                INSERT INTO products (
                    id, name, slug, description, price, category_id, 
                    origin, roast_level, sca_score, stock_quantity,
                    is_active, is_featured, created_at
                ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                ON CONFLICT (slug) DO NOTHING
            """, (
                product_id, product['name'], product['slug'], product['description'],
                product['price'], category_id, product['origin'], product['roast_level'],
                product['sca_score'], product['stock_quantity'], True, True, datetime.utcnow()
            ))
            print(f"✅ Produto '{product['name']}' inserido")
        
        # Commit das alterações
        conn.commit()
        print("✅ Todos os produtos inseridos com sucesso!")
        
        # Verificar se foram inseridos
        cursor.execute("SELECT COUNT(*) FROM products")
        count = cursor.fetchone()[0]
        print(f"📊 Total de produtos no banco: {count}")
        
        cursor.close()
        conn.close()
        
    except Exception as e:
        print(f"❌ Erro: {e}")
        if 'conn' in locals():
            conn.rollback()
            conn.close()

if __name__ == "__main__":
    insert_sample_products()
