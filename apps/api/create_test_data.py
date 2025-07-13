#!/usr/bin/env python3
"""
Script para popular o banco de dados com dados de teste
Mestres do Café Enterprise
"""

import hashlib
import os
import secrets
import sys
import bcrypt
from datetime import datetime, timedelta

# Adicionar o diretório src ao path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "src"))

from src.app import create_app
from src.database import db
from src.models.auth import User
from src.models.orders import Cart, CartItem, Order, OrderItem
from src.models.products import Product, ProductCategory
from src.models.wishlist import Wishlist, WishlistItem


def hash_password(password):
    """Hash password using bcrypt"""
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')


def create_categories():
    """Criar categorias de produtos"""
    categories_data = [
        {
            "name": "Café em Grãos",
            "slug": "cafe-em-graos",
            "description": "Grãos de café frescos e torrados",
            "image_url": "/images/categories/graos.jpg",
            "is_active": True,
        },
        {
            "name": "Café Moído",
            "slug": "cafe-moido",
            "description": "Café moído na medida certa",
            "image_url": "/images/categories/moido.jpg",
            "is_active": True,
        },
        {
            "name": "Café Especial",
            "slug": "cafe-especial",
            "description": "Cafés especiais premium",
            "image_url": "/images/categories/especial.jpg",
            "is_active": True,
        },
        {
            "name": "Café Orgânico",
            "slug": "cafe-organico",
            "description": "Cafés orgânicos certificados",
            "image_url": "/images/categories/organico.jpg",
            "is_active": True,
        },
        {
            "name": "Acessórios",
            "slug": "acessorios",
            "description": "Acessórios para café",
            "image_url": "/images/categories/acessorios.jpg",
            "is_active": True,
        },
    ]

    categories = []
    for cat_data in categories_data:
        # Verificar se categoria já existe
        existing_category = ProductCategory.query.filter_by(
            slug=cat_data["slug"]
        ).first()
        if existing_category:
            categories.append(existing_category)
            continue

        category = ProductCategory(
            name=cat_data["name"],
            slug=cat_data["slug"],
            description=cat_data["description"],
            image_url=cat_data["image_url"],
            is_active=cat_data["is_active"],
            created_at=datetime.utcnow(),
        )
        db.session.add(category)
        try:
            db.session.commit()
            categories.append(category)
        except Exception as e:
            db.session.rollback()
            print(f"Erro ao criar categoria {cat_data['name']}: {e}")
            # Tentar buscar novamente após o erro
            existing_category = ProductCategory.query.filter_by(
                slug=cat_data["slug"]
            ).first()
            if existing_category:
                categories.append(existing_category)

    print(f"✅ Criadas/encontradas {len(categories)} categorias")
    return categories


def create_products(categories):
    """Criar produtos de teste"""
    products_data = [
        {
            "name": "Café Bourbon Santos Premium",
            "slug": "cafe-bourbon-santos-premium",
            "description": "Café especial da região de Santos, com notas de chocolate e caramelo",
            "short_description": "Café premium com notas de chocolate",
            "price": 45.90,
            "sale_price": 39.90,
            "cost_price": 25.00,
            "sku": "CBS001",
            "stock": 100,
            "min_stock": 10,
            "weight": 500,
            "category_id": 0,  # Café em Grãos
            "is_featured": True,
            "is_active": True,
            "roast_level": "Médio",
            "origin": "Brasil - Santos",
            "processing": "Via Seca",
            "altitude": "800-1200m",
            "harvest": "2024",
            "tasting_notes": "Chocolate, Caramelo, Nozes",
        },
        {
            "name": "Café Mogiana Especial",
            "slug": "cafe-mogiana-especial",
            "description": "Café da região da Mogiana, conhecido por sua doçura natural",
            "short_description": "Café doce da Mogiana",
            "price": 52.90,
            "sale_price": None,
            "cost_price": 30.00,
            "sku": "CME002",
            "stock": 75,
            "min_stock": 10,
            "weight": 500,
            "category_id": 2,  # Café Especial
            "is_featured": True,
            "is_active": True,
            "roast_level": "Médio Claro",
            "origin": "Brasil - Mogiana",
            "processing": "Cereja Descascado",
            "altitude": "900-1400m",
            "harvest": "2024",
            "tasting_notes": "Açúcar Mascavo, Frutas Vermelhas, Mel",
        },
        {
            "name": "Café Orgânico Cerrado",
            "slug": "cafe-organico-cerrado",
            "description": "Café orgânico certificado do Cerrado Mineiro",
            "short_description": "Café orgânico certificado",
            "price": 48.90,
            "sale_price": 42.90,
            "cost_price": 28.00,
            "sku": "COC003",
            "stock": 50,
            "min_stock": 5,
            "weight": 500,
            "category_id": 3,  # Café Orgânico
            "is_featured": False,
            "is_active": True,
            "roast_level": "Médio",
            "origin": "Brasil - Cerrado",
            "processing": "Via Seca",
            "altitude": "800-1200m",
            "harvest": "2024",
            "tasting_notes": "Chocolate Amargo, Amendoas, Cítrico",
        },
        {
            "name": "Café Moído Tradicional",
            "slug": "cafe-moido-tradicional",
            "description": "Blend tradicional moído, ideal para o dia a dia",
            "short_description": "Blend tradicional moído",
            "price": 35.90,
            "sale_price": None,
            "cost_price": 20.00,
            "sku": "CMT004",
            "stock": 200,
            "min_stock": 20,
            "weight": 500,
            "category_id": 1,  # Café Moído
            "is_featured": False,
            "is_active": True,
            "roast_level": "Médio Escuro",
            "origin": "Brasil - Blend",
            "processing": "Misto",
            "altitude": "600-1000m",
            "harvest": "2024",
            "tasting_notes": "Chocolate, Castanhas, Corpo Encorpado",
        },
        {
            "name": "Café Descafeinado Premium",
            "slug": "cafe-descafeinado-premium",
            "description": "Café descafeinado por processo natural, mantendo o sabor",
            "short_description": "Café sem cafeína",
            "price": 55.90,
            "sale_price": None,
            "cost_price": 35.00,
            "sku": "CDP005",
            "stock": 30,
            "min_stock": 5,
            "weight": 500,
            "category_id": 2,  # Café Especial
            "is_featured": False,
            "is_active": True,
            "roast_level": "Médio",
            "origin": "Brasil - Minas Gerais",
            "processing": "Descafeinação Natural",
            "altitude": "900-1300m",
            "harvest": "2024",
            "tasting_notes": "Doce, Suave, Corpo Médio",
        },
        {
            "name": "Moedor de Café Manual",
            "slug": "moedor-cafe-manual",
            "description": "Moedor manual de café com lâminas em cerâmica",
            "short_description": "Moedor manual premium",
            "price": 89.90,
            "sale_price": 79.90,
            "cost_price": 45.00,
            "sku": "MCM006",
            "stock": 25,
            "min_stock": 5,
            "weight": 800,
            "category_id": 4,  # Acessórios
            "is_featured": True,
            "is_active": True,
            "roast_level": None,
            "origin": None,
            "processing": None,
            "altitude": None,
            "harvest": None,
            "tasting_notes": None,
        },
        {
            "name": "Xícara de Porcelana Premium",
            "slug": "xicara-porcelana-premium",
            "description": "Xícara de porcelana fina para degustação",
            "short_description": "Xícara premium",
            "price": 24.90,
            "sale_price": None,
            "cost_price": 12.00,
            "sku": "XPP007",
            "stock": 40,
            "min_stock": 10,
            "weight": 200,
            "category_id": 4,  # Acessórios
            "is_featured": False,
            "is_active": True,
            "roast_level": None,
            "origin": None,
            "processing": None,
            "altitude": None,
            "harvest": None,
            "tasting_notes": None,
        },
        {
            "name": "Café Geisha Premium",
            "slug": "cafe-geisha-premium",
            "description": "Café Geisha raro e exclusivo, notas florais únicas",
            "short_description": "Café raro Geisha",
            "price": 120.90,
            "sale_price": None,
            "cost_price": 70.00,
            "sku": "CGP008",
            "stock": 15,
            "min_stock": 2,
            "weight": 250,
            "category_id": 2,  # Café Especial
            "is_featured": True,
            "is_active": True,
            "roast_level": "Claro",
            "origin": "Panamá",
            "processing": "Lavado",
            "altitude": "1500-1700m",
            "harvest": "2024",
            "tasting_notes": "Flores, Bergamota, Chá Branco, Jasmim",
        },
    ]

    products = []
    for prod_data in products_data:
        product = Product(
            name=prod_data["name"],
            slug=prod_data["slug"],
            description=prod_data["description"],
            price=prod_data["price"],
            weight=prod_data["weight"],
            category_id=categories[prod_data["category_id"]].id,
            is_featured=prod_data["is_featured"],
            is_active=prod_data["is_active"],
            origin=prod_data["origin"],
            stock_quantity=prod_data["stock"],
            sca_score=85,  # Pontuação padrão
            flavor_notes=prod_data["tasting_notes"],
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow(),
        )
        db.session.add(product)
        products.append(product)

    db.session.commit()
    print(f"✅ Criados {len(products)} produtos")
    return products


def create_users():
    """Criar usuários de teste"""
    users_data = [
        {
            "email": "admin@mestres.cafe",
            "password": "admin123",
            "name": "Administrador Mestres",
            "role": "admin",
            "is_active": True,
            "email_verified": True,
        },
        {
            "email": "cliente@mestres.cafe",
            "password": "cliente123",
            "name": "Cliente Teste",
            "role": "customer",
            "is_active": True,
            "email_verified": True,
        },
        {
            "email": "vendedor@mestres.cafe",
            "password": "vendedor123",
            "name": "Vendedor Teste",
            "role": "employee",
            "is_active": True,
            "email_verified": True,
        },
        {
            "email": "maria.silva@email.com",
            "password": "senha123",
            "name": "Maria Silva Santos",
            "role": "customer",
            "is_active": True,
            "email_verified": True,
        },
        {
            "email": "joao.santos@email.com",
            "password": "senha123",
            "name": "João Santos Oliveira",
            "role": "customer",
            "is_active": True,
            "email_verified": True,
        },
    ]

    users = []
    for user_data in users_data:
        user = User(
            email=user_data["email"],
            password_hash=hash_password(user_data["password"]),
            name=user_data["name"],
            role=user_data["role"],
            is_active=user_data["is_active"],
            email_verified=user_data["email_verified"],
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow(),
        )
        db.session.add(user)
        users.append(user)

    db.session.commit()
    print(f"✅ Criados {len(users)} usuários")
    return users


def create_carts_and_orders(users, products):
    """Criar carrinhos e pedidos de teste"""

    # Criar carrinho para cliente teste
    cliente = next((u for u in users if u.email == "cliente@mestres.cafe"), None)
    if cliente:
        cart = Cart(
            user_id=cliente.id,
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow(),
        )
        db.session.add(cart)
        db.session.commit()

        # Adicionar itens ao carrinho
        cart_items = [
            CartItem(
                cart_id=cart.id,
                product_id=products[0].id,  # Bourbon Santos
                quantity=2,
                created_at=datetime.utcnow(),
            ),
            CartItem(
                cart_id=cart.id,
                product_id=products[1].id,  # Mogiana
                quantity=1,
                created_at=datetime.utcnow(),
            ),
        ]

        for item in cart_items:
            db.session.add(item)

        db.session.commit()
        print(f"✅ Criado carrinho com {len(cart_items)} itens")

    # Criar alguns pedidos de exemplo
    maria = next((u for u in users if u.email == "maria.silva@email.com"), None)
    if maria:
        # Pedido 1 - Finalizado
        order1 = Order(
            user_id=maria.id,
            order_number=f"MC{datetime.now().strftime('%Y%m%d')}001",
            status="completed",
            subtotal=79.80,  # 2x Bourbon (39.90)
            total_amount=91.80,  # 2x Bourbon (39.90) + frete
            payment_status="paid",
            shipping_method="standard",
            shipping_address="Rua das Flores, 123 - São Paulo, SP - 01234-567",
            shipping_cost=12.00,
            created_at=datetime.utcnow() - timedelta(days=5),
            updated_at=datetime.utcnow() - timedelta(days=3),
        )
        db.session.add(order1)
        db.session.commit()

        # Itens do pedido 1
        order_item1 = OrderItem(
            order_id=order1.id,
            product_id=products[0].id,  # Bourbon Santos
            product_name="Bourbon Santos",
            quantity=2,
            unit_price=39.90,
            total_price=79.80,
        )
        db.session.add(order_item1)

        # Pedido 2 - Em processamento
        order2 = Order(
            user_id=maria.id,
            order_number=f"MC{datetime.now().strftime('%Y%m%d')}002",
            status="processing",
            subtotal=120.90,  # Geisha
            total_amount=135.90,  # Geisha + frete
            payment_status="paid",
            shipping_method="express",
            shipping_address="Rua das Flores, 123 - São Paulo, SP - 01234-567",
            shipping_cost=15.00,
            created_at=datetime.utcnow() - timedelta(days=1),
            updated_at=datetime.utcnow(),
        )
        db.session.add(order2)
        db.session.commit()

        # Itens do pedido 2
        order_item2 = OrderItem(
            order_id=order2.id,
            product_id=products[7].id,  # Geisha
            product_name="Geisha",
            quantity=1,
            unit_price=120.90,
            total_price=120.90,
        )
        db.session.add(order_item2)

        db.session.commit()
        print("✅ Criados 2 pedidos de exemplo")


def create_wishlists(users, products):
    """Criar wishlists de teste"""

    # Wishlist para Maria
    maria = next((u for u in users if u.email == "maria.silva@email.com"), None)
    if maria:
        wishlist = Wishlist(
            user_id=maria.id,
            name="Minha Lista de Desejos",
            is_public=False,
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow(),
        )
        db.session.add(wishlist)
        db.session.commit()

        # Itens da wishlist
        wishlist_items = [
            WishlistItem(
                wishlist_id=wishlist.id,
                product_id=products[7].id,  # Geisha
                created_at=datetime.utcnow(),
            ),
            WishlistItem(
                wishlist_id=wishlist.id,
                product_id=products[5].id,  # Moedor
                created_at=datetime.utcnow(),
            ),
        ]

        for item in wishlist_items:
            db.session.add(item)

        db.session.commit()
        print(f"✅ Criada wishlist com {len(wishlist_items)} itens")


def main():
    """Função principal"""
    app = create_app()

    with app.app_context():
        print("🚀 Iniciando criação de dados de teste...")
        print(f"🔧 Database: {app.config['SQLALCHEMY_DATABASE_URI']}")

        # Criar todas as tabelas
        print("🔧 Criando tabelas do banco de dados...")
        db.create_all()
        print("✅ Tabelas criadas com sucesso!")

        # Verificar se já existem dados
        existing_products = Product.query.count()
        existing_users = User.query.count()

        if existing_products > 0 or existing_users > 0:
            print(
                f"⚠️  Dados já existem: {existing_products} produtos, {existing_users} usuários"
            )
            response = input("Deseja limpar e recriar? (s/N): ")
            if response.lower() != "s":
                print("❌ Operação cancelada")
                return

            # Limpar dados existentes
            print("🧹 Limpando dados existentes...")
            db.session.query(WishlistItem).delete()
            db.session.query(Wishlist).delete()
            db.session.query(OrderItem).delete()
            db.session.query(Order).delete()
            db.session.query(CartItem).delete()
            db.session.query(Cart).delete()
            db.session.query(Product).delete()
            db.session.query(ProductCategory).delete()
            db.session.query(User).delete()
            db.session.commit()
            print("✅ Dados existentes limpos com sucesso!")

        # Criar dados
        print("\n📦 Criando dados de teste...")

        categories = create_categories()
        products = create_products(categories)
        users = create_users()
        create_carts_and_orders(users, products)
        create_wishlists(users, products)

        # Estatísticas finais
        print(f"\n📊 RESUMO DOS DADOS CRIADOS:")
        print(f"   👥 Usuários: {User.query.count()}")
        print(f"   📁 Categorias: {ProductCategory.query.count()}")
        print(f"   📦 Produtos: {Product.query.count()}")
        print(f"   🛒 Carrinhos: {Cart.query.count()}")
        print(f"   📋 Pedidos: {Order.query.count()}")
        print(f"   💝 Wishlists: {Wishlist.query.count()}")

        print(f"\n✅ Dados de teste criados com sucesso!")
        print(f"\n👤 CREDENCIAIS DE TESTE:")
        print(f"   🔐 Admin: admin@mestres.cafe / admin123")
        print(f"   👨‍💼 Cliente: cliente@mestres.cafe / cliente123")
        print(f"   🛍️  Vendedor: vendedor@mestres.cafe / vendedor123")
        print(f"   👩 Maria: maria.silva@email.com / senha123")
        print(f"   👨 João: joao.santos@email.com / senha123")


if __name__ == "__main__":
    main()
