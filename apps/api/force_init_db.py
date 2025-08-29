#!/usr/bin/env python3
"""
Script de inicialização forçada do banco de dados
Para ser usado via endpoint quando o build automático falha
"""

import os
import sys
from pathlib import Path

# Configurar path
current_dir = Path(__file__).parent
src_dir = current_dir / 'src'
sys.path.insert(0, str(src_dir))

def force_init_database():
    """Força a inicialização do banco de dados"""
    try:
        print("🔄 Iniciando inicialização forçada do banco...")
        
        # Importações dinâmicas para evitar problemas de contexto
        from flask import Flask
        from flask_sqlalchemy import SQLAlchemy
        import uuid
        from datetime import datetime
        
        # Criar app temporária
        app = Flask(__name__)
        
        # Configurar banco
        database_url = os.environ.get('DATABASE_URL')
        if not database_url:
            print("❌ DATABASE_URL não encontrada")
            return False
            
        # Fix postgres:// para postgresql://
        if database_url.startswith("postgres://"):
            database_url = database_url.replace("postgres://", "postgresql://", 1)
        
        app.config['SQLALCHEMY_DATABASE_URI'] = database_url
        app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
        
        # Inicializar SQLAlchemy
        db = SQLAlchemy()
        db.init_app(app)
        
        with app.app_context():
            # Definir modelos diretamente aqui para evitar problemas de import
            
            # Categoria de Produtos
            class ProductCategory(db.Model):
                __tablename__ = 'product_categories'
                
                id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
                name = db.Column(db.String(100), nullable=False)
                slug = db.Column(db.String(100), unique=True, nullable=False)
                description = db.Column(db.Text)
                is_active = db.Column(db.Boolean, default=True)
                created_at = db.Column(db.DateTime, default=datetime.utcnow)
                updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
            
            # Produtos
            class Product(db.Model):
                __tablename__ = 'products'
                
                id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
                name = db.Column(db.String(200), nullable=False)
                slug = db.Column(db.String(200), unique=True, nullable=False)
                description = db.Column(db.Text)
                short_description = db.Column(db.String(500))
                sku = db.Column(db.String(100), unique=True)
                
                # Categoria
                category_id = db.Column(db.String(36), db.ForeignKey('product_categories.id'))
                category = db.Column(db.String(100))  # Para compatibilidade
                
                # Fornecedor
                supplier_id = db.Column(db.String(36))  # Para compatibilidade com o modelo real
                
                # Preços
                price = db.Column(db.Numeric(10, 2), nullable=False)
                cost_price = db.Column(db.Numeric(10, 2))
                compare_price = db.Column(db.Numeric(10, 2))
                promotional_price = db.Column(db.Numeric(10, 2))
                
                # Estoque
                stock_quantity = db.Column(db.Integer, default=0)
                min_stock_level = db.Column(db.Integer, default=5)
                max_stock_level = db.Column(db.Integer, default=1000)
                track_inventory = db.Column(db.Boolean, default=True)
                
                # Características do café
                origin = db.Column(db.String(200))
                process = db.Column(db.String(100))
                roast_level = db.Column(db.String(50))
                sca_score = db.Column(db.Integer)
                acidity = db.Column(db.Integer)
                sweetness = db.Column(db.Integer)
                body = db.Column(db.Integer)
                flavor_notes = db.Column(db.Text)
                
                # Físicas
                weight = db.Column(db.Integer)  # em gramas
                dimensions = db.Column(db.String(100))
                
                # Status
                is_active = db.Column(db.Boolean, default=True)
                is_featured = db.Column(db.Boolean, default=False)
                is_digital = db.Column(db.Boolean, default=False)
                requires_shipping = db.Column(db.Boolean, default=True)
                
                # SEO
                meta_title = db.Column(db.String(200))
                meta_description = db.Column(db.Text)
                
                # Mídia
                image_url = db.Column(db.String(500))
                gallery_images = db.Column(db.JSON)
                
                # Timestamps
                created_at = db.Column(db.DateTime, default=datetime.utcnow)
                updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
                
                # Propriedades calculadas
                @property
                def in_stock(self):
                    return self.stock_quantity > 0 if self.track_inventory else True
                
                @property
                def average_rating(self):
                    return 4.5  # Valor fixo por enquanto
            
            # Criar todas as tabelas
            print("🔧 Criando tabelas...")
            
            # Dropar tabelas se existirem para recriar com schema correto
            db.session.execute(db.text("DROP TABLE IF EXISTS products CASCADE"))
            db.session.execute(db.text("DROP TABLE IF EXISTS product_categories CASCADE"))
            db.session.commit()
            
            db.create_all()
            
            # Verificar tabelas criadas
            result = db.session.execute(db.text("""
                SELECT table_name 
                FROM information_schema.tables 
                WHERE table_schema = 'public'
            """)).fetchall()
            
            tables = [row[0] for row in result]
            print(f"✅ Tabelas criadas: {tables}")
            
            # Inserir dados de exemplo se não existirem
            existing_products = db.session.execute(db.text("SELECT COUNT(*) FROM products")).scalar()
            
            if existing_products == 0:
                print("🌱 Inserindo dados de exemplo...")
                
                # Criar categoria
                category = ProductCategory(
                    id=str(uuid.uuid4()),
                    name='Cafés Especiais',
                    slug='cafes-especiais',
                    description='Cafés especiais de alta qualidade'
                )
                db.session.add(category)
                db.session.flush()  # Para obter o ID
                
                # Criar produtos
                products_data = [
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
                
                for product_data in products_data:
                    product = Product(
                        id=str(uuid.uuid4()),
                        category_id=category.id,
                        category='Cafés Especiais',
                        weight=250,
                        track_inventory=True,
                        requires_shipping=True,
                        is_active=True,
                        **product_data
                    )
                    db.session.add(product)
                
                db.session.commit()
                print(f"✅ {len(products_data)} produtos inseridos")
            else:
                print(f"✅ Banco já possui {existing_products} produtos")
            
            return True
            
    except Exception as e:
        print(f"❌ Erro na inicialização forçada: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == '__main__':
    success = force_init_database()
    print("✅ Sucesso!" if success else "❌ Falhou!")
    sys.exit(0 if success else 1)
