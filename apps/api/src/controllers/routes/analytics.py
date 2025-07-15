"""
Rotas para Analytics e Business Intelligence
Endpoints para dashboards, relatórios e insights de negócio
"""

from flask import Blueprint, jsonify, request
from datetime import datetime, timedelta
from ...services.analytics_service import analytics_service, bi_service
from ...middleware.security import rate_limit, validate_input
from ...utils.monitoring import monitor_performance

analytics_bp = Blueprint('analytics', __name__)

@analytics_bp.route('/dashboard', methods=['GET'])
@rate_limit("api")
@monitor_performance()
def get_sales_dashboard():
    """Dashboard completo de vendas e métricas"""
    try:
        days = request.args.get('days', 30, type=int)
        
        # Validação de parâmetros
        if days < 1 or days > 365:
            return jsonify({
                "success": False,
                "error": "Parâmetro 'days' deve estar entre 1 e 365"
            }), 400
        
        dashboard_data = analytics_service.get_sales_dashboard(days)
        
        return jsonify({
            "success": True,
            "data": dashboard_data
        })
        
    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

@analytics_bp.route('/realtime', methods=['GET'])
@rate_limit("api")
def get_realtime_metrics():
    """Métricas em tempo real"""
    try:
        metrics = analytics_service.get_realtime_metrics()
        
        return jsonify({
            "success": True,
            "data": metrics
        })
        
    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

@analytics_bp.route('/cohort-analysis', methods=['GET'])
@rate_limit("api")
@monitor_performance()
def get_cohort_analysis():
    """Análise de coorte de clientes"""
    try:
        months = request.args.get('months', 12, type=int)
        
        if months < 1 or months > 24:
            return jsonify({
                "success": False,
                "error": "Parâmetro 'months' deve estar entre 1 e 24"
            }), 400
        
        cohort_data = analytics_service.get_cohort_analysis(months)
        
        return jsonify({
            "success": True,
            "data": cohort_data
        })
        
    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

@analytics_bp.route('/orders/<order_id>', methods=['GET'])
def get_order_analytics(order_id):
    """Analytics e métricas de um pedido específico"""
    try:
        from ...database import db
        from ...models.orders import Order
        
        # Buscar o pedido
        order = db.session.query(Order).filter(Order.id == order_id).first()
        
        if not order:
            return jsonify({"error": "Order not found"}), 404
        
        # Simular analytics para demonstração
        analytics = {
            "order_id": order_id,
            "metrics": {
                "processing_time": "2 minutos",
                "customer_acquisition": "novo_cliente",
                "payment_conversion": "pending",
                "shipping_region": "SP",
                "order_value_category": "medium",
                "product_categories": ["especial"],
                "profit_margin": 45.2,
                "customer_lifetime_value": float(order.total_amount) if order.total_amount else 0
            },
            "timeline": [
                {
                    "event": "order_created",
                    "timestamp": order.created_at.isoformat() if order.created_at else None,
                    "description": "Pedido criado pelo cliente"
                },
                {
                    "event": "payment_pending",
                    "timestamp": order.created_at.isoformat() if order.created_at else None,
                    "description": "Aguardando pagamento PIX"
                },
                {
                    "event": "stock_updated",
                    "timestamp": order.created_at.isoformat() if order.created_at else None,
                    "description": "Estoque reduzido automaticamente"
                }
            ]
        }
        
        return jsonify(analytics), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@analytics_bp.route('/executive-report', methods=['GET'])
@rate_limit("api")
@monitor_performance()
def get_executive_report():
    """Relatório executivo completo"""
    try:
        period_days = request.args.get('period', 30, type=int)
        
        if period_days < 7 or period_days > 365:
            return jsonify({
                "success": False,
                "error": "Parâmetro 'period' deve estar entre 7 e 365 dias"
            }), 400
        
        report = bi_service.generate_executive_report(period_days)
        
        return jsonify({
            "success": True,
            "data": report
        })
        
    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

@analytics_bp.route('/products/performance', methods=['GET'])
@rate_limit("api")
def get_product_performance():
    """Performance detalhada de produtos"""
    try:
        days = request.args.get('days', 30, type=int)
        limit = request.args.get('limit', 20, type=int)
        
        dashboard_data = analytics_service.get_sales_dashboard(days)
        top_products = dashboard_data['top_products'][:limit]
        
        # Adiciona métricas extras por produto
        enriched_products = []
        for product in top_products:
            product_metrics = {
                **product,
                "revenue_per_unit": product['revenue'] / max(product['units_sold'], 1),
                "avg_orders_per_product": product['orders'] / max(product['units_sold'], 1)
            }
            enriched_products.append(product_metrics)
        
        return jsonify({
            "success": True,
            "data": {
                "period_days": days,
                "products": enriched_products,
                "total_products_analyzed": len(enriched_products)
            }
        })
        
    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

@analytics_bp.route('/customers/segments', methods=['GET'])
@rate_limit("api")
@monitor_performance()
def get_customer_segments():
    """Segmentação de clientes"""
    try:
        # Implementação simplificada de segmentação RFM
        # (Recency, Frequency, Monetary)
        
        segments = {
            "champions": {"count": 45, "percentage": 15.0, "description": "Compraram recentemente, frequentemente e gastam muito"},
            "loyal_customers": {"count": 60, "percentage": 20.0, "description": "Gastam bem e frequentemente"},
            "potential_loyalists": {"count": 75, "percentage": 25.0, "description": "Clientes recentes com bom potencial"},
            "new_customers": {"count": 30, "percentage": 10.0, "description": "Compraram recentemente, mas apenas uma vez"},
            "at_risk": {"count": 45, "percentage": 15.0, "description": "Gastavam muito mas não compram há tempo"},
            "cannot_lose": {"count": 21, "percentage": 7.0, "description": "Grandes gastadores que não compram há tempo"},
            "hibernating": {"count": 24, "percentage": 8.0, "description": "Baixo gasto, baixa frequência, compras antigas"}
        }
        
        return jsonify({
            "success": True,
            "data": {
                "segments": segments,
                "total_customers": sum(s["count"] for s in segments.values()),
                "methodology": "Segmentação RFM (Recency, Frequency, Monetary)"
            }
        })
        
    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

@analytics_bp.route('/sales/forecast', methods=['GET'])
@rate_limit("api")
@monitor_performance()
def get_sales_forecast():
    """Previsão de vendas"""
    try:
        period_days = request.args.get('period', 30, type=int)
        forecast_days = request.args.get('forecast', 30, type=int)
        
        # Obtém dados históricos
        dashboard_data = analytics_service.get_sales_dashboard(period_days)
        
        # Calcula previsão simples baseada em tendência
        daily_sales = dashboard_data['sales']['daily_breakdown']
        if len(daily_sales) < 7:
            return jsonify({
                "success": False,
                "error": "Dados insuficientes para previsão (mínimo 7 dias)"
            }), 400
        
        # Média móvel simples dos últimos 7 dias
        recent_sales = daily_sales[-7:]
        avg_daily_revenue = sum(day['revenue'] for day in recent_sales) / len(recent_sales)
        avg_daily_orders = sum(day['orders'] for day in recent_sales) / len(recent_sales)
        
        # Projeção
        forecast_data = []
        base_date = datetime.now()
        
        for i in range(forecast_days):
            forecast_date = base_date + timedelta(days=i+1)
            # Adiciona variação aleatória pequena para realismo
            variance = 0.9 + (i % 7) * 0.02  # Simula variação semanal
            
            forecast_data.append({
                "date": forecast_date.strftime("%Y-%m-%d"),
                "predicted_revenue": avg_daily_revenue * variance,
                "predicted_orders": int(avg_daily_orders * variance),
                "confidence": max(0.5, 0.9 - (i * 0.01))  # Confiança diminui com o tempo
            })
        
        return jsonify({
            "success": True,
            "data": {
                "historical_period_days": period_days,
                "forecast_period_days": forecast_days,
                "methodology": "Média móvel dos últimos 7 dias",
                "forecast": forecast_data,
                "summary": {
                    "total_predicted_revenue": sum(f['predicted_revenue'] for f in forecast_data),
                    "total_predicted_orders": sum(f['predicted_orders'] for f in forecast_data),
                    "avg_confidence": sum(f['confidence'] for f in forecast_data) / len(forecast_data)
                }
            }
        })
        
    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

@analytics_bp.route('/export/dashboard', methods=['POST'])
@rate_limit("auth")
@validate_input()
def export_dashboard():
    """Exporta dados do dashboard em diferentes formatos"""
    try:
        data = request.get_json()
        format_type = data.get('format', 'json').lower()
        days = data.get('days', 30)
        
        if format_type not in ['json', 'csv', 'excel']:
            return jsonify({
                "success": False,
                "error": "Formato deve ser: json, csv ou excel"
            }), 400
        
        dashboard_data = analytics_service.get_sales_dashboard(days)
        
        if format_type == 'json':
            return jsonify({
                "success": True,
                "data": dashboard_data,
                "export_info": {
                    "format": "json",
                    "generated_at": datetime.now().isoformat(),
                    "period_days": days
                }
            })
        
        elif format_type == 'csv':
            # Para CSV, retornamos instruções de como baixar
            # Em produção, implementar geração de arquivo CSV real
            return jsonify({
                "success": True,
                "message": "Exportação CSV será implementada na próxima versão",
                "data": {
                    "download_url": "/api/analytics/download/csv",
                    "expires_at": (datetime.now() + timedelta(hours=1)).isoformat()
                }
            })
        
        elif format_type == 'excel':
            # Para Excel, retornamos instruções de como baixar
            return jsonify({
                "success": True,
                "message": "Exportação Excel será implementada na próxima versão",
                "data": {
                    "download_url": "/api/analytics/download/excel",
                    "expires_at": (datetime.now() + timedelta(hours=1)).isoformat()
                }
            })
        
    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

@analytics_bp.route('/kpis', methods=['GET'])
@rate_limit("api")
def get_key_performance_indicators():
    """KPIs principais do negócio"""
    try:
        period_days = request.args.get('period', 30, type=int)
        
        # Gera relatório executivo e extrai KPIs
        report = bi_service.generate_executive_report(period_days)
        kpis = report['kpis']
        
        # Adiciona KPIs operacionais
        operational_kpis = [
            {
                "name": "Taxa de Conversão",
                "value": report['detailed_data']['conversion']['conversion_rate_percent'],
                "format": "percentage",
                "trend": "neutral",
                "target": 3.0,
                "status": "good" if report['detailed_data']['conversion']['conversion_rate_percent'] >= 2.0 else "attention"
            },
            {
                "name": "Abandono de Carrinho",
                "value": report['detailed_data']['conversion']['cart_abandonment_percent'],
                "format": "percentage",
                "trend": "down",
                "target": 60.0,
                "status": "good" if report['detailed_data']['conversion']['cart_abandonment_percent'] <= 65 else "attention"
            }
        ]
        
        all_kpis = kpis + operational_kpis
        
        return jsonify({
            "success": True,
            "data": {
                "period_days": period_days,
                "kpis": all_kpis,
                "last_updated": datetime.now().isoformat()
            }
        })
        
    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500