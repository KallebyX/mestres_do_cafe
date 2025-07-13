"""
Controlador para gerenciamento de fornecedores
"""

from flask import Blueprint, jsonify, request
from datetime import datetime
import uuid

from ...database import db
from ...models import Supplier
from ...middleware.error_handler import ValidationAPIError, ResourceAPIError

suppliers_bp = Blueprint("suppliers", __name__)


def convert_to_uuid(id_string):
    """Convert string ID to UUID object safely"""
    try:
        return uuid.UUID(id_string)
    except (ValueError, TypeError):
        return None


@suppliers_bp.route("", methods=["GET"])
def get_suppliers():
    """Listar todos os fornecedores"""
    try:
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 20, type=int)
        search = request.args.get('search', '')
        status = request.args.get('status')
        
        query = Supplier.query
        
        # Filtro por busca
        if search:
            query = query.filter(
                Supplier.name.ilike(f'%{search}%') |
                Supplier.email.ilike(f'%{search}%') |
                Supplier.cnpj.ilike(f'%{search}%')
            )
        
        # Filtro por status
        if status:
            query = query.filter(Supplier.status == status)
        
        suppliers = query.order_by(Supplier.created_at.desc()).paginate(
            page=page, per_page=per_page, error_out=False
        )
        
        return jsonify({
            'success': True,
            'data': {
                'suppliers': [supplier.to_dict() for supplier in suppliers.items],
                'pagination': {
                    'page': suppliers.page,
                    'pages': suppliers.pages,
                    'per_page': suppliers.per_page,
                    'total': suppliers.total
                }
            }
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': f'Erro ao listar fornecedores: {str(e)}'
        }), 500


@suppliers_bp.route("", methods=["POST"])
def create_supplier():
    """Criar novo fornecedor"""
    try:
        data = request.get_json()
        
        if not data:
            raise ValidationAPIError("Dados não fornecidos")
        
        # Validar campos obrigatórios
        required_fields = ['name', 'email', 'cnpj']
        for field in required_fields:
            if not data.get(field):
                raise ValidationAPIError(f"Campo '{field}' é obrigatório")
        
        # Verificar se CNPJ já existe
        existing_supplier = Supplier.query.filter_by(cnpj=data['cnpj']).first()
        if existing_supplier:
            raise ResourceAPIError(
                "CNPJ já cadastrado",
                error_code=4091,
                status_code=409
            )
        
        # Verificar se email já existe
        existing_email = Supplier.query.filter_by(email=data['email']).first()
        if existing_email:
            raise ResourceAPIError(
                "Email já cadastrado",
                error_code=4092,
                status_code=409
            )
        
        # Criar fornecedor
        supplier = Supplier(
            name=data['name'],
            email=data['email'],
            cnpj=data['cnpj'],
            phone=data.get('phone'),
            contact_person=data.get('contact_person'),
            address=data.get('address'),
            city=data.get('city'),
            state=data.get('state'),
            postal_code=data.get('postal_code'),
            country=data.get('country', 'Brasil'),
            status=data.get('status', 'active'),
            payment_terms=data.get('payment_terms'),
            delivery_time=data.get('delivery_time'),
            notes=data.get('notes')
        )
        
        db.session.add(supplier)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Fornecedor criado com sucesso',
            'data': supplier.to_dict()
        }), 201
        
    except (ValidationAPIError, ResourceAPIError):
        raise
    except Exception as e:
        return jsonify({
            'success': False,
            'error': f'Erro ao criar fornecedor: {str(e)}'
        }), 500


@suppliers_bp.route("/<supplier_id>", methods=["GET"])
def get_supplier(supplier_id):
    """Obter detalhes de um fornecedor"""
    try:
        supplier_uuid = convert_to_uuid(supplier_id)
        if not supplier_uuid:
            raise ValidationAPIError("ID de fornecedor inválido")
            
        supplier = Supplier.query.get(supplier_uuid)
        
        if not supplier:
            raise ResourceAPIError(
                "Fornecedor não encontrado",
                error_code=4040,
                status_code=404
            )
        
        return jsonify({
            'success': True,
            'data': supplier.to_dict()
        })
        
    except ResourceAPIError:
        raise
    except Exception as e:
        return jsonify({
            'success': False,
            'error': f'Erro ao obter fornecedor: {str(e)}'
        }), 500


@suppliers_bp.route("/<supplier_id>", methods=["PUT"])
def update_supplier(supplier_id):
    """Atualizar fornecedor"""
    try:
        supplier_uuid = convert_to_uuid(supplier_id)
        if not supplier_uuid:
            raise ValidationAPIError("ID de fornecedor inválido")
            
        supplier = Supplier.query.get(supplier_uuid)
        
        if not supplier:
            raise ResourceAPIError(
                "Fornecedor não encontrado",
                error_code=4040,
                status_code=404
            )
        
        data = request.get_json()
        
        if not data:
            raise ValidationAPIError("Dados não fornecidos")
        
        # Verificar se CNPJ já existe (exceto para o próprio fornecedor)
        if 'cnpj' in data and data['cnpj'] != supplier.cnpj:
            existing_supplier = Supplier.query.filter_by(cnpj=data['cnpj']).first()
            if existing_supplier:
                raise ResourceAPIError(
                    "CNPJ já cadastrado",
                    error_code=4091,
                    status_code=409
                )
        
        # Atualizar campos
        updateable_fields = [
            'name', 'email', 'cnpj', 'phone', 'contact_person',
            'address', 'city', 'state', 'postal_code', 'country',
            'status', 'payment_terms', 'delivery_time', 'notes'
        ]
        
        for field in updateable_fields:
            if field in data:
                setattr(supplier, field, data[field])
        
        supplier.updated_at = datetime.utcnow()
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Fornecedor atualizado com sucesso',
            'data': supplier.to_dict()
        })
        
    except (ValidationAPIError, ResourceAPIError):
        raise
    except Exception as e:
        return jsonify({
            'success': False,
            'error': f'Erro ao atualizar fornecedor: {str(e)}'
        }), 500


@suppliers_bp.route("/<supplier_id>", methods=["DELETE"])
def delete_supplier(supplier_id):
    """Deletar fornecedor"""
    try:
        supplier_uuid = convert_to_uuid(supplier_id)
        if not supplier_uuid:
            raise ValidationAPIError("ID de fornecedor inválido")
            
        supplier = Supplier.query.get(supplier_uuid)
        
        if not supplier:
            raise ResourceAPIError(
                "Fornecedor não encontrado",
                error_code=4040,
                status_code=404
            )
        
        db.session.delete(supplier)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Fornecedor deletado com sucesso'
        })
        
    except ResourceAPIError:
        raise
    except Exception as e:
        return jsonify({
            'success': False,
            'error': f'Erro ao deletar fornecedor: {str(e)}'
        }), 500


@suppliers_bp.route("/<supplier_id>/status", methods=["PATCH"])
def update_supplier_status(supplier_id):
    """Atualizar status do fornecedor"""
    try:
        supplier_uuid = convert_to_uuid(supplier_id)
        if not supplier_uuid:
            raise ValidationAPIError("ID de fornecedor inválido")
            
        supplier = Supplier.query.get(supplier_uuid)
        
        if not supplier:
            raise ResourceAPIError(
                "Fornecedor não encontrado",
                error_code=4040,
                status_code=404
            )
        
        data = request.get_json()
        
        if not data or 'status' not in data:
            raise ValidationAPIError("Status é obrigatório")
        
        valid_statuses = ['active', 'inactive', 'blocked']
        if data['status'] not in valid_statuses:
            raise ValidationAPIError(
                f"Status inválido. Valores válidos: {', '.join(valid_statuses)}"
            )
        
        supplier.status = data['status']
        supplier.updated_at = datetime.utcnow()
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Status do fornecedor atualizado com sucesso',
            'data': supplier.to_dict()
        })
        
    except (ValidationAPIError, ResourceAPIError):
        raise
    except Exception as e:
        return jsonify({
            'success': False,
            'error': f'Erro ao atualizar status: {str(e)}'
        }), 500