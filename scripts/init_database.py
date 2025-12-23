#!/usr/bin/env python3
"""
Script de inicialização do banco de dados para Neon PostgreSQL (Serverless)
Executado automaticamente durante o deploy no Vercel

Este script:
1. Conecta ao banco Neon PostgreSQL
2. Cria todas as tabelas necessárias
3. Popula dados iniciais (admin user, configurações básicas)
4. Valida a estrutura do banco
"""

import os
import sys
import logging
from datetime import datetime

# Adiciona o diretório src ao path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'apps', 'api', 'src'))

# Configurar logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


def get_database_url():
    """Obtém a URL do banco de dados"""
    url = os.environ.get('NEON_DATABASE_URL') or os.environ.get('DATABASE_URL')

    if not url:
        logger.warning("Nenhuma URL de banco de dados configurada")
        return None

    # Converter postgres:// para postgresql:// se necessário
    if url.startswith('postgres://'):
        url = url.replace('postgres://', 'postgresql://', 1)

    return url


def create_app_for_db():
    """Cria uma instância mínima do Flask para inicializar o banco"""
    from flask import Flask
    from flask_sqlalchemy import SQLAlchemy

    app = Flask(__name__)

    database_url = get_database_url()
    if not database_url:
        raise RuntimeError("DATABASE_URL não configurada - impossível inicializar banco")

    app.config['SQLALCHEMY_DATABASE_URI'] = database_url
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'dev-secret-key')
    app.config['JWT_SECRET_KEY'] = os.environ.get('JWT_SECRET_KEY', 'dev-jwt-secret-key')

    # Configurações para Neon PostgreSQL Serverless
    if database_url.startswith('postgresql'):
        app.config['SQLALCHEMY_ENGINE_OPTIONS'] = {
            'pool_pre_ping': True,
            'pool_recycle': 60,
            'pool_size': 1,
            'max_overflow': 2,
            'pool_timeout': 10,
            'connect_args': {
                'options': '-c timezone=utc',
                'sslmode': 'require'
            }
        }

    return app


def init_database():
    """Inicializa o banco de dados criando todas as tabelas"""
    from database import db, init_db

    app = create_app_for_db()

    # Importar todos os modelos para garantir que serão criados
    from models import (
        # Auth
        User, UserSession,
        # Customers
        Customer, CustomerAddress, Lead, Contact, CustomerSegment, CustomerSegmentMembership,
        # Products
        Product, ProductCategory, ProductVariant, ProductAttribute, ProductAttributeValue,
        ProductPrice, StockBatch, StockMovement, StockAlert, InventoryCount, InventoryCountItem,
        Review, ReviewHelpful, ReviewResponse,
        # Orders
        Order, OrderItem, Cart, CartItem, AbandonedCart,
        # Payments
        Payment, Refund, PaymentDispute, EscrowTransaction, PaymentWebhook,
        # Coupons
        Coupon, CouponUsage,
        # Gamification
        GamificationLevel, UserPoint, Reward, RewardRedemption,
        # Blog
        BlogPost, BlogComment,
        # Newsletter
        NewsletterSubscriber, NewsletterTemplate, NewsletterCampaign, Campaign,
        # Notifications
        Notification, NotificationTemplate, NotificationSubscription, NotificationLog,
        # Media
        MediaFile,
        # Financial
        FinancialAccount, FinancialTransaction,
        # HR
        Employee, Department, Position, Payroll, TimeCard, Benefit, EmployeeBenefit,
        # Suppliers
        Supplier, PurchaseOrder, PurchaseOrderItem,
        # Vendors
        Vendor, VendorProduct, VendorOrder, VendorCommission, VendorReview,
        # Multi-tenancy
        Tenant, TenantSubscription, TenantSettings,
        # System
        SystemSetting, SystemLog, AuditLog,
        # Wishlist
        Wishlist, WishlistItem, WishlistShare,
        # PDV
        CashRegister, CashSession, CashMovement, Sale, SaleItem,
        # ERP
        PurchaseRequest, PurchaseRequestItem, SupplierContract,
        ProductionOrder, ProductionMaterial, QualityControl, MaterialRequirement,
        # Financial Advanced
        AccountsPayable, AccountsReceivable, CashFlow, IncomeStatement, BankReconciliation, Budget,
        # CRM Advanced
        SalesPipeline, PipelineStage, Deal, DealActivity, DealNote, SalesFunnel, MarketingAutomation, LeadScore,
    )

    # Importar modelos de melhor envio
    try:
        from models.melhor_envio import ShippingQuote, ShippingLabel, ShippingTracking
        logger.info("✅ Modelos Melhor Envio importados")
    except ImportError as e:
        logger.warning(f"⚠️ Modelos Melhor Envio não encontrados: {e}")

    # Importar modelos de analytics
    try:
        from models.analytics import PageView, Event, Session
        logger.info("✅ Modelos Analytics importados")
    except ImportError as e:
        logger.warning(f"⚠️ Modelos Analytics não encontrados: {e}")

    with app.app_context():
        # Inicializar SQLAlchemy
        db.init_app(app)

        logger.info("🔄 Criando tabelas do banco de dados...")

        try:
            # Criar todas as tabelas
            db.create_all()
            logger.info("✅ Tabelas criadas com sucesso!")

            # Verificar conexão
            from sqlalchemy import text
            result = db.session.execute(text("SELECT 1"))
            logger.info("✅ Conexão com banco de dados verificada!")

            return True

        except Exception as e:
            logger.error(f"❌ Erro ao criar tabelas: {e}")
            return False


def hash_password(password):
    """Hash password using bcrypt - mesmo método usado na API"""
    import bcrypt
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')


def seed_initial_data():
    """Popula dados iniciais necessários para o sistema funcionar"""
    from database import db
    from models import User, SystemSetting, ProductCategory, GamificationLevel

    app = create_app_for_db()

    with app.app_context():
        db.init_app(app)

        try:
            # Criar usuário admin padrão se não existir
            admin = User.query.filter_by(email='admin@mestresdocafe.com.br').first()
            if not admin:
                admin = User(
                    name='Administrador',
                    email='admin@mestresdocafe.com.br',
                    username='admin',
                    password_hash=hash_password('MestresCafe2024!'),
                    is_admin=True,
                    is_active=True,
                    role='admin'
                )
                db.session.add(admin)
                logger.info("✅ Usuário admin criado: admin@mestresdocafe.com.br")

            # Criar categorias básicas de produtos
            categories = [
                {'name': 'Café em Grãos', 'slug': 'cafe-em-graos', 'description': 'Grãos de café especiais'},
                {'name': 'Café Moído', 'slug': 'cafe-moido', 'description': 'Café moído pronto para preparo'},
                {'name': 'Cápsulas', 'slug': 'capsulas', 'description': 'Cápsulas compatíveis'},
                {'name': 'Acessórios', 'slug': 'acessorios', 'description': 'Acessórios para café'},
                {'name': 'Kits', 'slug': 'kits', 'description': 'Kits especiais'},
            ]

            for cat_data in categories:
                existing = ProductCategory.query.filter_by(slug=cat_data['slug']).first()
                if not existing:
                    category = ProductCategory(**cat_data)
                    db.session.add(category)
                    logger.info(f"✅ Categoria criada: {cat_data['name']}")

            # Criar níveis de gamificação
            levels = [
                {'name': 'Iniciante', 'level': 1, 'min_points': 0, 'max_points': 100},
                {'name': 'Conhecedor', 'level': 2, 'min_points': 101, 'max_points': 500},
                {'name': 'Barista', 'level': 3, 'min_points': 501, 'max_points': 1500},
                {'name': 'Mestre', 'level': 4, 'min_points': 1501, 'max_points': 5000},
                {'name': 'Lenda do Café', 'level': 5, 'min_points': 5001, 'max_points': 99999},
            ]

            for level_data in levels:
                existing = GamificationLevel.query.filter_by(level=level_data['level']).first()
                if not existing:
                    level = GamificationLevel(**level_data)
                    db.session.add(level)
                    logger.info(f"✅ Nível de gamificação criado: {level_data['name']}")

            # Criar configurações do sistema
            settings = [
                {'key': 'site_name', 'value': 'Mestres do Café', 'type': 'string', 'description': 'Nome do site'},
                {'key': 'site_description', 'value': 'Café especial de alta qualidade', 'type': 'string', 'description': 'Descrição do site'},
                {'key': 'contact_email', 'value': 'contato@mestresdocafe.com.br', 'type': 'string', 'description': 'Email de contato'},
                {'key': 'mercado_pago_environment', 'value': 'sandbox', 'type': 'string', 'description': 'Ambiente do Mercado Pago'},
                {'key': 'melhor_envio_environment', 'value': 'sandbox', 'type': 'string', 'description': 'Ambiente do Melhor Envio'},
                {'key': 'melhor_envio_origin_cep', 'value': '', 'type': 'string', 'description': 'CEP de origem para frete'},
            ]

            for setting_data in settings:
                existing = SystemSetting.query.filter_by(key=setting_data['key']).first()
                if not existing:
                    setting = SystemSetting(**setting_data)
                    db.session.add(setting)
                    logger.info(f"✅ Configuração criada: {setting_data['key']}")

            db.session.commit()
            logger.info("✅ Dados iniciais criados com sucesso!")
            return True

        except Exception as e:
            db.session.rollback()
            logger.error(f"❌ Erro ao criar dados iniciais: {e}")
            return False


def validate_database():
    """Valida a estrutura do banco de dados"""
    from database import db
    from sqlalchemy import text

    app = create_app_for_db()

    with app.app_context():
        db.init_app(app)

        try:
            # Listar tabelas existentes
            result = db.session.execute(text("""
                SELECT table_name
                FROM information_schema.tables
                WHERE table_schema = 'public'
                ORDER BY table_name
            """))

            tables = [row[0] for row in result.fetchall()]

            logger.info(f"📊 Total de tabelas: {len(tables)}")

            # Tabelas essenciais
            essential_tables = [
                'users', 'products', 'orders', 'order_items', 'carts', 'cart_items',
                'payments', 'system_settings', 'product_categories'
            ]

            missing = [t for t in essential_tables if t not in tables]
            if missing:
                logger.warning(f"⚠️ Tabelas faltando: {missing}")
                return False

            logger.info("✅ Todas as tabelas essenciais existem!")
            return True

        except Exception as e:
            logger.error(f"❌ Erro ao validar banco: {e}")
            return False


def main():
    """Função principal de inicialização"""
    logger.info("=" * 60)
    logger.info("🚀 INICIALIZANDO BANCO DE DADOS - MESTRES DO CAFÉ")
    logger.info("=" * 60)

    database_url = get_database_url()
    if database_url:
        # Ocultar senha na URL para log
        safe_url = database_url.split('@')[-1] if '@' in database_url else database_url
        logger.info(f"📍 Conectando ao banco: ***@{safe_url}")
    else:
        # Skip database initialization if no PostgreSQL URL is configured
        # This happens during Vercel build when DATABASE_URL isn't set
        # SQLite is not available in Vercel's serverless Python runtime
        logger.warning("⚠️ Nenhuma URL de banco de dados PostgreSQL configurada")
        logger.info("⏭️ Pulando inicialização do banco de dados durante o build")
        logger.info("ℹ️ O banco será inicializado na primeira requisição com DATABASE_URL configurada")
        logger.info("=" * 60)
        logger.info("✅ BUILD CONCLUÍDO (sem inicialização de banco)")
        logger.info("=" * 60)
        sys.exit(0)

    # Passo 1: Criar tabelas
    logger.info("\n📋 Passo 1: Criando estrutura do banco...")
    if not init_database():
        logger.error("❌ Falha ao criar estrutura do banco")
        sys.exit(1)

    # Passo 2: Popular dados iniciais
    logger.info("\n📋 Passo 2: Populando dados iniciais...")
    if not seed_initial_data():
        logger.warning("⚠️ Alguns dados iniciais podem não ter sido criados")

    # Passo 3: Validar estrutura
    logger.info("\n📋 Passo 3: Validando estrutura do banco...")
    if database_url and database_url.startswith('postgresql'):
        if not validate_database():
            logger.warning("⚠️ Validação do banco retornou avisos")
    else:
        logger.info("⏭️ Validação ignorada para SQLite")

    logger.info("\n" + "=" * 60)
    logger.info("✅ INICIALIZAÇÃO DO BANCO DE DADOS CONCLUÍDA!")
    logger.info("=" * 60)


if __name__ == '__main__':
    main()
