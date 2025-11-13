"""
Modelos de autenticação e usuários
"""

import uuid

from database import db
from sqlalchemy import (
    DECIMAL,
    Boolean,
    Column,
    DateTime,
    ForeignKey,
    Integer,
    String,
    Text,
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func


class User(db.Model):
    __tablename__ = "users"

    id = Column(UUID(as_uuid = True), primary_key = True, default = uuid.uuid4)
    supabase_id = Column(UUID(as_uuid = True), unique = True)
    email = Column(String(255), unique = True, nullable = False)
    name = Column(String(255), nullable = False)
    username = Column(String(255), unique = True)
    first_name = Column(String(255))
    last_name = Column(String(255))
    password_hash = Column(String(255))
    phone = Column(String(20))
    cpf_cnpj = Column(String(20))  # CPF para PF, CNPJ para PJ
    company_name = Column(String(255))  # Razão social para PJ
    company_segment = Column(String(100))  # Segmento de atuação para PJ
    role = Column(String(50), default="customer")
    avatar_url = Column(Text)
    birth_date = Column(DateTime)
    gender = Column(String(10))

    # Gamificação
    points = Column(Integer, default = 0)
    level = Column(String(50), default="bronze")  # Nome do nível (deprecated, use gamification_level)
    total_spent = Column(DECIMAL(10, 2), default = 0.00)
    account_type = Column(String(50), default="individual")
    gamification_level_id = Column(UUID(as_uuid = True), ForeignKey('gamification_levels.id'))

    # Preferências
    language = Column(String(5), default="pt-BR")
    timezone = Column(String(50), default="America/Sao_Paulo")
    newsletter_subscribed = Column(Boolean, default = False)
    push_notifications = Column(Boolean, default = True)

    # Controle
    is_active = Column(Boolean, default = True)
    is_admin = Column(Boolean, default = False)
    email_verified = Column(Boolean, default = False)
    last_login = Column(DateTime)
    created_at = Column(DateTime, default = func.now())
    updated_at = Column(DateTime, default = func.now(), onupdate = func.now())

    # Relacionamentos
    sessions = relationship("UserSession", back_populates="user")
    orders = relationship("Order", back_populates="user")
    cart_items = relationship("CartItem", back_populates="user")
    gamification_level = relationship("GamificationLevel", back_populates="users")
    # point_history criado automaticamente via backref no modelo UserPoint
    # reward_redemptions criado automaticamente via backref no modelo RewardRedemption
    # notifications criado automaticamente via backref no modelo Notification
    # notification_preferences criado automaticamente via backref no modelo NotificationSubscription
    # newsletter_subscriptions criado automaticamente via backref no modelo NewsletterSubscriber
    # blog_posts criado automaticamente via backref no modelo BlogPost
    # blog_comments criado automaticamente via backref no modelo BlogComment
    # employee_profile criado automaticamente via backref no modelo Employee
    # campaigns criado automaticamente via backref no modelo Campaign
    wishlists = relationship("Wishlist", back_populates="user")

    def __repr__(self):
        return f"<User(id={self.id}, email={self.email}, name={self.name})>"

    def to_dict(self):
        return {
            "id": str(self.id),
            "email": self.email,
            "name": self.name,
            "phone": self.phone,
            "cpf_cnpj": self.cpf_cnpj,
            "company_name": self.company_name,
            "company_segment": self.company_segment,
            "role": self.role,
            "avatar_url": self.avatar_url,
            "points": self.points,
            "level": self.level,
            "total_spent": (float(self.total_spent) if self.total_spent else 0.00),
            "account_type": self.account_type,
            "language": self.language,
            "timezone": self.timezone,
            "newsletter_subscribed": self.newsletter_subscribed,
            "push_notifications": self.push_notifications,
            "is_active": self.is_active,
            "is_admin": self.is_admin,
            "email_verified": self.email_verified,
            "last_login": (self.last_login.isoformat() if self.last_login else None),
            "created_at": self.created_at.isoformat(),
            "updated_at": self.updated_at.isoformat(),
        }


class UserSession(db.Model):
    __tablename__ = "user_sessions"

    id = Column(UUID(as_uuid = True), primary_key = True, default = uuid.uuid4)
    user_id = Column(UUID(as_uuid = True), ForeignKey("users.id", ondelete="CASCADE"))
    session_token = Column(Text, unique = True, nullable = False)
    refresh_token = Column(Text)
    device_info = Column(Text)  # JSON como TEXT para compatibilidade
    ip_address = Column(String(45))  # Suporte IPv4 e IPv6
    user_agent = Column(Text)
    expires_at = Column(DateTime, nullable = False)
    created_at = Column(DateTime, default = func.now())

    # Relacionamentos
    user = relationship("User", back_populates="sessions")

    def __repr__(self):
        return (
            f"<UserSession(id={self.id}, user_id={self.user_id}, "
            f"expires_at={self.expires_at})>"
        )

    def to_dict(self):
        return {
            "id": str(self.id),
            "user_id": str(self.user_id),
            "session_token": self.session_token,
            "device_info": self.device_info,
            "ip_address": (str(self.ip_address) if self.ip_address else None),
            "user_agent": self.user_agent,
            "expires_at": self.expires_at.isoformat(),
            "created_at": self.created_at.isoformat(),
        }
