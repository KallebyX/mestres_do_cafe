"""
Modelos para gerenciamento de fornecedores
"""

import uuid

from sqlalchemy import (
    Boolean,
    Column,
    DateTime,
    Integer,
    String,
    Text,
    DECIMAL,
)
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from database import db


class Supplier(db.Model):
    __tablename__ = 'suppliers'

    id = Column(String(36), primary_key = True, default=lambda: str(uuid.uuid4()))
    name = Column(String(255), nullable = False)
    email = Column(String(255), nullable = False, unique = True)
    cnpj = Column(String(18), nullable = False, unique = True)
    phone = Column(String(20))
    contact_person = Column(String(255))

    # Endereço
    address = Column(String(255))
    city = Column(String(100))
    state = Column(String(2))
    postal_code = Column(String(9))
    country = Column(String(100), default='Brasil')

    # Status e configurações
    status = Column(String(20), default='active')
    payment_terms = Column(String(100))
    delivery_time = Column(Integer)  # em dias
    notes = Column(Text)

    # Métricas
    total_orders = Column(Integer, default = 0)
    total_value = Column(DECIMAL(10, 2), default = 0.00)
    avg_delivery_time = Column(Integer, default = 0)
    reliability_score = Column(Integer, default = 100)

    # Controle
    is_active = Column(Boolean, default = True)
    created_at = Column(DateTime, default = func.now())
    updated_at = Column(DateTime, default = func.now(), onupdate = func.now())

    # Relacionamentos
    products = relationship("Product", back_populates="supplier")
    purchase_orders = relationship("PurchaseOrder", back_populates="supplier")

    def __repr__(self):
        return f"<Supplier(id={self.id}, name={self.name}, cnpj={self.cnpj})>"

    def to_dict(self):
        return {
            'id': str(self.id),
            'name': self.name,
            'email': self.email,
            'cnpj': self.cnpj,
            'phone': self.phone,
            'contact_person': self.contact_person,
            'address': self.address,
            'city': self.city,
            'state': self.state,
            'postal_code': self.postal_code,
            'country': self.country,
            'status': self.status,
            'payment_terms': self.payment_terms,
            'delivery_time': self.delivery_time,
            'notes': self.notes,
            'total_orders': self.total_orders,
            'total_value': float(self.total_value) if self.total_value else 0.00,
            'avg_delivery_time': self.avg_delivery_time,
            'reliability_score': self.reliability_score,
            'is_active': self.is_active,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }


class PurchaseOrder(db.Model):
    __tablename__ = 'purchase_orders'

    id = Column(String(36), primary_key = True, default=lambda: str(uuid.uuid4()))
    supplier_id = Column(
        String(36),
        db.ForeignKey('suppliers.id', ondelete='CASCADE'),
        nullable = False
    )
    order_number = Column(String(50), unique = True, nullable = False)
    status = Column(String(20), default='pending')

    # Valores
    subtotal = Column(DECIMAL(10, 2), default = 0.00)
    tax_amount = Column(DECIMAL(10, 2), default = 0.00)
    shipping_cost = Column(DECIMAL(10, 2), default = 0.00)
    total_amount = Column(DECIMAL(10, 2), default = 0.00)

    # Datas
    order_date = Column(DateTime, default = func.now())
    expected_delivery = Column(DateTime)
    delivery_date = Column(DateTime)

    # Observações
    notes = Column(Text)

    # Controle
    created_at = Column(DateTime, default = func.now())
    updated_at = Column(DateTime, default = func.now(), onupdate = func.now())

    # Relacionamentos
    supplier = relationship("Supplier", back_populates="purchase_orders")
    items = relationship("PurchaseOrderItem", back_populates="purchase_order")

    def __repr__(self):
        return f"<PurchaseOrder(id={self.id}, order_number={self.order_number}, status={self.status})>"

    def to_dict(self):
        return {
            'id': str(self.id),
            'supplier_id': str(self.supplier_id),
            'order_number': self.order_number,
            'status': self.status,
            'subtotal': float(self.subtotal) if self.subtotal else 0.00,
            'tax_amount': float(self.tax_amount) if self.tax_amount else 0.00,
            'shipping_cost': float(self.shipping_cost) if self.shipping_cost else 0.00,
            'total_amount': float(self.total_amount) if self.total_amount else 0.00,
            'order_date': self.order_date.isoformat(),
            'expected_delivery': self.expected_delivery.isoformat() if self.expected_delivery else None,
            'delivery_date': self.delivery_date.isoformat() if self.delivery_date else None,
            'notes': self.notes,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }


class PurchaseOrderItem(db.Model):
    __tablename__ = 'purchase_order_items'

    id = Column(String(36), primary_key = True, default=lambda: str(uuid.uuid4()))
    purchase_order_id = Column(
        String(36),
        db.ForeignKey('purchase_orders.id', ondelete='CASCADE'),
        nullable = False
    )
    product_id = Column(
        String(36),
        db.ForeignKey('products.id', ondelete='CASCADE'),
        nullable = False
    )

    # Detalhes do item
    product_name = Column(String(255), nullable = False)
    product_sku = Column(String(100))
    quantity = Column(Integer, nullable = False)
    unit_price = Column(DECIMAL(10, 2), nullable = False)
    total_price = Column(DECIMAL(10, 2), nullable = False)

    # Quantidade recebida
    received_quantity = Column(Integer, default = 0)

    # Controle
    created_at = Column(DateTime, default = func.now())

    # Relacionamentos
    purchase_order = relationship("PurchaseOrder", back_populates="items")
    product = relationship("Product")

    def __repr__(self):
        return f"<PurchaseOrderItem(id={self.id}, product_name={self.product_name}, quantity={self.quantity})>"

    def to_dict(self):
        return {
            'id': str(self.id),
            'purchase_order_id': str(self.purchase_order_id),
            'product_id': str(self.product_id),
            'product_name': self.product_name,
            'product_sku': self.product_sku,
            'quantity': self.quantity,
            'unit_price': float(self.unit_price),
            'total_price': float(self.total_price),
            'received_quantity': self.received_quantity,
            'created_at': self.created_at.isoformat()
        }
