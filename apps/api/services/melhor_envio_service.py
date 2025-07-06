"""
Serviço de integração com API do Melhor Envio
"""
import requests
import json
from datetime import datetime, timedelta
from typing import Dict, List, Optional
from src.models.database import db
from src.models.melhor_envio import MelhorEnvioConfig, FreteCalculado, EnvioMelhorEnvio, RastreamentoEnvio

class MelhorEnvioService:
    """Serviço para integração com API do Melhor Envio"""
    
    def __init__(self):
        self.config = self._get_config()
        self.base_url = self._get_base_url()
        
    def _get_config(self) -> Optional[MelhorEnvioConfig]:
        """Obtém configuração do banco de dados"""
        return MelhorEnvioConfig.query.first()
    
    def _get_base_url(self) -> str:
        """Retorna URL base conforme ambiente"""
        if self.config and self.config.environment == 'production':
            return 'https://www.melhorenvio.com.br'
        return 'https://sandbox.melhorenvio.com.br'
    
    def _get_headers(self) -> Dict[str, str]:
        """Retorna headers para requisições"""
        headers = {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'User-Agent': 'Mestres do Café - E-commerce'
        }
        
        if self.config and self.config.access_token:
            headers['Authorization'] = f'Bearer {self.config.access_token}'
            
        return headers
    
    def _is_token_expired(self) -> bool:
        """Verifica se o token está expirado"""
        if not self.config or not self.config.token_expires_at:
            return True
        return datetime.utcnow() >= self.config.token_expires_at
    
    def refresh_access_token(self) -> bool:
        """Renova o access token usando refresh token"""
        if not self.config or not self.config.refresh_token:
            return False
            
        url = f'{self.base_url}/oauth/token'
        data = {
            'grant_type': 'refresh_token',
            'client_id': self.config.client_id,
            'client_secret': self.config.client_secret,
            'refresh_token': self.config.refresh_token
        }
        
        try:
            response = requests.post(url, json=data)
            if response.status_code == 200:
                token_data = response.json()
                
                # Atualizar configuração
                self.config.access_token = token_data['access_token']
                self.config.refresh_token = token_data.get('refresh_token', self.config.refresh_token)
                self.config.token_expires_at = datetime.utcnow() + timedelta(seconds=token_data['expires_in'])
                self.config.updated_at = datetime.utcnow()
                
                db.session.commit()
                return True
        except Exception as e:
            print(f"Erro ao renovar token: {e}")
            
        return False
    
    def _make_request(self, method: str, endpoint: str, data: Dict = None) -> Optional[Dict]:
        """Faz requisição para API com tratamento de token"""
        if self._is_token_expired():
            if not self.refresh_access_token():
                raise Exception("Token expirado e não foi possível renovar")
        
        url = f'{self.base_url}/api/v2{endpoint}'
        headers = self._get_headers()
        
        try:
            if method.upper() == 'GET':
                response = requests.get(url, headers=headers)
            elif method.upper() == 'POST':
                response = requests.post(url, headers=headers, json=data)
            elif method.upper() == 'DELETE':
                response = requests.delete(url, headers=headers)
            else:
                raise ValueError(f"Método HTTP não suportado: {method}")
            
            if response.status_code in [200, 201]:
                return response.json()
            elif response.status_code == 401:
                # Token inválido, tentar renovar
                if self.refresh_access_token():
                    headers = self._get_headers()
                    if method.upper() == 'POST':
                        response = requests.post(url, headers=headers, json=data)
                    else:
                        response = requests.get(url, headers=headers)
                    
                    if response.status_code in [200, 201]:
                        return response.json()
            
            # Log do erro
            print(f"Erro na API Melhor Envio: {response.status_code} - {response.text}")
            return None
            
        except Exception as e:
            print(f"Erro na requisição: {e}")
            return None
    
    def calcular_frete(self, cep_origem: str, cep_destino: str, produtos: List[Dict]) -> Optional[List[Dict]]:
        """
        Calcula frete para os produtos
        
        Args:
            cep_origem: CEP de origem
            cep_destino: CEP de destino  
            produtos: Lista de produtos com dimensões e peso
            
        Returns:
            Lista de opções de frete ou None em caso de erro
        """
        # Preparar dados para API
        data = {
            "from": {"postal_code": cep_origem.replace('-', '')},
            "to": {"postal_code": cep_destino.replace('-', '')},
            "products": []
        }
        
        valor_total = 0
        for i, produto in enumerate(produtos):
            produto_api = {
                "id": f"produto_{i}",
                "width": produto.get('largura', 20),
                "height": produto.get('altura', 15),
                "length": produto.get('comprimento', 30),
                "weight": produto.get('peso', 1.0),
                "insurance_value": produto.get('valor', 100.0),
                "quantity": produto.get('quantidade', 1)
            }
            data["products"].append(produto_api)
            valor_total += produto.get('valor', 100.0) * produto.get('quantidade', 1)
        
        data["options"] = {
            "insurance_value": valor_total,
            "receipt": False,
            "own_hand": False
        }
        
        # Fazer requisição
        resultado = self._make_request('POST', '/me/shipment/calculate', data)
        
        if resultado:
            # Salvar no histórico
            frete_calculado = FreteCalculado(
                cep_origem=cep_origem.replace('-', ''),
                cep_destino=cep_destino.replace('-', ''),
                peso=sum(p.get('peso', 1.0) * p.get('quantidade', 1) for p in produtos),
                altura=max(p.get('altura', 15) for p in produtos),
                largura=max(p.get('largura', 20) for p in produtos),
                comprimento=sum(p.get('comprimento', 30) for p in produtos),
                valor_declarado=valor_total,
                resultado_json=json.dumps(resultado)
            )
            db.session.add(frete_calculado)
            db.session.commit()
            
        return resultado
    
    def adicionar_ao_carrinho(self, dados_envio: Dict) -> Optional[str]:
        """
        Adiciona envio ao carrinho do Melhor Envio
        
        Args:
            dados_envio: Dados completos do envio
            
        Returns:
            ID do item no carrinho ou None em caso de erro
        """
        resultado = self._make_request('POST', '/me/cart', dados_envio)
        
        if resultado and 'id' in resultado:
            return resultado['id']
            
        return None
    
    def listar_carrinho(self) -> Optional[List[Dict]]:
        """Lista itens no carrinho"""
        return self._make_request('GET', '/me/cart')
    
    def remover_do_carrinho(self, item_id: str) -> bool:
        """Remove item do carrinho"""
        resultado = self._make_request('DELETE', f'/me/cart/{item_id}')
        return resultado is not None
    
    def fazer_checkout(self, order_ids: List[str]) -> Optional[Dict]:
        """
        Realiza checkout dos itens do carrinho
        
        Args:
            order_ids: Lista de IDs dos pedidos
            
        Returns:
            Dados da compra ou None em caso de erro
        """
        data = {"orders": order_ids}
        return self._make_request('POST', '/me/shipment/checkout', data)
    
    def gerar_etiquetas(self, order_ids: List[str]) -> Optional[str]:
        """
        Gera etiquetas em PDF
        
        Args:
            order_ids: Lista de IDs dos pedidos
            
        Returns:
            URL do PDF ou None em caso de erro
        """
        data = {"orders": order_ids}
        resultado = self._make_request('POST', '/me/shipment/generate', data)
        
        if resultado and 'url' in resultado:
            return resultado['url']
            
        return None
    
    def rastrear_envios(self, order_ids: List[str]) -> Optional[Dict]:
        """
        Rastreia envios
        
        Args:
            order_ids: Lista de IDs dos pedidos
            
        Returns:
            Dados de rastreamento ou None em caso de erro
        """
        data = {"orders": order_ids}
        return self._make_request('POST', '/me/shipment/tracking', data)
    
    def atualizar_rastreamento(self, envio_id: int) -> bool:
        """
        Atualiza dados de rastreamento de um envio específico
        
        Args:
            envio_id: ID do envio na tabela local
            
        Returns:
            True se atualizou com sucesso
        """
        envio = EnvioMelhorEnvio.query.get(envio_id)
        if not envio or not envio.melhor_envio_id:
            return False
        
        dados_rastreamento = self.rastrear_envios([envio.melhor_envio_id])
        
        if dados_rastreamento and envio.melhor_envio_id in dados_rastreamento:
            tracking_data = dados_rastreamento[envio.melhor_envio_id]
            
            # Atualizar status do envio
            if 'status' in tracking_data:
                envio.status = tracking_data['status']
                envio.updated_at = datetime.utcnow()
            
            # Adicionar novos eventos de rastreamento
            if 'tracking' in tracking_data:
                for evento in tracking_data['tracking']:
                    # Verificar se evento já existe
                    evento_existente = RastreamentoEnvio.query.filter_by(
                        envio_id=envio_id,
                        status=evento.get('status', ''),
                        data_evento=datetime.fromisoformat(evento.get('occurred_at', '').replace('Z', '+00:00'))
                    ).first()
                    
                    if not evento_existente:
                        novo_rastreamento = RastreamentoEnvio(
                            envio_id=envio_id,
                            status=evento.get('status', ''),
                            descricao=evento.get('description', ''),
                            localizacao=evento.get('location', ''),
                            data_evento=datetime.fromisoformat(evento.get('occurred_at', '').replace('Z', '+00:00'))
                        )
                        db.session.add(novo_rastreamento)
            
            db.session.commit()
            return True
            
        return False

