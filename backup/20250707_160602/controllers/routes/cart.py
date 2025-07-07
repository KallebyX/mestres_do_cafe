from flask import Blueprint, request, jsonify
from src.models.database import db, CartItem, Product, User
from datetime import datetime
import uuid

cart_bp = Blueprint('cart', __name__, url_prefix='/api/cart')

# ========== ROTAS DO CARRINHO ========== #

@cart_bp.route('/items', methods=['GET'])
def get_cart_items():
    """Listar itens do carrinho do usuário"""
    try:
        user_id = request.args.get('user_id')
        if not user_id:
            return jsonify({'error': 'user_id é obrigatório'}), 400
        
        # Buscar itens do carrinho com detalhes do produto
        cart_items = db.session.query(CartItem, Product).join(Product).filter(
            CartItem.user_id == user_id
        ).all()
        
        items = []
        total = 0
        
        for cart_item, product in cart_items:
            item_total = float(product.price) * cart_item.quantity
            total += item_total
            
            items.append({
                'id': cart_item.id,
                'product_id': cart_item.product_id,
                'quantity': cart_item.quantity,
                'created_at': cart_item.created_at.isoformat(),
                'updated_at': cart_item.updated_at.isoformat(),
                'product': {
                    'id': product.id,
                    'name': product.name,
                    'description': product.description,
                    'price': float(product.price),
                    'image_url': product.image_url,
                    'category': product.category,
                    'stock_quantity': product.stock_quantity,
                    'is_active': product.is_active
                },
                'subtotal': item_total
            })
        
        return jsonify({
            'items': items,
            'total': total,
            'items_count': len(items)
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@cart_bp.route('/items', methods=['POST'])
def add_to_cart():
    """Adicionar produto ao carrinho"""
    try:
        data = request.get_json()
        user_id = data.get('user_id')
        product_id = data.get('product_id')
        quantity = data.get('quantity', 1)
        
        if not user_id or not product_id:
            return jsonify({'error': 'user_id e product_id são obrigatórios'}), 400
        
        # Verificar se o produto existe e está ativo
        product = Product.query.filter_by(id=product_id, is_active=True).first()
        if not product:
            return jsonify({'error': 'Produto não encontrado ou inativo'}), 404
        
        # Verificar se já existe no carrinho
        existing_item = CartItem.query.filter_by(
            user_id=user_id, 
            product_id=product_id
        ).first()
        
        if existing_item:
            # Atualizar quantidade
            existing_item.quantity += quantity
            existing_item.updated_at = datetime.utcnow()
        else:
            # Criar novo item
            cart_item = CartItem(
                user_id=user_id,
                product_id=product_id,
                quantity=quantity
            )
            db.session.add(cart_item)
        
        db.session.commit()
        
        return jsonify({'message': 'Produto adicionado ao carrinho'}), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@cart_bp.route('/items/<item_id>', methods=['PUT'])
def update_cart_item(item_id):
    """Atualizar quantidade de um item do carrinho"""
    try:
        data = request.get_json()
        quantity = data.get('quantity')
        
        if quantity is None:
            return jsonify({'error': 'quantity é obrigatório'}), 400
        
        if quantity <= 0:
            return jsonify({'error': 'quantity deve ser maior que zero'}), 400
        
        cart_item = CartItem.query.get(item_id)
        if not cart_item:
            return jsonify({'error': 'Item do carrinho não encontrado'}), 404
        
        cart_item.quantity = quantity
        cart_item.updated_at = datetime.utcnow()
        db.session.commit()
        
        return jsonify({'message': 'Quantidade atualizada'})
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@cart_bp.route('/items/<item_id>', methods=['DELETE'])
def remove_from_cart(item_id):
    """Remover item do carrinho"""
    try:
        cart_item = CartItem.query.get(item_id)
        if not cart_item:
            return jsonify({'error': 'Item do carrinho não encontrado'}), 404
        
        db.session.delete(cart_item)
        db.session.commit()
        
        return jsonify({'message': 'Item removido do carrinho'})
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@cart_bp.route('/clear', methods=['DELETE'])
def clear_cart():
    """Limpar todo o carrinho do usuário"""
    try:
        user_id = request.args.get('user_id')
        if not user_id:
            return jsonify({'error': 'user_id é obrigatório'}), 400
        
        CartItem.query.filter_by(user_id=user_id).delete()
        db.session.commit()
        
        return jsonify({'message': 'Carrinho limpo'})
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@cart_bp.route('/count', methods=['GET'])
def get_cart_count():
    """Obter quantidade de itens no carrinho"""
    try:
        user_id = request.args.get('user_id')
        if not user_id:
            return jsonify({'error': 'user_id é obrigatório'}), 400
        
        count = db.session.query(db.func.sum(CartItem.quantity)).filter(
            CartItem.user_id == user_id
        ).scalar() or 0
        
        return jsonify({'count': int(count)})
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# ========== ROTAS ADMIN ========== #

@cart_bp.route('/admin/all', methods=['GET'])
def get_all_carts():
    """Listar todos os carrinhos (admin)"""
    try:
        # Aqui você pode adicionar verificação de admin se necessário
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 20, type=int)
        
        # Buscar carrinhos agrupados por usuário
        query = db.session.query(
            CartItem.user_id,
            User.name.label('user_name'),
            User.email.label('user_email'),
            db.func.count(CartItem.id).label('items_count'),
            db.func.sum(CartItem.quantity).label('total_quantity')
        ).join(User).group_by(CartItem.user_id, User.name, User.email)
        
        pagination = query.paginate(page=page, per_page=per_page, error_out=False)
        
        carts = []
        for user_id, user_name, user_email, items_count, total_quantity in pagination.items:
            # Calcular total do carrinho
            cart_total = db.session.query(
                db.func.sum(Product.price * CartItem.quantity)
            ).join(CartItem).filter(CartItem.user_id == user_id).scalar() or 0
            
            carts.append({
                'user_id': user_id,
                'user_name': user_name,
                'user_email': user_email,
                'items_count': items_count,
                'total_quantity': int(total_quantity),
                'total_value': float(cart_total)
            })
        
        return jsonify({
            'carts': carts,
            'pagination': {
                'page': pagination.page,
                'pages': pagination.pages,
                'total': pagination.total
            }
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@cart_bp.route('/admin/user/<user_id>', methods=['GET'])
def get_user_cart(user_id):
    """Obter carrinho de um usuário específico (admin)"""
    try:
        # Verificar se o usuário existe
        user = User.query.get(user_id)
        if not user:
            return jsonify({'error': 'Usuário não encontrado'}), 404
        
        # Buscar itens do carrinho
        cart_items = db.session.query(CartItem, Product).join(Product).filter(
            CartItem.user_id == user_id
        ).all()
        
        items = []
        total = 0
        
        for cart_item, product in cart_items:
            item_total = float(product.price) * cart_item.quantity
            total += item_total
            
            items.append({
                'id': cart_item.id,
                'product_id': cart_item.product_id,
                'quantity': cart_item.quantity,
                'created_at': cart_item.created_at.isoformat(),
                'product': {
                    'id': product.id,
                    'name': product.name,
                    'price': float(product.price),
                    'image_url': product.image_url
                },
                'subtotal': item_total
            })
        
        return jsonify({
            'user': {
                'id': user.id,
                'name': user.name,
                'email': user.email
            },
            'items': items,
            'total': total,
            'items_count': len(items)
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500 