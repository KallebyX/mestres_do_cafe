"""
Sistema de eventos para Mestres do Café Enterprise API
Gerencia eventos de pagamentos, pedidos e notificações
"""

import logging
from enum import Enum
from typing import Dict, Any
from datetime import datetime

# Logger básico
logger = logging.getLogger('event_system')


class EventType(Enum):
    """
    Tipos de eventos do sistema
    """
    # Eventos de pagamento
    PAYMENT_CREATED = "payment_created"
    PAYMENT_APPROVED = "payment_approved"
    PAYMENT_REJECTED = "payment_rejected"
    PAYMENT_PENDING = "payment_pending"
    PAYMENT_REFUNDED = "payment_refunded"
    
    # Eventos de pedidos
    ORDER_CREATED = "order_created"
    ORDER_CONFIRMED = "order_confirmed"
    ORDER_SHIPPED = "order_shipped"
    ORDER_DELIVERED = "order_delivered"
    ORDER_CANCELLED = "order_cancelled"
    
    # Eventos de usuário
    USER_REGISTERED = "user_registered"
    USER_LOGIN = "user_login"
    USER_LOGOUT = "user_logout"
    
    # Eventos de produtos
    PRODUCT_CREATED = "product_created"
    PRODUCT_STOCK_LOW = "product_stock_low"
    PRODUCT_OUT_OF_STOCK = "product_out_of_stock"
    
    # Eventos de notificação
    NOTIFICATION_SENT = "notification_sent"
    EMAIL_SENT = "email_sent"
    SMS_SENT = "sms_sent"


class EventSystem:
    """
    Sistema centralizado de eventos
    Versão simplificada funcional para desenvolvimento
    """

    def __init__(self):
        self.event_handlers = {}
        self.event_history = []
        logger.info("Sistema de eventos inicializado")

    def emit(
        self,
        event_type: EventType,
        user_id: str = None,
        data: Dict[str, Any] = None
    ) -> str:
        """
        Emite um evento no sistema
        """
        try:
            event_id = f"evt_{datetime.now().timestamp():.0f}"
            
            event_data = {
                'id': event_id,
                'type': event_type.value,
                'timestamp': datetime.now().isoformat(),
                'user_id': user_id,
                'data': data or {}
            }
            
            # Armazenar no histórico
            self.event_history.append(event_data)
            
            # Processar evento
            self._process_event(event_data)
            
            logger.info(f"Evento emitido: {event_type.value} - ID: {event_id}")
            return event_id
            
        except Exception as e:
            logger.error(f"Erro ao emitir evento: {str(e)}")
            return None

    def _process_event(self, event_data: Dict[str, Any]) -> None:
        """
        Processa um evento emitido
        """
        try:
            event_type = event_data.get('type')
            
            if not event_type:
                return
            
            # Processar baseado no tipo
            if event_type.startswith('payment_'):
                self._handle_payment_event(event_data)
            elif event_type.startswith('order_'):
                self._handle_order_event(event_data)
            elif event_type.startswith('user_'):
                self._handle_user_event(event_data)
            elif event_type.startswith('product_'):
                self._handle_product_event(event_data)
            
        except Exception as e:
            logger.error(f"Erro no processamento do evento: {str(e)}")

    def _handle_payment_event(self, event_data: Dict[str, Any]) -> None:
        """
        Processa eventos relacionados a pagamentos
        """
        try:
            event_type = event_data.get('type')
            logger.info(f"Processando evento de pagamento: {event_type}")
            
            # Em produção, aqui seria:
            # - Atualizar status no banco
            # - Enviar notificações
            # - Disparar webhooks
            
        except Exception as e:
            logger.error(f"Erro no evento de pagamento: {str(e)}")

    def _handle_order_event(self, event_data: Dict[str, Any]) -> None:
        """
        Processa eventos relacionados a pedidos
        """
        try:
            event_type = event_data.get('type')
            logger.info(f"Processando evento de pedido: {event_type}")
            
        except Exception as e:
            logger.error(f"Erro no evento de pedido: {str(e)}")

    def _handle_user_event(self, event_data: Dict[str, Any]) -> None:
        """
        Processa eventos relacionados a usuários
        """
        try:
            event_type = event_data.get('type')
            logger.info(f"Processando evento de usuário: {event_type}")
            
        except Exception as e:
            logger.error(f"Erro no evento de usuário: {str(e)}")

    def _handle_product_event(self, event_data: Dict[str, Any]) -> None:
        """
        Processa eventos relacionados a produtos
        """
        try:
            event_type = event_data.get('type')
            logger.info(f"Processando evento de produto: {event_type}")
            
        except Exception as e:
            logger.error(f"Erro no evento de produto: {str(e)}")

    def get_events(self, limit: int = 100) -> list:
        """
        Retorna histórico de eventos
        """
        try:
            return self.event_history[-limit:]
        except Exception as e:
            logger.error(f"Erro ao obter eventos: {str(e)}")
            return []

    def get_event_stats(self) -> Dict[str, Any]:
        """
        Retorna estatísticas dos eventos
        """
        try:
            total_events = len(self.event_history)
            event_types = {}
            
            for event in self.event_history:
                event_type = event.get('type', 'unknown')
                event_types[event_type] = event_types.get(event_type, 0) + 1
            
            return {
                'total_events': total_events,
                'event_types': event_types,
                'last_event': self.event_history[-1] if self.event_history else None
            }
            
        except Exception as e:
            logger.error(f"Erro ao obter estatísticas: {str(e)}")
            return {'total_events': 0, 'event_types': {}}


# Instância global do sistema de eventos
event_system = EventSystem()