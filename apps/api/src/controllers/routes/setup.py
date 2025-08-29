from flask import Blueprint, jsonify
from datetime import datetime

setup_bp = Blueprint('setup', __name__)

@setup_bp.route('/create-tables', methods=['POST'])
def create_tables():
    """Endpoint para criar tabelas manualmente"""
    try:
        from src.database import db
        from flask import current_app
        
        # Usar o contexto atual da aplicação
        db.create_all()
        
        # Verificar se tabelas foram criadas
        result = db.session.execute(db.text("""
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public'
        """)).fetchall()
        
        tables = [row[0] for row in result]
        
        return jsonify({
            'status': 'success',
            'message': 'Tables created successfully',
            'tables_created': len(tables),
            'tables': tables,
            'timestamp': datetime.utcnow().isoformat()
        }), 200
        
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': str(e),
            'timestamp': datetime.utcnow().isoformat()
        }), 500

@setup_bp.route('/insert-sample-data', methods=['POST'])
def insert_sample_data():
    """Endpoint para inserir dados de exemplo"""
    try:
        from src.database import db
        from src.models.products import Product, ProductCategory
        from datetime import datetime
        import uuid
        
        # Verificar se já existem produtos
        existing_products = Product.query.count()
        if existing_products > 0:
            return jsonify({
                'status': 'info',
                'message': f'Database already has {existing_products} products',
                'timestamp': datetime.utcnow().isoformat()
            }), 200
        
        # Criar categoria se não existir
        category = ProductCategory.query.filter_by(slug='cafes-especiais').first()
        if not category:
            category = ProductCategory(
                id=str(uuid.uuid4()),
                name='Cafés Especiais',
                slug='cafes-especiais',
                description='Cafés especiais de alta qualidade',
                is_active=True
            )
            db.session.add(category)
            db.session.commit()
        
        # Produtos de exemplo
        sample_products = [
            {
                'name': 'Catuai Amarelo 86+',
                'slug': 'catuai-amarelo-86',
                'description': 'Café especial com notas de caramelo e frutas tropicais',
                'price': 29.90,
                'origin': 'Alta Mogiana - SP',
                'roast_level': 'Médio',
                'sca_score': 86,
                'stock_quantity': 100,
                'is_featured': True,
                'flavor_notes': 'Caramelo, Frutas tropicais, Doce'
            },
            {
                'name': 'Arara 84+',
                'slug': 'arara-84',
                'description': 'Café com aroma intenso e corpo aveludado',
                'price': 27.90,
                'origin': 'Cerrado Mineiro - MG',
                'roast_level': 'Médio-escuro',
                'sca_score': 84,
                'stock_quantity': 80,
                'is_featured': True,
                'flavor_notes': 'Chocolate, Nozes, Corpo aveludado'
            },
            {
                'name': 'Bourbon Amarelo 88+',
                'slug': 'bourbon-amarelo-88',
                'description': 'Café premium com doçura natural e acidez equilibrada',
                'price': 34.90,
                'origin': 'Sul de Minas - MG',
                'roast_level': 'Médio-claro',
                'sca_score': 88,
                'stock_quantity': 60,
                'is_featured': True,
                'flavor_notes': 'Mel, Cítricos, Acidez equilibrada'
            }
        ]
        
        # Inserir produtos
        created_products = []
        for product_data in sample_products:
            product = Product(
                id=str(uuid.uuid4()),
                name=product_data['name'],
                slug=product_data['slug'],
                description=product_data['description'],
                price=product_data['price'],
                origin=product_data['origin'],
                roast_level=product_data['roast_level'],
                sca_score=product_data['sca_score'],
                stock_quantity=product_data['stock_quantity'],
                is_featured=product_data['is_featured'],
                is_active=True,
                flavor_notes=product_data['flavor_notes'],
                category_id=category.id,
                category='Cafés Especiais',
                weight=250,  # 250g padrão
                track_inventory=True,
                requires_shipping=True,
                created_at=datetime.utcnow()
            )
            db.session.add(product)
            created_products.append(product_data['name'])
        
        db.session.commit()
        
        return jsonify({
            'status': 'success',
            'message': 'Sample data inserted successfully',
            'products_created': len(created_products),
            'products': created_products,
            'category': category.name,
            'timestamp': datetime.utcnow().isoformat()
        }), 200
        
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': str(e),
            'timestamp': datetime.utcnow().isoformat()
        }), 500
