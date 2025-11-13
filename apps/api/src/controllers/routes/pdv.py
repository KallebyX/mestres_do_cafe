"""
Rotas para o sistema de PDV (Ponto de Venda)
"""

from datetime import datetime, timedelta
from decimal import Decimal
from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity, get_jwt
from sqlalchemy import desc, func, and_
from sqlalchemy.exc import SQLAlchemyError

from database import db
from models import (
    CashRegister, CashSession, CashMovement, Sale, SaleItem,
    Product, User, Customer
)
from utils.validators import validate_required_fields
import secrets

pdv_bp = Blueprint('pdv', __name__)


# ================ CAIXAS (REGISTRADORES) ================

@pdv_bp.route('/cash-registers', methods=['GET'])
@jwt_required()
def get_cash_registers():
    """Listar caixas/terminais"""
    try:
        registers = CashRegister.query.filter_by(is_active=True).all()
        return jsonify({
            'success': True,
            'registers': [r.to_dict() for r in registers]
        }), 200
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500


@pdv_bp.route('/cash-registers', methods=['POST'])
@jwt_required()
def create_cash_register():
    """Criar novo caixa (admin)"""
    try:
        claims = get_jwt()
        if not claims.get('is_admin'):
            return jsonify({'success': False, 'error': 'Acesso negado'}), 403

        data = request.get_json()
        validation = validate_required_fields(data, ['name', 'location'])
        if not validation['valid']:
            return jsonify({'success': False, 'error': validation['message']}), 400

        register = CashRegister(
            name=data['name'],
            location=data['location'],
            description=data.get('description'),
            terminal_id=data.get('terminal_id'),
            printer_config=data.get('printer_config'),
            is_active=data.get('is_active', True)
        )
        db.session.add(register)
        db.session.commit()

        return jsonify({'success': True, 'register': register.to_dict()}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'error': str(e)}), 500


# ================ SESSÕES DE CAIXA ================

@pdv_bp.route('/sessions/open', methods=['POST'])
@jwt_required()
def open_session():
    """Abrir sessão de caixa"""
    try:
        user_id = get_jwt_identity()
        data = request.get_json()

        validation = validate_required_fields(data, ['cash_register_id', 'opening_balance'])
        if not validation['valid']:
            return jsonify({'success': False, 'error': validation['message']}), 400

        # Verificar se já existe sessão aberta para este caixa
        existing_session = CashSession.query.filter_by(
            cash_register_id=data['cash_register_id'],
            status='open'
        ).first()

        if existing_session:
            return jsonify({
                'success': False,
                'error': 'Já existe uma sessão aberta para este caixa'
            }), 400

        # Criar nova sessão
        session = CashSession(
            cash_register_id=data['cash_register_id'],
            user_id=user_id,
            opening_balance=Decimal(str(data['opening_balance'])),
            expected_balance=Decimal(str(data['opening_balance'])),
            status='open'
        )
        db.session.add(session)
        db.session.commit()

        return jsonify({
            'success': True,
            'message': 'Sessão de caixa aberta com sucesso',
            'session': session.to_dict()
        }), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'error': str(e)}), 500


@pdv_bp.route('/sessions/<session_id>/close', methods=['POST'])
@jwt_required()
def close_session(session_id):
    """Fechar sessão de caixa"""
    try:
        user_id = get_jwt_identity()
        data = request.get_json()

        session = CashSession.query.get(session_id)
        if not session:
            return jsonify({'success': False, 'error': 'Sessão não encontrada'}), 404

        if session.status != 'open':
            return jsonify({'success': False, 'error': 'Sessão já está fechada'}), 400

        # Verificar se é o usuário da sessão ou admin
        claims = get_jwt()
        if str(session.user_id) != user_id and not claims.get('is_admin'):
            return jsonify({'success': False, 'error': 'Acesso negado'}), 403

        # Atualizar sessão
        session.actual_balance = Decimal(str(data.get('actual_balance', session.expected_balance)))
        session.difference = session.actual_balance - session.expected_balance
        session.closed_at = datetime.utcnow()
        session.status = 'closed'
        session.notes = data.get('notes')

        db.session.commit()

        return jsonify({
            'success': True,
            'message': 'Sessão de caixa fechada com sucesso',
            'session': session.to_dict(),
            'difference': float(session.difference) if session.difference else 0
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'error': str(e)}), 500


@pdv_bp.route('/sessions/current', methods=['GET'])
@jwt_required()
def get_current_session():
    """Obter sessão aberta do usuário atual"""
    try:
        user_id = get_jwt_identity()

        session = CashSession.query.filter_by(
            user_id=user_id,
            status='open'
        ).order_by(desc(CashSession.opened_at)).first()

        if not session:
            return jsonify({
                'success': True,
                'session': None,
                'message': 'Nenhuma sessão aberta'
            }), 200

        return jsonify({
            'success': True,
            'session': session.to_dict()
        }), 200
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500


@pdv_bp.route('/sessions', methods=['GET'])
@jwt_required()
def get_sessions():
    """Listar sessões de caixa"""
    try:
        claims = get_jwt()
        user_id = get_jwt_identity()

        # Admin vê todas, usuário comum vê apenas as suas
        if claims.get('is_admin'):
            query = CashSession.query
        else:
            query = CashSession.query.filter_by(user_id=user_id)

        # Filtros
        status = request.args.get('status')
        if status:
            query = query.filter_by(status=status)

        # Ordenação
        query = query.order_by(desc(CashSession.opened_at))

        # Paginação
        page = int(request.args.get('page', 1))
        per_page = int(request.args.get('per_page', 20))
        pagination = query.paginate(page=page, per_page=per_page, error_out=False)

        return jsonify({
            'success': True,
            'sessions': [s.to_dict() for s in pagination.items],
            'total': pagination.total,
            'pages': pagination.pages,
            'current_page': page
        }), 200
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500


# ================ MOVIMENTAÇÕES DE CAIXA ================

@pdv_bp.route('/movements', methods=['POST'])
@jwt_required()
def create_movement():
    """Criar movimentação (sangria/suprimento)"""
    try:
        user_id = get_jwt_identity()
        data = request.get_json()

        validation = validate_required_fields(data, ['session_id', 'type', 'amount'])
        if not validation['valid']:
            return jsonify({'success': False, 'error': validation['message']}), 400

        # Verificar se a sessão existe e está aberta
        session = CashSession.query.get(data['session_id'])
        if not session or session.status != 'open':
            return jsonify({'success': False, 'error': 'Sessão de caixa inválida ou fechada'}), 400

        amount = Decimal(str(data['amount']))

        # Criar movimentação
        movement = CashMovement(
            session_id=data['session_id'],
            type=data['type'],
            amount=amount,
            description=data.get('description'),
            created_by=user_id
        )
        db.session.add(movement)

        # Atualizar saldo esperado da sessão
        if data['type'] == 'withdrawal':  # Sangria
            session.expected_balance -= amount
        elif data['type'] == 'deposit':  # Suprimento
            session.expected_balance += amount

        db.session.commit()

        return jsonify({
            'success': True,
            'message': 'Movimentação registrada com sucesso',
            'movement': movement.to_dict(),
            'new_balance': float(session.expected_balance)
        }), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'error': str(e)}), 500


@pdv_bp.route('/movements/<session_id>', methods=['GET'])
@jwt_required()
def get_movements(session_id):
    """Listar movimentações de uma sessão"""
    try:
        movements = CashMovement.query.filter_by(session_id=session_id).order_by(CashMovement.created_at).all()
        return jsonify({
            'success': True,
            'movements': [m.to_dict() for m in movements]
        }), 200
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500


# ================ VENDAS PDV ================

@pdv_bp.route('/sales', methods=['POST'])
@jwt_required()
def create_sale():
    """Criar venda no PDV"""
    try:
        user_id = get_jwt_identity()
        data = request.get_json()

        validation = validate_required_fields(data, ['session_id', 'items', 'payment_method'])
        if not validation['valid']:
            return jsonify({'success': False, 'error': validation['message']}), 400

        # Verificar sessão
        session = CashSession.query.get(data['session_id'])
        if not session or session.status != 'open':
            return jsonify({'success': False, 'error': 'Sessão de caixa inválida ou fechada'}), 400

        # Calcular totais
        subtotal = Decimal('0')
        items_data = data['items']

        # Validar itens e calcular subtotal
        for item in items_data:
            product = Product.query.get(item['product_id'])
            if not product:
                return jsonify({
                    'success': False,
                    'error': f'Produto {item["product_id"]} não encontrado'
                }), 404

            quantity = Decimal(str(item['quantity']))
            unit_price = Decimal(str(item.get('unit_price', product.price)))
            subtotal += quantity * unit_price

        discount = Decimal(str(data.get('discount', 0)))
        total = subtotal - discount

        # Criar venda
        sale = Sale(
            cash_register_id=session.cash_register_id,
            session_id=session.id,
            customer_id=data.get('customer_id'),
            subtotal=subtotal,
            discount=discount,
            total=total,
            payment_method=data['payment_method'],
            payment_received=Decimal(str(data.get('payment_received', total))),
            change_amount=Decimal(str(data.get('change_amount', 0))),
            notes=data.get('notes'),
            sold_by=user_id
        )
        db.session.add(sale)
        db.session.flush()  # Para obter o ID da venda

        # Criar itens da venda
        for item in items_data:
            product = Product.query.get(item['product_id'])
            quantity = Decimal(str(item['quantity']))
            unit_price = Decimal(str(item.get('unit_price', product.price)))

            sale_item = SaleItem(
                sale_id=sale.id,
                product_id=product.id,
                product_name=product.name,
                quantity=quantity,
                unit_price=unit_price,
                subtotal=quantity * unit_price,
                discount=Decimal(str(item.get('discount', 0)))
            )
            sale_item.total = sale_item.subtotal - sale_item.discount
            db.session.add(sale_item)

            # Atualizar estoque
            if product.stock_quantity is not None:
                product.stock_quantity -= quantity

        # Atualizar saldo da sessão
        session.expected_balance += total
        session.total_sales = (session.total_sales or 0) + 1
        session.total_amount = (session.total_amount or Decimal('0')) + total

        db.session.commit()

        return jsonify({
            'success': True,
            'message': 'Venda registrada com sucesso',
            'sale': sale.to_dict()
        }), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'error': str(e)}), 500


@pdv_bp.route('/sales/<sale_id>', methods=['GET'])
@jwt_required()
def get_sale(sale_id):
    """Obter detalhes de uma venda"""
    try:
        sale = Sale.query.get(sale_id)
        if not sale:
            return jsonify({'success': False, 'error': 'Venda não encontrada'}), 404

        return jsonify({
            'success': True,
            'sale': sale.to_dict()
        }), 200
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500


@pdv_bp.route('/sales', methods=['GET'])
@jwt_required()
def get_sales():
    """Listar vendas"""
    try:
        # Filtros
        session_id = request.args.get('session_id')
        start_date = request.args.get('start_date')
        end_date = request.args.get('end_date')

        query = Sale.query

        if session_id:
            query = query.filter_by(session_id=session_id)

        if start_date:
            query = query.filter(Sale.created_at >= start_date)

        if end_date:
            query = query.filter(Sale.created_at <= end_date)

        # Ordenação
        query = query.order_by(desc(Sale.created_at))

        # Paginação
        page = int(request.args.get('page', 1))
        per_page = int(request.args.get('per_page', 20))
        pagination = query.paginate(page=page, per_page=per_page, error_out=False)

        return jsonify({
            'success': True,
            'sales': [s.to_dict() for s in pagination.items],
            'total': pagination.total,
            'pages': pagination.pages,
            'current_page': page
        }), 200
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500


@pdv_bp.route('/sales/<sale_id>/cancel', methods=['POST'])
@jwt_required()
def cancel_sale(sale_id):
    """Cancelar venda"""
    try:
        claims = get_jwt()
        if not claims.get('is_admin'):
            return jsonify({'success': False, 'error': 'Apenas administradores podem cancelar vendas'}), 403

        sale = Sale.query.get(sale_id)
        if not sale:
            return jsonify({'success': False, 'error': 'Venda não encontrada'}), 404

        if sale.status == 'cancelled':
            return jsonify({'success': False, 'error': 'Venda já está cancelada'}), 400

        data = request.get_json()

        # Cancelar venda
        sale.status = 'cancelled'
        sale.cancelled_at = datetime.utcnow()
        sale.cancel_reason = data.get('reason')

        # Reverter estoque
        for item in sale.items:
            product = Product.query.get(item.product_id)
            if product and product.stock_quantity is not None:
                product.stock_quantity += item.quantity

        # Reverter saldo da sessão
        if sale.session:
            sale.session.expected_balance -= sale.total
            sale.session.total_sales = max(0, (sale.session.total_sales or 1) - 1)
            sale.session.total_amount = (sale.session.total_amount or Decimal('0')) - sale.total

        db.session.commit()

        return jsonify({
            'success': True,
            'message': 'Venda cancelada com sucesso',
            'sale': sale.to_dict()
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'error': str(e)}), 500


# ================ RELATÓRIOS ================

@pdv_bp.route('/reports/session-summary/<session_id>', methods=['GET'])
@jwt_required()
def session_summary(session_id):
    """Resumo de uma sessão de caixa"""
    try:
        session = CashSession.query.get(session_id)
        if not session:
            return jsonify({'success': False, 'error': 'Sessão não encontrada'}), 404

        # Calcular totais por forma de pagamento
        payment_summary = db.session.query(
            Sale.payment_method,
            func.count(Sale.id).label('count'),
            func.sum(Sale.total).label('total')
        ).filter_by(session_id=session_id, status='completed').group_by(Sale.payment_method).all()

        # Movimentações
        movements = CashMovement.query.filter_by(session_id=session_id).all()

        return jsonify({
            'success': True,
            'session': session.to_dict(),
            'payment_summary': [
                {
                    'method': pm[0],
                    'count': pm[1],
                    'total': float(pm[2]) if pm[2] else 0
                } for pm in payment_summary
            ],
            'movements': [m.to_dict() for m in movements]
        }), 200
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500


@pdv_bp.route('/reports/daily-sales', methods=['GET'])
@jwt_required()
def daily_sales():
    """Relatório de vendas do dia"""
    try:
        # Data de hoje
        today = datetime.utcnow().date()
        start_of_day = datetime.combine(today, datetime.min.time())
        end_of_day = datetime.combine(today, datetime.max.time())

        # Vendas do dia
        sales = Sale.query.filter(
            Sale.created_at >= start_of_day,
            Sale.created_at <= end_of_day,
            Sale.status == 'completed'
        ).all()

        total_sales = len(sales)
        total_amount = sum([s.total for s in sales], Decimal('0'))

        # Por forma de pagamento
        payment_summary = db.session.query(
            Sale.payment_method,
            func.count(Sale.id).label('count'),
            func.sum(Sale.total).label('total')
        ).filter(
            Sale.created_at >= start_of_day,
            Sale.created_at <= end_of_day,
            Sale.status == 'completed'
        ).group_by(Sale.payment_method).all()

        return jsonify({
            'success': True,
            'date': today.isoformat(),
            'total_sales': total_sales,
            'total_amount': float(total_amount),
            'payment_summary': [
                {
                    'method': pm[0],
                    'count': pm[1],
                    'total': float(pm[2]) if pm[2] else 0
                } for pm in payment_summary
            ]
        }), 200
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500
