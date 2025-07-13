"""
Modelos de autenticação e usuários
"""

import uuid

from sqlalchemy import (
    Boolean,
    Column,
    DateTime,
    ForeignKey,
    Integer,
    String,
    Text,
    DECIMAL,
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from ..database import db


class User(db.Model):
    __tablename__ = 'users'
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    supabase_id = Column(UUID(as_uuid=True), unique=True)
    email = Column(String(255), unique=True, nullable=False)
    name = Column(String(255), nullable=False)
    username = Column(String(255), unique=True)
    first_name = Column(String(255))
    last_name = Column(String(255))
    password_hash = Column(String(255))
    phone = Column(String(20))
    role = Column(String(50), default='customer')
    avatar_url = Column(Text)
    birth_date = Column(DateTime)
    gender = Column(String(10))
    
    # Gamificação
    points = Column(Integer, default=0)
    level = Column(String(50), default='bronze')
    total_spent = Column(DECIMAL(10, 2), default=0.00)
    account_type = Column(String(50), default='individual')
    
    # Preferências
    language = Column(String(5), default='pt-BR')
    timezone = Column(String(50), default='America/Sao_Paulo')
    newsletter_subscribed = Column(Boolean, default=False)
    push_notifications = Column(Boolean, default=True)
    
    # Controle
    is_active = Column(Boolean, default=True)
    is_admin = Column(Boolean, default=False)
    email_verified = Column(Boolean, default=False)
    last_login = Column(DateTime)
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())
    
    # Relacionamentos
    sessions = relationship("UserSession", back_populates="user")
    orders = relationship("Order", back_populates="user")
    cart_items = relationship("CartItem", back_populates="user")
    points_history = relationship("UserPointTransaction", back_populates="user")
    points_balance = relationship("UserPointsBalance", back_populates="user", uselist=False)
    notifications = relationship("Notification", back_populates="user")
    notification_preferences = relationship("NotificationPreference", back_populates="user")
    notification_queue = relationship("NotificationQueue", back_populates="user")
    wishlists = relationship("Wishlist", back_populates="user")
    
    def __repr__(self):
        return f"<User(id={self.id}, email={self.email}, name={self.name})>"
    
    def to_dict(self):
        return {
            'id': str(self.id),
            'email': self.email,
            'name': self.name,
            'phone': self.phone,
            'role': self.role,
            'avatar_url': self.avatar_url,
            'points': self.points,
            'level': self.level,
            'total_spent': (
                float(self.total_spent) if self.total_spent else 0.00
            ),
            'account_type': self.account_type,
            'language': self.language,
            'timezone': self.timezone,
            'newsletter_subscribed': self.newsletter_subscribed,
            'push_notifications': self.push_notifications,
            'is_active': self.is_active,
            'email_verified': self.email_verified,
            'last_login': (
                self.last_login.isoformat() if self.last_login else None
            ),
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }


class UserSession(db.Model):
    __tablename__ = 'user_sessions'
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(
        UUID(as_uuid=True),
        ForeignKey('users.id', ondelete='CASCADE')
    )
    session_token = Column(Text, unique=True, nullable=False)
    refresh_token = Column(Text)
    device_info = Column(Text)  # JSON como TEXT para compatibilidade
    ip_address = Column(String(45))  # Suporte IPv4 e IPv6
    user_agent = Column(Text)
    expires_at = Column(DateTime, nullable=False)
    created_at = Column(DateTime, default=func.now())
    
    # Relacionamentos
    user = relationship("User", back_populates="sessions")
    
    def __repr__(self):
        return (
            f"<UserSession(id={self.id}, user_id={self.user_id}, "
            f"expires_at={self.expires_at})>"
        )
    
    def to_dict(self):
        return {
            'id': str(self.id),
            'user_id': str(self.user_id),
            'session_token': self.session_token,
            'device_info': self.device_info,
            'ip_address': (
                str(self.ip_address) if self.ip_address else None
            ),
            'user_agent': self.user_agent,
            'expires_at': self.expires_at.isoformat(),
            'created_at': self.created_at.isoformat()
        }