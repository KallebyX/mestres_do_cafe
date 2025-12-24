"""
Endpoints para gerenciamento de notificações
"""

from datetime import datetime
from typing import Any, Dict, List

from controllers.base import require_admin, require_auth
from database import db
from flask import Blueprint, g, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from models.notifications import (
    Notification,
    NotificationLog,
    NotificationSubscription,
    NotificationTemplate,
)
from services.notification_service import (
    NotificationChannel,
    NotificationType,
    get_notification_service,
)

notifications_bp = Blueprint("notifications", __name__, url_prefix="/api/notifications")


@notifications_bp.route("/", methods=["GET"])
@require_auth
@jwt_required()
def get_user_notifications():
    """Obter notificações do usuário logado"""
    try:
        user_id = g.current_user["id"]
        page = request.args.get("page", 1, type = int)
        per_page = min(request.args.get("per_page", 20, type = int), 100)
        unread_only = request.args.get("unread_only", "false").lower() == "true"
        notification_type = request.args.get("type")

        # Query base
        query = Notification.query.filter_by(user_id = user_id)

        # Filtros opcionais
        if unread_only:
            query = query.filter(Notification.read_at.is_(None))

        if notification_type:
            try:
                query = query.filter_by(
                    notification_type = NotificationType[notification_type.upper()]
                )
            except KeyError:
                return jsonify({"error": "Tipo de notificação inválido"}), 400

        # Ordenação e paginação
        query = query.order_by(Notification.created_at.desc())
        paginated = query.paginate(page = page, per_page = per_page, error_out = False)

        return jsonify(
            {
                "notifications": [
                    notification.to_dict() for notification in paginated.items
                ],
                "pagination": {
                    "page": page,
                    "per_page": per_page,
                    "total": paginated.total,
                    "pages": paginated.pages,
                    "has_next": paginated.has_next,
                    "has_prev": paginated.has_prev,
                },
                "unread_count": Notification.query.filter_by(user_id = user_id)
                .filter(Notification.read_at.is_(None))
                .count(),
            }
        )

    except Exception as e:
        return jsonify({"error": f"Erro ao buscar notificações: {str(e)}"}), 500


@notifications_bp.route("/<int:notification_id>/read", methods=["POST"])
@require_auth
@jwt_required()
def mark_notification_as_read(notification_id: int):
    """Marcar notificação como lida"""
    try:
        user_id = g.current_user["id"]

        notification = Notification.query.filter_by(
            id = notification_id, user_id = user_id
        ).first()

        if not notification:
            return jsonify({"error": "Notificação não encontrada"}), 404

        if notification.read_at is None:
            notification.read_at = datetime.utcnow()
            db.session.commit()

        return jsonify(
            {
                "message": "Notificação marcada como lida",
                "notification": notification.to_dict(),
            }
        )

    except Exception as e:
        return jsonify({"error": f"Erro ao marcar notificação: {str(e)}"}), 500


@notifications_bp.route("/read-all", methods=["POST"])
@require_auth
@jwt_required()
def mark_all_as_read():
    """Marcar todas as notificações como lidas"""
    try:
        user_id = g.current_user["id"]

        unread_notifications = Notification.query.filter_by(user_id = user_id).filter(
            Notification.read_at.is_(None)
        )

        count = unread_notifications.count()
        unread_notifications.update({"read_at": datetime.utcnow()})

        db.session.commit()

        return jsonify({"message": f"{count} notificações marcadas como lidas"})

    except Exception as e:
        return (
            jsonify({"error": f"Erro ao marcar todas as notificações: {str(e)}"}),
            500,
        )


@notifications_bp.route("/<int:notification_id>", methods=["DELETE"])
@require_auth
@jwt_required()
def delete_notification(notification_id: int):
    """Deletar notificação do usuário"""
    try:
        user_id = g.current_user["id"]

        notification = Notification.query.filter_by(
            id = notification_id, user_id = user_id
        ).first()

        if not notification:
            return jsonify({"error": "Notificação não encontrada"}), 404

        db.session.delete(notification)
        db.session.commit()

        return jsonify({"message": "Notificação deletada com sucesso"})

    except Exception as e:
        return jsonify({"error": f"Erro ao deletar notificação: {str(e)}"}), 500


@notifications_bp.route("/preferences", methods=["GET"])
@require_auth
@jwt_required()
def get_notification_preferences():
    """Obter preferências de notificação do usuário"""
    try:
        user_id = g.current_user["id"]

        preferences = NotificationSubscription.query.filter_by(user_id = user_id).all()

        # Estruturar por tipo e canal
        prefs_dict = {}
        for pref in preferences:
            if pref.notification_type.value not in prefs_dict:
                prefs_dict[pref.notification_type.value] = {}
            prefs_dict[pref.notification_type.value][pref.channel.value] = pref.enabled

        return jsonify(
            {
                "preferences": prefs_dict,
                "available_types": [t.value for t in NotificationType],
                "available_channels": [c.value for c in NotificationChannel],
            }
        )

    except Exception as e:
        return jsonify({"error": f"Erro ao buscar preferências: {str(e)}"}), 500


@notifications_bp.route("/preferences", methods=["POST"])
@require_auth
@jwt_required()
def update_notification_preferences():
    """Atualizar preferências de notificação"""
    try:
        user_id = g.current_user["id"]
        data = request.get_json()

        # Validar tipos e canais
        try:
            notification_type = NotificationType[data["notification_type"].upper()]
            channel = NotificationChannel[data["channel"].upper()]
        except KeyError as e:
            return jsonify({"error": f"Tipo ou canal inválido: {str(e)}"}), 400

        # Buscar ou criar preferência
        preference = NotificationSubscription.query.filter_by(
            user_id = user_id, notification_type = notification_type, channel = channel
        ).first()

        if not preference:
            preference = NotificationSubscription(
                user_id = user_id,
                notification_type = notification_type,
                channel = channel,
                enabled = data["enabled"],
            )
            db.session.add(preference)
        else:
            preference.enabled = data["enabled"]
            preference.updated_at = datetime.utcnow()

        db.session.commit()

        return jsonify(
            {
                "message": "Preferência atualizada com sucesso",
                "preference": preference.to_dict(),
            }
        )

    except Exception as e:
        return jsonify({"error": f"Erro ao atualizar preferência: {str(e)}"}), 500


@notifications_bp.route("/send", methods=["POST"])
@require_admin
@jwt_required()
def send_notification():
    """Enviar notificação para usuário específico (admin only)"""
    try:
        data = request.get_json()

        # Validar tipo de notificação
        try:
            notification_type = NotificationType[data["notification_type"].upper()]
        except KeyError:
            return jsonify({"error": "Tipo de notificação inválido"}), 400

        # Preparar dados da notificação
        notification_data = {
            "title": data["title"],
            "content": data["content"],
            "metadata": data.get("metadata", {}),
            "action_url": data.get("action_url"),
            "image_url": data.get("image_url"),
        }

        # Enviar notificação
        success = get_notification_service().send_notification(
            user_id = data["user_id"],
            notification_type = notification_type,
            data = notification_data,
            channels = data.get("channels", [NotificationChannel.IN_APP.value]),
        )

        if success:
            return jsonify({"message": "Notificação enviada com sucesso"})
        else:
            return jsonify({"error": "Falha ao enviar notificação"}), 500

    except Exception as e:
        return jsonify({"error": f"Erro ao enviar notificação: {str(e)}"}), 500


@notifications_bp.route("/broadcast", methods=["POST"])
@require_admin
@jwt_required()
def broadcast_notification():
    """Enviar notificação para todos os usuários (broadcast)"""
    try:
        data = request.get_json()

        # Validar tipo de notificação
        try:
            notification_type = NotificationType[data["notification_type"].upper()]
        except KeyError:
            return jsonify({"error": "Tipo de notificação inválido"}), 400

        # Preparar dados da notificação
        notification_data = {
            "title": data["title"],
            "content": data["content"],
            "metadata": data.get("metadata", {}),
            "action_url": data.get("action_url"),
            "image_url": data.get("image_url"),
        }

        # Enviar para todos os usuários ativos
        # TODO: Implementar query para usuários ativos
        from models.auth import User

        users = User.query.filter_by(is_active = True).all()

        sent_count = 0
        failed_count = 0

        for user in users:
            try:
                success = get_notification_service().send_notification(
                    user_id = user.id,
                    notification_type = notification_type,
                    data = notification_data,
                    channels = data.get("channels", [NotificationChannel.IN_APP.value]),
                )
                if success:
                    sent_count += 1
                else:
                    failed_count += 1
            except Exception as e:
                failed_count += 1
                print(f"Erro ao enviar para usuário {user.id}: {str(e)}")

        return jsonify(
            {
                "message": f"Broadcast concluído: {sent_count} enviadas, {failed_count} falharam",
                "sent_count": sent_count,
                "failed_count": failed_count,
                "total_users": len(users),
            }
        )

    except Exception as e:
        return jsonify({"error": f"Erro no broadcast: {str(e)}"}), 500


# Endpoints administrativos


@notifications_bp.route("/admin/templates", methods=["GET"])
@require_admin
@jwt_required()
def get_notification_templates():
    """Listar todos os templates de notificação"""
    try:
        templates = NotificationTemplate.query.all()

        return jsonify({"templates": [template.to_dict() for template in templates]})

    except Exception as e:
        return jsonify({"error": f"Erro ao buscar templates: {str(e)}"}), 500


@notifications_bp.route("/admin/templates", methods=["POST"])
@require_admin
@jwt_required()
def create_notification_template():
    """Criar novo template de notificação"""
    try:
        data = request.get_json()

        # Validar tipos
        try:
            notification_type = NotificationType[data["notification_type"].upper()]
            channel = NotificationChannel[data["channel"].upper()]
        except KeyError as e:
            return jsonify({"error": f"Tipo ou canal inválido: {str(e)}"}), 400

        template = NotificationTemplate(
            name = data["name"],
            notification_type = notification_type,
            channel = channel,
            template_content = data["template_content"],
            subject_template = data.get("subject_template"),
            variables = data.get("variables", []),
            is_active = data.get("is_active", True),
        )

        db.session.add(template)
        db.session.commit()

        return (
            jsonify(
                {
                    "message": "Template criado com sucesso",
                    "template": template.to_dict(),
                }
            ),
            201,
        )

    except Exception as e:
        return jsonify({"error": f"Erro ao criar template: {str(e)}"}), 500


@notifications_bp.route("/admin/logs", methods=["GET"])
@require_admin
@jwt_required()
def get_notification_logs():
    """Obter logs de notificações enviadas"""
    try:
        page = request.args.get("page", 1, type = int)
        per_page = min(request.args.get("per_page", 50, type = int), 200)

        # Filtros opcionais
        user_id = request.args.get("user_id", type = int)
        notification_type = request.args.get("type")
        channel = request.args.get("channel")
        status = request.args.get("status")
        date_from = request.args.get("date_from")
        date_to = request.args.get("date_to")

        query = NotificationLog.query

        # Aplicar filtros
        if user_id:
            query = query.filter_by(user_id = user_id)

        if notification_type:
            try:
                query = query.filter_by(
                    notification_type = NotificationType[notification_type.upper()]
                )
            except KeyError:
                return jsonify({"error": "Tipo de notificação inválido"}), 400

        if channel:
            try:
                query = query.filter_by(channel = NotificationChannel[channel.upper()])
            except KeyError:
                return jsonify({"error": "Canal inválido"}), 400

        if status:
            query = query.filter_by(status = status)

        if date_from:
            try:
                date_from = datetime.fromisoformat(date_from)
                query = query.filter(NotificationLog.sent_at >= date_from)
            except ValueError:
                return (
                    jsonify({"error": "Formato de data inválido para date_from"}),
                    400,
                )

        if date_to:
            try:
                date_to = datetime.fromisoformat(date_to)
                query = query.filter(NotificationLog.sent_at <= date_to)
            except ValueError:
                return jsonify({"error": "Formato de data inválido para date_to"}), 400

        # Ordenação e paginação
        query = query.order_by(NotificationLog.sent_at.desc())
        paginated = query.paginate(page = page, per_page = per_page, error_out = False)

        # Estatísticas rápidas
        total_sent = NotificationLog.query.filter_by(status="sent").count()
        total_failed = NotificationLog.query.filter_by(status="failed").count()

        return jsonify(
            {
                "logs": [log.to_dict() for log in paginated.items],
                "pagination": {
                    "page": page,
                    "per_page": per_page,
                    "total": paginated.total,
                    "pages": paginated.pages,
                    "has_next": paginated.has_next,
                    "has_prev": paginated.has_prev,
                },
                "stats": {
                    "total_sent": total_sent,
                    "total_failed": total_failed,
                    "success_rate": (
                        (total_sent / (total_sent + total_failed) * 100)
                        if (total_sent + total_failed) > 0
                        else 0
                    ),
                },
            }
        )

    except Exception as e:
        return jsonify({"error": f"Erro ao buscar logs: {str(e)}"}), 500


@notifications_bp.route("/admin/stats", methods=["GET"])
@require_admin
@jwt_required()
def get_notification_stats():
    """Obter estatísticas detalhadas de notificações"""
    try:
        # Stats por tipo
        type_stats = {}
        for notification_type in NotificationType:
            sent = NotificationLog.query.filter_by(
                notification_type = notification_type, status="sent"
            ).count()
            failed = NotificationLog.query.filter_by(
                notification_type = notification_type, status="failed"
            ).count()

            type_stats[notification_type.value] = {
                "sent": sent,
                "failed": failed,
                "total": sent + failed,
                "success_rate": (
                    (sent / (sent + failed) * 100) if (sent + failed) > 0 else 0
                ),
            }

        # Stats por canal
        channel_stats = {}
        for channel in NotificationChannel:
            sent = NotificationLog.query.filter_by(
                channel = channel, status="sent"
            ).count()
            failed = NotificationLog.query.filter_by(
                channel = channel, status="failed"
            ).count()

            channel_stats[channel.value] = {
                "sent": sent,
                "failed": failed,
                "total": sent + failed,
                "success_rate": (
                    (sent / (sent + failed) * 100) if (sent + failed) > 0 else 0
                ),
            }

        # Stats gerais
        total_notifications = Notification.query.count()
        total_unread = Notification.query.filter(Notification.read_at.is_(None)).count()
        total_logs = NotificationLog.query.count()

        return jsonify(
            {
                "general": {
                    "total_notifications": total_notifications,
                    "total_unread": total_unread,
                    "read_rate": (
                        (
                            (total_notifications - total_unread)
                            / total_notifications
                            * 100
                        )
                        if total_notifications > 0
                        else 0
                    ),
                    "total_logs": total_logs,
                },
                "by_type": type_stats,
                "by_channel": channel_stats,
            }
        )

    except Exception as e:
        return jsonify({"error": f"Erro ao buscar estatísticas: {str(e)}"}), 500


# Health check para notificações
@notifications_bp.route("/health", methods=["GET"])
@jwt_required()
def notifications_health():
    """Health check do sistema de notificações"""
    try:
        # CORREÇÃO DE SEGURANÇA: Usar text() com query parametrizada
        from sqlalchemy import text
        db.session.execute(text("SELECT 1"))

        # Verificar configuração do serviço
        config_status = get_notification_service().get_health_status()

        return jsonify(
            {
                "status": "healthy",
                "database": "connected",
                "notification_service": config_status,
                "timestamp": datetime.utcnow().isoformat(),
            }
        )

    except Exception as e:
        return (
            jsonify(
                {
                    "status": "unhealthy",
                    "error": str(e),
                    "timestamp": datetime.utcnow().isoformat(),
                }
            ),
            500,
        )
