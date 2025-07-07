from flask import Blueprint, request, jsonify
from src.models.database import (
    db, FinancialAccount, FinancialTransaction, Order, Customer, User
)
from sqlalchemy import func, and_, or_
from datetime import datetime, timedelta
import calendar

financial_bp = Blueprint('financial', __name__)

# ===========================================
# ENDPOINTS DE CONTAS FINANCEIRAS
# ===========================================

@financial_bp.route('/accounts', methods=['GET'])
def get_accounts():
    try:
        accounts = FinancialAccount.query.filter_by(is_active=True).all()
        
        return jsonify({
            'accounts': [{
                'id': account.id,
                'name': account.name,
                'type': account.type,
                'balance': float(account.balance),
                'created_at': account.created_at.isoformat()
            } for account in accounts]
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@financial_bp.route('/accounts', methods=['POST'])
def create_account():
    try:
        data = request.get_json()
        
        account = FinancialAccount(
            name=data.get('name'),
            type=data.get('type'),
            balance=data.get('balance', 0.00)
        )
        
        db.session.add(account)
        db.session.commit()
        
        return jsonify({
            'message': 'Conta criada com sucesso',
            'account_id': account.id
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

# ===========================================
# ENDPOINTS DE TRANSAÇÕES FINANCEIRAS
# ===========================================

@financial_bp.route('/transactions', methods=['GET'])
def get_transactions():
    try:
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 20, type=int)
        account_id = request.args.get('account_id')
        transaction_type = request.args.get('type')
        status = request.args.get('status')
        start_date = request.args.get('start_date')
        end_date = request.args.get('end_date')
        
        query = FinancialTransaction.query
        
        # Filtros
        if account_id:
            query = query.filter(FinancialTransaction.account_id == account_id)
        if transaction_type:
            query = query.filter(FinancialTransaction.type == transaction_type)
        if status:
            query = query.filter(FinancialTransaction.status == status)
        if start_date:
            start = datetime.fromisoformat(start_date)
            query = query.filter(FinancialTransaction.transaction_date >= start)
        if end_date:
            end = datetime.fromisoformat(end_date)
            query = query.filter(FinancialTransaction.transaction_date <= end)
        
        transactions = query.order_by(FinancialTransaction.created_at.desc())\
                           .paginate(page=page, per_page=per_page, error_out=False)
        
        return jsonify({
            'transactions': [{
                'id': trans.id,
                'account_name': trans.account.name,
                'type': trans.type,
                'category': trans.category,
                'amount': float(trans.amount),
                'description': trans.description,
                'status': trans.status,
                'transaction_date': trans.transaction_date.isoformat(),
                'due_date': trans.due_date.isoformat() if trans.due_date else None,
                'paid_date': trans.paid_date.isoformat() if trans.paid_date else None,
                'customer_name': trans.customer.name if trans.customer else None,
                'order_id': trans.order_id,
                'created_at': trans.created_at.isoformat()
            } for trans in transactions.items],
            'pagination': {
                'page': transactions.page,
                'pages': transactions.pages,
                'total': transactions.total
            }
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@financial_bp.route('/transactions', methods=['POST'])
def create_transaction():
    try:
        data = request.get_json()
        
        # Verificar se a conta existe
        account = FinancialAccount.query.get(data.get('account_id'))
        if not account:
            return jsonify({'error': 'Conta não encontrada'}), 404
        
        transaction = FinancialTransaction(
            account_id=data.get('account_id'),
            type=data.get('type'),
            category=data.get('category'),
            amount=data.get('amount'),
            description=data.get('description'),
            customer_id=data.get('customer_id'),
            order_id=data.get('order_id'),
            transaction_date=datetime.fromisoformat(data.get('transaction_date', datetime.utcnow().isoformat())),
            due_date=datetime.fromisoformat(data.get('due_date')) if data.get('due_date') else None,
            status=data.get('status', 'pending')
        )
        
        db.session.add(transaction)
        
        # Atualizar saldo da conta se a transação for paga
        if transaction.status == 'paid':
            if transaction.type == 'income':
                account.balance += transaction.amount
            elif transaction.type == 'expense':
                account.balance -= transaction.amount
        
        db.session.commit()
        
        return jsonify({
            'message': 'Transação criada com sucesso',
            'transaction_id': transaction.id
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@financial_bp.route('/transactions/<transaction_id>/pay', methods=['POST'])
def pay_transaction(transaction_id):
    try:
        transaction = FinancialTransaction.query.get(transaction_id)
        if not transaction:
            return jsonify({'error': 'Transação não encontrada'}), 404
        
        if transaction.status == 'paid':
            return jsonify({'error': 'Transação já foi paga'}), 400
        
        # Atualizar status e data de pagamento
        transaction.status = 'paid'
        transaction.paid_date = datetime.utcnow()
        
        # Atualizar saldo da conta
        account = transaction.account
        if transaction.type == 'income':
            account.balance += transaction.amount
        elif transaction.type == 'expense':
            account.balance -= transaction.amount
        
        db.session.commit()
        
        return jsonify({
            'message': 'Transação paga com sucesso',
            'new_balance': float(account.balance)
        })
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

# ===========================================
# ENDPOINTS DE RELATÓRIOS FINANCEIROS
# ===========================================

@financial_bp.route('/reports/cash-flow', methods=['GET'])
def get_cash_flow_report():
    try:
        days = request.args.get('days', 30, type=int)
        start_date = datetime.utcnow() - timedelta(days=days)
        
        # Receitas por dia
        daily_income = db.session.query(
            func.date(FinancialTransaction.transaction_date).label('date'),
            func.sum(FinancialTransaction.amount).label('income')
        ).filter(
            FinancialTransaction.type == 'income',
            FinancialTransaction.status == 'paid',
            FinancialTransaction.transaction_date >= start_date
        ).group_by(func.date(FinancialTransaction.transaction_date)).all()
        
        # Despesas por dia
        daily_expenses = db.session.query(
            func.date(FinancialTransaction.transaction_date).label('date'),
            func.sum(FinancialTransaction.amount).label('expenses')
        ).filter(
            FinancialTransaction.type == 'expense',
            FinancialTransaction.status == 'paid',
            FinancialTransaction.transaction_date >= start_date
        ).group_by(func.date(FinancialTransaction.transaction_date)).all()
        
        return jsonify({
            'cash_flow': {
                'daily_income': [{
                    'date': income.date.isoformat(),
                    'amount': float(income.income)
                } for income in daily_income],
                'daily_expenses': [{
                    'date': expense.date.isoformat(),
                    'amount': float(expense.expenses)
                } for expense in daily_expenses]
            }
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@financial_bp.route('/reports/profit-loss', methods=['GET'])
def get_profit_loss_report():
    try:
        year = request.args.get('year', datetime.utcnow().year, type=int)
        month = request.args.get('month', datetime.utcnow().month, type=int)
        
        # Primeiro e último dia do mês
        start_date = datetime(year, month, 1)
        last_day = calendar.monthrange(year, month)[1]
        end_date = datetime(year, month, last_day, 23, 59, 59)
        
        # Receitas do mês
        total_income = db.session.query(func.sum(FinancialTransaction.amount))\
                                 .filter(
                                     FinancialTransaction.type == 'income',
                                     FinancialTransaction.status == 'paid',
                                     FinancialTransaction.transaction_date >= start_date,
                                     FinancialTransaction.transaction_date <= end_date
                                 ).scalar() or 0
        
        # Despesas do mês
        total_expenses = db.session.query(func.sum(FinancialTransaction.amount))\
                                   .filter(
                                       FinancialTransaction.type == 'expense',
                                       FinancialTransaction.status == 'paid',
                                       FinancialTransaction.transaction_date >= start_date,
                                       FinancialTransaction.transaction_date <= end_date
                                   ).scalar() or 0
        
        # Receitas por categoria
        income_by_category = db.session.query(
            FinancialTransaction.category,
            func.sum(FinancialTransaction.amount)
        ).filter(
            FinancialTransaction.type == 'income',
            FinancialTransaction.status == 'paid',
            FinancialTransaction.transaction_date >= start_date,
            FinancialTransaction.transaction_date <= end_date
        ).group_by(FinancialTransaction.category).all()
        
        # Despesas por categoria
        expenses_by_category = db.session.query(
            FinancialTransaction.category,
            func.sum(FinancialTransaction.amount)
        ).filter(
            FinancialTransaction.type == 'expense',
            FinancialTransaction.status == 'paid',
            FinancialTransaction.transaction_date >= start_date,
            FinancialTransaction.transaction_date <= end_date
        ).group_by(FinancialTransaction.category).all()
        
        profit = total_income - total_expenses
        
        return jsonify({
            'profit_loss': {
                'period': f'{year}-{month:02d}',
                'total_income': float(total_income),
                'total_expenses': float(total_expenses),
                'profit': float(profit),
                'profit_margin': (profit / total_income * 100) if total_income > 0 else 0,
                'income_by_category': {
                    category or 'Não categorizado': float(amount) 
                    for category, amount in income_by_category
                },
                'expenses_by_category': {
                    category or 'Não categorizado': float(amount) 
                    for category, amount in expenses_by_category
                }
            }
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@financial_bp.route('/reports/accounts-receivable', methods=['GET'])
def get_accounts_receivable():
    try:
        # Contas a receber (receitas pendentes)
        receivables = FinancialTransaction.query.filter(
            FinancialTransaction.type == 'income',
            FinancialTransaction.status.in_(['pending', 'overdue'])
        ).order_by(FinancialTransaction.due_date.asc()).all()
        
        # Calcular total
        total_receivable = sum(float(trans.amount) for trans in receivables)
        
        # Agrupar por status de vencimento
        today = datetime.utcnow().date()
        current = []
        overdue = []
        
        for trans in receivables:
            trans_data = {
                'id': trans.id,
                'customer_name': trans.customer.name if trans.customer else 'N/A',
                'description': trans.description,
                'amount': float(trans.amount),
                'due_date': trans.due_date.isoformat() if trans.due_date else None,
                'days_overdue': (today - trans.due_date.date()).days if trans.due_date and trans.due_date.date() < today else 0
            }
            
            if trans.due_date and trans.due_date.date() < today:
                overdue.append(trans_data)
            else:
                current.append(trans_data)
        
        return jsonify({
            'accounts_receivable': {
                'total_amount': total_receivable,
                'total_count': len(receivables),
                'current': current,
                'overdue': overdue,
                'overdue_amount': sum(t['amount'] for t in overdue)
            }
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@financial_bp.route('/reports/accounts-payable', methods=['GET'])
def get_accounts_payable():
    try:
        # Contas a pagar (despesas pendentes)
        payables = FinancialTransaction.query.filter(
            FinancialTransaction.type == 'expense',
            FinancialTransaction.status.in_(['pending', 'overdue'])
        ).order_by(FinancialTransaction.due_date.asc()).all()
        
        # Calcular total
        total_payable = sum(float(trans.amount) for trans in payables)
        
        # Agrupar por status de vencimento
        today = datetime.utcnow().date()
        current = []
        overdue = []
        
        for trans in payables:
            trans_data = {
                'id': trans.id,
                'description': trans.description,
                'amount': float(trans.amount),
                'due_date': trans.due_date.isoformat() if trans.due_date else None,
                'days_overdue': (today - trans.due_date.date()).days if trans.due_date and trans.due_date.date() < today else 0
            }
            
            if trans.due_date and trans.due_date.date() < today:
                overdue.append(trans_data)
            else:
                current.append(trans_data)
        
        return jsonify({
            'accounts_payable': {
                'total_amount': total_payable,
                'total_count': len(payables),
                'current': current,
                'overdue': overdue,
                'overdue_amount': sum(t['amount'] for t in overdue)
            }
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# ===========================================
# ENDPOINTS DE DASHBOARD FINANCEIRO
# ===========================================

@financial_bp.route('/dashboard', methods=['GET'])
def get_financial_dashboard():
    try:
        # Período (últimos 30 dias por padrão)
        days = request.args.get('days', 30, type=int)
        start_date = datetime.utcnow() - timedelta(days=days)
        
        # Saldo total das contas
        total_balance = db.session.query(func.sum(FinancialAccount.balance))\
                                  .filter(FinancialAccount.is_active == True).scalar() or 0
        
        # Receitas do período
        period_income = db.session.query(func.sum(FinancialTransaction.amount))\
                                  .filter(
                                      FinancialTransaction.type == 'income',
                                      FinancialTransaction.status == 'paid',
                                      FinancialTransaction.transaction_date >= start_date
                                  ).scalar() or 0
        
        # Despesas do período
        period_expenses = db.session.query(func.sum(FinancialTransaction.amount))\
                                    .filter(
                                        FinancialTransaction.type == 'expense',
                                        FinancialTransaction.status == 'paid',
                                        FinancialTransaction.transaction_date >= start_date
                                    ).scalar() or 0
        
        # Contas a receber
        total_receivable = db.session.query(func.sum(FinancialTransaction.amount))\
                                     .filter(
                                         FinancialTransaction.type == 'income',
                                         FinancialTransaction.status.in_(['pending', 'overdue'])
                                     ).scalar() or 0
        
        # Contas a pagar
        total_payable = db.session.query(func.sum(FinancialTransaction.amount))\
                                  .filter(
                                      FinancialTransaction.type == 'expense',
                                      FinancialTransaction.status.in_(['pending', 'overdue'])
                                  ).scalar() or 0
        
        # Lucro do período
        period_profit = period_income - period_expenses
        
        return jsonify({
            'dashboard': {
                'total_balance': float(total_balance),
                'period_income': float(period_income),
                'period_expenses': float(period_expenses),
                'period_profit': float(period_profit),
                'total_receivable': float(total_receivable),
                'total_payable': float(total_payable),
                'net_worth': float(total_balance + total_receivable - total_payable),
                'profit_margin': (period_profit / period_income * 100) if period_income > 0 else 0
            }
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500 