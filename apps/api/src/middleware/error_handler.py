"""
Middleware de tratamento de erros enterprise
Captura, loga e trata todos os tipos de erros sem mascarar
"""

import logging
import traceback
import sys
import os
from datetime import datetime, timezone
from functools import wraps
from flask import request, jsonify, current_app
from werkzeug.exceptions import HTTPException
from sqlalchemy.exc import SQLAlchemyError, IntegrityError, DataError
from marshmallow import ValidationError
import jwt
from typing import Dict, Any, Optional, Tuple

# Criar diretório de logs se não existir
logs_dir = 'logs'
if not os.path.exists(logs_dir):
    os.makedirs(logs_dir, exist_ok=True)

# Configuração de logging
logging.basicConfig(
    level = logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('logs/error.log'),
        logging.StreamHandler(sys.stdout)
    ]
)

logger = logging.getLogger(__name__)

class ErrorCode:
    """Códigos de erro padronizados"""
    # Erros de validação (4000-4099)
    VALIDATION_ERROR = 4000
    MISSING_FIELD = 4001
    INVALID_FORMAT = 4002
    INVALID_VALUE = 4003

    # Erros de autenticação (4100-4199)
    UNAUTHORIZED = 4100
    INVALID_TOKEN = 4101
    EXPIRED_TOKEN = 4102
    MISSING_TOKEN = 4103
    INVALID_CREDENTIALS = 4104

    # Erros de autorização (4200-4299)
    FORBIDDEN = 4200
    INSUFFICIENT_PERMISSIONS = 4201
    RESOURCE_ACCESS_DENIED = 4202

    # Erros de recursos (4300-4399)
    RESOURCE_NOT_FOUND = 4300
    RESOURCE_ALREADY_EXISTS = 4301
    RESOURCE_CONFLICT = 4302

    # Erros de banco de dados (5000-5099)
    DATABASE_ERROR = 5000
    CONNECTION_ERROR = 5001
    INTEGRITY_ERROR = 5002
    DATA_ERROR = 5003

    # Erros de sistema (5100-5199)
    INTERNAL_ERROR = 5100
    SERVICE_UNAVAILABLE = 5101
    TIMEOUT_ERROR = 5102
    CONFIGURATION_ERROR = 5103

    # Erros de negócio (6000-6099)
    BUSINESS_RULE_VIOLATION = 6000
    INSUFFICIENT_STOCK = 6001
    INVALID_OPERATION = 6002
    PAYMENT_FAILED = 6003

class APIError(Exception):
    """Exceção base para erros da API"""

    def __init__(
        self,
        message: str,
        error_code: int,
        status_code: int = 500,
        details: Optional[Dict[str, Any]] = None,
        cause: Optional[Exception] = None
    ):
        self.message = message
        self.error_code = error_code
        self.status_code = status_code
        self.details = details or {}
        self.cause = cause
        self.timestamp = datetime.now(timezone.utc).isoformat()
        super().__init__(self.message)

class ValidationAPIError(APIError):
    """Erro de validação"""
    def __init__(self, message: str, details: Optional[Dict] = None):
        super().__init__(
            message = message,
            error_code = ErrorCode.VALIDATION_ERROR,
            status_code = 400,
            details = details
        )

class AuthenticationAPIError(APIError):
    """Erro de autenticação"""
    def __init__(self, message: str, error_code: int = ErrorCode.UNAUTHORIZED):
        super().__init__(
            message = message,
            error_code = error_code,
            status_code = 401
        )

class AuthorizationAPIError(APIError):
    """Erro de autorização"""
    def __init__(self, message: str, error_code: int = ErrorCode.FORBIDDEN):
        super().__init__(
            message = message,
            error_code = error_code,
            status_code = 403
        )

class ResourceAPIError(APIError):
    """Erro de recurso"""
    def __init__(self, message: str, error_code: int, status_code: int = 404):
        super().__init__(
            message = message,
            error_code = error_code,
            status_code = status_code
        )

class BusinessAPIError(APIError):
    """Erro de regra de negócio"""
    def __init__(self, message: str, error_code: int = ErrorCode.BUSINESS_RULE_VIOLATION):
        super().__init__(
            message = message,
            error_code = error_code,
            status_code = 422
        )

def log_error(error: Exception, request_data: Dict[str, Any]) -> str:
    """
    Loga erro com contexto completo
    """
    error_id = f"ERR_{datetime.now(timezone.utc).strftime('%Y%m%d_%H%M%S_%f')}"

    error_context = {
        'error_id': error_id,
        'error_type': type(error).__name__,
        'error_message': str(error),
        'request_method': request_data.get('method'),
        'request_url': request_data.get('url'),
        'request_headers': dict(request_data.get('headers', {})),
        'request_data': request_data.get('data'),
        'user_agent': request_data.get('user_agent'),
        'remote_addr': request_data.get('remote_addr'),
        'timestamp': datetime.now(timezone.utc).isoformat(),
        'traceback': traceback.format_exc() if not isinstance(error, APIError) else None
    }

    # Log com nível apropriado
    if isinstance(error, APIError):
        if error.status_code >= 500:
            logger.error(f"API Error: {error_context}")
        else:
            logger.warning(f"API Warning: {error_context}")
    else:
        logger.error(f"Unexpected Error: {error_context}")

    return error_id

def get_request_data() -> Dict[str, Any]:
    """
    Extrai dados da requisição para logging
    """
    try:
        return {
            'method': request.method,
            'url': request.url,
            'headers': request.headers,
            'data': request.get_json(silent = True) or request.form.to_dict(),
            'user_agent': request.user_agent.string,
            'remote_addr': request.remote_addr
        }
    except Exception:
        return {}

def handle_validation_error(error: ValidationError) -> Tuple[Dict[str, Any], int]:
    """
    Trata erros de validação do Marshmallow
    """
    error_id = log_error(error, get_request_data())

    return {
        'error': {
            'code': ErrorCode.VALIDATION_ERROR,
            'message': 'Dados de entrada inválidos',
            'details': error.messages,
            'error_id': error_id,
            'timestamp': datetime.now(timezone.utc).isoformat()
        }
    }, 400

def handle_sqlalchemy_error(error: SQLAlchemyError) -> Tuple[Dict[str, Any], int]:
    """
    Trata erros do SQLAlchemy
    """
    error_id = log_error(error, get_request_data())

    if isinstance(error, IntegrityError):
        return {
            'error': {
                'code': ErrorCode.INTEGRITY_ERROR,
                'message': 'Violação de integridade dos dados',
                'details': {'constraint': str(error.orig)},
                'error_id': error_id,
                'timestamp': datetime.now(timezone.utc).isoformat()
            }
        }, 409

    elif isinstance(error, DataError):
        return {
            'error': {
                'code': ErrorCode.DATA_ERROR,
                'message': 'Erro nos dados fornecidos',
                'details': {'database_error': str(error.orig)},
                'error_id': error_id,
                'timestamp': datetime.now(timezone.utc).isoformat()
            }
        }, 400

    else:
        return {
            'error': {
                'code': ErrorCode.DATABASE_ERROR,
                'message': 'Erro interno do banco de dados',
                'error_id': error_id,
                'timestamp': datetime.now(timezone.utc).isoformat()
            }
        }, 500

def handle_jwt_error(error: jwt.PyJWTError) -> Tuple[Dict[str, Any], int]:
    """
    Trata erros de JWT
    """
    error_id = log_error(error, get_request_data())

    if isinstance(error, jwt.ExpiredSignatureError):
        error_code = ErrorCode.EXPIRED_TOKEN
        message = 'Token expirado'
    elif isinstance(error, jwt.InvalidTokenError):
        error_code = ErrorCode.INVALID_TOKEN
        message = 'Token inválido'
    else:
        error_code = ErrorCode.UNAUTHORIZED
        message = 'Erro de autenticação'

    return {
        'error': {
            'code': error_code,
            'message': message,
            'error_id': error_id,
            'timestamp': datetime.now(timezone.utc).isoformat()
        }
    }, 401

def handle_http_exception(error: HTTPException) -> Tuple[Dict[str, Any], int]:
    """
    Trata exceções HTTP do Werkzeug
    """
    error_id = log_error(error, get_request_data())

    return {
        'error': {
            'code': error.code,
            'message': error.description,
            'error_id': error_id,
            'timestamp': datetime.now(timezone.utc).isoformat()
        }
    }, error.code

def handle_api_error(error: APIError) -> Tuple[Dict[str, Any], int]:
    """
    Trata erros customizados da API
    """
    error_id = log_error(error, get_request_data())

    response_data = {
        'error': {
            'code': error.error_code,
            'message': error.message,
            'error_id': error_id,
            'timestamp': error.timestamp
        }
    }

    if error.details:
        response_data['error']['details'] = error.details

    if error.cause and current_app.debug:
        response_data['error']['cause'] = str(error.cause)

    return response_data, error.status_code

def handle_generic_error(error: Exception) -> Tuple[Dict[str, Any], int]:
    """
    Trata erros genéricos não capturados
    """
    error_id = log_error(error, get_request_data())

    # Em produção, não expor detalhes do erro
    if current_app.debug:
        message = str(error)
        details = {'traceback': traceback.format_exc()}
    else:
        message = 'Erro interno do servidor'
        details = None

    response_data = {
        'error': {
            'code': ErrorCode.INTERNAL_ERROR,
            'message': message,
            'error_id': error_id,
            'timestamp': datetime.now(timezone.utc).isoformat()
        }
    }

    if details:
        response_data['error']['details'] = details

    return response_data, 500

def register_error_handlers(app):
    """
    Registra todos os handlers de erro na aplicação Flask
    """

    @app.errorhandler(ValidationError)
    def validation_error_handler(error):
        response_data, status_code = handle_validation_error(error)
        return jsonify(response_data), status_code

    @app.errorhandler(SQLAlchemyError)
    def sqlalchemy_error_handler(error):
        response_data, status_code = handle_sqlalchemy_error(error)
        return jsonify(response_data), status_code

    @app.errorhandler(jwt.PyJWTError)
    def jwt_error_handler(error):
        response_data, status_code = handle_jwt_error(error)
        return jsonify(response_data), status_code

    @app.errorhandler(HTTPException)
    def http_exception_handler(error):
        response_data, status_code = handle_http_exception(error)
        return jsonify(response_data), status_code

    @app.errorhandler(APIError)
    def api_error_handler(error):
        response_data, status_code = handle_api_error(error)
        return jsonify(response_data), status_code

    @app.errorhandler(Exception)
    def generic_error_handler(error):
        response_data, status_code = handle_generic_error(error)
        return jsonify(response_data), status_code

def error_handler_decorator(f):
    """
    Decorator para capturar e tratar erros em funções
    """
    @wraps(f)
    def decorated_function(*args, **kwargs):
        try:
            return f(*args, **kwargs)
        except APIError:
            raise  # Re-raise API errors para serem tratados pelos handlers
        except ValidationError:
            raise  # Re-raise validation errors
        except SQLAlchemyError:
            raise  # Re-raise database errors
        except Exception as e:
            # Converte exceções genéricas em APIError
            raise APIError(
                message = f"Erro inesperado em {f.__name__}",
                error_code = ErrorCode.INTERNAL_ERROR,
                cause = e
            )

    return decorated_function

# Utilitários para validação
def validate_required_fields(data: Dict[str, Any], required_fields: list) -> None:
    """
    Valida se todos os campos obrigatórios estão presentes
    """
    missing_fields = [field for field in required_fields if field not in data or data[field] is None]

    if missing_fields:
        raise ValidationAPIError(
            message="Campos obrigatórios ausentes",
            details={'missing_fields': missing_fields}
        )

def validate_field_types(data: Dict[str, Any], field_types: Dict[str, type]) -> None:
    """
    Valida tipos de campos
    """
    type_errors = {}

    for field, expected_type in field_types.items():
        if field in data and data[field] is not None:
            if not isinstance(data[field], expected_type):
                type_errors[field] = f"Esperado {expected_type.__name__}, recebido {type(data[field]).__name__}"

    if type_errors:
        raise ValidationAPIError(
            message="Tipos de dados inválidos",
            details={'type_errors': type_errors}
        )

def validate_business_rules(condition: bool, message: str, error_code: int = ErrorCode.BUSINESS_RULE_VIOLATION) -> None:
    """
    Valida regras de negócio
    """
    if not condition:
        raise BusinessAPIError(message = message, error_code = error_code)

