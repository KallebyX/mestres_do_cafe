"""
Serviço para cálculo e gestão automática de comissões do marketplace
"""

from decimal import Decimal
from datetime import datetime
from typing import List, Dict, Any

from ..database import db
from ..models.vendors import Vendor, VendorCommission, VendorOrder
from ..models.orders import Order, OrderItem
from ..models.payments import Payment


class CommissionService:
    """Serviço para cálculo automático de comissões"""
    
    @staticmethod
    def calculate_commission(order_value: Decimal, commission_rate: Decimal) -> Dict[str, Decimal]:
        """Calcular comissão baseada no valor do pedido e taxa"""
        commission_amount = (order_value * commission_rate) / 100
        vendor_payout = order_value - commission_amount
        
        return {
            "commission_amount": commission_amount,
            "vendor_payout": vendor_payout,
            "marketplace_fee": commission_amount
        }
    
    @staticmethod
    def process_order_commission(order: Order) -> List[VendorCommission]:
        """Processar comissões para um pedido"""
        commissions = []
        
        try:
            # Agrupar itens do pedido por vendedor
            vendor_orders = {}
            
            for item in order.items:
                # Verificar se o produto tem vendedor associado
                vendor_product = db.session.query(
                    VendorProduct
                ).filter_by(product_id=item.product_id).first()
                
                if vendor_product:
                    vendor_id = vendor_product.vendor_id
                    
                    if vendor_id not in vendor_orders:
                        vendor_orders[vendor_id] = {
                            "vendor": vendor_product.vendor,
                            "items": [],
                            "subtotal": Decimal("0.00")
                        }
                    
                    vendor_orders[vendor_id]["items"].append(item)
                    vendor_orders[vendor_id]["subtotal"] += item.total_price
            
            # Criar comissões para cada vendedor
            for vendor_id, vendor_data in vendor_orders.items():
                vendor = vendor_data["vendor"]
                subtotal = vendor_data["subtotal"]
                
                # Calcular comissão
                commission_calc = CommissionService.calculate_commission(
                    subtotal, vendor.commission_rate
                )
                
                # Criar registro de comissão
                commission = VendorCommission(
                    vendor_id=vendor_id,
                    order_id=order.id,
                    order_value=subtotal,
                    commission_rate=vendor.commission_rate,
                    commission_amount=commission_calc["commission_amount"],
                    vendor_payout=commission_calc["vendor_payout"],
                    status="pending"
                )
                
                db.session.add(commission)
                commissions.append(commission)
                
                # Criar/atualizar registro de pedido do vendedor
                vendor_order = VendorOrder(
                    vendor_id=vendor_id,
                    order_id=order.id,
                    subtotal=subtotal,
                    commission_amount=commission_calc["commission_amount"],
                    vendor_payout=commission_calc["vendor_payout"],
                    fulfillment_status="pending"
                )
                
                db.session.add(vendor_order)
                
                # Atualizar métricas do vendedor
                vendor.total_orders += 1
                vendor.total_sales += commission_calc["vendor_payout"]
            
            db.session.commit()
            return commissions
            
        except Exception as e:
            db.session.rollback()
            raise Exception(f"Erro ao processar comissões: {str(e)}")
    
    @staticmethod
    def process_payment_release(payment: Payment) -> bool:
        """Processar liberação de pagamento para vendedores"""
        try:
            if payment.status != "completed":
                return False
            
            # Buscar comissões pendentes relacionadas ao pedido
            commissions = VendorCommission.query.filter_by(
                order_id=payment.order_id,
                status="pending"
            ).all()
            
            for commission in commissions:
                # Marcar comissão como paga
                commission.status = "paid"
                commission.paid_at = datetime.utcnow()
                commission.payment_method = payment.payment_method
                commission.payment_reference = payment.transaction_id
            
            db.session.commit()
            return True
            
        except Exception as e:
            db.session.rollback()
            raise Exception(f"Erro ao liberar pagamentos: {str(e)}")
    
    @staticmethod
    def get_vendor_commission_summary(vendor_id: str, period_days: int = 30) -> Dict[str, Any]:
        """Obter resumo de comissões do vendedor"""
        from datetime import timedelta
        
        end_date = datetime.utcnow()
        start_date = end_date - timedelta(days=period_days)
        
        # Comissões do período
        period_commissions = VendorCommission.query.filter(
            VendorCommission.vendor_id == vendor_id,
            VendorCommission.created_at >= start_date,
            VendorCommission.created_at <= end_date
        ).all()
        
        # Comissões pagas
        paid_commissions = [c for c in period_commissions if c.status == "paid"]
        pending_commissions = [c for c in period_commissions if c.status == "pending"]
        
        # Cálculos
        total_earned = sum(c.vendor_payout for c in paid_commissions)
        pending_amount = sum(c.vendor_payout for c in pending_commissions)
        total_commission_charged = sum(c.commission_amount for c in period_commissions)
        total_order_value = sum(c.order_value for c in period_commissions)
        
        return {
            "period": {
                "start_date": start_date.isoformat(),
                "end_date": end_date.isoformat(),
                "days": period_days
            },
            "earnings": {
                "total_earned": float(total_earned),
                "pending_amount": float(pending_amount),
                "total_order_value": float(total_order_value),
                "commission_charged": float(total_commission_charged)
            },
            "counts": {
                "total_orders": len(period_commissions),
                "paid_orders": len(paid_commissions),
                "pending_orders": len(pending_commissions)
            },
            "metrics": {
                "average_order_value": float(total_order_value / len(period_commissions)) if period_commissions else 0,
                "average_commission_rate": float(total_commission_charged / total_order_value * 100) if total_order_value > 0 else 0
            }
        }
    
    @staticmethod
    def get_marketplace_commission_summary(period_days: int = 30) -> Dict[str, Any]:
        """Obter resumo geral de comissões do marketplace"""
        from datetime import timedelta
        
        end_date = datetime.utcnow()
        start_date = end_date - timedelta(days=period_days)
        
        # Todas as comissões do período
        period_commissions = VendorCommission.query.filter(
            VendorCommission.created_at >= start_date,
            VendorCommission.created_at <= end_date
        ).all()
        
        # Agrupamento por status
        paid_commissions = [c for c in period_commissions if c.status == "paid"]
        pending_commissions = [c for c in period_commissions if c.status == "pending"]
        
        # Cálculos do marketplace
        total_marketplace_revenue = sum(c.commission_amount for c in paid_commissions)
        pending_marketplace_revenue = sum(c.commission_amount for c in pending_commissions)
        total_vendor_payouts = sum(c.vendor_payout for c in paid_commissions)
        total_order_value = sum(c.order_value for c in period_commissions)
        
        # Vendedores únicos
        unique_vendors = len(set(c.vendor_id for c in period_commissions))
        
        # Top vendedores por comissão gerada
        vendor_commissions = {}
        for commission in period_commissions:
            if commission.vendor_id not in vendor_commissions:
                vendor_commissions[commission.vendor_id] = {
                    "vendor_id": commission.vendor_id,
                    "total_commission": 0,
                    "total_orders": 0,
                    "total_value": 0
                }
            
            vendor_commissions[commission.vendor_id]["total_commission"] += float(commission.commission_amount)
            vendor_commissions[commission.vendor_id]["total_orders"] += 1
            vendor_commissions[commission.vendor_id]["total_value"] += float(commission.order_value)
        
        top_vendors = sorted(
            vendor_commissions.values(),
            key=lambda x: x["total_commission"],
            reverse=True
        )[:10]
        
        return {
            "period": {
                "start_date": start_date.isoformat(),
                "end_date": end_date.isoformat(),
                "days": period_days
            },
            "marketplace_revenue": {
                "total_earned": float(total_marketplace_revenue),
                "pending_revenue": float(pending_marketplace_revenue),
                "vendor_payouts": float(total_vendor_payouts),
                "total_gmv": float(total_order_value)  # Gross Merchandise Value
            },
            "activity": {
                "total_orders": len(period_commissions),
                "paid_orders": len(paid_commissions),
                "pending_orders": len(pending_commissions),
                "active_vendors": unique_vendors
            },
            "performance": {
                "average_commission_rate": float(total_marketplace_revenue / total_order_value * 100) if total_order_value > 0 else 0,
                "average_order_value": float(total_order_value / len(period_commissions)) if period_commissions else 0,
                "revenue_per_vendor": float(total_marketplace_revenue / unique_vendors) if unique_vendors > 0 else 0
            },
            "top_vendors": top_vendors
        }
    
    @staticmethod
    def update_commission_rates(vendor_id: str, new_rate: Decimal) -> bool:
        """Atualizar taxa de comissão de um vendedor"""
        try:
            vendor = Vendor.query.get(vendor_id)
            if not vendor:
                return False
            
            old_rate = vendor.commission_rate
            vendor.commission_rate = new_rate
            vendor.updated_at = datetime.utcnow()
            
            db.session.commit()
            
            # Log da alteração (opcional - implementar se necessário)
            # AuditLog.create(
            #     action="commission_rate_update",
            #     entity="vendor",
            #     entity_id=vendor_id,
            #     changes={"old_rate": float(old_rate), "new_rate": float(new_rate)}
            # )
            
            return True
            
        except Exception as e:
            db.session.rollback()
            raise Exception(f"Erro ao atualizar taxa de comissão: {str(e)}")


# Importar modelos necessários (evita importação circular)
from ..models.vendors import VendorProduct