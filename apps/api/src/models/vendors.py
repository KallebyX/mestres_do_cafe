"""
Modelos para sistema multi-vendor do marketplace
"""

import uuid
from decimal import Decimal
from sqlalchemy import Boolean, Column, DateTime, String, Text, Numeric, Integer, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from database import db


class Vendor(db.Model):
    __tablename__ = "vendors"
    __table_args__ = {'extend_existing': True}

    id = Column(String(36), primary_key = True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey("users.id"), nullable = False)

    # Informações básicas
    business_name = Column(String(255), nullable = False)
    legal_name = Column(String(255))
    description = Column(Text)
    logo_url = Column(String(500))
    banner_url = Column(String(500))

    # Documentação
    cnpj = Column(String(18), unique = True)
    cpf = Column(String(14))
    tax_id = Column(String(50))

    # Contato
    email = Column(String(255), nullable = False)
    phone = Column(String(20))
    website = Column(String(255))

    # Endereço
    address_street = Column(String(255))
    address_number = Column(String(20))
    address_complement = Column(String(100))
    address_neighborhood = Column(String(100))
    address_city = Column(String(100))
    address_state = Column(String(50))
    address_cep = Column(String(10))
    address_country = Column(String(50), default="Brasil")

    # Status e aprovação
    status = Column(String(20), default="pending")  # pending, approved, rejected, suspended
    approval_status = Column(String(20), default="pending")
    approved_at = Column(DateTime)
    approved_by = Column(String(36), ForeignKey("users.id"))
    rejection_reason = Column(Text)

    # Configurações comerciais
    commission_rate = Column(Numeric(5, 2), default = Decimal("10.00"))  # % de comissão
    payment_method = Column(String(50))  # bank_transfer, pix, etc.
    bank_account = Column(Text)  # JSON com dados bancários

    # Métricas
    total_sales = Column(Numeric(12, 2), default = Decimal("0.00"))
    total_orders = Column(Integer, default = 0)
    total_products = Column(Integer, default = 0)
    rating = Column(Numeric(3, 2), default = Decimal("0.00"))
    review_count = Column(Integer, default = 0)

    # Configurações de loja
    store_slug = Column(String(100), unique = True)
    store_settings = Column(Text)  # JSON com configurações da loja

    # Timestamps
    created_at = Column(DateTime, default = func.now())
    updated_at = Column(DateTime, default = func.now(), onupdate = func.now())

    # Relacionamentos
    user = relationship("User", foreign_keys=[user_id])
    approved_by_user = relationship("User", foreign_keys=[approved_by])
    products = relationship("VendorProduct", back_populates="vendor")
    orders = relationship("VendorOrder", back_populates="vendor")
    commissions = relationship("VendorCommission", back_populates="vendor")
    payments = relationship("Payment", back_populates="vendor")
    disputes = relationship("PaymentDispute", back_populates="vendor")

    def __repr__(self):
        return f"<Vendor(id={self.id}, business_name={self.business_name})>"

    def to_dict(self):
        return {
            "id": str(self.id),
            "user_id": str(self.user_id),
            "business_name": self.business_name,
            "legal_name": self.legal_name,
            "description": self.description,
            "logo_url": self.logo_url,
            "banner_url": self.banner_url,
            "cnpj": self.cnpj,
            "email": self.email,
            "phone": self.phone,
            "website": self.website,
            "address": {
                "street": self.address_street,
                "number": self.address_number,
                "complement": self.address_complement,
                "neighborhood": self.address_neighborhood,
                "city": self.address_city,
                "state": self.address_state,
                "cep": self.address_cep,
                "country": self.address_country
            },
            "status": self.status,
            "approval_status": self.approval_status,
            "approved_at": self.approved_at.isoformat() if self.approved_at else None,
            "commission_rate": float(self.commission_rate),
            "metrics": {
                "total_sales": float(self.total_sales),
                "total_orders": self.total_orders,
                "total_products": self.total_products,
                "rating": float(self.rating),
                "review_count": self.review_count
            },
            "store_slug": self.store_slug,
            "created_at": self.created_at.isoformat(),
            "updated_at": self.updated_at.isoformat()
        }


class VendorProduct(db.Model):
    __tablename__ = "vendor_products"
    __table_args__ = {'extend_existing': True}

    id = Column(String(36), primary_key = True, default=lambda: str(uuid.uuid4()))
    vendor_id = Column(String(36), ForeignKey("vendors.id"), nullable = False)
    product_id = Column(String(36), ForeignKey("products.id"), nullable = False)

    # Preços específicos do vendedor
    vendor_price = Column(Numeric(10, 2), nullable = False)
    vendor_cost = Column(Numeric(10, 2))
    discount_percentage = Column(Numeric(5, 2), default = Decimal("0.00"))

    # Estoque específico do vendedor
    stock_quantity = Column(Integer, default = 0)
    min_stock_alert = Column(Integer, default = 5)

    # Status e aprovação
    status = Column(String(20), default="pending")  # pending, approved, rejected
    is_featured = Column(Boolean, default = False)

    # Configurações de envio
    shipping_weight = Column(Numeric(8, 3))  # kg
    shipping_dimensions = Column(Text)  # JSON com dimensões
    shipping_class = Column(String(50))

    # Métricas
    sales_count = Column(Integer, default = 0)
    view_count = Column(Integer, default = 0)

    # Timestamps
    created_at = Column(DateTime, default = func.now())
    updated_at = Column(DateTime, default = func.now(), onupdate = func.now())

    # Relacionamentos
    vendor = relationship("Vendor", back_populates="products")
    product = relationship("Product")

    def __repr__(self):
        return f"<VendorProduct(vendor_id={self.vendor_id}, product_id={self.product_id})>"

    def to_dict(self):
        return {
            "id": str(self.id),
            "vendor_id": str(self.vendor_id),
            "product_id": str(self.product_id),
            "vendor_price": float(self.vendor_price),
            "vendor_cost": float(self.vendor_cost) if self.vendor_cost else None,
            "discount_percentage": float(self.discount_percentage),
            "stock_quantity": self.stock_quantity,
            "min_stock_alert": self.min_stock_alert,
            "status": self.status,
            "is_featured": self.is_featured,
            "shipping": {
                "weight": float(self.shipping_weight) if self.shipping_weight else None,
                "dimensions": self.shipping_dimensions,
                "class": self.shipping_class
            },
            "metrics": {
                "sales_count": self.sales_count,
                "view_count": self.view_count
            },
            "created_at": self.created_at.isoformat(),
            "updated_at": self.updated_at.isoformat()
        }


class VendorOrder(db.Model):
    __tablename__ = "vendor_orders"
    __table_args__ = {'extend_existing': True}

    id = Column(String(36), primary_key = True, default=lambda: str(uuid.uuid4()))
    vendor_id = Column(String(36), ForeignKey("vendors.id"), nullable = False)
    order_id = Column(String(36), ForeignKey("orders.id"), nullable = False)

    # Valores específicos do vendedor
    subtotal = Column(Numeric(10, 2), nullable = False)
    shipping_cost = Column(Numeric(10, 2), default = Decimal("0.00"))
    commission_amount = Column(Numeric(10, 2), nullable = False)
    vendor_payout = Column(Numeric(10, 2), nullable = False)

    # Status do cumprimento
    fulfillment_status = Column(String(20), default="pending")  # pending, processing, shipped, delivered
    tracking_code = Column(String(100))
    shipping_carrier = Column(String(100))

    # Datas importantes
    shipped_at = Column(DateTime)
    delivered_at = Column(DateTime)
    expected_delivery = Column(DateTime)

    # Timestamps
    created_at = Column(DateTime, default = func.now())
    updated_at = Column(DateTime, default = func.now(), onupdate = func.now())

    # Relacionamentos
    vendor = relationship("Vendor", back_populates="orders")
    order = relationship("Order")

    def __repr__(self):
        return f"<VendorOrder(vendor_id={self.vendor_id}, order_id={self.order_id})>"

    def to_dict(self):
        return {
            "id": str(self.id),
            "vendor_id": str(self.vendor_id),
            "order_id": str(self.order_id),
            "subtotal": float(self.subtotal),
            "shipping_cost": float(self.shipping_cost),
            "commission_amount": float(self.commission_amount),
            "vendor_payout": float(self.vendor_payout),
            "fulfillment_status": self.fulfillment_status,
            "tracking_code": self.tracking_code,
            "shipping_carrier": self.shipping_carrier,
            "shipped_at": self.shipped_at.isoformat() if self.shipped_at else None,
            "delivered_at": self.delivered_at.isoformat() if self.delivered_at else None,
            "expected_delivery": self.expected_delivery.isoformat() if self.expected_delivery else None,
            "created_at": self.created_at.isoformat(),
            "updated_at": self.updated_at.isoformat()
        }


class VendorCommission(db.Model):
    __tablename__ = "vendor_commissions"
    __table_args__ = {'extend_existing': True}

    id = Column(String(36), primary_key = True, default=lambda: str(uuid.uuid4()))
    vendor_id = Column(String(36), ForeignKey("vendors.id"), nullable = False)
    order_id = Column(String(36), ForeignKey("orders.id"), nullable = False)

    # Valores da comissão
    order_value = Column(Numeric(10, 2), nullable = False)
    commission_rate = Column(Numeric(5, 2), nullable = False)
    commission_amount = Column(Numeric(10, 2), nullable = False)
    vendor_payout = Column(Numeric(10, 2), nullable = False)

    # Status do pagamento
    status = Column(String(20), default="pending")  # pending, paid, cancelled
    paid_at = Column(DateTime)
    payment_method = Column(String(50))
    payment_reference = Column(String(100))

    # Timestamps
    created_at = Column(DateTime, default = func.now())
    updated_at = Column(DateTime, default = func.now(), onupdate = func.now())

    # Relacionamentos
    vendor = relationship("Vendor", back_populates="commissions")
    order = relationship("Order")

    def __repr__(self):
        return f"<VendorCommission(vendor_id={self.vendor_id}, commission_amount={self.commission_amount})>"

    def to_dict(self):
        return {
            "id": str(self.id),
            "vendor_id": str(self.vendor_id),
            "order_id": str(self.order_id),
            "order_value": float(self.order_value),
            "commission_rate": float(self.commission_rate),
            "commission_amount": float(self.commission_amount),
            "vendor_payout": float(self.vendor_payout),
            "status": self.status,
            "paid_at": self.paid_at.isoformat() if self.paid_at else None,
            "payment_method": self.payment_method,
            "payment_reference": self.payment_reference,
            "created_at": self.created_at.isoformat(),
            "updated_at": self.updated_at.isoformat()
        }


class VendorReview(db.Model):
    __tablename__ = "vendor_reviews"
    __table_args__ = {'extend_existing': True}

    id = Column(String(36), primary_key = True, default=lambda: str(uuid.uuid4()))
    vendor_id = Column(String(36), ForeignKey("vendors.id"), nullable = False)
    customer_id = Column(String(36), ForeignKey("customers.id"), nullable = False)
    order_id = Column(String(36), ForeignKey("orders.id"))

    # Avaliação
    rating = Column(Integer, nullable = False)  # 1-5 estrelas
    title = Column(String(255))
    comment = Column(Text)

    # Aspectos específicos
    communication_rating = Column(Integer)  # 1-5
    shipping_rating = Column(Integer)  # 1-5
    product_quality_rating = Column(Integer)  # 1-5

    # Status
    status = Column(String(20), default="pending")  # pending, approved, rejected
    is_verified = Column(Boolean, default = False)

    # Resposta do vendedor
    vendor_response = Column(Text)
    vendor_response_at = Column(DateTime)

    # Timestamps
    created_at = Column(DateTime, default = func.now())
    updated_at = Column(DateTime, default = func.now(), onupdate = func.now())

    # Relacionamentos
    vendor = relationship("Vendor")
    customer = relationship("Customer")
    order = relationship("Order")

    def __repr__(self):
        return f"<VendorReview(vendor_id={self.vendor_id}, rating={self.rating})>"

    def to_dict(self):
        return {
            "id": str(self.id),
            "vendor_id": str(self.vendor_id),
            "customer_id": str(self.customer_id),
            "order_id": str(self.order_id) if self.order_id else None,
            "rating": self.rating,
            "title": self.title,
            "comment": self.comment,
            "ratings": {
                "communication": self.communication_rating,
                "shipping": self.shipping_rating,
                "product_quality": self.product_quality_rating
            },
            "status": self.status,
            "is_verified": self.is_verified,
            "vendor_response": self.vendor_response,
            "vendor_response_at": self.vendor_response_at.isoformat() if self.vendor_response_at else None,
            "created_at": self.created_at.isoformat(),
            "updated_at": self.updated_at.isoformat()
        }
