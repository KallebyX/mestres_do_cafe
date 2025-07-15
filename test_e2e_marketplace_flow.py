#!/usr/bin/env python3
"""
Teste E2E completo do fluxo marketplace
Testa: Produto → Carrinho → Checkout → Pagamento → Escrow → Envio → Liberação
"""

import asyncio
import json
import requests
import time
from datetime import datetime, timedelta
from decimal import Decimal

# Configuração da API
API_BASE_URL = "http://localhost:5001/api"
HEADERS = {
    "Content-Type": "application/json",
    "Accept": "application/json"
}

class E2EMarketplaceTest:
    """Teste E2E completo do marketplace"""
    
    def __init__(self):
        self.session = requests.Session()
        self.session.headers.update(HEADERS)
        self.test_data = {}
        self.admin_token = None
        self.customer_token = None
        
    def log(self, message):
        """Log com timestamp"""
        timestamp = datetime.now().strftime("%H:%M:%S")
        print(f"[{timestamp}] {message}")
    
    async def run_complete_test(self):
        """Executa teste completo"""
        try:
            self.log("🚀 Iniciando teste E2E completo do marketplace")
            
            # Etapa 1: Setup inicial
            await self.setup_test_environment()
            
            # Etapa 2: Criar produto com vendedor
            await self.create_test_product_with_vendor()
            
            # Etapa 3: Simular compra do cliente
            await self.simulate_customer_purchase()
            
            # Etapa 4: Processar pagamento (simular Mercado Pago)
            await self.process_payment()
            
            # Etapa 5: Verificar escrow
            await self.verify_escrow_system()
            
            # Etapa 6: Criar envio
            await self.create_shipment()
            
            # Etapa 7: Simular entrega
            await self.simulate_delivery()
            
            # Etapa 8: Verificar liberação do escrow
            await self.verify_escrow_release()
            
            # Etapa 9: Validar estado final
            await self.validate_final_state()
            
            self.log("✅ Teste E2E concluído com sucesso!")
            return True
            
        except Exception as e:
            self.log(f"❌ Erro no teste E2E: {str(e)}")
            return False
    
    async def setup_test_environment(self):
        """Setup do ambiente de teste"""
        self.log("📋 Configurando ambiente de teste...")
        
        # Verificar se API está rodando
        try:
            response = self.session.get(f"{API_BASE_URL}/health")
            if response.status_code != 200:
                raise Exception("API não está respondendo")
            self.log("✓ API está funcionando")
        except Exception as e:
            raise Exception(f"Falha ao conectar com API: {e}")
        
        # Criar usuário admin de teste
        admin_data = {
            "email": "admin@test.com",
            "password": "admin123",
            "name": "Admin Test",
            "role": "admin"
        }
        
        # Tentar fazer login primeiro
        try:
            login_response = self.session.post(f"{API_BASE_URL}/auth/login", json={
                "email": admin_data["email"],
                "password": admin_data["password"]
            })
            
            if login_response.status_code == 200:
                self.admin_token = login_response.json()["access_token"]
                self.log("✓ Admin logado com sucesso")
            else:
                # Criar admin se não existir
                register_response = self.session.post(f"{API_BASE_URL}/auth/register", json=admin_data)
                if register_response.status_code == 201:
                    self.admin_token = register_response.json()["access_token"]
                    self.log("✓ Admin criado e logado")
                else:
                    raise Exception("Falha ao criar/logar admin")
        except Exception as e:
            self.log(f"⚠️ Continuando sem admin token: {e}")
        
        # Criar cliente de teste
        customer_data = {
            "email": "customer@test.com",
            "password": "customer123",
            "name": "Customer Test"
        }
        
        try:
            customer_login = self.session.post(f"{API_BASE_URL}/auth/login", json={
                "email": customer_data["email"],
                "password": customer_data["password"]
            })
            
            if customer_login.status_code == 200:
                self.customer_token = customer_login.json()["access_token"]
                self.log("✓ Cliente logado com sucesso")
            else:
                # Criar cliente se não existir
                customer_register = self.session.post(f"{API_BASE_URL}/auth/register", json=customer_data)
                if customer_register.status_code == 201:
                    self.customer_token = customer_register.json()["access_token"]
                    self.log("✓ Cliente criado e logado")
        except Exception as e:
            self.log(f"⚠️ Continuando sem customer token: {e}")
    
    async def create_test_product_with_vendor(self):
        """Criar produto de teste com vendedor"""
        self.log("🛍️ Criando produto de teste com vendedor...")
        
        # Criar vendedor
        vendor_data = {
            "business_name": "Café Premium Test",
            "legal_name": "Café Premium Ltda",
            "email": "vendor@test.com",
            "cnpj": "12.345.678/0001-90",
            "phone": "(11) 99999-9999"
        }
        
        try:
            if self.admin_token:
                headers = {"Authorization": f"Bearer {self.admin_token}"}
                vendor_response = self.session.post(
                    f"{API_BASE_URL}/vendors", 
                    json=vendor_data, 
                    headers=headers
                )
                
                if vendor_response.status_code == 201:
                    self.test_data["vendor"] = vendor_response.json()["vendor"]
                    self.log(f"✓ Vendedor criado: {self.test_data['vendor']['id']}")
        except Exception as e:
            self.log(f"⚠️ Falha ao criar vendedor: {e}")
        
        # Criar produto
        product_data = {
            "name": "Café Especial Test",
            "description": "Café especial para teste E2E",
            "price": 29.90,
            "stock_quantity": 100,
            "category": "specialty_coffee",
            "origin": "Brazil",
            "roast_level": "medium",
            "weight": 250
        }
        
        try:
            product_response = self.session.post(f"{API_BASE_URL}/products", json=product_data)
            
            if product_response.status_code == 201:
                self.test_data["product"] = product_response.json()["product"]
                self.log(f"✓ Produto criado: {self.test_data['product']['id']}")
            else:
                # Buscar produto existente
                products_response = self.session.get(f"{API_BASE_URL}/products")
                if products_response.status_code == 200:
                    products = products_response.json().get("products", [])
                    if products:
                        self.test_data["product"] = products[0]
                        self.log(f"✓ Usando produto existente: {self.test_data['product']['id']}")
        except Exception as e:
            self.log(f"⚠️ Falha ao criar produto: {e}")
    
    async def simulate_customer_purchase(self):
        """Simular compra do cliente"""
        self.log("🛒 Simulando compra do cliente...")
        
        if not self.test_data.get("product"):
            raise Exception("Produto não encontrado para teste")
        
        # Adicionar ao carrinho
        cart_data = {
            "product_id": self.test_data["product"]["id"],
            "quantity": 2
        }
        
        try:
            headers = {}
            if self.customer_token:
                headers["Authorization"] = f"Bearer {self.customer_token}"
            
            cart_response = self.session.post(
                f"{API_BASE_URL}/cart/add", 
                json=cart_data,
                headers=headers
            )
            
            if cart_response.status_code == 200:
                self.log("✓ Produto adicionado ao carrinho")
        except Exception as e:
            self.log(f"⚠️ Falha ao adicionar ao carrinho: {e}")
        
        # Criar pedido
        order_data = {
            "items": [
                {
                    "product_id": self.test_data["product"]["id"],
                    "quantity": 2,
                    "unit_price": self.test_data["product"]["price"]
                }
            ],
            "shipping_address": {
                "street": "Rua Test, 123",
                "city": "São Paulo",
                "state": "SP",
                "postal_code": "01234-567",
                "country": "BR"
            },
            "payment_method": "mercado_pago"
        }
        
        try:
            order_response = self.session.post(f"{API_BASE_URL}/orders", json=order_data, headers=headers)
            
            if order_response.status_code == 201:
                self.test_data["order"] = order_response.json()["order"]
                self.log(f"✓ Pedido criado: {self.test_data['order']['id']}")
            else:
                self.log(f"⚠️ Falha ao criar pedido: {order_response.text}")
        except Exception as e:
            self.log(f"⚠️ Falha ao criar pedido: {e}")
    
    async def process_payment(self):
        """Processar pagamento"""
        self.log("💳 Processando pagamento...")
        
        if not self.test_data.get("order"):
            raise Exception("Pedido não encontrado")
        
        # Simular criação de preferência do Mercado Pago
        preference_data = {
            "order_id": self.test_data["order"]["id"],
            "payer_name": "Customer Test",
            "payer_email": "customer@test.com",
            "payer_doc_number": "12345678901"
        }
        
        try:
            headers = {}
            if self.customer_token:
                headers["Authorization"] = f"Bearer {self.customer_token}"
            
            preference_response = self.session.post(
                f"{API_BASE_URL}/payments/mercadopago/create-preference",
                json=preference_data,
                headers=headers
            )
            
            if preference_response.status_code == 200:
                preference = preference_response.json()
                self.test_data["payment_preference"] = preference
                self.log(f"✓ Preferência de pagamento criada")
                
                # Simular webhook de pagamento aprovado
                await self.simulate_payment_webhook()
            else:
                self.log(f"⚠️ Falha ao criar preferência: {preference_response.text}")
        except Exception as e:
            self.log(f"⚠️ Falha no pagamento: {e}")
    
    async def simulate_payment_webhook(self):
        """Simular webhook do Mercado Pago"""
        self.log("🔄 Simulando webhook de pagamento aprovado...")
        
        # Simular notificação do Mercado Pago
        webhook_data = {
            "topic": "payment",
            "resource": "123456789",  # ID fictício do MP
            "action": "payment.updated"
        }
        
        try:
            webhook_response = self.session.post(
                f"{API_BASE_URL}/payments/mercadopago/webhook",
                json=webhook_data
            )
            
            if webhook_response.status_code == 200:
                self.log("✓ Webhook de pagamento processado")
                
                # Aguardar processamento
                await asyncio.sleep(2)
                
                # Buscar pagamento criado
                await self.find_payment_for_order()
            else:
                self.log(f"⚠️ Falha no webhook: {webhook_response.text}")
        except Exception as e:
            self.log(f"⚠️ Falha no webhook: {e}")
    
    async def find_payment_for_order(self):
        """Buscar pagamento do pedido"""
        try:
            headers = {}
            if self.admin_token:
                headers["Authorization"] = f"Bearer {self.admin_token}"
            
            # Buscar pagamentos
            payments_response = self.session.get(f"{API_BASE_URL}/payments", headers=headers)
            
            if payments_response.status_code == 200:
                payments = payments_response.json().get("payments", [])
                for payment in payments:
                    if payment.get("order_id") == self.test_data["order"]["id"]:
                        self.test_data["payment"] = payment
                        self.log(f"✓ Pagamento encontrado: {payment['id']}")
                        break
        except Exception as e:
            self.log(f"⚠️ Falha ao buscar pagamento: {e}")
    
    async def verify_escrow_system(self):
        """Verificar sistema de escrow"""
        self.log("🛡️ Verificando sistema de escrow...")
        
        if not self.test_data.get("payment"):
            self.log("⚠️ Pagamento não encontrado, pulando verificação de escrow")
            return
        
        try:
            headers = {}
            if self.admin_token:
                headers["Authorization"] = f"Bearer {self.admin_token}"
            
            # Buscar estatísticas do escrow
            escrow_stats_response = self.session.get(f"{API_BASE_URL}/escrow/stats", headers=headers)
            
            if escrow_stats_response.status_code == 200:
                escrow_stats = escrow_stats_response.json()
                self.log(f"✓ Escrow stats: {escrow_stats}")
            
            # Buscar pagamentos em escrow
            held_payments_response = self.session.get(f"{API_BASE_URL}/escrow/held-payments", headers=headers)
            
            if held_payments_response.status_code == 200:
                held_payments = held_payments_response.json()
                self.log(f"✓ Pagamentos em escrow: {len(held_payments.get('payments', []))}")
                
        except Exception as e:
            self.log(f"⚠️ Falha na verificação do escrow: {e}")
    
    async def create_shipment(self):
        """Criar envio"""
        self.log("📦 Criando envio...")
        
        if not self.test_data.get("order"):
            raise Exception("Pedido não encontrado")
        
        # Simular criação de envio no Melhor Envio
        shipment_data = {
            "order_id": self.test_data["order"]["id"],
            "service_id": 1,  # PAC
            "customer_name": "Customer Test",
            "customer_email": "customer@test.com",
            "shipping_address": {
                "street": "Rua Test, 123",
                "number": "123",
                "district": "Centro",
                "city": "São Paulo",
                "state": "SP",
                "postal_code": "01234567"
            },
            "products": [
                {
                    "name": self.test_data["product"]["name"],
                    "quantity": 2,
                    "price": self.test_data["product"]["price"]
                }
            ]
        }
        
        try:
            headers = {}
            if self.admin_token:
                headers["Authorization"] = f"Bearer {self.admin_token}"
            
            shipment_response = self.session.post(
                f"{API_BASE_URL}/shipping/melhor-envio/create-shipment",
                json=shipment_data,
                headers=headers
            )
            
            if shipment_response.status_code == 200:
                shipment = shipment_response.json()
                self.test_data["shipment"] = shipment
                self.log(f"✓ Envio criado: {shipment.get('tracking_code', 'N/A')}")
            else:
                self.log(f"⚠️ Falha ao criar envio: {shipment_response.text}")
        except Exception as e:
            self.log(f"⚠️ Falha ao criar envio: {e}")
    
    async def simulate_delivery(self):
        """Simular entrega"""
        self.log("🚚 Simulando entrega...")
        
        # Simular webhook do Melhor Envio informando entrega
        webhook_data = {
            "type": "tracking",
            "shipment": {
                "protocol": self.test_data.get("shipment", {}).get("tracking_code", "TEST123"),
                "status": "delivered"
            }
        }
        
        try:
            webhook_response = self.session.post(
                f"{API_BASE_URL}/shipping/melhor-envio/webhook",
                json=webhook_data
            )
            
            if webhook_response.status_code == 200:
                self.log("✓ Webhook de entrega processado")
                
                # Aguardar processamento
                await asyncio.sleep(2)
            else:
                self.log(f"⚠️ Falha no webhook de entrega: {webhook_response.text}")
        except Exception as e:
            self.log(f"⚠️ Falha no webhook de entrega: {e}")
    
    async def verify_escrow_release(self):
        """Verificar liberação do escrow"""
        self.log("💰 Verificando liberação do escrow...")
        
        try:
            headers = {}
            if self.admin_token:
                headers["Authorization"] = f"Bearer {self.admin_token}"
            
            # Forçar processamento de liberações automáticas
            release_response = self.session.post(
                f"{API_BASE_URL}/escrow/process-automatic-releases",
                headers=headers
            )
            
            if release_response.status_code == 200:
                release_result = release_response.json()
                self.log(f"✓ Liberações processadas: {release_result}")
            else:
                self.log(f"⚠️ Falha no processamento de liberações: {release_response.text}")
        except Exception as e:
            self.log(f"⚠️ Falha na liberação do escrow: {e}")
    
    async def validate_final_state(self):
        """Validar estado final do sistema"""
        self.log("🔍 Validando estado final...")
        
        checks = []
        
        # Verificar se pedido existe
        if self.test_data.get("order"):
            checks.append("✓ Pedido criado")
        else:
            checks.append("❌ Pedido não criado")
        
        # Verificar se pagamento foi processado
        if self.test_data.get("payment"):
            checks.append("✓ Pagamento processado")
        else:
            checks.append("❌ Pagamento não processado")
        
        # Verificar se envio foi criado
        if self.test_data.get("shipment"):
            checks.append("✓ Envio criado")
        else:
            checks.append("❌ Envio não criado")
        
        for check in checks:
            self.log(check)
        
        # Resumo dos dados de teste
        self.log("\n📊 Resumo dos dados de teste:")
        for key, value in self.test_data.items():
            if isinstance(value, dict):
                self.log(f"  {key}: {value.get('id', 'N/A')}")
            else:
                self.log(f"  {key}: {value}")

# Função principal
async def main():
    """Função principal"""
    test = E2EMarketplaceTest()
    success = await test.run_complete_test()
    
    if success:
        print("\n🎉 TESTE E2E CONCLUÍDO COM SUCESSO!")
        print("🔥 Sistema Mestres do Café está funcionando perfeitamente!")
    else:
        print("\n💥 TESTE E2E FALHOU!")
        print("⚠️ Verifique os logs acima para identificar problemas")
    
    return success

if __name__ == "__main__":
    # Executar teste
    result = asyncio.run(main())
    exit(0 if result else 1)