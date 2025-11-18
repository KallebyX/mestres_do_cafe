from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime
import logging

analytics_bp = Blueprint('analytics', __name__)
logger = logging.getLogger(__name__)

@analytics_bp.route('/track', methods=['POST'])
@jwt_required()
def track_event():
    """Track a single analytics event"""
    try:
        data = request.get_json()
        
        # Log the event for now (in production, save to database)
        logger.info(f"Analytics event: {data}")
        
        return jsonify({
            'status': 'success',
            'message': 'Event tracked successfully',
            'timestamp': datetime.utcnow().isoformat()
        }), 200
        
    except Exception as e:
        logger.error(f"Error tracking analytics event: {e}")
        return jsonify({
            'status': 'error',
            'message': 'Failed to track event'
        }), 500

@analytics_bp.route('/track/batch', methods=['POST'])
@jwt_required()
def track_batch_events():
    """Track multiple analytics events"""
    try:
        data = request.get_json()
        events = data.get('events', [])
        
        # Log the events for now (in production, save to database)
        for event in events:
            logger.info(f"Analytics batch event: {event}")
        
        return jsonify({
            'status': 'success',
            'message': f'{len(events)} events tracked successfully',
            'timestamp': datetime.utcnow().isoformat()
        }), 200
        
    except Exception as e:
        logger.error(f"Error tracking batch analytics events: {e}")
        return jsonify({
            'status': 'error',
            'message': 'Failed to track batch events'
        }), 500

@analytics_bp.route('/health', methods=['GET'])
def analytics_health():
    """Analytics service health check"""
    return jsonify({
        'status': 'healthy',
        'service': 'analytics',
        'timestamp': datetime.utcnow().isoformat()
    }), 200
