from datetime import datetime, timezone
from functools import wraps
import os

import bcrypt
from flask import Blueprint, current_app, jsonify, request
from flask_jwt_extended import (
    create_access_token,
    get_jwt_identity,
    jwt_required,
    decode_token
)

from database import db
from middleware.error_handler import (
    AuthenticationAPIError,
    ResourceAPIError,
    ValidationAPIError,
)
from middleware.rate_limiting import rate_limit
from middleware.audit_logging import audit_action, create_audit_log
from models import User, UserSession
from schemas.auth import (
    LoginSchema,
    RegisterSchema,
    validate_request_data,
)

auth_bp = Blueprint("auth", __name__)


def debug_only(f):
    """
    Decorator que protege endpoints de debug.
    Retorna 404 em produção para ocultar existência dos endpoints.
    Permite apenas em development e staging.
    """
    @wraps(f)
    def decorated_function(*args, **kwargs):
        env = current_app.config.get('ENV', 'production')
        flask_env = os.environ.get('FLASK_ENV', 'production')

        # Permitir apenas em development ou staging
        if env not in ['development', 'staging'] and flask_env not in ['development', 'staging']:
            # Retornar 404 ao invés de 403 para não revelar que o endpoint existe
            return jsonify({
                'error': 'Not found',
                'message': 'The requested endpoint does not exist'
            }), 404

        return f(*args, **kwargs)
    return decorated_function


def hash_password(password):
    """Hash password using bcrypt"""
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')


def check_password(password, hashed):
    """Check password against hash"""
    if not hashed:
        return False
    return bcrypt.checkpw(password.encode('utf-8'), hashed.encode('utf-8'))


def generate_unique_username(email):
    """Generate unique username from email, adding numbers if conflicts occur"""
    base_username = email.split("@")[0]
    username = base_username
    counter = 1
    
    # Verificar se username já existe e incrementar até encontrar um único
    while User.query.filter_by(username=username).first():
        username = f"{base_username}{counter}"
        counter += 1
        # Limite de segurança para evitar loop infinito
        if counter > 9999:
            # Fallback usando timestamp como sufixo
            import time
            username = f"{base_username}_{int(time.time())}"
            break
    
    return username


@auth_bp.route("/debug-database", methods=["GET"])
@debug_only
@jwt_required()
def debug_database():
    """Endpoint temporário para debug - descobrir que banco a API runtime está usando"""
    try:
        from database import db
        from models import User
        
        # Obter informações do banco em runtime
        database_info = {
            'database_uri': current_app.config.get('SQLALCHEMY_DATABASE_URI'),
            'database_engine_url': str(db.engine.url),
            'total_users': User.query.count(),
            'database_type': 'postgresql' if 'postgresql' in str(db.engine.url) else 'sqlite'
        }
        
        # Listar alguns usuários para confirmar
        users = User.query.limit(5).all()
        user_list = []
        for user in users:
            user_list.append({
                'id': user.id,
                'email': user.email,
                'name': user.name,
                'is_active': user.is_active
            })
        
        # Verificar se nosso usuário de teste existe
        test_user = User.query.filter_by(email='teste.final@mestres.com').first()
        
        current_app.logger.info(f"🔍 DEBUG DATABASE RUNTIME - URI: {database_info['database_uri']}")
        current_app.logger.info(f"🔍 DEBUG DATABASE RUNTIME - Total users: {database_info['total_users']}")
        current_app.logger.info(f"🔍 DEBUG DATABASE RUNTIME - Test user exists: {test_user is not None}")
        
        return jsonify({
            'success': True,
            'runtime_database': database_info,
            'sample_users': user_list,
            'test_user_exists': test_user is not None,
            'test_user_details': {
                'email': test_user.email,
                'name': test_user.name,
                'id': test_user.id,
                'is_active': test_user.is_active
            } if test_user else None
        }), 200
        
    except Exception as e:
        current_app.logger.error(f"❌ Erro no debug database: {str(e)}")
        return jsonify({
            'error': f'Erro no debug: {str(e)}'
        }), 500
@auth_bp.route("/login", methods=["POST"])
@rate_limit('auth_login')
def login():
    try:
        # Validar dados de entrada
        request_data = request.get_json(silent = True)
        if not request_data:
            raise ValidationAPIError("Dados JSON não fornecidos")

        # Log para debug - adicionar logs detalhados
        current_app.logger.info(f"🔍 Login request_data: {request_data}")

        # Validação básica
        email = request_data.get("email")
        password = request_data.get("password")

        # Log para debug - verificar valores extraídos
        current_app.logger.info(f"🔍 Extracted email: {email}")
        current_app.logger.info(f"🔍 Extracted password length: {len(password) if password else 'None'}")
        current_app.logger.info(f"🔍 Extracted password: {password[:10] if password else 'None'}...")

        if not email or not password:
            raise ValidationAPIError("Email e senha são obrigatórios")

        # Buscar usuário no banco
        user = User.query.filter_by(email = email).first()

        # Log para debug - verificar se usuário foi encontrado
        current_app.logger.info(f"🔍 User found in database: {user is not None}")
        if user:
            current_app.logger.info(f"🔍 User ID: {user.id}")
            current_app.logger.info(f"🔍 User email: {user.email}")
            current_app.logger.info(f"🔍 User is_active: {user.is_active}")
            current_app.logger.info(f"🔍 User password_hash: {user.password_hash[:20]}..." if user.password_hash else "None")
        else:
            current_app.logger.warning(f"❌ User not found with email: {email}")
            # Verificar se há usuários no banco
            user_count = User.query.count()
            current_app.logger.info(f"🔍 Total users in database: {user_count}")

        if not user:
            raise AuthenticationAPIError("Credenciais inválidas")

        if not user.is_active:
            raise AuthenticationAPIError(
                "Conta inativa. Entre em contato com o suporte"
            )

        # Log para debug - verificar verificação de senha
        current_app.logger.info(f"🔍 Starting password verification...")
        password_valid = check_password(password, user.password_hash)
        current_app.logger.info(f"🔍 Password verification result: {password_valid}")

        if not password_valid:
            current_app.logger.warning(f"❌ Password verification failed for user {email}")
            # Audit log para login falhado
            create_audit_log('auth.failed_login', details={
                'email': email,
                'reason': 'invalid_password'
            }, user_id=str(user.id) if user else None, success=False)
            raise AuthenticationAPIError("Credenciais inválidas")

        current_app.logger.info(f"✅ Password verification successful for user {email}")

        # Gerar token JWT usando flask_jwt_extended
        additional_claims = {
            "email": user.email,
            "username": user.username or email.split("@")[0],
            "is_admin": user.is_admin,
        }

        token = create_access_token(
            identity=str(user.id),
            additional_claims=additional_claims
        )

        # Criar sessão do usuário
        user_session = UserSession(
            user_id = user.id,
            session_token = token,
            expires_at = datetime.now(timezone.utc)
            + current_app.config["JWT_ACCESS_TOKEN_EXPIRES"],
        )

        db.session.add(user_session)
        db.session.commit()

        # Audit log para login bem-sucedido
        create_audit_log('auth.login', details={
            'email': user.email,
            'user_id': str(user.id)
        }, user_id=str(user.id), success=True)

        return jsonify(
            {
                "success": True,
                "message": "Login realizado com sucesso",
                "access_token": token,
                "user": {
                    "id": str(user.id),
                    "email": user.email,
                    "username": user.username or email.split("@")[0],
                    "name": user.name,
                    "is_admin": user.is_admin,
                    "is_active": user.is_active,
                    "user_type": "admin" if user.is_admin else "customer",
                    "points": user.points,
                    "level": user.level,
                },
            }
        )

    except (ValidationAPIError, AuthenticationAPIError):
        raise  # Re-raise para ser tratado pelo error handler
    except Exception as e:
        current_app.logger.error(f"Erro inesperado no login: {str(e)}")
        raise AuthenticationAPIError("Erro interno no processo de login")


@auth_bp.route("/register", methods=["POST"])
@rate_limit('auth_register')
def register():
    try:
        # Validar dados de entrada
        request_data = request.get_json(silent = True)
        if not request_data:
            raise ValidationAPIError("Dados JSON não fornecidos")

        # Log para debug
        current_app.logger.info(f"🔍 Register request_data: {request_data}")

        # Validação básica
        email = request_data.get("email")
        password = request_data.get("password")
        name = request_data.get("name")

        if not email or not password or not name:
            raise ValidationAPIError("Email, senha e nome são obrigatórios")

        # Verificar se usuário já existe
        existing_user = User.query.filter_by(email = email).first()

        if existing_user:
            raise ResourceAPIError(
                "Usuário já existe com este email",
                error_code = 4301,
                status_code = 409
            )

        # Extrair campos adicionais do frontend
        phone = request_data.get("phone")
        cpf_cnpj = request_data.get("cpf_cnpj")
        company_name = request_data.get("company_name")
        company_segment = request_data.get("company_segment")
        account_type = request_data.get("accountType", "individual")

        current_app.logger.info(f"🔍 Campos extras: phone={phone}, cpf_cnpj={cpf_cnpj}, account_type={account_type}")

        # Criar novo usuário
        new_user = User(
            email = email,
            username = generate_unique_username(email),
            name = name,
            first_name = name.split(" ")[0] if " " in name else name,
            last_name=" ".join(name.split(" ")[1:]) if " " in name else "",
            password_hash = hash_password(password),
            phone = phone,
            cpf_cnpj = cpf_cnpj,
            company_name = company_name,
            company_segment = company_segment,
            account_type = account_type,
            is_active = True,
            is_admin = False,
            role='customer',
            points = 0,
            level='bronze'
        )

        db.session.add(new_user)
        db.session.commit()

        # Gerar token JWT para login automático (mesmo padrão do /login)
        additional_claims = {
            "email": new_user.email,
            "username": new_user.username,
            "is_admin": new_user.is_admin,
        }

        token = create_access_token(
            identity=str(new_user.id),
            additional_claims=additional_claims
        )

        # Criar sessão do usuário (mesmo padrão do /login)
        user_session = UserSession(
            user_id = new_user.id,
            session_token = token,
            expires_at = datetime.now(timezone.utc)
            + current_app.config["JWT_ACCESS_TOKEN_EXPIRES"],
        )

        db.session.add(user_session)
        db.session.commit()

        current_app.logger.info(f"✅ Token JWT gerado para novo usuário {new_user.email}")

        return (
            jsonify(
                {
                    "success": True,
                    "message": "Cadastro realizado com sucesso! Login automático efetuado.",
                    "access_token": token,
                    "user": {
                        "id": str(new_user.id),
                        "email": new_user.email,
                        "username": new_user.username,
                        "name": new_user.name,
                        "is_admin": new_user.is_admin,
                        "is_active": new_user.is_active,
                        "user_type": "admin" if new_user.is_admin else "customer",
                        "points": new_user.points,
                        "level": new_user.level,
                    },
                }
            ),
            201,
        )

    except (ValidationAPIError, ResourceAPIError):
        raise  # Re-raise para ser tratado pelo error handler
    except Exception as e:
        current_app.logger.error(f"Erro inesperado no registro: {str(e)}")
        raise ValidationAPIError("Erro interno no processo de registro")


@auth_bp.route("/me", methods=["GET"])
@jwt_required()
def get_current_user():
    try:
        # Obter ID do usuário do token JWT
        user_id = get_jwt_identity()
        
        # Buscar usuário no banco
        user = User.query.get(user_id)

        if not user:
            raise ResourceAPIError("Usuário não encontrado", error_code = 4300)

        if not user.is_active:
            raise AuthenticationAPIError("Conta inativa")

        return jsonify(
            {
                "success": True,
                "user": {
                    "id": str(user.id),
                    "email": user.email,
                    "username": user.username,
                    "full_name": user.name,
                    "is_admin": user.is_admin,
                    "is_active": user.is_active,
                    "email_verified": user.email_verified,
                    "points": user.points,
                    "level": user.level,
                    "created_at": user.created_at.isoformat(),
                },
            }
        )

    except (AuthenticationAPIError, ResourceAPIError):
        raise  # Re-raise para ser tratado pelo error handler
    except Exception as e:
        current_app.logger.error(f"Erro inesperado ao obter usuário: {str(e)}")
        raise AuthenticationAPIError("Erro interno ao obter dados do usuário")


@auth_bp.route("/logout", methods=["POST"])
@jwt_required(optional=True)
def logout():
    try:
        # Obter token do cabeçalho para invalidar sessão
        token = request.headers.get("Authorization")
        if token and token.startswith("Bearer "):
            token = token[7:]

            # Invalidar sessão do usuário
            user_session = UserSession.query.filter_by(session_token = token).first()
            if user_session:
                db.session.delete(user_session)
                db.session.commit()

        return jsonify({"success": True, "message": "Logout realizado com sucesso"})
    except Exception as e:
        current_app.logger.error(f"Erro no logout: {str(e)}")
        return jsonify({"success": True, "message": "Logout realizado com sucesso"})
