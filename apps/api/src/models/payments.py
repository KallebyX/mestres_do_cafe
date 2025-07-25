"""
Modelos de pagamentos e transações
"""

from sqlalchemy import Column, String, Text, Integer, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.types import DECIMAL
from datetime import datetime
from uuid import uuid4
from enum import Enum

from database import db


class PaymentStatus(Enum):
    PENDING = "pending"
    HELD = "held"  # Escrow - pagamento retido até confirmação de entrega
    PAID = "paid"
    FAILED = "failed"
    REFUNDED = "refunded"
    PARTIALLY_REFUNDED = "partially_refunded"
    RELEASED = "released"  # Escrow liberado para o vendedor
    DISPUTED = "disputed"  # Em disputa


class Payment(db.Model):
    __tablename__ = 'payments'

    id = Column(String(36), primary_key = True, default = uuid4)
    order_id = Column(String(36), ForeignKey('orders.id'))
    vendor_id = Column(String(36), ForeignKey('vendors.id'))  # Para split payments
    amount = Column(DECIMAL(10, 2), nullable = False)
    currency = Column(String(3), default='BRL')
    status = Column(String(20), default='pending')
    payment_method = Column(String(50), nullable = False)
    provider = Column(String(50))
    provider_transaction_id = Column(String(255))
    provider_response = Column(Text)
    processed_at = Column(DateTime)
    # Campos específicos do escrow
    held_at = Column(DateTime)  # Quando o pagamento foi retido
    released_at = Column(DateTime)  # Quando foi liberado para o vendedor
    release_eligible_at = Column(DateTime)  # Quando se torna elegível para liberação automática
    escrow_reason = Column(String(255))  # Motivo da retenção
    created_at = Column(DateTime, default = datetime.utcnow)
    updated_at = Column(DateTime, default = datetime.utcnow, onupdate = datetime.utcnow)

    # Relacionamentos
    order = relationship("Order", back_populates="payments")
    vendor = relationship("Vendor", back_populates="payments")
    refunds = relationship("Refund", back_populates="payment")
    disputes = relationship("PaymentDispute", back_populates="payment")

    def __repr__(self):
        return f"<Payment(id={self.id}, amount={self.amount}, status={self.status})>"

    def to_dict(self):
        return {
            'id': str(self.id),
            'order_id': str(self.order_id) if self.order_id else None,
            'vendor_id': str(self.vendor_id) if self.vendor_id else None,
            'amount': float(self.amount) if self.amount else 0.00,
            'currency': self.currency,
            'status': self.status,
            'payment_method': self.payment_method,
            'provider': self.provider,
            'provider_transaction_id': self.provider_transaction_id,
            'provider_response': self.provider_response,
            'processed_at': self.processed_at.isoformat() if self.processed_at else None,
            'held_at': self.held_at.isoformat() if self.held_at else None,
            'released_at': self.released_at.isoformat() if self.released_at else None,
            'release_eligible_at': self.release_eligible_at.isoformat() if self.release_eligible_at else None,
            'escrow_reason': self.escrow_reason,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }

    def hold_payment(self, reason="Marketplace escrow - awaiting delivery confirmation"):
        """Move payment to held status for escrow"""
        self.status = PaymentStatus.HELD.value
        self.held_at = datetime.utcnow()
        self.escrow_reason = reason
        # Pagamento fica retido por 7 dias após entrega confirmada
        from datetime import timedelta
        self.release_eligible_at = datetime.utcnow() + timedelta(days = 7)

    def release_payment(self):
        """Release payment from escrow to vendor"""
        self.status = PaymentStatus.RELEASED.value
        self.released_at = datetime.utcnow()

    def dispute_payment(self, reason):
        """Move payment to disputed status"""
        self.status = PaymentStatus.DISPUTED.value
        self.escrow_reason = reason

    def is_eligible_for_release(self):
        """Check if payment is eligible for automatic release"""
        return (
            self.status == PaymentStatus.HELD.value and
            self.release_eligible_at and
            datetime.utcnow() >= self.release_eligible_at
        )


class Refund(db.Model):
    __tablename__ = 'refunds'

    id = Column(String(36), primary_key = True, default = uuid4)
    payment_id = Column(String(36), ForeignKey('payments.id'))
    order_id = Column(String(36), ForeignKey('orders.id'))
    amount = Column(DECIMAL(10, 2), nullable = False)
    reason = Column(String(255))
    status = Column(String(20), default='pending')
    provider_refund_id = Column(String(255))
    provider_response = Column(Text)
    processed_at = Column(DateTime)
    created_at = Column(DateTime, default = datetime.utcnow)

    # Relacionamentos
    payment = relationship("Payment", back_populates="refunds")
    order = relationship("Order", back_populates="refunds")

    def __repr__(self):
        return f"<Refund(id={self.id}, amount={self.amount}, status={self.status})>"

    def to_dict(self):
        return {
            'id': str(self.id),
            'payment_id': str(self.payment_id) if self.payment_id else None,
            'order_id': str(self.order_id) if self.order_id else None,
            'amount': float(self.amount) if self.amount else 0.00,
            'reason': self.reason,
            'status': self.status,
            'provider_refund_id': self.provider_refund_id,
            'provider_response': self.provider_response,
            'processed_at': self.processed_at.isoformat() if self.processed_at else None,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }


class PaymentDispute(db.Model):
    __tablename__ = 'payment_disputes'

    id = Column(String(36), primary_key = True, default = uuid4)
    payment_id = Column(String(36), ForeignKey('payments.id'))
    order_id = Column(String(36), ForeignKey('orders.id'))
    customer_id = Column(String(36), ForeignKey('customers.id'))
    vendor_id = Column(String(36), ForeignKey('vendors.id'))

    # Detalhes da disputa
    reason = Column(String(100), nullable = False)  # 'not_delivered', 'damaged', 'not_as_described', 'other'
    description = Column(Text, nullable = False)
    status = Column(String(20), default='open')  # 'open', 'investigating', 'resolved', 'closed'

    # Resolução
    resolution = Column(String(100))  # 'refund', 'partial_refund', 'replace', 'favor_vendor'
    resolution_notes = Column(Text)
    resolved_by = Column(String(36), ForeignKey('users.id'))
    resolved_at = Column(DateTime)

    # Controle
    created_at = Column(DateTime, default = datetime.utcnow)
    updated_at = Column(DateTime, default = datetime.utcnow, onupdate = datetime.utcnow)

    # Relacionamentos
    payment = relationship("Payment", back_populates="disputes")
    order = relationship("Order", back_populates="disputes")
    customer = relationship("Customer", back_populates="disputes")
    vendor = relationship("Vendor", back_populates="disputes")
    resolver = relationship("User", foreign_keys=[resolved_by])

    def __repr__(self):
        return f"<PaymentDispute(id={self.id}, reason={self.reason}, status={self.status})>"

    def to_dict(self):
        return {
            'id': str(self.id),
            'payment_id': str(self.payment_id) if self.payment_id else None,
            'order_id': str(self.order_id) if self.order_id else None,
            'customer_id': str(self.customer_id) if self.customer_id else None,
            'vendor_id': str(self.vendor_id) if self.vendor_id else None,
            'reason': self.reason,
            'description': self.description,
            'status': self.status,
            'resolution': self.resolution,
            'resolution_notes': self.resolution_notes,
            'resolved_by': str(self.resolved_by) if self.resolved_by else None,
            'resolved_at': self.resolved_at.isoformat() if self.resolved_at else None,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }


class EscrowTransaction(db.Model):
    __tablename__ = 'escrow_transactions'

    id = Column(String(36), primary_key = True, default = uuid4)
    payment_id = Column(String(36), ForeignKey('payments.id'))
    order_id = Column(String(36), ForeignKey('orders.id'))
    vendor_id = Column(String(36), ForeignKey('vendors.id'))

    # Valores do escrow
    amount = Column(DECIMAL(10, 2), nullable = False)
    platform_fee = Column(DECIMAL(10, 2), default = 0.00)
    vendor_amount = Column(DECIMAL(10, 2), nullable = False)  # Valor final para o vendedor

    # Status e controle
    status = Column(String(20), default='held')  # 'held', 'released', 'disputed', 'refunded'
    held_reason = Column(String(255))
    release_eligible_at = Column(DateTime)

    # Datas importantes
    held_at = Column(DateTime, default = datetime.utcnow)
    released_at = Column(DateTime)

    # Relacionamentos
    payment = relationship("Payment")
    order = relationship("Order")
    vendor = relationship("Vendor")

    def __repr__(self):
        return f"<EscrowTransaction(id={self.id}, amount={self.amount}, status={self.status})>"

    def to_dict(self):
        return {
            'id': str(self.id),
            'payment_id': str(self.payment_id) if self.payment_id else None,
            'order_id': str(self.order_id) if self.order_id else None,
            'vendor_id': str(self.vendor_id) if self.vendor_id else None,
            'amount': float(self.amount) if self.amount else 0.00,
            'platform_fee': float(self.platform_fee) if self.platform_fee else 0.00,
            'vendor_amount': float(self.vendor_amount) if self.vendor_amount else 0.00,
            'status': self.status,
            'held_reason': self.held_reason,
            'release_eligible_at': self.release_eligible_at.isoformat() if self.release_eligible_at else None,
            'held_at': self.held_at.isoformat() if self.held_at else None,
            'released_at': self.released_at.isoformat() if self.released_at else None
        }


class PaymentWebhook(db.Model):
    __tablename__ = 'payment_webhooks'

    id = Column(String(36), primary_key = True, default = uuid4)
    provider = Column(String(50), nullable = False)
    event_type = Column(String(100), nullable = False)
    payload = Column(Text, nullable = False)
    processed = Column(Boolean, default = False)
    processing_error = Column(Text)
    created_at = Column(DateTime, default = datetime.utcnow)
    processed_at = Column(DateTime)

    def __repr__(self):
        return f"<PaymentWebhook(id={self.id}, provider={self.provider}, event_type={self.event_type})>"

    def to_dict(self):
        return {
            'id': str(self.id),
            'provider': self.provider,
            'event_type': self.event_type,
            'payload': self.payload,
            'processed': self.processed,
            'processing_error': self.processing_error,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'processed_at': self.processed_at.isoformat() if self.processed_at else None
        }
