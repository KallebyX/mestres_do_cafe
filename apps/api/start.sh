#!/bin/bash

# Mestres do Café - API Start Script for Render
# Script de inicialização para produção no Render

set -e

echo "🚀 Starting Mestres do Café API server..."

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

# Step 1: Environment verification
print_step "Verifying environment..."
export FLASK_ENV=production
export FLASK_DEBUG=0
export PYTHONPATH="/opt/render/project/src/src"

# Step 2: Check required environment variables
print_step "Checking required environment variables..."
REQUIRED_VARS=("DATABASE_URL" "SECRET_KEY" "JWT_SECRET_KEY")
MISSING_VARS=()

for var in "${REQUIRED_VARS[@]}"; do
    if [ -z "${!var}" ]; then
        MISSING_VARS+=("$var")
    fi
done

if [ ${#MISSING_VARS[@]} -gt 0 ]; then
    print_error "Missing required environment variables:"
    for var in "${MISSING_VARS[@]}"; do
        echo "  - $var"
    done
    exit 1
fi

print_success "All required environment variables present"

# Step 3: Database connection test
print_step "Testing database connection..."
python -c "
import sys
sys.path.insert(0, 'src')

try:
    from src.database import db
    from src.app import create_app
    
    app = create_app('production')
    with app.app_context():
        result = db.session.execute(db.text('SELECT 1')).fetchone()
        if result:
            print('✅ Database connection successful')
        else:
            print('❌ Database connection failed')
            sys.exit(1)
except Exception as e:
    print(f'❌ Database connection error: {e}')
    sys.exit(1)
"

# Step 4: Pre-flight health check
print_step "Running pre-flight health check..."
python -c "
import sys
sys.path.insert(0, 'src')

try:
    from src.app import create_app
    app = create_app('production')
    
    with app.test_client() as client:
        response = client.get('/api/health')
        if response.status_code == 200:
            print('✅ Application health check passed')
        else:
            print(f'❌ Health check failed with status {response.status_code}')
            sys.exit(1)
except Exception as e:
    print(f'❌ Health check error: {e}')
    sys.exit(1)
"

# Step 5: Configure Gunicorn settings
print_step "Configuring Gunicorn settings..."

# Default values
PORT=${PORT:-5001}
WORKERS=${GUNICORN_WORKERS:-2}
THREADS=${GUNICORN_THREADS:-4}
TIMEOUT=${GUNICORN_TIMEOUT:-120}
KEEPALIVE=${GUNICORN_KEEPALIVE:-2}
MAX_REQUESTS=${GUNICORN_MAX_REQUESTS:-1000}
MAX_REQUESTS_JITTER=${GUNICORN_MAX_REQUESTS_JITTER:-100}

print_success "Gunicorn configured with:"
echo "   - Port: $PORT"
echo "   - Workers: $WORKERS"
echo "   - Threads: $THREADS"
echo "   - Timeout: ${TIMEOUT}s"
echo "   - Keep-alive: ${KEEPALIVE}s"
echo "   - Max requests: $MAX_REQUESTS"

# Step 6: Create run-time directories
print_step "Creating runtime directories..."
mkdir -p logs uploads tmp
chmod 755 logs uploads tmp

# Step 7: Start the application
print_step "Starting Gunicorn server..."
echo ""
echo "🎯 Mestres do Café API Server"
echo "🌐 Port: $PORT"
echo "🔧 Mode: Production"
echo "🗄️  Database: PostgreSQL"
echo "💾 Cache: Redis"
echo ""

# Execute Gunicorn with optimized settings
exec gunicorn \
    --bind 0.0.0.0:$PORT \
    --workers $WORKERS \
    --threads $THREADS \
    --worker-class gevent \
    --worker-connections 1000 \
    --timeout $TIMEOUT \
    --keepalive $KEEPALIVE \
    --max-requests $MAX_REQUESTS \
    --max-requests-jitter $MAX_REQUESTS_JITTER \
    --access-logfile - \
    --error-logfile - \
    --log-level info \
    --capture-output \
    --enable-stdio-inheritance \
    --preload \
    --worker-tmp-dir tmp \
    --forwarded-allow-ips="*" \
    --access-logformat '%({x-forwarded-for}i)s %(l)s %(u)s %(t)s "%(r)s" %(s)s %(b)s "%(f)s" "%(a)s" %(D)s' \
    src.app:app