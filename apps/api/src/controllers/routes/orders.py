from flask import Blueprint, request, jsonify
from src.models.database import db, Order, OrderItem, Product, User

orders_bp = Blueprint('orders', __name__)

@orders_bp.route('/', methods=['GET'])
def get_orders():
    try:
        user_id = request.args.get('user_id')
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 10, type=int)
        
        query = Order.query
        if user_id:
            query = query.filter_by(user_id=user_id)
        
        orders = query.order_by(Order.created_at.desc())\
                     .paginate(page=page, per_page=per_page, error_out=False)
        
        return jsonify({
            'orders': [{
                'id': order.id,
                'user_id': order.user_id,
                'total_amount': float(order.total_amount),
                'status': order.status,
                'payment_status': order.payment_status,
                'created_at': order.created_at.isoformat(),
                'items_count': len(order.items)
            } for order in orders.items],
            'pagination': {
                'page': orders.page,
                'pages': orders.pages,
                'total': orders.total
            }
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@orders_bp.route('/<order_id>', methods=['GET'])
def get_order(order_id):
    try:
        order = Order.query.get(order_id)
        if not order:
            return jsonify({'error': 'Pedido não encontrado'}), 404
        
        return jsonify({
            'order': {
                'id': order.id,
                'user_id': order.user_id,
                'total_amount': float(order.total_amount),
                'status': order.status,
                'payment_status': order.payment_status,
                'shipping_address': order.shipping_address,
                'created_at': order.created_at.isoformat(),
                'items': [{
                    'id': item.id,
                    'product_id': item.product_id,
                    'product_name': item.product.name,
                    'quantity': item.quantity,
                    'unit_price': float(item.unit_price),
                    'total_price': float(item.total_price)
                } for item in order.items]
            }
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@orders_bp.route('/', methods=['POST'])
def create_order():
    try:
        data = request.get_json()
        user_id = data.get('user_id')
        items = data.get('items', [])
        shipping_address = data.get('shipping_address')
        
        if not user_id or not items:
            return jsonify({'error': 'user_id e items são obrigatórios'}), 400
        
        # Verificar se usuário existe
        user = User.query.get(user_id)
        if not user:
            return jsonify({'error': 'Usuário não encontrado'}), 404
        
        # Calcular total do pedido
        total_amount = 0
        order_items = []
        
        for item_data in items:
            product_id = item_data.get('product_id')
            quantity = item_data.get('quantity', 1)
            
            product = Product.query.get(product_id)
            if not product:
                return jsonify({'error': f'Produto {product_id} não encontrado'}), 404
            
            if product.stock_quantity < quantity:
                return jsonify({'error': f'Estoque insuficiente para {product.name}'}), 400
            
            item_total = float(product.price) * quantity
            total_amount += item_total
            
            order_items.append({
                'product': product,
                'quantity': quantity,
                'unit_price': product.price,
                'total_price': item_total
            })
        
        # Criar pedido
        order = Order(
            user_id=user_id,
            total_amount=total_amount,
            shipping_address=shipping_address
        )
        
        db.session.add(order)
        db.session.flush()  # Para obter o ID do pedido
        
        # Criar itens do pedido
        for item_data in order_items:
            order_item = OrderItem(
                order_id=order.id,
                product_id=item_data['product'].id,
                quantity=item_data['quantity'],
                unit_price=item_data['unit_price'],
                total_price=item_data['total_price']
            )
            db.session.add(order_item)
            
            # Atualizar estoque
            item_data['product'].stock_quantity -= item_data['quantity']
        
        # Adicionar pontos ao usuário (1 ponto por real gasto)
        points_earned = int(total_amount)
        user.points += points_earned
        user.total_spent += total_amount
        
        db.session.commit()
        
        return jsonify({
            'message': 'Pedido criado com sucesso',
            'order_id': order.id,
            'total_amount': float(order.total_amount),
            'points_earned': points_earned
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@orders_bp.route('/<order_id>/status', methods=['PUT'])
def update_order_status(order_id):
    try:
        data = request.get_json()
        new_status = data.get('status')
        
        if not new_status:
            return jsonify({'error': 'Status é obrigatório'}), 400
        
        order = Order.query.get(order_id)
        if not order:
            return jsonify({'error': 'Pedido não encontrado'}), 404
        
        order.status = new_status
        db.session.commit()
        
        return jsonify({
            'message': 'Status do pedido atualizado',
            'order_id': order.id,
            'new_status': order.status
        })
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

