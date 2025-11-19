from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime
import subprocess
import os

setup_bp = Blueprint('setup', __name__)

@setup_bp.route('/fix-reviews-types', methods=['GET'])
@jwt_required()
def fix_reviews_types():
    """Corrige os tipos de dados da tabela reviews"""
    try:
        import psycopg2
        import os
        
        # Obter DATABASE_URL
        database_url = os.environ.get('DATABASE_URL')
        if not database_url:
            return jsonify({
                'status': 'error',
                'message': 'DATABASE_URL não encontrada'
            }), 500
        
        # Conectar ao banco
        conn = psycopg2.connect(database_url)
        cursor = conn.cursor()
        
        # SQL para alterar os tipos das colunas
        alter_sql = """
        ALTER TABLE reviews 
        ALTER COLUMN product_id TYPE UUID USING product_id::UUID,
        ALTER COLUMN user_id TYPE UUID USING user_id::UUID,
        ALTER COLUMN id TYPE UUID USING id::UUID;
        """
        
        cursor.execute(alter_sql)
        conn.commit()
        
        conn.close()
        
        return jsonify({
            'status': 'success',
            'message': 'Tipos da tabela reviews corrigidos',
            'timestamp': datetime.utcnow().isoformat()
        })
        
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': f'Erro ao corrigir tipos da tabela reviews: {str(e)}',
            'timestamp': datetime.utcnow().isoformat()
        }), 500

@setup_bp.route('/create-reviews', methods=['GET'])
@jwt_required()
def create_reviews_table():
    """Cria a tabela reviews diretamente no banco"""
    try:
        import psycopg2
        import os
        
        # Obter DATABASE_URL
        database_url = os.environ.get('DATABASE_URL')
        if not database_url:
            return jsonify({
                'status': 'error',
                'message': 'DATABASE_URL não encontrada'
            }), 500
        
        # Conectar ao banco
        conn = psycopg2.connect(database_url)
        cursor = conn.cursor()
        
        # SQL para criar a tabela reviews
        create_table_sql = """
        CREATE TABLE IF NOT EXISTS reviews (
            id VARCHAR(36) PRIMARY KEY DEFAULT (gen_random_uuid()::text),
            product_id VARCHAR(36) NOT NULL,
            user_id VARCHAR(36),
            rating INTEGER NOT NULL,
            title VARCHAR(255),
            comment TEXT,
            is_verified BOOLEAN DEFAULT FALSE,
            is_approved BOOLEAN DEFAULT TRUE,
            is_featured BOOLEAN DEFAULT FALSE,
            helpful_count INTEGER DEFAULT 0,
            not_helpful_count INTEGER DEFAULT 0,
            pros JSON,
            cons JSON,
            images JSON,
            recommend BOOLEAN DEFAULT TRUE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        """
        
        cursor.execute(create_table_sql)
        conn.commit()
        
        # Verificar se foi criada
        cursor.execute("""
            SELECT COUNT(*) FROM information_schema.tables 
            WHERE table_name = 'reviews'
        """)
        count = cursor.fetchone()[0]
        
        conn.close()
        
        return jsonify({
            'status': 'success',
            'message': 'Tabela reviews criada com sucesso',
            'table_exists': count > 0,
            'timestamp': datetime.utcnow().isoformat()
        })
        
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': f'Erro ao criar tabela reviews: {str(e)}',
            'timestamp': datetime.utcnow().isoformat()
        }), 500

@setup_bp.route('/check-schema', methods=['GET'])
@jwt_required()
def check_database_schema():
    """Endpoint para verificar o schema da tabela products"""
    try:
        from database import db
        from sqlalchemy import text
        
        # Verificar estrutura da tabela products
        result = db.session.execute(text("""
            SELECT column_name, data_type, is_nullable 
            FROM information_schema.columns 
            WHERE table_name = 'products' 
            ORDER BY ordinal_position
        """))
        
        columns = []
        for row in result:
            columns.append({
                'name': row[0],
                'type': row[1],
                'nullable': row[2]
            })
        
        return jsonify({
            'status': 'success',
            'table': 'products',
            'columns': columns,
            'total_columns': len(columns),
            'timestamp': datetime.utcnow().isoformat()
        }), 200
        
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': str(e),
            'timestamp': datetime.utcnow().isoformat()
        }), 500

@setup_bp.route('/test', methods=['GET'])
@jwt_required()
def test_endpoint():
    """Endpoint simples para testar se a API está funcionando"""
    return jsonify({
        'status': 'success',
        'message': 'Setup API is working',
        'timestamp': datetime.utcnow().isoformat()
    }), 200

@setup_bp.route('/force-init', methods=['POST', 'GET'])
@jwt_required()
def force_init_database():
    """Endpoint para forçar inicialização completa do banco"""
    try:
        # Executar script de inicialização forçada
        script_path = os.path.join(os.path.dirname(__file__), '..', '..', '..', 'force_init_db.py')
        result = subprocess.run(['python', script_path], 
                              capture_output=True, 
                              text=True, 
                              timeout=120)
        
        if result.returncode == 0:
            return jsonify({
                'status': 'success',
                'message': 'Database initialized successfully',
                'output': result.stdout,
                'timestamp': datetime.utcnow().isoformat()
            }), 200
        else:
            return jsonify({
                'status': 'error',
                'message': 'Database initialization failed',
                'error': result.stderr,
                'output': result.stdout,
                'timestamp': datetime.utcnow().isoformat()
            }), 500
            
    except subprocess.TimeoutExpired:
        return jsonify({
            'status': 'error',
            'message': 'Database initialization timed out',
            'timestamp': datetime.utcnow().isoformat()
        }), 500
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': str(e),
            'timestamp': datetime.utcnow().isoformat()
        }), 500

@setup_bp.route('/create-tables', methods=['POST'])
@jwt_required()
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

@setup_bp.route('/setup-render-db', methods=['POST', 'GET'])
@jwt_required()
def setup_render_database():
    """Endpoint para executar o setup completo do banco para Render"""
    try:
        # Executar script de setup do Render
        script_path = os.path.join(os.path.dirname(__file__), '..', '..', '..', 'setup_render_db.py')
        result = subprocess.run(['python', script_path], 
                              capture_output=True, 
                              text=True, 
                              timeout=180)
        
        if result.returncode == 0:
            return jsonify({
                'status': 'success',
                'message': 'Render database setup completed successfully',
                'output': result.stdout,
                'timestamp': datetime.utcnow().isoformat()
            }), 200
        else:
            return jsonify({
                'status': 'error',
                'message': 'Render database setup failed',
                'error': result.stderr,
                'output': result.stdout,
                'timestamp': datetime.utcnow().isoformat()
            }), 500
            
    except subprocess.TimeoutExpired:
        return jsonify({
            'status': 'error',
            'message': 'Render database setup timed out (3 minutes)',
            'timestamp': datetime.utcnow().isoformat()
        }), 500
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': str(e),
            'timestamp': datetime.utcnow().isoformat()
        }), 500

@setup_bp.route('/migrate-to-neon', methods=['POST', 'GET'])
@jwt_required()
def migrate_to_neon():
    """Endpoint para migrar dados para Neon Database"""
    try:
        # Executar script de migração
        script_path = os.path.join(os.path.dirname(__file__), '..', '..', '..', 'migrate_to_neon.py')
        result = subprocess.run(['python', script_path], 
                              capture_output=True, 
                              text=True, 
                              timeout=300)  # 5 minutos
        
        if result.returncode == 0:
            return jsonify({
                'status': 'success',
                'message': 'Migration to Neon completed successfully',
                'output': result.stdout,
                'timestamp': datetime.utcnow().isoformat()
            }), 200
        else:
            return jsonify({
                'status': 'error',
                'message': 'Migration to Neon failed',
                'error': result.stderr,
                'output': result.stdout,
                'timestamp': datetime.utcnow().isoformat()
            }), 500
            
    except subprocess.TimeoutExpired:
        return jsonify({
            'status': 'error',
            'message': 'Migration to Neon timed out (5 minutes)',
            'timestamp': datetime.utcnow().isoformat()
        }), 500
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': str(e),
            'timestamp': datetime.utcnow().isoformat()
        }), 500

@setup_bp.route('/insert-sample-data', methods=['POST'])
@jwt_required()
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
