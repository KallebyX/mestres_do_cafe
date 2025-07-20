"""
Rotas para monitoramento e observabilidade
Expõe métricas, health checks e logs
"""

from flask import Blueprint, jsonify, request
from utils.monitoring import (
    metrics_collector, 
    alert_manager,
    get_health_status
)
from utils.cache import cache_manager

monitoring_bp = Blueprint('monitoring', __name__)

@monitoring_bp.route('/health', methods=['GET'])
def health_detailed():
    """Health check detalhado com métricas"""
    return jsonify(get_health_status())

@monitoring_bp.route('/metrics/system', methods=['GET'])
def system_metrics():
    """Métricas do sistema (CPU, memória, disco)"""
    try:
        metrics = metrics_collector.get_system_metrics()
        return jsonify({
            "success": True,
            "data": metrics
        })
    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

@monitoring_bp.route('/metrics/application', methods=['GET'])
def application_metrics():
    """Métricas da aplicação (requests, erros, performance)"""
    try:
        metrics = metrics_collector.get_application_metrics()
        return jsonify({
            "success": True,
            "data": metrics
        })
    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

@monitoring_bp.route('/alerts', methods=['GET'])
def current_alerts():
    """Alertas ativos"""
    try:
        alerts = alert_manager.check_alerts()
        return jsonify({
            "success": True,
            "data": {
                "active_alerts": alerts,
                "alert_history": list(alert_manager.alert_history)[-20:]
            }
        })
    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

@monitoring_bp.route('/cache/stats', methods=['GET'])
def cache_stats():
    """Estatísticas do cache"""
    try:
        stats = cache_manager.get_stats()
        return jsonify({
            "success": True,
            "data": stats
        })
    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

@monitoring_bp.route('/cache/clear', methods=['POST'])
def clear_cache():
    """Limpa o cache (desenvolvimento)"""
    try:
        pattern = request.json.get('pattern', '*') if request.json else '*'
        cleared = cache_manager.clear_pattern(pattern)
        
        return jsonify({
            "success": True,
            "data": {
                "cleared_keys": cleared,
                "pattern": pattern
            }
        })
    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

@monitoring_bp.route('/status', methods=['GET'])
def status_summary():
    """Resumo do status do sistema"""
    try:
        health = get_health_status()
        
        # Resumo simplificado
        summary = {
            "status": health["status"],
            "timestamp": health["timestamp"],
            "uptime": health.get("uptime", 0),
            "active_alerts": len(health.get("alerts", [])),
            "system": {
                "cpu_percent": health.get("system", {}).get("cpu", {}).get("percent", 0),
                "memory_percent": health.get("system", {}).get("memory", {}).get("percent", 0),
                "disk_percent": health.get("system", {}).get("disk", {}).get("percent", 0)
            },
            "application": {
                "requests_last_5min": health.get("application", {}).get("requests", {}).get("total_last_5min", 0),
                "avg_response_time": health.get("application", {}).get("requests", {}).get("avg_response_time", 0),
                "error_rate": health.get("application", {}).get("requests", {}).get("error_rate_percent", 0)
            }
        }
        
        return jsonify({
            "success": True,
            "data": summary
        })
        
    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500