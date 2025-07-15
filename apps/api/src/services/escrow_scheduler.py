"""
Scheduler para operações automáticas do sistema de escrow
"""

import schedule
import time
import threading
from datetime import datetime, timedelta
from typing import Dict, Any

from ..database import db
from .escrow_service import EscrowService
from ..models.payments import Payment, PaymentStatus
from ..utils.logger import logger


class EscrowScheduler:
    """Scheduler para operações automáticas do escrow"""
    
    def __init__(self):
        self.escrow_service = EscrowService()
        self.running = False
        self.thread = None
    
    def start(self):
        """Inicia o scheduler"""
        if self.running:
            logger.warning("Escrow scheduler already running")
            return
        
        self.running = True
        
        # Configurar tarefas
        schedule.every(1).hours.do(self.process_automatic_releases)
        schedule.every(6).hours.do(self.check_stuck_payments)
        schedule.every().day.at("02:00").do(self.cleanup_old_escrow_data)
        
        # Executar em thread separada
        self.thread = threading.Thread(target=self._run_scheduler, daemon=True)
        self.thread.start()
        
        logger.info("Escrow scheduler started")
    
    def stop(self):
        """Para o scheduler"""
        self.running = False
        schedule.clear()
        
        if self.thread and self.thread.is_alive():
            self.thread.join(timeout=5)
        
        logger.info("Escrow scheduler stopped")
    
    def _run_scheduler(self):
        """Executa o loop do scheduler"""
        while self.running:
            try:
                schedule.run_pending()
                time.sleep(60)  # Verificar a cada minuto
            except Exception as e:
                logger.error(f"Error in escrow scheduler: {str(e)}")
                time.sleep(300)  # Aguardar 5 minutos em caso de erro
    
    def process_automatic_releases(self) -> Dict[str, Any]:
        """
        Processa liberações automáticas de pagamentos elegíveis
        
        Returns:
            Dict com resultado das operações
        """
        try:
            logger.info("Starting automatic payment releases")
            
            result = self.escrow_service.process_automatic_releases()
            
            if result['success']:
                released_count = result['released_count']
                errors_count = len(result['errors'])
                
                logger.info(f"Automatic releases completed: {released_count} released, {errors_count} errors")
                
                # Log erros se houver
                for error in result['errors']:
                    logger.error(f"Failed to release payment {error['payment_id']}: {error['error']}")
            else:
                logger.error(f"Failed to process automatic releases: {result['error']}")
            
            return result
            
        except Exception as e:
            logger.error(f"Error in process_automatic_releases: {str(e)}")
            return {"success": False, "error": str(e)}
    
    def check_stuck_payments(self) -> Dict[str, Any]:
        """
        Verifica pagamentos que podem estar presos em estado inconsistente
        
        Returns:
            Dict com resultado da verificação
        """
        try:
            logger.info("Checking for stuck payments")
            
            # Buscar pagamentos em escrow há mais de 30 dias
            cutoff_date = datetime.utcnow() - timedelta(days=30)
            
            stuck_payments = db.session.query(Payment).filter(
                Payment.status == PaymentStatus.HELD.value,
                Payment.held_at < cutoff_date,
                Payment.release_eligible_at < datetime.utcnow()
            ).all()
            
            alerts = []
            for payment in stuck_payments:
                alert = {
                    "payment_id": str(payment.id),
                    "order_id": str(payment.order_id),
                    "amount": float(payment.amount),
                    "held_at": payment.held_at.isoformat(),
                    "days_held": (datetime.utcnow() - payment.held_at).days,
                    "release_eligible_at": payment.release_eligible_at.isoformat() if payment.release_eligible_at else None
                }
                alerts.append(alert)
            
            if alerts:
                logger.warning(f"Found {len(alerts)} stuck payments requiring attention")
                # Aqui você pode adicionar notificações para admin
            else:
                logger.info("No stuck payments found")
            
            return {
                "success": True,
                "stuck_payments_count": len(alerts),
                "stuck_payments": alerts
            }
            
        except Exception as e:
            logger.error(f"Error checking stuck payments: {str(e)}")
            return {"success": False, "error": str(e)}
    
    def cleanup_old_escrow_data(self) -> Dict[str, Any]:
        """
        Limpa dados antigos do escrow para manter a base de dados limpa
        
        Returns:
            Dict com resultado da limpeza
        """
        try:
            logger.info("Starting escrow data cleanup")
            
            # Limpar webhooks antigos (mais de 90 dias)
            from ..models.payments import PaymentWebhook
            cutoff_date = datetime.utcnow() - timedelta(days=90)
            
            old_webhooks = db.session.query(PaymentWebhook).filter(
                PaymentWebhook.created_at < cutoff_date,
                PaymentWebhook.processed == True
            ).count()
            
            if old_webhooks > 0:
                db.session.query(PaymentWebhook).filter(
                    PaymentWebhook.created_at < cutoff_date,
                    PaymentWebhook.processed == True
                ).delete(synchronize_session=False)
                
                db.session.commit()
                logger.info(f"Cleaned up {old_webhooks} old webhook records")
            
            return {
                "success": True,
                "cleaned_webhooks": old_webhooks
            }
            
        except Exception as e:
            logger.error(f"Error in cleanup_old_escrow_data: {str(e)}")
            db.session.rollback()
            return {"success": False, "error": str(e)}
    
    def force_release_payment(self, payment_id: str, reason: str = "Manual release") -> Dict[str, Any]:
        """
        Força liberação manual de um pagamento
        
        Args:
            payment_id: ID do pagamento
            reason: Motivo da liberação forçada
            
        Returns:
            Dict com resultado da operação
        """
        try:
            logger.info(f"Forcing release of payment {payment_id}. Reason: {reason}")
            
            result = self.escrow_service.release_payment(payment_id, force=True)
            
            if result['success']:
                logger.info(f"Payment {payment_id} forcefully released")
            else:
                logger.error(f"Failed to force release payment {payment_id}: {result['error']}")
            
            return result
            
        except Exception as e:
            logger.error(f"Error forcing payment release: {str(e)}")
            return {"success": False, "error": str(e)}


# Instância global do scheduler
escrow_scheduler = EscrowScheduler()