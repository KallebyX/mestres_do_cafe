from flask import Blueprint, request, jsonify
from ...models.database import (
    db, Customer, Lead, Campaign, Contact, CustomerSegment, 
    CustomerSegmentMembership, User, Order
)
from sqlalchemy import func, and_, or_
from datetime import datetime, timedelta
import json

crm_bp = Blueprint('crm', __name__)

# ===========================================
# ENDPOINTS DE CLIENTES
# ===========================================

@crm_bp.route('/customers', methods=['GET'])
def get_customers():
    try:
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 20, type=int)
        status = request.args.get('status')
        source = request.args.get('source')
        search = request.args.get('search')
        
        query = Customer.query
        
        # Filtros
        if status:
            query = query.filter(Customer.status == status)
        if source:
            query = query.filter(Customer.source == source)
        if search:
            query = query.filter(or_(
                Customer.name.ilike(f'%{search}%'),
                Customer.email.ilike(f'%{search}%'),
                Customer.phone.ilike(f'%{search}%')
            ))
        
        customers = query.order_by(Customer.created_at.desc())\
                        .paginate(page=page, per_page=per_page, error_out=False)
        
        return jsonify({
            'customers': [{
                'id': customer.id,
                'name': customer.name,
                'email': customer.email,
                'phone': customer.phone,
                'customer_type': customer.customer_type,
                'company_name': customer.company_name,
                'status': customer.status,
                'source': customer.source,
                'total_orders': customer.total_orders,
                'total_spent': float(customer.total_spent),
                'avg_order_value': float(customer.avg_order_value),
                'last_order_date': customer.last_order_date.isoformat() if customer.last_order_date else None,
                'created_at': customer.created_at.isoformat()
            } for customer in customers.items],
            'pagination': {
                'page': customers.page,
                'pages': customers.pages,
                'total': customers.total
            }
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@crm_bp.route('/customers', methods=['POST'])
def create_customer():
    try:
        data = request.get_json()
        
        # Verificar se email já existe
        existing_customer = Customer.query.filter_by(email=data.get('email')).first()
        if existing_customer:
            return jsonify({'error': 'Cliente com este email já existe'}), 400
        
        customer = Customer(
            name=data.get('name'),
            email=data.get('email'),
            phone=data.get('phone'),
            cpf_cnpj=data.get('cpf_cnpj'),
            customer_type=data.get('customer_type', 'individual'),
            company_name=data.get('company_name'),
            source=data.get('source'),
            address_street=data.get('address_street'),
            address_number=data.get('address_number'),
            address_complement=data.get('address_complement'),
            address_neighborhood=data.get('address_neighborhood'),
            address_city=data.get('address_city'),
            address_state=data.get('address_state'),
            address_cep=data.get('address_cep')
        )
        
        db.session.add(customer)
        db.session.commit()
        
        return jsonify({
            'message': 'Cliente criado com sucesso',
            'customer_id': customer.id
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@crm_bp.route('/customers/<customer_id>', methods=['GET'])
def get_customer(customer_id):
    try:
        customer = Customer.query.get(customer_id)
        if not customer:
            return jsonify({'error': 'Cliente não encontrado'}), 404
        
        # Buscar pedidos recentes
        recent_orders = Order.query.join(User).filter(
            User.email == customer.email
        ).order_by(Order.created_at.desc()).limit(5).all()
        
        # Buscar contatos recentes
        recent_contacts = Contact.query.filter_by(customer_id=customer_id)\
                                      .order_by(Contact.created_at.desc())\
                                      .limit(5).all()
        
        return jsonify({
            'customer': {
                'id': customer.id,
                'name': customer.name,
                'email': customer.email,
                'phone': customer.phone,
                'cpf_cnpj': customer.cpf_cnpj,
                'birth_date': customer.birth_date.isoformat() if customer.birth_date else None,
                'customer_type': customer.customer_type,
                'company_name': customer.company_name,
                'status': customer.status,
                'source': customer.source,
                'address': {
                    'street': customer.address_street,
                    'number': customer.address_number,
                    'complement': customer.address_complement,
                    'neighborhood': customer.address_neighborhood,
                    'city': customer.address_city,
                    'state': customer.address_state,
                    'cep': customer.address_cep
                },
                'metrics': {
                    'total_orders': customer.total_orders,
                    'total_spent': float(customer.total_spent),
                    'avg_order_value': float(customer.avg_order_value),
                    'last_order_date': customer.last_order_date.isoformat() if customer.last_order_date else None
                },
                'created_at': customer.created_at.isoformat()
            },
            'recent_orders': [{
                'id': order.id,
                'total_amount': float(order.total_amount),
                'status': order.status,
                'created_at': order.created_at.isoformat()
            } for order in recent_orders],
            'recent_contacts': [{
                'id': contact.id,
                'type': contact.type,
                'subject': contact.subject,
                'outcome': contact.outcome,
                'created_at': contact.created_at.isoformat()
            } for contact in recent_contacts]
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# ===========================================
# ENDPOINTS DE LEADS
# ===========================================

@crm_bp.route('/leads', methods=['GET'])
def get_leads():
    try:
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 20, type=int)
        status = request.args.get('status')
        assigned_to = request.args.get('assigned_to')
        
        query = Lead.query
        
        if status:
            query = query.filter(Lead.status == status)
        if assigned_to:
            query = query.filter(Lead.assigned_to == assigned_to)
        
        leads = query.order_by(Lead.created_at.desc())\
                    .paginate(page=page, per_page=per_page, error_out=False)
        
        return jsonify({
            'leads': [{
                'id': lead.id,
                'name': lead.name,
                'email': lead.email,
                'phone': lead.phone,
                'status': lead.status,
                'interest_level': lead.interest_level,
                'source': lead.source,
                'estimated_value': float(lead.estimated_value) if lead.estimated_value else None,
                'conversion_probability': lead.conversion_probability,
                'assigned_to': lead.assigned_user.name if lead.assigned_user else None,
                'next_follow_up_date': lead.next_follow_up_date.isoformat() if lead.next_follow_up_date else None,
                'created_at': lead.created_at.isoformat()
            } for lead in leads.items],
            'pagination': {
                'page': leads.page,
                'pages': leads.pages,
                'total': leads.total
            }
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@crm_bp.route('/leads', methods=['POST'])
def create_lead():
    try:
        data = request.get_json()
        
        lead = Lead(
            name=data.get('name'),
            email=data.get('email'),
            phone=data.get('phone'),
            source=data.get('source'),
            interest_level=data.get('interest_level'),
            estimated_value=data.get('estimated_value'),
            conversion_probability=data.get('conversion_probability'),
            assigned_to=data.get('assigned_to'),
            notes=data.get('notes')
        )
        
        db.session.add(lead)
        db.session.commit()
        
        return jsonify({
            'message': 'Lead criado com sucesso',
            'lead_id': lead.id
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@crm_bp.route('/leads/<lead_id>/convert', methods=['POST'])
def convert_lead(lead_id):
    try:
        lead = Lead.query.get(lead_id)
        if not lead:
            return jsonify({'error': 'Lead não encontrado'}), 404
        
        # Criar cliente a partir do lead
        customer = Customer(
            name=lead.name,
            email=lead.email,
            phone=lead.phone,
            source=lead.source
        )
        
        db.session.add(customer)
        db.session.flush()
        
        # Atualizar lead
        lead.status = 'converted'
        lead.customer_id = customer.id
        lead.converted_at = datetime.utcnow()
        
        db.session.commit()
        
        return jsonify({
            'message': 'Lead convertido com sucesso',
            'customer_id': customer.id
        })
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

# ===========================================
# ENDPOINTS DE CAMPANHAS
# ===========================================

@crm_bp.route('/campaigns', methods=['GET'])
def get_campaigns():
    try:
        campaigns = Campaign.query.order_by(Campaign.created_at.desc()).all()
        
        return jsonify({
            'campaigns': [{
                'id': campaign.id,
                'name': campaign.name,
                'type': campaign.type,
                'status': campaign.status,
                'start_date': campaign.start_date.isoformat() if campaign.start_date else None,
                'end_date': campaign.end_date.isoformat() if campaign.end_date else None,
                'metrics': {
                    'total_recipients': campaign.total_recipients,
                    'sent_count': campaign.sent_count,
                    'delivered_count': campaign.delivered_count,
                    'opened_count': campaign.opened_count,
                    'clicked_count': campaign.clicked_count,
                    'converted_count': campaign.converted_count,
                    'open_rate': (campaign.opened_count / campaign.sent_count * 100) if campaign.sent_count > 0 else 0,
                    'click_rate': (campaign.clicked_count / campaign.sent_count * 100) if campaign.sent_count > 0 else 0,
                    'conversion_rate': (campaign.converted_count / campaign.sent_count * 100) if campaign.sent_count > 0 else 0
                },
                'created_at': campaign.created_at.isoformat()
            } for campaign in campaigns]
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@crm_bp.route('/campaigns', methods=['POST'])
def create_campaign():
    try:
        data = request.get_json()
        
        campaign = Campaign(
            name=data.get('name'),
            description=data.get('description'),
            type=data.get('type'),
            subject=data.get('subject'),
            content=data.get('content'),
            start_date=datetime.fromisoformat(data.get('start_date')) if data.get('start_date') else None,
            end_date=datetime.fromisoformat(data.get('end_date')) if data.get('end_date') else None
        )
        
        db.session.add(campaign)
        db.session.commit()
        
        return jsonify({
            'message': 'Campanha criada com sucesso',
            'campaign_id': campaign.id
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

# ===========================================
# ENDPOINTS DE CONTATOS/INTERAÇÕES
# ===========================================

@crm_bp.route('/contacts', methods=['GET'])
def get_contacts():
    try:
        customer_id = request.args.get('customer_id')
        lead_id = request.args.get('lead_id')
        
        query = Contact.query
        
        if customer_id:
            query = query.filter(Contact.customer_id == customer_id)
        if lead_id:
            query = query.filter(Contact.lead_id == lead_id)
        
        contacts = query.order_by(Contact.created_at.desc()).all()
        
        return jsonify({
            'contacts': [{
                'id': contact.id,
                'type': contact.type,
                'subject': contact.subject,
                'description': contact.description,
                'outcome': contact.outcome,
                'next_action': contact.next_action,
                'follow_up_date': contact.follow_up_date.isoformat() if contact.follow_up_date else None,
                'user_name': contact.user.name if contact.user else None,
                'created_at': contact.created_at.isoformat()
            } for contact in contacts]
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@crm_bp.route('/contacts', methods=['POST'])
def create_contact():
    try:
        data = request.get_json()
        
        contact = Contact(
            customer_id=data.get('customer_id'),
            lead_id=data.get('lead_id'),
            user_id=data.get('user_id'),
            type=data.get('type'),
            subject=data.get('subject'),
            description=data.get('description'),
            outcome=data.get('outcome'),
            next_action=data.get('next_action'),
            follow_up_date=datetime.fromisoformat(data.get('follow_up_date')) if data.get('follow_up_date') else None
        )
        
        db.session.add(contact)
        db.session.commit()
        
        return jsonify({
            'message': 'Contato registrado com sucesso',
            'contact_id': contact.id
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

# ===========================================
# ENDPOINTS DE SEGMENTAÇÃO
# ===========================================

@crm_bp.route('/segments', methods=['GET'])
def get_segments():
    try:
        segments = CustomerSegment.query.filter_by(is_active=True).all()
        
        return jsonify({
            'segments': [{
                'id': segment.id,
                'name': segment.name,
                'description': segment.description,
                'customer_count': segment.customer_count,
                'avg_order_value': float(segment.avg_order_value),
                'total_revenue': float(segment.total_revenue),
                'created_at': segment.created_at.isoformat()
            } for segment in segments]
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# ===========================================
# ENDPOINTS DE ANALYTICS CRM
# ===========================================

@crm_bp.route('/analytics/overview', methods=['GET'])
def get_crm_overview():
    try:
        # Métricas gerais
        total_customers = Customer.query.count()
        active_customers = Customer.query.filter_by(status='active').count()
        total_leads = Lead.query.count()
        new_leads = Lead.query.filter_by(status='new').count()
        
        # Leads por status
        leads_by_status = db.session.query(
            Lead.status,
            func.count(Lead.id)
        ).group_by(Lead.status).all()
        
        # Clientes por fonte
        customers_by_source = db.session.query(
            Customer.source,
            func.count(Customer.id)
        ).group_by(Customer.source).all()
        
        # Taxa de conversão de leads
        converted_leads = Lead.query.filter_by(status='converted').count()
        conversion_rate = (converted_leads / total_leads * 100) if total_leads > 0 else 0
        
        return jsonify({
            'overview': {
                'total_customers': total_customers,
                'active_customers': active_customers,
                'total_leads': total_leads,
                'new_leads': new_leads,
                'conversion_rate': round(conversion_rate, 2)
            },
            'leads_by_status': {status: count for status, count in leads_by_status},
            'customers_by_source': {source or 'Não informado': count for source, count in customers_by_source}
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@crm_bp.route('/analytics/funnel', methods=['GET'])
def get_sales_funnel():
    try:
        # Funil de vendas
        total_leads = Lead.query.count()
        contacted_leads = Lead.query.filter(Lead.status.in_(['contacted', 'qualified', 'converted'])).count()
        qualified_leads = Lead.query.filter(Lead.status.in_(['qualified', 'converted'])).count()
        converted_leads = Lead.query.filter_by(status='converted').count()
        
        return jsonify({
            'funnel': {
                'leads': total_leads,
                'contacted': contacted_leads,
                'qualified': qualified_leads,
                'converted': converted_leads,
                'contact_rate': (contacted_leads / total_leads * 100) if total_leads > 0 else 0,
                'qualification_rate': (qualified_leads / contacted_leads * 100) if contacted_leads > 0 else 0,
                'conversion_rate': (converted_leads / qualified_leads * 100) if qualified_leads > 0 else 0
            }
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500 