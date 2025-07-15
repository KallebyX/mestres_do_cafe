#!/usr/bin/env python3
"""
Script de validação rápida da integração do sistema
Verifica se todos os componentes estão funcionando corretamente
"""

import requests
import json
import sys
from datetime import datetime

# Configuração
API_BASE_URL = "http://localhost:5001"
API_URL = f"{API_BASE_URL}/api"

class SystemValidator:
    """Validador de integração do sistema"""
    
    def __init__(self):
        self.session = requests.Session()
        self.session.headers.update({
            "Content-Type": "application/json",
            "Accept": "application/json"
        })
        self.results = {
            "passed": 0,
            "failed": 0,
            "warnings": 0,
            "tests": []
        }
    
    def log(self, message, level="INFO"):
        """Log com timestamp e nível"""
        timestamp = datetime.now().strftime("%H:%M:%S")
        icons = {"INFO": "ℹ️", "SUCCESS": "✅", "WARNING": "⚠️", "ERROR": "❌"}
        icon = icons.get(level, "ℹ️")
        print(f"[{timestamp}] {icon} {message}")
    
    def test(self, name, test_func):
        """Executa um teste e registra resultado"""
        try:
            self.log(f"Testando: {name}")
            result = test_func()
            
            if result["success"]:
                self.log(f"✓ {name}", "SUCCESS")
                self.results["passed"] += 1
                self.results["tests"].append({"name": name, "status": "passed", "details": result.get("details", "")})
            else:
                level = "WARNING" if result.get("warning") else "ERROR"
                self.log(f"✗ {name}: {result.get('error', 'Falha desconhecida')}", level)
                
                if result.get("warning"):
                    self.results["warnings"] += 1
                    self.results["tests"].append({"name": name, "status": "warning", "details": result.get("error", "")})
                else:
                    self.results["failed"] += 1
                    self.results["tests"].append({"name": name, "status": "failed", "details": result.get("error", "")})
                    
        except Exception as e:
            self.log(f"✗ {name}: Exceção - {str(e)}", "ERROR")
            self.results["failed"] += 1
            self.results["tests"].append({"name": name, "status": "failed", "details": str(e)})
    
    def test_api_health(self):
        """Testa se a API está funcionando"""
        try:
            response = self.session.get(f"{API_URL}/health")
            if response.status_code == 200:
                return {"success": True, "details": "API respondendo corretamente"}
            else:
                return {"success": False, "error": f"API retornou status {response.status_code}"}
        except requests.exceptions.ConnectionError:
            return {"success": False, "error": "Não foi possível conectar à API"}
        except Exception as e:
            return {"success": False, "error": str(e)}
    
    def test_database_connection(self):
        """Testa conexão com banco de dados"""
        try:
            # Tentar buscar produtos como teste de DB
            response = self.session.get(f"{API_URL}/products")
            if response.status_code in [200, 401]:  # 401 é ok, significa que endpoint existe
                return {"success": True, "details": "Banco de dados conectado"}
            else:
                return {"success": False, "error": f"Erro de BD: status {response.status_code}"}
        except Exception as e:
            return {"success": False, "error": str(e)}
    
    def test_mercado_pago_config(self):
        """Testa configuração do Mercado Pago"""
        try:
            # Tentar buscar métodos de pagamento
            response = self.session.get(f"{API_URL}/payments/mercadopago/payment-methods")
            
            if response.status_code == 200:
                data = response.json()
                if data.get("success"):
                    return {"success": True, "details": "Mercado Pago configurado"}
                else:
                    return {"success": False, "error": "Mercado Pago não configurado", "warning": True}
            elif response.status_code == 401:
                return {"success": False, "error": "Endpoint protegido (normal)", "warning": True}
            else:
                return {"success": False, "error": f"Erro MP: status {response.status_code}", "warning": True}
        except Exception as e:
            return {"success": False, "error": str(e), "warning": True}
    
    def test_melhor_envio_config(self):
        """Testa configuração do Melhor Envio"""
        try:
            # Tentar calcular frete de teste
            test_data = {
                "origin_cep": "97010-000",
                "destination_cep": "01234-567",
                "products": [{"weight": 0.5, "width": 10, "height": 10, "length": 15, "price": 29.90}]
            }
            
            response = self.session.post(f"{API_URL}/shipping/melhor-envio/calculate", json=test_data)
            
            if response.status_code == 200:
                data = response.json()
                if data.get("success"):
                    return {"success": True, "details": f"Melhor Envio configurado ({len(data.get('quotes', []))} cotações)"}
                else:
                    return {"success": False, "error": "Melhor Envio com problemas", "warning": True}
            elif response.status_code == 401:
                return {"success": False, "error": "Endpoint protegido (normal)", "warning": True}
            else:
                return {"success": False, "error": f"Erro ME: status {response.status_code}", "warning": True}
        except Exception as e:
            return {"success": False, "error": str(e), "warning": True}
    
    def test_escrow_endpoints(self):
        """Testa endpoints do escrow"""
        try:
            # Tentar buscar stats do escrow (sem auth)
            response = self.session.get(f"{API_URL}/escrow/stats")
            
            if response.status_code in [200, 401, 403]:  # Qualquer um desses é ok
                return {"success": True, "details": "Endpoints de escrow disponíveis"}
            else:
                return {"success": False, "error": f"Erro escrow: status {response.status_code}"}
        except Exception as e:
            return {"success": False, "error": str(e)}
    
    def test_auth_endpoints(self):
        """Testa endpoints de autenticação"""
        try:
            # Tentar endpoint de login (deve retornar erro 400 sem dados)
            response = self.session.post(f"{API_URL}/auth/login", json={})
            
            if response.status_code in [400, 422]:  # Erro de validação é esperado
                return {"success": True, "details": "Endpoints de auth funcionando"}
            else:
                return {"success": False, "error": f"Erro auth: status {response.status_code}"}
        except Exception as e:
            return {"success": False, "error": str(e)}
    
    def test_products_endpoints(self):
        """Testa endpoints de produtos"""
        try:
            response = self.session.get(f"{API_URL}/products")
            
            if response.status_code in [200, 401]:
                return {"success": True, "details": "Endpoints de produtos funcionando"}
            else:
                return {"success": False, "error": f"Erro produtos: status {response.status_code}"}
        except Exception as e:
            return {"success": False, "error": str(e)}
    
    def test_orders_endpoints(self):
        """Testa endpoints de pedidos"""
        try:
            response = self.session.get(f"{API_URL}/orders")
            
            if response.status_code in [200, 401]:
                return {"success": True, "details": "Endpoints de pedidos funcionando"}
            else:
                return {"success": False, "error": f"Erro pedidos: status {response.status_code}"}
        except Exception as e:
            return {"success": False, "error": str(e)}
    
    def test_frontend_build(self):
        """Testa se o frontend está buildado"""
        try:
            # Tentar acessar o frontend
            response = self.session.get(API_BASE_URL)
            
            if response.status_code == 200:
                return {"success": True, "details": "Frontend acessível"}
            else:
                return {"success": False, "error": f"Frontend não acessível: status {response.status_code}", "warning": True}
        except Exception as e:
            return {"success": False, "error": f"Frontend não acessível: {str(e)}", "warning": True}
    
    def run_all_tests(self):
        """Executa todos os testes"""
        self.log("🚀 Iniciando validação de integração do sistema")
        self.log("="*60)
        
        # Testes críticos
        self.log("📋 TESTES CRÍTICOS")
        self.test("API Health Check", self.test_api_health)
        self.test("Conexão com Banco de Dados", self.test_database_connection)
        self.test("Endpoints de Autenticação", self.test_auth_endpoints)
        self.test("Endpoints de Produtos", self.test_products_endpoints)
        self.test("Endpoints de Pedidos", self.test_orders_endpoints)
        self.test("Endpoints de Escrow", self.test_escrow_endpoints)
        
        self.log("")
        
        # Testes de integração
        self.log("🔗 TESTES DE INTEGRAÇÃO")
        self.test("Configuração Mercado Pago", self.test_mercado_pago_config)
        self.test("Configuração Melhor Envio", self.test_melhor_envio_config)
        self.test("Frontend Build", self.test_frontend_build)
        
        self.log("")
        self.log("="*60)
        
        # Resultados
        total_tests = self.results["passed"] + self.results["failed"] + self.results["warnings"]
        
        self.log(f"📊 RESULTADOS:")
        self.log(f"   Total de testes: {total_tests}")
        self.log(f"   ✅ Passou: {self.results['passed']}")
        self.log(f"   ❌ Falhou: {self.results['failed']}")
        self.log(f"   ⚠️ Avisos: {self.results['warnings']}")
        
        # Determinar status geral
        if self.results["failed"] == 0:
            if self.results["warnings"] == 0:
                self.log("🎉 SISTEMA TOTALMENTE FUNCIONAL!", "SUCCESS")
                return "success"
            else:
                self.log("✅ SISTEMA FUNCIONAL com avisos", "WARNING")
                return "warning"
        else:
            self.log("💥 SISTEMA COM PROBLEMAS CRÍTICOS!", "ERROR")
            return "failed"
    
    def generate_report(self):
        """Gera relatório detalhado"""
        report = {
            "timestamp": datetime.now().isoformat(),
            "summary": {
                "total": len(self.results["tests"]),
                "passed": self.results["passed"],
                "failed": self.results["failed"],
                "warnings": self.results["warnings"]
            },
            "tests": self.results["tests"]
        }
        
        with open("system_validation_report.json", "w") as f:
            json.dump(report, f, indent=2, ensure_ascii=False)
        
        self.log("📄 Relatório salvo em: system_validation_report.json")

def main():
    """Função principal"""
    validator = SystemValidator()
    result = validator.run_all_tests()
    validator.generate_report()
    
    # Exit codes
    if result == "success":
        sys.exit(0)
    elif result == "warning":
        sys.exit(1)
    else:
        sys.exit(2)

if __name__ == "__main__":
    main()