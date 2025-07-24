import uuid
from datetime import datetime

from sqlalchemy import (
    Boolean,
    Column,
    DateTime,
    ForeignKey,
    Integer,
    String,
    Text,
    text,
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from database import db


class Wishlist(db.Model):
    __tablename__ = "wishlists"

    id = Column(UUID(as_uuid = True), primary_key = True, default = uuid.uuid4)
    user_id = Column(UUID(as_uuid = True), ForeignKey("users.id"), nullable = False)
    name = Column(String(255), default="Minha Lista de Desejos")
    description = Column(Text)
    is_public = Column(Boolean, default = False)
    created_at = Column(DateTime, default = datetime.utcnow)
    updated_at = Column(DateTime, default = datetime.utcnow, onupdate = datetime.utcnow)

    # Relacionamentos
    user = relationship("User", back_populates="wishlists")
    items = relationship(
        "WishlistItem", back_populates="wishlist", cascade="all, delete-orphan"
    )

    def __repr__(self):
        return f"<Wishlist {self.name}>"

    def to_dict(self):
        return {
            "id": str(self.id),
            "user_id": str(self.user_id),
            "name": self.name,
            "description": self.description,
            "is_public": self.is_public,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
            "items_count": len(self.items) if self.items else 0,
        }


class WishlistItem(db.Model):
    __tablename__ = "wishlist_items"

    id = Column(UUID(as_uuid = True), primary_key = True, default = uuid.uuid4)
    wishlist_id = Column(UUID(as_uuid = True), ForeignKey("wishlists.id"), nullable = False)
    product_id = Column(UUID(as_uuid = True), ForeignKey("products.id"), nullable = False)
    notes = Column(Text)
    priority = Column(String(20), default="medium")  # low, medium, high
    created_at = Column(DateTime, default = datetime.utcnow)
    updated_at = Column(DateTime, default = datetime.utcnow, onupdate = datetime.utcnow)

    # Relacionamentos
    wishlist = relationship("Wishlist", back_populates="items")
    product = relationship("Product", back_populates="wishlist_items")

    def __repr__(self):
        return f"<WishlistItem {self.product_id}>"

    def to_dict(self):
        return {
            "id": str(self.id),
            "wishlist_id": str(self.wishlist_id),
            "product_id": str(self.product_id),
            "notes": self.notes,
            "priority": self.priority,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }


class WishlistShare(db.Model):
    __tablename__ = "wishlist_shares"

    id = Column(UUID(as_uuid = True), primary_key = True, default = uuid.uuid4)
    wishlist_id = Column(UUID(as_uuid = True), ForeignKey("wishlists.id"), nullable = False)
    shared_with_user_id = Column(
        UUID(as_uuid = True), ForeignKey("users.id"), nullable = False
    )
    share_token = Column(String(255), unique = True)
    permission_level = Column(String(20), default="view")  # view, edit
    shared_at = Column(DateTime, default = datetime.utcnow)
    expires_at = Column(DateTime)
    is_active = Column(Boolean, default = True)

    # Relacionamentos
    wishlist = relationship("Wishlist")
    shared_with_user = relationship("User", foreign_keys=[shared_with_user_id])

    def __repr__(self):
        return f"<WishlistShare {self.wishlist_id}>"

    def to_dict(self):
        return {
            "id": str(self.id),
            "wishlist_id": str(self.wishlist_id),
            "shared_with_user_id": str(self.shared_with_user_id),
            "share_token": self.share_token,
            "permission_level": self.permission_level,
            "shared_at": self.shared_at.isoformat() if self.shared_at else None,
            "expires_at": self.expires_at.isoformat() if self.expires_at else None,
            "is_active": self.is_active,
        }
