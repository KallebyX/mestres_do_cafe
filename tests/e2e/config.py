"""
Configuração para testes E2E - Mestres do Café
"""
import os
from dataclasses import dataclass
from typing import Dict, Any

@dataclass
class TestConfig:
    """Configurações para os testes E2E"""
    
    # URLs base
    FRONTEND_URL: str = "http://localhost:3000"
    API_URL: str = "http://localhost:5001"
    
    # Timeouts (em segundos)
    DEFAULT_TIMEOUT: int = 30
    PAGE_LOAD_TIMEOUT: int = 60
    API_TIMEOUT: int = 10
    
    # Dados de teste
    TEST_USERS: Dict[str, Dict[str, Any]] = None
    TEST_PRODUCTS: Dict[str, Dict[str, Any]] = None
    
    # Configurações de pagamento (Sandbox)
    MERCADO_PAGO_SANDBOX: bool = True
    
    # Logs e relatórios
    SCREENSHOTS_DIR: str = "tests/e2e/screenshots"
    REPORTS_DIR: str = "tests/e2e/reports"
    LOGS_DIR: str = "tests/e2e/logs"
    
    def __post_init__(self):
        """Inicializa dados de teste após criação da instância"""
        if self.TEST_USERS is None:
            # OBRIGATÓRIO: Definir TEST_PASSWORD como variável de ambiente
            # Para testes locais: export TEST_PASSWORD="sua_senha_de_teste"
            # Para CI/CD: configurar variável de ambiente no pipeline
            test_password = os.getenv("TEST_PASSWORD")
            
            if not test_password:
                raise ValueError(
                    "TEST_PASSWORD environment variable is required for E2E tests.\n"
                    "Set it with: export TEST_PASSWORD='your_test_password'\n"
                    "This ensures no hardcoded passwords in the codebase."
                )
            
            self.TEST_USERS = {
                "admin": {
                    "email": "admin@test.com",
                    "password": test_password,
                    "username": "admin",
                    "first_name": "Admin",
                    "last_name": "User",
                    "is_admin": True
                },
                "user": {
                    "email": "user@test.com", 
                    "password": test_password,
                    "username": "user",
                    "first_name": "Regular",
                    "last_name": "User",
                    "is_admin": False
                },
                "test_pf": {
                    "email": "teste.pf@exemplo.com",
                    "password": test_password,
                    "name": "João Silva",
                    "cpf_cnpj": "11144477735",  # CPF válido para testes
                    "phone": "(11) 99999-9999",
                    "accountType": "individual"
                },
                "test_pj": {
                    "email": "teste.pj@empresa.com", 
                    "password": test_password,
                    "name": "Empresa Teste LTDA",
                    "company_name": "Empresa Teste LTDA",
                    "cpf_cnpj": "11444777000161",  # CNPJ válido para testes
                    "phone": "(11) 88888-8888",
                    "accountType": "business"
                }
            }
            
        if self.TEST_PRODUCTS is None:
            self.TEST_PRODUCTS = {
                "cafe_especial": {
                    "name": "Café Especial Teste",
                    "description": "Café especial para testes E2E",
                    "price": 29.99,
                    "category": "Especiais",
                    "stock": 100
                },
                "cafe_tradicional": {
                    "name": "Café Tradicional Teste",
                    "description": "Café tradicional para testes E2E", 
                    "price": 19.99,
                    "category": "Tradicionais",
                    "stock": 50
                }
            }
        
        # Criar diretórios se não existirem
        for directory in [self.SCREENSHOTS_DIR, self.REPORTS_DIR, self.LOGS_DIR]:
            os.makedirs(directory, exist_ok=True)

# Instância global de configuração
config = TestConfig()

# Configurações de ambiente
if os.getenv("TEST_ENV") == "ci":
    config.DEFAULT_TIMEOUT = 60
    config.PAGE_LOAD_TIMEOUT = 120
    
if os.getenv("FRONTEND_URL"):
    config.FRONTEND_URL = os.getenv("FRONTEND_URL")
    
if os.getenv("API_URL"):
    config.API_URL = os.getenv("API_URL")