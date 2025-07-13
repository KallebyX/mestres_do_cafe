#!/usr/bin/env python3
"""
Script para popular o banco de dados com dados de teste
"""

import json
import os
import random
import sys
import uuid
from datetime import datetime, timedelta
from decimal import Decimal

# Configurar ambiente
os.environ["FLASK_ENV"] = "development"

# Adicionar o diretório apps/api ao Python path
sys.path.insert(0, os.path.join(os.getcwd(), "apps/api"))

try:
    from src.app import create_app
    from src.database import db

    # Importar modelos
    from src.models.auth import User, UserSession
    from src.models.blog import BlogCategory, BlogPost, BlogTag
    from src.models.coupons import Coupon
    from src.models.customers import Customer
    from src.models.gamification import Achievement, Badge, UserAchievement, UserBadge
    from src.models.newsletter import Newsletter, NewsletterSubscriber
    from src.models.notifications import Notification, NotificationTemplate
    from src.models.orders import Cart, CartItem, Order, OrderItem
    from src.models.products import Product, ProductCategory, ProductVariant
    from src.models.wishlist import Wishlist, WishlistItem

    def seed_database():
        """Popular o banco com dados de teste"""
        app = create_app()

        with app.app_context():
            print("🌱 Iniciando seed do banco de dados...")

            # Limpar dados existentes
            print("🧹 Limpando dados existentes...")
            db.session.query(WishlistItem).delete()
            db.session.query(Wishlist).delete()
            db.session.query(Notification).delete()
            db.session.query(NewsletterSubscriber).delete()
            db.session.query(BlogPost).delete()
            db.session.query(BlogCategory).delete()
            db.session.query(Achievement).delete()
            db.session.query(Badge).delete()
            db.session.query(CartItem).delete()
            db.session.query(Cart).delete()
            db.session.query(Order).delete()
            db.session.query(Coupon).delete()
            db.session.query(ProductVariant).delete()
            db.session.query(Product).delete()
            db.session.query(ProductCategory).delete()
            db.session.query(Customer).delete()
            db.session.query(User).delete()
            db.session.commit()
            print("✅ Dados limpos com sucesso")

            # 1. Criar usuários
            print("👥 Criando usuários...")
            users = []
            for i in range(1, 6):
                user = User(
                    email=f"user{i}@mestrescafe.com",
                    name=f"Usuário {i}",
                    phone=f"(11) 9999-{i:04d}",
                    role="customer" if i <= 4 else "admin",
                    points=random.randint(0, 1000),
                    level=random.choice(["bronze", "silver", "gold", "platinum"]),
                    total_spent=Decimal(str(random.randint(0, 5000))),
                    newsletter_subscribed=random.choice([True, False]),
                    is_active=True,
                    email_verified=True,
                )
                users.append(user)
                db.session.add(user)

            db.session.commit()
            print(f"✅ {len(users)} usuários criados")

            # 2. Criar clientes
            print("🏢 Criando clientes...")
            customers = []
            for i, user in enumerate(users[:3]):
                customer = Customer(
                    user_id=user.id,
                    name=user.name,
                    email=user.email,
                    phone=user.phone,
                    cpf_cnpj=f"123.456.789-{i:02d}",
                    birth_date=datetime.now()
                    - timedelta(days=random.randint(6570, 25550)),
                    customer_type="individual",
                    status="active",
                )
                customers.append(customer)
                db.session.add(customer)

            db.session.commit()
            print(f"✅ {len(customers)} clientes criados")

            # 3. Criar categorias de produtos
            print("📁 Criando categorias de produtos...")
            categories = [
                ProductCategory(
                    name="Cafés Especiais",
                    slug="cafes-especiais",
                    description="Cafés selecionados",
                    is_active=True,
                ),
                ProductCategory(
                    name="Equipamentos",
                    slug="equipamentos",
                    description="Equipamentos para café",
                    is_active=True,
                ),
                ProductCategory(
                    name="Acessórios",
                    slug="acessorios",
                    description="Acessórios diversos",
                    is_active=True,
                ),
                ProductCategory(
                    name="Cursos",
                    slug="cursos",
                    description="Cursos de barista",
                    is_active=True,
                ),
            ]
            for cat in categories:
                db.session.add(cat)

            db.session.commit()
            print(f"✅ {len(categories)} categorias criadas")

            # 4. Criar produtos
            print("☕ Criando produtos...")
            products = []
            coffee_names = [
                "Café Bourbon",
                "Café Catuaí",
                "Café Mundo Novo",
                "Café Icatu",
                "Café Acauã",
            ]
            origins = ["Brasil", "Colômbia", "Peru", "Honduras", "Guatemala"]
            processes = ["Natural", "Cereja Descascado", "Honey", "Lavado"]
            roast_levels = ["Claro", "Médio", "Escuro"]

            for i, name in enumerate(coffee_names):
                product = Product(
                    name=name,
                    slug=f"cafe-{i+1:03d}",
                    description=f"Delicioso {name.lower()} com notas especiais",
                    price=Decimal(str(random.randint(25, 80))),
                    category_id=categories[0].id,
                    sku=f"CAF{i+1:03d}",
                    origin=random.choice(origins),
                    process=random.choice(processes),
                    roast_level=random.choice(roast_levels),
                    sca_score=random.randint(80, 95),
                    acidity=random.randint(1, 5),
                    sweetness=random.randint(1, 5),
                    body=random.randint(1, 5),
                    flavor_notes=["Chocolate", "Caramelo", "Frutas vermelhas"],
                    stock_quantity=random.randint(10, 100),
                    weight=Decimal("0.5"),
                    is_active=True,
                    is_featured=random.choice([True, False]),
                )
                products.append(product)
                db.session.add(product)

            # Equipamentos
            equipment_names = [
                "Moedor Manual",
                "Prensa Francesa",
                "Coador V60",
                "Chaleira Elétrica",
            ]
            for i, name in enumerate(equipment_names):
                product = Product(
                    name=name,
                    slug=f"equipamento-{i+1:03d}",
                    description=f"Excelente {name.lower()} para preparar café",
                    price=Decimal(str(random.randint(50, 300))),
                    category_id=categories[1].id,
                    sku=f"EQP{i+1:03d}",
                    stock_quantity=random.randint(5, 50),
                    weight=Decimal("1.0"),
                    is_active=True,
                    is_featured=random.choice([True, False]),
                )
                products.append(product)
                db.session.add(product)

            db.session.commit()
            print(f"✅ {len(products)} produtos criados")

            # 5. Criar variantes dos produtos
            print("🔄 Criando variantes de produtos...")
            variants = []
            for product in products[:3]:  # Apenas para alguns produtos
                for size in ["250g", "500g", "1kg"]:
                    # Converter tamanho para peso em kg
                    if size == "250g":
                        weight_kg = Decimal("0.250")
                        multiplier = Decimal("1")
                    elif size == "500g":
                        weight_kg = Decimal("0.500")
                        multiplier = Decimal("1.8")
                    else:  # 1kg
                        weight_kg = Decimal("1.000")
                        multiplier = Decimal("3.5")

                    variant = ProductVariant(
                        product_id=product.id,
                        name=f"{product.name} - {size}",
                        sku=f"{product.sku}-{size}",
                        price=product.price * multiplier,
                        stock_quantity=random.randint(10, 50),
                        weight=weight_kg,
                        attributes={"size": size},
                        is_active=True,
                        sort_order=0,
                    )
                    variants.append(variant)
                    db.session.add(variant)

            db.session.commit()
            print(f"✅ {len(variants)} variantes criadas")

            # 6. Criar cupons
            print("🎫 Criando cupons...")
            coupons = [
                Coupon(
                    code="BEMVINDO10",
                    type="percentage",
                    value=Decimal("10.00"),
                    minimum_amount=Decimal("50.00"),
                    usage_limit=1000,
                    is_active=True,
                    end_date=(datetime.now() + timedelta(days=90)).date(),
                ),
                Coupon(
                    code="FRETE15",
                    type="fixed_amount",
                    value=Decimal("15.00"),
                    minimum_amount=Decimal("100.00"),
                    usage_limit=500,
                    is_active=True,
                    end_date=(datetime.now() + timedelta(days=30)).date(),
                ),
            ]

            for coupon in coupons:
                db.session.add(coupon)

            db.session.commit()
            print(f"✅ {len(coupons)} cupons criados")

            # 7. Criar carrinhos
            print("🛒 Criando carrinhos...")
            carts = []
            for user in users[:3]:
                cart = Cart(user_id=user.id)
                carts.append(cart)
                db.session.add(cart)

            db.session.commit()
            print(f"✅ {len(carts)} carrinhos criados")

            # 8. Criar itens do carrinho
            print("🛍️ Criando itens do carrinho...")
            cart_items = []
            for cart in carts:
                for _ in range(random.randint(1, 3)):
                    product = random.choice(products)
                    item = CartItem(
                        user_id=cart.user_id,
                        product_id=product.id,
                        quantity=random.randint(1, 3),
                    )
                    cart_items.append(item)
                    db.session.add(item)

            db.session.commit()
            print(f"✅ {len(cart_items)} itens do carrinho criados")

            # 9. Criar pedidos
            print("📦 Criando pedidos...")
            orders = []
            for i, customer in enumerate(customers):
                order = Order(
                    order_number=f"ORD{datetime.now().year}{i+1:05d}",
                    customer_id=customer.id,
                    user_id=customer.user_id,
                    status=random.choice(
                        ["pending", "processing", "shipped", "delivered"]
                    ),
                    payment_status=random.choice(["paid", "pending"]),
                    subtotal=Decimal(str(random.randint(50, 300))),
                    shipping_cost=Decimal("15.00"),
                    total_amount=Decimal(str(random.randint(65, 315))),
                    shipping_address=json.dumps(
                        {
                            "street": f"Rua {random.randint(1, 100)}",
                            "city": "São Paulo",
                            "state": "SP",
                            "zipcode": "01234-567",
                        }
                    ),
                    shipping_method="PAC",
                )
                orders.append(order)
                db.session.add(order)

            db.session.commit()
            print(f"✅ {len(orders)} pedidos criados")

            # 10. Criar badges e achievements
            print("🏆 Criando badges e achievements...")
            badges = [
                Badge(
                    name="Primeiro Pedido",
                    description="Realizou seu primeiro pedido",
                    badge_type="milestone",
                    points_required=0,
                    is_active=True,
                ),
                Badge(
                    name="Comprador Bronze",
                    description="Gastou mais de R$ 100",
                    badge_type="spending",
                    points_required=100,
                    is_active=True,
                ),
                Badge(
                    name="Amante do Café",
                    description="Comprou mais de 5 cafés",
                    badge_type="product",
                    points_required=200,
                    is_active=True,
                ),
            ]

            for badge in badges:
                db.session.add(badge)

            achievements = [
                Achievement(
                    name="Primeira Compra",
                    description="Parabéns pela primeira compra!",
                    points_reward=50,
                    is_active=True,
                ),
                Achievement(
                    name="Cliente Fiel",
                    description="Realizou 5 compras",
                    points_reward=100,
                    is_active=True,
                ),
            ]

            for achievement in achievements:
                db.session.add(achievement)

            db.session.commit()
            print(f"✅ {len(badges)} badges e {len(achievements)} achievements criados")

            # 11. Criar categorias do blog
            print("📝 Criando categorias do blog...")
            blog_categories = [
                BlogCategory(name="Dicas de Café", slug="dicas-cafe", is_active=True),
                BlogCategory(name="Receitas", slug="receitas", is_active=True),
                BlogCategory(name="Notícias", slug="noticias", is_active=True),
            ]

            for cat in blog_categories:
                db.session.add(cat)

            db.session.commit()
            print(f"✅ {len(blog_categories)} categorias do blog criadas")

            # 12. Criar posts do blog
            print("📰 Criando posts do blog...")
            blog_posts = [
                BlogPost(
                    title="Como preparar o café perfeito",
                    slug="como-preparar-cafe-perfeito",
                    content="Aprenda as técnicas essenciais para preparar um café delicioso...",
                    excerpt="Dicas importantes para o café perfeito",
                    category="Dicas de Café",
                    author_id=users[4].id,  # Admin user
                    is_published=True,
                    is_featured=True,
                    published_at=datetime.now() - timedelta(days=5),
                ),
                BlogPost(
                    title="Receita: Café Gelado de Verão",
                    slug="receita-cafe-gelado-verao",
                    content="Uma receita refrescante para os dias quentes...",
                    excerpt="Receita deliciosa para o verão",
                    category="Receitas",
                    author_id=users[4].id,
                    is_published=True,
                    is_featured=False,
                    published_at=datetime.now() - timedelta(days=2),
                ),
            ]

            for post in blog_posts:
                db.session.add(post)

            db.session.commit()
            print(f"✅ {len(blog_posts)} posts do blog criados")

            # 13. Criar assinantes da newsletter
            print("📧 Criando assinantes da newsletter...")
            newsletter_subscribers = []
            for i in range(10):
                subscriber = NewsletterSubscriber(
                    email=f"subscriber{i+1}@exemplo.com",
                    name=f"Assinante {i+1}",
                    is_subscribed=True,
                    source="website",
                )
                newsletter_subscribers.append(subscriber)
                db.session.add(subscriber)

            db.session.commit()
            print(f"✅ {len(newsletter_subscribers)} assinantes da newsletter criados")

            # 14. Criar notificações
            print("🔔 Criando notificações...")
            notifications = []
            for user in users:
                notification = Notification(
                    user_id=user.id,
                    title="Bem-vindo aos Mestres do Café!",
                    message="Obrigado por se juntar à nossa comunidade",
                    type="system",
                    channels=["in_app"],
                    is_read=random.choice([True, False]),
                )
                notifications.append(notification)
                db.session.add(notification)

            db.session.commit()
            print(f"✅ {len(notifications)} notificações criadas")

            # 15. Criar wishlists
            print("❤️ Criando wishlists...")
            wishlists = []
            for user in users[:3]:
                wishlist = Wishlist(
                    user_id=user.id,
                    name="Minha Lista de Desejos",
                    is_public=random.choice([True, False]),
                )
                wishlists.append(wishlist)
                db.session.add(wishlist)

            db.session.commit()

            # Criar itens da wishlist
            wishlist_items = []
            for wishlist in wishlists:
                for _ in range(random.randint(1, 3)):
                    product = random.choice(products)
                    item = WishlistItem(wishlist_id=wishlist.id, product_id=product.id)
                    wishlist_items.append(item)
                    db.session.add(item)

            db.session.commit()
            print(
                f"✅ {len(wishlists)} wishlists e {len(wishlist_items)} itens criados"
            )

            print("\n🎉 Seed do banco de dados concluído com sucesso!")
            print(f"📊 Resumo:")
            print(f"   - {len(users)} usuários")
            print(f"   - {len(customers)} clientes")
            print(f"   - {len(categories)} categorias de produtos")
            print(f"   - {len(products)} produtos")
            print(f"   - {len(variants)} variantes")
            print(f"   - {len(coupons)} cupons")
            print(f"   - {len(orders)} pedidos")
            print(f"   - {len(badges)} badges")
            print(f"   - {len(achievements)} achievements")
            print(f"   - {len(blog_categories)} categorias do blog")
            print(f"   - {len(blog_posts)} posts do blog")
            print(f"   - {len(newsletter_subscribers)} assinantes")
            print(f"   - {len(notifications)} notificações")
            print(f"   - {len(wishlists)} wishlists")

    if __name__ == "__main__":
        seed_database()

except Exception as e:
    print(f"❌ Erro ao executar seed: {e}")
    import traceback

    traceback.print_exc()
    sys.exit(1)
