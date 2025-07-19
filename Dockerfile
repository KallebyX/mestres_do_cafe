# Mestres do Café Enterprise - Dockerfile Principal
# Build unificado para aplicação completa (Frontend + Backend)

# =============================================================================
# Stage 1: Frontend Build
# =============================================================================
FROM node:18-alpine AS frontend-builder

# Metadados
LABEL maintainer="KallebyX"
LABEL description="Mestres do Café Enterprise - Frontend Builder"

# Instalar dependências do sistema
RUN apk add --no-cache curl ca-certificates

# Configurar diretório de trabalho
WORKDIR /app/frontend

# Copiar arquivos de dependências do frontend
COPY apps/web/package*.json ./

# Instalar dependências
RUN npm ci --only=production && \
    npm cache clean --force

# Copiar código fonte do frontend
COPY apps/web/ ./

# Configurações de build
ENV NODE_ENV=production \
    VITE_API_URL=/api \
    VITE_APP_NAME="Mestres do Café Enterprise"

# Build da aplicação
RUN npm run build

# =============================================================================
# Stage 2: Backend Production
# =============================================================================
FROM python:3.11-slim AS backend-production

# Metadados
LABEL maintainer="KallebyX"
LABEL description="Mestres do Café Enterprise - Production"
LABEL version="1.0.0"

# Configurações de ambiente para Python
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PYTHONHASHSEED=random \
    PIP_NO_CACHE_DIR=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1

# Instalar dependências do sistema
RUN apt-get update && apt-get install -y --no-install-recommends \
    libpq-dev \
    curl \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/* \
    && apt-get clean

# Criar usuário não-root
RUN groupadd --gid 1001 appgroup && \
    useradd --uid 1001 --gid appgroup --shell /bin/bash --create-home appuser

# Configurar diretório de trabalho
WORKDIR /app

# Copiar e instalar dependências Python
COPY apps/api/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt gunicorn[gevent] && \
    pip cache purge

# Copiar código do backend
COPY --chown=appuser:appgroup apps/api/ .

# Copiar frontend buildado para servir como estáticos
COPY --from=frontend-builder --chown=appuser:appgroup /app/frontend/dist ./static/

# Criar diretórios necessários
RUN mkdir -p logs uploads instance && \
    chown -R appuser:appgroup /app && \
    chmod -R 755 /app

# Configurações de produção
ENV FLASK_ENV=production \
    FLASK_DEBUG=0 \
    PYTHONPATH=/app/src \
    GUNICORN_WORKERS=4 \
    GUNICORN_THREADS=2 \
    GUNICORN_TIMEOUT=120 \
    GUNICORN_KEEPALIVE=2 \
    GUNICORN_MAX_REQUESTS=1000 \
    GUNICORN_MAX_REQUESTS_JITTER=100 \
    PORT=5001

# Mudar para usuário não-root
USER appuser

# Expor porta
EXPOSE 5001

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD curl -f http://localhost:5001/api/health || exit 1

# Comando de produção
CMD ["sh", "-c", "gunicorn --bind 0.0.0.0:${PORT} --workers ${GUNICORN_WORKERS} --threads ${GUNICORN_THREADS} --timeout ${GUNICORN_TIMEOUT} --keepalive ${GUNICORN_KEEPALIVE} --max-requests ${GUNICORN_MAX_REQUESTS} --max-requests-jitter ${GUNICORN_MAX_REQUESTS_JITTER} --worker-class gevent --worker-connections 1000 --access-logfile - --error-logfile - --log-level info --preload src.app:app"]

# =============================================================================
# Stage 3: Development (opcional)
# =============================================================================
FROM python:3.11-slim AS development

# Configurações de ambiente
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    FLASK_ENV=development \
    FLASK_DEBUG=1

# Instalar dependências do sistema
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    g++ \
    libpq-dev \
    curl \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# Criar usuário não-root
RUN groupadd --gid 1001 appgroup && \
    useradd --uid 1001 --gid appgroup --shell /bin/bash --create-home appuser

WORKDIR /app

# Instalar dependências Python + ferramentas de desenvolvimento
COPY apps/api/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt && \
    pip install --no-cache-dir pytest pytest-cov black flake8 isort

# Copiar código
COPY --chown=appuser:appgroup apps/api/ .

# Criar diretórios
RUN mkdir -p logs uploads instance && \
    chown -R appuser:appgroup /app

USER appuser

EXPOSE 5001

# Health check de desenvolvimento
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
    CMD curl -f http://localhost:5001/api/health || exit 1

CMD ["python", "src/app.py"]