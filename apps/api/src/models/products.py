"""
Modelos de Produtos - Mestres do Café Enterprise
"""

from datetime import datetime
from sqlalchemy import Column, Integer, String, Float, Text, Boolean, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from models.base import db


class Category(db.Model):
    """Categoria de produtos"""
    __tablename__ = 'categories'
    
    id = Column(Integer, primary_key=True)
    name = Column(String(100), nullable=False)
    description = Column(Text)
    slug = Column(String(120), unique=True, nullable=False)
    image_url = Column(String(255))
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relacionamentos
    products = relationship("Product", back_populates="category")
    
    def __repr__(self):
        return f'<Category {self.name}>'
    
    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'description': self.description,
            'slug': self.slug,
            'image_url': self.image_url,
            'is_active': self.is_active,
            'created_at': self.created_at.isoformat() if self.created_at is not None else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at is not None else None
        }


class Product(db.Model):
    """Produto"""
    __tablename__ = 'products'
    
    id = Column(Integer, primary_key=True)
    name = Column(String(200), nullable=False)
    description = Column(Text)
    slug = Column(String(220), unique=True, nullable=False)
    price = Column(Float, nullable=False)
    weight = Column(Integer)  # peso em gramas
    origin = Column(String(100))  # origem do café
    sca_score = Column(Integer)  # pontuação SCA
    flavor_notes = Column(JSON)  # notas de sabor
    stock_quantity = Column(Integer, default=0)
    is_active = Column(Boolean, default=True)
    is_featured = Column(Boolean, default=False)
    
    # Relacionamentos
    category_id = Column(Integer, ForeignKey('categories.id'))
    category = relationship("Category", back_populates="products")
    images = relationship("ProductImage", back_populates="product")
    reviews = relationship("Review", back_populates="product")
    
    # Metadados
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def __repr__(self):
        return f'<Product {self.name}>'
    
    @property
    def average_rating(self):
        """Calcula a avaliação média do produto"""
        if not self.reviews:
            return 0
        return sum(review.rating for review in self.reviews) / len(self.reviews)
    
    @property
    def is_in_stock(self):
        """Verifica se o produto está em estoque"""
        return self.stock_quantity > 0
    
    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'description': self.description,
            'slug': self.slug,
            'price': self.price,
            'weight': self.weight,
            'origin': self.origin,
            'sca_score': self.sca_score,
            'flavor_notes': self.flavor_notes,
            'stock_quantity': self.stock_quantity,
            'is_active': self.is_active,
            'is_featured': self.is_featured,
            'is_in_stock': self.is_in_stock,
            'average_rating': self.average_rating,
            'category_id': self.category_id,
            'category': self.category.to_dict() if self.category else None,
            'created_at': self.created_at.isoformat() if self.created_at is not None else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at is not None else None
        }


class ProductImage(db.Model):
    """Imagem de produto"""
    __tablename__ = 'product_images'
    
    id = Column(Integer, primary_key=True)
    product_id = Column(Integer, ForeignKey('products.id'), nullable=False)
    image_url = Column(String(255), nullable=False)
    alt_text = Column(String(255))
    is_primary = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relacionamentos
    product = relationship("Product", back_populates="images")
    
    def __repr__(self):
        return f'<ProductImage {self.image_url}>'


class Review(db.Model):
    """Avaliação de produto"""
    __tablename__ = 'reviews'
    
    id = Column(Integer, primary_key=True)
    product_id = Column(Integer, ForeignKey('products.id'), nullable=False)
    user_id = Column(Integer, ForeignKey('users.id'), nullable=False)
    rating = Column(Integer, nullable=False)  # 1-5
    title = Column(String(200))
    comment = Column(Text)
    is_verified = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relacionamentos
    product = relationship("Product", back_populates="reviews")
    user = relationship("User", back_populates="reviews")
    
    def __repr__(self):
        return f'<Review {self.rating}⭐ for {self.product.name}>' 