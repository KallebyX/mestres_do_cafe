# 🔧 Configuração do Sistema

Este documento detalha todas as configurações disponíveis no Café Enterprise.

## 📋 Variáveis de Ambiente

### 🌍 Ambiente Geral

```env
# Ambiente de execução
NODE_ENV=development|staging|production
FLASK_ENV=development|staging|production

# Debug mode
DEBUG=true|false
LOG_LEVEL=debug|info|warning|error
```

### 🗄️ Banco de Dados

```env
# Database principal
DATABASE_URL=postgresql://user:password@localhost:5432/cafe_db

# Para desenvolvimento (SQLite)
DATABASE_URL=sqlite:///mestres_cafe.db

# Pool de conexões
DATABASE_POOL_SIZE=10
DATABASE_MAX_OVERFLOW=20
DATABASE_POOL_TIMEOUT=30
```

### 🔐 Segurança

```env
# Chaves secretas (OBRIGATÓRIO alterar em produção)
SECRET_KEY=sua-chave-super-secreta-aqui-minimo-32-caracteres
JWT_SECRET_KEY=sua-chave-jwt-super-secreta-aqui-minimo-32-caracteres

# Configuração JWT
JWT_ACCESS_TOKEN_EXPIRES=3600  # 1 hora em segundos
JWT_REFRESH_TOKEN_EXPIRES=2592000  # 30 dias em segundos

# Rate limiting
RATE_LIMIT_PER_MINUTE=100
RATE_LIMIT_PER_HOUR=1000
```

### 📡 API Configuration

```env
# Configuração da API
API_HOST=0.0.0.0
API_PORT=5000
API_WORKERS=4

# CORS
CORS_ORIGINS=http://localhost:3000,http://localhost:5173,https://seudominio.com

# Timeout
API_TIMEOUT=30
```

### 🌐 Frontend

```env
# Configuração do Vite
VITE_API_URL=http://localhost:5000/api
VITE_APP_NAME=Café Enterprise
VITE_APP_VERSION=1.0.0
VITE_APP_DESCRIPTION=Sistema enterprise de e-commerce e ERP

# URLs externas
VITE_COMPANY_WEBSITE=https://seusite.com
VITE_SUPPORT_EMAIL=suporte@seusite.com
```

### 📧 Email

```env
# Configuração SMTP
MAIL_SERVER=smtp.gmail.com
MAIL_PORT=587
MAIL_USE_TLS=true
MAIL_USE_SSL=false
MAIL_USERNAME=seu-email@gmail.com
MAIL_PASSWORD=sua-senha-app

# Configuração de emails
MAIL_DEFAULT_SENDER=noreply@seusite.com
MAIL_MAX_EMAILS=100
```

### 🔄 Cache (Redis)

```env
# Redis
REDIS_URL=redis://localhost:6379/0
REDIS_PASSWORD=sua-senha-redis

# Configuração de cache
REDIS_DEFAULT_TIMEOUT=3600  # 1 hora
REDIS_KEY_PREFIX=cafe:
```

### 💳 Pagamentos

```env
# Stripe
STRIPE_PUBLIC_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# PagSeguro
PAGSEGURO_EMAIL=seu-email@pagseguro.com
PAGSEGURO_TOKEN=seu-token-pagseguro
PAGSEGURO_SANDBOX=true|false
```

### 📁 Armazenamento

```env
# AWS S3
AWS_ACCESS_KEY_ID=sua-chave-aws
AWS_SECRET_ACCESS_KEY=sua-chave-secreta-aws
AWS_BUCKET_NAME=cafe-uploads
AWS_REGION=us-east-1

# Local storage
UPLOAD_FOLDER=uploads/
MAX_CONTENT_LENGTH=16777216  # 16MB
```

### 📊 Monitoramento

```env
# Sentry
SENTRY_DSN=https://sua-dsn@sentry.io/projeto

# Google Analytics
GOOGLE_ANALYTICS_ID=GA-XXXXXXXXX

# Logs
LOG_TO_FILE=true
LOG_FILE_PATH=logs/app.log
LOG_MAX_SIZE=10485760  # 10MB
LOG_BACKUP_COUNT=5
```

### 🔗 Integração Social

```env
# Google OAuth
GOOGLE_CLIENT_ID=sua-client-id
GOOGLE_CLIENT_SECRET=sua-client-secret

# Facebook OAuth
FACEBOOK_APP_ID=sua-app-id
FACEBOOK_APP_SECRET=sua-app-secret
```

### 🚀 Feature Flags

```env
# Funcionalidades opcionais
FEATURE_BLOG=true|false
FEATURE_COURSES=true|false
FEATURE_FORUM=true|false
FEATURE_GAMIFICATION=true|false
FEATURE_ANALYTICS=true|false
FEATURE_NEWSLETTER=true|false
```

## ⚙️ Configurações por Ambiente

### 🔧 Development

```env
# .env.development
NODE_ENV=development
FLASK_ENV=development
DEBUG=true
LOG_LEVEL=debug

# Database local
DATABASE_URL=sqlite:///mestres_cafe.db

# API local
VITE_API_URL=http://localhost:5000/api

# Email de desenvolvimento
MAIL_SERVER=localhost
MAIL_PORT=1025  # MailHog

# Cache local
REDIS_URL=redis://localhost:6379/0
```

### 🧪 Staging

```env
# .env.staging
NODE_ENV=staging
FLASK_ENV=staging
DEBUG=false
LOG_LEVEL=info

# Database de staging
DATABASE_URL=postgresql://user:pass@staging-db:5432/cafe_staging

# API de staging
VITE_API_URL=https://api-staging.seusite.com

# Email de staging
MAIL_SERVER=smtp.gmail.com
MAIL_PORT=587
MAIL_USE_TLS=true
```

### 🚀 Production

```env
# .env.production
NODE_ENV=production
FLASK_ENV=production
DEBUG=false
LOG_LEVEL=warning

# Database de produção
DATABASE_URL=postgresql://user:pass@prod-db:5432/cafe_production

# API de produção
VITE_API_URL=https://api.seusite.com

# Email de produção
MAIL_SERVER=smtp.gmail.com
MAIL_PORT=587
MAIL_USE_TLS=true
```

## 🛠️ Configuração da Aplicação

### Backend (Flask)

```python
# apps/api/src/config/config.py
import os
from datetime import timedelta

class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'dev-secret-key'
    
    # Database
    SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL') or 'sqlite:///mestres_cafe.db'
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    
    # JWT
    JWT_SECRET_KEY = os.environ.get('JWT_SECRET_KEY') or 'jwt-secret-key'
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(hours=1)
    JWT_REFRESH_TOKEN_EXPIRES = timedelta(days=30)
    
    # Mail
    MAIL_SERVER = os.environ.get('MAIL_SERVER')
    MAIL_PORT = int(os.environ.get('MAIL_PORT') or 587)
    MAIL_USE_TLS = os.environ.get('MAIL_USE_TLS', 'true').lower() == 'true'
    MAIL_USERNAME = os.environ.get('MAIL_USERNAME')
    MAIL_PASSWORD = os.environ.get('MAIL_PASSWORD')

class DevelopmentConfig(Config):
    DEBUG = True
    SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL') or 'sqlite:///mestres_cafe.db'

class ProductionConfig(Config):
    DEBUG = False
    SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL')

config = {
    'development': DevelopmentConfig,
    'production': ProductionConfig,
    'default': DevelopmentConfig
}
```

### Frontend (Vite)

```typescript
// apps/web/src/config/config.ts
interface Config {
  apiUrl: string
  appName: string
  appVersion: string
  features: {
    blog: boolean
    courses: boolean
    forum: boolean
    gamification: boolean
  }
}

export const config: Config = {
  apiUrl: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  appName: import.meta.env.VITE_APP_NAME || 'Café Enterprise',
  appVersion: import.meta.env.VITE_APP_VERSION || '1.0.0',
  features: {
    blog: import.meta.env.VITE_FEATURE_BLOG === 'true',
    courses: import.meta.env.VITE_FEATURE_COURSES === 'true',
    forum: import.meta.env.VITE_FEATURE_FORUM === 'true',
    gamification: import.meta.env.VITE_FEATURE_GAMIFICATION === 'true',
  }
}
```

## 🔒 Segurança

### Geração de Chaves Seguras

```bash
# Gerar SECRET_KEY
python3 -c "import secrets; print(secrets.token_urlsafe(32))"

# Gerar JWT_SECRET_KEY
python3 -c "import secrets; print(secrets.token_urlsafe(32))"

# Gerar senha aleatória
python3 -c "import secrets; print(secrets.token_urlsafe(16))"
```

### Validação de Configurações

```python
# apps/api/src/utils/config_validator.py
import os
import sys

def validate_config():
    """Valida configurações essenciais"""
    required_vars = [
        'SECRET_KEY',
        'JWT_SECRET_KEY',
        'DATABASE_URL'
    ]
    
    missing_vars = []
    for var in required_vars:
        if not os.environ.get(var):
            missing_vars.append(var)
    
    if missing_vars:
        print(f"❌ Variáveis obrigatórias não configuradas: {', '.join(missing_vars)}")
        sys.exit(1)
    
    print("✅ Configurações validadas com sucesso!")

if __name__ == "__main__":
    validate_config()
```

## 📁 Arquivos de Configuração

### Docker Compose

```yaml
# docker-compose.yml
version: '3.8'

services:
  web:
    build: ./apps/web
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=${NODE_ENV}
      - VITE_API_URL=${VITE_API_URL}
    depends_on:
      - api

  api:
    build: ./apps/api
    ports:
      - "5000:5000"
    environment:
      - FLASK_ENV=${FLASK_ENV}
      - DATABASE_URL=${DATABASE_URL}
      - SECRET_KEY=${SECRET_KEY}
      - JWT_SECRET_KEY=${JWT_SECRET_KEY}
    depends_on:
      - db
      - redis

  db:
    image: postgres:15
    environment:
      - POSTGRES_DB=${POSTGRES_DB}
      - POSTGRES_USER=${POSTGRES_USER}
      - POSTGRES_PASSWORD=${POSTGRES_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    volumes:
      - redis_data:/data

volumes:
  postgres_data:
  redis_data:
```

### Nginx

```nginx
# nginx.conf
server {
    listen 80;
    server_name seudominio.com;
    
    # Frontend
    location / {
        root /var/www/html;
        index index.html;
        try_files $uri $uri/ /index.html;
    }
    
    # API
    location /api {
        proxy_pass http://localhost:5000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    # Static files
    location /static {
        alias /var/www/html/static;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

## 🔍 Troubleshooting

### Problemas Comuns

#### 1. Database Connection Error
```bash
# Verificar se o banco está rodando
pg_isready -h localhost -p 5432

# Testar conexão
psql $DATABASE_URL -c "SELECT 1;"
```

#### 2. Redis Connection Error
```bash
# Verificar se o Redis está rodando
redis-cli ping

# Testar conexão
redis-cli -u $REDIS_URL ping
```

#### 3. Email Configuration Error
```bash
# Testar configuração SMTP
python3 -c "
import smtplib
server = smtplib.SMTP('smtp.gmail.com', 587)
server.starttls()
server.login('seu-email@gmail.com', 'sua-senha')
server.quit()
print('✅ Email configurado corretamente')
"
```

### Logs de Configuração

```bash
# Verificar logs da aplicação
tail -f logs/app.log

# Verificar logs do Docker
docker-compose logs -f

# Verificar logs do Nginx
sudo tail -f /var/log/nginx/error.log
```

## 📚 Próximos Passos

- [🗄️ Configuração do Database](./database.md)
- [🐳 Configuração do Docker](./docker.md)
- [🚀 Deploy](./deployment.md)