"""
Modelos para integração com Melhor Envio
Gerenciamento de cotações, etiquetas e rastreamento de envios
"""

import uuid
from enum import Enum
from datetime import datetime

from sqlalchemy import (
    DECIMAL,
    Boolean,
    Column,
    DateTime,
    ForeignKey,
    Integer,
    String,
    Text,
    JSON,
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from database import db


class ShippingStatus(Enum):
    """Status de envio"""
    PENDING = "pending"  # Aguardando processamento
    QUOTE_CREATED = "quote_created"  # Cotação criada
    LABEL_GENERATED = "label_generated"  # Etiqueta gerada
    POSTED = "posted"  # Postado
    IN_TRANSIT = "in_transit"  # Em trânsito
    OUT_FOR_DELIVERY = "out_for_delivery"  # Saiu para entrega
    DELIVERED = "delivered"  # Entregue
    RETURNED = "returned"  # Devolvido
    CANCELLED = "cancelled"  # Cancelado
    FAILED = "failed"  # Falha


class ShippingCarrier(Enum):
    """Transportadoras suportadas pelo Melhor Envio"""
    CORREIOS = "correios"
    JADLOG = "jadlog"
    AZUL = "azul"
    LATAM = "latam"
    LOGGI = "loggi"
    SEQUOIA = "sequoia"
    MOVVI = "movvi"


class ShippingQuote(db.Model):
    """
    Cotações de frete calculadas via Melhor Envio
    Armazena as opções de envio disponíveis para um pedido
    """
    __tablename__ = "shipping_quotes"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

    # Relacionamento com pedido
    order_id = Column(UUID(as_uuid=True), ForeignKey("orders.id", ondelete="CASCADE"), nullable=True)

    # Dados da cotação
    quote_reference = Column(String(100), unique=True, nullable=False)  # Referência única da cotação
    carrier = Column(String(50), nullable=False)  # Transportadora (correios, jadlog, etc)
    service_id = Column(Integer, nullable=False)  # ID do serviço no Melhor Envio
    service_name = Column(String(100), nullable=False)  # Nome do serviço (PAC, SEDEX, etc)

    # Valores
    price = Column(DECIMAL(10, 2), nullable=False)  # Preço do frete
    discount = Column(DECIMAL(10, 2), default=0.00)  # Desconto aplicado
    final_price = Column(DECIMAL(10, 2), nullable=False)  # Preço final

    # Prazos e dimensões
    delivery_time = Column(Integer, nullable=False)  # Prazo de entrega em dias úteis
    delivery_range_min = Column(Integer)  # Prazo mínimo
    delivery_range_max = Column(Integer)  # Prazo máximo

    # Endereços
    origin_cep = Column(String(10), nullable=False)
    destination_cep = Column(String(10), nullable=False)

    # Pacote
    package_weight = Column(DECIMAL(10, 3))  # Peso em kg
    package_width = Column(DECIMAL(10, 2))  # Largura em cm
    package_height = Column(DECIMAL(10, 2))  # Altura em cm
    package_length = Column(DECIMAL(10, 2))  # Comprimento em cm

    # Serviços adicionais
    insurance_value = Column(DECIMAL(10, 2), default=0.00)
    receipt = Column(Boolean, default=False)  # Aviso de recebimento
    own_hand = Column(Boolean, default=False)  # Mão própria
    collect = Column(Boolean, default=False)  # Coleta

    # Dados adicionais da API
    api_response = Column(Text)  # JSON completo da resposta da API
    error_message = Column(Text)  # Mensagem de erro, se houver

    # Status
    is_active = Column(Boolean, default=True)  # Cotação ainda válida
    is_selected = Column(Boolean, default=False)  # Foi a opção escolhida pelo cliente

    # Timestamps
    created_at = Column(DateTime, default=func.now(), nullable=False)
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())
    expires_at = Column(DateTime)  # Quando a cotação expira

    # Relacionamentos
    order = relationship("Order", back_populates="shipping_quotes", foreign_keys=[order_id])
    shipping_label = relationship("ShippingLabel", back_populates="quote", uselist=False)

    def __repr__(self):
        return f"<ShippingQuote {self.quote_reference} - {self.carrier}/{self.service_name} - R${self.final_price}>"

    def to_dict(self):
        """Serializa para dicionário"""
        return {
            'id': str(self.id),
            'quote_reference': self.quote_reference,
            'carrier': self.carrier,
            'service_id': self.service_id,
            'service_name': self.service_name,
            'price': float(self.price),
            'discount': float(self.discount),
            'final_price': float(self.final_price),
            'delivery_time': self.delivery_time,
            'delivery_range': {
                'min': self.delivery_range_min,
                'max': self.delivery_range_max
            },
            'origin_cep': self.origin_cep,
            'destination_cep': self.destination_cep,
            'package': {
                'weight': float(self.package_weight) if self.package_weight else None,
                'width': float(self.package_width) if self.package_width else None,
                'height': float(self.package_height) if self.package_height else None,
                'length': float(self.package_length) if self.package_length else None
            },
            'additional_services': {
                'insurance_value': float(self.insurance_value),
                'receipt': self.receipt,
                'own_hand': self.own_hand,
                'collect': self.collect
            },
            'is_selected': self.is_selected,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'expires_at': self.expires_at.isoformat() if self.expires_at else None
        }


class ShippingLabel(db.Model):
    """
    Etiquetas de envio geradas pelo Melhor Envio
    Armazena informações da etiqueta de postagem
    """
    __tablename__ = "shipping_labels"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

    # Relacionamentos
    order_id = Column(UUID(as_uuid=True), ForeignKey("orders.id", ondelete="CASCADE"), nullable=False)
    quote_id = Column(UUID(as_uuid=True), ForeignKey("shipping_quotes.id", ondelete="SET NULL"))

    # Dados da etiqueta
    label_id = Column(String(100), unique=True, nullable=False)  # ID da etiqueta no Melhor Envio
    tracking_code = Column(String(100), unique=True, nullable=False)  # Código de rastreamento
    carrier = Column(String(50), nullable=False)
    service_name = Column(String(100), nullable=False)

    # URLs
    label_url = Column(Text)  # URL para download da etiqueta PDF
    tracking_url = Column(Text)  # URL de rastreamento

    # Status
    status = Column(String(50), default="pending")
    status_description = Column(String(255))

    # Postagem
    posted_at = Column(DateTime)  # Data de postagem
    estimated_delivery = Column(DateTime)  # Previsão de entrega
    delivered_at = Column(DateTime)  # Data de entrega

    # Valores
    declared_value = Column(DECIMAL(10, 2))  # Valor declarado
    shipping_cost = Column(DECIMAL(10, 2), nullable=False)  # Custo do frete

    # Dimensões do pacote
    package_weight = Column(DECIMAL(10, 3))
    package_width = Column(DECIMAL(10, 2))
    package_height = Column(DECIMAL(10, 2))
    package_length = Column(DECIMAL(10, 2))

    # Dados adicionais
    protocol = Column(String(100))  # Protocolo de postagem
    api_response = Column(Text)  # JSON completo da resposta

    # Flags
    is_cancelled = Column(Boolean, default=False)
    can_cancel = Column(Boolean, default=True)

    # Timestamps
    created_at = Column(DateTime, default=func.now(), nullable=False)
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())
    cancelled_at = Column(DateTime)

    # Relacionamentos
    order = relationship("Order", back_populates="shipping_labels", foreign_keys=[order_id])
    quote = relationship("ShippingQuote", back_populates="shipping_label", foreign_keys=[quote_id])
    tracking_events = relationship("ShippingTracking", back_populates="label", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<ShippingLabel {self.tracking_code} - {self.carrier} - Status: {self.status}>"

    def to_dict(self):
        """Serializa para dicionário"""
        return {
            'id': str(self.id),
            'order_id': str(self.order_id),
            'label_id': self.label_id,
            'tracking_code': self.tracking_code,
            'carrier': self.carrier,
            'service_name': self.service_name,
            'label_url': self.label_url,
            'tracking_url': self.tracking_url,
            'status': self.status,
            'status_description': self.status_description,
            'posted_at': self.posted_at.isoformat() if self.posted_at else None,
            'estimated_delivery': self.estimated_delivery.isoformat() if self.estimated_delivery else None,
            'delivered_at': self.delivered_at.isoformat() if self.delivered_at else None,
            'declared_value': float(self.declared_value) if self.declared_value else None,
            'shipping_cost': float(self.shipping_cost),
            'package': {
                'weight': float(self.package_weight) if self.package_weight else None,
                'width': float(self.package_width) if self.package_width else None,
                'height': float(self.package_height) if self.package_height else None,
                'length': float(self.package_length) if self.package_length else None
            },
            'protocol': self.protocol,
            'is_cancelled': self.is_cancelled,
            'can_cancel': self.can_cancel,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }


class ShippingTracking(db.Model):
    """
    Eventos de rastreamento de envios
    Armazena histórico de movimentação do pacote
    """
    __tablename__ = "shipping_tracking"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

    # Relacionamento
    label_id = Column(UUID(as_uuid=True), ForeignKey("shipping_labels.id", ondelete="CASCADE"), nullable=False)

    # Dados do evento
    tracking_code = Column(String(100), nullable=False)  # Código de rastreamento
    event_date = Column(DateTime, nullable=False)  # Data/hora do evento
    event_type = Column(String(50), nullable=False)  # Tipo do evento
    event_status = Column(String(50), nullable=False)  # Status do evento
    event_description = Column(Text, nullable=False)  # Descrição do evento

    # Localização
    location_city = Column(String(100))
    location_state = Column(String(2))
    location_country = Column(String(2), default="BR")
    location_details = Column(Text)  # Detalhes adicionais da localização

    # Destinatário (para eventos de entrega)
    received_by = Column(String(255))  # Nome de quem recebeu
    receiver_document = Column(String(50))  # Documento de quem recebeu

    # Observações
    observation = Column(Text)

    # Dados da API
    api_response = Column(Text)  # JSON do evento original

    # Timestamps
    created_at = Column(DateTime, default=func.now(), nullable=False)

    # Relacionamentos
    label = relationship("ShippingLabel", back_populates="tracking_events")

    def __repr__(self):
        return f"<ShippingTracking {self.tracking_code} - {self.event_type} at {self.event_date}>"

    def to_dict(self):
        """Serializa para dicionário"""
        return {
            'id': str(self.id),
            'tracking_code': self.tracking_code,
            'event_date': self.event_date.isoformat() if self.event_date else None,
            'event_type': self.event_type,
            'event_status': self.event_status,
            'event_description': self.event_description,
            'location': {
                'city': self.location_city,
                'state': self.location_state,
                'country': self.location_country,
                'details': self.location_details
            },
            'received_by': self.received_by,
            'receiver_document': self.receiver_document,
            'observation': self.observation,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }


# Nota: Para que os relacionamentos funcionem corretamente,
# adicione no modelo Order (models/orders.py):
#
# shipping_quotes = relationship("ShippingQuote", back_populates="order", cascade="all, delete-orphan")
# shipping_labels = relationship("ShippingLabel", back_populates="order", cascade="all, delete-orphan")
