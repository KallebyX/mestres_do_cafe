"""
Utilitários para testes E2E - Mestres do Café
"""
import json
import time
import requests
from datetime import datetime
from typing import Dict, Any, Optional, List
from config import config

class APIClient:
    """Cliente para interagir com a API durante os testes"""
    
    def __init__(self, base_url: str = None):
        self.base_url = base_url or config.API_URL
        self.session = requests.Session()
        self.session.timeout = config.API_TIMEOUT
        self.token = None
        
    def set_auth_token(self, token: str):
        """Define o token de autenticação"""
        self.token = token
        self.session.headers.update({
            'Authorization': f'Bearer {token}'
        })
        
    def clear_auth(self):
        """Remove autenticação"""
        self.token = None
        if 'Authorization' in self.session.headers:
            del self.session.headers['Authorization']
            
    def post(self, endpoint: str, data: Dict = None, json_data: Dict = None) -> requests.Response:
        """Faz requisição POST"""
        url = f"{self.base_url}{endpoint}"
        return self.session.post(url, data=data, json=json_data)
        
    def get(self, endpoint: str, params: Dict = None) -> requests.Response:
        """Faz requisição GET"""
        url = f"{self.base_url}{endpoint}"
        return self.session.get(url, params=params)
        
    def put(self, endpoint: str, data: Dict = None, json_data: Dict = None) -> requests.Response:
        """Faz requisição PUT"""
        url = f"{self.base_url}{endpoint}"
        return self.session.put(url, data=data, json=json_data)
        
    def delete(self, endpoint: str) -> requests.Response:
        """Faz requisição DELETE"""
        url = f"{self.base_url}{endpoint}"
        return self.session.delete(url)
        
    def health_check(self) -> bool:
        """Verifica se a API está funcionando"""
        try:
            response = self.get("/api/health")
            return response.status_code == 200
        except:
            return False
            
    def login(self, email: str, password: str) -> Optional[str]:
        """Faz login e retorna o token"""
        try:
            response = self.post("/api/auth/login", json_data={
                "email": email,
                "password": password
            })
            if response.status_code == 200:
                data = response.json()
                token = data.get("token")
                if token:
                    self.set_auth_token(token)
                return token
            return None
        except:
            return None
            
    def register_user(self, user_data: Dict) -> bool:
        """Registra um novo usuário"""
        try:
            response = self.post("/api/auth/register", json_data=user_data)
            return response.status_code == 201
        except:
            return False

class TestReporter:
    """Gerador de relatórios para os testes E2E"""
    
    def __init__(self):
        self.test_results = []
        self.start_time = datetime.now()
        self.current_phase = None
        
    def start_phase(self, phase_name: str):
        """Inicia uma nova fase de testes"""
        self.current_phase = phase_name
        print(f"\n🚀 Iniciando Fase: {phase_name}")
        print("=" * 50)
        
    def log_test_result(self, test_name: str, status: str, details: str = "", error: str = ""):
        """Registra o resultado de um teste"""
        result = {
            "phase": self.current_phase,
            "test_name": test_name,
            "status": status,  # "PASS", "FAIL", "SKIP"
            "details": details,
            "error": error,
            "timestamp": datetime.now().isoformat()
        }
        self.test_results.append(result)
        
        # Log imediato
        status_emoji = "✅" if status == "PASS" else "❌" if status == "FAIL" else "⏭️"
        print(f"{status_emoji} {test_name}: {details}")
        if error:
            print(f"   Erro: {error}")
            
    def generate_report(self) -> Dict:
        """Gera relatório final dos testes"""
        end_time = datetime.now()
        duration = (end_time - self.start_time).total_seconds()
        
        total_tests = len(self.test_results)
        passed_tests = len([r for r in self.test_results if r["status"] == "PASS"])
        failed_tests = len([r for r in self.test_results if r["status"] == "FAIL"])
        skipped_tests = len([r for r in self.test_results if r["status"] == "SKIP"])
        
        # Agrupar por fase
        phases = {}
        for result in self.test_results:
            phase = result["phase"]
            if phase not in phases:
                phases[phase] = {"total": 0, "passed": 0, "failed": 0, "skipped": 0}
            phases[phase]["total"] += 1
            if result["status"] == "PASS":
                phases[phase]["passed"] += 1
            elif result["status"] == "FAIL":
                phases[phase]["failed"] += 1
            else:
                phases[phase]["skipped"] += 1
                
        report = {
            "summary": {
                "total_tests": total_tests,
                "passed": passed_tests,
                "failed": failed_tests,
                "skipped": skipped_tests,
                "success_rate": (passed_tests / total_tests * 100) if total_tests > 0 else 0,
                "duration_seconds": duration,
                "start_time": self.start_time.isoformat(),
                "end_time": end_time.isoformat()
            },
            "phases": phases,
            "detailed_results": self.test_results
        }
        
        return report
        
    def save_report(self, filepath: str = None):
        """Salva o relatório em arquivo"""
        if not filepath:
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            filepath = f"{config.REPORTS_DIR}/e2e_report_{timestamp}.json"
            
        report = self.generate_report()
        with open(filepath, 'w', encoding='utf-8') as f:
            json.dump(report, f, indent=2, ensure_ascii=False)
            
        print(f"\n📊 Relatório salvo em: {filepath}")
        return filepath
        
    def print_summary(self):
        """Imprime resumo dos testes"""
        report = self.generate_report()
        summary = report["summary"]
        
        print("\n" + "="*60)
        print("📊 RESUMO DOS TESTES E2E - MESTRES DO CAFÉ")
        print("="*60)
        print(f"Total de testes: {summary['total_tests']}")
        print(f"✅ Sucessos: {summary['passed']}")
        print(f"❌ Falhas: {summary['failed']}")
        print(f"⏭️ Ignorados: {summary['skipped']}")
        print(f"📈 Taxa de sucesso: {summary['success_rate']:.1f}%")
        print(f"⏱️ Duração: {summary['duration_seconds']:.1f} segundos")
        
        print("\n📋 RESULTADOS POR FASE:")
        for phase, stats in report["phases"].items():
            success_rate = (stats["passed"] / stats["total"] * 100) if stats["total"] > 0 else 0
            print(f"  {phase}: {stats['passed']}/{stats['total']} (✅{success_rate:.0f}%)")
            
        if summary['failed'] > 0:
            print("\n❌ TESTES COM FALHA:")
            for result in report["detailed_results"]:
                if result["status"] == "FAIL":
                    print(f"  - {result['test_name']}: {result['error']}")

class TestUtils:
    """Utilitários gerais para testes"""
    
    @staticmethod
    def wait_for_condition(condition_func, timeout: int = 30, interval: float = 1) -> bool:
        """Espera por uma condição ser verdadeira"""
        start_time = time.time()
        while time.time() - start_time < timeout:
            if condition_func():
                return True
            time.sleep(interval)
        return False
        
    @staticmethod
    def validate_cpf(cpf: str) -> bool:
        """Valida formato de CPF"""
        cpf = ''.join(filter(str.isdigit, cpf))
        return len(cpf) == 11
        
    @staticmethod
    def validate_cnpj(cnpj: str) -> bool:
        """Valida formato de CNPJ"""
        cnpj = ''.join(filter(str.isdigit, cnpj))
        return len(cnpj) == 14
        
    @staticmethod
    def validate_email(email: str) -> bool:
        """Valida formato de email"""
        import re
        pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
        return re.match(pattern, email) is not None
        
    @staticmethod
    def generate_test_data(template: str, index: int = None) -> Dict:
        """Gera dados de teste únicos"""
        timestamp = int(time.time())
        suffix = f"_{index}" if index is not None else f"_{timestamp}"
        
        if template == "user_pf":
            return {
                "email": f"teste.pf{suffix}@exemplo.com",
                "password": "TestePF123!",
                "name": f"João Silva {suffix}",
                "cpf_cnpj": "11144477735",
                "phone": "(11) 99999-9999",
                "accountType": "individual"
            }
        elif template == "user_pj":
            return {
                "email": f"teste.pj{suffix}@empresa.com",
                "password": "TestePJ123!",
                "name": f"Empresa Teste {suffix} LTDA",
                "company_name": f"Empresa Teste {suffix} LTDA",
                "cpf_cnpj": "11444777000161", 
                "phone": "(11) 88888-8888",
                "accountType": "business"
            }
        else:
            return {}

# Instâncias globais
api_client = APIClient()
reporter = TestReporter()
utils = TestUtils()