# Configuração do Alertmanager com Slack

Guia completo para configurar alertas do Prometheus com notificações no Slack.

## 📋 Índice

- [Pré-requisitos](#pré-requisitos)
- [Criar Webhook do Slack](#criar-webhook-do-slack)
- [Configurar Alertmanager](#configurar-alertmanager)
- [Testar Alertas](#testar-alertas)
- [Personalizar Notificações](#personalizar-notificações)
- [Troubleshooting](#troubleshooting)

---

## 🔧 Pré-requisitos

Antes de começar, certifique-se de que você tem:

- [ ] Workspace do Slack com permissões de administrador
- [ ] Prometheus rodando e coletando métricas
- [ ] Alertmanager instalado (via Docker Compose)
- [ ] Regras de alerta configuradas (`monitoring/prometheus/alerts.yml`)

---

## 1. Criar Webhook do Slack

### Passo 1.1: Instalar App de Incoming Webhooks

1. Acesse: https://api.slack.com/messaging/webhooks
2. Clique em **"Create your Slack app"**
3. Escolha **"From scratch"**
4. Nome do app: `Mestres do Café - Alerts`
5. Selecione seu workspace
6. Clique em **"Create App"**

### Passo 1.2: Ativar Incoming Webhooks

1. No menu lateral, vá em **"Incoming Webhooks"**
2. Ative o toggle **"Activate Incoming Webhooks"**
3. Clique em **"Add New Webhook to Workspace"**
4. Selecione o canal (ex: `#alerts-critical`)
5. Clique em **"Allow"**

### Passo 1.3: Copiar Webhook URL

Você verá uma URL no formato:
```
https://hooks.slack.com/services/T00000000/B00000000/XXXXXXXXXXXXXXXXXXXX
```

**⚠️ IMPORTANTE**: Guarde esta URL em local seguro. Ela será usada na configuração do Alertmanager.

### Passo 1.4: Criar Canais para Diferentes Severidades

Recomendamos criar canais separados para diferentes níveis de alerta:

```
#alerts-critical    → Alertas críticos (API down, banco down, etc.)
#alerts-warning     → Avisos não críticos (memória alta, disco, etc.)
#alerts-info        → Informações gerais (deploys, backups, etc.)
#monitoring         → Status geral do monitoramento
```

Crie um webhook para cada canal e anote as URLs.

---

## 2. Configurar Alertmanager

### Passo 2.1: Criar Arquivo de Configuração

Crie o arquivo `monitoring/alertmanager/alertmanager.yml`:

```yaml
# Configuração Global
global:
  resolve_timeout: 5m
  slack_api_url: 'https://hooks.slack.com/services/YOUR_WEBHOOK_HERE'

# Templates personalizados
templates:
  - '/etc/alertmanager/templates/*.tmpl'

# Rotas de notificação
route:
  # Agrupamento de alertas
  group_by: ['alertname', 'cluster', 'service']
  group_wait: 10s
  group_interval: 10s
  repeat_interval: 12h

  # Receptor padrão
  receiver: 'slack-default'

  # Rotas específicas por severidade
  routes:
    # Alertas críticos
    - match:
        severity: critical
      receiver: 'slack-critical'
      continue: false

    # Alertas de warning
    - match:
        severity: warning
      receiver: 'slack-warning'
      continue: false

    # Alertas de negócio
    - match:
        team: product
      receiver: 'slack-business'
      continue: false

# Receivers (destinos das notificações)
receivers:
  # Slack - Alertas Críticos
  - name: 'slack-critical'
    slack_configs:
      - channel: '#alerts-critical'
        api_url: 'https://hooks.slack.com/services/YOUR_CRITICAL_WEBHOOK'
        send_resolved: true
        icon_emoji: ':fire:'
        title: '{{ .GroupLabels.alertname }}'
        text: >-
          {{ range .Alerts }}
            *Alert:* {{ .Labels.alertname }} - {{ .Labels.severity }}
            *Summary:* {{ .Annotations.summary }}
            *Description:* {{ .Annotations.description }}
            *Instance:* {{ .Labels.instance }}
            {{ end }}

  # Slack - Warnings
  - name: 'slack-warning'
    slack_configs:
      - channel: '#alerts-warning'
        api_url: 'https://hooks.slack.com/services/YOUR_WARNING_WEBHOOK'
        send_resolved: true
        icon_emoji: ':warning:'
        title: '⚠️ {{ .GroupLabels.alertname }}'
        text: '{{ range .Alerts }}{{ .Annotations.description }}{{ end }}'

  # Slack - Business Alerts
  - name: 'slack-business'
    slack_configs:
      - channel: '#alerts-business'
        api_url: 'https://hooks.slack.com/services/YOUR_BUSINESS_WEBHOOK'
        send_resolved: true
        icon_emoji: ':chart_with_upwards_trend:'
        title: '📊 {{ .GroupLabels.alertname }}'

  # Slack - Default
  - name: 'slack-default'
    slack_configs:
      - channel: '#monitoring'
        api_url: 'https://hooks.slack.com/services/YOUR_DEFAULT_WEBHOOK'
        send_resolved: true

# Inibição de alertas (evitar duplicatas)
inhibit_rules:
  # Se API está down, não enviar alertas de alta latência
  - source_match:
      severity: 'critical'
      alertname: 'APIDown'
    target_match:
      severity: 'warning'
      alertname: 'HighLatency'
    equal: ['instance']

  # Se banco está down, não enviar alertas de conexões
  - source_match:
      severity: 'critical'
      alertname: 'DatabaseDown'
    target_match:
      severity: 'warning'
      alertname: 'HighDatabaseConnections'
    equal: ['instance']
```

### Passo 2.2: Criar Templates Personalizados

Crie `monitoring/alertmanager/templates/slack.tmpl`:

```tmpl
{{ define "slack.mestres.title" }}
[{{ .Status | toUpper }}{{ if eq .Status "firing" }}:{{ .Alerts.Firing | len }}{{ end }}] {{ .GroupLabels.SortedPairs.Values | join " " }}
{{ end }}

{{ define "slack.mestres.text" }}
{{ range .Alerts }}
*Alert:* {{ .Labels.alertname }}
*Severity:* {{ .Labels.severity }}
*Summary:* {{ .Annotations.summary }}
*Description:* {{ .Annotations.description }}
{{ if .Labels.instance }}*Instance:* `{{ .Labels.instance }}`{{ end }}
{{ if .Labels.job }}*Job:* `{{ .Labels.job }}`{{ end }}
*Started:* {{ .StartsAt.Format "2006-01-02 15:04:05 MST" }}
{{ if ne .Status "firing" }}*Resolved:* {{ .EndsAt.Format "2006-01-02 15:04:05 MST" }}{{ end }}
{{ end }}
{{ end }}

{{ define "slack.mestres.color" }}
{{ if eq .Status "firing" }}
  {{ if eq .CommonLabels.severity "critical" }}danger{{ else if eq .CommonLabels.severity "warning" }}warning{{ else }}#439FE0{{ end }}
{{ else }}good{{ end }}
{{ end }}
```

### Passo 2.3: Atualizar docker-compose.monitoring.yml

Adicione o serviço do Alertmanager:

```yaml
  alertmanager:
    image: prom/alertmanager:v0.26.0
    container_name: mestres-alertmanager
    restart: unless-stopped
    ports:
      - "9093:9093"
    volumes:
      - ./monitoring/alertmanager/alertmanager.yml:/etc/alertmanager/alertmanager.yml:ro
      - ./monitoring/alertmanager/templates:/etc/alertmanager/templates:ro
      - alertmanager-data:/alertmanager
    command:
      - '--config.file=/etc/alertmanager/alertmanager.yml'
      - '--storage.path=/alertmanager'
      - '--web.external-url=http://localhost:9093'
    networks:
      - monitoring

volumes:
  alertmanager-data:
```

### Passo 2.4: Configurar Prometheus para Usar Alertmanager

Edite `monitoring/prometheus.yml` e adicione:

```yaml
# Alertmanager configuration
alerting:
  alertmanagers:
    - static_configs:
        - targets:
            - alertmanager:9093

# Carregar regras de alerta
rule_files:
  - "/etc/prometheus/alerts.yml"
```

---

## 3. Testar Alertas

### Passo 3.1: Iniciar Serviços

```bash
# Iniciar Prometheus e Alertmanager
docker-compose -f docker-compose.monitoring.yml up -d

# Verificar logs
docker-compose -f docker-compose.monitoring.yml logs -f alertmanager
```

### Passo 3.2: Verificar Configuração do Alertmanager

Acesse: http://localhost:9093

Você deve ver a interface do Alertmanager com status verde.

### Passo 3.3: Enviar Alerta de Teste

Crie um script de teste `test-alert.sh`:

```bash
#!/bin/bash

ALERTMANAGER_URL="http://localhost:9093/api/v1/alerts"

# Alerta de teste
curl -X POST "$ALERTMANAGER_URL" -H "Content-Type: application/json" -d '[
  {
    "labels": {
      "alertname": "TestAlert",
      "severity": "warning",
      "instance": "test-instance",
      "job": "test-job"
    },
    "annotations": {
      "summary": "Este é um alerta de teste",
      "description": "Teste de integração Alertmanager + Slack"
    },
    "startsAt": "'$(date -u +%Y-%m-%dT%H:%M:%SZ)'",
    "endsAt": "'$(date -u -d '+5 minutes' +%Y-%m-%dT%H:%M:%SZ)'"
  }
]'

echo "Alerta de teste enviado! Verifique o Slack."
```

Execute:
```bash
chmod +x test-alert.sh
./test-alert.sh
```

Você deve receber uma notificação no Slack em alguns segundos.

### Passo 3.4: Simular Alerta Real

Para testar com um alerta real, pare a API temporariamente:

```bash
# Parar API
docker-compose stop api

# Aguardar 1-2 minutos
# Verificar Prometheus: http://localhost:9090/alerts
# Verificar Slack para notificação de "APIDown"

# Reiniciar API
docker-compose start api
```

---

## 4. Personalizar Notificações

### Formato Avançado com Attachments

Configure notificações mais ricas com attachments:

```yaml
receivers:
  - name: 'slack-critical'
    slack_configs:
      - channel: '#alerts-critical'
        api_url: 'YOUR_WEBHOOK_URL'
        send_resolved: true
        username: 'Alertmanager'
        icon_emoji: ':fire:'

        # Título
        title: '{{ template "slack.mestres.title" . }}'
        title_link: 'http://grafana.mestres-do-cafe.com/d/alerting'

        # Texto
        text: '{{ template "slack.mestres.text" . }}'

        # Cor baseada em severidade
        color: '{{ template "slack.mestres.color" . }}'

        # Campos adicionais
        fields:
          - title: 'Priority'
            value: '{{ .CommonLabels.severity }}'
            short: true
          - title: 'Status'
            value: '{{ .Status }}'
            short: true

        # Actions (botões)
        actions:
          - type: button
            text: 'View in Grafana :grafana:'
            url: 'http://grafana.mestres-do-cafe.com'
          - type: button
            text: 'View in Prometheus :prometheus:'
            url: 'http://prometheus.mestres-do-cafe.com'
          - type: button
            text: 'Runbook :book:'
            url: 'https://docs.mestres-do-cafe.com/runbooks'
```

### Notificações para Diferentes Equipes

```yaml
route:
  routes:
    # Equipe de Backend
    - match:
        team: backend
      receiver: 'team-backend'

    # Equipe de Infra
    - match:
        team: infra
      receiver: 'team-infra'

    # Equipe de Produto
    - match:
        team: product
      receiver: 'team-product'

receivers:
  - name: 'team-backend'
    slack_configs:
      - channel: '#team-backend'
        api_url: 'YOUR_BACKEND_WEBHOOK'

  - name: 'team-infra'
    slack_configs:
      - channel: '#team-infra'
        api_url: 'YOUR_INFRA_WEBHOOK'

  - name: 'team-product'
    slack_configs:
      - channel: '#team-product'
        api_url: 'YOUR_PRODUCT_WEBHOOK'
```

### Silenciar Alertas Temporariamente

Via Web UI:
```
http://localhost:9093/#/silences
```

Via CLI:
```bash
# Silenciar alerta por 4 horas
amtool silence add alertname=HighMemory \
  --alertmanager.url=http://localhost:9093 \
  --author="DevOps Team" \
  --comment="Manutenção programada" \
  --duration=4h

# Listar silences ativos
amtool silence query --alertmanager.url=http://localhost:9093

# Remover silence
amtool silence expire <SILENCE_ID> --alertmanager.url=http://localhost:9093
```

---

## 5. Configuração de Email (Alternativa/Complementar)

Além do Slack, você pode configurar notificações por email:

```yaml
global:
  smtp_smarthost: 'smtp.gmail.com:587'
  smtp_from: 'alerts@mestres-do-cafe.com'
  smtp_auth_username: 'alerts@mestres-do-cafe.com'
  smtp_auth_password: 'YOUR_APP_PASSWORD'
  smtp_require_tls: true

receivers:
  - name: 'email-critical'
    email_configs:
      - to: 'devops@mestres-do-cafe.com'
        send_resolved: true
        headers:
          Subject: '[CRITICAL] {{ .GroupLabels.alertname }}'
        html: |
          <h2>Alert: {{ .GroupLabels.alertname }}</h2>
          {{ range .Alerts }}
          <p><strong>Summary:</strong> {{ .Annotations.summary }}</p>
          <p><strong>Description:</strong> {{ .Annotations.description }}</p>
          <p><strong>Instance:</strong> {{ .Labels.instance }}</p>
          <p><strong>Started:</strong> {{ .StartsAt }}</p>
          {{ end }}
```

**Para Gmail**: Use App Password (não a senha normal)
1. Acesse: https://myaccount.google.com/apppasswords
2. Gere uma senha de app
3. Use essa senha no `smtp_auth_password`

---

## 6. Monitoramento dos Alertas

### Dashboard no Grafana

Importe o dashboard oficial do Alertmanager:

1. Acesse Grafana: http://localhost:3001
2. Vá em **Dashboards** → **Import**
3. ID: `9578` (Alertmanager Overview)
4. Clique em **Load** → **Import**

### Métricas Importantes

- `alertmanager_alerts_received_total` - Total de alertas recebidos
- `alertmanager_alerts_invalid_total` - Alertas inválidos
- `alertmanager_notifications_total` - Notificações enviadas
- `alertmanager_notifications_failed_total` - Notificações falhadas

---

## 7. Troubleshooting

### Alertas não chegam no Slack

**Verificar webhook:**
```bash
curl -X POST YOUR_WEBHOOK_URL \
  -H 'Content-Type: application/json' \
  -d '{"text":"Test message"}'
```

**Verificar logs do Alertmanager:**
```bash
docker-compose logs alertmanager | grep -i error
```

**Verificar configuração:**
```bash
# Validar arquivo de configuração
docker-compose exec alertmanager amtool check-config /etc/alertmanager/alertmanager.yml
```

### Alertas duplicados

Configure `group_interval` e `repeat_interval` maiores:

```yaml
route:
  group_wait: 30s
  group_interval: 5m
  repeat_interval: 4h
```

### Alertas não resolvem

Certifique-se de que `send_resolved: true` está configurado:

```yaml
slack_configs:
  - send_resolved: true
```

### Prometheus não consegue conectar ao Alertmanager

Verificar rede Docker:

```bash
# Verificar se estão na mesma rede
docker network inspect monitoring

# Testar conectividade
docker-compose exec prometheus wget -O- http://alertmanager:9093/-/healthy
```

---

## 8. Runbooks e Procedimentos

Crie runbooks para cada tipo de alerta em `docs/runbooks/`:

### Exemplo: APIDown.md

```markdown
# Runbook: API Down

## Severidade
CRITICAL

## Descrição
A API principal está offline e não responde a health checks.

## Impacto
- Usuários não conseguem acessar a aplicação
- Vendas interrompidas
- Perda de receita

## Procedimentos

### 1. Verificação Inicial
- Verificar status dos containers: `docker-compose ps`
- Verificar logs: `docker-compose logs --tail=100 api`

### 2. Tentativa de Restart
```bash
docker-compose restart api
```

### 3. Se restart não funcionar
```bash
# Verificar recursos
df -h  # Disco
free -h  # Memória
top  # CPU

# Rebuild se necessário
docker-compose up -d --build api
```

### 4. Rollback se necessário
```bash
./scripts/deploy-production.sh  # Tem rollback automático
```

### 5. Escalação
Se não resolver em 10 minutos, acionar:
- Tech Lead: +55 11 99999-9999
- On-call: via PagerDuty
```

---

## 9. Checklist de Configuração

Use esta checklist para garantir que tudo está configurado:

- [ ] Webhooks do Slack criados para cada canal
- [ ] `alertmanager.yml` configurado com webhooks corretos
- [ ] Templates personalizados criados
- [ ] Alertmanager adicionado ao `docker-compose.monitoring.yml`
- [ ] Prometheus configurado para enviar alertas ao Alertmanager
- [ ] Serviços iniciados: `docker-compose up -d`
- [ ] Alerta de teste enviado e recebido no Slack
- [ ] Alerta real testado (simular downtime)
- [ ] Dashboard do Alertmanager importado no Grafana
- [ ] Runbooks criados para alertas críticos
- [ ] Equipe treinada nos procedimentos de resposta
- [ ] On-call rotation configurada (se aplicável)

---

## 10. Recursos Adicionais

- [Alertmanager Documentation](https://prometheus.io/docs/alerting/latest/alertmanager/)
- [Slack Incoming Webhooks](https://api.slack.com/messaging/webhooks)
- [Template Examples](https://prometheus.io/docs/alerting/latest/notification_examples/)
- [Best Practices](https://prometheus.io/docs/practices/alerting/)

---

**Última atualização**: 2025-01-18
**Versão**: 1.0.0
