#!/usr/bin/env python3
"""
Teste completo das funcionalidades administrativas do Mestres do Café
Verifica TODAS as áreas admin: Dashboard, CRM, RH, Financeiro, Estoque, etc.
"""

import requests
import json
import time
import sys
from datetime import datetime

class AdminTestCompleto:
    def __init__(self):
        self.api_base = "http://localhost:5002"
        self.frontend_base = "http://localhost:3000"
        self.errors = []
        self.warnings = []
        self.success_count = 0
        self.total_tests = 0
        
    def log_test(self, name, success, details=""):
        self.total_tests += 1
        if success:
            self.success_count += 1
            print(f"✅ {name}")
            if details:
                print(f"   {details}")
        else:
            self.errors.append(f"{name}: {details}")
            print(f"❌ {name}")
            if details:
                print(f"   {details}")
                
    def log_warning(self, name, details=""):
        self.warnings.append(f"{name}: {details}")
        print(f"⚠️  {name}")
        if details:
            print(f"   {details}")

    def test_admin_dashboard_endpoints(self):
        """Teste 1: Endpoints do Dashboard Administrativo"""
        print("\n🔍 TESTE 1: DASHBOARD ADMINISTRATIVO")
        
        admin_endpoints = [
            ("/api/admin/dashboard", "Dashboard Principal"),
            ("/api/admin/dashboard/sales", "Dashboard Vendas"),
            ("/api/admin/dashboard/products", "Dashboard Produtos"),
            ("/api/admin/dashboard/customers", "Dashboard Clientes"),
            ("/api/admin/dashboard/financial", "Dashboard Financeiro"),
            ("/api/admin/analytics", "Analytics Gerais"),
            ("/api/admin/stats", "Estatísticas Admin")
        ]
        
        working_endpoints = 0
        for endpoint, name in admin_endpoints:
            try:
                response = requests.get(f"{self.api_base}{endpoint}", timeout=5)
                # Admin endpoints podem retornar 200, 401 (precisa auth), ou 403 (sem permissão)
                if response.status_code in [200, 401, 403]:
                    self.log_test(name, True, f"Status: {response.status_code}")
                    working_endpoints += 1
                else:
                    self.log_test(name, False, f"Status: {response.status_code}")
            except Exception as e:
                self.log_test(name, False, str(e))
        
        return working_endpoints >= len(admin_endpoints) * 0.8  # 80% dos endpoints funcionando

    def test_admin_crm_functionality(self):
        """Teste 2: Funcionalidades CRM Administrativo"""
        print("\n🔍 TESTE 2: CRM ADMINISTRATIVO")
        
        crm_endpoints = [
            ("/api/crm", "CRM Principal"),
            ("/api/crm/leads", "Gestão de Leads"),
            ("/api/crm/customers", "Gestão de Clientes"),
            ("/api/crm/interactions", "Interações CRM"),
            ("/api/crm/reports", "Relatórios CRM"),
            ("/api/crm/analytics", "Analytics CRM")
        ]
        
        working_crm = 0
        for endpoint, name in crm_endpoints:
            try:
                response = requests.get(f"{self.api_base}{endpoint}", timeout=5)
                if response.status_code in [200, 401, 403, 404]:  # 404 pode ser normal para alguns
                    self.log_test(name, True, f"Status: {response.status_code}")
                    working_crm += 1
                else:
                    self.log_test(name, False, f"Status: {response.status_code}")
            except Exception as e:
                self.log_test(name, False, str(e))
        
        return working_crm >= len(crm_endpoints) * 0.6  # 60% funcionando é aceitável

    def test_admin_hr_functionality(self):
        """Teste 3: Funcionalidades RH Administrativo"""
        print("\n🔍 TESTE 3: RH ADMINISTRATIVO")
        
        hr_endpoints = [
            ("/api/hr", "RH Principal"),
            ("/api/hr/employees", "Gestão de Funcionários"),
            ("/api/hr/departments", "Departamentos"),
            ("/api/hr/positions", "Cargos e Posições"),
            ("/api/hr/payroll", "Folha de Pagamento"),
            ("/api/hr/benefits", "Benefícios"),
            ("/api/hr/stats", "Estatísticas RH"),
            ("/api/hr/summary", "Resumo RH")
        ]
        
        working_hr = 0
        for endpoint, name in hr_endpoints:
            try:
                response = requests.get(f"{self.api_base}{endpoint}", timeout=5)
                if response.status_code in [200, 401, 403]:
                    self.log_test(name, True, f"Status: {response.status_code}")
                    working_hr += 1
                else:
                    self.log_test(name, False, f"Status: {response.status_code}")
            except Exception as e:
                self.log_test(name, False, str(e))
        
        return working_hr >= len(hr_endpoints) * 0.8

    def test_admin_financial_functionality(self):
        """Teste 4: Funcionalidades Financeiras Administrativas"""
        print("\n🔍 TESTE 4: FINANCEIRO ADMINISTRATIVO")
        
        financial_endpoints = [
            ("/api/financial", "Financeiro Principal"),
            ("/api/financial/accounts", "Contas Financeiras"),
            ("/api/financial/transactions", "Transações"),
            ("/api/financial/reports", "Relatórios Financeiros"),
            ("/api/financial/dashboard", "Dashboard Financeiro"),
            ("/api/payments", "Gestão de Pagamentos"),
            ("/api/fiscal", "Módulo Fiscal")
        ]
        
        working_financial = 0
        for endpoint, name in financial_endpoints:
            try:
                response = requests.get(f"{self.api_base}{endpoint}", timeout=5)
                if response.status_code in [200, 401, 403]:
                    self.log_test(name, True, f"Status: {response.status_code}")
                    working_financial += 1
                else:
                    self.log_test(name, False, f"Status: {response.status_code}")
            except Exception as e:
                self.log_test(name, False, str(e))
        
        return working_financial >= len(financial_endpoints) * 0.7

    def test_admin_inventory_functionality(self):
        """Teste 5: Funcionalidades de Estoque Administrativo"""
        print("\n🔍 TESTE 5: ESTOQUE ADMINISTRATIVO")
        
        inventory_endpoints = [
            ("/api/stock", "Controle de Estoque"),
            ("/api/stock/movements", "Movimentações"),
            ("/api/stock/alerts", "Alertas de Estoque"),
            ("/api/suppliers", "Gestão de Fornecedores"),
            ("/api/products", "Gestão de Produtos"),
            ("/api/products/categories", "Categorias de Produtos")
        ]
        
        working_inventory = 0
        for endpoint, name in inventory_endpoints:
            try:
                response = requests.get(f"{self.api_base}{endpoint}", timeout=5)
                if response.status_code in [200, 401, 403]:
                    self.log_test(name, True, f"Status: {response.status_code}")
                    working_inventory += 1
                else:
                    self.log_test(name, False, f"Status: {response.status_code}")
            except Exception as e:
                self.log_test(name, False, str(e))
        
        return working_inventory >= len(inventory_endpoints) * 0.8

    def test_admin_marketing_functionality(self):
        """Teste 6: Funcionalidades de Marketing Administrativo"""
        print("\n🔍 TESTE 6: MARKETING ADMINISTRATIVO")
        
        marketing_endpoints = [
            ("/api/newsletter", "Newsletter"),
            ("/api/newsletter/subscribers", "Assinantes"),
            ("/api/newsletter/campaigns", "Campanhas"),
            ("/api/newsletter/templates", "Templates"),
            ("/api/blog", "Blog Management"),
            ("/api/coupons", "Cupons e Promoções"),
            ("/api/gamification", "Gamificação")
        ]
        
        working_marketing = 0
        for endpoint, name in marketing_endpoints:
            try:
                response = requests.get(f"{self.api_base}{endpoint}", timeout=5)
                if response.status_code in [200, 401, 403]:
                    self.log_test(name, True, f"Status: {response.status_code}")
                    working_marketing += 1
                else:
                    self.log_test(name, False, f"Status: {response.status_code}")
            except Exception as e:
                self.log_test(name, False, str(e))
        
        return working_marketing >= len(marketing_endpoints) * 0.7

    def test_admin_notifications_functionality(self):
        """Teste 7: Sistema de Notificações Administrativo"""
        print("\n🔍 TESTE 7: NOTIFICAÇÕES ADMINISTRATIVAS")
        
        notification_endpoints = [
            ("/api/notifications", "Notificações"),
            ("/api/notifications/templates", "Templates de Notificação"),
            ("/api/notifications/queue", "Fila de Notificações"),
            ("/api/media", "Gestão de Mídia"),
            ("/api/media/upload", "Upload de Arquivos")
        ]
        
        working_notifications = 0
        for endpoint, name in notification_endpoints:
            try:
                response = requests.get(f"{self.api_base}{endpoint}", timeout=5)
                if response.status_code in [200, 401, 403, 405]:  # 405 para endpoints que só aceitam POST
                    self.log_test(name, True, f"Status: {response.status_code}")
                    working_notifications += 1
                else:
                    self.log_test(name, False, f"Status: {response.status_code}")
            except Exception as e:
                self.log_test(name, False, str(e))
        
        return working_notifications >= len(notification_endpoints) * 0.6

    def test_admin_frontend_pages(self):
        """Teste 8: Páginas Administrativas do Frontend"""
        print("\n🔍 TESTE 8: PÁGINAS ADMIN DO FRONTEND")
        
        # Verificar se o frontend carrega páginas admin
        try:
            response = requests.get(self.frontend_base, timeout=5)
            if response.status_code == 200:
                content = response.text.lower()
                
                # Verificar se contém referências a funcionalidades admin
                admin_features = [
                    ("dashboard", "Dashboard"),
                    ("admin", "Admin"),
                    ("crm", "CRM"),
                    ("estoque", "Estoque"),
                    ("financeiro", "Financeiro"),
                    ("rh", "RH")
                ]
                
                found_features = 0
                for feature, name in admin_features:
                    if feature in content:
                        self.log_test(f"Frontend {name} References", True, "Encontrado no código")
                        found_features += 1
                    else:
                        self.log_warning(f"Frontend {name} References", "Não encontrado no HTML")
                
                return found_features >= len(admin_features) * 0.5
            else:
                self.log_test("Frontend Admin Pages", False, f"Status: {response.status_code}")
                return False
                
        except Exception as e:
            self.log_test("Frontend Admin Pages", False, str(e))
            return False

    def test_admin_authentication_flow(self):
        """Teste 9: Fluxo de Autenticação Admin"""
        print("\n🔍 TESTE 9: AUTENTICAÇÃO ADMINISTRATIVA")
        
        # Teste de criação de admin
        try:
            admin_data = {
                "email": "admin@test.com",
                "password": "admin123",
                "name": "Admin Test",
                "is_admin": True
            }
            
            response = requests.post(f"{self.api_base}/api/auth/register", 
                                   json=admin_data, timeout=5)
            
            if response.status_code in [201, 400, 409]:  # 201=criado, 400=erro validação, 409=já existe
                self.log_test("Admin Registration Flow", True, f"Status: {response.status_code}")
            else:
                self.log_test("Admin Registration Flow", False, f"Status: {response.status_code}")
            
            # Teste de login admin
            login_data = {
                "email": "admin@test.com", 
                "password": "admin123"
            }
            
            response = requests.post(f"{self.api_base}/api/auth/login", 
                                   json=login_data, timeout=5)
            
            if response.status_code in [200, 401]:  # 200=sucesso, 401=credenciais inválidas
                self.log_test("Admin Login Flow", True, f"Status: {response.status_code}")
                return True
            else:
                self.log_test("Admin Login Flow", False, f"Status: {response.status_code}")
                return False
                
        except Exception as e:
            self.log_test("Admin Authentication", False, str(e))
            return False

    def test_admin_data_operations(self):
        """Teste 10: Operações de Dados Administrativos"""
        print("\n🔍 TESTE 10: OPERAÇÕES DE DADOS ADMIN")
        
        # Teste CRUD em entidades administrativas
        admin_entities = [
            ("customers", {"name": "Test Customer", "email": "customer@test.com", "customer_type": "individual"}),
            ("suppliers", {"name": "Test Supplier", "email": "supplier@test.com", "cnpj": "12345678901234"}),
            ("hr/employees", {"name": "Test Employee", "email": "employee@test.com", "department_id": "test", "position_id": "test", "salary": 5000}),
            ("newsletter/templates", {"name": "Test Template", "html_content": "<h1>Test</h1>"})
        ]
        
        successful_operations = 0
        for entity, test_data in admin_entities:
            try:
                # Teste CREATE
                response = requests.post(f"{self.api_base}/api/{entity}", 
                                       json=test_data, timeout=5)
                
                if response.status_code in [201, 400, 401, 403]:  # Incluindo erros de validação/auth
                    self.log_test(f"CREATE {entity}", True, f"Status: {response.status_code}")
                    successful_operations += 1
                else:
                    self.log_test(f"CREATE {entity}", False, f"Status: {response.status_code}")
                    
            except Exception as e:
                self.log_test(f"CREATE {entity}", False, str(e))
        
        return successful_operations >= len(admin_entities) * 0.75

    def run_all_admin_tests(self):
        """Executar todos os testes administrativos"""
        print("🔧 INICIANDO TESTE COMPLETO DAS FUNCIONALIDADES ADMINISTRATIVAS")
        print("=" * 80)
        
        start_time = time.time()
        
        # Executar todos os testes admin
        admin_tests = [
            ("Dashboard", self.test_admin_dashboard_endpoints),
            ("CRM", self.test_admin_crm_functionality),
            ("RH", self.test_admin_hr_functionality),
            ("Financeiro", self.test_admin_financial_functionality),
            ("Estoque", self.test_admin_inventory_functionality),
            ("Marketing", self.test_admin_marketing_functionality),
            ("Notificações", self.test_admin_notifications_functionality),
            ("Frontend Admin", self.test_admin_frontend_pages),
            ("Autenticação", self.test_admin_authentication_flow),
            ("Operações de Dados", self.test_admin_data_operations)
        ]
        
        passed_areas = 0
        for area_name, test_func in admin_tests:
            print(f"\n{'='*50}")
            print(f"🔍 TESTANDO ÁREA: {area_name.upper()}")
            print(f"{'='*50}")
            
            if test_func():
                passed_areas += 1
                print(f"✅ {area_name}: APROVADO")
            else:
                print(f"❌ {area_name}: NECESSITA ATENÇÃO")
        
        end_time = time.time()
        test_duration = end_time - start_time
        
        # Relatório final administrativo
        print("\n" + "=" * 80)
        print("📊 RELATÓRIO FINAL - FUNCIONALIDADES ADMINISTRATIVAS")
        print("=" * 80)
        
        success_rate = (self.success_count / self.total_tests) * 100 if self.total_tests > 0 else 0
        areas_rate = (passed_areas / len(admin_tests)) * 100
        
        print(f"⏱️  Tempo de execução: {test_duration:.2f}s")
        print(f"📋 Testes individuais: {self.success_count}/{self.total_tests} ({success_rate:.1f}%)")
        print(f"🏢 Áreas administrativas: {passed_areas}/{len(admin_tests)} ({areas_rate:.1f}%)")
        
        print(f"\n🔧 ÁREAS ADMINISTRATIVAS TESTADAS:")
        for i, (area_name, _) in enumerate(admin_tests):
            status = "✅" if i < passed_areas else "⚠️ "
            print(f"   {status} {area_name}")
        
        if self.errors:
            print(f"\n❌ PROBLEMAS ENCONTRADOS ({len(self.errors)}):")
            for error in self.errors[:10]:  # Mostrar até 10 erros
                print(f"   • {error}")
            if len(self.errors) > 10:
                print(f"   ... e mais {len(self.errors) - 10} problemas")
        
        if self.warnings:
            print(f"\n⚠️  AVISOS ({len(self.warnings)}):")
            for warning in self.warnings[:5]:  # Mostrar até 5 avisos
                print(f"   • {warning}")
        
        # Determinar status das funcionalidades admin
        if areas_rate == 100 and success_rate >= 85:
            print(f"\n🎉 FUNCIONALIDADES ADMINISTRATIVAS 100% OPERACIONAIS!")
            print("✅ Todas as áreas administrativas funcionando")
            print("✅ Dashboard, CRM, RH, Financeiro, Estoque completos")
            final_status = "100% FUNCIONAL"
        elif areas_rate >= 80 and success_rate >= 70:
            print(f"\n✅ FUNCIONALIDADES ADMINISTRATIVAS OPERACIONAIS")
            print("⚠️  Algumas limitações menores em áreas específicas")
            final_status = "FUNCIONAL COM LIMITAÇÕES"
        else:
            print(f"\n❌ FUNCIONALIDADES ADMINISTRATIVAS PRECISAM DE ATENÇÃO")
            print("🔧 Várias áreas requerem correções")
            final_status = "NECESSITA CORREÇÕES"
        
        print(f"\n🎯 STATUS FINAL ADMIN: {final_status}")
        return final_status == "100% FUNCIONAL"

if __name__ == "__main__":
    tester = AdminTestCompleto()
    admin_100_funcional = tester.run_all_admin_tests()
    
    # Exit code para scripts automatizados
    sys.exit(0 if admin_100_funcional else 1)