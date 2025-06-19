# 🐳 Dockerfile - Mestres do Café Unificado
# Frontend React + Backend Express em um container

FROM node:20-alpine

# Informações do projeto
LABEL maintainer="Daniel do Nascimento <mestres@cafe.com.br>"
LABEL description="Plataforma Mestres do Café - Torrefação Artesanal"
LABEL version="2.0.0"

# Definir diretório de trabalho
WORKDIR /app

# Instalar dependências do sistema
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
    ttf-freefont

# Configurações para Puppeteer
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser

# Copiar package.json primeiro para aproveitar cache do Docker
COPY package*.json ./

# Instalar dependências (usar npm install para resolver problemas de compatibilidade)
RUN npm install --production --no-audit --no-fund

# Copiar código fonte
COPY . .

# Remover arquivos desnecessários
RUN rm -rf \
    node_modules/.cache \
    tests \
    docs \
    .git \
    *.md \
    .env.example

# Build do frontend
RUN npm run build

# Criar usuário não-root para segurança
RUN addgroup -g 1001 -S nodejs && \
    adduser -S mestres -u 1001

# Ajustar permissões
RUN chown -R mestres:nodejs /app
USER mestres

# Expor porta
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD node -e "require('http').get('http://localhost:5000/health', (res) => process.exit(res.statusCode === 200 ? 0 : 1)).on('error', () => process.exit(1))"

# Comando para iniciar o servidor
CMD ["npm", "start"] 