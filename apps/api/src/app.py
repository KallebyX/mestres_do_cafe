"""
Mestres do Café - Enterprise API
Sistema de e-commerce e ERP para torrefação artesanal
"""

import os
import sys

from dotenv import load_dotenv
from flask import Flask, jsonify, send_from_directory
from flask_cors import CORS

# Carrega variáveis de ambiente
load_dotenv()

# Adiciona o diretório src ao path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from .config import config
from .controllers.reviews import reviews_bp

# Importações dos controladores
from .controllers.routes.auth import auth_bp
from .controllers.routes.cart import cart_bp
from .controllers.routes.checkout import checkout_bp
from .controllers.routes.health import health_bp

# from .controllers.routes.products import products_bp as products_route_bp
# from .controllers.routes.blog import blog_bp
# from .controllers.routes.newsletter import newsletter_bp
from .controllers.routes.products import products_bp
from .controllers.shipping import shipping_bp
from .controllers.wishlist import wishlist_bp
from .middleware.error_handler import register_error_handlers

# Importações locais
from .models.database import db
from .models.products import Category, Product
from .models.user import User
from .utils.logger import setup_logger

# from controllers.orders import orders_bp


def create_app(config_name=None):
    """Factory function para criar a aplicação Flask"""
    app = Flask(
        __name__,
        static_folder=None,  # Desabilita serving automático de estáticos
        static_url_path="",
    )

    # Configurações baseadas no ambiente
    if config_name is None:
        config_name = os.environ.get("FLASK_ENV", "development")

    app.config.from_object(config[config_name])

    # Forçar o uso do banco de dados correto
    import pathlib

    db_path = pathlib.Path(__file__).parent.parent / "mestres_cafe.db"
    app.config["SQLALCHEMY_DATABASE_URI"] = f"sqlite:///{db_path.absolute()}"

    # Inicializar configurações específicas do ambiente
    config[config_name].init_app(app)

    # Desabilita redirects automáticos para resolver problema de CORS
    app.url_map.strict_slashes = False

    # Inicializa extensões
    db.init_app(app)

    # Configuração de CORS usando as configurações do ambiente
    CORS(
        app,
        origins=app.config["CORS_ORIGINS"],
        allow_headers=["Content-Type", "Authorization"],
        methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        supports_credentials=True,
    )

    # Registra error handlers
    register_error_handlers(app)

    # Configura logging
    logger = setup_logger(__name__)

    # Cria as tabelas do banco de dados automaticamente
    with app.app_context():
        try:
            # Debug da DATABASE_URI
            logger.info(f"🔧 DATABASE_URI: {app.config['SQLALCHEMY_DATABASE_URI']}")
            logger.info(f"📍 Working Directory: {os.getcwd()}")

            # TEMPORARIAMENTE COMENTADO - estava apagando dados existentes
            # db.create_all()
            logger.info("✅ Usando banco de dados existente")
        except Exception as e:
            logger.error(f"❌ Erro ao criar tabelas do banco: {e}")

    # Registra blueprints
    app.register_blueprint(auth_bp, url_prefix="/api/auth")
    app.register_blueprint(products_bp, url_prefix="/api/products")
    app.register_blueprint(cart_bp, url_prefix="/api/cart")
    app.register_blueprint(wishlist_bp, url_prefix="/api/wishlist")
    app.register_blueprint(reviews_bp, url_prefix="/api/reviews")
    app.register_blueprint(shipping_bp, url_prefix="/api/shipping")
    app.register_blueprint(checkout_bp)  # Já tem o prefixo /api/checkout
    app.register_blueprint(health_bp, url_prefix="/api")
    # app.register_blueprint(blog_bp, url_prefix='/api/blog')
    # app.register_blueprint(newsletter_bp, url_prefix='/api/newsletter')
    # app.register_blueprint(orders_bp, url_prefix='/api/orders')

    # Rota principal removida - será tratada pelo catch-all para servir React

    # Health check
    @app.route("/api/health")
    def health_check():
        return jsonify(
            {
                "status": "healthy",
                "service": "Mestres do Café API",
                "version": "1.0.0",
                "environment": os.environ.get("FLASK_ENV", "development"),
            }
        )

    # Rota de informações da API
    @app.route("/api/info")
    def api_info():
        return jsonify(
            {
                "name": "Mestres do Café Enterprise API",
                "version": "1.0.0",
                "description": "Sistema de e-commerce e ERP para torrefação artesanal",
                "endpoints": {
                    "auth": "/api/auth",
                    "products": "/api/products",
                    "cart": "/api/cart",
                    "wishlist": "/api/wishlist",
                    "reviews": "/api/reviews",
                    "shipping": "/api/shipping",
                    "blog": "/api/blog",
                    "newsletter": "/api/newsletter",
                    "testimonials": "/api/testimonials",
                    "orders": "/api/orders",
                    "health": "/api/health",
                },
            }
        )

    # Endpoint de testimonials (mock data)
    @app.route("/api/testimonials")
    def get_testimonials():
        return jsonify(
            [
                {
                    "id": 1,
                    "name": "Maria Silva",
                    "rating": 5,
                    "comment": "Café excepcional! O melhor que já experimentei.",
                    "image_url": None,
                    "created_at": "2024-01-15T10:30:00Z",
                },
                {
                    "id": 2,
                    "name": "João Santos",
                    "rating": 5,
                    "comment": "Qualidade impressionante e entrega rápida. Recomendo!",
                    "image_url": None,
                    "created_at": "2024-01-10T14:20:00Z",
                },
                {
                    "id": 3,
                    "name": "Ana Costa",
                    "rating": 4,
                    "comment": "Sabor único e aroma incrível. Voltarei a comprar!",
                    "image_url": None,
                    "created_at": "2024-01-05T09:15:00Z",
                },
            ]
        )

    # Rota catch-all para servir o React SPA
    @app.route("/", defaults={"path": ""})
    @app.route("/<path:path>")
    def serve_react_app(path):
        # Se for uma rota da API, deixa o Flask lidar normalmente
        if path.startswith("api/"):
            return jsonify({"error": "API endpoint not found"}), 404

        # Define o caminho dos arquivos estáticos
        static_folder = os.path.join(os.path.dirname(__file__), "..", "static")

        # Se for um arquivo estático (js, css, imagens, etc.), serve o arquivo
        if "." in path and not path.endswith(".html"):
            try:
                return send_from_directory(static_folder, path)
            except:
                return jsonify({"error": "Static file not found"}), 404

        # Para todas as outras rotas (incluindo /marketplace/product/1), serve o index.html (React SPA)
        try:
            return send_from_directory(static_folder, "index.html")
        except Exception as e:
            return jsonify({"error": "React app not found", "details": str(e)}), 404

    return app


def seed_initial_data():
    """Popula o banco com dados iniciais"""
    try:
        # Verifica se já existem dados
        if Product.query.first():
            print("✅ Dados iniciais já existem")
            return

        print(
            "✅ Seed data temporariamente desabilitado - aguardando correção do modelo"
        )

    except Exception as e:
        print(f"❌ Erro ao verificar dados iniciais: {e}")


# Cria a aplicação
app = create_app()

if __name__ == "__main__":
    with app.app_context():
        # Cria as tabelas
        db.create_all()
        # Popula dados iniciais
        seed_initial_data()

    # Configurações do servidor
    port = int(os.environ.get("PORT", os.environ.get("API_PORT", 5000)))
    debug = os.environ.get("FLASK_ENV") == "development"

    print(
        f"""
🚀 Mestres do Café Enterprise API
📍 Rodando em: http://localhost:{port}
🌐 Frontend: http://localhost:{port}
🔧 API Health: http://localhost:{port}/api/health
📊 API Info: http://localhost:{port}/api/info
🐛 Debug: {debug}
    """
    )

    app.run(host="0.0.0.0", port=port, debug=debug)
