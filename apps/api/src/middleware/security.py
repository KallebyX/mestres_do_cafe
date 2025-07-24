"""
Middleware de segurança avançada
Rate limiting, CSRF protection, input validation e security headers
"""

import time
import hashlib
import secrets
from collections import defaultdict, deque
from datetime import datetime, timedelta
from functools import wraps
from typing import Dict, Any, Optional
from flask import request, jsonify, g, current_app
from utils.cache import cache_manager

class RateLimiter:
    """Rate limiter baseado em IP e usuário"""

    def __init__(self):
        self.ip_requests = defaultdict(lambda: deque(maxlen = 1000))
        self.user_requests = defaultdict(lambda: deque(maxlen = 1000))
        self.blocked_ips = {}

        # Configurações de rate limiting
        self.limits = {
            "default": {"requests": 100, "window": 3600},  # 100 req/hora
            "auth": {"requests": 5, "window": 300},        # 5 req/5min para auth
            "payment": {"requests": 10, "window": 600},    # 10 req/10min para pagamento
            "api": {"requests": 1000, "window": 3600}      # 1000 req/hora para API geral
        }

    def is_blocked(self, ip_address: str) -> bool:
        """Verifica se IP está bloqueado"""
        if ip_address in self.blocked_ips:
            blocked_until = self.blocked_ips[ip_address]
            if datetime.now() < blocked_until:
                return True
            else:
                del self.blocked_ips[ip_address]
        return False

    def block_ip(self, ip_address: str, duration_minutes: int = 15):
        """Bloqueia IP por um período"""
        self.blocked_ips[ip_address] = datetime.now() + timedelta(minutes = duration_minutes)

        # Cache no Redis também
        cache_key = f"blocked_ip:{ip_address}"
        cache_manager.set(cache_key, True, timeout = duration_minutes * 60)

    def check_rate_limit(self, identifier: str, limit_type: str = "default") -> tuple[bool, Dict[str, Any]]:
        """Verifica rate limit para um identificador"""
        now = time.time()
        limit_config = self.limits.get(limit_type, self.limits["default"])
        window = limit_config["window"]
        max_requests = limit_config["requests"]

        # Busca do cache primeiro
        cache_key = f"rate_limit:{limit_type}:{identifier}"
        cached_requests = cache_manager.get(cache_key)

        if cached_requests is None:
            cached_requests = []

        # Remove requests antigas
        recent_requests = [req_time for req_time in cached_requests if now - req_time < window]

        # Adiciona request atual
        recent_requests.append(now)

        # Atualiza cache
        cache_manager.set(cache_key, recent_requests, timeout = window)

        # Verifica limite
        is_allowed = len(recent_requests) <= max_requests

        return is_allowed, {
            "requests_count": len(recent_requests),
            "max_requests": max_requests,
            "window_seconds": window,
            "reset_time": now + window - (now % window)
        }

    def get_identifier(self, request) -> str:
        """Obtém identificador único para rate limiting"""
        # Prioriza usuário autenticado
        user_id = getattr(g, 'current_user_id', None)
        if user_id:
            return f"user:{user_id}"

        # Fallback para IP
        ip = request.environ.get('HTTP_X_FORWARDED_FOR', request.remote_addr)
        if ip and ', ' in ip:
            ip = ip.split(', ')[0].strip()

        return f"ip:{ip}"

class CSRFProtection:
    """Proteção CSRF para formulários e APIs"""

    def __init__(self):
        self.token_expiry = 3600  # 1 hora

    def generate_token(self, session_id: str) -> str:
        """Gera token CSRF único"""
        timestamp = str(int(time.time()))
        random_bytes = secrets.token_bytes(32)

        # Combina session_id, timestamp e bytes aleatórios
        token_data = f"{session_id}:{timestamp}:{random_bytes.hex()}"
        token = hashlib.sha256(token_data.encode()).hexdigest()

        # Armazena no cache
        cache_key = f"csrf_token:{token}"
        cache_manager.set(cache_key, session_id, timeout = self.token_expiry)

        return token

    def validate_token(self, token: str, session_id: str) -> bool:
        """Valida token CSRF"""
        if not token:
            return False

        cache_key = f"csrf_token:{token}"
        stored_session = cache_manager.get(cache_key)

        return stored_session == session_id

class InputValidator:
    """Validador de entrada para prevenir ataques"""

    @staticmethod
    def is_sql_injection_attempt(value: str) -> bool:
        """Detecta tentativas de SQL injection"""
        if not isinstance(value, str):
            return False

        # Padrões suspeitos
        suspicious_patterns = [
            "union", "select", "insert", "update", "delete", "drop",
            "exec", "execute", "--", "/*", "*/", "xp_", "sp_",
            "char(", "ascii(", "substring(", "@@version"
        ]

        value_lower = value.lower()
        return any(pattern in value_lower for pattern in suspicious_patterns)

    @staticmethod
    def is_xss_attempt(value: str) -> bool:
        """Detecta tentativas de XSS"""
        if not isinstance(value, str):
            return False

        # Padrões XSS comuns
        xss_patterns = [
            "<script", "</script>", "javascript:", "vbscript:",
            "onload=", "onerror=", "onclick=", "onmouseover=",
            "eval(", "alert(", "document.cookie", "document.write"
        ]

        value_lower = value.lower()
        return any(pattern in value_lower for pattern in xss_patterns)

    @staticmethod
    def sanitize_input(value: str) -> str:
        """Sanitiza entrada removendo caracteres perigosos"""
        if not isinstance(value, str):
            return str(value)

        # Remove caracteres de controle
        sanitized = ''.join(char for char in value if ord(char) >= 32 or char in '\t\n\r')

        # Limita tamanho
        return sanitized[:10000]  # Máximo 10KB por campo

    @classmethod
    def validate_request_data(cls, data: Dict[str, Any]) -> tuple[bool, Optional[str]]:
        """Valida dados da requisição"""
        for key, value in data.items():
            if isinstance(value, str):
                if cls.is_sql_injection_attempt(value):
                    return False, f"Possível SQL injection detectado no campo '{key}'"

                if cls.is_xss_attempt(value):
                    return False, f"Possível XSS detectado no campo '{key}'"

                # Sanitiza automaticamente
                data[key] = cls.sanitize_input(value)

            elif isinstance(value, dict):
                is_valid, error = cls.validate_request_data(value)
                if not is_valid:
                    return False, error

        return True, None

class SecurityHeaders:
    """Adiciona headers de segurança às respostas"""

    @staticmethod
    def add_security_headers(response):
        """Adiciona headers de segurança padrão"""
        # Prevent XSS
        response.headers['X-Content-Type-Options'] = 'nosniff'
        response.headers['X-Frame-Options'] = 'DENY'
        response.headers['X-XSS-Protection'] = '1; mode = block'

        # HSTS (apenas em produção com HTTPS)
        if current_app.config.get('ENV') == 'production':
            response.headers['Strict-Transport-Security'] = 'max-age = 31536000; includeSubDomains'

        # CSP básico para API
        response.headers['Content-Security-Policy'] = "default-src 'none'; frame-ancestors 'none'"

        # Referrer policy
        response.headers['Referrer-Policy'] = 'strict-origin-when-cross-origin'

        # Feature policy
        response.headers['Permissions-Policy'] = 'geolocation=(), microphone=(), camera=()'

        return response

# Instâncias globais
rate_limiter = RateLimiter()
csrf_protection = CSRFProtection()
input_validator = InputValidator()

def rate_limit(limit_type: str = "default"):
    """Decorator para rate limiting"""
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            ip_address = request.environ.get('HTTP_X_FORWARDED_FOR', request.remote_addr)
            if ip_address and ', ' in ip_address:
                ip_address = ip_address.split(', ')[0].strip()

            # Verifica se IP está bloqueado
            if rate_limiter.is_blocked(ip_address):
                return jsonify({
                    "error": "IP temporariamente bloqueado",
                    "code": "IP_BLOCKED"
                }), 429

            # Verifica rate limit
            identifier = rate_limiter.get_identifier(request)
            is_allowed, limit_info = rate_limiter.check_rate_limit(identifier, limit_type)

            if not is_allowed:
                # Considera bloquear IP se muitas tentativas
                if limit_info["requests_count"] > limit_info["max_requests"] * 2:
                    rate_limiter.block_ip(ip_address, 15)  # 15 minutos

                return jsonify({
                    "error": "Rate limit excedido",
                    "limit_info": limit_info,
                    "code": "RATE_LIMITED"
                }), 429

            # Adiciona informações de rate limit no cabeçalho
            response = func(*args, **kwargs)
            if hasattr(response, 'headers'):
                response.headers['X-RateLimit-Limit'] = str(limit_info["max_requests"])
                response.headers['X-RateLimit-Remaining'] = str(max(0, limit_info["max_requests"] - limit_info["requests_count"]))
                response.headers['X-RateLimit-Reset'] = str(int(limit_info["reset_time"]))

            return response
        return wrapper
    return decorator

def validate_input():
    """Decorator para validação de entrada"""
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            # Valida JSON se presente
            if request.is_json and request.json:
                is_valid, error = input_validator.validate_request_data(request.json)
                if not is_valid:
                    return jsonify({
                        "error": "Dados de entrada inválidos",
                        "details": error,
                        "code": "INVALID_INPUT"
                    }), 400

            # Valida form data
            if request.form:
                form_data = request.form.to_dict()
                is_valid, error = input_validator.validate_request_data(form_data)
                if not is_valid:
                    return jsonify({
                        "error": "Dados de entrada inválidos",
                        "details": error,
                        "code": "INVALID_INPUT"
                    }), 400

            return func(*args, **kwargs)
        return wrapper
    return decorator

def require_csrf():
    """Decorator para proteção CSRF"""
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            # Pula verificação para métodos seguros
            if request.method in ['GET', 'HEAD', 'OPTIONS']:
                return func(*args, **kwargs)

            # Obtém token do header ou form
            csrf_token = request.headers.get('X-CSRF-Token') or request.form.get('csrf_token')
            session_id = request.headers.get('X-Session-ID') or getattr(g, 'session_id', None)

            if not csrf_token or not session_id:
                return jsonify({
                    "error": "Token CSRF obrigatório",
                    "code": "CSRF_TOKEN_MISSING"
                }), 403

            if not csrf_protection.validate_token(csrf_token, session_id):
                return jsonify({
                    "error": "Token CSRF inválido",
                    "code": "CSRF_TOKEN_INVALID"
                }), 403

            return func(*args, **kwargs)
        return wrapper
    return decorator

def init_security_middleware(app):
    """Inicializa middleware de segurança"""

    @app.before_request
    def security_before_request():
        """Executa verificações de segurança antes de cada request"""
        # Adiciona ID de sessão se não existir
        if not hasattr(g, 'session_id'):
            g.session_id = secrets.token_urlsafe(32)

    @app.after_request
    def security_after_request(response):
        """Adiciona headers de segurança após cada request"""
        return SecurityHeaders.add_security_headers(response)

    # Endpoint para obter token CSRF
    @app.route('/api/csrf-token', methods=['GET'])
    def get_csrf_token():
        session_id = getattr(g, 'session_id', secrets.token_urlsafe(32))
        token = csrf_protection.generate_token(session_id)

        return jsonify({
            "csrf_token": token,
            "session_id": session_id
        })

    app.logger.info("✅ Middleware de segurança inicializado")
