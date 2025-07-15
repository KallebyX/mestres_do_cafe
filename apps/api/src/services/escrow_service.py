"""
Serviço de Escrow para Marketplace
Gerencia a retenção e liberação de pagamentos
"""

from datetime import datetime, timedelta
from decimal import Decimal
from typing import Optional, List, Dict, Any

from sqlalchemy.orm import Session
from sqlalchemy import and_, or_

from ..database import db
from ..models.payments import Payment, PaymentDispute, EscrowTransaction
from ..models.orders import Order
from ..models.vendors import Vendor
from ..models.customers import Customer
from ..utils.logger import logger


class EscrowService:
    """Serviço para gerenciar operações de escrow"""
    
    def __init__(self, db_session: Session = None):
        self.db = db_session or db.session
    
    def hold_payment(self, payment_id: str, reason: str = None) -> Dict[str, Any]:
        """
        Coloca um pagamento em escrow (retém o pagamento)
        
        Args:
            payment_id: ID do pagamento
            reason: Motivo da retenção
            
        Returns:
            Dict com resultado da operação
        """
        try:
            payment = self.db.query(Payment).filter(Payment.id == payment_id).first()
            
            if not payment:
                return {"success": False, "error": "Payment not found"}
            
            if payment.status not in ['pending', 'paid']:
                return {"success": False, "error": f"Cannot hold payment with status {payment.status}"}
            
            # Verifica se é um pagamento de marketplace (tem vendor)
            if not payment.vendor_id:
                return {"success": False, "error": "Cannot hold payment without vendor"}
            
            # Move pagamento para escrow
            escrow_reason = reason or "Marketplace escrow - awaiting delivery confirmation"
            payment.hold_payment(escrow_reason)
            
            # Cria registro de transação de escrow
            escrow_transaction = EscrowTransaction(
                payment_id=payment.id,
                order_id=payment.order_id,
                vendor_id=payment.vendor_id,
                amount=payment.amount,
                platform_fee=self._calculate_platform_fee(payment.amount),
                vendor_amount=payment.amount - self._calculate_platform_fee(payment.amount),
                status='held',
                held_reason=escrow_reason,
                release_eligible_at=datetime.utcnow() + timedelta(days=7)
            )
            
            self.db.add(escrow_transaction)
            self.db.commit()
            
            logger.info(f"Payment {payment_id} held in escrow. Reason: {escrow_reason}")
            
            return {
                "success": True,
                "payment": payment.to_dict(),
                "escrow_transaction": escrow_transaction.to_dict()
            }
            
        except Exception as e:
            logger.error(f"Error holding payment {payment_id}: {str(e)}")
            self.db.rollback()
            return {"success": False, "error": str(e)}
    
    def release_payment(self, payment_id: str, force: bool = False) -> Dict[str, Any]:
        """
        Libera um pagamento do escrow para o vendedor
        
        Args:
            payment_id: ID do pagamento
            force: Forçar liberação mesmo se não elegível
            
        Returns:
            Dict com resultado da operação
        """
        try:
            payment = self.db.query(Payment).filter(Payment.id == payment_id).first()
            
            if not payment:
                return {"success": False, "error": "Payment not found"}
            
            if payment.status != PaymentStatus.HELD.value:
                return {"success": False, "error": f"Cannot release payment with status {payment.status}"}
            
            # Verifica se é elegível para liberação
            if not force and not payment.is_eligible_for_release():
                return {"success": False, "error": "Payment not eligible for release yet"}
            
            # Libera o pagamento
            payment.release_payment()
            
            # Atualiza transação de escrow
            escrow_transaction = self.db.query(EscrowTransaction).filter(
                EscrowTransaction.payment_id == payment_id
            ).first()
            
            if escrow_transaction:
                escrow_transaction.status = 'released'
                escrow_transaction.released_at = datetime.utcnow()
            
            self.db.commit()
            
            logger.info(f"Payment {payment_id} released from escrow")
            
            return {
                "success": True,
                "payment": payment.to_dict(),
                "escrow_transaction": escrow_transaction.to_dict() if escrow_transaction else None
            }
            
        except Exception as e:
            logger.error(f"Error releasing payment {payment_id}: {str(e)}")
            self.db.rollback()
            return {"success": False, "error": str(e)}
    
    def create_dispute(self, payment_id: str, customer_id: str, reason: str, description: str) -> Dict[str, Any]:
        """
        Cria uma disputa para um pagamento
        
        Args:
            payment_id: ID do pagamento
            customer_id: ID do cliente
            reason: Motivo da disputa
            description: Descrição detalhada
            
        Returns:
            Dict com resultado da operação
        """
        try:
            payment = self.db.query(Payment).filter(Payment.id == payment_id).first()
            
            if not payment:
                return {"success": False, "error": "Payment not found"}
            
            # Verifica se o pagamento pode ser disputado
            if payment.status not in [PaymentStatus.HELD.value, PaymentStatus.RELEASED.value]:
                return {"success": False, "error": f"Cannot dispute payment with status {payment.status}"}
            
            # Cria a disputa
            dispute = PaymentDispute(
                payment_id=payment.id,
                order_id=payment.order_id,
                customer_id=customer_id,
                vendor_id=payment.vendor_id,
                reason=reason,
                description=description,
                status='open'
            )
            
            # Move pagamento para status disputado
            payment.dispute_payment(f"Dispute created: {reason}")
            
            self.db.add(dispute)
            self.db.commit()
            
            logger.info(f"Dispute created for payment {payment_id}. Reason: {reason}")
            
            return {
                "success": True,
                "dispute": dispute.to_dict(),
                "payment": payment.to_dict()
            }
            
        except Exception as e:
            logger.error(f"Error creating dispute for payment {payment_id}: {str(e)}")
            self.db.rollback()
            return {"success": False, "error": str(e)}
    
    def get_held_payments(self, vendor_id: str = None) -> List[Dict[str, Any]]:
        """
        Obtém pagamentos em escrow
        
        Args:
            vendor_id: ID do vendedor (opcional)
            
        Returns:
            Lista de pagamentos em escrow
        """
        try:
            query = self.db.query(Payment).filter(Payment.status == PaymentStatus.HELD.value)
            
            if vendor_id:
                query = query.filter(Payment.vendor_id == vendor_id)
            
            payments = query.all()
            
            return [payment.to_dict() for payment in payments]
            
        except Exception as e:
            logger.error(f"Error getting held payments: {str(e)}")
            return []
    
    def get_payments_eligible_for_release(self) -> List[Dict[str, Any]]:
        """
        Obtém pagamentos elegíveis para liberação automática
        
        Returns:
            Lista de pagamentos elegíveis
        """
        try:
            now = datetime.utcnow()
            
            payments = self.db.query(Payment).filter(
                and_(
                    Payment.status == PaymentStatus.HELD.value,
                    Payment.release_eligible_at <= now
                )
            ).all()
            
            return [payment.to_dict() for payment in payments]
            
        except Exception as e:
            logger.error(f"Error getting payments eligible for release: {str(e)}")
            return []
    
    def process_automatic_releases(self) -> Dict[str, Any]:
        """
        Processa liberações automáticas de pagamentos elegíveis
        
        Returns:
            Dict com resultado das operações
        """
        try:
            eligible_payments = self.get_payments_eligible_for_release()
            released_count = 0
            errors = []
            
            for payment_data in eligible_payments:
                result = self.release_payment(payment_data['id'], force=False)
                
                if result['success']:
                    released_count += 1
                else:
                    errors.append({
                        'payment_id': payment_data['id'],
                        'error': result['error']
                    })
            
            logger.info(f"Processed automatic releases: {released_count} released, {len(errors)} errors")
            
            return {
                "success": True,
                "released_count": released_count,
                "errors": errors
            }
            
        except Exception as e:
            logger.error(f"Error processing automatic releases: {str(e)}")
            return {"success": False, "error": str(e)}
    
    def get_escrow_stats(self, vendor_id: str = None) -> Dict[str, Any]:
        """
        Obtém estatísticas do escrow
        
        Args:
            vendor_id: ID do vendedor (opcional)
            
        Returns:
            Dict com estatísticas
        """
        try:
            query = self.db.query(EscrowTransaction)
            
            if vendor_id:
                query = query.filter(EscrowTransaction.vendor_id == vendor_id)
            
            transactions = query.all()
            
            stats = {
                'total_held': 0,
                'total_released': 0,
                'total_disputed': 0,
                'amount_held': Decimal('0.00'),
                'amount_released': Decimal('0.00'),
                'amount_disputed': Decimal('0.00'),
                'pending_releases': 0
            }
            
            for transaction in transactions:
                if transaction.status == 'held':
                    stats['total_held'] += 1
                    stats['amount_held'] += transaction.amount
                elif transaction.status == 'released':
                    stats['total_released'] += 1
                    stats['amount_released'] += transaction.amount
                elif transaction.status == 'disputed':
                    stats['total_disputed'] += 1
                    stats['amount_disputed'] += transaction.amount
                
                # Verifica se está pendente para liberação
                if (transaction.status == 'held' and 
                    transaction.release_eligible_at and 
                    datetime.utcnow() >= transaction.release_eligible_at):
                    stats['pending_releases'] += 1
            
            return stats
            
        except Exception as e:
            logger.error(f"Error getting escrow stats: {str(e)}")
            return {}
    
    def _calculate_platform_fee(self, amount: Decimal) -> Decimal:
        """
        Calcula taxa da plataforma
        
        Args:
            amount: Valor do pagamento
            
        Returns:
            Taxa da plataforma
        """
        # Taxa padrão de 5% da plataforma
        return amount * Decimal('0.05')