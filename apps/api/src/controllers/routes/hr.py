from datetime import datetime
from decimal import Decimal
import uuid

from flask import Blueprint, jsonify, request
from sqlalchemy import desc, func

from database import db
from models.hr import (
    Employee,
    Department,
    Position,
    Payroll,
    TimeCard,
    Benefit,
    EmployeeBenefit,
)

hr_bp = Blueprint("hr", __name__)


def convert_to_uuid(id_string):
    """Convert string ID to UUID object safely"""
    try:
        return uuid.UUID(id_string)
    except (ValueError, TypeError):
        return None


@hr_bp.route("/", methods=["GET"])
def hr_home():
    """Informações sobre o sistema de RH"""
    return jsonify({
        "message": "Sistema de Recursos Humanos - Mestres do Café",
        "features": {
            "employees": "Gestão de funcionários",
            "departments": "Departamentos",
            "positions": "Cargos e posições",
            "payroll": "Folha de pagamento",
            "time_cards": "Controle de ponto",
            "benefits": "Benefícios"
        },
        "endpoints": {
            "employees": "/employees",
            "departments": "/departments",
            "positions": "/positions",
            "payroll": "/payroll",
            "time_cards": "/time-cards",
            "benefits": "/benefits",
            "stats": "/stats"
        }
    })


@hr_bp.route("/employees", methods=["GET"])
def get_employees():
    """Listar funcionários"""
    try:
        page = request.args.get("page", 1, type=int)
        per_page = request.args.get("per_page", 20, type=int)
        department_id = request.args.get("department_id")
        position_id = request.args.get("position_id")
        status = request.args.get("status", "active")
        
        query = Employee.query
        
        # Filtros
        if department_id:
            query = query.filter(Employee.department_id == department_id)
        
        if position_id:
            query = query.filter(Employee.position_id == position_id)
        
        if status:
            query = query.filter(Employee.status == status)
        
        employees = query.order_by(Employee.name).paginate(
            page=page,
            per_page=per_page,
            error_out=False
        )
        
        return jsonify({
            "employees": [emp.to_dict() for emp in employees.items],
            "pagination": {
                "page": page,
                "per_page": per_page,
                "total": employees.total,
                "pages": employees.pages
            }
        })
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@hr_bp.route("/employees", methods=["POST"])
def create_employee():
    """Criar novo funcionário"""
    try:
        data = request.get_json()
        required_fields = [
            "name", "email", "phone", "department_id", "position_id", "salary"
        ]
        
        for field in required_fields:
            if field not in data:
                return jsonify({"error": f"Campo {field} obrigatório"}), 400
        
        # Verificar se email já existe
        existing = Employee.query.filter_by(email=data["email"]).first()
        if existing:
            return jsonify({"error": "Email já existe"}), 400
        
        # Verificar se departamento existe
        department = Department.query.get(data["department_id"])
        if not department:
            return jsonify({"error": "Departamento não encontrado"}), 404
        
        # Verificar se posição existe
        position = Position.query.get(data["position_id"])
        if not position:
            return jsonify({"error": "Posição não encontrada"}), 404
        
        employee = Employee(
            name=data["name"],
            email=data["email"],
            phone=data["phone"],
            document=data.get("document"),
            department_id=data["department_id"],
            position_id=data["position_id"],
            salary=Decimal(str(data["salary"])),
            hire_date=(
                datetime.fromisoformat(data["hire_date"]).date()
                if data.get("hire_date") else datetime.utcnow().date()
            ),
            address=data.get("address"),
            emergency_contact=data.get("emergency_contact"),
            status="active"
        )
        
        db.session.add(employee)
        db.session.commit()
        
        return jsonify({
            "message": "Funcionário criado com sucesso",
            "employee": employee.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500


@hr_bp.route("/employees/<employee_id>", methods=["GET"])
def get_employee(employee_id):
    """Obter funcionário específico"""
    try:
        employee_uuid = convert_to_uuid(employee_id)
        if not employee_uuid:
            return jsonify({"error": "ID de funcionário inválido"}), 400
            
        employee = Employee.query.get_or_404(employee_uuid)
        return jsonify({"employee": employee.to_dict()})
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@hr_bp.route("/employees/<employee_id>", methods=["PUT"])
def update_employee(employee_id):
    """Atualizar funcionário"""
    try:
        employee_uuid = convert_to_uuid(employee_id)
        if not employee_uuid:
            return jsonify({"error": "ID de funcionário inválido"}), 400
            
        employee = Employee.query.get_or_404(employee_uuid)
        data = request.get_json()
        
        # Campos permitidos para atualização
        allowed_fields = [
            "name", "phone", "department_id", "position_id", "salary",
            "address", "emergency_contact", "status"
        ]
        
        for field in allowed_fields:
            if field in data:
                if field == "salary":
                    setattr(employee, field, Decimal(str(data[field])))
                else:
                    setattr(employee, field, data[field])
        
        employee.updated_at = datetime.utcnow()
        db.session.commit()
        
        return jsonify({
            "message": "Funcionário atualizado com sucesso",
            "employee": employee.to_dict()
        })
        
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500


@hr_bp.route("/departments", methods=["GET"])
def get_departments():
    """Listar departamentos"""
    try:
        departments = Department.query.filter_by(is_active=True).order_by(
            Department.name
        ).all()
        
        return jsonify({
            "departments": [dept.to_dict() for dept in departments]
        })
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@hr_bp.route("/departments", methods=["POST"])
def create_department():
    """Criar novo departamento"""
    try:
        data = request.get_json()
        required_fields = ["name"]
        
        for field in required_fields:
            if field not in data:
                return jsonify({"error": f"Campo {field} obrigatório"}), 400
        
        department = Department(
            name=data["name"],
            description=data.get("description"),
            manager_id=data.get("manager_id"),
            is_active=True
        )
        
        db.session.add(department)
        db.session.commit()
        
        return jsonify({
            "message": "Departamento criado com sucesso",
            "department": department.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500


@hr_bp.route("/positions", methods=["GET"])
def get_positions():
    """Listar posições"""
    try:
        positions = Position.query.filter_by(is_active=True).order_by(
            Position.title
        ).all()
        
        return jsonify({
            "positions": [pos.to_dict() for pos in positions]
        })
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@hr_bp.route("/positions", methods=["POST"])
def create_position():
    """Criar nova posição"""
    try:
        data = request.get_json()
        required_fields = ["title", "level"]
        
        for field in required_fields:
            if field not in data:
                return jsonify({"error": f"Campo {field} obrigatório"}), 400
        
        position = Position(
            title=data["title"],
            description=data.get("description"),
            level=data["level"],
            requirements=data.get("requirements"),
            is_active=True
        )
        
        db.session.add(position)
        db.session.commit()
        
        return jsonify({
            "message": "Posição criada com sucesso",
            "position": position.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500


@hr_bp.route("/payroll", methods=["GET"])
def get_payroll():
    """Listar folha de pagamento"""
    try:
        page = request.args.get("page", 1, type=int)
        per_page = request.args.get("per_page", 20, type=int)
        month = request.args.get("month", type=int)
        year = request.args.get("year", type=int)
        employee_id = request.args.get("employee_id")
        
        query = Payroll.query
        
        # Filtros
        if employee_id:
            query = query.filter(Payroll.employee_id == employee_id)
        
        if month:
            query = query.filter(Payroll.month == month)
        
        if year:
            query = query.filter(Payroll.year == year)
        
        payrolls = query.order_by(
            desc(Payroll.year),
            desc(Payroll.month),
            Payroll.employee_id
        ).paginate(
            page=page,
            per_page=per_page,
            error_out=False
        )
        
        return jsonify({
            "payrolls": [payroll.to_dict() for payroll in payrolls.items],
            "pagination": {
                "page": page,
                "per_page": per_page,
                "total": payrolls.total,
                "pages": payrolls.pages
            }
        })
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@hr_bp.route("/payroll", methods=["POST"])
def create_payroll():
    """Criar folha de pagamento"""
    try:
        data = request.get_json()
        required_fields = ["employee_id", "month", "year", "gross_salary"]
        
        for field in required_fields:
            if field not in data:
                return jsonify({"error": f"Campo {field} obrigatório"}), 400
        
        # Verificar se folha já existe
        existing = Payroll.query.filter_by(
            employee_id=data["employee_id"],
            month=data["month"],
            year=data["year"]
        ).first()
        
        if existing:
            return jsonify({"error": "Folha já existe para este período"}), 400
        
        # Verificar se funcionário existe
        employee = Employee.query.get(data["employee_id"])
        if not employee:
            return jsonify({"error": "Funcionário não encontrado"}), 404
        
        payroll = Payroll(
            employee_id=data["employee_id"],
            month=data["month"],
            year=data["year"],
            gross_salary=Decimal(str(data["gross_salary"])),
            deductions=Decimal(str(data.get("deductions", 0))),
            bonuses=Decimal(str(data.get("bonuses", 0))),
            overtime=Decimal(str(data.get("overtime", 0))),
            net_salary=(
                Decimal(str(data["gross_salary"])) +
                Decimal(str(data.get("bonuses", 0))) +
                Decimal(str(data.get("overtime", 0))) -
                Decimal(str(data.get("deductions", 0)))
            ),
            worked_hours=data.get("worked_hours", 0),
            overtime_hours=data.get("overtime_hours", 0),
            details=data.get("details", {}),
            status="pending"
        )
        
        db.session.add(payroll)
        db.session.commit()
        
        return jsonify({
            "message": "Folha de pagamento criada com sucesso",
            "payroll": payroll.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500


@hr_bp.route("/payroll/<payroll_id>/approve", methods=["POST"])
def approve_payroll(payroll_id):
    """Aprovar folha de pagamento"""
    try:
        payroll = Payroll.query.get_or_404(payroll_id)
        
        if payroll.status != "pending":
            return jsonify({"error": "Folha não está pendente"}), 400
        
        payroll.status = "approved"
        payroll.approved_at = datetime.utcnow()
        payroll.approved_by = (
            request.json.get("approved_by") if request.json else None
        )
        
        db.session.commit()
        
        return jsonify({
            "message": "Folha de pagamento aprovada com sucesso",
            "payroll": payroll.to_dict()
        })
        
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500


@hr_bp.route("/time-cards", methods=["GET"])
def get_time_cards():
    """Listar cartões de ponto"""
    try:
        page = request.args.get("page", 1, type=int)
        per_page = request.args.get("per_page", 20, type=int)
        employee_id = request.args.get("employee_id")
        start_date = request.args.get("start_date")
        end_date = request.args.get("end_date")
        
        query = TimeCard.query
        
        # Filtros
        if employee_id:
            query = query.filter(TimeCard.employee_id == employee_id)
        
        if start_date:
            start = datetime.fromisoformat(start_date).date()
            query = query.filter(TimeCard.date >= start)
        
        if end_date:
            end = datetime.fromisoformat(end_date).date()
            query = query.filter(TimeCard.date <= end)
        
        time_cards = query.order_by(
            desc(TimeCard.date),
            TimeCard.employee_id
        ).paginate(
            page=page,
            per_page=per_page,
            error_out=False
        )
        
        return jsonify({
            "time_cards": [card.to_dict() for card in time_cards.items],
            "pagination": {
                "page": page,
                "per_page": per_page,
                "total": time_cards.total,
                "pages": time_cards.pages
            }
        })
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@hr_bp.route("/time-cards", methods=["POST"])
def create_time_card():
    """Criar cartão de ponto"""
    try:
        data = request.get_json()
        required_fields = ["employee_id", "date", "time_in"]
        
        for field in required_fields:
            if field not in data:
                return jsonify({"error": f"Campo {field} obrigatório"}), 400
        
        # Verificar se funcionário existe
        employee = Employee.query.get(data["employee_id"])
        if not employee:
            return jsonify({"error": "Funcionário não encontrado"}), 404
        
        time_card = TimeCard(
            employee_id=data["employee_id"],
            date=datetime.fromisoformat(data["date"]).date(),
            time_in=datetime.fromisoformat(data["time_in"]).time(),
            time_out=(
                datetime.fromisoformat(data["time_out"]).time()
                if data.get("time_out") else None
            ),
            lunch_break=data.get("lunch_break", 60),
            total_hours=data.get("total_hours", 0),
            overtime_hours=data.get("overtime_hours", 0),
            notes=data.get("notes")
        )
        
        db.session.add(time_card)
        db.session.commit()
        
        return jsonify({
            "message": "Cartão de ponto criado com sucesso",
            "time_card": time_card.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500


@hr_bp.route("/benefits", methods=["GET"])
def get_benefits():
    """Listar benefícios"""
    try:
        benefits = Benefit.query.filter_by(is_active=True).order_by(
            Benefit.name
        ).all()
        
        return jsonify({
            "benefits": [benefit.to_dict() for benefit in benefits]
        })
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@hr_bp.route("/benefits", methods=["POST"])
def create_benefit():
    """Criar novo benefício"""
    try:
        data = request.get_json()
        required_fields = ["name", "type"]
        
        for field in required_fields:
            if field not in data:
                return jsonify({"error": f"Campo {field} obrigatório"}), 400
        
        benefit = Benefit(
            name=data["name"],
            type=data["type"],
            description=data.get("description"),
            cost=Decimal(str(data.get("cost", 0))),
            is_active=True
        )
        
        db.session.add(benefit)
        db.session.commit()
        
        return jsonify({
            "message": "Benefício criado com sucesso",
            "benefit": benefit.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500


@hr_bp.route("/employees/<employee_id>/benefits", methods=["GET"])
def get_employee_benefits(employee_id):
    """Listar benefícios do funcionário"""
    try:
        employee_benefits = EmployeeBenefit.query.filter_by(
            employee_id=employee_id,
            is_active=True
        ).all()
        
        return jsonify({
            "employee_benefits": [eb.to_dict() for eb in employee_benefits]
        })
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@hr_bp.route("/employees/<employee_id>/benefits", methods=["POST"])
def add_employee_benefit(employee_id):
    """Adicionar benefício ao funcionário"""
    try:
        data = request.get_json()
        
        if "benefit_id" not in data:
            return jsonify({"error": "Campo benefit_id obrigatório"}), 400
        
        # Verificar se funcionário existe
        Employee.query.get_or_404(employee_id)
        
        # Verificar se benefício existe
        benefit = Benefit.query.get(data["benefit_id"])
        if not benefit:
            return jsonify({"error": "Benefício não encontrado"}), 404
        
        # Verificar se benefício já está ativo
        existing = EmployeeBenefit.query.filter_by(
            employee_id=employee_id,
            benefit_id=data["benefit_id"],
            is_active=True
        ).first()
        
        if existing:
            return jsonify({"error": "Benefício já ativo"}), 400
        
        employee_benefit = EmployeeBenefit(
            employee_id=employee_id,
            benefit_id=data["benefit_id"],
            start_date=(
                datetime.fromisoformat(data["start_date"]).date()
                if data.get("start_date") else datetime.utcnow().date()
            ),
            is_active=True
        )
        
        db.session.add(employee_benefit)
        db.session.commit()
        
        return jsonify({
            "message": "Benefício adicionado com sucesso",
            "employee_benefit": employee_benefit.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500


@hr_bp.route("/reports/payroll-summary", methods=["GET"])
def get_payroll_summary():
    """Resumo da folha de pagamento"""
    try:
        month = request.args.get("month", datetime.utcnow().month, type=int)
        year = request.args.get("year", datetime.utcnow().year, type=int)
        
        payrolls = Payroll.query.filter_by(month=month, year=year).all()
        
        if not payrolls:
            return jsonify({
                "payroll_summary": {
                    "month": month,
                    "year": year,
                    "total_employees": 0,
                    "total_gross": 0,
                    "total_deductions": 0,
                    "total_bonuses": 0,
                    "total_net": 0
                }
            })
        
        total_gross = sum(p.gross_salary for p in payrolls)
        total_deductions = sum(p.deductions for p in payrolls)
        total_bonuses = sum(p.bonuses for p in payrolls)
        total_net = sum(p.net_salary for p in payrolls)
        
        return jsonify({
            "payroll_summary": {
                "month": month,
                "year": year,
                "total_employees": len(payrolls),
                "total_gross": float(total_gross),
                "total_deductions": float(total_deductions),
                "total_bonuses": float(total_bonuses),
                "total_net": float(total_net),
                "by_department": {}  # Pode ser implementado depois
            }
        })
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@hr_bp.route("/stats", methods=["GET"])
def get_hr_stats():
    """Estatísticas de RH"""
    try:
        # Funcionários ativos
        active_employees = Employee.query.filter_by(status="active").count()
        
        # Total de departamentos
        total_departments = Department.query.filter_by(is_active=True).count()
        
        # Total de posições
        total_positions = Position.query.filter_by(is_active=True).count()
        
        # Folhas de pagamento do mês atual
        current_month = datetime.utcnow().month
        current_year = datetime.utcnow().year
        
        current_payrolls = Payroll.query.filter_by(
            month=current_month,
            year=current_year
        ).count()
        
        return jsonify({
            "hr_stats": {
                "active_employees": active_employees,
                "total_departments": total_departments,
                "total_positions": total_positions,
                "current_month_payrolls": current_payrolls
            }
        })
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@hr_bp.route("/summary", methods=["GET"])
def get_hr_summary():
    """Resumo geral do RH"""
    try:
        # Funcionários ativos
        active_employees = Employee.query.filter_by(status="active").count()
        
        # Total de funcionários
        total_employees = Employee.query.count()
        
        # Funcionários inativos
        inactive_employees = total_employees - active_employees
        
        # Total de departamentos
        total_departments = Department.query.filter_by(is_active=True).count()
        
        # Total de posições
        total_positions = Position.query.filter_by(is_active=True).count()
        
        # Folhas de pagamento pendentes
        pending_payrolls = Payroll.query.filter_by(status="pending").count()
        
        # Folhas de pagamento aprovadas este mês
        current_month = datetime.utcnow().month
        current_year = datetime.utcnow().year
        
        approved_payrolls = Payroll.query.filter_by(
            month=current_month,
            year=current_year,
            status="approved"
        ).count()
        
        # Custo total da folha de pagamento aprovada este mês
        total_payroll_cost = db.session.query(
            func.sum(Payroll.net_salary)
        ).filter_by(
            month=current_month,
            year=current_year,
            status="approved"
        ).scalar() or 0
        
        # Benefícios ativos
        active_benefits = Benefit.query.filter_by(is_active=True).count()
        
        # Funcionários com benefícios
        employees_with_benefits = EmployeeBenefit.query.filter_by(
            is_active=True
        ).count()
        
        return jsonify({
            "success": True,
            "data": {
                "employees": {
                    "active": active_employees,
                    "inactive": inactive_employees,
                    "total": total_employees
                },
                "structure": {
                    "departments": total_departments,
                    "positions": total_positions
                },
                "payroll": {
                    "pending": pending_payrolls,
                    "approved_this_month": approved_payrolls,
                    "total_cost_this_month": float(total_payroll_cost)
                },
                "benefits": {
                    "active_benefits": active_benefits,
                    "employees_with_benefits": employees_with_benefits
                },
                "period": {
                    "month": current_month,
                    "year": current_year
                }
            }
        })
        
    except Exception as e:
        return jsonify({
            "success": False,
            "error": f"Erro ao obter resumo RH: {str(e)}"
        }), 500