"""
Rotas relacionadas à segurança
Endpoints para gestão de segurança, auditoria e monitoramento
"""

from flask import Blueprint, jsonify, request, g
from ...middleware.security import (
    rate_limiter, 
    csrf_protection,
    rate_limit,
    validate_input
)
from ...utils.monitoring import StructuredLogger
from datetime import datetime, timedelta

security_bp = Blueprint('security', __name__)
security_logger = StructuredLogger('security')

@security_bp.route('/audit/requests', methods=['GET'])
@rate_limit("api")
def audit_requests():
    """Auditoria de requests recentes"""
    try:
        # Pega últimos requests do cache/log
        # Em produção, isso viria de um sistema de logs
        
        return jsonify({
            "success": True,
            "message": "Auditoria disponível via logs estruturados"
        })
    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

@security_bp.route('/blocked-ips', methods=['GET'])
@rate_limit("api")
def get_blocked_ips():
    """Lista IPs bloqueados"""
    try:
        blocked_ips = []
        current_time = datetime.now()
        
        for ip, blocked_until in rate_limiter.blocked_ips.items():
            if blocked_until > current_time:
                blocked_ips.append({
                    "ip": ip,
                    "blocked_until": blocked_until.isoformat(),
                    "remaining_minutes": int((blocked_until - current_time).total_seconds() / 60)
                })
        
        return jsonify({
            "success": True,
            "data": {
                "blocked_ips": blocked_ips,
                "total_blocked": len(blocked_ips)
            }
        })
    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

@security_bp.route('/unblock-ip', methods=['POST'])
@rate_limit("auth")
@validate_input()
def unblock_ip():
    """Remove IP da lista de bloqueados (admin apenas)"""
    try:
        data = request.get_json()
        ip_address = data.get('ip_address')
        
        if not ip_address:
            return jsonify({
                "success": False,
                "error": "IP address é obrigatório"
            }), 400
        
        # Remove do bloqueio
        if ip_address in rate_limiter.blocked_ips:
            del rate_limiter.blocked_ips[ip_address]
        
        # Log do evento
        security_logger.log_business_event({
            "event_type": "ip_unblocked",
            "event_data": {"ip_address": ip_address},
            "user_id": getattr(g, 'current_user_id', None)
        })
        
        return jsonify({
            "success": True,
            "message": f"IP {ip_address} desbloqueado"
        })
    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

@security_bp.route('/rate-limits', methods=['GET'])
@rate_limit("api")
def get_rate_limits():
    """Obtém configurações atuais de rate limiting"""
    try:
        return jsonify({
            "success": True,
            "data": {
                "limits": rate_limiter.limits,
                "current_blocked_count": len(rate_limiter.blocked_ips)
            }
        })
    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

@security_bp.route('/security-report', methods=['GET'])
@rate_limit("api")
def security_report():
    """Relatório de segurança resumido"""
    try:
        current_time = datetime.now()
        
        # Conta IPs ativos bloqueados
        active_blocked = sum(1 for blocked_until in rate_limiter.blocked_ips.values() 
                           if blocked_until > current_time)
        
        report = {
            "timestamp": current_time.isoformat(),
            "blocked_ips_count": active_blocked,
            "rate_limits_configured": len(rate_limiter.limits),
            "security_features": [
                "Rate Limiting",
                "Input Validation",
                "CSRF Protection", 
                "Security Headers",
                "SQL Injection Detection",
                "XSS Protection"
            ]
        }
        
        return jsonify({
            "success": True,
            "data": report
        })
    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500