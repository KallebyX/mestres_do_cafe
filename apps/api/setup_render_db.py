#!/usr/bin/env python3
"""
Script de setup automático do banco de dados para Render
Executa a inicialização completa do banco PostgreSQL
"""

import os
import sys
import logging
from pathlib import Path

# Configurar logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Configurar path
current_dir = Path(__file__).parent
src_dir = current_dir / 'src'
sys.path.insert(0, str(src_dir))

def setup_render_database():
    """Setup completo do banco de dados para Render"""
    try:
        logger.info("🚀 Iniciando setup do banco de dados para Render...")
        
        # Verificar se DATABASE_URL ou NEON_DATABASE_URL está disponível
        database_url = os.environ.get('NEON_DATABASE_URL') or os.environ.get('DATABASE_URL')
        if not database_url:
            logger.error("❌ NEON_DATABASE_URL ou DATABASE_URL não encontrada")
            return False
            
        logger.info("✅ URL do banco encontrada")
        
        # Importar dependências
        from src.app import create_app
        from src.database import db
        # Import models individually to avoid syntax error
        from src.models.auth import User
        from src.models.products import Product, ProductCategory
        from src.models.reviews import Review
        
        # Criar aplicação
        logger.info("🔧 Criando aplicação Flask...")
        app = create_app('production')
        
        with app.app_context():
            # Testar conexão
            logger.info("🔗 Testando conexão com PostgreSQL...")
            connection = db.engine.connect()
            connection.close()
            logger.info("✅ Conexão estabelecida com sucesso")
            
            # Verificar tabelas existentes
            logger.info("🔍 Verificando tabelas existentes...")
            result = db.session.execute(db.text("""
                SELECT table_name 
                FROM information_schema.tables 
                WHERE table_schema = 'public'
                ORDER BY table_name
            """)).fetchall()
            
            existing_tables = [row[0] for row in result]
            logger.info(f"📋 Tabelas existentes: {existing_tables}")
            
            # Criar tabelas se necessário
            if len(existing_tables) < 5:  # Esperamos pelo menos 5 tabelas principais
                logger.info("🔧 Criando tabelas do banco de dados...")
                db.create_all()
                
                # Verificar tabelas criadas
                result = db.session.execute(db.text("""
                    SELECT table_name 
                    FROM information_schema.tables 
                    WHERE table_schema = 'public'
                    ORDER BY table_name
                """)).fetchall()
                
                new_tables = [row[0] for row in result]
                logger.info(f"✅ Tabelas criadas: {new_tables}")
            else:
                logger.info("✅ Tabelas já existem, pulando criação")
            
            # Inserir dados de exemplo se necessário
            try:
                from src.models.products import Product
                from src.models.auth import User
                
                # Verificar se já existem produtos
                product_count = db.session.query(Product).count()
                if product_count == 0:
                    logger.info("🌱 Inserindo dados de exemplo...")
                    
                    # Criar usuário admin
                    admin_user = User(
                        email="admin@mestresdocafe.com.br",
                        name="Administrador",
                        password_hash="$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/8K.8K.8K",  # senha: admin123
                        is_admin=True,
                        is_active=True,
                        email_verified=True
                    )
                    db.session.add(admin_user)
                    
                    # Criar produtos de exemplo
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
                    
                    for product_data in sample_products:
                        product = Product(
                            weight=250,
                            track_inventory=True,
                            requires_shipping=True,
                            is_active=True,
                            **product_data
                        )
                        db.session.add(product)
                    
                    db.session.commit()
                    logger.info(f"✅ {len(sample_products)} produtos inseridos")
                else:
                    logger.info(f"✅ Banco já possui {product_count} produtos")
                    
            except Exception as e:
                logger.warning(f"⚠️ Erro ao inserir dados de exemplo: {e}")
                db.session.rollback()
            
            # Teste final
            logger.info("🧪 Executando teste final...")
            result = db.session.execute(db.text("SELECT 1")).fetchone()
            if result:
                logger.info("✅ Teste final bem-sucedido")
                return True
            else:
                logger.error("❌ Teste final falhou")
                return False
                
    except Exception as e:
        logger.error(f"❌ Erro no setup do banco: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == '__main__':
    success = setup_render_database()
    if success:
        logger.info("🎉 Setup do banco de dados concluído com sucesso!")
        sys.exit(0)
    else:
        logger.error("💥 Setup do banco de dados falhou!")
        sys.exit(1)
