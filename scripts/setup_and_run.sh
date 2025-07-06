#!/bin/bash

# Mestres do Café - Setup and Run Script
# Este script configura e executa o projeto com todas as melhorias implementadas

set -e  # Exit on any error

echo "🚀 Mestres do Café - Setup & Run Script"
echo "======================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Functions
log_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Check if Python is installed
check_python() {
    if ! command -v python3 &> /dev/null; then
        log_error "Python 3 is not installed. Please install Python 3.8 or higher."
        exit 1
    fi
    
    PYTHON_VERSION=$(python3 --version | cut -d " " -f 2)
    log_success "Python $PYTHON_VERSION found"
}

# Check if Node.js is installed
check_node() {
    if ! command -v node &> /dev/null; then
        log_warning "Node.js is not installed. Frontend may not work properly."
        return 1
    fi
    
    NODE_VERSION=$(node --version)
    log_success "Node.js $NODE_VERSION found"
    return 0
}

# Setup backend
setup_backend() {
    log_info "Setting up backend..."
    
    cd apps/api
    
    # Create virtual environment if it doesn't exist
    if [ ! -d "venv" ]; then
        log_info "Creating virtual environment..."
        python3 -m venv venv
    fi
    
    # Activate virtual environment
    source venv/bin/activate
    
    # Install dependencies
    log_info "Installing Python dependencies..."
    pip install --upgrade pip
    pip install -r requirements.txt
    
    # Setup environment file
    if [ ! -f ".env" ]; then
        log_info "Creating .env file from template..."
        cp .env.example .env
        log_warning "Please edit .env file with your actual configuration values"
    fi
    
    # Create logs directory
    if [ ! -d "logs" ]; then
        mkdir -p logs
        log_success "Created logs directory"
    fi
    
    cd ../..
    log_success "Backend setup completed"
}

# Setup frontend
setup_frontend() {
    log_info "Setting up frontend..."
    
    if check_node; then
        cd apps/web
        
        if [ -f "package.json" ]; then
            log_info "Installing Node.js dependencies..."
            npm install
            log_success "Frontend dependencies installed"
        else
            log_warning "No package.json found in frontend directory"
        fi
        
        cd ../..
    else
        log_warning "Skipping frontend setup (Node.js not available)"
    fi
}

# Setup database
setup_database() {
    log_info "Setting up database..."
    
    cd apps/api
    source venv/bin/activate
    
    # Initialize database
    python -c "
from src.app import create_app
from src.models.base import db

app = create_app()
with app.app_context():
    db.create_all()
    print('✅ Database initialized')
"
    
    cd ../..
    log_success "Database setup completed"
}

# Run tests
run_tests() {
    log_info "Running tests..."
    
    cd apps/api
    source venv/bin/activate
    
    if command -v pytest &> /dev/null; then
        pytest -v
        log_success "All tests passed"
    else
        log_warning "pytest not found, skipping tests"
    fi
    
    cd ../..
}

# Start backend server
start_backend() {
    log_info "Starting backend server..."
    
    cd apps/api
    source venv/bin/activate
    
    export FLASK_ENV=development
    export FLASK_APP=src/app.py
    
    # Start the server
    python src/app.py &
    BACKEND_PID=$!
    
    cd ../..
    
    log_success "Backend server started (PID: $BACKEND_PID)"
    echo "🌐 Backend running at: http://localhost:5000"
    echo "🏥 Health check: http://localhost:5000/api/health"
}

# Start frontend server
start_frontend() {
    if check_node; then
        log_info "Starting frontend server..."
        
        cd apps/web
        
        if [ -f "package.json" ]; then
            npm run dev &
            FRONTEND_PID=$!
            
            log_success "Frontend server started (PID: $FRONTEND_PID)"
            echo "🌐 Frontend running at: http://localhost:3000"
        else
            log_warning "No package.json found, cannot start frontend"
        fi
        
        cd ../..
    fi
}

# Health check
health_check() {
    log_info "Performing health check..."
    
    sleep 3  # Wait for server to start
    
    if curl -s http://localhost:5000/api/health > /dev/null; then
        log_success "Backend health check passed"
    else
        log_error "Backend health check failed"
    fi
}

# Display helpful information
show_info() {
    echo ""
    echo "🎉 Setup completed successfully!"
    echo ""
    echo "📋 Useful URLs:"
    echo "  • Backend API: http://localhost:5000"
    echo "  • API Documentation: http://localhost:5000/api/info"
    echo "  • Health Check: http://localhost:5000/api/health"
    echo "  • Detailed Health: http://localhost:5000/api/health/detailed"
    echo ""
    echo "🔧 Useful Commands:"
    echo "  • Run tests: cd apps/api && source venv/bin/activate && pytest"
    echo "  • View logs: tail -f apps/api/logs/mestres_cafe.log"
    echo "  • Stop servers: killall python node"
    echo ""
    echo "📚 Documentation:"
    echo "  • Security Fixes: docs/SECURITY_FIXES_IMPLEMENTATION.md"
    echo "  • Environment Setup: apps/api/.env.example"
    echo ""
    echo "🛠️  Configuration:"
    echo "  • Edit apps/api/.env for environment variables"
    echo "  • Check apps/api/src/config.py for configuration options"
    echo ""
}

# Cleanup function
cleanup() {
    log_info "Cleaning up..."
    
    # Kill background processes
    if [ ! -z "$BACKEND_PID" ]; then
        kill $BACKEND_PID 2>/dev/null || true
    fi
    
    if [ ! -z "$FRONTEND_PID" ]; then
        kill $FRONTEND_PID 2>/dev/null || true
    fi
    
    log_info "Cleanup completed"
}

# Trap cleanup on script exit
trap cleanup EXIT

# Main execution
main() {
    case "$1" in
        "setup")
            check_python
            setup_backend
            setup_frontend
            setup_database
            log_success "Setup completed! Run './scripts/setup_and_run.sh start' to start servers"
            ;;
        "test")
            run_tests
            ;;
        "start")
            start_backend
            start_frontend
            health_check
            show_info
            
            # Keep script running
            log_info "Servers are running. Press Ctrl+C to stop."
            wait
            ;;
        "backend")
            start_backend
            health_check
            show_info
            wait
            ;;
        "health")
            health_check
            ;;
        "full")
            check_python
            setup_backend
            setup_frontend
            setup_database
            run_tests
            start_backend
            start_frontend
            health_check
            show_info
            wait
            ;;
        *)
            echo "Usage: $0 {setup|test|start|backend|health|full}"
            echo ""
            echo "Commands:"
            echo "  setup   - Setup backend, frontend, and database"
            echo "  test    - Run tests"
            echo "  start   - Start both backend and frontend servers"
            echo "  backend - Start only backend server"
            echo "  health  - Perform health check"
            echo "  full    - Complete setup and start (recommended for first run)"
            echo ""
            echo "Examples:"
            echo "  $0 full      # Complete setup and start"
            echo "  $0 setup     # Just setup without starting"
            echo "  $0 start     # Start servers (after setup)"
            echo "  $0 test      # Run tests"
            exit 1
            ;;
    esac
}

# Run main function with all arguments
main "$@"