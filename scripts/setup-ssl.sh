#!/bin/bash
# Script de Configuração SSL com Let's Encrypt
# Instala e configura certificados SSL automaticamente com renovação automática

set -euo pipefail

# Configurações
DOMAIN="${DOMAIN:-mestres-do-cafe.com}"
EMAIL="${EMAIL:-admin@mestres-do-cafe.com}"
STAGING="${STAGING:-false}"  # Use staging para testes
WEBROOT="${WEBROOT:-/var/www/certbot}"
NGINX_CONF_DIR="/etc/nginx"
CERTBOT_DIR="/etc/letsencrypt"

# Cores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

log_step() {
    echo -e "\n${BLUE}═══ $1 ═══${NC}"
}

# Verificar se está rodando como root
if [ "$EUID" -ne 0 ]; then
    log_error "Este script deve ser executado como root (use sudo)"
    exit 1
fi

# Banner
echo -e "${BLUE}"
cat << "EOF"
╔═══════════════════════════════════════╗
║   Let's Encrypt SSL Setup            ║
║   Mestres do Café                    ║
╚═══════════════════════════════════════╝
EOF
echo -e "${NC}"

log_info "Configurando SSL para: $DOMAIN"
log_info "Email de contato: $EMAIL"

if [ "$STAGING" = "true" ]; then
    log_warn "Modo STAGING ativado - certificados de teste serão emitidos"
fi

# Instalação do Certbot
log_step "1. Instalação do Certbot"

if command -v certbot &> /dev/null; then
    log_info "Certbot já está instalado"
    certbot --version
else
    log_info "Instalando Certbot..."

    # Detectar sistema operacional
    if [ -f /etc/debian_version ]; then
        # Debian/Ubuntu
        apt-get update
        apt-get install -y certbot python3-certbot-nginx
    elif [ -f /etc/redhat-release ]; then
        # RedHat/CentOS/Fedora
        yum install -y certbot python3-certbot-nginx
    else
        log_error "Sistema operacional não suportado"
        exit 1
    fi

    log_info "Certbot instalado com sucesso"
fi

# Verificar Nginx
log_step "2. Verificação do Nginx"

if ! command -v nginx &> /dev/null; then
    log_error "Nginx não está instalado!"
    log_info "Instale o Nginx primeiro: sudo apt-get install nginx"
    exit 1
fi

log_info "Nginx encontrado: $(nginx -v 2>&1)"

# Testar configuração do Nginx
if nginx -t &> /dev/null; then
    log_info "Configuração do Nginx válida"
else
    log_error "Configuração do Nginx inválida!"
    nginx -t
    exit 1
fi

# Criar diretório webroot para validação
log_step "3. Preparação do Webroot"

if [ ! -d "$WEBROOT" ]; then
    log_info "Criando diretório webroot: $WEBROOT"
    mkdir -p "$WEBROOT"
    chown -R www-data:www-data "$WEBROOT"
fi

# Criar configuração temporária do Nginx para validação HTTP
log_info "Criando configuração temporária do Nginx..."

cat > "$NGINX_CONF_DIR/sites-available/certbot-temp" <<EOF
server {
    listen 80;
    server_name $DOMAIN www.$DOMAIN;

    location /.well-known/acme-challenge/ {
        root $WEBROOT;
    }

    location / {
        return 301 https://\$server_name\$request_uri;
    }
}
EOF

# Ativar configuração temporária
if [ ! -L "$NGINX_CONF_DIR/sites-enabled/certbot-temp" ]; then
    ln -sf "$NGINX_CONF_DIR/sites-available/certbot-temp" "$NGINX_CONF_DIR/sites-enabled/certbot-temp"
fi

# Recarregar Nginx
log_info "Recarregando Nginx..."
nginx -t && systemctl reload nginx

# Verificar DNS
log_step "4. Verificação de DNS"

log_info "Verificando resolução DNS para $DOMAIN..."

if host "$DOMAIN" &> /dev/null; then
    RESOLVED_IP=$(host "$DOMAIN" | grep "has address" | awk '{print $4}' | head -n1)
    log_info "DNS resolvido: $DOMAIN → $RESOLVED_IP"

    # Verificar se aponta para este servidor
    SERVER_IP=$(curl -s ifconfig.me)
    if [ "$RESOLVED_IP" = "$SERVER_IP" ]; then
        log_info "DNS configurado corretamente (aponta para este servidor)"
    else
        log_warn "DNS não aponta para este servidor!"
        log_warn "Servidor: $SERVER_IP | DNS: $RESOLVED_IP"
        log_warn "Certifique-se de que o DNS está correto antes de continuar"

        read -p "Continuar mesmo assim? (sim/não): " CONTINUE
        if [ "$CONTINUE" != "sim" ]; then
            log_info "Operação cancelada"
            exit 0
        fi
    fi
else
    log_error "Não foi possível resolver DNS para $DOMAIN"
    log_error "Configure o DNS antes de continuar"
    exit 1
fi

# Obter certificado SSL
log_step "5. Obtenção do Certificado SSL"

CERTBOT_ARGS="--nginx -d $DOMAIN -d www.$DOMAIN --non-interactive --agree-tos -m $EMAIL"

if [ "$STAGING" = "true" ]; then
    CERTBOT_ARGS="$CERTBOT_ARGS --staging"
fi

log_info "Solicitando certificado SSL..."
log_info "Comando: certbot $CERTBOT_ARGS"

if certbot $CERTBOT_ARGS; then
    log_info "Certificado SSL obtido com sucesso!"
else
    log_error "Falha ao obter certificado SSL"
    log_error "Verifique os logs: /var/log/letsencrypt/letsencrypt.log"
    exit 1
fi

# Configurar renovação automática
log_step "6. Configuração de Renovação Automática"

log_info "Configurando renovação automática com systemd timer..."

# Criar serviço de renovação
cat > /etc/systemd/system/certbot-renewal.service <<EOF
[Unit]
Description=Certbot Renewal
After=network-online.target

[Service]
Type=oneshot
ExecStart=/usr/bin/certbot renew --quiet --post-hook "systemctl reload nginx"
EOF

# Criar timer de renovação (executa diariamente)
cat > /etc/systemd/system/certbot-renewal.timer <<EOF
[Unit]
Description=Certbot Renewal Timer
Requires=certbot-renewal.service

[Timer]
OnCalendar=daily
RandomizedDelaySec=1h
Persistent=true

[Install]
WantedBy=timers.target
EOF

# Ativar timer
systemctl daemon-reload
systemctl enable certbot-renewal.timer
systemctl start certbot-renewal.timer

log_info "Timer de renovação configurado"
log_info "Status do timer:"
systemctl status certbot-renewal.timer --no-pager | head -n 10

# Criar script de teste de renovação
cat > /usr/local/bin/test-certbot-renewal <<'EOF'
#!/bin/bash
echo "Testando renovação do certificado SSL..."
certbot renew --dry-run
EOF

chmod +x /usr/local/bin/test-certbot-renewal

log_info "Script de teste criado: /usr/local/bin/test-certbot-renewal"

# Configurar Nginx com SSL otimizado
log_step "7. Otimização da Configuração SSL do Nginx"

log_info "Criando configuração SSL otimizada..."

cat > "$NGINX_CONF_DIR/snippets/ssl-params.conf" <<'EOF'
# SSL Configuration - Mozilla Intermediate
ssl_protocols TLSv1.2 TLSv1.3;
ssl_ciphers 'ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384:ECDHE-ECDSA-CHACHA20-POLY1305:ECDHE-RSA-CHACHA20-POLY1305:DHE-RSA-AES128-GCM-SHA256:DHE-RSA-AES256-GCM-SHA384';
ssl_prefer_server_ciphers off;

# SSL Session Cache
ssl_session_timeout 1d;
ssl_session_cache shared:SSL:50m;
ssl_session_tickets off;

# OCSP Stapling
ssl_stapling on;
ssl_stapling_verify on;
resolver 8.8.8.8 8.8.4.4 valid=300s;
resolver_timeout 5s;

# Security Headers
add_header Strict-Transport-Security "max-age=63072000; includeSubDomains; preload" always;
add_header X-Frame-Options "SAMEORIGIN" always;
add_header X-Content-Type-Options "nosniff" always;
add_header X-XSS-Protection "1; mode=block" always;
add_header Referrer-Policy "strict-origin-when-cross-origin" always;
EOF

log_info "Configuração SSL otimizada criada"

# Atualizar configuração principal
MAIN_CONF="$NGINX_CONF_DIR/sites-available/mestres-do-cafe"

if [ -f "$MAIN_CONF" ]; then
    log_info "Adicionando include de SSL params à configuração principal..."

    # Adicionar include se não existir
    if ! grep -q "ssl-params.conf" "$MAIN_CONF"; then
        sed -i '/ssl_certificate_key/a\    include /etc/nginx/snippets/ssl-params.conf;' "$MAIN_CONF"
    fi
fi

# Testar configuração
log_info "Testando nova configuração do Nginx..."
if nginx -t; then
    log_info "Configuração válida, recarregando Nginx..."
    systemctl reload nginx
else
    log_error "Configuração inválida!"
    exit 1
fi

# Verificar certificado
log_step "8. Verificação do Certificado"

log_info "Informações do certificado:"
certbot certificates | grep -A 10 "$DOMAIN"

# Testar HTTPS
log_info "Testando conexão HTTPS..."
if curl -sI "https://$DOMAIN" &> /dev/null; then
    log_info "HTTPS funcionando corretamente!"
else
    log_warn "Não foi possível testar HTTPS (pode levar alguns minutos para propagar)"
fi

# Configurar firewall (se UFW estiver ativo)
log_step "9. Configuração de Firewall"

if command -v ufw &> /dev/null && ufw status | grep -q "Status: active"; then
    log_info "Configurando UFW para permitir HTTPS..."
    ufw allow 'Nginx Full'
    ufw delete allow 'Nginx HTTP'
    log_info "Firewall configurado"
else
    log_warn "UFW não está ativo - certifique-se de que as portas 80 e 443 estão abertas"
fi

# Criar script de monitoramento
log_step "10. Script de Monitoramento"

cat > /usr/local/bin/check-ssl-expiry <<'EOF'
#!/bin/bash
# Script para verificar expiração de certificados SSL

DOMAIN="${1:-mestres-do-cafe.com}"
DAYS_WARNING=30

echo "Verificando certificado SSL para: $DOMAIN"
echo ""

EXPIRY_DATE=$(echo | openssl s_client -servername "$DOMAIN" -connect "$DOMAIN:443" 2>/dev/null | openssl x509 -noout -enddate | cut -d= -f2)
EXPIRY_EPOCH=$(date -d "$EXPIRY_DATE" +%s)
CURRENT_EPOCH=$(date +%s)
DAYS_UNTIL_EXPIRY=$(( ($EXPIRY_EPOCH - $CURRENT_EPOCH) / 86400 ))

echo "Data de expiração: $EXPIRY_DATE"
echo "Dias até expirar: $DAYS_UNTIL_EXPIRY"
echo ""

if [ $DAYS_UNTIL_EXPIRY -lt 0 ]; then
    echo "❌ CERTIFICADO EXPIRADO!"
    exit 2
elif [ $DAYS_UNTIL_EXPIRY -lt $DAYS_WARNING ]; then
    echo "⚠️  AVISO: Certificado expira em menos de $DAYS_WARNING dias!"
    exit 1
else
    echo "✅ Certificado válido"
    exit 0
fi
EOF

chmod +x /usr/local/bin/check-ssl-expiry

log_info "Script de monitoramento criado: /usr/local/bin/check-ssl-expiry"

# Resumo final
log_step "Configuração SSL Concluída!"

echo ""
log_info "✓ Certbot instalado e configurado"
log_info "✓ Certificado SSL obtido para $DOMAIN"
log_info "✓ Renovação automática configurada (diária)"
log_info "✓ Nginx configurado com SSL otimizado"
log_info "✓ Headers de segurança habilitados"
log_info "✓ OCSP Stapling ativado"
log_info "✓ Script de monitoramento criado"
echo ""

log_info "Comandos úteis:"
echo "  - Testar renovação:        test-certbot-renewal"
echo "  - Verificar expiração:     check-ssl-expiry $DOMAIN"
echo "  - Listar certificados:     certbot certificates"
echo "  - Renovar manualmente:     certbot renew"
echo "  - Status do timer:         systemctl status certbot-renewal.timer"
echo ""

log_info "Próximos passos:"
echo "  1. Testar o site: https://$DOMAIN"
echo "  2. Verificar SSL: https://www.ssllabs.com/ssltest/analyze.html?d=$DOMAIN"
echo "  3. Adicionar ao HSTS preload: https://hstspreload.org"
echo ""

log_info "Setup SSL concluído com sucesso! 🔒"
exit 0
