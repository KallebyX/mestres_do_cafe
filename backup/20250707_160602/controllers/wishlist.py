from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from ..models.base import db
from ..models.wishlist import Wishlist, WishlistItem
from ..models.products import Product
from datetime import datetime

wishlist_bp = Blueprint('wishlist', __name__)

@wishlist_bp.route('/', methods=['GET'])
@jwt_required()
def get_wishlist():
    """Obter lista de favoritos do usuário"""
    try:
        user_id = get_jwt_identity()
        
        # Buscar wishlist do usuário
        wishlist = Wishlist.query.filter_by(user_id=user_id).first()
        
        if not wishlist:
            return jsonify({
                'success': True,
                'items': []
            })
        
        # Buscar itens da wishlist com dados dos produtos
        items = db.session.query(WishlistItem, Product).join(
            Product, WishlistItem.product_id == Product.id
        ).filter(WishlistItem.wishlist_id == wishlist.id).all()
        
        wishlist_items = []
        for item, product in items:
            wishlist_items.append({
                'id': item.id,
                'product_id': product.id,
                'product': {
                    'id': product.id,
                    'name': product.name,
                    'price': float(product.price),
                    'image_url': product.image_url,
                    'category': product.category.name if product.category else None
                },
                'added_at': item.created_at.isoformat()
            })
        
        return jsonify({
            'success': True,
            'items': wishlist_items
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@wishlist_bp.route('/add', methods=['POST'])
@jwt_required()
def add_to_wishlist():
    """Adicionar produto aos favoritos"""
    try:
        user_id = get_jwt_identity()
        data = request.get_json()
        
        product_id = data.get('product_id')
        if not product_id:
            return jsonify({
                'success': False,
                'error': 'Product ID é obrigatório'
            }), 400
        
        # Verificar se produto existe
        product = Product.query.get(product_id)
        if not product:
            return jsonify({
                'success': False,
                'error': 'Produto não encontrado'
            }), 404
        
        # Buscar ou criar wishlist do usuário
        wishlist = Wishlist.query.filter_by(user_id=user_id).first()
        if not wishlist:
            wishlist = Wishlist(user_id=user_id)
            db.session.add(wishlist)
            db.session.commit()
        
        # Verificar se produto já está na wishlist
        existing_item = WishlistItem.query.filter_by(
            wishlist_id=wishlist.id,
            product_id=product_id
        ).first()
        
        if existing_item:
            return jsonify({
                'success': False,
                'error': 'Produto já está nos favoritos'
            }), 400
        
        # Adicionar produto à wishlist
        wishlist_item = WishlistItem(
            wishlist_id=wishlist.id,
            product_id=product_id
        )
        db.session.add(wishlist_item)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Produto adicionado aos favoritos!'
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@wishlist_bp.route('/remove/<int:product_id>', methods=['DELETE'])
@jwt_required()
def remove_from_wishlist(product_id):
    """Remover produto dos favoritos"""
    try:
        user_id = get_jwt_identity()
        
        # Buscar wishlist do usuário
        wishlist = Wishlist.query.filter_by(user_id=user_id).first()
        if not wishlist:
            return jsonify({
                'success': False,
                'error': 'Wishlist não encontrada'
            }), 404
        
        # Buscar item na wishlist
        wishlist_item = WishlistItem.query.filter_by(
            wishlist_id=wishlist.id,
            product_id=product_id
        ).first()
        
        if not wishlist_item:
            return jsonify({
                'success': False,
                'error': 'Produto não está nos favoritos'
            }), 404
        
        # Remover item da wishlist
        db.session.delete(wishlist_item)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Produto removido dos favoritos!'
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@wishlist_bp.route('/toggle', methods=['POST'])
@jwt_required()
def toggle_wishlist():
    """Toggle produto na wishlist (adicionar/remover)"""
    try:
        user_id = get_jwt_identity()
        data = request.get_json()
        
        product_id = data.get('product_id')
        if not product_id:
            return jsonify({
                'success': False,
                'error': 'Product ID é obrigatório'
            }), 400
        
        # Verificar se produto existe
        product = Product.query.get(product_id)
        if not product:
            return jsonify({
                'success': False,
                'error': 'Produto não encontrado'
            }), 404
        
        # Buscar ou criar wishlist do usuário
        wishlist = Wishlist.query.filter_by(user_id=user_id).first()
        if not wishlist:
            wishlist = Wishlist(user_id=user_id)
            db.session.add(wishlist)
            db.session.commit()
        
        # Verificar se produto já está na wishlist
        existing_item = WishlistItem.query.filter_by(
            wishlist_id=wishlist.id,
            product_id=product_id
        ).first()
        
        if existing_item:
            # Remover da wishlist
            db.session.delete(existing_item)
            db.session.commit()
            return jsonify({
                'success': True,
                'action': 'removed',
                'message': 'Produto removido dos favoritos!'
            })
        else:
            # Adicionar à wishlist
            wishlist_item = WishlistItem(
                wishlist_id=wishlist.id,
                product_id=product_id
            )
            db.session.add(wishlist_item)
            db.session.commit()
            return jsonify({
                'success': True,
                'action': 'added',
                'message': 'Produto adicionado aos favoritos!'
            })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500