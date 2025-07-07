from flask import Blueprint, request, jsonify
from src.models.database import db, User, Order, Product, Customer
import uuid
from datetime import datetime
import json

notifications_bp = Blueprint('notifications', __name__)

# Simulação de serviços de notificação
class NotificationService:
    @staticmethod
    def send_email(to_email, subject, content, template=None):
        """Envia email"""
        # Em produção, integração com SendGrid, Mailgun, etc.
        notification_id = str(uuid.uuid4())
        
        # Simular envio
        success = True  # Em produção, verificar resposta do serviço
        
        return {
            'success': success,
            'notification_id': notification_id,
            'type': 'email',
            'to': to_email,
            'subject': subject,
            'sent_at': datetime.now().isoformat()
        }
    
    @staticmethod
    def send_whatsapp(to_phone, message, template=None):
        """Envia mensagem WhatsApp"""
        # Em produção, integração com WhatsApp Business API
        notification_id = str(uuid.uuid4())
        
        # Simular envio
        success = True
        
        return {
            'success': success,
            'notification_id': notification_id,
            'type': 'whatsapp',
            'to': to_phone,
            'message': message,
            'sent_at': datetime.now().isoformat()
        }
    
    @staticmethod
    def send_push_notification(user_id, title, body, data=None):
        """Envia notificação push"""
        # Em produção, integração com Firebase, OneSignal, etc.
        notification_id = str(uuid.uuid4())
        
        # Simular envio
        success = True
        
        return {
            'success': success,
            'notification_id': notification_id,
            'type': 'push',
            'user_id': user_id,
            'title': title,
            'body': body,
            'sent_at': datetime.now().isoformat()
        }
    
    @staticmethod
    def send_sms(to_phone, message):
        """Envia SMS"""
        # Em produção, integração com Twilio, AWS SNS, etc.
        notification_id = str(uuid.uuid4())
        
        # Simular envio
        success = True
        
        return {
            'success': success,
            'notification_id': notification_id,
            'type': 'sms',
            'to': to_phone,
            'message': message,
            'sent_at': datetime.now().isoformat()
        }

@notifications_bp.route('/send', methods=['POST'])
def send_notification():
    """Envia notificação"""
    try:
        data = request.get_json()
        notification_type = data.get('type')  # email, whatsapp, push, sms
        recipients = data.get('recipients', [])
        subject = data.get('subject', '')
        message = data.get('message', '')
        template = data.get('template')
        
        if not notification_type or not recipients:
            return jsonify({'error': 'type e recipients são obrigatórios'}), 400
        
        results = []
        
        for recipient in recipients:
            if notification_type == 'email':
                result = NotificationService.send_email(
                    to_email=recipient.get('email'),
                    subject=subject,
                    content=message,
                    template=template
                )
            elif notification_type == 'whatsapp':
                result = NotificationService.send_whatsapp(
                    to_phone=recipient.get('phone'),
                    message=message,
                    template=template
                )
            elif notification_type == 'push':
                result = NotificationService.send_push_notification(
                    user_id=recipient.get('user_id'),
                    title=subject,
                    body=message,
                    data=data.get('data')
                )
            elif notification_type == 'sms':
                result = NotificationService.send_sms(
                    to_phone=recipient.get('phone'),
                    message=message
                )
            else:
                return jsonify({'error': 'Tipo de notificação não suportado'}), 400
            
            results.append(result)
        
        return jsonify({
            'message': 'Notificações enviadas',
            'results': results
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@notifications_bp.route('/order-status/<order_id>', methods=['POST'])
def notify_order_status(order_id):
    """Notifica mudança de status do pedido"""
    try:
        data = request.get_json()
        new_status = data.get('status')
        notification_type = data.get('notification_type', 'email')
        
        order = Order.query.get(order_id)
        if not order:
            return jsonify({'error': 'Pedido não encontrado'}), 404
        
        # Buscar dados do cliente
        customer = Customer.query.filter_by(user_id=order.user_id).first()
        if not customer:
            return jsonify({'error': 'Cliente não encontrado'}), 404
        
        # Templates de mensagem por status
        status_messages = {
            'processing': {
                'subject': 'Pedido em Processamento',
                'message': f'Seu pedido #{order.id[:8]} está sendo processado e será enviado em breve.'
            },
            'shipped': {
                'subject': 'Pedido Enviado',
                'message': f'Seu pedido #{order.id[:8]} foi enviado! Acompanhe pelo código de rastreamento.'
            },
            'delivered': {
                'subject': 'Pedido Entregue',
                'message': f'Seu pedido #{order.id[:8]} foi entregue! Aproveite seu café especial.'
            },
            'cancelled': {
                'subject': 'Pedido Cancelado',
                'message': f'Seu pedido #{order.id[:8]} foi cancelado. Entre em contato para mais informações.'
            }
        }
        
        if new_status not in status_messages:
            return jsonify({'error': 'Status não suportado'}), 400
        
        template = status_messages[new_status]
        
        # Enviar notificação
        if notification_type == 'email':
            result = NotificationService.send_email(
                to_email=customer.email,
                subject=template['subject'],
                content=template['message']
            )
        elif notification_type == 'whatsapp':
            result = NotificationService.send_whatsapp(
                to_phone=customer.phone,
                message=template['message']
            )
        else:
            return jsonify({'error': 'Tipo de notificação não suportado'}), 400
        
        return jsonify({
            'message': 'Notificação de status enviada',
            'result': result
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@notifications_bp.route('/welcome/<user_id>', methods=['POST'])
def send_welcome_notification(user_id):
    """Envia notificação de boas-vindas"""
    try:
        user = User.query.get(user_id)
        if not user:
            return jsonify({'error': 'Usuário não encontrado'}), 404
        
        customer = Customer.query.filter_by(user_id=user_id).first()
        
        welcome_message = {
            'subject': 'Bem-vindo aos Mestres do Café!',
            'message': f'Olá {user.name}! Bem-vindo à nossa comunidade de amantes de café especial. Descubra nossos produtos exclusivos e ganhe pontos a cada compra!'
        }
        
        # Enviar email de boas-vindas
        email_result = NotificationService.send_email(
            to_email=user.email,
            subject=welcome_message['subject'],
            content=welcome_message['message']
        )
        
        # Enviar WhatsApp se disponível
        whatsapp_result = None
        if customer and customer.phone:
            whatsapp_result = NotificationService.send_whatsapp(
                to_phone=customer.phone,
                message=welcome_message['message']
            )
        
        return jsonify({
            'message': 'Notificações de boas-vindas enviadas',
            'results': {
                'email': email_result,
                'whatsapp': whatsapp_result
            }
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@notifications_bp.route('/promotional', methods=['POST'])
def send_promotional_notification():
    """Envia notificação promocional"""
    try:
        data = request.get_json()
        campaign_name = data.get('campaign_name')
        subject = data.get('subject')
        message = data.get('message')
        target_segment = data.get('target_segment', 'all')  # all, vip, new_customers, etc.
        notification_type = data.get('notification_type', 'email')
        
        if not campaign_name or not subject or not message:
            return jsonify({'error': 'campaign_name, subject e message são obrigatórios'}), 400
        
        # Buscar clientes baseado no segmento
        if target_segment == 'all':
            customers = Customer.query.filter_by(is_subscribed=True).all()
        elif target_segment == 'vip':
            customers = Customer.query.filter(
                Customer.is_subscribed == True,
                Customer.total_spent >= 500.00
            ).all()
        elif target_segment == 'new_customers':
            # Clientes dos últimos 30 dias
            from datetime import timedelta
            thirty_days_ago = datetime.now() - timedelta(days=30)
            customers = Customer.query.filter(
                Customer.is_subscribed == True,
                Customer.acquisition_date >= thirty_days_ago
            ).all()
        else:
            return jsonify({'error': 'Segmento não suportado'}), 400
        
        results = []
        
        for customer in customers:
            if notification_type == 'email':
                result = NotificationService.send_email(
                    to_email=customer.email,
                    subject=subject,
                    content=message
                )
            elif notification_type == 'whatsapp':
                if customer.phone:
                    result = NotificationService.send_whatsapp(
                        to_phone=customer.phone,
                        message=message
                    )
                else:
                    continue
            else:
                continue
            
            results.append(result)
        
        return jsonify({
            'message': f'Campanha {campaign_name} enviada',
            'total_sent': len(results),
            'results': results
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@notifications_bp.route('/templates', methods=['GET'])
def get_notification_templates():
    """Lista templates de notificação disponíveis"""
    return jsonify({
        'templates': [
            {
                'id': 'welcome',
                'name': 'Boas-vindas',
                'subject': 'Bem-vindo aos Mestres do Café!',
                'message': 'Olá {name}! Bem-vindo à nossa comunidade de amantes de café especial.',
                'variables': ['name']
            },
            {
                'id': 'order_confirmation',
                'name': 'Confirmação de Pedido',
                'subject': 'Pedido Confirmado - #{order_id}',
                'message': 'Seu pedido #{order_id} foi confirmado e está sendo processado.',
                'variables': ['order_id']
            },
            {
                'id': 'order_shipped',
                'name': 'Pedido Enviado',
                'subject': 'Pedido Enviado - #{order_id}',
                'message': 'Seu pedido #{order_id} foi enviado! Código de rastreamento: {tracking_code}',
                'variables': ['order_id', 'tracking_code']
            },
            {
                'id': 'promotional',
                'name': 'Promocional',
                'subject': '{promotion_title}',
                'message': '{promotion_message} Aproveite!',
                'variables': ['promotion_title', 'promotion_message']
            }
        ]
    })

@notifications_bp.route('/history', methods=['GET'])
def get_notification_history():
    """Histórico de notificações enviadas"""
    try:
        user_id = request.args.get('user_id')
        notification_type = request.args.get('type')
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 20, type=int)
        
        # Em produção, buscar do banco de dados
        # Por enquanto, simular histórico
        history = [
            {
                'id': str(uuid.uuid4()),
                'type': 'email',
                'subject': 'Pedido Confirmado',
                'recipient': 'cliente@exemplo.com',
                'status': 'sent',
                'sent_at': datetime.now().isoformat()
            },
            {
                'id': str(uuid.uuid4()),
                'type': 'whatsapp',
                'message': 'Seu pedido foi enviado!',
                'recipient': '+5511999999999',
                'status': 'delivered',
                'sent_at': datetime.now().isoformat()
            }
        ]
        
        # Filtrar por tipo se especificado
        if notification_type:
            history = [h for h in history if h['type'] == notification_type]
        
        return jsonify({
            'history': history,
            'total': len(history)
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500 