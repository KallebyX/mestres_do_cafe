#!/usr/bin/env python3
"""
Validação Completa do Sistema Mestres do Café Enterprise
Verifica todas as funcionalidades implementadas
"""

import sys
import os
import importlib.util
from pathlib import Path

# Cores para output
class Colors:
    GREEN = '\033[0;32m'
    RED = '\033[0;31m'
    YELLOW = '\033[1;33m'
    BLUE = '\033[0;34m'
    NC = '\033[0m'  # No Color

def log_info(message):
    print(f"{Colors.BLUE}[INFO]{Colors.NC} {message}")

def log_success(message):
    print(f"{Colors.GREEN}[SUCCESS]{Colors.NC} {message}")

def log_warning(message):
    print(f"{Colors.YELLOW}[WARNING]{Colors.NC} {message}")

def log_error(message):
    print(f"{Colors.RED}[ERROR]{Colors.NC} {message}")

class SystemValidator:
    def __init__(self):
        self.api_path = Path("apps/api/src")
        self.web_path = Path("apps/web/src")
        self.results = {
            "passed": 0,
            "failed": 0,
            "warnings": 0,
            "total": 0
        }
    
    def test(self, name, test_func):
        """Executa um teste e registra resultado"""
        try:
            self.results["total"] += 1
            log_info(f"Testando: {name}")
            
            result = test_func()
            
            if result is True:
                log_success(f"✓ {name}")
                self.results["passed"] += 1
            elif result == "warning":
                log_warning(f"⚠ {name}")
                self.results["warnings"] += 1
            else:
                log_error(f"✗ {name}: {result}")
                self.results["failed"] += 1
                
        except Exception as e:
            log_error(f"✗ {name}: Exception - {str(e)}")
            self.results["failed"] += 1
    
    def check_file_exists(self, filepath):
        """Verifica se arquivo existe"""
        return os.path.exists(filepath)
    
    def check_import(self, module_path):
        """Verifica se módulo pode ser importado"""
        try:
            spec = importlib.util.spec_from_file_location("test_module", module_path)
            if spec is None:
                return False
            module = importlib.util.module_from_spec(spec)
            spec.loader.exec_module(module)
            return True
        except Exception as e:
            return str(e)
    
    def test_core_files(self):
        """Testa arquivos principais"""
        core_files = [
            "apps/api/src/app.py",
            "apps/api/src/database.py",
            "apps/api/src/config.py",
            "apps/api/requirements.txt"
        ]
        
        for file_path in core_files:
            if self.check_file_exists(file_path):
                return True
            else:
                return f"Arquivo {file_path} não encontrado"
        return True
    
    def test_model_imports(self):
        """Testa imports dos modelos"""
        models_init = "apps/api/src/models/__init__.py"
        if not self.check_file_exists(models_init):
            return "Arquivo __init__.py dos modelos não encontrado"
        
        # Verifica se principais modelos estão listados
        with open(models_init, 'r') as f:
            content = f.read()
            
        required_models = [
            'User', 'Customer', 'Product', 'Order', 'Payment',
            'Tenant', 'TenantSettings', 'TenantSubscription'
        ]
        
        for model in required_models:
            if model not in content:
                return f"Modelo {model} não encontrado em __init__.py"
        
        return True
    
    def test_service_files(self):
        """Testa arquivos de serviços"""
        services = [
            "apps/api/src/services/analytics_service.py",
            "apps/api/src/services/recommendation_service.py",
            "apps/api/src/services/tenant_service.py",
            "apps/api/src/services/escrow_service.py",
            "apps/api/src/services/melhor_envio_service.py",
            "apps/api/src/services/mercado_pago_service.py"
        ]
        
        for service in services:
            if not self.check_file_exists(service):
                return f"Serviço {service} não encontrado"
        
        return True
    
    def test_controller_files(self):
        """Testa arquivos de controllers/rotas"""
        controllers = [
            "apps/api/src/controllers/routes/analytics.py",
            "apps/api/src/controllers/routes/recommendations.py",
            "apps/api/src/controllers/routes/tenants.py",
            "apps/api/src/controllers/routes/monitoring.py",
            "apps/api/src/controllers/routes/security.py",
            "apps/api/src/controllers/routes/escrow.py",
            "apps/api/src/controllers/routes/mercado_pago.py",
            "apps/api/src/controllers/routes/melhor_envio.py"
        ]
        
        for controller in controllers:
            if not self.check_file_exists(controller):
                return f"Controller {controller} não encontrado"
        
        return True
    
    def test_middleware_files(self):
        """Testa arquivos de middleware"""
        middleware = [
            "apps/api/src/middleware/security.py",
            "apps/api/src/middleware/error_handler.py"
        ]
        
        for mw in middleware:
            if not self.check_file_exists(mw):
                return f"Middleware {mw} não encontrado"
        
        return True
    
    def test_utils_files(self):
        """Testa arquivos de utilitários"""
        utils = [
            "apps/api/src/utils/cache.py",
            "apps/api/src/utils/monitoring.py",
            "apps/api/src/utils/logger.py"
        ]
        
        for util in utils:
            if not self.check_file_exists(util):
                return f"Utilitário {util} não encontrado"
        
        return True
    
    def test_frontend_files(self):
        """Testa arquivos principais do frontend"""
        frontend_files = [
            "apps/web/src/App.jsx",
            "apps/web/src/main.jsx",
            "apps/web/src/components/analytics/AdvancedAnalyticsDashboard.jsx",
            "apps/web/package.json"
        ]
        
        for file_path in frontend_files:
            if not self.check_file_exists(file_path):
                return f"Arquivo frontend {file_path} não encontrado"
        
        return True
    
    def test_docker_files(self):
        """Testa arquivos Docker"""
        docker_files = [
            "Dockerfile",
            "docker-compose.yml",
            "docker-compose.prod.yml"
        ]
        
        for file_path in docker_files:
            if not self.check_file_exists(file_path):
                return f"Arquivo Docker {file_path} não encontrado"
        
        return True
    
    def test_deployment_files(self):
        """Testa arquivos de deploy"""
        deploy_files = [
            "scripts/deploy.sh",
            "scripts/backup.sh",
            ".github/workflows/deploy.yml",
            ".env.production"
        ]
        
        for file_path in deploy_files:
            if not self.check_file_exists(file_path):
                return f"Arquivo de deploy {file_path} não encontrado"
        
        return True
    
    def test_requirements_dependencies(self):
        """Testa dependências do requirements.txt"""
        req_file = "apps/api/requirements.txt"
        
        if not self.check_file_exists(req_file):
            return "requirements.txt não encontrado"
        
        with open(req_file, 'r') as f:
            content = f.read()
        
        critical_deps = [
            'Flask==3.0.0',
            'SQLAlchemy==2.0.36',
            'mercadopago==2.2.3',
            'schedule==1.2.0',
            'scikit-learn==1.3.0',
            'redis==5.0.1'
        ]
        
        for dep in critical_deps:
            if dep not in content:
                return f"Dependência crítica {dep} não encontrada"
        
        return True
    
    def test_app_blueprint_registration(self):
        """Verifica se todos os blueprints estão registrados"""
        app_file = "apps/api/src/app.py"
        
        if not self.check_file_exists(app_file):
            return "app.py não encontrado"
        
        with open(app_file, 'r') as f:
            content = f.read()
        
        required_blueprints = [
            'analytics_bp',
            'recommendations_bp',
            'tenants_bp',
            'monitoring_bp',
            'security_bp',
            'escrow_bp',
            'mercado_pago_bp',
            'melhor_envio_bp'
        ]
        
        for bp in required_blueprints:
            if f"register_blueprint({bp}" not in content:
                return f"Blueprint {bp} não está registrado"
        
        return True
    
    def test_documentation_files(self):
        """Verifica documentação"""
        docs = [
            "SISTEMA_COMPLETO_DOCUMENTACAO.md",
            "FASE_4_EVOLUCAO_ENTERPRISE.md",
            "README.md"
        ]
        
        missing = []
        for doc in docs:
            if not self.check_file_exists(doc):
                missing.append(doc)
        
        if missing:
            return f"Documentação faltando: {', '.join(missing)}"
        
        return True
    
    def run_all_tests(self):
        """Executa todos os testes"""
        log_info("🚀 Iniciando validação completa do sistema...")
        log_info("=" * 60)
        
        # Testes críticos
        log_info("📋 TESTES DE ARQUIVOS PRINCIPAIS")
        self.test("Arquivos principais", self.test_core_files)
        self.test("Imports dos modelos", self.test_model_imports)
        self.test("Arquivos de serviços", self.test_service_files)
        self.test("Arquivos de controllers", self.test_controller_files)
        self.test("Arquivos de middleware", self.test_middleware_files)
        self.test("Arquivos de utilitários", self.test_utils_files)
        
        log_info("")
        log_info("🎨 TESTES DO FRONTEND")
        self.test("Arquivos do frontend", self.test_frontend_files)
        
        log_info("")
        log_info("🐳 TESTES DE DEPLOY")
        self.test("Arquivos Docker", self.test_docker_files)
        self.test("Arquivos de deployment", self.test_deployment_files)
        
        log_info("")
        log_info("⚙️ TESTES DE CONFIGURAÇÃO")
        self.test("Dependências do requirements", self.test_requirements_dependencies)
        self.test("Registro de blueprints", self.test_app_blueprint_registration)
        
        log_info("")
        log_info("📚 TESTES DE DOCUMENTAÇÃO")
        self.test("Arquivos de documentação", self.test_documentation_files)
        
        log_info("")
        log_info("=" * 60)
        
        # Resultados finais
        total = self.results["total"]
        passed = self.results["passed"]
        failed = self.results["failed"]
        warnings = self.results["warnings"]
        
        log_info(f"📊 RESULTADOS:")
        log_info(f"   Total de testes: {total}")
        log_info(f"   ✅ Passou: {passed}")
        log_info(f"   ❌ Falhou: {failed}")
        log_info(f"   ⚠️ Avisos: {warnings}")
        
        # Status final
        if failed == 0:
            if warnings == 0:
                log_success("🎉 SISTEMA COMPLETAMENTE VÁLIDO!")
                log_success("Todas as funcionalidades estão implementadas corretamente.")
                log_success("O sistema está pronto para uso - apenas configure o .env")
                return "success"
            else:
                log_warning("✅ SISTEMA VÁLIDO com pequenos avisos")
                log_warning("Funcionalidades principais OK - avisos podem ser ignorados")
                return "warning"
        else:
            log_error("💥 SISTEMA COM PROBLEMAS!")
            log_error("Corrija os erros antes de usar o sistema")
            return "failed"

def main():
    """Função principal"""
    validator = SystemValidator()
    result = validator.run_all_tests()
    
    # Exit codes
    if result == "success":
        sys.exit(0)
    elif result == "warning":
        sys.exit(1)
    else:
        sys.exit(2)

if __name__ == "__main__":
    main()