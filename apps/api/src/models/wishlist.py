from datetime import datetime

from sqlalchemy import Column, DateTime, ForeignKey, Integer, String, UniqueConstraint
from sqlalchemy.orm import relationship

from .base import db


class Wishlist(db.Model):
    __tablename__ = 'wishlists'
    
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey('users.id'), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relacionamentos
    user = relationship('User', backref='wishlist')
    items = relationship('WishlistItem', backref='wishlist', cascade='all, delete-orphan')
    
    def __repr__(self):
        return f'<Wishlist {self.id} - User {self.user_id}>'
    
    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat(),
            'items_count': len(self.items) if self.items else 0
        }

class WishlistItem(db.Model):
    __tablename__ = 'wishlist_items'
    
    id = Column(Integer, primary_key=True)
    wishlist_id = Column(Integer, ForeignKey('wishlists.id'), nullable=False)
    product_id = Column(Integer, ForeignKey('products.id'), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relacionamentos
    product = relationship('Product', backref='wishlist_items')
    
    # Constraint unique para evitar duplicatas
    __table_args__ = (UniqueConstraint('wishlist_id', 'product_id', name='unique_wishlist_product'),)
    
    def __repr__(self):
        return f'<WishlistItem {self.id} - Wishlist {self.wishlist_id} Product {self.product_id}>'
    
    def to_dict(self):
        return {
            'id': self.id,
            'wishlist_id': self.wishlist_id,
            'product_id': self.product_id,
            'created_at': self.created_at.isoformat(),
            'product': self.product.to_dict() if self.product else None
        }