from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required
import os
from datetime import datetime

health_bp = Blueprint('health', __name__)

@health_bp.route('/health', methods=['GET'])
@jwt_required()
def health_check():
    """Health check endpoint para Render"""
    return jsonify({
        'status': 'healthy',
        'service': 'Mestres do Café API',
        'version': '1.0.0',
        'environment': os.environ.get("FLASK_ENV", "development"),
        'database': 'PostgreSQL + SQLAlchemy',
        'timestamp': datetime.utcnow().isoformat()
    }), 200
