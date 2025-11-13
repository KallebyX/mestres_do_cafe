"""
Modelos para o sistema de RH (Recursos Humanos)
"""

from datetime import datetime, date
from decimal import Decimal
from sqlalchemy import (
    Column, String, Text, Integer, Numeric, Boolean, DateTime, Date, Time, ForeignKey,
    CheckConstraint, Index
)
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship
import uuid
from database import db


class Department(db.Model):
    """Departamentos da empresa"""
    __tablename__ = 'departments'

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

    # Informações do departamento
    name = Column(String(200), nullable=False, unique=True)
    code = Column(String(20), unique=True)
    description = Column(Text)

    # Hierarquia
    parent_id = Column(UUID(as_uuid=True), ForeignKey('departments.id'))
    manager_id = Column(UUID(as_uuid=True), ForeignKey('employees.id'))

    # Localização
    location = Column(String(200))
    cost_center = Column(String(50))

    # Status
    is_active = Column(Boolean, default=True)

    # Timestamps
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)
    updated_at = Column(DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relacionamentos
    parent = relationship('Department', remote_side=[id], backref='subdepartments')
    manager = relationship('Employee', foreign_keys=[manager_id], backref='managed_department')
    employees = relationship('Employee', foreign_keys='Employee.department_id', back_populates='department')
    positions = relationship('Position', back_populates='department')

    def __repr__(self):
        return f'<Department {self.name}>'

    def to_dict(self):
        return {
            'id': str(self.id),
            'name': self.name,
            'code': self.code,
            'description': self.description,
            'parent_id': str(self.parent_id) if self.parent_id else None,
            'manager_id': str(self.manager_id) if self.manager_id else None,
            'location': self.location,
            'cost_center': self.cost_center,
            'is_active': self.is_active,
            'created_at': self.created_at.isoformat()
        }


class Position(db.Model):
    """Cargos/Posições na empresa"""
    __tablename__ = 'positions'

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

    # Informações do cargo
    title = Column(String(200), nullable=False)
    code = Column(String(20), unique=True)
    description = Column(Text)

    # Departamento
    department_id = Column(UUID(as_uuid=True), ForeignKey('departments.id'))

    # Classificação
    level = Column(String(50))  # junior, mid, senior, lead, manager, director
    category = Column(String(50))  # operational, administrative, management, executive

    # Faixa salarial
    min_salary = Column(Numeric(10, 2))
    max_salary = Column(Numeric(10, 2))

    # Requisitos
    requirements = Column(JSONB)  # Educação, experiência, habilidades
    responsibilities = Column(JSONB)  # Responsabilidades do cargo

    # Status
    is_active = Column(Boolean, default=True)
    openings = Column(Integer, default=0)  # Vagas em aberto

    # Timestamps
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)
    updated_at = Column(DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relacionamentos
    department = relationship('Department', back_populates='positions')
    employees = relationship('Employee', back_populates='position')

    def __repr__(self):
        return f'<Position {self.title}>'

    def to_dict(self):
        return {
            'id': str(self.id),
            'title': self.title,
            'code': self.code,
            'description': self.description,
            'department_id': str(self.department_id) if self.department_id else None,
            'level': self.level,
            'category': self.category,
            'min_salary': float(self.min_salary) if self.min_salary else None,
            'max_salary': float(self.max_salary) if self.max_salary else None,
            'requirements': self.requirements,
            'responsibilities': self.responsibilities,
            'is_active': self.is_active,
            'openings': self.openings,
            'created_at': self.created_at.isoformat()
        }


class Employee(db.Model):
    """Funcionários da empresa"""
    __tablename__ = 'employees'

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

    # Vínculo com usuário
    user_id = Column(UUID(as_uuid=True), ForeignKey('users.id'), unique=True)

    # Informações pessoais
    employee_number = Column(String(20), unique=True, nullable=False)
    full_name = Column(String(200), nullable=False)
    cpf = Column(String(14), unique=True, nullable=False)
    rg = Column(String(20))
    birth_date = Column(Date)
    gender = Column(String(20))
    marital_status = Column(String(20))

    # Contato
    email = Column(String(255), nullable=False)
    phone = Column(String(20))
    mobile = Column(String(20))

    # Endereço
    address = Column(String(500))
    city = Column(String(100))
    state = Column(String(2))
    postal_code = Column(String(10))

    # Dados profissionais
    department_id = Column(UUID(as_uuid=True), ForeignKey('departments.id'))
    position_id = Column(UUID(as_uuid=True), ForeignKey('positions.id'))
    manager_id = Column(UUID(as_uuid=True), ForeignKey('employees.id'))

    # Datas importantes
    hire_date = Column(Date, nullable=False)
    termination_date = Column(Date)
    termination_reason = Column(Text)

    # Tipo de contrato
    employment_type = Column(String(50), nullable=False)  # full_time, part_time, contract, intern
    contract_type = Column(String(50))  # clt, pj, temporary
    work_schedule = Column(String(100))  # 9h-18h, escala, etc.

    # Salário
    salary = Column(Numeric(10, 2), nullable=False)
    salary_type = Column(String(20), default='monthly')  # monthly, hourly, daily

    # Banco
    bank_name = Column(String(100))
    bank_account = Column(String(50))
    bank_agency = Column(String(20))
    pix_key = Column(String(200))

    # Status
    status = Column(String(20), default='active', nullable=False)  # active, on_leave, terminated

    # Férias
    vacation_days = Column(Integer, default=30)
    vacation_days_used = Column(Integer, default=0)

    # Foto
    photo = Column(String(500))

    # Observações
    notes = Column(Text)

    # Timestamps
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)
    updated_at = Column(DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relacionamentos
    user = relationship('User', backref='employee_profile')
    department = relationship('Department', foreign_keys=[department_id], back_populates='employees')
    position = relationship('Position', back_populates='employees')
    manager = relationship('Employee', remote_side=[id], backref='subordinates')
    time_cards = relationship('TimeCard', back_populates='employee')
    payrolls = relationship('Payroll', back_populates='employee')
    benefits = relationship('EmployeeBenefit', back_populates='employee')

    # Constraints
    __table_args__ = (
        CheckConstraint(
            "status IN ('active', 'on_leave', 'terminated')",
            name='check_employee_status'
        ),
        CheckConstraint(
            "employment_type IN ('full_time', 'part_time', 'contract', 'intern')",
            name='check_employment_type'
        ),
        Index('idx_employee_number', 'employee_number'),
        Index('idx_employee_cpf', 'cpf'),
        Index('idx_employee_status', 'status'),
    )

    def __repr__(self):
        return f'<Employee {self.full_name}>'

    def to_dict(self):
        return {
            'id': str(self.id),
            'user_id': str(self.user_id) if self.user_id else None,
            'employee_number': self.employee_number,
            'full_name': self.full_name,
            'cpf': self.cpf,
            'rg': self.rg,
            'birth_date': self.birth_date.isoformat() if self.birth_date else None,
            'gender': self.gender,
            'marital_status': self.marital_status,
            'email': self.email,
            'phone': self.phone,
            'mobile': self.mobile,
            'address': self.address,
            'city': self.city,
            'state': self.state,
            'postal_code': self.postal_code,
            'department_id': str(self.department_id) if self.department_id else None,
            'position_id': str(self.position_id) if self.position_id else None,
            'manager_id': str(self.manager_id) if self.manager_id else None,
            'hire_date': self.hire_date.isoformat() if self.hire_date else None,
            'termination_date': self.termination_date.isoformat() if self.termination_date else None,
            'employment_type': self.employment_type,
            'contract_type': self.contract_type,
            'work_schedule': self.work_schedule,
            'salary': float(self.salary) if self.salary else 0,
            'salary_type': self.salary_type,
            'status': self.status,
            'vacation_days': self.vacation_days,
            'vacation_days_used': self.vacation_days_used,
            'photo': self.photo,
            'created_at': self.created_at.isoformat()
        }


class TimeCard(db.Model):
    """Registro de ponto / Controle de jornada"""
    __tablename__ = 'time_cards'

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

    # Funcionário
    employee_id = Column(UUID(as_uuid=True), ForeignKey('employees.id'), nullable=False)

    # Data e horários
    date = Column(Date, nullable=False)
    check_in = Column(Time)
    check_out = Column(Time)
    break_start = Column(Time)
    break_end = Column(Time)

    # Horas calculadas
    hours_worked = Column(Numeric(5, 2))  # Horas trabalhadas
    overtime_hours = Column(Numeric(5, 2), default=0)  # Horas extras
    break_duration = Column(Integer, default=0)  # Minutos de intervalo

    # Tipo
    type = Column(String(50), default='regular')  # regular, remote, business_trip, training

    # Localização (para ponto remoto)
    location = Column(String(500))  # GPS ou descrição
    ip_address = Column(String(50))

    # Status
    status = Column(String(20), default='pending')  # pending, approved, rejected
    approved_by = Column(UUID(as_uuid=True), ForeignKey('users.id'))
    approved_at = Column(DateTime(timezone=True))

    # Observações
    notes = Column(Text)

    # Timestamps
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)
    updated_at = Column(DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relacionamentos
    employee = relationship('Employee', back_populates='time_cards')
    approver = relationship('User', foreign_keys=[approved_by])

    # Constraints
    __table_args__ = (
        CheckConstraint(
            "status IN ('pending', 'approved', 'rejected')",
            name='check_timecard_status'
        ),
        Index('idx_timecard_employee_date', 'employee_id', 'date'),
    )

    def __repr__(self):
        return f'<TimeCard employee={self.employee_id} date={self.date}>'

    def to_dict(self):
        return {
            'id': str(self.id),
            'employee_id': str(self.employee_id),
            'date': self.date.isoformat() if self.date else None,
            'check_in': self.check_in.isoformat() if self.check_in else None,
            'check_out': self.check_out.isoformat() if self.check_out else None,
            'break_start': self.break_start.isoformat() if self.break_start else None,
            'break_end': self.break_end.isoformat() if self.break_end else None,
            'hours_worked': float(self.hours_worked) if self.hours_worked else 0,
            'overtime_hours': float(self.overtime_hours) if self.overtime_hours else 0,
            'break_duration': self.break_duration,
            'type': self.type,
            'location': self.location,
            'status': self.status,
            'approved_by': str(self.approved_by) if self.approved_by else None,
            'approved_at': self.approved_at.isoformat() if self.approved_at else None,
            'notes': self.notes,
            'created_at': self.created_at.isoformat()
        }


class Payroll(db.Model):
    """Folha de pagamento"""
    __tablename__ = 'payrolls'

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

    # Funcionário
    employee_id = Column(UUID(as_uuid=True), ForeignKey('employees.id'), nullable=False)

    # Período
    month = Column(Integer, nullable=False)  # 1-12
    year = Column(Integer, nullable=False)
    period_start = Column(Date, nullable=False)
    period_end = Column(Date, nullable=False)

    # Valores base
    base_salary = Column(Numeric(10, 2), nullable=False)
    hours_worked = Column(Numeric(7, 2), default=0)
    overtime_hours = Column(Numeric(7, 2), default=0)

    # Proventos (ganhos)
    overtime_pay = Column(Numeric(10, 2), default=0)
    commissions = Column(Numeric(10, 2), default=0)
    bonuses = Column(Numeric(10, 2), default=0)
    benefits_value = Column(Numeric(10, 2), default=0)  # Vale transporte, alimentação
    other_earnings = Column(Numeric(10, 2), default=0)

    gross_salary = Column(Numeric(10, 2), nullable=False)  # Salário bruto

    # Descontos
    inss = Column(Numeric(10, 2), default=0)  # INSS
    irrf = Column(Numeric(10, 2), default=0)  # Imposto de Renda
    health_insurance = Column(Numeric(10, 2), default=0)
    meal_deduction = Column(Numeric(10, 2), default=0)
    transport_deduction = Column(Numeric(10, 2), default=0)
    absences = Column(Numeric(10, 2), default=0)  # Descontos por faltas
    other_deductions = Column(Numeric(10, 2), default=0)

    total_deductions = Column(Numeric(10, 2), default=0)

    # Valor líquido
    net_salary = Column(Numeric(10, 2), nullable=False)  # Salário líquido

    # FGTS
    fgts = Column(Numeric(10, 2), default=0)

    # Status
    status = Column(String(20), default='draft')  # draft, calculated, approved, paid

    # Pagamento
    payment_date = Column(Date)
    payment_method = Column(String(50))  # bank_transfer, cash, check
    payment_reference = Column(String(100))  # Referência bancária

    # Arquivos
    payslip_file = Column(String(500))  # Holerite em PDF

    # Observações
    notes = Column(Text)

    # Timestamps
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)
    updated_at = Column(DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow)
    created_by = Column(UUID(as_uuid=True), ForeignKey('users.id'))

    # Relacionamentos
    employee = relationship('Employee', back_populates='payrolls')
    creator = relationship('User')

    # Constraints
    __table_args__ = (
        CheckConstraint(
            "status IN ('draft', 'calculated', 'approved', 'paid')",
            name='check_payroll_status'
        ),
        CheckConstraint("month >= 1 AND month <= 12", name='check_payroll_month'),
        Index('idx_payroll_employee_period', 'employee_id', 'year', 'month'),
    )

    def __repr__(self):
        return f'<Payroll employee={self.employee_id} period={self.month}/{self.year}>'

    def to_dict(self):
        return {
            'id': str(self.id),
            'employee_id': str(self.employee_id),
            'month': self.month,
            'year': self.year,
            'period_start': self.period_start.isoformat() if self.period_start else None,
            'period_end': self.period_end.isoformat() if self.period_end else None,
            'base_salary': float(self.base_salary) if self.base_salary else 0,
            'hours_worked': float(self.hours_worked) if self.hours_worked else 0,
            'overtime_hours': float(self.overtime_hours) if self.overtime_hours else 0,
            'overtime_pay': float(self.overtime_pay) if self.overtime_pay else 0,
            'commissions': float(self.commissions) if self.commissions else 0,
            'bonuses': float(self.bonuses) if self.bonuses else 0,
            'benefits_value': float(self.benefits_value) if self.benefits_value else 0,
            'other_earnings': float(self.other_earnings) if self.other_earnings else 0,
            'gross_salary': float(self.gross_salary) if self.gross_salary else 0,
            'inss': float(self.inss) if self.inss else 0,
            'irrf': float(self.irrf) if self.irrf else 0,
            'health_insurance': float(self.health_insurance) if self.health_insurance else 0,
            'meal_deduction': float(self.meal_deduction) if self.meal_deduction else 0,
            'transport_deduction': float(self.transport_deduction) if self.transport_deduction else 0,
            'absences': float(self.absences) if self.absences else 0,
            'other_deductions': float(self.other_deductions) if self.other_deductions else 0,
            'total_deductions': float(self.total_deductions) if self.total_deductions else 0,
            'net_salary': float(self.net_salary) if self.net_salary else 0,
            'fgts': float(self.fgts) if self.fgts else 0,
            'status': self.status,
            'payment_date': self.payment_date.isoformat() if self.payment_date else None,
            'payment_method': self.payment_method,
            'payment_reference': self.payment_reference,
            'payslip_file': self.payslip_file,
            'notes': self.notes,
            'created_at': self.created_at.isoformat()
        }


class Benefit(db.Model):
    """Benefícios disponíveis para funcionários"""
    __tablename__ = 'benefits'

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

    # Informações do benefício
    name = Column(String(200), nullable=False)
    description = Column(Text)
    type = Column(String(50), nullable=False)  # health, dental, meal, transport, gym, education

    # Fornecedor
    provider = Column(String(200))
    provider_contact = Column(String(200))

    # Valores
    employer_cost = Column(Numeric(10, 2), default=0)  # Custo para empresa
    employee_cost = Column(Numeric(10, 2), default=0)  # Custo para funcionário
    total_value = Column(Numeric(10, 2), default=0)  # Valor total do benefício

    # Elegibilidade
    eligible_positions = Column(JSONB)  # Lista de IDs de cargos elegíveis
    probation_period_required = Column(Boolean, default=False)  # Exige período de experiência

    # Status
    is_active = Column(Boolean, default=True)
    is_mandatory = Column(Boolean, default=False)  # Obrigatório para todos

    # Timestamps
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)
    updated_at = Column(DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relacionamentos
    employee_benefits = relationship('EmployeeBenefit', back_populates='benefit')

    def __repr__(self):
        return f'<Benefit {self.name}>'

    def to_dict(self):
        return {
            'id': str(self.id),
            'name': self.name,
            'description': self.description,
            'type': self.type,
            'provider': self.provider,
            'provider_contact': self.provider_contact,
            'employer_cost': float(self.employer_cost) if self.employer_cost else 0,
            'employee_cost': float(self.employee_cost) if self.employee_cost else 0,
            'total_value': float(self.total_value) if self.total_value else 0,
            'eligible_positions': self.eligible_positions,
            'probation_period_required': self.probation_period_required,
            'is_active': self.is_active,
            'is_mandatory': self.is_mandatory,
            'created_at': self.created_at.isoformat()
        }


class EmployeeBenefit(db.Model):
    """Benefícios dos funcionários (relacionamento muitos-para-muitos)"""
    __tablename__ = 'employee_benefits'

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

    # Relacionamentos
    employee_id = Column(UUID(as_uuid=True), ForeignKey('employees.id'), nullable=False)
    benefit_id = Column(UUID(as_uuid=True), ForeignKey('benefits.id'), nullable=False)

    # Status
    status = Column(String(20), default='active')  # active, cancelled, suspended

    # Datas
    start_date = Column(Date, nullable=False)
    end_date = Column(Date)
    cancelled_at = Column(DateTime(timezone=True))
    cancellation_reason = Column(Text)

    # Valores específicos (podem sobrescrever os padrões)
    employee_cost_override = Column(Numeric(10, 2))

    # Dependentes cobertos (para plano de saúde, por exemplo)
    dependents_count = Column(Integer, default=0)
    dependents_data = Column(JSONB)

    # Timestamps
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)
    updated_at = Column(DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relacionamentos
    employee = relationship('Employee', back_populates='benefits')
    benefit = relationship('Benefit', back_populates='employee_benefits')

    # Constraints
    __table_args__ = (
        CheckConstraint(
            "status IN ('active', 'cancelled', 'suspended')",
            name='check_employee_benefit_status'
        ),
        Index('idx_employee_benefit_employee', 'employee_id', 'status'),
    )

    def __repr__(self):
        return f'<EmployeeBenefit employee={self.employee_id} benefit={self.benefit_id}>'

    def to_dict(self):
        return {
            'id': str(self.id),
            'employee_id': str(self.employee_id),
            'benefit_id': str(self.benefit_id),
            'benefit_name': self.benefit.name if self.benefit else None,
            'status': self.status,
            'start_date': self.start_date.isoformat() if self.start_date else None,
            'end_date': self.end_date.isoformat() if self.end_date else None,
            'employee_cost_override': float(self.employee_cost_override) if self.employee_cost_override else None,
            'dependents_count': self.dependents_count,
            'dependents_data': self.dependents_data,
            'created_at': self.created_at.isoformat()
        }
