# Dockerfile para produção - Mestres do Café Enterprise
FROM node:18-alpine AS frontend-builder

# Instala dependências do frontend
WORKDIR /app/frontend
COPY apps/web/package*.json ./
RUN npm ci --only=production

# Build do frontend
COPY apps/web/ ./
RUN npm run build

# Imagem Python para backend
FROM python:3.11-slim AS backend

# Instala dependências do sistema
RUN apt-get update && apt-get install -y \
    gcc \
    g++ \
    libpq-dev \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Cria usuário não-root
RUN useradd --create-home --shell /bin/bash app

# Define diretório de trabalho
WORKDIR /app

# Copia requirements e instala dependências Python
COPY apps/api/requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# Copia código do backend
COPY apps/api/ ./
COPY --from=frontend-builder /app/frontend/dist ./static/

# Configurações de produção
ENV FLASK_ENV=production
ENV PYTHONPATH=/app/src
ENV GUNICORN_WORKERS=4
ENV GUNICORN_TIMEOUT=120

# Expõe porta
EXPOSE 5001

# Muda para usuário não-root
USER app

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD curl -f http://localhost:5001/api/health || exit 1

# Comando de inicialização
CMD ["gunicorn", "--bind", "0.0.0.0:5001", "--workers", "4", "--timeout", "120", "--access-logfile", "-", "--error-logfile", "-", "app:app"]