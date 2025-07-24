#!/bin/bash

# 🚀 Mestres do Café - Deploy Script
# Prepares the system for deployment (development and production)

set -e

echo "🚀 Mestres do Café - Deployment Preparation"
echo "=========================================="

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info() {
    echo -e "ℹ️  $1"
}

# Check if we're in the correct directory
if [ ! -f "render.yaml" ]; then
    print_error "render.yaml not found. Please run this script from the project root."
    exit 1
fi

# Function to check system dependencies
check_dependencies() {
    print_info "Checking system dependencies..."
    
    # Check Node.js
    if command -v node &> /dev/null; then
        NODE_VERSION=$(node --version)
        print_success "Node.js found: $NODE_VERSION"
    else
        print_error "Node.js not found. Please install Node.js 18 or higher."
        exit 1
    fi
    
    # Check Python
    if command -v python3 &> /dev/null; then
        PYTHON_VERSION=$(python3 --version)
        print_success "Python found: $PYTHON_VERSION"
    else
        print_error "Python3 not found. Please install Python 3.12 or higher."
        exit 1
    fi
    
    # Check npm
    if command -v npm &> /dev/null; then
        NPM_VERSION=$(npm --version)
        print_success "npm found: $NPM_VERSION"
    else
        print_error "npm not found. Please install npm."
        exit 1
    fi
}

# Function to test backend
test_backend() {
    print_info "Testing backend API..."
    cd apps/api
    
    if python3 test_health.py; then
        print_success "Backend tests passed!"
    else
        print_error "Backend tests failed!"
        exit 1
    fi
    
    cd ../..
}

# Function to test and build frontend
test_build_frontend() {
    print_info "Building frontend..."
    cd apps/web
    
    # Install dependencies
    print_info "Installing frontend dependencies..."
    npm ci
    
    # Run tests
    print_info "Running frontend tests..."
    if npm run test:ci; then
        print_success "Frontend tests passed!"
    else
        print_error "Frontend tests failed!"
        exit 1
    fi
    
    # Build
    print_info "Building frontend for production..."
    if npm run build; then
        print_success "Frontend build successful!"
    else
        print_error "Frontend build failed!"
        exit 1
    fi
    
    cd ../..
}

# Function to validate environment files
validate_env() {
    print_info "Validating environment configuration..."
    
    if [ -f ".env.example" ]; then
        print_success ".env.example found"
    else
        print_warning ".env.example not found"
    fi
    
    if [ -f "render.env.example" ]; then
        print_success "render.env.example found"
    else
        print_warning "render.env.example not found"
    fi
    
    if [ -f "render.yaml" ]; then
        print_success "render.yaml found"
    else
        print_error "render.yaml not found!"
        exit 1
    fi
}

# Function to show deployment instructions
show_deployment_instructions() {
    echo ""
    echo "🎉 Deployment preparation completed successfully!"
    echo "============================================="
    echo ""
    echo "📋 Next steps for Render deployment:"
    echo ""
    echo "1. 🔧 Configure environment variables in Render:"
    echo "   - Copy values from render.env.example"
    echo "   - Set VITE_API_URL to your API service URL"
    echo "   - Generate strong SECRET_KEY and JWT_SECRET_KEY"
    echo ""
    echo "2. 🌐 Services will be deployed as:"
    echo "   - Frontend: mestres-cafe-web (React/Vite)"  
    echo "   - Backend: mestres-cafe-api (Python)"
    echo ""
    echo "3. 🔍 Health checks:"
    echo "   - API: https://mestres-cafe-api.onrender.com/api/health"
    echo "   - Web: https://mestres-cafe-web.onrender.com"
    echo ""
    echo "4. 📦 Services configured:"
    echo "   - ✅ Auto-deploy from main branch"
    echo "   - ✅ Health check endpoints"  
    echo "   - ✅ Production environment"
    echo ""
    echo "5. 🚀 To deploy:"
    echo "   - Connect your GitHub repo to Render"
    echo "   - Import render.yaml blueprint"  
    echo "   - Set environment variables"
    echo "   - Deploy!"
    echo ""
    print_success "System is ready for deployment! 🎯"
}

# Main execution
main() {
    check_dependencies
    validate_env
    test_backend
    test_build_frontend
    show_deployment_instructions
}

# Handle script arguments
case "${1:-all}" in
    "backend")
        print_info "Testing backend only..."
        check_dependencies
        test_backend
        ;;
    "frontend") 
        print_info "Testing frontend only..."
        check_dependencies
        test_build_frontend
        ;;
    "env")
        print_info "Validating environment only..."
        validate_env
        ;;
    "all"|*)
        print_info "Running complete deployment preparation..."
        main
        ;;
esac