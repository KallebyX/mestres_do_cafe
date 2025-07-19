# Mestres do Café - Nginx Reverse Proxy Dockerfile
# Otimizado para performance e segurança

# =============================================================================
# Base Nginx
# =============================================================================
FROM nginx:alpine

# Metadados
LABEL maintainer="KallebyX"
LABEL description="Mestres do Café Enterprise Nginx Reverse Proxy"
LABEL version="1.0.0"

# Instalar dependências necessárias
RUN apk add --no-cache \
    curl \
    ca-certificates \
    openssl \
    shadow \
    tzdata \
    && rm -rf /var/cache/apk/*

# Criar usuário e grupo não-root com IDs específicos
RUN addgroup -g 1001 -S nginxgroup && \
    adduser -S nginxuser -u 1001 -G nginxgroup

# Criar diretórios necessários
RUN mkdir -p /var/cache/nginx/client_temp \
             /var/cache/nginx/proxy_temp \
             /var/cache/nginx/fastcgi_temp \
             /var/cache/nginx/uwsgi_temp \
             /var/cache/nginx/scgi_temp \
             /var/log/nginx \
             /etc/nginx/ssl \
             /etc/nginx/conf.d \
             /usr/share/nginx/html \
             /var/run/nginx

# Configurar permissões corretas
RUN chown -R nginxuser:nginxgroup /var/cache/nginx && \
    chown -R nginxuser:nginxgroup /var/log/nginx && \
    chown -R nginxuser:nginxgroup /etc/nginx && \
    chown -R nginxuser:nginxgroup /usr/share/nginx/html && \
    chown -R nginxuser:nginxgroup /var/run/nginx && \
    chmod -R 755 /var/cache/nginx && \
    chmod -R 755 /var/log/nginx && \
    chmod -R 755 /etc/nginx/ssl

# Copiar configuração personalizada do nginx
COPY --chown=nginxuser:nginxgroup nginx.conf /etc/nginx/nginx.conf

# Criar arquivo de PID com permissões corretas
RUN touch /var/run/nginx.pid && \
    chown nginxuser:nginxgroup /var/run/nginx.pid

# Página de health check personalizada
RUN echo '<!DOCTYPE html><html><head><title>Health Check</title></head><body><h1>Nginx is running</h1><p>Status: OK</p></body></html>' > /usr/share/nginx/html/health.html && \
    chown nginxuser:nginxgroup /usr/share/nginx/html/health.html

# Configuração de timezone
ENV TZ=America/Sao_Paulo
RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone

# Configurações de segurança
ENV NGINX_WORKER_PROCESSES=auto \
    NGINX_WORKER_CONNECTIONS=1024 \
    NGINX_KEEPALIVE_TIMEOUT=65 \
    NGINX_CLIENT_MAX_BODY_SIZE=50m

# Mudar para usuário não-root
USER nginxuser

# Expor portas
EXPOSE 80 443

# Health check robusto
HEALTHCHECK --interval=30s --timeout=10s --start-period=20s --retries=3 \
    CMD curl -f http://localhost:80/health.html || exit 1

# Volume para logs (opcional)
VOLUME ["/var/log/nginx"]

# Comando de inicialização
CMD ["nginx", "-g", "daemon off;"]

# =============================================================================
# Build stage for SSL certificates (opcional)
# =============================================================================
FROM nginx:alpine as ssl-enabled

# Copiar tudo da imagem base
COPY --from=0 / /

# Gerar certificados SSL auto-assinados para desenvolvimento
RUN apk add --no-cache openssl && \
    openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
    -keyout /etc/nginx/ssl/nginx-selfsigned.key \
    -out /etc/nginx/ssl/nginx-selfsigned.crt \
    -subj "/C=BR/ST=SP/L=São Paulo/O=Mestres do Café/CN=localhost" && \
    chown nginxuser:nginxgroup /etc/nginx/ssl/nginx-selfsigned.* && \
    chmod 600 /etc/nginx/ssl/nginx-selfsigned.key && \
    chmod 644 /etc/nginx/ssl/nginx-selfsigned.crt

USER nginxuser

# Health check com HTTPS
HEALTHCHECK --interval=30s --timeout=10s --start-period=20s --retries=3 \
    CMD curl -f http://localhost:80/health.html || curl -k -f https://localhost:443/health.html || exit 1

CMD ["nginx", "-g", "daemon off;"]