"""
Modelos de Produtos - Mestres do Café Enterprise
"""

from datetime import datetime

from sqlalchemy import (
    JSON,
    Boolean,
    Column,
    DateTime,
    Float,
    ForeignKey,
    Integer,
    String,
    Text,
)
from sqlalchemy.orm import relationship

from .base import db


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
        # Temporariamente retorna 0 para evitar problemas de schema
        return 0
    
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
    is_approved = Column(Boolean, default=True)
    is_featured = Column(Boolean, default=False)
    helpful_count = Column(Integer, default=0)
    not_helpful_count = Column(Integer, default=0)
    images = Column(JSON)  # URLs das imagens da avaliação
    pros = Column(JSON)  # Lista de pontos positivos
    cons = Column(JSON)  # Lista de pontos negativos
    recommend = Column(Boolean, default=True)  # Se recomenda o produto
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relacionamentos
    product = relationship("Product", back_populates="reviews")
    user = relationship("User", back_populates="reviews")
    helpful_votes = relationship("ReviewHelpful", back_populates="review", cascade="all, delete-orphan")
    responses = relationship("ReviewResponse", back_populates="review", cascade="all, delete-orphan")
    
    def __repr__(self):
        return f'<Review {self.rating}⭐ for {self.product.name}>'
    
    def to_dict(self):
        try:
            # Dados básicos da review
            review_data = {
                'id': self.id,
                'product_id': self.product_id,
                'user_id': self.user_id,
                'rating': self.rating,
                'title': self.title,
                'comment': self.comment,
                'is_verified': self.is_verified,
                'is_approved': self.is_approved,
                'is_featured': self.is_featured,
                'helpful_count': self.helpful_count,
                'not_helpful_count': self.not_helpful_count,
                'images': self.images or [],
                'pros': self.pros or [],
                'cons': self.cons or [],
                'recommend': self.recommend,
                'created_at': self.created_at.isoformat() if self.created_at is not None else None,
                'updated_at': self.updated_at.isoformat() if self.updated_at is not None else None
            }
            
            # Tentar adicionar dados do usuário se disponível
            try:
                if hasattr(self, 'user') and self.user:
                    review_data['user'] = {
                        'id': self.user.id,
                        'name': self.user.name,
                        'email': self.user.email[:3] + "***" + self.user.email[-10:] if self.user.email else None,
                        'avatar_url': getattr(self.user, 'avatar_url', None)
                    }
                else:
                    review_data['user'] = None
            except:
                review_data['user'] = None
            
            # Tentar adicionar respostas se disponível
            try:
                if hasattr(self, 'responses') and self.responses:
                    review_data['responses'] = [response.to_dict() for response in self.responses]
                else:
                    review_data['responses'] = []
            except:
                review_data['responses'] = []
                
            return review_data
        except Exception as e:
            # Fallback básico se houver erro
            return {
                'id': self.id,
                'product_id': self.product_id,
                'user_id': self.user_id,
                'rating': self.rating,
                'title': self.title,
                'comment': self.comment,
                'is_verified': self.is_verified,
                'is_approved': self.is_approved,
                'is_featured': self.is_featured,
                'helpful_count': self.helpful_count,
                'not_helpful_count': self.not_helpful_count,
                'images': self.images or [],
                'pros': self.pros or [],
                'cons': self.cons or [],
                'recommend': self.recommend,
                'created_at': self.created_at.isoformat() if self.created_at is not None else None,
                'updated_at': self.updated_at.isoformat() if self.updated_at is not None else None,
                'user': None,
                'responses': []
            }


class ReviewHelpful(db.Model):
    """Votos úteis para avaliações"""
    __tablename__ = 'review_helpful'
    
    id = Column(Integer, primary_key=True)
    review_id = Column(Integer, ForeignKey('reviews.id'), nullable=False)
    user_id = Column(Integer, ForeignKey('users.id'), nullable=False)
    is_helpful = Column(Boolean, nullable=False)  # True = útil, False = não útil
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relacionamentos
    review = relationship("Review", back_populates="helpful_votes")
    user = relationship("User", backref="review_votes")
    
    # Constraint para evitar votos duplicados
    __table_args__ = (db.UniqueConstraint('review_id', 'user_id', name='unique_review_user_vote'),)
    
    def __repr__(self):
        helpful_text = "Útil" if self.is_helpful is True else "Não útil"
        return f'<ReviewHelpful {self.review_id} - {helpful_text}>'


class ReviewResponse(db.Model):
    """Resposta da empresa às avaliações"""
    __tablename__ = 'review_responses'
    
    id = Column(Integer, primary_key=True)
    review_id = Column(Integer, ForeignKey('reviews.id'), nullable=False)
    admin_user_id = Column(Integer, ForeignKey('users.id'), nullable=False)
    response_text = Column(Text, nullable=False)
    is_public = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relacionamentos
    review = relationship("Review", back_populates="responses")
    admin_user = relationship("User", backref="review_responses")
    
    def __repr__(self):
        return f'<ReviewResponse {self.review_id}>'
    
    def to_dict(self):
        return {
            'id': self.id,
            'review_id': self.review_id,
            'admin_user_id': self.admin_user_id,
            'response_text': self.response_text,
            'is_public': self.is_public,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at is not None else None,
            'admin_user': {
                'name': self.admin_user.name,
                'role': 'Mestres do Café'
            } if self.admin_user else None
        }