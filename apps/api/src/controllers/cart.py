"""
Controller de Carrinho - Mestres do Café Enterprise
"""

from flask import Blueprint, request, jsonify
from models.base import db
from models.orders import Cart, CartItem
from models.products import Product

cart_bp = Blueprint('cart', __name__)


@cart_bp.route('/', methods=['GET'])
def get_cart():
    """Busca o carrinho do usuário"""
    try:
        # Por simplicidade, vamos usar session_id por enquanto
        session_id = request.headers.get('X-Session-ID', 'default-session')
        
        cart = Cart.query.filter_by(session_id=session_id).first()
        
        if not cart:
            return jsonify({
                'cart': {
                    'items': [],
                    'total_items': 0,
                    'total_amount': 0.0
                }
            })
        
        return jsonify({
            'cart': {
                'id': cart.id,
                'items': [item.to_dict() for item in cart.items],
                'total_items': cart.total_items,
                'total_amount': cart.total_amount
            }
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@cart_bp.route('/add', methods=['POST'])
def add_to_cart():
    """Adiciona item ao carrinho"""
    try:
        data = request.get_json()
        session_id = request.headers.get('X-Session-ID', 'default-session')
        
        if not data or not data.get('product_id') or not data.get('quantity'):
            return jsonify({'error': 'product_id e quantity são obrigatórios'}), 400
        
        product_id = data['product_id']
        quantity = data['quantity']
        
        # Verifica se o produto existe
        product = Product.query.get_or_404(product_id)
        
        # Busca ou cria o carrinho
        cart = Cart.query.filter_by(session_id=session_id).first()
        if not cart:
            cart = Cart(session_id=session_id)
            db.session.add(cart)
            db.session.flush()
        
        # Verifica se o item já existe no carrinho
        cart_item = CartItem.query.filter_by(
            cart_id=cart.id,
            product_id=product_id
        ).first()
        
        if cart_item:
            cart_item.quantity += quantity
        else:
            cart_item = CartItem(
                cart_id=cart.id,
                product_id=product_id,
                quantity=quantity
            )
            db.session.add(cart_item)
        
        db.session.commit()
        
        return jsonify({
            'message': 'Item adicionado ao carrinho',
            'cart': {
                'id': cart.id,
                'items': [item.to_dict() for item in cart.items],
                'total_items': cart.total_items,
                'total_amount': cart.total_amount
            }
        })
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


@cart_bp.route('/remove/<int:item_id>', methods=['DELETE'])
def remove_from_cart(item_id):
    """Remove item do carrinho"""
    try:
        cart_item = CartItem.query.get_or_404(item_id)
        cart = cart_item.cart
        
        db.session.delete(cart_item)
        db.session.commit()
        
        return jsonify({
            'message': 'Item removido do carrinho',
            'cart': {
                'id': cart.id,
                'items': [item.to_dict() for item in cart.items],
                'total_items': cart.total_items,
                'total_amount': cart.total_amount
            }
        })
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


@cart_bp.route('/update/<int:item_id>', methods=['PUT'])
def update_cart_item(item_id):
    """Atualiza quantidade de um item no carrinho"""
    try:
        data = request.get_json()
        
        if not data or not data.get('quantity'):
            return jsonify({'error': 'quantity é obrigatório'}), 400
        
        cart_item = CartItem.query.get_or_404(item_id)
        cart_item.quantity = data['quantity']
        
        db.session.commit()
        
        return jsonify({
            'message': 'Item atualizado',
            'cart': {
                'id': cart_item.cart.id,
                'items': [item.to_dict() for item in cart_item.cart.items],
                'total_items': cart_item.cart.total_items,
                'total_amount': cart_item.cart.total_amount
            }
        })
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


@cart_bp.route('/clear', methods=['DELETE'])
def clear_cart():
    """Limpa o carrinho"""
    try:
        session_id = request.headers.get('X-Session-ID', 'default-session')
        
        cart = Cart.query.filter_by(session_id=session_id).first()
        if cart:
            # Remove todos os itens
            CartItem.query.filter_by(cart_id=cart.id).delete()
            db.session.commit()
        
        return jsonify({'message': 'Carrinho limpo com sucesso'})
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500 