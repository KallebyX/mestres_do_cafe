"""
Mestres do Café - Enterprise API
Sistema de e-commerce e ERP para torrefação artesanal
"""

import os
import sys
from dotenv import load_dotenv
from flask import Flask, send_from_directory, jsonify
from flask_cors import CORS

# Carrega variáveis de ambiente
load_dotenv()

# Adiciona o diretório src ao path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

# Importações locais
from models.database import db
from models.products import Product, Category
from models.user import User

# Importações dos controladores
from controllers.routes.auth import auth_bp
# from controllers.routes.products import products_bp as products_route_bp
# from controllers.routes.blog import blog_bp
# from controllers.routes.newsletter import newsletter_bp
from controllers.products import products_bp
from controllers.cart import cart_bp
# from controllers.orders import orders_bp

def create_app():
    """Factory function para criar a aplicação Flask"""
    app = Flask(__name__,
                static_folder=os.path.join(os.path.dirname(__file__), '..', '..', 'web'),
                static_url_path='')
    
    # Configurações
    app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'dev-secret-key-change-in-production')
    app.config['SQLALCHEMY_DATABASE_URI'] = os.environ.get('DATABASE_URL', 'sqlite:///mestres_cafe.db')
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    app.config['JWT_SECRET_KEY'] = os.environ.get('JWT_SECRET_KEY', 'jwt-secret-change-in-production')
    
    # Desabilita redirects automáticos para resolver problema de CORS
    app.url_map.strict_slashes = False
    
    # Inicializa extensões
    db.init_app(app)
    CORS(app, origins=["http://localhost:3000", "http://localhost:5173", "http://localhost:8080", "https://*.manus.space"])
    
    # Registra blueprints
    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(products_bp, url_prefix='/api/products')
    app.register_blueprint(cart_bp, url_prefix='/api/cart')
    # app.register_blueprint(blog_bp, url_prefix='/api/blog')
    # app.register_blueprint(newsletter_bp, url_prefix='/api/newsletter')
    # app.register_blueprint(orders_bp, url_prefix='/api/orders')
    
    # Rota principal - API básica
    @app.route('/')
    def index():
        return jsonify({
            'message': 'Mestres do Café Enterprise API',
            'status': 'running',
            'endpoints': {
                'health': '/api/health',
                'info': '/api/info'
            }
        })
    
    # Health check
    @app.route('/api/health')
    def health_check():
        return jsonify({
            'status': 'healthy',
            'service': 'Mestres do Café API',
            'version': '1.0.0',
            'environment': os.environ.get('FLASK_ENV', 'development')
        })
    
    # Rota de informações da API
    @app.route('/api/info')
    def api_info():
        return jsonify({
            'name': 'Mestres do Café Enterprise API',
            'version': '1.0.0',
            'description': 'Sistema de e-commerce e ERP para torrefação artesanal',
            'endpoints': {
                'auth': '/api/auth',
                'products': '/api/products',
                'cart': '/api/cart',
                'blog': '/api/blog',
                'newsletter': '/api/newsletter',
                'testimonials': '/api/testimonials',
                'orders': '/api/orders',
                'health': '/api/health'
            }
        })
    
    # Endpoint de testimonials (mock data)
    @app.route('/api/testimonials')
    def get_testimonials():
        return jsonify([
            {
                'id': 1,
                'name': 'Maria Silva',
                'rating': 5,
                'comment': 'Café excepcional! O melhor que já experimentei.',
                'image_url': None,
                'created_at': '2024-01-15T10:30:00Z'
            },
            {
                'id': 2,
                'name': 'João Santos',
                'rating': 5,
                'comment': 'Qualidade impressionante e entrega rápida. Recomendo!',
                'image_url': None,
                'created_at': '2024-01-10T14:20:00Z'
            },
            {
                'id': 3,
                'name': 'Ana Costa',
                'rating': 4,
                'comment': 'Sabor único e aroma incrível. Voltarei a comprar!',
                'image_url': None,
                'created_at': '2024-01-05T09:15:00Z'
            }
        ])
    
    return app

def seed_initial_data():
    """Popula o banco com dados iniciais"""
    try:
        # Verifica se já existem dados
        if Product.query.first():
            print("✅ Dados iniciais já existem")
            return
        
        print("✅ Seed data temporariamente desabilitado - aguardando correção do modelo")
        
    except Exception as e:
        print(f"❌ Erro ao verificar dados iniciais: {e}")

# Cria a aplicação
app = create_app()

if __name__ == '__main__':
    with app.app_context():
        # Cria as tabelas
        db.create_all()
        # Popula dados iniciais
        seed_initial_data()
    
    # Configurações do servidor
    port = int(os.environ.get('PORT', os.environ.get('API_PORT', 5001)))
    debug = os.environ.get('FLASK_ENV') == 'development'
    
    print(f"""
🚀 Mestres do Café Enterprise API
📍 Rodando em: http://localhost:{port}
🌐 Frontend: http://localhost:{port}
🔧 API Health: http://localhost:{port}/api/health
📊 API Info: http://localhost:{port}/api/info
🐛 Debug: {debug}
    """)
    
    app.run(host='0.0.0.0', port=port, debug=debug)

