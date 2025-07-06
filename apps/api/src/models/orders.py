"""
Modelos de Pedidos e Carrinho - Mestres do Café Enterprise
"""

from datetime import datetime
from sqlalchemy import Column, Integer, String, Float, Text, Boolean, DateTime, ForeignKey, Enum
from sqlalchemy.orm import relationship
from models.base import db
import enum


class OrderStatus(enum.Enum):
    """Status do pedido"""
    PENDING = "pending"
    CONFIRMED = "confirmed"
    PREPARING = "preparing"
    SHIPPED = "shipped"
    DELIVERED = "delivered"
    CANCELLED = "cancelled"


class Order(db.Model):
    """Pedido"""
    __tablename__ = 'orders'
    
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey('users.id'), nullable=False)
    order_number = Column(String(20), unique=True, nullable=False)
    status = Column(Enum(OrderStatus), default=OrderStatus.PENDING)
    
    # Valores
    subtotal = Column(Float, nullable=False)
    shipping_cost = Column(Float, default=0.0)
    tax_amount = Column(Float, default=0.0)
    total_amount = Column(Float, nullable=False)
    
    # Dados de entrega
    shipping_address = Column(Text)
    shipping_city = Column(String(100))
    shipping_state = Column(String(50))
    shipping_zipcode = Column(String(20))
    shipping_country = Column(String(50), default="Brasil")
    
    # Metadados
    notes = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relacionamentos
    user = relationship("User", back_populates="orders")
    items = relationship("OrderItem", back_populates="order")
    payment = relationship("Payment", back_populates="order", uselist=False)
    
    def __repr__(self):
        return f'<Order {self.order_number}>'


class OrderItem(db.Model):
    """Item do pedido"""
    __tablename__ = 'order_items'
    
    id = Column(Integer, primary_key=True)
    order_id = Column(Integer, ForeignKey('orders.id'), nullable=False)
    product_id = Column(Integer, ForeignKey('products.id'), nullable=False)
    quantity = Column(Integer, nullable=False)
    price = Column(Float, nullable=False)  # preço no momento do pedido
    total = Column(Float, nullable=False)
    
    # Relacionamentos
    order = relationship("Order", back_populates="items")
    product = relationship("Product")
    
    def __repr__(self):
        return f'<OrderItem {self.quantity}x {self.product.name}>'


class Cart(db.Model):
    """Carrinho de compras"""
    __tablename__ = 'carts'
    
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey('users.id'), nullable=False)
    session_id = Column(String(100))  # para usuários não logados
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relacionamentos
    user = relationship("User", back_populates="cart")
    items = relationship("CartItem", back_populates="cart")
    
    @property
    def total_items(self):
        """Total de itens no carrinho"""
        return sum(item.quantity for item in self.items)
    
    @property
    def total_amount(self):
        """Valor total do carrinho"""
        return sum(item.total for item in self.items)
    
    def __repr__(self):
        return f'<Cart {self.user.email if self.user else self.session_id}>'


class CartItem(db.Model):
    """Item do carrinho"""
    __tablename__ = 'cart_items'
    
    id = Column(Integer, primary_key=True)
    cart_id = Column(Integer, ForeignKey('carts.id'), nullable=False)
    product_id = Column(Integer, ForeignKey('products.id'), nullable=False)
    quantity = Column(Integer, nullable=False)
    added_at = Column(DateTime, default=datetime.utcnow)
    
    # Relacionamentos
    cart = relationship("Cart", back_populates="items")
    product = relationship("Product")
    
    @property
    def total(self):
        """Total do item (preço x quantidade)"""
        return self.product.price * self.quantity
    
    def __repr__(self):
        return f'<CartItem {self.quantity}x {self.product.name}>'
    
    def to_dict(self):
        return {
            'id': self.id,
            'cart_id': self.cart_id,
            'product_id': self.product_id,
            'quantity': self.quantity,
            'total': self.total,
            'product': self.product.to_dict() if self.product else None,
            'added_at': self.added_at.isoformat() if self.added_at is not None else None
        }


class Payment(db.Model):
    """Pagamento"""
    __tablename__ = 'payments'
    
    id = Column(Integer, primary_key=True)
    order_id = Column(Integer, ForeignKey('orders.id'), nullable=False)
    payment_method = Column(String(50), nullable=False)  # credit_card, pix, boleto
    status = Column(String(20), default="pending")  # pending, approved, rejected
    amount = Column(Float, nullable=False)
    
    # Dados do pagamento
    transaction_id = Column(String(100))
    payment_date = Column(DateTime)
    gateway_response = Column(Text)
    
    # Metadados
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relacionamentos
    order = relationship("Order", back_populates="payment")
    
    def __repr__(self):
        return f'<Payment {self.payment_method} - {self.status}>' 