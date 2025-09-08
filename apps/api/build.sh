#!/bin/bash

# Mestres do Café - API Build Script for Render
# Script de build para deployment no Render

set -e

echo "🚀 Starting Mestres do Café API build process..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_step() {
    echo -e "${BLUE}📋 $1${NC}"
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

# Step 1: Environment setup
print_step "Setting up environment variables..."
export FLASK_ENV=production
export FLASK_DEBUG=0
export PYTHONPATH="/opt/render/project/src/apps/api/src"
print_success "Environment configured for production"

# Step 2: Install Python dependencies
print_step "Installing Python dependencies..."
pip install --upgrade pip
pip install -r requirements.txt
print_success "Dependencies installed successfully"

# Step 3: Verify critical imports
print_step "Verifying critical imports..."
python -c "
import sys
sys.path.insert(0, 'src')

try:
    from src.app import create_app
    from src.database import db
    from src.services.mercado_pago_service import MercadoPagoService
    from src.services.melhor_envio_service import MelhorEnvioService
    print('✅ All critical imports successful')
except ImportError as e:
    print(f'❌ Import error: {e}')
    sys.exit(1)
"

# Step 4: Database setup (only if DATABASE_URL is available)
if [ ! -z "$DATABASE_URL" ]; then
    print_step "Setting up database with Render setup script..."
    python setup_render_db.py
    if [ $? -eq 0 ]; then
        print_success "Database setup completed successfully"
    else
        print_warning "Database setup failed, trying fallback methods..."
        
        # Fallback to force initialization
        python force_init_db.py
        if [ $? -eq 0 ]; then
            print_success "Database force initialization completed successfully"
        else
            print_warning "Force initialization failed, trying basic table creation..."
            
            # Final fallback
            python create_tables.py
            if [ $? -eq 0 ]; then
                print_success "Database tables created with fallback method"
            else
                print_warning "Database setup failed but continuing build..."
            fi
        fi
    fi
else
    print_warning "DATABASE_URL not found, skipping database setup"
fi

# Step 5: Create necessary directories
print_step "Creating necessary directories..."
mkdir -p logs uploads instance
chmod 755 logs uploads instance
print_success "Directories created and permissions set"

# Step 6: Verify Flask application
print_step "Verifying Flask application..."
python -c "
import sys
sys.path.insert(0, 'src')

try:
    from src.app import create_app
    app = create_app('production')
    print(f'✅ Flask app created successfully')
    print(f'📋 App name: {app.name}')
    print(f'📋 Debug mode: {app.debug}')
    print(f'📋 Testing mode: {app.testing}')
    
    # Test critical routes
    with app.test_client() as client:
        response = client.get('/api/health')
        if response.status_code == 200:
            print('✅ Health check endpoint working')
        else:
            print(f'⚠️  Health check returned {response.status_code}')
            
except Exception as e:
    print(f'❌ Flask verification error: {e}')
    sys.exit(1)
"

# Step 7: Generate build metadata
print_step "Generating build metadata..."
cat > build-info.json << EOF
{
    "build_time": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
    "build_env": "production",
    "python_version": "$(python --version)",
    "commit": "${RENDER_GIT_COMMIT:-unknown}",
    "branch": "${RENDER_GIT_BRANCH:-unknown}",
    "service": "mestres-cafe-api"
}
EOF
print_success "Build metadata generated"

# Final summary
echo ""
echo "🎉 Build completed successfully!"
echo "📊 Build Summary:"
echo "   - Environment: Production"
echo "   - Python Path: $PYTHONPATH"
echo "   - Database: $([ ! -z "$DATABASE_URL" ] && echo "PostgreSQL configured" || echo "Not configured")"
echo "   - Redis: $([ ! -z "$REDIS_URL" ] && echo "Configured" || echo "Not configured")"
echo "   - MercadoPago: $([ ! -z "$MERCADO_PAGO_ACCESS_TOKEN" ] && echo "Configured" || echo "Not configured")"
echo "   - MelhorEnvio: $([ ! -z "$MELHOR_ENVIO_API_KEY" ] && echo "Configured" || echo "Not configured")"
echo ""
echo "🚀 Ready for deployment!"