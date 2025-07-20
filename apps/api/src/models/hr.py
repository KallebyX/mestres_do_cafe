"""
Modelos de RH e funcionários
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
    Time,
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from database import db


class Employee(db.Model):
    __tablename__ = 'employees'
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(255), nullable=False)
    email = Column(String(255), unique=True, nullable=False)
    phone = Column(String(20))
    cpf = Column(String(14), unique=True, nullable=False)
    rg = Column(String(20))
    birth_date = Column(Date)
    gender = Column(String(10))
    marital_status = Column(String(20))
    
    # Endereço
    address_street = Column(String(255))
    address_number = Column(String(10))
    address_complement = Column(String(100))
    address_neighborhood = Column(String(100))
    address_city = Column(String(100))
    address_state = Column(String(2))
    address_cep = Column(String(9))
    
    # Trabalho
    position = Column(String(255), nullable=False)
    department = Column(String(255))
    hire_date = Column(Date, nullable=False)
    termination_date = Column(Date)
    salary = Column(DECIMAL(10, 2))
    employment_type = Column(String(20), default='CLT')
    status = Column(String(20), default='active')
    
    # Dados bancários
    bank_name = Column(String(255))
    bank_agency = Column(String(10))
    bank_account = Column(String(20))
    bank_account_type = Column(String(20))
    
    # Contato de emergência
    emergency_contact_name = Column(String(255))
    emergency_contact_phone = Column(String(20))
    emergency_contact_relationship = Column(String(50))
    
    # Controle
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())
    
    # Relacionamentos
    payroll_records = relationship("Payroll", back_populates="employee")
    time_cards = relationship("TimeCard", back_populates="employee")
    benefits = relationship("EmployeeBenefit", back_populates="employee")
    
    def __repr__(self):
        return f"<Employee(id={self.id}, name={self.name}, position={self.position})>"
    
    def to_dict(self):
        return {
            'id': str(self.id),
            'name': self.name,
            'email': self.email,
            'phone': self.phone,
            'cpf': self.cpf,
            'rg': self.rg,
            'birth_date': self.birth_date.isoformat() if self.birth_date else None,
            'gender': self.gender,
            'marital_status': self.marital_status,
            'address_street': self.address_street,
            'address_number': self.address_number,
            'address_complement': self.address_complement,
            'address_neighborhood': self.address_neighborhood,
            'address_city': self.address_city,
            'address_state': self.address_state,
            'address_cep': self.address_cep,
            'position': self.position,
            'department': self.department,
            'hire_date': self.hire_date.isoformat() if self.hire_date else None,
            'termination_date': self.termination_date.isoformat() if self.termination_date else None,
            'salary': float(self.salary) if self.salary else None,
            'employment_type': self.employment_type,
            'status': self.status,
            'bank_name': self.bank_name,
            'bank_agency': self.bank_agency,
            'bank_account': self.bank_account,
            'bank_account_type': self.bank_account_type,
            'emergency_contact_name': self.emergency_contact_name,
            'emergency_contact_phone': self.emergency_contact_phone,
            'emergency_contact_relationship': self.emergency_contact_relationship,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }


class Department(db.Model):
    __tablename__ = 'departments'
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(255), nullable=False)
    description = Column(Text)
    manager_id = Column(UUID(as_uuid=True), ForeignKey('employees.id', ondelete='SET NULL'))
    budget = Column(DECIMAL(12, 2))
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())
    
    def __repr__(self):
        return f"<Department(id={self.id}, name={self.name})>"
    
    def to_dict(self):
        return {
            'id': str(self.id),
            'name': self.name,
            'description': self.description,
            'manager_id': str(self.manager_id) if self.manager_id else None,
            'budget': float(self.budget) if self.budget else None,
            'is_active': self.is_active,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }


class Position(db.Model):
    __tablename__ = 'positions'
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    title = Column(String(255), nullable=False)
    description = Column(Text)
    department_id = Column(UUID(as_uuid=True), ForeignKey('departments.id', ondelete='SET NULL'))
    base_salary = Column(DECIMAL(10, 2))
    requirements = Column(Text)
    responsibilities = Column(Text)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())
    
    def __repr__(self):
        return f"<Position(id={self.id}, title={self.title})>"
    
    def to_dict(self):
        return {
            'id': str(self.id),
            'title': self.title,
            'description': self.description,
            'department_id': str(self.department_id) if self.department_id else None,
            'base_salary': float(self.base_salary) if self.base_salary else None,
            'requirements': self.requirements,
            'responsibilities': self.responsibilities,
            'is_active': self.is_active,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }


class Payroll(db.Model):
    __tablename__ = 'payroll'
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    employee_id = Column(UUID(as_uuid=True), ForeignKey('employees.id', ondelete='CASCADE'))
    month = Column(Integer, nullable=False)
    year = Column(Integer, nullable=False)
    base_salary = Column(DECIMAL(10, 2), nullable=False)
    overtime_hours = Column(DECIMAL(5, 2), default=0.00)
    overtime_value = Column(DECIMAL(10, 2), default=0.00)
    bonus = Column(DECIMAL(10, 2), default=0.00)
    deductions = Column(DECIMAL(10, 2), default=0.00)
    net_salary = Column(DECIMAL(10, 2), nullable=False)
    status = Column(String(20), default='pending')
    payment_date = Column(Date)
    created_at = Column(DateTime, default=func.now())
    
    # Relacionamentos
    employee = relationship("Employee", back_populates="payroll_records")
    
    def __repr__(self):
        return f"<Payroll(id={self.id}, employee_id={self.employee_id}, month={self.month}, year={self.year})>"
    
    def to_dict(self):
        return {
            'id': str(self.id),
            'employee_id': str(self.employee_id),
            'month': self.month,
            'year': self.year,
            'base_salary': float(self.base_salary) if self.base_salary else 0.00,
            'overtime_hours': float(self.overtime_hours) if self.overtime_hours else 0.00,
            'overtime_value': float(self.overtime_value) if self.overtime_value else 0.00,
            'bonus': float(self.bonus) if self.bonus else 0.00,
            'deductions': float(self.deductions) if self.deductions else 0.00,
            'net_salary': float(self.net_salary) if self.net_salary else 0.00,
            'status': self.status,
            'payment_date': self.payment_date.isoformat() if self.payment_date else None,
            'created_at': self.created_at.isoformat()
        }


class TimeCard(db.Model):
    __tablename__ = 'time_cards'
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    employee_id = Column(UUID(as_uuid=True), ForeignKey('employees.id', ondelete='CASCADE'))
    date = Column(Date, nullable=False)
    entry_time = Column(Time)
    exit_time = Column(Time)
    lunch_start = Column(Time)
    lunch_end = Column(Time)
    total_hours = Column(DECIMAL(5, 2))
    overtime_hours = Column(DECIMAL(5, 2), default=0.00)
    status = Column(String(20), default='normal')
    notes = Column(Text)
    created_at = Column(DateTime, default=func.now())
    
    # Relacionamentos
    employee = relationship("Employee", back_populates="time_cards")
    
    def __repr__(self):
        return f"<TimeCard(id={self.id}, employee_id={self.employee_id}, date={self.date})>"
    
    def to_dict(self):
        return {
            'id': str(self.id),
            'employee_id': str(self.employee_id),
            'date': self.date.isoformat(),
            'entry_time': self.entry_time.isoformat() if self.entry_time else None,
            'exit_time': self.exit_time.isoformat() if self.exit_time else None,
            'lunch_start': self.lunch_start.isoformat() if self.lunch_start else None,
            'lunch_end': self.lunch_end.isoformat() if self.lunch_end else None,
            'total_hours': float(self.total_hours) if self.total_hours else None,
            'overtime_hours': float(self.overtime_hours) if self.overtime_hours else 0.00,
            'status': self.status,
            'notes': self.notes,
            'created_at': self.created_at.isoformat()
        }


class Benefit(db.Model):
    __tablename__ = 'benefits'
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(255), nullable=False)
    description = Column(Text)
    type = Column(String(50), nullable=False)
    value = Column(DECIMAL(10, 2))
    percentage = Column(DECIMAL(5, 2))
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=func.now())
    
    # Relacionamentos
    employee_benefits = relationship("EmployeeBenefit", back_populates="benefit")
    
    def __repr__(self):
        return f"<Benefit(id={self.id}, name={self.name}, type={self.type})>"
    
    def to_dict(self):
        return {
            'id': str(self.id),
            'name': self.name,
            'description': self.description,
            'type': self.type,
            'value': float(self.value) if self.value else None,
            'percentage': float(self.percentage) if self.percentage else None,
            'is_active': self.is_active,
            'created_at': self.created_at.isoformat()
        }


class EmployeeBenefit(db.Model):
    __tablename__ = 'employee_benefits'
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    employee_id = Column(UUID(as_uuid=True), ForeignKey('employees.id', ondelete='CASCADE'))
    benefit_id = Column(UUID(as_uuid=True), ForeignKey('benefits.id', ondelete='CASCADE'))
    start_date = Column(Date, nullable=False)
    end_date = Column(Date)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=func.now())
    
    # Relacionamentos
    employee = relationship("Employee", back_populates="benefits")
    benefit = relationship("Benefit", back_populates="employee_benefits")
    
    def __repr__(self):
        return f"<EmployeeBenefit(id={self.id}, employee_id={self.employee_id}, benefit_id={self.benefit_id})>"
    
    def to_dict(self):
        return {
            'id': str(self.id),
            'employee_id': str(self.employee_id),
            'benefit_id': str(self.benefit_id),
            'start_date': self.start_date.isoformat(),
            'end_date': self.end_date.isoformat() if self.end_date else None,
            'is_active': self.is_active,
            'created_at': self.created_at.isoformat()
        }
