from flask import Blueprint, request, jsonify
from src.models.database import db, Supplier, SupplierContact, SupplierProduct, PurchaseOrder, PurchaseOrderItem
from datetime import datetime, date
import uuid

suppliers_bp = Blueprint('suppliers', __name__, url_prefix='/api/suppliers')

# ===========================================
# FORNECEDORES
# ===========================================

@suppliers_bp.route('/', methods=['GET'])
def get_suppliers():
    """Lista todos os fornecedores"""
    try:
        suppliers = Supplier.query.all()
        return jsonify([{
            'id': sup.id,
            'name': sup.name,
            'company_name': sup.company_name,
            'cnpj': sup.cnpj,
            'cpf': sup.cpf,
            'email': sup.email,
            'phone': sup.phone,
            'supplier_type': sup.supplier_type,
            'category': sup.category,
            'status': sup.status,
            'rating': sup.rating,
            'current_balance': float(sup.current_balance) if sup.current_balance else 0,
            'credit_limit': float(sup.credit_limit) if sup.credit_limit else 0,
            'last_order_date': sup.last_order_date.isoformat() if sup.last_order_date else None
        } for sup in suppliers]), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@suppliers_bp.route('/', methods=['POST'])
def create_supplier():
    """Cria um novo fornecedor"""
    try:
        data = request.get_json()
        
        # Validação básica
        if 'name' not in data:
            return jsonify({'error': 'Nome do fornecedor é obrigatório'}), 400
        
        # Verificar se CNPJ/CPF já existe
        if data.get('cnpj'):
            existing_cnpj = Supplier.query.filter_by(cnpj=data['cnpj']).first()
            if existing_cnpj:
                return jsonify({'error': 'CNPJ já cadastrado'}), 400
        
        if data.get('cpf'):
            existing_cpf = Supplier.query.filter_by(cpf=data['cpf']).first()
            if existing_cpf:
                return jsonify({'error': 'CPF já cadastrado'}), 400
        
        supplier = Supplier(
            name=data['name'],
            company_name=data.get('company_name'),
            cnpj=data.get('cnpj'),
            cpf=data.get('cpf'),
            ie=data.get('ie'),
            im=data.get('im'),
            email=data.get('email'),
            phone=data.get('phone'),
            website=data.get('website'),
            address_street=data.get('address_street'),
            address_number=data.get('address_number'),
            address_complement=data.get('address_complement'),
            address_neighborhood=data.get('address_neighborhood'),
            address_city=data.get('address_city'),
            address_state=data.get('address_state'),
            address_cep=data.get('address_cep'),
            supplier_type=data.get('supplier_type'),
            category=data.get('category'),
            payment_terms=data.get('payment_terms'),
            credit_limit=data.get('credit_limit'),
            rating=data.get('rating'),
            notes=data.get('notes')
        )
        
        db.session.add(supplier)
        db.session.commit()
        
        return jsonify({
            'id': supplier.id,
            'name': supplier.name,
            'message': 'Fornecedor criado com sucesso'
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@suppliers_bp.route('/<supplier_id>', methods=['GET'])
def get_supplier(supplier_id):
    """Obtém detalhes de um fornecedor específico"""
    try:
        supplier = Supplier.query.get(supplier_id)
        if not supplier:
            return jsonify({'error': 'Fornecedor não encontrado'}), 404
        
        return jsonify({
            'id': supplier.id,
            'name': supplier.name,
            'company_name': supplier.company_name,
            'cnpj': supplier.cnpj,
            'cpf': supplier.cpf,
            'ie': supplier.ie,
            'im': supplier.im,
            'email': supplier.email,
            'phone': supplier.phone,
            'website': supplier.website,
            'address_street': supplier.address_street,
            'address_number': supplier.address_number,
            'address_complement': supplier.address_complement,
            'address_neighborhood': supplier.address_neighborhood,
            'address_city': supplier.address_city,
            'address_state': supplier.address_state,
            'address_cep': supplier.address_cep,
            'supplier_type': supplier.supplier_type,
            'category': supplier.category,
            'payment_terms': supplier.payment_terms,
            'credit_limit': float(supplier.credit_limit) if supplier.credit_limit else None,
            'current_balance': float(supplier.current_balance) if supplier.current_balance else None,
            'status': supplier.status,
            'rating': supplier.rating,
            'notes': supplier.notes,
            'registration_date': supplier.registration_date.isoformat(),
            'last_order_date': supplier.last_order_date.isoformat() if supplier.last_order_date else None,
            'created_at': supplier.created_at.isoformat(),
            'updated_at': supplier.updated_at.isoformat()
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@suppliers_bp.route('/<supplier_id>', methods=['PUT'])
def update_supplier(supplier_id):
    """Atualiza dados de um fornecedor"""
    try:
        supplier = Supplier.query.get(supplier_id)
        if not supplier:
            return jsonify({'error': 'Fornecedor não encontrado'}), 404
        
        data = request.get_json()
        
        # Atualizar campos básicos
        if 'name' in data:
            supplier.name = data['name']
        if 'company_name' in data:
            supplier.company_name = data['company_name']
        if 'email' in data:
            supplier.email = data['email']
        if 'phone' in data:
            supplier.phone = data['phone']
        if 'website' in data:
            supplier.website = data['website']
        if 'supplier_type' in data:
            supplier.supplier_type = data['supplier_type']
        if 'category' in data:
            supplier.category = data['category']
        if 'payment_terms' in data:
            supplier.payment_terms = data['payment_terms']
        if 'credit_limit' in data:
            supplier.credit_limit = data['credit_limit']
        if 'status' in data:
            supplier.status = data['status']
        if 'rating' in data:
            supplier.rating = data['rating']
        if 'notes' in data:
            supplier.notes = data['notes']
        
        # Atualizar endereço
        if 'address_street' in data:
            supplier.address_street = data['address_street']
        if 'address_number' in data:
            supplier.address_number = data['address_number']
        if 'address_city' in data:
            supplier.address_city = data['address_city']
        if 'address_state' in data:
            supplier.address_state = data['address_state']
        if 'address_cep' in data:
            supplier.address_cep = data['address_cep']
        
        supplier.updated_at = datetime.utcnow()
        db.session.commit()
        
        return jsonify({
            'message': 'Fornecedor atualizado com sucesso',
            'id': supplier.id
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@suppliers_bp.route('/<supplier_id>', methods=['DELETE'])
def delete_supplier(supplier_id):
    """Remove um fornecedor (soft delete)"""
    try:
        supplier = Supplier.query.get(supplier_id)
        if not supplier:
            return jsonify({'error': 'Fornecedor não encontrado'}), 404
        
        supplier.status = 'inactive'
        supplier.updated_at = datetime.utcnow()
        
        db.session.commit()
        
        return jsonify({'message': 'Fornecedor removido com sucesso'}), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

# ===========================================
# CONTATOS DO FORNECEDOR
# ===========================================

@suppliers_bp.route('/<supplier_id>/contacts', methods=['GET'])
def get_supplier_contacts(supplier_id):
    """Lista contatos de um fornecedor"""
    try:
        contacts = SupplierContact.query.filter_by(supplier_id=supplier_id).all()
        return jsonify([{
            'id': contact.id,
            'name': contact.name,
            'position': contact.position,
            'email': contact.email,
            'phone': contact.phone,
            'is_primary': contact.is_primary,
            'created_at': contact.created_at.isoformat()
        } for contact in contacts]), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@suppliers_bp.route('/<supplier_id>/contacts', methods=['POST'])
def create_supplier_contact(supplier_id):
    """Adiciona contato a um fornecedor"""
    try:
        data = request.get_json()
        
        if 'name' not in data:
            return jsonify({'error': 'Nome do contato é obrigatório'}), 400
        
        contact = SupplierContact(
            supplier_id=supplier_id,
            name=data['name'],
            position=data.get('position'),
            email=data.get('email'),
            phone=data.get('phone'),
            is_primary=data.get('is_primary', False)
        )
        
        db.session.add(contact)
        db.session.commit()
        
        return jsonify({
            'id': contact.id,
            'name': contact.name,
            'message': 'Contato adicionado com sucesso'
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

# ===========================================
# PRODUTOS DO FORNECEDOR
# ===========================================

@suppliers_bp.route('/<supplier_id>/products', methods=['GET'])
def get_supplier_products(supplier_id):
    """Lista produtos de um fornecedor"""
    try:
        products = SupplierProduct.query.filter_by(supplier_id=supplier_id).all()
        return jsonify([{
            'id': prod.id,
            'product_id': prod.product_id,
            'product_name': prod.product.name if prod.product else None,
            'supplier_product_code': prod.supplier_product_code,
            'supplier_product_name': prod.supplier_product_name,
            'unit_price': float(prod.unit_price) if prod.unit_price else None,
            'minimum_order_quantity': prod.minimum_order_quantity,
            'lead_time_days': prod.lead_time_days,
            'is_preferred': prod.is_preferred
        } for prod in products]), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@suppliers_bp.route('/<supplier_id>/products', methods=['POST'])
def add_supplier_product(supplier_id):
    """Adiciona produto a um fornecedor"""
    try:
        data = request.get_json()
        
        if 'product_id' not in data:
            return jsonify({'error': 'ID do produto é obrigatório'}), 400
        
        supplier_product = SupplierProduct(
            supplier_id=supplier_id,
            product_id=data['product_id'],
            supplier_product_code=data.get('supplier_product_code'),
            supplier_product_name=data.get('supplier_product_name'),
            unit_price=data.get('unit_price'),
            minimum_order_quantity=data.get('minimum_order_quantity', 1),
            lead_time_days=data.get('lead_time_days'),
            is_preferred=data.get('is_preferred', False)
        )
        
        db.session.add(supplier_product)
        db.session.commit()
        
        return jsonify({
            'id': supplier_product.id,
            'message': 'Produto adicionado ao fornecedor com sucesso'
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

# ===========================================
# PEDIDOS DE COMPRA
# ===========================================

@suppliers_bp.route('/purchase-orders', methods=['GET'])
def get_purchase_orders():
    """Lista pedidos de compra"""
    try:
        supplier_id = request.args.get('supplier_id')
        status = request.args.get('status')
        
        query = PurchaseOrder.query
        
        if supplier_id:
            query = query.filter_by(supplier_id=supplier_id)
        if status:
            query = query.filter_by(status=status)
        
        orders = query.all()
        
        return jsonify([{
            'id': order.id,
            'order_number': order.order_number,
            'supplier_id': order.supplier_id,
            'supplier_name': order.supplier.name if order.supplier else None,
            'employee_id': order.employee_id,
            'employee_name': order.employee.name if order.employee else None,
            'total_amount': float(order.total_amount),
            'status': order.status,
            'order_date': order.order_date.isoformat(),
            'expected_delivery_date': order.expected_delivery_date.isoformat() if order.expected_delivery_date else None,
            'delivery_date': order.delivery_date.isoformat() if order.delivery_date else None,
            'payment_terms': order.payment_terms,
            'notes': order.notes
        } for order in orders]), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@suppliers_bp.route('/purchase-orders', methods=['POST'])
def create_purchase_order():
    """Cria um novo pedido de compra"""
    try:
        data = request.get_json()
        
        required_fields = ['supplier_id', 'employee_id', 'total_amount', 'items']
        for field in required_fields:
            if field not in data:
                return jsonify({'error': f'Campo obrigatório: {field}'}), 400
        
        # Gerar número do pedido
        order_number = f"PO-{datetime.now().strftime('%Y%m%d')}-{str(uuid.uuid4())[:8].upper()}"
        
        purchase_order = PurchaseOrder(
            supplier_id=data['supplier_id'],
            employee_id=data['employee_id'],
            order_number=order_number,
            total_amount=data['total_amount'],
            order_date=datetime.utcnow(),
            expected_delivery_date=datetime.strptime(data['expected_delivery_date'], '%Y-%m-%d').date() if data.get('expected_delivery_date') else None,
            payment_terms=data.get('payment_terms'),
            notes=data.get('notes')
        )
        
        db.session.add(purchase_order)
        db.session.flush()  # Para obter o ID do pedido
        
        # Adicionar itens
        for item_data in data['items']:
            item = PurchaseOrderItem(
                purchase_order_id=purchase_order.id,
                product_id=item_data['product_id'],
                quantity=item_data['quantity'],
                unit_price=item_data['unit_price'],
                total_price=item_data['quantity'] * item_data['unit_price'],
                notes=item_data.get('notes')
            )
            db.session.add(item)
        
        db.session.commit()
        
        return jsonify({
            'id': purchase_order.id,
            'order_number': purchase_order.order_number,
            'message': 'Pedido de compra criado com sucesso'
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@suppliers_bp.route('/purchase-orders/<order_id>', methods=['GET'])
def get_purchase_order(order_id):
    """Obtém detalhes de um pedido de compra"""
    try:
        order = PurchaseOrder.query.get(order_id)
        if not order:
            return jsonify({'error': 'Pedido de compra não encontrado'}), 404
        
        return jsonify({
            'id': order.id,
            'order_number': order.order_number,
            'supplier_id': order.supplier_id,
            'supplier_name': order.supplier.name if order.supplier else None,
            'employee_id': order.employee_id,
            'employee_name': order.employee.name if order.employee else None,
            'total_amount': float(order.total_amount),
            'status': order.status,
            'order_date': order.order_date.isoformat(),
            'expected_delivery_date': order.expected_delivery_date.isoformat() if order.expected_delivery_date else None,
            'delivery_date': order.delivery_date.isoformat() if order.delivery_date else None,
            'payment_terms': order.payment_terms,
            'notes': order.notes,
            'items': [{
                'id': item.id,
                'product_id': item.product_id,
                'product_name': item.product.name if item.product else None,
                'quantity': item.quantity,
                'unit_price': float(item.unit_price),
                'total_price': float(item.total_price),
                'received_quantity': item.received_quantity,
                'notes': item.notes
            } for item in order.items]
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@suppliers_bp.route('/purchase-orders/<order_id>/status', methods=['PUT'])
def update_purchase_order_status(order_id):
    """Atualiza status de um pedido de compra"""
    try:
        order = PurchaseOrder.query.get(order_id)
        if not order:
            return jsonify({'error': 'Pedido de compra não encontrado'}), 404
        
        data = request.get_json()
        
        if 'status' not in data:
            return jsonify({'error': 'Status é obrigatório'}), 400
        
        order.status = data['status']
        
        if data['status'] == 'received' and data.get('delivery_date'):
            order.delivery_date = datetime.strptime(data['delivery_date'], '%Y-%m-%d').date()
        
        order.updated_at = datetime.utcnow()
        db.session.commit()
        
        return jsonify({
            'message': 'Status do pedido atualizado com sucesso',
            'status': order.status
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

# ===========================================
# RELATÓRIOS E ESTATÍSTICAS
# ===========================================

@suppliers_bp.route('/analytics/overview', methods=['GET'])
def get_suppliers_analytics():
    """Obtém estatísticas gerais dos fornecedores"""
    try:
        total_suppliers = Supplier.query.filter_by(status='active').count()
        total_purchase_orders = PurchaseOrder.query.count()
        total_pending_orders = PurchaseOrder.query.filter_by(status='draft').count()
        
        # Fornecedores por categoria
        suppliers_by_category = db.session.query(
            Supplier.category,
            db.func.count(Supplier.id)
        ).filter_by(status='active').group_by(Supplier.category).all()
        
        # Top fornecedores por valor de pedidos
        top_suppliers = db.session.query(
            Supplier.name,
            db.func.sum(PurchaseOrder.total_amount)
        ).join(PurchaseOrder).group_by(Supplier.id, Supplier.name).order_by(
            db.func.sum(PurchaseOrder.total_amount).desc()
        ).limit(5).all()
        
        return jsonify({
            'total_suppliers': total_suppliers,
            'total_purchase_orders': total_purchase_orders,
            'total_pending_orders': total_pending_orders,
            'suppliers_by_category': [
                {'category': cat, 'count': count}
                for cat, count in suppliers_by_category
            ],
            'top_suppliers': [
                {'name': name, 'total_amount': float(amount) if amount else 0}
                for name, amount in top_suppliers
            ]
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500 