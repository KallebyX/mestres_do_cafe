# 🚀 Guia de Deploy - Mestres do Café Enterprise

Instruções completas para deploy em produção da plataforma Mestres do Café Enterprise.

---

## 🎯 **OPÇÕES DE DEPLOY**

### **🐳 Docker (Recomendado)**
Deploy usando containers Docker para máxima portabilidade e consistência.

### **☁️ Plataformas Cloud**
- **Render.com** (configuração incluída)
- **AWS, GCP, Azure** (via Docker)
- **DigitalOcean App Platform**
- **Heroku** (com adaptações)

### **🖥️ Servidor Próprio**
Deploy em VPS ou servidor dedicado usando Docker Compose.

---

## 🐳 **DEPLOY COM DOCKER (PRODUÇÃO)**

### **1. Preparação do Ambiente**

```bash
# 1. Clone o repositório no servidor
git clone https://github.com/KallebyX/mestres_cafe_enterprise.git
cd mestres_cafe_enterprise

# 2. Configure variáveis de produção
cp .env.docker.example .env.production
nano .env.production
```

### **2. Configuração de Produção (.env.production)**

```bash
# =============================================================================
# CONFIGURAÇÕES DE PRODUÇÃO
# =============================================================================

# Ambiente
NODE_ENV=production
FLASK_ENV=production

# Database (PostgreSQL Cloud)
DATABASE_URL=postgresql://user:password@host:5432/database_name

# Segurança (GERE CHAVES FORTES!)
SECRET_KEY=chave-super-secreta-de-32-caracteres-ou-mais-longa
JWT_SECRET_KEY=chave-jwt-super-secreta-de-32-caracteres-ou-mais

# APIs Externas (OBRIGATÓRIAS)
MERCADO_PAGO_ACCESS_TOKEN=APP_USR-sua-chave-de-producao
MERCADO_PAGO_PUBLIC_KEY=APP_USR-sua-chave-publica
MELHOR_ENVIO_API_KEY=Bearer-seu-token-de-producao
MELHOR_ENVIO_SANDBOX=false

# URLs de Produção
FRONTEND_URL=https://seudominio.com
API_URL=https://api.seudominio.com

# Cache Redis (Cloud)
REDIS_URL=redis://user:password@host:6379

# Performance
GUNICORN_WORKERS=4
GUNICORN_THREADS=2
REDIS_MAXMEMORY=1gb

# Email (SMTP)
SMTP_HOST=smtp.seuservidor.com
SMTP_PORT=587
SMTP_USER=noreply@seudominio.com
SMTP_PASSWORD=sua-senha-smtp
SMTP_USE_TLS=true
```

### **3. Build e Deploy**

```bash
# 1. Build das imagens de produção
docker-compose -f docker-compose.prod.yml build

# 2. Execute em produção
docker-compose -f docker-compose.prod.yml up -d

# 3. Verifique os serviços
docker-compose -f docker-compose.prod.yml ps

# 4. Acompanhe os logs
docker-compose -f docker-compose.prod.yml logs -f
```

### **4. Verificação de Deploy**

```bash
# Health check da API
curl -f https://api.seudominio.com/api/health

# Verificar frontend
curl -f https://seudominio.com

# Verificar banco de dados
docker-compose -f docker-compose.prod.yml exec db pg_isready
```

---

## ☁️ **DEPLOY NO RENDER.COM**

### **1. Configuração Automática**

O projeto já inclui configuração para Render.com:

- **`render.yaml`**: Configuração de serviços
- **`render.env.example`**: Variáveis de ambiente

### **2. Passos no Render**

1. **Conecte** seu repositório GitHub ao Render
2. **Importe** o `render.yaml` automaticamente
3. **Configure** as variáveis de ambiente:
   ```bash
   DATABASE_URL=postgresql://render-user:password@host/db
   SECRET_KEY=sua-chave-super-secreta
   MERCADO_PAGO_ACCESS_TOKEN=sua-chave
   MELHOR_ENVIO_API_KEY=sua-chave
   ```
4. **Deploy** automático será iniciado

### **3. Serviços Criados**

- **Web Service**: Frontend React
- **Backend Service**: API Flask
- **PostgreSQL**: Banco de dados
- **Redis**: Cache (opcional)

---

## 🖥️ **DEPLOY EM SERVIDOR PRÓPRIO**

### **1. Requisitos do Servidor**

```bash
# Especificações mínimas
- CPU: 2 cores
- RAM: 4GB
- Storage: 20GB SSD
- OS: Ubuntu 20.04+ / CentOS 8+
- Docker & Docker Compose instalados
```

### **2. Configuração do Servidor**

```bash
# 1. Atualize o sistema
sudo apt update && sudo apt upgrade -y

# 2. Instale Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh
sudo usermod -aG docker $USER

# 3. Instale Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# 4. Configure firewall
sudo ufw allow 22    # SSH
sudo ufw allow 80    # HTTP
sudo ufw allow 443   # HTTPS
sudo ufw enable
```

### **3. Deploy da Aplicação**

```bash
# 1. Clone no servidor
git clone https://github.com/KallebyX/mestres_cafe_enterprise.git
cd mestres_cafe_enterprise

# 2. Configure produção
cp .env.docker.example .env.production
# Edite conforme necessário

# 3. Execute
docker-compose -f docker-compose.prod.yml up -d

# 4. Configure Nginx (reverse proxy)
sudo apt install nginx
# Configure o arquivo de site conforme necessário
```

---

## 🔒 **CONFIGURAÇÕES DE SEGURANÇA**

### **1. SSL/TLS (HTTPS)**

```bash
# Usando Certbot (Let's Encrypt)
sudo apt install certbot python3-certbot-nginx

# Gerar certificado
sudo certbot --nginx -d seudominio.com -d api.seudominio.com

# Renovação automática
sudo crontab -e
# Adicione: 0 12 * * * /usr/bin/certbot renew --quiet
```

### **2. Firewall e Segurança**

```bash
# Configure UFW
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh
sudo ufw allow 'Nginx Full'
sudo ufw enable

# Harden SSH
sudo nano /etc/ssh/sshd_config
# PermitRootLogin no
# PasswordAuthentication no
# Port 2222 (mude a porta padrão)
```

### **3. Monitoramento**

```bash
# Instale fail2ban
sudo apt install fail2ban

# Configure para Docker
sudo nano /etc/fail2ban/jail.local
```

---

## 📊 **MONITORAMENTO EM PRODUÇÃO**

### **1. Health Checks**

```bash
# Script de monitoramento
#!/bin/bash
# healthcheck.sh

API_URL="https://api.seudominio.com/api/health"
FRONTEND_URL="https://seudominio.com"

# Verificar API
if curl -f -s $API_URL > /dev/null; then
    echo "✅ API está funcionando"
else
    echo "❌ API com problemas"
    # Notificar admins
fi

# Verificar Frontend
if curl -f -s $FRONTEND_URL > /dev/null; then
    echo "✅ Frontend está funcionando"
else
    echo "❌ Frontend com problemas"
fi
```

### **2. Logs Centralizados**

```bash
# Verificar logs dos containers
docker-compose -f docker-compose.prod.yml logs -f api
docker-compose -f docker-compose.prod.yml logs -f web

# Rotação de logs
echo "log_driver: json-file
log_opts:
  max-size: 10m
  max-file: 3" >> docker-compose.prod.yml
```

### **3. Backup Automatizado**

```bash
#!/bin/bash
# backup.sh

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backup"

# Backup do banco
docker-compose exec db pg_dump -U postgres mestres_cafe | gzip > $BACKUP_DIR/db_$DATE.sql.gz

# Backup de uploads
tar -czf $BACKUP_DIR/uploads_$DATE.tar.gz apps/api/uploads/

# Limpar backups antigos (manter 7 dias)
find $BACKUP_DIR -name "*.gz" -mtime +7 -delete

# Cron: 0 2 * * * /path/to/backup.sh
```

---

## 🚀 **OTIMIZAÇÕES DE PERFORMANCE**

### **1. Nginx (Reverse Proxy)**

```nginx
# /etc/nginx/sites-available/mestres-cafe
server {
    listen 80;
    server_name seudominio.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name seudominio.com;
    
    # SSL
    ssl_certificate /etc/letsencrypt/live/seudominio.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/seudominio.com/privkey.pem;
    
    # Otimizações
    gzip on;
    gzip_types text/css application/javascript application/json;
    
    # Frontend
    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
    
    # API
    location /api {
        proxy_pass http://localhost:5001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

### **2. Database (PostgreSQL)**

```sql
-- Otimizações de performance
-- postgresql.conf
shared_buffers = 256MB
effective_cache_size = 1GB
work_mem = 4MB
maintenance_work_mem = 64MB
```

### **3. Redis Cache**

```bash
# redis.conf
maxmemory 1gb
maxmemory-policy allkeys-lru
save 900 1
save 300 10
save 60 10000
```

---

## 🔄 **CI/CD (GitHub Actions)**

### **1. Deploy Automático**

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
          cd /path/to/mestres_cafe_enterprise
          git pull origin main
          docker-compose -f docker-compose.prod.yml build
          docker-compose -f docker-compose.prod.yml up -d
```

---

## ❗ **TROUBLESHOOTING**

### **Problemas Comuns**

```bash
# 1. Container não inicia
docker-compose -f docker-compose.prod.yml logs container_name

# 2. Problema de permissões
sudo chown -R $USER:$USER ./
docker-compose down && docker-compose up -d

# 3. Banco de dados não conecta
docker-compose exec db psql -U postgres -c "\l"

# 4. Cache Redis com problemas
docker-compose exec redis redis-cli ping

# 5. SSL não funciona
sudo certbot certificates
sudo nginx -t
```

### **Logs Importantes**

```bash
# Logs da aplicação
docker-compose logs -f api

# Logs do Nginx
sudo tail -f /var/log/nginx/error.log

# Logs do sistema
sudo journalctl -u docker -f
```

---

## 📞 **SUPORTE**

### **Em caso de problemas:**

1. **Verifique** os logs dos containers
2. **Consulte** a documentação de troubleshooting
3. **Abra** uma issue no GitHub
4. **Contate** o suporte técnico

---

*Deploy realizado com sucesso? 🎉 Agora seu sistema Mestres do Café Enterprise está pronto para conquistar o mercado!* ☕🚀