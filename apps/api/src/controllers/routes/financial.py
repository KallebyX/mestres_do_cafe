from datetime import datetime, timedelta
from decimal import Decimal

from flask import Blueprint, jsonify, request
from sqlalchemy import desc, func, and_

from database import db
from models.financial import FinancialAccount, FinancialTransaction

financial_bp = Blueprint("financial", __name__, url_prefix="/api/financial")


@financial_bp.route("/", methods=["GET"])
def financial_home():
    """Informações sobre o sistema financeiro"""
    return jsonify({
        "message": "Sistema Financeiro - Mestres do Café",
        "features": {
            "accounts": "Gestão de contas",
            "transactions": "Transações financeiras",
            "reports": "Relatórios e análises",
            "transfers": "Transferências entre contas",
            "categories": "Categorização de gastos"
        },
        "endpoints": {
            "accounts": "/accounts",
            "transactions": "/transactions",
            "reports": "/reports",
            "transfer": "/transfer",
            "stats": "/stats"
        }
    })


@financial_bp.route("/accounts", methods=["GET"])
def get_accounts():
    """Listar contas financeiras"""
    try:
        accounts = FinancialAccount.query.filter_by(
            is_active=True
        ).order_by(FinancialAccount.name).all()
        
        return jsonify({
            "accounts": [account.to_dict() for account in accounts]
        })
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@financial_bp.route("/accounts", methods=["POST"])
def create_account():
    """Criar nova conta financeira"""
    try:
        data = request.get_json()
        required_fields = ["name", "account_type", "currency"]
        
        for field in required_fields:
            if field not in data:
                return jsonify({"error": f"Campo {field} obrigatório"}), 400
        
        account = FinancialAccount(
            name=data["name"],
            account_type=data["account_type"],
            currency=data["currency"],
            balance=Decimal(str(data.get("balance", 0))),
            description=data.get("description"),
            is_active=True
        )
        
        db.session.add(account)
        db.session.commit()
        
        return jsonify({
            "message": "Conta criada com sucesso",
            "account": account.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500


@financial_bp.route("/accounts/<account_id>", methods=["PUT"])
def update_account(account_id):
    """Atualizar conta financeira"""
    try:
        account = FinancialAccount.query.get_or_404(account_id)
        data = request.get_json()
        
        # Campos permitidos para atualização
        allowed_fields = ["name", "description", "is_active"]
        
        for field in allowed_fields:
            if field in data:
                setattr(account, field, data[field])
        
        account.updated_at = datetime.utcnow()
        db.session.commit()
        
        return jsonify({
            "message": "Conta atualizada com sucesso",
            "account": account.to_dict()
        })
        
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500


@financial_bp.route("/transactions", methods=["GET"])
def get_transactions():
    """Listar transações financeiras"""
    try:
        page = request.args.get("page", 1, type=int)
        per_page = request.args.get("per_page", 20, type=int)
        account_id = request.args.get("account_id")
        transaction_type = request.args.get("type")
        category = request.args.get("category")
        start_date = request.args.get("start_date")
        end_date = request.args.get("end_date")
        
        query = FinancialTransaction.query
        
        # Filtros
        if account_id:
            query = query.filter(FinancialTransaction.account_id == account_id)
        
        if transaction_type:
            query = query.filter(FinancialTransaction.type == transaction_type)
        
        if category:
            query = query.filter(FinancialTransaction.category == category)
        
        if start_date:
            start = datetime.fromisoformat(start_date).date()
            query = query.filter(FinancialTransaction.transaction_date >= start)
        
        if end_date:
            end = datetime.fromisoformat(end_date).date()
            query = query.filter(FinancialTransaction.transaction_date <= end)
        
        transactions = query.order_by(
            desc(FinancialTransaction.transaction_date),
            desc(FinancialTransaction.created_at)
        ).paginate(
            page=page,
            per_page=per_page,
            error_out=False
        )
        
        return jsonify({
            "transactions": [trans.to_dict() for trans in transactions.items],
            "pagination": {
                "page": page,
                "per_page": per_page,
                "total": transactions.total,
                "pages": transactions.pages
            }
        })
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@financial_bp.route("/transactions", methods=["POST"])
def create_transaction():
    """Criar nova transação financeira"""
    try:
        data = request.get_json()
        required_fields = ["account_id", "type", "amount", "description"]
        
        for field in required_fields:
            if field not in data:
                return jsonify({"error": f"Campo {field} obrigatório"}), 400
        
        # Verificar se conta existe
        account = FinancialAccount.query.get(data["account_id"])
        if not account:
            return jsonify({"error": "Conta não encontrada"}), 404
        
        # Validar tipo de transação
        if data["type"] not in ["income", "expense", "transfer"]:
            return jsonify({"error": "Tipo de transação inválido"}), 400
        
        amount = Decimal(str(data["amount"]))
        
        # Validar se há saldo suficiente para despesas
        if data["type"] == "expense" and account.balance < amount:
            return jsonify({"error": "Saldo insuficiente"}), 400
        
        transaction = FinancialTransaction(
            account_id=data["account_id"],
            type=data["type"],
            amount=amount,
            description=data["description"],
            category=data.get("category"),
            transaction_date=(
                datetime.fromisoformat(data["transaction_date"]).date()
                if data.get("transaction_date") else datetime.utcnow().date()
            ),
            reference=data.get("reference"),
            metadata=data.get("metadata", {})
        )
        
        db.session.add(transaction)
        
        # Atualizar saldo da conta
        if data["type"] == "income":
            account.balance += amount
        elif data["type"] == "expense":
            account.balance -= amount
        
        account.updated_at = datetime.utcnow()
        
        db.session.commit()
        
        return jsonify({
            "message": "Transação criada com sucesso",
            "transaction": transaction.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500


@financial_bp.route("/transactions/<transaction_id>", methods=["PUT"])
def update_transaction(transaction_id):
    """Atualizar transação financeira"""
    try:
        transaction = FinancialTransaction.query.get_or_404(transaction_id)
        data = request.get_json()
        
        # Salvar valores antigos para reverter saldo
        old_amount = transaction.amount
        old_type = transaction.type
        account = FinancialAccount.query.get(transaction.account_id)
        
        # Reverter efeito da transação antiga no saldo
        if old_type == "income":
            account.balance -= old_amount
        elif old_type == "expense":
            account.balance += old_amount
        
        # Atualizar campos permitidos
        allowed_fields = [
            "description", "category", "amount", "transaction_date",
            "reference", "metadata"
        ]
        
        for field in allowed_fields:
            if field in data:
                if field == "amount":
                    setattr(transaction, field, Decimal(str(data[field])))
                elif field == "transaction_date":
                    setattr(
                        transaction, field,
                        datetime.fromisoformat(data[field]).date()
                    )
                else:
                    setattr(transaction, field, data[field])
        
        # Aplicar novo efeito no saldo
        if transaction.type == "income":
            account.balance += transaction.amount
        elif transaction.type == "expense":
            account.balance -= transaction.amount
        
        # Validar saldo
        if account.balance < 0:
            return jsonify({"error": "Saldo insuficiente"}), 400
        
        transaction.updated_at = datetime.utcnow()
        account.updated_at = datetime.utcnow()
        
        db.session.commit()
        
        return jsonify({
            "message": "Transação atualizada com sucesso",
            "transaction": transaction.to_dict()
        })
        
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500


@financial_bp.route("/transactions/<transaction_id>", methods=["DELETE"])
def delete_transaction(transaction_id):
    """Deletar transação financeira"""
    try:
        transaction = FinancialTransaction.query.get_or_404(transaction_id)
        account = FinancialAccount.query.get(transaction.account_id)
        
        # Reverter efeito da transação no saldo
        if transaction.type == "income":
            account.balance -= transaction.amount
        elif transaction.type == "expense":
            account.balance += transaction.amount
        
        # Validar saldo
        if account.balance < 0:
            return jsonify({
                "error": "Não é possível deletar: saldo ficaria negativo"
            }), 400
        
        account.updated_at = datetime.utcnow()
        db.session.delete(transaction)
        db.session.commit()
        
        return jsonify({"message": "Transação deletada com sucesso"})
        
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500


@financial_bp.route("/reports/balance", methods=["GET"])
def get_balance_report():
    """Relatório de saldo por conta"""
    try:
        accounts = FinancialAccount.query.filter_by(is_active=True).all()
        
        balance_report = []
        total_balance = Decimal("0")
        
        for account in accounts:
            account_data = account.to_dict()
            balance_report.append(account_data)
            total_balance += account.balance
        
        return jsonify({
            "balance_report": balance_report,
            "total_balance": float(total_balance)
        })
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@financial_bp.route("/reports/cash-flow", methods=["GET"])
def get_cash_flow_report():
    """Relatório de fluxo de caixa"""
    try:
        start_date = request.args.get("start_date")
        end_date = request.args.get("end_date")
        account_id = request.args.get("account_id")
        
        # Definir período padrão (último mês)
        if not start_date:
            start_date = (datetime.utcnow() - timedelta(days=30)).date()
        else:
            start_date = datetime.fromisoformat(start_date).date()
        
        if not end_date:
            end_date = datetime.utcnow().date()
        else:
            end_date = datetime.fromisoformat(end_date).date()
        
        query = FinancialTransaction.query.filter(
            and_(
                FinancialTransaction.transaction_date >= start_date,
                FinancialTransaction.transaction_date <= end_date
            )
        )
        
        if account_id:
            query = query.filter(FinancialTransaction.account_id == account_id)
        
        transactions = query.all()
        
        # Calcular totais
        total_income = sum(
            t.amount for t in transactions if t.type == "income"
        )
        total_expenses = sum(
            t.amount for t in transactions if t.type == "expense"
        )
        net_flow = total_income - total_expenses
        
        # Agrupar por categoria
        income_by_category = {}
        expenses_by_category = {}
        
        for transaction in transactions:
            category = transaction.category or "Outros"
            
            if transaction.type == "income":
                income_by_category[category] = income_by_category.get(category, Decimal("0")) + transaction.amount
            elif transaction.type == "expense":
                expenses_by_category[category] = expenses_by_category.get(category, Decimal("0")) + transaction.amount
        
        return jsonify({
            "cash_flow_report": {
                "period": {
                    "start_date": start_date.isoformat(),
                    "end_date": end_date.isoformat()
                },
                "summary": {
                    "total_income": float(total_income),
                    "total_expenses": float(total_expenses),
                    "net_flow": float(net_flow)
                },
                "income_by_category": {
                    cat: float(amount) for cat, amount in income_by_category.items()
                },
                "expenses_by_category": {
                    cat: float(amount) for cat, amount in expenses_by_category.items()
                }
            }
        })
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@financial_bp.route("/reports/monthly", methods=["GET"])
def get_monthly_report():
    """Relatório mensal"""
    try:
        year = request.args.get("year", datetime.utcnow().year, type=int)
        month = request.args.get("month", datetime.utcnow().month, type=int)
        
        # Definir período do mês
        start_date = datetime(year, month, 1).date()
        if month == 12:
            end_date = datetime(year + 1, 1, 1).date() - timedelta(days=1)
        else:
            end_date = datetime(year, month + 1, 1).date() - timedelta(days=1)
        
        transactions = FinancialTransaction.query.filter(
            and_(
                FinancialTransaction.transaction_date >= start_date,
                FinancialTransaction.transaction_date <= end_date
            )
        ).all()
        
        # Calcular totais
        total_income = sum(
            t.amount for t in transactions if t.type == "income"
        )
        total_expenses = sum(
            t.amount for t in transactions if t.type == "expense"
        )
        
        # Agrupar por dia
        daily_summary = {}
        for transaction in transactions:
            day = transaction.transaction_date.day
            if day not in daily_summary:
                daily_summary[day] = {"income": Decimal("0"), "expenses": Decimal("0")}
            
            if transaction.type == "income":
                daily_summary[day]["income"] += transaction.amount
            elif transaction.type == "expense":
                daily_summary[day]["expenses"] += transaction.amount
        
        return jsonify({
            "monthly_report": {
                "period": {
                    "year": year,
                    "month": month,
                    "start_date": start_date.isoformat(),
                    "end_date": end_date.isoformat()
                },
                "summary": {
                    "total_income": float(total_income),
                    "total_expenses": float(total_expenses),
                    "net_result": float(total_income - total_expenses)
                },
                "daily_summary": {
                    day: {
                        "income": float(data["income"]),
                        "expenses": float(data["expenses"]),
                        "net": float(data["income"] - data["expenses"])
                    }
                    for day, data in daily_summary.items()
                }
            }
        })
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@financial_bp.route("/categories", methods=["GET"])
def get_categories():
    """Listar categorias de transação"""
    try:
        # Buscar categorias únicas das transações
        categories = db.session.query(
            FinancialTransaction.category
        ).distinct().filter(
            FinancialTransaction.category.isnot(None)
        ).all()
        
        category_list = [cat[0] for cat in categories if cat[0]]
        
        return jsonify({"categories": sorted(category_list)})
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@financial_bp.route("/transfer", methods=["POST"])
def transfer_between_accounts():
    """Transferir valor entre contas"""
    try:
        data = request.get_json()
        required_fields = ["from_account_id", "to_account_id", "amount", "description"]
        
        for field in required_fields:
            if field not in data:
                return jsonify({"error": f"Campo {field} obrigatório"}), 400
        
        from_account = FinancialAccount.query.get(data["from_account_id"])
        to_account = FinancialAccount.query.get(data["to_account_id"])
        
        if not from_account or not to_account:
            return jsonify({"error": "Conta não encontrada"}), 404
        
        amount = Decimal(str(data["amount"]))
        
        # Validar saldo
        if from_account.balance < amount:
            return jsonify({"error": "Saldo insuficiente"}), 400
        
        # Criar transação de saída
        outgoing_transaction = FinancialTransaction(
            account_id=data["from_account_id"],
            type="expense",
            amount=amount,
            description=f"Transferência para {to_account.name}: {data['description']}",
            category="Transferência",
            transaction_date=datetime.utcnow().date(),
            reference=data.get("reference"),
            metadata=data.get("metadata", {})
        )
        
        # Criar transação de entrada
        incoming_transaction = FinancialTransaction(
            account_id=data["to_account_id"],
            type="income",
            amount=amount,
            description=f"Transferência de {from_account.name}: {data['description']}",
            category="Transferência",
            transaction_date=datetime.utcnow().date(),
            reference=data.get("reference"),
            metadata=data.get("metadata", {})
        )
        
        # Atualizar saldos
        from_account.balance -= amount
        to_account.balance += amount
        
        from_account.updated_at = datetime.utcnow()
        to_account.updated_at = datetime.utcnow()
        
        db.session.add(outgoing_transaction)
        db.session.add(incoming_transaction)
        db.session.commit()
        
        return jsonify({
            "message": "Transferência realizada com sucesso",
            "outgoing_transaction": outgoing_transaction.to_dict(),
            "incoming_transaction": incoming_transaction.to_dict()
        })
        
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500


@financial_bp.route("/stats", methods=["GET"])
def get_financial_stats():
    """Estatísticas financeiras"""
    try:
        # Saldo total
        total_balance = db.session.query(
            func.sum(FinancialAccount.balance)
        ).filter(FinancialAccount.is_active.is_(True)).scalar() or Decimal("0")
        
        # Transações no mês atual
        current_month_start = datetime.utcnow().replace(day=1).date()
        
        monthly_income = db.session.query(
            func.sum(FinancialTransaction.amount)
        ).filter(
            and_(
                FinancialTransaction.type == "income",
                FinancialTransaction.transaction_date >= current_month_start
            )
        ).scalar() or Decimal("0")
        
        monthly_expenses = db.session.query(
            func.sum(FinancialTransaction.amount)
        ).filter(
            and_(
                FinancialTransaction.type == "expense",
                FinancialTransaction.transaction_date >= current_month_start
            )
        ).scalar() or Decimal("0")
        
        # Número de contas ativas
        active_accounts = FinancialAccount.query.filter_by(
            is_active=True
        ).count()
        
        # Total de transações
        total_transactions = FinancialTransaction.query.count()
        
        return jsonify({
            "financial_stats": {
                "total_balance": float(total_balance),
                "monthly_income": float(monthly_income),
                "monthly_expenses": float(monthly_expenses),
                "monthly_net": float(monthly_income - monthly_expenses),
                "active_accounts": active_accounts,
                "total_transactions": total_transactions
            }
        })
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500