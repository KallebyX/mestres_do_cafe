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
            # Testar conexão
            db.engine.connect()
            db_type = "SQLite" if "sqlite" in database_url.lower() else "PostgreSQL"
            logger.info(f"✅ Conexão com {db_type} estabelecida com sucesso")
        except SQLAlchemyError as e:
            db_type = "SQLite" if "sqlite" in database_url.lower() else "PostgreSQL"
            logger.error(f"❌ Erro ao conectar com {db_type}: {e}")
            raise


def get_database_url() -> str:
    """
    Obtém a URL de conexão do banco de dados (SQLite ou PostgreSQL)

    Returns:
        str: URL de conexão do banco de dados
    """

    # URL direta do banco (prioridade)
    database_url = os.getenv("DATABASE_URL")
    if database_url:
        return database_url

    # Usar SQLite como padrão - usar o banco na pasta instance que tem os dados
    # Caminho absoluto para o banco que contém os dados existentes
    db_path = "/Users/kalleby/Downloads/mestres_cafe_enterprise/apps/api/instance/mestres_cafe.db"
    return f"sqlite:///{db_path}"


def configure_db_events() -> None:
    """
    Configura eventos do SQLAlchemy para otimização
    """

    @event.listens_for(Engine, "connect")
    def set_sqlite_pragma(dbapi_connection, connection_record):
        """Define configurações do banco de dados"""
        if hasattr(dbapi_connection, "execute"):
            # Detectar tipo de banco
            if "sqlite" in str(dbapi_connection.__class__):
                # Configurações SQLite
                dbapi_connection.execute("PRAGMA foreign_keys=ON")
                dbapi_connection.execute("PRAGMA journal_mode=WAL")
                dbapi_connection.execute("PRAGMA synchronous=NORMAL")
            else:
                # Configurações PostgreSQL
                dbapi_connection.execute("SET timezone = 'UTC'")
                dbapi_connection.execute("SET lock_timeout = '10s'")
                dbapi_connection.execute("SET statement_timeout = '30s'")


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
