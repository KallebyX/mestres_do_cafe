"""
Controller de Produtos - Mestres do Café Enterprise
"""

from flask import Blueprint, request, jsonify
from ..models.base import db
from ..models.products import Product, Category
from sqlalchemy.exc import IntegrityError

products_bp = Blueprint('products', __name__)


@products_bp.route('/', methods=['GET'])
def get_products():
    """Lista todos os produtos"""
    try:
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 10, type=int)
        category_id = request.args.get('category_id', type=int)
        
        query = Product.query.filter_by(is_active=True)
        
        if category_id:
            query = query.filter_by(category_id=category_id)
        
        products = query.paginate(
            page=page, 
            per_page=per_page, 
            error_out=False
        )
        
        return jsonify({
            'products': [product.to_dict() for product in products.items],
            'pagination': {
                'page': page,
                'per_page': per_page,
                'total': products.total,
                'pages': products.pages,
                'has_next': products.has_next,
                'has_prev': products.has_prev
            }
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@products_bp.route('/<int:product_id>', methods=['GET'])
def get_product(product_id):
    """Busca um produto específico"""
    try:
        product = Product.query.get_or_404(product_id)
        return jsonify(product.to_dict())
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@products_bp.route('/', methods=['POST'])
def create_product():
    """Cria um novo produto"""
    try:
        data = request.get_json()
        
        # Validações básicas
        if not data or not data.get('name') or not data.get('price'):
            return jsonify({'error': 'Nome e preço são obrigatórios'}), 400
        
        # Gera slug se não fornecido
        if not data.get('slug'):
            data['slug'] = data['name'].lower().replace(' ', '-')
        
        product = Product(
            name=data['name'],
            description=data.get('description'),
            slug=data['slug'],
            price=data['price'],
            weight=data.get('weight'),
            origin=data.get('origin'),
            sca_score=data.get('sca_score'),
            flavor_notes=data.get('flavor_notes', []),
            stock_quantity=data.get('stock_quantity', 0),
            category_id=data.get('category_id'),
            is_featured=data.get('is_featured', False)
        )
        
        db.session.add(product)
        db.session.commit()
        
        return jsonify(product.to_dict()), 201
        
    except IntegrityError:
        db.session.rollback()
        return jsonify({'error': 'Produto com este slug já existe'}), 400
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


@products_bp.route('/<int:product_id>', methods=['PUT'])
def update_product(product_id):
    """Atualiza um produto"""
    try:
        product = Product.query.get_or_404(product_id)
        data = request.get_json()
        
        if not data:
            return jsonify({'error': 'Dados não fornecidos'}), 400
        
        # Atualiza campos fornecidos
        for field in ['name', 'description', 'slug', 'price', 'weight', 'origin', 
                     'sca_score', 'flavor_notes', 'stock_quantity', 'category_id', 'is_featured']:
            if field in data:
                setattr(product, field, data[field])
        
        db.session.commit()
        
        return jsonify(product.to_dict())
        
    except IntegrityError:
        db.session.rollback()
        return jsonify({'error': 'Produto com este slug já existe'}), 400
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


@products_bp.route('/<int:product_id>', methods=['DELETE'])
def delete_product(product_id):
    """Remove um produto (soft delete)"""
    try:
        product = Product.query.get_or_404(product_id)
        product.is_active = False
        db.session.commit()
        
        return jsonify({'message': 'Produto removido com sucesso'})
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


@products_bp.route('/categories', methods=['GET'])
def get_categories():
    """Lista todas as categorias"""
    try:
        categories = Category.query.filter_by(is_active=True).all()
        return jsonify([category.to_dict() for category in categories])
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@products_bp.route('/categories', methods=['POST'])
def create_category():
    """Cria uma nova categoria"""
    try:
        data = request.get_json()
        
        if not data or not data.get('name'):
            return jsonify({'error': 'Nome é obrigatório'}), 400
        
        # Gera slug se não fornecido
        if not data.get('slug'):
            data['slug'] = data['name'].lower().replace(' ', '-')
        
        category = Category(
            name=data['name'],
            description=data.get('description'),
            slug=data['slug'],
            image_url=data.get('image_url')
        )
        
        db.session.add(category)
        db.session.commit()
        
        return jsonify(category.to_dict()), 201
        
    except IntegrityError:
        db.session.rollback()
        return jsonify({'error': 'Categoria com este slug já existe'}), 400
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


@products_bp.route('/featured', methods=['GET'])
def get_featured_products():
    """Lista produtos em destaque"""
    try:
        products = Product.query.filter_by(is_active=True, is_featured=True).limit(6).all()
        return jsonify([product.to_dict() for product in products])
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500 