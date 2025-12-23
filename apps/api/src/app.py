"""
Mestres do Café - Enterprise API
Sistema de e-commerce e ERP para torrefação artesanal
"""

import os
import sys

from dotenv import load_dotenv
from flask import Flask, jsonify, request, send_from_directory
from flask_cors import CORS
from flask_jwt_extended import JWTManager

# Carrega variáveis de ambiente do caminho correto
load_dotenv(os.path.join(os.path.dirname(__file__), "..", ".env"))

# Adiciona o diretório src ao path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

# Importações locais após configuração do path
try:
    from config import config
    from database import health_check as db_health_check
    from database import init_db
    from controllers.reviews_simple import reviews_bp
    from controllers.routes.auth import auth_bp
    from controllers.routes.cart import cart_bp
    from controllers.routes.checkout import checkout_bp
    from controllers.routes.health import health_bp
    from controllers.routes.products import products_bp
    from controllers.routes.customers import customers_bp
    from controllers.routes.orders import orders_bp
    from controllers.routes.payments import payments_bp
    from controllers.routes.admin import admin_bp
    from controllers.routes.admin_products import admin_products_bp
    from controllers.routes.coupons import coupons_bp
    from controllers.routes.analytics import analytics_bp  # Analytics tracking
    from controllers.routes.notifications import notifications_bp  # REATIVADO: serviço implementado
    from controllers.routes.melhor_envio import melhor_envio_bp  # REATIVADO: serviço implementado
    
    # Mercado Pago - sistema de pagamentos
    try:
        from services.mercado_pago_service import MercadoPagoService
        from services.event_system import event_system, EventType
        from services.webhook_processor import webhook_processor
        from controllers.routes.mercado_pago import mercado_pago_bp
    except ImportError as e:
        pass  # Sistema Mercado Pago opcional
    except Exception as e:
        pass  # Sistema Mercado Pago opcional
    
    from controllers.routes.security import security_bp
    from controllers.routes.stock import stock_bp

    # Novos módulos implementados
    from controllers.routes.blog import blog_bp
    from controllers.routes.gamification import gamification_bp
    from controllers.routes.newsletter import newsletter_bp
    from controllers.routes.hr import hr_bp

    # Módulos avançados implementados
    from controllers.routes.pdv import pdv_bp
    from controllers.routes.erp import erp_bp
    from controllers.routes.financial import financial_bp
    from controllers.routes.crm import crm_bp
    from controllers.routes.media import media_bp
    from controllers.routes.settings import settings_bp

    # from services.webhook_processor import webhook_processor  # REMOVIDO: depende de services/
    from middleware.error_handler import register_error_handlers
    from middleware.security import init_security_middleware
    from middleware.rate_limiting import init_rate_limiting
    from middleware.audit_logging import init_audit_logging
    from utils.cache import init_cache_warmup
    from utils.logger import setup_logger
    from utils.monitoring import init_monitoring

except ImportError as e:
    print(f"❌ [DEBUG] ERRO DE IMPORTAÇÃO: {e}")
    print(
        f"❌ [DEBUG] Módulo faltando: {e.name if hasattr(e, 'name') else 'desconhecido'}"
    )
    raise
except Exception as e:
    print(f"❌ [DEBUG] ERRO INESPERADO NA IMPORTAÇÃO: {e}")
    print(f"❌ [DEBUG] Tipo do erro: {type(e).__name__}")
    raise

# Supabase client
# from controllers.orders import orders_bp


def create_app(config_name = None):
    """Factory function para criar a aplicação Flask"""
    app = Flask(
        __name__,
        static_folder = None,  # Desabilita serving automático de estáticos
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
        origins = app.config["CORS_ORIGINS"],
        allow_headers=["Content-Type", "Authorization"],
        methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        supports_credentials = True,
    )

    # Registra error handlers
    register_error_handlers(app)

    # Configura logging
    logger = setup_logger(__name__)

    # Inicializa SQLAlchemy
    init_db(app)
    logger.info("✅ SQLAlchemy inicializado com sucesso")

    # Inicializa JWTManager
    jwt = JWTManager(app)
    logger.info("✅ JWTManager inicializado com sucesso")

    # Inicializa sistema de monitoramento
    init_monitoring(app)

    # Inicializa middleware de segurança
    init_security_middleware(app)

    # Inicializa rate limiting
    try:
        init_rate_limiting(app)
        logger.info("✅ Rate limiting inicializado com sucesso")
    except Exception as e:
        logger.warning(f"⚠️ Rate limiting falhou: {e}")

    # Inicializa audit logging
    try:
        init_audit_logging(app)
        logger.info("✅ Audit logging inicializado com sucesso")
    except Exception as e:
        logger.warning(f"⚠️ Audit logging falhou: {e}")

    # Inicializa cache warming
    try:
        init_cache_warmup()
        logger.info("✅ Cache warming inicializado")
    except Exception as e:
        logger.warning(f"⚠️ Cache warming falhou: {e}")

    # Inicializa webhook processor (TEMPORARIAMENTE DESABILITADO)
    try:
        # webhook_processor.start_processor()  # COMENTADO: estava travando o Flask
        logger.info("✅ Webhook processor desabilitado para debug")
    except Exception as e:
        logger.warning(f"⚠️ Webhook processor falhou: {e}")

    # Registra blueprints principais
    app.register_blueprint(auth_bp, url_prefix="/api/auth")
    app.register_blueprint(products_bp, url_prefix="/api/products")
    app.register_blueprint(cart_bp, url_prefix="/api/cart")
    app.register_blueprint(reviews_bp, url_prefix="/api/reviews")
    app.register_blueprint(checkout_bp)  # Já tem o prefixo /api/checkout
    app.register_blueprint(health_bp, url_prefix="/api")

    # Registra blueprints do sistema principal
    app.register_blueprint(customers_bp, url_prefix="/api/customers")
    app.register_blueprint(orders_bp, url_prefix="/api/orders")
    app.register_blueprint(payments_bp, url_prefix="/api/payments")
    app.register_blueprint(analytics_bp, url_prefix="/api/analytics")  # Analytics tracking

    # Registra blueprints de funcionalidades avançadas (somente os existentes)
    app.register_blueprint(coupons_bp, url_prefix="/api/coupons")
    app.register_blueprint(admin_bp, url_prefix="/api/admin")
    app.register_blueprint(admin_products_bp)  # Já tem prefixo interno
    app.register_blueprint(stock_bp, url_prefix="/api/stock")
    app.register_blueprint(security_bp, url_prefix="/api/security")
    app.register_blueprint(notifications_bp, url_prefix="/api/notifications")
    
    # 🚚 MELHOR ENVIO SYSTEM ATIVADO!
    try:
        app.register_blueprint(melhor_envio_bp, url_prefix="/api/melhor-envio")
        logger.info("✅ Blueprint Melhor Envio registrado com sucesso!")
        logger.info("🚚 Sistema de frete Melhor Envio ATIVADO!")
    except Exception as e:
        logger.warning(f"⚠️ Falha ao registrar Melhor Envio blueprint: {e}")
    
    # 🎉 MERCADO PAGO SYSTEM ATIVADO!
    try:
        app.register_blueprint(mercado_pago_bp, url_prefix="/api/mercado-pago")
        logger.info("✅ Blueprint Mercado Pago registrado com sucesso!")
        logger.info("🎉 Sistema de pagamentos Mercado Pago ATIVADO!")
    except Exception as e:
        logger.warning(f"⚠️ Falha ao registrar Mercado Pago blueprint: {e}")

    # 🎯 NOVOS MÓDULOS IMPLEMENTADOS
    try:
        app.register_blueprint(blog_bp, url_prefix="/api/blog")
        logger.info("✅ Blueprint Blog registrado com sucesso!")
        logger.info("📝 Sistema de Blog ATIVADO!")
    except Exception as e:
        logger.warning(f"⚠️ Falha ao registrar Blog blueprint: {e}")

    try:
        app.register_blueprint(gamification_bp, url_prefix="/api/gamification")
        logger.info("✅ Blueprint Gamificação registrado com sucesso!")
        logger.info("🎮 Sistema de Gamificação ATIVADO!")
    except Exception as e:
        logger.warning(f"⚠️ Falha ao registrar Gamificação blueprint: {e}")

    try:
        app.register_blueprint(newsletter_bp, url_prefix="/api/newsletter")
        logger.info("✅ Blueprint Newsletter registrado com sucesso!")
        logger.info("📧 Sistema de Newsletter ATIVADO!")
    except Exception as e:
        logger.warning(f"⚠️ Falha ao registrar Newsletter blueprint: {e}")

    try:
        app.register_blueprint(hr_bp, url_prefix="/api/hr")
        logger.info("✅ Blueprint RH registrado com sucesso!")
        logger.info("👔 Sistema de Recursos Humanos ATIVADO!")
    except Exception as e:
        logger.warning(f"⚠️ Falha ao registrar RH blueprint: {e}")

    # 🏪 MÓDULOS AVANÇADOS IMPLEMENTADOS
    try:
        app.register_blueprint(pdv_bp, url_prefix="/api/pdv")
        logger.info("✅ Blueprint PDV registrado com sucesso!")
        logger.info("💰 Sistema de PDV (Ponto de Venda) ATIVADO!")
    except Exception as e:
        logger.warning(f"⚠️ Falha ao registrar PDV blueprint: {e}")

    try:
        app.register_blueprint(erp_bp, url_prefix="/api/erp")
        logger.info("✅ Blueprint ERP registrado com sucesso!")
        logger.info("🏭 Sistema de ERP Avançado (Compras, MRP, Qualidade) ATIVADO!")
    except Exception as e:
        logger.warning(f"⚠️ Falha ao registrar ERP blueprint: {e}")

    try:
        app.register_blueprint(financial_bp, url_prefix="/api/financial")
        logger.info("✅ Blueprint Financeiro registrado com sucesso!")
        logger.info("💵 Sistema Financeiro Completo (AP/AR, DRE, Fluxo de Caixa) ATIVADO!")
    except Exception as e:
        logger.warning(f"⚠️ Falha ao registrar Financeiro blueprint: {e}")

    try:
        app.register_blueprint(crm_bp, url_prefix="/api/crm")
        logger.info("✅ Blueprint CRM registrado com sucesso!")
        logger.info("🎯 Sistema de CRM Avançado (Pipeline, Funil, Automações) ATIVADO!")
    except Exception as e:
        logger.warning(f"⚠️ Falha ao registrar CRM blueprint: {e}")

    # 📸 MEDIA/S3 UPLOAD SYSTEM
    try:
        app.register_blueprint(media_bp, url_prefix="/api/media")
        logger.info("✅ Blueprint Media registrado com sucesso!")
        logger.info("📸 Sistema de Upload S3 ATIVADO!")
    except Exception as e:
        logger.warning(f"⚠️ Falha ao registrar Media blueprint: {e}")

    # ⚙️ SETTINGS/ADMIN CONFIG SYSTEM
    try:
        app.register_blueprint(settings_bp, url_prefix="/api/admin/settings")
        logger.info("✅ Blueprint Settings registrado com sucesso!")
        logger.info("⚙️ Sistema de Configurações Admin ATIVADO!")
    except Exception as e:
        logger.warning(f"⚠️ Falha ao registrar Settings blueprint: {e}")

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
                    "pdv": "/api/pdv",
                    "erp": "/api/erp",
                    "crm": "/api/crm",
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

    app.run(host="0.0.0.0", port = port, debug = debug)
