# ⚡ Especificações de Performance - Mestres Café Enterprise

## Visão Geral

Este documento contém todas as especificações de performance do sistema Mestres Café Enterprise, incluindo SLAs, targets, benchmarks, configurações de otimização e estratégias de monitoramento.

## 1. SLA e Targets de Performance

### Service Level Agreements (SLA)

```yaml
availability:
  production: "99.9%"  # 8.76 horas de downtime por ano
  staging: "99.5%"     # Para testes e desenvolvimento
  maintenance_window: "Domingos 02:00-04:00 BRT"

response_times:
  api_endpoints:
    p50: "< 200ms"     # 50% das requisições
    p95: "< 500ms"     # 95% das requisições
    p99: "< 1000ms"    # 99% das requisições
  
  web_pages:
    first_contentful_paint: "< 1.5s"
    largest_contentful_paint: "< 2.5s"
    first_input_delay: "< 100ms"
    cumulative_layout_shift: "< 0.1"
    
  database_queries:
    simple_queries: "< 50ms"
    complex_queries: "< 200ms"
    reports: "< 2s"

throughput:
  concurrent_users: 1000
  requests_per_second: 500
  transactions_per_second: 100
  peak_load_capacity: "150% da carga normal"

error_rates:
  http_4xx: "< 1%"
  http_5xx: "< 0.1%"
  database_errors: "< 0.01%"
  payment_failures: "< 0.5%"
```

### Performance Targets por Funcionalidade

```yaml
e_commerce:
  product_listing:
    response_time: "< 300ms"
    concurrent_users: 500
    cache_hit_ratio: "> 90%"
  
  product_detail:
    response_time: "< 200ms"
    cache_hit_ratio: "> 95%"
  
  cart_operations:
    add_item: "< 150ms"
    update_quantity: "< 100ms"
    remove_item: "< 100ms"
  
  checkout_process:
    cart_to_checkout: "< 500ms"
    payment_processing: "< 3s"
    order_confirmation: "< 1s"

search:
  simple_search: "< 200ms"
  filtered_search: "< 500ms"
  autocomplete: "< 100ms"
  fuzzy_search: "< 800ms"

admin_operations:
  dashboard_load: "< 1s"
  report_generation: "< 5s"
  bulk_operations: "< 30s"
  data_export: "< 60s"
```

## 2. Benchmarks de Performance

### Hardware Baseline

```yaml
development_environment:
  cpu: "Intel i7-10th gen ou equivalente"
  memory: "16GB RAM"
  storage: "SSD NVMe"
  expected_performance:
    api_requests_per_second: 200
    concurrent_users: 50
    database_queries_per_second: 500

production_environment:
  cpu: "16 vCPUs"
  memory: "32GB RAM"
  storage: "SSD NVMe com IOPS > 3000"
  network: "1Gbps+"
  expected_performance:
    api_requests_per_second: 1000
    concurrent_users: 2000
    database_queries_per_second: 5000
```

### Database Performance Benchmarks

```sql
-- Benchmarks de consultas críticas
-- Consulta de produtos com paginação (baseline: < 50ms)
EXPLAIN (ANALYZE, BUFFERS) 
SELECT p.*, c.name as category_name
FROM products p
LEFT JOIN categories c ON p.category_id = c.id
WHERE p.is_active = true
ORDER BY p.created_at DESC
LIMIT 20 OFFSET 0;

-- Busca de produtos (baseline: < 100ms)
EXPLAIN (ANALYZE, BUFFERS)
SELECT p.*, ts_rank(search_vector, query) as rank
FROM products p, 
     to_tsquery('portuguese', 'café & premium') query
WHERE p.search_vector @@ query
ORDER BY rank DESC
LIMIT 10;

-- Consulta de pedidos do usuário (baseline: < 30ms)
EXPLAIN (ANALYZE, BUFFERS)
SELECT o.*, COUNT(oi.id) as items_count
FROM orders o
LEFT JOIN order_items oi ON o.id = oi.order_id
WHERE o.user_id = 123
GROUP BY o.id
ORDER BY o.created_at DESC
LIMIT 10;
```

### API Performance Benchmarks

```bash
# Testes de carga com Apache Bench
# Endpoint de listagem de produtos
ab -n 1000 -c 50 -H "Accept: application/json" \
   "https://api.mestrescafe.com/api/v1/products?page=1&per_page=20"

# Endpoint de detalhes do produto
ab -n 500 -c 25 -H "Accept: application/json" \
   "https://api.mestrescafe.com/api/v1/products/1"

# Endpoint de busca
ab -n 300 -c 15 -H "Accept: application/json" \
   "https://api.mestrescafe.com/api/v1/products?search=café"

# Resultados esperados:
# Requests per second: > 200
# Time per request: < 250ms (mean)
# Failed requests: 0
```

### Frontend Performance Benchmarks

```javascript
// Métricas Web Vitals (usando web-vitals library)
import {getCLS, getFID, getFCP, getLCP, getTTFB} from 'web-vitals';

// Targets de performance
const PERFORMANCE_TARGETS = {
  FCP: 1500,  // First Contentful Paint < 1.5s
  LCP: 2500,  // Largest Contentful Paint < 2.5s
  FID: 100,   // First Input Delay < 100ms
  CLS: 0.1,   // Cumulative Layout Shift < 0.1
  TTFB: 600   // Time to First Byte < 600ms
};

// Monitoramento automático
function trackWebVitals() {
  getCLS(metric => trackMetric('CLS', metric.value));
  getFID(metric => trackMetric('FID', metric.value));
  getFCP(metric => trackMetric('FCP', metric.value));
  getLCP(metric => trackMetric('LCP', metric.value));
  getTTFB(metric => trackMetric('TTFB', metric.value));
}

function trackMetric(name, value) {
  const target = PERFORMANCE_TARGETS[name];
  const status = value <= target ? 'good' : 'needs_improvement';
  
  // Enviar para analytics
  gtag('event', 'web_vitals', {
    metric_name: name,
    metric_value: value,
    metric_status: status
  });
}
```

## 3. Configurações de Otimização

### Frontend Optimization

```javascript
// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { splitVendorChunkPlugin } from 'vite';

export default defineConfig({
  plugins: [
    react(),
    splitVendorChunkPlugin()
  ],
  build: {
    // Otimizações de build
    target: 'es2020',
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true
      }
    },
    
    // Code splitting
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          router: ['react-router-dom'],
          ui: ['@headlessui/react', 'framer-motion'],
          utils: ['date-fns', 'lodash']
        }
      }
    },
    
    // Chunk size warnings
    chunkSizeWarningLimit: 1000
  },
  
  // Otimizações de desenvolvimento
  server: {
    hmr: {
      overlay: false
    }
  }
});

// React lazy loading
import { lazy, Suspense } from 'react';

const ProductList = lazy(() => import('./components/ProductList'));
const ProductDetail = lazy(() => import('./components/ProductDetail'));
const Cart = lazy(() => import('./components/Cart'));
const Checkout = lazy(() => import('./components/Checkout'));

// Preload de recursos críticos
const preloadRoutes = () => {
  const routes = [
    () => import('./components/ProductList'),
    () => import('./components/ProductDetail')
  ];
  
  routes.forEach(route => {
    const componentImport = route();
    // Preload mas não executa
  });
};

// Service Worker para cache
// sw.js
const CACHE_NAME = 'mestres-cafe-v1';
const STATIC_ASSETS = [
  '/',
  '/static/css/main.css',
  '/static/js/main.js',
  '/images/logo.png'
];

// Cache First Strategy para assets estáticos
self.addEventListener('fetch', event => {
  if (isStaticAsset(event.request.url)) {
    event.respondWith(
      caches.match(event.request)
        .then(response => response || fetch(event.request))
    );
  }
});

// Network First Strategy para API calls
self.addEventListener('fetch', event => {
  if (isAPICall(event.request.url)) {
    event.respondWith(
      fetch(event.request)
        .catch(() => caches.match(event.request))
    );
  }
});
```

### Backend Optimization

```python
# Flask configuration for performance
class ProductionConfig:
    # Database connection pooling
    SQLALCHEMY_ENGINE_OPTIONS = {
        'pool_size': 20,
        'pool_timeout': 30,
        'pool_recycle': 3600,
        'pool_pre_ping': True,
        'max_overflow': 30
    }
    
    # Cache configuration
    CACHE_TYPE = 'redis'
    CACHE_REDIS_URL = 'redis://redis:6379/0'
    CACHE_DEFAULT_TIMEOUT = 300
    
    # Session configuration
    SESSION_TYPE = 'redis'
    SESSION_REDIS = redis.from_url('redis://redis:6379/1')
    SESSION_PERMANENT = False
    SESSION_USE_SIGNER = True
    
    # JSON configuration
    JSON_SORT_KEYS = False
    JSONIFY_PRETTYPRINT_REGULAR = False

# Caching decorators
from functools import wraps
from flask import request
import hashlib

def cache_key(*args, **kwargs):
    """Generate cache key from request parameters"""
    key_data = {
        'url': request.url,
        'method': request.method,
        'args': args,
        'kwargs': kwargs
    }
    key_string = str(sorted(key_data.items()))
    return hashlib.md5(key_string.encode()).hexdigest()

def cached(timeout=300, key_prefix='view'):
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            cache_key_value = f"{key_prefix}:{cache_key(*args, **kwargs)}"
            cached_result = cache.get(cache_key_value)
            
            if cached_result is not None:
                return cached_result
            
            result = f(*args, **kwargs)
            cache.set(cache_key_value, result, timeout=timeout)
            return result
        return decorated_function
    return decorator

# Database query optimization
class OptimizedQuery:
    @staticmethod
    def get_products_with_cache(page=1, per_page=20, category_id=None):
        cache_key = f"products:page:{page}:per_page:{per_page}:category:{category_id}"
        cached_result = cache.get(cache_key)
        
        if cached_result:
            return cached_result
        
        query = db.session.query(Product).options(
            # Eager loading para evitar N+1 queries
            joinedload(Product.category),
            joinedload(Product.images)
        )
        
        if category_id:
            query = query.filter(Product.category_id == category_id)
        
        query = query.filter(Product.is_active == True)
        
        # Usar offset/limit otimizado
        products = query.offset((page - 1) * per_page).limit(per_page).all()
        
        # Cache por 5 minutos
        cache.set(cache_key, products, timeout=300)
        return products

# Connection pooling para Redis
import redis.connection
redis_pool = redis.ConnectionPool(
    host='redis',
    port=6379,
    db=0,
    max_connections=20,
    retry_on_timeout=True
)
redis_client = redis.Redis(connection_pool=redis_pool)

# Background tasks com Celery otimizado
from celery import Celery

celery = Celery('mestres_cafe')
celery.conf.update(
    # Otimizações de performance
    task_serializer='json',
    accept_content=['json'],
    result_serializer='json',
    timezone='America/Sao_Paulo',
    enable_utc=True,
    
    # Worker optimizations
    worker_prefetch_multiplier=4,
    task_acks_late=True,
    worker_disable_rate_limits=True,
    
    # Result backend optimization
    result_expires=3600,
    result_backend_transport_options={
        'master_name': 'mymaster'
    }
)

@celery.task(bind=True, max_retries=3)
def process_order_async(self, order_id):
    try:
        # Processamento otimizado do pedido
        with db.session.begin():
            order = Order.query.get(order_id)
            # ... lógica de processamento
            db.session.commit()
    except Exception as exc:
        raise self.retry(exc=exc, countdown=60)
```

### Database Optimization

```sql
-- Configurações PostgreSQL para performance
-- postgresql.conf optimizations

# Memory settings (para servidor com 32GB RAM)
shared_buffers = 8GB                      # 25% da RAM
effective_cache_size = 24GB               # 75% da RAM
work_mem = 256MB                          # Para operações de ordenação
maintenance_work_mem = 2GB                # Para operações de manutenção
wal_buffers = 64MB                        # Buffers para WAL

# Checkpoint settings
checkpoint_completion_target = 0.9
checkpoint_timeout = 15min
max_wal_size = 16GB
min_wal_size = 4GB

# Query planner settings
random_page_cost = 1.1                    # Para SSDs
effective_io_concurrency = 200
max_worker_processes = 16
max_parallel_workers_per_gather = 4
max_parallel_workers = 16

# Connection settings
max_connections = 300
shared_preload_libraries = 'pg_stat_statements,pg_prewarm'

# Logging for performance monitoring
log_min_duration_statement = 200          # Log queries > 200ms
log_checkpoints = on
log_connections = on
log_disconnections = on
log_lock_waits = on

-- Query optimization procedures
CREATE OR REPLACE FUNCTION optimize_table_stats()
RETURNS VOID AS $$
DECLARE
    table_name TEXT;
BEGIN
    -- Atualizar estatísticas das tabelas principais
    FOR table_name IN 
        SELECT tablename FROM pg_tables 
        WHERE schemaname = 'public' 
        AND tablename IN ('products', 'orders', 'users', 'inventory')
    LOOP
        EXECUTE 'ANALYZE ' || table_name;
        RAISE NOTICE 'Analyzed table: %', table_name;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Index monitoring
CREATE VIEW index_usage AS
SELECT 
    schemaname,
    tablename,
    indexname,
    idx_tup_read,
    idx_tup_fetch,
    idx_scan,
    CASE 
        WHEN idx_scan = 0 THEN 'Never used'
        WHEN idx_scan < 10 THEN 'Rarely used'
        ELSE 'Actively used'
    END as usage_status
FROM pg_stat_user_indexes
ORDER BY idx_scan ASC;

-- Query performance monitoring
CREATE VIEW slow_queries_summary AS
SELECT 
    substring(query, 1, 100) as query_snippet,
    calls,
    total_time,
    mean_time,
    stddev_time,
    rows,
    100.0 * shared_blks_hit / nullif(shared_blks_hit + shared_blks_read, 0) AS hit_percent
FROM pg_stat_statements
WHERE calls > 10
ORDER BY mean_time DESC
LIMIT 20;
```

### Nginx Optimization

```nginx
# nginx.conf optimized for performance
worker_processes auto;
worker_rlimit_nofile 65535;

events {
    worker_connections 4096;
    use epoll;
    multi_accept on;
}

http {
    # Basic settings
    sendfile on;
    tcp_nopush on;
    tcp_nodelay on;
    keepalive_timeout 65;
    keepalive_requests 1000;
    types_hash_max_size 2048;
    
    # Buffer settings
    client_body_buffer_size 128k;
    client_max_body_size 50m;
    client_header_buffer_size 1k;
    large_client_header_buffers 4 4k;
    output_buffers 1 32k;
    postpone_output 1460;
    
    # Compression
    gzip on;
    gzip_vary on;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types
        text/plain
        text/css
        text/xml
        text/javascript
        application/javascript
        application/json
        application/xml+rss
        application/atom+xml
        image/svg+xml;
    
    # Caching
    open_file_cache max=10000 inactive=20s;
    open_file_cache_valid 30s;
    open_file_cache_min_uses 2;
    open_file_cache_errors on;
    
    # Rate limiting
    limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
    limit_req_zone $binary_remote_addr zone=login:10m rate=1r/s;
    
    upstream api_backend {
        least_conn;
        server api1:5000 max_fails=3 fail_timeout=30s;
        server api2:5000 max_fails=3 fail_timeout=30s;
        server api3:5000 max_fails=3 fail_timeout=30s;
        keepalive 32;
    }
    
    # API server configuration
    server {
        listen 80;
        server_name api.mestrescafe.com;
        
        # Security headers
        add_header X-Frame-Options DENY;
        add_header X-Content-Type-Options nosniff;
        add_header X-XSS-Protection "1; mode=block";
        
        # API endpoints
        location /api/ {
            limit_req zone=api burst=20 nodelay;
            
            proxy_pass http://api_backend;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            proxy_cache_bypass $http_upgrade;
            
            # Timeouts
            proxy_connect_timeout 5s;
            proxy_send_timeout 60s;
            proxy_read_timeout 60s;
        }
        
        # Login endpoint with stricter rate limiting
        location /api/v1/auth/login {
            limit_req zone=login burst=5 nodelay;
            proxy_pass http://api_backend;
        }
        
        # Static files caching
        location ~* \.(jpg|jpeg|png|gif|ico|css|js|woff|woff2)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
            add_header Vary Accept-Encoding;
        }
    }
    
    # Web server configuration
    server {
        listen 80;
        server_name mestrescafe.com www.mestrescafe.com;
        root /usr/share/nginx/html;
        
        # Compression for web assets
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
            gzip_static on;
        }
        
        # SPA fallback
        location / {
            try_files $uri $uri/ /index.html;
            add_header Cache-Control "no-cache, must-revalidate";
        }
    }
}
```

## 4. Monitoramento de Performance

### Métricas de Sistema

```yaml
system_metrics:
  cpu:
    warning_threshold: 70%
    critical_threshold: 85%
    monitoring_interval: 30s
    
  memory:
    warning_threshold: 80%
    critical_threshold: 90%
    monitoring_interval: 30s
    
  disk:
    warning_threshold: 80%
    critical_threshold: 90%
    monitoring_interval: 60s
    
  network:
    warning_threshold: 80%
    critical_threshold: 90%
    monitoring_interval: 30s

application_metrics:
  response_time:
    p50_threshold: 200ms
    p95_threshold: 500ms
    p99_threshold: 1000ms
    
  error_rate:
    warning_threshold: 1%
    critical_threshold: 5%
    
  throughput:
    min_requests_per_second: 100
    target_requests_per_second: 500
    
  database:
    connection_pool_usage: 80%
    slow_query_threshold: 200ms
    deadlock_threshold: 1
```

### Alertas de Performance

```python
# Performance monitoring with Prometheus
from prometheus_client import Counter, Histogram, Gauge
import time

# Métricas de performance
REQUEST_COUNT = Counter('http_requests_total', 'Total HTTP requests', ['method', 'endpoint', 'status'])
REQUEST_DURATION = Histogram('http_request_duration_seconds', 'HTTP request duration', ['method', 'endpoint'])
ACTIVE_CONNECTIONS = Gauge('database_connections_active', 'Active database connections')
CACHE_HIT_RATE = Gauge('cache_hit_rate', 'Cache hit rate percentage')

def track_performance(func):
    """Decorator para rastrear performance de funções"""
    def wrapper(*args, **kwargs):
        start_time = time.time()
        try:
            result = func(*args, **kwargs)
            status = 'success'
            return result
        except Exception as e:
            status = 'error'
            raise
        finally:
            duration = time.time() - start_time
            REQUEST_DURATION.labels(
                method=request.method,
                endpoint=request.endpoint
            ).observe(duration)
            
            REQUEST_COUNT.labels(
                method=request.method,
                endpoint=request.endpoint,
                status=status
            ).inc()
    return wrapper

# Health check endpoint com métricas
@app.route('/health/performance')
def performance_health():
    metrics = {
        'response_time_p95': get_p95_response_time(),
        'error_rate': get_error_rate(),
        'database_connections': get_db_connection_count(),
        'cache_hit_rate': get_cache_hit_rate(),
        'memory_usage': get_memory_usage(),
        'cpu_usage': get_cpu_usage()
    }
    
    status = 'healthy'
    if metrics['response_time_p95'] > 500:
        status = 'degraded'
    if metrics['error_rate'] > 5:
        status = 'unhealthy'
        
    return jsonify({
        'status': status,
        'metrics': metrics,
        'timestamp': datetime.utcnow().isoformat()
    })

# Circuit breaker para proteção de performance
class CircuitBreaker:
    def __init__(self, failure_threshold=5, reset_timeout=60):
        self.failure_threshold = failure_threshold
        self.reset_timeout = reset_timeout
        self.failure_count = 0
        self.last_failure_time = None
        self.state = 'CLOSED'  # CLOSED, OPEN, HALF_OPEN
    
    def call(self, func, *args, **kwargs):
        if self.state == 'OPEN':
            if time.time() - self.last_failure_time > self.reset_timeout:
                self.state = 'HALF_OPEN'
            else:
                raise Exception("Circuit breaker is OPEN")
        
        try:
            result = func(*args, **kwargs)
            if self.state == 'HALF_OPEN':
                self.state = 'CLOSED'
                self.failure_count = 0
            return result
        except Exception as e:
            self.failure_count += 1
            self.last_failure_time = time.time()
            
            if self.failure_count >= self.failure_threshold:
                self.state = 'OPEN'
            
            raise e
```

### Load Testing Configuration

```yaml
# K6 load testing configuration
load_test_scenarios:
  smoke_test:
    description: "Teste básico de funcionalidade"
    duration: "30s"
    vus: 10
    
  load_test:
    description: "Teste de carga normal"
    duration: "5m"
    stages:
      - duration: "1m", target: 50
      - duration: "3m", target: 100
      - duration: "1m", target: 0
      
  stress_test:
    description: "Teste de stress para encontrar limites"
    duration: "10m"
    stages:
      - duration: "2m", target: 100
      - duration: "5m", target: 200
      - duration: "2m", target: 300
      - duration: "1m", target: 0
      
  spike_test:
    description: "Teste de picos de tráfego"
    duration: "5m"
    stages:
      - duration: "30s", target: 100
      - duration: "1m", target: 100
      - duration: "30s", target: 500
      - duration: "3m", target: 100
      
thresholds:
  http_req_duration:
    - p(95) < 500
    - p(99) < 1000
  http_req_failed:
    - rate < 0.01  # Less than 1% errors
  checks:
    - rate > 0.99  # 99% of checks should pass
```

```javascript
// k6-load-test.js
import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate } from 'k6/metrics';

const errorRate = new Rate('errors');

export let options = {
  stages: [
    { duration: '1m', target: 50 },
    { duration: '3m', target: 100 },
    { duration: '1m', target: 0 }
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'],
    errors: ['rate<0.01']
  }
};

export default function() {
  // Test product listing
  let response = http.get('https://api.mestrescafe.com/api/v1/products');
  check(response, {
    'status is 200': (r) => r.status === 200,
    'response time < 500ms': (r) => r.timings.duration < 500,
    'has products': (r) => JSON.parse(r.body).data.products.length > 0
  }) || errorRate.add(1);
  
  sleep(1);
  
  // Test product detail
  response = http.get('https://api.mestrescafe.com/api/v1/products/1');
  check(response, {
    'status is 200': (r) => r.status === 200,
    'response time < 300ms': (r) => r.timings.duration < 300
  }) || errorRate.add(1);
  
  sleep(1);
  
  // Test search
  response = http.get('https://api.mestrescafe.com/api/v1/products?search=café');
  check(response, {
    'status is 200': (r) => r.status === 200,
    'response time < 800ms': (r) => r.timings.duration < 800
  }) || errorRate.add(1);
  
  sleep(2);
}
```

## 5. Otimização de Cache

### Estratégias de Cache Multi-Layer

```python
# Redis cache configuration
CACHE_CONFIG = {
    'default': {
        'CACHE_TYPE': 'redis',
        'CACHE_REDIS_URL': 'redis://redis:6379/0',
        'CACHE_DEFAULT_TIMEOUT': 300
    },
    'session': {
        'CACHE_TYPE': 'redis', 
        'CACHE_REDIS_URL': 'redis://redis:6379/1',
        'CACHE_DEFAULT_TIMEOUT': 1800
    },
    'long_term': {
        'CACHE_TYPE': 'redis',
        'CACHE_REDIS_URL': 'redis://redis:6379/2', 
        'CACHE_DEFAULT_TIMEOUT': 3600
    }
}

# Cache warming strategies
class CacheWarmer:
    def __init__(self):
        self.cache = current_app.cache
        
    def warm_product_cache(self):
        """Pre-load popular products into cache"""
        popular_products = Product.query.filter(
            Product.is_featured == True
        ).limit(50).all()
        
        for product in popular_products:
            cache_key = f"product:{product.id}"
            self.cache.set(cache_key, product, timeout=3600)
            
    def warm_category_cache(self):
        """Pre-load categories into cache"""
        categories = Category.query.filter(
            Category.is_active == True
        ).all()
        
        self.cache.set('categories:all', categories, timeout=7200)
        
    def warm_search_cache(self):
        """Pre-load common search results"""
        common_searches = ['café', 'premium', 'especial', 'arábica']
        
        for term in common_searches:
            results = search_products(term, limit=20)
            cache_key = f"search:{term}"
            self.cache.set(cache_key, results, timeout=1800)

# Cache invalidation strategies
class CacheInvalidator:
    @staticmethod
    def invalidate_product_cache(product_id):
        """Invalidate all caches related to a product"""
        cache_keys = [
            f"product:{product_id}",
            f"product:full:{product_id}",
            "products:featured",
            "products:new",
            f"category:{Product.query.get(product_id).category_id}"
        ]
        
        for key in cache_keys:
            cache.delete(key)
            
    @staticmethod
    def invalidate_order_cache(user_id):
        """Invalidate order-related caches"""
        cache_keys = [
            f"orders:user:{user_id}",
            f"cart:user:{user_id}",
            "orders:stats"
        ]
        
        for key in cache_keys:
            cache.delete(key)

# Adaptive caching based on usage patterns
class AdaptiveCache:
    def __init__(self):
        self.hit_counts = defaultdict(int)
        self.access_times = defaultdict(list)
        
    def get_ttl_for_key(self, key):
        """Determine TTL based on access patterns"""
        hits = self.hit_counts[key]
        recent_accesses = len([
            t for t in self.access_times[key] 
            if time.time() - t < 3600
        ])
        
        if recent_accesses > 100:  # Very popular
            return 3600  # 1 hour
        elif recent_accesses > 50:  # Popular
            return 1800  # 30 minutes
        elif recent_accesses > 10:  # Moderate
            return 600   # 10 minutes
        else:  # Low usage
            return 300   # 5 minutes
            
    def get(self, key):
        self.hit_counts[key] += 1
        self.access_times[key].append(time.time())
        return cache.get(key)
        
    def set(self, key, value):
        ttl = self.get_ttl_for_key(key)
        return cache.set(key, value, timeout=ttl)
```

## 6. Monitoramento Contínuo

### Dashboards de Performance

```json
{
  "grafana_dashboard": {
    "title": "Mestres Café - Performance Overview",
    "panels": [
      {
        "title": "Response Time Distribution",
        "type": "heatmap",
        "targets": [
          "histogram_quantile(0.50, rate(http_request_duration_seconds_bucket[5m]))",
          "histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m]))",
          "histogram_quantile(0.99, rate(http_request_duration_seconds_bucket[5m]))"
        ]
      },
      {
        "title": "Request Rate",
        "type": "graph",
        "targets": [
          "rate(http_requests_total[1m])"
        ]
      },
      {
        "title": "Error Rate",
        "type": "stat",
        "targets": [
          "rate(http_requests_total{status=~\"5..\"}[5m]) / rate(http_requests_total[5m]) * 100"
        ]
      },
      {
        "title": "Database Performance",
        "type": "graph", 
        "targets": [
          "avg(database_query_duration_seconds)",
          "rate(database_connections_active)"
        ]
      },
      {
        "title": "Cache Hit Rate",
        "type": "gauge",
        "targets": [
          "cache_hit_rate * 100"
        ]
      }
    ]
  }
}
```

### Alertas Automatizados

```yaml
# Prometheus alerting rules
alerts:
  - alert: HighResponseTime
    expr: histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m])) > 0.5
    for: 2m
    labels:
      severity: warning
    annotations:
      summary: "High response time detected"
      description: "95th percentile response time is {{ $value }}s"
      
  - alert: HighErrorRate
    expr: rate(http_requests_total{status=~"5.."}[5m]) / rate(http_requests_total[5m]) > 0.01
    for: 1m
    labels:
      severity: critical
    annotations:
      summary: "High error rate detected"
      description: "Error rate is {{ $value | humanizePercentage }}"
      
  - alert: DatabaseConnectionsHigh
    expr: database_connections_active / database_connections_max > 0.8
    for: 5m
    labels:
      severity: warning
    annotations:
      summary: "Database connections running high"
      description: "Database connections are at {{ $value | humanizePercentage }} capacity"
      
  - alert: CacheHitRateLow
    expr: cache_hit_rate < 0.8
    for: 10m
    labels:
      severity: warning
    annotations:
      summary: "Cache hit rate is low"
      description: "Cache hit rate is {{ $value | humanizePercentage }}"
```

## Conclusão

Esta documentação de especificações de performance fornece um framework completo para garantir que o sistema Mestres Café Enterprise atenda aos mais altos padrões de performance, incluindo:

- **SLAs claros** com targets mensuráveis de performance
- **Benchmarks detalhados** para diferentes componentes do sistema  
- **Configurações otimizadas** para frontend, backend e infraestrutura
- **Estratégias de cache** multi-layer e adaptativo
- **Monitoramento contínuo** com métricas e alertas automatizados
- **Testes de carga** para validação de performance

Essas especificações garantem que o sistema seja capaz de lidar com alta carga mantendo excelente experiência do usuário e confiabilidade operacional.