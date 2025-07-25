#!/usr/bin/env python3
"""
Environment Setup for E2E Tests - Mestres do Café
Ensures proper environment configuration before running tests
"""
import os
import sys
import subprocess
from pathlib import Path

def check_required_environment_variables():
    """Verifica se todas as variáveis de ambiente necessárias estão definidas"""
    required_vars = {
        'TEST_PASSWORD': 'Password for test users (required for security)',
    }
    
    optional_vars = {
        'API_URL': 'API base URL (default: http://localhost:5001)',
        'FRONTEND_URL': 'Frontend URL (default: http://localhost:3000)',
        'TEST_ENV': 'Test environment (ci, local, etc.)',
    }
    
    missing_required = []
    
    print("🔍 Verificando variáveis de ambiente...")
    print("=" * 50)
    
    # Check required variables
    for var, description in required_vars.items():
        value = os.getenv(var)
        if value:
            # Don't print the actual password for security
            display_value = "***CONFIGURED***" if 'password' in var.lower() else value
            print(f"✅ {var}: {display_value}")
        else:
            print(f"❌ {var}: NOT SET - {description}")
            missing_required.append(var)
    
    # Check optional variables
    for var, description in optional_vars.items():
        value = os.getenv(var)
        if value:
            print(f"✅ {var}: {value}")
        else:
            print(f"⚪ {var}: Using default - {description}")
    
    if missing_required:
        print(f"\n❌ ERRO: Variáveis obrigatórias não definidas: {', '.join(missing_required)}")
        print("\n💡 Para corrigir:")
        for var in missing_required:
            if 'password' in var.lower():
                print(f"   export {var}='your_secure_test_password_here'")
            else:
                print(f"   export {var}='appropriate_value'")
        print("\n🔒 IMPORTANTE: Nunca commite passwords hardcoded no código!")
        return False
    
    print("\n✅ Todas as variáveis obrigatórias estão configuradas!")
    return True

def create_environment_template():
    """Cria um template de arquivo .env para facilitar configuração"""
    env_template = """# E2E Test Environment Variables
# Copy this file to .env.local and configure your values

# REQUIRED: Test password for E2E user accounts
# NEVER commit actual passwords to the repository
TEST_PASSWORD=your_secure_test_password_here

# OPTIONAL: Override default URLs
# API_URL=http://localhost:5001
# FRONTEND_URL=http://localhost:3000

# OPTIONAL: Test environment type
# TEST_ENV=local

# OPTIONAL: Render deployment URLs (for production testing)
# API_URL=https://your-api.onrender.com
# FRONTEND_URL=https://your-frontend.onrender.com
"""
    
    template_path = Path("tests/e2e/.env.template")
    template_path.parent.mkdir(parents=True, exist_ok=True)
    
    with open(template_path, 'w') as f:
        f.write(env_template)
    
    print(f"📝 Created environment template: {template_path}")
    print("   Copy and configure this file for your local setup.")
    
    return template_path

def setup_test_directories():
    """Cria diretórios necessários para os testes"""
    directories = [
        "tests/e2e/reports",
        "tests/e2e/logs", 
        "tests/e2e/screenshots"
    ]
    
    for dir_path in directories:
        Path(dir_path).mkdir(parents=True, exist_ok=True)
        print(f"📁 Created directory: {dir_path}")

def validate_dependencies():
    """Valida se as dependências Python estão instaladas"""
    required_packages = ['requests']
    
    print("\n🔍 Verificando dependências Python...")
    
    missing_packages = []
    for package in required_packages:
        try:
            __import__(package)
            print(f"✅ {package}: Installed")
        except ImportError:
            print(f"❌ {package}: Not installed")
            missing_packages.append(package)
    
    if missing_packages:
        print(f"\n❌ Pacotes faltando: {', '.join(missing_packages)}")
        print("💡 Para instalar:")
        print(f"   pip install {' '.join(missing_packages)}")
        return False
    
    return True

def main():
    """Configuração principal do ambiente"""
    print("🧪 CONFIGURAÇÃO DO AMBIENTE E2E - MESTRES DO CAFÉ")
    print("=" * 60)
    
    # Create directories
    setup_test_directories()
    
    # Create environment template
    create_environment_template()
    
    # Validate dependencies
    if not validate_dependencies():
        print("\n❌ Dependências não atendidas. Instale os pacotes necessários.")
        return 1
    
    # Check environment variables
    if not check_required_environment_variables():
        print("\n❌ Configuração de ambiente incompleta.")
        print("\n🔗 Consulte a documentação em tests/e2e/README.md")
        return 1
    
    print("\n🎉 Ambiente configurado corretamente!")
    print("✅ Pronto para executar testes E2E")
    
    return 0

if __name__ == "__main__":
    exit(main())