#!/usr/bin/env python3
"""
Gerador de variáveis de ambiente para Mestres do Café
Gera SECRET_KEY e JWT_SECRET_KEY seguros
"""

import secrets
import string
import os
from datetime import datetime

def generate_secret_key(length=32):
    """Gera uma chave secreta segura"""
    return secrets.token_urlsafe(length)

def generate_jwt_secret(length=32):
    """Gera uma chave JWT segura"""
    return secrets.token_urlsafe(length)

def generate_env_file():
    """Gera arquivo .env com variáveis seguras"""
    
    print("🔧 Gerando variáveis de ambiente para Mestres do Café...")
    
    # Gerar chaves seguras
    secret_key = generate_secret_key(32)
    jwt_secret = generate_jwt_secret(32)
    
    # Conteúdo do arquivo .env
    env_content = f"""# Mestres do Café - Variáveis de Ambiente
# Gerado em: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}

# ========================================
# BANCO DE DADOS
# ========================================

# Neon Database (RECOMENDADO - melhor performance)
# Obtenha em: https://console.neon.tech
NEON_DATABASE_URL=postgresql://username:password@ep-xxx-xxx.us-east-1.aws.neon.tech/neondb?sslmode=require

# Render Database (FALLBACK)
# Será fornecido automaticamente pelo Render
DATABASE_URL=postgresql://user:pass@dpg-xxx-xxx.oregon-postgres.render.com/mestres_cafe

# ========================================
# SEGURANÇA
# ========================================

# Chaves secretas (geradas automaticamente)
SECRET_KEY={secret_key}
JWT_SECRET_KEY={jwt_secret}

# ========================================
# FLASK
# ========================================

FLASK_ENV=production
FLASK_DEBUG=0
PORT=5001

# ========================================
# APIS EXTERNAS
# ========================================

# Mercado Pago
# Obtenha em: https://www.mercadopago.com.br/developers
MERCADO_PAGO_ACCESS_TOKEN=TEST-xxx-xxx
MERCADO_PAGO_PUBLIC_KEY=TEST-xxx-xxx
MERCADO_PAGO_ENVIRONMENT=sandbox

# Melhor Envio
# Obtenha em: https://melhorenvio.com.br
MELHOR_ENVIO_API_KEY=your-api-key
MELHOR_ENVIO_ENVIRONMENT=sandbox

# ========================================
# REDIS (OPCIONAL)
# ========================================

# Será fornecido automaticamente pelo Render
REDIS_URL=redis://user:pass@redis-host:6379

# ========================================
# CORS
# ========================================

CORS_ORIGINS=https://mestres-cafe-web.onrender.com,http://localhost:3000,http://localhost:5173
"""
    
    # Salvar arquivo .env
    with open('.env', 'w') as f:
        f.write(env_content)
    
    print("✅ Arquivo .env gerado com sucesso!")
    print(f"📁 Localização: {os.path.abspath('.env')}")
    print()
    print("🔑 Chaves geradas:")
    print(f"   SECRET_KEY: {secret_key}")
    print(f"   JWT_SECRET_KEY: {jwt_secret}")
    print()
    print("📋 Próximos passos:")
    print("1. Configure NEON_DATABASE_URL com sua string do Neon")
    print("2. Configure MERCADO_PAGO_ACCESS_TOKEN se necessário")
    print("3. Configure MELHOR_ENVIO_API_KEY se necessário")
    print("4. Adicione as variáveis no Render Dashboard")
    print()
    print("🌐 Render Dashboard: https://dashboard.render.com")
    print("🌟 Neon Console: https://console.neon.tech")

def generate_render_env():
    """Gera comandos para configurar no Render"""
    
    secret_key = generate_secret_key(32)
    jwt_secret = generate_jwt_secret(32)
    
    print("🚀 Comandos para configurar no Render Dashboard:")
    print()
    print("1. Acesse: https://dashboard.render.com")
    print("2. Selecione seu serviço: mestres-cafe-api")
    print("3. Clique em: Environment")
    print("4. Adicione estas variáveis:")
    print()
    print("┌─────────────────────────┬─────────────────────────────────────────────────────────┐")
    print("│ Key                     │ Value                                                   │")
    print("├─────────────────────────┼─────────────────────────────────────────────────────────┤")
    print(f"│ NEON_DATABASE_URL      │ postgresql://username:password@ep-xxx-xxx.us-east-1.aws.neon.tech/neondb?sslmode=require │")
    print(f"│ SECRET_KEY             │ {secret_key} │")
    print(f"│ JWT_SECRET_KEY         │ {jwt_secret} │")
    print("│ MERCADO_PAGO_ACCESS_TOKEN │ TEST-xxx-xxx (opcional)                            │")
    print("│ MELHOR_ENVIO_API_KEY   │ your-api-key (opcional)                               │")
    print("└─────────────────────────┴─────────────────────────────────────────────────────────┘")
    print()
    print("5. Clique em: Save Changes")
    print("6. Aguarde o redeploy automático")
    print()
    print("✅ Pronto! O sistema usará o Neon Database automaticamente.")

def main():
    """Função principal"""
    print("🌟 Mestres do Café - Gerador de Variáveis de Ambiente")
    print("=" * 60)
    print()
    
    while True:
        print("Escolha uma opção:")
        print("1. Gerar arquivo .env local")
        print("2. Gerar comandos para Render Dashboard")
        print("3. Sair")
        print()
        
        choice = input("Digite sua escolha (1-3): ").strip()
        
        if choice == "1":
            generate_env_file()
            break
        elif choice == "2":
            generate_render_env()
            break
        elif choice == "3":
            print("👋 Até logo!")
            break
        else:
            print("❌ Opção inválida. Tente novamente.")
            print()

if __name__ == "__main__":
    main()
