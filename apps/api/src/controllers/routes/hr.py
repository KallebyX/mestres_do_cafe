"""
Rotas para o sistema de RH (Recursos Humanos)
"""

from datetime import datetime, date
from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity, get_jwt
from sqlalchemy import desc
from sqlalchemy.exc import SQLAlchemyError

from database import db
from models import (
    Department, Position, Employee, TimeCard, Payroll,
    Benefit, EmployeeBenefit, User
)
from utils.validators import validate_required_fields

hr_bp = Blueprint('hr', __name__)


# ================ DEPARTAMENTOS ================

@hr_bp.route('/departments', methods=['GET'])
@jwt_required()
def get_departments():
    """Listar departamentos"""
    try:
        departments = Department.query.filter_by(is_active=True).all()
        return jsonify({
            'success': True,
            'departments': [d.to_dict() for d in departments]
        }), 200
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500


@hr_bp.route('/departments', methods=['POST'])
@jwt_required()
def create_department():
    """Criar departamento (admin)"""
    try:
        claims = get_jwt()
        if not claims.get('is_admin'):
            return jsonify({'success': False, 'error': 'Acesso negado'}), 403

        data = request.get_json()
        validation = validate_required_fields(data, ['name'])
        if not validation['valid']:
            return jsonify({'success': False, 'error': validation['message']}), 400

        dept = Department(
            name=data['name'],
            code=data.get('code'),
            description=data.get('description'),
            parent_id=data.get('parent_id'),
            location=data.get('location'),
            cost_center=data.get('cost_center')
        )

        db.session.add(dept)
        db.session.commit()

        return jsonify({'success': True, 'department': dept.to_dict()}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'error': str(e)}), 500


# ================ CARGOS ================

@hr_bp.route('/positions', methods=['GET'])
@jwt_required()
def get_positions():
    """Listar cargos"""
    try:
        positions = Position.query.filter_by(is_active=True).all()
        return jsonify({
            'success': True,
            'positions': [p.to_dict() for p in positions]
        }), 200
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500


@hr_bp.route('/positions', methods=['POST'])
@jwt_required()
def create_position():
    """Criar cargo (admin)"""
    try:
        claims = get_jwt()
        if not claims.get('is_admin'):
            return jsonify({'success': False, 'error': 'Acesso negado'}), 403

        data = request.get_json()
        validation = validate_required_fields(data, ['title'])
        if not validation['valid']:
            return jsonify({'success': False, 'error': validation['message']}), 400

        position = Position(**{k: v for k, v in data.items() if k != 'id'})

        db.session.add(position)
        db.session.commit()

        return jsonify({'success': True, 'position': position.to_dict()}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'error': str(e)}), 500


# ================ FUNCIONÁRIOS ================

@hr_bp.route('/employees', methods=['GET'])
@jwt_required()
def get_employees():
    """Listar funcionários (admin/manager)"""
    try:
        claims = get_jwt()
        if not claims.get('is_admin'):
            return jsonify({'success': False, 'error': 'Acesso negado'}), 403

        status = request.args.get('status', 'active')
        employees = Employee.query.filter_by(status=status).all()

        return jsonify({
            'success': True,
            'employees': [e.to_dict() for e in employees]
        }), 200
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500


@hr_bp.route('/employees', methods=['POST'])
@jwt_required()
def create_employee():
    """Cadastrar funcionário (admin)"""
    try:
        claims = get_jwt()
        if not claims.get('is_admin'):
            return jsonify({'success': False, 'error': 'Acesso negado'}), 403

        data = request.get_json()
        required_fields = ['employee_number', 'full_name', 'cpf', 'email', 'hire_date', 'employment_type', 'salary']
        validation = validate_required_fields(data, required_fields)
        if not validation['valid']:
            return jsonify({'success': False, 'error': validation['message']}), 400

        # Converter data
        hire_date_obj = datetime.strptime(data['hire_date'], '%Y-%m-%d').date()

        employee = Employee(
            employee_number=data['employee_number'],
            full_name=data['full_name'],
            cpf=data['cpf'],
            rg=data.get('rg'),
            birth_date=datetime.strptime(data['birth_date'], '%Y-%m-%d').date() if data.get('birth_date') else None,
            gender=data.get('gender'),
            marital_status=data.get('marital_status'),
            email=data['email'],
            phone=data.get('phone'),
            mobile=data.get('mobile'),
            address=data.get('address'),
            city=data.get('city'),
            state=data.get('state'),
            postal_code=data.get('postal_code'),
            department_id=data.get('department_id'),
            position_id=data.get('position_id'),
            manager_id=data.get('manager_id'),
            hire_date=hire_date_obj,
            employment_type=data['employment_type'],
            contract_type=data.get('contract_type'),
            work_schedule=data.get('work_schedule'),
            salary=data['salary'],
            salary_type=data.get('salary_type', 'monthly'),
            bank_name=data.get('bank_name'),
            bank_account=data.get('bank_account'),
            bank_agency=data.get('bank_agency')
        )

        db.session.add(employee)
        db.session.commit()

        return jsonify({'success': True, 'employee': employee.to_dict()}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'error': str(e)}), 500


@hr_bp.route('/employees/<employee_id>', methods=['GET'])
@jwt_required()
def get_employee(employee_id):
    """Obter detalhes de funcionário"""
    try:
        employee = Employee.query.get(employee_id)
        if not employee:
            return jsonify({'success': False, 'error': 'Funcionário não encontrado'}), 404

        return jsonify({'success': True, 'employee': employee.to_dict()}), 200
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500


# ================ PONTO ELETRÔNICO ================

@hr_bp.route('/timecard/check-in', methods=['POST'])
@jwt_required()
def check_in():
    """Registrar entrada"""
    try:
        user_id = get_jwt_identity()
        employee = Employee.query.filter_by(user_id=user_id).first()

        if not employee:
            return jsonify({'success': False, 'error': 'Funcionário não encontrado'}), 404

        today = date.today()

        # Verificar se já tem registro hoje
        existing = TimeCard.query.filter_by(employee_id=employee.id, date=today).first()
        if existing and existing.check_in:
            return jsonify({'success': False, 'error': 'Entrada já registrada hoje'}), 400

        data = request.get_json() or {}
        timecard = existing or TimeCard(employee_id=employee.id, date=today)
        timecard.check_in = datetime.now().time()
        timecard.type = data.get('type', 'regular')
        timecard.location = data.get('location')

        if not existing:
            db.session.add(timecard)

        db.session.commit()

        return jsonify({
            'success': True,
            'message': 'Entrada registrada',
            'timecard': timecard.to_dict()
        }), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'error': str(e)}), 500


@hr_bp.route('/timecard/check-out', methods=['POST'])
@jwt_required()
def check_out():
    """Registrar saída"""
    try:
        user_id = get_jwt_identity()
        employee = Employee.query.filter_by(user_id=user_id).first()

        if not employee:
            return jsonify({'success': False, 'error': 'Funcionário não encontrado'}), 404

        today = date.today()
        timecard = TimeCard.query.filter_by(employee_id=employee.id, date=today).first()

        if not timecard or not timecard.check_in:
            return jsonify({'success': False, 'error': 'Entrada não registrada'}), 400

        if timecard.check_out:
            return jsonify({'success': False, 'error': 'Saída já registrada'}), 400

        timecard.check_out = datetime.now().time()

        # Calcular horas trabalhadas
        check_in_dt = datetime.combine(today, timecard.check_in)
        check_out_dt = datetime.combine(today, timecard.check_out)
        delta = check_out_dt - check_in_dt
        timecard.hours_worked = round(delta.total_seconds() / 3600, 2)

        db.session.commit()

        return jsonify({
            'success': True,
            'message': 'Saída registrada',
            'timecard': timecard.to_dict()
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'error': str(e)}), 500


# ================ FOLHA DE PAGAMENTO ================

@hr_bp.route('/payroll', methods=['GET'])
@jwt_required()
def get_payrolls():
    """Listar folhas de pagamento (admin)"""
    try:
        claims = get_jwt()
        if not claims.get('is_admin'):
            return jsonify({'success': False, 'error': 'Acesso negado'}), 403

        month = request.args.get('month', type=int)
        year = request.args.get('year', type=int)

        query = Payroll.query
        if month:
            query = query.filter_by(month=month)
        if year:
            query = query.filter_by(year=year)

        payrolls = query.order_by(desc(Payroll.created_at)).all()

        return jsonify({
            'success': True,
            'payrolls': [p.to_dict() for p in payrolls]
        }), 200
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500


@hr_bp.route('/payroll', methods=['POST'])
@jwt_required()
def create_payroll():
    """Gerar folha de pagamento (admin)"""
    try:
        claims = get_jwt()
        if not claims.get('is_admin'):
            return jsonify({'success': False, 'error': 'Acesso negado'}), 403

        current_user_id = get_jwt_identity()
        data = request.get_json()

        required_fields = ['employee_id', 'month', 'year', 'period_start', 'period_end', 'base_salary']
        validation = validate_required_fields(data, required_fields)
        if not validation['valid']:
            return jsonify({'success': False, 'error': validation['message']}), 400

        # Calcular valores
        base_salary = float(data['base_salary'])
        overtime_pay = float(data.get('overtime_pay', 0))
        bonuses = float(data.get('bonuses', 0))
        other_earnings = float(data.get('other_earnings', 0))

        gross_salary = base_salary + overtime_pay + bonuses + other_earnings

        inss = float(data.get('inss', 0))
        irrf = float(data.get('irrf', 0))
        other_deductions = float(data.get('other_deductions', 0))

        total_deductions = inss + irrf + other_deductions
        net_salary = gross_salary - total_deductions

        payroll = Payroll(
            employee_id=data['employee_id'],
            month=data['month'],
            year=data['year'],
            period_start=datetime.strptime(data['period_start'], '%Y-%m-%d').date(),
            period_end=datetime.strptime(data['period_end'], '%Y-%m-%d').date(),
            base_salary=base_salary,
            hours_worked=data.get('hours_worked', 0),
            overtime_hours=data.get('overtime_hours', 0),
            overtime_pay=overtime_pay,
            commissions=data.get('commissions', 0),
            bonuses=bonuses,
            other_earnings=other_earnings,
            gross_salary=gross_salary,
            inss=inss,
            irrf=irrf,
            other_deductions=other_deductions,
            total_deductions=total_deductions,
            net_salary=net_salary,
            fgts=data.get('fgts', gross_salary * 0.08),
            status='calculated',
            created_by=current_user_id
        )

        db.session.add(payroll)
        db.session.commit()

        return jsonify({'success': True, 'payroll': payroll.to_dict()}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'error': str(e)}), 500


# ================ BENEFÍCIOS ================

@hr_bp.route('/benefits', methods=['GET'])
@jwt_required()
def get_benefits():
    """Listar benefícios disponíveis"""
    try:
        benefits = Benefit.query.filter_by(is_active=True).all()
        return jsonify({
            'success': True,
            'benefits': [b.to_dict() for b in benefits]
        }), 200
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500


@hr_bp.route('/benefits', methods=['POST'])
@jwt_required()
def create_benefit():
    """Criar benefício (admin)"""
    try:
        claims = get_jwt()
        if not claims.get('is_admin'):
            return jsonify({'success': False, 'error': 'Acesso negado'}), 403

        data = request.get_json()
        validation = validate_required_fields(data, ['name', 'type'])
        if not validation['valid']:
            return jsonify({'success': False, 'error': validation['message']}), 400

        benefit = Benefit(**{k: v for k, v in data.items() if k != 'id'})

        db.session.add(benefit)
        db.session.commit()

        return jsonify({'success': True, 'benefit': benefit.to_dict()}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'error': str(e)}), 500


@hr_bp.route('/employees/<employee_id>/benefits', methods=['GET'])
@jwt_required()
def get_employee_benefits(employee_id):
    """Listar benefícios do funcionário"""
    try:
        employee_benefits = EmployeeBenefit.query.filter_by(employee_id=employee_id, status='active').all()

        return jsonify({
            'success': True,
            'benefits': [eb.to_dict() for eb in employee_benefits]
        }), 200
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500
