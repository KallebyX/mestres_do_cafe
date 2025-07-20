"""
Serviço de Multi-Tenancy para Franquias
Gerenciamento de tenants, isolamento de dados e configurações
"""

from datetime import datetime, timedelta
from typing import Dict, List, Any, Optional
from flask import g, request, current_app
from sqlalchemy import and_, or_

from database import db
from models.tenants import Tenant, TenantSubscription, TenantSettings
from utils.cache import cache_manager, cached

class TenantService:
    """Serviço principal de gerenciamento de tenants"""
    
    def __init__(self):
        self.cache_timeout = 1800  # 30 minutos
    
    def create_tenant(self, tenant_data: Dict[str, Any]) -> Dict[str, Any]:
        """Cria novo tenant com configurações iniciais"""
        
        try:
            # Validações básicas
            required_fields = ['name', 'slug', 'owner_name', 'owner_email']
            for field in required_fields:
                if not tenant_data.get(field):
                    return {'success': False, 'error': f'Campo {field} é obrigatório'}
            
            # Verifica se slug já existe
            existing_tenant = Tenant.query.filter_by(slug=tenant_data['slug']).first()
            if existing_tenant:
                return {'success': False, 'error': 'Slug já está em uso'}
            
            # Cria o tenant
            tenant = Tenant(
                name=tenant_data['name'],
                slug=tenant_data['slug'],
                owner_name=tenant_data['owner_name'],
                owner_email=tenant_data['owner_email'],
                owner_phone=tenant_data.get('owner_phone'),
                domain=tenant_data.get('domain'),
                plan_type=tenant_data.get('plan_type', 'trial'),
                cnpj=tenant_data.get('cnpj'),
                
                # Configurações padrão para trial
                max_products=tenant_data.get('max_products', 50),
                max_orders_per_month=tenant_data.get('max_orders_per_month', 100),
                max_storage_mb=tenant_data.get('max_storage_mb', 500),
                
                # Trial de 30 dias
                trial_ends_at=datetime.utcnow() + timedelta(days=30),
                
                # Configurações padrão
                settings={
                    'notifications_enabled': True,
                    'analytics_enabled': True,
                    'seo_enabled': True
                },
                theme_config={
                    'primary_color': '#2563eb',
                    'secondary_color': '#f3f4f6',
                    'font_family': 'Inter'
                }
            )
            
            db.session.add(tenant)
            db.session.commit()
            
            # Cria configurações iniciais
            self._create_initial_settings(tenant.id)
            
            # Cria usuário admin inicial
            self._create_admin_user(tenant.id, tenant_data)
            
            # Limpa cache
            cache_manager.clear_pattern("tenant:*")
            
            return {
                'success': True,
                'tenant': tenant.to_dict(),
                'message': 'Tenant criado com sucesso'
            }
            
        except Exception as e:
            db.session.rollback()
            return {'success': False, 'error': str(e)}
    
    def _create_initial_settings(self, tenant_id: int):
        """Cria configurações iniciais do tenant"""
        
        settings = TenantSettings(
            tenant_id=tenant_id,
            store_name=f"Loja {tenant_id}",
            store_description="Sua loja de café especial",
            primary_color="#2563eb",
            secondary_color="#f3f4f6",
            font_family="Inter",
            business_hours={
                'monday': {'open': '08:00', 'close': '18:00', 'closed': False},
                'tuesday': {'open': '08:00', 'close': '18:00', 'closed': False},
                'wednesday': {'open': '08:00', 'close': '18:00', 'closed': False},
                'thursday': {'open': '08:00', 'close': '18:00', 'closed': False},
                'friday': {'open': '08:00', 'close': '18:00', 'closed': False},
                'saturday': {'open': '09:00', 'close': '17:00', 'closed': False},
                'sunday': {'open': '10:00', 'close': '16:00', 'closed': False}
            },
            allow_guest_checkout=True,
            require_phone=False,
            require_cpf=False,
            free_shipping_threshold=10000,  # R$ 100,00
            default_shipping_cost=1500      # R$ 15,00
        )
        
        db.session.add(settings)
        db.session.commit()
    
    def _create_admin_user(self, tenant_id: int, tenant_data: Dict[str, Any]):
        """Cria usuário administrador inicial"""
        
        try:
            from models.auth import User
            from werkzeug.security import generate_password_hash
            
            admin_user = User(
                tenant_id=tenant_id,
                username=tenant_data.get('admin_username', 'admin'),
                email=tenant_data['owner_email'],
                full_name=tenant_data['owner_name'],
                phone=tenant_data.get('owner_phone'),
                password_hash=generate_password_hash(tenant_data.get('admin_password', 'admin123')),
                role='admin',
                is_active=True,
                email_verified=True
            )
            
            db.session.add(admin_user)
            db.session.commit()
            
        except Exception as e:
            current_app.logger.warning(f"Erro ao criar usuário admin: {e}")
    
    @cached(timeout=1800, key_prefix="tenant")
    def get_tenant_by_slug(self, slug: str) -> Optional[Tenant]:
        """Obtém tenant por slug"""
        return Tenant.query.filter_by(slug=slug, is_active=True).first()
    
    @cached(timeout=1800, key_prefix="tenant")
    def get_tenant_by_domain(self, domain: str) -> Optional[Tenant]:
        """Obtém tenant por domínio"""
        return Tenant.query.filter_by(domain=domain, is_active=True).first()
    
    def resolve_tenant_from_request(self) -> Optional[Tenant]:
        """Resolve tenant a partir da requisição (domínio ou header)"""
        
        # 1. Tenta por domínio personalizado
        host = request.headers.get('Host', '').lower()
        if host and not host.startswith('localhost') and not host.startswith('127.0.0.1'):
            tenant = self.get_tenant_by_domain(host)
            if tenant:
                return tenant
        
        # 2. Tenta por header X-Tenant-Slug
        tenant_slug = request.headers.get('X-Tenant-Slug')
        if tenant_slug:
            return self.get_tenant_by_slug(tenant_slug)
        
        # 3. Tenta por subdomínio
        if '.' in host:
            subdomain = host.split('.')[0]
            if subdomain and subdomain != 'www':
                return self.get_tenant_by_slug(subdomain)
        
        # 4. Tenta por parâmetro na URL
        tenant_slug = request.args.get('tenant')
        if tenant_slug:
            return self.get_tenant_by_slug(tenant_slug)
        
        return None
    
    def get_tenant_usage(self, tenant_id: int) -> Dict[str, Any]:
        """Obtém estatísticas de uso do tenant"""
        
        tenant = Tenant.query.get(tenant_id)
        if not tenant:
            return {'error': 'Tenant não encontrado'}
        
        usage_stats = tenant.get_usage_stats()
        
        # Adiciona informações de assinatura
        subscription = TenantSubscription.query.filter_by(
            tenant_id=tenant_id,
            status='active'
        ).first()
        
        return {
            'tenant_id': tenant_id,
            'plan_type': tenant.plan_type,
            'status': tenant.status,
            'usage': usage_stats,
            'subscription': subscription.to_dict() if subscription else None,
            'trial_info': {
                'is_trial': tenant.plan_type == 'trial',
                'trial_ends_at': tenant.trial_ends_at.isoformat() if tenant.trial_ends_at else None,
                'is_expired': tenant.is_trial_expired()
            }
        }
    
    def update_tenant_settings(self, tenant_id: int, settings_data: Dict[str, Any]) -> Dict[str, Any]:
        """Atualiza configurações do tenant"""
        
        try:
            settings = TenantSettings.query.filter_by(tenant_id=tenant_id).first()
            if not settings:
                return {'success': False, 'error': 'Configurações não encontradas'}
            
            # Atualiza campos permitidos
            allowed_fields = [
                'store_name', 'store_description', 'primary_color', 'secondary_color',
                'font_family', 'timezone', 'allow_guest_checkout', 'require_phone',
                'require_cpf', 'free_shipping_threshold', 'default_shipping_cost',
                'business_hours', 'meta_title', 'meta_description', 'meta_keywords'
            ]
            
            for field in allowed_fields:
                if field in settings_data:
                    setattr(settings, field, settings_data[field])
            
            settings.updated_at = datetime.utcnow()
            db.session.commit()
            
            # Limpa cache
            cache_manager.delete(f"tenant_settings:{tenant_id}")
            
            return {
                'success': True,
                'settings': settings.to_dict(),
                'message': 'Configurações atualizadas com sucesso'
            }
            
        except Exception as e:
            db.session.rollback()
            return {'success': False, 'error': str(e)}
    
    @cached(timeout=3600, key_prefix="tenant_settings")
    def get_tenant_settings(self, tenant_id: int) -> Optional[TenantSettings]:
        """Obtém configurações do tenant"""
        return TenantSettings.query.filter_by(tenant_id=tenant_id).first()
    
    def upgrade_tenant_plan(self, tenant_id: int, new_plan: str) -> Dict[str, Any]:
        """Atualiza plano do tenant"""
        
        try:
            tenant = Tenant.query.get(tenant_id)
            if not tenant:
                return {'success': False, 'error': 'Tenant não encontrado'}
            
            # Define limites por plano
            plan_limits = {
                'basic': {
                    'max_products': 100,
                    'max_orders_per_month': 500,
                    'max_storage_mb': 1000
                },
                'premium': {
                    'max_products': 500,
                    'max_orders_per_month': 2000,
                    'max_storage_mb': 5000
                },
                'enterprise': {
                    'max_products': -1,  # Ilimitado
                    'max_orders_per_month': -1,
                    'max_storage_mb': 20000
                }
            }
            
            if new_plan not in plan_limits:
                return {'success': False, 'error': 'Plano inválido'}
            
            # Atualiza tenant
            tenant.plan_type = new_plan
            tenant.status = 'active'
            
            limits = plan_limits[new_plan]
            if limits['max_products'] > 0:
                tenant.max_products = limits['max_products']
            if limits['max_orders_per_month'] > 0:
                tenant.max_orders_per_month = limits['max_orders_per_month']
            tenant.max_storage_mb = limits['max_storage_mb']
            
            # Se saindo do trial, remove data de expiração
            if tenant.plan_type != 'trial':
                tenant.trial_ends_at = None
            
            tenant.updated_at = datetime.utcnow()
            db.session.commit()
            
            # Limpa cache
            cache_manager.clear_pattern(f"tenant:{tenant_id}*")
            
            return {
                'success': True,
                'tenant': tenant.to_dict(),
                'message': f'Plano atualizado para {new_plan}'
            }
            
        except Exception as e:
            db.session.rollback()
            return {'success': False, 'error': str(e)}
    
    def get_tenant_analytics(self, tenant_id: int, days: int = 30) -> Dict[str, Any]:
        """Analytics específicos do tenant"""
        
        try:
            from datetime import datetime, timedelta
            from models.orders import Order
            from models.products import Product
            from models.customers import Customer
            
            end_date = datetime.utcnow()
            start_date = end_date - timedelta(days=days)
            
            # Métricas básicas
            total_orders = Order.query.filter(
                Order.tenant_id == tenant_id,
                Order.created_at.between(start_date, end_date)
            ).count()
            
            total_revenue = db.session.query(
                db.func.sum(Order.total_amount)
            ).filter(
                Order.tenant_id == tenant_id,
                Order.created_at.between(start_date, end_date),
                Order.status.in_(['completed', 'shipped', 'delivered'])
            ).scalar() or 0
            
            active_products = Product.query.filter(
                Product.tenant_id == tenant_id,
                Product.is_active == True
            ).count()
            
            total_customers = Customer.query.filter(
                Customer.tenant_id == tenant_id
            ).count()
            
            return {
                'tenant_id': tenant_id,
                'period_days': days,
                'metrics': {
                    'total_orders': total_orders,
                    'total_revenue': float(total_revenue),
                    'active_products': active_products,
                    'total_customers': total_customers,
                    'avg_order_value': float(total_revenue / max(total_orders, 1))
                },
                'generated_at': datetime.utcnow().isoformat()
            }
            
        except Exception as e:
            return {'error': str(e)}

class TenantMiddleware:
    """Middleware para isolamento de dados por tenant"""
    
    @staticmethod
    def set_current_tenant(tenant: Tenant):
        """Define o tenant atual no contexto da requisição"""
        g.current_tenant = tenant
        g.current_tenant_id = tenant.id if tenant else None
    
    @staticmethod
    def get_current_tenant() -> Optional[Tenant]:
        """Obtém o tenant atual"""
        return getattr(g, 'current_tenant', None)
    
    @staticmethod
    def get_current_tenant_id() -> Optional[int]:
        """Obtém o ID do tenant atual"""
        return getattr(g, 'current_tenant_id', None)
    
    @staticmethod
    def require_tenant():
        """Decorator que exige tenant válido"""
        def decorator(f):
            from functools import wraps
            
            @wraps(f)
            def decorated_function(*args, **kwargs):
                if not TenantMiddleware.get_current_tenant():
                    from flask import jsonify
                    return jsonify({
                        'error': 'Tenant requerido',
                        'code': 'TENANT_REQUIRED'
                    }), 400
                return f(*args, **kwargs)
            return decorated_function
        return decorator

# Instância global
tenant_service = TenantService()