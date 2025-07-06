from flask import Blueprint, request, jsonify, current_app
from werkzeug.security import generate_password_hash, check_password_hash
import jwt
from datetime import datetime, timezone
from ...models.user import User
from ...models.base import db
from ...schemas.auth import LoginSchema, RegisterSchema, validate_request_data, format_validation_errors
from ...middleware.error_handler import AuthenticationAPIError, ValidationAPIError, ResourceAPIError
from marshmallow import ValidationError

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/login', methods=['POST'])
def login():
    try:
        # Validar dados de entrada
        request_data = request.get_json(silent=True)
        if not request_data:
            raise ValidationAPIError('Dados JSON não fornecidos')
        
        # Validar com schema
        result = validate_request_data(LoginSchema, request_data)
        if isinstance(result, tuple):
            validated_data, errors = result
            if errors:
                raise ValidationAPIError(
                    'Dados de entrada inválidos',
                    details=errors
                )
        else:
            validated_data = result
        
        email = validated_data['email']
        password = validated_data['password']
        
        # Buscar usuário
        user = User.query.filter_by(email=email).first()
        
        if not user:
            raise AuthenticationAPIError('Credenciais inválidas')
        
        if not user.is_active:
            raise AuthenticationAPIError('Conta inativa. Entre em contato com o suporte')
        
        if not check_password_hash(user.password_hash, password):
            raise AuthenticationAPIError('Credenciais inválidas')
        
        # Gerar token JWT usando configuração
        token_payload = {
            'user_id': user.id,
            'email': user.email,
            'username': user.username,
            'is_admin': user.is_admin,
            'exp': datetime.now(timezone.utc) + current_app.config['JWT_ACCESS_TOKEN_EXPIRES']
        }
        
        token = jwt.encode(
            token_payload,
            current_app.config['JWT_SECRET_KEY'],
            algorithm='HS256'
        )
        
        return jsonify({
            'success': True,
            'message': 'Login realizado com sucesso',
            'token': token,
            'user': {
                'id': user.id,
                'email': user.email,
                'username': user.username,
                'full_name': user.full_name,
                'is_admin': user.is_admin,
                'is_active': user.is_active
            }
        })
        
    except (ValidationAPIError, AuthenticationAPIError):
        raise  # Re-raise para ser tratado pelo error handler
    except Exception as e:
        current_app.logger.error(f'Erro inesperado no login: {str(e)}')
        raise AuthenticationAPIError('Erro interno no processo de login')

@auth_bp.route('/register', methods=['POST'])
def register():
    try:
        # Validar dados de entrada
        request_data = request.get_json(silent=True)
        if not request_data:
            raise ValidationAPIError('Dados JSON não fornecidos')
        
        # Validar com schema
        result = validate_request_data(RegisterSchema, request_data)
        if isinstance(result, tuple):
            validated_data, errors = result
            if errors:
                raise ValidationAPIError(
                    'Dados de entrada inválidos',
                    details=errors
                )
        else:
            validated_data = result
        
        email = validated_data['email']
        password = validated_data['password']
        name = validated_data['name']
        
        # Verificar se usuário já existe
        existing_user = User.query.filter_by(email=email).first()
        if existing_user:
            raise ResourceAPIError(
                'Usuário já existe com este email',
                error_code=4301,
                status_code=409
            )
        
        # Criar novo usuário
        new_user = User(
            email=email,
            username=email.split('@')[0],  # Usa parte antes do @ como username
            name=name,
            first_name=name.split(' ')[0] if ' ' in name else name,
            last_name=' '.join(name.split(' ')[1:]) if ' ' in name else '',
            is_active=True,
            is_admin=False
        )
        new_user.set_password(password)
        
        db.session.add(new_user)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Usuário criado com sucesso',
            'user': {
                'id': new_user.id,
                'email': new_user.email,
                'username': new_user.username,
                'full_name': new_user.full_name,
                'is_admin': new_user.is_admin
            }
        }), 201
        
    except (ValidationAPIError, ResourceAPIError):
        db.session.rollback()
        raise  # Re-raise para ser tratado pelo error handler
    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f'Erro inesperado no registro: {str(e)}')
        raise ValidationAPIError('Erro interno no processo de registro')

@auth_bp.route('/me', methods=['GET'])
def get_current_user():
    try:
        # Verificar se token foi fornecido
        token = request.headers.get('Authorization')
        if not token:
            raise AuthenticationAPIError('Token não fornecido')
        
        # Remover 'Bearer ' do token
        if token.startswith('Bearer '):
            token = token[7:]
        else:
            raise AuthenticationAPIError('Formato de token inválido. Use: Bearer <token>')
        
        # Decodificar token usando configuração
        try:
            decoded = jwt.decode(
                token,
                current_app.config['JWT_SECRET_KEY'],
                algorithms=['HS256']
            )
        except jwt.ExpiredSignatureError:
            raise AuthenticationAPIError('Token expirado')
        except jwt.InvalidTokenError:
            raise AuthenticationAPIError('Token inválido')
        
        # Buscar usuário
        user = User.query.get(decoded['user_id'])
        if not user:
            raise ResourceAPIError('Usuário não encontrado', error_code=4300)
        
        if not user.is_active:
            raise AuthenticationAPIError('Conta inativa')
        
        return jsonify({
            'success': True,
            'user': {
                'id': user.id,
                'email': user.email,
                'username': user.username,
                'full_name': user.full_name,
                'is_admin': user.is_admin,
                'is_active': user.is_active,
                'email_verified': getattr(user, 'email_verified', False)
            }
        })
        
    except (AuthenticationAPIError, ResourceAPIError):
        raise  # Re-raise para ser tratado pelo error handler
    except Exception as e:
        current_app.logger.error(f'Erro inesperado ao obter usuário: {str(e)}')
        raise AuthenticationAPIError('Erro interno ao obter dados do usuário')

@auth_bp.route('/logout', methods=['POST'])
def logout():
    return jsonify({
        'success': True,
        'message': 'Logout realizado com sucesso'
    })

