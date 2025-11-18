"""
Rate Limiting Middleware - Mestres do Café
Proteção contra abuso de APIs com múltiplas estratégias
"""

import time
from functools import wraps
from flask import request, jsonify, g
from datetime import datetime, timedelta
import logging

logger = logging.getLogger(__name__)

# Rate limits em memória (usar Redis em produção)
_rate_limit_storage = {}

# Configurações de rate limit por endpoint
RATE_LIMIT_CONFIG = {
    # Autenticação (mais restritivo)
    'auth_login': {
        'requests': 5,
        'window': 60,  # 5 requests por minuto
        'block_duration': 300,  # Bloquear por 5 minutos
    },
    'auth_register': {
        'requests': 3,
        'window': 3600,  # 3 registros por hora
        'block_duration': 3600,
    },
    'auth_forgot_password': {
        'requests': 3,
        'window': 3600,  # 3 tentativas por hora
        'block_duration': 3600,
    },

    # APIs públicas (moderado)
    'api_public': {
        'requests': 100,
        'window': 60,  # 100 requests por minuto
        'block_duration': 60,
    },
    'api_search': {
        'requests': 30,
        'window': 60,  # 30 buscas por minuto
        'block_duration': 120,
    },
    'api_shipping_calc': {
        'requests': 20,
        'window': 60,  # 20 cálculos por minuto
        'block_duration': 120,
    },

    # APIs autenticadas (mais permissivo)
    'api_authenticated': {
        'requests': 300,
        'window': 60,  # 300 requests por minuto
        'block_duration': 30,
    },

    # Admin (muito permissivo)
    'api_admin': {
        'requests': 1000,
        'window': 60,  # 1000 requests por minuto
        'block_duration': 10,
    },

    # Webhooks externos
    'webhook': {
        'requests': 100,
        'window': 60,
        'block_duration': 60,
    },
}


def get_client_identifier():
    """Obtém identificador único do cliente (IP + User-Agent)"""

    # Tentar obter IP real (considerar proxies)
    if request.headers.get('X-Forwarded-For'):
        client_ip = request.headers.get('X-Forwarded-For').split(',')[0].strip()
    elif request.headers.get('X-Real-IP'):
        client_ip = request.headers.get('X-Real-IP')
    else:
        client_ip = request.remote_addr or 'unknown'

    # Adicionar user agent para identificação mais precisa
    user_agent = request.headers.get('User-Agent', 'unknown')[:100]

    # Criar hash do identificador
    import hashlib
    identifier = f"{client_ip}:{user_agent}"
    return hashlib.md5(identifier.encode()).hexdigest()


def is_rate_limited(identifier: str, limit_type: str) -> tuple:
    """
    Verifica se o identificador excedeu o rate limit
    Retorna: (is_limited, retry_after_seconds)
    """

    config = RATE_LIMIT_CONFIG.get(limit_type, RATE_LIMIT_CONFIG['api_public'])
    current_time = time.time()

    # Chave para o storage
    storage_key = f"{limit_type}:{identifier}"

    # Verificar se está bloqueado
    block_key = f"block:{storage_key}"
    if block_key in _rate_limit_storage:
        block_until = _rate_limit_storage[block_key]
        if current_time < block_until:
            retry_after = int(block_until - current_time)
            return True, retry_after
        else:
            # Remover bloqueio expirado
            del _rate_limit_storage[block_key]

    # Obter ou inicializar histórico de requests
    if storage_key not in _rate_limit_storage:
        _rate_limit_storage[storage_key] = []

    request_history = _rate_limit_storage[storage_key]

    # Remover requests antigos (fora da janela)
    window_start = current_time - config['window']
    request_history = [req_time for req_time in request_history if req_time > window_start]
    _rate_limit_storage[storage_key] = request_history

    # Verificar se excedeu o limite
    if len(request_history) >= config['requests']:
        # Bloquear por block_duration
        block_until = current_time + config['block_duration']
        _rate_limit_storage[block_key] = block_until

        logger.warning(
            f"Rate limit exceeded for {identifier} on {limit_type}. "
            f"Blocked for {config['block_duration']}s"
        )

        return True, config['block_duration']

    # Adicionar request atual ao histórico
    request_history.append(current_time)
    _rate_limit_storage[storage_key] = request_history

    return False, 0


def rate_limit(limit_type: str = 'api_public'):
    """
    Decorator para aplicar rate limiting em endpoints

    Uso:
        @app.route('/api/endpoint')
        @rate_limit('api_public')
        def my_endpoint():
            ...
    """
    def decorator(f):
        @wraps(f)
        def wrapped(*args, **kwargs):
            # Obter identificador do cliente
            client_id = get_client_identifier()

            # Verificar rate limit
            is_limited, retry_after = is_rate_limited(client_id, limit_type)

            if is_limited:
                logger.warning(
                    f"Rate limit hit: {request.method} {request.path} "
                    f"by {client_id[:8]}... (retry after {retry_after}s)"
                )

                response = jsonify({
                    'success': False,
                    'error': 'Limite de requisições excedido',
                    'message': f'Você excedeu o limite de requisições. Tente novamente em {retry_after} segundos.',
                    'retry_after': retry_after,
                    'limit_type': limit_type,
                    'status_code': 429
                })
                response.status_code = 429
                response.headers['Retry-After'] = str(retry_after)
                response.headers['X-RateLimit-Limit'] = str(RATE_LIMIT_CONFIG[limit_type]['requests'])
                response.headers['X-RateLimit-Window'] = str(RATE_LIMIT_CONFIG[limit_type]['window'])

                return response

            # Adicionar headers informativos
            config = RATE_LIMIT_CONFIG.get(limit_type, RATE_LIMIT_CONFIG['api_public'])
            storage_key = f"{limit_type}:{client_id}"
            remaining = config['requests'] - len(_rate_limit_storage.get(storage_key, []))

            # Executar função original
            response = f(*args, **kwargs)

            # Se response é um tuple (data, status_code), converter para Response
            if isinstance(response, tuple):
                from flask import make_response
                response = make_response(response[0], response[1] if len(response) > 1 else 200)

            # Adicionar headers de rate limit
            if hasattr(response, 'headers'):
                response.headers['X-RateLimit-Limit'] = str(config['requests'])
                response.headers['X-RateLimit-Remaining'] = str(max(0, remaining))
                response.headers['X-RateLimit-Window'] = str(config['window'])

            return response

        return wrapped
    return decorator


def cleanup_expired_entries():
    """Remove entradas expiradas do storage (executar periodicamente)"""
    current_time = time.time()
    keys_to_remove = []

    for key, value in _rate_limit_storage.items():
        if key.startswith('block:'):
            # Remover bloqueios expirados
            if current_time >= value:
                keys_to_remove.append(key)
        elif isinstance(value, list):
            # Remover históricos antigos
            # Manter apenas últimos 24h
            value = [t for t in value if current_time - t < 86400]
            if not value:
                keys_to_remove.append(key)
            else:
                _rate_limit_storage[key] = value

    for key in keys_to_remove:
        del _rate_limit_storage[key]

    if keys_to_remove:
        logger.info(f"Cleaned up {len(keys_to_remove)} expired rate limit entries")


# Adicionar ao Flask app
def init_rate_limiting(app):
    """Inicializar rate limiting no Flask app"""

    # Executar cleanup periodicamente (a cada 1 hora)
    from flask_apscheduler import APScheduler

    try:
        scheduler = APScheduler()
        scheduler.init_app(app)
        scheduler.start()

        @scheduler.task('cron', id='cleanup_rate_limits', hour='*')
        def scheduled_cleanup():
            with app.app_context():
                cleanup_expired_entries()

        logger.info("Rate limiting initialized with periodic cleanup")
    except ImportError:
        logger.warning("APScheduler not available. Run cleanup_expired_entries() manually.")

    # Adicionar headers de rate limit em todas as respostas
    @app.after_request
    def add_rate_limit_headers(response):
        # Já adicionados pelo decorator rate_limit()
        return response

    # Log de rate limiting
    @app.before_request
    def log_request_info():
        g.request_start_time = time.time()
        client_id = get_client_identifier()
        logger.debug(f"Request: {request.method} {request.path} from {client_id[:8]}...")

    logger.info("Rate limiting middleware initialized")


# Função auxiliar para verificar rate limit manualmente
def check_rate_limit(limit_type: str = 'api_public') -> bool:
    """
    Verifica rate limit manualmente sem decorator
    Retorna True se dentro do limite, False se excedido
    """
    client_id = get_client_identifier()
    is_limited, _ = is_rate_limited(client_id, limit_type)
    return not is_limited
