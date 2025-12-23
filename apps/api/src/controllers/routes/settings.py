"""
Rotas de Configurações do Sistema (Admin)
Gerenciamento de API Keys do Mercado Pago e Melhor Envio
"""

import os
import json
from functools import wraps
from flask import Blueprint, jsonify, request, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity

from database import db
from models.system import SystemSetting, AuditLog
from models.user import User

settings_bp = Blueprint("settings", __name__)


def admin_required(f):
    """Decorator para verificar se o usuário é admin"""
    @wraps(f)
    @jwt_required()
    def decorated_function(*args, **kwargs):
        user_id = get_jwt_identity()
        user = User.query.get(user_id)

        if not user or not user.is_admin:
            return jsonify({
                "success": False,
                "error": "Acesso não autorizado. Apenas administradores podem acessar esta rota."
            }), 403

        return f(*args, **kwargs)
    return decorated_function


def mask_api_key(key: str) -> str:
    """Mascara a API key para exibição segura"""
    if not key or len(key) < 8:
        return "****"
    return f"{key[:4]}...{key[-4:]}"


def get_setting(key: str, default=None):
    """Obtém uma configuração do banco de dados"""
    setting = SystemSetting.query.filter_by(key=key, is_active=True).first()
    if setting:
        return setting.value
    return default


def set_setting(key: str, value: str, setting_type: str = "string", description: str = None):
    """Define uma configuração no banco de dados"""
    setting = SystemSetting.query.filter_by(key=key).first()

    if setting:
        setting.value = value
        setting.type = setting_type
        if description:
            setting.description = description
        setting.is_active = True
    else:
        setting = SystemSetting(
            key=key,
            value=value,
            type=setting_type,
            description=description
        )
        db.session.add(setting)

    db.session.commit()
    return setting


def log_audit(user_id: str, action: str, table_name: str, record_id: str, old_values: dict = None, new_values: dict = None):
    """Registra ação de auditoria"""
    try:
        audit = AuditLog(
            user_id=user_id,
            action=action,
            table_name=table_name,
            record_id=record_id,
            old_values=json.dumps(old_values) if old_values else None,
            new_values=json.dumps(new_values) if new_values else None,
            ip_address=request.remote_addr,
            user_agent=request.user_agent.string[:500] if request.user_agent else None
        )
        db.session.add(audit)
        db.session.commit()
    except Exception as e:
        current_app.logger.error(f"Erro ao registrar auditoria: {e}")


# =====================================================
# MERCADO PAGO SETTINGS
# =====================================================

@settings_bp.route("/mercado-pago", methods=["GET"])
@admin_required
def get_mercado_pago_settings():
    """Obtém configurações do Mercado Pago"""
    try:
        # Buscar configurações do banco de dados
        access_token_test = get_setting("mercado_pago_access_token_test", "")
        access_token_prod = get_setting("mercado_pago_access_token_prod", "")
        public_key_test = get_setting("mercado_pago_public_key_test", "")
        public_key_prod = get_setting("mercado_pago_public_key_prod", "")
        environment = get_setting("mercado_pago_environment", "sandbox")
        webhook_url = get_setting("mercado_pago_webhook_url", "")

        # Verificar se há variáveis de ambiente como fallback
        env_access_token = os.environ.get("MERCADO_PAGO_ACCESS_TOKEN", "")
        env_public_key = os.environ.get("MERCADO_PAGO_PUBLIC_KEY", "")

        return jsonify({
            "success": True,
            "data": {
                "test": {
                    "access_token": mask_api_key(access_token_test) if access_token_test else "",
                    "public_key": mask_api_key(public_key_test) if public_key_test else "",
                    "has_access_token": bool(access_token_test),
                    "has_public_key": bool(public_key_test)
                },
                "production": {
                    "access_token": mask_api_key(access_token_prod) if access_token_prod else "",
                    "public_key": mask_api_key(public_key_prod) if public_key_prod else "",
                    "has_access_token": bool(access_token_prod),
                    "has_public_key": bool(public_key_prod)
                },
                "environment": environment,
                "webhook_url": webhook_url,
                "env_configured": bool(env_access_token),
                "status": "configured" if (access_token_test or access_token_prod or env_access_token) else "not_configured"
            }
        })
    except Exception as e:
        current_app.logger.error(f"Erro ao buscar configurações do Mercado Pago: {e}")
        return jsonify({
            "success": False,
            "error": f"Erro ao buscar configurações: {str(e)}"
        }), 500


@settings_bp.route("/mercado-pago", methods=["POST"])
@admin_required
def update_mercado_pago_settings():
    """Atualiza configurações do Mercado Pago"""
    try:
        user_id = get_jwt_identity()
        data = request.get_json()

        if not data:
            return jsonify({
                "success": False,
                "error": "Dados não fornecidos"
            }), 400

        updated_fields = []

        # Atualizar tokens de teste
        if "test_access_token" in data and data["test_access_token"]:
            old_value = get_setting("mercado_pago_access_token_test", "")
            set_setting(
                "mercado_pago_access_token_test",
                data["test_access_token"],
                "secret",
                "Token de acesso do Mercado Pago (Sandbox)"
            )
            updated_fields.append("test_access_token")
            log_audit(user_id, "UPDATE", "system_settings", "mercado_pago_access_token_test",
                     {"value": mask_api_key(old_value)}, {"value": mask_api_key(data["test_access_token"])})

        if "test_public_key" in data and data["test_public_key"]:
            set_setting(
                "mercado_pago_public_key_test",
                data["test_public_key"],
                "secret",
                "Chave pública do Mercado Pago (Sandbox)"
            )
            updated_fields.append("test_public_key")

        # Atualizar tokens de produção
        if "prod_access_token" in data and data["prod_access_token"]:
            old_value = get_setting("mercado_pago_access_token_prod", "")
            set_setting(
                "mercado_pago_access_token_prod",
                data["prod_access_token"],
                "secret",
                "Token de acesso do Mercado Pago (Produção)"
            )
            updated_fields.append("prod_access_token")
            log_audit(user_id, "UPDATE", "system_settings", "mercado_pago_access_token_prod",
                     {"value": mask_api_key(old_value)}, {"value": mask_api_key(data["prod_access_token"])})

        if "prod_public_key" in data and data["prod_public_key"]:
            set_setting(
                "mercado_pago_public_key_prod",
                data["prod_public_key"],
                "secret",
                "Chave pública do Mercado Pago (Produção)"
            )
            updated_fields.append("prod_public_key")

        # Atualizar ambiente
        if "environment" in data:
            if data["environment"] in ["sandbox", "production"]:
                set_setting(
                    "mercado_pago_environment",
                    data["environment"],
                    "string",
                    "Ambiente do Mercado Pago (sandbox ou production)"
                )
                updated_fields.append("environment")

        # Atualizar webhook URL
        if "webhook_url" in data:
            set_setting(
                "mercado_pago_webhook_url",
                data["webhook_url"],
                "string",
                "URL de webhook do Mercado Pago"
            )
            updated_fields.append("webhook_url")

        return jsonify({
            "success": True,
            "message": f"Configurações do Mercado Pago atualizadas com sucesso",
            "updated_fields": updated_fields
        })

    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"Erro ao atualizar configurações do Mercado Pago: {e}")
        return jsonify({
            "success": False,
            "error": f"Erro ao atualizar configurações: {str(e)}"
        }), 500


@settings_bp.route("/mercado-pago/test", methods=["POST"])
@admin_required
def test_mercado_pago_connection():
    """Testa a conexão com a API do Mercado Pago"""
    try:
        data = request.get_json() or {}
        environment = data.get("environment", "sandbox")

        # Obter token do ambiente correto
        if environment == "sandbox":
            access_token = get_setting("mercado_pago_access_token_test", "")
        else:
            access_token = get_setting("mercado_pago_access_token_prod", "")

        # Fallback para variável de ambiente
        if not access_token:
            access_token = os.environ.get("MERCADO_PAGO_ACCESS_TOKEN", "")

        if not access_token:
            return jsonify({
                "success": False,
                "error": "Token de acesso não configurado",
                "environment": environment
            }), 400

        # Testar conexão com a API
        import requests

        headers = {
            "Authorization": f"Bearer {access_token}",
            "Content-Type": "application/json"
        }

        # Endpoint de teste - buscar informações do usuário
        response = requests.get(
            "https://api.mercadopago.com/users/me",
            headers=headers,
            timeout=10
        )

        if response.status_code == 200:
            user_data = response.json()
            return jsonify({
                "success": True,
                "message": "Conexão com Mercado Pago estabelecida com sucesso!",
                "environment": environment,
                "account": {
                    "id": user_data.get("id"),
                    "nickname": user_data.get("nickname"),
                    "email": user_data.get("email"),
                    "site_id": user_data.get("site_id")
                }
            })
        elif response.status_code == 401:
            return jsonify({
                "success": False,
                "error": "Token de acesso inválido ou expirado",
                "environment": environment
            }), 401
        else:
            return jsonify({
                "success": False,
                "error": f"Erro na API: {response.status_code}",
                "details": response.text,
                "environment": environment
            }), response.status_code

    except requests.exceptions.Timeout:
        return jsonify({
            "success": False,
            "error": "Timeout ao conectar com a API do Mercado Pago"
        }), 504
    except requests.exceptions.ConnectionError:
        return jsonify({
            "success": False,
            "error": "Erro de conexão com a API do Mercado Pago"
        }), 503
    except Exception as e:
        current_app.logger.error(f"Erro ao testar conexão Mercado Pago: {e}")
        return jsonify({
            "success": False,
            "error": f"Erro ao testar conexão: {str(e)}"
        }), 500


# =====================================================
# MELHOR ENVIO SETTINGS
# =====================================================

@settings_bp.route("/melhor-envio", methods=["GET"])
@admin_required
def get_melhor_envio_settings():
    """Obtém configurações do Melhor Envio"""
    try:
        # Buscar configurações do banco de dados
        api_key_test = get_setting("melhor_envio_api_key_test", "")
        api_key_prod = get_setting("melhor_envio_api_key_prod", "")
        client_id_test = get_setting("melhor_envio_client_id_test", "")
        client_id_prod = get_setting("melhor_envio_client_id_prod", "")
        client_secret_test = get_setting("melhor_envio_client_secret_test", "")
        client_secret_prod = get_setting("melhor_envio_client_secret_prod", "")
        environment = get_setting("melhor_envio_environment", "sandbox")
        origin_cep = get_setting("melhor_envio_origin_cep", "")
        webhook_url = get_setting("melhor_envio_webhook_url", "")

        # Verificar variáveis de ambiente como fallback
        env_api_key = os.environ.get("MELHOR_ENVIO_API_KEY", "")
        env_sandbox = os.environ.get("MELHOR_ENVIO_SANDBOX", "true").lower() == "true"

        return jsonify({
            "success": True,
            "data": {
                "test": {
                    "api_key": mask_api_key(api_key_test) if api_key_test else "",
                    "client_id": mask_api_key(client_id_test) if client_id_test else "",
                    "client_secret": mask_api_key(client_secret_test) if client_secret_test else "",
                    "has_api_key": bool(api_key_test),
                    "has_credentials": bool(client_id_test and client_secret_test)
                },
                "production": {
                    "api_key": mask_api_key(api_key_prod) if api_key_prod else "",
                    "client_id": mask_api_key(client_id_prod) if client_id_prod else "",
                    "client_secret": mask_api_key(client_secret_prod) if client_secret_prod else "",
                    "has_api_key": bool(api_key_prod),
                    "has_credentials": bool(client_id_prod and client_secret_prod)
                },
                "environment": environment,
                "origin_cep": origin_cep,
                "webhook_url": webhook_url,
                "env_configured": bool(env_api_key),
                "env_is_sandbox": env_sandbox,
                "status": "configured" if (api_key_test or api_key_prod or env_api_key) else "not_configured"
            }
        })
    except Exception as e:
        current_app.logger.error(f"Erro ao buscar configurações do Melhor Envio: {e}")
        return jsonify({
            "success": False,
            "error": f"Erro ao buscar configurações: {str(e)}"
        }), 500


@settings_bp.route("/melhor-envio", methods=["POST"])
@admin_required
def update_melhor_envio_settings():
    """Atualiza configurações do Melhor Envio"""
    try:
        user_id = get_jwt_identity()
        data = request.get_json()

        if not data:
            return jsonify({
                "success": False,
                "error": "Dados não fornecidos"
            }), 400

        updated_fields = []

        # Atualizar credenciais de teste
        if "test_api_key" in data and data["test_api_key"]:
            old_value = get_setting("melhor_envio_api_key_test", "")
            set_setting(
                "melhor_envio_api_key_test",
                data["test_api_key"],
                "secret",
                "API Key do Melhor Envio (Sandbox)"
            )
            updated_fields.append("test_api_key")
            log_audit(user_id, "UPDATE", "system_settings", "melhor_envio_api_key_test",
                     {"value": mask_api_key(old_value)}, {"value": mask_api_key(data["test_api_key"])})

        if "test_client_id" in data and data["test_client_id"]:
            set_setting(
                "melhor_envio_client_id_test",
                data["test_client_id"],
                "secret",
                "Client ID do Melhor Envio (Sandbox)"
            )
            updated_fields.append("test_client_id")

        if "test_client_secret" in data and data["test_client_secret"]:
            set_setting(
                "melhor_envio_client_secret_test",
                data["test_client_secret"],
                "secret",
                "Client Secret do Melhor Envio (Sandbox)"
            )
            updated_fields.append("test_client_secret")

        # Atualizar credenciais de produção
        if "prod_api_key" in data and data["prod_api_key"]:
            old_value = get_setting("melhor_envio_api_key_prod", "")
            set_setting(
                "melhor_envio_api_key_prod",
                data["prod_api_key"],
                "secret",
                "API Key do Melhor Envio (Produção)"
            )
            updated_fields.append("prod_api_key")
            log_audit(user_id, "UPDATE", "system_settings", "melhor_envio_api_key_prod",
                     {"value": mask_api_key(old_value)}, {"value": mask_api_key(data["prod_api_key"])})

        if "prod_client_id" in data and data["prod_client_id"]:
            set_setting(
                "melhor_envio_client_id_prod",
                data["prod_client_id"],
                "secret",
                "Client ID do Melhor Envio (Produção)"
            )
            updated_fields.append("prod_client_id")

        if "prod_client_secret" in data and data["prod_client_secret"]:
            set_setting(
                "melhor_envio_client_secret_prod",
                data["prod_client_secret"],
                "secret",
                "Client Secret do Melhor Envio (Produção)"
            )
            updated_fields.append("prod_client_secret")

        # Atualizar ambiente
        if "environment" in data:
            if data["environment"] in ["sandbox", "production"]:
                set_setting(
                    "melhor_envio_environment",
                    data["environment"],
                    "string",
                    "Ambiente do Melhor Envio (sandbox ou production)"
                )
                updated_fields.append("environment")

        # Atualizar CEP de origem
        if "origin_cep" in data:
            set_setting(
                "melhor_envio_origin_cep",
                data["origin_cep"],
                "string",
                "CEP de origem para cálculo de frete"
            )
            updated_fields.append("origin_cep")

        # Atualizar webhook URL
        if "webhook_url" in data:
            set_setting(
                "melhor_envio_webhook_url",
                data["webhook_url"],
                "string",
                "URL de webhook do Melhor Envio"
            )
            updated_fields.append("webhook_url")

        return jsonify({
            "success": True,
            "message": "Configurações do Melhor Envio atualizadas com sucesso",
            "updated_fields": updated_fields
        })

    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"Erro ao atualizar configurações do Melhor Envio: {e}")
        return jsonify({
            "success": False,
            "error": f"Erro ao atualizar configurações: {str(e)}"
        }), 500


@settings_bp.route("/melhor-envio/test", methods=["POST"])
@admin_required
def test_melhor_envio_connection():
    """Testa a conexão com a API do Melhor Envio"""
    try:
        data = request.get_json() or {}
        environment = data.get("environment", "sandbox")

        # Obter token do ambiente correto
        if environment == "sandbox":
            api_key = get_setting("melhor_envio_api_key_test", "")
            base_url = "https://sandbox.melhorenvio.com.br"
        else:
            api_key = get_setting("melhor_envio_api_key_prod", "")
            base_url = "https://melhorenvio.com.br"

        # Fallback para variável de ambiente
        if not api_key:
            api_key = os.environ.get("MELHOR_ENVIO_API_KEY", "")
            env_sandbox = os.environ.get("MELHOR_ENVIO_SANDBOX", "true").lower() == "true"
            if env_sandbox:
                base_url = "https://sandbox.melhorenvio.com.br"
            else:
                base_url = "https://melhorenvio.com.br"

        if not api_key:
            return jsonify({
                "success": False,
                "error": "API Key não configurada",
                "environment": environment
            }), 400

        # Testar conexão com a API
        import requests

        headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
            "Accept": "application/json",
            "User-Agent": "MestresDoCafe/1.0"
        }

        # Endpoint de teste - buscar informações do usuário
        response = requests.get(
            f"{base_url}/api/v2/me",
            headers=headers,
            timeout=10
        )

        if response.status_code == 200:
            user_data = response.json()
            return jsonify({
                "success": True,
                "message": "Conexão com Melhor Envio estabelecida com sucesso!",
                "environment": environment,
                "account": {
                    "id": user_data.get("id"),
                    "name": user_data.get("name") or user_data.get("firstname"),
                    "email": user_data.get("email"),
                    "document": user_data.get("document")
                }
            })
        elif response.status_code == 401:
            return jsonify({
                "success": False,
                "error": "API Key inválida ou expirada",
                "environment": environment
            }), 401
        else:
            return jsonify({
                "success": False,
                "error": f"Erro na API: {response.status_code}",
                "details": response.text,
                "environment": environment
            }), response.status_code

    except requests.exceptions.Timeout:
        return jsonify({
            "success": False,
            "error": "Timeout ao conectar com a API do Melhor Envio"
        }), 504
    except requests.exceptions.ConnectionError:
        return jsonify({
            "success": False,
            "error": "Erro de conexão com a API do Melhor Envio"
        }), 503
    except Exception as e:
        current_app.logger.error(f"Erro ao testar conexão Melhor Envio: {e}")
        return jsonify({
            "success": False,
            "error": f"Erro ao testar conexão: {str(e)}"
        }), 500


# =====================================================
# GENERAL SETTINGS
# =====================================================

@settings_bp.route("/", methods=["GET"])
@admin_required
def get_all_settings():
    """Obtém todas as configurações do sistema (não sensíveis)"""
    try:
        settings = SystemSetting.query.filter_by(is_active=True).all()

        result = []
        for setting in settings:
            # Mascarar valores sensíveis
            if setting.type == "secret":
                display_value = mask_api_key(setting.value) if setting.value else ""
            else:
                display_value = setting.value

            result.append({
                "id": str(setting.id),
                "key": setting.key,
                "value": display_value,
                "type": setting.type,
                "description": setting.description,
                "updated_at": setting.updated_at.isoformat() if setting.updated_at else None
            })

        return jsonify({
            "success": True,
            "data": result
        })
    except Exception as e:
        current_app.logger.error(f"Erro ao buscar configurações: {e}")
        return jsonify({
            "success": False,
            "error": f"Erro ao buscar configurações: {str(e)}"
        }), 500


@settings_bp.route("/status", methods=["GET"])
@admin_required
def get_integration_status():
    """Retorna o status de todas as integrações"""
    try:
        # Status Mercado Pago
        mp_test_token = get_setting("mercado_pago_access_token_test", "")
        mp_prod_token = get_setting("mercado_pago_access_token_prod", "")
        mp_env = get_setting("mercado_pago_environment", "sandbox")
        mp_env_token = os.environ.get("MERCADO_PAGO_ACCESS_TOKEN", "")

        # Status Melhor Envio
        me_test_key = get_setting("melhor_envio_api_key_test", "")
        me_prod_key = get_setting("melhor_envio_api_key_prod", "")
        me_env = get_setting("melhor_envio_environment", "sandbox")
        me_env_key = os.environ.get("MELHOR_ENVIO_API_KEY", "")

        # Status Database
        db_url = os.environ.get("DATABASE_URL") or os.environ.get("NEON_DATABASE_URL")

        # Status S3
        s3_bucket = os.environ.get("AWS_S3_BUCKET", "")
        s3_key = os.environ.get("AWS_ACCESS_KEY_ID", "")

        return jsonify({
            "success": True,
            "data": {
                "mercado_pago": {
                    "status": "configured" if (mp_test_token or mp_prod_token or mp_env_token) else "not_configured",
                    "environment": mp_env,
                    "has_test_credentials": bool(mp_test_token),
                    "has_prod_credentials": bool(mp_prod_token),
                    "has_env_credentials": bool(mp_env_token)
                },
                "melhor_envio": {
                    "status": "configured" if (me_test_key or me_prod_key or me_env_key) else "not_configured",
                    "environment": me_env,
                    "has_test_credentials": bool(me_test_key),
                    "has_prod_credentials": bool(me_prod_key),
                    "has_env_credentials": bool(me_env_key)
                },
                "database": {
                    "status": "configured" if db_url else "not_configured",
                    "type": "neon_postgresql" if db_url and "neon" in db_url.lower() else "postgresql" if db_url else "sqlite"
                },
                "storage": {
                    "status": "configured" if (s3_bucket and s3_key) else "not_configured",
                    "bucket": s3_bucket if s3_bucket else None
                }
            }
        })
    except Exception as e:
        current_app.logger.error(f"Erro ao buscar status das integrações: {e}")
        return jsonify({
            "success": False,
            "error": f"Erro ao buscar status: {str(e)}"
        }), 500


@settings_bp.route("/audit-logs", methods=["GET"])
@admin_required
def get_audit_logs():
    """Obtém logs de auditoria das configurações"""
    try:
        page = request.args.get("page", 1, type=int)
        per_page = request.args.get("per_page", 50, type=int)

        logs = AuditLog.query.filter(
            AuditLog.table_name == "system_settings"
        ).order_by(
            AuditLog.created_at.desc()
        ).paginate(
            page=page,
            per_page=per_page,
            error_out=False
        )

        return jsonify({
            "success": True,
            "data": {
                "logs": [log.to_dict() for log in logs.items],
                "pagination": {
                    "page": page,
                    "per_page": per_page,
                    "total": logs.total,
                    "pages": logs.pages
                }
            }
        })
    except Exception as e:
        current_app.logger.error(f"Erro ao buscar logs de auditoria: {e}")
        return jsonify({
            "success": False,
            "error": f"Erro ao buscar logs: {str(e)}"
        }), 500


@settings_bp.route("/init-database", methods=["POST"])
@admin_required
def init_database_endpoint():
    """Inicializa/atualiza o banco de dados (criar tabelas faltantes)"""
    try:
        from sqlalchemy import text

        # Criar tabelas que não existem
        db.create_all()

        # Verificar tabelas existentes
        result = db.session.execute(text("""
            SELECT COUNT(*)
            FROM information_schema.tables
            WHERE table_schema = 'public'
        """))
        table_count = result.scalar()

        current_app.logger.info(f"✅ Banco de dados inicializado - {table_count} tabelas")

        return jsonify({
            "success": True,
            "message": f"Banco de dados inicializado com sucesso",
            "tables_count": table_count
        })
    except Exception as e:
        current_app.logger.error(f"Erro ao inicializar banco: {e}")
        return jsonify({
            "success": False,
            "error": f"Erro ao inicializar banco: {str(e)}"
        }), 500


@settings_bp.route("/database-status", methods=["GET"])
@admin_required
def get_database_status():
    """Retorna o status do banco de dados"""
    try:
        from sqlalchemy import text

        # Verificar conexão
        db.session.execute(text("SELECT 1"))

        # Contar tabelas
        result = db.session.execute(text("""
            SELECT table_name
            FROM information_schema.tables
            WHERE table_schema = 'public'
            ORDER BY table_name
        """))
        tables = [row[0] for row in result.fetchall()]

        # Verificar algumas tabelas essenciais
        essential_tables = ['users', 'products', 'orders', 'system_settings']
        missing = [t for t in essential_tables if t not in tables]

        # Verificar contagem de registros em tabelas principais
        counts = {}
        for table in ['users', 'products', 'orders']:
            if table in tables:
                try:
                    count_result = db.session.execute(text(f"SELECT COUNT(*) FROM {table}"))
                    counts[table] = count_result.scalar()
                except:
                    counts[table] = 0

        return jsonify({
            "success": True,
            "data": {
                "status": "healthy" if not missing else "incomplete",
                "connection": "active",
                "tables_count": len(tables),
                "tables": tables[:20],  # Limitar para não sobrecarregar
                "missing_essential": missing,
                "record_counts": counts
            }
        })
    except Exception as e:
        current_app.logger.error(f"Erro ao verificar status do banco: {e}")
        return jsonify({
            "success": False,
            "data": {
                "status": "error",
                "connection": "failed",
                "error": str(e)
            }
        }), 500
