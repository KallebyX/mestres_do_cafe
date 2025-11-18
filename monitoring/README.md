# Monitoring Stack - Mestres do Café

Monitoramento completo com **Prometheus** + **Grafana** + **Alertmanager**

## Estrutura

```
monitoring/
├── prometheus.yml                    # Configuração do Prometheus
├── prometheus/
│   └── alerts.yml                   # Regras de alerta
├── grafana/
│   ├── datasources/
│   │   └── prometheus.yml          # Datasource Prometheus
│   ├── provisioning/
│   │   └── dashboards.yml          # Provisionamento de dashboards
│   └── dashboards/
│       ├── api-metrics.json        # Dashboard de métricas da API
│       ├── system-metrics.json     # Dashboard de métricas do sistema
│       └── business-metrics.json   # Dashboard de métricas de negócio
├── docker-compose.monitoring.yml    # Compose para stack de monitoring
└── README.md                        # Esta documentação
```

## Serviços

### Prometheus
- **Porta**: 9090
- **Função**: Coleta e armazena métricas
- **Scrape interval**: 15s
- **Retention**: 15 dias

### Grafana
- **Porta**: 3001
- **Função**: Visualização de dashboards
- **Usuário padrão**: admin / admin (mudar na primeira vez)
- **Datasource**: Prometheus (auto-configurado)

### Exporters

| Exporter | Porta | Função |
|----------|-------|--------|
| Node Exporter | 9100 | Métricas do sistema (CPU, RAM, Disk) |
| Postgres Exporter | 9187 | Métricas do PostgreSQL |
| Redis Exporter | 9121 | Métricas do Redis |
| Nginx Exporter | 9113 | Métricas do Nginx |
| cAdvisor | 8080 | Métricas dos containers Docker |
| Blackbox Exporter | 9115 | Health checks externos |

## Quick Start

### 1. Iniciar Stack de Monitoring

```bash
# Iniciar todos os serviços
docker-compose -f docker-compose.monitoring.yml up -d

# Ver logs
docker-compose -f docker-compose.monitoring.yml logs -f

# Status dos serviços
docker-compose -f docker-compose.monitoring.yml ps
```

### 2. Acessar Interfaces

- **Grafana**: http://localhost:3001
  - Login: admin / admin
  - Dashboards pré-configurados estarão disponíveis

- **Prometheus**: http://localhost:9090
  - Query metrics directly
  - Ver targets e alertas

- **Alertmanager**: http://localhost:9093
  - Configurar notificações
  - Ver alertas ativos

### 3. Verificar Targets

Acesse http://localhost:9090/targets para verificar se todos os exporters estão UP.

## Dashboards Disponíveis

### 1. API Metrics Dashboard
**Métricas da aplicação Flask**

- Taxa de requisições (RPS)
- Latência (P50, P95, P99)
- Taxa de erros (4xx, 5xx)
- Requisições por endpoint
- Throughput
- Uso de memória da API
- Conexões com banco de dados

### 2. System Metrics Dashboard
**Métricas do sistema operacional**

- CPU usage
- Memory usage
- Disk I/O
- Network I/O
- File descriptors
- Load average

### 3. Database Metrics Dashboard
**Métricas do PostgreSQL**

- Conexões ativas
- Queries por segundo
- Cache hit rate
- Tamanho do banco
- Slow queries
- Locks e deadlocks

### 4. Business Metrics Dashboard
**Métricas de negócio**

- Checkouts completados
- Vendas por hora/dia
- Taxa de conversão
- Produtos mais vendidos
- Usuários ativos
- Taxa de abandono de carrinho

## Métricas Customizadas

### Adicionar Métrica na API

```python
from prometheus_client import Counter, Histogram, Gauge

# Counter: valor que sempre aumenta
checkout_counter = Counter(
    'checkout_completed_total',
    'Total de checkouts completados',
    ['status']
)

# Histogram: medir distribuição de valores
request_duration = Histogram(
    'http_request_duration_seconds',
    'Duração das requisições HTTP',
    ['method', 'endpoint', 'status']
)

# Gauge: valor que pode subir ou descer
active_users = Gauge(
    'active_users_count',
    'Número de usuários ativos'
)

# Usar as métricas
@app.route('/checkout', methods=['POST'])
def checkout():
    with request_duration.time():
        # Seu código aqui
        result = process_checkout()
        checkout_counter.labels(status='success').inc()
        return result
```

### Expor Endpoint de Métricas

```python
from prometheus_flask_exporter import PrometheusMetrics

app = Flask(__name__)
metrics = PrometheusMetrics(app)

# Métricas estarão disponíveis em /metrics
```

## Alertas

### Alertas Configurados

| Alerta | Condição | Severidade | Time |
|--------|----------|------------|------|
| APIDown | API offline | Critical | 1min |
| HighErrorRate | Taxa de erro > 5% | Warning | 5min |
| HighLatency | P95 > 2s | Warning | 5min |
| DatabaseDown | PostgreSQL offline | Critical | 1min |
| RedisDown | Redis offline | Critical | 1min |
| HighCPU | CPU > 80% | Warning | 10min |
| HighMemory | Memory > 90% | Critical | 10min |
| DiskFull | Disk < 10% free | Critical | 10min |
| HighPaymentFailureRate | Failures > 20% | Critical | 10min |

### Configurar Notificações

Edite `alertmanager.yml` para configurar Slack, email, PagerDuty, etc:

```yaml
receivers:
  - name: 'slack'
    slack_configs:
      - api_url: 'https://hooks.slack.com/services/YOUR/WEBHOOK/URL'
        channel: '#alerts'
        title: 'Alert: {{ .GroupLabels.alertname }}'
        text: '{{ .CommonAnnotations.description }}'

  - name: 'email'
    email_configs:
      - to: 'ops@mestres-do-cafe.com'
        from: 'alertmanager@mestres-do-cafe.com'
        smarthost: 'smtp.gmail.com:587'
        auth_username: 'your-email@gmail.com'
        auth_password: 'your-app-password'

route:
  receiver: 'slack'
  group_by: ['alertname', 'severity']
  group_wait: 30s
  group_interval: 5m
  repeat_interval: 4h
  routes:
    - match:
        severity: critical
      receiver: 'slack'
      continue: true
    - match:
        severity: critical
      receiver: 'email'
```

## Queries Úteis

### Prometheus Queries

#### Performance da API
```promql
# Taxa de requisições por segundo
rate(http_requests_total[5m])

# Latência P95
histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m]))

# Taxa de erro
rate(http_requests_total{status=~"5.."}[5m]) / rate(http_requests_total[5m])

# Top 5 endpoints mais lentos
topk(5, avg by (endpoint) (http_request_duration_seconds))
```

#### Sistema
```promql
# Uso de CPU
100 - (avg by (instance) (irate(node_cpu_seconds_total{mode="idle"}[5m])) * 100)

# Uso de memória
(node_memory_MemTotal_bytes - node_memory_MemAvailable_bytes) / node_memory_MemTotal_bytes * 100

# Espaço em disco livre
node_filesystem_avail_bytes / node_filesystem_size_bytes * 100

# Network throughput
rate(node_network_receive_bytes_total[5m]) + rate(node_network_transmit_bytes_total[5m])
```

#### Database
```promql
# Conexões ativas
pg_stat_activity_count

# Cache hit rate
pg_stat_database_blks_hit / (pg_stat_database_blks_read + pg_stat_database_blks_hit)

# Queries por segundo
rate(pg_stat_database_xact_commit[5m])

# Tamanho do banco
pg_database_size_bytes / 1024 / 1024 / 1024  # Em GB
```

## Troubleshooting

### Prometheus não está coletando métricas

```bash
# Verificar targets
curl http://localhost:9090/api/v1/targets

# Verificar logs
docker logs monitoring_prometheus_1

# Testar manualmente
curl http://api:5001/metrics
```

### Grafana não mostra dados

```bash
# Verificar datasource
curl http://localhost:3001/api/datasources

# Verificar query no Prometheus
curl 'http://localhost:9090/api/v1/query?query=up'

# Logs do Grafana
docker logs monitoring_grafana_1
```

### Alertas não estão disparando

```bash
# Verificar regras de alerta
curl http://localhost:9090/api/v1/rules

# Ver alertas ativos
curl http://localhost:9090/api/v1/alerts

# Logs do Alertmanager
docker logs monitoring_alertmanager_1
```

### Exporter está DOWN

```bash
# Verificar se o serviço está rodando
docker ps | grep exporter

# Testar endpoint do exporter
curl http://node-exporter:9100/metrics
curl http://postgres-exporter:9187/metrics
curl http://redis-exporter:9121/metrics

# Ver logs
docker logs <exporter-container>
```

## Otimizações

### Reduzir Uso de Memória do Prometheus

Edite `prometheus.yml`:
```yaml
storage:
  tsdb:
    retention.time: 7d  # Reduzir de 15d para 7d
    retention.size: 5GB  # Limitar tamanho
```

### Aumentar Performance das Queries

```yaml
global:
  scrape_interval: 30s  # Aumentar de 15s para 30s
  evaluation_interval: 30s
```

### Reduzir Cardinality

Evite labels com muitos valores únicos:
```python
# ❌ Ruim - alta cardinality
request_counter.labels(user_id=user.id).inc()

# ✅ Bom - baixa cardinality
request_counter.labels(user_type=user.type).inc()
```

## Backup e Restore

### Backup do Prometheus
```bash
# Snapshot
curl -XPOST http://localhost:9090/api/v1/admin/tsdb/snapshot

# Backup do diretório
docker cp monitoring_prometheus_1:/prometheus ./prometheus-backup
```

### Backup do Grafana
```bash
# Dashboards
docker exec monitoring_grafana_1 grafana-cli admin export

# Database completo
docker cp monitoring_grafana_1:/var/lib/grafana ./grafana-backup
```

## Escalabilidade

### Prometheus Clustering (Thanos)

Para ambientes de alta escala, use Thanos:
- Long-term storage
- Query across múltiplos Prometheus
- Compactação e downsampling

### Grafana Cloud

Alternativa gerenciada:
- Sem manutenção de infraestrutura
- Escalabilidade automática
- SLA garantido

## Segurança

### Autenticação no Prometheus

Adicione autenticação básica:
```yaml
# prometheus.yml
global:
  ...

basic_auth_users:
  admin: $2a$10$...  # Password hash (bcrypt)
```

### HTTPS no Grafana

Configure SSL:
```ini
# grafana.ini
[server]
protocol = https
cert_file = /etc/grafana/ssl/cert.pem
cert_key = /etc/grafana/ssl/key.pem
```

### Firewall Rules

Restrinja acesso aos exporters:
```bash
# Apenas Prometheus pode acessar exporters
iptables -A INPUT -p tcp --dport 9100 -s <prometheus-ip> -j ACCEPT
iptables -A INPUT -p tcp --dport 9100 -j DROP
```

## Recursos

- [Prometheus Documentation](https://prometheus.io/docs/)
- [Grafana Documentation](https://grafana.com/docs/)
- [PromQL Tutorial](https://prometheus.io/docs/prometheus/latest/querying/basics/)
- [Grafana Dashboards](https://grafana.com/grafana/dashboards/)
- [Exporters List](https://prometheus.io/docs/instrumenting/exporters/)
