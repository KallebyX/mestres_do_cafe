"""
Rotas para o sistema de Gamificação
"""

from datetime import datetime, timedelta
from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity, get_jwt
from sqlalchemy import desc
from sqlalchemy.exc import SQLAlchemyError

from database import db
from models import (
    GamificationLevel, UserPoint, Reward, RewardRedemption,
    User, Order
)
from utils.validators import validate_required_fields
import secrets

gamification_bp = Blueprint('gamification', __name__)


# ================ NÍVEIS ================

@gamification_bp.route('/levels', methods=['GET'])
def get_levels():
    """Listar todos os níveis de gamificação"""
    try:
        levels = GamificationLevel.query.filter_by(is_active=True).order_by(GamificationLevel.level_number).all()
        return jsonify({
            'success': True,
            'levels': [level.to_dict() for level in levels]
        }), 200
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500


@gamification_bp.route('/levels', methods=['POST'])
@jwt_required()
def create_level():
    """Criar novo nível (admin)"""
    try:
        claims = get_jwt()
        if not claims.get('is_admin'):
            return jsonify({'success': False, 'error': 'Acesso negado'}), 403

        data = request.get_json()
        validation = validate_required_fields(data, ['name', 'level_number', 'points_required'])
        if not validation['valid']:
            return jsonify({'success': False, 'error': validation['message']}), 400

        level = GamificationLevel(**data)
        db.session.add(level)
        db.session.commit()

        return jsonify({'success': True, 'level': level.to_dict()}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'error': str(e)}), 500


# ================ PONTOS ================

@gamification_bp.route('/my-points', methods=['GET'])
@jwt_required()
def get_my_points():
    """Obter histórico de pontos do usuário atual"""
    try:
        user_id = get_jwt_identity()
        user = User.query.get(user_id)

        # Histórico de pontos
        points_history = UserPoint.query.filter_by(user_id=user_id).order_by(desc(UserPoint.created_at)).limit(50).all()

        # Pontos a expirar em 30 dias
        expiring_soon = UserPoint.query.filter(
            UserPoint.user_id == user_id,
            UserPoint.points > 0,
            UserPoint.expires_at.isnot(None),
            UserPoint.expires_at <= datetime.utcnow() + timedelta(days=30),
            UserPoint.is_expired == False
        ).all()

        return jsonify({
            'success': True,
            'current_points': user.points or 0,
            'history': [p.to_dict() for p in points_history],
            'expiring_soon': sum([p.points for p in expiring_soon])
        }), 200
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500


@gamification_bp.route('/add-points', methods=['POST'])
@jwt_required()
def add_points_manual():
    """Adicionar pontos manualmente (admin)"""
    try:
        claims = get_jwt()
        if not claims.get('is_admin'):
            return jsonify({'success': False, 'error': 'Acesso negado'}), 403

        current_user_id = get_jwt_identity()
        data = request.get_json()

        validation = validate_required_fields(data, ['user_id', 'points'])
        if not validation['valid']:
            return jsonify({'success': False, 'error': validation['message']}), 400

        user = User.query.get(data['user_id'])
        if not user:
            return jsonify({'success': False, 'error': 'Usuário não encontrado'}), 404

        # Adicionar pontos
        user.points = (user.points or 0) + data['points']

        # Registrar histórico
        point_record = UserPoint(
            user_id=user.id,
            points=data['points'],
            balance_after=user.points,
            action_type='manual',
            description=data.get('description', 'Pontos adicionados manualmente'),
            admin_note=data.get('admin_note'),
            created_by=current_user_id
        )
        db.session.add(point_record)
        db.session.commit()

        return jsonify({
            'success': True,
            'message': 'Pontos adicionados com sucesso',
            'new_balance': user.points
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'error': str(e)}), 500


# ================ RECOMPENSAS ================

@gamification_bp.route('/rewards', methods=['GET'])
def get_rewards():
    """Listar recompensas disponíveis"""
    try:
        rewards = Reward.query.filter_by(is_active=True).order_by(Reward.points_cost).all()
        return jsonify({
            'success': True,
            'rewards': [r.to_dict() for r in rewards]
        }), 200
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500


@gamification_bp.route('/rewards', methods=['POST'])
@jwt_required()
def create_reward():
    """Criar nova recompensa (admin)"""
    try:
        claims = get_jwt()
        if not claims.get('is_admin'):
            return jsonify({'success': False, 'error': 'Acesso negado'}), 403

        data = request.get_json()
        validation = validate_required_fields(data, ['name', 'type', 'points_cost'])
        if not validation['valid']:
            return jsonify({'success': False, 'error': validation['message']}), 400

        reward = Reward(**data)
        db.session.add(reward)
        db.session.commit()

        return jsonify({'success': True, 'reward': reward.to_dict()}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'error': str(e)}), 500


@gamification_bp.route('/rewards/<reward_id>/redeem', methods=['POST'])
@jwt_required()
def redeem_reward(reward_id):
    """Resgatar recompensa"""
    try:
        user_id = get_jwt_identity()
        user = User.query.get(user_id)
        reward = Reward.query.get(reward_id)

        if not reward:
            return jsonify({'success': False, 'error': 'Recompensa não encontrada'}), 404

        # Validações
        if not reward.is_active:
            return jsonify({'success': False, 'error': 'Recompensa indisponível'}), 400

        if user.points < reward.points_cost:
            return jsonify({'success': False, 'error': 'Pontos insuficientes'}), 400

        # Verificar estoque
        if reward.total_available:
            if reward.total_redeemed >= reward.total_available:
                return jsonify({'success': False, 'error': 'Recompensa esgotada'}), 400

        # Debitar pontos
        user.points -= reward.points_cost

        # Gerar código único
        code = f'RW{secrets.token_hex(8).upper()}'

        # Criar resgate
        redemption = RewardRedemption(
            user_id=user.id,
            reward_id=reward.id,
            points_spent=reward.points_cost,
            code=code,
            status='pending',
            expires_at=datetime.utcnow() + timedelta(days=30)
        )

        # Atualizar contadores
        reward.total_redeemed += 1

        # Registrar histórico de pontos
        point_record = UserPoint(
            user_id=user.id,
            points=-reward.points_cost,
            balance_after=user.points,
            action_type='reward_redemption',
            reference_type='reward',
            reference_id=reward.id,
            description=f'Resgate: {reward.name}'
        )

        db.session.add(redemption)
        db.session.add(point_record)
        db.session.commit()

        return jsonify({
            'success': True,
            'message': 'Recompensa resgatada com sucesso',
            'redemption': redemption.to_dict(),
            'code': code,
            'new_balance': user.points
        }), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'error': str(e)}), 500


@gamification_bp.route('/my-redemptions', methods=['GET'])
@jwt_required()
def get_my_redemptions():
    """Obter resgates do usuário"""
    try:
        user_id = get_jwt_identity()
        redemptions = RewardRedemption.query.filter_by(user_id=user_id).order_by(desc(RewardRedemption.redeemed_at)).all()

        return jsonify({
            'success': True,
            'redemptions': [r.to_dict() for r in redemptions]
        }), 200
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500


# ================ LEADERBOARD ================

@gamification_bp.route('/leaderboard', methods=['GET'])
def get_leaderboard():
    """Ranking de usuários por pontos"""
    try:
        limit = int(request.args.get('limit', 10))

        users = User.query.filter(
            User.is_active == True,
            User.points > 0
        ).order_by(desc(User.points)).limit(limit).all()

        leaderboard = []
        for idx, user in enumerate(users, 1):
            leaderboard.append({
                'rank': idx,
                'user_id': str(user.id),
                'name': user.name,
                'points': user.points,
                'level': user.level,
                'avatar_url': user.avatar_url
            })

        return jsonify({
            'success': True,
            'leaderboard': leaderboard
        }), 200
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500
