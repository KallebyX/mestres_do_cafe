#!/usr/bin/env python3
"""
Script para popular o banco Neon diretamente
"""
import os
import psycopg2
from psycopg2.extras import RealDictCursor

def populate_neon_database():
    """Popular banco Neon com dados de exemplo"""
    
    # URL do banco Neon (você precisa configurar esta variável)
    neon_url = "postgresql://neondb_owner:npg_KY9nZJfFBi8x@ep-little-leaf-adoi6jjz-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require"
    
    try:
        print("🔗 Conectando ao banco Neon...")
        conn = psycopg2.connect(neon_url)
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        
        print("✅ Conectado ao banco Neon!")
        
        # Verificar se as tabelas existem
        cursor.execute("""
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public'
        """)
        tables = cursor.fetchall()
        print(f"📊 Tabelas encontradas: {[t['table_name'] for t in tables]}")
        
        # Criar tabelas se não existirem
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS product_categories (
                id SERIAL PRIMARY KEY,
                name VARCHAR(100) NOT NULL UNIQUE,
                description TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)
        
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS products (
                id SERIAL PRIMARY KEY,
                name VARCHAR(200) NOT NULL,
                description TEXT,
                price DECIMAL(10,2) NOT NULL,
                category_id INTEGER REFERENCES product_categories(id),
                weight VARCHAR(50),
                origin VARCHAR(100),
                roast_level VARCHAR(50),
                stock_quantity INTEGER DEFAULT 0,
                is_active BOOLEAN DEFAULT true,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)
        
        print("✅ Tabelas criadas/verificadas!")
        
        # Inserir categorias
        categories = [
            ("Especiais", "Cafés especiais de alta qualidade"),
            ("Premium", "Cafés premium selecionados"),
            ("Gourmet", "Blends gourmet exclusivos")
        ]
        
        for cat_name, cat_desc in categories:
            cursor.execute("""
                INSERT INTO product_categories (name, description) 
                VALUES (%s, %s) 
                ON CONFLICT DO NOTHING
            """, (cat_name, cat_desc))
        
        print("✅ Categorias inseridas!")
        
        # Inserir produtos
        products = [
            ("Café Especial Bourbon", "Café especial com notas de chocolate e caramelo", 28.90, "Especiais", "250g", "Minas Gerais", "Médio"),
            ("Café Premium Arábica", "Café premium com sabor suave e aroma intenso", 32.50, "Premium", "500g", "São Paulo", "Escuro"),
            ("Café Gourmet Blend", "Blend especial de cafés selecionados", 24.90, "Gourmet", "250g", "Bahia", "Claro"),
            ("Café Expresso Italiano", "Café expresso com sabor intenso e cremoso", 26.90, "Especiais", "250g", "Espírito Santo", "Escuro"),
            ("Café Descafeinado", "Café descafeinado mantendo o sabor original", 22.90, "Premium", "250g", "Paraná", "Médio")
        ]
        
        for name, desc, price, category, weight, origin, roast in products:
            cursor.execute("""
                INSERT INTO products (name, description, price, category_id, weight, origin, roast_level, stock_quantity)
                SELECT %s, %s, %s, pc.id, %s, %s, %s, 100
                FROM product_categories pc 
                WHERE pc.name = %s
            """, (name, desc, price, weight, origin, roast, category))
        
        print("✅ Produtos inseridos!")
        
        # Verificar dados inseridos
        cursor.execute("SELECT COUNT(*) as total FROM products")
        total_products = cursor.fetchone()['total']
        
        cursor.execute("SELECT COUNT(*) as total FROM product_categories")
        total_categories = cursor.fetchone()['total']
        
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
