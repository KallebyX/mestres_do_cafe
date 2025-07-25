"""
Modelos de cupons e promoções
"""

import uuid

from sqlalchemy import (
    DECIMAL,
    Boolean,
    Column,
    Date,
    DateTime,
    ForeignKey,
    Integer,
    String,
)
from sqlalchemy import Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from database import db


class Coupon(db.Model):
    __tablename__ = "coupons"
    __table_args__ = {'extend_existing': True}

    id = Column(String(36), primary_key = True, default=lambda: str(uuid.uuid4()))
    code = Column(String(50), unique = True, nullable = False)
    type = Column(String(20), nullable = False)
    value = Column(DECIMAL(10, 2), nullable = False)

    # Condições
    minimum_amount = Column(DECIMAL(10, 2), default = 0.00)
    maximum_discount = Column(DECIMAL(10, 2))
    usage_limit = Column(Integer)
    usage_limit_per_customer = Column(Integer, default = 1)

    # Validade
    start_date = Column(Date)
    end_date = Column(Date)

    # Restrições (JSON como TEXT para compatibilidade SQLite)
    applicable_products = Column(Text)  # JSON string
    applicable_categories = Column(Text)  # JSON string
    exclude_products = Column(Text)  # JSON string

    # Controle
    is_active = Column(Boolean, default = True)
    usage_count = Column(Integer, default = 0)

    created_at = Column(DateTime, default = func.now())
    updated_at = Column(DateTime, default = func.now(), onupdate = func.now())

    # Relacionamentos
    usage_records = relationship("CouponUsage", back_populates="coupon")

    def __repr__(self):
        return f"<Coupon(id={self.id}, code={self.code}, type={self.type}, value={self.value})>"

    def to_dict(self):
        return {
            "id": str(self.id),
            "code": self.code,
            "type": self.type,
            "value": float(self.value) if self.value else 0.00,
            "minimum_amount": (
                float(self.minimum_amount) if self.minimum_amount else 0.00
            ),
            "maximum_discount": (
                float(self.maximum_discount) if self.maximum_discount else None
            ),
            "usage_limit": self.usage_limit,
            "usage_limit_per_customer": self.usage_limit_per_customer,
            "start_date": self.start_date.isoformat() if self.start_date else None,
            "end_date": self.end_date.isoformat() if self.end_date else None,
            "applicable_products": self.applicable_products,
            "applicable_categories": self.applicable_categories,
            "exclude_products": self.exclude_products,
            "is_active": self.is_active,
            "usage_count": self.usage_count,
            "created_at": self.created_at.isoformat(),
            "updated_at": self.updated_at.isoformat(),
        }


class CouponUsage(db.Model):
    __tablename__ = "coupon_usage"
    __table_args__ = {'extend_existing': True}

    id = Column(String(36), primary_key = True, default=lambda: str(uuid.uuid4()))
    coupon_id = Column(String(36), ForeignKey("coupons.id", ondelete="CASCADE"))
    user_id = Column(String(36), ForeignKey("users.id", ondelete="SET NULL"))
    order_id = Column(String(36), ForeignKey("orders.id", ondelete="SET NULL"))
    discount_amount = Column(DECIMAL(10, 2), nullable = False)
    used_at = Column(DateTime, default = func.now())

    # Relacionamentos
    coupon = relationship("Coupon", back_populates="usage_records")

    def __repr__(self):
        return f"<CouponUsage(id={self.id}, coupon_id={self.coupon_id}, discount_amount={self.discount_amount})>"

    def to_dict(self):
        return {
            "id": str(self.id),
            "coupon_id": str(self.coupon_id),
            "user_id": str(self.user_id) if self.user_id else None,
            "order_id": str(self.order_id) if self.order_id else None,
            "discount_amount": (
                float(self.discount_amount) if self.discount_amount else 0.00
            ),
            "used_at": self.used_at.isoformat(),
        }
