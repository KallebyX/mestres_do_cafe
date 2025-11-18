"""
Rotas para o sistema de Newsletter
"""

from datetime import datetime
from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity, get_jwt
from sqlalchemy import desc
from sqlalchemy.exc import SQLAlchemyError

from database import db
from models import NewsletterSubscriber, NewsletterTemplate, NewsletterCampaign, User
from utils.validators import validate_required_fields
import secrets
import re

newsletter_bp = Blueprint('newsletter', __name__)


# ================ INSCRIÇÕES ================

@newsletter_bp.route('/subscribe', methods=['POST'])
@jwt_required()
def subscribe():
    """Inscrever-se na newsletter (público)"""
    try:
        data = request.get_json()
        validation = validate_required_fields(data, ['email'])
        if not validation['valid']:
            return jsonify({'success': False, 'error': validation['message']}), 400

        # Validar formato de email
        email_pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
        if not re.match(email_pattern, data['email']):
            return jsonify({'success': False, 'error': 'Email inválido'}), 400

        # Verificar se já existe
        existing = NewsletterSubscriber.query.filter_by(email=data['email']).first()
        if existing:
            if existing.status == 'active':
                return jsonify({'success': True, 'message': 'Email já inscrito'}), 200
            else:
                # Reativar inscrição
                existing.status = 'active'
                existing.subscribed_at = datetime.utcnow()
                db.session.commit()
                return jsonify({'success': True, 'message': 'Inscrição reativada'}), 200

        # Criar novo assinante
        token = secrets.token_urlsafe(32)
        subscriber = NewsletterSubscriber(
            email=data['email'],
            name=data.get('name'),
            phone=data.get('phone'),
            source=data.get('source', 'website'),
            verification_token=token
        )

        db.session.add(subscriber)
        db.session.commit()

        # Enviar email de verificação
        _send_verification_email(subscriber.email, token)

        return jsonify({
            'success': True,
            'message': 'Inscrição realizada! Verifique seu email.',
            'subscriber_id': str(subscriber.id)
        }), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'error': str(e)}), 500


@newsletter_bp.route('/unsubscribe', methods=['POST'])
@jwt_required()
def unsubscribe():
    """Cancelar inscrição"""
    try:
        data = request.get_json()
        validation = validate_required_fields(data, ['email'])
        if not validation['valid']:
            return jsonify({'success': False, 'error': validation['message']}), 400

        subscriber = NewsletterSubscriber.query.filter_by(email=data['email']).first()
        if not subscriber:
            return jsonify({'success': False, 'error': 'Email não encontrado'}), 404

        subscriber.status = 'unsubscribed'
        subscriber.unsubscribed_at = datetime.utcnow()
        subscriber.unsubscribe_reason = data.get('reason')
        db.session.commit()

        return jsonify({'success': True, 'message': 'Inscrição cancelada'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'error': str(e)}), 500


@newsletter_bp.route('/subscribers', methods=['GET'])
@jwt_required()
def get_subscribers():
    """Listar assinantes (admin)"""
    try:
        claims = get_jwt()
        if not claims.get('is_admin'):
            return jsonify({'success': False, 'error': 'Acesso negado'}), 403

        status = request.args.get('status', 'active')
        page = int(request.args.get('page', 1))
        per_page = int(request.args.get('per_page', 50))

        query = NewsletterSubscriber.query.filter_by(status=status)
        pagination = query.paginate(page=page, per_page=per_page, error_out=False)

        return jsonify({
            'success': True,
            'subscribers': [s.to_dict() for s in pagination.items],
            'total': pagination.total,
            'pages': pagination.pages
        }), 200
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500


# ================ TEMPLATES ================

@newsletter_bp.route('/templates', methods=['GET'])
@jwt_required()
def get_templates():
    """Listar templates (admin)"""
    try:
        claims = get_jwt()
        if not claims.get('is_admin'):
            return jsonify({'success': False, 'error': 'Acesso negado'}), 403

        templates = NewsletterTemplate.query.filter_by(is_active=True).all()
        return jsonify({
            'success': True,
            'templates': [t.to_dict() for t in templates]
        }), 200
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500


@newsletter_bp.route('/templates', methods=['POST'])
@jwt_required()
def create_template():
    """Criar template (admin)"""
    try:
        claims = get_jwt()
        if not claims.get('is_admin'):
            return jsonify({'success': False, 'error': 'Acesso negado'}), 403

        current_user_id = get_jwt_identity()
        data = request.get_json()

        validation = validate_required_fields(data, ['name', 'subject', 'html_content'])
        if not validation['valid']:
            return jsonify({'success': False, 'error': validation['message']}), 400

        template = NewsletterTemplate(
            name=data['name'],
            description=data.get('description'),
            category=data.get('category'),
            subject=data['subject'],
            preheader=data.get('preheader'),
            html_content=data['html_content'],
            text_content=data.get('text_content'),
            created_by=current_user_id
        )

        db.session.add(template)
        db.session.commit()

        return jsonify({'success': True, 'template': template.to_dict()}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'error': str(e)}), 500


# ================ CAMPANHAS ================

@newsletter_bp.route('/campaigns', methods=['GET'])
@jwt_required()
def get_campaigns():
    """Listar campanhas (admin)"""
    try:
        claims = get_jwt()
        if not claims.get('is_admin'):
            return jsonify({'success': False, 'error': 'Acesso negado'}), 403

        campaigns = NewsletterCampaign.query.order_by(desc(NewsletterCampaign.created_at)).all()
        return jsonify({
            'success': True,
            'campaigns': [c.to_dict() for c in campaigns]
        }), 200
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500


@newsletter_bp.route('/campaigns', methods=['POST'])
@jwt_required()
def create_campaign():
    """Criar campanha (admin)"""
    try:
        claims = get_jwt()
        if not claims.get('is_admin'):
            return jsonify({'success': False, 'error': 'Acesso negado'}), 403

        current_user_id = get_jwt_identity()
        data = request.get_json()

        validation = validate_required_fields(data, ['name', 'subject'])
        if not validation['valid']:
            return jsonify({'success': False, 'error': validation['message']}), 400

        campaign = NewsletterCampaign(
            name=data['name'],
            description=data.get('description'),
            type=data.get('type', 'regular'),
            template_id=data.get('template_id'),
            subject=data['subject'],
            preheader=data.get('preheader'),
            html_content=data.get('html_content'),
            text_content=data.get('text_content'),
            target_audience=data.get('target_audience', 'all'),
            created_by=current_user_id
        )

        db.session.add(campaign)
        db.session.commit()

        return jsonify({'success': True, 'campaign': campaign.to_dict()}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'error': str(e)}), 500


@newsletter_bp.route('/campaigns/<campaign_id>/send', methods=['POST'])
@jwt_required()
def send_campaign(campaign_id):
    """Enviar campanha (admin)"""
    try:
        claims = get_jwt()
        if not claims.get('is_admin'):
            return jsonify({'success': False, 'error': 'Acesso negado'}), 403

        campaign = NewsletterCampaign.query.get(campaign_id)
        if not campaign:
            return jsonify({'success': False, 'error': 'Campanha não encontrada'}), 404

        if campaign.status not in ['draft', 'scheduled']:
            return jsonify({'success': False, 'error': 'Campanha já foi enviada'}), 400

        # Contar destinatários
        subscribers = NewsletterSubscriber.query.filter_by(status='active').all()
        campaign.total_recipients = len(subscribers)
        campaign.status = 'sending'
        campaign.sent_at = datetime.utcnow()

        db.session.commit()

        # Enviar campanha em background
        _send_campaign_async(campaign.id)

        return jsonify({
            'success': True,
            'message': 'Campanha em processo de envio',
            'recipients': campaign.total_recipients
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'error': str(e)}), 500


@newsletter_bp.route('/campaigns/<campaign_id>/stats', methods=['GET'])
@jwt_required()
def get_campaign_stats(campaign_id):
    """Estatísticas da campanha (admin)"""
    try:
        claims = get_jwt()
        if not claims.get('is_admin'):
            return jsonify({'success': False, 'error': 'Acesso negado'}), 403

        campaign = NewsletterCampaign.query.get(campaign_id)
        if not campaign:
            return jsonify({'success': False, 'error': 'Campanha não encontrada'}), 404

        return jsonify({
            'success': True,
            'stats': {
                'total_recipients': campaign.total_recipients,
                'total_sent': campaign.total_sent,
                'total_delivered': campaign.total_delivered,
                'total_opened': campaign.total_opened,
                'total_clicked': campaign.total_clicked,
                'total_bounced': campaign.total_bounced,
                'open_rate': campaign.open_rate,
                'click_rate': campaign.click_rate,
                'bounce_rate': campaign.bounce_rate
            }
        }), 200
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500


# ================ FUNÇÕES AUXILIARES ================

def _send_verification_email(email: str, token: str):
    """Enviar email de verificação para novo inscrito"""
    try:
        from services.notification_service import NotificationService

        notification_service = NotificationService()

        # Construir link de verificação
        verification_link = f"{request.host_url}api/newsletter/verify?token={token}"

        # Template do email
        subject = "Confirme sua inscrição - Mestres do Café"
        html_body = f"""
        <html>
        <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background-color: #FF6B35; padding: 20px; text-align: center;">
                <h1 style="color: white; margin: 0;">☕ Mestres do Café</h1>
            </div>

            <div style="padding: 30px; background-color: #f9f9f9;">
                <h2 style="color: #333;">Confirme sua inscrição</h2>

                <p style="color: #666; line-height: 1.6;">
                    Olá! Obrigado por se inscrever na nossa newsletter.
                </p>

                <p style="color: #666; line-height: 1.6;">
                    Para confirmar sua inscrição e começar a receber nossas novidades,
                    promoções exclusivas e dicas sobre café, clique no botão abaixo:
                </p>

                <div style="text-align: center; margin: 30px 0;">
                    <a href="{verification_link}"
                       style="background-color: #FF6B35; color: white; padding: 15px 40px;
                              text-decoration: none; border-radius: 5px; display: inline-block;
                              font-weight: bold;">
                        Confirmar Inscrição
                    </a>
                </div>

                <p style="color: #999; font-size: 12px;">
                    Se você não se inscreveu, ignore este email.
                </p>

                <p style="color: #999; font-size: 12px;">
                    Ou copie e cole este link no navegador:<br>
                    <a href="{verification_link}" style="color: #FF6B35;">{verification_link}</a>
                </p>
            </div>

            <div style="background-color: #333; color: white; padding: 20px; text-align: center; font-size: 12px;">
                <p>© 2025 Mestres do Café. Todos os direitos reservados.</p>
            </div>
        </body>
        </html>
        """

        plain_body = f"""
        Confirme sua inscrição - Mestres do Café

        Olá! Obrigado por se inscrever na nossa newsletter.

        Para confirmar sua inscrição, acesse o link abaixo:
        {verification_link}

        Se você não se inscreveu, ignore este email.

        ---
        © 2025 Mestres do Café
        """

        # Enviar via notification service
        success = notification_service.email_provider.send_email(
            to_email=email,
            subject=subject,
            html_body=html_body,
            plain_body=plain_body
        )

        if success:
            logger.info(f"Email de verificação enviado para {email}")
        else:
            logger.warning(f"Falha ao enviar email de verificação para {email}")

        return success

    except Exception as e:
        logger.error(f"Erro ao enviar email de verificação: {str(e)}")
        return False


def _send_campaign_async(campaign_id: str):
    """
    Enviar campanha de newsletter em background

    Em produção, usar Celery/RQ para processar de forma assíncrona.
    Por enquanto, processa de forma síncrona com controle de rate.
    """
    try:
        import threading
        from time import sleep

        def send_campaign_worker():
            """Worker para enviar campanha"""
            try:
                from services.notification_service import NotificationService
                from flask import current_app

                # Precisamos de app context para queries do banco
                with current_app.app_context():
                    campaign = NewsletterCampaign.query.get(campaign_id)
                    if not campaign:
                        logger.error(f"Campanha {campaign_id} não encontrada")
                        return

                    # Buscar assinantes ativos
                    subscribers = NewsletterSubscriber.query.filter_by(status='active').all()

                    if not subscribers:
                        campaign.status = 'sent'
                        campaign.total_sent = 0
                        db.session.commit()
                        return

                    notification_service = NotificationService()

                    sent_count = 0
                    failed_count = 0

                    # Enviar para cada assinante (com rate limiting)
                    for subscriber in subscribers:
                        try:
                            # Renderizar template com dados do assinante
                            html_body = campaign.html_content
                            plain_body = campaign.plain_content or "Versão sem HTML não disponível"

                            # Personalizar com nome do assinante se disponível
                            if subscriber.first_name:
                                html_body = html_body.replace('{{name}}', subscriber.first_name)
                                plain_body = plain_body.replace('{{name}}', subscriber.first_name)
                            else:
                                html_body = html_body.replace('{{name}}', 'Cliente')
                                plain_body = plain_body.replace('{{name}}', 'Cliente')

                            # Adicionar link de unsubscribe
                            unsubscribe_link = f"{request.host_url}api/newsletter/unsubscribe?email={subscriber.email}"
                            html_body = html_body.replace('{{unsubscribe_link}}', unsubscribe_link)
                            plain_body += f"\n\nPara cancelar sua inscrição: {unsubscribe_link}"

                            # Enviar email
                            success = notification_service.email_provider.send_email(
                                to_email=subscriber.email,
                                subject=campaign.subject,
                                html_body=html_body,
                                plain_body=plain_body
                            )

                            if success:
                                sent_count += 1
                            else:
                                failed_count += 1

                            # Rate limiting: 10 emails/segundo
                            sleep(0.1)

                        except Exception as e:
                            logger.error(f"Erro ao enviar para {subscriber.email}: {str(e)}")
                            failed_count += 1

                    # Atualizar campanha
                    campaign.status = 'sent'
                    campaign.total_sent = sent_count
                    campaign.total_failed = failed_count
                    db.session.commit()

                    logger.info(f"Campanha {campaign_id} enviada: {sent_count} sucesso, {failed_count} falhas")

            except Exception as e:
                logger.error(f"Erro no worker de campanha {campaign_id}: {str(e)}")

        # Iniciar worker em thread separada
        thread = threading.Thread(target=send_campaign_worker, daemon=True)
        thread.start()

        logger.info(f"Worker de campanha {campaign_id} iniciado")

    except Exception as e:
        logger.error(f"Erro ao iniciar envio de campanha {campaign_id}: {str(e)}")


# Importar logger
import logging
logger = logging.getLogger(__name__)
