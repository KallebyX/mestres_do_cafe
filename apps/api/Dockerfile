# Mestres do Café - Backend API Dockerfile
# Multi-stage build otimizado para desenvolvimento e produção

# =============================================================================
# Stage 1: Base com dependências do sistema
# =============================================================================
FROM python:3.11-slim as base

# Metadados
LABEL maintainer="KallebyX"
LABEL description="Mestres do Café Enterprise API"
LABEL version="1.0.0"

# Configurações de ambiente para Python
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PYTHONHASHSEED=random \
    PIP_NO_CACHE_DIR=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1

# Instalar dependências do sistema
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    g++ \
    libpq-dev \
    curl \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/* \
    && apt-get clean

# Criar usuário não-root para segurança
RUN groupadd --gid 1001 appgroup && \
    useradd --uid 1001 --gid appgroup --shell /bin/bash --create-home appuser

# =============================================================================
# Stage 2: Development
# =============================================================================
FROM base as development

WORKDIR /app

# Instalar dependências Python + ferramentas de desenvolvimento
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt && \
    pip install --no-cache-dir pytest pytest-cov black flake8 isort

# Copiar código fonte
COPY --chown=appuser:appgroup . .

# Criar diretórios necessários
RUN mkdir -p logs uploads instance && \
    chown -R appuser:appgroup /app

# Configurações de desenvolvimento
ENV FLASK_ENV=development \
    FLASK_DEBUG=1 \
    PYTHONPATH=/app/src \
    PORT=5001

# Mudar para usuário não-root
USER appuser

# Expor porta
EXPOSE 5001

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
    CMD curl -f http://localhost:5001/api/health || exit 1

# Comando de desenvolvimento
CMD ["python", "src/app.py"]

# =============================================================================
# Stage 3: Production
# =============================================================================
FROM base as production

WORKDIR /app

# Instalar apenas dependências de produção + Gunicorn
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt gunicorn[gevent] && \
    pip cache purge

# Copiar código fonte
COPY --chown=appuser:appgroup . .

# Criar diretórios necessários com permissões corretas
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

# Health check mais rigoroso para produção
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD curl -f http://localhost:5001/api/health || exit 1

# Comando de produção otimizado
CMD ["sh", "-c", "gunicorn --bind 0.0.0.0:${PORT} --workers ${GUNICORN_WORKERS} --threads ${GUNICORN_THREADS} --timeout ${GUNICORN_TIMEOUT} --keepalive ${GUNICORN_KEEPALIVE} --max-requests ${GUNICORN_MAX_REQUESTS} --max-requests-jitter ${GUNICORN_MAX_REQUESTS_JITTER} --worker-class gevent --worker-connections 1000 --access-logfile - --error-logfile - --log-level info --preload src.app:app"]

# =============================================================================
# Stage 4: Testing (opcional)
# =============================================================================
FROM development as testing

# Instalar dependências adicionais de teste
RUN pip install --no-cache-dir pytest-xdist pytest-benchmark pytest-mock

# Comando de teste
CMD ["python", "-m", "pytest", "tests/", "-v", "--tb=short"]