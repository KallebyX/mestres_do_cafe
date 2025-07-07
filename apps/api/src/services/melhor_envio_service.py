"""
Serviço de integração com Melhor Envio - Mestres do Café Enterprise
"""

import json
from datetime import datetime, timedelta
from typing import Any, Dict, List

import requests


class MelhorEnvioService:
    """Serviço para integração com a API do Melhor Envio"""
    
    def __init__(self):
        self.base_url = "https://sandbox.melhorenvio.com.br/api/v2"  # Sandbox
        # self.base_url = "https://melhorenvio.com.br/api/v2"  # Produção
        self.token = None  # Token será configurado via environment
        self.default_from_cep = "01310-100"  # CEP origem padrão
    
    def calculate_shipping(self, origin_cep: str, destination_cep: str, products: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """
        Calcula opções de frete
        
        Args:
            origin_cep: CEP de origem
            destination_cep: CEP de destino  
            products: Lista de produtos com peso e dimensões
            
        Returns:
            Lista de opções de frete
        """
        try:
            # Preparar dados dos produtos
            total_weight = 0
            total_width = 0
            total_height = 0
            total_length = 0
            
            for product in products:
                quantity = product.get('quantity', 1)
                total_weight += product.get('weight', 0.5) * quantity
                total_width = max(total_width, product.get('width', 10))
                total_height += product.get('height', 10) * quantity
                total_length = max(total_length, product.get('length', 10))
            
            # Garantir dimensões mínimas
            total_weight = max(total_weight, 0.3)  # Peso mínimo 300g
            total_width = max(total_width, 11)     # Largura mínima 11cm
            total_height = max(total_height, 2)    # Altura mínima 2cm
            total_length = max(total_length, 16)   # Comprimento mínimo 16cm
            
            # Dados para a API
            payload = {
                "from": {
                    "postal_code": origin_cep.replace('-', '')
                },
                "to": {
                    "postal_code": destination_cep.replace('-', '')
                },
                "products": [
                    {
                        "id": "1",
                        "width": total_width,
                        "height": total_height,
                        "length": total_length,
                        "weight": total_weight,
                        "insurance_value": 50.00,
                        "quantity": 1
                    }
                ],
                "options": {
                    "insurance": True,
                    "receipt": False,
                    "own_hand": False
                },
                "services": "1,2,3,4,17"  # PAC, SEDEX, SEDEX 10, SEDEX 12, PAC Contract
            }
            
            # Por enquanto, retornar dados simulados já que não temos token da API
            return self._get_mock_shipping_quotes(destination_cep, total_weight)
            
        except Exception as e:
            print(f"Erro ao calcular frete: {str(e)}")
            return self._get_mock_shipping_quotes(destination_cep, 1.0)
    
    def _get_mock_shipping_quotes(self, destination_cep: str, weight: float) -> List[Dict[str, Any]]:
        """Retorna cotações simuladas para desenvolvimento"""
        
        # Calcular preços baseados na região
        state = self._get_state_from_cep(destination_cep)
        base_price = self._get_base_price_by_state(state)
        
        # Ajustar preço pelo peso
        weight_multiplier = max(1.0, weight / 1.0)  # A cada 1kg adicional
        
        quotes = [
            {
                'carrier_name': 'Correios',
                'service_name': 'PAC',
                'service_code': '04510',
                'price': round(base_price * 0.8 * weight_multiplier, 2),
                'delivery_time': 7 + (1 if state not in ['SP', 'RJ', 'MG'] else 0),
                'description': 'Entrega padrão dos Correios',
                'insurance_included': True
            },
            {
                'carrier_name': 'Correios',
                'service_name': 'SEDEX',
                'service_code': '04014',
                'price': round(base_price * 1.5 * weight_multiplier, 2),
                'delivery_time': 3 + (1 if state not in ['SP', 'RJ', 'MG'] else 0),
                'description': 'Entrega expressa dos Correios',
                'insurance_included': True
            },
            {
                'carrier_name': 'Transportadora Parceira',
                'service_name': 'Econômico',
                'service_code': 'ECON',
                'price': round(base_price * 0.6 * weight_multiplier, 2),
                'delivery_time': 10 + (2 if state not in ['SP', 'RJ', 'MG'] else 0),
                'description': 'Entrega econômica via transportadora',
                'insurance_included': False
            }
        ]
        
        return quotes
    
    def _get_state_from_cep(self, cep: str) -> str:
        """Determina o estado baseado no CEP"""
        cep_clean = cep.replace('-', '').replace(' ', '')
        
        if not cep_clean or len(cep_clean) < 5:
            return 'SP'  # Padrão
        
        # Mapeamento básico de CEP para estado
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
            '70': 'DF', '71': 'DF', '72': 'DF', '73': 'DF'
        }
        
        return cep_states.get(cep_prefix, 'SP')
    
    def _get_base_price_by_state(self, state: str) -> float:
        """Retorna preço base por estado"""
        
        prices = {
            'SP': 15.00,
            'RJ': 18.00,
            'MG': 20.00,
            'PR': 22.00,
            'SC': 25.00,
            'RS': 28.00,
            'ES': 20.00,
            'BA': 25.00,
            'PE': 30.00,
            'CE': 32.00,
            'DF': 25.00,
            'GO': 25.00,
            'MT': 35.00,
            'MS': 30.00,
            'TO': 40.00,
            'MA': 35.00,
            'PI': 38.00,
            'RN': 35.00,
            'PB': 35.00,
            'AL': 35.00,
            'SE': 32.00,
            'RO': 45.00,
            'AC': 50.00,
            'AM': 45.00,
            'RR': 55.00,
            'PA': 40.00,
            'AP': 50.00
        }
        
        return prices.get(state, 30.00)
    
    def track_shipment(self, tracking_code: str) -> Dict[str, Any]:
        """Rastreia uma entrega"""
        # Implementação futura
        return {
            'tracking_code': tracking_code,
            'status': 'in_transit',
            'events': []
        }
    
    def create_shipment(self, order_data: Dict[str, Any]) -> Dict[str, Any]:
        """Cria uma etiqueta de envio"""
        # Implementação futura
        return {
            'shipment_id': 'ME123456789',
            'tracking_code': 'BR123456789',
            'label_url': 'https://example.com/label.pdf'
        }