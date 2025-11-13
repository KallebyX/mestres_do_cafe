"""
Modelos para o sistema de Newsletter e Email Marketing
"""

from datetime import datetime
from sqlalchemy import (
    Column, String, Text, Integer, Boolean, DateTime, ForeignKey,
    CheckConstraint, Index
)
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship
import uuid
from database import db


class NewsletterSubscriber(db.Model):
    """Assinantes da newsletter"""
    __tablename__ = 'newsletter_subscribers'

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

    # Informações do assinante
    email = Column(String(255), nullable=False, unique=True, index=True)
    name = Column(String(200))
    phone = Column(String(20))

    # Vínculo com usuário (opcional - pode ser guest)
    user_id = Column(UUID(as_uuid=True), ForeignKey('users.id'))

    # Status
    status = Column(String(20), default='active', nullable=False)  # active, unsubscribed, bounced, complained

    # Preferências
    frequency = Column(String(20), default='weekly')  # daily, weekly, monthly
    categories = Column(String(500))  # Categorias de interesse (separadas por vírgula)

    # Fonte
    source = Column(String(50))  # website, landing_page, checkout, popup, manual

    # Segmentos
    tags = Column(String(500))  # Tags para segmentação

    # Verificação
    is_verified = Column(Boolean, default=False)
    verification_token = Column(String(100))
    verified_at = Column(DateTime(timezone=True))

    # Estatísticas
    emails_sent = Column(Integer, default=0)
    emails_opened = Column(Integer, default=0)
    emails_clicked = Column(Integer, default=0)
    last_opened_at = Column(DateTime(timezone=True))
    last_clicked_at = Column(DateTime(timezone=True))

    # Unsubscribe
    unsubscribed_at = Column(DateTime(timezone=True))
    unsubscribe_reason = Column(Text)

    # Timestamps
    subscribed_at = Column(DateTime(timezone=True), default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relacionamentos
    user = relationship('User', backref='newsletter_subscriptions')

    # Constraints
    __table_args__ = (
        CheckConstraint(
            "status IN ('active', 'unsubscribed', 'bounced', 'complained')",
            name='check_newsletter_subscriber_status'
        ),
        CheckConstraint(
            "frequency IN ('daily', 'weekly', 'monthly')",
            name='check_newsletter_frequency'
        ),
        Index('idx_newsletter_subscriber_status', 'status'),
        Index('idx_newsletter_subscriber_email', 'email'),
    )

    def __repr__(self):
        return f'<NewsletterSubscriber {self.email}>'

    def to_dict(self):
        return {
            'id': str(self.id),
            'email': self.email,
            'name': self.name,
            'phone': self.phone,
            'user_id': str(self.user_id) if self.user_id else None,
            'status': self.status,
            'frequency': self.frequency,
            'categories': self.categories.split(',') if self.categories else [],
            'source': self.source,
            'tags': self.tags.split(',') if self.tags else [],
            'is_verified': self.is_verified,
            'verified_at': self.verified_at.isoformat() if self.verified_at else None,
            'emails_sent': self.emails_sent,
            'emails_opened': self.emails_opened,
            'emails_clicked': self.emails_clicked,
            'last_opened_at': self.last_opened_at.isoformat() if self.last_opened_at else None,
            'last_clicked_at': self.last_clicked_at.isoformat() if self.last_clicked_at else None,
            'subscribed_at': self.subscribed_at.isoformat(),
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }


class NewsletterTemplate(db.Model):
    """Templates de email para newsletter"""
    __tablename__ = 'newsletter_templates'

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

    # Informações do template
    name = Column(String(200), nullable=False)
    description = Column(Text)
    category = Column(String(50))  # promotional, transactional, newsletter

    # Conteúdo
    subject = Column(String(500), nullable=False)
    preheader = Column(String(500))  # Texto de preview
    html_content = Column(Text, nullable=False)
    text_content = Column(Text)  # Versão texto puro

    # Design
    thumbnail = Column(String(500))  # Preview do template

    # Variáveis disponíveis
    variables = Column(JSONB)  # Lista de variáveis que podem ser usadas (ex: {{name}}, {{product}})

    # Status
    is_active = Column(Boolean, default=True)
    is_default = Column(Boolean, default=False)

    # Timestamps
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)
    updated_at = Column(DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow)
    created_by = Column(UUID(as_uuid=True), ForeignKey('users.id'))

    # Relacionamentos
    creator = relationship('User', backref='newsletter_templates')
    campaigns = relationship('NewsletterCampaign', back_populates='template')

    def __repr__(self):
        return f'<NewsletterTemplate {self.name}>'

    def to_dict(self):
        return {
            'id': str(self.id),
            'name': self.name,
            'description': self.description,
            'category': self.category,
            'subject': self.subject,
            'preheader': self.preheader,
            'html_content': self.html_content,
            'text_content': self.text_content,
            'thumbnail': self.thumbnail,
            'variables': self.variables,
            'is_active': self.is_active,
            'is_default': self.is_default,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
            'created_by': str(self.created_by) if self.created_by else None
        }


class NewsletterCampaign(db.Model):
    """Campanhas de email marketing"""
    __tablename__ = 'newsletter_campaigns'

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

    # Informações da campanha
    name = Column(String(200), nullable=False)
    description = Column(Text)
    type = Column(String(50), default='regular')  # regular, automated, ab_test

    # Template
    template_id = Column(UUID(as_uuid=True), ForeignKey('newsletter_templates.id'))
    subject = Column(String(500), nullable=False)
    preheader = Column(String(500))

    # Conteúdo customizado (sobrescreve template se preenchido)
    html_content = Column(Text)
    text_content = Column(Text)

    # Segmentação
    target_audience = Column(String(50), default='all')  # all, active, segment, custom
    segment_filters = Column(JSONB)  # Filtros para segmentação
    tags = Column(String(500))  # Tags para filtrar destinatários

    # Agendamento
    status = Column(String(20), default='draft', nullable=False)  # draft, scheduled, sending, sent, cancelled
    scheduled_at = Column(DateTime(timezone=True))
    sent_at = Column(DateTime(timezone=True))

    # Estatísticas
    total_recipients = Column(Integer, default=0)
    total_sent = Column(Integer, default=0)
    total_delivered = Column(Integer, default=0)
    total_opened = Column(Integer, default=0)
    total_clicked = Column(Integer, default=0)
    total_bounced = Column(Integer, default=0)
    total_complained = Column(Integer, default=0)
    total_unsubscribed = Column(Integer, default=0)

    # Taxas calculadas
    open_rate = Column(Integer, default=0)  # Percentual
    click_rate = Column(Integer, default=0)  # Percentual
    bounce_rate = Column(Integer, default=0)  # Percentual

    # Metadados
    metadata = Column(JSONB)  # Dados adicionais

    # A/B Testing
    ab_test_variant = Column(String(10))  # A, B, C
    ab_test_parent_id = Column(UUID(as_uuid=True), ForeignKey('newsletter_campaigns.id'))

    # Timestamps
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)
    updated_at = Column(DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow)
    created_by = Column(UUID(as_uuid=True), ForeignKey('users.id'))

    # Relacionamentos
    template = relationship('NewsletterTemplate', back_populates='campaigns')
    creator = relationship('User', backref='newsletter_campaigns')
    ab_test_parent = relationship('NewsletterCampaign', remote_side=[id], backref='ab_test_variants')

    # Constraints
    __table_args__ = (
        CheckConstraint(
            "status IN ('draft', 'scheduled', 'sending', 'sent', 'cancelled')",
            name='check_newsletter_campaign_status'
        ),
        CheckConstraint(
            "target_audience IN ('all', 'active', 'segment', 'custom')",
            name='check_newsletter_campaign_audience'
        ),
        Index('idx_newsletter_campaign_status', 'status'),
        Index('idx_newsletter_campaign_scheduled', 'scheduled_at'),
    )

    def __repr__(self):
        return f'<NewsletterCampaign {self.name}>'

    def to_dict(self):
        return {
            'id': str(self.id),
            'name': self.name,
            'description': self.description,
            'type': self.type,
            'template_id': str(self.template_id) if self.template_id else None,
            'subject': self.subject,
            'preheader': self.preheader,
            'target_audience': self.target_audience,
            'segment_filters': self.segment_filters,
            'tags': self.tags.split(',') if self.tags else [],
            'status': self.status,
            'scheduled_at': self.scheduled_at.isoformat() if self.scheduled_at else None,
            'sent_at': self.sent_at.isoformat() if self.sent_at else None,
            'total_recipients': self.total_recipients,
            'total_sent': self.total_sent,
            'total_delivered': self.total_delivered,
            'total_opened': self.total_opened,
            'total_clicked': self.total_clicked,
            'total_bounced': self.total_bounced,
            'total_complained': self.total_complained,
            'total_unsubscribed': self.total_unsubscribed,
            'open_rate': self.open_rate,
            'click_rate': self.click_rate,
            'bounce_rate': self.bounce_rate,
            'metadata': self.metadata,
            'ab_test_variant': self.ab_test_variant,
            'ab_test_parent_id': str(self.ab_test_parent_id) if self.ab_test_parent_id else None,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
            'created_by': str(self.created_by) if self.created_by else None
        }


# Modelo Campaign genérico (marketing campaigns)
class Campaign(db.Model):
    """Campanhas de marketing genéricas (não apenas email)"""
    __tablename__ = 'campaigns'

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

    # Informações da campanha
    name = Column(String(200), nullable=False)
    description = Column(Text)
    type = Column(String(50), nullable=False)  # email, sms, push, social, multi_channel

    # Status
    status = Column(String(20), default='draft', nullable=False)  # draft, active, paused, completed, cancelled

    # Período
    start_date = Column(DateTime(timezone=True))
    end_date = Column(DateTime(timezone=True))

    # Orçamento
    budget = Column(Integer)  # Em centavos
    spent = Column(Integer, default=0)  # Em centavos

    # Objetivos
    goal_type = Column(String(50))  # sales, leads, engagement, awareness
    goal_value = Column(Integer)  # Meta numérica

    # Resultados
    impressions = Column(Integer, default=0)
    clicks = Column(Integer, default=0)
    conversions = Column(Integer, default=0)
    revenue = Column(Integer, default=0)  # Em centavos

    # Metadados
    metadata = Column(JSONB)

    # Timestamps
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)
    updated_at = Column(DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow)
    created_by = Column(UUID(as_uuid=True), ForeignKey('users.id'))

    # Relacionamentos
    creator = relationship('User', backref='campaigns')

    # Constraints
    __table_args__ = (
        CheckConstraint(
            "status IN ('draft', 'active', 'paused', 'completed', 'cancelled')",
            name='check_campaign_status'
        ),
        CheckConstraint(
            "type IN ('email', 'sms', 'push', 'social', 'multi_channel')",
            name='check_campaign_type'
        ),
    )

    def __repr__(self):
        return f'<Campaign {self.name}>'

    def to_dict(self):
        return {
            'id': str(self.id),
            'name': self.name,
            'description': self.description,
            'type': self.type,
            'status': self.status,
            'start_date': self.start_date.isoformat() if self.start_date else None,
            'end_date': self.end_date.isoformat() if self.end_date else None,
            'budget': self.budget,
            'spent': self.spent,
            'goal_type': self.goal_type,
            'goal_value': self.goal_value,
            'impressions': self.impressions,
            'clicks': self.clicks,
            'conversions': self.conversions,
            'revenue': self.revenue,
            'metadata': self.metadata,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
            'created_by': str(self.created_by) if self.created_by else None
        }
