"""
Modelos de Impostos e Compliance Fiscal
"""

import uuid
from enum import Enum
from decimal import Decimal

from sqlalchemy import (
    DECIMAL,
    Boolean,
    Column,
    DateTime,
    ForeignKey,
    Integer,
    String,
    Text,
)
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from database import db


class TaxType(Enum):
    ICMS = "icms"
    PIS = "pis"
    COFINS = "cofins"
    IPI = "ipi"
    ISS = "iss"
    IRPJ = "irpj"
    CSLL = "csll"


class TaxOrigin(Enum):
    NACIONAL = "0"  # Nacional
    ESTRANGEIRA_IMPORTACAO_DIRETA = "1"  # Estrangeira - Importação direta
    ESTRANGEIRA_MERCADO_INTERNO = "2"  # Estrangeira - Adquirida no mercado interno


class TaxSituation(Enum):
    # ICMS Situações Tributárias
    ICMS_00 = "00"  # Tributada integralmente
    ICMS_10 = "10"  # Tributada e com cobrança do ICMS por substituição tributária
    ICMS_20 = "20"  # Com redução de base de cálculo
    ICMS_30 = "30"  # Isenta ou não tributada e com cobrança do ICMS por ST
    ICMS_40 = "40"  # Isenta
    ICMS_41 = "41"  # Não tributada
    ICMS_50 = "50"  # Suspensão
    ICMS_51 = "51"  # Diferimento
    ICMS_60 = "60"  # ICMS cobrado anteriormente por substituição tributária
    ICMS_70 = "70"  # Com redução de base de cálculo e cobrança do ICMS por ST
    ICMS_90 = "90"  # Outras


class NCMCode(db.Model):
    """
    Nomenclatura Comum do Mercosul - Classificação fiscal de produtos
    """
    __tablename__ = 'ncm_codes'
    __table_args__ = {'extend_existing': True}

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    code = Column(String(8), unique=True, nullable=False)  # 8 dígitos
    description = Column(Text, nullable=False)
    unit = Column(String(10))  # Unidade de medida estatística
    
    # Alíquotas padrão
    ipi_rate = Column(DECIMAL(5, 2), default=Decimal('0.00'))
    pis_rate = Column(DECIMAL(5, 2), default=Decimal('1.65'))
    cofins_rate = Column(DECIMAL(5, 2), default=Decimal('7.60'))
    
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())

    # Relacionamentos
    products = relationship("ProductTax", back_populates="ncm")

    def __repr__(self):
        return f"<NCMCode(code={self.code}, description={self.description[:50]})>"

    def to_dict(self):
        return {
            'id': str(self.id),
            'code': self.code,
            'description': self.description,
            'unit': self.unit,
            'ipi_rate': float(self.ipi_rate),
            'pis_rate': float(self.pis_rate),
            'cofins_rate': float(self.cofins_rate),
            'is_active': self.is_active,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }


class CFOPCode(db.Model):
    """
    Código Fiscal de Operações e Prestações
    """
    __tablename__ = 'cfop_codes'
    __table_args__ = {'extend_existing': True}

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    code = Column(String(4), unique=True, nullable=False)  # 4 dígitos
    description = Column(Text, nullable=False)
    application = Column(Text)  # Quando usar este CFOP
    state_operation = Column(Boolean, default=True)  # True = dentro estado, False = fora estado
    
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())

    # Relacionamentos
    tax_calculations = relationship("TaxCalculation", back_populates="cfop")

    def __repr__(self):
        return f"<CFOPCode(code={self.code}, description={self.description[:50]})>"

    def to_dict(self):
        return {
            'id': str(self.id),
            'code': self.code,
            'description': self.description,
            'application': self.application,
            'state_operation': self.state_operation,
            'is_active': self.is_active,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }


class ICMSRate(db.Model):
    """
    Alíquotas de ICMS por estado de origem e destino
    """
    __tablename__ = 'icms_rates'
    __table_args__ = {'extend_existing': True}

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    origin_state = Column(String(2), nullable=False)  # UF origem
    destination_state = Column(String(2), nullable=False)  # UF destino
    rate = Column(DECIMAL(5, 2), nullable=False)  # Alíquota em %
    reduced_rate = Column(DECIMAL(5, 2))  # Alíquota reduzida
    
    # Aplicabilidade
    product_type = Column(String(50))  # Tipo de produto (opcional)
    customer_type = Column(String(20))  # individual, business
    
    effective_date = Column(DateTime, default=func.now())
    expiry_date = Column(DateTime)
    is_active = Column(Boolean, default=True)
    
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())

    def __repr__(self):
        return f"<ICMSRate(origin={self.origin_state}, destination={self.destination_state}, rate={self.rate})>"

    def to_dict(self):
        return {
            'id': str(self.id),
            'origin_state': self.origin_state,
            'destination_state': self.destination_state,
            'rate': float(self.rate),
            'reduced_rate': float(self.reduced_rate) if self.reduced_rate else None,
            'product_type': self.product_type,
            'customer_type': self.customer_type,
            'effective_date': self.effective_date.isoformat(),
            'expiry_date': self.expiry_date.isoformat() if self.expiry_date else None,
            'is_active': self.is_active,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }


class ProductTax(db.Model):
    """
    Configuração fiscal específica por produto
    """
    __tablename__ = 'product_tax'
    __table_args__ = {'extend_existing': True}

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    product_id = Column(String(36), ForeignKey('products.id'), nullable=False)
    ncm_id = Column(String(36), ForeignKey('ncm_codes.id'), nullable=False)
    
    # Origem da mercadoria
    tax_origin = Column(String(1), default="0")  # 0=Nacional, 1=Estrangeira, etc
    
    # Situações tributárias
    icms_situation = Column(String(2), default="00")  # CST ICMS
    pis_situation = Column(String(2), default="01")   # CST PIS
    cofins_situation = Column(String(2), default="01") # CST COFINS
    ipi_situation = Column(String(2))  # CST IPI
    
    # Alíquotas customizadas (sobrescreve NCM se definido)
    icms_rate = Column(DECIMAL(5, 2))
    icms_reduced_base = Column(DECIMAL(5, 2))  # % redução base cálculo
    pis_rate = Column(DECIMAL(5, 2))
    cofins_rate = Column(DECIMAL(5, 2))
    ipi_rate = Column(DECIMAL(5, 2))
    
    # CEST (Código Especificador da Substituição Tributária)
    cest_code = Column(String(7))
    
    # Benefícios fiscais
    fiscal_benefit_code = Column(String(10))
    fiscal_benefit_description = Column(Text)
    
    # Controle
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())

    # Relacionamentos
    product = relationship("Product", backref="tax_config")
    ncm = relationship("NCMCode", back_populates="products")

    def __repr__(self):
        return f"<ProductTax(product_id={self.product_id}, ncm_id={self.ncm_id})>"

    def to_dict(self):
        return {
            'id': str(self.id),
            'product_id': str(self.product_id),
            'ncm_id': str(self.ncm_id),
            'tax_origin': self.tax_origin,
            'icms_situation': self.icms_situation,
            'pis_situation': self.pis_situation,
            'cofins_situation': self.cofins_situation,
            'ipi_situation': self.ipi_situation,
            'icms_rate': float(self.icms_rate) if self.icms_rate else None,
            'icms_reduced_base': float(self.icms_reduced_base) if self.icms_reduced_base else None,
            'pis_rate': float(self.pis_rate) if self.pis_rate else None,
            'cofins_rate': float(self.cofins_rate) if self.cofins_rate else None,
            'ipi_rate': float(self.ipi_rate) if self.ipi_rate else None,
            'cest_code': self.cest_code,
            'fiscal_benefit_code': self.fiscal_benefit_code,
            'fiscal_benefit_description': self.fiscal_benefit_description,
            'is_active': self.is_active,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }


class TaxCalculation(db.Model):
    """
    Cálculo de impostos para pedidos
    """
    __tablename__ = 'tax_calculations'
    __table_args__ = {'extend_existing': True}

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    order_id = Column(String(36), ForeignKey('orders.id'), nullable=False)
    order_item_id = Column(String(36), ForeignKey('order_items.id'))
    product_id = Column(String(36), ForeignKey('products.id'), nullable=False)
    cfop_id = Column(String(36), ForeignKey('cfop_codes.id'), nullable=False)
    
    # Valores base
    base_value = Column(DECIMAL(10, 2), nullable=False)  # Valor base para cálculo
    quantity = Column(Integer, default=1)
    
    # ICMS
    icms_base = Column(DECIMAL(10, 2), default=Decimal('0.00'))
    icms_rate = Column(DECIMAL(5, 2), default=Decimal('0.00'))
    icms_amount = Column(DECIMAL(10, 2), default=Decimal('0.00'))
    icms_situation = Column(String(2))
    
    # PIS
    pis_base = Column(DECIMAL(10, 2), default=Decimal('0.00'))
    pis_rate = Column(DECIMAL(5, 2), default=Decimal('0.00'))
    pis_amount = Column(DECIMAL(10, 2), default=Decimal('0.00'))
    pis_situation = Column(String(2))
    
    # COFINS
    cofins_base = Column(DECIMAL(10, 2), default=Decimal('0.00'))
    cofins_rate = Column(DECIMAL(5, 2), default=Decimal('0.00'))
    cofins_amount = Column(DECIMAL(10, 2), default=Decimal('0.00'))
    cofins_situation = Column(String(2))
    
    # IPI
    ipi_base = Column(DECIMAL(10, 2), default=Decimal('0.00'))
    ipi_rate = Column(DECIMAL(5, 2), default=Decimal('0.00'))
    ipi_amount = Column(DECIMAL(10, 2), default=Decimal('0.00'))
    ipi_situation = Column(String(2))
    
    # Total
    total_tax_amount = Column(DECIMAL(10, 2), default=Decimal('0.00'))
    
    # Localização para ICMS
    origin_state = Column(String(2))
    destination_state = Column(String(2))
    destination_city = Column(String(100))
    
    # Metadados
    calculation_data = Column(Text)  # JSON com detalhes do cálculo
    calculated_at = Column(DateTime, default=func.now())
    
    # Relacionamentos
    order = relationship("Order")
    order_item = relationship("OrderItem")
    product = relationship("Product")
    cfop = relationship("CFOPCode", back_populates="tax_calculations")

    def __repr__(self):
        return f"<TaxCalculation(order_id={self.order_id}, total_tax={self.total_tax_amount})>"

    def to_dict(self):
        return {
            'id': str(self.id),
            'order_id': str(self.order_id),
            'order_item_id': str(self.order_item_id) if self.order_item_id else None,
            'product_id': str(self.product_id),
            'cfop_id': str(self.cfop_id),
            'base_value': float(self.base_value),
            'quantity': self.quantity,
            'icms_base': float(self.icms_base),
            'icms_rate': float(self.icms_rate),
            'icms_amount': float(self.icms_amount),
            'icms_situation': self.icms_situation,
            'pis_base': float(self.pis_base),
            'pis_rate': float(self.pis_rate),
            'pis_amount': float(self.pis_amount),
            'pis_situation': self.pis_situation,
            'cofins_base': float(self.cofins_base),
            'cofins_rate': float(self.cofins_rate),
            'cofins_amount': float(self.cofins_amount),
            'cofins_situation': self.cofins_situation,
            'ipi_base': float(self.ipi_base),
            'ipi_rate': float(self.ipi_rate),
            'ipi_amount': float(self.ipi_amount),
            'ipi_situation': self.ipi_situation,
            'total_tax_amount': float(self.total_tax_amount),
            'origin_state': self.origin_state,
            'destination_state': self.destination_state,
            'destination_city': self.destination_city,
            'calculation_data': self.calculation_data,
            'calculated_at': self.calculated_at.isoformat()
        }


class TaxExemption(db.Model):
    """
    Isenções fiscais para clientes específicos
    """
    __tablename__ = 'tax_exemptions'
    __table_args__ = {'extend_existing': True}

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    customer_id = Column(String(36), ForeignKey('customers.id'), nullable=False)
    
    # Tipo de isenção
    tax_type = Column(String(20), nullable=False)  # icms, pis, cofins, ipi
    exemption_type = Column(String(50), nullable=False)  # total, partial, reduced_rate
    
    # Configuração da isenção
    reduced_rate = Column(DECIMAL(5, 2))  # Para isenção parcial
    exemption_code = Column(String(20))  # Código legal da isenção
    legal_basis = Column(Text)  # Base legal da isenção
    
    # Validade
    valid_from = Column(DateTime, default=func.now())
    valid_until = Column(DateTime)
    
    # Estados aplicáveis (JSON)
    applicable_states = Column(Text)  # JSON array de UFs
    
    # Controle
    is_active = Column(Boolean, default=True)
    approved_by = Column(String(36), ForeignKey('users.id'))
    approved_at = Column(DateTime)
    
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())

    # Relacionamentos
    customer = relationship("Customer")

    def __repr__(self):
        return f"<TaxExemption(customer_id={self.customer_id}, tax_type={self.tax_type})>"

    def to_dict(self):
        return {
            'id': str(self.id),
            'customer_id': str(self.customer_id),
            'tax_type': self.tax_type,
            'exemption_type': self.exemption_type,
            'reduced_rate': float(self.reduced_rate) if self.reduced_rate else None,
            'exemption_code': self.exemption_code,
            'legal_basis': self.legal_basis,
            'valid_from': self.valid_from.isoformat(),
            'valid_until': self.valid_until.isoformat() if self.valid_until else None,
            'applicable_states': self.applicable_states,
            'is_active': self.is_active,
            'approved_by': str(self.approved_by) if self.approved_by else None,
            'approved_at': self.approved_at.isoformat() if self.approved_at else None,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }