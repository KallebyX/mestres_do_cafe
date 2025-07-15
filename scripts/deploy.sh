#!/bin/bash

# Mestres do Café - Deploy Script
# Script para deploy automatizado em produção

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Configuration
COMPOSE_FILE="docker-compose.prod.yml"
ENV_FILE=".env.production"
BACKUP_DIR="./data/backups"
LOG_FILE="./logs/deploy.log"

# Create necessary directories
mkdir -p logs data/backups data/uploads data/static

# Check if environment file exists
if [ ! -f "$ENV_FILE" ]; then
    log_error "Environment file $ENV_FILE not found!"
    log_info "Please create $ENV_FILE based on .env.production template"
    exit 1
fi

log_info "Starting Mestres do Café deployment..."

# Check Docker and Docker Compose
if ! command -v docker &> /dev/null; then
    log_error "Docker is not installed!"
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    log_error "Docker Compose is not installed!"
    exit 1
fi

# Load environment variables
set -a
source "$ENV_FILE"
set +a

log_info "Environment variables loaded from $ENV_FILE"

# Pre-deployment backup
log_info "Creating pre-deployment backup..."
if [ "$1" != "--skip-backup" ]; then
    docker-compose -f "$COMPOSE_FILE" --profile backup up backup
    log_success "Backup completed"
else
    log_warning "Skipping backup as requested"
fi

# Build images
log_info "Building Docker images..."
docker-compose -f "$COMPOSE_FILE" build --no-cache

# Stop existing services
log_info "Stopping existing services..."
docker-compose -f "$COMPOSE_FILE" down

# Start database and cache first
log_info "Starting database and cache services..."
docker-compose -f "$COMPOSE_FILE" up -d db redis

# Wait for database to be ready
log_info "Waiting for database to be ready..."
timeout 60 bash -c 'until docker-compose -f '"$COMPOSE_FILE"' exec -T db pg_isready -U '"$POSTGRES_USER"' -d '"$POSTGRES_DB"'; do sleep 2; done'

# Run database migrations if needed
log_info "Running database migrations..."
# Add migration commands here if using Alembic

# Start application services
log_info "Starting application services..."
docker-compose -f "$COMPOSE_FILE" up -d api

# Wait for API to be ready
log_info "Waiting for API to be ready..."
timeout 60 bash -c 'until curl -f http://localhost:5001/api/health; do sleep 2; done'

# Start frontend
log_info "Starting frontend services..."
docker-compose -f "$COMPOSE_FILE" up -d frontend nginx

# Health check
log_info "Performing health checks..."
sleep 10

if curl -f http://localhost/health > /dev/null 2>&1; then
    log_success "Frontend is healthy"
else
    log_error "Frontend health check failed"
    exit 1
fi

if curl -f http://localhost:5001/api/health > /dev/null 2>&1; then
    log_success "API is healthy"
else
    log_error "API health check failed"
    exit 1
fi

# Optional monitoring services
if [ "$2" = "--with-monitoring" ]; then
    log_info "Starting monitoring services..."
    docker-compose -f "$COMPOSE_FILE" --profile monitoring up -d
    log_success "Monitoring services started"
fi

# Optional logging services
if [ "$2" = "--with-logging" ]; then
    log_info "Starting logging services..."
    docker-compose -f "$COMPOSE_FILE" --profile logging up -d
    log_success "Logging services started"
fi

# Clean up old images
log_info "Cleaning up old Docker images..."
docker image prune -f

# Display status
log_info "Deployment status:"
docker-compose -f "$COMPOSE_FILE" ps

log_success "Deployment completed successfully!"
log_info "Application is available at:"
log_info "  - Frontend: http://localhost (or your domain)"
log_info "  - API: http://localhost:5001/api"
log_info "  - Health Check: http://localhost/health"

if [ "$2" = "--with-monitoring" ]; then
    log_info "  - Grafana: http://localhost:3001"
    log_info "  - Prometheus: http://localhost:9090"
fi

if [ "$2" = "--with-logging" ]; then
    log_info "  - Kibana: http://localhost:5601"
fi

# Log deployment
echo "$(date): Deployment completed successfully" >> "$LOG_FILE"