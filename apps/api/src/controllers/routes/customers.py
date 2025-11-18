from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models.customers import Customer, CustomerAddress
from database import db
from datetime import datetime
import json
import uuid

customers_bp = Blueprint('customers', __name__, url_prefix='/api/customers')


def convert_to_uuid(id_string):
    """Convert string ID to UUID object safely"""
    try:
        return uuid.UUID(id_string)
    except (ValueError, TypeError):
        return None


# ===========================================
# TIPOS DE CLIENTE
# ===========================================

@customers_bp.route('/types', methods=['GET'])
@jwt_required()
def get_customer_types():
    """Lista tipos de cliente (PF/CNPJ)"""
    try:
        types = [
            {
                'id': 'individual',
                'name': 'Pessoa Física',
                'description': 'Cliente pessoa física',
                'tax_exemption': False,
                'requires_document': True
            },
            {
                'id': 'business',
                'name': 'Pessoa Jurídica',
                'description': 'Cliente pessoa jurídica',
                'tax_exemption': True,
                'requires_document': True
            }
        ]
        return jsonify(types), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500


# ===========================================
# CLIENTES
# ===========================================

@customers_bp.route('/', methods=['GET'])
@jwt_required()
def get_customers():
    """Lista todos os clientes com informações expandidas"""
    try:
        customer_type = request.args.get('type')  # PF ou CNPJ
        status = request.args.get('status')

        query = Customer.query

        if customer_type:
            query = query.filter_by(customer_type = customer_type)
        if status:
            query = query.filter_by(status = status)

        customers = query.all()

        return jsonify([{
            'id': cust.id,
            'name': cust.name,
            'email': cust.email,
            'phone': cust.phone,
            'cpf_cnpj': cust.cpf_cnpj,
            'customer_type': cust.customer_type,
            'company_name': cust.company_name,
            'status': cust.status,
            'total_orders': cust.total_orders,
            'total_spent': (float(cust.total_spent)
                           if cust.total_spent else 0),
            'avg_order_value': (float(cust.avg_order_value)
                               if cust.avg_order_value else 0),
            'last_order_date': (cust.last_order_date.isoformat()
                               if cust.last_order_date else None),
            'acquisition_date': cust.acquisition_date.isoformat(),
            'is_subscribed': cust.is_subscribed,
            'address_city': cust.address_city,
            'address_state': cust.address_state
        } for cust in customers]), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@customers_bp.route('/', methods=['POST'])
@jwt_required()
def create_customer():
    """Cria um novo cliente com suporte a PF/CNPJ"""
    try:
        data = request.get_json()

        # Validação básica
        required_fields = ['name', 'email', 'customer_type']
        for field in required_fields:
            if field not in data:
                return jsonify({'error': f'Campo obrigatório: {field}'}), 400

        # Verificar se email já existe
        existing_email = Customer.query.filter_by(email = data['email']).first()
        if existing_email:
            return jsonify({'error': 'Email já cadastrado'}), 400

        # Verificar se CPF/CNPJ já existe
        if data.get('cpf_cnpj'):
            existing_doc = Customer.query.filter_by(
                cpf_cnpj = data['cpf_cnpj']).first()
            if existing_doc:
                return jsonify({'error': 'CPF/CNPJ já cadastrado'}), 400

        # Validações específicas por tipo
        if data['customer_type'] == 'business':
            if not data.get('company_name'):
                return jsonify({'error':
                               'Nome da empresa é obrigatório para CNPJ'}), 400
            if not data.get('cpf_cnpj'):
                return jsonify({'error':
                               'CNPJ é obrigatório para empresa'}), 400

        customer = Customer(
            name = data['name'],
            email = data['email'],
            phone = data.get('phone'),
            cpf_cnpj = data.get('cpf_cnpj'),
            birth_date=(datetime.strptime(data['birth_date'], '%Y-%m-%d').date()
                       if data.get('birth_date') else None),
            customer_type = data['customer_type'],
            company_name = data.get('company_name'),
            source = data.get('source'),
            address_street = data.get('address_street'),
            address_number = data.get('address_number'),
            address_complement = data.get('address_complement'),
            address_neighborhood = data.get('address_neighborhood'),
            address_city = data.get('address_city'),
            address_state = data.get('address_state'),
            address_cep = data.get('address_cep'),
            is_subscribed = data.get('is_subscribed', True),
            preferences = json.dumps(data.get('preferences', {}))
        )

        db.session.add(customer)
        db.session.commit()

        return jsonify({
            'id': customer.id,
            'name': customer.name,
            'email': customer.email,
            'customer_type': customer.customer_type,
            'message': 'Cliente criado com sucesso'
        }), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


@customers_bp.route('/<customer_id>', methods=['GET'])
@jwt_required()
def get_customer(customer_id):
    """Obtém detalhes completos de um cliente"""
    try:
        customer_uuid = convert_to_uuid(customer_id)
        if not customer_uuid:
            return jsonify({'error': 'ID de cliente inválido'}), 400

        customer = Customer.query.get(customer_uuid)
        if not customer:
            return jsonify({'error': 'Cliente não encontrado'}), 404

        # Buscar endereços
        addresses = CustomerAddress.query.filter_by(
            customer_id = customer_uuid).all()

        return jsonify({
            'id': customer.id,
            'name': customer.name,
            'email': customer.email,
            'phone': customer.phone,
            'cpf_cnpj': customer.cpf_cnpj,
            'birth_date': (customer.birth_date.isoformat()
                          if customer.birth_date else None),
            'customer_type': customer.customer_type,
            'company_name': customer.company_name,
            'source': customer.source,
            'status': customer.status,
            'total_orders': customer.total_orders,
            'total_spent': (float(customer.total_spent)
                           if customer.total_spent else 0),
            'avg_order_value': (float(customer.avg_order_value)
                               if customer.avg_order_value else 0),
            'last_order_date': (customer.last_order_date.isoformat()
                               if customer.last_order_date else None),
            'acquisition_date': customer.acquisition_date.isoformat(),
            'is_subscribed': customer.is_subscribed,
            'preferences': (json.loads(customer.preferences)
                           if customer.preferences else {}),
            'address_street': customer.address_street,
            'address_number': customer.address_number,
            'address_complement': customer.address_complement,
            'address_neighborhood': customer.address_neighborhood,
            'address_city': customer.address_city,
            'address_state': customer.address_state,
            'address_cep': customer.address_cep,
            'addresses': [{
                'id': addr.id,
                'address_type': addr.address_type,
                'is_default': addr.is_default,
                'street': addr.street,
                'number': addr.number,
                'complement': addr.complement,
                'neighborhood': addr.neighborhood,
                'city': addr.city,
                'state': addr.state,
                'cep': addr.cep,
                'country': addr.country,
                'reference': addr.reference,
                'notes': addr.notes
            } for addr in addresses],
            'created_at': customer.created_at.isoformat(),
            'updated_at': customer.updated_at.isoformat()
        }), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500


@customers_bp.route('/<customer_id>', methods=['PUT'])
@jwt_required()
def update_customer(customer_id):
    """Atualiza dados de um cliente"""
    try:
        customer_uuid = convert_to_uuid(customer_id)
        if not customer_uuid:
            return jsonify({'error': 'ID de cliente inválido'}), 400

        customer = Customer.query.get(customer_uuid)
        if not customer:
            return jsonify({'error': 'Cliente não encontrado'}), 404

        data = request.get_json()

        # Atualizar campos básicos
        if 'name' in data:
            customer.name = data['name']
        if 'email' in data:
            customer.email = data['email']
        if 'phone' in data:
            customer.phone = data['phone']
        if 'customer_type' in data:
            customer.customer_type = data['customer_type']
        if 'company_name' in data:
            customer.company_name = data['company_name']
        if 'status' in data:
            customer.status = data['status']
        if 'source' in data:
            customer.source = data['source']
        if 'is_subscribed' in data:
            customer.is_subscribed = data['is_subscribed']
        if 'preferences' in data:
            customer.preferences = json.dumps(data['preferences'])

        # Atualizar endereço principal
        if 'address_street' in data:
            customer.address_street = data['address_street']
        if 'address_number' in data:
            customer.address_number = data['address_number']
        if 'address_city' in data:
            customer.address_city = data['address_city']
        if 'address_state' in data:
            customer.address_state = data['address_state']
        if 'address_cep' in data:
            customer.address_cep = data['address_cep']

        customer.updated_at = datetime.utcnow()
        db.session.commit()

        return jsonify({
            'message': 'Cliente atualizado com sucesso',
            'id': customer.id
        }), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


# ===========================================
# ENDEREÇOS DO CLIENTE
# ===========================================

@customers_bp.route('/<customer_id>/addresses', methods=['GET'])
@jwt_required()
def get_customer_addresses(customer_id):
    """Lista endereços de um cliente"""
    try:
        addresses = CustomerAddress.query.filter_by(
            customer_id = customer_id).all()
        return jsonify([{
            'id': addr.id,
            'address_type': addr.address_type,
            'is_default': addr.is_default,
            'street': addr.street,
            'number': addr.number,
            'complement': addr.complement,
            'neighborhood': addr.neighborhood,
            'city': addr.city,
            'state': addr.state,
            'cep': addr.cep,
            'country': addr.country,
            'reference': addr.reference,
            'notes': addr.notes,
            'created_at': addr.created_at.isoformat()
        } for addr in addresses]), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@customers_bp.route('/<customer_id>/addresses', methods=['POST'])
@jwt_required()
def add_customer_address(customer_id):
    """Adiciona endereço a um cliente"""
    try:
        data = request.get_json()

        required_fields = ['street', 'city', 'state', 'cep']
        for field in required_fields:
            if field not in data:
                return jsonify({'error':
                               'Rua, cidade, estado e CEP são obrigatórios'}), 400

        # Se for endereço padrão, remover padrão dos outros
        if data.get('is_default', False):
            CustomerAddress.query.filter_by(
                customer_id = customer_id,
                is_default = True
            ).update({'is_default': False})

        address = CustomerAddress(
            customer_id = customer_id,
            address_type = data.get('address_type', 'shipping'),
            is_default = data.get('is_default', False),
            street = data['street'],
            number = data.get('number'),
            complement = data.get('complement'),
            neighborhood = data.get('neighborhood'),
            city = data['city'],
            state = data['state'],
            cep = data['cep'],
            country = data.get('country', 'Brasil'),
            reference = data.get('reference'),
            notes = data.get('notes')
        )

        db.session.add(address)
        db.session.commit()

        return jsonify({
            'id': address.id,
            'street': address.street,
            'city': address.city,
            'message': 'Endereço adicionado com sucesso'
        }), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


# ===========================================
# RELATÓRIOS E ESTATÍSTICAS
# ===========================================

@customers_bp.route('/analytics/overview', methods=['GET'])
@jwt_required()
def get_customers_analytics():
    """Obtém estatísticas gerais dos clientes"""
    try:
        total_customers = Customer.query.count()
        active_customers = Customer.query.filter_by(status='active').count()
        business_customers = Customer.query.filter_by(
            customer_type='business').count()
        individual_customers = Customer.query.filter_by(
            customer_type='individual').count()

        # Clientes por cidade
        customers_by_city = db.session.query(
            Customer.address_city,
            db.func.count(Customer.id)
        ).filter(Customer.address_city.isnot(None)).group_by(
            Customer.address_city).order_by(
            db.func.count(Customer.id).desc()
        ).limit(10).all()

        # Top clientes por valor gasto
        top_customers = db.session.query(
            Customer.name,
            Customer.total_spent
        ).filter(Customer.total_spent > 0).order_by(
            Customer.total_spent.desc()
        ).limit(10).all()

        return jsonify({
            'total_customers': total_customers,
            'active_customers': active_customers,
            'business_customers': business_customers,
            'individual_customers': individual_customers,
            'customers_by_city': [
                {'city': city, 'count': count}
                for city, count in customers_by_city
            ],
            'top_customers': [
                {'name': name,
                 'total_spent': (float(total_spent)
                                if total_spent else 0)}
                for name, total_spent in top_customers
            ]
        }), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500
