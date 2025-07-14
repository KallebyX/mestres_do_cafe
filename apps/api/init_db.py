#!/usr/bin/env python3
"""
Script para inicializar o banco de dados PostgreSQL
Cria tabelas e popula com dados iniciais
"""

import os
import sys
from datetime import datetime, timezone
from decimal import Decimal

# Adiciona o diretório src ao path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "src"))

from dotenv import load_dotenv

load_dotenv()

# Importa a aplicação e database
from src.app import create_app
from src.controllers.routes.auth import hash_password
from src.database import db

# Importa todos os modelos para garantir que as tabelas sejam criadas
from src.models.auth import User, UserSession
from src.models.blog import (
    BlogCategory,
    BlogComment,
    BlogPost,
    BlogPostLike,
    BlogPostTag,
    BlogPostView,
    BlogTag,
)
from src.models.coupons import Coupon, CouponUsage
from src.models.customers import (
    Contact,
    Customer,
    CustomerAddress,
    CustomerSegment,
    CustomerSegmentMembership,
    Lead,
)
from src.models.financial import FinancialAccount, FinancialTransaction
from src.models.gamification import (
    Achievement,
    Badge,
    Challenge,
    ChallengeParticipant,
    GamificationLevel,
    MasterLevel,
    PointAction,
    Reward,
    RewardRedemption,
    UserAchievement,
    UserBadge,
    UserPoint,
    UserPointsBalance,
    UserPointTransaction,
    UserReward,
)
from src.models.hr import (
    Benefit,
    Department,
    Employee,
    EmployeeBenefit,
    Payroll,
    Position,
    TimeCard,
)
from src.models.media import MediaFile
from src.models.newsletter import (
    Campaign,
    Newsletter,
    NewsletterCampaign,
    NewsletterSubscriber,
    NewsletterTemplate,
)
from src.models.notifications import (
    Notification,
    NotificationPreference,
    NotificationQueue,
    NotificationTemplate,
)
from src.models.orders import AbandonedCart, Cart, CartItem, Order, OrderItem
from src.models.payments import Payment, PaymentWebhook, Refund
from src.models.products import (
    InventoryCount,
    InventoryCountItem,
    Product,
    ProductAttribute,
    ProductAttributeValue,
    ProductCategory,
    ProductVariant,
    StockAlert,
    StockBatch,
    StockMovement,
)
from src.models.suppliers import PurchaseOrder, PurchaseOrderItem, Supplier
from src.models.system import AuditLog, SystemLog, SystemSetting
from src.models.vendors import (
    Vendor,
    VendorCommission,
    VendorOrder,
    VendorProduct,
    VendorReview,
)
from src.models.wishlist import Wishlist, WishlistItem, WishlistShare


def create_tables():
    """Cria todas as tabelas do banco"""
    print("🔄 Criando tabelas...")
    db.create_all()
    print("✅ Tabelas criadas com sucesso!")


def create_sample_data():
    """Cria dados de exemplo para testar o sistema"""
    print("🔄 Criando dados de exemplo...")

    try:
        # 1. Criar categorias de produtos (verificar se já existem)
        cafe_category = ProductCategory.query.filter_by(slug="cafes-especiais").first()
        if not cafe_category:
            cafe_category = ProductCategory(
                name="Cafés Especiais",
                description="Cafés premium selecionados",
                slug="cafes-especiais",
                is_active=True,
            )
            db.session.add(cafe_category)

        acessorios_category = ProductCategory.query.filter_by(slug="acessorios").first()
        if not acessorios_category:
            acessorios_category = ProductCategory(
                name="Acessórios",
                description="Acessórios para preparo de café",
                slug="acessorios",
                is_active=True,
            )
            db.session.add(acessorios_category)

        db.session.commit()

        # 2. Criar produtos (verificar se já existem)
        products_data = [
            {
                "name": "Café Especial Bourbon Amarelo",
                "description": "Café especial com notas frutadas e corpo suave",
                "short_description": "Café premium com notas frutadas",
                "price": Decimal("35.90"),
                "weight": 250,
                "category_id": cafe_category.id,
                "stock_quantity": 100,
                "is_active": True,
                "is_featured": True,
                "sca_score": 86,
                "origin": "Minas Gerais",
                "roast_level": "medium",
                "process": "natural",
                "flavor_notes": '["frutas vermelhas", "chocolate", "caramelo"]',
                "slug": "cafe-especial-bourbon-amarelo",
            },
            {
                "name": "Café Especial Catuaí Vermelho",
                "description": "Café especial com notas de chocolate e caramelo",
                "short_description": "Café premium com notas doces",
                "price": Decimal("39.90"),
                "weight": 250,
                "category_id": cafe_category.id,
                "stock_quantity": 80,
                "is_active": True,
                "is_featured": True,
                "sca_score": 88,
                "origin": "São Paulo",
                "roast_level": "medium-dark",
                "process": "pulped_natural",
                "flavor_notes": '["chocolate", "caramelo", "nozes"]',
                "slug": "cafe-especial-catuai-vermelho",
            },
            {
                "name": "Filtro V60 Hario",
                "description": "Filtro de papel para método V60",
                "short_description": "Filtros para V60",
                "price": Decimal("12.90"),
                "weight": 50,
                "category_id": acessorios_category.id,
                "stock_quantity": 200,
                "is_active": True,
                "is_featured": False,
                "slug": "filtro-v60-hario",
            },
        ]

        for product_data in products_data:
            existing_product = Product.query.filter_by(slug=product_data["slug"]).first()
            if not existing_product:
                product = Product(**product_data)
                db.session.add(product)

        db.session.commit()

        # 3. Criar usuário administrador (verificar se já existe)
        admin_user = User.query.filter_by(email="admin@mestrescafe.com").first()
        if not admin_user:
            admin_user = User(
                name="Admin Sistema",
                username="admin",
                email="admin@mestrescafe.com",
                phone="(11) 99999-9999",
                first_name="Admin",
                last_name="Sistema",
                password_hash=hash_password("admin123"),
                is_admin=True,
                is_active=True,
                email_verified=True,
            )
            db.session.add(admin_user)

        # 4. Criar usuário cliente (verificar se já existe)
        customer_user = User.query.filter_by(email="cliente@example.com").first()
        if not customer_user:
            customer_user = User(
                name="João Silva",
                username="cliente",
                email="cliente@example.com",
                phone="(11) 88888-8888",
                first_name="João",
                last_name="Silva",
                password_hash=hash_password("cliente123"),
                is_admin=False,
                is_active=True,
                email_verified=True,
            )
            db.session.add(customer_user)

        db.session.commit()

        # 5. Criar dados de blog (verificar se já existem)
        blog_category = BlogCategory.query.filter_by(slug="dicas-de-cafe").first()
        if not blog_category:
            blog_category = BlogCategory(
                name="Dicas de Café",
                description="Dicas e truques sobre café",
                slug="dicas-de-cafe",
                is_active=True,
            )
            db.session.add(blog_category)
            db.session.commit()

        blog_post = BlogPost.query.filter_by(slug="como-preparar-cafe-perfeito").first()
        if not blog_post:
            blog_post = BlogPost(
                title="Como Preparar um Café Perfeito",
                content="Guia completo para preparar um café especial...",
                excerpt="Aprenda a preparar café como um verdadeiro mestre",
                slug="como-preparar-cafe-perfeito",
                author_id=admin_user.id,
                category="Dicas de Café",
                is_published=True,
                is_featured=True,
            )
            db.session.add(blog_post)

        # 6. Criar dados de gamificação
        # Ações de pontos
        actions = [
            PointAction(
                action_type="first_purchase",
                name="Primeiro Pedido",
                description="Pontos pelo primeiro pedido",
                base_points=100,
                is_active=True,
            ),
            PointAction(
                action_type="product_review",
                name="Avaliação de Produto",
                description="Pontos por avaliar um produto",
                base_points=50,
                is_active=True,
            ),
            PointAction(
                action_type="social_share",
                name="Compartilhar nas Redes",
                description="Pontos por compartilhar produto",
                base_points=25,
                is_active=True,
            ),
        ]

        for action in actions:
            db.session.add(action)

        # Níveis do clube
        levels = [
            MasterLevel(
                name="Aprendiz do Café",
                description="Nível inicial dos mestres",
                min_points=0,
                level_order=1,
                is_active=True,
            ),
            MasterLevel(
                name="Conhecedor de Café",
                description="Conhece bem sobre café",
                min_points=500,
                level_order=2,
                is_active=True,
            ),
            MasterLevel(
                name="Mestre do Café",
                description="Verdadeiro mestre do café",
                min_points=1500,
                level_order=3,
                is_active=True,
            ),
        ]

        for level in levels:
            db.session.add(level)

        db.session.commit()

        # 7. Criar configurações do sistema
        system_settings = [
            SystemSetting(
                key="store_name", value="Mestres do Café", description="Nome da loja"
            ),
            SystemSetting(
                key="store_email",
                value="contato@mestrescafe.com",
                description="Email da loja",
            ),
            SystemSetting(
                key="store_phone",
                value="(11) 3333-3333",
                description="Telefone da loja",
            ),
            SystemSetting(
                key="free_shipping_threshold",
                value="100.00",
                description="Valor mínimo para frete grátis",
            ),
        ]

        for setting in system_settings:
            db.session.add(setting)

        db.session.commit()

        print("✅ Dados de exemplo criados com sucesso!")
        print("\n📋 Resumo dos dados criados:")
        print(f"   • {ProductCategory.query.count()} categorias de produtos")
        print(f"   • {Product.query.count()} produtos")
        print(f"   • {User.query.count()} usuários")
        print(f"   • {BlogPost.query.count()} posts do blog")
        print(f"   • {PointAction.query.count()} ações de pontos")
        print(f"   • {MasterLevel.query.count()} níveis do clube")
        print(f"   • {SystemSetting.query.count()} configurações do sistema")

        print("\n🔑 Credenciais de teste:")
        print("   Admin: admin@mestrescafe.com / admin123")
        print("   Cliente: cliente@example.com / cliente123")

    except Exception as e:
        print(f"❌ Erro ao criar dados: {e}")
        db.session.rollback()
        raise


def main():
    """Função principal"""
    print("🚀 Iniciando configuração do banco de dados...")

    # Cria aplicação
    app = create_app()

    with app.app_context():
        try:
            # Cria tabelas
            create_tables()

            # Popula com dados
            create_sample_data()

            print("\n🎉 Banco de dados inicializado com sucesso!")
            print("🔗 API disponível em: http://localhost:5001")
            print("📊 Health check: http://localhost:5001/api/health")

        except Exception as e:
            print(f"❌ Erro durante a inicialização: {e}")
            return 1

    return 0


if __name__ == "__main__":
    sys.exit(main())
