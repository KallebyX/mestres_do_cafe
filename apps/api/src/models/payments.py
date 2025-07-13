"""
Modelos de pagamentos e transações
"""

from sqlalchemy import Column, String, Text, Integer, Boolean, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy.types import DECIMAL
from datetime import datetime
from uuid import uuid4

from ..database import db


class Payment(db.Model):
    __tablename__ = 'payments'
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    order_id = Column(UUID(as_uuid=True), ForeignKey('orders.id'))
    amount = Column(DECIMAL(10, 2), nullable=False)
    currency = Column(String(3), default='BRL')
    status = Column(String(20), default='pending')
    payment_method = Column(String(50), nullable=False)
    provider = Column(String(50))
    provider_transaction_id = Column(String(255))
    provider_response = Column(Text)
    processed_at = Column(DateTime)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relacionamentos
    order = relationship("Order", back_populates="payments")
    refunds = relationship("Refund", back_populates="payment")
    
    def __repr__(self):
        return f"<Payment(id={self.id}, amount={self.amount}, status={self.status})>"
    
    def to_dict(self):
        return {
            'id': str(self.id),
            'order_id': str(self.order_id) if self.order_id else None,
            'amount': float(self.amount) if self.amount else 0.00,
            'currency': self.currency,
            'status': self.status,
            'payment_method': self.payment_method,
            'provider': self.provider,
            'provider_transaction_id': self.provider_transaction_id,
            'provider_response': self.provider_response,
            'processed_at': self.processed_at.isoformat() if self.processed_at else None,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }


class Refund(db.Model):
    __tablename__ = 'refunds'
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    payment_id = Column(UUID(as_uuid=True), ForeignKey('payments.id'))
    order_id = Column(UUID(as_uuid=True), ForeignKey('orders.id'))
    amount = Column(DECIMAL(10, 2), nullable=False)
    reason = Column(String(255))
    status = Column(String(20), default='pending')
    provider_refund_id = Column(String(255))
    provider_response = Column(Text)
    processed_at = Column(DateTime)
    created_at = Column(DateTime, default=datetime.utcnow)
    
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


class PaymentWebhook(db.Model):
    __tablename__ = 'payment_webhooks'
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    provider = Column(String(50), nullable=False)
    event_type = Column(String(100), nullable=False)
    payload = Column(Text, nullable=False)
    processed = Column(Boolean, default=False)
    processing_error = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)
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
