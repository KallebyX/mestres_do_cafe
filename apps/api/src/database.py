"""
Database configuration for SQLAlchemy with PostgreSQL
"""

import logging
import os
from typing import Optional

from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import event, text
from sqlalchemy.engine import Engine
from sqlalchemy.exc import SQLAlchemyError

# Configurar logging
logger = logging.getLogger(__name__)

# Instâncias globais
db = SQLAlchemy()


def init_db(app) -> None:
    """
    Inicializa o banco de dados SQLAlchemy com a aplicação Flask

    Args:
        app: Instância da aplicação Flask
    """

    # Configurar URL do banco de dados
    database_url = get_database_url()
    app.config["SQLALCHEMY_DATABASE_URI"] = database_url
    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
    app.config["SQLALCHEMY_ENGINE_OPTIONS"] = {
        "pool_pre_ping": True,
        "pool_recycle": 300,
        "pool_size": 10,
        "max_overflow": 20,
        "pool_timeout": 30,
    }

    # Inicializar SQLAlchemy
    db.init_app(app)

    # Configurar eventos do SQLAlchemy
    configure_db_events()

    # Registrar contexto de aplicação
    with app.app_context():
        try:
            # Testar conexão apenas em produção
            if app.config.get('ENV') == 'production' or os.environ.get("DATABASE_URL"):
                db.engine.connect()
                logger.info(f"✅ Conexão com PostgreSQL estabelecida com sucesso")
            else:
                logger.info(f"⚠️ Banco de dados não configurado - modo desenvolvimento")
        except SQLAlchemyError as e:
            logger.error(f"❌ Erro ao conectar com PostgreSQL: {e}")
            if app.config.get('ENV') == 'production':
                raise
            else:
                logger.warning(f"⚠️ Continuando sem banco em desenvolvimento")


def get_database_url() -> str:
    """
    Obtém a URL de conexão do banco de dados (PostgreSQL ÚNICO)

    Returns:
        str: URL de conexão do banco de dados
    """

    # URL direta do banco (prioridade total)
    database_url = os.getenv("DATABASE_URL")
    
    if database_url:
        # Fix para Render: converter postgres:// para postgresql://
        if database_url.startswith("postgres://"):
            database_url = database_url.replace("postgres://", "postgresql://", 1)
            logger.info("✅ URL do banco convertida de postgres:// para postgresql://")
        return database_url

    # Tentar montar URL a partir de variáveis separadas (backup)
    db_host = os.getenv("DB_HOST")
    if db_host:
        db_user = os.getenv("DB_USER", "postgres")
        db_password = os.getenv("DB_PASSWORD", "")
        db_name = os.getenv("DB_NAME", "mestres_cafe")
        db_port = os.getenv("DB_PORT", "5432")
        database_url = f"postgresql://{db_user}:{db_password}@{db_host}:{db_port}/{db_name}"
        logger.info(f"✅ URL do banco montada a partir de variáveis separadas")
        return database_url

    # Para desenvolvimento sem banco configurado
    logger.info(f"⚠️ Nenhuma configuração de banco encontrada")
    return "postgresql://user:pass@localhost:5432/mestres_cafe"


def configure_db_events() -> None:
    """
    Configura eventos do SQLAlchemy para otimização PostgreSQL
    """

    @event.listens_for(Engine, "connect")
    def set_postgresql_config(dbapi_connection, connection_record):
        """Define configurações do banco de dados PostgreSQL"""
        # PostgreSQL não precisa de configurações PRAGMA como SQLite
        # As configurações de pool já estão definidas em SQLALCHEMY_ENGINE_OPTIONS
        logger.info("Conexão PostgreSQL estabelecida com configurações otimizadas")


def create_tables() -> None:
    """
    Cria todas as tabelas do banco de dados
    """
    try:
        db.create_all()
        logger.info("✅ Tabelas criadas com sucesso")
    except SQLAlchemyError as e:
        logger.error(f"❌ Erro ao criar tabelas: {e}")
        raise


def drop_tables() -> None:
    """
    Remove todas as tabelas do banco de dados
    """
    try:
        db.drop_all()
        logger.info("✅ Tabelas removidas com sucesso")
    except SQLAlchemyError as e:
        logger.error(f"❌ Erro ao remover tabelas: {e}")
        raise


def get_db_session():
    """
    Obtém uma sessão do banco de dados

    Returns:
        Session: Sessão do SQLAlchemy
    """
    return db.session


def safe_commit() -> bool:
    """
    Executa commit seguro com tratamento de erro

    Returns:
        bool: True se commit foi bem-sucedido, False caso contrário
    """
    try:
        db.session.commit()
        return True
    except SQLAlchemyError as e:
        logger.error(f"❌ Erro no commit: {e}")
        db.session.rollback()
        return False


def safe_rollback() -> None:
    """
    Executa rollback seguro
    """
    try:
        db.session.rollback()
    except SQLAlchemyError as e:
        logger.error(f"❌ Erro no rollback: {e}")


class DatabaseManager:
    """
    Gerenciador de contexto para operações de banco de dados
    """

    def __init__(self, auto_commit: bool = True):
        self.auto_commit = auto_commit
        self.session = None

    def __enter__(self):
        self.session = get_db_session()
        return self.session

    def __exit__(self, exc_type, exc_val, exc_tb):
        if exc_type is not None:
            # Erro ocorreu, fazer rollback
            safe_rollback()
        else:
            # Sucesso, fazer commit se auto_commit estiver habilitado
            if self.auto_commit:
                safe_commit()


def execute_raw_sql(query: str, params: Optional[dict] = None) -> list:
    """
    Executa uma query SQL bruta

    Args:
        query: Query SQL a ser executada
        params: Parâmetros para a query

    Returns:
        list: Resultado da query
    """
    try:
        result = db.session.execute(text(query), params or {})
        return list(result.fetchall())
    except SQLAlchemyError as e:
        logger.error(f"❌ Erro ao executar query: {e}")
        raise


def health_check() -> dict:
    """
    Verifica a saúde da conexão com o banco de dados

    Returns:
        dict: Status da conexão
    """
    try:
        # Executar uma query simples
        result = db.session.execute(text("SELECT 1"))
        result.fetchone()

        return {"status": "healthy", "database": "PostgreSQL", "connection": "active"}
    except SQLAlchemyError as e:
        logger.error(f"❌ Health check falhou: {e}")
        return {
            "status": "unhealthy",
            "database": "PostgreSQL",
            "connection": "failed",
            "error": str(e),
        }


# Aliases para compatibilidade
get_db = get_db_session
