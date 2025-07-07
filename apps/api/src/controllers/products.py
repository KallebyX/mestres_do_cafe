"""
Controller de Produtos - Mestres do Café Enterprise
"""

from flask import Blueprint, jsonify, request
from sqlalchemy.exc import IntegrityError

from ..models.base import db
from ..models.products import Category, Product

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


@products_bp.route('/debug/all', methods=['GET'])
def debug_all_products():
    """Debug - Lista TODOS os produtos sem filtro"""
    try:
        # Query sem filtro para testar se consegue acessar a tabela
        products = Product.query.limit(5).all()
        return jsonify({
            'total_found': len(products),
            'products': [{'id': p.id, 'name': p.name, 'is_active': p.is_active} for p in products]
        })
        
    except Exception as e:
        return jsonify({'error': str(e), 'type': type(e).__name__}), 500


@products_bp.route('/debug/raw-sql', methods=['GET'])
def debug_raw_sql():
    """Debug - Query SQL direta"""
    try:
        from sqlalchemy import text

        from ..models.base import db

        # Query SQL direta para testar acesso ao banco
        result = db.session.execute(text("SELECT id, name, is_active FROM products LIMIT 5")).fetchall()
        
        products = []
        for row in result:
            products.append({
                'id': row[0],
                'name': row[1],
                'is_active': row[2]
            })
        
        return jsonify({
            'source': 'raw_sql',
            'total_found': len(products),
            'products': products
        })
        
    except Exception as e:
        return jsonify({'error': str(e), 'type': type(e).__name__}), 500


@products_bp.route('/debug/db-info', methods=['GET'])
def debug_db_info():
    """Debug endpoint para verificar informações do banco"""
    import os
    import sqlite3

    from flask import current_app
    
    try:
        # Pegar URL do banco configurada
        db_url = current_app.config.get('SQLALCHEMY_DATABASE_URI', 'Not configured')
        
        # Verificar se o arquivo existe
        db_path = db_url.replace('sqlite:///', '') if db_url.startswith('sqlite:///') else 'Not a SQLite DB'
        file_exists = os.path.exists(db_path) if db_path != 'Not a SQLite DB' else False
        
        # Contar registros diretamente
        product_count = 0
        if file_exists:
            try:
                conn = sqlite3.connect(db_path)
                cursor = conn.cursor()
                cursor.execute("SELECT COUNT(*) FROM products")
                product_count = cursor.fetchone()[0]
                conn.close()
            except Exception as e:
                product_count = f"Error: {str(e)}"
        
        return jsonify({
            'database_uri': db_url,
            'database_path': db_path,
            'file_exists': file_exists,
            'product_count': product_count,
            'working_directory': os.getcwd()
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@products_bp.route('/debug/compare', methods=['GET'])
def debug_compare():
    """Debug endpoint para comparar SQLite direto vs SQLAlchemy com informações detalhadas"""
    import os
    import sqlite3

    from flask import current_app
    from sqlalchemy import text
    
    try:
        # Informações sobre o banco configurado
        db_url = current_app.config.get('SQLALCHEMY_DATABASE_URI', '')
        db_path = db_url.replace('sqlite:///', '') if db_url.startswith('sqlite:///') else ''
        abs_db_path = os.path.abspath(db_path) if db_path else None
        
        # Lista arquivos .db no diretório
        db_files = [f for f in os.listdir('.') if f.endswith('.db')]
        
        results = {
            'paths': {
                'configured_url': db_url,
                'relative_path': db_path,
                'absolute_path': abs_db_path,
                'file_exists': os.path.exists(db_path) if db_path else False,
                'file_size': os.path.getsize(db_path) if db_path and os.path.exists(db_path) else 0,
                'working_directory': os.getcwd(),
                'db_files_in_directory': db_files
            }
        }
        
        # 1. SQLite direto
        sqlite_products = []
        sqlite_total = 0
        table_info = []
        
        if db_path and os.path.exists(db_path):
            conn = sqlite3.connect(db_path)
            cursor = conn.cursor()
            
            # Conta total
            cursor.execute("SELECT COUNT(*) FROM products")
            sqlite_total = cursor.fetchone()[0]
            
            # Lista produtos
            cursor.execute("SELECT id, name, is_active, price FROM products LIMIT 5")
            for row in cursor.fetchall():
                sqlite_products.append({
                    'id': row[0],
                    'name': row[1],
                    'is_active': row[2],
                    'price': str(row[3]) if row[3] else None
                })
            
            # Info da tabela
            cursor.execute("PRAGMA table_info(products)")
            columns = cursor.fetchall()
            table_info = [
                {'name': col[1], 'type': col[2], 'nullable': not col[3], 'default': col[4]}
                for col in columns
            ]
            
            conn.close()
        
        # 2. SQLAlchemy ORM
        orm_products = []
        orm_error = None
        try:
            products = Product.query.limit(5).all()
            for p in products:
                orm_products.append({
                    'id': p.id,
                    'name': p.name,
                    'is_active': p.is_active,
                    'price': str(p.price) if p.price else None
                })
        except Exception as e:
            orm_error = str(e)
        
        # 3. SQLAlchemy raw SQL
        raw_sql_products = []
        raw_sql_error = None
        try:
            result = db.session.execute(text("SELECT id, name, is_active, price FROM products LIMIT 5"))
            for row in result:
                raw_sql_products.append({
                    'id': row[0],
                    'name': row[1],
                    'is_active': row[2],
                    'price': str(row[3]) if row[3] else None
                })
        except Exception as e:
            raw_sql_error = str(e)
        
        return jsonify({
            'paths': results['paths'],
            'table_info': table_info,
            'sqlite_direct': {
                'total_count': sqlite_total,
                'count': len(sqlite_products),
                'products': sqlite_products
            },
            'sqlalchemy_orm': {
                'count': len(orm_products),
                'products': orm_products,
                'error': orm_error
            },
            'sqlalchemy_raw': {
                'count': len(raw_sql_products),
                'products': raw_sql_products,
                'error': raw_sql_error
            }
        })
    except Exception as e:
        return jsonify({'error': str(e), 'type': type(e).__name__}), 500


@products_bp.route('/debug/fix-connection', methods=['GET'])
def debug_fix_connection():
    """Tenta forçar a reconexão do SQLAlchemy"""
    import os

    from flask import current_app
    from sqlalchemy import create_engine, text
    
    try:
        # Fecha conexões existentes
        db.session.close()
        db.engine.dispose()
        
        # Pega o caminho absoluto
        db_path = os.path.abspath('mestres_cafe.db')
        
        # Cria nova engine com caminho absoluto
        new_engine = create_engine(f'sqlite:///{db_path}', echo=True)
        
        # Testa a conexão
        with new_engine.connect() as conn:
            result = conn.execute(text("SELECT COUNT(*) FROM products"))
            count = result.scalar()
            
            result = conn.execute(text("SELECT id, name, is_active FROM products LIMIT 1"))
            product = result.fetchone()
            
        return jsonify({
            'status': 'success',
            'absolute_path': db_path,
            'count': count,
            'sample_product': {
                'id': product[0] if product else None,
                'name': product[1] if product else None,
                'is_active': product[2] if product else None
            } if product else None,
            'message': 'Conexão testada com sucesso'
        })
        
    except Exception as e:
        return jsonify({
            'status': 'error',
            'error': str(e),
            'type': type(e).__name__
        }), 500