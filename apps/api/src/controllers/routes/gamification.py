from datetime import datetime, timedelta
from decimal import Decimal

from flask import Blueprint, jsonify, request
from sqlalchemy import desc

from ...database import db
from ...models.gamification import (
    Achievement,
    Badge,
    Challenge,
    ChallengeParticipant,
    Reward,
    UserAchievement,
    UserBadge,
    UserReward,
    PointAction,
    MasterLevel,
    UserPointsBalance,
    UserPointTransaction,
    RewardRedemption,
)
from ...services.gamification_service import ClubeMestresService

gamification_bp = Blueprint(
    "gamification", __name__, url_prefix="/api/gamification"
)


@gamification_bp.route("/", methods=["GET"])
def gamification_home():
    """Informações sobre o Clube dos Mestres"""
    return jsonify({
        "message": "Clube dos Mestres - Sistema de Gamificação",
        "description": "O clube dos mestres recompensa sua jornada no mundo dos cafés especiais",
        "how_it_works": {
            "step1": "Interaja & Compre - Ganhe pontos em cada compra, avaliação, compartilhamento e participação em eventos",
            "step2": "Suba de Nível - Acumule pontos para desbloquear novos níveis com benefícios exclusivos crescentes",
            "step3": "Desfrute dos Benefícios - Aproveite descontos, acessos VIP, produtos exclusivos e experiências únicas"
        },
        "levels": {
            "aprendiz": "0 pontos",
            "conhecedor": "500 pontos",
            "especialista": "1500 pontos",
            "lenda": "3000 pontos",
            "mestre": "5000 pontos"
        },
        "endpoints": {
            "levels": "/levels",
            "points": "/points",
            "user_profile": "/users/{user_id}/profile",
            "actions": "/actions",
            "rewards": "/rewards",
            "leaderboard": "/leaderboard"
        }
    })


# ===========================================
# CLUBE DOS MESTRES - NÍVEIS
# ===========================================

@gamification_bp.route("/levels", methods=["GET"])
def get_levels():
    """Lista todos os níveis do Clube dos Mestres"""
    try:
        levels = MasterLevel.query.filter_by(is_active=True).order_by(MasterLevel.level_order).all()
        return jsonify({
            "levels": [level.to_dict() for level in levels]
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@gamification_bp.route("/levels/init", methods=["POST"])
def initialize_levels():
    """Inicializa os níveis padrão do Clube dos Mestres"""
    try:
        ClubeMestresService.initialize_default_levels()
        return jsonify({"message": "Níveis inicializados com sucesso"})
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# ===========================================
# CLUBE DOS MESTRES - AÇÕES DE PONTOS
# ===========================================

@gamification_bp.route("/actions", methods=["GET"])
def get_point_actions():
    """Lista todas as ações que geram pontos"""
    try:
        actions = PointAction.query.filter_by(is_active=True).all()
        return jsonify({
            "actions": [action.to_dict() for action in actions]
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@gamification_bp.route("/actions/init", methods=["POST"])
def initialize_actions():
    """Inicializa as ações padrão de pontuação"""
    try:
        ClubeMestresService.initialize_default_actions()
        return jsonify({"message": "Ações inicializadas com sucesso"})
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# ===========================================
# CLUBE DOS MESTRES - PERFIL DO USUÁRIO
# ===========================================

@gamification_bp.route("/users/<user_id>/profile", methods=["GET"])
def get_user_profile(user_id):
    """Perfil completo do usuário no Clube dos Mestres"""
    try:
        profile = ClubeMestresService.get_user_level_info(user_id)
        return jsonify(profile)
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@gamification_bp.route("/users/<user_id>/balance", methods=["GET"])
def get_user_balance(user_id):
    """Saldo de pontos do usuário"""
    try:
        balance = ClubeMestresService.get_user_balance(user_id)
        if not balance:
            balance = ClubeMestresService.get_or_create_user_balance(user_id)
        
        return jsonify(balance.to_dict())
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@gamification_bp.route("/users/<user_id>/transactions", methods=["GET"])
def get_user_transactions(user_id):
    """Histórico de transações de pontos do usuário"""
    try:
        limit = request.args.get("limit", 50, type=int)
        transactions = ClubeMestresService.get_user_transactions(user_id, limit)
        return jsonify({
            "transactions": transactions,
            "total": len(transactions)
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# ===========================================
# CLUBE DOS MESTRES - PONTOS
# ===========================================

@gamification_bp.route("/points/award", methods=["POST"])
def award_points():
    """Concede pontos a um usuário"""
    try:
        data = request.get_json()
        required_fields = ["user_id", "action_type", "points"]
        
        for field in required_fields:
            if field not in data:
                return jsonify({"error": f"Campo obrigatório: {field}"}), 400
        
        result = ClubeMestresService.award_points(
            user_id=data["user_id"],
            action_type=data["action_type"],
            points=data["points"],
            description=data.get("description"),
            reference_type=data.get("reference_type"),
            reference_id=data.get("reference_id"),
            extra_data=data.get("extra_data")
        )
        
        if result["success"]:
            return jsonify(result), 201
        else:
            return jsonify(result), 400
            
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@gamification_bp.route("/points/purchase", methods=["POST"])
def process_purchase_points():
    """Processa pontos para uma compra"""
    try:
        data = request.get_json()
        required_fields = ["user_id", "order_value", "order_id"]
        
        for field in required_fields:
            if field not in data:
                return jsonify({"error": f"Campo obrigatório: {field}"}), 400
        
        result = ClubeMestresService.process_purchase_points(
            user_id=data["user_id"],
            order_value=Decimal(str(data["order_value"])),
            order_id=data["order_id"]
        )
        
        if result["success"]:
            return jsonify(result), 201
        else:
            return jsonify(result), 400
            
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# ===========================================
# CLUBE DOS MESTRES - LEADERBOARD
# ===========================================

@gamification_bp.route("/leaderboard", methods=["GET"])
def get_leaderboard():
    """Ranking dos usuários por pontos"""
    try:
        limit = request.args.get("limit", 10, type=int)
        level_filter = request.args.get("level")
        
        query = UserPointsBalance.query
        
        if level_filter:
            query = query.filter_by(level_id=level_filter)
        
        top_users = query.order_by(
            desc(UserPointsBalance.total_points)
        ).limit(limit).all()
        
        leaderboard = []
        for i, balance in enumerate(top_users, 1):
            user_data = balance.to_dict()
            user_data["rank"] = i
            leaderboard.append(user_data)
        
        return jsonify({
            "leaderboard": leaderboard,
            "total_users": len(leaderboard)
        })
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# ===========================================
# CLUBE DOS MESTRES - REWARDS
# ===========================================

@gamification_bp.route("/rewards", methods=["GET"])
def get_rewards():
    """Lista todas as recompensas disponíveis"""
    try:
        rewards = Reward.query.filter_by(is_active=True).all()
        return jsonify({
            "rewards": [reward.to_dict() for reward in rewards]
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@gamification_bp.route("/rewards/<reward_id>/redeem", methods=["POST"])
def redeem_reward(reward_id):
    """Resgata uma recompensa"""
    try:
        data = request.get_json()
        user_id = data.get("user_id")
        
        if not user_id:
            return jsonify({"error": "user_id é obrigatório"}), 400
        
        reward = Reward.query.get(reward_id)
        if not reward:
            return jsonify({"error": "Recompensa não encontrada"}), 404
        
        if not reward.is_active:
            return jsonify({"error": "Recompensa não está ativa"}), 400
        
        # Verificar saldo do usuário
        balance = ClubeMestresService.get_user_balance(user_id)
        if not balance or balance.available_points < reward.cost_points:
            return jsonify({"error": "Pontos insuficientes"}), 400
        
        # Verificar estoque
        if reward.max_redemptions and reward.current_redemptions >= reward.max_redemptions:
            return jsonify({"error": "Recompensa esgotada"}), 400
        
        # Criar resgate
        redemption = RewardRedemption(
            user_id=user_id,
            reward_id=reward_id,
            points_used=reward.cost_points,
            expires_at=(
                datetime.utcnow() + timedelta(days=30)  # Padrão 30 dias
            )
        )
        
        # Debitar pontos
        transaction = UserPointTransaction(
            user_id=user_id,
            points=-reward.cost_points,
            transaction_type="spent",
            description=f"Resgate: {reward.name}",
            reference_type="reward",
            reference_id=reward_id
        )
        
        # Atualizar saldo
        balance.available_points -= reward.cost_points
        reward.current_redemptions += 1
        
        db.session.add(redemption)
        db.session.add(transaction)
        db.session.commit()
        
        return jsonify({
            "message": "Recompensa resgatada com sucesso",
            "redemption": redemption.to_dict(),
            "remaining_points": balance.available_points
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500


@gamification_bp.route("/users/<user_id>/rewards", methods=["GET"])
def get_user_rewards(user_id):
    """Lista recompensas resgatadas pelo usuário"""
    try:
        redemptions = RewardRedemption.query.filter_by(user_id=user_id).order_by(
            desc(RewardRedemption.created_at)
        ).all()
        
        return jsonify({
            "redemptions": [redemption.to_dict() for redemption in redemptions]
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# ===========================================
# LEGACY ENDPOINTS (COMPATIBILIDADE)
# ===========================================

@gamification_bp.route("/badges", methods=["GET"])
def get_badges():
    """Lista todos os badges"""
    try:
        badges = Badge.query.filter_by(is_active=True).all()
        return jsonify({"badges": [badge.to_dict() for badge in badges]})
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@gamification_bp.route("/achievements", methods=["GET"])
def get_achievements():
    """Lista todas as conquistas"""
    try:
        achievements = Achievement.query.filter_by(is_active=True).all()
        return jsonify({
            "achievements": [achievement.to_dict() for achievement in achievements]
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@gamification_bp.route("/challenges", methods=["GET"])
def get_challenges():
    """Lista todos os desafios"""
    try:
        challenges = Challenge.query.filter_by(status="active").all()
        return jsonify({
            "challenges": [challenge.to_dict() for challenge in challenges]
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# ===========================================
# ANALYTICS E ESTATÍSTICAS
# ===========================================

@gamification_bp.route("/analytics", methods=["GET"])
def get_analytics():
    """Estatísticas do Clube dos Mestres"""
    try:
        # Estatísticas gerais
        total_users = UserPointsBalance.query.count()
        total_points_awarded = db.session.query(
            db.func.sum(UserPointTransaction.points)
        ).filter(UserPointTransaction.transaction_type == "earned").scalar() or 0
        
        # Distribuição por níveis
        level_distribution = db.session.query(
            MasterLevel.name,
            db.func.count(UserPointsBalance.id).label("count")
        ).join(
            UserPointsBalance, MasterLevel.id == UserPointsBalance.level_id
        ).group_by(MasterLevel.name).all()
        
        # Ações mais populares
        popular_actions = db.session.query(
            PointAction.name,
            db.func.count(UserPointTransaction.id).label("count")
        ).join(
            UserPointTransaction, PointAction.id == UserPointTransaction.action_id
        ).group_by(PointAction.name).order_by(
            db.func.count(UserPointTransaction.id).desc()
        ).limit(5).all()
        
        return jsonify({
            "total_users": total_users,
            "total_points_awarded": int(total_points_awarded),
            "level_distribution": [
                {"level": level.name, "count": level.count}
                for level in level_distribution
            ],
            "popular_actions": [
                {"action": action.name, "count": action.count}
                for action in popular_actions
            ]
        })
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# ===========================================
# ADMIN - GERENCIAMENTO DE PONTOS
# ===========================================

@gamification_bp.route("/admin/points/add", methods=["POST"])
def admin_add_points():
    """Admin adiciona pontos para um usuário"""
    try:
        data = request.get_json()
        required_fields = ["user_id", "points", "reason"]
        
        for field in required_fields:
            if field not in data:
                return jsonify({"error": f"Campo obrigatório: {field}"}), 400
        
        admin_id = data.get("admin_id")  # ID do admin que está fazendo a operação
        if not admin_id:
            return jsonify({"error": "admin_id é obrigatório"}), 400
        
        points = int(data["points"])
        if points <= 0:
            return jsonify({"error": "Pontos devem ser positivos"}), 400
        
        result = ClubeMestresService.admin_add_points(
            user_id=data["user_id"],
            points=points,
            reason=data["reason"],
            admin_id=admin_id,
            notes=data.get("notes", "")
        )
        
        if result["success"]:
            return jsonify(result), 201
        else:
            return jsonify(result), 400
            
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@gamification_bp.route("/admin/points/remove", methods=["POST"])
def admin_remove_points():
    """Admin remove pontos de um usuário"""
    try:
        data = request.get_json()
        required_fields = ["user_id", "points", "reason"]
        
        for field in required_fields:
            if field not in data:
                return jsonify({"error": f"Campo obrigatório: {field}"}), 400
        
        admin_id = data.get("admin_id")  # ID do admin que está fazendo a operação
        if not admin_id:
            return jsonify({"error": "admin_id é obrigatório"}), 400
        
        points = int(data["points"])
        if points <= 0:
            return jsonify({"error": "Pontos devem ser positivos"}), 400
        
        result = ClubeMestresService.admin_remove_points(
            user_id=data["user_id"],
            points=points,
            reason=data["reason"],
            admin_id=admin_id,
            notes=data.get("notes", "")
        )
        
        if result["success"]:
            return jsonify(result), 200
        else:
            return jsonify(result), 400
            
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@gamification_bp.route("/admin/points/adjust", methods=["POST"])
def admin_adjust_points():
    """Admin ajusta pontos de um usuário para um valor específico"""
    try:
        data = request.get_json()
        required_fields = ["user_id", "new_total", "reason"]
        
        for field in required_fields:
            if field not in data:
                return jsonify({"error": f"Campo obrigatório: {field}"}), 400
        
        admin_id = data.get("admin_id")
        if not admin_id:
            return jsonify({"error": "admin_id é obrigatório"}), 400
        
        new_total = int(data["new_total"])
        if new_total < 0:
            return jsonify({"error": "Total de pontos não pode ser negativo"}), 400
        
        result = ClubeMestresService.admin_adjust_points(
            user_id=data["user_id"],
            new_total=new_total,
            reason=data["reason"],
            admin_id=admin_id,
            notes=data.get("notes", "")
        )
        
        if result["success"]:
            return jsonify(result), 200
        else:
            return jsonify(result), 400
            
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@gamification_bp.route("/admin/users/<user_id>/points/history", methods=["GET"])
def admin_get_user_points_history(user_id):
    """Admin obtém histórico detalhado de pontos do usuário"""
    try:
        include_admin_actions = request.args.get("include_admin", "true").lower() == "true"
        limit = request.args.get("limit", 100, type=int)
        
        history = ClubeMestresService.get_detailed_user_history(
            user_id=user_id,
            include_admin_actions=include_admin_actions,
            limit=limit
        )
        
        return jsonify({
            "user_id": user_id,
            "history": history,
            "total": len(history)
        })
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@gamification_bp.route("/admin/points/actions", methods=["GET"])
def admin_get_points_actions():
    """Admin obtém histórico de ações de pontos realizadas por administradores"""
    try:
        limit = request.args.get("limit", 50, type=int)
        admin_id = request.args.get("admin_id")
        
        actions = ClubeMestresService.get_admin_points_actions(
            admin_id=admin_id,
            limit=limit
        )
        
        return jsonify({
            "admin_actions": actions,
            "total": len(actions)
        })
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@gamification_bp.route("/admin/users/search", methods=["GET"])
def admin_search_users():
    """Admin busca usuários por email ou nome para gerenciar pontos"""
    try:
        query = request.args.get("q", "").strip()
        if not query:
            return jsonify({"error": "Parâmetro 'q' é obrigatório"}), 400
        
        if len(query) < 3:
            return jsonify({"error": "Query deve ter pelo menos 3 caracteres"}), 400
        
        users = ClubeMestresService.search_users_for_admin(query)
        
        return jsonify({
            "users": users,
            "total": len(users)
        })
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@gamification_bp.route("/admin/dashboard", methods=["GET"])
def admin_dashboard():
    """Dashboard administrativo do sistema de gamificação"""
    try:
        dashboard_data = ClubeMestresService.get_admin_dashboard()
        
        return jsonify(dashboard_data)
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500