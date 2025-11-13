"""
Modelos para sistema Multi-tenancy (suporte a múltiplas empresas/clientes)
"""

from datetime import datetime
from decimal import Decimal
from sqlalchemy import (
    Column, String, Text, Integer, Numeric, Boolean, DateTime, ForeignKey,
    CheckConstraint, Index
)
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship
import uuid
from database import db


class Tenant(db.Model):
    """Tenants / Inquilinos (empresas clientes do sistema)"""
    __tablename__ = 'tenants'

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

    # Identificação
    name = Column(String(200), nullable=False)
    slug = Column(String(100), unique=True, nullable=False, index=True)  # URL amigável
    legal_name = Column(String(200))  # Razão social
    cnpj = Column(String(18), unique=True)
    trade_name = Column(String(200))  # Nome fantasia

    # Contato
    email = Column(String(255), nullable=False)
    phone = Column(String(20))
    website = Column(String(500))

    # Endereço
    address = Column(String(500))
    city = Column(String(100))
    state = Column(String(2))
    postal_code = Column(String(10))
    country = Column(String(2), default='BR')

    # Logo e branding
    logo = Column(String(500))
    primary_color = Column(String(7))  # Cor primária em hex
    secondary_color = Column(String(7))  # Cor secundária em hex

    # Domínio customizado
    custom_domain = Column(String(255), unique=True)  # ex: cliente.meusistema.com

    # Status
    status = Column(String(20), default='active', nullable=False)  # active, suspended, cancelled
    is_verified = Column(Boolean, default=False)

    # Limites e quotas
    max_users = Column(Integer, default=10)
    max_products = Column(Integer, default=100)
    max_orders_per_month = Column(Integer, default=1000)
    max_storage_mb = Column(Integer, default=1024)  # 1GB padrão

    # Uso atual
    current_users = Column(Integer, default=0)
    current_products = Column(Integer, default=0)
    current_orders_month = Column(Integer, default=0)
    current_storage_mb = Column(Integer, default=0)

    # Características habilitadas
    features = Column(JSONB)  # Lista de features habilitadas

    # Metadados
    metadata = Column(JSONB)  # Dados adicionais customizados

    # Timestamps
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow)
    suspended_at = Column(DateTime(timezone=True))
    cancelled_at = Column(DateTime(timezone=True))

    # Relacionamentos
    subscriptions = relationship('TenantSubscription', back_populates='tenant', cascade='all, delete-orphan')
    settings = relationship('TenantSettings', back_populates='tenant', uselist=False, cascade='all, delete-orphan')

    # Constraints
    __table_args__ = (
        CheckConstraint(
            "status IN ('active', 'suspended', 'cancelled', 'trial')",
            name='check_tenant_status'
        ),
        Index('idx_tenant_slug', 'slug'),
        Index('idx_tenant_status', 'status'),
    )

    def __repr__(self):
        return f'<Tenant {self.name}>'

    def to_dict(self):
        return {
            'id': str(self.id),
            'name': self.name,
            'slug': self.slug,
            'legal_name': self.legal_name,
            'cnpj': self.cnpj,
            'trade_name': self.trade_name,
            'email': self.email,
            'phone': self.phone,
            'website': self.website,
            'address': self.address,
            'city': self.city,
            'state': self.state,
            'postal_code': self.postal_code,
            'country': self.country,
            'logo': self.logo,
            'primary_color': self.primary_color,
            'secondary_color': self.secondary_color,
            'custom_domain': self.custom_domain,
            'status': self.status,
            'is_verified': self.is_verified,
            'max_users': self.max_users,
            'max_products': self.max_products,
            'max_orders_per_month': self.max_orders_per_month,
            'max_storage_mb': self.max_storage_mb,
            'current_users': self.current_users,
            'current_products': self.current_products,
            'current_orders_month': self.current_orders_month,
            'current_storage_mb': self.current_storage_mb,
            'features': self.features,
            'metadata': self.metadata,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }


class TenantSubscription(db.Model):
    """Assinaturas/Planos dos tenants"""
    __tablename__ = 'tenant_subscriptions'

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

    # Tenant
    tenant_id = Column(UUID(as_uuid=True), ForeignKey('tenants.id'), nullable=False)

    # Plano
    plan_name = Column(String(100), nullable=False)  # free, basic, professional, enterprise
    plan_type = Column(String(50), default='monthly')  # monthly, yearly, lifetime

    # Valores
    price = Column(Numeric(10, 2), nullable=False)
    currency = Column(String(3), default='BRL')

    # Status
    status = Column(String(20), default='active', nullable=False)  # active, cancelled, expired, past_due

    # Período
    starts_at = Column(DateTime(timezone=True), nullable=False)
    ends_at = Column(DateTime(timezone=True))
    trial_ends_at = Column(DateTime(timezone=True))

    # Renovação automática
    auto_renew = Column(Boolean, default=True)
    next_billing_date = Column(DateTime(timezone=True))

    # Cancelamento
    cancelled_at = Column(DateTime(timezone=True))
    cancellation_reason = Column(Text)
    cancelled_by = Column(UUID(as_uuid=True), ForeignKey('users.id'))

    # Pagamento
    payment_method = Column(String(50))  # credit_card, boleto, pix
    last_payment_date = Column(DateTime(timezone=True))
    last_payment_amount = Column(Numeric(10, 2))
    last_payment_status = Column(String(20))

    # Gateway de pagamento
    external_subscription_id = Column(String(200))  # ID no gateway (Stripe, Mercado Pago, etc)

    # Metadados
    metadata = Column(JSONB)

    # Timestamps
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)
    updated_at = Column(DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relacionamentos
    tenant = relationship('Tenant', back_populates='subscriptions')
    cancelled_by_user = relationship('User', foreign_keys=[cancelled_by])

    # Constraints
    __table_args__ = (
        CheckConstraint(
            "status IN ('active', 'cancelled', 'expired', 'past_due', 'trial')",
            name='check_subscription_status'
        ),
        CheckConstraint(
            "plan_type IN ('monthly', 'yearly', 'lifetime', 'custom')",
            name='check_subscription_plan_type'
        ),
        Index('idx_tenant_subscription_tenant', 'tenant_id', 'status'),
        Index('idx_tenant_subscription_next_billing', 'next_billing_date'),
    )

    def __repr__(self):
        return f'<TenantSubscription tenant={self.tenant_id} plan={self.plan_name}>'

    def to_dict(self):
        return {
            'id': str(self.id),
            'tenant_id': str(self.tenant_id),
            'plan_name': self.plan_name,
            'plan_type': self.plan_type,
            'price': float(self.price) if self.price else 0,
            'currency': self.currency,
            'status': self.status,
            'starts_at': self.starts_at.isoformat() if self.starts_at else None,
            'ends_at': self.ends_at.isoformat() if self.ends_at else None,
            'trial_ends_at': self.trial_ends_at.isoformat() if self.trial_ends_at else None,
            'auto_renew': self.auto_renew,
            'next_billing_date': self.next_billing_date.isoformat() if self.next_billing_date else None,
            'cancelled_at': self.cancelled_at.isoformat() if self.cancelled_at else None,
            'cancellation_reason': self.cancellation_reason,
            'payment_method': self.payment_method,
            'last_payment_date': self.last_payment_date.isoformat() if self.last_payment_date else None,
            'last_payment_amount': float(self.last_payment_amount) if self.last_payment_amount else 0,
            'last_payment_status': self.last_payment_status,
            'external_subscription_id': self.external_subscription_id,
            'metadata': self.metadata,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }


class TenantSettings(db.Model):
    """Configurações customizadas dos tenants"""
    __tablename__ = 'tenant_settings'

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

    # Tenant
    tenant_id = Column(UUID(as_uuid=True), ForeignKey('tenants.id'), nullable=False, unique=True)

    # Configurações gerais
    timezone = Column(String(50), default='America/Sao_Paulo')
    language = Column(String(5), default='pt_BR')
    currency = Column(String(3), default='BRL')
    date_format = Column(String(20), default='DD/MM/YYYY')
    time_format = Column(String(10), default='24h')

    # Configurações de e-commerce
    allow_guest_checkout = Column(Boolean, default=True)
    require_email_verification = Column(Boolean, default=False)
    min_order_value = Column(Numeric(10, 2), default=0)
    free_shipping_threshold = Column(Numeric(10, 2))

    # Configurações de pagamento
    payment_gateways_enabled = Column(JSONB)  # Lista de gateways habilitados
    default_payment_method = Column(String(50))

    # Configurações de envio
    shipping_providers_enabled = Column(JSONB)  # Lista de transportadoras
    default_shipping_origin = Column(String(10))  # CEP de origem

    # Configurações fiscais
    tax_id = Column(String(50))  # Inscrição estadual
    tax_regime = Column(String(50))  # Simples Nacional, Lucro Presumido, etc
    issue_nfe = Column(Boolean, default=False)  # Emitir NF-e automaticamente

    # Configurações de email
    email_from_name = Column(String(200))
    email_from_address = Column(String(255))
    smtp_host = Column(String(200))
    smtp_port = Column(Integer)
    smtp_user = Column(String(200))
    smtp_password = Column(String(500))  # Criptografado
    smtp_use_tls = Column(Boolean, default=True)

    # Configurações de notificações
    notification_channels = Column(JSONB)  # email, sms, push, whatsapp
    notify_new_order = Column(Boolean, default=True)
    notify_low_stock = Column(Boolean, default=True)
    notify_new_customer = Column(Boolean, default=False)

    # Configurações de segurança
    enforce_2fa = Column(Boolean, default=False)
    password_expiry_days = Column(Integer, default=90)
    session_timeout_minutes = Column(Integer, default=60)
    ip_whitelist = Column(JSONB)  # Lista de IPs permitidos

    # Integrações
    integrations = Column(JSONB)  # Configurações de integrações (Google Analytics, Facebook Pixel, etc)

    # Customizações
    custom_css = Column(Text)  # CSS customizado
    custom_scripts = Column(Text)  # Scripts customizados (GA, pixels, etc)

    # Termos e políticas
    terms_of_service = Column(Text)
    privacy_policy = Column(Text)
    return_policy = Column(Text)

    # Redes sociais
    social_links = Column(JSONB)  # Facebook, Instagram, Twitter, etc

    # Metadados adicionais
    metadata = Column(JSONB)

    # Timestamps
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)
    updated_at = Column(DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relacionamentos
    tenant = relationship('Tenant', back_populates='settings')

    def __repr__(self):
        return f'<TenantSettings tenant={self.tenant_id}>'

    def to_dict(self):
        return {
            'id': str(self.id),
            'tenant_id': str(self.tenant_id),
            'timezone': self.timezone,
            'language': self.language,
            'currency': self.currency,
            'date_format': self.date_format,
            'time_format': self.time_format,
            'allow_guest_checkout': self.allow_guest_checkout,
            'require_email_verification': self.require_email_verification,
            'min_order_value': float(self.min_order_value) if self.min_order_value else 0,
            'free_shipping_threshold': float(self.free_shipping_threshold) if self.free_shipping_threshold else None,
            'payment_gateways_enabled': self.payment_gateways_enabled,
            'default_payment_method': self.default_payment_method,
            'shipping_providers_enabled': self.shipping_providers_enabled,
            'default_shipping_origin': self.default_shipping_origin,
            'tax_id': self.tax_id,
            'tax_regime': self.tax_regime,
            'issue_nfe': self.issue_nfe,
            'email_from_name': self.email_from_name,
            'email_from_address': self.email_from_address,
            'notification_channels': self.notification_channels,
            'notify_new_order': self.notify_new_order,
            'notify_low_stock': self.notify_low_stock,
            'notify_new_customer': self.notify_new_customer,
            'enforce_2fa': self.enforce_2fa,
            'password_expiry_days': self.password_expiry_days,
            'session_timeout_minutes': self.session_timeout_minutes,
            'integrations': self.integrations,
            'social_links': self.social_links,
            'metadata': self.metadata,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }
