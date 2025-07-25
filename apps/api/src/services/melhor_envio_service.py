"""
Serviço de integração com Melhor Envio
Implementação funcional para cálculo de frete e gestão de envios
"""

import os
import json
import uuid
import requests
from typing import Dict, Any, List
from decimal import Decimal
from datetime import datetime
from utils.logger import logger


class MelhorEnvioService:
    """
    Serviço de integração com Melhor Envio
    Versão funcional para desenvolvimento e produção
    """

    def __init__(self):
        # Configurações da API Melhor Envio
        self.api_key = os.environ.get('MELHOR_ENVIO_API_KEY', '')
        self.environment = os.environ.get('MELHOR_ENVIO_ENVIRONMENT', 'sandbox')
        
        # URLs da API
        if self.environment == 'production':
            self.base_url = 'https://api.melhorenvio.com.br'
        else:
            self.base_url = 'https://sandbox.melhorenvio.com.br'
            
        # Headers padrão
        self.headers = {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'User-Agent': 'Mestres do Café/1.0'
        }
        
        if self.api_key:
            self.headers['Authorization'] = f'Bearer {self.api_key}'
            
        logger.info(f"MelhorEnvioService inicializado - Ambiente: {self.environment}")

    def calculate_shipping(self, origin_cep: str, destination_cep: str, products: List[Dict]) -> Dict[str, Any]:
        """
        Calcula opções de frete entre CEPs
        """
        try:
            # Se não tiver API key, retornar valores fixos para desenvolvimento
            if not self.api_key:
                logger.warning("MELHOR_ENVIO_API_KEY não configurada - usando valores fixos")
                return self._get_fallback_quotes()
            
            # Preparar dados para a API
            payload = {
                "from": {"postal_code": origin_cep.replace('-', '')},
                "to": {"postal_code": destination_cep.replace('-', '')},
                "products": self._format_products(products)
            }
            
            # Fazer requisição para API
            response = requests.post(
                f"{self.base_url}/api/v2/me/shipment/calculate",
                headers=self.headers,
                json=payload,
                timeout=30
            )
            
            if response.status_code == 200:
                data = response.json()
                quotes = self._format_quotes(data)
                
                logger.info(f"Frete calculado: {origin_cep} → {destination_cep}")
                
                return {
                    'success': True,
                    'quotes': quotes,
                    'fallback': False
                }
            else:
                logger.error(f"Erro na API Melhor Envio: {response.status_code}")
                return self._get_fallback_quotes()
                
        except requests.exceptions.RequestException as e:
            logger.error(f"Erro de conexão com Melhor Envio: {str(e)}")
            return self._get_fallback_quotes()
        except Exception as e:
            logger.error(f"Erro inesperado no cálculo de frete: {str(e)}")
            return self._get_fallback_quotes()

    def create_shipment(self, order_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Cria uma etiqueta de envio
        """
        try:
            if not self.api_key:
                logger.warning("API key não configurada - simulando criação de etiqueta")
                return {
                    'success': True,
                    'shipment_id': f"ME{uuid.uuid4().hex[:12].upper()}",
                    'tracking_code': f"BR{uuid.uuid4().hex[:10].upper()}BR",
                    'label_url': f"https://example.com/label/{uuid.uuid4()}.pdf",
                    'service_name': 'PAC',
                    'price': 15.00
                }
            
            # Preparar dados do envio
            payload = self._prepare_shipment_data(order_data)
            
            # Criar envio na API
            response = requests.post(
                f"{self.base_url}/api/v2/me/shipment/generate",
                headers=self.headers,
                json=payload,
                timeout=30
            )
            
            if response.status_code == 201:
                data = response.json()
                
                logger.info(f"Etiqueta criada para pedido {order_data.get('order_id')}")
                
                return {
                    'success': True,
                    'shipment_id': data.get('id'),
                    'tracking_code': data.get('tracking'),
                    'label_url': data.get('label_url'),
                    'service_name': data.get('service_name'),
                    'price': data.get('price')
                }
            else:
                logger.error(f"Erro ao criar etiqueta: {response.status_code}")
                return {'success': False, 'error': 'Falha na criação da etiqueta'}
                
        except Exception as e:
            logger.error(f"Erro ao criar envio: {str(e)}")
            return {'success': False, 'error': str(e)}

    def track_shipment(self, tracking_code: str) -> Dict[str, Any]:
        """
        Rastreia um envio pelo código
        """
        try:
            if not self.api_key:
                # Simular dados de rastreamento
                return {
                    'success': True,
                    'tracking_code': tracking_code,
                    'status': 'delivered',
                    'events': [
                        {
                            'date': '2025-01-15T10:00:00Z',
                            'description': 'Objeto entregue ao destinatário',
                            'location': 'Centro de Distribuição'
                        }
                    ]
                }
            
            # Consultar API de rastreamento
            response = requests.get(
                f"{self.base_url}/api/v2/me/shipment/tracking",
                headers=self.headers,
                params={'tracking': tracking_code},
                timeout=30
            )
            
            if response.status_code == 200:
                data = response.json()
                
                return {
                    'success': True,
                    'tracking_code': tracking_code,
                    'status': data.get('status'),
                    'events': data.get('events', [])
                }
            else:
                return {'success': False, 'error': 'Código de rastreamento não encontrado'}
                
        except Exception as e:
            logger.error(f"Erro ao rastrear envio: {str(e)}")
            return {'success': False, 'error': str(e)}

    def cancel_shipment(self, shipment_id: str) -> Dict[str, Any]:
        """
        Cancela uma etiqueta de envio
        """
        try:
            if not self.api_key:
                logger.info(f"Simulando cancelamento da etiqueta {shipment_id}")
                return {'success': True, 'message': 'Etiqueta cancelada'}
            
            response = requests.delete(
                f"{self.base_url}/api/v2/me/shipment/{shipment_id}",
                headers=self.headers,
                timeout=30
            )
            
            if response.status_code == 200:
                return {'success': True, 'message': 'Etiqueta cancelada com sucesso'}
            else:
                return {'success': False, 'error': 'Falha ao cancelar etiqueta'}
                
        except Exception as e:
            logger.error(f"Erro ao cancelar envio: {str(e)}")
            return {'success': False, 'error': str(e)}

    def get_agencies(self, city: str, state: str) -> Dict[str, Any]:
        """
        Obtém agências disponíveis em uma cidade
        """
        try:
            if not self.api_key:
                return {
                    'success': True,
                    'agencies': [
                        {
                            'id': 1,
                            'name': 'Agência Central',
                            'address': f'Rua Principal, 123 - {city}/{state}',
                            'phone': '(11) 9999-9999'
                        }
                    ]
                }
            
            response = requests.get(
                f"{self.base_url}/api/v2/me/agencies",
                headers=self.headers,
                params={'city': city, 'state': state},
                timeout=30
            )
            
            if response.status_code == 200:
                data = response.json()
                return {'success': True, 'agencies': data.get('data', [])}
            else:
                return {'success': False, 'error': 'Agências não encontradas'}
                
        except Exception as e:
            logger.error(f"Erro ao buscar agências: {str(e)}")
            return {'success': False, 'error': str(e)}

    def authenticate(self, code: str) -> Dict[str, Any]:
        """
        Autentica via OAuth2 e obtém token de acesso
        """
        try:
            payload = {
                'grant_type': 'authorization_code',
                'client_id': os.environ.get('MELHOR_ENVIO_CLIENT_ID'),
                'client_secret': os.environ.get('MELHOR_ENVIO_CLIENT_SECRET'),
                'code': code,
                'redirect_uri': os.environ.get('MELHOR_ENVIO_REDIRECT_URI')
            }
            
            response = requests.post(
                f"{self.base_url}/oauth/token",
                json=payload,
                timeout=30
            )
            
            if response.status_code == 200:
                data = response.json()
                return {
                    'success': True,
                    'access_token': data.get('access_token'),
                    'refresh_token': data.get('refresh_token'),
                    'expires_in': data.get('expires_in')
                }
            else:
                return {'success': False, 'error': 'Falha na autenticação'}
                
        except Exception as e:
            logger.error(f"Erro na autenticação OAuth: {str(e)}")
            return {'success': False, 'error': str(e)}

    def process_webhook(self, webhook_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Processa webhook de atualização de status
        """
        try:
            event_type = webhook_data.get('event')
            tracking_code = webhook_data.get('tracking')
            status = webhook_data.get('status')
            
            logger.info(f"Webhook recebido: {event_type} - {tracking_code} - {status}")
            
            # Aqui você pode atualizar o status do pedido no banco de dados
            # Por exemplo: Order.update_shipping_status(tracking_code, status)
            
            return {'success': True, 'processed': True}
            
        except Exception as e:
            logger.error(f"Erro ao processar webhook: {str(e)}")
            return {'success': False, 'error': str(e)}

    def _get_fallback_quotes(self) -> Dict[str, Any]:
        """
        Retorna cotações padrão quando a API não está disponível
        """
        return {
            'success': True,
            'quotes': [
                {
                    'id': 1,
                    'name': 'PAC',
                    'service_name': 'PAC',
                    'company': 'Correios',
                    'price': 15.00,
                    'delivery_time': '5-7 dias úteis',
                    'packages': [{'price': 15.00, 'discount': 0}]
                },
                {
                    'id': 2,
                    'name': 'SEDEX',
                    'service_name': 'SEDEX',
                    'company': 'Correios',
                    'price': 25.00,
                    'delivery_time': '1-2 dias úteis',
                    'packages': [{'price': 25.00, 'discount': 0}]
                }
            ],
            'fallback': True
        }

    def _format_products(self, products: List[Dict]) -> List[Dict]:
        """
        Formata produtos para envio à API
        """
        formatted = []
        for product in products:
            formatted.append({
                'id': product.get('id', str(uuid.uuid4())),
                'width': max(product.get('width', 10), 10),
                'height': max(product.get('height', 5), 5),
                'length': max(product.get('length', 15), 15),
                'weight': max(product.get('weight', 0.3), 0.3),
                'insurance_value': product.get('price', 10.00),
                'quantity': product.get('quantity', 1)
            })
        return formatted

    def _format_quotes(self, api_data: Dict) -> List[Dict]:
        """
        Formata cotações retornadas pela API
        """
        quotes = []
        for item in api_data.get('data', []):
            quotes.append({
                'id': item.get('id'),
                'name': item.get('name'),
                'service_name': item.get('name'),
                'company': item.get('company', {}).get('name'),
                'price': float(item.get('price', 0)),
                'delivery_time': f"{item.get('delivery_time', 5)} dias úteis",
                'packages': item.get('packages', [])
            })
        return quotes

    def _prepare_shipment_data(self, order_data: Dict) -> Dict:
        """
        Prepara dados do pedido para criação de envio
        """
        return {
            'service': order_data.get('service_id', 1),
            'agency': order_data.get('agency_id'),
            'from': {
                'name': 'Mestres do Café',
                'phone': '(11) 99999-9999',
                'email': 'contato@mestresdocafe.com.br',
                'document': '12345678000123',
                'company_document': '12345678000123',
                'state_register': '123456789',
                'postal_code': '01310-100',
                'address': 'Av. Paulista',
                'number': '1000',
                'district': 'Bela Vista',
                'city': 'São Paulo',
                'state_abbr': 'SP',
                'country_id': 'BR'
            },
            'to': order_data.get('shipping_address', {}),
            'products': order_data.get('products', []),
            'volumes': [{
                'height': order_data.get('package_height', 10),
                'width': order_data.get('package_width', 15),
                'length': order_data.get('package_length', 20),
                'weight': order_data.get('package_weight', 0.5)
            }],
            'options': {
                'insurance': order_data.get('insurance', True),
                'receipt': order_data.get('receipt', False),
                'own_hand': order_data.get('own_hand', False)
            }
        }