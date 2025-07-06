from flask import Blueprint, request, jsonify
from src.models.database import db, Employee, Department, Position, Payroll, TimeCard, Benefit, EmployeeBenefit
from datetime import datetime, date
import uuid

hr_bp = Blueprint('hr', __name__, url_prefix='/api/hr')

# ===========================================
# FUNCIONÁRIOS
# ===========================================

@hr_bp.route('/employees', methods=['GET'])
def get_employees():
    """Lista todos os funcionários"""
    try:
        employees = Employee.query.all()
        return jsonify([{
            'id': emp.id,
            'name': emp.name,
            'email': emp.email,
            'phone': emp.phone,
            'position': emp.position,
            'department': emp.department,
            'hire_date': emp.hire_date.isoformat() if emp.hire_date else None,
            'status': emp.status,
            'salary': float(emp.salary) if emp.salary else None,
            'employment_type': emp.employment_type
        } for emp in employees]), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@hr_bp.route('/employees', methods=['POST'])
def create_employee():
    """Cria um novo funcionário"""
    try:
        data = request.get_json()
        
        # Validação básica
        required_fields = ['name', 'email', 'cpf', 'birth_date', 'position', 'hire_date']
        for field in required_fields:
            if field not in data:
                return jsonify({'error': f'Campo obrigatório: {field}'}), 400
        
        # Verificar se CPF já existe
        existing_employee = Employee.query.filter_by(cpf=data['cpf']).first()
        if existing_employee:
            return jsonify({'error': 'CPF já cadastrado'}), 400
        
        # Verificar se email já existe
        existing_email = Employee.query.filter_by(email=data['email']).first()
        if existing_email:
            return jsonify({'error': 'Email já cadastrado'}), 400
        
        # Criar funcionário
        employee = Employee(
            name=data['name'],
            email=data['email'],
            phone=data.get('phone'),
            cpf=data['cpf'],
            rg=data.get('rg'),
            birth_date=datetime.strptime(data['birth_date'], '%Y-%m-%d').date(),
            gender=data.get('gender'),
            marital_status=data.get('marital_status'),
            address_street=data.get('address_street'),
            address_number=data.get('address_number'),
            address_complement=data.get('address_complement'),
            address_neighborhood=data.get('address_neighborhood'),
            address_city=data.get('address_city'),
            address_state=data.get('address_state'),
            address_cep=data.get('address_cep'),
            position=data['position'],
            department=data.get('department'),
            hire_date=datetime.strptime(data['hire_date'], '%Y-%m-%d').date(),
            salary=data.get('salary'),
            employment_type=data.get('employment_type', 'CLT'),
            bank_name=data.get('bank_name'),
            bank_agency=data.get('bank_agency'),
            bank_account=data.get('bank_account'),
            bank_account_type=data.get('bank_account_type'),
            emergency_contact_name=data.get('emergency_contact_name'),
            emergency_contact_phone=data.get('emergency_contact_phone'),
            emergency_contact_relationship=data.get('emergency_contact_relationship')
        )
        
        db.session.add(employee)
        db.session.commit()
        
        return jsonify({
            'id': employee.id,
            'name': employee.name,
            'email': employee.email,
            'message': 'Funcionário criado com sucesso'
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@hr_bp.route('/employees/<employee_id>', methods=['GET'])
def get_employee(employee_id):
    """Obtém detalhes de um funcionário específico"""
    try:
        employee = Employee.query.get(employee_id)
        if not employee:
            return jsonify({'error': 'Funcionário não encontrado'}), 404
        
        return jsonify({
            'id': employee.id,
            'name': employee.name,
            'email': employee.email,
            'phone': employee.phone,
            'cpf': employee.cpf,
            'rg': employee.rg,
            'birth_date': employee.birth_date.isoformat() if employee.birth_date else None,
            'gender': employee.gender,
            'marital_status': employee.marital_status,
            'address_street': employee.address_street,
            'address_number': employee.address_number,
            'address_complement': employee.address_complement,
            'address_neighborhood': employee.address_neighborhood,
            'address_city': employee.address_city,
            'address_state': employee.address_state,
            'address_cep': employee.address_cep,
            'position': employee.position,
            'department': employee.department,
            'hire_date': employee.hire_date.isoformat() if employee.hire_date else None,
            'termination_date': employee.termination_date.isoformat() if employee.termination_date else None,
            'salary': float(employee.salary) if employee.salary else None,
            'employment_type': employee.employment_type,
            'status': employee.status,
            'bank_name': employee.bank_name,
            'bank_agency': employee.bank_agency,
            'bank_account': employee.bank_account,
            'bank_account_type': employee.bank_account_type,
            'emergency_contact_name': employee.emergency_contact_name,
            'emergency_contact_phone': employee.emergency_contact_phone,
            'emergency_contact_relationship': employee.emergency_contact_relationship,
            'created_at': employee.created_at.isoformat(),
            'updated_at': employee.updated_at.isoformat()
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@hr_bp.route('/employees/<employee_id>', methods=['PUT'])
def update_employee(employee_id):
    """Atualiza dados de um funcionário"""
    try:
        employee = Employee.query.get(employee_id)
        if not employee:
            return jsonify({'error': 'Funcionário não encontrado'}), 404
        
        data = request.get_json()
        
        # Atualizar campos
        if 'name' in data:
            employee.name = data['name']
        if 'email' in data:
            employee.email = data['email']
        if 'phone' in data:
            employee.phone = data['phone']
        if 'position' in data:
            employee.position = data['position']
        if 'department' in data:
            employee.department = data['department']
        if 'salary' in data:
            employee.salary = data['salary']
        if 'status' in data:
            employee.status = data['status']
        if 'employment_type' in data:
            employee.employment_type = data['employment_type']
        
        # Atualizar endereço
        if 'address_street' in data:
            employee.address_street = data['address_street']
        if 'address_number' in data:
            employee.address_number = data['address_number']
        if 'address_city' in data:
            employee.address_city = data['address_city']
        if 'address_state' in data:
            employee.address_state = data['address_state']
        if 'address_cep' in data:
            employee.address_cep = data['address_cep']
        
        # Atualizar dados bancários
        if 'bank_name' in data:
            employee.bank_name = data['bank_name']
        if 'bank_agency' in data:
            employee.bank_agency = data['bank_agency']
        if 'bank_account' in data:
            employee.bank_account = data['bank_account']
        
        employee.updated_at = datetime.utcnow()
        db.session.commit()
        
        return jsonify({
            'message': 'Funcionário atualizado com sucesso',
            'id': employee.id
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@hr_bp.route('/employees/<employee_id>', methods=['DELETE'])
def delete_employee(employee_id):
    """Remove um funcionário (soft delete)"""
    try:
        employee = Employee.query.get(employee_id)
        if not employee:
            return jsonify({'error': 'Funcionário não encontrado'}), 404
        
        employee.status = 'terminated'
        employee.termination_date = date.today()
        employee.updated_at = datetime.utcnow()
        
        db.session.commit()
        
        return jsonify({'message': 'Funcionário removido com sucesso'}), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

# ===========================================
# DEPARTAMENTOS
# ===========================================

@hr_bp.route('/departments', methods=['GET'])
def get_departments():
    """Lista todos os departamentos"""
    try:
        departments = Department.query.all()
        return jsonify([{
            'id': dept.id,
            'name': dept.name,
            'description': dept.description,
            'manager_id': dept.manager_id,
            'budget': float(dept.budget) if dept.budget else None,
            'is_active': dept.is_active,
            'employee_count': len(dept.positions) if dept.positions else 0
        } for dept in departments]), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@hr_bp.route('/departments', methods=['POST'])
def create_department():
    """Cria um novo departamento"""
    try:
        data = request.get_json()
        
        if 'name' not in data:
            return jsonify({'error': 'Nome do departamento é obrigatório'}), 400
        
        department = Department(
            name=data['name'],
            description=data.get('description'),
            manager_id=data.get('manager_id'),
            budget=data.get('budget')
        )
        
        db.session.add(department)
        db.session.commit()
        
        return jsonify({
            'id': department.id,
            'name': department.name,
            'message': 'Departamento criado com sucesso'
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

# ===========================================
# CARGOS
# ===========================================

@hr_bp.route('/positions', methods=['GET'])
def get_positions():
    """Lista todos os cargos"""
    try:
        positions = Position.query.all()
        return jsonify([{
            'id': pos.id,
            'title': pos.title,
            'description': pos.description,
            'department_id': pos.department_id,
            'base_salary': float(pos.base_salary) if pos.base_salary else None,
            'is_active': pos.is_active
        } for pos in positions]), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@hr_bp.route('/positions', methods=['POST'])
def create_position():
    """Cria um novo cargo"""
    try:
        data = request.get_json()
        
        if 'title' not in data:
            return jsonify({'error': 'Título do cargo é obrigatório'}), 400
        
        position = Position(
            title=data['title'],
            description=data.get('description'),
            department_id=data.get('department_id'),
            base_salary=data.get('base_salary'),
            requirements=data.get('requirements'),
            responsibilities=data.get('responsibilities')
        )
        
        db.session.add(position)
        db.session.commit()
        
        return jsonify({
            'id': position.id,
            'title': position.title,
            'message': 'Cargo criado com sucesso'
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

# ===========================================
# FOLHA DE PAGAMENTO
# ===========================================

@hr_bp.route('/payroll', methods=['GET'])
def get_payroll():
    """Lista folha de pagamento"""
    try:
        month = request.args.get('month', type=int)
        year = request.args.get('year', type=int)
        
        query = Payroll.query
        
        if month:
            query = query.filter_by(month=month)
        if year:
            query = query.filter_by(year=year)
        
        payroll_records = query.all()
        
        return jsonify([{
            'id': record.id,
            'employee_id': record.employee_id,
            'employee_name': record.employee.name if record.employee else None,
            'month': record.month,
            'year': record.year,
            'base_salary': float(record.base_salary),
            'overtime_hours': float(record.overtime_hours) if record.overtime_hours else 0,
            'overtime_value': float(record.overtime_value) if record.overtime_value else 0,
            'bonus': float(record.bonus) if record.bonus else 0,
            'deductions': float(record.deductions) if record.deductions else 0,
            'net_salary': float(record.net_salary),
            'status': record.status,
            'payment_date': record.payment_date.isoformat() if record.payment_date else None
        } for record in payroll_records]), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@hr_bp.route('/payroll', methods=['POST'])
def create_payroll_record():
    """Cria registro de folha de pagamento"""
    try:
        data = request.get_json()
        
        required_fields = ['employee_id', 'month', 'year', 'base_salary', 'net_salary']
        for field in required_fields:
            if field not in data:
                return jsonify({'error': f'Campo obrigatório: {field}'}), 400
        
        payroll = Payroll(
            employee_id=data['employee_id'],
            month=data['month'],
            year=data['year'],
            base_salary=data['base_salary'],
            overtime_hours=data.get('overtime_hours', 0),
            overtime_value=data.get('overtime_value', 0),
            bonus=data.get('bonus', 0),
            deductions=data.get('deductions', 0),
            net_salary=data['net_salary'],
            status=data.get('status', 'pending')
        )
        
        db.session.add(payroll)
        db.session.commit()
        
        return jsonify({
            'id': payroll.id,
            'message': 'Registro de folha criado com sucesso'
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

# ===========================================
# PONTO ELETRÔNICO
# ===========================================

@hr_bp.route('/timecards', methods=['GET'])
def get_timecards():
    """Lista registros de ponto"""
    try:
        employee_id = request.args.get('employee_id')
        date_from = request.args.get('date_from')
        date_to = request.args.get('date_to')
        
        query = TimeCard.query
        
        if employee_id:
            query = query.filter_by(employee_id=employee_id)
        if date_from:
            query = query.filter(TimeCard.date >= datetime.strptime(date_from, '%Y-%m-%d').date())
        if date_to:
            query = query.filter(TimeCard.date <= datetime.strptime(date_to, '%Y-%m-%d').date())
        
        timecards = query.all()
        
        return jsonify([{
            'id': tc.id,
            'employee_id': tc.employee_id,
            'employee_name': tc.employee.name if tc.employee else None,
            'date': tc.date.isoformat(),
            'entry_time': tc.entry_time.isoformat() if tc.entry_time else None,
            'exit_time': tc.exit_time.isoformat() if tc.exit_time else None,
            'lunch_start': tc.lunch_start.isoformat() if tc.lunch_start else None,
            'lunch_end': tc.lunch_end.isoformat() if tc.lunch_end else None,
            'total_hours': float(tc.total_hours) if tc.total_hours else None,
            'overtime_hours': float(tc.overtime_hours) if tc.overtime_hours else 0,
            'status': tc.status,
            'notes': tc.notes
        } for tc in timecards]), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@hr_bp.route('/timecards', methods=['POST'])
def create_timecard():
    """Cria registro de ponto"""
    try:
        data = request.get_json()
        
        required_fields = ['employee_id', 'date']
        for field in required_fields:
            if field not in data:
                return jsonify({'error': f'Campo obrigatório: {field}'}), 400
        
        timecard = TimeCard(
            employee_id=data['employee_id'],
            date=datetime.strptime(data['date'], '%Y-%m-%d').date(),
            entry_time=datetime.strptime(data['entry_time'], '%H:%M').time() if data.get('entry_time') else None,
            exit_time=datetime.strptime(data['exit_time'], '%H:%M').time() if data.get('exit_time') else None,
            lunch_start=datetime.strptime(data['lunch_start'], '%H:%M').time() if data.get('lunch_start') else None,
            lunch_end=datetime.strptime(data['lunch_end'], '%H:%M').time() if data.get('lunch_end') else None,
            notes=data.get('notes')
        )
        
        db.session.add(timecard)
        db.session.commit()
        
        return jsonify({
            'id': timecard.id,
            'message': 'Registro de ponto criado com sucesso'
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

# ===========================================
# BENEFÍCIOS
# ===========================================

@hr_bp.route('/benefits', methods=['GET'])
def get_benefits():
    """Lista todos os benefícios"""
    try:
        benefits = Benefit.query.all()
        return jsonify([{
            'id': benefit.id,
            'name': benefit.name,
            'description': benefit.description,
            'type': benefit.type,
            'value': float(benefit.value) if benefit.value else None,
            'percentage': float(benefit.percentage) if benefit.percentage else None,
            'is_active': benefit.is_active
        } for benefit in benefits]), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@hr_bp.route('/benefits', methods=['POST'])
def create_benefit():
    """Cria um novo benefício"""
    try:
        data = request.get_json()
        
        if 'name' not in data:
            return jsonify({'error': 'Nome do benefício é obrigatório'}), 400
        
        benefit = Benefit(
            name=data['name'],
            description=data.get('description'),
            type=data.get('type'),
            value=data.get('value'),
            percentage=data.get('percentage')
        )
        
        db.session.add(benefit)
        db.session.commit()
        
        return jsonify({
            'id': benefit.id,
            'name': benefit.name,
            'message': 'Benefício criado com sucesso'
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

# ===========================================
# RELATÓRIOS E ESTATÍSTICAS
# ===========================================

@hr_bp.route('/analytics/overview', methods=['GET'])
def get_hr_analytics():
    """Obtém estatísticas gerais do RH"""
    try:
        total_employees = Employee.query.filter_by(status='active').count()
        total_departments = Department.query.filter_by(is_active=True).count()
        total_positions = Position.query.filter_by(is_active=True).count()
        
        # Funcionários por departamento
        employees_by_dept = db.session.query(
            Employee.department,
            db.func.count(Employee.id)
        ).filter_by(status='active').group_by(Employee.department).all()
        
        # Salários médios por departamento
        avg_salary_by_dept = db.session.query(
            Employee.department,
            db.func.avg(Employee.salary)
        ).filter_by(status='active').group_by(Employee.department).all()
        
        return jsonify({
            'total_employees': total_employees,
            'total_departments': total_departments,
            'total_positions': total_positions,
            'employees_by_department': [
                {'department': dept, 'count': count}
                for dept, count in employees_by_dept
            ],
            'avg_salary_by_department': [
                {'department': dept, 'avg_salary': float(avg) if avg else 0}
                for dept, avg in avg_salary_by_dept
            ]
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500 