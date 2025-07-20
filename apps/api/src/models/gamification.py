"""
Modelos de gamificação - Clube dos Mestres
"""

import uuid
from datetime import datetime
from decimal import Decimal

from sqlalchemy import (
    DECIMAL,
    Boolean,
    Column,
    Date,
    DateTime,
    ForeignKey,
    Integer,
    String,
    Text,
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from database import db


class PointAction(db.Model):
    """Ações que geram pontos no Clube dos Mestres"""
    __tablename__ = "point_actions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    action_type = Column(String(50), nullable=False)  # purchase, first_purchase, review, etc.
    name = Column(String(255), nullable=False)
    description = Column(Text)
    points_formula = Column(String(255))  # "value / 10" para compras, "25" para avaliações
    base_points = Column(Integer, default=0)
    multiplier = Column(DECIMAL(5, 2), default=1.0)
    max_points_per_action = Column(Integer)
    max_actions_per_day = Column(Integer)
    max_actions_per_month = Column(Integer)
    requires_verification = Column(Boolean, default=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())

    def __repr__(self):
        return f"<PointAction(id={self.id}, action_type={self.action_type}, base_points={self.base_points})>"

    def to_dict(self):
        return {
            "id": str(self.id),
            "action_type": self.action_type,
            "name": self.name,
            "description": self.description,
            "points_formula": self.points_formula,
            "base_points": self.base_points,
            "multiplier": float(self.multiplier) if self.multiplier else 1.0,
            "max_points_per_action": self.max_points_per_action,
            "max_actions_per_day": self.max_actions_per_day,
            "max_actions_per_month": self.max_actions_per_month,
            "requires_verification": self.requires_verification,
            "is_active": self.is_active,
            "created_at": self.created_at.isoformat(),
            "updated_at": self.updated_at.isoformat(),
        }


class MasterLevel(db.Model):
    """Níveis do Clube dos Mestres"""
    __tablename__ = "master_levels"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(255), nullable=False)
    description = Column(Text)
    min_points = Column(Integer, nullable=False)
    max_points = Column(Integer)
    level_order = Column(Integer, nullable=False)
    discount_percentage = Column(DECIMAL(5, 2), default=0.00)
    benefits = Column(Text)  # JSON string para compatibilidade SQLite
    badge_icon = Column(String(255))
    badge_color = Column(String(7))
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=func.now())

    def __repr__(self):
        return f"<MasterLevel(id={self.id}, name={self.name}, min_points={self.min_points})>"

    def to_dict(self):
        return {
            "id": str(self.id),
            "name": self.name,
            "description": self.description,
            "min_points": self.min_points,
            "max_points": self.max_points,
            "level_order": self.level_order,
            "discount_percentage": float(self.discount_percentage) if self.discount_percentage else 0.00,
            "benefits": self.benefits if self.benefits else [],
            "badge_icon": self.badge_icon,
            "badge_color": self.badge_color,
            "is_active": self.is_active,
            "created_at": self.created_at.isoformat(),
        }


class UserPointsBalance(db.Model):
    """Saldo atual de pontos dos usuários"""
    __tablename__ = "user_points_balance"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), unique=True)
    total_points = Column(Integer, default=0)
    available_points = Column(Integer, default=0)
    level_id = Column(UUID(as_uuid=True), ForeignKey("master_levels.id", ondelete="SET NULL"))
    level_progress = Column(DECIMAL(5, 2), default=0.00)  # Progresso % para próximo nível
    points_to_next_level = Column(Integer, default=0)
    first_purchase_completed = Column(Boolean, default=False)
    monthly_purchases = Column(Integer, default=0)
    last_monthly_reset = Column(Date)
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())

    # Relacionamentos
    user = relationship("User", back_populates="points_balance")
    level = relationship("MasterLevel")

    def __repr__(self):
        return f"<UserPointsBalance(id={self.id}, user_id={self.user_id}, total_points={self.total_points})>"

    def to_dict(self):
        return {
            "id": str(self.id),
            "user_id": str(self.user_id),
            "total_points": self.total_points,
            "available_points": self.available_points,
            "level_id": str(self.level_id) if self.level_id else None,
            "level_progress": float(self.level_progress) if self.level_progress else 0.00,
            "points_to_next_level": self.points_to_next_level,
            "first_purchase_completed": self.first_purchase_completed,
            "monthly_purchases": self.monthly_purchases,
            "last_monthly_reset": self.last_monthly_reset.isoformat() if self.last_monthly_reset else None,
            "created_at": self.created_at.isoformat(),
            "updated_at": self.updated_at.isoformat(),
        }


class Badge(db.Model):
    __tablename__ = "badges"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(255), nullable=False)
    description = Column(Text)
    badge_type = Column(String(50), nullable=False)
    criteria = Column(Text)
    points_required = Column(Integer)
    image_url = Column(Text)
    rarity = Column(String(20), default="common")
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=func.now())

    def __repr__(self):
        return f"<Badge(id={self.id}, name={self.name}, badge_type={self.badge_type})>"

    def to_dict(self):
        return {
            "id": str(self.id),
            "name": self.name,
            "description": self.description,
            "badge_type": self.badge_type,
            "criteria": self.criteria,
            "points_required": self.points_required,
            "image_url": self.image_url,
            "rarity": self.rarity,
            "is_active": self.is_active,
            "created_at": self.created_at.isoformat(),
        }


class UserBadge(db.Model):
    __tablename__ = "user_badges"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"))
    badge_id = Column(UUID(as_uuid=True), ForeignKey("badges.id", ondelete="CASCADE"))
    created_at = Column(DateTime, default=func.now())

    def __repr__(self):
        return f"<UserBadge(id={self.id}, user_id={self.user_id}, badge_id={self.badge_id})>"

    def to_dict(self):
        return {
            "id": str(self.id),
            "user_id": str(self.user_id),
            "badge_id": str(self.badge_id),
            "created_at": self.created_at.isoformat(),
        }


class Achievement(db.Model):
    __tablename__ = "achievements"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(255), nullable=False)
    description = Column(Text)
    criteria = Column(Text)
    points_reward = Column(Integer, nullable=False)
    icon_url = Column(Text)
    category = Column(String(100), default="general")
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=func.now())

    def __repr__(self):
        return f"<Achievement(id={self.id}, name={self.name}, category={self.category})>"

    def to_dict(self):
        return {
            "id": str(self.id),
            "name": self.name,
            "description": self.description,
            "criteria": self.criteria,
            "points_reward": self.points_reward,
            "icon_url": self.icon_url,
            "category": self.category,
            "is_active": self.is_active,
            "created_at": self.created_at.isoformat(),
        }


class UserAchievement(db.Model):
    __tablename__ = "user_achievements"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"))
    achievement_id = Column(UUID(as_uuid=True), ForeignKey("achievements.id", ondelete="CASCADE"))
    created_at = Column(DateTime, default=func.now())

    def __repr__(self):
        return f"<UserAchievement(id={self.id}, user_id={self.user_id}, achievement_id={self.achievement_id})>"

    def to_dict(self):
        return {
            "id": str(self.id),
            "user_id": str(self.user_id),
            "achievement_id": str(self.achievement_id),
            "created_at": self.created_at.isoformat(),
        }


class Challenge(db.Model):
    __tablename__ = "challenges"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(255), nullable=False)
    description = Column(Text)
    challenge_type = Column(String(50), nullable=False)
    target_value = Column(Integer, nullable=False)
    points_reward = Column(Integer, default=0)
    start_date = Column(Date)
    end_date = Column(Date)
    max_participants = Column(Integer)
    rules = Column(Text)
    status = Column(String(20), default="active")
    created_at = Column(DateTime, default=func.now())

    def __repr__(self):
        return f"<Challenge(id={self.id}, name={self.name}, challenge_type={self.challenge_type})>"

    def to_dict(self):
        return {
            "id": str(self.id),
            "name": self.name,
            "description": self.description,
            "challenge_type": self.challenge_type,
            "target_value": self.target_value,
            "points_reward": self.points_reward,
            "start_date": self.start_date.isoformat() if self.start_date else None,
            "end_date": self.end_date.isoformat() if self.end_date else None,
            "max_participants": self.max_participants,
            "rules": self.rules,
            "status": self.status,
            "created_at": self.created_at.isoformat(),
        }


class ChallengeParticipant(db.Model):
    __tablename__ = "challenge_participants"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    challenge_id = Column(UUID(as_uuid=True), ForeignKey("challenges.id", ondelete="CASCADE"))
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"))
    current_progress = Column(Integer, default=0)
    completed = Column(Boolean, default=False)
    completed_at = Column(DateTime)
    created_at = Column(DateTime, default=func.now())

    def __repr__(self):
        return f"<ChallengeParticipant(id={self.id}, challenge_id={self.challenge_id}, user_id={self.user_id})>"

    def to_dict(self):
        return {
            "id": str(self.id),
            "challenge_id": str(self.challenge_id),
            "user_id": str(self.user_id),
            "current_progress": self.current_progress,
            "completed": self.completed,
            "completed_at": self.completed_at.isoformat() if self.completed_at else None,
            "created_at": self.created_at.isoformat(),
        }


class UserReward(db.Model):
    __tablename__ = "user_rewards"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"))
    reward_id = Column(UUID(as_uuid=True), ForeignKey("rewards.id", ondelete="CASCADE"))
    points_spent = Column(Integer, nullable=False)
    status = Column(String(20), default="redeemed")
    expiry_date = Column(Date)
    used_at = Column(DateTime)
    created_at = Column(DateTime, default=func.now())

    def __repr__(self):
        return f"<UserReward(id={self.id}, user_id={self.user_id}, reward_id={self.reward_id})>"

    def to_dict(self):
        return {
            "id": str(self.id),
            "user_id": str(self.user_id),
            "reward_id": str(self.reward_id),
            "points_spent": self.points_spent,
            "status": self.status,
            "expiry_date": self.expiry_date.isoformat() if self.expiry_date else None,
            "used_at": self.used_at.isoformat() if self.used_at else None,
            "created_at": self.created_at.isoformat(),
        }


class GamificationLevel(db.Model):
    __tablename__ = "gamification_levels"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(255), nullable=False)
    min_points = Column(Integer, nullable=False)
    max_points = Column(Integer)
    discount_percentage = Column(DECIMAL(5, 2), default=0.00)
    benefits = Column(Text)  # JSON string para compatibilidade SQLite
    color = Column(String(7))
    icon = Column(String(50))
    sort_order = Column(Integer, default=0)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=func.now())

    def __repr__(self):
        return f"<GamificationLevel(id={self.id}, name={self.name}, min_points={self.min_points})>"

    def to_dict(self):
        return {
            "id": str(self.id),
            "name": self.name,
            "min_points": self.min_points,
            "max_points": self.max_points,
            "discount_percentage": (
                float(self.discount_percentage) if self.discount_percentage else 0.00
            ),
            "benefits": self.benefits,
            "color": self.color,
            "icon": self.icon,
            "sort_order": self.sort_order,
            "is_active": self.is_active,
            "created_at": self.created_at.isoformat(),
        }


class UserPointTransaction(db.Model):
    """Histórico de transações de pontos"""
    __tablename__ = "user_point_transactions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"))
    action_id = Column(UUID(as_uuid=True), ForeignKey("point_actions.id", ondelete="SET NULL"))
    points = Column(Integer, nullable=False)
    transaction_type = Column(String(20), nullable=False)  # 'earned', 'spent', 'expired'
    description = Column(Text)
    reference_type = Column(String(50))  # 'order', 'review', 'referral', etc.
    reference_id = Column(String(255))
    extra_data = Column(Text)  # JSON string para compatibilidade SQLite
    expires_at = Column(DateTime)
    is_verified = Column(Boolean, default=True)
    created_at = Column(DateTime, default=func.now())

    # Relacionamentos
    user = relationship("User", back_populates="points_history")
    action = relationship("PointAction")

    def __repr__(self):
        return f"<UserPointTransaction(id={self.id}, user_id={self.user_id}, points={self.points}, type={self.transaction_type})>"

    def to_dict(self):
        return {
            "id": str(self.id),
            "user_id": str(self.user_id),
            "action_id": str(self.action_id) if self.action_id else None,
            "points": self.points,
            "transaction_type": self.transaction_type,
            "description": self.description,
            "reference_type": self.reference_type,
            "reference_id": str(self.reference_id) if self.reference_id else None,
            "extra_data": self.extra_data if self.extra_data else {},
            "expires_at": self.expires_at.isoformat() if self.expires_at else None,
            "is_verified": self.is_verified,
            "created_at": self.created_at.isoformat(),
        }


class UserPoint(db.Model):
    """Compatibilidade com código existente - será removido gradualmente"""
    __tablename__ = "user_points"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"))
    points = Column(Integer, nullable=False)
    action = Column(String(100), nullable=False)
    description = Column(Text)
    reference_type = Column(String(50))
    reference_id = Column(UUID(as_uuid=True))
    expires_at = Column(DateTime)
    created_at = Column(DateTime, default=func.now())

    def __repr__(self):
        return f"<UserPoint(id={self.id}, user_id={self.user_id}, points={self.points}, action={self.action})>"

    def to_dict(self):
        return {
            "id": str(self.id),
            "user_id": str(self.user_id),
            "points": self.points,
            "action": self.action,
            "description": self.description,
            "reference_type": self.reference_type,
            "reference_id": str(self.reference_id) if self.reference_id else None,
            "expires_at": self.expires_at.isoformat() if self.expires_at else None,
            "created_at": self.created_at.isoformat(),
        }


class Reward(db.Model):
    __tablename__ = "rewards"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(255), nullable=False)
    description = Column(Text)
    type = Column(String(20), nullable=False)
    cost_points = Column(Integer, nullable=False)
    value = Column(DECIMAL(10, 2))
    max_redemptions = Column(Integer)
    current_redemptions = Column(Integer, default=0)
    is_active = Column(Boolean, default=True)
    start_date = Column(Date)
    end_date = Column(Date)
    created_at = Column(DateTime, default=func.now())

    # Relacionamentos
    redemptions = relationship("RewardRedemption", back_populates="reward")

    def __repr__(self):
        return f"<Reward(id={self.id}, name={self.name}, type={self.type}, cost_points={self.cost_points})>"

    def to_dict(self):
        return {
            "id": str(self.id),
            "name": self.name,
            "description": self.description,
            "type": self.type,
            "cost_points": self.cost_points,
            "value": float(self.value) if self.value else None,
            "max_redemptions": self.max_redemptions,
            "current_redemptions": self.current_redemptions,
            "is_active": self.is_active,
            "start_date": self.start_date.isoformat() if self.start_date else None,
            "end_date": self.end_date.isoformat() if self.end_date else None,
            "created_at": self.created_at.isoformat(),
        }


class RewardRedemption(db.Model):
    __tablename__ = "reward_redemptions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"))
    reward_id = Column(UUID(as_uuid=True), ForeignKey("rewards.id", ondelete="CASCADE"))
    points_used = Column(Integer, nullable=False)
    status = Column(String(20), default="redeemed")
    order_id = Column(UUID(as_uuid=True), ForeignKey("orders.id", ondelete="SET NULL"))
    expires_at = Column(DateTime)
    used_at = Column(DateTime)
    created_at = Column(DateTime, default=func.now())

    # Relacionamentos
    reward = relationship("Reward", back_populates="redemptions")

    def __repr__(self):
        return f"<RewardRedemption(id={self.id}, user_id={self.user_id}, reward_id={self.reward_id}, points_used={self.points_used})>"

    def to_dict(self):
        return {
            "id": str(self.id),
            "user_id": str(self.user_id),
            "reward_id": str(self.reward_id),
            "points_used": self.points_used,
            "status": self.status,
            "order_id": str(self.order_id) if self.order_id else None,
            "expires_at": self.expires_at.isoformat() if self.expires_at else None,
            "used_at": self.used_at.isoformat() if self.used_at else None,
            "created_at": self.created_at.isoformat(),
        }
