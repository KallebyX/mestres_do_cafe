"""
Serviço de Gamificação - Clube dos Mestres
"""

import uuid
from datetime import datetime, date
from decimal import Decimal
from typing import Optional, Dict, Any

from sqlalchemy import desc, func
from sqlalchemy.orm import sessionmaker

from ..database import db
from ..models.gamification import (
    PointAction, 
    MasterLevel, 
    UserPointsBalance, 
    UserPointTransaction,
    UserPoint,
    Reward,
    RewardRedemption
)
from ..models.auth import User


class ClubeMestresService:
    """Serviço principal do Clube dos Mestres"""

    @staticmethod
    def initialize_default_levels():
        """Inicializa os níveis padrão do Clube dos Mestres"""
        levels = [
            {
                "name": "Aprendiz do Café",
                "description": "Bem-vindo ao mundo dos cafés especiais!",
                "min_points": 0,
                "max_points": 499,
                "level_order": 1,
                "discount_percentage": Decimal("0.00"),
                "benefits": [
                    "Acesso ao clube",
                    "Newsletter exclusiva",
                    "Dicas de preparo"
                ],
                "badge_color": "#8B4513",
                "badge_icon": "coffee-outline"
            },
            {
                "name": "Conhecedor",
                "description": "Você está descobrindo os segredos do café!",
                "min_points": 500,
                "max_points": 1499,
                "level_order": 2,
                "discount_percentage": Decimal("5.00"),
                "benefits": [
                    "5% de desconto",
                    "Acesso a receitas exclusivas",
                    "Degustação mensal grátis"
                ],
                "badge_color": "#CD853F",
                "badge_icon": "coffee"
            },
            {
                "name": "Especialista",
                "description": "Seu paladar está refinado!",
                "min_points": 1500,
                "max_points": 2999,
                "level_order": 3,
                "discount_percentage": Decimal("10.00"),
                "benefits": [
                    "10% de desconto",
                    "Acesso VIP a lançamentos",
                    "Masterclass gratuita trimestral",
                    "Produtos limitados"
                ],
                "badge_color": "#DAA520",
                "badge_icon": "award"
            },
            {
                "name": "Lenda",
                "description": "Você é uma referência no mundo do café!",
                "min_points": 3000,
                "max_points": 4999,
                "level_order": 4,
                "discount_percentage": Decimal("20.00"),
                "benefits": [
                    "20% de desconto",
                    "Acesso a edições especiais",
                    "Participação em eventos VIP",
                    "Consultoria personalizada"
                ],
                "badge_color": "#FF6347",
                "badge_icon": "star"
            },
            {
                "name": "Mestre do Café",
                "description": "O nível mais alto da expertise em café!",
                "min_points": 5000,
                "max_points": None,
                "level_order": 5,
                "discount_percentage": Decimal("25.00"),
                "benefits": [
                    "25% de desconto",
                    "Acesso completo a produtos exclusivos",
                    "Participação em eventos especiais",
                    "Comunidade exclusiva de mestres",
                    "Mentoria com especialistas"
                ],
                "badge_color": "#FF4500",
                "badge_icon": "trophy"
            }
        ]

        for level_data in levels:
            existing = MasterLevel.query.filter_by(name=level_data["name"]).first()
            if not existing:
                level = MasterLevel(**level_data)
                db.session.add(level)
        
        db.session.commit()

    @staticmethod
    def initialize_default_actions():
        """Inicializa as ações padrão de pontuação"""
        actions = [
            {
                "action_type": "purchase",
                "name": "Compra de produtos",
                "description": "Ganhe pontos em cada compra",
                "points_formula": "value / 10",
                "base_points": 0,
                "multiplier": Decimal("1.0"),
                "is_active": True
            },
            {
                "action_type": "first_purchase",
                "name": "Primeira compra",
                "description": "Bônus especial para primeira compra",
                "base_points": 100,
                "multiplier": Decimal("1.0"),
                "max_actions_per_day": 1,
                "is_active": True
            },
            {
                "action_type": "product_review",
                "name": "Avaliação de produto",
                "description": "Compartilhe sua experiência",
                "base_points": 25,
                "multiplier": Decimal("1.0"),
                "max_actions_per_day": 5,
                "is_active": True
            },
            {
                "action_type": "social_share",
                "name": "Compartilhamento nas redes",
                "description": "Divulgue produtos nas redes sociais",
                "base_points": 15,
                "multiplier": Decimal("1.0"),
                "max_actions_per_day": 3,
                "is_active": True
            },
            {
                "action_type": "workshop_participation",
                "name": "Participação em workshops",
                "description": "Aprenda com nossos especialistas",
                "base_points": 50,
                "multiplier": Decimal("1.0"),
                "is_active": True
            },
            {
                "action_type": "friend_referral",
                "name": "Indicação de amigos",
                "description": "Traga seus amigos para o clube",
                "base_points": 200,
                "multiplier": Decimal("1.0"),
                "requires_verification": True,
                "is_active": True
            },
            {
                "action_type": "monthly_purchase_bonus",
                "name": "Compra mensal recorrente",
                "description": "Bônus para compras mensais",
                "base_points": 50,
                "multiplier": Decimal("1.0"),
                "max_actions_per_month": 1,
                "is_active": True
            },
            {
                "action_type": "detailed_feedback",
                "name": "Feedback detalhado",
                "description": "Nos ajude a melhorar",
                "base_points": 30,
                "multiplier": Decimal("1.0"),
                "max_actions_per_day": 2,
                "is_active": True
            }
        ]

        for action_data in actions:
            existing = PointAction.query.filter_by(action_type=action_data["action_type"]).first()
            if not existing:
                action = PointAction(**action_data)
                db.session.add(action)
        
        db.session.commit()

    @staticmethod
    def get_user_balance(user_id: str) -> Optional[UserPointsBalance]:
        """Obtém o saldo de pontos do usuário"""
        return UserPointsBalance.query.filter_by(user_id=user_id).first()

    @staticmethod
    def get_or_create_user_balance(user_id: str) -> UserPointsBalance:
        """Obtém ou cria o saldo de pontos do usuário"""
        balance = ClubeMestresService.get_user_balance(user_id)
        if not balance:
            # Obtém o nível inicial (Aprendiz do Café)
            initial_level = MasterLevel.query.filter_by(level_order=1).first()
            
            balance = UserPointsBalance(
                user_id=user_id,
                total_points=0,
                available_points=0,
                level_id=initial_level.id if initial_level else None,
                level_progress=Decimal("0.00"),
                points_to_next_level=500,  # Pontos para Conhecedor
                monthly_purchases=0,
                last_monthly_reset=date.today()
            )
            db.session.add(balance)
            db.session.commit()
        
        return balance

    @staticmethod
    def calculate_purchase_points(order_value: Decimal) -> int:
        """Calcula pontos baseado no valor da compra: 10 pontos por R$ 10"""
        return int(order_value / 10)

    @staticmethod
    def award_points(
        user_id: str,
        action_type: str,
        points: int,
        description: str = None,
        reference_type: str = None,
        reference_id: str = None,
        extra_data: Dict[str, Any] = None
    ) -> Dict[str, Any]:
        """Concede pontos a um usuário"""
        try:
            # Obter ação
            action = PointAction.query.filter_by(action_type=action_type).first()
            if not action or not action.is_active:
                return {"success": False, "message": "Ação não encontrada ou inativa"}

            # Verificar limites diários/mensais
            today = date.today()
            if action.max_actions_per_day:
                daily_count = UserPointTransaction.query.filter_by(
                    user_id=user_id,
                    action_id=action.id,
                    transaction_type="earned"
                ).filter(
                    func.date(UserPointTransaction.created_at) == today
                ).count()
                
                if daily_count >= action.max_actions_per_day:
                    return {"success": False, "message": "Limite diário excedido"}

            # Obter saldo do usuário
            balance = ClubeMestresService.get_or_create_user_balance(user_id)

            # Criar transação
            transaction = UserPointTransaction(
                user_id=user_id,
                action_id=action.id,
                points=points,
                transaction_type="earned",
                description=description or action.name,
                reference_type=reference_type,
                reference_id=reference_id,
                extra_data=extra_data or {}
            )
            db.session.add(transaction)

            # Atualizar saldo
            balance.total_points += points
            balance.available_points += points
            balance.updated_at = datetime.utcnow()

            # Verificar mudança de nível
            level_change = ClubeMestresService.check_level_up(balance)

            db.session.commit()

            return {
                "success": True,
                "points_awarded": points,
                "total_points": balance.total_points,
                "available_points": balance.available_points,
                "level_change": level_change,
                "transaction_id": str(transaction.id)
            }

        except Exception as e:
            db.session.rollback()
            return {"success": False, "message": str(e)}

    @staticmethod
    def check_level_up(balance: UserPointsBalance) -> Optional[Dict[str, Any]]:
        """Verifica se o usuário subiu de nível"""
        current_level = balance.level
        next_level = MasterLevel.query.filter(
            MasterLevel.min_points <= balance.total_points,
            MasterLevel.level_order > (current_level.level_order if current_level else 0)
        ).order_by(MasterLevel.level_order).first()

        if next_level and (not current_level or next_level.id != current_level.id):
            balance.level_id = next_level.id
            
            # Calcular progresso para próximo nível
            subsequent_level = MasterLevel.query.filter(
                MasterLevel.level_order > next_level.level_order
            ).order_by(MasterLevel.level_order).first()
            
            if subsequent_level:
                points_needed = subsequent_level.min_points - balance.total_points
                balance.points_to_next_level = max(0, points_needed)
                
                progress = (balance.total_points - next_level.min_points) / (subsequent_level.min_points - next_level.min_points)
                balance.level_progress = Decimal(str(min(100.0, progress * 100)))
            else:
                balance.points_to_next_level = 0
                balance.level_progress = Decimal("100.00")

            return {
                "new_level": next_level.to_dict(),
                "previous_level": current_level.to_dict() if current_level else None
            }

        return None

    @staticmethod
    def get_user_level_info(user_id: str) -> Dict[str, Any]:
        """Obtém informações completas do nível do usuário"""
        balance = ClubeMestresService.get_or_create_user_balance(user_id)
        
        current_level = balance.level
        next_level = None
        
        if current_level:
            next_level = MasterLevel.query.filter(
                MasterLevel.level_order > current_level.level_order
            ).order_by(MasterLevel.level_order).first()

        return {
            "user_id": user_id,
            "total_points": balance.total_points,
            "available_points": balance.available_points,
            "current_level": current_level.to_dict() if current_level else None,
            "next_level": next_level.to_dict() if next_level else None,
            "level_progress": float(balance.level_progress),
            "points_to_next_level": balance.points_to_next_level,
            "first_purchase_completed": balance.first_purchase_completed,
            "monthly_purchases": balance.monthly_purchases
        }

    @staticmethod
    def get_user_transactions(user_id: str, limit: int = 50) -> list:
        """Obtém o histórico de transações do usuário"""
        transactions = UserPointTransaction.query.filter_by(
            user_id=user_id
        ).order_by(desc(UserPointTransaction.created_at)).limit(limit).all()
        
        return [t.to_dict() for t in transactions]

    @staticmethod
    def process_purchase_points(user_id: str, order_value: Decimal, order_id: str) -> Dict[str, Any]:
        """Processa pontos para uma compra"""
        try:
            balance = ClubeMestresService.get_or_create_user_balance(user_id)
            
            # Verificar se é primeira compra
            if not balance.first_purchase_completed:
                # Conceder bônus de primeira compra
                first_purchase_result = ClubeMestresService.award_points(
                    user_id=user_id,
                    action_type="first_purchase",
                    points=100,
                    description="Bônus de primeira compra",
                    reference_type="order",
                    reference_id=order_id
                )
                
                balance.first_purchase_completed = True
                db.session.commit()
            
            # Calcular pontos da compra
            purchase_points = ClubeMestresService.calculate_purchase_points(order_value)
            
            # Conceder pontos da compra
            purchase_result = ClubeMestresService.award_points(
                user_id=user_id,
                action_type="purchase",
                points=purchase_points,
                description=f"Compra de R$ {order_value:.2f}",
                reference_type="order",
                reference_id=order_id,
                extra_data={"order_value": str(order_value)}
            )
            
            # Verificar bônus mensal
            today = date.today()
            if balance.last_monthly_reset.month != today.month:
                balance.monthly_purchases = 0
                balance.last_monthly_reset = today
            
            balance.monthly_purchases += 1
            
            # Bônus mensal (se primeira compra do mês)
            monthly_bonus_result = None
            if balance.monthly_purchases == 1:
                monthly_bonus_result = ClubeMestresService.award_points(
                    user_id=user_id,
                    action_type="monthly_purchase_bonus",
                    points=50,
                    description="Bônus de compra mensal",
                    reference_type="order",
                    reference_id=order_id
                )
            
            db.session.commit()
            
            return {
                "success": True,
                "purchase_points": purchase_points,
                "first_purchase_bonus": first_purchase_result if not balance.first_purchase_completed else None,
                "monthly_bonus": monthly_bonus_result,
                "total_points_awarded": purchase_points + (100 if not balance.first_purchase_completed else 0) + (50 if balance.monthly_purchases == 1 else 0)
            }
            
        except Exception as e:
            db.session.rollback()
            return {"success": False, "message": str(e)}

    # ===========================================
    # MÉTODOS ADMINISTRATIVOS
    # ===========================================

    @staticmethod
    def admin_add_points(user_id: str, points: int, reason: str, admin_id: str, notes: str = "") -> Dict[str, Any]:
        """Admin adiciona pontos para um usuário"""
        try:
            balance = ClubeMestresService.get_or_create_user_balance(user_id)
            
            # Criar transação de pontos
            transaction = UserPointTransaction(
                user_id=user_id,
                points=points,
                transaction_type="earned",
                description=f"[ADMIN] {reason}",
                reference_type="admin_action",
                reference_id=admin_id,
                extra_data={
                    "admin_id": admin_id,
                    "action_type": "add_points",
                    "reason": reason,
                    "notes": notes
                }
            )
            db.session.add(transaction)
            
            # Atualizar saldo
            balance.total_points += points
            balance.available_points += points
            balance.updated_at = datetime.utcnow()
            
            # Verificar mudança de nível
            level_change = ClubeMestresService.check_level_up(balance)
            
            db.session.commit()
            
            return {
                "success": True,
                "message": f"Pontos adicionados com sucesso",
                "points_added": points,
                "total_points": balance.total_points,
                "available_points": balance.available_points,
                "level_change": level_change,
                "transaction_id": str(transaction.id)
            }
            
        except Exception as e:
            db.session.rollback()
            return {"success": False, "message": str(e)}

    @staticmethod
    def admin_remove_points(user_id: str, points: int, reason: str, admin_id: str, notes: str = "") -> Dict[str, Any]:
        """Admin remove pontos de um usuário"""
        try:
            balance = ClubeMestresService.get_or_create_user_balance(user_id)
            
            # Verificar se há pontos suficientes
            if balance.available_points < points:
                return {
                    "success": False, 
                    "message": f"Usuário tem apenas {balance.available_points} pontos disponíveis"
                }
            
            # Criar transação de pontos
            transaction = UserPointTransaction(
                user_id=user_id,
                points=-points,  # Negativo para remoção
                transaction_type="spent",
                description=f"[ADMIN] {reason}",
                reference_type="admin_action",
                reference_id=admin_id,
                extra_data={
                    "admin_id": admin_id,
                    "action_type": "remove_points",
                    "reason": reason,
                    "notes": notes
                }
            )
            db.session.add(transaction)
            
            # Atualizar saldo
            balance.available_points -= points
            # Nota: total_points não é reduzido para manter histórico
            balance.updated_at = datetime.utcnow()
            
            db.session.commit()
            
            return {
                "success": True,
                "message": f"Pontos removidos com sucesso",
                "points_removed": points,
                "total_points": balance.total_points,
                "available_points": balance.available_points,
                "transaction_id": str(transaction.id)
            }
            
        except Exception as e:
            db.session.rollback()
            return {"success": False, "message": str(e)}

    @staticmethod
    def admin_adjust_points(user_id: str, new_total: int, reason: str, admin_id: str, notes: str = "") -> Dict[str, Any]:
        """Admin ajusta pontos de um usuário para um valor específico"""
        try:
            balance = ClubeMestresService.get_or_create_user_balance(user_id)
            
            old_total = balance.total_points
            old_available = balance.available_points
            difference = new_total - old_total
            
            # Criar transação de pontos
            transaction = UserPointTransaction(
                user_id=user_id,
                points=difference,
                transaction_type="earned" if difference > 0 else "spent",
                description=f"[ADMIN] Ajuste de pontos: {reason}",
                reference_type="admin_action",
                reference_id=admin_id,
                extra_data={
                    "admin_id": admin_id,
                    "action_type": "adjust_points",
                    "reason": reason,
                    "notes": notes,
                    "old_total": old_total,
                    "new_total": new_total
                }
            )
            db.session.add(transaction)
            
            # Atualizar saldo
            balance.total_points = new_total
            balance.available_points = old_available + difference
            balance.updated_at = datetime.utcnow()
            
            # Verificar mudança de nível
            level_change = ClubeMestresService.check_level_up(balance)
            
            db.session.commit()
            
            return {
                "success": True,
                "message": f"Pontos ajustados com sucesso",
                "old_total": old_total,
                "new_total": new_total,
                "difference": difference,
                "available_points": balance.available_points,
                "level_change": level_change,
                "transaction_id": str(transaction.id)
            }
            
        except Exception as e:
            db.session.rollback()
            return {"success": False, "message": str(e)}

    @staticmethod
    def get_detailed_user_history(user_id: str, include_admin_actions: bool = True, limit: int = 100) -> list:
        """Obtém histórico detalhado do usuário incluindo ações administrativas"""
        query = UserPointTransaction.query.filter_by(user_id=user_id)
        
        if not include_admin_actions:
            query = query.filter(UserPointTransaction.reference_type != "admin_action")
        
        transactions = query.order_by(desc(UserPointTransaction.created_at)).limit(limit).all()
        
        history = []
        for transaction in transactions:
            item = transaction.to_dict()
            
            # Adicionar informações do admin se for ação administrativa
            if transaction.reference_type == "admin_action" and transaction.extra_data:
                item["admin_action"] = {
                    "admin_id": transaction.extra_data.get("admin_id"),
                    "action_type": transaction.extra_data.get("action_type"),
                    "reason": transaction.extra_data.get("reason"),
                    "notes": transaction.extra_data.get("notes")
                }
            
            history.append(item)
        
        return history

    @staticmethod
    def get_admin_points_actions(admin_id: str = None, limit: int = 50) -> list:
        """Obtém histórico de ações de pontos realizadas por administradores"""
        query = UserPointTransaction.query.filter_by(reference_type="admin_action")
        
        if admin_id:
            query = query.filter(UserPointTransaction.reference_id == admin_id)
        
        transactions = query.order_by(desc(UserPointTransaction.created_at)).limit(limit).all()
        
        actions = []
        for transaction in transactions:
            # Buscar informações do usuário
            from ..models.auth import User
            user = User.query.get(transaction.user_id)
            
            action = {
                "id": str(transaction.id),
                "admin_id": transaction.reference_id,
                "user_id": str(transaction.user_id),
                "user_name": user.name if user else "Usuário não encontrado",
                "user_email": user.email if user else "N/A",
                "points": transaction.points,
                "transaction_type": transaction.transaction_type,
                "description": transaction.description,
                "created_at": transaction.created_at.isoformat(),
                "extra_data": transaction.extra_data or {}
            }
            
            actions.append(action)
        
        return actions

    @staticmethod
    def search_users_for_admin(query: str, limit: int = 20) -> list:
        """Busca usuários por email ou nome para interface administrativa"""
        from ..models.auth import User
        
        users = User.query.filter(
            db.or_(
                User.email.ilike(f"%{query}%"),
                User.name.ilike(f"%{query}%")
            )
        ).limit(limit).all()
        
        results = []
        for user in users:
            balance = ClubeMestresService.get_user_balance(user.id)
            
            user_data = {
                "id": str(user.id),
                "name": user.name,
                "email": user.email,
                "total_points": balance.total_points if balance else 0,
                "available_points": balance.available_points if balance else 0,
                "level": balance.level.name if balance and balance.level else "Aprendiz do Café",
                "created_at": user.created_at.isoformat()
            }
            
            results.append(user_data)
        
        return results

    @staticmethod
    def get_admin_dashboard() -> Dict[str, Any]:
        """Obtém dados para dashboard administrativo"""
        try:
            # Estatísticas gerais
            total_users = UserPointsBalance.query.count()
            total_points_awarded = db.session.query(
                func.sum(UserPointTransaction.points)
            ).filter(
                UserPointTransaction.transaction_type == "earned"
            ).scalar() or 0
            
            total_points_spent = db.session.query(
                func.sum(UserPointTransaction.points)
            ).filter(
                UserPointTransaction.transaction_type == "spent"
            ).scalar() or 0
            
            # Ações administrativas recentes
            admin_actions = ClubeMestresService.get_admin_points_actions(limit=10)
            
            # Usuários mais ativos
            top_users = db.session.query(
                UserPointsBalance.user_id,
                UserPointsBalance.total_points,
                UserPointsBalance.available_points
            ).order_by(desc(UserPointsBalance.total_points)).limit(10).all()
            
            # Buscar dados dos usuários
            from ..models.auth import User
            top_users_data = []
            for user_balance in top_users:
                user = User.query.get(user_balance.user_id)
                if user:
                    top_users_data.append({
                        "id": str(user.id),
                        "name": user.name,
                        "email": user.email,
                        "total_points": user_balance.total_points,
                        "available_points": user_balance.available_points
                    })
            
            # Distribuição por níveis
            level_distribution = db.session.query(
                MasterLevel.name,
                func.count(UserPointsBalance.id).label("count")
            ).join(
                UserPointsBalance, MasterLevel.id == UserPointsBalance.level_id
            ).group_by(MasterLevel.name).all()
            
            return {
                "total_users": total_users,
                "total_points_awarded": int(total_points_awarded),
                "total_points_spent": abs(int(total_points_spent)),  # Converter para positivo
                "available_points": int(total_points_awarded) + int(total_points_spent),
                "recent_admin_actions": admin_actions,
                "top_users": top_users_data,
                "level_distribution": [
                    {"level": level.name, "count": level.count}
                    for level in level_distribution
                ]
            }
            
        except Exception as e:
            return {"error": str(e)}