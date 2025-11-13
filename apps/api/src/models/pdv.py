"""
Modelos para o sistema de PDV (Ponto de Venda)
"""

from datetime import datetime
from decimal import Decimal
from sqlalchemy import (
    Column, String, Text, Integer, Numeric, Boolean, DateTime, Date, ForeignKey,
    CheckConstraint, Index
)
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship
import uuid
from database import db


class CashRegister(db.Model):
    """Caixas/Terminais de PDV"""
    __tablename__ = 'cash_registers'

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

    # Informações do caixa
    name = Column(String(200), nullable=False)
    code = Column(String(50), unique=True, nullable=False)
    location = Column(String(200))  # Loja, setor

    # Hardware
    device_id = Column(String(200))  # ID do dispositivo
    printer_model = Column(String(100))  # Modelo da impressora fiscal
    printer_serial = Column(String(100))  # Serial da impressora

    # Status
    is_active = Column(Boolean, default=True)
    is_online = Column(Boolean, default=False)

    # Timestamps
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)
    updated_at = Column(DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relacionamentos
    sessions = relationship('CashSession', back_populates='cash_register')
    sales = relationship('Sale', back_populates='cash_register')

    def __repr__(self):
        return f'<CashRegister {self.name}>'

    def to_dict(self):
        return {
            'id': str(self.id),
            'name': self.name,
            'code': self.code,
            'location': self.location,
            'is_active': self.is_active,
            'is_online': self.is_online
        }


class CashSession(db.Model):
    """Sessões de caixa (abertura/fechamento)"""
    __tablename__ = 'cash_sessions'

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

    # Caixa e operador
    cash_register_id = Column(UUID(as_uuid=True), ForeignKey('cash_registers.id'), nullable=False)
    operator_id = Column(UUID(as_uuid=True), ForeignKey('users.id'), nullable=False)

    # Abertura
    opened_at = Column(DateTime(timezone=True), default=datetime.utcnow, nullable=False)
    opening_balance = Column(Numeric(10, 2), nullable=False, default=0)  # Fundo de troco

    # Fechamento
    closed_at = Column(DateTime(timezone=True))
    closing_balance = Column(Numeric(10, 2))  # Saldo final
    expected_balance = Column(Numeric(10, 2))  # Saldo esperado (calculado)
    difference = Column(Numeric(10, 2))  # Diferença (quebra de caixa)

    # Movimentações
    total_sales = Column(Numeric(10, 2), default=0)
    total_cash = Column(Numeric(10, 2), default=0)
    total_card = Column(Numeric(10, 2), default=0)
    total_pix = Column(Numeric(10, 2), default=0)
    withdrawals = Column(Numeric(10, 2), default=0)  # Sangrias
    deposits = Column(Numeric(10, 2), default=0)  # Suprimentos

    # Status
    status = Column(String(20), default='open', nullable=False)  # open, closed, balanced

    # Observações
    opening_notes = Column(Text)
    closing_notes = Column(Text)

    # Relacionamentos
    cash_register = relationship('CashRegister', back_populates='sessions')
    operator = relationship('User')
    sales = relationship('Sale', back_populates='session')
    movements = relationship('CashMovement', back_populates='session')

    __table_args__ = (
        CheckConstraint(
            "status IN ('open', 'closed', 'balanced')",
            name='check_cash_session_status'
        ),
    )

    def __repr__(self):
        return f'<CashSession {self.cash_register_id} opened_at={self.opened_at}>'

    def to_dict(self):
        return {
            'id': str(self.id),
            'cash_register_id': str(self.cash_register_id),
            'operator_id': str(self.operator_id),
            'opened_at': self.opened_at.isoformat(),
            'closed_at': self.closed_at.isoformat() if self.closed_at else None,
            'opening_balance': float(self.opening_balance),
            'closing_balance': float(self.closing_balance) if self.closing_balance else None,
            'total_sales': float(self.total_sales),
            'status': self.status
        }


class CashMovement(db.Model):
    """Movimentações de caixa (sangria/suprimento)"""
    __tablename__ = 'cash_movements'

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

    # Sessão
    session_id = Column(UUID(as_uuid=True), ForeignKey('cash_sessions.id'), nullable=False)

    # Movimento
    type = Column(String(20), nullable=False)  # withdrawal, deposit
    amount = Column(Numeric(10, 2), nullable=False)
    reason = Column(String(500))

    # Autorização
    authorized_by = Column(UUID(as_uuid=True), ForeignKey('users.id'))

    # Timestamps
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)

    # Relacionamentos
    session = relationship('CashSession', back_populates='movements')
    authorizer = relationship('User', foreign_keys=[authorized_by])

    __table_args__ = (
        CheckConstraint(
            "type IN ('withdrawal', 'deposit')",
            name='check_cash_movement_type'
        ),
    )


class Sale(db.Model):
    """Vendas realizadas no PDV"""
    __tablename__ = 'sales'

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

    # Vínculo com pedido (se houver)
    order_id = Column(UUID(as_uuid=True), ForeignKey('orders.id'))

    # PDV
    cash_register_id = Column(UUID(as_uuid=True), ForeignKey('cash_registers.id'), nullable=False)
    session_id = Column(UUID(as_uuid=True), ForeignKey('cash_sessions.id'), nullable=False)
    operator_id = Column(UUID(as_uuid=True), ForeignKey('users.id'), nullable=False)

    # Cliente (opcional)
    customer_id = Column(UUID(as_uuid=True), ForeignKey('customers.id'))

    # Valores
    subtotal = Column(Numeric(10, 2), nullable=False)
    discount = Column(Numeric(10, 2), default=0)
    tax = Column(Numeric(10, 2), default=0)
    total = Column(Numeric(10, 2), nullable=False)

    # Pagamento
    payment_method = Column(String(50), nullable=False)  # cash, card, pix, mixed
    payment_status = Column(String(20), default='completed')  # completed, pending, cancelled

    # Valor pago e troco
    amount_paid = Column(Numeric(10, 2))
    change_amount = Column(Numeric(10, 2), default=0)

    # Fiscal
    fiscal_number = Column(String(100))  # Número da NFC-e/SAT
    fiscal_key = Column(String(200))  # Chave de acesso
    fiscal_status = Column(String(20))  # pending, issued, cancelled

    # Status
    status = Column(String(20), default='completed')  # completed, cancelled, refunded

    # Timestamps
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)
    cancelled_at = Column(DateTime(timezone=True))
    cancellation_reason = Column(Text)

    # Relacionamentos
    cash_register = relationship('CashRegister', back_populates='sales')
    session = relationship('CashSession', back_populates='sales')
    operator = relationship('User', foreign_keys=[operator_id])
    customer = relationship('Customer')
    order = relationship('Order')
    items = relationship('SaleItem', back_populates='sale', cascade='all, delete-orphan')

    __table_args__ = (
        CheckConstraint(
            "payment_method IN ('cash', 'debit_card', 'credit_card', 'pix', 'mixed')",
            name='check_sale_payment_method'
        ),
        Index('idx_sale_session', 'session_id'),
        Index('idx_sale_created', 'created_at'),
    )

    def __repr__(self):
        return f'<Sale {self.id} total={self.total}>'

    def to_dict(self):
        return {
            'id': str(self.id),
            'cash_register_id': str(self.cash_register_id),
            'session_id': str(self.session_id),
            'customer_id': str(self.customer_id) if self.customer_id else None,
            'subtotal': float(self.subtotal),
            'discount': float(self.discount),
            'total': float(self.total),
            'payment_method': self.payment_method,
            'payment_status': self.payment_status,
            'status': self.status,
            'created_at': self.created_at.isoformat(),
            'items': [item.to_dict() for item in self.items] if hasattr(self, 'items') else []
        }


class SaleItem(db.Model):
    """Itens de uma venda no PDV"""
    __tablename__ = 'sale_items'

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

    # Venda
    sale_id = Column(UUID(as_uuid=True), ForeignKey('sales.id'), nullable=False)

    # Produto
    product_id = Column(UUID(as_uuid=True), ForeignKey('products.id'), nullable=False)
    product_name = Column(String(500))  # Nome no momento da venda
    product_sku = Column(String(100))

    # Quantidade e valores
    quantity = Column(Numeric(10, 3), nullable=False)
    unit_price = Column(Numeric(10, 2), nullable=False)
    discount = Column(Numeric(10, 2), default=0)
    total = Column(Numeric(10, 2), nullable=False)

    # Relacionamentos
    sale = relationship('Sale', back_populates='items')
    product = relationship('Product')

    def __repr__(self):
        return f'<SaleItem sale={self.sale_id} product={self.product_id}>'

    def to_dict(self):
        return {
            'id': str(self.id),
            'sale_id': str(self.sale_id),
            'product_id': str(self.product_id),
            'product_name': self.product_name,
            'quantity': float(self.quantity),
            'unit_price': float(self.unit_price),
            'discount': float(self.discount),
            'total': float(self.total)
        }
