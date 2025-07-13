#!/usr/bin/env python3
"""
Script de teste automatizado para todos os endpoints da API
Mestres do Café Enterprise
"""

import json
import requests
import uuid
from datetime import datetime
from typing import Dict, List, Any

# Configuração da API
BASE_URL = "http://localhost:5001"
API_URL = f"{BASE_URL}/api"

# Cores para output
GREEN = '\033[92m'
RED = '\033[91m'
YELLOW = '\033[93m'
BLUE = '\033[94m'
END = '\033[0m'

class APITester:
    def __init__(self):
        self.results = []
        self.session = requests.Session()
        self.session.headers.update({
            'Content-Type': 'application/json',
            'User-Agent': 'API-Tester/1.0'
        })
    
    def log_result(self, endpoint: str, method: str, status_code: int, success: bool, message: str = ""):
        """Registra resultado do teste"""
        self.results.append({
            'endpoint': endpoint,
            'method': method,
            'status_code': status_code,
            'success': success,
            'message': message,
            'timestamp': datetime.now().isoformat()
        })
        
        # Print resultado imediato
        color = GREEN if success else RED
        print(f"{color}{'✓' if success else '✗'} {method} {endpoint} - {status_code}{END}")
        if message:
            print(f"  {message}")
    
    def test_endpoint(self, endpoint: str, method: str = "GET", data: Dict = None, expected_status: List[int] = None):
        """Testa um endpoint específico"""
        if expected_status is None:
            expected_status = [200, 201]
        
        url = f"{API_URL}{endpoint}"
        
        try:
            if method == "GET":
                response = self.session.get(url, timeout=10)
            elif method == "POST":
                response = self.session.post(url, json=data, timeout=10)
            elif method == "PUT":
                response = self.session.put(url, json=data, timeout=10)
            elif method == "DELETE":
                response = self.session.delete(url, timeout=10)
            else:
                raise ValueError(f"Método não suportado: {method}")
            
            success = response.status_code in expected_status
            message = ""
            
            if not success:
                try:
                    error_data = response.json()
                    message = error_data.get('error', 'Erro desconhecido')
                except:
                    message = response.text[:100] if response.text else "Sem resposta"
            
            self.log_result(endpoint, method, response.status_code, success, message)
            return response
            
        except requests.exceptions.RequestException as e:
            self.log_result(endpoint, method, 0, False, str(e))
            return None
    
    def test_basic_endpoints(self):
        """Testa endpoints básicos da API"""
        print(f"\n{BLUE}=== TESTANDO ENDPOINTS BÁSICOS ==={END}")
        
        # Health check
        self.test_endpoint("/health")
        
        # API Info
        self.test_endpoint("/info")
        
        # Testimonials
        self.test_endpoint("/testimonials")
    
    def test_product_endpoints(self):
        """Testa endpoints de produtos"""
        print(f"\n{BLUE}=== TESTANDO ENDPOINTS DE PRODUTOS ==={END}")
        
        # Listar produtos
        response = self.test_endpoint("/products")
        
        if response and response.status_code == 200:
            try:
                data = response.json()
                products = data.get('products', [])
                
                if products:
                    # Testar produto específico
                    product_id = products[0]['id']
                    self.test_endpoint(f"/products/{product_id}")
                
            except json.JSONDecodeError:
                pass
    
    def test_customer_endpoints(self):
        """Testa endpoints de customers"""
        print(f"\n{BLUE}=== TESTANDO ENDPOINTS DE CUSTOMERS ==={END}")
        
        # Listar customers
        self.test_endpoint("/customers")
    
    def test_order_endpoints(self):
        """Testa endpoints de pedidos"""
        print(f"\n{BLUE}=== TESTANDO ENDPOINTS DE PEDIDOS ==={END}")
        
        # Listar pedidos
        self.test_endpoint("/orders")
    
    def test_cart_endpoints(self):
        """Testa endpoints de carrinho"""
        print(f"\n{BLUE}=== TESTANDO ENDPOINTS DE CARRINHO ==={END}")
        
        # Carrinho base
        self.test_endpoint("/cart")
        
        # Carrinho com user_id
        test_user_id = str(uuid.uuid4())
        self.test_endpoint(f"/cart?user_id={test_user_id}")
        
        # Count
        self.test_endpoint(f"/cart/count?user_id={test_user_id}")
    
    def test_wishlist_endpoints(self):
        """Testa endpoints de wishlist"""
        print(f"\n{BLUE}=== TESTANDO ENDPOINTS DE WISHLIST ==={END}")
        
        # Wishlist com UUID válido
        test_user_id = str(uuid.uuid4())
        self.test_endpoint(f"/wishlist?user_id={test_user_id}")
        
        # Wishlist sem user_id (deve dar erro)
        self.test_endpoint("/wishlist", expected_status=[400])
    
    def test_reviews_endpoints(self):
        """Testa endpoints de reviews"""
        print(f"\n{BLUE}=== TESTANDO ENDPOINTS DE REVIEWS ==={END}")
        
        # Listar reviews
        self.test_endpoint("/reviews")
    
    def test_auth_endpoints(self):
        """Testa endpoints de autenticação"""
        print(f"\n{BLUE}=== TESTANDO ENDPOINTS DE AUTENTICAÇÃO ==={END}")
        
        # Login com dados inválidos
        login_data = {
            "email": "test@example.com",
            "password": "wrongpassword"
        }
        self.test_endpoint("/auth/login", "POST", login_data, [400, 401])
    
    def test_payment_endpoints(self):
        """Testa endpoints de pagamento"""
        print(f"\n{BLUE}=== TESTANDO ENDPOINTS DE PAGAMENTO ==={END}")
        
        # Página inicial de pagamentos
        self.test_endpoint("/payments")
        
        # Métodos de pagamento
        self.test_endpoint("/payments/methods")
    
    def test_checkout_endpoints(self):
        """Testa endpoints de checkout"""
        print(f"\n{BLUE}=== TESTANDO ENDPOINTS DE CHECKOUT ==={END}")
        
        # Página inicial de checkout
        self.test_endpoint("/checkout")
        
        # Validar checkout (sem dados - deve falhar)
        self.test_endpoint("/checkout/validate", "POST", {}, [400])
        
        # Sucesso com order_id
        self.test_endpoint(f"/checkout/success?order_id={uuid.uuid4()}")
    
    def test_shipping_endpoints(self):
        """Testa endpoints de frete"""
        print(f"\n{BLUE}=== TESTANDO ENDPOINTS DE FRETE ==={END}")
        
        # Página inicial de frete
        self.test_endpoint("/shipping")
        
        # Serviços de frete
        self.test_endpoint("/shipping/services")
        
        # Consultar CEP
        self.test_endpoint("/shipping/cep/01310-100")
    
    def test_blog_endpoints(self):
        """Testa endpoints de blog"""
        print(f"\n{BLUE}=== TESTANDO ENDPOINTS DE BLOG ==={END}")
        
        # Página inicial do blog
        self.test_endpoint("/blog")
        
        # Posts do blog
        self.test_endpoint("/blog/posts")
        
        # Categorias
        self.test_endpoint("/blog/categories")
        
        # Tags
        self.test_endpoint("/blog/tags")
    
    def test_newsletter_endpoints(self):
        """Testa endpoints de newsletter"""
        print(f"\n{BLUE}=== TESTANDO ENDPOINTS DE NEWSLETTER ==={END}")
        
        # Página inicial de newsletter
        self.test_endpoint("/newsletter")
        
        # Templates
        self.test_endpoint("/newsletter/templates")
        
        # Campanhas
        self.test_endpoint("/newsletter/campaigns")
    
    def test_gamification_endpoints(self):
        """Testa endpoints de gamificação"""
        print(f"\n{BLUE}=== TESTANDO ENDPOINTS DE GAMIFICAÇÃO ==={END}")
        
        # Página inicial de gamificação
        self.test_endpoint("/gamification")
        
        # Badges
        self.test_endpoint("/gamification/badges")
        
        # Achievements
        self.test_endpoint("/gamification/achievements")
        
        # Challenges
        self.test_endpoint("/gamification/challenges")
        
        # Rewards
        self.test_endpoint("/gamification/rewards")
    
    def test_financial_endpoints(self):
        """Testa endpoints financeiros"""
        print(f"\n{BLUE}=== TESTANDO ENDPOINTS FINANCEIROS ==={END}")
        
        # Página inicial financeira
        self.test_endpoint("/financial")
        
        # Contas
        self.test_endpoint("/financial/accounts")
        
        # Transações
        self.test_endpoint("/financial/transactions")
        
        # Categorias
        self.test_endpoint("/financial/categories")
        
        # Estatísticas
        self.test_endpoint("/financial/stats")
    
    def test_hr_endpoints(self):
        """Testa endpoints de RH"""
        print(f"\n{BLUE}=== TESTANDO ENDPOINTS DE RH ==={END}")
        
        # Página inicial de RH
        self.test_endpoint("/hr")
        
        # Funcionários
        self.test_endpoint("/hr/employees")
        
        # Departamentos
        self.test_endpoint("/hr/departments")
        
        # Posições
        self.test_endpoint("/hr/positions")
        
        # Benefícios
        self.test_endpoint("/hr/benefits")
        
        # Estatísticas
        self.test_endpoint("/hr/stats")
    
    def test_advanced_endpoints(self):
        """Testa endpoints avançados"""
        print(f"\n{BLUE}=== TESTANDO ENDPOINTS AVANÇADOS ==={END}")
        
        # Leads
        self.test_endpoint("/leads")
        
        # Cupons
        self.test_endpoint("/coupons")
        
        # Notificações (sem user_id - deve falhar)
        self.test_endpoint("/notifications", expected_status=[400])
        
        # Notificações com UUID válido
        test_user_id = str(uuid.uuid4())
        self.test_endpoint(f"/notifications?user_id={test_user_id}", expected_status=[200])  # Retorna lista vazia para user_id válido
        
        # Media
        self.test_endpoint("/media")
    
    def run_all_tests(self):
        """Executa todos os testes"""
        print(f"{YELLOW}Iniciando testes da API Mestres do Café Enterprise...{END}")
        print(f"Base URL: {API_URL}")
        print(f"Timestamp: {datetime.now().isoformat()}")
        
        # Executar todos os testes
        self.test_basic_endpoints()
        self.test_product_endpoints()
        self.test_customer_endpoints()
        self.test_order_endpoints()
        self.test_cart_endpoints()
        self.test_wishlist_endpoints()
        self.test_reviews_endpoints()
        self.test_auth_endpoints()
        self.test_payment_endpoints()
        self.test_checkout_endpoints()
        self.test_shipping_endpoints()
        self.test_blog_endpoints()
        self.test_newsletter_endpoints()
        self.test_gamification_endpoints()
        self.test_financial_endpoints()
        self.test_hr_endpoints()
        self.test_advanced_endpoints()
        
        # Gerar relatório
        self.generate_report()
    
    def generate_report(self):
        """Gera relatório final dos testes"""
        print(f"\n{BLUE}=== RELATÓRIO FINAL ==={END}")
        
        total_tests = len(self.results)
        successful_tests = sum(1 for r in self.results if r['success'])
        failed_tests = total_tests - successful_tests
        
        success_rate = (successful_tests / total_tests * 100) if total_tests > 0 else 0
        
        print(f"Total de testes: {total_tests}")
        print(f"{GREEN}Sucessos: {successful_tests}{END}")
        print(f"{RED}Falhas: {failed_tests}{END}")
        print(f"Taxa de sucesso: {success_rate:.1f}%")
        
        # Listar falhas
        if failed_tests > 0:
            print(f"\n{RED}=== FALHAS DETECTADAS ==={END}")
            for result in self.results:
                if not result['success']:
                    print(f"{RED}✗ {result['method']} {result['endpoint']} - {result['status_code']}{END}")
                    if result['message']:
                        print(f"  {result['message']}")
        
        # Salvar relatório em arquivo
        self.save_report_to_file()
    
    def save_report_to_file(self):
        """Salva relatório em arquivo JSON"""
        report_data = {
            'timestamp': datetime.now().isoformat(),
            'total_tests': len(self.results),
            'successful_tests': sum(1 for r in self.results if r['success']),
            'failed_tests': sum(1 for r in self.results if not r['success']),
            'success_rate': (sum(1 for r in self.results if r['success']) / len(self.results) * 100) if self.results else 0,
            'results': self.results
        }
        
        filename = f"api_test_report_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
        
        try:
            with open(filename, 'w', encoding='utf-8') as f:
                json.dump(report_data, f, indent=2, ensure_ascii=False)
            print(f"\n{GREEN}Relatório salvo em: {filename}{END}")
        except Exception as e:
            print(f"\n{RED}Erro ao salvar relatório: {e}{END}")

def main():
    """Função principal"""
    tester = APITester()
    
    try:
        tester.run_all_tests()
    except KeyboardInterrupt:
        print(f"\n{YELLOW}Testes interrompidos pelo usuário{END}")
    except Exception as e:
        print(f"\n{RED}Erro durante os testes: {e}{END}")
    finally:
        if tester.results:
            tester.generate_report()

if __name__ == "__main__":
    main()