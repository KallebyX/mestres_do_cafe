"""
Serviço de integração com Melhor Envio - Sistema Completo
"""

import os
import json
import hmac
import hashlib
from datetime import datetime, timedelta
from typing import Any, Dict, List, Optional
from decimal import Decimal

import requests
from flask import current_app

from ..database import db
from ..models.orders import Order
from ..models.vendors import Vendor
from ..utils.logger import logger


class MelhorEnvioService:
    """Serviço completo para integração com a API do Melhor Envio"""
    
    def __init__(self):
        self.environment = os.getenv('MELHOR_ENVIO_ENVIRONMENT', 'sandbox')
        
        if self.environment == 'sandbox':
            self.base_url = "https://sandbox.melhorenvio.com.br/api/v2"
        else:
            self.base_url = "https://melhorenvio.com.br/api/v2"
        
        self.token = os.getenv('MELHOR_ENVIO_TOKEN')
        self.client_id = os.getenv('MELHOR_ENVIO_CLIENT_ID')
        self.client_secret = os.getenv('MELHOR_ENVIO_CLIENT_SECRET')
        self.redirect_uri = os.getenv('MELHOR_ENVIO_REDIRECT_URI')
        self.webhook_url = os.getenv('MELHOR_ENVIO_WEBHOOK_URL')
        
        # Configurações da empresa
        self.company_info = {
            'name': 'Mestres do Café',
            'phone': '(55) 3220-1234',
            'email': 'contato@mestresdocafe.com.br',
            'document': '12.345.678/0001-90',
            'company_document': '12.345.678/0001-90',
            'state_register': '123456789',
            'address': 'Rua das Flores, 123',
            'complement': 'Sala 101',
            'number': '123',
            'district': 'Centro',
            'city': 'Santa Maria',
            'state_abbr': 'RS',
            'country_id': 'BR',
            'postal_code': '97010-000'
        }
    
    def get_auth_headers(self) -> Dict[str, str]:
        """Retorna headers de autenticação"""
        if not self.token or self.token == 'YOUR_TOKEN_HERE':
            logger.warning("Melhor Envio token not configured properly")
            return {}
        
        return {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': f'Bearer {self.token}',
            'User-Agent': 'Mestres do Café (contato@mestresdocafe.com.br)'
        }
    
    def authenticate(self, code: str) -> Dict[str, Any]:
        """
        Realiza autenticação OAuth2 com código de autorização
        
        Args:
            code: Código de autorização recebido do callback
            
        Returns:
            Dict com dados da autenticação
        """
        try:
            url = f"{self.base_url}/oauth/token"
            
            data = {
                'grant_type': 'authorization_code',
                'client_id': self.client_id,
                'client_secret': self.client_secret,
                'redirect_uri': self.redirect_uri,
                'code': code
            }
            
            response = requests.post(url, json=data)
            
            if response.status_code == 200:
                auth_data = response.json()
                logger.info("Melhor Envio authentication successful")
                return {
                    'success': True,
                    'access_token': auth_data.get('access_token'),
                    'refresh_token': auth_data.get('refresh_token'),
                    'expires_in': auth_data.get('expires_in')
                }
            else:
                logger.error(f"Authentication failed: {response.text}")
                return {
                    'success': False,
                    'error': 'Authentication failed',
                    'details': response.text
                }
                
        except Exception as e:
            logger.error(f"Error in authentication: {str(e)}")
            return {'success': False, 'error': str(e)}
    
    def calculate_shipping(self, origin_cep: str, destination_cep: str, products: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Calcula opções de frete
        
        Args:
            origin_cep: CEP de origem
            destination_cep: CEP de destino  
            products: Lista de produtos com peso e dimensões
            
        Returns:
            Dict com opções de frete
        """
        try:
            headers = self.get_auth_headers()
            
            if not headers:
                return self._get_mock_shipping_quotes(destination_cep, products)
            
            # Preparar dados dos produtos
            package_data = self._prepare_package_data(products)
            
            # Dados para a API
            payload = {
                "from": {"postal_code": origin_cep.replace('-', '')},
                "to": {"postal_code": destination_cep.replace('-', '')},
                "products": [{
                    "id": "1",
                    "width": package_data['width'],
                    "height": package_data['height'],
                    "length": package_data['length'],
                    "weight": package_data['weight'],
                    "insurance_value": package_data['insurance_value'],
                    "quantity": 1
                }],
                "options": {
                    "insurance": True,
                    "receipt": False,
                    "own_hand": False
                },
                "services": "1,2,3,4,17"  # PAC, SEDEX, etc.
            }
            
            url = f"{self.base_url}/me/shipment/calculate"
            response = requests.post(url, json=payload, headers=headers)
            
            if response.status_code == 200:
                data = response.json()
                return {
                    'success': True,
                    'quotes': self._format_shipping_quotes(data)
                }
            else:
                logger.error(f"Shipping calculation failed: {response.text}")
                # Fallback para cotações simuladas
                return {
                    'success': True,
                    'quotes': self._get_mock_shipping_quotes(destination_cep, products)['quotes'],
                    'fallback': True
                }
                
        except Exception as e:
            logger.error(f"Error calculating shipping: {str(e)}")
            return {
                'success': True,
                'quotes': self._get_mock_shipping_quotes(destination_cep, products)['quotes'],
                'fallback': True
            }
    
    def create_shipment(self, order_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Cria uma etiqueta de envio
        
        Args:
            order_data: Dados do pedido
            
        Returns:
            Dict com dados da etiqueta criada
        """
        try:
            headers = self.get_auth_headers()
            
            if not headers:
                return {'success': False, 'error': 'Melhor Envio not configured'}
            
            # Preparar dados do envio
            shipment_data = {
                "service": order_data.get('service_id', 1),  # PAC por padrão
                "agency": order_data.get('agency_id'),
                "from": {
                    "name": self.company_info['name'],
                    "phone": self.company_info['phone'],
                    "email": self.company_info['email'],
                    "document": self.company_info['document'],
                    "company_document": self.company_info['company_document'],
                    "state_register": self.company_info['state_register'],
                    "address": self.company_info['address'],
                    "complement": self.company_info['complement'],
                    "number": self.company_info['number'],
                    "district": self.company_info['district'],
                    "city": self.company_info['city'],
                    "state_abbr": self.company_info['state_abbr'],
                    "country_id": self.company_info['country_id'],
                    "postal_code": self.company_info['postal_code']
                },
                "to": {
                    "name": order_data['customer_name'],
                    "phone": order_data.get('customer_phone', ''),
                    "email": order_data.get('customer_email', ''),
                    "document": order_data.get('customer_document', ''),
                    "address": order_data['shipping_address']['street'],
                    "complement": order_data['shipping_address'].get('complement', ''),
                    "number": order_data['shipping_address']['number'],
                    "district": order_data['shipping_address']['district'],
                    "city": order_data['shipping_address']['city'],
                    "state_abbr": order_data['shipping_address']['state'],
                    "country_id": "BR",
                    "postal_code": order_data['shipping_address']['postal_code'].replace('-', '')
                },
                "products": self._prepare_products_for_shipment(order_data['products']),
                "volumes": [{
                    "height": order_data.get('package_height', 10),
                    "width": order_data.get('package_width', 15),
                    "length": order_data.get('package_length', 20),
                    "weight": order_data.get('package_weight', 0.5)
                }],
                "options": {
                    "insurance": order_data.get('insurance', True),
                    "receipt": order_data.get('receipt', False),
                    "own_hand": order_data.get('own_hand', False),
                    "reverse": False,
                    "non_commercial": False,
                    "invoice": {
                        "key": order_data.get('invoice_key', ''),
                        "number": order_data.get('invoice_number', '')
                    },
                    "platform": "Mestres do Café",
                    "tags": [
                        {
                            "tag": f"Pedido #{order_data.get('order_number', '')}",
                            "url": f"https://mestresdocafe.com.br/orders/{order_data.get('order_id', '')}"
                        }
                    ]
                }
            }
            
            url = f"{self.base_url}/me/cart"
            response = requests.post(url, json=shipment_data, headers=headers)
            
            if response.status_code == 201:
                cart_data = response.json()
                cart_id = cart_data.get('id')
                
                # Gerar etiqueta
                label_result = self._generate_label(cart_id)
                
                if label_result['success']:
                    logger.info(f"Shipment created successfully: {cart_id}")
                    return {
                        'success': True,
                        'shipment_id': cart_id,
                        'tracking_code': cart_data.get('protocol'),
                        'label_url': label_result.get('label_url'),
                        'service_name': cart_data.get('service_name'),
                        'price': cart_data.get('price')
                    }
                else:
                    return label_result
            else:
                logger.error(f"Failed to create shipment: {response.text}")
                return {
                    'success': False,
                    'error': 'Failed to create shipment',
                    'details': response.text
                }
                
        except Exception as e:
            logger.error(f"Error creating shipment: {str(e)}")
            return {'success': False, 'error': str(e)}
    
    def _generate_label(self, cart_id: str) -> Dict[str, Any]:
        """Gera etiqueta para o envio"""
        try:
            headers = self.get_auth_headers()
            
            # Checkout do carrinho
            checkout_url = f"{self.base_url}/me/cart/{cart_id}/checkout"
            checkout_response = requests.post(checkout_url, headers=headers)
            
            if checkout_response.status_code != 200:
                return {
                    'success': False,
                    'error': 'Failed to checkout cart',
                    'details': checkout_response.text
                }
            
            # Gerar etiqueta
            label_url = f"{self.base_url}/me/cart/{cart_id}/generate"
            label_response = requests.post(label_url, headers=headers)
            
            if label_response.status_code == 200:
                label_data = label_response.json()
                return {
                    'success': True,
                    'label_url': label_data.get('url')
                }
            else:
                return {
                    'success': False,
                    'error': 'Failed to generate label',
                    'details': label_response.text
                }
                
        except Exception as e:
            return {'success': False, 'error': str(e)}
    
    def track_shipment(self, tracking_code: str) -> Dict[str, Any]:
        """
        Rastreia uma entrega
        
        Args:
            tracking_code: Código de rastreamento
            
        Returns:
            Dict com dados do rastreamento
        """
        try:
            headers = self.get_auth_headers()
            
            if not headers:
                return self._get_mock_tracking_data(tracking_code)
            
            url = f"{self.base_url}/me/shipment/tracking"
            params = {'orders': tracking_code}
            
            response = requests.get(url, params=params, headers=headers)
            
            if response.status_code == 200:
                data = response.json()
                tracking_data = data.get(tracking_code, {})
                
                return {
                    'success': True,
                    'tracking_code': tracking_code,
                    'status': tracking_data.get('status'),
                    'status_description': tracking_data.get('status_description'),
                    'events': self._format_tracking_events(tracking_data.get('tracking', [])),
                    'estimated_delivery': tracking_data.get('estimated_delivery'),
                    'delivered_at': tracking_data.get('delivered_at')
                }
            else:
                logger.error(f"Tracking failed: {response.text}")
                return self._get_mock_tracking_data(tracking_code)
                
        except Exception as e:
            logger.error(f"Error tracking shipment: {str(e)}")
            return self._get_mock_tracking_data(tracking_code)
    
    def cancel_shipment(self, shipment_id: str) -> Dict[str, Any]:
        """
        Cancela um envio
        
        Args:
            shipment_id: ID do envio
            
        Returns:
            Dict com resultado do cancelamento
        """
        try:
            headers = self.get_auth_headers()
            
            if not headers:
                return {'success': False, 'error': 'Melhor Envio not configured'}
            
            url = f"{self.base_url}/me/cart/{shipment_id}/cancel"
            response = requests.post(url, headers=headers)
            
            if response.status_code == 200:
                logger.info(f"Shipment {shipment_id} cancelled successfully")
                return {'success': True, 'message': 'Shipment cancelled'}
            else:
                logger.error(f"Failed to cancel shipment: {response.text}")
                return {
                    'success': False,
                    'error': 'Failed to cancel shipment',
                    'details': response.text
                }
                
        except Exception as e:
            logger.error(f"Error cancelling shipment: {str(e)}")
            return {'success': False, 'error': str(e)}
    
    def get_agencies(self, city: str, state: str) -> Dict[str, Any]:
        """
        Obtém agências disponíveis
        
        Args:
            city: Cidade
            state: Estado
            
        Returns:
            Dict com agências disponíveis
        """
        try:
            headers = self.get_auth_headers()
            
            if not headers:
                return {'success': False, 'error': 'Melhor Envio not configured'}
            
            url = f"{self.base_url}/me/shipment/agencies"
            params = {
                'city': city,
                'state': state,
                'country': 'BR'
            }
            
            response = requests.get(url, params=params, headers=headers)
            
            if response.status_code == 200:
                agencies = response.json()
                return {
                    'success': True,
                    'agencies': agencies
                }
            else:
                return {
                    'success': False,
                    'error': 'Failed to get agencies',
                    'details': response.text
                }
                
        except Exception as e:
            logger.error(f"Error getting agencies: {str(e)}")
            return {'success': False, 'error': str(e)}
    
    def process_webhook(self, webhook_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Processa webhook do Melhor Envio
        
        Args:
            webhook_data: Dados do webhook
            
        Returns:
            Dict com resultado do processamento
        """
        try:
            event_type = webhook_data.get('type')
            shipment_data = webhook_data.get('shipment', {})
            tracking_code = shipment_data.get('protocol')
            
            if not tracking_code:
                return {'success': False, 'error': 'No tracking code in webhook'}
            
            # Buscar pedido pelo tracking code
            order = db.session.query(Order).filter(
                Order.tracking_code == tracking_code
            ).first()
            
            if not order:
                logger.warning(f"Order not found for tracking code: {tracking_code}")
                return {'success': False, 'error': 'Order not found'}
            
            # Atualizar status do pedido
            old_status = order.status
            
            if event_type == 'tracking':
                new_status = self._map_tracking_status(shipment_data.get('status'))
                order.status = new_status
                
                # Se entregue, atualizar data de entrega
                if new_status == 'delivered':
                    order.delivered_at = datetime.utcnow()
                    
                    # Integrar com sistema de escrow
                    self._trigger_escrow_release(order)
            
            db.session.commit()
            
            logger.info(f"Order {order.id} status updated from {old_status} to {order.status}")
            
            return {
                'success': True,
                'order_id': str(order.id),
                'old_status': old_status,
                'new_status': order.status
            }
            
        except Exception as e:
            logger.error(f"Error processing webhook: {str(e)}")
            return {'success': False, 'error': str(e)}
    
    def _trigger_escrow_release(self, order: Order) -> None:
        """Dispara liberação do escrow quando pedido é entregue"""
        try:
            from .escrow_service import EscrowService
            
            # Buscar pagamentos do pedido que estão em escrow
            payments = [p for p in order.payments if p.status == 'held']
            
            escrow_service = EscrowService()
            
            for payment in payments:
                # Aguardar 7 dias após entrega para liberação automática
                payment.release_eligible_at = datetime.utcnow() + timedelta(days=7)
                
            db.session.commit()
            
            logger.info(f"Escrow release scheduled for order {order.id}")
            
        except Exception as e:
            logger.error(f"Error triggering escrow release: {str(e)}")
    
    def _prepare_package_data(self, products: List[Dict[str, Any]]) -> Dict[str, float]:
        """Prepara dados do pacote baseado nos produtos"""
        total_weight = 0
        total_width = 0
        total_height = 0
        total_length = 0
        total_value = 0
        
        for product in products:
            quantity = product.get('quantity', 1)
            total_weight += product.get('weight', 0.5) * quantity
            total_width = max(total_width, product.get('width', 10))
            total_height += product.get('height', 10) * quantity
            total_length = max(total_length, product.get('length', 10))
            total_value += product.get('price', 0) * quantity
        
        # Garantir dimensões mínimas
        return {
            'weight': max(total_weight, 0.3),
            'width': max(total_width, 11),
            'height': max(total_height, 2),
            'length': max(total_length, 16),
            'insurance_value': min(total_value, 3000)  # Máximo R$ 3000
        }
    
    def _prepare_products_for_shipment(self, products: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Prepara lista de produtos para envio"""
        shipment_products = []
        
        for product in products:
            shipment_products.append({
                "name": product.get('name', 'Produto'),
                "quantity": product.get('quantity', 1),
                "unitary_value": product.get('price', 0)
            })
        
        return shipment_products
    
    def _format_shipping_quotes(self, api_data: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Formata cotações da API"""
        quotes = []
        
        for quote in api_data:
            if quote.get('error'):
                continue
                
            quotes.append({
                'carrier_name': quote.get('company', {}).get('name', 'Transportadora'),
                'service_name': quote.get('name', 'Serviço'),
                'service_code': str(quote.get('id', '')),
                'price': float(quote.get('price', 0)),
                'delivery_time': quote.get('delivery_time', 0),
                'description': quote.get('description', ''),
                'insurance_included': True,
                'additional_services': quote.get('additional_services', {}),
                'packages': quote.get('packages', [])
            })
        
        return quotes
    
    def _format_tracking_events(self, events: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Formata eventos de rastreamento"""
        formatted_events = []
        
        for event in events:
            formatted_events.append({
                'date': event.get('date'),
                'description': event.get('description'),
                'location': event.get('location'),
                'status': event.get('status')
            })
        
        return formatted_events
    
    def _map_tracking_status(self, me_status: str) -> str:
        """Mapeia status do Melhor Envio para status interno"""
        status_mapping = {
            'posted': 'shipped',
            'delivered': 'delivered',
            'cancelled': 'cancelled',
            'returned': 'returned',
            'pending': 'processing'
        }
        
        return status_mapping.get(me_status, 'processing')
    
    def _get_mock_shipping_quotes(self, destination_cep: str, products: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Retorna cotações simuladas para desenvolvimento"""
        package_data = self._prepare_package_data(products)
        
        # Calcular preços baseados na região
        state = self._get_state_from_cep(destination_cep)
        base_price = self._get_base_price_by_state(state)
        
        # Ajustar preço pelo peso
        weight_multiplier = max(1.0, package_data['weight'] / 1.0)
        
        quotes = [
            {
                'carrier_name': 'Correios',
                'service_name': 'PAC',
                'service_code': '1',
                'price': round(base_price * 0.8 * weight_multiplier, 2),
                'delivery_time': 7 + (1 if state not in ['SP', 'RJ', 'MG'] else 0),
                'description': 'Entrega padrão dos Correios',
                'insurance_included': True
            },
            {
                'carrier_name': 'Correios',
                'service_name': 'SEDEX',
                'service_code': '2',
                'price': round(base_price * 1.5 * weight_multiplier, 2),
                'delivery_time': 3 + (1 if state not in ['SP', 'RJ', 'MG'] else 0),
                'description': 'Entrega expressa dos Correios',
                'insurance_included': True
            },
            {
                'carrier_name': 'Jadlog',
                'service_name': 'Econômico',
                'service_code': '17',
                'price': round(base_price * 0.6 * weight_multiplier, 2),
                'delivery_time': 10 + (2 if state not in ['SP', 'RJ', 'MG'] else 0),
                'description': 'Entrega econômica via Jadlog',
                'insurance_included': False
            }
        ]
        
        return {'success': True, 'quotes': quotes}
    
    def _get_mock_tracking_data(self, tracking_code: str) -> Dict[str, Any]:
        """Retorna dados de rastreamento simulados"""
        return {
            'success': True,
            'tracking_code': tracking_code,
            'status': 'in_transit',
            'status_description': 'Objeto em trânsito',
            'events': [
                {
                    'date': (datetime.now() - timedelta(days=2)).isoformat(),
                    'description': 'Objeto postado',
                    'location': 'Santa Maria - RS',
                    'status': 'posted'
                },
                {
                    'date': (datetime.now() - timedelta(days=1)).isoformat(),
                    'description': 'Objeto em trânsito',
                    'location': 'Porto Alegre - RS',
                    'status': 'in_transit'
                }
            ],
            'estimated_delivery': (datetime.now() + timedelta(days=3)).isoformat(),
            'delivered_at': None
        }
    
    def _get_state_from_cep(self, cep: str) -> str:
        """Determina o estado baseado no CEP"""
        cep_clean = cep.replace('-', '').replace(' ', '')
        
        if not cep_clean or len(cep_clean) < 5:
            return 'RS'  # Padrão para Santa Maria - RS
        
        # Mapeamento de CEP para estado (simplificado)
        cep_prefix = cep_clean[:2]
        
        cep_states = {
            '01': 'SP', '02': 'SP', '03': 'SP', '04': 'SP', '05': 'SP',
            '06': 'SP', '07': 'SP', '08': 'SP', '09': 'SP', '10': 'SP',
            '11': 'SP', '12': 'SP', '13': 'SP', '14': 'SP', '15': 'SP',
            '16': 'SP', '17': 'SP', '18': 'SP', '19': 'SP',
            '20': 'RJ', '21': 'RJ', '22': 'RJ', '23': 'RJ', '24': 'RJ',
            '25': 'RJ', '26': 'RJ', '27': 'RJ', '28': 'RJ',
            '30': 'MG', '31': 'MG', '32': 'MG', '33': 'MG', '34': 'MG',
            '35': 'MG', '36': 'MG', '37': 'MG', '38': 'MG', '39': 'MG',
            '40': 'BA', '41': 'BA', '42': 'BA', '43': 'BA', '44': 'BA',
            '45': 'BA', '46': 'BA', '47': 'BA', '48': 'BA',
            '50': 'PE', '51': 'PE', '52': 'PE', '53': 'PE', '54': 'PE',
            '55': 'PE', '56': 'PE',
            '60': 'CE', '61': 'CE', '62': 'CE', '63': 'CE',
            '70': 'DF', '71': 'DF', '72': 'DF', '73': 'DF',
            '90': 'RS', '91': 'RS', '92': 'RS', '93': 'RS', '94': 'RS',
            '95': 'RS', '96': 'RS', '97': 'RS', '98': 'RS', '99': 'RS'
        }
        
        return cep_states.get(cep_prefix, 'RS')
    
    def _get_base_price_by_state(self, state: str) -> float:
        """Retorna preço base por estado"""
        prices = {
            'RS': 15.00,  # Local
            'SC': 18.00,
            'PR': 20.00,
            'SP': 22.00,
            'RJ': 25.00,
            'MG': 23.00,
            'ES': 25.00,
            'BA': 30.00,
            'PE': 35.00,
            'CE': 38.00,
            'DF': 28.00,
            'GO': 30.00,
            'MT': 40.00,
            'MS': 35.00,
            'TO': 45.00,
            'MA': 40.00,
            'PI': 42.00,
            'RN': 40.00,
            'PB': 40.00,
            'AL': 40.00,
            'SE': 38.00,
            'RO': 50.00,
            'AC': 55.00,
            'AM': 50.00,
            'RR': 60.00,
            'PA': 45.00,
            'AP': 55.00
        }
        
        return prices.get(state, 35.00)