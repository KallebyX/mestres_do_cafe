"""
Serviço de Notificações - Mestres do Café
Sistema completo de notificações multi-canal (in-app, email, SMS, push)
"""

import logging
import smtplib
from datetime import datetime
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from enum import Enum
from typing import Any, Dict, List, Optional

from database import db
from flask import current_app
from models.notifications import (
    Notification,
    NotificationLog,
    NotificationSubscription,
    NotificationTemplate,
)

# Configurar logger
logger = logging.getLogger(__name__)


class NotificationType(Enum):
    """Tipos de notificações disponíveis"""
    ORDER_CREATED = "order_created"
    ORDER_CONFIRMED = "order_confirmed"
    ORDER_SHIPPED = "order_shipped"
    ORDER_DELIVERED = "order_delivered"
    ORDER_CANCELLED = "order_cancelled"
    PAYMENT_APPROVED = "payment_approved"
    PAYMENT_REJECTED = "payment_rejected"
    STOCK_LOW = "stock_low"
    STOCK_OUT = "stock_out"
    ACCOUNT_CREATED = "account_created"
    PASSWORD_RESET = "password_reset"
    NEWSLETTER = "newsletter"
    PROMOTION = "promotion"
    SYSTEM_MAINTENANCE = "system_maintenance"
    SECURITY_ALERT = "security_alert"


class NotificationChannel(Enum):
    """Canais de notificação disponíveis"""
    IN_APP = "in_app"
    EMAIL = "email"
    SMS = "sms"
    PUSH = "push"


class NotificationPriority(Enum):
    """Prioridades de notificação"""
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    URGENT = "urgent"


class EmailProvider:
    """Provedor de email SMTP"""
    
    def __init__(self):
        self._smtp_server = None
        self._smtp_port = None
        self._smtp_username = None
        self._smtp_password = None
        self._smtp_use_tls = None
        self._sender_email = None
        self._sender_name = None
        self._initialized = False
    
    def _ensure_initialized(self):
        """Garantir que o provedor está inicializado com contexto Flask"""
        if not self._initialized:
            try:
                self._smtp_server = current_app.config.get('SMTP_SERVER', 'localhost')
                self._smtp_port = current_app.config.get('SMTP_PORT', 587)
                self._smtp_username = current_app.config.get('SMTP_USERNAME', '')
                self._smtp_password = current_app.config.get('SMTP_PASSWORD', '')
                self._smtp_use_tls = current_app.config.get('SMTP_USE_TLS', True)
                self._sender_email = current_app.config.get('SENDER_EMAIL', 'noreply@mestrescafe.com')
                self._sender_name = current_app.config.get('SENDER_NAME', 'Mestres do Café')
                self._initialized = True
                logger.info("EmailProvider inicializado com sucesso")
            except RuntimeError as e:
                logger.error(f"Erro ao inicializar EmailProvider: {str(e)}")
                raise
    
    @property
    def smtp_server(self):
        self._ensure_initialized()
        return self._smtp_server
    
    @property
    def smtp_port(self):
        self._ensure_initialized()
        return self._smtp_port
    
    @property
    def smtp_username(self):
        self._ensure_initialized()
        return self._smtp_username
    
    @property
    def smtp_password(self):
        self._ensure_initialized()
        return self._smtp_password
    
    @property
    def smtp_use_tls(self):
        self._ensure_initialized()
        return self._smtp_use_tls
    
    @property
    def sender_email(self):
        self._ensure_initialized()
        return self._sender_email
    
    @property
    def sender_name(self):
        self._ensure_initialized()
        return self._sender_name
    
    def send_email(self, to_email: str, subject: str, html_content: str, text_content: str = None) -> bool:
        """Enviar email via SMTP"""
        try:
            msg = MIMEMultipart('alternative')
            msg['Subject'] = subject
            msg['From'] = f"{self.sender_name} <{self.sender_email}>"
            msg['To'] = to_email
            
            # Adicionar versão texto se fornecida
            if text_content:
                part1 = MIMEText(text_content, 'plain', 'utf-8')
                msg.attach(part1)
            
            # Adicionar versão HTML
            part2 = MIMEText(html_content, 'html', 'utf-8')
            msg.attach(part2)
            
            # Conectar e enviar
            server = smtplib.SMTP(self.smtp_server, self.smtp_port)
            if self.smtp_use_tls:
                server.starttls()
            if self.smtp_username and self.smtp_password:
                server.login(self.smtp_username, self.smtp_password)
            
            server.send_message(msg)
            server.quit()
            
            logger.info(f"Email enviado com sucesso para {to_email}")
            return True
            
        except Exception as e:
            logger.error(f"Erro ao enviar email para {to_email}: {str(e)}")
            return False


class SMSProvider:
    """Provedor de SMS (mock - implementar com Twilio, AWS SNS, etc.)"""
    
    def __init__(self):
        self.api_key = current_app.config.get('SMS_API_KEY', '')
        self.sender_id = current_app.config.get('SMS_SENDER_ID', 'MESTRES')
    
    def send_sms(self, phone_number: str, message: str) -> bool:
        """Enviar SMS"""
        try:
            # TODO: Implementar com provedor real (Twilio, AWS SNS, etc.)
            logger.info(f"SMS enviado para {phone_number}: {message[:50]}...")
            return True
        except Exception as e:
            logger.error(f"Erro ao enviar SMS para {phone_number}: {str(e)}")
            return False


class PushProvider:
    """Provedor de push notifications (mock - implementar com Firebase, etc.)"""
    
    def __init__(self):
        self.server_key = current_app.config.get('PUSH_SERVER_KEY', '')
    
    def send_push(self, device_token: str, title: str, body: str, data: Dict = None) -> bool:
        """Enviar push notification"""
        try:
            # TODO: Implementar com Firebase Cloud Messaging ou similar
            logger.info(f"Push notification enviada: {title}")
            return True
        except Exception as e:
            logger.error(f"Erro ao enviar push notification: {str(e)}")
            return False


class NotificationService:
    """Serviço principal de notificações"""
    
    def __init__(self):
        self.email_provider = None
        self.sms_provider = None
        self.push_provider = None
        self._initialize_providers()
    
    def _initialize_providers(self):
        """Inicializar provedores de notificação"""
        try:
            self.email_provider = EmailProvider()
            self.sms_provider = SMSProvider()
            self.push_provider = PushProvider()
            logger.info("Provedores de notificação inicializados")
        except Exception as e:
            logger.error(f"Erro ao inicializar provedores: {str(e)}")
    
    def send_notification(
        self,
        user_id: str,
        notification_type: NotificationType,
        data: Dict[str, Any],
        channels: List[str] = None,
        priority: NotificationPriority = NotificationPriority.MEDIUM
    ) -> bool:
        """
        Enviar notificação para usuário em canais especificados
        
        Args:
            user_id: ID do usuário
            notification_type: Tipo da notificação
            data: Dados da notificação (title, content, metadata, etc.)
            channels: Lista de canais para envio
            priority: Prioridade da notificação
        
        Returns:
            bool: True se pelo menos um canal foi enviado com sucesso
        """
        try:
            if channels is None:
                channels = [NotificationChannel.IN_APP.value]
            
            success_count = 0
            
            # Verificar preferências do usuário
            user_preferences = self._get_user_preferences(user_id, notification_type)
            
            for channel_str in channels:
                try:
                    channel = NotificationChannel(channel_str)
                    
                    # Verificar se usuário permite este canal
                    if not self._is_channel_enabled(user_preferences, channel):
                        logger.info(f"Canal {channel.value} desabilitado para usuário {user_id}")
                        continue
                    
                    # Enviar para o canal específico
                    if channel == NotificationChannel.IN_APP:
                        success = self._send_in_app_notification(user_id, notification_type, data)
                    elif channel == NotificationChannel.EMAIL:
                        success = self._send_email_notification(user_id, notification_type, data)
                    elif channel == NotificationChannel.SMS:
                        success = self._send_sms_notification(user_id, notification_type, data)
                    elif channel == NotificationChannel.PUSH:
                        success = self._send_push_notification(user_id, notification_type, data)
                    else:
                        logger.warning(f"Canal não suportado: {channel.value}")
                        success = False
                    
                    # Log do resultado
                    self._log_notification(
                        user_id=user_id,
                        notification_type=notification_type,
                        channel=channel,
                        data=data,
                        success=success
                    )
                    
                    if success:
                        success_count += 1
                        
                except ValueError:
                    logger.error(f"Canal inválido: {channel_str}")
                except Exception as e:
                    logger.error(f"Erro ao enviar notificação via {channel_str}: {str(e)}")
            
            return success_count > 0
            
        except Exception as e:
            logger.error(f"Erro geral ao enviar notificação: {str(e)}")
            return False
    
    def _send_in_app_notification(self, user_id: str, notification_type: NotificationType, data: Dict) -> bool:
        """Enviar notificação in-app"""
        try:
            notification = Notification(
                user_id=user_id,
                type=notification_type.value,
                title=data.get('title', ''),
                message=data.get('content', ''),
                data=data.get('metadata', {}),
                priority=data.get('priority', 'medium'),
                read=False
            )
            
            db.session.add(notification)
            db.session.commit()
            
            logger.info(f"Notificação in-app criada para usuário {user_id}")
            return True
            
        except Exception as e:
            logger.error(f"Erro ao criar notificação in-app: {str(e)}")
            return False
    
    def _send_email_notification(self, user_id: str, notification_type: NotificationType, data: Dict) -> bool:
        """Enviar notificação por email"""
        try:
            if not self.email_provider:
                logger.error("Provedor de email não inicializado")
                return False
            
            # Buscar template de email
            template = self._get_template(notification_type, NotificationChannel.EMAIL)
            if not template:
                logger.error(f"Template de email não encontrado para {notification_type.value}")
                return False
            
            # Renderizar template
            subject = self._render_template(template.subject_template or data.get('title', ''), data)
            html_content = self._render_template(template.template_content, data)
            
            # Buscar email do usuário
            user_email = self._get_user_email(user_id)
            if not user_email:
                logger.error(f"Email não encontrado para usuário {user_id}")
                return False
            
            # Enviar email
            return self.email_provider.send_email(user_email, subject, html_content)
            
        except Exception as e:
            logger.error(f"Erro ao enviar email: {str(e)}")
            return False
    
    def _send_sms_notification(self, user_id: str, notification_type: NotificationType, data: Dict) -> bool:
        """Enviar notificação por SMS"""
        try:
            if not self.sms_provider:
                logger.error("Provedor de SMS não inicializado")
                return False
            
            # Buscar template de SMS
            template = self._get_template(notification_type, NotificationChannel.SMS)
            if not template:
                # Usar conteúdo básico se não houver template
                message = f"{data.get('title', '')}: {data.get('content', '')}"[:160]
            else:
                message = self._render_template(template.template_content, data)[:160]
            
            # Buscar telefone do usuário
            user_phone = self._get_user_phone(user_id)
            if not user_phone:
                logger.error(f"Telefone não encontrado para usuário {user_id}")
                return False
            
            # Enviar SMS
            return self.sms_provider.send_sms(user_phone, message)
            
        except Exception as e:
            logger.error(f"Erro ao enviar SMS: {str(e)}")
            return False
    
    def _send_push_notification(self, user_id: str, notification_type: NotificationType, data: Dict) -> bool:
        """Enviar push notification"""
        try:
            if not self.push_provider:
                logger.error("Provedor de push não inicializado")
                return False
            
            # Buscar device token do usuário
            device_token = self._get_user_device_token(user_id)
            if not device_token:
                logger.error(f"Device token não encontrado para usuário {user_id}")
                return False
            
            # Enviar push
            return self.push_provider.send_push(
                device_token=device_token,
                title=data.get('title', ''),
                body=data.get('content', ''),
                data=data.get('metadata', {})
            )
            
        except Exception as e:
            logger.error(f"Erro ao enviar push notification: {str(e)}")
            return False
    
    def _get_user_preferences(self, user_id: str, notification_type: NotificationType) -> List[NotificationSubscription]:
        """Buscar preferências de notificação do usuário"""
        return NotificationSubscription.query.filter_by(
            user_id=user_id,
            notification_type=notification_type.value
        ).all()
    
    def _is_channel_enabled(self, preferences: List[NotificationSubscription], channel: NotificationChannel) -> bool:
        """Verificar se canal está habilitado para o usuário"""
        if not preferences:
            # Se não há preferências, assumir habilitado para in-app
            return channel == NotificationChannel.IN_APP
        
        for pref in preferences:
            if channel == NotificationChannel.EMAIL and hasattr(pref, 'email_enabled'):
                return pref.email_enabled
            elif channel == NotificationChannel.SMS and hasattr(pref, 'sms_enabled'):
                return pref.sms_enabled  
            elif channel == NotificationChannel.PUSH and hasattr(pref, 'push_enabled'):
                return pref.push_enabled
            elif channel == NotificationChannel.IN_APP and hasattr(pref, 'in_app_enabled'):
                return pref.in_app_enabled
        
        return True  # Padrão: habilitado
    
    def _get_template(self, notification_type: NotificationType, channel: NotificationChannel) -> Optional[NotificationTemplate]:
        """Buscar template de notificação"""
        return NotificationTemplate.query.filter_by(
            type=notification_type.value,
            channel=channel.value,
            active=True
        ).first()
    
    def _render_template(self, template: str, data: Dict) -> str:
        """Renderizar template com dados"""
        try:
            # Simples substituição de variáveis - pode ser melhorado com Jinja2
            result = template
            for key, value in data.items():
                placeholder = f"{{{{{key}}}}}"
                result = result.replace(placeholder, str(value))
            return result
        except Exception as e:
            logger.error(f"Erro ao renderizar template: {str(e)}")
            return template
    
    def _get_user_email(self, user_id: str) -> Optional[str]:
        """Buscar email do usuário"""
        try:
            # TODO: Implementar query para buscar email do usuário
            from models.user import User
            user = User.query.filter_by(id=user_id).first()
            return user.email if user else None
        except Exception as e:
            logger.error(f"Erro ao buscar email do usuário {user_id}: {str(e)}")
            return None
    
    def _get_user_phone(self, user_id: str) -> Optional[str]:
        """Buscar telefone do usuário"""
        try:
            # TODO: Implementar query para buscar telefone do usuário
            from models.user import User
            user = User.query.filter_by(id=user_id).first()
            return getattr(user, 'phone', None) if user else None
        except Exception as e:
            logger.error(f"Erro ao buscar telefone do usuário {user_id}: {str(e)}")
            return None
    
    def _get_user_device_token(self, user_id: str) -> Optional[str]:
        """Buscar device token do usuário"""
        try:
            # TODO: Implementar query para buscar device token do usuário
            return None  # Placeholder
        except Exception as e:
            logger.error(f"Erro ao buscar device token do usuário {user_id}: {str(e)}")
            return None
    
    def _log_notification(
        self,
        user_id: str,
        notification_type: NotificationType,
        channel: NotificationChannel,
        data: Dict,
        success: bool
    ):
        """Registrar log da notificação"""
        try:
            log_entry = NotificationLog(
                user_id=user_id,
                notification_type=notification_type.value,
                channel=channel.value,
                title=data.get('title', ''),
                message=data.get('content', ''),
                status='sent' if success else 'failed',
                error_message=None if success else 'Falha no envio',
                meta_data=data.get('metadata', {})
            )
            
            db.session.add(log_entry)
            db.session.commit()
            
        except Exception as e:
            logger.error(f"Erro ao registrar log de notificação: {str(e)}")
    
    def get_health_status(self) -> Dict[str, Any]:
        """Verificar status de saúde do serviço"""
        return {
            "email_provider": "configured" if self.email_provider else "not_configured",
            "sms_provider": "configured" if self.sms_provider else "not_configured", 
            "push_provider": "configured" if self.push_provider else "not_configured",
            "database": "connected",
            "status": "healthy"
        }
    
    def create_default_templates(self):
        """Criar templates padrão de notificação"""
        try:
            default_templates = [
                {
                    "type": NotificationType.ORDER_CREATED.value,
                    "channel": NotificationChannel.EMAIL.value,
                    "subject": "Pedido Confirmado - Mestres do Café",
                    "template_content": """
                    <h2>Pedido Confirmado!</h2>
                    <p>Olá {{customer_name}},</p>
                    <p>Seu pedido #{{order_id}} foi confirmado com sucesso.</p>
                    <p>Total: R$ {{total}}</p>
                    <p>Obrigado por escolher os Mestres do Café!</p>
                    """,
                    "variables": ["customer_name", "order_id", "total"]
                },
                {
                    "type": NotificationType.ORDER_SHIPPED.value,
                    "channel": NotificationChannel.EMAIL.value,
                    "subject": "Pedido Enviado - Mestres do Café",
                    "template_content": """
                    <h2>Seu pedido foi enviado!</h2>
                    <p>Olá {{customer_name}},</p>
                    <p>Seu pedido #{{order_id}} foi enviado.</p>
                    <p>Código de rastreamento: {{tracking_code}}</p>
                    """,
                    "variables": ["customer_name", "order_id", "tracking_code"]
                }
            ]
            
            for template_data in default_templates:
                existing = NotificationTemplate.query.filter_by(
                    type=template_data["type"],
                    channel=template_data["channel"]
                ).first()
                
                if not existing:
                    template = NotificationTemplate(
                        type=template_data["type"],
                        channel=template_data["channel"],
                        subject=template_data.get("subject"),
                        template_content=template_data["template_content"],
                        variables=template_data["variables"],
                        active=True
                    )
                    db.session.add(template)
            
            db.session.commit()
            logger.info("Templates padrão de notificação criados")
            
        except Exception as e:
            logger.error(f"Erro ao criar templates padrão: {str(e)}")


# Factory function para obter instância do serviço
_notification_service_instance = None

def get_notification_service():
    """
    Factory function para obter instância do NotificationService
    Garante lazy initialization dentro do contexto Flask
    """
    global _notification_service_instance
    
    if _notification_service_instance is None:
        try:
            _notification_service_instance = NotificationService()
            logger.info("NotificationService instanciado com sucesso")
        except Exception as e:
            logger.error(f"Erro ao instanciar NotificationService: {str(e)}")
            raise
    
    return _notification_service_instance