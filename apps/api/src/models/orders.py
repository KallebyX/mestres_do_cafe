"""
Modelos de pedidos e carrinho
"""

import uuid
from enum import Enum

from sqlalchemy import (
    DECIMAL,
    Boolean,
    Column,
    Date,
    DateTime,
    ForeignKey,
    Integer,
    String,
    Text,
)
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from database import db


class OrderStatus(Enum):
    PENDING = "pending"
    PROCESSING = "processing"
    SHIPPED = "shipped"
    DELIVERED = "delivered"
    CANCELLED = "cancelled"
    REFUNDED = "refunded"


class PaymentStatus(Enum):
    PENDING = "pending"
    PAID = "paid"
    FAILED = "failed"
    REFUNDED = "refunded"
    PARTIALLY_REFUNDED = "partially_refunded"


class Order(db.Model):
    __tablename__ = "orders"

    id = Column(String(36), primary_key = True, default=lambda: str(uuid.uuid4()))
    order_number = Column(String(50), unique = True, nullable = False)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="SET NULL"))
    customer_id = Column(
        String(36), ForeignKey("customers.id", ondelete="SET NULL")
    )

    # Status
    status = Column(String(20), default="pending")
    payment_status = Column(String(20), default="pending")

    # Valores
    subtotal = Column(DECIMAL(10, 2), nullable = False)
    discount_amount = Column(DECIMAL(10, 2), default = 0.00)
    shipping_cost = Column(DECIMAL(10, 2), default = 0.00)
    tax_amount = Column(DECIMAL(10, 2), default = 0.00)
    total_amount = Column(DECIMAL(10, 2), nullable = False)

    # Cupom
    coupon_code = Column(String(50))
    coupon_discount = Column(DECIMAL(10, 2), default = 0.00)

    # Endereço (JSON como TEXT para compatibilidade)
    shipping_address = Column(Text)
    billing_address = Column(Text)

    # Entrega
    shipping_method = Column(String(100))
    tracking_code = Column(String(100))
    estimated_delivery_date = Column(Date)
    delivered_at = Column(DateTime)

    # Observações
    notes = Column(Text)
    admin_notes = Column(Text)

    # Controle
    created_at = Column(DateTime, default = func.now())
    updated_at = Column(DateTime, default = func.now(), onupdate = func.now())

    # Relacionamentos
    user = relationship("User", back_populates="orders")
    customer = relationship("Customer", back_populates="orders")
    items = relationship("OrderItem", back_populates="order")
    payments = relationship("Payment", back_populates="order")
    refunds = relationship("Refund", back_populates="order")
    disputes = relationship("PaymentDispute", back_populates="order")

    def __repr__(self):
        return f"<Order(id={self.id}, order_number={self.order_number}, status={self.status})>"

    def to_dict(self):
        return {
            "id": str(self.id),
            "order_number": self.order_number,
            "user_id": str(self.user_id) if self.user_id else None,
            "customer_id": str(self.customer_id) if self.customer_id else None,
            "status": self.status,
            "payment_status": self.payment_status,
            "subtotal": float(self.subtotal) if self.subtotal else 0.00,
            "discount_amount": (
                float(self.discount_amount) if self.discount_amount else 0.00
            ),
            "shipping_cost": float(self.shipping_cost) if self.shipping_cost else 0.00,
            "tax_amount": float(self.tax_amount) if self.tax_amount else 0.00,
            "total_amount": float(self.total_amount) if self.total_amount else 0.00,
            "coupon_code": self.coupon_code,
            "coupon_discount": (
                float(self.coupon_discount) if self.coupon_discount else 0.00
            ),
            "shipping_address": self.shipping_address,
            "billing_address": self.billing_address,
            "shipping_method": self.shipping_method,
            "tracking_code": self.tracking_code,
            "estimated_delivery_date": (
                self.estimated_delivery_date.isoformat()
                if self.estimated_delivery_date
                else None
            ),
            "delivered_at": (
                self.delivered_at.isoformat() if self.delivered_at else None
            ),
            "notes": self.notes,
            "admin_notes": self.admin_notes,
            "created_at": self.created_at.isoformat(),
            "updated_at": self.updated_at.isoformat(),
        }


class OrderItem(db.Model):
    __tablename__ = "order_items"

    id = Column(String(36), primary_key = True, default=lambda: str(uuid.uuid4()))
    order_id = Column(String(36), ForeignKey("orders.id", ondelete="CASCADE"))
    product_id = Column(
        String(36), ForeignKey("products.id", ondelete="SET NULL")
    )
    variant_id = Column(
        String(36), ForeignKey("product_variants.id", ondelete="SET NULL")
    )

    # Dados do produto no momento do pedido
    product_name = Column(String(255), nullable = False)
    product_sku = Column(String(100))
    product_image = Column(Text)

    # Quantidade e preços
    quantity = Column(Integer, nullable = False)
    unit_price = Column(DECIMAL(10, 2), nullable = False)
    total_price = Column(DECIMAL(10, 2), nullable = False)

    # Metadados
    product_data = Column(Text)  # JSON como TEXT

    created_at = Column(DateTime, default = func.now())

    # Relacionamentos
    order = relationship("Order", back_populates="items")
    product = relationship("Product", back_populates="order_items")
    variant = relationship("ProductVariant", back_populates="order_items")

    def __repr__(self):
        return f"<OrderItem(id={self.id}, product_name={self.product_name}, quantity={self.quantity})>"

    def to_dict(self):
        return {
            "id": str(self.id),
            "order_id": str(self.order_id),
            "product_id": str(self.product_id) if self.product_id else None,
            "variant_id": str(self.variant_id) if self.variant_id else None,
            "product_name": self.product_name,
            "product_sku": self.product_sku,
            "product_image": self.product_image,
            "quantity": self.quantity,
            "unit_price": float(self.unit_price) if self.unit_price else 0.00,
            "total_price": float(self.total_price) if self.total_price else 0.00,
            "product_data": self.product_data,
            "created_at": self.created_at.isoformat(),
        }


class Cart(db.Model):
    __tablename__ = "carts"

    id = Column(String(36), primary_key = True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"))
    session_id = Column(String(255))
    created_at = Column(DateTime, default = func.now())
    updated_at = Column(DateTime, default = func.now(), onupdate = func.now())

    # Relacionamentos
    user = relationship("User")
    items = relationship("CartItem", back_populates="cart")

    def __repr__(self):
        return f"<Cart(id={self.id}, user_id={self.user_id})>"

    def to_dict(self):
        return {
            "id": str(self.id),
            "user_id": str(self.user_id) if self.user_id else None,
            "session_id": self.session_id,
            "created_at": self.created_at.isoformat(),
            "updated_at": self.updated_at.isoformat(),
        }


class CartItem(db.Model):
    __tablename__ = "cart_items"

    id = Column(String(36), primary_key = True, default=lambda: str(uuid.uuid4()))
    cart_id = Column(
        String(36), ForeignKey("carts.id", ondelete="CASCADE"), nullable = False
    )
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"))
    session_id = Column(String(255))
    product_id = Column(
        String(36), ForeignKey("products.id", ondelete="CASCADE")
    )
    variant_id = Column(
        String(36), ForeignKey("product_variants.id", ondelete="SET NULL")
    )
    # 🔥 CORREÇÃO: Adicionar suporte a preços por peso
    product_price_id = Column(
        String(36), ForeignKey("product_prices.id", ondelete="SET NULL")
    )
    weight = Column(String(50))  # "250g", "500g", "1kg" - backup do peso
    unit_price = Column(DECIMAL(10, 2))  # Preço unitário no momento da adição
    quantity = Column(Integer, nullable = False)
    added_at = Column(DateTime, default = func.now())
    created_at = Column(DateTime, default = func.now())
    updated_at = Column(DateTime, default = func.now(), onupdate = func.now())

    # Relacionamentos
    cart = relationship("Cart", back_populates="items")
    user = relationship("User", back_populates="cart_items")
    product = relationship("Product", back_populates="cart_items")
    variant = relationship("ProductVariant", back_populates="cart_items")
    product_price = relationship("ProductPrice")

    def __repr__(self):
        return f"<CartItem(id={self.id}, cart_id={self.cart_id}, product_id={self.product_id}, quantity={self.quantity})>"

    def to_dict(self):
        return {
            "id": str(self.id),
            "cart_id": str(self.cart_id) if self.cart_id else None,
            "user_id": str(self.user_id) if self.user_id else None,
            "session_id": self.session_id,
            "product_id": str(self.product_id),
            "variant_id": str(self.variant_id) if self.variant_id else None,
            # 🔥 CORREÇÃO: Novos campos para preços por peso
            "product_price_id": str(self.product_price_id) if self.product_price_id else None,
            "weight": self.weight,
            "unit_price": float(self.unit_price) if self.unit_price else None,
            "quantity": self.quantity,
            "added_at": self.added_at.isoformat() if self.added_at else None,
            "created_at": self.created_at.isoformat(),
            "updated_at": self.updated_at.isoformat(),
        }


class AbandonedCart(db.Model):
    __tablename__ = "abandoned_carts"

    id = Column(String(36), primary_key = True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"))
    cart_data = Column(Text, nullable = False)  # JSON como TEXT
    total_amount = Column(DECIMAL(10, 2))
    recovery_email_sent = Column(Boolean, default = False)
    recovered_at = Column(DateTime)
    created_at = Column(DateTime, default = func.now())

    def __repr__(self):
        return f"<AbandonedCart(id={self.id}, user_id={self.user_id}, total_amount={self.total_amount})>"

    def to_dict(self):
        return {
            "id": str(self.id),
            "user_id": str(self.user_id),
            "cart_data": self.cart_data,
            "total_amount": float(self.total_amount) if self.total_amount else None,
            "recovery_email_sent": self.recovery_email_sent,
            "recovered_at": (
                self.recovered_at.isoformat() if self.recovered_at else None
            ),
            "created_at": self.created_at.isoformat(),
        }
