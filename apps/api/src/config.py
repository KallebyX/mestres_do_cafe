import os
import secrets
from datetime import timedelta
from pathlib import Path


class Config:
    """Configuração base com segurança aprimorada"""

    # Secrets obrigatórios
    SECRET_KEY = os.environ.get("SECRET_KEY")
    JWT_SECRET_KEY = os.environ.get("JWT_SECRET_KEY")

    # Configurações JWT seguras
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(hours = 1)  # Reduzido de 24h
    JWT_REFRESH_TOKEN_EXPIRES = timedelta(days = 30)
    JWT_ALGORITHM = "HS256"
    JWT_BLACKLIST_ENABLED = True
    JWT_BLACKLIST_TOKEN_CHECKS = ["access", "refresh"]
    JWT_TOKEN_LOCATION = ["headers", "cookies"]
    JWT_HEADER_NAME = "Authorization"
    JWT_HEADER_TYPE = "Bearer"

    # Configurações JWT Cookies
    JWT_ACCESS_COOKIE_NAME = "access_token_cookie"
    JWT_REFRESH_COOKIE_NAME = "refresh_token_cookie"
    JWT_ACCESS_COOKIE_PATH = "/"
    JWT_REFRESH_COOKIE_PATH = "/token/refresh"
    JWT_COOKIE_SECURE = True  # Será sobrescrito em dev
    JWT_COOKIE_CSRF_PROTECT = False  # Simplificar para desenvolvimento
    JWT_COOKIE_SAMESITE = "Lax"

    # Configurações JWT CSRF
    JWT_ACCESS_CSRF_HEADER_NAME = "X-CSRF-TOKEN"
    JWT_REFRESH_CSRF_HEADER_NAME = "X-CSRF-TOKEN"
    JWT_ACCESS_CSRF_FIELD_NAME = "csrf_token"
    JWT_REFRESH_CSRF_FIELD_NAME = "csrf_token"
    JWT_ACCESS_CSRF_COOKIE_NAME = "csrf_access_token"
    JWT_REFRESH_CSRF_COOKIE_NAME = "csrf_refresh_token"
    JWT_ACCESS_CSRF_COOKIE_PATH = "/"
    JWT_REFRESH_CSRF_COOKIE_PATH = "/token/refresh"

    # Configurações de sessão seguras
    SESSION_COOKIE_SECURE = True
    SESSION_COOKIE_HTTPONLY = True
    SESSION_COOKIE_SAMESITE = "Lax"
    PERMANENT_SESSION_LIFETIME = timedelta(hours = 1)

    # Configurações de upload seguras
    MAX_CONTENT_LENGTH = 16 * 1024 * 1024  # 16MB
    UPLOAD_EXTENSIONS = [".jpg", ".jpeg", ".png", ".gif", ".webp"]
    UPLOAD_FOLDER = "uploads"
    ALLOWED_EXTENSIONS = {"png", "jpg", "jpeg", "gif", "webp", "pdf"}

    # Supabase Configuration
    SUPABASE_URL = os.environ.get("SUPABASE_URL")
    SUPABASE_ANON_KEY = os.environ.get("SUPABASE_ANON_KEY")
    SUPABASE_SERVICE_KEY = os.environ.get(
        "SUPABASE_SERVICE_KEY"
    )  # Para operações admin

    # Configurações de cache
    REDIS_URL = os.environ.get("REDIS_URL", "redis://localhost:6379")
    CACHE_TYPE = "redis" if os.environ.get("REDIS_URL") else "simple"
    CACHE_DEFAULT_TIMEOUT = 300

    # API Keys e configurações externas
    MELHOR_ENVIO_API_KEY = os.environ.get("MELHOR_ENVIO_API_KEY", "")
    MELHOR_ENVIO_SANDBOX = (
        os.environ.get("MELHOR_ENVIO_SANDBOX", "true").lower() == "true"
    )

    @staticmethod
    def init_app(app):
        """Inicializar configurações da aplicação"""
        # Criar diretório de uploads se não existir (skip em ambientes read-only como Vercel)
        # Em Vercel/serverless, usamos S3 para uploads, então não precisamos de diretório local
        if not os.environ.get("VERCEL"):
            try:
                upload_path = Path(app.root_path) / app.config["UPLOAD_FOLDER"]
                upload_path.mkdir(parents = True, exist_ok = True)
            except OSError as e:
                # Filesystem read-only (comum em serverless)
                app.logger.warning(f"Could not create upload directory: {e}")

        # Validar variáveis obrigatórias (Supabase não é obrigatório em desenvolvimento)
        required_vars = [
            "SECRET_KEY",
            "JWT_SECRET_KEY",
        ]

        missing_vars = [var for var in required_vars if not os.environ.get(var)]

        if missing_vars and not app.config.get("TESTING", False):
            # Em desenvolvimento, gerar secrets temporários
            if app.config.get("ENV") == "development":
                for var in missing_vars:
                    secret_value = f"dev-{secrets.token_urlsafe(32)}"
                    os.environ[var] = secret_value
                    app.config[var] = secret_value
                    app.logger.warning(
                        f"⚠️  {var} não configurado. Usando valor temporário para desenvolvimento."
                    )
            else:
                raise ValueError(
                    f"ERRO DE SEGURANÇA: Secrets obrigatórios ausentes: {missing_vars}"
                )

        # Validar força dos secrets em produção
        if app.config.get("ENV") == "production":
            for secret_name in ["SECRET_KEY", "JWT_SECRET_KEY"]:
                secret_value = os.environ.get(secret_name)
                if secret_value and len(secret_value) < 32:
                    raise ValueError(
                        f"ERRO DE SEGURANÇA: {secret_name} muito fraco (mín. 32 chars)"
                    )


class DevelopmentConfig(Config):
    """Configuração de desenvolvimento"""

    DEBUG = True
    ENV = "development"

    # CORS permissivo para desenvolvimento
    CORS_ORIGINS = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:5173",  # Vite dev server
        "http://127.0.0.1:5173",
        "http://localhost:5174",  # Vite alternate port
        "http://127.0.0.1:5174",
    ]

    # Rate limiting mais permissivo em dev
    RATELIMIT_DEFAULT = "1000 per hour"

    # Configurações específicas de desenvolvimento
    SEND_FILE_MAX_AGE_DEFAULT = 0  # Desabilitar cache de arquivos estáticos

    # Segurança relaxada para desenvolvimento
    SESSION_COOKIE_SECURE = False
    JWT_COOKIE_SECURE = False  # Cookies JWT não precisam de HTTPS em dev


class ProductionConfig(Config):
    """Configuracao de producao - Vercel + Neon"""

    DEBUG = False
    TESTING = False
    ENV = "production"

    # Use /tmp for uploads in serverless (only writable directory in Vercel)
    UPLOAD_FOLDER = "/tmp/uploads"

    # Database - Neon PostgreSQL Serverless
    SQLALCHEMY_DATABASE_URI = os.environ.get("DATABASE_URL") or os.environ.get("NEON_DATABASE_URL")

    # SQLAlchemy otimizado para Neon Serverless
    SQLALCHEMY_ENGINE_OPTIONS = {
        "pool_pre_ping": True,
        "pool_recycle": 60,  # Neon: conexoes fecham rapidamente
        "pool_size": 1,  # Serverless: pool pequeno
        "max_overflow": 2,  # Serverless: limitar conexoes extras
        "pool_timeout": 10,
        "echo": False
    }

    # AWS S3 Configuration
    AWS_S3_BUCKET = os.environ.get("AWS_S3_BUCKET", "mestres-do-cafe-images")
    AWS_REGION = os.environ.get("AWS_REGION", "sa-east-1")

    @classmethod
    def init_app(cls, app):
        """Inicializar configuracoes da aplicacao"""
        # Generate temporary secrets BEFORE calling Config.init_app to avoid validation error
        # This is needed because Config.init_app validates that secrets exist
        required_vars = ["SECRET_KEY", "JWT_SECRET_KEY"]
        missing_vars = [var for var in required_vars if not os.environ.get(var)]

        if missing_vars:
            # Em Vercel, gerar secrets temporarios se nao configurados
            import secrets as sec_module
            for var in missing_vars:
                secret_value = sec_module.token_urlsafe(32)
                os.environ[var] = secret_value
                app.config[var] = secret_value
                app.logger.warning(f"Generated temporary {var} for production")

        # Now call parent init_app - secrets are already set
        Config.init_app(app)

        # Verificar DATABASE_URL
        if not os.environ.get("DATABASE_URL") and not os.environ.get("NEON_DATABASE_URL"):
            app.logger.warning("DATABASE_URL ou NEON_DATABASE_URL nao configurada")

    # CORS para Vercel
    CORS_ORIGINS = (
        os.environ.get("CORS_ORIGINS", "").split(",")
        if os.environ.get("CORS_ORIGINS")
        else [
            "https://*.vercel.app",
            "https://mestres-do-cafe.vercel.app",
            "https://mestresdocafe.com.br",
            "https://www.mestresdocafe.com.br",
        ]
    )

    # Headers de seguranca obrigatorios
    SECURITY_HEADERS = {
        "Strict-Transport-Security": "max-age=31536000; includeSubDomains; preload",
        "X-Content-Type-Options": "nosniff",
        "X-Frame-Options": "DENY",
        "X-XSS-Protection": "1; mode=block",
        "Referrer-Policy": "strict-origin-when-cross-origin",
        "Content-Security-Policy": (
            "default-src 'self'; "
            "script-src 'self' 'unsafe-inline' https://sdk.mercadopago.com; "
            "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; "
            "font-src 'self' https://fonts.gstatic.com; "
            "img-src 'self' data: https: blob:; "
            "connect-src 'self' https://api.mercadopago.com https://api.melhorenvio.com.br https://viacep.com.br https://*.s3.amazonaws.com; "
            "frame-src https://www.mercadopago.com.br;"
        ),
    }

    # Rate limiting
    RATELIMIT_DEFAULT = "200 per hour"


class TestingConfig(Config):
    """Configuração de testes"""

    TESTING = True
    ENV = "testing"
    WTF_CSRF_ENABLED = False

    # Secrets de teste
    SECRET_KEY = "test-secret-key"
    JWT_SECRET_KEY = "test-jwt-secret-key"

    # Supabase de teste (usar URL de desenvolvimento ou mock)
    SUPABASE_URL = os.environ.get("SUPABASE_URL_TEST", "https://test.supabase.co")
    SUPABASE_ANON_KEY = os.environ.get("SUPABASE_ANON_KEY_TEST", "test-anon-key")

    # Cache simples para testes
    CACHE_TYPE = "simple"

    # Desabilitar rate limiting em testes
    RATELIMIT_ENABLED = False

    # Segurança relaxada para testes
    SESSION_COOKIE_SECURE = False


# Mapeamento de configurações
config = {
    "development": DevelopmentConfig,
    "production": ProductionConfig,
    "testing": TestingConfig,
    "default": DevelopmentConfig,
}


def get_config():
    """Obter configuração baseada no ambiente"""
    env = os.environ.get("FLASK_ENV", "development")
    return config.get(env, config["default"])
