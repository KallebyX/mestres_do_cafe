"""
Modelos de Checkout - Mestres do Café Enterprise
"""

from datetime import datetime, timedelta
from sqlalchemy import Column, Integer, String, Float, Text, Boolean, DateTime, ForeignKey, Enum, JSON
from sqlalchemy.orm import relationship
from .base import db
import enum
import json


class CheckoutStatus(enum.Enum):
    """Status do checkout"""
    CART_REVIEW = "cart_review"
    SHIPPING_DATA = "shipping_data"
    SHIPPING_OPTIONS = "shipping_options"
    PAYMENT_DATA = "payment_data"
    FINAL_REVIEW = "final_review"
    COMPLETED = "completed"
    ABANDONED = "abandoned"


class PaymentMethod(enum.Enum):
    """Métodos de pagamento"""
    PIX = "pix"
    CREDIT_CARD = "credit_card"
    DEBIT_CARD = "debit_card"
    BOLETO = "boleto"
    BANK_TRANSFER = "bank_transfer"


class ShippingMethod(enum.Enum):
    """Métodos de frete"""
    CORREIOS_PAC = "correios_pac"
    CORREIOS_SEDEX = "correios_sedex"
    TRANSPORTADORA = "transportadora"
    RETIRADA = "retirada"


class CheckoutSession(db.Model):
    """Sessão de checkout"""
    __tablename__ = 'checkout_sessions'
    
    id = Column(String(36), primary_key=True)
    user_id = Column(Integer, ForeignKey('users.id'), nullable=False)
    session_token = Column(String(64), unique=True, nullable=False)
    
    # Status e progresso
    status = Column(Enum(CheckoutStatus), default=CheckoutStatus.CART_REVIEW)
    current_step = Column(Integer, default=1)
    total_steps = Column(Integer, default=6)
    
    # Dados do carrinho
    cart_data = Column(JSON)
    cart_total = Column(Float, default=0.0)
    cart_items_count = Column(Integer, default=0)
    
    # Dados de entrega
    shipping_address_id = Column(String(36), ForeignKey('shipping_addresses.id'))
    shipping_method = Column(Enum(ShippingMethod))
    shipping_cost = Column(Float, default=0.0)
    estimated_delivery_date = Column(DateTime)
    
    # Dados de pagamento
    payment_method = Column(Enum(PaymentMethod))
    payment_data = Column(JSON)  # dados específicos do método de pagamento
    
    # Valores finais
    subtotal = Column(Float, default=0.0)
    shipping_total = Column(Float, default=0.0)
    tax_total = Column(Float, default=0.0)
    discount_total = Column(Float, default=0.0)
    final_total = Column(Float, default=0.0)
    
    # Cupons e promoções
    coupon_code = Column(String(50))
    discount_amount = Column(Float, default=0.0)
    
    # Metadados
    user_agent = Column(String(500))
    ip_address = Column(String(45))
    referrer = Column(String(500))
    
    # Controle de abandono
    last_activity = Column(DateTime, default=datetime.utcnow)
    abandonment_email_sent = Column(Boolean, default=False)
    recovery_token = Column(String(64))
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    completed_at = Column(DateTime)
    abandoned_at = Column(DateTime)
    
    # Relacionamentos
    user = relationship("User", back_populates="checkout_sessions")
    shipping_address = relationship("ShippingAddress", back_populates="checkout_sessions")
    order = relationship("Order", back_populates="checkout_session", uselist=False)
    
    def __repr__(self):
        return f'<CheckoutSession {self.session_token}>'
    
    @property
    def is_expired(self):
        """Verifica se a sessão expirou (após 24 horas)"""
        return datetime.utcnow() - self.updated_at > timedelta(hours=24)
    
    @property
    def is_abandoned(self):
        """Verifica se o carrinho foi abandonado (após 30 minutos de inatividade)"""
        if self.status == CheckoutStatus.COMPLETED:
            return False
        return datetime.utcnow() - self.last_activity > timedelta(minutes=30)
    
    def to_dict(self):
        return {
            'id': self.id,
            'session_token': self.session_token,
            'status': self.status.value,
            'current_step': self.current_step,
            'total_steps': self.total_steps,
            'cart_data': self.cart_data,
            'cart_total': self.cart_total,
            'cart_items_count': self.cart_items_count,
            'shipping_address_id': self.shipping_address_id,
            'shipping_method': self.shipping_method.value if self.shipping_method else None,
            'shipping_cost': self.shipping_cost,
            'estimated_delivery_date': self.estimated_delivery_date.isoformat() if self.estimated_delivery_date else None,
            'payment_method': self.payment_method.value if self.payment_method else None,
            'subtotal': self.subtotal,
            'shipping_total': self.shipping_total,
            'tax_total': self.tax_total,
            'discount_total': self.discount_total,
            'final_total': self.final_total,
            'coupon_code': self.coupon_code,
            'discount_amount': self.discount_amount,
            'is_expired': self.is_expired,
            'is_abandoned': self.is_abandoned,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat(),
        }


class ShippingAddress(db.Model):
    """Endereços de entrega"""
    __tablename__ = 'shipping_addresses'
    
    id = Column(String(36), primary_key=True)
    user_id = Column(Integer, ForeignKey('users.id'), nullable=False)
    
    # Dados do destinatário
    recipient_name = Column(String(255), nullable=False)
    recipient_phone = Column(String(20))
    recipient_email = Column(String(255))
    recipient_document = Column(String(20))  # CPF/CNPJ
    
    # Endereço
    cep = Column(String(9), nullable=False)
    street = Column(String(255), nullable=False)
    number = Column(String(20), nullable=False)
    complement = Column(String(100))
    neighborhood = Column(String(100), nullable=False)
    city = Column(String(100), nullable=False)
    state = Column(String(2), nullable=False)
    country = Column(String(100), default="Brasil")
    
    # Informações adicionais
    reference = Column(String(255))
    delivery_instructions = Column(Text)
    
    # Flags
    is_default = Column(Boolean, default=False)
    is_active = Column(Boolean, default=True)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relacionamentos
    user = relationship("User", back_populates="shipping_addresses")
    checkout_sessions = relationship("CheckoutSession", back_populates="shipping_address")
    
    def __repr__(self):
        return f'<ShippingAddress {self.recipient_name} - {self.city}/{self.state}>'
    
    def to_dict(self):
        return {
            'id': self.id,
            'recipient_name': self.recipient_name,
            'recipient_phone': self.recipient_phone,
            'recipient_email': self.recipient_email,
            'recipient_document': self.recipient_document,
            'cep': self.cep,
            'street': self.street,
            'number': self.number,
            'complement': self.complement,
            'neighborhood': self.neighborhood,
            'city': self.city,
            'state': self.state,
            'country': self.country,
            'reference': self.reference,
            'delivery_instructions': self.delivery_instructions,
            'is_default': self.is_default,
            'is_active': self.is_active,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat(),
        }


class ShippingOption(db.Model):
    """Opções de frete calculadas"""
    __tablename__ = 'shipping_options'
    
    id = Column(String(36), primary_key=True)
    checkout_session_id = Column(String(36), ForeignKey('checkout_sessions.id'), nullable=False)
    
    # Dados da opção
    carrier_name = Column(String(100), nullable=False)
    service_name = Column(String(100), nullable=False)
    service_code = Column(String(50))
    method = Column(Enum(ShippingMethod), nullable=False)
    
    # Valores
    price = Column(Float, nullable=False)
    delivery_time = Column(Integer)  # dias
    estimated_delivery_date = Column(DateTime)
    
    # Informações adicionais
    description = Column(Text)
    tracking_available = Column(Boolean, default=False)
    insurance_included = Column(Boolean, default=False)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    expires_at = Column(DateTime)  # cotação expira
    
    # Relacionamentos
    checkout_session = relationship("CheckoutSession", back_populates="shipping_options")
    
    def __repr__(self):
        return f'<ShippingOption {self.carrier_name} - {self.service_name}>'
    
    @property
    def is_expired(self):
        """Verifica se a cotação expirou"""
        if not self.expires_at:
            return False
        return datetime.utcnow() > self.expires_at
    
    def to_dict(self):
        return {
            'id': self.id,
            'carrier_name': self.carrier_name,
            'service_name': self.service_name,
            'service_code': self.service_code,
            'method': self.method.value,
            'price': self.price,
            'delivery_time': self.delivery_time,
            'estimated_delivery_date': self.estimated_delivery_date.isoformat() if self.estimated_delivery_date else None,
            'description': self.description,
            'tracking_available': self.tracking_available,
            'insurance_included': self.insurance_included,
            'is_expired': self.is_expired,
            'created_at': self.created_at.isoformat(),
        }


class CouponCode(db.Model):
    """Cupons de desconto"""
    __tablename__ = 'coupon_codes'
    
    id = Column(String(36), primary_key=True)
    code = Column(String(50), unique=True, nullable=False)
    name = Column(String(255), nullable=False)
    description = Column(Text)
    
    # Tipo de desconto
    discount_type = Column(String(20), nullable=False)  # percentage, fixed, free_shipping
    discount_value = Column(Float, nullable=False)
    
    # Condições
    minimum_order_value = Column(Float, default=0.0)
    maximum_discount_value = Column(Float)
    max_uses = Column(Integer)
    max_uses_per_user = Column(Integer, default=1)
    
    # Validade
    start_date = Column(DateTime, nullable=False)
    end_date = Column(DateTime, nullable=False)
    
    # Flags
    is_active = Column(Boolean, default=True)
    is_first_purchase_only = Column(Boolean, default=False)
    
    # Contadores
    total_uses = Column(Integer, default=0)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def __repr__(self):
        return f'<CouponCode {self.code}>'
    
    @property
    def is_valid(self):
        """Verifica se o cupom é válido"""
        now = datetime.utcnow()
        return (
            self.is_active and
            self.start_date <= now <= self.end_date and
            (self.max_uses is None or self.total_uses < self.max_uses)
        )
    
    def calculate_discount(self, order_value):
        """Calcula o desconto para um valor de pedido"""
        if not self.is_valid or order_value < self.minimum_order_value:
            return 0.0
        
        if self.discount_type == 'percentage':
            discount = order_value * (self.discount_value / 100)
            if self.maximum_discount_value:
                discount = min(discount, self.maximum_discount_value)
            return discount
        elif self.discount_type == 'fixed':
            return min(self.discount_value, order_value)
        elif self.discount_type == 'free_shipping':
            return 0.0  # Desconto será aplicado no frete
        
        return 0.0
    
    def to_dict(self):
        return {
            'id': self.id,
            'code': self.code,
            'name': self.name,
            'description': self.description,
            'discount_type': self.discount_type,
            'discount_value': self.discount_value,
            'minimum_order_value': self.minimum_order_value,
            'maximum_discount_value': self.maximum_discount_value,
            'is_valid': self.is_valid,
            'start_date': self.start_date.isoformat(),
            'end_date': self.end_date.isoformat(),
        }


class CheckoutEvent(db.Model):
    """Eventos de checkout para analytics"""
    __tablename__ = 'checkout_events'
    
    id = Column(String(36), primary_key=True)
    checkout_session_id = Column(String(36), ForeignKey('checkout_sessions.id'))
    user_id = Column(Integer, ForeignKey('users.id'))
    
    # Dados do evento
    event_type = Column(String(50), nullable=False)  # step_started, step_completed, error, etc
    step_name = Column(String(50))
    step_number = Column(Integer)
    
    # Dados adicionais
    event_data = Column(JSON)
    error_message = Column(Text)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relacionamentos
    checkout_session = relationship("CheckoutSession")
    user = relationship("User")
    
    def __repr__(self):
        return f'<CheckoutEvent {self.event_type} - {self.step_name}>'
    
    def to_dict(self):
        return {
            'id': self.id,
            'event_type': self.event_type,
            'step_name': self.step_name,
            'step_number': self.step_number,
            'event_data': self.event_data,
            'error_message': self.error_message,
            'created_at': self.created_at.isoformat(),
        }


# Adicionar relacionamentos aos modelos existentes
from .user import User
from .orders import Order

# Adicionar relacionamentos
User.checkout_sessions = relationship("CheckoutSession", back_populates="user")
User.shipping_addresses = relationship("ShippingAddress", back_populates="user")
Order.checkout_session = relationship("CheckoutSession", back_populates="order")
CheckoutSession.shipping_options = relationship("ShippingOption", back_populates="checkout_session")