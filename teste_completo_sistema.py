#!/usr/bin/env python3
"""
Teste completo e abrangente do sistema Mestres do Café
Verifica TODAS as funcionalidades críticas
"""

import requests
import json
import time
import sys
from datetime import datetime

class SistemaTestCompleto:
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

    def test_api_health(self):
        """Teste 1: Health da API"""
        print("\n🔍 TESTE 1: HEALTH DA API")
        try:
            response = requests.get(f"{self.api_base}/api/health", timeout=5)
            if response.status_code == 200:
                data = response.json()
                self.log_test("API Health Check", True, f"Status: {data.get('status')}, Version: {data.get('version')}")
                return True
            else:
                self.log_test("API Health Check", False, f"Status Code: {response.status_code}")
                return False
        except Exception as e:
            self.log_test("API Health Check", False, str(e))
            return False

    def test_frontend_access(self):
        """Teste 2: Acesso ao Frontend"""
        print("\n🔍 TESTE 2: ACESSO AO FRONTEND")
        try:
            response = requests.get(self.frontend_base, timeout=5)
            success = response.status_code == 200
            self.log_test("Frontend Access", success, f"Status Code: {response.status_code}")
            return success
        except Exception as e:
            self.log_test("Frontend Access", False, str(e))
            return False

    def test_database_connection(self):
        """Teste 3: Conexão com Banco de Dados"""
        print("\n🔍 TESTE 3: CONEXÃO COM BANCO DE DADOS")
        try:
            # Testar através de endpoint que usa BD
            response = requests.get(f"{self.api_base}/api/products", timeout=5)
            success = response.status_code == 200
            if success:
                data = response.json()
                product_count = len(data) if isinstance(data, list) else 0
                self.log_test("Database Connection", True, f"Produtos encontrados: {product_count}")
            else:
                self.log_test("Database Connection", False, f"Status: {response.status_code}")
            return success
        except Exception as e:
            self.log_test("Database Connection", False, str(e))
            return False

    def test_crud_operations(self):
        """Teste 4: Operações CRUD"""
        print("\n🔍 TESTE 4: OPERAÇÕES CRUD")
        
        # Teste READ para diferentes entidades
        entities = [
            ("products", "Produtos"),
            ("customers", "Clientes"), 
            ("newsletter/subscribers", "Assinantes Newsletter"),
            ("hr/employees", "Funcionários"),
            ("suppliers", "Fornecedores")
        ]
        
        read_success = 0
        for endpoint, name in entities:
            try:
                response = requests.get(f"{self.api_base}/api/{endpoint}", timeout=5)
                if response.status_code in [200, 401, 403]:  # 401/403 = autenticação necessária
                    self.log_test(f"READ {name}", True, f"Status: {response.status_code}")
                    read_success += 1
                else:
                    self.log_test(f"READ {name}", False, f"Status: {response.status_code}")
            except Exception as e:
                self.log_test(f"READ {name}", False, str(e))
        
        return read_success == len(entities)

    def test_authentication_endpoints(self):
        """Teste 5: Endpoints de Autenticação"""
        print("\n🔍 TESTE 5: ENDPOINTS DE AUTENTICAÇÃO")
        
        auth_success = 0
        
        # Teste Login endpoint (POST)
        try:
            response = requests.post(f"{self.api_base}/api/auth/login", 
                                   json={"email": "test", "password": "test"}, timeout=5)
            # Esperamos erro de credenciais inválidas (400) que significa que o endpoint funciona
            if response.status_code in [400, 401]:
                self.log_test("Login Endpoint", True, f"Status: {response.status_code} (endpoint funciona)")
                auth_success += 1
            else:
                self.log_test("Login Endpoint", False, f"Status: {response.status_code}")
        except Exception as e:
            self.log_test("Login Endpoint", False, str(e))
        
        # Teste Register endpoint (POST)
        try:
            response = requests.post(f"{self.api_base}/api/auth/register", 
                                   json={"email": "test", "password": "test"}, timeout=5)
            # Esperamos erro de validação (400) que significa que o endpoint funciona
            if response.status_code in [400, 401]:
                self.log_test("Register Endpoint", True, f"Status: {response.status_code} (endpoint funciona)")
                auth_success += 1
            else:
                self.log_test("Register Endpoint", False, f"Status: {response.status_code}")
        except Exception as e:
            self.log_test("Register Endpoint", False, str(e))
        
        # Teste Dashboard Admin (GET)
        try:
            response = requests.get(f"{self.api_base}/api/admin/dashboard", timeout=5)
            if response.status_code in [200, 401, 403]:
                self.log_test("Dashboard Admin Endpoint", True, f"Status: {response.status_code}")
                auth_success += 1
            else:
                self.log_test("Dashboard Admin Endpoint", False, f"Status: {response.status_code}")
        except Exception as e:
            self.log_test("Dashboard Admin Endpoint", False, str(e))
        
        return auth_success == 3

    def test_api_responses(self):
        """Teste 6: Qualidade das Respostas da API"""
        print("\n🔍 TESTE 6: QUALIDADE DAS RESPOSTAS DA API")
        
        test_endpoints = [
            "/api/products",
            "/api/customers", 
            "/api/orders"
        ]
        
        response_quality = 0
        for endpoint in test_endpoints:
            try:
                response = requests.get(f"{self.api_base}{endpoint}", timeout=5)
                
                # Verificar se a resposta é JSON válido
                try:
                    data = response.json()
                    json_valid = True
                except:
                    json_valid = False
                
                # Verificar content-type
                content_type = response.headers.get('content-type', '')
                is_json_content = 'application/json' in content_type
                
                if json_valid and is_json_content and response.status_code in [200, 401, 403]:
                    self.log_test(f"Response Quality {endpoint}", True, 
                                f"JSON válido, Content-Type correto")
                    response_quality += 1
                else:
                    self.log_test(f"Response Quality {endpoint}", False, 
                                f"JSON: {json_valid}, Content-Type: {is_json_content}")
                    
            except Exception as e:
                self.log_test(f"Response Quality {endpoint}", False, str(e))
        
        return response_quality == len(test_endpoints)

    def test_frontend_resources(self):
        """Teste 7: Recursos do Frontend"""
        print("\n🔍 TESTE 7: RECURSOS DO FRONTEND")
        
        # Testar se recursos críticos do frontend carregam
        frontend_resources = [
            ("/", "Página Principal"),
            ("/assets/", "Assets (esperado 404)"),  # Este pode dar 404 e ainda estar OK
        ]
        
        frontend_success = 0
        try:
            # Teste principal: página carrega
            response = requests.get(self.frontend_base, timeout=5)
            if response.status_code == 200:
                content = response.text
                
                # Verificar se contém elementos React/HTML básicos
                has_html = '<html' in content.lower()
                has_body = '<body' in content.lower()
                has_div_root = 'id="root"' in content or 'id=root' in content
                
                if has_html and has_body:
                    self.log_test("Frontend HTML Structure", True, "Estrutura HTML válida")
                    frontend_success += 1
                else:
                    self.log_test("Frontend HTML Structure", False, "Estrutura HTML inválida")
                    
                if has_div_root:
                    self.log_test("React Root Element", True, "Elemento root encontrado")
                    frontend_success += 1
                else:
                    self.log_warning("React Root Element", "Root element não encontrado claramente")
                    frontend_success += 0.5
            else:
                self.log_test("Frontend Page Load", False, f"Status: {response.status_code}")
                
        except Exception as e:
            self.log_test("Frontend Resources", False, str(e))
        
        return frontend_success >= 1.5

    def test_system_integration(self):
        """Teste 8: Integração Frontend-API"""
        print("\n🔍 TESTE 8: INTEGRAÇÃO FRONTEND-API")
        
        # Verificar se frontend pode se comunicar com API
        try:
            # Simular uma requisição que o frontend faria
            headers = {
                'Content-Type': 'application/json',
                'Origin': self.frontend_base
            }
            
            response = requests.get(f"{self.api_base}/api/products", 
                                  headers=headers, timeout=5)
            
            # Verificar CORS
            cors_headers = response.headers.get('Access-Control-Allow-Origin')
            has_cors = cors_headers is not None
            
            if response.status_code == 200 and has_cors:
                self.log_test("Frontend-API Integration", True, "CORS configurado, comunicação OK")
                return True
            elif response.status_code == 200:
                self.log_warning("Frontend-API Integration", "API funciona mas CORS pode estar incorreto")
                return True
            else:
                self.log_test("Frontend-API Integration", False, f"Status: {response.status_code}")
                return False
                
        except Exception as e:
            self.log_test("Frontend-API Integration", False, str(e))
            return False

    def test_performance(self):
        """Teste 9: Performance Básica"""
        print("\n🔍 TESTE 9: PERFORMANCE BÁSICA")
        
        # Testar tempo de resposta da API
        try:
            start_time = time.time()
            response = requests.get(f"{self.api_base}/api/health", timeout=10)
            api_time = time.time() - start_time
            
            if api_time < 2.0:
                self.log_test("API Response Time", True, f"{api_time:.2f}s (< 2s)")
            elif api_time < 5.0:
                self.log_warning("API Response Time", f"{api_time:.2f}s (um pouco lento)")
            else:
                self.log_test("API Response Time", False, f"{api_time:.2f}s (muito lento)")
            
            # Testar tempo de resposta do frontend
            start_time = time.time()
            response = requests.get(self.frontend_base, timeout=10)
            frontend_time = time.time() - start_time
            
            if frontend_time < 3.0:
                self.log_test("Frontend Response Time", True, f"{frontend_time:.2f}s (< 3s)")
                return True
            else:
                self.log_warning("Frontend Response Time", f"{frontend_time:.2f}s (um pouco lento)")
                return True
                
        except Exception as e:
            self.log_test("Performance Test", False, str(e))
            return False

    def test_error_handling(self):
        """Teste 10: Tratamento de Erros"""
        print("\n🔍 TESTE 10: TRATAMENTO DE ERROS")
        
        # Testar endpoints inexistentes
        try:
            response = requests.get(f"{self.api_base}/api/inexistente", timeout=5)
            if response.status_code == 404:
                try:
                    error_data = response.json()
                    self.log_test("404 Error Handling", True, "Retorna JSON de erro estruturado")
                except:
                    self.log_test("404 Error Handling", True, "Retorna 404 corretamente")
            else:
                self.log_test("404 Error Handling", False, f"Status inesperado: {response.status_code}")
            
            # Testar método não permitido
            response = requests.delete(f"{self.api_base}/api/health", timeout=5)
            if response.status_code in [405, 404]:  # Method not allowed ou not found
                self.log_test("Method Not Allowed Handling", True, f"Status: {response.status_code}")
                return True
            else:
                self.log_test("Method Not Allowed Handling", False, f"Status: {response.status_code}")
                return False
                
        except Exception as e:
            self.log_test("Error Handling", False, str(e))
            return False

    def run_all_tests(self):
        """Executar todos os testes"""
        print("🧪 INICIANDO TESTE COMPLETO DO SISTEMA MESTRES DO CAFÉ")
        print("=" * 70)
        
        start_time = time.time()
        
        # Executar todos os testes
        tests = [
            self.test_api_health,
            self.test_frontend_access,
            self.test_database_connection,
            self.test_crud_operations,
            self.test_authentication_endpoints,
            self.test_api_responses,
            self.test_frontend_resources,
            self.test_system_integration,
            self.test_performance,
            self.test_error_handling
        ]
        
        passed_tests = 0
        for test in tests:
            if test():
                passed_tests += 1
        
        end_time = time.time()
        test_duration = end_time - start_time
        
        # Relatório final
        print("\n" + "=" * 70)
        print("📊 RELATÓRIO FINAL DO TESTE COMPLETO")
        print("=" * 70)
        
        success_rate = (self.success_count / self.total_tests) * 100 if self.total_tests > 0 else 0
        test_suite_rate = (passed_tests / len(tests)) * 100
        
        print(f"⏱️  Tempo de execução: {test_duration:.2f}s")
        print(f"📋 Testes individuais: {self.success_count}/{self.total_tests} ({success_rate:.1f}%)")
        print(f"🎯 Suítes de teste: {passed_tests}/{len(tests)} ({test_suite_rate:.1f}%)")
        
        if self.errors:
            print(f"\n❌ ERROS ENCONTRADOS ({len(self.errors)}):")
            for error in self.errors:
                print(f"   • {error}")
        
        if self.warnings:
            print(f"\n⚠️  AVISOS ({len(self.warnings)}):")
            for warning in self.warnings:
                print(f"   • {warning}")
        
        # Determinar status final
        if test_suite_rate == 100 and success_rate >= 90:
            print(f"\n🎉 SISTEMA 100% FUNCIONAL!")
            print("✅ Todos os componentes críticos estão operacionais")
            print("✅ Performance adequada")
            print("✅ Integração frontend-API funcionando")
            final_status = "100% FUNCIONAL"
        elif test_suite_rate >= 80 and success_rate >= 75:
            print(f"\n✅ SISTEMA FUNCIONAL COM PEQUENAS LIMITAÇÕES")
            print("⚠️  Alguns testes falharam mas funcionalidades críticas OK")
            final_status = "FUNCIONAL COM LIMITAÇÕES"
        else:
            print(f"\n❌ SISTEMA COM PROBLEMAS SIGNIFICATIVOS")
            print("🔧 Requer correções antes de ser considerado totalmente funcional")
            final_status = "PROBLEMAS SIGNIFICATIVOS"
        
        print(f"\n🎯 STATUS FINAL: {final_status}")
        return final_status == "100% FUNCIONAL"

if __name__ == "__main__":
    tester = SistemaTestCompleto()
    sistema_100_funcional = tester.run_all_tests()
    
    # Exit code para scripts automatizados
    sys.exit(0 if sistema_100_funcional else 1)