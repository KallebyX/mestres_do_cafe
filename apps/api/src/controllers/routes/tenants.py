"""
Rotas para Gerenciamento de Multi-Tenancy
Endpoints para criação e gestão de franquias/lojas
"""

from flask import Blueprint, jsonify, request, g
from services.tenant_service import tenant_service, TenantMiddleware
from models.tenants import Tenant, TenantSettings
from middleware.security import rate_limit, validate_input
from utils.monitoring import monitor_performance

tenants_bp = Blueprint('tenants', __name__)

@tenants_bp.route('/create', methods=['POST'])
@rate_limit("auth")
@validate_input()
@monitor_performance()
def create_tenant():
    """Cria novo tenant (franquia/loja)"""
    try:
        data = request.get_json()
        
        # Validações obrigatórias
        required_fields = ['name', 'slug', 'owner_name', 'owner_email']
        for field in required_fields:
            if not data.get(field):
                return jsonify({
                    "success": False,
                    "error": f"Campo '{field}' é obrigatório"
                }), 400
        
        # Validação do slug (apenas letras, números e hífen)
        import re
        if not re.match(r'^[a-z0-9-]+$', data['slug']):
            return jsonify({
                "success": False,
                "error": "Slug deve conter apenas letras minúsculas, números e hífen"
            }), 400
        
        result = tenant_service.create_tenant(data)
        
        if result['success']:
            return jsonify(result), 201
        else:
            return jsonify(result), 400
            
    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

@tenants_bp.route('/<slug>', methods=['GET'])
@rate_limit("api")
def get_tenant_by_slug(slug):
    """Obtém informações públicas do tenant por slug"""
    try:
        tenant = tenant_service.get_tenant_by_slug(slug)
        
        if not tenant:
            return jsonify({
                "success": False,
                "error": "Tenant não encontrado"
            }), 404
        
        # Retorna apenas informações públicas
        public_info = {
            'id': tenant.id,
            'name': tenant.name,
            'slug': tenant.slug,
            'status': tenant.status,
            'created_at': tenant.created_at.isoformat()
        }
        
        # Adiciona configurações de loja se disponível
        settings = tenant_service.get_tenant_settings(tenant.id)
        if settings:
            public_info['store'] = {
                'name': settings.store_name,
                'description': settings.store_description,
                'primary_color': settings.primary_color,
                'secondary_color': settings.secondary_color,
                'font_family': settings.font_family
            }
        
        return jsonify({
            "success": True,
            "data": public_info
        })
        
    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

@tenants_bp.route('/current', methods=['GET'])
@rate_limit("api")
@TenantMiddleware.require_tenant()
def get_current_tenant():
    """Obtém informações do tenant atual"""
    try:
        tenant = TenantMiddleware.get_current_tenant()
        
        # Informações completas para tenant atual
        tenant_data = tenant.to_dict()
        
        # Adiciona estatísticas de uso
        usage = tenant_service.get_tenant_usage(tenant.id)
        tenant_data['usage'] = usage.get('usage', {})
        tenant_data['trial_info'] = usage.get('trial_info', {})
        
        # Adiciona configurações
        settings = tenant_service.get_tenant_settings(tenant.id)
        if settings:
            tenant_data['settings'] = settings.to_dict()
        
        return jsonify({
            "success": True,
            "data": tenant_data
        })
        
    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

@tenants_bp.route('/current/settings', methods=['GET'])
@rate_limit("api")
@TenantMiddleware.require_tenant()
def get_tenant_settings():
    """Obtém configurações do tenant atual"""
    try:
        tenant_id = TenantMiddleware.get_current_tenant_id()
        settings = tenant_service.get_tenant_settings(tenant_id)
        
        if not settings:
            return jsonify({
                "success": False,
                "error": "Configurações não encontradas"
            }), 404
        
        return jsonify({
            "success": True,
            "data": settings.to_dict()
        })
        
    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

@tenants_bp.route('/current/settings', methods=['PUT'])
@rate_limit("auth")
@validate_input()
@TenantMiddleware.require_tenant()
def update_tenant_settings():
    """Atualiza configurações do tenant atual"""
    try:
        data = request.get_json()
        tenant_id = TenantMiddleware.get_current_tenant_id()
        
        result = tenant_service.update_tenant_settings(tenant_id, data)
        
        if result['success']:
            return jsonify(result)
        else:
            return jsonify(result), 400
            
    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

@tenants_bp.route('/current/usage', methods=['GET'])
@rate_limit("api")
@TenantMiddleware.require_tenant()
def get_tenant_usage():
    """Obtém estatísticas de uso do tenant atual"""
    try:
        tenant_id = TenantMiddleware.get_current_tenant_id()
        usage = tenant_service.get_tenant_usage(tenant_id)
        
        return jsonify({
            "success": True,
            "data": usage
        })
        
    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

@tenants_bp.route('/current/analytics', methods=['GET'])
@rate_limit("api")
@TenantMiddleware.require_tenant()
@monitor_performance()
def get_tenant_analytics():
    """Obtém analytics do tenant atual"""
    try:
        tenant_id = TenantMiddleware.get_current_tenant_id()
        days = request.args.get('days', 30, type=int)
        
        if days < 1 or days > 365:
            return jsonify({
                "success": False,
                "error": "Parâmetro 'days' deve estar entre 1 e 365"
            }), 400
        
        analytics = tenant_service.get_tenant_analytics(tenant_id, days)
        
        return jsonify({
            "success": True,
            "data": analytics
        })
        
    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

@tenants_bp.route('/current/upgrade', methods=['POST'])
@rate_limit("auth")
@validate_input()
@TenantMiddleware.require_tenant()
def upgrade_tenant_plan():
    """Atualiza plano do tenant atual"""
    try:
        data = request.get_json()
        new_plan = data.get('plan_type')
        
        if not new_plan:
            return jsonify({
                "success": False,
                "error": "Campo 'plan_type' é obrigatório"
            }), 400
        
        valid_plans = ['basic', 'premium', 'enterprise']
        if new_plan not in valid_plans:
            return jsonify({
                "success": False,
                "error": f"Plano deve ser um de: {', '.join(valid_plans)}"
            }), 400
        
        tenant_id = TenantMiddleware.get_current_tenant_id()
        result = tenant_service.upgrade_tenant_plan(tenant_id, new_plan)
        
        if result['success']:
            return jsonify(result)
        else:
            return jsonify(result), 400
            
    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

@tenants_bp.route('/validate-slug', methods=['POST'])
@rate_limit("api")
@validate_input()
def validate_tenant_slug():
    """Valida se slug está disponível"""
    try:
        data = request.get_json()
        slug = data.get('slug')
        
        if not slug:
            return jsonify({
                "success": False,
                "error": "Campo 'slug' é obrigatório"
            }), 400
        
        # Validação do formato
        import re
        if not re.match(r'^[a-z0-9-]+$', slug):
            return jsonify({
                "success": False,
                "available": False,
                "error": "Slug deve conter apenas letras minúsculas, números e hífen"
            }), 400
        
        # Verifica disponibilidade
        existing_tenant = tenant_service.get_tenant_by_slug(slug)
        available = existing_tenant is None
        
        return jsonify({
            "success": True,
            "slug": slug,
            "available": available,
            "message": "Slug disponível" if available else "Slug já está em uso"
        })
        
    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

@tenants_bp.route('/plans', methods=['GET'])
@rate_limit("api")
def get_available_plans():
    """Obtém planos disponíveis"""
    try:
        plans = {
            'trial': {
                'name': 'Trial',
                'price': 0,
                'duration_days': 30,
                'max_products': 50,
                'max_orders_per_month': 100,
                'max_storage_mb': 500,
                'features': [
                    'Loja online básica',
                    'Até 50 produtos',
                    'Até 100 pedidos/mês',
                    '500MB de armazenamento',
                    'Suporte básico'
                ]
            },
            'basic': {
                'name': 'Básico',
                'price': 2900,  # R$ 29,00
                'duration_days': 30,
                'max_products': 100,
                'max_orders_per_month': 500,
                'max_storage_mb': 1000,
                'features': [
                    'Loja online completa',
                    'Até 100 produtos',
                    'Até 500 pedidos/mês',
                    '1GB de armazenamento',
                    'Suporte via email',
                    'Relatórios básicos'
                ]
            },
            'premium': {
                'name': 'Premium',
                'price': 4900,  # R$ 49,00
                'duration_days': 30,
                'max_products': 500,
                'max_orders_per_month': 2000,
                'max_storage_mb': 5000,
                'features': [
                    'Todas as funcionalidades do Básico',
                    'Até 500 produtos',
                    'Até 2000 pedidos/mês',
                    '5GB de armazenamento',
                    'Analytics avançados',
                    'Recomendações com IA',
                    'Suporte prioritário',
                    'Domínio personalizado'
                ]
            },
            'enterprise': {
                'name': 'Enterprise',
                'price': 9900,  # R$ 99,00
                'duration_days': 30,
                'max_products': -1,  # Ilimitado
                'max_orders_per_month': -1,  # Ilimitado
                'max_storage_mb': 20000,
                'features': [
                    'Todas as funcionalidades do Premium',
                    'Produtos ilimitados',
                    'Pedidos ilimitados',
                    '20GB de armazenamento',
                    'Multi-usuários',
                    'API personalizada',
                    'Suporte 24/7',
                    'Gerente de conta dedicado',
                    'Integrações customizadas'
                ]
            }
        }
        
        return jsonify({
            "success": True,
            "data": {
                "plans": plans,
                "currency": "BRL"
            }
        })
        
    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

# Middleware para resolução automática de tenant
@tenants_bp.before_app_request
def resolve_tenant():
    """Resolve tenant automaticamente antes de cada requisição"""
    try:
        # Pula resolução para rotas que não precisam de tenant
        skip_routes = [
            '/api/tenants/create',
            '/api/tenants/validate-slug',
            '/api/tenants/plans',
            '/api/health',
            '/api/auth/login',
            '/api/auth/register'
        ]
        
        if request.path in skip_routes:
            return
        
        # Resolve tenant
        tenant = tenant_service.resolve_tenant_from_request()
        TenantMiddleware.set_current_tenant(tenant)
        
    except Exception as e:
        # Log erro mas não bloqueia requisição
        from flask import current_app
        current_app.logger.warning(f"Erro ao resolver tenant: {e}")