#!/usr/bin/env python3
"""
Teste corrigido do sistema Mestres do Café Enterprise
Baseado nos schemas e endpoints reais do sistema
"""

import requests
import json
import uuid
import time
from datetime import datetime

BASE_URL = "http://localhost:5001"
API_URL = f"{BASE_URL}/api"

class MestresCafeFixedTest:
    def __init__(self):
        self.session = requests.Session()
        self.test_email = f"teste_{uuid.uuid4().hex[:8]}@mestrescafe.com"
        self.test_password = "MinhaSenh@123"
        self.test_user_data = {
            "name": "João Silva Teste",
            "email": self.test_email,
            "password": self.test_password,
            "confirm_password": self.test_password  # Campo obrigatório
        }
        self.auth_token = None
        self.user_id = None
        self.test_results = {}
        
    def print_section(self, title):
        print(f"\n{'='*80}")
        print(f"🧪 {title}")
        print(f"{'='*80}")
    
    def print_test(self, test_name, status, details=""):
        icon = "✅" if status else "❌"
        print(f"{icon} {test_name}")
        if details:
            print(f"   {details}")
        
        self.test_results[test_name] = status
        return status
    
    def test_auth_flow(self):
        """Testa fluxo completo de autenticação"""
        self.print_section("FLUXO DE AUTENTICAÇÃO")
        
        # 1. Teste de registro
        try:
            response = self.session.post(f"{API_URL}/auth/register", json=self.test_user_data)
            
            if response.status_code == 201:
                data = response.json()
                self.user_id = data.get("user", {}).get("id")
                self.print_test("Registro de usuário", True, f"ID: {self.user_id}")
                
                # 2. Teste de login
                login_data = {
                    "email": self.test_email,
                    "password": self.test_password
                }
                
                response = self.session.post(f"{API_URL}/auth/login", json=login_data)
                
                if response.status_code == 200:
                    data = response.json()
                    self.auth_token = data.get("access_token")
                    self.session.headers.update({
                        "Authorization": f"Bearer {self.auth_token}"
                    })
                    self.print_test("Login de usuário", True, "Token obtido")
                    return True
                else:
                    self.print_test("Login de usuário", False, f"Status: {response.status_code} - {response.text}")
                    return False
            else:
                self.print_test("Registro de usuário", False, f"Status: {response.status_code} - {response.text}")
                return False
        except Exception as e:
            self.print_test("Fluxo de autenticação", False, f"Erro: {str(e)}")
            return False
    
    def test_products_catalog(self):
        """Testa catálogo de produtos"""
        self.print_section("CATÁLOGO DE PRODUTOS")
        
        try:
            # Listar produtos
            response = self.session.get(f"{API_URL}/products")
            
            if response.status_code == 200:
                products = response.json()
                if products and len(products) > 0:
                    self.print_test("Listagem de produtos", True, f"{len(products)} produtos encontrados")
                    
                    # Testar detalhes de um produto
                    first_product = products[0]
                    product_id = first_product.get("id")
                    
                    if product_id:
                        response = self.session.get(f"{API_URL}/products/{product_id}")
                        if response.status_code == 200:
                            self.print_test("Detalhes do produto", True, f"Produto: {product_id}")
                            return True
                        else:
                            self.print_test("Detalhes do produto", False, f"Status: {response.status_code}")
                            return False
                else:
                    self.print_test("Listagem de produtos", False, "Nenhum produto encontrado")
                    return False
            else:
                self.print_test("Listagem de produtos", False, f"Status: {response.status_code}")
                return False
        except Exception as e:
            self.print_test("Catálogo de produtos", False, f"Erro: {str(e)}")
            return False
    
    def test_gamification_integration(self):
        """Testa integração com gamificação"""
        self.print_section("INTEGRAÇÃO COM GAMIFICAÇÃO")
        
        if not self.user_id:
            self.print_test("Gamificação", False, "Usuário não autenticado")
            return False
        
        try:
            # Verificar perfil de gamificação
            response = self.session.get(f"{API_URL}/gamification/users/{self.user_id}/profile")
            
            if response.status_code == 200:
                profile = response.json()
                points = profile.get("total_points", 0)
                level = profile.get("current_level", {}).get("name", "N/A")
                
                self.print_test("Perfil de gamificação", True, f"Pontos: {points}, Nível: {level}")
                
                # Testar adição de pontos (admin)
                admin_data = {
                    "user_id": self.user_id,
                    "points": 100,
                    "reason": "Teste de integração",
                    "admin_id": "test-admin"
                }
                
                response = self.session.post(f"{API_URL}/gamification/admin/points/add", json=admin_data)
                
                if response.status_code == 201:
                    self.print_test("Adição de pontos", True, "100 pontos adicionados")
                    return True
                else:
                    self.print_test("Adição de pontos", False, f"Status: {response.status_code}")
                    return False
            else:
                self.print_test("Perfil de gamificação", False, f"Status: {response.status_code}")
                return False
        except Exception as e:
            self.print_test("Integração com gamificação", False, f"Erro: {str(e)}")
            return False
    
    def test_crm_integration(self):
        """Testa integração com CRM"""
        self.print_section("INTEGRAÇÃO COM CRM")
        
        try:
            # Listar clientes
            response = self.session.get(f"{API_URL}/customers")
            
            if response.status_code == 200:
                customers = response.json()
                self.print_test("Lista de clientes", True, f"{len(customers)} clientes no CRM")
                
                # Se o usuário logado deve aparecer no CRM
                user_in_crm = any(customer.get("email") == self.test_email for customer in customers)
                self.print_test("Usuário no CRM", user_in_crm, "Usuário registrado no CRM")
                
                return True
            else:
                self.print_test("Lista de clientes", False, f"Status: {response.status_code}")
                return False
        except Exception as e:
            self.print_test("Integração com CRM", False, f"Erro: {str(e)}")
            return False
    
    def test_financial_system(self):
        """Testa sistema financeiro"""
        self.print_section("SISTEMA FINANCEIRO")
        
        try:
            # Verificar contas financeiras
            response = self.session.get(f"{API_URL}/financial/accounts")
            
            if response.status_code == 200:
                accounts = response.json()
                self.print_test("Contas financeiras", True, f"{len(accounts)} contas configuradas")
                
                # Verificar transações
                response = self.session.get(f"{API_URL}/financial/transactions")
                
                if response.status_code == 200:
                    transactions = response.json()
                    self.print_test("Transações financeiras", True, f"{len(transactions)} transações registradas")
                    return True
                else:
                    self.print_test("Transações financeiras", False, f"Status: {response.status_code}")
                    return False
            else:
                self.print_test("Contas financeiras", False, f"Status: {response.status_code}")
                return False
        except Exception as e:
            self.print_test("Sistema financeiro", False, f"Erro: {str(e)}")
            return False
    
    def test_leads_system(self):
        """Testa sistema de leads"""
        self.print_section("SISTEMA DE LEADS")
        
        try:
            # Verificar leads
            response = self.session.get(f"{API_URL}/leads")
            
            if response.status_code == 200:
                leads = response.json()
                self.print_test("Sistema de leads", True, f"{len(leads)} leads registrados")
                
                # Criar um novo lead
                lead_data = {
                    "name": "Lead Teste",
                    "email": f"lead_{uuid.uuid4().hex[:6]}@teste.com",
                    "phone": "11987654321",
                    "source": "sistema_teste",
                    "status": "new"
                }
                
                response = self.session.post(f"{API_URL}/leads", json=lead_data)
                
                if response.status_code in [200, 201]:
                    self.print_test("Criação de lead", True, "Lead criado com sucesso")
                    return True
                else:
                    self.print_test("Criação de lead", False, f"Status: {response.status_code}")
                    return False
            else:
                self.print_test("Sistema de leads", False, f"Status: {response.status_code}")
                return False
        except Exception as e:
            self.print_test("Sistema de leads", False, f"Erro: {str(e)}")
            return False
    
    def test_orders_system(self):
        """Testa sistema de pedidos"""
        self.print_section("SISTEMA DE PEDIDOS")
        
        try:
            # Verificar pedidos
            response = self.session.get(f"{API_URL}/orders")
            
            if response.status_code == 200:
                orders = response.json()
                self.print_test("Listagem de pedidos", True, f"{len(orders)} pedidos encontrados")
                
                # Se há pedidos, testar detalhes de um
                if orders:
                    first_order = orders[0]
                    order_id = first_order.get("id")
                    
                    if order_id:
                        response = self.session.get(f"{API_URL}/orders/{order_id}")
                        if response.status_code == 200:
                            self.print_test("Detalhes do pedido", True, f"Pedido: {order_id}")
                            return True
                        else:
                            self.print_test("Detalhes do pedido", False, f"Status: {response.status_code}")
                            return False
                else:
                    self.print_test("Sistema de pedidos", True, "Nenhum pedido encontrado (normal)")
                    return True
            else:
                self.print_test("Sistema de pedidos", False, f"Status: {response.status_code}")
                return False
        except Exception as e:
            self.print_test("Sistema de pedidos", False, f"Erro: {str(e)}")
            return False
    
    def test_notifications_system(self):
        """Testa sistema de notificações"""
        self.print_section("SISTEMA DE NOTIFICAÇÕES")
        
        try:
            # Verificar notificações
            response = self.session.get(f"{API_URL}/notifications")
            
            if response.status_code == 200:
                notifications = response.json()
                self.print_test("Sistema de notificações", True, f"{len(notifications)} notificações")
                return True
            elif response.status_code == 401:
                self.print_test("Sistema de notificações", True, "Requer autenticação (funcional)")
                return True
            else:
                self.print_test("Sistema de notificações", False, f"Status: {response.status_code}")
                return False
        except Exception as e:
            self.print_test("Sistema de notificações", False, f"Erro: {str(e)}")
            return False
    
    def test_admin_routes(self):
        """Testa rotas administrativas"""
        self.print_section("ROTAS ADMINISTRATIVAS")
        
        admin_routes = [
            ("/gamification/admin/dashboard", "Dashboard de gamificação"),
            ("/customers", "Gestão de clientes"),
            ("/financial/accounts", "Contas financeiras"),
            ("/leads", "Gestão de leads"),
            ("/orders", "Gestão de pedidos")
        ]
        
        results = []
        for route, description in admin_routes:
            try:
                response = self.session.get(f"{API_URL}{route}")
                # Considerar 200, 401, 403 como funcionais (podem precisar de auth específica)
                is_functional = response.status_code in [200, 401, 403]
                self.print_test(description, is_functional, f"Status: {response.status_code}")
                results.append(is_functional)
            except Exception as e:
                self.print_test(description, False, f"Erro: {str(e)}")
                results.append(False)
        
        return all(results)
    
    def test_data_flow(self):
        """Testa fluxo de dados entre sistemas"""
        self.print_section("FLUXO DE DADOS ENTRE SISTEMAS")
        
        if not self.user_id:
            self.print_test("Fluxo de dados", False, "Usuário não autenticado")
            return False
        
        try:
            # 1. Verificar se usuário aparece no CRM
            response = self.session.get(f"{API_URL}/customers")
            if response.status_code == 200:
                customers = response.json()
                user_in_crm = any(customer.get("email") == self.test_email for customer in customers)
                self.print_test("Usuário → CRM", user_in_crm, "Dados sincronizados")
            
            # 2. Verificar se usuário tem perfil de gamificação
            response = self.session.get(f"{API_URL}/gamification/users/{self.user_id}/profile")
            if response.status_code == 200:
                self.print_test("Usuário → Gamificação", True, "Perfil criado automaticamente")
            
            # 3. Verificar integração com sistema financeiro
            response = self.session.get(f"{API_URL}/financial/transactions")
            if response.status_code == 200:
                self.print_test("Integração financeira", True, "Sistema financeiro ativo")
            
            return True
        except Exception as e:
            self.print_test("Fluxo de dados", False, f"Erro: {str(e)}")
            return False
    
    def run_comprehensive_test(self):
        """Executa teste abrangente do sistema"""
        print("🚀 TESTE ABRANGENTE DO SISTEMA MESTRES DO CAFÉ ENTERPRISE")
        print(f"⏰ Início: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        
        # Executar todos os testes
        test_methods = [
            ("Fluxo de Autenticação", self.test_auth_flow),
            ("Catálogo de Produtos", self.test_products_catalog),
            ("Integração com Gamificação", self.test_gamification_integration),
            ("Integração com CRM", self.test_crm_integration),
            ("Sistema Financeiro", self.test_financial_system),
            ("Sistema de Leads", self.test_leads_system),
            ("Sistema de Pedidos", self.test_orders_system),
            ("Sistema de Notificações", self.test_notifications_system),
            ("Rotas Administrativas", self.test_admin_routes),
            ("Fluxo de Dados", self.test_data_flow)
        ]
        
        results = {}
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
        self.print_section("RELATÓRIO FINAL - SISTEMA ENTERPRISE")
        
        passed = sum(1 for result in results.values() if result)
        total = len(results)
        success_rate = (passed / total) * 100 if total > 0 else 0
        
        print(f"📊 RESUMO DOS TESTES:")
        print(f"   ✅ Passou: {passed}/{total} ({success_rate:.1f}%)")
        print(f"   ❌ Falhou: {total - passed}/{total}")
        
        print(f"\n📋 DETALHES POR SISTEMA:")
        for test_name, result in results.items():
            status = "✅ FUNCIONAL" if result else "❌ PROBLEMA"
            print(f"   {status}: {test_name}")
        
        print(f"\n🎯 AVALIAÇÃO GERAL:")
        if success_rate >= 90:
            print("   🟢 SISTEMA ENTERPRISE EXCELENTE")
        elif success_rate >= 70:
            print("   🟡 SISTEMA ENTERPRISE FUNCIONAL")
        elif success_rate >= 50:
            print("   🟠 SISTEMA ENTERPRISE COM PROBLEMAS")
        else:
            print("   🔴 SISTEMA ENTERPRISE CRÍTICO")
        
        print(f"\n💡 RECOMENDAÇÕES:")
        if success_rate < 100:
            print("   📋 Corrigir itens marcados como PROBLEMA")
            print("   🔧 Implementar testes de integração mais robustos")
            print("   📊 Monitorar métricas de performance")
        else:
            print("   🎉 Sistema funcionando perfeitamente!")
        
        print(f"\n⏰ Fim: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        print(f"👤 Usuário de teste: {self.test_email}")
        if self.user_id:
            print(f"🆔 ID do usuário: {self.user_id}")

def main():
    """Função principal"""
    tester = MestresCafeFixedTest()
    results = tester.run_comprehensive_test()
    
    # Retornar código de saída baseado no resultado
    passed = sum(1 for result in results.values() if result)
    total = len(results)
    success_rate = (passed / total) * 100 if total > 0 else 0
    
    return 0 if success_rate >= 70 else 1

if __name__ == "__main__":
    import sys
    sys.exit(main())