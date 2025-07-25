"""
Modelos financeiros
"""

import uuid

from sqlalchemy import (
    DECIMAL,
    Boolean,
    Column,
    Date,
    DateTime,
    ForeignKey,
    String,
    Text,
)
from sqlalchemy.sql import func

from database import db


class FinancialAccount(db.Model):
    __tablename__ = "financial_accounts"

    id = Column(String(36), primary_key = True, default=lambda: str(uuid.uuid4()))
    name = Column(String(255), nullable = False)
    type = Column(String(50), nullable = False)
    balance = Column(DECIMAL(12, 2), default = 0.00)
    currency = Column(String(3), default="BRL")
    bank_name = Column(String(255))
    account_number = Column(String(50))
    is_active = Column(Boolean, default = True)
    created_at = Column(DateTime, default = func.now())
    updated_at = Column(DateTime, default = func.now(), onupdate = func.now())

    def __repr__(self):
        return f"<FinancialAccount(id={self.id}, name={self.name}, type={self.type})>"

    def to_dict(self):
        return {
            "id": str(self.id),
            "name": self.name,
            "type": self.type,
            "balance": float(self.balance) if self.balance else 0.00,
            "currency": self.currency,
            "bank_name": self.bank_name,
            "account_number": self.account_number,
            "is_active": self.is_active,
            "created_at": self.created_at.isoformat(),
            "updated_at": self.updated_at.isoformat(),
        }


class FinancialTransaction(db.Model):
    __tablename__ = "financial_transactions"

    id = Column(String(36), primary_key = True, default=lambda: str(uuid.uuid4()))
    account_id = Column(
        String(36), ForeignKey("financial_accounts.id", ondelete="CASCADE")
    )
    type = Column(String(20), nullable = False)
    category = Column(String(100))
    amount = Column(DECIMAL(12, 2), nullable = False)
    description = Column(Text)

    # Referências
    customer_id = Column(
        String(36), ForeignKey("customers.id", ondelete="SET NULL")
    )
    order_id = Column(String(36), ForeignKey("orders.id", ondelete="SET NULL"))

    # Datas
    transaction_date = Column(Date, nullable = False)
    due_date = Column(Date)
    paid_date = Column(Date)

    # Status
    status = Column(String(20), default="pending")

    # Controle
    created_at = Column(DateTime, default = func.now())
    updated_at = Column(DateTime, default = func.now(), onupdate = func.now())

    def __repr__(self):
        return f"<FinancialTransaction(id={self.id}, type={self.type}, amount={self.amount})>"

    def to_dict(self):
        return {
            "id": str(self.id),
            "account_id": str(self.account_id),
            "type": self.type,
            "category": self.category,
            "amount": float(self.amount) if self.amount else 0.00,
            "description": self.description,
            "customer_id": str(self.customer_id) if self.customer_id else None,
            "order_id": str(self.order_id) if self.order_id else None,
            "transaction_date": self.transaction_date.isoformat(),
            "due_date": self.due_date.isoformat() if self.due_date else None,
            "paid_date": self.paid_date.isoformat() if self.paid_date else None,
            "status": self.status,
            "created_at": self.created_at.isoformat(),
            "updated_at": self.updated_at.isoformat(),
        }
