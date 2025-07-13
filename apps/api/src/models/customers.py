"""
Modelos de clientes e CRM
"""

import uuid

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

from ..database import db


class Customer(db.Model):
    __tablename__ = 'customers'
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey('users.id', ondelete='SET NULL'))
    name = Column(String(255), nullable=False)
    email = Column(String(255), nullable=False)
    phone = Column(String(20))
    cpf_cnpj = Column(String(18))
    birth_date = Column(Date)
    customer_type = Column(String(20), default='individual')
    company_name = Column(String(255))
    
    # Endereço principal
    address_street = Column(String(255))
    address_number = Column(String(10))
    address_complement = Column(String(100))
    address_neighborhood = Column(String(100))
    address_city = Column(String(100))
    address_state = Column(String(2))
    address_cep = Column(String(9))
    address_country = Column(String(2), default='BR')
    
    # Dados CRM
    status = Column(String(20), default='active')
    source = Column(String(50))
    acquisition_date = Column(Date, default=func.current_date())
    
    # Métricas
    total_orders = Column(Integer, default=0)
    total_spent = Column(DECIMAL(10, 2), default=0.00)
    avg_order_value = Column(DECIMAL(10, 2), default=0.00)
    last_order_date = Column(Date)
    
    # Preferências
    is_subscribed = Column(Boolean, default=True)
    
    # Controle
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())
    
    # Relacionamentos
    addresses = relationship("CustomerAddress", back_populates="customer")
    orders = relationship("Order", back_populates="customer")
    leads = relationship("Lead", back_populates="customer")
    contacts = relationship("Contact", back_populates="customer")
    
    def __repr__(self):
        return f"<Customer(id={self.id}, name={self.name}, email={self.email})>"
    
    def to_dict(self):
        return {
            'id': str(self.id),
            'user_id': str(self.user_id) if self.user_id else None,
            'name': self.name,
            'email': self.email,
            'phone': self.phone,
            'cpf_cnpj': self.cpf_cnpj,
            'birth_date': self.birth_date.isoformat() if self.birth_date else None,
            'customer_type': self.customer_type,
            'company_name': self.company_name,
            'status': self.status,
            'source': self.source,
            'total_orders': self.total_orders,
            'total_spent': float(self.total_spent) if self.total_spent else 0.00,
            'avg_order_value': float(self.avg_order_value) if self.avg_order_value else 0.00,
            'last_order_date': self.last_order_date.isoformat() if self.last_order_date else None,
            'is_subscribed': self.is_subscribed,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }


class CustomerAddress(db.Model):
    __tablename__ = 'customer_addresses'
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    customer_id = Column(
        UUID(as_uuid=True),
        ForeignKey('customers.id', ondelete='CASCADE')
    )
    type = Column(String(20), default='delivery')
    label = Column(String(50))
    street = Column(String(255), nullable=False)
    number = Column(String(10))
    complement = Column(String(100))
    neighborhood = Column(String(100))
    city = Column(String(100), nullable=False)
    state = Column(String(2), nullable=False)
    cep = Column(String(9), nullable=False)
    country = Column(String(2), default='BR')
    is_default = Column(Boolean, default=False)
    created_at = Column(DateTime, default=func.now())
    
    # Relacionamentos
    customer = relationship("Customer", back_populates="addresses")
    
    def __repr__(self):
        return f"<CustomerAddress(id={self.id}, customer_id={self.customer_id}, type={self.type})>"
    
    def to_dict(self):
        return {
            'id': str(self.id),
            'customer_id': str(self.customer_id),
            'type': self.type,
            'label': self.label,
            'street': self.street,
            'number': self.number,
            'complement': self.complement,
            'neighborhood': self.neighborhood,
            'city': self.city,
            'state': self.state,
            'cep': self.cep,
            'country': self.country,
            'is_default': self.is_default,
            'created_at': self.created_at.isoformat()
        }


class Lead(db.Model):
    __tablename__ = 'leads'
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(255), nullable=False)
    email = Column(String(255), nullable=False)
    phone = Column(String(20))
    company_name = Column(String(255))
    status = Column(String(20), default='new')
    source = Column(String(50))
    interest_level = Column(String(20), default='medium')
    estimated_value = Column(DECIMAL(10, 2))
    conversion_probability = Column(Integer, default=0)
    assigned_to = Column(
        UUID(as_uuid=True),
        ForeignKey('users.id', ondelete='SET NULL')
    )
    customer_id = Column(
        UUID(as_uuid=True),
        ForeignKey('customers.id', ondelete='SET NULL')
    )
    notes = Column(Text)
    next_follow_up_date = Column(Date)
    converted_at = Column(DateTime)
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())
    
    # Relacionamentos
    customer = relationship("Customer", back_populates="leads")
    contacts = relationship("Contact", back_populates="lead")
    
    def __repr__(self):
        return f"<Lead(id={self.id}, name={self.name}, email={self.email}, status={self.status})>"
    
    def to_dict(self):
        return {
            'id': str(self.id),
            'name': self.name,
            'email': self.email,
            'phone': self.phone,
            'company_name': self.company_name,
            'status': self.status,
            'source': self.source,
            'interest_level': self.interest_level,
            'estimated_value': float(self.estimated_value) if self.estimated_value else None,
            'conversion_probability': self.conversion_probability,
            'assigned_to': str(self.assigned_to) if self.assigned_to else None,
            'customer_id': str(self.customer_id) if self.customer_id else None,
            'notes': self.notes,
            'next_follow_up_date': self.next_follow_up_date.isoformat() if self.next_follow_up_date else None,
            'converted_at': self.converted_at.isoformat() if self.converted_at else None,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }


class Contact(db.Model):
    __tablename__ = 'contacts'
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    customer_id = Column(
        UUID(as_uuid=True),
        ForeignKey('customers.id', ondelete='CASCADE')
    )
    lead_id = Column(
        UUID(as_uuid=True),
        ForeignKey('leads.id', ondelete='CASCADE')
    )
    user_id = Column(
        UUID(as_uuid=True),
        ForeignKey('users.id', ondelete='SET NULL')
    )
    type = Column(String(20), nullable=False)
    subject = Column(String(255))
    description = Column(Text)
    outcome = Column(String(20))
    next_action = Column(String(255))
    follow_up_date = Column(Date)
    created_at = Column(DateTime, default=func.now())
    
    # Relacionamentos
    customer = relationship("Customer", back_populates="contacts")
    lead = relationship("Lead", back_populates="contacts")
    
    def __repr__(self):
        return f"<Contact(id={self.id}, type={self.type}, subject={self.subject})>"
    
    def to_dict(self):
        return {
            'id': str(self.id),
            'customer_id': str(self.customer_id) if self.customer_id else None,
            'lead_id': str(self.lead_id) if self.lead_id else None,
            'user_id': str(self.user_id) if self.user_id else None,
            'type': self.type,
            'subject': self.subject,
            'description': self.description,
            'outcome': self.outcome,
            'next_action': self.next_action,
            'follow_up_date': self.follow_up_date.isoformat() if self.follow_up_date else None,
            'created_at': self.created_at.isoformat()
        }


class CustomerSegment(db.Model):
    __tablename__ = 'customer_segments'
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(255), nullable=False)
    description = Column(Text)
    criteria = Column(Text)  # JSON como TEXT
    customer_count = Column(Integer, default=0)
    avg_order_value = Column(DECIMAL(10, 2), default=0.00)
    total_revenue = Column(DECIMAL(10, 2), default=0.00)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())
    
    # Relacionamentos
    memberships = relationship(
        "CustomerSegmentMembership",
        back_populates="segment"
    )
    
    def __repr__(self):
        return f"<CustomerSegment(id={self.id}, name={self.name})>"
    
    def to_dict(self):
        return {
            'id': str(self.id),
            'name': self.name,
            'description': self.description,
            'criteria': self.criteria,
            'customer_count': self.customer_count,
            'avg_order_value': float(self.avg_order_value) if self.avg_order_value else 0.00,
            'total_revenue': float(self.total_revenue) if self.total_revenue else 0.00,
            'is_active': self.is_active,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }


class CustomerSegmentMembership(db.Model):
    __tablename__ = 'customer_segment_memberships'
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    customer_id = Column(
        UUID(as_uuid=True),
        ForeignKey('customers.id', ondelete='CASCADE')
    )
    segment_id = Column(
        UUID(as_uuid=True),
        ForeignKey('customer_segments.id', ondelete='CASCADE')
    )
    added_at = Column(DateTime, default=func.now())
    
    # Relacionamentos
    segment = relationship("CustomerSegment", back_populates="memberships")
    
    def __repr__(self):
        return f"<CustomerSegmentMembership(id={self.id}, customer_id={self.customer_id}, segment_id={self.segment_id})>"
    
    def to_dict(self):
        return {
            'id': str(self.id),
            'customer_id': str(self.customer_id),
            'segment_id': str(self.segment_id),
            'added_at': self.added_at.isoformat()
        }