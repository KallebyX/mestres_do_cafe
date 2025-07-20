"""
Modelos de notificações
"""

import uuid
import json

from sqlalchemy import Boolean, Column, DateTime, ForeignKey, String, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from database import db


class Notification(db.Model):
    __tablename__ = "notifications"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"))
    type = Column(String(50), nullable=False)
    title = Column(String(255), nullable=False)
    message = Column(Text, nullable=False)
    data = Column(Text)  # JSON string para compatibilidade SQLite
    channels = Column(Text, default='["in_app"]')  # JSON string para compatibilidade SQLite
    is_read = Column(Boolean, default=False)
    read_at = Column(DateTime)
    expires_at = Column(DateTime)
    created_at = Column(DateTime, default=func.now())

    # Relacionamentos
    user = relationship("User", back_populates="notifications")

    def __repr__(self):
        return f"<Notification(id={self.id}, user_id={self.user_id}, type={self.type})>"

    def to_dict(self):
        return {
            "id": str(self.id),
            "user_id": str(self.user_id),
            "type": self.type,
            "title": self.title,
            "message": self.message,
            "data": self.data if self.data else {},
            "channels": self.channels,
            "is_read": self.is_read,
            "read_at": self.read_at.isoformat() if self.read_at else None,
            "expires_at": self.expires_at.isoformat() if self.expires_at else None,
            "created_at": self.created_at.isoformat(),
        }


class NotificationTemplate(db.Model):
    __tablename__ = "notification_templates"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(255), nullable=False)
    type = Column(String(50), nullable=False)
    channel = Column(String(20), nullable=False)
    subject = Column(String(255))
    body = Column(Text, nullable=False)  # Campo body para o controlador
    content = Column(Text, nullable=False)
    variables = Column(Text)  # JSON como TEXT
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())

    def __repr__(self):
        return f"<NotificationTemplate(id={self.id}, name={self.name})>"

    def to_dict(self):
        return {
            "id": str(self.id),
            "name": self.name,
            "type": self.type,
            "channel": self.channel,
            "subject": self.subject,
            "body": self.body,
            "content": self.content,
            "variables": json.loads(self.variables) if self.variables else [],
            "is_active": self.is_active,
            "created_at": self.created_at.isoformat(),
            "updated_at": self.updated_at.isoformat(),
        }


class NotificationPreference(db.Model):
    __tablename__ = "notification_preferences"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"))
    notification_type = Column(String(50), nullable=False)
    channel = Column(String(20), nullable=False)
    enabled = Column(Boolean, default=True)
    settings = Column(Text)  # JSON como TEXT
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())

    # Relacionamentos
    user = relationship("User", back_populates="notification_preferences")

    def __repr__(self):
        return f"<NotificationPreference(id={self.id}, user_id={self.user_id})>"

    def to_dict(self):
        return {
            "id": str(self.id),
            "user_id": str(self.user_id),
            "notification_type": self.notification_type,
            "channel": self.channel,
            "enabled": self.enabled,
            "settings": json.loads(self.settings) if self.settings else {},
            "created_at": self.created_at.isoformat(),
            "updated_at": self.updated_at.isoformat(),
        }


class NotificationQueue(db.Model):
    __tablename__ = "notification_queue"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"))
    type = Column(String(50), nullable=False)
    channel = Column(String(20), nullable=False)
    subject = Column(String(255))
    body = Column(Text, nullable=False)
    data = Column(Text)  # JSON como TEXT
    priority = Column(String(20), default="medium")
    status = Column(String(20), default="pending")  # pending, processing, processed, failed
    scheduled_at = Column(DateTime)
    processed_at = Column(DateTime)
    created_at = Column(DateTime, default=func.now())

    # Relacionamentos
    user = relationship("User", back_populates="notification_queue")

    def __repr__(self):
        return f"<NotificationQueue(id={self.id}, user_id={self.user_id})>"

    def to_dict(self):
        return {
            "id": str(self.id),
            "user_id": str(self.user_id),
            "type": self.type,
            "channel": self.channel,
            "subject": self.subject,
            "body": self.body,
            "data": json.loads(self.data) if self.data else {},
            "priority": self.priority,
            "status": self.status,
            "scheduled_at": self.scheduled_at.isoformat() if self.scheduled_at else None,
            "processed_at": self.processed_at.isoformat() if self.processed_at else None,
            "created_at": self.created_at.isoformat(),
        }
