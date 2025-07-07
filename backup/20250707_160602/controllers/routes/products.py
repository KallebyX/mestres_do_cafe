from flask import Blueprint, request, jsonify
from src.models.database import db, Product, Category

products_bp = Blueprint('products', __name__)

@products_bp.route('/', methods=['GET'])
def get_products():
    try:
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 12, type=int)
        category = request.args.get('category')
        search = request.args.get('search')
        
        query = Product.query.filter_by(is_active=True)
        
        if category:
            query = query.filter_by(category=category)
        
        if search:
            query = query.filter(Product.name.ilike(f'%{search}%'))
        
        products = query.paginate(
            page=page, 
            per_page=per_page, 
            error_out=False
        )
        
        return jsonify({
            'products': [{
                'id': product.id,
                'name': product.name,
                'description': product.description,
                'price': float(product.price),
                'image_url': product.image_url,
                'category': product.category,
                'origin': product.origin,
                'process': product.process,
                'variety': product.variety,
                'sca_score': product.sca_score,
                'roast_level': product.roast_level,
                'stock_quantity': product.stock_quantity
            } for product in products.items],
            'pagination': {
                'page': products.page,
                'pages': products.pages,
                'per_page': products.per_page,
                'total': products.total,
                'has_next': products.has_next,
                'has_prev': products.has_prev
            }
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@products_bp.route('/<product_id>', methods=['GET'])
def get_product(product_id):
    try:
        product = Product.query.get(product_id)
        
        if not product or not product.is_active:
            return jsonify({'error': 'Produto não encontrado'}), 404
        
        return jsonify({
            'product': {
                'id': product.id,
                'name': product.name,
                'description': product.description,
                'price': float(product.price),
                'image_url': product.image_url,
                'category': product.category,
                'origin': product.origin,
                'process': product.process,
                'variety': product.variety,
                'sca_score': product.sca_score,
                'roast_level': product.roast_level,
                'stock_quantity': product.stock_quantity,
                'created_at': product.created_at.isoformat()
            }
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@products_bp.route('/categories', methods=['GET'])
def get_categories():
    try:
        categories = Category.query.filter_by(is_active=True).all()
        
        return jsonify({
            'categories': [{
                'id': category.id,
                'name': category.name,
                'description': category.description,
                'image_url': category.image_url
            } for category in categories]
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@products_bp.route('/featured', methods=['GET'])
def get_featured_products():
    try:
        # Produtos em destaque (com maior pontuação SCA)
        products = Product.query.filter_by(is_active=True)\
                                .filter(Product.sca_score >= 85)\
                                .order_by(Product.sca_score.desc())\
                                .limit(6).all()
        
        return jsonify({
            'products': [{
                'id': product.id,
                'name': product.name,
                'description': product.description,
                'price': float(product.price),
                'image_url': product.image_url,
                'category': product.category,
                'origin': product.origin,
                'sca_score': product.sca_score,
                'roast_level': product.roast_level
            } for product in products]
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@products_bp.route('/search', methods=['GET'])
def search_products():
    try:
        query = request.args.get('q', '')
        if not query:
            return jsonify({'products': []})
        
        products = Product.query.filter_by(is_active=True)\
                                .filter(Product.name.ilike(f'%{query}%'))\
                                .limit(10).all()
        
        return jsonify({
            'products': [{
                'id': product.id,
                'name': product.name,
                'price': float(product.price),
                'image_url': product.image_url,
                'category': product.category
            } for product in products]
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

