"""
Rotas para o sistema de ERP Avançado
Compras, Contratos, MRP (Produção), Qualidade
"""

from datetime import datetime, timedelta
from decimal import Decimal
from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity, get_jwt
from sqlalchemy import desc, or_, func
from sqlalchemy.exc import SQLAlchemyError

from database import db
from models import (
    PurchaseRequest, PurchaseRequestItem, SupplierContract,
    ProductionOrder, ProductionMaterial, QualityControl, MaterialRequirement,
    Product, Supplier, User
)
from utils.validators import validate_required_fields

erp_bp = Blueprint('erp', __name__)


# ================ REQUISIÇÕES DE COMPRA ================

@erp_bp.route('/purchase-requests', methods=['GET'])
@jwt_required()
def get_purchase_requests():
    """Listar requisições de compra"""
    try:
        # Filtros
        status = request.args.get('status')
        department = request.args.get('department')

        query = PurchaseRequest.query

        if status:
            query = query.filter_by(status=status)
        if department:
            query = query.filter_by(department=department)

        # Ordenação
        query = query.order_by(desc(PurchaseRequest.created_at))

        # Paginação
        page = int(request.args.get('page', 1))
        per_page = int(request.args.get('per_page', 20))
        pagination = query.paginate(page=page, per_page=per_page, error_out=False)

        return jsonify({
            'success': True,
            'requests': [r.to_dict() for r in pagination.items],
            'total': pagination.total,
            'pages': pagination.pages,
            'current_page': page
        }), 200
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500


@erp_bp.route('/purchase-requests', methods=['POST'])
@jwt_required()
def create_purchase_request():
    """Criar requisição de compra"""
    try:
        user_id = get_jwt_identity()
        data = request.get_json()

        validation = validate_required_fields(data, ['department', 'items'])
        if not validation['valid']:
            return jsonify({'success': False, 'error': validation['message']}), 400

        # Calcular total
        total_amount = Decimal('0')
        for item in data['items']:
            estimated_price = Decimal(str(item.get('estimated_price', 0)))
            quantity = Decimal(str(item['quantity']))
            total_amount += estimated_price * quantity

        # Criar requisição
        request_obj = PurchaseRequest(
            department=data['department'],
            description=data.get('description'),
            justification=data.get('justification'),
            priority=data.get('priority', 'medium'),
            requested_by=user_id,
            needed_by=data.get('needed_by'),
            total_amount=total_amount,
            status='pending'
        )
        db.session.add(request_obj)
        db.session.flush()

        # Criar itens
        for item_data in data['items']:
            item = PurchaseRequestItem(
                request_id=request_obj.id,
                product_id=item_data.get('product_id'),
                description=item_data['description'],
                quantity=Decimal(str(item_data['quantity'])),
                unit=item_data.get('unit', 'un'),
                estimated_price=Decimal(str(item_data.get('estimated_price', 0))),
                notes=item_data.get('notes')
            )
            db.session.add(item)

        db.session.commit()

        return jsonify({
            'success': True,
            'message': 'Requisição de compra criada com sucesso',
            'request': request_obj.to_dict()
        }), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'error': str(e)}), 500


@erp_bp.route('/purchase-requests/<request_id>/approve', methods=['POST'])
@jwt_required()
def approve_purchase_request(request_id):
    """Aprovar requisição de compra (manager/admin)"""
    try:
        user_id = get_jwt_identity()
        claims = get_jwt()

        # Verificar permissão (apenas managers ou admins)
        if not claims.get('is_admin'):
            return jsonify({'success': False, 'error': 'Acesso negado'}), 403

        request_obj = PurchaseRequest.query.get(request_id)
        if not request_obj:
            return jsonify({'success': False, 'error': 'Requisição não encontrada'}), 404

        if request_obj.status != 'pending':
            return jsonify({'success': False, 'error': 'Requisição não está pendente'}), 400

        data = request.get_json()

        request_obj.status = 'approved'
        request_obj.approved_by = user_id
        request_obj.approved_at = datetime.utcnow()
        request_obj.approval_notes = data.get('notes')

        db.session.commit()

        return jsonify({
            'success': True,
            'message': 'Requisição aprovada com sucesso',
            'request': request_obj.to_dict()
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'error': str(e)}), 500


@erp_bp.route('/purchase-requests/<request_id>/reject', methods=['POST'])
@jwt_required()
def reject_purchase_request(request_id):
    """Rejeitar requisição de compra"""
    try:
        user_id = get_jwt_identity()
        claims = get_jwt()

        if not claims.get('is_admin'):
            return jsonify({'success': False, 'error': 'Acesso negado'}), 403

        request_obj = PurchaseRequest.query.get(request_id)
        if not request_obj:
            return jsonify({'success': False, 'error': 'Requisição não encontrada'}), 404

        data = request.get_json()

        request_obj.status = 'rejected'
        request_obj.approved_by = user_id
        request_obj.approved_at = datetime.utcnow()
        request_obj.approval_notes = data.get('notes', 'Rejeitado')

        db.session.commit()

        return jsonify({
            'success': True,
            'message': 'Requisição rejeitada',
            'request': request_obj.to_dict()
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'error': str(e)}), 500


# ================ CONTRATOS COM FORNECEDORES ================

@erp_bp.route('/supplier-contracts', methods=['GET'])
@jwt_required()
def get_supplier_contracts():
    """Listar contratos com fornecedores"""
    try:
        # Filtros
        supplier_id = request.args.get('supplier_id')
        status = request.args.get('status')
        active_only = request.args.get('active_only', 'false').lower() == 'true'

        query = SupplierContract.query

        if supplier_id:
            query = query.filter_by(supplier_id=supplier_id)
        if status:
            query = query.filter_by(status=status)
        if active_only:
            query = query.filter_by(is_active=True)

        query = query.order_by(desc(SupplierContract.created_at))

        # Paginação
        page = int(request.args.get('page', 1))
        per_page = int(request.args.get('per_page', 20))
        pagination = query.paginate(page=page, per_page=per_page, error_out=False)

        return jsonify({
            'success': True,
            'contracts': [c.to_dict() for c in pagination.items],
            'total': pagination.total,
            'pages': pagination.pages,
            'current_page': page
        }), 200
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500


@erp_bp.route('/supplier-contracts', methods=['POST'])
@jwt_required()
def create_supplier_contract():
    """Criar contrato com fornecedor (admin)"""
    try:
        claims = get_jwt()
        if not claims.get('is_admin'):
            return jsonify({'success': False, 'error': 'Acesso negado'}), 403

        data = request.get_json()

        validation = validate_required_fields(data, ['supplier_id', 'start_date', 'end_date', 'contract_value'])
        if not validation['valid']:
            return jsonify({'success': False, 'error': validation['message']}), 400

        contract = SupplierContract(
            supplier_id=data['supplier_id'],
            contract_number=data.get('contract_number'),
            description=data.get('description'),
            start_date=datetime.fromisoformat(data['start_date']),
            end_date=datetime.fromisoformat(data['end_date']),
            contract_value=Decimal(str(data['contract_value'])),
            payment_terms=data.get('payment_terms'),
            delivery_terms=data.get('delivery_terms'),
            quality_requirements=data.get('quality_requirements'),
            sla_terms=data.get('sla_terms'),
            renewal_date=data.get('renewal_date'),
            auto_renewal=data.get('auto_renewal', False),
            status='active',
            is_active=True
        )
        db.session.add(contract)
        db.session.commit()

        return jsonify({
            'success': True,
            'message': 'Contrato criado com sucesso',
            'contract': contract.to_dict()
        }), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'error': str(e)}), 500


# ================ ORDENS DE PRODUÇÃO (MRP) ================

@erp_bp.route('/production-orders', methods=['GET'])
@jwt_required()
def get_production_orders():
    """Listar ordens de produção"""
    try:
        # Filtros
        status = request.args.get('status')
        product_id = request.args.get('product_id')

        query = ProductionOrder.query

        if status:
            query = query.filter_by(status=status)
        if product_id:
            query = query.filter_by(product_id=product_id)

        query = query.order_by(desc(ProductionOrder.created_at))

        # Paginação
        page = int(request.args.get('page', 1))
        per_page = int(request.args.get('per_page', 20))
        pagination = query.paginate(page=page, per_page=per_page, error_out=False)

        return jsonify({
            'success': True,
            'orders': [o.to_dict() for o in pagination.items],
            'total': pagination.total,
            'pages': pagination.pages,
            'current_page': page
        }), 200
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500


@erp_bp.route('/production-orders', methods=['POST'])
@jwt_required()
def create_production_order():
    """Criar ordem de produção"""
    try:
        user_id = get_jwt_identity()
        data = request.get_json()

        validation = validate_required_fields(data, ['product_id', 'quantity', 'planned_start'])
        if not validation['valid']:
            return jsonify({'success': False, 'error': validation['message']}), 400

        # Gerar número da ordem
        last_order = ProductionOrder.query.order_by(desc(ProductionOrder.created_at)).first()
        order_number = f"OP{str(datetime.utcnow().year)[-2:]}{(last_order.id.int if last_order else 0) + 1:06d}"

        order = ProductionOrder(
            order_number=order_number,
            product_id=data['product_id'],
            quantity=Decimal(str(data['quantity'])),
            planned_start=datetime.fromisoformat(data['planned_start']),
            planned_end=data.get('planned_end'),
            priority=data.get('priority', 'medium'),
            notes=data.get('notes'),
            created_by=user_id,
            status='pending'
        )
        db.session.add(order)
        db.session.flush()

        # Adicionar materiais se fornecidos
        if 'materials' in data:
            for mat_data in data['materials']:
                material = ProductionMaterial(
                    production_order_id=order.id,
                    product_id=mat_data['product_id'],
                    quantity_required=Decimal(str(mat_data['quantity_required'])),
                    quantity_used=Decimal('0'),
                    unit_cost=Decimal(str(mat_data.get('unit_cost', 0)))
                )
                db.session.add(material)

        db.session.commit()

        return jsonify({
            'success': True,
            'message': 'Ordem de produção criada com sucesso',
            'order': order.to_dict()
        }), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'error': str(e)}), 500


@erp_bp.route('/production-orders/<order_id>/start', methods=['POST'])
@jwt_required()
def start_production_order(order_id):
    """Iniciar ordem de produção"""
    try:
        order = ProductionOrder.query.get(order_id)
        if not order:
            return jsonify({'success': False, 'error': 'Ordem não encontrada'}), 404

        if order.status != 'pending':
            return jsonify({'success': False, 'error': 'Ordem não está pendente'}), 400

        order.status = 'in_progress'
        order.actual_start = datetime.utcnow()

        db.session.commit()

        return jsonify({
            'success': True,
            'message': 'Ordem de produção iniciada',
            'order': order.to_dict()
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'error': str(e)}), 500


@erp_bp.route('/production-orders/<order_id>/complete', methods=['POST'])
@jwt_required()
def complete_production_order(order_id):
    """Concluir ordem de produção"""
    try:
        order = ProductionOrder.query.get(order_id)
        if not order:
            return jsonify({'success': False, 'error': 'Ordem não encontrada'}), 404

        data = request.get_json()

        order.status = 'completed'
        order.actual_end = datetime.utcnow()
        order.quantity_produced = Decimal(str(data.get('quantity_produced', order.quantity)))
        order.actual_cost = Decimal(str(data.get('actual_cost', 0))) if data.get('actual_cost') else None

        # Atualizar estoque do produto
        product = Product.query.get(order.product_id)
        if product and product.stock_quantity is not None:
            product.stock_quantity += order.quantity_produced

        db.session.commit()

        return jsonify({
            'success': True,
            'message': 'Ordem de produção concluída',
            'order': order.to_dict()
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'error': str(e)}), 500


# ================ CONTROLE DE QUALIDADE ================

@erp_bp.route('/quality-controls', methods=['GET'])
@jwt_required()
def get_quality_controls():
    """Listar inspeções de qualidade"""
    try:
        # Filtros
        status = request.args.get('status')
        type_filter = request.args.get('type')

        query = QualityControl.query

        if status:
            query = query.filter_by(status=status)
        if type_filter:
            query = query.filter_by(type=type_filter)

        query = query.order_by(desc(QualityControl.created_at))

        # Paginação
        page = int(request.args.get('page', 1))
        per_page = int(request.args.get('per_page', 20))
        pagination = query.paginate(page=page, per_page=per_page, error_out=False)

        return jsonify({
            'success': True,
            'inspections': [i.to_dict() for i in pagination.items],
            'total': pagination.total,
            'pages': pagination.pages,
            'current_page': page
        }), 200
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500


@erp_bp.route('/quality-controls', methods=['POST'])
@jwt_required()
def create_quality_control():
    """Criar inspeção de qualidade"""
    try:
        user_id = get_jwt_identity()
        data = request.get_json()

        validation = validate_required_fields(data, ['type', 'inspection_date'])
        if not validation['valid']:
            return jsonify({'success': False, 'error': validation['message']}), 400

        inspection = QualityControl(
            type=data['type'],
            product_id=data.get('product_id'),
            batch_number=data.get('batch_number'),
            supplier_id=data.get('supplier_id'),
            production_order_id=data.get('production_order_id'),
            inspection_date=datetime.fromisoformat(data['inspection_date']),
            inspector_id=user_id,
            sample_size=data.get('sample_size'),
            defects_found=data.get('defects_found', 0),
            test_results=data.get('test_results'),
            observations=data.get('observations'),
            status='pending'
        )
        db.session.add(inspection)
        db.session.commit()

        return jsonify({
            'success': True,
            'message': 'Inspeção de qualidade criada',
            'inspection': inspection.to_dict()
        }), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'error': str(e)}), 500


@erp_bp.route('/quality-controls/<inspection_id>/approve', methods=['POST'])
@jwt_required()
def approve_quality_control(inspection_id):
    """Aprovar inspeção de qualidade"""
    try:
        inspection = QualityControl.query.get(inspection_id)
        if not inspection:
            return jsonify({'success': False, 'error': 'Inspeção não encontrada'}), 404

        data = request.get_json()

        inspection.status = 'approved'
        inspection.approved_at = datetime.utcnow()
        inspection.corrective_actions = data.get('corrective_actions')

        db.session.commit()

        return jsonify({
            'success': True,
            'message': 'Inspeção aprovada',
            'inspection': inspection.to_dict()
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'error': str(e)}), 500


@erp_bp.route('/quality-controls/<inspection_id>/reject', methods=['POST'])
@jwt_required()
def reject_quality_control(inspection_id):
    """Reprovar inspeção de qualidade"""
    try:
        inspection = QualityControl.query.get(inspection_id)
        if not inspection:
            return jsonify({'success': False, 'error': 'Inspeção não encontrada'}), 404

        data = request.get_json()

        inspection.status = 'rejected'
        inspection.approved_at = datetime.utcnow()
        inspection.corrective_actions = data.get('corrective_actions', 'Lote rejeitado')

        db.session.commit()

        return jsonify({
            'success': True,
            'message': 'Inspeção reprovada',
            'inspection': inspection.to_dict()
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'error': str(e)}), 500


# ================ MRP - PLANEJAMENTO DE MATERIAIS ================

@erp_bp.route('/material-requirements', methods=['POST'])
@jwt_required()
def calculate_material_requirements():
    """Calcular necessidades de materiais (MRP)"""
    try:
        claims = get_jwt()
        if not claims.get('is_admin'):
            return jsonify({'success': False, 'error': 'Acesso negado'}), 403

        data = request.get_json()

        validation = validate_required_fields(data, ['product_id', 'quantity_needed'])
        if not validation['valid']:
            return jsonify({'success': False, 'error': validation['message']}), 400

        product = Product.query.get(data['product_id'])
        if not product:
            return jsonify({'success': False, 'error': 'Produto não encontrado'}), 404

        # Criar requisito de material
        requirement = MaterialRequirement(
            product_id=data['product_id'],
            quantity_needed=Decimal(str(data['quantity_needed'])),
            required_by=datetime.fromisoformat(data['required_by']),
            current_stock=product.stock_quantity or Decimal('0'),
            status='pending'
        )

        # Calcular quantidade a comprar
        requirement.quantity_to_order = max(
            Decimal('0'),
            requirement.quantity_needed - requirement.current_stock
        )

        db.session.add(requirement)
        db.session.commit()

        return jsonify({
            'success': True,
            'message': 'Requisito de material calculado',
            'requirement': requirement.to_dict()
        }), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'error': str(e)}), 500


@erp_bp.route('/material-requirements', methods=['GET'])
@jwt_required()
def get_material_requirements():
    """Listar requisitos de materiais"""
    try:
        status = request.args.get('status')

        query = MaterialRequirement.query

        if status:
            query = query.filter_by(status=status)

        query = query.order_by(MaterialRequirement.required_by)

        # Paginação
        page = int(request.args.get('page', 1))
        per_page = int(request.args.get('per_page', 20))
        pagination = query.paginate(page=page, per_page=per_page, error_out=False)

        return jsonify({
            'success': True,
            'requirements': [r.to_dict() for r in pagination.items],
            'total': pagination.total,
            'pages': pagination.pages,
            'current_page': page
        }), 200
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500
