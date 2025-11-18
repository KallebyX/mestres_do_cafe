from flask import Blueprint, jsonify, current_app
import os
from datetime import datetime
from functools import wraps

debug_bp = Blueprint('debug', __name__)


def debug_only(f):
    """
    Decorator que protege endpoints de debug.
    Retorna 404 em produção para ocultar existência dos endpoints.
    Permite apenas em development e staging.
    """
    @wraps(f)
    def decorated_function(*args, **kwargs):
        env = current_app.config.get('ENV', 'production')
        flask_env = os.environ.get('FLASK_ENV', 'production')

        # Permitir apenas em development ou staging
        if env not in ['development', 'staging'] and flask_env not in ['development', 'staging']:
            # Retornar 404 ao invés de 403 para não revelar que o endpoint existe
            return jsonify({
                'error': 'Not found',
                'message': 'The requested endpoint does not exist'
            }), 404

        return f(*args, **kwargs)
    return decorated_function


@debug_bp.route('/env', methods=['GET'])
@debug_only
def debug_env():
    """Debug endpoint para verificar variáveis de ambiente"""
    try:
        # Detectar qual banco está sendo usado
        neon_url = os.environ.get('NEON_DATABASE_URL')
        render_url = os.environ.get('DATABASE_URL')
        
        if neon_url:
            database_type = "Neon PostgreSQL"
            database_prefix = neon_url[:30] + '...' if len(neon_url) > 30 else neon_url
        elif render_url:
            database_type = "Render PostgreSQL"
            database_prefix = render_url[:30] + '...' if len(render_url) > 30 else render_url
        else:
            database_type = "SQLite (desenvolvimento)"
            database_prefix = "Local file"
        
        env_vars = {
            'FLASK_ENV': os.environ.get('FLASK_ENV'),
            'DATABASE_TYPE': database_type,
            'DATABASE_PREFIX': database_prefix,
            'NEON_DATABASE_URL_SET': bool(neon_url),
            'DATABASE_URL_SET': bool(render_url),
            'PORT': os.environ.get('PORT'),
            'SECRET_KEY_SET': bool(os.environ.get('SECRET_KEY')),
            'JWT_SECRET_KEY_SET': bool(os.environ.get('JWT_SECRET_KEY')),
            'MERCADO_PAGO_TOKEN_SET': bool(os.environ.get('MERCADO_PAGO_ACCESS_TOKEN')),
            'MELHOR_ENVIO_KEY_SET': bool(os.environ.get('MELHOR_ENVIO_API_KEY')),
            'REDIS_URL_SET': bool(os.environ.get('REDIS_URL')),
            'RENDER_ENVIRONMENT': os.environ.get('RENDER', 'false') == 'true',
            'PYTHONPATH': os.environ.get('PYTHONPATH', 'Not set'),
        }
        
        return jsonify({
            'status': 'success',
            'timestamp': datetime.utcnow().isoformat(),
            'environment_variables': env_vars,
            'recommendations': get_env_recommendations(env_vars)
        }), 200
        
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': str(e),
            'timestamp': datetime.utcnow().isoformat()
        }), 500

def get_env_recommendations(env_vars):
    """Gera recomendações baseadas nas variáveis de ambiente"""
    recommendations = []
    
    if not env_vars['NEON_DATABASE_URL_SET'] and not env_vars['DATABASE_URL_SET']:
        recommendations.append("⚠️ Configure NEON_DATABASE_URL para melhor performance")
    
    if not env_vars['SECRET_KEY_SET']:
        recommendations.append("❌ SECRET_KEY é obrigatória")
    
    if not env_vars['JWT_SECRET_KEY_SET']:
        recommendations.append("❌ JWT_SECRET_KEY é obrigatória")
    
    if env_vars['NEON_DATABASE_URL_SET']:
        recommendations.append("✅ Neon Database configurado (recomendado)")
    elif env_vars['DATABASE_URL_SET']:
        recommendations.append("⚠️ Usando Render Database (considere migrar para Neon)")
    
    if not env_vars['MERCADO_PAGO_TOKEN_SET']:
        recommendations.append("💡 MERCADO_PAGO_ACCESS_TOKEN não configurado (opcional)")
    
    if not env_vars['MELHOR_ENVIO_KEY_SET']:
        recommendations.append("💡 MELHOR_ENVIO_API_KEY não configurado (opcional)")
    
    return recommendations

@debug_bp.route('/database', methods=['GET'])
@debug_only
def debug_database():
    """Debug endpoint para verificar conexão com banco"""
    try:
        from src.database import db
        from flask import current_app
        
        # Usar o app context atual em vez de criar novo
        with current_app.app_context():
            # Tentar executar uma query simples
            result = db.session.execute(db.text('SELECT version()')).fetchone()
            
            # Verificar tabelas existentes
            tables_result = db.session.execute(db.text("""
                SELECT table_name 
                FROM information_schema.tables 
                WHERE table_schema = 'public'
            """)).fetchall()
            
            tables = [row[0] for row in tables_result]
            
            return jsonify({
                'status': 'success',
                'database_version': result[0] if result else 'Unknown',
                'tables_count': len(tables),
                'tables': tables,
                'timestamp': datetime.utcnow().isoformat()
            }), 200
            
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': str(e),
            'timestamp': datetime.utcnow().isoformat()
        }), 500
