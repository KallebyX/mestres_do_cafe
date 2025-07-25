"""
Modelos de sistema
"""

import uuid

from sqlalchemy import Boolean, Column, DateTime, ForeignKey, String, Text
from sqlalchemy.sql import func

from database import db


class SystemSetting(db.Model):
    __tablename__ = "system_settings"

    id = Column(String(36), primary_key = True, default=lambda: str(uuid.uuid4()))
    key = Column(String(255), unique = True, nullable = False)
    value = Column(Text)
    type = Column(String(20), default="string")
    description = Column(Text)
    is_active = Column(Boolean, default = True)
    created_at = Column(DateTime, default = func.now())
    updated_at = Column(DateTime, default = func.now(), onupdate = func.now())

    def __repr__(self):
        return f"<SystemSetting(id={self.id}, key={self.key})>"

    def to_dict(self):
        return {
            "id": str(self.id),
            "key": self.key,
            "value": self.value,
            "type": self.type,
            "description": self.description,
            "is_active": self.is_active,
            "created_at": self.created_at.isoformat(),
            "updated_at": self.updated_at.isoformat(),
        }


class SystemLog(db.Model):
    __tablename__ = "system_logs"

    id = Column(String(36), primary_key = True, default=lambda: str(uuid.uuid4()))
    level = Column(String(20), nullable = False)
    message = Column(Text, nullable = False)
    module = Column(String(100))
    function = Column(String(100))
    line_number = Column(String(10))
    exception_type = Column(String(100))
    exception_message = Column(Text)
    stack_trace = Column(Text)
    request_id = Column(String(100))
    user_id = Column(String(36), ForeignKey("users.id", ondelete="SET NULL"))
    ip_address = Column(String(45))
    user_agent = Column(Text)
    created_at = Column(DateTime, default = func.now())

    def __repr__(self):
        return f"<SystemLog(id={self.id}, level={self.level}, message={self.message[:50]})>"

    def to_dict(self):
        return {
            "id": str(self.id),
            "level": self.level,
            "message": self.message,
            "module": self.module,
            "function": self.function,
            "line_number": self.line_number,
            "exception_type": self.exception_type,
            "exception_message": self.exception_message,
            "stack_trace": self.stack_trace,
            "request_id": self.request_id,
            "user_id": str(self.user_id) if self.user_id is not None else None,
            "ip_address": self.ip_address,
            "user_agent": self.user_agent,
            "created_at": self.created_at.isoformat(),
        }


class AuditLog(db.Model):
    __tablename__ = "audit_logs"

    id = Column(String(36), primary_key = True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey("users.id", ondelete="SET NULL"))
    table_name = Column(String(100), nullable = False)
    record_id = Column(String(100), nullable = False)
    action = Column(String(20), nullable = False)
    old_values = Column(Text)
    new_values = Column(Text)
    ip_address = Column(String(45))
    user_agent = Column(Text)
    created_at = Column(DateTime, default = func.now())

    def __repr__(self):
        return (
            f"<AuditLog(id={self.id}, table={self.table_name}, action={self.action})>"
        )

    def to_dict(self):
        return {
            "id": str(self.id),
            "user_id": str(self.user_id) if self.user_id is not None else None,
            "table_name": self.table_name,
            "record_id": self.record_id,
            "action": self.action,
            "old_values": self.old_values,
            "new_values": self.new_values,
            "ip_address": self.ip_address,
            "user_agent": self.user_agent,
            "created_at": self.created_at.isoformat(),
        }
