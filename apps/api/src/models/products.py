"""
Modelos de produtos, variações e estoque
"""

from datetime import datetime
from uuid import uuid4

from sqlalchemy import (
    Boolean,
    Column,
    DateTime,
    ForeignKey,
    Index,
    Integer,
    String,
    Text,
    JSON,
)
from sqlalchemy.orm import relationship
from sqlalchemy.types import DECIMAL
from sqlalchemy.ext.hybrid import hybrid_property

from database import db


class ProductCategory(db.Model):
    __tablename__ = 'product_categories'
    __table_args__ = {'extend_existing': True}

    id = Column(String(36), primary_key = True, default = uuid4)
    name = Column(String(255), nullable = False)
    slug = Column(String(255), unique = True, nullable = False)
    description = Column(Text)
    image_url = Column(Text)
    parent_id = Column(String(36), ForeignKey('product_categories.id'))
    sort_order = Column(Integer, default = 0)
    is_active = Column(Boolean, default = True)
    created_at = Column(DateTime, default = datetime.utcnow)

    # Relacionamentos
    children = relationship("ProductCategory", backref="parent", remote_side=[id])
    products = relationship("Product", back_populates="category_rel")

    def __repr__(self):
        return f"<ProductCategory(id={self.id}, name={self.name})>"

    def to_dict(self):
        return {
            'id': str(self.id),
            'name': self.name,
            'slug': self.slug,
            'description': self.description,
            'image_url': self.image_url,
            'parent_id': str(self.parent_id) if self.parent_id else None,
            'sort_order': self.sort_order,
            'is_active': self.is_active,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }


class Product(db.Model):
    __tablename__ = 'products'
    __table_args__ = {'extend_existing': True}

    id = Column(String(36), primary_key = True, default = uuid4)
    name = Column(String(255), nullable = False)
    slug = Column(String(255), unique = True, nullable = False)
    description = Column(Text)
    short_description = Column(Text)
    sku = Column(String(100), unique = True)
    category_id = Column(String(36), ForeignKey('product_categories.id'))
    category = Column(String(100))
    supplier_id = Column(String(36), ForeignKey('suppliers.id'))

    # Preços
    price = Column(DECIMAL(10, 2), nullable = False)
    cost_price = Column(DECIMAL(10, 2))
    compare_price = Column(DECIMAL(10, 2))
    promotional_price = Column(DECIMAL(10, 2))

    # Estoque
    stock_quantity = Column(Integer, default = 0)
    min_stock_level = Column(Integer, default = 0)
    max_stock_level = Column(Integer, default = 1000)
    track_inventory = Column(Boolean, default = True)

    # Características do café
    origin = Column(String(100))
    process = Column(String(100))
    roast_level = Column(String(50))
    sca_score = Column(Integer)
    acidity = Column(Integer)
    sweetness = Column(Integer)
    body = Column(Integer)
    flavor_notes = Column(Text)  # JSON string para compatibilidade SQLite

    # Físico
    weight = Column(DECIMAL(8, 2))
    dimensions = Column(Text)  # JSON string para compatibilidade SQLite

    # Controle
    is_active = Column(Boolean, default = True)
    is_featured = Column(Boolean, default = False)
    is_digital = Column(Boolean, default = False)
    requires_shipping = Column(Boolean, default = True)

    # SEO
    meta_title = Column(String(255))
    meta_description = Column(Text)

    # Mídia
    image_url = Column(Text)
    gallery_images = Column(Text)  # JSON string para compatibilidade SQLite

    # Timestamps
    created_at = Column(DateTime, default = datetime.utcnow)
    updated_at = Column(DateTime, default = datetime.utcnow, onupdate = datetime.utcnow)

    # Relacionamentos
    category_rel = relationship("ProductCategory", back_populates="products")
    supplier = relationship("Supplier", back_populates="products")
    variants = relationship("ProductVariant", back_populates="product")
    attributes = relationship("ProductAttributeValue", back_populates="product")
    order_items = relationship("OrderItem", back_populates="product")
    cart_items = relationship("CartItem", back_populates="product")
    stock_batches = relationship("StockBatch", back_populates="product")
    stock_movements = relationship("StockMovement", back_populates="product")
    stock_alerts = relationship("StockAlert", back_populates="product")
    wishlist_items = relationship("WishlistItem", back_populates="product")
    prices = relationship("ProductPrice", back_populates="product", cascade="all, delete-orphan")
    reviews = relationship("Review", back_populates="product")

    # Propriedades híbridas computadas
    @hybrid_property
    def in_stock(self):
        """Retorna True se o produto tem estoque disponível"""
        return self.stock_quantity > 0 if self.stock_quantity is not None else False
    
    @hybrid_property
    def average_rating(self):
        """Calcula a média das avaliações do produto"""
        if not self.reviews:
            return 0.0
        total = sum(review.rating for review in self.reviews)
        return round(total / len(self.reviews), 1)
    
    @hybrid_property
    def total_reviews(self):
        """Retorna o total de avaliações do produto"""
        return len(self.reviews) if self.reviews else 0

    def __repr__(self):
        return f"<Product(id={self.id}, name={self.name}, sku={self.sku})>"

    def to_dict(self):
        return {
            'id': str(self.id),
            'name': self.name,
            'slug': self.slug,
            'description': self.description,
            'short_description': self.short_description,
            'sku': self.sku,
            'category_id': str(self.category_id) if self.category_id else None,
            'category': self.category,
            'supplier_id': str(self.supplier_id) if self.supplier_id else None,
            'price': float(self.price) if self.price else 0.00,
            'cost_price': float(self.cost_price) if self.cost_price else None,
            'compare_price': float(self.compare_price) if self.compare_price else None,
            'promotional_price': float(self.promotional_price) if self.promotional_price else None,
            'stock_quantity': self.stock_quantity,
            'min_stock_level': self.min_stock_level,
            'max_stock_level': self.max_stock_level,
            'track_inventory': self.track_inventory,
            'origin': self.origin,
            'process': self.process,
            'roast_level': self.roast_level,
            'sca_score': self.sca_score,
            'acidity': self.acidity,
            'sweetness': self.sweetness,
            'body': self.body,
            'flavor_notes': self.flavor_notes,
            'weight': float(self.weight) if self.weight else None,
            'dimensions': self.dimensions,
            'is_active': self.is_active,
            'is_featured': self.is_featured,
            'is_digital': self.is_digital,
            'requires_shipping': self.requires_shipping,
            'meta_title': self.meta_title,
            'meta_description': self.meta_description,
            'image_url': self.image_url,
            'gallery_images': self.gallery_images,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
            # Campos computados
            'in_stock': self.in_stock,
            'average_rating': self.average_rating,
            'total_reviews': self.total_reviews,
            # Preços por peso
            'prices': [price.to_dict() for price in self.prices] if self.prices else []
        }


class ProductVariant(db.Model):
    __tablename__ = 'product_variants'
    __table_args__ = {'extend_existing': True}

    id = Column(String(36), primary_key = True, default = uuid4)
    product_id = Column(String(36), ForeignKey('products.id'))
    name = Column(String(255), nullable = False)
    sku = Column(String(100), unique = True, nullable = False)

    # Preços
    price = Column(DECIMAL(10, 2), nullable = False)

    # Físico
    weight = Column(DECIMAL(8, 2))

    # Estoque
    stock_quantity = Column(Integer, default = 0)

    # Atributos específicos (JSONB)
    attributes = Column(Text)  # JSON string para compatibilidade SQLite

    # Mídia
    image_url = Column(Text)

    # Controle
    is_active = Column(Boolean, default = True)
    sort_order = Column(Integer, default = 0)

    # Timestamps
    created_at = Column(DateTime, default = datetime.utcnow)

    # Relacionamentos
    product = relationship("Product", back_populates="variants")
    order_items = relationship("OrderItem", back_populates="variant")
    cart_items = relationship("CartItem", back_populates="variant")

    def __repr__(self):
        return f"<ProductVariant(id={self.id}, name={self.name})>"

    def to_dict(self):
        return {
            'id': str(self.id),
            'product_id': str(self.product_id),
            'name': self.name,
            'sku': self.sku,
            'price': float(self.price) if self.price else None,
            'weight': float(self.weight) if self.weight else None,
            'stock_quantity': self.stock_quantity,
            'attributes': self.attributes,
            'image_url': self.image_url,
            'is_active': self.is_active,
            'sort_order': self.sort_order,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }


class ProductAttribute(db.Model):
    __tablename__ = 'product_attributes'
    __table_args__ = {'extend_existing': True}

    id = Column(String(36), primary_key = True, default = uuid4)
    name = Column(String(255), nullable = False)
    slug = Column(String(255), unique = True, nullable = False)
    type = Column(String(50), nullable = False)  # text, number, select, boolean
    options = Column(Text)  # JSON como TEXT
    is_required = Column(Boolean, default = False)
    is_visible = Column(Boolean, default = True)
    sort_order = Column(Integer, default = 0)
    created_at = Column(DateTime, default = datetime.utcnow)
    updated_at = Column(DateTime, default = datetime.utcnow, onupdate = datetime.utcnow)

    # Relacionamentos
    values = relationship("ProductAttributeValue", back_populates="attribute")

    def __repr__(self):
        return f"<ProductAttribute(id={self.id}, name={self.name})>"

    def to_dict(self):
        return {
            'id': str(self.id),
            'name': self.name,
            'slug': self.slug,
            'type': self.type,
            'options': self.options,
            'is_required': self.is_required,
            'is_visible': self.is_visible,
            'sort_order': self.sort_order,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }


class ProductAttributeValue(db.Model):
    __tablename__ = 'product_attribute_values'
    __table_args__ = {'extend_existing': True}

    id = Column(String(36), primary_key = True, default = uuid4)
    product_id = Column(String(36), ForeignKey('products.id'))
    attribute_id = Column(String(36), ForeignKey('product_attributes.id'))
    value = Column(Text, nullable = False)
    created_at = Column(DateTime, default = datetime.utcnow)
    updated_at = Column(DateTime, default = datetime.utcnow, onupdate = datetime.utcnow)

    # Relacionamentos
    product = relationship("Product", back_populates="attributes")
    attribute = relationship("ProductAttribute", back_populates="values")

    def __repr__(self):
        return f"<ProductAttributeValue(id={self.id}, value={self.value})>"

    def to_dict(self):
        return {
            'id': str(self.id),
            'product_id': str(self.product_id),
            'attribute_id': str(self.attribute_id),
            'value': self.value,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }


class StockBatch(db.Model):
    __tablename__ = 'stock_batches'
    __table_args__ = {'extend_existing': True}

    id = Column(String(36), primary_key = True, default = uuid4)
    product_id = Column(String(36), ForeignKey('products.id'))
    batch_number = Column(String(100), nullable = False)
    quantity = Column(Integer, nullable = False)
    cost_price = Column(DECIMAL(10, 2))
    supplier = Column(String(255))
    manufacturing_date = Column(DateTime)
    expiration_date = Column(DateTime)
    location = Column(String(200))
    notes = Column(Text)
    created_at = Column(DateTime, default = datetime.utcnow)
    updated_at = Column(DateTime, default = datetime.utcnow, onupdate = datetime.utcnow)

    # Relacionamentos
    product = relationship("Product", back_populates="stock_batches")

    def __repr__(self):
        return f"<StockBatch(id={self.id}, batch_number={self.batch_number})>"

    def to_dict(self):
        return {
            'id': str(self.id),
            'product_id': str(self.product_id),
            'batch_number': self.batch_number,
            'quantity': self.quantity,
            'cost_price': float(self.cost_price) if self.cost_price else None,
            'supplier': self.supplier,
            'manufacturing_date': self.manufacturing_date.isoformat() if self.manufacturing_date else None,
            'expiration_date': self.expiration_date.isoformat() if self.expiration_date else None,
            'location': self.location,
            'notes': self.notes,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }


class StockMovement(db.Model):
    __tablename__ = 'stock_movements'
    __table_args__ = {'extend_existing': True}

    id = Column(String(36), primary_key = True, default = uuid4)
    product_id = Column(String(36), ForeignKey('products.id'))
    type = Column(String(50), nullable = False)  # entrada, saida, ajuste
    quantity = Column(Integer, nullable = False)
    reference_type = Column(String(50))  # order, purchase, adjustment
    reference_id = Column(String(36))
    cost_price = Column(DECIMAL(10, 2))
    reason = Column(String(255))
    notes = Column(Text)
    user_id = Column(String(36), ForeignKey('users.id'))
    created_at = Column(DateTime, default = datetime.utcnow)

    # Relacionamentos
    product = relationship("Product", back_populates="stock_movements")

    def __repr__(self):
        return f"<StockMovement(id={self.id}, type={self.type})>"

    def to_dict(self):
        return {
            'id': str(self.id),
            'product_id': str(self.product_id),
            'type': self.type,
            'quantity': self.quantity,
            'reference_type': self.reference_type,
            'reference_id': str(self.reference_id) if self.reference_id else None,
            'cost_price': float(self.cost_price) if self.cost_price else None,
            'reason': self.reason,
            'notes': self.notes,
            'user_id': str(self.user_id) if self.user_id else None,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }


class StockAlert(db.Model):
    __tablename__ = 'stock_alerts'
    __table_args__ = {'extend_existing': True}

    id = Column(String(36), primary_key = True, default = uuid4)
    product_id = Column(String(36), ForeignKey('products.id'))
    type = Column(String(50), nullable = False)  # low_stock, out_of_stock
    message = Column(Text, nullable = False)
    threshold = Column(Integer)
    is_resolved = Column(Boolean, default = False)
    resolved_at = Column(DateTime)
    resolved_by = Column(String(36), ForeignKey('users.id'))
    created_at = Column(DateTime, default = datetime.utcnow)

    # Relacionamentos
    product = relationship("Product", back_populates="stock_alerts")

    def __repr__(self):
        return f"<StockAlert(id={self.id}, type={self.type})>"

    def to_dict(self):
        return {
            'id': str(self.id),
            'product_id': str(self.product_id),
            'type': self.type,
            'message': self.message,
            'threshold': self.threshold,
            'is_resolved': self.is_resolved,
            'resolved_at': self.resolved_at.isoformat() if self.resolved_at else None,
            'resolved_by': str(self.resolved_by) if self.resolved_by else None,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }


class InventoryCount(db.Model):
    __tablename__ = 'inventory_counts'
    __table_args__ = {'extend_existing': True}

    id = Column(String(36), primary_key = True, default = uuid4)
    name = Column(String(255), nullable = False)
    description = Column(Text)
    status = Column(String(50), default='draft')
    location = Column(String(200))
    started_at = Column(DateTime)
    completed_at = Column(DateTime)
    created_by = Column(String(36), ForeignKey('users.id'))
    created_at = Column(DateTime, default = datetime.utcnow)
    updated_at = Column(DateTime, default = datetime.utcnow, onupdate = datetime.utcnow)

    # Relacionamentos
    items = relationship("InventoryCountItem", back_populates="count")

    def __repr__(self):
        return f"<InventoryCount(id={self.id}, name={self.name})>"

    def to_dict(self):
        return {
            'id': str(self.id),
            'name': self.name,
            'description': self.description,
            'status': self.status,
            'location': self.location,
            'started_at': self.started_at.isoformat() if self.started_at else None,
            'completed_at': self.completed_at.isoformat() if self.completed_at else None,
            'created_by': str(self.created_by),
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }


class ProductPrice(db.Model):
    """Model for product prices by weight"""
    __tablename__ = 'product_prices'
    __table_args__ = {'extend_existing': True}
    
    id = Column(String(36), primary_key=True, default=uuid4)
    product_id = Column(String(36), ForeignKey('products.id'), nullable=False)
    
    weight = Column(String(50), nullable=False)  # "250g", "500g", "1kg"
    price = Column(DECIMAL(10, 2), nullable=False)
    stock_quantity = Column(Integer, default=0)
    
    # Controle
    is_active = Column(Boolean, default=True)
    sort_order = Column(Integer, default=0)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relacionamentos
    product = relationship("Product", back_populates="prices")
    
    def __repr__(self):
        return f"<ProductPrice(id={self.id}, weight={self.weight}, price={self.price})>"
    
    def to_dict(self):
        """Convert price to dictionary"""
        return {
            'id': str(self.id),
            'product_id': str(self.product_id),
            'weight': self.weight,
            'price': float(self.price) if self.price else 0.00,
            'stock_quantity': self.stock_quantity,
            'is_active': self.is_active,
            'sort_order': self.sort_order,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }


class Review(db.Model):
    """Model for product reviews"""
    __tablename__ = 'reviews'
    __table_args__ = {'extend_existing': True}
    
    id = Column(String(36), primary_key=True, default=uuid4)
    product_id = Column(String(36), ForeignKey('products.id'), nullable=False)
    user_id = Column(String(36), ForeignKey('users.id'), nullable=False)
    
    rating = Column(Integer, nullable=False)  # 1-5
    title = Column(String(200))
    comment = Column(Text)
    
    # Flags
    is_verified = Column(Boolean, default=False)  # Compra verificada
    is_approved = Column(Boolean, default=True)   # Aprovada para exibição
    is_featured = Column(Boolean, default=False)  # Em destaque
    
    # Contadores
    helpful_count = Column(Integer, default=0)
    not_helpful_count = Column(Integer, default=0)
    
    # Dados adicionais
    pros = Column(JSON, default=list)  # Lista de prós
    cons = Column(JSON, default=list)  # Lista de contras
    images = Column(JSON, default=list)  # URLs de imagens
    recommend = Column(Boolean, default=True)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relacionamentos
    product = relationship("Product", back_populates="reviews")
    
    def __repr__(self):
        return f"<Review(id={self.id}, product_id={self.product_id}, rating={self.rating})>"
    
    def to_dict(self):
        """Convert review to dictionary"""
        return {
            'id': str(self.id),
            'product_id': str(self.product_id),
            'user_id': str(self.user_id),
            'rating': self.rating,
            'title': self.title,
            'comment': self.comment,
            'is_verified': self.is_verified,
            'is_approved': self.is_approved,
            'is_featured': self.is_featured,
            'helpful_count': self.helpful_count,
            'not_helpful_count': self.not_helpful_count,
            'pros': self.pros or [],
            'cons': self.cons or [],
            'images': self.images or [],
            'recommend': self.recommend,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }


class ReviewHelpful(db.Model):
    """Track which users found reviews helpful"""
    __tablename__ = 'review_helpful'
    
    id = Column(String(36), primary_key=True, default=uuid4)
    review_id = Column(String(36), ForeignKey('reviews.id'), nullable=False)
    user_id = Column(String(36), ForeignKey('users.id'), nullable=False)
    is_helpful = Column(Boolean, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Combined table arguments with both extend_existing and constraints
    __table_args__ = (
        db.UniqueConstraint('review_id', 'user_id', name='unique_review_user_vote'),
        {'extend_existing': True}
    )
    
    def __repr__(self):
        return f"<ReviewHelpful(review_id={self.review_id}, user_id={self.user_id})>"


class ReviewResponse(db.Model):
    """Company responses to reviews"""
    __tablename__ = 'review_responses'
    __table_args__ = {'extend_existing': True}
    
    id = Column(String(36), primary_key=True, default=uuid4)
    review_id = Column(String(36), ForeignKey('reviews.id'), nullable=False)
    admin_user_id = Column(String(36), ForeignKey('users.id'), nullable=False)
    response = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def __repr__(self):
        return f"<ReviewResponse(review_id={self.review_id})>"


class InventoryCountItem(db.Model):
    __tablename__ = 'inventory_count_items'
    __table_args__ = {'extend_existing': True}

    id = Column(String(36), primary_key = True, default = uuid4)
    count_id = Column(String(36), ForeignKey('inventory_counts.id'))
    product_id = Column(String(36), ForeignKey('products.id'))
    expected_quantity = Column(Integer, nullable = False)
    actual_quantity = Column(Integer)
    difference = Column(Integer)
    notes = Column(Text)
    counted_by = Column(String(36), ForeignKey('users.id'))
    counted_at = Column(DateTime)
    created_at = Column(DateTime, default = datetime.utcnow)

    # Relacionamentos
    count = relationship("InventoryCount", back_populates="items")
    product = relationship("Product")

    def __repr__(self):
        return f"<InventoryCountItem(id={self.id}, expected={self.expected_quantity})>"

    def to_dict(self):
        return {
            'id': str(self.id),
            'count_id': str(self.count_id),
            'product_id': str(self.product_id),
            'expected_quantity': self.expected_quantity,
            'actual_quantity': self.actual_quantity,
            'difference': self.difference,
            'notes': self.notes,
            'counted_by': str(self.counted_by) if self.counted_by else None,
            'counted_at': self.counted_at.isoformat() if self.counted_at else None,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }


# Índices para performance
Index('idx_products_category_id', Product.category_id)
Index('idx_products_sku', Product.sku)
Index('idx_products_slug', Product.slug)
Index('idx_products_is_active', Product.is_active)
Index('idx_product_variants_product_id', ProductVariant.product_id)
Index('idx_stock_movements_product_id', StockMovement.product_id)
Index('idx_stock_movements_type', StockMovement.type)
