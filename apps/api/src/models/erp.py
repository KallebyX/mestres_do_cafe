"""
Modelos para o ERP Avançado - Gestão de Compras, MRP, Contratos
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


class PurchaseRequest(db.Model):
    """Requisições de compra (solicitações internas)"""
    __tablename__ = 'purchase_requests'

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

    # Solicitante
    requester_id = Column(UUID(as_uuid=True), ForeignKey('users.id'), nullable=False)
    department_id = Column(UUID(as_uuid=True), ForeignKey('departments.id'))

    # Informações
    title = Column(String(500), nullable=False)
    description = Column(Text)
    priority = Column(String(20), default='medium')  # low, medium, high, urgent

    # Justificativa
    justification = Column(Text)
    usage_department = Column(String(200))

    # Aprovação
    status = Column(String(20), default='pending')  # pending, approved, rejected, cancelled
    approved_by = Column(UUID(as_uuid=True), ForeignKey('users.id'))
    approved_at = Column(DateTime(timezone=True))
    rejection_reason = Column(Text)

    # Orçamento
    estimated_cost = Column(Numeric(10, 2))
    budget_code = Column(String(50))

    # Timestamps
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)
    updated_at = Column(DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relacionamentos
    requester = relationship('User', foreign_keys=[requester_id])
    approver = relationship('User', foreign_keys=[approved_by])
    department = relationship('Department')
    items = relationship('PurchaseRequestItem', back_populates='request', cascade='all, delete-orphan')

    __table_args__ = (
        CheckConstraint(
            "status IN ('pending', 'approved', 'rejected', 'cancelled')",
            name='check_purchase_request_status'
        ),
        CheckConstraint(
            "priority IN ('low', 'medium', 'high', 'urgent')",
            name='check_purchase_request_priority'
        ),
    )

    def to_dict(self):
        return {
            'id': str(self.id),
            'title': self.title,
            'description': self.description,
            'priority': self.priority,
            'status': self.status,
            'estimated_cost': float(self.estimated_cost) if self.estimated_cost else None,
            'created_at': self.created_at.isoformat()
        }


class PurchaseRequestItem(db.Model):
    """Itens de uma requisição de compra"""
    __tablename__ = 'purchase_request_items'

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

    request_id = Column(UUID(as_uuid=True), ForeignKey('purchase_requests.id'), nullable=False)
    product_id = Column(UUID(as_uuid=True), ForeignKey('products.id'))

    # Descrição
    description = Column(String(500), nullable=False)
    specifications = Column(Text)

    # Quantidade
    quantity = Column(Numeric(10, 2), nullable=False)
    unit = Column(String(20))  # kg, un, cx, etc

    # Preço estimado
    estimated_price = Column(Numeric(10, 2))

    # Relacionamentos
    request = relationship('PurchaseRequest', back_populates='items')
    product = relationship('Product')


class SupplierContract(db.Model):
    """Contratos com fornecedores"""
    __tablename__ = 'supplier_contracts'

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

    # Fornecedor
    supplier_id = Column(UUID(as_uuid=True), ForeignKey('suppliers.id'), nullable=False)

    # Informações do contrato
    contract_number = Column(String(100), unique=True, nullable=False)
    title = Column(String(500), nullable=False)
    description = Column(Text)

    # Tipo
    type = Column(String(50), nullable=False)  # supply, service, partnership

    # Vigência
    start_date = Column(Date, nullable=False)
    end_date = Column(Date, nullable=False)
    auto_renew = Column(Boolean, default=False)

    # Valores
    total_value = Column(Numeric(12, 2))
    payment_terms = Column(String(200))  # 30/60/90 dias, etc

    # Status
    status = Column(String(20), default='draft')  # draft, active, expired, cancelled

    # Documentos
    document_url = Column(String(500))  # PDF do contrato

    # SLA e condições
    sla_terms = Column(JSONB)  # Termos de SLA
    delivery_terms = Column(JSONB)  # Termos de entrega

    # Responsáveis
    responsible_id = Column(UUID(as_uuid=True), ForeignKey('users.id'))

    # Timestamps
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)
    updated_at = Column(DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relacionamentos
    supplier = relationship('Supplier')
    responsible = relationship('User')

    __table_args__ = (
        CheckConstraint(
            "status IN ('draft', 'active', 'expired', 'cancelled')",
            name='check_supplier_contract_status'
        ),
    )

    def to_dict(self):
        return {
            'id': str(self.id),
            'contract_number': self.contract_number,
            'supplier_id': str(self.supplier_id),
            'title': self.title,
            'start_date': self.start_date.isoformat(),
            'end_date': self.end_date.isoformat(),
            'total_value': float(self.total_value) if self.total_value else None,
            'status': self.status
        }


class ProductionOrder(db.Model):
    """Ordens de produção (MRP)"""
    __tablename__ = 'production_orders'

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

    # Número da ordem
    order_number = Column(String(100), unique=True, nullable=False)

    # Produto a ser produzido
    product_id = Column(UUID(as_uuid=True), ForeignKey('products.id'), nullable=False)
    quantity = Column(Numeric(10, 2), nullable=False)

    # Planejamento
    planned_start = Column(Date, nullable=False)
    planned_end = Column(Date, nullable=False)
    actual_start = Column(Date)
    actual_end = Column(Date)

    # Status
    status = Column(String(20), default='planned')  # planned, in_progress, completed, cancelled

    # Custos
    estimated_cost = Column(Numeric(10, 2))
    actual_cost = Column(Numeric(10, 2))

    # Responsável
    supervisor_id = Column(UUID(as_uuid=True), ForeignKey('users.id'))

    # Observações
    notes = Column(Text)

    # Timestamps
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)
    updated_at = Column(DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relacionamentos
    product = relationship('Product')
    supervisor = relationship('User')
    materials = relationship('ProductionMaterial', back_populates='production_order')

    __table_args__ = (
        CheckConstraint(
            "status IN ('planned', 'in_progress', 'completed', 'cancelled')",
            name='check_production_order_status'
        ),
    )

    def to_dict(self):
        return {
            'id': str(self.id),
            'order_number': self.order_number,
            'product_id': str(self.product_id),
            'quantity': float(self.quantity),
            'status': self.status,
            'planned_start': self.planned_start.isoformat(),
            'planned_end': self.planned_end.isoformat()
        }


class ProductionMaterial(db.Model):
    """Materiais necessários para produção"""
    __tablename__ = 'production_materials'

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

    production_order_id = Column(UUID(as_uuid=True), ForeignKey('production_orders.id'), nullable=False)
    product_id = Column(UUID(as_uuid=True), ForeignKey('products.id'), nullable=False)

    # Quantidade
    quantity_needed = Column(Numeric(10, 2), nullable=False)
    quantity_used = Column(Numeric(10, 2), default=0)

    # Custo
    unit_cost = Column(Numeric(10, 2))

    # Status
    is_available = Column(Boolean, default=False)

    # Relacionamentos
    production_order = relationship('ProductionOrder', back_populates='materials')
    product = relationship('Product')


class QualityControl(db.Model):
    """Controle de qualidade"""
    __tablename__ = 'quality_controls'

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

    # Produto/Lote
    product_id = Column(UUID(as_uuid=True), ForeignKey('products.id'), nullable=False)
    batch_id = Column(UUID(as_uuid=True), ForeignKey('stock_batches.id'))
    production_order_id = Column(UUID(as_uuid=True), ForeignKey('production_orders.id'))

    # Tipo de inspeção
    type = Column(String(50), nullable=False)  # incoming, production, outgoing

    # Resultado
    status = Column(String(20), default='pending')  # pending, approved, rejected
    result = Column(String(20))  # pass, fail

    # Quantidade testada
    quantity_tested = Column(Numeric(10, 2))
    quantity_approved = Column(Numeric(10, 2))
    quantity_rejected = Column(Numeric(10, 2))

    # Critérios
    criteria = Column(JSONB)  # Critérios de avaliação
    observations = Column(Text)

    # Inspetor
    inspector_id = Column(UUID(as_uuid=True), ForeignKey('users.id'))
    inspected_at = Column(DateTime(timezone=True), default=datetime.utcnow)

    # Relacionamentos
    product = relationship('Product')
    batch = relationship('StockBatch')
    production_order = relationship('ProductionOrder')
    inspector = relationship('User')

    __table_args__ = (
        CheckConstraint(
            "type IN ('incoming', 'production', 'outgoing')",
            name='check_quality_control_type'
        ),
        CheckConstraint(
            "status IN ('pending', 'approved', 'rejected')",
            name='check_quality_control_status'
        ),
    )


class MaterialRequirement(db.Model):
    """MRP - Planejamento de necessidades de materiais"""
    __tablename__ = 'material_requirements'

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

    # Material
    product_id = Column(UUID(as_uuid=True), ForeignKey('products.id'), nullable=False)

    # Necessidade
    required_date = Column(Date, nullable=False)
    quantity_needed = Column(Numeric(10, 2), nullable=False)

    # Estoque
    current_stock = Column(Numeric(10, 2))
    on_order = Column(Numeric(10, 2), default=0)
    safety_stock = Column(Numeric(10, 2), default=0)

    # Cálculo
    to_order = Column(Numeric(10, 2))  # Quantidade a ser pedida

    # Status
    status = Column(String(20), default='pending')  # pending, ordered, received

    # Referência
    source_type = Column(String(50))  # sales_forecast, production_order
    source_id = Column(UUID(as_uuid=True))

    # Timestamps
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)

    # Relacionamentos
    product = relationship('Product')
