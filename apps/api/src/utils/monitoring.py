"""
Sistema de monitoramento e observabilidade
Coleta métricas de performance, logs estruturados e alertas
"""

import time
import psutil
import logging
import json
from datetime import datetime, timedelta
from functools import wraps
from collections import defaultdict, deque
from threading import Lock
from typing import Dict, Any, Optional, List
from flask import request, g, current_app
from .cache import cache_manager

class MetricsCollector:
    """Coletor de métricas de sistema e aplicação"""
    
    def __init__(self):
        self.metrics = defaultdict(lambda: defaultdict(float))
        self.request_times = deque(maxlen=1000)  # Últimas 1000 requests
        self.error_counts = defaultdict(int)
        self.lock = Lock()
        
    def record_request_time(self, endpoint: str, method: str, duration: float, status_code: int):
        """Registra tempo de resposta de request"""
        with self.lock:
            key = f"{method}:{endpoint}"
            self.metrics["request_times"][key] = duration
            self.metrics["request_counts"][key] += 1
            
            # Registra na fila de tempos recentes
            self.request_times.append({
                "timestamp": datetime.now(),
                "endpoint": endpoint,
                "method": method,
                "duration": duration,
                "status_code": status_code
            })
            
            # Conta erros
            if status_code >= 400:
                self.error_counts[f"{method}:{endpoint}"] += 1
    
    def get_system_metrics(self) -> Dict[str, Any]:
        """Obtém métricas do sistema"""
        try:
            cpu_percent = psutil.cpu_percent(interval=1)
            memory = psutil.virtual_memory()
            disk = psutil.disk_usage('/')
            
            return {
                "timestamp": datetime.now().isoformat(),
                "cpu": {
                    "percent": cpu_percent,
                    "count": psutil.cpu_count()
                },
                "memory": {
                    "total": memory.total,
                    "available": memory.available,
                    "percent": memory.percent,
                    "used": memory.used
                },
                "disk": {
                    "total": disk.total,
                    "used": disk.used,
                    "free": disk.free,
                    "percent": (disk.used / disk.total) * 100
                },
                "cache": cache_manager.get_stats()
            }
        except Exception as e:
            current_app.logger.error(f"Error collecting system metrics: {e}")
            return {"error": str(e)}
    
    def get_application_metrics(self) -> Dict[str, Any]:
        """Obtém métricas da aplicação"""
        with self.lock:
            # Calcula estatísticas dos últimos requests
            recent_requests = [r for r in self.request_times 
                             if r["timestamp"] > datetime.now() - timedelta(minutes=5)]
            
            avg_response_time = 0
            if recent_requests:
                avg_response_time = sum(r["duration"] for r in recent_requests) / len(recent_requests)
            
            error_rate = 0
            total_requests = len(recent_requests)
            if total_requests > 0:
                error_requests = sum(1 for r in recent_requests if r["status_code"] >= 400)
                error_rate = (error_requests / total_requests) * 100
            
            return {
                "timestamp": datetime.now().isoformat(),
                "requests": {
                    "total_last_5min": total_requests,
                    "avg_response_time": avg_response_time,
                    "error_rate_percent": error_rate
                },
                "endpoints": dict(self.metrics["request_counts"]),
                "errors": dict(self.error_counts)
            }

# Instância global do coletor
metrics_collector = MetricsCollector()

class StructuredLogger:
    """Logger estruturado para melhor observabilidade"""
    
    def __init__(self, logger_name: str):
        self.logger = logging.getLogger(logger_name)
        
    def log_request(self, request_data: Dict[str, Any]):
        """Log estruturado de request"""
        log_entry = {
            "type": "request",
            "timestamp": datetime.now().isoformat(),
            "request_id": getattr(g, 'request_id', None),
            "method": request_data.get("method"),
            "url": request_data.get("url"),
            "user_agent": request_data.get("user_agent"),
            "remote_addr": request_data.get("remote_addr"),
            "duration": request_data.get("duration"),
            "status_code": request_data.get("status_code")
        }
        
        self.logger.info(json.dumps(log_entry, ensure_ascii=False))
    
    def log_error(self, error_data: Dict[str, Any]):
        """Log estruturado de erro"""
        log_entry = {
            "type": "error",
            "timestamp": datetime.now().isoformat(),
            "request_id": getattr(g, 'request_id', None),
            "error_type": error_data.get("error_type"),
            "error_message": error_data.get("error_message"),
            "traceback": error_data.get("traceback"),
            "endpoint": error_data.get("endpoint"),
            "user_id": error_data.get("user_id")
        }
        
        self.logger.error(json.dumps(log_entry, ensure_ascii=False))
    
    def log_business_event(self, event_data: Dict[str, Any]):
        """Log de eventos de negócio"""
        log_entry = {
            "type": "business_event",
            "timestamp": datetime.now().isoformat(),
            "request_id": getattr(g, 'request_id', None),
            "event_type": event_data.get("event_type"),
            "event_data": event_data.get("event_data"),
            "user_id": event_data.get("user_id"),
            "session_id": event_data.get("session_id")
        }
        
        self.logger.info(json.dumps(log_entry, ensure_ascii=False))

def monitor_performance(track_memory: bool = False):
    """Decorator para monitorar performance de funções"""
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            start_time = time.time()
            
            # Memória inicial se solicitado
            initial_memory = None
            if track_memory:
                try:
                    import tracemalloc
                    tracemalloc.start()
                    initial_memory = tracemalloc.get_traced_memory()[0]
                except ImportError:
                    pass
            
            try:
                result = func(*args, **kwargs)
                
                # Calcula métricas
                duration = time.time() - start_time
                
                memory_delta = None
                if track_memory and initial_memory:
                    try:
                        current_memory = tracemalloc.get_traced_memory()[0]
                        memory_delta = current_memory - initial_memory
                        tracemalloc.stop()
                    except:
                        pass
                
                # Log estruturado de performance
                perf_data = {
                    "function": f"{func.__module__}.{func.__name__}",
                    "duration": duration,
                    "memory_delta": memory_delta,
                    "args_count": len(args),
                    "kwargs_count": len(kwargs)
                }
                
                # Apenas log se demorou mais que 100ms
                if duration > 0.1:
                    logger = StructuredLogger("performance")
                    logger.logger.info(json.dumps({
                        "type": "performance",
                        "timestamp": datetime.now().isoformat(),
                        **perf_data
                    }, ensure_ascii=False))
                
                return result
                
            except Exception as e:
                duration = time.time() - start_time
                
                # Log de erro com contexto
                logger = StructuredLogger("errors")
                logger.log_error({
                    "error_type": type(e).__name__,
                    "error_message": str(e),
                    "function": f"{func.__module__}.{func.__name__}",
                    "duration": duration
                })
                
                raise
        
        return wrapper
    return decorator

class AlertManager:
    """Gerenciador de alertas baseado em métricas"""
    
    def __init__(self):
        self.alert_thresholds = {
            "cpu_percent": 80.0,
            "memory_percent": 85.0,
            "disk_percent": 90.0,
            "error_rate": 5.0,  # 5% de erro
            "avg_response_time": 2.0  # 2 segundos
        }
        self.alert_history = deque(maxlen=100)
        
    def check_alerts(self):
        """Verifica se algum alerta deve ser disparado"""
        alerts = []
        
        try:
            # Métricas do sistema
            system_metrics = metrics_collector.get_system_metrics()
            app_metrics = metrics_collector.get_application_metrics()
            
            # Verifica CPU
            cpu_percent = system_metrics.get("cpu", {}).get("percent", 0)
            if cpu_percent > self.alert_thresholds["cpu_percent"]:
                alerts.append({
                    "type": "cpu_high",
                    "value": cpu_percent,
                    "threshold": self.alert_thresholds["cpu_percent"],
                    "severity": "warning"
                })
            
            # Verifica memória
            memory_percent = system_metrics.get("memory", {}).get("percent", 0)
            if memory_percent > self.alert_thresholds["memory_percent"]:
                alerts.append({
                    "type": "memory_high",
                    "value": memory_percent,
                    "threshold": self.alert_thresholds["memory_percent"],
                    "severity": "critical" if memory_percent > 95 else "warning"
                })
            
            # Verifica disco
            disk_percent = system_metrics.get("disk", {}).get("percent", 0)
            if disk_percent > self.alert_thresholds["disk_percent"]:
                alerts.append({
                    "type": "disk_high",
                    "value": disk_percent,
                    "threshold": self.alert_thresholds["disk_percent"],
                    "severity": "critical"
                })
            
            # Verifica taxa de erro da aplicação
            error_rate = app_metrics.get("requests", {}).get("error_rate_percent", 0)
            if error_rate > self.alert_thresholds["error_rate"]:
                alerts.append({
                    "type": "error_rate_high",
                    "value": error_rate,
                    "threshold": self.alert_thresholds["error_rate"],
                    "severity": "warning"
                })
            
            # Verifica tempo de resposta
            avg_response = app_metrics.get("requests", {}).get("avg_response_time", 0)
            if avg_response > self.alert_thresholds["avg_response_time"]:
                alerts.append({
                    "type": "response_time_high",
                    "value": avg_response,
                    "threshold": self.alert_thresholds["avg_response_time"],
                    "severity": "warning"
                })
            
            # Registra alertas
            for alert in alerts:
                alert["timestamp"] = datetime.now().isoformat()
                self.alert_history.append(alert)
                
                # Log do alerta
                logger = StructuredLogger("alerts")
                logger.logger.warning(json.dumps({
                    "type": "alert",
                    **alert
                }, ensure_ascii=False))
                
        except Exception as e:
            current_app.logger.error(f"Error checking alerts: {e}")
        
        return alerts

# Instância global do gerenciador de alertas
alert_manager = AlertManager()

def init_monitoring(app):
    """Inicializa sistema de monitoramento"""
    
    @app.before_request
    def before_request():
        """Executa antes de cada request"""
        g.start_time = time.time()
        g.request_id = f"{int(time.time())}-{id(request)}"
    
    @app.after_request
    def after_request(response):
        """Executa depois de cada request"""
        if hasattr(g, 'start_time'):
            duration = time.time() - g.start_time
            
            # Registra métricas
            endpoint = request.endpoint or 'unknown'
            metrics_collector.record_request_time(
                endpoint, 
                request.method, 
                duration, 
                response.status_code
            )
            
            # Log estruturado
            logger = StructuredLogger("requests")
            logger.log_request({
                "method": request.method,
                "url": request.url,
                "user_agent": request.headers.get("User-Agent"),
                "remote_addr": request.remote_addr,
                "duration": duration,
                "status_code": response.status_code
            })
        
        return response
    
    # Agendamento de verificação de alertas (executar a cada 30 segundos)
    import threading
    def check_alerts_periodically():
        while True:
            try:
                alert_manager.check_alerts()
                time.sleep(30)
            except Exception as e:
                app.logger.error(f"Error in periodic alert check: {e}")
                time.sleep(60)  # Espera mais em caso de erro
    
    # Iniciar thread de monitoramento
    monitor_thread = threading.Thread(target=check_alerts_periodically, daemon=True)
    monitor_thread.start()
    
    app.logger.info("✅ Sistema de monitoramento iniciado")

def get_health_status() -> Dict[str, Any]:
    """Retorna status de saúde completo do sistema"""
    try:
        system_metrics = metrics_collector.get_system_metrics()
        app_metrics = metrics_collector.get_application_metrics()
        alerts = alert_manager.check_alerts()
        
        # Determina status geral
        health_status = "healthy"
        if any(alert["severity"] == "critical" for alert in alerts):
            health_status = "critical"
        elif any(alert["severity"] == "warning" for alert in alerts):
            health_status = "degraded"
        
        return {
            "status": health_status,
            "timestamp": datetime.now().isoformat(),
            "system": system_metrics,
            "application": app_metrics,
            "alerts": alerts[-10:],  # Últimos 10 alertas
            "uptime": time.time() - getattr(get_health_status, '_start_time', time.time())
        }
        
    except Exception as e:
        return {
            "status": "error",
            "error": str(e),
            "timestamp": datetime.now().isoformat()
        }

# Marca o tempo de início
get_health_status._start_time = time.time()