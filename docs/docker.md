# 🐳 Docker - Guia Completo

Este documento fornece informações detalhadas sobre o uso do Docker no projeto Café Enterprise.

## 🏗️ Arquitetura Docker

### Estrutura de Containers

```
┌─────────────────────────────────────────────────────────────┐
│                    Café Enterprise                          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Frontend   │  │   Backend    │  │   Database   │      │
│  │   (React)    │  │   (Flask)    │  │ (PostgreSQL) │      │
│  │   Port 3000  │  │   Port 5000  │  │   Port 5432  │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│                                                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │    Redis     │  │    Nginx     │  │   Volumes    │      │
│  │   (Cache)    │  │   (Proxy)    │  │   (Storage)  │      │
│  │   Port 6379  │  │   Port 80    │  │              │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## 📦 Containers Disponíveis

### 1. Frontend (React + Vite)
```dockerfile
FROM node:18-alpine

WORKDIR /app

# Copiar dependências
COPY package*.json ./
RUN npm ci --only=production

# Copiar código
COPY . .

# Build para produção
RUN npm run build

# Servir com nginx
FROM nginx:alpine
COPY --from=0 /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### 2. Backend (Flask + Python)
```dockerfile
FROM python:3.11-slim

WORKDIR /app

# Instalar dependências do sistema
RUN apt-get update && apt-get install -y \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# Copiar e instalar dependências Python
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copiar código
COPY . .

# Criar usuário não-root
RUN useradd --create-home --shell /bin/bash app
RUN chown -R app:app /app
USER app

EXPOSE 5000
CMD ["python", "src/app.py"]
```

### 3. Database (PostgreSQL)
```dockerfile
FROM postgres:15-alpine

# Configurações customizadas
COPY postgresql.conf /etc/postgresql/postgresql.conf
COPY pg_hba.conf /etc/postgresql/pg_hba.conf

# Scripts de inicialização
COPY init-scripts/ /docker-entrypoint-initdb.d/

EXPOSE 5432
```

## 🚀 Configurações Docker Compose

### Desenvolvimento (`docker-compose.yml`)

```yaml
version: '3.8'

services:
  # Frontend
  web:
    build:
      context: ./apps/web
      dockerfile: Dockerfile.dev
    ports:
      - "3000:3000"
    volumes:
      - ./apps/web:/app
      - /app/node_modules
    environment:
      - NODE_ENV=development
      - VITE_API_BASE_URL=http://localhost:5000
    depends_on:
      - api
    networks:
      - cafe-network

  # Backend
  api:
    build:
      context: ./apps/api
      dockerfile: Dockerfile.dev
    ports:
      - "5000:5000"
    volumes:
      - ./apps/api:/app
    environment:
      - FLASK_ENV=development
      - DATABASE_URL=postgresql://cafe_user:cafe_pass@db:5432/cafe_db
      - REDIS_URL=redis://redis:6379
    depends_on:
      - db
      - redis
    networks:
      - cafe-network

  # Database
  db:
    image: postgres:15-alpine
    environment:
      - POSTGRES_DB=cafe_db
      - POSTGRES_USER=cafe_user
      - POSTGRES_PASSWORD=cafe_pass
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./scripts/init-db.sql:/docker-entrypoint-initdb.d/init.sql
    ports:
      - "5432:5432"
    networks:
      - cafe-network

  # Redis
  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    networks:
      - cafe-network

  # Nginx (apenas em produção)
  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf
      - ./nginx/ssl:/etc/nginx/ssl
    depends_on:
      - web
      - api
    networks:
      - cafe-network
    profiles:
      - production

volumes:
  postgres_data:
  redis_data:

networks:
  cafe-network:
    driver: bridge
```

### Produção (`docker-compose.prod.yml`)

```yaml
version: '3.8'

services:
  # Frontend
  web:
    build:
      context: ./apps/web
      dockerfile: Dockerfile.prod
    environment:
      - NODE_ENV=production
      - VITE_API_BASE_URL=https://api.seudominio.com
    networks:
      - cafe-network
    restart: unless-stopped

  # Backend
  api:
    build:
      context: ./apps/api
      dockerfile: Dockerfile.prod
    environment:
      - FLASK_ENV=production
      - DATABASE_URL=${DATABASE_URL}
      - REDIS_URL=${REDIS_URL}
      - SECRET_KEY=${SECRET_KEY}
    networks:
      - cafe-network
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:5000/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  # Database
  db:
    image: postgres:15-alpine
    environment:
      - POSTGRES_DB=${POSTGRES_DB}
      - POSTGRES_USER=${POSTGRES_USER}
      - POSTGRES_PASSWORD=${POSTGRES_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./backups:/backups
    networks:
      - cafe-network
    restart: unless-stopped

  # Redis
  redis:
    image: redis:7-alpine
    command: redis-server --appendonly yes --requirepass ${REDIS_PASSWORD}
    volumes:
      - redis_data:/data
    networks:
      - cafe-network
    restart: unless-stopped

  # Nginx
  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf
      - ./nginx/ssl:/etc/nginx/ssl
      - ./nginx/logs:/var/log/nginx
    depends_on:
      - web
      - api
    networks:
      - cafe-network
    restart: unless-stopped

  # Monitoring
  prometheus:
    image: prom/prometheus:latest
    ports:
      - "9090:9090"
    volumes:
      - ./monitoring/prometheus.yml:/etc/prometheus/prometheus.yml
      - prometheus_data:/prometheus
    networks:
      - cafe-network
    restart: unless-stopped

  grafana:
    image: grafana/grafana:latest
    ports:
      - "3001:3000"
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=${GRAFANA_PASSWORD}
    volumes:
      - grafana_data:/var/lib/grafana
    networks:
      - cafe-network
    restart: unless-stopped

volumes:
  postgres_data:
  redis_data:
  prometheus_data:
  grafana_data:

networks:
  cafe-network:
    driver: bridge
```

## 🔧 Dockerfiles

### Frontend - Desenvolvimento
```dockerfile
# apps/web/Dockerfile.dev
FROM node:18-alpine

WORKDIR /app

# Instalar dependências
COPY package*.json ./
RUN npm ci

# Copiar código
COPY . .

# Expor porta
EXPOSE 3000

# Comando de desenvolvimento
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
```

### Frontend - Produção
```dockerfile
# apps/web/Dockerfile.prod
FROM node:18-alpine AS build

WORKDIR /app

# Instalar dependências
COPY package*.json ./
RUN npm ci --only=production

# Copiar código e fazer build
COPY . .
RUN npm run build

# Estágio de produção
FROM nginx:alpine

# Copiar arquivos buildados
COPY --from=build /app/dist /usr/share/nginx/html

# Copiar configuração do nginx
COPY nginx.conf /etc/nginx/nginx.conf

# Expor porta
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
```

### Backend - Desenvolvimento
```dockerfile
# apps/api/Dockerfile.dev
FROM python:3.11-slim

WORKDIR /app

# Instalar dependências do sistema
RUN apt-get update && apt-get install -y \
    gcc \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Instalar dependências Python
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copiar código
COPY . .

# Expor porta
EXPOSE 5000

# Comando de desenvolvimento
CMD ["python", "src/app.py"]
```

### Backend - Produção
```dockerfile
# apps/api/Dockerfile.prod
FROM python:3.11-slim

WORKDIR /app

# Instalar dependências do sistema
RUN apt-get update && apt-get install -y \
    gcc \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Criar usuário não-root
RUN useradd --create-home --shell /bin/bash app

# Instalar dependências Python
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copiar código
COPY . .
RUN chown -R app:app /app

# Mudar para usuário não-root
USER app

# Expor porta
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:5000/health || exit 1

# Comando de produção
CMD ["gunicorn", "--bind", "0.0.0.0:5000", "--workers", "4", "src.app:app"]
```

## 🚀 Comandos Docker

### Desenvolvimento

```bash
# Construir e iniciar todos os serviços
docker-compose up --build

# Iniciar em background
docker-compose up -d

# Ver logs
docker-compose logs -f

# Ver logs de um serviço específico
docker-compose logs -f api

# Parar serviços
docker-compose down

# Parar e remover volumes
docker-compose down -v

# Reconstruir um serviço específico
docker-compose up --build api

# Executar comando em um container
docker-compose exec api bash
docker-compose exec db psql -U cafe_user -d cafe_db
```

### Produção

```bash
# Deploy completo
docker-compose -f docker-compose.prod.yml up -d

# Atualizar apenas a API
docker-compose -f docker-compose.prod.yml up -d --no-deps api

# Backup do banco
docker-compose exec db pg_dump -U cafe_user cafe_db > backup.sql

# Restore do banco
docker-compose exec -T db psql -U cafe_user -d cafe_db < backup.sql

# Ver status dos containers
docker-compose ps

# Monitorar recursos
docker stats
```

## 📊 Nginx Configuration

```nginx
# nginx/nginx.conf
events {
    worker_connections 1024;
}

http {
    upstream frontend {
        server web:80;
    }
    
    upstream backend {
        server api:5000;
    }
    
    # Rate limiting
    limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
    
    server {
        listen 80;
        server_name localhost;
        
        # Security headers
        add_header X-Frame-Options "SAMEORIGIN" always;
        add_header X-Content-Type-Options "nosniff" always;
        add_header X-XSS-Protection "1; mode=block" always;
        
        # Frontend
        location / {
            proxy_pass http://frontend;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }
        
        # Backend API
        location /api/ {
            limit_req zone=api burst=20 nodelay;
            proxy_pass http://backend/;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }
        
        # Health check
        location /health {
            access_log off;
            return 200 "healthy\n";
        }
    }
    
    # HTTPS redirect (produção)
    server {
        listen 443 ssl;
        server_name seudominio.com;
        
        ssl_certificate /etc/nginx/ssl/cert.pem;
        ssl_certificate_key /etc/nginx/ssl/key.pem;
        
        # SSL config
        ssl_protocols TLSv1.2 TLSv1.3;
        ssl_ciphers HIGH:!aNULL:!MD5;
        ssl_prefer_server_ciphers on;
        
        # Rest of config...
    }
}
```

## 🔍 Monitoramento

### Health Checks

```python
# apps/api/src/health.py
from flask import jsonify
from database import get_db

def health_check():
    """Verificar saúde da aplicação"""
    try:
        # Testar banco de dados
        db = next(get_db())
        db.execute("SELECT 1")
        db_status = "healthy"
    except Exception as e:
        db_status = f"unhealthy: {str(e)}"
    
    return jsonify({
        "status": "healthy" if db_status == "healthy" else "unhealthy",
        "database": db_status,
        "timestamp": datetime.utcnow().isoformat()
    })
```

### Logs Estruturados

```python
# apps/api/src/logging_config.py
import logging
import json
from datetime import datetime

class JSONFormatter(logging.Formatter):
    def format(self, record):
        log_entry = {
            "timestamp": datetime.utcnow().isoformat(),
            "level": record.levelname,
            "message": record.getMessage(),
            "module": record.module,
            "function": record.funcName,
            "line": record.lineno
        }
        
        if hasattr(record, 'user_id'):
            log_entry['user_id'] = record.user_id
            
        return json.dumps(log_entry)

# Configurar logging
logging.basicConfig(level=logging.INFO)
handler = logging.StreamHandler()
handler.setFormatter(JSONFormatter())
logger = logging.getLogger(__name__)
logger.addHandler(handler)
```

## 📦 Volumes e Persistência

### Volumes Nomeados

```yaml
volumes:
  # Dados do PostgreSQL
  postgres_data:
    driver: local
    driver_opts:
      type: none
      o: bind
      device: /var/lib/postgresql/data
  
  # Cache Redis
  redis_data:
    driver: local
  
  # Logs Nginx
  nginx_logs:
    driver: local
  
  # Uploads/Media
  media_files:
    driver: local
    driver_opts:
      type: none
      o: bind
      device: /app/media
```

### Backup Strategy

```bash
#!/bin/bash
# scripts/backup.sh

# Variáveis
BACKUP_DIR="/backups"
DATE=$(date +%Y%m%d_%H%M%S)

# Backup PostgreSQL
docker-compose exec -T db pg_dump -U $POSTGRES_USER $POSTGRES_DB | gzip > "$BACKUP_DIR/db_backup_$DATE.sql.gz"

# Backup Redis
docker-compose exec -T redis redis-cli BGSAVE
docker cp $(docker-compose ps -q redis):/data/dump.rdb "$BACKUP_DIR/redis_backup_$DATE.rdb"

# Backup arquivos estáticos
tar -czf "$BACKUP_DIR/media_backup_$DATE.tar.gz" -C /app/media .

# Limpar backups antigos (manter últimos 7 dias)
find $BACKUP_DIR -name "*.gz" -mtime +7 -delete
find $BACKUP_DIR -name "*.rdb" -mtime +7 -delete
```

## 🔐 Segurança

### Secrets Management

```yaml
# docker-compose.prod.yml
secrets:
  db_password:
    file: ./secrets/db_password.txt
  jwt_secret:
    file: ./secrets/jwt_secret.txt
  redis_password:
    file: ./secrets/redis_password.txt

services:
  api:
    secrets:
      - db_password
      - jwt_secret
    environment:
      - DATABASE_PASSWORD_FILE=/run/secrets/db_password
      - JWT_SECRET_FILE=/run/secrets/jwt_secret
```

### Network Security

```yaml
# Redes isoladas
networks:
  # Rede pública (nginx)
  public:
    driver: bridge
  
  # Rede privada (api + db)
  private:
    driver: bridge
    internal: true

services:
  nginx:
    networks:
      - public
      - private
  
  api:
    networks:
      - private
  
  db:
    networks:
      - private
```

## 🚀 Deploy Automatizado

### CI/CD com GitHub Actions

```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Deploy to server
      uses: appleboy/ssh-action@v0.1.5
      with:
        host: ${{ secrets.HOST }}
        username: ${{ secrets.USERNAME }}
        key: ${{ secrets.SSH_KEY }}
        script: |
          cd /app/cafe
          git pull origin main
          docker-compose -f docker-compose.prod.yml down
          docker-compose -f docker-compose.prod.yml up -d --build
```

### Rollback Strategy

```bash
#!/bin/bash
# scripts/rollback.sh

# Obter versão anterior
PREVIOUS_VERSION=$(git log --oneline -n 2 | tail -1 | cut -d' ' -f1)

# Fazer rollback
git checkout $PREVIOUS_VERSION
docker-compose -f docker-compose.prod.yml down
docker-compose -f docker-compose.prod.yml up -d --build

echo "Rollback para versão $PREVIOUS_VERSION concluído"
```

## 🧪 Testes

### Testes de Integração

```python
# tests/test_integration.py
import pytest
import docker
import requests
import time

@pytest.fixture(scope="session")
def docker_services():
    client = docker.from_env()
    
    # Iniciar serviços
    client.containers.run(
        "cafe-web",
        ports={'3000/tcp': 3000},
        detach=True,
        name="test-web"
    )
    
    # Aguardar inicialização
    time.sleep(30)
    
    yield
    
    # Limpar
    client.containers.get("test-web").stop()
    client.containers.get("test-web").remove()

def test_frontend_health(docker_services):
    response = requests.get("http://localhost:3000")
    assert response.status_code == 200

def test_api_health(docker_services):
    response = requests.get("http://localhost:5000/health")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"
```

---

Para mais informações sobre configurações específicas, consulte os arquivos Docker em [`docker-compose.yml`](../docker-compose.yml) e [`docker-compose.prod.yml`](../docker-compose.prod.yml).