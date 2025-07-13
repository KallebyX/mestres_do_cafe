#!/usr/bin/env python3
"""
Teste completo do sistema Mestres do Café Enterprise
Testa todos os fluxos: cadastro, login, carrinho, compra, CRM, ERP, PDV, notificações
"""

import requests
import json
import uuid
import time
from datetime import datetime
from decimal import Decimal

BASE_URL = "http://localhost:5001"
API_URL = f"{BASE_URL}/api"

class MestresCafeSystemTest:
    def __init__(self):
        self.session = requests.Session()
        self.test_user_data = {
            "name": "João Silva Teste",
            "email": f"teste_{uuid.uuid4().hex[:8]}@mestrescafe.com",
            "password": "MinhaSenh@123",
            "phone": "11999887766"
        }
        self.auth_token = None
        self.user_id = None
        self.order_id = None
        self.product_id = None
        self.cart_id = None
        
    def print_section(self, title):
        print(f"\n{'='*80}")
        print(f"🧪 {title}")
        print(f"{'='*80}")
    
    def print_test(self, test_name, status, details=""):
        icon = "✅" if status else "❌"
        print(f"{icon} {test_name}")
        if details:
            print(f"   {details}")
    
    def test_api_health(self):
        """Testa saúde da API"""
        self.print_section("TESTE DE SAÚDE DA API")
        
        try:
            response = self.session.get(f"{API_URL}/health")
            if response.status_code == 200:
                data = response.json()
                self.print_test("API Health Check", True, f"Status: {data.get('status')}")
                self.print_test("Database Connection", True, f"DB: {data.get('database')}")
                return True
            else:
                self.print_test("API Health Check", False, f"Status: {response.status_code}")
                return False
        except Exception as e:
            self.print_test("API Health Check", False, f"Erro: {str(e)}")
            return False
    
    def test_database_tables(self):
        """Testa estrutura do banco de dados"""
        self.print_section("TESTE DE ESTRUTURA DO BANCO DE DADOS")
        
        # Testar conexão com algumas tabelas críticas
        critical_endpoints = [
            ("/auth/users", "Tabela de usuários"),
            ("/products", "Tabela de produtos"),
            ("/orders", "Tabela de pedidos"),
            ("/gamification/levels", "Sistema de gamificação"),
            ("/financial/accounts", "Sistema financeiro"),
            ("/customers", "Sistema CRM"),
        ]
        
        for endpoint, description in critical_endpoints:
            try:
                response = self.session.get(f"{API_URL}{endpoint}")
                status = response.status_code in [200, 401, 403]  # 401/403 são OK (sem auth)
                self.print_test(description, status, f"Endpoint: {endpoint}")
            except Exception as e:
                self.print_test(description, False, f"Erro: {str(e)}")
    
    def test_user_registration(self):
        """Testa cadastro de usuário"""
        self.print_section("TESTE DE CADASTRO DE USUÁRIO")
        
        try:
            # Tentar cadastrar usuário
            response = self.session.post(f"{API_URL}/auth/register", json=self.test_user_data)
            
            if response.status_code == 201:
                data = response.json()
                self.user_id = data.get("user", {}).get("id")
                self.print_test("Cadastro de usuário", True, f"ID: {self.user_id}")
                return True
            else:
                self.print_test("Cadastro de usuário", False, f"Status: {response.status_code}")
                print(f"   Resposta: {response.text}")
                return False
        except Exception as e:
            self.print_test("Cadastro de usuário", False, f"Erro: {str(e)}")
            return False
    
    def test_user_login(self):
        """Testa login de usuário"""
        self.print_section("TESTE DE LOGIN DE USUÁRIO")
        
        try:
            login_data = {
                "email": self.test_user_data["email"],
                "password": self.test_user_data["password"]
            }
            
            response = self.session.post(f"{API_URL}/auth/login", json=login_data)
            
            if response.status_code == 200:
                data = response.json()
                self.auth_token = data.get("access_token")
                self.user_id = data.get("user", {}).get("id")
                
                # Configurar header de autenticação
                self.session.headers.update({
                    "Authorization": f"Bearer {self.auth_token}"
                })
                
                self.print_test("Login de usuário", True, f"Token obtido")
                return True
            else:
                self.print_test("Login de usuário", False, f"Status: {response.status_code}")
                return False
        except Exception as e:
            self.print_test("Login de usuário", False, f"Erro: {str(e)}")
            return False
    
    def test_products_system(self):
        """Testa sistema de produtos"""
        self.print_section("TESTE DO SISTEMA DE PRODUTOS")
        
        try:
            # Listar produtos
            response = self.session.get(f"{API_URL}/products")
            if response.status_code == 200:
                products = response.json()
                if isinstance(products, list) and len(products) > 0:
                    self.product_id = products[0].get("id")
                    self.print_test("Listagem de produtos", True, f"{len(products)} produtos encontrados")
                    self.print_test("Produto selecionado", True, f"ID: {self.product_id}")
                else:
                    self.print_test("Listagem de produtos", False, "Nenhum produto encontrado")
                return True
            else:
                self.print_test("Listagem de produtos", False, f"Status: {response.status_code}")
                return False
        except Exception as e:
            self.print_test("Sistema de produtos", False, f"Erro: {str(e)}")
            return False
    
    def test_cart_system(self):
        """Testa sistema de carrinho"""
        self.print_section("TESTE DO SISTEMA DE CARRINHO")
        
        if not self.product_id:
            self.print_test("Sistema de carrinho", False, "Nenhum produto disponível")
            return False
        
        try:
            # Adicionar produto ao carrinho
            cart_data = {
                "product_id": self.product_id,
                "quantity": 2,
                "user_id": self.user_id
            }
            
            response = self.session.post(f"{API_URL}/cart/add", json=cart_data)
            
            if response.status_code in [200, 201]:
                self.print_test("Adicionar ao carrinho", True, "Produto adicionado")
                
                # Listar itens do carrinho
                response = self.session.get(f"{API_URL}/cart")
                if response.status_code == 200:
                    cart_items = response.json()
                    self.print_test("Listar carrinho", True, f"{len(cart_items)} itens")
                    return True
                else:
                    self.print_test("Listar carrinho", False, f"Status: {response.status_code}")
                    return False
            else:
                self.print_test("Adicionar ao carrinho", False, f"Status: {response.status_code}")
                return False
        except Exception as e:
            self.print_test("Sistema de carrinho", False, f"Erro: {str(e)}")
            return False
    
    def test_checkout_system(self):
        """Testa sistema de checkout"""
        self.print_section("TESTE DO SISTEMA DE CHECKOUT")
        
        try:
            # Dados do checkout
            checkout_data = {
                "user_id": self.user_id,
                "shipping_address": {
                    "street": "Rua Teste, 123",
                    "city": "São Paulo",
                    "state": "SP",
                    "zip_code": "01234-567"
                },
                "payment_method": "credit_card",
                "payment_details": {
                    "card_number": "4111111111111111",
                    "expiry": "12/25",
                    "cvv": "123"
                }
            }
            
            response = self.session.post(f"{API_URL}/checkout/process", json=checkout_data)
            
            if response.status_code in [200, 201]:
                order_data = response.json()
                self.order_id = order_data.get("order_id")
                self.print_test("Processar checkout", True, f"Pedido: {self.order_id}")
                return True
            else:
                self.print_test("Processar checkout", False, f"Status: {response.status_code}")
                print(f"   Resposta: {response.text}")
                return False
        except Exception as e:
            self.print_test("Sistema de checkout", False, f"Erro: {str(e)}")
            return False
    
    def test_orders_system(self):
        """Testa sistema de pedidos"""
        self.print_section("TESTE DO SISTEMA DE PEDIDOS")
        
        try:
            # Listar pedidos do usuário
            response = self.session.get(f"{API_URL}/orders")
            
            if response.status_code == 200:
                orders = response.json()
                self.print_test("Listar pedidos", True, f"{len(orders)} pedidos encontrados")
                
                # Se há pedidos, testar detalhes
                if len(orders) > 0:
                    order_id = orders[0].get("id")
                    response = self.session.get(f"{API_URL}/orders/{order_id}")
                    if response.status_code == 200:
                        self.print_test("Detalhes do pedido", True, f"Pedido: {order_id}")
                    else:
                        self.print_test("Detalhes do pedido", False, f"Status: {response.status_code}")
                
                return True
            else:
                self.print_test("Listar pedidos", False, f"Status: {response.status_code}")
                return False
        except Exception as e:
            self.print_test("Sistema de pedidos", False, f"Erro: {str(e)}")
            return False
    
    def test_gamification_system(self):
        """Testa sistema de gamificação"""
        self.print_section("TESTE DO SISTEMA DE GAMIFICAÇÃO")
        
        try:
            # Verificar perfil do usuário
            response = self.session.get(f"{API_URL}/gamification/users/{self.user_id}/profile")
            
            if response.status_code == 200:
                profile = response.json()
                self.print_test("Perfil de gamificação", True, f"Pontos: {profile.get('total_points', 0)}")
                self.print_test("Nível atual", True, f"Nível: {profile.get('current_level', {}).get('name', 'N/A')}")
                return True
            else:
                self.print_test("Sistema de gamificação", False, f"Status: {response.status_code}")
                return False
        except Exception as e:
            self.print_test("Sistema de gamificação", False, f"Erro: {str(e)}")
            return False
    
    def test_notifications_system(self):
        """Testa sistema de notificações"""
        self.print_section("TESTE DO SISTEMA DE NOTIFICAÇÕES")
        
        try:
            # Verificar notificações do usuário
            response = self.session.get(f"{API_URL}/notifications")
            
            if response.status_code == 200:
                notifications = response.json()
                self.print_test("Listar notificações", True, f"{len(notifications)} notificações")
                return True
            else:
                self.print_test("Sistema de notificações", False, f"Status: {response.status_code}")
                return False
        except Exception as e:
            self.print_test("Sistema de notificações", False, f"Erro: {str(e)}")
            return False
    
    def test_crm_system(self):
        """Testa sistema CRM"""
        self.print_section("TESTE DO SISTEMA CRM")
        
        try:
            # Verificar clientes no CRM
            response = self.session.get(f"{API_URL}/customers")
            
            if response.status_code == 200:
                customers = response.json()
                self.print_test("Lista de clientes CRM", True, f"{len(customers)} clientes")
                return True
            else:
                self.print_test("Sistema CRM", False, f"Status: {response.status_code}")
                return False
        except Exception as e:
            self.print_test("Sistema CRM", False, f"Erro: {str(e)}")
            return False
    
    def test_financial_system(self):
        """Testa sistema financeiro"""
        self.print_section("TESTE DO SISTEMA FINANCEIRO")
        
        try:
            # Verificar contas financeiras
            response = self.session.get(f"{API_URL}/financial/accounts")
            
            if response.status_code == 200:
                accounts = response.json()
                self.print_test("Contas financeiras", True, f"{len(accounts)} contas")
                
                # Verificar transações
                response = self.session.get(f"{API_URL}/financial/transactions")
                if response.status_code == 200:
                    transactions = response.json()
                    self.print_test("Transações financeiras", True, f"{len(transactions)} transações")
                
                return True
            else:
                self.print_test("Sistema financeiro", False, f"Status: {response.status_code}")
                return False
        except Exception as e:
            self.print_test("Sistema financeiro", False, f"Erro: {str(e)}")
            return False
    
    def test_admin_dashboard(self):
        """Testa dashboard administrativo"""
        self.print_section("TESTE DO DASHBOARD ADMINISTRATIVO")
        
        try:
            # Dashboard de vendas
            response = self.session.get(f"{API_URL}/dashboard/sales")
            sales_ok = response.status_code == 200
            self.print_test("Dashboard de vendas", sales_ok, f"Status: {response.status_code}")
            
            # Dashboard financeiro
            response = self.session.get(f"{API_URL}/dashboard/financial")
            financial_ok = response.status_code == 200
            self.print_test("Dashboard financeiro", financial_ok, f"Status: {response.status_code}")
            
            # Dashboard de estoque
            response = self.session.get(f"{API_URL}/dashboard/inventory")
            inventory_ok = response.status_code == 200
            self.print_test("Dashboard de estoque", inventory_ok, f"Status: {response.status_code}")
            
            # Dashboard de clientes
            response = self.session.get(f"{API_URL}/dashboard/customers")
            customers_ok = response.status_code == 200
            self.print_test("Dashboard de clientes", customers_ok, f"Status: {response.status_code}")
            
            return sales_ok or financial_ok or inventory_ok or customers_ok
        except Exception as e:
            self.print_test("Dashboard administrativo", False, f"Erro: {str(e)}")
            return False
    
    def test_leads_system(self):
        """Testa sistema de leads"""
        self.print_section("TESTE DO SISTEMA DE LEADS")
        
        try:
            # Verificar leads
            response = self.session.get(f"{API_URL}/leads")
            
            if response.status_code == 200:
                leads = response.json()
                self.print_test("Lista de leads", True, f"{len(leads)} leads")
                return True
            else:
                self.print_test("Sistema de leads", False, f"Status: {response.status_code}")
                return False
        except Exception as e:
            self.print_test("Sistema de leads", False, f"Erro: {str(e)}")
            return False
    
    def test_stock_system(self):
        """Testa sistema de estoque"""
        self.print_section("TESTE DO SISTEMA DE ESTOQUE")
        
        try:
            # Verificar movimentações de estoque
            response = self.session.get(f"{API_URL}/stock/movements")
            
            if response.status_code == 200:
                movements = response.json()
                self.print_test("Movimentações de estoque", True, f"{len(movements)} movimentações")
                return True
            else:
                self.print_test("Sistema de estoque", False, f"Status: {response.status_code}")
                return False
        except Exception as e:
            self.print_test("Sistema de estoque", False, f"Erro: {str(e)}")
            return False
    
    def run_complete_test(self):
        """Executa todos os testes"""
        print("🚀 INICIANDO TESTE COMPLETO DO SISTEMA MESTRES DO CAFÉ ENTERPRISE")
        print(f"⏰ Início: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        
        results = {}
        
        # Executar todos os testes
        test_methods = [
            ("API Health", self.test_api_health),
            ("Database Tables", self.test_database_tables),
            ("User Registration", self.test_user_registration),
            ("User Login", self.test_user_login),
            ("Products System", self.test_products_system),
            ("Cart System", self.test_cart_system),
            ("Checkout System", self.test_checkout_system),
            ("Orders System", self.test_orders_system),
            ("Gamification System", self.test_gamification_system),
            ("Notifications System", self.test_notifications_system),
            ("CRM System", self.test_crm_system),
            ("Financial System", self.test_financial_system),
            ("Admin Dashboard", self.test_admin_dashboard),
            ("Leads System", self.test_leads_system),
            ("Stock System", self.test_stock_system)
        ]
        
        for test_name, test_method in test_methods:
            try:
                results[test_name] = test_method()
            except Exception as e:
                results[test_name] = False
                print(f"❌ {test_name}: Erro crítico - {str(e)}")
        
        # Relatório final
        self.print_final_report(results)
        
        return results
    
    def print_final_report(self, results):
        """Imprime relatório final"""
        self.print_section("RELATÓRIO FINAL DO TESTE")
        
        passed = sum(1 for result in results.values() if result)
        total = len(results)
        success_rate = (passed / total) * 100 if total > 0 else 0
        
        print(f"📊 RESUMO DOS TESTES:")
        print(f"   ✅ Passou: {passed}/{total} ({success_rate:.1f}%)")
        print(f"   ❌ Falhou: {total - passed}/{total}")
        
        print(f"\n📋 DETALHES POR SISTEMA:")
        for test_name, result in results.items():
            status = "✅ PASSOU" if result else "❌ FALHOU"
            print(f"   {status}: {test_name}")
        
        print(f"\n🎯 ANÁLISE GERAL:")
        if success_rate >= 80:
            print("   🟢 SISTEMA EM EXCELENTE ESTADO")
        elif success_rate >= 60:
            print("   🟡 SISTEMA FUNCIONAL COM ALGUNS PROBLEMAS")
        else:
            print("   🔴 SISTEMA PRECISA DE ATENÇÃO URGENTE")
        
        print(f"\n⏰ Fim: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        print(f"👤 Usuário de teste: {self.test_user_data['email']}")
        
        if self.user_id:
            print(f"🆔 ID do usuário: {self.user_id}")
        if self.order_id:
            print(f"📦 ID do pedido: {self.order_id}")

def main():
    """Função principal"""
    tester = MestresCafeSystemTest()
    results = tester.run_complete_test()
    
    # Retornar código de saída baseado no resultado
    passed = sum(1 for result in results.values() if result)
    total = len(results)
    success_rate = (passed / total) * 100 if total > 0 else 0
    
    return 0 if success_rate >= 70 else 1

if __name__ == "__main__":
    import sys
    sys.exit(main())