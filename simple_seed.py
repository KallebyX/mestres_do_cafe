#!/usr/bin/env python3
"""
Script simples para popular o banco de dados
"""

import sqlite3
import hashlib
from datetime import datetime

def hash_password(password):
    return hashlib.sha256(password.encode()).hexdigest()

def main():
    # Conectar ao banco
    conn = sqlite3.connect('mestres_cafe.db')
    cursor = conn.cursor()
    
    print("🚀 Populando banco de dados...")
    
    # Limpar dados existentes se necessário
    try:
        cursor.execute("DELETE FROM products")
        cursor.execute("DELETE FROM users")
        cursor.execute("DELETE FROM categories")
        print("🧹 Dados antigos removidos")
    except Exception as e:
        print(f"ℹ️  Erro ao limpar (normal): {e}")
    
    # Inserir categorias
    categories = [
        (1, 'Café em Grãos', 'cafe-em-graos', 'Grãos de café frescos'),
        (2, 'Café Moído', 'cafe-moido', 'Café moído fresco'),
        (3, 'Café Especial', 'cafe-especial', 'Cafés especiais premium'),
        (4, 'Acessórios', 'acessorios', 'Acessórios para café')
    ]
    
    try:
        cursor.executemany(
            "INSERT INTO categories (id, name, slug, description) VALUES (?, ?, ?, ?)",
            categories
        )
        print(f"✅ Criadas {len(categories)} categorias")
    except Exception as e:
        print(f"❌ Erro nas categorias: {e}")
    
    # Inserir produtos
    products = [
        (1, 'Café Bourbon Santos Premium', 'cafe-bourbon-santos', 'Café especial da região de Santos', 45.90, 500, 1, 100, 1, 1),
        (2, 'Café Mogiana Especial', 'cafe-mogiana', 'Café da região da Mogiana', 52.90, 500, 3, 75, 1, 1),
        (3, 'Café Orgânico Cerrado', 'cafe-organico-cerrado', 'Café orgânico certificado', 48.90, 500, 1, 50, 0, 1),
        (4, 'Moedor Manual Premium', 'moedor-manual', 'Moedor manual com lâminas cerâmicas', 89.90, 800, 4, 25, 1, 1),
        (5, 'Xícara Porcelana', 'xicara-porcelana', 'Xícara de porcelana premium', 24.90, 200, 4, 40, 0, 1)
    ]
    
    try:
        cursor.executemany(
            "INSERT INTO products (id, name, slug, description, price, weight, category_id, stock_quantity, is_featured, is_active) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
            products
        )
        print(f"✅ Criados {len(products)} produtos")
    except Exception as e:
        print(f"❌ Erro nos produtos: {e}")
    
    # Inserir usuários
    users = [
        (1, 'admin@mestres.cafe', hash_password('admin123'), 'Administrador Mestres', 'admin', 1, 1),
        (2, 'cliente@mestres.cafe', hash_password('cliente123'), 'Cliente Teste', 'customer', 1, 1),
        (3, 'maria.silva@email.com', hash_password('senha123'), 'Maria Silva Santos', 'customer', 1, 1)
    ]
    
    try:
        cursor.executemany(
            "INSERT INTO users (id, email, password_hash, full_name, user_type, is_active, is_verified) VALUES (?, ?, ?, ?, ?, ?, ?)",
            users
        )
        print(f"✅ Criados {len(users)} usuários")
    except Exception as e:
        print(f"❌ Erro nos usuários: {e}")
    
    # Commit e fechar
    conn.commit()
    conn.close()
    
    print("\n📊 RESUMO:")
    print(f"   📁 Categorias: {len(categories)}")
    print(f"   📦 Produtos: {len(products)}")
    print(f"   👥 Usuários: {len(users)}")
    print("\n✅ Banco populado com sucesso!")
    print("\n🔐 CREDENCIAIS:")
    print("   Admin: admin@mestres.cafe / admin123")
    print("   Cliente: cliente@mestres.cafe / cliente123")
    print("   Maria: maria.silva@email.com / senha123")

if __name__ == "__main__":
    main()