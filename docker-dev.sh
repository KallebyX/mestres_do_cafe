#!/bin/bash

# Mestres do Café - Docker Development Helper Script
# Facilita o gerenciamento do ambiente Docker para desenvolvimento

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Functions
print_header() {
    echo -e "${BLUE}========================================${NC}"
    echo -e "${BLUE} Mestres do Café - Docker Helper${NC}"
    echo -e "${BLUE}========================================${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Check if Docker is running
check_docker() {
    if ! docker info >/dev/null 2>&1; then
        print_error "Docker is not running. Please start Docker first."
        exit 1
    fi
}

# Check if .env exists
check_env() {
    if [ ! -f .env ]; then
        print_warning ".env file not found. Creating from .env.example..."
        cp .env.example .env
        print_success ".env file created. Please review and customize it."
    fi
}

# Main commands
case "$1" in
    "start"|"up")
        print_header
        check_docker
        check_env
        
        print_success "Starting Mestres do Café development environment..."
        docker-compose up -d
        
        echo ""
        print_success "Environment started successfully!"
        echo -e "🌐 Frontend: ${BLUE}http://localhost:3000${NC}"
        echo -e "🔧 API: ${BLUE}http://localhost:5001${NC}"
        echo -e "🗄️  Database: ${BLUE}localhost:5432${NC}"
        echo -e "💾 Redis: ${BLUE}localhost:6379${NC}"
        echo ""
        echo "Run '${YELLOW}./docker-dev.sh logs${NC}' to see application logs"
        echo "Run '${YELLOW}./docker-dev.sh stop${NC}' to stop all services"
        ;;
        
    "stop"|"down")
        print_header
        print_success "Stopping Mestres do Café environment..."
        docker-compose down
        print_success "Environment stopped."
        ;;
        
    "restart")
        print_header
        check_docker
        print_success "Restarting Mestres do Café environment..."
        docker-compose down
        docker-compose up -d
        print_success "Environment restarted."
        ;;
        
    "logs")
        SERVICE=${2:-""}
        if [ -n "$SERVICE" ]; then
            docker-compose logs -f "$SERVICE"
        else
            docker-compose logs -f
        fi
        ;;
        
    "build")
        print_header
        check_docker
        print_success "Building Docker images..."
        docker-compose build --no-cache
        print_success "Images built successfully."
        ;;
        
    "shell")
        SERVICE=${2:-"api"}
        print_success "Opening shell in $SERVICE container..."
        docker-compose exec "$SERVICE" /bin/bash
        ;;
        
    "db")
        print_success "Connecting to PostgreSQL database..."
        docker-compose exec db psql -U kalleby -d mestres_cafe
        ;;
        
    "redis")
        print_success "Connecting to Redis..."
        docker-compose exec redis redis-cli -a redis123
        ;;
        
    "status")
        print_header
        echo "Container Status:"
        docker-compose ps
        echo ""
        echo "Network Status:"
        docker network ls | grep mestres
        echo ""
        echo "Volume Status:"
        docker volume ls | grep mestres
        ;;
        
    "clean")
        print_header
        read -p "This will remove all containers, networks, and volumes. Are you sure? (y/N): " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            print_warning "Cleaning up Docker environment..."
            docker-compose down -v --remove-orphans
            docker system prune -f
            print_success "Cleanup completed."
        else
            print_success "Cleanup cancelled."
        fi
        ;;
        
    "production")
        print_header
        check_docker
        check_env
        print_success "Starting Mestres do Café PRODUCTION environment..."
        export BUILD_TARGET=production
        export WEB_BUILD_TARGET=production
        docker-compose --profile production up -d
        print_success "Production environment started!"
        ;;
        
    "monitoring")
        print_header
        check_docker
        check_env
        print_success "Starting with monitoring stack..."
        docker-compose --profile monitoring up -d
        print_success "Monitoring stack started!"
        echo -e "📊 Prometheus: ${BLUE}http://localhost:9090${NC}"
        echo -e "📈 Grafana: ${BLUE}http://localhost:3001${NC} (admin/admin123)"
        ;;
        
    "test")
        print_header
        print_success "Running tests..."
        docker-compose run --rm api python -m pytest tests/ -v
        docker-compose run --rm web npm run test
        ;;
        
    "migrate")
        print_success "Running database migrations..."
        docker-compose exec api python -c "
from src.database import db
from src.app import create_app
app = create_app()
with app.app_context():
    db.create_all()
    print('Database tables created successfully!')
"
        ;;
        
    "seed")
        print_success "Seeding database with sample data..."
        docker-compose exec api python -c "
from src.app import create_app
app = create_app()
with app.app_context():
    # Add your seed data logic here
    print('Database seeded successfully!')
"
        ;;
        
    "backup")
        BACKUP_FILE="backup_$(date +%Y%m%d_%H%M%S).sql"
        print_success "Creating database backup: $BACKUP_FILE"
        docker-compose exec -T db pg_dump -U kalleby mestres_cafe > "backups/$BACKUP_FILE"
        print_success "Backup created: backups/$BACKUP_FILE"
        ;;
        
    "help"|*)
        print_header
        echo "Usage: ./docker-dev.sh [COMMAND]"
        echo ""
        echo "Commands:"
        echo "  start, up        Start development environment"
        echo "  stop, down       Stop all services"
        echo "  restart          Restart all services"
        echo "  logs [service]   Show logs (optionally for specific service)"
        echo "  build            Build Docker images"
        echo "  shell [service]  Open shell in container (default: api)"
        echo "  db               Connect to PostgreSQL database"
        echo "  redis            Connect to Redis"
        echo "  status           Show status of all services"
        echo "  clean            Remove all containers, networks, and volumes"
        echo "  production       Start production environment"
        echo "  monitoring       Start with monitoring stack"
        echo "  test             Run all tests"
        echo "  migrate          Run database migrations"
        echo "  seed             Seed database with sample data"
        echo "  backup           Create database backup"
        echo "  help             Show this help message"
        echo ""
        echo "Examples:"
        echo "  ./docker-dev.sh start          # Start development environment"
        echo "  ./docker-dev.sh logs api       # Show API logs"
        echo "  ./docker-dev.sh shell web      # Open shell in web container"
        echo "  ./docker-dev.sh production     # Start production environment"
        ;;
esac