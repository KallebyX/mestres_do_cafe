#!/usr/bin/env python3
"""
Script para inicializar o banco de dados com todos os modelos
Incluindo os novos: Blog, Gamificação, Newsletter, RH, Multi-tenancy
"""

import os
import sys

# Adicionar o diretório src ao path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'src'))

from dotenv import load_dotenv
from flask import Flask
from database import db, init_db, create_tables
from config import DevelopmentConfig

# Carregar variáveis de ambiente
load_dotenv(os.path.join(os.path.dirname(__file__), '.env'))

def create_app():
    """Criar aplicação Flask para inicialização do banco"""
    app = Flask(__name__)
    app.config.from_object(DevelopmentConfig)

    # Inicializar database
    init_db(app)

    return app

def init_all_models():
    """Inicializar todos os modelos do banco de dados"""
    # Importar TODOS os modelos para garantir que sejam registrados
    from models import (
        # Auth
        User, UserSession,
        # Blog
        BlogPost, BlogComment,
        # Coupons
        Coupon, CouponUsage,
        # Customers
        Customer, CustomerAddress, Lead, Contact,
        CustomerSegment, CustomerSegmentMembership,
        # Financial
        FinancialAccount, FinancialTransaction,
        # Gamification
        GamificationLevel, UserPoint, Reward, RewardRedemption,
        # HR
        Department, Position, Employee, TimeCard, Payroll,
        Benefit, EmployeeBenefit,
        # Media
        MediaFile,
        # Newsletter
        NewsletterSubscriber, NewsletterTemplate, NewsletterCampaign, Campaign,
        # Notifications
        Notification, NotificationTemplate, NotificationSubscription, NotificationLog,
        # Orders
        Order, OrderItem, Cart, CartItem, AbandonedCart,
        # Payments
        Payment, Refund, PaymentDispute, EscrowTransaction, PaymentWebhook,
        # Products
        Product, ProductCategory, ProductVariant, ProductAttribute,
        ProductAttributeValue, StockBatch, StockMovement, StockAlert,
        InventoryCount, InventoryCountItem, Review, ReviewHelpful,
        ReviewResponse, ProductPrice,
        # Suppliers
        Supplier, PurchaseOrder, PurchaseOrderItem,
        # System
        SystemSetting, SystemLog, AuditLog,
        # Tenancy
        Tenant, TenantSubscription, TenantSettings,
        # Vendors
        Vendor, VendorProduct, VendorOrder, VendorCommission, VendorReview,
        # Wishlist
        Wishlist, WishlistItem, WishlistShare
    )

    print("✅ Todos os modelos importados com sucesso!")
    print(f"📊 Total de modelos: {len(db.Model.registry._class_registry)}")

def main():
    """Função principal"""
    print("🚀 Iniciando criação do banco de dados...")
    print("=" * 60)

    app = create_app()

    with app.app_context():
        print("\n📋 Importando modelos...")
        init_all_models()

        print("\n🔨 Criando tabelas...")
        try:
            db.create_all()
            print("✅ Todas as tabelas criadas com sucesso!")

            # Listar tabelas criadas
            from sqlalchemy import inspect
            inspector = inspect(db.engine)
            tables = inspector.get_table_names()

            print(f"\n📊 Total de tabelas criadas: {len(tables)}")
            print("\n📑 Tabelas criadas:")
            for table in sorted(tables):
                print(f"  ✓ {table}")

        except Exception as e:
            print(f"❌ Erro ao criar tabelas: {e}")
            import traceback
            traceback.print_exc()
            sys.exit(1)

    print("\n" + "=" * 60)
    print("✅ Banco de dados inicializado com sucesso!")
    print("\n📝 Próximos passos:")
    print("  1. Configurar variáveis de ambiente no .env")
    print("  2. Executar: python src/app.py")
    print("  3. Testar endpoints: curl http://localhost:5001/api/health")

if __name__ == '__main__':
    main()
