from flask import Blueprint, request, jsonify
from src.models.database import db, User, NewsletterSubscriber, NewsletterTemplate, NewsletterCampaign, Customer
from sqlalchemy import func, and_, or_
from datetime import datetime, timedelta
import json
import smtplib
import requests
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from email.mime.base import MIMEBase
from email import encoders
import os
import uuid

newsletter_bp = Blueprint('newsletter', __name__)

# Configurações de email (deveriam vir de variáveis de ambiente)
SMTP_SERVER = os.getenv('SMTP_SERVER', 'smtp.gmail.com')
SMTP_PORT = int(os.getenv('SMTP_PORT', 587))
SMTP_USERNAME = os.getenv('SMTP_USERNAME', '')
SMTP_PASSWORD = os.getenv('SMTP_PASSWORD', '')

# Configurações WhatsApp (exemplo - ajustar conforme API escolhida)
WHATSAPP_API_URL = os.getenv('WHATSAPP_API_URL', '')
WHATSAPP_API_TOKEN = os.getenv('WHATSAPP_API_TOKEN', '')

# Templates de email predefinidos
EMAIL_TEMPLATES = {
    'welcome': {
        'subject': '☕ Bem-vindo aos Mestres do Café!',
        'template': '''
        <html>
        <head>
            <style>
                .container { max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; }
                .header { background: linear-gradient(135deg, #8B4513, #D2691E); color: white; padding: 20px; text-align: center; }
                .content { padding: 20px; }
                .footer { background: #f5f5f5; padding: 15px; text-align: center; color: #666; }
                .button { background: #8B4513; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>☕ Mestres do Café</h1>
                    <p>Bem-vindo à nossa comunidade especial!</p>
                </div>
                <div class="content">
                    <h2>Olá, {name}!</h2>
                    <p>É com grande alegria que damos as boas-vindas à nossa comunidade de amantes do café especial.</p>
                    <p>Como novo membro, você terá acesso a:</p>
                    <ul>
                        <li>🌟 Descontos exclusivos em nossos cafés</li>
                        <li>📚 Conteúdo educacional sobre café</li>
                        <li>🎁 Ofertas especiais para membros</li>
                        <li>☕ Degustações virtuais</li>
                    </ul>
                    <p style="text-align: center;">
                        <a href="{website_url}" class="button">Explorar Nossos Cafés</a>
                    </p>
                </div>
                <div class="footer">
                    <p>Mestres do Café - Sua jornada especial começa aqui</p>
                    <p><a href="{unsubscribe_url}">Descadastrar</a></p>
                </div>
            </div>
        </body>
        </html>
        '''
    },
    'promotion': {
        'subject': '🔥 Oferta Especial: {discount}% OFF em Cafés Selecionados',
        'template': '''
        <html>
        <head>
            <style>
                .container { max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; }
                .header { background: linear-gradient(135deg, #8B4513, #D2691E); color: white; padding: 20px; text-align: center; }
                .content { padding: 20px; }
                .footer { background: #f5f5f5; padding: 15px; text-align: center; color: #666; }
                .button { background: #D2691E; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block; }
                .highlight { background: #fff3cd; padding: 15px; border-left: 4px solid #ffc107; margin: 15px 0; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>🔥 OFERTA ESPECIAL</h1>
                    <h2>{discount}% OFF</h2>
                </div>
                <div class="content">
                    <h2>Olá, {name}!</h2>
                    <div class="highlight">
                        <h3>⏰ Promoção por tempo limitado!</h3>
                        <p><strong>{discount}% de desconto</strong> em cafés selecionados até {end_date}</p>
                    </div>
                    <p>{description}</p>
                    <p>Use o cupom: <strong>{coupon_code}</strong></p>
                    <p style="text-align: center;">
                        <a href="{shop_url}" class="button">Comprar Agora</a>
                    </p>
                </div>
                <div class="footer">
                    <p>Mestres do Café - Qualidade que você pode sentir</p>
                    <p><a href="{unsubscribe_url}">Descadastrar</a></p>
                </div>
            </div>
        </body>
        </html>
        '''
    },
    'educational': {
        'subject': '📚 Aprenda: {topic}',
        'template': '''
        <html>
        <head>
            <style>
                .container { max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; }
                .header { background: linear-gradient(135deg, #8B4513, #D2691E); color: white; padding: 20px; text-align: center; }
                .content { padding: 20px; }
                .footer { background: #f5f5f5; padding: 15px; text-align: center; color: #666; }
                .button { background: #8B4513; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block; }
                .tip { background: #e8f4f8; padding: 15px; border-left: 4px solid #17a2b8; margin: 15px 0; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>📚 Mestres do Café</h1>
                    <p>Conhecimento que faz a diferença</p>
                </div>
                <div class="content">
                    <h2>Olá, {name}!</h2>
                    <h3>{topic}</h3>
                    <div class="tip">
                        <h4>💡 Dica do Especialista</h4>
                        <p>{tip}</p>
                    </div>
                    <p>{content}</p>
                    <p style="text-align: center;">
                        <a href="{blog_url}" class="button">Ler Artigo Completo</a>
                    </p>
                </div>
                <div class="footer">
                    <p>Mestres do Café - Educação e Qualidade</p>
                    <p><a href="{unsubscribe_url}">Descadastrar</a></p>
                </div>
            </div>
        </body>
        </html>
        '''
    },
    'new_product': {
        'subject': '🆕 Novo Lançamento: {product_name}',
        'template': '''
        <html>
        <head>
            <style>
                .container { max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; }
                .header { background: linear-gradient(135deg, #8B4513, #D2691E); color: white; padding: 20px; text-align: center; }
                .content { padding: 20px; }
                .footer { background: #f5f5f5; padding: 15px; text-align: center; color: #666; }
                .button { background: #28a745; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block; }
                .product { background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 15px 0; text-align: center; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>🆕 NOVO LANÇAMENTO</h1>
                </div>
                <div class="content">
                    <h2>Olá, {name}!</h2>
                    <p>Temos o prazer de apresentar nossa mais nova adição:</p>
                    <div class="product">
                        <h3>{product_name}</h3>
                        <p><strong>Origem:</strong> {origin}</p>
                        <p><strong>Processo:</strong> {process}</p>
                        <p><strong>Pontuação SCA:</strong> {sca_score}</p>
                        <p>{description}</p>
                        <h4>R$ {price}</h4>
                    </div>
                    <p style="text-align: center;">
                        <a href="{product_url}" class="button">Ver Produto</a>
                    </p>
                </div>
                <div class="footer">
                    <p>Mestres do Café - Sempre inovando para você</p>
                    <p><a href="{unsubscribe_url}">Descadastrar</a></p>
                </div>
            </div>
        </body>
        </html>
        '''
    },
    'order_confirmation': {
        'subject': '✅ Pedido Confirmado #{order_id}',
        'template': '''
        <html>
        <head>
            <style>
                .container { max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; }
                .header { background: linear-gradient(135deg, #8B4513, #D2691E); color: white; padding: 20px; text-align: center; }
                .content { padding: 20px; }
                .footer { background: #f5f5f5; padding: 15px; text-align: center; color: #666; }
                .button { background: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block; }
                .order-info { background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 15px 0; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>✅ Pedido Confirmado</h1>
                    <p>Obrigado pela sua compra!</p>
                </div>
                <div class="content">
                    <h2>Olá, {name}!</h2>
                    <p>Seu pedido foi confirmado e está sendo preparado com carinho.</p>
                    <div class="order-info">
                        <h3>Pedido #{order_id}</h3>
                        <p><strong>Total:</strong> R$ {total_amount}</p>
                        <p><strong>Status:</strong> {status}</p>
                        <p><strong>Previsão de entrega:</strong> {delivery_date}</p>
                    </div>
                    <p style="text-align: center;">
                        <a href="{tracking_url}" class="button">Acompanhar Pedido</a>
                    </p>
                </div>
                <div class="footer">
                    <p>Mestres do Café - Sua satisfação é nossa prioridade</p>
                </div>
            </div>
        </body>
        </html>
        '''
    },
    'abandoned_cart': {
        'subject': '🛒 Você esqueceu alguns cafés especiais no seu carrinho',
        'template': '''
        <html>
        <head>
            <style>
                .container { max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; }
                .header { background: linear-gradient(135deg, #8B4513, #D2691E); color: white; padding: 20px; text-align: center; }
                .content { padding: 20px; }
                .footer { background: #f5f5f5; padding: 15px; text-align: center; color: #666; }
                .button { background: #ffc107; color: #212529; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block; }
                .cart-items { background: #f8f9fa; padding: 15px; border-radius: 8px; margin: 15px 0; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>🛒 Não se esqueça!</h1>
                    <p>Seus cafés especiais estão esperando</p>
                </div>
                <div class="content">
                    <h2>Olá, {name}!</h2>
                    <p>Notamos que você deixou alguns itens no seu carrinho. Que tal finalizar sua compra?</p>
                    <div class="cart-items">
                        <h4>Seus itens salvos:</h4>
                        {cart_items}
                    </div>
                    <p>💝 <strong>Oferta especial:</strong> Use o cupom <strong>VOLTA10</strong> e ganhe 10% de desconto!</p>
                    <p style="text-align: center;">
                        <a href="{cart_url}" class="button">Finalizar Compra</a>
                    </p>
                </div>
                <div class="footer">
                    <p>Mestres do Café - Sempre pensando em você</p>
                    <p><a href="{unsubscribe_url}">Descadastrar</a></p>
                </div>
            </div>
        </body>
        </html>
        '''
    }
}

# Templates WhatsApp
WHATSAPP_TEMPLATES = {
    'welcome': '☕ *Mestres do Café* ☕\n\nOlá {name}! Bem-vindo à nossa comunidade especial! 🎉\n\nComo novo membro, você terá acesso a descontos exclusivos e conteúdo educacional.\n\n🌐 Visite: {website_url}',
    'promotion': '🔥 *OFERTA ESPECIAL* 🔥\n\nOlá {name}!\n\n*{discount}% OFF* em cafés selecionados até {end_date}\n\nCupom: *{coupon_code}*\n\n🛒 Compre: {shop_url}',
    'new_product': '🆕 *NOVO LANÇAMENTO* 🆕\n\nOlá {name}!\n\nConheça nosso novo café: *{product_name}*\n\n📍 Origem: {origin}\n⭐ SCA: {sca_score}\n💰 R$ {price}\n\n👀 Ver: {product_url}',
    'order_confirmation': '✅ *Pedido Confirmado* ✅\n\nOlá {name}!\n\nSeu pedido #{order_id} foi confirmado!\n\n💰 Total: R$ {total_amount}\n📦 Status: {status}\n\n🔍 Acompanhar: {tracking_url}'
}

# ===========================================
# FUNÇÕES AUXILIARES
# ===========================================

def send_email(to_email, subject, html_content):
    """Enviar email via SMTP"""
    try:
        msg = MIMEMultipart('alternative')
        msg['Subject'] = subject
        msg['From'] = SMTP_USERNAME
        msg['To'] = to_email
        
        # Attach HTML content
        html_part = MIMEText(html_content, 'html', 'utf-8')
        msg.attach(html_part)
        
        # Send email
        with smtplib.SMTP(SMTP_SERVER, SMTP_PORT) as server:
            server.starttls()
            server.login(SMTP_USERNAME, SMTP_PASSWORD)
            server.send_message(msg)
        
        return True
    except Exception as e:
        print(f"Erro ao enviar email: {e}")
        return False

def send_whatsapp_message(phone, message):
    """Enviar mensagem via WhatsApp API"""
    try:
        # Exemplo genérico - ajustar conforme API escolhida
        if not WHATSAPP_API_URL or not WHATSAPP_API_TOKEN:
            print("WhatsApp API não configurada")
            return False
        
        payload = {
            'phone': phone,
            'message': message
        }
        
        headers = {
            'Authorization': f'Bearer {WHATSAPP_API_TOKEN}',
            'Content-Type': 'application/json'
        }
        
        response = requests.post(WHATSAPP_API_URL, json=payload, headers=headers)
        return response.status_code == 200
    except Exception as e:
        print(f"Erro ao enviar WhatsApp: {e}")
        return False

def render_template(template_content, variables):
    """Renderizar template com variáveis"""
    for key, value in variables.items():
        template_content = template_content.replace(f'{{{key}}}', str(value))
    return template_content

# ===========================================
# ENDPOINTS DE TEMPLATES
# ===========================================

@newsletter_bp.route('/templates', methods=['GET'])
def get_templates():
    """Listar todos os templates"""
    try:
        templates = NewsletterTemplate.query.all()
        return jsonify({
            'templates': [
                {
                    'id': str(template.id),
                    'name': template.name,
                    'subject': template.subject,
                    'html_content': template.html_content,
                    'text_content': template.text_content,
                    'type': template.type,
                    'variables': json.loads(template.variables) if template.variables else [],
                    'is_active': template.is_active,
                    'created_at': template.created_at.isoformat(),
                    'updated_at': template.updated_at.isoformat() if template.updated_at else None
                }
                for template in templates
            ]
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@newsletter_bp.route('/templates', methods=['POST'])
def create_template():
    """Criar novo template"""
    try:
        data = request.get_json()
        
        template = NewsletterTemplate()
        template.id = str(uuid.uuid4())
        template.name = data.get('name')
        template.subject = data.get('subject')
        template.html_content = data.get('html_content')
        template.text_content = data.get('text_content')
        template.type = data.get('type', 'newsletter')
        template.variables = json.dumps(data.get('variables', []))
        template.is_active = data.get('is_active', True)
        
        db.session.add(template)
        db.session.commit()
        
        return jsonify({
            'message': 'Template criado com sucesso',
            'template': {
                'id': str(template.id),
                'name': template.name,
                'subject': template.subject,
                'type': template.type,
                'is_active': template.is_active
            }
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@newsletter_bp.route('/templates/<template_id>', methods=['PUT'])
def update_template(template_id):
    """Atualizar template"""
    try:
        template = NewsletterTemplate.query.get(template_id)
        if not template:
            return jsonify({'error': 'Template não encontrado'}), 404
        
        data = request.get_json()
        
        if 'name' in data:
            template.name = data['name']
        if 'subject' in data:
            template.subject = data['subject']
        if 'html_content' in data:
            template.html_content = data['html_content']
        if 'text_content' in data:
            template.text_content = data['text_content']
        if 'type' in data:
            template.type = data['type']
        if 'variables' in data:
            template.variables = json.dumps(data['variables'])
        if 'is_active' in data:
            template.is_active = data['is_active']
        
        template.updated_at = datetime.utcnow()
        db.session.commit()
        
        return jsonify({
            'message': 'Template atualizado com sucesso',
            'template': {
                'id': str(template.id),
                'name': template.name,
                'subject': template.subject,
                'type': template.type,
                'is_active': template.is_active
            }
        })
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@newsletter_bp.route('/templates/<template_id>/preview', methods=['POST'])
def preview_template(template_id):
    """Preview do template com dados de exemplo"""
    try:
        template = NewsletterTemplate.query.get(template_id)
        if not template:
            return jsonify({'error': 'Template não encontrado'}), 404
        
        data = request.get_json()
        sample_data = data.get('sample_data', {})
        
        # Substituir variáveis no template
        html_content = template.html_content
        text_content = template.text_content
        
        for key, value in sample_data.items():
            placeholder = f"{{{{{key}}}}}"
            html_content = html_content.replace(placeholder, str(value))
            text_content = text_content.replace(placeholder, str(value))
        
        return jsonify({
            'preview': {
                'html': html_content,
                'text': text_content,
                'subject': template.subject
            }
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# ===========================================
# ENDPOINTS DE CAMPANHAS DE NEWSLETTER
# ===========================================

@newsletter_bp.route('/campaigns', methods=['GET'])
def get_campaigns():
    """Listar todas as campanhas"""
    try:
        campaigns = NewsletterCampaign.query.all()
        return jsonify({
            'campaigns': [
                {
                    'id': str(campaign.id),
                    'name': campaign.name,
                    'subject': campaign.subject,
                    'template_id': str(campaign.template_id),
                    'status': campaign.status,
                    'type': campaign.type,
                    'segment_criteria': json.loads(campaign.segment_criteria) if campaign.segment_criteria else {},
                    'scheduled_at': campaign.scheduled_at.isoformat() if campaign.scheduled_at else None,
                    'sent_at': campaign.sent_at.isoformat() if campaign.sent_at else None,
                    'total_sent': campaign.total_sent,
                    'total_opened': campaign.total_opened,
                    'total_clicked': campaign.total_clicked,
                    'created_at': campaign.created_at.isoformat()
                }
                for campaign in campaigns
            ]
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@newsletter_bp.route('/campaigns', methods=['POST'])
def create_campaign():
    """Criar nova campanha"""
    try:
        data = request.get_json()
        
        campaign = NewsletterCampaign()
        campaign.id = str(uuid.uuid4())
        campaign.name = data.get('name')
        campaign.subject = data.get('subject')
        campaign.template_id = data.get('template_id')
        campaign.status = 'draft'
        campaign.type = data.get('type', 'newsletter')
        campaign.segment_criteria = json.dumps(data.get('segment_criteria', {}))
        campaign.scheduled_at = datetime.fromisoformat(data['scheduled_at']) if data.get('scheduled_at') else None
        
        db.session.add(campaign)
        db.session.commit()
        
        return jsonify({
            'message': 'Campanha criada com sucesso',
            'campaign': {
                'id': str(campaign.id),
                'name': campaign.name,
                'subject': campaign.subject,
                'status': campaign.status,
                'type': campaign.type
            }
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@newsletter_bp.route('/campaigns/<campaign_id>/send', methods=['POST'])
def send_campaign(campaign_id):
    """Enviar campanha"""
    try:
        campaign = NewsletterCampaign.query.get(campaign_id)
        if not campaign:
            return jsonify({'error': 'Campanha não encontrada'}), 404
        
        if campaign.status != 'draft':
            return jsonify({'error': 'Campanha já foi enviada'}), 400
        
        # Buscar inscritos baseado nos critérios de segmentação
        subscribers = NewsletterSubscriber.query.filter_by(is_subscribed=True).all()
        
        # TODO: Implementar lógica de segmentação avançada
        # TODO: Implementar envio real de email/WhatsApp
        
        campaign.status = 'sent'
        campaign.sent_at = datetime.utcnow()
        campaign.total_sent = len(subscribers)
        
        db.session.commit()
        
        return jsonify({
            'message': f'Campanha enviada para {len(subscribers)} inscritos',
            'campaign': {
                'id': str(campaign.id),
                'name': campaign.name,
                'total_sent': campaign.total_sent,
                'sent_at': campaign.sent_at.isoformat()
            }
        })
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

# ===========================================
# ENDPOINTS DE AUTOMAÇÃO
# ===========================================

@newsletter_bp.route('/automation/welcome', methods=['POST'])
def send_welcome_email():
    try:
        data = request.get_json()
        customer_id = data.get('customer_id')
        
        customer = Customer.query.get(customer_id)
        if not customer:
            return jsonify({'error': 'Cliente não encontrado'}), 404
        
        variables = {
            'name': customer.name,
            'website_url': 'https://mestres-do-cafe.com',
            'unsubscribe_url': f'https://mestres-do-cafe.com/unsubscribe/{customer.id}'
        }
        
        # Enviar email de boas-vindas
        template = EMAIL_TEMPLATES['welcome']
        subject = render_template(template['subject'], variables)
        content = render_template(template['template'], variables)
        
        success = send_email(customer.email, subject, content)
        
        if success:
            return jsonify({'message': 'Email de boas-vindas enviado com sucesso'})
        else:
            return jsonify({'error': 'Falha ao enviar email'}), 500
            
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@newsletter_bp.route('/automation/order-confirmation', methods=['POST'])
def send_order_confirmation():
    try:
        data = request.get_json()
        order_id = data.get('order_id')
        
        # Buscar pedido e cliente
        from src.models.database import Order
        order = Order.query.get(order_id)
        if not order:
            return jsonify({'error': 'Pedido não encontrado'}), 404
        
        customer = Customer.query.filter_by(email=order.user.email).first()
        if not customer:
            return jsonify({'error': 'Cliente não encontrado'}), 404
        
        variables = {
            'name': customer.name,
            'order_id': order.id,
            'total_amount': f"{order.total_amount:.2f}",
            'status': order.status,
            'delivery_date': (datetime.utcnow() + timedelta(days=5)).strftime('%d/%m/%Y'),
            'tracking_url': f'https://mestres-do-cafe.com/orders/{order.id}'
        }
        
        # Enviar email de confirmação
        template = EMAIL_TEMPLATES['order_confirmation']
        subject = render_template(template['subject'], variables)
        content = render_template(template['template'], variables)
        
        success = send_email(customer.email, subject, content)
        
        if success:
            return jsonify({'message': 'Email de confirmação enviado com sucesso'})
        else:
            return jsonify({'error': 'Falha ao enviar email'}), 500
            
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# ===========================================
# ENDPOINTS DE ESTATÍSTICAS
# ===========================================

@newsletter_bp.route('/stats', methods=['GET'])
def get_newsletter_stats():
    try:
        # Estatísticas gerais de campanhas
        total_campaigns = Campaign.query.count()
        active_campaigns = Campaign.query.filter_by(status='active').count()
        
        # Total de emails enviados
        total_sent = db.session.query(func.sum(Campaign.sent_count)).scalar() or 0
        
        # Taxa de abertura média (simulada - requer tracking real)
        avg_open_rate = db.session.query(func.avg(Campaign.opened_count / Campaign.sent_count * 100))\
                                  .filter(Campaign.sent_count > 0).scalar() or 0
        
        # Campanhas por tipo
        campaigns_by_type = db.session.query(
            Campaign.type,
            func.count(Campaign.id)
        ).group_by(Campaign.type).all()
        
        return jsonify({
            'stats': {
                'total_campaigns': total_campaigns,
                'active_campaigns': active_campaigns,
                'total_sent': int(total_sent),
                'avg_open_rate': round(float(avg_open_rate), 2),
                'campaigns_by_type': {
                    campaign_type: count for campaign_type, count in campaigns_by_type
                }
            }
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# ===========================================
# ENDPOINTS DE INSCRITOS
# ===========================================

@newsletter_bp.route('/subscribers', methods=['GET'])
def get_subscribers():
    """Listar todos os inscritos na newsletter"""
    try:
        subscribers = NewsletterSubscriber.query.all()
        return jsonify({
            'subscribers': [
                {
                    'id': str(sub.id),
                    'email': sub.email,
                    'name': sub.name,
                    'phone': sub.phone,
                    'is_subscribed': sub.is_subscribed,
                    'preferences': json.loads(sub.preferences) if sub.preferences else {},
                    'created_at': sub.created_at.isoformat(),
                    'last_email_sent': sub.last_email_sent.isoformat() if sub.last_email_sent else None
                }
                for sub in subscribers
            ]
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@newsletter_bp.route('/subscribers', methods=['POST'])
def add_subscriber():
    """Adicionar novo inscrito"""
    try:
        data = request.get_json()
        
        # Verificar se já existe
        existing = NewsletterSubscriber.query.filter_by(email=data.get('email')).first()
        if existing:
            return jsonify({'error': 'Email já cadastrado'}), 400
        
        subscriber = NewsletterSubscriber(
            id=str(uuid.uuid4()),
            email=data.get('email'),
            name=data.get('name', ''),
            phone=data.get('phone', ''),
            is_subscribed=True,
            preferences=json.dumps(data.get('preferences', {}))
        )
        
        db.session.add(subscriber)
        db.session.commit()
        
        return jsonify({
            'message': 'Inscrito adicionado com sucesso',
            'subscriber': {
                'id': str(subscriber.id),
                'email': subscriber.email,
                'name': subscriber.name,
                'phone': subscriber.phone,
                'is_subscribed': subscriber.is_subscribed
            }
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@newsletter_bp.route('/subscribers/<subscriber_id>', methods=['PUT'])
def update_subscriber(subscriber_id):
    """Atualizar inscrito"""
    try:
        subscriber = NewsletterSubscriber.query.get(subscriber_id)
        if not subscriber:
            return jsonify({'error': 'Inscrito não encontrado'}), 404
        
        data = request.get_json()
        
        if 'email' in data:
            subscriber.email = data['email']
        if 'name' in data:
            subscriber.name = data['name']
        if 'phone' in data:
            subscriber.phone = data['phone']
        if 'is_subscribed' in data:
            subscriber.is_subscribed = data['is_subscribed']
        if 'preferences' in data:
            subscriber.preferences = json.dumps(data['preferences'])
        
        db.session.commit()
        
        return jsonify({
            'message': 'Inscrito atualizado com sucesso',
            'subscriber': {
                'id': str(subscriber.id),
                'email': subscriber.email,
                'name': subscriber.name,
                'phone': subscriber.phone,
                'is_subscribed': subscriber.is_subscribed
            }
        })
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@newsletter_bp.route('/subscribers/<subscriber_id>', methods=['DELETE'])
def delete_subscriber(subscriber_id):
    """Remover inscrito"""
    try:
        subscriber = NewsletterSubscriber.query.get(subscriber_id)
        if not subscriber:
            return jsonify({'error': 'Inscrito não encontrado'}), 404
        
        db.session.delete(subscriber)
        db.session.commit()
        
        return jsonify({'message': 'Inscrito removido com sucesso'})
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

# =============================================
# WHATSAPP - INTEGRAÇÃO WHATSAPP BUSINESS
# =============================================

@newsletter_bp.route('/whatsapp/templates', methods=['GET'])
def get_whatsapp_templates():
    """Listar templates do WhatsApp Business"""
    try:
        # TODO: Integrar com WhatsApp Business API
        templates = [
            {
                'id': 'welcome_template',
                'name': 'Boas-vindas',
                'language': 'pt_BR',
                'status': 'APPROVED',
                'category': 'UTILITY',
                'components': [
                    {
                        'type': 'HEADER',
                        'text': 'Bem-vindo aos Mestres do Café!'
                    },
                    {
                        'type': 'BODY',
                        'text': 'Olá {{1}}, seja bem-vindo! Você agora receberá nossas novidades sobre café especial.'
                    }
                ]
            },
            {
                'id': 'promo_template',
                'name': 'Promoção Especial',
                'language': 'pt_BR',
                'status': 'APPROVED',
                'category': 'MARKETING',
                'components': [
                    {
                        'type': 'HEADER',
                        'text': 'Oferta Especial - {{1}}'
                    },
                    {
                        'type': 'BODY',
                        'text': 'Olá {{1}}! Temos uma oferta especial para você: {{2}} com {{3}} de desconto!'
                    }
                ]
            }
        ]
        
        return jsonify({'templates': templates})
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@newsletter_bp.route('/whatsapp/send', methods=['POST'])
def send_whatsapp_campaign():
    """Enviar mensagem via WhatsApp"""
    try:
        data = request.get_json()
        
        # TODO: Implementar integração real com WhatsApp Business API
        # Por enquanto, simular envio
        
        return jsonify({
            'message': 'Mensagem WhatsApp enviada com sucesso',
            'message_id': str(uuid.uuid4()),
            'status': 'sent',
            'to': data.get('to'),
            'template': data.get('template')
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# =============================================
# ANALYTICS - MÉTRICAS DE ENGAGAMENTO
# =============================================

@newsletter_bp.route('/analytics/overview', methods=['GET'])
def get_newsletter_analytics():
    """Métricas gerais da newsletter"""
    try:
        total_subscribers = NewsletterSubscriber.query.filter_by(is_subscribed=True).count()
        total_campaigns = NewsletterCampaign.query.count()
        sent_campaigns = NewsletterCampaign.query.filter_by(status='sent').count()
        
        # Calcular métricas de engajamento
        campaigns = NewsletterCampaign.query.filter_by(status='sent').all()
        total_sent = sum(c.total_sent for c in campaigns)
        total_opened = sum(c.total_opened for c in campaigns)
        total_clicked = sum(c.total_clicked for c in campaigns)
        
        open_rate = (total_opened / total_sent * 100) if total_sent > 0 else 0
        click_rate = (total_clicked / total_sent * 100) if total_sent > 0 else 0
        
        return jsonify({
            'overview': {
                'total_subscribers': total_subscribers,
                'total_campaigns': total_campaigns,
                'sent_campaigns': sent_campaigns,
                'total_sent': total_sent,
                'total_opened': total_opened,
                'total_clicked': total_clicked,
                'open_rate': round(open_rate, 2),
                'click_rate': round(click_rate, 2)
            }
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@newsletter_bp.route('/analytics/campaigns/<campaign_id>', methods=['GET'])
def get_campaign_analytics(campaign_id):
    """Métricas detalhadas de uma campanha"""
    try:
        campaign = NewsletterCampaign.query.get(campaign_id)
        if not campaign:
            return jsonify({'error': 'Campanha não encontrada'}), 404
        
        open_rate = (campaign.total_opened / campaign.total_sent * 100) if campaign.total_sent > 0 else 0
        click_rate = (campaign.total_clicked / campaign.total_sent * 100) if campaign.total_sent > 0 else 0
        
        return jsonify({
            'campaign_analytics': {
                'id': str(campaign.id),
                'name': campaign.name,
                'total_sent': campaign.total_sent,
                'total_opened': campaign.total_opened,
                'total_clicked': campaign.total_clicked,
                'open_rate': round(open_rate, 2),
                'click_rate': round(click_rate, 2),
                'sent_at': campaign.sent_at.isoformat() if campaign.sent_at else None
            }
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500 