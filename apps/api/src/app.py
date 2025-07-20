"""
Mestres do Café - Enterprise API
Sistema de e-commerce e ERP para torrefação artesanal
"""

import os
import sys

from dotenv import load_dotenv
from flask import Flask, jsonify, send_from_directory, request
from flask_cors import CORS

# Carrega variáveis de ambiente
load_dotenv()

# Adiciona o diretório src ao path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

# Importações locais após configuração do path
from config import config
from database import init_db, health_check as db_health_check
from controllers.reviews_simple import reviews_bp
from controllers.routes.auth import auth_bp
from controllers.routes.cart import cart_bp
from controllers.routes.checkout import checkout_bp
from controllers.routes.health import health_bp
from controllers.routes.products import products_bp
from controllers.routes.customers import customers_bp
from controllers.routes.orders import orders_bp
from controllers.routes.payments import payments_bp
from controllers.routes.leads import leads_bp
from controllers.routes.coupons import coupons_bp
from controllers.routes.gamification import gamification_bp
from controllers.routes.blog import blog_bp
from controllers.routes.newsletter import newsletter_bp
from controllers.routes.notifications import notifications_bp
from controllers.routes.media import media_bp
from controllers.routes.financial import financial_bp
from controllers.routes.hr import hr_bp
from controllers.routes.admin import admin_bp
from controllers.routes.suppliers import suppliers_bp
from controllers.routes.vendors import vendors_bp
from controllers.routes.stock import stock_bp
from controllers.routes.escrow import escrow_bp
from controllers.routes.mercado_pago import mercado_pago_bp
from controllers.routes.melhor_envio import melhor_envio_bp
from controllers.routes.monitoring import monitoring_bp
from controllers.routes.security import security_bp
from controllers.routes.analytics import analytics_bp
from controllers.routes.recommendations import recommendations_bp
from controllers.routes.tenants import tenants_bp
from controllers.shipping import shipping_bp
from controllers.wishlist import wishlist_bp
from middleware.error_handler import register_error_handlers
from utils.logger import setup_logger
from utils.monitoring import init_monitoring
from utils.cache import init_cache_warmup
from middleware.security import init_security_middleware

# Supabase client
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

    # Inicializar configurações específicas do ambiente
    config[config_name].init_app(app)

    # Desabilita redirects automáticos para resolver problema de CORS
    app.url_map.strict_slashes = False

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

    # Inicializa SQLAlchemy
    init_db(app)
    logger.info("✅ SQLAlchemy inicializado com sucesso")
    
    # Inicializa sistema de monitoramento
    init_monitoring(app)
    
    # Inicializa middleware de segurança
    init_security_middleware(app)
    
    # Inicializa cache warming
    try:
        init_cache_warmup()
        logger.info("✅ Cache warming inicializado")
    except Exception as e:
        logger.warning(f"⚠️ Cache warming falhou: {e}")

    # Registra blueprints principais
    app.register_blueprint(auth_bp, url_prefix="/api/auth")
    app.register_blueprint(products_bp, url_prefix="/api/products")
    app.register_blueprint(cart_bp, url_prefix="/api/cart")
    app.register_blueprint(wishlist_bp, url_prefix="/api/wishlist")
    app.register_blueprint(reviews_bp, url_prefix="/api/reviews")
    app.register_blueprint(shipping_bp, url_prefix="/api/shipping")
    app.register_blueprint(checkout_bp)  # Já tem o prefixo /api/checkout
    app.register_blueprint(health_bp, url_prefix="/api")
    
    # Registra blueprints do sistema principal
    app.register_blueprint(customers_bp, url_prefix="/api/customers")
    app.register_blueprint(orders_bp, url_prefix="/api/orders")
    app.register_blueprint(payments_bp, url_prefix="/api/payments")
    
    # Registra blueprints de funcionalidades avançadas
    app.register_blueprint(leads_bp, url_prefix="/api/leads")
    app.register_blueprint(coupons_bp, url_prefix="/api/coupons")
    app.register_blueprint(gamification_bp, url_prefix="/api/gamification")
    app.register_blueprint(blog_bp, url_prefix="/api/blog")
    app.register_blueprint(newsletter_bp, url_prefix="/api/newsletter")
    app.register_blueprint(notifications_bp, url_prefix="/api/notifications")
    app.register_blueprint(media_bp, url_prefix="/api/media")
    app.register_blueprint(financial_bp, url_prefix="/api/financial")
    app.register_blueprint(hr_bp, url_prefix="/api/hr")
    app.register_blueprint(admin_bp, url_prefix="/api/admin")
    app.register_blueprint(suppliers_bp, url_prefix="/api/suppliers")
    app.register_blueprint(vendors_bp, url_prefix="/api/vendors")
    app.register_blueprint(stock_bp, url_prefix="/api/stock")
    app.register_blueprint(escrow_bp, url_prefix="/api/escrow")
    app.register_blueprint(mercado_pago_bp, url_prefix="/api/payments/mercadopago")
    app.register_blueprint(melhor_envio_bp, url_prefix="/api/shipping/melhor-envio")
    app.register_blueprint(monitoring_bp, url_prefix="/api/monitoring")
    app.register_blueprint(security_bp, url_prefix="/api/security")
    app.register_blueprint(analytics_bp, url_prefix="/api/analytics")
    app.register_blueprint(recommendations_bp, url_prefix="/api/recommendations")
    app.register_blueprint(tenants_bp, url_prefix="/api/tenants")

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
                "database": "PostgreSQL + SQLAlchemy",
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
                    "customers": "/api/customers",
                    "orders": "/api/orders",
                    "payments": "/api/payments",
                    "leads": "/api/leads",
                    "coupons": "/api/coupons",
                    "gamification": "/api/gamification",
                    "blog": "/api/blog",
                    "newsletter": "/api/newsletter",
                    "notifications": "/api/notifications",
                    "media": "/api/media",
                    "financial": "/api/financial",
                    "hr": "/api/hr",
                    "testimonials": "/api/testimonials",
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

    # Endpoint de courses (mock data)
    @app.route("/api/courses")
    def get_courses():
        active = request.args.get("active", "true").lower() == "true"
        
        courses = [
            {
                "id": 1,
                "title": "Introdução ao Café Especial",
                "description": "Aprenda os fundamentos do café especial",
                "instructor": "João Especialista",
                "duration": "2 horas",
                "price": 99.90,
                "image_url": None,
                "is_active": True,
                "created_at": "2024-01-01T10:00:00Z",
            },
            {
                "id": 2,
                "title": "Técnicas de Torra Avançadas",
                "description": "Domine as técnicas de torra profissionais",
                "instructor": "Maria Torra",
                "duration": "3 horas",
                "price": 149.90,
                "image_url": None,
                "is_active": True,
                "created_at": "2024-01-05T14:00:00Z",
            },
            {
                "id": 3,
                "title": "Cupping e Degustação",
                "description": "Desenvolva seu paladar para café especial",
                "instructor": "Carlos Degustador",
                "duration": "1.5 horas",
                "price": 79.90,
                "image_url": None,
                "is_active": False,
                "created_at": "2024-01-10T16:00:00Z",
            },
        ]
        
        if active:
            courses = [course for course in courses if course["is_active"]]
        
        return jsonify(courses)

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
        # if Product.query.first(): # This line is removed as Product model is no longer imported
        #     print("✅ Dados iniciais já existem")
        #     return

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
        # db.create_all() # This line is removed as Supabase is used
        # Popula dados iniciais
        seed_initial_data()

    # Configurações do servidor
    port = int(os.environ.get("PORT", os.environ.get("API_PORT", 5001)))
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
