# Nginx Configuration - Mestres do Café

## Estrutura

```
nginx/
├── Dockerfile                 # Imagem Docker do Nginx
├── .dockerignore             # Arquivos ignorados no build
├── nginx.conf                # Configuração principal
├── conf.d/
│   └── default.conf          # Configuração do site/reverse proxy
└── README.md                 # Esta documentação
```

## Características

### Performance
- ✅ HTTP/2 habilitado
- ✅ Gzip compression
- ✅ Cache de assets estáticos (7 dias)
- ✅ Keep-alive otimizado
- ✅ Worker processes auto-scaled
- ✅ Proxy buffering configurado

### Segurança
- ✅ TLS 1.2 e 1.3 apenas
- ✅ Ciphers modernos
- ✅ HSTS (HTTP Strict Transport Security)
- ✅ CSP (Content Security Policy)
- ✅ X-Frame-Options
- ✅ X-Content-Type-Options
- ✅ Rate limiting configurado
- ✅ Certificados SSL (Let's Encrypt ready)

### Load Balancing
- ✅ Upstream configurado
- ✅ Health checks
- ✅ Least connections algorithm
- ✅ Keepalive para upstream

### Logging
- ✅ Formato JSON disponível
- ✅ Request timing
- ✅ Separação de logs (access/error)
- ✅ Upstream timing metrics

## Como Usar

### Development (HTTP)

O arquivo `default.conf` já está configurado para desenvolvimento local. A seção de redirecionamento HTTPS está comentada.

```bash
# Build da imagem
docker build -t mestres-nginx ./nginx

# Executar standalone
docker run -d -p 80:80 -p 443:443 --name nginx mestres-nginx

# Com Docker Compose (recomendado)
docker-compose up -d nginx
```

### Production (HTTPS)

1. **Descomentar redirecionamento HTTPS** em `default.conf`:
```nginx
location / {
    return 301 https://$server_name$request_uri;
}
```

2. **Obter certificados SSL** com Let's Encrypt:
```bash
# Primeiro deploy sem SSL
docker-compose up -d nginx

# Obter certificado
docker exec -it nginx certbot --nginx -d mestres-do-cafe.com -d www.mestres-do-cafe.com

# Renovação automática (cron job)
0 12 * * * docker exec nginx certbot renew --quiet
```

3. **Atualizar paths dos certificados** em `default.conf`:
```nginx
ssl_certificate /etc/letsencrypt/live/SEU-DOMINIO/fullchain.pem;
ssl_certificate_key /etc/letsencrypt/live/SEU-DOMINIO/privkey.pem;
```

### Self-Signed Certificate (Development)

Certificado self-signed é gerado automaticamente no build do Docker para desenvolvimento local.

```bash
# Já está configurado no Dockerfile
# Acesse via HTTPS: https://localhost (aceite o aviso de segurança)
```

## Rate Limiting

Configurado em `nginx.conf`:

| Zona | Rate | Burst | Uso |
|------|------|-------|-----|
| `auth_limit` | 5 req/s | 5 | Endpoints de autenticação |
| `api_limit` | 100 req/s | 20 | API geral |
| `general_limit` | 50 req/s | 10 | Outras requisições |

### Customizar Rate Limiting

Edite em `nginx.conf`:
```nginx
limit_req_zone $binary_remote_addr zone=custom_limit:10m rate=30r/s;
```

E aplique em `default.conf`:
```nginx
location /api/custom/ {
    limit_req zone=custom_limit burst=10 nodelay;
    proxy_pass http://api_backend;
}
```

## Cache

### Static Assets
- Cache: 7 dias
- Headers: `Cache-Control: public, max-age=604800, immutable`
- Extensões: jpg, jpeg, png, gif, ico, css, js, svg, woff, woff2, ttf, eot, webp, avif

### API Cache
- Cache zone: `api_cache`
- Tamanho: 100MB
- Inativo após: 60 minutos

Para desabilitar cache em um endpoint:
```nginx
location /api/no-cache/ {
    proxy_cache off;
    proxy_pass http://api_backend;
}
```

## Logs

### Localização
- Access log: `/var/log/nginx/access.log`
- Error log: `/var/log/nginx/error.log`
- Site access (HTTP): `/var/log/nginx/mestres-access.log`
- Site access (HTTPS): `/var/log/nginx/mestres-ssl-access.log`
- Site errors: `/var/log/nginx/mestres-error.log`

### Formato JSON

Para habilitar log JSON, edite `nginx.conf`:
```nginx
access_log /var/log/nginx/access.log json_combined;
```

### Visualizar logs
```bash
# Access log em tempo real
docker logs -f nginx

# Últimas 100 linhas do access log
docker exec nginx tail -100 /var/log/nginx/access.log

# Filtrar erros 5xx
docker exec nginx grep "HTTP/1.1\" 5" /var/log/nginx/access.log
```

## Security Headers

### HSTS (HTTP Strict Transport Security)
```nginx
Strict-Transport-Security: max-age=63072000; includeSubDomains; preload
```

### CSP (Content Security Policy)
Configurado para permitir:
- Scripts: self + CDN (jsdelivr)
- Styles: self + inline + Google Fonts
- Images: self + data URIs + HTTPS
- Connections: self + MercadoPago + Melhor Envio

### Modificar CSP
Edite em `default.conf`:
```nginx
add_header Content-Security-Policy "default-src 'self'; script-src 'self' https://cdn.example.com;" always;
```

## Upstreams

### API Backend
```nginx
upstream api_backend {
    least_conn;
    server api:5001 max_fails=3 fail_timeout=30s;
    keepalive 32;
}
```

### Frontend
```nginx
upstream web_frontend {
    least_conn;
    server web:3000 max_fails=3 fail_timeout=30s;
    keepalive 32;
}
```

### Adicionar mais servidores (scaling)
```nginx
upstream api_backend {
    least_conn;
    server api1:5001 max_fails=3 fail_timeout=30s weight=1;
    server api2:5001 max_fails=3 fail_timeout=30s weight=1;
    server api3:5001 max_fails=3 fail_timeout=30s weight=1 backup;  # Backup server
    keepalive 32;
}
```

## Health Checks

### Nginx Container Health
```bash
docker inspect --format='{{.State.Health.Status}}' nginx
```

### Backend Health
Health check endpoint sem rate limiting:
```nginx
location /api/health {
    access_log off;
    proxy_pass http://api_backend;
}
```

## Troubleshooting

### Nginx não inicia
```bash
# Testar configuração
docker exec nginx nginx -t

# Ver logs de erro
docker logs nginx

# Verificar sintaxe antes de reiniciar
docker exec nginx nginx -t && docker restart nginx
```

### Rate limiting muito agressivo
Ajuste as zonas em `nginx.conf`:
```nginx
limit_req_zone $binary_remote_addr zone=api_limit:10m rate=200r/s;  # Aumentado
```

### SSL não funciona
```bash
# Verificar certificados
docker exec nginx ls -la /etc/letsencrypt/live/

# Testar SSL
openssl s_client -connect localhost:443 -servername mestres-do-cafe.com

# Verificar configuração SSL
docker exec nginx nginx -T | grep ssl
```

### Cache não funciona
```bash
# Verificar status do cache
curl -I https://mestres-do-cafe.com/static/image.jpg | grep X-Cache-Status

# Limpar cache
docker exec nginx find /var/cache/nginx -type f -delete
docker restart nginx
```

### Performance ruim
```bash
# Verificar workers
docker exec nginx ps aux | grep nginx

# Verificar conexões
docker exec nginx netstat -an | grep ESTABLISHED | wc -l

# Verificar logs de timing
docker exec nginx tail -100 /var/log/nginx/access.log | grep "rt="
```

## Métricas e Monitoramento

### Nginx Status Module (opcional)
Adicione em `default.conf`:
```nginx
location /nginx_status {
    stub_status on;
    access_log off;
    allow 127.0.0.1;
    deny all;
}
```

### Prometheus Exporter
```bash
# Instalar nginx-prometheus-exporter
docker run -d -p 9113:9113 nginx/nginx-prometheus-exporter:latest \
    -nginx.scrape-uri=http://nginx/nginx_status
```

## Otimizações Avançadas

### Brotli Compression
Uncomment em `nginx.conf`:
```nginx
brotli on;
brotli_comp_level 6;
brotli_types text/plain text/css application/json;
```

### FastCGI Cache (para PHP, se necessário)
```nginx
fastcgi_cache_path /var/cache/nginx/fastcgi levels=1:2 keys_zone=php_cache:10m;
```

### Websocket Support (já configurado)
```nginx
proxy_set_header Upgrade $http_upgrade;
proxy_set_header Connection 'upgrade';
```

## Referências

- [Nginx Documentation](https://nginx.org/en/docs/)
- [Mozilla SSL Configuration](https://ssl-config.mozilla.org/)
- [OWASP Security Headers](https://owasp.org/www-project-secure-headers/)
- [Let's Encrypt](https://letsencrypt.org/)
