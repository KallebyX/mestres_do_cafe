# Mestres do Café - Backend Dockerfile
# Multi-stage build para otimização

# Stage 1: Development
FROM python:3.11-slim as development

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    g++ \
    libpq-dev \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy source code
COPY . .

# Create non-root user
RUN addgroup --system --gid 1001 flask && \
    adduser --system --uid 1001 --gid 1001 flask

# Set permissions
RUN chown -R flask:flask /app

# Switch to non-root user
USER flask

# Expose port
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:5000/api/health || exit 1

# Development command
CMD ["python", "src/app.py"]

# Stage 2: Production
FROM python:3.11-slim as production

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    libpq-dev \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt gunicorn

# Copy source code
COPY . .

# Create non-root user
RUN addgroup --system --gid 1001 flask && \
    adduser --system --uid 1001 --gid 1001 flask

# Set permissions
RUN chown -R flask:flask /app

# Switch to non-root user
USER flask

# Expose port
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:5000/api/health || exit 1

# Production command
CMD ["gunicorn", "--bind", "0.0.0.0:5000", "--workers", "4", "--timeout", "120", "src.app:app"]

