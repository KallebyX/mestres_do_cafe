# 🐳 **Deploy Docker - Mestres do Café**

Guia completo para deploy usando Docker e Docker Compose.

---

## 🎯 **Opções de Deploy**

### **1. Docker Compose (Recomendado)**
- ✅ Fácil de usar
- ✅ Ambiente completo (app + banco + cache)
- ✅ Configuração automática

### **2. Docker Standalone**
- ✅ Apenas a aplicação
- ✅ Menor uso de recursos
- ✅ Integração com bancos externos

### **3. Kubernetes**
- ✅ Produção enterprise
- ✅ Auto-scaling
- ✅ Alta disponibilidade

---

## 🚀 **Quick Start**

### **Produção (Recomendado)**
```bash
# 1. Clonar repositório
git clone https://github.com/KallebyX/mestres_do_cafe.git
cd mestres_do_cafe

# 2. Configurar variáveis
cp .env.example .env
# Editar .env com suas configurações

# 3. Build e executar
docker-compose up -d

# 4. Verificar logs
docker-compose logs -f mestres-cafe

# 5. Testar aplicação
curl http://localhost:5000/health
```

### **Desenvolvimento**
```bash
# 1. Modo desenvolvimento (hot reload)
docker-compose -f docker-compose.dev.yml up

# 2. Acessar aplicação
# Frontend: http://localhost:5173
# Backend: http://localhost:5000
```

---

## ⚙️ **Configuração Detalhada**

### **1. Variáveis de Ambiente**

#### **Produção (.env)**
```bash
# Aplicação
NODE_ENV=production
PORT=5000
JWT_SECRET=sua_chave_jwt_super_segura_512_bits

# CORS
CORS_ORIGIN=https://seudominio.com

# Banco de dados
POSTGRES_DB=mestres_cafe
POSTGRES_USER=mestres
POSTGRES_PASSWORD=senha_super_segura

# WhatsApp (opcional)
WHATSAPP_SESSION_NAME=mestres-cafe-bot
WHATSAPP_TIMEOUT=60000

# Redis (opcional)
REDIS_URL=redis://redis:6379
```

#### **Desenvolvimento (.env.dev)**
```bash
NODE_ENV=development
PORT=5000
VITE_API_URL=http://localhost:5000
JWT_SECRET=dev_jwt_secret
CORS_ORIGIN=http://localhost:5173
```

### **2. Docker Compose Profiles**

#### **Básico (Apenas App)**
```bash
docker-compose up mestres-cafe
```

#### **Completo (App + Banco + Cache)**
```bash
docker-compose --profile full up -d
```

#### **Produção (App + Banco + Cache + Nginx)**
```bash
docker-compose --profile production up -d
```

---

## 📊 **Comandos Úteis**

### **Gerenciamento de Containers**
```bash
# Ver status
docker-compose ps

# Logs em tempo real
docker-compose logs -f

# Restart serviço específico
docker-compose restart mestres-cafe

# Parar tudo
docker-compose down

# Parar e remover volumes
docker-compose down -v

# Rebuild após mudanças
docker-compose up --build
```

### **Debug e Manutenção**
```bash
# Entrar no container
docker-compose exec mestres-cafe sh

# Ver logs específicos
docker-compose logs mestres-cafe

# Verificar saúde do container
docker-compose exec mestres-cafe curl http://localhost:5000/health

# Backup do banco
docker-compose exec postgres pg_dump -U mestres mestres_cafe > backup.sql

# Restore do banco
docker-compose exec -T postgres psql -U mestres mestres_cafe < backup.sql
```

### **Monitoramento**
```bash
# Uso de recursos
docker stats

# Espaço em disco
docker system df

# Limpar recursos não utilizados
docker system prune -a
```

---

## 🏗️ **Estrutura dos Containers**

### **Aplicação Main (mestres-cafe)**
```
Imagem: node:20-alpine (otimizada)
Portas: 5000
Volumes: 
  - whatsapp_data (sessões WhatsApp)
  - server_data (dados do servidor)
Healthcheck: /health endpoint
Recursos: 512MB RAM, 1 CPU
```

### **PostgreSQL (postgres)**
```
Imagem: postgres:15-alpine
Portas: 5432
Volumes: postgres_data
Configuração: UTF-8, timezone UTC
```

### **Redis (redis)**
```
Imagem: redis:7-alpine  
Portas: 6379
Volumes: redis_data
Configuração: persistência habilitada
```

### **Nginx (nginx) - Opcional**
```
Imagem: nginx:alpine
Portas: 80, 443
SSL: Suporte completo
Proxy: Reverso para aplicação
```

---

## 🌐 **Deploy em Produção**

### **1. Servidor Linux (Ubuntu/Debian)**

#### **Instalação Docker**
```bash
# Atualizar sistema
sudo apt update && sudo apt upgrade -y

# Instalar Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Adicionar usuário ao grupo docker
sudo usermod -aG docker $USER

# Instalar Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

#### **Deploy da Aplicação**
```bash
# Criar diretório
sudo mkdir -p /opt/mestres-cafe
cd /opt/mestres-cafe

# Clonar código
git clone https://github.com/KallebyX/mestres_do_cafe.git .

# Configurar ambiente
cp .env.example .env
sudo nano .env  # Editar configurações

# Iniciar aplicação
docker-compose up -d

# Configurar auto-start
sudo systemctl enable docker
```

### **2. Cloud Providers**

#### **AWS ECS**
- Usar `ecs-cli` com docker-compose.yml
- LoadBalancer + AutoScaling Group
- RDS para PostgreSQL
- ElastiCache para Redis

#### **Google Cloud Run**
- Build da imagem no Container Registry
- Deploy serverless automático
- Cloud SQL para PostgreSQL
- Memorystore para Redis

#### **DigitalOcean Droplets**
- Droplet com Docker pré-instalado
- Managed Database para PostgreSQL
- Managed Redis para cache

### **3. Kubernetes (Avançado)**

#### **Manifests básicos**
```yaml
# deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: mestres-cafe
spec:
  replicas: 3
  selector:
    matchLabels:
      app: mestres-cafe
  template:
    metadata:
      labels:
        app: mestres-cafe
    spec:
      containers:
      - name: mestres-cafe
        image: mestres-cafe:latest
        ports:
        - containerPort: 5000
        env:
        - name: NODE_ENV
          value: "production"
        - name: PORT
          value: "5000"
```

---

## 🔍 **Troubleshooting**

### **Problemas Comuns**

#### **Container não inicia**
```bash
# Verificar logs
docker-compose logs mestres-cafe

# Verificar configuração
docker-compose config

# Testar build local
docker build -t mestres-cafe-test .
```

#### **Banco não conecta**
```bash
# Verificar se PostgreSQL está rodando
docker-compose ps postgres

# Testar conexão
docker-compose exec postgres psql -U mestres -d mestres_cafe -c "SELECT 1;"

# Verificar variáveis de ambiente
docker-compose exec mestres-cafe env | grep POSTGRES
```

#### **Frontend não carrega**
```bash
# Verificar se build foi gerado
docker-compose exec mestres-cafe ls -la dist/

# Testar endpoint diretamente
curl http://localhost:5000/

# Verificar logs do servidor
docker-compose logs mestres-cafe | grep -i error
```

#### **WhatsApp não conecta**
```bash
# Verificar sessão
docker-compose exec mestres-cafe ls -la whatsapp-session/

# Logs específicos do WhatsApp
docker-compose logs mestres-cafe | grep -i whatsapp

# Resetar sessão
docker-compose exec mestres-cafe rm -rf whatsapp-session/*
docker-compose restart mestres-cafe
```

### **Performance Issues**

#### **Aplicação lenta**
```bash
# Verificar recursos
docker stats mestres-cafe

# Otimizar imagem
docker build --no-cache -t mestres-cafe .

# Limitar recursos
# Adicionar no docker-compose.yml:
deploy:
  resources:
    limits:
      memory: 512M
      cpus: '1.0'
```

#### **Banco lento**
```bash
# Verificar conexões
docker-compose exec postgres psql -U mestres -c "SELECT count(*) FROM pg_stat_activity;"

# Otimizar PostgreSQL (postgresql.conf)
shared_buffers = 256MB
max_connections = 100
work_mem = 4MB
```

---

## 📈 **Monitoramento e Logs**

### **Logs Centralizados**
```yaml
# docker-compose.yml
logging:
  driver: "json-file"
  options:
    max-size: "10m"
    max-file: "3"
```

### **Métricas com Prometheus**
```yaml
# docker-compose.monitoring.yml
services:
  prometheus:
    image: prom/prometheus
    ports:
      - "9090:9090"
    volumes:
      - ./prometheus.yml:/etc/prometheus/prometheus.yml

  grafana:
    image: grafana/grafana
    ports:
      - "3000:3000"
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=admin
```

### **Alertas**
```bash
# Script de monitoramento simples
#!/bin/bash
if ! curl -f http://localhost:5000/health; then
  echo "Aplicação fora do ar!" | mail -s "ALERTA: Mestres do Café" admin@mestrescafe.com.br
fi
```

---

## 🔐 **Segurança**

### **Boas Práticas**
- ✅ Usuário não-root nos containers
- ✅ Secrets em variáveis de ambiente
- ✅ Rede isolada para containers
- ✅ Health checks habilitados
- ✅ Limites de recursos definidos

### **SSL/TLS com Let's Encrypt**
```bash
# Configurar certificados
docker run -it --rm --name certbot \
  -v "/etc/letsencrypt:/etc/letsencrypt" \
  -v "/var/lib/letsencrypt:/var/lib/letsencrypt" \
  certbot/certbot certonly --standalone \
  -d mestrescafe.com.br -d www.mestrescafe.com.br
```

### **Firewall**
```bash
# Permitir apenas portas necessárias
sudo ufw allow 22    # SSH
sudo ufw allow 80    # HTTP
sudo ufw allow 443   # HTTPS
sudo ufw enable
```

---

## ✅ **Checklist de Deploy**

### **Pré-Deploy**
- [ ] Testes passando localmente
- [ ] Build Docker funcionando
- [ ] Variáveis de ambiente configuradas
- [ ] SSL configurado (produção)
- [ ] Backup de dados existentes

### **Deploy**
- [ ] Docker e Docker Compose instalados
- [ ] Aplicação subiu sem erros
- [ ] Health check retornando 200
- [ ] Frontend carregando corretamente
- [ ] API respondendo

### **Pós-Deploy**
- [ ] Testes de fumaça executados
- [ ] Monitoramento configurado
- [ ] Backups automatizados
- [ ] Logs sendo coletados
- [ ] Performance verificada

---

## 🎉 **Resultado Final**

Com Docker, o **Mestres do Café** fica:

- **🚀 Rápido**: Build otimizado, imagem pequena
- **🔒 Seguro**: Usuário não-root, rede isolada  
- **📈 Escalável**: Fácil horizontal scaling
- **🔧 Maintível**: Logs, métricas, health checks
- **💰 Econômico**: Recursos otimizados

**Deploy garantido em qualquer ambiente!** 🐳☕ 