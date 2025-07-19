# Mestres do Café - Frontend Web Dockerfile
# Multi-stage build otimizado para desenvolvimento e produção

# =============================================================================
# Stage 1: Base Node.js
# =============================================================================
FROM node:18-alpine as base

# Metadados
LABEL maintainer="KallebyX"
LABEL description="Mestres do Café Enterprise Frontend"
LABEL version="1.0.0"

# Instalar dependências do sistema
RUN apk add --no-cache \
    curl \
    ca-certificates \
    dumb-init

# Criar usuário não-root
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nextjs -u 1001 -G nodejs

# Configurar diretório de trabalho
WORKDIR /app

# =============================================================================
# Stage 2: Dependencies
# =============================================================================
FROM base as deps

# Copiar arquivos de dependências
COPY package*.json ./

# Instalar dependências (cache eficiente)
RUN npm ci --only=production && \
    npm cache clean --force

# =============================================================================
# Stage 3: Development Dependencies
# =============================================================================
FROM base as dev-deps

# Copiar arquivos de dependências
COPY package*.json ./

# Instalar todas as dependências (incluindo dev)
RUN npm ci && \
    npm cache clean --force

# =============================================================================
# Stage 4: Development
# =============================================================================
FROM dev-deps as development

# Copiar código fonte
COPY --chown=nextjs:nodejs . .

# Configurações de desenvolvimento
ENV NODE_ENV=development \
    VITE_API_URL=http://localhost:5001/api \
    VITE_APP_NAME="Mestres do Café" \
    PORT=3000

# Mudar para usuário não-root
USER nextjs

# Expor porta
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
    CMD curl -f http://localhost:3000/ || exit 1

# Comando de desenvolvimento
CMD ["dumb-init", "npm", "run", "dev"]

# =============================================================================
# Stage 5: Build
# =============================================================================
FROM dev-deps as build

# Copiar código fonte
COPY --chown=nextjs:nodejs . .

# Configurações de build
ENV NODE_ENV=production \
    VITE_API_URL=/api \
    VITE_APP_NAME="Mestres do Café"

# Mudar para usuário não-root para build
USER nextjs

# Build da aplicação
RUN npm run build

# =============================================================================
# Stage 6: Production
# =============================================================================
FROM nginx:alpine as production

# Metadados para produção
LABEL stage="production"

# Instalar dependências
RUN apk add --no-cache \
    curl \
    ca-certificates

# Criar usuário não-root
RUN addgroup -g 1001 -S nginxgroup && \
    adduser -S nginxuser -u 1001 -G nginxgroup

# Copiar aplicação buildada
COPY --from=build --chown=nginxuser:nginxgroup /app/dist /usr/share/nginx/html

# Copiar configuração do nginx (se existir)
COPY --chown=nginxuser:nginxgroup nginx.conf /etc/nginx/conf.d/default.conf 2>/dev/null || \
    echo 'server { listen 80; server_name _; location / { try_files $uri $uri/ /index.html; } location /api { proxy_pass http://api:5001; proxy_set_header Host $host; proxy_set_header X-Real-IP $remote_addr; } }' > /etc/nginx/conf.d/default.conf

# Configurar permissões do nginx
RUN chown -R nginxuser:nginxgroup /usr/share/nginx/html && \
    chown -R nginxuser:nginxgroup /var/cache/nginx && \
    chown -R nginxuser:nginxgroup /var/log/nginx && \
    chown -R nginxuser:nginxgroup /etc/nginx/conf.d && \
    touch /var/run/nginx.pid && \
    chown nginxuser:nginxgroup /var/run/nginx.pid

# Configurações de produção
ENV NODE_ENV=production

# Mudar para usuário não-root
USER nginxuser

# Expor porta
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=20s --retries=3 \
    CMD curl -f http://localhost:80/ || exit 1

# Comando de produção
CMD ["nginx", "-g", "daemon off;"]

# =============================================================================
# Stage 7: Testing (opcional)
# =============================================================================
FROM dev-deps as testing

# Copiar código fonte
COPY --chown=nextjs:nodejs . .

# Configurações de teste
ENV NODE_ENV=test \
    CI=true

# Mudar para usuário não-root
USER nextjs

# Comando de teste
CMD ["npm", "run", "test"]

# =============================================================================
# Stage 8: Standalone (produção sem nginx)
# =============================================================================
FROM base as standalone

# Copiar dependências de produção
COPY --from=deps --chown=nextjs:nodejs /app/node_modules ./node_modules

# Copiar aplicação buildada
COPY --from=build --chown=nextjs:nodejs /app/dist ./dist

# Instalar servidor estático
RUN npm install -g serve

# Configurações
ENV NODE_ENV=production \
    PORT=3000

# Mudar para usuário não-root
USER nextjs

# Expor porta
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=20s --retries=3 \
    CMD curl -f http://localhost:3000/ || exit 1

# Comando standalone
CMD ["dumb-init", "serve", "-s", "dist", "-l", "3000"]