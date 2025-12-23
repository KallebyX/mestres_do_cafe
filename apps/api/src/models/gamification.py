"""
Modelos para o sistema de Gamificação e Fidelidade
"""

from datetime import datetime
from decimal import Decimal
from sqlalchemy import (
    Column, String, Text, Integer, Numeric, Boolean, DateTime, ForeignKey,
    CheckConstraint, Index
)
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship
import uuid
from database import db


class GamificationLevel(db.Model):
    """Níveis de gamificação"""
    __tablename__ = 'gamification_levels'

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

    # Informações do nível
    name = Column(String(100), nullable=False, unique=True)  # Bronze, Prata, Ouro, etc.
    description = Column(Text)
    level_number = Column(Integer, nullable=False, unique=True)  # 1, 2, 3...

    # Requisitos
    points_required = Column(Integer, nullable=False)  # Pontos necessários para atingir
    orders_required = Column(Integer, default=0)  # Número de pedidos
    total_spent_required = Column(Numeric(10, 2), default=0)  # Valor total gasto

    # Benefícios
    discount_percentage = Column(Numeric(5, 2), default=0)  # Desconto em %
    points_multiplier = Column(Numeric(3, 2), default=1.0)  # Multiplicador de pontos
    free_shipping = Column(Boolean, default=False)
    priority_support = Column(Boolean, default=False)

    # Visual
    icon = Column(String(200))
    color = Column(String(7))  # Cor em hex (#RRGGBB)
    badge_image = Column(String(500))

    # Status
    is_active = Column(Boolean, default=True)

    # Timestamps
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)
    updated_at = Column(DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relacionamentos
    users = relationship('User', back_populates='gamification_level')

    def __repr__(self):
        return f'<GamificationLevel {self.name}>'

    def to_dict(self):
        return {
            'id': str(self.id),
            'name': self.name,
            'description': self.description,
            'level_number': self.level_number,
            'points_required': self.points_required,
            'orders_required': self.orders_required,
            'total_spent_required': float(self.total_spent_required) if self.total_spent_required else 0,
            'discount_percentage': float(self.discount_percentage) if self.discount_percentage else 0,
            'points_multiplier': float(self.points_multiplier) if self.points_multiplier else 1.0,
            'free_shipping': self.free_shipping,
            'priority_support': self.priority_support,
            'icon': self.icon,
            'color': self.color,
            'badge_image': self.badge_image,
            'is_active': self.is_active
        }


class UserPoint(db.Model):
    """Histórico de pontos dos usuários"""
    __tablename__ = 'user_points'

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

    # Relacionamentos
    user_id = Column(UUID(as_uuid=True), ForeignKey('users.id'), nullable=False)

    # Pontos
    points = Column(Integer, nullable=False)  # Pode ser positivo (ganho) ou negativo (uso)
    balance_after = Column(Integer, nullable=False)  # Saldo após a transação

    # Origem dos pontos
    action_type = Column(String(50), nullable=False)  # purchase, review, referral, birthday, manual, etc.
    reference_type = Column(String(50))  # order, review, referral
    reference_id = Column(UUID(as_uuid=True))  # ID da referência

    # Descrição
    description = Column(Text)
    admin_note = Column(Text)  # Nota do admin (para pontos manuais)

    # Metadados
    extra_data = Column(JSONB)  # Dados adicionais

    # Expiração
    expires_at = Column(DateTime(timezone=True))  # Pontos podem expirar
    is_expired = Column(Boolean, default=False)

    # Timestamps
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow, nullable=False)
    created_by = Column(UUID(as_uuid=True), ForeignKey('users.id'))  # Admin que criou (se manual)

    # Relacionamentos
    user = relationship('User', foreign_keys=[user_id], backref='point_history')
    created_by_user = relationship('User', foreign_keys=[created_by])

    # Índices
    __table_args__ = (
        Index('idx_user_points_user', 'user_id', 'created_at'),
        Index('idx_user_points_reference', 'reference_type', 'reference_id'),
    )

    def __repr__(self):
        return f'<UserPoint user={self.user_id} points={self.points}>'

    def to_dict(self):
        return {
            'id': str(self.id),
            'user_id': str(self.user_id),
            'points': self.points,
            'balance_after': self.balance_after,
            'action_type': self.action_type,
            'reference_type': self.reference_type,
            'reference_id': str(self.reference_id) if self.reference_id else None,
            'description': self.description,
            'admin_note': self.admin_note,
            'extra_data': self.extra_data,
            'expires_at': self.expires_at.isoformat() if self.expires_at else None,
            'is_expired': self.is_expired,
            'created_at': self.created_at.isoformat(),
            'created_by': str(self.created_by) if self.created_by else None
        }


class Reward(db.Model):
    """Recompensas disponíveis para resgate"""
    __tablename__ = 'rewards'

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

    # Informações da recompensa
    name = Column(String(200), nullable=False)
    description = Column(Text)
    type = Column(String(50), nullable=False)  # discount, product, shipping, experience

    # Custo
    points_cost = Column(Integer, nullable=False)

    # Detalhes da recompensa
    discount_type = Column(String(20))  # percentage, fixed
    discount_value = Column(Numeric(10, 2))  # Valor do desconto
    product_id = Column(UUID(as_uuid=True), ForeignKey('products.id'))  # Para recompensa de produto

    # Restrições
    min_purchase_amount = Column(Numeric(10, 2), default=0)  # Valor mínimo de compra
    max_uses_per_user = Column(Integer)  # Usos máximos por usuário
    total_available = Column(Integer)  # Quantidade total disponível
    total_redeemed = Column(Integer, default=0)

    # Validade
    valid_from = Column(DateTime(timezone=True))
    valid_until = Column(DateTime(timezone=True))

    # Visual
    image = Column(String(500))
    icon = Column(String(200))

    # Status
    is_active = Column(Boolean, default=True)
    is_featured = Column(Boolean, default=False)

    # Timestamps
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)
    updated_at = Column(DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relacionamentos
    product = relationship('Product')
    redemptions = relationship('RewardRedemption', back_populates='reward')

    __table_args__ = (
        CheckConstraint(
            "type IN ('discount', 'product', 'shipping', 'experience')",
            name='check_reward_type'
        ),
        CheckConstraint(
            "discount_type IS NULL OR discount_type IN ('percentage', 'fixed')",
            name='check_reward_discount_type'
        ),
    )

    def __repr__(self):
        return f'<Reward {self.name}>'

    def to_dict(self):
        return {
            'id': str(self.id),
            'name': self.name,
            'description': self.description,
            'type': self.type,
            'points_cost': self.points_cost,
            'discount_type': self.discount_type,
            'discount_value': float(self.discount_value) if self.discount_value else None,
            'product_id': str(self.product_id) if self.product_id else None,
            'min_purchase_amount': float(self.min_purchase_amount) if self.min_purchase_amount else 0,
            'max_uses_per_user': self.max_uses_per_user,
            'total_available': self.total_available,
            'total_redeemed': self.total_redeemed,
            'remaining': (self.total_available - self.total_redeemed) if self.total_available else None,
            'valid_from': self.valid_from.isoformat() if self.valid_from else None,
            'valid_until': self.valid_until.isoformat() if self.valid_until else None,
            'image': self.image,
            'icon': self.icon,
            'is_active': self.is_active,
            'is_featured': self.is_featured,
            'created_at': self.created_at.isoformat()
        }


class RewardRedemption(db.Model):
    """Histórico de resgate de recompensas"""
    __tablename__ = 'reward_redemptions'

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

    # Relacionamentos
    user_id = Column(UUID(as_uuid=True), ForeignKey('users.id'), nullable=False)
    reward_id = Column(UUID(as_uuid=True), ForeignKey('rewards.id'), nullable=False)

    # Detalhes do resgate
    points_spent = Column(Integer, nullable=False)
    status = Column(String(20), default='pending', nullable=False)  # pending, completed, cancelled, expired

    # Uso da recompensa
    code = Column(String(50), unique=True)  # Código gerado para uso
    used_at = Column(DateTime(timezone=True))
    used_in_order_id = Column(UUID(as_uuid=True), ForeignKey('orders.id'))

    # Validade
    expires_at = Column(DateTime(timezone=True))

    # Notas
    notes = Column(Text)
    cancellation_reason = Column(Text)

    # Timestamps
    redeemed_at = Column(DateTime(timezone=True), default=datetime.utcnow, nullable=False)
    completed_at = Column(DateTime(timezone=True))
    cancelled_at = Column(DateTime(timezone=True))

    # Relacionamentos
    user = relationship('User', backref='reward_redemptions')
    reward = relationship('Reward', back_populates='redemptions')
    order = relationship('Order')

    # Índices
    __table_args__ = (
        CheckConstraint(
            "status IN ('pending', 'completed', 'cancelled', 'expired')",
            name='check_redemption_status'
        ),
        Index('idx_reward_redemption_user', 'user_id', 'redeemed_at'),
        Index('idx_reward_redemption_code', 'code'),
    )

    def __repr__(self):
        return f'<RewardRedemption user={self.user_id} reward={self.reward_id}>'

    def to_dict(self):
        return {
            'id': str(self.id),
            'user_id': str(self.user_id),
            'reward_id': str(self.reward_id),
            'reward_name': self.reward.name if self.reward else None,
            'points_spent': self.points_spent,
            'status': self.status,
            'code': self.code,
            'used_at': self.used_at.isoformat() if self.used_at else None,
            'used_in_order_id': str(self.used_in_order_id) if self.used_in_order_id else None,
            'expires_at': self.expires_at.isoformat() if self.expires_at else None,
            'notes': self.notes,
            'cancellation_reason': self.cancellation_reason,
            'redeemed_at': self.redeemed_at.isoformat(),
            'completed_at': self.completed_at.isoformat() if self.completed_at else None,
            'cancelled_at': self.cancelled_at.isoformat() if self.cancelled_at else None
        }
