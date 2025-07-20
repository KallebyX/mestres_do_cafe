from datetime import datetime

from flask import Blueprint, jsonify, request

from database import db
from models.customers import Contact, Lead

leads_bp = Blueprint("leads", __name__, url_prefix="/api/leads")


@leads_bp.route("/", methods=["GET"])
def get_leads():
    """Lista todos os leads"""
    try:
        page = request.args.get("page", 1, type=int)
        per_page = request.args.get("per_page", 10, type=int)
        status = request.args.get("status")
        source = request.args.get("source")

        query = Lead.query

        if status:
            query = query.filter_by(status=status)
        if source:
            query = query.filter_by(source=source)

        leads = query.order_by(Lead.created_at.desc()).paginate(
            page=page, per_page=per_page, error_out=False
        )

        return jsonify(
            {
                "leads": [lead.to_dict() for lead in leads.items],
                "pagination": {
                    "page": leads.page,
                    "pages": leads.pages,
                    "total": leads.total,
                    "has_next": leads.has_next,
                    "has_prev": leads.has_prev,
                },
            }
        )

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@leads_bp.route("/", methods=["POST"])
def create_lead():
    """Cria um novo lead"""
    try:
        data = request.get_json()

        required_fields = ["name", "email"]
        for field in required_fields:
            if field not in data:
                return jsonify({"error": f"Campo obrigatório: {field}"}), 400

        # Verificar se email já existe
        existing_lead = Lead.query.filter_by(email=data["email"]).first()
        if existing_lead:
            return jsonify({"error": "Email já cadastrado"}), 400

        lead = Lead(
            name=data["name"],
            email=data["email"],
            phone=data.get("phone"),
            source=data.get("source", "website"),
            notes=data.get("notes"),
            interest_level=data.get("interest_level", "medium"),
        )

        db.session.add(lead)
        db.session.commit()

        return (
            jsonify({"message": "Lead criado com sucesso", "lead": lead.to_dict()}),
            201,
        )

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500


@leads_bp.route("/<lead_id>", methods=["GET"])
def get_lead(lead_id):
    """Obtém detalhes de um lead"""
    try:
        lead = Lead.query.get(lead_id)
        if not lead:
            return jsonify({"error": "Lead não encontrado"}), 404

        return jsonify({"lead": lead.to_dict()})

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@leads_bp.route("/<lead_id>", methods=["PUT"])
def update_lead(lead_id):
    """Atualiza um lead"""
    try:
        lead = Lead.query.get(lead_id)
        if not lead:
            return jsonify({"error": "Lead não encontrado"}), 404

        data = request.get_json()

        # Atualizar campos
        for field in [
            "name",
            "email",
            "phone",
            "source",
            "notes",
            "interest_level",
            "status",
        ]:
            if field in data:
                setattr(lead, field, data[field])

        lead.updated_at = datetime.utcnow()
        db.session.commit()

        return jsonify(
            {"message": "Lead atualizado com sucesso", "lead": lead.to_dict()}
        )

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500


@leads_bp.route("/<lead_id>/convert", methods=["POST"])
def convert_lead(lead_id):
    """Converte lead em cliente"""
    try:
        lead = Lead.query.get(lead_id)
        if not lead:
            return jsonify({"error": "Lead não encontrado"}), 404

        if lead.status == "converted":
            return jsonify({"error": "Lead já foi convertido"}), 400

        # Atualizar status
        lead.status = "converted"
        lead.converted_at = datetime.utcnow()
        lead.updated_at = datetime.utcnow()

        db.session.commit()

        return jsonify(
            {"message": "Lead convertido com sucesso", "lead": lead.to_dict()}
        )

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500


# ===========================================
# CONTATOS
# ===========================================


@leads_bp.route("/<lead_id>/contacts", methods=["GET"])
def get_lead_contacts(lead_id):
    """Lista contatos de um lead"""
    try:
        contacts = Contact.query.filter_by(lead_id=lead_id).all()
        return jsonify({"contacts": [contact.to_dict() for contact in contacts]})

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@leads_bp.route("/<lead_id>/contacts", methods=["POST"])
def create_contact(lead_id):
    """Cria um novo contato para um lead"""
    try:
        data = request.get_json()

        required_fields = ["contact_type", "notes"]
        for field in required_fields:
            if field not in data:
                return jsonify({"error": f"Campo obrigatório: {field}"}), 400

        contact = Contact(
            lead_id=lead_id,
            contact_type=data["contact_type"],
            notes=data["notes"],
            outcome=data.get("outcome"),
            follow_up_date=(
                datetime.strptime(data["follow_up_date"], "%Y-%m-%d").date()
                if data.get("follow_up_date")
                else None
            ),
        )

        db.session.add(contact)
        db.session.commit()

        return (
            jsonify(
                {"message": "Contato criado com sucesso", "contact": contact.to_dict()}
            ),
            201,
        )

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500


@leads_bp.route("/analytics", methods=["GET"])
def get_leads_analytics():
    """Estatísticas dos leads"""
    try:
        total_leads = Lead.query.count()
        converted_leads = Lead.query.filter_by(status="converted").count()
        active_leads = Lead.query.filter_by(status="active").count()

        # Leads por fonte
        leads_by_source = (
            db.session.query(Lead.source, db.func.count(Lead.id))
            .group_by(Lead.source)
            .all()
        )

        # Taxa de conversão
        conversion_rate = (
            (converted_leads / total_leads * 100) if total_leads > 0 else 0
        )

        return jsonify(
            {
                "total_leads": total_leads,
                "converted_leads": converted_leads,
                "active_leads": active_leads,
                "conversion_rate": round(conversion_rate, 2),
                "leads_by_source": [
                    {"source": source, "count": count}
                    for source, count in leads_by_source
                ],
            }
        )

    except Exception as e:
        return jsonify({"error": str(e)}), 500
