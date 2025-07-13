"""
Rotas da API para integração com Melhor Envio
"""
from flask import Blueprint, request, jsonify
from ...services.melhor_envio_service import MelhorEnvioService
from ...models.melhor_envio import MelhorEnvioConfig, EnvioMelhorEnvio
from ...database import db
from datetime import datetime, timedelta
import os

melhor_envio_bp = Blueprint('melhor_envio', __name__)

@melhor_envio_bp.route('/config', methods=['GET'])
def get_config():
    """Obtém configuração atual do Melhor Envio"""
    try:
        config = MelhorEnvioConfig.query.first()
        if config:
            return jsonify({
                'success': True,
                'data': {
                    'environment': config.environment,
                    'has_credentials': bool(config.client_id and config.client_secret),
                    'has_token': bool(config.access_token),
                    'token_expires_at': config.token_expires_at.isoformat() if config.token_expires_at else None
                }
            })
        else:
            return jsonify({
                'success': True,
                'data': {
                    'environment': 'sandbox',
                    'has_credentials': False,
                    'has_token': False,
                    'token_expires_at': None
                }
            })
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@melhor_envio_bp.route('/config', methods=['POST'])
def save_config():
    """Salva configuração do Melhor Envio"""
    try:
        data = request.get_json()
        
        config = MelhorEnvioConfig.query.first()
        if not config:
            config = MelhorEnvioConfig()
            db.session.add(config)
        
        config.client_id = data.get('client_id')
        config.client_secret = data.get('client_secret')
        config.environment = data.get('environment', 'sandbox')
        config.updated_at = datetime.utcnow()
        
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Configuração salva com sucesso'
        })
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'error': str(e)}), 500

@melhor_envio_bp.route('/auth-url', methods=['GET'])
def get_auth_url():
    """Gera URL de autorização OAuth2"""
    try:
        config = MelhorEnvioConfig.query.first()
        if not config or not config.client_id:
            return jsonify({
                'success': False,
                'error': 'Configuração não encontrada. Configure client_id primeiro.'
            }), 400
        
        # URL base conforme ambiente
        base_url = 'https://www.melhorenvio.com.br' if config.environment == 'production' else 'https://sandbox.melhorenvio.com.br'
        
        # URL de callback (ajustar conforme necessário)
        redirect_uri = request.args.get('redirect_uri', 'http://localhost:5001/callback')
        
        # Scopes necessários
        scopes = 'shipping-calculate shipping-checkout shipping-generate shipping-tracking ecommerce-shipping'
        
        auth_url = f"{base_url}/oauth/authorize?client_id={config.client_id}&redirect_uri={redirect_uri}&response_type=code&scope={scopes}&state=mestres_cafe"
        
        return jsonify({
            'success': True,
            'auth_url': auth_url
        })
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@melhor_envio_bp.route('/callback', methods=['GET'])
def oauth_callback():
    """Callback OAuth2 - troca código por token"""
    try:
        code = request.args.get('code')
        state = request.args.get('state')
        
        if not code:
            return jsonify({
                'success': False,
                'error': 'Código de autorização não fornecido'
            }), 400
        
        config = MelhorEnvioConfig.query.first()
        if not config:
            return jsonify({
                'success': False,
                'error': 'Configuração não encontrada'
            }), 400
        
        # Trocar código por token
        import requests
        
        base_url = 'https://www.melhorenvio.com.br' if config.environment == 'production' else 'https://sandbox.melhorenvio.com.br'
        
        token_data = {
            'grant_type': 'authorization_code',
            'client_id': config.client_id,
            'client_secret': config.client_secret,
            'redirect_uri': request.args.get('redirect_uri', 'http://localhost:5001/callback'),
            'code': code
        }
        
        response = requests.post(f'{base_url}/oauth/token', json=token_data)
        
        if response.status_code == 200:
            token_response = response.json()
            
            # Salvar tokens
            config.access_token = token_response['access_token']
            config.refresh_token = token_response.get('refresh_token')
            config.token_expires_at = datetime.utcnow() + timedelta(seconds=token_response['expires_in'])
            config.updated_at = datetime.utcnow()
            
            db.session.commit()
            
            return jsonify({
                'success': True,
                'message': 'Autorização realizada com sucesso!',
                'expires_in': token_response['expires_in']
            })
        else:
            return jsonify({
                'success': False,
                'error': f'Erro ao obter token: {response.text}'
            }), 400
            
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@melhor_envio_bp.route('/calcular-frete', methods=['POST'])
def calcular_frete():
    """Calcula frete usando API do Melhor Envio"""
    try:
        data = request.get_json()
        
        # Validar dados obrigatórios
        required_fields = ['cep_origem', 'cep_destino', 'produtos']
        for field in required_fields:
            if field not in data:
                return jsonify({
                    'success': False,
                    'error': f'Campo obrigatório: {field}'
                }), 400
        
        service = MelhorEnvioService()
        resultado = service.calcular_frete(
            cep_origem=data['cep_origem'],
            cep_destino=data['cep_destino'],
            produtos=data['produtos']
        )
        
        if resultado:
            return jsonify({
                'success': True,
                'data': resultado
            })
        else:
            return jsonify({
                'success': False,
                'error': 'Erro ao calcular frete'
            }), 500
            
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@melhor_envio_bp.route('/carrinho', methods=['GET'])
def listar_carrinho():
    """Lista itens no carrinho do Melhor Envio"""
    try:
        service = MelhorEnvioService()
        carrinho = service.listar_carrinho()
        
        if carrinho is not None:
            return jsonify({
                'success': True,
                'data': carrinho
            })
        else:
            return jsonify({
                'success': False,
                'error': 'Erro ao listar carrinho'
            }), 500
            
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@melhor_envio_bp.route('/carrinho', methods=['POST'])
def adicionar_carrinho():
    """Adiciona item ao carrinho do Melhor Envio"""
    try:
        data = request.get_json()
        
        service = MelhorEnvioService()
        item_id = service.adicionar_ao_carrinho(data)
        
        if item_id:
            return jsonify({
                'success': True,
                'data': {'item_id': item_id}
            })
        else:
            return jsonify({
                'success': False,
                'error': 'Erro ao adicionar item ao carrinho'
            }), 500
            
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@melhor_envio_bp.route('/carrinho/<item_id>', methods=['DELETE'])
def remover_carrinho(item_id):
    """Remove item do carrinho do Melhor Envio"""
    try:
        service = MelhorEnvioService()
        sucesso = service.remover_do_carrinho(item_id)
        
        if sucesso:
            return jsonify({
                'success': True,
                'message': 'Item removido do carrinho'
            })
        else:
            return jsonify({
                'success': False,
                'error': 'Erro ao remover item do carrinho'
            }), 500
            
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@melhor_envio_bp.route('/checkout', methods=['POST'])
def fazer_checkout():
    """Realiza checkout dos itens do carrinho"""
    try:
        data = request.get_json()
        order_ids = data.get('order_ids', [])
        
        if not order_ids:
            return jsonify({
                'success': False,
                'error': 'Lista de order_ids é obrigatória'
            }), 400
        
        service = MelhorEnvioService()
        resultado = service.fazer_checkout(order_ids)
        
        if resultado:
            return jsonify({
                'success': True,
                'data': resultado
            })
        else:
            return jsonify({
                'success': False,
                'error': 'Erro ao realizar checkout'
            }), 500
            
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@melhor_envio_bp.route('/etiquetas', methods=['POST'])
def gerar_etiquetas():
    """Gera etiquetas em PDF"""
    try:
        data = request.get_json()
        order_ids = data.get('order_ids', [])
        
        if not order_ids:
            return jsonify({
                'success': False,
                'error': 'Lista de order_ids é obrigatória'
            }), 400
        
        service = MelhorEnvioService()
        url_pdf = service.gerar_etiquetas(order_ids)
        
        if url_pdf:
            return jsonify({
                'success': True,
                'data': {'pdf_url': url_pdf}
            })
        else:
            return jsonify({
                'success': False,
                'error': 'Erro ao gerar etiquetas'
            }), 500
            
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@melhor_envio_bp.route('/rastreamento', methods=['POST'])
def rastrear_envios():
    """Rastreia envios"""
    try:
        data = request.get_json()
        order_ids = data.get('order_ids', [])
        
        if not order_ids:
            return jsonify({
                'success': False,
                'error': 'Lista de order_ids é obrigatória'
            }), 400
        
        service = MelhorEnvioService()
        resultado = service.rastrear_envios(order_ids)
        
        if resultado:
            return jsonify({
                'success': True,
                'data': resultado
            })
        else:
            return jsonify({
                'success': False,
                'error': 'Erro ao rastrear envios'
            }), 500
            
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@melhor_envio_bp.route('/envios', methods=['GET'])
def listar_envios():
    """Lista envios cadastrados no sistema"""
    try:
        envios = EnvioMelhorEnvio.query.order_by(EnvioMelhorEnvio.created_at.desc()).all()
        
        resultado = []
        for envio in envios:
            resultado.append({
                'id': envio.id,
                'order_id': envio.order_id,
                'melhor_envio_id': envio.melhor_envio_id,
                'protocol': envio.protocol,
                'service_name': envio.service_name,
                'transportadora': envio.transportadora,
                'preco': envio.preco,
                'prazo_entrega': envio.prazo_entrega,
                'codigo_rastreamento': envio.codigo_rastreamento,
                'status': envio.status,
                'created_at': envio.created_at.isoformat(),
                'updated_at': envio.updated_at.isoformat()
            })
        
        return jsonify({
            'success': True,
            'data': resultado
        })
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@melhor_envio_bp.route('/envios/<int:envio_id>/rastreamento', methods=['GET'])
def obter_rastreamento_envio(envio_id):
    """Obtém rastreamento de um envio específico"""
    try:
        envio = EnvioMelhorEnvio.query.get_or_404(envio_id)
        
        # Atualizar rastreamento
        service = MelhorEnvioService()
        service.atualizar_rastreamento(envio_id)
        
        # Buscar rastreamentos atualizados
        rastreamentos = []
        for tracking in envio.rastreamentos:
            rastreamentos.append({
                'status': tracking.status,
                'descricao': tracking.descricao,
                'localizacao': tracking.localizacao,
                'data_evento': tracking.data_evento.isoformat() if tracking.data_evento else None,
                'created_at': tracking.created_at.isoformat()
            })
        
        return jsonify({
            'success': True,
            'data': {
                'envio': {
                    'id': envio.id,
                    'protocol': envio.protocol,
                    'service_name': envio.service_name,
                    'transportadora': envio.transportadora,
                    'status': envio.status,
                    'codigo_rastreamento': envio.codigo_rastreamento
                },
                'rastreamentos': rastreamentos
            }
        })
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

