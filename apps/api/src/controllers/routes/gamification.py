from flask import Blueprint, request, jsonify
from src.models.database import db, GamificationLevel, User, UserPoints

gamification_bp = Blueprint('gamification', __name__)

@gamification_bp.route('/levels', methods=['GET'])
def get_levels():
    try:
        levels = GamificationLevel.query.order_by(GamificationLevel.min_points).all()
        
        return jsonify({
            'levels': [{
                'id': level.id,
                'name': level.name,
                'min_points': level.min_points,
                'max_points': level.max_points,
                'discount_percentage': level.discount_percentage,
                'benefits': level.benefits,
                'color': level.color,
                'icon': level.icon
            } for level in levels]
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@gamification_bp.route('/user/<user_id>/level', methods=['GET'])
def get_user_level(user_id):
    try:
        user = User.query.get(user_id)
        if not user:
            return jsonify({'error': 'Usuário não encontrado'}), 404
        
        # Encontrar o nível atual baseado nos pontos
        current_level = GamificationLevel.query.filter(
            GamificationLevel.min_points <= user.points
        ).order_by(GamificationLevel.min_points.desc()).first()
        
        # Encontrar o próximo nível
        next_level = GamificationLevel.query.filter(
            GamificationLevel.min_points > user.points
        ).order_by(GamificationLevel.min_points.asc()).first()
        
        return jsonify({
            'user_points': user.points,
            'current_level': {
                'id': current_level.id,
                'name': current_level.name,
                'min_points': current_level.min_points,
                'discount_percentage': current_level.discount_percentage,
                'benefits': current_level.benefits,
                'color': current_level.color,
                'icon': current_level.icon
            } if current_level else None,
            'next_level': {
                'id': next_level.id,
                'name': next_level.name,
                'min_points': next_level.min_points,
                'points_needed': next_level.min_points - user.points
            } if next_level else None
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@gamification_bp.route('/user/<user_id>/points', methods=['GET'])
def get_user_points_history(user_id):
    try:
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 20, type=int)
        
        points_history = UserPoints.query.filter_by(user_id=user_id)\
                                        .order_by(UserPoints.created_at.desc())\
                                        .paginate(page=page, per_page=per_page, error_out=False)
        
        return jsonify({
            'points_history': [{
                'id': point.id,
                'points': point.points,
                'action': point.action,
                'description': point.description,
                'created_at': point.created_at.isoformat()
            } for point in points_history.items],
            'pagination': {
                'page': points_history.page,
                'pages': points_history.pages,
                'total': points_history.total
            }
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@gamification_bp.route('/user/<user_id>/add-points', methods=['POST'])
def add_points(user_id):
    try:
        data = request.get_json()
        points = data.get('points', 0)
        action = data.get('action', 'manual')
        description = data.get('description', '')
        
        user = User.query.get(user_id)
        if not user:
            return jsonify({'error': 'Usuário não encontrado'}), 404
        
        # Adicionar pontos ao usuário
        user.points += points
        
        # Atualizar nível do usuário
        new_level = GamificationLevel.query.filter(
            GamificationLevel.min_points <= user.points
        ).order_by(GamificationLevel.min_points.desc()).first()
        
        if new_level:
            user.level = new_level.name
        
        # Registrar histórico de pontos
        point_record = UserPoints(
            user_id=user_id,
            points=points,
            action=action,
            description=description
        )
        
        db.session.add(point_record)
        db.session.commit()
        
        return jsonify({
            'message': 'Pontos adicionados com sucesso',
            'user_points': user.points,
            'user_level': user.level
        })
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@gamification_bp.route('/leaderboard', methods=['GET'])
def get_leaderboard():
    try:
        limit = request.args.get('limit', 10, type=int)
        
        top_users = User.query.order_by(User.points.desc()).limit(limit).all()
        
        return jsonify({
            'leaderboard': [{
                'rank': idx + 1,
                'name': user.name,
                'points': user.points,
                'level': user.level
            } for idx, user in enumerate(top_users)]
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

