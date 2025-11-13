"""
Rotas para o sistema de CRM Avançado
Pipeline de Vendas, Funil de Conversão, Automações, Lead Scoring
"""

from datetime import datetime, timedelta
from decimal import Decimal
from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity, get_jwt
from sqlalchemy import desc, func, and_, or_
from sqlalchemy.exc import SQLAlchemyError

from database import db
from models import (
    SalesPipeline, PipelineStage, Deal, DealActivity, DealNote,
    SalesFunnel, MarketingAutomation, LeadScore,
    Lead, Customer, Contact, User
)
from utils.validators import validate_required_fields

crm_bp = Blueprint('crm', __name__)


# ================ PIPELINES DE VENDAS ================

@crm_bp.route('/pipelines', methods=['GET'])
@jwt_required()
def get_pipelines():
    """Listar pipelines de vendas"""
    try:
        pipelines = SalesPipeline.query.filter_by(is_active=True).all()
        return jsonify({
            'success': True,
            'pipelines': [p.to_dict() for p in pipelines]
        }), 200
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500


@crm_bp.route('/pipelines', methods=['POST'])
@jwt_required()
def create_pipeline():
    """Criar pipeline de vendas (admin)"""
    try:
        claims = get_jwt()
        if not claims.get('is_admin'):
            return jsonify({'success': False, 'error': 'Acesso negado'}), 403

        data = request.get_json()

        validation = validate_required_fields(data, ['name'])
        if not validation['valid']:
            return jsonify({'success': False, 'error': validation['message']}), 400

        pipeline = SalesPipeline(
            name=data['name'],
            description=data.get('description'),
            type=data.get('type', 'sales'),
            is_default=data.get('is_default', False),
            probability_enabled=data.get('probability_enabled', True),
            is_active=True
        )
        db.session.add(pipeline)
        db.session.flush()

        # Criar estágios padrão se fornecidos
        if 'stages' in data:
            for idx, stage_data in enumerate(data['stages'], 1):
                stage = PipelineStage(
                    pipeline_id=pipeline.id,
                    name=stage_data['name'],
                    description=stage_data.get('description'),
                    order=idx,
                    probability=stage_data.get('probability', idx * 20),
                    color=stage_data.get('color'),
                    is_won=stage_data.get('is_won', False),
                    is_lost=stage_data.get('is_lost', False)
                )
                db.session.add(stage)

        db.session.commit()

        return jsonify({
            'success': True,
            'message': 'Pipeline criado com sucesso',
            'pipeline': pipeline.to_dict()
        }), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'error': str(e)}), 500


# ================ ESTÁGIOS DO PIPELINE ================

@crm_bp.route('/pipelines/<pipeline_id>/stages', methods=['GET'])
@jwt_required()
def get_pipeline_stages(pipeline_id):
    """Listar estágios de um pipeline"""
    try:
        stages = PipelineStage.query.filter_by(pipeline_id=pipeline_id).order_by(PipelineStage.order).all()
        return jsonify({
            'success': True,
            'stages': [s.to_dict() for s in stages]
        }), 200
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500


@crm_bp.route('/pipelines/<pipeline_id>/stages', methods=['POST'])
@jwt_required()
def create_pipeline_stage(pipeline_id):
    """Criar estágio em um pipeline (admin)"""
    try:
        claims = get_jwt()
        if not claims.get('is_admin'):
            return jsonify({'success': False, 'error': 'Acesso negado'}), 403

        data = request.get_json()

        validation = validate_required_fields(data, ['name', 'order'])
        if not validation['valid']:
            return jsonify({'success': False, 'error': validation['message']}), 400

        stage = PipelineStage(
            pipeline_id=pipeline_id,
            name=data['name'],
            description=data.get('description'),
            order=int(data['order']),
            probability=int(data.get('probability', 0)),
            color=data.get('color'),
            is_won=data.get('is_won', False),
            is_lost=data.get('is_lost', False),
            auto_actions=data.get('auto_actions')
        )
        db.session.add(stage)
        db.session.commit()

        return jsonify({
            'success': True,
            'message': 'Estágio criado com sucesso',
            'stage': stage.to_dict()
        }), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'error': str(e)}), 500


# ================ NEGÓCIOS (DEALS) ================

@crm_bp.route('/deals', methods=['GET'])
@jwt_required()
def get_deals():
    """Listar negócios"""
    try:
        user_id = get_jwt_identity()
        claims = get_jwt()

        # Filtros
        pipeline_id = request.args.get('pipeline_id')
        stage_id = request.args.get('stage_id')
        status = request.args.get('status', 'open')
        owner_id = request.args.get('owner_id')

        query = Deal.query

        if pipeline_id:
            query = query.filter_by(pipeline_id=pipeline_id)
        if stage_id:
            query = query.filter_by(stage_id=stage_id)
        if status:
            query = query.filter_by(status=status)

        # Se não for admin, ver apenas seus deals
        if not claims.get('is_admin'):
            if owner_id:
                query = query.filter_by(owner_id=owner_id)
            else:
                query = query.filter_by(owner_id=user_id)
        elif owner_id:
            query = query.filter_by(owner_id=owner_id)

        query = query.order_by(desc(Deal.created_at))

        # Paginação
        page = int(request.args.get('page', 1))
        per_page = int(request.args.get('per_page', 20))
        pagination = query.paginate(page=page, per_page=per_page, error_out=False)

        return jsonify({
            'success': True,
            'deals': [d.to_dict() for d in pagination.items],
            'total': pagination.total,
            'pages': pagination.pages,
            'current_page': page
        }), 200
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500


@crm_bp.route('/deals', methods=['POST'])
@jwt_required()
def create_deal():
    """Criar negócio"""
    try:
        user_id = get_jwt_identity()
        data = request.get_json()

        validation = validate_required_fields(data, ['title', 'pipeline_id', 'stage_id'])
        if not validation['valid']:
            return jsonify({'success': False, 'error': validation['message']}), 400

        # Buscar estágio para pegar probabilidade padrão
        stage = PipelineStage.query.get(data['stage_id'])
        if not stage:
            return jsonify({'success': False, 'error': 'Estágio não encontrado'}), 404

        deal = Deal(
            title=data['title'],
            description=data.get('description'),
            customer_id=data.get('customer_id'),
            lead_id=data.get('lead_id'),
            contact_id=data.get('contact_id'),
            pipeline_id=data['pipeline_id'],
            stage_id=data['stage_id'],
            expected_value=Decimal(str(data.get('expected_value', 0))),
            probability=data.get('probability', stage.probability),
            expected_close_date=data.get('expected_close_date'),
            owner_id=data.get('owner_id', user_id),
            source=data.get('source'),
            tags=data.get('tags'),
            next_action=data.get('next_action'),
            next_action_date=data.get('next_action_date'),
            status='open'
        )
        db.session.add(deal)
        db.session.commit()

        return jsonify({
            'success': True,
            'message': 'Negócio criado com sucesso',
            'deal': deal.to_dict()
        }), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'error': str(e)}), 500


@crm_bp.route('/deals/<deal_id>', methods=['GET'])
@jwt_required()
def get_deal(deal_id):
    """Obter detalhes de um negócio"""
    try:
        deal = Deal.query.get(deal_id)
        if not deal:
            return jsonify({'success': False, 'error': 'Negócio não encontrado'}), 404

        return jsonify({
            'success': True,
            'deal': deal.to_dict()
        }), 200
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500


@crm_bp.route('/deals/<deal_id>/move', methods=['POST'])
@jwt_required()
def move_deal(deal_id):
    """Mover negócio para outro estágio"""
    try:
        deal = Deal.query.get(deal_id)
        if not deal:
            return jsonify({'success': False, 'error': 'Negócio não encontrado'}), 404

        data = request.get_json()

        validation = validate_required_fields(data, ['stage_id'])
        if not validation['valid']:
            return jsonify({'success': False, 'error': validation['message']}), 400

        # Buscar novo estágio
        new_stage = PipelineStage.query.get(data['stage_id'])
        if not new_stage:
            return jsonify({'success': False, 'error': 'Estágio não encontrado'}), 404

        # Atualizar deal
        deal.stage_id = new_stage.id
        deal.probability = new_stage.probability
        deal.moved_to_stage_at = datetime.utcnow()

        # Se estágio é ganho ou perdido, atualizar status
        if new_stage.is_won:
            deal.status = 'won'
            deal.actual_close_date = datetime.utcnow().date()
            deal.actual_value = deal.expected_value
        elif new_stage.is_lost:
            deal.status = 'lost'
            deal.actual_close_date = datetime.utcnow().date()
            deal.lost_reason = data.get('lost_reason')

        db.session.commit()

        return jsonify({
            'success': True,
            'message': 'Negócio movido com sucesso',
            'deal': deal.to_dict()
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'error': str(e)}), 500


@crm_bp.route('/deals/<deal_id>/win', methods=['POST'])
@jwt_required()
def win_deal(deal_id):
    """Marcar negócio como ganho"""
    try:
        deal = Deal.query.get(deal_id)
        if not deal:
            return jsonify({'success': False, 'error': 'Negócio não encontrado'}), 404

        data = request.get_json()

        deal.status = 'won'
        deal.actual_close_date = datetime.utcnow().date()
        deal.actual_value = Decimal(str(data.get('actual_value', deal.expected_value)))

        db.session.commit()

        return jsonify({
            'success': True,
            'message': 'Negócio marcado como ganho',
            'deal': deal.to_dict()
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'error': str(e)}), 500


@crm_bp.route('/deals/<deal_id>/lose', methods=['POST'])
@jwt_required()
def lose_deal(deal_id):
    """Marcar negócio como perdido"""
    try:
        deal = Deal.query.get(deal_id)
        if not deal:
            return jsonify({'success': False, 'error': 'Negócio não encontrado'}), 404

        data = request.get_json()

        deal.status = 'lost'
        deal.actual_close_date = datetime.utcnow().date()
        deal.lost_reason = data.get('lost_reason')

        db.session.commit()

        return jsonify({
            'success': True,
            'message': 'Negócio marcado como perdido',
            'deal': deal.to_dict()
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'error': str(e)}), 500


# ================ ATIVIDADES ================

@crm_bp.route('/deals/<deal_id>/activities', methods=['GET'])
@jwt_required()
def get_deal_activities(deal_id):
    """Listar atividades de um negócio"""
    try:
        activities = DealActivity.query.filter_by(deal_id=deal_id).order_by(desc(DealActivity.created_at)).all()
        return jsonify({
            'success': True,
            'activities': [a.to_dict() for a in activities]
        }), 200
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500


@crm_bp.route('/deals/<deal_id>/activities', methods=['POST'])
@jwt_required()
def create_deal_activity(deal_id):
    """Criar atividade em um negócio"""
    try:
        user_id = get_jwt_identity()
        data = request.get_json()

        validation = validate_required_fields(data, ['type', 'subject'])
        if not validation['valid']:
            return jsonify({'success': False, 'error': validation['message']}), 400

        activity = DealActivity(
            deal_id=deal_id,
            type=data['type'],
            subject=data['subject'],
            description=data.get('description'),
            scheduled_at=data.get('scheduled_at'),
            assigned_to=data.get('assigned_to', user_id),
            created_by=user_id,
            status='pending'
        )
        db.session.add(activity)
        db.session.commit()

        return jsonify({
            'success': True,
            'message': 'Atividade criada com sucesso',
            'activity': activity.to_dict()
        }), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'error': str(e)}), 500


@crm_bp.route('/activities/<activity_id>/complete', methods=['POST'])
@jwt_required()
def complete_activity(activity_id):
    """Marcar atividade como concluída"""
    try:
        activity = DealActivity.query.get(activity_id)
        if not activity:
            return jsonify({'success': False, 'error': 'Atividade não encontrada'}), 404

        activity.status = 'completed'
        activity.completed_at = datetime.utcnow()

        db.session.commit()

        return jsonify({
            'success': True,
            'message': 'Atividade marcada como concluída',
            'activity': activity.to_dict()
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'error': str(e)}), 500


# ================ NOTAS ================

@crm_bp.route('/deals/<deal_id>/notes', methods=['GET'])
@jwt_required()
def get_deal_notes(deal_id):
    """Listar notas de um negócio"""
    try:
        notes = DealNote.query.filter_by(deal_id=deal_id).order_by(desc(DealNote.created_at)).all()
        return jsonify({
            'success': True,
            'notes': [n.to_dict() for n in notes]
        }), 200
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500


@crm_bp.route('/deals/<deal_id>/notes', methods=['POST'])
@jwt_required()
def create_deal_note(deal_id):
    """Criar nota em um negócio"""
    try:
        user_id = get_jwt_identity()
        data = request.get_json()

        validation = validate_required_fields(data, ['content'])
        if not validation['valid']:
            return jsonify({'success': False, 'error': validation['message']}), 400

        note = DealNote(
            deal_id=deal_id,
            content=data['content'],
            created_by=user_id
        )
        db.session.add(note)
        db.session.commit()

        return jsonify({
            'success': True,
            'message': 'Nota criada com sucesso',
            'note': note.to_dict()
        }), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'error': str(e)}), 500


# ================ FUNIL DE VENDAS (ANALYTICS) ================

@crm_bp.route('/sales-funnel', methods=['GET'])
@jwt_required()
def get_sales_funnel():
    """Obter análise do funil de vendas"""
    try:
        pipeline_id = request.args.get('pipeline_id')
        start_date = request.args.get('start_date')
        end_date = request.args.get('end_date')

        if not all([pipeline_id, start_date, end_date]):
            return jsonify({
                'success': False,
                'error': 'pipeline_id, start_date e end_date são obrigatórios'
            }), 400

        # Buscar ou criar análise
        start = datetime.fromisoformat(start_date).date()
        end = datetime.fromisoformat(end_date).date()

        funnel = SalesFunnel.query.filter(
            SalesFunnel.pipeline_id == pipeline_id,
            SalesFunnel.start_date == start,
            SalesFunnel.end_date == end
        ).first()

        if not funnel:
            # Criar nova análise
            funnel = SalesFunnel(
                pipeline_id=pipeline_id,
                start_date=start,
                end_date=end
            )

            # Calcular métricas
            deals = Deal.query.filter(
                Deal.pipeline_id == pipeline_id,
                Deal.created_at >= datetime.combine(start, datetime.min.time()),
                Deal.created_at <= datetime.combine(end, datetime.max.time())
            ).all()

            funnel.total_leads = len(deals)
            funnel.won_deals = len([d for d in deals if d.status == 'won'])
            funnel.lost_deals = len([d for d in deals if d.status == 'lost'])

            funnel.total_value = sum([d.expected_value for d in deals if d.expected_value], Decimal('0'))
            funnel.won_value = sum([d.actual_value for d in deals if d.status == 'won' and d.actual_value], Decimal('0'))
            funnel.lost_value = sum([d.expected_value for d in deals if d.status == 'lost' and d.expected_value], Decimal('0'))

            # Taxas de conversão
            if funnel.total_leads > 0:
                funnel.closing_rate = Decimal(funnel.won_deals) / Decimal(funnel.total_leads) * 100

            db.session.add(funnel)
            db.session.commit()

        return jsonify({
            'success': True,
            'funnel': funnel.to_dict()
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'error': str(e)}), 500


# ================ AUTOMAÇÕES DE MARKETING ================

@crm_bp.route('/automations', methods=['GET'])
@jwt_required()
def get_automations():
    """Listar automações de marketing"""
    try:
        automations = MarketingAutomation.query.all()
        return jsonify({
            'success': True,
            'automations': [a.to_dict() for a in automations]
        }), 200
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500


@crm_bp.route('/automations', methods=['POST'])
@jwt_required()
def create_automation():
    """Criar automação de marketing (admin)"""
    try:
        claims = get_jwt()
        if not claims.get('is_admin'):
            return jsonify({'success': False, 'error': 'Acesso negado'}), 403

        user_id = get_jwt_identity()
        data = request.get_json()

        validation = validate_required_fields(data, ['name', 'type', 'trigger_event', 'actions'])
        if not validation['valid']:
            return jsonify({'success': False, 'error': validation['message']}), 400

        automation = MarketingAutomation(
            name=data['name'],
            description=data.get('description'),
            type=data['type'],
            trigger_event=data['trigger_event'],
            trigger_conditions=data.get('trigger_conditions'),
            actions=data['actions'],
            is_active=data.get('is_active', True),
            created_by=user_id
        )
        db.session.add(automation)
        db.session.commit()

        return jsonify({
            'success': True,
            'message': 'Automação criada com sucesso',
            'automation': automation.to_dict()
        }), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'error': str(e)}), 500


# ================ LEAD SCORING ================

@crm_bp.route('/lead-scores', methods=['GET'])
@jwt_required()
def get_lead_scores():
    """Listar pontuações de leads"""
    try:
        # Filtros
        qualification = request.args.get('qualification')

        query = LeadScore.query

        if qualification:
            query = query.filter_by(qualification=qualification)

        query = query.order_by(desc(LeadScore.total_score))

        scores = query.all()

        return jsonify({
            'success': True,
            'scores': [s.to_dict() for s in scores]
        }), 200
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500


@crm_bp.route('/leads/<lead_id>/score', methods=['GET'])
@jwt_required()
def get_lead_score(lead_id):
    """Obter pontuação de um lead"""
    try:
        score = LeadScore.query.filter_by(lead_id=lead_id).first()

        if not score:
            return jsonify({
                'success': True,
                'score': None,
                'message': 'Lead ainda não possui pontuação'
            }), 200

        return jsonify({
            'success': True,
            'score': score.to_dict()
        }), 200
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500


@crm_bp.route('/leads/<lead_id>/score', methods=['POST'])
@jwt_required()
def calculate_lead_score(lead_id):
    """Calcular/atualizar pontuação de lead"""
    try:
        lead = Lead.query.get(lead_id)
        if not lead:
            return jsonify({'success': False, 'error': 'Lead não encontrado'}), 404

        # Buscar ou criar score
        score = LeadScore.query.filter_by(lead_id=lead_id).first()
        if not score:
            score = LeadScore(lead_id=lead_id)
            db.session.add(score)

        # Calcular pontuação demográfica (simplificado)
        demographic = 0
        if lead.company:
            demographic += 20
        if lead.position:
            demographic += 15
        if lead.industry:
            demographic += 10

        score.demographic_score = demographic

        # Pontuação comportamental (simplificado)
        behavioral = 0
        # Aqui você adicionaria lógica baseada em interações, downloads, emails, etc.
        score.behavioral_score = behavioral

        # Total
        score.total_score = demographic + behavioral

        # Classificação
        if score.total_score >= 80:
            score.grade = 'A'
            score.qualification = 'hot'
        elif score.total_score >= 60:
            score.grade = 'B'
            score.qualification = 'warm'
        elif score.total_score >= 40:
            score.grade = 'C'
            score.qualification = 'warm'
        else:
            score.grade = 'D'
            score.qualification = 'cold'

        db.session.commit()

        return jsonify({
            'success': True,
            'message': 'Pontuação calculada com sucesso',
            'score': score.to_dict()
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'error': str(e)}), 500
