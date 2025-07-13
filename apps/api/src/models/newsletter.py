"""
Modelos de newsletter e campanhas
"""

import uuid
import json

from sqlalchemy import Boolean, Column, DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from ..database import db


class NewsletterSubscriber(db.Model):
    __tablename__ = "newsletter_subscribers"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String(255), unique=True, nullable=False)
    name = Column(String(255))
    phone = Column(String(20))
    is_subscribed = Column(Boolean, default=True)
    preferences = Column(Text)  # JSON string para compatibilidade SQLite
    source = Column(String(50))
    last_email_sent = Column(DateTime)
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())

    def __repr__(self):
        return f"<NewsletterSubscriber(id={self.id}, email={self.email}, is_subscribed={self.is_subscribed})>"

    def to_dict(self):
        return {
            "id": str(self.id),
            "email": self.email,
            "name": self.name,
            "phone": self.phone,
            "is_subscribed": self.is_subscribed,
            "preferences": self.preferences if self.preferences else {},
            "source": self.source,
            "last_email_sent": (
                self.last_email_sent.isoformat() if self.last_email_sent else None
            ),
            "created_at": self.created_at.isoformat(),
            "updated_at": self.updated_at.isoformat(),
        }


class NewsletterTemplate(db.Model):
    __tablename__ = "newsletter_templates"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(255), nullable=False)
    subject = Column(String(255))
    html_content = Column(Text, nullable=False)
    text_content = Column(Text)
    type = Column(String(50), default="newsletter")
    variables = Column(Text)  # JSON string para compatibilidade SQLite
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())

    def __repr__(self):
        return f"<NewsletterTemplate(id={self.id}, name={self.name})>"

    def to_dict(self):
        return {
            "id": str(self.id),
            "name": self.name,
            "subject": self.subject,
            "html_content": self.html_content,
            "text_content": self.text_content,
            "type": self.type,
            "variables": self.variables if self.variables else {},
            "is_active": self.is_active,
            "created_at": self.created_at.isoformat(),
            "updated_at": self.updated_at.isoformat(),
        }


class NewsletterCampaign(db.Model):
    __tablename__ = "newsletter_campaigns"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(255), nullable=False)
    subject = Column(String(255), nullable=False)
    template_id = Column(
        UUID(as_uuid=True),
        ForeignKey("newsletter_templates.id", ondelete="SET NULL")
    )
    status = Column(String(20), default="draft")
    type = Column(String(50), default="newsletter")
    segment_criteria = Column(Text)  # JSON string para compatibilidade SQLite
    scheduled_at = Column(DateTime)
    sent_at = Column(DateTime)

    # Métricas
    total_sent = Column(Integer, default=0)
    total_opened = Column(Integer, default=0)
    total_clicked = Column(Integer, default=0)
    total_bounced = Column(Integer, default=0)
    total_unsubscribed = Column(Integer, default=0)

    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())

    def __repr__(self):
        return f"<NewsletterCampaign(id={self.id}, name={self.name})>"

    def to_dict(self):
        return {
            "id": str(self.id),
            "name": self.name,
            "subject": self.subject,
            "template_id": str(self.template_id) if self.template_id else None,
            "status": self.status,
            "type": self.type,
            "segment_criteria": self.segment_criteria if self.segment_criteria else {},
            "scheduled_at": (
                self.scheduled_at.isoformat() if self.scheduled_at else None
            ),
            "sent_at": self.sent_at.isoformat() if self.sent_at else None,
            "total_sent": self.total_sent,
            "total_opened": self.total_opened,
            "total_clicked": self.total_clicked,
            "total_bounced": self.total_bounced,
            "total_unsubscribed": self.total_unsubscribed,
            "created_at": self.created_at.isoformat(),
            "updated_at": self.updated_at.isoformat(),
        }


class Newsletter(db.Model):
    __tablename__ = "newsletters"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(255), nullable=False)
    subject = Column(String(255), nullable=False)
    content = Column(Text, nullable=False)
    html_content = Column(Text)
    text_content = Column(Text)
    template_id = Column(
        UUID(as_uuid=True),
        ForeignKey("newsletter_templates.id", ondelete="SET NULL")
    )
    campaign_id = Column(
        UUID(as_uuid=True),
        ForeignKey("newsletter_campaigns.id", ondelete="SET NULL")
    )
    status = Column(String(20), default="draft")
    sent_at = Column(DateTime)
    
    # Métricas
    total_sent = Column(Integer, default=0)
    total_opened = Column(Integer, default=0)
    total_clicked = Column(Integer, default=0)
    total_bounced = Column(Integer, default=0)
    
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())

    def __repr__(self):
        return f"<Newsletter(id={self.id}, name={self.name})>"

    def to_dict(self):
        return {
            "id": str(self.id),
            "name": self.name,
            "subject": self.subject,
            "content": self.content,
            "html_content": self.html_content,
            "text_content": self.text_content,
            "template_id": str(self.template_id) if self.template_id else None,
            "campaign_id": str(self.campaign_id) if self.campaign_id else None,
            "status": self.status,
            "sent_at": self.sent_at.isoformat() if self.sent_at else None,
            "total_sent": self.total_sent,
            "total_opened": self.total_opened,
            "total_clicked": self.total_clicked,
            "total_bounced": self.total_bounced,
            "created_at": self.created_at.isoformat(),
            "updated_at": self.updated_at.isoformat(),
        }


class Campaign(db.Model):
    __tablename__ = "campaigns"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(255), nullable=False)
    description = Column(Text)
    type = Column(String(50), nullable=False)
    status = Column(String(20), default="draft")
    subject = Column(String(255))
    content = Column(Text)

    # Segmentação
    target_audience = Column(Text)  # JSON como TEXT

    # Cronograma
    start_date = Column(DateTime)
    end_date = Column(DateTime)

    # Métricas
    total_recipients = Column(Integer, default=0)
    sent_count = Column(Integer, default=0)
    delivered_count = Column(Integer, default=0)
    opened_count = Column(Integer, default=0)
    clicked_count = Column(Integer, default=0)
    converted_count = Column(Integer, default=0)

    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())

    def __repr__(self):
        return f"<Campaign(id={self.id}, name={self.name}, type={self.type}, status={self.status})>"

    def to_dict(self):
        return {
            "id": str(self.id),
            "name": self.name,
            "description": self.description,
            "type": self.type,
            "status": self.status,
            "subject": self.subject,
            "content": self.content,
            "target_audience": self.target_audience,
            "start_date": self.start_date.isoformat() if self.start_date else None,
            "end_date": self.end_date.isoformat() if self.end_date else None,
            "total_recipients": self.total_recipients,
            "sent_count": self.sent_count,
            "delivered_count": self.delivered_count,
            "opened_count": self.opened_count,
            "clicked_count": self.clicked_count,
            "converted_count": self.converted_count,
            "created_at": self.created_at.isoformat(),
            "updated_at": self.updated_at.isoformat(),
        }
