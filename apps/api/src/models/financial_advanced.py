"""
Modelos para Sistema Financeiro Avançado
Contas a Pagar/Receber, DRE, Fluxo de Caixa, Conciliação Bancária
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


class AccountsPayable(db.Model):
    """Contas a Pagar"""
    __tablename__ = 'accounts_payable'

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

    # Descrição
    description = Column(String(500), nullable=False)
    document_number = Column(String(100))  # Nota fiscal, boleto
    category = Column(String(100))  # Aluguel, fornecedores, salários, etc

    # Fornecedor/Beneficiário
    supplier_id = Column(UUID(as_uuid=True), ForeignKey('suppliers.id'))
    beneficiary_name = Column(String(200))

    # Valores
    original_amount = Column(Numeric(12, 2), nullable=False)
    paid_amount = Column(Numeric(12, 2), default=0)
    remaining_amount = Column(Numeric(12, 2))
    discount = Column(Numeric(10, 2), default=0)
    interest = Column(Numeric(10, 2), default=0)
    fine = Column(Numeric(10, 2), default=0)

    # Datas
    issue_date = Column(Date, nullable=False)
    due_date = Column(Date, nullable=False)
    payment_date = Column(Date)

    # Status
    status = Column(String(20), default='pending')  # pending, paid, overdue, cancelled

    # Conta financeira
    financial_account_id = Column(UUID(as_uuid=True), ForeignKey('financial_accounts.id'))

    # Parcelamento
    installment_number = Column(Integer)  # 1/3, 2/3, 3/3
    total_installments = Column(Integer)
    parent_bill_id = Column(UUID(as_uuid=True), ForeignKey('accounts_payable.id'))

    # Centro de custo
    cost_center = Column(String(100))

    # Anexos
    attachment_url = Column(String(500))

    # Observações
    notes = Column(Text)

    # Timestamps
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)
    updated_at = Column(DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relacionamentos
    supplier = relationship('Supplier')
    financial_account = relationship('FinancialAccount')
    parent_bill = relationship('AccountsPayable', remote_side=[id], backref='installments')

    __table_args__ = (
        CheckConstraint(
            "status IN ('pending', 'paid', 'partial', 'overdue', 'cancelled')",
            name='check_accounts_payable_status'
        ),
        Index('idx_accounts_payable_due_date', 'due_date'),
        Index('idx_accounts_payable_status', 'status'),
    )

    def to_dict(self):
        return {
            'id': str(self.id),
            'description': self.description,
            'original_amount': float(self.original_amount),
            'remaining_amount': float(self.remaining_amount) if self.remaining_amount else float(self.original_amount),
            'due_date': self.due_date.isoformat(),
            'status': self.status
        }


class AccountsReceivable(db.Model):
    """Contas a Receber"""
    __tablename__ = 'accounts_receivable'

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

    # Descrição
    description = Column(String(500), nullable=False)
    document_number = Column(String(100))
    category = Column(String(100))  # Vendas, serviços, etc

    # Cliente/Pagador
    customer_id = Column(UUID(as_uuid=True), ForeignKey('customers.id'))
    order_id = Column(UUID(as_uuid=True), ForeignKey('orders.id'))

    # Valores
    original_amount = Column(Numeric(12, 2), nullable=False)
    received_amount = Column(Numeric(12, 2), default=0)
    remaining_amount = Column(Numeric(12, 2))
    discount = Column(Numeric(10, 2), default=0)
    interest = Column(Numeric(10, 2), default=0)
    fine = Column(Numeric(10, 2), default=0)

    # Datas
    issue_date = Column(Date, nullable=False)
    due_date = Column(Date, nullable=False)
    receipt_date = Column(Date)

    # Status
    status = Column(String(20), default='pending')  # pending, received, overdue, cancelled

    # Conta financeira
    financial_account_id = Column(UUID(as_uuid=True), ForeignKey('financial_accounts.id'))

    # Parcelamento
    installment_number = Column(Integer)
    total_installments = Column(Integer)
    parent_bill_id = Column(UUID(as_uuid=True), ForeignKey('accounts_receivable.id'))

    # Observações
    notes = Column(Text)

    # Timestamps
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)
    updated_at = Column(DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relacionamentos
    customer = relationship('Customer')
    order = relationship('Order')
    financial_account = relationship('FinancialAccount')
    parent_bill = relationship('AccountsReceivable', remote_side=[id], backref='installments')

    __table_args__ = (
        CheckConstraint(
            "status IN ('pending', 'received', 'partial', 'overdue', 'cancelled')",
            name='check_accounts_receivable_status'
        ),
        Index('idx_accounts_receivable_due_date', 'due_date'),
        Index('idx_accounts_receivable_status', 'status'),
    )

    def to_dict(self):
        return {
            'id': str(self.id),
            'description': self.description,
            'original_amount': float(self.original_amount),
            'remaining_amount': float(self.remaining_amount) if self.remaining_amount else float(self.original_amount),
            'due_date': self.due_date.isoformat(),
            'status': self.status
        }


class CashFlow(db.Model):
    """Fluxo de Caixa (Projeção)"""
    __tablename__ = 'cash_flow'

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

    # Data de referência
    date = Column(Date, nullable=False)

    # Saldos
    opening_balance = Column(Numeric(12, 2), default=0)
    closing_balance = Column(Numeric(12, 2), default=0)

    # Entradas
    total_inflow = Column(Numeric(12, 2), default=0)
    sales_inflow = Column(Numeric(12, 2), default=0)
    other_inflow = Column(Numeric(12, 2), default=0)

    # Saídas
    total_outflow = Column(Numeric(12, 2), default=0)
    purchases_outflow = Column(Numeric(12, 2), default=0)
    payroll_outflow = Column(Numeric(12, 2), default=0)
    other_outflow = Column(Numeric(12, 2), default=0)

    # Tipo
    type = Column(String(20), default='actual')  # actual, projected

    # Conta financeira
    financial_account_id = Column(UUID(as_uuid=True), ForeignKey('financial_accounts.id'))

    # Timestamps
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)

    # Relacionamentos
    financial_account = relationship('FinancialAccount')

    __table_args__ = (
        Index('idx_cash_flow_date', 'date'),
    )

    def to_dict(self):
        return {
            'date': self.date.isoformat(),
            'opening_balance': float(self.opening_balance),
            'total_inflow': float(self.total_inflow),
            'total_outflow': float(self.total_outflow),
            'closing_balance': float(self.closing_balance)
        }


class IncomeStatement(db.Model):
    """DRE - Demonstração do Resultado do Exercício"""
    __tablename__ = 'income_statements'

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

    # Período
    start_date = Column(Date, nullable=False)
    end_date = Column(Date, nullable=False)
    period_type = Column(String(20))  # monthly, quarterly, yearly

    # Receitas
    gross_revenue = Column(Numeric(12, 2), default=0)  # Receita bruta
    deductions = Column(Numeric(12, 2), default=0)  # Deduções (impostos sobre vendas)
    net_revenue = Column(Numeric(12, 2), default=0)  # Receita líquida

    # Custos
    cost_of_goods_sold = Column(Numeric(12, 2), default=0)  # CMV
    gross_profit = Column(Numeric(12, 2), default=0)  # Lucro bruto

    # Despesas operacionais
    operating_expenses = Column(Numeric(12, 2), default=0)
    selling_expenses = Column(Numeric(12, 2), default=0)
    administrative_expenses = Column(Numeric(12, 2), default=0)
    operating_profit = Column(Numeric(12, 2), default=0)  # Lucro operacional

    # Outras receitas/despesas
    financial_revenue = Column(Numeric(12, 2), default=0)
    financial_expenses = Column(Numeric(12, 2), default=0)

    # Resultado
    profit_before_tax = Column(Numeric(12, 2), default=0)  # LAIR
    income_tax = Column(Numeric(12, 2), default=0)
    net_profit = Column(Numeric(12, 2), default=0)  # Lucro líquido

    # Margens (%)
    gross_margin = Column(Numeric(5, 2))
    operating_margin = Column(Numeric(5, 2))
    net_margin = Column(Numeric(5, 2))

    # Status
    status = Column(String(20), default='draft')  # draft, finalized

    # Timestamps
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)
    finalized_at = Column(DateTime(timezone=True))

    __table_args__ = (
        Index('idx_income_statement_period', 'start_date', 'end_date'),
    )

    def to_dict(self):
        return {
            'id': str(self.id),
            'period': f'{self.start_date.isoformat()} - {self.end_date.isoformat()}',
            'gross_revenue': float(self.gross_revenue),
            'net_revenue': float(self.net_revenue),
            'cost_of_goods_sold': float(self.cost_of_goods_sold),
            'gross_profit': float(self.gross_profit),
            'operating_profit': float(self.operating_profit),
            'net_profit': float(self.net_profit),
            'net_margin': float(self.net_margin) if self.net_margin else 0
        }


class BankReconciliation(db.Model):
    """Conciliação Bancária"""
    __tablename__ = 'bank_reconciliations'

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

    # Conta financeira
    financial_account_id = Column(UUID(as_uuid=True), ForeignKey('financial_accounts.id'), nullable=False)

    # Período
    statement_date = Column(Date, nullable=False)

    # Saldos
    system_balance = Column(Numeric(12, 2), nullable=False)  # Saldo no sistema
    bank_balance = Column(Numeric(12, 2), nullable=False)  # Saldo no extrato
    difference = Column(Numeric(12, 2))  # Diferença

    # Ajustes
    pending_deposits = Column(Numeric(12, 2), default=0)  # Depósitos em trânsito
    pending_withdrawals = Column(Numeric(12, 2), default=0)  # Cheques não compensados
    bank_fees = Column(Numeric(10, 2), default=0)  # Tarifas bancárias

    # Saldo conciliado
    reconciled_balance = Column(Numeric(12, 2))

    # Status
    status = Column(String(20), default='pending')  # pending, reconciled, discrepancy

    # Arquivo do extrato
    statement_file_url = Column(String(500))

    # Observações
    notes = Column(Text)

    # Timestamps
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)
    reconciled_at = Column(DateTime(timezone=True))
    reconciled_by = Column(UUID(as_uuid=True), ForeignKey('users.id'))

    # Relacionamentos
    financial_account = relationship('FinancialAccount')
    reconciler = relationship('User')

    __table_args__ = (
        Index('idx_bank_reconciliation_account_date', 'financial_account_id', 'statement_date'),
    )

    def to_dict(self):
        return {
            'id': str(self.id),
            'statement_date': self.statement_date.isoformat(),
            'system_balance': float(self.system_balance),
            'bank_balance': float(self.bank_balance),
            'difference': float(self.difference) if self.difference else 0,
            'status': self.status
        }


class Budget(db.Model):
    """Orçamento/Planejamento Financeiro"""
    __tablename__ = 'budgets'

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

    # Período
    year = Column(Integer, nullable=False)
    month = Column(Integer)  # NULL = anual
    period_type = Column(String(20), default='monthly')  # monthly, quarterly, yearly

    # Categoria
    category = Column(String(100), nullable=False)
    cost_center = Column(String(100))

    # Valores
    planned_amount = Column(Numeric(12, 2), nullable=False)
    actual_amount = Column(Numeric(12, 2), default=0)
    variance = Column(Numeric(12, 2))  # Diferença (real - planejado)
    variance_percent = Column(Numeric(5, 2))  # % de variação

    # Status
    status = Column(String(20), default='active')  # active, closed

    # Timestamps
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)
    updated_at = Column(DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow)

    __table_args__ = (
        Index('idx_budget_period', 'year', 'month'),
    )

    def to_dict(self):
        return {
            'id': str(self.id),
            'year': self.year,
            'month': self.month,
            'category': self.category,
            'planned_amount': float(self.planned_amount),
            'actual_amount': float(self.actual_amount),
            'variance': float(self.variance) if self.variance else 0
        }
