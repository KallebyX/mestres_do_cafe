from datetime import datetime
import uuid
import json

from flask import Blueprint, jsonify, request
from sqlalchemy import desc

from database import db
from models.newsletter import (
    Newsletter,
    NewsletterSubscriber,
    NewsletterCampaign,
    NewsletterTemplate,
)

newsletter_bp = Blueprint("newsletter", __name__, url_prefix="/api/newsletter")


def convert_to_uuid(id_string):
    """Convert string ID to UUID object safely"""
    try:
        return uuid.UUID(id_string)
    except (ValueError, TypeError):
        return None


@newsletter_bp.route("/", methods=["GET"])
def newsletter_home():
    """Informações sobre o sistema de newsletter"""
    return jsonify({
        "message": "Sistema de Newsletter - Mestres do Café",
        "endpoints": {
            "subscribe": "/subscribe",
            "unsubscribe": "/unsubscribe",
            "subscribers": "/subscribers",
            "campaigns": "/campaigns",
            "templates": "/templates",
            "analytics": "/analytics"
        }
    })


@newsletter_bp.route("/subscribe", methods=["POST"])
def subscribe():
    """Inscrever-se na newsletter"""
    try:
        data = request.get_json()
        
        if "email" not in data:
            return jsonify({"error": "Email obrigatório"}), 400
        
        email = data["email"].lower().strip()
        
        # Verificar se email já está inscrito
        existing = NewsletterSubscriber.query.filter_by(email=email).first()
        if existing:
            if existing.is_subscribed:
                return jsonify({"message": "Email já inscrito"}), 200
            else:
                # Reativar inscrição
                existing.is_subscribed = True
                existing.updated_at = datetime.utcnow()
                db.session.commit()
                return jsonify({"message": "Inscrição reativada"}), 200
        
        # Criar nova inscrição
        # Convert preferences dict to JSON string for SQLite compatibility
        preferences = data.get("preferences", {})
        preferences_json = json.dumps(preferences) if preferences else "{}"
        
        subscriber = NewsletterSubscriber(
            email=email,
            name=data.get("name"),
            phone=data.get("phone"),
            preferences=preferences_json,
            is_subscribed=True,
            source=data.get("source", "web")
        )
        
        db.session.add(subscriber)
        db.session.commit()
        
        return jsonify({
            "message": "Inscrição realizada com sucesso",
            "subscriber": subscriber.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500


@newsletter_bp.route("/unsubscribe", methods=["POST"])
def unsubscribe():
    """Cancelar inscrição na newsletter"""
    try:
        data = request.get_json()
        
        if "email" not in data:
            return jsonify({"error": "Email obrigatório"}), 400
        
        email = data["email"].lower().strip()
        
        subscriber = NewsletterSubscriber.query.filter_by(
            email=email, is_subscribed=True
        ).first()
        
        if not subscriber:
            return jsonify({"error": "Email não encontrado"}), 404
        
        subscriber.is_subscribed = False
        subscriber.updated_at = datetime.utcnow()
        
        db.session.commit()
        
        return jsonify({"message": "Inscrição cancelada com sucesso"})
        
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500


@newsletter_bp.route("/subscribers", methods=["GET"])
def get_subscribers():
    """Listar assinantes da newsletter"""
    try:
        page = request.args.get("page", 1, type=int)
        per_page = request.args.get("per_page", 20, type=int)
        status = request.args.get("status", "active")
        
        query = NewsletterSubscriber.query
        
        if status == "active":
            query = query.filter(NewsletterSubscriber.is_subscribed.is_(True))
        elif status == "inactive":
            query = query.filter(NewsletterSubscriber.is_subscribed.is_(False))
        
        subscribers = query.order_by(
            desc(NewsletterSubscriber.created_at)
        ).paginate(
            page=page,
            per_page=per_page,
            error_out=False
        )
        
        return jsonify({
            "subscribers": [sub.to_dict() for sub in subscribers.items],
            "pagination": {
                "page": page,
                "per_page": per_page,
                "total": subscribers.total,
                "pages": subscribers.pages
            }
        })
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@newsletter_bp.route("/templates", methods=["GET"])
def get_templates():
    """Listar templates de newsletter"""
    try:
        templates = NewsletterTemplate.query.filter_by(
            is_active=True
        ).order_by(NewsletterTemplate.name).all()
        
        return jsonify({
            "templates": [template.to_dict() for template in templates]
        })
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@newsletter_bp.route("/templates", methods=["POST"])
def create_template():
    """Criar novo template de newsletter"""
    try:
        data = request.get_json()
        required_fields = ["name", "html_content"]
        
        for field in required_fields:
            if field not in data:
                return jsonify({"error": f"Campo {field} obrigatório"}), 400
        
        template = NewsletterTemplate(
            name=data["name"],
            html_content=data["html_content"],
            text_content=data.get("text_content"),
            is_active=True
        )
        
        db.session.add(template)
        db.session.commit()
        
        return jsonify({
            "message": "Template criado com sucesso",
            "template": template.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500


@newsletter_bp.route("/templates/<template_id>", methods=["PUT"])
def update_template(template_id):
    """Atualizar template de newsletter"""
    try:
        template_uuid = convert_to_uuid(template_id)
        if not template_uuid:
            return jsonify({"error": "ID de template inválido"}), 400
            
        template = NewsletterTemplate.query.get_or_404(template_uuid)
        data = request.get_json()
        
        # Atualizar campos permitidos
        allowed_fields = [
            "name", "html_content", "text_content", "is_active"
        ]
        
        for field in allowed_fields:
            if field in data:
                setattr(template, field, data[field])
        
        template.updated_at = datetime.utcnow()
        db.session.commit()
        
        return jsonify({
            "message": "Template atualizado com sucesso",
            "template": template.to_dict()
        })
        
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500


@newsletter_bp.route("/campaigns", methods=["GET"])
def get_campaigns():
    """Listar campanhas de newsletter"""
    try:
        page = request.args.get("page", 1, type=int)
        per_page = request.args.get("per_page", 10, type=int)
        status = request.args.get("status")
        
        query = NewsletterCampaign.query
        
        if status:
            query = query.filter(NewsletterCampaign.status == status)
        
        campaigns = query.order_by(
            desc(NewsletterCampaign.created_at)
        ).paginate(
            page=page,
            per_page=per_page,
            error_out=False
        )
        
        return jsonify({
            "campaigns": [campaign.to_dict() for campaign in campaigns.items],
            "pagination": {
                "page": page,
                "per_page": per_page,
                "total": campaigns.total,
                "pages": campaigns.pages
            }
        })
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@newsletter_bp.route("/campaigns", methods=["POST"])
def create_campaign():
    """Criar nova campanha de newsletter"""
    try:
        data = request.get_json()
        required_fields = ["name", "subject", "template_id"]
        
        for field in required_fields:
            if field not in data:
                return jsonify({"error": f"Campo {field} obrigatório"}), 400
        
        # Verificar se template existe
        template = NewsletterTemplate.query.get(data["template_id"])
        if not template:
            return jsonify({"error": "Template não encontrado"}), 404
        
        campaign = NewsletterCampaign(
            name=data["name"],
            subject=data["subject"],
            template_id=data["template_id"],
            segment_criteria=data.get("segment_criteria", {}),
            scheduled_at=(
                datetime.fromisoformat(data["scheduled_at"])
                if data.get("scheduled_at") else None
            ),
            status="draft"
        )
        
        db.session.add(campaign)
        db.session.commit()
        
        return jsonify({
            "message": "Campanha criada com sucesso",
            "campaign": campaign.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500


@newsletter_bp.route("/campaigns/<campaign_id>", methods=["PUT"])
def update_campaign(campaign_id):
    """Atualizar campanha de newsletter"""
    try:
        campaign_uuid = convert_to_uuid(campaign_id)
        if not campaign_uuid:
            return jsonify({"error": "ID de campanha inválido"}), 400
            
        campaign = NewsletterCampaign.query.get_or_404(campaign_uuid)
        data = request.get_json()
        
        # Não permitir edição de campanhas já enviadas
        if campaign.status == "sent":
            return jsonify({"error": "Campanha já enviada"}), 400
        
        # Atualizar campos permitidos
        allowed_fields = [
            "name", "subject", "template_id",
            "segment_criteria", "scheduled_at"
        ]
        
        for field in allowed_fields:
            if field in data:
                if field == "scheduled_at" and data[field]:
                    setattr(
                        campaign, field, datetime.fromisoformat(data[field])
                    )
                else:
                    setattr(campaign, field, data[field])
        
        campaign.updated_at = datetime.utcnow()
        db.session.commit()
        
        return jsonify({
            "message": "Campanha atualizada com sucesso",
            "campaign": campaign.to_dict()
        })
        
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500


@newsletter_bp.route("/campaigns/<campaign_id>/send", methods=["POST"])
def send_campaign(campaign_id):
    """Enviar campanha de newsletter"""
    try:
        campaign_uuid = convert_to_uuid(campaign_id)
        if not campaign_uuid:
            return jsonify({"error": "ID de campanha inválido"}), 400
            
        campaign = NewsletterCampaign.query.get_or_404(campaign_uuid)
        
        if campaign.status != "draft":
            return jsonify({"error": "Campanha não está em rascunho"}), 400
        
        # Obter lista de assinantes ativos
        subscribers = NewsletterSubscriber.query.filter_by(
            is_subscribed=True
        ).all()
        
        if not subscribers:
            return jsonify({"error": "Nenhum assinante ativo"}), 400
        
        # Marcar campanha como enviada
        campaign.status = "sent"
        campaign.sent_at = datetime.utcnow()
        campaign.total_sent = len(subscribers)
        
        # Aqui você implementaria a lógica de envio de email
        # Por exemplo, usando Celery para processar em background
        
        db.session.commit()
        
        return jsonify({
            "message": "Campanha enviada com sucesso",
            "sent_count": len(subscribers),
            "campaign": campaign.to_dict()
        })
        
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500


@newsletter_bp.route("/campaigns/<campaign_id>/preview", methods=["GET"])
def preview_campaign(campaign_id):
    """Pré-visualizar campanha de newsletter"""
    try:
        campaign_uuid = convert_to_uuid(campaign_id)
        if not campaign_uuid:
            return jsonify({"error": "ID de campanha inválido"}), 400
            
        campaign = NewsletterCampaign.query.get_or_404(campaign_uuid)
        
        # Obter template
        template = NewsletterTemplate.query.get_or_404(campaign.template_id)
        
        # Aplicar variáveis de conteúdo se houver
        html_content = template.html_content
        text_content = template.text_content
        
        if campaign.segment_criteria:
            # Aqui você pode aplicar lógica de segmentação se necessário
            pass
        
        return jsonify({
            "preview": {
                "subject": campaign.subject,
                "html_content": html_content,
                "text_content": text_content
            }
        })
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@newsletter_bp.route("/newsletters", methods=["GET"])
def get_newsletters():
    """Listar newsletters enviadas"""
    try:
        page = request.args.get("page", 1, type=int)
        per_page = request.args.get("per_page", 10, type=int)
        
        newsletters = Newsletter.query.order_by(
            desc(Newsletter.sent_at)
        ).paginate(
            page=page,
            per_page=per_page,
            error_out=False
        )
        
        return jsonify({
            "newsletters": [
                newsletter.to_dict() for newsletter in newsletters.items
            ],
            "pagination": {
                "page": page,
                "per_page": per_page,
                "total": newsletters.total,
                "pages": newsletters.pages
            }
        })
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@newsletter_bp.route("/analytics", methods=["GET"])
def get_analytics():
    """Obter analytics da newsletter"""
    try:
        # Estatísticas de assinantes
        total_subscribers = NewsletterSubscriber.query.count()
        active_subscribers = NewsletterSubscriber.query.filter_by(
            is_subscribed=True
        ).count()
        
        # Estatísticas de campanhas
        total_campaigns = NewsletterCampaign.query.count()
        sent_campaigns = NewsletterCampaign.query.filter_by(
            status="sent"
        ).count()
        
        # Estatísticas de templates
        total_templates = NewsletterTemplate.query.count()
        active_templates = NewsletterTemplate.query.filter_by(
            is_active=True
        ).count()
        
        return jsonify({
            "analytics": {
                "subscribers": {
                    "total": total_subscribers,
                    "active": active_subscribers,
                    "inactive": total_subscribers - active_subscribers
                },
                "campaigns": {
                    "total": total_campaigns,
                    "sent": sent_campaigns,
                    "draft": total_campaigns - sent_campaigns
                },
                "templates": {
                    "total": total_templates,
                    "active": active_templates,
                    "inactive": total_templates - active_templates
                }
            }
        })
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@newsletter_bp.route("/export/subscribers", methods=["GET"])
def export_subscribers():
    """Exportar lista de assinantes"""
    try:
        status = request.args.get("status", "active")
        
        query = NewsletterSubscriber.query
        
        if status == "active":
            query = query.filter(NewsletterSubscriber.is_subscribed.is_(True))
        elif status == "inactive":
            query = query.filter(NewsletterSubscriber.is_subscribed.is_(False))
        
        subscribers = query.all()
        
        export_data = []
        for subscriber in subscribers:
            export_data.append({
                "email": subscriber.email,
                "name": subscriber.name,
                "phone": subscriber.phone,
                "created_at": (
                    subscriber.created_at.isoformat()
                    if subscriber.created_at else None
                ),
                "updated_at": (
                    subscriber.updated_at.isoformat()
                    if subscriber.updated_at else None
                ),
                "is_subscribed": subscriber.is_subscribed
            })
        
        return jsonify({
            "export": export_data,
            "total": len(export_data)
        })
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500