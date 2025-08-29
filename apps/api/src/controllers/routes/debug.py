from flask import Blueprint, jsonify
import os
from datetime import datetime

debug_bp = Blueprint('debug', __name__)

@debug_bp.route('/env', methods=['GET'])
def debug_env():
    """Debug endpoint para verificar variáveis de ambiente"""
    try:
        env_vars = {
            'FLASK_ENV': os.environ.get('FLASK_ENV'),
            'DATABASE_URL_SET': bool(os.environ.get('DATABASE_URL')),
            'DATABASE_URL_PREFIX': os.environ.get('DATABASE_URL', '')[:20] + '...' if os.environ.get('DATABASE_URL') else 'Not set',
            'PORT': os.environ.get('PORT'),
            'SECRET_KEY_SET': bool(os.environ.get('SECRET_KEY')),
            'JWT_SECRET_KEY_SET': bool(os.environ.get('JWT_SECRET_KEY')),
            'RENDER_ENVIRONMENT': os.environ.get('RENDER', 'false') == 'true',
            'PYTHONPATH': os.environ.get('PYTHONPATH', 'Not set'),
        }
        
        return jsonify({
            'status': 'success',
            'timestamp': datetime.utcnow().isoformat(),
            'environment_variables': env_vars
        }), 200
        
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': str(e),
            'timestamp': datetime.utcnow().isoformat()
        }), 500

@debug_bp.route('/database', methods=['GET'])
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
