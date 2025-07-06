# 🔧 Especificações de Sistema - Mestres Café Enterprise

## Visão Geral

Este documento contém todas as especificações técnicas detalhadas do sistema Mestres Café Enterprise, incluindo configurações, dependências, parâmetros e requisitos de sistema.

## 1. Requisitos de Sistema

### Requisitos Mínimos (Desenvolvimento)

```yaml
hardware:
  cpu: "2 cores (2.0 GHz)"
  memory: "8 GB RAM"
  storage: "20 GB SSD"
  network: "Conexão banda larga"

software:
  os: ["Linux", "macOS", "Windows 10+"]
  docker: "20.10+"
  docker_compose: "1.29+"
  nodejs: "18.0+"
  python: "3.11+"
  git: "2.30+"

optional:
  ide: ["VS Code", "PyCharm", "WebStorm"]
  browser: ["Chrome 90+", "Firefox 88+", "Safari 14+"]
```

### Requisitos Recomendados (Produção)

```yaml
hardware:
  cpu: "8 cores (3.0 GHz)"
  memory: "32 GB RAM"
  storage: "100 GB SSD NVMe"
  network: "1 Gbps"

software:
  os: "Ubuntu 22.04 LTS"
  container_runtime: "containerd 1.6+"
  kubernetes: "1.28+"
  postgresql: "15+"
  redis: "7+"
  nginx: "1.24+"

cloud_requirements:
  provider: ["AWS", "GCP", "Azure"]
  regions: "Multi-region deployment"
  availability_zones: "Minimum 3 AZs"
  load_balancer: "Application Load Balancer"
  cdn: "CloudFront / CloudFlare"
```

## 2. Dependências e Versões

### Frontend (React)

```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.8.0",
    "typescript": "^4.9.0",
    "@types/react": "^18.0.0",
    "@types/react-dom": "^18.0.0",
    "vite": "^4.0.0",
    "@vitejs/plugin-react": "^3.0.0",
    "tailwindcss": "^3.2.0",
    "postcss": "^8.4.0",
    "autoprefixer": "^10.4.0",
    "@headlessui/react": "^1.7.0",
    "@heroicons/react": "^2.0.0",
    "framer-motion": "^8.5.0",
    "react-hook-form": "^7.43.0",
    "react-query": "^3.39.0",
    "axios": "^1.3.0",
    "date-fns": "^2.29.0",
    "react-hot-toast": "^2.4.0",
    "zustand": "^4.3.0",
    "lucide-react": "^0.127.0"
  },
  "devDependencies": {
    "@types/node": "^18.0.0",
    "@typescript-eslint/eslint-plugin": "^5.0.0",
    "@typescript-eslint/parser": "^5.0.0",
    "eslint": "^8.0.0",
    "eslint-plugin-react": "^7.32.0",
    "eslint-plugin-react-hooks": "^4.6.0",
    "prettier": "^2.8.0",
    "vitest": "^0.28.0",
    "@testing-library/react": "^13.4.0",
    "@testing-library/jest-dom": "^5.16.0",
    "jsdom": "^21.0.0"
  },
  "engines": {
    "node": ">=18.0.0",
    "npm": ">=8.0.0"
  }
}
```

### Backend (Flask)

```txt
# Core Framework
Flask==3.0.0
Flask-SQLAlchemy==3.1.1
Flask-Migrate==4.0.5
Flask-JWT-Extended==4.5.3
Flask-CORS==4.0.0
Flask-Mail==0.9.1
Flask-Limiter==3.5.0

# Database
SQLAlchemy==2.0.23
psycopg2-binary==2.9.9
redis==5.0.1
alembic==1.12.1

# Authentication & Security
bcrypt==4.1.2
PyJWT==2.8.0
cryptography==41.0.8
python-dotenv==1.0.0

# HTTP & API
requests==2.31.0
urllib3==2.1.0
Werkzeug==3.0.1

# Data Processing
pandas==2.1.4
numpy==1.25.2
python-dateutil==2.8.2

# Task Queue
celery==5.3.4
kombu==5.3.4
billiard==4.2.0

# Monitoring & Logging
prometheus-client==0.19.0
structlog==23.2.0
sentry-sdk==1.38.0

# File Processing
Pillow==10.1.0
python-magic==0.4.27

# Validation
marshmallow==3.20.1
cerberus==1.3.5

# Testing
pytest==7.4.3
pytest-flask==1.3.0
pytest-cov==4.1.0
factory-boy==3.3.0

# Development
black==23.11.0
flake8==6.1.0
isort==5.12.0
mypy==1.7.1

# Production
gunicorn==21.2.0
gevent==23.9.1
```

### Shared Packages

```json
{
  "name": "@mestres-cafe/shared",
  "version": "1.0.0",
  "dependencies": {
    "zod": "^3.20.0",
    "date-fns": "^2.29.0",
    "lodash": "^4.17.0",
    "@types/lodash": "^4.14.0"
  },
  "peerDependencies": {
    "typescript": "^4.9.0"
  }
}
```

## 3. Configurações de Ambiente

### Variáveis de Ambiente (.env)

```bash
# Application
NODE_ENV=development
APP_NAME=mestres-cafe-enterprise
APP_VERSION=1.0.0
APP_URL=http://localhost:3000
API_URL=http://localhost:5000

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/mestres_cafe_dev
DATABASE_POOL_SIZE=20
DATABASE_MAX_OVERFLOW=30
DATABASE_POOL_TIMEOUT=30
DATABASE_POOL_RECYCLE=3600

# Redis
REDIS_URL=redis://localhost:6379/0
REDIS_PASSWORD=
REDIS_DB=0
REDIS_MAX_CONNECTIONS=50

# Authentication
JWT_SECRET_KEY=your-super-secret-jwt-key-here
JWT_ACCESS_TOKEN_EXPIRES=3600
JWT_REFRESH_TOKEN_EXPIRES=2592000
BCRYPT_ROUNDS=12

# Email
MAIL_SERVER=smtp.gmail.com
MAIL_PORT=587
MAIL_USE_TLS=true
MAIL_USERNAME=your-email@gmail.com
MAIL_PASSWORD=your-app-password
MAIL_DEFAULT_SENDER=noreply@mestrescafe.com

# File Storage
UPLOAD_FOLDER=uploads
MAX_CONTENT_LENGTH=16777216
ALLOWED_EXTENSIONS=jpg,jpeg,png,gif,pdf,doc,docx

# External APIs
PAYMENT_GATEWAY_URL=https://api.payment-provider.com
PAYMENT_GATEWAY_KEY=your-payment-key
SHIPPING_API_URL=https://api.shipping-provider.com
SHIPPING_API_KEY=your-shipping-key

# Monitoring
SENTRY_DSN=https://your-sentry-dsn@sentry.io/project
PROMETHEUS_METRICS_PORT=8000
LOG_LEVEL=INFO

# Security
CORS_ORIGINS=http://localhost:3000,https://mestrescafe.com
RATE_LIMIT_PER_MINUTE=60
RATE_LIMIT_PER_HOUR=1000

# Feature Flags
ENABLE_REGISTRATION=true
ENABLE_SOCIAL_LOGIN=false
ENABLE_NEWSLETTER=true
ENABLE_BLOG=true
ENABLE_COURSES=true
```

### Configuração Docker Compose

```yaml
version: '3.8'

services:
  # Web Application
  web:
    build:
      context: ./apps/web
      dockerfile: Dockerfile
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=development
      - VITE_API_URL=http://localhost:5000
    volumes:
      - ./apps/web:/app
      - /app/node_modules
    depends_on:
      - api
    networks:
      - mestres-cafe-network

  # API Server
  api:
    build:
      context: ./apps/api
      dockerfile: Dockerfile
    ports:
      - "5000:5000"
    environment:
      - FLASK_ENV=development
      - DATABASE_URL=postgresql://postgres:password@db:5432/mestres_cafe
      - REDIS_URL=redis://redis:6379/0
    volumes:
      - ./apps/api:/app
      - ./uploads:/app/uploads
    depends_on:
      - db
      - redis
    networks:
      - mestres-cafe-network

  # Database
  db:
    image: postgres:15-alpine
    environment:
      - POSTGRES_DB=mestres_cafe
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=password
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./scripts/init-db.sql:/docker-entrypoint-initdb.d/init-db.sql
    ports:
      - "5432:5432"
    networks:
      - mestres-cafe-network

  # Redis Cache
  redis:
    image: redis:7-alpine
    command: redis-server --appendonly yes
    volumes:
      - redis_data:/data
    ports:
      - "6379:6379"
    networks:
      - mestres-cafe-network

  # Background Workers
  worker:
    build:
      context: ./apps/api
      dockerfile: Dockerfile
    command: celery -A app.celery worker --loglevel=info
    environment:
      - FLASK_ENV=development
      - DATABASE_URL=postgresql://postgres:password@db:5432/mestres_cafe
      - REDIS_URL=redis://redis:6379/0
    volumes:
      - ./apps/api:/app
    depends_on:
      - db
      - redis
    networks:
      - mestres-cafe-network

  # Celery Beat Scheduler
  scheduler:
    build:
      context: ./apps/api
      dockerfile: Dockerfile
    command: celery -A app.celery beat --loglevel=info
    environment:
      - FLASK_ENV=development
      - DATABASE_URL=postgresql://postgres:password@db:5432/mestres_cafe
      - REDIS_URL=redis://redis:6379/0
    volumes:
      - ./apps/api:/app
    depends_on:
      - db
      - redis
    networks:
      - mestres-cafe-network

  # Nginx Load Balancer
  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf
      - ./nginx/sites:/etc/nginx/sites-available
      - ./certs:/etc/nginx/certs
    depends_on:
      - web
      - api
    networks:
      - mestres-cafe-network

volumes:
  postgres_data:
  redis_data:

networks:
  mestres-cafe-network:
    driver: bridge
```

## 4. Configuração de Banco de Dados

### PostgreSQL Configuration

```sql
-- postgresql.conf
max_connections = 200
shared_buffers = 256MB
effective_cache_size = 1GB
maintenance_work_mem = 64MB
checkpoint_completion_target = 0.9
wal_buffers = 16MB
default_statistics_target = 100
random_page_cost = 1.1
effective_io_concurrency = 200
work_mem = 4MB
min_wal_size = 1GB
max_wal_size = 4GB

-- pg_hba.conf
host    all             all             0.0.0.0/0               md5
local   all             all                                     trust
```

### Redis Configuration

```conf
# redis.conf
maxmemory 512mb
maxmemory-policy allkeys-lru
save 900 1
save 300 10
save 60 10000
appendonly yes
appendfsync everysec
auto-aof-rewrite-percentage 100
auto-aof-rewrite-min-size 64mb
```

## 5. Configuração de Monitoramento

### Prometheus Configuration

```yaml
global:
  scrape_interval: 15s
  evaluation_interval: 15s

rule_files:
  - "alerts/*.yml"

scrape_configs:
  - job_name: 'mestres-cafe-api'
    static_configs:
      - targets: ['api:5000']
    metrics_path: '/metrics'
    scrape_interval: 5s

  - job_name: 'mestres-cafe-web'
    static_configs:
      - targets: ['web:3000']
    
  - job_name: 'node-exporter'
    static_configs:
      - targets: ['node-exporter:9100']
      
  - job_name: 'postgres-exporter'
    static_configs:
      - targets: ['postgres-exporter:9187']
      
  - job_name: 'redis-exporter'
    static_configs:
      - targets: ['redis-exporter:9121']

alerting:
  alertmanagers:
    - static_configs:
        - targets:
          - alertmanager:9093
```

### Grafana Dashboard Configuration

```json
{
  "dashboard": {
    "id": null,
    "title": "Mestres Café - System Overview",
    "tags": ["mestres-cafe", "overview"],
    "timezone": "America/Sao_Paulo",
    "panels": [
      {
        "id": 1,
        "title": "Request Rate",
        "type": "graph",
        "targets": [
          {
            "expr": "rate(http_requests_total[5m])",
            "legendFormat": "{{method}} {{status}}"
          }
        ]
      },
      {
        "id": 2,
        "title": "Response Time",
        "type": "graph",
        "targets": [
          {
            "expr": "histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m]))",
            "legendFormat": "95th percentile"
          }
        ]
      },
      {
        "id": 3,
        "title": "Error Rate",
        "type": "stat",
        "targets": [
          {
            "expr": "rate(http_requests_total{status=~\"5..\"}[5m])",
            "legendFormat": "5xx errors"
          }
        ]
      }
    ],
    "time": {
      "from": "now-1h",
      "to": "now"
    },
    "refresh": "5s"
  }
}
```

## 6. Configuração de Segurança

### SSL/TLS Configuration

```nginx
# nginx/ssl.conf
ssl_protocols TLSv1.2 TLSv1.3;
ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384;
ssl_ecdh_curve secp384r1;
ssl_session_timeout 10m;
ssl_session_cache shared:SSL:10m;
ssl_session_tickets off;
ssl_prefer_server_ciphers on;
add_header Strict-Transport-Security "max-age=63072000; includeSubDomains; preload";
add_header X-Frame-Options DENY;
add_header X-Content-Type-Options nosniff;
add_header X-XSS-Protection "1; mode=block";
add_header Referrer-Policy "strict-origin-when-cross-origin";
```

### CORS Configuration

```python
# Flask CORS configuration
CORS_CONFIG = {
    'origins': [
        'http://localhost:3000',
        'https://mestrescafe.com',
        'https://www.mestrescafe.com'
    ],
    'methods': ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    'allow_headers': [
        'Content-Type',
        'Authorization',
        'X-Requested-With',
        'Accept'
    ],
    'expose_headers': [
        'Content-Range',
        'X-Content-Range',
        'X-Total-Count'
    ],
    'supports_credentials': True,
    'max_age': 3600
}
```

## 7. Performance Configuration

### Database Optimization

```sql
-- Indexes for performance
CREATE INDEX CONCURRENTLY idx_products_category_active ON products(category_id, is_active);
CREATE INDEX CONCURRENTLY idx_orders_user_status ON orders(user_id, status);
CREATE INDEX CONCURRENTLY idx_orders_created_at ON orders(created_at);
CREATE INDEX CONCURRENTLY idx_users_email_active ON users(email, is_active);
CREATE INDEX CONCURRENTLY idx_cart_items_cart_product ON cart_items(cart_id, product_id);

-- Full-text search indexes
CREATE INDEX CONCURRENTLY idx_products_search ON products USING gin(to_tsvector('portuguese', name || ' ' || description));
CREATE INDEX CONCURRENTLY idx_blog_posts_search ON blog_posts USING gin(to_tsvector('portuguese', title || ' ' || content));

-- Partial indexes
CREATE INDEX CONCURRENTLY idx_orders_pending ON orders(created_at) WHERE status = 'pending';
CREATE INDEX CONCURRENTLY idx_products_active ON products(id) WHERE is_active = true;
```

### Caching Configuration

```python
# Redis caching configuration
CACHE_CONFIG = {
    'CACHE_TYPE': 'redis',
    'CACHE_REDIS_URL': 'redis://redis:6379/0',
    'CACHE_DEFAULT_TIMEOUT': 300,
    'CACHE_KEY_PREFIX': 'mestres_cafe:',
    'CACHE_REDIS_DB': 0
}

# Cache timeouts
CACHE_TIMEOUTS = {
    'products': 3600,      # 1 hour
    'categories': 7200,    # 2 hours
    'user_session': 1800,  # 30 minutes
    'cart': 900,           # 15 minutes
    'search_results': 600  # 10 minutes
}
```

## 8. Logging Configuration

### Structured Logging

```python
# logging_config.py
import structlog

LOGGING_CONFIG = {
    'version': 1,
    'disable_existing_loggers': False,
    'formatters': {
        'json': {
            'format': '%(message)s',
            'class': 'pythonjsonlogger.jsonlogger.JsonFormatter'
        }
    },
    'handlers': {
        'console': {
            'class': 'logging.StreamHandler',
            'formatter': 'json',
            'level': 'INFO'
        },
        'file': {
            'class': 'logging.handlers.RotatingFileHandler',
            'filename': 'logs/app.log',
            'maxBytes': 10485760,  # 10MB
            'backupCount': 5,
            'formatter': 'json',
            'level': 'INFO'
        }
    },
    'loggers': {
        '': {
            'handlers': ['console', 'file'],
            'level': 'INFO',
            'propagate': False
        }
    }
}

# Configure structlog
structlog.configure(
    processors=[
        structlog.stdlib.filter_by_level,
        structlog.stdlib.add_logger_name,
        structlog.stdlib.add_log_level,
        structlog.stdlib.PositionalArgumentsFormatter(),
        structlog.processors.TimeStamper(fmt="iso"),
        structlog.processors.StackInfoRenderer(),
        structlog.processors.format_exc_info,
        structlog.processors.UnicodeDecoder(),
        structlog.processors.JSONRenderer()
    ],
    context_class=dict,
    logger_factory=structlog.stdlib.LoggerFactory(),
    wrapper_class=structlog.stdlib.BoundLogger,
    cache_logger_on_first_use=True,
)
```

## 9. Backup Configuration

### Automated Backup Scripts

```bash
#!/bin/bash
# backup.sh

# Configuration
DB_NAME="mestres_cafe"
DB_USER="postgres"
DB_HOST="localhost"
BACKUP_DIR="/var/backups/mestres-cafe"
DATE=$(date +%Y%m%d_%H%M%S)
RETENTION_DAYS=30

# Create backup directory
mkdir -p ${BACKUP_DIR}

# Database backup
pg_dump -h ${DB_HOST} -U ${DB_USER} -d ${DB_NAME} | gzip > ${BACKUP_DIR}/db_${DATE}.sql.gz

# Redis backup
redis-cli --rdb ${BACKUP_DIR}/redis_${DATE}.rdb

# File storage backup
tar -czf ${BACKUP_DIR}/uploads_${DATE}.tar.gz /app/uploads

# Remove old backups
find ${BACKUP_DIR} -name "*.sql.gz" -mtime +${RETENTION_DAYS} -delete
find ${BACKUP_DIR} -name "*.rdb" -mtime +${RETENTION_DAYS} -delete
find ${BACKUP_DIR} -name "*.tar.gz" -mtime +${RETENTION_DAYS} -delete

# Upload to S3 (optional)
if [ ! -z "$AWS_S3_BUCKET" ]; then
    aws s3 sync ${BACKUP_DIR} s3://${AWS_S3_BUCKET}/backups/
fi
```

## 10. Deployment Configuration

### Kubernetes Deployment

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: mestres-cafe-api
  labels:
    app: mestres-cafe-api
spec:
  replicas: 3
  selector:
    matchLabels:
      app: mestres-cafe-api
  template:
    metadata:
      labels:
        app: mestres-cafe-api
    spec:
      containers:
      - name: api
        image: mestres-cafe/api:latest
        ports:
        - containerPort: 5000
        env:
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: mestres-cafe-secrets
              key: database-url
        - name: REDIS_URL
          valueFrom:
            secretKeyRef:
              name: mestres-cafe-secrets
              key: redis-url
        resources:
          requests:
            memory: "512Mi"
            cpu: "250m"
          limits:
            memory: "1Gi"
            cpu: "500m"
        livenessProbe:
          httpGet:
            path: /health
            port: 5000
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /health/ready
            port: 5000
          initialDelaySeconds: 5
          periodSeconds: 5
```

## Conclusão

Esta documentação de especificações técnicas fornece todos os detalhes necessários para configurar, executar e manter o sistema Mestres Café Enterprise, incluindo:

- **Requisitos de sistema** para diferentes ambientes
- **Dependências completas** com versões específicas
- **Configurações de ambiente** detalhadas
- **Configurações de infraestrutura** otimizadas
- **Configurações de segurança** robustas
- **Otimizações de performance** implementadas
- **Estratégias de backup** automatizadas
- **Configurações de deployment** para produção

Essas especificações garantem que o sistema seja executado de forma consistente e otimizada em qualquer ambiente.