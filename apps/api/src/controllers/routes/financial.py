"""
Rotas para o sistema Financeiro Avançado
Contas a Pagar/Receber, Fluxo de Caixa, DRE, Conciliação, Orçamentos
"""

from datetime import datetime, timedelta
from decimal import Decimal
from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity, get_jwt
from sqlalchemy import desc, func, and_, or_, extract
from sqlalchemy.exc import SQLAlchemyError

from database import db
from models import (
    AccountsPayable, AccountsReceivable, CashFlow, IncomeStatement,
    BankReconciliation, Budget, Supplier, Customer, User
)
from utils.validators import validate_required_fields

financial_bp = Blueprint('financial', __name__)


# ================ CONTAS A PAGAR ================

@financial_bp.route('/accounts-payable', methods=['GET'])
@jwt_required()
def get_accounts_payable():
    """Listar contas a pagar"""
    try:
        # Filtros
        status = request.args.get('status')
        supplier_id = request.args.get('supplier_id')
        due_soon = request.args.get('due_soon', 'false').lower() == 'true'

        query = AccountsPayable.query

        if status:
            query = query.filter_by(status=status)
        if supplier_id:
            query = query.filter_by(supplier_id=supplier_id)
        if due_soon:
            # Vencendo nos próximos 7 dias
            next_week = datetime.utcnow().date() + timedelta(days=7)
            query = query.filter(
                AccountsPayable.due_date <= next_week,
                AccountsPayable.status == 'pending'
            )

        query = query.order_by(AccountsPayable.due_date)

        # Paginação
        page = int(request.args.get('page', 1))
        per_page = int(request.args.get('per_page', 20))
        pagination = query.paginate(page=page, per_page=per_page, error_out=False)

        # Totais
        total_pending = db.session.query(func.sum(AccountsPayable.amount)).filter_by(status='pending').scalar() or 0
        total_overdue = db.session.query(func.sum(AccountsPayable.amount)).filter(
            AccountsPayable.status == 'pending',
            AccountsPayable.due_date < datetime.utcnow().date()
        ).scalar() or 0

        return jsonify({
            'success': True,
            'accounts': [a.to_dict() for a in pagination.items],
            'total': pagination.total,
            'pages': pagination.pages,
            'current_page': page,
            'summary': {
                'total_pending': float(total_pending),
                'total_overdue': float(total_overdue)
            }
        }), 200
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500


@financial_bp.route('/accounts-payable', methods=['POST'])
@jwt_required()
def create_account_payable():
    """Criar conta a pagar"""
    try:
        user_id = get_jwt_identity()
        data = request.get_json()

        validation = validate_required_fields(data, ['supplier_id', 'description', 'amount', 'due_date'])
        if not validation['valid']:
            return jsonify({'success': False, 'error': validation['message']}), 400

        # Criar conta principal
        account = AccountsPayable(
            supplier_id=data['supplier_id'],
            purchase_order_id=data.get('purchase_order_id'),
            invoice_number=data.get('invoice_number'),
            description=data['description'],
            category=data.get('category', 'outros'),
            amount=Decimal(str(data['amount'])),
            due_date=datetime.fromisoformat(data['due_date']).date(),
            payment_terms=data.get('payment_terms'),
            installments=data.get('installments', 1),
            created_by=user_id,
            status='pending'
        )
        db.session.add(account)
        db.session.flush()

        # Se tem parcelas, criar as contas das parcelas
        if account.installments > 1:
            installment_amount = account.amount / account.installments
            for i in range(account.installments):
                installment_due_date = account.due_date + timedelta(days=30 * i)
                installment = AccountsPayable(
                    supplier_id=account.supplier_id,
                    parent_id=account.id,
                    invoice_number=f"{account.invoice_number}-{i+1}/{account.installments}" if account.invoice_number else None,
                    description=f"{account.description} - Parcela {i+1}/{account.installments}",
                    category=account.category,
                    amount=installment_amount,
                    due_date=installment_due_date,
                    installment_number=i+1,
                    total_installments=account.installments,
                    created_by=user_id,
                    status='pending'
                )
                db.session.add(installment)

        db.session.commit()

        return jsonify({
            'success': True,
            'message': 'Conta a pagar criada com sucesso',
            'account': account.to_dict()
        }), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'error': str(e)}), 500


@financial_bp.route('/accounts-payable/<account_id>/pay', methods=['POST'])
@jwt_required()
def pay_account_payable(account_id):
    """Registrar pagamento de conta a pagar"""
    try:
        user_id = get_jwt_identity()
        account = AccountsPayable.query.get(account_id)
        if not account:
            return jsonify({'success': False, 'error': 'Conta não encontrada'}), 404

        if account.status != 'pending':
            return jsonify({'success': False, 'error': 'Conta já está paga ou cancelada'}), 400

        data = request.get_json()

        account.status = 'paid'
        account.paid_date = datetime.fromisoformat(data.get('paid_date', datetime.utcnow().isoformat())).date()
        account.paid_amount = Decimal(str(data.get('paid_amount', account.amount)))
        account.payment_method = data.get('payment_method')
        account.payment_notes = data.get('notes')

        db.session.commit()

        return jsonify({
            'success': True,
            'message': 'Pagamento registrado com sucesso',
            'account': account.to_dict()
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'error': str(e)}), 500


# ================ CONTAS A RECEBER ================

@financial_bp.route('/accounts-receivable', methods=['GET'])
@jwt_required()
def get_accounts_receivable():
    """Listar contas a receber"""
    try:
        # Filtros
        status = request.args.get('status')
        customer_id = request.args.get('customer_id')
        due_soon = request.args.get('due_soon', 'false').lower() == 'true'

        query = AccountsReceivable.query

        if status:
            query = query.filter_by(status=status)
        if customer_id:
            query = query.filter_by(customer_id=customer_id)
        if due_soon:
            next_week = datetime.utcnow().date() + timedelta(days=7)
            query = query.filter(
                AccountsReceivable.due_date <= next_week,
                AccountsReceivable.status == 'pending'
            )

        query = query.order_by(AccountsReceivable.due_date)

        # Paginação
        page = int(request.args.get('page', 1))
        per_page = int(request.args.get('per_page', 20))
        pagination = query.paginate(page=page, per_page=per_page, error_out=False)

        # Totais
        total_pending = db.session.query(func.sum(AccountsReceivable.amount)).filter_by(status='pending').scalar() or 0
        total_overdue = db.session.query(func.sum(AccountsReceivable.amount)).filter(
            AccountsReceivable.status == 'pending',
            AccountsReceivable.due_date < datetime.utcnow().date()
        ).scalar() or 0

        return jsonify({
            'success': True,
            'accounts': [a.to_dict() for a in pagination.items],
            'total': pagination.total,
            'pages': pagination.pages,
            'current_page': page,
            'summary': {
                'total_pending': float(total_pending),
                'total_overdue': float(total_overdue)
            }
        }), 200
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500


@financial_bp.route('/accounts-receivable', methods=['POST'])
@jwt_required()
def create_account_receivable():
    """Criar conta a receber"""
    try:
        user_id = get_jwt_identity()
        data = request.get_json()

        validation = validate_required_fields(data, ['customer_id', 'description', 'amount', 'due_date'])
        if not validation['valid']:
            return jsonify({'success': False, 'error': validation['message']}), 400

        account = AccountsReceivable(
            customer_id=data['customer_id'],
            order_id=data.get('order_id'),
            invoice_number=data.get('invoice_number'),
            description=data['description'],
            category=data.get('category', 'vendas'),
            amount=Decimal(str(data['amount'])),
            due_date=datetime.fromisoformat(data['due_date']).date(),
            payment_terms=data.get('payment_terms'),
            installments=data.get('installments', 1),
            created_by=user_id,
            status='pending'
        )
        db.session.add(account)
        db.session.flush()

        # Criar parcelas se necessário
        if account.installments > 1:
            installment_amount = account.amount / account.installments
            for i in range(account.installments):
                installment_due_date = account.due_date + timedelta(days=30 * i)
                installment = AccountsReceivable(
                    customer_id=account.customer_id,
                    parent_id=account.id,
                    invoice_number=f"{account.invoice_number}-{i+1}/{account.installments}" if account.invoice_number else None,
                    description=f"{account.description} - Parcela {i+1}/{account.installments}",
                    category=account.category,
                    amount=installment_amount,
                    due_date=installment_due_date,
                    installment_number=i+1,
                    total_installments=account.installments,
                    created_by=user_id,
                    status='pending'
                )
                db.session.add(installment)

        db.session.commit()

        return jsonify({
            'success': True,
            'message': 'Conta a receber criada com sucesso',
            'account': account.to_dict()
        }), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'error': str(e)}), 500


@financial_bp.route('/accounts-receivable/<account_id>/receive', methods=['POST'])
@jwt_required()
def receive_account_receivable(account_id):
    """Registrar recebimento de conta a receber"""
    try:
        user_id = get_jwt_identity()
        account = AccountsReceivable.query.get(account_id)
        if not account:
            return jsonify({'success': False, 'error': 'Conta não encontrada'}), 404

        if account.status != 'pending':
            return jsonify({'success': False, 'error': 'Conta já está recebida ou cancelada'}), 400

        data = request.get_json()

        account.status = 'received'
        account.received_date = datetime.fromisoformat(data.get('received_date', datetime.utcnow().isoformat())).date()
        account.received_amount = Decimal(str(data.get('received_amount', account.amount)))
        account.payment_method = data.get('payment_method')
        account.payment_notes = data.get('notes')

        db.session.commit()

        return jsonify({
            'success': True,
            'message': 'Recebimento registrado com sucesso',
            'account': account.to_dict()
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'error': str(e)}), 500


# ================ FLUXO DE CAIXA ================

@financial_bp.route('/cash-flow', methods=['GET'])
@jwt_required()
def get_cash_flow():
    """Listar projeções de fluxo de caixa"""
    try:
        # Filtros
        start_date = request.args.get('start_date')
        end_date = request.args.get('end_date')

        query = CashFlow.query

        if start_date:
            query = query.filter(CashFlow.date >= datetime.fromisoformat(start_date).date())
        if end_date:
            query = query.filter(CashFlow.date <= datetime.fromisoformat(end_date).date())

        query = query.order_by(CashFlow.date)

        entries = query.all()

        return jsonify({
            'success': True,
            'cash_flow': [e.to_dict() for e in entries]
        }), 200
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500


@financial_bp.route('/cash-flow/calculate', methods=['POST'])
@jwt_required()
def calculate_cash_flow():
    """Calcular projeção de fluxo de caixa"""
    try:
        claims = get_jwt()
        if not claims.get('is_admin'):
            return jsonify({'success': False, 'error': 'Acesso negado'}), 403

        data = request.get_json()

        validation = validate_required_fields(data, ['start_date', 'end_date'])
        if not validation['valid']:
            return jsonify({'success': False, 'error': validation['message']}), 400

        start_date = datetime.fromisoformat(data['start_date']).date()
        end_date = datetime.fromisoformat(data['end_date']).date()

        # Buscar contas a receber e a pagar no período
        receivables = AccountsReceivable.query.filter(
            AccountsReceivable.due_date >= start_date,
            AccountsReceivable.due_date <= end_date,
            AccountsReceivable.status == 'pending'
        ).all()

        payables = AccountsPayable.query.filter(
            AccountsPayable.due_date >= start_date,
            AccountsPayable.due_date <= end_date,
            AccountsPayable.status == 'pending'
        ).all()

        # Calcular saldo inicial (simplificado)
        initial_balance = Decimal(str(data.get('initial_balance', 0)))

        # Agrupar por data
        cash_flow_by_date = {}

        # Processar recebimentos
        for rec in receivables:
            date_key = rec.due_date.isoformat()
            if date_key not in cash_flow_by_date:
                cash_flow_by_date[date_key] = {
                    'date': rec.due_date,
                    'inflow': Decimal('0'),
                    'outflow': Decimal('0')
                }
            cash_flow_by_date[date_key]['inflow'] += rec.amount

        # Processar pagamentos
        for pay in payables:
            date_key = pay.due_date.isoformat()
            if date_key not in cash_flow_by_date:
                cash_flow_by_date[date_key] = {
                    'date': pay.due_date,
                    'inflow': Decimal('0'),
                    'outflow': Decimal('0')
                }
            cash_flow_by_date[date_key]['outflow'] += pay.amount

        # Criar registros de fluxo de caixa
        balance = initial_balance
        created_entries = []

        for date_key in sorted(cash_flow_by_date.keys()):
            data_entry = cash_flow_by_date[date_key]
            net_flow = data_entry['inflow'] - data_entry['outflow']
            balance += net_flow

            # Verificar se já existe entrada para esta data
            existing = CashFlow.query.filter_by(date=data_entry['date']).first()

            if existing:
                existing.inflow = data_entry['inflow']
                existing.outflow = data_entry['outflow']
                existing.net_flow = net_flow
                existing.balance = balance
            else:
                entry = CashFlow(
                    date=data_entry['date'],
                    inflow=data_entry['inflow'],
                    outflow=data_entry['outflow'],
                    net_flow=net_flow,
                    balance=balance,
                    category='projection'
                )
                db.session.add(entry)
                created_entries.append(entry)

        db.session.commit()

        return jsonify({
            'success': True,
            'message': 'Fluxo de caixa calculado com sucesso',
            'entries_created': len(created_entries)
        }), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'error': str(e)}), 500


# ================ DRE (DEMONSTRAÇÃO DO RESULTADO) ================

@financial_bp.route('/income-statement', methods=['GET'])
@jwt_required()
def get_income_statements():
    """Listar DREs"""
    try:
        year = request.args.get('year')
        month = request.args.get('month')

        query = IncomeStatement.query

        if year:
            query = query.filter_by(year=int(year))
        if month:
            query = query.filter_by(month=int(month))

        query = query.order_by(desc(IncomeStatement.year), desc(IncomeStatement.month))

        statements = query.all()

        return jsonify({
            'success': True,
            'statements': [s.to_dict() for s in statements]
        }), 200
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500


@financial_bp.route('/income-statement/calculate', methods=['POST'])
@jwt_required()
def calculate_income_statement():
    """Calcular DRE"""
    try:
        claims = get_jwt()
        if not claims.get('is_admin'):
            return jsonify({'success': False, 'error': 'Acesso negado'}), 403

        data = request.get_json()

        validation = validate_required_fields(data, ['year', 'month'])
        if not validation['valid']:
            return jsonify({'success': False, 'error': validation['message']}), 400

        year = int(data['year'])
        month = int(data['month'])

        # Buscar ou criar DRE para o período
        statement = IncomeStatement.query.filter_by(year=year, month=month).first()
        if not statement:
            statement = IncomeStatement(year=year, month=month)
            db.session.add(statement)

        # Calcular receita bruta (vendas recebidas no período)
        gross_revenue = db.session.query(func.sum(AccountsReceivable.received_amount)).filter(
            extract('year', AccountsReceivable.received_date) == year,
            extract('month', AccountsReceivable.received_date) == month,
            AccountsReceivable.status == 'received'
        ).scalar() or Decimal('0')

        statement.gross_revenue = gross_revenue
        statement.net_revenue = gross_revenue  # Simplificado (sem deduções)

        # Calcular despesas (contas pagas no período)
        operating_expenses = db.session.query(func.sum(AccountsPayable.paid_amount)).filter(
            extract('year', AccountsPayable.paid_date) == year,
            extract('month', AccountsPayable.paid_date) == month,
            AccountsPayable.status == 'paid'
        ).scalar() or Decimal('0')

        statement.operating_expenses = operating_expenses
        statement.cost_of_goods_sold = operating_expenses * Decimal('0.5')  # Simplificado
        statement.gross_profit = statement.net_revenue - statement.cost_of_goods_sold
        statement.operating_profit = statement.gross_profit - (operating_expenses * Decimal('0.5'))
        statement.net_profit = statement.operating_profit

        db.session.commit()

        return jsonify({
            'success': True,
            'message': 'DRE calculado com sucesso',
            'statement': statement.to_dict()
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'error': str(e)}), 500


# ================ CONCILIAÇÃO BANCÁRIA ================

@financial_bp.route('/bank-reconciliation', methods=['GET'])
@jwt_required()
def get_bank_reconciliations():
    """Listar conciliações bancárias"""
    try:
        query = BankReconciliation.query.order_by(desc(BankReconciliation.reconciliation_date))

        # Paginação
        page = int(request.args.get('page', 1))
        per_page = int(request.args.get('per_page', 20))
        pagination = query.paginate(page=page, per_page=per_page, error_out=False)

        return jsonify({
            'success': True,
            'reconciliations': [r.to_dict() for r in pagination.items],
            'total': pagination.total,
            'pages': pagination.pages,
            'current_page': page
        }), 200
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500


@financial_bp.route('/bank-reconciliation', methods=['POST'])
@jwt_required()
def create_bank_reconciliation():
    """Criar conciliação bancária"""
    try:
        user_id = get_jwt_identity()
        data = request.get_json()

        validation = validate_required_fields(data, ['bank_account', 'reconciliation_date', 'statement_balance', 'book_balance'])
        if not validation['valid']:
            return jsonify({'success': False, 'error': validation['message']}), 400

        statement_balance = Decimal(str(data['statement_balance']))
        book_balance = Decimal(str(data['book_balance']))

        reconciliation = BankReconciliation(
            bank_account=data['bank_account'],
            reconciliation_date=datetime.fromisoformat(data['reconciliation_date']).date(),
            statement_balance=statement_balance,
            book_balance=book_balance,
            difference=statement_balance - book_balance,
            reconciled_items=data.get('reconciled_items'),
            outstanding_checks=Decimal(str(data.get('outstanding_checks', 0))),
            deposits_in_transit=Decimal(str(data.get('deposits_in_transit', 0))),
            notes=data.get('notes'),
            reconciled_by=user_id
        )

        # Marcar como conciliado se diferença é zero
        if reconciliation.difference == 0:
            reconciliation.is_reconciled = True

        db.session.add(reconciliation)
        db.session.commit()

        return jsonify({
            'success': True,
            'message': 'Conciliação bancária criada com sucesso',
            'reconciliation': reconciliation.to_dict()
        }), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'error': str(e)}), 500


# ================ ORÇAMENTOS ================

@financial_bp.route('/budgets', methods=['GET'])
@jwt_required()
def get_budgets():
    """Listar orçamentos"""
    try:
        year = request.args.get('year')
        category = request.args.get('category')

        query = Budget.query

        if year:
            query = query.filter_by(year=int(year))
        if category:
            query = query.filter_by(category=category)

        query = query.order_by(desc(Budget.year), Budget.month)

        budgets = query.all()

        return jsonify({
            'success': True,
            'budgets': [b.to_dict() for b in budgets]
        }), 200
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500


@financial_bp.route('/budgets', methods=['POST'])
@jwt_required()
def create_budget():
    """Criar orçamento (admin)"""
    try:
        claims = get_jwt()
        if not claims.get('is_admin'):
            return jsonify({'success': False, 'error': 'Acesso negado'}), 403

        user_id = get_jwt_identity()
        data = request.get_json()

        validation = validate_required_fields(data, ['year', 'month', 'category', 'budgeted_amount'])
        if not validation['valid']:
            return jsonify({'success': False, 'error': validation['message']}), 400

        budget = Budget(
            year=int(data['year']),
            month=int(data['month']),
            category=data['category'],
            budgeted_amount=Decimal(str(data['budgeted_amount'])),
            actual_amount=Decimal('0'),
            notes=data.get('notes'),
            created_by=user_id
        )
        db.session.add(budget)
        db.session.commit()

        return jsonify({
            'success': True,
            'message': 'Orçamento criado com sucesso',
            'budget': budget.to_dict()
        }), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'error': str(e)}), 500


@financial_bp.route('/budgets/<budget_id>/update-actual', methods=['PUT'])
@jwt_required()
def update_budget_actual(budget_id):
    """Atualizar valor real do orçamento"""
    try:
        claims = get_jwt()
        if not claims.get('is_admin'):
            return jsonify({'success': False, 'error': 'Acesso negado'}), 403

        budget = Budget.query.get(budget_id)
        if not budget:
            return jsonify({'success': False, 'error': 'Orçamento não encontrado'}), 404

        data = request.get_json()

        budget.actual_amount = Decimal(str(data['actual_amount']))
        budget.variance = budget.actual_amount - budget.budgeted_amount
        budget.variance_percent = (budget.variance / budget.budgeted_amount * 100) if budget.budgeted_amount > 0 else Decimal('0')

        db.session.commit()

        return jsonify({
            'success': True,
            'message': 'Orçamento atualizado com sucesso',
            'budget': budget.to_dict()
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'error': str(e)}), 500
