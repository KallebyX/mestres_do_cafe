"""
Modelos para CRM Avançado
Pipeline de Vendas, Funil de Conversão, Automações
"""

from datetime import datetime
from decimal import Decimal
from sqlalchemy import (
    Column, String, Text, Integer, Numeric, Boolean, DateTime, Date, ForeignKey,
    CheckConstraint, Index
)
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship
import uuid
from database import db


class SalesPipeline(db.Model):
    """Pipelines de vendas (funis personalizados)"""
    __tablename__ = 'sales_pipelines'

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

    # Informações
    name = Column(String(200), nullable=False)
    description = Column(Text)

    # Tipo
    type = Column(String(50), default='sales')  # sales, recruitment, support

    # Status
    is_active = Column(Boolean, default=True)
    is_default = Column(Boolean, default=False)

    # Configurações
    probability_enabled = Column(Boolean, default=True)  # Usar probabilidade de fechamento

    # Timestamps
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)
    updated_at = Column(DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relacionamentos
    stages = relationship('PipelineStage', back_populates='pipeline', cascade='all, delete-orphan')
    deals = relationship('Deal', back_populates='pipeline')

    def to_dict(self):
        return {
            'id': str(self.id),
            'name': self.name,
            'description': self.description,
            'is_active': self.is_active,
            'stages': [stage.to_dict() for stage in self.stages] if hasattr(self, 'stages') else []
        }


class PipelineStage(db.Model):
    """Estágios do pipeline (funil)"""
    __tablename__ = 'pipeline_stages'

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

    # Pipeline
    pipeline_id = Column(UUID(as_uuid=True), ForeignKey('sales_pipelines.id'), nullable=False)

    # Informações
    name = Column(String(200), nullable=False)
    description = Column(Text)

    # Ordem e probabilidade
    order = Column(Integer, nullable=False)  # Ordem no funil (1, 2, 3...)
    probability = Column(Integer, default=0)  # Probabilidade de fechamento (0-100%)

    # Cores (UI)
    color = Column(String(7))  # Hex color

    # Tipo
    is_won = Column(Boolean, default=False)  # Estágio de ganho
    is_lost = Column(Boolean, default=False)  # Estágio de perda

    # Automações
    auto_actions = Column(JSONB)  # Ações automáticas ao entrar no estágio

    # Timestamps
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)

    # Relacionamentos
    pipeline = relationship('SalesPipeline', back_populates='stages')
    deals = relationship('Deal', back_populates='stage')

    __table_args__ = (
        Index('idx_pipeline_stage_pipeline', 'pipeline_id', 'order'),
    )

    def to_dict(self):
        return {
            'id': str(self.id),
            'name': self.name,
            'order': self.order,
            'probability': self.probability,
            'color': self.color
        }


class Deal(db.Model):
    """Negócios/Oportunidades de venda"""
    __tablename__ = 'deals'

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

    # Informações
    title = Column(String(500), nullable=False)
    description = Column(Text)

    # Cliente/Lead
    customer_id = Column(UUID(as_uuid=True), ForeignKey('customers.id'))
    lead_id = Column(UUID(as_uuid=True), ForeignKey('leads.id'))
    contact_id = Column(UUID(as_uuid=True), ForeignKey('contacts.id'))

    # Pipeline e estágio
    pipeline_id = Column(UUID(as_uuid=True), ForeignKey('sales_pipelines.id'), nullable=False)
    stage_id = Column(UUID(as_uuid=True), ForeignKey('pipeline_stages.id'), nullable=False)

    # Valores
    expected_value = Column(Numeric(12, 2))  # Valor esperado
    actual_value = Column(Numeric(12, 2))  # Valor real (se ganhou)
    probability = Column(Integer, default=0)  # Probabilidade % (do estágio ou customizada)

    # Datas
    expected_close_date = Column(Date)
    actual_close_date = Column(Date)

    # Status
    status = Column(String(20), default='open')  # open, won, lost
    lost_reason = Column(String(200))  # Motivo da perda

    # Responsável
    owner_id = Column(UUID(as_uuid=True), ForeignKey('users.id'), nullable=False)

    # Origem
    source = Column(String(100))  # website, referral, cold_call, etc

    # Tags
    tags = Column(String(500))

    # Próximo passo
    next_action = Column(String(500))
    next_action_date = Column(Date)

    # Timestamps
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)
    updated_at = Column(DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow)
    moved_to_stage_at = Column(DateTime(timezone=True), default=datetime.utcnow)

    # Relacionamentos
    customer = relationship('Customer')
    lead = relationship('Lead')
    contact = relationship('Contact')
    pipeline = relationship('SalesPipeline', back_populates='deals')
    stage = relationship('PipelineStage', back_populates='deals')
    owner = relationship('User')
    activities = relationship('DealActivity', back_populates='deal', cascade='all, delete-orphan')
    notes = relationship('DealNote', back_populates='deal', cascade='all, delete-orphan')

    __table_args__ = (
        CheckConstraint(
            "status IN ('open', 'won', 'lost')",
            name='check_deal_status'
        ),
        Index('idx_deal_owner', 'owner_id'),
        Index('idx_deal_stage', 'stage_id'),
    )

    def to_dict(self):
        return {
            'id': str(self.id),
            'title': self.title,
            'expected_value': float(self.expected_value) if self.expected_value else None,
            'probability': self.probability,
            'status': self.status,
            'stage_id': str(self.stage_id),
            'owner_id': str(self.owner_id),
            'created_at': self.created_at.isoformat()
        }


class DealActivity(db.Model):
    """Atividades relacionadas a um negócio"""
    __tablename__ = 'deal_activities'

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

    # Negócio
    deal_id = Column(UUID(as_uuid=True), ForeignKey('deals.id'), nullable=False)

    # Tipo de atividade
    type = Column(String(50), nullable=False)  # call, email, meeting, task, note

    # Informações
    subject = Column(String(500))
    description = Column(Text)

    # Agendamento
    scheduled_at = Column(DateTime(timezone=True))
    completed_at = Column(DateTime(timezone=True))

    # Status
    status = Column(String(20), default='pending')  # pending, completed, cancelled

    # Responsável
    assigned_to = Column(UUID(as_uuid=True), ForeignKey('users.id'))

    # Timestamps
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)
    created_by = Column(UUID(as_uuid=True), ForeignKey('users.id'))

    # Relacionamentos
    deal = relationship('Deal', back_populates='activities')
    assignee = relationship('User', foreign_keys=[assigned_to])
    creator = relationship('User', foreign_keys=[created_by])

    __table_args__ = (
        CheckConstraint(
            "type IN ('call', 'email', 'meeting', 'task', 'note')",
            name='check_deal_activity_type'
        ),
    )


class DealNote(db.Model):
    """Notas/Observações sobre negócios"""
    __tablename__ = 'deal_notes'

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

    # Negócio
    deal_id = Column(UUID(as_uuid=True), ForeignKey('deals.id'), nullable=False)

    # Conteúdo
    content = Column(Text, nullable=False)

    # Autor
    created_by = Column(UUID(as_uuid=True), ForeignKey('users.id'), nullable=False)

    # Timestamps
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)
    updated_at = Column(DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relacionamentos
    deal = relationship('Deal', back_populates='notes')
    author = relationship('User')


class SalesFunnel(db.Model):
    """Funil de conversão (análise)"""
    __tablename__ = 'sales_funnels'

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

    # Pipeline
    pipeline_id = Column(UUID(as_uuid=True), ForeignKey('sales_pipelines.id'), nullable=False)

    # Período
    start_date = Column(Date, nullable=False)
    end_date = Column(Date, nullable=False)

    # Métricas
    total_leads = Column(Integer, default=0)
    qualified_leads = Column(Integer, default=0)
    proposals_sent = Column(Integer, default=0)
    negotiations = Column(Integer, default=0)
    won_deals = Column(Integer, default=0)
    lost_deals = Column(Integer, default=0)

    # Valores
    total_value = Column(Numeric(12, 2), default=0)
    won_value = Column(Numeric(12, 2), default=0)
    lost_value = Column(Numeric(12, 2), default=0)

    # Taxas de conversão (%)
    qualification_rate = Column(Numeric(5, 2))
    proposal_rate = Column(Numeric(5, 2))
    closing_rate = Column(Numeric(5, 2))

    # Tempo médio
    avg_time_to_close = Column(Integer)  # Dias

    # Timestamps
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)

    # Relacionamentos
    pipeline = relationship('SalesPipeline')

    def to_dict(self):
        return {
            'id': str(self.id),
            'period': f'{self.start_date.isoformat()} - {self.end_date.isoformat()}',
            'total_leads': self.total_leads,
            'won_deals': self.won_deals,
            'won_value': float(self.won_value),
            'closing_rate': float(self.closing_rate) if self.closing_rate else 0
        }


class MarketingAutomation(db.Model):
    """Automações de marketing"""
    __tablename__ = 'marketing_automations'

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

    # Informações
    name = Column(String(200), nullable=False)
    description = Column(Text)

    # Tipo
    type = Column(String(50), nullable=False)  # email_sequence, lead_scoring, task_creation

    # Trigger (gatilho)
    trigger_event = Column(String(100), nullable=False)  # lead_created, deal_stage_changed, etc
    trigger_conditions = Column(JSONB)  # Condições para ativar

    # Ações
    actions = Column(JSONB, nullable=False)  # Lista de ações a executar

    # Status
    is_active = Column(Boolean, default=True)

    # Estatísticas
    times_triggered = Column(Integer, default=0)
    times_succeeded = Column(Integer, default=0)
    times_failed = Column(Integer, default=0)

    # Timestamps
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)
    updated_at = Column(DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow)
    created_by = Column(UUID(as_uuid=True), ForeignKey('users.id'))

    # Relacionamentos
    creator = relationship('User')

    def to_dict(self):
        return {
            'id': str(self.id),
            'name': self.name,
            'type': self.type,
            'trigger_event': self.trigger_event,
            'is_active': self.is_active,
            'times_triggered': self.times_triggered
        }


class LeadScore(db.Model):
    """Pontuação de leads (lead scoring)"""
    __tablename__ = 'lead_scores'

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

    # Lead
    lead_id = Column(UUID(as_uuid=True), ForeignKey('leads.id'), nullable=False, unique=True)

    # Pontuação
    total_score = Column(Integer, default=0)
    demographic_score = Column(Integer, default=0)  # Cargo, empresa, setor
    behavioral_score = Column(Integer, default=0)  # Visitas, downloads, emails abertos

    # Classificação
    grade = Column(String(5))  # A, B, C, D
    qualification = Column(String(20))  # hot, warm, cold

    # Detalhes
    score_details = Column(JSONB)  # Detalhamento da pontuação

    # Timestamps
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)
    updated_at = Column(DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relacionamentos
    lead = relationship('Lead')

    def to_dict(self):
        return {
            'lead_id': str(self.lead_id),
            'total_score': self.total_score,
            'grade': self.grade,
            'qualification': self.qualification
        }
