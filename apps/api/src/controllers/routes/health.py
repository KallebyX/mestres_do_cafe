from flask import Blueprint, jsonify, current_app
from datetime import datetime
import psutil
import os
from ...models.base import db
from ...utils.cache import cache_manager
from sqlalchemy import text
import redis

health_bp = Blueprint('health', __name__)

@health_bp.route('/health', methods=['GET'])
def health_check():
    """Verificação básica de saúde do sistema"""
    try:
        # Verificar banco de dados
        db_status = check_database_health()
        
        # Verificar cache/Redis
        cache_status = check_cache_health()
        
        # Status geral
        overall_status = 'healthy' if db_status['status'] == 'healthy' and cache_status['status'] == 'healthy' else 'unhealthy'
        
        return jsonify({
            'status': overall_status,
            'timestamp': datetime.utcnow().isoformat(),
            'service': 'Mestres do Café API',
            'version': '1.0.0',
            'environment': current_app.config.get('ENV', 'development'),
            'checks': {
                'database': db_status,
                'cache': cache_status
            }
        })
    
    except Exception as e:
        current_app.logger.error(f'Health check failed: {str(e)}')
        return jsonify({
            'status': 'unhealthy',
            'timestamp': datetime.utcnow().isoformat(),
            'error': str(e)
        }), 500

@health_bp.route('/health/detailed', methods=['GET'])
def detailed_health_check():
    """Verificação detalhada de saúde do sistema"""
    try:
        # Verificações básicas
        db_status = check_database_health()
        cache_status = check_cache_health()
        
        # Verificações do sistema
        system_status = check_system_health()
        
        # Verificações de conectividade
        connectivity_status = check_connectivity()
        
        # Status geral
        all_checks = [db_status, cache_status, system_status, connectivity_status]
        overall_status = 'healthy' if all(check['status'] == 'healthy' for check in all_checks) else 'unhealthy'
        
        return jsonify({
            'status': overall_status,
            'timestamp': datetime.utcnow().isoformat(),
            'service': 'Mestres do Café API',
            'version': '1.0.0',
            'environment': current_app.config.get('ENV', 'development'),
            'uptime': get_uptime(),
            'checks': {
                'database': db_status,
                'cache': cache_status,
                'system': system_status,
                'connectivity': connectivity_status
            }
        })
    
    except Exception as e:
        current_app.logger.error(f'Detailed health check failed: {str(e)}')
        return jsonify({
            'status': 'unhealthy',
            'timestamp': datetime.utcnow().isoformat(),
            'error': str(e)
        }), 500

@health_bp.route('/health/database', methods=['GET'])
def database_health():
    """Verificação específica do banco de dados"""
    return jsonify(check_database_health())

@health_bp.route('/health/cache', methods=['GET'])
def cache_health():
    """Verificação específica do cache"""
    return jsonify(check_cache_health())

@health_bp.route('/health/system', methods=['GET'])
def system_health():
    """Verificação específica do sistema"""
    return jsonify(check_system_health())

def check_database_health():
    """Verifica saúde do banco de dados"""
    try:
        # Teste de conexão simples
        start_time = datetime.now()
        db.session.execute(text('SELECT 1'))
        db.session.commit()
        end_time = datetime.now()
        
        response_time = (end_time - start_time).total_seconds() * 1000  # em ms
        
        # Verificar informações adicionais
        db_info = get_database_info()
        
        return {
            'status': 'healthy',
            'response_time_ms': round(response_time, 2),
            'info': db_info,
            'timestamp': datetime.utcnow().isoformat()
        }
    
    except Exception as e:
        current_app.logger.error(f'Database health check failed: {str(e)}')
        return {
            'status': 'unhealthy',
            'error': str(e),
            'timestamp': datetime.utcnow().isoformat()
        }

def check_cache_health():
    """Verifica saúde do cache/Redis"""
    try:
        if cache_manager.redis_client:
            # Teste de conexão Redis
            start_time = datetime.now()
            cache_manager.redis_client.ping()
            end_time = datetime.now()
            
            response_time = (end_time - start_time).total_seconds() * 1000  # em ms
            
            # Obter estatísticas do cache
            stats = cache_manager.get_stats()
            
            return {
                'status': 'healthy',
                'type': 'redis',
                'response_time_ms': round(response_time, 2),
                'stats': stats,
                'timestamp': datetime.utcnow().isoformat()
            }
        else:
            # Cache em memória
            return {
                'status': 'healthy',
                'type': 'memory_fallback',
                'stats': cache_manager.get_stats(),
                'timestamp': datetime.utcnow().isoformat()
            }
    
    except Exception as e:
        current_app.logger.error(f'Cache health check failed: {str(e)}')
        return {
            'status': 'unhealthy',
            'error': str(e),
            'timestamp': datetime.utcnow().isoformat()
        }

def check_system_health():
    """Verifica saúde do sistema"""
    try:
        # Uso de CPU
        cpu_percent = psutil.cpu_percent(interval=1)
        
        # Uso de memória
        memory = psutil.virtual_memory()
        
        # Uso de disco
        disk = psutil.disk_usage('/')
        
        # Informações do processo
        process = psutil.Process(os.getpid())
        process_memory = process.memory_info().rss / 1024 / 1024  # MB
        
        # Determinar status baseado em thresholds
        status = 'healthy'
        warnings = []
        
        if cpu_percent > 80:
            warnings.append('High CPU usage')
            status = 'warning'
        
        if memory.percent > 85:
            warnings.append('High memory usage')
            status = 'warning'
        
        if disk.percent > 90:
            warnings.append('High disk usage')
            status = 'warning'
        
        return {
            'status': status,
            'warnings': warnings,
            'metrics': {
                'cpu_percent': cpu_percent,
                'memory_percent': memory.percent,
                'memory_available_mb': memory.available / 1024 / 1024,
                'disk_percent': disk.percent,
                'disk_free_gb': disk.free / 1024 / 1024 / 1024,
                'process_memory_mb': process_memory,
                'load_average': os.getloadavg() if hasattr(os, 'getloadavg') else None
            },
            'timestamp': datetime.utcnow().isoformat()
        }
    
    except Exception as e:
        current_app.logger.error(f'System health check failed: {str(e)}')
        return {
            'status': 'unhealthy',
            'error': str(e),
            'timestamp': datetime.utcnow().isoformat()
        }

def check_connectivity():
    """Verifica conectividade com serviços externos"""
    try:
        # Aqui você pode adicionar verificações de conectividade com:
        # - APIs externas
        # - Serviços de pagamento
        # - Serviços de email
        # - CDNs
        
        return {
            'status': 'healthy',
            'external_services': {
                'payment_gateway': 'not_configured',
                'email_service': 'not_configured',
                'cdn': 'not_configured'
            },
            'timestamp': datetime.utcnow().isoformat()
        }
    
    except Exception as e:
        current_app.logger.error(f'Connectivity check failed: {str(e)}')
        return {
            'status': 'unhealthy',
            'error': str(e),
            'timestamp': datetime.utcnow().isoformat()
        }

def get_database_info():
    """Obtém informações do banco de dados"""
    try:
        # Obter informações básicas do banco
        result = db.session.execute(text('SELECT version()')).fetchone()
        db_version = result[0] if result else 'Unknown'
        
        # Contar algumas tabelas principais
        tables_info = {}
        try:
            tables = ['users', 'products', 'orders', 'categories']
            for table in tables:
                try:
                    count_result = db.session.execute(text(f'SELECT COUNT(*) FROM {table}')).fetchone()
                    tables_info[table] = count_result[0] if count_result else 0
                except:
                    tables_info[table] = 'table_not_exists'
        except:
            tables_info = {'error': 'could_not_count_tables'}
        
        return {
            'version': db_version,
            'tables': tables_info
        }
    
    except Exception as e:
        return {
            'error': str(e)
        }

def get_uptime():
    """Calcula o uptime da aplicação"""
    try:
        # Isso é uma aproximação baseada no tempo de inicialização do processo
        process = psutil.Process(os.getpid())
        create_time = datetime.fromtimestamp(process.create_time())
        uptime = datetime.now() - create_time
        
        return {
            'seconds': uptime.total_seconds(),
            'human_readable': str(uptime).split('.')[0],  # Remove microseconds
            'started_at': create_time.isoformat()
        }
    
    except Exception as e:
        return {
            'error': str(e)
        }

# Endpoint para readiness probe (Kubernetes)
@health_bp.route('/ready', methods=['GET'])
def readiness_probe():
    """Probe de readiness para Kubernetes"""
    try:
        # Verificar se a aplicação está pronta para receber tráfego
        db.session.execute(text('SELECT 1'))
        db.session.commit()
        
        return jsonify({
            'status': 'ready',
            'timestamp': datetime.utcnow().isoformat()
        })
    
    except Exception as e:
        current_app.logger.error(f'Readiness probe failed: {str(e)}')
        return jsonify({
            'status': 'not_ready',
            'error': str(e),
            'timestamp': datetime.utcnow().isoformat()
        }), 503

# Endpoint para liveness probe (Kubernetes)
@health_bp.route('/live', methods=['GET'])
def liveness_probe():
    """Probe de liveness para Kubernetes"""
    return jsonify({
        'status': 'alive',
        'timestamp': datetime.utcnow().isoformat()
    })