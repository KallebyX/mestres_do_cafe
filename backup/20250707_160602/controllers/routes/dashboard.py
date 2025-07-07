from flask import Blueprint, request, jsonify
from src.models.database import db, User, Order, UserPoints
from sqlalchemy import func

dashboard_bp = Blueprint('dashboard', __name__)

@dashboard_bp.route('/user/<user_id>', methods=['GET'])
def get_user_dashboard(user_id):
    try:
        user = User.query.get(user_id)
        if not user:
            return jsonify({'error': 'Usuário não encontrado'}), 404
        
        # Estatísticas do usuário
        total_orders = Order.query.filter_by(user_id=user_id).count()
        completed_orders = Order.query.filter_by(user_id=user_id, status='completed').count()
        
        # Últimos pedidos
        recent_orders = Order.query.filter_by(user_id=user_id)\
                                  .order_by(Order.created_at.desc())\
                                  .limit(5).all()
        
        # Histórico de pontos recente
        recent_points = UserPoints.query.filter_by(user_id=user_id)\
                                       .order_by(UserPoints.created_at.desc())\
                                       .limit(5).all()
        
        return jsonify({
            'user': {
                'id': user.id,
                'name': user.name,
                'email': user.email,
                'points': user.points,
                'level': user.level,
                'total_spent': float(user.total_spent),
                'account_type': user.account_type
            },
            'stats': {
                'total_orders': total_orders,
                'completed_orders': completed_orders,
                'total_spent': float(user.total_spent),
                'current_points': user.points
            },
            'recent_orders': [{
                'id': order.id,
                'total_amount': float(order.total_amount),
                'status': order.status,
                'created_at': order.created_at.isoformat(),
                'items_count': len(order.items)
            } for order in recent_orders],
            'recent_points': [{
                'points': point.points,
                'action': point.action,
                'description': point.description,
                'created_at': point.created_at.isoformat()
            } for point in recent_points]
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@dashboard_bp.route('/user/<user_id>/progress', methods=['GET'])
def get_user_progress(user_id):
    try:
        user = User.query.get(user_id)
        if not user:
            return jsonify({'error': 'Usuário não encontrado'}), 404
        
        # Calcular progresso para o próximo nível
        level_thresholds = {
            'Aprendiz do Café': {'min': 0, 'max': 100},
            'Conhecedor': {'min': 100, 'max': 500},
            'Especialista': {'min': 500, 'max': 1500},
            'Mestre do Café': {'min': 1500, 'max': 3000},
            'Lenda': {'min': 3000, 'max': 5000}
        }
        
        current_level_info = level_thresholds.get(user.level, level_thresholds['Aprendiz do Café'])
        
        # Encontrar próximo nível
        next_level = None
        for level, info in level_thresholds.items():
            if info['min'] > user.points:
                next_level = level
                break
        
        progress_percentage = 0
        points_to_next = 0
        
        if next_level:
            next_level_info = level_thresholds[next_level]
            points_in_current_range = user.points - current_level_info['min']
            total_points_needed = next_level_info['min'] - current_level_info['min']
            progress_percentage = (points_in_current_range / total_points_needed) * 100
            points_to_next = next_level_info['min'] - user.points
        
        return jsonify({
            'current_level': user.level,
            'current_points': user.points,
            'next_level': next_level,
            'progress_percentage': min(progress_percentage, 100),
            'points_to_next_level': max(points_to_next, 0)
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@dashboard_bp.route('/user/<user_id>/recommendations', methods=['GET'])
def get_user_recommendations(user_id):
    try:
        user = User.query.get(user_id)
        if not user:
            return jsonify({'error': 'Usuário não encontrado'}), 404
        
        # Recomendações baseadas no nível do usuário
        recommendations = []
        
        if user.points < 100:
            recommendations.append({
                'type': 'action',
                'title': 'Faça sua primeira compra',
                'description': 'Ganhe pontos comprando nossos cafés especiais',
                'action': 'explore_products'
            })
        
        if user.points >= 100 and user.points < 500:
            recommendations.append({
                'type': 'level',
                'title': 'Próximo do nível Conhecedor!',
                'description': f'Faltam apenas {500 - user.points} pontos',
                'action': 'view_progress'
            })
        
        recommendations.append({
            'type': 'blog',
            'title': 'Aprenda sobre café',
            'description': 'Leia nossos artigos educacionais',
            'action': 'read_blog'
        })
        
        return jsonify({
            'recommendations': recommendations
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

