# 🐳 Guia Docker - Mestres do Café Enterprise

## 🚀 Início Rápido

### 1. Configuração Inicial
```bash
# Copiar arquivo de configuração
cp .env.docker.example .env

# Editar configurações se necessário
nano .env
```

### 2. Desenvolvimento Completo
```bash
# Subir todos os serviços principais
docker-compose up -d

# Ver logs em tempo real
docker-compose logs -f
```

### 3. Com Ferramentas de Desenvolvimento
```bash
# Subir com Adminer, Redis Commander, Mailhog
docker-compose --profile tools up -d
```

### 4. Com Monitoramento
```bash
# Subir com Prometheus e Grafana
docker-compose --profile monitoring up -d
```

### 5. Ambiente Completo
```bash
# Subir tudo (desenvolvimento + ferramentas + monitoramento)
docker-compose --profile tools --profile monitoring up -d
```

## 📋 Serviços Disponíveis

### 🔧 Principais
| Serviço | URL | Descrição |
|---------|-----|-----------|
| **Frontend** | http://localhost:3000 | React + Vite |
| **API** | http://localhost:5001 | Flask + SQLAlchemy |
| **Database** | localhost:5432 | PostgreSQL |
| **Cache** | localhost:6379 | Redis |
| **Proxy** | http://localhost:80 | Nginx |

### 🛠️ Ferramentas (Profile: tools)
| Serviço | URL | Usuário | Senha |
|---------|-----|---------|-------|
| **Adminer** | http://localhost:8080 | postgres | postgres |
| **Redis Commander** | http://localhost:8081 | admin | admin |
| **Mailhog** | http://localhost:8025 | - | - |

### 📊 Monitoramento (Profile: monitoring)
| Serviço | URL | Usuário | Senha |
|---------|-----|---------|-------|
| **Prometheus** | http://localhost:9090 | - | - |
| **Grafana** | http://localhost:3001 | admin | admin |

## 🏗️ Builds Específicos

### Backend API
```bash
# Development
docker build -t mestres-cafe-api:dev --target development apps/api/

# Production
docker build -t mestres-cafe-api:prod --target production apps/api/

# Testing
docker build -t mestres-cafe-api:test --target testing apps/api/
```

### Frontend Web
```bash
# Development
docker build -t mestres-cafe-web:dev --target development apps/web/

# Production (com Nginx)
docker build -t mestres-cafe-web:prod --target production apps/web/

# Standalone (sem Nginx)
docker build -t mestres-cafe-web:standalone --target standalone apps/web/
```

### Build Unificado
```bash
# Produção completa (Frontend + Backend)
docker build -t mestres-cafe:prod --target backend-production .

# Desenvolvimento
docker build -t mestres-cafe:dev --target development .
```

## ⚙️ Configurações Importantes

### Variáveis de Ambiente Principais
```bash
# Portas
WEB_PORT=3000
API_PORT=5001
DB_PORT=5432

# Segurança (ALTERE EM PRODUÇÃO!)
SECRET_KEY=sua-chave-secreta-super-longa
JWT_SECRET_KEY=sua-chave-jwt-super-longa

# Database
DB_NAME=mestres_cafe
DB_USER=postgres
DB_PASSWORD=postgres
```

### Performance Tuning
```bash
# Gunicorn Workers (Backend)
GUNICORN_WORKERS=4
GUNICORN_THREADS=2

# Redis Memory
REDIS_MAXMEMORY=512mb
```

## 🔧 Comandos Úteis

### Gestão de Containers
```bash
# Parar todos os serviços
docker-compose down

# Parar e remover volumes
docker-compose down -v

# Rebuild e restart
docker-compose up --build -d

# Ver status dos serviços
docker-compose ps

# Logs de um serviço específico
docker-compose logs -f api
```

### Manutenção
```bash
# Limpar containers antigos
docker system prune -f

# Limpar volumes não utilizados
docker volume prune -f

# Rebuild apenas um serviço
docker-compose build api
docker-compose up -d api
```

### Debug
```bash
# Entrar no container da API
docker-compose exec api bash

# Entrar no container do Web
docker-compose exec web sh

# Ver variáveis de ambiente
docker-compose exec api env

# Testar conectividade
docker-compose exec api curl -f http://localhost:5001/api/health
```

## 🚀 Deploy em Produção

### 1. Preparação
```bash
# Criar .env de produção
cp .env.docker.example .env.production

# Editar configurações de produção
nano .env.production
```

### 2. Build Otimizado
```bash
# Build de produção
docker-compose -f docker-compose.prod.yml build

# Subir em produção
docker-compose -f docker-compose.prod.yml up -d
```

### 3. Configurações de Produção Importantes
```bash
# Segurança
SECRET_KEY=chave-super-segura-de-32-caracteres-ou-mais
JWT_SECRET_KEY=chave-jwt-super-segura-de-32-caracteres-ou-mais

# Performance
GUNICORN_WORKERS=8
REDIS_MAXMEMORY=1gb

# URLs
FRONTEND_URL=https://seudominio.com
API_URL=https://api.seudominio.com
```

## 🔍 Troubleshooting

### Problemas Comuns

#### 1. Permissões de Volume
```bash
# Corrigir permissões
sudo chown -R $USER:$USER volumes/
```

#### 2. Porta já em uso
```bash
# Verificar portas em uso
netstat -tulpn | grep :3000

# Alterar porta no .env
WEB_PORT=3001
```

#### 3. Build falhando
```bash
# Limpar cache do Docker
docker builder prune -f

# Rebuild completo
docker-compose build --no-cache
```

#### 4. Container não inicia
```bash
# Ver logs detalhados
docker-compose logs api

# Verificar health check
docker-compose ps
```

## 📁 Estrutura de Volumes

```
volumes/
├── postgres_data/      # Dados do PostgreSQL
├── redis_data/         # Dados do Redis
├── api_logs/          # Logs da API
├── api_uploads/       # Uploads da API
├── nginx_logs/        # Logs do Nginx
└── grafana_data/      # Dashboards do Grafana
```

## 🔐 Segurança

### ✅ Implementado
- Usuários não-root em todos os containers
- Secrets via variáveis de ambiente
- Network isolada
- Health checks robustos

### ⚠️ Para Produção
- Configurar SSL/TLS real
- Usar secrets do Docker/Kubernetes
- Implementar backup automatizado
- Configurar firewall adequado

## 📈 Monitoramento

### Métricas Disponíveis
- **API**: Response time, error rate, throughput
- **Database**: Conexões, queries, performance
- **Redis**: Memory usage, hit rate, connections
- **Nginx**: Request rate, response codes, latency

### Dashboards Grafana
- Sistema geral
- Performance da API
- Uso do banco de dados
- Cache Redis