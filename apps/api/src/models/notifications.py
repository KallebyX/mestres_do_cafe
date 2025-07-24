"""
Modelos para sistema de notificações
"""

import uuid
from datetime import datetime
from database import db
from sqlalchemy.dialects.postgresql import JSON


class Notification(db.Model):
    """Modelo para notificações in-app"""
    __tablename__ = 'notifications'

    id = db.Column(db.String(36), primary_key = True, default = lambda: str(uuid.uuid4()))
    user_id = db.Column(db.String(36), db.ForeignKey('users.id'), nullable = False)
    type = db.Column(db.String(50), nullable = False)
    title = db.Column(db.String(255), nullable = False)
    message = db.Column(db.Text, nullable = False)
    data = db.Column(JSON, default={})  # Dados adicionais em JSON
    read = db.Column(db.Boolean, default = False, nullable = False)
    priority = db.Column(db.String(20), default='medium', nullable = False)
    read_at = db.Column(db.DateTime, nullable = True)
    created_at = db.Column(db.DateTime, default = datetime.utcnow, nullable = False)

    # Relacionamentos
    user = db.relationship('User', backref='notifications')

    def to_dict(self):
        """Converte modelo para dicionário"""
        import json
        return {
            'id': self.id,
            'user_id': self.user_id,
            'type': self.type,
            'title': self.title,
            'message': self.message,
            'data': json.loads(self.data) if isinstance(self.data, str) else self.data,
            'read': self.read,
            'priority': self.priority,
            'read_at': self.read_at.isoformat() if self.read_at else None,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }

    def __repr__(self):
        return f'<Notification {self.id}: {self.title}>'


class NotificationTemplate(db.Model):
    """Templates de notificação"""
    __tablename__ = 'notification_templates'

    id = db.Column(db.String(36), primary_key = True, default = lambda: str(uuid.uuid4()))
    type = db.Column(db.String(50), nullable = False, unique = True)
    channel = db.Column(db.String(20), nullable = False)  # email, push, sms, in_app
    subject = db.Column(db.String(255), nullable = True)  # Para email
    template_content = db.Column(db.Text, nullable = False)
    variables = db.Column(JSON, default={})  # Variáveis disponíveis no template
    active = db.Column(db.Boolean, default = True, nullable = False)
    created_at = db.Column(db.DateTime, default = datetime.utcnow, nullable = False)
    updated_at = db.Column(db.DateTime, default = datetime.utcnow, onupdate = datetime.utcnow, nullable = False)

    def to_dict(self):
        """Converte modelo para dicionário"""
        import json
        return {
            'id': self.id,
            'type': self.type,
            'channel': self.channel,
            'subject': self.subject,
            'template_content': self.template_content,
            'variables': json.loads(self.variables) if isinstance(self.variables, str) else self.variables,
            'active': self.active,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }

    def __repr__(self):
        return f'<NotificationTemplate {self.type}-{self.channel}>'


class NotificationSubscription(db.Model):
    """Preferências de notificação do usuário"""
    __tablename__ = 'notification_subscriptions'

    id = db.Column(db.String(36), primary_key = True, default = lambda: str(uuid.uuid4()))
    user_id = db.Column(db.String(36), db.ForeignKey('users.id'), nullable = False)
    notification_type = db.Column(db.String(50), nullable = False)
    email_enabled = db.Column(db.Boolean, default = True, nullable = False)
    push_enabled = db.Column(db.Boolean, default = True, nullable = False)
    sms_enabled = db.Column(db.Boolean, default = False, nullable = False)
    in_app_enabled = db.Column(db.Boolean, default = True, nullable = False)
    created_at = db.Column(db.DateTime, default = datetime.utcnow, nullable = False)
    updated_at = db.Column(db.DateTime, default = datetime.utcnow, onupdate = datetime.utcnow, nullable = False)

    # Relacionamentos
    user = db.relationship('User', backref='notification_preferences')

    # Índice composto para evitar duplicatas
    __table_args__ = (
        db.UniqueConstraint('user_id', 'notification_type', name='unique_user_notification_type'),
    )

    def to_dict(self):
        """Converte modelo para dicionário"""
        return {
            'id': self.id,
            'user_id': self.user_id,
            'notification_type': self.notification_type,
            'email_enabled': self.email_enabled,
            'push_enabled': self.push_enabled,
            'sms_enabled': self.sms_enabled,
            'in_app_enabled': self.in_app_enabled,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }

    def __repr__(self):
        return f'<NotificationSubscription {self.user_id}-{self.notification_type}>'


class NotificationLog(db.Model):
    """Log de notificações enviadas"""
    __tablename__ = 'notification_logs'

    id = db.Column(db.String(36), primary_key = True, default = lambda: str(uuid.uuid4()))
    user_id = db.Column(db.String(36), nullable = False)  # Não FK para manter histórico
    notification_type = db.Column(db.String(50), nullable = False)
    channel = db.Column(db.String(20), nullable = False)
    recipient_email = db.Column(db.String(255), nullable = True)
    recipient_phone = db.Column(db.String(20), nullable = True)
    title = db.Column(db.String(255), nullable = False)
    message = db.Column(db.Text, nullable = False)
    status = db.Column(db.String(20), default='sent', nullable = False)  # sent, failed, delivered
    error_message = db.Column(db.Text, nullable = True)
    meta_data = db.Column('metadata', JSON, default={})  # Dados extras (IDs de providers, etc.)
    sent_at = db.Column(db.DateTime, default = datetime.utcnow, nullable = False)
    delivered_at = db.Column(db.DateTime, nullable = True)

    def to_dict(self):
        """Converte modelo para dicionário"""
        import json
        return {
            'id': self.id,
            'user_id': self.user_id,
            'notification_type': self.notification_type,
            'channel': self.channel,
            'recipient_email': self.recipient_email,
            'recipient_phone': self.recipient_phone,
            'title': self.title,
            'message': self.message[:200] + '...' if len(self.message) > 200 else self.message,
            'status': self.status,
            'error_message': self.error_message,
            'metadata': json.loads(self.meta_data) if isinstance(self.meta_data, str) else self.meta_data,
            'sent_at': self.sent_at.isoformat() if self.sent_at else None,
            'delivered_at': self.delivered_at.isoformat() if self.delivered_at else None
        }

    def __repr__(self):
        return f'<NotificationLog {self.id}: {self.notification_type}-{self.channel}>'
