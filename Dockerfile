# 🐳 Dockerfile - Mestres do Café Production Ready
# Sistema completo com estrutura profissional organizada
# Frontend React + Backend Express + Estrutura Enterprise

FROM node:20-alpine

# Informações do projeto atualizadas
LABEL maintainer="Mestres do Café <contato@mestresdocafe.com.br>"
LABEL description="Sistema Completo Mestres do Café - E-commerce de Cafés Especiais"
LABEL version="2.0.0"
LABEL structure="Enterprise-grade com documentação organizada"

# Definir diretório de trabalho
WORKDIR /app

# Instalar dependências do sistema otimizadas
RUN apk add --no-cache \
    git \
    python3 \
    make \
    g++ \
    chromium \
    nss \
    freetype \
    freetype-dev \
    harfbuzz \
    ca-certificates \
    ttf-freefont \
    && rm -rf /var/cache/apk/*

# Configurações para Puppeteer e performance
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser
ENV NODE_ENV=production

# Copiar package.json primeiro para aproveitar cache do Docker
COPY package*.json ./

# Instalar dependências com otimizações para produção
RUN npm ci --only=production --no-audit --no-fund \
    && npm cache clean --force

# Copiar estrutura organizada do projeto
COPY src/ ./src/
COPY public/ ./public/
COPY server/ ./server/
COPY database/ ./database/
COPY scripts/ ./scripts/
COPY documentation/ ./documentation/

# Copiar arquivos de configuração
COPY *.js ./
COPY *.json ./
COPY *.html ./
COPY *.toml ./
COPY *.yaml ./
COPY *.env* ./

# Build otimizado do frontend
RUN npm run build

# Criar estrutura de diretórios para logs e dados
RUN mkdir -p /app/logs /app/temp \
    && mkdir -p /app/public/uploads

# Remover arquivos desnecessários para reduzir tamanho da imagem
RUN rm -rf \
    node_modules/.cache \
    src/components/ui \
    documentation/migrations \
    .git \
    *.test.* \
    *.spec.* \
    tests/ \
    coverage/

# Criar usuário não-root para segurança
RUN addgroup -g 1001 -S nodejs && \
    adduser -S mestres -u 1001

# Configurar permissões para estrutura enterprise
RUN chown -R mestres:nodejs /app \
    && chmod -R 755 /app/scripts \
    && chmod -R 644 /app/documentation \
    && chmod -R 755 /app/public \
    && chmod -R 700 /app/logs

# Mudar para usuário não-root
USER mestres

# Expor porta do servidor unificado
EXPOSE 5000

# Health check melhorado para sistema completo
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
    CMD node -e " \
        const http = require('http'); \
        const options = { \
            hostname: 'localhost', \
            port: 5000, \
            path: '/health', \
            timeout: 5000 \
        }; \
        const req = http.request(options, (res) => { \
            process.exit(res.statusCode === 200 ? 0 : 1); \
        }); \
        req.on('error', () => process.exit(1)); \
        req.on('timeout', () => process.exit(1)); \
        req.end();" \
    || exit 1

# Comando para iniciar o sistema completo
CMD ["npm", "start"] 