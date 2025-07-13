"""
Controlador para funcionalidades administrativas
"""

from flask import Blueprint, jsonify, request
from sqlalchemy import func
from datetime import datetime, timedelta

from ...database import db
from ...models import (
    User, Order, Product, Customer, Lead, OrderItem, CartItem
)

admin_bp = Blueprint("admin", __name__)


@admin_bp.route("/dashboard", methods=["GET"])
def get_dashboard():
    """Dashboard administrativo com métricas principais"""
    try:
        # Período padrão: últimos 30 dias
        end_date = datetime.now()
        start_date = end_date - timedelta(days=30)
        
        # Métricas de vendas
        orders_query = Order.query.filter(
            Order.created_at >= start_date,
            Order.created_at <= end_date
        )
        
        total_orders = orders_query.count()
        completed_orders = orders_query.filter(Order.status == 'completed').count()
        pending_orders = orders_query.filter(Order.status == 'pending').count()
        
        # Receita total
        total_revenue = db.session.query(func.sum(Order.total_amount)).filter(
            Order.created_at >= start_date,
            Order.created_at <= end_date,
            Order.status == 'completed'
        ).scalar() or 0
        
        # Ticket médio
        avg_order_value = db.session.query(func.avg(Order.total_amount)).filter(
            Order.created_at >= start_date,
            Order.created_at <= end_date,
            Order.status == 'completed'
        ).scalar() or 0
        
        # Produtos mais vendidos
        top_products = db.session.query(
            OrderItem.product_name,
            func.sum(OrderItem.quantity).label('total_quantity'),
            func.sum(OrderItem.total_price).label('total_revenue')
        ).join(Order).filter(
            Order.created_at >= start_date,
            Order.created_at <= end_date,
            Order.status == 'completed'
        ).group_by(OrderItem.product_name).order_by(
            func.sum(OrderItem.quantity).desc()
        ).limit(10).all()
        
        # Clientes ativos
        active_customers = Customer.query.filter(
            Customer.status == 'active'
        ).count()
        
        # Leads
        total_leads = Lead.query.count()
        converted_leads = Lead.query.filter(Lead.status == 'converted').count()
        
        # Carrinho abandonado
        abandoned_carts = CartItem.query.filter(
            CartItem.created_at >= start_date,
            CartItem.created_at <= end_date
        ).count()
        
        # Produtos cadastrados
        total_products = Product.query.count()
        active_products = Product.query.filter(Product.is_active == True).count()
        
        # Usuários registrados
        total_users = User.query.count()
        admin_users = User.query.filter(User.is_admin == True).count()
        
        # Vendas por dia (últimos 7 dias)
        daily_sales = []
        for i in range(7):
            day_start = (end_date - timedelta(days=i)).replace(hour=0, minute=0, second=0, microsecond=0)
            day_end = day_start + timedelta(days=1)
            
            day_orders = Order.query.filter(
                Order.created_at >= day_start,
                Order.created_at < day_end,
                Order.status == 'completed'
            ).count()
            
            day_revenue = db.session.query(func.sum(Order.total_amount)).filter(
                Order.created_at >= day_start,
                Order.created_at < day_end,
                Order.status == 'completed'
            ).scalar() or 0
            
            daily_sales.append({
                'date': day_start.strftime('%Y-%m-%d'),
                'orders': day_orders,
                'revenue': float(day_revenue)
            })
        
        return jsonify({
            'success': True,
            'data': {
                'period': {
                    'start_date': start_date.strftime('%Y-%m-%d'),
                    'end_date': end_date.strftime('%Y-%m-%d')
                },
                'sales': {
                    'total_orders': total_orders,
                    'completed_orders': completed_orders,
                    'pending_orders': pending_orders,
                    'total_revenue': float(total_revenue),
                    'avg_order_value': float(avg_order_value),
                    'conversion_rate': (completed_orders / total_orders * 100) if total_orders > 0 else 0
                },
                'customers': {
                    'active_customers': active_customers,
                    'total_leads': total_leads,
                    'converted_leads': converted_leads,
                    'conversion_rate': (converted_leads / total_leads * 100) if total_leads > 0 else 0
                },
                'products': {
                    'total_products': total_products,
                    'active_products': active_products,
                    'top_products': [
                        {
                            'name': product.product_name,
                            'quantity': int(product.total_quantity),
                            'revenue': float(product.total_revenue)
                        }
                        for product in top_products
                    ]
                },
                'users': {
                    'total_users': total_users,
                    'admin_users': admin_users,
                    'customer_users': total_users - admin_users
                },
                'analytics': {
                    'abandoned_carts': abandoned_carts,
                    'daily_sales': daily_sales
                }
            }
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': f'Erro ao carregar dashboard: {str(e)}'
        }), 500


@admin_bp.route("/orders", methods=["GET"])
def get_orders():
    """Listar pedidos para administração"""
    try:
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 20, type=int)
        status = request.args.get('status')
        
        query = Order.query
        
        if status:
            query = query.filter(Order.status == status)
        
        orders = query.order_by(Order.created_at.desc()).paginate(
            page=page, per_page=per_page, error_out=False
        )
        
        return jsonify({
            'success': True,
            'data': {
                'orders': [order.to_dict() for order in orders.items],
                'pagination': {
                    'page': orders.page,
                    'pages': orders.pages,
                    'per_page': orders.per_page,
                    'total': orders.total
                }
            }
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': f'Erro ao listar pedidos: {str(e)}'
        }), 500


@admin_bp.route("/orders", methods=["POST"])
def create_admin_order():
    """Criar novo pedido via admin"""
    try:
        from sqlalchemy import text
        import uuid
        import time
        
        data = request.get_json()
        
        # Validações básicas
        if not data.get('total_amount'):
            return jsonify({
                'success': False,
                'error': 'Total do pedido é obrigatório'
            }), 400
        
        # Gerar UUID sem hífens (formato do banco)
        order_id = str(uuid.uuid4()).replace('-', '')
        
        # Gerar número do pedido único
        timestamp = str(int(time.time()))[-8:]  # últimos 8 dígitos do timestamp
        order_number = f"ORD{timestamp}"
        
        # Preparar dados para inserção
        now = datetime.utcnow()
        
        # SQL para inserir pedido
        insert_sql = """
        INSERT INTO orders (
            id, order_number, user_id, customer_id, status, payment_status,
            subtotal, discount_amount, shipping_cost, tax_amount, total_amount,
            coupon_code, coupon_discount, shipping_address, billing_address,
            shipping_method, notes, admin_notes, created_at, updated_at
        ) VALUES (
            :id, :order_number, :user_id, :customer_id, :status, :payment_status,
            :subtotal, :discount_amount, :shipping_cost, :tax_amount, :total_amount,
            :coupon_code, :coupon_discount, :shipping_address, :billing_address,
            :shipping_method, :notes, :admin_notes, :created_at, :updated_at
        )
        """
        
        params = {
            'id': order_id,
            'order_number': order_number,
            'user_id': data.get('user_id'),
            'customer_id': data.get('customer_id'),
            'status': data.get('status', 'pending'),
            'payment_status': data.get('payment_status', 'pending'),
            'subtotal': float(data.get('subtotal', data['total_amount'])),
            'discount_amount': float(data.get('discount_amount', 0)),
            'shipping_cost': float(data.get('shipping_cost', 0)),
            'tax_amount': float(data.get('tax_amount', 0)),
            'total_amount': float(data['total_amount']),
            'coupon_code': data.get('coupon_code'),
            'coupon_discount': float(data.get('coupon_discount', 0)),
            'shipping_address': data.get('shipping_address'),
            'billing_address': data.get('billing_address'),
            'shipping_method': data.get('shipping_method'),
            'notes': data.get('notes'),
            'admin_notes': data.get('admin_notes'),
            'created_at': now,
            'updated_at': now
        }
        
        # Executar inserção
        db.session.execute(text(insert_sql), params)
        db.session.commit()
        
        # Buscar pedido criado para retornar
        select_sql = "SELECT * FROM orders WHERE id = :id"
        result = db.session.execute(text(select_sql), {'id': order_id})
        created_order = result.fetchone()
        
        # Converter resultado para dict
        order_dict = dict(created_order._mapping) if created_order else {}
        
        return jsonify({
            'success': True,
            'message': 'Pedido criado com sucesso',
            'data': order_dict
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'error': f'Erro ao criar pedido: {str(e)}'
        }), 500


@admin_bp.route("/orders/<order_id>", methods=["PUT"])
def update_admin_order(order_id):
    """Atualizar pedido via admin"""
    try:
        from sqlalchemy import text
        
        # Converter UUID para formato sem hífens como está no banco
        clean_id = order_id.replace('-', '')
        
        # Verificar se pedido existe
        check_result = db.session.execute(text("SELECT id FROM orders WHERE id = :id"), {"id": clean_id})
        if not check_result.fetchone():
            return jsonify({
                'success': False,
                'error': 'Pedido não encontrado'
            }), 404
        
        data = request.get_json()
        
        # Construir campos para atualização
        update_fields = []
        params = {"id": clean_id, "updated_at": datetime.utcnow()}
        
        # Mapear campos atualizáveis
        field_mapping = {
            'status': 'status',
            'payment_status': 'payment_status',
            'subtotal': 'subtotal',
            'discount_amount': 'discount_amount',
            'shipping_cost': 'shipping_cost',
            'tax_amount': 'tax_amount',
            'total_amount': 'total_amount',
            'coupon_code': 'coupon_code',
            'coupon_discount': 'coupon_discount',
            'shipping_address': 'shipping_address',
            'billing_address': 'billing_address',
            'shipping_method': 'shipping_method',
            'tracking_code': 'tracking_code',
            'notes': 'notes',
            'admin_notes': 'admin_notes'
        }
        
        for frontend_field, db_field in field_mapping.items():
            if frontend_field in data:
                update_fields.append(f"{db_field} = :{frontend_field}")
                # Converter valores numéricos
                if frontend_field in ['subtotal', 'discount_amount', 'shipping_cost', 'tax_amount', 'total_amount', 'coupon_discount']:
                    params[frontend_field] = float(data[frontend_field]) if data[frontend_field] is not None else 0
                else:
                    params[frontend_field] = data[frontend_field]
        
        # Se há campos para atualizar
        if update_fields:
            update_fields.append("updated_at = :updated_at")
            sql = f"UPDATE orders SET {', '.join(update_fields)} WHERE id = :id"
            db.session.execute(text(sql), params)
            db.session.commit()
        
        # Buscar pedido atualizado para retornar
        updated_result = db.session.execute(text("SELECT * FROM orders WHERE id = :id"), {"id": clean_id})
        updated_order = updated_result.fetchone()
        
        # Converter resultado para dict
        order_dict = dict(updated_order._mapping) if updated_order else {}
        
        return jsonify({
            'success': True,
            'message': 'Pedido atualizado com sucesso',
            'data': order_dict
        })
        
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'error': f'Erro ao atualizar pedido: {str(e)}'
        }), 500


@admin_bp.route("/orders/<order_id>", methods=["DELETE"])
def delete_admin_order(order_id):
    """Deletar pedido via admin (cancelar)"""
    try:
        from sqlalchemy import text
        
        # Converter UUID para formato sem hífens como está no banco
        clean_id = order_id.replace('-', '')
        
        # Verificar se pedido existe
        check_result = db.session.execute(text("SELECT id FROM orders WHERE id = :id"), {"id": clean_id})
        if not check_result.fetchone():
            return jsonify({
                'success': False,
                'error': 'Pedido não encontrado'
            }), 404
        
        # Cancelar pedido ao invés de deletar fisicamente
        sql = "UPDATE orders SET status = :status, updated_at = :updated_at WHERE id = :id"
        params = {
            "id": clean_id,
            "status": "cancelled",
            "updated_at": datetime.utcnow()
        }
        
        db.session.execute(text(sql), params)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Pedido cancelado com sucesso'
        })
        
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'error': f'Erro ao cancelar pedido: {str(e)}'
        }), 500


@admin_bp.route("/orders/<order_id>/update-status", methods=["POST"])
def update_order_status(order_id):
    """Atualizar status do pedido"""
    try:
        from sqlalchemy import text
        
        # Converter UUID para formato sem hífens como está no banco
        clean_id = order_id.replace('-', '')
        
        # Verificar se pedido existe
        check_result = db.session.execute(text("SELECT id FROM orders WHERE id = :id"), {"id": clean_id})
        if not check_result.fetchone():
            return jsonify({
                'success': False,
                'error': 'Pedido não encontrado'
            }), 404
        
        data = request.get_json() or {}
        new_status = data.get('status')
        
        if not new_status:
            return jsonify({
                'success': False,
                'error': 'Status é obrigatório'
            }), 400
        
        # Atualizar status usando SQL direto
        sql = "UPDATE orders SET status = :status, updated_at = :updated_at WHERE id = :id"
        params = {
            "id": clean_id,
            "status": new_status,
            "updated_at": datetime.utcnow()
        }
        
        db.session.execute(text(sql), params)
        db.session.commit()
        
        # Buscar pedido atualizado para retornar
        updated_result = db.session.execute(text("SELECT * FROM orders WHERE id = :id"), {"id": clean_id})
        updated_order = updated_result.fetchone()
        
        # Converter resultado para dict
        order_dict = dict(updated_order._mapping) if updated_order else {}
        
        return jsonify({
            'success': True,
            'message': f'Status do pedido atualizado para {new_status}',
            'data': order_dict
        })
        
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'error': f'Erro ao atualizar status do pedido: {str(e)}'
        }), 500


# =============================================
# ENDPOINTS ADMINISTRATIVOS FALTANTES
# =============================================

@admin_bp.route("/stats", methods=["GET"])
def get_admin_stats():
    """Estatísticas administrativas principais"""
    try:
        # Dados do dashboard principal
        end_date = datetime.now()
        start_date = end_date - timedelta(days=30)
        
        # Estatísticas básicas
        total_users = User.query.count()
        total_orders = Order.query.count()
        total_products = Product.query.count()
        total_customers = Customer.query.count()
        
        # Receita total
        total_revenue = db.session.query(func.sum(Order.total_amount)).filter(
            Order.status == 'completed'
        ).scalar() or 0
        
        # Pedidos recentes
        recent_orders = Order.query.filter(
            Order.created_at >= start_date
        ).count()
        
        # Novos usuários
        new_users = User.query.filter(
            User.created_at >= start_date
        ).count()
        
        return jsonify({
            'success': True,
            'data': {
                'overview': {
                    'total_users': total_users,
                    'total_orders': total_orders,
                    'total_products': total_products,
                    'total_customers': total_customers,
                    'total_revenue': float(total_revenue),
                    'recent_orders': recent_orders,
                    'new_users': new_users
                },
                'period': {
                    'start_date': start_date.strftime('%Y-%m-%d'),
                    'end_date': end_date.strftime('%Y-%m-%d')
                }
            }
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': f'Erro ao carregar estatísticas: {str(e)}'
        }), 500


@admin_bp.route("/users", methods=["GET"])
def get_admin_users():
    """Listar usuários para administração"""
    try:
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 20, type=int)
        search = request.args.get('search', '')
        
        query = User.query
        
        if search:
            query = query.filter(
                User.name.ilike(f'%{search}%') |
                User.email.ilike(f'%{search}%')
            )
        
        users = query.order_by(User.created_at.desc()).paginate(
            page=page, per_page=per_page, error_out=False
        )
        
        return jsonify({
            'success': True,
            'data': {
                'users': [user.to_dict() for user in users.items],
                'pagination': {
                    'page': users.page,
                    'pages': users.pages,
                    'per_page': users.per_page,
                    'total': users.total
                }
            }
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': f'Erro ao listar usuários: {str(e)}'
        }), 500


@admin_bp.route("/users", methods=["POST"])
def create_admin_user():
    """Criar novo usuário via admin"""
    try:
        from sqlalchemy import text
        import uuid
        import bcrypt
        
        data = request.get_json()
        
        # Validações básicas
        if not data.get('name'):
            return jsonify({
                'success': False,
                'error': 'Nome do usuário é obrigatório'
            }), 400
        
        if not data.get('email'):
            return jsonify({
                'success': False,
                'error': 'Email do usuário é obrigatório'
            }), 400
        
        if not data.get('password'):
            return jsonify({
                'success': False,
                'error': 'Senha do usuário é obrigatória'
            }), 400
        
        # Verificar se email já existe
        check_email = db.session.execute(text("SELECT id FROM users WHERE email = :email"), {"email": data['email']})
        if check_email.fetchone():
            return jsonify({
                'success': False,
                'error': 'Email já está em uso'
            }), 400
        
        # Gerar UUID sem hífens (formato do banco)
        user_id = str(uuid.uuid4()).replace('-', '')
        
        # Hash da senha
        password_hash = bcrypt.hashpw(data['password'].encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
        
        # Preparar dados para inserção
        now = datetime.utcnow()
        
        # SQL para inserir usuário
        insert_sql = """
        INSERT INTO users (
            id, name, email, password_hash, is_admin, is_active, 
            phone, created_at, updated_at
        ) VALUES (
            :id, :name, :email, :password_hash, :is_admin, :is_active,
            :phone, :created_at, :updated_at
        )
        """
        
        params = {
            'id': user_id,
            'name': data['name'],
            'email': data['email'],
            'password_hash': password_hash,
            'is_admin': data.get('is_admin', False),
            'is_active': data.get('is_active', True),
            'phone': data.get('phone', ''),
            'created_at': now,
            'updated_at': now
        }
        
        # Executar inserção
        db.session.execute(text(insert_sql), params)
        db.session.commit()
        
        # Buscar usuário criado para retornar (sem senha)
        select_sql = "SELECT id, name, email, is_admin, is_active, phone, created_at, updated_at FROM users WHERE id = :id"
        result = db.session.execute(text(select_sql), {'id': user_id})
        created_user = result.fetchone()
        
        # Converter resultado para dict
        user_dict = dict(created_user._mapping) if created_user else {}
        
        return jsonify({
            'success': True,
            'message': 'Usuário criado com sucesso',
            'data': user_dict
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'error': f'Erro ao criar usuário: {str(e)}'
        }), 500


@admin_bp.route("/users/<user_id>", methods=["PUT"])
def update_admin_user(user_id):
    """Atualizar usuário via admin"""
    try:
        from sqlalchemy import text
        import bcrypt
        
        # Converter UUID para formato sem hífens como está no banco
        clean_id = user_id.replace('-', '')
        
        # Verificar se usuário existe
        check_result = db.session.execute(text("SELECT id FROM users WHERE id = :id"), {"id": clean_id})
        if not check_result.fetchone():
            return jsonify({
                'success': False,
                'error': 'Usuário não encontrado'
            }), 404
        
        data = request.get_json()
        
        # Construir campos para atualização
        update_fields = []
        params = {"id": clean_id, "updated_at": datetime.utcnow()}
        
        # Mapear campos atualizáveis
        field_mapping = {
            'name': 'name',
            'email': 'email',
            'is_admin': 'is_admin',
            'is_active': 'is_active',
            'phone': 'phone'
        }
        
        for frontend_field, db_field in field_mapping.items():
            if frontend_field in data:
                update_fields.append(f"{db_field} = :{frontend_field}")
                params[frontend_field] = data[frontend_field]
        
        # Tratar senha separadamente
        if 'password' in data and data['password']:
            password_hash = bcrypt.hashpw(data['password'].encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
            update_fields.append("password_hash = :password_hash")
            params['password_hash'] = password_hash
        
        # Se há campos para atualizar
        if update_fields:
            update_fields.append("updated_at = :updated_at")
            sql = f"UPDATE users SET {', '.join(update_fields)} WHERE id = :id"
            db.session.execute(text(sql), params)
            db.session.commit()
        
        # Buscar usuário atualizado para retornar (sem senha)
        updated_result = db.session.execute(text("SELECT id, name, email, is_admin, is_active, phone, created_at, updated_at FROM users WHERE id = :id"), {"id": clean_id})
        updated_user = updated_result.fetchone()
        
        # Converter resultado para dict
        user_dict = dict(updated_user._mapping) if updated_user else {}
        
        return jsonify({
            'success': True,
            'message': 'Usuário atualizado com sucesso',
            'data': user_dict
        })
        
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'error': f'Erro ao atualizar usuário: {str(e)}'
        }), 500


@admin_bp.route("/users/<user_id>", methods=["DELETE"])
def delete_admin_user(user_id):
    """Deletar usuário via admin (soft delete)"""
    try:
        from sqlalchemy import text
        
        # Converter UUID para formato sem hífens como está no banco
        clean_id = user_id.replace('-', '')
        
        # Verificar se usuário existe
        check_result = db.session.execute(text("SELECT id FROM users WHERE id = :id"), {"id": clean_id})
        if not check_result.fetchone():
            return jsonify({
                'success': False,
                'error': 'Usuário não encontrado'
            }), 404
        
        # Soft delete - marcar como inativo usando SQL direto
        sql = "UPDATE users SET is_active = :is_active, updated_at = :updated_at WHERE id = :id"
        params = {
            "id": clean_id,
            "is_active": False,
            "updated_at": datetime.utcnow()
        }
        
        db.session.execute(text(sql), params)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Usuário removido com sucesso'
        })
        
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'error': f'Erro ao remover usuário: {str(e)}'
        }), 500


@admin_bp.route("/users/<user_id>/toggle-status", methods=["POST"])
def toggle_user_status(user_id):
    """Alternar status ativo/inativo do usuário"""
    try:
        from sqlalchemy import text
        
        # Converter UUID para formato sem hífens como está no banco
        clean_id = user_id.replace('-', '')
        
        # Verificar se usuário existe e obter status atual
        check_result = db.session.execute(text("SELECT id, is_active FROM users WHERE id = :id"), {"id": clean_id})
        user_data = check_result.fetchone()
        
        if not user_data:
            return jsonify({
                'success': False,
                'error': 'Usuário não encontrado'
            }), 404
        
        data = request.get_json() or {}
        current_status = bool(user_data.is_active)
        new_status = data.get('is_active', not current_status)
        
        # Atualizar status usando SQL direto
        sql = "UPDATE users SET is_active = :is_active, updated_at = :updated_at WHERE id = :id"
        params = {
            "id": clean_id,
            "is_active": new_status,
            "updated_at": datetime.utcnow()
        }
        
        db.session.execute(text(sql), params)
        db.session.commit()
        
        # Buscar usuário atualizado para retornar (sem senha)
        updated_result = db.session.execute(text("SELECT id, name, email, is_admin, is_active, phone, created_at, updated_at FROM users WHERE id = :id"), {"id": clean_id})
        updated_user = updated_result.fetchone()
        
        # Converter resultado para dict
        user_dict = dict(updated_user._mapping) if updated_user else {}
        
        status_text = "ativado" if new_status else "desativado"
        
        return jsonify({
            'success': True,
            'message': f'Usuário {status_text} com sucesso',
            'data': user_dict
        })
        
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'error': f'Erro ao alterar status do usuário: {str(e)}'
        }), 500


@admin_bp.route("/products", methods=["GET"])
def get_admin_products():
    """Listar TODOS os produtos para administração (incluindo marketplace)"""
    try:
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 50, type=int)
        search = request.args.get('search', '')
        status = request.args.get('status')
        
        query = Product.query
        
        if search:
            query = query.filter(
                Product.name.ilike(f'%{search}%') |
                Product.description.ilike(f'%{search}%') |
                Product.sku.ilike(f'%{search}%')
            )
        
        if status:
            if status == 'active':
                query = query.filter(Product.is_active == True)
            elif status == 'inactive':
                query = query.filter(Product.is_active == False)
        
        # Sempre retornar com paginação para consistência, mas usar per_page alto por padrão
        if not page or page == 0:
            page = 1
        if not per_page or per_page == 0:
            per_page = 100  # Limite alto para admin dashboard
            
        products = query.order_by(Product.created_at.desc()).paginate(
            page=page, per_page=per_page, error_out=False
        )
        
        return jsonify({
            'success': True,
            'data': {
                'products': [product.to_dict() for product in products.items],
                'pagination': {
                    'page': products.page,
                    'pages': products.pages,
                    'per_page': products.per_page,
                    'total': products.total
                }
            }
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': f'Erro ao listar produtos: {str(e)}'
        }), 500


@admin_bp.route("/products", methods=["POST"])
def create_admin_product():
    """Criar novo produto via admin"""
    try:
        from sqlalchemy import text
        import uuid
        import re
        
        data = request.get_json()
        
        # Validações básicas
        if not data.get('name'):
            return jsonify({
                'success': False,
                'error': 'Nome do produto é obrigatório'
            }), 400
        
        if not data.get('price'):
            return jsonify({
                'success': False,
                'error': 'Preço do produto é obrigatório'
            }), 400
        
        # Gerar UUID sem hífens (formato do banco)
        product_id = str(uuid.uuid4()).replace('-', '')
        
        # Gerar slug a partir do nome
        slug = re.sub(r'[^a-z0-9]+', '-', data['name'].lower()).strip('-')
        
        # Gerar SKU único se não fornecido
        sku = data.get('sku', '')
        if not sku or sku.strip() == '':
            # Gerar SKU único baseado no timestamp e parte do UUID
            import time
            timestamp = str(int(time.time()))[-6:]  # últimos 6 dígitos do timestamp
            uuid_part = product_id[:6].upper()  # primeiros 6 caracteres do UUID
            sku = f"SKU{timestamp}{uuid_part}"
        
        # Preparar dados para inserção
        now = datetime.utcnow()
        
        # Mapear campos do frontend para backend
        stock_quantity = data.get('stock_quantity', data.get('stock', 0))
        
        # Converter flavor_notes para string se for uma lista
        flavor_notes = data.get('flavor_notes', '')
        if isinstance(flavor_notes, list):
            flavor_notes = ', '.join(flavor_notes)
        elif not isinstance(flavor_notes, str):
            flavor_notes = str(flavor_notes)
        
        # Mapear process do frontend (processing_method para process)
        process = data.get('process', data.get('processing_method', ''))
        
        # SQL para inserir produto
        insert_sql = """
        INSERT INTO products (
            id, name, slug, description, short_description, price, cost_price, 
            compare_price, sku, category, origin, process, roast_level, 
            flavor_notes, sca_score, acidity, sweetness, body, weight, 
            stock_quantity, min_stock_level, max_stock_level, is_active, 
            is_featured, image_url, track_inventory, created_at, updated_at
        ) VALUES (
            :id, :name, :slug, :description, :short_description, :price, :cost_price,
            :compare_price, :sku, :category, :origin, :process, :roast_level,
            :flavor_notes, :sca_score, :acidity, :sweetness, :body, :weight,
            :stock_quantity, :min_stock_level, :max_stock_level, :is_active,
            :is_featured, :image_url, :track_inventory, :created_at, :updated_at
        )
        """
        
        params = {
            'id': product_id,
            'name': data['name'],
            'slug': slug,
            'description': data.get('description', ''),
            'short_description': data.get('short_description', ''),
            'price': float(data['price']),
            'cost_price': float(data.get('cost_price', 0)),
            'compare_price': float(data.get('compare_price', 0)),
            'sku': sku,
            'category': data.get('category', ''),
            'origin': data.get('origin', ''),
            'process': process,
            'roast_level': data.get('roast_level', ''),
            'flavor_notes': flavor_notes,
            'sca_score': int(data.get('sca_score', 0)),
            'acidity': int(data.get('acidity', 0)),
            'sweetness': int(data.get('sweetness', 0)),
            'body': int(data.get('body', 0)),
            'weight': float(data.get('weight', 0)),
            'stock_quantity': int(stock_quantity),
            'min_stock_level': int(data.get('min_stock_level', 0)),
            'max_stock_level': int(data.get('max_stock_level', 0)),
            'is_active': data.get('is_active', True),
            'is_featured': data.get('is_featured', False),
            'image_url': data.get('image_url', ''),
            'track_inventory': data.get('track_inventory', True),
            'created_at': now,
            'updated_at': now
        }
        
        # Executar inserção
        db.session.execute(text(insert_sql), params)
        db.session.commit()
        
        # Buscar produto criado para retornar
        select_sql = "SELECT * FROM products WHERE id = :id"
        result = db.session.execute(text(select_sql), {'id': product_id})
        created_product = result.fetchone()
        
        # Converter resultado para dict
        product_dict = dict(created_product._mapping) if created_product else {}
        
        return jsonify({
            'success': True,
            'message': 'Produto criado com sucesso',
            'data': product_dict
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'error': f'Erro ao criar produto: {str(e)}'
        }), 500


@admin_bp.route("/products/<product_id>", methods=["PUT"])
def update_admin_product(product_id):
    """Atualizar produto via admin"""
    try:
        from sqlalchemy import text
        
        # Converter UUID para formato sem hífens como está no banco
        clean_id = product_id.replace('-', '')
        
        # Verificar se produto existe
        check_result = db.session.execute(text("SELECT id FROM products WHERE id = :id"), {"id": clean_id})
        if not check_result.fetchone():
            return jsonify({
                'success': False,
                'error': 'Produto não encontrado'
            }), 404
        
        data = request.get_json()
        
        # Construir campos para atualização
        update_fields = []
        params = {"id": clean_id, "updated_at": datetime.utcnow()}
        
        # Mapear campos atualizáveis
        field_mapping = {
            'name': 'name',
            'description': 'description', 
            'price': 'price',
            'stock_quantity': 'stock_quantity',
            'category': 'category',
            'origin': 'origin',
            'is_active': 'is_active',
            'is_featured': 'is_featured'
        }
        
        for frontend_field, db_field in field_mapping.items():
            if frontend_field in data:
                update_fields.append(f"{db_field} = :{frontend_field}")
                params[frontend_field] = data[frontend_field]
        
        # Se há campos para atualizar
        if update_fields:
            update_fields.append("updated_at = :updated_at")
            sql = f"UPDATE products SET {', '.join(update_fields)} WHERE id = :id"
            db.session.execute(text(sql), params)
            db.session.commit()
        
        # Buscar produto atualizado para retornar
        updated_result = db.session.execute(text("SELECT * FROM products WHERE id = :id"), {"id": clean_id})
        updated_product = updated_result.fetchone()
        
        # Converter resultado para dict
        product_dict = dict(updated_product._mapping) if updated_product else {}
        
        return jsonify({
            'success': True,
            'message': 'Produto atualizado com sucesso',
            'data': product_dict
        })
        
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'error': f'Erro ao atualizar produto: {str(e)}'
        }), 500


@admin_bp.route("/products/<product_id>", methods=["DELETE"])
def delete_admin_product(product_id):
    """Deletar produto via admin (soft delete)"""
    try:
        from sqlalchemy import text
        
        # Converter UUID para formato sem hífens como está no banco
        clean_id = product_id.replace('-', '')
        
        # Verificar se produto existe
        check_result = db.session.execute(text("SELECT id FROM products WHERE id = :id"), {"id": clean_id})
        if not check_result.fetchone():
            return jsonify({
                'success': False,
                'error': 'Produto não encontrado'
            }), 404
        
        # Soft delete - marcar como inativo usando SQL direto
        sql = "UPDATE products SET is_active = :is_active, updated_at = :updated_at WHERE id = :id"
        params = {
            "id": clean_id,
            "is_active": False,
            "updated_at": datetime.utcnow()
        }
        
        db.session.execute(text(sql), params)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Produto removido com sucesso'
        })
        
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'error': f'Erro ao remover produto: {str(e)}'
        }), 500


@admin_bp.route("/products/<product_id>/toggle-status", methods=["POST"])
def toggle_product_status(product_id):
    """Alternar status ativo/inativo do produto"""
    try:
        from sqlalchemy import text
        
        # Converter UUID para formato sem hífens como está no banco
        clean_id = product_id.replace('-', '')
        
        # Verificar se produto existe e obter status atual
        check_result = db.session.execute(text("SELECT id, is_active FROM products WHERE id = :id"), {"id": clean_id})
        product_data = check_result.fetchone()
        
        if not product_data:
            return jsonify({
                'success': False,
                'error': 'Produto não encontrado'
            }), 404
        
        data = request.get_json() or {}
        current_status = bool(product_data.is_active)
        new_status = data.get('is_active', not current_status)
        
        # Atualizar status usando SQL direto
        sql = "UPDATE products SET is_active = :is_active, updated_at = :updated_at WHERE id = :id"
        params = {
            "id": clean_id,
            "is_active": new_status,
            "updated_at": datetime.utcnow()
        }
        
        db.session.execute(text(sql), params)
        db.session.commit()
        
        # Buscar produto atualizado para retornar
        updated_result = db.session.execute(text("SELECT * FROM products WHERE id = :id"), {"id": clean_id})
        updated_product = updated_result.fetchone()
        
        # Converter resultado para dict
        product_dict = dict(updated_product._mapping) if updated_product else {}
        
        status_text = "ativado" if new_status else "desativado"
        
        return jsonify({
            'success': True,
            'message': f'Produto {status_text} com sucesso',
            'data': product_dict
        })
        
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'error': f'Erro ao alterar status do produto: {str(e)}'
        }), 500


@admin_bp.route("/blog/posts", methods=["GET"])
def get_admin_blog_posts():
    """Listar posts do blog para administração"""
    try:
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 20, type=int)
        status = request.args.get('status')
        
        # Mock data para posts do blog
        mock_posts = []
        for i in range(1, 21):
            mock_posts.append({
                'id': i,
                'title': f'Post do Blog {i}',
                'slug': f'post-blog-{i}',
                'content': f'Conteúdo do post {i}...',
                'excerpt': f'Resumo do post {i}',
                'author_id': 1,
                'author_name': 'Admin',
                'category': 'Café Especial',
                'image_url': None,
                'is_published': i % 2 == 0,
                'is_featured': i % 5 == 0,
                'views_count': i * 10,
                'likes_count': i * 2,
                'comments_count': i,
                'created_at': (datetime.now() - timedelta(days=i)).isoformat(),
                'updated_at': (datetime.now() - timedelta(days=i)).isoformat(),
                'published_at': (datetime.now() - timedelta(days=i)).isoformat() if i % 2 == 0 else None
            })
        
        # Aplicar filtro de status se fornecido
        if status:
            if status == 'published':
                mock_posts = [post for post in mock_posts if post['is_published']]
            elif status == 'draft':
                mock_posts = [post for post in mock_posts if not post['is_published']]
        
        # Simular paginação
        start_idx = (page - 1) * per_page
        end_idx = start_idx + per_page
        paginated_posts = mock_posts[start_idx:end_idx]
        
        return jsonify({
            'success': True,
            'data': {
                'posts': paginated_posts,
                'pagination': {
                    'page': page,
                    'pages': (len(mock_posts) + per_page - 1) // per_page,
                    'per_page': per_page,
                    'total': len(mock_posts)
                }
            }
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': f'Erro ao listar posts: {str(e)}'
        }), 500


@admin_bp.route("/blog/posts", methods=["POST"])
def create_admin_blog_post():
    """Criar novo post do blog via admin"""
    try:
        from sqlalchemy import text
        import uuid
        import re
        
        data = request.get_json()
        
        # Validações básicas
        if not data.get('title'):
            return jsonify({
                'success': False,
                'error': 'Título do post é obrigatório'
            }), 400
        
        if not data.get('content'):
            return jsonify({
                'success': False,
                'error': 'Conteúdo do post é obrigatório'
            }), 400
        
        # Gerar UUID sem hífens (formato do banco)
        post_id = str(uuid.uuid4()).replace('-', '')
        
        # Gerar slug a partir do título
        slug = re.sub(r'[^a-z0-9]+', '-', data['title'].lower()).strip('-')
        
        # Preparar dados para inserção
        now = datetime.utcnow()
        
        # Como não temos tabela de blog posts, vamos simular com um mock response
        # Em uma implementação real, você criaria a tabela primeiro
        mock_post = {
            'id': post_id,
            'title': data['title'],
            'slug': slug,
            'content': data['content'],
            'excerpt': data.get('excerpt', data['content'][:200] + '...'),
            'author_id': 1,  # Assumindo admin como autor
            'author_name': 'Admin',
            'category': data.get('category', 'Geral'),
            'image_url': data.get('image_url'),
            'is_published': data.get('is_published', False),
            'is_featured': data.get('is_featured', False),
            'views_count': 0,
            'likes_count': 0,
            'comments_count': 0,
            'created_at': now.isoformat(),
            'updated_at': now.isoformat(),
            'published_at': now.isoformat() if data.get('is_published') else None
        }
        
        return jsonify({
            'success': True,
            'message': 'Post criado com sucesso',
            'data': mock_post
        }), 201
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': f'Erro ao criar post: {str(e)}'
        }), 500


@admin_bp.route("/blog/posts/<post_id>", methods=["PUT"])
def update_admin_blog_post(post_id):
    """Atualizar post do blog via admin"""
    try:
        import re
        
        data = request.get_json()
        
        # Validações básicas
        if not data.get('title'):
            return jsonify({
                'success': False,
                'error': 'Título do post é obrigatório'
            }), 400
        
        # Gerar slug a partir do título
        slug = re.sub(r'[^a-z0-9]+', '-', data['title'].lower()).strip('-')
        
        # Preparar dados para atualização
        now = datetime.utcnow()
        
        # Mock response para atualização
        updated_post = {
            'id': post_id,
            'title': data['title'],
            'slug': slug,
            'content': data.get('content'),
            'excerpt': data.get('excerpt', data.get('content', '')[:200] + '...'),
            'author_id': 1,
            'author_name': 'Admin',
            'category': data.get('category', 'Geral'),
            'image_url': data.get('image_url'),
            'is_published': data.get('is_published', False),
            'is_featured': data.get('is_featured', False),
            'views_count': 0,
            'likes_count': 0,
            'comments_count': 0,
            'created_at': '2024-01-01T10:00:00Z',  # Mock
            'updated_at': now.isoformat(),
            'published_at': now.isoformat() if data.get('is_published') else None
        }
        
        return jsonify({
            'success': True,
            'message': 'Post atualizado com sucesso',
            'data': updated_post
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': f'Erro ao atualizar post: {str(e)}'
        }), 500


@admin_bp.route("/blog/posts/<post_id>", methods=["DELETE"])
def delete_admin_blog_post(post_id):
    """Deletar post do blog via admin"""
    try:
        # Mock response para deleção
        return jsonify({
            'success': True,
            'message': 'Post removido com sucesso'
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': f'Erro ao remover post: {str(e)}'
        }), 500


@admin_bp.route("/blog/posts/<post_id>/toggle-status", methods=["POST"])
def toggle_blog_post_status(post_id):
    """Alternar status publicado/rascunho do post"""
    try:
        data = request.get_json() or {}
        new_status = data.get('is_published', True)
        
        # Mock response para alternar status
        updated_post = {
            'id': post_id,
            'title': 'Post Exemplo',
            'is_published': new_status,
            'updated_at': datetime.utcnow().isoformat()
        }
        
        status_text = "publicado" if new_status else "despublicado"
        
        return jsonify({
            'success': True,
            'message': f'Post {status_text} com sucesso',
            'data': updated_post
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': f'Erro ao alterar status do post: {str(e)}'
        }), 500


@admin_bp.route("/analytics/top-products-revenue", methods=["GET"])
def get_top_products_revenue():
    """Analytics de produtos com maior receita"""
    try:
        limit = request.args.get('limit', 10, type=int)
        period = request.args.get('period', '30')  # dias
        
        end_date = datetime.now()
        start_date = end_date - timedelta(days=int(period))
        
        # Buscar produtos com maior receita
        top_products = db.session.query(
            OrderItem.product_name,
            func.sum(OrderItem.total_price).label('total_revenue'),
            func.sum(OrderItem.quantity).label('total_quantity'),
            func.count(OrderItem.id).label('orders_count')
        ).join(Order).filter(
            Order.created_at >= start_date,
            Order.created_at <= end_date,
            Order.status == 'completed'
        ).group_by(OrderItem.product_name).order_by(
            func.sum(OrderItem.total_price).desc()
        ).limit(limit).all()
        
        return jsonify({
            'success': True,
            'data': {
                'top_products': [
                    {
                        'product_name': product.product_name,
                        'total_revenue': float(product.total_revenue),
                        'total_quantity': int(product.total_quantity),
                        'orders_count': int(product.orders_count),
                        'avg_order_value': float(product.total_revenue / product.orders_count) if product.orders_count > 0 else 0
                    }
                    for product in top_products
                ],
                'period': {
                    'start_date': start_date.strftime('%Y-%m-%d'),
                    'end_date': end_date.strftime('%Y-%m-%d'),
                    'days': period
                }
            }
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': f'Erro ao obter analytics: {str(e)}'
        }), 500


@admin_bp.route("/summary", methods=["GET"])
def get_admin_summary():
    """Resumo administrativo geral"""
    try:
        # Estatísticas gerais
        total_users = User.query.count()
        total_products = Product.query.count()
        total_orders = Order.query.count()
        total_customers = Customer.query.count()
        
        # Receita total
        total_revenue = db.session.query(func.sum(Order.total_amount)).filter(
            Order.status == 'completed'
        ).scalar() or 0
        
        # Pedidos pendentes
        pending_orders = Order.query.filter(Order.status == 'pending').count()
        
        # Produtos em estoque baixo
        low_stock_products = Product.query.filter(
            Product.stock_quantity <= 10
        ).count()
        
        return jsonify({
            'success': True,
            'data': {
                'summary': {
                    'total_users': total_users,
                    'total_products': total_products,
                    'total_orders': total_orders,
                    'total_customers': total_customers,
                    'total_revenue': float(total_revenue),
                    'pending_orders': pending_orders,
                    'low_stock_products': low_stock_products
                }
            }
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': f'Erro ao obter resumo: {str(e)}'
        }), 500


@admin_bp.route("/customers", methods=["GET"])
def get_customers():
    """Listar clientes para administração"""
    try:
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 20, type=int)
        
        customers = Customer.query.order_by(Customer.created_at.desc()).paginate(
            page=page, per_page=per_page, error_out=False
        )
        
        return jsonify({
            'success': True,
            'data': {
                'customers': [customer.to_dict() for customer in customers.items],
                'pagination': {
                    'page': customers.page,
                    'pages': customers.pages,
                    'per_page': customers.per_page,
                    'total': customers.total
                }
            }
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': f'Erro ao listar clientes: {str(e)}'
        }), 500


@admin_bp.route("/leads", methods=["GET"])
def get_leads():
    """Listar leads para administração"""
    try:
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 20, type=int)
        status = request.args.get('status')
        
        query = Lead.query
        
        if status:
            query = query.filter(Lead.status == status)
        
        leads = query.order_by(Lead.created_at.desc()).paginate(
            page=page, per_page=per_page, error_out=False
        )
        
        return jsonify({
            'success': True,
            'data': {
                'leads': [lead.to_dict() for lead in leads.items],
                'pagination': {
                    'page': leads.page,
                    'pages': leads.pages,
                    'per_page': leads.per_page,
                    'total': leads.total
                }
            }
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': f'Erro ao listar leads: {str(e)}'
        }), 500


# =============================================
# BLOG ADMIN ENDPOINTS
# =============================================

@admin_bp.route("/blog/categories", methods=["GET"])
def get_blog_categories():
    """Obter todas as categorias do blog para admin"""
    try:
        # Mock data para categorias do blog
        categories = [
            {
                "id": 1,
                "name": "Café Especial",
                "slug": "cafe-especial",
                "description": "Tudo sobre café especial",
                "color": "#8B4513",
                "is_active": True,
                "posts_count": 5,
                "created_at": "2024-01-01T10:00:00Z"
            },
            {
                "id": 2,
                "name": "Técnicas de Preparo",
                "slug": "tecnicas-preparo",
                "description": "Métodos e técnicas de preparo",
                "color": "#CD853F",
                "is_active": True,
                "posts_count": 8,
                "created_at": "2024-01-02T10:00:00Z"
            },
            {
                "id": 3,
                "name": "Origem do Café",
                "slug": "origem-cafe",
                "description": "História e origem dos cafés",
                "color": "#A0522D",
                "is_active": True,
                "posts_count": 12,
                "created_at": "2024-01-03T10:00:00Z"
            },
            {
                "id": 4,
                "name": "Torrefação",
                "slug": "torrefacao",
                "description": "Processos e técnicas de torrefação",
                "color": "#D2691E",
                "is_active": True,
                "posts_count": 6,
                "created_at": "2024-01-04T10:00:00Z"
            }
        ]
        
        return jsonify({
            "success": True,
            "categories": categories,
            "total": len(categories)
        })
        
    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500


@admin_bp.route("/blog/categories", methods=["POST"])
def create_blog_category():
    """Criar nova categoria do blog"""
    try:
        data = request.get_json()
        
        if not data.get('name'):
            return jsonify({
                "success": False,
                "error": "Nome da categoria é obrigatório"
            }), 400
        
        # Mock response para criação
        new_category = {
            "id": 99,
            "name": data['name'],
            "slug": data.get('slug', data['name'].lower().replace(' ', '-')),
            "description": data.get('description', ''),
            "color": data.get('color', '#8B4513'),
            "is_active": True,
            "posts_count": 0,
            "created_at": datetime.utcnow().isoformat() + "Z"
        }
        
        return jsonify({
            "success": True,
            "message": "Categoria criada com sucesso",
            "category": new_category
        }), 201
        
    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500


# =============================================
# DASHBOARD ESPECÍFICO ENDPOINTS
# =============================================

@admin_bp.route("/dashboard/sales", methods=["GET"])
def get_dashboard_sales():
    """Dashboard específico de vendas"""
    try:
        end_date = datetime.now()
        start_date = end_date - timedelta(days=30)
        
        # Métricas de vendas
        total_orders = Order.query.filter(
            Order.created_at >= start_date,
            Order.created_at <= end_date
        ).count()
        
        total_revenue = db.session.query(func.sum(Order.total_amount)).filter(
            Order.created_at >= start_date,
            Order.created_at <= end_date,
            Order.status == 'completed'
        ).scalar() or 0
        
        return jsonify({
            'success': True,
            'data': {
                'sales_metrics': {
                    'total_orders': total_orders,
                    'total_revenue': float(total_revenue),
                    'period_days': 30
                }
            }
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': f'Erro ao carregar dashboard de vendas: {str(e)}'
        }), 500


@admin_bp.route("/dashboard/products", methods=["GET"])
def get_dashboard_products():
    """Dashboard específico de produtos"""
    try:
        total_products = Product.query.count()
        active_products = Product.query.filter(Product.is_active == True).count()
        
        return jsonify({
            'success': True,
            'data': {
                'product_metrics': {
                    'total_products': total_products,
                    'active_products': active_products
                }
            }
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': f'Erro ao carregar dashboard de produtos: {str(e)}'
        }), 500


@admin_bp.route("/dashboard/customers", methods=["GET"])
def get_dashboard_customers():
    """Dashboard específico de clientes"""
    try:
        total_customers = Customer.query.count()
        
        return jsonify({
            'success': True,
            'data': {
                'customer_metrics': {
                    'total_customers': total_customers
                }
            }
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': f'Erro ao carregar dashboard de clientes: {str(e)}'
        }), 500


@admin_bp.route("/dashboard/financial", methods=["GET"])
def get_dashboard_financial():
    """Dashboard específico financeiro"""
    try:
        total_revenue = db.session.query(func.sum(Order.total_amount)).filter(
            Order.status == 'completed'
        ).scalar() or 0
        
        return jsonify({
            'success': True,
            'data': {
                'financial_metrics': {
                    'total_revenue': float(total_revenue)
                }
            }
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': f'Erro ao carregar dashboard financeiro: {str(e)}'
        }), 500


@admin_bp.route("/analytics", methods=["GET"])
def get_admin_analytics():
    """Analytics gerais administrativos"""
    try:
        total_users = User.query.count()
        total_orders = Order.query.count()
        
        return jsonify({
            'success': True,
            'data': {
                'analytics': {
                    'total_users': total_users,
                    'total_orders': total_orders
                }
            }
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': f'Erro ao carregar analytics: {str(e)}'
        }), 500
