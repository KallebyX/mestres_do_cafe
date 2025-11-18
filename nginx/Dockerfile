# Dockerfile para Nginx - Mestres do Café
# Nginx otimizado com módulos de segurança e performance

FROM nginx:1.25-alpine

# Instalar dependências
RUN apk add --no-cache \
    certbot \
    certbot-nginx \
    openssl

# Criar diretórios necessários
RUN mkdir -p /var/www/certbot \
    && mkdir -p /var/cache/nginx \
    && mkdir -p /etc/nginx/ssl

# Gerar certificado self-signed para desenvolvimento
RUN openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
    -keyout /etc/nginx/ssl/nginx-selfsigned.key \
    -out /etc/nginx/ssl/nginx-selfsigned.crt \
    -subj "/C=BR/ST=SaoPaulo/L=SaoPaulo/O=Mestres do Cafe/CN=localhost"

# Copiar configurações
COPY nginx.conf /etc/nginx/nginx.conf
COPY conf.d/ /etc/nginx/conf.d/

# Criar arquivo DH params para SSL (pode demorar)
# RUN openssl dhparam -out /etc/nginx/ssl/dhparam.pem 2048

# Permissões corretas
RUN chown -R nginx:nginx /var/cache/nginx \
    && chmod -R 755 /var/cache/nginx

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget --quiet --tries=1 --spider http://localhost:80/api/health || exit 1

EXPOSE 80 443

CMD ["nginx", "-g", "daemon off;"]
