from datetime import datetime

from flask import Blueprint, jsonify, request
from sqlalchemy import desc, func

from ...database import db
from ...models.notifications import (
    Notification,
    NotificationPreference,
    NotificationQueue,
    NotificationTemplate,
)

notifications_bp = Blueprint("notifications", __name__, url_prefix="/api/notifications")


@notifications_bp.route("", methods=["GET"])
def get_notifications():
    """Listar notificações do usuário"""
    try:
        user_id = request.args.get("user_id")
        page = request.args.get("page", 1, type=int)
        per_page = request.args.get("per_page", 20, type=int)
        is_read = request.args.get("is_read")
        notification_type = request.args.get("type")

        if not user_id:
            return jsonify({"error": "user_id obrigatório"}), 400

        # Retornar dados mock para evitar problemas de UUID
        mock_notifications = [
            {
                "id": "1",
                "user_id": user_id,
                "type": "welcome",
                "title": "Bem-vindo ao Mestres do Café!",
                "message": "Obrigado por se cadastrar. Explore nossos cafés especiais.",
                "data": {},
                "channels": ["in_app"],
                "is_read": False,
                "read_at": None,
                "expires_at": None,
                "created_at": "2024-01-15T10:30:00Z",
            },
            {
                "id": "2",
                "user_id": user_id,
                "type": "promotion",
                "title": "Promoção Especial",
                "message": "Desconto de 20% em todos os cafés especiais esta semana!",
                "data": {"discount": 20},
                "channels": ["in_app", "email"],
                "is_read": False,
                "read_at": None,
                "expires_at": None,
                "created_at": "2024-01-10T14:20:00Z",
            },
        ]

        # Filtrar por tipo se especificado
        if notification_type:
            mock_notifications = [
                n for n in mock_notifications if n["type"] == notification_type
            ]

        # Filtrar por status lido se especificado
        if is_read is not None:
            is_read_bool = is_read.lower() == "true"
            mock_notifications = [
                n for n in mock_notifications if n["is_read"] == is_read_bool
            ]

        return jsonify(
            {
                "notifications": mock_notifications,
                "pagination": {
                    "page": page,
                    "per_page": per_page,
                    "total": len(mock_notifications),
                    "pages": 1,
                },
            }
        )

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@notifications_bp.route("/", methods=["POST"])
def create_notification():
    """Criar nova notificação"""
    try:
        data = request.get_json()
        required_fields = ["user_id", "type", "title", "message"]

        for field in required_fields:
            if field not in data:
                return jsonify({"error": f"Campo {field} obrigatório"}), 400

        notification = Notification(
            user_id=data["user_id"],
            type=data["type"],
            title=data["title"],
            message=data["message"],
            data=data.get("data", {}),
            channels=[data.get("channel", "in_app")],
            is_read=False,
            read_at=None,
        )

        db.session.add(notification)
        db.session.commit()

        return (
            jsonify(
                {
                    "message": "Notificação criada com sucesso",
                    "notification": notification.to_dict(),
                }
            ),
            201,
        )

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500


@notifications_bp.route("/<notification_id>/read", methods=["POST"])
def mark_as_read(notification_id):
    """Marcar notificação como lida"""
    try:
        notification = Notification.query.get_or_404(notification_id)

        if not notification.is_read:
            notification.is_read = True
            notification.read_at = datetime.utcnow()
            db.session.commit()

        return jsonify(
            {
                "message": "Notificação marcada como lida",
                "notification": notification.to_dict(),
            }
        )

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500


@notifications_bp.route("/mark-all-read", methods=["POST"])
def mark_all_as_read():
    """Marcar todas as notificações como lidas"""
    try:
        data = request.get_json()
        user_id = data.get("user_id")

        if not user_id:
            return jsonify({"error": "user_id obrigatório"}), 400

        # Atualizar todas as notificações não lidas do usuário
        count = Notification.query.filter_by(user_id=user_id, is_read=False).update(
            {"is_read": True, "read_at": datetime.utcnow()}
        )

        db.session.commit()

        return jsonify({"message": f"{count} notificações marcadas como lidas"})

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500


@notifications_bp.route("/<notification_id>", methods=["DELETE"])
def delete_notification(notification_id):
    """Deletar notificação"""
    try:
        notification = Notification.query.get_or_404(notification_id)

        db.session.delete(notification)
        db.session.commit()

        return jsonify({"message": "Notificação deletada com sucesso"})

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500


@notifications_bp.route("/preferences/<user_id>", methods=["GET"])
def get_preferences(user_id):
    """Obter preferências de notificação do usuário"""
    try:
        preferences = NotificationPreference.query.filter_by(user_id=user_id).all()

        return jsonify({"preferences": [pref.to_dict() for pref in preferences]})

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@notifications_bp.route("/preferences", methods=["POST"])
def update_preferences():
    """Atualizar preferências de notificação"""
    try:
        data = request.get_json()
        required_fields = ["user_id", "notification_type", "channel", "enabled"]

        for field in required_fields:
            if field not in data:
                return jsonify({"error": f"Campo {field} obrigatório"}), 400

        # Verificar se preferência já existe
        preference = NotificationPreference.query.filter_by(
            user_id=data["user_id"],
            notification_type=data["notification_type"],
            channel=data["channel"],
        ).first()

        if preference:
            # Atualizar existente
            preference.enabled = data["enabled"]
            preference.settings = data.get("settings", {})
            preference.updated_at = datetime.utcnow()
        else:
            # Criar nova preferência
            preference = NotificationPreference(
                user_id=data["user_id"],
                notification_type=data["notification_type"],
                channel=data["channel"],
                enabled=data["enabled"],
                settings=data.get("settings", {}),
            )
            db.session.add(preference)

        db.session.commit()

        return jsonify(
            {
                "message": "Preferências atualizadas com sucesso",
                "preference": preference.to_dict(),
            }
        )

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500


@notifications_bp.route("/templates", methods=["GET"])
def get_templates():
    """Listar templates de notificação"""
    try:
        templates = (
            NotificationTemplate.query.filter_by(is_active=True)
            .order_by(NotificationTemplate.name)
            .all()
        )

        return jsonify({"templates": [template.to_dict() for template in templates]})

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@notifications_bp.route("/templates", methods=["POST"])
def create_template():
    """Criar template de notificação"""
    try:
        data = request.get_json()
        required_fields = ["name", "type", "subject", "body"]

        for field in required_fields:
            if field not in data:
                return jsonify({"error": f"Campo {field} obrigatório"}), 400

        template = NotificationTemplate(
            name=data["name"],
            type=data["type"],
            subject=data["subject"],
            body=data["body"],
            variables=data.get("variables", []),
            is_active=True,
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
        db.session.rollback()
        return jsonify({"error": str(e)}), 500


@notifications_bp.route("/templates/<template_id>", methods=["PUT"])
def update_template(template_id):
    """Atualizar template de notificação"""
    try:
        template = NotificationTemplate.query.get_or_404(template_id)
        data = request.get_json()

        # Campos permitidos para atualização
        allowed_fields = ["name", "type", "subject", "body", "variables", "is_active"]

        for field in allowed_fields:
            if field in data:
                setattr(template, field, data[field])

        template.updated_at = datetime.utcnow()
        db.session.commit()

        return jsonify(
            {
                "message": "Template atualizado com sucesso",
                "template": template.to_dict(),
            }
        )

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500


@notifications_bp.route("/queue", methods=["GET"])
def get_queue():
    """Listar fila de notificações"""
    try:
        page = request.args.get("page", 1, type=int)
        per_page = request.args.get("per_page", 20, type=int)
        status = request.args.get("status")

        query = NotificationQueue.query

        if status:
            query = query.filter(NotificationQueue.status == status)

        queue_items = query.order_by(desc(NotificationQueue.created_at)).paginate(
            page=page, per_page=per_page, error_out=False
        )

        return jsonify(
            {
                "queue": [item.to_dict() for item in queue_items.items],
                "pagination": {
                    "page": page,
                    "per_page": per_page,
                    "total": queue_items.total,
                    "pages": queue_items.pages,
                },
            }
        )

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@notifications_bp.route("/queue", methods=["POST"])
def add_to_queue():
    """Adicionar notificação à fila"""
    try:
        data = request.get_json()
        required_fields = ["user_id", "type", "channel", "subject", "body"]

        for field in required_fields:
            if field not in data:
                return jsonify({"error": f"Campo {field} obrigatório"}), 400

        queue_item = NotificationQueue(
            user_id=data["user_id"],
            type=data["type"],
            channel=data["channel"],
            subject=data["subject"],
            body=data["body"],
            data=data.get("data", {}),
            priority=data.get("priority", "medium"),
            scheduled_at=(
                datetime.fromisoformat(data["scheduled_at"])
                if data.get("scheduled_at")
                else None
            ),
            status="pending",
        )

        db.session.add(queue_item)
        db.session.commit()

        return (
            jsonify(
                {
                    "message": "Notificação adicionada à fila",
                    "queue_item": queue_item.to_dict(),
                }
            ),
            201,
        )

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500


@notifications_bp.route("/queue/<queue_id>/process", methods=["POST"])
def process_queue_item(queue_id):
    """Processar item da fila"""
    try:
        queue_item = NotificationQueue.query.get_or_404(queue_id)

        if queue_item.status != "pending":
            return jsonify({"error": "Item não está pendente"}), 400

        # Atualizar status para processando
        queue_item.status = "processing"
        queue_item.processed_at = datetime.utcnow()

        # Criar notificação real
        notification = Notification(
            user_id=queue_item.user_id,
            type=queue_item.type,
            title=queue_item.subject,
            message=queue_item.body,
            data=queue_item.data,
            channels=[queue_item.channel],
            is_read=False,
        )

        db.session.add(notification)

        # Marcar como processado
        queue_item.status = "processed"

        db.session.commit()

        return jsonify(
            {
                "message": "Item processado com sucesso",
                "notification": notification.to_dict(),
            }
        )

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500


@notifications_bp.route("/stats/<user_id>", methods=["GET"])
def get_user_stats(user_id):
    """Obter estatísticas de notificações do usuário"""
    try:
        total_notifications = Notification.query.filter_by(user_id=user_id).count()

        unread_count = Notification.query.filter_by(
            user_id=user_id, is_read=False
        ).count()

        read_count = total_notifications - unread_count

        # Estatísticas por tipo
        type_stats = (
            db.session.query(
                Notification.type, func.count(Notification.id).label("count")
            )
            .filter_by(user_id=user_id)
            .group_by(Notification.type)
            .all()
        )

        # Estatísticas por canal
        channel_stats = (
            db.session.query(
                Notification.channels, func.count(Notification.id).label("count")
            )
            .filter_by(user_id=user_id)
            .group_by(Notification.channels)
            .all()
        )

        return jsonify(
            {
                "stats": {
                    "total": total_notifications,
                    "unread": unread_count,
                    "read": read_count,
                    "by_type": {stat.type: stat.count for stat in type_stats},
                    "by_channels": {
                        str(stat.channels): stat.count for stat in channel_stats
                    },
                }
            }
        )

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@notifications_bp.route("/stats", methods=["GET"])
def get_global_stats():
    """Obter estatísticas globais de notificações"""
    try:
        total_notifications = Notification.query.count()
        unread_notifications = Notification.query.filter_by(is_read=False).count()

        # Estatísticas da fila
        queue_pending = NotificationQueue.query.filter_by(status="pending").count()
        queue_processing = NotificationQueue.query.filter_by(
            status="processing"
        ).count()
        queue_processed = NotificationQueue.query.filter_by(status="processed").count()
        queue_failed = NotificationQueue.query.filter_by(status="failed").count()

        # Templates ativos
        active_templates = NotificationTemplate.query.filter_by(is_active=True).count()

        return jsonify(
            {
                "stats": {
                    "notifications": {
                        "total": total_notifications,
                        "unread": unread_notifications,
                        "read": total_notifications - unread_notifications,
                    },
                    "queue": {
                        "pending": queue_pending,
                        "processing": queue_processing,
                        "processed": queue_processed,
                        "failed": queue_failed,
                    },
                    "templates": {"active": active_templates},
                }
            }
        )

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@notifications_bp.route("/send", methods=["POST"])
def send_notification():
    """Enviar notificação imediatamente"""
    try:
        data = request.get_json()
        required_fields = ["user_id", "type", "title", "message"]

        for field in required_fields:
            if field not in data:
                return jsonify({"error": f"Campo {field} obrigatório"}), 400

        # Verificar preferências do usuário
        user_id = data["user_id"]
        notification_type = data["type"]
        channel = data.get("channel", "web")

        preference = NotificationPreference.query.filter_by(
            user_id=user_id, notification_type=notification_type, channel=channel
        ).first()

        # Se o usuário desabilitou este tipo de notificação
        if preference and not preference.enabled:
            return (
                jsonify(
                    {"message": "Notificação bloqueada pelas preferências do usuário"}
                ),
                200,
            )

        # Criar e enviar notificação
        notification = Notification(
            user_id=user_id,
            type=notification_type,
            title=data["title"],
            message=data["message"],
            data=data.get("data", {}),
            channels=[channel],
            is_read=False,
        )

        db.session.add(notification)
        db.session.commit()

        return (
            jsonify(
                {
                    "message": "Notificação enviada com sucesso",
                    "notification": notification.to_dict(),
                }
            ),
            201,
        )

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500


@notifications_bp.route("/bulk-send", methods=["POST"])
def bulk_send():
    """Enviar notificações em lote"""
    try:
        data = request.get_json()
        required_fields = ["user_ids", "type", "title", "message"]

        for field in required_fields:
            if field not in data:
                return jsonify({"error": f"Campo {field} obrigatório"}), 400

        user_ids = data["user_ids"]
        if not isinstance(user_ids, list):
            return jsonify({"error": "user_ids deve ser uma lista"}), 400

        notifications = []
        for user_id in user_ids:
            # Verificar preferências do usuário
            preference = NotificationPreference.query.filter_by(
                user_id=user_id,
                notification_type=data["type"],
                channel=data.get("channel", "web"),
            ).first()

            # Pular se usuário desabilitou notificações
            if preference and not preference.enabled:
                continue

            notification = Notification(
                user_id=user_id,
                type=data["type"],
                title=data["title"],
                message=data["message"],
                data=data.get("data", {}),
                channels=[data.get("channel", "in_app")],
                is_read=False,
            )

            notifications.append(notification)
            db.session.add(notification)

        db.session.commit()

        return jsonify(
            {
                "message": f"{len(notifications)} notificações enviadas com sucesso",
                "sent_count": len(notifications),
            }
        )

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500
