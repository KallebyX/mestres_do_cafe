from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from ..models.base import db
from ..models.products import Product
from datetime import datetime
import requests
import re

shipping_bp = Blueprint('shipping', __name__)

# Configurações do Melhor Envio (deve ser movido para variáveis de ambiente)
MELHOR_ENVIO_API_URL = "https://sandbox.melhorenvio.com.br/api/v2/me"
MELHOR_ENVIO_TOKEN = "seu_token_aqui"  # Deve ser configurado nas variáveis de ambiente

def validate_cep(cep):
    """Valida e formata CEP"""
    if not cep:
        return None
    
    # Remove caracteres não numéricos
    cep = re.sub(r'\D', '', cep)
    
    # Verifica se tem 8 dígitos
    if len(cep) != 8:
        return None
    
    return cep

def format_cep(cep):
    """Formata CEP com traço"""
    if not cep or len(cep) != 8:
        return cep
    
    return f"{cep[:5]}-{cep[5:]}"

@shipping_bp.route('/calculate', methods=['POST'])
def calculate_shipping():
    """Calcular frete para um produto"""
    try:
        data = request.get_json()
        
        # Validações
        required_fields = ['origin_cep', 'destination_cep', 'weight', 'product_id']
        for field in required_fields:
            if not data.get(field):
                return jsonify({
                    'success': False,
                    'error': f'Campo {field} é obrigatório'
                }), 400
        
        # Validar CEPs
        origin_cep = validate_cep(data['origin_cep'])
        destination_cep = validate_cep(data['destination_cep'])
        
        if not origin_cep or not destination_cep:
            return jsonify({
                'success': False,
                'error': 'CEPs inválidos'
            }), 400
        
        # Verificar se produto existe
        product = Product.query.get(data['product_id'])
        if not product:
            return jsonify({
                'success': False,
                'error': 'Produto não encontrado'
            }), 404
        
        # Dados do produto
        weight = float(data['weight'])
        dimensions = data.get('dimensions', {
            'length': 20,
            'width': 15,
            'height': 10
        })
        
        # Simular cálculo de frete (substituir por integração real com Melhor Envio)
        shipping_options = calculate_shipping_mock(
            origin_cep, destination_cep, weight, dimensions
        )
        
        return jsonify({
            'success': True,
            'shipping_options': shipping_options,
            'origin_cep': format_cep(origin_cep),
            'destination_cep': format_cep(destination_cep),
            'weight': weight,
            'dimensions': dimensions
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

def calculate_shipping_mock(origin_cep, destination_cep, weight, dimensions):
    """Função mock para simular cálculo de frete"""
    # Simular diferentes opções de frete
    base_price = 15.0
    weight_factor = weight * 2.5
    
    # Calcular distância baseado nos primeiros dígitos do CEP
    origin_region = int(origin_cep[:2])
    dest_region = int(destination_cep[:2])
    distance_factor = abs(origin_region - dest_region) * 0.5
    
    shipping_options = [
        {
            'service_id': 'PAC',
            'service_name': 'PAC',
            'company': 'Correios',
            'price': round(base_price + weight_factor + distance_factor, 2),
            'delivery_time': 8,
            'delivery_range': {'min': 6, 'max': 10},
            'insurance_value': 0.0,
            'error': None
        },
        {
            'service_id': 'SEDEX',
            'service_name': 'SEDEX',
            'company': 'Correios',
            'price': round((base_price + weight_factor + distance_factor) * 1.8, 2),
            'delivery_time': 3,
            'delivery_range': {'min': 2, 'max': 4},
            'insurance_value': 0.0,
            'error': None
        }
    ]
    
    # Adicionar opções de transportadoras se peso for maior
    if weight > 5:
        shipping_options.append({
            'service_id': 'JADLOG',
            'service_name': 'JADLOG Expresso',
            'company': 'JADLOG',
            'price': round((base_price + weight_factor + distance_factor) * 1.3, 2),
            'delivery_time': 5,
            'delivery_range': {'min': 4, 'max': 7},
            'insurance_value': 0.0,
            'error': None
        })
    
    return shipping_options

@shipping_bp.route('/cep/<cep>', methods=['GET'])
def get_cep_info(cep):
    """Buscar informações de CEP"""
    try:
        # Validar CEP
        validated_cep = validate_cep(cep)
        if not validated_cep:
            return jsonify({
                'success': False,
                'error': 'CEP inválido'
            }), 400
        
        # Buscar informações do CEP via ViaCEP
        try:
            response = requests.get(
                f"https://viacep.com.br/ws/{validated_cep}/json/",
                timeout=10
            )
            response.raise_for_status()
            
            cep_data = response.json()
            
            if cep_data.get('erro'):
                return jsonify({
                    'success': False,
                    'error': 'CEP não encontrado'
                }), 404
            
            return jsonify({
                'success': True,
                'cep': format_cep(validated_cep),
                'address': {
                    'street': cep_data.get('logradouro', ''),
                    'neighborhood': cep_data.get('bairro', ''),
                    'city': cep_data.get('localidade', ''),
                    'state': cep_data.get('uf', ''),
                    'ibge': cep_data.get('ibge', '')
                }
            })
            
        except requests.RequestException as e:
            return jsonify({
                'success': False,
                'error': 'Erro ao buscar informações do CEP'
            }), 500
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@shipping_bp.route('/services', methods=['GET'])
def get_shipping_services():
    """Listar serviços de frete disponíveis"""
    try:
        services = [
            {
                'id': 'PAC',
                'name': 'PAC',
                'company': 'Correios',
                'description': 'Entrega econômica',
                'average_delivery_time': 8,
                'insurance_available': True
            },
            {
                'id': 'SEDEX',
                'name': 'SEDEX',
                'company': 'Correios',
                'description': 'Entrega expressa',
                'average_delivery_time': 3,
                'insurance_available': True
            },
            {
                'id': 'JADLOG',
                'name': 'JADLOG Expresso',
                'company': 'JADLOG',
                'description': 'Entrega rápida',
                'average_delivery_time': 5,
                'insurance_available': True
            }
        ]
        
        return jsonify({
            'success': True,
            'services': services
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@shipping_bp.route('/quote', methods=['POST'])
@jwt_required()
def create_shipping_quote():
    """Criar cotação de frete para pedido"""
    try:
        user_id = get_jwt_identity()
        data = request.get_json()
        
        # Validações
        required_fields = ['items', 'destination_cep']
        for field in required_fields:
            if not data.get(field):
                return jsonify({
                    'success': False,
                    'error': f'Campo {field} é obrigatório'
                }), 400
        
        # Validar CEP de destino
        destination_cep = validate_cep(data['destination_cep'])
        if not destination_cep:
            return jsonify({
                'success': False,
                'error': 'CEP de destino inválido'
            }), 400
        
        # Calcular peso e dimensões totais
        total_weight = 0
        total_value = 0
        
        for item in data['items']:
            product = Product.query.get(item['product_id'])
            if not product:
                return jsonify({
                    'success': False,
                    'error': f'Produto {item["product_id"]} não encontrado'
                }), 404
            
            quantity = item.get('quantity', 1)
            weight = product.weight or 500  # peso padrão em gramas
            
            total_weight += (weight * quantity) / 1000  # converter para kg
            total_value += product.price * quantity
        
        # CEP de origem (configurável)
        origin_cep = "01310-100"  # São Paulo - SP (exemplo)
        
        # Calcular frete
        shipping_options = calculate_shipping_mock(
            origin_cep, destination_cep, total_weight, 
            {'length': 30, 'width': 25, 'height': 15}
        )
        
        return jsonify({
            'success': True,
            'quote': {
                'origin_cep': format_cep(origin_cep),
                'destination_cep': format_cep(destination_cep),
                'total_weight': total_weight,
                'total_value': total_value,
                'shipping_options': shipping_options
            }
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500