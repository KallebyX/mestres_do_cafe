"""
Modelos para Sistema Multi-Tenant (Franquias)
Suporte a múltiplas lojas/franquias independentes
"""

from datetime import datetime
from sqlalchemy import Column, Integer, String, DateTime, Boolean, Text, JSON, ForeignKey
from sqlalchemy.orm import relationship
from database import db

class Tenant(db.Model):
    """Modelo de Tenant (Franquia/Loja)"""
    __tablename__ = 'tenants'
    
    id = Column(Integer, primary_key=True)
    
    # Informações básicas
    name = Column(String(200), nullable=False)
    slug = Column(String(100), unique=True, nullable=False)  # URL amigável
    domain = Column(String(255), unique=True, nullable=True)  # Domínio personalizado
    
    # Status
    is_active = Column(Boolean, default=True, nullable=False)
    status = Column(String(50), default='active', nullable=False)  # active, suspended, trial
    
    # Configurações
    settings = Column(JSON, default=dict, nullable=False)
    theme_config = Column(JSON, default=dict, nullable=False)
    
    # Plano e limites
    plan_type = Column(String(50), default='basic', nullable=False)  # basic, premium, enterprise
    max_products = Column(Integer, default=100, nullable=False)
    max_orders_per_month = Column(Integer, default=1000, nullable=False)
    max_storage_mb = Column(Integer, default=1000, nullable=False)  # 1GB padrão
    
    # Informações de contato
    owner_name = Column(String(200), nullable=False)
    owner_email = Column(String(255), nullable=False)
    owner_phone = Column(String(20), nullable=True)
    
    # Endereço
    address_street = Column(String(255), nullable=True)
    address_number = Column(String(20), nullable=True)
    address_complement = Column(String(100), nullable=True)
    address_neighborhood = Column(String(100), nullable=True)
    address_city = Column(String(100), nullable=True)
    address_state = Column(String(2), nullable=True)
    address_zipcode = Column(String(10), nullable=True)
    address_country = Column(String(2), default='BR', nullable=False)
    
    # Informações fiscais
    cnpj = Column(String(18), nullable=True)
    ie = Column(String(20), nullable=True)  # Inscrição Estadual
    im = Column(String(20), nullable=True)  # Inscrição Municipal
    
    # Configurações de pagamento
    mercado_pago_access_token = Column(String(500), nullable=True)
    mercado_pago_public_key = Column(String(500), nullable=True)
    melhor_envio_token = Column(String(500), nullable=True)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    
    # Trial information
    trial_ends_at = Column(DateTime, nullable=True)
    
    # Relacionamentos
    # Relacionamentos serão adicionados quando as migrações de tenant_id forem aplicadas
    # users = relationship("User", back_populates="tenant", cascade="all, delete-orphan")
    # products = relationship("Product", back_populates="tenant", cascade="all, delete-orphan")
    # orders = relationship("Order", back_populates="tenant", cascade="all, delete-orphan")
    # customers = relationship("Customer", back_populates="tenant", cascade="all, delete-orphan")
    
    def __repr__(self):
        return f'<Tenant {self.name}>'
    
    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'slug': self.slug,
            'domain': self.domain,
            'is_active': self.is_active,
            'status': self.status,
            'plan_type': self.plan_type,
            'owner_name': self.owner_name,
            'owner_email': self.owner_email,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'trial_ends_at': self.trial_ends_at.isoformat() if self.trial_ends_at else None
        }
    
    def get_usage_stats(self):
        """Retorna estatísticas de uso do tenant"""
        
        from .products import Product
        from .orders import Order
        from datetime import datetime, timedelta
        
        current_month_start = datetime.now().replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        
        # Produtos ativos
        active_products = Product.query.filter_by(
            tenant_id=self.id,
            is_active=True
        ).count()
        
        # Pedidos no mês atual
        monthly_orders = Order.query.filter(
            Order.tenant_id == self.id,
            Order.created_at >= current_month_start
        ).count()
        
        return {
            'products': {
                'current': active_products,
                'limit': self.max_products,
                'usage_percent': (active_products / self.max_products) * 100
            },
            'orders': {
                'current_month': monthly_orders,
                'limit': self.max_orders_per_month,
                'usage_percent': (monthly_orders / self.max_orders_per_month) * 100
            }
        }
    
    def is_trial_expired(self):
        """Verifica se o período de trial expirou"""
        if not self.trial_ends_at:
            return False
        return datetime.utcnow() > self.trial_ends_at
    
    def can_create_product(self):
        """Verifica se pode criar novo produto"""
        usage = self.get_usage_stats()
        return usage['products']['current'] < self.max_products
    
    def can_create_order(self):
        """Verifica se pode criar novo pedido no mês"""
        usage = self.get_usage_stats()
        return usage['orders']['current_month'] < self.max_orders_per_month

class TenantSubscription(db.Model):
    """Assinatura do tenant"""
    __tablename__ = 'tenant_subscriptions'
    
    id = Column(Integer, primary_key=True)
    tenant_id = Column(Integer, ForeignKey('tenants.id'), nullable=False)
    
    # Informações da assinatura
    plan_type = Column(String(50), nullable=False)  # basic, premium, enterprise
    status = Column(String(50), default='active', nullable=False)  # active, cancelled, past_due
    
    # Valores
    amount = Column(Integer, nullable=False)  # Valor em centavos
    currency = Column(String(3), default='BRL', nullable=False)
    billing_cycle = Column(String(20), default='monthly', nullable=False)  # monthly, yearly
    
    # Datas
    current_period_start = Column(DateTime, nullable=False)
    current_period_end = Column(DateTime, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    cancelled_at = Column(DateTime, nullable=True)
    
    # Informações do pagamento
    mercado_pago_subscription_id = Column(String(255), nullable=True)
    last_payment_date = Column(DateTime, nullable=True)
    next_payment_date = Column(DateTime, nullable=True)
    
    # Relacionamento
    tenant = relationship("Tenant", backref="subscriptions")
    
    def __repr__(self):
        return f'<TenantSubscription {self.plan_type} - {self.tenant_id}>'
    
    def to_dict(self):
        return {
            'id': self.id,
            'tenant_id': self.tenant_id,
            'plan_type': self.plan_type,
            'status': self.status,
            'amount': self.amount,
            'currency': self.currency,
            'billing_cycle': self.billing_cycle,
            'current_period_start': self.current_period_start.isoformat(),
            'current_period_end': self.current_period_end.isoformat(),
            'next_payment_date': self.next_payment_date.isoformat() if self.next_payment_date else None
        }

class TenantSettings(db.Model):
    """Configurações específicas do tenant"""
    __tablename__ = 'tenant_settings'
    
    id = Column(Integer, primary_key=True)
    tenant_id = Column(Integer, ForeignKey('tenants.id'), nullable=False)
    
    # Configurações gerais
    store_name = Column(String(200), nullable=True)
    store_description = Column(Text, nullable=True)
    store_logo_url = Column(String(500), nullable=True)
    store_banner_url = Column(String(500), nullable=True)
    
    # Configurações de tema
    primary_color = Column(String(7), default='#000000', nullable=False)
    secondary_color = Column(String(7), default='#ffffff', nullable=False)
    font_family = Column(String(100), default='Arial', nullable=False)
    
    # Configurações de funcionamento
    business_hours = Column(JSON, default=dict, nullable=False)
    timezone = Column(String(50), default='America/Sao_Paulo', nullable=False)
    
    # Configurações de e-mail
    smtp_server = Column(String(255), nullable=True)
    smtp_port = Column(Integer, nullable=True)
    smtp_username = Column(String(255), nullable=True)
    smtp_password = Column(String(255), nullable=True)
    from_email = Column(String(255), nullable=True)
    
    # Configurações de SEO
    meta_title = Column(String(100), nullable=True)
    meta_description = Column(String(200), nullable=True)
    meta_keywords = Column(String(500), nullable=True)
    
    # Configurações de checkout
    allow_guest_checkout = Column(Boolean, default=True, nullable=False)
    require_phone = Column(Boolean, default=False, nullable=False)
    require_cpf = Column(Boolean, default=False, nullable=False)
    
    # Configurações de frete
    free_shipping_threshold = Column(Integer, default=0, nullable=False)  # Em centavos
    default_shipping_cost = Column(Integer, default=0, nullable=False)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    
    # Relacionamento
    tenant = relationship("Tenant", backref="tenant_settings")
    
    def to_dict(self):
        return {
            'store_name': self.store_name,
            'store_description': self.store_description,
            'primary_color': self.primary_color,
            'secondary_color': self.secondary_color,
            'font_family': self.font_family,
            'timezone': self.timezone,
            'allow_guest_checkout': self.allow_guest_checkout,
            'require_phone': self.require_phone,
            'require_cpf': self.require_cpf,
            'free_shipping_threshold': self.free_shipping_threshold
        }

# Adicionar tenant_id aos modelos existentes (via migration)
# Exemplo de como seria:

class TenantMixin:
    """Mixin para adicionar suporte a multi-tenancy aos modelos existentes"""
    
    tenant_id = Column(Integer, ForeignKey('tenants.id'), nullable=True)
    
    @classmethod
    def for_tenant(cls, tenant_id):
        """Query helper para filtrar por tenant"""
        return cls.query.filter_by(tenant_id=tenant_id)
    
    def set_tenant(self, tenant_id):
        """Define o tenant do objeto"""
        self.tenant_id = tenant_id