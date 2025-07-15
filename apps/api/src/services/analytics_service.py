"""
Sistema avançado de Analytics e Business Intelligence
Coleta, processa e analisa dados para insights de negócio
"""

from datetime import datetime, timedelta

# Importações opcionais de ML
try:
    import pandas as pd
    import numpy as np
    ML_AVAILABLE = True
except ImportError:
    ML_AVAILABLE = False
    pd = None
    np = None
from typing import Dict, List, Any, Optional
from collections import defaultdict
from sqlalchemy import func, text, and_, or_
from ..database import db
from ..models.orders import Order
from ..models.products import Product, ProductCategory
from ..models.customers import Customer
from ..models.payments import Payment
from ..utils.cache import cache_manager, cached

class AnalyticsService:
    """Serviço de analytics com métricas avançadas de negócio"""
    
    def __init__(self):
        self.cache_timeout = 1800  # 30 minutos
    
    @cached(timeout=1800, key_prefix="analytics")
    def get_sales_dashboard(self, days: int = 30) -> Dict[str, Any]:
        """Dashboard completo de vendas"""
        end_date = datetime.now()
        start_date = end_date - timedelta(days=days)
        
        # Vendas por período
        sales_data = self._get_sales_by_period(start_date, end_date)
        
        # Produtos mais vendidos
        top_products = self._get_top_products(start_date, end_date)
        
        # Performance por categoria
        category_performance = self._get_category_performance(start_date, end_date)
        
        # Métricas de clientes
        customer_metrics = self._get_customer_metrics(start_date, end_date)
        
        # Análise de conversão
        conversion_metrics = self._get_conversion_metrics(start_date, end_date)
        
        # Análise de pagamentos
        payment_analysis = self._get_payment_analysis(start_date, end_date)
        
        return {
            "period": {"start": start_date.isoformat(), "end": end_date.isoformat()},
            "sales": sales_data,
            "top_products": top_products,
            "categories": category_performance,
            "customers": customer_metrics,
            "conversion": conversion_metrics,
            "payments": payment_analysis
        }
    
    def _get_sales_by_period(self, start_date: datetime, end_date: datetime) -> Dict[str, Any]:
        """Análise de vendas por período"""
        
        # Vendas totais
        total_orders = Order.query.filter(
            Order.created_at.between(start_date, end_date),
            Order.status.in_(['completed', 'shipped', 'delivered'])
        ).count()
        
        total_revenue = db.session.query(func.sum(Order.total_amount)).filter(
            Order.created_at.between(start_date, end_date),
            Order.status.in_(['completed', 'shipped', 'delivered'])
        ).scalar() or 0
        
        # Ticket médio
        avg_order_value = total_revenue / max(total_orders, 1)
        
        # Vendas por dia (últimos 30 dias)
        daily_sales = db.session.query(
            func.date(Order.created_at).label('date'),
            func.count(Order.id).label('orders'),
            func.sum(Order.total_amount).label('revenue')
        ).filter(
            Order.created_at.between(start_date, end_date),
            Order.status.in_(['completed', 'shipped', 'delivered'])
        ).group_by(func.date(Order.created_at)).all()
        
        # Tendências
        previous_period_start = start_date - (end_date - start_date)
        previous_revenue = db.session.query(func.sum(Order.total_amount)).filter(
            Order.created_at.between(previous_period_start, start_date),
            Order.status.in_(['completed', 'shipped', 'delivered'])
        ).scalar() or 0
        
        revenue_growth = ((total_revenue - previous_revenue) / max(previous_revenue, 1)) * 100
        
        return {
            "total_orders": total_orders,
            "total_revenue": float(total_revenue),
            "avg_order_value": float(avg_order_value),
            "revenue_growth_percent": float(revenue_growth),
            "daily_breakdown": [
                {
                    "date": day.date.isoformat(),
                    "orders": day.orders,
                    "revenue": float(day.revenue or 0)
                }
                for day in daily_sales
            ]
        }
    
    def _get_top_products(self, start_date: datetime, end_date: datetime, limit: int = 10) -> List[Dict[str, Any]]:
        """Top produtos por vendas"""
        
        # Query complexa para pegar produtos mais vendidos
        top_products = db.session.query(
            Product.id,
            Product.name,
            Product.price,
            func.sum(text("order_items.quantity")).label('total_sold'),
            func.sum(text("order_items.quantity * order_items.price")).label('total_revenue'),
            func.count(text("DISTINCT orders.id")).label('order_count')
        ).join(
            text("order_items"), text("products.id = order_items.product_id")
        ).join(
            text("orders"), text("order_items.order_id = orders.id")
        ).filter(
            text("orders.created_at BETWEEN :start_date AND :end_date"),
            text("orders.status IN ('completed', 'shipped', 'delivered')")
        ).params(
            start_date=start_date,
            end_date=end_date
        ).group_by(
            Product.id, Product.name, Product.price
        ).order_by(
            text("total_revenue DESC")
        ).limit(limit).all()
        
        return [
            {
                "product_id": product.id,
                "name": product.name,
                "price": float(product.price),
                "units_sold": int(product.total_sold),
                "revenue": float(product.total_revenue),
                "orders": int(product.order_count)
            }
            for product in top_products
        ]
    
    def _get_category_performance(self, start_date: datetime, end_date: datetime) -> List[Dict[str, Any]]:
        """Performance por categoria"""
        
        category_data = db.session.query(
            ProductCategory.id,
            ProductCategory.name,
            func.count(text("DISTINCT orders.id")).label('orders'),
            func.sum(text("order_items.quantity")).label('units_sold'),
            func.sum(text("order_items.quantity * order_items.price")).label('revenue')
        ).join(
            Product, ProductCategory.id == Product.category_id
        ).join(
            text("order_items"), text("products.id = order_items.product_id")
        ).join(
            text("orders"), text("order_items.order_id = orders.id")
        ).filter(
            text("orders.created_at BETWEEN :start_date AND :end_date"),
            text("orders.status IN ('completed', 'shipped', 'delivered')")
        ).params(
            start_date=start_date,
            end_date=end_date
        ).group_by(
            ProductCategory.id, ProductCategory.name
        ).order_by(
            text("revenue DESC")
        ).all()
        
        return [
            {
                "category_id": cat.id,
                "name": cat.name,
                "orders": int(cat.orders),
                "units_sold": int(cat.units_sold or 0),
                "revenue": float(cat.revenue or 0)
            }
            for cat in category_data
        ]
    
    def _get_customer_metrics(self, start_date: datetime, end_date: datetime) -> Dict[str, Any]:
        """Métricas de clientes"""
        
        # Novos clientes
        new_customers = Customer.query.filter(
            Customer.created_at.between(start_date, end_date)
        ).count()
        
        # Clientes ativos (que fizeram pedidos)
        active_customers = db.session.query(
            func.count(func.distinct(Order.customer_id))
        ).filter(
            Order.created_at.between(start_date, end_date),
            Order.status.in_(['completed', 'shipped', 'delivered'])
        ).scalar() or 0
        
        # CLV (Customer Lifetime Value) médio
        clv_data = db.session.query(
            func.avg(func.sum(Order.total_amount))
        ).filter(
            Order.status.in_(['completed', 'shipped', 'delivered'])
        ).group_by(Order.customer_id).scalar() or 0
        
        # Taxa de retenção (clientes que compraram mais de uma vez)
        repeat_customers = db.session.query(
            func.count(func.distinct(Order.customer_id))
        ).filter(
            Order.status.in_(['completed', 'shipped', 'delivered'])
        ).group_by(Order.customer_id).having(
            func.count(Order.id) > 1
        ).count()
        
        retention_rate = (repeat_customers / max(active_customers, 1)) * 100
        
        return {
            "new_customers": new_customers,
            "active_customers": active_customers,
            "avg_clv": float(clv_data),
            "retention_rate_percent": float(retention_rate)
        }
    
    def _get_conversion_metrics(self, start_date: datetime, end_date: datetime) -> Dict[str, Any]:
        """Métricas de conversão"""
        
        # Para simplicidade, usando dados estimados
        # Em produção, implementar tracking de eventos
        
        total_visitors = 10000  # Estimativa baseada em analytics web
        total_orders = Order.query.filter(
            Order.created_at.between(start_date, end_date)
        ).count()
        
        conversion_rate = (total_orders / max(total_visitors, 1)) * 100
        
        # Taxa de abandono de carrinho (estimativa)
        cart_abandonment = 68.5  # Média da indústria
        
        return {
            "total_visitors": total_visitors,
            "conversion_rate_percent": float(conversion_rate),
            "cart_abandonment_percent": cart_abandonment
        }
    
    def _get_payment_analysis(self, start_date: datetime, end_date: datetime) -> Dict[str, Any]:
        """Análise de métodos de pagamento"""
        
        payment_methods = db.session.query(
            Payment.payment_method,
            func.count(Payment.id).label('count'),
            func.sum(Payment.amount).label('total_amount'),
            func.avg(Payment.amount).label('avg_amount')
        ).filter(
            Payment.created_at.between(start_date, end_date),
            Payment.status == 'completed'
        ).group_by(Payment.payment_method).all()
        
        return {
            "methods": [
                {
                    "method": method.payment_method,
                    "count": int(method.count),
                    "total_amount": float(method.total_amount or 0),
                    "avg_amount": float(method.avg_amount or 0)
                }
                for method in payment_methods
            ]
        }
    
    @cached(timeout=3600, key_prefix="analytics_cohort")
    def get_cohort_analysis(self, months: int = 12) -> Dict[str, Any]:
        """Análise de coorte de clientes"""
        
        # Implementação simplificada da análise de coorte
        cohort_data = []
        
        for i in range(months):
            month_start = datetime.now().replace(day=1) - timedelta(days=30*i)
            month_end = month_start + timedelta(days=30)
            
            # Clientes que fizeram primeira compra neste mês
            first_time_customers = db.session.query(
                func.count(func.distinct(Order.customer_id))
            ).filter(
                Order.created_at.between(month_start, month_end)
            ).group_by(Order.customer_id).having(
                func.min(Order.created_at).between(month_start, month_end)
            ).count()
            
            cohort_data.append({
                "month": month_start.strftime("%Y-%m"),
                "new_customers": first_time_customers
            })
        
        return {"cohorts": cohort_data}
    
    @cached(timeout=900, key_prefix="analytics_realtime")
    def get_realtime_metrics(self) -> Dict[str, Any]:
        """Métricas em tempo real"""
        
        now = datetime.now()
        today_start = now.replace(hour=0, minute=0, second=0, microsecond=0)
        hour_ago = now - timedelta(hours=1)
        
        # Vendas de hoje
        today_orders = Order.query.filter(
            Order.created_at >= today_start
        ).count()
        
        today_revenue = db.session.query(func.sum(Order.total_amount)).filter(
            Order.created_at >= today_start,
            Order.status.in_(['completed', 'shipped', 'delivered'])
        ).scalar() or 0
        
        # Última hora
        last_hour_orders = Order.query.filter(
            Order.created_at >= hour_ago
        ).count()
        
        # Produtos em baixo estoque (menos de 10 unidades)
        low_stock = Product.query.filter(
            Product.stock_quantity < 10,
            Product.is_active == True
        ).count()
        
        return {
            "timestamp": now.isoformat(),
            "today": {
                "orders": today_orders,
                "revenue": float(today_revenue)
            },
            "last_hour": {
                "orders": last_hour_orders
            },
            "alerts": {
                "low_stock_products": low_stock
            }
        }

class BusinessIntelligenceService:
    """Serviço de Business Intelligence com insights avançados"""
    
    def __init__(self):
        self.analytics = AnalyticsService()
    
    def generate_executive_report(self, period_days: int = 30) -> Dict[str, Any]:
        """Relatório executivo completo"""
        
        dashboard_data = self.analytics.get_sales_dashboard(period_days)
        cohort_data = self.analytics.get_cohort_analysis()
        
        # Insights automáticos
        insights = self._generate_insights(dashboard_data)
        
        # Previsões
        forecasts = self._generate_forecasts(dashboard_data)
        
        # Recomendações
        recommendations = self._generate_recommendations(dashboard_data, insights)
        
        return {
            "report_date": datetime.now().isoformat(),
            "period_days": period_days,
            "executive_summary": self._create_executive_summary(dashboard_data),
            "kpis": self._extract_key_kpis(dashboard_data),
            "insights": insights,
            "forecasts": forecasts,
            "recommendations": recommendations,
            "detailed_data": dashboard_data
        }
    
    def _create_executive_summary(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Resumo executivo dos principais números"""
        
        return {
            "revenue": {
                "total": data["sales"]["total_revenue"],
                "growth": data["sales"]["revenue_growth_percent"],
                "avg_order_value": data["sales"]["avg_order_value"]
            },
            "customers": {
                "new": data["customers"]["new_customers"],
                "active": data["customers"]["active_customers"],
                "retention_rate": data["customers"]["retention_rate_percent"]
            },
            "performance": {
                "total_orders": data["sales"]["total_orders"],
                "conversion_rate": data["conversion"]["conversion_rate_percent"]
            }
        }
    
    def _extract_key_kpis(self, data: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Extrai KPIs principais"""
        
        return [
            {
                "name": "Receita Total",
                "value": data["sales"]["total_revenue"],
                "format": "currency",
                "trend": "up" if data["sales"]["revenue_growth_percent"] > 0 else "down",
                "change": data["sales"]["revenue_growth_percent"]
            },
            {
                "name": "Pedidos",
                "value": data["sales"]["total_orders"],
                "format": "number",
                "trend": "neutral"
            },
            {
                "name": "Ticket Médio",
                "value": data["sales"]["avg_order_value"],
                "format": "currency",
                "trend": "neutral"
            },
            {
                "name": "Taxa de Retenção",
                "value": data["customers"]["retention_rate_percent"],
                "format": "percentage",
                "trend": "up" if data["customers"]["retention_rate_percent"] > 30 else "down"
            }
        ]
    
    def _generate_insights(self, data: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Gera insights automáticos baseados nos dados"""
        
        insights = []
        
        # Insight sobre crescimento
        if data["sales"]["revenue_growth_percent"] > 10:
            insights.append({
                "type": "positive",
                "category": "growth",
                "title": "Crescimento Acelerado",
                "description": f"Receita cresceu {data['sales']['revenue_growth_percent']:.1f}% no período",
                "impact": "high"
            })
        elif data["sales"]["revenue_growth_percent"] < -5:
            insights.append({
                "type": "negative",
                "category": "growth",
                "title": "Queda nas Vendas",
                "description": f"Receita caiu {abs(data['sales']['revenue_growth_percent']):.1f}% no período",
                "impact": "high"
            })
        
        # Insight sobre produtos
        if data["top_products"]:
            top_product = data["top_products"][0]
            insights.append({
                "type": "informational",
                "category": "products",
                "title": "Produto Destaque",
                "description": f"{top_product['name']} gerou R$ {top_product['revenue']:.2f} em vendas",
                "impact": "medium"
            })
        
        # Insight sobre clientes
        if data["customers"]["retention_rate_percent"] > 40:
            insights.append({
                "type": "positive",
                "category": "customers",
                "title": "Alta Retenção",
                "description": f"Taxa de retenção de {data['customers']['retention_rate_percent']:.1f}% está acima da média",
                "impact": "medium"
            })
        
        return insights
    
    def _generate_forecasts(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Gera previsões baseadas em tendências"""
        
        # Previsão simples baseada na tendência atual
        current_revenue = data["sales"]["total_revenue"]
        growth_rate = data["sales"]["revenue_growth_percent"] / 100
        
        next_month_forecast = current_revenue * (1 + growth_rate)
        next_quarter_forecast = current_revenue * (1 + growth_rate) ** 3
        
        return {
            "revenue": {
                "next_month": next_month_forecast,
                "next_quarter": next_quarter_forecast,
                "confidence": "medium"
            },
            "methodology": "Baseado na tendência de crescimento atual"
        }
    
    def _generate_recommendations(self, data: Dict[str, Any], insights: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Gera recomendações baseadas nos dados e insights"""
        
        recommendations = []
        
        # Recomendações baseadas em produtos
        if data["top_products"]:
            recommendations.append({
                "category": "inventory",
                "priority": "high",
                "title": "Otimizar Estoque dos Best-Sellers",
                "description": f"Focar estoque nos top 3 produtos que geram {sum(p['revenue'] for p in data['top_products'][:3]):.2f} de receita",
                "action_items": [
                    "Aumentar estoque dos produtos mais vendidos",
                    "Negociar melhores preços com fornecedores",
                    "Criar bundles com produtos populares"
                ]
            })
        
        # Recomendações baseadas em conversão
        if data["conversion"]["conversion_rate_percent"] < 2:
            recommendations.append({
                "category": "marketing",
                "priority": "medium",
                "title": "Melhorar Taxa de Conversão",
                "description": f"Taxa atual de {data['conversion']['conversion_rate_percent']:.2f}% está abaixo da média",
                "action_items": [
                    "Otimizar páginas de produto",
                    "Implementar remarketing",
                    "Melhorar processo de checkout"
                ]
            })
        
        return recommendations

# Instâncias globais
analytics_service = AnalyticsService()
bi_service = BusinessIntelligenceService()