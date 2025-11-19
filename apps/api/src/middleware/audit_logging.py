"""
Audit Logging Middleware - Mestres do Café
Logs detalhados de ações sensíveis para auditoria e compliance
"""

import json
import logging
from datetime import datetime
from functools import wraps
from flask import request, g
from flask_jwt_extended import get_jwt_identity, verify_jwt_in_request

logger = logging.getLogger(__name__)

# Ações que devem ser auditadas
AUDITABLE_ACTIONS = {
    # Autenticação e Autorização
    'auth.login': {
        'category': 'authentication',
        'severity': 'info',
        'description': 'User login attempt',
    },
    'auth.logout': {
        'category': 'authentication',
        'severity': 'info',
        'description': 'User logout',
    },
    'auth.password_reset': {
        'category': 'authentication',
        'severity': 'warning',
        'description': 'Password reset requested',
    },
    'auth.password_change': {
        'category': 'authentication',
        'severity': 'warning',
        'description': 'Password changed',
    },
    'auth.failed_login': {
        'category': 'security',
        'severity': 'warning',
        'description': 'Failed login attempt',
    },

    # Operações Administrativas
    'admin.user_create': {
        'category': 'user_management',
        'severity': 'warning',
        'description': 'Admin created new user',
    },
    'admin.user_delete': {
        'category': 'user_management',
        'severity': 'critical',
        'description': 'Admin deleted user',
    },
    'admin.user_update': {
        'category': 'user_management',
        'severity': 'info',
        'description': 'Admin updated user',
    },
    'admin.role_change': {
        'category': 'user_management',
        'severity': 'critical',
        'description': 'Admin changed user role',
    },

    # Operações Financeiras
    'payment.created': {
        'category': 'financial',
        'severity': 'info',
        'description': 'Payment created',
    },
    'payment.completed': {
        'category': 'financial',
        'severity': 'info',
        'description': 'Payment completed successfully',
    },
    'payment.failed': {
        'category': 'financial',
        'severity': 'warning',
        'description': 'Payment failed',
    },
    'payment.refunded': {
        'category': 'financial',
        'severity': 'warning',
        'description': 'Payment refunded',
    },
    'order.placed': {
        'category': 'financial',
        'severity': 'info',
        'description': 'Order placed',
    },
    'order.cancelled': {
        'category': 'financial',
        'severity': 'warning',
        'description': 'Order cancelled',
    },

    # Dados Sensíveis
    'data.export': {
        'category': 'data_access',
        'severity': 'warning',
        'description': 'Data exported',
    },
    'data.delete': {
        'category': 'data_access',
        'severity': 'critical',
        'description': 'Data deleted',
    },
    'data.bulk_update': {
        'category': 'data_access',
        'severity': 'warning',
        'description': 'Bulk data update',
    },

    # Configurações do Sistema
    'system.config_change': {
        'category': 'system',
        'severity': 'critical',
        'description': 'System configuration changed',
    },
    'system.maintenance_mode': {
        'category': 'system',
        'severity': 'critical',
        'description': 'Maintenance mode toggled',
    },
}


def get_request_metadata():
    """Coleta metadados da requisição para o log de auditoria"""

    # IP do cliente
    if request.headers.get('X-Forwarded-For'):
        client_ip = request.headers.get('X-Forwarded-For').split(',')[0].strip()
    elif request.headers.get('X-Real-IP'):
        client_ip = request.headers.get('X-Real-IP')
    else:
        client_ip = request.remote_addr or 'unknown'

    # User agent
    user_agent = request.headers.get('User-Agent', 'unknown')

    # Request ID (se disponível)
    request_id = getattr(g, 'request_id', None) or request.headers.get('X-Request-ID', 'unknown')

    # Usuário autenticado (se aplicável)
    try:
        verify_jwt_in_request(optional=True)
        user_id = get_jwt_identity()
    except:
        user_id = None

    return {
        'timestamp': datetime.utcnow().isoformat(),
        'client_ip': client_ip,
        'user_agent': user_agent,
        'request_id': request_id,
        'user_id': user_id,
        'method': request.method,
        'path': request.path,
        'query_params': dict(request.args),
    }


def create_audit_log(action: str, details: dict = None, user_id: str = None, success: bool = True):
    """
    Cria um log de auditoria estruturado

    Args:
        action: Ação auditada (ex: 'auth.login', 'admin.user_delete')
        details: Detalhes específicos da ação
        user_id: ID do usuário (opcional, será detectado automaticamente se não fornecido)
        success: Se a ação foi bem-sucedida
    """

    action_config = AUDITABLE_ACTIONS.get(action, {
        'category': 'general',
        'severity': 'info',
        'description': 'Unknown action',
    })

    # Coletar metadados da requisição
    metadata = get_request_metadata()

    # Usar user_id fornecido ou do JWT
    if user_id is None:
        user_id = metadata.get('user_id')

    # Construir log de auditoria estruturado
    audit_entry = {
        'action': action,
        'category': action_config['category'],
        'severity': action_config['severity'],
        'description': action_config['description'],
        'success': success,
        'user_id': user_id,
        'timestamp': metadata['timestamp'],
        'client_ip': metadata['client_ip'],
        'user_agent': metadata['user_agent'],
        'request_id': metadata['request_id'],
        'request_method': metadata['method'],
        'request_path': metadata['path'],
        'details': details or {},
    }

    # Log baseado na severidade
    log_message = json.dumps(audit_entry, ensure_ascii=False)

    if action_config['severity'] == 'critical':
        logger.critical(f"[AUDIT] {log_message}")
    elif action_config['severity'] == 'warning':
        logger.warning(f"[AUDIT] {log_message}")
    else:
        logger.info(f"[AUDIT] {log_message}")

    # TODO: Em produção, enviar para sistema de logging centralizado (ELK, Splunk, etc.)
    # send_to_audit_system(audit_entry)

    return audit_entry


def audit_action(action: str, include_request_data: bool = False):
    """
    Decorator para auditar automaticamente uma ação

    Uso:
        @app.route('/api/admin/users/<user_id>', methods=['DELETE'])
        @jwt_required()
        @audit_action('admin.user_delete')
        def delete_user(user_id):
            ...
    """
    def decorator(f):
        @wraps(f)
        def wrapped(*args, **kwargs):
            # Coletar detalhes antes da execução
            details = {
                'args': args,
                'kwargs': kwargs,
            }

            if include_request_data:
                # Incluir dados da requisição (cuidado com dados sensíveis)
                details['request_data'] = request.get_json() if request.is_json else None

            # Executar função
            success = True
            error = None

            try:
                result = f(*args, **kwargs)

                # Se result é uma tupla (data, status_code), verificar status
                if isinstance(result, tuple) and len(result) > 1:
                    status_code = result[1]
                    success = 200 <= status_code < 300
                elif hasattr(result, 'status_code'):
                    success = 200 <= result.status_code < 300

                return result

            except Exception as e:
                success = False
                error = str(e)
                details['error'] = error
                raise

            finally:
                # Criar log de auditoria após execução
                details['success'] = success
                create_audit_log(action, details=details, success=success)

        return wrapped
    return decorator


def audit_sensitive_access(resource_type: str, resource_id: str = None):
    """
    Decorator para auditar acesso a recursos sensíveis

    Uso:
        @app.route('/api/users/<user_id>/profile', methods=['GET'])
        @jwt_required()
        @audit_sensitive_access('user_profile')
        def get_user_profile(user_id):
            ...
    """
    def decorator(f):
        @wraps(f)
        def wrapped(*args, **kwargs):
            # Criar log de acesso
            details = {
                'resource_type': resource_type,
                'resource_id': resource_id or kwargs.get('id') or kwargs.get('user_id'),
                'access_type': 'read' if request.method == 'GET' else 'write',
            }

            create_audit_log(f'data.access.{resource_type}', details=details)

            # Executar função original
            return f(*args, **kwargs)

        return wrapped
    return decorator


def init_audit_logging(app):
    """Inicializar audit logging no Flask app"""

    # Configurar logger de auditoria separado
    audit_logger = logging.getLogger('audit')
    audit_logger.setLevel(logging.INFO)

    # Handler para arquivo de auditoria
    from logging.handlers import RotatingFileHandler
    import os

    log_dir = os.path.join(app.root_path, 'logs')
    os.makedirs(log_dir, exist_ok=True)

    audit_file = os.path.join(log_dir, 'audit.log')
    file_handler = RotatingFileHandler(
        audit_file,
        maxBytes=10 * 1024 * 1024,  # 10MB
        backupCount=10
    )
    file_handler.setLevel(logging.INFO)

    # Formato JSON para fácil parsing
    formatter = logging.Formatter('%(message)s')
    file_handler.setFormatter(formatter)

    audit_logger.addHandler(file_handler)

    # Registrar início do sistema
    create_audit_log('system.startup', details={
        'app_name': app.name,
        'environment': app.config.get('ENV', 'unknown'),
    })

    logger.info("Audit logging initialized")
    logger.info(f"Audit logs will be written to: {audit_file}")

    # Middleware para auditar requests suspeitos
    @app.before_request
    def audit_suspicious_requests():
        # Detectar padrões suspeitos
        suspicious_patterns = [
            'admin', 'delete', 'drop', 'truncate', 'exec',
            '<script>', 'javascript:', 'onerror=', '../../../'
        ]

        request_data = str(request.args) + str(request.form) + (request.get_data(as_text=True) or '')

        for pattern in suspicious_patterns:
            if pattern.lower() in request_data.lower():
                create_audit_log('security.suspicious_request', details={
                    'pattern_detected': pattern,
                    'request_data_sample': request_data[:200],  # Primeiros 200 chars
                }, success=False)
                break

    logger.info("Audit logging middleware initialized")


# Funções auxiliares para casos de uso comuns
def audit_login(user_id: str, success: bool, reason: str = None):
    """Auditar tentativa de login"""
    details = {'user_id': user_id, 'reason': reason} if reason else {'user_id': user_id}
    action = 'auth.login' if success else 'auth.failed_login'
    create_audit_log(action, details=details, user_id=user_id, success=success)


def audit_data_access(user_id: str, resource_type: str, resource_id: str, action: str = 'read'):
    """Auditar acesso a dados sensíveis"""
    create_audit_log(f'data.access.{resource_type}', details={
        'resource_id': resource_id,
        'access_type': action,
    }, user_id=user_id)


def audit_admin_action(admin_id: str, action: str, target_id: str, details: dict = None):
    """Auditar ação administrativa"""
    full_details = {
        'target_id': target_id,
        **(details or {})
    }
    create_audit_log(f'admin.{action}', details=full_details, user_id=admin_id)
