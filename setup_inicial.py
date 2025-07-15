#!/usr/bin/env python3
"""
Script de Configuração Inicial - Mestres do Café Enterprise
Configura automaticamente o sistema para primeiro uso
"""

import os
import sys
import secrets
import subprocess
from pathlib import Path

# Cores para output
class Colors:
    GREEN = '\033[0;32m'
    RED = '\033[0;31m'
    YELLOW = '\033[1;33m'
    BLUE = '\033[0;34m'
    PURPLE = '\033[0;35m'
    CYAN = '\033[0;36m'
    NC = '\033[0m'

def print_header():
    """Imprime cabeçalho do setup"""
    print(f"""
{Colors.CYAN}╔══════════════════════════════════════════════════════════════╗
║                                                              ║
║    🚀 MESTRES DO CAFÉ ENTERPRISE - SETUP INICIAL           ║
║                                                              ║
║    Sistema completo de e-commerce para café especial        ║
║    com Analytics, ML, Multi-tenancy e muito mais!           ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝{Colors.NC}
""")

def log_info(message):
    print(f"{Colors.BLUE}[INFO]{Colors.NC} {message}")

def log_success(message):
    print(f"{Colors.GREEN}[SUCCESS]{Colors.NC} {message}")

def log_warning(message):
    print(f"{Colors.YELLOW}[WARNING]{Colors.NC} {message}")

def log_error(message):
    print(f"{Colors.RED}[ERROR]{Colors.NC} {message}")

def log_step(step, message):
    print(f"{Colors.PURPLE}[STEP {step}]{Colors.NC} {message}")

class MestresCafeSetup:
    """Classe principal de configuração"""
    
    def __init__(self):
        self.project_root = Path.cwd()
        self.env_file = self.project_root / ".env"
        self.config = {}
    
    def check_requirements(self):
        """Verifica pré-requisitos"""
        log_step(1, "Verificando pré-requisitos...")
        
        # Verifica Docker
        try:
            result = subprocess.run(['docker', '--version'], capture_output=True, text=True)
            if result.returncode == 0:
                log_success("Docker encontrado")
            else:
                log_error("Docker não encontrado. Instale o Docker primeiro.")
                return False
        except FileNotFoundError:
            log_error("Docker não encontrado. Instale o Docker primeiro.")
            return False
        
        # Verifica Docker Compose
        try:
            result = subprocess.run(['docker-compose', '--version'], capture_output=True, text=True)
            if result.returncode == 0:
                log_success("Docker Compose encontrado")
            else:
                log_error("Docker Compose não encontrado.")
                return False
        except FileNotFoundError:
            log_error("Docker Compose não encontrado.")
            return False
        
        return True
    
    def generate_secret_keys(self):
        """Gera chaves secretas seguras"""
        log_step(2, "Gerando chaves de segurança...")
        
        self.config['SECRET_KEY'] = secrets.token_urlsafe(32)
        self.config['JWT_SECRET_KEY'] = secrets.token_urlsafe(32)
        
        log_success("Chaves de segurança geradas")
    
    def get_user_input(self):
        """Coleta informações do usuário"""
        log_step(3, "Coletando configurações...")
        
        print(f"\n{Colors.CYAN}=== CONFIGURAÇÃO DO BANCO DE DADOS ==={Colors.NC}")
        print("1. PostgreSQL Local (Docker) - Recomendado para desenvolvimento")
        print("2. PostgreSQL Cloud (Supabase, Railway, etc.)")
        
        db_choice = input("\nEscolha uma opção [1-2]: ").strip()
        
        if db_choice == "2":
            self.config['DATABASE_URL'] = input("Cole a URL do banco (postgresql://...): ").strip()
        else:
            self.config['DATABASE_URL'] = "postgresql://postgres:postgres@postgres:5432/mestres_cafe"
            log_info("Usando PostgreSQL local via Docker")
        
        print(f"\n{Colors.CYAN}=== CONFIGURAÇÃO DO MERCADO PAGO ==={Colors.NC}")
        print("Para integração de pagamentos (obrigatório)")
        print("Obtenha suas credenciais em: https://www.mercadopago.com.br/developers")
        
        mp_token = input("\nAccess Token (APP_USR-...): ").strip()
        mp_public = input("Public Key (APP_USR-...): ").strip()
        
        if mp_token and mp_public:
            self.config['MERCADO_PAGO_ACCESS_TOKEN'] = mp_token
            self.config['MERCADO_PAGO_PUBLIC_KEY'] = mp_public
            self.config['MERCADO_PAGO_WEBHOOK_SECRET'] = secrets.token_urlsafe(16)
        else:
            log_warning("Credenciais do Mercado Pago não fornecidas - pagamentos não funcionarão")
        
        print(f"\n{Colors.CYAN}=== CONFIGURAÇÃO DO MELHOR ENVIO ==={Colors.NC}")
        print("Para cálculo de fretes (obrigatório)")
        print("Obtenha seu token em: https://melhorenvio.com.br/painel/gerenciar/tokens")
        
        me_token = input("\nToken do Melhor Envio (Bearer ...): ").strip()
        
        if me_token:
            self.config['MELHOR_ENVIO_TOKEN'] = me_token
            self.config['MELHOR_ENVIO_SANDBOX'] = "false"
        else:
            log_warning("Token do Melhor Envio não fornecido - fretes não funcionarão")
        
        print(f"\n{Colors.CYAN}=== CONFIGURAÇÃO DE EMAIL ==={Colors.NC}")
        print("Para envio de emails (opcional)")
        
        use_email = input("\nConfigurar email agora? [y/N]: ").strip().lower()
        
        if use_email == 'y':
            print("\nExemplo para Gmail:")
            print("1. Ative autenticação em 2 fatores")
            print("2. Gere uma senha de app específica")
            
            mail_server = input("\nServidor SMTP [smtp.gmail.com]: ").strip() or "smtp.gmail.com"
            mail_port = input("Porta [587]: ").strip() or "587"
            mail_user = input("Email: ").strip()
            mail_pass = input("Senha/Token: ").strip()
            
            if mail_user and mail_pass:
                self.config['MAIL_SERVER'] = mail_server
                self.config['MAIL_PORT'] = mail_port
                self.config['MAIL_USE_TLS'] = "true"
                self.config['MAIL_USERNAME'] = mail_user
                self.config['MAIL_PASSWORD'] = mail_pass
        
        print(f"\n{Colors.CYAN}=== CONFIGURAÇÃO DE DOMÍNIO ==={Colors.NC}")
        domain = input("\nDomínio personalizado (opcional): ").strip()
        
        if domain:
            self.config['CORS_ORIGINS'] = f"https://{domain},https://www.{domain},http://localhost:3000"
        else:
            self.config['CORS_ORIGINS'] = "http://localhost:3000,http://localhost:5001"
    
    def create_env_file(self):
        """Cria arquivo .env com as configurações"""
        log_step(4, "Criando arquivo de configuração...")
        
        env_content = f"""# ===========================================
# MESTRES DO CAFÉ ENTERPRISE - CONFIGURAÇÃO
# Gerado automaticamente em {os.popen('date').read().strip()}
# ===========================================

# FLASK CORE
FLASK_ENV=development
SECRET_KEY={self.config.get('SECRET_KEY', 'change-me')}
JWT_SECRET_KEY={self.config.get('JWT_SECRET_KEY', 'change-me')}

# DATABASE
DATABASE_URL={self.config.get('DATABASE_URL', 'postgresql://postgres:postgres@postgres:5432/mestres_cafe')}

# REDIS (Cache - opcional)
REDIS_URL=redis://redis:6379/0

# MERCADO PAGO
MERCADO_PAGO_ACCESS_TOKEN={self.config.get('MERCADO_PAGO_ACCESS_TOKEN', 'cole_seu_token_aqui')}
MERCADO_PAGO_PUBLIC_KEY={self.config.get('MERCADO_PAGO_PUBLIC_KEY', 'cole_sua_public_key_aqui')}
MERCADO_PAGO_WEBHOOK_SECRET={self.config.get('MERCADO_PAGO_WEBHOOK_SECRET', secrets.token_urlsafe(16))}

# MELHOR ENVIO
MELHOR_ENVIO_TOKEN={self.config.get('MELHOR_ENVIO_TOKEN', 'Bearer_cole_seu_token_aqui')}
MELHOR_ENVIO_SANDBOX=false

# EMAIL/SMTP
MAIL_SERVER={self.config.get('MAIL_SERVER', 'smtp.gmail.com')}
MAIL_PORT={self.config.get('MAIL_PORT', '587')}
MAIL_USE_TLS={self.config.get('MAIL_USE_TLS', 'true')}
MAIL_USERNAME={self.config.get('MAIL_USERNAME', 'seu_email@gmail.com')}
MAIL_PASSWORD={self.config.get('MAIL_PASSWORD', 'sua_senha_de_app')}

# CORS
CORS_ORIGINS={self.config.get('CORS_ORIGINS', 'http://localhost:3000')}

# CONFIGURAÇÕES DE PRODUÇÃO
GUNICORN_WORKERS=4
GUNICORN_TIMEOUT=120

# MONITORAMENTO
GRAFANA_PASSWORD={secrets.token_urlsafe(12)}

# BACKUP
BACKUP_RETENTION_DAYS=30
"""
        
        with open(self.env_file, 'w') as f:
            f.write(env_content)
        
        log_success(f"Arquivo .env criado: {self.env_file}")
    
    def create_first_tenant(self):
        """Cria o tenant padrão"""
        log_step(5, "Configurando loja padrão...")
        
        print(f"\n{Colors.CYAN}=== CONFIGURAÇÃO DA LOJA PRINCIPAL ==={Colors.NC}")
        
        store_name = input("Nome da sua loja [Mestres do Café]: ").strip() or "Mestres do Café"
        store_slug = input("Slug da loja (URL amigável) [mestres-cafe]: ").strip() or "mestres-cafe"
        owner_name = input("Nome do proprietário: ").strip() or "Administrador"
        owner_email = input("Email do proprietário: ").strip() or "admin@mestrescafe.com"
        
        tenant_config = {
            'name': store_name,
            'slug': store_slug,
            'owner_name': owner_name,
            'owner_email': owner_email,
            'plan_type': 'enterprise'
        }
        
        # Salva configuração do tenant
        tenant_file = self.project_root / "tenant_config.json"
        import json
        with open(tenant_file, 'w') as f:
            json.dump(tenant_config, f, indent=2)
        
        log_success("Configuração da loja salva")
    
    def start_system(self):
        """Inicia o sistema"""
        log_step(6, "Iniciando o sistema...")
        
        print("\nEscolha como executar:")
        print("1. Desenvolvimento (com hot reload)")
        print("2. Produção (otimizado)")
        
        mode = input("\nEscolha [1-2]: ").strip()
        
        if mode == "2":
            log_info("Iniciando em modo produção...")
            cmd = ["docker-compose", "-f", "docker-compose.prod.yml", "up", "-d"]
        else:
            log_info("Iniciando em modo desenvolvimento...")
            cmd = ["docker-compose", "up", "-d"]
        
        try:
            result = subprocess.run(cmd, check=True)
            if result.returncode == 0:
                log_success("Sistema iniciado com sucesso!")
                self.show_access_info()
            else:
                log_error("Erro ao iniciar o sistema")
        except subprocess.CalledProcessError as e:
            log_error(f"Erro ao executar Docker Compose: {e}")
    
    def show_access_info(self):
        """Mostra informações de acesso"""
        print(f"""
{Colors.GREEN}╔══════════════════════════════════════════════════════════════╗
║                                                              ║
║  🎉 SISTEMA INICIADO COM SUCESSO!                           ║
║                                                              ║
║  Acesse as seguintes URLs:                                   ║
║                                                              ║
║  🌐 Frontend: http://localhost:3000                         ║
║  🔧 API: http://localhost:5001/api                          ║
║  📊 Health: http://localhost:5001/api/health                ║
║  📈 Analytics: http://localhost:5001/api/analytics/dashboard ║
║  🔍 Monitoring: http://localhost:5001/api/monitoring/health  ║
║                                                              ║
║  📚 Documentação completa em:                               ║
║     - GUIA_CONFIGURACAO_COMPLETO.md                         ║
║     - CHECKLIST_COMPLETO_FUNCIONALIDADES.md                 ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝{Colors.NC}

{Colors.CYAN}Próximos passos:{Colors.NC}
1. Acesse http://localhost:3000 para ver o frontend
2. Teste os endpoints da API em http://localhost:5001/api
3. Configure seus produtos e categorias
4. Teste pagamentos e fretes com as credenciais fornecidas
5. Explore o dashboard de analytics

{Colors.YELLOW}Comandos úteis:{Colors.NC}
- Ver logs: docker-compose logs -f
- Parar sistema: docker-compose down
- Reiniciar: docker-compose restart

{Colors.GREEN}🚀 Seu sistema enterprise está pronto para conquistar o mercado! ☕{Colors.NC}
""")
    
    def run_setup(self):
        """Executa o setup completo"""
        print_header()
        
        if not self.check_requirements():
            sys.exit(1)
        
        self.generate_secret_keys()
        self.get_user_input()
        self.create_env_file()
        self.create_first_tenant()
        
        start_now = input(f"\n{Colors.CYAN}Iniciar o sistema agora? [Y/n]: {Colors.NC}").strip().lower()
        
        if start_now != 'n':
            self.start_system()
        else:
            print(f"\n{Colors.BLUE}Para iniciar o sistema depois, execute:{Colors.NC}")
            print("docker-compose up")
            
            print(f"\n{Colors.GREEN}Configuração concluída! ✅{Colors.NC}")

def main():
    """Função principal"""
    try:
        setup = MestresCafeSetup()
        setup.run_setup()
    except KeyboardInterrupt:
        print(f"\n\n{Colors.YELLOW}Setup cancelado pelo usuário.{Colors.NC}")
        sys.exit(1)
    except Exception as e:
        print(f"\n{Colors.RED}Erro inesperado: {e}{Colors.NC}")
        sys.exit(1)

if __name__ == "__main__":
    main()