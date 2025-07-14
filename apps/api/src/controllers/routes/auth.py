from datetime import datetime, timezone

import jwt
import bcrypt
from flask import Blueprint, current_app, jsonify, request

from ...database import db
from ...middleware.error_handler import (
    AuthenticationAPIError,
    ResourceAPIError,
    ValidationAPIError,
)
from ...models import User, UserSession
from ...schemas.auth import (
    LoginSchema,
    RegisterSchema,
    validate_request_data,
)

auth_bp = Blueprint("auth", __name__)


def hash_password(password):
    """Hash password using bcrypt"""
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')


def check_password(password, hashed):
    """Check password against hash"""
    if not hashed:
        return False
    return bcrypt.checkpw(password.encode('utf-8'), hashed.encode('utf-8'))


@auth_bp.route("/login", methods=["POST"])
def login():
    try:
        # Validar dados de entrada
        request_data = request.get_json(silent=True)
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
        user = User.query.filter_by(email=email).first()

        if not user:
            raise AuthenticationAPIError("Credenciais inválidas")

        if not user.is_active:
            raise AuthenticationAPIError(
                "Conta inativa. Entre em contato com o suporte"
            )

        if not check_password(password, user.password_hash):
            raise AuthenticationAPIError("Credenciais inválidas")

        # Gerar token JWT usando configuração
        token_payload = {
            "user_id": str(user.id),
            "email": user.email,
            "username": user.username or email.split("@")[0],
            "is_admin": user.is_admin,
            "exp": datetime.now(timezone.utc)
            + current_app.config["JWT_ACCESS_TOKEN_EXPIRES"],
        }

        token = jwt.encode(
            token_payload,
            current_app.config["JWT_SECRET_KEY"],
            algorithm="HS256"
        )

        # Criar sessão do usuário
        user_session = UserSession(
            user_id=user.id,
            session_token=token,
            expires_at=datetime.now(timezone.utc)
            + current_app.config["JWT_ACCESS_TOKEN_EXPIRES"],
        )

        db.session.add(user_session)
        db.session.commit()

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
def register():
    try:
        # Validar dados de entrada
        request_data = request.get_json(silent=True)
        if not request_data:
            raise ValidationAPIError("Dados JSON não fornecidos")

        # Validação básica
        email = request_data.get("email")
        password = request_data.get("password")
        name = request_data.get("name")

        if not email or not password or not name:
            raise ValidationAPIError("Email, senha e nome são obrigatórios")

        # Verificar se usuário já existe
        existing_user = User.query.filter_by(email=email).first()

        if existing_user:
            raise ResourceAPIError(
                "Usuário já existe com este email",
                error_code=4301,
                status_code=409
            )

        # Criar novo usuário
        new_user = User(
            email=email,
            username=email.split("@")[0],
            name=name,
            first_name=name.split(" ")[0] if " " in name else name,
            last_name=" ".join(name.split(" ")[1:]) if " " in name else "",
            password_hash=hash_password(password),
            is_active=True,
            is_admin=False,
            role='customer',
            points=0,
            level='bronze'
        )

        db.session.add(new_user)
        db.session.commit()

        return (
            jsonify(
                {
                    "success": True,
                    "message": "Usuário criado com sucesso",
                    "user": {
                        "id": str(new_user.id),
                        "email": new_user.email,
                        "username": new_user.username,
                        "full_name": new_user.name,
                        "is_admin": new_user.is_admin,
                        "role": new_user.role,
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
def get_current_user():
    try:
        # Verificar se token foi fornecido
        token = request.headers.get("Authorization")
        if not token:
            raise AuthenticationAPIError("Token não fornecido")

        # Remover 'Bearer ' do token
        if token.startswith("Bearer "):
            token = token[7:]
        else:
            raise AuthenticationAPIError(
                "Formato de token inválido. Use: Bearer <token>"
            )

        # Decodificar token usando configuração
        try:
            decoded = jwt.decode(
                token, current_app.config["JWT_SECRET_KEY"], algorithms=["HS256"]
            )
        except jwt.ExpiredSignatureError:
            raise AuthenticationAPIError("Token expirado")
        except jwt.InvalidTokenError:
            raise AuthenticationAPIError("Token inválido")

        # Buscar usuário no banco
        user = User.query.get(decoded["user_id"])

        if not user:
            raise ResourceAPIError("Usuário não encontrado", error_code=4300)

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
def logout():
    try:
        # Verificar se token foi fornecido
        token = request.headers.get("Authorization")
        if token and token.startswith("Bearer "):
            token = token[7:]

            # Invalidar sessão do usuário
            user_session = UserSession.query.filter_by(session_token=token).first()
            if user_session:
                db.session.delete(user_session)
                db.session.commit()

        return jsonify({"success": True, "message": "Logout realizado com sucesso"})
    except Exception as e:
        current_app.logger.error(f"Erro no logout: {str(e)}")
        return jsonify({"success": True, "message": "Logout realizado com sucesso"})
